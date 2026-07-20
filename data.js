/* ============================================================
   YOUR TRAVEL DATA
   ------------------------------------------------------------
   This is the only file you should need to edit by hand.
   Just add entries to the lists below — the site rebuilds
   itself from this automatically. Save the file and refresh
   your browser to see changes.

   Hikes are normally filled in automatically by running
   update_hikes.py (see the README), which pulls from your
   Komoot profile.

   Trips can be filled in automatically by running
   import_trips.py against a Polarsteps data export (see the
   README) — or just add/edit them here by hand.
   ============================================================ */

const SITE_DATA = {

  /* ----------------------------------------------------------
     0. YOUR NAME / SITE TITLE
  ---------------------------------------------------------- */
  profile: {
    name: "Sam",
    tagline: "Exploring everythingg",
  },

  /* ----------------------------------------------------------
     1. COUNTRIES YOU'VE VISITED
     Just the country name. Spelling should match the list in
     script.js (COUNTRY_COORDS) so it can be placed on the map —
     if a country you add doesn't show up as a pin, open
     script.js and add its coordinates to that table.
  ---------------------------------------------------------- */
  countries: [
    "Netherlands",
    "Belgium",
    "Germany",
    "France",
    "Italy",
    "Switzerland",
    "Austria",
    "Spain",
    "Portugal",
    "Norway",
    "Iceland",
  ],

  /* ----------------------------------------------------------
     2. TRIPS
     Each trip gets its own page automatically (just click the
     card). Fields:

       title        - trip name
       country      - shown on the card
       year         - used for sorting, newest first
       season       - e.g. "Summer", optional
       description  - short teaser shown on the trip card
       narrative    - longer story shown on the trip's own page
                       (optional — falls back to description)
       coverImage   - main photo URL for the card + page header
       images       - array of more photo URLs for the gallery
       highlights   - array of short strings, shown as a list
                       on the trip page (optional)
       distanceKm   - optional, shown as a stat on the trip page
       days         - optional, shown as a stat on the trip page

     Only "title" is required — leave anything else out and it's
     just skipped on the page.

     Running import_trips.py (see README) fills in a block here
     automatically from a Polarsteps export. Anything you add
     outside that block is left alone by the script.
  ---------------------------------------------------------- */
  trips: [
    /* --- POLARSTEPS SYNC START (do not edit this block by hand — it gets overwritten by import_trips.py) --- */
    {
      title: "Chasing the Aurora",
      country: "Norway",
      year: 2025,
      season: "Winter",
      description: "Two weeks chasing the northern lights along the Lofoten Islands.",
      narrative: "Two weeks chasing the northern lights along the Lofoten Islands, sleeping in cabins that smelled of woodsmoke and salt air. Some nights the sky delivered nothing but cloud and cold coffee — others, the whole fjord turned green.",
      coverImage: "",
      images: [],
      highlights: ["Reine at sunset", "Hiking to Ryten", "Aurora over Uttakleiv beach"],
      distanceKm: 0,
      days: 14,
    },
    {
      title: "Highlands & Glaciers",
      country: "Iceland",
      year: 2024,
      season: "Summer",
      description: "A ring-road loop past black sand beaches, glacier tongues, and steaming valleys.",
      narrative: "A ring-road loop past black sand beaches, glacier tongues, and geothermal valleys that never stopped steaming. Ten days, one small car, and more waterfalls than seemed reasonable for one island.",
      coverImage: "",
      images: [],
      highlights: ["Jökulsárlón glacier lagoon", "Landmannalaugar", "Diamond Beach"],
      distanceKm: 0,
      days: 10,
    },
    {
      title: "Alpine Crossing",
      country: "France / Italy / Switzerland",
      year: 2026,
      season: "Summer",
      description: "Following the Tour du Mont Blanc through three countries in a single loop.",
      narrative: "Following the Tour du Mont Blanc through three countries in a single loop, one pass at a time.",
      coverImage: "",
      images: [],
      highlights: [],
      distanceKm: 170,
      days: 10,
    },
    /* --- POLARSTEPS SYNC END --- */

    // Add any trips not on Polarsteps below this line — they won't be touched by the import script.
  ],

  /* ----------------------------------------------------------
     3. HIKES
     Auto-filled by update_hikes.py — see README.md.
     Format for manual additions:
     {
       name: "Trail name",
       date: "YYYY-MM-DD",
       distanceKm: 16.2,
       elevationUp: 1240,
       elevationDown: 1090,
       durationMin: 258,
       country: "France",
       url: "https://www.komoot.com/tour/xxxxx"
     }
  ---------------------------------------------------------- */
  hikes: [
    /* --- KOMOOT SYNC START (do not edit this block by hand — it gets overwritten by update_hikes.py) --- */
    {
      name: "Tour du Mont Blanc — normale route",
      date: "2026-06-15",
      distanceKm: 16.2,
      elevationUp: 1240,
      elevationDown: 1090,
      durationMin: 258,
      country: "France",
      url: "https://www.komoot.com/nl-nl/tour/3099718448",
    },
    /* --- KOMOOT SYNC END --- */

    // Add any hikes not on Komoot below this line — they won't be touched by the sync script.
  ],

};
