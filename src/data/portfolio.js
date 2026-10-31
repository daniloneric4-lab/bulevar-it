/**
 * Portfolio data — 9 real projects with live links and thumbnails
 * 
 * @typedef {Object} Project
 * @property {string} name        — Naziv projekta
 * @property {string} category    — Kategorija: 'web' | 'webapp' | 'automation' | 'software'
 * @property {string} description — Kratak opis projekta
 * @property {string} thumbnail   — Putanja do thumbnail slike
 * @property {string} link        — URL ka live projektu
 */

export const projects = [
  {
    name: 'Mango Event System',
    category: 'webapp',
    description: 'Kompletan digitalni sistem za festivale i sajmove: sajt i automatizacija odobrenja, uputstava i ugovora za izlagače.',
    thumbnail: '/projects/03-mango-event.png',
    link: 'https://mangoevent.rs/',
  },
  {
    name: 'Ti Si Ovde System',
    category: 'webapp',
    description: 'Povezan digitalni sistem za mentalno blagostanje: edukativna platforma i loyalty sistem nagrađivanja klijenata.',
    thumbnail: '/projects/06-ti-si-ovde.png',
    link: 'https://tisiovde.com/',
  },
];

/**
 * Category label & color configuration
 */
export const categoryConfig = {
  web:        { label: 'INTERNET SAJT',  colorClass: 'web' },
  webapp:     { label: 'WEB APLIKACIJA', colorClass: 'webapp' },
  software:   { label: 'SOFTVER',        colorClass: 'software' },
  automation: { label: 'AUTOMATIZACIJA', colorClass: 'automation' },
};
