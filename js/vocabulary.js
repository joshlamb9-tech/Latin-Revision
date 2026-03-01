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
    topic: params.get('topic'),           // decoded automatically — "war/army" not "war%2Farmy"
    freq: params.get('freq') ? parseInt(params.get('freq'), 10) : null
  };
}

function applyFilters(words, filters) {
  let result = [...words];

  if (filters.topic) {
    result = result.filter(w => w.topics.includes(filters.topic));
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
  if (filters.topic) {
    const label = filters.topic.charAt(0).toUpperCase() + filters.topic.slice(1);
    h1.textContent = 'Vocabulary \u2014 ' + label;
  } else {
    h1.textContent = 'Vocabulary';
  }
  app.appendChild(h1);

  // Filter nav
  app.appendChild(renderFilterNav(filters));

  // Count line
  const count = document.createElement('p');
  count.className = 'vocab-count';
  if (filters.freq) {
    count.textContent = 'Top ' + filters.freq + ' by frequency';
  } else if (filters.topic) {
    count.textContent = filtered.length + ' word' + (filtered.length !== 1 ? 's' : '') + ' (' + filters.topic + ')';
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
  filtered.forEach(word => {
    list.appendChild(renderWordItem(word));
  });
  app.appendChild(list);
}

function renderFilterNav(filters) {
  const nav = document.createElement('nav');
  nav.className = 'vocab-filters';

  // All words link
  const allLink = document.createElement('a');
  allLink.href = 'vocabulary.html';
  allLink.className = 'vocab-filter-link';
  allLink.textContent = 'All words';
  if (!filters.topic && !filters.freq) {
    allLink.classList.add('active');
  }
  nav.appendChild(allLink);

  // Topic links
  const topicDefs = [
    { value: 'family',     label: 'Family',     href: 'vocabulary.html?topic=family' },
    { value: 'war/army',   label: 'War & Army', href: 'vocabulary.html?topic=war%2Farmy' },
    { value: 'gods',       label: 'Gods',        href: 'vocabulary.html?topic=gods' },
    { value: 'travel',     label: 'Travel',      href: 'vocabulary.html?topic=travel' },
    { value: 'daily-life', label: 'Daily Life',  href: 'vocabulary.html?topic=daily-life' },
    { value: 'nature',     label: 'Nature',      href: 'vocabulary.html?topic=nature' }
  ];

  topicDefs.forEach(def => {
    const a = document.createElement('a');
    a.href = def.href;
    a.className = 'vocab-filter-link';
    a.textContent = def.label;
    if (filters.topic === def.value) {
      a.classList.add('active');
    }
    nav.appendChild(a);
  });

  // Frequency links
  const freqDefs = [
    { value: 50,  label: 'Top 50',  href: 'vocabulary.html?freq=50' },
    { value: 100, label: 'Top 100', href: 'vocabulary.html?freq=100' }
  ];

  freqDefs.forEach(def => {
    const a = document.createElement('a');
    a.href = def.href;
    a.className = 'vocab-filter-link';
    a.textContent = def.label;
    if (filters.freq === def.value) {
      a.classList.add('active');
    }
    nav.appendChild(a);
  });

  return nav;
}

function renderWordItem(word) {
  const div = document.createElement('div');
  div.className = 'vocab-item';

  const latinSpan = document.createElement('span');
  latinSpan.className = 'vocab-latin';
  latinSpan.textContent = word.latin;

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

function buildMeta(word) {
  const pos = word.part_of_speech;

  if (pos === 'noun') {
    return pos + ', ' + word.gender + '., ' + word.declension + ' decl.';
  }

  if (pos === 'verb') {
    if (word.conjugation) {
      return pos + ', ' + word.conjugation + ' conj.';
    }
    return pos + ', irreg.';
  }

  // adjective, adverb, preposition, conjunction, numeral, pronoun
  return pos;
}
