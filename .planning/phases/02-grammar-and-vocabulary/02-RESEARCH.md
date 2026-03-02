# Phase 2: Grammar and Vocabulary - Research

**Researched:** 2026-03-01
**Domain:** Vanilla JS DOM rendering from JSON, responsive HTML tables, URL parameter filtering, static site patterns
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRAM-01 | Grammar reference pages for 1st, 2nd, and 3rd declension noun tables (all cases, singular and plural) | JSON schema in `data/grammar/nouns.json` is complete with 5 paradigms — rendering pattern documented below |
| GRAM-02 | Grammar reference pages for verb conjugation tables (present, imperfect, perfect — 1st and 2nd conjugation) | JSON schema in `data/grammar/verbs.json` is complete — tenses nested under `conjugations[n].tenses` |
| GRAM-03 | `sum` (to be) conjugation reference page | `data/grammar/verbs.json` has `irregular` array with `sum` — rendered separately from regular conjugations |
| GRAM-04 | Grammar tables rendered from JSON via `grammar.js` — not hard-coded HTML | `fetch()` + `JSON.parse` + `innerHTML` pattern is the established approach for this project |
| GRAM-05 | Grammar tables readable on mobile — `overflow-x: auto` wrapper, responsive reflow tested on real iPhone Safari | CSS pattern is simple; critical pitfall is forgetting `min-width` on `<table>` inside the wrapper |
| VOCAB-01 | Full ISEB word list page — all Level 1 & 2 words visible, searchable/filterable | 211 entries in `all.json`; render as `<dl>` or `<table>` via JS |
| VOCAB-02 | By-topic vocabulary views via URL parameter (`?topic=family`) | `URLSearchParams` API is the correct tool; 6 topic tags confirmed |
| VOCAB-03 | By-frequency vocabulary views (Top 50, Top 100) via URL parameter | `frequency_rank` field is an integer on every entry; sort ascending and slice |
| VOCAB-04 | Vocabulary pages rendered from JSON via JS — not hard-coded HTML | Same `fetch()` + DOM rendering pattern as grammar |
</phase_requirements>

---

## Summary

Phase 2 is a pure vanilla JS DOM-rendering phase. The data layer is complete from Phase 1 — both JSON files (`nouns.json` and `verbs.json`) have the exact schema needed for grammar tables, and `all.json` has all 211 vocabulary entries with `topics` and `frequency_rank` fields. There is nothing to install, no library to choose, and no build step. The only domain to understand is: how do you correctly fetch JSON, traverse it, build HTML tables, apply CSS for mobile-safe table overflow, and read URL parameters?

The two HTML shells (`grammar.html` and `vocabulary.html`) already exist in the project root. Both currently show a "Loading..." placeholder inside `<main id="app">`. Phase 2 wires these up by writing dedicated JS modules (`js/grammar.js` and `js/vocabulary.js`) that `fetch()` the JSON and render content into `<main id="app">`. The `js/app.js` is already doing nav toggle and SW registration — the new modules should be separate script files, each loaded only on their respective page.

URL parameter filtering for vocabulary (`?topic=family`, `?freq=50`) is handled by the browser-native `URLSearchParams` API — no library needed. The filtering pattern is: fetch all.json, read params, filter the array, render. The grammar page requires no URL parameter filtering; it renders all tables from JSON.

**Primary recommendation:** Write `js/grammar.js` and `js/vocabulary.js` as self-contained modules using `fetch()`, `URLSearchParams`, and `document.createElement`/`innerHTML` patterns. Do not modify `js/app.js`. Add `overflow-x: auto` table wrapper CSS to `style.css`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vanilla JS (`fetch`) | Browser-native | Load JSON files | No dependency, already used in project |
| `URLSearchParams` | Browser-native | Parse `?topic=` and `?freq=` params | Built-in, correct tool for the job |
| CSS `overflow-x: auto` | Browser-native | Prevent table horizontal overflow on mobile | Standard responsive table pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `document.createElement` | Browser-native | Build DOM nodes for table cells | When building large structured tables (avoids `innerHTML` injection risks) |
| `innerHTML` with sanitised data | Browser-native | Inject rendered HTML string | Acceptable here because all data is static, controlled JSON — not user input |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla `fetch` + DOM | A framework (React, Vue) | Frameworks are explicitly out of scope — project constraint |
| `URLSearchParams` | Manual `location.search` parsing | `URLSearchParams` is cleaner and browser-native; manual parsing is error-prone |
| `overflow-x: auto` on wrapper | Horizontal scrolling on `body` | Per-table wrappers are more targeted; body-level scroll breaks sticky nav |

