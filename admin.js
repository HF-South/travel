/* ============================================================
   Admin panel logic.
   ------------------------------------------------------------
   Reads/writes data.json in your GitHub repo directly via
   GitHub's REST API, using a personal access token you paste in
   once. The token lives only in this browser's localStorage —
   it is never written to any file or committed anywhere.
   ============================================================ */

const LS_KEYS = {
  owner: "admin_gh_owner",
  repo: "admin_gh_repo",
  branch: "admin_gh_branch",
  token: "admin_gh_token",
};

let ghConfig = null;   // { owner, repo, branch, token }
let siteData = null;   // the full data.json content, in memory
let currentSha = null; // needed to commit an update
let editingTripIndex = null;
let editingHikeIndex = null;
let editingDiveIndex = null;

/* ---------------- GitHub API helpers ---------------- */

function apiHeaders() {
  return {
    "Authorization": "Bearer " + ghConfig.token,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function contentsUrl() {
  return `https://api.github.com/repos/${ghConfig.owner}/${ghConfig.repo}/contents/data.json`;
}

function utf8ToBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode("0x" + p1)));
}

function base64ToUtf8(str) {
  const cleaned = str.replace(/\n/g, "");
  return decodeURIComponent(atob(cleaned).split("").map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""));
}

async function fetchSiteData() {
  const res = await fetch(`${contentsUrl()}?ref=${encodeURIComponent(ghConfig.branch)}`, {
    headers: apiHeaders(),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Couldn't find data.json in that repo/branch. Check the repo name and branch.");
    if (res.status === 401 || res.status === 403) throw new Error("GitHub rejected that token. Check it's valid and has Contents: Read and write on this repo.");
    throw new Error(`GitHub API error (${res.status})`);
  }
  const json = await res.json();
  currentSha = json.sha;
  return JSON.parse(base64ToUtf8(json.content));
}

async function saveSiteData() {
  const content = JSON.stringify(siteData, null, 2) + "\n";
  const res = await fetch(contentsUrl(), {
    method: "PUT",
    headers: { ...apiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Update site data via admin panel",
      content: utf8ToBase64(content),
      sha: currentSha,
      branch: ghConfig.branch,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API error (${res.status})`);
  }
  const json = await res.json();
  currentSha = json.content.sha;
}

/* ---------------- Setup / connect ---------------- */

function loadStoredConfig() {
  const owner = localStorage.getItem(LS_KEYS.owner);
  const repo = localStorage.getItem(LS_KEYS.repo);
  const branch = localStorage.getItem(LS_KEYS.branch) || "main";
  const token = localStorage.getItem(LS_KEYS.token);
  if (owner && repo && token) return { owner, repo, branch, token };
  return null;
}

function storeConfig(config) {
  localStorage.setItem(LS_KEYS.owner, config.owner);
  localStorage.setItem(LS_KEYS.repo, config.repo);
  localStorage.setItem(LS_KEYS.branch, config.branch);
  localStorage.setItem(LS_KEYS.token, config.token);
}

function clearStoredConfig() {
  Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
}

async function connect(config) {
  ghConfig = config;
  siteData = await fetchSiteData();
  storeConfig(config);
  document.getElementById("setup-panel").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";
  renderAll();
}

document.getElementById("connect-btn").addEventListener("click", async () => {
  const config = {
    owner: document.getElementById("gh-owner").value.trim(),
    repo: document.getElementById("gh-repo").value.trim(),
    branch: document.getElementById("gh-branch").value.trim() || "main",
    token: document.getElementById("gh-token").value.trim(),
  };
  const statusEl = document.getElementById("setup-status");
  if (!config.owner || !config.repo || !config.token) {
    statusEl.textContent = "Fill in owner, repo, and token.";
    return;
  }
  statusEl.textContent = "Connecting…";
  try {
    await connect(config);
  } catch (err) {
    statusEl.textContent = err.message;
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  clearStoredConfig();
  location.reload();
});

/* ---------------- Tabs ---------------- */

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + btn.dataset.tab));
  });
});

/* ---------------- Render ---------------- */

function renderAll() {
  siteData.diveSites = siteData.diveSites || [];
  renderCountries();
  renderTrips();
  renderHikes();
  renderDives();
  renderDiveSitesList();
  populateDiveSiteDropdown();
}

function renderCountries() {
  const wrap = document.getElementById("countries-list");
  wrap.innerHTML = "";
  siteData.countries.forEach((name, i) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `<span>${name}</span><div class="actions"><button class="danger" data-i="${i}">Remove</button></div>`;
    row.querySelector("button").addEventListener("click", () => {
      siteData.countries.splice(i, 1);
      renderCountries();
    });
    wrap.appendChild(row);
  });
}

document.getElementById("add-country-btn").addEventListener("click", () => {
  const input = document.getElementById("new-country");
  const name = input.value.trim();
  if (!name) return;
  if (siteData.countries.includes(name)) { input.value = ""; return; }
  siteData.countries.push(name);
  input.value = "";
  renderCountries();
});

function sourceLabel(source) {
  if (!source || source === "manual") return "";
  return `<span class="pill synced">${source}</span>`;
}

function renderTrips() {
  const wrap = document.getElementById("trips-list");
  wrap.innerHTML = "";
  siteData.trips.forEach((t, i) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div><strong>${t.title}</strong> ${sourceLabel(t.source)}<div class="meta">${t.year || ""} ${t.country ? "· " + t.country : ""}</div></div>
      <div class="actions">
        <button data-action="edit">Edit</button>
        <button class="danger" data-action="delete">Remove</button>
      </div>`;
    row.querySelector('[data-action="edit"]').addEventListener("click", () => startEditTrip(i));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      siteData.trips.splice(i, 1);
      renderTrips();
    });
    wrap.appendChild(row);
  });
}

