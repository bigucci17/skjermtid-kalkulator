/**
 * i18n.js — Internationalisation module for Skjermtidskalkulator
 * Provides NO/EN translations, setLang/toggleLang, and auto-apply on DOMContentLoaded.
 */

const translations = {
  no: {
    nav_calculator: 'Kalkulator',
    nav_stats: 'Statistikk',
    nav_video: 'Video',

    hero_title: 'Hvor mye av livet ditt brukes på skjerm?',
    hero_subtitle: 'Beregn din skjermtid og se hva du kunne brukt tiden på i stedet.',

    input_hours: 'Skjermtid per dag (timer)',
    input_age: 'Din alder',
    input_life_exp: 'Forventet levealder',

    btn_calculate: 'Beregn',
    btn_breakdown: 'Bryt ned skjermtiden',

    label_social: 'Sosiale medier',
    label_gaming: 'Gaming',
    label_streaming: 'Streaming/video',
    label_school: 'Skole/jobb',
    label_other: 'Annet',

    result_lost_years: 'Du vil bruke {years} år av livet ditt foran en skjerm',
    result_free_time: 'Etter søvn og jobb har du {hours} timer fritid per dag — {percent}% går til skjerm',
    result_books: 'Bøker du kunne lest: {count}',
    result_languages: 'Språk du kunne lært: {count}',
    result_reduce: 'Hva om du reduserer med 1 time?',
    result_reduce_saved: 'Du ville fått {years} år av livet tilbake',

    bar_sleep: 'Søvn',
    bar_work: 'Jobb',
    bar_screen: 'Skjerm',
    bar_free: 'Fritid',

    cta_stats: 'Se hvordan andre bruker skjermen →',

    stats_title: 'Skjermtidsstatistikk',
    stats_avg: 'Gjennomsnittlig skjermtid',
    stats_total: 'Antall beregninger',
    stats_over_4h: 'Bruker mer enn 4 timer/dag',
    stats_age_chart: 'Skjermtid per aldersgruppe',
    stats_activity_chart: 'Aktivitetsfordeling',
    stats_yours: 'Din skjerm vs. gjennomsnittet',

    video_title: 'Hva sier folk om skjermtid?',
    video_subtitle: 'Vi gikk på gaten og spurte folk om deres skjermvaner.',
    video_questions: 'Intervjuspørsmål',
    video_placeholder: 'Video kommer her',
    video_q1: 'Hvor mye tid bruker du foran en skjerm hver dag?',
    video_q2: 'Hva bruker du mest tid på på skjermen?',
    video_q3: 'Hvordan kan man redusere skjermtiden?',
    video_q4: 'Hva kan man gjøre i stedet for å se på skjerm?',
    video_q5: 'Spørsmål 5 (kommer)',
    cta_calculator: 'Test deg selv →',
  },

  en: {
    nav_calculator: 'Calculator',
    nav_stats: 'Statistics',
    nav_video: 'Video',

    hero_title: 'How much of your life is spent on screens?',
    hero_subtitle: 'Calculate your screen time and see what you could have done instead.',

    input_hours: 'Screen time per day (hours)',
    input_age: 'Your age',
    input_life_exp: 'Life expectancy',

    btn_calculate: 'Calculate',
    btn_breakdown: 'Break down screen time',

    label_social: 'Social media',
    label_gaming: 'Gaming',
    label_streaming: 'Streaming/video',
    label_school: 'School/work',
    label_other: 'Other',

    result_lost_years: 'You will spend {years} years of your life in front of a screen',
    result_free_time: 'After sleep and work you have {hours} hours of free time per day — {percent}% goes to screens',
    result_books: 'Books you could have read: {count}',
    result_languages: 'Languages you could have learned: {count}',
    result_reduce: 'What if you reduced by 1 hour?',
    result_reduce_saved: 'You would get {years} years of your life back',

    bar_sleep: 'Sleep',
    bar_work: 'Work',
    bar_screen: 'Screen',
    bar_free: 'Free time',

    cta_stats: 'See how others use their screens →',

    stats_title: 'Screen Time Statistics',
    stats_avg: 'Average screen time',
    stats_total: 'Total calculations',
    stats_over_4h: 'Uses more than 4 hours/day',
    stats_age_chart: 'Screen time by age group',
    stats_activity_chart: 'Activity breakdown',
    stats_yours: 'Your screen time vs. average',

    video_title: 'What do people say about screen time?',
    video_subtitle: 'We went out on the street and asked people about their screen habits.',
    video_questions: 'Interview Questions',
    video_placeholder: 'Video coming soon',
    video_q1: 'How much time do you spend in front of a screen each day?',
    video_q2: 'What do you spend the most time on your screen?',
    video_q3: 'How can you reduce screen time?',
    video_q4: 'What can you do instead of looking at a screen?',
    video_q5: 'Question 5 (coming)',
    cta_calculator: 'Test yourself →',
  },
};

let currentLang = localStorage.getItem('lang') || 'no';

function t(key, replacements) {
  const str = (translations[currentLang] && translations[currentLang][key]) || translations.no[key] || key;
  if (!replacements) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (replacements[k] !== undefined ? replacements[k] : `{${k}}`));
}

function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'no' ? 'no' : 'en';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text !== key) {
      el.textContent = text;
    }
  });

  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.textContent = lang === 'no' ? 'EN' : 'NO';
  }
}

function toggleLang() {
  setLang(currentLang === 'no' ? 'en' : 'no');
}

window.i18n = { t, setLang, toggleLang, getLang: () => currentLang };

document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
  const toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', toggleLang);
  }
});