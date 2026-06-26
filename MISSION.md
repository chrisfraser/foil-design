# Mission: Hydrodynamics of Underwater Foils (Fishing Depressors)

## Why
Design, compute, and build 3D-printed **depressors** ("diving planers"/paravanes) that use water flow while trolling at 3–10 kn to pull fishing lures down to a target depth — and understand the hydrodynamics well enough to predict and optimize a foil shape *before* cutting plastic, then validate it on the water.

The working method the course is building toward: **model a depressor in CAD, then compare design variants computationally (CFD and lighter-weight evaluation methods) to choose the best shape before printing and on-water testing.**

## Success looks like
- Can explain why an angled foil generates a force perpendicular to flow, and orient it to point that force **down**.
- Can read/produce a Cl–Cd polar for a foil section and pick an operating angle of attack.
- Can size a depressor (area, section, aspect ratio, angle) to hit a target depth for a given speed and towed load.
- Can model a candidate foil section in a hobbyist tool (e.g. XFLR5/XFOIL) and interpret the output.
- Can build a full 3D **CAD model** of a depressor (foil + body + tow/attachment points) suitable for both printing and simulation.
- Can set up and run a **CFD evaluation** of a depressor (mesh, boundary conditions, solver, post-processing) and read out lift/drag/flow behaviour.
- Can run a **design-of-experiments / comparison** across several CAD variants using CFD (and faster screening methods) to pick the best shape *before* printing.
- Has 3D-printed and water-tested at least one depressor, and iterated based on observed depth/stability — closing the loop between CFD prediction and real result.
- Knows when cavitation or strength/stability will bite at the high end (8–10 kn).

## Constraints
- Physics/algebra is rusty — teach with equations but rebuild intuition each time.
- Manufacturing = 3D printing (cambered/complex sections are feasible; consider strength & water absorption).
- Operating regime: trolling 3–10 kn.

## Out of scope (for now)
- Writing our own CFD / Navier–Stokes *solver* from scratch — we will *use* existing CFD packages, not build one.
- Surface-piercing / lifting hydrofoils for craft (we want submerged downforce, not boat lift).
- Electronics, line-counters, downrigger mechanics beyond the foil itself.

## Known parameters
- **Deployment:** towed behind a boat.
- **Depth range:** ~3–50 m, set by **foil angle of attack + length of line in the water** (not a single fixed depth). → implies the design should support **adjustable/variable angle**, or a family of foils, to span the range. The depth-vs-(speed, angle, line-length) relationship is a thing we'll want to model.

## Open questions to resolve early
- Towed load: lure weight + line/cable drag at depth — still needed to size the foil.
- Release/trip mechanism on fish strike? (affects geometry, maybe out of scope.)
