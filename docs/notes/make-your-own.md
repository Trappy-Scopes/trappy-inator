# Make your own

How to start a new Trappy-Scopes project from this template and customise it.

## 1. Create the repository

On GitHub, open `Trappy-Scopes/trappy-inator` and choose **Use this template → Create a new repository**. Clone it.

Then edit:

- `README.md`: one line on what the project is, then a few paragraphs.
- `mkdocs.yml`: `site_name`, `site_description`, `site_url`, `repo_url`, `repo_name`, `copyright`. Leave the
  `theme`, `markdown_extensions` and `extra_javascript` blocks as they are; they are the shared Trappy-Scopes look.
- Delete `docs/notes/` and its entry in `nav`, and delete `cad/parts/chlamydomonas/`.

## 2. Add your parts

**A parametric part.** Create `cad/parts/<part>/<part>.scad`.

- Write parameters in the Customizer format (see [How it works](how-it-works.md#writing-parameters)).
- If the part has several colours or filaments, give it a `part` parameter that selects each colour body
  (`part = "assembly"; // [assembly, body, lid]`) and a colour parameter for each. The Chlamydomonas file is a
  complete example.
- Optional presets go in `cad/parts/<part>/<part>.json` (OpenSCAD parameter sets).

**A plain STL part.** Copy the file to `cad/frozen/<part>/<file>.stl`. Add `cad/frozen/<part>/colour` with a hex
colour if it should not be grey. Use short, stable folder names (`base-plate`, not `Base Plate 6.3mm (FSSBTv3) v2`);
the version comes from git, not from the file name.

Then list your parts in `tools/build_models.sh`. The Chlamydomonas section shows the commands for a parametric
part; frozen parts are found automatically.

## 3. Show them on the website

**Showcase.** Copy the `<model-viewer>` block from `docs/index.md` and change the file names. For a frozen part the
files are `generated/frozen/<part>/<file>.glb` and `.png`:

```html
<div class="ti-viewer" markdown="0">
  <model-viewer src="generated/frozen/base-plate/base-plate.glb" reveal="manual" camera-controls
      touch-action="pan-y" shadow-intensity="0.8" tone-mapping="neutral" alt="Base plate">
    <div slot="poster" class="ti-poster">
      <img src="generated/frozen/base-plate/base-plate.png" alt="Base plate">
      <button class="md-button md-button--primary ti-reveal"
          onclick="this.closest('model-viewer').dismissPoster()">View in 3D</button>
    </div>
  </model-viewer>
</div>
```

On pages below the site root (for example `bom.md`, which becomes `/bom/`), start the paths with `../`.

**Playground.** Open `docs/assets/playground/playground.js` and edit the `CONFIG` block at the top:

| Field | Meaning |
|---|---|
| `name` | the file name of the part, e.g. `pumpbox` |
| `id` | how the part is cited, e.g. `plumbing:pumpbox` |
| `parts` | the colour bodies: the `part` value in the `.scad` and the parameter holding its colour |
| `hidden` | parameters not shown in the form (at least `part`) |
| `draft` | the coarse `$fa`/`$fs` used while dragging |

Everything else (tabs, sliders, links, downloads) is generated from the `.scad` file.

**Bill of materials, assembly, disassembly.** Edit `docs/bom.md`, `docs/assembly.md` and `docs/disassembly.md`
as normal Markdown.

## 4. Publish

Push to `main`. GitHub Actions builds the models and the website and publishes it to the `gh-pages` branch. Once,
in the repository settings, set **Pages → Source** to the `gh-pages` branch, root folder. The site appears at
`https://trappy-scopes.github.io/<project>/`.

## What not to change

The theme, colours and viewer settings are shared by every Trappy-Scopes site. Change them here, in trappy-inator,
so all sites follow; a project that changes them locally drifts away from the others.
