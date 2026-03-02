'use strict';

// =============================================================
// Grammar Quick-Check questions — embedded constants, no external data
// =============================================================

// Each key maps to an ARRAY of questions so the quick-check can cycle.
const GRAMMAR_QUICK_CHECKS = {
  noun_1: [
    { question: 'Which ending marks the accusative singular in the 1st declension?', options: ['-am', '-ae', '-\u0101', '-\u0101rum'], correct: '-am', explanation: 'The accusative singular ends in -am (e.g. puell\u0101m). The accusative marks the direct object \u2014 the thing the action is done to.' },
    { question: 'Which ending marks the nominative plural in the 1st declension?', options: ['-ae', '-am', '-\u0101rum', '-\u012bs'], correct: '-ae', explanation: 'The nominative plural ends in -ae (e.g. puell\u0101e = the girls). Nominative is used for the subject of the verb.' },
    { question: 'Which ending marks the genitive plural in the 1st declension?', options: ['-\u0101rum', '-ae', '-\u012bs', '-am'], correct: '-\u0101rum', explanation: 'The genitive plural ends in -\u0101rum (e.g. puell\u0101rum = of the girls). The genitive shows possession or relationship.' },
    { question: 'Which ending marks the dative and ablative plural in the 1st declension?', options: ['-\u012bs', '-ae', '-\u0101rum', '-am'], correct: '-\u012bs', explanation: 'Both dative and ablative plural end in -\u012bs (e.g. puell\u012bs). The dative marks the indirect object; ablative follows prepositions like cum, ex, in.' },
    { question: 'What is the ablative singular of puella?', options: ['puell\u0101', 'puellam', 'puellae', 'puellas'], correct: 'puell\u0101', explanation: 'The ablative singular of 1st declension nouns ends in -\u0101 (long a): puell\u0101. Used after prepositions like in, cum, ex, ab.' },
    { question: 'What case is puellam?', options: ['Accusative', 'Nominative', 'Ablative', 'Genitive'], correct: 'Accusative', explanation: 'Puellam is accusative singular \u2014 the -am ending marks the direct object. E.g. servus puellam amat = the slave loves the girl.' },
    { question: 'What case is puell\u0101rum?', options: ['Genitive plural', 'Ablative plural', 'Dative plural', 'Accusative plural'], correct: 'Genitive plural', explanation: 'Puell\u0101rum = of the girls. The -\u0101rum ending marks the genitive plural of 1st declension nouns.' },
  ],
  noun_2: [
    { question: 'Which ending marks the genitive singular in the 2nd declension (masculine)?', options: ['-\u012b', '-\u014d', '-um', '-\u014drum'], correct: '-\u012b', explanation: 'The genitive singular ends in -\u012b (e.g. serv\u012b = of the slave). The genitive shows possession.' },
    { question: 'Which ending marks the accusative singular in the 2nd declension?', options: ['-um', '-us', '-\u012b', '-\u014d'], correct: '-um', explanation: 'The accusative singular ends in -um (e.g. servum = the slave, as direct object). Accusative marks the thing the action is done to.' },
    { question: 'Which ending marks the nominative plural in the 2nd declension (masculine)?', options: ['-\u012b', '-um', '-\u014ds', '-\u014drum'], correct: '-\u012b', explanation: 'The nominative plural ends in -\u012b (e.g. serv\u012b = the slaves). Note: this is the same as the genitive singular \u2014 context tells them apart.' },
    { question: 'Which ending marks the accusative plural in the 2nd declension?', options: ['-\u014ds', '-\u012b', '-\u014drum', '-um'], correct: '-\u014ds', explanation: 'The accusative plural ends in -\u014ds (e.g. serv\u014ds = the slaves, as direct objects). The long -\u014d distinguishes it from the nominative plural.' },
    { question: 'What is the vocative singular of servus?', options: ['serve', 'servus', 'serv\u012b', 'servum'], correct: 'serve', explanation: 'The vocative singular of -us nouns changes to -e (serve = O slave!). The vocative is used when addressing someone directly.' },
    { question: 'What does serv\u014d mean \u2014 and which two cases share this form?', options: ['Dative and ablative singular', 'Genitive and nominative plural', 'Accusative and ablative singular', 'Dative and genitive singular'], correct: 'Dative and ablative singular', explanation: 'Serv\u014d is both dative singular (to/for the slave) and ablative singular (from/with the slave). Context \u2014 especially prepositions \u2014 tells them apart.' },
  ],
  noun_3: [
    { question: 'What case is used for the subject of a Latin verb?', options: ['Nominative', 'Accusative', 'Genitive', 'Dative'], correct: 'Nominative', explanation: 'The nominative case marks the subject \u2014 the person or thing doing the action. CE Q3 often asks you to identify it.' },
    { question: 'Which ending marks the accusative singular in the 3rd declension?', options: ['-em', '-is', '-e', '-um'], correct: '-em', explanation: 'The accusative singular of 3rd declension nouns ends in -em (e.g. r\u0113gem = the king, as direct object).' },
    { question: 'Which ending marks the genitive singular in the 3rd declension?', options: ['-is', '-em', '-e', '-ibus'], correct: '-is', explanation: 'The genitive singular ends in -is (e.g. r\u0113gis = of the king). The genitive stem is found by removing -is from the genitive form.' },
    { question: 'Which ending marks the dative and ablative plural in the 3rd declension?', options: ['-ibus', '-is', '-em', '-um'], correct: '-ibus', explanation: 'The dative and ablative plural of 3rd declension nouns end in -ibus (e.g. r\u0113gibus = to/for/from the kings).' },
    { question: 'What is special about 3rd declension nominative singulars?', options: ['They vary \u2014 there is no single ending', 'They always end in -us', 'They always end in -is', 'They always end in -a'], correct: 'They vary \u2014 there is no single ending', explanation: 'Unlike 1st (-a) and 2nd (-us/-um) declensions, 3rd declension nominatives vary widely: rex, civis, corpus, mare. Learn them with the genitive.' },
    { question: 'What is the ablative singular of the 3rd declension?', options: ['-e', '-em', '-is', '-ibus'], correct: '-e', explanation: 'The ablative singular of 3rd declension nouns ends in -e (e.g. r\u0113ge = from/with the king). Used after prepositions like cum, ex, in, ab.' },
  ],
  verb_1_present: [
    { question: 'What does the imperfect tense describe?', options: ['A continuous or repeated past action', 'A completed past action', 'An action happening now', 'A future action'], correct: 'A continuous or repeated past action', explanation: 'The imperfect (port\u0101bam = I was carrying) describes ongoing or repeated action in the past. CE Q3 often asks you to identify the tense.' },
    { question: 'What is the 3rd person singular present of port\u014d?', options: ['portat', 'port\u0101s', 'port\u014d', 'portant'], correct: 'portat', explanation: 'Portat = he/she/it carries. The 3rd person singular present ends in -at for 1st conjugation verbs.' },
    { question: 'Which ending marks the 1st person plural present in the 1st conjugation?', options: ['-\u0101mus', '-\u0101tis', '-ant', '-\u014d'], correct: '-\u0101mus', explanation: 'Port\u0101mus = we carry. The 1st person plural present ends in -\u0101mus for 1st conjugation verbs.' },
    { question: 'What is the 3rd person singular imperfect of port\u014d?', options: ['port\u0101bat', 'portabam', 'portat', 'port\u0101vit'], correct: 'port\u0101bat', explanation: 'Port\u0101bat = he/she/it was carrying. The imperfect is formed with the stem + b\u0101 + personal ending. -bat marks 3rd person singular.' },
    { question: 'Which ending marks the 2nd person singular present in the 1st conjugation?', options: ['-\u0101s', '-at', '-\u0101mus', '-ant'], correct: '-\u0101s', explanation: 'Port\u0101s = you carry. The 2nd person singular present ends in -\u0101s for 1st conjugation verbs.' },
    { question: 'What does the present tense describe?', options: ['An action happening now or habitually', 'A completed past action', 'A continuous past action', 'A future action'], correct: 'An action happening now or habitually', explanation: 'The present tense (portat = he carries / he is carrying) describes an action happening now or as a regular habit.' },
  ],
  verb_1_perfect: [
    { question: 'What is the 3rd person singular perfect of port\u014d?', options: ['port\u0101vit', 'portat', 'port\u0101bat', 'port\u0101v\u012b'], correct: 'port\u0101vit', explanation: 'Port\u0101vit = he/she/it carried (completed). The -vit ending marks 3rd person singular perfect for 1st conjugation verbs.' },
    { question: 'What does the perfect tense describe?', options: ['A completed action in the past', 'An ongoing past action', 'An action happening now', 'A future action'], correct: 'A completed action in the past', explanation: 'The perfect tense (port\u0101vit = he carried / he has carried) describes a single completed past action. Different from the imperfect, which is ongoing.' },
    { question: 'What is the 1st person singular perfect of port\u014d?', options: ['port\u0101v\u012b', 'port\u0101vit', 'portabam', 'port\u014d'], correct: 'port\u0101v\u012b', explanation: 'Port\u0101v\u012b = I carried (completed). The 1st person singular perfect of port\u014d ends in -\u0101v\u012b.' },
    { question: 'Which ending marks the 3rd person plural perfect?', options: ['-\u0113runt', '-\u0101vit', '-\u0101mus', '-bant'], correct: '-\u0113runt', explanation: 'Port\u0101v\u0113runt = they carried. The 3rd person plural perfect ends in -\u0113runt. This is the completed past action for a group.' },
    { question: 'Port\u0101bat vs port\u0101vit \u2014 which is imperfect and which is perfect?', options: ['port\u0101bat = imperfect; port\u0101vit = perfect', 'port\u0101bat = perfect; port\u0101vit = imperfect', 'Both are imperfect', 'Both are perfect'], correct: 'port\u0101bat = imperfect; port\u0101vit = perfect', explanation: 'Port\u0101bat (he was carrying \u2014 ongoing past) is imperfect. Port\u0101vit (he carried \u2014 completed) is perfect. CE Q3 asks you to distinguish them.' },
  ],
  verb_2_present: [
    { question: 'Which ending marks the 1st person singular present in the 2nd conjugation?', options: ['-e\u014d', '-\u0101s', '-et', '-\u0113mus'], correct: '-e\u014d', explanation: 'Mone\u014d = I warn. The 1st person singular present ends in -e\u014d for 2nd conjugation verbs.' },
    { question: 'What is the 3rd person singular present of mone\u014d?', options: ['monet', 'mone\u014d', 'mon\u0113s', 'monent'], correct: 'monet', explanation: 'Monet = he/she/it warns. The 3rd person singular present of 2nd conjugation verbs ends in -et.' },
    { question: 'What is the 3rd person singular imperfect of mone\u014d?', options: ['mon\u0113bat', 'monebam', 'monet', 'monu\u012b'], correct: 'mon\u0113bat', explanation: 'Mon\u0113bat = he/she/it was warning. The imperfect of 2nd conjugation uses the stem mon\u0113- + b\u0101 + ending.' },
    { question: 'Which ending marks the 2nd person plural present in the 2nd conjugation?', options: ['-\u0113tis', '-\u0113mus', '-ent', '-et'], correct: '-\u0113tis', explanation: 'Mon\u0113tis = you (pl.) warn. The 2nd person plural present ends in -\u0113tis for 2nd conjugation verbs.' },
    { question: 'What is the 1st person plural present of mone\u014d?', options: ['mon\u0113mus', 'monet', 'mon\u0113tis', 'monent'], correct: 'mon\u0113mus', explanation: 'Mon\u0113mus = we warn. The 1st person plural present of 2nd conjugation verbs ends in -\u0113mus.' },
  ],
};

