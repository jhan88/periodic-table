'use strict';

export default class TableBuilder {
  withClassName(className) {
    this.className = className;
    return this;
  }

  withNumRow(num) {
    this.numRow = num;
    return this;
  }

  withNumCol(num) {
    this.numCol = num;
    return this;
  }

  withRowHead(num = 1) {
    this.rowHead = num;
    return this;
  }

  withColHead(num = 1) {
    this.colHead = num;
    return this;
  }

  withParent(parentNode = document.body) {
    this.parentNode = parentNode;
    return this;
  }

  build() {
    return new Table(
      this.className,
      this.numRow,
      this.numCol,
      this.rowHead,
      this.colHead,
      this.parentNode
    );
  }
}

class Table {
  constructor(
    className,
    numRow,
    numCol,
    rowHead = 1,
    colHead = 1,
    parent = document.body
  ) {
    this.numRow = numRow;
    this.numCol = numCol;
    this.rowHead = rowHead;
    this.colHead = colHead;

    this.table = document.createElement('table');
    this.table.classList.add(className);
    parent.appendChild(this.table);

    this.tbody = this.createTbody();
    this.table.appendChild(this.tbody);
  }

  createTbody() {
    const tbody = document.createElement('tbody');
    for (let i = 0 - this.rowHead; i < this.numRow; i++) {
      const tr = this.createTr(i);
      tbody.appendChild(tr);
    }
    return tbody;
  }

  createTr(row) {
    const tr = document.createElement('tr');
    tr.setAttribute('data-row', row);
    for (let j = 0 - this.colHead; j < this.numCol; j++) {
      const cell =
        row < 0 || j < 0 ? this.createTh(row, j) : this.createTd(row, j);
      tr.appendChild(cell);
    }
    return tr;
  }

  createTh(row, col) {
    const th = document.createElement('th');
    th.setAttribute('data-row', row);
    th.setAttribute('data-col', col);
    return th;
  }

  createTd(row, col) {
    const td = document.createElement('td');
    td.setAttribute('data-row', row);
    td.setAttribute('data-col', col);
    return td;
  }

  table() {
    return this.table;
  }
}
