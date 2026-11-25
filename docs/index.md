--8<-- "README.md"

## Showcase

The whole assembly with its default parameters. Drag to rotate, scroll to zoom, right-drag to pan.

<div class="ti-viewer" markdown="0">
  <model-viewer id="showcase-viewer" src="generated/chlamydomonas.glb"
      reveal="manual" camera-controls touch-action="pan-y" camera-orbit="200deg 75deg auto"
      shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral"
      alt="3D model of a Chlamydomonas reinhardtii cell with its eyespot and two flagella">
    <div slot="poster" class="ti-poster">
      <img src="generated/chlamydomonas.png" alt="Preview of the Chlamydomonas model">
      <button class="md-button md-button--primary ti-reveal"
          onclick="this.closest('model-viewer').dismissPoster()">View in 3D</button>
    </div>
  </model-viewer>
  <div class="ti-legend">
    <span class="ti-tag" data-part="cell">Cell body</span>
    <span class="ti-tag" data-part="eyespot">Eyespot</span>
    <span class="ti-tag" data-part="flagella">Flagella</span>
  </div>
</div>

<p class="ti-meta" markdown="0">
  <code>trappy-inator:chlamydomonas</code> · rev <code class="ti-rev">…</code> ·
  <a href="generated/models/chlamydomonas_cell.stl" download>Cell body STL</a> ·
  <a href="generated/models/chlamydomonas_eyespot.stl" download>Eyespot STL</a> ·
  <a href="generated/models/chlamydomonas_flagella.stl" download>Flagella STL</a> ·
  <a href="generated/models/chlamydomonas.3mf" download>Coloured 3MF</a> ·
  <a href="playground/">Open in the Playground</a>
</p>

<script type="module" src="assets/showcase.js"></script>
