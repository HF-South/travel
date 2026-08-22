/* SITE_DATA is loaded async from data.json — see initSite() at the bottom
   of this file. Everything else here assumes it's already populated by
   the time render functions run. */
let SITE_DATA = null;

/* ============================================================
   Country centroid lookup (lat, lng) for placing map pins.
   Covers all UN member states plus a few commonly-tracked
   territories (Vatican City, Kosovo, Palestine, the Dutch
   Caribbean islands). If a country in your data.json list still
   isn't showing a pin, add it here — just find its rough
   centroid coordinates and add a line in the same format.
   ============================================================ */
const COUNTRY_COORDS = {
  // Africa
  "Algeria": [28.0, 1.7], // DZ
  "Angola": [-11.2, 17.9], // AO
  "Benin": [9.3, 2.3], // BJ
  "Botswana": [-22.3, 24.7], // BW
  "Burkina Faso": [12.2, -1.6], // BF
  "Burundi": [-3.4, 29.9], // BI
  "Cabo Verde": [16.0, -24.0], // CV
  "Cameroon": [3.8, 11.5], // CM
  "Central African Republic": [6.6, 20.9], // CF
  "Chad": [15.5, 18.7], // TD
  "Comoros": [-11.9, 43.3], // KM
  "Democratic Republic of the Congo": [-4.0, 21.8], // CD
  "Republic of the Congo": [-0.2, 15.8], // CG
  "Djibouti": [11.8, 42.6], // DJ
  "Egypt": [26.8, 30.8], // EG
  "Equatorial Guinea": [1.6, 10.3], // GQ
  "Eritrea": [15.2, 39.8], // ER
  "Eswatini": [-26.5, 31.5], // SZ
  "Ethiopia": [9.1, 40.5], // ET
  "Gabon": [-0.8, 11.6], // GA
  "Gambia": [13.4, -15.3], // GM
  "Ghana": [7.9, -1.0], // GH
  "Guinea": [9.9, -9.7], // GN
  "Guinea-Bissau": [12.0, -15.2], // GW
  "Ivory Coast": [7.5, -5.5], // CI
  "Kenya": [-0.0, 37.9], // KE
  "Lesotho": [-29.6, 28.2], // LS
  "Liberia": [6.4, -9.4], // LR
  "Libya": [26.3, 17.2], // LY
  "Madagascar": [-18.8, 47.0], // MG
  "Malawi": [-13.3, 34.3], // MW
  "Mali": [17.6, -4.0], // ML
  "Mauritania": [21.0, -10.9], // MR
  "Mauritius": [-20.3, 57.6], // MU
  "Morocco": [31.8, -7.1], // MA
  "Mozambique": [-18.7, 35.5], // MZ
  "Namibia": [-22.9, 18.5], // NA
  "Niger": [17.6, 8.1], // NE
  "Nigeria": [9.1, 8.7], // NG
  "Rwanda": [-1.9, 29.9], // RW
  "Sao Tome and Principe": [0.2, 6.6], // ST
  "Senegal": [14.5, -14.5], // SN
  "Seychelles": [-4.7, 55.5], // SC
  "Sierra Leone": [8.5, -11.8], // SL
  "Somalia": [5.2, 46.2], // SO
  "South Africa": [-30.6, 22.9], // ZA
  "South Sudan": [7.3, 30.0], // SS
  "Sudan": [12.9, 30.2], // SD
  "Tanzania": [-6.4, 34.9], // TZ
  "Togo": [8.6, 0.8], // TG
  "Tunisia": [33.9, 9.5], // TN
  "Uganda": [1.4, 32.3], // UG
  "Zambia": [-13.1, 27.8], // ZM
  "Zimbabwe": [-19.0, 29.2], // ZW

  // Americas
  "Antigua and Barbuda": [17.1, -61.8], // AG
  "Argentina": [-38.4, -63.6], // AR
  "Bahamas": [24.3, -76.6], // BS
  "Barbados": [13.2, -59.5], // BB
  "Belize": [17.2, -88.5], // BZ
  "Bolivia": [-16.3, -63.6], // BO
  "Brazil": [-14.2, -51.9], // BR
  "Canada": [56.1, -106.3], // CA
  "Chile": [-35.7, -71.5], // CL
  "Colombia": [4.6, -74.3], // CO
  "Costa Rica": [9.7, -83.8], // CR
  "Cuba": [21.5, -77.8], // CU
  "Dominica": [15.4, -61.4], // DM
  "Dominican Republic": [18.7, -70.2], // DO
  "Ecuador": [-1.8, -78.2], // EC
  "El Salvador": [13.8, -88.9], // SV
  "Grenada": [12.1, -61.7], // GD
  "Guatemala": [15.8, -90.2], // GT
  "Guyana": [4.9, -58.9], // GY
  "Haiti": [18.9, -72.3], // HT
  "Honduras": [15.2, -86.2], // HN
  "Jamaica": [18.1, -77.3], // JM
  "Mexico": [23.6, -102.6], // MX
  "Nicaragua": [12.9, -85.2], // NI
  "Panama": [8.5, -80.8], // PA
  "Paraguay": [-23.4, -58.4], // PY
  "Peru": [-9.2, -75.0], // PE
  "Saint Kitts and Nevis": [17.4, -62.8], // KN
  "Saint Lucia": [13.9, -60.9], // LC
  "Saint Vincent and the Grenadines": [13.0, -61.2], // VC
  "Suriname": [4.0, -56.0], // SR
  "Trinidad and Tobago": [10.7, -61.2], // TT
  "United States": [39.8, -98.6], // US
  "Uruguay": [-32.5, -55.8], // UY
  "Venezuela": [6.4, -66.6], // VE

   // Dutch Caribbean
  "Aruba": [12.5, -69.97], // AW
  "Curacao": [12.17, -68.99], // CW
  "Curaçao": [12.17, -68.99], // CW — duplicate with the accented spelling, in case you type it that way
  "Sint Maarten": [18.04, -63.06], // SX (Dutch side of the island)
  "Bonaire": [12.2, -68.25], // BQ
  "Saba": [17.63, -63.23], // BQ
  "Sint Eustatius": [17.48, -62.98], // BQ

  // Asia
  "Afghanistan": [33.9, 67.7], // AF
  "Armenia": [40.1, 45.0], // AM
  "Azerbaijan": [40.1, 47.6], // AZ
  "Bahrain": [26.0, 50.5], // BH
  "Bangladesh": [23.7, 90.4], // BD
  "Bhutan": [27.5, 90.4], // BT
  "Brunei": [4.5, 114.7], // BN
  "Cambodia": [12.6, 104.9], // KH
  "China": [35.9, 104.2], // CN
  "Cyprus": [35.1, 33.4], // CY
  "Georgia": [42.3, 43.4], // GE
  "India": [20.6, 78.9], // IN
  "Indonesia": [-0.8, 113.9], // ID
  "Iran": [32.4, 53.7], // IR
  "Iraq": [33.2, 43.7], // IQ
  "Israel": [31.0, 34.9], // IL
  "Japan": [36.2, 138.3], // JP
  "Jordan": [30.6, 36.2], // JO
  "Kazakhstan": [48.0, 66.9], // KZ
  "Kuwait": [29.3, 47.5], // KW
  "Kyrgyzstan": [41.2, 74.8], // KG
  "Laos": [19.9, 102.5], // LA
  "Lebanon": [33.9, 35.9], // LB
  "Malaysia": [4.2, 101.9], // MY
  "Maldives": [3.2, 73.2], // MV
  "Mongolia": [46.9, 103.8], // MN
  "Myanmar": [21.9, 95.9], // MM
  "Nepal": [28.4, 84.1], // NP
  "North Korea": [40.3, 127.5], // KP
  "Oman": [21.5, 55.9], // OM
  "Pakistan": [30.4, 69.3], // PK
  "Palestine": [31.9, 35.2], // PS
  "Philippines": [12.9, 121.8], // PH
  "Qatar": [25.4, 51.2], // QA
  "Saudi Arabia": [23.9, 45.1], // SA
  "Singapore": [1.35, 103.8], // SG
  "South Korea": [35.9, 127.8], // KR
  "Sri Lanka": [7.9, 80.7], // LK
  "Syria": [34.8, 38.9], // SY
  "Tajikistan": [38.9, 71.3], // TJ
  "Thailand": [15.9, 100.9], // TH
  "Timor-Leste": [-8.9, 125.7], // TL
  "Turkey": [38.9, 35.2], // TR
  "Turkmenistan": [38.9, 59.6], // TM
  "United Arab Emirates": [23.4, 53.8], // AE
  "Uzbekistan": [41.4, 64.6], // UZ
  "Vietnam": [14.1, 108.3], // VN
  "Yemen": [15.6, 48.0], // YE

  // Europe
  "Albania": [41.2, 20.2], // AL
  "Andorra": [42.5, 1.6], // AD
  "Austria": [47.6, 14.6], // AT
  "Belarus": [53.7, 27.9], // BY
  "Belgium": [50.5, 4.5], // BE
  "Bosnia and Herzegovina": [43.9, 17.7], // BA
  "Bulgaria": [42.7, 25.5], // BG
  "Croatia": [45.1, 15.2], // HR
  "Czech Republic": [49.8, 15.5], // CZ
  "Denmark": [56.0, 9.5], // DK
  "Estonia": [58.6, 25.0], // EE
  "Finland": [64.9, 26.0], // FI
  "France": [46.6, 2.5], // FR
  "Germany": [51.2, 10.4], // DE
  "Greece": [39.1, 21.8], // GR
  "Hungary": [47.2, 19.5], // HU
  "Iceland": [64.9, -19.0], // IS
  "Ireland": [53.4, -8.2], // IE
  "Italy": [42.8, 12.6], // IT
  "Kosovo": [42.6, 20.9], // XK
  "Latvia": [56.9, 24.6], // LV
  "Liechtenstein": [47.2, 9.5], // LI
  "Lithuania": [55.2, 23.9], // LT
  "Luxembourg": [49.8, 6.1], // LU
  "Malta": [35.9, 14.4], // MT
  "Moldova": [47.4, 28.4], // MD
  "Monaco": [43.7, 7.4], // MC
  "Montenegro": [42.7, 19.4], // ME
  "Netherlands": [52.1, 5.3], // NL
  "North Macedonia": [41.6, 21.7], // MK
  "Norway": [64.6, 11.0], // NO
  "Poland": [51.9, 19.1], // PL
  "Portugal": [39.6, -8.0], // PT
  "Romania": [45.9, 25.0], // RO
  "Russia": [61.5, 105.3], // RU
  "San Marino": [43.9, 12.5], // SM
  "Serbia": [44.0, 21.0], // RS
  "Slovakia": [48.7, 19.7], // SK
  "Slovenia": [46.1, 14.8], // SI
  "Spain": [40.0, -3.7], // ES
  "Sweden": [62.2, 15.0], // SE
  "Switzerland": [46.8, 8.2], // CH
  "Ukraine": [48.4, 31.2], // UA
  "United Kingdom": [54.0, -2.0], // GB
  "Vatican City": [41.9, 12.45], // VA

  // Oceania
  "Australia": [-25.3, 133.8], // AU
  "Fiji": [-17.7, 178.1], // FJ
  "Kiribati": [1.9, -157.4], // KI
  "Marshall Islands": [7.1, 171.2], // MH
  "Micronesia": [7.4, 150.6], // FM
  "Nauru": [-0.5, 166.9], // NR
  "New Zealand": [-41.0, 174.9], // NZ
  "Palau": [7.5, 134.6], // PW
  "Papua New Guinea": [-6.3, 143.9], // PG
  "Samoa": [-13.8, -172.1], // WS
  "Solomon Islands": [-9.6, 160.2], // SB
  "Tonga": [-21.2, -175.2], // TO
  "Tuvalu": [-7.1, 177.6], // TV
  "Vanuatu": [-15.4, 166.9], // VU
};


