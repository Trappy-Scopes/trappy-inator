# GitHub Actions

GitHub Actions is GitHub's build service: a fresh Linux machine that runs a list of steps every time something
happens in the repository. Here it turns the source files into the website. The whole recipe is one file,
`.github/workflows/site.yml`. This note goes through it line by line.

## When it runs

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:
```

| Trigger | When | Why |
|---|---|---|
| `push` to `main` | every time you push | the website always matches the latest source |
| `schedule` | every night at 03:00 UTC | changes to the shared look (theme, viewer) reach the site even when the project itself did not change |
| `workflow_dispatch` | when you press **Run workflow** on the repository's **Actions** tab | to rebuild by hand, e.g. after changing the Pages settings |

Pushes to other branches do not publish anything, so you can work on a branch without changing the live site.

## Permissions and order

```yaml
permissions:
  contents: write
concurrency:
  group: pages
  cancel-in-progress: true
```

- `contents: write` lets the workflow push the finished website to the `gh-pages` branch. It never writes to
  `main`: only people do that.
- `concurrency` makes sure only one build publishes at a time. If you push twice quickly, the older build is
  cancelled and only the newest is published.
- No secrets or tokens are needed; GitHub gives the workflow a temporary token for its own repository.

## The steps

The job runs on `ubuntu-latest`, a clean Linux machine created for this run and thrown away afterwards. Nothing
is kept between runs.

### 1. Check out the repository

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

Copies the repository onto the machine. `fetch-depth: 0` fetches the full history, because each part's revision
is "the last commit that changed this part's folder", and that needs the history.

### 2. Set up Python

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: "3.12"
```

Python runs the STL-to-GLB converter and MkDocs.

### 3. Install OpenSCAD

```yaml
env:
  OPENSCAD_VERSION: 2026.11-RC1
```

Downloads the official OpenSCAD AppImage for that version from files.openscad.org, checks it against its published
SHA-256 checksum (the build stops if it does not match), and unpacks it. It also installs `xvfb`, a virtual screen,
because OpenSCAD needs one to draw preview images on a machine without a display.

To move to a newer OpenSCAD, change `OPENSCAD_VERSION` here and the version and checksum in
`tools/fetch_openscad_wasm.sh` (the browser build used by the Playground), so both stay the same version.

### 4. Build the models

```yaml
- name: Build models
  run: xvfb-run -a tools/build_models.sh
```

Runs `tools/build_models.sh` (see [How it works](how-it-works.md)). For each parametric part it writes the STL per
colour body, the coloured 3MF, the parameter list, the preset file, a copy of the `.scad` for the Playground, the
3D models and the preview images. For each folder in `cad/frozen/` it copies the STLs and makes their 3D models and
previews. It also records each part's revision. Everything goes to `docs/generated/`.

`--hardwarnings` makes OpenSCAD treat warnings as errors, so a failed `assert()` in a part stops the build instead
of publishing a broken model.

### 5. Fetch OpenSCAD for the Playground

```yaml
- name: Fetch OpenSCAD for the Playground
  run: tools/fetch_openscad_wasm.sh
```

Downloads OpenSCAD compiled to WebAssembly (about 3 MB, checksum-verified) into
`docs/assets/playground/openscad/`. Visitors' browsers load it from the website when they open the Playground.

### 6. Build and publish the website

```yaml
- name: Build and publish site
  run: |
    pip install -r requirements-docs.txt
    mkdocs gh-deploy --force
```

Installs MkDocs, Material for MkDocs and the diagram plugin at the versions in `requirements-docs.txt`, builds the
website, and pushes it to the `gh-pages` branch, replacing the previous version. GitHub Pages then serves that
branch at `https://trappy-scopes.github.io/<project>/` within a minute or two.

## Setting it up once per repository

1. Push the repository with `.github/workflows/site.yml` in it. The first run creates the `gh-pages` branch.
2. In the repository settings, open **Pages** and set **Source** to **Deploy from a branch**, branch `gh-pages`,
   folder `/ (root)`.
3. GitHub Pages on a private repository needs a paid GitHub plan; on a free plan, make the repository public.

## When a run fails

Open the repository's **Actions** tab, click the failed run, then the red step. The log shows the error.

| Failing step | Usual cause | Fix |
|---|---|---|
| Install OpenSCAD | the version in `OPENSCAD_VERSION` no longer exists on files.openscad.org | change it to a current release and update the checksum in `tools/fetch_openscad_wasm.sh` |
| Build models | an `assert()` failed or the `.scad` has an error | run `tools/build_models.sh` on your computer, fix the part |
| Fetch OpenSCAD for the Playground | checksum mismatch after changing the version | copy the new SHA-256 from the `.sha256` file next to the download |
| Build and publish site | a page links to a file that does not exist, or a package version changed | run `mkdocs build` locally and read the warning |

A failed run publishes nothing, so the live site keeps the last good version.

## Cost

GitHub Actions is free for public repositories. A run takes a few minutes, mostly installing OpenSCAD and Python
packages.
