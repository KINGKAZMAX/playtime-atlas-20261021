/**
 * 回响电玩馆 / PLAYTIME ATLAS — 与 16-design-system 的令牌对齐同步器
 *
 * 职责
 * ----
 * 1. 只读引用 16-design-system 的两份产物：
 *      · design-tokens.json  —— 机器可读取值的唯一来源
 *      · src/tokens.css      —— 代码侧变量名与取值的参考实现
 * 2. 解析出 `--ds-*` 变量表（浅色 :root + [data-ds-theme="dark"] 两组），
 *    并与 design-tokens.json 逐项交叉校验（发现 16 自身的口径差异也如实记录）。
 * 3. 生成本包**对齐后**的 canonical 令牌文件 `design-tokens.json`：
 *      · designSystem —— 16 的令牌树（原样引用，不改值）
 *      · local        —— 本包展品内嵌配色与资产规格（海报/封面/展柜/GLB 已烘焙）
 *      · compat       —— 1.0.0 旧键名 → 16 取值的兼容视图（下游平滑过渡）
 * 4. 计算对齐指纹（16 的令牌与字体文件 SHA-256）写入 meta.alignment，
 *    供 06 / 13 核对各作品是否用到了对齐后的资产。
 * 5. 落一份 `scripts/lib/ds-tokens.snapshot.json` 兜底：
 *    16 目录不可用时（如单独 clone 本目录）仍可构建，且快照来源与时间如实标注。
 *
 * 运行：node scripts/sync-ds-tokens.mjs
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DS_DIR = path.resolve(ROOT, '..', '16-design-system');
const DS_TOKENS = path.join(DS_DIR, 'design-tokens.json');
const DS_CSS = path.join(DS_DIR, 'src', 'tokens.css');
const DS_FONTS = path.join(DS_DIR, 'fonts');
const SNAPSHOT = path.join(HERE, 'lib', 'ds-tokens.snapshot.json');
const OUT_JSON = path.join(ROOT, 'design-tokens.json');
const OUT_ASSET_JSON = path.join(ROOT, 'public', 'assets', 'design-tokens.json');

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

/* =========================================================
   1. 解析 16 的 src/tokens.css → { root: {...}, dark: {...} }
   ========================================================= */

/** 从 CSS 文本里抽出某个选择器块内的自定义属性 */
function extractBlock(css, selector) {
  const i = css.indexOf(selector);
  if (i < 0) return null;
  const open = css.indexOf('{', i);
  if (open < 0) return null;
  let depth = 0;
  let end = -1;
  for (let j = open; j < css.length; j++) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') {
      depth--;
      if (depth === 0) { end = j; break; }
    }
  }
  if (end < 0) return null;
  const body = css.slice(open + 1, end);
  const vars = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    vars[m[1]] = m[2].trim().replace(/\s+/g, ' ');
  }
  return vars;
}

/** 解析 16 的 tokens.css，取出浅色与深色两组变量 */
function parseDsCss(css) {
  const root = extractBlock(css, ':root');
  const dark = extractBlock(css, '[data-ds-theme="dark"]');
  return { root: root || {}, dark: dark || {} };
}

/* =========================================================
   2. 与 design-tokens.json 交叉校验
   ========================================================= */

