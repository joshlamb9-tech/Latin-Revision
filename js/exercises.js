'use strict';

// =============================================================
// Grammar activity constants — CE Question 3
// =============================================================

const CASE_FUNCTIONS = {
  nominative: 'Used for the subject of the verb \u2014 the person or thing doing the action.',
  vocative:   'Used when directly addressing someone.',
  accusative: 'Used for the direct object \u2014 the person or thing the action is done to.',
  genitive:   'Used to show possession or relationship (\u201cof\u201d).',
  dative:     'Used for the indirect object \u2014 the person something is given to or done for.',
  ablative:   'Used after many prepositions (in, cum, ex, ab, de, sub) and to show means or manner.'
};

const TENSE_NOTES = {
  present:   'The present tense describes an action happening now or habitually.',
  imperfect: 'The imperfect tense describes a continuous or repeated action in the past.',
  perfect:   'The perfect tense describes a completed action in the past.'
};

const ALL_CASES = ['nominative', 'vocative', 'accusative', 'genitive', 'dative', 'ablative'];

// =============================================================
// Activity router — reads ?activity=X from URL and dispatches
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const params = new URLSearchParams(window.location.search);
  const activity = params.get('activity');
  const filter = params.get('filter');   // e.g. 'pos:noun', 'topic:family', 'freq:50'
  const mode = params.get('mode');       // e.g. 'latin-english', 'english-latin'

  // Grammar activities don't need the vocabulary JSON — route them first
  switch (activity) {
    case 'case':      return runCaseIdentifier(app);
    case 'verb':      return runVerbParser(app);
    case 'paradigm':  return runParadigmCheck(app);
    case 'pairs':     return runMatchingPairs(app);
    case 'matching':  return runMatchingPairs(app);
    case 'gap-fill':  return runGapFill(app);
    case 'gapfill':   return runGapFill(app);
    case 'dashboard': return runDashboard(app);
  }

  fetch('data/vocabulary/all.json')
    .then(r => { if (!r.ok) throw new Error('vocab'); return r.json(); })
    .then(allWords => {
      // Support both legacy filter=pos:noun format and individual URL params
      // (topic, pos, decl, conj, freq) passed through from vocabulary.html
      let words = applyWordFilter(allWords, filter);
      if (!filter) {
        words = applyUrlParamFilter(allWords, params);
      }

      switch (activity) {
        case 'flashcard': return runFlashcard(app, words, filter);
        case 'mcq':       return runMCQ(app, words, mode || 'latin-english', allWords);
        default:          return renderHub(app, allWords);
      }
    })
    .catch(() => {
      app.innerHTML = '<h1>Exercises</h1><p class="error">Could not load vocabulary data. Please reload.</p>';
    });
});

function applyWordFilter(words, filter) {
  if (!filter) return words;
  const [type, value] = filter.split(':');
  if (type === 'pos') return words.filter(w => w.part_of_speech === value);
  if (type === 'topic') return words.filter(w => w.topics.includes(value));
  if (type === 'freq') return words.slice().sort((a, b) => a.frequency_rank - b.frequency_rank).slice(0, parseInt(value, 10));
  if (type === 'decl') return words.filter(w => w.declension === parseInt(value, 10));
  return words;
}

// Apply individual URL params (topic, pos, decl, conj, freq) — used when
// arriving from vocabulary.html "Test yourself on this list" CTA.
function applyUrlParamFilter(words, params) {
  const topic = params.get('topic');
  const pos   = params.get('pos');
  const decl  = params.get('decl')  ? parseInt(params.get('decl'), 10)  : null;
  const conj  = params.get('conj')  ? parseInt(params.get('conj'), 10)  : null;
  const freq  = params.get('freq')  ? parseInt(params.get('freq'), 10)  : null;
  const level = params.get('level') ? parseInt(params.get('level'), 10) : null;

  let pool = words;
  if (level === 1) pool = pool.filter(w => w.level === 1);
  // level 2 = all words, no filter needed
  if (topic) pool = pool.filter(w => w.topics && w.topics.includes(topic));
  if (pos)   pool = pool.filter(w => w.part_of_speech === pos);
  if (decl)  pool = pool.filter(w => w.declension === decl);
  if (conj)  pool = pool.filter(w => w.conjugation === conj);
  if (freq)  pool = pool.slice().sort((a, b) => a.frequency_rank - b.frequency_rank).slice(0, freq);

  // Fallback if filter is too narrow for MCQ (needs at least 4)
  if (pool.length < 4) pool = words;
  return pool;
}

// -- HUB ------------------------------------------------------------------

