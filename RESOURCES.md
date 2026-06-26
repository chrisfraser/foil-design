# Hydrodynamics of Underwater Foils — Resources

> Foil lift/drag math is **identical in air and water** — same equations, just swap air density (1.225 kg/m³) for seawater (~1025 kg/m³). A depressor is an inverted, cambered wing running at **low Reynolds number** and **very low aspect ratio** — two regimes where textbook wing theory *over-predicts* lift. Keep that caveat in mind for every aero source below.

## Knowledge

### Foundations — foil/airfoil theory
- [NASA Glenn — Beginner's Guide to Aeronautics (Aerodynamics)](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/learn-about-aerodynamics/) ⭐ *primary, beginner*
  Lift, drag, AoA, Cl/Cd, dynamic pressure — illustrated, no calculus. The trusted starting point.
- [NASA Glenn — The Lift Equation](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/) *beginner*
  The exact formula to size downforce. Use when computing force from speed/area/Cl.
- [NASA FoilSim (interactive)](https://www.nasa.gov/stem-content/foilsim/) *tool, beginner*
  Drag sliders for speed/AoA/camber, watch lift respond. Build intuition before math.
- [Anderson — *Fundamentals of Aerodynamics* (free)](https://archive.org/details/FundamentalsOfAerodynamics5thEdition) *textbook, intermediate→advanced*
  Standard university text. Deep reference once the NASA pages click (needs calculus).

### Finite & low-aspect-ratio wings (depressors are stubby!)
- [NASA Glenn — Induced Drag Coefficient](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/induced-drag-coefficient/) ⭐ *primary, beginner*
  Why a short, stubby foil leaks lift and pays drag. Core to sizing a depressor.
- [Aerospaceweb — Finite vs. Infinite Wing](https://aerospaceweb.org/question/aerodynamics/q0167.shtml) *beginner→intermediate*
- [AeroToolbox — Wing Area & Aspect Ratio](https://aerotoolbox.com/intro-wing-design/) *intermediate*
- [MDPI Aerospace — *Lift of Low Aspect Ratio Rectangular Flat Plate Wings*](https://www.mdpi.com/2226-4310/10/7/597) *paper, advanced*
  Closest match to the actual device. Helmbold's relation (lift-slope correction for AR < 1.5).

### Foil sections / NACA airfoils
- [Airfoil Tools](http://airfoiltools.com/) ⭐ *primary, beginner* — database + NACA generator + polars, no install.
- [Airfoil Tools — NACA 4-Digit Generator](http://airfoiltools.com/airfoil/naca4digit) *tool, beginner*
- [UIUC Airfoil Coordinates Database (Selig)](https://m-selig.ae.illinois.edu/ads/coord_database.html) *reference, intermediate* — strong on low-Re sections.
- [Wikipedia — NACA airfoil](https://en.wikipedia.org/wiki/NACA_airfoil) *beginner→intermediate* — decode e.g. NACA 2412 = 2% camber @ 40% chord, 12% thick.

### Tools — get Cl/Cd polars
- [XFLR5 (official)](https://xflr5.org/) ⭐ *primary, beginner→intermediate* — free GUI over XFOIL; gentle.
- [XFLR5 on SourceForge](https://sourceforge.net/projects/xflr5/) *intermediate* — canonical releases.
- [XFOIL (MIT, Mark Drela)](http://web.mit.edu/drela/Public/web/xfoil/) *advanced* + [User Primer](https://web.mit.edu/drela/Public/web/xfoil/xfoil_doc.txt)
  ⚠ Tools default to aircraft Reynolds numbers. At 3–10 kn you're at **lower Re** — set Re to your chord+speed and favour low-Re-tolerant sections.

### CFD & computational evaluation tools — the chosen three
> CAD is **Fusion 360** (no lessons needed). The trial trio spans the trade-off space: screen fast → simulate easy → validate deep. See the [CFD tool comparison reference](reference/cfd-tools.html). Pricing verified live 2026-06-26.
- **[XFLR5](https://sourceforge.net/projects/xflr5/)** — *free, beginner→intermediate.* Panel/VLM + XFOIL; **not** Navier–Stokes. Seconds-per-run **section screening**. ⚠ Trust its 2D section polars; **distrust its 3D numbers on a low-AR depressor**. No CAD import (build from `.dat` sections). Docs: [Guidelines PDF](https://sourceforge.net/projects/xflr5/files/Guidelines.pdf/download) · [forum](https://sourceforge.net/p/xflr5/discussion/679396/).
- **[SimScale](https://www.simscale.com/)** ⭐ *primary CFD, free Community tier, beginner.* Cloud **true Navier–Stokes** RANS (k-omega SST), native lift/drag output. **One-click [Fusion 360 add-in](https://www.simscale.com/product/integrations-partners/fusion-360-cad/)**, ~2–4 h to first result. ⚠ Community projects are **public**; defaults to **air — set fluid = water** (ρ≈997, ν≈1e-6); 16-core budget → use symmetry. [Pricing](https://www.simscale.com/product/pricing/) · [tutorials](https://www.simscale.com/docs/tutorials/) · [forum](https://www.simscale.com/forum/).
- **[OpenFOAM via FreeCAD CfdOF](https://github.com/jaheyns/CfdOF)** — *free (GPL), advanced.* The no-ceiling powerhouse: `simpleFoam` + k-omega SST + `forceCoeffs`. Import **STEP** from Fusion. ⚠ Steep — *trustworthy* numbers = weeks, not hours; single-phase only valid if foil is **fully submerged** (near-surface needs multiphase). [Install walkthrough](https://blog.freecad.org/2025/04/24/tutorial-installing-cfdof-wb-to-begin-exploring-computational-fluid-dynamics/) · [NACA0012 verification](https://www.openfoam.com/documentation/guides/latest/doc/verification-validation-naca0012-airfoil-2d.html) · [CFD Online forum](https://www.cfd-online.com/Forums/openfoam/).
  - Bonus zero-install: [AirfoilTools](http://airfoiltools.com/) precomputed XFOIL polars to eyeball sections before committing.

**Ruled out (verified):** Fusion 360 Sim Extension — structural/thermal only, **no external-flow CFD**. Autodesk CFD — exists but ~$7,295/yr, no hobbyist tier, separate app. SolidWorks Flow Sim — no Fusion fit, quote-only. Flow Illustrator — qualitative only, no quantitative lift/drag. *Possible 4th if on Windows:* Ansys Student (free, 512K-cell cap, advanced; Discovery Live good for instant qualitative ranking).

### CFD trust — don't believe pretty-but-wrong results ⭐ do this before relying on any CFD
- **[Fluid Mechanics 101 — Dr. Aidan Wimshurst (YouTube)](https://www.youtube.com/channel/UCcqQi9LT0ETkRoUu8eYaEkg)** *beginner.* Code-agnostic; teaches the skills that stop you trusting wrong results: [Getting Started with CFD](https://www.youtube.com/watch?v=Jp7FJpLVEPA), [y+ & near-wall meshing](https://www.youtube.com/watch?v=WEpheS_lBJ4), mesh-independence, convergence.
- **[NASA Turbulence Modeling Resource — NACA 0012 case](https://tmbwg.github.io/turbmodels/)** *advanced.* Canonical validation data to check your own runs against. (Relocated Feb 2026.)
- **Roache's Grid Convergence Index (GCI) / ASME V&V 20** — the formal method behind a mesh-independence study.

### Operating in water — Reynolds & cavitation
- [NASA Glenn — Similarity Parameters (Reynolds & Mach)](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/similarity-parameters/) ⭐ *primary, beginner*
- [NASA Glenn — Boundary Layer](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/boundary-layer/) *beginner*
- [Wikipedia — Foil (fluid mechanics)](https://en.wikipedia.org/wiki/Foil_(fluid_mechanics)) *beginner*
- [Brennen — *Cavitation and Bubble Dynamics*, Ch.1 (Caltech, free)](https://media.library.caltech.edu/CaltechBOOK:1995.001/chap1.htm) *advanced* — cavitation number σ; matters near the 10-kn top end.
- [MIT OCW 2.23 — Kerwin, *Hydrofoils and Propellers* notes (PDF)](https://ocw.mit.edu/courses/2-23-hydrofoils-and-propellers-spring-2007/6f698ed019180565602e04d6a7a71856_kerwin_notes.pdf) *advanced* — the hydrofoil "cavitation bucket."

### Fishing-specific — depressors / diving planers / otter boards
- [FAO — *Otter Board Design and Performance* (1974, Marine Lab Aberdeen)](https://archive.org/details/otterboarddesign034863mbp) ⭐ *primary, intermediate*
  Most directly transferable engineering source: construction drawings + performance data for flat/cambered boards (otter boards = low-AR downforce/sideforce foils).
- [Frontiers Mech. Eng. (2025) — biplane otter board hydrodynamics (open access)](https://www.frontiersin.org/journals/mechanical-engineering/articles/10.3389/fmech.2025.1458310/full) *paper, advanced* — real lift/drag vs AoA; optimal ~20% camber.
- [Patent US3863382A — Diving plane for fishing lures](https://patents.google.com/patent/US3863382) *intermediate*
- [Patent US5020268A — Auto line-release deep diving planer (Dipsy)](https://patents.google.com/patent/US5020268) *intermediate*
- [Wikipedia — Paravane (water kite)](https://en.wikipedia.org/wiki/Paravane_(water_kite)) *beginner*
- [Luhr-Jensen Dipsy Diver Tech Report (manufacturer)](https://mcprod.rapala.com/media/wysiwyg/USA/PDFs/12_Dipsy_Diver_LTR_Tech_Report.pdf) *beginner* — the real tuning knob: an offset base weight tilts the planing surface to set depth.

## Wisdom (Communities)
- [Boat Design Net — hydrofoil tag](https://www.boatdesign.net/tags/hydrofoil/) ⭐ *best all-rounder* — covers BOTH hydrofoil design AND 3D-printed fabrication.
- [XFLR5 Discussion Forum](https://sourceforge.net/p/xflr5/discussion/) — tool help; has a marine-applications thread.
- [Michigan Sportsman](https://www.michigan-sportsman.com/) — Great Lakes trolling crowd (dipsy/jet divers, downriggers); the application-domain experts.
- [Lake Ontario United — trolling forum](https://www.lakeontariounited.com/fishing-hunting/forum/18-questions-about-trout-amp-salmon-trolling/) — trout/salmon trolling depth tactics.
- [r/foiling](https://www.reddit.com/r/foiling/) · [r/functionalprint](https://www.reddit.com/r/functionalprint/) — foil design + 3D-print fabrication feedback.

## Gaps
- No single source yet on **3D-print material/orientation for submerged structural foils** (water absorption, layer-line strength vs hydrodynamic load). Search next.
- Quantitative **depth-vs-(speed,area,angle,line-length)** model for a towed depressor not yet found in one place — may need to derive it from the force balance + otter-board data. (Now a live need: target depth is 3–50 m set by foil angle + line length — see [[MISSION.md]].)
- ~~CAD/CFD tool resources~~ ✅ filled: CFD trio (XFLR5 / SimScale / OpenFOAM) vetted above; CAD = Fusion 360 (no resources needed).
