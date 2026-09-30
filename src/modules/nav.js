/**
 * nav.js — Navigation logic: scroll behavior, mobile toggle, active section
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const nav = document.getElementById('main-nav');
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');
const navLinks = document.querySelectorAll('.nav__link');

/**
 * Initialize navigation
 */
export function initNav() {
  if (!nav) return;

  // Show nav only when scrolled to About section; disappears above it into Hero
  const about = document.getElementById('o-nama') || document.getElementById('about');
  if (about) {
    ScrollTrigger.create({
      trigger: about,
      start: 'top 25%',
      onEnter: () => nav.classList.add('nav--visible'),
      onLeaveBack: () => nav.classList.remove('nav--visible'),
    });
  }

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      links.classList.toggle('is-open');
    });

    // Close mobile menu on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      });
    });
  }

  // Smooth scroll click handler
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.slice(1);

      // Responzivnost: scrolls directly to before laptop opens (start of 3D showcase)
      if (targetId === 'devices') {
        e.preventDefault();
        const st = ScrollTrigger.getById('unified-showcase-trigger');
        if (st) {
          if (window.lenis) window.lenis.scrollTo(st.start, { duration: 1.2 });
          else window.scrollTo({ top: st.start, behavior: 'smooth' });
          setActiveLink('devices');
          return;
        }
      }

      // Portfolio: scrolls directly to where the horizontal projects begin ("Naši radovi")
      if (targetId === 'portfolio') {
        e.preventDefault();
        const st = ScrollTrigger.getById('unified-showcase-trigger');
        if (st) {
          const devDuration = window.innerHeight * 2.0;
          const portfolioStart = st.start + devDuration + (window.innerWidth * 0.70);
          if (window.lenis) window.lenis.scrollTo(portfolioStart, { duration: 1.2 });
          else window.scrollTo({ top: portfolioStart, behavior: 'smooth' });
          setActiveLink('portfolio');
          return;
        }
      }

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        if (window.lenis) window.lenis.scrollTo(targetEl, { duration: 1.2 });
        else targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Active link helper
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isMatch = href === `#${id}` ||
        ((id === 'o-nama' || id === 'about') && (href === '#o-nama' || href === '#about'));
      link.classList.toggle('nav__link--active', isMatch);
    });
  };

  // Expose global helper for stage synchronization
  window.__setActiveNavLink = setActiveLink;

  // Highlight active section on scroll (exclude #devices as it manages its own sub-phases)
  const sections = document.querySelectorAll('section[id]:not(#tech-canvas):not(#devices)');
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (isActive) {
          setActiveLink(section.getAttribute('id'));
        }
      },
    });
  });
}