function renderHub(app, allWords) {
  const params = new URLSearchParams(location.search);
  const level = params.get('level') ? parseInt(params.get('level'), 10) : null;
  const l1count = allWords.filter(w => w.level === 1).length;
  const allcount = allWords.length;

  const summary = SRS.summary(allWords.map(w => w.id));
  app.innerHTML = '';

  const h1 = el('h1', {}, 'Exercises');
  app.appendChild(h1);

  // Level switch
  const levelSwitch = el('div', { className: 'ex-level-switch' });
  levelSwitch.appendChild(el('span', { className: 'ex-level-switch-label' }, 'Testing:'));
  const l1btn = el('a', {
    href: 'quiz.html?level=1',
    className: 'ex-level-btn' + (level === 1 ? ' active' : '')
  }, 'Level 1 (' + l1count + ' words)');
  const l2btn = el('a', {
    href: 'quiz.html',
    className: 'ex-level-btn' + (!level ? ' active' : '')
  }, 'Level 2 — all (' + allcount + ' words)');
  levelSwitch.appendChild(l1btn);
  levelSwitch.appendChild(l2btn);
  app.appendChild(levelSwitch);

  // Mastery strip
  const strip = el('div', { className: 'ex-mastery-strip' });
  strip.appendChild(el('span', { className: 'ex-mastery-new' }, summary.new + ' new'));
  strip.appendChild(el('span', { className: 'ex-mastery-learning' }, summary.learning + ' learning'));
  strip.appendChild(el('span', { className: 'ex-mastery-done' }, summary.mastered + ' mastered'));
  app.appendChild(strip);

  // Build level suffix for activity links
  const levelSuffix = level === 1 ? '&level=1' : '';

  // Grouped activity sections
  const sections = [
    {
      label: 'Vocabulary',
      sublabel: level === 1 ? 'Level 1 only' : 'Levels 1 & 2',
      activities: [
        { id: 'flashcard', title: 'Flashcards', desc: 'See a word, recall the meaning, rate yourself. The best way to build a word bank.', ce: 'CE: all questions', href: 'quiz.html?activity=flashcard' + levelSuffix, icon: '🃏', start: true },
        { id: 'mcq-le',   title: 'Word Quiz',  desc: 'Latin \u2192 English. Choose from 4 options. Quick and effective.', ce: 'CE Q3 vocab', href: 'quiz.html?activity=mcq&mode=latin-english' + levelSuffix, icon: '📝' },
        { id: 'mcq-el',   title: 'Reverse Quiz', desc: 'English \u2192 Latin. Harder \u2014 great exam preparation.', ce: 'CE Q4 prep', href: 'quiz.html?activity=mcq&mode=english-latin' + levelSuffix, icon: '🔄' },
        { id: 'pairs',    title: 'Matching Pairs', desc: 'Tap a Latin word, then its English match. Race through 6 pairs.', ce: 'CE vocab recall', href: 'quiz.html?activity=pairs' + levelSuffix, icon: '🔗' },
      ]
    },
    {
      label: 'Grammar',
      sublabel: 'CE Question 3',
      activities: [
        { id: 'case',     title: 'Case Identifier', desc: 'Given a noun form — what case is it? With explanation of why that case is used.', ce: 'CE Q3', href: 'quiz.html?activity=case', icon: '🔍' },
        { id: 'verb',     title: 'Verb Parser',     desc: 'Person, number, tense. Exactly what CE Q3 asks you to do.', ce: 'CE Q3', href: 'quiz.html?activity=verb', icon: '⚡' },
        { id: 'paradigm', title: 'Paradigm Check',  desc: 'Fill the blanks in a declension or conjugation table.', ce: 'CE Q3 & Q4', href: 'quiz.html?activity=paradigm', icon: '📊' },
      ]
    },
    {
      label: 'Latin in Context',
      sublabel: 'CE Questions 1 & 2',
      activities: [
        { id: 'gap-fill',   title: 'Gap-Fill Sentences', desc: 'Real Latin sentences with one word missing. Pick the right form — cases matter here.', ce: 'CE Q1 & Q2', href: 'quiz.html?activity=gap-fill', icon: '✏️' },
      ]
    },
    {
      label: 'Progress',
      sublabel: null,
      activities: [
        { id: 'dashboard', title: 'My Mastery', desc: 'See which words you\'ve secured and how your bank of knowledge is growing.', ce: null, href: 'quiz.html?activity=dashboard', icon: '📈' },
      ]
    }
  ];

  sections.forEach(section => {
    const sectionEl = el('div', { className: 'ex-hub-section' });
    const sectionHead = el('div', { className: 'ex-hub-section-head' });
    sectionHead.appendChild(el('span', { className: 'ex-hub-section-label' }, section.label));
    if (section.sublabel) sectionHead.appendChild(el('span', { className: 'ex-hub-section-sub' }, section.sublabel));
    sectionEl.appendChild(sectionHead);

    const grid = el('div', { className: 'ex-hub-grid' });
    section.activities.forEach(act => {
      const card = el('a', { className: 'ex-hub-card' + (act.start ? ' ex-hub-card--start' : ''), href: act.href });
      card.appendChild(el('span', { className: 'ex-hub-icon' }, act.icon));
      const body = el('div', { className: 'ex-hub-body' });
      const titleRow = el('div', { className: 'ex-hub-title-row' });
      titleRow.appendChild(el('span', { className: 'ex-hub-title' }, act.title));
      if (act.start) titleRow.appendChild(el('span', { className: 'ex-hub-badge ex-hub-badge--start' }, 'Start here'));
      body.appendChild(titleRow);
      body.appendChild(el('span', { className: 'ex-hub-desc' }, act.desc));
      if (act.ce) body.appendChild(el('span', { className: 'ex-hub-ce' }, act.ce));
      card.appendChild(body);
      grid.appendChild(card);
    });
    sectionEl.appendChild(grid);
    app.appendChild(sectionEl);
  });
}

// -- FLASHCARD ------------------------------------------------------------

function runFlashcard(app, words, filter) {
  const deck = SRS.prioritise(words);
  if (deck.length === 0) {
    app.innerHTML = '<h1>Flashcards</h1><p>No words match this filter.</p><a class="btn" href="quiz.html">Back to Exercises</a>';
    return;
  }

  let index = 0;
  let revealed = false;
  const sessionResults = [];

  function render() {
    if (index >= deck.length) {
      renderFlashcardSummary(app, sessionResults, filter);
      return;
    }

    const word = deck[index];
    app.innerHTML = '';

    // Header
    const header = el('div', { className: 'ex-header' });
    header.appendChild(el('h1', {}, 'Flashcards'));
    header.appendChild(el('p', { className: 'ex-progress' }, (index + 1) + ' / ' + deck.length));
    app.appendChild(header);

    if (filter) {
      const badge = el('span', { className: 'ex-filter-badge' }, filterLabel(filter));
      app.appendChild(badge);
    }

    // Card
    const card = el('div', { className: 'ex-card flashcard' + (revealed ? ' revealed' : '') });

    const front = el('div', { className: 'flashcard-front' });
    front.appendChild(el('span', { className: 'flashcard-latin' }, word.latin));
    if (word.part_of_speech === 'noun' && word.genitive) {
      front.appendChild(el('span', { className: 'flashcard-genitive' }, word.genitive));
    }
    front.appendChild(el('button', { className: 'btn btn-secondary flashcard-reveal-btn' }, 'Tap to reveal'));

    const back = el('div', { className: 'flashcard-back' });
    back.appendChild(el('span', { className: 'flashcard-english' }, word.english));
    back.appendChild(el('span', { className: 'flashcard-meta' }, buildMeta(word)));

    card.appendChild(front);
    card.appendChild(back);
    app.appendChild(card);

    if (!revealed) {
      card.querySelector('.flashcard-reveal-btn').addEventListener('click', () => {
        revealed = true;
        render();
      });
      card.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') { revealed = true; render(); }
      });
    } else {
      // Rating buttons
      const ratings = el('div', { className: 'ex-ratings' });

      const dontKnow = el('button', { className: 'btn btn-rating btn-rating-no' }, 'Not yet');
      const learning = el('button', { className: 'btn btn-rating btn-rating-maybe' }, 'Still learning');
      const know = el('button', { className: 'btn btn-rating btn-rating-yes' }, 'Know it');

      dontKnow.addEventListener('click', () => { SRS.rate(word.id, 'dont-know'); sessionResults.push({ word, rating: 'dont-know' }); index++; revealed = false; render(); });
      learning.addEventListener('click', () => { SRS.rate(word.id, 'learning'); sessionResults.push({ word, rating: 'learning' }); index++; revealed = false; render(); });
      know.addEventListener('click', () => { SRS.rate(word.id, 'know'); sessionResults.push({ word, rating: 'know' }); index++; revealed = false; render(); });

      ratings.appendChild(dontKnow);
      ratings.appendChild(learning);
      ratings.appendChild(know);
      app.appendChild(ratings);
    }
  }

  render();
}

