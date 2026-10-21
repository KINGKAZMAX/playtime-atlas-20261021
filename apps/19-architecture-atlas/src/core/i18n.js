/**
 * Bilingual string table.
 * English is the default; Chinese is fully parallel (no key exists in one
 * language only). Pinyin for Chinese proper nouns lives in the data files.
 */

import { getLang as storeLang, setLang, subscribe } from './store.js';

const S = {
  'site.title':        ['构筑华夏', 'Built in China'],
  'site.subtitle':     ['结构与故事', 'Structures & Stories'],
  'site.tagline':      ['一座建筑如何被造起来——从屋檐的曲线到地面的石桥，逐层拆开看。',
                        'How a building gets made — from the curve of an eave to the stone of a bridge, taken apart layer by layer.'],
  'site.desc':         ['面向全球读者的中国传统建筑双语科普站：区域探索地图、年代轴、{n} 例代表性建筑、{labs} 个可拆解的三维结构实验室、{terms} 条双语术语与测验。',
                        'A bilingual atlas of traditional Chinese architecture for a global audience: a region map, an era timeline, {n} representative buildings, {labs} explorable 3D structural labs, {terms} glossary terms and a quiz.'],
  'site.skip':         ['跳到主要内容', 'Skip to main content'],

  'nav.atlas':         ['区域探索', 'Atlas'],
  'nav.timeline':      ['年代轴', 'Timeline'],
  'nav.catalog':       ['建筑目录', 'Catalog'],
  'nav.labs':          ['结构实验室', 'Labs'],
  'nav.glossary':      ['术语表', 'Glossary'],
  'nav.quiz':          ['测验', 'Quiz'],
  'nav.saved':         ['收藏', 'Saved'],
  'nav.sources':       ['来源与许可', 'Sources'],

  'hero.eyebrow':      ['样本目录 · 非穷尽名录', 'A sample catalog — not an exhaustive list'],
  'hero.lede':         ['这里的每一个条目都注明来源、结构原理与示意边界。剖面与受力箭头是教学示意，不是施工图，也不是工程计算。',
                        'Every entry states its sources, its structural principle, and the limits of the illustration. Sections and force arrows are teaching diagrams — not construction drawings, not engineering calculations.'],
  'hero.cta1':         ['从地图开始', 'Start with the map'],
  'hero.cta2':         ['直接拆一个结构', 'Take a structure apart'],
  'hero.stat.cases':   ['建筑案例', 'Buildings'],
  'hero.stat.types':   ['构造类别', 'Structural systems'],
  'hero.stat.terms':   ['术语条目', 'Glossary terms'],
  'hero.stat.labs':    ['三维实验室', '3D labs'],
  'hero.stat.sources': ['已核验来源', 'Verified sources'],
  'hero.scroll':       ['向下滚动', 'Scroll'],

  'atlas.eyebrow':     ['中国区域探索地图', 'Region map of China'],
  'atlas.title':       ['从一个地方开始', 'Start from a place'],
  'atlas.titleEn':     ['REGION ATLAS', 'REGION ATLAS'],
  'atlas.lede':        ['八个地域分区，标注每座建筑的所在位置。点击地图上的热点，或使用下方列表筛选目录。',
                        'Eight regions, with each building placed on the map. Tap a hotspot, or use the list below to filter the catalog.'],
  'atlas.legend':      ['图例', 'Legend'],
  'atlas.legend.hot':  ['建筑热点（数字为该地域条目数）', 'Building hotspot (number = entries in that region)'],
  'atlas.legend.map':  ['地域轮廓为示意性分区，不按比例绘制', 'Region outlines are schematic, not to scale'],
  'atlas.allRegions':  ['全部地域', 'All regions'],
  'atlas.hotspot':     ['位于{name}的{count}座建筑', '{count} buildings in {name}'],

  'timeline.eyebrow':  ['年代轴', 'Era timeline'],
  'timeline.title':    ['结构如何随时代改变', 'How the structure changed over time'],
  'timeline.titleEn':  ['ERA TIMELINE', 'ERA TIMELINE'],
  'timeline.lede':     ['横向拖动查看各时代。选定时代后，地图与目录会同步筛选。',
                        'Scroll sideways through the eras. Selecting one filters the map and the catalog in step.'],
  'timeline.entries':  ['{n} 条', '{n} entries'],

  'catalog.eyebrow':   ['建筑目录', 'The catalog'],
  'catalog.title':     ['代表性建筑', 'Representative buildings'],
  'catalog.titleEn':   ['CATALOG', 'CATALOG'],
  'catalog.lede':      ['{n} 个案例，覆盖 {regions} 大地域、{eras} 个时代与 {systems} 类构造。每条都附来源与年代说明。',
                        '{n} entries across {regions} regions, {eras} eras and {systems} structural systems. Every one carries sources and a note on dating.'],
  'catalog.filter.type': ['类型', 'Type'],
  'catalog.filter.all':  ['全部', 'All'],
  'catalog.filter.region':['地域', 'Region'],
  'catalog.filter.era':  ['时代', 'Era'],
  'catalog.search':    ['搜索名称、地名…', 'Search name, place…'],
  'catalog.result':    ['显示 {n} / {total} 条', 'Showing {n} of {total}'],
  'catalog.empty':     ['没有匹配的条目', 'No matching entries'],
  'catalog.empty.hint':['试着放宽筛选条件，或清空搜索词。', 'Try relaxing a filter, or clear the search box.'],
  'catalog.reset':     ['重置筛选', 'Reset filters'],
  'catalog.fav':       ['收藏', 'Save'],
  'catalog.faved':     ['已收藏', 'Saved'],
  'catalog.open':      ['查看详情', 'View details'],
  'catalog.sampled':   ['这是一个代表性样本，不是全部中国古建筑的完整名录。',
                        'This is a representative sample, not a complete list of Chinese historic buildings.'],
  'catalog.caseCount': ['条案例', 'entries'],

  'case.back':         ['返回目录', 'Back to catalog'],
  'case.next':         ['下一条', 'Next'],
  'case.prev':         ['上一条', 'Previous'],
  'case.principle':    ['结构原理', 'Structural principle'],
  'case.culture':      ['文化背景', 'Cultural context'],
  'case.specs':        ['基本信息', 'Key facts'],
  'case.sources':      ['来源', 'Sources'],
  'case.related':      ['相关实验室', 'Related labs'],
  'case.relatedNote':  ['在结构实验室里亲手拆开看。', 'Take it apart yourself in the structural lab.'],
  'case.glossary':     ['相关术语', 'Related terms'],
  'case.diagram':      ['示意线稿，非测绘图', 'Schematic line drawing — not a measured survey'],
  'case.caveatTitle':  ['示意边界', 'Limits of this illustration'],
  'case.share':        ['复制深链接', 'Copy deep link'],
  'case.copied':       ['链接已复制', 'Link copied'],
  'case.region':       ['地域', 'Region'],
  'case.province':     ['省份', 'Province'],
  'case.locality':     ['地点', 'Locality'],
  'case.era':          ['时代', 'Era'],
  'case.year':         ['年代', 'Date'],
  'case.type':         ['类型', 'Type'],
  'case.structure':    ['构造类别', 'Structural system'],
  'case.ethnicity':    ['民族', 'Ethnic group'],
  'case.unverified':   ['年代有多种说法', 'Dating is disputed'],
  'case.source.primary':['一次来源', 'Primary source'],

  'labs.eyebrow':      ['结构实验室', 'Structural labs'],
  'labs.title':        ['亲手拆开看', 'Take them apart'],
  'labs.titleEn':      ['STRUCTURAL LABS', 'STRUCTURAL LABS'],
  'labs.lede':         ['六个可旋转、缩放、选中、爆炸、组装、剖切的三维模型。几何全部由代码程序化生成，是教学示意，不是施工模型。',
                        'Six models you can orbit, zoom, select, explode, assemble and section. All geometry is generated in code — teaching schematics, not construction models.'],
  'labs.open':         ['进入实验室', 'Enter lab'],
  'labs.parts':        ['构件', 'Parts'],
  'labs.steps':        ['组装步骤', 'Assembly steps'],
  'labs.explode':      ['爆炸拆解', 'Explode'],
  'labs.section':      ['剖切', 'Section'],
  'labs.layers':       ['显示层级', 'Layers'],
  'labs.forces':       ['受力示意', 'Force diagram'],
  'labs.reset':        ['重置视图', 'Reset view'],
  'labs.play':         ['播放组装', 'Play assembly'],
  'labs.pause':        ['暂停', 'Pause'],
  'labs.prevStep':     ['上一步', 'Previous step'],
  'labs.nextStep':     ['下一步', 'Next step'],
  'labs.step':         ['第 {i} / {n} 步', 'Step {i} of {n}'],
  'labs.selectPart':   ['点击模型中的构件查看说明，或从下方列表选择。',
                        'Click a part in the model, or pick one from the list.'],
  'labs.pick':         ['选择一个构件', 'Select a part'],
  'labs.fallback':     ['此浏览器不支持 WebGL，已切换到 2D 示意剖面。',
                        'WebGL is unavailable in this browser — showing the 2D schematic section instead.'],
  'labs.loading':      ['正在载入三维模型…', 'Loading the 3D model…'],
  'labs.teaching':     ['教学示意，非施工/工程模型；受力箭头为定性说明，非工程计算。',
                        'Teaching schematic, not a construction or engineering model. Force arrows are qualitative, not calculated.'],
  'labs.legend':       ['图例', 'Legend'],
  'labs.layer.all':    ['全部', 'All'],
  'labs.orientation':  ['拖动旋转 · 滚轮缩放 · 双击复位', 'Drag to orbit · scroll to zoom · double-click to reset'],
  'labs.gltf':         ['导出 GLB', 'Export GLB'],
  'labs.gltfDone':     ['GLB 已导出', 'GLB exported'],
  'labs.selectFirst':  ['点击任意构件开始。', 'Click any component to begin.'],
  'labs.noForce':      ['该构件本身不单独承载主要荷载。', 'This component does not carry primary load on its own.'],
  'labs.forceTitle':   ['受力说明（定性）', 'Load path (qualitative)'],

  'glossary.eyebrow':   ['双语术语表', 'Bilingual glossary'],
  'glossary.title':     ['读懂建筑的词汇', 'The vocabulary of Chinese building'],
  'glossary.titleEn':   ['GLOSSARY', 'GLOSSARY'],
  'glossary.lede':      ['每条术语给出中文、拼音与英文，并用一句白话解释它在结构里做什么。',
                        'Each entry gives the Chinese term, its pinyin, the English equivalent, and one plain sentence on what the part does.'],
  'glossary.search':    ['搜索术语…', 'Search terms…'],
  'glossary.count':     ['{n} 条术语', '{n} terms'],
  'glossary.pinyin':    ['拼音', 'Pinyin'],
  'glossary.cat':       ['类别', 'Category'],
  'glossary.misuse':    ['常见误用', 'Common confusion'],

  'quiz.eyebrow':       ['小测验', 'Quick quiz'],
  'quiz.title':         ['检验一下', 'Test yourself'],
  'quiz.titleEn':       ['QUIZ', 'QUIZ'],
  'quiz.lede':          ['十道题，覆盖构造、地域与年代。答完给分，可以重来。',
                        'Ten questions on structure, region and dating. You get a score at the end and can run it again.'],
  'quiz.start':         ['开始测验', 'Start the quiz'],
  'quiz.next':          ['下一题', 'Next question'],
  'quiz.finish':        ['查看结果', 'See results'],
  'quiz.retry':         ['再试一次', 'Try again'],
  'quiz.correct':       ['答对了', 'Correct'],
  'quiz.incorrect':     ['不对', 'Not quite'],
  'quiz.score':         ['你的得分', 'Your score'],
  'quiz.scoreNote':     ['满分 {n}', 'out of {n}'],
  'quiz.best':          ['最佳成绩', 'Best score'],
  'quiz.answer':        ['正确答案：{a}', 'Correct answer: {a}'],
  'quiz.explain':       ['解释', 'Why'],

  'saved.eyebrow':      ['我的收藏', 'My saved list'],
  'saved.title':        ['收藏夹', 'Saved'],
  'saved.titleEn':      ['SAVED', 'SAVED'],
  'saved.lede':         ['收藏保存在本机浏览器里，不上传任何服务器。',
                        'Saved entries live in this browser only. Nothing is uploaded.'],
  'saved.empty':        ['还没有收藏', 'Nothing saved yet'],
  'saved.empty.hint':   ['在目录里点右上角的心形图标即可收藏。',
                        'Tap the heart icon on any catalog card.'],
  'saved.clear':        ['清空收藏', 'Clear all'],
  'saved.count':        ['{n} 条收藏', '{n} saved'],
  'saved.confirmClear': ['确认清空全部收藏？', 'Clear every saved entry?'],

  'sources.eyebrow':    ['来源与许可', 'Sources & licensing'],
  'sources.title':      ['这个站点从哪里来', 'Where this comes from'],
  'sources.titleEn':    ['SOURCES & LICENSING', 'SOURCES & LICENSING'],
  'sources.lede':       ['本项目的每条事实都指向一个可核验的公开出处；没有出处的说法不写。参考站点只用于观察交互机制，不复制其资产。',
                        'Every factual claim points at a verifiable public source. Claims without a source are not made. The reference site informed interaction mechanics only — no assets were copied.'],
  'sources.kind.primary': ['一次来源', 'Primary'],
  'sources.kind.reference':['参考', 'Reference'],
  'sources.kind.legal':  ['许可', 'Licence'],
  'sources.kind.own':    ['自研', 'Original'],
  'sources.accessed':    ['访问于', 'Accessed'],
  'sources.disclaimer':  ['声明边界', 'Stated limits'],
  'sources.limits':     [
    [
      '本目录为代表性样本，覆盖八大地域、十个时代、十六类构造，不声称穷尽全部中国古建筑。年代以「始建/重修/现存」多口径记录，存在多处争议，已逐条标注。',
      '剖面图、受力箭头与三维模型均为程序化生成的教学示意，用于说明构造逻辑与荷载路径，不代表真实比例，也不构成施工或工程依据。',
      '参考站仅用于观察可观察的交互机制（分区调性反转、索引栏、可动画圆角等）。未复制其任何图片、字体文件、Logo、文案或代码；本项目不声称原创参考作品。',
      '三维几何由代码在运行时生成，未使用任何第三方模型文件；因此不存在把未授权模型当作自制的情况。',
    ],
    [
      'This catalog is a representative sample covering eight regions, ten eras and sixteen structural systems; it does not claim to be exhaustive. Dating is recorded in several ways — founding, restoration, surviving fabric — and several entries are disputed, which is noted case by case.',
      'Sections, force arrows and 3D models are code-generated teaching schematics. They explain structural logic and load paths; they are not to scale and are not a basis for construction or engineering.',
      'The reference site informed interaction mechanics only (section tone inversion, index rails, animatable corner radii). No image, font file, logo, wording or code was copied, and this project does not claim the reference work as its own.',
      'All 3D geometry is generated at runtime in code. No third-party model files are used, so no unlicensed model is passed off as original work.',
    ],
  ],

  'footer.built':       ['构筑华夏 · 结构与故事', 'Built in China · Structures & Stories'],
  'footer.note':        ['本作品为独立原创项目，仅作科普与教学用途。建筑信息以公开资料为基础，示意内容不替代专业测绘或工程意见。',
                        'An independent original project for education and teaching. Building facts are based on public sources; the diagrams do not replace measured survey or professional engineering advice.'],
  'footer.task':        ['任务 19 · 19-architecture-atlas', 'Task 19 · 19-architecture-atlas'],
  'footer.licence':     ['代码 MIT · 资产全部程序化生成', 'Code MIT · all assets generated in code'],

  'common.loading':     ['载入中…', 'Loading…'],
  'common.error':       ['出错了', 'Something went wrong'],
  'common.close':       ['关闭', 'Close'],
  'common.back':        ['返回', 'Back'],
  'common.more':        ['更多', 'More'],
  'common.year':        ['年', 'yr'],
  'common.since':       ['建于', 'built'],
  'common.restored':    ['重修', 'restored'],
  'common.present':     ['现存', 'extant'],
  'common.language':    ['语言', 'Language'],
  'common.switchTo':    ['切换为中文', 'Switch to Chinese'],
  'common.switchToEn':  ['切换为英文', 'Switch to English'],

  // ---- shared section furniture ---------------------------------------
  'section.about':      ['关于本站', 'About'],
  'section.aboutNote':  ['一个可离线阅读、无追踪、无第三方请求的双语科普站。所有事实都指向可核验的公开出处。',
                          'A bilingual, offline-capable, tracker-free explainer with no third-party requests. Every fact points at a verifiable public source.'],
  'section.explore':    ['开始探索', 'Start exploring'],
  'section.related':    ['延伸阅读', 'Related'],
  'section.all':        ['全部', 'All'],
  'section.skip':       ['跳到', 'Skip to'],

  // ---- labs -----------------------------------------------------------
  'labs.intro':         ['这是什么', 'What this is'],
  'labs.facts':         ['要点', 'Key points'],
  'labs.partList':      ['构件清单', 'Component list'],
  'labs.backToLabs':    ['返回实验室列表', 'Back to all labs'],
  'labs.layerLabel':    ['显示哪些层', 'Visible layers'],
  'labs.sectionLabel':  ['剖切位置', 'Section position'],
  'labs.explodeLabel':  ['拆解程度', 'Explode amount'],
  'labs.stepsOf':       ['共 {n} 步组装', '{n} assembly steps'],
  'labs.partsOf':       ['共 {n} 个构件', '{n} components'],
  'labs.selectPartHint':['选择构件', 'Selected component'],
  'labs.fallbackTitle': ['二维示意剖面', '2D schematic section'],
  'labs.fallbackNote':  ['此模型的三维视图不可用，以下为同一构件体系的二维示意，构件与层级完全一致。',
                          'The 3D view is unavailable here. This 2D schematic shows the same component system, with identical parts and layers.'],
  'labs.reducedNote':   ['检测到「减少动态效果」偏好，动画已停用，交互仍可使用。',
                          'A reduced-motion preference was detected, so animation is off; every control still works.'],
  'labs.webglMissing':  ['无法启动 WebGL 渲染器', 'The WebGL renderer could not start'],

  // ---- glossary --------------------------------------------------------
  'glossary.relatedCases': ['相关案例', 'Related cases'],
  'glossary.empty':      ['没有匹配的术语', 'No matching terms'],
  'glossary.emptyHint':  ['换个关键词试试，或按类别浏览。', 'Try another keyword, or browse by category.'],
  'glossary.plainer':    ['说人话', 'In plain words'],
  'glossary.allCats':    ['全部类别', 'All categories'],
  'glossary.jumpTo':     ['跳到该术语', 'Jump to this term'],
  'glossary.countShow':  ['显示 {n} / {total} 条', 'Showing {n} of {total}'],

  // ---- quiz ------------------------------------------------------------
  'quiz.questionOf':    ['第 {i} / {n} 题', 'Question {i} of {n}'],
  'quiz.pickOne':       ['选择一个答案', 'Pick one answer'],
  'quiz.resultTitle':   ['测验结果', 'Result'],
  'quiz.resultNote':    ['答对 {c} 题，共 {n} 题。', 'You got {c} of {n} right.'],
  'quiz.answerOf':      ['正确答案：{a}', 'Correct answer: {a}'],
  'quiz.answered':      ['已答 {n} 题', '{n} answered'],
  'quiz.backToStart':   ['回到开头', 'Back to the start'],

  // ---- saved -----------------------------------------------------------
  'saved.remove':       ['取消收藏', 'Remove'],
  'saved.openCase':     ['打开案例', 'Open case'],
  'saved.clearAll':     ['清空全部收藏', 'Clear every entry'],

  // ---- sources ---------------------------------------------------------
  'sources.byCase':      ['案例来源', 'Case sources'],
  'sources.byGlossary':  ['术语来源', 'Terminology sources'],
  'sources.refTitle':    ['参考与取证', 'Reference & evidence'],
  'sources.refNote':     ['下列站点仅用于观察交互机制与核对事实。未复制其任何图片、字体文件、Logo、文案或代码。',
                           'The sites below informed interaction mechanics and fact-checking only. No image, font file, logo, wording or code was copied.'],
  'sources.techTitle':   ['技术说明', 'Technical notes'],
  'sources.techList':    [
    [
      '纯静态站点：HTML + CSS + 原生 ES 模块，Vite 仅用于开发与打包。',
      '零 CDN、零外网字体、零外部 API、零追踪；页面不发起任何跨域请求。',
      '三维几何全部由代码在运行时程序化生成，不含任何第三方模型文件。',
      '三维运行时（three.js）按需动态载入并单独分包，首屏不加载。',
      '首屏与所有配图均为程序化生成的 SVG 线稿。',
      '收藏与语言偏好只存在本机 localStorage（键名 built-in-china:v1），不上传。',
      '路由使用 hash，可直接部署在任意子路径而不需要服务端重写。',
    ],
    [
      'A purely static site: HTML + CSS + native ES modules. Vite is used only for development and bundling.',
      'Zero CDNs, zero web fonts, zero external APIs, zero tracking; the page makes no cross-origin request.',
      'All 3D geometry is generated procedurally in code at runtime. No third-party model files are included.',
      'The 3D runtime (three.js) is dynamically imported and split into its own chunk, so it never loads on the first screen.',
      'The first screen and every illustration are procedurally generated SVG line drawings.',
      'Saved entries and language preference live only in localStorage (key built-in-china:v1) and are never uploaded.',
      'Routing uses the hash, so the site deploys under any sub-path with no server rewrite.',
    ],
  ],
  'sources.licTitle':    ['许可', 'Licence'],
  'sources.licList':     [
    [
      '本站代码以 MIT 许可发布。',
      '本站所有插图、示意图与三维模型均由本项目代码程序化生成，版权归本项目所有。',
      '本站不含任何第三方摄影作品、字体文件或模型文件。',
      '文中引用的官方网页仅作为事实出处链接，其内容与版权归各发布机构所有。',
    ],
    [
      'The site code is released under the MIT licence.',
      'Every illustration, diagram and 3D model is generated procedurally by this project\'s own code and is copyright of this project.',
      'The site contains no third-party photography, font files or model files.',
      'Official web pages are linked as factual references; their content and copyright remain with their publishers.',
    ],
  ],
  'sources.limitsTitle': ['声明边界', 'Stated limits'],
};

