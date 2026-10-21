/**
 * Base-URL aware asset paths.
 *
 * The build uses a relative `base` so the same bundle can be served from a
 * domain root or from any sub-path (e.g. `/exhibits/02-abyss-salvager/`).
 * Every runtime asset URL therefore has to be joined against the build-time
 * base instead of being hard-coded to an absolute root path.
 *
 * `import.meta.env.BASE_URL` is `'./'` for a relative build and
 * `'/some/path/'` for an absolute one; `assetUrl()` normalises both.
 */

const RAW_BASE = import.meta.env?.BASE_URL ?? './';

/** Base directory that runtime assets are resolved against. */
export const BASE_URL = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

/**
 * Join a project-relative asset path onto the build base.
 *
 * @param {string} rel  e.g. `models/abyss-salvager-ac-vii.glb`
 * @returns {string}    e.g. `./models/abyss-salvager-ac-vii.glb`
 */
export function assetUrl(rel) {
  const clean = String(rel).replace(/^\.?\//, '');
  return `${BASE_URL}${clean}`;
}

/**
 * 把构建基准注入到 CSS 变量 `--ds-base`。
 *
 * 依据 `16-design-system/MIGRATION-NOTES.md` §6：入口注入 `--ds-base`，
 * 且**不得写死绝对根路径**。这里注入的是 `import.meta.env.BASE_URL`
 * （相对构建时为 `'./'`，绝对构建时为构建期前缀），
 * 因此同一份产物在域根与任意子路径下都成立。
 */
export function applyBaseToDocument() {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--ds-base', BASE_URL);
}
