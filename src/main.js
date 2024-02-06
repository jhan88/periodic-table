'use strict';
import elements from './elements.json' assert { type: 'json' };

const arrElements = elements.elements.slice(0, 118);
const numPeriod = 7;
const numGroup = 18;
const numFblock = 14;

const periodicTable = createTable(
  'periodic-table',
  numPeriod,
  numGroup + numFblock,
  1,
  1
);

addPeriod(periodicTable);
addGroup(periodicTable);
arrElements.forEach((element) => addAtomicNum(periodicTable, element));
arrElements.forEach((element) => addElement(element));

function createTable(
  id,
  rowNum,
  colNum,
  rowHead = 0,
  colHead = 0,
  parent = document.body
) {
  const table = document.createElement('table');
  table.setAttribute('id', id);
  const tableBody = document.createElement('tbody');

  for (let i = 0 - rowHead; i < rowNum; i++) {
    const tableRow = document.createElement('tr');
    tableRow.setAttribute('data-row', i);
    for (let j = 0 - colHead; j < colNum; j++) {
      const tableCell =
        i < 0 || j < 0
          ? document.createElement('th')
          : document.createElement('td');
      tableCell.setAttribute('data-row', i);
      tableCell.setAttribute('data-column', j);
      tableRow.appendChild(tableCell);
    }
    tableBody.appendChild(tableRow);
  }
  table.appendChild(tableBody);

  return parent.appendChild(table);
}

function addPeriod(table) {
  const listTr = table.querySelectorAll('tr');
  const listTh = table.querySelectorAll('th');
  const listTd = table.querySelectorAll('td');

  [...listTr, ...listTh, ...listTd].forEach((cell) => {
    const rowNum = Number(cell.dataset.row);
    if (rowNum >= 0 && rowNum < numPeriod) {
      cell.setAttribute('data-period', rowNum + 1);
    }
  });
}

function addGroup(table) {
  const listTr = table.querySelectorAll('tr');
  const listTh = table.querySelectorAll('th');
  const listTd = table.querySelectorAll('td');

  [...listTr, ...listTh, ...listTd].forEach((cell) => {
    const colNum = Number(cell.dataset.column);
    if (colNum >= 0) {
      if (colNum < 2) {
        cell.setAttribute('data-group', colNum + 1);
      } else if (colNum < 2 + numFblock) {
        cell.setAttribute('data-fblock', colNum - 1);
      } else {
        cell.setAttribute('data-group', colNum + 1 - numFblock);
      }
    }
  });
}

function addAtomicNum(table, element) {
  const atomicNum = element.number;
  const period = element.period;
  const group = element.group;
  const isLanthanide = element.category === 'lanthanide';
  const isActinide = element.category === 'actinide';

  if (isLanthanide || isActinide) {
    const balanceElectron = countBalanceElectronLaAc(
      element.electron_configuration_semantic
    );

    const targetCell =
      table.querySelector(
        `[data-period="${period}"][data-fblock="${balanceElectron}"]`
      ) ||
      table.querySelector(`[data-period="${period}"][data-group="${group}"]`);
    if (targetCell) {
      targetCell.setAttribute('data-atomic-num', atomicNum);
    }
  } else {
    const targetCell = table.querySelector(
      `[data-period="${period}"][data-group="${group}"]`
    );
    if (targetCell) {
      targetCell.setAttribute('data-atomic-num', atomicNum);
    }
  }
}

function countBalanceElectronLaAc(electron_configuration_semantic) {
  const configBalance = electron_configuration_semantic
    .split(' ')
    .filter(
      (config) =>
        config.includes('f') || config.includes('d') || config.includes('p')
    );

  const balanceElectron = configBalance.reduce((previous, current) => {
    const count = Number(
      current
        .replaceAll('f', '*')
        .replaceAll('d', '*')
        .replaceAll('p', '*')
        .split('*')
        .at(-1)
    );
    return previous + count;
  }, 0);

  return balanceElectron;
}

function addElement(element) {
  const atomicNum = element.number;
  document.querySelector(`[data-atomic-num="${atomicNum}"]`).innerHTML =
    element.symbol;
}

// Frame Cells
// write periods
[...periodicTable.querySelectorAll('th')]
  .filter((cell) => cell.dataset.column === '-1' && cell.dataset.period)
  .forEach((cell) => (cell.textContent = cell.dataset.period));

// write groups
[...periodicTable.querySelectorAll('th')]
  .filter((cell) => cell.dataset.row === '-1' && cell.dataset.group)
  .forEach((cell) => (cell.textContent = cell.dataset.group));

// hide unnecessary cells
[
  ...periodicTable.querySelectorAll('th'),
  ...periodicTable.querySelectorAll('td'),
]
  .filter((cell) => cell.dataset.row < 5 && cell.dataset.fblock)
  .forEach((cell) => cell.classList.add('cell--none'));

[...periodicTable.querySelectorAll('td')]
  .filter((cell) => !cell.dataset.atomicNum)
  .forEach((cell) => cell.classList.add('cell--hidden'));

// create style div containers for f-block element cells
const containerFblock = document.createElement('div');
const containerLanthanide = document.createElement('div');
const containerActinide = document.createElement('div');

containerFblock.classList.add('container__fblock');
containerLanthanide.classList.add('container__lanthanide');
containerActinide.classList.add('container__actinide');

periodicTable.appendChild(containerFblock);
containerFblock.appendChild(containerLanthanide);
containerFblock.appendChild(containerActinide);

// add lanthanide cells to container lanthanide
[...periodicTable.querySelectorAll('td')]
  .filter((cell) => cell.dataset.period == 6 && cell.dataset.fblock)
  .forEach((cell) =>
    document.querySelector('.container__lanthanide').appendChild(cell)
  );

// add actinide cells to container actinide
[...periodicTable.querySelectorAll('td')]
  .filter((cell) => cell.dataset.period == 7 && cell.dataset.fblock)
  .forEach((cell) =>
    document.querySelector('.container__actinide').appendChild(cell)
  );

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

arrElements.forEach((element) => {
  const category = findCategory(element);

  const targetCell = periodicTable.querySelector(
    `[data-atomic-num="${element.number}"]`
  );

  targetCell.style['background-color'] =
    arrColorCategory[[...setCategory].indexOf(category)];
});