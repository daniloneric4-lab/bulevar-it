/**
 * aboutParallax.js — Interactive "O nama" section with pinned parallax scroll
 * Inspired by Boon Global & Apple AirDrop interaction aesthetics
 *
 * Uses:
 * - GSAP ScrollTrigger for pinned scroll-locking
 * - 4 sliced master composition images (2528x1696 coordinate space)
 * - Absolute percentage geometry for 100% seamless composite alignment
 * - Bold clean white "O NAMA" typography on animation visual
 * - Fast, engaging progressive text typing/reveal (no slow drag)
 * - Authentic Apple AirDrop spring pop-in with radar rings for value blocks
 * - Smooth transition to Deep Black background
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tunable animation configuration parameters
 */
export const PARALLAX_CONFIG = {
  // Pinned scroll duration
  scrollLength: '+=180%',

  // Scrub smoothness
  scrub: 0.8,

  // Layer 1: Gornja osnova (y: 0 to 1131, full width)
  layer1: {
    yPercent: -105,
    duration: 0.92,
  },

  // Layer 2: Srednji levi prozor (y: 848 to 1413, x: 0 to 1116)
  layer2: {
    xPercent: -125,
    duration: 0.86,
  },

  // Layer 3: Donji levi blok (y: 1131 to 1696, x: 0 to 1517)
  layer3: {
    yPercent: 125,
    xPercent: -20,
    duration: 0.94,
  },

  // Layer 4: Donji desni blok (y: 1131 to 1696, x: 1116 to 2528)
  layer4: {
    xPercent: 125,
    duration: 0.86,
  },

  // Progress thresholds (0.0 to 1.0 along the pinned scroll)
  textRevealThreshold: 0.12,   // Starts text typing early so visitor isn't waiting
  cardsRevealThreshold: 0.32,  // AirDrop blocks appear right as text finishes
  layersFadeThreshold: 0.85,   // Layers finish exiting and fade out by 100%
};

/**
 * Helper: Split heading text into masked words for smooth reveal
 */
function splitHeading(headingEl) {
  if (!headingEl || headingEl.dataset.split) return;
  headingEl.dataset.split = 'true';

  const childNodes = Array.from(headingEl.childNodes);
  headingEl.innerHTML = '';

  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/\s+/).filter(Boolean);
      words.forEach((word) => {
        const wrap = document.createElement('span');
        wrap.className = 'about-word-wrap';
        const inner = document.createElement('span');
        inner.className = 'about-word';
        inner.textContent = word;
        wrap.appendChild(inner);
        headingEl.appendChild(wrap);
        headingEl.appendChild(document.createTextNode(' '));
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.textContent;
      const wrap = document.createElement('span');
      wrap.className = 'about-word-wrap';
      const inner = document.createElement('span');
      inner.className = `about-word ${node.className}`;
      inner.textContent = text;
      wrap.appendChild(inner);
      headingEl.appendChild(wrap);
      headingEl.appendChild(document.createTextNode(' '));
    }
  });
}

/**
 * Helper: Split description text into words for typewriter/fade streaming
 */
function splitDescription(descEl) {
  if (!descEl || descEl.dataset.split) return;
  descEl.dataset.split = 'true';

  const text = descEl.textContent.trim();
  const words = text.split(/\s+/);
  descEl.innerHTML = '';

  words.forEach((word) => {
    const span = document.createElement('span');
    span.className = 'about-desc-word';
    span.textContent = word;
    descEl.appendChild(span);
    descEl.appendChild(document.createTextNode(' '));
  });
}

/**
 * Initialize the Pinned About Parallax Section
 */
