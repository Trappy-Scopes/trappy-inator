// SPDX-License-Identifier: CERN-OHL-S-2.0
// Copyright (c) 2026 Yatharth Bhasin (Trappy-Scopes Project), Living Physics Group, GIMM Oeiras
//
// chlamydomonas.scad -- parametric facsimile of Chlamydomonas reinhardtii, to scale.
// A prolate (optionally egg-shaped) cell body, one eyespot, two flagella in one beat plane.
//
// Units: every biological dimension is in micrometres (um). `millimetres_per_micrometre` scales the model.
// Frame: z = long axis, anterior (flagella end) up; the flagella beat in the x-z plane; the cis flagellum
// (the one nearest the eyespot) is on +x.
// Parameter names read as their own label (cell_length -> "Cell length"); units are in the comments.
// Curve smoothness is set only through $fa / $fs, so a viewer can render a quick draft by overriding them.
//
// Starting values and where they come from (edit freely):
//   cell about 10 um, prolate              BioNumbers 109758; Martinez et al. 2012, arXiv:1202.1702
//   cells 10-22 um long, 8-22 um wide      Wikipedia, Chlamydomonas reinhardtii
//   flagella 10-12 um                      Martinez et al. 2012
//   eyespot 0.6-1.5 um^2, near the equator, on the cis-flagellum side
//                                          https://pmc.ncbi.nlm.nih.gov/articles/PMC3811559
//   eyespot: two layers of carotenoid globules   https://pmc.ncbi.nlm.nih.gov/articles/PMC3531860
//   Everything else (papilla, exit spacing and pose of the flagella, eyespot angle and tilt) is a placeholder.

/* [Cell shape] */
// Anterior to posterior pole (µm)
cell_length = 10; // [6:0.5:22]
// Equatorial diameter (µm)
cell_width = 8; // [4:0.5:22]
// 0 = ellipsoid; higher = egg-shaped, narrower towards the flagella
anterior_taper = 0.3; // [0:0.05:0.8]
// Cell-wall bump between the two flagella (µm)
papilla_height = 0.4; // [0:0.1:1.5]
// In µm
papilla_width = 0.8; // [0.2:0.1:2]

/* [Flagella] */
// The flagellum nearest the eyespot (µm)
cis_flagellum_length = 12; // [0:0.5:20]
// In µm
trans_flagellum_length = 12; // [0:0.5:20]
// In µm
flagellum_diameter = 0.25; // [0.1:0.05:0.5]
// Micrometres between the two exit points
flagellum_base_separation = 1.0; // [0.2:0.1:3]
// Degrees from the long axis where a flagellum leaves the cell
flagellum_exit_angle = 25; // [0:1:90]
// Degrees the flagellum curls outwards from base to tip
flagellum_bend_angle = 70; // [-90:1:180]

/* [Eyespot] */
// Long axis (µm)
eyespot_length = 1.5; // [0.5:0.1:3]
// Width as a fraction of the length
eyespot_width_ratio = 0.6; // [0.2:0.05:1]
// In µm
eyespot_thickness = 0.3; // [0.1:0.05:0.8]
// Degrees around the long axis from the beat plane, towards the cis flagellum
eyespot_azimuth = 45; // [0:1:180]
// Degrees above (+) or below (-) the equator
eyespot_latitude = 0; // [-60:1:60]
// Degrees the long axis is turned from the equator towards the poles
eyespot_tilt = 0; // [0:1:90]
// Micrometres the eyespot stands proud of the surface, so it shows
eyespot_raise = 0.1; // [0:0.05:0.5]

/* [Colours] */
// Chloroplast green
cell_colour = "#4C8C3A";
// Carotenoid orange-red
eyespot_colour = "#E4572E";
// Pale
flagellum_colour = "#E9E4D6";

/* [Output] */
part = "assembly"; // [assembly, cell, eyespot, flagella]
// Model scale: 5 -> a 10 um cell is 50 mm long
millimetres_per_micrometre = 5; // [1:0.5:20]
// Flagella are thickened to at least this so they print (mm)
minimum_printed_thickness = 1.2; // [0.4:0.1:3]

/* [Hidden] */
$fa = 3;
$fs = 0.3;                  // mm
flagellum_segments = 48;

// ---------------- derived (micrometres unless named _mm) ----------------
function mm(micrometres) = micrometres * millimetres_per_micrometre;

equator_radius      = cell_width / 2;
anterior_semi_axis  = cell_length / 2 * (1 + anterior_taper / 2);   // the two halves share the equator radius
posterior_semi_axis = cell_length - anterior_semi_axis;

