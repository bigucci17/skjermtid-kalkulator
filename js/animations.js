/* animations.js — staggered fade-in on load + scroll-reveal */

(function () {
  'use strict';

  function staggerIn(elements, baseDelay = 0, stagger = 80) {
    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, baseDelay + i * stagger);
    });
  }

  function initOnLoad() {
    // Hero: title → subtitle, staggered
    const hero = document.querySelector('.hero-content');
    if (hero) {
      const parts = [
        hero.querySelector('h1'),
        hero.querySelector('.subtitle')
      ].filter(Boolean);
      staggerIn(parts, 100, 180);
    }

    // Calculator: form groups staggered after hero
    const formGroups = document.querySelectorAll('#calc-form > .input-group, #calc-form > .input-row, #calc-form > button');
    if (formGroups.length) staggerIn(Array.from(formGroups), 500, 70);
  }

  // Re-stagger result cards each time results are revealed
  function observeResultReveal() {
    const results = document.getElementById('results');
    if (!results) return;

    const obs = new MutationObserver(() => {
      if (!results.classList.contains('hidden')) {
        const cards = results.querySelectorAll('.result-card, .result-row, .result-reduce, .stacked-bar, .cta-link');
        staggerIn(Array.from(cards), 50, 100);
      }
    });
    obs.observe(results, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initOnLoad();
      observeResultReveal();
    });
  } else {
    initOnLoad();
    observeResultReveal();
  }
})();
