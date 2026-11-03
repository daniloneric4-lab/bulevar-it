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

  if (!stage || !motionTrack || !cardsTrack) {
    console.warn('[devicePortfolioStage] Required elements not found');
    return;
  }

  // 1. Render Curtis Nguyen 9 project cards in iOS27 Liquid Glass style
  renderHorizontalPortfolio('#portfolio-cards-track');

  // Draw SVG circuit lines for portfolio cards
  setTimeout(() => {
    drawCircuitLines(cardsTrack);
  }, 120);

  // 2. Hide optional elements if present
  if (container) {
    container.style.display = 'none';
  }
  if (hintBtn) {
    hintBtn.style.display = 'none';
  }
  if (header) {
    header.style.display = 'none';
  }

  const getVsWidth = () => {
    const vsPane = document.querySelector('#vs-pane');
    return vsPane ? vsPane.offsetWidth : window.innerWidth;
  };

  const getCardsTravel = () => {
    const cards = cardsTrack.querySelectorAll('.curtis-card');
    const lastCard = cards[cards.length - 1];
    if (lastCard && cardsTrack) {
      const lastCardEnd = lastCard.offsetLeft + lastCard.offsetWidth;
      const isMobile = window.innerWidth <= 768;
      // Čim nestane linija, sekcija Kako razmišljamo kreće da se penje bez praznog hoda
      const exitMargin = isMobile ? 60 : 100;
      return Math.max(window.innerWidth * 0.4, lastCardEnd + exitMargin - window.innerWidth);
    }
    return Math.max(window.innerWidth * 0.4, cardsTrack.scrollWidth - window.innerWidth);
  };

  const getTotalTravel = () => {
    return getVsWidth() + getCardsTravel();
  };

  // Udoban hold na #vs (1.0 visina ekrana) da korisnik u miru pročita poređenje bez ikakvog preskakanja
  const getHoldVs = () => Math.round(window.innerHeight * 1.0);
  // Čim nestane linija sekcija Kako razmišljamo odmah kreće da se penje gore (bez tolikog čekanja) za oba (desktop i mobile)
  const getHoldEnd = () => 0;

  const getScrollEnd = () => {
    return getHoldVs() + getTotalTravel() + getHoldEnd();
  };

  function updateStageHeight() {
    const totalDist = getScrollEnd();
    stage.style.height = `${totalDist + window.innerHeight}px`;
  }

  updateStageHeight();
  requestAnimationFrame(() => {
    updateStageHeight();
    ScrollTrigger.refresh();
  });

  ScrollTrigger.create({
    id: 'unified-showcase-trigger',
    trigger: stage,
    start: 'top top',
    end: 'bottom bottom',
    pin: false, // 100% Native CSS position: sticky — eliminiše sve pin-spacere, skokove, teleporte i padanje radova!
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const totalDist = getScrollEnd();
      const holdVs = getHoldVs();
      const totalTravel = getTotalTravel();
      const vsW = getVsWidth();
      const scrollPx = self.progress * totalDist;

      let currentX = 0;
      let moved = 0;
      if (scrollPx > holdVs) {
        moved = Math.min(totalTravel, scrollPx - holdVs);
        currentX = -moved;
      }
      gsap.set(motionTrack, { x: currentX });
      window.__updateOjswVis?.();

      if (moved < vsW * 0.45) {
        window.__setActiveNavLink?.('put-kupca');
      } else if (self.progress < 0.96) {
        window.__setActiveNavLink?.('portfolio');
      }

      let cardProgress = 0;
      const cardsTravel = totalTravel - vsW;
      if (moved > vsW && cardsTravel > 0) {
        cardProgress = Math.min(1.0, (moved - vsW) / cardsTravel);
      }

      const introHeader = document.querySelector('#portfolio-intro-header');
      if (introHeader) {
        if (cardProgress > 0.90) {
          const fadeOut = Math.max(0, 1 - (cardProgress - 0.90) / 0.10);
          introHeader.style.opacity = String(fadeOut);
        } else {
          introHeader.style.opacity = '1';
        }
        introHeader.style.transform = 'none';
      }

      animatePortfolioCards();

      const revealedX = computeRevealedX(cardProgress, cardsTravel);
      updateCircuitProgress(revealedX);
      const circuitSvg = document.querySelector('.portfolio-circuit-svg');
      if (circuitSvg) {
        if (cardProgress > 0.90) {
          circuitSvg.style.opacity = String(Math.max(0, 1 - (cardProgress - 0.90) / 0.10));
        } else {
          circuitSvg.style.opacity = '1';
        }
      }
    },
  });

  // ─── PINNED OVERLAP-REVEAL: Section A pinned, Section B pulls up like a curtain ───
  initPinnedOverlapReveal();

  let lastDevWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastDevWidth) return;
    lastDevWidth = window.innerWidth;
    updateStageHeight();
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