function renderFlashcardSummary(app, results, filter) {
  const known = results.filter(r => r.rating === 'know').length;
  const total = results.length;
  app.innerHTML = '';

  app.appendChild(el('h1', {}, 'Session complete'));
  app.appendChild(el('p', { className: 'ex-score-big' }, known + ' / ' + total + ' known'));

  if (known === total) {
    app.appendChild(el('p', { className: 'ex-feedback-positive' }, 'Excellent — you knew every word in this session. Your mastery bank is growing.'));
  } else if (known >= total * 0.7) {
    app.appendChild(el('p', { className: 'ex-feedback-positive' }, 'Good session. The ' + (total - known) + ' you marked for review will come back first next time.'));
  } else {
    app.appendChild(el('p', { className: 'ex-feedback-neutral' }, 'Keep going — those ' + (total - known) + ' words need more practice. They\'ll come back first next session.'));
  }

  const actions = el('div', { className: 'ex-actions' });
  const again = el('a', { className: 'btn', href: 'quiz.html?activity=flashcard' + (filter ? '&filter=' + encodeURIComponent(filter) : '') }, 'Go again');
  const hub = el('a', { className: 'btn btn-secondary', href: 'quiz.html' }, 'Back to Exercises');
  actions.appendChild(again);
  actions.appendChild(hub);
  app.appendChild(actions);
}

// -- MCQ VOCABULARY QUIZ --------------------------------------------------

function runMCQ(app, words, mode, allWords) {
  // Use prioritised words, take up to 10
  const pool = SRS.prioritise(words).slice(0, 20);
  const questions = pool.slice(0, 10);

  if (questions.length < 4) {
    app.innerHTML = '<h1>Vocabulary Quiz</h1><p>Not enough words for this filter (need at least 4). <a href="quiz.html">Back</a></p>';
    return;
  }

  let index = 0;
  let score = 0;
  let answered = false;
  let streak = 0;
  const results = [];

  function render() {
    if (index >= questions.length) {
      renderMCQSummary(app, results, score, mode);
      return;
    }

    const word = questions[index];
    // Distractors: same part of speech, different word
    const samePos = allWords.filter(w => w.part_of_speech === word.part_of_speech && w.id !== word.id);
    const shuffled = shuffle(samePos).slice(0, 3);
    const options = shuffle([word, ...shuffled]);

    app.innerHTML = '';

    const header = el('div', { className: 'ex-header' });
    header.appendChild(el('h1', {}, mode === 'latin-english' ? 'Vocabulary Quiz' : 'Reverse Quiz'));
    header.appendChild(el('p', { className: 'ex-progress' }, (index + 1) + ' / ' + questions.length));
    app.appendChild(header);

    app.appendChild(el('p', { className: 'ex-ce-label' }, 'Practises: CE Question 3 (vocabulary)'));

    const card = el('div', { className: 'ex-card' });
    const prompt = el('div', { className: 'ex-prompt' });
    if (mode === 'latin-english') {
      prompt.appendChild(el('span', { className: 'ex-prompt-latin' }, word.latin));
      if (word.part_of_speech === 'noun' && word.genitive) {
        prompt.appendChild(el('span', { className: 'ex-prompt-genitive' }, word.genitive + ', ' + (word.gender === 'f' ? 'f.' : word.gender === 'm' ? 'm.' : 'n.')));
      }
    } else {
      prompt.appendChild(el('span', { className: 'ex-prompt-english' }, word.english));
    }
    card.appendChild(prompt);
    app.appendChild(card);

    const optionsList = el('div', { className: 'ex-options' });
    options.forEach(opt => {
      const btn = el('button', { className: 'ex-option-btn' }, mode === 'latin-english' ? opt.english : opt.latin);
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const correct = opt.id === word.id;
        if (correct) { score++; streak++; } else { streak = 0; }
        SRS.rate(word.id, correct ? 'know' : 'dont-know');
        results.push({ word, correct, chosen: opt });

        // Reveal all options with correct/wrong marking
        optionsList.querySelectorAll('.ex-option-btn').forEach(b => {
          const isCorrect = (mode === 'latin-english' ? b.textContent === word.english : b.textContent === word.latin);
          b.classList.add(isCorrect ? 'correct' : (b === btn && !correct ? 'wrong' : 'neutral'));
          b.disabled = true;
        });

        // Feedback
        const fb = el('div', { className: 'ex-feedback ' + (correct ? 'ex-feedback-positive' : 'ex-feedback-negative') });
        if (correct) {
          let streakNote = streak >= 5 && streak % 5 === 0 ? ' \uD83D\uDD25 ' + streak + ' in a row!' : streak === 3 ? ' 3 in a row!' : '';
          fb.textContent = 'Correct \u2014 ' + word.latin + ' means \u201c' + word.english + '\u201d. ' + buildGrammarInsight(word) + streakNote;
        } else {
          fb.textContent = 'Not yet \u2014 ' + word.latin + ' means \u201c' + word.english + '\u201d. ' + buildGrammarInsight(word) + ' Seeing it again will help it stick.';
        }
        app.appendChild(fb);

        const nextBtn = el('button', { className: 'btn ex-next-btn' }, index + 1 < questions.length ? 'Next' : 'See results');
        nextBtn.addEventListener('click', () => { index++; answered = false; render(); });
        app.appendChild(nextBtn);
      });
      optionsList.appendChild(btn);
    });
    app.appendChild(optionsList);
  }

  render();
}

function buildGrammarInsight(word) {
  if (word.part_of_speech === 'noun') {
    const decl = ['', '1st', '2nd', '3rd'][word.declension] || (word.declension + 'th');
    const g = word.gender === 'f' ? 'feminine' : word.gender === 'm' ? 'masculine' : 'neuter';
    return 'It\'s a ' + g + ' noun, ' + decl + ' declension.';
  }
  if (word.part_of_speech === 'verb') {
    return word.conjugation ? 'It\'s a ' + (['', '1st', '2nd'][word.conjugation]) + ' conjugation verb.' : 'It\'s an irregular verb.';
  }
  return '';
}

function renderMCQSummary(app, results, score, mode) {
  const total = results.length;
  app.innerHTML = '';

  app.appendChild(el('h1', {}, 'Quiz complete'));
  app.appendChild(el('p', { className: 'ex-score-big' }, score + ' / ' + total));

  const pct = Math.round(score / total * 100);
  let msg;
  if (pct === 100) msg = 'Perfect — you know every word in this set. That\'s genuine mastery.';
  else if (pct >= 80) msg = 'Strong work \u2014 ' + score + ' correct. The ' + (total - score) + ' you missed will come back in flashcard mode.';
  else if (pct >= 60) msg = score + '/' + total + ' \u2014 solid progress. Each attempt builds the memory trace for the ones you missed.';
  else msg = score + '/' + total + ' \u2014 not there yet, and that\u2019s fine. Flashcard mode will help these stick.';
  app.appendChild(el('p', { className: pct >= 60 ? 'ex-feedback-positive' : 'ex-feedback-neutral' }, msg));

  const actions = el('div', { className: 'ex-actions' });
  actions.appendChild(el('a', { className: 'btn', href: 'quiz.html?activity=mcq&mode=' + mode }, 'Try again'));
  actions.appendChild(el('a', { className: 'btn btn-secondary', href: 'quiz.html' }, 'Back to Exercises'));
  app.appendChild(actions);
}

