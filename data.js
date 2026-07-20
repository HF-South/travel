/* ============================================================
   YOUR TRAVEL DATA
   ------------------------------------------------------------
   This is the only file you should need to edit by hand.
   Just add entries to the lists below — the site rebuilds
   itself from this automatically. Save the file and refresh
   your browser to see changes.

   Hikes are normally filled in automatically by running
   update_hikes.py (see the README), which pulls straight from
   your Komoot profile. You can still add hikes here by hand
   too — anything you add manually is kept.
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
     One entry per trip. "image" is optional — paste a direct
     image URL (ending in .jpg/.png) if you have one, or leave
     it as an empty string "" and a placeholder will be shown.
  ---------------------------------------------------------- */
  trips: [
    {
      title: "Chasing the Aurora",
      country: "Norway",
      year: 2025,
      season: "Winter",
      description: "Two weeks chasing the northern lights along the Lofoten Islands, sleeping in cabins that smelled of woodsmoke and salt air.",
      image: "",
    },
    {
      title: "Highlands & Glaciers",
      country: "Iceland",
      year: 2024,
      season: "Summer",
      description: "A ring-road loop past black sand beaches, glacier tongues, and geothermal valleys that never stopped steaming.",
      image: "",
    },
    {
      title: "Alpine Crossing",
      country: "France / Italy / Switzerland",
      year: 2026,
      season: "Summer",
      description: "Following the Tour du Mont Blanc through three countries in a single loop, one pass at a time.",
      image: "",
    },
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
