// SPDX-License-Identifier: GPL-3.0-or-later
// Playground: a parameter form generated from OpenSCAD's own parameter export, OpenSCAD (WebAssembly) in a
// worker for the geometry, and <model-viewer> for display. Nothing here is specific to Chlamydomonas except
// the file names in CONFIG, so any part with Customizer annotations works the same way.
import { stlsToGlb, linearColour } from "./glb.js";

const CONFIG = {
  base: "../generated/",
  name: "chlamydomonas",
  id: "trappy-inator:chlamydomonas",
  parts: [ // colour bodies: the `part` value in the .scad and the parameter holding its colour
    { name: "cell", label: "Cell body", colour: "cell_colour" },
    { name: "eyespot", label: "Eyespot", colour: "eyespot_colour" },
    { name: "flagella", label: "Flagella", colour: "flagellum_colour" },
  ],
  hidden: ["part"],
  groupLabels: { Output: "Download" },
  draft: ["$fa=12", "$fs=1.5"],
};

const $ = (id) => document.getElementById(id);
const viewer = $("pg-viewer");
const state = { params: [], defaults: {}, values: {}, source: "", revision: "", latest: null };
let worker, jobId = 0, busy = false, queued = null;

const label = (name) => name.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const fmt = (v) => (typeof v === "number" ? String(Math.round(v * 1000) / 1000) : v);
const isColour = (p) => p.type === "string" && /^#[0-9a-f]{6}$/i.test(p.initial);
const geometryParams = () => state.params.filter((p) => !isColour(p) && !CONFIG.hidden.includes(p.name));

async function fetchText(f) { const r = await fetch(CONFIG.base + f); if (!r.ok) throw new Error(f); return r.text(); }

async function init() {
  const [params, presets, source, version] = await Promise.all([
    fetchText(CONFIG.name + ".params.json").then(JSON.parse),
    fetchText(CONFIG.name + ".presets.json").then(JSON.parse).catch(() => ({ parameterSets: {} })),
    fetchText(CONFIG.name + ".scad"),
    fetchText(CONFIG.name + ".version.json").then(JSON.parse).catch(() => ({})),
  ]);
  state.params = params.parameters.filter((p) => !CONFIG.hidden.includes(p.name));
  state.source = source;
  state.revision = version.revision || "";
  document.querySelectorAll(".ti-rev").forEach((e) => (e.textContent = state.revision));
  for (const p of state.params) state.defaults[p.name] = p.initial;
  Object.assign(state.values, state.defaults);
  const query = new URLSearchParams(location.search);
  for (const p of state.params) if (query.has(p.name)) state.values[p.name] = parseValue(p, query.get(p.name));
  state.presets = presets.parameterSets || {};
  buildPresets();
  buildForm();
  refresh();
  if (geometryParams().some((p) => state.values[p.name] !== state.defaults[p.name])) render("full");
}

function parseValue(p, raw) {
  if (p.type === "number") return Number(raw);
  if (p.type === "boolean") return raw === "true";
  if (isColour(p)) return raw.startsWith("#") ? raw : "#" + raw;
  return raw;
}

function buildPresets() {
  const sel = $("pg-preset");
  const names = Object.keys(state.presets);
  sel.innerHTML = names.map((n) => `<option value="${n}">${label(n)}</option>`).join("") || "<option>Default</option>";
  sel.onchange = () => {
    const set = state.presets[sel.value] || {};
    for (const p of state.params) if (!isColour(p)) state.values[p.name] = p.name in set ? parseValue(p, set[p.name]) : state.defaults[p.name];
    syncInputs(); refresh(); render("full");
  };
}

function buildForm() {
  const groups = [...new Set(state.params.map((p) => p.group))];
  const tabs = $("pg-tabs"), form = $("pg-form");
  tabs.innerHTML = ""; form.innerHTML = "";
  groups.forEach((g, i) => {
    const tab = document.createElement("button");
    tab.className = "ti-tab"; tab.textContent = CONFIG.groupLabels[g] || g; tab.setAttribute("role", "tab");
    tab.onclick = () => showGroup(i);
    tabs.appendChild(tab);
    const pane = document.createElement("div"); pane.className = "ti-pane";
    for (const p of state.params.filter((q) => q.group === g)) pane.appendChild(row(p));
    form.appendChild(pane);
  });
  showGroup(0);
}

function showGroup(i) {
  [...$("pg-tabs").children].forEach((t, k) => t.classList.toggle("ti-on", k === i));
  [...$("pg-form").children].forEach((p, k) => (p.hidden = k !== i));
}

function row(p) {
  const r = document.createElement("div");
  r.className = "ti-row"; r.dataset.name = p.name;
  const title = `<span class="ti-label" title="${p.caption || ""}">${label(p.name)}${p.caption ? `<small>${p.caption}</small>` : ""}</span>`;
  if (isColour(p)) {
    r.innerHTML = `${title}<input type="color" value="${state.values[p.name]}"><span></span>`;
    r.querySelector("input").oninput = (e) => { state.values[p.name] = e.target.value; applyColours(); refresh(); };
  } else if (p.type === "number" && p.min !== undefined) {
    r.innerHTML = `${title}<input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${state.values[p.name]}"><output></output>`;
    const input = r.querySelector("input");
    input.oninput = () => { state.values[p.name] = Number(input.value); refresh(); render("draft"); };
    input.onchange = () => render("full");
  } else if (p.options) {
    r.innerHTML = `${title}<select>${p.options.map((o) => `<option value="${o.value}">${o.name}</option>`).join("")}</select><span></span>`;
    const s = r.querySelector("select"); s.value = state.values[p.name];
    s.onchange = () => { state.values[p.name] = parseValue(p, s.value); refresh(); render("full"); };
  } else if (p.type === "boolean") {
    r.innerHTML = `${title}<input type="checkbox" ${state.values[p.name] ? "checked" : ""}><span></span>`;
    r.querySelector("input").onchange = (e) => { state.values[p.name] = e.target.checked; refresh(); render("full"); };
  } else {
    r.innerHTML = `${title}<input type="text" value="${state.values[p.name]}"><span></span>`;
    r.querySelector("input").onchange = (e) => { state.values[p.name] = parseValue(p, e.target.value); refresh(); render("full"); };
  }
  return r;
}

