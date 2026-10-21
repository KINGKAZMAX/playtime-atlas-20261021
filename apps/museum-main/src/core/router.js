/**
 * 极简哈希路由
 *
 * 路由格式：
 *   #/                    首页
 *   #/timeline            时间长廊
 *   #/era/:eraId          年代展厅
 *   #/catalog             2D 无障碍目录（可带查询参数 ?q=&era=&kind=&sort=）
 *   #/exhibit/:id         展品详情
 *   #/collection          我的收藏
 *   #/hall                3D 展厅（可选）
 *   #/about               馆方说明 / 来源与许可
 */

export function parseHash(hash = window.location.hash) {
  const raw = String(hash || '').replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  const segments = path.split('/').filter(Boolean);
  const query = {};
  if (queryPart) {
    for (const [k, v] of new URLSearchParams(queryPart)) query[k] = v;
  }
  return { path, segments, query };
}

export function buildHash(name, params = {}) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    usp.set(k, String(v));
  }
  const q = usp.toString();
  return `#/${name}${q ? `?${q}` : ''}`;
}

export function createRouter(onRoute) {
  let current = null;

  function handle() {
    const next = parseHash();
    const same = current && current.path === next.path && JSON.stringify(current.query) === JSON.stringify(next.query);
    current = next;
    if (!same) onRoute(next);
  }

  window.addEventListener('hashchange', handle);

  return {
    start() {
      current = null;
      handle();
    },
    go(name, params) {
      window.location.hash = buildHash(name, params);
    },
    replace(name, params) {
      const url = `${window.location.pathname}${window.location.search}${buildHash(name, params)}`;
      window.history.replaceState(null, '', url);
      current = null;
      handle();
    },
    get current() {
      return current;
    },
  };
}
