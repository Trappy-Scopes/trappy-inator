# Project layout

Every Trappy-Scopes project uses the same layout. Only the source files are committed; everything the website
shows is generated from them.

```text
<project>/
├── README.md                         short introduction; also the top of the website's home page
├── mkdocs.yml                        website: name, tabs (nav) and the shared Trappy-Scopes theme
├── requirements-docs.txt             Python packages for building the website
├── LICENSES/                         full licence texts (hardware, software, docs)
├── cad/
│   ├── parts/<part>/                 parametric parts
│   │   ├── <part>.scad               parameters + geometry, in OpenSCAD's Customizer format
│   │   └── <part>.json               optional named presets (OpenSCAD parameter sets)
│   └── frozen/<part>/                plain STL parts (e.g. Fusion 360 exports)
│       ├── <file>.stl                one or more STL files, committed as they are
│       └── colour                    optional display colour, e.g. #3A3A3A
├── docs/                             the website's pages
│   ├── index.md                      home: includes README.md, then the showcase
│   ├── assembly.md                   assembly instructions
│   ├── bom.md                        bill of materials
│   ├── disassembly.md                disassembly instructions
│   ├── playground.md                 the Playground page
│   ├── notes/                        notes like these (only on trappy-inator)
│   ├── assets/                       logo, showcase and Playground scripts
│   └── stylesheets/extra.css         shared look of viewers, tags and the Playground form
├── tools/
│   ├── build_models.sh               runs OpenSCAD for every part → docs/generated/
│   ├── stl_to_glb.py                 STL files → one GLB for the 3D viewer
│   └── fetch_openscad_wasm.sh        downloads the browser build of OpenSCAD for the Playground
└── .github/workflows/site.yml        GitHub Actions: build models, build the website, publish to gh-pages
```

## Generated, never committed

These folders are created by the build and listed in `.gitignore`:

| Folder | Made by | Contains |
|---|---|---|
| `docs/generated/` | `tools/build_models.sh` | STL/3MF downloads, GLB models, preview images, parameter lists, revision of each part |
| `docs/assets/playground/openscad/` | `tools/fetch_openscad_wasm.sh` | OpenSCAD compiled to WebAssembly |
| `build/` | both | intermediate files |
| `site/` | `mkdocs build` | the finished website |

## Building the website on your computer

You need OpenSCAD (2026.11 or a recent development snapshot) and Python 3.

```bash
tools/build_models.sh
tools/fetch_openscad_wasm.sh
pip install -r requirements-docs.txt
mkdocs serve
```

Then open http://127.0.0.1:8000. Set `OPENSCAD=/path/to/openscad` if OpenSCAD is not on your `PATH`.
