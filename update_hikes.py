#!/usr/bin/env python3
"""
update_hikes.py
----------------
Pulls your tours from Komoot and updates the hikes list in data.json,
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

This only replaces hikes tagged "source": "komoot" in data.json. Any
hike you added by hand (with a different/no source tag, or manually
set to "manual") is left completely alone.
"""

import argparse
import json
import sys
import urllib.request

USER_ID = "5843767106413"
BASE_URL = "https://www.komoot.com/api/v007/users/{user_id}/tours/"


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
    tour_id = t.get("id")
    return {
        "name": t.get("name") or "Untitled tour",
        "date": (t.get("date") or t.get("time") or "")[:10],
        "distanceKm": round((t.get("distance") or 0) / 1000, 1),
        "elevationUp": round(t.get("elevation_up") or 0),
        "elevationDown": round(t.get("elevation_down") or 0),
        "durationMin": round((t.get("duration") or 0) / 60),
        "country": "",
        "url": f"https://www.komoot.com/tour/{tour_id}" if tour_id else "",
        "source": "komoot",
    }


def update_data_json(new_hikes, path="data.json"):
    from datetime import datetime, timezone

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    kept = [h for h in data.get("hikes", []) if h.get("source") != "komoot"]
    data["hikes"] = kept + new_hikes

    now = datetime.now(timezone.utc).isoformat()
    data.setdefault("meta", {"lastUpdated": None, "lastSynced": {}})
    data["meta"].setdefault("lastSynced", {})
    data["meta"]["lastSynced"]["komoot"] = now
    data["meta"]["lastUpdated"] = now

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--user-id", default=USER_ID, help="Komoot numeric user id")
    parser.add_argument("--cookie", default=None, help="Komoot session cookie, for private tours")
    parser.add_argument("--sport", default="hike", help='"hike" (default) or "all"')
    parser.add_argument("--file", default="data.json", help="Path to data.json")
    args = parser.parse_args()

    print(f"Fetching tours for user {args.user_id} (sport={args.sport})...")
    tours = fetch_tours(args.user_id, cookie=args.cookie, sport=args.sport)

    if not tours:
        print("No tours found (or the request was blocked). "
              "If your profile/tours are private, pass --cookie. Nothing was changed.")
        return

    entries = [tour_to_entry(t) for t in tours]
    update_data_json(entries, path=args.file)
    print(f"Done — wrote {len(entries)} hikes into {args.file}.")
    print("Open index.html (or refresh it) to see the update.")
    print("Tip: the 'country' field is left blank — fill it in by hand in data.json if you want hikes grouped/labelled by country.")


if __name__ == "__main__":
    main()
