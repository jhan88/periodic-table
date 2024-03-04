'use strict';

import { TableBuilder } from './table.js';
import elements from './elements.json' assert { type: 'json' };

const NUM_PERIOD = 7;
const NUM_GROUP = 18;
const NUM_FBLOCK = 14;
const NUM_ELEMENT = 118;

export function atom(atomNum) {
  return elements.elements[atomNum - 1];
}

export const pTable = new TableBuilder()
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
  const element = atom(atomNum);
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
      <p class="cell__info__symbol">${atom(atomNum).symbol}</p>
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
