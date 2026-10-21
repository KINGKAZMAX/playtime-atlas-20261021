#!/usr/bin/env node
/**
 * 改版增量替换脚本（一次性迁移工具，保留在仓库中作为改版审计证据）
 * --------------------------------------------------------------------------
 * 目标：把 src/styles.css 的**视觉语言**换成 16-design-system 的浅色主题，
 *       保留全部既有选择器与结构（不推倒重写）。
 *
 * 做法：逐条「精确字符串 → 精确字符串」替换，每条都断言命中次数，
 *       命中数不符立即退出，避免静默漏改或多改。
 *
 * 依据：16-design-system/design-tokens.json（取值来源）
 *      16-design-system/MIGRATION-NOTES.md §1 接入四步、§2.7 03 专项映射、
 *      §3 通用组件替换、§5 无障碍、§10 红线
 *
 * 运行：node scripts/restyle-apply.mjs
 * 幂等：若检测到已应用（标记存在），则直接退出。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'src/styles.css');
const MARK = '/* RESTYLE-APPLIED: 2026-10-21 余晖设计系统浅色主题 */';

if (!fs.existsSync(FILE)) {
  console.error('✗ 找不到 src/styles.css');
  process.exit(1);
}

let css = fs.readFileSync(FILE, 'utf8');
if (css.includes(MARK)) {
  console.log('· 已应用过改版替换，跳过。');
  process.exit(0);
}

/* ── 替换表：每条 [旧, 新, 期望命中次数=1] ─────────────────────────────── */
const P = [];
const add = (oldText, newText, expect = 1) => P.push([oldText, newText, expect]);

/* 1. 文件头 + 移除旧 @font-face（字体迁到 public/fonts/fonts.css） */
add(
`/* ═══════════════════════════════════════════════════════════════
   织造车间调度台 · LOOMDECK
   原创视觉系统：靛蓝（indigo）× 柿红（persimmon）× 米白（rice）× 墨黑（ink）
   字体：本地化 Noto Serif SC（标题/正文） + JetBrains Mono（数据）
   ═══════════════════════════════════════════════════════════════ */

@font-face {
  font-family: 'Loomdeck Serif';
  src: url('/fonts/noto-serif-sc-loomdeck.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Loomdeck Mono';
  src: url('/fonts/jetbrains-mono-loomdeck.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}
`,
`/* ═══════════════════════════════════════════════════════════════
   织造车间调度台 · LOOMDECK
   视觉语言：余晖设计系统（16-design-system）浅色主题
   字体：Space Grotesk / Inter / Space Mono / Noto Sans SC（自托管）
   令牌：src/tokens.css　组件：src/ds-components.css
   ═══════════════════════════════════════════════════════════════ */
`);

/* 2. 旧调色板 :root —— 迁到 src/tokens.css 的语义别名层 */
add(
`:root {
  /* 织物染色色板 */
  --ink:        #17140f;
  --ink-soft:   #453d33;
  --ink-mute:   #7a6f60;
  --rice:       #f3ece0;
  --rice-warm:  #efe5d4;
  --paper:      #fbf7ef;
  --paper-2:    #f6efe2;

  --indigo:     #24415f;
  --indigo-mid: #35597f;
  --indigo-lt:  #6d90b0;
  --persimmon:  #c04a24;
  --persimmon-lt:#e07a4f;
  --moss:       #4f6b45;
  --gold:       #a67c2e;

  --ok:    #3f6b3a;
  --warn:  #a8701a;
  --err:   #b23a20;
  --info:  var(--indigo-mid);

  --line:      #ded2be;
  --line-soft: #e9e0cf;

  --r-sm: 4px;
  --r-md: 7px;
  --r-lg: 12px;

  --shadow-1: 0 1px 2px rgba(23, 20, 15, .07);
  --shadow-2: 0 6px 18px -8px rgba(23, 20, 15, .28), 0 1px 0 rgba(255,255,255,.7) inset;

  --serif: 'Loomdeck Serif', 'Songti SC', 'Noto Serif CJK SC', 'Source Han Serif SC', serif;
  --mono: 'Loomdeck Mono', ui-monospace, 'SF Mono', Menlo, monospace;
}
`,
`/* 调色板已迁至 src/tokens.css（--ds-* 令牌层 + 旧变量语义别名层） */
`);

/* 3. body：去织纹底纹，换 DS 字体与底色 */
add(
`body {
  margin: 0;
  font-family: var(--serif);
  color: var(--ink);
  background-color: var(--rice);
  /* 织纹底：两组细线叠加，模拟平纹组织 */
  background-image:
    repeating-linear-gradient(90deg, rgba(36,65,95,.035) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(0deg, rgba(36,65,95,.035) 0 1px, transparent 1px 7px),
    radial-gradient(ellipse at 12% -10%, rgba(192,74,36,.06), transparent 55%),
    radial-gradient(ellipse at 88% 0%, rgba(36,65,95,.07), transparent 50%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
`,
`body {
  margin: 0;
  font-family: var(--ds-font-text);
  font-size: var(--ds-type-body);
  color: var(--ds-ink);
  background-color: var(--ds-bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}
`);

/* 4. 跳转链接交给 .ds-skip */
add(
`.skip-link {
  position: absolute; left: -9999px; top: 0; z-index: 999;
  background: var(--indigo); color: var(--paper); padding: .55rem 1rem; border-radius: 0 0 var(--r-md) 0;
}
.skip-link:focus { left: 0; }
`,
`/* 跳转链接外观见 ds-components.css 的 .ds-skip */
`);

/* 5. 焦点环交给组件层（--ds-accent + 2px 偏移，任何状态不得移除） */
add(
`:focus-visible {
  outline: 2px solid var(--persimmon);
  outline-offset: 2px;
}
`,
`/* 焦点环见 ds-components.css 的 :focus-visible */
`);

/* 6. 页眉 */
add(
`.masthead {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 1.5rem;
  padding: .85rem 1.4rem;
  background: linear-gradient(178deg, var(--paper) 0%, var(--paper-2) 100%);
  border-bottom: 2px solid var(--ink);
  box-shadow: var(--shadow-1);
  z-index: 20;
}
`,
`.masthead {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: var(--ds-space-4);
  padding: var(--ds-space-3) var(--ds-space-4);
  background: var(--ds-bg);
  border-bottom: 1px solid var(--ds-line);
  box-shadow: var(--ds-shadow-1);
  z-index: var(--ds-z-sticky);
}
`);
add(
`.masthead__brand { display: flex; align-items: center; gap: .85rem; min-width: 0; }`,
`.masthead__brand { display: flex; align-items: center; gap: var(--ds-space-3); min-width: 0; }`);
add(
`.brand-mark {
  width: 42px; height: 42px; flex: 0 0 auto;
  color: var(--indigo);
}
`,
`.brand-mark {
  width: 40px; height: 40px; flex: 0 0 auto;
  color: var(--ds-ink);
}
`);
add(
`.masthead h1 {
  margin: 0;
  font-size: 1.32rem;
  font-weight: 700;
  letter-spacing: .16em;
  line-height: 1.15;
  white-space: nowrap;
}
`,
`.masthead h1 {
  margin: 0;
  font-family: var(--ds-font-display);
  font-size: var(--ds-type-h3);
  font-weight: var(--ds-w-semibold);
  letter-spacing: var(--ds-track-cjk);
  line-height: 1.22;
  /* 红线：标题禁用 white-space:nowrap（390px 必然溢出） */
  overflow-wrap: anywhere;
}
`);
add(
`.masthead__sub {
  margin: .18rem 0 0;
  font-family: var(--mono);
  font-size: .66rem;
  letter-spacing: .19em;
  text-transform: uppercase;
  color: var(--ink-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`,
`.masthead__sub {
  margin: var(--ds-space-1) 0 0;
  font-family: var(--ds-font-mono);
  font-size: var(--ds-type-xs);
  letter-spacing: var(--ds-track-caps);
  text-transform: uppercase;
  color: var(--ds-ink-faint);
  overflow-wrap: anywhere;
}
`);
add(
`.masthead__stats {
  display: flex;
  gap: 1.7rem;
  margin: 0;
  padding: 0 .2rem;
}
`,
`.masthead__stats {
  display: flex;
  gap: var(--ds-space-5);
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}
`);
add(
`.hstat dt {
  font-size: .66rem; letter-spacing: .1em; color: var(--ink-mute);
  white-space: nowrap;
}
.hstat dd {
  margin: 0; font-family: var(--mono); font-weight: 700;
  font-size: 1.28rem; line-height: 1.1; color: var(--indigo);
  font-variant-numeric: tabular-nums;
}
.hstat dd.is-warn { color: var(--warn); }
.hstat dd.is-err  { color: var(--err); }
`,
`.hstat dt {
  font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink-faint);
}
.hstat dd {
  margin: 0; font-family: var(--ds-font-mono); font-weight: var(--ds-w-bold);
  font-size: var(--ds-type-h3); line-height: 1.2; color: var(--ds-ink);
  font-variant-numeric: tabular-nums;
}
.hstat dd.is-warn { color: var(--warn-ink); }
.hstat dd.is-err  { color: var(--err-ink); }
`);
add(
`.masthead__actions { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }`,
`.masthead__actions { display: flex; gap: var(--ds-space-2); align-items: center; flex-wrap: wrap; }`);

