/**
 * nav.js — Navigation logic: scroll behavior, mobile toggle, active section
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const nav = document.getElementById('main-nav');
const toggle = document.getElementById('nav-toggle');
const links = document.getElementById('nav-links');

function getDocTop(el) {
  if (!el) return 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  return Math.round(el.getBoundingClientRect().top + scrollY);
}

/**
 * Computes exact scroll target Y and active scroll-spy ranges for every section.
 * Accounts for sticky/pinned tracks and negative margin sheet overlaps.
 */
export function getSectionScrollMetrics() {
  const vh = window.innerHeight || 1080;
  const vw = window.innerWidth || 1920;

  const heroEl = document.getElementById('hero');
  const trackEl = document.getElementById('track');
  const pkEl = document.getElementById('put-kupca');
  const ojTrack = document.getElementById('oj-track');
  const devicesEl = document.getElementById('devices');
  const vsPane = document.getElementById('vs-pane');
  const krTrack = document.getElementById('kr-track') || document.getElementById('kako-razmisljamo');
  const sisTrack = document.getElementById('s-track') || document.getElementById('sis') || document.getElementById('laptop-master-stage');
  const ulogaTrack = document.getElementById('uloga-track') || document.getElementById('uloga');
  const contactEl = document.getElementById('contact');

  const heroTop = heroEl ? getDocTop(heroEl) : 0;
  const heroSpan = heroEl ? Math.max(1, heroEl.offsetHeight - vh) : vh * 6;

  // O nama: G = 0.285 in #hero (where BULEVAR.IT dot logo is 100% assembled & 01 caption is decoded)
  const oNamaTarget = Math.round(heroTop + heroSpan * 0.285);
  const oNamaStart = Math.round(heroTop + heroSpan * 0.22);

  // Ideje / Usluge (#track): Q = 0.095 (where golden wave is settled & "Ideje nemaju veličinu firme." is decoded)
  const trackTop = trackEl ? getDocTop(trackEl) : oNamaTarget + vh * 4;
  const trackSpan = trackEl ? Math.max(1, trackEl.offsetHeight - vh) : vh * 8;
  const servicesTarget = Math.round(trackTop + trackSpan * 0.095);

  // Put kupca (#put-kupca): P = 0.035 in #oj-track (3D phone & first intro text decoded)
  const pkTop = pkEl ? getDocTop(pkEl) : trackTop + trackSpan + vh;
  const ojSpan = ojTrack ? Math.max(1, ojTrack.offsetHeight - vh) : vh * 5;
  const pkTarget = Math.round(pkTop + ojSpan * 0.035);

  // Radovi (#portfolio inside #devices): right after holdVs (1.0 * vh) + vsW (width of #vs-pane)
  const st = ScrollTrigger.getById('unified-showcase-trigger');
  const devicesStart = st ? Math.round(st.start) : (devicesEl ? getDocTop(devicesEl) : pkTop + ojSpan + vh);
  const holdVs = Math.round(vh * 1.0);
  const vsW = vsPane ? vsPane.offsetWidth : vw;
  const portfolioTarget = Math.round(devicesStart + holdVs + vsW);
  const portfolioRangeStart = Math.round(devicesStart + holdVs + vsW * 0.5);

  // Kako razmišljamo (#kr-track): when sticky stage reaches top of viewport
  const krTop = krTrack ? getDocTop(krTrack) : portfolioTarget + vh * 3;
  const krTarget = Math.round(krTop + 15);

  // Sistem iza ekrana (#s-track) & Uloga sajta (#uloga-track) — non-menu sections
  const sisTop = sisTrack ? getDocTop(sisTrack) : krTop + vh * 6;
  const sisTarget = Math.round(sisTop + 15);
  const ulogaTop = ulogaTrack ? getDocTop(ulogaTrack) : sisTop + vh * 5;
  const ulogaTarget = Math.round(ulogaTop + 15);

  // Kontakt (#contact): top of .kf section where heading and entire #kfCard form are visible
  const contactTop = contactEl ? getDocTop(contactEl) : ulogaTop + vh * 5;
  const contactTarget = Math.round(contactTop);

  return {
    targets: {
      'hero': 0,
      'o-nama': oNamaTarget,
      'about': oNamaTarget,
      'services': servicesTarget,
      'usluge': servicesTarget,
      'ideje': servicesTarget,
      'put-kupca': pkTarget,
      'journey': pkTarget,
      'devices': devicesStart,
      'portfolio': portfolioTarget,
      'radovi': portfolioTarget,
      'work': portfolioTarget,
      'kako-razmisljamo': krTarget,
      'kako-radimo': krTarget,
      'ne-trazimo': krTarget,
      'approach': krTarget,
      'sistem-iza-ekrana': sisTarget,
      'sta-ako': sisTarget,
      'sis': sisTarget,
      'zasto-sajt': ulogaTarget,
      'uloga': ulogaTarget,
      'contact': contactTarget,
      'kontakt': contactTarget,
    },
    ranges: [
      { id: 'o-nama', start: oNamaStart, end: trackTop - Math.round(vh * 0.25) },
      { id: 'services', start: trackTop - Math.round(vh * 0.25), end: pkTop - Math.round(vh * 0.25) },
      { id: 'put-kupca', start: pkTop - Math.round(vh * 0.25), end: portfolioRangeStart },
      { id: 'portfolio', start: portfolioRangeStart, end: krTop - Math.round(vh * 0.35) },
      { id: 'kako-razmisljamo', start: krTop - Math.round(vh * 0.35), end: sisTop - Math.round(vh * 0.35) },
      // Between sisTop - 0.35*vh and contactTop - 0.35*vh ("Sistem iza ekrana" & "Zašto imate sajt?"), no menu item is active (null)
      { id: 'contact', start: contactTop - Math.round(vh * 0.35), end: Infinity },
    ],
  };
}

