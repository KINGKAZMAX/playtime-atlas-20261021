/**
 * 车间存档（localStorage）
 * ------------------------------------------------------------------
 * 负责：保存 / 读取 / 清除车间状态，以及在写入失败时降级为内存态。
 * 绝不静默失败——降级时通过 onFallback 回调通知 UI。
 */

import { STORAGE_KEY, initialState } from './workshop.js';

const memoryStore = new Map();
let storageAvailable = true;

function probeStorage() {
  try {
    const probe = '__loomdeck_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {object} opts
 * @param {(state:object)=>void} opts.onRestore  读取到存档时的回调
 * @param {(reason:string)=>void} opts.onFallback 存储不可用/数据损坏时的回调
 */
export function createStorage({ onRestore, onFallback } = {}) {
  storageAvailable = probeStorage();

  function write(state) {
    const payload = JSON.stringify({ ...state, savedAt: Date.now() });
    if (!storageAvailable) {
      memoryStore.set(STORAGE_KEY, payload);
      return false;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, payload);
      return true;
    } catch (err) {
      // 配额不足或隐私模式
      storageAvailable = false;
      memoryStore.set(STORAGE_KEY, payload);
      onFallback?.(err?.name === 'QuotaExceededError'
        ? '本地存储配额已满，本次会话改用内存存档（刷新后不保留）'
        : '本地存储不可用，本次会话改用内存存档（刷新后不保留）');
      return false;
    }
  }

  function read() {
    let raw = null;
    if (storageAvailable) {
      try {
        raw = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        raw = memoryStore.get(STORAGE_KEY) ?? null;
      }
    } else {
      raw = memoryStore.get(STORAGE_KEY) ?? null;
    }
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.looms)) {
        throw new Error('存档结构不合法');
      }
      return parsed;
    } catch {
      onFallback?.('存档数据损坏，已忽略并以初始状态启动');
      return null;
    }
  }

  function clear() {
    memoryStore.delete(STORAGE_KEY);
    if (!storageAvailable) return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* 忽略 */
    }
  }

  function isAvailable() {
    return storageAvailable;
  }

  return { write, read, clear, isAvailable };
}

/** 把读回的存档补齐缺失字段，避免旧版本存档导致渲染报错。 */
export function hydrate(stored) {
  const base = initialState();
  if (!stored) return base;

  const merged = {
    ...base,
    ...stored,
    looms: Array.isArray(stored.looms) && stored.looms.length
      ? stored.looms.map((l, i) => ({ ...base.looms[i % base.looms.length], ...l, history: l.history ?? [], spark: l.spark ?? [] }))
      : base.looms,
    orders: Array.isArray(stored.orders) ? stored.orders : [],
    log: Array.isArray(stored.log) ? stored.log : [],
    telemetry: Array.isArray(stored.telemetry) ? stored.telemetry : [],
  };

  // 订单号计数器需要接续，避免重号
  const maxSeq = merged.orders.reduce((max, o) => {
    const n = Number(String(o.id ?? '').replace(/\D/g, ''));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  merged.orderSeq = maxSeq;

  return merged;
}
