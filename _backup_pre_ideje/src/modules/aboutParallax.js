/**
 * aboutParallax.js — Cinematic Pinned "O nama" Parallax & Interactive Scrollytelling
 * 
 * Features:
 * 1. Pinned Scroll Lock (ScrollTrigger pin: true, pinSpacing: true, scrub: 0.8)
 * 2. 4-Layer Sliced Image Parallax Separation with bold "O NAMA" title (Boon-style)
 * 3. Progressive Typewriter text reveal as the visitor scrolls down
 * 4. 4 Sleek Metric Blocks (inspired by reference design) that "emerge from the ground"
 *    one by one, strictly AFTER the entire text has finished typing.
 * 5. Interactive hover state with vibrant green gradient & circular action button.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const PARALLAX_CONFIG = {
  scrollLength: '+=300%',
  scrub: 0.8,

  // Sliced master coordinate layers (2528x1696)
  layer1: { yPercent: -105, duration: 0.35 },
  layer2: { xPercent: -125, duration: 0.32 },
  layer3: { yPercent: 125, xPercent: -20, duration: 0.36 },
  layer4: { xPercent: 125, duration: 0.32 },
};

/**
 * Splits description text into individual words while preserving space
 * to prevent any layout shifts or jumping during typing.
 */
function prepareTypewriter(descEl) {
  if (!descEl || descEl.dataset.typewriterReady) return null;
  descEl.dataset.typewriterReady = 'true';

  const rawText = descEl.textContent.trim();
  const words = rawText.split(/\s+/).filter(Boolean);

  descEl.innerHTML = '';

  const container = document.createElement('span');
  container.className = 'about-tw-container';

  const wordSpans = [];

  words.forEach((word, idx) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'about-tw-word';
    wordSpan.textContent = word + (idx < words.length - 1 ? ' ' : '');
    container.appendChild(wordSpan);
    wordSpans.push(wordSpan);
  });

  descEl.appendChild(container);

  return { wordSpans };
}

/**
 * Initialize the Pinned Parallax Image Separation, Typewriter & Ground-Emerging Blocks
 */
