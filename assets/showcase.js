// SPDX-License-Identifier: GPL-3.0-or-later
// Showcase: fill in the part revision and highlight a part while its name is hovered.
const viewer = document.getElementById("showcase-viewer");

fetch("generated/chlamydomonas.version.json")
  .then((r) => r.json())
  .then((v) => document.querySelectorAll(".ti-rev").forEach((e) => (e.textContent = v.revision)))
  .catch(() => {});

document.querySelectorAll(".ti-legend [data-part]").forEach((tag) => {
  const glow = (on) => {
    const m = viewer.model?.materials.find((x) => x.name === tag.dataset.part);
    if (m) m.setEmissiveFactor(on ? [0.35, 0.35, 0.35] : [0, 0, 0]);
  };
  tag.addEventListener("mouseenter", () => { viewer.dismissPoster(); glow(true); });
  tag.addEventListener("mouseleave", () => glow(false));
});
