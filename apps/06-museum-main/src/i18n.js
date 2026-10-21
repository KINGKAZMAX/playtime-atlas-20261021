/**
 * 双语文案骨架 · zh / en
 *
 * 依据 16-design-system/DESIGN-SPEC.md §4.3（语言切换）与 §5（中英无障碍）：
 *   · `html[lang]` 随语言切换，切换后**保留滚动位置**（只替换文本节点，不整页重排）
 *   · 偏好写入 localStorage，顶栏提供「中 / EN」切换
 *   · 每页提供 hreflang 交替链接
 *
 * 覆盖范围：**外壳与控件文案**（导航、按钮、筛选器、分区标题、空态、无障碍标签）。
 * 展品名称、叙述与史料条目仍以中文为主——那是**内容**不是界面，
 * 完整英译由 19 / 14 统一接入时再补，本目录不擅自代译史料文本。
 * 已在此登记的 key 构成 19/14 接入所需的文案契约。
 */

const STORAGE_KEY = 'ptatlas.lang.v1';

export const LANGS = ['zh', 'en'];

/** 中文（默认） */
const ZH = {
  'doc.title': '回响电玩馆 · PLAYTIME ATLAS',
  'doc.lang': 'zh-CN',

  'skip.toMain': '跳到主内容',
  'nav.rail': '馆内导览',
  'nav.eras': '年代展厅',
  'nav.other': '其他',
  'nav.home': '馆前广场',
  'nav.timeline': '时间长廊',
  'nav.catalog': '2D 无障碍目录',
  'nav.hall': '3D 展厅',
  'nav.about': '馆方说明',
  'nav.collection': '我的收藏',
  'nav.favorites': '收藏',
  'nav.search': '检索馆藏展品',
  'nav.searchPlaceholder': '检索展品：名称 / 创作者 / 平台',
  'nav.searchSubmit': '检索',
  'nav.lang': '切换语言',
  'nav.langZh': '中',
  'nav.langEn': 'EN',

  'home.eyebrow': 'PLAYTIME ATLAS · 馆方原创策展',
  'home.title': '回响电玩馆',
  'home.titleEn': 'PLAYTIME ATLAS',
  'home.lede':
    '一座关于电子游戏时间的常设馆。十个年代门沿时间长廊排开，硬件与作品各安其位；你可以检索、筛选、收藏，也可以在年代展厅里直接坐下玩一局。',
  'home.ctaTimeline': '开始漫游',
  'home.ctaCatalog': '打开 2D 无障碍目录',
  'home.statEras': '年代展厅',
  'home.statExhibits': '在册展品',
  'home.statSources': '登记来源',
  'home.statFavorites': '我的收藏',
  'home.corridor': '时间长廊',
  'home.corridorDesc': '十个年代门自 1950 年代排到 2020 年代，每道门后是一间展厅。',
  'home.corridorAll': '查看完整长廊 →',
  'home.featured': '本期推荐展品',
  'home.featuredAll': '全部展品 →',
  'home.halls': '可玩展厅',
  'home.hallsDesc': '每个年代展厅都接一个可玩的小展项；仍在制作的展项会如实标注「待集成」。',
  'home.about': '关于本馆',
  'home.aboutCta': '馆方说明与许可',

  'timeline.title': '时间长廊',
  'timeline.lede': '十个年代门沿馆内长廊排开，← / → 可在门与门之间移动。',
  'timeline.enter': '进入这个年代',

  'catalog.title': '2D 无障碍目录',
  'catalog.lede': '全部馆藏的完整目录：可全文检索，也可按年代、类别与平台筛选。筛选状态会写进地址栏，可直接分享。',
  'catalog.filterEra': '年代',
  'catalog.filterKind': '类别',
  'catalog.filterPlatform': '平台',
  'catalog.filterSort': '排序',
  'catalog.filterReset': '清除全部筛选',
  'catalog.searchLabel': '关键词',
  'catalog.resultsTitle': '展品列表',
  'catalog.sort.era': '按年代排列',
  'catalog.sort.yearAsc': '年份由早到晚',
  'catalog.sort.yearDesc': '年份由晚到早',
  'catalog.sort.title': '按名称',
  'catalog.viewGrid': '网格',
  'catalog.viewList': '列表',
  'catalog.count': '共 {n} 件展品',
  'catalog.countFiltered': '共 {n} 件展品（馆藏 {total} 件）',
  'catalog.empty': '没有匹配的展品',
  'catalog.emptyDetail': '换个关键词，或放宽年代与类别筛选。',

  'era.exhibits': '展品',
  'era.hardware': '硬件',
  'era.platform': '平台',
  'era.hall': '可玩展厅',
  'era.hallTitle': '本年代可玩展厅',
  'era.intro': '展厅导言',
  'era.corridor': '长时间廊',
  'era.prev': '← 上一个年代',
  'era.next': '下一个年代 →',

  'exhibit.narrative': '展品叙述',
  'exhibit.significance': '史实意义',
  'exhibit.sources': '来源与核对',
  'exhibit.source': '来源',
  'exhibit.license': '图片与素材许可',
  'exhibit.related': '同展厅展品',
  'exhibit.favorite': '加入收藏',
  'exhibit.unfavorite': '取消收藏',
  'exhibit.enterHall': '进入可玩展厅',

  'collection.title': '我的收藏',
  'collection.lede': '收藏只存在本机浏览器里，不上传、不跨设备同步。',
  'collection.export': '导出清单',
  'collection.clear': '清空收藏',
  'collection.empty': '还没有收藏任何展品',
  'collection.emptyDetail': '在展品详情页点「加入收藏」，它就会出现在这里。',

  'hall.title': '3D 展厅',
  'hall.halls': '可玩展厅一览',
  'hall.backToHall': '回到 3D 长廊',
  'hall.integrated': '已并入',
  'hall.pending': '待集成',

  'about.title': '馆方说明',
  'about.lede': '本馆的策展立场、数据来源、可玩展厅接入状态与素材许可，以及我们知道的局限。',
  'about.stance': '策展立场',
  'about.data': '数据与集成状态',
  'about.halls': '可玩展厅接入状态',
  'about.licenses': '素材与许可',
  'about.limits': '已知限制',
  'common.more': '查看更多',
};

