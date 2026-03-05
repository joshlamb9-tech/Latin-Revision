'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const filters = getFilters();

  fetch('data/vocabulary/all.json')
    .then(r => { if (!r.ok) throw new Error('vocab'); return r.json(); })
    .then(words => {
      const filtered = applyFilters(words, filters);
      renderVocabulary(app, filtered, filters, words.length);
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
    freq:  params.get('freq')  ? parseInt(params.get('freq'), 10)  : null,
    pos:   params.get('pos'),
    decl:  params.get('decl')  ? parseInt(params.get('decl'), 10)  : null,
    conj:  params.get('conj')  ? parseInt(params.get('conj'), 10)  : null,
    level: params.get('level') ? parseInt(params.get('level'), 10) : null   // 1 or 2
  };
}

function applyFilters(words, filters) {
  let result = [...words];

  if (filters.topic) {
    result = result.filter(w => w.topics.includes(filters.topic));
  }

  if (filters.pos) {
    result = result.filter(w => w.part_of_speech === filters.pos);
    if (filters.decl) {
      result = result.filter(w => w.declension === filters.decl);
    }
    if (filters.conj) {
      result = result.filter(w => w.conjugation === filters.conj);
    }
  }

  if (filters.level === 1) {
    // Level 1 only — core vocabulary
    result = result.filter(w => w.level === 1);
  }
  // Level 2 = all words (Level 1 + Level 2 additional), so no filter needed

  if (filters.freq) {
    result = result.slice().sort((a, b) => a.frequency_rank - b.frequency_rank);
    result = result.slice(0, filters.freq);
  }

  return result;
}

function renderVocabulary(app, filtered, filters, total) {
  app.innerHTML = '';

  // Heading
  const h1 = document.createElement('h1');
  h1.textContent = 'Vocabulary \u2014 ' + buildHeading(filters);
  app.appendChild(h1);

  // Filter nav
  app.appendChild(renderFilterNav(filters));

  // Count line
  const count = document.createElement('p');
  count.className = 'vocab-count';
  const noFiltersActive = !filters.topic && !filters.freq && !filters.pos && !filters.level;
  if (filters.freq) {
    count.textContent = 'Top ' + filters.freq + ' by frequency';
  } else if (noFiltersActive) {
    count.textContent = 'Level 1: 87 words \u00b7 Level 2: 131 words \u2014 start with Level 1';
  } else {
    count.textContent = filtered.length + ' word' + (filtered.length !== 1 ? 's' : '');
  }
  app.appendChild(count);

  // Empty state
  if (filtered.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'vocab-empty';
    empty.textContent = 'No words found for this filter.';
    app.appendChild(empty);
    return;
  }

  // Word list
  const list = document.createElement('div');
  list.className = 'vocab-list';
  filtered.forEach(word => list.appendChild(renderWordItem(word)));
  app.appendChild(list);

  // "Test yourself on this list" CTA — passes current URL params through to flashcard mode
  const filterStr = window.location.search; // e.g. "?topic=family" or "?pos=noun&decl=1"
  const testBtn = document.createElement('div');
  testBtn.className = 'vocab-test-cta';
  testBtn.innerHTML = `
    <a href="quiz.html?activity=flashcard${filterStr ? '&' + filterStr.slice(1) : ''}" class="vocab-test-btn">
      Test yourself on this list \u2192
    </a>
  `;
  app.appendChild(testBtn);
}

function buildHeading(filters) {
  const lvlPrefix = filters.level ? 'Level ' + filters.level + ' ' : '';
  if (filters.freq) return 'Top ' + filters.freq;
  if (filters.topic) {
    return lvlPrefix + filters.topic.charAt(0).toUpperCase() + filters.topic.slice(1);
  }
  if (filters.pos) {
    const posLabel = filters.pos.charAt(0).toUpperCase() + filters.pos.slice(1) + 's';
    if (filters.decl) return lvlPrefix + ordinal(filters.decl) + ' Declension ' + posLabel;
    if (filters.conj) return lvlPrefix + ordinal(filters.conj) + ' Conjugation ' + posLabel;
    return lvlPrefix + posLabel;
  }
  if (filters.level) return 'Level ' + filters.level + ' Words';
  return 'All Words';
}

function ordinal(n) {
  return ['', '1st', '2nd', '3rd'][n] || n + 'th';
}

// Build a vocabulary.html URL, merging newParams over preserveParams
function buildUrl(newParams, preserveParams) {
  const merged = Object.assign({}, preserveParams || {}, newParams);
  const search = Object.entries(merged)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  return 'vocabulary.html' + (search ? '?' + search : '');
}