/** CSS 变量 → design-tokens.json 取值路径（只覆盖有明确对应关系的项） */
const JSON_MAP = {
  '--ds-bg': ['color', 'light', 'bg'],
  '--ds-bg-raised': ['color', 'light', 'bgRaised'],
  '--ds-bg-sunken': ['color', 'light', 'bgSunken'],
  '--ds-ink': ['color', 'light', 'ink'],
  '--ds-ink-soft': ['color', 'light', 'inkSoft'],
  '--ds-ink-faint': ['color', 'light', 'inkFaint'],
  '--ds-line': ['color', 'light', 'line'],
  '--ds-line-strong': ['color', 'light', 'lineStrong'],
  '--ds-surface': ['color', 'light', 'surface'],
  '--ds-accent': ['color', 'light', 'accent'],
  '--ds-accent-hover': ['color', 'light', 'accentHover'],
  '--ds-accent-soft': ['color', 'light', 'accentSoft'],
  '--ds-accent-ink': ['color', 'light', 'accentInk'],
  '--ds-jade': ['color', 'light', 'jade'],
  '--ds-jade-soft': ['color', 'light', 'jadeSoft'],
  '--ds-overlay': ['color', 'light', 'overlay'],
  '--ds-canvas-hud-bg': ['color', 'canvas', 'hudBg'],
  '--ds-canvas-hud-ink': ['color', 'canvas', 'hudInk'],
  '--ds-canvas-hud-line': ['color', 'canvas', 'hudLine'],
  '--ds-canvas-scrim': ['color', 'canvas', 'scrim'],
  '--ds-danger': ['color', 'canvas', 'danger'],
  '--ds-success': ['color', 'canvas', 'success'],
  '--ds-warning': ['color', 'canvas', 'warning'],
  '--ds-info': ['color', 'canvas', 'info'],
  '--ds-tone-fade': ['color', 'section', 'toneFadeLight'],
  '--ds-font-display': ['typography', 'family', 'display'],
  '--ds-font-text': ['typography', 'family', 'text'],
  '--ds-font-mono': ['typography', 'family', 'mono'],
  '--ds-type-display': ['typography', 'size', 'display'],
  '--ds-type-h1': ['typography', 'size', 'h1'],
  '--ds-type-h2': ['typography', 'size', 'h2'],
  '--ds-type-h3': ['typography', 'size', 'h3'],
  '--ds-type-h4': ['typography', 'size', 'h4'],
  '--ds-type-lead': ['typography', 'size', 'lead'],
  '--ds-type-body': ['typography', 'size', 'body'],
  '--ds-type-sm': ['typography', 'size', 'sm'],
  '--ds-type-xs': ['typography', 'size', 'xs'],
  '--ds-type-mono': ['typography', 'size', 'mono'],
  '--ds-lh-display': ['typography', 'lineHeight', 'display'],
  '--ds-lh-tight': ['typography', 'lineHeight', 'tight'],
  '--ds-lh-snug': ['typography', 'lineHeight', 'snug'],
  '--ds-lh-normal': ['typography', 'lineHeight', 'normal'],
  '--ds-lh-relaxed': ['typography', 'lineHeight', 'relaxed'],
  '--ds-lh-mono': ['typography', 'lineHeight', 'mono'],
  '--ds-w-regular': ['typography', 'weight', 'regular'],
  '--ds-w-medium': ['typography', 'weight', 'medium'],
  '--ds-w-semibold': ['typography', 'weight', 'semibold'],
  '--ds-w-bold': ['typography', 'weight', 'bold'],
  '--ds-track-display': ['typography', 'tracking', 'display'],
  '--ds-track-body': ['typography', 'tracking', 'body'],
  '--ds-track-cjk': ['typography', 'tracking', 'cjk'],
  '--ds-track-mono': ['typography', 'tracking', 'mono'],
  '--ds-track-caps': ['typography', 'tracking', 'caps'],
  '--ds-space-1': ['space', '1'],
  '--ds-space-2': ['space', '2'],
  '--ds-space-3': ['space', '3'],
  '--ds-space-4': ['space', '4'],
  '--ds-space-5': ['space', '5'],
  '--ds-space-6': ['space', '6'],
  '--ds-space-7': ['space', '7'],
  '--ds-space-8': ['space', '8'],
  '--ds-space-9': ['space', '9'],
  '--ds-space-10': ['space', '10'],
  '--ds-space-gutter': ['space', 'gutter'],
  '--ds-radius-xs': ['radius', 'xs'],
  '--ds-radius-sm': ['radius', 'sm'],
  '--ds-radius-md': ['radius', 'md'],
  '--ds-radius-lg': ['radius', 'lg'],
  '--ds-radius-xl': ['radius', 'xl'],
  '--ds-radius-pill': ['radius', 'pill'],
  '--ds-radius-media': ['radius', 'media'],
  '--ds-shadow-1': ['shadow', '1'],
  '--ds-shadow-2': ['shadow', '2'],
  '--ds-shadow-3': ['shadow', '3'],
  '--ds-shadow-4': ['shadow', '4'],
  '--ds-dur-instant': ['motion', 'duration', 'instant'],
  '--ds-dur-fast': ['motion', 'duration', 'fast'],
  '--ds-dur-base': ['motion', 'duration', 'base'],
  '--ds-dur-slow': ['motion', 'duration', 'slow'],
  '--ds-dur-reveal': ['motion', 'duration', 'reveal'],
  '--ds-ease-out': ['motion', 'easing', 'out'],
  '--ds-ease-inout': ['motion', 'easing', 'inOut'],
  '--ds-ease-veil': ['motion', 'easing', 'veil'],
  '--ds-ease-spring': ['motion', 'easing', 'spring'],
  '--ds-ease-snap': ['motion', 'easing', 'snap'],
  '--ds-stagger-step': ['motion', 'stagger', 'step'],
  '--ds-entry-translate': ['motion', 'entry', 'translateY'],
  '--ds-entry-blur': ['motion', 'entry', 'blur'],
  '--ds-entry-duration': ['motion', 'entry', 'duration'],
  '--ds-z-base': ['zIndex', 'base'],
  '--ds-z-raised': ['zIndex', 'raised'],
  '--ds-z-sticky': ['zIndex', 'sticky'],
  '--ds-z-rail': ['zIndex', 'rail'],
  '--ds-z-overlay': ['zIndex', 'overlay'],
  '--ds-z-modal': ['zIndex', 'modal'],
  '--ds-z-toast': ['zIndex', 'toast'],
  '--ds-max-width': ['layout', 'maxWidth'],
  '--ds-max-width-wide': ['layout', 'maxWidthWide'],
  '--ds-read-width': ['layout', 'readWidth'],
  '--ds-rail-width': ['layout', 'railWidth'],
  '--ds-rail-inset': ['layout', 'railInset'],
  '--ds-section-height': ['layout', 'viewportSection'],
  '--ds-target-min': ['a11y', 'targetSizeEnhanced'],
  '--ds-focus-width': ['a11y', 'focusRingWidth'],
  '--ds-focus-offset': ['a11y', 'focusRingOffset'],
  '--ds-contrast-text': ['a11y', 'minContrastText'],
  '--ds-contrast-large': ['a11y', 'minContrastLarge'],
  '--ds-contrast-ui': ['a11y', 'minContrastUi'],
};