/** 英文（次语言：仅外壳与控件） */
const EN = {
  'doc.title': 'Echo Arcade Museum · PLAYTIME ATLAS',
  'doc.lang': 'en',

  'skip.toMain': 'Skip to main content',
  'nav.rail': 'In-gallery guide',
  'nav.eras': 'Era galleries',
  'nav.other': 'Other',
  'nav.home': 'Forecourt',
  'nav.timeline': 'Timeline corridor',
  'nav.catalog': '2D accessible catalog',
  'nav.hall': '3D hall',
  'nav.about': 'Curator notes',
  'nav.collection': 'My collection',
  'nav.favorites': 'Saved',
  'nav.search': 'Search the collection',
  'nav.searchPlaceholder': 'Search: title / creator / platform',
  'nav.searchSubmit': 'Search',
  'nav.lang': 'Switch language',
  'nav.langZh': '中',
  'nav.langEn': 'EN',

  'home.eyebrow': 'PLAYTIME ATLAS · ORIGINAL CURATED BY THE MUSEUM',
  'home.title': 'Echo Arcade Museum',
  'home.titleEn': 'PLAYTIME ATLAS',
  'home.lede':
    'A permanent exhibition on electronic game time. Ten era doors line the corridor; hardware and works sit in their own cases. Search, filter and save — or sit down and play.',
  'home.ctaTimeline': 'Start the walk',
  'home.ctaCatalog': 'Open the 2D catalog',
  'home.statEras': 'Era galleries',
  'home.statExhibits': 'Works on record',
  'home.statSources': 'Registered sources',
  'home.statFavorites': 'Saved by you',
  'home.corridor': 'Timeline corridor',
  'home.corridorDesc': 'Ten era doors, from the 1950s to the 2020s — one gallery behind each.',
  'home.corridorAll': 'See the full corridor →',
  'home.featured': 'Featured works',
  'home.featuredAll': 'All works →',
  'home.halls': 'Playable halls',
  'home.hallsDesc': 'Each era gallery links to a playable exhibit; works still in production are labelled honestly.',
  'home.about': 'About this museum',
  'home.aboutCta': 'Curator notes and licences',

  'timeline.title': 'Timeline corridor',
  'timeline.lede': 'Ten era doors along the gallery corridor — use ← / → to move between doors.',
  'timeline.enter': 'Enter this era',

  'catalog.title': '2D accessible catalog',
  'catalog.lede': 'The complete catalog: full-text search plus era, category and platform filters. Filter state is written to the URL and can be shared.',
  'catalog.filterEra': 'Era',
  'catalog.filterKind': 'Category',
  'catalog.filterPlatform': 'Platform',
  'catalog.filterSort': 'Sort',
  'catalog.filterReset': 'Clear all filters',
  'catalog.searchLabel': 'Keyword',
  'catalog.resultsTitle': 'Works',
  'catalog.sort.era': 'By era',
  'catalog.sort.yearAsc': 'Year, oldest first',
  'catalog.sort.yearDesc': 'Year, newest first',
  'catalog.sort.title': 'By title',
  'catalog.viewGrid': 'Grid',
  'catalog.viewList': 'List',
  'catalog.count': '{n} works',
  'catalog.countFiltered': '{n} works (of {total})',
  'catalog.empty': 'No matching works',
  'catalog.emptyDetail': 'Try another keyword, or relax the era and category filters.',

  'era.exhibits': 'Works',
  'era.hardware': 'Hardware',
  'era.platform': 'Platforms',
  'era.hall': 'Playable hall',
  'era.hallTitle': 'Playable hall for this era',
  'era.intro': 'Gallery introduction',
  'era.corridor': 'Back to the corridor',
  'era.prev': '← Previous era',
  'era.next': 'Next era →',

  'exhibit.narrative': 'About this work',
  'exhibit.significance': 'Why it matters',
  'exhibit.sources': 'Sources and verification',
  'exhibit.source': 'Sources',
  'exhibit.license': 'Image and asset licence',
  'exhibit.related': 'Also in this gallery',
  'exhibit.favorite': 'Save to collection',
  'exhibit.unfavorite': 'Remove from collection',
  'exhibit.enterHall': 'Enter the playable hall',

  'collection.title': 'My collection',
  'collection.lede': 'Saved items live in this browser only — never uploaded, never synced.',
  'collection.export': 'Export list',
  'collection.clear': 'Clear all',
  'collection.empty': 'Nothing saved yet',
  'collection.emptyDetail': 'Use “Save to collection” on any work and it will appear here.',

  'hall.title': '3D hall',
  'hall.halls': 'Playable halls',
  'hall.backToHall': 'Back to the 3D corridor',
  'hall.integrated': 'Integrated',
  'hall.pending': 'Pending',

  'about.title': 'Curator notes',
  'about.lede': "This museum's curatorial stance, data provenance, playable-hall integration status, asset licences, and the limits we know about.",
  'about.stance': 'Curatorial stance',
  'about.data': 'Data and integration status',
  'about.halls': 'Playable hall integration status',
  'about.licenses': 'Assets and licences',
  'about.limits': 'Known limitations',
  'common.more': 'See more',
};