// =============================================================
// CASE IDENTIFIER — quiz.html?activity=case
// =============================================================

/**
 * Load nouns data and start the case identification quiz.
 * @param {HTMLElement} app
 */
function runCaseIdentifier(app) {
  app.innerHTML = '<p class="ex-loading">Loading case questions\u2026</p>';

  fetch('data/grammar/nouns.json')
    .then(r => { if (!r.ok) throw new Error('nouns'); return r.json(); })
    .then(data => {
      const questions = buildCaseQuestions(data);
      const selected = shuffle(questions).slice(0, 10);
      renderCaseQuestion(app, selected, 0, { correct: 0, total: selected.length });
    })
    .catch(err => {
      app.innerHTML = '<h1>Case Identifier</h1><p class="error">Could not load noun data. Please reload.</p>';
      console.error('[CE Latin] Case identifier load error:', err);
    });
}

/**
 * Generate one question object per declension x case x number.
 * @param {Object} nounsData
 * @returns {Array<Object>}
 */
function buildCaseQuestions(nounsData) {
  const questions = [];
  nounsData.declensions.forEach(decl => {
    ['singular', 'plural'].forEach(number => {
      decl.cases.forEach(caseName => {
        const form = decl[number][caseName];
        if (form) {
          questions.push({
            form,
            caseName,
            number,
            declension: decl.declension,
            declensionName: decl.name,
            exampleNoun: decl.example_noun,
            exampleMeaning: decl.example_meaning
          });
        }
      });
    });
  });
  return questions;
}

function renderCaseQuestion(app, questions, index, score) {
  if (index >= questions.length) {
    renderCaseSummary(app, score);
    return;
  }

  const q = questions[index];
  const others = ALL_CASES.filter(c => c !== q.caseName);
  const distractors = shuffle(others).slice(0, 3);
  const options = shuffle([q.caseName, ...distractors]);

  app.innerHTML = '';

  const hdr = el('div', { className: 'ex-header' });
  hdr.appendChild(el('h1', {}, 'Case Identifier'));
  hdr.appendChild(el('p', { className: 'ex-progress' }, 'Question ' + (index + 1) + ' of ' + questions.length));
  app.appendChild(hdr);
  app.appendChild(el('p', { className: 'ex-ce-label' }, 'Practises: CE Question 3 (grammar \u2014 case identification)'));

  const card = el('div', { className: 'ex-card' });
  card.appendChild(el('p', { className: 'ex-context' }, q.declensionName + ' \u2014 ' + q.exampleNoun + ' (' + q.exampleMeaning + ')'));
  card.appendChild(el('p', { className: 'ex-form-display' }, q.form));
  card.appendChild(el('p', { className: 'ex-number-hint' }, q.number.charAt(0).toUpperCase() + q.number.slice(1)));
  card.appendChild(el('p', { className: 'ex-prompt' }, 'What case is this?'));
  app.appendChild(card);

  const optGrid = el('div', { className: 'ex-options' });
  options.forEach(opt => {
    const btn = el('button', { className: 'ex-option-btn' }, opt.charAt(0).toUpperCase() + opt.slice(1));
    btn.addEventListener('click', () => {
      const isCorrect = opt === q.caseName;

      optGrid.querySelectorAll('.ex-option-btn').forEach(b => {
        b.disabled = true;
        if (b.textContent.toLowerCase() === q.caseName) b.classList.add('correct');
        else if (b.textContent.toLowerCase() === opt && !isCorrect) b.classList.add('wrong');
      });

      const fb = el('div', { className: 'ex-feedback ' + (isCorrect ? 'ex-feedback-positive' : 'ex-feedback-negative') });
      fb.appendChild(el('p', { className: 'ex-feedback-result' },
        isCorrect
          ? '\u2713 Correct \u2014 you knew the ' + q.caseName + '.'
          : 'Not yet \u2014 it\u2019s the ' + q.caseName + '.'));
      fb.appendChild(el('p', { className: 'ex-feedback-explanation' },
        q.caseName.charAt(0).toUpperCase() + q.caseName.slice(1) + ': ' + CASE_FUNCTIONS[q.caseName]));

      const nextBtn = el('button', { className: 'btn ex-next-btn' },
        index + 1 < questions.length ? 'Next Question' : 'See Results');
      nextBtn.addEventListener('click', () =>
        renderCaseQuestion(app, questions, index + 1,
          { correct: score.correct + (isCorrect ? 1 : 0), total: score.total }));
      fb.appendChild(nextBtn);
      app.appendChild(fb);
    });
    optGrid.appendChild(btn);
  });
  app.appendChild(optGrid);
}

function renderCaseSummary(app, score) {
  app.innerHTML = '';
  app.appendChild(el('h1', {}, 'Case Identifier'));

  const summary = el('div', { className: 'ex-summary' });
  summary.appendChild(el('p', { className: 'ex-score-big' }, score.correct + '/' + score.total + ' correct'));

  let msg;
  if (score.correct === score.total) msg = 'Perfect \u2014 you know your cases cold.';
  else if (score.correct >= Math.ceil(score.total * 0.7)) msg = 'Strong work \u2014 you\u2019ve earned that case knowledge through practice.';
  else msg = 'Not there yet \u2014 each attempt builds the pattern. Try the grammar tables, then come back.';
  summary.appendChild(el('p', { className: score.correct >= Math.ceil(score.total * 0.7) ? 'ex-feedback-positive' : 'ex-feedback-neutral' }, msg));

  const actions = el('div', { className: 'ex-actions' });
  const retry = el('button', { className: 'btn' }, 'Try Again');
  retry.addEventListener('click', () => runCaseIdentifier(app));
  actions.appendChild(retry);
  actions.appendChild(el('a', { className: 'btn btn-secondary', href: 'quiz.html' }, 'Back to Exercises'));
  summary.appendChild(actions);
  app.appendChild(summary);
}

// =============================================================
// VERB PARSER — quiz.html?activity=verb
// =============================================================

/**
 * Load verbs data and start the verb parsing quiz.
 * @param {HTMLElement} app
 */