**Installation:** None. This phase has zero npm dependencies.

---

## Architecture Patterns

### Recommended Project Structure

```
js/
├── app.js          # EXISTING — nav toggle + SW registration only
├── grammar.js      # NEW — fetch nouns.json + verbs.json, render all grammar tables
└── vocabulary.js   # NEW — fetch all.json, apply URL param filters, render word list

css/
└── style.css       # EXISTING — add .table-scroll, table, th, td rules

data/
├── grammar/
│   ├── nouns.json  # EXISTING — 5 declension paradigms
│   └── verbs.json  # EXISTING — 2 conjugations + sum irregular
└── vocabulary/
    └── all.json    # EXISTING — 211 entries
```

### Pattern 1: Fetch JSON and render on DOMContentLoaded

**What:** Each page's JS file fetches its JSON on load, then builds and inserts DOM.
**When to use:** All grammar and vocabulary pages.

```javascript
// Source: MDN Web Docs — fetch API (browser-native)
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  fetch('data/grammar/nouns.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load nouns.json');
      return response.json();
    })
    .then(data => {
      // Clear "Loading..." placeholder
      app.innerHTML = '<h1>Grammar</h1>';
      renderNounTables(app, data.declensions);
    })
    .catch(err => {
      app.innerHTML = '<p class="error">Could not load grammar tables. Try reloading.</p>';
      console.error('[CE Latin] Grammar load error:', err);
    });
});
```

**Critical:** Use `response.ok` check before `.json()` — the service worker will serve a cached 200 response offline, but on first load a missing file returns a non-`ok` status without throwing.

### Pattern 2: Render a noun declension table from a paradigm object

**What:** Build an HTML `<table>` element for a single declension (one entry from `data.declensions`).
**When to use:** GRAM-01 — noun tables.

```javascript
// Source: MDN Web Docs — createElement, Table API
function renderDeclensionTable(decl) {
  const cases = decl.cases; // ["nominative", "vocative", ...]

  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll'; // overflow-x: auto wrapper

  const section = document.createElement('section');
  section.className = 'grammar-section';

  const heading = document.createElement('h2');
  heading.textContent = decl.name; // e.g. "First Declension"
  section.appendChild(heading);

  const subheading = document.createElement('p');
  subheading.className = 'grammar-example';
  subheading.textContent = `${decl.example_noun} — ${decl.example_meaning}`;
  section.appendChild(subheading);

  const table = document.createElement('table');
  table.className = 'grammar-table';

  // Header row
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  ['Case', 'Singular', 'Plural'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.appendChild(th);
  });

  // Data rows — one per case
  const tbody = table.createTBody();
  cases.forEach(caseName => {
    const row = tbody.insertRow();
    const caseCell = row.insertCell();
    caseCell.textContent = caseName.charAt(0).toUpperCase() + caseName.slice(1);
    caseCell.className = 'case-label';

    const sgCell = row.insertCell();
    sgCell.textContent = decl.singular[caseName];

    const plCell = row.insertCell();
    plCell.textContent = decl.plural[caseName];
  });

  wrapper.appendChild(section);
  wrapper.appendChild(table);
  return wrapper;
}
```

### Pattern 3: Render a verb conjugation table from a tense object

**What:** Build a table for one tense of one verb (e.g. portō present tense).
**When to use:** GRAM-02 and GRAM-03.

```javascript
// Source: MDN Web Docs — createElement pattern
function renderTenseTable(tense, tenseName) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'grammar-table';

  // Header
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  ['Person', 'Singular', 'Plural'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.appendChild(th);
  });

  // Rows: 1st, 2nd, 3rd person
  const tbody = table.createTBody();
  ['1st', '2nd', '3rd'].forEach(person => {
    const row = tbody.insertRow();
    row.insertCell().textContent = person;
    row.insertCell().textContent = tense.singular[person];
    row.insertCell().textContent = tense.plural[person];
  });

  wrapper.appendChild(table);
  return wrapper;
}
```

