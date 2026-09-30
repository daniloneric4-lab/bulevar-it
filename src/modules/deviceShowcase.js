/**
 * deviceShowcase.js — 3D Dual Device Showcase (Gaming Laptop on top & iPhone 15 Pro Max below)
 * 
 * Features:
 * - Natural upward opening laptop lid hinged at base (0 sideways tilt, symmetrical).
 * - Display face (+Y) faces viewer directly (+Z in world) with backlit titanium keyboard in front.
 * - Phone screen is 100% pitch black when closed/off, smoothly powers on OLED.
 * - Fixed Navbar, Header text, Laptop, and Phone are all clearly visible with zero overlap.
 * - Both screens run full, realistic multi-section websites that auto-scroll autonomously at an elegant pace.
 * - iPhone screen mesh has zero bezel clipping or jagged artifacts.
 * - Modal view: 3D model stands at 90° straight-on facing directly towards the viewer.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class DeviceShowcase {
  constructor(containerSelector, canvasSelector) {
    this.container = document.querySelector(containerSelector);
    this.canvas = document.querySelector(canvasSelector);

    if (!this.container || !this.canvas) {
      console.warn('[DeviceShowcase] Container or canvas not found');
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.loader = new GLTFLoader();

    this.laptopGroup = new THREE.Group();
    this.phoneGroup = new THREE.Group();
    this.laptopLidPivot = null;
    this.laptopScreenMesh = null;
    this.phoneScreenMesh = null;
    this.isLaptopLoaded = false;
    this.isPhoneLoaded = false;

    // Website Screen Canvases & Textures
    this.desktopMasterCanvas = null;
    this.desktopMasterCtx = null;
    this.desktopCanvas = null;
    this.desktopCtx = null;
    this.desktopTexture = null;
    this.desktopScrollY = 0;

    this.mobileMasterCanvas = null;
    this.mobileMasterCtx = null;
    this.mobileCanvas = null;
    this.mobileCtx = null;
    this.mobileTexture = null;
    this.mobileScrollY = 0;

    // Interaction & Animation
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.raycaster = new THREE.Raycaster();
    this.mouseCoords = new THREE.Vector2(-999, -999);
    this.isHoveringLaptop = false;
    this.isHoveringPhone = false;

    this.activeModal = null;
    this.activeDevice = 'laptop';
    this.scrollProgress = 0;
    this.currentDevProg = 0;
    this.phoneBaseRotY = Math.PI;
    this.phoneBaseRotX = 0.04;
    this.keyboardTexture = null;

    this.laptopBaseScale = 0.864; // Increased by 20% (from 0.72) for imposing desktop presence
    this.phoneBaseScale = 23.0;
    this.laptopRestY = -0.22;
    this.phoneRestY = -0.55;
    this.deviceSeparation = 7.8;
    this.targetLaptopY = this.laptopRestY;
    this.targetPhoneY = this.phoneRestY - this.deviceSeparation;

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLights();
    this.createScreenTextures();
    this.loadModels();
    this.bindEvents();
    this.animate();
  }

  setupScene() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();

    // Perspective camera positioned to frame devices centered with generous breathing space
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 8.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene.add(this.laptopGroup);
    this.scene.add(this.phoneGroup);

    // Initial Dual Device positions: Laptop on top, Phone below with reduced gap
    this.laptopGroup.position.set(0, this.targetLaptopY, 0);
    this.laptopGroup.scale.set(this.laptopBaseScale, this.laptopBaseScale, this.laptopBaseScale);
    this.laptopGroup.visible = true;

    this.phoneGroup.position.set(0, this.targetPhoneY, 0.4);
    this.phoneGroup.scale.set(this.phoneBaseScale, this.phoneBaseScale, this.phoneBaseScale);
    this.phoneGroup.visible = true;
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Key studio light (from high above, highlighting sleek black form without glare)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 9, 2);
    this.scene.add(keyLight);

    // Soft neutral fill light (eliminates harsh shadows, zero blue cast!)
    const fillLight = new THREE.DirectionalLight(0x71717a, 0.6);
    fillLight.position.set(-6, 2, 4);
    this.scene.add(fillLight);

    // Luxurious warm gold rim light from behind/top to catch the black chamfer edges
    const goldRimLight = new THREE.DirectionalLight(0xf0d9a0, 1.2);
    goldRimLight.position.set(0, 8, -4);
    this.scene.add(goldRimLight);

    // Subtle warm golden accent light from bottom-right to harmonize with gold branding
    const goldAccentLight = new THREE.DirectionalLight(0xf0d9a0, 0.6);
    goldAccentLight.position.set(4, -4, 4);
    this.scene.add(goldAccentLight);
  }

  createScreenTextures() {
    // 1. Desktop Master Website Canvas (1280 x 3600) — Full rich multi-section agency website
    this.desktopMasterCanvas = document.createElement('canvas');
    this.desktopMasterCanvas.width = 1280;
    this.desktopMasterCanvas.height = 3600;
    this.desktopMasterCtx = this.desktopMasterCanvas.getContext('2d');
    this.buildDesktopMasterWebsite();

    // Viewport Screen Canvas (1280 x 800)
    this.desktopCanvas = document.createElement('canvas');
    this.desktopCanvas.width = 1280;
    this.desktopCanvas.height = 800;
    this.desktopCtx = this.desktopCanvas.getContext('2d');
    this.desktopScrollY = 0;
    this.updateDesktopScreen(0);

    this.desktopTexture = new THREE.CanvasTexture(this.desktopCanvas);
    this.desktopTexture.minFilter = THREE.LinearFilter;
    this.desktopTexture.magFilter = THREE.LinearFilter;

    // 2. Mobile Master Website Canvas (720 x 4000) — Full rich mobile application experience
    this.mobileMasterCanvas = document.createElement('canvas');
    this.mobileMasterCanvas.width = 720;
    this.mobileMasterCanvas.height = 4000;
    this.mobileMasterCtx = this.mobileMasterCanvas.getContext('2d');
    this.buildMobileMasterWebsite();

    // Viewport Mobile Screen Canvas (720 x 1520)
    this.mobileCanvas = document.createElement('canvas');
    this.mobileCanvas.width = 720;
    this.mobileCanvas.height = 1520;
    this.mobileCtx = this.mobileCanvas.getContext('2d');
    this.mobileScrollY = 0;
    this.updateMobileScreen(0);

    this.mobileTexture = new THREE.CanvasTexture(this.mobileCanvas);
    this.mobileTexture.minFilter = THREE.LinearFilter;
    this.mobileTexture.magFilter = THREE.LinearFilter;

    // 3. Dark Titanium Backlit Keyboard Deck Texture
    this.keyboardTexture = this.createKeyboardTexture();
  }

  createKeyboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base chassis: deep pitch matte space black deck (matches chassis aluminum)
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, 1024, 512);

    // ─── 1. Centered Precision Glass Trackpad (Touchpad BELOW Keyboard towards front edge) ───
    // In Three.js CanvasTexture (flipY=true), Y=0..170 is FRONT (closest to user/palms)
    const tpW = 380, tpH = 145;
    const tpX = (1024 - tpW) / 2;
    const tpY = 22;

    ctx.fillStyle = '#090a0e';
    this.roundRect(ctx, tpX, tpY, tpW, tpH, 12, true, false);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, tpX, tpY, tpW, tpH, 12, false, true);

    // ─── 2. Recessed Keyboard Well (ABOVE Touchpad, extending towards screen hinge) ───
    // Y=190..490 is BACK (towards hinge and screen)
    const kX = 54, kY = 190, kW = 916, kH = 295, kR = 10;
    ctx.fillStyle = '#020304';
    this.roundRect(ctx, kX, kY, kW, kH, kR, true, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, kX, kY, kW, kH, kR, false, true);

    // Key rows arranged from touchpad (front) to hinge (screen):
    const keyRows = [
      { type: 'space', h: 40 },
      { count: 12, h: 36, gap: 6 },
      { count: 13, h: 36, gap: 6 },
      { count: 14, h: 36, gap: 6 },
      { count: 14, h: 36, gap: 6 },
      { count: 14, h: 26, gap: 6, isFn: true },
    ];

    let curY = kY + 12;
    keyRows.forEach((row) => {
      const availW = kW - 20;
      if (row.type === 'space') {
        const keyWidths = [65, 65, 75, 386, 75, 65, 65];
        let curX = kX + 10;
        keyWidths.forEach((kw) => {
          ctx.fillStyle = '#0d0f14';
          this.roundRect(ctx, curX, curY, kw, row.h, 4, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          this.roundRect(ctx, curX, curY, kw, row.h, 4, false, true);
          curX += kw + 7;
        });
        curY += row.h + 8;
      } else {
        const keyW = (availW - (row.count - 1) * row.gap) / row.count;
        for (let i = 0; i < row.count; i++) {
          const kx = kX + 10 + i * (keyW + row.gap);
          ctx.fillStyle = row.isFn ? '#080a0e' : '#0d0f14';
          this.roundRect(ctx, kx, curY, keyW, row.h, 4, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          this.roundRect(ctx, kx, curY, keyW, row.h, 4, false, true);

          // Subtle backlit golden key indicator
          ctx.fillStyle = 'rgba(240, 217, 160, 0.38)';
          ctx.fillRect(kx + keyW * 0.35, curY + row.h * 0.42, keyW * 0.3, 2);
        }
        curY += row.h + row.gap;
      }
    });

    const kTexture = new THREE.CanvasTexture(canvas);
    kTexture.colorSpace = THREE.SRGBColorSpace;
    kTexture.minFilter = THREE.LinearFilter;
    kTexture.magFilter = THREE.LinearFilter;
    return kTexture;
  }

  /**
   * Builds complete, long, rich agency website on desktop master canvas (1280 x 3600)
   */
  buildDesktopMasterWebsite() {
    const ctx = this.desktopMasterCtx;
    const w = 1280;
    const h = 3600;

    // Background: deep obsidian navy #080c14
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Ambient radial glow effects throughout the canvas
    const addGlow = (cx, cy, r, color) => {
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
      g.addColorStop(0, color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };

    addGlow(320, 380, 500, 'rgba(201, 160, 99, 0.16)');
    addGlow(1020, 750, 540, 'rgba(99, 102, 241, 0.15)');
    addGlow(280, 1400, 480, 'rgba(201, 160, 99, 0.14)');
    addGlow(980, 2050, 520, 'rgba(129, 140, 248, 0.14)');
    addGlow(350, 2750, 480, 'rgba(201, 160, 99, 0.14)');
    addGlow(900, 3250, 500, 'rgba(99, 102, 241, 0.15)');

    // ─── SECTION 1: HERO (y: 110 - 580) ───
    ctx.fillStyle = 'rgba(201, 160, 99, 0.14)';
    this.roundRect(ctx, 48, 120, 300, 34, 17, true, false);
    ctx.strokeStyle = 'rgba(240, 217, 160, 0.45)';
    this.roundRect(ctx, 48, 120, 300, 34, 17, false, true);
    ctx.fillStyle = '#F0D9A0';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('● DIGITAL DESIGN & CODE STUDIO 2026', 66, 142);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px "Space Grotesk", sans-serif';
    ctx.fillText('Gradimo digitalna iskustva', 48, 220);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('koja osvajaju tržište.', 48, 290);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.font = '400 19px "Inter", sans-serif';
    ctx.fillText('Bulevar.IT kreira ultra-brze sajtove, WebGL 3D interakcije i napredna softverska rešenja za lidere industrije.', 48, 345);

    // Hero Action Buttons
    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, 48, 385, 210, 52, 26, true, false);
    ctx.fillStyle = '#080c14';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('Započni projekat ↗', 80, 418);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.roundRect(ctx, 276, 385, 180, 52, 26, true, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.roundRect(ctx, 276, 385, 180, 52, 26, false, true);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Pogledaj radove ↓', 308, 418);

    // Live availability pill
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    this.roundRect(ctx, 48, 470, 290, 32, 16, true, false);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    this.roundRect(ctx, 48, 470, 290, 32, 16, false, true);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('● Dostupni za nove projekte u Q2 2026', 64, 491);

    // ─── SECTION 2: METRICS ROW (y: 620 - 790) ───
    const stats = [
      { num: '+240%', lbl: 'Rast prodaje klijenata' },
      { num: '< 0.6s', lbl: 'Vreme učitavanja stranica' },
      { num: '100/100', lbl: 'PageSpeed & Core Vitals' },
      { num: '35+', lbl: 'Realizovanih projekata' },
    ];
    stats.forEach((st, i) => {
      const sx = 48 + i * 296;
      ctx.fillStyle = 'rgba(17, 24, 39, 0.78)';
      this.roundRect(ctx, sx, 620, 276, 116, 18, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.roundRect(ctx, sx, 620, 276, 116, 18, false, true);

      ctx.fillStyle = '#F0D9A0';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText(st.num, sx + 22, 674);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.font = '500 13px "Inter", sans-serif';
      ctx.fillText(st.lbl, sx + 22, 706);
    });

    // ─── SECTION 3: SERVICES BENTO GRID (y: 840 - 1500) ───
    ctx.fillStyle = '#C9A063';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('////// NAŠE USLUGE', 48, 860);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Inženjering bez kompromisa', 48, 910);

    const services = [
      {
        tag: 'WEB DEVELOPMENT & 3D',
        title: 'High-End Web Razvoj & 3D WebGL',
        desc: 'Interaktivna 3D Three.js iskustva, fluidna GSAP fizika i 60 FPS performanse na svim platformama.',
        accent: '#F0D9A0',
      },
      {
        tag: 'MOBILE & RESPONSIVE',
        title: 'Native-Like Mobilne Aplikacije',
        desc: 'Savršena ergonomija na ekranima svih dimenzija sa PWA podrškom i offline keširanjem.',
        accent: '#818cf8',
      },
      {
        tag: 'AUTOMATION & SAAS',
        title: 'Automatizacija Poslovanja & CRM',
        desc: 'Pametna integracija sistema, AI agenti i automatizovani workflow procesi koji štede stotine sati.',
        accent: '#34d399',
      },
      {
        tag: 'SEO DOMINACIJA',
        title: 'Maksimalna Vidljivost & Core Vitals',
        desc: 'Dominacija na Google pretragama uz savršene Core Web Vitals ocene i trenutni LCP odziv.',
        accent: '#ec4899',
      },
    ];

    services.forEach((srv, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = 48 + col * 604;
      const by = 945 + row * 240;

      ctx.fillStyle = 'rgba(17, 24, 39, 0.88)';
      this.roundRect(ctx, bx, by, 580, 215, 20, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.roundRect(ctx, bx, by, 580, 215, 20, false, true);

      ctx.fillStyle = srv.accent;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText(srv.tag, bx + 28, by + 46);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.fillText(srv.title, bx + 28, by + 90);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.font = '400 15px "Inter", sans-serif';
      ctx.fillText(srv.desc, bx + 28, by + 132);

      ctx.fillStyle = srv.accent;
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText('Saznaj više ↗', bx + 28, by + 176);
    });

    // ─── SECTION 4: SELECTED WORK (y: 1560 - 2280) ───
    ctx.fillStyle = '#C9A063';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('////// IZDVOJENI RADOVI', 48, 1580);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Projekti koji donose milione', 48, 1630);

    const projs = [
      { name: "Petra's Stolovi", cat: 'PRODAJA STOLOVA', color: '#F0D9A0', stat: '+240% Prodaja', year: '2026' },
      { name: 'Brookie Nice', cat: 'NYC COOKIES', color: '#ec4899', stat: 'Fluid UX', year: '2026' },
      { name: 'Mango Event App', cat: 'WEB APLIKACIJA', color: '#818cf8', stat: '< 0.6s Load', year: '2025' },
    ];

    projs.forEach((p, idx) => {
      const px = 48 + idx * 396;
      const py = 1665;
      ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
      this.roundRect(ctx, px, py, 376, 430, 22, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.roundRect(ctx, px, py, 376, 430, 22, false, true);

      // Card image preview area
      const cgrad = ctx.createLinearGradient(px, py, px + 376, py + 230);
      cgrad.addColorStop(0, 'rgba(8, 12, 20, 0.96)');
      cgrad.addColorStop(1, p.color + '33');
      ctx.fillStyle = cgrad;
      this.roundRect(ctx, px + 16, py + 16, 344, 230, 16, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.roundRect(ctx, px + 16, py + 16, 344, 230, 16, false, true);

      ctx.fillStyle = p.color;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(p.cat, px + 24, py + 286);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(p.year, px + 376 - 65, py + 286);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.fillText(p.name, px + 24, py + 330);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "Inter", sans-serif';
      ctx.fillText('● ' + p.stat, px + 24, py + 378);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.fillText('↗', px + 376 - 44, py + 378);
    });

    // ─── SECTION 5: CLIENT TESTIMONIAL (y: 2240 - 2640) ───
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
    this.roundRect(ctx, 48, 2250, 1184, 280, 24, true, false);
    ctx.strokeStyle = 'rgba(201, 160, 99, 0.38)';
    this.roundRect(ctx, 48, 2250, 1184, 280, 24, false, true);

    ctx.fillStyle = '#F0D9A0';
    ctx.font = 'bold 64px serif';
    ctx.fillText('“', 90, 2330);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillText('Bulevar.IT je transformisao naš brend. Prodaja je skočila za 240% u prva dva meseca,', 140, 2330);
    ctx.fillText('a sajt radi besprekorno brzo na svim ekranima bez ijednog tehničkog zastoja.', 140, 2375);

    ctx.fillStyle = '#F0D9A0';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('Marko Petrović — Osnivač & CEO, Petra Design Group', 140, 2440);

    // ─── SECTION 6: TECH STACK BADGES (y: 2680 - 2960) ───
    ctx.fillStyle = '#C9A063';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('////// TEHNOLOŠKI EKOSISTEM', 48, 2690);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.fillText('Izgrađeno na modernim standardima', 48, 2735);

    const badges = ['Three.js WebGL', 'GSAP 3D Core', 'Lenis Smooth Scroll', 'Next.js App Router', 'TypeScript', 'Node.js Microservices'];
    badges.forEach((b, idx) => {
      const bx = 48 + (idx % 3) * 396;
      const by = 2770 + Math.floor(idx / 3) * 60;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      this.roundRect(ctx, bx, by, 376, 44, 12, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.roundRect(ctx, bx, by, 376, 44, 12, false, true);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText('⚡ ' + b, bx + 20, by + 28);
    });

    // ─── SECTION 7: FOOTER CTA (y: 3040 - 3600) ───
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px "Space Grotesk", sans-serif';
    ctx.fillText('Spremni da lansirate vaš projekat?', 48, 3120);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.font = '400 18px "Inter", sans-serif';
    ctx.fillText('Kontaktirajte nas danas za besplatnu analizu i ponudu u roku od 24h.', 48, 3175);

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, 48, 3215, 260, 56, 28, true, false);
    ctx.fillStyle = '#080c14';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('bulevarit@gmail.com ↗', 80, 3251);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(48, 3360, 1184, 1);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText('© 2026 Bulevar.IT — Sva prava zadržana. Novi Sad, Srbija.', 48, 3420);
  }

  /**
   * Updates viewport screen with content from master canvas at scrollY, with pinned navigation bar
   */
  updateDesktopScreen(scrollY = 0) {
    const ctx = this.desktopCtx;
    const w = 1280;
    const h = 800;

    // Blit from master canvas
    ctx.drawImage(this.desktopMasterCanvas, 0, scrollY, w, h, 0, 0, w, h);

    // Pinned Sticky Navigation Bar at top of screen
    ctx.fillStyle = 'rgba(8, 12, 20, 0.96)';
    ctx.fillRect(0, 0, w, 76);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 76);
    ctx.lineTo(w, 76);
    ctx.stroke();

    // Logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Space Grotesk", sans-serif';
    ctx.fillText('Bulevar', 48, 48);
    ctx.fillStyle = '#F0D9A0';
    ctx.fillText('.IT', 146, 48);

    // Nav Links
    ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
    ctx.font = '500 15px "Inter", sans-serif';
    ctx.fillText('O nama', 440, 46);
    ctx.fillText('Usluge', 550, 46);
    ctx.fillText('Portfolio', 660, 46);
    ctx.fillText('Kontakt', 770, 46);

    // CTA in nav
    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, 1040, 18, 192, 40, 20, true, false);
    ctx.fillStyle = '#080c14';
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillText('Započni projekat ↗', 1068, 43);
  }

  /**
   * Builds complete, long, rich mobile app experience on mobile master canvas (720 x 4000)
   */
  buildMobileMasterWebsite() {
    const ctx = this.mobileMasterCtx;
    const w = 720;
    const h = 4000;

    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Ambient glow
    const g = ctx.createRadialGradient(w / 2, 450, 20, w / 2, 450, 420);
    g.addColorStop(0, 'rgba(201, 160, 99, 0.18)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, 900);

    // ─── HERO (y: 180 - 580) ───
    ctx.fillStyle = 'rgba(201, 160, 99, 0.14)';
    this.roundRect(ctx, 28, 180, 270, 42, 21, true, false);
    ctx.strokeStyle = 'rgba(240, 217, 160, 0.42)';
    this.roundRect(ctx, 28, 180, 270, 42, 21, false, true);
    ctx.fillStyle = '#F0D9A0';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillText('● MOBILNA PERFEKCIJA', 48, 206);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px "Space Grotesk", sans-serif';
    ctx.fillText('Vrhunski sajt', 28, 285);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('u vašem džepu.', 28, 350);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.font = '400 22px "Inter", sans-serif';
    ctx.fillText('Brz, moderan i 100% fluidan.', 28, 412);

    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, 28, 456, w - 56, 72, 22, true, false);
    ctx.fillStyle = '#080c14';
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillText('Započni projekat ↗', w / 2 - 110, 501);

    // ─── METRICS ROW (y: 590 - 730) ───
    const mStats = [
      { n: '+240%', l: 'Prodaja' },
      { n: '< 0.6s', l: 'Brzina' },
      { n: '99.9%', l: 'Uptime' },
    ];
    mStats.forEach((ms, i) => {
      const mx = 28 + i * 224;
      ctx.fillStyle = 'rgba(17, 24, 39, 0.85)';
      this.roundRect(ctx, mx, 590, 210, 110, 18, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      this.roundRect(ctx, mx, 590, 210, 110, 18, false, true);

      ctx.fillStyle = '#F0D9A0';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText(ms.n, mx + 24, 645);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px "Inter", sans-serif';
      ctx.fillText(ms.l, mx + 24, 678);
    });

    // ─── MOBILE PROJECT CARDS (y: 760 - 2400) ───
    ctx.fillStyle = '#C9A063';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('////// IZDVOJENI PROJEKTI', 28, 770);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Radovi i aplikacije', 28, 820);

    const mCards = [
      { name: "Petra's Stolovi", type: 'PRODAJA STOLOVA', color: '#F0D9A0', stat: '+240% Prodaja' },
      { name: 'Brookie Nice', type: 'NYC COOKIES', color: '#ec4899', stat: 'Fluid UX' },
      { name: 'Mango Event App', type: 'WEB APLIKACIJA', color: '#818cf8', stat: '< 0.6s Load' },
      { name: 'Aero Logistics SaaS', type: 'SAAS PLATFORMA', color: '#34d399', stat: 'Real-time Sync' },
      { name: 'Boutique Hotel NS', type: 'BOOKING SISTEM', color: '#06b6d4', stat: 'Direktne Rezervacije' },
    ];

    mCards.forEach((mc, i) => {
      const my = 865 + i * 270;
      const cardW = w - 56;

      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
      this.roundRect(ctx, 28, my, cardW, 240, 24, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.roundRect(ctx, 28, my, cardW, 240, 24, false, true);

      ctx.fillStyle = mc.color;
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillText(mc.type, 52, my + 52);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px "Space Grotesk", sans-serif';
      ctx.fillText(mc.name, 52, my + 102);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.font = '400 18px "Inter", sans-serif';
      ctx.fillText('100% Mobile fluid UX & Retina grafika', 52, my + 148);

      ctx.fillStyle = '#F0D9A0';
      ctx.font = 'bold 17px "Inter", sans-serif';
      ctx.fillText('● ' + mc.stat, 52, my + 198);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('↗', cardW - 16, my + 198);
    });

    // ─── MOBILE SERVICES SECTION (y: 2460 - 3240) ───
    ctx.fillStyle = '#C9A063';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('////// NAŠE USLUGE', 28, 2490);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Kompletna rešenja', 28, 2540);

    const mServices = [
      { t: 'Custom Web & 3D', d: 'Sajtovi koji impresioniraju posetioce i pretvaraju ih u kupce.', c: '#F0D9A0' },
      { t: 'Mobilne Aplikacije', d: 'PWA rešenja sa brzinom nativnih aplikacija i trenutnim odzivom.', c: '#818cf8' },
      { t: 'AI Automatizacija', d: 'Povezivanje sistema i CRM baza za automatizaciju narudžbina.', c: '#34d399' },
    ];

    mServices.forEach((ms, i) => {
      const sy = 2580 + i * 200;
      ctx.fillStyle = 'rgba(17, 24, 39, 0.85)';
      this.roundRect(ctx, 28, sy, w - 56, 175, 20, true, false);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      this.roundRect(ctx, 28, sy, w - 56, 175, 20, false, true);

      ctx.fillStyle = ms.c;
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.fillText(ms.t, 52, sy + 56);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.font = '400 17px "Inter", sans-serif';
      ctx.fillText(ms.d, 52, sy + 104);
    });

    // ─── BOTTOM CTA & FOOTER (y: 3300 - 3900) ───
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
    this.roundRect(ctx, 28, 3320, w - 56, 280, 24, true, false);
    ctx.strokeStyle = 'rgba(201, 160, 99, 0.35)';
    this.roundRect(ctx, 28, 3320, w - 56, 280, 24, false, true);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Započnite projekat', 54, 3390);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText('bulevarit@gmail.com', 54, 3445);

    ctx.fillStyle = '#F0D9A0';
    ctx.font = 'bold 20px "Inter", sans-serif';
    ctx.fillText('+381 66 5852 052 ↗', 54, 3500);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillText('© 2026 Bulevar.IT — Sva prava zadržana.', 28, 3750);
  }

  /**
   * Updates viewport mobile screen with content from master canvas at scrollY, with pinned status bar & dock
   */
  updateMobileScreen(scrollY = 0) {
    const ctx = this.mobileCtx;
    const w = 720;
    const h = 1520;

    // Draw content from master canvas
    ctx.drawImage(this.mobileMasterCanvas, 0, scrollY, w, h, 0, 0, w, h);

    // Fixed iOS Header & Status Bar (pinned at top)
    ctx.fillStyle = 'rgba(8, 12, 20, 0.96)';
    ctx.fillRect(0, 0, w, 140);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(0, 140, w, 1);

    // Status Bar time (Real-time clock)
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillText(timeStr, 48, 54);

    // Dynamic Island Pill
    ctx.fillStyle = '#000000';
    this.roundRect(ctx, w / 2 - 85, 24, 170, 42, 21, true, false);

    // Icons: Signal, 5G, Battery
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px "Inter", sans-serif';
    ctx.fillText('5G', w - 140, 54);
    this.roundRect(ctx, w - 85, 34, 40, 22, 6, false, true);
    ctx.fillRect(w - 82, 37, 26, 16);

    // App Header Bar
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px "Space Grotesk", sans-serif';
    ctx.fillText('Bulevar', 36, 116);
    ctx.fillStyle = '#F0D9A0';
    ctx.fillText('.IT', 152, 116);

    // Hamburger icon
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w - 74, 94, 38, 4);
    ctx.fillRect(w - 74, 106, 38, 4);
    ctx.fillRect(w - 74, 118, 26, 4);

    // Fixed iOS Bottom Home Indicator Dock
    ctx.fillStyle = 'rgba(8, 12, 20, 0.92)';
    this.roundRect(ctx, 0, h - 70, w, 70, 0, true, false);
    ctx.fillStyle = '#FFFFFF';
    this.roundRect(ctx, w / 2 - 90, h - 28, 180, 6, 3, true, false);
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  loadModels() {
    // ─── 1. Premium Stealth Matte Black Materials for Laptop ───
    const laptopBlackAluminum = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x06070a), // Deep pitch matte space black
      roughness: 0.82,                  // True matte black anodized surface, absorbs shiny highlights
      metalness: 0.08,                  // Low specularity
      envMapIntensity: 0.4,
    });

    const laptopDarkTrim = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x030405), // Pitch stealth obsidian
      roughness: 0.75,
      metalness: 0.12,
    });

    const laptopVentMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x040506), // Air intake vents & speaker grills
      roughness: 0.75,
      metalness: 0.20,
    });

    // ─── 2. Apple Black Titanium Materials for iPhone 15 Pro Max ───
    const phoneTitaniumMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x18191d), // Natural Apple Black Titanium
      roughness: 0.35,
      metalness: 0.85,
    });

    // 1. Load Gaming Laptop
    this.loader.load(
      '/models/gaming_laptop.glb',
      (gltf) => {
        const model = gltf.scene;

        let lidNode = null;

        model.traverse((child) => {
          // Hide Object_18 (protruding camera notch / black box), Object_16 (old screen), Object_11 (touchpad duplicate)
          // Hide Object_19 (speckled hinge cylinders)
          if (
            child.name === 'Object_11' ||
            child.name === 'Object_16' ||
            child.name === 'Object_18' ||
            child.name === 'Object_19' ||
            child.material?.name === 'Material.012' ||
            child.name.toLowerCase().includes('notch') ||
            child.name.toLowerCase().includes('camera') ||
            child.material?.name === 'Material.013' ||
            child.material?.name === 'Material.011' ||
            child.material?.name === 'Material.010'
          ) {
            child.visible = false;
          }

          // Keyboard deck: dark precision backlit keyboard
          if (child.name === 'Object_7' || child.material?.name === 'Material.004') {
            child.material = new THREE.MeshStandardMaterial({
              map: this.keyboardTexture,
              metalness: 0.12,
              roughness: 0.85,
              envMapIntensity: 0.3,
            });
          }

          // Base chassis, lid outer shells, bezel casing: Stealth Space Black
          if (
            child.name === 'Object_4' ||
            child.name === 'Object_5' ||
            child.name === 'Object_8' ||
            child.name === 'Object_13' ||
            child.name === 'Object_14' ||
            child.name === 'Object_15' ||
            child.material?.name === 'Material.001' ||
            child.material?.name === 'Material.002' ||
            child.material?.name === 'Material.005' ||
            child.material?.name === 'Material.009' ||
            child.material?.name === 'Material'
          ) {
            child.material = laptopBlackAluminum;
          }

          // Air vent / speaker grills: subtle matte black
          if (child.name === 'Object_6' || child.material?.name === 'Material.003' || child.material?.name === 'Material.007') {
            child.material = laptopVentMaterial;
          }

          // Find lid root node in GLTF
          if (
            child.name === 'Cube003_2' ||
            child.name === 'Cube.003_2' ||
            child.name.toLowerCase().includes('cube003') ||
            child.name.toLowerCase().includes('cube.003') ||
            (child.name === 'Object_16' && child.parent)
          ) {
            lidNode = child.name === 'Object_16' ? child.parent : child;
          }
        });

        // Attach full-bleed edge-to-edge screen directly to lidNode with zero bezels:
        if (lidNode) {
          const screenWidth = 3.96;
          const screenHeight = 2.50;
          const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);

          // Rotate geometry so plane aligns with lid coordinate system:
          // Width along local Z, Height along local X, Normal along +Y (facing user)
          screenGeo.rotateZ(-Math.PI / 2);
          screenGeo.rotateX(-Math.PI / 2);

          const screenMat = new THREE.MeshBasicMaterial({
            map: this.desktopTexture,
            toneMapped: false,
            polygonOffset: true,
            polygonOffsetFactor: -2,
            polygonOffsetUnits: -2,
          });

          const screenMesh = new THREE.Mesh(screenGeo, screenMat);
          screenMesh.position.set(0.06, 0.10, 0);
          lidNode.add(screenMesh);
          this.laptopScreenMesh = screenMesh;

          const hinge = new THREE.Vector3(-1.1986, 0.0959, 0);
          const pivot = new THREE.Group();
          pivot.position.copy(hinge);

          lidNode.parent.add(pivot);
          lidNode.position.sub(hinge);
          pivot.add(lidNode);

          this.laptopLidPivot = pivot;
          // Set to current scroll progress (initially closed at 0)
          this.setLaptopOpen(0);
        }

        // Align laptop model so screen faces camera in 100% symmetrical horizontal 90° view
        const targetRight = new THREE.Vector3(1, 0, 0);
        const targetUp = new THREE.Vector3(0, 1, 0);
        const targetNormal = new THREE.Vector3(0, 0, 1);

        const localBasis = new THREE.Matrix4().makeBasis(
          new THREE.Vector3(0, 0, 1), // local Z = width
          new THREE.Vector3(1, 0, 0), // local X = height of lid
          new THREE.Vector3(0, 1, 0)  // local Y = screen display normal (facing camera!)
        );
        const targetBasis = new THREE.Matrix4().makeBasis(targetRight, targetUp, targetNormal);
        const modelMatrix = targetBasis.multiply(localBasis.invert());
        model.quaternion.setFromRotationMatrix(modelMatrix);

        this.laptopGroup.add(model);
        this.isLaptopLoaded = true;
        console.log('[DeviceShowcase] Laptop loaded as Stealth Space Black model & configured');
      },
      undefined,
      (err) => console.error('[DeviceShowcase] Failed to load laptop:', err)
    );

    // 2. Load iPhone 15 Pro Max
    this.loader.load(
      '/models/apple_iphone_15_pro_max_black.glb',
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            // Screen is Mesh 31 / Node 46 (xXDHkMplTIDAXLN) / Material 18 (pIJKfZsazmcpEiU)
            if (child.name === 'xXDHkMplTIDAXLN' || (child.material && child.material.name === 'pIJKfZsazmcpEiU')) {
              this.phoneScreenMesh = child;
              child.material = new THREE.MeshBasicMaterial({
                map: this.mobileTexture,
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
        this.phoneGroup.add(model);
        this.isPhoneLoaded = true;

        // Initially parked out of view with screen off
        this.setPhoneOpen(0);
        console.log('[DeviceShowcase] iPhone loaded as Black Titanium model & mapped cleanly');
      },
      undefined,
      (err) => console.error('[DeviceShowcase] Failed to load iPhone:', err)
    );
  }

  /**
   * Natural Laptop Lid Opening:
   * When progress = 0 (closed): lid is folded down flat onto keyboard base (+1.75 rad)
   * When progress = 1 (open): lid stands open upright at 90° (0 rad) facing the camera
   */
  setLaptopOpen(progress) {
    if (!this.laptopLidPivot) return;
    const closedAngle = 1.75;
    this.laptopLidPivot.rotation.z = closedAngle * (1.0 - progress);

    if (this.laptopScreenMesh && this.laptopScreenMesh.material) {
      if (progress <= 0.02) {
        this.laptopScreenMesh.visible = false;
        if (this.laptopScreenMesh.material.color) {
          this.laptopScreenMesh.material.color.setRGB(0, 0, 0);
        }
      } else {
        this.laptopScreenMesh.visible = true;
        const b = Math.min(1.0, Math.pow(progress / 0.65, 1.2));
        if (this.laptopScreenMesh.material.color) {
          this.laptopScreenMesh.material.color.setRGB(b, b, b);
        }
      }
    }
  }

  /**
   * Phone Turn & Screen Wake:
   * When progress <= 0.02: screen is 100% completely black / powered off
   * When progress > 0.02: smoothly turns front-facing and wakes up OLED screen
   */
  setPhoneOpen(progress) {
    this.phoneBaseRotY = Math.PI - 0.16 * (1.0 - progress);
    this.phoneBaseRotX = -0.08 * (1.0 - progress) + 0.04 * progress;
    if (this.phoneGroup) {
      this.phoneGroup.rotation.y = this.phoneBaseRotY;
      this.phoneGroup.rotation.x = this.phoneBaseRotX;
    }
    if (this.phoneScreenMesh && this.phoneScreenMesh.material) {
      if (progress <= 0.02) {
        this.phoneScreenMesh.visible = false;
        if (this.phoneScreenMesh.material.color) {
          this.phoneScreenMesh.material.color.setRGB(0, 0, 0);
        }
      } else {
        this.phoneScreenMesh.visible = true;
        const p = Math.max(0, (progress - 0.02) / 0.98);
        const brightness = Math.pow(p, 1.4);
        if (this.phoneScreenMesh.material.color) {
          this.phoneScreenMesh.material.color.setRGB(brightness, brightness, brightness);
        }
      }
    }
  }

  /**
   * Device Scroll Choreography:
   * Large gap (~5.4 units) so ONLY ONE device is visible on screen at any time:
   * - Progress [0.00, 0.35]: ONLY LAPTOP is centered at Y = 0. Phone is far below (Y = -5.4, off-screen).
   * - Progress (0.35, 0.65): Transition! Laptop glides UP out of view (0 -> +5.4), Phone glides UP into center (-5.4 -> 0).
   * - Progress (0.65, 1.00]: ONLY PHONE is centered at Y = 0. Laptop is far above (Y = +5.4, off-screen).
   */
  setDeviceScroll(progress) {
    if (this.activeModal) return;
    this.scrollProgress = progress;
    this.currentDevProg = progress;

    this.laptopGroup.visible = true;
    this.phoneGroup.visible = true;

    if (progress <= 0.35) {
      this.targetLaptopY = this.laptopRestY;
      this.targetPhoneY = this.phoneRestY - this.deviceSeparation;

      // Laptop lid opens smoothly on scroll:
      const laptopOpenP = Math.min(1.0, progress / 0.28);
      const smoothOpen = laptopOpenP < 0.5 ? 2 * laptopOpenP * laptopOpenP : 1 - Math.pow(-2 * laptopOpenP + 2, 2) / 2;
      this.setLaptopOpen(smoothOpen);
      this.setPhoneOpen(0);
    } else if (progress <= 0.65) {
      const t = (progress - 0.35) / 0.30;
      const smoothT = t * t * (3 - 2 * t);

      this.targetLaptopY = this.laptopRestY + smoothT * this.deviceSeparation;
      this.targetPhoneY = this.phoneRestY + (smoothT - 1) * this.deviceSeparation;

      this.setLaptopOpen(1.0);
      // Phone wakes up smoothly as it rises into view:
      this.setPhoneOpen(smoothT);
    } else {
      this.targetLaptopY = this.laptopRestY + this.deviceSeparation;
      this.targetPhoneY = this.phoneRestY;

      this.setLaptopOpen(1.0);
      this.setPhoneOpen(1.0);
    }
  }

  // Alias for backwards compatibility
  setDualDevicesScroll(progress) {
    this.setDeviceScroll(progress);
  }

  /**
   * Details Modal (3D model on the LEFT with live scrolling site, specs on the RIGHT)
   * The 3D model stands at 90° straight-on facing directly towards the viewer
   */
  openModal(type) {
    this.activeModal = type;
    this.activeDevice = type;

    const modal = document.getElementById('device-modal');
    const catEl = document.getElementById('modal-category');
    const titleEl = document.getElementById('modal-title');
    const leadEl = document.getElementById('modal-lead');
    const specsEl = document.getElementById('modal-specs');
    const switchLaptop = document.getElementById('modal-switch-laptop');
    const switchPhone = document.getElementById('modal-switch-phone');

    if (!modal) return;

    // Hide top navigation and section header while details modal is active
    document.body.classList.add('is-device-modal-open');
    const navEl = document.querySelector('.header') || document.querySelector('.nav-container') || document.querySelector('nav');
    const headerEl = document.querySelector('.unified-showcase__header');
    if (navEl) {
      navEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      navEl.style.opacity = '0';
      navEl.style.pointerEvents = 'none';
    }
    if (headerEl) {
      headerEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      headerEl.style.opacity = '0';
      headerEl.style.pointerEvents = 'none';
    }
    const hintBtn = document.getElementById('device-click-hint');
    if (hintBtn) {
      hintBtn.style.transition = 'opacity 0.25s ease, visibility 0.25s ease';
      hintBtn.style.opacity = '0';
      hintBtn.style.visibility = 'hidden';
      hintBtn.style.pointerEvents = 'none';
    }

    if (type === 'laptop') {
      // Position laptop prominent on the LEFT side, 90° flat facing viewer
      this.laptopGroup.position.set(-1.75, 0, 0);
      this.laptopGroup.rotation.set(0, 0, 0);
      this.laptopGroup.scale.set(1.08, 1.08, 1.08);
      this.laptopGroup.visible = true;
      this.phoneGroup.position.set(0, -50, 0); // park phone out of view
      this.phoneGroup.visible = false;
      this.setLaptopOpen(1.0);

      if (switchLaptop) switchLaptop.classList.add('is-active');
      if (switchPhone) switchPhone.classList.remove('is-active');

      if (catEl) catEl.textContent = '////// SUMMARY: DESKTOP PERFORMANCE';
      if (titleEl) titleEl.innerHTML = '100% Optimizovano za <span class="text-accent">Desktop i 4K ekrane</span>';
      if (leadEl) leadEl.textContent = 'Kreiramo desktop sajtove koji pružaju beskompromisno vizuelno i tehničko savršenstvo — od standardnih laptopa do 4K radnih stanica.';
      if (specsEl) {
        specsEl.innerHTML = `
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">60+ FPS</span>
            <span class="modal-spec-item__lbl">Hardverski ubrzane WebGL i GSAP animacije</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">&lt; 0.8s</span>
            <span class="modal-spec-item__lbl">Ultra-brzo prvo učitavanje i Core Web Vitals A+</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">0.00 CLS</span>
            <span class="modal-spec-item__lbl">Potpuno stabilan layout bez skokova</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">Zero-Bezel</span>
            <span class="modal-spec-item__lbl">100% popunjen ekran od ivice do ivice</span>
          </div>
        `;
      }
    } else {
      // Position phone prominent on the LEFT side, 90° flat facing viewer
      this.phoneGroup.position.set(-1.60, 0, 0.4);
      this.phoneGroup.rotation.set(0, Math.PI, 0);
      this.phoneGroup.scale.set(27.0, 27.0, 27.0);
      this.phoneGroup.visible = true;
      this.laptopGroup.position.set(0, 50, 0); // park laptop out of view
      this.laptopGroup.visible = false;
      this.setPhoneOpen(1.0);

      if (switchLaptop) switchLaptop.classList.remove('is-active');
      if (switchPhone) switchPhone.classList.add('is-active');

      if (catEl) catEl.textContent = '////// SUMMARY: MOBILE EXPERIENCE';
      if (titleEl) titleEl.innerHTML = 'Native-like brzina i <span class="text-accent">mobilna perfekcija</span>';
      if (leadEl) leadEl.textContent = 'Preko 70% posetilaca dolazi sa telefona. Naš inženjering obezbeđuje trenutni odziv, ergonomsku thumb navigaciju i prelepu Retina grafiku.';
      if (specsEl) {
        specsEl.innerHTML = `
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">Instant</span>
            <span class="modal-spec-item__lbl">Munjevit odziv na dodir bez čekanja</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">Thumb-Zone</span>
            <span class="modal-spec-item__lbl">Intuitivna navigacija prilagođena jednoj ruci</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">Retina 3x</span>
            <span class="modal-spec-item__lbl">Oštra vektorska grafika i kristalna tipografija</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-item__val">PWA Ready</span>
            <span class="modal-spec-item__lbl">Mogućnost instalacije kao mobilne aplikacije</span>
          </div>
        `;
      }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  closeModal() {
    this.activeModal = null;
    const modal = document.getElementById('device-modal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }

    // Restore top navigation and section header
    document.body.classList.remove('is-device-modal-open');
    const navEl = document.querySelector('.header') || document.querySelector('.nav-container') || document.querySelector('nav');
    const headerEl = document.querySelector('.unified-showcase__header');
    if (navEl) {
      navEl.style.opacity = '';
      navEl.style.pointerEvents = '';
    }
    if (headerEl) {
      headerEl.style.opacity = '';
      headerEl.style.pointerEvents = '';
    }
    const hintBtn = document.getElementById('device-click-hint');
    if (hintBtn) {
      hintBtn.style.opacity = '';
      hintBtn.style.visibility = '';
      hintBtn.style.pointerEvents = '';
    }

    // CRITICAL: Reset device X to 0 (exact horizontal center) so it is NOT left shifted to the left!
    if (this.laptopGroup) {
      this.laptopGroup.position.set(0, this.targetLaptopY, 0);
      this.laptopGroup.scale.set(this.laptopBaseScale, this.laptopBaseScale, this.laptopBaseScale);
      this.laptopGroup.rotation.set(0, 0, 0);
    }
    if (this.phoneGroup) {
      this.phoneGroup.position.set(0, this.targetPhoneY, 0.4);
      this.phoneGroup.scale.set(this.phoneBaseScale, this.phoneBaseScale, this.phoneBaseScale);
      this.phoneGroup.rotation.set(this.phoneBaseRotX, this.phoneBaseRotY, 0);
    }

    // Restore exact scroll stage positions
    this.setDeviceScroll(this.scrollProgress);
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize.bind(this));

    // Global mouse tracking so tilts work seamlessly both in scene and when modal is open
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      this.mouse.targetX = (x - 0.5) * 2;
      this.mouse.targetY = (y - 0.5) * 2;

      if (!this.activeModal && this.container) {
        const rect = this.container.getBoundingClientRect();
        this.mouseCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
      this.mouseCoords.set(-999, -999);
      if (this.container) this.container.style.cursor = 'default';
    });

    // Clicking active device opens the details modal
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('#device-modal') || e.target.closest('#device-click-hint')) return;
      if (this.isHoveringPhone && this.phoneGroup?.visible) {
        this.openModal('phone');
      } else {
        this.openModal('laptop');
      }
    });

    // Floating hint button
    const hintBtn = document.getElementById('device-click-hint');
    if (hintBtn) {
      hintBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal('laptop');
      });
    }

    // Modal internal switchers
    const modalSwitchLaptop = document.getElementById('modal-switch-laptop');
    const modalSwitchPhone = document.getElementById('modal-switch-phone');
    if (modalSwitchLaptop) {
      modalSwitchLaptop.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal('laptop');
      });
    }
    if (modalSwitchPhone) {
      modalSwitchPhone.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openModal('phone');
      });
    }

    // Modal close handlers
    const closeBtn = document.getElementById('device-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }
    const modalBackdrop = document.querySelector('.device-modal__backdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeModal());
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.closeModal();
      }
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    if (width < 768) {
      this.camera.position.set(0, 0, 11.2);
    } else if (width < 1024) {
      this.camera.position.set(0, 0, 9.6);
    } else {
      this.camera.position.set(0, 0, 8.2);
    }
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    const time = performance.now() * 0.001;

    if (this.activeModal) {
      // ─── Modal Mode: Device is on the LEFT, stands at 90° straight-on with subtle micro-parallax ───
      if (this.activeModal === 'laptop' && this.laptopGroup && this.laptopGroup.visible) {
        this.laptopGroup.rotation.y = this.mouse.x * 0.04;
        this.laptopGroup.rotation.x = -this.mouse.y * 0.03;
      } else if (this.activeModal === 'phone' && this.phoneGroup && this.phoneGroup.visible) {
        this.phoneGroup.rotation.y = Math.PI + this.mouse.x * 0.04;
        this.phoneGroup.rotation.x = -this.mouse.y * 0.03;
      }
    } else {
      // ─── Dual View Mode: Both devices visible with original spacing, gentle idle float & subtle mouse tilt ───
      if (this.laptopGroup && this.laptopGroup.visible) {
        const floatY = Math.sin(time * 1.4) * 0.015;
        this.laptopGroup.position.x = 0;
        this.laptopGroup.position.y = this.targetLaptopY + floatY;
        this.laptopGroup.rotation.y = this.mouse.x * 0.08;
        this.laptopGroup.rotation.x = -this.mouse.y * 0.06;
      }
      if (this.phoneGroup && this.phoneGroup.visible) {
        const floatY = Math.sin(time * 1.4 + 1.2) * 0.015;
        this.phoneGroup.position.x = 0;
        this.phoneGroup.position.y = this.targetPhoneY + floatY;
        this.phoneGroup.rotation.y = this.phoneBaseRotY + this.mouse.x * 0.10;
        this.phoneGroup.rotation.x = this.phoneBaseRotX - this.mouse.y * 0.06;
      }
    }

    // ─── Continuous Independent Auto-Scrolling of Full Websites on Both Devices ───
    const maxDesktopScroll = 3600 - 800; // 2800px
    this.desktopScrollY = (this.desktopScrollY + 0.55) % maxDesktopScroll;
    this.updateDesktopScreen(this.desktopScrollY);
    if (this.desktopTexture) this.desktopTexture.needsUpdate = true;

    const maxMobileScroll = 4000 - 1520; // 2480px
    this.mobileScrollY = (this.mobileScrollY + 0.70) % maxMobileScroll;
    this.updateMobileScreen(this.mobileScrollY);
    if (this.mobileTexture) this.mobileTexture.needsUpdate = true;

    // Raycast hover detection on active visible devices only
    if (!this.activeModal && this.camera && this.mouseCoords.x > -900) {
      this.raycaster.setFromCamera(this.mouseCoords, this.camera);
      const laptopHits = (this.laptopGroup && this.laptopGroup.visible)
        ? this.raycaster.intersectObjects(this.laptopGroup.children, true)
        : [];
      const phoneHits = (this.phoneGroup && this.phoneGroup.visible)
        ? this.raycaster.intersectObjects(this.phoneGroup.children, true)
        : [];

      this.isHoveringLaptop = laptopHits.length > 0;
      this.isHoveringPhone = phoneHits.length > 0;

      this.container.style.cursor = (this.isHoveringLaptop || this.isHoveringPhone) ? 'pointer' : 'default';
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
