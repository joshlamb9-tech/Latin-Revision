# Technology Stack

**Project:** CE Latin Revision Site
**Researched:** 2026-03-01
**Overall confidence:** HIGH

---

## Verdict on Existing Approach

**Use vanilla HTML/CSS/JS + GitHub Pages + PWA service worker. No change needed.**

The CE French site's stack is not a legacy compromise — it is the architecturally correct choice for this project in 2026. Static, no-build, no-framework is exactly what a small educational site maintained by one teacher should be. The research confirms this; nothing in the ecosystem has emerged that would justify adding tooling complexity.

---

## Recommended Stack

### Hosting

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| GitHub Pages | — | Static hosting | Free, HTTPS automatic, no ops, already used for French site, zero budget requirement. Handles HTTPS which is mandatory for PWA installability. |

**Confidence:** HIGH — GitHub Pages is stable, widely documented, and works perfectly for this use case.

### Core Languages

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| HTML5 | Living Standard | Structure and content | No build step, browsers understand it natively. Semantic HTML gives screen-reader accessibility for free. |
| CSS (vanilla with custom properties) | — | Styling and layout | CSS custom properties (`--variables`) cover all theming needs without Sass. No preprocessor means no build tooling. CSS Grid and Flexbox handle all layout requirements. |
| JavaScript (ES2022+, native modules) | ES2022 | Interactivity and quiz logic | All target browsers (Chrome, Safari 16.4+) support ES modules natively. `import/export` works without a bundler using `<script type="module">`. No transpilation needed for the target audience (Year 8 pupils on school-issue iPads and their own phones). |

**Confidence:** HIGH — all three are supported in every browser a UK prep school pupil is likely to use.

### PWA Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Service Worker (native browser API) | — | Offline caching, installability | Native API, no library dependency, proven on the French site. Handles the core offline requirement. |
| Workbox (via CDN) | 7.3.0 | Service worker helper library | Reduces hand-rolled service worker boilerplate. `importScripts` CDN load means zero build tooling required. Use `CacheFirst` strategy for static assets (HTML, CSS, JS, fonts) and `NetworkFirst` for anything dynamic. **Alternative:** hand-roll the service worker if you want zero external dependencies — the French site pattern is fine to copy directly. |
| Web App Manifest (`manifest.webmanifest`) | — | PWA installability metadata | Required for "Add to Home Screen" on both iOS Safari and Android Chrome. Defines app name, icons, theme colour, and display mode. |

**Confidence:** HIGH for service worker + manifest (MDN, web.dev). MEDIUM for Workbox specifically — it's a Google-maintained library, last release November 2024, and there's a meaningful alternative (hand-rolled SW) that avoids the external CDN dependency.

**Workbox CDN URL (no build tool):**
```javascript
// In sw.js
importScripts('https://cdnjs.cloudflare.com/ajax/libs/workbox-sw/7.3.0/workbox-sw.min.js');
```

**iOS-specific note:** Safari enforces a ~50 MB cache quota for PWA service worker storage. For this site — text content, grammar tables, vocabulary lists, no audio or video — this limit is not a practical concern. Precaching all pages is safe. Stay well under 10 MB total.

### Typography

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| EB Garamond (Google Fonts) | — | Body text and headings | A classical Garamond revival designed for running text — more suitable than Cormorant Garamond (which is optimised for display/headings only). Gives the Roman/classical feel the project requires. Available via Google Fonts CDN with `<link>` preconnect. |
| Cormorant Garamond | — | Optional display headings | If section headers need more dramatic classical weight, use Cormorant Garamond only for `h1`/`h2` display use. Do not use for body text — it is not designed for it. |

**Decision:** Default to **EB Garamond** as the single font choice. Add Cormorant Garamond only if the design requires a more dramatic heading weight.

**Confidence:** MEDIUM — font choice is subjective. Both are from Google Fonts (free, reliable CDN). EB Garamond is the safer all-rounder.

**Google Fonts link pattern:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

### Client-Side Storage

| Technology | Purpose | Why |
|------------|---------|-----|
| `localStorage` | Persist quiz scores, vocabulary progress, last-visited section | Survives tab close, browser close, device restart. No expiry. Sufficient for simple key-value progress tracking. Serialize objects with `JSON.stringify` / `JSON.parse`. |
| `sessionStorage` | Temporary state within a single revision session | Use only if you need state that should not persist — e.g., a "current quiz question" counter. Not needed for v1. |

**Confidence:** HIGH — standard browser API, works in all target browsers, no dependencies.

