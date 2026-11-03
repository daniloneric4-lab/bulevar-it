/**
 * main.js — Entry point for Bulevar.IT website
 * 
 * Initializes:
 * 1. Lenis smooth scroll
 * 2. GSAP + ScrollTrigger
 * 3. ScrollVideo (hero frame sequence)
 * 4. All section animations
 * 5. Portfolio rendering
 * 6. Navigation
 * 7. Contact form
 */

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Styles (Vite injects CSS via JS import)
import './styles/index.css';

import { initHeroOnama } from './modules/heroOnama.js';
import { initScrollAnimations } from './modules/animations.js';
import { initIdeje } from './modules/ideje.js';
import { initOwnJourney } from './modules/ownJourney.js';

import { initDevicePortfolioStage } from './modules/devicePortfolioStage.js';
import { initKakoRazmisljamo } from './modules/kakoRazmisljamo.js';
import { initSistemIzaEkrana } from './modules/sistemIzaEkrana.js';
import { initNav, handleUrlLandingRoute } from './modules/nav.js';
import { initKontaktFooter } from './modules/kontaktFooter.js';
import { initI18n } from './modules/i18n.js';
import { initWorkGlassBox } from './modules/workGlassBox.js';
import { initScrollHint } from './modules/scrollHint.js';

// ─── Register GSAP plugins ───
gsap.registerPlugin(ScrollTrigger);

// Prevent mobile URL bar resize jitter
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
});

// ─── Detect mobile ───
const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

// ─── Lenis smooth scroll ───
// syncTouch enables butter-smooth, controlled touch scrolling on mobile.
// touchMultiplier: 1.25 gives responsive and comfortable finger scroll travel without feeling stiff.
// touchInertiaExponent: 1.5 allows natural momentum without abrupt braking.
// autoResize: true automatically monitors document resize so scroll limits never truncate content.
const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  syncTouch: true,
  syncTouchLerp: 0.085,
  touchInertiaExponent: 1.5,
  touchMultiplier: 1.25,
  autoResize: true
});

lenis.resize();

let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
let lastHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
let resizeDebounce;
window.addEventListener('resize', () => {
  clearTimeout(resizeDebounce);
  resizeDebounce = setTimeout(() => {
    lenis.resize();
    const heightChanged = window.innerWidth > 768 && window.innerHeight !== lastHeight;
    if (window.innerWidth !== lastWidth || heightChanged) {
      lastHeight = window.innerHeight;
      lastWidth = window.innerWidth;
      ScrollTrigger.refresh();
    }
  }, 200);
}, { passive: true });

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    lastWidth = window.innerWidth;
    lenis.resize();
    ScrollTrigger.refresh();
  }, 300);
});

// Connect Lenis to GSAP ScrollTrigger
window.lenis = lenis;
window.ScrollTrigger = ScrollTrigger;
lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.addEventListener('refresh', () => lenis.resize());

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Disable lag smoothing for Lenis to avoid artificial time-skip jumps
gsap.ticker.lagSmoothing(0);

// ─── Initialize everything in top-to-bottom DOM order ───
async function init() {
  // 0. Language / i18n
  initI18n('main');

  // Navigation
  initNav();

  // 1. Hero Laptop Video Scrub & 2. O nama Dot Figures
  initHeroOnama();

  // 1.8 Ideje & Usluge — Unified 900vh Continuous Particle Stage (ideje-usluge.html)
  initIdeje();

  // 1.9 Own your customer journey — 3D Interactive Customer Journey & Portal Stage
  initOwnJourney();

  // 2. Section animations
  initScrollAnimations();

  // 4. 3D Devices & Horizontal Portfolio Pinned Stage
  initDevicePortfolioStage();

  // 4.1 Section 06 Portfolio Glass Boxes & Case Study Dialog Modal
  initWorkGlassBox();

  // 4.5 Kako razmišljamo — Pinned 7-step Staircase & Decode Text
  initKakoRazmisljamo();

  // 4.6 Sistem iza ekrana — 3D Laptop & Layer Cards Fan
  initSistemIzaEkrana();

  // 5. Contact form & Animated Logo Footer
  initKontaktFooter();
  initScrollHint(lenis);

  // 6. Sort and refresh GSAP ScrollTrigger & Lenis to ensure all trigger ranges are strictly ordered
  lenis.resize();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  // Deep-link landing routing (executed strictly after all ScrollTriggers are calculated)
  handleUrlLandingRoute(true);

  // Refresh ScrollTrigger when all fonts and window assets have settled to avoid any jump
  window.addEventListener('load', () => {
    lenis.resize();
    ScrollTrigger.refresh();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      lenis.resize();
      ScrollTrigger.refresh();
    });
  }

  // Log ready state
  console.log(
    '%c Bulevar.IT %c Sajt učitan ✓ ',
    'background: linear-gradient(90deg, #C9A063, #F0D9A0); color: #1D2337; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
    'background: #1D2337; color: #F5F0E6; padding: 4px 8px; border-radius: 0 4px 4px 0;'
  );
}

// ─── DOM Ready ───
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init().catch(console.error);
  });
} else {
  init().catch(console.error);
}
