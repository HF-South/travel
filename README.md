# Your Travel & Hikes Site

## Files

- **index.html** — the site itself. Open it in a browser to view.
- **data.js** — **the only file you should need to edit.** Your name, countries visited, trips, and hikes all live here as simple lists.
- **script.js** — the logic that turns data.js into the page. You shouldn't need to touch this unless you want to change how something works.
- **update_hikes.py** — run this to pull your latest hikes from Komoot straight into data.js.

## Adding content

Open `data.js` in any text editor:

- **Countries**: add a name to the `countries` list.
- **Trips**: copy one of the existing `{ ... }` blocks in `trips` and fill in your own title, country, year, and description.
- **Hikes**: normally you don't touch these by hand — run the sync script instead (below). You can still add a hike manually below the `KOMOOT SYNC END` marker if it's not on Komoot.

Save the file, then refresh `index.html` in your browser to see the change.

## Syncing hikes from Komoot

Komoot doesn't offer a public API for individual developers, so this uses their internal (undocumented) endpoint. It works for anything public on your profile without logging in:

```
python3 update_hikes.py
```

Run this whenever you want your hikes list and stats to catch up with what you've logged on Komoot. It only rewrites the auto-synced block in `data.js` — anything you added by hand stays put.

If a hike doesn't show up, it's probably because it's not public. Two options:
- Make the tour public/followers-visible in Komoot, or
- Pass your session cookie so the script can see private tours too (see the comment at the top of `update_hikes.py` for how to grab it from your browser's dev tools). Treat that cookie like a password — don't share it or commit it anywhere.

**Heads-up:** this relies on an unofficial Komoot endpoint, since there's no public API. It could break if Komoot changes something on their end — if it stops working, that's why.

## Adding a country to the map

The map plots pins from a lookup table of country name → coordinates in `script.js` (`COUNTRY_COORDS`). Around 110 common countries are already in there. If you add a country in `data.js` and its pin doesn't appear, open `script.js`, find `COUNTRY_COORDS`, and add a line like:

```js
"Vietnam": [14.1, 108.3],
```

(rough latitude, longitude of the country's centroid is fine — doesn't need to be precise)

## Hosting it somewhere real

Right now this is just local files. Easiest free options to put it on the actual internet:

- **GitHub Pages** — push these files to a GitHub repo, turn on Pages in the repo settings, done.
- **Netlify / Vercel** — drag-and-drop the folder onto their dashboard.

Either way works fine since the site has no backend — it's just static files.