function cell_radius(z) = let(a = z >= 0 ? anterior_semi_axis : posterior_semi_axis)
                          equator_radius * sqrt(max(0, 1 - (z / a) * (z / a)));
function anterior_surface_z(r) = anterior_semi_axis * sqrt(max(0, 1 - (r / equator_radius) * (r / equator_radius)));

flagellum_thickness_mm = max(mm(flagellum_diameter), minimum_printed_thickness);
eyespot_width = eyespot_length * eyespot_width_ratio;

assert(cell_length > 0 && cell_width > 0, "cell size must be positive");
assert(flagellum_base_separation / 2 < equator_radius, "flagella would leave the cell outside its outline");

// ---------------- cell body ----------------
module cell_outline_2d(steps = 96) {
    profile = concat(
        [for (i = [0:steps]) let(z = -posterior_semi_axis * cos(90 * i / steps)) [mm(cell_radius(z)), mm(z)]],
        [for (i = [1:steps]) let(z = anterior_semi_axis * sin(90 * i / steps)) [mm(cell_radius(z)), mm(z)]]
    );
    polygon(concat([[0, mm(-posterior_semi_axis)]], profile, [[0, mm(anterior_semi_axis)]]));
}

module cell_body() {
    rotate_extrude() cell_outline_2d();
    if (papilla_height > 0)
        translate([0, 0, mm(anterior_semi_axis - papilla_height / 2)])
            scale([mm(papilla_width / 2), mm(papilla_width / 2), mm(papilla_height)]) sphere(r = 1);
}

// ---------------- flagella ----------------
// Planar curve with constant curvature: the angle from +z grows from the exit angle by the bend angle.
function flagellum_point(s, length) =
    let(start_x = flagellum_base_separation / 2,
        start_z = anterior_surface_z(start_x),
        a0 = flagellum_exit_angle,
        bend = flagellum_bend_angle,
        a = a0 + bend * s / length)
    abs(bend) < 1e-6
        ? [start_x + s * sin(a0), start_z + s * cos(a0)]
        : let(radius = length / (bend * PI / 180))
          [start_x + radius * (cos(a0) - cos(a)), start_z + radius * (sin(a) - sin(a0))];

module one_flagellum(length) {
    points = [for (i = [0:flagellum_segments]) flagellum_point(length * i / flagellum_segments, length)];
    inward = [-sin(flagellum_exit_angle), -cos(flagellum_exit_angle)] * (flagellum_thickness_mm / millimetres_per_micrometre);
    all_points = concat([points[0] + inward], points);   // starts inside the cell so it is anchored
    for (i = [0:len(all_points) - 2])
        hull() {
            translate([mm(all_points[i][0]), 0, mm(all_points[i][1])]) sphere(d = flagellum_thickness_mm);
            translate([mm(all_points[i + 1][0]), 0, mm(all_points[i + 1][1])]) sphere(d = flagellum_thickness_mm);
        }
}

module flagella_raw() {
    if (cis_flagellum_length > 0)   one_flagellum(cis_flagellum_length);
    if (trans_flagellum_length > 0) mirror([1, 0, 0]) one_flagellum(trans_flagellum_length);
}

// ---------------- eyespot ----------------
module eyespot_raw() {
    semi_axis = eyespot_latitude >= 0 ? anterior_semi_axis : posterior_semi_axis;
    rotate([0, 0, eyespot_azimuth])
        translate([mm(equator_radius * cos(eyespot_latitude)), 0, mm(semi_axis * sin(eyespot_latitude))])
            rotate([0, -eyespot_latitude, 0])
                translate([mm(eyespot_raise - eyespot_thickness / 2), 0, 0])
                    rotate([eyespot_tilt, 0, 0])
                        scale([mm(eyespot_thickness / 2), mm(eyespot_length / 2), mm(eyespot_width / 2)]) sphere(r = 1);
}

// ---------------- colour bodies (no overlaps, so each can be its own filament) ----------------
module cell_part()     { difference() { cell_body(); eyespot_raw(); } }
module eyespot_part()  { eyespot_raw(); }
module flagella_part() { difference() { flagella_raw(); cell_body(); } }

if (part == "assembly") {
    color(cell_colour)      cell_part();
    color(eyespot_colour)   eyespot_part();
    color(flagellum_colour) flagella_part();
}
else if (part == "cell")     color(cell_colour)      cell_part();
else if (part == "eyespot")  color(eyespot_colour)   eyespot_part();
else if (part == "flagella") color(flagellum_colour) flagella_part();