### Pattern 4: URL parameter filtering for vocabulary

**What:** Read `?topic=war%2Farmy` or `?freq=50` from the URL and filter the 211-entry array before rendering.
**When to use:** VOCAB-02, VOCAB-03.

```javascript
// Source: MDN Web Docs — URLSearchParams
function getFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    topic: params.get('topic'),   // e.g. "war/army" or null
    freq: params.get('freq')      // e.g. "50" or null (string — parse to int)
  };
}

function applyFilters(words, filters) {
  let result = [...words];

  if (filters.topic) {
    result = result.filter(w => w.topics.includes(filters.topic));
  }

  if (filters.freq) {
    const limit = parseInt(filters.freq, 10);
    result = result
      .sort((a, b) => a.frequency_rank - b.frequency_rank)
      .slice(0, limit);
  }

  return result;
}
```

**Note on `war/army` URL encoding:** The slash in `war/army` must be encoded as `%2F` in the URL. `URLSearchParams.get('topic')` automatically decodes it back to `war/army`. The `?topic=war%2Farmy` link in the page's HTML must encode the slash — generate these links programmatically or write them manually encoded.

### Pattern 5: Vocabulary word rendering

**What:** Render a single vocabulary entry as a `<div>` card or `<tr>` row.
**When to use:** VOCAB-01, VOCAB-02, VOCAB-03, VOCAB-04.

```javascript
// Render as definition list items (compact, semantic for vocab)
function renderWordCard(word) {
  const item = document.createElement('div');
  item.className = 'vocab-item';

  const latin = document.createElement('span');
  latin.className = 'vocab-latin';
  latin.textContent = word.latin;

  const english = document.createElement('span');
  english.className = 'vocab-english';
  english.textContent = word.english;

  const meta = document.createElement('span');
  meta.className = 'vocab-meta';
  // e.g. "noun, f, 1st decl." or "verb, 1st conj."
  meta.textContent = buildMeta(word);

  item.appendChild(latin);
  item.appendChild(english);
  item.appendChild(meta);
  return item;
}
```

### Pattern 6: Loading both grammar JSON files in sequence

**What:** `grammar.js` needs both `nouns.json` and `verbs.json`. Use `Promise.all` to load both in parallel.
**When to use:** GRAM-01 through GRAM-04.

```javascript
// Source: MDN Web Docs — Promise.all
Promise.all([
  fetch('data/grammar/nouns.json').then(r => r.json()),
  fetch('data/grammar/verbs.json').then(r => r.json())
])
.then(([nounsData, verbsData]) => {
  renderAllGrammar(nounsData, verbsData);
})
.catch(err => {
  document.getElementById('app').innerHTML =
    '<p class="error">Could not load grammar tables.</p>';
});
```

### Anti-Patterns to Avoid

- **Loading grammar.js on all pages:** Each JS module should only be loaded in the `<script>` tag of its own HTML page. `js/grammar.js` only goes in `grammar.html`. Do not add it to `app.js` via dynamic import — just use a `<script>` tag per page.
- **Hard-coding form data in HTML:** All Latin forms must come from JSON. If you type a Latin ending directly in HTML, you've violated GRAM-04/VOCAB-04.
- **Modifying `js/app.js`:** This file handles nav toggle and SW registration for all pages. Adding page-specific logic to it creates coupling. Keep grammar and vocabulary logic in their own files.
- **Using `innerHTML` with user-supplied data:** All data in this phase is from controlled JSON files, so `innerHTML` is acceptable. But do not use this pattern for Phase 3 quiz where user input is involved.
- **Fetching JSON with a relative path that breaks on GitHub Pages:** The site root on GitHub Pages is `/Latin-Revision/`. Because the HTML files are at root, `fetch('data/grammar/nouns.json')` is a root-relative fetch that works correctly. Do not use `./` or absolute paths.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL parameter parsing | Manual `location.search.split('&')` | `URLSearchParams` | Built-in, handles encoding edge cases (e.g. `%2F` in `war/army`) |
| Table overflow on mobile | JavaScript width detection | CSS `overflow-x: auto` on wrapper div | Pure CSS solution is simpler, no JS needed, works with iOS momentum scroll |
| JSON loading with retry | Custom retry logic | Standard `fetch()` with `.catch()` error message | Service worker handles caching; retry logic would fight the SW |
| Frequency sort | Custom sort algorithm | `Array.sort()` on `frequency_rank` | The field is already an integer; native sort is correct |

