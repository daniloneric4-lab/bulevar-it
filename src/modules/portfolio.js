/**
 * portfolio.js — Dynamic portfolio grid rendering + filtering
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, categoryConfig } from '../data/portfolio.js';

gsap.registerPlugin(ScrollTrigger);

const gridEl = document.getElementById('portfolio-grid');
const filtersEl = document.getElementById('portfolio-filters');

/**
 * Render a single portfolio card
 * @param {import('../data/portfolio.js').Project} project
 * @returns {HTMLElement}
 */
function createCard(project) {
  const card = document.createElement('article');
  card.className = 'portfolio-card';
  card.dataset.category = project.category;

  const catCfg = categoryConfig[project.category] || categoryConfig.web;

  const thumbHTML = project.thumbnail
    ? `<img src="${project.thumbnail}" alt="${project.name}" loading="lazy" />`
    : `<div class="portfolio-card__thumb-placeholder">${project.name.charAt(0)}</div>`;

  card.innerHTML = `
    <div class="portfolio-card__thumb">
      ${thumbHTML}
    </div>
    <div class="portfolio-card__body">
      <span class="portfolio-card__category portfolio-card__category--${catCfg.colorClass}">
        ${catCfg.label}
      </span>
      <h3 class="portfolio-card__name">${project.name}</h3>
      <p class="portfolio-card__desc">${project.description}</p>
    </div>
  `;

  // Wrap in link if available
  if (project.link) {
    const wrapper = document.createElement('a');
    wrapper.href = project.link;
    wrapper.target = '_blank';
    wrapper.rel = 'noopener';
    wrapper.appendChild(card);
    return wrapper;
  }

  return card;
}

/**
 * Render portfolio grid with all projects
 */
export function renderPortfolio() {
  if (!gridEl) return;
  
  gridEl.innerHTML = '';

  projects.forEach((project) => {
    const cardEl = createCard(project);
    gridEl.appendChild(cardEl);
  });

  // Animate cards on scroll
  animatePortfolioCards();
}

/**
 * Animate portfolio cards with staggered fade-in
 */
function animatePortfolioCards() {
  const cards = gridEl.querySelectorAll('.portfolio-card');

  cards.forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: (i % 3) * 0.1,
          ease: 'power3.out',
          onStart: () => card.classList.add('is-visible'),
        });
      },
    });
  });
}

/**
 * Initialize portfolio filter buttons
 */
export function initPortfolioFilters() {
  if (!filtersEl || !gridEl) return;

  const buttons = filtersEl.querySelectorAll('.portfolio__filter');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active state
      buttons.forEach((b) => b.classList.remove('portfolio__filter--active'));
      btn.classList.add('portfolio__filter--active');

      const filter = btn.dataset.filter;
      const cards = gridEl.querySelectorAll('.portfolio-card');

      cards.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;

        if (shouldShow) {
          card.style.display = '';
          gsap.fromTo(card, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
          );
        } else {
          card.style.display = 'none';
        }
      });

      // Refresh ScrollTrigger after layout change
      ScrollTrigger.refresh();
    });
  });
}
