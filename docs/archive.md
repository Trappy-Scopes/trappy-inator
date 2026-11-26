# Version archive

Render any committed version of a part from its address, `project:model/part@revision`, for example
`trappy-inator:chlamydomonas/cell@9fccbcf` for the cell body alone, or `trappy-inator:chlamydomonas@9fccbcf` for
the whole assembly. Inside this project the project can be left out: `chlamydomonas/cell@9fccbcf`. The
page fetches that exact `.scad` file, plus anything it includes, uses or imports from the same commit, and renders
it with OpenSCAD in your browser. Nothing is stored on this website: the repository's own history is the archive.

<form id="va-form" class="ti-va-form" markdown="0">
  <input id="va-url" type="text" required placeholder="chlamydomonas/cell@9fccbcf" aria-label="Part address">
  <button class="md-button md-button--primary" type="submit">Render</button>
</form>

<div class="ti-viewer" markdown="0">
  <model-viewer id="va-viewer" camera-controls touch-action="pan-y" camera-orbit="200deg 75deg auto"
      shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral" alt="3D model of the archived part"></model-viewer>
  <span id="va-status" class="ti-status ti-ok">Type a part address above</span>
</div>

<p id="va-info" class="ti-meta" markdown="0"></p>

<div id="va-downloads" class="ti-downloads" hidden markdown="0">
  <button class="md-button md-button--primary" id="va-stl">STL</button>
  <button class="md-button" id="va-3mf">3MF</button>
  <span id="va-download-status"></span>
</div>

??? note "Source of this version"
    <pre id="va-source" markdown="0"></pre>

## Finding an address

Every part shows its address in the [Catalog](catalog.md), and the Playground shows it under **Cite this
configuration**. For older revisions, open the part's folder on GitHub and click **History**: each commit listed
there is a revision, and its short hash (the seven characters on the right) goes after the `@`.

A GitHub link to any `.scad` file also works, for files outside the usual `cad/parts/<part>/` layout.

## What to expect

- The part renders with the default values it had in that revision. The download name carries the commit, for
  example `chlamydomonas_cell@9fccbcf.stl`.
- The model is shown in grey; colours from `color()` are kept in the 3MF.
- The repository must be public, because your browser fetches the files directly from GitHub.
- Old files run on today's OpenSCAD (the version in the Playground). Features that were removed since may give an
  error; the status line shows OpenSCAD's message.
- Libraries that are not in the same repository, such as BOSL2 installed on someone's computer, cannot be
  fetched. Missing files are listed under the model.

<script type="module" src="../assets/playground/archive.js"></script>
