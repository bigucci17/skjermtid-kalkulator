/**
 * i18n.js — Internationalisation module for Skjermtidskalkulator
 * Provides NO/EN translations, setLang/toggleLang, and auto-apply on DOMContentLoaded.
 */

const translations = {
  no: {
    // Nav
    nav_calculator: 'Kalkulator',
    nav_stats: 'Statistikk',
    nav_video: 'Video',

    // Hero
    hero_title: 'Hvor mye av livet ditt brukes pa skjerm?',
    hero_subtitle: 'Beregn din skjermtid og se hva du kunne brukt tiden pa i stedet.',

    // Inputs
    input_hours: 'Skjermtid per dag (timer)',
    input_age: 'Din alder',
    input_life_exp: 'Forventet levealder',

    // Buttons
    btn_calculate: 'Beregn',
    btn_breakdown: 'Bryt ned skjermtiden',

    // Breakdown labels
    label_social: 'Sosiale medier',
    label_gaming: 'Gaming',
    label_streaming: 'Streaming/video',
    label_school: 'Skole/jobb',
    label_other: 'Annet',

    // Results
    result_lost_years: 'Du vil bruke {years} ar av livet ditt foran en skjerm',
    result_free_time: 'Etter sonn og jobb har du {hours} timer fritid per dag — {percent}% gar til skjerm',
    result_books: 'Boker du kunne lest: {count}',
    result_languages: 'Sprak du kunne lart: {count}',
    result_reduce: 'Hva om du reduserer med 1 time?',
    result_reduce_saved: '{years} ar tilbake',

    // Stacked bar labels
    bar_sleep: 'Sonn',
    bar_work: 'Jobb',
    bar_screen: 'Skjerm',
    bar_free: 'Fritid',

    // CTA
    cta_stats: 'Se hvordan andre bruker skjermen →',

    // Stats page
    stats_title: 'Skjermtid i Norge',
    stats_avg: 'Gjennomsnittlig skjermtid per dag: {hours} timer',
    stats_total: 'Total skjermtid i Norge per dag: {hours} millioner timer',
    stats_over_4h: '{percent}% bruker mer enn 4 timer per dag',
    stats_age_chart: 'Skjermtid etter alder',
    stats_activity_chart: 'Skjermtid etter aktivitet',
    stats_yours: 'Din skjermtid: {hours} timer per dag',

    // Video page
    video_title: 'Hva betyr skjermtid for deg?',
    video_subtitle: 'Reflekter over din egen skjermtid med disse sporsmalene.',
    video_q1: 'Hva er det forste du gjor nar du vakner?',
    video_q2: 'Hvor mye av fritiden din er virkelig fri?',
    video_q3: 'Nar var sist du tok en pause fra skjermen?',
    video_q4: 'Hva ville du gjort med en ekstra time hver dag?',
    video_q5: 'Hvem bestemmer skjermtiden din — du eller telefonen?',
    cta_calculator: 'Prøv kalkulatoren →',
  },

  en: {
    // Nav
    nav_calculator: 'Calculator',
    nav_stats: 'Statistics',
    nav_video: 'Video',

    // Hero
    hero_title: 'How much of your life is spent on screens?',
    hero_subtitle: 'Calculate your screen time and see what you could have spent that time on instead.',

    // Inputs
    input_hours: 'Screen time per day (hours)',
    input_age: 'Your age',
    input_life_exp: 'Life expectancy',

    // Buttons
    btn_calculate: 'Calculate',
    btn_breakdown: 'Break down screen time',

    // Breakdown labels
    label_social: 'Social media',
    label_gaming: 'Gaming',
    label_streaming: 'Streaming/video',
    label_school: 'School/work',
    label_other: 'Other',

    // Results
    result_lost_years: 'You will spend {years} years of your life in front of a screen',
    result_free_time: 'After sleep and work you have {hours} hours of free time per day — {percent}% goes to screens',
    result_books: 'Books you could have read: {count}',
    result_languages: 'Languages you could have learned: {count}',
    result_reduce: 'What if you reduced by 1 hour?',
    result_reduce_saved: '{years} years back',

    // Stacked bar labels
    bar_sleep: 'Sleep',
    bar_work: 'Work',
    bar_screen: 'Screen',
    bar_free: 'Free time',

    // CTA
    cta_stats: 'See how others use their screens →',

    // Stats page
    stats_title: 'Screen Time in Norway',
    stats_avg: 'Average screen time per day: {hours} hours',
    stats_total: 'Total screen time in Norway per day: {hours} million hours',
    stats_over_4h: '{percent}% spend more than 4 hours per day',
    stats_age_chart: 'Screen time by age',
    stats_activity_chart: 'Screen time by activity',
    stats_yours: 'Your screen time: {hours} hours per day',

    // Video page
    video_title: 'What does screen time mean to you?',
    video_subtitle: 'Reflect on your own screen time with these questions.',
    video_q1: 'What is the first thing you do when you wake up?',
    video_q2: 'How much of your free time is truly free?',
    video_q3: 'When was the last time you took a break from screens?',
    video_q4: 'What would you do with an extra hour every day?',
    video_q5: 'Who decides your screen time — you or your phone?',
    cta_calculator: 'Try the calculator →',
  },
};

let currentLang = localStorage.getItem('lang') || 'no';

/**
 * Translate a key with optional {placeholder} replacements.
 * @param {string} key — translation key
 * @param {object} replacements — e.g. { years: 5, percent: 40 }
 * @returns {string}
 */
function t(key, replacements) {
  const str = (translations[currentLang] && translations[currentLang][key]) || (translations.no[key]) || key;
  if (!replacements) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (replacements[k] !== undefined ? replacements[k] : `{${k}}`));
}

/**
 * Set language, update all [data-i18n] elements, save preference.
 * @param {string} lang — 'no' or 'en'
 */
function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'no' ? 'no' : 'en';

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text !== key) {
      el.textContent = text;
    }
  });

  // Update language toggle button
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.textContent = lang === 'no' ? 'EN' : 'NO';
  }
}

/**
 * Toggle between Norwegian and English.
 */
function toggleLang() {
  setLang(currentLang === 'no' ? 'en' : 'no');
}

// Expose globally for other scripts
window.i18n = { t, setLang, toggleLang, getLang: () => currentLang };

// Auto-apply on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);

  // Wire up toggle button
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', toggleLang);
  }
});