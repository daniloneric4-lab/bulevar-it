/**
 * animations.js — GSAP + ScrollTrigger animations for all sections
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize hero headline per-letter stagger animation
 * Triggered at 60–85% of the hero scroll range
 */
export function initHeroAnimations() {
  const content = document.querySelector('.hero__content');
  const headlineLines = document.querySelectorAll('.hero__headline-line');
  const sub = document.querySelector('.hero__sub');
  const cta = document.querySelector('.hero__cta');

  if (!content || !headlineLines.length) return;

  // Split each line's text into individual letter spans
  headlineLines.forEach((line) => {
    const text = line.textContent;
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');

    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.className = 'hero__letter';
      span.textContent = char === ' ' ? '\u00A0' : char;
      line.appendChild(span);
    });
  });

  // Timeline for the hero text reveal
  const heroTl = gsap.timeline({ paused: true });

  // Show the content container
  heroTl.to(content, {
    opacity: 1,
    duration: 0.3,
    ease: 'power2.out',
  });

  // Animate each letter with elastic bounce
  heroTl.to('.hero__letter', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'elastic.out(1, 0.5)',
    stagger: 0.03,
  }, '-=0.1');

  // Fade in subtitle
  heroTl.to(sub, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.3');

  // Fade in CTA button
  heroTl.to(cta, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.2');

  return heroTl;
}

/**
 * Initialize scroll-triggered fade-in animations for all sections
 */
export function initScrollAnimations() {
  // Fade-up cards and elements
  const fadeUpElements = document.querySelectorAll('[data-anim="fade-up"]');

  fadeUpElements.forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        el.classList.add('is-visible');
      },
    });
  });

  // Portfolio cards (handled by portfolio module, but add scroll trigger)
  // Stats counter animation
  initCounterAnimation();

  // Section headings (exclude #services and #o-nama since they have their own pinned animations)
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

  // Section labels (exclude #services and #o-nama)
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

  // Why-us text
  const whyText = document.querySelector('.why-us__text');
  if (whyText) {
    gsap.from(whyText, {
      scrollTrigger: {
        trigger: whyText,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    });
  }

  // Contact form & info
  const contactForm = document.querySelector('.contact__form');
  const contactInfo = document.querySelector('.contact__info');
  if (contactForm) {
    gsap.from(contactForm, {
      scrollTrigger: {
        trigger: contactForm,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power3.out',
    });
  }
  if (contactInfo) {
    gsap.from(contactInfo, {
      scrollTrigger: {
        trigger: contactInfo,
        start: 'top 85%',
        once: true,
      },
      opacity: 0,
      x: 30,
      duration: 0.8,
      delay: 0.15,
      ease: 'power3.out',
    });
  }
}

/**
 * Counter animation for "Why Us" stats
 */
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

        // Count up animation
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

/**
 * Initialize standalone Services and Tech Transition sections:
 * - Seamless full-page background color transition (#182032 <-> #080C14)
 * - Fixed WebGL DotGrid canvas activation across viewport
 * - DotGrid particle bloom on scroll
 * - Staggered fade-up entrance for 6 parallel vertical iOS liquid glass cards
 * - Interactive hover & focus 3D shape transformations (Robot, Chat bubble, etc.)
 * - Full-screen CPU Motherboard circuit board transformation in tech-canvas section
 */
export function initServicesReveal(dotGrid) {
  const stage = document.querySelector('#services-stage');
  const idejePreTransition = document.querySelector('#ideje-pre-transition');
  const servicesPreTransition = document.querySelector('#services-pre-transition');
  const services = document.querySelector('#services');
  const portfolio = document.querySelector('#portfolio');
  const canvasEl = document.querySelector('#services-dots');
  if (!stage || !canvasEl || !dotGrid) return;

  const glassBlocks = services.querySelectorAll('.glass-block');
  const header = services.querySelector('.services__header');

  // BOON Reference Colors
  const COLOR_NAVY = [25, 31, 50]; // #191F32 (Kontakt Navy)
  const COLOR_BLACK = [8, 12, 20];  // #080C14 (Services Deep Space Black)

  function lerpColor(c1, c2, t) {
    const clampedT = Math.max(0, Math.min(1, t));
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * clampedT);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * clampedT);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * clampedT);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // 1. Pre-Ideje Transition (About -> Ideje)
  // Clean theme change; the dots emerging and sorting into building & road are rendered by #ideje-bg
  if (idejePreTransition) {
    ScrollTrigger.create({
      trigger: idejePreTransition,
      start: 'top 80%',
      end: 'bottom 15%',
      onEnter: () => {
        document.body.style.backgroundColor = '';
        document.body.classList.add('theme--black');
        if (canvasEl) {
          canvasEl.classList.remove('is-active');
          canvasEl.style.opacity = '0';
        }
        if (dotGrid) dotGrid.setVisible(false);
      },
      onEnterBack: () => {
        document.body.classList.add('theme--black');
        if (canvasEl) {
          canvasEl.classList.remove('is-active');
          canvasEl.style.opacity = '0';
        }
        if (dotGrid) dotGrid.setVisible(false);
      },
      onLeaveBack: () => {
        document.body.classList.remove('theme--black');
      },
    });
  }

  // 1.5 Pre-Services Transition (Ideje -> Services)
  // NO SPHERE CIRCLE! As the floor expands from Ideje, it turns into Screenshot 3 (bloom = 0.48)
  // and smoothly transitions to full-screen ambient grid (bloom = 1.0) as user reaches Services
  if (servicesPreTransition && dotGrid) {
    ScrollTrigger.create({
      trigger: servicesPreTransition,
      start: 'top 85%',
      end: 'bottom 15%',
      scrub: 0.35,
      onEnter: () => {
        document.body.style.backgroundColor = '';
        document.body.classList.add('theme--black');
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
        dotGrid.resize();
        // Immediately start at Screenshot 3 peak burst — NEVER show circle (0.0)!
        dotGrid.setBloomImmediate(0.48);
      },
      onUpdate: (self) => {
        // Smoothly expand from Screenshot 3 (0.48) to settled ambient grid (1.0)
        const bloomVal = 0.48 + self.progress * 0.52;
        dotGrid.setBloom(bloomVal);
      },
      onLeave: () => {
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
        dotGrid.setBloom(1.0);
      },
      onEnterBack: () => {
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
      },
      onLeaveBack: () => {
        // Scrolling up into Ideje: hide dotGrid so expanding floor handles reverse
        if (canvasEl) {
          canvasEl.classList.remove('is-active');
          canvasEl.style.opacity = '0';
        }
        dotGrid.setVisible(false);
        dotGrid.setBloomImmediate(0.48);
      },
    });
  }

  // 2. Services Section Active State (Covers entire cards layout bidirectionally)
  ScrollTrigger.create({
    trigger: services,
    start: 'top 85%',
    end: 'bottom 15%',
    onEnter: () => {
      document.body.style.backgroundColor = '';
      document.body.classList.add('theme--black');
      if (canvasEl) {
        canvasEl.classList.add('is-active');
        canvasEl.style.opacity = '1';
      }
      if (dotGrid) {
        dotGrid.setVisible(true);
        dotGrid.setBloom(1.0);
        if (!dotGrid.currentShapeKey) {
          dotGrid.setShape(null);
        }
      }
    },
    onEnterBack: () => {
      document.body.style.backgroundColor = '';
      document.body.classList.add('theme--black');
      if (canvasEl) {
        canvasEl.classList.add('is-active');
        canvasEl.style.opacity = '1';
      }
      if (dotGrid) {
        dotGrid.setVisible(true);
      }
    },
    onLeaveBack: () => {
      if (canvasEl) {
        canvasEl.classList.remove('is-active');
        canvasEl.style.opacity = '0';
      }
      if (dotGrid) {
        dotGrid.setVisible(false);
      }
    },
  });

  // 3. Staggered entrance animation for header and cards
  if (header) {
    gsap.from(header, {
      scrollTrigger: {
        trigger: services,
        start: 'top 70%',
        once: true,
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
    });
  }

  if (glassBlocks.length) {
    gsap.from(glassBlocks, {
      scrollTrigger: {
        trigger: '.services__layout',
        start: 'top 75%',
        once: true,
      },
      opacity: 0,
      y: 40,
      scale: 0.97,
      stagger: 0.08,
      duration: 0.75,
      ease: 'power2.out',
    });
  }

  // 4. Cards Exit & Ambient Dots Gathering into 3D Sphere (Screenshot 1 & 2 Fix)
  // As the user scrolls past the last cards (Social Media & Support):
  // - The ambient dots smoothly gather into the golden 3D rotating sphere in the center.
  // - Background is guaranteed 100% DEEP BLACK (theme--black) — NO blue line at bottom!
  // - By 'bottom top', all cards are 100% off-screen above the viewport.
  const cardsLayout = document.querySelector('.services__layout');
  if (cardsLayout && dotGrid) {
    ScrollTrigger.create({
      trigger: cardsLayout,
      start: 'bottom 85%',
      end: 'bottom top',
      scrub: 0.35,
      onUpdate: (self) => {
        // Gathering from 1.0 (ambient grid) down to 0.0 (compact golden sphere)
        dotGrid.setBloom(Math.max(0, 1.0 - self.progress));
        // Keep body black while cards are in view
        document.body.classList.add('theme--black');
        if (self.progress > 0.25) {
          dotGrid.setShape(null); // Clear any hovered card shape so pure sphere gathers
        }
      },
      onLeave: () => {
        // All cards are now 100% off screen above viewport
        dotGrid.setBloom(0.0);
        dotGrid.setExitBurst(0.0);
      },
      onEnterBack: () => {
        // Scrolling back UP into cards
        document.body.classList.add('theme--black');
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
        dotGrid.setExitBurst(0.0);
      },
    });
  }

  // 5. Clean Theme Switch to Blue & Upward Explosion Phase (#services-post-transition)
  // "blokovi gore ne smeju da se vide kad je pozadina plava,
  //  znaci napravi da animacija prebacivanje boje bude jos vise clean a to ces uraditi tako sto:
  //  ce tackice idalje ostati u ovom krugu kad pozadina postane plava,
  //  i cim postane plava kako se skrolujes jos ga dole lopta ce da se rasprsne i loptice ce da se razlete ka gore i da nestanu"
  const postTransition = document.querySelector('#services-post-transition');
  if (postTransition && dotGrid) {
    ScrollTrigger.create({
      trigger: postTransition,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.35,
      onEnter: () => {
        // PHASE 1: EXACT MOMENT BACKGROUND TURNS BLUE
        // All cards are 100% off-screen (Screenshot 2 solved!)
        // Particles remain intact in the 3D rotating golden sphere in the center!
        document.body.classList.remove('theme--black');
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
        dotGrid.setBloom(0.0);
        dotGrid.setExitBurst(0.0);
      },
      onUpdate: (self) => {
        const p = self.progress;

        // Guarantee background is Navy Blue
        document.body.classList.remove('theme--black');

        // PHASE 2: UPWARD EXPLOSION PHYSICS
        // As user scrolls down, sphere explodes and particles shoot UPWARDS towards the sky and disappear
        const burstProgress = Math.min(1.0, p / 0.85);
        dotGrid.setExitBurst(burstProgress);

        // Smooth canvas fade out as final particles dissolve into upper atmosphere (p: 0.80 -> 1.0)
        if (canvasEl) {
          if (p > 0.80) {
            const fade = (p - 0.80) / 0.20;
            canvasEl.style.opacity = Math.max(0, 1.0 - fade).toFixed(3);
          } else {
            canvasEl.style.opacity = '1';
          }
        }
      },
      onLeave: () => {
        // Entering Portfolio: canvas hides cleanly, body is Navy Blue
        document.body.classList.remove('theme--black');
        if (canvasEl) {
          canvasEl.classList.remove('is-active');
          canvasEl.style.opacity = '0';
        }
        dotGrid.setVisible(false);
        dotGrid.setBloom(0.0);
        dotGrid.setExitBurst(0.0);
      },
      onEnterBack: () => {
        // Scrolling UP from Portfolio into postTransition:
        // Re-arm canvas on Navy Blue background
        document.body.classList.remove('theme--black');
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
        dotGrid.setBloom(0.0);
      },
      onLeaveBack: () => {
        // Leaving postTransition upwards into Services:
        // Switch background cleanly to Black BEFORE cards come down into view!
        document.body.classList.add('theme--black');
        dotGrid.setExitBurst(0.0);
        dotGrid.setBloom(0.0);
        if (canvasEl) {
          canvasEl.classList.add('is-active');
          canvasEl.style.opacity = '1';
        }
        dotGrid.setVisible(true);
      },
    });
  }

  // 6. Portfolio Section Guard (Guarantees Navy background & hides canvas)
  if (portfolio) {
    ScrollTrigger.create({
      trigger: portfolio,
      start: 'top bottom',
      onEnter: () => {
        document.body.classList.remove('theme--black');
      },
      onLeaveBack: () => {
        document.body.classList.remove('theme--black');
      },
    });
  }

  // 6. Bind hover, focus, and click events on glass blocks to DotGrid 3D shapes
  glassBlocks.forEach((block) => {
    const serviceKey = block.dataset.service;

    // Mouse hover: dots in center morph to 3D service shape (Cube, Spiral, Globe, Gyroscope, Ribbon, Shield)
    block.addEventListener('mouseenter', () => {
      if (dotGrid) dotGrid.setShape(serviceKey);
    });

    // Mouse leave: morphs back to idle 3D Galaxy Swirl in center!
    block.addEventListener('mouseleave', () => {
      if (dotGrid) dotGrid.setShape(null);
    });

    // Keyboard accessibility
    block.addEventListener('focus', () => {
      if (dotGrid) dotGrid.setShape(serviceKey);
    });

    block.addEventListener('blur', () => {
      if (dotGrid) dotGrid.setShape(null);
    });

    // Mobile / click toggle
    block.addEventListener('click', () => {
      if (dotGrid) {
        if (dotGrid.currentShapeKey === serviceKey) {
          dotGrid.setShape(null);
        } else {
          dotGrid.setShape(serviceKey);
        }
      }
    });
  });
}
