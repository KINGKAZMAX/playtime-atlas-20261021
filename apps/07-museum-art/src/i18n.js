/**
 * 回响电玩馆 / PLAYTIME ATLAS — 中英文案
 *
 * 约定（16 §5 / RESTYLE-SPEC §3）：
 *   · 作品名与展品名保持既定原创中文版本，不翻译、不改名；
 *   · 界面外壳（导航、分区标题、按钮、说明、状态）提供 zh / en 两套 key；
 *   · 海报 / 封面 / 展柜 / 技术插画等**位图资产内的中文不可翻译**，
 *     英文界面下它们作为"展品原件"呈现（这也是博物馆语境下的正确做法）。
 *   · `<html lang>` 随语言切换；`hreflang` 由运行期注入（写死在 HTML 里会被 Vite
 *     当成资源解析，Pages 子路径下也会失配）。
 *
 * ── 两类翻译节点 ──────────────────────────────────────────────────
 *   `data-i18n="key"`      → 纯文本，用 `textContent` 覆盖。**节点必须不含元素子节点**，
 *                            否则会连同子元素一起抹掉（本轮真实踩过的坑）。
 *   `data-i18n-rich="key"` → 文案自带 `<code>` / `<strong>` 等内联标记，用 `innerHTML` 覆盖，
 *                            以保持内联强调与代码片段的语义和顺序。
 *   两类节点的文案都是本包静态自撰的本地字符串，不含任何用户输入。
 */

export const LANGS = ['zh', 'en'];

