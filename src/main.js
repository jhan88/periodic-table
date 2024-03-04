'use strict';
import { pTable, atom } from './periodicTable.js';
import { Display } from './display.js';
import { Filter } from './filter.js';

// Display element information in detail
const display = new Display();
pTable.setClick((event) => {
  display.reset();

  const cellActive = document.querySelector('.cell__info--active');
  cellActive && cellActive.classList.remove('cell__info--active');
  if (cellActive && cellActive.contains(event.target)) {
    return;
  }

  const atomNum = event.target.dataset.atomNum;
  if (!atomNum) {
    return;
  }

  event.target.classList.add('cell__info--active');
  display.show(atom(atomNum));
});

// Filter category
const filterCategory = new Filter(
  'category',
  new Set([
    'alkali metal',
    'alkaline earth metal',
    'transition metal',
    'lanthanide',
    'actinide',
    'post-transition metal',
    'metalloid',
    'diatomic nonmetal',
    'polyatomic nonmetal',
    'noble gas',
  ])
);

pTable
  .apply((cell) => {
    const atomNum = Number(cell.dataset.atomNum);
    const category = determineCategory(atomNum);
    cell.setAttribute('data-category', category.replaceAll(' ', '-'));
  })
  .toCells('.cell__info');

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
    .toCells('.cell__info');
}

function categoryOff() {
  pTable
    .apply((cell) => {
      cell.classList.remove(`category--${cell.dataset.category}`);
    })
    .toCells('.cell__info');
}

function determineCategory(atomNum) {
  const category = atom(atomNum).category;
  if (filterCategory.set.has(category)) {
    return category;
  }

  for (let member of filterCategory.set) {
    if (category.includes(member)) {
      return member;
    }
  }
}

// Filter Phase
const filterPhase = new Filter(
  'phase',
  new Set(['solid', 'liquid', 'gas', 'unknown'])
);

let tempKelvin = 300;

filterPhase.button('.phase--all').innerHTML = `
  Phase at <div class="phase__temp">
    <form id="getTemp">
      <input type="number" step="0.0001" id="temp" class="phase__temp__input" placeholder="${tempKelvin}" />
    </form>
  </div>K`;

filterPhase.setSubmit((event) => {
  if (!event.target.id === 'getTemp') {
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
  if (document.querySelector('#getTemp').contains(event.target)) {
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
    .toCells('.cell__info');
}

function phaseOff() {
  pTable
    .apply((cell) => {
      cell.classList.remove(
        'phase--solid',
        'phase--liquid',
        'phase--gas',
        'phase--solid-liquid',
        'phase--solid-gas',
        'phase--liquid-gas',
        'phase--unknown'
      );
    })
    .toCells('.cell__info');
}

function determinePhase(tempKelvin, atomNum) {
  const melt = atom(atomNum).melt;
  const boil = atom(atomNum).boil;

  if (!melt && !boil) {
    return 'unknown';
  }

  if (!melt) {
    return tempKelvin <= boil ? 'unknown' : 'gas';
  }

  if (!boil) {
    return tempKelvin <= melt ? 'solid' : 'unknown';
  }

  if (tempKelvin === melt && tempKelvin === boil) {
    return 'solid-gas';
  }

  if (tempKelvin === melt) {
    return 'solid-liquid';
  }

  if (tempKelvin === boil) {
    return 'liquid-gas';
  }

  if (tempKelvin < melt) {
    return 'solid';
  } else if (tempKelvin < boil) {
    return 'liquid';
  } else if (tempKelvin > boil) {
    return 'gas';
  } else {
    return 'unknown';
  }
}
