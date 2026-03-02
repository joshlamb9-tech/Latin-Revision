# Phase 4: Past Papers and Polish - Research

**Researched:** 2026-03-02
**Domain:** Static PWA polish — service worker update notifications, past papers page, mobile layout QA
**Confidence:** HIGH

---

## Summary

Phase 4 is the lightest phase in the roadmap. Two of the three requirements are largely done or nearly done already. `papers.html` was built this session with correct structure, styling, and 6 Google Drive paper links (L1/L2/L3 exam + mark scheme for Spring 2023). The file is already listed in `PRECACHE_ASSETS` in `sw.js`, and the nav link appears in every page header. PAPER-01 and PAPER-02 are effectively complete pending a specimen papers section being added.

PWA-04 (SW update notification banner) is the main technical work. The existing `sw.js` already calls `self.skipWaiting()` on install, so new service workers activate immediately when a new version deploys. What is missing is the client-side notification: `app.js` does not yet listen for `controllerchange` (which fires when the new SW takes over), does not show a banner, and `sw.js` does not yet handle a `SKIP_WAITING` postMessage (only needed if we want to defer skip — here skip is already automatic). The simplest correct pattern for this codebase is: listen for `controllerchange` in `app.js`, show a fixed-position banner, let the user click "Reload" which calls `window.location.reload()`.

The "polish" goal (success criterion 3) means a mobile review pass across all six pages: `index.html`, `vocabulary.html`, `grammar.html`, `quiz.html`, `papers.html`, `word-groups.html`. The CSS already has solid mobile-first foundations but the CSS has some references to undefined custom properties (`--color-ink`, `--font-display`, `--font-latin`) introduced in Phase 3 exercise styles. These will render as inherits/empty but are worth auditing and fixing as part of polish.

**Primary recommendation:** One plan covers all three requirements — add specimen papers section to `papers.html`, add SW update banner to `app.js` + `sw.js`, audit and fix undefined CSS variables, bump SW to v8, and push to GitHub Pages for a real-device check.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAPER-01 | Past papers page with direct links to CE Latin papers (links provided by Josh — not hosted, linked only) | papers.html already exists with L1/L2/L3 Spring 2023 papers; needs specimen papers section added |
| PAPER-02 | Specimen papers section — direct links to ISEB specimen materials | Second section to add to papers.html using the same .papers-level pattern already in place |
| PWA-04 | SW update notification banner — users see "content updated, reload" when new version available | controllerchange event pattern verified with MDN; existing skipWaiting() in sw.js means timing is already correct |
</phase_requirements>

---

## Standard Stack

### Core
| Library / API | Version | Purpose | Why Standard |
|---------------|---------|---------|--------------|
| Service Worker API | Living standard | Background SW lifecycle events | Web standard, no library needed |
| `controllerchange` event | Living standard | Fires when new SW takes over | Correct trigger point after skipWaiting activates |
| `postMessage` API | Living standard | Page → SW communication | Needed only if deferring skipWaiting (not needed here) |

This is a no-dependency project (vanilla HTML/CSS/JS). No npm packages, no build tools. The SW update notification requires only ~20 lines of JS in `app.js`.

### Supporting
| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| Fixed-position update banner | Inform user a reload is available | After `controllerchange` fires |
| CSS custom property audit | Fix undefined variables (`--color-ink`, `--font-display`, `--font-latin`) | Polish pass — prevents silent fallbacks |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `controllerchange` event | `updatefound` + `statechange` | More verbose; required when skipWaiting is NOT called in install. Here skipWaiting is already in install, so controllerchange is the clean trigger |
| postMessage SKIP_WAITING | Direct skipWaiting in install | Already done — the new SW already skips waiting automatically, so no postMessage needed |
| Inline banner JS | Separate `js/update-banner.js` | Overkill for ~20 lines; keep in app.js |

---

## Architecture Patterns

### Recommended Project Structure (no changes needed)
```
ce-latin-revision/
├── papers.html         # Phase 4: add specimen section
├── css/style.css       # Phase 4: add .update-banner rule, fix --color-ink etc.
├── js/app.js           # Phase 4: add controllerchange listener + banner show/hide
├── sw.js               # Phase 4: bump CACHE_NAME to ce-latin-v8
└── (all other files unchanged)
```

### Pattern 1: SW Update Banner (controllerchange)

**What:** When a new service worker activates (via skipWaiting), `controllerchange` fires on `navigator.serviceWorker`. App shows a fixed banner with a "Reload" button.

