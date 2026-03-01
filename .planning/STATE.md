# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-01)

**Core value:** A student can revise every examinable area of CE Latin from their phone or tablet, offline if needed, without needing to carry textbooks.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-03-01 — Completed 01-02 app shell and visual identity

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 2 min
- Total execution time: 0.03 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 1 of 3 | 2 min | 2 min |

**Recent Trend:**
- Last 5 plans: 01-02 (2 min)
- Trend: -

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

### Pending Todos

None yet.

### Blockers/Concerns

- French site SW cache prefix must be confirmed before Phase 1 is complete (PWA-05)

## Session Continuity

Last session: 2026-03-01
Stopped at: Completed 01-01-PLAN.md (vocabulary and grammar data foundation)
Resume file: None
