/**
 * horizontalPortfolio.js — Curtis Nguyen style Organic Horizontal Scroll Portfolio
 * Matches the reference layout:
 * - Organic scattered layout matching Curtis Nguyen:
 *   Bottom -> Top -> Bottom -> Top App -> Center -> Top App -> Bottom App -> Top -> Bottom
 * - iOS27 Liquid Glass blocks with specular highlights & interactive mouse-tracking shake
 * - Circuit line connects to each card's edge and exits the other side, NEVER crossing inside the card
 * - Progressive scroll-driven line stretching starting immediately from Petra's Stolovi
 */
import { projects, categoryConfig } from '../data/portfolio.js';

// Organic staggered layout presets directly referencing Curtis Nguyen portfolio
// Elevated vertically to align with the phone/laptop position while maintaining comfortable header margins
export const scatteredProjects = [
  { projectIndex: 0, w: 480, h: 300, yOffset: -25, marginR: 200, tag: 'SISTEM ZA DOGAĐAJE' },
  { projectIndex: 1, w: 420, h: 340, yOffset: 25,  marginR: 300, tag: 'DIGITALNI SISTEM' },
];

export function renderHorizontalPortfolio(trackSelector) {
  const track = document.querySelector(trackSelector);
  if (!track) {
    console.warn('[horizontalPortfolio] Track element not found');
    return;
  }

  track.innerHTML = '';

  scatteredProjects.forEach((item) => {
    const proj = projects[item.projectIndex];
    if (!proj) return;
    const catCfg = categoryConfig[proj.category] || categoryConfig.web;

    const card = document.createElement('article');
    card.className = 'curtis-card curtis-card--scattered';
    card.dataset.category = proj.category;
    card.dataset.projIndex = String(item.projectIndex);
    card.dataset.baseY = String(item.yOffset);
    card.style.setProperty('--base-y', `${item.yOffset}px`);

    card.style.width = `${item.w}px`;
    card.style.marginRight = `${item.marginR}px`;
    card.style.transform = `translateY(${item.yOffset}px)`;

    card.innerHTML = `
      <div class="curtis-card__frame ios27-glass" style="height: ${item.h}px;">
        <img class="curtis-card__img" src="${proj.thumbnail}" alt="${proj.name}" loading="lazy" />
        <div class="curtis-card__glass-reflection" aria-hidden="true"></div>
        <div class="curtis-card__badge-wrap">
          <span class="curtis-card__badge curtis-card__badge--${catCfg.colorClass}">${item.tag || catCfg.label}</span>
        </div>
        <div class="curtis-card__overlay">
          <span class="curtis-card__open-pill">OTVORI PROJEKAT ↗</span>
        </div>
      </div>
      <div class="curtis-card__caption">
        <span class="curtis-card__title">${proj.name.toUpperCase()}</span>
        <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="curtis-card__visit">
          POSETI <span class="visit-arrow">↗</span>
        </a>
      </div>
    `;

    // ─── Interactive Mouse Hover & Movement Shake ───
    let lastMouseX = null;
    let shakeTimer = null;

    card.addEventListener('mouseenter', (e) => {
      card.classList.add('is-hover-shake');
      setTimeout(() => card.classList.remove('is-hover-shake'), 380);
      lastMouseX = e.clientX;
    });

    card.addEventListener('mousemove', (e) => {
      if (lastMouseX === null) {
        lastMouseX = e.clientX;
        return;
      }
      const deltaX = e.clientX - lastMouseX;
      lastMouseX = e.clientX;

      // Playful responsive jitter/shake when user wiggles mouse left-right
      const rot = Math.max(-2.5, Math.min(2.5, deltaX * 0.4));
      const transX = Math.max(-4, Math.min(4, deltaX * 0.3));

      card.style.transform = `translateY(${item.yOffset}px) rotate(${rot}deg) translateX(${transX}px)`;

      clearTimeout(shakeTimer);
      shakeTimer = setTimeout(() => {
        card.style.transform = `translateY(${item.yOffset}px) rotate(0deg) translateX(0px)`;
      }, 100);
    });

    card.addEventListener('mouseleave', () => {
      lastMouseX = null;
      clearTimeout(shakeTimer);
      card.style.transform = `translateY(${item.yOffset}px) rotate(0deg) translateX(0px)`;
    });

    card.addEventListener('click', (e) => {
      if (!e.target.closest('a') && proj.link) {
        window.open(proj.link, '_blank', 'noopener,noreferrer');
      }
    });

    track.appendChild(card);
  });

  window.__drawCircuitLines = () => drawCircuitLines(track);
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        drawCircuitLines(track);
      } catch (e) {
        console.error('Error drawing circuit lines:', e);
      }
    }, 60);
  });
}