const zh = {
  'doc.title': '回响电玩馆 / PLAYTIME ATLAS — 原创美术与硬件模型包',
  'doc.description':
    '回响电玩馆（PLAYTIME ATLAS）原创美术资产包：48 枚原创图标、7 张年代海报、8 张封面、6 组展柜、6 件原创硬件 3D 模型，以及与全站统一设计系统对齐的令牌与自托管 OFL 字体。',

  'skip.main': '跳到主要内容',
  'nav.label': '主导航',
  'nav.tokens': '设计令牌',
  'nav.fonts': '字体',
  'nav.icons': '图标',
  'nav.posters': '海报',
  'nav.covers': '封面',
  'nav.cases': '展柜',
  'nav.models': '硬件模型',
  'nav.fallback': '降级',
  'lang.switch': 'EN',

  'hero.eyebrow': '原创美术与硬件模型包 · v1.1.0',
  'hero.imgAlt': '回响电玩馆展厅主视觉：一排暖光展柜在深墨蓝夜色中延伸',
  'hero.lede':
    '为电子游戏硬件年代馆准备的一整套原创视觉资产：字体全部自托管，图标全部手绘，海报与封面由生成式关键帧叠加精确排版层合成，六件跨时代硬件展品由参数化网格直接建模为 GLB。',
  'hero.cta1': '查看 3D 展品',
  'hero.cta2': '浏览年代海报',
  'hero.note':
    '本包只覆盖代表性成果，不宣称穷尽全部游戏或全部机型。所有展品为原创虚构展品，无任何品牌标识；年代分段为本馆原创策展划分，非官方分期。',

  'tokens.title': '统一设计令牌',
  'tokens.lede':
    '同一套令牌驱动网页、SVG 资产与 3D 材质。<code>design-tokens.json</code> 是唯一事实来源，CSS 与 JS 变体均由此生成。',
  'tokens.paletteTitle': '配色 · 余晖设计系统',
  'tokens.semanticTitle': '语义色',
  'tokens.exhibitTitle': '展品内嵌配色 · 非 UI 色板',
  'tokens.typeTitle': '字阶',
  'tokens.scaleTitle': '间距 / 圆角 / 阴影',
  'tokens.palette.light': '浅色主题',
  'tokens.palette.dark': '深色主题',
  'tokens.palette.canvas': '画布与 HUD',
  'tokens.palette.section': '分区色调',
  'tokens.semanticTitleHint': '语义色随主题自动切换，CSS 变量为 --ds-*，JS 取值见 design-tokens.json。',

  'fonts.title': '自托管许可字体',
  'fonts.lede':
    '全部字体采用 SIL Open Font License 1.1，下载后按实际用字子集化并存于 <code>/assets/fonts/</code>，运行期零外部字体请求。中文子集覆盖本包用字 {count} 个。',
  'fonts.role.grotesk': '展示体 · 年代标题、编号、数字',
  'fonts.role.inter': '正文 · 段落、说明、界面文案',
  'fonts.role.mono': '等宽 · 编号、年份、标签',
  'fonts.role.cjk': '中文 · 全部汉字（子集 {count} 字）',
  'fonts.meta.subset': '{size} KB 子集',
  'fonts.meta.local': '本地自托管',
  'fonts.meta.license': '许可',
  'fonts.aligned': '与 16-design-system 的字体清单逐字节一致',
  'fonts.cjkBadge': '中文字形子集',
  'fonts.cjkBadgeTail': '字 · 全部本地托管',

  'icons.title': '原创图标集',
  'icons.lede':
    '全部为手绘路径，24×24 网格、1.5 描边、圆端点、<code>currentColor</code> 可换色。点击任意图标复制其雪碧图引用。',
  'icons.filterLabel': '图标分类筛选',
  'icons.filter.all': '全部 {count}',

  'posters.title': '年代海报',
  'posters.lede':
    '七个年代，七张 1200×1800 海报。关键帧由生成式模型产出且<strong>不含任何文字</strong>，中文标题、编号、年代与正文全部由 SVG 精确排版层叠加，因此零乱码。',

  'covers.title': '封面',
  'covers.lede': '1600×900 横幅，供年代展厅头图、卡片封面与站点主视觉使用。',

  'cases.title': '展柜',
  'cases.lede': '每件展品配一套展柜：玻璃罩、暖光顶条、底座与哑光纸铭牌，柜内放置该展品的实机渲染图。',

  'models.title': '跨时代硬件展品',
  'models.lede':
    '六件<strong>原创虚构展品</strong>，由参数化网格直接建模为标准 GLB，可直接载入 three.js / 任意模型查看器。共享同一套馆内材质，形成一次收藏而非六次拼凑。',
  'models.tabsLabel': '展品选择',

  'fallback.title': '降级与离线',
  'fallback.lede':
    '主视觉缺失、模型不可用、WebGL 被禁用或网络中断时，馆内仍有可读可用的呈现。所有降级图形同样是本馆原创资产。',
  'fallback.strategyTitle': '降级策略',
  'fallback.item1': '<strong>模型 3D → 技术插画</strong>：每件展品都附带由真实网格正交投影生成的工程制图 SVG，即使完全没有 WebGL 也保留结构与规格信息。',
  'fallback.item2': '<strong>3D → 渲染图</strong>：GLB 加载失败时退到 1024×1024 静态渲染图。',
  'fallback.item3': '<strong>渲染图 → 占位图</strong>：连静态图也缺失时，退到本馆自绘的占位图形。',
  'fallback.item4': '<strong>字体</strong>：全部子集化本地托管，缺字时由系统字体回退，不阻塞布局。',
  'fallback.item5': '<strong>离线</strong>：站点无任何外部请求，断网后仍可完整浏览。',

  'footer.line': '原创美术与硬件模型包 · v1.1.0 · 2026-10-21',
  'footer.art': '美术与模型：CC0-1.0（本馆原创）',
  'footer.fonts': '字体：SIL Open Font License 1.1',
  'footer.third': '第三方素材：无',
  'footer.ds': '视觉规范：余晖设计系统（16-design-system）',

  'lightbox.label': '作品大图',
  'lightbox.close': '关闭',
  'lightbox.prev': '上一张',
  'lightbox.next': '下一张',

  'viewer.canvasLabel': '硬件模型 3D 查看器',
  'viewer.fallbackNote': '当前环境未启用 WebGL，已切换到技术插画降级图。',
  'viewer.spin': '自动旋转',
  'viewer.reset': '重置视角',
  'viewer.hint': '拖拽旋转 · 滚轮缩放',
  'viewer.linkGlb': '下载 GLB',
  'viewer.linkPng': '下载渲染图 PNG',
  'viewer.linkTech': '技术插画',
  'viewer.linkJson': '模型元数据',
  'viewer.spec.parts': '部件数',
  'viewer.spec.partsValue': '{n} 件',
  'viewer.spec.tris': '三角面',
  'viewer.spec.size': '尺寸',
  'viewer.spec.format': '格式',
  'viewer.spec.era': '年代',
  'viewer.cardMeta': '{parts} 部件 · {tris} 三角面 · {kb} KB',

  'stats.eras': '年代分段',
  'stats.covers': '封面',
  'stats.cases': '展柜',
  'stats.models': '3D 展品',
  'stats.icons': '原创图标',
  'stats.parts': '模型部件',

  'toast.copied': '已复制引用 {ref}',
  'toast.ref': '引用：{ref}',
  'toast.noWebgl': '未检测到 WebGL，已切换技术插画降级图',
};

