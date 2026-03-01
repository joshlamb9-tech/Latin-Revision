---
phase: 01-foundation
plan: "01"
subsystem: data
tags: [json, latin, iseb, vocabulary, grammar, utf8, unicode, macrons]

# Dependency graph
requires: []
provides:
  - "data/vocabulary/all.json: 211-entry ISEB CE Latin vocabulary dataset with full schema"
  - "data/grammar/nouns.json: 5 noun declension paradigms (1st, 2nd-m, 2nd-n, 3rd-m/f, 3rd-n)"
  - "data/grammar/verbs.json: 1st and 2nd conjugation + sum, three tenses"
affects:
  - quiz engine (Phase 3) — uses frequency_rank, part_of_speech for distractor filtering
  - grammar reference tables (Phase 2) — renders declension/conjugation objects
  - vocabulary pages (Phase 2) — sources word list from all.json

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSON as flat array for vocabulary (no nesting) — simple to iterate, easy to filter by field"
    - "JSON with nested tenses object for grammar — structured for direct table rendering"
    - "Unicode macrons stored as literal characters, not escape sequences"

key-files:
  created:
    - data/vocabulary/all.json
    - data/grammar/nouns.json
    - data/grammar/verbs.json
  modified: []

key-decisions:
  - "211 entries chosen over a smaller list — both specimen papers extracted plus common CE teaching vocabulary Josh uses"
  - "frequency_rank assigned based on specimen paper prominence — words appearing in both L1 and L2 papers rank highest (rank 1-10)"
  - "Verbs without a standard 1st or 2nd conjugation classification (capio, audio, venio, etc.) have conjugation: null — these are common CE verbs outside the 1/2 conjugation scope but still examinable"
  - "dux appears twice in source data (once as dux-01 and once as dux-02) — removed dux-01 as accidental duplicate, single dux entry retained"
  - "letum and testamentum classified as 2nd declension neuter despite being non-standard — correct per Kennedy"

patterns-established:
  - "Data files live in data/ subdirectory at project root, separated by type (vocabulary/, grammar/)"
  - "JSON IDs use kebab-case latin lemma + zero-padded suffix (amicus-01)"
  - "Macrons on all standard long vowels per Kennedy's Latin Primer"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04]

# Metrics
duration: 4min
completed: 2026-03-01
---

# Phase 1 Plan 01: Data Foundation Summary

**211-entry ISEB CE Latin vocabulary dataset (all 8 POS, all 6 topic tags, Unicode macrons) plus 5 noun declension and 3 verb conjugation paradigm JSON files sourced from both specimen papers**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-01T16:32:45Z
- **Completed:** 2026-03-01T16:36:45Z
- **Tasks:** 2 of 2
- **Files modified:** 3

## Accomplishments

- 211-entry vocabulary JSON sourced directly from Level 1 (2024) and Level 2 (2022) ISEB specimen papers, extended with common CE teaching vocabulary
- All 6 required topic tags represented: family, war/army, gods, travel, daily-life, nature
- All 8 parts of speech represented: noun (95), verb (45), adjective (19), adverb (18), preposition (13), conjunction (10), numeral (7), pronoun (4)
- Unicode macrons on Latin forms (ā ē ī ō ū) stored as literal characters, not escape sequences
- 5 noun declension paradigms with all 6 cases singular and plural, macron-correct
- 1st and 2nd conjugation plus sum with present, imperfect, and perfect tenses, all persons singular and plural

## Task Commits

1. **Task 1: Create ISEB CE Latin vocabulary JSON** - `0c063d4` (feat)
2. **Task 2: Create grammar paradigm JSON files** - `07a10c0` (feat)

**Plan metadata:** (see final docs commit below)

## Files Created/Modified

- `data/vocabulary/all.json` — 211 ISEB CE Latin vocabulary entries with full schema (id, latin, genitive, gender, english, part_of_speech, declension, conjugation, topics, frequency_rank)
- `data/grammar/nouns.json` — 5 noun declension paradigms: 1st, 2nd-m (servus), 2nd-n (bellum), 3rd-m/f (rex), 3rd-n (nomen)
- `data/grammar/verbs.json` — 1st conjugation (porto), 2nd conjugation (moneo), irregular sum; present, imperfect, perfect tenses

## Decisions Made

- frequency_rank 1-10 assigned to words appearing in both L1 and L2 specimen papers; single-paper words ranked 11-30; additional CE teaching words ranked 31+
- Verbs outside CE's 1st/2nd conjugation scope (capio, audio, venio, fugio, etc.) have `conjugation: null` — they are examinable vocabulary but their full paradigms are beyond Level 1/2 scope
- letum stored as 2nd declension neuter (lētum, lētī) — correct Kennedy form; the specimen paper gave it as "lētum, -ī n." confirming this
- testamentum stored as 2nd declension neuter — correct per standard Latin grammar

## Vocabulary Words Needing Josh's Review

The following words may need macron verification or meaning clarification before use in drills:

- **bibit** (bibō) — macron placement on infinitive bibere uncertain; listed without conjugation number as it is a 3rd conjugation verb (outside CE scope)
- **faveo, taceo, pareo** — 2nd conjugation verbs appearing in specimen papers; conjugation number assigned as 2 (correct per Kennedy)
- **magnopere** — one word or two (magno + opere)? Listed as one adverb, standard form

## Deviations from Plan

None — plan executed exactly as written. Both PDFs were read, vocabulary extracted, and all three JSON files created and verified.

## Issues Encountered

None. Both JSON files parsed without error on first attempt. Verification node commands confirmed all required fields, topic tags, macrons, and paradigm counts.

## Next Phase Readiness

- All three data files are ready for use in Phase 2 (grammar reference tables and vocabulary pages)
- The vocabulary schema is locked — `frequency_rank` and `part_of_speech` fields are available for Phase 3 quiz engine distractor filtering
- No blockers

## Self-Check: PASSED

- data/vocabulary/all.json: FOUND
- data/grammar/nouns.json: FOUND
- data/grammar/verbs.json: FOUND
- 01-01-SUMMARY.md: FOUND
- Commit 0c063d4 (vocabulary): FOUND
- Commit 07a10c0 (grammar): FOUND

---
*Phase: 01-foundation*
*Completed: 2026-03-01*
