'use strict';
import elements from './elements.json' assert { type: 'json' };

const arrElements = elements.elements;

function createTable(id, rowNum, colNum, rowHead = 0, colHead = 0) {
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
  document.body.appendChild(table);
}

createTable('periodic-table', 7, 32, 2, 1);
