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

/* Equirectangular projection onto the 1000x500 map viewBox */
function project(lat, lng) {
  const x = (lng + 180) / 360 * 1000;
  const y = (90 - lat) / 180 * 500;
  return [x, y];
}

function fmt(n, digits = 0) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function durationLabel(mins) {
  if (!mins && mins !== 0) return "—";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ---------------- Rendering ---------------- */

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

function renderMap() {
  const svg = document.getElementById("map-pins");
  const list = document.getElementById("map-country-list");
  svg.innerHTML = "";
  list.innerHTML = "";

  const points = [];
  SITE_DATA.countries.forEach((name, i) => {
    const coord = COUNTRY_COORDS[name];
    const li = document.createElement("li");
    li.textContent = name;
    if (!coord) li.classList.add("no-pin");
    list.appendChild(li);
    if (!coord) return;
    const [x, y] = project(coord[0], coord[1]);
    points.push({ x, y, name });
  });

  // connecting dotted path, in the order countries were added
  if (points.length > 1) {
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "route-line");
    svg.appendChild(path);
  }

  points.forEach((p, i) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "pin");
    g.setAttribute("transform", `translate(${p.x},${p.y})`);
    g.style.animationDelay = `${i * 60}ms`;
    g.innerHTML = `
      <circle class="pin-halo" r="7"></circle>
      <circle class="pin-dot" r="2.6"></circle>
      <title>${p.name}</title>
    `;
    svg.appendChild(g);
  });
}

function renderTrips() {
  const wrap = document.getElementById("trips-grid");
  wrap.innerHTML = "";
  const trips = [...SITE_DATA.trips].sort((a, b) => b.year - a.year);

  if (trips.length === 0) {
    wrap.innerHTML = `<p class="empty">No trips added yet — add one in data.js.</p>`;
    return;
  }

  trips.forEach(t => {
    const card = document.createElement("article");
    card.className = "trip-card";
    card.innerHTML = `
      <div class="trip-media" ${t.image ? `style="background-image:url('${t.image}')"` : ""}>
        ${!t.image ? `<span class="trip-media-fallback">${(t.country || "?").slice(0,2).toUpperCase()}</span>` : ""}
      </div>
      <div class="trip-body">
        <span class="trip-year">${t.year || ""} · ${t.season || ""}</span>
        <h3>${t.title}</h3>
        <span class="trip-country">${t.country}</span>
        <p>${t.description || ""}</p>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function renderHikes() {
  const wrap = document.getElementById("hikes-list");
  wrap.innerHTML = "";
  const hikes = [...SITE_DATA.hikes].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (hikes.length === 0) {
    wrap.innerHTML = `<p class="empty">No hikes yet — run update_hikes.py to pull from Komoot.</p>`;
    return;
  }

  hikes.forEach(h => {
    const row = document.createElement("article");
    row.className = "hike-row";
    row.innerHTML = `
      <div class="hike-main">
        <h3>${h.url ? `<a href="${h.url}" target="_blank" rel="noopener">${h.name}</a>` : h.name}</h3>
        <span class="hike-meta">${h.date || ""}${h.country ? " · " + h.country : ""}</span>
      </div>
      <div class="hike-stats">
        <div><span>${fmt(h.distanceKm, 1)}</span><label>km</label></div>
        <div><span>${fmt(h.elevationUp)}</span><label>m ↑</label></div>
        <div><span>${fmt(h.elevationDown)}</span><label>m ↓</label></div>
        <div><span>${durationLabel(h.durationMin)}</span><label>time</label></div>
      </div>
    `;
    wrap.appendChild(row);
  });
}

/* ---------------- Nav ---------------- */

function initNav() {
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".page-section");

  function show(id) {
    sections.forEach(s => s.classList.toggle("active", s.id === id));
    links.forEach(l => l.classList.toggle("active", l.dataset.target === id));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  links.forEach(l => {
    l.addEventListener("click", (e) => {
      e.preventDefault();
      show(l.dataset.target);
      history.replaceState(null, "", "#" + l.dataset.target);
    });
  });

  const initial = location.hash.replace("#", "") || "home";
  show(document.getElementById(initial) ? initial : "home");
}

/* ---------------- Init ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  renderStats();
  renderMap();
  renderTrips();
  renderHikes();
  initNav();
});
