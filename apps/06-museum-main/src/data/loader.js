/**
 * 策展数据装载器
 *
 * 优先级：
 *   1. `public/data/catalog.json` —— 由 05-museum-research 同步而来的策展目录
 *   2. `src/data/catalog.local.js` —— 本馆本地初版策展集（兜底）
 * 合并规则：以 id 为键，外部目录覆盖本地条目，本地仅补充外部未收录的条目。
 *
 * 同���装载 `public/data/exhibits.json`（由同步脚本生成），用于标记
 * 08–12 的可玩展厅是「已并入」还是「待集成」。
 */

import { LOCAL_CATALOG } from './catalog.local.js';
import { EXHIBIT_HALLS } from './exhibits.config.js';
import { ERAS } from './eras.js';

const BASE = (import.meta.env?.BASE_URL ?? './').replace(/\/*$/, '/');

async function fetchJson(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** 规范化单条展品，补齐缺失字段 */
export function normalizeExhibit(raw, index = 0) {
  const sourceUrls = Array.isArray(raw.sourceUrls) ? raw.sourceUrls.filter((u) => typeof u === 'string') : [];
  const sourceTitles = Array.isArray(raw.sourceTitles) && raw.sourceTitles.length === sourceUrls.length
    ? raw.sourceTitles
    : sourceUrls.map((u) => {
        try {
          const parsed = new URL(u);
          return decodeURIComponent(parsed.pathname.split('/wiki/')[1] ?? parsed.hostname);
        } catch {
          return u;
        }
      });

  const kindRaw = String(raw.kind ?? 'game');
  const kind = kindRaw === 'work' ? 'game'
    : ['game', 'hardware', 'platform'].includes(kindRaw) ? kindRaw
      : 'game';

  return {
    id: String(raw.id ?? `exhibit-${index}`),
    title: String(raw.title ?? '未命名展品'),
    titleZh: raw.titleZh ? String(raw.titleZh) : '',
    year: Number.isFinite(raw.year) ? raw.year : 0,
    era: String(raw.era ?? 'e01'),
    platform: String(raw.platform ?? '未标注平台'),
    creator: String(raw.creator ?? '未标注创作者'),
    kind,
    summary: String(raw.summary ?? ''),
    significance: String(raw.significance ?? ''),
    sourceUrls,
    sourceTitles,
    imageLicense: String(raw.imageLicense ?? '自绘 SVG 轮廓（回响电玩馆原创资产，项目自有）'),
    art: raw.art ? String(raw.art) : '',
    addedAt: Number.isFinite(raw.addedAt) ? raw.addedAt : 0,
  };
}

/**
 * 来源去重键：取来源 URL 里的百科条目标题。
 * 同一件作品在两份目录中往往 id 不同，但会指向同一个来源条目 ——
 * 用它作为主键即可避免重复陈列。
 */
export function sourceKey(exhibit) {
  for (const url of exhibit.sourceUrls ?? []) {
    const m = /^https?:\/\/[a-z-]+\.wikipedia\.org\/wiki\/(.+)$/i.exec(url);
    if (m) return decodeURIComponent(m[1]).toLowerCase();
  }
  return `id:${exhibit.id}`;
}

/**
 * 合并两份目录
 * 规则：
 *  1. 外部目录（05 策展目录）优先
 *  2. 本地初版只补充外部未收录的条目
 *  3. 依据来源条目去重，避免同一作品重复陈列
 */
export function mergeCatalog(remote, local) {
  const seen = new Set();
  const merged = [];

  for (const item of remote) {
    const key = sourceKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  for (const item of local) {
    const key = sourceKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

/**
 * 把外部目录的年代命名解析到本馆的年代。
 *
 * 外部策展目录使用自己的年代分组（如 origins / home8bit / console16），
 * 本馆使用更细的十个年代。解析规则：
 *   1. 取所有「年份落在区间内」的本馆年代作为候选
 *   2. 若候选中某个年代的 groups 包含外部年代名，优先选它
 *   3. 否则选区间跨度最小的候选
 *   4. 都不满足时返回一个外部年代占位
 */
export function resolveEra(eraId, year, eras) {
  const list = [...eras.values()];
  if (eras.has(eraId)) return eraId;

  const candidates = list.filter((e) => year >= e.from && year <= e.to);
  if (candidates.length) {
    const grouped = candidates.filter((e) => (e.groups ?? []).includes(eraId));
    const pool = grouped.length ? grouped : candidates;
    return pool.sort((a, b) => (a.to - a.from) - (b.to - b.from))[0].id;
  }
  return null;
}

let cache = null;

/** 装载策展数据（带缓存） */
export async function loadCatalog({ force = false } = {}) {
  if (cache && !force) return cache;

  const [remoteRaw, hallsRaw] = await Promise.all([
    fetchJson('data/catalog.json'),
    fetchJson('data/exhibits.json'),
  ]);

  const remote = Array.isArray(remoteRaw)
    ? remoteRaw.map(normalizeExhibit)
    : Array.isArray(remoteRaw?.items)
      ? remoteRaw.items.map(normalizeExhibit)
      : null;

  const local = LOCAL_CATALOG.map(normalizeExhibit);

  // 本馆年代表（含 groups，用于解析外部目录的年代命名）
  const baseEras = new Map(ERAS.map((e) => [e.id, e]));

  let exhibits;
  let source;
  if (remote && remote.length) {
    // 先按来源去重合并，再解析年代
    const merged = mergeCatalog(remote, local);
    for (const ex of merged) {
      const resolved = resolveEra(ex.era, ex.year, baseEras);
      if (resolved) ex.era = resolved;
    }
    exhibits = merged;
    source = remote.length >= local.length ? 'remote' : 'merged';
  } else {
    exhibits = local;
    source = 'local';
  }

  // 外部目录带来的、本馆没有叙述的年代 → 生成占位年代
  const eras = new Map(baseEras);
  for (const ex of exhibits) {
    if (!eras.has(ex.era)) {
      eras.set(ex.era, {
        id: ex.era,
        code: ex.era.toUpperCase(),
        label: ex.era,
        labelEn: ex.era,
        from: ex.year,
        to: ex.year,
        accent: '#FF6B2C',
        tagline: '本馆新增年代，叙述正在补写中。',
        narrative: '该年代由外部策展目录补充，馆方叙述文字待完善。',
        note: '本条目为外部策展目录带来的年代，本地馆方叙述尚未补写。',
        playableId: null,
        groups: [],
        external: true,
      });
    }
  }

  const halls = buildHalls(hallsRaw);

  cache = { exhibits, source, eras, halls, remoteCount: remote?.length ?? 0, localCount: local.length };
  return cache;
}

/** 合并可玩展厅状态 */
function buildHalls(hallsRaw) {
  const statusById = new Map();
  const list = Array.isArray(hallsRaw) ? hallsRaw : Array.isArray(hallsRaw?.halls) ? hallsRaw.halls : [];
  for (const h of list) {
    if (h && typeof h.id === 'string') statusById.set(h.id, h);
  }

  return EXHIBIT_HALLS.map((cfg) => {
    const found = statusById.get(cfg.id);
    return {
      ...cfg,
      status: found?.status === 'integrated' ? 'integrated' : 'pending',
      entryPath: found?.entryPath ?? `${cfg.targetDir}/${cfg.entry}`,
      note: found?.note ?? '',
    };
  });
}

/** 展品 id → 展品 */
export function indexById(exhibits) {
  return new Map(exhibits.map((e) => [e.id, e]));
}
