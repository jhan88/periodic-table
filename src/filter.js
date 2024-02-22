'use strict';
import elements from './elements.json' assert { type: 'json' };

const arrElements = elements.elements.slice(0, 118);
const periodicTable = document.querySelector('#periodic-table');

// Add filter container
const filterContainer = document.querySelector('.container__filter');

function createButton(content, className, parentNode) {
  const button = document.createElement('button');
  button.textContent = content;
  button.setAttribute('class', className);
  return parentNode.appendChild(button);
}

// Add category filter
const setCategory = new Set();
arrElements.forEach((element) => {
  if (!element.category.startsWith('unknown')) {
    setCategory.add(element.category);
  }
});

function determineCategory(element) {
  if (setCategory.has(element.category)) {
    return element.category.replaceAll(' ', '-');
  } else {
    return [...setCategory]
      .filter((category) => element.category.includes(category))[0]
      .replaceAll(' ', '-');
  }
}

function addCategory(table, element) {
  const targetCell = table.querySelector(
    `[data-atomic-num="${element.number}"]`
  );
  targetCell.setAttribute('data-category', determineCategory(element));
}

arrElements.forEach((element) => addCategory(periodicTable, element));

const filterCategory = document.createElement('div');
filterCategory.classList.add('container__filter__category');
filterContainer.appendChild(filterCategory);

const buttonFilterCategory = createButton(
  'Category',
  'button__filter',
  filterCategory
);

[...setCategory].forEach((category) => {
  const buttonCategory = createButton(
    category,
    'button__filter__category',
    filterCategory
  );

  buttonCategory.setAttribute(
    'data-category',
    `${category.replaceAll(' ', '-')}`
  );

  buttonCategory.style['background-color'] = `var(--color-${category.replaceAll(
    ' ',
    '-'
  )})`;
});

filterCategory.addEventListener('click', (event) => {
  if (event.target.nodeName !== 'BUTTON') {
    return;
  }

  const activeButton = filterCategory.querySelector('.button__filter--active');

  activeButton && activeButton.classList.remove('button__filter--active');

  arrElements.forEach((element) => toggleCategoryFilter(false, element));

  if (activeButton && activeButton.contains(event.target)) {
    return;
  } else {
    event.target.classList.add('button__filter--active');
  }

  const selectedCategory = event.target.dataset.category;

  if (selectedCategory) {
    arrElements
      .filter((element) => determineCategory(element) === selectedCategory)
      .forEach((element) => toggleCategoryFilter(true, element));
  } else {
    arrElements.forEach((element) => toggleCategoryFilter(true, element));
  }
});

function toggleCategoryFilter(isFilterOn, element) {
  const targetCell = periodicTable.querySelector(
    `[data-atomic-num="${element.number}"]`
  );
  isFilterOn
    ? (targetCell.style[
        'background-color'
      ] = `var(--color-${targetCell.dataset.category})`)
    : (targetCell.style['background-color'] = 'var(--color-default-cell)');
}

// Add phase filter
const setPhase = new Set(['solid', 'liquid', 'gas', 'unknown']);

let tempKelvin = 300;

const filterPhase = document.createElement('div');
filterPhase.classList.add('container__filter__phase');
filterContainer.appendChild(filterPhase);
filterPhase.innerHTML = `
  <form id="getTemp">
    <input type="number" id="temperature" placeholder="Temperature (Kelvin)" />
  </form>`;

filterPhase.addEventListener('submit', (event) => {
  if (event.target.id !== 'getTemp') {
    return;
  }

  event.preventDefault();
  tempKelvin = document.querySelector('#temperature').value;
  buttonFilterPhase.textContent = `Phase at ${tempKelvin}K`;

  const activeButton = filterPhase.querySelector('.button__filter--active');

  if (!activeButton) {
    return;
  }

  const selectedPhase = activeButton.dataset.phase;

  if (selectedPhase) {
    arrElements.forEach((element) =>
      togglePhaseFilter(false, tempKelvin, element)
    );
    arrElements
      .filter(
        (element) => determinePhase(tempKelvin, element) === selectedPhase
      )
      .forEach((element) => togglePhaseFilter(true, tempKelvin, element));
  } else {
    arrElements.forEach((element) =>
      togglePhaseFilter(true, tempKelvin, element)
    );
  }

  event.target.reset();
  event.target.focus();
});

const buttonFilterPhase = createButton(
  `Phase at ${tempKelvin}K`,
  'button__filter',
  filterPhase
);

[...setPhase].forEach((phase) => {
  const buttonPhase = createButton(phase, 'button__filter__phase', filterPhase);

  buttonPhase.setAttribute('data-phase', phase);

  buttonPhase.style['border'] = `3px solid var(--color-${phase})`;
});

filterPhase.addEventListener('click', (event) => {
  if (event.target.nodeName !== 'BUTTON') {
    return;
  }

  const activeButton = filterPhase.querySelector('.button__filter--active');

  activeButton && activeButton.classList.remove('button__filter--active');

  arrElements.forEach((element) =>
    togglePhaseFilter(false, tempKelvin, element)
  );

  if (activeButton && activeButton.contains(event.target)) {
    return;
  } else {
    event.target.classList.add('button__filter--active');
  }

  const selectedPhase = event.target.dataset.phase;

  if (selectedPhase) {
    arrElements
      .filter(
        (element) => determinePhase(tempKelvin, element) === selectedPhase
      )
      .forEach((element) => togglePhaseFilter(true, tempKelvin, element));
  } else {
    arrElements.forEach((element) =>
      togglePhaseFilter(true, tempKelvin, element)
    );
  }
});

function togglePhaseFilter(isFilterOn, tempKelvin, element) {
  const targetCell = periodicTable.querySelector(
    `[data-atomic-num="${element.number}"]`
  );
  isFilterOn
    ? (targetCell.style['border-color'] = `var(--color-${determinePhase(
        tempKelvin,
        element
      )})`)
    : (targetCell.style['border-color'] = 'transparent');
}

function determinePhase(tempKelvin, element) {
  if (!element.melt && !element.boil) {
    return 'unknown';
  }

  if (!element.melt) {
    return tempKelvin < element.boil ? 'unknown' : 'gas';
  }

  if (!element.boil) {
    return tempKelvin < element.melt ? 'solid' : 'unknown';
  }

  if (tempKelvin === element.melt && tempKelvin === element.boil) {
    return 'solid gas';
  }

  if (tempKelvin === element.melt) {
    return 'solid liquid';
  }

  if (tempKelvin === element.boil) {
    return 'liquid gas';
  }

  if (tempKelvin < element.melt) {
    return 'solid';
  } else if (tempKelvin < element.boil) {
    return 'liquid';
  } else if (tempKelvin > element.boil) {
    return 'gas';
  } else {
    return 'unknown';
  }
}
