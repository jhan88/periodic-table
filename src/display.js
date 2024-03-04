'use strict';

export class Display {
  constructor() {
    this.display = document.querySelector('.container__display');
  }

  show(element) {
    this.display.innerHTML = `
    <ul class="display__list">
      <li class="display__item">Name:\t\t\t${element.name}</li>
      <li class="display__item">Symbol:\t\t\t${element.symbol}</li>
      <li class="display__item">Atomic number:\t${element.number}</li>
      <li class="display__item">Atomic mass:\t${element.atomic_mass}u</li>
      <li class="display__item">Category:\t\t${element.category}</li>
      <li class="display__item"><a href=${element.source} target="_blank" class="link-wikipedia">Find the wikipedia page for ${element.name}</a></li>
    </ul>
  `;
  }

  reset() {
    this.display.innerHTML = '';
  }
}
