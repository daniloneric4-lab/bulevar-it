/**
 * animations.js — GSAP + ScrollTrigger animations for sections
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize scroll-triggered fade-in animations for sections
 */
export function initScrollAnimations() {
  const fadeUpElements = document.querySelectorAll('[data-anim="fade-up"]');

  fadeUpElements.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        el.classList.add('is-visible');
      },
    });
  });

  initCounterAnimation();

  const headings = document.querySelectorAll('.why-us__heading, #portfolio .section__heading, #contact .section__heading');
  headings.forEach((h) => {
    gsap.from(h, {
      scrollTrigger: {
        trigger: h,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    });
  });

  const labels = document.querySelectorAll('#portfolio .section__label, #why-us .section__label, #contact .section__label');
  labels.forEach((label) => {
    gsap.from(label, {
      scrollTrigger: {
        trigger: label,
        start: 'top 90%',
        once: true,
      },
      opacity: 0,
      x: -20,
      duration: 0.6,
      ease: 'power2.out',
    });
  });
}

function initCounterAnimation() {
  const stats = document.querySelectorAll('.stat');

  stats.forEach((stat) => {
    const numEl = stat.querySelector('.stat__number');
    if (!numEl) return;

    const target = parseInt(numEl.dataset.count, 10);

    ScrollTrigger.create({
      trigger: stat,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        stat.classList.add('is-visible');

        gsap.to(stat, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        });

        const counter = { val: 0 };
        gsap.to(counter, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            numEl.textContent = Math.round(counter.val);
          },
        });
      },
    });
  });
}