function syncInputs() {
  for (const r of document.querySelectorAll(".ti-row")) {
    const input = r.querySelector("input, select"), v = state.values[r.dataset.name];
    if (input.type === "checkbox") input.checked = v; else input.value = v;
  }
}

function changed() { return state.params.filter((p) => state.values[p.name] !== state.defaults[p.name]); }

function refresh() {
  for (const r of document.querySelectorAll(".ti-row")) {
    const name = r.dataset.name, out = r.querySelector("output");
    if (out) out.textContent = fmt(state.values[name]);
    r.classList.toggle("ti-changed", state.values[name] !== state.defaults[name]);
  }
  const ch = changed();
  $("pg-changed").textContent = `${ch.length} changed`;
  const query = ch.map((p) => `${p.name}=${encodeURIComponent(isColour(p) ? state.values[p.name].slice(1) : fmt(state.values[p.name]))}`).join("&");
  const link = location.origin + location.pathname + (query ? "?" + query : "");
  $("pg-link").textContent = link;
  history.replaceState(null, "", query ? "?" + query : location.pathname);
  $("pg-cite").textContent = `${CONFIG.id}@${state.revision} · ${link}`;
}

function defines(extra = []) {
  return geometryParams().concat(state.params.filter(isColour))
    .map((p) => `${p.name}=${p.type === "number" || p.type === "boolean" ? fmt(state.values[p.name]) : JSON.stringify(state.values[p.name])}`)
    .concat(extra);
}

function status(text, kind) { const s = $("pg-status"); s.textContent = text; s.className = "ti-status ti-" + kind; }

function run(jobs) {
  worker ||= new Worker(new URL("./openscad-worker.js", import.meta.url), { type: "module" });
  const id = ++jobId;
  return new Promise((resolve, reject) => {
    const onMessage = ({ data }) => {
      if (data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      data.ok ? resolve(data.files) : reject(new Error(data.error));
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, source: state.source, jobs });
  });
}

async function render(quality) {
  if (busy) { queued = quality === "full" || queued === "full" ? "full" : "draft"; return; }
  busy = true;
  status(quality === "draft" ? "Rendering draft…" : "Rendering…", "busy");
  const extra = quality === "draft" ? CONFIG.draft : [];
  try {
    const t0 = performance.now();
    const files = await run(CONFIG.parts.map((p) => ({ name: p.name, format: "binstl", defines: defines([`part="${p.name}"`, ...extra]) })));
    const glb = stlsToGlb(CONFIG.parts.filter((p) => files[p.name]).map((p) => ({ name: p.name, stl: files[p.name], colour: state.values[p.colour] })));
    const orbit = viewer.getCameraOrbit?.();
    if (orbit) viewer.cameraOrbit = `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius}m`;
    const old = viewer.src; viewer.src = URL.createObjectURL(glb);
    if (old && old.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(old), 2000);
    if (quality === "full") state.latest = { files, key: JSON.stringify(defines()) };
    status(`${quality === "draft" ? "Draft" : "Up to date"} · ${((performance.now() - t0) / 1000).toFixed(1)} s`, quality === "draft" ? "busy" : "ok");
  } catch (e) {
    status("OpenSCAD: " + e.message.split("\n")[0].slice(0, 120), "error");
  }
  busy = false;
  if (queued) { const q = queued; queued = null; render(q); }
}

function applyColours() {
  const model = viewer.model; if (!model) return;
  for (const p of CONFIG.parts) {
    const m = model.materials.find((x) => x.name === p.name);
    if (m) m.pbrMetallicRoughness.setBaseColorFactor(linearColour(state.values[p.colour]));
  }
}
viewer.addEventListener("load", applyColours);

$("pg-reset").onclick = () => { Object.assign(state.values, state.defaults); $("pg-preset").selectedIndex = 0; syncInputs(); refresh(); applyColours(); render("full"); };
$("pg-copy").onclick = () => navigator.clipboard.writeText($("pg-link").textContent);

document.querySelectorAll("[data-download]").forEach((b) => (b.onclick = async () => {
  const what = b.dataset.download, note = $("pg-download-status");
  note.textContent = "Preparing…";
  try {
    let data, file;
    if (what === "3mf") {
      data = (await run([{ name: "3mf", format: "3mf", options: ["export-3mf/color-mode=model"], defines: defines(['part="assembly"']) }]))["3mf"];
      file = `${CONFIG.name}.3mf`;
    } else {
      if (!state.latest || state.latest.key !== JSON.stringify(defines())) {
        state.latest = { files: await run(CONFIG.parts.map((p) => ({ name: p.name, format: "binstl", defines: defines([`part="${p.name}"`]) }))), key: JSON.stringify(defines()) };
      }
      data = state.latest.files[what]; file = `${CONFIG.name}_${what}.stl`;
      if (!data) { note.textContent = `No ${what} with these settings, so there is nothing to download.`; return; }
    }
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data])); a.download = file; a.click();
    note.textContent = "";
  } catch (e) { note.textContent = "Could not build the file: " + e.message.split("\n")[0]; }
}));

init().catch((e) => status("Could not load the model files: " + e.message, "error"));
