/**
 * scrollHint.js — Smart idle scroll reminder ("SKROLUJ" / "SCROLL")
 *
 * Rules:
 * - Same visual style as the hero #hero-hint indicator (font, size, letter-spacing, color, flowing gold line).
 * - Fixed at bottom-center (~28px + safe-area-inset-bottom), high z-index, pointer-events: none.
 * - Appears after 4s of inactivity (scroll, Lenis scroll, wheel, touchmove, scroll keys).
 * - Hides immediately on any activity and restarts timer.
 * - Does NOT appear:
 *   1. While hero #hero-hint is still visible (first screen)
 *   2. When focus is inside a form field (input, textarea, select) or a form is visible on screen
 *   3. When "Pročitaj više" work modal or any modal/dialog is open
 *   4. In the last ~150px of the page (footer bottom)
 *   5. When tab is hidden (document.hidden)
 * - Maximum 3 appearances per session (stored in sessionStorage with try/catch).
 */

import { t } from './i18n.js';

const STORAGE_KEY = 'bulevar_scroll_hint_count';
const MAX_SHOWS = 3;
const IDLE_MS = 4000;

const SCROLL_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  ' ',
  'Spacebar',
  'PageDown',
  'PageUp',
  'Home',
  'End'
]);

export function initScrollHint(lenisInstance) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let showCount = 0;
  try {
    showCount = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
  } catch (e) {
    showCount = 0;
  }

  if (showCount >= MAX_SHOWS) return;

  let el = document.getElementById('smart-scroll-hint');
  if (!el) {
    el = document.createElement('div');
    el.id = 'smart-scroll-hint';
    el.className = 'hint scroll-hint';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<span data-i18n="scrollHint">${t('scrollHint', 'SKROLUJ')}</span><i></i>`;
    document.body.appendChild(el);
  }

  const labelEl = el.querySelector('[data-i18n="scrollHint"]');

  window.addEventListener('bulevar:langchange', () => {
    if (labelEl) {
      labelEl.textContent = t('scrollHint', 'SKROLUJ');
    }
  });

  let timerId = null;
  let isVisible = false;
  const lenis = lenisInstance || window.lenis;
  let lenisUnsub = null;

  function canShow() {
    if (showCount >= MAX_SHOWS) return false;
    if (document.hidden) return false;

    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // 1. Do not show on first screen or while hero #hero-hint is still visible
    if (scrollY < 60) return false;
    const heroHint = document.getElementById('hero-hint');
    if (heroHint) {
      const hs = window.getComputedStyle(heroHint);
      const hr = heroHint.getBoundingClientRect();
      if (
        hs.display !== 'none' &&
        hs.visibility !== 'hidden' &&
        parseFloat(hs.opacity) > 0.02 &&
        hr.bottom > 0 &&
        hr.top < vh
      ) {
        return false;
      }
    }

    // 2. Do not show when focus is in any form field or when a form is visible on screen
    const active = document.activeElement;
    if (active && typeof active.matches === 'function') {
      if (active.matches('input, textarea, select, [contenteditable="true"]') || active.closest('form')) {
        return false;
      }
    }

    const forms = document.querySelectorAll('#kfForm, #kfCard, form');
    for (let i = 0; i < forms.length; i++) {
      const f = forms[i];
      const fs = window.getComputedStyle(f);
      if (fs.display === 'none' || fs.visibility === 'hidden') continue;
      const fr = f.getBoundingClientRect();
      if (fr.width > 0 && fr.height > 0 && fr.top < vh && fr.bottom > 0) {
        return false;
      }
    }

    // 3. Do not show when "Pročitaj više" modal or any other modal/dialog is open
    const workModal = document.getElementById('work-detail-modal');
    if (workModal && (workModal.open || workModal.hasAttribute('open'))) {
      return false;
    }
    if (
      document.querySelector(
        'dialog[open], .mx[open], #device-modal[aria-hidden="false"], .device-modal.is-open, .modal-overlay.is-open, .nav--open'
      )
    ) {
      return false;
    }

    // 4. Do not show at the bottom of the page (last ~150px, footer)
    const docH = Math.max(
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0
    );
    const maxScroll = Math.max(0, docH - vh);
    if (maxScroll - scrollY <= 150) {
      return false;
    }

    return true;
  }

  function hideHint() {
    if (isVisible) {
      isVisible = false;
      el.classList.remove('is-visible');
    }
  }

  function cleanupListeners() {
    clearTimeout(timerId);
    timerId = null;
    if (typeof lenisUnsub === 'function') {
      lenisUnsub();
      lenisUnsub = null;
    } else if (lenis && typeof lenis.off === 'function') {
      lenis.off('scroll', onActivity);
    }
    window.removeEventListener('scroll', onActivity);
    window.removeEventListener('wheel', onActivity);
    window.removeEventListener('touchmove', onActivity);
    window.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('focusin', onFocusIn);
    document.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  function scheduleTimer() {
    clearTimeout(timerId);
    timerId = null;
    if (showCount >= MAX_SHOWS || document.hidden) return;

    timerId = setTimeout(() => {
      timerId = null;
      if (canShow()) {
        isVisible = true;
        el.classList.add('is-visible');
        showCount += 1;
        try {
          sessionStorage.setItem(STORAGE_KEY, String(showCount));
        } catch (e) {}
      }
    }, IDLE_MS);
  }

  function onActivity() {
    hideHint();
    if (showCount >= MAX_SHOWS) {
      cleanupListeners();
      return;
    }
    scheduleTimer();
  }

  function onKeyDown(e) {
    if (SCROLL_KEYS.has(e.key) || e.code === 'Space') {
      onActivity();
    }
  }

  function onFocusIn(e) {
    const target = e.target;
    if (target && typeof target.matches === 'function') {
      if (target.matches('input, textarea, select, [contenteditable="true"]') || target.closest('form')) {
        hideHint();
        clearTimeout(timerId);
        timerId = null;
      }
    }
  }

  function onFocusOut() {
    if (!isVisible && showCount < MAX_SHOWS) {
      scheduleTimer();
    }
  }

  function onDocClick(e) {
    const target = e.target;
    if (target && typeof target.closest === 'function' && target.closest('[data-open], [data-close], dialog')) {
      hideHint();
      clearTimeout(timerId);
      timerId = null;
      if (showCount < MAX_SHOWS) {
        scheduleTimer();
      }
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      hideHint();
      clearTimeout(timerId);
      timerId = null;
    } else if (showCount < MAX_SHOWS) {
      scheduleTimer();
    }
  }

  if (lenis && typeof lenis.on === 'function') {
    lenisUnsub = lenis.on('scroll', onActivity);
  }

  window.addEventListener('scroll', onActivity, { passive: true });
  window.addEventListener('wheel', onActivity, { passive: true });
  window.addEventListener('touchmove', onActivity, { passive: true });
  window.addEventListener('keydown', onKeyDown, { passive: true });
  document.addEventListener('focusin', onFocusIn, { passive: true });
  document.addEventListener('focusout', onFocusOut, { passive: true });
  document.addEventListener('click', onDocClick, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange, { passive: true });

  scheduleTimer();
}

