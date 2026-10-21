/**
 * 折光纪 · 文案骨架的取用入口。
 *
 * **当前状态：骨架已就绪，尚未切换语言。**
 * 页面默认仍为中文（`zh`），`setLang()` 已实现但没有任何界面入口调用它——
 * 这是刻意的：语言切换是独立的一步，需要在文案键位稳定、翻译审校完成后才开放。
 *
 * 用法：
 *   import { t } from '../core/i18n/index.js';
 *   el('button', {}, t('settings.open'));
 *   el('p', {}, t('pulse.setup.best', { score: 1200 }));
 */

import { zh } from './zh.js';
import { en } from './en.js';

/** 支持的语言。 */
export const LANGS = { zh, en };

/** 默认语言（与 `index.html` 的 `lang="zh-CN"` 保持一致）。 */
export const DEFAULT_LANG = 'zh';

/** 当前语言。 */
let current = DEFAULT_LANG;

/** 语言变化订阅（供未来的切换器使用）。 */
const listeners = new Set();

/** 读取当前语言。 */
export function getLang() {
  return current;
}

/**
 * 切换语言。会同步 `<html lang>`，并通知所有订阅者。
 * @param {'zh'|'en'} lang
 */
export function setLang(lang) {
  if (!LANGS[lang] || lang === current) return current;
  current = lang;
  try {
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
  } catch {
    /* 非浏览器环境忽略 */
  }
  for (const fn of listeners) {
    try {
      fn(lang);
    } catch {
      /* 单个订阅者出错不影响其他订阅者 */
    }
  }
  return current;
}

/**
 * 订阅语言变化，返回取消订阅函数。
 * @param {(lang: string) => void} fn
 */
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * 取文案。缺失时按 `当前语言 → zh → 键名` 的顺序回落，
 * 绝不返回空白或 `undefined`。
 * @param {string} key
 * @param {Record<string, string|number>} [vars] `{name}` 占位替换
 */
export function t(key, vars) {
  const table = LANGS[current] || LANGS[DEFAULT_LANG];
  let text = table[key];
  if (text == null) text = LANGS[DEFAULT_LANG][key];
  if (text == null) text = key;
  if (!vars) return text;
  return String(text).replace(/\{(\w+)\}/g, (all, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : all,
  );
}

/** 全部键名（升序）。用于对等校验与文档生成。 */
export function allKeys(lang = DEFAULT_LANG) {
  return Object.keys(LANGS[lang] || {}).sort();
}