**Key insight:** This phase is deliberately low-tech. The temptation is to reach for a library or clever abstraction. Resist it. The correct solution is loops, `createElement`, and `fetch`. Any complexity added now becomes maintenance debt for Phase 3.

---

## Common Pitfalls

### Pitfall 1: Table overflow breaking mobile layout

**What goes wrong:** An HTML `<table>` wider than the viewport causes the entire page to scroll horizontally, not just the table.
**Why it happens:** Tables do not respect `overflow-x: auto` on themselves — it must be on a wrapper `<div>`.
**How to avoid:** Every table must be wrapped in `<div class="table-scroll">` with `overflow-x: auto; -webkit-overflow-scrolling: touch;` in CSS. The table itself should have `min-width: 360px` to force scrollability below that width.
**Warning signs:** Testing on Chrome desktop shows no issue; only manifests on real iPhone Safari in portrait mode at 375px width.

```css
/* Add to style.css */
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1.5rem;
}

.grammar-table {
  width: 100%;
  min-width: 360px;
  border-collapse: collapse;
  font-size: 1rem;
}

.grammar-table th,
.grammar-table td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  text-align: left;
}

.grammar-table th {
  background-color: var(--color-parchment-dark);
  color: var(--color-stone);
  font-weight: 700;
}

.grammar-table .case-label {
  font-style: italic;
  color: var(--color-stone-light);
}
```

### Pitfall 2: `war/army` topic URL encoding

**What goes wrong:** A link `href="vocabulary.html?topic=war/army"` — the slash is interpreted as a path separator in some contexts, or is lost.
**Why it happens:** `/` has special meaning in URLs.
**How to avoid:** Encode it as `vocabulary.html?topic=war%2Farmy` in all hard-coded links. Or generate filter links programmatically using `encodeURIComponent('war/army')`. `URLSearchParams.get()` decodes correctly on receipt. Then `w.topics.includes(filters.topic)` works because the decoded value is `"war/army"` which matches the JSON.
**Warning signs:** Filter shows 0 results for war/army topic despite entries existing.

### Pitfall 3: Forgetting the `sum` irregular verb needs its own section

**What goes wrong:** Grammar page only renders `data.conjugations` and misses `data.irregular`.
**Why it happens:** The JSON structure has two top-level arrays: `conjugations` and `irregular`. Easy to iterate only one.
**How to avoid:** Explicitly iterate both. After rendering 1st and 2nd conjugation tables, also iterate `data.irregular` and render those tables under an "Irregular Verbs" heading.

### Pitfall 4: Fetch paths breaking on GitHub Pages

**What goes wrong:** `fetch('/data/grammar/nouns.json')` (absolute path) returns 404 on GitHub Pages.
**Why it happens:** GitHub Pages deploys to `https://joshlamb9-tech.github.io/Latin-Revision/`, so absolute `/data/...` resolves to `https://joshlamb9-tech.github.io/data/...` (wrong).
**How to avoid:** Always use root-relative fetch without leading slash: `fetch('data/grammar/nouns.json')`. This resolves relative to the page's URL, which is the project root. Confirmed: Phase 1 set `<base>` behaviour — the service worker is registered at scope root, so relative fetches work from all pages.

### Pitfall 5: Script load order — grammar.js referencing app.js globals

**What goes wrong:** Code in `grammar.js` accidentally calls functions defined in `app.js`.
**Why it happens:** Both scripts run in global scope (no modules). If `grammar.js` calls something only available after `app.js` loads, it may fail on some devices if script order differs.
**How to avoid:** Each script is fully self-contained. `grammar.js` does not rely on anything in `app.js`. Load order in HTML: `app.js` first, then `grammar.js`. Both at bottom of `<body>`.

