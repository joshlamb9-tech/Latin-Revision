# Feature Landscape

**Domain:** CE Latin revision PWA for prep school Year 8 students (ISEB CE 13+ syllabus)
**Researched:** 2026-03-01
**Overall confidence:** HIGH for table stakes (well-established patterns from comparable tools); MEDIUM for differentiators (fewer ISEB-specific examples)

---

## Table Stakes

Features students expect from any Latin revision tool. Missing any of these and students will dismiss the site as incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| ISEB vocabulary list — all levels | The exam has a prescribed word list. Any revision tool without it is useless for CE prep. SMART Latin App, latinvocabularytester.com, and every CE text resource includes this as the core content. | Low | ISEB publishes 4 lists: Level 1, Level 2, Level 3, and Scholarship. Project scope says "single syllabus for v1" — confirm which level(s) to cover. |
| Latin→English vocabulary quiz | The most basic recall exercise. Every competing product (SMART Latin App, Brainscape, Quizlet CE sets, mrlaurence.github.io) offers this as the entry-level interaction. | Low | Multiple choice is the minimum viable format. |
| English→Latin vocabulary quiz | Students are tested both directions in CE. SMART Latin App specifically calls this out as a stretch feature; it's already expected by most Year 8 students. | Low | Harder for the student; requires typed input or richer multiple choice. |
| Grammar reference tables | Declension tables (1st, 2nd, 3rd noun) and conjugation tables (present, imperfect, perfect) are the non-negotiable grammar anchors for CE. Every textbook and revision guide includes these. | Low | Static reference pages. No interactivity required at this stage. Should be scannable at a glance on a phone. |
| Mobile-first layout | Students revise on phones and tablets, not at desks. All competing products (SMART Latin App is iOS-native; latinvocabularytester.com is responsive) assume mobile. | Low | Already in project brief. Hamburger nav required. |
| Offline access (PWA) | Proven differentiator from the French revision site. Students revise in dormitories, on coaches, in prep sessions without reliable WiFi. Once expected from your own site, it becomes table stakes for this audience. | Medium | Service worker + precached pages. Established pattern from French site. |
| Past papers section | Students and teachers expect past CE papers to be consolidated in one place. ISEB sells them; Galore Park and common resources host exercises from them. Any revision site without access to practice papers feels incomplete. | Low | Static PDFs linked or embedded — no interactivity required for v1. |
| Clear syllabus structure / navigation | Students need to know "I can revise vocabulary, grammar, and past papers here." Navigation must match the CE syllabus structure so students can orient quickly. | Low | Section-based nav matching ISEB topic areas. |

---

## Differentiators