**When to use:** This codebase already calls `self.skipWaiting()` in the install event, so the new SW activates immediately after install. `controllerchange` fires reliably at that moment.

**Why NOT `updatefound` + `statechange`:** That pattern is needed when you want to detect the waiting state BEFORE skipWaiting runs — e.g., to ask the user "reload now?". In this codebase skipWaiting is unconditional, so by the time you could intercept, the SW has already activated. `controllerchange` is the correct, simpler hook.

**Example (app.js addition):**
```javascript
// Source: MDN https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/waiting
// Adapted for ce-latin-revision (skipWaiting already called in install)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    showUpdateBanner();
  });
}

function showUpdateBanner() {
  // Don't show twice
  if (document.getElementById('update-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML =
    '<span>Content updated.</span>' +
    '<button class="update-banner-btn" onclick="window.location.reload()">Reload</button>';
  document.body.appendChild(banner);
}
```

**Example (css/style.css addition):**
```css
/* SW update notification banner */
.update-banner {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-stone);
  color: var(--color-parchment);
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 9999;
  font-size: 0.95rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  white-space: nowrap;
}

.update-banner-btn {
  background: var(--color-terracotta);
  color: var(--color-parchment);
  border: none;
  border-radius: 4px;
  padding: 0.35rem 0.9rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.update-banner-btn:hover {
  background: var(--color-terracotta-dark);
}
```

**sw.js:** Bump `CACHE_NAME` to `'ce-latin-v8'`. No other sw.js changes needed — skipWaiting is already in install.

### Pattern 2: Specimen Papers Section

**What:** A second block in `papers.html` using identical `.papers-level` structure, added after the Spring 2023 section.

**When to use:** PAPER-02 requirement — ISEB specimen materials are separate from dated past papers.

**Example (papers.html addition):**
```html
<!-- Specimen / Sample Papers -->
<h2>Specimen Papers</h2>
<p class="papers-intro">ISEB official specimen papers &mdash; representative of the current exam format.</p>

<div class="papers-level">
  <div class="papers-level-title">Level 1 Specimen</div>
  <div class="papers-level-meta">Official ISEB specimen paper</div>
  <div class="papers-links">
    <a class="papers-link" href="[URL]" target="_blank" rel="noopener">
      <span class="papers-icon">&#x1F4C4;</span> Specimen Paper
    </a>
    <a class="papers-link mark-scheme" href="[URL]" target="_blank" rel="noopener">
      <span class="papers-icon">&#x2713;</span> Mark Scheme
    </a>
  </div>
</div>
<!-- repeat for L2, L3 -->
```

Note: Josh needs to supply the specimen paper Google Drive URLs — they are not in the codebase and cannot be generated.

### Pattern 3: CSS Variable Audit

**What:** `style.css` references `--color-ink`, `--font-display`, `--font-latin` in the Q4 Latin Composition section (lines 1360-1552 approx) but these are not defined in `:root`. They inherited silently as empty/browser defaults.

**Fix:** Either define them in `:root` as aliases to existing variables, or replace them with the variables already in use:
- `--color-ink` → use `var(--color-stone)`
- `--font-display` → use `var(--font-body)`
- `--font-latin` → use `var(--font-body)`

### Anti-Patterns to Avoid

- **Showing banner before controllerchange:** If you check `registration.waiting` on page load and show a banner immediately, you'll confuse users who just loaded a freshly updated app. Wait for controllerchange.
- **Calling reload() without user action:** Auto-reloading mid-exercise (e.g., mid-flashcard session) destroys state. Always require the user to click "Reload".
- **Forgetting to bump CACHE_NAME:** If you add the banner JS but don't bump the SW version, the new SW never installs and the banner never fires.
- **Adding `purpose: "any maskable"` to manifest icons:** Known to break iOS install (already avoided — STATE.md documents this decision).
- **Hand-rolling a "check for updates" polling loop:** The browser handles update detection automatically on every page load and navigation. No polling needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SW update detection | Custom version polling / fetch-compare | `registration.addEventListener('updatefound')` + `controllerchange` | Browser does update checks automatically; these events fire reliably |
| Skip waiting toggle | Complex state machine | `self.skipWaiting()` in install (already done) | Simplest correct approach for this site |
| Reload after update | Timer-based reload | `window.location.reload()` in button click handler | User should choose when to reload |

