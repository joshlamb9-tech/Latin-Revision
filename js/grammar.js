'use strict';

// =============================================================
// Grammar Quick-Check questions — embedded constants, no external data
// =============================================================

const GRAMMAR_QUICK_CHECKS = {
  noun_1: {
    question: 'In the 1st declension, which ending marks the accusative singular?',
    options: ['-am', '-ae', '-\u0101', '-\u0101rum'],
    correct: '-am',
    explanation: 'The accusative singular of 1st declension nouns ends in -am (e.g. puellam). The accusative marks the direct object.'
  },
  noun_2: {
    question: 'In the 2nd declension (masculine), which ending marks the genitive singular?',
    options: ['-\u012b', '-\u014d', '-um', '-\u014drum'],
    correct: '-\u012b',
    explanation: 'The genitive singular of 2nd declension masculine nouns ends in -\u012b (e.g. serv\u012b = of the slave). The genitive shows possession.'
  },
  noun_3: {
    question: 'What case is used for the subject of a Latin verb?',
    options: ['Nominative', 'Accusative', 'Genitive', 'Dative'],
    correct: 'Nominative',
    explanation: 'The nominative case marks the subject \u2014 the person or thing doing the action. In CE Q3 you may be asked to identify it.'
  },
  verb_1_present: {
    question: 'What does the imperfect tense describe?',
    options: ['A continuous or repeated past action', 'A completed past action', 'An action happening now', 'A command'],
    correct: 'A continuous or repeated past action',
    explanation: 'The imperfect tense (port\u0101bam = I was carrying) describes ongoing or repeated action in the past. CE Q3 often asks you to identify the tense.'
  },
  verb_1_perfect: {
    question: 'What is the 3rd person singular perfect of port\u014d?',
    options: ['port\u0101vit', 'portat', 'port\u0101bat', 'port\u0101v\u012b'],
    correct: 'port\u0101vit',
    explanation: 'port\u0101vit = he/she/it carried (perfect, completed action). The -vit ending marks 3rd person singular perfect for 1st conjugation verbs.'
  },
  verb_2_present: {
    question: 'Which ending marks the 1st person singular present in the 2nd conjugation?',
    options: ['-e\u014d', '-\u0101s', '-et', '-\u0113mus'],
    correct: '-e\u014d',
    explanation: 'mone\u014d = I warn. The 1st person singular present ends in -e\u014d for 2nd conjugation verbs.'
  }
};

/**
 * Append an interactive MCQ quick-check to a grammar section container.
 * @param {HTMLElement} container - the section element to append to
 * @param {string} checkKey - key from GRAMMAR_QUICK_CHECKS
 */
function appendQuickCheck(container, checkKey) {
  const check = GRAMMAR_QUICK_CHECKS[checkKey];
  if (!check) return;
  let answered = false;

  const div = document.createElement('div');
  div.className = 'qcheck';
  const shuffled = [...check.options].sort(() => Math.random() - 0.5);
  div.innerHTML = `
    <p class="qcheck-label">Quick check</p>
    <p class="qcheck-q">${check.question}</p>
    <div class="qcheck-opts">
      ${shuffled.map(o => `<button class="qcheck-btn" data-val="${o}">${o}</button>`).join('')}
    </div>
    <div class="qcheck-fb" style="display:none"></div>
  `;
  container.appendChild(div);

  div.querySelectorAll('.qcheck-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const correct = btn.dataset.val === check.correct;
      div.querySelectorAll('.qcheck-btn').forEach(b => {
        b.disabled = true;
        if (b.dataset.val === check.correct) b.classList.add('qcheck-correct');
        else if (b === btn && !correct) b.classList.add('qcheck-wrong');
      });
      const fb = div.querySelector('.qcheck-fb');
      fb.style.display = 'block';
      fb.innerHTML = `<p class="${correct ? 'fb-correct' : 'fb-wrong'}">${correct ? '\u2713 Correct!' : `\u2717 The answer is <strong>${check.correct}</strong>`}</p><p class="fb-explanation">${check.explanation}</p>`;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');

  Promise.all([
    fetch('data/grammar/nouns.json').then(r => { if (!r.ok) throw new Error('nouns'); return r.json(); }),
    fetch('data/grammar/verbs.json').then(r => { if (!r.ok) throw new Error('verbs'); return r.json(); })
  ])
  .then(([nounsData, verbsData]) => {
    app.innerHTML = '';
    renderAllGrammar(app, nounsData, verbsData);
  })
  .catch(err => {
    app.innerHTML = '<h1>Grammar</h1><p class="error">Could not load grammar tables. Please reload.</p>';
    console.error('[CE Latin] Grammar load error:', err);
  });
});

/**
 * Render the full grammar reference into the given container element.
 * @param {HTMLElement} container
 * @param {Object} nounsData   - parsed nouns.json
 * @param {Object} verbsData   - parsed verbs.json
 */
