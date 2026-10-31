/**
 * putKupca.js — Section „Put kupca“ (#put-kupca)
 * 
 * Features:
 * - 3D Apple iPhone 15 Pro Max model with power-on animation, real clock, and interactive screen.
 * - Sadržaj ekrana po koracima iz prototipa put-kupca-v3.html
 * - 8 koraka: Oglas, Landing, Upit, CRM, Prodaja, Follow-up, Podaci, Povratak
 * - Interaktivan korak „Upit“: pravi izbor usluge, dana i vremena (čipovi)
 * - Izbor se pamti i koristi u daljim koracima i odmah prepisuje karticu „Iza kulisa“
 * - Raycast tap samo na dugme na ekranu ili čipove menja stanje (tap bilo gde drugde NE menja korak)
 * - Vibracija telefona u koraku Prodaja
 * - Skrolovanje / prevlačenje za okretanje telefona / strelice na tastaturi
 * - Kartica „Iza kulisa“ sa dešifrovanjem teksta i trakom od 8 crtica
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initPutKupca() {
  const track = document.getElementById('put-kupca');
  const cv = document.getElementById('put-kupca-gl');
  const slot = document.getElementById('put-kupca-slot');

  if (!track || !cv || !slot) {
    console.warn('[putKupca] Required elements not found');
    return;
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 8 Koraka Puta Kupca
  const STEPS = [
    { n: 'Oglas', d: 'Korisnik vidi oglas i klikne.', b: 'izvor: instagram · kampanja: šišanje-okt' },
    { n: 'Landing', d: 'Stranica nastavlja poruku koju je oglas obećao.', b: 'stranica: /termin · poruka = ista kao u oglasu' },
    { n: 'Upit', d: 'Razume ponudu i ostavlja upit.', b: 'usluga: šišanje · sub 14:00 · Ana · 064…' },
    { n: 'CRM', d: 'Sistem čuva kontakt i kontekst, uz saglasnost.', b: 'novi kontakt: Ana · izvor: instagram · zanima: šišanje, farbanje' },
    { n: 'Prodaja', d: 'Tim zna šta korisnika zanima pre nego što pozove.', b: 'kartica kupca otvorena pri pozivu · predlog: farbanje' },
    { n: 'Follow-up', d: 'Javljanje se ne zaboravlja.', b: 'automatski podsetnik: dan pre · 18:00' },
    { n: 'Podaci', d: 'Vidi se gde proces radi, a gde zapinje.', b: 'klik 100 → termin 41 → došlo 38 · ocena 4,9' },
    { n: 'Povratak', d: 'Nova kupovina, preporuka ili poruka u pravom trenutku.', b: '+6 nedelja → podsetnik · preporuka → kod −10%' }
  ];

  // Korisnički izbor u koraku „Upit“
  const userChoice = {
    service: 'Šišanje',
    day: 'Sub 24.',
    dayFull: 'Subota, 24. okt.',
    time: '14:00'
  };

  function getUpsellService() {
    return userChoice.service === 'Farbanje' ? 'feniranje' : 'farbanje';
  }

  function getStepCode(stepIdx) {
    switch (stepIdx) {
      case 0:
        return 'izvor: instagram · kampanja: ' + (userChoice.service.toLowerCase().includes('šišanj') ? 'šišanje-okt' : userChoice.service.toLowerCase() + '-okt');
      case 1:
        return 'stranica: /termin · poruka = ista kao u oglasu';
      case 2:
        return 'usluga: ' + userChoice.service.toLowerCase() + ' · ' + userChoice.day.toLowerCase().replace('.', '') + ' ' + userChoice.time + ' · Ana · 064…';
      case 3:
        return 'novi kontakt: Ana · izvor: instagram · zanima: ' + userChoice.service.toLowerCase() + ', ' + getUpsellService();
      case 4:
        return 'kartica kupca otvorena pri pozivu · predlog: ' + getUpsellService();
      case 5:
        return 'automatski podsetnik: dan pre · 18:00';
      case 6:
        return 'klik 100 → termin 41 → došlo 38 · ocena 4,9';
      case 7:
        return '+6 nedelja → podsetnik · preporuka → kod −10%';
      default:
        return STEPS[stepIdx]?.b || '';
    }
  }

  // Dešifrovanje teksta (Scramble text animation for "Iza kulisa" card)
  const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';
  const T = [
    { el: document.getElementById('put-kupca-bt'), ms: 40 },
    { el: document.getElementById('put-kupca-bd'), ms: 18 },
    { el: document.getElementById('put-kupca-bc'), ms: 16 }
  ];

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function say(i, t, d) {
    if (!T[i].el) return;
    T[i].t = t;
    T[i].st = performance.now() + d;
  }

  function renderTextScramble(now) {
    T.forEach((l) => {
      if (!l.t || !l.el) return;
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

  // Three.js Scene Setup — Matching Black Titanium iPhone 15 Pro Max setup from deviceShowcase
  const renderer = new THREE.WebGLRenderer({
    canvas: cv,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  cam.position.set(0, 0, 8.2);

  // Exact studio lighting matching deviceShowcase (Screenshot 2)
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

  // Phone group setup at scale 23.0
  const phone = new THREE.Group();
  scene.add(phone);
  phone.position.set(0, -0.08, 0.4);
  phone.scale.set(23.0, 23.0, 23.0);
  phone.rotation.y = Math.PI;
  phone.rotation.x = 0.04;

  // Screen Canvas & Dynamic Texture
  const SW = 540;
  const SH = 1170; // 19.5:9 aspect ratio matching iPhone
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

  // Apple Black Titanium Materials for iPhone 15 Pro Max
  const phoneTitaniumMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18191d), // Natural Apple Black Titanium
    roughness: 0.35,
    metalness: 0.85,
  });

  // Load our existing Black Titanium iPhone 15 Pro Max GLB model
  const loader = new GLTFLoader();
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
      console.log('[putKupca] 3D Black Titanium iPhone model loaded at scale 23.0');
    },
    undefined,
    (err) => console.error('[putKupca] Failed to load phone model:', err)
  );

  // Helper Canvas Drawing functions
  function rr(x, X, Y, w, h, r) {
    x.beginPath();
    x.moveTo(X + r, Y);
    x.arcTo(X + w, Y, X + w, Y + h, r);
    x.arcTo(X + w, Y + h, X, Y + h, r);
    x.arcTo(X, Y + h, X, Y, r);
    x.arcTo(X, Y, X + w, Y, r);
    x.closePath();
  }

  function wrapText(x, t, X, Y, maxW, lh) {
    const words = t.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (x.measureText(test).width > maxW && line) {
        x.fillText(line, X, Y);
        line = words[i];
        Y += lh;
      } else {
        line = test;
      }
    }
    x.fillText(line, X, Y);
    return Y + lh;
  }

  function clock() {
    const d = new Date();
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  let cta = null;
  let declineCta = null;
  let activeChips = [];
  let pressT = -1;
  let on = true;
  let onT = performance.now();
  let cur = -1;
  let stepT = 0;

  function drawButton(x, X, Y, w, h, label, ghost, now) {
    rr(x, X, Y, w, h, 22);
    if (ghost) {
      x.strokeStyle = '#2A3658';
      x.lineWidth = 3;
      x.stroke();
    } else {
      x.fillStyle = '#D9B25F';
      x.fill();
    }
    x.fillStyle = ghost ? '#F3EEE3' : '#0B1020';
    x.font = '800 30px Montserrat, sans-serif';
    x.textAlign = 'center';
    x.fillText(label, X + w / 2, Y + h / 2 + 11);
    x.textAlign = 'left';

    cta = [X, Y, w, h];

    // Pulsing orange outline
    const pulse = (now / 1000) % 1.6;
    if (!reduce && pulse < 1) {
      x.strokeStyle = 'rgba(232, 150, 58, ' + (1 - pulse) + ')';
      x.lineWidth = 4;
      rr(x, X - pulse * 14, Y - pulse * 14, w + pulse * 28, h + pulse * 28, 22 + pulse * 14);
      x.stroke();
    }

    // Press flash
    if (pressT > 0 && now - pressT < 260) {
      x.fillStyle = 'rgba(255, 255, 255, 0.28)';
      rr(x, X, Y, w, h, 22);
      x.fill();
    }
  }

  function drawChip(x, X, Y, label, onC) {
    x.font = '700 24px Montserrat, sans-serif';
    const w = x.measureText(label).width + 36;
    rr(x, X, Y, w, 48, 24);
    if (onC) {
      x.fillStyle = '#D9B25F';
      x.fill();
      x.fillStyle = '#0B1020';
    } else {
      x.strokeStyle = '#2A3658';
      x.lineWidth = 3;
      x.stroke();
      x.fillStyle = '#F3EEE3';
    }
    x.fillText(label, X + 18, Y + 33);
    return X + w + 10;
  }

  // Section Entrance Reveal Animation (matching site standards)
  const tagEl = track.querySelector('.tag');
  const h2El = track.querySelector('h2');
  const leadEl = track.querySelector('.lead');
  const noteEl = track.querySelector('.note');
  const exEl = track.querySelector('.ex');
  const sideEl = track.querySelector('.side');

  function triggerEntranceAnimation() {
    const targets = [tagEl, h2El, leadEl, noteEl, exEl, sideEl].filter(Boolean);
    gsap.killTweensOf(targets);
    gsap.fromTo(targets,
      { opacity: 0, y: 32, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, stagger: 0.09, ease: 'power3.out', overwrite: 'auto' }
    );
  }

  window.__animatePutKupcaEntrance = triggerEntranceAnimation;

  ScrollTrigger.create({
    trigger: '#devices',
    start: 'top 80%',
    onEnter: triggerEntranceAnimation,
    onEnterBack: triggerEntranceAnimation
  });

  function drawAvatar(x, X, Y, r) {
    const g = x.createLinearGradient(X - r, Y - r, X + r, Y + r);
    g.addColorStop(0, '#D9B25F');
    g.addColorStop(1, '#8a6a2c');
    x.fillStyle = g;
    x.beginPath();
    x.arc(X, Y, r, 0, Math.PI * 2);
    x.fill();
  }

  function drawCallButton(x, cx, cy, r, isAccept, now) {
    // Pulsing outer ripple for incoming ringing accept button
    if (isAccept && !reduce) {
      const pulse1 = (now / 800) % 1;
      const pulse2 = ((now + 400) / 800) % 1;
      x.beginPath();
      x.arc(cx, cy, r + pulse1 * 22, 0, Math.PI * 2);
      x.strokeStyle = `rgba(52, 199, 89, ${0.6 * (1 - pulse1)})`;
      x.lineWidth = 2.5;
      x.stroke();

      x.beginPath();
      x.arc(cx, cy, r + pulse2 * 22, 0, Math.PI * 2);
      x.strokeStyle = `rgba(52, 199, 89, ${0.4 * (1 - pulse2)})`;
      x.lineWidth = 2;
      x.stroke();
    }

    const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (isAccept) {
      g.addColorStop(0, '#34C759');
      g.addColorStop(1, '#248A3D');
    } else {
      g.addColorStop(0, '#FF453A');
      g.addColorStop(1, '#D70015');
    }

    x.shadowColor = isAccept ? 'rgba(52, 199, 89, 0.45)' : 'rgba(255, 69, 58, 0.45)';
    x.shadowBlur = 20;
    x.shadowOffsetY = 6;
    x.fillStyle = g;
    x.beginPath();
    x.arc(cx, cy, r, 0, Math.PI * 2);
    x.fill();
    x.shadowColor = 'transparent';

    x.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    x.lineWidth = 1.5;
    x.stroke();

    // High quality phone receiver path
    x.save();
    x.translate(cx, cy);
    x.rotate(isAccept ? -Math.PI * 0.25 : Math.PI * 0.75);
    x.fillStyle = '#FFFFFF';
    x.beginPath();
    x.arc(9, -13, 8.5, -Math.PI * 0.35, Math.PI * 0.65, false);
    x.quadraticCurveTo(0, 0, 9, 13);
    x.arc(9, 13, 8.5, -Math.PI * 0.65, Math.PI * 0.35, false);
    x.quadraticCurveTo(-13, 0, 9, -13);
    x.closePath();
    x.fill();
    x.restore();

    // Label underneath
    x.font = '600 20px "Inter", -apple-system, sans-serif';
    x.textAlign = 'center';
    x.fillStyle = '#FFFFFF';
    x.fillText(isAccept ? 'Javi se' : 'Odbij', cx, cy + r + 28);
    x.textAlign = 'left';
  }

  function drawBubble(x, X, Y, w, t, me) {
    x.font = (me ? '700 ' : '600 ') + '26px Montserrat, sans-serif';
    const lines = [];
    const words = t.split(' ');
    let line = '';
    words.forEach((wd) => {
      const tt = line ? line + ' ' + wd : wd;
      if (x.measureText(tt).width > w - 40 && line) {
        lines.push(line);
        line = wd;
      } else {
        line = tt;
      }
    });
    lines.push(line);
    const h = lines.length * 36 + 28;
    const bx = me ? SW - 40 - w : X;
    rr(x, bx, Y, w, h, 26);
    x.fillStyle = me ? '#D9B25F' : '#1b2544';
    x.fill();
    x.fillStyle = me ? '#0B1020' : '#F3EEE3';
    lines.forEach((l, i) => {
      x.fillText(l, bx + 20, Y + 42 + i * 36);
    });
    return Y + h + 18;
  }

  // Draw customer journey screens
  function drawScreen(now) {
    const x = sx;
    x.clearRect(0, 0, SW, SH);
    x.fillStyle = '#0d1426';
    x.fillRect(0, 0, SW, SH);

    cta = null;
    declineCta = null;
    activeChips = [];

    const age = now - stepT;
    const fade = reduce ? 1 : Math.min(1, age / 350);
    x.save();
    x.globalAlpha = fade;
    x.translate(0, (1 - fade) * 30);

    const i = cur < 0 ? 0 : cur;
    const L = 40;
    const Y = 120;

    // KORAK 0: Oglas
    if (i === 0) {
      drawAvatar(x, L + 28, Y + 28, 28);
      x.fillStyle = '#F3EEE3';
      x.font = '700 26px Montserrat';
      x.fillText('vas.salon', L + 70, Y + 22);
      x.fillStyle = '#A7AEC2';
      x.font = '600 20px Montserrat';
      x.fillText('Sponzorisano', L + 70, Y + 50);

      const g = x.createLinearGradient(0, Y + 80, 0, Y + 640);
      g.addColorStop(0, '#2a3765');
      g.addColorStop(1, '#141c36');
      rr(x, L, Y + 80, SW - 80, 560, 26);
      x.fillStyle = g;
      x.fill();

      x.fillStyle = '#F3EEE3';
      x.font = '900 46px Montserrat';
      x.fillText('Novo šišanje,', L + 30, Y + 540);
      x.fillText('bez čekanja.', L + 30, Y + 596);

      drawButton(x, L, Y + 670, SW - 80, 84, 'Zakaži termin →', false, now);

      x.fillStyle = '#A7AEC2';
      x.font = '600 22px Montserrat';
      x.fillText('♡ 128 · 14 komentara', L, Y + 800);
    }

    // KORAK 1: Landing
    if (i === 1) {
      x.fillStyle = '#A7AEC2';
      x.font = '600 22px "IBM Plex Mono", monospace';
      x.textAlign = 'center';
      x.fillText('vassalon.rs', SW / 2, Y);
      x.textAlign = 'left';

      x.fillStyle = '#F3EEE3';
      x.font = '900 64px Montserrat';
      x.fillText('Termin za', L, Y + 110);
      x.fillStyle = '#D9B25F';
      x.fillText('30 sekundi.', L, Y + 180);

      x.fillStyle = '#A7AEC2';
      x.font = '600 28px Montserrat';
      wrapText(x, 'Izaberite uslugu i vreme. Potvrda stiže odmah.', L, Y + 250, SW - 80, 40);

      rr(x, L, Y + 340, SW - 80, 330, 26);
      x.fillStyle = '#1b2544';
      x.fill();
      x.fillStyle = '#4A5678';
      x.font = '600 22px "IBM Plex Mono", monospace';
      x.fillText('[fotografija salona]', L + 30, Y + 520);

      drawButton(x, L, Y + 710, SW - 80, 84, 'Izaberi termin', false, now);
    }

    // KORAK 2: Upit (Pravi interaktivni izbor)
    if (i === 2) {
      x.fillStyle = '#F3EEE3';
      x.font = '800 40px Montserrat';
      x.fillText('Vaš termin', L, Y + 20);

      // 1. Usluga čipovi
      let cx = L;
      const services = ['Šišanje', 'Farbanje', 'Feniranje'];
      services.forEach((srv) => {
        const isSel = userChoice.service === srv;
        const nextX = drawChip(x, cx, Y + 55, srv, isSel);
        activeChips.push({ type: 'service', val: srv, rect: [cx, Y + 55, nextX - cx - 10, 48] });
        cx = nextX;
      });

      // 2. Dan čipovi sa punim nazivom iznad
      x.fillStyle = '#A7AEC2';
      x.font = '600 21px Montserrat';
      x.fillText(userChoice.dayFull, L, Y + 145);

      cx = L;
      const days = [
        { label: 'Pet 23.', full: 'Petak, 23. okt.' },
        { label: 'Sub 24.', full: 'Subota, 24. okt.' },
        { label: 'Pon 26.', full: 'Ponedeljak, 26. okt.' }
      ];
      days.forEach((d) => {
        const isSel = userChoice.day === d.label;
        const nextX = drawChip(x, cx, Y + 165, d.label, isSel);
        activeChips.push({ type: 'day', val: d.label, full: d.full, rect: [cx, Y + 165, nextX - cx - 10, 48] });
        cx = nextX;
      });

      // 3. Vreme čipovi
      cx = L;
      const times = ['10:00', '12:30', '14:00', '16:00'];
      times.forEach((tm) => {
        const isSel = userChoice.time === tm;
        const nextX = drawChip(x, cx, Y + 245, tm, isSel);
        activeChips.push({ type: 'time', val: tm, rect: [cx, Y + 245, nextX - cx - 10, 48] });
        cx = nextX;
      });

      // Auto-ukucano Ime i Telefon
      const typed = 'Ana'.slice(0, Math.floor(age / 180));
      const ph = '064 *** ** 12'.slice(0, Math.max(0, Math.floor((age - 600) / 90)));
      [[typed, 'Ime'], [ph, 'Telefon']].forEach((f, j) => {
        const yy = Y + 325 + j * 105;
        rr(x, L, yy, SW - 80, 80, 18);
        x.fillStyle = '#111a31';
        x.fill();
        x.strokeStyle = '#2A3658';
        x.lineWidth = 3;
        x.stroke();
        x.fillStyle = f[0] ? '#F3EEE3' : '#4A5678';
        x.font = '600 26px Montserrat';
        x.fillText(f[0] || f[1], L + 24, yy + 50);
      });

      drawButton(x, L, SH - 230, SW - 80, 84, 'Pošalji', false, now);
    }

    // KORAK 3: CRM / Potvrda
    if (i === 3) {
      x.fillStyle = '#D9B25F';
      x.beginPath();
      x.arc(SW / 2, Y + 180, 80, 0, Math.PI * 2);
      x.fill();

      // Checkmark drawing animation
      x.strokeStyle = '#0B1020';
      x.lineWidth = 14;
      x.lineCap = 'round';
      x.beginPath();
      const k = Math.min(1, age / 500);
      x.moveTo(SW / 2 - 38, Y + 182);
      x.lineTo(SW / 2 - 38 + 26 * Math.min(1, k * 2), Y + 182 + 26 * Math.min(1, k * 2));
      if (k > 0.5) {
        x.lineTo(SW / 2 - 12 + 50 * (k - 0.5) * 2, Y + 208 - 60 * (k - 0.5) * 2);
      }
      x.stroke();

      x.textAlign = 'center';
      x.fillStyle = '#F3EEE3';
      x.font = '900 44px Montserrat';
      x.fillText('Termin je potvrđen', SW / 2, Y + 340);

      x.fillStyle = '#A7AEC2';
      x.font = '600 28px Montserrat';
      x.fillText(userChoice.day + ' u ' + userChoice.time + ' · ' + userChoice.service, SW / 2, Y + 392);
      x.textAlign = 'left';

      drawButton(x, L, Y + 470, SW - 80, 84, 'Dodaj u kalendar', true, now);
    }

    // KORAK 4: Prodaja (Dolazni poziv, vibracija)
    if (i === 4) {
      drawAvatar(x, SW / 2, Y + 170, 85);

      x.textAlign = 'center';
      x.fillStyle = '#F3EEE3';
      x.font = '800 42px Montserrat';
      x.fillText('Vaš Salon', SW / 2, Y + 310);
      x.fillStyle = '#A7AEC2';
      x.font = '600 22px Montserrat';
      x.fillText('dolazni poziv · mobilni…', SW / 2, Y + 348);
      x.textAlign = 'left';

      const upsell = getUpsellService();
      drawBubble(x, L, Y + 395, SW - 80, '„Ana, videli smo da te zanima i ' + upsell + '. Da ga dodamo u isti termin?“', false);

      const btnY = SH - 180;
      const btnR = 48;

      // Crveno lepo dugme za odbijanje (Decline)
      drawCallButton(x, SW / 2 - 110, btnY, btnR, false, now);
      declineCta = [SW / 2 - 110 - btnR, btnY - btnR, btnR * 2, btnR * 2];

      // Zeleno lepo dugme za javljanje (Accept - CTA)
      drawCallButton(x, SW / 2 + 110, btnY, btnR, true, now);
      cta = [SW / 2 + 110 - btnR, btnY - btnR, btnR * 2, btnR * 2];
    }

    // KORAK 5: Follow-up (Podsetnik)
    if (i === 5) {
      drawAvatar(x, L + 28, Y + 28, 28);
      x.fillStyle = '#F3EEE3';
      x.font = '700 28px Montserrat';
      x.fillText('Vaš Salon', L + 70, Y + 38);

      const reminderText = 'Podsetnik: sutra u ' + userChoice.time + ' imate termin (' + userChoice.service.toLowerCase() + '). Vidimo se!';
      const yy = drawBubble(x, L, Y + 100, SW - 120, reminderText, false);

      if (age > 700) {
        drawButton(x, L, yy, 250, 70, 'Potvrđujem', false, now);
        drawChip(x, L + 270, yy + 11, 'Promeni', false);
      }
    }

    // KORAK 6: Podaci (Ocena)
    if (i === 6) {
      drawAvatar(x, L + 28, Y + 28, 28);
      x.fillStyle = '#F3EEE3';
      x.font = '700 28px Montserrat';
      x.fillText('Vaš Salon', L + 70, Y + 38);

      drawBubble(x, L, Y + 100, SW - 120, 'Kako je bilo danas, Ana?', false);

      const n = Math.min(5, Math.floor(age / 180));
      x.font = '64px Montserrat';
      x.textAlign = 'center';
      for (let s = 0; s < 5; s++) {
        x.fillStyle = s < n ? '#D9B25F' : '#2A3658';
        x.fillText('★', SW / 2 - 160 + s * 80, Y + 340);
      }
      x.textAlign = 'left';

      rr(x, L, Y + 400, SW - 80, 150, 18);
      x.fillStyle = '#111a31';
      x.fill();
      x.fillStyle = '#F3EEE3';
      x.font = '600 28px Montserrat';
      wrapText(x, 'Odlično, i brzo sam zakazala.', L + 24, Y + 452, SW - 130, 40);

      drawButton(x, L, Y + 600, SW - 80, 84, 'Pošalji ocenu', false, now);
    }

    // KORAK 7: Povratak (Lock screen posle 6 nedelja)
    if (i === 7) {
      x.textAlign = 'center';
      x.fillStyle = '#F3EEE3';
      x.font = '300 150px Montserrat';
      x.fillText(clock(), SW / 2, Y + 200);
      x.font = '600 26px Montserrat';
      x.fillStyle = '#A7AEC2';
      x.fillText('utorak, 1. decembar', SW / 2, Y + 250);
      x.textAlign = 'left';

      const srvName = userChoice.service.toLowerCase().includes('šišanj') ? 'šišanja' : userChoice.service.toLowerCase();
      const notifs = [
        ['VAŠ SALON · sada', 'Prošlo je 6 nedelja od ' + srvName + '. Zakažemo novi termin?'],
        ['VAŠ SALON', 'Preporuči nas drugarici. Obe dobijate 10% popusta.']
      ];

      notifs.forEach((nf, j) => {
        const yy = Y + 330 + j * 190;
        rr(x, L - 10, yy, SW - 60, 165, 30);
        x.fillStyle = 'rgba(40, 52, 88, 0.92)';
        x.fill();
        x.fillStyle = '#F3EEE3';
        x.font = '700 20px Montserrat';
        x.fillText(nf[0], L + 16, yy + 42);
        x.font = '600 25px Montserrat';
        wrapText(x, nf[1], L + 16, yy + 82, SW - 110, 34);
      });

      drawButton(x, L, Y + 730, SW - 80, 84, 'Zakaži ponovo', false, now);
    }

    x.restore();

    // Status bar & Dynamic Island (matching iPhone 15 Pro Max from deviceShowcase)
    x.fillStyle = '#FFFFFF';
    x.font = 'bold 22px "Inter", sans-serif';
    x.fillText(clock(), 52, 54);

    // 5G and battery icon
    x.font = 'bold 16px "Inter", sans-serif';
    x.fillText('5G', SW - 128, 54);
    rr(x, SW - 84, 38, 36, 18, 5);
    x.strokeStyle = '#FFFFFF';
    x.lineWidth = 2;
    x.stroke();
    x.fillRect(SW - 81, 41, 23, 12);
    x.fillRect(SW - 48, 44, 3, 6);

    // Dynamic Island
    rr(x, SW / 2 - 75, 24, 150, 40, 20);
    x.fillStyle = '#000000';
    x.fill();

    // Power-on overlay (crno -> Bulevar.IT logo -> ekran)
    const po = !on ? 1 : reduce ? 0 : Math.max(0, 1 - (now - onT - 600) / 600);
    if (po > 0) {
      x.fillStyle = 'rgba(0, 0, 0, ' + po + ')';
      x.fillRect(0, 0, SW, SH);
      const lg = on ? Math.min(1, (now - onT) / 400) * Math.min(1, (1200 - (now - onT)) / 300) : 0;
      if (lg > 0) {
        x.globalAlpha = lg;
        x.textAlign = 'center';
        x.font = '900 48px Montserrat';
        x.fillStyle = '#F3EEE3';
        x.fillText('Bulevar', SW / 2 - 34, SH / 2);
        x.fillStyle = '#D9B25F';
        x.fillText('.IT', SW / 2 + 96, SH / 2);
        x.textAlign = 'left';
        x.globalAlpha = 1;
      }
    }

    stex.needsUpdate = true;
  }

  // Camera projection & responsive positioning matching deviceShowcase
  function resize() {
    const width = cv.clientWidth || window.innerWidth;
    const height = cv.clientHeight || window.innerHeight;

    renderer.setSize(width, height, false);
    cam.aspect = width / height;

    if (width < 768) {
      cam.position.set(0, 0, 11.2);
    } else if (width < 1024) {
      cam.position.set(0, 0, 9.6);
    } else {
      cam.position.set(0, 0, 8.2);
    }
    cam.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);

  // Raycasting & Hit Testing on 3D Screen Mesh
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function raycastScreen(e) {
    if (!on || !phoneScreenMesh) return null;
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, cam);

    // Raycast directly on 3D phone screen mesh
    const hits = ray.intersectObject(phoneScreenMesh, false);
    if (hits.length > 0 && hits[0].uv) {
      return hits[0];
    }
    return null;
  }

  function hitPhone(e) {
    if (!phone) return false;
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, cam);
    return ray.intersectObject(phone, true).length > 0;
  }

  function hitTestChips(X, Y) {
    if (cur !== 2) return null;
    for (let c of activeChips) {
      if (X >= c.rect[0] && X <= c.rect[0] + c.rect[2] &&
          Y >= c.rect[1] && Y <= c.rect[1] + c.rect[3]) {
        return c;
      }
    }
    return null;
  }

  function isOverButton(X, Y) {
    return cta && X >= cta[0] && X <= cta[0] + cta[2] && Y >= cta[1] && Y <= cta[1] + cta[3];
  }

  function isOverDecline(X, Y) {
    return declineCta && X >= declineCta[0] && X <= declineCta[0] + declineCta[2] && Y >= declineCta[1] && Y <= declineCta[1] + declineCta[3];
  }

  // Interaction handlers — Gentle mouse hover parallax (No free drag 360 spinning)
  let mx = 0;
  let my = 0;
  let userHasClicked = false;
  let completedViaClicks = false;

  cv.addEventListener('pointermove', (e) => {
    const r = cv.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    my = ((e.clientY - r.top) / r.height) * 2 - 1;

    const hit = raycastScreen(e);
    if (hit) {
      const X = hit.uv.x * SW;
      const Y = (1 - hit.uv.y) * SH;
      const isHover = isOverButton(X, Y) || isOverDecline(X, Y) || hitTestChips(X, Y) !== null;
      cv.style.cursor = isHover ? 'pointer' : 'default';
    } else {
      cv.style.cursor = hitPhone(e) ? 'pointer' : 'default';
    }
  });

  cv.addEventListener('pointerleave', () => {
    mx = 0;
    my = 0;
    cv.style.cursor = 'default';
  });

  cv.addEventListener('pointerup', (e) => {
    const hit = raycastScreen(e);
    const hitP = hitPhone(e);
    if (!hit && !hitP) return;

    userHasClicked = true;

    if (hit) {
      const X = hit.uv.x * SW;
      const Y = (1 - hit.uv.y) * SH;

      // Check if chip was clicked in Step 2 (Upit)
      const clickedChip = hitTestChips(X, Y);
      if (clickedChip) {
        if (clickedChip.type === 'service') {
          userChoice.service = clickedChip.val;
        } else if (clickedChip.type === 'day') {
          userChoice.day = clickedChip.val;
          userChoice.dayFull = clickedChip.full;
        } else if (clickedChip.type === 'time') {
          userChoice.time = clickedChip.val;
        }
        // Immediately rewrite "Iza kulisa" card code line
        say(2, getStepCode(2), 0);
        stex.needsUpdate = true;
        return;
      }
    }

    // Button, call response or tapping screen advances to next step
    pressT = performance.now();
    setTimeout(() => {
      const next = cur < 7 ? cur + 1 : 7;
      setStep(next);
      if (next >= 7) {
        completedViaClicks = true;
        window.__putKupcaCompletedViaClicks = true;
        window.__putKupcaCompleted = true;
        // Seamlessly align scroll position to start of horizontal portfolio scroll
        const trigger = ScrollTrigger.getById('unified-showcase-trigger');
        if (trigger) {
          const journeyDur = window.__journeyDuration || (window.innerHeight * 3.5);
          const targetScrollY = trigger.start + journeyDur;
          if (window.scrollY < targetScrollY) {
            if (window.lenis) {
              window.lenis.scrollTo(targetScrollY, { immediate: true });
            } else {
              window.scrollTo({ top: targetScrollY, behavior: 'instant' });
            }
          }
        }
      }
    }, 180);
  });

  function setStep(i) {
    if (i === cur) return;
    cur = i;
    stepT = performance.now();
    const s = STEPS[i];

    const bnEl = document.getElementById('put-kupca-bn');
    if (bnEl) bnEl.textContent = (i + 1) + ' / 8';

    say(0, s.n, 0);
    say(1, s.d, 150);
    say(2, getStepCode(i), 380);

    const pbars = document.querySelectorAll('#put-kupca-pbar i');
    pbars.forEach((el, j) => {
      el.classList.toggle('on', j <= i);
    });
  }

  window.__setPutKupcaStep = setStep;
  window.addEventListener('keydown', (e) => {
    const r = track.getBoundingClientRect();
    if (r.top > 0 || r.bottom < window.innerHeight) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (cur < 7) {
        e.preventDefault();
        setStep(cur + 1);
        if (cur >= 7) completedViaClicks = true;
      }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (cur > 0) {
        e.preventDefault();
        setStep(cur - 1);
      }
    }
  });

  // Power-on IntersectionObserver (turns on when section first enters view)
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !on) {
        on = true;
        onT = performance.now();
      }
    });
  }, { threshold: 0.25 });
  obs.observe(cv);

  window.__animatePutKupcaEntrance = () => {
    if (!on) {
      on = true;
      onT = performance.now();
    }
  };

  // Poses for the 8 steps [rotation Y offset, rotation X offset in radians]
  const POSE = [
    [-0.18, 0.03],  // 0: Oglas (subtle 3D angle showcasing black titanium depth)
    [-0.10, 0.02],  // 1: Landing
    [0.00, 0.00],   // 2: Upit (stands straight facing user so chip selection is natural)
    [0.20, -0.02],  // 3: CRM (angles towards backstage card)
    [0.05, 0.01],   // 4: Prodaja (vibration step)
    [-0.10, 0.02],  // 5: Follow-up
    [0.18, -0.02],  // 6: Podaci
    [-0.14, 0.03]   // 7: Povratak
  ];

  let ry = 0;
  let rx = 0;

  function frame(now) {
    const pose = POSE[Math.max(0, cur)];

    // Call vibration in Step 4 (Prodaja)
    const shake = (cur === 4 && !reduce && ((now - stepT) % 1400) < 500)
      ? Math.sin(now / 22) * 0.02
      : 0;

    // Gentle mouse hover parallax (±7 deg max on Y, ±4.5 deg max on X, no free drag 360 spin)
    ry += (pose[0] + mx * 0.12 - ry) * 0.08;
    rx += (pose[1] - my * 0.08 - rx) * 0.08;

    // Face front screen directly towards camera (Math.PI + ry) with studio forward tilt (0.04 + rx)
    phone.rotation.y = Math.PI + ry;
    phone.rotation.x = 0.04 + rx;
    phone.rotation.z = shake;
    phone.position.y = -0.08 + (reduce ? 0 : Math.sin(now / 1600) * 0.04);

    drawScreen(now);
    renderer.render(scene, cam);
    renderTextScramble(now);

    requestAnimationFrame(frame);
  }

  resize();
  setStep(0);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(resize);
  }

  requestAnimationFrame(frame);
}

export function setPutKupcaStep(i) {
  window.__setPutKupcaStep?.(i);
}

export function animatePutKupcaEntrance() {
  window.__animatePutKupcaEntrance?.();
}
