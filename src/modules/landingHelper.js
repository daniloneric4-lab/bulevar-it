/**
 * landingHelper.js — Common logic for Bulevar.IT Google Ads landing pages
 * - Forwarding of Google Ads attribution (gclid, utm_*, izvor, cilj)
 * - Seamless deep linking to main portfolio sections with preserved parameters
 * - Shared questionnaire modal with multi-step choice chips and prefill
 */

import { initI18n, t, getLang } from './i18n.js';

export function initLandingPage({ defaultAnchor = 'uloga', defaultCilj = '', defaultIzvor = 'lp' } = {}) {
  // 0. Initialize language switcher for landing pages
  initI18n('lp');

  // 1. Parse current URL parameters
  const currentParams = new URLSearchParams(window.location.search);
  if (!currentParams.has('izvor') && defaultIzvor) {
    currentParams.set('izvor', defaultIzvor);
  }
  if (!currentParams.has('cilj') && defaultCilj) {
    currentParams.set('cilj', defaultCilj);
  }

  // 2. Setup secondary "Pogledajte detalje" links
  const detailLinks = document.querySelectorAll('[data-detail-anchor]');
  detailLinks.forEach((link) => {
    const anchor = link.getAttribute('data-detail-anchor') || defaultAnchor;
    const url = buildMainUrl(anchor, currentParams);
    link.setAttribute('href', url);
  });

  // 3. Setup Questionnaire Modal (Zajednički upitnik)
  setupQuestionnaireModal(currentParams);

  // 4. Initialize signature decode text animation & block entrance animations
  initLandingTextAnimations();
  initLandingBlockAnimations();

  // 5. Expose helper for dynamic links
  window.__buildMainUrl = (anchor, extraParams = {}) => {
    const p = new URLSearchParams(currentParams);
    Object.entries(extraParams).forEach(([k, v]) => p.set(k, v));
    return buildMainUrl(anchor, p);
  };
}

function buildMainUrl(anchor, params) {
  const cleanAnchor = anchor.startsWith('#') ? anchor.slice(1) : anchor;
  const paramString = params.toString();
  // Format requested by user: bulevar.it/#zasto-sajt?cilj=zakazivanje&izvor=lp1
  if (paramString) {
    return `/#${cleanAnchor}?${paramString}`;
  }
  return `/#${cleanAnchor}`;
}

