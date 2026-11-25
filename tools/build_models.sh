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

# catalog: one GLB and one preview image per part
for part in cell eyespot flagella; do
  case $part in cell) colour="#4C8C3A";; eyespot) colour="#E4572E";; flagella) colour="#E9E4D6";; esac
  python3 tools/stl_to_glb.py "$OUT/chlamydomonas_$part.glb" "$part=build/showcase_$part.stl:$colour"
  "$OPENSCAD" --colorscheme="Tomorrow Night" --imgsize=900,700 --camera=55,170,55,0,0,18 --viewall --autocenter \
    -D "part=\"$part\"" -o "$OUT/chlamydomonas_$part.png" "$SRC"
done

# ---------------- frozen parts: plain STL files with no parametric source (e.g. Fusion 360 exports) ----------------
# Layout: cad/frozen/<part-name>/<file>.stl, optional cad/frozen/<part-name>/colour (one line, e.g. #3A3A3A).
# Each STL is copied for download and gets a GLB for the 3D viewer and a preview image. Nothing is regenerated
# from source, so the STL itself is the versioned file; its revision is the last commit that changed its folder.
shopt -s nullglob
frozen_json="["
for dir in cad/frozen/*/; do
  name=$(basename "$dir")
  colour=$(head -n1 "$dir/colour" 2>/dev/null || echo "#9E9E9E")
  rev=$(git log -1 --format=%h -- "$dir" 2>/dev/null || true)
  mkdir -p "$OUT/frozen/$name"
  files=""
  for stl in "$dir"*.stl "$dir"*.STL; do
    base=$(basename "${stl%.*}")
    cp "$stl" "$OUT/frozen/$name/$base.stl"
    # OpenSCAD reads ASCII and binary STL; re-export as binary STL so the GLB converter can read it
    printf 'color("%s") import("%s");\n' "$colour" "$PWD/$stl" > build/frozen_view.scad
    "$OPENSCAD" --export-format binstl -o "build/frozen_$base.stl" build/frozen_view.scad
    python3 tools/stl_to_glb.py "$OUT/frozen/$name/$base.glb" "$base=build/frozen_$base.stl:$colour"
    "$OPENSCAD" --colorscheme="Tomorrow Night" --imgsize=1200,900 --viewall --autocenter \
      -o "$OUT/frozen/$name/$base.png" build/frozen_view.scad
    files="$files\"$base\","
  done
  frozen_json="$frozen_json{\"part\": \"$name\", \"revision\": \"${rev:-uncommitted}\", \"files\": [${files%,}]},"
done
echo "${frozen_json%,}]" > "$OUT/frozen.json"

echo "models written to $OUT"