Features that make this site stand out from generic Latin tools and justify its existence as a dedicated CE resource. Students won't demand these on day one, but they are what earn repeat visits and word-of-mouth spread among prep schools.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| ISEB-specific vocabulary filtering | Generic Latin tools (latinvocabularytester.com) cover GCSE OCR/Eduqas/AS Level but CE vocab is listed as an afterthought or paywalled (SMART Latin App charges per dictionary). A free, ISEB-accurate word list, grouped by level and topic, is a genuine gap. | Low–Medium | Requires accurate encoding of the ISEB prescribed vocabulary list. Topic/theme grouping (e.g., "family", "war", "time") would be distinctive. |
| Grammar drills — declension and conjugation exercises | latinvocabularytester.com has these for GCSE; SMART Latin App lists a Grammar Tester as "coming soon." A CE-specific interactive grammar drill (produce the correct form given case/tense/person) is missing from the current free landscape. | Medium | Select: noun, declension, case → student produces the form. Or select: verb, tense, person → student produces conjugated form. Requires a data model for paradigms. |
| Classical visual identity | Every GCSE revision tool (Save My Exams, Brainscape) looks clinical and generic. Cambridge Latin Course online is branded but not beautiful. A site that feels genuinely Roman — parchment, stone, serif typography — builds affinity with the subject and stands out instantly. | Medium | Design work, not engineering. Font selection (Cormorant Garant / EB Garamond), colour palette (parchment, terracotta, deep burgundy), subtle classical ornament. This is the aesthetic moat. |
| Adaptive quiz (skip known words) | SMART Latin App charges for their SMART Questioning technology. The core idea — don't repeat words you've already got right — is straightforward to implement in vanilla JS with localStorage. Free adaptive testing would be a genuine advantage. | Medium | Track correct answers in localStorage. Remove correctly-answered words from the active pool until the student resets. No server needed. |
| Topic/theme vocabulary grouping | The ISEB word list can be taught and revised in thematic clusters (family, war, religion, time, the body, etc.). No free CE tool currently offers theme-grouped drilling. Prep school teachers (the buyers and recommenders) would value this for lesson integration. | Medium | Requires tagging each word in the vocabulary dataset with a theme. JSON data structure. |
| Bob Bass content integration | Bob Bass's practice exercises (permission granted) are specifically written for CE Latin. No other free online tool uses this content. Integrating exercises directly from his materials gives the site content credibility that generic tools cannot match. | Medium | Requires encoding exercises from Bob Bass PDFs into a structured format. Manual data entry work, not engineering complexity. |
| PWA installability ("Add to Home Screen") | SMART Latin App exists in the App Store but requires download and potential cost. A free, installable PWA with the same offline experience removes all friction. For a student with 10 minutes before prep, this matters. | Low–Medium | Already in project brief. Manifest + service worker. Proven pattern from French site. |
| Sentence / translation practice | latinvocabularytester.com does not include sentence translation. Cambridge Latin Course online does but it's paywalled. Free sentence-level practice (short Latin sentences with CE-appropriate vocabulary) would cover a gap in the free landscape. | High | Display a sentence, student attempts translation, reveal model answer + explanation. No auto-marking (too hard without NLP) — self-assessment model is fine. |

---

## Anti-Features

Features to explicitly NOT build in v1. Each one is a real temptation that would bloat scope without proportional benefit.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User accounts / login | Adds auth complexity, GDPR obligations for under-13s (COPPA/UK GDPR), hosting costs, maintenance burden. Zero benefit for a static site with no persistent server state. | Use localStorage for any state that needs persisting (quiz progress, correct/incorrect tracking). |
| Spaced repetition algorithm | True SRS (Anki-style) requires tracking review intervals, scheduling future reviews, and storing a history. Overkill for CE revision which has a defined end-date (the exam). Simpler "remove known words from pool" achieves 80% of the benefit. | Adaptive pool (correct answers removed until reset) is sufficient. |
| Auto-marked translation | NLP-based sentence translation marking is a solved problem only at significant cost and complexity. Latin morphology makes it harder than modern languages. Students will argue with any wrong auto-mark and lose trust in the tool. | Self-assessment with model answers. Display the translation, let the student mark themselves. Honest, low-friction, pedagogically defensible. |
| Video content | Out of scope per project brief. Hosting, encoding, bandwidth costs. Cambridge Latin Course does it well; no point competing. | Link out to Cambridge SCP video resources or YouTube where relevant. |
| CE Level 1 / Level 2 / Level 3 differentiation in v1 | Differentiated content paths multiply the content maintenance burden. For Mowden Hall specifically, there is likely one target level. | Single syllabus in v1. Confirm target level with Josh. Add level filtering as v2 if needed. |
| Leaderboards / competitive features | latinvocabularytester.com has leaderboards; they require a backend to persist scores across sessions. Adds server complexity and gaming incentives that may distract from revision. | Focus on individual mastery. Progress feedback ("You've got 23/40 words right") is sufficient without ranking against others. |
| Push notifications | Requires service worker + notification permission flow + a reason to send notifications. CE revision has a defined exam window — students don't need a subscription cadence. | If notifications are needed, implement a simple "revision reminder" calendar link instead (ICS download). |
| Backend / database | Static site constraint is a feature, not a limitation. Any backend adds hosting costs, ops overhead, and security surface. | All data in JSON files, all state in localStorage. |

---

## Feature Dependencies

