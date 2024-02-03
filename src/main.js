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
