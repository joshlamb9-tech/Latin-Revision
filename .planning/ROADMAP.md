# Roadmap: CE Latin Revision Site

## Overview

Build a static PWA for CE Latin revision, starting with the data that drives everything and working outward to UI, interactivity, and polish. The data layer unlocks all features — vocabulary JSON enables the quiz engine; grammar JSON enables reference tables. Phase 1 establishes the foundation; each subsequent phase adds a complete, verifiable capability on top of it.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Data layer, app shell, visual identity, PWA infrastructure, and GitHub Pages deployment
- [ ] **Phase 2: Grammar and Vocabulary** - Grammar reference tables and vocabulary pages, all rendered from JSON
- [ ] **Phase 3: Interactive Exercises** - Varied self-test activities across vocabulary and grammar, aligned to CE exam question types, with mastery tracking
- [ ] **Phase 4: Past Papers and Polish** - Past papers section, SW update notification, and site-wide mobile polish

## Phase Details

### Phase 1: Foundation
**Goal**: The project infrastructure exists — data is structured, the shell loads, the classical visual identity is applied, the PWA is installable offline, and the site is live on GitHub Pages.
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, SHELL-01, SHELL-02, SHELL-03, SHELL-04, PWA-01, PWA-02, PWA-03, PWA-05, DEPLOY-01, DEPLOY-02
**Success Criteria** (what must be TRUE):
  1. A student can open the site on an iPhone in Safari and see the classical visual identity (EB Garamond, parchment palette) with a working hamburger nav
  2. The site can be installed from Safari as a home screen app and all pages load correctly with no network connection
  3. The French site continues to work normally — no cache collision from the new Latin service worker
  4. The vocabulary JSON dataset contains all ISEB CE Level 1 and 2 words with correct schema, macrons, and topic tags
  5. The grammar paradigm JSON contains all noun declensions and verb conjugations required by the CE syllabus
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Vocabulary and grammar JSON data layer (DATA-01 through DATA-04)
- [x] 01-02-PLAN.md — App shell, classical visual identity, hamburger nav (SHELL-01 through SHELL-04)
- [x] 01-03-PLAN.md — Service worker, manifest, PWA icons, deploy to GitHub Pages, French site audit (PWA-01/02/03/05, DEPLOY-01/02)

### Phase 2: Grammar and Vocabulary
**Goal**: A student can read every grammar table and browse the full vocabulary list — all content rendered dynamically from JSON, readable on mobile.
**Depends on**: Phase 1
**Requirements**: GRAM-01, GRAM-02, GRAM-03, GRAM-04, GRAM-05, VOCAB-01, VOCAB-02, VOCAB-03, VOCAB-04
**Success Criteria** (what must be TRUE):
  1. A student can navigate to the grammar reference and read 1st, 2nd, and 3rd declension noun tables with all cases on their phone without horizontal overflow
  2. A student can view present, imperfect, and perfect conjugation tables for 1st and 2nd conjugation verbs, plus the sum table
  3. A student can view the full ISEB word list and filter it by topic (e.g., "war/army") or frequency (e.g., "Top 50") via URL parameter
  4. All grammar tables and vocabulary pages are rendered from JSON — no content is hard-coded in HTML
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Grammar JS module, table CSS, wire grammar.html (GRAM-01 through GRAM-05)
- [x] 02-02-PLAN.md — Vocabulary JS module, vocab CSS, wire vocabulary.html, update SW cache (VOCAB-01 through VOCAB-04)
- [x] 02-03-PLAN.md — Push to GitHub Pages, human-verify on real iPhone Safari

### Phase 3: Interactive Exercises
**Goal**: A student can test themselves through varied activities covering vocabulary, case identification, verb parsing, and paradigm recall — all mapped to CE exam question types, with a visible mastery dashboard showing what they've secured.
**Depends on**: Phase 2
**Requirements**: EX-01, EX-02, EX-03, EX-04, EX-05, EX-06, EX-07, EX-08, EX-09, EX-10, EX-11, EX-12
**Success Criteria** (what must be TRUE):
  1. A student can launch a flashcard session and rate their confidence on each word; the SRS state persists across page reloads
  2. A student can take a 4-option MCQ vocabulary quiz (Latin→English and English→Latin) with warm, specific feedback on wrong answers
  3. A student can practise CE Question 3 grammar skills: identifying the case of a noun form and parsing a verb form (person/number/tense)
  4. A student can do a matching-pairs activity and a gap-fill activity in context sentences
  5. A student can see a mastery dashboard showing new/learning/mastered counts for vocabulary
  6. "Test yourself on this list" appears on vocabulary filtered views and launches flashcard mode for that subset
  7. Quick-check questions appear at the end of each grammar paradigm group on the grammar page
  8. All activities work offline and degrade gracefully in Safari private mode
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Exercise hub (quiz.html rewrite) + SRS state manager + flashcard activity + MCQ vocabulary quiz (EX-01, EX-02, EX-03, EX-04)
- [x] 03-02-PLAN.md — Grammar activities: case identifier, verb parser, paradigm self-check (EX-06, EX-07, EX-08)
- [x] 03-03-PLAN.md — Matching pairs activity + gap-fill activity + exercise sentence data (EX-05, EX-09)
- [x] 03-04-PLAN.md — Mastery dashboard + vocabulary "test yourself" integration + grammar quick-check integration + SW update to ce-latin-v4 (EX-10, EX-11, EX-12)

### Phase 4: Past Papers and Polish
**Goal**: A student can find past paper links, installed-app users see update prompts when content changes, and the mobile experience is consistent and polished across all pages.
**Depends on**: Phase 3
**Requirements**: PAPER-01, PAPER-02, PWA-04
**Success Criteria** (what must be TRUE):
  1. A student can navigate to the past papers section and find links to CE Latin past papers and ISEB specimen materials
  2. A student who has the app installed sees a "content updated, reload" banner when a new version of the site is deployed
  3. All pages pass a mobile review on real iPhone Safari — no layout breaks, no unreadable tables, no broken nav
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — SW update banner (PWA-04), CSS variable aliases, sw.js bump to v8 (js/app.js, css/style.css, sw.js)
- [ ] 04-02-PLAN.md — Specimen papers section in papers.html, Josh provides URLs (PAPER-01, PAPER-02)
- [ ] 04-03-PLAN.md — Deploy to GitHub Pages, mobile review on real iPhone Safari

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-01 |
| 2. Grammar and Vocabulary | 3/3 | Complete | 2026-03-02 |
| 3. Interactive Exercises | 4/4 | Complete | 2026-03-02 |
| 4. Past Papers and Polish | 1/3 | In Progress|  |