/* 7. 当班状态芯片 */
add(
`.shift-chip {
  display: inline-flex; align-items: center; gap: .34rem;
  margin: 0;
  padding: .22rem .58rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--rice);
  font-family: var(--mono);
  font-size: .66rem;
  letter-spacing: .1em;
  color: var(--ink-soft);
  white-space: nowrap;
}
.shift-chip__dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ok);
  box-shadow: 0 0 0 3px rgba(63,107,58,.18);
}
.shift-chip[data-shift="paused"] { color: var(--warn); border-color: rgba(168,112,26,.5); }
.shift-chip[data-shift="paused"] .shift-chip__dot { background: var(--warn); box-shadow: 0 0 0 3px rgba(168,112,26,.18); }
.shift-chip[data-shift="idle"] { color: var(--ink-mute); }
.shift-chip[data-shift="idle"] .shift-chip__dot { background: var(--ink-mute); box-shadow: 0 0 0 3px rgba(122,111,96,.18); }
`,
`.shift-chip {
  display: inline-flex; align-items: center; gap: var(--ds-space-2);
  margin: 0;
  padding: 4px 12px;
  border: 1px solid var(--ds-line);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-surface);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-type-xs);
  letter-spacing: var(--ds-track-cjk);
  color: var(--ds-ink-soft);
  white-space: nowrap;
}
.shift-chip__dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--ds-success);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ds-success) 18%, transparent);
}
.shift-chip[data-shift="paused"] { color: var(--warn-ink); border-color: color-mix(in srgb, var(--ds-warning) 50%, var(--ds-line)); }
.shift-chip[data-shift="paused"] .shift-chip__dot { background: var(--ds-warning); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ds-warning) 18%, transparent); }
.shift-chip[data-shift="idle"] { color: var(--ds-ink-faint); }
.shift-chip[data-shift="idle"] .shift-chip__dot { background: var(--ds-ink-faint); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ds-ink-faint) 18%, transparent); }
`);

/* 8. 快捷键提示条 */
add(
`.kbd-hint {
  font-family: var(--mono);
  font-size: .64rem;
  letter-spacing: .08em;
  color: var(--ink-mute);
  border: 1px dashed var(--line);
  border-radius: 999px;
  padding: .2rem .56rem;
  white-space: nowrap;
  /* 占位宽度固定：显隐时不重排页眉，否则鼠标按下与抬起之间按钮会移位、点击被吞 */
  min-width: 11.2rem;
  text-align: center;
}
`,
`.kbd-hint {
  font-family: var(--ds-font-mono);
  font-size: var(--ds-type-xs);
  letter-spacing: var(--ds-track-cjk);
  color: var(--ds-ink-faint);
  border: 1px dashed var(--ds-line-strong);
  border-radius: var(--ds-radius-pill);
  padding: 4px 10px;
  white-space: nowrap;
  /* 占位宽度固定：显隐时不重排页眉，否则鼠标按下与抬起之间按钮会移位、点击被吞 */
  min-width: 11.6rem;
  text-align: center;
}
`);

/* 9. 顶栏按钮定宽（字号变大后重新计算，避免文案切换引起重排） */
add(
`#btn-dispatch { min-width: 6.1rem; }
#btn-shift-pause { min-width: 5.4rem; }
`,
`#btn-dispatch { min-width: 7.4rem; }
#btn-shift-pause { min-width: 6.2rem; }
`);

/* 10. 按钮 */
add(
`.btn {
  appearance: none;
  border: 1px solid var(--ink);
  background: var(--paper);
  color: var(--ink);
  padding: .42rem .85rem;
  border-radius: var(--r-sm);
  font-size: .82rem;
  letter-spacing: .06em;
  cursor: pointer;
  transition: background .14s ease, color .14s ease, transform .08s ease, box-shadow .14s ease;
  box-shadow: var(--shadow-1);
  white-space: nowrap;
}
.btn:hover { background: var(--rice-warm); }
.btn:active { transform: translateY(1px); }
.btn--primary {
  background: var(--persimmon); border-color: var(--persimmon); color: #fff8ef;
}
.btn--primary:hover { background: #a83e1d; border-color: #a83e1d; }
.btn--ghost { background: transparent; border-color: var(--ink-mute); color: var(--ink-soft); }
.btn--ghost:hover { background: rgba(36,65,95,.07); border-color: var(--ink); color: var(--ink); }
.btn--tiny { padding: .24rem .55rem; font-size: .72rem; border-color: var(--ink-mute); background: transparent; color: var(--ink-soft); }
.btn--tiny:hover { background: rgba(36,65,95,.08); color: var(--ink); }
.btn--tiny[aria-pressed="true"] { background: var(--indigo); border-color: var(--indigo); color: var(--paper); }
.btn:disabled { opacity: .42; cursor: not-allowed; transform: none; }
`,
`/* 按钮：外观与 ds-components.css 的 .ds-btn 一致（此处保留旧类名兜底） */
.btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  min-height: 40px;
  padding: var(--ds-space-2) var(--ds-space-4);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-control);
  background: var(--ds-surface);
  color: var(--ds-ink);
  font-family: var(--ds-font-text);
  font-size: var(--ds-type-sm);
  font-weight: var(--ds-w-medium);
  letter-spacing: var(--ds-track-cjk);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color var(--ds-dur-fast) var(--ds-ease-veil),
    color var(--ds-dur-fast) var(--ds-ease-veil),
    border-color var(--ds-dur-fast) var(--ds-ease-veil),
    box-shadow var(--ds-dur-fast) var(--ds-ease-veil),
    transform var(--ds-dur-fast) var(--ds-ease-spring);
}
.btn:hover { background: var(--ds-bg-sunken); }
.btn:active { transform: scale(0.985); }
.btn--primary {
  background: var(--ds-accent); border-color: var(--ds-accent); color: var(--ds-accent-ink);
}
.btn--primary:hover { background: var(--ds-accent-hover); border-color: var(--ds-accent-hover); }
.btn--ghost { background: transparent; box-shadow: var(--ds-ring); color: var(--ds-ink); }
.btn--ghost:hover { background: var(--ds-surface); box-shadow: var(--ds-ring-strong); }
.btn--tiny {
  min-height: 32px; padding: 4px var(--ds-space-3); font-size: var(--ds-type-xs);
  background: transparent; box-shadow: var(--ds-ring); color: var(--ds-ink-soft);
}
.btn--tiny:hover { background: var(--ds-surface); color: var(--ds-ink); }
.btn--tiny[aria-pressed="true"] { background: var(--ds-accent-soft); border-color: var(--ds-accent); color: var(--ds-accent); }
.btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
`);

