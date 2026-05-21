/* i18n.js — language toggle for Norwegian (default) and English
   Hooks into elements with data-i18n="<key>" attributes and #lang-toggle button. */

(function () {
  'use strict';

  const translations = {
    no: {
      nav_calculator:        'Kalkulator',
      nav_stats:             'Statistikk',
      nav_video:             'Video',
      hero_title:            'Hvor mye av livet ditt brukes på skjerm?',
      hero_subtitle:         'Beregn din skjermtid og se hva du kunne brukt tiden på i stedet.',
      input_hours:           'Skjermtid per dag (timer)',
      input_age:             'Din alder',
      input_life_exp:        'Forventet levealder',
      btn_breakdown:         'Bryt ned skjermtiden',
      btn_calculate:         'Beregn',
      label_social:          'Sosiale medier',
      label_gaming:          'Gaming',
      label_streaming:       'Streaming / video',
      label_school:          'Skole / jobb',
      label_other:           'Annet',
      result_lost_years:     'år av livet ditt foran en skjerm',
      result_free_time:      'timer fritid per dag — av aktive timer',
      result_books:          'Bøker du kunne lest',
      result_languages:      'Språk du kunne lært',
      result_reduce:         'Hva om du reduserer med 1 time?',
      result_reduce_saved:   'år tilbake',
      cta_stats:             'Se hvordan andre bruker skjermen →',
      lang_button:           'EN'
    },
    en: {
      nav_calculator:        'Calculator',
      nav_stats:             'Statistics',
      nav_video:             'Video',
      hero_title:            'How much of your life is spent on a screen?',
      hero_subtitle:         'Calculate your screen time and see what you could have done instead.',
      input_hours:           'Screen time per day (hours)',
      input_age:             'Your age',
      input_life_exp:        'Life expectancy',
      btn_breakdown:         'Break down screen time',
      btn_calculate:         'Calculate',
      label_social:          'Social media',
      label_gaming:          'Gaming',
      label_streaming:       'Streaming / video',
      label_school:          'School / work',
      label_other:           'Other',
      result_lost_years:     'years of your life in front of a screen',
      result_free_time:      'free hours per day — of your active hours',
      result_books:          'Books you could have read',
      result_languages:      'Languages you could have learned',
      result_reduce:         'What if you reduced by 1 hour?',
      result_reduce_saved:   'years back',
      cta_stats:             'See how others use their screens →',
      lang_button:           'NO'
    }
  };

  function getLang() {
    return localStorage.getItem('lang') || 'no';
  }

  function setLang(lang) {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    apply(lang);
  }

  function apply(lang) {
    const dict = translations[lang] || translations.no;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = dict.lang_button;
  }

  function init() {
    apply(getLang());
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        setLang(getLang() === 'no' ? 'en' : 'no');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
