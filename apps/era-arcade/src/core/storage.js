/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/storage.js — 本地存档（localStorage 命名空间隔离）
 *
 * 仅存储：最高分、设置项、已解锁记录。绝不写入任何凭据或日志。
 */

const NS = 'neon-corridor-arcade:v1:';

function safeGet(key) {
  try {
    return window.localStorage.getItem(NS + key);
  } catch (err) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(NS + key, value);
    return true;
  } catch (err) {
    return false;
  }
}

export const store = {
  get(key, fallback) {
    const raw = safeGet(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  },
  set(key, value) {
    return safeSet(key, JSON.stringify(value));
  },
  remove(key) {
    try {
      window.localStorage.removeItem(NS + key);
    } catch (err) {
      /* 忽略：无痕模式下写入会抛错 */
    }
  },
};

/** 读取/写入高分榜：[{ name, score, at }] */
export function loadScores(gameId) {
  const list = store.get(`scores:${gameId}`, []);
  return Array.isArray(list) ? list : [];
}

export function saveScore(gameId, score, name = 'PLAYER') {
  if (!Number.isFinite(score) || score <= 0) return loadScores(gameId);
  const list = loadScores(gameId);
  list.push({ name, score: Math.floor(score), at: Date.now() });
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 8);
  store.set(`scores:${gameId}`, trimmed);
  return trimmed;
}