let current = 'en';

/**
 * The raw table, exported so tooling (scripts/validate.mjs) can check that
 * every key is a complete [zh, en] pair and that every key the UI asks for
 * actually exists.
 */
export const I18N_TABLE = S;

export function t(key, vars = {}) {
  const row = S[key];
  if (!row) return key;
  // Every row is a [zh, en] pair: index 0 is Chinese, index 1 is English.
  let str = row[current === 'zh' ? 0 : 1];
  if (vars && Object.keys(vars).length) {
    str = str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] !== undefined ? String(vars[name]) : m));
  }
  return str;
}

/** Localised pick from a `{ zh, en }` pair. */
export function pick(pair) {
  if (!pair) return '';
  if (typeof pair === 'string') return pair;
  return current === 'zh' ? (pair.zh ?? pair.en ?? '') : (pair.en ?? pair.zh ?? '');
}

/**
 * The display name of a bilingual record, in the current language.
 *
 * Accepts both naming conventions used in this project:
 *   · `{ nameZh, nameEn }` — taxonomy entries, labs, cases
 *   · `{ zh, en }`         — model parts, steps, force arrows
 */
export function localName(entry) {
  if (!entry) return '';
  if (typeof entry === 'string') return entry;
  const zh = entry.nameZh ?? entry.zh ?? '';
  const en = entry.nameEn ?? entry.en ?? '';
  return current === 'zh' ? (zh || en) : (en || zh);
}

