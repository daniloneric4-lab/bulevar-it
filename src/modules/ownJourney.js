/**
 * ownJourney.js — „Own your customer journey“ Section
 * 
 * Replaces the old salon journey with the new multi-stage showcase:
 * 1. Switcher „Smeštaj | Dostava hrane“ (50/50 random start, toggles everything)
 * 2. 3D iPhone 15 Pro Max with platform feed canvas texture & text decoding
 * 3. Portal opening from phone screen into illustrated SVG landscape (morning to night)
 *    - Stay: „Kuća pod Fruškom“ (hills, vineyards, house)
 *    - Food: „Picerija Stara peć“ (street, bistro, fairy lights, bicycle courier)
 *    - 4 chapters with decode effect & direct booking/ordering
 * 4. Experience builder (#exp): interactive add-ons, live itinerary, dynamic value bar, 5 benefits
 * 5. Commission calculator (#calc): sliders for stay (€) and food (din)
 * 6. Comparison (#vs): On platform vs On your site
 * 
 * Performance: stops rendering 3D phone once portal is 100% open.
 * Honors prefers-reduced-motion.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getLang, t as i18nT } from './i18n.js';
import {
  renderScrollDecode,
  registerScrollDecode,
  refreshAllScrollDecodes,
  escHtml
} from './scrollDecode.js';

export function initOwnJourney() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function sm(a, b, x) {
    x = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return x * x * (3 - 2 * x);
  }
  function cl(x) {
    return Math.max(0, Math.min(1, x));
  }

  const $ = (id) => document.getElementById(id);

  /* ---------- Global Mode & Switcher ---------- */
  const OJ = {
    mode: Math.random() < 0.5 ? 'stay' : 'food',
    fns: [],
    set(m) {
      if (m === this.mode) return;
      this.mode = m;
      document.body.setAttribute('data-oj', m);
      syncSwitcher();
      this.fns.forEach((fn) => fn(m));
    }
  };
  window.OJ = OJ;
  document.body.setAttribute('data-oj', OJ.mode);

  const ojsw = $('ojsw');
  function syncSwitcher() {
    if (!ojsw) return;
    const buttons = ojsw.querySelectorAll('button');
    buttons.forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.v === OJ.mode ? 'true' : 'false');
    });
  }

  if (ojsw) {
    const buttons = ojsw.querySelectorAll('button');
    buttons.forEach((b) => {
      b.addEventListener('click', () => OJ.set(b.dataset.v));
    });
    syncSwitcher();
  }

  const track = $('oj-track');
  const stage = $('oj-stage');
  const vsSection = $('vs');

  function swVis(horizTrackX) {
    if (!ojsw || !track || !vsSection) return;
    if (typeof horizTrackX === 'number' && horizTrackX < 0) {
      // Fast path from horizontal portfolio ScrollTrigger without forcing synchronous reflow
      const notInPortfolio = (window.innerWidth + horizTrackX) > window.innerWidth * 0.4;
      ojsw.classList.toggle('show', notInPortfolio);
      return;
    }
    const a = track.getBoundingClientRect();
    const b = vsSection.getBoundingClientRect();
    // Prikazuje se isključivo tokom sekcije Own your customer journey (telefon + poređenje #vs)
    // Čim se dođe do portfolija (radova) i #vs krene horizontalno ulevo, switcher odmah nestaje
    const inVert = a.top < window.innerHeight * 0.6 && b.bottom > window.innerHeight * 0.15;
    const notInPortfolio = b.right > window.innerWidth * 0.4;
    ojsw.classList.toggle('show', inVert && notInPortfolio);
  }
  let lastOjWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  window.addEventListener('scroll', () => swVis(), { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastOjWidth) return;
    lastOjWidth = window.innerWidth;
    swVis();
  }, { passive: true });
  window.__updateOjswVis = swVis;
  swVis();

  if (!track || !stage) return;

  /* ---------- SVG Landscape & City generation ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }

  const stars = $('stars');
  if (stars && stars.children.length === 0) {
    for (let s = 0; s < 70; s++) {
      el('circle', {
        cx: Math.random() * 1600,
        cy: Math.random() * 380,
        r: Math.random() * 1.6 + 0.6,
        fill: '#F3EEE3'
      }, stars);
    }
  }

  const vine = $('vine');
  if (vine && vine.children.length === 0) {
    for (let v = 0; v < 16; v++) {
      el('path', {
        d: 'M' + (170 + v * 44) + ' 612 L' + (60 + v * 62) + ' 860',
        'stroke-width': '5',
        'stroke-linecap': 'round',
        fill: 'none',
        class: 'row'
      }, vine);
    }
  }

  const trees = $('trees');
  if (trees && trees.children.length === 0) {
    [[150, 742, 1], [240, 736, 0.8], [1380, 740, 1.1], [1470, 746, 0.85], [1560, 744, 0.9]].forEach((t) => {
      const gg = el('g', { transform: 'translate(' + t[0] + ' ' + t[1] + ') scale(' + t[2] + ')' }, trees);
      el('rect', { x: -5, y: -40, width: 10, height: 44, class: 'trunk' }, gg);
      el('circle', { cx: 0, cy: -70, r: 38, class: 'crown' }, gg);
      el('circle', { cx: -22, cy: -46, r: 26, class: 'crown' }, gg);
      el('circle', { cx: 22, cy: -48, r: 28, class: 'crown' }, gg);
    });
  }

  function hex(h) {
    return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  }
  function ramp(list, t) {
    const n = list.length - 1;
    const x = cl(t) * n;
    const i = Math.min(n - 1, Math.floor(x));
    const f = x - i;
    const a = hex(list[i]);
    const b = hex(list[i + 1]);
    return 'rgb(' + a.map((val, idx) => Math.round(val + (b[idx] - val) * f)).join(',') + ')';
  }

  const C = {
    top: ['#7aa6d6', '#4f86c6', '#3a3f7a', '#0B1020'],
    bot: ['#f6dca8', '#cfe3f3', '#E8963A', '#2a2347'],
    far: ['#8aa0bd', '#7f9ab8', '#5a4f78', '#1c2440'],
    mid: ['#6f8f62', '#5f8455', '#4a4a5e', '#141b30'],
    row: ['#557548', '#4b6d42', '#3b3a4c', '#0f1528'],
    near: ['#46663f', '#3e5c38', '#2c2a3c', '#0B1020'],
    house: ['#efe6d4', '#f3ecdc', '#c9a98a', '#2a3150'],
    roof: ['#a8573c', '#b15e40', '#7a3e34', '#1b2038'],
    sun: ['#fff3c4', '#fffbe8', '#E8963A', '#E8963A']
  };

  const CC = {
    far: ['#8a9ab4', '#7f93b2', '#4f4a6a', '#10162a'],
    mid: ['#6d7a92', '#62728e', '#3b3a52', '#0d1324'],
    gr: ['#4a5266', '#454e63', '#2c2a3c', '#0B1020'],
    rb: ['#d9c7a8', '#e0cfb0', '#a8876a', '#2a3150']
  };

  // Build City (Food delivery example)
  (function buildCity() {
    const cfar = $('cfar'), cmid = $('cmid'), resto = $('resto'), clights = $('clights');
    if (!cfar || !cmid || !resto || !clights) return;
    if (cfar.children.length > 0) return;

    let x = -100;
    while (x < 1800) {
      const w = 60 + Math.random() * 90;
      const h = 170 + Math.random() * 230;
      el('rect', { x: x, y: 610 - h, width: w, height: h + 100, class: 'cf' }, cfar);
      for (let wy = 630 - h; wy < 600; wy += 34) {
        for (let wx = x + 10; wx < x + w - 14; wx += 24) {
          if (Math.random() < 0.32) {
            el('rect', { x: wx, y: wy, width: 10, height: 14, class: 'cw' }, cfar);
          }
        }
      }
      x += w + 4;
    }

    [[100, 380, 440, 330], [1060, 340, 440, 370]].forEach((b) => {
      el('rect', { x: b[0], y: b[1], width: b[2], height: b[3], class: 'cm' }, cmid);
      for (let wy = b[1] + 30; wy < b[1] + b[3] - 60; wy += 60) {
        for (let wx = b[0] + 30; wx < b[0] + b[2] - 40; wx += 70) {
          el('rect', { x: wx, y: wy, width: 30, height: 36, class: 'cw' }, cmid);
        }
      }
    });

    el('rect', { x: 540, y: 300, width: 520, height: 410, class: 'rb' }, resto);
    el('rect', { x: 630, y: 350, width: 340, height: 70, rx: 8, fill: '#0B1020' }, resto);
    const t = el('text', {
      x: 800, y: 398, 'text-anchor': 'middle', fill: '#D9B25F',
      'font-family': 'Montserrat, sans-serif', 'font-weight': '900', 'font-size': '36', 'letter-spacing': '4'
    }, resto);
    t.textContent = 'STARA PEĆ';

    for (let i = 0; i < 10; i++) {
      el('rect', { x: 540 + i * 52, y: 500, width: 52, height: 54, fill: i % 2 ? '#efe6d4' : '#b15e40' }, resto);
    }
    el('rect', { x: 580, y: 590, width: 170, height: 100, class: 'win' }, resto);
    el('rect', { x: 850, y: 590, width: 170, height: 100, class: 'win' }, resto);
    el('rect', { x: 765, y: 580, width: 70, height: 130, class: 'door' }, resto);

    el('path', { d: 'M500 455 Q800 520 1100 455', fill: 'none', stroke: '#3a3f4a', 'stroke-width': 3 }, clights);

    const cr = el('g', { id: 'courier' }, $('city'));
    el('polygon', { id: 'beam', points: '34,-70 230,-40 230,-10', fill: '#ffd27a' }, cr);
    [[-40, 'wh1'], [40, 'wh2']].forEach((w) => {
      const g = el('g', { id: w[1] }, cr);
      el('circle', { cx: 0, cy: 0, r: 24, fill: 'none', stroke: '#141a2c', 'stroke-width': 6 }, g);
      [0, 60, 120].forEach((a) => {
        const rad = a * Math.PI / 180;
        el('line', {
          x1: -22 * Math.cos(rad), y1: -22 * Math.sin(rad),
          x2: 22 * Math.cos(rad), y2: 22 * Math.sin(rad),
          stroke: '#3a4258', 'stroke-width': 2
        }, g);
      });
    });

    const fr = { fill: 'none', stroke: '#141a2c', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    el('path', Object.assign({ d: 'M-40 -24 L-2 -24 L22 -62 L-16 -62 Z M22 -62 L40 -24 M-16 -62 L-20 -76 M22 -62 L26 -78 L36 -80' }, fr), cr);
    el('rect', { x: -66, y: -140, width: 48, height: 46, rx: 5, fill: '#D9B25F' }, cr);
    el('rect', { x: -66, y: -122, width: 48, height: 7, fill: '#0B1020' }, cr);
    el('path', Object.assign({ d: 'M-18 -76 L4 -118 M4 -112 L30 -80 M-18 -76 L-4 -48 L-2 -24' }, fr, { 'stroke-width': 9 }), cr);
    el('circle', { cx: 10, cy: -132, r: 12, fill: '#141a2c' }, cr);
    el('path', { d: 'M-2 -136 Q10 -152 24 -136 Z', fill: '#E8963A' }, cr);
    el('circle', { id: 'blight', cx: 36, cy: -72, r: 5, fill: '#ffd27a' }, cr);

    for (let k = 0; k <= 12; k++) {
      const u = k / 12;
      const bx = (1 - u) * (1 - u) * 500 + 2 * u * (1 - u) * 800 + u * u * 1100;
      const by = (1 - u) * (1 - u) * 455 + 2 * u * (1 - u) * 520 + u * u * 455;
      el('circle', { cx: bx, cy: by + 6, r: 6, class: 'bulb', fill: '#ffd27a' }, clights);
    }
  })();

  const svgCache = {
    cfar: document.querySelectorAll('.cf'),
    cmid: document.querySelectorAll('.cm'),
    cground: $('cground'),
    rb: document.querySelectorAll('.rb'),
    door: document.querySelectorAll('.door'),
    cw: document.querySelectorAll('.cw'),
    bulbs: document.querySelectorAll('.bulb'),
    courier: $('courier'),
    wh1: $('wh1'),
    wh2: $('wh2'),
    beam: $('beam'),
    blight: $('blight'),
    cfarEl: $('cfar'),
    cmidEl: $('cmid'),
    s0: $('s0'),
    s1: $('s1'),
    farP: $('farP'),
    midP: $('midP'),
    nearP: $('nearP'),
    rows: document.querySelectorAll('.row'),
    trees: document.querySelectorAll('.crown,.trunk'),
    hb: $('hb'),
    hr: $('hr'),
    wins: document.querySelectorAll('.win'),
    sun: $('sun'),
    farG: $('far'),
    midG: $('mid'),
    nearG: $('near'),
  };

  function paintCity(t) {
    const colFar = ramp(CC.far, t);
    svgCache.cfar.forEach((r) => r.setAttribute('fill', colFar));
    const colMid = ramp(CC.mid, t);
    svgCache.cmid.forEach((r) => r.setAttribute('fill', colMid));
    if (svgCache.cground) svgCache.cground.setAttribute('fill', ramp(CC.gr, t));
    const colRb = ramp(CC.rb, t);
    svgCache.rb.forEach((r) => r.setAttribute('fill', colRb));
    const colDoor = ramp(C.roof, t);
    svgCache.door.forEach((r) => r.setAttribute('fill', colDoor));

    const wo = (0.08 + 0.8 * sm(0.5, 0.85, t)).toFixed(2);
    svgCache.cw.forEach((r) => {
      r.setAttribute('fill', '#ffd27a');
      r.setAttribute('opacity', wo);
    });

    const night = sm(0.55, 0.85, t);
    const bulbOp = (0.2 + 0.8 * night).toFixed(2);
    svgCache.bulbs.forEach((r) => r.setAttribute('opacity', bulbOp));

    if (svgCache.courier) {
      const cx = -220 + 2040 * ((t * 1.8) % 1);
      const rot = cx * 1.6;
      svgCache.courier.setAttribute('transform', 'translate(' + cx + ' 800)');
      if (svgCache.wh1) svgCache.wh1.setAttribute('transform', 'translate(-40 -24) rotate(' + rot + ')');
      if (svgCache.wh2) svgCache.wh2.setAttribute('transform', 'translate(40 -24) rotate(' + rot + ')');
    }

    if (svgCache.beam) svgCache.beam.setAttribute('opacity', (0.28 * night).toFixed(2));
    if (svgCache.blight) svgCache.blight.setAttribute('opacity', (0.3 + 0.7 * night).toFixed(2));

    if (svgCache.cfarEl) svgCache.cfarEl.setAttribute('transform', 'translate(' + (-30 * t) + ' 0)');
    if (svgCache.cmidEl) svgCache.cmidEl.setAttribute('transform', 'translate(' + (-60 * t) + ' 0)');
  }

  function paint(t, forceAll = false) {
    const isFood = OJ.mode === 'food';
    if (isFood || forceAll) {
      paintCity(t);
    }
    if (svgCache.s0) svgCache.s0.setAttribute('stop-color', ramp(C.top, t));
    if (svgCache.s1) svgCache.s1.setAttribute('stop-color', ramp(C.bot, t));

    if (!isFood || forceAll) {
      if (svgCache.farP) svgCache.farP.setAttribute('fill', ramp(C.far, t));
      if (svgCache.midP) svgCache.midP.setAttribute('fill', ramp(C.mid, t));
      if (svgCache.nearP) svgCache.nearP.setAttribute('fill', ramp(C.near, t));

      const colRow = ramp(C.row, t);
      svgCache.rows.forEach((r) => r.setAttribute('stroke', colRow));
      const colTree = ramp(C.near, Math.min(1, t + 0.12));
      svgCache.trees.forEach((r) => r.setAttribute('fill', colTree));

      if (svgCache.hb) svgCache.hb.setAttribute('fill', ramp(C.house, t));
      if (svgCache.hr) svgCache.hr.setAttribute('fill', ramp(C.roof, t));

      const winOp = (0.15 + 0.85 * sm(0.55, 0.85, t)).toFixed(2);
      svgCache.wins.forEach((w) => {
        w.setAttribute('fill', '#ffd27a');
        w.setAttribute('opacity', winOp);
      });

      if (svgCache.farG) svgCache.farG.setAttribute('transform', 'translate(' + (-40 * t) + ' 0)');
      if (svgCache.midG) svgCache.midG.setAttribute('transform', 'translate(' + (-90 * t) + ' 0)');
      if (svgCache.nearG) svgCache.nearG.setAttribute('transform', 'translate(' + (-180 * t) + ' 0)');
    }

    const sxPos = 260 + 1080 * t;
    const syPos = 380 - 230 * Math.sin(Math.PI * Math.min(1, t * 1.05)) + (t > 0.8 ? (t - 0.8) * 900 : 0);
    if (svgCache.sun) {
      svgCache.sun.setAttribute('cx', sxPos);
      svgCache.sun.setAttribute('cy', syPos);
      svgCache.sun.setAttribute('fill', ramp(C.sun, t));
    }
    if (stars) stars.setAttribute('opacity', sm(0.72, 0.98, t).toFixed(2));
  }

  /* ---------- Text Helpers ---------- */
  function esc(s) {
    return escHtml(s);
  }

  const INTRO_F_SR = [
    ['U aplikaciji ste jedan od stotinu istih lokala.', 'Ista slika, isto dugme, ista slova. Gost lista, poredi vreme dostave i cenu, i ide dalje.'],
    ['I svaka porudžbina nosi procenat.', 'Wolt i Glovo uzimaju deo od svake porudžbine. Za izgled koji je isti kao kod lokala do vas.'],
    ['A šta ako gost uđe u vaš lokal?', 'Ne u još jednu karticu u aplikaciji, nego u mesto koje oseti pre prvog zalogaja.']
  ];
  const INTRO_F_EN = [
    ['On the app, you’re one of a hundred identical spots.', 'Same photo, same button, same font. Customers scroll, compare delivery time and price, and move on.'],
    ['And every order takes a cut.', 'Delivery apps take a slice from every single order. For a listing that looks identical to the spot next door.'],
    ['What if guests walked into your own venue?', 'Not just another card in an app, but a place they experience before taking the first bite.']
  ];

  const CH_F_SR = [
    ['01 · Ulica', 'Miris sa ugla.', 'Gost već na sajtu oseti lokal: ulicu, toplu peć i ono po čemu ste poznati.'],
    ['02 · Meni', 'Jela sa pričom.', 'Ne lista sa sličicom, nego testo koje odmara 48 sati, peć na drva i pica meseca.'],
    ['03 · Izbor', 'Kombinacije koje vi slažete.', 'Vi odlučujete šta ide uz šta: piće, fokača, desert. Ono za šta aplikacija nema mesta.'],
    ['04 · Veče', 'Porudžbina bez posrednika.', 'Gost poručuje direktno kod vas: dostava, preuzimanje ili sto za večeras. Bez procenta aplikacije, a kontakt ostaje vama.']
  ];
  const CH_F_EN = [
    ['01 · Street', 'Aroma from the corner.', 'Guests feel your vibe right on your website: the street, wood-fired oven, and your signature specials.'],
    ['02 · Menu', 'Dishes with a story.', 'Not a plain list with tiny thumbnails, but 48-hour fermented dough, a wood-fired oven, and pizza of the month.'],
    ['03 · Pairings', 'Curated combinations.', 'You decide what pairs together: drinks, focaccia, dessert. The extras delivery apps have no room for.'],
    ['04 · Evening', 'Orders without middlemen.', 'Guests order directly with you: delivery, takeaway, or booking tonight’s table. Zero app fees, and customer data stays yours.']
  ];

  const INTRO_S_SR = [
    ['Na platformi ste jedan od hiljadu istih oglasa.', 'Ista slika, isto dugme, ista slova. Gost lista, poredi cenu i zvezdice, i ide dalje.'],
    ['I svaka rezervacija nosi procenat.', 'Booking obično uzima oko 15%, Airbnb do 15,5%. Za izgled koji je isti kao kod komšije.'],
    ['A šta ako gost uđe u vaš svet?', 'Ne u još jedan oglas, nego na mesto koje počinje pre nego što stigne.']
  ];
  const INTRO_S_EN = [
    ['On aggregators, you’re one of a thousand identical listings.', 'Same photo, same button, same font. Guests scroll, compare price and stars, and move on.'],
    ['And every reservation takes a fee.', 'Booking takes around 15%, Airbnb up to 15.5%. For a listing that looks identical to your neighbor’s.'],
    ['What if guests entered your world?', 'Not just another listing, but a getaway that begins long before arrival.']
  ];

  const CH_S_SR = [
    ['01 · Dolazak', 'Put kroz vinograde.', 'Gost već na sajtu oseti put: brda, tišinu, prvi pogled na kuću.'],
    ['02 · Jutro', 'Kafa na terasi.', 'Ne „terasa: da“ u listi pogodnosti, nego kako izgleda prvo jutro.'],
    ['03 · Popodne', 'Fruška gora je vaša.', 'Vaše preporuke: vinarije, staze, gde se jede. Ono za šta platforma nema mesta.'],
    ['04 · Veče', 'Rezervacija bez posrednika.', 'Gost bira termin i rezerviše direktno kod vas. Bez procenta platforme, a kontakt ostaje vama.']
  ];
  const CH_S_EN = [
    ['01 · Arrival', 'Road through vineyards.', 'Guests feel the journey right on your site: the hills, stillness, and that first view of the villa.'],
    ['02 · Morning', 'Coffee on the terrace.', 'Not just “terrace: yes” on an amenities checklist, but how that very first morning feels.'],
    ['03 · Afternoon', 'The countryside is yours.', 'Your handpicked guide: local wineries, trails, best dining spots. Experiences platforms leave out.'],
    ['04 · Evening', 'Direct booking without fees.', 'Guests pick dates and reserve directly on your site. Zero platform commission, and guest loyalty stays yours.']
  ];

  function getIntro(mode) {
    const isEn = getLang() === 'en';
    if (mode === 'food') return isEn ? INTRO_F_EN : INTRO_F_SR;
    return isEn ? INTRO_S_EN : INTRO_S_SR;
  }

  function getChapters(mode) {
    const isEn = getLang() === 'en';
    if (mode === 'food') return isEn ? CH_F_EN : CH_F_SR;
    return isEn ? CH_S_EN : CH_S_SR;
  }

  const dots = document.querySelectorAll('.chap .dots i');
  const book = $('oj-book');
  if (book) {
    const chips = book.querySelectorAll('.chip');
    chips.forEach((c) => {
      c.addEventListener('click', () => {
        chips.forEach((o) => o.setAttribute('aria-pressed', o === c ? 'true' : 'false'));
        const noteEl = $('oj-note');
        if (noteEl) noteEl.textContent = '';
      });
    });
  }

  const goBtn = $('oj-go');
  if (goBtn) {
    goBtn.addEventListener('click', () => {
      const activeChip = book ? book.querySelector('[aria-pressed="true"]') : null;
      const d = activeChip ? activeChip.textContent : '';
      const noteEl = $('oj-note');
      if (noteEl) {
        noteEl.textContent = (OJ.mode === 'food' ? 'Porudžbina (' + d + ') je primljena.' : 'Termin ' + d + ' je vaš.') +
          ' Potvrda stiže odmah, a gost ostaje u vašoj bazi.';
      }
    });
  }

  /* ---------- 3D iPhone Model with Platform Feed Texture ---------- */
  const cv = $('oj-gl');
  if (!cv) return;

  const renderer = new THREE.WebGLRenderer({
    canvas: cv,
    antialias: window.innerWidth > 768,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.innerWidth <= 768 ? 1.5 : 2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  cam.position.set(0, 0, 8.2);

  // Exact 5-source studio lighting from existing section
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(3, 9, 4);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xd4d4d8, 0.85);
  fillLight.position.set(-6, 3, 5);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xfff5ea, 0.35);
  rimLight.position.set(0, 8, -4);
  scene.add(rimLight);
  const frontBounceLight = new THREE.DirectionalLight(0xffffff, 0.55);
  frontBounceLight.position.set(0, -4, 4);
  scene.add(frontBounceLight);

  const phone = new THREE.Group();
  scene.add(phone);
  phone.position.set(0, -0.08, 0.4);
  phone.scale.set(23.0, 23.0, 23.0);
  phone.rotation.y = Math.PI;

  const phoneTitaniumMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18191d),
    roughness: 0.35,
    metalness: 0.85,
  });

  // Canvas texture for screen
  const SW = 540;
  const SH = 1170;
  const sc = document.createElement('canvas');
  sc.width = SW;
  sc.height = SH;
  const sx = sc.getContext('2d');

  const stex = new THREE.CanvasTexture(sc);
  stex.colorSpace = THREE.SRGBColorSpace;
  stex.minFilter = THREE.LinearFilter;
  stex.magFilter = THREE.LinearFilter;
  stex.generateMipmaps = false;

  let phoneScreenMesh = null;
  let isPhoneLoaded = false;
  let phoneLoadStarted = false;

  const loader = new GLTFLoader();
  function ensurePhoneModelLoaded() {
    if (phoneLoadStarted) return;
    phoneLoadStarted = true;
    loader.load(
      '/models/apple_iphone_15_pro_max_black.glb',
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            if (child.name === 'xXDHkMplTIDAXLN' || (child.material && child.material.name === 'pIJKfZsazmcpEiU')) {
              phoneScreenMesh = child;
              child.material = new THREE.MeshBasicMaterial({
                map: stex,
                toneMapped: false,
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1,
                depthWrite: true,
              });
              child.scale.set(1.0, 1.0, 1.0);
            } else if (
              child.name === 'wLfSXtbwRlBrwof' ||
              child.name === 'WJwwVjsahIXbJpU' ||
              child.name === 'cibcwsZWGgGfpme' ||
              child.name === 'YfrJNXgMvGOAfzz' ||
              child.material?.name === 'oZRkkORNzkufnGD' ||
              child.material?.name === 'yhcAXNGcJWCqtIS' ||
              child.material?.name === 'ZQfGMLaFcpPaLMU' ||
              child.material?.name === 'bCgzXjHOanGdTFV'
            ) {
              child.material = phoneTitaniumMaterial;
            }
          }
        });
        model.rotation.set(0, 0, 0);
        model.scale.set(1.0, 1.0, 1.0);
        phone.add(model);
        isPhoneLoaded = true;
        layout();
        drawFeed(lastP >= 0 ? lastP : 0, true);
        startLoop();
      },
      undefined,
      (err) => console.error('[ownJourney] Error loading phone GLB:', err)
    );
  }

  if ('IntersectionObserver' in window) {
    const preloadIo = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        ensurePhoneModelLoaded();
        preloadIo.disconnect();
      }
    }, { rootMargin: '220% 0px' });
    preloadIo.observe(track);
  } else {
    ensurePhoneModelLoaded();
  }
  window.addEventListener('load', () => {
    setTimeout(ensurePhoneModelLoaded, 2000);
  }, { once: true });

  function rrc(x, X, Y, w, h, r) {
    x.beginPath();
    x.moveTo(X + r, Y);
    x.arcTo(X + w, Y, X + w, Y + h, r);
    x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r);
    x.arcTo(X, Y, X + w, Y, r);
    x.closePath();
  }

  const CARD = 330, TOP = 262, MINEI = 6;
  const PRICES = [64, 72, 69, 75, 70, 68, 72, 66, 79, 71, 67, 74];
  const REVS = [84, 126, 57, 203, 98, 141, 126, 73, 115, 62, 88, 190];

  function drawFeedStay(P) {
    const x = sx, F = 'Arial, Helvetica, sans-serif';
    x.fillStyle = '#e9ebef';
    x.fillRect(0, 0, SW, SH);

    const target = MINEI * CARD + (CARD - 24) / 2 - (SH - TOP - 90) / 2;
    const off = sm(0, 0.2, P) * target;
    const tag = P > 0.09, mine = P > 0.17;

    x.save();
    x.beginPath();
    x.rect(0, TOP, SW, SH - TOP);
    x.clip();

    for (let k = 0; k < 12; k++) {
      const y = TOP + 10 + k * CARD - off;
      if (y > SH || y + CARD < TOP) continue;

      rrc(x, 36, y, SW - 72, CARD - 24, 18);
      x.fillStyle = '#fff';
      x.fill();

      rrc(x, 50, y + 14, SW - 100, 168, 12);
      x.fillStyle = '#cfd3da';
      x.fill();

      x.fillStyle = '#b9bec8';
      x.beginPath();
      x.moveTo(110, y + 182);
      x.lineTo(210, y + 92);
      x.lineTo(270, y + 142);
      x.lineTo(330, y + 110);
      x.lineTo(430, y + 182);
      x.closePath();
      x.fill();

      x.strokeStyle = '#fff';
      x.lineWidth = 4;
      x.beginPath();
      x.arc(SW - 86, y + 48, 16, 0, 6.283);
      x.stroke();

      const isEn = getLang() === 'en';
      x.fillStyle = '#3a3f4a';
      x.font = '700 26px ' + F;
      x.fillText(isEn ? 'Terrace Apartment' : 'Apartman sa terasom', 54, y + 222);

      x.fillStyle = '#7a808c';
      x.font = '21px ' + F;
      x.fillText((isEn ? '★ 4.8 (' : '★ 4,8 (') + REVS[k] + (isEn ? ') · 2.1 km from center' : ') · 2,1 km od centra'), 54, y + 254);

      x.fillStyle = '#3a3f4a';
      x.font = '700 24px ' + F;
      const pt = PRICES[k] + (isEn ? ' € / night' : ' € / noć');
      x.fillText(pt, 54, y + 290);

      if (tag) {
        const tw = x.measureText(pt).width;
        x.font = '700 18px ' + F;
        const lab = isEn ? '−15% to platform' : '−15% platformi';
        const lw = x.measureText(lab).width + 20;
        rrc(x, 64 + tw, y + 268, lw, 30, 15);
        x.fillStyle = '#E8963A';
        x.fill();
        x.fillStyle = '#fff';
        x.fillText(lab, 74 + tw, y + 289);
      }

      if (mine && k !== MINEI) {
        x.fillStyle = 'rgba(233,235,239,.62)';
        x.fillRect(30, y - 4, SW - 60, CARD - 16);
      }

      if (mine && k === MINEI) {
        rrc(x, 36, y, SW - 72, CARD - 24, 18);
        x.strokeStyle = '#D9B25F';
        x.lineWidth = 7;
        x.stroke();
        x.font = '700 19px "IBM Plex Mono", monospace';
        const ml = isEn ? 'YOUR ACCOMMODATION' : 'VAŠ SMEŠTAJ';
        const mw = x.measureText(ml).width + 22;
        rrc(x, 56, y - 16, mw, 32, 8);
        x.fillStyle = '#D9B25F';
        x.fill();
        x.fillStyle = '#0B1020';
        x.fillText(ml, 67, y + 6);
      }
    }
    x.restore();

    // Header: search + filters
    x.fillStyle = '#e9ebef';
    x.fillRect(0, 0, SW, TOP);
    x.fillStyle = '#3a3f4a';
    x.font = '700 24px ' + F;
    x.fillText('9:41', 58, 58);
    rrc(x, SW - 112, 38, 46, 22, 6);
    x.strokeStyle = '#3a3f4a';
    x.lineWidth = 3;
    x.stroke();
    x.fillRect(SW - 108, 42, 30, 14);

    rrc(x, SW / 2 - 88, 24, 176, 50, 25);
    x.fillStyle = '#000';
    x.fill();

    rrc(x, 36, 104, SW - 72, 68, 34);
    x.fillStyle = '#fff';
    x.fill();
    x.strokeStyle = '#d3d6dc';
    x.lineWidth = 2;
    x.stroke();

    const isEnStay = getLang() === 'en';
    x.fillStyle = '#7a808c';
    x.font = '22px ' + F;
    x.fillText(isEnStay ? '⌕  Countryside · 2 guests · weekend' : '⌕  Fruška gora · 2 gosta · vikend', 62, 146);

    let cx = 36;
    (isEnStay ? ['Price ▾', 'Rating ▾', 'Filters'] : ['Cena ▾', 'Ocena ▾', 'Filteri']).forEach((c) => {
      x.font = '20px ' + F;
      const w = x.measureText(c).width + 34;
      rrc(x, cx, 190, w, 44, 22);
      x.strokeStyle = '#c4c8cf';
      x.lineWidth = 2;
      x.stroke();
      x.fillStyle = '#5a606c';
      x.fillText(c, cx + 17, 219);
      cx += w + 10;
    });

    x.fillStyle = '#7a808c';
    x.font = '18px ' + F;
    x.textAlign = 'right';
    x.fillText(isEnStay ? '2,417 stays' : '2.417 smeštaja', SW - 40, 219);
    x.textAlign = 'left';

    // Bottom tab bar
    x.fillStyle = '#fff';
    x.fillRect(0, SH - 90, SW, 90);
    x.fillStyle = '#c4c8cf';
    for (let t = 0; t < 4; t++) {
      x.beginPath();
      x.arc(SW * (t + 0.5) / 4, SH - 50, 12, 0, 6.283);
      x.fill();
    }
    stex.needsUpdate = true;
  }

  function drawFeedFood(P) {
    const x = sx, F = 'Arial, Helvetica, sans-serif';
    x.fillStyle = '#e9ebef';
    x.fillRect(0, 0, SW, SH);

    const target = MINEI * CARD + (CARD - 24) / 2 - (SH - TOP - 90) / 2;
    const off = sm(0, 0.2, P) * target;
    const tag = P > 0.09, mine = P > 0.17;

    x.save();
    x.beginPath();
    x.rect(0, TOP, SW, SH - TOP);
    x.clip();

    for (let k = 0; k < 12; k++) {
      const y = TOP + 10 + k * CARD - off;
      if (y > SH || y + CARD < TOP) continue;

      rrc(x, 36, y, SW - 72, CARD - 24, 18);
      x.fillStyle = '#fff';
      x.fill();

      rrc(x, 50, y + 14, SW - 100, 168, 12);
      x.fillStyle = '#cfd3da';
      x.fill();

      x.fillStyle = '#bcc1cb';
      x.beginPath();
      x.ellipse(SW / 2, y + 100, 110, 64, 0, 0, 6.283);
      x.fill();
      x.fillStyle = '#a9afba';
      x.beginPath();
      x.ellipse(SW / 2, y + 96, 62, 36, 0, 0, 6.283);
      x.fill();

      x.strokeStyle = '#fff';
      x.lineWidth = 4;
      x.beginPath();
      x.arc(SW - 86, y + 48, 16, 0, 6.283);
      x.stroke();

      const isEn = getLang() === 'en';
      x.fillStyle = '#3a3f4a';
      x.font = '700 26px ' + F;
      x.fillText('Pizza & Pasta', 54, y + 222);

      x.fillStyle = '#7a808c';
      x.font = '21px ' + F;
      x.fillText((isEn ? '★ 4.6 (' : '★ 4,6 (') + REVS[k] + ') · 25–35 min', 54, y + 254);

      x.fillStyle = '#3a3f4a';
      x.font = '700 24px ' + F;
      const pt = isEn
        ? 'Delivery ' + [149, 199, 179, 199, 169, 189, 199, 159, 209, 179, 189, 199][k] + ' RSD'
        : 'Dostava ' + [149, 199, 179, 199, 169, 189, 199, 159, 209, 179, 189, 199][k] + ' din';
      x.fillText(pt, 54, y + 290);

      if (tag) {
        const tw = x.measureText(pt).width;
        x.font = '700 18px ' + F;
        const lab = isEn ? 'app takes a cut' : 'deo ide aplikaciji';
        const lw = x.measureText(lab).width + 20;
        rrc(x, 64 + tw, y + 268, lw, 30, 15);
        x.fillStyle = '#E8963A';
        x.fill();
        x.fillStyle = '#fff';
        x.fillText(lab, 74 + tw, y + 289);
      }

      if (mine && k !== MINEI) {
        x.fillStyle = 'rgba(233,235,239,.62)';
        x.fillRect(30, y - 4, SW - 60, CARD - 16);
      }

      if (mine && k === MINEI) {
        rrc(x, 36, y, SW - 72, CARD - 24, 18);
        x.strokeStyle = '#D9B25F';
        x.lineWidth = 7;
        x.stroke();
        x.font = '700 19px "IBM Plex Mono", monospace';
        const ml = isEn ? 'YOUR VENUE' : 'VAŠ LOKAL';
        const mw = x.measureText(ml).width + 22;
        rrc(x, 56, y - 16, mw, 32, 8);
        x.fillStyle = '#D9B25F';
        x.fill();
        x.fillStyle = '#0B1020';
        x.fillText(ml, 67, y + 6);
      }
    }
    x.restore();

    // Header
    x.fillStyle = '#e9ebef';
    x.fillRect(0, 0, SW, TOP);
    x.fillStyle = '#3a3f4a';
    x.font = '700 24px ' + F;
    x.fillText('9:41', 58, 58);
    rrc(x, SW - 112, 38, 46, 22, 6);
    x.strokeStyle = '#3a3f4a';
    x.lineWidth = 3;
    x.stroke();
    x.fillRect(SW - 108, 42, 30, 14);

    rrc(x, SW / 2 - 88, 24, 176, 50, 25);
    x.fillStyle = '#000';
    x.fill();

    rrc(x, 36, 104, SW - 72, 68, 34);
    x.fillStyle = '#fff';
    x.fill();
    x.strokeStyle = '#d3d6dc';
    x.lineWidth = 2;
    x.stroke();

    const isEnFood = getLang() === 'en';
    x.fillStyle = '#7a808c';
    x.font = '22px ' + F;
    x.fillText(isEnFood ? '⌕  City Center · delivery to address' : '⌕  Novi Sad · dostava na adresu', 62, 146);

    let cx = 36;
    (isEnFood ? ['Pizza ▾', 'Rating ▾', 'Filters'] : ['Pica ▾', 'Ocena ▾', 'Filteri']).forEach((c) => {
      x.font = '20px ' + F;
      const w = x.measureText(c).width + 34;
      rrc(x, cx, 190, w, 44, 22);
      x.strokeStyle = '#c4c8cf';
      x.lineWidth = 2;
      x.stroke();
      x.fillStyle = '#5a606c';
      x.fillText(c, cx + 17, 219);
      cx += w + 10;
    });

    x.fillStyle = '#7a808c';
    x.font = '18px ' + F;
    x.textAlign = 'right';
    x.fillText(isEnFood ? '386 venues' : '386 lokala', SW - 40, 219);
    x.textAlign = 'left';

    // Bottom tab bar
    x.fillStyle = '#fff';
    x.fillRect(0, SH - 90, SW, 90);
    x.fillStyle = '#c4c8cf';
    for (let t = 0; t < 4; t++) {
      x.beginPath();
      x.arc(SW * (t + 0.5) / 4, SH - 50, 12, 0, 6.283);
      x.fill();
    }
    stex.needsUpdate = true;
  }

  let lastFeedP = -1;
  let lastFeedMode = '';
  let lastFeedLang = '';
  let lastFeedOff = -1, lastFeedTag = false, lastFeedMine = false;
  function drawFeed(P, force = false) {
    const curLang = getLang();
    const feedOff = Math.round(sm(0, 0.2, P) * 1000);
    const tag = P > 0.09, mine = P > 0.17;
    if (!force && feedOff === lastFeedOff && tag === lastFeedTag && mine === lastFeedMine && OJ.mode === lastFeedMode && curLang === lastFeedLang) return;
    lastFeedOff = feedOff; lastFeedTag = tag; lastFeedMine = mine;

    lastFeedP = P;
    lastFeedMode = OJ.mode;
    lastFeedLang = curLang;
    if (OJ.mode === 'food') drawFeedFood(P);
    else drawFeedStay(P);
  }

  let narrow = false;
  let stageW = 1920, stageH = 1080;
  let basePosY = -0.08;
  let trackH = track.offsetHeight || window.innerHeight * 6;

  function layout() {
    if (!stage || !cv) return;
    trackH = track.offsetHeight || window.innerHeight * 6;
    const isCssApplied = getComputedStyle(stage).position === 'sticky';
    const r = stage.getBoundingClientRect();
    stageW = (isCssApplied && r.width > 0 && !(r.width === 300 && r.height === 150)) ? r.width : window.innerWidth;
    stageH = (isCssApplied && r.height > 200) ? r.height : window.innerHeight;
    renderer.setSize(stageW, stageH, false);
    cam.aspect = stageW / stageH;
    narrow = stageW <= 860;
    cam.updateProjectionMatrix();

    const hh = Math.tan((cam.fov * Math.PI / 180) / 2) * cam.position.z;
    const hw = hh * cam.aspect;

    if (narrow) {
      const introIn = $('oj-introIn');
      const introBottom = introIn ? introIn.getBoundingClientRect().bottom - r.top + 8 : 160;
      const ib = Math.min(220, Math.max(150, introBottom));
      const avail = Math.max(100, stageH - ib - 12);
      const cy = ib + avail / 2;
      basePosY = -((cy / stageH) * 2 - 1) * hh;
      phone.position.set(0, basePosY, 0.4);
      const scaleFactor = Math.min(18.5, (avail / 460) * 17.5);
      phone.scale.setScalar(scaleFactor);
    } else {
      basePosY = -0.08;
      phone.position.set(hw * 0.42, basePosY, 0.4);
      phone.scale.set(23.0, 23.0, 23.0);
    }
  }

  let lastOjHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  window.addEventListener('resize', () => {
    const wSame = window.innerWidth === lastOjWidth;
    const hSame = window.innerWidth <= 768 ? Math.abs(window.innerHeight - lastOjHeight) < 100 : window.innerHeight === lastOjHeight;
    if (wSame && hSame) return;
    lastOjWidth = window.innerWidth;
    lastOjHeight = window.innerHeight;
    layout();
  }, { passive: true });
  window.addEventListener('load', () => {
    lastOjWidth = window.innerWidth;
    lastOjHeight = window.innerHeight;
    layout();
  }, { once: true });

  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  });

  const vv = new THREE.Vector3();
  function screenRect() {
    const sr = { width: stageW, height: stageH };
    if (!phoneScreenMesh) {
      return [sr.width * 0.5, sr.height * 0.2, sr.width * 0.8, sr.height * 0.8, 30];
    }
    phone.updateMatrixWorld(true);
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    const b = phoneScreenMesh.geometry.boundingBox;
    if (!b) phoneScreenMesh.geometry.computeBoundingBox();
    const box = phoneScreenMesh.geometry.boundingBox;

    // iPhone screen bounds in mesh local space
    const corners = [
      [box.min.x, box.min.y, box.max.z],
      [box.max.x, box.min.y, box.max.z],
      [box.max.x, box.max.y, box.max.z],
      [box.min.x, box.max.y, box.max.z],
    ];

    corners.forEach(([cx, cy, cz]) => {
      vv.set(cx, cy, cz);
      phoneScreenMesh.localToWorld(vv);
      vv.project(cam);
      const px = ((vv.x + 1) / 2) * sr.width;
      const py = ((1 - vv.y) / 2) * sr.height;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    });

    const radius = Math.max(12, (maxX - minX) * 0.11);
    return [minX, minY, maxX, maxY, radius];
  }

  /* ---------- Main Animation Frame Loop ---------- */
  const portal = $('oj-portal');
  const pSvgCached = portal ? portal.querySelector('svg') : null;
  const h1ElCached = $('oj-h1');
  const ipElCached = $('oj-ip');
  const introInCached = $('oj-introIn');
  const cnElCached = $('oj-cn');
  const chElCached = $('oj-ch');
  const cpElCached = $('oj-cp');
  let iStep = -1, cStep = -1, lastT = -1, ry = Math.PI - 0.3, rx = 0.05, lastP = 0;
  let inView = false;
  let rafId = 0;

  function startLoop() {
    if (!rafId) {
      rafId = requestAnimationFrame(frame);
    }
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) startLoop();
    }, { rootMargin: '300px 0px' });
    io.observe(track);
  } else {
    inView = true;
  }

  function frame(now) {
    rafId = 0;
    const r = track.getBoundingClientRect();
    const tot = (trackH || track.offsetHeight) - window.innerHeight;
    const inVisibleZone = r.bottom > 0 && r.top <= window.innerHeight;

    if (!inVisibleZone && !inView) {
      return;
    }

    if (inVisibleZone) {
      const P = cl(-r.top / tot);
      lastP = P;
      const IN = getIntro(OJ.mode);
      const CHX = getChapters(OJ.mode);

      // Act A: 0 – .26 phone with the platform feed, three intro lines
      // User requirement: "nemoj da krene ova animacija za tekst dok se ne spusti skroz do telefona"
      // Only start text decode when user has scrolled all the way down to the stage (r.top <= 0)
      if (r.top > 0) {
        if (iStep !== -1) {
          iStep = -1;
          renderScrollDecode(h1ElCached, '', 0);
          renderScrollDecode(ipElCached, '', 0);
        }
      } else {
        const ia = P < 0.08 ? 0 : P < 0.16 ? 1 : 2;
        iStep = ia;
        const pStart = ia === 0 ? 0.00 : ia === 1 ? 0.08 : 0.16;
        const pRange = 0.075;
        const pStep = cl((P - pStart) / pRange);

        const qH1 = cl(pStep / 0.52);
        const qDesc = cl((pStep - 0.30) / 0.65);

        renderScrollDecode(h1ElCached, IN[ia][0], qH1, null, 3);
        renderScrollDecode(ipElCached, IN[ia][1], qDesc, null, 3);
      }

      // Act B: phone turns flat to face you, then screen opens into full screen portal
      const eRot = sm(0.22, 0.30, P);
      const e = sm(0.30, 0.40, P);
      const fade = sm(0.28, 0.31, P);

      const targetRotY = Math.PI + ((narrow ? -0.12 : -0.32) + mx * 0.22) * (1 - eRot);
      const targetRotX = (0.05 + my * 0.1) * (1 - eRot);

      ry += (targetRotY - ry) * (reduce ? 1 : 0.08);
      rx += (targetRotX - rx) * (reduce ? 1 : 0.08);

      phone.rotation.set(rx, ry, 0);
      phone.position.y = basePosY + (reduce ? 0 : Math.sin(now / 1600) * 0.03 * (1 - eRot));

      // Performance optimization: stop drawing 3D phone when portal is completely open
      if (e < 1) {
        drawFeed(P);
        renderer.render(scene, cam);
      }

      const W = stageW;
      const H = stageH;
      const sr = (P > 0.26 && e < 1) ? screenRect() : null;

      if (P <= 0.26) {
        if (portal) {
          portal.style.display = 'none';
          portal.style.opacity = '0';
        }
        if (introInCached) introInCached.style.opacity = '1';
        cv.style.opacity = '1';
      } else {
        if (portal) {
          portal.style.display = 'block';

          portal.style.clipPath = e >= 1 ? 'none' :
            'inset(' + (sr[1] * (1 - e)) + 'px ' +
            ((W - sr[2]) * (1 - e)) + 'px ' +
            ((H - sr[3]) * (1 - e)) + 'px ' +
            (sr[0] * (1 - e)) + 'px round ' +
            (sr[4] * (1 - e)) + 'px)';
          portal.style.opacity = fade;
          if (pSvgCached) {
            pSvgCached.style.transform = e >= 1 ? 'none' : 'scale(' + (1.12 - 0.12 * e) + ')';
          }
        }
      }

      // Act C: .40 – 1.0 morning to night landscape progression
      const c = cl((P - 0.40) / 0.60);
      const t = c;
      if (Math.abs(t - lastT) > 0.001) {
        paint(t);
        lastT = t;
      }

      const ci = P < 0.40 ? -1 : Math.min(3, Math.floor(c * 4));
      cStep = ci;
      if (ci < 0) {
        renderScrollDecode(cnElCached, '', 0);
        renderScrollDecode(chElCached, '', 0);
        renderScrollDecode(cpElCached, '', 0);
      } else {
        const cLocal = (c * 4) - ci;
        const qCn = cl(cLocal / 0.35);
        const qCh = cl((cLocal - 0.15) / 0.50);
        const qCp = cl((cLocal - 0.35) / 0.60);

        renderScrollDecode(cnElCached, CHX[ci][0], qCn, null, 3);
        renderScrollDecode(chElCached, CHX[ci][1], qCh, null, 3);
        renderScrollDecode(cpElCached, CHX[ci][2], qCp, null, 3);
      }
      if (book) book.classList.toggle('on', ci === 3);
      dots.forEach((d, i) => d.classList.toggle('on', i <= ci));

      if (r.top >= 0) { iStep = -1; cStep = -1; }
    }

    startLoop();
  }

  function applyScene(m) {
    const f = m === 'food';
    ['far', 'mid', 'near'].forEach((id) => {
      const elNode = $(id);
      if (elNode) elNode.style.display = f ? 'none' : '';
    });
    const city = $('city');
    if (city) city.style.display = f ? '' : 'none';

    const isEn = getLang() === 'en';
    const brandEl = $('ojBrand');
    if (brandEl) {
      if (isEn) {
        brandEl.innerHTML = f
          ? 'Old Oven Pizzeria<small>example · artisan pizzeria</small>'
          : 'House under Fruška<small>example · boutique villa</small>';
      } else {
        brandEl.innerHTML = f
          ? 'Picerija Stara peć<small>primer · izmišljen lokal</small>'
          : 'Kuća pod Fruškom<small>primer · izmišljen smeštaj</small>';
      }
    }

    if (book) {
      const c = book.querySelectorAll('.chip');
      const L1 = f
        ? (isEn ? ['19:00 pickup', '19:30 delivery', '20:00 table for two'] : ['19:00 preuzimanje', '19:30 dostava', '20:00 sto za dvoje'])
        : (isEn ? ['Fri 13 – Sun 15', 'Fri 20 – Sun 22', 'Fri 27 – Sun 29'] : ['Pet 13. – Ned 15.', 'Pet 20. – Ned 22.', 'Pet 27. – Ned 29.']);
      c.forEach((b, i) => {
        if (L1[i]) b.textContent = L1[i];
        b.setAttribute('aria-pressed', i === 1 ? 'true' : 'false');
      });
    }

    const goEl = $('oj-go');
    if (goEl) {
      if (isEn) {
        goEl.textContent = f ? 'Order directly' : 'Book directly';
      } else {
        goEl.textContent = f ? 'Poruči direktno' : 'Rezerviši direktno';
      }
    }
    const noteEl = $('oj-note');
    if (noteEl) noteEl.textContent = '';

    iStep = -1;
    cStep = -1;
    lastT = -1;

    // Reset rendered cache so next frame or immediate call re-renders
    const h1El = $('oj-h1'), ipEl = $('oj-ip');
    if (h1El) h1El._sdKey = '';
    if (ipEl) ipEl._sdKey = '';
    const cnEl = $('oj-cn'), chEl = $('oj-ch'), cpEl = $('oj-cp');
    if (cnEl) cnEl._sdKey = '';
    if (chEl) chEl._sdKey = '';
    if (cpEl) cpEl._sdKey = '';

    const IN = getIntro(m);
    const CHX = getChapters(m);

    // If currently on phone feed intro stage, update text immediately
    if (lastP >= 0 && lastP <= 0.26) {
      const ia = lastP < 0.08 ? 0 : lastP < 0.16 ? 1 : 2;
      if (h1El && IN[ia]) renderScrollDecode(h1El, IN[ia][0], 1);
      if (ipEl && IN[ia]) renderScrollDecode(ipEl, IN[ia][1], 1);
    } else if (lastP >= 0.40) {
      const c = cl((lastP - 0.40) / 0.60);
      const ci = Math.min(3, Math.floor(c * 4));
      if (cnEl && CHX[ci]) renderScrollDecode(cnEl, CHX[ci][0], 1);
      if (chEl && CHX[ci]) renderScrollDecode(chEl, CHX[ci][1], 1);
      if (cpEl && CHX[ci]) renderScrollDecode(cpEl, CHX[ci][2], 1);
    }

    drawFeed(lastP >= 0 ? lastP : 0, true);
    if (typeof scene !== 'undefined' && typeof cam !== 'undefined' && typeof renderer !== 'undefined') {
      renderer.render(scene, cam);
    }
    paint(lastT >= 0 ? lastT : 0, true);
    startLoop();
  }

  OJ.fns.push(applyScene);
  applyScene(OJ.mode);

  layout();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }
  paint(0, true);
  startLoop();

  /* ---------- Commission Calculator ---------- */
  const pr = $('pr'), nt = $('nt'), pc = $('pc');
  function fmtCalc(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function calc() {
    if (!pr || !nt || !pc) return;
    const isEn = getLang() === 'en';
    const p = +pr.value, n = +nt.value, k = +pc.value;
    const f = (p * n * k) / 100;
    const prO = $('prO'), ntO = $('ntO'), pcO = $('pcO'), fee = $('fee'), feeN = $('feeN');
    if (prO) prO.textContent = OJ.mode === 'food' ? fmtCalc(p) + (isEn ? ' RSD' : ' din') : p + ' €';
    if (ntO) ntO.textContent = fmtCalc(n);
    if (pcO) pcO.textContent = String(k).replace('.', ',') + '%';
    if (fee) fee.textContent = fmtCalc(f) + (OJ.mode === 'food' ? (isEn ? ' RSD' : ' din') : ' €');
    if (feeN) {
      if (isEn) {
        feeN.textContent = OJ.mode === 'food'
          ? 'That is equivalent to preparing ' + fmtCalc(Math.round(f / p)) + ' orders each year just to cover app fees.'
          : 'That is equivalent to hosting ' + Math.round(f / p) + ' nights each year just to pay platform commissions.';
      } else {
        feeN.textContent = OJ.mode === 'food'
          ? 'To je kao da ste ' + fmtCalc(Math.round(f / p)) + ' porudžbina godišnje spremili samo za aplikaciju.'
          : 'To je kao da ste ' + Math.round(f / p) + ' noćenja godišnje odradili samo za platformu.';
      }
    }
  }

  if (pr && nt && pc) {
    [pr, nt, pc].forEach((i) => i.addEventListener('input', calc));
  }

  function setR(i, a) {
    if (!i) return;
    i.min = a[0];
    i.max = a[1];
    i.step = a[2];
    i.value = a[3];
  }

  function calcMode(m) {
    const f = m === 'food';
    setR(pr, f ? [600, 6000, 100, 1800] : [30, 300, 5, 80]);
    setR(nt, f ? [200, 20000, 100, 4000] : [20, 330, 5, 150]);
    setR(pc, f ? [10, 35, 0.5, 25] : [10, 25, 0.5, 15]);
    calc();
  }
  OJ.fns.push(calcMode);
  calcMode(OJ.mode);

  /* ---------- Experience Builder (#exp) ---------- */
  const EXP_DATA_SR = {
    stay: {
      h: 'Od jedne rezervacije <em>do celog vikenda.</em>',
      lead: 'Na platformi se kupovina uglavnom završava na sobi. Na vašem sistemu soba može da bude tek početak: gost sam slaže ostatak boravka, a sve plaća na jednom mestu.',
      bn: 'Kuća pod Fruškom',
      bs: 'Pet 20. – Ned 22. jun · 2 gosta',
      base: 180,
      unit: '€',
      q: 'Dodajte svom boravku',
      ph: 'Vaš vikend',
      empty: 'Za sada samo smeštaj. Dodajte nešto levo.',
      full: (n, w) => 'Smeštaj i ' + n + ' ' + w + '. Sve u jednoj rezervaciji.',
      vl: 'Vrednost rezervacije',
      l1: 'Smeštaj',
      l2: 'Dodatne usluge',
      note: 'Konceptualni primer. Smeštaj, usluge i cene su izmišljeni.',
      groups: ['Petak, 20. jun', 'Subota, 21. jun', 'Nedelja, 22. jun'],
      baseItems: [[0, '15:00', 'Dolazak i ulazak u kuću'], [2, '11:00', 'Odjava']],
      adds: [
        ['Transfer sa aerodroma', 'Beograd → kuća, vozač čeka', 70, 0, '14:00', 'Transfer sa aerodroma'],
        ['Vino na dolasku', 'Boca lokalnog vina u kući', 25, 0, '15:00', 'Vino vas čeka u kući'],
        ['Privatni kuvar', 'Večera za dvoje u kući', 120, 0, '20:00', 'Večera sa privatnim kuvarom'],
        ['Doručak u korpi', 'Domaći proizvodi sa salaša', 30, 1, '09:00', 'Doručak u korpi na terasi'],
        ['Tura po vinarijama', 'Fruška gora, sa vodičem', 60, 1, '11:00', 'Tura po vinarijama'],
        ['Vožnja Dunavom', 'Privatni čamac, zalazak sunca', 90, 1, '18:30', 'Vožnja Dunavom u zalazak']
      ],
      msg: 'Ne nudite samo uslugu. <em>Napravite iskustvo</em> koje gost prilagodi, rezerviše i plati kroz vaš sistem.',
      ben: [
        ['Veća vrednost rezervacije', 'Gost dokupljuje ono što prirodno ide uz boravak.'],
        ['Iskustvo po meri', 'Gost bira kako izgleda njegov vikend, umesto standardne ponude.'],
        ['Kontrola nad ponudom', 'Vi odlučujete šta nudite, kako to predstavljate i s kim sarađujete.'],
        ['Direktan odnos', 'Gradite svoju bazu gostiju i, uz njihovu saglasnost, šaljete im ponude koje ih zanimaju.'],
        ['Prostor za rast', 'Nove usluge, partneri i izvori prihoda dodaju se kako biznis raste.']
      ],
      other: 'Isto važi i za <b>restorane</b>: uz porudžbinu, piće i desert, sto za vikend ili poklon vaučer. Svaki biznis može svoju osnovnu uslugu da poveže sa onim što kupcu prirodno treba uz nju.'
    },
    food: {
      h: 'Od jedne porudžbine <em>do cele večeri.</em>',
      lead: 'Na platformi se kupovina uglavnom završava na jelu iz liste. Na vašem sistemu porudžbina može da bude tek početak: gost dodaje ono što ide uz nju, rezerviše sto ili kupi poklon, sve na jednom mestu.',
      bn: 'Picerija Stara peć',
      bs: 'Večeras · dostava 19:30 · 2 osobe',
      base: 1780,
      unit: 'din',
      q: 'Dodajte porudžbini',
      ph: 'Vaša večera',
      empty: 'Za sada samo glavno jelo. Dodajte nešto levo.',
      full: (n, w) => 'Porudžbina i ' + n + ' ' + w + '. Sve u jednoj kupovini.',
      vl: 'Vrednost porudžbine',
      l1: 'Porudžbina',
      l2: 'Dodaci',
      note: 'Konceptualni primer. Lokal, jela i cene su izmišljeni.',
      groups: ['Večeras · dostava', 'Subota, 24. oktobar', 'Za poklon'],
      baseItems: [[0, '19:30', '2× kapričoza iz peći na drva']],
      adds: [
        ['Domaća limunada', 'Dve flaše, sveže ceđena', 360, 0, '19:30', '2× domaća limunada'],
        ['Fokača sa ruzmarinom', 'Topla, iz iste peći', 350, 0, '19:30', 'Fokača sa ruzmarinom'],
        ['Tiramisu', 'Domaći, za dvoje', 420, 0, '19:30', 'Tiramisu za dvoje'],
        ['Vino za poneti', 'Fruškogorska tamjanika', 1900, 0, '19:30', 'Boca tamjanike'],
        ['Sto za subotu', 'Za dvoje, pored peći', 0, 1, '20:00', 'Sto za dvoje, pored peći'],
        ['Poklon vaučer', 'Večera za dvoje', 4000, 2, '—', 'Poklon vaučer za večeru']
      ],
      msg: 'Ne nudite samo jelo. <em>Napravite iskustvo</em> koje gost prilagodi, poruči i plati kroz vaš sistem.',
      ben: [
        ['Veća vrednost porudžbine', 'Gost dokupljuje ono što prirodno ide uz jelo.'],
        ['Iskustvo po meri', 'Gost slaže svoju večeru, umesto da bira sa iste liste kao svuda.'],
        ['Kontrola nad ponudom', 'Vi odlučujete šta nudite, kako to predstavljate i s kim sarađujete.'],
        ['Direktan odnos', 'Gradite svoju bazu gostiju i, uz njihovu saglasnost, javljate im novi meni ili akciju.'],
        ['Prostor za rast', 'Ketering, vaučeri, rezervacije i saradnje dodaju se kako lokal raste.']
      ],
      other: 'Isto važi i za <b>smeštaj</b>: uz sobu, transfer, večera sa kuvarom ili tura po vinarijama. Svaki biznis može svoju osnovnu uslugu da poveže sa onim što kupcu prirodno treba uz nju.'
    }
  };

  const EXP_DATA_EN = {
    stay: {
      h: 'From a single reservation <em>to an entire weekend.</em>',
      lead: 'On aggregators, a transaction ends at the room. On your own system, a room is just the starting point: guests curate their stay and pay for everything in one seamless checkout.',
      bn: 'House under Fruška',
      bs: 'Fri Jun 20 – Sun Jun 22 · 2 guests',
      base: 180,
      unit: '€',
      q: 'Enhance your stay',
      ph: 'Your Weekend',
      empty: 'Currently only accommodation. Add experiences on the left.',
      full: (n, w) => 'Accommodation and ' + n + ' ' + (n === 1 ? 'add-on' : 'add-ons') + '. All in one reservation.',
      vl: 'Reservation value',
      l1: 'Accommodation',
      l2: 'Add-ons',
      note: 'Conceptual example. Villa, add-ons, and pricing are illustrative.',
      groups: ['Friday, June 20', 'Saturday, June 21', 'Sunday, June 22'],
      baseItems: [[0, '15:00', 'Check-in and welcome'], [2, '11:00', 'Check-out']],
      adds: [
        ['Airport transfer', 'Belgrade → villa, private driver', 70, 0, '14:00', 'Airport transfer'],
        ['Welcome wine', 'Bottle of local vintage in room', 25, 0, '15:00', 'Local wine in room'],
        ['Private chef', 'Dinner for two at the villa', 120, 0, '20:00', 'Private chef dinner'],
        ['Breakfast basket', 'Artisan organic local produce', 30, 1, '09:00', 'Breakfast basket on terrace'],
        ['Wine cellar tour', 'Guided wine tasting tour', 60, 1, '11:00', 'Wine cellar tour'],
        ['Danube river cruise', 'Private boat at sunset', 90, 1, '18:30', 'Sunset Danube cruise']
      ],
      msg: 'Don’t just sell a room. <em>Craft an experience</em> that guests tailor, book, and pay for through your system.',
      ben: [
        ['Higher booking value', 'Guests naturally add experiences that complement their stay.'],
        ['Tailored experience', 'Guests design their dream weekend instead of picking an off-the-shelf room.'],
        ['Full offer control', 'You decide what to offer, how to present it, and who to partner with.'],
        ['Direct relationship', 'Build your own guest list and send personalized seasonal offers with their consent.'],
        ['Room to grow', 'New services, partnerships, and revenue streams plug in as your business scales.']
      ],
      other: 'The same applies to <b>restaurants</b>: with an order, pairing wine, dessert, a weekend table, or gift card. Every business can connect its core offer with what clients naturally need next.'
    },
    food: {
      h: 'From a single order <em>to a complete evening.</em>',
      lead: 'On delivery apps, a sale ends with a single dish. On your own system, an order is just the beginning: guests add drink pairings, book tonight’s table, or buy gift vouchers all in one place.',
      bn: 'Old Oven Pizzeria',
      bs: 'Tonight · delivery 19:30 · 2 people',
      base: 1780,
      unit: 'RSD',
      q: 'Add to your order',
      ph: 'Your Evening',
      empty: 'Currently only main course. Add items on the left.',
      full: (n, w) => 'Order and ' + n + ' ' + (n === 1 ? 'extra' : 'extras') + '. All in one checkout.',
      vl: 'Order total',
      l1: 'Order',
      l2: 'Extras',
      note: 'Conceptual example. Venue, dishes, and pricing are illustrative.',
      groups: ['Tonight · delivery', 'Saturday, October 24', 'Gift card'],
      baseItems: [[0, '19:30', '2× wood-fired capricciosa pizza']],
      adds: [
        ['Homemade lemonade', 'Two bottles, freshly pressed', 360, 0, '19:30', '2× homemade lemonade'],
        ['Rosemary focaccia', 'Warm, fresh from wood-fired oven', 350, 0, '19:30', 'Rosemary focaccia'],
        ['Tiramisu', 'Artisan, crafted for two', 420, 0, '19:30', 'Tiramisu for two'],
        ['Takeaway wine', 'Regional Tamjanika vintage', 1900, 0, '19:30', 'Bottle of Tamjanika'],
        ['Table for Saturday', 'For two, by the oven', 0, 1, '20:00', 'Table for two, by oven'],
        ['Gift voucher', 'Dinner for two', 4000, 2, '—', 'Dinner gift voucher']
      ],
      msg: 'Don’t just deliver food. <em>Create an experience</em> that diners personalize, order, and pay for directly through your system.',
      ben: [
        ['Higher average ticket', 'Diners naturally add beverages and sides curated for the meal.'],
        ['Bespoke dining', 'Guests tailor their dinner instead of picking from a uniform platform list.'],
        ['Offer control', 'You decide what to highlight, how to present it, and retain 100% of the margins.'],
        ['Direct customer retention', 'Own your diner database and announce seasonal menus directly.'],
        ['Growth opportunities', 'Catering, vouchers, event bookings, and collaborations expand as you grow.']
      ],
      other: 'The same applies to <b>hospitality</b>: with a room, transfers, a private chef dinner, or wine tasting tour. Every business can connect its core service with what clients naturally need next.'
    }
  };

  function getExpData() {
    return getLang() === 'en' ? EXP_DATA_EN : EXP_DATA_SR;
  }

  let M = getExpData()[OJ.mode];
  let on = [];
  let shown = 0;
  let lastNew = -1;
  const addsEl = $('adds');

  function fmtExp(n) {
    const isEn = getLang() === 'en';
    if (M.unit === 'din' || M.unit === 'RSD') {
      return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (isEn ? ' RSD' : ' din');
    }
    return Math.round(n) + ' €';
  }
  function words(n) {
    if (getLang() === 'en') {
      return n === 1 ? 'extra' : 'extras';
    }
    return n === 1 ? 'dodatak' : n < 5 ? 'dodatka' : 'dodataka';
  }

  function registerExpScrollDecodes() {
    if (!M) return;
    const xH = $('x-h'), xLead = $('x-lead'), xMsg = $('x-msg'), xOther = $('x-other');
    if (xH) registerScrollDecode(xH, { rich: true, initialHtml: M.h, startRatio: 0.92, endRatio: 0.56 });
    if (xLead) registerScrollDecode(xLead, { text: M.lead, startRatio: 0.92, endRatio: 0.52, offset: 0.08 });
    if (xMsg) registerScrollDecode(xMsg, { rich: true, initialHtml: M.msg, startRatio: 0.92, endRatio: 0.56 });
    if (xOther && M.other) registerScrollDecode(xOther, { rich: true, initialHtml: M.other, startRatio: 0.94, endRatio: 0.60 });

    const panelLeft = document.querySelector('#exp .panel:not(.plan)');
    if (panelLeft) {
      if ($('x-bn')) registerScrollDecode($('x-bn'), { text: M.bn, triggerEl: panelLeft, startRatio: 0.92, endRatio: 0.48, offset: 0 });
      if ($('x-bs')) registerScrollDecode($('x-bs'), { text: M.bs, triggerEl: panelLeft, startRatio: 0.92, endRatio: 0.48, offset: 0.06 });
      if ($('x-q')) registerScrollDecode($('x-q'), { text: M.q, triggerEl: panelLeft, startRatio: 0.92, endRatio: 0.48, offset: 0.12 });
      M.adds.forEach((a, i) => {
        const addEl = $('x-add-b-' + i);
        if (addEl) registerScrollDecode(addEl, { text: a[0], triggerEl: panelLeft, startRatio: 0.92, endRatio: 0.45, offset: 0.16 + i * 0.04 });
      });
    }

    const panelPlan = document.querySelector('#exp .panel.plan');
    if (panelPlan) {
      if ($('x-ph')) registerScrollDecode($('x-ph'), { text: M.ph, triggerEl: panelPlan, startRatio: 0.92, endRatio: 0.48, offset: 0 });
      if ($('x-vl')) registerScrollDecode($('x-vl'), { text: M.vl, triggerEl: panelPlan, startRatio: 0.92, endRatio: 0.48, offset: 0.08 });
      if ($('x-l1')) registerScrollDecode($('x-l1'), { text: M.l1, triggerEl: panelPlan, startRatio: 0.92, endRatio: 0.48, offset: 0.14 });
      if ($('x-l2')) registerScrollDecode($('x-l2'), { text: M.l2, triggerEl: panelPlan, startRatio: 0.92, endRatio: 0.48, offset: 0.18 });
      if ($('x-note')) registerScrollDecode($('x-note'), { text: M.note, triggerEl: panelPlan, startRatio: 0.92, endRatio: 0.46, offset: 0.22 });
    }

    const xBen = $('x-ben');
    if (xBen) {
      xBen.querySelectorAll('.drop').forEach((card) => {
        card.querySelectorAll('[data-dec]').forEach((item, idx) => {
          registerScrollDecode(item, {
            text: item.dataset.dec || item.textContent || '',
            triggerEl: card,
            startRatio: 0.94,
            endRatio: 0.56,
            offset: idx * 0.10
          });
        });
      });
    }
  }

  function registerCalcAndVsScrollDecodes() {
    const calcH2 = document.querySelector('#calc h2');
    if (calcH2) {
      calcH2.querySelectorAll('span[data-m]').forEach((sp) => {
        registerScrollDecode(sp, { rich: true, triggerEl: calcH2, startRatio: 0.92, endRatio: 0.55 });
      });
    }
    const calcRes = document.querySelector('#calc .res');
    if (calcRes) {
      calcRes.querySelectorAll('[data-dec]').forEach((item) => {
        registerScrollDecode(item, {
          triggerEl: calcRes,
          startRatio: 0.92,
          endRatio: 0.55,
          getText: (elNode) => {
            const key = elNode.getAttribute('data-i18n');
            return key ? i18nT(key) : (elNode.dataset.dec || elNode.textContent || '');
          }
        });
      });
    }

    document.querySelectorAll('#vs .wrap').forEach((wrap) => {
      const h2 = wrap.querySelector('h2');
      if (h2) {
        registerScrollDecode(h2, { rich: true, startRatio: 0.92, endRatio: 0.52 });
      }
      wrap.querySelectorAll('.col').forEach((col) => {
        col.querySelectorAll('[data-dec]').forEach((item, idx) => {
          registerScrollDecode(item, {
            triggerEl: col,
            startRatio: 0.94,
            endRatio: 0.50,
            offset: idx * 0.06,
            getText: (elNode) => {
              const key = elNode.getAttribute('data-i18n');
              return key ? i18nT(key) : (elNode.dataset.dec || elNode.textContent || '');
            }
          });
        });
      });
    });
  }

  function initDropAnimations() {
    const drops = document.querySelectorAll('#put-kupca .drop, #vs .drop');
    if (!('IntersectionObserver' in window)) {
      drops.forEach((el) => el.classList.add('in'));
      return;
    }

    const dropIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        dropIo.unobserve(el);
        el.classList.add('in');
      });
    }, { threshold: 0.12 });

    drops.forEach((el) => {
      if (!el.classList.contains('in')) {
        dropIo.observe(el);
      }
    });
  }

  function buildExp(mode) {
    M = getExpData()[mode];
    on = [];
    lastNew = -1;
    shown = M.base;

    const xBp = $('x-bp'), xBen = $('x-ben');
    if (xBp) xBp.textContent = fmtExp(M.base);

    // Direct text sync: ensure every element displays the active mode's text immediately
    const xBn = $('x-bn'), xBs = $('x-bs'), xQ = $('x-q');
    if (xBn) xBn.textContent = M.bn;
    if (xBs) xBs.textContent = M.bs;
    if (xQ) xQ.textContent = M.q;

    const xPh = $('x-ph'), xVl = $('x-vl'), xL1 = $('x-l1'), xL2 = $('x-l2'), xNote = $('x-note');
    if (xPh) xPh.textContent = M.ph;
    if (xVl) xVl.textContent = M.vl;
    if (xL1) xL1.textContent = M.l1;
    if (xL2) xL2.textContent = M.l2;
    if (xNote) xNote.textContent = M.note;

    const xH = $('x-h'), xLead = $('x-lead'), xMsg = $('x-msg'), xOther = $('x-other');
    if (xH) xH.innerHTML = M.h;
    if (xLead) xLead.textContent = M.lead;
    if (xMsg) xMsg.innerHTML = M.msg;
    if (xOther) xOther.innerHTML = M.other || '';

    if (xBen) {
      xBen.innerHTML = M.ben
        .map((b, i) => {
          const fromR = i % 2 === 1 ? ' from-r' : '';
          const delay = (i * 0.08).toFixed(2);
          return `<div class="glass drop${fromR}" data-from="${i % 2 ? 'r' : 'l'}" style="animation-delay:${delay}s">` +
            '<span class="ripple" aria-hidden="true"></span>' +
            '<b>0' + (i + 1) + '</b>' +
            '<strong id="x-ben-s-' + i + '" data-dec="' + esc(b[0]) + '">' + esc(b[0]) + '</strong>' +
            '<span id="x-ben-t-' + i + '" data-dec="' + esc(b[1]) + '">' + esc(b[1]) + '</span>' +
            '</div>';
        })
        .join('');
    }

    if (addsEl) {
      addsEl.innerHTML = '';
      M.adds.forEach((a, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'add glass sm pop';
        b.style.setProperty('--i', i);
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<i aria-hidden="true">✓</i><div><b id="x-add-b-' + i + '">' + a[0] + '</b><small>' + a[1] + '</small></div><em>' +
          (a[2] ? '+' + fmtExp(a[2]) : (getLang() === 'en' ? 'reserve' : 'rezerviši')) + '</em>';
        b.addEventListener('click', () => {
          on[i] = !on[i];
          b.classList.toggle('on', on[i]);
          b.setAttribute('aria-pressed', on[i] ? 'true' : 'false');
          lastNew = on[i] ? i : -1;
          renderExp();
        });
        addsEl.appendChild(b);
      });
    }

    renderExp();
    registerExpScrollDecodes();

    // Ensure active #vs comparison drops are ready
    const activeVsWrap = document.querySelector('#vs .wrap[data-m="' + mode + '"]');
    if (activeVsWrap) {
      activeVsWrap.querySelectorAll('.drop').forEach((d) => d.classList.add('in'));
    }

    refreshAllScrollDecodes(false);
    setTimeout(initDropAnimations, 80);
  }

  function renderExp() {
    const items = M.baseItems.map((b) => ({ d: b[0], t: b[1], l: b[2], x: false, i: -1 }));
    M.adds.forEach((a, i) => {
      if (on[i]) items.push({ d: a[3], t: a[4], l: a[5], x: true, i: i });
    });

    let h = '';
    M.groups.forEach((dn, d) => {
      const its = items.filter((it) => it.d === d).sort((a, b) => (a.t < b.t ? -1 : 1));
      if (!its.length) return;
      h += '<div class="day"><h4>' + dn + '</h4><ul>' +
        its.map((it) => '<li class="' + (it.x ? 'x' : '') + (it.i === lastNew ? ' new' : '') + '"><span>' + it.t + '</span>' + it.l + '</li>').join('') +
        '</ul></div>';
    });

    const daysEl = $('days');
    if (daysEl) daysEl.innerHTML = h;

    const extra = M.adds.reduce((s, a, i) => s + (on[i] ? a[2] : 0), 0);
    const n = on.filter(Boolean).length;
    const ps = $('ps');
    if (ps) ps.textContent = n ? M.full(n, words(n)) : M.empty;

    const tot = M.base + extra;
    const ba = $('ba'), bb = $('bb');
    if (ba) ba.style.flexBasis = ((M.base / tot) * 100) + '%';
    if (bb) bb.style.flexBasis = ((extra / tot) * 100) + '%';

    tweenExpTot(tot);
  }

  function tweenExpTot(to) {
    const from = shown;
    const t0 = performance.now();
    const Dd = reduce ? 0 : 500;
    (function step(now) {
      const k = Dd ? Math.min(1, (now - t0) / Dd) : 1;
      shown = from + (to - from) * (1 - Math.pow(1 - k, 3));
      const totEl = $('tot');
      if (totEl) totEl.textContent = fmtExp(shown);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  OJ.fns.push(buildExp);
  buildExp(OJ.mode);
  registerCalcAndVsScrollDecodes();

  const expElement = $('exp');
  if (expElement) expElement.classList.add('in-view');

  setTimeout(initDropAnimations, 200);

  window.addEventListener('bulevar:langchange', () => {
    applyScene(OJ.mode);
    calcMode(OJ.mode);
    buildExp(OJ.mode);
    registerCalcAndVsScrollDecodes();
    refreshAllScrollDecodes(true);
    drawFeed(lastP >= 0 ? lastP : 0, true);

    const h1El = $('oj-h1'), ipEl = $('oj-ip');
    if (h1El) h1El._sdKey = '';
    if (ipEl) ipEl._sdKey = '';
    const cnEl = $('oj-cn'), chEl = $('oj-ch'), cpEl = $('oj-cp');
    if (cnEl) cnEl._sdKey = '';
    if (chEl) chEl._sdKey = '';
    if (cpEl) cpEl._sdKey = '';
  });
}
