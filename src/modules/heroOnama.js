/**
 * heroOnama.js — Unified Hero Laptop Video Scrub & Pinned "O nama" Dot Figures Stage
 * 
 * Flow:
 * 1. Scroll-driven Hero Laptop Video (16:9 for desktop, 9:16 for mobile).
 * 2. When the laptop video fully zooms in, dots burst from the screen and form "BULEVAR.IT".
 * 3. O nama section begins with 5 dot figures:
 *    - 01: BULEVAR.IT ("Studio iz Novog Sada.")
 *    - 02: 18 ("Najmlađi u timu imaju 18 godina.")
 *    - 03: 25+ ("Godina iskustva mentora u marketingu.")
 *    - 04: 5 ("Zanata u jednoj ekipi.")
 *    - 05: 1 ("Sistem. I ostaje vaš.")
 * 4. At the end of "1", dots stream into the orange arc, leading directly into the "Ideje" section.
 */

import { t } from './i18n.js';

export function initHeroOnama() {
  const track = document.getElementById('hero');
  const stage = document.getElementById('hero-stage');
  const cv = document.getElementById('hero-onama-cv');
  const HV = document.getElementById('hero-video-player');
  const bar = document.getElementById('hero-onama-bar');
  const cap = document.getElementById('hero-onama-cap');
  const ci = document.getElementById('hero-onama-ci');
  const th = document.getElementById('hero-onama-th');
  const tp = document.getElementById('hero-onama-tp');
  const hint = document.getElementById('hero-hint');

  if (!track || !cv || !HV) return;
  if (cap) cap.style.opacity = '0';

  document.body.classList.add('theme--black');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cl(x) { return Math.max(0, Math.min(1, x)); }
  function sm(a, b, x) { x = cl((x - a) / (b - a)); return x * x * (3 - 2 * x); }
  function eio(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  const F = [
    { m: 'BULEVAR', a: '.IT', h: t('onama.f0.h', 'Studio iz Novog Sada.'), p: t('onama.f0.p', 'Pravimo digitalne sisteme koji posle ostaju u rukama vlasnika.') },
    { m: '18', a: '', h: t('onama.f1.h', 'Najmlađi u timu imaju 18 godina.'), p: t('onama.f1.p', 'Prvi primete kada se internet promeni. Vi to vidite na svom sajtu.') },
    { m: '25', a: '+', h: t('onama.f2.h', 'Godina iskustva mentora u marketingu.'), p: t('onama.f2.p', 'Znaju šta prodaje i zašto. Paze da sve što napravimo ima poslovni smisao.') },
    { m: '', a: '', h: t('onama.f3.h', 'Sistem. I ostaje vaš.'), p: t('onama.f3.p', 'Ne iznajmljujemo vam sajt. Gradimo ga za vas, i ključevi ostaju kod vas.') }
  ];

  const x = cv.getContext('2d');
  let W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  let STEP = 12, N = 0, P = [], SH = [], ARC = [], SC = [];
  let logoReady = false;
  const off = document.createElement('canvas');
  const ox = off.getContext('2d', { willReadFrequently: true });

  function sampleKey() {
    const mob = W < 760, stepS = STEP;
    off.width = W; off.height = H;
    ox.clearRect(0, 0, W, H);
    const shortH = !mob && H < 860;
    off.width = W; off.height = H;
    ox.clearRect(0, 0, W, H);
    const kh = mob ? H * 0.48 : Math.min(W * 0.55, H * (shortH ? 0.48 : 0.60)), s = kh / 256;
    const ox0 = W / 2 - 150 * s, oy0 = H * (mob ? 0.35 : (shortH ? 0.39 : 0.42)) - 152 * s;

    ox.setTransform(s, 0, 0, s, ox0, oy0);
    ox.fillStyle = '#fff';
    ox.beginPath();
    ox.arc(150, 72, 50, 0, 6.283);
    ox.fill();
    ox.fillRect(137, 116, 27, 166);
    ox.fillRect(164, 210, 32, 18);
    ox.fillRect(164, 242, 44, 20);
    ox.fillRect(164, 270, 26, 12);
    ox.globalCompositeOperation = 'destination-out';
    ox.beginPath();
    ox.arc(150, 72, 24, 0, 6.283);
    ox.fill();
    ox.globalCompositeOperation = 'source-over';
    ox.setTransform(1, 0, 0, 1, 0, 0);

    const d = ox.getImageData(0, 0, W, H).data;
    const o = [];
    for (let yy = stepS / 2; yy < H; yy += stepS) {
      for (let xx = stepS / 2; xx < W; xx += stepS) {
        const i = ((yy | 0) * W + (xx | 0)) * 4;
        if (d[i + 3] > 140) o.push({ x: xx, y: yy, a: true, isKey: true });
      }
    }

    return o;
  }

  function sample(f) {
    const mob = W < 760, stepS = STEP;
    off.width = W; off.height = H;
    ox.clearRect(0, 0, W, H);
    const txt = f.m + f.a;
    let size = 400;
    ox.font = '900 ' + size + 'px Montserrat, sans-serif';
    const tw = ox.measureText(txt).width;
    const maxW = W * (mob ? 0.92 : 0.86), maxH = H * (mob ? 0.42 : (!mob && H < 860 ? 0.46 : 0.56));
    size = Math.max(24, Math.min(size * maxW / Math.max(1, tw), maxH / 0.74));

    ox.font = '900 ' + size + 'px Montserrat, sans-serif';
    ox.textBaseline = 'alphabetic';
    ox.textAlign = 'left';
    const mw = ox.measureText(f.m).width, aw = ox.measureText(f.a).width;
    const x0 = (W - mw - aw) / 2, y0 = H * (mob ? 0.4 : (!mob && H < 860 ? 0.41 : 0.44)) + size * 0.36;
    ox.fillStyle = '#fff';
    ox.fillText(f.m, x0, y0);
    ox.fillStyle = '#f00';
    ox.fillText(f.a, x0 + mw, y0);
    const d = ox.getImageData(0, 0, W, H).data;
    const o = [];
    for (let yy = stepS / 2; yy < H; yy += stepS) {
      for (let xx = stepS / 2; xx < W; xx += stepS) {
        const i = ((yy | 0) * W + (xx | 0)) * 4;
        if (d[i + 3] > 140) o.push({ x: xx, y: yy, a: d[i + 1] < 100 });
      }
    }

    return o;
  }

  /* Exact logo bitmap sampled with precision per letter column */
  const LM = new Image();
  LM.src = 'data:image/png;base64,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';

  let LST = 8;
  function sampleLogo() {
    if (!LM.complete || !LM.naturalWidth) { logoReady = false; return sample(F[0]); }
    const mob = W < 760, shortH = !mob && H < 860;
    off.width = W; off.height = H;
    ox.clearRect(0, 0, W, H);
    const IW = 984, IH = 165;
    let lw = W * (mob ? 0.9 : 0.76);
    let sc = lw / IW;
    let lh = IH * sc;
    if (lh > H * 0.3) {
      sc = (H * 0.3) / IH;
      lw = IW * sc;
      lh = H * 0.3;
    }
    let x0 = (W - lw) / 2;
    const maxLh = H * (mob ? 0.3 : (shortH ? 0.26 : 0.3));
    if (lh > maxLh) {
      sc = maxLh / IH;
      lw = IW * sc;
      lh = maxLh;
    }
    x0 = (W - lw) / 2;
    const y0 = H * (mob ? 0.36 : (shortH ? 0.36 : 0.38)) - lh / 2;
    ox.imageSmoothingEnabled = true;
    ox.drawImage(LM, x0, y0, lw, lh);
    const d = ox.getImageData(0, 0, W, H).data;
    const o = [];
    const ST = Math.max(4, Math.round(lh / (mob ? 12 : 17)));
    LST = ST;
    logoReady = true;

    /* Letter boundaries in pixels: B u l e v a r | . I T */
    const BX = [
      [0, 155, 0], [155, 281, 0], [281, 335, 0], [335, 456, 0],
      [456, 564, 0], [564, 677, 0], [677, 800, 0], [700, 804, 1],
      [804, 853, 1], [853, 984, 1]
    ];
    const gy0 = y0 + ST / 2;

    const letters = [];

    BX.forEach(function (b, L) {
      const sx0 = x0 + b[0] * sc, sx1 = x0 + b[1] * sc, wantGold = b[2];
      function inL(px, py) {
        if (px < sx0 || px >= sx1 || px < 0 || py < 0 || px >= W || py >= H) return false;
        const k = ((py | 0) * W + (px | 0)) * 4;
        return d[k + 3] > 128 && ((d[k + 1] < 100) === !!wantGold);
      }
      let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
      for (let py = y0 | 0; py < y0 + lh; py += 2) {
        for (let px = sx0 | 0; px < sx1; px += 2) {
          if (inL(px, py)) {
            bx0 = Math.min(bx0, px); bx1 = Math.max(bx1, px);
            by0 = Math.min(by0, py); by1 = Math.max(by1, py);
          }
        }
      }
      if (bx1 < bx0) return;

      const NX = Math.max(1, Math.round((bx1 - bx0) / ST));
      const gx0 = bx0 + ((bx1 - bx0) - (NX - 1) * ST) / 2;
      const j0 = Math.floor((by0 - gy0) / ST) - 1;
      const j1 = Math.ceil((by1 - gy0) / ST) + 1;
      const on = {}, cov = {};

      for (let j = j0; j <= j1; j++) {
        for (let i = -1; i <= NX; i++) {
          const cx0 = gx0 + i * ST, cy0 = gy0 + j * ST;
          let c = 0;
          for (let sy = 0; sy < 4; sy++) {
            for (let sx = 0; sx < 4; sx++) {
              if (inL(cx0 + (sx - 1.5) * ST / 4, cy0 + (sy - 1.5) * ST / 4)) c++;
            }
          }
          cov[i + ',' + j] = c / 16;
          on[i + ',' + j] = c / 16 >= 0.5;
        }
      }

      function at(i, j) { return !!on[i + ',' + j]; }
      const keep = {};
      for (const k in on) {
        if (!on[k]) continue;
        const ij = k.split(',');
        const i = +ij[0], j = +ij[1];
        const n4 = at(i - 1, j) + at(i + 1, j) + at(i, j - 1) + at(i, j + 1);
        if (n4 >= 2 || (n4 >= 1 && cov[k] > 0.8)) keep[k] = 1;
      }
      for (const k in cov) {
        if (keep[k] || on[k]) continue;
        const ij = k.split(',');
        const i = +ij[0], j = +ij[1];
        if (at(i - 1, j) && at(i + 1, j) && at(i, j - 1) && at(i, j + 1) && cov[k] >= 0.3) keep[k] = 1;
      }

      const letterPts = [];
      let minI = 1e9, maxI = -1e9;
      for (const k in keep) {
        const ij = k.split(',');
        const i = +ij[0], j = +ij[1];
        minI = Math.min(minI, i);
        maxI = Math.max(maxI, i);
        letterPts.push({ i, j, a: !!wantGold, L });
      }

      if (letterPts.length > 0) {
        letters.push({
          L,
          gx0,
          minI,
          maxI,
          cols: maxI - minI + 1,
          pts: letterPts
        });
      }
    });

    if (!mob) {
      // Desktop: retain original exact positioning
      letters.forEach(function (l) {
        l.pts.forEach(function (p) {
          o.push({
            x: l.gx0 + p.i * ST,
            y: gy0 + p.j * ST,
            a: p.a,
            L: l.L
          });
        });
      });
    } else {
      // Mobile: widen spacing between letters so they don't look cramped
      const letterGap = Math.max(8, Math.round(ST * 2.2));
      const dotGap = Math.max(10, Math.round(letterGap * 1.5)); // extra breathing room before .IT

      let totalWidth = 0;
      letters.forEach(function (l, idx) {
        const letterW = (l.cols - 1) * ST;
        totalWidth += letterW;
        if (idx < letters.length - 1) {
          totalWidth += (l.L === 6 ? dotGap : letterGap);
        }
      });

      const maxAvailable = W * 0.92;
      let effectiveGap = letterGap;
      let effectiveDotGap = dotGap;
      if (totalWidth > maxAvailable) {
        const sumLetterWidths = letters.reduce(function (sum, l) { return sum + (l.cols - 1) * ST; }, 0);
        const remainingSpace = Math.max(0, maxAvailable - sumLetterWidths);
        effectiveGap = Math.max(4, Math.floor(remainingSpace / (letters.length - 0.5)));
        effectiveDotGap = Math.max(5, Math.floor(effectiveGap * 1.5));
        totalWidth = sumLetterWidths + (letters.length - 2) * effectiveGap + effectiveDotGap;
      }

      let curX = (W - totalWidth) / 2;
      letters.forEach(function (l, idx) {
        const letterW = (l.cols - 1) * ST;
        l.pts.forEach(function (p) {
          o.push({
            x: curX + (p.i - l.minI) * ST,
            y: gy0 + p.j * ST,
            a: p.a,
            L: l.L
          });
        });
        const gapAfter = (l.L === 6 ? effectiveDotGap : effectiveGap);
        curX += letterW + gapAfter;
      });
    }


    return o;
  }

  function logoPos(pt, prog) {
    if (prog >= 1) return { x: pt.x, y: pt.y, vis: true };
    if (pt.sx === undefined) {
      pt.sx = -20 - Math.random() * W * 0.35;
      pt.sy = pt.y + (Math.random() - 0.5) * H * 0.5;
      pt.dl = (pt.x / W) * 0.45 + Math.random() * 0.12;
    }
    const q = cl((prog - pt.dl) / 0.43);
    const e = 1 - Math.pow(1 - q, 3);
    const x2 = pt.sx + (pt.x - pt.sx) * e;
    const y2 = pt.sy + (pt.y - pt.sy) * (1 - Math.pow(1 - q, 1.6));
    return { x: x2, y: y2, vis: q > 0, q: q };
  }

  let lastHeroWidth = 0;
  let lastHeroHeight = 0;
  let lastHeroDpr = 1;

  function getHeroStageSize() {
    const isCssApplied = getComputedStyle(cv).position === 'absolute';
    const r = (stage || cv).getBoundingClientRect();
    const rawW = (isCssApplied && r.width > 0 && !(r.width === 300 && r.height === 150))
      ? r.width
      : window.innerWidth;
    const rawH = (isCssApplied && r.height > 200)
      ? r.height
      : window.innerHeight;
    return {
      w: Math.max(1, Math.round(rawW || window.innerWidth)) | 0,
      h: Math.max(1, Math.round(rawH || window.innerHeight)) | 0
    };
  }

  function build() {
    const sz = getHeroStageSize();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = sz.w;
    H = sz.h;
    lastHeroWidth = W;
    lastHeroHeight = H;
    lastHeroDpr = dpr;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    STEP = (W < 760 || H < 700) ? 8 : (H < 820 ? 10 : 12);

    SH = F.map(function (f, i) {
      if (i === 0) return sampleLogo();
      if (i === 3) return sampleKey();
      return sample(f);
    });
    N = Math.max.apply(null, SH.map(function (s) { return s.length; }));
    SH = SH.map(function (s) {
      const o = s.slice();
      for (let i = o.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0, t = o[i];
        o[i] = o[j]; o[j] = t;
      }
      while (o.length < N) o.push({ x: W / 2, y: H / 2, a: false, dust: true });
  
    return o;
    });

    /* kraj O nama: polazi se od samog ključa (figura 3); svaka tačka dobija svoje mesto u luku (u) */
    ARC = SH[3].map(function (q) {
      return { x: q.x, y: q.y, a: q.a, dust: q.dust, u: Math.random() };
    });

    SC = [];
    for (let i = 0; i < N; i++) {
      const an = Math.random() * 6.283, rd = Math.random() * Math.min(W, H) * 0.04;
      SC.push({ x: W / 2 + Math.cos(an) * rd, y: H * 0.46 + Math.sin(an) * rd, a: false });
    }

    P = [];
    for (let i = 0; i < N; i++) {
      P.push({
        d: Math.random(),
        ang: Math.random() * 6.283,
        sp: 0.6 + Math.random() * 0.8,
        ox: 0,
        oy: 0,
        j: (Math.random() - 0.5)
      });
    }
  }

  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
  const L = { h: { el: th, ms: 34, t: '', st: 0, h: '' }, p: { el: tp, ms: 13, t: '', st: 0, h: '' } };

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function say(k, textStr, delay) {
    L[k].t = textStr;
    L[k].st = performance.now() + (delay || 0);
  }

  function text(now) {
    for (const k in L) {
      const l = L[k];
      if (!l.t || !l.el) continue;
      const n = l.t.length;
      const q = reduce ? 1 : cl((now - l.st) / (n * l.ms));
      const dd = Math.floor(q * n);
      const nz = (q <= 0 || q >= 1) ? 0 : Math.min(4, n - dd);
      let z = '';
      for (let j = 0; j < nz; j++) {
        const ch = l.t[dd + j];
        z += ch === ' ' ? ' ' : GL[(Math.random() * GL.length) | 0];
      }
      const h = esc(l.t.slice(0, dd)) + '<span class="noise">' + esc(z) + '</span><span class="rest">' + esc(l.t.slice(dd + nz)) + '</span>';
      if (h !== l.h) {
        l.el.innerHTML = h;
        l.h = h;
      }
    }
  }

  let mx = -999, my = -999;
  window.addEventListener('pointermove', function (e) {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  }, { passive: true });

  window.addEventListener('pointerleave', function () {
    mx = my = -999;
  }, { passive: true });

  /* Global Timeline:
     0.00–0.15  video laptop scrub (laptop opens & magnifies to screen)
     0.15–0.28  dots burst out of screen → BULEVAR.IT ("Studio iz Novog Sada.")
     0.28–0.78  O nama 4 figures (BULEVAR.IT, 18, 25+, Ključ)
     0.78–1.00  Ključ dots dissolve outwards and assemble into Ideje arc
  */
  const V1 = 0.15, LA = 0.15, O0 = 0.28, O1 = 0.78;
  const SEG = [[0, 0.16], [0.26, 0.44], [0.54, 0.72], [0.82, 1.00]];
  let cur = -1;

  function stateAt(Pp) {
    for (let i = 0; i < 4; i++) {
      if (Pp < SEG[i][1]) {
        return i === 0 || Pp >= SEG[i][0]
          ? { a: i, b: i, t: 0 }
          : { a: i - 1, b: i, t: (Pp - SEG[i - 1][1]) / (SEG[i][0] - SEG[i - 1][1]) };
      }
    }
    return { a: 3, b: 3, t: 0 };
  }

  /* Video Scrubbing (Desktop 16:9 vs Mobile 9:16) via in-memory Blob for instant seek */
  let vReady = false, vT = 0, targetTime = 0.001;

  function pickVideo() {
    const isMobileAspect = window.innerWidth / window.innerHeight < 0.8;
    const wantSrc = isMobileAspect ? '/hero-9x16.mp4' : '/hero-16x9.mp4';
    if (HV.dataset.pickedSrc === wantSrc) return;
    HV.dataset.pickedSrc = wantSrc;
    vReady = false;

    fetch(wantSrc)
      .then((r) => {
        if (!r.ok) throw new Error('Blob fetch failed');
        return r.blob();
      })
      .then((blob) => {
        if (HV.dataset.pickedSrc !== wantSrc) return;
        if (HV._blobUrl) URL.revokeObjectURL(HV._blobUrl);
        HV._blobUrl = URL.createObjectURL(blob);
        HV.src = HV._blobUrl;
        HV.load();
      })
      .catch(() => {
        HV.src = wantSrc;
        HV.load();
      });
  }

  function onVideoReady() {
    vReady = true;
    if (HV.duration) {
      const tt = Math.max(0.001, Math.min(HV.duration - 0.04, vT * HV.duration));
      HV.currentTime = tt;
    }
  }

  HV.addEventListener('loadeddata', onVideoReady);
  HV.addEventListener('canplay', onVideoReady);
  if (HV.readyState >= 2) {
    onVideoReady();
  }

  function videoScrub(G) {
    const tgt = cl(G / V1);
    vT += (tgt - vT) * (reduce ? 1 : 0.35);
    if (Math.abs(tgt - vT) < 0.0005) vT = tgt;
    if (vReady && HV.duration) {
      const tt = Math.max(0.001, Math.min(HV.duration - 0.04, vT * HV.duration));
      targetTime = tt;
      if (!HV.seeking && Math.abs(HV.currentTime - tt) > 0.015) {
        HV.currentTime = tt;
      }
    }
    // Video is only visible while laptop opens/zooms (0 to V1)
    if (G < V1) {
      HV.style.visibility = 'visible';
      HV.style.opacity = '1';
    } else if (G < V1 + 0.02) {
      HV.style.visibility = 'visible';
      HV.style.opacity = String(Math.max(0, 1 - (G - V1) / 0.02));
    } else {
      HV.style.visibility = 'hidden';
      HV.style.opacity = '0';
    }
  }

  HV.addEventListener('seeked', () => {
    if (vReady && HV.duration && Math.abs(HV.currentTime - targetTime) > 0.02) {
      HV.currentTime = targetTime;
    }
  });

  pickVideo();

  function frame(now) {
    const r = track.getBoundingClientRect();
    const tot = track.offsetHeight - window.innerHeight;
    const G = cl(tot > 0 ? -r.top / tot : 0);

    if (r.bottom < -200 || r.top > window.innerHeight + 200) {
      requestAnimationFrame(frame);
      return;
    }

    if (stage) {
      if (G >= 0.995) {
        stage.style.opacity = '0';
        stage.style.pointerEvents = 'none';
        stage.style.visibility = 'hidden';
      } else {
        stage.style.opacity = '1';
        stage.style.pointerEvents = 'auto';
        stage.style.visibility = 'visible';
      }
    }

    const t = now / 1000;
    if (hint) hint.style.opacity = G < 0.01 ? '1' : '0';

    const cw = cv.clientWidth;
    const ch = cv.clientHeight;
    if (cw > 0 && ch > 200 && (Math.abs(cw - W) > 2 || Math.abs(ch - H) > 100)) {
      build();
    }
    if (!logoReady && LM.complete && LM.naturalWidth > 0) build();
    videoScrub(G);

    if (!N) {
      requestAnimationFrame(frame);
      return;
    }

    /* ---- FAZA A: video + izlet tačaka u BULEVAR.IT ---- */
    if (G < O0) {
      x.clearRect(0, 0, W, H);
      if (G < LA) {
        // Hero laptop is still opening/magnifying; no dots, no captions
        if (cap) cap.style.opacity = '0';
      } else {
        // Laptop screen fully magnified; dots burst out from center
        const e0 = reduce ? 1 : cl((G - LA) / (O0 - 0.02 - LA));
        if (cap) cap.style.opacity = sm(LA + 0.02, O0 - 0.02, G).toFixed(3);
        if (cur !== 0 && e0 > 0.6) {
          cur = 0;
          if (ci) ci.textContent = '01';
          say('h', F[0].h, 80);
          say('p', F[0].p, 80 + F[0].h.length * 20);
        }
        for (let i = 0; i < N; i++) {
          const b = SH[0][i];
          if (b.dust) continue;
          const q = logoPos(b, e0, t);
          if (!q.vis) continue;
          x.globalAlpha = Math.min(1, q.q === undefined ? 1 : q.q * 4);
          x.fillStyle = b.a ? '#D9B25F' : '#F3EEE3';
          x.beginPath();
          x.arc(q.x, q.y, LST * 0.4, 0, 6.283);
          x.fill();
        }
        x.globalAlpha = 1;
      }
      text(now);
      requestAnimationFrame(frame);
      return;
    }

    /* ---- FAZA B: 4 Figure O nama & Nestajanje ključa u luk Ideje ---- */
    const Pp = cl((G - O0) / (O1 - O0));
    const exitProg = cl((G - 0.78) / 0.21);
    const s = stateAt(Pp);
    const idx = s.t < 0.5 ? s.a : Math.min(3, s.b);

    if (idx !== cur && exitProg === 0) {
      cur = idx;
      if (ci) ci.textContent = '0' + (idx + 1);
      L.h.t = L.p.t = '';
      say('h', F[idx].h, 80);
      say('p', F[idx].p, 80 + F[idx].h.length * 34 * 0.6);
    }

    const moving = (s.t > 0 && s.t < 1) || exitProg > 0;
    const blast = Math.sin(Math.PI * s.t);

    if (cap) {
      if (exitProg > 0) {
        cap.style.opacity = Math.max(0, 1 - exitProg * 2.5).toFixed(3);
      } else {
        cap.style.opacity = '1';
      }
    }

    // Uvek potpuno i čisto brišemo canvas da ne ostane nikakav trag od tačaka ili ključa
    x.clearRect(0, 0, W, H);

    const gridA = 0.10 * (1 - exitProg);
    x.fillStyle = 'rgba(184,146,90,' + gridA + ')';
    if (gridA > 0.005) {
      for (let gy = STEP * 2; gy < H; gy += STEP * 3) {
        for (let gx = STEP * 2; gx < W; gx += STEP * 3) {
          x.fillRect(gx, gy, 1.2, 1.2);
        }
      }
    }

    const A = SH[s.a], B = SH[s.b];
    const cxm = W / 2, cym = H * 0.45;

    // Koordinate i parametri polukruga Ideje (potpuno identični sArc u ideje.js)
    const arcR = Math.min(W * 0.46, H * 0.9);
    const cx = W / 2;
    const cy = -H * 0.06;
    const mob = W < 860;
    const S_step = mob ? 22 : 31;

    for (let i = 0; i < N; i++) {
      const a = A[i], b = B[i], p = P[i];

      // Ako je tačka dust na obe strane i još nema nestajanja broja 1, preskačemo
      if (a.dust && b.dust && exitProg === 0) continue;

      const e = reduce ? (s.t > 0.5 ? 1 : 0) : sm(p.d * 0.35, p.d * 0.35 + 0.65, s.t);
      let ax = a.dust ? b.x : a.x;
      let ay = a.dust ? b.y : a.y;
      let bx = b.dust ? a.x : b.x;
      let by = b.dust ? a.y : b.y;

      if (s.a === 0 && !a.dust && a.L !== undefined) {
        const qa = logoPos(a, 1, t);
        ax = qa.x; ay = qa.y;
      }
      let px = ax + (bx - ax) * e;
      let py = ay + (by - ay) * e;

      // Suptilno organsko disanje tokom prelazaka između figura 0-4
      if (!reduce && blast > 0 && !a.dust && !b.dust && exitProg === 0) {
        const dx = px - cxm, dy = py - cym, dl = Math.sqrt(dx * dx + dy * dy) + 1;
        const k = Math.sin(Math.PI * e) * 22 * p.sp;
        px += dx / dl * k + Math.cos(p.ang) * k * 0.35;
        py += dy / dl * k + Math.sin(p.ang) * k * 0.35;
      }

      let alpha = 1;
      if (a.dust && !b.dust) {
        alpha = e;
      } else if (!a.dust && b.dust) {
        alpha = 1 - e;
      } else if (a.dust && b.dust) {
        alpha = 0;
      }

      const isKeyPt = (s.a === 3 || s.b === 3 || a.isKey || b.isKey);
      const acc = (e < 0.5 ? a.a : b.a);
      let col = isKeyPt
        ? [232, 150, 58] // Kljuc u O nama je STALNO narandzaste boje (#E8963A)
        : (s.a === 0 && e < 0.5)
        ? (acc ? [217, 178, 95] : [243, 238, 227])
        : acc ? [232, 150, 58] : [217, 178, 95];
      let rad = (STEP * 0.36);

      // ─── ANIMACIJA ZA NESTAJANJE BROJA 1 → PRELAZ KA POČETKU IDEJE ───
      if (exitProg > 0) {
        if (b.dust) continue; // Dust tačke se ne iscrtavaju

        const dotDelay = p.d * 0.22;
        const dp = cl((exitProg - dotDelay) / 0.78);
        const ease = reduce ? dp : (dp < 0.5 ? 2 * dp * dp : 1 - Math.pow(-2 * dp + 2, 2) / 2);

        // Ciljna tačka nestajanja: početak originalnog luka Ideje (cx - R, cy) — gornji levi ugao, na ivici ekrana
        const arcR = Math.min(W * 0.46, H * 0.9);
        const exitX = (W / 2 - arcR) + (p.d - 0.5) * 50;
        const exitY = -H * 0.06 + p.j * 50;

        // Zakrivljena putanja nagore i ulevo
        const cpX = bx - (bx - exitX) * 0.35 + (p.d - 0.5) * 60;
        const cpY = Math.min(by, exitY) - H * 0.16 * Math.sin(ease * Math.PI);

        const oneM = 1 - ease;
        px = oneM * oneM * bx + 2 * oneM * ease * cpX + ease * ease * exitX;
        py = oneM * oneM * by + 2 * oneM * ease * cpY + ease * ease * exitY;

        if (!reduce) {
          const disp = Math.sin(ease * Math.PI) * 16 * p.sp;
          px += Math.cos(p.ang) * disp;
          py += Math.sin(p.ang) * disp;
        }

        // Kljuc ostaje uvek cisto narandzast [232, 150, 58] bez menjanja boje
        if (isKeyPt) {
          col = [232, 150, 58];
        } else {
          col = [
            217 + (238 - 217) * ease,
            178 + (126 - 178) * ease,
            95 + (34 - 95) * ease
          ];
        }
        rad = (STEP * 0.36) * (1.0 - ease * 0.35);

        // Tačke postepeno blede do potpunog nestajanja (alpha -> 0)
        alpha = Math.max(0, 1.0 - Math.pow(ease, 1.4));
      }

      if (alpha <= 0.01) continue;

      const rx = px - mx, ry = py - my, rd = rx * rx + ry * ry;
      let tx = 0, ty = 0;
      if (rd < 8100 && !reduce && exitProg === 0) {
        const f = (1 - Math.sqrt(rd) / 90) * 26 / (Math.sqrt(rd) + 0.01);
        tx = rx * f;
        ty = ry * f;
      }
      p.ox += (tx - p.ox) * 0.18;
      p.oy += (ty - p.oy) * 0.18;
      px += p.ox;
      py += p.oy;

      x.globalAlpha = alpha;
      x.fillStyle = 'rgb(' + (col[0] | 0) + ',' + (col[1] | 0) + ',' + (col[2] | 0) + ')';
      if (s.a === 0 && s.b === 0) {
        rad = LST * 0.4;
      } else if (s.a === 0 && a.L !== undefined) {
        rad = LST * 0.4 + (STEP * 0.36 - LST * 0.4) * e;
      }
      const rr = rad * (1 + 0.12 * Math.sin(t * 2 + p.ang) * (moving || s.a === 0 ? 0 : 1));
      x.beginPath();
      x.arc(px, py, rr, 0, 6.283);
      x.fill();
    }
    x.globalAlpha = 1;

    text(now);
    requestAnimationFrame(frame);
  }

  // Start loop immediately without blocking on network fonts or images
  build();
  cur = -1;
  videoScrub(0);
  requestAnimationFrame(frame);

  function onHeroResize() {
    const sz = getHeroStageSize();
    const curDpr = Math.min(2, window.devicePixelRatio || 1);
    const isMob = sz.w <= 768;
    const widthChanged = Math.abs(sz.w - lastHeroWidth) > 1;
    const dprChanged = Math.abs(curDpr - lastHeroDpr) > 0.001;
    const heightChanged = isMob ? Math.abs(sz.h - lastHeroHeight) > 100 : Math.abs(sz.h - lastHeroHeight) > 1;
    if (!widthChanged && !heightChanged && !dprChanged) return;
    if (widthChanged) pickVideo();
    build();
  }
  window.addEventListener('resize', onHeroResize, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onHeroResize, { passive: true });
  }
  window.addEventListener('load', () => {
    build();
  }, { once: true });
  if (!LM.complete) {
    LM.addEventListener('load', () => build(), { once: true });
  }
  window.addEventListener('resize', () => {
    if (true) return;
    lastHeroWidth = window.innerWidth;
    pickVideo();
    build();
  }, { passive: true });

  window.addEventListener('bulevar:langchange', () => {
    F[0].h = t('onama.f0.h', 'Studio iz Novog Sada.');
    F[0].p = t('onama.f0.p', 'Pravimo digitalne sisteme koji posle ostaju u rukama vlasnika.');
    F[1].h = t('onama.f1.h', 'Najmlađi u timu imaju 18 godina.');
    F[1].p = t('onama.f1.p', 'Prvi primete kada se internet promeni. Vi to vidite na svom sajtu.');
    F[2].h = t('onama.f2.h', 'Godina iskustva mentora u marketingu.');
    F[2].p = t('onama.f2.p', 'Znaju šta prodaje i zašto. Paze da sve što napravimo ima poslovni smisao.');
    F[3].h = t('onama.f3.h', 'Sistem. I ostaje vaš.');
    F[3].p = t('onama.f3.p', 'Ne iznajmljujemo vam sajt. Gradimo ga za vas, i ključevi ostaju kod vas.');
    if (cur >= 0 && cur < F.length) {
      say('h', F[cur].h, 20);
      say('p', F[cur].p, 40);
    }
  });

  const fr = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load('900 100px Montserrat'), document.fonts.ready]).catch(() => {})
    : Promise.resolve();

  Promise.all([
    fr,
    LM.decode ? LM.decode().catch(() => {}) : new Promise(r => { LM.onload = r; })
  ]).then(() => {
    build();
  });
}
