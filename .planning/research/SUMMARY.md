# Research Summary: CE Latin Revision Site

**Synthesized:** 2026-03-01
**Research files:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
**Overall confidence:** HIGH

---

## Executive Summary

This project is a static educational PWA for Year 8 CE Latin revision, targeting ISEB CE 13+ examination candidates at Mowden Hall and, eventually, other IAPS prep schools. The research is clear and internally consistent: the correct approach is vanilla HTML/CSS/JS on GitHub Pages with a service worker for offline access — identical to the existing French revision site. There is no case for a framework, build tool, or backend. The audience (exam-focused pupils on school iPads and personal phones) defines the constraints: mobile-first, offline-capable, installable, and fast. A classical visual identity (EB Garamond, parchment and terracotta palette) is a genuine differentiator in a space dominated by clinically generic GCSE revision tools.

The central architectural decision — and the one with the highest downstream consequences — is the vocabulary data structure. All four research files converge on a single warning: the vocabulary JSON schema must be defined before any content is written. A structured word record (with fields for `latin`, `english`, `part_of_speech`, `declension`, `conjugation`, `topics`, `frequency_rank`) is the foundation for vocabulary pages, the quiz engine, adaptive pool logic, and future grammar drill features. If vocabulary is written as flat HTML first, the practice generator cannot be built without rewriting from scratch.

The free CE Latin digital landscape has a genuine gap: no free tool offers ISEB-accurate vocabulary (correctly scoped to CE rather than GCSE), functional grammar drills, and offline access in one place. The SMART Latin App charges per feature; Cambridge Latin Course is paywalled; mrlaurence.github.io covers GCSE not CE. A well-executed v1 — correct content, clean design, offline-first — has strong word-of-mouth potential among prep school Latin teachers. The risk of scope creep is real: Level 1/2/3 differentiation, Bob Bass exercise integration, and auto-marked translation are explicitly deferred to v1.1 and v2.

---

## Key Findings

### From STACK.md

| Technology | Purpose | Confidence |
|------------|---------|------------|
| HTML5 / CSS (custom properties) / ES2022 JS | Core site — no framework, no build tool | HIGH |
| GitHub Pages | Hosting — free, HTTPS, consistent with French site | HIGH |
| Service Worker (native) + Web App Manifest | PWA offline and installability | HIGH |
| Workbox 7.3.0 (CDN) | Optional SW helper — or hand-roll from French site | MEDIUM |
| EB Garamond (Google Fonts) | Classical body typography | MEDIUM |
| localStorage | Quiz session state persistence | HIGH |

