# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** A student can revise every examinable area of CE Latin from their phone or tablet, offline if needed, without needing to carry textbooks.
**Current focus:** Phase 4 — Past Papers and Polish

## Current Position

Phase: 4 of 4 (Past Papers and Polish) -- IN PROGRESS
Plan: 1 of 3 in current phase -- COMPLETE
Status: Phase 4 underway — Plan 04-01 SW update banner and CSS variable aliases complete
Last activity: 2026-03-02 -- Completed 04-01 (js/app.js controllerchange banner, css/style.css variable aliases, sw.js v8)

Progress: [████████░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: ~5 min
- Total execution time: ~0.42 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 of 3 | ~21 min | ~7 min |
| 02-grammar-and-vocabulary | 2 of 3 | ~8 min | ~4 min |
| 04-past-papers-and-polish | 1 of 3 | ~2 min | ~2 min |

**Recent Trend:**
- Last 5 plans: 01-01 (5 min), 01-02 (6 min), 01-03 (10 min), 02-01 (5 min), 02-02 (3 min), 04-01 (2 min)
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Vanilla HTML/CSS/JS — no framework, no build tool; matches French site
- GitHub Pages hosting — free, already proven on French site
- EB Garamond as body font — classical identity, not Dosis (that is the French site)
- PWA from day one — offline access proven to work on French site
- Cache namespace: `ce-latin-` prefix — critical to avoid collision with French site
- EB Garamond loaded from Google Fonts with preconnect — not self-hosted (simpler)
- CSS custom properties for entire design system — enables easy theming
- Hamburger nav uses .open class toggle on .site-nav — simple, no extra JS state
- SW registration silently catches errors — graceful forward-compatibility until Plan 01-03
- 211-entry ISEB CE vocabulary JSON schema locked — all 8 POS, all 6 topic tags, Unicode macrons
- frequency_rank integers assigned based on specimen paper prominence (L1+L2 words rank highest)
- [Phase 01-foundation]: CACHE_NAME prefix ce-latin- prevents collision with French site ce-french-v1
- [Phase 01-foundation]: No purpose field on manifest icons — avoids combined any+maskable bug breaking iOS install
- [Phase 01-foundation]: French site SW flagged as unsafe (deletes all caches on activate) — needs prefix filter fix before Latin site goes live
- [Phase 02-grammar-and-vocabulary]: createElement (not innerHTML) used for all table cell content — ensures Unicode macrons never mangled
- [Phase 02-grammar-and-vocabulary]: Fetch paths use no leading slash (data/grammar/nouns.json) — required for GitHub Pages sub-path deployment
- [Phase 02-grammar-and-vocabulary]: grammar.js fully self-contained, no shared globals with app.js
- [Phase 02-grammar-and-vocabulary]: URLSearchParams decodes %2F automatically — topic filter compares against 'war/army' directly; hrefs encode slash as %2F
- [Phase 02-grammar-and-vocabulary]: sw.js bumped to ce-latin-v2 to force reinstall with grammar.js and vocabulary.js in precache manifest
- [Phase 04-past-papers-and-polish]: No postMessage SKIP_WAITING handler needed — sw.js already calls self.skipWaiting() unconditionally in install
- [Phase 04-past-papers-and-polish]: pageWasControlled flag captured before registration so first-install controllerchange does not trigger banner

### Pending Todos

None yet.

### Blockers/Concerns

- **French site SW unsafe activation (CRITICAL):** French sw.js deletes ALL non-matching caches on activate -- will nuke Latin site's ce-latin-v1 cache whenever French SW updates. Fix needed in y8-french-revision/sw.js: add `startsWith('ce-french-')` prefix filter in activate handler.
- **GitHub Pages deployed** (resolved): Josh pushed to https://github.com/joshlamb9-tech/Latin-Revision.git and enabled Pages.

## Session Continuity

Last session: 2026-03-02
Stopped at: Completed 04-01 SW update banner — app.js controllerchange listener, style.css aliases, sw.js v8
Resume file: None
