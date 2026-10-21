/**
 * storage.ts — 带命名空间与版本号的 localStorage 封装。
 *
 * 特性：
 * - 所有键统一前缀，卸载整站时不会污染其他应用的数据。
 * - localStorage 不可用（隐私模式 / 跨源 iframe 被拒）时自动退回内存存储，
 *   展项依然可以玩，只是刷新后不保留进度 —— 这一点在 UI 上有明确提示。
 */

const PREFIX = 'linkdawn.v1.';

let memoryFallback: Map<string, string> | null = null;
let storageOk = true;

try {
  const probe = `${PREFIX}__probe__`;
  window.localStorage.setItem(probe, '1');
  window.localStorage.removeItem(probe);
} catch {
  storageOk = false;
  memoryFallback = new Map();
}

export const storageAvailable = storageOk;

function readRaw(key: string): string | null {
  if (storageOk) {
    try {
      return window.localStorage.getItem(PREFIX + key);
    } catch {
      storageOk = false;
    }
  }
  return memoryFallback?.get(key) ?? null;
}

function writeRaw(key: string, value: string): boolean {
  if (storageOk) {
    try {
      window.localStorage.setItem(PREFIX + key, value);
      return true;
    } catch {
      storageOk = false;
    }
  }
  memoryFallback?.set(key, value);
  return false;
}

function removeRaw(key: string): void {
  if (storageOk) {
    try {
      window.localStorage.removeItem(PREFIX + key);
      return;
    } catch {
      storageOk = false;
    }
  }
  memoryFallback?.delete(key);
}

export function saveJson<T>(key: string, value: T): boolean {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function loadJson<T>(key: string): T | null {
  const raw = readRaw(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    removeRaw(key);
    return null;
  }
}

export function hasKey(key: string): boolean {
  return readRaw(key) !== null;
}

export function removeKey(key: string): void {
  removeRaw(key);
}

export function listKeys(): string[] {
  if (storageOk) {
    try {
      const out: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
      }
      return out;
    } catch {
      /* fallthrough */
    }
  }
  return memoryFallback ? [...memoryFallback.keys()] : [];
}