/* 11. 恢复提示条 */
add(
`.restore-banner {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: .6rem;
  padding: .42rem 1.4rem;
  background: var(--moss);
  color: #f2f6ef;
  font-size: .78rem;
  letter-spacing: .05em;
}
.restore-banner[hidden] { display: none; }
.restore-banner__dot {
  width: 7px; height: 7px; border-radius: 50%; background: #cfe6bf;
  box-shadow: 0 0 0 3px rgba(207,230,191,.22);
}
.restore-banner .btn { margin-left: auto; border-color: rgba(242,246,239,.55); color: #f2f6ef; }
.restore-banner .btn:hover { background: rgba(255,255,255,.14); }
`,
`.restore-banner {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: var(--ds-space-3);
  padding: var(--ds-space-2) var(--ds-space-4);
  background: var(--ds-jade);
  color: #fff;
  font-size: var(--ds-type-sm);
  letter-spacing: var(--ds-track-cjk);
}
.restore-banner[hidden] { display: none; }
.restore-banner__dot {
  width: 7px; height: 7px; border-radius: 50%; background: #cfe6bf;
  box-shadow: 0 0 0 3px rgba(255,255,255,.2);
}
.restore-banner .btn {
  margin-left: auto; background: transparent; color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.55);
}
.restore-banner .btn:hover { background: rgba(255,255,255,.14); }
`);

/* 12. 主体栅格 */
add(
`  gap: 1px;
  background: var(--ink);
  border-top: 1px solid var(--ink);
}
`,
`  gap: 1px;
  background: var(--ds-line);
  border-top: 1px solid var(--ds-line);
}
`);
add(
`.panel {
  background: var(--paper);
`,
`.panel {
  background: var(--ds-bg);
`);

/* 13. 面板头（深色 → 浅色） */
add(
`.panel__head {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: .7rem;
  padding: .55rem .9rem;
  background: var(--ink);
  color: var(--paper);
}
.panel__head h2 {
  margin: 0; font-size: .88rem; font-weight: 700; letter-spacing: .17em;
}
.panel__count {
  font-family: var(--mono); font-size: .7rem;
  background: var(--persimmon); color: #fff6ec;
  padding: .05rem .42rem; border-radius: 999px;
  font-variant-numeric: tabular-nums;
}
`,
`.panel__head {
  flex: 0 0 auto;
  display: flex; align-items: center; gap: var(--ds-space-3);
  padding: var(--ds-space-2) var(--ds-space-4);
  background: var(--ds-surface);
  color: var(--ds-ink);
  border-bottom: 1px solid var(--ds-line);
}
.panel__head h2 {
  margin: 0; font-size: var(--ds-type-sm); font-weight: var(--ds-w-semibold);
  letter-spacing: var(--ds-track-cjk); color: var(--ds-ink);
}
.panel__count {
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs);
  background: var(--ds-accent); color: var(--ds-accent-ink);
  padding: 1px 8px; border-radius: var(--ds-radius-pill);
  font-variant-numeric: tabular-nums;
}
`);
add(
`.panel__body { flex: 1 1 auto; min-height: 0; padding: .8rem .9rem; }
.panel__body--scroll { overflow-y: auto; overscroll-behavior: contain; }
.panel__body--log { padding: .45rem .7rem; overflow-y: auto; }
`,
`.panel__body { flex: 1 1 auto; min-height: 0; padding: var(--ds-space-4); }
.panel__body--scroll { overflow-y: auto; overscroll-behavior: contain; }
.panel__body--log { padding: var(--ds-space-2) var(--ds-space-3); overflow-y: auto; }
`);

/* 14. 订单表单 */
add(
`.order-form {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .5rem .55rem;
  padding: .8rem .9rem;
  background: var(--paper-2);
  border-bottom: 1px solid var(--line);
}
.field { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
.field label {
  font-size: .68rem; letter-spacing: .09em; color: var(--ink-mute);
  display: flex; justify-content: space-between; align-items: baseline; gap: .3rem;
}
.field__unit { font-family: var(--mono); font-size: .62rem; opacity: .75; }
.field input, .field select {
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: var(--r-sm);
  padding: .34rem .45rem;
  font-family: var(--mono);
  font-size: .8rem;
  width: 100%;
  min-width: 0;
  transition: border-color .14s ease, box-shadow .14s ease;
}
.field input:focus, .field select:focus {
  border-color: var(--indigo-mid);
  box-shadow: 0 0 0 3px rgba(53,89,127,.15);
  outline: none;
}
`,
`.order-form {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ds-space-2) var(--ds-space-3);
  padding: var(--ds-space-4);
  background: var(--ds-bg-sunken);
  border-bottom: 1px solid var(--ds-line);
}
.field { display: flex; flex-direction: column; gap: var(--ds-space-1); min-width: 0; }
.field label {
  font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink-soft);
  display: flex; justify-content: space-between; align-items: baseline; gap: var(--ds-space-1);
}
.field__unit { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-faint); }
.field input, .field select {
  border: 1px solid var(--ds-line);
  background: var(--ds-bg-raised);
  border-radius: var(--ds-radius-sm);
  padding: 6px var(--ds-space-3);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-type-sm);
  min-height: 40px;
  width: 100%;
  min-width: 0;
  transition: border-color var(--ds-dur-fast) var(--ds-ease-veil), box-shadow var(--ds-dur-fast) var(--ds-ease-veil);
}
.field input:focus, .field select:focus {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 3px var(--ds-accent-soft);
}
`);
add(
`.field.has-error input, .field.has-error select {
  border-color: var(--err);
  box-shadow: 0 0 0 3px rgba(178,58,32,.13);
}
.field__err {
  font-size: .64rem; color: var(--err); letter-spacing: .02em; line-height: 1.3;
}
`,
`.field.has-error input, .field.has-error select {
  border-color: var(--ds-danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ds-danger) 16%, transparent);
}
.field__err {
  font-size: var(--ds-type-xs); color: var(--ds-danger); letter-spacing: var(--ds-track-cjk); line-height: 1.4;
}
`);
add(
`.form-error {
  grid-column: 1 / -1;
  margin: 0;
  font-size: .72rem;
  color: var(--err);
  background: rgba(178,58,32,.08);
  border-left: 3px solid var(--err);
  padding: .34rem .55rem;
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
}
`,
`.form-error {
  grid-column: 1 / -1;
  margin: 0;
  font-size: var(--ds-type-xs);
  color: var(--err-ink);
  background: color-mix(in srgb, var(--ds-danger) 8%, var(--ds-bg));
  border-left: 3px solid var(--ds-danger);
  padding: var(--ds-space-2) var(--ds-space-3);
  border-radius: 0 var(--ds-radius-xs) var(--ds-radius-xs) 0;
}
`);
add(
`.order-form__foot {
  grid-column: 1 / -1;
  display: flex; gap: .45rem; align-items: center;
}
.order-form__foot .btn--primary { flex: 1 1 auto; }
`,
`.order-form__foot {
  grid-column: 1 / -1;
  display: flex; gap: var(--ds-space-2); align-items: center;
}
.order-form__foot .btn--primary,
.order-form__foot .btn--secondary { flex: 1 1 auto; }
`);

/* 15. 自动续派开关 */
add(
`.switch {
  appearance: none;
  margin-left: auto;
  display: inline-flex; align-items: center; gap: .32rem;
  border: 1px solid rgba(251,247,239,.28);
  border-radius: 999px;
  background: transparent;
  color: rgba(251,247,239,.76);
  font-family: var(--mono);
  font-size: .66rem;
  letter-spacing: .08em;
  padding: .18rem .6rem;
  cursor: pointer;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}
.switch::before {
  content: '';
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(251,247,239,.45);
}
.switch:hover { background: rgba(251,247,239,.12); color: var(--paper); }
.switch[aria-pressed="true"] {
  background: rgba(127,192,106,.16);
  border-color: rgba(127,192,106,.55);
  color: #d6ecc9;
}
.switch[aria-pressed="true"]::before { background: #7fc06a; box-shadow: 0 0 0 2px rgba(127,192,106,.25); }
`,
`.switch {
  appearance: none;
  margin-left: auto;
  display: inline-flex; align-items: center; gap: var(--ds-space-2);
  min-height: 32px;
  border: 1px solid var(--ds-line-strong);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg);
  color: var(--ds-ink-soft);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-type-xs);
  letter-spacing: var(--ds-track-cjk);
  padding: 4px 12px;
  cursor: pointer;
  transition: background-color var(--ds-dur-fast) var(--ds-ease-veil),
    color var(--ds-dur-fast) var(--ds-ease-veil),
    border-color var(--ds-dur-fast) var(--ds-ease-veil);
}
.switch::before {
  content: '';
  width: 7px; height: 7px; border-radius: 50%;
  background: currentColor;
  opacity: .55;
  flex: none;
}
.switch:hover { background: var(--ds-surface); color: var(--ds-ink); }
.switch[aria-pressed="true"] {
  background: var(--ds-accent-soft);
  border-color: var(--ds-accent);
  color: var(--ds-accent);
}
.switch[aria-pressed="true"]::before { background: var(--ds-accent); opacity: 1; box-shadow: 0 0 0 2px color-mix(in srgb, var(--ds-accent) 25%, transparent); }
`);

