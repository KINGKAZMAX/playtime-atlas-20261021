/**
 * 主题接入 · 把 07-museum-art 的设计令牌与自托管字体接入主站
 *
 * 07 交付 `design-tokens.json` 与 `tokens.css` / `fonts.css`（均为 OFL 许可字体）。
 * 本模块在运行时把 07 的令牌映射到本馆自己的 CSS 变量上，
 * 这样 07 更新令牌后主站自动跟随，而本目录的 tokens.css 始终作为兜底。
 *
 * 若 07 尚未交付，模块静默降级为主站自带令牌，不影响任何功能。
 */

const BASE = (import.meta.env?.BASE_URL ?? './').replace(/\/*$/, '/');

/** 07 令牌 → 本馆 CSS 变量 的映射表 */
function buildMap(t) {
  const c = t.color ?? {};
  const s = t.semantic ?? {};
  const ty = t.typography ?? {};
  const sp = t.space ?? {};
  const r = t.radius ?? {};
  const sh = t.shadow ?? {};
  const mo = t.motion ?? {};
  const z = t.z ?? {};

  const map = {
    // 语义色
    '--bg-app': s.bgBase,
    '--bg-sunken': s.bgDeep,
    '--bg-panel': s.bgPanel,
    '--bg-panel-2': s.bgRaised,
    '--bg-raised': c.ink?.['600'],
    '--bg-paper': c.paper?.['100'],
    '--bg-paper-2': c.paper?.['200'],

    '--text-strong': s.textPrimary,
    '--text-body': s.textSecondary,
    '--text-muted': s.textMuted,
    '--text-faint': c.paper?.['500'],
    '--text-on-paper': c.ink?.['900'],
    '--text-on-paper-muted': c.ink?.['700'],

    '--accent': s.accent,
    '--accent-deep': s.accentDeep,
    '--signal-500': s.accent,
    '--signal-600': s.accentDeep,
    '--signal-400': s.accentSoft,
    '--signal-300': s.accentSoft,
    '--ok-500': s.positive,

    '--line': s.hairline,
    '--line-strong': s.hairlineStrong,
    '--line-warm': s.hairline,

    // 字体
    '--font-display': ty.fontFamily?.display,
    '--font-text': ty.fontFamily?.sans,
    '--font-mono': ty.fontFamily?.mono,

    // 间距（本馆 --sp-N ↔ 07 space.N）
    '--sp-1': sp['1'],
    '--sp-2': sp['2'],
    '--sp-3': sp['3'],
    '--sp-4': sp['4'],
    '--sp-5': sp['5'],
    '--sp-6': sp['6'],
    '--sp-7': sp['8'],
    '--sp-8': sp['9'],
    '--sp-9': sp['10'],

    // 圆角
    '--r-xs': r.xs,
    '--r-sm': r.sm,
    '--r-md': r.md,
    '--r-lg': r.lg,
    '--r-pill': r.pill,

    // 阴影
    '--shadow-low': sh.sm,
    '--shadow-mid': sh.md,
    '--shadow-high': sh.lg,
    '--glow-signal': sh.glow,

    // 动效
    '--dur-1': mo.instant,
    '--dur-2': mo.base,
    '--dur-3': mo.slow,
    '--ease-out': mo.easeOut,
    '--ease-in-out': mo.easeInOut,

    // 层级
    '--z-nav': `${z.sticky ?? 40}`,
    '--z-panel': `${z.overlay ?? 60}`,
    '--z-modal': `${z.modal ?? 80}`,
    '--z-toast': `${z.toast ?? 95}`,
  };

  // 去掉空值，避免把变量覆盖成 undefined
  return Object.fromEntries(Object.entries(map).filter(([, v]) => typeof v === 'string' && v.length));
}

async function exists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 应用主题
 * @returns {{tokens: boolean, fonts: boolean, meta: object|null}}
 */
export async function applyTheme() {
  const result = { tokens: false, fonts: false, meta: null };

  // 1) 自托管字体（OFL，来自 07 美术包）
  const fontsCss = `${BASE}art/assets/fonts/fonts.css`;
  if (await exists(fontsCss)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontsCss;
    link.dataset.source = '07-museum-art';
    document.head.appendChild(link);
    result.fonts = true;
  }

  // 2) 设计令牌
  try {
    const res = await fetch(`${BASE}data/design-tokens.json`, { cache: 'no-cache' });
    if (res.ok) {
      const tokens = await res.json();
      const map = buildMap(tokens);
      const root = document.documentElement;
      for (const [k, v] of Object.entries(map)) root.style.setProperty(k, v);
      result.tokens = Object.keys(map).length > 0;
      result.meta = tokens.meta ?? null;
    }
  } catch {
    /* 保持本馆自带令牌 */
  }

  return result;
}
