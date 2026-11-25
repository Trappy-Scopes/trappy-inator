#!/usr/bin/env bash
# SPDX-License-Identifier: GPL-3.0-or-later
# Render every output of the Chlamydomonas demo into docs/generated/ (gitignored) for the website.
#   OPENSCAD=/path/to/openscad tools/build_models.sh
set -euo pipefail
cd "$(dirname "$0")/.."
OPENSCAD="${OPENSCAD:-openscad}"
SRC=cad/parts/chlamydomonas/chlamydomonas.scad
OUT=docs/generated
mkdir -p "$OUT" "$OUT/models"
rev=$(git log -1 --format=%h -- cad/parts/chlamydomonas 2>/dev/null || true)
echo "{\"part\": \"trappy-inator:chlamydomonas\", \"revision\": \"${rev:-uncommitted}\"}" > "$OUT/chlamydomonas.version.json"

"$OPENSCAD" --export-format param -o "$OUT/chlamydomonas.params.json" "$SRC"
cp cad/parts/chlamydomonas/chlamydomonas.json "$OUT/chlamydomonas.presets.json"
cp "$SRC" "$OUT/chlamydomonas.scad"     # the Playground renders this exact file in the browser

# full-quality downloads: one STL per colour body, plus a coloured 3MF of the whole cell
for part in cell eyespot flagella; do
  "$OPENSCAD" --backend=manifold --hardwarnings --export-format binstl -D "part=\"$part\"" \
    -o "$OUT/models/chlamydomonas_$part.stl" "$SRC"
done
"$OPENSCAD" --backend=manifold --hardwarnings -O export-3mf/color-mode=model -o "$OUT/models/chlamydomonas.3mf" "$SRC"

# lighter meshes for the 3D showcase
mkdir -p build
for part in cell eyespot flagella; do
  "$OPENSCAD" --backend=manifold --export-format binstl -D "part=\"$part\"" -D '$fa=6' -D '$fs=0.6' \
    -o "build/showcase_$part.stl" "$SRC"
done
python3 tools/stl_to_glb.py "$OUT/chlamydomonas.glb" \
  cell=build/showcase_cell.stl:#4C8C3A eyespot=build/showcase_eyespot.stl:#E4572E flagella=build/showcase_flagella.stl:#E9E4D6

# poster image, shown before the 3D model loads
"$OPENSCAD" --colorscheme="Tomorrow Night" --imgsize=1200,900 --camera=55,170,55,0,0,18 --viewall --autocenter \
  -o "$OUT/chlamydomonas.png" "$SRC"
echo "models written to $OUT"