/* 16. 订单卡 */
add(
`.order-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .45rem; }

.order-card {
  border: 1px solid var(--line);
  border-left: 3px solid var(--indigo-lt);
  border-radius: var(--r-sm);
  background: var(--paper);
  padding: .48rem .58rem;
  display: flex; flex-direction: column; gap: .32rem;
  transition: border-color .14s ease, background .14s ease, transform .1s ease;
}
.order-card:hover { background: var(--paper-2); }
.order-card.is-running { border-left-color: var(--ok); }
.order-card.is-done    { border-left-color: var(--ink-mute); opacity: .72; }
.order-card.is-void    { border-left-color: var(--err); }
.order-card.is-top     { border-left-color: var(--persimmon); box-shadow: 0 0 0 1px rgba(192,74,36,.18); }
`,
`.order-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--ds-space-2); }

.order-card {
  border: 1px solid var(--ds-line);
  border-left: 3px solid var(--ds-line-strong);
  border-radius: var(--ds-radius-xs);
  background: var(--ds-bg-raised);
  padding: var(--ds-space-3);
  display: flex; flex-direction: column; gap: var(--ds-space-2);
  transition: border-color var(--ds-dur-fast) var(--ds-ease-veil),
    background-color var(--ds-dur-fast) var(--ds-ease-veil);
}
.order-card:hover { background: var(--ds-bg-sunken); }
.order-card.is-running { border-left-color: var(--ds-success); }
.order-card.is-done    { border-left-color: var(--ds-ink-faint); }
.order-card.is-void    { border-left-color: var(--ds-danger); }
.order-card.is-top     { border-left-color: var(--ds-accent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--ds-accent) 22%, transparent); }
`);
add(
`.order-card__top { display: flex; align-items: center; gap: .4rem; }
.order-card__id {
  font-family: var(--mono); font-size: .66rem; color: var(--ink-mute);
  letter-spacing: .06em;
}
.order-card__name { font-size: .88rem; font-weight: 700; letter-spacing: .05em; }
.order-card__prio {
  margin-left: auto; font-family: var(--mono); font-size: .62rem;
  padding: .02rem .34rem; border-radius: 3px; border: 1px solid var(--line);
  color: var(--ink-soft); background: var(--rice);
}
.order-card__prio[data-p="1"] { background: var(--persimmon); color: #fff6ec; border-color: var(--persimmon); }
.order-card__hold {
  font-family: var(--mono); font-size: .6rem; letter-spacing: .08em;
  padding: .02rem .3rem; border-radius: 3px;
  border: 1px dashed var(--warn); color: var(--warn); background: rgba(168,112,26,.08);
}
`,
`.order-card__top { display: flex; align-items: center; gap: var(--ds-space-2); flex-wrap: wrap; }
.order-card__id {
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-faint);
  letter-spacing: var(--ds-track-mono);
}
.order-card__name { font-size: var(--ds-type-sm); font-weight: var(--ds-w-semibold); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink); }
.order-card__prio {
  margin-left: auto; font-family: var(--ds-font-mono); font-size: var(--ds-type-xs);
  padding: 1px 8px; border-radius: var(--ds-radius-pill); border: 1px solid var(--ds-line);
  color: var(--ds-ink-soft); background: var(--ds-surface);
}
.order-card__prio[data-p="1"] { background: var(--ds-accent); color: var(--ds-accent-ink); border-color: var(--ds-accent); }
.order-card__hold {
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk);
  padding: 1px 8px; border-radius: var(--ds-radius-pill);
  border: 1px dashed var(--ds-warning); color: var(--warn-ink);
  background: color-mix(in srgb, var(--ds-warning) 10%, var(--ds-bg));
}
`);
add(
`.order-card__meta {
  font-family: var(--mono); font-size: .66rem; color: var(--ink-soft);
  display: flex; flex-wrap: wrap; gap: .1rem .6rem;
}
.order-card__meta b { font-weight: 700; color: var(--ink); }
.order-card__state {
  font-size: .7rem; letter-spacing: .06em; color: var(--ink-mute);
}
.order-card__state.is-run { color: var(--ok); font-weight: 700; }
.order-card__state.is-void { color: var(--err); font-weight: 700; }
.order-card__acts { display: flex; gap: .3rem; flex-wrap: wrap; }
`,
`.order-card__meta {
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-soft);
  display: flex; flex-wrap: wrap; gap: 2px var(--ds-space-3);
}
.order-card__meta b { font-weight: var(--ds-w-bold); color: var(--ds-ink); }
.order-card__state {
  font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink-faint);
}
.order-card__state.is-run { color: var(--ok-ink); font-weight: var(--ds-w-bold); }
.order-card__state.is-void { color: var(--err-ink); font-weight: var(--ds-w-bold); }
.order-card__acts { display: flex; gap: var(--ds-space-1); flex-wrap: wrap; }
`);
add(
`.empty-note {
  margin: 1.1rem .2rem; font-size: .76rem; color: var(--ink-mute);
  text-align: center; line-height: 1.6;
}
`,
`.empty-note {
  margin: var(--ds-space-5) var(--ds-space-1); font-size: var(--ds-type-xs); color: var(--ds-ink-faint);
  text-align: center; line-height: 1.85;
}
`);