/**
 * The other language of a bilingual record — used for the secondary line
 * underneath the primary one, so both are always readable.
 */
export function otherName(entry) {
  if (!entry || typeof entry === 'string') return '';
  const zh = entry.nameZh ?? entry.zh ?? '';
  const en = entry.nameEn ?? entry.en ?? '';
  return current === 'zh' ? (en || '') : (zh || '');
}

export function getLang() {
  return current;
}

/**
 * `setLanguage(lang, { persist })`
 *
 * `persist: true` (default) also writes the choice to localStorage, so the
 * visitor's own switch is remembered across visits.
 *
 * `persist: false` applies the language for this page load only. That is what
 * a `?lang=` deep link does: the link decides the language of the page it
 * opens, but it must not silently overwrite the visitor's saved default.
 */
export function setLanguage(lang, { persist = true } = {}) {
  current = lang === 'zh' ? 'zh' : 'en';
  if (persist) setLang(current);
  document.documentElement.lang = current === 'zh' ? 'zh-Hans' : 'en';
  document.documentElement.dataset.lang = current;
  for (const fn of langListeners) fn(current);
}

/* --------------------------------------------------------- deep links ---
 * The language is part of the link, not only of the browser state, so a
 * shared URL opens in the language it was shared in.
 */

/** The `?lang=` value in the current query string, or null. */
export function readLangParam() {
  const v = new URLSearchParams(location.search).get('lang');
  return v === 'zh' || v === 'en' ? v : null;
}

