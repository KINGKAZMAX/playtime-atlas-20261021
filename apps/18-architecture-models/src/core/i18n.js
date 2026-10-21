/**
 * i18n.js — 中英文案 / Bilingual strings
 *
 * 英文为默认语言；中文为完整翻译。所有面向用户的字符串都走这里，
 * 保证 19-architecture-atlas 复用时能整体切换。
 */

export const LANGS = ['en', 'zh'];

export const STRINGS = {
  appTitle: { en: 'Timber Craft Lab', zh: '榫构华夏' },
  appTitleLatin: { en: 'TIMBER CRAFT LAB', zh: '榫构华夏 · 结构实验室' },
  tagline: { en: 'Taken apart, it explains itself', zh: '拆开，才看得懂' },
  statement: {
    en: 'Six structural systems from Chinese traditional architecture, rebuilt as explodable 3D teaching models. Every piece is generated in code — no downloaded assets, no fabrication data.',
    zh: '中国传统建筑的六套结构体系，重建为可拆解的三维教学模型。全部几何由代码程序化生成，不含任何下载素材，也不是施工数据。',
  },
  begin: { en: 'Begin', zh: '开始拆解' },
  models: { en: 'Models', zh: '模型' },
  controls: { en: 'Controls', zh: '操作' },
  help: { en: 'Help', zh: '说明' },
  close: { en: 'Close', zh: '关闭' },

  explode: { en: 'Explode', zh: '爆炸拆解' },
  explodeHint: { en: 'Pull components apart along their construction axes.', zh: '沿构造轴向把构件彼此拉开。' },
  about: { en: 'About this model', zh: '关于本模型' },
  period: { en: 'Period', zh: '年代' },
  region: { en: 'Region', zh: '地域' },
  assemble: { en: 'Assembly', zh: '分步组装' },
  assembleHint: { en: 'Step through how the parts go together.', zh: '一步一步看构件如何就位。' },
  play: { en: 'Play', zh: '播放' },
  pause: { en: 'Pause', zh: '暂停' },
  reset: { en: 'Reset', zh: '重置' },
  step: { en: 'Step', zh: '步' },
  section: { en: 'Section cut', zh: '剖切' },
  sectionHint: { en: 'Cut the model with a moving plane.', zh: '用移动的平面剖开模型。' },
  sectionAxis: { en: 'Cut direction', zh: '剖切方向' },
  sectionDepth: { en: 'Cut position', zh: '剖切位置' },
  layers: { en: 'Layers', zh: '层级开关' },
  layersHint: { en: 'Show or hide families of members.', zh: '按构件族显示或隐藏。' },
  forces: { en: 'Force paths', zh: '结构受力示意' },
  forcesHint: {
    en: 'Qualitative arrows only — this is not a structural calculation.',
    zh: '仅为定性示意，不构成任何结构计算。',
  },
  view: { en: 'View', zh: '视图' },
  resetView: { en: 'Reset camera', zh: '复位视角' },
  autoRotate: { en: 'Auto-rotate', zh: '自动旋转' },
  exportGlb: { en: 'Export GLB', zh: '导出 GLB' },
  exporting: { en: 'Exporting…', zh: '导出中…' },
  exported: { en: 'GLB downloaded', zh: 'GLB 已下载' },
  exportFailed: { en: 'Export failed', zh: '导出失败' },

  inspector: { en: 'Component', zh: '构件' },
  inspectorEmpty: {
    en: 'Click any member in the model to inspect it.',
    zh: '点击模型中的任意构件以查看说明。',
  },
  role: { en: 'Role', zh: '作用' },
  layer: { en: 'Layer', zh: '所属层级' },
  loadPath: { en: 'Load path', zh: '传力路径' },
  era: { en: 'Period', zh: '年代' },
  region: { en: 'Region', zh: '地域' },
  disclaimer: {
    en: 'Teaching diagram — not a construction or engineering model.',
    zh: '教学示意，非施工/工程模型。',
  },
  disclaimerLong: {
    en: 'Member proportions and joint details are schematic. Do not use them as construction documentation, and do not present them as a surveyed record.',
    zh: '构件比例与节点做法均为示意性表达。不得用作施工依据，也不得冒充实测测绘成果。',
  },
  forceArrowsNote: {
    en: 'Force arrows are a qualitative indication of load paths, not the result of a structural calculation.',
    zh: '受力箭头为传力路径的定性说明，非结构计算结果。',
  },
  scaleNoteLabel: { en: 'Scale note', zh: '比例说明' },
  labels: { en: 'Annotations', zh: '标注' },
  labelsHint: {
    en: 'Label the principal members directly in the model.',
    zh: '在模型中直接标出主要构件的名称。',
  },
  catalogRefs: { en: 'Historical reference', zh: '史实参照' },
  catalogRefsHint: {
    en: 'Structural statements follow the 17-architecture-research catalogue.',
    zh: '结构表述参照 17-architecture-research 史料目录条目。',
  },
  footerNote: {
    en: 'Procedural geometry, no external assets · 教学示意，非施工/工程模型',
    zh: '程序化生成几何，无外部素材 · 教学示意，非施工/工程模型',
  },

  fallbackTitle: {
    en: '3D view unavailable — showing schematic',
    zh: '当前浏览器无法运行 3D，已切换为示意图',
  },
  fallbackHint: {
    en: 'The schematic below is drawn from the same part geometry as the 3D model.',
    zh: '下方示意图由与 3D 模型相同的构件几何生成。',
  },

  langLabel: { en: '中文', zh: 'EN' },
  langToggle: { en: 'Switch to Chinese', zh: 'Switch to English' },

  noWebgl: { en: 'WebGL is not available in this browser.', zh: '当前浏览器不支持 WebGL。' },

  helpTitle: { en: 'How to use', zh: '使用说明' },
  helpBody: {
    en: 'Drag to orbit · Scroll to zoom · Right-drag to pan · Click a member to inspect it. The Explode slider pulls the assembly apart; Assembly plays it back step by step; Section cut slices the model; Layers hides families of members.',
    zh: '拖拽旋转 · 滚轮缩放 · 右键平移 · 点击构件查看说明。爆炸拆解滑杆可把装配体拉开；分步组装可逐步回放；剖切可切开模型；层级开关可隐藏某类构件。',
  },
};

