#!/usr/bin/env python3
"""
import_trips.py
----------------
Turns a Polarsteps data export into trip entries for data.js.

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
from pathlib import Path

START_MARKER = "/* --- POLARSTEPS SYNC START (do not edit this block by hand — it gets overwritten by import_trips.py) --- */"
END_MARKER = "/* --- POLARSTEPS SYNC END --- */"


def esc(s):
    return (s or "").replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()


def find_trip_json(trip_folder: Path):
    # Usually just "trip.json", but be lenient in case of naming variants.
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


def extract_images(trip, trip_folder: Path, limit=8):
    # Try to find photo references inside steps; fall back to scanning
    # for image files physically present in the trip folder.
    urls = []
    for step in trip.get("steps", []):
        for photo in step.get("photos", []) or []:
            if isinstance(photo, dict):
                p = photo.get("path") or photo.get("large_thumbnail_path") or photo.get("original")
                if p:
                    urls.append(p)
        if len(urls) >= limit:
            break

    if not urls:
        for ext in ("*.jpg", "*.jpeg", "*.png"):
            for f in trip_folder.rglob(ext):
                urls.append(str(f))
                if len(urls) >= limit:
                    break
            if len(urls) >= limit:
                break

    return urls[:limit]


def extract_highlights(trip, limit=6):
    names = []
    for step in trip.get("steps", []):
        name = step.get("name") or step.get("location", {}).get("name") if isinstance(step.get("location"), dict) else step.get("name")
        if name and name not in names:
            names.append(name)
        if len(names) >= limit:
            break
    return names


def trip_to_entry(trip, trip_folder: Path):
    title = esc(trip.get("name") or trip_folder.name)
    description = esc(trip.get("summary") or trip.get("description") or "")
    start = (trip.get("start_date") or "")
    year = ""
    if isinstance(start, (int, float)):
        # Polarsteps sometimes stores unix timestamps
        from datetime import datetime, timezone
        try:
            year = datetime.fromtimestamp(start, tz=timezone.utc).year
        except Exception:
            year = ""
    elif isinstance(start, str) and len(start) >= 4:
        year = start[:4]

    countries = extract_countries(trip)
    country = esc(" / ".join(countries[:3])) if countries else ""

    images = extract_images(trip, trip_folder)
    cover = images[0] if images else ""
    gallery = images[1:]

    highlights = extract_highlights(trip)

    days = ""
    end = trip.get("end_date")
    if start and end and isinstance(start, (int, float)) and isinstance(end, (int, float)):
        days = round((end - start) / 86400)

    images_js = ", ".join(f'"{esc(u)}"' for u in gallery)
    highlights_js = ", ".join(f'"{esc(h)}"' for h in highlights)

    return f"""    {{
      title: "{title}",
      country: "{country}",
      year: {year or 0},
      season: "",
      description: "{description[:180]}",
      narrative: "{description}",
      coverImage: "{esc(cover)}",
      images: [{images_js}],
      highlights: [{highlights_js}],
      distanceKm: 0,
      days: {days or 0},
    }},"""


def update_data_js(entries_text, path="data.js"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if START_MARKER not in content:
        # first run: insert sync block right after the "trips: [" opening
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
        entries.append(trip_to_entry(trip, trip_folder))
        print(f"Parsed: {trip.get('name', trip_folder.name)}")

    if not entries:
        print("No trips parsed — nothing changed in data.js.")
        return

    update_data_js("\n".join(entries))
    print(f"\nDone — wrote {len(entries)} trips into data.js.")
    print("Note: image paths point to files inside your export folder — move")
    print("those photos next to index.html (e.g. an /images folder) and update")
    print("the paths in data.js, or swap in hosted image URLs instead.")


if __name__ == "__main__":
    main()
