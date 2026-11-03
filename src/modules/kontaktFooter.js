/**
 * kontaktFooter.js — Handles Contact Section interactivity and Footer SVG Logo Scroll Animation
 * Implemented 1:1 according to kontakt-final.html
 */

import { t, getLang } from './i18n.js';

export function initKontaktFooter() {
  initContactForm();
  initFooterLogoAnimation();
}

/**
 * ═══════════════════════════════════════════════════
 * 1) KONTAKT SEKCIJA & FORMA
 * ═══════════════════════════════════════════════════
 */
function initContactForm() {
  const form = document.getElementById('kfForm');
  const card = document.getElementById('kfCard');
  if (!form || !card) return;

  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';

  function decodeEl(el, dur = 1400) {
    const txt = el.dataset.t || el.textContent;
    const n = txt.length;
    el.innerHTML = '';
    const sp = [...txt].map((c) => {
      const s = document.createElement('span');
      s.textContent = c;
      s.dataset.c = c;
      el.appendChild(s);
      return s;
    });
    const t0 = performance.now();
    (function f(t) {
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

  // Entrance observer for fade-up / airdrop
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        if (e.target.classList.contains('kf-head')) {
          e.target.querySelectorAll('.dec').forEach((el, i) => {
            setTimeout(() => decodeEl(el, 1400 + i * 300), 300 + i * 350);
          });
        }
      });
    },
    { threshold: 0.02, rootMargin: '120px 0px' }
  );

  const targets = ['.kf-head', '.kf-wrap', '.kf-dir'];
  targets.forEach((sel, i) => {
    const el = document.querySelector(sel);
    if (el) {
      el.style.transitionDelay = i * 0.15 + 's';
      io.observe(el);
      // Fallback timer: ensure contact section is never permanently blank on mobile
      setTimeout(() => {
        if (!el.classList.contains('in')) {
          el.classList.add('in');
        }
      }, 3500);
    }
  });

  window.addEventListener('bulevar:langchange', () => {
    const head = document.querySelector('.kf-head');
    if (head) {
      head.querySelectorAll('.dec').forEach((el, i) => {
        const key = el.getAttribute('data-i18n');
        const text = key ? t(key) : (el.dataset.t || el.textContent);
        el.dataset.t = text;
        decodeEl(el, 800 + i * 200);
      });
    }
  });

  // Segment pill pickers
  function pick(container, btn) {
    container.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === btn));
    container.classList.add('picked');
  }

  const seg = document.getElementById('seg');
  const kanal = document.getElementById('kanal');
  const pDa = document.getElementById('pDa');
  const pNe = document.getElementById('pNe');
  let ideja = null;

  if (seg) {
    seg.querySelectorAll('button').forEach((btn) => {
      btn.onclick = () => {
        ideja = btn.dataset.v;
        pick(seg, btn);
        if (pDa) pDa.classList.toggle('open', ideja === 'da');
        if (pNe) pNe.classList.toggle('open', ideja === 'ne');
        if (ideja === 'da') {
          setTimeout(() => {
            const txt = document.getElementById('f-ideja');
            if (txt) txt.focus({ preventScroll: true });
          }, 350);
        }
      };
    });
  }

  if (kanal) {
    kanal.querySelectorAll('button').forEach((btn) => {
      btn.onclick = () => pick(kanal, btn);
    });
  }

  // Multi-select for problem chips
  const mukeChips = document.querySelectorAll('#muke .pill');
  mukeChips.forEach((chip) => {
    chip.onclick = () => chip.classList.toggle('on');
  });

  // Validation
  const val = {
    ime: (v) => v.trim().length > 1,
    tel: (v) => v.replace(/\D/g, '').length >= 8,
    mail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  };

  const rows = [...form.querySelectorAll('.row[data-req]')];
  rows.forEach((r) => {
    const input = r.querySelector('input');
    if (input) {
      input.addEventListener('input', () => r.classList.remove('bad'));
    }
  });

  // Hidden load-time field (anti-spam: server odbija slanje brže od 3 s od učitavanja)
  const loadedField = form.querySelector('input[name="ucitano"]');
  if (loadedField) loadedField.value = String(Date.now());

  const msgEl = document.getElementById('kfMsg');
  const sendBtn = form.querySelector('.send');
  const sendLabel = sendBtn ? sendBtn.querySelector('span.t') : null;
  const sendArrow = sendBtn ? sendBtn.querySelector('svg.t') : null;

  function setSending(on) {
    if (!sendBtn) return;
    sendBtn.disabled = on;
    sendBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    if (sendLabel) sendLabel.textContent = on ? t('kon.sending', 'Šaljem…') : t('kon.submit', 'Pošaljite upit');
    if (sendArrow) sendArrow.style.display = on ? 'none' : '';
  }

  function showError(on) {
    if (!msgEl) return;
    msgEl.textContent = on ? t('kon.error') : '';
    msgEl.hidden = !on;
  }

  window.addEventListener('bulevar:langchange', () => {
    if (msgEl && !msgEl.hidden) msgEl.textContent = t('kon.error');
    if (sendBtn && sendBtn.disabled && sendLabel) sendLabel.textContent = t('kon.sending', 'Šaljem…');
  });

  // Clears all fields and pill selections (used after successful send and by "Pošaljite još jednu")
  function resetFormState() {
    form.reset(); // hidden "ucitano" keeps its value (value attribute), honeypot is emptied
    ideja = null;
    if (seg) {
      seg.classList.remove('picked');
      seg.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
    }
    if (pDa) pDa.classList.remove('open');
    if (pNe) pNe.classList.remove('open');
    document.querySelectorAll('#muke .pill').forEach((c) => c.classList.remove('on'));
    if (kanal) {
      const firstKanal = kanal.querySelector('button');
      if (firstKanal) pick(kanal, firstKanal);
    }
    rows.forEach((r) => r.classList.remove('bad'));
  }

  let sending = false;

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;

    let ok = true;
    rows.forEach((r) => {
      const field = r.dataset.req;
      const input = r.querySelector('input');
      const isValid = input ? val[field](input.value) : false;
      r.classList.remove('bad');
      void r.offsetWidth; // trigger reflow for shake
      if (!isValid) {
        r.classList.add('bad');
        ok = false;
      }
    });
    if (!ok) return;

    const chosenContact = kanal?.querySelector('button.on')?.dataset?.k || 'poziv';
    const chosenProblems = [...document.querySelectorAll('#muke .pill.on')].map((c) => c.textContent.trim());

    // Extract UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'izvor', 'cilj'].forEach((param) => {
      const v = urlParams.get(param);
      if (v) utmData[param] = v;
    });

    const data = {
      ime: form.ime.value.trim(),
      telefon: form.telefon.value.trim() ? '+381 ' + form.telefon.value.trim() : '',
      email: form.email.value.trim(),
      imaIdeju: ideja === 'da' ? 'Ima ideju' : (ideja === 'ne' ? 'Još nema ideju' : ''),
      ideja: ideja === 'da' && form.ideja ? form.ideja.value.trim() : '',
      problemi: ideja === 'ne' ? chosenProblems : [],
      kontakt: chosenContact,
      stranica: window.location.pathname,
      jezik: getLang() === 'en' ? 'en' : 'sr',
      utm: utmData,
      website: form.website ? form.website.value : '',
      ucitano: Number(loadedField?.value) || 0,
      poslato: Date.now(),
    };

    sending = true;
    showError(false);
    setSending(true);

    let success = false;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      success = res.ok && !!json && json.ok === true;
    } catch (err) {
      success = false;
    }

    sending = false;
    setSending(false);

    if (!success) {
      // Polja ostaju popunjena
      showError(true);
      return;
    }

    const doneP = document.getElementById('doneP');
    if (doneP) doneP.textContent = t('kon.doneP');

    resetFormState();
    card.classList.add('sent');
    const doneH = document.getElementById('doneH');
    if (doneH) decodeEl(doneH, 800);

    // Google Ads Conversion trigger
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { send_to: 'AW-XXXX/XXXX' });
    }
  });

  // Reset button
  const againBtn = document.getElementById('again');
  if (againBtn) {
    againBtn.onclick = () => {
      resetFormState();
      showError(false);
      card.classList.remove('sent');
    };
  }
}