const DARK_JSON_MAP = {
  '--ds-bg': ['color', 'dark', 'bg'],
  '--ds-bg-raised': ['color', 'dark', 'bgRaised'],
  '--ds-bg-sunken': ['color', 'dark', 'bgSunken'],
  '--ds-ink': ['color', 'dark', 'ink'],
  '--ds-ink-soft': ['color', 'dark', 'inkSoft'],
  '--ds-ink-faint': ['color', 'dark', 'inkFaint'],
  '--ds-line': ['color', 'dark', 'line'],
  '--ds-line-strong': ['color', 'dark', 'lineStrong'],
  '--ds-surface': ['color', 'dark', 'surface'],
  '--ds-accent': ['color', 'dark', 'accent'],
  '--ds-accent-hover': ['color', 'dark', 'accentHover'],
  '--ds-accent-soft': ['color', 'dark', 'accentSoft'],
  '--ds-accent-ink': ['color', 'dark', 'accentInk'],
  '--ds-jade': ['color', 'dark', 'jade'],
  '--ds-jade-soft': ['color', 'dark', 'jadeSoft'],
  '--ds-overlay': ['color', 'dark', 'overlay'],
  '--ds-tone-fade': ['color', 'section', 'toneFadeDark'],
};

/** 沿路径取值；叶子若是 DTCG 的 { $value } 包装则自动拆开 */
const dig = (obj, p) => {
  let node = p.reduce((o, k) => (o == null ? o : o[k]), obj);
  if (node && typeof node === 'object' && !Array.isArray(node) && '$value' in node) node = node.$value;
  return node;
};