Critical decisions:
- Do NOT use any JavaScript framework, CSS framework, build tool, or Node/npm
- Use EB Garamond (not Dosis — that is the French site's font and must not be reused)
- Do NOT combine `"purpose": "any maskable"` in PWA manifest icons — separate files required
- iOS Safari: no install banner auto-appears; a manual "Add to Home Screen" prompt pattern is needed
- Stay under 10 MB total — iOS PWA has a ~50 MB cache quota but text content should be well below it

### From FEATURES.md

**Table stakes (must ship in v1):**
- ISEB vocabulary list (all words visible, well-structured)
- Latin-to-English vocabulary quiz (multiple choice)
- English-to-Latin vocabulary quiz
- Grammar reference tables (1st/2nd/3rd declension; present/imperfect/perfect conjugation)
- Past papers section (links to ISEB sources — NOT reproduced content)
- Mobile-first layout with hamburger nav
- Offline access via PWA
- Clear syllabus-aligned navigation

**High-value differentiators (v1 or v1.1):**
- ISEB-specific vocabulary filtering (genuine market gap — free and accurate)
- Classical visual identity (parchment/terracotta/serif — an aesthetic moat)
- Topic/theme vocabulary grouping (family, war, gods, travel, daily life)
- Adaptive quiz pool (correct answers removed from pool; localStorage-based; no server needed)
- Grammar drills — interactive declension/conjugation exercises (CE-specific, not yet available free)

**Defer to v1.1:**
- English-to-Latin quiz (input handling complexity)
- Grammar drills (requires paradigm data model)
- Topic-grouped vocabulary drilling
- Adaptive pool logic (layers onto existing quiz)
- Sentence translation practice (high content effort)

**Defer to v2:**
- CE Level 1/2/3 differentiation
- Bob Bass exercise integration (permission confirmed; encoding effort is significant)

**Anti-features (do not build):**
- User accounts / login (GDPR under-13, no benefit for a static site)
- Spaced repetition algorithm (overkill for exam-window revision)
- Auto-marked translation (NLP complexity; Latin morphology makes it unreliable)
- Video content (out of scope)
- Leaderboards (requires backend)
- Push notifications (no exam-window use case)

**Critical dependency chain:**
Vocabulary JSON dataset unlocks all quiz features. Grammar paradigm JSON unlocks both static reference tables and interactive drills. Build data before building UI.

### From ARCHITECTURE.md

**Core pattern:** Flat static site. Every HTML page is a minimal shell populated by JS fetching JSON at runtime. No templating engine. No build step.

**Component responsibilities:**

| Component | Role |
|-----------|------|
| `app.js` | SW registration, nav wiring |
| `quiz.js` | Self-contained quiz engine — receives word array, generates questions, renders UI |
| `grammar.js` | Renders declension/conjugation tables from JSON into DOM |
| `utils.js` | shuffle, fetch helpers |
| `data/` | Single source of truth — JSON only, no logic |
| `sw.js` | Cache-first, precaches all assets on install |

**Key patterns:**
- Page-as-shell: `<main id="app">` populated by JS, not hand-authored HTML
- URL parameters for state: `?topic=family` → JS reads URLSearchParams → fetches `by-topic/family.json` → bookmarkable/shareable
- Data isolation: `data/` contains only content; all logic in `js/`

**Vocabulary data structure (agreed schema):**
```json
{
  "id": "amicus-01",
  "latin": "amicus",
  "genitive": "amici",
  "gender": "m",
  "english": "friend",
  "part_of_speech": "noun",
  "declension": 2,
  "topics": ["daily-life", "family"],
  "frequency_rank": 12
}
```

**Build order (architectural dependency):**
1. Data layer (vocabulary and grammar JSON)
2. App shell and navigation
3. Grammar reference pages (validates rendering pattern)
4. Vocabulary pages (validates topic/frequency filtering)
5. Quiz engine
6. PWA layer (manifest + SW — added last when file tree is complete)
7. Past papers section (lowest dependency, add when PDFs ready)

**Anti-patterns identified:**
- Embedding content in HTML (makes quiz engine impossible to build)
- One giant app.js (breaks maintainability)
- localStorage as primary data store (SW cache does this job; localStorage is for session state only)
- Network-first service worker (kills offline-first value)
- Flat vocabulary JSON with no schema (blocks quiz distractor quality and grammar drill features)

### From PITFALLS.md

**Critical pitfalls (address before building):**

| Pitfall | Phase to Address | Prevention |
|---------|-----------------|------------|
| PWA cache collision with French site | Phase 1 | Unique `ce-latin-` prefix; scope SW to repo path; only delete own-prefixed caches |
| Latin content inaccuracy (wrong forms, missing macrons) | Phase 2 | Source every form from ISEB PDF + Bob Bass; two-person review; UTF-8 throughout |
| Scope creep beyond ISEB CE syllabus | Ongoing | ISEB PDF is the only arbiter; Level 1/2/3 deferred to v2 |
| Vocabulary stored as HTML not structured data | Phase 1 | Define JSON schema before writing any content |

**Moderate pitfalls:**

| Pitfall | Phase | Prevention |
|---------|-------|------------|
| Grammar tables unreadable on mobile | Phase 2 | `overflow-x: auto` wrapper; block-reflow at 480px; test on real iPhone |
| SW updates not reaching installed users | Phase 1 | `skipWaiting()`; version bump on every content update; update notification banner |
| Copyright risk from past paper content | Phase 1 (decision) | Links to ISEB only; original practice questions; never reproduce past paper sentences |
| Distractor quality too low in quiz | Phase 3 | Filter distractors by part of speech; exclude proper nouns |

**Minor pitfalls:**

| Pitfall | Prevention |
|---------|-----------|
| Macron rendering failures | `<meta charset="UTF-8">` first; UTF-8 files; store Unicode chars directly |
| localStorage crash in Safari private mode | Wrap all `localStorage` calls in try/catch; degrade gracefully |
| Post-launch content drift | ISEB calendar reminder each September; structured data makes corrections a single-file edit |

**The single most important pitfall:** Cache collision between the Latin and French sites on the shared GitHub Pages origin (`joshlamb9-tech.github.io`). This must be resolved in Phase 1, before either site is updated. The French site's service worker should be audited at the same time.

---

## Implications for Roadmap

Research across all four files converges on the same phase structure. The build order is driven by data dependencies, not features.

### Suggested Phase Structure

**Phase 1: Foundation — Data, Shell, and PWA**

Rationale: Everything else depends on this. The vocabulary JSON schema, once locked, cannot change without cascading rewrites. The PWA cache namespace must be correct before the French site is touched. The visual identity should be established globally from day one.

Delivers:
- Agreed and populated vocabulary JSON (`data/vocabulary/all.json`) with complete schema
- Grammar paradigm JSON (`data/grammar/nouns.json`, `verbs.json`)
- App shell: `index.html`, `css/style.css`, nav, EB Garamond, classical colour palette
- `manifest.webmanifest` + `sw.js` with correct `ce-latin-` cache namespace
- UTF-8 encoding verified throughout
- French site service worker audited for cache namespace safety

Features from FEATURES.md: Mobile-first layout, offline access (PWA), classical visual identity
Pitfalls to avoid: Cache collision (#1), vocabulary structure (#4), macron encoding (#9), SW update lifecycle (#6), copyright decision (#7)

Research flag: Standard patterns — no additional research needed for this phase.

---

**Phase 2: Grammar Reference and Vocabulary Pages**

Rationale: Static reference content is the simplest interaction to build — it validates the rendering pattern (JSON-to-DOM) before the quiz engine is added. Grammar tables are the highest-stakes content for accuracy (wrong forms = exam failure), so they need the most review time. Vocabulary pages establish the topic/frequency filtering UI that the quiz later builds on.

Delivers:
- Grammar reference pages: noun declension tables (1st, 2nd, 3rd), verb conjugation (present, imperfect, perfect), `sum`
- Vocabulary pages: full word list, by-topic views, by-frequency view
- Responsive table pattern established and documented
- Content review sign-off: every form cross-checked against ISEB PDF and Bob Bass

Features from FEATURES.md: Grammar reference tables, ISEB vocabulary list, topic grouping (v1 of)
Pitfalls to avoid: Latin accuracy (#2), mobile tables (#5), scope creep (#3)

Research flag: Standard patterns — no additional research needed. Content accuracy is the risk, not the engineering.

---

**Phase 3: Practice Generator (Quiz Engine)**

Rationale: The quiz engine is the most technically interesting component and the core learning feature. It depends on correct vocabulary data (Phase 1) and the page-shell pattern (Phase 2) being established first. Distractor quality depends on the structured data schema.

Delivers:
- Latin-to-English vocabulary quiz (multiple choice, 4 options)
- Distractor generation filtered by part of speech (no proper noun distractors)
- localStorage for quiz session state with graceful Safari private-mode degradation
- Score tracking and progress feedback
- Adaptive pool (known words removed) as first differentiator

Features from FEATURES.md: Latin-to-English quiz, adaptive pool
Pitfalls to avoid: Distractor quality (#8), localStorage Safari crash (#10), past paper copyright (#7)

Research flag: Standard patterns — adaptive pool logic in vanilla JS is well understood. No phase-specific research needed.

---

**Phase 4: Past Papers Section and Polish**

Rationale: Lowest technical dependency — a static HTML page with links. High perceived value for teachers. Copyright decision must be made before building. Polish pass ensures mobile experience is consistent across all pages before wider sharing.

Delivers:
- Past papers section: links to ISEB official sources and specimen papers
- Site-wide mobile polish and cross-browser testing (real iPhone Safari)
- "Install this app" prompt for iOS users
- Update notification banner for SW updates
- `CONTENT_CHANGELOG.md` and correction workflow documented

Features from FEATURES.md: Past papers section, PWA installability
Pitfalls to avoid: Copyright (#7), SW update stale content (#6), iOS install prompt (from STACK.md)

Research flag: Standard patterns. No research needed.

---

**Phase 5: English-to-Latin, Grammar Drills, and v1.1 Features (deferred)**

Rationale: These require the Phase 1-3 foundations to be solid. Grammar drills need the paradigm data model and quiz engine to be proven at scale. English-to-Latin input handling is more complex than multiple choice.

Delivers:
- English-to-Latin quiz (typed or richer multiple choice)
- Grammar drills: "Give the accusative plural of [noun]" / "Conjugate [verb] in imperfect"
- Topic-grouped vocabulary drilling

Research flag: Grammar drill interaction patterns may benefit from a research pass — specifically how to present "produce the form" questions in a mobile-friendly way without keyboard frustration.

---

### Research Flags Summary

| Phase | Needs Research Pass | Reason |
|-------|--------------------|---------|
| Phase 1 | No | Stack and PWA patterns are thoroughly documented |
| Phase 2 | No | Rendering patterns are standard; risk is content accuracy, not engineering |
| Phase 3 | No | Quiz engine in vanilla JS is well-documented; distractor logic is straightforward |
| Phase 4 | No | Static page + links; SW update pattern covered in PITFALLS.md |
| Phase 5 | Consider | Grammar drill mobile UX — how to handle "produce the form" input on touch keyboards |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Strong MDN and web.dev sources; pattern proven on French site |
| Features | HIGH (table stakes) / MEDIUM (differentiators) | Table stakes from direct competitor analysis; differentiators extrapolated from gap analysis |
| Architecture | HIGH | Well-established static PWA pattern; French site provides working blueprint |
| Pitfalls | HIGH | Critical pitfalls backed by official sources (MDN, web.dev, UK Gov, WebKit blog) |

**Overall: HIGH confidence.** The research is internally consistent and the recommended approach is low-risk.

---

## Gaps to Address During Planning

1. **Target vocabulary level:** Which ISEB level(s) to cover in v1? The syllabus has Level 1, 2, and 3. Research assumes a single level — Josh needs to confirm which one. This affects word list size and content effort.

2. **French site service worker audit:** Before Phase 1 is complete, the French site's existing service worker must be inspected to confirm its cache prefix. If it is not namespaced, both sites need updating simultaneously.

3. **ISEB specimen paper availability:** The past papers section format depends on which ISEB specimen papers are publicly available for linking (not hosting). Confirm before designing the section.

4. **Bob Bass encoding scope for v1.1:** Permission is confirmed but encoding effort is unquantified. Before v1.1 planning, estimate how many exercises exist and how long encoding will take.

5. **Macron policy for v1:** Decide at the start whether macrons will be included on all vocabulary entries. Including them correctly requires sourcing from authoritative texts; omitting them is simpler but pedagogically weaker. This affects the data schema and content effort estimate.

---

## Sources (Aggregated)

**HIGH confidence:**
- [MDN — PWA Guides](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/) — PWA installability, caching, service workers
- [web.dev — Building multiple PWAs on the same domain](https://web.dev/articles/building-multiple-pwas-on-the-same-domain) — Cache collision prevention
- [web.dev — Web App Manifest](https://web.dev/learn/pwa/web-app-manifest) — Manifest best practice
- [WebKit — Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/) — iOS ITP and localStorage eviction
- [UK Government — Copyright Exceptions: Education](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/375951/Education_and_Teaching.pdf) — Past paper copyright
- [ISEB — CE Classics](https://www.iseb.co.uk/assessments/common-entrance/classics/) — Official syllabus authority
- [SMART Latin App](https://smartlatinapp.com/) — Competitor feature analysis
- [latinvocabularytester.com](https://latinvocabularytester.com/) — Competitor feature analysis
- [Google Fonts — EB Garamond](https://fonts.google.com/specimen/EB+Garamond) — Typography

**MEDIUM confidence:**
- [virdrinksbeer.com — CE vocab frequency model](https://virdrinksbeer.com/pages/common-academic-scholarship) — "Red-Hot 100" frequency ranking approach
- [CSS-Tricks — Responsive Data Tables](https://css-tricks.com/responsive-data-tables/) — Mobile table pattern
- [Brainhub — PWA on iOS 2025](https://brainhub.eu/library/pwa-on-ios) — iOS service worker status
- [PMC — Automatic distractor generation](https://pmc.ncbi.nlm.nih.gov/articles/PMC6294274/) — Quiz distractor quality research
- [Quizlet — Question format selection](https://quizlet.com/blog/selecting-question-formats-to-maximize-the-testing-effect) — Multiple choice vs typed input evidence