const en = {
  'doc.title': 'PLAYTIME ATLAS — Original Art & Hardware Model Pack',
  'doc.description':
    'PLAYTIME ATLAS original art asset pack: 48 hand-drawn icons, 7 era posters, 8 covers, 6 display cases, 6 original hardware 3D models, plus tokens aligned to the site-wide design system and self-hosted OFL fonts.',

  'skip.main': 'Skip to main content',
  'nav.label': 'Main navigation',
  'nav.tokens': 'Tokens',
  'nav.fonts': 'Typefaces',
  'nav.icons': 'Icons',
  'nav.posters': 'Posters',
  'nav.covers': 'Covers',
  'nav.cases': 'Cases',
  'nav.models': 'Models',
  'nav.fallback': 'Fallback',
  'lang.switch': '中文',

  'hero.eyebrow': 'Original art & hardware model pack · v1.1.0',
  'hero.imgAlt':
    'PLAYTIME ATLAS hall key visual: a row of warmly lit display cases extending into a deep blue night',
  'hero.lede':
    'A complete original visual asset set for a museum of game-hardware eras: every typeface self-hosted, every icon hand-drawn, posters and covers composited from generative key frames under a precise typographic layer, and six cross-era hardware exhibits modelled directly to GLB from parametric meshes.',
  'hero.cta1': 'View 3D exhibits',
  'hero.cta2': 'Browse era posters',
  'hero.note':
    'This pack covers representative work only; it makes no claim to exhaust every game or every machine. All exhibits are original fictional pieces with no brand marks, and the era divisions are the museum’s own curatorial segmentation, not an official periodisation.',

  'tokens.title': 'Unified design tokens',
  'tokens.lede':
    'One token set drives the page, the SVG assets and the 3D materials. <code>design-tokens.json</code> is the single source of truth; both the CSS and the JS variants are generated from it.',
  'tokens.paletteTitle': 'Palette · Afterglow Design System',
  'tokens.semanticTitle': 'Semantic colours',
  'tokens.exhibitTitle': 'Exhibit-baked palette · not a UI palette',
  'tokens.typeTitle': 'Type scale',
  'tokens.scaleTitle': 'Space / radius / shadow',
  'tokens.palette.light': 'Light theme',
  'tokens.palette.dark': 'Dark theme',
  'tokens.palette.canvas': 'Canvas & HUD',
  'tokens.palette.section': 'Section tones',
  'tokens.semanticTitleHint':
    'Semantic colours follow the theme automatically. The CSS variables are --ds-*; JS values live in design-tokens.json.',

  'fonts.title': 'Self-hosted licensed typefaces',
  'fonts.lede':
    'All typefaces are SIL Open Font License 1.1, downloaded, subset to the characters actually used and stored in <code>/assets/fonts/</code> with zero external font requests at runtime. The Chinese subset covers {count} characters used by this pack.',
  'fonts.role.grotesk': 'Display · era titles, numbering, figures',
  'fonts.role.inter': 'Text · body copy, notes, interface copy',
  'fonts.role.mono': 'Mono · indices, years, labels',
  'fonts.role.cjk': 'Chinese · all Han characters ({count}-character subset)',
  'fonts.meta.subset': '{size} KB subset',
  'fonts.meta.local': 'Self-hosted',
  'fonts.meta.license': 'Licence',
  'fonts.aligned': 'Byte-identical to the 16-design-system font manifest',
  'fonts.cjkBadge': 'Chinese glyph subset',
  'fonts.cjkBadgeTail': 'characters · fully self-hosted',

  'icons.title': 'Original icon set',
  'icons.lede':
    'Every glyph is a hand-drawn path on a 24×24 grid with a 1.5 stroke and round caps, tinted with <code>currentColor</code>. Click any icon to copy its sprite reference.',
  'icons.filterLabel': 'Icon category filter',
  'icons.filter.all': 'All {count}',

  'posters.title': 'Era posters',
  'posters.lede':
    'Seven eras, seven 1200×1800 posters. The generative key frames contain <strong>no text at all</strong>; every Chinese title, index, year and paragraph is overlaid by a precise SVG typographic layer, so the output is free of garbled glyphs.',

  'covers.title': 'Covers',
  'covers.lede': '1600×900 banners for era headers, card covers and the site key visual.',

  'cases.title': 'Display cases',
  'cases.lede':
    'Each exhibit ships with a case: glass hood, warm light bar, plinth and a matte paper label, with the real render of that exhibit placed inside.',

  'models.title': 'Cross-era hardware exhibits',
  'models.lede':
    'Six <strong>original fictional exhibits</strong>, modelled directly from parametric meshes to standard GLB so they can be loaded straight into three.js or any model viewer. They share one set of house materials, so the set reads as a collection rather than six unrelated pieces.',
  'models.tabsLabel': 'Exhibit selection',

  'fallback.title': 'Fallbacks and offline',
  'fallback.lede':
    'When a key visual is missing, a model cannot load, WebGL is disabled or the network drops, the hall still stays readable and usable. Every fallback graphic is original to this museum as well.',
  'fallback.strategyTitle': 'Fallback strategy',
  'fallback.item1': '<strong>Model 3D → technical illustration</strong>: every exhibit ships an orthographic-projected engineering drawing generated from its real mesh, so structure and specification survive even with no WebGL at all.',
  'fallback.item2': '<strong>3D → render</strong>: when the GLB fails to load, the 1024×1024 static render takes over.',
  'fallback.item3': '<strong>Render → placeholder</strong>: if even the static image is missing, the museum’s own drawn placeholder is used.',
  'fallback.item4': '<strong>Type</strong>: everything is subset and hosted locally; missing glyphs fall back to system fonts without breaking layout.',
  'fallback.item5': '<strong>Offline</strong>: the site makes no external requests and remains fully browsable offline.',

  'footer.line': 'Original art & hardware model pack · v1.1.0 · 2026-10-21',
  'footer.art': 'Art & models: CC0-1.0 (original to this museum)',
  'footer.fonts': 'Typefaces: SIL Open Font License 1.1',
  'footer.third': 'Third-party assets: none',
  'footer.ds': 'Visual spec: Afterglow Design System (16-design-system)',

  'lightbox.label': 'Full-size artwork',
  'lightbox.close': 'Close',
  'lightbox.prev': 'Previous',
  'lightbox.next': 'Next',

  'viewer.canvasLabel': 'Hardware model 3D viewer',
  'viewer.fallbackNote': 'WebGL is unavailable here, so the technical illustration is shown instead.',
  'viewer.spin': 'Auto-rotate',
  'viewer.reset': 'Reset view',
  'viewer.hint': 'Drag to rotate · scroll to zoom',
  'viewer.linkGlb': 'Download GLB',
  'viewer.linkPng': 'Download render PNG',
  'viewer.linkTech': 'Technical illustration',
  'viewer.linkJson': 'Model metadata',
  'viewer.spec.parts': 'Parts',
  'viewer.spec.partsValue': '{n}',
  'viewer.spec.tris': 'Triangles',
  'viewer.spec.size': 'Dimensions',
  'viewer.spec.format': 'Format',
  'viewer.spec.era': 'Era',
  'viewer.cardMeta': '{parts} parts · {tris} tris · {kb} KB',

  'stats.eras': 'Eras',
  'stats.covers': 'Covers',
  'stats.cases': 'Cases',
  'stats.models': '3D exhibits',
  'stats.icons': 'Original icons',
  'stats.parts': 'Model parts',

  'toast.copied': 'Copied reference {ref}',
  'toast.ref': 'Reference: {ref}',
  'toast.noWebgl': 'WebGL not detected, switched to the technical illustration',
};

