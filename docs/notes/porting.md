# Porting existing projects

How to move an existing Trappy-Scopes project into this layout. Two worked examples cover the two kinds of part:
plumbing (all parametric) and trappyframe (all STL files from Fusion 360).

## General steps

1. Create the new repository from the template ([Make your own](make-your-own.md)), or copy the template files
   (`mkdocs.yml`, `requirements-docs.txt`, `tools/`, `docs/`, `.github/`, `.gitignore`, `LICENSES/`) into the
   existing repository.
2. Move parts into `cad/parts/` (OpenSCAD) or `cad/frozen/` (STL).
3. Delete generated files from the repository (exported STLs of parametric parts, renders, sliced `.3mf` plates).
   They are rebuilt by GitHub Actions; sliced plates can be attached to a GitHub release instead.
4. Move existing documentation pages into `docs/` and fill in `nav` in `mkdocs.yml`.
5. Build locally ([Project layout](project-layout.md#building-the-website-on-your-computer)), check every page, push.

## Example: plumbing (parametric)

Today: `pumpbox.scad` makes several parts through a `part` parameter (`box`, `lid`, `oring`, `assembly`,
`stack`), named configurations live in STL file names (`box_n4_stag.stl`), and `BOM.md`, `TESTPLATES.md`,
`tests/` and `print_profiles/` sit at the top level.

| Today | Moves to |
|---|---|
| `pumpbox.scad`, `pump_proxy.scad` | `cad/parts/pumpbox/`, `cad/parts/pump-proxy/` |
| configurations in STL names (`n4_stag`, `rec30`) | presets in `cad/parts/pumpbox/pumpbox.json` |
| `stl/*.stl`, `renders/*.png` | deleted; rebuilt by GitHub Actions |
| `fonts/` | `cad/fonts/` (the font licence stays with it) |
| `BOM.md` | `docs/bom.md` |
| `TESTPLATES.md`, `docs/decode.html` | `docs/` pages (the snap-code decoder works unchanged as a page) |
| `tests/`, `tools/`, `print_profiles/` | stay; `tests/` can run in GitHub Actions |

Playground: `CONFIG.name = "pumpbox"`, `CONFIG.parts` = box, lid and O-ring, each with its colour parameter.
Before that, the Customizer comments in `pumpbox.scad` need the new layout (description on the line above,
only the range after the value), and short names such as `head_w` and `gp` should be renamed so they read as
labels.

## Example: trappyframe (STL files)

Today: eight plates and two block templates exported from Fusion 360, with the version in the file name
(`Mid Plate Magnets 6.3mm  (FSSBTv2) v14.stl`), sliced plates in `print_files/`, and a working MkDocs site with
Assembly, Bill of materials, Calibration and Disassembly pages.

| Today | Moves to |
|---|---|
| `frame/Mid Plate Magnets 6.3mm  (FSSBTv2) v14.stl` | `cad/frozen/mid-plate/mid-plate.stl` |
| `frame/Base Plate 6.3mm (FSSBTv3) v2.stl` | `cad/frozen/base-plate/base-plate.stl` |
| … one folder per plate | `cad/frozen/<plate>/` with `colour` = `#1E1E1E` for black PLA |
| `frame_templates/*.stl` | `cad/frozen/<template>/` |
| `print_files/*.3mf` (about 95 MB) | attached to a GitHub release, removed from the repository |
| `docs/assets/Cluster v4.gltf` (60 MB) | replaced by a compressed GLB of the cluster |
| `docs/notes/*.md` | `docs/` with the same tabs |
| version numbers in file names (`v14`) | the git revision; the old number can be noted once in the commit that moves the file |

No Playground until a plate is redrawn in OpenSCAD; the 3D views, previews and downloads work straight away. When a
plate is converted, it moves from `cad/frozen/` to `cad/parts/` and keeps its name, so links and citations stay
valid.

!!! tip "Dark parts on a dark page"
    Black plates are hard to see on the dark theme. Use a mid-grey display colour (e.g. `#5A5A5A`) in the
    `colour` file; it changes only how the part is shown, not the files you download.
