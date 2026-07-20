/* ============================================================
   Country centroid lookup (lat, lng) for placing map pins.
   Covers ~110 commonly-visited countries. If a country in your
   data.js list isn't showing a pin, add it here — just find its
   rough centroid coordinates and add a line in the same format.
   ============================================================ */
const COUNTRY_COORDS = {
  "Netherlands": [52.1, 5.3], "Belgium": [50.5, 4.5], "Germany": [51.2, 10.4],
  "France": [46.6, 2.5], "Italy": [42.8, 12.6], "Switzerland": [46.8, 8.2],
  "Austria": [47.6, 14.6], "Spain": [40.0, -3.7], "Portugal": [39.6, -8.0],
  "United Kingdom": [54.0, -2.0], "Ireland": [53.4, -8.2], "Norway": [64.6, 11.0],
  "Sweden": [62.2, 15.0], "Denmark": [56.0, 9.5], "Finland": [64.9, 26.0],
  "Iceland": [64.9, -19.0], "Poland": [51.9, 19.1], "Czech Republic": [49.8, 15.5],
  "Slovakia": [48.7, 19.7], "Hungary": [47.2, 19.5], "Slovenia": [46.1, 14.8],
  "Croatia": [45.1, 15.2], "Greece": [39.1, 21.8], "Turkey": [38.9, 35.2],
  "Estonia": [58.6, 25.0], "Latvia": [56.9, 24.6], "Lithuania": [55.2, 23.9],
  "Romania": [45.9, 25.0], "Bulgaria": [42.7, 25.5], "Serbia": [44.0, 21.0],
  "Bosnia and Herzegovina": [43.9, 17.7], "Montenegro": [42.7, 19.4],
  "Albania": [41.2, 20.2], "North Macedonia": [41.6, 21.7], "Ukraine": [48.4, 31.2],
  "Russia": [61.5, 105.3], "Malta": [35.9, 14.4], "Cyprus": [35.1, 33.4],
  "Luxembourg": [49.8, 6.1], "Morocco": [31.8, -7.1], "Egypt": [26.8, 30.8],
  "South Africa": [-30.6, 22.9], "Kenya": [-0.0, 37.9], "Tanzania": [-6.4, 34.9],
  "Namibia": [-22.9, 18.5], "Ghana": [7.9, -1.0], "Nigeria": [9.1, 8.7],
  "United States": [39.8, -98.6], "USA": [39.8, -98.6], "Canada": [56.1, -106.3],
  "Mexico": [23.6, -102.6], "Cuba": [21.5, -77.8], "Costa Rica": [9.7, -83.8],
  "Panama": [8.5, -80.8], "Colombia": [4.6, -74.3], "Peru": [-9.2, -75.0],
  "Brazil": [-14.2, -51.9], "Argentina": [-38.4, -63.6], "Chile": [-35.7, -71.5],
  "Bolivia": [-16.3, -63.6], "Ecuador": [-1.8, -78.2],
  "China": [35.9, 104.2], "Japan": [36.2, 138.3], "South Korea": [35.9, 127.8],
  "Thailand": [15.9, 100.9], "Vietnam": [14.1, 108.3], "Cambodia": [12.6, 104.9],
  "Laos": [19.9, 102.5], "Myanmar": [21.9, 95.9], "Malaysia": [4.2, 101.9],
  "Singapore": [1.35, 103.8], "Indonesia": [-0.8, 113.9], "Philippines": [12.9, 121.8],
  "India": [20.6, 78.9], "Nepal": [28.4, 84.1], "Sri Lanka": [7.9, 80.7],
  "Bhutan": [27.5, 90.4], "Pakistan": [30.4, 69.3], "Bangladesh": [23.7, 90.4],
  "Mongolia": [46.9, 103.8], "Kazakhstan": [48.0, 66.9], "Georgia": [42.3, 43.4],
  "Armenia": [40.1, 45.0], "Jordan": [30.6, 36.2], "Israel": [31.0, 34.9],
  "United Arab Emirates": [23.4, 53.8], "Oman": [21.5, 55.9], "Qatar": [25.4, 51.2],
  "Saudi Arabia": [23.9, 45.1], "Australia": [-25.3, 133.8], "New Zealand": [-41.0, 174.9],
  "Fiji": [-17.7, 178.1], "Greenland": [71.7, -42.6], "Faroe Islands": [62.0, -6.8],
};

/* Rough, stylised continent silhouettes for map context (abstract, not
   survey-accurate coastlines — just enough for pins to read as a world map). */
const CONTINENT_PATHS = [
  // North America
  "M95,70 C130,55 175,55 205,75 C230,90 235,120 220,150 C230,175 215,200 190,205 C175,225 150,235 130,220 C105,225 80,205 75,175 C55,160 55,130 75,105 C70,90 80,78 95,70 Z",
  // South America
  "M235,255 C255,245 275,255 280,280 C295,300 290,330 280,360 C285,390 270,415 250,420 C240,400 230,375 235,350 C220,330 220,300 230,275 C225,265 228,258 235,255 Z",
  // Europe
  "M455,70 C480,60 510,65 525,80 C540,90 535,110 520,120 C525,135 505,145 485,138 C465,145 448,130 450,110 C440,95 445,78 455,70 Z",
  // Africa
  "M460,150 C490,140 525,148 540,170 C555,195 550,230 535,260 C540,290 520,330 495,345 C480,320 470,290 468,260 C450,235 448,200 460,175 C452,165 452,157 460,150 Z",
  // Asia
  "M560,55 C620,40 700,45 760,65 C820,75 870,90 895,115 C905,140 880,160 850,155 C830,175 795,180 770,165 C740,180 700,175 675,155 C640,165 605,150 585,125 C565,110 555,80 560,55 Z",
  // Australia
  "M785,340 C815,330 850,335 870,355 C885,370 880,390 860,398 C835,410 805,405 788,388 C775,375 775,352 785,340 Z",
];