function startEditTrip(i) {
  editingTripIndex = i;
  const t = siteData.trips[i];
  document.getElementById("trip-form-title").textContent = "Edit trip";
  document.getElementById("trip-title").value = t.title || "";
  document.getElementById("trip-country").value = t.country || "";
  document.getElementById("trip-year").value = t.year || "";
  document.getElementById("trip-season").value = t.season || "";
  document.getElementById("trip-description").value = t.description || "";
  document.getElementById("trip-narrative").value = t.narrative || "";
  document.getElementById("trip-cover").value = t.coverImage || "";
  document.getElementById("trip-distance").value = t.distanceKm || "";
  document.getElementById("trip-days").value = t.days || "";
  document.getElementById("trip-highlights").value = (t.highlights || []).join("\n");
  document.getElementById("trip-images").value = (t.images || []).join("\n");
  document.getElementById("save-trip-btn").textContent = "Save changes";
  document.getElementById("cancel-trip-edit-btn").style.display = "inline-block";
}

function resetTripForm() {
  editingTripIndex = null;
  ["trip-title", "trip-country", "trip-year", "trip-season", "trip-description",
   "trip-narrative", "trip-cover", "trip-distance", "trip-days", "trip-highlights", "trip-images"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("trip-form-title").textContent = "Add a trip";
  document.getElementById("save-trip-btn").textContent = "Add trip";
  document.getElementById("cancel-trip-edit-btn").style.display = "none";
}

document.getElementById("cancel-trip-edit-btn").addEventListener("click", resetTripForm);

document.getElementById("save-trip-btn").addEventListener("click", () => {
  const title = document.getElementById("trip-title").value.trim();
  if (!title) { alert("Title is required."); return; }

  const entry = {
    title,
    country: document.getElementById("trip-country").value.trim(),
    year: parseInt(document.getElementById("trip-year").value) || 0,
    season: document.getElementById("trip-season").value.trim(),
    description: document.getElementById("trip-description").value.trim(),
    narrative: document.getElementById("trip-narrative").value.trim(),
    coverImage: document.getElementById("trip-cover").value.trim(),
    images: document.getElementById("trip-images").value.split("\n").map(s => s.trim()).filter(Boolean),
    highlights: document.getElementById("trip-highlights").value.split("\n").map(s => s.trim()).filter(Boolean),
    distanceKm: parseFloat(document.getElementById("trip-distance").value) || 0,
    days: parseInt(document.getElementById("trip-days").value) || 0,
    source: "manual",
  };

  if (editingTripIndex !== null) {
    // preserve fields the form doesn't expose (e.g. dayByDay from a Polarsteps import)
    entry.dayByDay = siteData.trips[editingTripIndex].dayByDay;
    entry.source = siteData.trips[editingTripIndex].source || "manual";
    siteData.trips[editingTripIndex] = entry;
  } else {
    siteData.trips.push(entry);
  }
  resetTripForm();
  renderTrips();
});

function renderHikes() {
  const wrap = document.getElementById("hikes-list");
  wrap.innerHTML = "";
  siteData.hikes.forEach((h, i) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div><strong>${h.name}</strong> ${sourceLabel(h.source)}<div class="meta">${h.date || ""} · ${h.distanceKm || 0} km</div></div>
      <div class="actions">
        <button data-action="edit">Edit</button>
        <button class="danger" data-action="delete">Remove</button>
      </div>`;
    row.querySelector('[data-action="edit"]').addEventListener("click", () => startEditHike(i));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      siteData.hikes.splice(i, 1);
      renderHikes();
    });
    wrap.appendChild(row);
  });
}

function startEditHike(i) {
  editingHikeIndex = i;
  const h = siteData.hikes[i];
  document.getElementById("hike-form-title").textContent = "Edit hike";
  document.getElementById("hike-name").value = h.name || "";
  document.getElementById("hike-date").value = h.date || "";
  document.getElementById("hike-distance").value = h.distanceKm || "";
  document.getElementById("hike-country").value = h.country || "";
  document.getElementById("hike-up").value = h.elevationUp || "";
  document.getElementById("hike-down").value = h.elevationDown || "";
  document.getElementById("hike-duration").value = h.durationMin || "";
  document.getElementById("hike-url").value = h.url || "";
  document.getElementById("save-hike-btn").textContent = "Save changes";
  document.getElementById("cancel-hike-edit-btn").style.display = "inline-block";
}

function resetHikeForm() {
  editingHikeIndex = null;
  ["hike-name", "hike-date", "hike-distance", "hike-country", "hike-up", "hike-down", "hike-duration", "hike-url"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("hike-form-title").textContent = "Add a hike";
  document.getElementById("save-hike-btn").textContent = "Add hike";
  document.getElementById("cancel-hike-edit-btn").style.display = "none";
}

document.getElementById("cancel-hike-edit-btn").addEventListener("click", resetHikeForm);

document.getElementById("save-hike-btn").addEventListener("click", () => {
  const name = document.getElementById("hike-name").value.trim();
  if (!name) { alert("Name is required."); return; }

  const entry = {
    name,
    date: document.getElementById("hike-date").value,
    distanceKm: parseFloat(document.getElementById("hike-distance").value) || 0,
    country: document.getElementById("hike-country").value.trim(),
    elevationUp: parseInt(document.getElementById("hike-up").value) || 0,
    elevationDown: parseInt(document.getElementById("hike-down").value) || 0,
    durationMin: parseInt(document.getElementById("hike-duration").value) || 0,
    url: document.getElementById("hike-url").value.trim(),
    source: "manual",
  };

  if (editingHikeIndex !== null) {
    entry.source = siteData.hikes[editingHikeIndex].source || "manual";
    siteData.hikes[editingHikeIndex] = entry;
  } else {
    siteData.hikes.push(entry);
  }
  resetHikeForm();
  renderHikes();
});

function renderDives() {
  const wrap = document.getElementById("dives-list");
  wrap.innerHTML = "";
  siteData.dives.forEach((d, i) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div><strong>${d.site || "Untitled dive"}</strong> ${sourceLabel(d.source)}<div class="meta">${d.date || ""} ${d.location ? "· " + d.location : ""}</div></div>
      <div class="actions">
        <button data-action="edit">Edit</button>
        <button class="danger" data-action="delete">Remove</button>
      </div>`;
    row.querySelector('[data-action="edit"]').addEventListener("click", () => startEditDive(i));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      siteData.dives.splice(i, 1);
      renderDives();
    });
    wrap.appendChild(row);
  });
}