/**
 * Initialize navigation
 */
export function initNav() {
  if (!nav) return;

  // Show nav & language button when reached Figure 01 'BULEVAR.IT' at 24% of #hero
  const heroSection = document.getElementById('hero');
  const updateNavLangVisibility = (visible) => {
    nav.classList.toggle('nav--visible', visible);
    const langDesktop = document.querySelector('.lang-desktop-wrap');
    if (langDesktop) {
      langDesktop.classList.toggle('lang--visible', visible);
    }
  };

  if (heroSection) {
    ScrollTrigger.create({
      trigger: heroSection,
      start: '24% top',
      onEnter: () => updateNavLangVisibility(true),
      onLeaveBack: () => updateNavLangVisibility(false),
    });
  } else {
    const nextSection = document.getElementById('track') || document.getElementById('services');
    if (nextSection) {
      ScrollTrigger.create({
        trigger: nextSection,
        start: 'top 25%',
        onEnter: () => updateNavLangVisibility(true),
        onLeaveBack: () => updateNavLangVisibility(false),
      });
    }
  }

  // Mobile menu control functions
  let navHistoryPushed = false;

  const closeMobileMenu = (fromPopState = false) => {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (links) links.classList.remove('is-open');
    document.body.classList.remove('nav-open-lock');
    window.lenis?.start();

    if (navHistoryPushed && !fromPopState) {
      navHistoryPushed = false;
      try {
        history.back();
      } catch (e) {}
    } else {
      navHistoryPushed = false;
    }
  };

  const openMobileMenu = () => {
    if (!nav) return;
    nav.classList.add('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    if (links) links.classList.add('is-open');
    document.body.classList.add('nav-open-lock');
    window.lenis?.stop();

    if (!navHistoryPushed) {
      try {
        history.pushState({ mobileNavOpen: true }, '');
        navHistoryPushed = true;
      } catch (e) {}
    }
  };

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu(false);
      } else {
        openMobileMenu();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMobileMenu(false);
      }
    });

    window.addEventListener('popstate', () => {
      if (nav && nav.classList.contains('is-open')) {
        closeMobileMenu(true);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
        closeMobileMenu(false);
      }
    });
  }

  // Active link helper & spring blob physics
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blob = document.getElementById('nav-blob');
  let bx = 0, bw = 0, bvx = 0, bvw = 0, btx = 0, btw = 0, bAnim = false;

  function updateBlobTarget(activeEl) {
    if (window.innerWidth <= 768) return;
    if (!links || !blob) return;
    if (!activeEl) {
      blob.style.opacity = '0';
      return;
    }
    blob.style.opacity = '1';
    const nr = links.getBoundingClientRect();
    const r = activeEl.getBoundingClientRect();
    if (r.width <= 0) return;
    btx = r.left - nr.left;
    btw = r.width;
    if (reduce || bw === 0) {
      bx = btx;
      bw = btw;
      blob.style.width = `${bw}px`;
      blob.style.transform = `translateX(${bx}px)`;
      return;
    }
    if (!bAnim) {
      bAnim = true;
      requestAnimationFrame(blobStep);
    }
  }

  function blobStep() {
    const k = 0.16;
    const d = 0.62;
    bvx = (bvx + (btx - bx) * k) * d;
    bvw = (bvw + (btw - bw) * k) * d;
    bx += bvx;
    bw += bvw;
    const stretch = Math.min(0.35, Math.abs(bvx) / 60);
    if (blob) {
      blob.style.width = `${bw}px`;
      blob.style.transform = `translateX(${bx}px) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.35})`;
    }
    if (Math.abs(btx - bx) > 0.3 || Math.abs(bvx) > 0.3 || Math.abs(btw - bw) > 0.3) {
      requestAnimationFrame(blobStep);
    } else {
      bAnim = false;
      if (blob) {
        blob.style.transform = `translateX(${btx}px)`;
        blob.style.width = `${btw}px`;
      }
    }
  }

  function initBlob() {
    if (window.innerWidth <= 768) return;
    if (!links || !blob) return;
    const active = document.querySelector('.nav__link--active');
    if (active) {
      blob.style.opacity = '1';
      const nr = links.getBoundingClientRect();
      const r = active.getBoundingClientRect();
      if (r.width > 0) {
        btx = r.left - nr.left;
        btw = r.width;
        bx = btx;
        bw = btw;
        blob.style.width = `${bw}px`;
        blob.style.transform = `translateX(${bx}px)`;
      }
    } else {
      blob.style.opacity = '0';
    }
  }

  let currentActiveId = undefined;
  let programmaticScrollUntil = 0;

  const setActiveLink = (id) => {
    if (id === currentActiveId) return;
    currentActiveId = id;
    let activeEl = null;
    const linksList = document.querySelectorAll('.nav__link');
    linksList.forEach((link) => {
      const href = link.getAttribute('href');
      const isMatch = !!id && (
        href === `#${id}` ||
        ((id === 'o-nama' || id === 'about') && href === '#o-nama') ||
        ((id === 'services' || id === 'usluge' || id === 'ideje' || id === 'track') && href === '#services') ||
        ((id === 'put-kupca' || id === 'journey') && href === '#put-kupca') ||
        ((id === 'portfolio' || id === 'radovi' || id === 'work') && href === '#portfolio') ||
        ((id === 'kako-razmisljamo' || id === 'kako-radimo' || id === 'approach') && href === '#kako-razmisljamo') ||
        ((id === 'contact' || id === 'kontakt') && href === '#contact')
      );
      link.classList.toggle('nav__link--active', isMatch);
      link.setAttribute('aria-current', isMatch ? 'true' : 'false');
      if (isMatch) activeEl = link;
    });
    if (window.innerWidth > 768) {
      updateBlobTarget(activeEl);
    }
  };

  window.__setActiveNavLink = setActiveLink;

  // Unified Scroll-Spy using the exact same section boundaries
  const updateActiveNavOnScroll = () => {
    if (performance.now() < programmaticScrollUntil) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const { ranges } = getSectionScrollMetrics();
    let matchedId = null;
    for (let i = 0; i < ranges.length; i++) {
      const r = ranges[i];
      if (scrollY >= r.start && scrollY < r.end) {
        matchedId = r.id;
        break;
      }
    }
    setActiveLink(matchedId);
  };

  window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });
  ScrollTrigger.addEventListener('refresh', updateActiveNavOnScroll);

  // Unified programmatic scroll to section
  const scrollToSection = (rawId, immediate = false) => {
    const cleanId = (rawId || '').replace(/^#/, '').trim();
    if (!cleanId) return;

    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }

    const { targets } = getSectionScrollMetrics();
    let targetY = targets[cleanId];

    if (targetY === undefined) {
      const fallbackEl = document.getElementById(cleanId);
      if (!fallbackEl) return;
      const headerOffset = window.innerWidth <= 768 ? 68 : 80;
      targetY = Math.max(0, getDocTop(fallbackEl) - headerOffset);
    }

    const curY = window.scrollY || window.pageYOffset || 0;
    const dist = Math.abs(targetY - curY);
    const vh = window.innerHeight || 1080;
    const duration = immediate ? 0 : (dist > vh * 6 ? 0.85 : 1.2);

    const activeMenuIds = ['o-nama', 'about', 'services', 'usluge', 'ideje', 'put-kupca', 'journey', 'portfolio', 'radovi', 'work', 'kako-razmisljamo', 'kako-radimo', 'approach', 'contact', 'kontakt'];
    if (activeMenuIds.includes(cleanId)) {
      programmaticScrollUntil = performance.now() + duration * 1000 + 120;
      setActiveLink(cleanId);
    } else if (cleanId === 'hero') {
      programmaticScrollUntil = performance.now() + duration * 1000 + 120;
      setActiveLink(null);
    }

    if (window.lenis) {
      window.lenis.scrollTo(targetY, {
        immediate,
        duration,
        onComplete: () => {
          programmaticScrollUntil = 0;
          if (window.ScrollTrigger) window.ScrollTrigger.update();
          updateActiveNavOnScroll();
        },
      });
    } else {
      window.scrollTo({
        top: targetY,
        behavior: immediate ? 'auto' : 'smooth',
      });
    }
  };

  window.__scrollToSection = scrollToSection;

  // Logo click -> top of page (start of hero video)
  const logo = nav.querySelector('.nav__logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      setTimeout(() => scrollToSection('hero', false), 40);
    });
  }

  // Mobile contact links
  const mobileContactLinks = nav.querySelectorAll('.nav__mobile-contact-link');
  mobileContactLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Nav links click handler (desktop & mobile)
  const currentNavLinks = document.querySelectorAll('.nav__link');
  currentNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const targetId = href.slice(1);
      const wasMobileOpen = nav.classList.contains('is-open');
      closeMobileMenu();
      setTimeout(() => {
        scrollToSection(targetId, false);
      }, wasMobileOpen ? 60 : 0);
    });
  });

  let lastNavBlobWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastNavBlobWidth) return;
    lastNavBlobWidth = window.innerWidth;
    initBlob();
    updateActiveNavOnScroll();
  }, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      initBlob();
      updateActiveNavOnScroll();
    });
  }
  setTimeout(() => {
    initBlob();
    updateActiveNavOnScroll();
  }, 250);

  // Handle deep-link anchor routing on hash changes
  window.addEventListener('hashchange', () => handleUrlLandingRoute(false));
}