function runVerbParser(app) {
  app.innerHTML = '<p class="ex-loading">Loading verb questions\u2026</p>';

  fetch('data/grammar/verbs.json')
    .then(r => { if (!r.ok) throw new Error('verbs'); return r.json(); })
    .then(data => {
      const questions = buildVerbQuestions(data);
      const selected = shuffle(questions).slice(0, 10);
      renderVerbQuestion(app, selected, 0, { correct: 0, total: selected.length });
    })
    .catch(err => {
      app.innerHTML = '<h1>Verb Parser</h1><p class="error">Could not load verb data. Please reload.</p>';
      console.error('[CE Latin] Verb parser load error:', err);
    });
}

/**
 * Generate one question per conjugation x tense x person x number.
 * @param {Object} verbsData
 * @returns {Array<Object>}
 */
function buildVerbQuestions(verbsData) {
  const questions = [];

  function extractForms(source, conjugationName, exampleVerb, exampleInfinitive, exampleMeaning, conjugationNum) {
    Object.keys(source.tenses).forEach(tenseKey => {
      const tenseData = source.tenses[tenseKey];
      ['singular', 'plural'].forEach(number => {
        ['1st', '2nd', '3rd'].forEach(person => {
          const form = tenseData[number] && tenseData[number][person];
          if (form) {
            questions.push({ form, conjugation: conjugationNum, conjugationName, exampleVerb, exampleInfinitive, exampleMeaning, tense: tenseKey, person, number });
          }
        });
      });
    });
  }

  verbsData.conjugations.forEach(conj => {
    extractForms(conj, conj.name, conj.example_verb, conj.example_infinitive, conj.example_meaning, conj.conjugation);
  });
  verbsData.irregular.forEach(verb => {
    extractForms(verb, 'Irregular', verb.verb, verb.infinitive, verb.meaning, null);
  });

  return questions;
}

function parsingLabel(person, number, tense) {
  return person + ' person ' + number + ', ' + tense;
}

function buildVerbTranslation(q) {
  const pronoun = {
    '1st singular': 'I', '2nd singular': 'you', '3rd singular': 'he/she/it',
    '1st plural': 'we', '2nd plural': 'you all', '3rd plural': 'they'
  };
  const pro = pronoun[q.person + ' ' + q.number] || q.person + ' ' + q.number;
  const bare = q.exampleMeaning.replace(/^to\s+/, '');
  if (q.tense === 'present')   return pro + ' ' + bare;
  if (q.tense === 'imperfect') return pro + ' was ' + bare + 'ing';
  if (q.tense === 'perfect')   return pro + ' ' + bare + 'ed';
  return pro + ' ' + bare;
}

function pickVerbDistractors(correctQ, pool) {
  const correctCombo = correctQ.person + '|' + correctQ.number + '|' + correctQ.tense;
  const seen = new Set([correctCombo]);
  const distractors = [];

  for (const q of shuffle([...pool])) {
    const combo = q.person + '|' + q.number + '|' + q.tense;
    if (!seen.has(combo)) {
      seen.add(combo);
      distractors.push({ person: q.person, number: q.number, tense: q.tense, isCorrect: false });
      if (distractors.length >= 3) break;
    }
  }

  // Fallback: synthesise combos if pool too small
  if (distractors.length < 3) {
    const persons = ['1st', '2nd', '3rd'];
    const numbers = ['singular', 'plural'];
    const tenses = ['present', 'imperfect', 'perfect'];
    outer: for (const p of persons) {
      for (const n of numbers) {
        for (const t of tenses) {
          const combo = p + '|' + n + '|' + t;
          if (!seen.has(combo)) {
            seen.add(combo);
            distractors.push({ person: p, number: n, tense: t, isCorrect: false });
            if (distractors.length >= 3) break outer;
          }
        }
      }
    }
  }

  return distractors;
}

function renderVerbQuestion(app, questions, index, score) {
  if (index >= questions.length) {
    renderVerbSummary(app, score);
    return;
  }

  const q = questions[index];
  const distractors = pickVerbDistractors(q, questions);
  const correctOpt = { person: q.person, number: q.number, tense: q.tense, isCorrect: true };
  const options = shuffle([correctOpt, ...distractors]);

  app.innerHTML = '';

  const hdr = el('div', { className: 'ex-header' });
  hdr.appendChild(el('h1', {}, 'Verb Parser'));
  hdr.appendChild(el('p', { className: 'ex-progress' }, 'Question ' + (index + 1) + ' of ' + questions.length));
  app.appendChild(hdr);
  app.appendChild(el('p', { className: 'ex-ce-label' }, 'Practises: CE Question 3 (grammar \u2014 verb parsing)'));

  const card = el('div', { className: 'ex-card' });
  card.appendChild(el('p', { className: 'ex-context' },
    q.exampleVerb + ' (' + q.exampleInfinitive + ') \u2014 ' + q.exampleMeaning));
  card.appendChild(el('p', { className: 'ex-form-display' }, q.form));
  card.appendChild(el('p', { className: 'ex-prompt' }, 'What is the person, number, and tense?'));
  app.appendChild(card);

  const correctLabel = parsingLabel(q.person, q.number, q.tense);

  const optGrid = el('div', { className: 'ex-options ex-options-wide' });
  options.forEach(opt => {
    const label = parsingLabel(opt.person, opt.number, opt.tense);
    const btn = el('button', { className: 'ex-option-btn' }, label);
    btn.addEventListener('click', () => {
      const isCorrect = opt.isCorrect;

      optGrid.querySelectorAll('.ex-option-btn').forEach(b => {
        b.disabled = true;
        if (b.textContent === correctLabel) b.classList.add('correct');
        else if (b.textContent === label && !isCorrect) b.classList.add('wrong');
      });

      const fb = el('div', { className: 'ex-feedback ' + (isCorrect ? 'ex-feedback-positive' : 'ex-feedback-negative') });
      fb.appendChild(el('p', { className: 'ex-feedback-result' },
        isCorrect
          ? '\u2713 Correct \u2014 you parsed it right.'
          : 'Not yet \u2014 it\u2019s: ' + correctLabel + '.'));
      fb.appendChild(el('p', { className: 'ex-feedback-explanation' },
        q.form + ': ' + correctLabel + ' of ' + q.exampleVerb + ' \u2014 \u201c' + buildVerbTranslation(q) + '\u201d'));
      fb.appendChild(el('p', { className: 'ex-feedback-note' }, TENSE_NOTES[q.tense]));

      const nextBtn = el('button', { className: 'btn ex-next-btn' },
        index + 1 < questions.length ? 'Next Question' : 'See Results');
      nextBtn.addEventListener('click', () =>
        renderVerbQuestion(app, questions, index + 1,
          { correct: score.correct + (isCorrect ? 1 : 0), total: score.total }));
      fb.appendChild(nextBtn);
      app.appendChild(fb);
    });
    optGrid.appendChild(btn);
  });
  app.appendChild(optGrid);
}

