/**
 * devicePortfolioStage.js — Orchestrates Unified Pinned Stage:
 * 1. Dual 3D Devices (Laptop on top, Phone below) with parallel scroll animation
 *    - Distinct spacing between devices (no overlap)
 *    - Text "Savršenstvo na svakom ekranu" fades out during scroll to give maximum breathing space
 * 2. Transition into "Naši projekti" with dynamic scroll-driven card wave animations
 * 3. Progressive SVG circuit line drawing connected to scroll
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DeviceShowcase } from './deviceShowcase.js';
import { renderHorizontalPortfolio, updateCircuitProgress, animatePortfolioCards } from './horizontalPortfolio.js';

gsap.registerPlugin(ScrollTrigger);

export function initDevicePortfolioStage() {
  const stage = document.querySelector('#devices');
  const motionTrack = document.querySelector('#unified-motion-track');
  const container = document.querySelector('#devices-3d-container');
  const canvas = document.querySelector('#devices-3d-canvas');
  const hintBtn = document.querySelector('#device-click-hint');
  const header = document.querySelector('.unified-showcase__header');
  const cardsTrack = document.querySelector('#portfolio-cards-track');

  if (!stage || !motionTrack || !container || !canvas) {
    console.warn('[devicePortfolioStage] Required elements not found');
    return;
  }

  // 1. Render Curtis Nguyen 9 project cards in iOS27 Liquid Glass style
  renderHorizontalPortfolio('#portfolio-cards-track');

  // 2. Initialize 3D Device Showcase (both devices stacked, parallel animations, bezel-less)
  const deviceShowcase = new DeviceShowcase('#devices-3d-container', '#devices-3d-canvas');

  // Pause Lenis smooth scroll while details modal is active so user can freely interact
  const origOpenModal = deviceShowcase.openModal.bind(deviceShowcase);
  const origCloseModal = deviceShowcase.closeModal.bind(deviceShowcase);
  deviceShowcase.openModal = (type) => {
    window.lenis?.stop();
    origOpenModal(type);
  };
  deviceShowcase.closeModal = () => {
    origCloseModal();
    window.lenis?.start();
  };

  // Wire up floating hint button click
  if (hintBtn) {
    hintBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deviceShowcase.openModal('laptop');
    });
  }

  // Compute travel distance for horizontal motion track
  const getTravelDistance = () => {
    return Math.max(0, motionTrack.scrollWidth - window.innerWidth);
  };

  // Pinned scroll height: device animation phase + horizontal portfolio travel
  const getScrollEnd = () => {
    const travelDist = getTravelDistance();
    return window.innerHeight * 1.35 + travelDist;
  };

  ScrollTrigger.create({
    id: 'unified-showcase-trigger',
    trigger: stage,
    start: 'top top',
    end: () => `+=${getScrollEnd()}`,
    pin: true,
    scrub: 0.8,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const travelDist = getTravelDistance();
      const devDuration = window.innerHeight * 1.35;
      const totalDist = devDuration + travelDist;
      // Phase 1 takes proportionally the duration needed for device opening/wake
      const phase1Ratio = Math.min(0.35, Math.max(0.18, devDuration / totalDist));

      const introHeader = document.querySelector('#portfolio-intro-header');

      if (self.progress <= phase1Ratio) {
        // ─── PHASE 1: Dual 3D Devices Opening & Header Fade-Out ───
        const devProg = self.progress / phase1Ratio;
        deviceShowcase.setDualDevicesScroll(devProg);

        // Keep motion track at origin
        gsap.set(motionTrack, { x: 0 });

        // Header text: initially visible, then fades out as devices open to give maximum room!
        if (header) {
          if (devProg <= 0.15) {
            header.style.opacity = '1';
            header.style.transform = 'translateX(-50%) translateY(0)';
          } else if (devProg <= 0.70) {
            const fadeP = (devProg - 0.15) / 0.55;
            header.style.opacity = String(Math.max(0, 1 - fadeP));
            header.style.transform = `translateX(-50%) translateY(${-35 * fadeP}px)`;
          } else {
            header.style.opacity = '0';
          }
        }

        // Hint button appears when devices are open
        if (devProg >= 0.65) {
          hintBtn?.classList.add('is-visible');
        } else {
          hintBtn?.classList.remove('is-visible');
        }

        // Reset portfolio intro header
        if (introHeader) {
          introHeader.style.opacity = '1';
          introHeader.style.transform = 'translateX(0)';
        }

        // Reset circuit line to starting card
        updateCircuitProgress(320);
      } else {
        // ─── PHASE 2: Horizontal Scroll into "Naši projekti" ───
        deviceShowcase.setDualDevicesScroll(1.0);
        hintBtn?.classList.remove('is-visible');
        if (header) header.style.opacity = '0';

        const horizProg = (self.progress - phase1Ratio) / (1.0 - phase1Ratio);
        const currentX = -horizProg * travelDist;
        gsap.set(motionTrack, { x: currentX });

        // Intro header "Naši projekti" smoothly slides and fades out as scroll proceeds
        if (introHeader) {
          const introFade = Math.max(0, 1 - horizProg * 3.5);
          introHeader.style.opacity = String(introFade);
          introHeader.style.transform = `translateX(${-horizProg * 120}px)`;
        }

        // Animate project cards dynamically on scroll (wave entrance)
        animatePortfolioCards();

        // Draw the dashed circuit line progressively across cards tied to scroll
        const revealedWidth = -currentX + window.innerWidth * 0.75;
        updateCircuitProgress(revealedWidth);
      }
    },
  });

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}
