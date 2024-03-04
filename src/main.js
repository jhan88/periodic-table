'use strict';
import elements from './elements.json' assert { type: 'json' };
import { TableBuilder } from './table.js';
import { Display } from './display.js';
import { Filter } from './filter.js';

const arrElements = elements.elements.slice(0, 118);
const NUM_PERIOD = 7;
const NUM_GROUP = 18;
const NUM_FBLOCK = 14;
const NUM_ELEMENT = 118;

const pTable = new TableBuilder()
  .withClassName('periodic-table')
  .withNumRow(NUM_PERIOD)
  .withNumCol(NUM_GROUP + NUM_FBLOCK)
  .withParent(document.querySelector('.container__periodic-table'))
  .build();

pTable.apply(addPeriod).toCells('th', 'td');
pTable.apply(addGroup).toCells('th', 'td');

for (let atomNum = 1; atomNum <= NUM_ELEMENT; atomNum++) {
  addAtomNum(atomNum);
}

function addPeriod(cell) {
  const row = Number(cell.dataset.row);
  if (row >= 0 && row < NUM_PERIOD) {
    cell.setAttribute('data-period', row + 1);
  }
}

function addGroup(cell) {
  const col = Number(cell.dataset.col);
  if (col >= 0) {
    if (col < 2) {
      cell.setAttribute('data-group', col + 1);
    } else if (col < 2 + NUM_FBLOCK) {
      cell.setAttribute('data-fblock', col - 1);
    } else {
      cell.setAttribute('data-group', col + 1 - NUM_FBLOCK);
    }
  }
}

function addAtomNum(atomNum) {
  const element = arrElements[atomNum - 1];
  const period = element.period;
  const group = element.group;
  const fblock =
    element.category === 'lanthanide' || element.category === 'actinide'
      ? countBalanceElectron(element.electron_configuration_semantic) - 2
      : 0;

  pTable.cell({ period, fblock })
    ? pTable
        .apply((cell) => {
          cell.setAttribute('data-atom-num', atomNum);
        })
        .toCell({ period, fblock })
    : pTable
        .apply((cell) => {
          cell.setAttribute('data-atom-num', atomNum);
        })
        .toCell({ period, group });
}

function countBalanceElectron(electron_configuration_semantic) {
  const configBalance = electron_configuration_semantic
    .split(' ')
    .filter(
      (config) =>
        config.includes('f') ||
        config.includes('d') ||
        config.includes('p') ||
        config.includes('s')
    );

  const balanceElectron = configBalance.reduce((previous, current) => {
    const count = Number(
      current
        .replaceAll('f', '*')
        .replaceAll('d', '*')
        .replaceAll('p', '*')
        .replaceAll('s', '*')
        .split('*')
        .at(-1)
    );
    return previous + count;
  }, 0);

  return balanceElectron;
}

// Frame Cells
// write periods and groups
pTable
  .apply((cell) => {
    if (cell.dataset.col === '-1' && cell.dataset.period) {
      cell.textContent = cell.dataset.period;
    } else if (cell.dataset.row === '-1' && cell.dataset.group) {
      cell.textContent = cell.dataset.group;
    }
  })
  .toCells('th');

// Fill element information
pTable
  .apply((cell) => {
    const atomNum = cell.dataset.atomNum;
    if (!atomNum) {
      return;
    }
    cell.classList.add('cell__info');
    cell.innerHTML = `
      <span class="cell__info__atom-num">${atomNum}</span>
      <p class="cell__info__symbol">${arrElements[atomNum - 1].symbol}</p>
    `;
  })
  .toCells('td');

// hide unncessary cells
pTable
  .apply((cell) => {
    if (cell.dataset.row < 5 && cell.dataset.fblock) {
      cell.classList.add('cell--none');
    }
  })
  .toCells('th');
pTable
  .apply((cell) => {
    if (!cell.dataset.atomNum) {
      cell.dataset.row < 5 && cell.dataset.fblock
        ? cell.classList.add('cell--none')
        : cell.classList.add('cell--hidden');
    }
  })
  .toCells('td');

// create style div containers for f-block element cells
const containerFblock = document.createElement('div');
containerFblock.classList.add('container__fblock');
pTable.table.appendChild(containerFblock);

const containerLanthanide = document.createElement('div');
containerLanthanide.classList.add('container__lanthanide');
containerFblock.appendChild(containerLanthanide);

const containerActinide = document.createElement('div');
containerActinide.classList.add('container__actinide');
containerFblock.appendChild(containerActinide);

// add lanthanide cells to container lanthanide
pTable
  .apply((cell) => {
    if (cell.dataset.period === '6' && cell.dataset.fblock) {
      containerLanthanide.appendChild(cell);
    }
  })
  .toCells('.cell__info');

// add actinide cells to container actinide
pTable
  .apply((cell) => {
    if (cell.dataset.period === '7' && cell.dataset.fblock) {
      containerActinide.appendChild(cell);
    }
  })
  .toCells('.cell__info');

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
  display.show(arrElements[atomNum - 1]);
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
  const category = arrElements[atomNum - 1].category;
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
  const melt = arrElements[atomNum - 1].melt;
  const boil = arrElements[atomNum - 1].boil;

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
