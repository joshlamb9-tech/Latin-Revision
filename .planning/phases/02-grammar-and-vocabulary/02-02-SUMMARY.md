---
phase: 02-grammar-and-vocabulary
plan: "02"
subsystem: ui
tags: [vanilla-js, pwa, service-worker, css-custom-properties, url-params, fetch, json]

# Dependency graph
requires:
  - phase: 02-grammar-and-vocabulary/02-01
    provides: grammar.js pattern (self-contained JS, fetch with no leading slash, createElement for Unicode safety)
  - phase: 01-foundation
    provides: all.json with 211 ISEB words, css/style.css with CSS custom properties, vocabulary.html shell, sw.js with ce-latin- prefix pattern

provides:
  - js/vocabulary.js: fetches all.json, applies topic+frequency URL param filters, renders full word list with filter nav
  - CSS: .vocab-item, .vocab-filters, .vocab-filter-link (.active), .vocab-latin, .vocab-english, .vocab-meta, .vocab-list, .vocab-count, .vocab-empty
  - vocabulary.html: wired with vocabulary.js after app.js
  - sw.js: bumped to ce-latin-v2, precaches grammar.js and vocabulary.js

affects: [03-quiz-and-practice, 04-launch-and-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - URLSearchParams for URL param reading (decodes %2F automatically — no manual decode needed)
    - textContent for all Latin text (never innerHTML) — preserves Unicode macrons
    - Fetch path with no leading slash — required for GitHub Pages sub-path deployment
    - Self-contained JS module — no globals shared with app.js
    - war/army href encoded as vocabulary.html?topic=war%2Farmy in filter nav

key-files:
  created:
    - js/vocabulary.js
  modified:
    - css/style.css
    - vocabulary.html
    - sw.js

key-decisions:
  - "URLSearchParams decodes %2F to / automatically — topic filter compares against 'war/army' directly, no manual decode"
  - "textContent used for all word content — macrons in Latin text must never go through innerHTML encoding"
  - "sw.js bumped to ce-latin-v2 to force browser to reinstall SW with updated precache list including grammar.js and vocabulary.js"

patterns-established:
  - "URL param filters: getFilters() reads URLSearchParams, applyFilters() chains topic + freq — same pattern reusable for quiz filtering"
  - "Filter nav: renderFilterNav() builds active-state pill links in nav.vocab-filters — consistent active class pattern"
  - "buildMeta(): POS-aware meta string for nouns (gender+declension), verbs (conjugation/irreg.), others (POS only)"

requirements-completed: [VOCAB-01, VOCAB-02, VOCAB-03, VOCAB-04]

# Metrics
duration: 3min
completed: 2026-03-01
---

# Phase 2 Plan 02: Vocabulary Reference Page Summary

**Vanilla JS vocabulary page fetching 211-entry all.json with URL-param topic and frequency filtering, filter nav with 6 topic pills and Top 50/100 freq links, rendered into #app via createElement for macron safety**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-01T20:40:09Z
- **Completed:** 2026-03-01T20:42:40Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Built js/vocabulary.js (183 lines): fetches all.json, reads topic and freq URL params, filters and renders full ISEB word list
- Topic filter covers all 6 topics (family, war/army, gods, travel, daily-life, nature); war/army handled with encoded slash in href
- Frequency filter sorts by frequency_rank and slices to Top 50 or Top 100
- Empty state shows "No words found for this filter." — no blank screen
- Filter nav shows active state on matching pill link
- sw.js bumped to ce-latin-v2 with grammar.js and vocabulary.js added to PRECACHE_ASSETS

## Task Commits

Each task was committed atomically:

1. **Task 1: Add vocabulary CSS to style.css** - `b7b0821` (feat)
2. **Task 2: Create js/vocabulary.js and wire into vocabulary.html** - `bdb0b1c` (feat)
3. **Task 3: Update sw.js to precache new JS files and bump cache version** - `8f69d58` (chore)

## Files Created/Modified
- `js/vocabulary.js` - Fetches all.json, reads URL params, filters words, renders list with filter nav — 183 lines, fully self-contained
- `css/style.css` - Added 80 lines: .vocab-filters, .vocab-filter-link (.hover/.active), .vocab-list, .vocab-item grid, .vocab-latin, .vocab-english, .vocab-meta, .vocab-count, .vocab-empty
- `vocabulary.html` - Added `<script src="js/vocabulary.js"></script>` after app.js before </body>
- `sw.js` - Bumped CACHE_NAME to ce-latin-v2, added ./js/grammar.js and ./js/vocabulary.js to PRECACHE_ASSETS

## Decisions Made
- URLSearchParams decodes %2F automatically — filter compares against decoded 'war/army' string directly; hrefs use `?topic=war%2Farmy` for correct round-trip
- textContent used for all Latin content (never innerHTML) — same pattern established in grammar.js for macron safety
- sw.js version bumped from v1 to v2 so browser forces SW reinstall with the updated asset manifest

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Vocabulary page complete: all 211 ISEB words browsable, filterable by topic and frequency
- data/vocabulary/all.json available via service worker (offline ready from v2)
- all.json field names, topics, frequency_rank integer sort confirmed — quiz phase can use same data and same filtering pattern
- Ready for Phase 3: quiz and practice (quiz.js can reuse getFilters() pattern, applyFilters(), and word data from all.json)

---
*Phase: 02-grammar-and-vocabulary*
*Completed: 2026-03-01*

## Self-Check: PASSED

All files verified present:
- `js/vocabulary.js` — FOUND
- `css/style.css` — FOUND (modified)
- `vocabulary.html` — FOUND (modified)
- `sw.js` — FOUND (modified)
- `.planning/phases/02-grammar-and-vocabulary/02-02-SUMMARY.md` — FOUND

All commits verified:
- `b7b0821` feat(02-02): add vocabulary list CSS — FOUND
- `bdb0b1c` feat(02-02): create js/vocabulary.js and wire into vocabulary.html — FOUND
- `8f69d58` chore(02-02): bump sw.js to ce-latin-v2 and precache new JS files — FOUND
