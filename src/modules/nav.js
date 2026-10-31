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

  // Show nav & language button when reached Screenshot 3 (Figure 01 'BULEVAR.IT' at 24% of #hero)
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

  // Mobile toggle
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

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMobileMenu(false);
      }
    });

    // Support Android Back button & iOS swipe right to close mobile menu
    window.addEventListener('popstate', () => {
      if (nav && nav.classList.contains('is-open')) {
        closeMobileMenu(true);
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && nav.classList.contains('is-open')) {
        closeMobileMenu(false);
      }
    });
  }

  // Logo click
  const logo = nav.querySelector('.nav__logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      if (window.lenis) window.lenis.scrollTo(0, { duration: 1.2 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile contact links
  const mobileContactLinks = nav.querySelectorAll('.nav__mobile-contact-link');
  mobileContactLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Smooth scroll click handler
  // Smooth scroll click handler
  const currentNavLinks = document.querySelectorAll('.nav__link');
  currentNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const targetId = href.slice(1);
      closeMobileMenu();

      // 01. O nama: scrolls to BULEVAR.IT dot figures & numbers at 26% of #hero
      if (targetId === 'o-nama' || targetId === 'about') {
        e.preventDefault();
        const heroEl = document.getElementById('hero');
        if (heroEl) {
          const tot = heroEl.offsetHeight - window.innerHeight;
          const targetY = heroEl.offsetTop + tot * 0.26;
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(targetY, { duration: 1.2 });
            else window.scrollTo({ top: targetY, behavior: 'smooth' });
          }, 80);
          setActiveLink('o-nama');
          return;
        }
      }

      // 02. Usluge / Services: scrolls to start of Ideje & Usluge track (#track)
      if (targetId === 'services' || targetId === 'usluge' || targetId === 'ideje') {
        e.preventDefault();
        const trackEl = document.getElementById('track');
        if (trackEl) {
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(trackEl.offsetTop + 10, { duration: 1.2 });
            else window.scrollTo({ top: trackEl.offsetTop + 10, behavior: 'smooth' });
          }, 80);
          setActiveLink('services');
          return;
        }
      }

      // 03. Put kupca: scrolls directly to Put kupca section
      if (targetId === 'put-kupca' || targetId === 'journey') {
        e.preventDefault();
        const pkEl = document.getElementById('put-kupca');
        if (pkEl) {
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(pkEl, { duration: 1.2 });
            else window.scrollTo({ top: pkEl.offsetTop, behavior: 'smooth' });
          }, 80);
          setActiveLink('put-kupca');
          return;
        }
      }

      // Responzivnost: scrolls directly to before laptop opens (start of 3D showcase)
      if (targetId === 'devices') {
        e.preventDefault();
        const st = ScrollTrigger.getById('unified-showcase-trigger');
        if (st) {
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(st.start, { duration: 1.2 });
            else window.scrollTo({ top: st.start, behavior: 'smooth' });
          }, 80);
          setActiveLink('devices');
          return;
        }
      }

      // 04. Portfolio / Radovi: scrolls directly to where the horizontal projects begin ("Naši radovi")
      if (targetId === 'portfolio' || targetId === 'radovi' || targetId === 'work') {
        e.preventDefault();
        const st = ScrollTrigger.getById('unified-showcase-trigger');
        if (st) {
          const portfolioStart = st.start + Math.round(window.innerHeight * 0.65) + window.innerWidth;
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(portfolioStart, { duration: 1.2 });
            else window.scrollTo({ top: portfolioStart, behavior: 'smooth' });
          }, 80);
          setActiveLink('portfolio');
          return;
        }
      }

      // 05. Kako radimo / Kako razmišljamo / Approach
      if (targetId === 'kako-razmisljamo' || targetId === 'kako-radimo' || targetId === 'approach') {
        e.preventDefault();
        const krEl = document.getElementById('kako-razmisljamo');
        if (krEl) {
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(krEl, { duration: 1.2 });
            else krEl.scrollIntoView({ behavior: 'smooth' });
          }, 80);
          setActiveLink('kako-razmisljamo');
          return;
        }
      }

      // 06. Kontakt / Contact
      if (targetId === 'contact' || targetId === 'kontakt') {
        e.preventDefault();
        const contactEl = document.getElementById('contact');
        if (contactEl) {
          setTimeout(() => {
            if (window.lenis) window.lenis.scrollTo(contactEl, { duration: 1.2 });
            else contactEl.scrollIntoView({ behavior: 'smooth' });
          }, 80);
          setActiveLink('contact');
          return;
        }
      }

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        setTimeout(() => {
          if (window.lenis) window.lenis.scrollTo(targetEl, { duration: 1.2 });
          else targetEl.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    });
  });

  // Active link helper & spring blob physics
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blob = document.getElementById('nav-blob');
  let bx = 0, bw = 0, bvx = 0, bvw = 0, btx = 0, btw = 0, bAnim = false;

  function updateBlobTarget(activeEl) {
    if (window.innerWidth <= 768) return;
    if (!links || !blob || !activeEl) return;
    const nr = links.getBoundingClientRect();
    const r = activeEl.getBoundingClientRect();
    if (r.width <= 0) return;
    btx = r.left - nr.left;
    btw = r.width;
    if (reduce) {
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
    const active = document.querySelector('.nav__link--active') || document.querySelector('.nav__link');
    if (active) {
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
    }
  }

  const setActiveLink = (id) => {
    let activeEl = null;
    const linksList = document.querySelectorAll('.nav__link');
    linksList.forEach((link) => {
      const href = link.getAttribute('href');
      const isMatch = href === `#${id}` ||
        ((id === 'o-nama' || id === 'about') && href === '#o-nama') ||
        ((id === 'services' || id === 'usluge' || id === 'ideje' || id === 'track') && href === '#services') ||
        ((id === 'put-kupca' || id === 'journey') && href === '#put-kupca') ||
        ((id === 'portfolio' || id === 'radovi' || id === 'work') && href === '#portfolio') ||
        ((id === 'kako-razmisljamo' || id === 'kako-radimo' || id === 'approach') && href === '#kako-razmisljamo') ||
        ((id === 'contact' || id === 'kontakt') && href === '#contact');
      link.classList.toggle('nav__link--active', isMatch);
      link.setAttribute('aria-current', isMatch ? 'true' : 'false');
      if (isMatch) activeEl = link;
    });
    if (activeEl && window.innerWidth > 768) {
      updateBlobTarget(activeEl);
    }
  };

  // Expose global helper for stage synchronization
  window.__setActiveNavLink = setActiveLink;

  window.addEventListener('resize', initBlob);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initBlob);
  }
  setTimeout(initBlob, 250);

  // Scroll spy: O nama (24% of #hero to end of #hero)
  if (heroSection) {
    ScrollTrigger.create({
      trigger: heroSection,
      start: '24% top',
      end: 'bottom top',
      onToggle: ({ isActive }) => {
        if (isActive) setActiveLink('o-nama');
      }
    });
  }

  // Scroll spy: Usluge (#track)
  const trackEl = document.getElementById('track');
  if (trackEl) {
    ScrollTrigger.create({
      trigger: trackEl,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (isActive) setActiveLink('services');
      },
    });
  }

  // Scroll spy: Put kupca
  const putKupcaEl = document.getElementById('put-kupca');
  if (putKupcaEl) {
    ScrollTrigger.create({
      trigger: putKupcaEl,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (isActive) setActiveLink('put-kupca');
      },
    });
  }

  // Scroll spy: Kako razmišljamo
  const krSection = document.getElementById('kako-razmisljamo');
  if (krSection) {
    ScrollTrigger.create({
      trigger: krSection,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (isActive) setActiveLink('kako-razmisljamo');
      },
    });
  }

  // Scroll spy: Kontakt
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    ScrollTrigger.create({
      trigger: contactSection,
      start: 'top center',
      end: 'bottom center',
      onToggle: ({ isActive }) => {
        if (isActive) setActiveLink('contact');
      },
    });
  }

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

  // Prevent browser default uncoordinated jump before GSAP initializes
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

  // Destination target sections based on landing
  let targetElement = null;
  if (hashAnchor === 'zasto-sajt' || hashAnchor === 'uloga') {
    targetElement = document.getElementById('uloga') || document.getElementById('zasto-sajt');
  } else if (hashAnchor === 'kako-razmisljamo' || hashAnchor === 'ne-trazimo') {
    targetElement = document.getElementById('kako-razmisljamo');
  } else if (hashAnchor === 'sistem-iza-ekrana' || hashAnchor === 'sta-ako' || hashAnchor === 'sis') {
    targetElement = document.getElementById('laptop-master-stage') || document.getElementById('sis') || document.getElementById('sistem-iza-ekrana');
  } else if (hashAnchor) {
    targetElement = document.getElementById(hashAnchor);
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

  if (targetElement) {
    const headerOffset = window.innerWidth <= 768 ? 68 : 80;
    const performScroll = (immediate) => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      const rect = targetElement.getBoundingClientRect();
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const targetY = Math.max(0, rect.top + currentScroll - headerOffset);
      if (window.lenis) {
        window.lenis.scrollTo(targetY, {
          immediate: immediate,
          duration: immediate ? 0 : 1.2
        });
      } else {
        window.scrollTo({
          top: targetY,
          behavior: immediate ? 'auto' : 'smooth'
        });
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
    const form = document.getElementById('contact-form');
    const msgInput = document.getElementById('contact-message');

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