/* 17. 图例与机台矩阵 */
add(
`.legend { display: flex; gap: .7rem; flex-wrap: wrap; }
.legend__item {
  display: inline-flex; align-items: center; gap: .28rem;
  font-size: .66rem; color: rgba(251,247,239,.82); letter-spacing: .06em;
}
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dot--run   { background: #7fc06a; }
.dot--idle  { background: #9db4c8; }
.dot--warp  { background: #e2b45e; }
.dot--fault { background: #e2704f; }
.dot--stop  { background: #7b7268; }
`,
`.legend { display: flex; gap: var(--ds-space-3); flex-wrap: wrap; }
.legend__item {
  display: inline-flex; align-items: center; gap: var(--ds-space-1);
  font-size: var(--ds-type-xs); color: var(--ds-ink-soft); letter-spacing: var(--ds-track-cjk);
}
.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex: none; }
.dot--run   { background: var(--ds-success); }
.dot--idle  { background: var(--ds-info); }
.dot--warp  { background: var(--ds-warning); }
.dot--fault { background: var(--ds-danger); }
.dot--stop  { background: var(--ds-ink-faint); }
`);
add(
`.loom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: .6rem;
  align-content: start;
}
`,
`.loom-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--ds-space-3);
  align-content: start;
}
`);
add(
`.loom-grid:focus-visible {
  /* 矩阵获得键盘焦点：用内嵌虚线提示「快捷键已就绪」，不与选中态混淆 */
  outline: 1px dashed var(--indigo-lt);
  outline-offset: 2px;
}
`,
`.loom-grid:focus-visible {
  /* 矩阵获得键盘焦点：用内嵌虚线提示「快捷键已就绪」，不与选中态混淆 */
  outline: 2px dashed var(--ds-accent);
  outline-offset: 2px;
}
`);
add(
`.loom {
  position: relative;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  padding: .55rem .6rem .6rem;
  display: flex; flex-direction: column; gap: .4rem;
  cursor: pointer;
  text-align: left;
  transition: border-color .14s ease, box-shadow .14s ease, transform .12s ease, background .14s ease;
  box-shadow: var(--shadow-1);
  font: inherit;
}
.loom:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); border-color: var(--indigo-lt); }
.loom.is-selected {
  border-color: var(--indigo);
  box-shadow: 0 0 0 2px rgba(36,65,95,.24), var(--shadow-2);
}
.loom[data-state="run"]   { background: linear-gradient(180deg, #f4f8ef 0%, var(--paper) 62%); }
.loom[data-state="warp"]  { background: linear-gradient(180deg, #fbf4e4 0%, var(--paper) 62%); }
.loom[data-state="fault"] { background: linear-gradient(180deg, #fbefea 0%, var(--paper) 62%); border-color: #d9a08c; }
.loom[data-state="stop"]  { background: linear-gradient(180deg, #f0ece4 0%, var(--paper) 62%); }
.loom[data-state="idle"]  { background: linear-gradient(180deg, #f1f4f8 0%, var(--paper) 62%); }
`,
`.loom {
  position: relative;
  border: 1px solid var(--ds-line);
  border-radius: var(--ds-radius-sm);
  background: var(--ds-bg-raised);
  padding: var(--ds-space-3);
  display: flex; flex-direction: column; gap: var(--ds-space-2);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--ds-dur-fast) var(--ds-ease-veil),
    box-shadow var(--ds-dur-fast) var(--ds-ease-veil),
    transform var(--ds-dur-fast) var(--ds-ease-out),
    background-color var(--ds-dur-fast) var(--ds-ease-veil);
  box-shadow: var(--ds-shadow-1);
  font: inherit;
}
.loom:hover { transform: translateY(-2px); box-shadow: var(--ds-shadow-2); border-color: var(--ds-line-strong); }
.loom.is-selected {
  border-color: var(--ds-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ds-accent) 26%, transparent), var(--ds-shadow-2);
}
/* 机台状态底色：状态色与纸面色混合推导，不新增色板 */
.loom[data-state="run"]   { background: color-mix(in srgb, var(--ds-success) 7%, var(--ds-bg-raised)); }
.loom[data-state="warp"]  { background: color-mix(in srgb, var(--ds-warning) 9%, var(--ds-bg-raised)); }
.loom[data-state="fault"] { background: color-mix(in srgb, var(--ds-danger) 7%, var(--ds-bg-raised)); border-color: color-mix(in srgb, var(--ds-danger) 40%, var(--ds-line)); }
.loom[data-state="stop"]  { background: color-mix(in srgb, var(--ds-ink-faint) 6%, var(--ds-bg-raised)); }
.loom[data-state="idle"]  { background: color-mix(in srgb, var(--ds-info) 5%, var(--ds-bg-raised)); }
`);
add(
`.loom__head { display: flex; align-items: baseline; gap: .4rem; }
.loom__id {
  font-family: var(--mono); font-weight: 700; font-size: .86rem; color: var(--indigo);
  letter-spacing: .04em;
}
.loom__state {
  margin-left: auto; font-size: .66rem; letter-spacing: .1em;
  padding: .04rem .36rem; border-radius: 3px;
  border: 1px solid currentColor;
}
.loom[data-state="run"]   .loom__state { color: var(--ok); }
.loom[data-state="warp"]  .loom__state { color: var(--warn); }
.loom[data-state="fault"] .loom__state { color: var(--err); }
.loom[data-state="stop"]  .loom__state { color: var(--ink-mute); }
.loom[data-state="idle"]  .loom__state { color: var(--indigo-lt); }
`,
`.loom__head { display: flex; align-items: baseline; gap: var(--ds-space-2); }
.loom__id {
  font-family: var(--ds-font-mono); font-weight: var(--ds-w-bold); font-size: var(--ds-type-sm);
  color: var(--ds-ink); letter-spacing: var(--ds-track-mono);
}
.loom__state {
  margin-left: auto; font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk);
  padding: 1px 8px; border-radius: var(--ds-radius-pill);
  border: 1px solid currentColor;
}
.loom[data-state="run"]   .loom__state { color: var(--ok-ink); }
.loom[data-state="warp"]  .loom__state { color: var(--warn-ink); }
.loom[data-state="fault"] .loom__state { color: var(--err-ink); }
.loom[data-state="stop"]  .loom__state { color: var(--ds-ink-faint); }
.loom[data-state="idle"]  .loom__state { color: var(--ds-info); }
`);
add(
`.loom__order {
  font-size: .78rem; color: var(--ink-soft); line-height: 1.35;
  min-height: 1.05rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.loom__order b { color: var(--ink); font-weight: 700; }
`,
`.loom__order {
  font-size: var(--ds-type-xs); color: var(--ds-ink-soft); line-height: 1.85;
  min-height: 1.4em;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.loom__order b { color: var(--ds-ink); font-weight: var(--ds-w-bold); }
`);
add(
`.loom__bar {
  height: 5px; border-radius: 999px; background: var(--rice-warm);
  overflow: hidden; border: 1px solid var(--line-soft);
}
.loom__barfill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--indigo-mid), var(--indigo));
  transition: width .32s cubic-bezier(.4,0,.2,1);
}
.loom[data-state="run"] .loom__barfill { background: linear-gradient(90deg, #6f9d5c, var(--ok)); }
.loom[data-state="warp"] .loom__barfill { background: linear-gradient(90deg, #d9ab52, var(--warn)); }
.loom[data-state="fault"] .loom__barfill { background: linear-gradient(90deg, #d2765a, var(--err)); }
`,
`.loom__bar {
  height: 6px; border-radius: var(--ds-radius-pill); background: var(--ds-surface);
  overflow: hidden; border: 1px solid var(--ds-line);
}
.loom__barfill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, var(--ds-accent-hover), var(--ds-accent));
  transition: width var(--ds-dur-base) var(--ds-ease-veil);
}
.loom[data-state="run"] .loom__barfill { background: linear-gradient(90deg, color-mix(in srgb, var(--ds-success) 70%, var(--ds-bg)), var(--ds-success)); }
.loom[data-state="warp"] .loom__barfill { background: linear-gradient(90deg, color-mix(in srgb, var(--ds-warning) 70%, var(--ds-bg)), var(--ds-warning)); }
.loom[data-state="fault"] .loom__barfill { background: linear-gradient(90deg, color-mix(in srgb, var(--ds-danger) 70%, var(--ds-bg)), var(--ds-danger)); }
`);
add(
`.loom__stats {
  display: flex; gap: .55rem; flex-wrap: wrap;
  font-family: var(--mono); font-size: .63rem; color: var(--ink-mute);
}
.loom__stats b { color: var(--ink-soft); font-weight: 700; }
`,
`.loom__stats {
  display: flex; gap: var(--ds-space-3); flex-wrap: wrap;
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-faint);
}
.loom__stats b { color: var(--ds-ink-soft); font-weight: var(--ds-w-bold); }
`);
add(
`.loom__badge {
  position: absolute; top: -.42rem; right: .55rem;
  font-family: var(--mono); font-size: .6rem; letter-spacing: .08em;
  background: var(--persimmon); color: #fff6ec;
  padding: .04rem .34rem; border-radius: 999px;
}
`,
`.loom__badge {
  position: absolute; top: -9px; right: var(--ds-space-3);
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk);
  background: var(--ds-accent); color: var(--ds-accent-ink);
  padding: 1px 8px; border-radius: var(--ds-radius-pill);
}
`);
add(
`.loom__spark {
  display: flex; align-items: flex-end; gap: 1px; height: 16px;
}
.loom__spark i {
  flex: 1 1 0; background: var(--indigo-lt); opacity: .42; border-radius: 1px 1px 0 0;
  min-height: 1px;
}
.loom__spark i:last-child { opacity: .95; background: var(--indigo); }
`,
`.loom__spark {
  display: flex; align-items: flex-end; gap: 1px; height: 18px;
}
.loom__spark i {
  flex: 1 1 0; background: var(--ds-ink-faint); opacity: .38; border-radius: 1px 1px 0 0;
  min-height: 1px;
}
.loom__spark i:last-child { opacity: .95; background: var(--ds-accent); }
`);

