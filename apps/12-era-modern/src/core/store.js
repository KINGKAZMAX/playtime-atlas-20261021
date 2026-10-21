/**
 * 命名空间化的 localStorage 存储。
 * 所有读操作都做异常保护：隐私模式 / 配额满 / 被篡改的 JSON 都不能让页面崩。
 */
const PREFIX = 'prismera.v1.';

function available() {
  try {
    const k = `${PREFIX}__probe`;
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const HAS_LS = available();
const memory = new Map();

export function read(key, fallback = null) {
  const full = PREFIX + key;
  try {
    const raw = HAS_LS ? window.localStorage.getItem(full) : memory.get(full);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[store] read failed for ${key}, using fallback`, err);
    return fallback;
  }
}

export function write(key, value) {
  const full = PREFIX + key;
  const raw = JSON.stringify(value);
  try {
    if (HAS_LS) window.localStorage.setItem(full, raw);
    else memory.set(full, raw);
    return true;
  } catch (err) {
    console.warn(`[store] write failed for ${key}`, err);
    memory.set(full, raw);
    return false;
  }
}

export function remove(key) {
  const full = PREFIX + key;
  try {
    if (HAS_LS) window.localStorage.removeItem(full);
  } catch {
    /* ignore */
  }
  memory.delete(full);
}

/** 清除本应用写入的全部键（不触碰其它站点的数据）。 */
export function clearAll() {
  const keys = [];
  try {
    if (HAS_LS) {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach((k) => window.localStorage.removeItem(k));
    }
  } catch {
    /* ignore */
  }
  memory.clear();
}

export const storageAvailable = HAS_LS;
