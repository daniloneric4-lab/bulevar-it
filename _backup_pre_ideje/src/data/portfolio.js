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

/** @type {Project[]} */
export const projects = [
  {
    name: "Petra's Stolovi",
    category: 'web',
    description: 'Sajt za ručno rađene stolove od punog drveta i epoxy smole.',
    thumbnail: '/projects/01-petras-stolovi.png',
    link: 'https://petras-stolovi.com/',
  },
  {
    name: 'Brookie Nice',
    category: 'web',
    description: 'Meni za američki NYC style punjene keksiće — prvi u Srbiji.',
    thumbnail: '/projects/02-brookie-nice.png',
    link: 'https://brookienice.com/',
  },
  {
    name: 'Mango Event',
    category: 'web',
    description: 'Sajt za organizaciju festivala, bazara i sajmova koji podržavaju domaće brendove.',
    thumbnail: '/projects/03-mango-event.png',
    link: 'https://mangoevent.rs/',
  },
  {
    name: 'Sanja Venčanice i Dekoracije',
    category: 'web',
    description: 'Sajt za venčanice i dekoracije za venčanja — elegancija i romantika.',
    thumbnail: '/projects/04-sanja-vencanice.png',
    link: 'https://vencanicesanjaidekoracije.com/',
  },
  {
    name: 'Vukov Hair Studio',
    category: 'web',
    description: 'Sajt za hair studio — moderan dizajn i elegantna estetika.',
    thumbnail: '/projects/05-vukov-hair-studio.png',
    link: 'https://hairstudiovukov.com/',
  },
  {
    name: 'Ti Si Ovde',
    category: 'web',
    description: 'Sajt za mentalno blagostanje — mirno, toplo i inspirativno digitalno utočište.',
    thumbnail: '/projects/06-ti-si-ovde.png',
    link: 'https://tisiovde.com/',
  },
  {
    name: 'Ti Si Ovde — Loyalty',
    category: 'webapp',
    description: 'Loyalty aplikacija koja nagrađuje verne klijente — sakupljanje poena, personalizovane pogodnosti i digitalna kartica u džepu.',
    thumbnail: '/projects/07-ti-si-ovde-loyalty.png',
    link: 'https://loyalty.tisiovde.com/',
  },
  {
    name: 'SOS PRO',
    category: 'web',
    description: 'Sajt za pomoć nakon saobraćajne nezgode — procena i naplata štete, jasan proces i brz kontakt 0-24.',
    thumbnail: '/projects/08-sos-pro.jpg',
    link: 'https://sospro.info/',
  },
  {
    name: 'Mango Event — Automatizacija',
    category: 'automation',
    description: 'Automatizacija za sajam koja izlagačima šalje odobrenje, uputstva i unapred popunjen ugovor — bez ijednog ručnog koraka.',
    thumbnail: '/projects/09-mango-event-automatizacija.png',
    link: 'https://mangoevent.rs/',
  },
];

/**
 * Category label & color configuration
 */
export const categoryConfig = {
  web:        { label: 'WEB',           colorClass: 'web' },
  webapp:     { label: 'WEB APP',       colorClass: 'webapp' },
  software:   { label: 'SOFTVER',       colorClass: 'software' },
  automation: { label: 'AUTOMATION',    colorClass: 'automation' },
};