let current = 'en';

/** URL 查询参数名：与 index.html 的 hreflang 备选链接（?lang=zh / ?lang=en）一致。 */
export const LANG_PARAM = 'lang';

/** 读取 URL 上的语言参数；非法或缺省返回 null。 */
function readUrlLang() {
  try {
    const p = new URLSearchParams(window.location.search).get(LANG_PARAM);
    return LANGS.includes(p) ? p : null;
  } catch {
    return null;
  }
}

/**
 * 把语言写回 URL 查询参数（保留 path 与 hash）。
 * 用 replaceState，不产生新的历史记录 —— 语言切换不是「导航」。
 */
function syncUrlLang(lang) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(LANG_PARAM, lang);
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch { /* 忽略不支持 history 的环境 */ }
}

/**
 * 切换语言。
 * @param {'en'|'zh'} lang
 * @param {{syncUrl?:boolean}} opts syncUrl 默认 true —— 用户主动切换时同步 URL；
 *        初始化时传 false，避免无谓地改写地址栏（hreflang 链接仍指向 ?lang= 参数）。
 */
export function setLang(lang, opts = {}) {
  current = LANGS.includes(lang) ? lang : 'en';
  document.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
  try { localStorage.setItem('timber-craft-lab.lang', current); } catch { /* 隐私模式忽略 */ }
  if (opts.syncUrl !== false) syncUrlLang(current);
  document.dispatchEvent(new CustomEvent('tcl:lang', { detail: current }));
  return current;
}

export function getLang() {
  return current;
}

/**
 * 初始化语言。优先级：URL 参数 > 本地偏好 > 英文默认。
 * URL 参数优先级最高，是 hreflang 备选链接（?lang=zh / ?lang=en）能真正生效的前提。
 */
export function initLang() {
  const urlLang = readUrlLang();
  if (urlLang) return setLang(urlLang, { syncUrl: false });
  let saved = null;
  try { saved = localStorage.getItem('timber-craft-lab.lang'); } catch { /* ignore */ }
  // 默认英文（中文可一键切换）；仅当用户此前主动选择过时沿用其偏好
  return setLang(LANGS.includes(saved) ? saved : 'en', { syncUrl: false });
}

/** 取当前语言的字符串；传 fallback 可取另一种语言。 */
export function t(key, fallback = null) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[current] ?? entry.en ?? key;
}

/** 取对象里的当前语言值（{zh, en}）。 */
export function tv(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[current] ?? obj.en ?? obj.zh ?? '';
}

/**
 * 取「当前语言 + 另一种语言」双语值。
 * 教学示意声明与受力定性说明属安全提示，两种语言须同屏出现，不随界面语言隐藏。
 * @returns {{main:string, sub:string, lang:string, altLang:string}}
 */
export function tb(key) {
  const e = STRINGS[key];
  const alt = current === 'zh' ? 'en' : 'zh';
  if (!e) return { main: key, sub: '', lang: current, altLang: alt };
  return {
    main: e[current] ?? e.en ?? key,
    sub: e[alt] ?? '',
    lang: current === 'zh' ? 'zh-CN' : 'en',
    altLang: alt === 'zh' ? 'zh-CN' : 'en',
  };
}
