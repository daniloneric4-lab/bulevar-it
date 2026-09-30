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

import { ScrollVideo } from './modules/ScrollVideo.js';
import { initHeroAnimations, initScrollAnimations, initServicesReveal } from './modules/animations.js';
import { initAboutParallax } from './modules/aboutParallax.js';
import { DotGrid } from './modules/dotGrid.js';
import { initDevicePortfolioStage } from './modules/devicePortfolioStage.js';
import { initNav } from './modules/nav.js';
import { initContactForm } from './modules/contact.js';

// ─── Register GSAP plugins ───
gsap.registerPlugin(ScrollTrigger);

// ─── Detect mobile ───
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// ─── Lenis smooth scroll ───
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easeOutExpo
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});

// Connect Lenis to GSAP ScrollTrigger
window.lenis = lenis;
window.ScrollTrigger = ScrollTrigger;
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ─── Hero ScrollVideo ───
async function initHero() {
  // Desktop: 1080p optimized frames (101 WebP), Mobile: 720p (121 WebP, skip alternate)
  const frameConfig = isMobile
    ? { folder: '/frames/hero-720/', count: 121, prefix: 'frame_', ext: '.webp' }
    : { folder: '/frames/hero-opt/', count: 101, prefix: 'frame_', ext: '.webp' };

  const scrollVideo = new ScrollVideo(
    '#hero-video',
    frameConfig.folder,
    frameConfig.count,
    frameConfig.prefix,
    frameConfig.ext
  );

  // Preload frames with batch loading
  // Desktop: all frames in batches of 15
  // Mobile: skip every other frame, batches of 10
  await scrollVideo.preload(
    isMobile,           // skipAlternate
    isMobile ? 10 : 15, // batchSize
    (loaded, total) => {
      // Optional: could update a loading indicator here
      if (loaded === total) {
        console.log(`[Hero] All ${total} frames loaded`);
      }
    }
  );

  // Set up hero headline animation timeline
  const heroTl = initHeroAnimations();

  // GSAP ScrollTrigger for hero pinning + frame scrubbing
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: '+=300%',
    pin: true,
    scrub: 0.3,
    onUpdate: (self) => {
      // Map scroll progress to video frames
      scrollVideo.update(self.progress);

      // Trigger hero text animation at 60% progress
      if (heroTl && self.progress >= 0.6 && self.progress <= 0.85) {
        const textProgress = (self.progress - 0.6) / 0.25; // 0 to 1 within 60-85%
        heroTl.progress(textProgress);
      } else if (heroTl && self.progress < 0.6) {
        heroTl.progress(0);
      } else if (heroTl && self.progress > 0.85) {
        heroTl.progress(1);
      }
    },
  });
}

// ─── Initialize everything in top-to-bottom DOM order ───
async function init() {
  // Navigation
  initNav();

  // 1. Hero scroll video (pinned for 300% until laptop fully opens)
  await initHero();

  // 1.5 Pinned "O nama" Parallax Section (Boon-style 4-layer scroll separation)
  initAboutParallax();

  // 2. Services DotGrid Canvas
  const dotGrid = new DotGrid('#services-dots', '#services-stage');

  // 3. Section animations and Circle-Reveal
  initScrollAnimations();
  initServicesReveal(dotGrid);

  // 4. 3D Devices & Horizontal Portfolio Pinned Stage
  initDevicePortfolioStage();

  // 5. Contact form
  initContactForm();

  // 6. Sort and refresh GSAP ScrollTrigger to ensure all trigger ranges are strictly ordered
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

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