function setupQuestionnaireModal(currentParams) {
  const modal = document.getElementById('lp-modal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('.js-open-upitnik');
  const closeBtn = modal.querySelector('.lp-modal-close');
  const backdrop = modal.querySelector('.lp-modal-backdrop');
  const form = modal.querySelector('#lp-questionnaire-form');
  const successBanner = modal.querySelector('.form-success-banner');

  let modalPushedState = false;

  function openModal(prefillGoal = '') {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Push history state so Android Back button and iOS swipe right close modal
    if (!modalPushedState) {
      try {
        history.pushState({ lpModal: true }, '');
        modalPushedState = true;
      } catch (e) {}
    }

    // If specific goal chip provided
    if (prefillGoal) {
      const chip = modal.querySelector(`.form-chip-btn[data-goal="${prefillGoal}"]`);
      if (chip) {
        modal.querySelectorAll('.form-chip-btn[data-goal]').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const goalInput = modal.querySelector('input[name="cilj"]');
        if (goalInput) goalInput.value = prefillGoal;
      }
    }
  }

  function closeModal(fromPopState = false) {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (modalPushedState && !fromPopState) {
      modalPushedState = false;
      try {
        history.back();
      } catch (e) {}
    } else {
      modalPushedState = false;
    }
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const goal = btn.getAttribute('data-goal') || currentParams.get('cilj') || '';
      openModal(goal);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(false));
  if (backdrop) backdrop.addEventListener('click', () => closeModal(false));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal(false);
    }
  });

  window.addEventListener('popstate', () => {
    if (modal.classList.contains('is-open')) {
      closeModal(true);
    }
  });

  // Inject hidden tracking inputs into questionnaire form
  if (form) {
    ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'izvor', 'cilj'].forEach((key) => {
      const val = currentParams.get(key);
      if (val) {
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

    // Chip selections in questionnaire
    const goalChips = form.querySelectorAll('.form-chip-btn[data-goal]');
    goalChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        goalChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const goal = chip.getAttribute('data-goal');
        const goalInput = form.querySelector('input[name="cilj"]');
        if (goalInput) goalInput.value = goal;
      });
    });

    const bizChips = form.querySelectorAll('.form-chip-btn[data-biz]');
    bizChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        bizChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const biz = chip.getAttribute('data-biz');
        const bizInput = form.querySelector('input[name="delatnost"]');
        if (bizInput) bizInput.value = biz;
      });
    });

    // Hidden load-time field (anti-spam: server odbija slanje brže od 3 s od učitavanja)
    let loadedInput = form.querySelector('input[name="ucitano"]');
    if (!loadedInput) {
      loadedInput = document.createElement('input');
      loadedInput.type = 'hidden';
      loadedInput.name = 'ucitano';
      form.appendChild(loadedInput);
    }
    loadedInput.value = String(Date.now());

    let hpInput = form.querySelector('input[name="website"]');
    if (!hpInput) {
      hpInput = document.createElement('input');
      hpInput.type = 'text';
      hpInput.name = 'website';
      hpInput.tabIndex = -1;
      hpInput.autocomplete = 'off';
      hpInput.setAttribute('aria-hidden', 'true');
      hpInput.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
      form.appendChild(hpInput);
    }

    // AJAX submit handler connected to /api/contact
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const submitSpan = submitBtn ? (submitBtn.querySelector('[data-i18n="modal.submit"]') || submitBtn) : null;
      const origText = submitSpan ? submitSpan.textContent : '';

      if (submitBtn) submitBtn.disabled = true;
      if (submitSpan) submitSpan.textContent = t('kon.sending', 'Šaljem…');

      const formData = new FormData(form);
      const utmData = {};
      ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'izvor', 'cilj'].forEach((k) => {
        const v = formData.get(k) || currentParams.get(k);
        if (v) utmData[k] = String(v);
      });

      const payload = {
        ime: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        telefon: String(formData.get('phone') || '').trim(),
        poruka: String(formData.get('message') || '').trim(),
        cilj: String(formData.get('cilj') || '').trim(),
        delatnost: String(formData.get('delatnost') || '').trim(),
        stranica: window.location.pathname,
        jezik: getLang() === 'en' ? 'en' : 'sr',
        website: String(formData.get('website') || ''),
        ucitano: Number(loadedInput?.value) || 0,
        poslato: Date.now(),
        utm: utmData,
      };

      let success = false;
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => null);
        success = res.ok && !!json && json.ok === true;
      } catch (err) {
        success = false;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitSpan) submitSpan.textContent = t('modal.submit', origText || 'Pošaljite upit →');
      }

      if (success) {
        if (successBanner) {
          successBanner.style.display = 'block';
          successBanner.style.borderColor = 'rgba(52, 199, 89, 0.35)';
          successBanner.style.background = 'rgba(52, 199, 89, 0.12)';
          successBanner.style.color = '#75f096';
          successBanner.textContent = t('kon.doneP');
        }
        form.reset();
        loadedInput.value = String(Date.now());
      } else if (successBanner) {
        // Polja ostaju popunjena
        successBanner.style.display = 'block';
        successBanner.style.borderColor = 'rgba(232, 150, 58, 0.45)';
        successBanner.style.background = 'rgba(232, 150, 58, 0.12)';
        successBanner.style.color = '#E8963A';
        successBanner.textContent = t('kon.error');
      }
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   BULEVAR.IT SIGNATURE ANIMATION ENGINES
   1. Matrix/Scramble Text Decode ("ona naša animacija")
   2. Staggered Scroll Reveal & Elevation for Blocks
   ═══════════════════════════════════════════════════════════════ */

const GL = 'ABCDEFGHIJKLMNOPRSTUVZŠĐČĆŽ0123456789#%/+<>';

/**
 * Splits text inside element into character spans, preserving HTML structure (e.g. <span class="accent">).
 * Runs the Bulevar.IT signature scramble decode animation.
 */