export function initAboutParallax() {
  const section = document.querySelector('#o-nama') || document.querySelector('#about');
  if (!section) return;

  // Parallax elements
  const parallaxWrap = section.querySelector('.about-parallax');
  const topFade = section.querySelector('.about-parallax__top-fade');
  const parallaxTitle = section.querySelector('.about-parallax__title');
  const layer1 = section.querySelector('.about-parallax__layer--1');
  const layer2 = section.querySelector('.about-parallax__layer--2');
  const layer3 = section.querySelector('.about-parallax__layer--3');
  const layer4 = section.querySelector('.about-parallax__layer--4');

  // Background content elements
  const labelEl = section.querySelector('.about__section-label') || section.querySelector('.section__label');
  const headingEl = section.querySelector('.about__heading');
  const descEl = section.querySelector('#about-description') || section.querySelector('.about__description');
  const statBlocks = section.querySelectorAll('.stat-block');

  // Prepare progressive typewriter
  const twData = prepareTypewriter(descEl);
  const words = twData ? twData.wordSpans : [];

  // Set initial states
  if (labelEl) gsap.set(labelEl, { opacity: 0, y: -20 });
  if (headingEl) gsap.set(headingEl, { opacity: 0, y: 25 });
  if (words.length) {
    gsap.set(words, { opacity: 0, y: 4, filter: 'blur(2px)' });
  }
  if (statBlocks.length) {
    // "Izlazak iz zemlje" — all blocks start sunken below the ground with blur & zero opacity
    gsap.set(statBlocks, { y: 120, opacity: 0, filter: 'blur(10px)' });
  }

  // Master timeline mapped to scroll progress (0.0 to 1.0)
  const masterTl = gsap.timeline({ paused: true });

  // ═══════════════════════════════════════════════════════════
  // PHASE 1 (0.00 – 0.38): Sliced Image Layers Separation
  // Layers separate and pull apart, revealing background content
  // ═══════════════════════════════════════════════════════════

  // "O NAMA" large white title sweeps left
  if (parallaxTitle) {
    masterTl.to(parallaxTitle, {
      xPercent: -100,
      opacity: 0,
      ease: 'power1.inOut',
      duration: 0.28,
    }, 0.0);
  }

  // Layer 1: Gornja osnova flies UP
  if (layer1) {
    masterTl.to(layer1, {
      yPercent: PARALLAX_CONFIG.layer1.yPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer1.duration,
    }, 0.0);
  }

  // Layer 2: Srednji levi prozor flies LEFT
  if (layer2) {
    masterTl.to(layer2, {
      xPercent: PARALLAX_CONFIG.layer2.xPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer2.duration,
    }, 0.0);
  }

  // Layer 3: Donji levi blok flies DOWN-LEFT
  if (layer3) {
    masterTl.to(layer3, {
      yPercent: PARALLAX_CONFIG.layer3.yPercent,
      xPercent: PARALLAX_CONFIG.layer3.xPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer3.duration,
    }, 0.0);
  }

  // Layer 4: Donji desni blok flies RIGHT
  if (layer4) {
    masterTl.to(layer4, {
      xPercent: PARALLAX_CONFIG.layer4.xPercent,
      ease: 'power1.inOut',
      duration: PARALLAX_CONFIG.layer4.duration,
    }, 0.0);
  }

  // Top soft fade clears out
  if (topFade) {
    masterTl.to(topFade, {
      opacity: 0,
      ease: 'power1.out',
      duration: 0.18,
    }, 0.0);
  }

  // Entire parallax container fades out smoothly as layers open
  if (parallaxWrap) {
    masterTl.to(parallaxWrap, {
      opacity: 0,
      ease: 'power1.out',
      duration: 0.10,
    }, 0.28);
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 1.5 (0.15 – 0.32): Label and Heading Reveal
  // Fade in behind the opening image layers
  // ═══════════════════════════════════════════════════════════
  if (labelEl) {
    masterTl.to(labelEl, {
      opacity: 1,
      y: 0,
      duration: 0.12,
      ease: 'power2.out',
    }, 0.16);
  }

  if (headingEl) {
    masterTl.to(headingEl, {
      opacity: 1,
      y: 0,
      duration: 0.14,
      ease: 'power2.out',
    }, 0.20);
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 2 (0.32 – 0.65): Description Text Types Out on Scroll
  // As the user continues scrolling, words progressively type out
  // ═══════════════════════════════════════════════════════════
  if (words.length) {
    const typeStart = 0.32;
    const typeDuration = 0.33;
    const eachDuration = typeDuration / words.length;

    words.forEach((w, i) => {
      const startTime = typeStart + i * eachDuration;
      masterTl.to(w, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: eachDuration * 0.9,
        ease: 'none',
      }, startTime);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 3 (0.68 – 0.92): Blocks Emerge From Ground ONE BY ONE
  // STRICT REQUIREMENT: Only AFTER the entire text is fully typed out,
  // do the 4 blocks emerge from the ground sequentially
  // ═══════════════════════════════════════════════════════════
  if (statBlocks.length) {
    const blockStartTimes = [0.68, 0.74, 0.80, 0.86];
    const blockDuration = 0.07;

    statBlocks.forEach((block, idx) => {
      const startTime = blockStartTimes[idx] || (0.68 + idx * 0.06);
      masterTl.to(block, {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: blockDuration,
        ease: 'power2.out',
      }, startTime);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PHASE 4 (0.92 – 1.00): Visual Pause with all elements stable
  // Allows user to view/hover the blocks comfortably before unpinning
  // ═══════════════════════════════════════════════════════════
  masterTl.to({}, { duration: 0.08 }, 0.92);

  // Master Pinned ScrollTrigger
  ScrollTrigger.create({
    id: 'about-scroll-lock',
    trigger: section,
    start: 'top top',
    end: PARALLAX_CONFIG.scrollLength,
    pin: true,
    pinSpacing: true,
    scrub: PARALLAX_CONFIG.scrub,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onEnter: () => {
      document.body.classList.add('theme--black');
    },
    onEnterBack: () => {
      document.body.classList.add('theme--black');
    },
    onUpdate: (self) => {
      masterTl.progress(self.progress);
    },
    onLeave: () => {
      masterTl.progress(1.0);
    },
    onLeaveBack: () => {
      masterTl.progress(0.0);
      document.body.classList.remove('theme--black');
    },
  });

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}
