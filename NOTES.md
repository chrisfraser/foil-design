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
1. ✅ Foils 101: force perpendicular to flow; a depressor is just a wing flipped to push down. Lift & drag, angle of attack.
2. ✅ The lift/drag equations + dynamic pressure (½ρv²); compute downforce for a flat plate.
3. ✅ The depressor force balance: what sets the dive depth (tan θ = L/D, depth = ℓ·sin θ, speed cancels). depth-sim.js interactive.
4. ▶ Coefficients & polars: Cl, Cd, L/D; reading a polar; stall.
5. Foil sections: flat plate vs cambered NACA; why camber; thickness.
6. Aspect ratio & induced drag (depressors are low-AR — big effect).
7. Reynolds number in water; scaling; why water ≠ air.
8. Tools: XFLR5/XFOIL hands-on — get a polar for a candidate section.
9. Cavitation & strength at 8–10 kn; 3D-print material/orientation considerations.
10. Sizing & optimization: put it together, design a real depressor.

### CAD + CFD track (added session 2 — now a core destination)
- **CAD = Fusion 360. User is already proficient — NO CAD lessons needed.** Only touch CAD in service of getting geometry into the evaluation tools.
- **CFD trio chosen (session 2):** XFLR5 (fast section screening) → SimScale (easy real CFD, 1-click from Fusion) → OpenFOAM/CfdOF (free high-fidelity validation). See reference/cfd-tools.html.
11. CFD 101: what a CFD sim actually computes; mesh, boundary conditions, turbulence models, y+, convergence — concepts before clicking. Pair with Fluid Mechanics 101 (Wimshurst).
12. XFLR5 screening: section polars at our Reynolds; rank camber/thickness. (Caveat: distrust its 3D low-AR numbers.)
13. SimScale hands-on: push a Fusion foil → incompressible water, k-omega SST → read lift/drag. (Caveat: set fluid=water, projects public.)
14. Verification & trust: mesh-independence, y+, convergence, validate vs NASA NACA0012 — so we don't believe pretty-but-wrong results.
15. Design-of-experiments: compare 3D variants in SimScale, pick a winner; optionally validate in OpenFOAM/CfdOF.
16. Build + on-water test protocol; measure depth; close the loop CFD↔reality; calibrate trust in the tools; iterate.

### Known design driver (session 2)
- Towed behind boat; depth 3–50 m set by **foil angle + line length** → design likely needs **adjustable angle** (or a foil family). Worth modelling depth-vs-(speed,angle,line-length).

## Resource research
- Session 1: launched research agent → populated RESOURCES.md (foil theory, sections, XFLR5, otter-board/fishing sources, communities).
- TODO session 2+: research & vet CAD tools and **hobbyist-accessible CFD** options (FreeCAD/Fusion, OpenFOAM, SimScale, Autodesk CFD), plus tutorials for marine/external-flow CFD. RESOURCES.md has no CAD/CFD entries yet — this is the next research gap.
