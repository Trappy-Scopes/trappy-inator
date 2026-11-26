# Catalog

Every part of the project, with its 3D view, description and files. Drag a model to rotate it.

## Parts

<div class="ti-cat" markdown="0">

  <div class="ti-cat-row">
    <div class="ti-viewer">
      <model-viewer src="../generated/chlamydomonas_flagella.glb" reveal="manual" camera-controls touch-action="pan-y"
          shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral" alt="The two flagella">
        <div slot="poster" class="ti-poster"><img src="../generated/chlamydomonas_flagella.png" alt="Preview of the flagella" loading="lazy">
          <button class="md-button md-button--primary ti-reveal" onclick="this.closest('model-viewer').dismissPoster()">View in 3D</button></div>
      </model-viewer>
    </div>
    <div class="ti-cat-text">
      <h3>Flagella</h3>
      <p>The two flagella (cilia), about 0.25 µm thick and 10–12 µm long, leaving the cell on either side of the
      papilla. The cis flagellum is the one nearest the eyespot. Both beat in one plane; the model shows them at the
      start of the power stroke.</p>
      <p class="ti-cat-meta"><code>trappy-inator:chlamydomonas@<span class="ti-rev">…</span></code> · part <code>flagella</code></p>
      <p>Tunable: length of each flagellum, diameter, exit spacing, exit angle, bend.</p>
      <p class="ti-cat-links"><a href="../generated/models/chlamydomonas_flagella.stl" download>STL</a> ·
        <a href="../playground/">Open in the Playground</a></p>
    </div>
  </div>

  <div class="ti-cat-row">
    <div class="ti-viewer">
      <model-viewer src="../generated/chlamydomonas_eyespot.glb" reveal="manual" camera-controls touch-action="pan-y"
          shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral" alt="The eyespot">
        <div slot="poster" class="ti-poster"><img src="../generated/chlamydomonas_eyespot.png" alt="Preview of the eyespot" loading="lazy">
          <button class="md-button md-button--primary ti-reveal" onclick="this.closest('model-viewer').dismissPoster()">View in 3D</button></div>
      </model-viewer>
    </div>
    <div class="ti-cat-text">
      <h3>Eyespot</h3>
      <p>The orange-red light sensor: layers of carotenoid globules, about 0.6–1.5 µm² in area, near the cell
      equator on the side of the cis flagellum. In the model it stands slightly proud of the surface so it can be seen
      and printed in its own colour.</p>
      <p class="ti-cat-meta"><code>trappy-inator:chlamydomonas@<span class="ti-rev">…</span></code> · part <code>eyespot</code></p>
      <p>Tunable: length, width, thickness, angle from the beat plane, height from the equator, tilt.</p>
      <p class="ti-cat-links"><a href="../generated/models/chlamydomonas_eyespot.stl" download>STL</a> ·
        <a href="../playground/">Open in the Playground</a></p>
    </div>
  </div>

  <div class="ti-cat-row">
    <div class="ti-viewer">
      <model-viewer src="../generated/chlamydomonas_cell.glb" reveal="manual" camera-controls touch-action="pan-y"
          shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral" alt="The cell body">
        <div slot="poster" class="ti-poster"><img src="../generated/chlamydomonas_cell.png" alt="Preview of the cell body" loading="lazy">
          <button class="md-button md-button--primary ti-reveal" onclick="this.closest('model-viewer').dismissPoster()">View in 3D</button></div>
      </model-viewer>
    </div>
    <div class="ti-cat-text">
      <h3>Cell body</h3>
      <p>A prolate cell about 10 µm long and 8 µm wide, optionally egg-shaped and narrower towards the flagella, with
      the papilla between the two flagella. The eyespot sits in a pocket on its surface.</p>
      <p class="ti-cat-meta"><code>trappy-inator:chlamydomonas@<span class="ti-rev">…</span></code> · part <code>cell</code></p>
      <p>Tunable: length, width, anterior taper, papilla height and width.</p>
      <p class="ti-cat-links"><a href="../generated/models/chlamydomonas_cell.stl" download>STL</a> ·
        <a href="../playground/">Open in the Playground</a></p>
    </div>
  </div>

</div>

## Assemblies

<div class="ti-cat" markdown="0">

  <div class="ti-cat-row">
    <div class="ti-viewer">
      <model-viewer src="../generated/chlamydomonas.glb" reveal="manual" camera-controls touch-action="pan-y"
          shadow-intensity="0.8" exposure="1.1" tone-mapping="neutral" alt="The whole Chlamydomonas cell">
        <div slot="poster" class="ti-poster"><img src="../generated/chlamydomonas.png" alt="Preview of the whole cell" loading="lazy">
          <button class="md-button md-button--primary ti-reveal" onclick="this.closest('model-viewer').dismissPoster()">View in 3D</button></div>
      </model-viewer>
    </div>
    <div class="ti-cat-text">
      <h3><em>Chlamydomonas reinhardtii</em></h3>
      <p>The whole cell: cell body, eyespot and both flagella, to scale. At the default print scale of 5 mm per µm the
      cell is 50 mm long. Each part is a separate body, so it can be printed in its own filament.</p>
      <p class="ti-cat-meta"><code>trappy-inator:chlamydomonas@<span class="ti-rev">…</span></code></p>
      <p>Contains: 1 × cell body, 1 × eyespot, 2 × flagellum.</p>
      <p class="ti-cat-links"><a href="../generated/models/chlamydomonas.3mf" download>Coloured 3MF</a> ·
        <a href="../playground/">Open in the Playground</a> · <a href="../bom/">Bill of materials</a></p>
    </div>
  </div>

</div>

<script>
fetch("../generated/chlamydomonas.version.json").then((r) => r.json())
  .then((v) => document.querySelectorAll(".ti-rev").forEach((e) => (e.textContent = v.revision))).catch(() => {});
</script>
