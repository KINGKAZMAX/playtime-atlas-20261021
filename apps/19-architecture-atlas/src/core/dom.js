/** Tiny DOM helpers — no framework, no runtime dependency. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Design-system class bridge.
 *
 * 16-design-system 的外壳类名统一带 `ds-` 前缀（见 MIGRATION-NOTES §1.1
 * 路径 C）。本项目保留自己的类名作为增量，因此在创建元素时自动补上对应的
 * `ds-` 类名，让 16 的组件层也能作用到同一批元素上 —— 一处映射，全站生效。
 *
 * 既有类名一律不删除（16 MIGRATION-NOTES §10：本系统是增量）。
 */
const DS_ALIAS = {
  btn: 'ds-btn',
  'btn-sm': 'ds-btn--sm',
  'btn-primary': 'ds-btn--primary',
  chip: 'ds-chip',
  tag: 'ds-tag',
  grid: 'ds-grid',
  card: 'ds-work',
  'sr-only': 'ds-visually-hidden',
  'filter-search': 'ds-field',
  'icon-btn': 'ds-iconbtn',
  band: 'ds-section',
  'band-inner': 'ds-container',
  'band-head': 'ds-section__head',
  topbar: 'ds-topbar',
  brand: 'ds-topbar__brand',
  topnav: 'ds-topbar__nav',
  rail: 'ds-rail',
  'rail-item': 'ds-rail__item',
  footer: 'ds-footer',
  notice: 'ds-diagram',
  'detail-body': 'ds-detail__body',
  'detail-title': 'ds-detail__title',
  'detail-figure': 'ds-detail__figure',
  'source-list': 'ds-stack',
  'step-list': 'ds-stack',
  'part-list': 'ds-stack',
  'gloss-item': 'ds-work',
  'gloss-grid': 'ds-grid',
  'lab-grid': 'ds-grid',
  'lab-card': 'ds-work',
  'quiz-options': 'ds-stack',
  'empty': 'ds-diagram',
};

/**
 * Create an element.
 * @param {string} tag  tag name, optionally with `.class` and `#id` shorthands
 * @param {object} [attrs] attributes; `class`, `text`, `html`, `dataset`, `on` are special
 * @param {Array|string} [children]
 */
export function el(tag, attrs = {}, children = []) {
  const [name, ...rest] = tag.split(/(?=[.#])/);
  const node = document.createElement(name);
  for (const token of rest) {
    if (token.startsWith('.')) {
      const cls = token.slice(1);
      node.classList.add(cls);
      const ds = DS_ALIAS[cls];
      if (ds) node.classList.add(ds);
    } else if (token.startsWith('#')) node.id = token.slice(1);
  }
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') {
      const list = Array.isArray(value) ? value.filter(Boolean) : String(value || '').split(/\s+/).filter(Boolean);
      node.className = list.join(' ');
      for (const cls of list) if (DS_ALIAS[cls]) node.classList.add(DS_ALIAS[cls]);
    }
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'on') for (const [ev, fn] of Object.entries(value)) node.addEventListener(ev, fn);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Build an SVG element (namespace-aware). */
export function svgEl(tag, attrs = {}, children = []) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'on') for (const [ev, fn] of Object.entries(value)) node.addEventListener(ev, fn);
    else node.setAttribute(key, String(value));
  }
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function clear(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function mount(host, ...nodes) {
  clear(host);
  for (const node of nodes.flat()) if (node) host.append(node);
  return host;
}

export function debounce(fn, wait = 120) {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Escape a string for safe innerHTML interpolation. */
export function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/** Truncate for card previews. */
export function truncate(str, max = 120) {
  const s = String(str ?? '');
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}
