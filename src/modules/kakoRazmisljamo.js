/**
 * kakoRazmisljamo.js — Section 07: Pinned staircase scrollytelling & decode text
 * 
 * Features:
 * 1. 7 progressive steps climbing like a staircase (Razumemo -> Učimo)
 * 2. Question decodes in beside the active step
 * 3. Gold dashed staircase line grows with scroll
 * 4. Looping gold path returns from "Učimo" back to "Razumemo" with traveling orange dot
 * 5. Pauses frame loop when off-screen for maximum performance
 */

import { t } from './i18n.js';
import { renderScrollDecode, renderRichScrollDecode } from './scrollDecode.js';

export function initKakoRazmisljamo() {
  const section = document.getElementById('kako-razmisljamo');
  if (!section) return;

  const track = document.getElementById('kr-track');
  const wrap = document.getElementById('kr-wrap');
  const box = document.getElementById('kr-words');
  const dots = document.getElementById('kr-dots');
  const stair = document.getElementById('kr-stair');
  const loop = document.getElementById('kr-loop');
  const tip = document.getElementById('kr-tip');
  const endEl = document.getElementById('kr-end');

  if (!track || !wrap || !box || !dots || !stair || !loop || !tip || !endEl) return;

  function getSteps() {
    return [
      [t('kr.w1', 'Razumemo'), t('kr.q1', 'Šta pokušavate da postignete? Ko su vaši kupci?')],
      [t('kr.w2', 'Definišemo'), t('kr.q2', 'Gde proces zapinje? Po čemu ćemo znati da radi?')],
      [t('kr.w3', 'Zamišljamo'), t('kr.q3', 'Šta bi moglo da reši problem? Šta pretpostavljamo?')],
      [t('kr.w4', 'Dizajniramo'), t('kr.q4', 'Šta kupcu olakšava sledeći korak?')],
      [t('kr.w5', 'Gradimo'), t('kr.q5', 'Šta mora da se poveže? Šta može jednostavnije?')],
      [t('kr.w6', 'Puštamo'), t('kr.q6', 'Šta proveravamo pre puštanja? Ko je zadužen za šta?')],
      [t('kr.w7', 'Učimo'), t('kr.q7', 'Šta pokazuju podaci? Šta testiramo sledeće?')]
    ];
  }

  const S = getSteps();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = [];

  box.innerHTML = '';
  dots.innerHTML = '';

  S.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'kr-w' + (i === 6 ? ' last' : '');
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<span class="n">0' + (i + 1) + '</span><span class="t"></span><span class="q"></span>';
    box.appendChild(d);
    W.push({
      el: d,
      t: d.querySelector('.t'),
      q: d.querySelector('.q'),
      word: s[0],
      ques: s[1],
      on: false
    });
    dots.appendChild(document.createElement('i'));
  });

  // Accessible screen reader hidden list
  let sr = wrap.querySelector('.sr-steps');
  if (!sr) {
    sr = document.createElement('ol');
    sr.className = 'sr-steps';
    sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    S.forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s[0] + ': ' + s[1];
      sr.appendChild(li);
    });
    wrap.appendChild(sr);
  }

  let pos = [];
  let loopD = '';
  let loopLen = 1;
  let stairLen = 1;
  let trackH = track.offsetHeight || window.innerHeight * 8;

  function safeLen(el) {
    try {
      return (el && typeof el.getTotalLength === 'function') ? (el.getTotalLength() || 1) : 1;
    } catch {
      return 1;
    }
  }

  function safePoint(el, dist) {
    try {
      if (!el || typeof el.getPointAtLength !== 'function') return null;
      return el.getPointAtLength(dist);
    } catch {
      return null;
    }
  }

  function layout() {
    trackH = track.offsetHeight || window.innerHeight * 8;
    const r = wrap.getBoundingClientRect();
    const isCssApplied = getComputedStyle(wrap).position === 'relative';
    const rw = (isCssApplied && r.width > 0) ? r.width : Math.min(window.innerWidth, 1440);
    const mob = rw < 860;
    const padL = parseFloat(getComputedStyle(wrap).paddingLeft) || 20;
    const w = rw - padL * 2;
    const h = (isCssApplied && r.height > 200) ? r.height : window.innerHeight;

    // Ensure on desktop/laptop that step 5 (PUŠTAMO) and step 6 (UČIMO) + question .q fit inside the right edge
    const qReserve = Math.min(260, Math.max(195, rw * 0.18));
    const word5Est = Math.min(370, Math.max(190, rw * 0.255));
    const maxStepX5 = Math.max(40, (w - word5Est - qReserve) / 5);
    const desktopStepX = Math.min(w * 0.095, maxStepX5);

    pos = [];
    W.forEach((o, i) => {
      let x, y;
      if (mob) {
        x = padL + i * (w * 0.055);
        y = h * 0.22 + i * (h * 0.088);
      } else {
        x = padL + i * desktopStepX;
        y = h * 0.86 - i * (h * 0.095) - 90;
      }
      o.el.style.left = x + 'px';
      o.el.style.top = y + 'px';
      pos.push([x, y]);
    });

    let d = '';
    pos.forEach((p, i) => {
      const px = p[0] - 6;
      const py = p[1] + 22;
      d += (i ? 'L' : 'M') + px + ' ' + py + (i < 6 ? ' H' + (pos[i + 1][0] - 6) : '');
    });
    stair.setAttribute('d', d);
    stairLen = safeLen(stair);

    // Loop from „Učimo“ back down to „Razumemo“
    if (pos[6] && pos[0]) {
      const a = pos[6];
      const b = pos[0];
      const lx = mob ? a[0] + w * 0.62 : a[0] + w * 0.20;
      loopD = 'M' + (a[0] + (mob ? 140 : 260)) + ' ' + (a[1] + 30) + ' C ' +
        lx + ' ' + (a[1] + 40) + ', ' +
        lx + ' ' + (b[1] + 40) + ', ' +
        (b[0] + (mob ? 160 : 300)) + ' ' + (b[1] + 40);
      loop.setAttribute('d', loopD);
      loopLen = safeLen(loop);
      loop.style.strokeDasharray = loopLen;
      loop.style.strokeDashoffset = loopLen;
    }
  }

  let lastKakoWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  let lastKakoHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  window.addEventListener('resize', () => {
    const wSame = window.innerWidth === lastKakoWidth;
    const hSame = window.innerWidth <= 768 ? Math.abs(window.innerHeight - lastKakoHeight) < 100 : window.innerHeight === lastKakoHeight;
    if (wSame && hSame) return;
    lastKakoWidth = window.innerWidth;
    lastKakoHeight = window.innerHeight;
    layout();
  }, { passive: true });
  window.addEventListener('load', () => {
    lastKakoWidth = window.innerWidth;
    lastKakoHeight = window.innerHeight;
    layout();
  }, { once: true });

  // Scroll-synchronized decode text engine
  function cl(x) {
    return Math.max(0, Math.min(1, x));
  }

  const headEl = section.querySelector('.kr-head');
  const tagEl = headEl ? headEl.querySelector('.kr-tag') : null;
  const h2El = headEl ? headEl.querySelector('h2') : null;
  const subEl = headEl ? headEl.querySelector('.kr-sub') : null;
  let h1Span = null;
  let h2Span = null;

  if (tagEl) tagEl.removeAttribute('data-i18n');
  if (subEl) subEl.removeAttribute('data-i18n');
  if (h2El) {
    h2El.innerHTML = '<span class="kr-h1"></span><em><span class="kr-h2"></span></em>';
    h1Span = h2El.querySelector('.kr-h1');
    h2Span = h2El.querySelector('.kr-h2');
  }

  function getHeadTexts() {
    const tagTxt = t('kr.tag', '07 · Kako razmišljamo');
    const rawH = t('kr.h', 'Bolja pitanja vode do <em>boljih sistema.</em>');
    const subTxt = t('kr.sub', 'Ne počinjemo pitanjem „koji sajt želite?“, nego pitanjem šta vaš biznis pokušava da postigne.');
    const m = rawH.match(/^(.*?)<em>(.*?)<\/em>(.*)$/i);
    if (m) {
      return { tag: tagTxt, h1: m[1], h2: m[2] + (m[3] || ''), sub: subTxt };
    }
    return { tag: tagTxt, h1: rawH, h2: '', sub: subTxt };
  }

  let cachedHead = getHeadTexts();
  let cur = -2;
  let inView = false;
  let rafId = 0;

  function startLoop() {
    if (!rafId) {
      rafId = requestAnimationFrame(frame);
    }
  }

  window.addEventListener('scroll', () => {
    if (inView) startLoop();
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) startLoop();
    }, { rootMargin: '300px 0px' });
    io.observe(track);
  } else {
    inView = true;
  }

  function frame() {
    rafId = 0;
    const r = track.getBoundingClientRect();
    const tot = (trackH || track.offsetHeight) - window.innerHeight;

    // Pause rendering when far offscreen
    if (!inView && (r.bottom < -150 || r.top > window.innerHeight + 150)) {
      return;
    }

    // Section 08 rises over Section 07 in the final window.innerHeight (100vh) of this track.
    const riseDist = window.innerHeight;
    const totAnim = Math.max(1, tot - riseDist);
    // P only advances once section has reached the top of the viewport (r.top <= 0)
    const P = r.top <= 0 ? Math.max(0, Math.min(1, -r.top / totAnim)) : 0;

    // Sheet rise entrance: 0 while section top is below viewport, 1 when it reaches top of screen
    const up = Math.max(0, Math.min(1, 1 - r.top / window.innerHeight));
    track.style.setProperty('--in', '1');

    const isRisingOrPinned = r.top < window.innerHeight * 0.92;
    if (!isRisingOrPinned) {
      renderScrollDecode(tagEl, '', 0);
      renderScrollDecode(h1Span, '', 0);
      renderScrollDecode(h2Span, '', 0);
      renderScrollDecode(subEl, '', 0);
    } else {
      const qTag = r.top <= 0 ? 1 : cl((up - 0.10) / 0.25);
      const qH1 = r.top <= 0 ? 1 : cl((up - 0.22) / 0.30);
      const qH2 = r.top <= 0 ? 1 : cl((up - 0.42) / 0.28);
      const qSub = r.top <= 0 ? 1 : cl((up - 0.56) / 0.36);
      renderScrollDecode(tagEl, cachedHead.tag, qTag);
      renderScrollDecode(h1Span, cachedHead.h1, qH1);
      renderScrollDecode(h2Span, cachedHead.h2, qH2);
      renderScrollDecode(subEl, cachedHead.sub, qSub);
    }

    const steps = r.top <= 0 ? (P * 8.0) : (isRisingOrPinned ? 0 : -1);
    const act = isRisingOrPinned ? Math.max(0, Math.min(6, Math.floor(steps))) : -1;

    if (act !== cur) {
      W.forEach((o, i) => {
        const shown = i <= act;
        o.on = shown;
        o.el.style.opacity = shown ? '1' : '0';
        o.el.classList.toggle('act', i === act);
        o.el.classList.toggle('seen', i < act);
      });
      Array.from(dots.children).forEach((d, i) => {
        d.classList.toggle('on', i <= act);
      });
      cur = act;
    }

    // Scroll-synchronized decode for each of the 7 staircase steps & questions
    W.forEach((o, i) => {
      if (i > act || act < 0) {
        renderScrollDecode(o.t, '', 0);
        renderScrollDecode(o.q, '', 0);
      } else if (i < act) {
        renderScrollDecode(o.t, o.word, 1);
        renderScrollDecode(o.q, '', 0);
      } else {
        let qWord = 1;
        let qQues = 1;
        if (i === 0) {
          qWord = r.top <= 0 ? 1 : cl((up - 0.55) / 0.40);
          qQues = r.top <= 0 ? cl(steps / 0.48) : 0;
        } else {
          const local = cl(steps - i);
          qWord = cl(local / 0.32);
          qQues = cl((local - 0.16) / 0.42);
        }
        renderScrollDecode(o.t, o.word, qWord);
        renderScrollDecode(o.q, o.ques, qQues);
      }
    });

    // Staircase line growth
    const sl = stairLen;
    const grow = Math.max(0, Math.min(1, (steps + 0.2) / 7));
    stair.style.strokeDasharray = sl * grow + ' ' + sl;

    // Loop drawing after last step
    const lp = Math.max(0, Math.min(1, (steps - 6.6) / 1.1));
    loop.style.strokeDashoffset = loopLen * (1 - lp);

    if (lp > 0 && lp < 1) {
      const pt = safePoint(loop, loopLen * lp);
      if (pt) {
        tip.setAttribute('cx', pt.x);
        tip.setAttribute('cy', pt.y);
        tip.style.opacity = '1';
      } else {
        tip.style.opacity = '0';
      }
    } else {
      tip.style.opacity = '0';
    }

    // Ending text opacity + scroll-synchronized decode
    const endProg = Math.max(0, Math.min(1, (steps - 6.85) / 0.65));
    endEl.style.setProperty('--e', Math.max(0, Math.min(1, (steps - 7) / 0.6)).toFixed(3));
    renderRichScrollDecode(endEl, endProg);
  }

  layout();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }

  window.addEventListener('bulevar:langchange', () => {
    cachedHead = getHeadTexts();
    if (tagEl) tagEl._sdKey = '';
    if (h1Span) h1Span._sdKey = '';
    if (h2Span) h2Span._sdKey = '';
    if (subEl) subEl._sdKey = '';
    if (endEl) {
      delete endEl._sdOrigHtml;
      delete endEl._sdRich;
    }
    const fresh = getSteps();
    fresh.forEach((s, i) => {
      if (W[i]) {
        W[i].word = s[0];
        W[i].ques = s[1];
        if (W[i].t) W[i].t._sdKey = '';
        if (W[i].q) W[i].q._sdKey = '';
      }
    });
    startLoop();
  });

  startLoop();
}
