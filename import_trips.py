#!/usr/bin/env python3
"""
import_trips.py
----------------
Turns a Polarsteps data export into trip entries for data.js —
including every photo, broken down day by day.

Polarsteps doesn't allow automated scraping of profile pages (their
robots.txt blocks it) and has no public API, but they do offer an
official export of your own data — that's what this script reads.

STEP 1 — Export your data from Polarsteps
    In the app or on polarsteps.com: Settings -> Account -> "Download
    your data" (you'll need to confirm your password). You'll get a
    link to a .zip file by email.

STEP 2 — Unzip it
    Inside you'll find a "user_data" folder containing a "trip" folder
    with one subfolder per trip, each with a trip.json file (and your
    photos).

STEP 3 — Run this script
    python3 import_trips.py /path/to/unzipped/user_data/trip

This only touches the block between "POLARSTEPS SYNC START" and
"POLARSTEPS SYNC END" in data.js. Anything you added by hand above or
below that block is left alone.

NOTE: Polarsteps' export format isn't officially documented and can
vary between accounts/app versions. This script reads the fields that
are usually present (name, dates, description, steps, photos) and
skips anything it can't find rather than guessing. If a trip comes
through with gaps, just fill them in by hand in data.js afterwards —
that's completely safe to do.
"""

import json
import re
import sys
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path

START_MARKER = "/* --- POLARSTEPS SYNC START (do not edit this block by hand — it gets overwritten by import_trips.py) --- */"
END_MARKER = "/* --- POLARSTEPS SYNC END --- */"


def esc(s):
    return (s or "").replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()


def find_trip_json(trip_folder: Path):
    for name in ("trip.json", "Trip.json"):
        f = trip_folder / name
        if f.exists():
            return f
    matches = list(trip_folder.glob("*trip*.json"))
    return matches[0] if matches else None


def extract_countries(trip):
    countries = trip.get("all_countries") or trip.get("countries") or []
    names = []
    for c in countries:
        if isinstance(c, dict):
            n = c.get("name") or c.get("country_name")
            if n:
                names.append(n)
        elif isinstance(c, str):
            names.append(c)
    return names


def to_date_str(value):
    """Best-effort conversion of a Polarsteps timestamp (unix seconds,
    or an ISO-ish string) into a YYYY-MM-DD string."""
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        try:
            return datetime.fromtimestamp(value, tz=timezone.utc).strftime("%Y-%m-%d")
        except Exception:
            return ""
    if isinstance(value, str) and len(value) >= 10:
        return value[:10]
    return ""


def step_photos(step):
    urls = []
    for photo in step.get("photos", []) or []:
        if isinstance(photo, dict):
            p = photo.get("path") or photo.get("large_thumbnail_path") or photo.get("original")
            if p:
                urls.append(p)
        elif isinstance(photo, str):
            urls.append(photo)
    return urls


def scan_folder_for_photos(trip_folder: Path, limit=500):
    """Fallback: if steps have no photo references, just scan the trip's
    export folder for image files directly."""
    urls = []
    for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp"):
        for f in trip_folder.rglob(ext):
            urls.append(str(f))
            if len(urls) >= limit:
                return urls
    return urls


def group_steps_by_day(trip, trip_folder: Path):
    """Returns an ordered dict: date string -> {title, description, photos[]}"""
    days = OrderedDict()
    steps = trip.get("steps", []) or []
    steps = sorted(steps, key=lambda s: s.get("start_time") or s.get("time") or 0)

    for step in steps:
        ts = step.get("start_time") or step.get("time")
        date_str = to_date_str(ts)
        if not date_str:
            continue

        loc = step.get("location")
        loc_name = loc.get("name") if isinstance(loc, dict) else None
        title = step.get("name") or loc_name or ""
        description = step.get("description") or ""
        photos = step_photos(step)

        if date_str not in days:
            days[date_str] = {"title": title, "description": description, "photos": []}
        else:
            if not days[date_str]["title"] and title:
                days[date_str]["title"] = title
            if not days[date_str]["description"] and description:
                days[date_str]["description"] = description
        days[date_str]["photos"].extend(photos)

    # Fallback: no steps/photos found via JSON — just dump any images found
    # in the folder into a single unlabelled "day" so nothing is lost.
    if not days:
        found = scan_folder_for_photos(trip_folder)
        if found:
            days["unknown"] = {"title": "", "description": "", "photos": found}

    return days


def days_to_js(days):
    if not days:
        return ""
    parts = []
    for date_str, d in days.items():
        photos_js = ", ".join(f'"{esc(u)}"' for u in d["photos"])
        parts.append(f"""      {{
        date: "{date_str}",
        title: "{esc(d['title'])}",
        description: "{esc(d['description'])[:220]}",
        photos: [{photos_js}],
      }},""")
    return "\n".join(parts)


def trip_to_entry(trip, trip_folder: Path):
    title = esc(trip.get("name") or trip_folder.name)
    description = esc(trip.get("summary") or trip.get("description") or "")

    start = trip.get("start_date")
    end = trip.get("end_date")
    year = to_date_str(start)[:4] if to_date_str(start) else ""

    countries = extract_countries(trip)
    country = esc(" / ".join(countries[:3])) if countries else ""

    days = group_steps_by_day(trip, trip_folder)
    all_photos = [p for d in days.values() for p in d["photos"]]
    cover = all_photos[0] if all_photos else ""

    days_of_trip = ""
    if isinstance(start, (int, float)) and isinstance(end, (int, float)):
        days_of_trip = round((end - start) / 86400)

    days_js = days_to_js(days)

    return f"""    {{
      title: "{title}",
      country: "{country}",
      year: {year or 0},
      season: "",
      description: "{description[:180]}",
      narrative: "{description}",
      coverImage: "{esc(cover)}",
      images: [],
      highlights: [],
      distanceKm: 0,
      days: {days_of_trip or 0},
      dayByDay: [
{days_js}
      ],
    }},"""


def update_data_js(entries_text, path="data.js"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if START_MARKER not in content:
        content = content.replace(
            "trips: [",
            f"trips: [\n{START_MARKER}\n{entries_text}\n    {END_MARKER}\n",
            1,
        )
    else:
        pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.DOTALL)
        replacement = START_MARKER + "\n" + entries_text + "\n    " + END_MARKER
        content = pattern.sub(replacement, content, count=1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 import_trips.py /path/to/unzipped/user_data/trip", file=sys.stderr)
        sys.exit(1)

    trips_root = Path(sys.argv[1])
    if not trips_root.exists():
        print(f"Folder not found: {trips_root}", file=sys.stderr)
        sys.exit(1)

    entries = []
    total_photos = 0
    for trip_folder in sorted(p for p in trips_root.iterdir() if p.is_dir()):
        trip_json = find_trip_json(trip_folder)
        if not trip_json:
            print(f"Skipping {trip_folder.name} — no trip.json found")
            continue
        try:
            trip = json.loads(trip_json.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"Skipping {trip_folder.name} — couldn't parse trip.json ({e})")
            continue
        entry = trip_to_entry(trip, trip_folder)
        entries.append(entry)
        print(f"Parsed: {trip.get('name', trip_folder.name)}")

    if not entries:
        print("No trips parsed — nothing changed in data.js.")
        return

    update_data_js("\n".join(entries))
    print(f"\nDone — wrote {len(entries)} trips into data.js, broken down day by day.")
    print("Note: photo paths point to files inside your export folder — move")
    print("those photos next to index.html (e.g. an /images folder) and update")
    print("the paths in data.js, or swap in hosted image URLs instead.")


if __name__ == "__main__":
    main()