/**
 * Parse landing URL parameters and scroll to target section + prefill form
 * Supports links like: bulevar.it/#zasto-sajt?cilj=zakazivanje&izvor=lp1
 */
export function handleUrlLandingRoute(isInitial = false) {
  const hashRaw = window.location.hash || '';
  const searchRaw = window.location.search || '';
  if (!hashRaw && !searchRaw) return;

  if (hashRaw && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const params = new URLSearchParams(searchRaw);
  let hashAnchor = '';

  if (hashRaw) {
    const qIdx = hashRaw.indexOf('?');
    if (qIdx !== -1) {
      hashAnchor = hashRaw.slice(1, qIdx);
      const hashParams = new URLSearchParams(hashRaw.slice(qIdx + 1));
      hashParams.forEach((val, key) => {
        if (!params.has(key)) params.set(key, val);
      });
    } else {
      hashAnchor = hashRaw.slice(1);
    }
  }

  // Activate matching role chip in Section 09 if goal passed
  const cilj = params.get('cilj');
  if (cilj) {
    const roleChipMap = {
      'vizit': 0, 'brend': 0, 'predstavljanje': 0,
      'prodaja': 1, 'shop': 1,
      'upiti': 2, 'ponuda': 2,
      'zakazivanje': 3, 'rezervacije': 3, 'termin': 3,
      'automatizacija': 4, 'crm': 4,
      'sve': 5, 'sistem': 5, 'sve-povezano': 5
    };
    const roleIdx = roleChipMap[cilj.toLowerCase()];
    if (roleIdx !== undefined) {
      setTimeout(() => {
        const chip = document.querySelector(`.uloga-chip[data-role="${roleIdx}"]`);
        if (chip) chip.click();
      }, 700);
    }
  }

  if (hashAnchor) {
    const performScroll = (immediate) => {
      if (window.__scrollToSection) {
        window.__scrollToSection(hashAnchor, immediate);
      }
    };

    if (isInitial) {
      const runWhenReady = () => {
        setTimeout(() => performScroll(true), 200);
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (document.readyState === 'complete') runWhenReady();
          else window.addEventListener('load', runWhenReady, { once: true });
        });
      } else {
        window.addEventListener('load', runWhenReady, { once: true });
      }
    } else {
      performScroll(false);
    }
  }

  // Attribute inquiry in contact form and prefill message
  const izvor = params.get('izvor');
  const gclid = params.get('gclid');
  if (cilj || izvor || gclid) {
    const form = document.getElementById('kfForm') || document.getElementById('contact-form');
    const msgInput = document.getElementById('f-msg') || document.getElementById('contact-message');

    ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'izvor', 'cilj'].forEach((key) => {
      const val = params.get(key);
      if (val && form) {
        let input = form.querySelector(`input[name="${key}"]`);
        if (!input) {
          input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          form.appendChild(input);
        }
        input.value = val;
      }
    });

    if (cilj && msgInput && !msgInput.value) {
      const ciljTextMap = {
        'zakazivanje': 'Zanima me izrada sajta / sistema sa online zakazivanjem i rezervacijama.',
        'sistem': 'Zanima me digitalni sistem i automatizacija poslovanja kroz sajt.',
        'prodaja': 'Zanima me sajt za direktnu prodaju i online poručivanje bez posrednika.',
        'upiti': 'Zanima me moderan sajt koji kvalifikuje posetioce i generiše upite.',
        'metodologija': 'Zanima me vaš pristup i proces izrade sajta za naš biznis.'
      };
      msgInput.value = ciljTextMap[cilj.toLowerCase()] || `Zanima me saradnja (Cilj: ${cilj}).`;
    }
  }
}
