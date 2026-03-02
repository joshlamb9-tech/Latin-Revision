'use strict';

const SRS = (() => {
  const KEY = 'ce-latin-srs-v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // Safari private mode — silently continue
    }
  }

  // wordId: string (matches vocabulary all.json id field)
  // rating: 'know' | 'learning' | 'dont-know'
  function rate(wordId, rating) {
    const state = load();
    const entry = state[wordId] || { score: 0, correct: 0, seen: 0 };
    entry.seen = (entry.seen || 0) + 1;
    entry.last = Date.now();

    if (rating === 'know') {
      entry.correct = (entry.correct || 0) + 1;
      entry.score = Math.min((entry.score || 0) + 1, 4);
    } else if (rating === 'learning') {
      entry.score = Math.max((entry.score || 0), 1); // at least seen once
    } else {
      // dont-know: reset score but keep history
      entry.score = 0;
    }

    state[wordId] = entry;
    save(state);
    return entry;
  }

  // Returns mastery level string for a wordId
  function level(wordId) {
    const state = load();
    const entry = state[wordId];
    if (!entry) return 'new';
    if (entry.score >= 3) return 'mastered';
    if (entry.score >= 1) return 'learning';
    return 'new';
  }

  // Returns { new, learning, mastered, total } counts for an array of wordIds
  function summary(wordIds) {
    const counts = { new: 0, learning: 0, mastered: 0, total: wordIds.length };
    wordIds.forEach(id => {
      counts[level(id)]++;
    });
    return counts;
  }

  // Sort words: unmastered first, prioritise low-score words
  function prioritise(words) {
    const state = load();
    return [...words].sort((a, b) => {
      const sa = (state[a.id] || {}).score || 0;
      const sb = (state[b.id] || {}).score || 0;
      return sa - sb; // lowest score first
    });
  }

  // Return words filtered to only those below mastery threshold
  function unmastered(words) {
    return words.filter(w => level(w.id) !== 'mastered');
  }

  function reset(wordIds) {
    const state = load();
    (wordIds || []).forEach(id => { delete state[id]; });
    save(state);
  }

  function resetAll() {
    save({});
  }

  return { rate, level, summary, prioritise, unmastered, reset, resetAll, load };
})();
