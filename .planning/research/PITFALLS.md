# Domain Pitfalls

**Domain:** CE Latin revision website (static PWA, vanilla JS, GitHub Pages)
**Researched:** 2026-03-01
**Confidence:** HIGH — pitfalls drawn from verified technical sources, domain expertise, and project-specific context

---

## Critical Pitfalls

Mistakes that cause rewrites, user distrust, or exam failures for students.

---

### Pitfall 1: PWA Cache Collision with the French Revision Site

**What goes wrong:** Both the Latin site and the existing French site (`joshlamb9-tech/y8-french-revision`) will live under the same GitHub Pages origin (`joshlamb9-tech.github.io`). Service workers on the same origin share a single cache storage space. If the Latin site's service worker calls `caches.keys()` to clean old caches and deletes anything not matching its own cache name, it will delete the French site's cached assets — making the French PWA unusable offline. The reverse is also true when the French site updates.

**Why it happens:** GitHub Pages personal accounts use one root domain. There are no subdomains per-repo by default, so all repos under one account share an origin. Browser storage, permissions, and service worker scope are all per-origin. Each app's service worker can see and delete every other app's caches.

**Consequences:** Students who have the French site installed offline lose offline access after the Latin site is deployed. Service worker registration scope conflicts cause install failures or blank screens.

**Prevention:**
- Give each site a unique, namespaced cache prefix: e.g., `CACHE_NAME = 'ce-latin-v1'` for Latin and `CACHE_NAME = 'ce-french-v1'` for French.
- In the activate event, only delete caches that start with your own prefix — never delete all caches indiscriminately.
- Scope the service worker to the repo subdirectory path: `scope: '/ce-latin-revision/'` (matching the GitHub Pages repo path).
- Verify the French site's service worker already uses a scoped cache prefix. If it does not, fix both before deploying the Latin site.

**Detection:** Open DevTools > Application > Cache Storage on the French site after deploying the Latin site. If French caches have been cleared, this pitfall has fired.

**Phase:** Address in Phase 1 (PWA setup). Do not defer — once both sites are live, tracing the source of cache eviction is hard.

