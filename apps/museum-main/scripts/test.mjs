#!/usr/bin/env node
/**
 * 单元测试 · 回响电玩馆主站
 *
 * 覆盖：检索与筛选、路由解析、收藏存储、格式化与转义、目录完整性。
 * 运行：npm test
 */

// ── 极简测试框架 ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures = [];
let group = '';

function describe(name, fn) {
  group = name;
  console.log(`\n▶ ${name}`);
  fn();
}

function it(name, fn) {
  try {
    const r = fn();
    if (r instanceof Promise) {
      throw new Error('测试函数必须同步');
    }
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed += 1;
    failures.push(`[${group}] ${name} → ${err.message}`);
    console.log(`  ✗ ${name} → ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || '断言失败');
}

function eq(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg || '不相等'}：期望 ${e}，实际 ${a}`);
}

// ── localStorage 模拟（store.js 依赖） ──────────────────────────────────────
const mem = new Map();
globalThis.window = globalThis.window ?? {};
globalThis.window.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  clear: () => mem.clear(),
};

const { filterExhibits, matchesQuery, collectFacets, resultAnnouncement, sortExhibits } =
  await import('../src/modules/search.js');
const { parseHash, buildHash } = await import('../src/core/router.js');
const store = await import('../src/core/store.js');
const { escapeHtml, highlight, displayTitle, kindLabel, splitPlatforms } = await import('../src/core/format.js');
const { LOCAL_CATALOG } = await import('../src/data/catalog.local.js');
const { ERAS } = await import('../src/data/eras.js');
const { EXHIBIT_HALLS } = await import('../src/data/exhibits.config.js');
const { mergeCatalog, resolveEra, sourceKey, normalizeExhibit } = await import('../src/data/loader.js');

/* ───────────────────────── 检索与筛选 ───────────────────────── */
describe('检索与筛选', () => {
  const sample = [
    { id: 'a', title: 'Pong', titleZh: '碰', year: 1972, era: 'e03', platform: '街机机台', creator: 'Allan Alcorn', kind: 'game', summary: '弹球' },
    { id: 'b', title: 'Atari 2600', titleZh: '', year: 1977, era: 'e03', platform: '卡带家用机', creator: 'Atari', kind: 'hardware', summary: '主机' },
    { id: 'c', title: 'Doom', titleZh: '', year: 1993, era: 'e06', platform: 'PC / MS-DOS', creator: 'id Software', kind: 'game', summary: '射击' },
  ];

  it('空查询返回全部', () => {
    eq(filterExhibits(sample, {}).length, 3);
  });

  it('关键词可命中标题', () => {
    const r = filterExhibits(sample, { query: 'pong' });
    eq(r.map((e) => e.id), ['a']);
  });

  it('关键词可命中创作者', () => {
    eq(filterExhibits(sample, { query: 'id software' }).map((e) => e.id), ['c']);
  });

  it('多关键词需全部命中', () => {
    eq(filterExhibits(sample, { query: 'pong street' }).length, 0);
    eq(filterExhibits(sample, { query: 'pong arcade' }).length, 0);
  });

  it('中文关键词可命中中文名', () => {
    eq(filterExhibits(sample, { query: '碰' }).map((e) => e.id), ['a']);
  });

  it('按年代筛选', () => {
    eq(filterExhibits(sample, { eras: ['e03'] }).length, 2);
  });

  it('按类别筛选', () => {
    eq(filterExhibits(sample, { kinds: ['hardware'] }).map((e) => e.id), ['b']);
  });

  it('按平台筛选（部分匹配）', () => {
    eq(filterExhibits(sample, { platforms: ['PC'] }).map((e) => e.id), ['c']);
  });

  it('按年份升序排序', () => {
    eq(sortExhibits(sample, 'year-asc').map((e) => e.year), [1972, 1977, 1993]);
  });

  it('按年份降序排序', () => {
    eq(sortExhibits(sample, 'year-desc').map((e) => e.year), [1993, 1977, 1972]);
  });

  it('分面统计数量正确', () => {
    const f = collectFacets(sample);
    eq(f.total, 3);
    eq(f.eras.find(([id]) => id === 'e03')[1], 2);
    eq(f.kinds.find(([k]) => k === 'game')[1], 2);
  });

  it('分面统计平台会拆分复合字段', () => {
    const f = collectFacets(sample);
    const names = f.platforms.map(([p]) => p);
    assert(names.includes('PC') && names.includes('MS-DOS'), '平台应被拆分为独立项');
  });

  it('结果播报包含数量', () => {
    const s = resultAnnouncement(3, 10, 'pong');
    assert(s.includes('3') && s.includes('10'), '播报应含当前数量与总数');
  });

  it('matchesQuery 对空查询返回 true', () => {
    assert(matchesQuery(sample[0], ''), '空查询应匹配');
    assert(matchesQuery(sample[0], '   '), '空白查询应匹配');
  });
});

