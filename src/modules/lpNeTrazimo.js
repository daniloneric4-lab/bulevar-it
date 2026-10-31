import * as THREE from 'three';
import { initLandingPage } from './landingHelper.js';
import { createLandingLaptop } from './landingLaptop.js';
import { getLang } from './i18n.js';

export function initLpNeTrazimo() {
  initLandingPage({
    defaultAnchor: 'kako-razmisljamo',
    defaultCilj: 'metodologija',
    defaultIzvor: 'lp2'
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STEPS_SR = [
    {
      k: 'ANALIZA',
      s: 'Analiza',
      t: 'Razumemo vaš biznis i kupca',
      q: 'Ko tačno kupuje od vas?',
      d: 'Ko tačno kupuje od vas? Koje dileme ima pre odluke i zašto bira vas umesto konkurencije?'
    },
    {
      k: 'ARHITEKTURA',
      s: 'Put',
      t: 'Definišemo put kupca',
      q: 'Šta kupac treba da vidi prvo, a šta posle?',
      d: 'Sajt vodimo kao jasan razgovor: od prvog utiska na ekranu do logičnog sledećeg koraka.'
    },
    {
      k: 'OPTIMIZACIJA',
      s: 'Prepreke',
      t: 'Uklanjamo prepreke do kupovine',
      q: 'Koliko koraka deli posetioca od kupovine?',
      d: 'Ne tražimo od posetioca 15 klikova i popunjavanje 10 polja. Put do cilja mora biti trenutan.'
    },
    {
      k: 'SISTEM',
      s: 'Sistem',
      t: 'Gradimo sistem koji radi 24/7',
      q: 'Šta sajt može da radi sam, dok vi spavate?',
      d: 'Online zakazivanje, direktne porudžbine, automatske ponude ili naplata karticom na sajtu.'
    },
    {
      k: 'INTEGRACIJA',
      s: 'Alati',
      t: 'Povezujemo alate koje već koristite',
      q: 'Koje alate već plaćate i koristite?',
      d: 'CRM, Google kalendar, email marketing, analitiku i oglašavanje u jednu povezanu celinu.'
    },
    {
      k: 'MERENJE',
      s: 'Brojevi',
      t: 'Merimo rezultate, ne samo posete',
      q: 'Šta je za vas uspeh, u brojevima?',
      d: 'Broj rezervacija, vrednost korpe i procenat konverzije. Tačno znate šta vam sajt donosi.'
    },
    {
      k: 'EVOLUCIJA',
      s: 'Rast',
      t: 'Učimo i unapređujemo zajedno',
      q: 'Šta smo naučili ovog meseca?',
      d: 'Lansiranje je tek početak. Pratimo podatke, optimizujemo i rastemo zajedno sa vašim biznisom.'
    }
  ];

  const STEPS_EN = [
    {
      k: 'ANALYSIS',
      s: 'Analysis',
      t: 'We understand your business & audience',
      q: 'Who exactly buys from you?',
      d: 'Who buys from you? What hesitations do they face, and why choose you over alternatives?'
    },
    {
      k: 'ARCHITECTURE',
      s: 'Journey',
      t: 'We map the customer journey',
      q: 'What should visitors see first, and next?',
      d: 'We structure the site as a natural dialogue: from initial impression to clear next action.'
    },
    {
      k: 'OPTIMIZATION',
      s: 'Friction',
      t: 'We remove friction from conversions',
      q: 'How many steps separate visitor from buying?',
      d: 'We never demand 15 clicks or 10 form fields. The path to the goal must be frictionless.'
    },
    {
      k: 'SYSTEM',
      s: 'System',
      t: 'We engineer a 24/7 autonomous system',
      q: 'What can your site do while you sleep?',
      d: 'Automated booking, direct orders, instant quotes, or online card checkout directly on site.'
    },
    {
      k: 'INTEGRATION',
      s: 'Tools',
      t: 'We connect tools you already rely on',
      q: 'Which tools do you already pay for and use?',
      d: 'CRM, Google Calendar, email marketing, analytics and advertising into one unified pipeline.'
    },
    {
      k: 'MEASUREMENT',
      s: 'Metrics',
      t: 'We measure revenue, not vanity traffic',
      q: 'What defines commercial success in numbers?',
      d: 'Booking volume, cart value, and conversion rates. Know the precise ROI your site generates.'
    },
    {
      k: 'EVOLUTION',
      s: 'Growth',
      t: 'We iterate and scale together',
      q: 'What did the data reveal this month?',
      d: 'Launch is just day one. We track analytics, optimize conversion, and grow with your business.'
    }
  ];

  function getSteps() {
    return getLang() === 'en' ? STEPS_EN : STEPS_SR;
  }

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

  // ═══════════════════════════════════════════════════════════
  // Step Rail Buttons
  // ═══════════════════════════════════════════════════════════
  // Step Rail Buttons
  // ═══════════════════════════════════════════════════════════
  const rail = document.getElementById('rail');
  let railB = [];
  function renderRail() {
    if (!rail) return;
    rail.innerHTML = '';
    const steps = getSteps();
    steps.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<i><b></b></i><span>0${i + 1}</span>`;
      b.title = s.s;
      b.onclick = () => {
        const sec = document.querySelector('.proc');
        if (!sec) return;
        const top = sec.getBoundingClientRect().top + window.scrollY;
        const span = sec.offsetHeight - window.innerHeight;
        window.scrollTo({
          top: top + span * ((i + 0.35) / 7),
          behavior: reduce ? 'auto' : 'smooth'
        });
      };
      rail.appendChild(b);
    });
    railB = [...rail.children];
  }
  renderRail();

  // ═══════════════════════════════════════════════════════════
  // Canvas Setup (1280x800)
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

  function chrome(i) {
    const isEn = getLang() === 'en';
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
    T('vasbiznis.rs', 640, 34, M(500, 14), C.mut, 'center');
    T(isEn ? 'STEP 0' + (i + 1) + ' / 07' : 'KORAK 0' + (i + 1) + ' / 07', W - 30, 34, M(500, 13), C.gold, 'right');
  }

  function card(x, y, w, h, r = 16, fill = C.pan) {
    rr(x, y, w, h, r);
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = C.line;
    c.lineWidth = 1.5;
    c.stroke();
  }

  const draw = [
    // 01 ANALIZA
    (t, now) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Before the first pixel: questions.' : 'Pre prvog piksela: pitanja.', 70, 140, F(800, 40), C.ink);
      T(isEn ? 'NOTES FROM DISCOVERY CALL' : 'BELEŠKE SA PRVOG RAZGOVORA', 70, 180, M(500, 14), C.mut);
      const qs = isEn ? [
        'Who exactly buys from you?',
        'What hesitations do they face?',
        'Why choose you over competition?',
        'Where do they find you today?'
      ] : [
        'Ko tačno kupuje od vas?',
        'Šta ga brine pre odluke?',
        'Zašto bira vas, a ne konkurenciju?',
        'Gde vas danas pronalazi?'
      ];
      qs.forEach((q, k) => {
        const a = reduce ? 1 : eo(seg(t, 0.08 + k * 0.12, 0.3 + k * 0.12));
        if (!a) return;
        const y = 240 + k * 92;
        c.globalAlpha = a;
        card(70, y - 8 + (1 - a) * 20, 600, 70, 14);
        const ck = reduce ? 1 : seg(t, 0.22 + k * 0.12, 0.34 + k * 0.12);
        rr(94, y + 14, 28, 28, 8);
        c.strokeStyle = ck ? C.gold : C.line;
        c.lineWidth = 2;
        c.stroke();
        if (ck) {
          c.strokeStyle = C.gold;
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(101, y + 29);
          c.lineTo(101 + 5 * Math.min(1, ck * 2), y + 29 + 5 * Math.min(1, ck * 2));
          if (ck > 0.5) c.lineTo(101 + 5 + 10 * ((ck - 0.5) * 2), y + 34 - 11 * ((ck - 0.5) * 2));
          c.stroke();
        }
        T(q, 144, y + 36, F(600, 22), C.ink);
        c.globalAlpha = 1;
      });

      const a = reduce ? 1 : eb(seg(t, 0.35, 0.7));
      if (a > 0) {
        c.save();
        c.globalAlpha = cl(a);
        c.translate(940, 430);
        c.rotate(-0.035 * (1 - a));
        c.scale(0.85 + 0.15 * a, 0.85 + 0.15 * a);
        card(-210, -230, 420, 440, 22, C.pan2);
        c.fillStyle = 'rgba(217,178,95,.18)';
        c.beginPath();
        c.arc(-140, -160, 38, 0, 7);
        c.fill();
        T('A', -140, -147, F(800, 34), C.gold, 'center');
        T(isEn ? 'Buyer: Sarah, 34' : 'Kupac: Ana, 34', -82, -168, F(800, 24), C.ink);
        T(isEn ? 'BELGRADE · LOOKING FOR WEEKEND' : 'NOVI SAD · TRAŽI VIKEND', -82, -140, M(500, 13), C.mut);
        const cardItems = isEn ? [
          ['HESITATION', 'Does it match the photos?'],
          ['DECIDES', 'Evenings, on mobile'],
          ['CHOOSES YOU', 'Direct host communication']
        ] : [
          ['DILEMA', 'Da li je mesto kao na slikama?'],
          ['ODLUČUJE', 'Uveče, na telefonu'],
          ['BIRA VAS JER', 'Direktan kontakt sa domaćinom']
        ];
        cardItems.forEach(([k, v], j) => {
          const yy = -70 + j * 92;
          c.fillStyle = C.line;
          c.fillRect(-180, yy - 34, 360, 1);
          T(k, -180, yy - 6, M(600, 12), C.or);
          T(v, -180, yy + 24, F(600, 19), C.ink);
        });
        c.restore();
      }
    },

    // 02 ARHITEKTURA
    (t) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Customer journey, step by step.' : 'Put kupca, korak po korak.', 70, 140, F(800, 40), C.ink);
      T(isEn ? 'EVERY SCREEN HAS ONE JOB' : 'SVAKI EKRAN IMA JEDAN POSAO', 70, 180, M(500, 14), C.mut);
      const N = isEn ? [
        ['Google Ad', 'Discovers you'],
        ['Homepage', 'Understands offer'],
        ['Offer', 'Compares'],
        ['Booking', 'Decides'],
        ['Confirmation', 'Done ✓']
      ] : [
        ['Google oglas', 'Vidi vas'],
        ['Početna', 'Razume ponudu'],
        ['Ponuda', 'Upoređuje'],
        ['Rezervacija', 'Odlučuje'],
        ['Potvrda', 'Gotovo ✓']
      ];
      const P = [[150, 330], [400, 520], [650, 330], [900, 520], [1140, 330]];
      for (let k = 0; k < 4; k++) {
        const a = reduce ? 1 : seg(t, 0.12 + k * 0.14, 0.26 + k * 0.14);
        if (!a) continue;
        const [x1, y1] = P[k], [x2, y2] = P[k + 1];
        c.strokeStyle = C.gold;
        c.lineWidth = 3;
        c.setLineDash([10, 9]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a);
        c.stroke();
        c.setLineDash([]);
      }
      N.forEach(([n, s], k) => {
        const a = reduce ? 1 : eb(seg(t, 0.04 + k * 0.14, 0.2 + k * 0.14));
        if (a <= 0) return;
        const [x, y] = P[k];
        c.save();
        c.globalAlpha = cl(a);
        c.translate(x, y);
        c.scale(a, a);
        card(-100, -80, 200, 160, 16, k === 4 ? '#2A2414' : C.pan2);
        if (k === 4) {
          rr(-100, -80, 200, 160, 16);
          c.strokeStyle = C.gold;
          c.lineWidth = 2;
          c.stroke();
        }
        c.fillStyle = C.line;
        rr(-80, -60, 160, 46, 8);
        c.fill();
        c.fillStyle = 'rgba(243,238,227,.25)';
        c.fillRect(-80, 0, 120, 8);
        c.fillRect(-80, 16, 90, 8);
        c.fillStyle = k === 4 ? C.gold : 'rgba(217,178,95,.6)';
        rr(-80, 36, 70, 22, 11);
        c.fill();
        c.restore();

        c.globalAlpha = cl(a);
        T(n, x, y + 118, F(800, 20), C.ink, 'center');
        T(s.toUpperCase(), x, y + 144, M(500, 12), k === 4 ? C.gold : C.mut, 'center');
        c.globalAlpha = 1;
      });
    },

    // 03 OPTIMIZACIJA
    (t) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Fewer fields, more conversions.' : 'Manje polja, više upita.', 70, 140, F(800, 40), C.ink);
      const labels = isEn ? [
        'First Name', 'Last Name', 'Phone', 'Email', 'Address', 'City', 'Postal Code', 'How did you hear about us', 'Notes', 'Date'
      ] : [
        'Ime', 'Prezime', 'Telefon', 'Email', 'Adresa', 'Grad', 'Poštanski broj', 'Kako ste čuli za nas', 'Napomena', 'Datum'
      ];
      const keep = { 0: 1, 2: 1, 9: 1 };
      const col = reduce ? 1 : eo(seg(t, 0.25, 0.62));
      let y = 200;
      labels.forEach((l, k) => {
        const kp = keep[k];
        const hgt = kp ? 52 : 52 * (1 - col);
        const al = kp ? 1 : 1 - col;
        if (hgt < 1) return;
        c.globalAlpha = al;
        card(70, y, 560, hgt - 8, 10, C.pan);
        if (hgt > 30) {
          T(l, 92, y + hgt / 2 + 2, F(600, 17), kp && col > 0.5 ? C.ink : C.mut);
          if (!kp && col > 0) {
            c.strokeStyle = C.or;
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(88, y + hgt / 2 - 4);
            c.lineTo(88 + (c.measureText(l).width + 10) * Math.min(1, col * 3), y + hgt / 2 - 4);
            c.stroke();
          }
        }
        c.globalAlpha = 1;
        y += hgt;
      });

      const b = reduce ? 1 : eb(seg(t, 0.55, 0.8));
      if (b > 0) {
        c.save();
        c.globalAlpha = cl(b);
        c.translate(350, y + 40);
        c.scale(0.8 + 0.2 * b, 0.8 + 0.2 * b);
        rr(-280, -30, 560, 60, 30);
        c.fillStyle = C.gold;
        c.fill();
        T(isEn ? 'Book now →' : 'Rezervišite →', 0, 8, F(800, 22), '#0B1020', 'center');
        c.restore();
      }

      const n1 = Math.round(10 - 7 * col);
      const n2 = Math.round(15 - 13 * col);
      card(760, 200, 450, 200, 20, C.pan2);
      T(isEn ? 'FORM FIELDS' : 'POLJA U FORMI', 790, 245, M(500, 14), C.mut);
      T(String(n1), 790, 355, F(900, 96), col > 0.95 ? C.gold : C.ink);
      T(col > 0.95 ? (isEn ? 'instead of 10' : 'umesto 10') : '', 920, 355, F(600, 22), C.mut);

      card(760, 430, 450, 200, 20, C.pan2);
      T(isEn ? 'CLICKS TO GOAL' : 'KLIKOVA DO CILJA', 790, 475, M(500, 14), C.mut);
      T(String(n2), 790, 585, F(900, 96), col > 0.95 ? C.gold : C.ink);
      T(col > 0.95 ? (isEn ? 'instead of 15' : 'umesto 15') : '', 920, 585, F(600, 22), C.mut);
    },

    // 04 SISTEM
    (t, now) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Working while you sleep.' : 'Radi i dok vi spavate.', 70, 140, F(800, 40), C.ink);
      card(70, 190, 640, 540, 20, C.pan2);
      T(isEn ? 'JUNE' : 'JUN', 100, 236, M(600, 15), C.gold);
      const d = isEn ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
      d.forEach((x, k) => T(x, 118 + k * 82, 280, M(500, 13), C.mut, 'center'));
      for (let r = 0; r < 5; r++) {
        for (let k = 0; k < 7; k++) {
          const n = r * 7 + k + 1;
          if (n > 30) continue;
          const x = 118 + k * 82, y = 318 + r * 78;
          const busy = [3, 4, 11, 12, 17, 18, 25].includes(n);
          const sel = n === 20 || n === 21 || n === 22;
          const a = reduce ? (sel ? 1 : 0) : (sel ? seg(t, 0.2 + (n - 20) * 0.06, 0.3 + (n - 20) * 0.06) : 0);
          if (a > 0) {
            c.fillStyle = `rgba(217,178,95,${0.85 * a})`;
            rr(x - 30, y - 30, 60, 56, 12);
            c.fill();
          }
          T(String(n), x, y + 6, F(600, 19), a > 0.5 ? '#0B1020' : busy ? 'rgba(167,174,194,.35)' : C.ink, 'center');
        }
      }

      const s = reduce ? 1 : eb(seg(t, 0.45, 0.7));
      if (s > 0) {
        c.save();
        c.globalAlpha = cl(s);
        c.translate(980, 330);
        c.scale(0.85 + 0.15 * s, 0.85 + 0.15 * s);
        card(-220, -110, 440, 220, 20, '#1B2340');
        T(isEn ? '🌙  NEW RESERVATION' : '🌙  NOVA REZERVACIJA', -190, -58, M(600, 14), C.gold);
        T(isEn ? 'Weekend Jun 20–22' : 'Vikend 20–22. jun', -190, -10, F(800, 26), C.ink);
        T(isEn ? 'Card paid · confirmation sent' : 'Plaćeno karticom · potvrda poslata', -190, 26, F(500, 17), C.mut);
        T('23:47', -190, 74, M(600, 22), C.ink);
        c.restore();
      }

      const s2 = reduce ? 1 : eo(seg(t, 0.62, 0.85));
      if (s2 > 0) {
        c.globalAlpha = s2;
        card(760, 500, 440, 150, 20, C.pan);
        T('24/7', 790, 600, F(900, 72), C.gold);
        T(isEn ? 'no phone calls,' : 'bez poziva,', 990, 566, F(600, 18), C.mut);
        T(isEn ? 'no waiting' : 'bez čekanja', 990, 596, F(600, 18), C.mut);
        c.globalAlpha = 1;
      }
    },

    // 05 INTEGRACIJA
    (t, now) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'All your tools, one coherent system.' : 'Sve vaše alatke, jedna celina.', 70, 140, F(800, 40), C.ink);
      const cx = 640, cy = 470;
      const N = isEn ? [
        ['Google Calendar', -380, -150],
        ['CRM', -420, 90],
        ['Email', 0, -230],
        ['Analytics', 420, 90],
        ['Ads', 380, -150]
      ] : [
        ['Google kalendar', -380, -150],
        ['CRM', -420, 90],
        ['Email', 0, -230],
        ['Analitika', 420, 90],
        ['Oglasi', 380, -150]
      ];
      N.forEach(([n, dx, dy], k) => {
        const a = reduce ? 1 : seg(t, 0.15 + k * 0.09, 0.3 + k * 0.09);
        if (!a) return;
        const x = cx + dx, y = cy + dy;
        c.strokeStyle = 'rgba(217,178,95,.55)';
        c.lineWidth = 2.5;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + dx * a, cy + dy * a);
        c.stroke();
        if (a >= 1 && !reduce) {
          const u = ((now / 1400) + k * 0.2) % 1;
          c.fillStyle = C.gold;
          c.beginPath();
          c.arc(cx + dx * u, cy + dy * u, 6, 0, 7);
          c.fill();
        }
        const b = reduce ? 1 : eb(seg(t, 0.25 + k * 0.09, 0.4 + k * 0.09));
        if (b > 0) {
          c.save();
          c.globalAlpha = cl(b);
          c.translate(x, y);
          c.scale(b, b);
          c.font = F(700, 19);
          const w = c.measureText(n).width + 56;
          card(-w / 2, -32, w, 64, 32, C.pan2);
          T(n, 0, 7, F(700, 19), C.ink, 'center');
          c.restore();
        }
      });

      const a = reduce ? 1 : eb(seg(t, 0.02, 0.18));
      c.save();
      c.translate(cx, cy);
      c.scale(a, a);
      c.fillStyle = 'rgba(217,178,95,.12)';
      c.beginPath();
      c.arc(0, 0, 120 + 6 * Math.sin(now / 500), 0, 7);
      c.fill();
      c.fillStyle = C.gold;
      c.beginPath();
      c.arc(0, 0, 86, 0, 7);
      c.fill();
      T(isEn ? 'Your site' : 'Vaš sajt', 0, 8, F(900, 24), '#0B1020', 'center');
      c.restore();
    },

    // 06 MERENJE
    (t) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Metrics that actually matter.' : 'Brojevi koji znače nešto.', 70, 140, F(800, 40), C.ink);
      T(isEn ? 'SAMPLE · SIMULATED DATA' : 'PRIMER · IZMIŠLJENI PODACI', W - 70, 140, M(500, 13), C.mut, 'right');
      const k = reduce ? 1 : eo(seg(t, 0.08, 0.55));
      (isEn ? [
        ['BOOKINGS / MONTH', String(Math.round(128 * k)), ''],
        ['CONVERSION RATE', (4.2 * k).toFixed(1).replace('.', ','), '%'],
        ['AVERAGE ORDER', String(Math.round(186 * k)), ' €']
      ] : [
        ['REZERVACIJE / MESEC', String(Math.round(128 * k)), ''],
        ['KONVERZIJA', (4.2 * k).toFixed(1).replace('.', ','), '%'],
        ['PROSEČNA VREDNOST', String(Math.round(186 * k)), ' €']
      ]).forEach(([l, v, u], j) => {
        const x = 70 + j * 390;
        card(x, 180, 360, 150, 18, C.pan2);
        T(l, x + 28, 222, M(500, 13), C.mut);
        T(v + u, x + 28, 296, F(900, 52), j === 0 ? C.gold : C.ink);
      });

      card(70, 360, 1140, 370, 18, C.pan);
      T(isEn ? 'WEBSITE DIRECT BOOKINGS' : 'REZERVACIJE PREKO SAJTA', 100, 402, M(500, 13), C.mut);
      const pts = [12, 14, 13, 19, 22, 21, 29, 34, 33, 41, 47, 52];
      const L = reduce ? 1 : seg(t, 0.2, 0.8);
      c.strokeStyle = C.line;
      c.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        c.beginPath();
        c.moveTo(100, 450 + g * 70);
        c.lineTo(1180, 450 + g * 70);
        c.stroke();
      }
      c.strokeStyle = C.gold;
      c.lineWidth = 4;
      c.lineJoin = 'round';
      c.beginPath();
      const X = i => 100 + i * (1080 / 11), Y = v => 690 - v * 4.6, n = L * 11;
      for (let i = 0; i <= Math.floor(n); i++) {
        i ? c.lineTo(X(i), Y(pts[i])) : c.moveTo(X(i), Y(pts[i]));
      }
      const fi = Math.floor(n), fr = n - fi;
      if (fi < 11) {
        c.lineTo(X(fi) + (X(fi + 1) - X(fi)) * fr, Y(pts[fi]) + (Y(pts[fi + 1]) - Y(pts[fi])) * fr);
      }
      c.stroke();

      if (L > 0) {
        const ex = fi < 11 ? X(fi) + (X(fi + 1) - X(fi)) * fr : X(11);
        const ey = fi < 11 ? Y(pts[fi]) + (Y(pts[fi + 1]) - Y(pts[fi])) * fr : Y(pts[11]);
        c.fillStyle = C.gold;
        c.beginPath();
        c.arc(ex, ey, 8, 0, 7);
        c.fill();
      }
    },

    // 07 EVOLUCIJA
    (t) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Launch is just day one.' : 'Lansiranje je tek početak.', 70, 140, F(800, 40), C.ink);
      (isEn ? [
        ['VERSION A', 0.42, C.mut],
        ['VERSION B', 0.66, C.gold]
      ] : [
        ['VERZIJA A', 0.42, C.mut],
        ['VERZIJA B', 0.66, C.gold]
      ]).forEach(([l, v, col], j) => {
        const x = 70 + j * 580;
        card(x, 190, 550, 330, 20, j ? '#231F14' : C.pan2);
        if (j) {
          rr(x, 190, 550, 330, 20);
          c.strokeStyle = 'rgba(217,178,95,.7)';
          c.lineWidth = 2;
          c.stroke();
        }
        T(l, x + 30, 236, M(600, 14), col);
        c.fillStyle = C.line;
        rr(x + 30, 262, 490, 120, 10);
        c.fill();
        c.fillStyle = 'rgba(243,238,227,.22)';
        c.fillRect(x + 50, 282, j ? 220 : 300, 14);
        c.fillRect(x + 50, 306, j ? 160 : 260, 10);
        c.fillStyle = j ? C.gold : 'rgba(167,174,194,.5)';
        rr(x + 50, 334, j ? 160 : 110, 30, 15);
        c.fill();
        const b = reduce ? 1 : eo(seg(t, 0.2 + j * 0.12, 0.6 + j * 0.12));
        T(isEn ? 'CONVERSION' : 'KONVERZIJA', x + 30, 428, M(500, 12), C.mut);
        c.fillStyle = 'rgba(255,255,255,.08)';
        rr(x + 30, 444, 490, 20, 10);
        c.fill();
        c.fillStyle = col;
        rr(x + 30, 444, 490 * v * b, 20, 10);
        c.fill();
        T((v * b * 10).toFixed(1).replace('.', ',') + '%', x + 520, 500, F(800, 26), j ? C.gold : C.ink, 'right');
      });

      const w = reduce ? 1 : eb(seg(t, 0.62, 0.78));
      if (w > 0) {
        c.save();
        c.translate(1150, 200);
        c.scale(w, w);
        rr(-70, -26, 140, 52, 26);
        c.fillStyle = C.gold;
        c.fill();
        T('+57%', 0, 10, F(900, 24), '#0B1020', 'center');
        c.restore();
      }

      const vs = isEn ? ['v1 · launch', 'v2 · faster form', 'v3 · new offer', 'v4 · …'] : ['v1 · lansiranje', 'v2 · brža forma', 'v3 · nova ponuda', 'v4 · …'];
      const L = reduce ? 1 : eo(seg(t, 0.3, 0.9));
      c.strokeStyle = C.line;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(100, 630);
      c.lineTo(1180, 630);
      c.stroke();
      c.strokeStyle = C.gold;
      c.beginPath();
      c.moveTo(100, 630);
      c.lineTo(100 + 1080 * L, 630);
      c.stroke();
      vs.forEach((v, k) => {
        const x = 100 + k * 360, on = L * 1080 >= k * 360 - 2;
        c.fillStyle = on ? C.gold : C.line;
        c.beginPath();
        c.arc(x, 630, 10, 0, 7);
        c.fill();
        T(v, x, 680, F(600, 17), on ? C.ink : C.mut, k === 0 ? 'left' : k === 3 ? 'right' : 'center');
      });
    }
  ];

  function drawScreen(i, t, now) {
    chrome(i);
    let a = 1;
    if (i > 0 && !reduce) a = Math.min(a, seg(t, 0, 0.07));
    if (i < 6 && !reduce) a = Math.min(a, 1 - seg(t, 0.93, 1));
    c.save();
    c.globalAlpha = 1;
    draw[i](i === 6 ? Math.min(1, t * 1.15) : t, now);
    c.restore();
    if (a < 1 && !reduce) {
      c.fillStyle = `rgba(14,20,40,${1 - a})`;
      c.fillRect(0, 58, W, H - 58);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3D Laptop Setup & Scroll Sync
  // ═══════════════════════════════════════════════════════════
  const host = document.getElementById('gl');
  if (!host) return;

  const laptopCtrl = createLandingLaptop({
    host,
    canvas: sc,
    initialLidAngle: -1.894, // Closed flat at first, unfolds smoothly on entrance
    cameraZ: 7.9,
    cameraY: 1.25,
    lookAtY: 0.62,
    fov: 30
  });

  const sec = document.querySelector('.proc');
  let sp = 0, cur = -1;
  const elN = document.getElementById('n');
  const elK = document.getElementById('kick');
  const elT = document.getElementById('title');
  const elA = document.getElementById('ask');
  const elAW = document.getElementById('askw');
  const elD = document.getElementById('desc');

  function setStep(i, force = false) {
    if (i === cur && !force) return;
    const first = cur === -1;
    cur = i;
    const s = getSteps()[i];
    if (!s) return;
    if (elN) elN.textContent = '0' + (i + 1);
    railB.forEach((b, j) => b.classList.toggle('on', j === i));

    if (elT) {
      if (reduce) elT.textContent = s.t;
      else decodeEl(elT, first ? 600 : 700, s.t);
    }

    const swapEls = [elK, elAW, elD].filter(Boolean);
    if (!reduce) {
      swapEls.forEach(e => e.classList.add('out'));
      setTimeout(() => {
        if (elK) elK.textContent = '// ' + s.k;
        if (elA) elA.textContent = s.q;
        if (elD) elD.textContent = s.d;
        swapEls.forEach((e, j) => setTimeout(() => e.classList.remove('out'), j * 70));
      }, first ? 0 : 220);
    } else {
      if (elK) elK.textContent = '// ' + s.k;
      if (elA) elA.textContent = s.q;
      if (elD) elD.textContent = s.d;
    }
  }

  window.addEventListener('bulevar:langchange', () => {
    renderRail();
    if (cur >= 0) {
      const last = cur;
      cur = -1;
      setStep(last, true);
    }
  });

  function frame(now) {
    if (!sec) {
      requestAnimationFrame(frame);
      return;
    }
    const r = sec.getBoundingClientRect();
    const span = sec.offsetHeight - window.innerHeight;
    const target = cl(-r.top / span);
    sp += (target - sp) * (reduce ? 1 : 0.11);
    if (Math.abs(target - sp) < 1e-4) sp = target;

    const enter = cl(1 - (r.top) / window.innerHeight);
    const vis = r.top < window.innerHeight && r.bottom > 0;

    if (vis) {
      const P = sp * 7;
      const i = Math.min(6, Math.floor(P));
      const t = i === 6 ? Math.min(1, (P - 6)) : P - i;

      setStep(i);

      railB.forEach((b, j) => {
        const fillBar = b.querySelector('b');
        if (fillBar) fillBar.style.transform = `scaleX(${cl(P - j)})`;
      });

      drawScreen(i, reduce ? 1 : t, now);
      laptopCtrl.texture.needsUpdate = true;

      const open = reduce ? 1 : eo(seg(enter, 0.25, 0.95));
      const hingeAngle = -1.894 * (1 - open) - 0.22 * open;
      laptopCtrl.setLidAngle(hingeAngle);

      const sway = reduce ? 0 : Math.sin(sp * Math.PI * 7) * 0.06;
      const isMob = window.innerWidth <= 900;
      const lap = laptopCtrl.laptop;
      lap.rotation.y = -0.4 + 0.36 * open + sway * open;
      lap.rotation.x = 0.05;
      lap.position.y = (isMob ? -0.28 : -0.20) + (reduce ? 0 : Math.sin(now / 1600) * 0.025);
      lap.position.x = isMob ? 0 : 0.22;

      const vFov = (laptopCtrl.camera.fov * Math.PI) / 180;
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * laptopCtrl.camera.aspect);
      const fitW = isMob ? 5.2 : 5.1;
      const fitH = isMob ? 4.2 : 4.2;
      const distH = (fitH / 2) / Math.tan(vFov / 2);
      const distW = (fitW / 2) / Math.tan(hFov / 2);
      const baseZ = Math.max(distH, distW);
      laptopCtrl.camera.position.set(0, 1.15, baseZ);
      laptopCtrl.camera.lookAt(isMob ? 0 : 0.22, 0.52, 0);

      laptopCtrl.renderer.render(laptopCtrl.scene, laptopCtrl.camera);
    }
    requestAnimationFrame(frame);
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(frame));
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLpNeTrazimo);
  } else {
    initLpNeTrazimo();
  }
}
