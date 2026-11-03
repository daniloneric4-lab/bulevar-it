/**
 * workGlassBox.js — Portfolio Project Glass Boxes & Case Study Modal Dialog
 * 
 * Rules:
 * - Does NOT alter, refactor or touch existing portfolio animation, line SVG, or card DOM.
 * - Glass boxes exist in a separate overlay layer tracking each project card via getBoundingClientRect() in RAF.
 * - Boxes appear (.on) when the circuit line reaches the card and card is on-screen.
 * - Clicking "Pročitaj više →" opens <dialog class="mx"> with data-lenis-prevent and pauses Lenis scroll.
 * - Closing modal resumes Lenis scroll.
 */

import { RADOVI_DATA } from '../data/radovi.js';
import { getCircuitAnchors } from './horizontalPortfolio.js';
import { getLang, t } from './i18n.js';

export function initWorkGlassBox() {
  const portfolioTrack = document.getElementById('portfolio-cards-track');
  if (!portfolioTrack) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Create or ensure Overlay Container
  let overlay = document.getElementById('work-glass-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'work-glass-overlay';
    overlay.className = 'work-glass-overlay';
    document.body.appendChild(overlay);
  }

  // 2. Create or ensure Dialog Modal in DOM
  let modal = document.getElementById('work-detail-modal');
  if (!modal) {
    modal = document.createElement('dialog');
    modal.id = 'work-detail-modal';
    modal.className = 'mx';
    modal.setAttribute('data-lenis-prevent', 'true');
    modal.setAttribute('aria-labelledby', 'mxT');
    modal.innerHTML = `
      <div class="panel">
        <button class="x" type="button" aria-label="Zatvori" data-close>×</button>
        <div class="tag" id="mxTag"></div>
        <h3 id="mxT"></h3>
        <p class="lead" id="mxLead"></p>
        <div class="grid">
          <div class="blk">
            <h4 data-i18n="port.problem">Problem</h4>
            <p id="mxP"></p>
          </div>
          <div class="blk">
            <h4 data-i18n="port.solution">Rešenje</h4>
            <p id="mxR"></p>
          </div>
          <div class="blk wide">
            <h4 data-i18n="port.whatBuilt">Šta smo napravili</h4>
            <ul id="mxL"></ul>
          </div>
          <div class="blk wide">
            <h4 data-i18n="port.results">Rezultat</h4>
            <div class="stats" id="mxS"></div>
          </div>
        </div>
        <div class="act">
          <a class="go" id="mxGo" target="_blank" rel="noopener noreferrer">
            <span id="mxGoText">Poseti sajt ↗</span>
          </a>
          <button class="cl" type="button" data-close data-i18n="port.close">Zatvori</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // 3. Render Glass Boxes into Overlay
  overlay.innerHTML = '';
  const boxes = [];
  const shown = [false, false];

  [0, 1].forEach((idx) => {
    const box = document.createElement('div');
    box.className = 'gbox';
    box.id = `portfolio-gbox-${idx}`;
    box.setAttribute('role', 'region');
    box.setAttribute('aria-hidden', 'true');

    box.innerHTML = `
      <div class="row">
        <div class="t" data-i18n="port.problem">Problem</div>
        <p class="gbox-p"></p>
      </div>
      <div class="row">
        <div class="t" data-i18n="port.solution">Rešenje</div>
        <p class="gbox-r"></p>
      </div>
      <button class="more" type="button" data-open="${idx}" tabindex="-1">
        <span class="more-label">Pročitaj više</span> <i>→</i>
      </button>
    `;

    overlay.appendChild(box);
    boxes.push(box);
  });

  // Helper to populate box text based on current language
  function updateGlassBoxesText() {
    const lang = getLang() || 'sr';
    const dataList = RADOVI_DATA[lang] || RADOVI_DATA.sr;

    boxes.forEach((box, idx) => {
      const data = dataList[idx];
      if (!data) return;

      box.setAttribute('aria-label', `${data.title}: ${t('port.problem', 'problem')} i ${t('port.solution', 'rešenje')}`);
      const pEl = box.querySelector('.gbox-p');
      const rEl = box.querySelector('.gbox-r');
      const moreLabel = box.querySelector('.more-label');

      if (pEl) pEl.textContent = data.small.problem;
      if (rEl) rEl.textContent = data.small.solution;
      if (moreLabel) moreLabel.textContent = t('port.more', 'Pročitaj više');
    });
  }

  updateGlassBoxesText();

  // 4. Position & Reveal Loop in requestAnimationFrame
  let rafId = null;

  function updateBoxes() {
    const clipRect = document.getElementById('circuitClipRect');
    const currentLineX = clipRect ? parseFloat(clipRect.getAttribute('width') || '0') : 0;
    const anchors = getCircuitAnchors();
    const cards = portfolioTrack.querySelectorAll('.curtis-card');

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const stage = document.querySelector('#devices');
    const stageRect = stage ? stage.getBoundingClientRect() : null;
    const isStageVisible = stageRect ? (stageRect.bottom > 100 && stageRect.top < vh - 60) : true;

    const isMobile = vw <= 768;
    const isShortScreen = vw > 768 && vh <= 880;
    if (!isStageVisible) {
      boxes.forEach((box, i) => {
        if (shown[i]) {
          shown[i] = false;
          box.classList.remove('on');
          box.setAttribute('aria-hidden', 'true');
          const moreBtn = box.querySelector('.more');
          if (moreBtn) moreBtn.tabIndex = -1;
        }
      });
      rafId = requestAnimationFrame(updateBoxes);
      return;
    }
    const boxStates = [];
    boxes.forEach((box, i) => {
      const card = cards[i];
      if (!card || !isStageVisible) {
        if (shown[i]) {
          shown[i] = false;
          box.classList.remove('on');
          box.setAttribute('aria-hidden', 'true');
          const moreBtn = box.querySelector('.more');
          if (moreBtn) moreBtn.tabIndex = -1;
        }
        return;
      }

      const cardRect = card.getBoundingClientRect();
      const caption = card.querySelector('.curtis-card__caption');
      const capRect = caption ? caption.getBoundingClientRect() : cardRect;

      // Position: below the caption, constrained inside viewport
      const isMobile = vw <= 768;
      const bw = box.offsetWidth || Math.min(480, vw - 32);
      const left = isMobile
        ? Math.max(16, (vw - bw) / 2)
        : cardRect.left;

      const boxH = box.offsetHeight || (isMobile ? 135 : 180);
      const maxTop = vh - boxH - (isMobile ? 14 : 20);
      const computedTop = Math.min(maxTop, capRect.bottom + (isMobile ? 8 : 12));
      const top = capRect.bottom + (isMobile ? 8 : 12);

      box.style.left = `${left.toFixed(1)}px`;
      box.style.top = `${top.toFixed(1)}px`;

      // Check if card is comfortably inside visible viewport BOTH horizontally and vertically
      const cc = (cardRect.left + cardRect.right) / 2;
      const inViewVert = cardRect.bottom > (isMobile ? 180 : (isShortScreen ? 90 : 120)) && cardRect.top < vh - 80;
      const inViewHoriz = isMobile
        ? (cardRect.right > vw * 0.20 && cardRect.left < vw * 0.80)
        : (cardRect.left >= 12 && (cardRect.left + bw) <= vw - 12);

      const inView = inViewVert && inViewHoriz;

      // Check if stretching circuit line has reached this card
      let hasReached = false;
      if (anchors && anchors[i]) {
        hasReached = currentLineX >= anchors[i].left - 10 || cardRect.left < vw * 0.62;
      } else {
        // Fallback: if anchors not ready yet, reveal when in view
        hasReached = cardRect.left < vw * 0.75;
      }

      const isVisible = hasReached && inView;
      boxStates[i] = {
        vis: isVisible,
        left,
        right: left + bw,
        top,
        bottom: top + boxH,
        cardLeft: cardRect.left,
        cardRight: cardRect.right,
        dist: Math.abs(cc - vw * 0.5)
      };
      if (false && isVisible !== shown[i]) {
        shown[i] = isVisible;
        box.classList.toggle('on', isVisible);
        box.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        const moreBtn = box.querySelector('.more');
        if (moreBtn) moreBtn.tabIndex = isVisible ? 0 : -1;
      }
    });

    if (boxStates[0] && boxStates[1]) {
      const s0 = boxStates[0], s1 = boxStates[1];
      if (s0.vis && s1.vis) {
        if (isMobile || s0.right + 20 > s1.left) {
          if (s0.dist <= s1.dist) s1.vis = false;
          else s0.vis = false;
        }
      }
    }
    boxes.forEach((box, i) => {
      const st = boxStates[i];
      if (!st) return;
      const isVisible = st.vis;
      if (isVisible !== shown[i]) {
        shown[i] = isVisible;
        box.classList.toggle('on', isVisible);
        box.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
        const moreBtn = box.querySelector('.more');
        if (moreBtn) moreBtn.tabIndex = isVisible ? 0 : -1;
      }
    });
    rafId = requestAnimationFrame(updateBoxes);
  }

  rafId = requestAnimationFrame(updateBoxes);

  // 5. Large Modal Handling
  let activeOpener = null;

  function openDetailModal(index) {
    const lang = getLang() || 'sr';
    const dataList = RADOVI_DATA[lang] || RADOVI_DATA.sr;
    const project = dataList[index];
    if (!project) return;

    activeOpener = document.activeElement;

    // Stop Lenis smooth scroll while modal is open
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }
    document.body.style.overflow = 'hidden';

    // Populate Modal Elements
    const tagEl = document.getElementById('mxTag');
    const tEl = document.getElementById('mxT');
    const leadEl = document.getElementById('mxLead');
    const pEl = document.getElementById('mxP');
    const rEl = document.getElementById('mxR');
    const lEl = document.getElementById('mxL');
    const sEl = document.getElementById('mxS');
    const goEl = document.getElementById('mxGo');
    const goText = document.getElementById('mxGoText');

    if (tagEl) tagEl.textContent = project.modal.tag;
    if (tEl) tEl.textContent = project.modal.title;
    if (leadEl) leadEl.textContent = project.modal.lead;
    if (pEl) pEl.textContent = project.modal.problem;
    if (rEl) rEl.textContent = project.modal.solution;

    if (lEl) {
      lEl.innerHTML = project.modal.whatBuilt
        .map((item) => `<li>${item}</li>`)
        .join('');
    }

    if (sEl) {
      sEl.innerHTML = project.modal.results
        .map(([val, desc]) => `<div><b>${val}</b><span>${desc}</span></div>`)
        .join('');
    }

    if (goEl) {
      goEl.href = project.url;
      if (goText) {
        goText.textContent = project.modal.visitText || `${t('port.visit', 'Poseti sajt')} ↗`;
      }
    }

    modal.classList.remove('closing');
    try {
      modal.showModal();
    } catch (e) {
      modal.setAttribute('open', '');
    }
    modal.scrollTop = 0;
  }

  function closeDetailModal() {
    if (!modal.open && !modal.hasAttribute('open')) return;

    if (reduce) {
      finishCloseModal();
      return;
    }

    modal.classList.add('closing');
    setTimeout(finishCloseModal, 260);
  }

  function finishCloseModal() {
    modal.classList.remove('closing');
    try {
      modal.close();
    } catch (e) {
      modal.removeAttribute('open');
    }
    document.body.style.overflow = '';

    // Resume Lenis smooth scroll
    if (window.lenis && typeof window.lenis.start === 'function') {
      window.lenis.start();
    }

    if (activeOpener && typeof activeOpener.focus === 'function') {
      activeOpener.focus();
    }
  }

  // Global click delegator for opening and closing modal
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-open]');
    if (openBtn) {
      e.preventDefault();
      e.stopPropagation();
      const idx = parseInt(openBtn.getAttribute('data-open') || '0', 10);
      openDetailModal(idx);
      return;
    }

    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      e.preventDefault();
      closeDetailModal();
      return;
    }

    // Backdrop click: close modal when clicking on dialog element directly
    if (e.target === modal) {
      closeDetailModal();
    }
  });

  // Keyboard navigation: Escape key closes modal cleanly
  modal.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDetailModal();
  });

  // Listen for language changes to update glass boxes and open modal
  window.addEventListener('bulevar:langchange', () => {
    updateGlassBoxesText();
  });
}
