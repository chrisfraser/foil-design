# Mission shift: CAD modelling + CFD/computational evaluation now a core destination

Session 2. Learner asked to steer the course toward **designing a depressor in CAD** and **comparing design options with CFD and other computational evaluation methods** before printing/testing. This is a genuine widening of the goal, not just a tool choice — confirmed by the learner. [[MISSION.md]] updated: added a CAD→CFD→compare→print→test working method, new success criteria (build a CAD model, run a CFD sim, run a CFD-based variant comparison), and rewrote the old "no CFD" out-of-scope line to "use CFD packages, don't write a solver."

**Implications for next sessions:**
- Curriculum gains a CAD+CFD track (see [[NOTES.md]] items 11–17). Foil-theory lessons (1–10) still come first — CFD results are meaningless without understanding lift/drag, AoA, Re, low-AR effects to sanity-check them.
- Open research gap: RESOURCES.md has **no CAD or CFD entries yet**. Need to vet hobbyist-accessible CAD (FreeCAD/Fusion 360) and CFD (OpenFOAM/SimScale/Autodesk CFD) + marine external-flow tutorials before teaching that track.
- Pedagogical risk to manage: CFD gives confident-looking numbers that can be very wrong (mesh/turbulence/Re mistakes). Lessons must pair every CFD result with a hand-calc / polar sanity check — ties back to the low-AR + low-Re "theory over-predicts" caveat from [[0001-baseline-and-mission]].

**Status:** active.