**Sources:** [web.dev — Building multiple PWAs on the same domain](https://web.dev/articles/building-multiple-pwas-on-the-same-domain), [GitHub issue: cache management with multiple PWA subdirectories](https://github.com/angular/mobile-toolkit/issues/162)

---

### Pitfall 2: Latin Content Inaccuracy (Declension Errors and Macron Omissions)

**What goes wrong:** A revision site that teaches wrong forms poisons exam preparation. Latin grammar tables are exacting: a nominative plural that uses an accusative ending, a genitive written without the correct termination, or macrons omitted from long vowels (e.g., `amō` displayed as `amo`) all constitute errors. Students drilling wrong forms will reproduce them in exams.

**Why it happens:** Content is often written quickly from memory. Macrons are routinely dropped because they require Unicode characters that do not appear on standard keyboards. Third declension irregulars (e.g., `iter`, `iteris`) are commonly misremembered. Verb tables for mixed conjugation verbs (e.g., `capio`) are a known stumbling point.

**Consequences:** Students internalise wrong forms. Credibility with teachers and other IAPS schools — the target licensing market — is destroyed by a single spotted error. There is no way to recall content already viewed offline.

**Prevention:**
- Source every grammar table and vocabulary entry from a single authoritative reference — the official ISEB syllabus PDF and Bob Bass materials (for which permission is confirmed). Do not write from memory.
- Create a content review checklist: every table and vocab entry must be cross-checked against two sources before shipping.
- For macrons: use Unicode codepoints directly in HTML (e.g., `ā` = `&#257;`, `ē` = `&#275;`). Declare `<meta charset="UTF-8">` in every page. Do not rely on HTML entities being typed consistently — store the actual Unicode character in the data files and render it directly.
- Ask a second Latin teacher (or a trusted former pupil) to audit grammar tables before launch.

**Detection:** Before launch, read every form in every table aloud against the Bob Bass reference. Flag any form that required memory rather than source lookup.

**Phase:** Phase 2 (grammar reference content). Enforce review before any content goes to the vocabulary practice generator in Phase 3.

---

### Pitfall 3: Scope Creep Beyond ISEB CE Requirements

**What goes wrong:** The site starts adding content beyond the ISEB CE Latin syllabus — GCSE forms, prose composition rules, etymology sections, Level 1/2/3 differentiation (explicitly out of scope in PROJECT.md). Each addition feels small. The result is an unfinished v1 that launched six months late covering 60% of the syllabus properly rather than 100% of it well.

**Why it happens:** Latin is a rich subject. Teachers instinctively want to include helpful extras. The three-level ISEB structure (Level 1, 2, 3) creates a temptation to differentiate per-level rather than targeting the common core. The licensing aspiration to other IAPS schools adds pressure to make the site "impressive."

**Consequences:** Core syllabus pages (declension tables, core vocabulary) are launched incomplete or under-tested while effort went to bonus features.

**Prevention:**
- The ISEB CE Latin syllabus PDF is the only arbiter of what is in scope. If it is not in the official syllabus, it does not ship in v1.
- Treat Level 1/2/3 differentiation as v2 — acknowledge the decision in a `FUTURE.md` file to capture the idea without acting on it.
- At the start of every content session, ask: "Is this vocabulary/grammar on the ISEB word list?" If the answer requires checking, it is probably borderline and should be cut.

**Detection:** Warning sign: you are writing content about topics you cannot immediately cite in the ISEB PDF.

**Phase:** Ongoing through all phases. Enforce hardest during Phase 2 and 3 (content and practice generator).

---

### Pitfall 4: Vocabulary Data Structure That Cannot Power the Practice Generator

**What goes wrong:** Vocabulary is stored as flat HTML — a `<table>` with Latin in one column and English in another. When Phase 3 (practice generator) is built, there is no machine-readable data to pull from. The generator has to either scrape the DOM (fragile, error-prone) or the vocabulary is re-entered a second time in a different format (duplicate effort, drift risk).

**Why it happens:** Content is written as pages first, with the generator as a later phase. The natural impulse is to build the vocabulary pages as HTML tables, which look right immediately.

**Consequences:** Either the generator is never built properly (technical debt blocks the feature), or vocab data is maintained in two places and drifts out of sync.

**Prevention:**
- Define the vocabulary data structure first, in Phase 1 or early Phase 2, before writing any vocabulary content.
- Store all vocabulary in a single `data/vocabulary.js` or `data/vocabulary.json` file as structured objects. Render the vocabulary pages dynamically from this file. The practice generator draws from the same file.
- Recommended structure per entry:

```javascript
{
  latin: "amat",
  english: "he/she loves",
  part_of_speech: "verb",
  conjugation: 1,
  person: 3,
  number: "singular",
  tense: "present",
  topic: "verbs-present",
  level: "core"  // if level differentiation is added later
}
```

- Noun entries need: `latin`, `english`, `genitive`, `gender`, `declension`, `topic`.
- This single-source-of-truth approach means adding a word once populates vocabulary pages, practice generator, and any future filtered views automatically.

**Detection:** If you catch yourself copy-pasting vocabulary from an HTML page into a separate JS array, the data structure pitfall has already fired.

**Phase:** Address in Phase 1 (architecture/data design). This is a foundational decision.

---

## Moderate Pitfalls

---

### Pitfall 5: Wide Grammar Tables Breaking on Mobile

**What goes wrong:** Latin declension tables (6 cases x 2 numbers = 12 cells) and conjugation tables (6 persons x multiple tenses) are inherently wide. On a 375px phone screen, a standard `<table>` overflows horizontally and is unusable without zooming. Students using phones for revision (the core use case) cannot read the tables.

**Why it happens:** Tables are built on desktop, look fine, and the mobile breakpoint is tested briefly on browser DevTools rather than on actual handsets. Declension tables need at least 4 columns (Case, Singular, Plural, Translation/Notes) — often more when multiple declensions are shown side-by-side.

**Consequences:** The core grammar reference section — the most-used section during revision — is unusable on the primary device students actually use.

**Prevention:**
- Default to stacked/scrollable approaches for mobile:
  - **Horizontal scroll wrapper:** Wrap each table in a `div` with `overflow-x: auto`. Simple and reliable. Add a subtle scroll indicator shadow so students know the table continues.
  - **Block reflow:** At `max-width: 480px`, use `display: block` on `td` elements with a `data-label` attribute and `::before { content: attr(data-label) }` to show case names as inline labels. This converts rows into cards.
- Choose one approach and apply it consistently across all grammar tables. Do not mix patterns.
- Test on a real iPhone (Safari), not just Chrome DevTools — Safari renders tables differently and has historically had scrolling quirks in PWA mode.
- For side-by-side declension comparisons (e.g., 1st vs 2nd declension), consider showing them sequentially on mobile rather than side-by-side.

**Detection:** Load a grammar table page on an iPhone in portrait mode. If you need to pinch-zoom to read it, the problem is present.

**Phase:** Address in Phase 2 (grammar reference). Establish the responsive table pattern once and reuse it.

**Sources:** [CSS-Tricks — Responsive Data Tables](https://css-tricks.com/responsive-data-tables/), [Smashing Magazine — Accessible Patterns for Responsive Tables](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/)

---

### Pitfall 6: Service Worker Update Confusion (Stale Content After Updates)

**What goes wrong:** A student installs the PWA. Content errors are corrected and the site is updated. The student's device never receives the update because the service worker serves everything from cache and the update lifecycle is not handled. Students continue drilling wrong content after corrections are published.

**Why it happens:** Cache-first service workers, by design, serve from cache on subsequent visits. The browser downloads the new service worker in the background but does not activate it until all tabs using the old worker are closed — which students using a PWA may not do for days or weeks.

**Consequences:** Content corrections do not reach students. If a grammar error is published and corrected, students who installed offline before the correction will drill the wrong form indefinitely.

**Prevention:**
- Increment the cache version constant (`const CACHE_VERSION = 'v2'`) on every content update. The new service worker will detect a different file, install in background, and delete the old cache on activation.
- Add a simple update notification: detect when a new service worker is waiting (`navigator.serviceWorker.addEventListener('controllerchange', ...)`) and show a banner: "Updated content available — tap to refresh."
- Use `skipWaiting()` in the new service worker's install event to force immediate activation (appropriate for a static content site with no complex state).
- Document the version bump as a required step in any content update workflow.

**Detection:** Update a page, then open the installed PWA on a phone without closing it. Check whether the change appears. If not, the update mechanism is not working.

**Phase:** Address in Phase 1 (PWA setup). Establish correct update lifecycle from the start.

**Sources:** [MDN — Offline Service Workers](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers), [Debugging PWA Common Pitfalls](https://blog.pixelfreestudio.com/debugging-progressive-web-apps-common-pitfalls/)

---

### Pitfall 7: Copyright Risk from Past Paper Content

**What goes wrong:** CE Latin past papers are reproduced on the site — either scanned, transcribed, or linked directly — without ISEB permission. ISEB controls past paper distribution through a paid online shop with school account verification. Public reproduction of past paper content constitutes copyright infringement.

**Why it happens:** Past papers feel like course materials. Teachers routinely photocopy them. The line between "classroom use" and "public website" is blurred in practice, but legally distinct. UK fair dealing exceptions for education explicitly do not extend to making copies available on public-facing websites.

**Consequences:** ISEB takedown notice. Reputational damage with IAPS schools — the exact market the site hopes to reach. Potential liability for Mowden Hall.

**Prevention:**
- Do not reproduce past paper questions on the site. Ever.
- The "past papers section" in PROJECT.md requirements should be reframed as a **links page** — link to official sources where papers can be purchased, or to the ISEB website where specimen papers are available as free downloads.
- Specimen papers (the official ISEB sample papers available on the public ISEB website) are downloadable and may be linkable; confirm with ISEB before embedding or hosting.
- For practice questions, write original questions in the style of CE Latin papers — do not transcribe actual past paper sentences.
- Bob Bass materials: permission is explicitly confirmed per PROJECT.md — cite appropriately in footer and note the permission in a `CREDITS.md` file.
- Minimus (Cambridge University Press): do not reproduce vocabulary lists or exercises from Minimus without CUP permission. Use it as a teaching reference only; all site content should derive from the ISEB official word list and Bob Bass materials.

**Detection:** Before any content goes live, ask: "Where did this sentence/question come from?" If the answer is "a past paper," remove it.

**Phase:** Address in Phase 1 (content strategy decision). Decide the past papers section format before building it.

**Sources:** [UK Government — Copyright Exceptions: Education and Teaching](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/375951/Education_and_Teaching.pdf), [ISEB Past Papers Shop](https://common-entrance.support.iseb.co.uk/support/solutions/articles/101000467213/)

---

### Pitfall 8: Vocabulary Practice Generator Producing Implausible Wrong Answers

**What goes wrong:** The multiple-choice practice generator picks wrong answers randomly from the full vocabulary list. With 200 words, a student sees: "What does `puella` mean?" with options: A) girl, B) Rome, C) with, D) having been loved. Options B and C are obviously wrong from context (proper noun, preposition). The quiz becomes trivially easy and fails as a learning tool.

