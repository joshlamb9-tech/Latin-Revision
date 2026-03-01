# CE Latin Revision Site

## What This Is

An interactive Common Entrance Latin revision site for Year 8 pupils, built to the ISEB CE syllabus. Modelled on the existing CE French revision site (same tech stack, same PWA approach), but with a distinct classical visual identity. Covers vocabulary, grammar, translation practice, and past papers. Intended first for Mowden Hall students, with potential to licence to other IAPS prep schools.

## Core Value

A student can revise every examinable area of CE Latin from their phone or tablet, offline if needed, without needing to carry textbooks.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Topic/syllabus vocabulary pages with ISEB word list
- [ ] Grammar reference — declension tables (1st, 2nd, 3rd noun), conjugation tables (present, imperfect, perfect)
- [ ] Interactive vocabulary practice generator (Latin→English and English→Latin)
- [ ] Grammar drills (declension and conjugation exercises)
- [ ] Past papers section (CE Latin papers)
- [ ] Classical visual theme — distinct from French site (parchment/stone tones, Roman-inspired typography)
- [ ] PWA — installable from Safari, works offline, all pages precached
- [ ] Mobile-first responsive layout with hamburger nav
- [ ] GitHub Pages deployment

### Out of Scope

- User accounts / login — no auth in v1, keep it simple
- Backend / database — static site only
- Video content — out of scope for v1
- CE Level 1 / Level 2 / Level 3 differentiation — single syllabus for v1

## Context

- **French site reference:** `joshlamb9-tech/y8-french-revision` — same tech stack (vanilla HTML/CSS/JS, GitHub Pages, PWA via service worker). Reuse patterns directly.
- **Content sources:**
  - ISEB CE Latin syllabus (official)
  - Past CE Latin papers
  - Josh's own teaching materials (schemes of work, worksheets)
  - Textbooks: Minimus, Familia Romana
  - Bob Bass PDFs — Latin teaching books, author has given explicit permission to use content. Files in `~/Downloads/`.
  - Additional Latin documentation in `~/Downloads/`
- **Market:** Same as French site — ~500 IAPS CE prep schools. CE Latin is a smaller but loyal niche.
- **Visual direction:** Classical/Roman theme. Think parchment, stone, terracotta or deep burgundy. Serif typography (not Dosis — that's the French site). Roman-feeling without being a costume.

## Constraints

- **Tech stack:** Vanilla HTML/CSS/JS — no frameworks. Same as French site.
- **Hosting:** GitHub Pages — free, no server required.
- **Font:** Not Dosis (that's French site branding). Choose a classical serif — Cormorant Garant, EB Garamond, or similar Google Font.
- **Budget:** Zero — open source tools and free hosting only.
- **Content:** Must stay within ISEB CE Latin syllabus scope for v1.
- **Bob Bass materials:** Can be used with permission — cite appropriately in site footer.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vanilla HTML/CSS/JS (no framework) | Matches French site — easy to maintain, zero build tooling | — Pending |
| GitHub Pages hosting | Free, already used for French site, no ops overhead | — Pending |
| Classical visual theme (not Mowden blue) | Differentiated product feel; Latin deserves its own identity | — Pending |
| PWA from day one | Proven on French site — offline access is a genuine win for revision | — Pending |

---
*Last updated: 2026-03-01 after initialization*
