// SPDX-License-Identifier: GPL-3.0-or-later
// Version archive: fetch a .scad file from a link (usually a GitHub link pinned to one commit), fetch the files it
// includes, uses or imports from the same commit, and render it with the same OpenSCAD worker as the Playground.
import { stlsToGlb } from "./glb.js";

const $ = (id) => document.getElementById(id);
const viewer = $("va-viewer");
const MAX_FILES = 60;
let worker, jobId = 0, loaded = null;

function status(text, kind) { const s = $("va-status"); s.textContent = text; s.className = "ti-status ti-" + kind; }

// A part address is <project>:<model>[/<part>]@<revision>, e.g. trappy-inator:chlamydomonas/cell@9fccbcf. The
// project is a repository of the Trappy-Scopes organisation (this one if left out); the model lives at
// cad/parts/<model>/<model>.scad; the optional part is passed as its `part` parameter (whole model if left out).
const ORG = "Trappy-Scopes", PROJECT = "trappy-inator";
const partFile = (part) => `cad/parts/${part}/${part}.scad`;
const ADDRESS = /^(?:([\w.-]+):)?([\w.-]+)(?:\/([\w.-]+))?@([0-9a-f]{7,40})$/i;

// Also accepted, for files outside that layout: a GitHub link, which becomes
// github.com/<owner>/<repo>/blob/<ref>/<path>  ->  raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>
function normalise(input) {
  const a = input.trim().match(ADDRESS);
  if (a) {
    const [, p, model, part, rev] = a, project = p || PROJECT;
    const root = `https://raw.githubusercontent.com/${ORG}/${project}/${rev}/`;
    return { url: root + partFile(model), repo: `${ORG}/${project}`, ref: rev, path: partFile(model), root, part,
             address: `${project}:${model}${part ? "/" + part : ""}@${rev}` };
  }
  const url = new URL(input.trim());
  let m = url.hostname === "github.com" && url.pathname.match(/^\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/);
  if (m) return { url: `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`, repo: `${m[1]}/${m[2]}`, ref: m[3], path: m[4],
                  root: `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/` };
  m = url.hostname === "raw.githubusercontent.com" && url.pathname.match(/^\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/);
  if (m) return { url: url.href, repo: `${m[1]}/${m[2]}`, ref: m[3], path: m[4], root: `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/` };
  return { url: url.href, repo: url.host, ref: "", path: url.pathname.slice(1), root: url.origin + "/" };
}

async function get(url, binary) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  return binary ? new Uint8Array(await r.arrayBuffer()) : r.text();
}

// The file plus everything it pulls in with include<>, use<> or import(), as long as it lives in the same commit.
async function collect(source, text) {
  const files = {}, missing = [], queue = [[source.url, text]];
  const fsPath = (u) => "/src/" + decodeURIComponent(u.slice(source.root.length));
  while (queue.length && Object.keys(files).length < MAX_FILES) {
    const [u, text0] = queue.shift();
    if (fsPath(u) in files) continue;
    const binary = !/\.scad$/i.test(u);
    let content;
    try { content = text0 ?? (await get(u, binary)); } catch (e) { missing.push(u.slice(source.root.length)); continue; }
    files[fsPath(u)] = content;
    if (binary) continue;
    const refs = [...content.matchAll(/\b(?:include|use)\s*<([^>]+)>/g), ...content.matchAll(/\bimport\s*\(\s*(?:file\s*=\s*)?"([^"]+)"/g)];
    for (const [, dep] of refs) {
      const next = new URL(dep, u).href;
      if (next.startsWith(source.root)) queue.push([next, null]);
    }
  }
  return { files, missing, main: fsPath(source.url) };
}

function run(jobs) {
  worker ||= new Worker(new URL("./openscad-worker.js", import.meta.url), { type: "module" });
  const id = ++jobId, { main, files, source } = loaded;
  const extra = Object.fromEntries(Object.entries(files).filter(([p]) => p !== main));
  return new Promise((resolve, reject) => {
    const onMessage = ({ data }) => {
      if (data.id !== id) return;
      worker.removeEventListener("message", onMessage);
      data.ok ? resolve(data.files) : reject(new Error(data.error));
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, source, main, files: extra, jobs });
  });
}

const defines = () => (loaded.info.part ? [`part="${loaded.info.part}"`] : []);
const stem = () => loaded.info.path.split("/").pop().replace(/\.scad$/i, "") + (loaded.info.part ? "_" + loaded.info.part : "") + (loaded.info.ref ? "@" + loaded.info.ref : "");

async function open(input) {
  $("va-downloads").hidden = true;
  $("va-info").textContent = "";
  let info;
  try { info = normalise(input); } catch (e) { status("Not a part address like chlamydomonas@9fccbcf, or a link", "error"); return; }
  if (!/\.scad$/i.test(info.path)) { status("The link must point to a .scad file", "error"); return; }
  history.replaceState(null, "", "?part=" + encodeURIComponent(input.trim()));
  try {
    status("Fetching the file…", "busy");
    let source;
    try { source = await get(info.url); }
    catch (e) {
      status(info.address ? `${info.address} not found: no such project, part or revision (or the repository is private)` : "Could not fetch the file: " + e.message, "error");
      return;
    }
    const { files, missing, main } = await collect(info, source);
    loaded = { info, source, files, main };
    const pinned = /^[0-9a-f]{7,40}$/i.test(info.ref);
    $("va-info").innerHTML = (info.address ? `<code>${info.address}</code> · ` : "") +
      `<strong>${info.path}</strong> from <code>${info.repo}</code>` +
      (info.ref ? (pinned ? ` at commit <code>${info.ref}</code>` : ` on <code>${info.ref}</code> (a branch or tag moves over time; use a link to a commit to pin one version)`) : "") +
      ` · ${Object.keys(files).length} file${Object.keys(files).length > 1 ? "s" : ""}` +
      (missing.length ? ` · <span class="ti-va-missing">not found: ${missing.join(", ")}</span>` : "");
    $("va-source").textContent = source;
    status("Rendering with OpenSCAD…", "busy");
    const t0 = performance.now();
    const stl = (await run([{ name: "model", format: "binstl", defines: defines() }])).model;
    if (!stl) { status(loaded.info.part ? `No part "${loaded.info.part}" in this version` : "The file renders nothing with its default parameters", "error"); return; }
    loaded.stl = stl;
    const old = viewer.src;
    viewer.src = URL.createObjectURL(stlsToGlb([{ name: "model", stl, colour: "#9E9E9E" }]));
    if (old && old.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(old), 2000);
    $("va-downloads").hidden = false;
    status(`Rendered · ${((performance.now() - t0) / 1000).toFixed(1)} s`, "ok");
  } catch (e) {
    status("OpenSCAD: " + e.message.split("\n")[0].slice(0, 160), "error");
  }
}

function save(data, name) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data])); a.download = name; a.click();
}

$("va-form").onsubmit = (e) => { e.preventDefault(); open($("va-url").value); };
$("va-stl").onclick = () => save(loaded.stl, stem() + ".stl");
$("va-3mf").onclick = async () => {
  const note = $("va-download-status"); note.textContent = "Preparing…";
  try { save((await run([{ name: "3mf", format: "3mf", options: ["export-3mf/color-mode=model"], defines: defines() }]))["3mf"], stem() + ".3mf"); note.textContent = ""; }
  catch (e) { note.textContent = "Could not build the file: " + e.message.split("\n")[0]; }
};

const query = new URLSearchParams(location.search), start = query.get("part") || query.get("url");
if (start) { $("va-url").value = start; open(start); }
