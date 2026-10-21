/**
 * 哈希路由。
 * 使用 hash 而非 history API，是为了在 GitHub Pages 任意子路径下直接可用（无需服务端重写）。
 */

const listeners = new Set();
let currentPath = null;

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, '');
  const path = raw.split('?')[0] || '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function getCurrentPath() {
  return currentPath || parseHash();
}

export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function navigate(path) {
  const target = `#${path}`;
  if (window.location.hash === target) {
    handleChange();
    return;
  }
  window.location.hash = target;
}

function handleChange() {
  const path = parseHash();
  if (path === currentPath) return;
  currentPath = path;
  for (const fn of listeners) {
    try {
      fn(path);
    } catch (err) {
      console.error('[router] handler failed', err);
    }
  }
}

export function startRouter() {
  window.addEventListener('hashchange', handleChange);
  handleChange();
}
