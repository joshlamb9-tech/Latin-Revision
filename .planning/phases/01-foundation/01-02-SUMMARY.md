---
phase: 01-foundation
plan: "02"
subsystem: ui
tags: [html, css, vanilla-js, pwa, eb-garamond, mobile-first, hamburger-nav]

# Dependency graph
requires: []
provides:
  - index.html app shell with main#app pattern, header, footer, and nav
  - vocabulary.html, grammar.html, quiz.html, papers.html page stubs
  - css/style.css: classical parchment/terracotta/stone theme with CSS custom properties
  - js/app.js: hamburger nav toggle with aria support and SW registration stub
affects:
  - 01-03 (SW/manifest — sw.js and manifest.webmanifest link already in shell)
  - all future phases (every page inherits the shell pattern and visual identity)

# Tech tracking
tech-stack:
  added:
    - EB Garamond from Google Fonts (ital,wght@0,400;0,500;0,700;1,400)
  patterns:
    - Page-as-shell: every HTML file is a minimal shell, main#app populated by JS
    - CSS custom properties for the entire design system (palette + typography)
    - Mobile-first: hamburger nav hidden by default, desktop revealed at 768px breakpoint
    - SW registration gracefully fails if sw.js absent (forward-compatible)

key-files:
  created:
    - index.html
    - vocabulary.html
    - grammar.html
    - quiz.html
    - papers.html
    - css/style.css
    - js/app.js
  modified: []

key-decisions:
  - "EB Garamond loaded from Google Fonts with preconnect — not self-hosted (simpler, no GDPR impact for school)"
  - "CSS custom properties for all palette and typography values — enables easy theming and future dark mode"
  - "Hamburger nav uses .open class toggle on .site-nav — simple, no JS state beyond classList"
  - "SW registration silently catches errors — sw.js absent until Plan 01-03 is normal and expected"

patterns-established:
  - "Shell pattern: all pages share identical header/nav/footer; only main#app content differs"
  - "Colour palette: --color-parchment (#F5ECD7), --color-terracotta (#B5451B), --color-stone (#3A3530)"
  - "Mobile-first breakpoint: 768px for desktop nav layout"
  - "44px touch targets on nav-toggle (iOS minimum)"

requirements-completed: [SHELL-01, SHELL-02, SHELL-03, SHELL-04]

# Metrics
duration: 2min
completed: 2026-03-01
---

# Phase 1 Plan 02: App Shell and Visual Identity Summary

**EB Garamond classical theme with parchment/terracotta/stone palette, hamburger nav, and five-page HTML shell (index + four stubs) — all wired to js/app.js and css/style.css**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-01T16:31:31Z
- **Completed:** 2026-03-01T16:33:15Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- index.html: full app shell with hero section, four nav cards, manifest link, Google Fonts, EB Garamond
- Four stub pages (vocabulary, grammar, quiz, papers) following the same shell pattern — ready for JS population in Phase 2/3
- css/style.css: complete classical design system via CSS custom properties — parchment background, terracotta header/accents, stone text, EB Garamond body font
- Mobile hamburger nav: .nav-toggle button (44px touch target), .site-nav toggled by .open class, auto-closes on link tap
- Desktop nav: hamburger hidden at 768px, nav items go horizontal — no horizontal scroll at 375px

## Task Commits

Each task was committed atomically:

1. **Task 1: Create index.html and page stubs** - `ded4b52` (feat)
2. **Task 2: Create CSS visual identity and JS nav toggle** - `a5a574d` (feat)

## Files Created/Modified
- `index.html` - App shell: hero, nav cards, site header with hamburger, footer, manifest link
- `vocabulary.html` - Stub: header/footer shared, main#app has heading + loading message
- `grammar.html` - Stub: header/footer shared, main#app has heading + loading message
- `quiz.html` - Stub: header/footer shared, main#app has heading + loading message
- `papers.html` - Stub: header/footer shared, main#app has heading + loading message
- `css/style.css` - Classical theme: CSS custom properties, mobile-first nav, grid home cards, footer
- `js/app.js` - Nav toggle with aria-expanded, close-on-link-click, SW registration with graceful failure

## Palette Reference

| Variable | Hex | Usage |
|----------|-----|-------|
| --color-parchment | #F5ECD7 | Page background |
| --color-parchment-dark | #EAD9B8 | Cards, table backgrounds, footer |
| --color-terracotta | #B5451B | Header, headings, links, borders |
| --color-terracotta-dark | #8C3315 | Hover states, mobile nav background |
| --color-stone | #3A3530 | Body text |
| --color-stone-light | #6B6259 | Secondary text, captions |
| --color-border | #C9B896 | Subtle borders |

## Decisions Made
- EB Garamond loaded from Google Fonts with preconnect tags — not self-hosted, simpler setup
- CSS custom properties used for every palette and typography value — enables easy future adjustments
- Hamburger toggle uses simple classList.toggle('.open') — no extra JS state or libraries needed
- SW registration already wired in app.js but will silently fail until sw.js created in Plan 01-03

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- App shell ready: all pages load, nav works, visual identity applied
- Plan 01-01 (data layer) and 01-02 (shell) are independent — once 01-01 completes, vocabulary.html can be populated
- Plan 01-03 (PWA/manifest/SW) can proceed immediately — sw.js link already in shell

---
*Phase: 01-foundation*
*Completed: 2026-03-01*

## Self-Check: PASSED

All 8 files exist on disk. Both task commits (ded4b52, a5a574d) confirmed in git log.
