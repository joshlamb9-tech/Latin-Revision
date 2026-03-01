'use strict';

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
  example.textContent = decl.example_noun + ' — ' + decl.example_meaning;
  section.appendChild(example);

  section.appendChild(renderNounTable(decl));

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
  example.textContent = conj.example_verb + ' (' + conj.example_infinitive + ') — ' + conj.example_meaning;
  section.appendChild(example);

  Object.keys(conj.tenses).forEach(tenseKey => {
    const tenseData = conj.tenses[tenseKey];

    const label = document.createElement('p');
    label.className = 'tense-label';
    label.textContent = tenseData.name || tenseKey;
    section.appendChild(label);

    section.appendChild(renderVerbTable(tenseData));
  });

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