**Why it happens:** The simplest implementation — pick 3 random words from the array — ignores the semantic and grammatical distribution of the list. Prepositions, proper nouns, and verbs should not appear as distractors for noun questions.

**Consequences:** Students do not actually learn vocabulary because wrong answers are too obvious to provide useful challenge. The site's core practice feature delivers no educational value.

**Prevention:**
- Constrain wrong answer generation by part of speech: noun questions get noun distractors, verb questions get verb distractors.
- Further constrain by topic/thematic group where possible (e.g., body parts, military terms) so the semantic field is plausible.
- Exclude proper nouns from distractor pools entirely.
- Prioritise distractors that are morphologically or semantically similar (e.g., for `amat` — he loves, offer `amat` vs `amant` — they love, to test number; or `amat` vs `amabat` to test tense). This requires the structured data from Pitfall 4's solution.
- A simple implementation without semantic weighting is fine for v1 — but the data structure must support it later. The minimum requirement is filtering by part of speech.

**Detection:** Run 20 practice questions. If you can get more than 15 right by process of elimination without knowing Latin, the distractor quality is too low.

**Phase:** Phase 3 (practice generator). Requires the structured vocabulary data from Phase 1/2.

**Sources:** [PMC — Automatic distractor generation for multiple-choice vocabulary questions](https://pmc.ncbi.nlm.nih.gov/articles/PMC6294274/)

---

## Minor Pitfalls

---

### Pitfall 9: Macron Rendering Failures

**What goes wrong:** Latin long vowels (ā, ē, ī, ō, ū) display as question marks, boxes, or incorrectly as mojibake (e.g., `Ã¢`) on some devices. This is particularly likely if the HTML file was saved without UTF-8 encoding, or if the GitHub Pages server sends incorrect `Content-Type` headers.

**Why it happens:** Macron characters (Unicode Latin Extended-A range, U+0100–U+017E) are not in the basic Latin-1 charset. Any encoding mismatch — file saved as Latin-1, or HTML missing `<meta charset="UTF-8">` — causes mojibake. The problem is invisible during development if the developer's editor handles encoding silently.

**Prevention:**
- Ensure every HTML file begins with `<meta charset="UTF-8">` in `<head>`, before any other meta tags.
- Save all files as UTF-8 in the editor (VS Code default is UTF-8; confirm in status bar).
- Store macronised characters as the actual Unicode characters in source, not as HTML entities (e.g., type `ā` not `&amacr;`) — this is readable and less error-prone.
- Verify Cormorant Garamond (the planned font) supports Latin Extended-A. It does — the font includes a full diacritics set per the Google Fonts documentation.
- Test macron display on an Android device (Chrome) and iOS (Safari) before launch.

**Detection:** Paste `āēīōū ĀĒĪŌŪ` into a test page and view on both iOS and Android. If any character is missing or garbled, the encoding is wrong.

**Phase:** Phase 1 (project setup). Establishing UTF-8 encoding is a project-level configuration, not a per-page fix.

**Sources:** [PSU Symbol Codes — Latin](https://sites.psu.edu/symbolcodes/languages/ancient/latin/), [W3Schools UTF-8 Latin Extended-A](https://www.w3schools.com/charsets/ref_utf_latin_extended_a.asp)

---

### Pitfall 10: localStorage Failures in Safari Private Browsing

**What goes wrong:** The practice generator uses localStorage to track which words have been practiced, or to save quiz scores. Students using the PWA in Safari's private browsing mode — or on a school network that forces private browsing — find that quiz progress is lost, or worse, the page throws an uncaught exception and the quiz breaks entirely.

**Why it happens:** Safari in private browsing mode throws a `QuotaExceededError` when any code calls `localStorage.setItem()`. The storage appears available but throws on write. This is a known iOS/macOS Safari behaviour dating from iOS 5 and still present.

**Additionally:** Safari's Intelligent Tracking Prevention (ITP) evicts script-writable storage (including localStorage) from PWAs that haven't been used in 7 days. Long school holiday periods mean returning students find their progress wiped.

**Prevention:**
- Wrap all localStorage calls in a try/catch. If `setItem` throws, degrade gracefully (no persistence, but no crash).
- For a revision site with no user accounts, localStorage is low-stakes (quiz scores, not critical data). Treat it as a convenience, not a requirement.
- Display a simple notice when persistence is unavailable: "Progress won't be saved in private browsing mode."
- Do not build features that require localStorage to function (e.g., "resume where you left off" as a hard requirement). It is a nice-to-have.

**Detection:** Open the site in Safari > Private Browsing on an iPhone and run the practice generator. If the page errors or hangs, localStorage is the cause.

**Phase:** Phase 3 (practice generator). Build the graceful degradation in when localStorage is first introduced.

**Sources:** [Apple Developer Forums — iOS PWA Data Persistence](https://developer.apple.com/forums/thread/710157), [WebKit — Updates to Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)

---

### Pitfall 11: Post-Launch Content Drift and Maintenance Abandonment

**What goes wrong:** The ISEB syllabus is updated (a regular occurrence — the V3.3 version referenced in search results indicates multiple revisions). Vocabulary entries change, grammar requirements are added or removed. The site is not updated to match. Students revise to an outdated specification and are surprised by exam content.

**Additionally:** Small errors are spotted after launch (wrong word, transposed form) but there is no process for logging, fixing, and deploying corrections. The site sits wrong for months.

**Why it happens:** Post-launch maintenance has no built-in trigger. The syllabus PDF update is not flagged to the site owner. Static sites feel "done" after launch.

**Consequences:** Exam failure attribution. Other IAPS schools that adopted the site stop recommending it after spotting errors.

**Prevention:**
- Subscribe to ISEB classics updates. ISEB publishes syllabus revisions — add a calendar reminder to check the classics syllabus page each September.
- Create a `CONTENT_CHANGELOG.md` file at launch. Any correction goes in there with a date. This creates accountability and a record for schools considering the licence.
- Establish a simple correction workflow: spot error → open GitHub issue → fix in data file → bump service worker cache version → merge and deploy. Make the barrier to correction as low as possible.
- Do not hardcode vocabulary in HTML. The structured data file approach (Pitfall 4 prevention) means a correction is a single-line edit in one file, not hunting through 12 pages of HTML.

**Detection:** Warning sign: you spot an error but do not know the steps to fix and redeploy quickly. The process needs to be faster than 30 minutes from spot to live.

**Phase:** Addressed in Phase 1 (establish the data file approach) and finalised at launch (document the correction workflow).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Phase 1: Project setup + PWA | Cache namespace collision with French site | Use unique `ce-latin-` cache prefix; scope service worker to repo path |
| Phase 1: Project setup + PWA | Service worker update not reaching installed users | Implement `skipWaiting()` and version bump workflow from day one |
| Phase 1: Data architecture | Vocabulary stored as HTML not structured data | Define `data/vocabulary.js` schema before writing any content |
| Phase 2: Grammar reference | Declension/conjugation errors from memory | Source every form from ISEB PDF + Bob Bass; two-person review |
| Phase 2: Grammar reference | Tables unreadable on phones | Implement horizontal-scroll wrapper pattern; test on real iPhone |
| Phase 2: Content scope | Adding content beyond ISEB syllabus | Check every item against the official ISEB PDF before writing |
| Phase 3: Practice generator | Past paper questions reproduced | Write original practice questions only; link to ISEB for past papers |
| Phase 3: Practice generator | Wrong answers too obvious | Filter distractors by part of speech; exclude proper nouns |
| Phase 3: Practice generator | localStorage crash in Safari private mode | Wrap all storage calls in try/catch; degrade gracefully |
| Post-launch | Syllabus drift after ISEB update | Calendar reminder each September; structured data makes corrections fast |

---

## Sources

- [web.dev — Building multiple PWAs on the same domain](https://web.dev/articles/building-multiple-pwas-on-the-same-domain) — HIGH confidence (official Google web.dev)
- [MDN — Service Workers and Offline](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers) — HIGH confidence (official MDN)
- [WebKit — Updates to Storage Policy (ITP)](https://webkit.org/blog/14403/updates-to-storage-policy/) — HIGH confidence (official Apple WebKit blog)
- [UK Government — Copyright Exceptions: Education and Teaching](https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/375951/Education_and_Teaching.pdf) — HIGH confidence (official UK government guidance)
- [ISEB — CE Classics Assessments](https://www.iseb.co.uk/assessments/common-entrance/classics/) — HIGH confidence (official ISEB)
- [CSS-Tricks — Responsive Data Tables](https://css-tricks.com/responsive-data-tables/) — MEDIUM confidence (widely cited, well-established technique)
- [Smashing Magazine — Accessible Patterns for Responsive Tables](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/) — MEDIUM confidence (reputable publication, 2022)
- [PMC — Automatic distractor generation for vocabulary questions](https://pmc.ncbi.nlm.nih.gov/articles/PMC6294274/) — MEDIUM confidence (peer-reviewed, relevant to quiz design)
- [PSU Symbol Codes — Latin macrons](https://sites.psu.edu/symbolcodes/languages/ancient/latin/) — MEDIUM confidence (educational institution reference)
- [Google Fonts — Cormorant Garamond diacritics support](https://fonts.google.com/specimen/Cormorant+Garamond) — HIGH confidence (official Google Fonts)
- [Apple Developer Forums — iOS PWA localStorage](https://developer.apple.com/forums/thread/710157) — MEDIUM confidence (official Apple forums, known issue)
- [Debugging PWA Common Pitfalls — Pixel Free Studio](https://blog.pixelfreestudio.com/debugging-progressive-web-apps-common-pitfalls/) — LOW confidence (WebSearch only, included for illustrative value; MDN sources take priority)
