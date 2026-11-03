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
import { renderHorizontalPortfolio, animatePortfolioCards, drawCircuitLines, updateCircuitProgress, computeRevealedX, getCircuitAnchors } from './horizontalPortfolio.js';

gsap.registerPlugin(ScrollTrigger);

export function initDevicePortfolioStage() {
  const stage = document.querySelector('#devices');
  const motionTrack = document.querySelector('#unified-motion-track');
  const container = document.querySelector('#devices-3d-container');
  const hintBtn = document.querySelector('#device-click-hint');
  const header = document.querySelector('.unified-showcase__header');
  const cardsTrack = document.querySelector('#portfolio-cards-track');

  if (!stage || !motionTrack || !cardsTrack) {
    console.warn('[devicePortfolioStage] Required elements not found');
    return;
  }

  // 1. Render project cards in iOS27 Liquid Glass style
  renderHorizontalPortfolio('#portfolio-cards-track');
  drawCircuitLines(cardsTrack);

  // Draw SVG circuit lines for portfolio cards
  setTimeout(() => {
    updateStageHeight();
    drawCircuitLines(cardsTrack);
    ScrollTrigger.refresh();
  }, 150);

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
    const anchors = getCircuitAnchors();
    if (anchors && anchors.length > 0) return Math.round(anchors[anchors.length - 1].right + 90);
    const cards = cardsTrack.querySelectorAll('.curtis-card');
    const lastCard = cards[cards.length - 1];
    if (lastCard && cardsTrack) {
      const trackOffset = cardsTrack.offsetLeft || 0;
      const lastCardEnd = trackOffset + lastCard.offsetLeft + lastCard.offsetWidth;
      const leadOutLen = 90;
      const lineEndX = lastCardEnd + leadOutLen;
      return lineEndX;
    }
    return Math.max(window.innerWidth * 0.85, cardsTrack.scrollWidth - window.innerWidth);
  };

  const getTotalTravel = () => {
    return getVsWidth() + getCardsTravel();
  };

  const getHoldVs = () => Math.round(window.innerHeight * 1.0);
  const getHoldEnd = () => 0;

  const getScrollEnd = () => {
    return getHoldVs() + getTotalTravel() + getHoldEnd();
  };

  function updateStageHeight() {
    const totalDist = getScrollEnd();
    const climbOverlap = Math.round(window.innerHeight * 0.78);
    stage.style.height = `${totalDist + window.innerHeight + climbOverlap}px`;
  }

  updateStageHeight();
  requestAnimationFrame(() => {
    updateStageHeight();
    drawCircuitLines(cardsTrack);
    ScrollTrigger.refresh();
  });

  ScrollTrigger.create({
    id: 'unified-showcase-trigger',
    trigger: stage,
    start: 'top top',
    end: 'bottom bottom',
    pin: false,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const holdVs = getHoldVs();
      const totalTravel = getTotalTravel();
      const vsW = getVsWidth();
      const maxScrollPx = Math.max(1, stage.offsetHeight - window.innerHeight);
      const scrollPx = self.progress * maxScrollPx;

      let currentX = 0;
      let moved = 0;
      if (scrollPx > holdVs) {
        moved = Math.min(totalTravel, scrollPx - holdVs);
        currentX = -moved;
      }
      gsap.set(motionTrack, { x: currentX });
      window.__updateOjswVis?.();

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
        circuitSvg.style.opacity = '1';
      }
    },
  });

  initPinnedOverlapReveal();

  let lastDevWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  let lastDevHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  window.addEventListener('resize', () => {
    const wSame = window.innerWidth === lastDevWidth;
    const hSame = window.innerWidth <= 768 ? Math.abs(window.innerHeight - lastDevHeight) < 100 : window.innerHeight === lastDevHeight;
    if (wSame && hSame) return;
    lastDevHeight = window.innerHeight;
    lastDevWidth = window.innerWidth;
    updateStageHeight();
    drawCircuitLines(cardsTrack);
    ScrollTrigger.refresh();
  }, { passive: true });
}

export function initPinnedOverlapReveal() {
  const overlapWrap = document.querySelector('.overlap-wrap');
  const overlapA = document.querySelector('.overlap-a');
  const overlapB = document.querySelector('.overlap-b');

  if (!overlapWrap || !overlapA || !overlapB) return;

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
