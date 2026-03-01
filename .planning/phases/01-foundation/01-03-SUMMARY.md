---
phase: 01-foundation
plan: "03"
subsystem: pwa
tags: [service-worker, pwa, manifest, icons, cache, offline, github-pages]

# Dependency graph
requires:
  - plan: "01-01"
    provides: "data/vocabulary/all.json, data/grammar/nouns.json, data/grammar/verbs.json"
  - plan: "01-02"
    provides: "index.html, all page stubs, css/style.css, js/app.js"
provides:
  - "sw.js: service worker with ce-latin-v1 cache, offline-first, cache-first fetch strategy"
  - "manifest.webmanifest: PWA web app manifest for home screen install"
  - "icons/icon-192.png and icon-512.png: valid PNG PWA icons (terracotta placeholder)"
affects:
  - all phases (SW precaches every site asset -- must be updated when new files are added)
  - Phase 4 (icons will be replaced with proper artwork)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cache namespace: ce-latin-v1 prefix on ALL caches -- never deletes foreign caches"
    - "Activate event filters by startsWith('ce-latin-') before deletion -- safe for multi-PWA origin"
    - "Cache-first fetch strategy for static site assets"
    - "skipWaiting + clients.claim for immediate SW activation on update"
    - "Same-origin-only fetch interception"

key-files:
  created:
    - sw.js
    - manifest.webmanifest
    - icons/icon-192.png
    - icons/icon-512.png
  modified: []

key-decisions:
  - "CACHE_NAME = 'ce-latin-v1' -- ce-latin- prefix prevents collision with French site's ce-french-v1 cache"
  - "Activation only deletes caches matching startsWith('ce-latin-') -- safe on shared origin"
  - "No 'purpose' field on manifest icons -- avoids combined any+maskable bug that breaks iOS install"
  - "Icons are solid-colour terracotta placeholders (#B5451B) -- Phase 4 replaces with artwork"
  - "Repo: https://github.com/joshlamb9-tech/Latin-Revision.git -- Josh pushed and enabled GitHub Pages"
  - "French site SW uses dangerous pattern (deletes ALL non-matching caches on activate) -- flagged but not modified"
  - "Hamburger not visible on desktop (hidden at 768px+) -- correct behaviour, verify on phone once Pages live"

patterns-established:
  - "When adding new files to the site, update PRECACHE_ASSETS in sw.js and bump CACHE_NAME version"
  - "Never use caches.keys().then(all => all.filter(k => k !== CACHE_NAME).map(...)) -- that nukes other PWAs"

requirements-completed: [PWA-01, PWA-02, PWA-03, PWA-05, DEPLOY-01, DEPLOY-02]

# Metrics
duration: 10min
completed: 2026-03-01
---

# Phase 1 Plan 03: PWA Infrastructure Summary

**ce-latin-v1 service worker (cache-first, safe namespace, offline-first) + PWA manifest + placeholder icons — French site SW audited and flagged as cache-collision risk — deployed to GitHub Pages**

## Performance

- **Duration:** ~10 min (all 3 tasks complete)
- **Started:** 2026-03-01T16:40:39Z
- **Completed:** 2026-03-01
- **Tasks:** 3 of 3 (Task 3 human-verify checkpoint approved by Josh)
- **Files modified:** 4

## Accomplishments

- sw.js created with CACHE_NAME = 'ce-latin-v1', install/activate/fetch handlers, safe namespace-filtered cache deletion
- manifest.webmanifest valid JSON: CE Latin Revision, standalone display, parchment background, terracotta theme
- icons/icon-192.png and icons/icon-512.png generated as valid PNG files (PNG magic bytes confirmed, solid terracotta colour)
- French site SW audited: uses 'ce-french-v1' cache name but has an unsafe activation pattern -- flagged for Josh
- Site pushed to GitHub Pages at https://github.com/joshlamb9-tech/Latin-Revision.git -- Josh confirmed push and Pages enabled
- **Task 3 checkpoint approved by Josh (2026-03-01) -- Phase 1 complete**

## Task Commits

1. **Task 1: Audit French site SW and create ce-latin- service worker** - `7379897` (feat)
2. **Task 2: Create manifest, generate icons, and commit for GitHub Pages** - `035ae13` (feat)
3. **Task 3: Verify Phase 1 foundation** - APPROVED (checkpoint:human-verify -- no code changes)

## Files Created/Modified

- `sw.js` -- Service worker: ce-latin-v1 cache, install/activate/fetch handlers, same-origin fetch interception
- `manifest.webmanifest` -- PWA manifest: name/short_name, start_url, display:standalone, two icon entries
- `icons/icon-192.png` -- 192x192 solid terracotta PNG (valid PNG, 547 bytes)
- `icons/icon-512.png` -- 512x512 solid terracotta PNG (valid PNG, 1881 bytes)

