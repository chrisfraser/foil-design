# Redesign: adopt the Hydrophone course look-and-feel

Session 3 (2026-06-28). Chris asked to **replicate the structure and look-and-feel of the sibling
`hydrophone` course** (a more mature personal course of his) across the foil course, and to recommend the next
6–7 lessons. This is a presentation/structure overhaul, not a [[MISSION.md]] change.

**What changed:**
- New shared design system ported from hydrophone: `assets/styles.css` (ocean-teal palette, serif body + Inter
  sans, topbar, hero, phase tracks, `.callout` variants, dark `.formula` blocks, `.sourcebox`, `.recap`,
  `.crosslinks`, `.lesson-nav`, declarative `.quiz`) and `assets/widgets.js` (auto-wires `.quiz` from
  `data-correct`/`data-feedback`, plus a range helper).
- `index.html` rebuilt with topbar + hero + three **phases**: 1 Foil Theory (01–07), 2 CAD & CFD Evaluation
  (08–11), 3 Build & On-Water Test (12–14). Existing lessons 01–03 marked Ready, rest Soon.
- Lessons 0001–0003 rewritten into the new lesson template (kicker / lesson-title / lesson-sub / lesson-meta /
  numbered h2 / formula / interactive / declarative quiz / recap / sourcebox / ask-teacher / crosslinks / refs /
  lesson-nav). The three bespoke SVG widgets (foil-sim, force-calc, depth-sim) were **kept** and retinted to the
  ocean palette; force-calc/depth-sim pick up the palette via alias CSS vars (--accent→--ocean, --good→--kelp, etc.).
- `reference/glossary.html` + `reference/cfd-tools.html` reskinned (done by a sub-agent). Glossary now has explicit
  anchor ids the lessons link to (foil, lift, drag, angle-of-attack, stall, dynamic-pressure, lift-coefficient,
  drag-coefficient, lift-drag-ratio, depressor, camber, aspect-ratio, reynolds-number, cavitation, + extras).
- Deleted the old `assets/style.css` and `assets/quiz.js` (superseded; nothing references them).

**Decision:** kept the hydrophone ocean palette **identical** rather than giving foils a distinct accent — the two
are sibling personal courses and "match" was the explicit ask. Brand glyph is ⌖.

**Validated:** all HTML links to styles.css; all internal links + 14 glossary anchors resolve; all JS passes
`node -c`; depth-sim geometry checked in frame across extremes.

**Status:** active. Next teaching priority is Phase-1 theory Lesson 04 (Coefficients, Polars & Stall).