function startEditDive(i) {
  editingDiveIndex = i;
  const d = siteData.dives[i];
  document.getElementById("dive-form-title").textContent = "Edit dive";
  document.getElementById("dive-date").value = d.date || "";
  document.getElementById("dive-location").value = d.location || "";
  document.getElementById("dive-site").value = d.site || "";
  document.getElementById("dive-buddy").value = d.buddy || "";
  document.getElementById("dive-depth").value = d.depthM || "";
  document.getElementById("dive-duration").value = d.durationMin || "";
  document.getElementById("dive-temp").value = d.waterTempC || "";
  document.getElementById("dive-vis").value = d.visibilityM || "";
  document.getElementById("dive-notes").value = d.notes || "";
  document.getElementById("dive-siteid").value = d.siteId || "";
  document.getElementById("save-dive-btn").textContent = "Save changes";
  document.getElementById("cancel-dive-edit-btn").style.display = "inline-block";
}

function resetDiveForm() {
  editingDiveIndex = null;
  ["dive-date", "dive-location", "dive-site", "dive-buddy", "dive-depth", "dive-duration", "dive-temp", "dive-vis", "dive-notes"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("dive-siteid").value = "";
  document.getElementById("dive-form-title").textContent = "Add a dive";
  document.getElementById("save-dive-btn").textContent = "Add dive";
  document.getElementById("cancel-dive-edit-btn").style.display = "none";
}

document.getElementById("cancel-dive-edit-btn").addEventListener("click", resetDiveForm);

document.getElementById("save-dive-btn").addEventListener("click", () => {
  const site = document.getElementById("dive-site").value.trim();
  const date = document.getElementById("dive-date").value;
  if (!site && !date) { alert("At least a site or date is needed."); return; }

  const entry = {
    date,
    location: document.getElementById("dive-location").value.trim(),
    site,
    depthM: parseFloat(document.getElementById("dive-depth").value) || 0,
    durationMin: parseInt(document.getElementById("dive-duration").value) || 0,
    waterTempC: parseFloat(document.getElementById("dive-temp").value) || 0,
    visibilityM: parseFloat(document.getElementById("dive-vis").value) || 0,
    buddy: document.getElementById("dive-buddy").value.trim(),
    notes: document.getElementById("dive-notes").value.trim(),
    siteId: document.getElementById("dive-siteid").value || null,
    source: "manual",
  };

  if (editingDiveIndex !== null) {
    entry.source = siteData.dives[editingDiveIndex].source || "manual";
    siteData.dives[editingDiveIndex] = entry;
  } else {
    siteData.dives.push(entry);
  }
  resetDiveForm();
  renderDives();
});

/* ---------------- Dive Map (admin) ---------------- */

let adminDiveMapInstance = null;
let adminDiveMapMarkers = {}; // siteId -> maplibregl.Marker

function slugifyName(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeSiteId(name) {
  const base = slugifyName(name) || "site";
  let id = base, n = 1;
  const existing = new Set((siteData.diveSites || []).map(s => s.id));
  while (existing.has(id)) { id = `${base}-${++n}`; }
  return id;
}

function initAdminDiveMap() {
  if (adminDiveMapInstance || typeof maplibregl === "undefined") return;

  adminDiveMapInstance = new maplibregl.Map({
    container: "admin-divemap-container",
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: [10, 20],
    zoom: 1.4,
  });
  adminDiveMapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  adminDiveMapInstance.on("load", () => {
    renderAdminDiveMapMarkers();
  });

  // Click anywhere on the map (not on a pin) to add a new site
  adminDiveMapInstance.on("click", (e) => {
    addDiveSiteAt(e.lngLat.lat, e.lngLat.lng);
  });
}

function addDiveSiteAt(lat, lng) {
  const name = prompt("Name this dive site (e.g. \"Cas Abou\"):");
  if (!name || !name.trim()) return;
  const location = prompt("Country / region (optional):") || "";

  const site = { id: makeSiteId(name), name: name.trim(), location: location.trim(), lat, lng };
  siteData.diveSites = siteData.diveSites || [];
  siteData.diveSites.push(site);

  // Offer to bulk-link any unlinked dives whose free-text site name matches
  const nameNorm = site.name.toLowerCase();
  const matches = siteData.dives
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => !d.siteId && d.site && d.site.toLowerCase().trim() === nameNorm);

  if (matches.length > 0) {
    const ok = confirm(`Found ${matches.length} logged dive${matches.length === 1 ? "" : "s"} at "${site.name}" not yet linked to a pin. Link them all to this new pin now?`);
    if (ok) matches.forEach(({ i }) => { siteData.dives[i].siteId = site.id; });
  }

  renderAdminDiveMapMarkers();
  renderDiveSitesList();
  renderDives();
  populateDiveSiteDropdown();
}

function renderAdminDiveMapMarkers() {
  if (!adminDiveMapInstance) return;
  Object.values(adminDiveMapMarkers).forEach(m => m.remove());
  adminDiveMapMarkers = {};

  (siteData.diveSites || []).forEach(site => {
    const el = document.createElement("div");
    el.className = "map-pin-marker";
    el.style.cursor = "pointer";
    el.addEventListener("click", (e) => {
      e.stopPropagation(); // don't also trigger the map's "add new site" click handler
      openDiveSiteManager(site.id);
    });
    const marker = new maplibregl.Marker({ element: el }).setLngLat([site.lng, site.lat]).addTo(adminDiveMapInstance);
    adminDiveMapMarkers[site.id] = marker;
  });
}

function renderDiveSitesList() {
  const wrap = document.getElementById("divesites-list");
  if (!wrap) return;
  wrap.innerHTML = "";
  const sites = siteData.diveSites || [];

  if (sites.length === 0) {
    wrap.innerHTML = `<p class="hint">No dive site pins yet — click the map above to add your first one.</p>`;
    return;
  }

  sites.forEach(site => {
    const count = siteData.dives.filter(d => d.siteId === site.id).length;
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div><strong>${site.name}</strong><div class="meta">${site.location || ""} · ${count} dive${count === 1 ? "" : "s"} linked</div></div>
      <div class="actions">
        <button data-action="manage">Manage</button>
        <button data-action="rename">Rename</button>
        <button class="danger" data-action="delete">Delete</button>
      </div>`;
    row.querySelector('[data-action="manage"]').addEventListener("click", () => openDiveSiteManager(site.id));
    row.querySelector('[data-action="rename"]').addEventListener("click", () => {
      const newName = prompt("Rename dive site:", site.name);
      if (newName && newName.trim()) {
        site.name = newName.trim();
        renderDiveSitesList();
        renderAdminDiveMapMarkers();
        populateDiveSiteDropdown();
      }
    });
    row.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm(`Delete "${site.name}"? Dives linked to it will be unlinked (not deleted) — you can relink them to a different pin afterward.`)) return;
      siteData.dives.forEach(d => { if (d.siteId === site.id) d.siteId = null; });
      siteData.diveSites = siteData.diveSites.filter(s => s.id !== site.id);
      renderDiveSitesList();
      renderAdminDiveMapMarkers();
      renderDives();
      populateDiveSiteDropdown();
      document.getElementById("divesite-link-panel").style.display = "none";
    });
    wrap.appendChild(row);
  });
}

function openDiveSiteManager(siteId) {
  const site = (siteData.diveSites || []).find(s => s.id === siteId);
  const panel = document.getElementById("divesite-link-panel");
  if (!site || !panel) return;

  panel.style.display = "block";
  panel.innerHTML = `
    <h2>Dives at "${site.name}"</h2>
    <p class="hint">Tick every dive that happened at this site — unlinked dives (no pin yet) are listed first.</p>
    <div id="divesite-checklist"></div>
    <button class="primary" id="divesite-save-links-btn">Save links</button>
    <button id="divesite-close-btn">Close</button>
  `;

  const checklist = panel.querySelector("#divesite-checklist");
  const withIndex = siteData.dives.map((d, i) => ({ d, i }));
  const sorted = [
    ...withIndex.filter(({ d }) => !d.siteId || d.siteId === siteId),
    ...withIndex.filter(({ d }) => d.siteId && d.siteId !== siteId),
  ];

  sorted.forEach(({ d, i }) => {
    const label = document.createElement("label");
    label.style.cssText = "display:flex; align-items:center; gap:10px; padding:8px 0; border-top:1px solid var(--line-topo); font-size:0.88rem;";
    const otherSite = d.siteId && d.siteId !== siteId ? (siteData.diveSites.find(s => s.id === d.siteId)?.name || "another pin") : null;
    label.innerHTML = `
      <input type="checkbox" data-i="${i}" ${d.siteId === siteId ? "checked" : ""}>
      <span>${d.date || "Date unknown"} — ${d.site || "untitled"} ${d.location ? "(" + d.location + ")" : ""}
      ${otherSite ? `<span class="pill" style="margin-left:6px;">linked to ${otherSite}</span>` : ""}</span>
    `;
    checklist.appendChild(label);
  });

  panel.querySelector("#divesite-save-links-btn").addEventListener("click", () => {
    checklist.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const i = parseInt(cb.dataset.i, 10);
      if (cb.checked) {
        siteData.dives[i].siteId = siteId;
      } else if (siteData.dives[i].siteId === siteId) {
        siteData.dives[i].siteId = null;
      }
    });
    renderDiveSitesList();
    renderDives();
    panel.style.display = "none";
  });
  panel.querySelector("#divesite-close-btn").addEventListener("click", () => {
    panel.style.display = "none";
  });
}

function populateDiveSiteDropdown() {
  const select = document.getElementById("dive-siteid");
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">— not linked —</option>`;
  (siteData.diveSites || []).forEach(site => {
    const opt = document.createElement("option");
    opt.value = site.id;
    opt.textContent = site.name + (site.location ? ` (${site.location})` : "");
    select.appendChild(opt);
  });
  select.value = current;
}

/* Init the admin dive map the first time its tab is opened (MapLibre
   needs a visible, sized container). */
document.querySelectorAll(".tab-btn").forEach(btn => {
  if (btn.dataset.tab === "divemap") {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        initAdminDiveMap();
        if (adminDiveMapInstance) adminDiveMapInstance.resize();
      }, 0);
    });
  }
});

/* ---------------- Save to GitHub ---------------- */

document.getElementById("save-github-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("status-msg");
  const btn = document.getElementById("save-github-btn");
  statusEl.className = "";
  statusEl.textContent = "Saving…";
  btn.disabled = true;
  try {
    await saveSiteData();
    statusEl.textContent = "Saved. Your live site will update within a minute or two.";
    statusEl.className = "ok";
  } catch (err) {
    statusEl.textContent = "Save failed: " + err.message;
    statusEl.className = "error";
  } finally {
    btn.disabled = false;
  }
});

/* ---------------- Init ---------------- */

(async function init() {
  const stored = loadStoredConfig();
  if (stored) {
    document.getElementById("setup-status").textContent = "Connecting…";
    try {
      await connect(stored);
    } catch (err) {
      document.getElementById("setup-status").textContent = err.message + " (You may need to reconnect.)";
      document.getElementById("gh-owner").value = stored.owner;
      document.getElementById("gh-repo").value = stored.repo;
      document.getElementById("gh-branch").value = stored.branch;
    }
  }
})();
