/**
 * stats.js — Statistics dashboard for Skjermtidskalkulator
 * Loads data from Supabase RPC, renders Chart.js charts
 */
(function () {
  'use strict';

  /** Default stats used when Supabase is unavailable */
  var DEFAULT_STATS = {
    avg_hours: 5.2,
    total_submissions: 12847,
    percent_over_4h: 64,
    age_groups: {
      '13-17': 6.1,
      '18-25': 7.2,
      '26-35': 5.8,
      '36-50': 4.5,
      '51+': 3.2
    },
    activities: {
      social_media: 2.1,
      gaming: 1.5,
      streaming: 1.8,
      school_work: 0.9,
      other: 0.5
    }
  };

  var ageChartInstance = null;
  var activityChartInstance = null;
  var comparisonChartInstance = null;
  var supabaseClient = null;

  function getClient() {
    if (!supabaseClient && window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return supabaseClient;
  }

  function loadStats() {
    var client = getClient();
    if (!client) {
      console.warn('Supabase not configured, using default stats');
      return Promise.resolve(DEFAULT_STATS);
    }

    try {

      return client
        .rpc('get_stats')
        .then(function (res) {
          if (res.error) {
            console.warn('Supabase RPC error:', res.error.message);
            return DEFAULT_STATS;
          }
          return res.data || DEFAULT_STATS;
        })
        .catch(function (err) {
          console.warn('Supabase get_stats failed, using defaults:', err.message);
          return DEFAULT_STATS;
        });
    } catch (err) {
      console.warn('Supabase client error:', err.message);
      return Promise.resolve(DEFAULT_STATS);
    }
  }

  /**
   * Render all statistics: hero numbers, charts, and optional comparison
   * @param {object} stats - stats object from loadStats()
   */
  function renderStatsCharts(stats) {
    // — Hero numbers —
    var avgEl = document.getElementById('stat-avg');
    var totalEl = document.getElementById('stat-total');
    var over4hEl = document.getElementById('stat-over-4h');

    if (avgEl) {
      avgEl.textContent = stats.avg_hours + 't';
      // Update the i18n-aware paragraph with the value
      var avgP = avgEl.parentElement.querySelector('[data-i18n="stats_avg"]');
      if (avgP) avgP.textContent = window.i18n.t('stats_avg', { hours: stats.avg_hours });
    }
    if (totalEl) {
      var totalMillions = (stats.total_submissions * stats.avg_hours / 1e6).toFixed(1);
      totalEl.textContent = totalMillions + 'M';
      var totalP = totalEl.parentElement.querySelector('[data-i18n="stats_total"]');
      if (totalP) totalP.textContent = window.i18n.t('stats_total', { hours: totalMillions });
    }
    if (over4hEl) {
      over4hEl.textContent = stats.percent_over_4h + '%';
      var over4hP = over4hEl.parentElement.querySelector('[data-i18n="stats_over_4h"]');
      if (over4hP) over4hP.textContent = window.i18n.t('stats_over_4h', { percent: stats.percent_over_4h });
    }

    // — Chart.js dark theme defaults —
    var chartFont = { family: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' };
    var gridColor = 'rgba(255, 255, 255, 0.05)';
    var tickColor = '#e0e0e0';

    // — Age groups bar chart —
    var ageData = stats.age_groups || DEFAULT_STATS.age_groups;
    var ageLabels = Object.keys(ageData);
    var ageValues = Object.values(ageData);

    var ageCtx = document.getElementById('age-chart');
    if (ageCtx) {
      if (ageChartInstance) ageChartInstance.destroy();
      ageChartInstance = new Chart(ageCtx, {
        type: 'bar',
        data: {
          labels: ageLabels,
          datasets: [{
            label: window.i18n.t('stats_age_chart'),
            data: ageValues,
            backgroundColor: '#4488ff',
            borderRadius: 6,
            maxBarThickness: 48
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: tickColor, font: chartFont }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: tickColor,
                font: chartFont,
                callback: function (v) { return v + 't'; }
              },
              beginAtZero: true
            }
          }
        }
      });
    }

    // — Activity doughnut chart —
    var actData = stats.activities || DEFAULT_STATS.activities;
    var actLabels = [
      window.i18n.t('label_social'),
      window.i18n.t('label_gaming'),
      window.i18n.t('label_streaming'),
      window.i18n.t('label_school'),
      window.i18n.t('label_other')
    ];
    var actValues = [
      actData.social_media || 0,
      actData.gaming || 0,
      actData.streaming || 0,
      actData.school_work || 0,
      actData.other || 0
    ];
    var actColors = ['#ff4444', '#ffaa44', '#4488ff', '#44ff88', '#aa44ff'];

    var actCtx = document.getElementById('activity-chart');
    if (actCtx) {
      if (activityChartInstance) activityChartInstance.destroy();
      activityChartInstance = new Chart(actCtx, {
        type: 'doughnut',
        data: {
          labels: actLabels,
          datasets: [{
            data: actValues,
            backgroundColor: actColors,
            borderColor: 'rgba(10, 10, 15, 0.8)',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: tickColor, font: chartFont, padding: 16 }
            }
          }
        }
      });
    }

    // — Comparison section (only if user has calculated) —
    var lastCalcHours = localStorage.getItem('lastCalcHours');
    var compSection = document.getElementById('comparison-section');
    if (lastCalcHours && compSection) {
      var userHours = parseFloat(lastCalcHours);
      var avgHours = stats.avg_hours;

      compSection.style.display = '';
      var compTitle = document.getElementById('comparison-title');
      if (compTitle) {
        compTitle.textContent = window.i18n.t('stats_yours', { hours: userHours }) + ' vs ' + avgHours + 't avg';
      }

      var compCtx = document.getElementById('comparison-chart');
      if (compCtx) {
        if (comparisonChartInstance) comparisonChartInstance.destroy();
        comparisonChartInstance = new Chart(compCtx, {
          type: 'bar',
          data: {
            labels: [window.i18n.t('label_other'), window.i18n.t('stats_avg').split(':')[0]],
            datasets: [{
              data: [userHours, avgHours],
              backgroundColor: ['#ff4444', '#4488ff'],
              borderRadius: 6,
              maxBarThickness: 48
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: gridColor },
                ticks: {
                  color: tickColor,
                  font: chartFont,
                  callback: function (v) { return v + 't'; }
                },
                beginAtZero: true
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: tickColor, font: chartFont }
              }
            }
          }
        });
      }
    }
  }

  // — Initialize on DOMContentLoaded —
  document.addEventListener('DOMContentLoaded', function () {
    loadStats().then(renderStatsCharts);
  });

  // Expose globally
  window.loadStats = loadStats;
  window.renderStatsCharts = renderStatsCharts;
})();