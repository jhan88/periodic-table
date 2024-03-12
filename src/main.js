'use strict';
import { pTable } from './periodicTable.js';
import {
  categorySet,
  determineCategory,
  phaseSet,
  determinePhase,
} from './atom.js';
import { Display } from './display.js';
import { Filter } from './filter.js';

// Display element information in detail
const display = new Display();
pTable.setClick((event) => {
  display.reset();

  const cellActive = document.querySelector('.atom--active');
  cellActive && cellActive.classList.remove('atom--active');
  if (cellActive && cellActive.contains(event.target)) {
    return;
  }

  const atomNum = event.target.dataset.atomNum;
  if (!atomNum) {
    return;
  }

  event.target.classList.add('atom--active');
  display.show(atomNum);
});

// Filter category
const filterCategory = new Filter('category', categorySet);

pTable
  .apply((cell) => {
    const atomNum = Number(cell.dataset.atomNum);
    const category = determineCategory(atomNum);
    cell.setAttribute('data-category', category.replaceAll(' ', '-'));
  })
  .toCells('.atom');

filterCategory.setClick((event) => {
  const activeButton = filterCategory.active();
  activeButton && filterCategory.off(activeButton, categoryOff);

  if (activeButton && activeButton.contains(event.target)) {
    return;
  }

  const targetButton = event.target;
  const category = event.target.dataset.category;

  if (!category) {
    return;
  }

  filterCategory.on(targetButton, categoryOn);
});

function categoryOn(button) {
  const selectedCategory = button.dataset.category;

  pTable
    .apply((cell) => {
      if (
        selectedCategory === 'all' ||
        cell.dataset.category === selectedCategory
      ) {
        cell.classList.add(`category--${cell.dataset.category}`);
      }
    })
    .toCells('.atom');
}

function categoryOff() {
  pTable
    .apply((cell) => {
      cell.classList.remove(`category--${cell.dataset.category}`);
    })
    .toCells('.atom');
}

// Filter Phase
const filterPhase = new Filter(
  'phase',
  phaseSet.filter((phase) => !phase.includes('-'))
);

let tempKelvin = 300;

filterPhase.button('.phase--all').innerHTML = `
  Phase at <div class="phase__temp">
    <form id="temp--number">
      <input type="number" step="0.0001" id="temp" class="phase__temp__input" placeholder="${tempKelvin}" />
    </form>
  </div>K`;

filterPhase.setSubmit((event) => {
  if (!event.target.id === 'temp--number') {
    return;
  }

  event.preventDefault();

  const input = document.querySelector('#temp');
  tempKelvin = Number(input.value);
  input.setAttribute('placeholder', tempKelvin);

  if (!filterPhase.active()) {
    return;
  }

  const activeButton = filterPhase.active();
  if (!activeButton) {
    return;
  }
  filterPhase.off(activeButton, phaseOff);

  filterPhase.on(activeButton, phaseOn);

  event.target.reset();
  event.target.focus();
});

filterPhase.setClick((event) => {
  if (document.querySelector('#temp--number').contains(event.target)) {
    return;
  }

  const activeButton = filterPhase.active();

  activeButton && filterPhase.off(activeButton, phaseOff);

  if (activeButton && activeButton.contains(event.target)) {
    return;
  }

  const targetButton = event.target;
  const phase = event.target.dataset.phase;

  if (!phase) {
    return;
  }

  filterPhase.on(targetButton, phaseOn);
});

function phaseOn(button) {
  const selectedPhase = button.dataset.phase;
  pTable
    .apply((cell) => {
      const atomNum = Number(cell.dataset.atomNum);
      const phase = determinePhase(tempKelvin, atomNum);

      if (selectedPhase === 'all' || phase.includes(selectedPhase)) {
        cell.classList.add(`phase--${phase}`);
      }
    })
    .toCells('.atom');
}

function phaseOff() {
  pTable
    .apply((cell) => {
      phaseSet.forEach((phase) => cell.classList.remove(`phase--${phase}`));
    })
    .toCells('.atom');
}

// Hide Filters
const containerFilter = document.querySelector('.container__filter');
const toggleFilter = document.querySelector('.header__button__filter');

toggleFilter.addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('header__button__filter--active');
  containerFilter.classList.toggle('container__filter--active');
  const filterX = containerFilter.classList.contains(
    'container__filter--active'
  )
    ? window.scrollX
    : 0;
  containerFilter.style.transform = `translate(${filterX}px, -1rem)`;
});