## French Site SW Audit

**IMPORTANT: Cache collision risk identified.**

Found local clone at `/Users/josh/marvin/y8-french-revision/sw.js`.

| Property | Finding |
|----------|---------|
| Cache name | `ce-french-v1` |
| Prefix | `ce-french-` (different from Latin's `ce-latin-`) |
| Install handler | Safe -- opens own cache |
| Activate handler | **UNSAFE** -- deletes ALL caches not matching its own name |
| Fetch handler | Safe -- cache-first |

**The unsafe line (French sw.js lines 59-61):**
```js
keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
```

This means: whenever the French site's SW activates (e.g. after a browser refresh triggers an update), it will **delete the Latin site's `ce-latin-v1` cache**, breaking Latin site offline capability.

**Status:** Flagged. Per plan instructions, the French site SW was NOT modified. Josh needs to update the French site's activation handler to filter by prefix (`ce-french-`) rather than deleting all non-matching caches.

**Suggested fix for French sw.js activation:**
```js
// Replace this:
keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))

// With this (safe prefix-filtered version):
keys.filter(k => k.startsWith('ce-french-') && k !== CACHE_NAME).map(k => caches.delete(k))
```

## GitHub Pages

Josh confirmed:
- Repo: `https://github.com/joshlamb9-tech/Latin-Revision.git`
- Push completed
- GitHub Pages enabled
- Live URL: `https://joshlamb9-tech.github.io/Latin-Revision/` (verify once DNS propagates)

**Note on hamburger nav:** The hamburger menu is intentionally hidden on desktop (CSS hides it at 768px+). If it is not visible when viewing in a desktop browser, that is correct behaviour. Test the hamburger on a phone or by narrowing the browser window below 768px.

## SW Cache Contents (PRECACHE_ASSETS)

The SW precaches these 14 assets:
1. `./` (root)
2. `./index.html`
3. `./vocabulary.html`
4. `./grammar.html`
5. `./quiz.html`
6. `./papers.html`
7. `./css/style.css`
8. `./js/app.js`
9. `./data/vocabulary/all.json`
10. `./data/grammar/nouns.json`
11. `./data/grammar/verbs.json`
12. `./manifest.webmanifest`
13. `./icons/icon-192.png`
14. `./icons/icon-512.png`

## Icon Quality Notes

Current icons are solid-colour terracotta rectangles (#B5451B) -- valid PNG, functional for PWA install, but not visually branded. Phase 4 should replace them with a proper icon featuring a Roman letter or symbol. Options to discuss then:
- Classic 'L' in EB Garamond on terracotta background
- Simple laurel wreath
- Roman column or fasces symbol

## Decisions Made

- CACHE_NAME prefix `ce-latin-` is the namespace that protects against French site collisions (Latin SW's side is safe; French SW's side needs fixing)
- No `purpose` field on manifest icons -- correct per plan guidance to avoid the combined any+maskable bug
- Placeholder icons using pure Node.js PNG generation -- no ImageMagick on this machine

## Deviations from Plan

None in execution -- plan ran exactly as written. The French site audit finding (unsafe activation pattern) was anticipated by the plan and handled per its instructions: flagged in SUMMARY, not modified.

## Issues Encountered

- Node.js inline `-e` script with `!i.purpose` caused shell escape issue -- resolved by writing verification to a temp file. No impact on output.

## Next Phase Readiness

Phase 1 is complete. Phase 2 (Grammar and Vocabulary) can begin.

- sw.js ready -- offline capability active once Pages propagates
- manifest.webmanifest ready -- site can be added to home screen from Safari
- **Remaining action for Josh:** Fix French site sw.js activation handler (see French Site SW Audit above)
- **Remaining action for Josh:** Verify hamburger nav and offline mode on iPhone once Pages is live

## Self-Check

- sw.js: FOUND at /Users/josh/projects/ce-latin-revision/sw.js
- manifest.webmanifest: FOUND at /Users/josh/projects/ce-latin-revision/manifest.webmanifest
- icons/icon-192.png: FOUND, PNG magic bytes confirmed
- icons/icon-512.png: FOUND, PNG magic bytes confirmed
- Commit 7379897 (sw.js): FOUND in git log
- Commit 035ae13 (manifest + icons): FOUND in git log

## Self-Check: PASSED

---
*Phase: 01-foundation*
*Completed: 2026-03-01 -- all tasks complete, Phase 1 done*