/* Total countries used as the denominator for the "% of the world explored"
   stat. 195 = the 193 UN member states + Vatican City + Palestine, which
   matches the country list already in this file. Change this if you'd
   rather count differently (e.g. 193 for UN members only). Territories
   like Aruba/Curaçao/Sint Maarten/Bonaire don't count toward this total
   even if you track them as pins — they're not separate UN-style countries. */
const TOTAL_COUNTRIES = 195;
const TERRITORY_NAMES = new Set([
  "Aruba", "Curacao", "Curaçao", "Sint Maarten", "Bonaire", "Saba", "Sint Eustatius",
]);

function fmt(n, digits = 0) {
  return Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function durationLabel(mins) {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function slugify(str, idx) {
  const base = (str || "trip").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return base || `trip-${idx}`;
}

/* ---------------- Stats ---------------- */

function renderStats() {
  const { countries, hikes, trips, dives } = SITE_DATA;
  const totalKm = hikes.reduce((s, h) => s + (h.distanceKm || 0), 0);
  const totalUp = hikes.reduce((s, h) => s + (h.elevationUp || 0), 0);
  const countedCountries = countries.filter(c => !TERRITORY_NAMES.has(c));
  const percent = Math.min(100, (countedCountries.length / TOTAL_COUNTRIES) * 100);

  document.getElementById("stat-countries").textContent = countries.length;
  document.getElementById("stat-trips").textContent = trips.length;
  document.getElementById("stat-hikes").textContent = hikes.length;
  document.getElementById("stat-dives-home").textContent = (dives || []).length;
  document.getElementById("stat-km").textContent = fmt(totalKm, totalKm < 100 ? 1 : 0);
  document.getElementById("stat-elevation").textContent = fmt(totalUp);
  const pctEl = document.getElementById("stat-percent");
  if (pctEl) pctEl.textContent = fmt(percent, percent < 10 ? 2 : 1) + "%";

  renderWorldProgress(countedCountries.length, percent);
}

function renderWorldProgress(count, percent) {
  const bar = document.getElementById("world-progress-fill");
  const label = document.getElementById("world-progress-label");
  if (bar) bar.style.width = percent.toFixed(2) + "%";
  if (label) label.textContent = `${count} of ${TOTAL_COUNTRIES} countries · ${fmt(percent, percent < 10 ? 2 : 1)}% of the world`;
}

/* ---------------- Map ----------------
   A real, pannable/zoomable OpenStreetMap (via OpenFreeMap's free vector
   tiles + MapLibre GL JS — no API key needed). Pins go on every visited
   country, with a dotted line connecting them in the order they were
   added to data.js. */

let mapInstance = null;

function showMapFallback() {
  const el = document.getElementById("map-fallback");
  if (el) el.classList.add("show");
}
function hideMapFallback() {
  const el = document.getElementById("map-fallback");
  if (el) el.classList.remove("show");
}

function countryPoints() {
  const points = [];
  SITE_DATA.countries.forEach((name) => {
    const coord = COUNTRY_COORDS[name];
    if (coord) points.push({ lng: coord[1], lat: coord[0], name });
  });
  return points;
}

function renderCountryList() {
  const list = document.getElementById("map-country-list");
  if (!list) return;
  list.innerHTML = "";
  SITE_DATA.countries.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    if (!COUNTRY_COORDS[name]) li.classList.add("no-pin");
    list.appendChild(li);
  });
}