/* 18. 分段控件 */
add(
`.seg {
  display: inline-flex; border: 1px solid rgba(251,247,239,.28);
  border-radius: var(--r-sm); overflow: hidden;
}
.seg__btn {
  appearance: none; border: 0; background: transparent; color: rgba(251,247,239,.76);
  padding: .22rem .58rem; font-size: .7rem; letter-spacing: .08em; cursor: pointer;
  transition: background .14s ease, color .14s ease;
}
.seg__btn + .seg__btn { border-left: 1px solid rgba(251,247,239,.22); }
.seg__btn:hover { background: rgba(251,247,239,.12); color: var(--paper); }
.seg__btn.is-on { background: var(--persimmon); color: #fff6ec; }
.seg--sm .seg__btn { padding: .16rem .44rem; font-size: .66rem; }
.seg__cap {
  display: inline-flex; align-items: center;
  padding: .16rem .5rem .16rem .42rem;
  font-size: .64rem; letter-spacing: .12em;
  color: rgba(251,247,239,.6);
  border-right: 1px solid rgba(251,247,239,.22);
  margin-right: .1rem;
}
`,
`.seg {
  display: inline-flex; border: 1px solid var(--ds-line-strong);
  border-radius: var(--ds-radius-pill); overflow: hidden;
  background: var(--ds-bg);
}
.seg__btn {
  appearance: none; border: 0; background: transparent; color: var(--ds-ink-soft);
  min-height: 30px; padding: 4px 12px; font-size: var(--ds-type-xs);
  letter-spacing: var(--ds-track-cjk); cursor: pointer;
  transition: background-color var(--ds-dur-fast) var(--ds-ease-veil), color var(--ds-dur-fast) var(--ds-ease-veil);
}
.seg__btn + .seg__btn { border-left: 1px solid var(--ds-line); }
.seg__btn:hover { background: var(--ds-surface); color: var(--ds-ink); }
.seg__btn.is-on,
.seg__btn[aria-pressed="true"] { background: var(--ds-accent); color: var(--ds-accent-ink); }
.seg--sm .seg__btn { padding: 2px 10px; font-size: var(--ds-type-xs); }
.seg__cap {
  display: inline-flex; align-items: center;
  padding: 4px 10px 4px 12px;
  font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk);
  color: var(--ds-ink-faint);
  border-right: 1px solid var(--ds-line);
  margin-right: 2px;
}
`);

/* 19. 遥测读数与图表 */
add(
`.readouts {
  display: grid; grid-template-columns: repeat(2, minmax(0,1fr));
  gap: .4rem; margin-bottom: .75rem;
}
.readout {
  border: 1px solid var(--line); border-radius: var(--r-sm);
  background: var(--paper-2); padding: .38rem .5rem;
}
.readout__k { font-size: .63rem; color: var(--ink-mute); letter-spacing: .07em; }
.readout__v {
  font-family: var(--mono); font-size: 1.02rem; font-weight: 700; color: var(--indigo);
  font-variant-numeric: tabular-nums; line-height: 1.25;
}
.readout__v small { font-size: .6rem; font-weight: 400; color: var(--ink-mute); margin-left: .18rem; }
.readout.is-warn .readout__v { color: var(--warn); }
.readout.is-err  .readout__v { color: var(--err); }
`,
`.readouts {
  display: grid; grid-template-columns: repeat(2, minmax(0,1fr));
  gap: var(--ds-space-2); margin-bottom: var(--ds-space-4);
}
.readout {
  border: 1px solid var(--ds-line); border-radius: var(--ds-radius-sm);
  background: var(--ds-bg-sunken); padding: var(--ds-space-2) var(--ds-space-3);
}
.readout__k { font-size: var(--ds-type-xs); color: var(--ds-ink-faint); letter-spacing: var(--ds-track-cjk); }
.readout__v {
  font-family: var(--ds-font-mono); font-size: var(--ds-type-h4); font-weight: var(--ds-w-bold); color: var(--ds-ink);
  font-variant-numeric: tabular-nums; line-height: 1.3;
}
.readout__v small { font-size: var(--ds-type-xs); font-weight: var(--ds-w-regular); color: var(--ds-ink-faint); margin-left: var(--ds-space-1); }
.readout.is-warn .readout__v { color: var(--warn-ink); }
.readout.is-err  .readout__v { color: var(--err-ink); }
`);
add(
`.chart { margin: 0 0 .8rem; }
.chart__cap {
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: .68rem; color: var(--ink-mute); letter-spacing: .07em; margin-bottom: .3rem;
}
.chart__unit { font-family: var(--mono); font-size: .64rem; }
.chart__canvas-wrap {
  border: 1px solid var(--line); border-radius: var(--r-sm);
  background: var(--paper-2); padding: .25rem;
}
#telemetry-chart { width: 100%; height: 128px; display: block; }
.chart-grid line { stroke: var(--line); stroke-width: .6; }
.chart-axis { stroke: var(--line); stroke-width: .8; }
.chart-line { fill: none; stroke: var(--persimmon); stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
.chart-area { fill: url(#loomdeck-fill); opacity: .28; }
.chart-dot { fill: var(--persimmon); }
.chart-label { font-family: var(--mono); font-size: 7px; fill: var(--ink-mute); }
`,
`.chart { margin: 0 0 var(--ds-space-4); }
.chart__cap {
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: var(--ds-type-xs); color: var(--ds-ink-faint); letter-spacing: var(--ds-track-cjk);
  margin-bottom: var(--ds-space-2);
}
.chart__unit { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); }
.chart__canvas-wrap {
  border: 1px solid var(--ds-line); border-radius: var(--ds-radius-sm);
  background: var(--ds-bg-sunken); padding: var(--ds-space-1);
}
#telemetry-chart { width: 100%; height: 128px; display: block; }
.chart-grid line { stroke: var(--ds-line); stroke-width: .6; }
.chart-axis { stroke: var(--ds-line-strong); stroke-width: .8; }
.chart-line { fill: none; stroke: var(--ds-accent); stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }
.chart-area { fill: url(#loomdeck-fill); opacity: .28; }
.chart-dot { fill: var(--ds-accent); }
.chart-label { font-family: var(--ds-font-mono); font-size: 10px; fill: var(--ds-ink-faint); }
`);
add(
`.bars { display: flex; flex-direction: column; gap: .26rem; }
.bar-row { display: grid; grid-template-columns: 2.6rem 1fr 2.2rem; align-items: center; gap: .4rem; }
.bar-row__id { font-family: var(--mono); font-size: .64rem; color: var(--ink-soft); }
.bar-row__track { height: 7px; background: var(--rice-warm); border: 1px solid var(--line-soft); border-radius: 999px; overflow: hidden; }
.bar-row__fill { height: 100%; width: 0%; background: var(--indigo-mid); transition: width .35s cubic-bezier(.4,0,.2,1); }
.bar-row__v { font-family: var(--mono); font-size: .62rem; color: var(--ink-mute); text-align: right; font-variant-numeric: tabular-nums; }
`,
`.bars { display: flex; flex-direction: column; gap: var(--ds-space-1); }
.bar-row { display: grid; grid-template-columns: 3rem 1fr 2.6rem; align-items: center; gap: var(--ds-space-2); }
.bar-row__id { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-soft); }
.bar-row__track { height: 8px; background: var(--ds-surface); border: 1px solid var(--ds-line); border-radius: var(--ds-radius-pill); overflow: hidden; }
.bar-row__fill { height: 100%; width: 0%; background: var(--ds-ink-soft); transition: width var(--ds-dur-base) var(--ds-ease-veil); }
.bar-row__v { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-faint); text-align: right; font-variant-numeric: tabular-nums; }
`);

/* 20. 日志带 */
add(
`.log__controls { display: flex; align-items: center; gap: .4rem; }
.log__controls .seg { border-color: rgba(251,247,239,.28); }
`,
`.log__controls { display: flex; align-items: center; gap: var(--ds-space-2); flex-wrap: wrap; }
.log__controls .seg { border-color: var(--ds-line-strong); }
`);
add(
`.log-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.log-row {
  display: grid;
  grid-template-columns: 5.4rem 3.6rem 1fr;
  gap: .55rem;
  align-items: baseline;
  padding: .16rem .3rem;
  border-radius: 2px;
  font-size: .74rem;
  animation: log-in .22s ease-out;
}
@keyframes log-in { from { opacity: 0; transform: translateX(-7px); } to { opacity: 1; transform: none; } }
.log-row__t { font-family: var(--mono); font-size: .64rem; color: var(--ink-mute); font-variant-numeric: tabular-nums; }
.log-row__src { font-family: var(--mono); font-size: .64rem; color: var(--indigo-mid); }
.log-row__msg { color: var(--ink-soft); }
.log-row[data-level="warn"]  { background: rgba(168,112,26,.09); }
.log-row[data-level="warn"] .log-row__msg { color: #7d5312; }
.log-row[data-level="error"] { background: rgba(178,58,32,.1); }
.log-row[data-level="error"] .log-row__msg { color: #8f2c17; font-weight: 700; }
.log-row[data-level="done"] .log-row__msg { color: var(--ok); }
`,
`.log-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1px; }
.log-row {
  display: grid;
  grid-template-columns: 5.6rem 4rem 1fr;
  gap: var(--ds-space-3);
  align-items: baseline;
  padding: 2px 6px;
  border-radius: var(--ds-radius-xs);
  font-size: var(--ds-type-xs);
  animation: log-in var(--ds-dur-fast) var(--ds-ease-out);
}
@keyframes log-in { from { opacity: 0; transform: translateX(-7px); } to { opacity: 1; transform: none; } }
.log-row__t { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-faint); font-variant-numeric: tabular-nums; }
.log-row__src { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-info); }
.log-row__msg { color: var(--ds-ink-soft); }
.log-row[data-level="warn"]  { background: color-mix(in srgb, var(--ds-warning) 10%, var(--ds-bg)); }
.log-row[data-level="warn"] .log-row__msg { color: var(--warn-ink); }
.log-row[data-level="error"] { background: color-mix(in srgb, var(--ds-danger) 10%, var(--ds-bg)); }
.log-row[data-level="error"] .log-row__msg { color: var(--err-ink); font-weight: var(--ds-w-bold); }
.log-row[data-level="done"] .log-row__msg { color: var(--ok-ink); }
`);

