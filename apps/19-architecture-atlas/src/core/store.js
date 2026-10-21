/**
 * Persistent local state: favourites, language, filters.
 * Everything is stored in localStorage under a single namespaced key.
 * No network, no cookies, no third-party storage.
 */

const KEY = 'built-in-china:v1';

const DEFAULTS = {
  lang: 'en',
  favourites: [],
  filters: { region: null, era: null, type: null, q: '' },
  quiz: { best: 0, answered: {} },
  seenIntro: false,
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS),
      ...parsed,
      filters: { ...DEFAULTS.filters, ...(parsed.filters || {}) },
      quiz: { ...DEFAULTS.quiz, ...(parsed.quiz || {}) },
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — state stays in memory for this session */
  }
}

function emit(reason) {
  for (const fn of listeners) {
    try { fn(state, reason); } catch (err) { console.warn('[store] listener failed', err); }
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function setLang(lang) {
  if (lang !== 'en' && lang !== 'zh') return;
  state.lang = lang;
  persist();
  emit('lang');
}

export function getLang() {
  return state.lang;
}

export function toggleFavourite(id) {
  const set = new Set(state.favourites);
  const added = !set.has(id);
  if (added) set.add(id); else set.delete(id);
  state.favourites = Array.from(set);
  persist();
  emit('favourites');
  return added;
}

export function isFavourite(id) {
  return state.favourites.includes(id);
}

export function getFavourites() {
  return state.favourites.slice();
}

export function setFilter(patch) {
  state.filters = { ...state.filters, ...patch };
  persist();
  emit('filters');
}

export function getFilters() {
  return { ...state.filters };
}

export function resetFilters() {
  state.filters = { ...DEFAULTS.filters };
  persist();
  emit('filters');
}

export function recordQuiz(index, correct) {
  state.quiz.answered[index] = correct ? 1 : 0;
  persist();
  emit('quiz');
}

export function setBestQuiz(score) {
  if (score > (state.quiz.best || 0)) {
    state.quiz.best = score;
    persist();
    emit('quiz');
  }
}

export function getBestQuiz() {
  return state.quiz.best || 0;
}
