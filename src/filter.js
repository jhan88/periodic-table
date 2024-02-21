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

console.log(arrElements.filter((element) => element.melt === null));
console.log(arrElements.filter((element) => element.boil === null));
console.log(
  arrElements.filter(
    (element) => element.boil === null && element.melt === null
  )
);

let tempKelvin = 300;

const filterPhase = document.createElement('div');
filterPhase.classList.add('container__filter__phase');
filterContainer.appendChild(filterPhase);

const buttonFilterPhase = document.createElement('button');
buttonFilterPhase.setAttribute('class', 'button__filter');
buttonFilterPhase.textContent = `Phase at ${tempKelvin}K`;
filterPhase.appendChild(buttonFilterPhase);

buttonFilterPhase.addEventListener('click', (event) => {
  event.target.classList.toggle('button__filter--active');

  if (event.target.classList.contains('button__filter--active')) {
    arrElements.forEach((element) => {
      const currentPhase = determinePhase(element, tempKelvin);
      document
        .querySelector(`.atomic-num-${element.number}`)
        .classList.add(`phase--${currentPhase}`);
    });
  } else {
    arrElements.forEach((element) => {
      const currentPhase = determinePhase(element, tempKelvin);
      document
        .querySelector(`.atomic-num-${element.number}`)
        .classList.remove(`phase--${currentPhase}`);
    });
  }
});

const formTemp = document.createElement('form');
formTemp.setAttribute('id', 'getTemp');
filterPhase.appendChild(formTemp);

const inputTemp = document.createElement('input');
inputTemp.setAttribute('type', 'number');
inputTemp.setAttribute('id', 'temperature');
inputTemp.setAttribute('placeholder', 'Temperature (Kelvin)');
formTemp.appendChild(inputTemp);

document.getElementById('getTemp').addEventListener('submit', (event) => {
  event.preventDefault();
  tempKelvin = document.getElementById('temperature').value;
  buttonFilterPhase.textContent = `Phase at ${tempKelvin}K`;
});

[...setPhase].forEach((phase) => {
  const buttonPhase = document.createElement('button');
  buttonPhase.classList.add('button__phase');
  buttonPhase.innerHTML = phase;
  filterPhase.appendChild(buttonPhase);
  buttonPhase.setAttribute('data-phase', phase);
  buttonPhase.classList.add(`phase--${phase}`);
});

function determinePhase(element, tempKelvin) {
  if (element.melt && tempKelvin <= element.melt) {
    return 'solid';
  } else if (element.boil && tempKelvin <= element.boil) {
    return 'liquid';
  } else if (element.boil && tempKelvin > element.boil) {
    return 'gas';
  } else {
    return 'unknown';
  }
}

document.addEventListener('click', (event) => {
  const selectedPhase = event.target.dataset.phase;
  if (selectedPhase) {
    arrElements.forEach((element) => {
      const currentPhase = determinePhase(element, tempKelvin);
      document
        .querySelector(`.atomic-num-${element.number}`)
        .classList.add(`phase--${currentPhase}`);
      currentPhase === selectedPhase
        ? document
            .querySelector(`.atomic-num-${element.number}`)
            .classList.remove('cell--inactive')
        : document
            .querySelector(`.atomic-num-${element.number}`)
            .classList.add('cell--inactive');
    });
  }
});
