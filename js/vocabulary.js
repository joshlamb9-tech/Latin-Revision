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
    pos:   params.get('pos'),                                         // e.g. "noun", "verb"
    decl:  params.get('decl')  ? parseInt(params.get('decl'), 10)  : null,  // 1, 2, 3
    conj:  params.get('conj')  ? parseInt(params.get('conj'), 10)  : null   // 1, 2
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
  if (filters.freq) {
    count.textContent = 'Top ' + filters.freq + ' by frequency';
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
}

function buildHeading(filters) {
  if (filters.freq)  return 'Top ' + filters.freq;
  if (filters.topic) {
    const label = filters.topic.charAt(0).toUpperCase() + filters.topic.slice(1);
    return label;
  }
  if (filters.pos) {
    const posLabel = filters.pos.charAt(0).toUpperCase() + filters.pos.slice(1) + 's';
    if (filters.decl) return posLabel + ' \u2014 ' + ordinal(filters.decl) + ' Declension';
    if (filters.conj) return posLabel + ' \u2014 ' + ordinal(filters.conj) + ' Conjugation';
    return posLabel;
  }
  return 'All Words';
}

function ordinal(n) {
  return ['', '1st', '2nd', '3rd'][n] || n + 'th';
}

function renderFilterNav(filters) {
  const nav = document.createElement('nav');
  nav.className = 'vocab-filters';

  // ── All ──────────────────────────────────────────────────────
  addFilterLink(nav, 'All words', 'vocabulary.html', !filters.topic && !filters.freq && !filters.pos);

  // ── By Grammar ──────────────────────────────────────────────
  addSectionLabel(nav, 'By Grammar');

  // Nouns group
  addFilterLink(nav, 'All Nouns',     'vocabulary.html?pos=noun',        !filters.topic && !filters.freq && filters.pos === 'noun' && !filters.decl);
  addFilterLink(nav, '1st Decl.',     'vocabulary.html?pos=noun&decl=1', filters.pos === 'noun' && filters.decl === 1);
  addFilterLink(nav, '2nd Decl.',     'vocabulary.html?pos=noun&decl=2', filters.pos === 'noun' && filters.decl === 2);
  addFilterLink(nav, '3rd Decl.',     'vocabulary.html?pos=noun&decl=3', filters.pos === 'noun' && filters.decl === 3);

  // Verbs group
  addFilterLink(nav, 'All Verbs',     'vocabulary.html?pos=verb',        filters.pos === 'verb' && !filters.conj);
  addFilterLink(nav, '1st Conj.',     'vocabulary.html?pos=verb&conj=1', filters.pos === 'verb' && filters.conj === 1);
  addFilterLink(nav, '2nd Conj.',     'vocabulary.html?pos=verb&conj=2', filters.pos === 'verb' && filters.conj === 2);

  // Other parts of speech
  addFilterLink(nav, 'Adjectives',    'vocabulary.html?pos=adjective',   filters.pos === 'adjective');
  addFilterLink(nav, 'Adverbs',       'vocabulary.html?pos=adverb',      filters.pos === 'adverb');
  addFilterLink(nav, 'Prepositions',  'vocabulary.html?pos=preposition',  filters.pos === 'preposition');

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

  div.appendChild(latinSpan);
  div.appendChild(englishSpan);
  div.appendChild(metaSpan);

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
