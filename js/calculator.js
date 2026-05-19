/**
 * Skjermtid Calculator Logic
 * Vanilla JS — Supabase client loaded via CDN
 */
(function () {
  'use strict';

  /**
   * Determine age group from age
   * @param {number} age
   * @returns {string} '13-17' | '18-25' | '26-35' | '36-50' | '51+'
   */
  function getAgeGroup(age) {
    if (age <= 17) return '13-17';
    if (age <= 25) return '18-25';
    if (age <= 35) return '26-35';
    if (age <= 50) return '36-50';
    return '51+';
  }

  /**
   * Calculate screen time impact on remaining life
   * @param {number} hoursPerDay - daily screen hours (0-16, step 0.5)
   * @param {number} age - current age
   * @param {number} lifeExpectancy - expected lifespan
   * @returns {object} result object with all calculated values
   */
  function calculate(hoursPerDay, age, lifeExpectancy) {
    var remainingYears = Math.max(0, lifeExpectancy - age);

    // Core: fraction of life lost to screens
    var lostYears = Math.round((hoursPerDay / 24) * remainingYears * 10) / 10;

    // Free time: 24h - 8h sleep - 8h work/school - screen hours
    var freeHoursPerDay = Math.max(0, 24 - 8 - 8 - hoursPerDay);

    // What share of free time is screen time?
    var screenPercentOfFree = freeHoursPerDay > 0
      ? Math.round((hoursPerDay / freeHoursPerDay) * 100)
      : 100;

    // Alternative uses of those lost years
    var booksLost = Math.round(lostYears * 12);
    var languagesLost = Math.round(lostYears * 0.5 * 10) / 10;

    // Years saved by cutting 1 hour/day
    var savedYears = hoursPerDay >= 1
      ? Math.max(0, Math.round((1 / 24) * remainingYears * 10) / 10)
      : 0;

    // Stacked bar: life year breakdown
    var sleepYears = Math.round((8 / 24) * remainingYears * 10) / 10;
    var workYears = Math.round((8 / 24) * remainingYears * 10) / 10;
    var screenYears = lostYears;
    var freeYears = Math.max(0, Math.round(
      (remainingYears - sleepYears - workYears - screenYears) * 10
    ) / 10);

    return {
      lostYears: lostYears,
      freeHoursPerDay: freeHoursPerDay,
      screenPercentOfFree: screenPercentOfFree,
      booksLost: booksLost,
      languagesLost: languagesLost,
      savedYears: savedYears,
      sleepYears: sleepYears,
      workYears: workYears,
      screenYears: screenYears,
      freeYears: freeYears
    };
  }

  /**
   * Insert submission to Supabase 'submissions' table
   * Silent fail — console.warn on errors
   * @param {object} data - form data with hoursPerDay, age, lifeExpectancy, breakdown?
   */
  var supabaseClient = null;

  function getClient() {
    if (!supabaseClient && window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return supabaseClient;
  }

  function submitToSupabase(data) {
    try {
      var client = getClient();
      if (!client) {
        console.warn('Supabase not configured, skipping submission');
        return;
      }

      var result = window.calculate(
        data.hoursPerDay,
        data.age,
        data.lifeExpectancy
      );

      var row = {
        age_group: getAgeGroup(data.age),
        total_hours: data.hoursPerDay,
        social_media: (data.breakdown && data.breakdown.socialMedia) || 0,
        gaming: (data.breakdown && data.breakdown.gaming) || 0,
        streaming: (data.breakdown && data.breakdown.streaming) || 0,
        school_work: (data.breakdown && data.breakdown.schoolWork) || 0,
        other: (data.breakdown && data.breakdown.other) || 0,
        lost_years: result.lostYears,
        free_time: result.freeHoursPerDay
      };

      client
        .from('submissions')
        .insert(row)
        .then(
          function () { /* success — silent */ },
          function (err) { console.warn('Supabase insert failed:', err.message); }
        );
    } catch (err) {
      console.warn('Supabase submission error:', err.message);
    }
  }

  /**
   * Animate a number counting up from 0 to target
   * Shows 1 decimal while animating, appropriate decimals when done
   * @param {HTMLElement} el - element to update
   * @param {number} target - final value
   * @param {number} duration - animation duration in ms (default 800)
   */
  function animateNumber(el, target, duration) {
    duration = duration || 800;
    var hasDecimal = target % 1 !== 0;
    var startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      var current = target * eased;

      if (progress < 1) {
        el.textContent = current.toFixed(1);
        requestAnimationFrame(tick);
      } else {
        el.textContent = hasDecimal
          ? target.toFixed(1)
          : Math.round(target).toString();
      }
    }

    requestAnimationFrame(tick);
  }

  /**
   * Show results section and animate all numbers
   * @param {object} result - output from calculate()
   */
  function renderResults(result) {
    var resultsEl = document.getElementById('results');
    if (!resultsEl) return;

    resultsEl.classList.remove('hidden');
    resultsEl.classList.add('visible');

    // Lost years
    var lostYearsSpan = resultsEl.querySelector('.result-lost-years span');
    if (lostYearsSpan) animateNumber(lostYearsSpan, result.lostYears);
    var lostDesc = resultsEl.querySelector('[data-i18n="result_lost_years"]');
    if (lostDesc && window.i18n) lostDesc.textContent = window.i18n.t('result_lost_years', { years: result.lostYears });

    // Free time hours + percentage
    var freeTimeSpan = resultsEl.querySelector('.result-free-time span');
    if (freeTimeSpan) animateNumber(freeTimeSpan, result.freeHoursPerDay);
    var freeDesc = resultsEl.querySelector('[data-i18n="result_free_time"]');
    if (freeDesc && window.i18n) freeDesc.textContent = window.i18n.t('result_free_time', { hours: result.freeHoursPerDay, percent: result.screenPercentOfFree });

    var percentSpan = resultsEl.querySelector('.result-free-time .percent');
    if (percentSpan) percentSpan.textContent = result.screenPercentOfFree;

    // Books & languages
    var booksSpan = resultsEl.querySelector('.result-books span');
    if (booksSpan) animateNumber(booksSpan, result.booksLost);
    var booksDesc = resultsEl.querySelector('[data-i18n="result_books"]');
    if (booksDesc && window.i18n) booksDesc.textContent = window.i18n.t('result_books', { count: result.booksLost });

    var languagesSpan = resultsEl.querySelector('.result-languages span');
    if (languagesSpan) animateNumber(languagesSpan, result.languagesLost);
    var langsDesc = resultsEl.querySelector('[data-i18n="result_languages"]');
    if (langsDesc && window.i18n) langsDesc.textContent = window.i18n.t('result_languages', { count: result.languagesLost });

    // Saved years (reduce by 1h)
    var savedSpan = resultsEl.querySelector('.result-saved span');
    if (savedSpan) animateNumber(savedSpan, result.savedYears);
    var savedDesc = resultsEl.querySelector('[data-i18n="result_reduce_saved"]');
    if (savedDesc && window.i18n) savedDesc.textContent = window.i18n.t('result_reduce_saved', { years: result.savedYears });

    renderStackedBar(result);
  }

  /**
   * Render stacked bar with 4 colored segments
   * @param {object} result - output from calculate()
   */
  function renderStackedBar(result) {
    var barEl = document.getElementById('stacked-bar');
    if (!barEl) return;

    barEl.innerHTML = '';

    var segments = [
      { key: 'bar_sleep',   value: result.sleepYears,   color: '#4488ff' },
      { key: 'bar_work',    value: result.workYears,    color: '#ffaa44' },
      { key: 'bar_screen',  value: result.screenYears,  color: '#ff4444' },
      { key: 'bar_free',    value: result.freeYears,    color: '#44ff88' }
    ];

    var total = 0;
    for (var i = 0; i < segments.length; i++) {
      total += segments[i].value;
    }
    if (total <= 0) return;

    for (var j = 0; j < segments.length; j++) {
      var seg = segments[j];
      var div = document.createElement('div');
      div.className = 'bar-segment';
      div.style.background = seg.color;
      div.style.width = ((seg.value / total) * 100) + '%';
      var label = window.i18n ? window.i18n.t(seg.key) : seg.key;
      div.textContent = label + ' ' + seg.value;
      barEl.appendChild(div);
    }
  }

  // Expose to global scope for inline script usage
  window.calculate = calculate;
  window.submitToSupabase = submitToSupabase;
  window.renderResults = renderResults;
  window.getAgeGroup = getAgeGroup;
})();