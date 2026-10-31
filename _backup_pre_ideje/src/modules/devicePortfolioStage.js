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
import { renderHorizontalPortfolio, animatePortfolioCards, drawCircuitLines, updateCircuitProgress, computeRevealedX } from './horizontalPortfolio.js';

gsap.registerPlugin(ScrollTrigger);

export function initDevicePortfolioStage() {
  const stage = document.querySelector('#devices');
  const motionTrack = document.querySelector('#unified-motion-track');
  const container = document.querySelector('#devices-3d-container');
  const canvas = document.querySelector('#devices-3d-canvas');
  const hintBtn = document.querySelector('#device-click-hint');
  const header = document.querySelector('.unified-showcase__header');
  const cardsTrack = document.querySelector('#portfolio-cards-track');
  const sheet = document.querySelector('#contact-footer-sheet');

  if (!stage || !motionTrack || !container || !canvas) {
    console.warn('[devicePortfolioStage] Required elements not found');
    return;
  }

  // 1. Render Curtis Nguyen 9 project cards in iOS27 Liquid Glass style
  renderHorizontalPortfolio('#portfolio-cards-track');

  // 2. Initialize 3D Device Showcase (both devices stacked, parallel animations, bezel-less)
  const deviceShowcase = new DeviceShowcase('#devices-3d-container', '#devices-3d-canvas');
  window.__deviceShowcase = deviceShowcase;

  // Pause Lenis smooth scroll while details modal is active so user can freely interact
  const origOpenModal = deviceShowcase.openModal.bind(deviceShowcase);
  const origCloseModal = deviceShowcase.closeModal.bind(deviceShowcase);
  deviceShowcase.openModal = (type) => {
    window.lenis?.stop();
    hintBtn?.classList.remove('is-visible');
    origOpenModal(type);
  };
  deviceShowcase.closeModal = () => {
    origCloseModal();
    window.lenis?.start();
    const curProg = deviceShowcase.currentDevProg || 0;
    if (curProg >= 0.12 && curProg <= 0.88) {
      hintBtn?.classList.add('is-visible');
    }
  };

  // Wire up floating hint button click
  if (hintBtn) {
    hintBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentProg = deviceShowcase.currentDevProg || 0;
      if (currentProg >= 0.55) {
        deviceShowcase.openModal('phone');
      } else {
        deviceShowcase.openModal('laptop');
      }
    });
  }

  // 1. Device phase: window.innerHeight * 2.0
  // 2. Horizontal portfolio phase: calibrated exactly to the 9th project card (no dead empty void)
  const getDevDuration = () => window.innerHeight * 2.0;
  const getPortfolioTravel = () => {
    const cards = motionTrack.querySelectorAll('.curtis-card');
    const lastCard = cards[cards.length - 1];
    if (lastCard && cardsTrack) {
      const pane = document.querySelector('.portfolio-pane');
      const paneOffset = pane ? pane.offsetLeft : window.innerWidth;
      const lastCardEnd = paneOffset + lastCard.offsetLeft + lastCard.offsetWidth;
      return Math.max(window.innerWidth * 1.5, lastCardEnd);
    }
    return motionTrack.scrollWidth;
  };

  const getScrollEnd = () => {
    return getDevDuration() + getPortfolioTravel();
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
      const devDuration = getDevDuration();
      const portfolioTravel = getPortfolioTravel();
      const totalDist = devDuration + portfolioTravel;

      const phase1Ratio = devDuration / totalDist;

      const introHeader = document.querySelector('#portfolio-intro-header');

      const overlapWrap = document.querySelector('.overlap-wrap');

      if (self.progress <= phase1Ratio) {
        if (overlapWrap) {
          overlapWrap.style.opacity = '0';
          overlapWrap.style.pointerEvents = 'none';
        }

        // Synchronize active nav link to Responzivnost during 3D device showcase
        if (self.progress > 0.01) {
          window.__setActiveNavLink?.('devices');
        }

        // ─── PHASE 1: Dual 3D Devices Showcase (Laptop on top, Phone below) ───
        const devProg = self.progress / phase1Ratio;
        deviceShowcase.setDeviceScroll(devProg);

        // Keep motion track at origin
        gsap.set(motionTrack, { x: 0 });

        // Header text: visible during device demonstrations, fades as horizontal portfolio begins
        if (header) {
          if (devProg <= 0.85) {
            header.style.opacity = '1';
            header.style.transform = 'translateX(-50%) translateY(0)';
          } else {
            const fade = (devProg - 0.85) / 0.15;
            header.style.opacity = String(Math.max(0, 1 - fade));
            header.style.transform = `translateX(-50%) translateY(${-30 * fade}px)`;
          }
        }

        // Hint button visibility & dynamic proximity to active device
        if (hintBtn) {
          if (devProg >= 0.12 && devProg <= 0.88) {
            hintBtn.classList.add('is-visible');
            if (devProg >= 0.50) {
              hintBtn.classList.add('is-phone');
              hintBtn.classList.remove('is-laptop');
            } else {
              hintBtn.classList.add('is-laptop');
              hintBtn.classList.remove('is-phone');
            }
          } else {
            hintBtn.classList.remove('is-visible');
          }
        }

        // Portfolio intro header hidden during 3D device showcase
        if (introHeader) {
          introHeader.style.opacity = '0';
          introHeader.style.transform = 'none';
        }

        // Reset circuit line before horizontal portfolio begins (stops at Petra's)
        updateCircuitProgress(0);
      } else {
        // Synchronize active nav link to Portfolio during project cards
        if (self.progress < 0.95) {
          window.__setActiveNavLink?.('portfolio');
        }

        // ─── PHASE 2: Horizontal Scroll into "Naši radovi" ───
        deviceShowcase.setDeviceScroll(1.0);
        hintBtn?.classList.remove('is-visible');
        if (header) header.style.opacity = '0';

        const horizProg = (self.progress - phase1Ratio) / (1.0 - phase1Ratio);
        const currentX = -horizProg * portfolioTravel;
        gsap.set(motionTrack, { x: currentX });

        // "Naši radovi" intro header appears ONLY when projects actually begin entering (after phone slides away)
        // and cleanly fades out as the final card completes
        const projectsEntryProg = (window.innerWidth * 0.70) / portfolioTravel;
        if (introHeader) {
          if (horizProg < projectsEntryProg) {
            introHeader.style.opacity = '0';
          } else if (horizProg > 0.80) {
            const fadeOut = Math.max(0, 1 - (horizProg - 0.80) / 0.16);
            introHeader.style.opacity = String(fadeOut);
          } else {
            const headerIn = Math.min(1.0, (horizProg - projectsEntryProg) / 0.05);
            introHeader.style.opacity = String(headerIn);
          }
          introHeader.style.transform = 'none';
        }

        // Animate project cards dynamically on scroll (wave entrance)
        animatePortfolioCards();

        // Progressive circuit line drawing:
        // Stretches smoothly at uniform constant speed from Petra's Stolovi to Mango Event
        const revealedX = computeRevealedX(horizProg, portfolioTravel);
        updateCircuitProgress(revealedX);
        const circuitSvg = document.querySelector('.portfolio-circuit-svg');
        if (circuitSvg) {
          if (horizProg > 0.84) {
            circuitSvg.style.opacity = String(Math.max(0, 1 - (horizProg - 0.84) / 0.12));
          } else {
            circuitSvg.style.opacity = '1';
          }
        }

        // Section A ("Spremni da stvorimo nešto zajedno?") fades in cleanly right as Card 8 exits,
        // completely eliminating any empty void or delay
        if (overlapWrap) {
          if (horizProg < 0.90) {
            overlapWrap.style.opacity = '0';
            overlapWrap.style.pointerEvents = 'none';
          } else {
            const fadeIn = Math.min(1.0, (horizProg - 0.90) / 0.08);
            overlapWrap.style.opacity = String(fadeIn);
            overlapWrap.style.pointerEvents = fadeIn > 0.5 ? 'auto' : 'none';
          }
        }
      }
    },
  });

  // ─── PINNED OVERLAP-REVEAL: Section A pinned, Section B pulls up like a curtain ───
  initPinnedOverlapReveal();

  window.addEventListener('resize', () => {
    drawCircuitLines(cardsTrack);
    ScrollTrigger.refresh();
  });
}

/**
 * Pinned Overlap-Reveal Scroll Transition:
 * Section A stays pinned in place (fills viewport) while Section B
 * slides up from below and completely covers Section A like a curtain.
 */
export function initPinnedOverlapReveal() {
  const overlapWrap = document.querySelector('.overlap-wrap');
  const overlapA = document.querySelector('.overlap-a');
  const overlapB = document.querySelector('.overlap-b');

  if (!overlapWrap || !overlapA || !overlapB) return;

  // Section A stays pinned for 1 full viewport height while Section B
  // slides up naturally 1:1 from below, completely covering Section A.
  // Then normal scroll continues into Section B's content below the fold.
  ScrollTrigger.create({
    id: 'pinned-overlap-reveal',
    trigger: '.overlap-wrap',
    start: 'top top',
    end: () => `+=${window.innerHeight}`,
    scrub: true,
    pin: '.overlap-a',
    pinSpacing: false,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (self.progress > 0) {
        overlapWrap.style.opacity = '1';
        overlapWrap.style.pointerEvents = 'auto';
      }
    },
  });
}

