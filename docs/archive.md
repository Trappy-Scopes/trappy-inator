# Version archive

Render any committed version of a part. Paste a link to a `.scad` file and the page fetches that exact file, plus
anything it includes, uses or imports from the same commit, and renders it with OpenSCAD in your browser. Nothing
is stored on this website: the repository's own history is the archive.

<form id="va-form" class="ti-va-form" markdown="0">
  <input id="va-url" type="url" required placeholder="https://github.com/Trappy-Scopes/trappy-inator/blob/9fccbcf/cad/parts/chlamydomonas/chlamydomonas.scad" aria-label="Link to a .scad file">
  <button class="md-button md-button--primary" type="submit">Render</button>
</form>

<div class="ti-viewer" markdown="0">
  <model-viewer id="va-viewer" camera-controls touch-action="pan-y" camera-orbit="200deg 75deg auto"
      shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral" alt="3D model of the archived part"></model-viewer>
  <span id="va-status" class="ti-status ti-ok">Paste a link above</span>
</div>

<p id="va-info" class="ti-meta" markdown="0"></p>

<div id="va-downloads" class="ti-downloads" hidden markdown="0">
  <button class="md-button md-button--primary" id="va-stl">STL</button>
  <button class="md-button" id="va-3mf">3MF</button>
  <span id="va-download-status"></span>
</div>

??? note "Source of this version"
    <pre id="va-source" markdown="0"></pre>

## Finding the link to an old version

1. On GitHub, open the part's `.scad` file and click **History**.
2. Click the commit you want, then **View file** (or the `<>` button) on that file.
3. Copy the address. It contains the commit, for example `.../blob/9fccbcf/cad/...`, so it always points to that
   version.

On any file page, pressing <kbd>y</kbd> swaps a branch name in the address for the current commit. A link to a branch
such as `main` works too, but it follows the branch, so it shows whatever is newest.

## What to expect

- The file renders with the default values it had in that commit. The download name carries the commit, for
  example `chlamydomonas@9fccbcf.stl`.
- The model is shown in grey; colours from `color()` are kept in the 3MF.
- The repository must be public, because your browser fetches the files directly from GitHub.
- Old files run on today's OpenSCAD (the version in the Playground). Features that were removed since may give an
  error; the status line shows OpenSCAD's message.
- Libraries that are not in the same repository, such as BOSL2 installed on someone's computer, cannot be
  fetched. Missing files are listed under the model.

<script type="module" src="../assets/playground/archive.js"></script>
