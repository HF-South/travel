#!/usr/bin/env python3
"""
update_hikes.py
----------------
Pulls your tours from Komoot and rewrites the hikes list in data.js,
so your site's Hikes page and stats stay current.

USAGE

  Public tours only (no login needed):
      python3 update_hikes.py

  Include private/followers-only tours (needs your Komoot session cookie):
      python3 update_hikes.py --cookie "PASTE_YOUR_COOKIE_HERE"

  How to get your cookie for the private option:
      1. Log into komoot.com in your browser
      2. Open Developer Tools (F12) -> Network tab
      3. Reload your profile page
      4. Click any request to komoot.com, find "Cookie" in Request Headers
      5. Copy the whole value and paste it in quotes after --cookie

NOTE: this uses Komoot's internal (undocumented) API, since Komoot does
not offer a public API for individual developers. It only pulls tours
tagged as hikes ("hike" sport type) by default — pass --sport all to
pull every activity type instead.

This script only touches the block between the
"KOMOOT SYNC START" / "KOMOOT SYNC END" markers in data.js.
Anything you added by hand below that block is left alone.
"""

import argparse
import json
import re
import sys
import urllib.request

USER_ID = "5843767106413"
BASE_URL = "https://www.komoot.com/api/v007/users/{user_id}/tours/"

START_MARKER = "/* --- KOMOOT SYNC START (do not edit this block by hand — it gets overwritten by update_hikes.py) --- */"
END_MARKER = "/* --- KOMOOT SYNC END --- */"


def fetch_tours(user_id, cookie=None, sport="hike"):
    tours = []
    page = 0
    while True:
        url = (
            BASE_URL.format(user_id=user_id)
            + f"?page={page}&limit=50&sort_field=date&sort_direction=desc"
        )
        if sport != "all":
            url += f"&sport_types={sport}"
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        })
        if cookie:
            req.add_header("Cookie", cookie)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.load(resp)
        except Exception as e:
            print(f"Request failed: {e}", file=sys.stderr)
            break

        items = data.get("_embedded", {}).get("tours", []) or data.get("items", [])
        if not items:
            break
        tours.extend(items)

        total_pages = data.get("page", {}).get("totalPages", 1) if "page" in data else 1
        page += 1
        if page >= total_pages or not items:
            break
    return tours


def tour_to_entry(t):
    name = (t.get("name") or "Untitled tour").replace('"', "'")
    date = (t.get("date") or t.get("time") or "")[:10]
    distance_km = round((t.get("distance") or 0) / 1000, 1)
    up = round(t.get("elevation_up") or 0)
    down = round(t.get("elevation_down") or 0)
    duration_min = round((t.get("duration") or 0) / 60)
    tour_id = t.get("id")
    url = f"https://www.komoot.com/tour/{tour_id}" if tour_id else ""

    return f"""    {{
      name: "{name}",
      date: "{date}",
      distanceKm: {distance_km},
      elevationUp: {up},
      elevationDown: {down},
      durationMin: {duration_min},
      country: "",
      url: "{url}",
    }},"""


def update_data_js(entries_text, path="data.js"):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if START_MARKER not in content or END_MARKER not in content:
        print("Could not find sync markers in data.js — is this the right file/folder?", file=sys.stderr)
        sys.exit(1)

    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER),
        re.DOTALL,
    )
    replacement = START_MARKER + "\n" + entries_text + "\n    " + END_MARKER
    new_content = pattern.sub(replacement, content, count=1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--user-id", default=USER_ID, help="Komoot numeric user id")
    parser.add_argument("--cookie", default=None, help="Komoot session cookie, for private tours")
    parser.add_argument("--sport", default="hike", help='"hike" (default) or "all"')
    parser.add_argument("--file", default="data.js", help="Path to data.js")
    args = parser.parse_args()

    print(f"Fetching tours for user {args.user_id} (sport={args.sport})...")
    tours = fetch_tours(args.user_id, cookie=args.cookie, sport=args.sport)

    if not tours:
        print("No tours found (or the request was blocked). "
              "If your profile/tours are private, pass --cookie. Nothing was changed.")
        return

    entries = "\n".join(tour_to_entry(t) for t in tours)
    update_data_js(entries, path=args.file)
    print(f"Done — wrote {len(tours)} hikes into {args.file}.")
    print("Open index.html (or refresh it) to see the update.")
    print("Tip: the 'country' field is left blank — fill it in by hand in data.js if you want hikes grouped/labelled by country.")


if __name__ == "__main__":
    main()