export const DICT = { zh, en };

const STORAGE_KEY = 'atlas-lang';

/** 从 URL 读取 ?lang=zh|en（用于 hreflang 直达与分享） */
function langFromQuery() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    return q && LANGS.includes(q) ? q : null;
  } catch {
    return null;
  }
}

/** 当前语言（优先级：URL ?lang= → localStorage → zh） */
export function getLang() {
  const fromUrl = langFromQuery();
  if (fromUrl) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.includes(saved)) return saved;
  } catch { /* 隐私模式等场景，忽略 */ }
  return 'zh';
}

export function setLang(lang) {
  const l = LANGS.includes(lang) ? lang : 'zh';
  try { localStorage.setItem(STORAGE_KEY, l); } catch { /* 忽略 */ }
  return l;
}

/**
 * 注入 hreflang 备用链接。
 * 用运行时生成而不是写死在 HTML 里：Vite 会把 HTML 中的相对 href 当作资源去解析，
 * 而部署路径（Pages 子路径）由 BASE_URL 决定，写死会失配。
 */
function applyAlternateLinks() {
  const url = new URL(window.location.href);
  for (const l of LANGS) {
    const href = new URL(url.toString());
    href.searchParams.set('lang', l);
    let link = document.querySelector(`link[rel="alternate"][hreflang="${l === 'en' ? 'en' : 'zh-CN'}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = 'alternate';
      document.head.appendChild(link);
    }
    link.setAttribute('hreflang', l === 'en' ? 'en' : 'zh-CN');
    link.setAttribute('href', href.toString());
  }
}

/** 全局插值变量（如字体子集字数），由 main.js 在渲染前登记 */
const VARS = Object.create(null);

/** 取文案；支持 {name} 占位符插值（内置变量 + 调用方变量，后者优先） */
export function t(key, vars) {
  const l = getLang();
  const table = DICT[l] || DICT.zh;
  let s = table[key] ?? DICT.zh[key] ?? key;
  const all = { ...VARS, ...(vars || {}) };
  for (const [k, v] of Object.entries(all)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function setVar(name, value) {
  VARS[name] = value;
}

/** 把页面里带 data-i18n / data-i18n-rich 的节点全部替换为当前语言 */
export function applyI18n(root = document) {
  const l = getLang();
  document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN';

  /* ① 纯文本节点：必须不含元素子节点，否则跳过而不是抹掉内容 */
  for (const node of root.querySelectorAll('[data-i18n]')) {
    const key = node.getAttribute('data-i18n');
    const text = t(key);
    if (!text) continue;
    if (node.children.length > 0) {
      console.warn('[i18n] data-i18n 节点含元素子节点，已跳过（请改用 data-i18n-rich）：', key);
      continue;
    }
    node.textContent = text;
  }

  /* ② 富文本节点：文案自带内联标记，整体替换以保持顺序 */
  for (const node of root.querySelectorAll('[data-i18n-rich]')) {
    const key = node.getAttribute('data-i18n-rich');
    const text = t(key);
    if (!text) continue;
    node.innerHTML = text;
  }

  for (const node of root.querySelectorAll('[data-i18n-attr]')) {
    const spec = node.getAttribute('data-i18n-attr');
    for (const part of spec.split(',')) {
      const [attr, key] = part.split(':').map((x) => x.trim());
      if (!attr || !key) continue;
      const val = t(key);
      if (val) node.setAttribute(attr, val);
    }
  }
  /* 文档级元信息 */
  const title = t('doc.title');
  if (title) document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  const descText = t('doc.description');
  if (desc && descText) desc.setAttribute('content', descText);

  applyAlternateLinks();
}

export default { LANGS, DICT, t, setVar, getLang, setLang, applyI18n };
