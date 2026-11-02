/**
 * sistemIzaEkrana.js — Unified 3D Laptop Stage for Section 08 & Section 09
 * 
 * Features:
 * - Single persistent 3D model laptop (/models/laptop.glb) loaded once and shared seamlessly
 * - Double-resolution screen canvas (2048 x 1286) with sharp crisp typography and visuals
 * - 08 · Sistem iza ekrana:
 *   1. Laptop opens from closed lid on scroll
 *   2. Screen powers on: line -> Bulevar.IT -> Kuća pod Fruškom at night
 *   3. 5 system layers peel off screen into a 3D exploded view along screen axis with 35° turn and 4 gold rails
 *   4. Active layer pulls forward, rises, and turns straight to user while others dim to 40%
 *   5. Layers return into screen in reverse order, laptop straightens, site is shown again
 *   6. Left text decodes with noise effect; active layer in list turns gold
 * - Transition into Section 09:
 *   - Laptop stays on screen above sheet (z-index: 20)
 *   - Section 09 sheet slides up like a list (#0B1020, 32px/22px rounded corners, #2A3658 border, soft shadow)
 *   - Section 08 text moves up & fades out; Section 09 content floats in when sheet is halfway up
 *   - Laptop straightens and camera moves closer for larger, clearer reading
 * - 09 · Zašto imate sajt?:
 *   - 6 roles cycling on scroll and chip clicks
 *   - Browser header (3 dots + URL address bar) with smooth slide transition (~0.5s) and gold progress bar
 *   - Active role card decodes name, description, and "Ima smisla"
 *   - Gold CTA button pre-fills contact message and smoothly navigates to #contact
 * - Performance: off-screen pause, prefers-reduced-motion support, zero mobile overlap
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getLang, t } from './i18n.js';

export function initSistemIzaEkrana() {
  const masterStage = document.getElementById('laptop-master-stage');
  const stickyViewport = document.getElementById('laptop-sticky-viewport');
  const cv = document.getElementById('s-gl');
  const sisTrack = document.getElementById('s-track');
  const sisTxt = document.getElementById('s-txt');
  const sisLy = document.getElementById('s-ly');

  const ulogaTrack = document.getElementById('uloga-track');
  const ulogaSheet = document.getElementById('uloga-sheet');
  const ulogaIn = document.getElementById('uloga-in');
  const ulogaChips = document.querySelectorAll('.uloga-chip');
  const ulogaCta = document.getElementById('uloga-cta');

  if (!masterStage || !cv || !sisTrack) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sm(a, b, x) {
    x = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return x * x * (3 - 2 * x);
  }
  function cl(x) {
    return Math.max(0, Math.min(1, x));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function seg(t, a, b) {
    return cl((t - a) / (b - a));
  }
  function eo(x) {
    return 1 - Math.pow(1 - x, 3);
  }
  function eio(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  function $(id) {
    return document.getElementById(id);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 08 Data: 5 System Layers (Bilingual)
  // ═══════════════════════════════════════════════════════════
  function getLay() {
    const isEn = getLang() === 'en';
    return isEn ? [
      ['EXPERIENCE', 'Screen, message, and flow the user sees.', 'This is the part everyone sees: the website, copy, and button. It must be clear, but it’s just the beginning.'],
      ['CONVERSION', 'Inquiry, booking, or purchase.', 'Where a visitor turns into business. Without a smooth-running flow, a pretty site is just a window display.'],
      ['DATA', 'Where they came from and what they did.', 'You know which channel brings clients, where drop-offs happen, and what deserves budget scaling.'],
      ['AUTOMATION', 'Notifications, reminders, AI assistant.', 'Confirmation, reminder, and instructions trigger automatically. AI assistant replies even when you sleep.'],
      ['RETENTION', 'Repeat visits, referrals, loyalty.', 'Clients return directly to you and bring peers. This is where your digital system pays for itself.']
    ] : [
      ['ISKUSTVO', 'Ekran, poruka i tok koji korisnik vidi.', 'Ovo je deo koji svi vide: sajt, poruka, dugme. Mora da bude jasan, ali je tek početak.'],
      ['KONVERZIJA', 'Upit, rezervacija ili kupovina.', 'Mesto gde poseta postaje posao. Bez forme koja radi, lep sajt je samo izlog.'],
      ['PODACI', 'Odakle je došao i šta je uradio.', 'Znate koji kanal dovodi goste, gde odustaju i šta vredi pojačati.'],
      ['AUTOMATIZACIJA', 'Obaveštenja, podsetnici, AI asistent.', 'Potvrda, podsetnik i uputstvo idu sami. AI asistent odgovara i kad vi spavate.'],
      ['ZADRŽAVANJE', 'Povratak, preporuka, lojalnost.', 'Gost se vraća direktno kod vas i dovodi prijatelje. Ovde sistem počinje da vraća uloženo.']
    ];
  }

  function updateSisLy() {
    if (!sisLy) return;
    sisLy.innerHTML = '';
    const lay = getLay();
    lay.forEach((l, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<b>0' + (i + 1) + ' ' + l[0] + '</b><span>' + l[1] + '</span>';
      sisLy.appendChild(li);
    });
  }

  updateSisLy();

  // ═══════════════════════════════════════════════════════════
  // Section 09 Data: 6 Roles of Website (Bilingual)
  // ═══════════════════════════════════════════════════════════
  function getRoles() {
    const isEn = getLang() === 'en';
    return isEn ? [
      ['Business card', 'People see who you are and how to find you.', 'When clients already search you by name and only need address and contact.'],
      ['Direct sales', 'The website sells even when you are off.', 'When you offer products or gift vouchers purchaseable online.'],
      ['Lead generation', 'Every inquiry arrives with full details in one place.', 'When work is bespoke and begins with a conversation.'],
      ['Bookings', 'Customers select dates themselves; you receive confirmation.', 'When selling time: appointments, overnight stays, tables.'],
      ['Automation', 'Confirmations, reminders, and replies run autonomously.', 'When repetitive tasks happen multiple times daily.'],
      ['Full ecosystem', 'Website, sales, inquiries, and data connected in one system.', 'When business expands and manual handling is no longer viable.']
    ] : [
      ['Vizit karta', 'Ljudi vide ko ste i kako da vas nađu.', 'Kad vas ljudi već traže po imenu i treba im samo adresa i broj.'],
      ['Prodaja', 'Sajt prodaje i kad vi ne radite.', 'Kad imate proizvod ili vaučer koji može da se kupi online.'],
      ['Upiti', 'Svaki upit stiže sa svim podacima, na jedno mesto.', 'Kad je posao po meri i počinje razgovorom.'],
      ['Zakazivanje', 'Kupac sam bira termin, vi dobijate potvrdu.', 'Kad prodajete vreme: termine, noćenja, stolove.'],
      ['Automatizacija', 'Potvrde, podsetnici i odgovori idu sami.', 'Kad se isti posao ponavlja više puta dnevno.'],
      ['Sve povezano', 'Sajt, prodaja, upiti i podaci u jednom sistemu.', 'Kad biznis raste i ručno više ne stiže.']
    ];
  }

  // ═══════════════════════════════════════════════════════════
  // Three.js Scene, Camera & Lighting Setup
  // ═══════════════════════════════════════════════════════════
  const renderer = new THREE.WebGLRenderer({
    canvas: cv,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
  const canvasScale = isMobile ? 1 : 2;
  renderer.setPixelRatio(isMobile ? Math.min(1.5, window.devicePixelRatio || 1) : Math.min(2.5, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 60);

  scene.add(new THREE.AmbientLight(0x8090c0, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(2, 4, 4);
  scene.add(key);

  const rim = new THREE.PointLight(0xD9B25F, 1.3, 9);
  rim.position.set(-2.4, 1.6, -1.8);
  scene.add(rim);

  const rim2 = new THREE.PointLight(0xE8963A, 0.7, 7);
  rim2.position.set(2.4, 0.4, 1.4);
  scene.add(rim2);

  const world = new THREE.Group();
  scene.add(world);

  const lap = new THREE.Group();
  world.add(lap);

  // ═══════════════════════════════════════════════════════════
  // 2D Canvas Engine (Crisp 2x on desktop, memory-optimized 1x on mobile)
  // ═══════════════════════════════════════════════════════════
  const CW = 1024;
  const CH = 546; // Matches exact aspect ratio of 3D laptop screen quad (34.352 / 18.328 = 1.874)
  const SWp = 1.637;
  const SHp = SWp * (CH / CW);

  function mkCanvas() {
    const c = document.createElement('canvas');
    c.width = CW * canvasScale;
    c.height = CH * canvasScale;
    return c;
  }

  function ctx2(c) {
    const x = c.getContext('2d');
    x.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
    return x;
  }

  function rr(x, X, Y, w, h, r) {
    x.beginPath();
    x.moveTo(X + r, Y);
    x.arcTo(X + w, Y, X + w, Y + h, r);
    x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r);
    x.arcTo(X, Y, X + w, Y, r);
    x.closePath();
  }

  const MF = 'Montserrat, sans-serif';
  const MO = '"IBM Plex Mono", monospace';

  function label(x, i) {
    const lay = getLay();
    x.font = '600 22px ' + MO;
    x.fillStyle = '#D9B25F';
    x.fillText('0' + (i + 1) + ' · ' + (lay[i] ? lay[i][0] : ''), 36, 52);
  }

  function glass(x) {
    x.clearRect(0, 0, CW, CH);
    rr(x, 4, 4, CW - 8, CH - 8, 26);
    x.fillStyle = 'rgba(15, 22, 40, .94)';
    x.fill();
    x.strokeStyle = 'rgba(217, 178, 95, .9)';
    x.lineWidth = 4;
    x.stroke();
  }

  // ═══════════════════════════════════════════════════════════
  // Section 08 Layer Card Drawings (01..05)
  // ═══════════════════════════════════════════════════════════
  const DRAW = [
    // 01 ISKUSTVO: The website itself (Kuća pod Fruškom at night)
    function (x) {
      const g = x.createLinearGradient(0, 0, 0, CH * 0.62);
      g.addColorStop(0, '#0B1020');
      g.addColorStop(0.7, '#1c2246');
      g.addColorStop(1, '#3a2a4a');
      x.fillStyle = g;
      x.fillRect(0, 0, CW, CH);

      let sd = 7;
      function rnd() {
        sd = (sd * 9301 + 49297) % 233280;
        return sd / 233280;
      }

      for (let i = 0; i < 70; i++) {
        x.fillStyle = 'rgba(243, 238, 227, ' + (0.35 + rnd() * 0.6) + ')';
        x.beginPath();
        x.arc(rnd() * CW, 90 + rnd() * CH * 0.38, rnd() * 1.6 + 0.5, 0, 6.283);
        x.fill();
      }

      x.fillStyle = '#f3ecd0';
      x.beginPath();
      x.arc(820, 150, 30, 0, 6.283);
      x.fill();
      x.fillStyle = '#1c2246';
      x.beginPath();
      x.arc(808, 142, 27, 0, 6.283);
      x.fill();

      x.fillStyle = '#1c2440';
      x.beginPath();
      x.moveTo(0, CH * 0.6);
      x.bezierCurveTo(300, CH * 0.47, 600, CH * 0.55, CW, CH * 0.49);
      x.lineTo(CW, CH);
      x.lineTo(0, CH);
      x.fill();

      x.fillStyle = '#141b30';
      x.beginPath();
      x.moveTo(0, CH * 0.72);
      x.bezierCurveTo(260, CH * 0.62, 560, CH * 0.68, CW, CH * 0.63);
      x.lineTo(CW, CH);
      x.lineTo(0, CH);
      x.fill();

      x.strokeStyle = '#0f1528';
      x.lineWidth = 5;
      for (let v = 0; v < 12; v++) {
        x.beginPath();
        x.moveTo(120 + v * 70, CH * 0.7);
        x.lineTo(40 + v * 96, CH);
        x.stroke();
      }

      const hx = 640, hy = CH * 0.6;
      x.fillStyle = '#2a3150';
      x.fillRect(hx, hy, 96, 58);
      x.fillStyle = '#1b2038';
      x.beginPath();
      x.moveTo(hx - 12, hy + 2);
      x.lineTo(hx + 48, hy - 36);
      x.lineTo(hx + 108, hy + 2);
      x.fill();

      x.fillStyle = '#ffd27a';
      x.shadowColor = '#ffd27a';
      x.shadowBlur = 18;
      x.fillRect(hx + 14, hy + 16, 18, 18);
      x.fillRect(hx + 62, hy + 16, 18, 18);
      x.shadowBlur = 0;

      const isEn = getLang() === 'en';
      x.fillStyle = 'rgba(11, 16, 32, .55)';
      x.fillRect(0, 0, CW, 74);
      x.fillStyle = '#F3EEE3';
      x.font = '900 30px ' + MF;
      x.fillText(isEn ? 'House under Fruška' : 'Kuća pod Fruškom', 36, 48);

      x.font = '600 20px ' + MF;
      x.fillStyle = '#A7AEC2';
      (isEn ? ['House', 'Area', 'Pricing'] : ['Kuća', 'Okolina', 'Cene']).forEach((t, k) => {
        x.fillText(t, CW - 370 + k * 100, 46);
      });

      x.fillStyle = '#F3EEE3';
      x.font = '900 58px ' + MF;
      x.fillText(isEn ? 'A weekend that' : 'Vikend koji', 48, 190);
      x.fillText(isEn ? 'starts in the vineyard.' : 'počinje u vinogradu.', 48, 254);

      rr(x, 48, 292, 300, 64, 32);
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
      x.font = '800 24px ' + MF;
      x.fillText(isEn ? 'Book directly' : 'Rezerviši direktno', 76, 333);
    },

    // 02 KONVERZIJA: Booking form
    function (x) {
      const isEn = getLang() === 'en';
      glass(x);
      label(x, 1);
      x.fillStyle = '#F3EEE3';
      x.font = '800 36px ' + MF;
      x.fillText(isEn ? 'Reservation in 40 seconds' : 'Rezervacija za 40 sekundi', 36, 116);

      const flds = isEn ? [['Friday Jun 13 – Sun Jun 15', '2 guests'], ['Villa Fruška', 'entire house']] : [['Petak 13. – nedelja 15. jun', '2 osobe'], ['Vila Fruška', 'cela kuća']];
      flds.forEach((f, k) => {
        const X = 36 + k * 476;
        rr(x, X, 142, 452, 102, 18);
        x.fillStyle = '#1b2544';
        x.fill();
        x.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        x.lineWidth = 1.5;
        x.stroke();
        x.fillStyle = '#8f98b5';
        x.font = '600 22px ' + MO;
        x.fillText(f[0].toUpperCase(), X + 20, 178);
        x.fillStyle = '#F3EEE3';
        x.font = '700 28px ' + MF;
        x.fillText(f[1], X + 20, 222);
      });

      x.fillStyle = '#A7AEC2';
      x.font = '600 24px ' + MF;
      x.fillText(isEn ? '2 nights × 90 €' : '2 noći × 90 €', 36, 298);
      x.textAlign = 'right';
      x.fillStyle = '#F3EEE3';
      x.font = '800 34px ' + MF;
      x.fillText('180 €', CW - 36, 300);
      x.textAlign = 'left';

      x.fillStyle = '#A7AEC2';
      x.font = '600 20px ' + MF;
      x.fillText(isEn ? 'Card payment · instant confirmation · 0% booking fee' : 'Plaćanje karticom · potvrda odmah · bez provizije platforme', 36, 344);

      rr(x, 36, 376, CW - 72, 88, 44);
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
      x.font = '800 30px ' + MF;
      x.textAlign = 'center';
      x.fillText(isEn ? 'Confirm reservation' : 'Potvrdi rezervaciju', CW / 2, 430);
      x.textAlign = 'left';
    },

    // 03 PODACI: Analytics & Source channels
    function (x) {
      const isEn = getLang() === 'en';
      glass(x);
      label(x, 2);
      x.fillStyle = '#F3EEE3';
      x.font = '800 34px ' + MF;
      x.fillText(isEn ? 'Where guests come from this month' : 'Odakle dolaze gosti ovog meseca', 36, 114);

      const rows = isEn ? [['Google Ads', 46], ['Instagram', 31], ['Direct / referral', 23]] : [['Google oglas', 46], ['Instagram', 31], ['Direktno / preporuka', 23]];
      rows.forEach((r, k) => {
        const Y = 152 + k * 74;
        x.fillStyle = '#F3EEE3';
        x.font = '700 24px ' + MF;
        x.fillText(r[0], 36, Y + 28);
        rr(x, 320, Y + 4, 330, 32, 10);
        x.fillStyle = '#1b2544';
        x.fill();
        rr(x, 320, Y + 4, 330 * r[1] / 50, 32, 10);
        x.fillStyle = k === 0 ? '#E8963A' : '#D9B25F';
        x.fill();
        x.fillStyle = '#F3EEE3';
        x.font = '800 24px ' + MO;
        x.fillText(r[1] + '%', 670, Y + 28);
      });

      rr(x, 750, 144, 238, 256, 20);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(217, 178, 95, 0.35)';
      x.lineWidth = 1.5;
      x.stroke();
      x.fillStyle = '#A7AEC2';
      x.font = '600 20px ' + MF;
      x.fillText(isEn ? 'Bookings, June' : 'Rezervacije, jun', 772, 186);
      x.fillStyle = '#F3EEE3';
      x.font = '900 96px ' + MF;
      x.fillText('23', 772, 292);
      x.fillStyle = '#7fd18b';
      x.font = '700 22px ' + MO;
      x.fillText(isEn ? '+6 compared' : '+6 u odnosu', 772, 334);
      x.fillText(isEn ? 'to May' : 'na maj', 772, 362);
    },

    // 04 AUTOMATIZACIJA: Notifications & AI Assistant
    function (x) {
      const isEn = getLang() === 'en';
      glass(x);
      label(x, 3);
      const N = isEn ? [
        ['✓ Booking confirmation sent to guest', 'instant'],
        ['✓ Pre-arrival reminder and guide', 'day before'],
        ['✓ SMS with smart lock passcode', 'on arrival day']
      ] : [
        ['✓ Potvrda rezervacije poslata gostu', 'odmah'],
        ['✓ Podsetnik i uputstvo pred dolazak', 'dan ranije'],
        ['✓ SMS sa šifrom za pametnu bravu', 'na dan']
      ];
      N.forEach(([txt, time], k) => {
        const Y = 84 + k * 56;
        rr(x, 36, Y, CW - 72, 48, 14);
        x.fillStyle = '#1b2544';
        x.fill();
        x.fillStyle = '#7fd18b';
        x.font = '700 22px ' + MF;
        x.fillText(txt, 54, Y + 33);
        x.fillStyle = '#A7AEC2';
        x.font = '600 18px ' + MO;
        x.textAlign = 'right';
        x.fillText(time, CW - 54, Y + 33);
        x.textAlign = 'left';
      });

      rr(x, 36, 268, CW - 72, 188, 20);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(217, 178, 95, 0.35)';
      x.lineWidth = 1.5;
      x.stroke();
      x.fillStyle = '#D9B25F';
      x.font = '800 22px ' + MO;
      x.fillText(isEn ? 'AI ASSISTANT · 02:14 (replies in 2 seconds)' : 'AI ASISTENT · 02:14 (odgovara za 2 sekunde)', 60, 310);
      rr(x, 60, 332, 570, 52, 26);
      x.fillStyle = '#1b2544';
      x.fill();
      x.fillStyle = '#F3EEE3';
      x.font = '600 22px ' + MF;
      x.fillText(isEn ? 'Can we arrive late, around 11 PM?' : 'Da li može kasni dolazak, oko 23h?', 84, 366);

      rr(x, CW - 580 - 60, 394, 580, 52, 26);
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
      x.font = '700 22px ' + MF;
      x.fillText(isEn ? 'Sure! We have a smart lock, passcode sent via SMS.' : 'Može. Imamo pametnu bravu, šifra stiže SMS-om.', CW - 580 - 42, 428);
    },

    // 05 ZADRŽAVANJE: Loyalty & 11 months follow-up
    function (x) {
      const isEn = getLang() === 'en';
      glass(x);
      label(x, 4);
      x.fillStyle = '#A7AEC2';
      x.font = '600 20px ' + MO;
      x.fillText(isEn ? '11 MONTHS AFTER STAY' : '11 MESECI POSLE BORAVKA', 36, 102);
      rr(x, 36, 120, CW - 72, 154, 20);
      x.fillStyle = '#1b2544';
      x.fill();
      x.fillStyle = '#F3EEE3';
      x.font = '600 26px ' + MF;
      x.fillText(isEn ? 'Ana, it has been almost a year since your weekend stay.' : 'Ana, prošlo je skoro godinu dana od vašeg vikenda.', 62, 168);
      x.fillText(isEn ? 'The terrace is open Jun 13–15. For returning guests: −10%.' : 'Terasa je slobodna 13–15. juna. Za povratak: −10%.', 62, 210);
      x.fillStyle = '#D9B25F';
      x.font = '800 26px ' + MF;
      x.fillText(isEn ? 'Book again →' : 'Rezerviši ponovo →', 62, 252);

      const stats = isEn ? [['Returning guests', '38%'], ['Referrals', '14 this year'], ['Rating', '4.9']] : [['Povratni gosti', '38%'], ['Preporuke', '14 ove god.'], ['Ocena', '4,9']];
      stats.forEach((s, k) => {
        const X = 36 + k * 318;
        rr(x, X, 298, 298, 154, 18);
        x.fillStyle = '#121a30';
        x.fill();
        x.fillStyle = '#A7AEC2';
        x.font = '600 20px ' + MF;
        x.fillText(s[0], X + 20, 342);
        x.fillStyle = '#F3EEE3';
        x.font = '900 46px ' + MF;
        x.fillText(s[1], X + 20, 408);
      });
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // Section 09 Role Screen Drawings (RS 0..5)
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // Section 09 Role Screen Drawings (RS 0..5) — Height: 506px
  // ═══════════════════════════════════════════════════════════
  const topBarH = 40;
  const roleBodyH = CH - topBarH; // 506px

  function roleNav(x, title) {
    const isEn = getLang() === 'en';
    x.fillStyle = '#0e1628';
    x.fillRect(0, 0, CW, 50);
    x.fillStyle = '#F3EEE3';
    x.font = '800 21px ' + MF;
    x.fillText(isEn ? 'House under Fruška' : 'Kuća pod Fruškom', 36, 33);
    x.font = '600 14px ' + MO;
    x.fillStyle = '#D9B25F';
    x.textAlign = 'right';
    x.fillText(title, CW - 36, 32);
    x.textAlign = 'left';
    x.fillStyle = 'rgba(255, 255, 255, 0.08)';
    x.fillRect(0, 49, CW, 1);
  }

  const RS = [
    // 0: Vizit karta
    function (x) {
      const isEn = getLang() === 'en';
      x.fillStyle = '#0b1120';
      x.fillRect(0, 0, CW, roleBodyH);
      roleNav(x, isEn ? '01 · BUSINESS CARD' : '01 · VIZIT KARTA');

      // Left Column: Visual hero card
      const lx = 36, ly = 66, lw = 460, lh = 414;
      rr(x, lx, ly, lw, lh, 20);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      x.lineWidth = 1.5;
      x.stroke();

      // Top banner inside card (night vineyard silhouette)
      x.save();
      rr(x, lx, ly, lw, 180, 20);
      x.clip();
      const bg = x.createLinearGradient(lx, ly, lx, ly + 180);
      bg.addColorStop(0, '#0B1020');
      bg.addColorStop(0.7, '#1d2348');
      bg.addColorStop(1, '#332646');
      x.fillStyle = bg;
      x.fillRect(lx, ly, lw, 180);

      // Moon & stars
      x.fillStyle = '#f5eedb';
      x.beginPath();
      x.arc(lx + lw - 50, ly + 45, 18, 0, 6.283);
      x.fill();
      x.fillStyle = '#1d2348';
      x.beginPath();
      x.arc(lx + lw - 58, ly + 40, 16, 0, 6.283);
      x.fill();

      // Small house
      x.fillStyle = '#ffd27a';
      x.shadowColor = '#ffd27a';
      x.shadowBlur = 10;
      x.fillRect(lx + 80, ly + 110, 14, 14);
      x.shadowBlur = 0;
      x.restore();

      // Villa text in left card
      x.fillStyle = '#D9B25F';
      x.font = '600 13px ' + MO;
      x.fillText(isEn ? 'VILLA & VINEYARD · FRUŠKA GORA' : 'VILA & VINOGRAD · FRUŠKA GORA', lx + 24, ly + 218);
      x.fillStyle = '#F3EEE3';
      x.font = '900 30px ' + MF;
      x.fillText(isEn ? 'House under Fruška' : 'Kuća pod Fruškom', lx + 24, ly + 258);
      x.fillStyle = '#A7AEC2';
      x.font = '500 16px ' + MF;
      x.fillText(isEn ? 'Authentic peace on the slopes of Fruška Gora.' : 'Autentičan mir na obroncima Fruške gore.', lx + 24, ly + 296);
      x.fillText(isEn ? 'Where the weekend lasts longer and slower.' : 'Mesto gde vikend traje duže i sporije.', lx + 24, ly + 322);

      // Right Column: Contact details
      const rx = 528, ry = 66, rw = 460;
      const contacts = isEn ? [
        ['📍', 'LOCATION', 'Iriški venac bb, 21208 Sremski Karlovci'],
        ['📞', 'PHONE', '+381 64 123 45 67 (08:00 – 21:00)'],
        ['✉️', 'EMAIL', 'contact@kucapodfruskom.rs']
      ] : [
        ['📍', 'LOKACIJA', 'Iriški venac bb, 21208 Sremski Karlovci'],
        ['📞', 'TELEFON', '+381 64 123 45 67 (08:00 – 21:00)'],
        ['✉️', 'EMAIL', 'kontakt@kucapodfruskom.rs']
      ];
      contacts.forEach(([icon, lbl, val], i) => {
        const cy = ry + i * 86;
        rr(x, rx, cy, rw, 74, 16);
        x.fillStyle = '#121a30';
        x.fill();
        x.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        x.lineWidth = 1.5;
        x.stroke();

        x.font = '700 20px ' + MF;
        x.fillStyle = '#D9B25F';
        x.fillText(icon, rx + 18, cy + 44);

        x.font = '600 12px ' + MO;
        x.fillStyle = '#8f98b5';
        x.fillText(lbl, rx + 52, cy + 30);

        x.font = '700 17px ' + MF;
        x.fillStyle = '#F3EEE3';
        x.fillText(val, rx + 52, cy + 54);
      });

      // Bottom Note Box in right column
      rr(x, rx, ry + 276, rw, 98, 16);
      x.fillStyle = 'rgba(217, 178, 95, 0.08)';
      x.fill();
      x.strokeStyle = 'rgba(217, 178, 95, 0.35)';
      x.lineWidth = 1.5;
      x.stroke();

      x.font = '700 16px ' + MF;
      x.fillStyle = '#D9B25F';
      x.fillText(isEn ? '✦  And that is all this website does.' : '✦  I to je sve što ovaj sajt radi.', rx + 20, ry + 316);
      x.font = '500 14.5px ' + MF;
      x.fillStyle = '#A7AEC2';
      x.fillText(isEn ? 'No calendar, no booking, no inquiries.' : 'Nema kalendara, nema rezervacije, nema upita.', rx + 20, ry + 346);
    },

    // 1: Prodaja
    function (x) {
      const isEn = getLang() === 'en';
      x.fillStyle = '#0b1120';
      x.fillRect(0, 0, CW, roleBodyH);
      roleNav(x, isEn ? '02 · DIRECT SALES · CART (2)' : '02 · PRODAJA · KORPA (2)');

      const items = isEn ? [
        ['Gift voucher', 'Weekend for two · 2 nights with breakfast', '180 €', true, '#3f2518'],
        ['Artisan wine', 'Fruška Bermet Wine Pack (3 bottles)', '39 €', true, '#371520'],
        ['Honey & jam', 'Linden honey & rose hip (from farm)', '18 €', false, '#3d3014']
      ] : [
        ['Poklon vaučer', 'Vikend za dvoje · 2 noćenja sa doručkom', '180 €', true, '#3f2518'],
        ['Domaće vino', 'Paket Fruškogorski Bermet (3 boce)', '39 €', true, '#371520'],
        ['Med i domaći džem', 'Fruškogorski lipov med i šipak (sa salaša)', '18 €', false, '#3d3014']
      ];

      items.forEach(([title, desc, price, inCart, col], k) => {
        const X = 36 + k * 328, Y = 64, W = 296, H = 416;
        rr(x, X, Y, W, H, 18);
        x.fillStyle = '#121a30';
        x.fill();
        x.strokeStyle = inCart ? 'rgba(63, 154, 92, 0.35)' : 'rgba(255, 255, 255, 0.1)';
        x.lineWidth = 1.5;
        x.stroke();

        // Product thumbnail header
        rr(x, X + 14, Y + 14, W - 28, 150, 12);
        x.fillStyle = col;
        x.fill();

        // Thumbnail tag
        x.fillStyle = inCart ? '#7fd18b' : '#D9B25F';
        x.font = '700 12px ' + MO;
        x.fillText(inCart ? (isEn ? 'POPULAR' : 'POPULARNO') : (isEn ? 'RECOMMENDED' : 'PREPORUKA'), X + 26, Y + 38);

        // Title & description
        x.fillStyle = '#F3EEE3';
        x.font = '800 22px ' + MF;
        x.fillText(title, X + 16, Y + 202);

        x.fillStyle = '#A7AEC2';
        x.font = '500 14px ' + MF;
        const words = desc.split(' · ');
        x.fillText(words[0], X + 16, Y + 234);
        if (words[1]) x.fillText(words[1], X + 16, Y + 256);

        // Price
        x.fillStyle = '#F3EEE3';
        x.font = '900 30px ' + MF;
        x.fillText(price, X + 16, Y + 326);

        // Action button
        rr(x, X + 16, Y + 348, W - 32, 50, 25);
        x.fillStyle = inCart ? '#2d7a46' : '#D9B25F';
        x.fill();
        x.fillStyle = inCart ? '#ffffff' : '#0B1020';
        x.font = '800 17px ' + MF;
        x.textAlign = 'center';
        x.fillText(inCart ? (isEn ? 'In cart ✓' : 'U korpi ✓') : (isEn ? '+ Add to cart' : '+ Dodaj u korpu'), X + W / 2, Y + 379);
        x.textAlign = 'left';
      });
    },

    // 2: Upiti
    function (x) {
      const isEn = getLang() === 'en';
      x.fillStyle = '#0b1120';
      x.fillRect(0, 0, CW, roleBodyH);
      roleNav(x, isEn ? '03 · INQUIRIES' : '03 · UPITI');

      x.fillStyle = '#F3EEE3';
      x.font = '900 30px ' + MF;
      x.fillText(isEn ? 'Inquiry for retreat, celebration or offsite' : 'Upit za grupu, proslavu ili radni vikend', 36, 96);
      x.fillStyle = '#A7AEC2';
      x.font = '500 16px ' + MF;
      x.fillText(isEn ? 'Send details and we check entire villa availability for your dates.' : 'Pošaljite detalje i proveravamo raspoloživost cele vile za vaš termin.', 36, 126);

      const fields = isEn ? [
        ['Full Name', 'Marko Petrović'],
        ['Preferred Date', 'September 12 – 14, 2026'],
        ['Guest Count', '14 adults'],
        ['Event Type', 'Family celebration with garden dinner']
      ] : [
        ['Ime i prezime', 'Marko Petrović'],
        ['Željeni datum', '12. – 14. septembar 2026.'],
        ['Broj gostiju', '14 odraslih osoba'],
        ['Tip događaja', 'Porodični rođendan sa večerom u dvorištu']
      ];

      fields.forEach(([lbl, val], k) => {
        const col = k % 2, row = Math.floor(k / 2);
        const X = 36 + col * 492, Y = 152 + row * 98, W = 460, H = 82;
        rr(x, X, Y, W, H, 16);
        x.fillStyle = '#121a30';
        x.fill();
        x.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        x.lineWidth = 1.5;
        x.stroke();

        x.fillStyle = '#8f98b5';
        x.font = '600 12.5px ' + MO;
        x.fillText(lbl.toUpperCase(), X + 20, Y + 28);

        x.fillStyle = '#F3EEE3';
        x.font = '700 19px ' + MF;
        x.fillText(val, X + 20, Y + 60);
      });

      // Submit button
      rr(x, 36, 368, 260, 56, 28);
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
      x.font = '800 20px ' + MF;
      x.fillText(isEn ? 'Send inquiry →' : 'Pošalji upit →', 84, 403);

      x.fillStyle = '#7fd18b';
      x.font = '600 15px ' + MO;
      x.fillText(isEn ? '✓ Inquiry arrives directly to host’s phone.' : '✓ Upit stiže direktno na telefon domaćina.', 320, 396);
      x.fillStyle = '#A7AEC2';
      x.font = '500 14px ' + MF;
      x.fillText(isEn ? 'Detailed quote arrives within 2 hours.' : 'Odgovor sa tačnom ponudom i predračunom stiže u roku od 2 sata.', 320, 418);
    },

    // 3: Zakazivanje
    function (x) {
      const isEn = getLang() === 'en';
      x.fillStyle = '#0b1120';
      x.fillRect(0, 0, CW, roleBodyH);
      roleNav(x, isEn ? '04 · BOOKINGS' : '04 · ZAKAZIVANJE');

      // Left Column: Calendar Grid
      const cx = 36, cy = 64, cw = 570, ch = 416;
      rr(x, cx, cy, cw, ch, 20);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      x.lineWidth = 1.5;
      x.stroke();

      x.fillStyle = '#F3EEE3';
      x.font = '900 24px ' + MF;
      x.fillText(isEn ? 'June 2026' : 'Jun 2026', cx + 24, cy + 40);

      x.fillStyle = '#D9B25F';
      x.font = '600 13px ' + MO;
      x.textAlign = 'right';
      x.fillText(isEn ? 'SELECT ARRIVAL DATE' : 'IZABERITE DATUM DOLASKA', cx + cw - 24, cy + 38);
      x.textAlign = 'left';

      const daysOfWeek = isEn ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
      daysOfWeek.forEach((d, k) => {
        x.fillStyle = '#8f98b5';
        x.font = '700 14px ' + MO;
        x.textAlign = 'center';
        x.fillText(d, cx + 52 + k * 74, cy + 76);
      });
      x.textAlign = 'left';

      const busy = { 3: 1, 4: 1, 5: 1, 10: 1, 11: 1, 12: 1, 13: 1, 27: 1, 28: 1 };
      const sel = { 20: 1, 21: 1, 22: 1 };

      for (let d = 1; d <= 30; d++) {
        const c = (d - 1) % 7, rw = Math.floor((d - 1) / 7);
        const X = cx + 20 + c * 74, Y = cy + 92 + rw * 60;
        rr(x, X, Y, 64, 48, 12);
        x.fillStyle = sel[d] ? '#D9B25F' : busy[d] ? '#0a0f1d' : '#18223c';
        x.fill();
        if (sel[d]) {
          x.shadowColor = '#D9B25F';
          x.shadowBlur = 10;
        }
        x.fillStyle = sel[d] ? '#0B1020' : busy[d] ? '#404c6a' : '#F3EEE3';
        x.font = '800 19px ' + MF;
        x.textAlign = 'center';
        x.fillText(String(d), X + 32, Y + 30);
        x.shadowBlur = 0;
      }
      x.textAlign = 'left';

      // Right Column: Selection Details & Booking Action
      const rx = 630, ry = 64, rw = 358, rh = 416;
      rr(x, rx, ry, rw, rh, 20);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(217, 178, 95, 0.35)';
      x.lineWidth = 1.5;
      x.stroke();

      x.fillStyle = '#D9B25F';
      x.font = '700 12px ' + MO;
      x.fillText(isEn ? 'SELECTED DATES' : 'IZABRANI TERMIN', rx + 24, ry + 40);

      x.fillStyle = '#F3EEE3';
      x.font = '900 28px ' + MF;
      x.fillText(isEn ? 'Jun 20 – 22, 2026' : '20. – 22. jun 2026.', rx + 24, ry + 82);

      x.fillStyle = '#A7AEC2';
      x.font = '500 16px ' + MF;
      x.fillText(isEn ? '2 nights · 2 adults' : '2 noćenja · 2 odrasle osobe', rx + 24, ry + 116);
      x.fillText(isEn ? 'Villa & Vineyard (entire property)' : 'Vila & Vinograd (ceo objekat)', rx + 24, ry + 142);

      x.fillStyle = 'rgba(255, 255, 255, 0.08)';
      x.fillRect(rx + 24, ry + 168, rw - 48, 1);

      x.fillStyle = '#8f98b5';
      x.font = '600 14px ' + MF;
      x.fillText(isEn ? 'Total booking price:' : 'Ukupna cena noćenja:', rx + 24, ry + 204);

      x.fillStyle = '#D9B25F';
      x.font = '900 38px ' + MF;
      x.fillText('180 €', rx + 24, ry + 252);

      x.fillStyle = '#7fd18b';
      x.font = '600 14px ' + MO;
      x.fillText(isEn ? '0% intermediary fee' : '0% provizije posrednika', rx + 24, ry + 284);

      rr(x, rx + 24, ry + 320, rw - 48, 54, 27);
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
      x.font = '800 18px ' + MF;
      x.textAlign = 'center';
      x.fillText(isEn ? 'Book directly →' : 'Rezerviši odmah →', rx + rw / 2, ry + 354);
      x.textAlign = 'left';
    },

    // 4: Automatizacija
    function (x) {
      const isEn = getLang() === 'en';
      x.fillStyle = '#0b1120';
      x.fillRect(0, 0, CW, roleBodyH);
      roleNav(x, isEn ? '05 · AUTOMATION' : '05 · AUTOMATIZACIJA');

      // Left Column: Workflow sequence
      const lx = 36, ly = 64, lw = 500;
      const steps = isEn ? [
        ['✓', 'Booking confirmation', 'Email to guest & host (instant)', '#3f9a5c'],
        ['⏱', 'Pre-arrival reminder', 'Automatic SMS 3 days before scheduled stay', '#D9B25F'],
        ['🔑', 'Keyless access guide', 'Smart lock code sent 24h prior', '#E8963A'],
        ['★', 'Review invitation', 'Feedback link 1 day after checkout', '#7fd18b']
      ] : [
        ['✓', 'Potvrda rezervacije', 'Slanje mejla gostu i domaćinu (odmah)', '#3f9a5c'],
        ['⏱', 'Podsetnik pred dolazak', 'Automatski SMS 3 dana pre zakazanog vikenda', '#D9B25F'],
        ['🔑', 'Uputstvo za ulazak', 'Šifra pametne brave šalje se 24h pre', '#E8963A'],
        ['★', 'Molba za recenziju', 'Poruka sa linkom za ocenu 1 dan posle odjave', '#7fd18b']
      ];

      steps.forEach(([ico, title, desc, col], k) => {
        const Y = ly + k * 88, H = 76;
        rr(x, lx, Y, lw, H, 16);
        x.fillStyle = '#121a30';
        x.fill();
        x.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        x.lineWidth = 1.5;
        x.stroke();

        x.fillStyle = col;
        x.font = '800 24px ' + MF;
        x.fillText(ico, lx + 20, Y + 48);

        x.fillStyle = '#F3EEE3';
        x.font = '700 19px ' + MF;
        x.fillText(title, lx + 62, Y + 34);

        x.fillStyle = '#8f98b5';
        x.font = '500 14px ' + MO;
        x.fillText(desc, lx + 62, Y + 58);
      });

      // Right Column: AI Assistant Chat
      const rx = 560, ry = 64, rw = 428, rh = 416;
      rr(x, rx, ry, rw, rh, 20);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(217, 178, 95, 0.35)';
      x.lineWidth = 1.5;
      x.stroke();

      x.fillStyle = '#7fd18b';
      x.beginPath();
      x.arc(rx + 28, ry + 36, 6, 0, 6.283);
      x.fill();

      x.fillStyle = '#D9B25F';
      x.font = '700 13px ' + MO;
      x.fillText(isEn ? 'AI ASSISTANT · ACTIVE 24/7 (02:14)' : 'AI ASISTENT · AKTIVAN 24/7 (02:14)', rx + 44, ry + 41);

      // User chat bubble
      rr(x, rx + 20, ry + 72, rw - 40, 72, 16);
      x.fillStyle = '#1b2542';
      x.fill();
      x.fillStyle = '#A7AEC2';
      x.font = '600 12px ' + MO;
      x.fillText(isEn ? 'GUEST · 02:14' : 'GOST · 02:14', rx + 36, ry + 96);
      x.fillStyle = '#F3EEE3';
      x.font = '600 16px ' + MF;
      x.fillText(isEn ? 'Can we arrive late, around 11 PM?' : 'Da li možemo doći kasno, oko 23h?', rx + 36, ry + 124);

      // AI response bubble
      rr(x, rx + 20, ry + 160, rw - 40, 116, 16);
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
      x.font = '800 12px ' + MO;
      x.fillText(isEn ? 'AI ASSISTANT · 02:14 (in 2 seconds)' : 'AI ASISTENT · 02:14 (za 2 sekunde)', rx + 36, ry + 186);
      x.font = '700 16px ' + MF;
      if (isEn) {
        x.fillText('Of course! We have a smart keyless lock', rx + 36, ry + 214);
        x.fillText('with a code. Your access PIN arrives', rx + 36, ry + 238);
        x.fillText('automatically via SMS today.', rx + 36, ry + 262);
      } else {
        x.fillText('Naravno! Imamo pametnu bravu sa', rx + 36, ry + 214);
        x.fillText('šifrom na ulazu. Šifra vam automatski', rx + 36, ry + 238);
        x.fillText('stiže SMS-om danas popodne.', rx + 36, ry + 262);
      }

      // Footer badge
      rr(x, rx + 20, ry + 320, rw - 40, 66, 14);
      x.fillStyle = 'rgba(127, 209, 139, 0.1)';
      x.fill();
      x.strokeStyle = 'rgba(127, 209, 139, 0.3)';
      x.lineWidth = 1;
      x.stroke();
      x.fillStyle = '#7fd18b';
      x.font = '600 14px ' + MO;
      x.fillText(isEn ? '✓ Host sleeps peacefully.' : '✓ Domaćin mirno spava.', rx + 36, ry + 348);
      x.fillStyle = '#A7AEC2';
      x.font = '500 13px ' + MF;
      x.fillText(isEn ? 'Guest received reply and confirmed arrival.' : 'Gost je dobio odgovor i potvrdio dolazak.', rx + 36, ry + 368);
    },

    // 5: Sve povezano
    function (x) {
      const isEn = getLang() === 'en';
      x.fillStyle = '#0b1120';
      x.fillRect(0, 0, CW, roleBodyH);
      roleNav(x, isEn ? '06 · FULL ECOSYSTEM' : '06 · SVE POVEZANO');

      // 4 KPI Cards
      const kpis = isEn ? [
        ['Direct Bookings', '23', '+6 this month', '#7fd18b'],
        ['Website Revenue', '4,140 €', '100% yours (€0 fees)', '#D9B25F'],
        ['Event Inquiries', '9', '3 booked for autumn', '#E8963A'],
        ['Saved on Commission', '621 €', 'kept in your pocket', '#7fd18b']
      ] : [
        ['Direktne rezervacije', '23', '+6 ovog meseca', '#7fd18b'],
        ['Prihod preko sajta', '4.140 €', '100% vama (0 € provizije)', '#D9B25F'],
        ['Upiti za događaje', '9', '3 ugovorena za jesen', '#E8963A'],
        ['Ušteđeno na proviziji', '621 €', 'ostalo u vašem džepu', '#7fd18b']
      ];

      kpis.forEach(([title, val, badge, col], k) => {
        const colIdx = k % 2, rowIdx = Math.floor(k / 2);
        const X = 36 + colIdx * 492, Y = 64 + rowIdx * 108, W = 460, H = 94;
        rr(x, X, Y, W, H, 16);
        x.fillStyle = '#121a30';
        x.fill();
        x.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        x.lineWidth = 1.5;
        x.stroke();

        x.fillStyle = '#8f98b5';
        x.font = '600 13px ' + MO;
        x.fillText(title.toUpperCase(), X + 20, Y + 30);

        x.fillStyle = '#F3EEE3';
        x.font = '900 36px ' + MF;
        x.fillText(val, X + 20, Y + 74);

        x.fillStyle = col;
        x.font = '700 14px ' + MO;
        x.textAlign = 'right';
        x.fillText(badge, X + W - 20, Y + 72);
        x.textAlign = 'left';
      });

      // Bottom Revenue Chart Container
      const gx = 36, gy = 296, gw = 952, gh = 184;
      rr(x, gx, gy, gw, gh, 18);
      x.fillStyle = '#121a30';
      x.fill();
      x.strokeStyle = 'rgba(217, 178, 95, 0.35)';
      x.lineWidth = 1.5;
      x.stroke();

      x.fillStyle = '#D9B25F';
      x.font = '700 13px ' + MO;
      x.fillText(isEn ? 'DIRECT REVENUE GROWTH (ZERO INTERMEDIARY FEES)' : 'RAST DIREKTNIH PRIHODA (BEZ POSREDNIKA)', gx + 24, gy + 32);

      // Chart curve
      const pts = [
        [0, 0.15], [110, 0.22], [220, 0.18], [330, 0.38],
        [440, 0.32], [550, 0.54], [660, 0.62], [770, 0.58], [880, 0.88]
      ];

      // Gradient under chart curve
      x.save();
      x.beginPath();
      x.moveTo(gx + 40, gy + gh - 24);
      pts.forEach(([px, py], i) => {
        const X = gx + 40 + px, Y = gy + gh - 30 - py * 90;
        i === 0 ? x.lineTo(X, Y) : x.lineTo(X, Y);
      });
      x.lineTo(gx + 40 + 880, gy + gh - 24);
      x.closePath();
      const chartGrad = x.createLinearGradient(0, gy + 30, 0, gy + gh - 24);
      chartGrad.addColorStop(0, 'rgba(217, 178, 95, 0.28)');
      chartGrad.addColorStop(1, 'rgba(217, 178, 95, 0.0)');
      x.fillStyle = chartGrad;
      x.fill();
      x.restore();

      // Spline line
      x.strokeStyle = '#D9B25F';
      x.lineWidth = 3.5;
      x.beginPath();
      pts.forEach(([px, py], i) => {
        const X = gx + 40 + px, Y = gy + gh - 30 - py * 90;
        i === 0 ? x.moveTo(X, Y) : x.lineTo(X, Y);
      });
      x.stroke();

      // Dot markers
      pts.forEach(([px, py]) => {
        const X = gx + 40 + px, Y = gy + gh - 30 - py * 90;
        x.fillStyle = '#0B1020';
        x.beginPath();
        x.arc(X, Y, 5, 0, 6.283);
        x.fill();
        x.strokeStyle = '#D9B25F';
        x.lineWidth = 2.5;
        x.stroke();
      });
    }
  ];

  let curRole = -1;
  let roleFrom = -1;
  let roleAt = 0;
  let roleCv = [];
  const SLUG = ['', 'prodavnica', 'upit', 'rezervacija', 'automatizacija', 'pregled'];

  function buildRoles() {
    roleCv = RS.map((fn) => {
      const c = document.createElement('canvas');
      c.width = CW * canvasScale;
      c.height = roleBodyH * canvasScale;
      const x = c.getContext('2d');
      x.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
      fn(x);
      return c;
    });
  }

  function drawRole(x) {
    const e = reduce ? 1 : cl((performance.now() - roleAt) / 520);
    const ee = 1 - Math.pow(1 - e, 3);
    const top = topBarH; // 40
    const H = roleBodyH; // 506

    // 1. Sleek Safari/macOS browser window header
    x.fillStyle = '#0d1424';
    x.fillRect(0, 0, CW, top);

    // macOS traffic lights
    [['#ff5f57', 22], ['#febc2e', 38], ['#28c840', 54]].forEach(([col, cx]) => {
      x.fillStyle = col;
      x.beginPath();
      x.arc(cx, top / 2, 5, 0, 6.283);
      x.fill();
    });

    // Centered URL address pill
    const pillW = 380;
    const pillH = 24;
    const pillX = CW / 2 - pillW / 2;
    const pillY = (top - pillH) / 2;
    rr(x, pillX, pillY, pillW, pillH, 12);
    x.fillStyle = '#080d18';
    x.fill();
    x.strokeStyle = 'rgba(217, 178, 95, 0.28)';
    x.lineWidth = 1;
    x.stroke();

    x.font = '500 13px ' + MO;
    x.fillStyle = '#D9B25F';
    x.textAlign = 'center';
    const slugStr = SLUG[curRole] ? '/' + SLUG[curRole] : '';
    x.fillText('🔒  kucapodfruskom.rs' + slugStr, CW / 2, top / 2 + 4.5);
    x.textAlign = 'left';

    // Thin accent divider line below chrome
    x.fillStyle = 'rgba(255, 255, 255, 0.08)';
    x.fillRect(0, top - 1, CW, 1);

    // Golden loading progress bar during slide
    if (e < 1 && roleFrom >= 0) {
      x.fillStyle = '#D9B25F';
      x.shadowColor = '#D9B25F';
      x.shadowBlur = 8;
      x.fillRect(pillX, top - 2, pillW * ee, 2);
      x.shadowBlur = 0;
    }

    // 2. Viewport Content (slides smoothly with clipping)
    x.save();
    x.beginPath();
    x.rect(0, top, CW, H);
    x.clip();

    if (roleFrom >= 0 && e < 1 && roleCv[roleFrom]) {
      x.globalAlpha = 1 - ee;
      x.drawImage(roleCv[roleFrom], -CW * 0.12 * ee, top, CW, H);
    }
    x.globalAlpha = roleFrom >= 0 ? ee : 1;
    if (roleCv[curRole]) {
      x.drawImage(roleCv[curRole], roleFrom >= 0 ? CW * 0.12 * (1 - ee) : 0, top, CW, H);
    }
    x.globalAlpha = 1;
    x.restore();

    return e < 1;
  }

  // ═══════════════════════════════════════════════════════════
  // Section 08 -> 09 Screen Transition Animation
  // ═══════════════════════════════════════════════════════════
  function drawSectionTransition(x, prog) {
    const t = sm(0.05, 0.95, prog);

    // 1. Base layer: Section 08 website (Kuća pod Fruškom)
    if (cards[0] && cards[0].c) {
      x.drawImage(cards[0].c, 0, 0, CW, CH);
    }

    if (t <= 0.001) return;

    // 2. Browser window header (chrome) smoothly slides down from the top
    const chromeH = topBarH;
    const chromeSlideY = lerp(-chromeH, 0, sm(0, 0.35, t));

    // The reveal scanline travels smoothly from top to bottom
    const scanY = Math.round(t * (CH + 30) - 15);

    // Draw revealed Section 09 browser and Role 0 clipped to scanY
    x.save();
    x.beginPath();
    x.rect(0, 0, CW, Math.max(0, scanY));
    x.clip();

    // Browser Chrome header
    x.fillStyle = '#0d1424';
    x.fillRect(0, chromeSlideY, CW, chromeH);

    // macOS traffic lights
    [['#ff5f57', 22], ['#febc2e', 38], ['#28c840', 54]].forEach(([col, cx]) => {
      x.fillStyle = col;
      x.beginPath();
      x.arc(cx, chromeSlideY + chromeH / 2, 5, 0, 6.283);
      x.fill();
    });

    // Centered URL address pill
    const pillW = 380;
    const pillH = 24;
    const pillX = CW / 2 - pillW / 2;
    const pillY = chromeSlideY + (chromeH - pillH) / 2;
    rr(x, pillX, pillY, pillW, pillH, 12);
    x.fillStyle = '#080d18';
    x.fill();
    x.strokeStyle = 'rgba(217, 178, 95, 0.28)';
    x.lineWidth = 1;
    x.stroke();

    x.font = '500 13px ' + MO;
    x.fillStyle = '#D9B25F';
    x.textAlign = 'center';
    x.fillText('🔒  kucapodfruskom.rs/vizit-karta', CW / 2, chromeSlideY + chromeH / 2 + 4.5);
    x.textAlign = 'left';

    // Thin accent divider line below chrome
    x.fillStyle = 'rgba(255, 255, 255, 0.08)';
    x.fillRect(0, chromeSlideY + chromeH - 1, CW, 1);

    // Role 0 content (Vizit karta)
    if (roleCv[0]) {
      x.drawImage(roleCv[0], 0, chromeH, CW, roleBodyH);
    }
    x.restore();

    // 3. Glowing golden scanline beam sweeping down across the transition boundary
    if (scanY > 0 && scanY < CH + 10) {
      x.save();
      const lg = x.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      lg.addColorStop(0, 'rgba(232, 150, 58, 0)');
      lg.addColorStop(0.5, 'rgba(249, 229, 168, 0.95)');
      lg.addColorStop(1, 'rgba(217, 178, 95, 0)');
      x.fillStyle = lg;
      x.fillRect(0, scanY - 4, CW, 8);

      // Bright golden core line
      x.shadowColor = '#D9B25F';
      x.shadowBlur = 12;
      x.fillStyle = '#FFF8E7';
      x.fillRect(0, scanY - 1, CW, 2);
      x.restore();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Screen Canvas & Texture: power on, layers, role display
  // ═══════════════════════════════════════════════════════════
  const scv = mkCanvas();
  const sx = ctx2(scv);
  const stex = new THREE.CanvasTexture(scv);
  stex.colorSpace = THREE.SRGBColorSpace;
  stex.anisotropy = 4;

  let lastScreenKey = '';
  let roleAnimActive = false;
  let fontsOK = 0;

  function drawScreen(on, show, transProg = 0) {
    const isPoweringOn = (on > 0 && on < 0.98);
    const onKey = isPoweringOn ? Math.round(on * 60) : (on >= 0.98 ? 100 : 0);
    const transKey = transProg > 0.01 && transProg < 0.99 ? Math.round(transProg * 60) : (transProg >= 0.99 ? 100 : 0);
    const k = onKey + '_' + show + '_' + fontsOK + '_' + curRole + '_' + transKey;
    if (k === lastScreenKey && !roleAnimActive) return;
    lastScreenKey = k;

    const x = sx;
    // Pure pitch black base when laptop opens
    x.fillStyle = '#050811';
    x.fillRect(0, 0, CW, CH);

    if (on > 0) {
      // Phase 1: Thin sleek golden loading line across center of screen
      const lineProg = sm(0.04, 0.68, on);
      const screenFade = sm(0.68, 0.95, on);

      if (lineProg > 0 && screenFade < 1) {
        const maxLineW = CW * 0.62;
        const curW = maxLineW * lineProg;
        const lineH = 3;
        const lx = CW / 2 - curW / 2;
        const ly = CH / 2 - lineH / 2;

        x.save();
        const lg = x.createLinearGradient(lx, 0, lx + curW, 0);
        lg.addColorStop(0, '#E8963A');
        lg.addColorStop(0.5, '#F9E5A8');
        lg.addColorStop(1, '#D9B25F');

        x.shadowColor = '#D9B25F';
        x.shadowBlur = 16;
        x.fillStyle = lg;
        rr(x, lx, ly, curW, lineH, 1.5);
        x.fill();
        x.restore();
      }

      // Phase 2: Screen powers on smoothly once golden line completes loading
      if (screenFade > 0) {
        x.save();
        x.globalAlpha = screenFade;
        if (curRole >= 0) {
          roleAnimActive = drawRole(x);
        } else if (transProg > 0.02) {
          roleAnimActive = false;
          drawSectionTransition(x, transProg);
        } else {
          roleAnimActive = false;
          if (show >= 0 && show < 5 && cards[show] && cards[show].c) {
            x.drawImage(cards[show].c, 0, 0, CW, CH);
          } else {
            // Clean website display (Kuća pod Fruškom)
            if (cards[0] && cards[0].c) {
              x.drawImage(cards[0].c, 0, 0, CW, CH);
            }
          }
        }
        x.restore();
      }
    }
    stex.needsUpdate = true;
  }

  // ═══════════════════════════════════════════════════════════
  // Card Deck: 5 double-sided cards
  // ═══════════════════════════════════════════════════════════
  const KW = 1.04;
  const KH = KW * SHp / SWp;

  const backCv = mkCanvas();
  const bx = ctx2(backCv);
  (function (x) {
    x.fillStyle = '#0B1020';
    x.fillRect(0, 0, CW, CH);
    rr(x, 18, 18, CW - 36, CH - 36, 24);
    x.strokeStyle = '#D9B25F';
    x.lineWidth = 6;
    x.stroke();
    rr(x, 40, 40, CW - 80, CH - 80, 16);
    x.strokeStyle = 'rgba(217,178,95,.35)';
    x.lineWidth = 2;
    x.stroke();
    x.strokeStyle = 'rgba(217,178,95,.12)';
    x.lineWidth = 2;
    for (let i = -CH; i < CW; i += 34) {
      x.beginPath();
      x.moveTo(i, CH - 40);
      x.lineTo(i + CH, 40);
      x.stroke();
    }
    x.fillStyle = '#0B1020';
    rr(x, CW / 2 - 210, CH / 2 - 60, 420, 120, 20);
    x.fill();
    x.font = '900 70px ' + MF;
    x.textAlign = 'center';
    x.fillStyle = '#F3EEE3';
    x.fillText('Bulevar', CW / 2 - 62, CH / 2 + 24);
    x.fillStyle = '#D9B25F';
    x.fillText('.IT', CW / 2 + 136, CH / 2 + 24);
    x.textAlign = 'left';
  })(bx);

  const maxAniso = isMobile ? 1 : Math.min(4, renderer.capabilities.getMaxAnisotropy());
  stex.anisotropy = maxAniso;
  stex.generateMipmaps = !isMobile;
  stex.minFilter = isMobile ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
  stex.magFilter = THREE.LinearFilter;

  const backTex = new THREE.CanvasTexture(backCv);
  backTex.colorSpace = THREE.SRGBColorSpace;
  backTex.anisotropy = maxAniso;
  backTex.generateMipmaps = !isMobile;
  backTex.minFilter = isMobile ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
  backTex.magFilter = THREE.LinearFilter;

  const deckG = new THREE.Group();
  world.add(deckG);

  const mobLineMat = new THREE.LineBasicMaterial({ color: 0xD9B25F, transparent: true, opacity: 0 });
  const mobLineGeo = new THREE.BufferGeometry();
  mobLineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
  const mobLines = new THREE.LineSegments(mobLineGeo, mobLineMat);
  mobLines.frustumCulled = false;
  deckG.add(mobLines);

  const cards = [];
  DRAW.forEach((fn) => {
    const c = mkCanvas();
    fn(ctx2(c));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAniso;
    t.generateMipmaps = !isMobile;
    t.minFilter = isMobile ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;

    const g = new THREE.Group();
    const f = new THREE.Mesh(new THREE.PlaneGeometry(KW, KH), new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true }));
    f.position.z = 0.003;
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(KW, KH), new THREE.MeshBasicMaterial({ map: backTex, toneMapped: false, transparent: true }));
    bk.rotation.y = Math.PI;
    bk.position.z = -0.003;

    g.add(f);
    g.add(bk);
    g.visible = false;
    deckG.add(g);
    cards.push({ g, tex: t, fn, c, f, bk });
  });

  function redrawCards() {
    cards.forEach((k) => {
      k.fn(ctx2(k.c));
      k.tex.needsUpdate = true;
    });
    buildRoles();
    fontsOK = 1;
    lastScreenKey = '';
  }

  // ═══════════════════════════════════════════════════════════
  // 3D Model Laptop Loading & Screen Quad Creation
  // ═══════════════════════════════════════════════════════════
  let lidPivotRef = null;
  let screenMeshRef = null;

  const nY = 0.04 * 0.3168;
  const nZ = -0.04 * 0.9485;

  const CORNERS = [
    new THREE.Vector3( 17.176, 22.089 + nY, 6.977 + nZ), // Top-Left (local) -> camera Top-Left
    new THREE.Vector3(-17.176, 22.089 + nY, 6.977 + nZ), // Top-Right (local) -> camera Top-Right
    new THREE.Vector3(-17.176,  3.761 + nY, 0.856 + nZ), // Bottom-Right (local) -> camera Bottom-Right
    new THREE.Vector3( 17.176,  3.761 + nY, 0.856 + nZ)  // Bottom-Left (local) -> camera Bottom-Left
  ];

  const loader = new GLTFLoader();
  loader.load(
    '/models/laptop.glb',
    (gltf) => {
      const model = gltf.scene;

      let origMesh = null;
      model.traverse((child) => {
        if (child.isMesh && (child.name === 'Laptop_Laptop1_0' || !origMesh)) {
          origMesh = child;
        }
      });

      if (!origMesh) {
        console.warn('[sistemIzaEkrana] laptop mesh not found in laptop.glb');
        return;
      }

      if (origMesh.material) {
        origMesh.material.side = THREE.DoubleSide;
        if (origMesh.material.map) {
          origMesh.material.map.colorSpace = THREE.SRGBColorSpace;
          origMesh.material.map.generateMipmaps = true;
          origMesh.material.map.minFilter = THREE.LinearMipmapLinearFilter;
          origMesh.material.map.magFilter = THREE.LinearFilter;
          origMesh.material.map.anisotropy = maxAniso;
        }
      }

      // Split geometry into base and lid at Y = 1.2 in mesh local space
      const origGeo = origMesh.geometry;
      const posAttr = origGeo.attributes.position;
      const indexAttr = origGeo.index;

      const baseIndices = [];
      const lidIndices = [];
      const splitY = 1.2;

      for (let i = 0; i < indexAttr.count; i += 3) {
        const i0 = indexAttr.getX(i);
        const i1 = indexAttr.getX(i + 1);
        const i2 = indexAttr.getX(i + 2);

        const y0 = posAttr.getY(i0);
        const y1 = posAttr.getY(i1);
        const y2 = posAttr.getY(i2);
        const avgY = (y0 + y1 + y2) / 3;

        if (avgY > splitY) {
          lidIndices.push(i0, i1, i2);
        } else {
          baseIndices.push(i0, i1, i2);
        }
      }

      const baseGeo = new THREE.BufferGeometry();
      baseGeo.setAttribute('position', origGeo.attributes.position);
      baseGeo.setAttribute('normal', origGeo.attributes.normal);
      baseGeo.setAttribute('uv', origGeo.attributes.uv);
      if (origGeo.attributes.tangent) baseGeo.setAttribute('tangent', origGeo.attributes.tangent);
      baseGeo.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(baseIndices), 1));

      const lidGeo = new THREE.BufferGeometry();
      lidGeo.setAttribute('position', origGeo.attributes.position);
      lidGeo.setAttribute('normal', origGeo.attributes.normal);
      lidGeo.setAttribute('uv', origGeo.attributes.uv);
      if (origGeo.attributes.tangent) lidGeo.setAttribute('tangent', origGeo.attributes.tangent);
      lidGeo.setIndex(new THREE.Uint32BufferAttribute(new Uint32Array(lidIndices), 1));

      const baseMesh = new THREE.Mesh(baseGeo, origMesh.material);
      baseMesh.name = 'LaptopBase';
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;

      const lidMesh = new THREE.Mesh(lidGeo, origMesh.material);
      lidMesh.name = 'LaptopLid';
      lidMesh.castShadow = true;
      lidMesh.receiveShadow = true;

      const hinge = new THREE.Vector3(0, 1.0, 0);
      const lidPivot = new THREE.Group();
      lidPivot.name = 'LaptopLidPivot';
      lidPivot.position.copy(hinge);

      lidMesh.position.sub(hinge);
      lidPivot.add(lidMesh);

      // Screen Quad directly on bezel
      const screenPositions = new Float32Array([
        -17.176, 22.089 + nY, 6.977 + nZ, // v0: Top-Right
         17.176, 22.089 + nY, 6.977 + nZ, // v1: Top-Left
         17.176,  3.761 + nY, 0.856 + nZ, // v2: Bottom-Left
        -17.176,  3.761 + nY, 0.856 + nZ, // v3: Bottom-Right
      ]);

      const screenUVs = new Float32Array([
        1, 1, // v0
        0, 1, // v1
        0, 0, // v2
        1, 0, // v3
      ]);

      const screenIndices = new Uint16Array([
        0, 3, 1,
        1, 3, 2,
        0, 1, 3,
        1, 2, 3,
      ]);

      const screenGeo = new THREE.BufferGeometry();
      screenGeo.setAttribute('position', new THREE.BufferAttribute(screenPositions, 3));
      screenGeo.setAttribute('uv', new THREE.BufferAttribute(screenUVs, 2));
      screenGeo.setIndex(new THREE.BufferAttribute(screenIndices, 1));
      screenGeo.computeVertexNormals();

      const screenMat = new THREE.MeshBasicMaterial({
        map: stex,
        toneMapped: false,
        side: THREE.DoubleSide
      });

      const screenMesh = new THREE.Mesh(screenGeo, screenMat);
      screenMesh.name = 'LaptopScreen';
      lidPivot.add(screenMesh);

      const parent = origMesh.parent;
      parent.remove(origMesh);
      parent.add(baseMesh);
      parent.add(lidPivot);

      // Center and orient model perfectly matching prototype dimensions
      model.rotation.set(0.28, Math.PI, 0);
      model.scale.set(2.75, 2.75, 2.75);
      model.position.set(0, -0.05, -0.01);

      lap.add(model);
      lidPivotRef = lidPivot;
      screenMeshRef = screenMesh;

      // Initial lid closed pose
      lidPivotRef.rotation.x = -1.894;
    },
    undefined,
    (err) => console.error('[sistemIzaEkrana] Error loading /models/laptop.glb:', err)
  );

  // ═══════════════════════════════════════════════════════════
  // Card Positions, Normal & Rails
  // ═══════════════════════════════════════════════════════════
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const NRM = new THREE.Vector3();
  const UP = new THREE.Vector3();

  function screenPose() {
    if (lidPivotRef && screenMeshRef) {
      vA.set(0, 12.925 + nY, 3.9165 + nZ);
      lidPivotRef.localToWorld(vA);
      world.worldToLocal(vA);

      // Normal points towards camera (+Z) and slightly up (+Y) in world space
      vB.set(0, 12.925 + nY + 0.3168, 3.9165 + nZ - 0.9485);
      lidPivotRef.localToWorld(vB);
      world.worldToLocal(vB);

      NRM.copy(vB).sub(vA).normalize();
      UP.crossVectors(NRM, new THREE.Vector3(1, 0, 0)).normalize();
      return {
        x: vA.x,
        y: vA.y,
        z: vA.z,
        rx: lidPivotRef.rotation.x,
        ry: 0,
        rz: 0,
        s: SWp / KW
      };
    }
    NRM.set(0, 0.05, 0.998).normalize();
    UP.crossVectors(NRM, new THREE.Vector3(1, 0, 0)).normalize();
    return { x: 0, y: 0.69, z: 0.01, rx: 0, ry: 0, rz: 0, s: SWp / KW };
  }

  function backOut(t) {
    const c1 = 1.15, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  function apply(c, p, lift, spin) {
    c.g.position.set(p.x, p.y + lift, p.z);
    c.g.rotation.set(p.rx, p.ry + spin, p.rz);
    c.g.scale.setScalar(p.s);
  }

  function mix(a, b, t) {
    return {
      x: lerp(a.x, b.x, t),
      y: lerp(a.y, b.y, t),
      z: lerp(a.z, b.z, t),
      rx: lerp(a.rx, b.rx, t),
      ry: lerp(a.ry, b.ry, t),
      rz: lerp(a.rz, b.rz, t),
      s: lerp(a.s, b.s, t)
    };
  }

  // 4 thin gold rails connecting screen corners to the front layer
  const rails = [];
  [0, 1, 2, 3].forEach(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, 0.01)]);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xD9B25F, transparent: true, opacity: 0 }));
    l.frustumCulled = false;
    deckG.add(l);
    rails.push(l);
  });

  // ═══════════════════════════════════════════════════════════
  // Responsiveness & Framing
  // ═══════════════════════════════════════════════════════════
  let narrow = false;
  function layout() {
    const r = masterStage.getBoundingClientRect();
    const w = r.width || window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    narrow = w < 900;
    cam.updateProjectionMatrix();
  }
  let lastSisWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastSisWidth) return;
    lastSisWidth = window.innerWidth;
    layout();
  }, { passive: true });

  let mx = 0, my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ═══════════════════════════════════════════════════════════
  // Text Engine & Decoding Effect
  // ═══════════════════════════════════════════════════════════
  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
  const L = {};
  [['tg', 32], ['h1', 44], ['h2', 44], ['p', 26], ['rn', 36], ['rd', 22], ['rw', 18]].forEach((a) => {
    L[a[0]] = {
      el: $('s-' + a[0]),
      ms: a[1],
      t: '',
      h: '',
      st: 0
    };
  });

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function say(id, t, d) {
    if (!L[id] || L[id].t === t) return;
    L[id].t = t;
    L[id].st = performance.now() + (d || 0);
  }

  function text(now) {
    for (const k in L) {
      const l = L[k];
      if (!l.el) continue;
      if (!l.t) {
        if (l.h !== '') {
          l.el.innerHTML = '';
          l.h = '';
        }
        continue;
      }
      const n = l.t.length;
      const q = reduce ? 1 : cl((now - l.st) / (n * l.ms));
      const d = Math.floor(q * n);
      const nz = (q <= 0 || q >= 1) ? 0 : Math.min(4, n - d);
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
    }
  }

  function getSteps() {
    const isEn = getLang() === 'en';
    const lay = getLay();
    return (isEn ? [
      ['08 · System behind the screen', ['What you see', 'is only part of the system.'], 'A simple screen can have serious infrastructure behind it. Scroll and see what unfolds from it.']
    ] : [
      ['08 · Sistem iza ekrana', ['Ono što vidite', 'je samo deo sistema.'], 'Jednostavan ekran može da ima ozbiljnu strukturu iza sebe. Skrolujte i pogledajte šta izlazi iz njega.']
    ])
      .concat(lay.map((l, i) => ['0' + (i + 1) + ' / 05 · ' + l[0], [l[1], ''], l[2]]))
      .concat(isEn ? [
        ['08 · System behind the screen', ['The prettiest screen is not success', 'if the system behind it doesn’t work.'], 'We build both the interface and everything behind it as one unified asset that remains yours.'],
        ['09 · Website role', ['Why do you have a website?', ''], 'If the only answer is “so people see who we are”, we might be asking too little from our web presence.']
      ] : [
        ['08 · Sistem iza ekrana', ['Najlepši ekran nije uspeh', 'ako sistem iza njega ne radi.'], 'Gradimo i ekran i sve iza njega, kao jednu celinu koja ostaje vaša.'],
        ['09 · Uloga sajta', ['Zašto imate sajt?', ''], 'Ako je jedini odgovor „da ljudi vide ko smo“, možda od sajta tražimo premalo.']
      ]);
  }

  // ═══════════════════════════════════════════════════════════
  // Section 09 Chips & CTA Interactivity
  // ═══════════════════════════════════════════════════════════
  ulogaChips.forEach((chip, i) => {
    chip.addEventListener('click', () => {
      if (!ulogaTrack) return;
      const trackRect = ulogaTrack.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const trackTop = trackRect.top + scrollY;
      const tot = ulogaTrack.offsetHeight - window.innerHeight;
      const targetScroll = trackTop + tot * ((i + 0.5) / 6);
      if (window.lenis) window.lenis.scrollTo(targetScroll, { duration: 1.0 });
      else window.scrollTo({ top: targetScroll, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  if (ulogaCta) {
    ulogaCta.addEventListener('click', (e) => {
      e.preventDefault();
      const isEn = getLang() === 'en';
      const rIdx = curRole >= 0 ? curRole : 0;
      const roles = getRoles();
      const roleData = roles[rIdx] || roles[0];
      const contactMsg = document.getElementById('contact-message');
      if (contactMsg) {
        contactMsg.value = isEn ? `Interested in goal: ${roleData[0]} (“${roleData[1]}”). How can we apply this to our website?` : `Zanima me cilj: ${roleData[0]} („${roleData[1]}“). Kako možemo ovo primeniti na naš sajt?`;
      }
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        if (window.lenis) window.lenis.scrollTo(contactSection, { duration: 1.2 });
        else contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // Master Scroll Choreography (Section 08 + Transition + Section 09)
  // ═══════════════════════════════════════════════════════════
  let cur = -1;
  let rY = 0, rX = 0;
  let mobileOutMax = 0;
  const S0 = 0.28;
  const S1 = 0.84;

  function frame(now) {
    const stageRect = masterStage.getBoundingClientRect();
    const rUloga = ulogaTrack ? ulogaTrack.getBoundingClientRect() : { bottom: 0, top: 0, offsetHeight: 0 };

    const contactSection = document.getElementById('contact');
    const rContact = contactSection ? contactSection.getBoundingClientRect() : null;

    // The laptop strictly belongs to Section 08 & 09 and must NEVER bleed into Section 10 (Kontakt) or Footer.
    // When Section 10 (Kontakt) covers Section 09 (rContact.top <= 0), or Section 09 has scrolled past, hide canvas completely.
    const isPastSection09 = (rContact && rContact.top <= 0) || rUloga.bottom <= 0 || stageRect.bottom <= 0;
    const isBeforeSection08 = stageRect.top > window.innerHeight;

    if (isPastSection09 || isBeforeSection08) {
      cv.style.opacity = '0';
      cv.style.visibility = 'hidden';
      requestAnimationFrame(frame);
      return;
    }

    cv.style.visibility = 'visible';

    // Fade out smoothly as Kontakt rises over Section 09
    if (rContact && rContact.top < window.innerHeight) {
      const exitProgress = Math.max(0, Math.min(1, (window.innerHeight - rContact.top) / (window.innerHeight * 0.75)));
      cv.style.opacity = String((1 - exitProgress).toFixed(3));
    } else if (rUloga.bottom < window.innerHeight) {
      const exitProgress = Math.max(0, Math.min(1, (window.innerHeight - rUloga.bottom) / (window.innerHeight * 0.45)));
      cv.style.opacity = String((1 - exitProgress).toFixed(3));
    } else {
      cv.style.opacity = '1';
    }

    const rSis = sisTrack.getBoundingClientRect();
    const totSis = sisTrack.offsetHeight - window.innerHeight;
    const P_sis = cl(-rSis.top / totSis);

    const totUloga = ulogaTrack.offsetHeight - window.innerHeight;
    const P_uloga = cl(-rUloga.top / totUloga);

    // Transition progress: when Section 09 sheet slides up over Section 08
    const sheetRise = cl((window.innerHeight - rUloga.top) / window.innerHeight);

    // Transition factor rp: 0 in Section 08, smoothly rises to 1 as Section 09 sheet arrives
    const rp = rUloga.top <= 0 ? 1 : sm(0, 1, sheetRise);

    // Role mode active when sheet reaches top
    const inRoleMode = rUloga.top <= 0;

    if (!inRoleMode) {
      // ═════════════════════════════════════════════════════════
      // 08 · SISTEM IZA EKRANA
      // ═════════════════════════════════════════════════════════
      curRole = -1;
      const open = sm(0, 0.07, P_sis);
      const on = cl((P_sis - 0.05) / 0.12);
      const outP = cl((P_sis - 0.16) / 0.13);
      const backP = cl((P_sis - 0.84) / 0.10);

      // Laptop lid unfolds from closed (-1.894) to open (0.0)
      if (lidPivotRef) {
        lidPivotRef.rotation.x = -1.894 * (1 - open) + (0.1 * sm(0.85, 1.0, P_sis) * rp);
      }

      // Step calculation (0..4 for the 5 layers)
      const s = (P_sis - S0) / (S1 - S0) * 5;
      const k = Math.max(0, Math.min(4, Math.floor(s)));
      const act = P_sis < S0 ? -1 : P_sis < S1 ? k : -2;
      const step = P_sis < S0 ? 0 : P_sis >= S1 ? 6 : k + 1;

      if (step !== cur) {
        cur = step;
        const currentSteps = getSteps();
        const st = currentSteps[step] || currentSteps[0];
        say('tg', st[0]);
        const hArr = Array.isArray(st[1]) ? st[1] : [st[1], ''];
        say('h1', hArr[0], 140);
        say('h2', hArr[1], 140 + (hArr[0] ? hArr[0].length * 44 * 0.6 : 0));
        const totalHLen = (hArr[0] || '').length + (hArr[1] || '').length;
        say('p', st[2], 160 + totalHLen * 44 * 0.6);
        if (sisLy) {
          Array.from(sisLy.children).forEach((li, i) => {
            li.classList.toggle('on', i === act);
            li.classList.toggle('done', (act >= 0 && i < act) || act === -2);
          });
        }
      }

      // Exploded layer cards flight & shuffle along screen normal axis
      const sp = screenPose();
      let show = 5;

      if (narrow) {
        // ═════════════════════════════════════════════════════════
        // MOBILNI (<900px): Špil slojeva iza ekrana (sistem-mobile-v2.html)
        // ═════════════════════════════════════════════════════════
        rails.forEach((rl) => {
          rl.material.opacity = 0;
        });

        // 3. Na ulasku u sekciju špil se razmakne (od ~35% do 100% razmaka)
        const spread = 0.35 + 0.65 * eo(cl((1 - rSis.top / window.innerHeight - 0.3) / 0.6));

        // Koraci: iStep (0=Korak 01/Iskustvo, 1=Konverzija, 2=Podaci, 3=Automatizacija, 4=Zadržavanje)
        const sStep = (P_sis - S0) / (S1 - S0) * 5;
        const iStep = P_sis < S0 ? 0 : Math.min(4, Math.floor(sStep));
        const tStep = P_sis < S0 ? 0 : (sStep - iStep);

        // Sloj 01 (Kuća pod Fruškom) se prikazuje na ekranu laptopa
        cards[0].g.visible = false;
        show = 0;

        let outMax = 0;
        let lp = null;

        // Deck fly-out factor: 0 dok je laptop zatvoren/dok se otvara/pali,
        // a tek od S0 (0.28) kada krene Korak 02
        const deckFly = sm(S0, S0 + 0.05, P_sis);

        // Slojevi 02–05 (j = 0..3) stoje u špilu iza ekrana
        for (let j = 0; j < 4; j++) {
          const c = cards[j + 1];
          if (!c) continue;
          const s = j + 1; // sloj j pripada koraku s (1..4)

          // Pre početka slojeva (P_sis < S0) kartice su 100% skrivene i ne seku ekran
          if (P_sis < S0 || deckFly <= 0.01) {
            c.g.visible = false;
            continue;
          }

          let out = 0;
          if (s === iStep) out = eio(seg(tStep, 0.05, 0.45));
          else if (s === iStep - 1) out = 1 - eio(seg(tStep, 0, 0.3));
          if (s === 4 && iStep === 4) out = eio(seg(tStep, 0.05, 0.45));

          if (P_sis >= S1) {
            out *= (1 - cl((P_sis - S1) / 0.08));
          }

          outMax = Math.max(outMax, out);

          // Sakrij karticu ako nije aktivna da ne bi sekla ekran ili stajala poluvidljiva
          if (out <= 0.01) {
            c.g.visible = false;
            continue;
          }

          // 5. Koraci 02–05: aktivni sloj glatko izlazi ispred ekrana (malo iznad centra ekrana, z ≈ +0.28)
          const frontPos = {
            x: sp.x,
            y: sp.y + UP.y * 0.04 + NRM.y * 0.28,
            z: sp.z + UP.z * 0.04 + NRM.z * 0.28
          };

          // Kada izleće, počinje u ravni ekrana i pruža se ka frontPos
          const startPos = {
            x: sp.x,
            y: sp.y,
            z: sp.z + NRM.z * 0.03
          };

          c.g.position.set(
            lerp(startPos.x, frontPos.x, out),
            lerp(startPos.y, frontPos.y, out),
            lerp(startPos.z, frontPos.z, out)
          );

          const sc = sp.s * lerp(0.96, 1.02, out);
          c.g.scale.set(sc, sc, 1);
          c.g.rotation.set(sp.rx, sp.ry, sp.rz);

          c.f.material.color.setRGB(1, 1, 1);
          if (c.bk) c.bk.material.color.setRGB(1, 1, 1);

          c.g.renderOrder = 10;
          c.g.visible = true;

          if (out > 0.05 && (!lp || out > lp.out)) {
            lp = { c, slotPos: startPos, out, sc };
          }
        }

        // Dve tanke zlatne linije spajaju desne uglove kartice sa njenim mestom u špilu
        if (lp) {
          const p = mobLineGeo.attributes.position.array;
          const hw = (KW * lp.sc) / 2;
          const hh = (KH * lp.sc) / 2;
          const hw0 = (KW * sp.s * 0.96) / 2;
          const hh0 = (KH * sp.s * 0.96) / 2;

          const A = [
            lp.c.g.position.x + hw, lp.c.g.position.y + UP.y * hh, lp.c.g.position.z + UP.z * hh,
            lp.slotPos.x + hw0, lp.slotPos.y + UP.y * hh0, lp.slotPos.z + UP.z * hh0,
            lp.c.g.position.x + hw, lp.c.g.position.y - UP.y * hh, lp.c.g.position.z - UP.z * hh,
            lp.slotPos.x + hw0, lp.slotPos.y - UP.y * hh0, lp.slotPos.z - UP.z * hh0
          ];
          for (let q = 0; q < 12; q++) p[q] = A[q];
          mobLineGeo.attributes.position.needsUpdate = true;
          mobLineMat.opacity = 0.55 * Math.sin(Math.PI * cl(lp.out)) + 0.15 * lp.out;
        } else {
          mobLineMat.opacity = 0;
        }

        mobileOutMax = outMax;
      } else {
        // Desktop cards animation & return
        mobLineMat.opacity = 0;
        const ex = sm(0, 0.85, outP) * (1 - sm(0.15, 0.85, backP));

        // Kada se kartice vrate (P_sis >= 0.88 ili backP >= 0.82), sve kartice su uvučene
        // i ekran prikazuje čist sajt bez izvirivanja ili nakrivljenih slojeva
        const allDocked = P_sis >= 0.88 || backP >= 0.82;

        cards.forEach((c, i) => {
          const eo = sm(i * 0.12, i * 0.12 + 0.46, outP);
          const eb = sm((4 - i) * 0.12, (4 - i) * 0.12 + 0.40, backP);

          // Sloj 0 (sajt) se pretapa u sam ekran čim dodirne ravan ekrana (eb >= 0.55),
          // ostali slojevi se uvlače čim eb >= 0.85
          if (allDocked || eo <= 0 || eb >= (i === 0 ? 0.55 : 0.85)) {
            c.g.visible = false;
            if (i < show) show = i;
            return;
          }

          c.lift = (c.lift || 0) + (((i === act) ? 1 : 0) - (c.lift || 0)) * (reduce ? 1 : 0.075);
          const lf = c.lift;
          const d = 0.12 + (4 - i) * 0.25;

          const base = {
            x: sp.x + NRM.x * d,
            y: sp.y + NRM.y * d + (4 - i) * 0.03,
            z: sp.z + NRM.z * d,
            rx: sp.rx,
            ry: 0,
            rz: 0,
            s: sp.s * 0.95
          };

          const fd = 0.14 + 4 * 0.25 + 0.40;
          const face = {
            x: sp.x + NRM.x * (fd * 0.35) + 0.26,
            y: sp.y + NRM.y * fd + 0.16,
            z: sp.z + NRM.z * fd + 0.12,
            rx: -0.05,
            ry: -rY * 0.9,
            rz: 0,
            s: sp.s * 0.96
          };

          const live = mix(base, face, lf);
          const tf = eo < 1 ? eo : (eb > 0 ? 1 - eb : 1);
          let pose = live;

          if (tf < 1) {
            const k2 = reduce ? (tf > 0.5 ? 1 : 0) : tf;
            const e2 = eo < 1 ? backOut(k2) : k2 * k2 * (3 - 2 * k2);
            // Pri povratku kartica se skala i orijentacija glatko spajaju sa 100% ekranom
            const targetSp = { ...sp, s: sp.s };
            pose = mix(targetSp, live, e2);
            // Ugaono njihanje se dodaje isključivo pri izletanju, nikada pri povratku u slot
            if (eb <= 0) {
              pose.rz += Math.sin(Math.PI * k2) * 0.08 * (i % 2 ? 1 : -1);
            }
          }

          c.g.visible = true;
          apply(c, pose, 0, 0);
          c.f.material.color.setScalar(act >= 0 ? (0.38 + 0.62 * lf) : 1);
          if (c.bk) c.bk.material.color.setScalar(act >= 0 ? (0.38 + 0.62 * lf) : 1);
        });

        if (allDocked) {
          show = 0;
        }

        // 4 tanke zlatne šine koje spajaju uglove ekrana sa prednjom karticom
        const frontDist = 0.14 + 4 * 0.25;
        rails.forEach((rl, idx) => {
          if (allDocked || ex <= 0.01) {
            rl.material.opacity = 0;
            return;
          }
          const a1 = rl.geometry.attributes.position;
          if (lidPivotRef) {
            vC.copy(CORNERS[idx]);
            lidPivotRef.localToWorld(vC);
            world.worldToLocal(vC);
          } else {
            vC.set(0, 0.69, 0);
          }
          a1.setXYZ(0, vC.x, vC.y, vC.z);
          a1.setXYZ(1, vC.x + NRM.x * frontDist * ex, vC.y + NRM.y * frontDist * ex + 0.10 * ex, vC.z + NRM.z * frontDist * ex);
          a1.needsUpdate = true;
          rl.material.opacity = 0.45 * ex;
        });
      }

      // Section 08 text moves up and fades out as Section 09 sheet rises
      if (sisTxt) {
        sisTxt.style.opacity = String((1 - sheetRise).toFixed(3));
        sisTxt.style.transform = 'translateY(' + (-sheetRise * 50).toFixed(1) + 'px)';
      }

      drawScreen(on, show, sheetRise);
    } else {
      // ═════════════════════════════════════════════════════════
      // 09 · ZAŠTO IMATE SAJT?
      // ═════════════════════════════════════════════════════════
      // Hide Section 08 flying cards and rails
      cards.forEach((c) => {
        c.g.visible = false;
      });
      rails.forEach((rl) => {
        rl.material.opacity = 0;
      });
      mobLineMat.opacity = 0;

      if (lidPivotRef) {
        lidPivotRef.rotation.x = 0; // Upright viewing angle
      }

      // Svi koraci/uloge se završavaju pre nego što se podigne Kontakt forma
      const riseDist = window.innerHeight;
      const totUlogaAnim = Math.max(1, totUloga - riseDist);
      const P_roles = cl(-rUloga.top / totUlogaAnim);
      const roleProg = P_roles * 5.999;
      const role = Math.min(5, Math.max(0, Math.floor(roleProg)));

      if (role !== curRole) {
        roleFrom = (curRole >= 0 && role >= 0) ? curRole : -1;
        roleAt = performance.now();
        curRole = role;
        lastScreenKey = '';
        roleAnimActive = true;

        ulogaChips.forEach((bt, i) => {
          const isActive = i === role;
          bt.classList.toggle('is-active', isActive);
          bt.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          bt.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        L.rn.t = '';
        L.rd.t = '';
        L.rw.t = '';
        const currentRoles = getRoles();
        say('rn', currentRoles[role][0]);
        say('rd', currentRoles[role][1], 200);
        say('rw', currentRoles[role][2], 200 + currentRoles[role][1].length * 14);
      }

      drawScreen(1, 5);
    }

    // Section 09 content floats in when sheet is halfway up
    if (ulogaIn) {
      const uIn = sm(0.5, 1.0, sheetRise);
      ulogaIn.style.opacity = uIn.toFixed(3);
      ulogaIn.style.transform = 'translateY(' + ((1 - uIn) * 60).toFixed(1) + 'px)';
    }

    // Framing & Camera Zoom transition
    if (narrow) {
      // Laptop: okrenut bočno dok se vidi špil (-0.36), skoro frontalno dok se čita kartica (-0.08)
      const targetRotX = 0.05 * (1 - rp);
      const targetRotY = lerp(-0.36, -0.08, mobileOutMax) * (1 - rp) + mx * 0.03;
      rY += (targetRotY - rY) * (reduce ? 1 : 0.09);
      rX += (targetRotX - rX) * (reduce ? 1 : 0.09);
      world.rotation.set(rX, rY, 0);

      // Na sekciji 08 ceo laptop stoji lepo u vidnom polju (bez odsecanja levog ćoška)
      // U sekciji 09 (Zašto imate sajt) laptop je podignut ka gornjem delu ekrana da ne pokriva tekst i čipove
      const targetPosX = lerp(0.04, 0.0, mobileOutMax) * (1 - rp);
      world.position.set(targetPosX, -0.28 + 1.42 * rp, 0);

      // Kamera: udaljenost iz širine canvasa tako da laptop + špil uvek u celosti staju u širinu ekrana
      const vf = cam.fov * Math.PI / 180;
      const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
      const fw = lerp(2.55, 2.05, mobileOutMax);
      const zDist = Math.max(fw / 2 / Math.tan(hf / 2), 1.95 / 2 / Math.tan(vf / 2));
      cam.position.set(0, 1.18 - 0.22 * rp, zDist - 0.25 * rp);
      cam.lookAt(0, 0.68 + 0.22 * rp, 0);
    } else {
      // Desktop: tokom sekcije 08 laptop je okrenut bočno (-0.66 rad) da se vidi dubina kartica,
      // a pri prelasku u sekciju 09 (Zašto imate sajt) laptop se okreće PRAVO ka gledaocu sajta.
      // Ugao ka kameri na X=0.65 pri poziciji laptopa X=2.0, Z=5.8: atan2(0.65 - 2.0, 5.8) = -0.2285 rad
      const turnVal = sm(0.18, 0.28, P_sis) * (1 - sm(0.84, 0.92, P_sis));
      const faceAngleY = -0.2285; // Čisto frontalno okrenut ka gledaocu (ekran stoji pravo)
      const faceAngleX = 0.06;    // Blagi prirodan nagib ka gore u visini pogleda korisnika

      const tY = lerp(-0.66 * turnVal, faceAngleY, rp) + mx * 0.04;
      const tX = lerp(0, faceAngleX, rp) + my * 0.03;
      rY += (tY - rY) * (reduce ? 1 : 0.08);
      rX += (tX - rX) * (reduce ? 1 : 0.08);
      world.rotation.set(rX, rY, 0);

      world.position.set(2.0, 0.08, 0);
      cam.position.set(0.65, 1.48 - 0.18 * rp, 6.3 - 0.5 * rp);
      cam.lookAt(0.65, 0.68, 0);
    }

    lap.position.y = reduce ? 0 : Math.sin(now / 1700) * 0.012;

    renderer.render(scene, cam);
    text(now);
    requestAnimationFrame(frame);
  }

  buildRoles();
  layout();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      redrawCards();
      layout();
    });
  }

  window.addEventListener('bulevar:langchange', () => {
    updateSisLy();
    redrawCards();
    buildRoles();
    if (curRole >= 0) {
      const currentRoles = getRoles();
      const r = curRole < currentRoles.length ? curRole : 0;
      L.rn.t = '';
      L.rd.t = '';
      L.rw.t = '';
      say('rn', currentRoles[r][0]);
      say('rd', currentRoles[r][1], 100);
      say('rw', currentRoles[r][2], 100 + currentRoles[r][1].length * 12);
    }
    lastScreenKey = '';
    stex.needsUpdate = true;
  });

  requestAnimationFrame(frame);
}
