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
- [ ] **Phase 3: Practice Quiz** - Latin-to-English multiple choice quiz engine with adaptive pool
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
- [ ] 02-01-PLAN.md — Grammar JS module, table CSS, wire grammar.html (GRAM-01 through GRAM-05)
- [ ] 02-02-PLAN.md — Vocabulary JS module, vocab CSS, wire vocabulary.html, update SW cache (VOCAB-01 through VOCAB-04)
- [ ] 02-03-PLAN.md — Push to GitHub Pages, human-verify on real iPhone Safari

### Phase 3: Practice Quiz
**Goal**: A student can test themselves on Latin vocabulary with multiple choice questions, track their score, and have correctly answered words removed from the pool.
**Depends on**: Phase 2
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04
**Success Criteria** (what must be TRUE):
  1. A student can start a Latin-to-English quiz and receive questions with 4 multiple choice options where distractors are filtered by part of speech
  2. Words the student gets right are removed from the quiz pool — on the next session they are not asked those words again
  3. At the end of a quiz the student sees their score and feedback
  4. The quiz works in Safari private mode — if localStorage is unavailable it degrades gracefully without crashing
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Past Papers and Polish
**Goal**: A student can find past paper links, installed-app users see update prompts when content changes, and the mobile experience is consistent and polished across all pages.
**Depends on**: Phase 3
**Requirements**: PAPER-01, PAPER-02, PWA-04
**Success Criteria** (what must be TRUE):
  1. A student can navigate to the past papers section and find links to CE Latin past papers and ISEB specimen materials
  2. A student who has the app installed sees a "content updated, reload" banner when a new version of the site is deployed
  3. All pages pass a mobile review on real iPhone Safari — no layout breaks, no unreadable tables, no broken nav
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-01 |
| 2. Grammar and Vocabulary | 1/3 | In Progress|  |
| 3. Practice Quiz | 0/TBD | Not started | - |
| 4. Past Papers and Polish | 0/TBD | Not started | - |
