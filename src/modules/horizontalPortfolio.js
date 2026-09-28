/**
 * horizontalPortfolio.js — Curtis Nguyen style Horizontal Scroll Portfolio
 * Renders 9 real projects in alternating zig-zag lanes with iOS27 Liquid Glass cards and SVG circuit lines.
 * Features scroll-driven card entrance animations and progressive SVG circuit line drawing.
 */
import { projects, categoryConfig } from '../data/portfolio.js';

export function renderHorizontalPortfolio(trackSelector) {
  const track = document.querySelector(trackSelector);
  if (!track) {
    console.warn('[horizontalPortfolio] Track element not found');
    return;
  }

  track.innerHTML = '';

  // Render 9 project cards in alternating lanes (high / low)
  projects.forEach((proj, idx) => {
    const isHigh = idx % 2 === 0;
    const catCfg = categoryConfig[proj.category] || categoryConfig.web;

    const card = document.createElement('article');
    card.className = `curtis-card curtis-card--${isHigh ? 'high' : 'low'} glass-block`;
    card.dataset.category = proj.category;
    card.dataset.index = idx;

    card.innerHTML = `
      <div class="glass-block__glow"></div>
      <div class="curtis-card__header">
        <span class="curtis-card__badge curtis-card__badge--${catCfg.colorClass}">
          ${catCfg.label}
        </span>
        <span class="curtis-card__index">0${idx + 1}</span>
      </div>

      <div class="curtis-card__preview">
        <img src="${proj.thumbnail}" alt="${proj.name}" loading="lazy" />
        <div class="curtis-card__preview-overlay">
          <span class="curtis-card__visit-hint">Otvori sajt ↗</span>
        </div>
      </div>

      <div class="curtis-card__body">
        <h3 class="curtis-card__title">${proj.name}</h3>
        <p class="curtis-card__desc">${proj.description}</p>
        <div class="curtis-card__footer">
          <a href="${proj.link}" target="_blank" rel="noopener noreferrer" class="curtis-card__link">
            Pogledaj projekat <span class="arrow">↗</span>
          </a>
        </div>
      </div>
    `;

    // Make entire card clickable if link exists
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a') && proj.link) {
        window.open(proj.link, '_blank', 'noopener,noreferrer');
      }
    });

    track.appendChild(card);
  });

  // Render dynamic SVG Circuit Line across cards
  requestAnimationFrame(() => {
    drawCircuitLines(track);
  });
}

/**
 * Draws dynamic circuit lines that connect the cards across the horizontal track
 */
function drawCircuitLines(track) {
  const svg = document.querySelector('.portfolio-circuit-svg');
  if (!svg || !track) return;

  const cards = track.querySelectorAll('.curtis-card');
  if (cards.length < 2) return;

  const totalWidth = track.scrollWidth;
  const height = track.clientHeight || 700;

  svg.setAttribute('viewBox', `0 0 ${totalWidth} ${height}`);
  svg.style.width = `${totalWidth}px`;
  svg.style.height = `${height}px`;

  let pathD = '';
  let nodesHtml = '';

  cards.forEach((card, i) => {
    const x = card.offsetLeft + card.offsetWidth / 2;
    const isHigh = card.classList.contains('curtis-card--high');
    const y = isHigh ? (card.offsetTop + card.offsetHeight + 35) : (card.offsetTop - 35);

    // Node diamond
    nodesHtml += `
      <g class="circuit-node" data-x="${x}" transform="translate(${x}, ${y})">
        <polygon points="0,-8 8,0 0,8 -8,0" fill="#C9A063" opacity="0.9" />
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
      </g>
    `;

    if (i === 0) {
      pathD += `M 0 ${y} L ${x} ${y}`;
    } else {
      const prevCard = cards[i - 1];
      const prevX = prevCard.offsetLeft + prevCard.offsetWidth / 2;
      const prevIsHigh = prevCard.classList.contains('curtis-card--high');
      const prevY = prevIsHigh ? (prevCard.offsetTop + prevCard.offsetHeight + 35) : (prevCard.offsetTop - 35);

      const midX = (prevX + x) / 2;
      // Circuit right-angle routing
      pathD += ` L ${midX} ${prevY} L ${midX} ${y} L ${x} ${y}`;
    }

    if (i === cards.length - 1) {
      pathD += ` L ${totalWidth} ${y}`;
    }
  });

  svg.innerHTML = `
    <defs>
      <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C9A063" stop-opacity="0.3" />
        <stop offset="50%" stop-color="#F0D9A0" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#C9A063" stop-opacity="0.4" />
      </linearGradient>
      <clipPath id="circuitClip">
        <rect id="circuitClipRect" x="0" y="0" width="300" height="${height}" />
      </clipPath>
    </defs>
    <g clip-path="url(#circuitClip)">
      <path d="${pathD}" fill="none" stroke="url(#circuitGrad)" stroke-width="2" stroke-dasharray="6 6" />
      <path d="${pathD}" fill="none" stroke="#C9A063" stroke-width="1.2" opacity="0.4" stroke-dasharray="6 6" />
      ${nodesHtml}
    </g>
  `;
}

/**
 * Progressively draws the dashed circuit line as scroll progresses
 */
export function updateCircuitProgress(revealedWidth) {
  const rect = document.getElementById('circuitClipRect');
  if (rect) {
    rect.setAttribute('width', Math.max(0, revealedWidth));
  }
}

/**
 * Animates project cards entrance dynamically linked to horizontal scroll position
 */
export function animatePortfolioCards() {
  const cards = document.querySelectorAll('.curtis-card');
  if (!cards.length) return;

  const viewportW = window.innerWidth;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const isHigh = card.classList.contains('curtis-card--high');
    const baseY = isHigh ? -75 : 75;

    // Card center X relative to viewport
    const cardCenter = rect.left + rect.width / 2;

    // Start entering when card approaches right edge (viewportW + 80px)
    // Reach full resting position by viewportW * 0.70
    const enterStart = viewportW + 80;
    const enterEnd = viewportW * 0.70;

    let p = 1.0;
    if (cardCenter > enterStart) {
      p = 0.0;
    } else if (cardCenter > enterEnd) {
      p = (enterStart - cardCenter) / (enterStart - enterEnd);
    }

    // Smooth ease-out curve
    const easedP = p * p * (3 - 2 * p);

    const translateY = baseY + (60 * (1 - easedP));
    const scale = 0.90 + 0.10 * easedP;
    const rotate = (1 - easedP) * (isHigh ? -2.5 : 2.5);
    const opacity = 0.15 + 0.85 * easedP;

    card.style.transform = `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`;
    card.style.opacity = opacity;
  });
}
