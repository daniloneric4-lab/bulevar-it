import * as THREE from 'three';
import { initLandingPage } from './landingHelper.js';
import { createLandingLaptop } from './landingLaptop.js';
import { getLang } from './i18n.js';

export function initLpStaAko() {
  initLandingPage({
    defaultAnchor: 'sistem-iza-ekrana',
    defaultCilj: 'sistem',
    defaultIzvor: 'lp3'
  });

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const F7_SR = [
    { t: 'prima rezervacije dok spavate', m: 'REZERVACIJE 24/7' },
    { t: 'sam kvalifikuje upite', m: 'KVALIFIKACIJA UPITA' },
    { t: 'preporuči klijentu uslugu', m: 'PREPORUKA USLUGE' },
    { t: 'sam šalje ponudu', m: 'AUTOMATSKA PONUDA' },
    { t: 'prati ponašanje posetilaca', m: 'ANALITIKA' },
    { t: 'poveže marketing i CRM', m: 'CRM + MARKETING' },
    { t: 'postane aplikacija u telefonu klijenta', m: 'APLIKACIJA' }
  ];
  const F7_EN = [
    { t: 'accepts bookings while you sleep', m: '24/7 BOOKINGS' },
    { t: 'qualifies leads automatically', m: 'LEAD QUALIFICATION' },
    { t: 'recommends right service to clients', m: 'SERVICE RECOMMENDATION' },
    { t: 'sends quotes and proposals automatically', m: 'AUTOMATED PROPOSALS' },
    { t: 'tracks visitor behavior & analytics', m: 'ANALYTICS' },
    { t: 'connects marketing and CRM', m: 'CRM + MARKETING' },
    { t: 'becomes an app on client’s phone', m: 'APPLICATION' }
  ];
  function getF7() {
    return getLang() === 'en' ? F7_EN : F7_SR;
  }

  const on = [true, true, false, false, false, false, false];
  const tOn = [0, 0, 0, 0, 0, 0, 0].map((v, i) => on[i] ? performance.now() : -9);
  const tOff = [0, 0, 0, 0, 0, 0, 0].map(() => -9);

  let kick = -9;

  function dela(n) {
    if (n === 1) return 'deo';
    if (n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14)) return 'dela';
    return 'delova';
  }

  const listEl = document.getElementById('list');
  const sumTEl = document.getElementById('sumT');
  const meterEl = document.getElementById('meter');
  const lvlEl = document.getElementById('lvl');
  const sumBtnEl = document.getElementById('sumBtn');
  const modalMsgInput = document.getElementById('inp-msg');

  function upd() {
    const isEn = getLang() === 'en';
    const n = on.filter(Boolean).length;
    if (sumTEl) {
      if (isEn) {
        sumTEl.textContent = n ? `YOUR SYSTEM · ${n} MODULE${n > 1 ? 'S' : ''}` : 'CURRENTLY: BUSINESS CARD';
      } else {
        sumTEl.textContent = n ? `VAŠ SISTEM · ${n} ${dela(n).toUpperCase()}` : 'ZA SADA: VIZITKARTA';
      }
    }
    if (meterEl) {
      meterEl.style.width = (n / 7 * 100) + '%';
    }
    if (lvlEl) {
      if (isEn) {
        lvlEl.textContent = n === 0 ? 'BUSINESS CARD' : n < 3 ? 'ACTIVE WEBSITE' : n < 6 ? 'SELLING WEBSITE' : 'COMPLETE SYSTEM';
      } else {
        lvlEl.textContent = n === 0 ? 'VIZITKARTA' : n < 3 ? 'SAJT KOJI RADI' : n < 6 ? 'SAJT KOJI PRODAJE' : 'POTPUN SISTEM';
      }
    }
    if (sumBtnEl) {
      const btnSpan = sumBtnEl.querySelector('span') || sumBtnEl;
      if (isEn) {
        if (n === 0) btnSpan.textContent = 'Book free consultation →';
        else if (n === 1) btnSpan.textContent = 'Let’s discuss this module →';
        else btnSpan.textContent = `Let’s discuss these ${n} modules →`;
      } else {
        if (n === 0) btnSpan.textContent = 'Zakažite besplatne konsultacije →';
        else if (n === 1) btnSpan.textContent = 'Razgovarajmo o ovom delu →';
        else if (n < 5) btnSpan.textContent = `Razgovarajmo o ova ${n} dela →`;
        else btnSpan.textContent = `Razgovarajmo o ovih ${n} delova →`;
      }
    }
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = '';
    const f7 = getF7();
    f7.forEach((f, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ck' + (on[i] ? ' on' : '');
      b.innerHTML = `
        <span>${f.t}</span>
        <span class="bx">
          <svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg>
        </span>
      `;
      b.onclick = () => {
        on[i] = !on[i];
        b.classList.toggle('on', on[i]);
        if (on[i]) {
          tOn[i] = performance.now();
        } else {
          tOff[i] = performance.now();
        }
        kick = performance.now();
        upd();
      };
      listEl.appendChild(b);
    });
  }

  renderList();
  upd();

  window.addEventListener('bulevar:langchange', () => {
    renderList();
    upd();
  });

  // Handle CTA button click to prefill Questionnaire modal
  if (sumBtnEl) {
    sumBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = document.getElementById('lp-modal');
      const isEn = getLang() === 'en';
      const selectedMods = getF7().filter((f, i) => on[i]).map(f => f.m);

      if (modalMsgInput) {
        if (selectedMods.length) {
          modalMsgInput.value = isEn
            ? `I am interested in a system with the following modules:\n- ${selectedMods.join('\n- ')}`
            : `Zanima me sistem sa sledećim delovima:\n- ${selectedMods.join('\n- ')}`;
        } else {
          modalMsgInput.value = isEn
            ? 'I am interested in developing a modern website and digital system.'
            : 'Zanima me izrada modernog sajta i sistema.';
        }
      }

      if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 2D Canvas Engine (1280x800)
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
    ok: '#7FC8A0'
  };

  const cl = x => Math.max(0, Math.min(1, x));
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
  const Fn = (w, s) => `${w} ${s}px Montserrat, sans-serif`;
  const M = (w, s) => `${w} ${s}px "IBM Plex Mono", monospace`;

  function card(x, y, w, h, r = 16, fill = C.pan, stroke = C.line, lw = 2) {
    rr(x, y, w, h, r);
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = stroke;
    c.lineWidth = lw;
    c.stroke();
  }

  // 7 Module Drawing Functions
  const MOD = [
    // 0: Rezervacije 24/7
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'New booking' : 'Nova rezervacija', x + 20, y + 64, Fn(800, 20), C.ink);
      T(isEn ? 'Sat 14th · 2 nights · paid' : 'Sub 14. · 2 noćenja · plaćeno', x + 20, y + 92, Fn(500, 15), C.mut);
      T('02:14', x + w - 20, y + 64, M(600, 18), C.gold, 'right');
      T(isEn ? '🌙 while you were sleeping' : '🌙 dok ste spavali', x + 20, y + h - 20, M(500, 13), C.mut);
    },
    // 1: Kvalifikacija upita
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      const rows = isEn ? [['Budget', '✓'], ['Timeline', '✓'], ['Location', '✓']] : [['Budžet', '✓'], ['Rok', '✓'], ['Lokacija', '✓']];
      rows.forEach(([a, b], k) => {
        T(a, x + 20, y + 64 + k * 26, Fn(600, 15), C.ink);
        T(b, x + w - 24, y + 64 + k * 26, Fn(800, 16), C.ok, 'right');
      });
      T(isEn ? 'QUALIFIED LEAD → YOU' : 'OZBILJAN UPIT → VAMA', x + 20, y + h - 18, M(600, 12), C.gold);
    },
    // 2: Preporuka usluge
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      T(isEn ? 'Recommended for you' : 'Za vas preporučujemo', x + 20, y + 62, Fn(500, 15), C.mut);
      T(isEn ? 'Premium Package' : 'Paket Premium', x + 20, y + 94, Fn(900, 24), C.ink);
      rr(x + 20, y + h - 48, 130, 30, 15);
      c.fillStyle = C.gold;
      c.fill();
      T(isEn ? 'Select →' : 'Izaberi →', x + 85, y + h - 28, Fn(800, 14), '#0B1020', 'center');
    },
    // 3: Automatska ponuda
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      card(x + 20, y + 48, 70, 86, 8, '#E9E4D8', '#E9E4D8');
      T('PDF', x + 55, y + 100, Fn(900, 18), '#0B1020', 'center');
      T(isEn ? 'Proposal #284' : 'Ponuda #284', x + 108, y + 76, Fn(800, 18), C.ink);
      T(isEn ? 'sent in 40 s' : 'poslata za 40 s', x + 108, y + 102, Fn(500, 15), C.mut);
      T('✓', x + w - 26, y + 80, Fn(900, 26), C.ok, 'right');
    },
    // 4: Analitika
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      const P = [8, 12, 10, 17, 15, 22, 27];
      c.strokeStyle = C.gold;
      c.lineWidth = 3;
      c.beginPath();
      P.forEach((v, k) => {
        const px = x + 20 + k * (w - 40) / 6;
        const py = y + h - 26 - v * 3.2 * (reduce ? 1 : Math.min(1, s * 1.6));
        k ? c.lineTo(px, py) : c.moveTo(px, py);
      });
      c.stroke();
      T(isEn ? 'Visits → Inquiries' : 'Posete → upiti', x + 20, y + 62, Fn(700, 15), C.ink);
    },
    // 5: CRM + Marketing
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      const cx = x + w / 2, cy = y + h / 2 + 12;
      const items = isEn ? [['CRM', -90, -22], ['Email', 90, -22], ['Ads', 0, 48]] : [['CRM', -90, -22], ['Email', 90, -22], ['Oglasi', 0, 48]];
      items.forEach(([n, dx, dy], k) => {
        c.strokeStyle = 'rgba(217,178,95,.6)';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + dx, cy + dy);
        c.stroke();
        const u = reduce ? 0.5 : ((s * 0.7) + k * 0.33) % 1;
        c.fillStyle = C.gold;
        c.beginPath();
        c.arc(cx + dx * u, cy + dy * u, 4, 0, 7);
        c.fill();
        card(cx + dx - 38, cy + dy - 15, 76, 30, 15, C.pan2);
        T(n, cx + dx, cy + dy + 6, Fn(700, 13), C.ink, 'center');
      });
      c.fillStyle = C.gold;
      c.beginPath();
      c.arc(cx, cy, 16, 0, 7);
      c.fill();
    },
    // 6: Aplikacija
    (x, y, w, h, s) => {
      const isEn = getLang() === 'en';
      card(x + 24, y + 44, 58, h - 60, 12, '#0A0F1F', C.mut, 2);
      rr(x + 32, y + 56, 42, 42, 10);
      c.fillStyle = C.gold;
      c.fill();
      T('B', x + 53, y + 85, Fn(900, 22), '#0B1020', 'center');
      T(isEn ? 'On the home screen' : 'Na početnom ekranu', x + 100, y + 76, Fn(800, 17), C.ink);
      T(isEn ? 'of clients, like an app' : 'klijenta, kao aplikacija', x + 100, y + 100, Fn(500, 15), C.mut);
    }
  ];

  const order = [0, 1, 2, 3, 4, 5, 6];
  const lay = MOD.map(() => ({ x: 0, y: 0, w: 0, h: 0, a: 0 }));
  let vk = { x: 40, y: 150, w: 1200, h: 600 };

  function screen(now) {
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
    T('vas-sajt.rs', 640, 34, M(500, 14), C.mut, 'center');

    const n = on.filter(Boolean).length;
    if (isEn) {
      T(n ? `YOUR SYSTEM · ${n} MODULE${n > 1 ? 'S' : ''}` : 'DIGITAL BUSINESS CARD', W - 40, 104, M(600, 15), n ? C.gold : C.mut, 'right');
      T('Your website', 40, 106, Fn(900, 30), C.ink);
    } else {
      T(n ? `VAŠ SISTEM · ${n} ${dela(n).toUpperCase()}` : 'DIGITALNA VIZITKARTA', W - 40, 104, M(600, 15), n ? C.gold : C.mut, 'right');
      T('Vaš sajt', 40, 106, Fn(900, 30), C.ink);
    }

    // Business card narrows smoothly as modules appear
    const act = order.filter(i => on[i]);
    const tv = n ? { x: 40, y: 140, w: 400, h: 620 } : { x: 40, y: 140, w: 1200, h: 620 };
    for (const k of ['x', 'y', 'w', 'h']) {
      vk[k] = reduce ? tv[k] : lerp(vk[k], tv[k], 0.12);
    }

    card(vk.x, vk.y, vk.w, vk.h, 20, C.pan);
    const sScale = Math.min(1, vk.w / 1200);
    const cx = vk.x + 30;
    c.fillStyle = 'rgba(243,238,227,.12)';
    rr(cx, vk.y + 30, Math.max(20, vk.w - 60), vk.h * 0.36, 14);
    c.fill();
    T(isEn ? 'Welcome' : 'Dobrodošli', cx, vk.y + vk.h * 0.36 + 90, Fn(900, lerp(28, 52, sScale)), C.ink);
    T(isEn ? 'Phone · Address · Hours' : 'Telefon · Adresa · Radno vreme', cx, vk.y + vk.h * 0.36 + 130, Fn(500, lerp(15, 22, sScale)), C.mut);
    c.fillStyle = 'rgba(243,238,227,.14)';
    [0, 1, 2].forEach(k => {
      c.fillRect(cx, vk.y + vk.h * 0.36 + 170 + k * 26, Math.max(10, (vk.w - 60) * (0.9 - k * 0.2)), 10);
    });

    if (!n) {
      T(isEn ? '…and that is all it does.' : '…i to je sve što radi.', W / 2, vk.y + vk.h - 40, M(500, 18), C.mut, 'center');
    }

    // Grid layout for active modules
    const cols = 2;
    const gx = 470;
    const gw = (W - 40 - gx - 20) / 2;
    const rows = Math.max(1, Math.ceil(act.length / cols));
    const gh = Math.min(170, (620 - (rows - 1) * 16) / rows);

    const f7 = getF7();
    MOD.forEach((fn, i) => {
      const L = lay[i];
      const idx = act.indexOf(i);

      if (idx >= 0) {
        const tx = gx + (idx % cols) * (gw + 20);
        const ty = 140 + Math.floor(idx / cols) * (gh + 16);
        if (L.a < 0.01) {
          L.x = tx;
          L.y = ty + 40;
          L.w = gw;
          L.h = gh;
        }
        L.x = reduce ? tx : lerp(L.x, tx, 0.14);
        L.y = reduce ? ty : lerp(L.y, ty, 0.14);
        L.w = reduce ? gw : lerp(L.w, gw, 0.14);
        L.h = reduce ? gh : lerp(L.h, gh, 0.14);
        L.a = reduce ? 1 : Math.min(1, L.a + 0.06);
      } else {
        L.a = reduce ? 0 : Math.max(0, L.a - 0.09);
      }

      if (L.a <= 0) return;

      const pop = reduce ? 1 : eb(cl((now - tOn[i]) / 450));
      const scScale = on[i] ? (0.7 + 0.3 * pop) : (0.85 + 0.15 * L.a);

      c.save();
      c.globalAlpha = reduce ? 1 : eo(L.a);
      c.translate(L.x + L.w / 2, L.y + L.h / 2);
      c.scale(scScale, scScale);
      c.translate(-L.w / 2, -L.h / 2);

      const glow = reduce ? 0 : cl(1 - (now - tOn[i]) / 1200);
      if (glow > 0) {
        c.shadowColor = 'rgba(217,178,95,.9)';
        c.shadowBlur = 40 * glow;
      }
      card(0, 0, L.w, L.h, 16, '#1B2340', `rgba(217,178,95,${0.45 + 0.5 * glow})`, 2 + 2 * glow);
      c.shadowBlur = 0;

      T(f7[i].m, 20, 32, M(600, 13), C.gold);

      c.save();
      c.beginPath();
      c.rect(0, 0, L.w, L.h);
      c.clip();
      MOD[i](0, 0, L.w, L.h, (now - tOn[i]) / 1000);
      c.restore();

      c.restore();
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 3D Laptop Setup & Bump Reaction
  // ═══════════════════════════════════════════════════════════
  const host = document.getElementById('gl');
  if (!host) return;

  const laptopCtrl = createLandingLaptop({
    host,
    canvas: sc,
    initialLidAngle: -1.894,
    cameraZ: 8.0,
    cameraY: 1.3,
    lookAtY: 0.5,
    fov: 28
  });

  let visible = false;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
    }, { threshold: 0.02 });
    obs.observe(host);
  } else {
    visible = true;
  }

  function frame(now) {
    if (visible) {
      screen(now);
      laptopCtrl.texture.needsUpdate = true;

      const sec = host.closest('.app') || host;
      const r = sec.getBoundingClientRect();
      const enter = Math.max(0, Math.min(1, (window.innerHeight - r.top) / (window.innerHeight * 0.75)));
      const open = reduce ? 1 : Math.max(0, Math.min(1, (enter - 0.2) / 0.7));
      const hingeAngle = -1.894 * (1 - open) - 0.22 * open;
      laptopCtrl.setLidAngle(hingeAngle);

      const b = (now - kick) / 1000;
      const bump = (!reduce && b < 0.6) ? Math.sin(b / 0.6 * Math.PI) * 0.05 : 0;
      const isMob = window.innerWidth <= 900;
      const lap = laptopCtrl.laptop;
      lap.position.x = isMob ? 0 : 0.22;
      if (!reduce) {
        lap.rotation.y = -0.2 * open + Math.sin(now / 3200) * 0.04 * open;
        lap.rotation.x = 0.05;
        lap.position.y = (isMob ? -0.28 : -0.20) + Math.sin(now / 1600) * 0.025 + bump * 0.45;
        lap.scale.setScalar(1 + bump * 0.3);
      } else {
        lap.rotation.y = -0.2;
        lap.rotation.x = 0.05;
        lap.position.y = isMob ? -0.28 : -0.20;
        lap.scale.setScalar(1);
      }

      const cam = laptopCtrl.camera;
      const vf = cam.fov * Math.PI / 180;
      const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
      const fitW = isMob ? 5.2 : 5.0;
      const fitH = isMob ? 4.2 : 4.1;
      const z = Math.max(fitW / 2 / Math.tan(hf / 2), fitH / 2 / Math.tan(vf / 2));
      cam.position.set(0, 1.15, z);
      cam.lookAt(isMob ? 0 : 0.22, 0.52, 0);

      laptopCtrl.renderer.render(laptopCtrl.scene, cam);
    }
    requestAnimationFrame(frame);
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(frame));
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLpStaAko);
  } else {
    initLpStaAko();
  }
}