/* 21. 抽屉 */
add(
`.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(400px, 92vw);
  background: var(--paper);
  border-left: 2px solid var(--ink);
  box-shadow: -14px 0 40px -22px rgba(23,20,15,.5);
  display: flex; flex-direction: column;
  z-index: 60;
  animation: drawer-in .22s cubic-bezier(.2,.8,.3,1);
}
`,
`.drawer {
  position: fixed; top: 0; right: 0; bottom: 0; width: min(400px, 92vw);
  background: var(--ds-bg-raised);
  border-left: 1px solid var(--ds-line-strong);
  box-shadow: var(--ds-shadow-4);
  display: flex; flex-direction: column;
  z-index: var(--ds-z-overlay);
  animation: drawer-in var(--ds-dur-fast) var(--ds-ease-out);
}
`);
add(
`.drawer__head {
  display: flex; align-items: center; gap: .6rem;
  padding: .6rem .85rem; background: var(--ink); color: var(--paper);
}
.drawer__head h2 { margin: 0; font-size: .9rem; letter-spacing: .14em; }
.drawer__head .btn { margin-left: auto; border-color: rgba(251,247,239,.4); color: var(--paper); }
.drawer__head .btn:hover { background: rgba(251,247,239,.16); }
.drawer__body { flex: 1 1 auto; overflow-y: auto; padding: .85rem; }
`,
`.drawer__head {
  display: flex; align-items: center; gap: var(--ds-space-3);
  padding: var(--ds-space-3) var(--ds-space-4);
  background: var(--ds-surface); color: var(--ds-ink);
  border-bottom: 1px solid var(--ds-line);
}
.drawer__head h2 { margin: 0; font-size: var(--ds-type-sm); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink); }
.drawer__head .btn { margin-left: auto; }
.drawer__body { flex: 1 1 auto; overflow-y: auto; padding: var(--ds-space-4); }
`);
add(
`.dsec { margin-bottom: 1rem; }
.dsec__h {
  font-size: .68rem; letter-spacing: .14em; color: var(--ink-mute);
  border-bottom: 1px solid var(--line); padding-bottom: .25rem; margin-bottom: .45rem;
  font-weight: 700;
}
.dl { display: grid; grid-template-columns: 5.6rem 1fr; gap: .2rem .5rem; margin: 0; font-size: .78rem; }
.dl dt { color: var(--ink-mute); font-size: .72rem; }
.dl dd { margin: 0; font-family: var(--mono); font-size: .76rem; color: var(--ink); font-variant-numeric: tabular-nums; }
`,
`.dsec { margin-bottom: var(--ds-space-4); }
.dsec__h {
  font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink-soft);
  border-bottom: 1px solid var(--ds-line); padding-bottom: var(--ds-space-1); margin-bottom: var(--ds-space-2);
  font-weight: var(--ds-w-semibold);
}
.dl { display: grid; grid-template-columns: 6rem 1fr; gap: var(--ds-space-1) var(--ds-space-2); margin: 0; font-size: var(--ds-type-xs); }
.dl dt { color: var(--ds-ink-faint); font-size: var(--ds-type-xs); }
.dl dd { margin: 0; font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink); font-variant-numeric: tabular-nums; }
`);
add(
`.dspark { width: 100%; height: 62px; display: block; border: 1px solid var(--line); border-radius: var(--r-sm); background: var(--paper-2); }
.dspark path { fill: none; stroke: var(--persimmon); stroke-width: 1.5; }
.dspark line { stroke: var(--line); stroke-width: .6; }
`,
`.dspark { width: 100%; height: 62px; display: block; border: 1px solid var(--ds-line); border-radius: var(--ds-radius-sm); background: var(--ds-bg-sunken); }
.dspark path { fill: none; stroke: var(--ds-accent); stroke-width: 1.5; }
.dspark line { stroke: var(--ds-line); stroke-width: .6; }
`);
add(
`.devent {
  font-size: .72rem; padding: .2rem 0; border-bottom: 1px dashed var(--line-soft);
  display: grid; grid-template-columns: 4.6rem 1fr; gap: .5rem;
}
.devent__t { font-family: var(--mono); font-size: .62rem; color: var(--ink-mute); }
.devent__m { color: var(--ink-soft); }
`,
`.devent {
  font-size: var(--ds-type-xs); padding: var(--ds-space-1) 0; border-bottom: 1px dashed var(--ds-line);
  display: grid; grid-template-columns: 5rem 1fr; gap: var(--ds-space-2);
}
.devent__t { font-family: var(--ds-font-mono); font-size: var(--ds-type-xs); color: var(--ds-ink-faint); }
.devent__m { color: var(--ds-ink-soft); }
`);

/* 22. 弹窗 */
add(
`.modal {
  position: fixed; inset: 0; z-index: 80;
  background: rgba(23,20,15,.52);
  display: grid; place-items: center; padding: 1.2rem;
  animation: fade .16s ease-out;
}
`,
`.modal {
  position: fixed; inset: 0; z-index: var(--ds-z-modal);
  background: var(--ds-overlay);
  display: grid; place-items: center; padding: var(--ds-space-5);
  animation: fade var(--ds-dur-instant) var(--ds-ease-out);
}
`);
add(
`.modal__panel {
  background: var(--paper); border: 2px solid var(--ink); border-radius: var(--r-lg);
  max-width: 460px; width: 100%; box-shadow: 0 22px 50px -18px rgba(23,20,15,.6);
}
.modal__head { display: flex; align-items: center; gap: .6rem; padding: .7rem .95rem; border-bottom: 1px solid var(--line); }
.modal__head h2 { margin: 0; font-size: 1rem; letter-spacing: .14em; }
.modal__head .btn { margin-left: auto; }
.modal__body { padding: .9rem .95rem 1rem; }
`,
`.modal__panel {
  background: var(--ds-bg-raised); border: 1px solid var(--ds-line); border-radius: var(--ds-radius-md);
  max-width: 460px; width: 100%; box-shadow: var(--ds-shadow-4);
}
.modal__head { display: flex; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-3) var(--ds-space-4); border-bottom: 1px solid var(--ds-line); }
.modal__head h2 { margin: 0; font-size: var(--ds-type-body); letter-spacing: var(--ds-track-cjk); color: var(--ds-ink); }
.modal__head .btn { margin-left: auto; }
.modal__body { padding: var(--ds-space-4); }
`);
add(
`.keys { display: grid; grid-template-columns: auto 1fr; gap: .42rem .8rem; margin: 0; font-size: .8rem; }
.keys dt { white-space: nowrap; }
.keys dd { margin: 0; color: var(--ink-soft); }
.keys__note {
  margin: .7rem 0 0;
  padding-top: .55rem;
  border-top: 1px dashed var(--line);
  font-size: .72rem;
  color: var(--ink-mute);
  line-height: 1.55;
}
kbd {
  font-family: var(--mono); font-size: .7rem;
  border: 1px solid var(--ink-mute); border-bottom-width: 2px;
  border-radius: 3px; padding: .04rem .3rem; background: var(--paper-2); color: var(--ink);
}
`,
`.keys { display: grid; grid-template-columns: auto 1fr; gap: var(--ds-space-2) var(--ds-space-4); margin: 0; font-size: var(--ds-type-sm); }
.keys dt { white-space: nowrap; }
.keys dd { margin: 0; color: var(--ds-ink-soft); }
.keys__note {
  margin: var(--ds-space-3) 0 0;
  padding-top: var(--ds-space-3);
  border-top: 1px dashed var(--ds-line);
  font-size: var(--ds-type-xs);
  color: var(--ds-ink-faint);
  line-height: 1.85;
}
kbd {
  font-family: var(--ds-font-mono); font-size: var(--ds-type-xs);
  border: 1px solid var(--ds-line-strong); border-bottom-width: 2px;
  border-radius: var(--ds-radius-xs); padding: 2px 6px; background: var(--ds-bg-sunken); color: var(--ds-ink);
}
`);

