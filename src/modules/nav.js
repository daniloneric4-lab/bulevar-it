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
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        if (window.lenis) window.lenis.scrollTo(targetEl);
        else targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Active link helper
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isMatch = href === `#${id}` ||
        ((id === 'o-nama' || id === 'about') && (href === '#o-nama' || href === '#about')) ||
        (id === 'devices' && href === '#portfolio');
      link.classList.toggle('nav__link--active', isMatch);
    });
  };

  // Highlight active section on scroll
  const sections = document.querySelectorAll('section[id]:not(#tech-canvas)');
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
