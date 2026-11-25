#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""Join binary STLs into one GLB for <model-viewer>: one named node and one matte material per part.

    python3 tools/stl_to_glb.py out.glb cell=build/cell.stl:#4C8C3A eyespot=build/eyespot.stl:#E4572E ...

Millimetres become metres, OpenSCAD's z-up becomes glTF's y-up, and normals are smoothed across edges
sharper than 40 degrees only (so curved surfaces look smooth and creases stay crisp). No dependencies.
"""
import json, math, struct, sys

CREASE_COS = math.cos(math.radians(40))


def read_stl(path):
    with open(path, "rb") as f:
        f.read(80)
        (n,) = struct.unpack("<I", f.read(4))
        data = f.read(50 * n)
    tris = []
    for i in range(n):
        v = struct.unpack_from("<12f", data, 50 * i)
        # mm -> m, z-up -> y-up: (x, y, z) -> (x, z, -y)
        tris.append(tuple((v[k] / 1000, v[k + 2] / 1000, -v[k + 1] / 1000) for k in (3, 6, 9)))
    return tris


def mesh(tris):
    """Indexed positions, smoothed normals (with creases) and indices."""
    face_n, corners = [], {}
    for t, (a, b, c) in enumerate(tris):
        u = [b[i] - a[i] for i in range(3)]; w = [c[i] - a[i] for i in range(3)]
        n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
        length = math.sqrt(sum(x * x for x in n)) or 1.0
        face_n.append([x / length for x in n])
        for p in (a, b, c):
            corners.setdefault(tuple(round(x, 9) for x in p), []).append(t)
    positions, normals, index, lookup = [], [], [], {}
    for t, tri in enumerate(tris):
        fn = face_n[t]
        for p in tri:
            key_p = tuple(round(x, 9) for x in p)
            acc = [0.0, 0.0, 0.0]
            for o in corners[key_p]:
                on = face_n[o]
                if on[0] * fn[0] + on[1] * fn[1] + on[2] * fn[2] >= CREASE_COS:
                    acc = [acc[i] + on[i] for i in range(3)]
            length = math.sqrt(sum(x * x for x in acc)) or 1.0
            n = tuple(round(x / length, 3) for x in acc)
            key = (key_p, n)
            if key not in lookup:
                lookup[key] = len(positions)
                positions.append(p); normals.append(n)
            index.append(lookup[key])
    return positions, normals, index


def hex_rgb(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb] + [1.0]


def write_glb(out, parts):
    blob, views, accessors, meshes, nodes, materials = bytearray(), [], [], [], [], []
    for name, stl, colour in parts:
        positions, normals, index = mesh(read_stl(stl))
        if not index:
            continue
        def view(data, target):
            while len(blob) % 4:
                blob.append(0)
            views.append({"buffer": 0, "byteOffset": len(blob), "byteLength": len(data), "target": target})
            blob.extend(data)
            return len(views) - 1
        pos_view = view(struct.pack(f"<{3 * len(positions)}f", *[c for p in positions for c in p]), 34962)
        nor_view = view(struct.pack(f"<{3 * len(normals)}f", *[c for p in normals for c in p]), 34962)
        idx_view = view(struct.pack(f"<{len(index)}I", *index), 34963)
        lo = [min(p[i] for p in positions) for i in range(3)]; hi = [max(p[i] for p in positions) for i in range(3)]
        accessors += [
            {"bufferView": pos_view, "componentType": 5126, "count": len(positions), "type": "VEC3", "min": lo, "max": hi},
            {"bufferView": nor_view, "componentType": 5126, "count": len(normals), "type": "VEC3"},
            {"bufferView": idx_view, "componentType": 5125, "count": len(index), "type": "SCALAR"},
        ]
        a = len(accessors) - 3
        materials.append({"name": name, "pbrMetallicRoughness": {"baseColorFactor": hex_rgb(colour),
                                                                  "metallicFactor": 0.0, "roughnessFactor": 0.85}})
        meshes.append({"name": name, "primitives": [{"attributes": {"POSITION": a, "NORMAL": a + 1},
                                                     "indices": a + 2, "material": len(materials) - 1}]})
        nodes.append({"name": name, "mesh": len(meshes) - 1})
    gltf = {"asset": {"version": "2.0", "generator": "trappy-inator stl_to_glb.py"},
            "scene": 0, "scenes": [{"nodes": list(range(len(nodes)))}], "nodes": nodes, "meshes": meshes,
            "materials": materials, "accessors": accessors, "bufferViews": views,
            "buffers": [{"byteLength": len(blob)}]}
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    while len(blob) % 4:
        blob.append(0)
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(out, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(js), 0x4E4F534A)); f.write(js)
        f.write(struct.pack("<II", len(blob), 0x004E4942)); f.write(blob)


if __name__ == "__main__":
    parts = []
    for arg in sys.argv[2:]:
        name, rest = arg.split("=", 1)
        stl, colour = rest.rsplit(":", 1)
        parts.append((name, stl, colour))
    write_glb(sys.argv[1], parts)
