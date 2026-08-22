#!/usr/bin/env python3
"""
update_dives.py
----------------
Reads your dive log from an Excel file and writes it into data.json, so
the Dives page on your site stays in sync with your spreadsheet.

USAGE
    1. In Google Sheets: File -> Download -> Microsoft Excel (.xlsx)
    2. python3 update_dives.py path/to/your-dive-log.xlsx

REQUIREMENTS
    This needs the "openpyxl" package to read .xlsx files:
        pip install openpyxl
    (If that errors with something about an "externally managed
    environment", try: pip install --user openpyxl)

EXPECTED COLUMNS
    This is tuned to match a dive log with columns like:
        Date, Where (e.g. "Blue Hole (Egypt)"), With who, Time total,
        Average depth in meters, Weights, Cilinder, Air/Nitrox,
        Weather, Wind, Air temp, Water temp
    ...but matches column headers loosely (by keyword, not exact
    wording), so small differences in phrasing are fine. It handles:
      - Dates as DD/MM/YYYY text or real Excel date cells
      - Decimal commas (e.g. "6,3") as well as decimal points
      - A "Where" column combining site + country, e.g. "Blue Hole
        (Egypt)" -> site "Blue Hole", location "Egypt"
      - Durations written as "H:MM" (e.g. "0:45") as well as plain
        minute numbers
      - "/" used as a blank/placeholder marker

    If a field genuinely isn't in your sheet (e.g. no visibility
    column), it's just left out on the site — nothing breaks.

    If your headers don't match well enough for a field to be found,
    open this script and add your exact header text to the matching
    list for that field in COLUMN_KEYWORDS below.

This only touches the block between "DIVE SYNC START" and "DIVE SYNC
END" in data.json. Anything you added by hand elsewhere is left alone.
"""

import json
import re
import sys
from datetime import datetime, date
from pathlib import Path

# Each field is matched if ALL of its keyword groups appear somewhere in the
# header text. A "group" is itself a list of alternatives (any one of them
# counts). E.g. depth needs "depth" to appear; water temp needs both "water"
# and "temp" to appear (so it doesn't also match "air temp").
COLUMN_KEYWORDS = {
    "date": [["date"]],
    "where": [["where", "location", "site", "dive site", "spot"]],
    "buddy": [["who"], ["buddy"]],  # matches if EITHER "who" or "buddy" appears
    "durationMin": [["time total", "duration", "bottom time"]],
    "depthM": [["depth"]],
    "waterTempC": [["water"], ["temp"]],
    "airTempC": [["air"], ["temp"]],
    "weightKg": [["weight"]],
    "cylinderL": [["cilinder", "cylinder"]],
    "gas": [["nitrox"], ["else"]],
    "weather": [["weather"]],
    "wind": [["wind"]],
    "visibilityM": [["visibility", "vis"]],
    "notes": [["notes", "comments", "remarks"]],
}
# buddy's groups are OR'd together (special-cased below) rather than AND'd,
# since "With who" only contains "who", not "buddy".


def norm(s):
    return str(s).lower().strip()


def header_matches(header_text, groups, any_group=False):
    h = norm(header_text)
    if any_group:
        return any(any(kw in h for kw in group) for group in groups)
    return all(any(kw in h for kw in group) for group in groups)


def build_column_map(header_row):
    colmap = {}
    for i, cell in enumerate(header_row):
        if cell is None:
            continue
        h = str(cell)
        for field, groups in COLUMN_KEYWORDS.items():
            if field in colmap:
                continue
            any_group = field == "buddy"
            if header_matches(h, groups, any_group=any_group):
                colmap[field] = i
    return colmap


def cell_value(row, colmap, field):
    idx = colmap.get(field)
    if idx is None or idx >= len(row):
        return None
    v = row[idx]
    if isinstance(v, str) and v.strip() in ("", "/"):
        return None
    return v