/**
 * Append a cycling interactive MCQ quick-check to a grammar section container.
 * The pool is the array of questions for checkKey. After answering, a "Try another"
 * button loads the next question (cycling through the pool without immediate repeats).
 */
function appendQuickCheck(container, checkKey) {
  const pool = GRAMMAR_QUICK_CHECKS[checkKey];
  if (!pool || !pool.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'qcheck-wrapper';
  container.appendChild(wrapper);

  let lastIndex = -1;

  function renderQuestion() {
    // Pick a random question, avoiding the last one shown
    let idx;
    if (pool.length === 1) {
      idx = 0;
    } else {
      do { idx = Math.floor(Math.random() * pool.length); } while (idx === lastIndex);
    }
    lastIndex = idx;
    const check = pool[idx];
    const seen = idx + 1;
    const total = pool.length;

    let answered = false;
    const shuffled = [...check.options].sort(() => Math.random() - 0.5);

    wrapper.innerHTML = `
      <div class="qcheck">
        <div class="qcheck-header">
          <p class="qcheck-label">Quick check</p>
          <span class="qcheck-count">${seen} of ${total}</span>
        </div>
        <p class="qcheck-q">${check.question}</p>
        <div class="qcheck-opts">
          ${shuffled.map(o => `<button class="qcheck-btn" data-val="${o}">${o}</button>`).join('')}
        </div>
        <div class="qcheck-fb" style="display:none"></div>
      </div>
    `;

    wrapper.querySelectorAll('.qcheck-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const correct = btn.dataset.val === check.correct;
        wrapper.querySelectorAll('.qcheck-btn').forEach(b => {
          b.disabled = true;
          if (b.dataset.val === check.correct) b.classList.add('qcheck-correct');
          else if (b === btn && !correct) b.classList.add('qcheck-wrong');
        });
        const fb = wrapper.querySelector('.qcheck-fb');
        fb.style.display = 'block';
        fb.innerHTML = `
          <p class="${correct ? 'fb-correct' : 'fb-wrong'}">${correct ? '\u2713 Correct \u2014 you knew that.' : `Not yet \u2014 it\u2019s <strong>${check.correct}</strong>`}</p>
          <p class="fb-explanation">${check.explanation}</p>
          ${pool.length > 1 ? '<button class="qcheck-next-btn">Try another \u2192</button>' : ''}
        `;
        if (pool.length > 1) {
          fb.querySelector('.qcheck-next-btn').addEventListener('click', renderQuestion);
        }
      });
    });
  }

  renderQuestion();
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