export function initAboutParallax() {
  const section = document.querySelector('#o-nama') || document.querySelector('#about');
  if (!section) return;

  const parallaxWrap = section.querySelector('.about-parallax');
  const topFade = section.querySelector('.about-parallax__top-fade');
  const parallaxTitle = section.querySelector('.about-parallax__title');
  const layer1 = section.querySelector('.about-parallax__layer--1');
  const layer2 = section.querySelector('.about-parallax__layer--2');
  const layer3 = section.querySelector('.about-parallax__layer--3');
  const layer4 = section.querySelector('.about-parallax__layer--4');

  const headingEl = section.querySelector('.about__heading');
  const descEl = section.querySelector('.about__description');
  const labelEl = section.querySelector('.about__section-label') || section.querySelector('.section__label');
  const cards = section.querySelectorAll('.value-card');

  // 1. Prepare typography for split-text reveals
  if (headingEl) splitHeading(headingEl);
  if (descEl) splitDescription(descEl);

  const headingWords = section.querySelectorAll('.about-word');
  const descWords = section.querySelectorAll('.about-desc-word');

  // Initial states for text & cards (hidden behind images)
  if (labelEl) gsap.set(labelEl, { opacity: 0, y: -15 });
  if (headingWords.length) gsap.set(headingWords, { y: '110%', opacity: 0 });
  if (descWords.length) gsap.set(descWords, { opacity: 0, y: 10, filter: 'blur(5px)' });
  if (cards.length) gsap.set(cards, { opacity: 0, scale: 0.35, y: 35, filter: 'blur(8px)' });

  // 2. Build forward-only Text Reveal Timeline (quick & punchy)
  const textTl = gsap.timeline({ paused: true });

  if (labelEl) {
    textTl.to(labelEl, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: 'power2.out',
    }, 0);
  }

  if (headingWords.length) {
    textTl.to(headingWords, {
      y: '0%',
      opacity: 1,
      stagger: 0.025,
      duration: 0.35,
      ease: 'power3.out',
    }, 0.05);
  }

  if (descWords.length) {
    textTl.to(descWords, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      stagger: 0.007,
      duration: 0.3,
      ease: 'power2.out',
    }, 0.18);
  }

  // 3. Build forward-only Apple AirDrop Cards Reveal Timeline
  // Starts immediately as the text finishes revealing
  const cardsTl = gsap.timeline({ paused: true });

  if (cards.length) {
    // AirDrop spring bounce pop-in
    cardsTl.to(cards, {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      stagger: 0.1,
      duration: 0.75,
      ease: 'back.out(2.0)', // Authentic iOS spring pop
    }, 0);

    // AirDrop radar pulse ring expansion
    cards.forEach((card, i) => {
      const ring = card.querySelector('.value-card__radar-ring');
      if (ring) {
        cardsTl.fromTo(ring,
          { scale: 0.75, opacity: 0.95 },
          { scale: 1.5, opacity: 0, duration: 0.9, ease: 'power2.out' },
          i * 0.1 + 0.15
        );
      }
    });
  }

  // 4. Build scrubbed Image Layers Separation Timeline
  const imagesTl = gsap.timeline({ paused: true });

  // "O NAMA" large white title on the left sweeps left with Layer 2
  if (parallaxTitle) {
    imagesTl.to(parallaxTitle, {
      xPercent: -100,
      opacity: 0,
      ease: 'power1.inOut',
      duration: 0.65,
    }, 0);
  }

  // Layer 1: Gornja osnova
  if (layer1) {
    imagesTl.to(layer1, {
      yPercent: PARALLAX_CONFIG.layer1.yPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer1.duration,
    }, 0);
  }

  // Layer 2: Srednji levi prozor
  if (layer2) {
    imagesTl.to(layer2, {
      xPercent: PARALLAX_CONFIG.layer2.xPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer2.duration,
    }, 0);
  }

  // Layer 3: Donji levi blok
  if (layer3) {
    imagesTl.to(layer3, {
      yPercent: PARALLAX_CONFIG.layer3.yPercent,
      xPercent: PARALLAX_CONFIG.layer3.xPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer3.duration,
    }, 0);
  }

  // Layer 4: Donji desni blok
  if (layer4) {
    imagesTl.to(layer4, {
      xPercent: PARALLAX_CONFIG.layer4.xPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer4.duration,
    }, 0);
  }

  // Top blend fade out early as images pull apart
  if (topFade) {
    imagesTl.to(topFade, {
      opacity: 0,
      ease: 'power1.out',
      duration: 0.3,
    }, 0);
  }

  // Fade out parallax container at the very end so no layer blocks text
  if (parallaxWrap) {
    imagesTl.fromTo(parallaxWrap,
      { opacity: 1 },
      {
        opacity: 0,
        ease: 'power1.out',
        duration: (1 - PARALLAX_CONFIG.layersFadeThreshold),
      },
      PARALLAX_CONFIG.layersFadeThreshold
    );
  }

  // 5. Track reveal states
  let hasTextPlayed = false;
  let hasCardsPlayed = false;

  // 6. Master Pinned ScrollTrigger
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: PARALLAX_CONFIG.scrollLength,
    pin: true,
    pinSpacing: true,
    scrub: PARALLAX_CONFIG.scrub,
    animation: imagesTl,
    onEnter: () => {
      document.body.classList.add('theme--black');
    },
    onEnterBack: () => {
      document.body.classList.add('theme--black');
    },
    onUpdate: (self) => {
      const progress = self.progress;

      // Trigger snappy text reveal once scroll reaches threshold
      if (progress >= PARALLAX_CONFIG.textRevealThreshold && !hasTextPlayed) {
        textTl.play();
        hasTextPlayed = true;
      }

      // Trigger AirDrop cards reveal right after text
      if (progress >= PARALLAX_CONFIG.cardsRevealThreshold && !hasCardsPlayed) {
        cardsTl.play();
        hasCardsPlayed = true;
      }
    },
    onLeave: () => {
      if (!hasTextPlayed) {
        textTl.progress(1);
        hasTextPlayed = true;
      }
      if (!hasCardsPlayed) {
        cardsTl.progress(1);
        hasCardsPlayed = true;
      }
    },
    onLeaveBack: () => {
      // User completely left back up into Hero
      document.body.classList.remove('theme--black');
      hasTextPlayed = false;
      hasCardsPlayed = false;
      textTl.pause(0);
      cardsTl.pause(0);
      if (labelEl) gsap.set(labelEl, { opacity: 0, y: -15 });
      if (headingWords.length) gsap.set(headingWords, { y: '110%', opacity: 0 });
      if (descWords.length) gsap.set(descWords, { opacity: 0, y: 10, filter: 'blur(5px)' });
      if (cards.length) gsap.set(cards, { opacity: 0, scale: 0.35, y: 35, filter: 'blur(8px)' });
    },
  });
}