def to_number(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return round(float(value), 2)
    s = str(value).strip().replace(",", ".")
    try:
        return round(float(s), 2)
    except ValueError:
        return None


def parse_date(value):
    if value is None:
        return ""
    if isinstance(value, (datetime, date)):
        return value.strftime("%Y-%m-%d")
    s = str(value).strip()
    # DD/MM/YYYY or D/M/YYYY
    m = re.match(r"^(\d{1,2})/(\d{1,2})/(\d{4})$", s)
    if m:
        d, mo, y = m.groups()
        return f"{y}-{int(mo):02d}-{int(d):02d}"
    # already ISO-ish
    if re.match(r"^\d{4}-\d{2}-\d{2}", s):
        return s[:10]
    return ""


def parse_duration_minutes(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return round(value)
    s = str(value).strip()
    m = re.match(r"^(\d+):(\d{2})$", s)
    if m:
        h, mm = int(m.group(1)), int(m.group(2))
        return h * 60 + mm
    n = to_number(s)
    return round(n) if n is not None else None


def parse_where(value):
    """'Site name (Country)' -> (site, location). Handles a missing
    closing parenthesis gracefully too."""
    if not value:
        return "", ""
    s = str(value).strip()
    m = re.match(r"^(.*?)\s*\(([^)]*)\)?\s*$", s)
    if m and m.group(2):
        site, location = m.group(1).strip(), m.group(2).strip()
        if location.lower() in ("belgië", "belgie"):
            location = "Belgium"
        return site, location
    return s, ""


def build_notes(row, colmap):
    parts = []
    explicit = cell_value(row, colmap, "notes")
    if explicit:
        parts.append(str(explicit).strip())

    gas = cell_value(row, colmap, "gas")
    if gas and str(gas).strip().lower() != "air":
        parts.append(str(gas).strip())

    weather = cell_value(row, colmap, "weather")
    if weather:
        parts.append(str(weather).strip())

    wind = cell_value(row, colmap, "wind")
    if wind and str(wind).strip().lower() != "none":
        parts.append(f"{str(wind).strip()} wind")

    air_temp = to_number(cell_value(row, colmap, "airTempC"))
    if air_temp is not None:
        parts.append(f"air {air_temp:g}°C")

    weight = to_number(cell_value(row, colmap, "weightKg"))
    if weight is not None:
        parts.append(f"{weight:g}kg weights")

    cyl = to_number(cell_value(row, colmap, "cylinderL"))
    if cyl is not None:
        parts.append(f"{cyl:g}L cylinder")

    return " · ".join(parts)


def read_dives(path):
    try:
        import openpyxl
    except ImportError:
        print("This needs the 'openpyxl' package. Install it with:\n    pip install openpyxl", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        return []

    header_row_idx = 0
    for i, row in enumerate(rows):
        if any(cell is not None and str(cell).strip() for cell in row):
            header_row_idx = i
            break

    colmap = build_column_map(rows[header_row_idx])
    if "date" not in colmap and "where" not in colmap:
        print("Couldn't find a 'Date' or 'Where/Site' column — check the header row, "
              "or add your header text to COLUMN_KEYWORDS in this script.", file=sys.stderr)
        sys.exit(1)

    dives = []
    for row in rows[header_row_idx + 1:]:
        if row is None or all(cell is None for cell in row):
            continue

        date_str = parse_date(cell_value(row, colmap, "date"))
        site, location = parse_where(cell_value(row, colmap, "where"))

        if not date_str and not site and not location:
            continue  # fully blank placeholder row

        dives.append({
            "date": date_str,
            "location": location,
            "site": site,
            "depthM": to_number(cell_value(row, colmap, "depthM")) or 0,
            "durationMin": parse_duration_minutes(cell_value(row, colmap, "durationMin")) or 0,
            "waterTempC": to_number(cell_value(row, colmap, "waterTempC")) or 0,
            "visibilityM": to_number(cell_value(row, colmap, "visibilityM")) or 0,
            "buddy": str(cell_value(row, colmap, "buddy") or "").strip(),
            "notes": build_notes(row, colmap),
        })
    return dives


def dive_to_entry(d):
    return {
        "date": d["date"],
        "location": d["location"],
        "site": d["site"],
        "depthM": d["depthM"],
        "durationMin": d["durationMin"],
        "waterTempC": d["waterTempC"],
        "visibilityM": d["visibilityM"],
        "buddy": d["buddy"],
        "notes": d["notes"],
        "source": "spreadsheet",
    }


def update_data_json(new_dives, path="data.json"):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if "dives" not in data:
        print("Couldn't find a 'dives' list in data.json — make sure you're using the "
              "updated data.json that includes a Dives section.", file=sys.stderr)
        sys.exit(1)

    kept = [d for d in data["dives"] if d.get("source") != "spreadsheet"]
    data["dives"] = kept + new_dives

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 update_dives.py path/to/your-dive-log.xlsx", file=sys.stderr)
        sys.exit(1)

    xlsx_path = Path(sys.argv[1])
    if not xlsx_path.exists():
        print(f"File not found: {xlsx_path}", file=sys.stderr)
        sys.exit(1)

    dives = read_dives(xlsx_path)
    if not dives:
        print("No dives found — nothing changed in data.json.")
        return

    entries = [dive_to_entry(d) for d in dives]
    update_data_json(entries)
    print(f"Done — wrote {len(dives)} dives into data.json.")
    print("Open index.html (or refresh it) to see the update.")


if __name__ == "__main__":
    main()
