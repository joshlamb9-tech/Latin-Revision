# Architecture Patterns

**Project:** CE Latin Revision Site
**Domain:** Static educational revision PWA (vanilla HTML/CSS/JS, GitHub Pages)
**Researched:** 2026-03-01
**Confidence:** HIGH (pattern is well-established; French site provides a working blueprint)

---

## Recommended Architecture

A flat static site with a clear separation between **content data** (JSON files), **presentation** (HTML pages), **interactivity** (JS modules), and **offline delivery** (service worker). No build step. No framework. All pages are standalone HTML files that share a common shell and pull data from JSON at runtime.

```
ce-latin-revision/
├── index.html                  # Home / hub page
├── manifest.json               # PWA manifest
├── sw.js                       # Service worker (precaches everything)
├── css/
│   ├── style.css               # Global styles (typography, colour tokens, layout)
│   └── components.css          # Shared components (cards, tables, nav, quiz UI)
├── js/
│   ├── app.js                  # App shell init, nav registration, SW registration
│   ├── quiz.js                 # Quiz engine (question generation, scoring, UI)
│   ├── grammar.js              # Grammar reference (table rendering from JSON)
│   └── utils.js                # Shared helpers (shuffle, fetch-with-cache)
├── data/
│   ├── vocabulary/
│   │   ├── all.json            # Master vocabulary list (all ~200 ISEB words)
│   │   ├── by-topic/
│   │   │   ├── family.json
│   │   │   ├── house.json
│   │   │   ├── army.json
│   │   │   ├── gods.json
│   │   │   ├── travel.json
│   │   │   └── daily-life.json
│   │   └── by-frequency/
│   │       ├── top-100.json    # "Red-hot" core words
│   │       └── top-50.json     # Essential sub-set
│   └── grammar/
│       ├── nouns.json          # All declension tables
│       ├── verbs.json          # All conjugation tables
│       └── adjectives.json     # 1st/2nd declension adjectives
├── pages/
│   ├── vocabulary/
│   │   ├── index.html          # Vocabulary hub (topic list)
│   │   ├── by-topic.html       # Topic-filtered word list
│   │   └── by-frequency.html   # Frequency-ranked word list
│   ├── grammar/
│   │   ├── index.html          # Grammar reference hub
│   │   ├── nouns.html          # Noun declension tables
│   │   ├── verbs.html          # Conjugation tables
│   │   └── adjectives.html     # Adjective tables
│   ├── practice/
│   │   ├── index.html          # Practice hub
│   │   ├── vocab-quiz.html     # Vocabulary quiz generator
│   │   └── grammar-drills.html # Declension/conjugation drills
│   └── papers/
│       └── index.html          # Past papers (links / embeds)
└── assets/
    ├── icons/                  # PWA icons (192x192, 512x512)
    └── fonts/                  # Subset of chosen serif font (optional)
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **App Shell** (`app.js`) | Registers SW, wires nav, handles page routing | Service worker (via `navigator.serviceWorker`) |
| **Data Layer** (`data/`) | Single source of truth for all content | Read by quiz engine and grammar renderer at page load via `fetch()` |
| **Quiz Engine** (`quiz.js`) | Generates questions, tracks score, renders quiz UI | Reads from `data/vocabulary/` or `data/grammar/`; writes session state to `localStorage` |
| **Grammar Renderer** (`grammar.js`) | Renders declension/conjugation HTML tables from JSON | Reads from `data/grammar/`; writes to DOM |
| **Service Worker** (`sw.js`) | Intercepts all network requests; serves from cache | Precaches all HTML, CSS, JS, JSON, and assets on install |
| **HTML Pages** | Static shells with `<main>` placeholder; JS populates content | Import `app.js` and page-specific JS module |

Nothing speaks to a server. All data flow is: **JSON file → `fetch()` in JS → DOM**. The service worker intercepts every `fetch()` and serves from cache after first load.

---

## Data Flow

```
User opens page
       │
       ▼
Service Worker intercepts request
       │
  ┌────┴────────────────┐
  │ Cache hit?          │
  │ Yes → serve cached  │
  │ No  → fetch network │
  │       + update cache│
  └────────────────────┘
       │
       ▼
HTML page renders (app shell)
       │
       ▼
page-specific JS runs
       │
       ▼
