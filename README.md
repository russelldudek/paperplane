# Paper Airplane Lab

Paper Airplane Lab is a local-first, physics-informed web application for inventing, building, testing, and improving paper airplanes. It combines a constrained aircraft generator, a reduced-order aerodynamic model, structured folding instructions, printable laboratory sheets, and real-flight test logging.

The application does **not** claim computational-fluid-dynamics precision. It uses standard aerodynamic relationships, bounded coefficient assumptions, buildability constraints, and visible uncertainty ranges to make defensible comparisons between paper-airplane designs.

## What the MVP includes

- Guided aircraft generation for distance, airtime, accuracy, aerobatics, and payload missions.
- Seven validated starting families: narrow dart, dart glider, broad glider, flying wing, accuracy trainer, stunt loop, and payload carrier.
- Seeded hybrid generation that mutates proven families while rejecting unsupported geometry and unstable mass distributions.
- An engineering workbench for span, chord, sweep, dihedral, incidence, nose mass, control tabs, paper, payload, launch, and wind.
- Calculated mass, wing area, aspect ratio, wing loading, and Reynolds number.
- Modeled stall speed, glide ratio, sink rate, static margin, distance, airtime, and stability.
- Low/nominal/high prediction ranges with explicit calculated, modeled, and heuristic labels.
- Structured SVG fold instructions and a browser-printable laboratory package.
- IndexedDB-backed local Hangar and flight-test history.
- One-change-at-a-time diagnostic recommendations for stalls, dives, turns, spirals, flutter, and short stable flights.
- Versioned JSON design import/export and quoted CSV flight-test import/export.
- Age-adjusted physics explanations for Explorer, Investigator, and Engineer levels.

## Run locally

Requirements:

- Node.js 22.12 or newer
- npm 10 or newer

```bash
npm install
npm run dev
```

Vite prints the local development URL. The app works without an account or server; saved designs and flight attempts remain in the current browser's IndexedDB database.

## Quality commands

```bash
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

The production build is written to `dist/`.

## Core workflow

1. Select a mission and learner profile in **Invent**.
2. Generate three meaningfully different, physically screened candidates.
3. Select a candidate and change one variable at a time in **Workbench**.
4. Save the revision locally or export a versioned JSON package.
5. Follow the structured SVG sequence in **Build** and print the laboratory worksheet.
6. Record repeated throws in **Flight Lab**, compare measured and predicted performance, and apply one bounded trim adjustment.
7. Export flight attempts to CSV for classroom or external analysis.

## Physics model

The model uses standard reduced-order relationships:

- Dynamic pressure: `q = 0.5 × ρ × V²`
- Lift: `L = q × S × CL`
- Drag: `D = q × S × CD`
- Reynolds number: `Re = ρ × V × c̄ / μ`
- Wing loading: `W / S`
- Aspect ratio: `b² / S`
- Induced-drag approximation: `CD = CD0 + CL² / (πeAR)`

Aircraft geometry and material properties determine mass, projected wing area, aspect ratio, and wing loading. Family-specific bounded profiles estimate low-Reynolds-number lift, drag, neutral point, directional stability, and payload capacity. The trajectory estimate combines launch transition, usable height, glide ratio, sink rate, stability efficiency, and environmental loss.

Every prediction includes uncertainty derived from launch repeatability, coefficient assumptions, geometry alignment, mission type, and environment. These are deterministic engineering bounds—not statistical confidence intervals from a large calibrated fleet.

## Scientific limitations

This MVP intentionally excludes:

- Full CFD or boundary-layer simulation.
- A full six-degree-of-freedom rigid-body solver.
- Finite-element paper deformation and crease stiffness.
- Automatic coefficient learning from a single user's throws.
- Camera-based trajectory measurement.
- Certification-grade absolute predictions.

Folded paper has flexible surfaces, blunt leading edges, changing camber, layer gaps, roughness, and large manufacturing variation. Those effects are represented through bounded coefficient families and empirical penalties. Real-world repeated testing remains part of the laboratory method, not an afterthought.

## Architecture

```text
src/
├── app/                       application composition and navigation
├── domain/
│   ├── aerodynamics/          reduced-order flight predictions and uncertainty
│   ├── aircraft/              versioned genome and seven base families
│   ├── experiments/           observed-behavior diagnostics
│   ├── generation/            seeded mutation, validation, scoring, ranking
│   ├── instructions/          structured crease and fold instructions
│   ├── materials/             paper mass, stiffness, and roughness data
│   └── shared/                units, ranges, launch, environment, learner types
├── features/                  Invent, Workbench, Build, Flight Lab, Hangar, Learn
├── infrastructure/
│   ├── import-export/         validated JSON and CSV packages
│   └── persistence/           IndexedDB repositories
├── styles/                    global tokens, responsive UI, and print rules
└── ui/                        reusable metrics and controls
```

Domain modules do not import React or IndexedDB. Feature components use repository interfaces, allowing a later cloud adapter without rewriting the physics and generation engines.

## Data portability

Designs export as `*.paperplane.json` packages containing:

- Format and schema version.
- Export timestamp.
- Complete aircraft genome.
- Model and calibration versions.
- Seed-derived geometry and construction constraints.

Imports are parsed as plain data, checked for required fields, restricted to supported enumerations and finite numeric values, and passed through the same geometry validator used by the generator.

Flight attempts export as RFC-style quoted CSV with timestamps, distance, airtime, observed behavior, launch style, and notes. Quotes, commas, and line breaks inside notes are escaped safely.

## Safety

Use open indoor space or a safe outdoor field. Never throw toward people, animals, traffic, windows, or fragile objects. Payload and paper-clip experiments require supervision appropriate to the learner's age. Advanced cut-paper and multi-sheet fabrication are deliberately outside this MVP.

## Status

This repository contains the initial testable MVP. The next scientific milestone is a controlled indoor reference fleet that measures whether design ranking and displayed intervals match repeated physical trials.