let circuitSegments = [];
let circuitAnchors = [];
let circuitOrigin = { x: 0, y: 0 };
let circuitEnd = { x: 0, y: 0 };

export function getCircuitAnchors() {
  return circuitAnchors;
}

/**
 * Draws the clean, authentic 45° chamfered circuit line connecting all scattered projects
 * IMPORTANT: The line plugs into the card's left side and exits from the right side,
 * NEVER passing inside or over the card!
 */
export function drawCircuitLines(track) {
  const svg = document.querySelector('.portfolio-circuit-svg');
  if (!svg || !track) return;

  const cards = track.querySelectorAll('.curtis-card');
  if (cards.length < 2) return;

  const totalWidth = Math.max(track.scrollWidth, track.offsetWidth);
  const height = track.clientHeight || window.innerHeight;

  svg.setAttribute('viewBox', `0 0 ${totalWidth} ${height}`);
  svg.style.width = `${totalWidth}px`;
  svg.style.height = `${height}px`;

  const svgRect = svg.getBoundingClientRect();

  circuitAnchors = [];
  cards.forEach((card, idx) => {
    const frame = card.querySelector('.curtis-card__frame') || card;
    const fRect = frame.getBoundingClientRect();
    circuitAnchors.push({
      idx,
      left: fRect.left - svgRect.left,
      right: fRect.right - svgRect.left,
      centerY: fRect.top - svgRect.top + fRect.height * 0.5,
    });
  });

  if (circuitAnchors.length < 2) return;

  circuitSegments = [];
  let pathD = '';
  let nodesHtml = '';

  // 1. Initial entrance with authentic diamond origin marker (like video frame 002)
  const first = circuitAnchors[0];
  const originX = Math.max(20, first.left - 240);
  const originY = first.centerY;
  circuitOrigin = { x: originX, y: originY };

  nodesHtml += `
    <!-- Origin Diamond Marker -->
    <g class="circuit-origin-marker" transform="translate(${originX}, ${originY})">
      <rect x="-10" y="-10" width="20" height="20" transform="rotate(45)" fill="none" stroke="#C9A063" stroke-width="1.2" opacity="0.75" />
      <circle cx="0" cy="0" r="3" fill="#F0D9A0" />
    </g>
  `;

  // Draw line from origin up to the LEFT side of the first card
  pathD += `M ${originX + 14} ${originY} L ${first.left} ${first.centerY}`;
  circuitSegments.push({ x1: originX + 14, y1: originY, x2: first.left, y2: first.centerY });

  // Terminal connector dot on the left of first card
  nodesHtml += `
    <g class="circuit-connector-node" transform="translate(${first.left}, ${first.centerY})">
      <circle cx="0" cy="0" r="3" fill="#F0D9A0" opacity="0.9" />
      <circle cx="0" cy="0" r="6" fill="none" stroke="#C9A063" stroke-width="1" opacity="0.5" />
    </g>
  `;

  // 2. Connect consecutive cards without drawing inside any card
  for (let i = 0; i < circuitAnchors.length; i++) {
    const cur = circuitAnchors[i];

    // Card exit: Connector dot at right side of card
    nodesHtml += `
      <g class="circuit-connector-node" transform="translate(${cur.right}, ${cur.centerY})">
        <circle cx="0" cy="0" r="3" fill="#F0D9A0" opacity="0.9" />
        <circle cx="0" cy="0" r="6" fill="none" stroke="#C9A063" stroke-width="1" opacity="0.5" />
      </g>
    `;

    if (i < circuitAnchors.length - 1) {
      const next = circuitAnchors[i + 1];
      const x1 = cur.right;
      const y1 = cur.centerY;
      const x2 = next.left;
      const y2 = next.centerY;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const absDy = Math.abs(dy);

      // Start line at right side of cur card (M cur.right cur.centerY)
      pathD += ` M ${x1} ${y1}`;

      if (absDy >= 15) {
        // Strict chamfer that stays 100% within the gap between cards [x1, x2]
        const gap = x2 - x1;
        const pad = Math.max(16, Math.min(32, gap * 0.18));
        const maxAngleW = Math.max(10, gap - 2 * pad);
        const angleW = Math.min(absDy, maxAngleW);
        const bx1 = x1 + pad;
        const by1 = y1;
        const bx2 = bx1 + angleW;
        const by2 = y2;

        pathD += ` L ${bx1} ${by1} L ${bx2} ${by2} L ${x2} ${y2}`;

        circuitSegments.push({ x1: x1, y1: y1, x2: bx1, y2: by1 });
        circuitSegments.push({ x1: bx1, y1: by1, x2: bx2, y2: by2 });
        circuitSegments.push({ x1: bx2, y1: by2, x2: x2, y2: y2 });

        // Circular junction marker at the first bend
        nodesHtml += `
          <g class="circuit-junction-marker" data-x="${bx1}" transform="translate(${bx1}, ${by1})">
            <circle cx="0" cy="0" r="3" fill="#F0D9A0" opacity="0.8" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="#C9A063" stroke-width="1" stroke-dasharray="2 2" opacity="0.5" />
          </g>
        `;
      } else {
        pathD += ` L ${x2} ${y2}`;
        circuitSegments.push({ x1: x1, y1: y1, x2: x2, y2: y2 });
      }

      // Terminal connector dot on the left of next card
      nodesHtml += `
        <g class="circuit-connector-node" transform="translate(${next.left}, ${next.centerY})">
          <circle cx="0" cy="0" r="3" fill="#F0D9A0" opacity="0.9" />
          <circle cx="0" cy="0" r="6" fill="none" stroke="#C9A063" stroke-width="1" opacity="0.5" />
        </g>
      `;
    }
  }

  // 3. Lead out past the last card
  const last = circuitAnchors[circuitAnchors.length - 1];
  pathD += ` M ${last.right} ${last.centerY} L ${last.right + 120} ${last.centerY} L ${totalWidth} ${last.centerY}`;
  circuitSegments.push({ x1: last.right, y1: last.centerY, x2: last.right + 120, y2: last.centerY });
  circuitSegments.push({ x1: last.right + 120, y1: last.centerY, x2: totalWidth, y2: last.centerY });
  circuitEnd = { x: totalWidth, y: last.centerY };

  svg.innerHTML = `
    <defs>
      <!-- Clip path that reveals the line as it stretches forward with scroll (starts at first.left) -->
      <clipPath id="circuitClip">
        <rect id="circuitClipRect" x="0" y="0" width="${first.left}" height="${height}" />
      </clipPath>
      <filter id="leadGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Active stretching solid gold circuit line (clipped to scroll progress) -->
    <g clip-path="url(#circuitClip)">
      <path class="circuit-path" d="${pathD}" fill="none" stroke="#C9A063" stroke-width="2.2" opacity="0.95" />
      <g class="circuit-nodes-group">
        ${nodesHtml}
      </g>
    </g>

    <!-- Dynamic Lead Drawing Tip Dot that travels right at the front of the stretching line -->
    <g id="circuit-lead-tip" class="circuit-lead-tip" transform="translate(${first.left}, ${first.centerY})">
      <circle cx="0" cy="0" r="3.5" fill="#FFF2C6" filter="url(#leadGlow)" />
      <circle cx="0" cy="0" r="7" fill="none" stroke="#F0D9A0" stroke-width="1.2" opacity="0.8" />
    </g>
  `;
}

