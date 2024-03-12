'use strict';
import { createCellInfo, createListInfo } from './atom.js';

export class Display {
  constructor() {
    this.display = document.querySelector('.container__display');
    this.reset();
  }

  show(element) {
    this.display.innerHTML = '';

    this.display.appendChild(createCellInfo(element, 'detail'));

    this.display.appendChild(createListInfo(element, 'detail'));
  }

  reset() {
    this.display.innerHTML = '';

    this.display.appendChild(createCellInfo());

    this.display.appendChild(createListInfo());
  }
}
