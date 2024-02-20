'use strict';
import elements from './elements.json' assert { type: 'json' };

const arrElements = elements.elements.slice(0, 118);
const periodicTable = document.querySelector('#periodic-table');

// Add category filter
const filterContainer = document.querySelector('.container__filter');

const buttonReset = document.createElement('button');
buttonReset.classList.add('button__reset');
buttonReset.innerHTML = 'RESET FILTERS';
filterContainer.appendChild(buttonReset);

buttonReset.addEventListener('click', () => {
  const cellInactive = document.querySelectorAll('.cell--inactive');
  cellInactive &&
    [...cellInactive].forEach((cell) =>
      cell.classList.remove('cell--inactive')
    );

  const cellPhase = [
    ...document.querySelectorAll('.phase--solid'),
    ...document.querySelectorAll('.phase--liquid'),
    ...document.querySelectorAll('.phase--gas'),
    ...document.querySelectorAll('.phase--unknown'),
  ].filter((element) => element.tagName === 'TD');
  cellPhase.forEach((cell) => {
    cell.classList.remove('phase--solid');
    cell.classList.remove('phase--liquid');
    cell.classList.remove('phase--gas');
    cell.classList.remove('phase--unknown');
  });
});

// Color cells
const setCategory = new Set();
arrElements.forEach((element) => {
  if (!element.category.startsWith('unknown')) {
    setCategory.add(element.category);
  }
});

const arrColorCategory = [
  '#B1B2FF',
  '#cccccc',
  '#D2DAFF',
  '#FFC7C7',
  '#BBDED6',

  '#AAC4FF',
  '#FFB6B9',
  '#FFFF66',
  '#ff7c43',
  '#ffa600',
];

function findCategory(element) {
  if (setCategory.has(element.category)) {
    return element.category;
  } else {
    return [...setCategory].filter((category) =>
      element.category.includes(category)
    )[0];
  }
}

const filterCategory = document.createElement('div');
filterCategory.classList.add('container__filter__category');
filterContainer.appendChild(filterCategory);

const buttonFilterCategory = document.createElement('button');
buttonFilterCategory.setAttribute('class', 'button__filter');
buttonFilterCategory.textContent = 'Category';
filterCategory.appendChild(buttonFilterCategory);

buttonFilterCategory.addEventListener('click', (event) => {
  event.target.classList.toggle('button__filter--active');

  if (event.target.classList.contains('button__filter--active')) {
    arrElements.forEach((element) => {
      const category = findCategory(element);

      const targetCell = table.querySelector(
        `[data-atomic-num="${element.number}"]`
      );

      targetCell.style['background-color'] =
        arrColorCategory[[...setCategory].indexOf(category)];
    });
  } else {
    arrElements.forEach((element) => {
      const targetCell = table.querySelector(
        `[data-atomic-num="${element.number}"]`
      );

      targetCell.style['background-color'] = 'var(--color-light-gray)';
    });
  }
});

[...setCategory].forEach((category) => {
  const buttonCategory = document.createElement('button');
  buttonCategory.classList.add('button__category');
  buttonCategory.setAttribute(
    'data-category',
    `${category.replaceAll(' ', '-')}`
  );
  buttonCategory.innerHTML = category;
  filterCategory.appendChild(buttonCategory);
  buttonCategory.style['background-color'] =
    arrColorCategory[[...setCategory].indexOf(category)];
});

document.addEventListener('click', (event) => {
  const selectedCategory = event.target.dataset.category;
  if (selectedCategory) {
    arrElements.forEach((element) => {
      findCategory(element).replaceAll(' ', '-') === selectedCategory
        ? document
            .querySelector(`.atomic-num-${element.number}`)
            .classList.remove('cell--inactive')
        : document
            .querySelector(`.atomic-num-${element.number}`)
            .classList.add('cell--inactive');
    });
  }
});

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
