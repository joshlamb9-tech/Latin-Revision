# Requirements: CE Latin Revision Site

**Defined:** 2026-03-01
**Core Value:** A student can revise every examinable area of CE Latin (Level 1 & 2) from their phone or tablet, offline if needed, without needing to carry textbooks.

---

## v1 Requirements

### Data Foundation

- [ ] **DATA-01**: Vocabulary JSON dataset (`data/vocabulary/all.json`) encoding all ISEB CE Level 1 & 2 words with schema: `id`, `latin`, `genitive`, `gender`, `english`, `part_of_speech`, `declension`/`conjugation`, `topics`, `frequency_rank`
- [ ] **DATA-02**: Macrons included on all vocabulary entries, sourced from Bob Bass materials and ISEB syllabus
- [ ] **DATA-03**: Grammar paradigm JSON (`data/grammar/nouns.json`, `data/grammar/verbs.json`) encoding all CE Level 1 & 2 noun declensions (1st, 2nd, 3rd) and verb conjugations (present, imperfect, perfect) plus `sum`
- [ ] **DATA-04**: Vocabulary topic tags applied across all entries (family, war/army, gods, travel, daily-life, nature)

### App Shell & Visual Identity

- [x] **SHELL-01**: Classical visual theme — EB Garamond font, parchment/terracotta/stone colour palette, distinct from French site's Mowden blue
- [x] **SHELL-02**: Mobile-first responsive layout with hamburger navigation
- [x] **SHELL-03**: App shell (`index.html`, `css/style.css`, `js/app.js`) with `<main id="app">` pattern — content populated by JS, not hard-coded HTML
- [x] **SHELL-04**: UTF-8 encoding verified throughout; macron characters render correctly across devices

### PWA & Offline

- [ ] **PWA-01**: Service worker (`sw.js`) with unique `ce-latin-` cache namespace — does not collide with French site cache
- [ ] **PWA-02**: All site assets precached on SW install — full offline access
- [ ] **PWA-03**: Web App Manifest (`manifest.webmanifest`) — installable from Safari as home screen app
- [ ] **PWA-04**: SW update notification banner — users see "content updated, reload" when new version available
- [ ] **PWA-05**: French site service worker audited and confirmed safe (no cache namespace collision)

### Grammar Reference

- [ ] **GRAM-01**: Grammar reference pages for 1st, 2nd, and 3rd declension noun tables (all cases, singular and plural)
- [ ] **GRAM-02**: Grammar reference pages for verb conjugation tables (present, imperfect, perfect — 1st and 2nd conjugation)
- [ ] **GRAM-03**: `sum` (to be) conjugation reference page
- [ ] **GRAM-04**: Grammar tables rendered from JSON via `grammar.js` — not hard-coded HTML
- [ ] **GRAM-05**: Grammar tables readable on mobile — `overflow-x: auto` wrapper, responsive reflow tested on real iPhone Safari

### Vocabulary Pages

- [ ] **VOCAB-01**: Full ISEB word list page — all Level 1 & 2 words visible, searchable/filterable
- [ ] **VOCAB-02**: By-topic vocabulary views (family, war/army, gods, travel, daily-life, nature) via URL parameter (`?topic=family`)
- [ ] **VOCAB-03**: By-frequency vocabulary views (Top 50, Top 100) — "high-yield" cramming mode
- [ ] **VOCAB-04**: Vocabulary pages rendered from JSON via JS — not hard-coded HTML

### Practice Quiz

- [ ] **QUIZ-01**: Latin-to-English vocabulary quiz — multiple choice, 4 options, distractor filtered by part of speech
- [ ] **QUIZ-02**: Adaptive quiz pool — correctly answered words removed from pool using localStorage
- [ ] **QUIZ-03**: Score tracking and end-of-quiz feedback
- [ ] **QUIZ-04**: localStorage usage wrapped in try/catch — graceful degradation in Safari private mode

### Past Papers

- [ ] **PAPER-01**: Past papers page with direct links to CE Latin papers (links provided by Josh — not hosted, linked only)
- [ ] **PAPER-02**: Specimen papers section — direct links to ISEB specimen materials

### GitHub Pages Deployment

- [ ] **DEPLOY-01**: Site deployed to GitHub Pages via `joshlamb9-tech` organisation repo
- [ ] **DEPLOY-02**: HTTPS enforced, correct base URL configured for service worker scope

---

## v2 Requirements

### English-to-Latin Quiz
- **QUIZ-EL-01**: English-to-Latin typed input or structured multiple choice quiz
- **QUIZ-EL-02**: Input normalisation handling (macrons, case-insensitive)

### Grammar Drills
- **DRILL-01**: "Give the accusative plural of [noun]" interactive exercise
- **DRILL-02**: "Conjugate [verb] in the imperfect" interactive exercise
- **DRILL-03**: Touch-keyboard-friendly input for mobile form production

### Bob Bass Exercise Integration
- **BASS-01**: Encoding of Bob Bass exercises (permission confirmed — effort to be scoped in v1.1 planning)

### Level Differentiation
- **LEVEL-01**: Level 1 / Level 2 / Level 3 vocabulary filtering

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / login | GDPR under-13; no benefit for static site |
| Backend / database | Static site only — no server |
| Spaced repetition algorithm | Overkill for exam-window revision; localStorage adaptive pool is sufficient |
| Auto-marked translation | Latin morphology makes NLP unreliable; self-assessment with model answers preferred |
| Video content | Out of scope |
| Leaderboards | Requires backend |
| Push notifications | No exam-window use case |
| Hosting past paper PDFs | Copyright risk — links only |
| CE Level 3 in v1 | Deferred — Level 1 & 2 is the CE standard |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| SHELL-04 | Phase 1 | Complete |
| PWA-01 | Phase 1 | Pending |
| PWA-02 | Phase 1 | Pending |
| PWA-03 | Phase 1 | Pending |
| PWA-04 | Phase 4 | Pending |
| PWA-05 | Phase 1 | Pending |
| GRAM-01 | Phase 2 | Pending |
| GRAM-02 | Phase 2 | Pending |
| GRAM-03 | Phase 2 | Pending |
| GRAM-04 | Phase 2 | Pending |
| GRAM-05 | Phase 2 | Pending |
| VOCAB-01 | Phase 2 | Pending |
| VOCAB-02 | Phase 2 | Pending |
| VOCAB-03 | Phase 2 | Pending |
| VOCAB-04 | Phase 2 | Pending |
| QUIZ-01 | Phase 3 | Pending |
| QUIZ-02 | Phase 3 | Pending |
| QUIZ-03 | Phase 3 | Pending |
| QUIZ-04 | Phase 3 | Pending |
| PAPER-01 | Phase 4 | Pending |
| PAPER-02 | Phase 4 | Pending |
| DEPLOY-01 | Phase 1 | Pending |
| DEPLOY-02 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 (corrected from initial draft count of 28)

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation — traceability confirmed, count corrected to 30*
