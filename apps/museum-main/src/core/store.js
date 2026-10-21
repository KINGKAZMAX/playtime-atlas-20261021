/**
 * 本地存储：收藏、设置、参观足迹
 *
 * 所有键带版本号，未来改结构时可以平滑迁移。
 * 隐私：只存在浏览器本地，不上传任何数据。
 */

const KEYS = {
  favorites: 'ptatlas.favorites.v1',
  settings: 'ptatlas.settings.v1',
  visits: 'ptatlas.visits.v1',
};

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function readJson(key, fallback) {
  const raw = safeGet(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/* ───────────────────────── 收藏 ───────────────────────── */

export function getFavorites() {
  const list = readJson(KEYS.favorites, []);
  return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift(id);
  safeSet(KEYS.favorites, JSON.stringify(list));
  return { favorites: list, added: idx < 0 };
}

export function clearFavorites() {
  safeSet(KEYS.favorites, JSON.stringify([]));
  return [];
}

/* ───────────────────────── 设置 ───────────────────────── */

const DEFAULT_SETTINGS = {
  density: 'comfortable', // comfortable | compact
  view: 'grid', // grid | list
  reduceMotion: false,
  hallEnabled: true,
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readJson(KEYS.settings, {}) };
}

export function updateSettings(patch) {
  const next = { ...getSettings(), ...patch };
  safeSet(KEYS.settings, JSON.stringify(next));
  return next;
}

/* ───────────────────────── 参观足迹 ───────────────────────── */

export function getVisits() {
  const list = readJson(KEYS.visits, []);
  return Array.isArray(list) ? list.filter((x) => typeof x === 'string') : [];
}

export function markVisited(id) {
  const list = getVisits().filter((x) => x !== id);
  list.unshift(id);
  safeSet(KEYS.visits, JSON.stringify(list.slice(0, 80)));
}

/* ───────────────────────── 收藏导出 ───────────────────────── */

export function exportFavorites() {
  const list = getFavorites();
  return JSON.stringify({ exportedAt: new Date().toISOString(), count: list.length, ids: list }, null, 2);
}