/**
 * Apply `?lang=` if present. Returns the applied language, or null.
 * Never persists: the stored preference stays the default for later visits.
 */
export function applyLangFromUrl() {
  const param = readLangParam();
  if (!param) return null;
  if (param !== current) setLanguage(param, { persist: false });
  return param;
}

/**
 * Keep `?lang=` in step with the current language without adding history
 * entries. Other query parameters (for example `?qa=1`) are preserved.
 */
export function syncLangToUrl(lang = current) {
  try {
    const url = new URL(location.href);
    url.searchParams.set('lang', lang === 'zh' ? 'zh' : 'en');
    history.replaceState(history.state, '', url.toString());
  } catch {
    /* history API unavailable — the in-page language still applies */
  }
}

/**
 * Build a shareable deep link for a hash route, carrying the language.
 * `hash` may include its own query, e.g. `#/glossary?term=dougong`.
 */
export function deepLink(hash) {
  try {
    const url = new URL(location.href);
    if (hash) url.hash = hash;
    url.searchParams.set('lang', current === 'zh' ? 'zh' : 'en');
    return url.toString();
  } catch {
    return `${location.origin}${location.pathname}?lang=${current}${hash || ''}`;
  }
}

const langListeners = new Set();
export function onLanguageChange(fn) {
  langListeners.add(fn);
  return () => langListeners.delete(fn);
}

subscribe((state, reason) => {
  if (reason === 'lang' && state.lang !== current) setLanguage(state.lang);
});

setLanguage(storeLang());