/**
 * Progressively draws and stretches the circuit line between projects as user scrolls
 */
export function updateCircuitProgress(revealedX) {
  const clipRect = document.getElementById('circuitClipRect');
  const leadTip = document.getElementById('circuit-lead-tip');
  if (!clipRect || !circuitSegments.length) return;

  const boundedX = Math.max(0, revealedX);
  clipRect.setAttribute('width', String(boundedX));

  if (leadTip) {
    if (boundedX < circuitOrigin.x) {
      leadTip.style.opacity = '0';
    } else {
      // Check if boundedX is currently traversing or resting inside a card
      let isInsideCard = false;
      for (let i = 0; i < circuitAnchors.length; i++) {
        const a = circuitAnchors[i];
        if (boundedX >= a.left - 2 && boundedX <= a.right + 2) {
          isInsideCard = true;
          break;
        }
      }

      if (isInsideCard) {
        leadTip.style.opacity = '0';
      } else {
        leadTip.style.opacity = '1';

        // Find the segment where boundedX lies to calculate exact Y
        let tipY = circuitOrigin.y;
        for (let i = 0; i < circuitSegments.length; i++) {
          const seg = circuitSegments[i];
          if (boundedX >= seg.x1 && boundedX <= seg.x2) {
            if (Math.abs(seg.x2 - seg.x1) < 0.001) {
              tipY = seg.y2;
            } else {
              const t = (boundedX - seg.x1) / (seg.x2 - seg.x1);
              tipY = seg.y1 + (seg.y2 - seg.y1) * t;
            }
            break;
          } else if (boundedX > seg.x2) {
            tipY = seg.y2;
          }
        }

        leadTip.setAttribute('transform', `translate(${boundedX}, ${tipY})`);
      }
    }
  }

  // Activate junction markers when the stretching line passes them
  const markers = document.querySelectorAll('.circuit-junction-marker');
  markers.forEach((m) => {
    const mx = parseFloat(m.dataset.x || '0');
    if (boundedX >= mx) {
      m.classList.add('is-passed');
    } else {
      m.classList.remove('is-passed');
    }
  });
}