fetch() → data/vocabulary/topic.json  (or grammar/*.json)
       │
       ▼
JS builds DOM elements (word list / table / quiz)
       │
       ▼
User interacts → quiz.js scores → localStorage (session state)
```

State is minimal and session-scoped. No persistence required beyond `localStorage` for quiz score tracking within a sitting. No user data leaves the browser.

---

## Vocabulary Data Organisation

The ISEB CE Latin syllabus has approximately 200 vocabulary items. Two parallel organisations serve different revision needs:

**By topic** — mirrors how students learn vocabulary in textbooks (Minimus, Bob Bass). Good for contextual learning and thematic drilling.

Suggested topic files (based on CE Latin vocabulary analysis):
- `family.json` — parents, siblings, slaves, household roles
- `house.json` — rooms, furniture, household objects
- `gods.json` — major Roman gods + basic epithets
- `army.json` — soldiers, weapons, commands, military vocabulary
- `travel.json` — roads, cities, journeys
- `daily-life.json` — food, market, time words, common verbs
- `verbs-common.json` — the most frequent action verbs across all topics

**By frequency** — mirrors the "Red-Hot 100 / Evil 85" model proven in CE prep (virdrinksbeer.com). Students cramming for exams want the highest-yield words first.

The `all.json` master file is the canonical source. `by-topic/` and `by-frequency/` files are subsets derived from it. Build and maintain `all.json`; generate or hand-curate the subsets.

**Word record structure:**

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
  "frequency_rank": 12,
  "notes": "Often used in greetings and letters"
}
```

**Verb record:**

```json
{
  "id": "amo-01",
  "latin": "amo",
  "infinitive": "amare",
  "english": "love, like",
  "part_of_speech": "verb",
  "conjugation": 1,
  "topics": ["daily-life"],
  "frequency_rank": 5
}
```

This schema supports: filtering by topic, sorting by frequency, quiz generation (Latin→English and English→Latin), and grammar cross-referencing (declension group for noun drills).

---

## Grammar Data Structure

Grammar tables live in `data/grammar/` as structured JSON. The renderer in `grammar.js` reads these and builds HTML `<table>` elements. This keeps grammar data editable without touching HTML.

**Noun declension record (`nouns.json`):**

```json
{
  "declension": 1,
  "name": "First Declension",
  "example": "puella",
  "meaning": "girl",
  "gender": "feminine",
  "cases": {
    "nominative":  { "singular": "puella",  "plural": "puellae" },
    "vocative":    { "singular": "puella",  "plural": "puellae" },
    "accusative":  { "singular": "puellam", "plural": "puellas" },
    "genitive":    { "singular": "puellae", "plural": "puellarum" },
    "dative":      { "singular": "puellae", "plural": "puellis" },
    "ablative":    { "singular": "puella",  "plural": "puellis" }
  }
}
```

**Verb conjugation record (`verbs.json`):**

```json
{
  "conjugation": 1,
  "name": "First Conjugation",
  "example": "amo",
  "meaning": "love",
  "tenses": {
    "present": {
      "1s": "amo",   "2s": "amas",  "3s": "amat",
      "1p": "amamus","2p": "amatis","3p": "amant"
    },
    "imperfect": {
      "1s": "amabam","2s": "amabas","3s": "amabat",
      "1p": "amabamus","2p": "amabatis","3p": "amabant"
    },
    "perfect": {
      "1s": "amavi", "2s": "amavisti","3s": "amavit",
      "1p": "amavimus","2p": "amavistis","3p": "amaverunt"
    }
  }
}
```

CE Level 1 covers: 1st, 2nd, 3rd declension nouns; 1st/2nd conjugation verbs (present, imperfect, perfect); `sum` (to be). These are the minimum viable grammar tables. Third conjugation and sum should be included even at MVP because they appear in CE papers.

---

## Quiz Engine Architecture

The quiz engine (`quiz.js`) is a self-contained module. It receives a word list (array of word objects from JSON), generates a question set, and renders the UI into a target `<div>`.

**Question types to support:**
1. Latin → English (multiple choice, 4 options)
2. English → Latin (multiple choice, 4 options)
3. Grammar drill: "What is the accusative plural of [noun]?" (fill-in from table)
4. Conjugation drill: "Give the 3rd person plural present of [verb]"

**Engine logic:**

```javascript
// quiz.js — public interface
function initQuiz({ words, type, questionCount, targetEl }) {
  const questions = buildQuestions(words, type, questionCount);
  renderQuiz(questions, targetEl);
}

function buildQuestions(words, type, count) {
  const shuffled = shuffle([...words]);
  return shuffled.slice(0, count).map(word => ({
    word,
    correct: type === 'latin-to-english' ? word.english : word.latin,
    distractors: pickDistractors(word, words, type)
  }));
}
```

Distractors (wrong answers) are drawn from the same word list. This keeps the quiz self-contained — no network call after the data is fetched.

---

## PWA Service Worker Strategy

**Strategy: Cache-first for all precached assets, network-first for nothing.**

This is a revision site. All content is known ahead of time. There is no dynamic server data. The correct strategy is to precache everything on SW install and serve from cache always.

**`sw.js` pattern:**

```javascript
const CACHE_NAME = 'ce-latin-v1';

// List every file the app needs — all HTML, CSS, JS, JSON, icons
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/js/app.js',
  '/js/quiz.js',
  '/js/grammar.js',
  '/js/utils.js',
  '/data/vocabulary/all.json',
  // ... all data files, all pages
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// Update: bump CACHE_NAME version to force re-fetch on deploy
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
```

**Versioning:** Increment `CACHE_NAME` (e.g., `ce-latin-v2`) whenever content changes. The activate handler purges old caches automatically. No manual cache invalidation.

**iOS Safari note:** Service workers do run on iOS Safari (confirmed current). The install banner does not appear automatically — students must use Share > Add to Home Screen. Add a small "Install this app" banner on the homepage that detects `!window.matchMedia('(display-mode: standalone)')` and shows a prompt with Safari instructions. This is a known pattern for educational PWAs targeting school iPads.

---

## Patterns to Follow

### Pattern 1: Page-as-Shell

Each HTML page is a minimal shell that imports JS. Content is injected by JS after fetching JSON. This means the HTML files are tiny and the service worker only needs to cache the JSON once, not duplicate content in HTML.

```html
<!-- pages/vocabulary/by-topic.html -->
<main id="app">
  <div id="topic-list"><!-- populated by vocab.js --></div>
</main>
<script type="module" src="/js/vocab.js"></script>
```

### Pattern 2: URL Parameters for State

No routing library needed. Use `?topic=family` query parameters to pass state between pages. The JS reads `new URLSearchParams(window.location.search)` and fetches the right JSON. This makes pages bookmarkable and shareable — a student can link directly to "army vocabulary".

```javascript
// vocab.js
const params = new URLSearchParams(window.location.search);
const topic = params.get('topic') || 'all';
const data = await fetch(`/data/vocabulary/${topic === 'all' ? 'all' : 'by-topic/' + topic}.json`)
  .then(r => r.json());
renderWordList(data, document.getElementById('topic-list'));
```

### Pattern 3: Data Isolation

The `data/` directory is pure content — no logic. No JS runs in data files. This means content can be updated independently of the application code. When ISEB updates the syllabus, you edit JSON, bump the cache version, and redeploy. No code changes required.

### Pattern 4: Progressive Enhancement for Grammar Tables

Grammar tables render as plain HTML tables. CSS adds colour-coding to case endings (consistent colour per case: red = accusative, blue = genitive, etc.). The colour system works without JS — CSS classes on `<td>` elements do the work. JS only handles the initial render from JSON.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Embedding Content in HTML

**What:** Writing vocabulary words or grammar tables directly into HTML files.
**Why bad:** Any syllabus update requires editing multiple HTML files. Content becomes impossible to reuse across pages. The quiz engine cannot access it.
**Instead:** All content lives in `data/` JSON. HTML is always a shell.

### Anti-Pattern 2: One Giant JavaScript File

**What:** Putting quiz logic, grammar rendering, vocab filtering, and nav all in one `app.js`.
**Why bad:** Harder to maintain, harder to test, harder to reuse on different pages.
**Instead:** Separate modules — `quiz.js`, `grammar.js`, `utils.js`. Each imported only where needed.

### Anti-Pattern 3: localStorage as Primary Data Store

**What:** Copying vocabulary data into `localStorage` on first load, reading from there subsequently.
**Why bad:** `localStorage` has a 5MB limit, is synchronous, and is erased when users clear browsing data. The service worker cache is already doing this job properly.
**Instead:** Service worker caches JSON responses. `localStorage` is only for quiz session state (current score, current question index).

### Anti-Pattern 4: Network-First Service Worker

**What:** Service worker that always tries the network first and only falls back to cache.
**Why bad:** On a patchy school WiFi or mobile connection, every page load has a network delay. Kills the offline-first value proposition.
**Instead:** Cache-first. All assets are known and static. Serve from cache always after install.

### Anti-Pattern 5: Flat Vocabulary JSON (No Schema)

**What:** Storing vocabulary as `[["amicus", "friend"], ["puella", "girl"]]`.
**Why bad:** Cannot filter by topic, cannot sort by frequency, cannot distinguish nouns from verbs for quiz generation, cannot reference declension group for grammar drills.
**Instead:** Use the full word record schema (see Data Organisation section above). The extra fields cost nothing at this scale (~200 words).

---

## Scalability Considerations

This site serves a fixed content set (~200 vocabulary items, ~10 grammar tables). Scale is not a concern in the traditional sense. The relevant scalability questions are:

| Concern | Now (v1) | If licenced to other schools |
|---------|----------|------------------------------|
| Content updates | Edit JSON + bump cache version | Same — no deployment complexity |
| Adding new word lists | Add new JSON file + update SW precache list | Same |
| Multi-school branding | Not needed | Fork repo per school (or add a `config.json` with school name/colours) |
| Adding user accounts | Out of scope | Would require moving to a backend; fundamentally different architecture |
| Adding Level 1/2/3 differentiation | Add `level` field to word records; filter in quiz engine | No structural change needed |

---

## Build Order (Phase Implications)

Components have dependencies. Build in this order:

1. **Data layer first** — Create `data/vocabulary/all.json` and `data/grammar/*.json` with complete, correct content. Everything downstream depends on this. Getting the JSON schema right before building UI prevents rewrites.

2. **App shell + navigation** — `index.html`, `css/style.css`, `css/components.css`, `js/app.js`. Establishes the visual identity and navigation structure all pages share.

3. **Grammar reference pages** — `grammar.js` + grammar HTML pages. Purely display — no interactivity. Validates the JSON schema and the rendering pattern before adding quiz complexity.

4. **Vocabulary pages** — `vocab.js` + vocabulary HTML pages. Validates topic/frequency filtering before wiring to quiz engine.

5. **Quiz engine** — `quiz.js` + quiz HTML pages. Depends on vocabulary data being correct (distractor quality depends on good data) and the page shell pattern being established.

6. **PWA layer** — `manifest.json` + `sw.js`. Add last, once all pages and assets are finalised. The PRECACHE_URLS list must enumerate every file — easiest to write when the file tree is complete.

7. **Past papers section** — Lowest dependency. Can be a static HTML page with links to PDFs. Add whenever the PDF assets are ready.

**Critical dependency:** The vocabulary JSON schema must be agreed before building the quiz engine. If the schema changes after the quiz engine is written, both need to be updated together. Nail the data model in Phase 1.

---

## Sources

- [MDN: PWA App Structure](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/App_structure) — MEDIUM confidence (official docs)
- [MDN: PWA Caching Strategies](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching) — HIGH confidence (official docs)
- [MDN: Making PWAs Installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable) — HIGH confidence (official docs)
- [Brainhub: PWA on iOS 2025](https://brainhub.eu/library/pwa-on-ios) — MEDIUM confidence (verified against MDN; iOS Safari service worker support confirmed)
- [virdrinksbeer.com: CE vocab organisation](https://virdrinksbeer.com/pages/common-academic-scholarship) — MEDIUM confidence (practitioner source; frequency-ranking model "Red-Hot 100" is widely used in CE prep)
- [ISEB CE Classics page](https://www.iseb.co.uk/assessments/common-entrance/classics/) — HIGH confidence (official syllabus authority)
- [Lingua Classica Latin Verb Drill](https://linguaclassica.com/LatinVerbDrill.html) — LOW confidence (example of interaction pattern only)
- [go Make Things: Vanilla JS Project Structure](https://gomakethings.com/how-i-structure-my-vanilla-js-projects/) — MEDIUM confidence (practitioner; consistent with broader community patterns)