/**
 * ═══════════════════════════════════════════════════
 * 2) FOOTER LOGO SCROLL ANIMATION
 * ═══════════════════════════════════════════════════
 */
function initFooterLogoAnimation() {
  const ft = document.getElementById('ft');
  const logo = document.getElementById('logo');
  const glow = document.getElementById('glow');
  const meta = document.getElementById('meta');
  const blds = document.getElementById('blds');
  const dustG = document.getElementById('dust');
  const arc = document.getElementById('arcRev');
  const arr = document.getElementById('arrRev');
  const headG = document.getElementById('headG');
  const sub = document.getElementById('sub');

  if (!ft || !logo || !blds || !dustG || !arc || !arr || !headG || !sub) return;

  const NS = 'http://www.w3.org/2000/svg';
  const GROUND = 731;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const eOut = (t) => 1 - Math.pow(1 - t, 3);
  const eInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const backOut = (t, s = 1.25) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  /* ---- zgrade: mere preuzete 1:1 iz logoa ---- */
  const B = [
    { x: 642.7, x2: 778.6, top: 462, cols: [667, 704, 741], rows: [496, 538, 579, 620, 662] },
    { x: 830.2, x2: 965.1, top: 334, cols: [852.5, 889, 926.5], rows: [372, 414, 454, 496, 538, 578, 620, 661] },
    { x: 1005.2, x2: 1154.7, top: 206, cols: [1035, 1072, 1109], rows: [245, 286, 328, 369, 409, 451, 492, 534, 576, 617, 658] },
    { x: 1191.7, x2: 1326.6, top: 292, cols: [1216.5, 1254, 1291.5], rows: [329, 371, 412, 454, 495, 537, 578, 620, 660] },
  ];
  const WIN_FINAL = [58, 52, 44], WIN_OFF = [26, 32, 51], WIN_LIT = [255, 243, 200];

  blds.innerHTML = '';
  dustG.innerHTML = '';

  B.forEach((b, i) => {
    b.a = 0.06 + i * 0.06;
    b.b = b.a + 0.18;
    b.w = b.x2 - b.x;
    b.h = GROUND - b.top;
    const g = el('g', {}, blds);
    b.g = g;
    b.body = el(
      'rect',
      {
        x: b.x,
        y: b.top,
        width: b.w,
        height: b.h + 4,
        fill: 'url(#gB)',
        'fill-opacity': 0,
        stroke: '#5B6687',
        'stroke-width': 2,
      },
      g
    );
    b.win = [];
    b.rows.forEach((r) =>
      b.cols.forEach((c) => {
        const w = el('rect', { x: c - 9.7, y: r, width: 19.4, height: 23, fill: rgb(WIN_OFF) }, g);
        b.win.push({ n: w, t: rnd() * 0.8 });
      })
    );
    b.dust = [];
    for (let j = 0; j < 14; j++) {
      b.dust.push({
        n: el('circle', { r: 2.5 + rnd() * 3.5, fill: '#B8925A', opacity: 0 }, dustG),
        x: b.x + rnd() * b.w,
        dir: rnd() < 0.5 ? -1 : 1,
        spd: 30 + rnd() * 110,
        up: 14 + rnd() * 70,
        d: rnd() * 0.45,
      });
    }
  });

  let arcLen = 1350;
  try {
    arcLen = arc.getTotalLength() || 1350;
  } catch (err) {
    arcLen = 1350;
  }
  arc.style.strokeDasharray = arcLen;

  let aLen = 1100;
  try {
    aLen = arr.getTotalLength() || 1100;
  } catch (err) {
    aLen = 1100;
  }
  arr.style.strokeDasharray = aLen;

  /* ---- slova: prava slova iz logoa (vektorizovana), decode ide preko njih ---- */
  const L = [...document.querySelectorAll('#letters path')];
  const glyphs = document.getElementById('glyphs');
  if (glyphs) glyphs.innerHTML = '';

  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
  const G = L.map((p, idx) => {
    let bb = { x: 360 + idx * 115, width: 90 };
    try {
      const b = p.getBBox();
      if (b && b.width > 0) bb = b;
    } catch (err) {
      // In mobile Safari or prior to complete layout, getBBox() can throw
    }
    return el(
      'text',
      {
        class: 'glyph',
        x: bb.x + bb.width / 2,
        y: 1003,
        'text-anchor': 'middle',
        'font-size': 200,
        opacity: 0,
      },
      glyphs
    );
  });

  let S = [];
  function buildSub() {
    sub.innerHTML = '';
    const text = t('footer.tagline') || 'DIGITALNI SISTEM KOJI OSTAJE U VAŠIM RUKAMA';
    S = [...text].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.dataset.c = s.textContent;
      sub.appendChild(s);
      return s;
    });
  }
  buildSub();
  window.addEventListener('bulevar:langchange', () => {
    buildSub();
    decodeSub(cur, true);
  });

  let lastGl = 0;

  function decodeLogo(prog, refresh) {
    const n = L.length;
    const k = prog >= 1 ? n : Math.floor(prog * (n + 4)) - 4;
    L.forEach((p, i) => {
      const on = i < k;
      p.style.opacity = on ? 1 : 0;
      const g = G[i];
      const isG = !on && i < k + 4 && prog > 0;
      if (g) {
        g.setAttribute('opacity', isG ? 1 : 0);
        if (isG && refresh) g.textContent = GL[Math.floor(Math.random() * GL.length)];
      }
    });
  }

  function decodeSub(prog, refresh) {
    const n = S.length;
    const k = prog >= 1 ? n : Math.floor(prog * (n + 5)) - 5;
    S.forEach((s, i) => {
      if (i < k) {
        if (s.className !== 'f') {
          s.className = 'f';
          s.textContent = s.dataset.c;
        }
      } else if (i < k + 5 && prog > 0) {
        s.className = 'r';
        if (refresh) s.textContent = s.dataset.c === ' ' ? ' ' : GL[Math.floor(Math.random() * GL.length)];
      } else if (s.className !== 'h') {
        s.className = 'h';
        s.textContent = s.dataset.c;
      }
    });
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0;

  function target() {
    if (reduce) return 1;
    const r = ft.getBoundingClientRect();
    const span = ft.offsetHeight - window.innerHeight;
    if (span <= 0) return 1;

    // Kad god je korisnik na dnu ili pri dnu stranice, garantujemo potpuno (100%) učitavanje footera
    const scrollY = window.lenis ? window.lenis.scroll : (window.scrollY || document.documentElement.scrollTop || 0);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (maxScroll > 0 && scrollY >= maxScroll - 35) {
      return 1;
    }

    return clamp((-r.top + window.innerHeight * 0.20) / span);
  }

  function render(p, t) {
    arc.style.strokeDashoffset = arcLen * (1 - eInOut(seg(p, 0.02, 0.15)));

    const col = eInOut(seg(p, 0.25, 0.55));
    B.forEach((b) => {
      const lt = seg(p, b.a, b.b);
      const e = backOut(lt, 1.1);
      b.g.setAttribute('transform', `translate(0 ${((1 - e) * (b.h + 60)).toFixed(2)})`);
      b.body.setAttribute('fill-opacity', col.toFixed(3));
      b.body.setAttribute('stroke-opacity', (1 - col).toFixed(3));
      const wp = seg(p, 0.30, 0.65);
      b.win.forEach((w) => {
        const u = clamp((wp - w.t) / 0.2);
        const base = mix(WIN_OFF, WIN_FINAL, col);
        const lit = u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
        w.n.setAttribute('fill', rgb(mix(base, WIN_LIT, lit * 0.9)));
      });
      b.dust.forEach((d) => {
        const u = clamp((lt - d.d) / 0.55);
        if (u <= 0 || u >= 1) {
          d.n.setAttribute('opacity', 0);
          return;
        }
        d.n.setAttribute('cx', (d.x + d.dir * d.spd * eOut(u)).toFixed(1));
        d.n.setAttribute('cy', (GROUND - d.up * Math.sin(u * Math.PI * 0.85)).toFixed(1));
        d.n.setAttribute('opacity', ((1 - u) * 0.85).toFixed(2));
      });
    });

    arr.style.strokeDashoffset = aLen * (1 - eInOut(seg(p, 0.42, 0.62)));
    const hs = seg(p, 0.60, 0.67);
    headG.style.opacity = hs > 0 ? 1 : 0;
    headG.style.transform = `scale(${hs > 0 ? backOut(hs, 2.4) : 0})`;

    const g = eOut(seg(p, 0, 0.75));
    logo.style.transform = `translateY(${(1 - g) * 5}vh) scale(${(0.66 + 0.34 * g).toFixed(4)})`;
    if (glow) glow.style.opacity = (col * (1 - seg(p, 0.72, 0.92))).toFixed(3);

    const refresh = t - lastGl > 55;
    if (refresh) lastGl = t;
    decodeLogo(seg(p, 0.56, 0.76), refresh);
    decodeSub(seg(p, 0.70, 0.84), refresh);

    const m = eOut(seg(p, 0.78, 0.88));
    if (meta) {
      meta.style.opacity = m;
      meta.style.transform = `translateY(${(1 - m) * 16}px)`;
    }
  }

  function loop(t) {
    const tg = target();
    cur += (tg - cur) * 0.11;
    if (Math.abs(tg - cur) < 0.0005) cur = tg;
    render(cur, t);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
