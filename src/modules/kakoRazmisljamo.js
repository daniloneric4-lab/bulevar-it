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
    const r = wrap.getBoundingClientRect();
    const mob = r.width < 860;
    const padL = parseFloat(getComputedStyle(wrap).paddingLeft) || 20;
    const w = r.width - padL * 2;
    const h = r.height || window.innerHeight;

    pos = [];
    W.forEach((o, i) => {
      let x, y;
      if (mob) {
        x = padL + i * (w * 0.055);
        y = h * 0.22 + i * (h * 0.088);
      } else {
        x = padL + i * (w * 0.115);
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

  window.addEventListener('resize', layout, { passive: true });

  // Decode text engine
  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
  const L = [];
  W.forEach((o) => {
    L.push({ el: o.t, ms: 55, t: '', h: '', st: 0 });
    L.push({ el: o.q, ms: 30, t: '', h: '', st: 0 });
  });

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function say(j, t, d) {
    L[j].t = t;
    L[j].st = performance.now() + d;
  }

  function text(now) {
    L.forEach((l) => {
      if (!l.t) {
        if (l.h !== '') {
          l.el.innerHTML = '';
          l.h = '';
        }
        return;
      }
      const n = l.t.length;
      const k = reduce ? 1 : Math.min(1, Math.max(0, (now - l.st) / (n * l.ms)));
      const d = Math.floor(k * n);
      const nz = (k <= 0 || k >= 1) ? 0 : Math.min(4, n - d);
      let z = '';
      for (let j = 0; j < nz; j++) {
        const ch = l.t[d + j];
        z += ch === ' ' ? ' ' : GL[(Math.random() * GL.length) | 0];
      }
      const h = esc(l.t.slice(0, d)) + '<span class="noise">' + esc(z) + '</span><span class="rest">' + esc(l.t.slice(d + nz)) + '</span>';
      if (h !== l.h) {
        l.el.innerHTML = h;
        l.h = h;
      }
    });
  }

  let cur = -2;

  function frame(now) {
    const r = track.getBoundingClientRect();
    const tot = track.offsetHeight - window.innerHeight;

    // Pause rendering when far offscreen
    if (r.bottom < -100 || r.top > window.innerHeight + 100) {
      requestAnimationFrame(frame);
      return;
    }

    // Section 08 rises over Section 07 in the final window.innerHeight (100vh) of this track.
    const riseDist = window.innerHeight;
    const totAnim = Math.max(1, tot - riseDist);
    let P = Math.max(0, Math.min(1, -r.top / totAnim));

    // Sheet rise entrance: 0 while section top is below viewport, 1 when it reaches top of screen
    const up = Math.max(0, Math.min(1, 1 - r.top / window.innerHeight));
    track.style.setProperty('--in', reduce ? '1' : Math.max(0, Math.min(1, (up - 0.55) / 0.4)).toFixed(3));

    const steps = P * 8.2 - 0.2;
    const act = Math.max(-1, Math.min(6, Math.floor(steps)));

    if (act !== cur) {
      W.forEach((o, i) => {
        const shown = i <= act;
        if (shown && !o.on) {
          o.on = true;
          say(i * 2, o.word, 0);
        }
        if (!shown && o.on) {
          o.on = false;
          L[i * 2].t = '';
          L[i * 2 + 1].t = '';
        }
        o.el.style.opacity = shown ? '1' : '0';
        o.el.classList.toggle('act', i === act);
        o.el.classList.toggle('seen', i < act);
      });

      if (act >= 0) {
        say(act * 2 + 1, W[act].ques, act === cur + 1 ? W[act].word.length * 55 * 0.6 : 0);
      }
      W.forEach((o, i) => {
        if (i !== act && i <= act) L[i * 2 + 1].t = '';
      });

      Array.from(dots.children).forEach((d, i) => {
        d.classList.toggle('on', i <= act);
      });
      cur = act;
    }

    // Staircase line growth
    const sl = safeLen(stair);
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

    // Ending text opacity
    endEl.style.setProperty('--e', Math.max(0, Math.min(1, (steps - 7) / 0.6)).toFixed(3));

    text(now);
    requestAnimationFrame(frame);
  }

  layout();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }

  window.addEventListener('bulevar:langchange', () => {
    const fresh = getSteps();
    fresh.forEach((s, i) => {
      if (W[i]) {
        W[i].word = s[0];
        W[i].ques = s[1];
        if (W[i].on) {
          say(i * 2, s[0], 0);
          say(i * 2 + 1, s[1], 10);
        }
      }
    });
  });

  requestAnimationFrame(frame);
}
