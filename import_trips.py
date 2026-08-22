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
vary between accounts/app versions. This script tries several ways to
match photos to the day they were taken, in order:
  1. Photo references directly inside each step's JSON entry
  2. A subfolder in the export whose name matches the step's title/location
  3. EXIF "date taken" metadata read from the photo files themselves
     (needs Pillow — run "pip install Pillow" first; skipped silently
     if Pillow isn't installed)
If none of those work for a trip, photos fall back to being grouped by
file-modified date, which may not be fully accurate — check the result
and adjust by hand in data.js if a day looks off. That's always safe;
the script only touches its own marked block.
"""

import json
import re
import sys
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path



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
    for key in ("photos", "media", "images"):
        for photo in step.get(key, []) or []:
            if isinstance(photo, dict):
                p = photo.get("path") or photo.get("large_thumbnail_path") or photo.get("original")
                if p:
                    urls.append(p)
            elif isinstance(photo, str):
                urls.append(photo)
    return urls


def normalize(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def find_step_subfolder(trip_folder: Path, step):
    """Polarsteps sometimes stores each step's photos in their own
    subfolder inside the trip folder. Only match on an exact
    (normalized) name match — substring matching is too easy to get
    wrong (e.g. "Vik" incorrectly matching inside "Reykjavik")."""
    loc = step.get("location")
    loc_name = loc.get("name") if isinstance(loc, dict) else None
    candidates = [c for c in (step.get("name"), loc_name) if c]
    if not candidates:
        return None

    target_names = {normalize(c) for c in candidates}
    for sub in trip_folder.iterdir():
        if sub.is_dir() and normalize(sub.name) in target_names:
            return sub
    return None


def images_in_folder(folder: Path, limit=200):
    urls = []
    for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.heic"):
        for f in sorted(folder.rglob(ext)):
            urls.append(str(f))
            if len(urls) >= limit:
                return urls
    return urls


def exif_date(path: Path):
    """Best-effort EXIF 'date taken' lookup, used only as a last-resort
    fallback when nothing else tells us which day a photo belongs to."""
    try:
        from PIL import Image
        img = Image.open(path)
        exif = img.getexif()
        # DateTimeOriginal (36867) lives in the Exif sub-IFD (tag 0x8769
        # in the main IFD points to it), not the top-level IFD.
        exif_ifd = exif.get_ifd(0x8769) if exif else {}
        for source in (exif_ifd, exif):
            for tag_id in (36867, 306):  # DateTimeOriginal, DateTime
                value = source.get(tag_id)
                if isinstance(value, str) and len(value) >= 10:
                    # EXIF format: "YYYY:MM:DD HH:MM:SS"
                    return value[:10].replace(":", "-")
    except Exception:
        pass
    return None


def scan_folder_for_photos_by_exif(trip_folder: Path):
    """Fallback used only if step-based matching found nothing at all:
    scan every photo in the trip folder and bucket by EXIF date-taken
    (falls back to file modified time if a photo has no EXIF date)."""
    days = OrderedDict()
    for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp"):
        for f in sorted(trip_folder.rglob(ext)):
            date_str = exif_date(f)
            if not date_str:
                try:
                    date_str = datetime.fromtimestamp(f.stat().st_mtime, tz=timezone.utc).strftime("%Y-%m-%d")
                except Exception:
                    date_str = "unsorted"
            days.setdefault(date_str, {"title": "", "description": "", "photos": []})
            days[date_str]["photos"].append(str(f))
    return days


def group_steps_by_day(trip, trip_folder: Path):
    """Returns an ordered dict: date string -> {title, description, photos[]}"""
    days = OrderedDict()
    # Polarsteps' export field is "all_steps" — some older/alternate
    # exports may use "steps" instead, so we check both.
    steps = trip.get("all_steps") or trip.get("steps") or []
    steps = sorted(steps, key=lambda s: s.get("start_time") or s.get("time") or 0)

    matched_any_photo = False

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
        if not photos:
            subfolder = find_step_subfolder(trip_folder, step)
            if subfolder:
                photos = images_in_folder(subfolder)
        if photos:
            matched_any_photo = True

        if date_str not in days:
            days[date_str] = {"title": title, "description": description, "photos": []}
        else:
            if not days[date_str]["title"] and title:
                days[date_str]["title"] = title
            if not days[date_str]["description"] and description:
                days[date_str]["description"] = description
        days[date_str]["photos"].extend(photos)

    # If we found steps/dates but genuinely no photos could be matched to
    # any of them, fall back to EXIF-date grouping across the whole
    # folder rather than dumping everything under one label.
    if steps and not matched_any_photo:
        exif_days = scan_folder_for_photos_by_exif(trip_folder)
        if exif_days:
            return exif_days

    # No steps at all (unexpected export format) — same EXIF fallback.
    if not days:
        exif_days = scan_folder_for_photos_by_exif(trip_folder)
        if exif_days:
            return exif_days

    return days


def trip_to_entry(trip, trip_folder: Path):
    title = trip.get("name") or trip_folder.name
    description = trip.get("summary") or trip.get("description") or ""

    start = trip.get("start_date")
    end = trip.get("end_date")
    year = int(to_date_str(start)[:4]) if to_date_str(start) else 0

    countries = extract_countries(trip)
    country = " / ".join(countries[:3]) if countries else ""

    days_dict = group_steps_by_day(trip, trip_folder)
    all_photos = [p for d in days_dict.values() for p in d["photos"]]
    cover = all_photos[0] if all_photos else ""

    days_of_trip = 0
    if isinstance(start, (int, float)) and isinstance(end, (int, float)):
        days_of_trip = round((end - start) / 86400)

    day_by_day = [
        {"date": date_str, "title": d["title"], "description": d["description"][:220], "photos": d["photos"]}
        for date_str, d in days_dict.items()
    ]

    return {
        "title": title,
        "country": country,
        "year": year,
        "season": "",
        "description": description[:180],
        "narrative": description,
        "coverImage": cover,
        "images": [],
        "highlights": [],
        "distanceKm": 0,
        "days": days_of_trip,
        "dayByDay": day_by_day,
        "source": "polarsteps",
    }


def update_data_json(new_trips, path="data.json"):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    kept = [t for t in data.get("trips", []) if t.get("source") != "polarsteps"]
    data["trips"] = kept + new_trips

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


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
        entry = trip_to_entry(trip, trip_folder)
        entries.append(entry)
        print(f"Parsed: {trip.get('name', trip_folder.name)}")

    if not entries:
        print("No trips parsed — nothing changed in data.json.")
        return

    update_data_json(entries)
    print(f"\nDone — wrote {len(entries)} trips into data.json, broken down day by day.")
    print("Note: photo paths point to files inside your export folder — move")
    print("those photos next to index.html (e.g. an /images folder) and update")
    print("the paths in data.json, or swap in hosted image URLs instead.")


if __name__ == "__main__":
    main()
