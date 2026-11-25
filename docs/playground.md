# Playground

Tune every parameter of the *Chlamydomonas* assembly. Shape changes are rendered by OpenSCAD in your browser, as a quick draft while you drag and in full quality when you let go; colours change instantly. Drag the model to rotate, scroll to zoom, right-drag to pan.

<div class="ti-viewer" markdown="0">
  <model-viewer id="pg-viewer" src="../generated/chlamydomonas.glb" camera-controls touch-action="pan-y"
      camera-orbit="200deg 75deg auto" shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral"
      alt="3D model of the Chlamydomonas cell with the parameters chosen below"></model-viewer>
  <span id="pg-status" class="ti-status ti-ok">Default model</span>
  <span class="ti-rev-corner">rev <span class="ti-rev">…</span></span>
</div>

## Parameters

<div id="pg-app" markdown="0">
  <div class="ti-toolbar">
    <select id="pg-preset" aria-label="Preset"></select>
    <span id="pg-changed">0 changed</span>
    <button class="md-button" id="pg-reset">Reset all</button>
  </div>
  <div class="ti-tabs" id="pg-tabs" role="tablist"></div>
  <div id="pg-form"><p>Loading parameters…</p></div>
</div>

## Share and download

The link below opens the Playground with your parameters. It records only the values you changed.

<div class="ti-link" markdown="0"><code id="pg-link"></code><button class="md-clipboard md-icon" id="pg-copy" title="Copy link"></button></div>

<div class="ti-downloads" markdown="0">
  <button class="md-button md-button--primary" data-download="cell">Cell body STL</button>
  <button class="md-button md-button--primary" data-download="eyespot">Eyespot STL</button>
  <button class="md-button md-button--primary" data-download="flagella">Flagella STL</button>
  <button class="md-button" data-download="3mf">Coloured 3MF</button>
  <span id="pg-download-status"></span>
</div>

!!! quote "Cite this configuration"
    <span id="pg-cite" markdown="0">trappy-inator:chlamydomonas</span>

<script type="module" src="../assets/playground/playground.js"></script>