/* ───────────────────────── 路由 ───────────────────────── */
describe('路由解析', () => {
  it('解析首页', () => {
    const r = parseHash('#/');
    eq(r.segments, []);
  });

  it('解析年代路由', () => {
    const r = parseHash('#/era/e04');
    eq(r.segments, ['era', 'e04']);
  });

  it('解析展品路由', () => {
    eq(parseHash('#/exhibit/pong-1972').segments, ['exhibit', 'pong-1972']);
  });

  it('解析查询参数', () => {
    const r = parseHash('#/catalog?q=pong&era=e03,e04');
    eq(r.query.q, 'pong');
    eq(r.query.era, 'e03,e04');
  });

  it('构建带参地址', () => {
    eq(buildHash('catalog', { q: 'pong', era: '' }), '#/catalog?q=pong');
  });

  it('空查询参数被省略', () => {
    eq(buildHash('catalog', { q: '', sort: 'year-asc' }), '#/catalog?sort=year-asc');
  });
});

/* ───────────────────────── 收藏存储 ───────────────────────── */
describe('收藏与设置', () => {
  it('初始无收藏', () => {
    eq(store.getFavorites(), []);
  });

  it('收藏后写入本地存储', () => {
    store.toggleFavorite('pong-1972');
    assert(store.isFavorite('pong-1972'), '应标记为已收藏');
    assert(store.getFavorites().includes('pong-1972'), '应写入 localStorage');
  });

  it('再次点击取消收藏', () => {
    store.toggleFavorite('pong-1972');
    assert(!store.isFavorite('pong-1972'), '应取消收藏');
  });

  it('收藏在模块间保持', () => {
    store.toggleFavorite('doom-1993');
    assert(store.getFavorites().includes('doom-1993'), '收藏应持久化');
  });

  it('清空收藏', () => {
    store.clearFavorites();
    eq(store.getFavorites(), []);
  });

  it('设置可读写', () => {
    store.updateSettings({ density: 'compact' });
    eq(store.getSettings().density, 'compact');
    store.updateSettings({ density: 'comfortable' });
  });

  it('参观足迹去重且置顶', () => {
    store.markVisited('a');
    store.markVisited('b');
    store.markVisited('a');
    eq(store.getVisits(), ['a', 'b']);
  });
});

