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
    this.phoneBaseRotY = Math.PI;
    this.phoneBaseRotX = 0.05;
    this.keyboardTexture = null;

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

    // Perspective camera positioned to frame both devices vertically stacked with generous breathing space
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, -0.10, 8.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.scene.add(this.laptopGroup);
    this.scene.add(this.phoneGroup);

    // Initial dual positions with generous gap between laptop and phone (~180px separation)
    this.laptopGroup.position.set(0, 0.75, 0);
    this.laptopGroup.scale.set(0.48, 0.48, 0.48);

    this.phoneGroup.position.set(0, -1.25, 0.4);
    this.phoneGroup.scale.set(11.5, 11.5, 11.5);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    // Key light
    const keyLight = new THREE.DirectionalLight(0xf5f8ff, 2.8);
    keyLight.position.set(5, 6, 7);
    this.scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x6380ff, 2.0);
    fillLight.position.set(-6, -2, 5);
    this.scene.add(fillLight);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
    rimLight.position.set(0, 5, -6);
    this.scene.add(rimLight);
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

    // Base chassis: deep anodized obsidian titanium
    ctx.fillStyle = '#0f141f';
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle brushed metal gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 512);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.12)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Recessed keyboard well
    const kX = 64, kY = 28, kW = 896, kH = 260, kR = 10;
    ctx.fillStyle = '#090c13';
    this.roundRect(ctx, kX, kY, kW, kH, kR, true, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, kX, kY, kW, kH, kR, false, true);

    // Keyboard rows
    const rows = [
      { count: 14, h: 26, gap: 5 },
      { count: 14, h: 34, gap: 5 },
      { count: 14, h: 34, gap: 5 },
      { count: 13, h: 34, gap: 5 },
      { count: 12, h: 34, gap: 5 },
      { count: 7,  h: 38, gap: 6, isBottom: true },
    ];

    let curY = kY + 10;
    rows.forEach((row) => {
      const availW = kW - 20;
      if (row.isBottom) {
        const keyWidths = [65, 65, 75, 360, 75, 65, 65];
        let curX = kX + 10;
        keyWidths.forEach((kw) => {
          ctx.fillStyle = '#141824';
          this.roundRect(ctx, curX, curY, kw, row.h, 4, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
          ctx.lineWidth = 1;
          this.roundRect(ctx, curX, curY, kw, row.h, 4, false, true);
          curX += kw + row.gap;
        });
      } else {
        const keyW = (availW - (row.count - 1) * row.gap) / row.count;
        for (let i = 0; i < row.count; i++) {
          const kx = kX + 10 + i * (keyW + row.gap);
          ctx.fillStyle = '#141824';
          this.roundRect(ctx, kx, curY, keyW, row.h, 4, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          this.roundRect(ctx, kx, curY, keyW, row.h, 4, false, true);

          ctx.fillStyle = 'rgba(245, 240, 230, 0.25)';
          ctx.fillRect(kx + keyW * 0.35, curY + row.h * 0.42, keyW * 0.3, 2);
        }
      }
      curY += row.h + row.gap;
    });

    // Centered Precision Glass Trackpad
    const tpW = 340, tpH = 180;
    const tpX = (1024 - tpW) / 2;
    const tpY = 305;
    ctx.fillStyle = '#0d111a';
    this.roundRect(ctx, tpX, tpY, tpW, tpH, 14, true, false);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.2;
    this.roundRect(ctx, tpX, tpY, tpW, tpH, 14, false, true);

    const kTexture = new THREE.CanvasTexture(canvas);
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

    addGlow(320, 380, 500, 'rgba(56, 189, 248, 0.14)');
    addGlow(1020, 750, 540, 'rgba(99, 102, 241, 0.15)');
    addGlow(280, 1400, 480, 'rgba(56, 189, 248, 0.12)');
    addGlow(980, 2050, 520, 'rgba(129, 140, 248, 0.14)');
    addGlow(350, 2750, 480, 'rgba(56, 189, 248, 0.12)');
    addGlow(900, 3250, 500, 'rgba(99, 102, 241, 0.15)');

    // ─── SECTION 1: HERO (y: 110 - 580) ───
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    this.roundRect(ctx, 48, 120, 300, 34, 17, true, false);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.38)';
    this.roundRect(ctx, 48, 120, 300, 34, 17, false, true);
    ctx.fillStyle = '#38bdf8';
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

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText(st.num, sx + 22, 674);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.font = '500 13px "Inter", sans-serif';
      ctx.fillText(st.lbl, sx + 22, 706);
    });

    // ─── SECTION 3: SERVICES BENTO GRID (y: 840 - 1500) ───
    ctx.fillStyle = '#38bdf8';
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
        accent: '#38bdf8',
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
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText('////// IZDVOJENI RADOVI', 48, 1580);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Projekti koji donose milione', 48, 1630);

    const projs = [
      { name: "Petra's Stolovi", cat: 'E-COMMERCE & 3D', color: '#38bdf8', stat: '+240% Prodaja', year: '2026' },
      { name: 'Brookie Nice', cat: 'FASHION STORE', color: '#ec4899', stat: 'Fluid UX', year: '2026' },
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
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    this.roundRect(ctx, 48, 2250, 1184, 280, 24, false, true);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 64px serif';
    ctx.fillText('“', 90, 2330);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 24px "Inter", sans-serif';
    ctx.fillText('Bulevar.IT je transformisao naš brend. Prodaja je skočila za 240% u prva dva meseca,', 140, 2330);
    ctx.fillText('a sajt radi besprekorno brzo na svim ekranima bez ijednog tehničkog zastoja.', 140, 2375);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillText('Marko Petrović — Osnivač & CEO, Petra Design Group', 140, 2440);

    // ─── SECTION 6: TECH STACK BADGES (y: 2680 - 2960) ───
    ctx.fillStyle = '#38bdf8';
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
    ctx.fillStyle = '#38bdf8';
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
    g.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, 900);

    // ─── HERO (y: 180 - 580) ───
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    this.roundRect(ctx, 28, 180, 270, 42, 21, true, false);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    this.roundRect(ctx, 28, 180, 270, 42, 21, false, true);
    ctx.fillStyle = '#38bdf8';
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

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillText(ms.n, mx + 24, 645);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px "Inter", sans-serif';
      ctx.fillText(ms.l, mx + 24, 678);
    });

    // ─── MOBILE PROJECT CARDS (y: 760 - 2400) ───
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('////// IZDVOJENI PROJEKTI', 28, 770);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Radovi i aplikacije', 28, 820);

    const mCards = [
      { name: "Petra's Stolovi", type: 'E-COMMERCE & 3D', color: '#38bdf8', stat: '+240% Prodaja' },
      { name: 'Brookie Nice', type: 'FASHION STORE', color: '#ec4899', stat: 'Fluid UX' },
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

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 17px "Inter", sans-serif';
      ctx.fillText('● ' + mc.stat, 52, my + 198);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px "Inter", sans-serif';
      ctx.fillText('↗', cardW - 16, my + 198);
    });

    // ─── MOBILE SERVICES SECTION (y: 2460 - 3240) ───
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.fillText('////// NAŠE USLUGE', 28, 2490);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Kompletna rešenja', 28, 2540);

    const mServices = [
      { t: 'Custom Web & 3D', d: 'Sajtovi koji impresioniraju posetioce i pretvaraju ih u kupce.', c: '#38bdf8' },
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
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    this.roundRect(ctx, 28, 3320, w - 56, 280, 24, false, true);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText('Započnite projekat', 54, 3390);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
    ctx.font = '400 20px "Inter", sans-serif';
    ctx.fillText('bulevarit@gmail.com', 54, 3445);

    ctx.fillStyle = '#38bdf8';
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

    // Status Bar time
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Inter", sans-serif';
    ctx.fillText('9:41', 48, 54);

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
    ctx.fillStyle = '#38bdf8';
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
    // 1. Load Gaming Laptop
    this.loader.load(
      '/models/gaming_laptop.glb',
      (gltf) => {
        const model = gltf.scene;

        let lidNode = null;

        model.traverse((child) => {
          // Hide Object_18 (protruding camera notch / black box), Object_16 (old screen), Object_11 (touchpad duplicate)
          if (
            child.name === 'Object_11' ||
            child.name === 'Object_16' ||
            child.name === 'Object_18' ||
            child.name.toLowerCase().includes('notch') ||
            child.name.toLowerCase().includes('camera') ||
            child.material?.name === 'Material.013' ||
            child.material?.name === 'Material.011' ||
            child.material?.name === 'Material.010'
          ) {
            child.visible = false;
          }

          // Keyboard deck: backlit titanium keyboard
          if (child.name === 'Object_7' || child.material?.name === 'Material.004') {
            child.material = new THREE.MeshStandardMaterial({
              map: this.keyboardTexture,
              metalness: 0.35,
              roughness: 0.45,
            });
          }

          // Hinge cylinder: obsidian titanium
          if (child.name === 'Object_19' || child.material?.name === 'Material.012') {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x181e2b,
              metalness: 0.85,
              roughness: 0.25,
            });
          }

          // Base trims: sleek dark aluminum
          if (child.name === 'Object_4' || child.name === 'Object_5' || child.name === 'Object_8') {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x121722,
              metalness: 0.8,
              roughness: 0.3,
            });
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
          this.setLaptopOpen(this.scrollProgress);
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
        console.log('[DeviceShowcase] Laptop loaded & natural front-facing hinge opening configured');
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
              // Keep original scale (1.0) to eliminate bezel clipping and jagged glitch lines!
              child.scale.set(1.0, 1.0, 1.0);
            }
          }
        });

        // Model internal rotation is 0 so phoneGroup controls orientation without double-flip
        model.rotation.set(0, 0, 0);

        this.phoneGroup.add(model);
        // Initially set phone screen 100% black / off at 0
        this.setPhoneOpen(this.scrollProgress);

        console.log('[DeviceShowcase] iPhone loaded & screen mapped cleanly without glitch');
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
  }

  /**
   * Phone Turn & Screen Wake:
   * When progress <= 0.02: screen is 100% completely black / powered off
   * When progress > 0.02: smoothly turns front-facing and wakes up OLED screen
   */
  setPhoneOpen(progress) {
    this.phoneBaseRotY = Math.PI - 0.20 * (1.0 - progress);
    this.phoneBaseRotX = -0.10 * (1.0 - progress) + 0.05 * progress;
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
   * Dual Devices Parallel Scroll Animation:
   * Outer scroll drives device opening/wake, while screen websites scroll autonomously
   */
  setDualDevicesScroll(progress) {
    if (this.activeModal) return;
    this.scrollProgress = progress;

    // 1. Parallel Laptop Lid Opening (swings naturally upward from keyboard base)
    this.setLaptopOpen(progress);

    // 2. Parallel Phone Screen Power-On & Wake (from 100% black to OLED vibrant)
    this.setPhoneOpen(progress);
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

    if (type === 'laptop') {
      // Position laptop prominent on the LEFT side, 90° flat facing viewer
      this.laptopGroup.position.set(-1.85, 0, 0);
      this.laptopGroup.rotation.set(0, 0, 0);
      this.laptopGroup.scale.set(0.85, 0.85, 0.85);
      this.phoneGroup.position.set(0, -50, 0); // park phone out of view
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
      this.phoneGroup.position.set(-1.65, 0, 0.4);
      this.phoneGroup.rotation.set(0, Math.PI, 0);
      this.phoneGroup.scale.set(22.0, 22.0, 22.0);
      this.laptopGroup.position.set(0, 50, 0); // park laptop out of view
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

    // Reset back to dual view: Laptop on top, Phone below (with ~180px distinct gap)
    if (this.laptopGroup) {
      this.laptopGroup.position.set(0, 0.75, 0);
      this.laptopGroup.scale.set(0.48, 0.48, 0.48);
      this.laptopGroup.rotation.set(0, 0, 0);
      this.setLaptopOpen(this.scrollProgress);
    }
    if (this.phoneGroup) {
      this.phoneGroup.position.set(0, -1.25, 0.4);
      this.phoneGroup.scale.set(11.5, 11.5, 11.5);
      this.setPhoneOpen(this.scrollProgress);
    }
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

    // Clicking either device opens the details modal
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('#device-modal') || e.target.closest('#device-click-hint')) return;
      if (this.isHoveringLaptop) {
        this.openModal('laptop');
      } else if (this.isHoveringPhone) {
        this.openModal('phone');
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
      this.camera.position.set(0, -0.15, 10.8);
    } else if (width < 1024) {
      this.camera.position.set(0, -0.12, 9.2);
    } else {
      this.camera.position.set(0, -0.10, 8.2);
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
      if (this.activeModal === 'laptop' && this.laptopGroup) {
        this.laptopGroup.rotation.y = this.mouse.x * 0.04;
        this.laptopGroup.rotation.x = -this.mouse.y * 0.03;
      } else if (this.activeModal === 'phone' && this.phoneGroup) {
        this.phoneGroup.rotation.y = Math.PI + this.mouse.x * 0.04;
        this.phoneGroup.rotation.x = -this.mouse.y * 0.03;
      }
    } else {
      // ─── Dual View Mode: Both devices visible with clear ~180px gap, gentle idle float & subtle mouse tilt ───
      if (this.laptopGroup) {
        this.laptopGroup.position.y = 0.75 + Math.sin(time * 1.4) * 0.015;
        this.laptopGroup.rotation.y = this.mouse.x * 0.08;
        this.laptopGroup.rotation.x = -this.mouse.y * 0.06;
      }
      if (this.phoneGroup) {
        this.phoneGroup.position.y = -1.25 + Math.sin(time * 1.4 + 1.2) * 0.015;
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

    // Raycast hover detection (only if not in modal)
    if (!this.activeModal && this.camera && this.mouseCoords.x > -900) {
      this.raycaster.setFromCamera(this.mouseCoords, this.camera);
      const laptopHits = this.raycaster.intersectObjects(this.laptopGroup.children, true);
      const phoneHits = this.raycaster.intersectObjects(this.phoneGroup.children, true);

      this.isHoveringLaptop = laptopHits.length > 0;
      this.isHoveringPhone = phoneHits.length > 0;

      this.container.style.cursor = (this.isHoveringLaptop || this.isHoveringPhone) ? 'pointer' : 'default';
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