function renderVerbSummary(app, score) {
  app.innerHTML = '';
  app.appendChild(el('h1', {}, 'Verb Parser'));

  const summary = el('div', { className: 'ex-summary' });
  summary.appendChild(el('p', { className: 'ex-score-big' }, score.correct + '/' + score.total + ' correct'));

  let msg;
  if (score.correct === score.total) msg = 'Perfect \u2014 you can parse verbs fluently. That\u2019s real CE Q3 skill.';
  else if (score.correct >= Math.ceil(score.total * 0.7)) msg = 'Strong work \u2014 you\u2019ve built genuine verb-parsing ability.';
  else msg = 'Not there yet \u2014 each attempt builds the pattern. Review the conjugation tables, then try again.';
  summary.appendChild(el('p', { className: score.correct >= Math.ceil(score.total * 0.7) ? 'ex-feedback-positive' : 'ex-feedback-neutral' }, msg));

  const actions = el('div', { className: 'ex-actions' });
  const retry = el('button', { className: 'btn' }, 'Try Again');
  retry.addEventListener('click', () => runVerbParser(app));
  actions.appendChild(retry);
  actions.appendChild(el('a', { className: 'btn btn-secondary', href: 'quiz.html' }, 'Back to Exercises'));
  summary.appendChild(actions);
  app.appendChild(summary);
}

// =============================================================
// PARADIGM SELF-CHECK — quiz.html?activity=paradigm
// =============================================================

/**
 * Load nouns data and start the paradigm self-check.
 * @param {HTMLElement} app
 */
function runParadigmCheck(app) {
  app.innerHTML = '<p class="ex-loading">Loading paradigm\u2026</p>';

  fetch('data/grammar/nouns.json')
    .then(r => { if (!r.ok) throw new Error('nouns'); return r.json(); })
    .then(data => {
      const params = new URLSearchParams(window.location.search);
      const declFilter = params.get('filter');
      let pool = data.declensions;

      if (declFilter && declFilter.startsWith('decl:')) {
        const num = parseInt(declFilter.slice(5), 10);
        const filtered = pool.filter(d => d.declension === num);
        if (filtered.length > 0) pool = filtered;
      }

      const decl = pool[Math.floor(Math.random() * pool.length)];
      renderParadigmTable(app, decl, data.declensions);
    })
    .catch(err => {
      app.innerHTML = '<h1>Paradigm Check</h1><p class="error">Could not load noun data. Please reload.</p>';
      console.error('[CE Latin] Paradigm check load error:', err);
    });
}

function renderParadigmTable(app, decl, allDeclensions) {
  // Collect all non-empty cells
  const allCells = [];
  decl.cases.forEach(caseName => {
    ['singular', 'plural'].forEach(number => {
      const form = decl[number][caseName];
      if (form) allCells.push({ caseName, number, form });
    });
  });

  // Pick up to 4 random cells to blank
  const blankedCells = shuffle(allCells).slice(0, 4);
  const blankedSet = new Set(blankedCells.map(c => c.caseName + '|' + c.number));

  const state = { blankedCells, filled: new Map(), total: blankedCells.length };

  app.innerHTML = '';

  const hdr = el('div', { className: 'ex-header' });
  hdr.appendChild(el('h1', {}, 'Paradigm Check'));
  app.appendChild(hdr);
  app.appendChild(el('p', { className: 'ex-ce-label' }, 'Practises: CE Question 3 & 4'));

  app.appendChild(el('p', { className: 'ex-context' },
    decl.name + ' \u2014 ' + decl.example_noun + ' (' + decl.example_meaning + ')'));
  app.appendChild(el('p', { className: 'ex-prompt' },
    'Tap the \u201c?\u201d cells to fill in the missing forms.'));

  // Table
  const wrapper = el('div', { className: 'table-scroll' });
  const table = el('table', { className: 'grammar-table paradigm-table' });

  const thead = table.createTHead();
  const headRow = thead.insertRow();
  ['Case', 'Singular', 'Plural'].forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();
  decl.cases.forEach(caseName => {
    const row = tbody.insertRow();

    const caseCell = row.insertCell();
    caseCell.className = 'case-label';
    caseCell.textContent = caseName.charAt(0).toUpperCase() + caseName.slice(1);

    ['singular', 'plural'].forEach(number => {
      const td = row.insertCell();
      const key = caseName + '|' + number;

      if (blankedSet.has(key)) {
        td.className = 'paradigm-blank-cell';
        td.dataset.key = key;
        td.dataset.caseName = caseName;
        td.dataset.number = number;
        td.dataset.correct = decl[number][caseName];

        const btn = el('button', { className: 'paradigm-blank-btn' }, '?');
        btn.setAttribute('aria-label', 'Fill in ' + caseName + ' ' + number);
        btn.addEventListener('click', () =>
          openParadigmOptions(app, td, decl, allDeclensions, state, allCells));
        td.appendChild(btn);
      } else {
        td.textContent = decl[number][caseName] || '';
      }
    });
  });

  wrapper.appendChild(table);
  app.appendChild(wrapper);

  // Options panel (hidden until a blank is tapped)
  const panel = el('div', { className: 'paradigm-options-panel' });
  panel.id = 'paradigm-options-panel';
  panel.hidden = true;
  app.appendChild(panel);

  // Progress counter
  const counter = el('p', { className: 'ex-progress', id: 'paradigm-counter' },
    '0 / ' + state.total + ' filled');
  app.appendChild(counter);
}