/* 23. Toast */
add(
`.toast-stack {
  position: fixed; right: 1rem; bottom: 1rem; z-index: 90;
  display: flex; flex-direction: column; gap: .4rem; align-items: flex-end;
  pointer-events: none;
}
.toast {
  background: var(--ink); color: var(--paper);
  border-left: 3px solid var(--persimmon);
  border-radius: var(--r-sm);
  padding: .46rem .72rem; font-size: .76rem; letter-spacing: .03em;
  box-shadow: 0 10px 26px -12px rgba(23,20,15,.65);
  animation: toast-in .2s cubic-bezier(.2,.8,.3,1);
  max-width: 320px;
  /* 容器 pointer-events:none，只让 toast 自身可点（否则「撤销」按钮点不到） */
  pointer-events: auto;
}
.toast.is-err { border-left-color: #e2704f; }
.toast.is-ok  { border-left-color: #7fc06a; }
.toast__msg { line-height: 1.45; }
.toast__act {
  appearance: none;
  margin-left: .6rem;
  padding: .1rem .42rem;
  border: 1px solid rgba(251,247,239,.45);
  border-radius: 3px;
  background: transparent;
  color: var(--paper);
  font-family: var(--mono);
  font-size: .68rem;
  letter-spacing: .08em;
  cursor: pointer;
}
.toast__act:hover { background: rgba(255,255,255,.16); }
`,
`.toast-stack {
  position: fixed; right: var(--ds-space-4); bottom: var(--ds-space-4); z-index: var(--ds-z-toast);
  display: flex; flex-direction: column; gap: var(--ds-space-2); align-items: flex-end;
  pointer-events: none;
}
.toast {
  background: var(--ds-ink); color: var(--ds-bg);
  border-left: 3px solid var(--ds-accent);
  border-radius: var(--ds-radius-sm);
  padding: var(--ds-space-2) var(--ds-space-3); font-size: var(--ds-type-xs); letter-spacing: var(--ds-track-cjk);
  box-shadow: var(--ds-shadow-3);
  animation: toast-in var(--ds-dur-fast) var(--ds-ease-out);
  max-width: 320px;
  /* 容器 pointer-events:none，只让 toast 自身可点（否则「撤销」按钮点不到） */
  pointer-events: auto;
}
.toast.is-err { border-left-color: var(--ds-danger); }
.toast.is-ok  { border-left-color: var(--ds-success); }
.toast__msg { line-height: 1.85; }
.toast__act {
  appearance: none;
  margin-left: var(--ds-space-3);
  min-height: 28px;
  padding: 2px 10px;
  border: 1px solid color-mix(in srgb, var(--ds-bg) 45%, transparent);
  border-radius: var(--ds-radius-pill);
  background: transparent;
  color: var(--ds-bg);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-type-xs);
  letter-spacing: var(--ds-track-cjk);
  cursor: pointer;
}
.toast__act:hover { background: color-mix(in srgb, var(--ds-bg) 16%, transparent); }
`);

/* 24. 响应式 */
add(
`  .masthead { grid-template-columns: 1fr auto; row-gap: .6rem; }
  .masthead__stats { grid-column: 1 / -1; order: 3; gap: 1.2rem; }
`,
`  .masthead { grid-template-columns: 1fr auto; row-gap: var(--ds-space-2); }
  .masthead__stats { grid-column: 1 / -1; order: 3; gap: var(--ds-space-4); }
`);
add(
`  .loom-grid { grid-template-columns: repeat(auto-fill, minmax(158px, 1fr)); }
  .masthead { grid-template-columns: 1fr; }
  .masthead__actions { justify-content: flex-start; }
  .masthead__stats { grid-template-columns: repeat(2, 1fr); display: grid; gap: .5rem 1rem; }
`,
`  .loom-grid { grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); }
  .masthead { grid-template-columns: 1fr; }
  .masthead__actions { justify-content: flex-start; }
  .masthead__stats { grid-template-columns: repeat(2, 1fr); display: grid; gap: var(--ds-space-2) var(--ds-space-4); }
`);
add(
`@media (max-width: 520px) {
  .masthead { padding: .7rem .9rem; }
  .masthead h1 { font-size: 1.1rem; letter-spacing: .1em; }
  .brand-mark { width: 34px; height: 34px; }
  .panel__head { flex-wrap: wrap; }
  .panel__head .legend, .panel__head .log__controls, .panel__head .seg { margin-left: 0; width: 100%; }
  .order-form { grid-template-columns: 1fr; }
  .loom-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .45rem; }
  .loom { padding: .45rem .5rem; }
  .loom__order { font-size: .72rem; -webkit-line-clamp: 3; }
  .log-row { grid-template-columns: 4.6rem 1fr; }
  .log-row__src { display: none; }
  .readouts { grid-template-columns: 1fr; }
  .btn { padding: .46rem .7rem; font-size: .8rem; }
  .btn--tiny { padding: .3rem .5rem; }
}
`,
`@media (max-width: 520px) {
  .masthead { padding: var(--ds-space-3); }
  .masthead h1 { font-size: var(--ds-type-h4); }
  .brand-mark { width: 32px; height: 32px; }
  .panel__head { flex-wrap: wrap; }
  .panel__head .legend, .panel__head .log__controls, .panel__head .seg { margin-left: 0; width: 100%; }
  .order-form { grid-template-columns: 1fr; }
  .loom-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--ds-space-2); }
  .loom { padding: var(--ds-space-2); }
  .loom__order { -webkit-line-clamp: 3; }
  .log-row { grid-template-columns: 5rem 1fr; }
  .log-row__src { display: none; }
  .readouts { grid-template-columns: 1fr; }
  .btn { padding: var(--ds-space-2) var(--ds-space-3); }
}
`);
add(
`@media (hover: none) and (pointer: coarse) {
  .btn--tiny { padding: .42rem .7rem; }
  .seg__btn { padding: .34rem .68rem; }
  .order-card__acts .btn--tiny { padding: .38rem .6rem; }
}
`,
`/* 触控设备：点按目标放大到 40px（≥ --ds-target-min 24px） */
@media (hover: none) and (pointer: coarse) {
  .btn--tiny { min-height: 40px; }
  .seg__btn { min-height: 40px; }
  .order-card__acts .btn--tiny { min-height: 40px; }
}
`);

/* 25. reduced-motion 已在 ds-components.css 统一提供 */
add(
`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`,
`/* prefers-reduced-motion 降级见 ds-components.css */
`);

/* ── 执行替换 ─────────────────────────────────────────────────────────── */
let failed = 0;
P.forEach(([oldText, newText, expect], i) => {
  const count = css.split(oldText).length - 1;
  if (count !== expect) {
    failed += 1;
    console.error(`✗ 第 ${i + 1} 条替换命中 ${count} 次（期望 ${expect}）：\n${oldText.slice(0, 90)}…`);
    return;
  }
  css = css.replace(oldText, newText);
});

if (failed) {
  console.error(`\n✗ ${failed} 条替换未命中，未写入文件。`);
  process.exit(1);
}

css = css.replace(
  '/* ═══════════════════════════════════════════════════════════════\n   织造车间调度台 · LOOMDECK\n   视觉语言',
  `${MARK}\n/* ═══════════════════════════════════════════════════════════════\n   织造车间调度台 · LOOMDECK\n   视觉语言`,
);

fs.writeFileSync(FILE, css, 'utf8');
console.log(`✓ 已应用 ${P.length} 条视觉替换 → src/styles.css`);
