// SPDX-License-Identifier: GPL-3.0-or-later
// Runs the official OpenSCAD WebAssembly build (files.openscad.org) off the main thread.
// Message in:  {id, source, main?, files?: {path: text}, jobs: [{name, defines: ["name=value", ...], format: "binstl" | "3mf", options: []}]}
// Message out: {id, ok, files: {name: Uint8Array}, log} or {id, ok: false, error, log}
import OpenSCAD from "./openscad/openscad.js";

const wasmUrl = new URL("./openscad/openscad.wasm", import.meta.url);
let compiled;   // WebAssembly.Module, compiled once and re-instantiated for every render

async function wasmModule() {
  if (!compiled) compiled = await WebAssembly.compile(await (await fetch(wasmUrl)).arrayBuffer());
  return compiled;
}

function writeFile(fs, path, text) {
  const parts = path.split("/").filter(Boolean);
  for (let i = 1; i < parts.length; i++) { try { fs.mkdir("/" + parts.slice(0, i).join("/")); } catch (e) { /* exists */ } }
  fs.writeFile(path, text);
}

async function runOnce(source, job, log, main = "/model.scad", extra = {}) {
  const module = await wasmModule();
  const instance = await OpenSCAD({
    noInitialRun: true,
    print: (t) => log.push(t),
    printErr: (t) => log.push(t),
    instantiateWasm(imports, receive) {
      WebAssembly.instantiate(module, imports).then((inst) => receive(inst, module));
      return {};
    },
  });
  for (const [path, text] of Object.entries(extra)) writeFile(instance.FS, path, text);
  writeFile(instance.FS, main, source);
  const out = job.format === "3mf" ? "/out.3mf" : "/out.stl";
  const args = [main, "-o", out, "--backend=manifold"];
  if (job.format === "binstl") args.push("--export-format", "binstl");
  for (const o of job.options || []) args.push("-O", o);
  for (const d of job.defines) args.push("-D", d);
  let code = 0;
  try { code = instance.callMain(args); } catch (e) { code = typeof e?.status === "number" ? e.status : 1; }
  let data = null;
  try { data = instance.FS.readFile(out); } catch (e) { /* no output */ }
  // A part can legitimately be empty (e.g. flagella of length 0): report it as no file, not an error.
  if (!data && log.some((l) => /top level object is empty/i.test(l))) return null;
  if (code !== 0 || !data) throw new Error(log.filter((l) => /ERROR|WARNING|assert/i.test(l)).join("\n") || "OpenSCAD failed");
  return data;
}

self.onmessage = async ({ data }) => {
  const log = [];
  try {
    const files = {};
    for (const job of data.jobs) files[job.name] = await runOnce(data.source, job, log, data.main, data.files);
    self.postMessage({ id: data.id, ok: true, files, log }, Object.values(files).filter(Boolean).map((f) => f.buffer));
  } catch (e) {
    self.postMessage({ id: data.id, ok: false, error: String(e.message || e), log });
  }
};