function initMap() {
  if (mapInstance || typeof maplibregl === "undefined") {
    if (typeof maplibregl === "undefined") showMapFallback();
    return;
  }

  mapInstance = new maplibregl.Map({
    container: "map-container",
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: [10, 30],
    zoom: 1.1,
    attributionControl: true,
  });
  mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  const loadTimeout = setTimeout(showMapFallback, 8000);
  mapInstance.on("error", (e) => {
    console.error("Map failed to load:", e && e.error);
    showMapFallback();
  });

  mapInstance.on("load", () => {
    clearTimeout(loadTimeout);
    hideMapFallback();
    const points = countryPoints();

    if (points.length > 1) {
      mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: points.map(p => [p.lng, p.lat]) },
        },
      });
      mapInstance.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": "#7CA085",
          "line-width": 1.5,
          "line-dasharray": [1, 2],
          "line-opacity": 0.7,
        },
      });
    }

    points.forEach(p => {
      const el = document.createElement("div");
      el.className = "map-pin-marker";
      new maplibregl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setText(p.name))
        .addTo(mapInstance);
    });

    if (points.length > 0) {
      const bounds = points.reduce(
        (b, p) => b.extend([p.lng, p.lat]),
        new maplibregl.LngLatBounds([points[0].lng, points[0].lat], [points[0].lng, points[0].lat])
      );
      mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 5, duration: 0 });
    } else if (SITE_DATA.countries.length > 0) {
      console.warn("None of your countries matched COUNTRY_COORDS in script.js — add coordinates there to see pins.");
    }
  });
}