### Pitfall 6: Empty state for filtered vocabulary

**What goes wrong:** A URL parameter matches no entries (e.g. a misspelled topic), and the page renders blank with no feedback to the student.
**How to avoid:** After filtering, if `result.length === 0`, render an explicit "No words found for this filter" message inside `#app`.

---

## Code Examples

### Full grammar.js module structure

```javascript
// js/grammar.js
// Source: MDN Web Docs — fetch, Promise.all, createElement
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  Promise.all([
    fetch('data/grammar/nouns.json').then(r => { if (!r.ok) throw new Error('nouns'); return r.json(); }),
    fetch('data/grammar/verbs.json').then(r => { if (!r.ok) throw new Error('verbs'); return r.json(); })
  ])
  .then(([nounsData, verbsData]) => {
    app.innerHTML = '';

    const h1 = document.createElement('h1');
    h1.textContent = 'Grammar';
    app.appendChild(h1);

    // --- Nouns ---
    const nounsHeading = document.createElement('h2');
    nounsHeading.textContent = 'Noun Declensions';
    app.appendChild(nounsHeading);

    nounsData.declensions.forEach(decl => {
      app.appendChild(renderDeclensionSection(decl));
    });

    // --- Regular Verbs ---
    const verbsHeading = document.createElement('h2');
    verbsHeading.textContent = 'Verb Conjugations';
    app.appendChild(verbsHeading);

    verbsData.conjugations.forEach(conj => {
      app.appendChild(renderConjugationSection(conj));
    });

    // --- Irregular Verbs ---
    const irregHeading = document.createElement('h2');
    irregHeading.textContent = 'Irregular Verbs';
    app.appendChild(irregHeading);

    verbsData.irregular.forEach(verb => {
      app.appendChild(renderIrregularSection(verb));
    });
  })
  .catch(err => {
    app.innerHTML = '<h1>Grammar</h1><p class="error">Could not load grammar tables. Please reload.</p>';
    console.error('[CE Latin] Grammar load error:', err);
  });
});
```

### Full vocabulary.js module structure

```javascript
// js/vocabulary.js
// Source: MDN Web Docs — fetch, URLSearchParams
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const filters = getFilters();

  fetch('data/vocabulary/all.json')
    .then(r => { if (!r.ok) throw new Error('vocab'); return r.json(); })
    .then(words => {
      const filtered = applyFilters(words, filters);
      renderVocabulary(app, filtered, filters);
    })
    .catch(err => {
      app.innerHTML = '<h1>Vocabulary</h1><p class="error">Could not load vocabulary list. Please reload.</p>';
      console.error('[CE Latin] Vocabulary load error:', err);
    });
});

function getFilters() {
  const params = new URLSearchParams(window.location.search);
  return {
    topic: params.get('topic'),
    freq: params.get('freq') ? parseInt(params.get('freq'), 10) : null
  };
}

function applyFilters(words, filters) {
  let result = [...words];
  if (filters.topic) {
    result = result.filter(w => w.topics.includes(filters.topic));
  }
  if (filters.freq) {
    result = result
      .sort((a, b) => a.frequency_rank - b.frequency_rank)
      .slice(0, filters.freq);
  }
  return result;
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Hard-coded Latin tables in HTML | JSON-driven rendering via JS | Enables future updates to content without touching HTML |
| `location.search` manual parsing | `URLSearchParams` API | Handles edge cases (encoding, missing params) correctly |
| `table` without `overflow-x` wrapper | `div.table-scroll` wrapping every table | Prevents full-page horizontal scroll on mobile |

**Deprecated/outdated:**
- jQuery `$.ajax()`: Not needed; `fetch()` is standard and already sufficient for this project.
- `XHR` (XMLHttpRequest): Replaced by `fetch()` — do not use.

---

## What The Phase Needs to Build

Based on the JSON data that exists and the empty HTML shells in place, Phase 2 requires exactly these new files:

1. **`js/grammar.js`** — fetches `nouns.json` + `verbs.json`, renders all tables into `grammar.html`'s `#app`
2. **`js/vocabulary.js`** — fetches `all.json`, reads URL params, filters, renders into `vocabulary.html`'s `#app`
3. **CSS additions to `css/style.css`** — table styles (`.table-scroll`, `.grammar-table`, `.vocab-item`, `.vocab-filters`)