**Key insight:** The browser's SW update lifecycle is well-specified. The entire pattern is ~20 lines of vanilla JS. Any abstraction would be larger than the feature itself.

---

## Common Pitfalls

### Pitfall 1: Banner fires on first load (no previous SW)
**What goes wrong:** `controllerchange` fires the very first time a SW takes control of a page (first install), not just on updates. If you show the banner unconditionally, new visitors see "Content updated" on their first ever visit.
**Why it happens:** `controllerchange` fires whenever the controller changes — including from "no controller" to "first controller".
**How to avoid:** Check `navigator.serviceWorker.controller` BEFORE registering the listener. If it's already set, the page was already controlled — so any future `controllerchange` is a genuine update. If it's `null` at registration time, the first `controllerchange` is the initial install.
**Warning signs:** Banner appears on first device load or after clearing cache.

**Correct guard:**
```javascript
// Only set up update banner if page was already controlled
// (i.e., this is an update, not a first install)
let pageWasControlled = !!navigator.serviceWorker.controller;

navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (pageWasControlled) {
    showUpdateBanner();
  }
  pageWasControlled = true;
});
```

### Pitfall 2: Forgetting papers.html in PRECACHE_ASSETS
**What goes wrong:** papers.html not cached, so offline users get a network error on the papers page.
**Why it happens:** Forgetting to add new HTML files to the SW precache list.
**How to avoid:** papers.html IS already in PRECACHE_ASSETS (sw.js line 13) — confirmed in code review. No action needed, but verify after any sw.js edits.
**Warning signs:** Offline navigation to papers.html shows error.

### Pitfall 3: Undefined CSS variables silently falling back
**What goes wrong:** `--color-ink`, `--font-display`, `--font-latin` are used in Q4 Latin composition styles but not defined in `:root`. The browser silently applies the inherited/initial value (black for color, serif for font-family). The UI looks mostly OK but is not using the design system intentionally.
**Why it happens:** The Q4 activity was built in a late Phase 3 plan using variable names that didn't exist in the design system.
**How to avoid:** Audit and replace with defined variables during polish.
**Warning signs:** Computed styles show fallback browser values, not the parchment/terracotta palette.

### Pitfall 4: SW version not bumped after code changes
**What goes wrong:** New JS/CSS/HTML changes are deployed to GitHub Pages but the SW serves the old cached versions to returning users indefinitely.
**Why it happens:** Forgetting to increment CACHE_NAME. Currently `ce-latin-v7` — must bump to `ce-latin-v8` when any asset changes.
**How to avoid:** Bump CACHE_NAME in every plan that modifies any file in PRECACHE_ASSETS.
**Warning signs:** Deployed changes don't appear for users who have the app installed.

### Pitfall 5: Google Drive links need correct sharing settings
**What goes wrong:** Links open with "You need access" if files are not shared publicly.
**Why it happens:** Google Drive files default to restricted access.
**How to avoid:** Papers must be shared as "Anyone with the link can view" before users can open them. This is a content/settings check, not a code issue.
**Warning signs:** Clicking a paper link prompts for Google account login.

---

## Code Examples

Verified patterns from official sources:

### SW Update Banner — Complete Implementation

```javascript
// In js/app.js — replace existing SW registration block
// Source: MDN https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/waiting
//         MDN https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/statechange_event

if ('serviceWorker' in navigator) {
  // Track whether the page was already controlled before we registered.
  // If controller is null now, the first controllerchange is initial install, not an update.
  const pageWasControlled = !!navigator.serviceWorker.controller;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[CE Latin] SW registered, scope:', reg.scope))
      .catch(err => console.warn('[CE Latin] SW registration failed:', err));
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (pageWasControlled) {
      showUpdateBanner();
    }
  });
}

function showUpdateBanner() {
  if (document.getElementById('update-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'update-banner';
  banner.className = 'update-banner';
  banner.innerHTML =
    '<span>Site updated.</span>' +
    '<button class="update-banner-btn" onclick="window.location.reload()">Reload</button>';
  document.body.appendChild(banner);
}
```

### sw.js CACHE_NAME bump

```javascript
// Bump version when any cached asset changes
const CACHE_NAME = 'ce-latin-v8';
// (rest of sw.js unchanged)
```

### papers.html — Specimen Papers Section Pattern