function renderMap() {
  renderCountryList();
  // MapLibre needs a sized, visible container to initialise correctly.
  // It's safe to call this repeatedly — it only creates the map once,
  // and route() below calls resize() every time the Map tab is opened.
  if (document.getElementById("map").classList.contains("active")) {
    initMap();
  }
}

/* ---------------- Trips ---------------- */

function renderTrips() {
  const wrap = document.getElementById("trips-grid");
  wrap.innerHTML = "";
  const trips = SITE_DATA.trips
    .map((t, i) => ({ ...t, _index: i }))
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  if (trips.length === 0) {
    wrap.innerHTML = `<p class="empty">No trips added yet — add one in data.js, or import from Polarsteps with import_trips.py.</p>`;
    return;
  }

  trips.forEach(t => {
    const card = document.createElement("a");
    card.className = "trip-card";
    card.href = `#trip/${t._index}`;
    const cover = t.coverImage || (t.images && t.images[0]) || "";
    card.innerHTML = `
      <div class="trip-media" ${cover ? `style="background-image:url('${cover}')"` : ""}>
        ${!cover ? `<span class="trip-media-fallback">${(t.country || "?").slice(0,2).toUpperCase()}</span>` : ""}
      </div>
      <div class="trip-body">
        <span class="trip-year">${t.year || ""}${t.season ? " · " + t.season : ""}</span>
        <h3>${t.title}</h3>
        <span class="trip-country">${t.country || ""}</span>
        <p>${t.description || ""}</p>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function renderTripDetail(index) {
  const t = SITE_DATA.trips[index];
  const wrap = document.getElementById("trip-detail-content");
  if (!t) {
    wrap.innerHTML = `<p class="empty">Trip not found.</p>`;
    return;
  }
  const hasDayByDay = Array.isArray(t.dayByDay) && t.dayByDay.length > 0;
  const flatGallery = [t.coverImage, ...(t.images || [])].filter(Boolean);
  const cover = hasDayByDay
    ? (t.coverImage || t.dayByDay.find(d => d.photos && d.photos.length)?.photos[0] || "")
    : flatGallery[0];

  const stats = [];
  if (t.days) stats.push({ label: "Days", value: t.days });
  if (t.distanceKm) stats.push({ label: "Km covered", value: fmt(t.distanceKm) });
  if (t.country) stats.push({ label: "Where", value: t.country });
  if (t.year) stats.push({ label: "Year", value: t.year });

  let bodyHtml = "";

  if (hasDayByDay) {
    bodyHtml = `
      <h2 class="subhead">Day by day</h2>
      <div class="day-by-day">
        ${t.dayByDay.map((d, i) => `
          <div class="day-block">
            <div class="day-header">
              <span class="day-number">Day ${i + 1}</span>
              <span class="day-date">${d.date && d.date !== "unknown" ? formatDayDate(d.date) : ""}</span>
              ${d.title ? `<h3>${d.title}</h3>` : ""}
            </div>
            ${d.description ? `<p class="day-description">${d.description}</p>` : ""}
            ${(d.photos && d.photos.length) ? `
              <div class="gallery">
                ${d.photos.map(src => `<div class="gallery-img" style="background-image:url('${src}')"></div>`).join("")}
              </div>
            ` : `<p class="empty">No photos for this day.</p>`}
          </div>
        `).join("")}
      </div>
    `;
  } else if (flatGallery.length > 1) {
    bodyHtml = `
      <h2 class="subhead">Photos</h2>
      <div class="gallery">${flatGallery.slice(1).map(src => `<div class="gallery-img" style="background-image:url('${src}')"></div>`).join("")}</div>
    `;
  }

  wrap.innerHTML = `
    <div class="trip-detail-media" ${cover ? `style="background-image:url('${cover}')"` : ""}>
      ${!cover ? `<span class="trip-media-fallback big">${(t.country || "?").slice(0,2).toUpperCase()}</span>` : ""}
    </div>
    <div class="trip-detail-header">
      <span class="trip-year">${t.year || ""}${t.season ? " · " + t.season : ""}</span>
      <h1>${t.title}</h1>
      <span class="trip-country">${t.country || ""}</span>
    </div>
    ${stats.length ? `<div class="stats-strip trip-stats">${stats.map(s => `<div class="stat-cell"><span>${s.value}</span><label>${s.label}</label></div>`).join("")}</div>` : ""}
    <p class="trip-narrative">${t.narrative || t.description || ""}</p>
    ${(t.highlights && t.highlights.length) ? `
      <h2 class="subhead">Highlights</h2>
      <ul class="highlights-list">${t.highlights.map(h => `<li>${h}</li>`).join("")}</ul>
    ` : ""}
    ${bodyHtml}
  `;
}

function formatDayDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/* ---------------- Hikes ---------------- */

function renderHikes() {
  const wrap = document.getElementById("hikes-list");
  wrap.innerHTML = "";
  const hikes = [...SITE_DATA.hikes].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (hikes.length === 0) {
    wrap.innerHTML = `<p class="empty">No hikes yet — run update_hikes.py to pull from Komoot.</p>`;
    return;
  }

  hikes.forEach(h => {
    const row = document.createElement(h.url ? "a" : "div");
    row.className = "hike-row" + (h.url ? " hike-row-link" : "");
    if (h.url) { row.href = h.url; row.target = "_blank"; row.rel = "noopener"; }
    row.innerHTML = `
      <div class="hike-main">
        <h3>${h.name}</h3>
        <span class="hike-meta">${h.date || ""}${h.country ? " · " + h.country : ""}</span>
      </div>
      <div class="hike-stats">
        <div><span>${fmt(h.distanceKm, 1)}</span><label>km</label></div>
        <div><span>${fmt(h.elevationUp)}</span><label>m ↑</label></div>
        <div><span>${fmt(h.elevationDown)}</span><label>m ↓</label></div>
        <div><span>${durationLabel(h.durationMin)}</span><label>time</label></div>
      </div>
      ${h.url ? `<span class="hike-open">Open in Komoot ↗</span>` : ""}
    `;
    wrap.appendChild(row);
  });
}

/* ---------------- Dives ---------------- */

function renderDives() {
  const wrap = document.getElementById("dives-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  const dives = [...(SITE_DATA.dives || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalDives = dives.length;
  const maxDepth = dives.reduce((m, d) => Math.max(m, d.depthM || 0), 0);
  const totalMin = dives.reduce((s, d) => s + (d.durationMin || 0), 0);
  const avgTemp = dives.length ? dives.reduce((s, d) => s + (d.waterTempC || 0), 0) / dives.filter(d => d.waterTempC).length : 0;

  const statDives = document.getElementById("stat-dives");
  const statMaxDepth = document.getElementById("stat-max-depth");
  const statDiveTime = document.getElementById("stat-dive-time");
  const statAvgTemp = document.getElementById("stat-avg-temp");
  if (statDives) statDives.textContent = totalDives;
  if (statMaxDepth) statMaxDepth.textContent = fmt(maxDepth, 1);
  if (statDiveTime) statDiveTime.textContent = fmt(totalMin / 60, totalMin < 6000 ? 1 : 0);
  if (statAvgTemp) statAvgTemp.textContent = avgTemp ? fmt(avgTemp, 1) : "—";

  if (dives.length === 0) {
    wrap.innerHTML = `<p class="empty">No dives yet — run update_dives.py to pull from your spreadsheet.</p>`;
    return;
  }

  const hasVisibility = dives.some(d => d.visibilityM);

  dives.forEach(d => {
    const row = document.createElement("article");
    row.className = "dive-row";
    row.innerHTML = `
      <div class="dive-main">
        <h3>${d.site || "Untitled dive site"}</h3>
        <span class="dive-meta">${d.date || "Date unknown"}${d.location ? " · " + d.location : ""}${d.buddy ? " · with " + d.buddy : ""}</span>
        ${d.notes ? `<p class="dive-notes">${d.notes}</p>` : ""}
      </div>
      <div class="dive-stats">
        <div><span>${d.depthM ? fmt(d.depthM, 1) : "—"}</span><label>m depth</label></div>
        <div><span>${d.durationMin ? fmt(d.durationMin) : "—"}</span><label>min</label></div>
        <div><span>${d.waterTempC ? fmt(d.waterTempC, 1) + "°" : "—"}</span><label>water</label></div>
        ${hasVisibility ? `<div><span>${d.visibilityM ? fmt(d.visibilityM) : "—"}</span><label>m vis</label></div>` : ""}
      </div>
    `;
    wrap.appendChild(row);
  });
}

/* ---------------- Router ---------------- */

const STATIC_SECTIONS = ["home", "map", "trips", "hikes", "dives", "contact"];

function showSection(id) {
  document.querySelectorAll(".page-section").forEach(s => s.classList.toggle("active", s.id === id));
  document.querySelectorAll(".nav-link").forEach(l => l.classList.toggle("active", l.dataset.target === id));
  window.scrollTo({ top: 0 });
}

function route() {
  const hash = location.hash.replace("#", "");
  if (hash.startsWith("trip/")) {
    const idx = parseInt(hash.split("/")[1], 10);
    renderTripDetail(idx);
    showSection("trip-detail");
  } else if (STATIC_SECTIONS.includes(hash)) {
    showSection(hash);
  } else {
    showSection("home");
  }

  if (hash === "map") {
    initMap();
    // container was hidden (display:none) until just now, so MapLibre
    // needs a resize once it has real dimensions to measure.
    setTimeout(() => { if (mapInstance) mapInstance.resize(); }, 0);
  }
}

/* ---------------- Contact form ----------------
   Sends the message straight to a Discord channel via a webhook —
   no backend needed. IMPORTANT: read the note in README.md about
   what this does and doesn't protect against before relying on it —
   a webhook URL embedded in a static site's JS is visible to anyone
   who looks, since there's no server to hide it behind. */

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1539478420403126323/WUD6gJcBeUt8jXSdocQlqW1Xu-XwSbljpTGOFWVE97QUtodSFoqU2f0043VSf3quIL6s"; // paste your Discord webhook URL here — see README.md

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("contact-status");
    const submitBtn = document.getElementById("contact-submit");
    statusEl.textContent = "";
    statusEl.className = "contact-status";

    // Honeypot: if this hidden field got filled in, silently drop it
    // (real visitors never see or touch it; bots that auto-fill do).
    if (form.elements["website"].value.trim() !== "") {
      statusEl.textContent = "Thanks — message sent.";
      statusEl.classList.add("ok");
      form.reset();
      return;
    }

    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    const message = form.elements["message"].value.trim();

    if (!DISCORD_WEBHOOK_URL) {
      statusEl.textContent = "This form isn't set up yet — add a Discord webhook URL in script.js.";
      statusEl.classList.add("error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "New contact form message",
            color: 0xE8A33D,
            fields: [
              { name: "Name", value: name || "(not given)", inline: true },
              { name: "Email", value: email || "(not given)", inline: true },
              { name: "Message", value: message.slice(0, 1000) },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      });

      if (res.ok || res.status === 204) {
        statusEl.textContent = "Thanks — message sent.";
        statusEl.classList.add("ok");
        form.reset();
      } else {
        throw new Error("Discord responded with " + res.status);
      }
    } catch (err) {
      console.error("Contact form send failed:", err);
      statusEl.textContent = "Something went wrong sending that — try again in a moment.";
      statusEl.classList.add("error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
}

/* ---------------- Init ---------------- */

async function loadSiteData() {
  const res = await fetch("data.json");
  if (!res.ok) throw new Error("Couldn't load data.json (" + res.status + ")");
  return res.json();
}

async function initSite() {
  const loaderStart = Date.now();
  const MIN_LOADER_MS = 5000;

  try {
    SITE_DATA = await loadSiteData();
  } catch (err) {
    console.error("Failed to load data.json:", err);
    document.body.innerHTML = `
      <div style="max-width:520px; margin:80px auto; padding:24px; font-family:monospace; color:#8B948D; text-align:center;">
        <p>Couldn't load data.json.</p>
        <p style="font-size:0.85em;">If you're viewing this file directly (file://), browsers block that for security reasons.
        Run a local server instead — e.g. <code>python3 -m http.server</code> in this folder, then open
        <code>http://localhost:8000</code>. This works automatically once hosted on GitHub Pages.</p>
      </div>`;
    return;
  }

  document.getElementById("wm-name").textContent = SITE_DATA.profile?.name ? SITE_DATA.profile.name + "'s Log" : "Field Log";
  if (SITE_DATA.profile?.tagline) document.getElementById("hero-tagline").textContent = SITE_DATA.profile.tagline;

  renderStats();
  renderMap();
  renderTrips();
  renderHikes();
  renderDives();
  initContactForm();

  window.addEventListener("hashchange", route);
  route();

  // Keep the loader up for at least MIN_LOADER_MS total, even if data
  // loaded faster than that — then fade it out.
  const elapsed = Date.now() - loaderStart;
  const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
  setTimeout(hideLoader, remaining);
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.add("hidden");
  setTimeout(() => loader.remove(), 600);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite);
} else {
  initSite();
}