export function decodeElement(el, { duration = 1200, delay = 0, onComplete } = {}) {
  if (!el || el.dataset.decActive === 'true' || el.dataset.decActive === 'done') return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    el.dataset.decActive = 'done';
    return;
  }

  el.dataset.decActive = 'true';

  // Walk all text nodes and replace each character with <span class="dec-char dec-h" data-orig="...">
  const chars = [];
  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || text.length === 0) return;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement('span');
        span.className = 'dec-char dec-h';
        span.textContent = char;
        span.dataset.orig = char;
        frag.appendChild(span);
        chars.push(span);
      }
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      Array.from(node.childNodes).forEach(walk);
    }
  }

  walk(el);

  if (!chars.length) {
    el.dataset.decActive = 'done';
    return;
  }

  const n = chars.length;
  const t0 = performance.now() + delay;

  function step(now) {
    if (now < t0) {
      requestAnimationFrame(step);
      return;
    }

    const elapsed = now - t0;
    const p = Math.min(1, elapsed / duration);
    // Cursor index with 4-5 scramble wave ahead of finished text
    const k = Math.floor(p * (n + 5)) - 5;

    chars.forEach((span, i) => {
      const orig = span.dataset.orig;
      if (p >= 1 || i < k) {
        if (span.className !== 'dec-char dec-f') {
          span.className = 'dec-char dec-f';
          span.textContent = orig;
        }
      } else if (i < k + 5 && orig !== ' ' && orig !== '\n' && orig !== '\t') {
        span.className = 'dec-char dec-r';
        span.textContent = GL[(Math.random() * GL.length) | 0];
      } else {
        if (span.className !== 'dec-char dec-h') {
          span.className = 'dec-char dec-h';
          span.textContent = orig;
        }
      }
    });

    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      el.dataset.decActive = 'done';
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(step);
}

/**
 * Initializes headline and letter animations across landing page
 */
export function initLandingTextAnimations() {
  // 1. Hero elements
  const badge = document.querySelector('.lp-badge');
  const title = document.querySelector('.lp-title');
  const subtitle = document.querySelector('.lp-subtitle');

  if (badge) {
    decodeElement(badge, { duration: 600, delay: 120 });
  }
  if (title) {
    decodeElement(title, { duration: 1100, delay: 320 });
  }
  if (subtitle) {
    decodeElement(subtitle, { duration: 1350, delay: 720 });
  }

  // 2. Scroll-triggered headlines (Outro H2, Section H3, or any [data-decode])
  const scrollDecodes = document.querySelectorAll('.lp-outro h2, [data-decode], .lp-main > div > h3, .builder-controls > h3');
  if ('IntersectionObserver' in window && scrollDecodes.length) {
    const textObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        textObserver.unobserve(el);
        setTimeout(() => {
          decodeElement(el, { duration: 950, delay: 60 });
        }, 100);
      });
    }, { threshold: 0.15 });

    scrollDecodes.forEach((el) => {
      if (el !== badge && el !== title && el !== subtitle) {
        textObserver.observe(el);
      }
    });
  }
}

/**
 * Initializes staggered scroll reveal and elevation animations for cards & content blocks
 */
export function initLandingBlockAnimations() {
  // Mark HTML root so CSS knows animations can be enabled safely
  document.documentElement.classList.add('lp-js-ready');

  // 1. Hero CTA buttons entrance
  const heroBtnGroup = document.querySelector('.lp-btn-group');
  if (heroBtnGroup) {
    setTimeout(() => {
      heroBtnGroup.classList.add('is-in-view');
    }, 900);
  }

  // 2. All content blocks to observe
  const blockSelectors = [
    '.lp-steps-grid',
    '.lp-step-card',
    '.lp-goals-grid',
    '.lp-goal-card',
    '.system-builder-grid',
    '.builder-controls',
    '.laptop-preview-card',
    '.lp-outro',
    '.lp-anim-block'
  ];

  const blocks = document.querySelectorAll(blockSelectors.join(', '));
  if (!blocks.length) return;

  if ('IntersectionObserver' in window) {
    const blockObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-in-view');

        // If it's a grid container, stagger reveal child cards
        if (el.classList.contains('lp-steps-grid') || el.classList.contains('lp-goals-grid')) {
          const cards = el.querySelectorAll('.lp-step-card, .lp-goal-card');
          cards.forEach((card, idx) => {
            setTimeout(() => {
              card.classList.add('is-in-view');
            }, idx * 85);
          });
        }

        blockObserver.unobserve(el);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    blocks.forEach((b) => blockObserver.observe(b));
  } else {
    // Immediate fallback
    blocks.forEach((b) => b.classList.add('is-in-view'));
  }
}