/* ───────────────────────── 格式化与转义 ───────────────────────── */
describe('格式化与安全', () => {
  it('HTML 特殊字符被转义', () => {
    eq(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('引号被转义', () => {
    eq(escapeHtml(`"x" 'y'`), '&quot;x&quot; &#39;y&#39;');
  });

  it('高亮不会破坏 HTML', () => {
    const out = highlight('<b>Pong</b>', 'pong');
    assert(out.includes('&lt;b&gt;'), '原始标签应被转义');
    assert(out.includes('<mark>'), '应包裹匹配项');
  });

  it('平台字段可拆分', () => {
    eq(splitPlatforms('PC / MS-DOS'), ['PC', 'MS-DOS']);
  });

  it('中文名优先作为标题', () => {
    eq(displayTitle({ title: 'Pong', titleZh: '碰' }), '碰');
    eq(displayTitle({ title: 'Pong' }), 'Pong');
  });

  it('类别有中文名', () => {
    eq(kindLabel('game'), '游戏作品');
    eq(kindLabel('hardware'), '硬件设备');
  });
});

/* ───────────────────────── 目录完整性 ───────────────────────── */
describe('策展目录完整性', () => {
  it('条目数量充足（≥70）', () => {
    assert(LOCAL_CATALOG.length >= 70, `当前仅 ${LOCAL_CATALOG.length} 条`);
  });

  it('id 唯一', () => {
    const ids = LOCAL_CATALOG.map((e) => e.id);
    eq(new Set(ids).size, ids.length);
  });

  it('每条都有来源', () => {
    const bad = LOCAL_CATALOG.filter((e) => !Array.isArray(e.sourceUrls) || !e.sourceUrls.length);
    eq(bad.map((e) => e.id), []);
  });

  it('来源均为 http(s)', () => {
    const bad = LOCAL_CATALOG.filter((e) => e.sourceUrls.some((u) => !/^https?:\/\//.test(u)));
    eq(bad.map((e) => e.id), []);
  });

  it('每条都有图片许可说明', () => {
    const bad = LOCAL_CATALOG.filter((e) => !e.imageLicense);
    eq(bad.map((e) => e.id), []);
  });

  it('全部条目归属已定义年代', () => {
    const eraIds = new Set(ERAS.map((e) => e.id));
    const bad = LOCAL_CATALOG.filter((e) => !eraIds.has(e.era));
    eq(bad.map((e) => e.id), []);
  });

  it('年代数量不少于 7 个', () => {
    assert(ERAS.length >= 7, `当前 ${ERAS.length} 个年代`);
  });

  it('每个年代都有展品', () => {
    const used = new Set(LOCAL_CATALOG.map((e) => e.era));
    const empty = ERAS.map((e) => e.id).filter((id) => !used.has(id));
    eq(empty, []);
  });

  it('年份落在所属年代区间内', () => {
    const range = Object.fromEntries(ERAS.map((e) => [e.id, [e.from, e.to]]));
    const bad = LOCAL_CATALOG.filter((e) => {
      const [from, to] = range[e.era];
      return e.year < from || e.year > to;
    });
    eq(bad.map((e) => `${e.id}:${e.year}`), []);
  });

  it('可玩展厅配置覆盖 5 个年代展厅', () => {
    eq(EXHIBIT_HALLS.length, 5);
    const ids = EXHIBIT_HALLS.map((h) => h.id);
    eq(new Set(ids).size, ids.length);
  });

  it('每个可玩展厅都声明了年代归属', () => {
    const bad = EXHIBIT_HALLS.filter((h) => !Array.isArray(h.eras) || !h.eras.length);
    eq(bad.map((h) => h.id), []);
  });
});

/* ───────────────────────── 外部策展目录接入 ───────────────────────── */
describe('外部策展目录接入（05 / 07）', () => {
  const eraMap = new Map(ERAS.map((e) => [e.id, e]));

  it('来源去重键取百科条目', () => {
    const ex = { id: 'x', sourceUrls: ['https://en.wikipedia.org/wiki/Pong'] };
    eq(sourceKey(ex), 'pong');
  });

  it('无百科来源时回落到 id', () => {
    eq(sourceKey({ id: 'abc', sourceUrls: [] }), 'id:abc');
  });

  it('外部目录按来源去重（外部优先）', () => {
    const remote = [{ id: 'r1', title: '外部版', sourceUrls: ['https://en.wikipedia.org/wiki/Pong'] }];
    const local = [{ id: 'l1', title: '本地版', sourceUrls: ['https://en.wikipedia.org/wiki/Pong'] }];
    const merged = mergeCatalog(remote, local);
    eq(merged.length, 1);
    eq(merged[0].title, '外部版');
  });

  it('不同来源的条目都会被保留', () => {
    const remote = [{ id: 'r1', sourceUrls: ['https://en.wikipedia.org/wiki/Pong'] }];
    const local = [{ id: 'l1', sourceUrls: ['https://en.wikipedia.org/wiki/Doom'] }];
    eq(mergeCatalog(remote, local).length, 2);
  });

  it('外部年代名按年份解析到本馆年代', () => {
    eq(resolveEra('origins', 1951, eraMap), 'e01');
    eq(resolveEra('origins', 1968, eraMap), 'e02');
    eq(resolveEra('arcade', 1971, eraMap), 'e03');
    eq(resolveEra('arcade', 1979, eraMap), 'e04');
    eq(resolveEra('home8bit', 1980, eraMap), 'e04');
    eq(resolveEra('home8bit', 1989, eraMap), 'e05');
    eq(resolveEra('console16', 1990, eraMap), 'e05');
    eq(resolveEra('console16', 1998, eraMap), 'e07');
    eq(resolveEra('online', 2001, eraMap), 'e07');
    eq(resolveEra('online', 2009, eraMap), 'e08');
    eq(resolveEra('mobile', 2010, eraMap), 'e08');
    eq(resolveEra('mobile', 2014, eraMap), 'e09');
    eq(resolveEra('modern', 2016, eraMap), 'e09');
    eq(resolveEra('modern', 2024, eraMap), 'e10');
  });

  it('本馆年代名原样返回', () => {
    eq(resolveEra('e05', 1988, eraMap), 'e05');
  });

  it('kind=work 归一为 game', () => {
    eq(normalizeExhibit({ id: 'a', kind: 'work' }).kind, 'game');
  });

  it('缺失来源标题时自动推导', () => {
    const ex = normalizeExhibit({ id: 'a', sourceUrls: ['https://en.wikipedia.org/wiki/Spacewar!'] });
    eq(ex.sourceTitles, ['Spacewar!']);
  });

  it('每个年代都声明了 groups（供外部年代解析）', () => {
    const bad = ERAS.filter((e) => !Array.isArray(e.groups) || !e.groups.length);
    eq(bad.map((e) => e.id), []);
  });
});

/* ───────────────────────── 汇总 ───────────────────────── */console.log(`\n${'─'.repeat(48)}`);
console.log(`结果：通过 ${passed} · 失败 ${failed}`);
if (failed) {
  console.log('\n失败详情：');
  failures.forEach((f) => console.log(`  · ${f}`));
  process.exit(1);
}
console.log('✓ 全部测试通过');