/** 比较 CSS 值与 JSON 值：十六进制大小写不敏感，数字按数值比 */
function valuesMatch(cssValue, jsonValue, kind = 'value') {
  if (jsonValue == null) return null;
  const a = String(cssValue).trim().toLowerCase();
  const b = String(jsonValue).trim().toLowerCase();
  if (a === b) return true;
  const aHex = a.replace(/\s+/g, '');
  const bHex = b.replace(/\s+/g, '');
  if (aHex === bHex) return true;
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na === nb;

  /* 字体栈：**顺序敏感**，必须逐族相等。
     字体回退按字符进行，族的先后顺序会直接改变实际字形来源 ——
     16 记录的规则是"覆盖完整的系统 CJK 族必须排在覆盖有限的 Noto Sans SC 子集之前"，
     顺序错了会导致同段中文混入两套字形、基线错位。
     因此这里只接受：归一化引号/空白后，两侧族序列完全一致；
     CSS 额外追加的尾部回退项也允许（16 曾在 JSON 之后补 BlinkMacSystemFont 等），
     但不允许插入或重排。 */
  if (kind === 'font') {
    const list = (s) => s.replace(/["']/g, '').split(',').map((x) => x.trim()).filter(Boolean);
    const cssList = list(a);
    const jsonList = list(b);
    if (cssList.length && jsonList.length) {
      if (cssList.length === jsonList.length && cssList.every((f, i) => f === jsonList[i])) return true;
      /* CSS 只在末尾追加回退族 → 仍视为等价 */
      if (cssList.length > jsonList.length && cssList.slice(0, jsonList.length).every((f, i) => f === jsonList[i])) {
        return true;
      }
    }
  }

  /* 复合值（阴影 / rgba）：逐个数字按数值比较（0.1 与 0.10 等价） */
  if (kind === 'complex') {
    const nums = (s) => (s.match(/-?\d*\.?\d+/g) || []).map(Number);
    const A = nums(a);
    const B = nums(b);
    if (A.length && A.length === B.length && A.every((n, i) => n === B[i])) return true;
  }

  const norm = (s) => s.replace(/["']/g, '').replace(/\s+/g, '');
  return norm(a) === norm(b);
}

/* =========================================================
   3. 展品内嵌（local）—— 沿用 1.0.0 的取值
   ========================================================= */
const local = JSON.parse(readFileSync(path.join(HERE, 'lib', 'local-tokens.json'), 'utf8'));

/* =========================================================
   4. 读取 16（优先）或快照（兜底）
   ========================================================= */
let dsJson;
let dsVars;
let source;
let fingerprints;

if (existsSync(DS_TOKENS) && existsSync(DS_CSS)) {
  dsJson = readJSON(DS_TOKENS);
  dsVars = parseDsCss(readFileSync(DS_CSS, 'utf8'));
  source = 'live:16-design-system';

  /* 字体文件指纹：本包与 16 的字体必须逐字节一致 */
  const fontFiles = readdirSync(DS_FONTS).filter((f) => f.endsWith('.woff2')).sort();
  const dsFonts = {};
  const myFonts = {};
  for (const f of fontFiles) {
    dsFonts[f] = sha256(readFileSync(path.join(DS_FONTS, f)));
    const mine = path.join(ROOT, 'public', 'assets', 'fonts', f);
    myFonts[f] = existsSync(mine) ? sha256(readFileSync(mine)) : null;
  }
  fingerprints = {
    designTokensSha256: sha256(readFileSync(DS_TOKENS)),
    tokensCssSha256: sha256(readFileSync(DS_CSS)),
    fontsSha256: dsFonts,
    localFontsSha256: myFonts,
    fontsIdentical: fontFiles.every((f) => myFonts[f] && myFonts[f] === dsFonts[f]),
  };
} else {
  const snap = readJSON(SNAPSHOT);
  dsJson = snap.json;
  dsVars = snap.cssVars;
  source = 'snapshot:scripts/lib/ds-tokens.snapshot.json';
  fingerprints = snap.fingerprints;
  console.warn('! 未找到 16-design-system，改用兜底快照（来源与时间见 meta.alignment.source）');
}

/* =========================================================
   5. 交叉校验
   ========================================================= */
const drift = [];
for (const [cssVar, jp] of Object.entries(JSON_MAP)) {
  const cssValue = dsVars.root[cssVar];
  if (cssValue === undefined) {
    drift.push({ variable: cssVar, kind: 'missing-in-css', jsonPath: jp.join('.') });
    continue;
  }
  const jsonValue = dig(dsJson, jp);
  if (jsonValue === undefined) {
    drift.push({ variable: cssVar, kind: 'missing-in-json', jsonPath: jp.join('.') });
    continue;
  }
  const kind = cssVar.startsWith('--ds-font-') ? 'font' : (cssVar.startsWith('--ds-shadow-') ? 'complex' : 'value');
  if (!valuesMatch(cssValue, jsonValue, kind)) {
    drift.push({
      variable: cssVar,
      kind: 'value-differs',
      css: cssValue,
      json: jsonValue,
      jsonPath: jp.join('.'),
      inherited: true,
      note: '16 的 src/tokens.css 与 design-tokens.json 在此项上本身不一致（跨层差异，源自 16）。本包 CSS 层照抄 16 的 CSS 取值、JSON 层照抄 16 的 JSON 取值，两层均未做任何取舍或改写。',
    });
  }
}
for (const [cssVar, jp] of Object.entries(DARK_JSON_MAP)) {
  const cssValue = dsVars.dark[cssVar];
  if (cssValue === undefined) continue;
  const jsonValue = dig(dsJson, jp);
  if (jsonValue !== undefined && !valuesMatch(cssValue, jsonValue)) {
    drift.push({
      variable: cssVar,
      kind: 'value-differs-dark',
      css: cssValue,
      json: jsonValue,
      jsonPath: jp.join('.'),
      inherited: true,
      note: '16 的深色主题 CSS 与 JSON 在此项上本身不一致（跨层差异，源自 16）。本包两层均照抄各自来源。',
    });
  }
}

/* =========================================================
   6. 构造对齐后的 canonical 令牌
   ========================================================= */
const dsMeta = dsJson.meta || {};
const light = dsJson.color?.light || {};
const dark = dsJson.color?.dark || {};
/** 取 DTCG 叶子值（拆掉 { $value } 包装） */
const val = (node) => (node && typeof node === 'object' && '$value' in node ? node.$value : node);

/** 旧键名 → 16 取值的兼容视图（1.0.0 的下游键名保持可用） */
const compat = {
  $description: '1.0.0 旧键名 → 16 取值的兼容视图。语义色取 16 浅色主题（design-tokens.json 默认主题）；深色主题请用 CSS 变量 var(--ds-*)，它随 [data-ds-theme] 自动切换。',
  semantic: {
    bgBase: val(light.bg),
    bgDeep: val(dsJson.color?.section?.toneFadeLight),
    bgPanel: val(light.surface),
    bgRaised: val(light.bgRaised),
    textPrimary: val(light.ink),
    textSecondary: val(light.inkSoft),
    textMuted: val(light.inkFaint),
    textOnSignal: val(light.accentInk),
    accent: val(light.accent),
    accentDeep: val(light.accentHover),
    accentSoft: val(light.accentSoft),
    positive: val(light.jade),
    hairline: val(light.line),
    hairlineStrong: val(light.lineStrong),
    scrim: val(dsJson.color?.canvas?.scrim),
  },
  typography: {
    fontFamily: {
      display: val(dsJson.typography?.family?.display),
      sans: val(dsJson.typography?.family?.text),
      mono: val(dsJson.typography?.family?.mono),
      cjk: "'Noto Sans SC', -apple-system, system-ui, sans-serif",
    },
    fontSize: {
      '2xs': '11px',
      xs: val(dsJson.typography?.size?.xs),
      sm: val(dsJson.typography?.size?.sm),
      base: val(dsJson.typography?.size?.body),
      md: val(dsJson.typography?.size?.h4),
      lg: val(dsJson.typography?.size?.h3),
      xl: val(dsJson.typography?.size?.h2),
      '2xl': val(dsJson.typography?.size?.h1),
      '3xl': val(dsJson.typography?.size?.display),
    },
    lineHeight: {
      tight: val(dsJson.typography?.lineHeight?.tight),
      snug: val(dsJson.typography?.lineHeight?.snug),
      normal: val(dsJson.typography?.lineHeight?.normal),
      loose: val(dsJson.typography?.lineHeight?.relaxed),
    },
  },
  space: Object.fromEntries(
    Object.entries(dsJson.space || {})
      .filter(([k]) => /^\d+$/.test(k))
      .map(([k, v]) => [k, val(v)]),
  ),
  radius: Object.fromEntries(
    Object.entries(dsJson.radius || {}).map(([k, v]) => [k, val(v)]),
  ),
  motion: {
    instant: val(dsJson.motion?.duration?.instant),
    fast: val(dsJson.motion?.duration?.fast),
    base: val(dsJson.motion?.duration?.base),
    slow: val(dsJson.motion?.duration?.slow),
    easeOut: val(dsJson.motion?.easing?.out),
    easeInOut: val(dsJson.motion?.easing?.inOut),
  },
};

const aligned = {
  $schema: 'https://design-tokens.org/schema.json',
  meta: {
    id: 'playtime-atlas-art',
    name: '回响电玩馆 / PLAYTIME ATLAS — 美术资产包令牌（已对齐余晖设计系统）',
    nameEn: 'PLAYTIME ATLAS — Art Asset Pack Tokens (aligned to Afterglow DS)',
    version: '1.1.0',
    updated: '2026-10-21',
    theme: 'dark',
    scheme: {
      name: 'UI 采用余晖 DS 深色主题；展品内嵌仍为深墨蓝 + 暖纸白 + 信号橙',
      uiBackground: dark.bg?.$value,
      uiAccent: dark.accent?.$value,
      exhibitInk: local.color.ink[800],
      exhibitPaper: local.color.paper[50],
      exhibitSignal: local.color.signal[500],
    },
    alignment: {
      designSystem: dsMeta.name || '余晖设计系统 / Afterglow Design System',
      designSystemEn: dsMeta.nameEn,
      designSystemId: dsMeta.id,
      designSystemVersion: dsMeta.version,
      alignedTo: '16-design-system/design-tokens.json',
      alignedToCss: '16-design-system/src/tokens.css',
      spec: '16-design-system/DESIGN-SPEC.md',
      audit: '16-design-system/REFERENCE-AUDIT.md',
      migration: '16-design-system/MIGRATION-NOTES.md §2.3',
      source,
      alignedAt: new Date().toISOString(),
      cssVariablePrefix: dsMeta.prefix?.cssVariable || '--ds-',
      fingerprints,
      drift,
      alignmentLayers: {
        cssLayer: {
          source: '16-design-system/src/tokens.css',
          sha256: fingerprints?.tokensCssSha256 || null,
          applied: 'cssVars.root / cssVars.dark（逐项照抄，未做任何取舍）',
        },
        jsonLayer: {
          source: '16-design-system/design-tokens.json',
          sha256: fingerprints?.designTokensSha256 || null,
          applied: 'designSystem（令牌树原样引用，取值未改）',
        },
        note:
          '本包分两层对齐 16：CSS 层（--ds-* 变量表）照抄 16 的 src/tokens.css，JSON 层（designSystem 令牌树）照抄 16 的 design-tokens.json。' +
          'drift 记录的是这两层之间、即 16 自身 JSON 与 CSS 的不一致项；每项都已登记 inherited 与说明，本包不做取舍。',
      },
      /* 16 的 tools/validate-tokens.mjs 里那些**只对 16 预览页成立**的机制项，
         在本包语境下不适用，逐项登记理由，便于 13 / 14 复核时直接对照。 */
      inapplicableChecks: [
        {
          check: '指示器 bottom 必须保留 clamp(36px, 8vh, 64px)',
          registry: '16-design-system/src/components.css §10（.ds-indicator）',
          reason:
            '指示器是 16 预览页的滚动提示组件（圆点↔箭头形变）。本包是资产面板，没有该组件，' +
            '也不存在等价物；强行加入只为通过校验属于为指标而造功能，故登记为不适用。',
        },
      ],
      note:
        'designSystem 为 16 令牌树原样引用（取值未改）；local 为本包展品内嵌配色与资产规格（海报/封面/展柜/GLB 材质已烘焙，不随 UI 主题变化）；compat 为 1.0.0 旧键名到 16 取值的兼容视图。',
    },
  },
  designSystem: dsJson,
  local,
  compat,
  cssVars: dsVars,
};

/* =========================================================
   7. 落盘
   ========================================================= */
mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
mkdirSync(path.dirname(OUT_ASSET_JSON), { recursive: true });

if (source.startsWith('live:')) {
  writeFileSync(
    SNAPSHOT,
    JSON.stringify(
      {
        $comment: '16-design-system 令牌兜底快照。由 scripts/sync-ds-tokens.mjs 生成，内容为取值快照（非文件复制），仅在 16 目录不可用时用于构建。',
        capturedAt: new Date().toISOString(),
        source,
        fingerprints,
        cssVars: dsVars,
        json: dsJson,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
}

const json = JSON.stringify(aligned, null, 2) + '\n';
writeFileSync(OUT_JSON, json, 'utf8');
writeFileSync(OUT_ASSET_JSON, json, 'utf8');

console.log(`✓ 令牌对齐完成（来源：${source}）`);
console.log(`  · design-tokens.json  ← 16 令牌树 ${Object.keys(dsVars.root).length} 个变量 + 展品内嵌 + 兼容视图`);
console.log(`  · public/assets/design-tokens.json`);
console.log(`  · scripts/lib/ds-tokens.snapshot.json${source.startsWith('live:') ? '' : '（未更新）'}`);
if (fingerprints?.fontsIdentical) {
  console.log('  · 字体与 16 逐字节一致 ✓');
} else if (fingerprints?.fontsSha256) {
  console.log('  ! 字体与 16 不一致，需复核');
}
if (drift.length) {
  console.log(`  · 与 16 的口径差异 ${drift.length} 项（已在 meta.alignment.drift 如实记录）：`);
  for (const d of drift.slice(0, 10)) {
    console.log(`      ${d.variable}  ${d.kind}${d.json ? `  css=${d.css}  json=${d.json}` : ''}`);
  }
} else {
  console.log('  · 与 16 的取值零差异 ✓');
}
