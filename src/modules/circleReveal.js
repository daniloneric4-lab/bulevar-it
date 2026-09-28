/**
 * circleReveal.js — Seamless In-Place Stage Transition (boonglobal.io style)
 * 
 * Manages the pinned #about-services-stage transition:
 * 1. Background transitions smoothly in-place from Navy Blue (#182032) to Deep Black (#080C14).
 * 2. #about content lifts and fades out seamlessly.
 * 3. #services layer, dot matrix, and glass cards fade in seamlessly.
 * 4. When scrolling up, reverses seamlessly back to Navy Blue #about.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initCircleReveal(stageElement, revealSection, options = {}) {
  const stageEl = typeof stageElement === 'string'
    ? document.querySelector(stageElement)
    : stageElement;
  const revealEl = typeof revealSection === 'string'
    ? document.querySelector(revealSection)
    : revealSection;
  const aboutEl = document.querySelector('#about');

  if (!stageEl || !revealEl) return null;

  const {
    scrubValue = 0.25,
    pinDistance = '100%',
    transitionStart = 0.05,
    transitionEnd = 0.65,
    onUpdate = null,
    onEnter = null,
    onLeave = null,
    onEnterBack = null,
    onLeaveBack = null,
  } = options;

  // Colors
  const COLOR_ABOUT = '#182032'; // Hero / About Navy Blue
  const COLOR_SERVICES = '#080C14'; // Services Deep Space Black

  // Initial stage state
  stageEl.style.backgroundColor = COLOR_ABOUT;
  if (aboutEl) {
    aboutEl.style.opacity = '1';
    aboutEl.style.transform = 'translateY(0px)';
    aboutEl.style.pointerEvents = 'auto';
  }
  revealEl.style.opacity = '0';
  revealEl.style.transform = 'translateY(20px)';
  revealEl.style.pointerEvents = 'none';
  revealEl.classList.remove('is-interactive');

  const updateStage = (progress) => {
    let t = 0; // Normalized transition progress (0 = About, 1 = Services)

    if (progress <= transitionStart) {
      t = 0;
    } else if (progress >= transitionEnd) {
      t = 1;
    } else {
      t = (progress - transitionStart) / (transitionEnd - transitionStart);
      // Smooth cubic ease for color and opacity
      t = t * t * (3.0 - 2.0 * t);
    }

    // 1. In-place background crossfade (#182032 -> #080C14)
    // Interpolate RGB channels
    const r = Math.round(24 + (8 - 24) * t);
    const g = Math.round(32 + (12 - 32) * t);
    const b = Math.round(50 + (20 - 50) * t);
    stageEl.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    // 2. About content fade out & subtle lift
    if (aboutEl) {
      const aboutOpacity = Math.max(0, 1 - t * 1.25);
      aboutEl.style.opacity = aboutOpacity.toFixed(3);
      aboutEl.style.transform = `translateY(${(-20 * t).toFixed(1)}px)`;
      aboutEl.style.pointerEvents = aboutOpacity > 0.1 ? 'auto' : 'none';
    }

    // 3. Services content fade in
    const servicesOpacity = Math.min(1, t * 1.2);
    revealEl.style.opacity = servicesOpacity.toFixed(3);
    revealEl.style.transform = `translateY(${(20 * (1 - t)).toFixed(1)}px)`;

    if (t >= 0.75) {
      revealEl.style.pointerEvents = 'auto';
      revealEl.classList.add('is-interactive');
    } else {
      revealEl.style.pointerEvents = 'none';
      revealEl.classList.remove('is-interactive');
    }

    if (onUpdate) {
      onUpdate(t, progress);
    }
  };

  // GSAP ScrollTrigger pinning stage container with scrub
  const st = ScrollTrigger.create({
    id: 'about-services-stage-st',
    trigger: stageEl,
    start: 'top top',
    end: `+=${pinDistance}`,
    pin: true,
    pinSpacing: true,
    anticipatePin: 1,
    scrub: scrubValue,

    onEnter: () => {
      if (onEnter) onEnter();
    },

    onUpdate: (self) => {
      updateStage(self.progress);
    },

    onLeave: () => {
      stageEl.style.backgroundColor = COLOR_SERVICES;
      if (aboutEl) {
        aboutEl.style.opacity = '0';
        aboutEl.style.pointerEvents = 'none';
      }
      revealEl.style.opacity = '1';
      revealEl.style.transform = 'translateY(0px)';
      revealEl.style.pointerEvents = 'auto';
      revealEl.classList.add('is-interactive');
      if (onLeave) onLeave();
    },

    onEnterBack: () => {
      updateStage(st.progress);
      if (onEnterBack) onEnterBack();
    },

    onLeaveBack: () => {
      updateStage(0);
      stageEl.style.backgroundColor = COLOR_ABOUT;
      if (aboutEl) {
        aboutEl.style.opacity = '1';
        aboutEl.style.transform = 'translateY(0px)';
        aboutEl.style.pointerEvents = 'auto';
      }
      revealEl.style.opacity = '0';
      revealEl.style.pointerEvents = 'none';
      revealEl.classList.remove('is-interactive');
      if (onLeaveBack) onLeaveBack();
    },
  });

  return st;
}
