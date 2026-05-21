/* calculator.js — math + result rendering
   Hooks into index.html: window.calculate, window.renderResults, window.submitToSupabase */

(function () {
  'use strict';

  // ---------- Math ----------
  // hoursPerDay: number, age: number, lifeExpectancy: number
  function calculate(hoursPerDay, age, lifeExpectancy) {
    const yearsLeft = Math.max(0, lifeExpectancy - age);

    // Total screen time in remaining life, expressed in years
    const screenYears = (hoursPerDay * 365 * yearsLeft) / (24 * 365);

    // After sleep (8h) and work/school (~8h on weekdays, avg ~6.3h/day),
    // assume ~10h of "active" awake time per day.
    const activeHoursPerDay = 10;
    const freeHoursPerDay = Math.max(0, activeHoursPerDay - hoursPerDay);
    const freeTimePercent = (freeHoursPerDay / activeHoursPerDay) * 100;

    // Rough cultural conversions for the "could have done instead" stats.
    // Books: avg novel ~10h to read. Languages: ~600h to reach B1.
    const totalScreenHours = hoursPerDay * 365 * yearsLeft;
    const books = Math.floor(totalScreenHours / 10);
    const languages = Math.floor(totalScreenHours / 600);

    // What if you reduced by 1 hour/day?
    const savedHours = Math.max(0, (hoursPerDay - Math.max(0, hoursPerDay - 1))) * 365 * yearsLeft;
    const savedYears = savedHours / (24 * 365);

    return {
      lostYears: screenYears,
      freeHoursPerDay: freeHoursPerDay,
      freeTimePercent: freeTimePercent,
      books: books,
      languages: languages,
      savedYears: savedYears,
      hoursPerDay: hoursPerDay,
      yearsLeft: yearsLeft
    };
  }

  // ---------- Rendering ----------
  function renderResults(r) {
    const results = document.getElementById('results');
    if (!results) return;
    results.classList.remove('hidden');

    // Big lost-years number
    setNumber(
      results.querySelector('.result-lost-years span'),
      r.lostYears.toFixed(1)
    );

    // Free time hours + percent
    const freeTimeCard = results.querySelector('.result-free-time');
    if (freeTimeCard) {
      const spans = freeTimeCard.querySelectorAll('span');
      if (spans[0]) setNumber(spans[0], r.freeHoursPerDay.toFixed(1));
      const percentEl = freeTimeCard.querySelector('.percent');
      if (percentEl) setNumber(percentEl, Math.round(r.freeTimePercent));
    }

    // Books & languages
    setNumber(results.querySelector('.result-books span'), formatInt(r.books));
    setNumber(results.querySelector('.result-languages span'), formatInt(r.languages));

    // Saved years
    setNumber(results.querySelector('.result-saved span'), r.savedYears.toFixed(1));

    // Stacked bar — uses breakdown if present, else just one segment
    renderStackedBar(r.hoursPerDay);

    // Smooth scroll into view
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setNumber(el, value) {
    if (!el) return;
    animateNumber(el, value);
  }

  function animateNumber(el, target) {
    const start = parseFloat(el.textContent) || 0;
    const end = parseFloat(target);
    if (isNaN(end)) { el.textContent = target; return; }

    const isInt = Number.isInteger(end) && !String(target).includes('.');
    const duration = 700;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const v = start + (end - start) * eased;
      el.textContent = isInt ? Math.round(v).toLocaleString('nb-NO') : v.toFixed(1);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function formatInt(n) {
    return Math.round(n).toLocaleString('nb-NO');
  }

  function renderStackedBar(totalHours) {
    const bar = document.getElementById('stacked-bar');
    if (!bar) return;
    bar.innerHTML = '';

    const breakdownFields = document.getElementById('breakdown-fields');
    const useBreakdown = breakdownFields && !breakdownFields.classList.contains('hidden');

    const colors = {
      socialMedia: '#1C1917',
      gaming:      '#B8542B',
      streaming:   '#6B645B',
      schoolWork:  '#A8A29A',
      other:       '#E8D5C4',
      total:       '#1C1917'
    };

    if (useBreakdown) {
      const fields = ['socialMedia', 'gaming', 'streaming', 'schoolWork', 'other'];
      const max = 16;
      fields.forEach(f => {
        const slider = document.querySelector(`.breakdown-slider[data-field="${f}"]`);
        if (!slider) return;
        const val = parseFloat(slider.value) || 0;
        if (val <= 0) return;
        const seg = document.createElement('div');
        seg.style.width = (val / max) * 100 + '%';
        seg.style.background = colors[f];
        bar.appendChild(seg);
      });
    } else {
      const seg = document.createElement('div');
      seg.style.width = Math.min(100, (totalHours / 16) * 100) + '%';
      seg.style.background = colors.total;
      bar.appendChild(seg);
    }
  }

  // ---------- Supabase (optional, no-op if not configured) ----------
  async function submitToSupabase(data) {
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (!url || !key) return; // silently skip if not configured

    try {
      // supabase-js v2 global, loaded via CDN in index.html
      if (!window.supabase || !window.supabase.createClient) return;
      const client = window.supabase.createClient(url, key);
      await client.from('calculations').insert({
        hours_per_day: data.hoursPerDay,
        age: data.age,
        life_expectancy: data.lifeExpectancy,
        breakdown: data.breakdown || null,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      // Don't break the UX on logging failure
      console.warn('Supabase submit failed:', err);
    }
  }

  // Expose to global scope (index.html script calls these directly)
  window.calculate = calculate;
  window.renderResults = renderResults;
  window.submitToSupabase = submitToSupabase;
})();
