# Working Notes

## Learner profile
- Physics/math: **rusty** (did physics & algebra years ago). Teach *with* equations but always rebuild intuition first. Don't assume calculus fluency; reintroduce as needed.
- Goal: both **theory/optimization** AND **build+test**. Wants the full loop: understand → compute → print → test → iterate.
- Operating regime: trolling **3–10 kn**.
- Manufacturing: **3D printing**.

## Teaching preferences (global)
- User's global instruction: be **extremely concise** when reporting; sacrifice grammar for concision. (Applies to chat, NOT to lessons — lessons should be beautiful & complete.)

## Pedagogy reminders
- Lead with intuition + diagram, then introduce the equation, then a tiny computed example, then retrieval practice.
- Each lesson = one tangible win, short, within working memory.
- Reuse assets/shared stylesheet. Cite resources heavily.

## Curriculum sketch (provisional — revise as we go)
1. ✅/▶ Foils 101: force perpendicular to flow; a depressor is just a wing flipped to push down. Lift & drag, angle of attack.
2. The lift/drag equations + dynamic pressure (½ρv²); compute downforce for a flat plate.
3. The depressor force balance: what sets the dive depth (downforce vs line tension/buoyancy/drag).
4. Coefficients & polars: Cl, Cd, L/D; reading a polar; stall.
5. Foil sections: flat plate vs cambered NACA; why camber; thickness.
6. Aspect ratio & induced drag (depressors are low-AR — big effect).
7. Reynolds number in water; scaling; why water ≠ air.
8. Tools: XFLR5/XFOIL hands-on — get a polar for a candidate section.
9. Cavitation & strength at 8–10 kn; 3D-print material/orientation considerations.
10. Sizing & optimization: put it together, design a real depressor.

### CAD + CFD track (added session 2 — now a core destination)
11. CAD basics: model a depressor (foil + body + tow points) — tool TBD (FreeCAD / Fusion 360?).
12. From 2D section to 3D CAD: lofting a foil, parameterizing for variants.
13. CFD 101: what a CFD sim actually computes; mesh, boundary conditions, turbulence models, convergence — concepts before clicking.
14. CFD hands-on: run lift/drag on one depressor in a hobbyist-accessible package (SimScale / OpenFOAM / Autodesk CFD — TBD).
15. Faster screening methods (panel methods, XFLR5 3D, surrogate/DoE) vs full CFD — when each is worth it.
16. Design-of-experiments: compare CAD variants in CFD, pick a winner before printing.
17. Build + on-water test protocol; measure depth; close the loop CFD↔reality; iterate.

## Resource research
- Session 1: launched research agent → populated RESOURCES.md (foil theory, sections, XFLR5, otter-board/fishing sources, communities).
- TODO session 2+: research & vet CAD tools and **hobbyist-accessible CFD** options (FreeCAD/Fusion, OpenFOAM, SimScale, Autodesk CFD), plus tutorials for marine/external-flow CFD. RESOURCES.md has no CAD/CFD entries yet — this is the next research gap.