```html
<h2>Specimen Papers</h2>
<p class="papers-intro">Official ISEB specimen papers representing the current exam format.</p>

<div class="papers-level">
  <div class="papers-level-title">Level 1 Specimen</div>
  <div class="papers-level-meta">Official ISEB specimen paper</div>
  <div class="papers-links">
    <a class="papers-link" href="SPECIMEN_L1_URL" target="_blank" rel="noopener">
      <span class="papers-icon">&#x1F4C4;</span> Specimen Paper
    </a>
    <a class="papers-link mark-scheme" href="SPECIMEN_L1_MS_URL" target="_blank" rel="noopener">
      <span class="papers-icon">&#x2713;</span> Mark Scheme
    </a>
  </div>
</div>
```

### CSS variable fix pattern

```css
/* Add to :root in style.css to resolve undefined variables */
:root {
  /* ... existing variables ... */
  --color-ink: var(--color-stone);       /* alias for Q4 styles */
  --font-display: var(--font-body);      /* alias for Q4 styles */
  --font-latin: var(--font-body);        /* alias for Q4 styles */
}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Polling server for version file | Browser-native SW update detection | Browser checks SW on every navigation automatically |
| `registration.update()` manual poll | Rely on browser's automatic update check | Automatic on navigation; manual call not needed for this use case |
| Workbox library for SW update UX | Vanilla controllerchange pattern | Workbox is 20KB overhead for a feature that takes 20 lines; not justified for this static site |

**Not applicable:**
- Workbox — no build tool in this project; vanilla SW is the correct choice
- Push notifications — explicitly out of scope in REQUIREMENTS.md

---

## What PAPER-01 and PAPER-02 Need

**PAPER-01 status:** papers.html exists with correct structure and 6 links (3 papers + 3 mark schemes for L1/L2/L3). The only gap is whether Josh considers these "complete" or wants date labels added (e.g., "Spring 2023" heading above the level sections). The current `papers-intro` text says "Spring 2023" but the structure doesn't group by exam sitting. For one set of papers this is fine.

**PAPER-02 status:** No specimen papers section exists yet. Josh needs to supply the specimen paper URLs. The `.papers-level` pattern is already defined in the page and works perfectly for additional entries. The plan just needs a placeholder task: "Add specimen papers section — Josh to provide URLs."

**Planner note:** If Josh does not have specimen URLs at plan time, PAPER-02 can be split: (a) add the section structure with placeholder links, (b) Josh replaces URLs directly — no JS work required.

---

## Open Questions

1. **Specimen paper URLs (PAPER-02)**
   - What we know: ISEB publishes specimen papers for CE Latin; Josh holds PDF files on Google Drive
   - What's unclear: The exact Drive share URLs for specimen materials — not in the codebase
   - Recommendation: Planner creates a task that adds the section with placeholder `href="#"` values; Josh fills them in directly or provides them before the plan runs

2. **Mobile review scope for "Polish"**
   - What we know: Success criterion 3 is "all pages pass mobile review on real iPhone Safari — no layout breaks, no unreadable tables, no broken nav"
   - What's unclear: Whether this is a dedicated plan step or folded into the deployment verification plan
   - Recommendation: Include as a verification checklist in the final deployment plan; not a separate code task unless issues are found

3. **word-groups.html mobile layout**
   - What we know: word-groups.html is 202 lines (largest HTML file) and was not in the original roadmap requirements; it exists as a vocabulary variant
   - What's unclear: Whether it needs to be included in the mobile polish review pass
   - Recommendation: Include it in the review — it's linked from vocabulary.html

---

## Sources

### Primary (HIGH confidence)
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/waiting — waiting property, update detection pattern
- MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers — skipWaiting, controllerchange, update flow
- Codebase review (sw.js, app.js, papers.html, style.css) — direct inspection, HIGH confidence

### Secondary (MEDIUM confidence)
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/statechange_event — statechange event on ServiceWorker

### Tertiary (LOW confidence)
- None — all findings based on direct code inspection and MDN official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no external libraries; vanilla browser APIs verified against MDN
- Architecture: HIGH — direct codebase inspection; patterns derived from existing code
- Pitfalls: HIGH — SW lifecycle pitfalls verified against MDN documentation
- PAPER-01/PAPER-02 status: HIGH — papers.html directly inspected
- PWA-04 pattern: HIGH — MDN-verified, cross-checked against existing sw.js code

**Research date:** 2026-03-02
**Valid until:** 2026-04-02 (SW API is extremely stable; 30-day window is generous)
