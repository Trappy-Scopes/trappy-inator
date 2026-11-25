// SPDX-License-Identifier: GPL-3.0-or-later
// Binary STLs (mm, z-up) -> one GLB (m, y-up) with one named node and one matte material per part.
// Same rules as tools/stl_to_glb.py: normals are smoothed except across edges sharper than 40 degrees.
const CREASE_COS = Math.cos((40 * Math.PI) / 180);

function readStl(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const n = view.getUint32(80, true);
  const pos = new Float32Array(n * 9);
  for (let t = 0; t < n; t++) {
    const base = 84 + 50 * t + 12;
    for (let k = 0; k < 3; k++) {
      const x = view.getFloat32(base + 12 * k, true), y = view.getFloat32(base + 12 * k + 4, true), z = view.getFloat32(base + 12 * k + 8, true);
      pos.set([x / 1000, z / 1000, -y / 1000], 9 * t + 3 * k);
    }
  }
  return { pos, n };
}

function buildMesh({ pos, n }) {
  const faceN = new Float32Array(n * 3), corners = new Map(), key = (i) => `${pos[i].toFixed(7)},${pos[i + 1].toFixed(7)},${pos[i + 2].toFixed(7)}`;
  for (let t = 0; t < n; t++) {
    const a = 9 * t, ux = pos[a + 3] - pos[a], uy = pos[a + 4] - pos[a + 1], uz = pos[a + 5] - pos[a + 2];
    const wx = pos[a + 6] - pos[a], wy = pos[a + 7] - pos[a + 1], wz = pos[a + 8] - pos[a + 2];
    let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    const l = Math.hypot(nx, ny, nz) || 1; faceN.set([nx / l, ny / l, nz / l], 3 * t);
    for (let k = 0; k < 3; k++) { const kk = key(a + 3 * k); (corners.get(kk) || corners.set(kk, []).get(kk)).push(t); }
  }
  const positions = [], normals = [], index = [], lookup = new Map();
  for (let t = 0; t < n; t++) {
    const fx = faceN[3 * t], fy = faceN[3 * t + 1], fz = faceN[3 * t + 2];
    for (let k = 0; k < 3; k++) {
      const i = 9 * t + 3 * k, kp = key(i); let ax = 0, ay = 0, az = 0;
      for (const o of corners.get(kp)) {
        const ox = faceN[3 * o], oy = faceN[3 * o + 1], oz = faceN[3 * o + 2];
        if (ox * fx + oy * fy + oz * fz >= CREASE_COS) { ax += ox; ay += oy; az += oz; }
      }
      const l = Math.hypot(ax, ay, az) || 1, nn = [ax / l, ay / l, az / l];
      const vk = kp + "|" + nn.map((v) => v.toFixed(3)).join(",");
      let idx = lookup.get(vk);
      if (idx === undefined) { idx = positions.length / 3; lookup.set(vk, idx); positions.push(pos[i], pos[i + 1], pos[i + 2]); normals.push(...nn); }
      index.push(idx);
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals), index: new Uint32Array(index) };
}

function srgbToLinear(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }).concat([1]);
}

// parts: [{name, stl: Uint8Array, colour: "#rrggbb"}] -> Blob (model/gltf-binary)
export function stlsToGlb(parts) {
  const chunks = [], views = [], accessors = [], meshes = [], nodes = [], materials = [];
  let offset = 0;
  const addView = (arr, target) => {
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    views.push({ buffer: 0, byteOffset: offset, byteLength: bytes.byteLength, target });
    chunks.push(bytes); offset += bytes.byteLength;
    const pad = (4 - (offset % 4)) % 4; if (pad) { chunks.push(new Uint8Array(pad)); offset += pad; }
    return views.length - 1;
  };
  for (const part of parts) {
    const stl = readStl(part.stl); if (!stl.n) continue;
    const m = buildMesh(stl), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < m.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], m.positions[i + k]); hi[k] = Math.max(hi[k], m.positions[i + k]); }
    const a = accessors.length;
    accessors.push(
      { bufferView: addView(m.positions, 34962), componentType: 5126, count: m.positions.length / 3, type: "VEC3", min: lo, max: hi },
      { bufferView: addView(m.normals, 34962), componentType: 5126, count: m.normals.length / 3, type: "VEC3" },
      { bufferView: addView(m.index, 34963), componentType: 5125, count: m.index.length, type: "SCALAR" });
    materials.push({ name: part.name, pbrMetallicRoughness: { baseColorFactor: srgbToLinear(part.colour), metallicFactor: 0, roughnessFactor: 0.85 } });
    meshes.push({ name: part.name, primitives: [{ attributes: { POSITION: a, NORMAL: a + 1 }, indices: a + 2, material: materials.length - 1 }] });
    nodes.push({ name: part.name, mesh: meshes.length - 1 });
  }
  const gltf = { asset: { version: "2.0", generator: "trappy-inator glb.js" }, scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes, meshes, materials, accessors, bufferViews: views, buffers: [{ byteLength: offset }] };
  let json = new TextEncoder().encode(JSON.stringify(gltf));
  const jpad = (4 - (json.length % 4)) % 4;
  if (jpad) { const j = new Uint8Array(json.length + jpad).fill(0x20); j.set(json); json = j; }
  const header = new DataView(new ArrayBuffer(20));
  header.setUint32(0, 0x46546c67, true); header.setUint32(4, 2, true); header.setUint32(8, 12 + 8 + json.length + 8 + offset, true);
  header.setUint32(12, json.length, true); header.setUint32(16, 0x4e4f534a, true);
  const binHeader = new DataView(new ArrayBuffer(8)); binHeader.setUint32(0, offset, true); binHeader.setUint32(4, 0x004e4942, true);
  return new Blob([header.buffer, json, binHeader.buffer, ...chunks], { type: "model/gltf-binary" });
}

export const linearColour = srgbToLinear;