```
ISEB vocabulary data (JSON) → Latin→English quiz
ISEB vocabulary data (JSON) → English→Latin quiz
ISEB vocabulary data (JSON) + theme tags → Topic-grouped vocabulary pages
ISEB vocabulary data (JSON) + adaptive pool logic → Adaptive quiz (skip known words)

Grammar paradigm data (declension/conjugation tables as data) → Grammar reference pages
Grammar paradigm data → Grammar drills (interactive)

Bob Bass exercises encoded → Translation practice (sentence-level)

Service worker + manifest → PWA installability
Service worker + precaching → Offline access

Past paper PDFs → Past papers section (linked/embedded)

All pages built → Mobile-first layout applies globally
All pages built → Classical visual theme applies globally
```

Key dependency chain: The vocabulary JSON dataset is the foundation. Build and verify it before building any quiz feature. Grammar paradigm data is a separate dataset that unlocks both static reference and interactive drills.

---

## MVP Recommendation

Ship in this order of priority:

1. **ISEB vocabulary list pages** — static, topic-grouped, all words visible (table stakes; proves content coverage)
2. **Latin→English vocabulary quiz** — multiple choice, adaptive pool with localStorage (table stakes + one differentiator in one feature)
3. **Grammar reference tables** — 1st/2nd/3rd declension, present/imperfect/perfect conjugation, static but well-designed (table stakes)
4. **Past papers section** — links/PDFs, zero engineering (table stakes, high perceived value for teachers)
5. **PWA + offline** — manifest and service worker (table stakes for this audience, proven from French site)
6. **Classical visual theme** — applied globally from the start (differentiator; does not need to be deferred)

**Defer to v1.1:**
- English→Latin quiz (increases complexity of input handling; can follow Latin→English)
- Grammar drills / interactive conjugation (requires paradigm data model)
- Topic/theme vocabulary grouping (requires tagging the dataset)
- Adaptive quiz pool (can be layered onto the quiz feature after launch)
- Sentence translation practice (high content encoding effort)

**Defer to v2:**
- CE Level differentiation
- Bob Bass exercise integration (permission granted, but encoding effort is significant)

---

## Sources

- [SMART Latin Vocab Tester — smartlatinapp.com](https://smartlatinapp.com/) — ISEB-specific vocab tester features (HIGH confidence, direct product inspection)
- [Latin Vocabulary Tester — Aurorum/latin-vocabulary-tester](https://github.com/Aurorum/latin-vocabulary-tester) — Grammar drills, quiz modes, word games (HIGH confidence, open source)
- [latinvocabularytester.com](https://latinvocabularytester.com/) — Declension/conjugation tester, competitive leaderboard, CSV import (HIGH confidence, direct product inspection)
- [OCR GCSE Latin Vocabulary Tester — mrlaurence.github.io](https://mrlaurence.github.io/ocrlatintester/) — Minimal static HTML vocab tester (HIGH confidence)
- [Cambridge Latin Course digital activities](https://www.cambridge.org/gb/education/blog/cambridge-latin-course-digital-activities-branching-out-with-new-editions) — Paywalled digital features: audio, dramatisations, adaptive activities, teacher reporting (HIGH confidence)
- [ISEB Common Entrance Classics](https://www.iseb.co.uk/assessments/common-entrance/classics/) — Official syllabus, Level 1/2/3 structure (HIGH confidence, authoritative)
- [Galore Park CE Latin revision](https://www.galorepark.co.uk/ce-latin-revision-and-practice) — ISEB-endorsed print resources (MEDIUM confidence, no specific online feature detail)
- [Memrise Wikipedia / Reviews](https://en.wikipedia.org/wiki/Memrise) — Spaced repetition, native speaker video, flashcard pattern (HIGH confidence, widely documented)
- [Quizlet blog — question format selection](https://quizlet.com/blog/selecting-question-formats-to-maximize-the-testing-effect) — Multiple choice vs typed input evidence base (HIGH confidence)
- [ISEB Latin CE 13+ Exams Pack Spring 2024](https://www.iseb.co.uk/product/latin-ce-13-exams-pack-spring-2024/) — Official past paper packaging (HIGH confidence, authoritative)
