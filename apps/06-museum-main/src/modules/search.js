/**
 * 检索与筛选（纯函数，便于单元测试）
 *
 * 所有筛选维度与排序方式都在这里集中实现，视图层只负责传参与渲染。
 */

import { splitPlatforms } from '../core/format.js';

/** 文本归一：小写 + 去除多余空白 */
export function normalize(value) {
  return String(value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/** 展品参与检索的字段 */
export function searchableText(exhibit) {
  return normalize([
    exhibit.title,
    exhibit.titleZh,
    exhibit.creator,
    exhibit.platform,
    exhibit.summary,
    exhibit.significance,
    exhibit.year,
    exhibit.era,
  ].join(' '));
}

/** 关键词匹配：多关键词以空格分隔，需全部命中 */
export function matchesQuery(exhibit, query) {
  const q = normalize(query);
  if (!q) return true;
  const haystack = searchableText(exhibit);
  return q.split(' ').every((token) => haystack.includes(token));
}

/**
 * 主筛选函数
 * @param {Array} exhibits
 * @param {Object} options
 * @param {string} options.query      关键词（兼容别名 options.q）
 * @param {string[]} options.eras      年代 id 列表，空表示不限
 * @param {string[]} options.kinds     类别，空表示不限
 * @param {string[]} options.platforms 平台，空表示不限
 * @param {string} options.sort        'era' | 'year-asc' | 'year-desc' | 'title' | 'recent'
 */
export function filterExhibits(exhibits, options = {}) {
  const {
    query = options.q ?? '',
    eras = [],
    kinds = [],
    platforms = [],
    sort = 'era',
  } = options;

  const eraSet = new Set(eras);
  const kindSet = new Set(kinds);
  const platSet = new Set(platforms.map(normalize));

  const filtered = exhibits.filter((ex) => {
    if (!matchesQuery(ex, query)) return false;
    if (eraSet.size && !eraSet.has(ex.era)) return false;
    if (kindSet.size && !kindSet.has(ex.kind)) return false;
    if (platSet.size) {
      const list = splitPlatforms(ex.platform).map(normalize);
      const hay = normalize(ex.platform);
      const hit = list.some((p) => platSet.has(p)) || [...platSet].some((p) => hay.includes(p));
      if (!hit) return false;
    }
    return true;
  });

  return sortExhibits(filtered, sort);
}

/** 排序 */
export function sortExhibits(exhibits, sort = 'era') {
  const copy = [...exhibits];
  switch (sort) {
    case 'year-asc':
      return copy.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'zh'));
    case 'year-desc':
      return copy.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, 'zh'));
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'zh'));
    case 'recent':
      return copy.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0) || a.title.localeCompare(b.title, 'zh'));
    case 'era':
    default:
      return copy.sort((a, b) => a.era.localeCompare(b.era) || a.year - b.year);
  }
}

/**
 * 收集筛选面板需要的分面统计
 * @returns {{eras: Array, kinds: Array, platforms: Array, total: number}}
 */
export function collectFacets(exhibits) {
  const eraCount = new Map();
  const kindCount = new Map();
  const platCount = new Map();

  for (const ex of exhibits) {
    eraCount.set(ex.era, (eraCount.get(ex.era) ?? 0) + 1);
    kindCount.set(ex.kind, (kindCount.get(ex.kind) ?? 0) + 1);
    for (const p of splitPlatforms(ex.platform)) {
      const key = p.trim();
      if (!key) continue;
      platCount.set(key, (platCount.get(key) ?? 0) + 1);
    }
  }

  const sortCount = (map) =>
    [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'));

  return {
    eras: sortCount(eraCount),
    kinds: sortCount(kindCount),
    platforms: sortCount(platCount),
    total: exhibits.length,
  };
}

/**
 * 生成一段用于 aria-live 的结果播报文案
 *
 * 语言随界面语言切换；默认中文，保证既有调用与单元测试行为不变。
 */
export function resultAnnouncement(count, total, query, lang = 'zh') {
  if (lang === 'en') {
    const parts = [`${count} works`];
    if (total !== count) parts.push(`(of ${total})`);
    if (query && String(query).trim()) parts.push(`, keyword “${String(query).trim()}”`);
    return parts.join('');
  }
  const parts = [`共 ${count} 件展品`];
  if (total !== count) parts.push(`（馆藏 ${total} 件）`);
  if (query && String(query).trim()) parts.push(`，关键词「${String(query).trim()}」`);
  return parts.join('');
}
