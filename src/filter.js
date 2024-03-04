'use strict';

export class Filter {
  constructor(title, set) {
    this.title = title;
    this.set = set;

    this.container = document.createElement('div');
    this.container.classList.add(`container__filter__${title}`);
    document.querySelector('.container__filter').appendChild(this.container);

    ['all', ...set].forEach((member) => {
      this.createButton(
        member === 'all' ? this.title : member,
        member.replaceAll(' ', '-')
      );
    });

    this.container.addEventListener('click', (event) => {
      this.onClick && this.onClick(event);
    });

    this.container.addEventListener('submit', (event) => {
      this.onSubmit && this.onSubmit(event);
    });
  }

  createButton(content, filterName) {
    const button = document.createElement('button');
    button.textContent = content;
    button.classList.add('button__filter', `${this.title}--${filterName}`);
    button.setAttribute(`data-${this.title}`, filterName);
    this.container.appendChild(button);
  }

  setClick(onClick) {
    this.onClick = onClick;
  }

  setSubmit(onSubmit) {
    this.onSubmit = onSubmit;
  }

  button(selector) {
    return this.container.querySelector(selector);
  }

  active() {
    return this.button('.button__filter--active');
  }

  on(button, callback = null) {
    button.classList.add('button__filter--active');
    callback && callback(button);
  }

  off(button, callback = null) {
    button.classList.remove('button__filter--active');
    callback && callback(button);
  }
}