const DICTS = { zh: ZH, en: EN };

let current = 'zh';

/**
 * 读取初始语言。
 *
 * 本馆是**中文主站**（DESIGN-SPEC §0：中文为主 + 英文为次，双语同页共存），
 * 因此默认中文，**不**跟随浏览器语言自动翻转——否则英文系统的访客
 * 一进站看到的是英文外壳，而展品叙述仍是中文，体验是割裂的。
 * 想看英文版：点顶栏「EN」，或用 ?lang=en 直接进入（hreflang 交替链接指向该地址）。
 */
export function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.includes(saved)) return saved;
  } catch { /* 无痕模式等，忽略 */ }
  return 'zh';
}

export function getLang() {
  return current;
}

/** 取文案；缺 key 时回落到 key 本身，便于验收脚本发现遗漏 */
export function t(key, vars) {
  const raw = DICTS[current]?.[key] ?? DICTS.zh[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
}

/** 把 [data-i18n] / [data-i18n-attr] 上的文案按当前语言刷到 DOM 上 */
export function applyStatic(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.getAttribute('data-i18n'));
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    // 格式： "placeholder:nav.searchPlaceholder, aria-label:nav.search"
    for (const pair of el.getAttribute('data-i18n-attr').split(',')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
}

/**
 * 切换语言。
 * 只替换文本节点与 html[lang]，不整页重排——滚动位置天然保留。
 */
export function setLang(lang) {
  const next = LANGS.includes(lang) ? lang : 'zh';
  current = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* 忽略 */ }
  const html = document.documentElement;
  html.setAttribute('lang', DICTS[next]['doc.lang']);
  html.setAttribute('data-lang', next);
  document.title = t('doc.title');
  applyStatic(document);
  for (const btn of document.querySelectorAll('.lang-switch button')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === next));
  }
  return next;
}

/** 初始化：确定语言 → 刷文案 → 绑定切换按钮 */
export function initI18n() {
  setLang(detectLang());
  for (const btn of document.querySelectorAll('.lang-switch button')) {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
      window.dispatchEvent(new CustomEvent('ptatlas:langchange', { detail: { lang: current } }));
    });
  }
  return current;
}