/* Equirectangular projection onto the 1000x500 map viewBox */
function project(lat, lng) {
  const x = (lng + 180) / 360 * 1000;
  const y = (90 - lat) / 180 * 500;
  return [x, y];
}

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
  const { countries, hikes, trips } = SITE_DATA;
  const totalKm = hikes.reduce((s, h) => s + (h.distanceKm || 0), 0);
  const totalUp = hikes.reduce((s, h) => s + (h.elevationUp || 0), 0);

  document.getElementById("stat-countries").textContent = countries.length;
  document.getElementById("stat-trips").textContent = trips.length;
  document.getElementById("stat-hikes").textContent = hikes.length;
  document.getElementById("stat-km").textContent = fmt(totalKm, totalKm < 100 ? 1 : 0);
  document.getElementById("stat-elevation").textContent = fmt(totalUp);
}

/* ---------------- Map ----------------
   Renders one map instance into the given element ids. Called once
   per map on the page (currently just the one on the Map section) —
   call it again with different ids if you add another map elsewhere. */

function renderMapInto(svgId, listId) {
  const svg = document.getElementById(svgId);
  const list = document.getElementById(listId);
  if (!svg) return;
  svg.innerHTML = "";
  if (list) list.innerHTML = "";

  // continents (background context)
  const landG = document.createElementNS("http://www.w3.org/2000/svg", "g");
  landG.setAttribute("class", "landmass");
  CONTINENT_PATHS.forEach(d => {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("class", "continent");
    landG.appendChild(p);
  });
  svg.appendChild(landG);

  // graticule
  const grid = document.createElementNS("http://www.w3.org/2000/svg", "g");
  grid.setAttribute("class", "graticule");
  for (let x = 0; x <= 1000; x += 100) grid.appendChild(makeLine(x, 0, x, 500));
  for (let y = 0; y <= 500; y += 100) grid.appendChild(makeLine(0, y, 1000, y));
  svg.appendChild(grid);

  const points = [];
  SITE_DATA.countries.forEach((name) => {
    const coord = COUNTRY_COORDS[name];
    if (list) {
      const li = document.createElement("li");
      li.textContent = name;
      if (!coord) li.classList.add("no-pin");
      list.appendChild(li);
    }
    if (!coord) return;
    const [x, y] = project(coord[0], coord[1]);
    points.push({ x, y, name });
  });

  if (points.length > 1) {
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "route-line");
    svg.appendChild(path);
  }

  const pinsG = document.createElementNS("http://www.w3.org/2000/svg", "g");
  points.forEach((p, i) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "pin");
    g.setAttribute("transform", `translate(${p.x},${p.y})`);
    g.style.animationDelay = `${i * 60}ms`;

    const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("class", "pin-halo");
    halo.setAttribute("r", "7");

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("class", "pin-dot");
    dot.setAttribute("r", "2.6");

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = p.name;

    g.appendChild(halo);
    g.appendChild(dot);
    g.appendChild(title);
    pinsG.appendChild(g);
  });
  svg.appendChild(pinsG);

  if (points.length === 0 && SITE_DATA.countries.length > 0) {
    // helpful console note rather than a silent blank map
    console.warn("None of your countries matched COUNTRY_COORDS in script.js — add coordinates there to see pins.");
  }
}

function makeLine(x1, y1, x2, y2) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1); line.setAttribute("y1", y1);
  line.setAttribute("x2", x2); line.setAttribute("y2", y2);
  return line;
}

function renderMap() {
  renderMapInto("map-svg", "map-country-list");
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
  const gallery = [t.coverImage, ...(t.images || [])].filter(Boolean);
  const stats = [];
  if (t.days) stats.push({ label: "Days", value: t.days });
  if (t.distanceKm) stats.push({ label: "Km covered", value: fmt(t.distanceKm) });
  if (t.country) stats.push({ label: "Where", value: t.country });
  if (t.year) stats.push({ label: "Year", value: t.year });

  wrap.innerHTML = `
    <div class="trip-detail-media" ${gallery[0] ? `style="background-image:url('${gallery[0]}')"` : ""}>
      ${!gallery[0] ? `<span class="trip-media-fallback big">${(t.country || "?").slice(0,2).toUpperCase()}</span>` : ""}
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
    ${gallery.length > 1 ? `
      <h2 class="subhead">Photos</h2>
      <div class="gallery">${gallery.slice(1).map(src => `<div class="gallery-img" style="background-image:url('${src}')"></div>`).join("")}</div>
    ` : ""}
  `;
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

/* ---------------- Router ---------------- */

const STATIC_SECTIONS = ["home", "map", "trips", "hikes"];

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
}

/* ---------------- Init ---------------- */

function initSite() {
  document.getElementById("wm-name").textContent = SITE_DATA.profile?.name ? SITE_DATA.profile.name + "'s Log" : "Field Log";
  if (SITE_DATA.profile?.tagline) document.getElementById("hero-tagline").textContent = SITE_DATA.profile.tagline;

  renderStats();
  renderMap();
  renderTrips();
  renderHikes();

  window.addEventListener("hashchange", route);
  route();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSite);
} else {
  initSite();
}
