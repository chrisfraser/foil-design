# Mission: Hydrodynamics of Underwater Foils (Fishing Depressors)

## Why
Design, compute, and build 3D-printed **depressors** ("diving planers"/paravanes) that use water flow while trolling at 3–10 kn to pull fishing lures down to a target depth — and understand the hydrodynamics well enough to predict and optimize a foil shape *before* cutting plastic, then validate it on the water.

## Success looks like
- Can explain why an angled foil generates a force perpendicular to flow, and orient it to point that force **down**.
- Can read/produce a Cl–Cd polar for a foil section and pick an operating angle of attack.
- Can size a depressor (area, section, aspect ratio, angle) to hit a target depth for a given speed and towed load.
- Can model a candidate foil in a hobbyist tool (e.g. XFLR5/XFOIL) and interpret the output.
- Has 3D-printed and water-tested at least one depressor, and iterated based on observed depth/stability.
- Knows when cavitation or strength/stability will bite at the high end (8–10 kn).

## Constraints
- Physics/algebra is rusty — teach with equations but rebuild intuition each time.
- Manufacturing = 3D printing (cambered/complex sections are feasible; consider strength & water absorption).
- Operating regime: trolling 3–10 kn.

## Out of scope (for now)
- Full CFD / Navier–Stokes solving from scratch.
- Surface-piercing / lifting hydrofoils for craft (we want submerged downforce, not boat lift).
- Electronics, line-counters, downrigger mechanics beyond the foil itself.

## Open questions to resolve early
- Target depth(s) and towed load (lure + line drag) — needed to size the foil.
- Release/trip mechanism on fish strike? (affects geometry, maybe out of scope.)