/**
 * Computes the exact line reveal coordinate X based on scroll progress
 * Uniform linear velocity perfectly synchronized with scroll:
 * - Each card gap draws across an identical scroll span at 100% constant speed
 * - Before projects enter: line stops at Petra's left (NO line to Brookie!)
 * - Zero dead zones and zero speed variations between wide/narrow projects
 */
export function computeRevealedX(horizProg, portfolioTravel = 0) {
  if (!circuitAnchors || circuitAnchors.length < 2) return 0;
  const cards = document.querySelectorAll('.curtis-card');
  if (!cards || cards.length < 2) return circuitAnchors[0].left;

  const vw = window.innerWidth;
  const span = Math.min(360, Math.max(240, vw * 0.22));
  const X_start = vw * 0.76;
  const X_end = X_start - span;

  // Check each gap in sequence
  for (let i = 0; i < circuitAnchors.length - 1; i++) {
    const c1 = cards[i];
    if (!c1) continue;

    const r1 = c1.getBoundingClientRect();
    const rightEdge = r1.right;

    // Card i hasn't reached drawing start yet: all subsequent gaps are also not started
    if (rightEdge > X_start) {
      if (i === 0) {
        return circuitAnchors[0].left;
      }
      return circuitAnchors[i].left;
    }

    // Progress within this gap: strictly linear with respect to scroll
    const t = Math.max(0, Math.min(1.0, (X_start - rightEdge) / span));

    // If this gap is actively stretching (t < 1.0), return the current tip position
    if (t < 1.0) {
      const a1 = circuitAnchors[i];
      const a2 = circuitAnchors[i + 1];
      return a1.right + t * (a2.left - a1.right);
    }
  }

  // All 8 gaps are complete — handle lead-out past the final project
  const lastIdx = circuitAnchors.length - 1;
  const lastCard = cards[lastIdx];
  if (lastCard) {
    const rLast = lastCard.getBoundingClientRect();
    if (rLast.right <= X_start) {
      const leadOutProg = Math.max(0, Math.min(1.0, (X_start - rLast.right) / span));
      const aLast = circuitAnchors[lastIdx];
      const extraDist = Math.max(120, (circuitEnd?.x || aLast.right + 200) - aLast.right);
      return aLast.right + leadOutProg * extraDist;
    }
  }

  return circuitAnchors[lastIdx].left;
}

/**
 * Card entrance animation on scroll
 */
export function animatePortfolioCards() {
  const cards = document.querySelectorAll('.curtis-card');
  if (!cards.length) return;

  const viewportW = window.innerWidth;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.left + rect.width / 2;
    const baseY = parseFloat(card.dataset.baseY || '0');

    const enterStart = viewportW + 60;
    const enterEnd = viewportW * 0.75;

    let p = 1.0;
    if (cardCenter > enterStart) {
      p = 0.0;
    } else if (cardCenter > enterEnd) {
      p = (enterStart - cardCenter) / (enterStart - enterEnd);
    }

    const easedP = p * p * (3 - 2 * p);
    const scale = 0.96 + 0.04 * easedP;
    const opacity = 0.7 + 0.3 * easedP;

    card.style.opacity = opacity;
  });
}
