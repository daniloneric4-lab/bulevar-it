import * as THREE from 'three';
import { initLandingPage } from './landingHelper.js';
import { createLandingLaptop } from './landingLaptop.js';
import { getLang } from './i18n.js';

export function initLpZastoSajt() {
  initLandingPage({
    defaultAnchor: 'zasto-sajt',
    defaultCilj: 'zakazivanje',
    defaultIzvor: 'lp1'
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══════════════════════════════════════════════════════════
  // 1. HERO Answer Animation: Strikethrough & Decode
  // ═══════════════════════════════════════════════════════════
  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
  function decodeEl(el, dur = 800, txt) {
    if (!el) return;
    txt = txt || el.dataset.t || el.textContent;
    el.dataset.t = txt;
    const tok = (el._tok || 0) + 1;
    el._tok = tok;
    el.innerHTML = '';
    const sp = [...txt].map(c => {
      const s = document.createElement('span');
      s.textContent = c;
      s.dataset.c = c;
      el.appendChild(s);
      return s;
    });
    const n = sp.length, t0 = performance.now();
    (function f(t) {
      if (el._tok !== tok) return;
      const p = Math.min(1, (t - t0) / dur);
      const k = Math.floor(p * (n + 5)) - 5;
      sp.forEach((s, i) => {
        if (p >= 1 || i < k) {
          s.className = '';
          s.textContent = s.dataset.c;
        } else if (i < k + 5 && s.dataset.c !== ' ') {
          s.className = 'r';
          s.textContent = GL[(Math.random() * GL.length) | 0];
        } else {
          s.className = 'h';
          s.textContent = s.dataset.c;
        }
      });
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  const ansEl = document.getElementById('ans');
  const ansNewEl = document.getElementById('ansNew');
  if (ansEl && ansNewEl) {
    if (reduce) {
      ansEl.classList.add('go');
      ansNewEl.textContent = ansNewEl.dataset.t || 'Da donosi klijente, dok vi radite.';
    } else {
      setTimeout(() => {
        ansEl.classList.add('go');
        setTimeout(() => {
          decodeEl(ansNewEl, 1100);
        }, 650);
      }, 900);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. Goal Options & Screen Canvas (1280x800)
  // ═══════════════════════════════════════════════════════════
  const IC = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/></svg>'
  };

  const G_SR = [
    {
      key: 'zakazivanje',
      ic: 'cal',
      t: 'Zakazivanje i rezervacije',
      d: 'Gost bira termin, uslugu i plaća <b>direktno kod vas</b>. Zadržavate 100% zarade i kontakt gosta za sledeću sezonu.',
      n: 'Posrednik + provizija po rezervaciji',
      y: 'Direktna rezervacija, kontakt ostaje vama'
    },
    {
      key: 'prodaja',
      ic: 'cart',
      t: 'Direktna prodaja i porudžbine',
      d: 'Sopstveni web shop ili dostava <b>bez procenta</b> Wolt-a, Glova ili posrednika. Troškovi ne rastu sa svakom porudžbinom.',
      n: 'Procenat od svake porudžbine',
      y: 'Porudžbina stiže direktno vama'
    },
    {
      key: 'upiti',
      ic: 'msg',
      t: 'Automatska ponuda i upiti',
      d: 'Interaktivni upitnik koji sam filtrira klijente, preporuči paket i <b>pošalje predračun</b>. Ne gubite sate na telefonu.',
      n: 'Sati na telefonu za svaku ponudu',
      y: 'Predračun stiže sam, za minut'
    },
    {
      key: 'brend',
      ic: 'star',
      t: 'Poverenje i autoritet brenda',
      d: 'Dizajn, priča i studije slučaja koji vas izdvajaju iz mase prosečnih firmi i <b>omogućavaju da naplatite višu cenu</b>.',
      n: 'Borba niskom cenom',
      y: 'Klijent zna zašto plaća više'
    }
  ];

  const G_EN = [
    {
      key: 'zakazivanje',
      ic: 'cal',
      t: 'Appointments & Reservations',
      d: 'Clients choose date, service and pay <b>directly with you</b>. You keep 100% of revenue and retain contact info.',
      n: 'Aggregators + commission per booking',
      y: 'Direct booking, contact stays yours'
    },
    {
      key: 'prodaja',
      ic: 'cart',
      t: 'Direct Sales & Orders',
      d: 'Own online store or direct ordering <b>without aggregator cuts</b>. Costs do not scale with every order.',
      n: 'Commission fee on every single order',
      y: 'Order arrives directly to you'
    },
    {
      key: 'upiti',
      ic: 'msg',
      t: 'Automated Quotes & Inquiries',
      d: 'Interactive questionnaire that qualifies leads, recommends packages and <b>issues estimates</b> automatically.',
      n: 'Hours spent on phone per proposal',
      y: 'Estimate arrives in under 60 seconds'
    },
    {
      key: 'brend',
      ic: 'star',
      t: 'Brand Authority & Trust',
      d: 'Design, story and case studies that set you apart from average businesses and <b>justify premium pricing</b>.',
      n: 'Price wars and discounting',
      y: 'Client understands the true value'
    }
  ];

  function getG() {
    return getLang() === 'en' ? G_EN : G_SR;
  }

  const optsContainer = document.getElementById('opts');
  const mdescEl = document.getElementById('mdesc');
  const vsNEl = document.getElementById('vsN');
  const vsYEl = document.getElementById('vsY');
  const detailBtn = document.getElementById('lp-detail-btn');
  const openBtns = document.querySelectorAll('.js-open-upitnik');

  let cur = 0;
  let tStart = performance.now();
  let auto = !reduce;
  let prev = -1;
  let swapT = -9;
  let OB = [];

  function pick(i) {
    const gList = getG();
    if (i === cur && prev !== -1) {
      tStart = performance.now();
      return;
    }
    prev = cur;
    cur = i;
    tStart = performance.now();
    swapT = performance.now();

    OB.forEach((b, j) => b.classList.toggle('on', j === i));
    if (mdescEl) mdescEl.innerHTML = gList[i].d;
    if (vsNEl) vsNEl.textContent = gList[i].n;
    if (vsYEl) vsYEl.textContent = gList[i].y;

    const selectedGoal = gList[i].key;
    if (window.__buildMainUrl && detailBtn && detailBtn.getAttribute('data-detail-anchor')) {
      detailBtn.href = window.__buildMainUrl('zasto-sajt', { cilj: selectedGoal, izvor: 'lp1' });
    }
    openBtns.forEach(btn => btn.setAttribute('data-goal', selectedGoal));

    if (optsContainer && OB[i]) {
      const targetLeft = OB[i].offsetLeft - (optsContainer.clientWidth - OB[i].clientWidth) / 2;
      optsContainer.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    }
  }

  function renderOpts() {
    if (!optsContainer) return;
    optsContainer.innerHTML = '';
    const gList = getG();
    gList.forEach((g, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (i === cur ? ' on' : '');
      b.innerHTML = `
        <span class="ic">${IC[g.ic]}</span>
        <h3>${g.t}</h3>
        <div class="d"><div><p>${g.d}</p></div></div>
        <svg class="ring" viewBox="0 0 22 22">
          <circle class="bg" cx="11" cy="11" r="9"/>
          <circle class="fg" cx="11" cy="11" r="9"/>
        </svg>
      `;
      b.onclick = () => {
        auto = false;
        pick(i);
      };
      optsContainer.appendChild(b);
    });
    OB = [...optsContainer.children];
    const activeG = gList[cur];
    if (mdescEl) mdescEl.innerHTML = activeG.d;
    if (vsNEl) vsNEl.textContent = activeG.n;
    if (vsYEl) vsYEl.textContent = activeG.y;
  }

  renderOpts();
  prev = 0;

  window.addEventListener('bulevar:langchange', () => {
    renderOpts();
  });

  // ═══════════════════════════════════════════════════════════
  // 3. 2D Canvas Demos (1280x800)
  // ═══════════════════════════════════════════════════════════
  const W = 1280, H = 800;
  const sc = document.createElement('canvas');
  sc.width = W;
  sc.height = H;
  const c = sc.getContext('2d');

  const C = {
    bg: '#0E1428',
    pan: '#161E38',
    pan2: '#1C2646',
    line: '#2A3658',
    gold: '#D9B25F',
    ink: '#F3EEE3',
    mut: '#A7AEC2',
    or: '#E8963A',
    ok: '#7FC8A0'
  };

  const cl = x => Math.max(0, Math.min(1, x));
  const seg = (t, a, b) => cl((t - a) / (b - a));
  const eo = x => 1 - Math.pow(1 - x, 3);
  const eb = x => { const s = 1.7; x -= 1; return x * x * ((s + 1) * x + s) + 1; };
  const lerp = (a, b, t) => a + (b - a) * t;

  function rr(x, y, w, h, r) {
    c.beginPath();
    c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h);
  }
  function T(s, x, y, f, col, al) {
    c.font = f;
    c.fillStyle = col;
    c.textAlign = al || 'left';
    c.fillText(s, x, y);
  }
  const F = (w, s) => `${w} ${s}px Montserrat, sans-serif`;
  const M = (w, s) => `${w} ${s}px "IBM Plex Mono", monospace`;

  function card(x, y, w, h, r = 16, fill = C.pan, stroke = C.line) {
    rr(x, y, w, h, r);
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }

  function chrome(name, url) {
    c.fillStyle = C.bg;
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#0A0F1F';
    c.fillRect(0, 0, W, 58);
    ['#E8655A', '#E8B65A', '#6CC58A'].forEach((col, k) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(30 + k * 24, 29, 7, 0, 7);
      c.fill();
    });
    rr(420, 15, 440, 28, 14);
    c.fillStyle = '#161E38';
    c.fill();
    T(url, 640, 34, M(500, 14), C.mut, 'center');
    c.fillStyle = 'rgba(255,255,255,.03)';
    c.fillRect(0, 58, W, 70);
    T(name, 50, 104, F(900, 28), C.ink);
  }

  function cursor(t, pts) {
    if (reduce) return;
    let x = pts[0][1], y = pts[0][2];
    for (let k = 1; k < pts.length; k++) {
      const [t0, x0, y0] = pts[k - 1], [t1, x1, y1] = pts[k];
      if (t >= t0 && t <= t1) {
        const e = eo((t - t0) / (t1 - t0));
        x = lerp(x0, x1, e);
        y = lerp(y0, y1, e);
      } else if (t > t1) {
        x = x1;
        y = y1;
      }
    }
    pts.forEach(([tt, px, py, clk]) => {
      if (clk && t > tt && t < tt + 0.5) {
        const a = (t - tt) / 0.5;
        c.strokeStyle = `rgba(217,178,95,${1 - a})`;
        c.lineWidth = 3;
        c.beginPath();
        c.arc(px, py, 10 + 30 * a, 0, 7);
        c.stroke();
      }
    });
    c.save();
    c.translate(x, y);
    c.fillStyle = '#fff';
    c.strokeStyle = '#0B1020';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, 30);
    c.lineTo(8, 23);
    c.lineTo(14, 36);
    c.lineTo(20, 33);
    c.lineTo(14, 21);
    c.lineTo(25, 21);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  function toast(t, t0, title, sub) {
    const a = reduce ? 1 : eb(seg(t, t0, t0 + 0.45));
    if (a <= 0) return;
    c.save();
    c.globalAlpha = cl(a);
    c.translate(W - 360, H - 150 + (1 - a) * 40);
    card(-10, -50, 370, 110, 20, '#1B2340', 'rgba(217,178,95,.8)');
    c.fillStyle = C.gold;
    c.beginPath();
    c.arc(36, 5, 22, 0, 7);
    c.fill();
    c.strokeStyle = '#0B1020';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(26, 5);
    c.lineTo(34, 13);
    c.lineTo(47, -3);
    c.stroke();
    T(title, 74, -2, F(800, 20), C.ink);
    T(sub, 74, 26, F(500, 15), C.mut);
    c.restore();
  }

  const DUR = 7.2;
  const D = [
    // 0: Rezervacije (Salon)
    (t) => {
      const isEn = getLang() === 'en';
      chrome(isEn ? 'Your Salon' : 'Vaš salon', isEn ? 'your-salon.com' : 'vas-salon.rs');
      T(isEn ? '1. SERVICE' : '1. USLUGA', 50, 175, M(600, 14), C.gold);
      const sv = isEn ? [
        ['Haircut & blowdry', '45 min', '€25'],
        ['Coloring', '90 min', '€55'],
        ['Manicure', '40 min', '€20']
      ] : [
        ['Šišanje i feniranje', '45 min', '2.200 din'],
        ['Bojenje', '90 min', '4.800 din'],
        ['Manikir', '40 min', '1.600 din']
      ];
      const s1 = reduce || t > 1;
      sv.forEach(([a, b, p], k) => {
        const on = s1 && k === 0;
        card(50, 195 + k * 92, 560, 76, 14, on ? '#2A2414' : C.pan, on ? C.gold : C.line);
        T(a, 78, 240 + k * 92, F(700, 21), C.ink);
        T(b, 78, 262 + k * 92, M(500, 13), C.mut);
        T(p, 585, 244 + k * 92, F(800, 20), on ? C.gold : C.ink, 'right');
      });

      T(isEn ? '2. DATE' : '2. TERMIN', 660, 175, M(600, 14), C.gold);
      const days = isEn ? ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15'] : ['Pon 12', 'Uto 13', 'Sre 14', 'Čet 15'];
      days.forEach((d, k) => {
        const on = reduce || (t > 1.9 && k === 1);
        card(660 + k * 140, 195, 124, 76, 14, on ? C.gold : C.pan, on ? C.gold : C.line);
        T(d.split(' ')[0], 722 + k * 140, 226, M(500, 13), on ? '#0B1020' : C.mut, 'center');
        T(d.split(' ')[1], 722 + k * 140, 256, F(800, 22), on ? '#0B1020' : C.ink, 'center');
      });

      const sl = ['09:00', '11:30', '14:00', '16:30', '18:00', '19:30'];
      sl.forEach((s, k) => {
        const x = 660 + (k % 3) * 186, y = 295 + Math.floor(k / 3) * 70;
        const on = reduce || (t > 2.7 && k === 3);
        const busy = k === 1;
        card(x, y, 170, 56, 12, on ? C.gold : C.pan, on ? C.gold : C.line);
        T(s, x + 85, y + 36, F(700, 19), on ? '#0B1020' : busy ? 'rgba(167,174,194,.35)' : C.ink, 'center');
      });

      const bt = reduce || t > 3.5;
      rr(660, 470, 540, 70, 35);
      c.fillStyle = bt ? '#E4C273' : C.gold;
      c.fill();
      T(isEn ? 'Book & pay with card →' : 'Rezerviši i plati karticom →', 930, 514, F(800, 21), '#0B1020', 'center');
      T(isEn ? 'ZERO COMMISSION · INSTANT CONFIRMATION' : 'BEZ PROVIZIJE · POTVRDA STIŽE ODMAH', 930, 575, M(500, 13), C.mut, 'center');

      cursor(t, [[0, 900, 700], [0.9, 330, 233, 1], [1.7, 862, 233, 1], [2.5, 1032, 323, 1], [3.3, 930, 505, 1], [4.5, 1000, 660]]);
      toast(t, 3.8, isEn ? 'Booking confirmed' : 'Termin rezervisan', isEn ? 'Tue 13 · 16:30 · paid €25' : 'Uto 13 · 16:30 · plaćeno 2.200 din');
    },

    // 1: Prodaja (Picerija)
    (t) => {
      const isEn = getLang() === 'en';
      chrome(isEn ? 'Your Pizzeria' : 'Vaša picerija', isEn ? 'your-pizzeria.com' : 'vasa-picerija.rs');
      const it = isEn ? [
        ['Margherita', '€8.50'],
        ['Capricciosa', '€10.50'],
        ['Prosciutto', '€12.50'],
        ['Veggie', '€9.00']
      ] : [
        ['Margarita', '890 din'],
        ['Kapricoza', '1.090 din'],
        ['Pršuta', '1.290 din'],
        ['Vege', '950 din']
      ];
      const added = (k) => reduce || ((k === 0 && t > 1.1) || (k === 2 && t > 2.1));
      it.forEach(([n, p], k) => {
        const x = 50 + k * 230;
        card(x, 160, 210, 330, 18, C.pan2);
        const g = c.createRadialGradient(x + 105, 250, 10, x + 105, 250, 70);
        g.addColorStop(0, '#E8963A');
        g.addColorStop(0.6, '#C8742E');
        g.addColorStop(1, '#5A3418');
        c.fillStyle = g;
        c.beginPath();
        c.arc(x + 105, 250, 66, 0, 7);
        c.fill();
        c.fillStyle = 'rgba(243,238,227,.7)';
        [[-20, -15], [18, -8], [-5, 22], [25, 20], [-28, 15]].forEach(([dx, dy]) => {
          c.beginPath();
          c.arc(x + 105 + dx, 250 + dy, 7, 0, 7);
          c.fill();
        });
        T(n, x + 20, 358, F(800, 21), C.ink);
        T(p, x + 20, 386, F(600, 17), C.mut);
        const on = added(k);
        rr(x + 20, 410, 170, 52, 26);
        c.fillStyle = on ? 'rgba(217,178,95,.2)' : C.gold;
        c.fill();
        if (on) {
          c.strokeStyle = C.gold;
          c.lineWidth = 2;
          c.stroke();
        }
        T(on ? (isEn ? '✓ In Cart' : '✓ U korpi') : (isEn ? '+ Add' : '+ Dodaj'), x + 105, 443, F(800, 17), on ? C.gold : '#0B1020', 'center');
      });

      const n = reduce ? 2 : (t > 1.1) + (t > 2.1);
      const bump = reduce ? 0 : Math.max(eb(seg(t, 1.1, 1.4)) * (t < 1.6), eb(seg(t, 2.1, 2.4)) * (t < 2.6));
      card(980, 160, 250, 330, 18, C.pan2, n ? 'rgba(217,178,95,.7)' : C.line);
      T(isEn ? 'CART' : 'KORPA', 1005, 200, M(600, 14), C.gold);
      c.save();
      c.translate(1185, 195);
      c.scale(1 + 0.3 * (bump % 1 || 0), 1 + 0.3 * (bump % 1 || 0));
      c.fillStyle = C.gold;
      c.beginPath();
      c.arc(0, 0, 18, 0, 7);
      c.fill();
      T(String(n), 0, 7, F(800, 18), '#0B1020', 'center');
      c.restore();

      if (reduce || t > 1.1) T(isEn ? 'Margherita' : 'Margarita', 1005, 250, F(600, 17), C.ink);
      if (reduce || t > 2.1) T(isEn ? 'Prosciutto' : 'Pršuta', 1005, 282, F(600, 17), C.ink);
      T(isEn ? 'Total' : 'Ukupno', 1005, 380, F(500, 16), C.mut);
      T(n === 2 ? (isEn ? '€21.00' : '2.180 din') : n === 1 ? (isEn ? '€8.50' : '890 din') : (isEn ? '€0.00' : '0 din'), 1205, 380, F(800, 20), C.ink, 'right');
      rr(1005, 410, 200, 52, 26);
      c.fillStyle = n ? C.gold : C.line;
      c.fill();
      T(isEn ? 'Order →' : 'Poruči →', 1105, 443, F(800, 17), '#0B1020', 'center');
      T(isEn ? 'PAY ONLINE OR CASH ON DELIVERY · 35 MIN DELIVERY' : 'PLAĆANJE KARTICOM ILI POUZEĆEM · DOSTAVA 35 MIN', 640, 560, M(500, 14), C.mut, 'center');

      cursor(t, [[0, 700, 700], [0.9, 155, 436, 1], [1.9, 615, 436, 1], [2.9, 1105, 436, 1], [4.2, 900, 650]]);
      toast(t, 3.3, isEn ? 'Order received' : 'Porudžbina primljena', isEn ? 'Arrives in 35 min · 0% aggregator cut' : 'Stiže za 35 min · bez procenta posredniku');
    },

    // 2: Upiti (Servis)
    (t) => {
      const isEn = getLang() === 'en';
      chrome(isEn ? 'Your Service' : 'Vaš servis', isEn ? 'your-service.com' : 'vas-servis.rs');
      const step = reduce ? 3 : (t < 1.3 ? 0 : t < 2.6 ? 1 : t < 3.4 ? 2 : 3);
      rr(50, 150, 1180, 8, 4);
      c.fillStyle = C.line;
      c.fill();
      rr(50, 150, 1180 * (reduce ? 1 : Math.min(1, (t / 3.6))), 8, 4);
      c.fillStyle = C.gold;
      c.fill();

      if (step < 3) {
        const Q = isEn ? [
          ['What do you need?', ['AC Installation', 'Service', 'Cleaning']],
          ['Room square footage?', null],
          ['Preferred timeframe?', ['This week', 'Next week', 'Flexible']]
        ][step] : [
          ['Šta vam treba?', ['Ugradnja klime', 'Servis', 'Čišćenje']],
          ['Kolika je prostorija?', null],
          ['Kada vam odgovara?', ['Ove nedelje', 'Sledeće nedelje', 'Nije hitno']]
        ][step];
        T(isEn ? 'QUESTION ' + (step + 1) + ' / 3' : 'PITANJE ' + (step + 1) + ' / 3', 50, 215, M(600, 14), C.gold);
        T(Q[0], 50, 268, F(900, 40), C.ink);
        if (Q[1]) {
          Q[1].forEach((o, k) => {
            const on = (step === 0 && t > 1.0 && k === 0) || (step === 2 && t > 3.1 && k === 1);
            card(50 + k * 390, 310, 370, 96, 18, on ? '#2A2414' : C.pan, on ? C.gold : C.line);
            T(o, 80 + k * 390, 368, F(700, 22), C.ink);
          });
        } else {
          const v = lerp(20, 38, eo(seg(t, 1.6, 2.4)));
          rr(50, 345, 1000, 10, 5);
          c.fillStyle = C.line;
          c.fill();
          rr(50, 345, 1000 * (v - 10) / 50, 10, 5);
          c.fillStyle = C.gold;
          c.fill();
          c.fillStyle = C.gold;
          c.beginPath();
          c.arc(50 + 1000 * (v - 10) / 50, 350, 18, 0, 7);
          c.fill();
          T(Math.round(v) + (isEn ? ' sq m' : ' m²'), 1110, 362, F(900, 34), C.ink);
        }
      } else {
        if (!reduce && t < 3.9) {
          T((isEn ? 'Generating quote' : 'Pravimo ponudu') + '.'.repeat(1 + Math.floor(t * 6) % 3), 640, 360, F(800, 30), C.mut, 'center');
        } else {
          const b = reduce ? 1 : eb(seg(t, 3.9, 4.4));
          c.save();
          c.globalAlpha = cl(b);
          c.translate(640, 370);
          c.scale(0.9 + 0.1 * b, 0.9 + 0.1 * b);
          card(-420, -180, 840, 330, 24, C.pan2, 'rgba(217,178,95,.8)');
          T(isEn ? 'RECOMMENDATION FOR YOU' : 'PREPORUKA ZA VAS', -380, -128, M(600, 14), C.gold);
          T(isEn ? 'Standard Package · Installation' : 'Paket Standard · ugradnja', -380, -78, F(900, 32), C.ink);
          T(isEn ? 'AC 12,000 BTU · 38 m² room · next week' : 'Klima 12.000 BTU · prostorija 38 m² · sledeće nedelje', -380, -40, F(500, 18), C.mut);
          T(isEn ? '€320' : '38.000 din', -380, 40, F(900, 52), C.gold);
          T(isEn ? 'incl. VAT and materials' : 'sa PDV-om i materijalom', -380, 74, F(500, 16), C.mut);
          rr(110, -6, 270, 60, 30);
          c.fillStyle = C.gold;
          c.fill();
          T(isEn ? 'Accept slot →' : 'Prihvati termin →', 245, 32, F(800, 18), '#0B1020', 'center');
          c.restore();
        }
      }
      cursor(t, [[0, 800, 700], [0.9, 235, 358, 1], [1.6, 430, 350], [2.4, 780, 350], [3.0, 625, 358, 1], [4.6, 1020, 560, 1], [5.5, 980, 650]]);
      toast(t, 4.8, isEn ? 'Quote sent to email' : 'Predračun poslat na email', isEn ? 'And a copy to your CRM with answers' : 'I kopija vama, sa svim odgovorima');
    },

    // 3: Brend & Poverenje
    (t) => {
      const isEn = getLang() === 'en';
      chrome(isEn ? 'Your Brand' : 'Vaš brend', isEn ? 'your-brand.com' : 'vas-brend.rs');
      const a = reduce ? 1 : eo(seg(t, 0.1, 0.8));
      c.globalAlpha = a;
      T(isEn ? '15 years. 1,200 projects.' : '15 godina. 1.200 projekata.', 50, 220, F(900, 46), C.ink);
      T(isEn ? 'One standard.' : 'Jedan standard.', 50, 276, F(900, 46), C.gold);
      T(isEn ? 'We only build what we would build for ourselves.' : 'Radimo samo ono što bismo i sebi uradili.', 50, 320, F(500, 19), C.mut);
      c.globalAlpha = 1;

      const R = isEn ? [
        ['Mark P.', 'Arrived on time, spotless work. Upfront pricing.'],
        ['Elena S.', 'The most professional agency we contacted. High ROI.'],
        ['David R.', 'Their guarantee is a real guarantee.']
      ] : [
        ['Marko P.', 'Došli na vreme, sve čisto. Cena jasna od početka.'],
        ['Jelena S.', 'Najozbiljnija firma koju smo zvali. Isplati se.'],
        ['Dušan R.', 'Garancija je stvarno garancija.']
      ];
      R.forEach(([n, q], k) => {
        const b = reduce ? 1 : eb(seg(t, 1 + k * 0.45, 1.45 + k * 0.45));
        if (b <= 0) return;
        c.save();
        c.globalAlpha = cl(b);
        c.translate(50 + k * 395, 380 + (1 - b) * 30);
        card(0, 0, 375, 170, 18, C.pan2);
        T('★★★★★', 24, 42, F(700, 20), C.gold);
        c.font = F(600, 17);
        c.fillStyle = C.ink;
        const w = q.split(' ');
        let line = '', yy = 80;
        w.forEach(x => {
          if (c.measureText(line + x).width > 320) {
            c.fillText(line, 24, yy);
            line = '';
            yy += 24;
          }
          line += x + ' ';
        });
        c.fillText(line, 24, yy);
        T(n, 24, 150, M(500, 13), C.mut);
        c.restore();
      });

      const s = reduce ? 1 : eb(seg(t, 2.8, 3.3));
      if (s > 0) {
        c.save();
        c.globalAlpha = cl(s);
        c.translate(860, 200);
        c.scale(0.85 + 0.15 * s, 0.85 + 0.15 * s);
        card(-30, -70, 400, 180, 22, '#231F14', 'rgba(217,178,95,.8)');
        T(isEn ? 'CASE STUDY' : 'STUDIJA SLUČAJA', 0, -28, M(600, 13), C.gold);
        const upCount = reduce ? 42 : Math.round(42 * eo(seg(t, 3, 4.2)));
        T('+' + upCount + (isEn ? '% inquiries' : '% upita'), 0, 40, F(900, 46), C.ink);
        T(isEn ? 'in 6 months, at higher price points' : 'za 6 meseci, uz višu cenu', 0, 78, F(500, 16), C.mut);
        c.restore();
      }

      T(isEn ? 'EXAMPLE · DEMO METRICS' : 'PRIMER · IZMIŠLJENI PODACI', W - 50, H - 30, M(500, 12), C.mut, 'right');
      cursor(t, [[0, 700, 720], [2.2, 600, 470], [3.5, 1000, 230, 1], [5, 900, 700]]);
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // 4. 3D Laptop Setup & Animation Loop
  // ═══════════════════════════════════════════════════════════
  const host = document.getElementById('gl');
  if (!host) return;

  const laptopCtrl = createLandingLaptop({
    host,
    canvas: sc,
    initialLidAngle: -0.22,
    cameraZ: 8.0,
    cameraY: 1.3,
    lookAtY: 0.5,
    fov: 28
  });

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', e => {
    tx = (e.clientX / window.innerWidth) - 0.5;
    ty = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (e.touches && e.touches[0]) {
      tx = (e.touches[0].clientX / window.innerWidth) - 0.5;
      ty = (e.touches[0].clientY / window.innerHeight) - 0.5;
    }
  }, { passive: true });

  let visible = false;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(host);
  } else {
    visible = true;
  }

  const rings = OB.map(b => b.querySelector('.fg'));

  function frame(now) {
    if (visible) {
      try {
        laptopCtrl.setLidAngle(-0.22);

        let t = (now - tStart) / 1000;
        const gList = getG();
        if (t > DUR) {
          if (auto) {
            pick((cur + 1) % gList.length);
            t = 0;
          } else {
            tStart = now;
            t = 0;
          }
        }

        rings.forEach((r, j) => {
          if (r) {
            r.style.strokeDashoffset = (j === cur && auto && !reduce)
              ? String(57 * (1 - Math.min(1, t / DUR)))
              : '57';
          }
        });

        D[cur](reduce ? DUR : t);

        const sw = (now - swapT) / 1000;
        if (sw < 0.45 && !reduce) {
          const a = 1 - sw / 0.45;
          c.fillStyle = `rgba(217,178,95,${0.18 * a})`;
          c.fillRect(0, 0, W, H);
          c.fillStyle = `rgba(14,20,40,${a * 0.9})`;
          c.fillRect(0, 58, W, (H - 58) * a);
        }

        laptopCtrl.texture.needsUpdate = true;

        mx += (tx - mx) * 0.06;
        my += (ty - my) * 0.06;

        const lap = laptopCtrl.laptop;
        const cam = laptopCtrl.camera;
        const isMob = window.innerWidth <= 900;
        const lapX = isMob ? 0 : 0.12;

        lap.position.x = lapX;
        if (!reduce) {
          lap.rotation.y = -0.18 + mx * 0.22 + Math.sin(now / 3000) * 0.03;
          lap.rotation.x = 0.05 + my * 0.05;
          lap.position.y = (isMob ? -0.28 : -0.20) + Math.sin(now / 1600) * 0.03;
        } else {
          lap.rotation.y = -0.18;
          lap.rotation.x = 0.05;
          lap.position.y = isMob ? -0.28 : -0.20;
        }

        const vf = cam.fov * Math.PI / 180;
        const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
        const fitW = isMob ? 5.2 : 5.1;
        const fitH = isMob ? 4.2 : 4.1;
        const z = Math.max(fitW / 2 / Math.tan(hf / 2), fitH / 2 / Math.tan(vf / 2));
        cam.position.set(lapX, 1.15, z);
        cam.lookAt(lapX, 0.50, 0);

        laptopCtrl.renderer.render(laptopCtrl.scene, cam);
      } catch (err) {
        console.error('LpZastoSajt frame error:', err);
      }
    }
    requestAnimationFrame(frame);
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(frame));
}

// Auto-run if script is directly included
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLpZastoSajt);
  } else {
    initLpZastoSajt();
  }
}
