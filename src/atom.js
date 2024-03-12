'use strict';
import elements from './elements.json' assert { type: 'json' };

export function atom(atomNum) {
  return elements.elements[atomNum - 1];
}

export function createCellInfo(atomNum = null, showInfo = 'guide') {
  const element = atom(atomNum);

  const container = document.createElement('div');
  container.classList.add('cell__info');

  switch (showInfo) {
    case 'guide':
      container.innerHTML = `
        <div class="cell__info__header" style="font-size: calc(var(--cell-font-size) * 0.6)">
            <span class="cell__info__atom-num">Number</span>
            <span class="cell__info__atom-mass">Mass (u)</span>
        </div>
        <p class="cell__info__symbol" style="font-size: calc(var(--cell-font-size) * 1.2)">Symbol</p>
        <p class="cell__info__name" >Name</p>
        <p class="cell__info__category" >Category</p>
      `;
      container.style.background = 'var(--color-default-cell-light)';
      container.style.opacity = 0.5;
      break;
    case 'detail':
      container.innerHTML = `
        <div class="cell__info__header">
            <span class="cell__info__atom-num">${element.number}</span>
            <span class="cell__info__atom-mass">${element.atomic_mass.toPrecision(
              5
            )}u</span>
        </div>
        <p class="cell__info__symbol">${element.symbol}</p>
        <p class="cell__info__name">${element.name}</p>
        <p class="cell__info__category">${determineCategory(atomNum)}</p>
      `;
      container.classList.add(
        `category--${determineCategory(atomNum).replaceAll(' ', '-')}`
      );
      break;
    case 'summary':
    default:
      container.innerHTML = `
        <div class="cell__info__header">
            <span class="cell__info__atom-num">${element.number}</span>
        </div>
        <p class="cell__info__symbol">${element.symbol}</p>
      `;
  }

  return container;
}

export function createListInfo(atomNum = null, showInfo = 'guide') {
  const element = atom(atomNum);

  const listInfo = document.createElement('ul');
  listInfo.classList.add('display__list');

  switch (showInfo) {
    case 'guide':
      listInfo.innerHTML = `
        <li class="display__item"> </li>
        <li class="display__item">Melting point:</li>
        <li class="display__item">Boiling point:</li>
        <li class="display__item">Electron affinity:</li>
        <li class="display__item">Electronegativity:</li>
        <li class="display__item">Electron configuration:</li>
      `;
      listInfo.style.opacity = 0.5;
      break;
    case 'detail':
    case 'summary':
    default:
      listInfo.innerHTML = `
        <li class="display__item"><a href=${
          element.source
        } target="_blank" class="link-wikipedia">Find the wikipedia page for ${
        element.name
      }</a></li>
        <li class="display__item">Melting point:\t\t\t${
          element.melt ? element.melt + 'K' : 'unknown'
        }</li>
        <li class="display__item">Boiling point:\t\t\t${
          element.boil ? element.boil + 'K' : 'unknown'
        }</li>
        <li class="display__item">Electron affinity:\t\t\t${
          element.electron_affinity
            ? element.electron_affinity + 'kj/mol'
            : 'unknown'
        }</li>
        <li class="display__item">Electronegativity:\t\t\t${
          element.electronegativity_pauling
            ? element.electronegativity_pauling
            : 'unknown'
        }</li>
        <li class="display__item">Electron configuration:\t${
          element.electron_configuration_semantic
        }</li>
      `;
  }
  return listInfo;
}

export const categorySet = [
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
];

export function determineCategory(atomNum) {
  const category = atom(atomNum).category;
  if (categorySet.includes(category)) {
    return category;
  }

  for (let member of categorySet) {
    if (category.includes(member)) {
      return member;
    }
  }
}

export const phaseSet = [
  'solid',
  'solid-liquid',
  'liquid',
  'liquid-gas',
  'solid-gas',
  'gas',
  'unknown',
];

export function determinePhase(tempKelvin, atomNum) {
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