function renderFilterNav(filters) {
  const nav = document.createElement('nav');
  nav.className = 'vocab-filters';

  // ── All ──────────────────────────────────────────────────────
  addFilterLink(nav, 'All words', 'vocabulary.html', !filters.topic && !filters.freq && !filters.pos && !filters.level);

  // Grammar filter links preserve the current level selection
  const lvl = filters.level ? { level: filters.level } : {};

  // Level filter links preserve the current grammar selection
  const gram = {};
  if (filters.pos)  gram.pos  = filters.pos;
  if (filters.decl) gram.decl = filters.decl;
  if (filters.conj) gram.conj = filters.conj;

  // ── By Grammar ──────────────────────────────────────────────
  addSectionLabel(nav, 'By Grammar');

  addFilterLink(nav, 'All Nouns',    buildUrl({ pos: 'noun' },         lvl), filters.pos === 'noun' && !filters.decl);
  addFilterLink(nav, '1st Decl.',    buildUrl({ pos: 'noun', decl: 1 }, lvl), filters.pos === 'noun' && filters.decl === 1);
  addFilterLink(nav, '2nd Decl.',    buildUrl({ pos: 'noun', decl: 2 }, lvl), filters.pos === 'noun' && filters.decl === 2);
  addFilterLink(nav, '3rd Decl.',    buildUrl({ pos: 'noun', decl: 3 }, lvl), filters.pos === 'noun' && filters.decl === 3);

  addFilterLink(nav, 'All Verbs',    buildUrl({ pos: 'verb' },         lvl), filters.pos === 'verb' && !filters.conj);
  addFilterLink(nav, '1st Conj.',    buildUrl({ pos: 'verb', conj: 1 }, lvl), filters.pos === 'verb' && filters.conj === 1);
  addFilterLink(nav, '2nd Conj.',    buildUrl({ pos: 'verb', conj: 2 }, lvl), filters.pos === 'verb' && filters.conj === 2);

  addFilterLink(nav, 'Adjectives',   buildUrl({ pos: 'adjective' },   lvl), filters.pos === 'adjective');
  addFilterLink(nav, 'Adverbs',      buildUrl({ pos: 'adverb' },      lvl), filters.pos === 'adverb');
  addFilterLink(nav, 'Prepositions', buildUrl({ pos: 'preposition' }, lvl), filters.pos === 'preposition');

  // ── By Level ─────────────────────────────────────────────────
  addSectionLabel(nav, 'By Level');
  addFilterLink(nav, 'Level 1', buildUrl({ level: 1 }, gram), filters.level === 1);
  addFilterLink(nav, 'Level 2', buildUrl({ level: 2 }, gram), filters.level === 2);

  // ── By Frequency ─────────────────────────────────────────────
  addSectionLabel(nav, 'By Frequency');
  addFilterLink(nav, 'Top 50',  'vocabulary.html?freq=50',  filters.freq === 50);
  addFilterLink(nav, 'Top 100', 'vocabulary.html?freq=100', filters.freq === 100);

  // ── Q4 Word Groups ───────────────────────────────────────────
  addSectionLabel(nav, 'Q4 Word Groups');
  addFilterLink(nav, 'Eng → Latin', 'word-groups.html', false);

  return nav;
}

function addSectionLabel(nav, text) {
  const span = document.createElement('span');
  span.className = 'vocab-filter-label';
  span.textContent = text;
  nav.appendChild(span);
}

function addFilterLink(nav, label, href, isActive) {
  const a = document.createElement('a');
  a.href = href;
  a.className = 'vocab-filter-link' + (isActive ? ' active' : '');
  a.textContent = label;
  nav.appendChild(a);
}

function renderWordItem(word) {
  const div = document.createElement('div');
  div.className = 'vocab-item';

  const latinSpan = document.createElement('span');
  latinSpan.className = 'vocab-latin';
  latinSpan.textContent = buildLatinDisplay(word);

  const englishSpan = document.createElement('span');
  englishSpan.className = 'vocab-english';
  englishSpan.textContent = word.english;

  const metaSpan = document.createElement('span');
  metaSpan.className = 'vocab-meta';
  metaSpan.textContent = buildMeta(word);

  const levelSpan = document.createElement('span');
  levelSpan.className = 'vocab-level vocab-level--' + (word.level || 2);
  levelSpan.textContent = 'L' + (word.level || 2);

  div.appendChild(latinSpan);
  div.appendChild(englishSpan);
  div.appendChild(metaSpan);
  div.appendChild(levelSpan);

  return div;
}

function buildLatinDisplay(word) {
  // Show genitive for nouns: "ancilla, -ae"
  if (word.part_of_speech === 'noun' && word.genitive) {
    // Abbreviate genitive ending after the stem where possible
    const gen = word.genitive;
    return word.latin + ', ' + gen;
  }
  return word.latin;
}

function buildMeta(word) {
  const pos = word.part_of_speech;

  if (pos === 'noun') {
    const genderMap = { m: 'masc.', f: 'fem.', n: 'neut.' };
    const g = genderMap[word.gender] || word.gender;
    return g + ' \u00b7 ' + ordinal(word.declension) + ' decl.';
  }

  if (pos === 'verb') {
    return word.conjugation ? ordinal(word.conjugation) + ' conj.' : 'irreg.';
  }

  return pos;
}
