/**
 * 极简 i18n 运行时
 * ------------------------------------------------------------------
 * 依据 15-supervisor/RESTYLE-SPEC.md §4 第 1 步（zh/en key 清单）与
 *      16-design-system/DESIGN-SPEC.md §4.3（语言切换：html[lang] + localStorage）。
 *
 * 设计要点：
 *  · 纯文案替换，不做整页重排（§4.3「不做整页重排动画」）。
 *  · <html lang> 随语言切换（§11.2 语言标记）。
 *  · 静态文案用 data-i18n / data-i18n-html / data-i18n-aria 声明；
 *    动态文案用 t() 取出后再写入。
 *  · 世界观内容在数据文件里带 xxEn 字段，用 loc() 取本地化字段。
 */
import zh from './zh.js';
import en from './en.js';

const DICTS = { zh, en };
const STORAGE_KEY = 'frostgap-voyager.lang.v1';
const SUPPORTED = ['zh', 'en'];

let current = 'zh';
const listeners = new Set();

/** 当前语言（'zh' | 'en'） */
export function getLang() {
  return current;
}

/**
 * 取一条界面文案。
 * @param {string} key  zh.js / en.js 中的键
 * @param {object} vars 占位符，如 { name: '维岚' } → '{name}' 被替换
 */
export function t(key, vars) {
  const dict = DICTS[current] || zh;
  let out = dict[key];
  if (out === undefined) out = zh[key];
  if (out === undefined) return key;
  if (vars) {
    out = out.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m));
  }
  return out;
}

/**
 * 取内容对象里的本地化字段。
 * obj.name 在英文模式下取 obj.nameEn，缺失则回退原文。
 */
export function loc(obj, field) {
  if (!obj) return '';
  if (current === 'en') {
    const enField = obj[`${field}En`];
    if (enField) return enField;
  }
  return obj[field] ?? '';
}

/** 订阅语言变化（用于重建动态区域：HUD、任务、星图、档案） */
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 把 DOM 上声明的 data-i18n* 属性刷新一遍 */
export function applyStatic(root = document) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.dataset.i18nTitle));
  });
}

/** 读取 ?lang=zh-CN / ?lang=en 直达参数（hreflang 链接用同一套参数） */
function readQueryLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (!q) return null;
    const norm = q.toLowerCase();
    if (norm === 'en' || norm === 'en-us' || norm === 'en-gb') return 'en';
    if (norm.startsWith('zh')) return 'zh';
  } catch {
    /* 无 location（SSR/测试环境）时忽略 */
  }
  return null;
}

/**
 * 运行时注入 hreflang（DESIGN-SPEC §11.2 语言标记）
 * ------------------------------------------------------------------
 * 为什么不在 index.html 里静态写：
 *  · hreflang 规范要求绝对 URL，本作部署在 Pages 子路径
 *    （/playtime-atlas-20261021/works/<id>/），写死会在换前缀后失效；
 *  · Vite 的 build-html 会把所有 <link href> 当资源解析，相对路径会
 *    被解析成项目根目录 → EISDIR，构建失败。
 * 运行时按 location 拼绝对地址，天然适配任意子路径。
 */
export function syncHreflang() {
  if (typeof document === 'undefined' || !document.head) return;
  const base = `${window.location.origin}${window.location.pathname}`;
  const defs = [
    { hreflang: 'zh-CN', href: `${base}?lang=zh-CN` },
    { hreflang: 'en', href: `${base}?lang=en` },
    { hreflang: 'x-default', href: `${base}?lang=zh-CN` },
  ];
  document.head.querySelectorAll('link[rel="alternate"][data-ds-hreflang]').forEach((el) => el.remove());
  defs.forEach(({ hreflang, href }) => {
    const el = document.createElement('link');
    el.rel = 'alternate';
    el.hreflang = hreflang;
    el.href = href;
    el.setAttribute('data-ds-hreflang', '');
    document.head.appendChild(el);
  });
}

/** 切换语言并广播 */
export function setLang(next) {
  const lang = SUPPORTED.includes(next) ? next : 'zh';
  current = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* 隐私模式下不可写，忽略 */
  }
  syncHreflang();
  applyStatic(document);
  listeners.forEach((fn) => {
    try {
      fn(lang);
    } catch (err) {
      console.warn('[i18n] 语言刷新回调失败', err);
    }
  });
}

/**
 * 启动时决定语言：
 *   ?lang= 直达参数 > localStorage 记忆 > 默认中文
 * 同时刷新 hreflang 与 <html lang>。
 */
export function initLang() {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }
  const fromQuery = readQueryLang();
  setLang(fromQuery || (saved === 'en' ? 'en' : 'zh'));
  return current;
}