function openParadigmOptions(app, td, decl, allDeclensions, state, allCells) {
  if (state.filled.has(td.dataset.key)) return;

  const correctForm = td.dataset.correct;
  const caseName = td.dataset.caseName;
  const number = td.dataset.number;

  // Build distractor pool from this paradigm plus other declensions
  const otherForms = [];
  allCells.forEach(c => { if (c.form !== correctForm) otherForms.push(c.form); });
  allDeclensions.forEach(d => {
    if (d !== decl) {
      d.cases.forEach(cn => {
        ['singular', 'plural'].forEach(nb => {
          const f = d[nb] && d[nb][cn];
          if (f && f !== correctForm) otherForms.push(f);
        });
      });
    }
  });

  const uniqueOthers = [...new Set(otherForms)];
  const distractors = shuffle(uniqueOthers).slice(0, 3);
  const options = shuffle([correctForm, ...distractors]);

  const panel = document.getElementById('paradigm-options-panel');
  panel.hidden = false;
  panel.innerHTML = '';
  panel.appendChild(el('p', { className: 'ex-context' },
    caseName.charAt(0).toUpperCase() + caseName.slice(1) + ' ' + number + ':'));

  const optGrid = el('div', { className: 'ex-options' });
  options.forEach(form => {
    const btn = el('button', { className: 'ex-option-btn paradigm-form-btn' }, form);
    btn.addEventListener('click', () => {
      const isCorrect = form === correctForm;

      optGrid.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        if (b.textContent === correctForm) b.classList.add('correct');
        else if (b.textContent === form && !isCorrect) b.classList.add('wrong');
      });

      // Update the blank cell in the table
      const blankBtn = td.querySelector('.paradigm-blank-btn');
      if (blankBtn) blankBtn.remove();
      td.textContent = correctForm;
      td.classList.remove('paradigm-blank-cell');
      td.classList.add(isCorrect ? 'paradigm-cell-correct' : 'paradigm-cell-wrong');

      state.filled.set(td.dataset.key, { isCorrect });

      const counter = document.getElementById('paradigm-counter');
      if (counter) counter.textContent = state.filled.size + ' / ' + state.total + ' filled';

      setTimeout(() => {
        panel.hidden = true;
        panel.innerHTML = '';
        if (state.filled.size >= state.total) renderParadigmSummary(app, state);
      }, 800);
    });
    optGrid.appendChild(btn);
  });
  panel.appendChild(optGrid);
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderParadigmSummary(app, state) {
  const correct = [...state.filled.values()].filter(v => v.isCorrect).length;
  const total = state.total;

  const summary = el('div', { className: 'ex-summary' });
  summary.appendChild(el('p', { className: 'ex-score-big' }, correct + '/' + total + ' correct'));

  const msg = correct === total
    ? correct + '/' + total + ' correct \u2014 you\u2019ve got this paradigm!'
    : correct + '/' + total + ' correct \u2014 keep reviewing the table.';
  summary.appendChild(el('p', { className: correct === total ? 'ex-feedback-positive' : 'ex-feedback-neutral' }, msg));

  const actions = el('div', { className: 'ex-actions' });
  const tryBtn = el('button', { className: 'btn' }, 'Try Another');
  tryBtn.addEventListener('click', () => runParadigmCheck(app));
  actions.appendChild(tryBtn);
  actions.appendChild(el('a', { className: 'btn btn-secondary', href: 'quiz.html' }, 'Back to Exercises'));
  summary.appendChild(actions);
  app.appendChild(summary);
  summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// =============================================================
// MATCHING PAIRS — quiz.html?activity=pairs
// =============================================================

function runMatchingPairs(app) {
  fetch('data/vocabulary/all.json')
    .then(r => r.json())
    .then(words => {
      // Pick a topic
      const params = new URLSearchParams(location.search);
      const topicFilter = params.get('filter');
      let topic = topicFilter ? topicFilter.replace('topic:', '') : null;
      const topics = ['family', 'daily-life', 'war-army', 'nature', 'travel', 'gods'];
      if (!topic || !topics.includes(topic)) {
        topic = topics[Math.floor(Math.random() * topics.length)];
      }

      // Filter and take 6
      const pool = words.filter(w => w.topics && w.topics.includes(topic) && w.part_of_speech === 'noun');
      if (pool.length < 6) {
        // Fallback: take any 6 nouns
        const allNouns = words.filter(w => w.part_of_speech === 'noun');
        return startPairs(shuffle(allNouns).slice(0, 6), app, null);
      }
      const selected = shuffle(pool).slice(0, 6);
      startPairs(selected, app, topic);
    })
    .catch(() => {
      app.innerHTML = '<p class="error">Could not load vocabulary data.</p>';
    });
}

function startPairs(words, app, topic) {
  const topicLabel = topic ? topic.replace('-', '/') : 'mixed';
  let matched = new Set();
  let selectedLatin = null;

  const englishItems = shuffle(words.map((w, i) => ({ id: i, english: w.english.split(',')[0].trim() })));

  function render() {
    const latinCol = words.map((w, i) => {
      const isMatched = matched.has(i);
      const isSelected = selectedLatin === i;
      return `<button class="pair-btn latin-btn${isMatched ? ' matched' : ''}${isSelected ? ' selected' : ''}"
        data-idx="${i}" ${isMatched ? 'disabled' : ''}>${w.latin}</button>`;
    }).join('');

    const englishCol = englishItems.map(item => {
      const isMatched = matched.has(item.id);
      return `<button class="pair-btn english-btn${isMatched ? ' matched' : ''}"
        data-idx="${item.id}" ${isMatched ? 'disabled' : ''}>${item.english}</button>`;
    }).join('');

    app.innerHTML = `
      <div class="ex-header">
        <a href="quiz.html" class="ex-back">&#8592; Exercises</a>
        <span class="ex-ce-label">Practises: CE vocabulary recall</span>
      </div>
      <h2>Matching Pairs</h2>
      <p class="ex-topic-label">Topic: <strong>${topicLabel}</strong> &#8212; tap a Latin word, then its English meaning</p>
      <div class="pairs-grid">
        <div class="pairs-col">${latinCol}</div>
        <div class="pairs-col">${englishCol}</div>
      </div>
      <p class="pairs-score">${matched.size}/6 matched</p>
    `;

    // Attach events
    app.querySelectorAll('.latin-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLatin = parseInt(btn.dataset.idx);
        render();
      });
    });

    app.querySelectorAll('.english-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        if (selectedLatin === null) return;
        const englishIdx = parseInt(btn.dataset.idx);
        if (selectedLatin === englishIdx) {
          // Correct match
          matched.add(selectedLatin);
          selectedLatin = null;
          render();
          if (matched.size === 6) showPairsSummary(app, words, topic);
        } else {
          // Wrong — flash both buttons red briefly, deselect
          btn.classList.add('wrong');
          const latinBtn = app.querySelector(`.latin-btn[data-idx="${selectedLatin}"]`);
          if (latinBtn) latinBtn.classList.add('wrong');
          setTimeout(() => { selectedLatin = null; render(); }, 800);
        }
      });
    });
  }

  render();
}

function showPairsSummary(app, words, topic) {
  const topicLabel = topic ? topic.replace('-', '/') : 'mixed';
  app.innerHTML = `
    <div class="ex-summary">
      <div class="ex-summary-icon">&#10003;</div>
      <h2>All matched!</h2>
      <p>You matched all 6 ${topicLabel} words correctly.</p>
      <div class="ex-summary-actions">
        <a href="quiz.html?activity=pairs" class="ex-btn ex-btn-primary">Try another set</a>
        <a href="quiz.html" class="ex-btn ex-btn-secondary">Back to Exercises</a>
      </div>
    </div>
  `;
}

// =============================================================
// GAP-FILL — quiz.html?activity=gap-fill
// =============================================================

