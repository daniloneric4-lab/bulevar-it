/**
 * ideje.js — Unified Continuous Particle Engine (O nama -> Ideje -> Usluge -> Izlaz)
 * 
 * Features:
 * 1. Black background (#080C14) across both Ideje and Usluge sections.
 * 2. Extended scroll lock on Ideje (P: 0.05 - 0.62) for ample reading time across the 4 stages.
 * 3. 3D Volumetric interactive service symbols on card hover in Usluge (Web, Marketing, Social, Automation, Branding, Support).
 * 4. Post-services exit: particles gather into 3D rotating golden sphere, background switches from Black to Blue (#182032),
 *    and sphere bursts upwards shooting particles into the sky as stardust.
 * 5. Clean, production-ready: switcher buttons and debug UI completely removed.
 */


import { t, getLang } from './i18n.js';

export function initIdeje() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.getElementById('c') || document.querySelector('.stage canvas');
  const track = document.getElementById('track');
  const stageEl = document.getElementById('stage');
  if (!cv || !track || !stageEl) return;

  const ctx = cv.getContext('2d');
  if (!ctx) return;

  let W = window.innerWidth;
  let H = window.innerHeight;
  let S = W < 860 ? 22 : 31;
  let N = W < 860 ? 700 : 1300;
  let cols = 0, rows = 0, P = 0, parts = [], roadRow, cityCol, gridCells = [], symbol = [], B = [];
  const OR = [238, 126, 34], WIN = [245, 148, 48], GO = [245, 148, 48], DI = [215, 125, 42];

  function getData() {
    return getLang() === 'en' ? [
      ['1 location', 'Local hair salon', 'Appointments booked via phone and direct messages.', 'Online booking system with automated reminders.'],
      ['1 venue · 12 staff', 'Downtown restaurant', 'Guests arrive via platforms, but the venue lacks their data.', 'Direct reservations and customer loyalty database.'],
      ['warehouse + web', 'Online store', 'Shoppers buy once and never return.', 'Follow-ups, loyalty rewards and recommendations.'],
      ['multiple teams', 'Growing enterprise', 'Five disconnected tools that don’t communicate.', 'One unified system and clear analytics.']
    ] : [
      ['1 lokal', 'Frizerski salon u kraju', 'Termini se dogovaraju telefonom i porukama.', 'Online zakazivanje sa podsetnikom.'],
      ['1 objekat · 12 ljudi', 'Restoran u centru', 'Gosti dolaze preko platformi, a restoran ih ne poznaje.', 'Sopstvene rezervacije i baza gostiju.'],
      ['magacin + web', 'Online prodavnica', 'Ljudi kupe jednom i ne vrate se.', 'Podsetnici, lojalnost i preporuke.'],
      ['više sektora', 'Veća firma', 'Pet alata koji ne pričaju međusobno.', 'Jedan povezan sistem i jasni podaci.']
    ];
  }

  /* Znak IDEJA u tačkicama iznad zgrada */
  const VAR = 'rec';
  const MARKN = 64;
  let wordPts = [];
  const FONT = {
    I: ['###', '.#.', '.#.', '.#.', '###'],
    D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'],
    J: ['###', '..#', '..#', '#.#', '.#.'],
    A: ['.#.', '#.#', '###', '#.#', '#.#']
  };

  /* ─── Usluge 3 Pillars & Symbols State ─── */
  const PILLARS = [
    {
      num: '01',
      title: '01 Digitalna iskustva',
      services: 'Internet sajtovi · Prodajne stranice · Web aplikacije · Mobilne aplikacije · Online prodavnice · Dizajn interfejsa',
      problem: 'Ljudi dođu, ali ne razumeju ponudu ili ne znaju šta sledeće.'
    },
    {
      num: '02',
      title: '02 Sistemi rasta',
      services: 'Google i Meta oglasi · SEO optimizacija · Analitika · Konverzije · Email komunikacija i podsetnici',
      problem: 'Malo pravih ljudi stiže, ili stignu pa odu.'
    },
    {
      num: '03',
      title: '03 Automatizacija i integracije',
      services: 'AI automatizacija procesa · Pametni asistenti · CRM sistemi · Povezivanje alata · Automatski odgovori',
      problem: 'Tim troši vreme na ponavljanje, a upiti se gube.'
    }
  ];

  let symbol01Pts = [];
  let symbol02Pts = [];
  let symbol03Pts = [];
  const mousePos = { x: -9999, y: -9999, active: false };
  let hoveredPillarIdx = -1;

  function buildUslugeSymbols() {
    const mob = W < 900;
    const cx = W * 0.50; // Centered horizontally
    const uhEl = document.querySelector('#usluge .uh');
    const rowEl = document.getElementById('services-blocks-row');
    const topBound = (uhEl && uhEl.offsetHeight > 0) ? (uhEl.offsetTop + uhEl.offsetHeight) : (mob ? 135 : 170);
    const botBound = (rowEl && rowEl.offsetTop > topBound + 80) ? rowEl.offsetTop : (mob ? H * 0.54 : H - 300);
    const gapH = Math.max(120, botBound - topBound);
    const cy = topBound + gapH * 0.5;
    const sc = mob ? Math.min(0.84, Math.max(0.58, (gapH * 0.68) / 231)) : Math.min(1.56, Math.max(0.80, (gapH * 0.74) / 231));

    const ORANGE = [238, 126, 34];
    const GOLD = [245, 178, 75];

    function line(x1, y1, x2, y2, count, color, r = 4.4) {
      const pts = [];
      for (let i = 0; i < count; i++) {
        const t = count > 1 ? i / (count - 1) : 0.5;
        pts.push({
          x: x1 + (x2 - x1) * t,
          y: y1 + (y2 - y1) * t,
          c: color,
          r: r,
          a: 1.0
        });
      }
      return pts;
    }

    function arc(acx, acy, radius, startAngle, endAngle, count, color, r = 4.4) {
      const pts = [];
      for (let i = 0; i < count; i++) {
        const t = count > 1 ? i / (count - 1) : 0.5;
        const angle = startAngle + (endAngle - startAngle) * t;
        pts.push({
          x: acx + Math.cos(angle) * radius,
          y: acy + Math.sin(angle) * radius,
          c: color,
          r: r,
          a: 1.0
        });
      }
      return pts;
    }

    // 01: „</>“ — Zagrade zlatne, kosa crta narandžasta (#E8963A)
    const raw01 = [];
    raw01.push(...line(cx - 50 * sc, cy - 90 * sc, cx - 130 * sc, cy, 65, GOLD, 4.5));
    raw01.push(...line(cx - 130 * sc, cy, cx - 50 * sc, cy + 90 * sc, 65, GOLD, 4.5));
    raw01.push(...line(cx - 24 * sc, cy + 105 * sc, cx + 24 * sc, cy - 105 * sc, 85, ORANGE, 4.8));
    raw01.push(...line(cx + 50 * sc, cy - 90 * sc, cx + 130 * sc, cy, 65, GOLD, 4.5));
    raw01.push(...line(cx + 130 * sc, cy, cx + 50 * sc, cy + 90 * sc, 65, GOLD, 4.5));

    // 02: Cik-cak linija rasta — ukoso nagore udesno, vrh strelice gore desno, cela zlatna
    const raw02 = [];
    const p0 = [cx - 145 * sc, cy + 82.5 * sc];
    const p1 = [cx - 60 * sc, cy - 12.5 * sc];
    const p2 = [cx - 10 * sc, cy + 30.5 * sc];
    const p3 = [cx + 145 * sc, cy - 82.5 * sc];
    raw02.push(...line(p0[0], p0[1], p1[0], p1[1], 75, GOLD, 4.6));
    raw02.push(...line(p1[0], p1[1], p2[0], p2[1], 50, GOLD, 4.6));
    raw02.push(...line(p2[0], p2[1], p3[0], p3[1], 120, GOLD, 4.8));
    raw02.push(...line(p3[0], p3[1], p3[0] - 46 * sc, p3[1] + 6 * sc, 45, GOLD, 4.5));
    raw02.push(...line(p3[0], p3[1], p3[0] - 6 * sc, p3[1] + 46 * sc, 45, GOLD, 4.5));

    // 03: Glava AI bota — zaobljen kvadrat, antena + kuglica, kratke „uši“, ravna usta, narandžaste oči
    const raw03 = [];
    const hw = 95 * sc;
    const hh = 80 * sc;
    const cr = 26 * sc;
    const cyHead = cy + 35.5 * sc;

    raw03.push(...line(cx - hw + cr, cyHead - hh, cx + hw - cr, cyHead - hh, 45, GOLD, 4.4));
    raw03.push(...arc(cx + hw - cr, cyHead - hh + cr, cr, -Math.PI * 0.5, 0, 22, GOLD, 4.4));
    raw03.push(...line(cx + hw, cyHead - hh + cr, cx + hw, cyHead + hh - cr, 40, GOLD, 4.4));
    raw03.push(...arc(cx + hw - cr, cyHead + hh - cr, cr, 0, Math.PI * 0.5, 22, GOLD, 4.4));
    raw03.push(...line(cx + hw - cr, cyHead + hh, cx - hw + cr, cyHead + hh, 45, GOLD, 4.4));
    raw03.push(...arc(cx - hw + cr, cyHead + hh - cr, cr, Math.PI * 0.5, Math.PI, 22, GOLD, 4.4));
    raw03.push(...line(cx - hw, cyHead + hh - cr, cx - hw, cyHead - hh + cr, 40, GOLD, 4.4));
    raw03.push(...arc(cx - hw + cr, cyHead - hh + cr, cr, Math.PI, Math.PI * 1.5, 22, GOLD, 4.4));

    raw03.push(...line(cx, cyHead - hh, cx, cyHead - hh - 45 * sc, 30, GOLD, 4.4));
    raw03.push(...arc(cx, cyHead - hh - 58 * sc, 13 * sc, 0, Math.PI * 2, 34, GOLD, 4.6));

    raw03.push(...line(cx - hw, cyHead - 8 * sc, cx - hw - 20 * sc, cyHead - 8 * sc, 16, GOLD, 4.4));
    raw03.push(...line(cx - hw - 20 * sc, cyHead - 8 * sc, cx - hw - 20 * sc, cyHead + 28 * sc, 22, GOLD, 4.4));
    raw03.push(...line(cx - hw - 20 * sc, cyHead + 28 * sc, cx - hw, cyHead + 28 * sc, 16, GOLD, 4.4));

    raw03.push(...line(cx + hw, cyHead - 8 * sc, cx + hw + 20 * sc, cyHead - 8 * sc, 16, GOLD, 4.4));
    raw03.push(...line(cx + hw + 20 * sc, cyHead - 8 * sc, cx + hw + 20 * sc, cyHead + 28 * sc, 22, GOLD, 4.4));
    raw03.push(...line(cx + hw + 20 * sc, cyHead + 28 * sc, cx + hw, cyHead + 28 * sc, 16, GOLD, 4.4));

    raw03.push(...line(cx - 42 * sc, cyHead + 45 * sc, cx + 42 * sc, cyHead + 45 * sc, 38, GOLD, 4.5));

    raw03.push(...arc(cx - 38 * sc, cyHead - 6 * sc, 11 * sc, 0, Math.PI * 2, 26, ORANGE, 4.8));
    raw03.push(...arc(cx + 38 * sc, cyHead - 6 * sc, 11 * sc, 0, Math.PI * 2, 26, ORANGE, 4.8));

    function expand(raw) {
      const out = [];
      for (let k = 0; k < N; k++) {
        const base = raw[k % raw.length];
        const jx = (rnd(k * 17 + 5) - 0.5) * 3.5;
        const jy = (rnd(k * 29 + 11) - 0.5) * 3.5;
        out.push({
          x: base.x + jx,
          y: base.y + jy,
          c: base.c,
          r: base.r,
          a: base.a
        });
      }
      return out;
    }

    symbol01Pts = expand(raw01);
    symbol02Pts = expand(raw02);
    symbol03Pts = expand(raw03);
  }

  function morphPoints(ptA, ptB, t, k) {
    const delay = ((k * 13) % 40) / 40 * 0.28;
    const localT = Math.max(0, Math.min(1, (t - delay) / (1 - 0.28)));
    const e = localT * localT * (3 - 2 * localT);

    const dispFactor = Math.sin(e * Math.PI);
    const dispX = (rnd(k * 71 + 3) - 0.5) * 44 * dispFactor;
    const dispY = (rnd(k * 89 + 7) - 0.5) * 44 * dispFactor;

    return {
      x: ptA.x + (ptB.x - ptA.x) * e + dispX,
      y: ptA.y + (ptB.y - ptA.y) * e + dispY,
      c: [
        Math.round(ptA.c[0] + (ptB.c[0] - ptA.c[0]) * e),
        Math.round(ptA.c[1] + (ptB.c[1] - ptA.c[1]) * e),
        Math.round(ptA.c[2] + (ptB.c[2] - ptA.c[2]) * e)
      ],
      r: ptA.r + (ptB.r - ptA.r) * e,
      a: ptA.a + (ptB.a - ptA.a) * e
    };
  }

  function rnd(i) {
    const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function sm(a, b, x) {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function cell(c, r) {
    return [c * S + S / 2, r * S + S / 2];
  }

  let lastIdejeWidth = 0;
  let lastIdejeHeight = 0;
  let lastIdejeDpr = 1;

  function getStageSize() {
    const isCssApplied = getComputedStyle(cv).position === 'absolute';
    const rc = stageEl.getBoundingClientRect();
    const rawW = (isCssApplied && rc.width > 0 && !(rc.width === 300 && rc.height === 150))
      ? rc.width
      : window.innerWidth;
    const rawH = (isCssApplied && rc.height > 200)
      ? rc.height
      : window.innerHeight;
    return {
      w: Math.max(1, Math.round(rawW || window.innerWidth)),
      h: Math.max(1, Math.round(rawH || window.innerHeight))
    };
  }

  function build() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const sz = getStageSize();
    W = sz.w;
    H = sz.h;
    lastIdejeWidth = W;
    lastIdejeHeight = H;
    lastIdejeDpr = dpr;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mob = W < 960;
    const phone = W < 600;
    const compact = W >= 960 && W < 1240;
    S = phone ? (W < 360 ? 15 : 18) : mob ? 22 : 31;
    N = mob ? 700 : 1300;
    cols = Math.floor(W / S);
    rows = Math.floor(H / S);
    roadRow = Math.round(H * (phone ? 0.80 : mob ? 0.86 : 0.84) / S);

    /* the four towers from the Bulevar.IT logo: short, medium, tallest, tall */
    const LOGO = [0.46, 0.64, 1, 0.86];
    const TW = phone ? 3 : mob ? 4 : compact ? 4 : 5;
    const GAP = 1;
    const tallest = Math.floor(rows * (phone ? 0.26 : mob ? 0.32 : 0.48));
    const span = 4 * TW + 3 * GAP;

    let lx;
    if (mob) {
      lx = Math.max(1, Math.round((cols - span) / 2));
    } else {
      // Calculate rightmost extent of the text block to guarantee NO overlap
      const textLeftPx = Math.max(24, (W - 1440) / 2 + 24);
      const textWidthPx = Math.min(520, W * 0.38);
      const textRightPx = textLeftPx + textWidthPx;

      // Safe starting column for leftmost tower (at least 60px past text)
      const safeStartCol = Math.ceil((textRightPx + 60) / S);
      const idealCenterCol = Math.round(cols * 0.72);
      const idealLx = idealCenterCol - Math.floor(span / 2);

      lx = Math.max(safeStartCol, idealLx);
      lx = Math.min(lx, Math.max(safeStartCol, cols - span - 1));
    }

    cityCol = lx + Math.floor(span / 2);

    B = LOGO.map((f, i) => ({
      x0: lx + i * (TW + GAP),
      w: TW,
      h: Math.max(3, Math.round(tallest * f)),
      a: [0, 0.24, 0.48, 0.72][i],
      first: i === 0
    }));

    /* word IDEJA / IDEA in dot font at half grid spacing, positioned ABOVE the towers */
    wordPts = [];
    const hs = S * (mob ? 0.44 : 0.50);
    const word = getLang() === 'en' ? 'IDEA' : 'IDEJA';
    const totalW = (word.length * 4 - 1) * hs;
    const wx0 = cityCol * S + S / 2 - totalW / 2;
    const wy0 = (roadRow - tallest - (mob ? 3.4 : 4.2)) * S;

    word.split('').forEach((ch, li) => {
      if (!FONT[ch]) return;
      FONT[ch].forEach((line, ry) => {
        for (let cx = 0; cx < 3; cx++) {
          if (line[cx] === '#') {
            wordPts.push([
              wx0 + (li * 4 + cx) * hs + hs / 2,
              wy0 + ry * hs + hs / 2
            ]);
          }
        }
      });
    });

    const slots = [];
    for (let m = 0; m < MARKN; m++) slots.push({ mark: m });
    B.forEach((b, bi) => {
      for (let r = 1; r <= b.h; r++) {
        for (let c = b.x0; c < b.x0 + b.w; c++) {
          if (c >= 0 && c < cols) slots.push({ b: bi, c: c, lvl: r });
        }
      }
    });
    for (let c = 0; c < cols; c++) slots.push({ road: true, c: c });

    gridCells = [];
    for (let y = 1; y < rows; y++) {
      for (let x = 0; x < cols; x++) gridCells.push([x, y]);
    }

    // N obuhvata tačkice za kompletan grid ekrana tako da sve tačkice na ekranu
    // potiču iz istog sistema čestica i mogu se kompletno skupiti u 3D simbol!
    N = Math.max(mob ? 700 : 1300, gridCells.length);

    const keep = parts;
    parts = [];
    for (let k = 0; k < N; k++) {
      const o = keep[k];
      const phi = Math.acos(1.0 - (2.0 * (k + 0.5)) / N);
      const radAngle = rnd(k + 7) * 6.283185;
      parts.push({
        x: o ? o.x : W / 2,
        y: o ? o.y : -40,
        a: o ? o.a : 0,
        r: o ? o.r : 1,
        c: o ? o.c : OR.slice(),
        sz: 1.4 + rnd(k + 9) * 3.6,
        sp: 0.07 + rnd(k + 3) * 0.07,
        j: rnd(k + 7),
        f: rnd(k + 51),
        slot: k < slots.length ? slots[k] : null,
        g: gridCells[k % gridCells.length],
        // Precomputed sphere constants to eliminate frame-drops during exit
        phi: phi,
        sinPhi: Math.sin(phi),
        cosPhi: Math.cos(phi),
        baseTheta: k * 2.399963,
        radDirX: Math.cos(radAngle),
        radDirY: Math.sin(radAngle)
      });
    }

    buildUslugeSymbols();
  }

  function bH(b, g) {
    return b.first ? Math.round(3 + (b.h - 3) * sm(0, 0.2, g)) : Math.round(b.h * sm(b.a, b.a + 0.2, g));
  }

  function mix(A, Bt, m) {
    if (m <= 0) return A;
    if (m >= 1) return Bt;
    return {
      x: A.x + (Bt.x - A.x) * m,
      y: A.y + (Bt.y - A.y) * m,
      a: A.a + (Bt.a - A.a) * m,
      r: A.r + (Bt.r - A.r) * m,
      c: [
        A.c[0] + (Bt.c[0] - A.c[0]) * m,
        A.c[1] + (Bt.c[1] - A.c[1]) * m,
        A.c[2] + (Bt.c[2] - A.c[2]) * m
      ]
    };
  }

  let markPos = [0, 0];
  function markT(i, now, on, g) {
    if (i >= wordPts.length) return null;
    const w = wordPts[i];
    const fadeOut = 1 - sm(0.53, 0.57, P);
    const alpha = on * fadeOut;
    if (alpha <= 0.01) return null;
    const sh = 0.90 + 0.10 * Math.sin(now / 350 - w[0] / 30);
    // Naizmenične čisto bele i toplo narandžaste tačkice za maksimalan kontrast i kristalnu čitljivost
    const isWhite = (i % 2 === 0);
    return {
      x: w[0],
      y: w[1],
      a: alpha,
      r: (W < 960 ? 2.8 : 3.6) * sh,
      c: isWhite ? [255, 255, 255] : [248, 128, 30]
    };
  }

  /* 1. Polukrug — tačno kao sArc u najnoviji ideje usluge.html */
  function sArc(k, p, now) {
    const q = sm(0, 0.08, P);
    const u = k / N;
    const cx = W / 2;
    const cy = -H * 0.06;
    const R = Math.min(W * 0.46, H * 0.9);
    const th = Math.PI * (1 - u);
    const t = (rnd(k + 41) - 0.5) * S * 1.4;
    if (u <= q) {
      return { x: cx + (R + t) * Math.cos(th), y: cy + (R + t) * Math.sin(th), a: 0.95, r: p.sz, c: OR };
    }
    return { x: cx - R, y: cy, a: 0, r: p.sz, c: OR };
  }

  /* 2. Grad na gridu */
  function sCity(k, p, now, g) {
    const s = p.slot;
    const road = cell(s && s.c != null ? s.c : Math.floor(p.j * cols), roadRow);
    const hid = { x: road[0], y: road[1], a: 0, r: 2, c: OR };
    if (!s) return hid;
    if (s.road) return { x: road[0], y: road[1], a: 1, r: 3.6, c: OR };
    if (s.mark != null) {
      const mt = markT(s.mark, now, sm(0, 0.12, g), g);
      return mt || hid;
    }
    const b = B[s.b];
    const h = bH(b, g);
    if (s.lvl > h) return hid;
    const top = s.lvl === h;
    const edge = s.c === b.x0 || s.c === b.x0 + b.w - 1;
    const win = !top && !edge && s.lvl % 2 === 0 && (s.c - b.x0) % 2 === 1;
    const xy = cell(s.c, roadRow - s.lvl);
    const a = (W >= 960 && xy[0] < Math.min(W * 0.4, 620)) ? 0.35 : 1;
    if (top || edge) return { x: xy[0], y: xy[1], a: a, r: 4.6, c: OR };
    if (win) {
      const winColIdx = Math.floor((s.c - b.x0) / 2);
      const isWhiteWin = (Math.floor(s.lvl / 2) + winColIdx) % 2 === 0;
      return {
        x: xy[0],
        y: xy[1],
        a: isWhiteWin ? a : 0.85 * a,
        r: isWhiteWin ? 3.0 : 2.6,
        c: isWhiteWin ? [255, 255, 255] : WIN
      };
    }
    return hid;
  }

  /* 3. Talas u liniju puta */
  function sLine(k, p) {
    return { x: (k + 0.5) / N * W, y: roadRow * S + S / 2, a: 1.0, r: 2.2 + p.sz * 0.3, c: OR };
  }

  /* 4. Podizanje linije na vrhu */
  function sLineTop(k, p) {
    return { x: (k + 0.5) / N * W, y: H * 0.08, a: 1.0, r: 2.2 + p.sz * 0.3, c: OR };
  }

  /* 5. Razvlačenje nadole */
  function sSpread(k, p, now) {
    return {
      x: (k + 0.5) / N * W + (rnd(k + 61) - 0.5) * S * 1.6,
      y: H * 0.08 + p.f * H * 0.9 + Math.sin(now / 1300 + k) * 3,
      a: 0.8,
      r: 1.2 + p.j * 3.4,
      c: DI
    };
  }

  /* 6. Grid Usluga: tačkice raspoređene po pozadinskom gridu kada nema aktivnog simbola */
  function sGrid(k, p) {
    const xy = cell(p.g[0], p.g[1]);
    const isAmber = rnd(k + 17) < 0.08;
    return {
      x: xy[0],
      y: xy[1],
      a: 0.38 + p.j * 0.28,
      r: 1.4 + p.j * 1.8,
      c: isAmber ? [224, 138, 60] : [184, 146, 90]
    };
  }

  /* Scramble & Morph helpers */
  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';

  const lvEl = document.getElementById('lv');
  const whoEl = document.getElementById('who');
  const probEl = document.getElementById('prob');
  const ideaEl = document.getElementById('idea');
  const coreTEl = document.getElementById('coreT');
  const h1aEl = document.getElementById('h1a');
  const h1bEl = document.getElementById('h1b');
  const h2El = document.querySelector('#ideje h2');
  const ideEl = document.getElementById('ideje');
  const coreEl = document.getElementById('core');
  const manEl = document.getElementById('manifesto');
  const manAEl = document.getElementById('man-a');
  const manBEl = document.getElementById('man-b');
  const manWrapEl = document.querySelector('.manifesto__wrap');

  // Usluge 3 Blocks DOM bindings
  const uslugeEl = document.getElementById('usluge');
  const serviceCards = document.querySelectorAll('#services-blocks-row .glass-block');
  // Active pillar & symbols change strictly on scroll (no hover or click switching)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  let gDisp = 0.20;
  let servicesBlocksAnimated = false;

  function decodeBlockText(el, baseDelay = 0) {
    if (!el) return;
    const items = el.querySelectorAll('[data-dec]');
    items.forEach((item, i) => {
      const text = item.dataset.dec || item.textContent;
      const ms = 16;
      const delay = (baseDelay || 0) + i * 85;
      let start = null;
      const len = text.length;
      const dur = len * ms + 180;

      function step(ts) {
        if (!start) start = ts;
        const elapsed = ts - start - delay;
        if (elapsed < 0) {
          requestAnimationFrame(step);
          return;
        }
        const prog = Math.min(1, elapsed / dur);
        renderSingleDecode(item, text, prog, ts);
        if (prog < 1) {
          requestAnimationFrame(step);
        } else {
          setElHtml(item, esc(text));
        }
      }
      requestAnimationFrame(step);
    });
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function setElHtml(el, h) {
    if (el && el._lastH !== h) {
      el.innerHTML = h;
      el._lastH = h;
    }
  }

  function scrambleChar(seed, now) {
    const idx = Math.abs(Math.floor(Math.sin(seed * 41.31 + (now / 60) | 0) * 1000)) % GL.length;
    return GL[idx];
  }

  function renderSingleDecode(el, text, prog, now) {
    if (!el) return;
    if (reduce || prog >= 1) {
      setElHtml(el, esc(text));
      return;
    }
    if (prog <= 0) {
      setElHtml(el, '<span class="rest">' + esc(text) + '</span>');
      return;
    }
    const n = text.length;
    const d = Math.floor(prog * n);
    const nz = Math.min(3, n - d);
    let noise = '';
    for (let j = 0; j < nz; j++) {
      const ch = text[d + j];
      noise += ch === ' ' ? ' ' : scrambleChar(d + j, now);
    }
    setElHtml(el, esc(text.slice(0, d)) + '<span class="noise">' + esc(noise) + '</span><span class="rest">' + esc(text.slice(d + nz)) + '</span>');
  }

  function renderSingleScrambleOut(el, text, prog, now) {
    if (!el) return;
    if (reduce || prog >= 1) {
      setElHtml(el, '');
      return;
    }
    if (prog <= 0) {
      setElHtml(el, esc(text));
      return;
    }
    const n = text.length;
    const d = Math.floor(prog * n);
    const keep = Math.max(0, n - d);
    const nz = Math.min(4, keep);
    let noise = '';
    for (let j = 0; j < nz; j++) {
      const ch = text[keep - nz + j];
      noise += ch === ' ' ? ' ' : scrambleChar(keep - nz + j, now);
    }
    setElHtml(el, esc(text.slice(0, keep - nz)) + '<span class="noise">' + esc(noise) + '</span>');
  }

  function renderMorph(el, oldStr, newStr, prog, now) {
    if (!el) return;
    if (reduce || prog >= 1) {
      setElHtml(el, esc(newStr));
      return;
    }
    if (prog <= 0) {
      setElHtml(el, esc(oldStr));
      return;
    }
    const maxLen = Math.max(oldStr.length, newStr.length);
    const cursor = Math.floor(prog * maxLen);
    const nz = 3;
    let out = '';
    for (let i = 0; i < maxLen; i++) {
      if (i < cursor) {
        if (i < newStr.length) out += esc(newStr[i]);
      } else if (i >= cursor && i < cursor + nz) {
        const targetCh = (i < newStr.length) ? newStr[i] : (i < oldStr.length ? oldStr[i] : 'X');
        if (targetCh === ' ') {
          out += ' ';
        } else {
          out += '<span class="noise">' + esc(scrambleChar(i + cursor * 7, now)) + '</span>';
        }
      } else {
        if (i < oldStr.length) out += esc(oldStr[i]);
      }
    }
    setElHtml(el, out);
  }

  let inView = true;

  const io = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
  }, { threshold: 0 });
  io.observe(track);

  // Mouse repulsion tracker for stationary symbols
  window.addEventListener('mousemove', (e) => {
    const rc = cv.getBoundingClientRect();
    if (e.clientY >= rc.top && e.clientY <= rc.bottom && e.clientX >= rc.left && e.clientX <= rc.right) {
      mousePos.x = e.clientX - rc.left;
      mousePos.y = e.clientY - rc.top;
      mousePos.active = true;
    } else {
      mousePos.active = false;
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mousePos.active = false;
  }, { passive: true });

  window.addEventListener('bulevar:langchange', () => {
    build();
  });

  function frame(now) {

    const rc = track.getBoundingClientRect();
    const tot = track.offsetHeight - window.innerHeight;
    const inVisibleZone = rc.bottom > 0 && rc.top < window.innerHeight + 120;

    if (inVisibleZone) {
      const cw = cv.clientWidth;
      const ch = cv.clientHeight;
      if (cw > 0 && ch > 200 && (Math.abs(cw - W) > 2 || Math.abs(ch - H) > 100)) {
        build();
      }
      const DATA = getData();
      const Q = Math.max(0, Math.min(1, tot > 0 ? -rc.top / tot : 0));

      /* Smooth progression: Ideje (cases 0..3) -> Manifesto -> Usluge (3 pillars) -> Exit */
      if (Q < 0.48) {
        P = (Q / 0.48) * 0.54; // 0.00 to 0.54 (Ideje cases)
      } else if (Q < 0.72) {
        P = 0.54 + ((Q - 0.48) / 0.24) * 0.22; // 0.54 to 0.76 (Manifesto & rising line)
      } else {
        P = 0.76 + ((Q - 0.72) / 0.28) * 0.24; // 0.76 to 1.00 (Usluge & Exit sphere)
      }

      /* Staging:
         - P < 0.085: Screenshot 1 (sArc, particles falling along the curve from top-left).
         - P 0.085 - 0.22: Screenshot 2 (sCity baseline wave settled). Headline "Ideje nemaju veličinu firme" decodes and stays.
         - P 0.22 - 0.54: Cases 0, 1, 2, 3 appear sequentially as user scrolls later.
      */
      let st = 0;
      let v = 0;
      let vDec = 0;

      if (P < 0.22) {
        st = 0;
        vDec = Math.min(1, Math.max(0, (P - 0.085) / 0.04));
        v = P < 0.18 ? 0 : Math.min(1, (P - 0.18) / 0.04);
      } else {
        const caseProg = Math.min(3.999, Math.max(0, (P - 0.22) / (0.54 - 0.22) * 4.0));
        const caseIdx = Math.floor(caseProg);
        st = caseIdx + 1; // 1 = Case 0, 2 = Case 1, 3 = Case 2, 4 = Case 3
        v = caseProg - caseIdx;
      }

      /* Tower heights synchronized directly with the 4 cases */
      function gOf(i, vv) {
        if (P < 0.085) return 0;
        if (i === 0) return 0.22 * sm(0.085, 0.14, P);
        if (i === 1) return 0.22;
        if (i === 2) return 0.24 + 0.22 * sm(0, 0.25, vv);
        if (i === 3) return 0.48 + 0.22 * sm(0, 0.25, vv);
        return 0.72 + 0.22 * sm(0, 0.25, vv);
      }

      const gT = gOf(st, v);
      gDisp += reduce ? (gT - gDisp) : (gT - gDisp) * 0.20;
      const g = gDisp;

      // ─── BACKGROUND THEME COLOR MANAGEMENT ───
      // Pure deep black (#080C14) throughout Ideje and Usluge (P < 0.982).
      // At P >= 0.982, background cleanly switches to exact Kontakt Navy Blue (#191F32) as sphere bursts upwards!
      if (P < 0.982) {
        if (!document.body.classList.contains('theme--black')) {
          document.body.classList.add('theme--black');
          track.style.backgroundColor = '#080C14';
          stageEl.style.backgroundColor = '#080C14';
        }
      } else {
        if (document.body.classList.contains('theme--black')) {
          document.body.classList.remove('theme--black');
          track.style.backgroundColor = '#191F32';
          stageEl.style.backgroundColor = '#191F32';
        }
      }

      ctx.clearRect(0, 0, W, H);

      // Ideje text opacity: only appears after dots arc emerges (P >= 0.085)
      const io = sm(0.085, 0.14, P) * (1 - sm(0.53, 0.58, P));
      if (ideEl) {
        ideEl.style.setProperty('--o', io.toFixed(3));
        ideEl.classList.toggle('on', io > 0.5);
      }

      // Pre-calculate 3D sphere coordinates for post-Usluge exit (P >= 0.97 to 1.0)
      const sphRotY = now * 0.0015;
      const sphRotX = 0.30 + Math.sin(now * 0.0007) * 0.12;
      const cosY = Math.cos(sphRotY), sinY = Math.sin(sphRotY);
      const cosX = Math.cos(sphRotX), sinX = Math.sin(sphRotX);
      const rSph = (W < 860 ? 100 : 145);
      const cx = W / 2, cy = H / 2;

      // ─── Usluge 3 Blocks in lower part & Particle Symbol Morphing ───
      const inUsluge = P >= 0.81 && P < 0.975;
      const uOpacity = sm(0.81, 0.835, P) * (1 - sm(0.965, 0.98, P));
      stageEl.style.setProperty('--u', uOpacity);
      if (uslugeEl) {
        uslugeEl.classList.toggle('on', uOpacity > 0.3);
      }

      // Check which pillar is active: strictly scroll-driven
      let activePillar = 0;
      if (P < 0.85) activePillar = 0;
      else if (P < 0.92) activePillar = 1;
      else activePillar = 2;

      if (inUsluge && serviceCards.length) {
        serviceCards.forEach((c, i) => {
          c.classList.toggle('is-active', i === activePillar);
        });
      }

      // ─── PARTICLE STATE BLENDING ───
      for (let k = 0; k < N; k++) {
        const p = parts[k];
        const d = p.j;
        let t;

        // Sequence of states:
        if (P >= 0.97) {
          // Optimized direct 3D Fibonacci sphere & upward explosion — skips all unused state math
          const gatherT = sm(0.97, 0.985, P);
          const theta = p.baseTheta + sphRotY;
          const sx = p.sinPhi * Math.cos(theta) * rSph;
          const sy = p.cosPhi * rSph;
          const sz = p.sinPhi * Math.sin(theta) * rSph;

          const sxRot = sx * cosY + sz * sinY;
          const szRot = -sx * sinY + sz * cosY;
          const syRot = sy * cosX - szRot * sinX;
          const szRot2 = sy * sinX + szRot * cosX;

          const perspSph = 440 / Math.max(1, 440 + szRot2);
          const sph2DX = cx + sxRot * perspSph;
          const sph2DY = cy + syRot * perspSph;

          if (P >= 0.985) {
            // Upward explosion into blue sky
            const burstT = sm(0.985, 0.998, P);
            if (burstT >= 1.0) continue; // Completely finished
            const upVel = -burstT * burstT * (780 + 420 * p.f);
            const outDisp = burstT * 260 * (0.6 + 0.8 * p.j);
            const xDrift = (p.f - 0.5) * 200 * burstT;

            const targetX = sph2DX + p.radDirX * outDisp + xDrift;
            const targetY = sph2DY + p.radDirY * outDisp * 0.45 + upVel;
            const targetA = Math.max(0, 1.0 - burstT * 1.35);

            p.x += (targetX - p.x) * 0.25;
            p.y += (targetY - p.y) * 0.25;
            p.a = targetA;
            p.r = Math.max(0.5, p.sz * (1.0 - burstT * 0.6));
            p.c[0] = 255; p.c[1] = 222; p.c[2] = 145;
          } else {
            // Gathering cleanly into sphere
            p.x += (sph2DX - p.x) * (0.12 + gatherT * 0.15);
            p.y += (sph2DY - p.y) * (0.12 + gatherT * 0.15);
            p.a += (0.95 - p.a) * 0.15;
            p.r += (3.4 - p.r) * 0.15;
            p.c[0] += (OR[0] - p.c[0]) * 0.15;
            p.c[1] += (OR[1] - p.c[1]) * 0.15;
            p.c[2] += (OR[2] - p.c[2]) * 0.15;
          }
        } else {
          // 1. Narandžasti mlaz iz O nama (P: 0.00 - 0.08)
          t = sArc(k, p, now);
          // 2. Prelaz u grad na gridu (P: 0.085 - 0.14)
          t = mix(t, sCity(k, p, now, g), sm(0.085 + d * 0.03, 0.14 + d * 0.03, P));
          // 2. Talas u liniju puta (P: 0.54 - 0.62) -> bottom orange line
          t = mix(t, sLine(k, p), sm(0.54 + d * 0.03, 0.59 + d * 0.03, P));
          // 3. Podizanje linije na vrhu (P: 0.62 - 0.74)
          t = mix(t, sLineTop(k, p), sm(0.62, 0.74, P));
          // 4. Razvlačenje nadole (P: 0.73 - 0.78)
          t = mix(t, sSpread(k, p, now), sm(0.73, 0.78, P));
          // 5. Grid Usluga (P: 0.76 - 0.80) - sve tačkice su na gridu u pozadini
          t = mix(t, sGrid(k, p), sm(0.76 + p.f * 0.03, 0.79 + p.f * 0.03, P));

          // 7. Veliki centrirani Simbol u Uslugama (P: 0.78 - 0.97) — menja se isključivo skrolom
          if (P >= 0.78 && P < 0.975 && symbol01Pts.length && symbol02Pts.length && symbol03Pts.length) {
            let symTarget;
            if (P < 0.84) {
              symTarget = symbol01Pts[k];
            } else if (P < 0.88) {
              const t0102 = sm(0.84, 0.88, P);
              symTarget = morphPoints(symbol01Pts[k], symbol02Pts[k], t0102, k);
            } else if (P < 0.92) {
              symTarget = symbol02Pts[k];
            } else if (P < 0.95) {
              const t0203 = sm(0.92, 0.95, P);
              symTarget = morphPoints(symbol02Pts[k], symbol03Pts[k], t0203, k);
            } else {
              symTarget = symbol03Pts[k];
            }
            t = mix(t, symTarget, sm(0.78 + (k % 30) / 30 * 0.02, 0.81, P));
          }

          const isLinePhase = (P >= 0.54 && P < 0.78);
          const e = reduce ? 1 : isLinePhase ? 1 : (inUsluge ? Math.max(p.sp, 0.14) : p.sp);
          p.x += (t.x - p.x) * e;
          p.y += (t.y - p.y) * e;
          p.a += (t.a - p.a) * e;
          p.r += (t.r - p.r) * e;
          for (let ci = 0; ci < 3; ci++) {
            p.c[ci] += (t.c[ci] - p.c[ci]) * e;
          }
        }

        if (p.a < 0.02) continue;
        ctx.globalAlpha = Math.min(1, p.a);
        ctx.fillStyle = 'rgb(' + (p.c[0] | 0) + ',' + (p.c[1] | 0) + ',' + (p.c[2] | 0) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, 6.283);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // ─── ZNAK IDEJA (ispisan tačkicama iznad zgrada; HTML bedž sakriven) ───
      if (coreEl) {
        coreEl.style.display = 'none';
      }
      if (coreTEl) {
        setElHtml(coreTEl, '');
      }

      const ioVal = sm(0.085, 0.14, P) * (1 - sm(0.52, 0.55, P));
      if (ideEl) {
        ideEl.style.setProperty('--o', ioVal.toFixed(3));
        ideEl.classList.toggle('on', ioVal > 0.5);
      }

      // ─── SCROLL-DRIVEN HEADLINE & CASES MORPHING ───
      if (ioVal <= 0.05) {
        // Outside Ideje section or before Screenshot 2
        if (h2El) h2El.classList.remove('gone');
        setElHtml(h1aEl, '');
        setElHtml(h1bEl, '');
        setElHtml(lvEl, '');
        setElHtml(whoEl, '');
        setElHtml(probEl, '');
        setElHtml(ideaEl, '');
        if (ideEl) ideEl.style.setProperty('--cs', '0');
      } else if (st === 0) {
        // Step 0: Headline "Ideje nemaju veličinu firme." (Screenshot 2)
        if (h2El) {
          h2El.classList.remove('gone');
          h2El.style.setProperty('--h2-o', '1');
        }
        if (ideEl) ideEl.style.setProperty('--cs', '0');
        setElHtml(lvEl, '');
        setElHtml(whoEl, '');
        setElHtml(probEl, '');
        setElHtml(ideaEl, '');

        const h1aText = t('ideje.h1a', 'Ideje nemaju');
        const h1bText = t('ideje.h1b', 'veličinu firme.');

        if (P < 0.18) {
          if (vDec < 1) {
            renderSingleDecode(h1aEl, h1aText, vDec, now);
            renderSingleDecode(h1bEl, h1bText, vDec, now);
          } else {
            setElHtml(h1aEl, h1aText);
            setElHtml(h1bEl, h1bText);
          }
        } else {
          const pOut = Math.min(1, Math.max(0, (P - 0.18) / 0.04));
          renderSingleScrambleOut(h1bEl, h1bText, pOut, now);
          renderSingleScrambleOut(h1aEl, h1aText, Math.max(0, (pOut - 0.15) * 1.2), now);
        }
      } else if (st === 1) {
        // Step 1: Case 0 ("1 lokal · Frizerski salon u kraju")
        if (h2El) h2El.classList.add('gone');
        if (ideEl) ideEl.style.setProperty('--cs', '1');
        setElHtml(h1aEl, '');
        setElHtml(h1bEl, '');

        if (v < 0.22) {
          const pCase = Math.min(1, v / 0.22);
          renderSingleDecode(lvEl, DATA[0][0], pCase, now);
          renderSingleDecode(whoEl, DATA[0][1], pCase, now);
          renderSingleDecode(probEl, DATA[0][2], pCase, now);
          renderSingleDecode(ideaEl, DATA[0][3], pCase, now);
        } else {
          setElHtml(lvEl, esc(DATA[0][0]));
          setElHtml(whoEl, esc(DATA[0][1]));
          setElHtml(probEl, esc(DATA[0][2]));
          setElHtml(ideaEl, esc(DATA[0][3]));
        }
      } else {
        // Steps 2, 3, 4: Cases 1, 2, 3
        if (h2El) h2El.classList.add('gone');
        if (ideEl) ideEl.style.setProperty('--cs', '1');
        setElHtml(h1aEl, '');
        setElHtml(h1bEl, '');

        const caseIdx = Math.max(0, Math.min(DATA.length - 1, (st || 1) - 1));
        const oldData = DATA[Math.max(0, caseIdx - 1)] || DATA[0];
        const newData = DATA[caseIdx] || DATA[0];

        if (v < 0.22) {
          const morphProg = Math.min(1, v / 0.22);
          renderMorph(lvEl, oldData[0], newData[0], morphProg, now);
          renderMorph(whoEl, oldData[1], newData[1], morphProg, now);
          renderMorph(probEl, oldData[2], newData[2], morphProg, now);
          renderMorph(ideaEl, oldData[3], newData[3], morphProg, now);
        } else if (st === 4 && v >= 0.85) {
          const pCaseOut = (v - 0.85) / 0.15;
          renderSingleScrambleOut(ideaEl, newData[3], pCaseOut, now);
          renderSingleScrambleOut(probEl, newData[2], pCaseOut, now);
          renderSingleScrambleOut(whoEl, newData[1], pCaseOut, now);
          renderSingleScrambleOut(lvEl, newData[0], pCaseOut, now);
        } else {
          setElHtml(lvEl, esc(newData[0]));
          setElHtml(whoEl, esc(newData[1]));
          setElHtml(probEl, esc(newData[2]));
          setElHtml(ideaEl, esc(newData[3]));
        }
      }

      // ─── MANIFESTO STATEMENT (Rešenje ne biramo po veličini klijenta...) ───
      const MAN_LINE_1 = t('manifesto.l1', 'Rešenje ne biramo po veličini klijenta,');
      const MAN_LINE_2 = t('manifesto.l2', 'nego po problemu, potencijalu i saradnji.');

      // Tačna Y koordinata narandžaste linije koja se penje od dna (roadRow) ka vrhu (H * 0.08)
      const lineYBottom = roadRow * S + S / 2;
      const lineYTop = H * 0.08;
      const lineProg = sm(0.62, 0.74, P);
      const currentLineY = (parts.length && parts[0]) ? parts[0].y : (lineYBottom + (lineYTop - lineYBottom) * lineProg);

      if (P >= 0.535 && P < 0.71) {
        if (P < 0.585) {
          // Decode faza dok se kule spljoštavaju u liniju na dnu
          const pDec = Math.max(0, Math.min(1, (P - 0.535) / 0.05));
          if (manEl) manEl.style.setProperty('--mf-o', Math.min(1, pDec * 2.0).toFixed(3));
          renderSingleDecode(manAEl, MAN_LINE_1, Math.min(1, pDec * 1.5), now);
          renderSingleDecode(manBEl, MAN_LINE_2, Math.max(0, (pDec - 0.25) * 1.33), now);
          if (manWrapEl) manWrapEl.style.clipPath = 'none';
        } else {
          // Tekst je 100% čist, statičan i čitljiv
          setElHtml(manAEl, esc(MAN_LINE_1));
          setElHtml(manBEl, esc(MAN_LINE_2));

          if (manWrapEl) {
            const rect = manWrapEl.getBoundingClientRect();
            // Koristimo tačnu Y koordinatu linije čestica; oduzimamo 4px kako slova NIKADA ne bi virila ispod linije
            const cutY = (parts.length && parts[0]) ? parts[0].y : currentLineY;
            if (cutY >= rect.bottom + 2) {
              // Narandžasta linija je još uvek ispod teksta — ceo tekst je vidljiv
              manEl.style.setProperty('--mf-o', '1');
              manWrapEl.style.clipPath = 'none';
              manWrapEl.style.maskImage = 'none';
              manWrapEl.style.webkitMaskImage = 'none';
            } else if (cutY <= rect.top + 2) {
              // Narandžasta linija je prešla preko celog teksta — tekst je 100% obrisan
              manEl.style.setProperty('--mf-o', '0');
              manWrapEl.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
              manWrapEl.style.maskImage = 'none';
              manWrapEl.style.webkitMaskImage = 'none';
            } else {
              // Narandžasta linija seče tekst oštro na liniji — nema nikakvih slova niti duhova ispod nje
              manEl.style.setProperty('--mf-o', '1');
              const lineYInWrap = Math.max(0, Math.floor(cutY - rect.top - 4));
              manWrapEl.style.clipPath = `polygon(0 0, 100% 0, 100% ${lineYInWrap}px, 0 ${lineYInWrap}px)`;
              manWrapEl.style.maskImage = 'none';
              manWrapEl.style.webkitMaskImage = 'none';
            }
          }
        }
      } else {
        if (manEl) manEl.style.setProperty('--mf-o', '0');
        if (manWrapEl) {
          manWrapEl.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
          manWrapEl.style.maskImage = 'none';
          manWrapEl.style.webkitMaskImage = 'none';
        }
        setElHtml(manAEl, '');
        setElHtml(manBEl, '');
      }

      // ─── USLUGE VIDLJIVOST I POJAVLJIVANJE BLOKOVA (P >= 0.81) ───
      const cardFadeIn = sm(0.81, 0.835, P);
      const cardFadeOut = sm(0.965, 0.98, P);
      const uo = cardFadeIn * (1.0 - cardFadeOut);
      const us = document.getElementById('usluge');
      if (us) {
        us.style.setProperty('--u', uo.toFixed(3));
        us.classList.toggle('on', uo > 0.4);
      }

      // AirDrop pojavljivanje i dešifrovanje teksta na 3 bloka čim se tačkice pretvore u simbol (P >= 0.81)
      if (P >= 0.81 && P < 0.97) {
        if (!servicesBlocksAnimated && serviceCards.length) {
          servicesBlocksAnimated = true;
          serviceCards.forEach((card, idx) => {
            card.classList.add('in');
            const delay = reduce ? 0 : 360 + idx * 110;
            decodeBlockText(card, delay);
          });
        }
      } else if (P < 0.77) {
        if (servicesBlocksAnimated) {
          servicesBlocksAnimated = false;
          serviceCards.forEach((card) => {
            card.classList.remove('in');
          });
        }
      }
    }

    requestAnimationFrame(frame);
  }

  function onIdejeResize() {
    const sz = getStageSize();
    const curDpr = Math.min(2, window.devicePixelRatio || 1);
    const widthChanged = Math.abs(sz.w - lastIdejeWidth) > 1;
    const dprChanged = Math.abs(curDpr - lastIdejeDpr) > 0.001;
    const heightChanged = sz.w <= 768
      ? Math.abs(sz.h - lastIdejeHeight) > 100
      : Math.abs(sz.h - lastIdejeHeight) > 1;
    if (!widthChanged && !heightChanged && !dprChanged) return;
    build();
  }
  window.addEventListener('resize', onIdejeResize, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onIdejeResize, { passive: true });
  }
  window.addEventListener('load', () => {
    build();
  }, { once: true });
  build();
  requestAnimationFrame(frame);
}