**Do not use IndexedDB for v1.** It is more complex than needed and `localStorage` covers all v1 persistence requirements (vocabulary scores, grammar drill progress).

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | None (vanilla) | React, Vue, Svelte | Adds build tooling, node_modules, deployment complexity. No meaningful benefit for a site this size. Breaks the parity with the French site. |
| Static site generator | None | Jekyll, Eleventy, Astro | Introduces a build step and local toolchain that a teacher-maintainer shouldn't need to manage. GitHub Pages' native Jekyll support is tempting but adds hidden complexity when you hit its version constraints. |
| CSS preprocessor | None (vanilla CSS) | Sass/SCSS | CSS custom properties handle all theming. No build step needed. Sass adds local tooling for no gain on a site this small. |
| Service worker | Hand-rolled or Workbox CDN | Workbox CLI / webpack plugin | Build-tool versions of Workbox are for frameworks. CDN version or hand-rolled is correct for this use case. |
| Hosting | GitHub Pages | Netlify, Vercel | Both are excellent but introduce accounts, dashboards, and configuration outside the existing French site's workflow. Zero reason to change. |
| Font | EB Garamond | Dosis | Dosis is the French site's font — explicitly must not be reused. EB Garamond provides the classical identity. |
| Storage | localStorage | IndexedDB, cookies | IndexedDB is overkill for v1 data volume. Cookies require server awareness and are wrong for offline-first. |

---

## PWA Manifest Requirements (2026 Best Practice)

```json
{
  "name": "CE Latin Revision",
  "short_name": "Latin Revision",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f5f0e8",
  "theme_color": "#6b3a2a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

**Important:** Do NOT combine `"purpose": "any maskable"` — create separate icons for each purpose. Maskable icons need a "safe zone" circle of 40% radius. The `any` and `maskable` icons should be different files.

**iOS splash screens:** Safari ignores the manifest for splash screens. Use `<link rel="apple-touch-startup-image">` meta tags in HTML for proper iOS splash screen support.

---

## File Structure

```
ce-latin-revision/
├── index.html
├── manifest.webmanifest
├── sw.js
├── css/
│   ├── main.css          # Custom properties, reset, base styles
│   ├── layout.css        # Grid, nav, responsive
│   └── components.css    # Cards, tables, quiz elements
├── js/
│   ├── app.js            # Entry point (type="module")
│   ├── quiz.js           # Vocabulary/grammar quiz logic
│   ├── storage.js        # localStorage wrapper
│   └── nav.js            # Hamburger nav
├── pages/
│   ├── vocabulary/
│   ├── grammar/
│   ├── translation/
│   └── past-papers/
├── data/
│   └── vocabulary.json   # ISEB word list as JSON
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-maskable-512.png
└── assets/
    └── images/
```

---

## Not Recommended

**Do not use:**
- Any JavaScript framework (React, Vue, Svelte, Angular)
- Any CSS framework (Tailwind, Bootstrap) — custom CSS is more appropriate for a designed educational product
- Any build tool (Vite, webpack, Parcel, Rollup)
- Node.js / npm — no package.json needed
- Any backend (this is static-only)
- Video hosting (out of scope v1)
- User accounts / auth (out of scope v1)

---

## Sources

- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — HIGH confidence
- [MDN: Offline and background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) — HIGH confidence
- [MDN: PWA Best Practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices) — HIGH confidence
- [MDN: Define app icons](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons) — HIGH confidence
- [Chrome for Developers: Workbox](https://developer.chrome.com/docs/workbox/) — HIGH confidence
- [cdnjs: workbox-sw 7.3.0](https://cdnjs.com/libraries/workbox-sw) — HIGH confidence
- [GoogleChrome/workbox releases](https://github.com/GoogleChrome/workbox/releases) — HIGH confidence (v7.4.0, November 2024)
- [Google Fonts: EB Garamond](https://fonts.google.com/specimen/EB+Garamond) — HIGH confidence
- [Google Fonts: Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) — HIGH confidence
- [Brainhub: PWA on iOS status 2025](https://brainhub.eu/library/pwa-on-ios) — MEDIUM confidence (third-party analysis)
- [DEV: Why icon purpose "any maskable" is discouraged](https://dev.to/progressier/why-a-pwa-app-icon-shouldnt-have-a-purpose-set-to-any-maskable-4c78) — MEDIUM confidence
- [web.dev: Web App Manifest](https://web.dev/learn/pwa/web-app-manifest) — HIGH confidence