function runGapFill(app) {
  fetch('data/exercises/gap-fill.json')
    .then(r => r.json())
    .then(data => {
      const questions = shuffle(data).slice(0, 8);
      let idx = 0, correct = 0;

      function showQuestion() {
        if (idx >= questions.length) return showGapFillSummary(app, correct, questions.length);
        const q = questions[idx];
        const opts = shuffle([...q.options]);
        app.innerHTML = `
          <div class="ex-header">
            <a href="quiz.html" class="ex-back">&#8592; Exercises</a>
            <span class="ex-ce-label">Practises: CE Questions 1 &amp; 2 (vocabulary in context)</span>
          </div>
          <p class="ex-progress">${idx + 1} / ${questions.length}</p>
          <div class="ex-sentence-card">
            <p class="ex-sentence">${q.display}</p>
            <p class="ex-translation-hint">${q.translation.replace(q.correct, '_____')}</p>
          </div>
          <div class="ex-options">
            ${opts.map(o => `<button class="ex-opt-btn" data-val="${o}">${o}</button>`).join('')}
          </div>
          <div class="ex-feedback" id="gf-feedback" style="display:none"></div>
        `;

        app.querySelectorAll('.ex-opt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const chosen = btn.dataset.val;
            const isCorrect = chosen === q.correct;
            if (isCorrect) correct++;

            // Disable all buttons and colour them
            app.querySelectorAll('.ex-opt-btn').forEach(b => {
              b.disabled = true;
              if (b.dataset.val === q.correct) b.classList.add('correct');
              else if (b === btn && !isCorrect) b.classList.add('wrong');
            });

            const fb = document.getElementById('gf-feedback');
            fb.style.display = 'block';
            fb.innerHTML = `
              <p class="${isCorrect ? 'fb-correct' : 'fb-wrong'}">${isCorrect ? '&#10003; Correct \u2014 you knew that one.' : `Not yet \u2014 it\u2019s <strong>${q.correct}</strong>`}</p>
              <p class="fb-explanation">${q.explanation}</p>
              <button class="ex-btn ex-btn-primary" id="gf-next">
                ${idx + 1 < questions.length ? 'Next sentence &#8594;' : 'See results &#8594;'}
              </button>
            `;
            document.getElementById('gf-next').addEventListener('click', () => { idx++; showQuestion(); });
          });
        });
      }

      showQuestion();
    })
    .catch(() => {
      app.innerHTML = '<p class="error">Could not load gap-fill data.</p>';
    });
}

function showGapFillSummary(app, correct, total) {
  const pct = Math.round((correct / total) * 100);
  app.innerHTML = `
    <div class="ex-summary">
      <div class="ex-summary-icon">${pct >= 70 ? '&#10003;' : '&#8594;'}</div>
      <h2>${correct}/${total} correct</h2>
      <p>${pct >= 70 ? 'Strong work &#8212; you can read Latin in context.' : 'Keep going &#8212; context reading takes practice.'}</p>
      <div class="ex-summary-actions">
        <a href="quiz.html?activity=gap-fill" class="ex-btn ex-btn-primary">Try again</a>
        <a href="quiz.html" class="ex-btn ex-btn-secondary">Back to Exercises</a>
      </div>
    </div>
  `;
}

// =============================================================
// MASTERY DASHBOARD — quiz.html?activity=dashboard
// =============================================================

function runDashboard(app) {
  fetch('data/vocabulary/all.json')
    .then(r => r.json())
    .then(words => {
      const summary = SRS.summary(words.map(w => w.id));
      const total = words.length;
      const mastered = summary.mastered;
      const learning = summary.learning;
      const newCount = total - mastered - learning;

      // Build dot strip (max 100 dots shown for layout)
      const displayCount = Math.min(total, 100);
      const dots = [];
      for (let i = 0; i < displayCount; i++) {
        if (i < mastered) dots.push('<span class="dash-dot mastered" title="Mastered"></span>');
        else if (i < mastered + learning) dots.push('<span class="dash-dot learning" title="Learning"></span>');
        else dots.push('<span class="dash-dot new" title="Not yet seen"></span>');
      }
      if (total > displayCount) dots.push(`<span class="dash-dot-more">+${total - displayCount} more</span>`);

      const progressNote = mastered === 0
        ? 'Start with flashcards \u2014 every word you rate correctly moves up a level.'
        : mastered >= total
          ? 'Outstanding \u2014 every word mastered. Keep reviewing to stay sharp.'
          : `You\u2019ve secured ${mastered} out of ${total} words. Keep going!`;

      app.innerHTML = `
        <div class="ex-header">
          <a href="quiz.html" class="ex-back">\u2190 Exercises</a>
          <span class="ex-ce-label">Your progress</span>
        </div>
        <h2>Mastery Dashboard</h2>
        <div class="dash-stats">
          <div class="dash-stat dash-stat--mastered">
            <span class="dash-stat-num">${mastered}</span>
            <span class="dash-stat-label">Mastered</span>
          </div>
          <div class="dash-stat dash-stat--learning">
            <span class="dash-stat-num">${learning}</span>
            <span class="dash-stat-label">Learning</span>
          </div>
          <div class="dash-stat dash-stat--new">
            <span class="dash-stat-num">${newCount}</span>
            <span class="dash-stat-label">Not yet seen</span>
          </div>
        </div>
        <div class="dash-dots">${dots.join('')}</div>
        <p class="dash-note">${progressNote}</p>
        <div class="dash-actions">
          <a href="quiz.html?activity=flashcard" class="ex-btn ex-btn-primary">Flashcards</a>
          <a href="quiz.html?activity=mcq" class="ex-btn ex-btn-secondary">MCQ Quiz</a>
          <a href="quiz.html" class="ex-btn ex-btn-secondary">All exercises</a>
        </div>
      `;
    })
    .catch(() => {
      app.innerHTML = '<p class="error">Could not load progress data.</p>';
    });
}

// -- UTILITIES ------------------------------------------------------------

function el(tag, attrs, text) {
  const e = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') e.className = v;
    else if (k === 'href') e.href = v;
    else if (k === 'disabled') e.disabled = v;
    else e.setAttribute(k, v);
  });
  if (text !== undefined) e.textContent = text;
  return e;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function filterLabel(filter) {
  if (!filter) return '';
  const [type, value] = filter.split(':');
  if (type === 'pos') return value.charAt(0).toUpperCase() + value.slice(1) + 's';
  if (type === 'topic') return value.charAt(0).toUpperCase() + value.slice(1);
  if (type === 'freq') return 'Top ' + value;
  if (type === 'decl') return (['', '1st', '2nd', '3rd'][parseInt(value)] || value + 'th') + ' Declension';
  return filter;
}

function buildMeta(word) {
  if (word.part_of_speech === 'noun') {
    const g = { f: 'fem.', m: 'masc.', n: 'neut.' }[word.gender] || word.gender;
    const d = ['', '1st', '2nd', '3rd'][word.declension] || (word.declension + 'th');
    return g + ' · ' + d + ' decl.';
  }
  if (word.part_of_speech === 'verb') {
    return word.conjugation ? (['', '1st', '2nd'][word.conjugation] + ' conj.') : 'irreg.';
  }
  return word.part_of_speech;
}