And these modifications to existing files:
4. **`grammar.html`** — add `<script src="js/grammar.js">` before `</body>`
5. **`vocabulary.html`** — add `<script src="js/vocabulary.js">` before `</body>`

No other files need changing. The HTML shells, CSS variables, nav, footer, and service worker are all already correct from Phase 1.

---

## Open Questions

1. **Vocabulary filter UI — links vs. live search**
   - What we know: Requirements specify URL parameter filtering (`?topic=family`, `?freq=50`). This implies navigating to a URL, not typing in a search box.
   - What's unclear: Should the vocabulary page show topic filter links at the top (e.g. "Family | War/Army | Gods | All")? Or is the URL parameter approach purely for deep-linking (e.g. from the home page)?
   - Recommendation: Render filter links at the top of the vocabulary page using the known topic tags from the data. This makes filtering discoverable without a search input field. The links simply navigate to `vocabulary.html?topic=family` etc. No JS event handling required for the filter links themselves.

2. **Vocabulary display format — table or card list**
   - What we know: 211 entries. Mobile-first. No requirement specifies `<table>` vs `<dl>` vs cards.
   - What's unclear: A table with Latin/English/meta columns would work but may overflow on narrow phones. A card/list layout scales better to mobile.
   - Recommendation: Use a definition-list style layout (`.vocab-list` with `.vocab-item` divs) rather than a `<table>`. This avoids the mobile table overflow problem entirely for vocabulary. Reserve `<table>` for grammar paradigms where the grid structure is essential.

3. **Grammar page navigation — single page or separate pages**
   - What we know: `grammar.html` is a single page. The requirements reference "grammar reference pages" (plural) but all grammar content can fit on one scrollable page.
   - What's unclear: Should nouns and verbs be on separate pages, or one long page with anchor links?
   - Recommendation: Single `grammar.html` page, all sections rendered sequentially. Add anchor IDs to each section (`id="nouns"`, `id="verbs"`, `id="sum"`) to enable deep linking if needed later. Avoids navigation complexity and extra HTML files.

---

## Sources

### Primary (HIGH confidence)

- MDN Web Docs — `fetch()` API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN Web Docs — `URLSearchParams`: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
- MDN Web Docs — `HTMLTableElement`: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTableElement
- MDN Web Docs — `overflow-x`: https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x
- Project source: `data/grammar/nouns.json` — confirmed structure (5 declension paradigms, 6 cases, sg/pl)
- Project source: `data/grammar/verbs.json` — confirmed structure (2 conjugations + `irregular` array with `sum`)
- Project source: `data/vocabulary/all.json` — confirmed 211 entries, all `topics` and `frequency_rank` populated
- Project source: `css/style.css` — confirmed CSS custom properties for theming; no table styles yet
- Project source: `grammar.html`, `vocabulary.html` — confirmed both have `<main id="app">` placeholder pattern

### Secondary (MEDIUM confidence)

- CSS responsive table pattern (overflow wrapper): widely documented across MDN and CSS-Tricks — consistent advice across sources
- `war/army` URL encoding issue with `/` in `encodeURIComponent`: standard URL specification behaviour, consistent across sources

### Tertiary (LOW confidence)

- None — all findings verified from project source or MDN

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no libraries involved; all browser-native APIs verified against MDN
- Architecture: HIGH — based on direct inspection of existing project files; patterns match what Phase 1 established
- Pitfalls: HIGH — table overflow confirmed by examining CSS (no table styles exist yet); URL encoding issue is a known standard behaviour; other pitfalls derived from direct JSON structure inspection
- JSON schema: HIGH — both JSON files fully read and structure confirmed

**Research date:** 2026-03-01
**Valid until:** Stable — vanilla JS and CSS patterns are not fast-moving. Valid indefinitely unless project pivots to a framework (explicitly ruled out).