function renderAllGrammar(container, nounsData, verbsData) {
  // Page title
  const h1 = document.createElement('h1');
  h1.textContent = 'Grammar Reference';
  container.appendChild(h1);

  // --- Noun Declensions ---
  const nounHeading = document.createElement('h2');
  nounHeading.textContent = 'Noun Declensions';
  container.appendChild(nounHeading);

  nounsData.declensions.forEach(decl => {
    container.appendChild(renderDeclensionSection(decl));
  });

  // --- Verb Conjugations ---
  const verbHeading = document.createElement('h2');
  verbHeading.textContent = 'Verb Conjugations';
  container.appendChild(verbHeading);

  verbsData.conjugations.forEach(conj => {
    container.appendChild(renderConjugationSection(conj));
  });

  // --- Irregular Verbs ---
  const irregHeading = document.createElement('h2');
  irregHeading.textContent = 'Irregular Verbs';
  container.appendChild(irregHeading);

  verbsData.irregular.forEach(verb => {
    container.appendChild(renderIrregularSection(verb));
  });
}

/**
 * Render a single noun declension section (heading + example + table).
 * @param {Object} decl - one entry from nounsData.declensions
 * @returns {HTMLElement}
 */
function renderDeclensionSection(decl) {
  const section = document.createElement('div');
  section.className = 'grammar-section';

  const h3 = document.createElement('h3');
  h3.textContent = decl.name;
  section.appendChild(h3);

  const example = document.createElement('p');
  example.className = 'grammar-example';
  example.textContent = decl.example_noun + ' \u2014 ' + decl.example_meaning;
  section.appendChild(example);

  section.appendChild(renderNounTable(decl));

  // Quick-check question keyed by declension number
  const checkKeyMap = { 1: 'noun_1', 2: 'noun_2', 3: 'noun_3' };
  const checkKey = checkKeyMap[decl.declension];
  if (checkKey) appendQuickCheck(section, checkKey);

  return section;
}

/**
 * Render a scrollable noun declension table (Case | Singular | Plural).
 * @param {Object} decl - one entry from nounsData.declensions
 * @returns {HTMLElement} wrapper div
 */
function renderNounTable(decl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'grammar-table';

  // thead
  const thead = table.createTHead();
  const headRow = thead.insertRow();
  ['Case', 'Singular', 'Plural'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });

  // tbody
  const tbody = table.createTBody();
  decl.cases.forEach(caseName => {
    const row = tbody.insertRow();

    const caseCell = row.insertCell();
    caseCell.className = 'case-label';
    caseCell.textContent = caseName.charAt(0).toUpperCase() + caseName.slice(1);

    const singCell = row.insertCell();
    singCell.textContent = decl.singular[caseName] || '';

    const plurCell = row.insertCell();
    plurCell.textContent = decl.plural[caseName] || '';
  });

  wrapper.appendChild(table);
  return wrapper;
}

/**
 * Render a verb conjugation section (heading + example + tense tables).
 * @param {Object} conj - one entry from verbsData.conjugations
 * @returns {HTMLElement}
 */
function renderConjugationSection(conj) {
  const section = document.createElement('div');
  section.className = 'grammar-section';

  const h3 = document.createElement('h3');
  h3.textContent = conj.name;
  section.appendChild(h3);

  const example = document.createElement('p');
  example.className = 'grammar-example';
  example.textContent = conj.example_verb + ' (' + conj.example_infinitive + ') \u2014 ' + conj.example_meaning;
  section.appendChild(example);

  Object.keys(conj.tenses).forEach(tenseKey => {
    const tenseData = conj.tenses[tenseKey];

    const label = document.createElement('p');
    label.className = 'tense-label';
    label.textContent = tenseData.name || tenseKey;
    section.appendChild(label);

    section.appendChild(renderVerbTable(tenseData));
  });

  // Quick-check questions keyed by conjugation number
  if (conj.conjugation === 1) {
    appendQuickCheck(section, 'verb_1_present');
    appendQuickCheck(section, 'verb_1_perfect');
  } else if (conj.conjugation === 2) {
    appendQuickCheck(section, 'verb_2_present');
  }

  return section;
}

/**
 * Render a scrollable verb conjugation table (Person | Singular | Plural).
 * @param {Object} tenseData - one tense object with singular and plural properties
 * @returns {HTMLElement} wrapper div
 */
function renderVerbTable(tenseData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'grammar-table';

  // thead
  const thead = table.createTHead();
  const headRow = thead.insertRow();
  ['Person', 'Singular', 'Plural'].forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  });

  // tbody
  const tbody = table.createTBody();
  ['1st', '2nd', '3rd'].forEach(person => {
    const row = tbody.insertRow();

    const personCell = row.insertCell();
    personCell.textContent = person;

    const singCell = row.insertCell();
    singCell.textContent = (tenseData.singular && tenseData.singular[person]) || '';

    const plurCell = row.insertCell();
    plurCell.textContent = (tenseData.plural && tenseData.plural[person]) || '';
  });

  wrapper.appendChild(table);
  return wrapper;
}

/**
 * Render an irregular verb section (heading + tense tables).
 * @param {Object} verb - one entry from verbsData.irregular
 * @returns {HTMLElement}
 */
function renderIrregularSection(verb) {
  const section = document.createElement('div');
  section.className = 'grammar-section';

  const h3 = document.createElement('h3');
  h3.textContent = verb.verb + ' (' + verb.infinitive + ') — ' + verb.meaning;
  section.appendChild(h3);

  Object.keys(verb.tenses).forEach(tenseKey => {
    const tenseData = verb.tenses[tenseKey];

    const label = document.createElement('p');
    label.className = 'tense-label';
    label.textContent = tenseData.name || tenseKey;
    section.appendChild(label);

    section.appendChild(renderVerbTable(tenseData));
  });

  return section;
}
