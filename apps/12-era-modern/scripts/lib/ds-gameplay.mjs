/* ==========================================================================
 * 设计系统验收 · 玩法可玩性探针（共享断言层 · 玩法侧）
 * --------------------------------------------------------------------------
 * 页面内表达式一律写成**自包含的 IIFE 字符串**：不引用模块作用域，
 * 满足 Ego `page.evaluate` 的约束（tools/ego-qa/MIGRATION.md §1 ②）。
 * ========================================================================== */

/** 大厅：时间轴 / 来源链接 / 纯文本目录 / 展项卡 / 设置入口 */
export const HALL_PROBE_EXPR = `(() => {
  const main = document.getElementById('main');
  const text = (main ? main.textContent : document.body.textContent) || '';
  const all = Array.from(document.querySelectorAll('#main a[href]'));
  const ext = all.filter((a) => /^https?:/i.test(a.getAttribute('href') || ''));
  return {
    title: (document.querySelector('.hero-title, .ds-cover__title') || {}).textContent || '',
    exhibitCards: document.querySelectorAll('.ds-work').length,
    timelineItems: document.querySelectorAll('.tl-item, .timeline-item, [class*="timeline"] li').length,
    sourceLinks: ext.length,
    catalogItems: document.querySelectorAll('.catalog-list li').length,
    settingsButton: !!document.getElementById('open-settings'),
    hasSkipLink: !!document.querySelector('.ds-skip'),
    bodyClass: document.body.className,
    lang: document.documentElement.lang,
    theme: document.documentElement.getAttribute('data-ds-theme'),
    textLength: text.length,
  };
})()`;

/** 设置面板：开关数量与当前状态（面板容器为 .modal，位于 .modal-backdrop 内） */
export const SETTINGS_PROBE_EXPR = `(() => {
  const panel = document.querySelector('.modal-backdrop .modal, .modal');
  if (!panel) return { open: false };
  const toggles = Array.from(panel.querySelectorAll('[aria-pressed]'));
  return {
    open: true,
    toggleCount: toggles.length,
    toggles: toggles.map((t) => ({
      label: (t.getAttribute('aria-label') || t.textContent || '').trim().slice(0, 20),
      pressed: t.getAttribute('aria-pressed'),
    })),
    hasRange: !!panel.querySelector('input[type="range"]'),
  };
})()`;

/** 可观测游戏状态（window.__eraGame）+ 画布绘制 */
export const GAME_STATE_EXPR = `(() => {
  const g = window.__eraGame || null;
  const cands = Array.from(document.querySelectorAll('.ds-canvas-frame canvas, #main canvas, canvas'));
  const c = cands.find((x) => { const r = x.getBoundingClientRect(); return r.width > 10 && r.height > 10; }) || cands[0] || null;
  let painted = false;
  let paintedLen = 0;
  if (c) {
    try { const d = c.toDataURL('image/png'); paintedLen = d.length; painted = d.length > 2000; } catch (e) { painted = false; }
  }
  return {
    hasState: !!g,
    state: g ? g.state : null,
    score: g ? (g.score !== undefined ? g.score : null) : null,
    player: g && g.player ? {
      presses: g.player.presses !== undefined ? g.player.presses : null,
      x: g.player.x !== undefined ? g.player.x : null,
      y: g.player.y !== undefined ? g.player.y : null,
    } : null,
    canvasFound: !!c,
    canvasPainted: painted,
    canvasLen: paintedLen,
    hudText: (document.querySelector('.ds-canvas-frame__hud, [class*="hud"]') || {}).textContent || '',
    hasGameRoot: !!document.querySelector('[data-game-root]'),
    gameRootFocusable: (function () {
      const r = document.querySelector('[data-game-root]');
      return !!(r && (r.getAttribute('tabindex') !== null));
    })(),
  };
})()`;

/** 折光阁：WebGL / 图例 / 关卡页签 / 操作按钮 */
export const ATRIUM_PROBE_EXPR = `(() => {
  const c = document.querySelector('.atrium-canvas, .ds-canvas-frame canvas');
  let webgl = false;
  if (c) {
    try { webgl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { webgl = false; }
  }
  const legend = document.querySelector('.ds-diagram');
  // 「重置」按钮的 data-control 是 restart（与脉冲的 restart 同名），不是 reset
  const byText = (t) => Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').trim() === t) || null;
  return {
    canvas: !!c,
    webgl,
    tabs: document.querySelectorAll('.atrium-tab, [class*="tab"]').length,
    controls: {
      hint: !!document.querySelector('[data-control="hint"], [data-act="hint"]'),
      undo: !!document.querySelector('[data-control="undo"], [data-act="undo"]'),
      reset: !!document.querySelector('[data-control="reset"], [data-act="reset"]') || !!byText('重置'),
      view: !!document.querySelector('[data-control="view"], [data-act="view"]') || !!byText('视角复位'),
    },
    legendPresent: !!legend,
    legendText: legend ? (legend.textContent || '').trim().slice(0, 40) : '',
    progressKeys: Object.keys(localStorage).filter((k) => k.indexOf('prismera') === 0),
  };
})()`;

/** 光环台：诚实声明 / 设备支持状态表 / WebXR 实测结果 / 热点展签 */
export const HALO_PROBE_EXPR = `(() => {
  const main = document.getElementById('main');
  const text = (main ? main.textContent : '') || '';
  // WebXR 检测按钮的 data-control 是 detect-vr
  const res = document.querySelector('[data-control="detect-vr"], [data-act="detect-vr"]');
  // 「支持 VR 头显」若前面带「不」是否定表述，不算虚假宣称
  const claimsVr = /(?<![不未])支持\\s*VR\\s*头显/.test(text)
    || /已适配头显/.test(text)
    || /沉浸式体验应用/.test(text);
  return {
    canvas: !!document.querySelector('.halo-canvas, .ds-canvas-frame canvas'),
    disclaimerPresent: /不支持\\s*VR|未接入\\s*WebXR|桌面端交互演示/.test(text),
    deviceRows: document.querySelectorAll('.device-list li').length,
    deviceRowsText: Array.from(document.querySelectorAll('.device-list li')).map((li) => (li.textContent || '').trim()).slice(0, 6),
    webxrButton: !!res,
    webxrButtonText: res ? (res.textContent || '').trim().slice(0, 30) : '',
    webxrResult: (document.querySelector('.device-status') || {}).textContent || '',
    hotspotCards: document.querySelectorAll('.halo-card, [class*="hotspot"]').length,
    saysVrSupported: claimsVr,
  };
})()`;

/** localStorage 存档键 */
export const STORAGE_PROBE_EXPR = `(() => {
  const out = {};
  for (const k of Object.keys(localStorage)) {
    if (k.indexOf('prismera') !== 0) continue;
    const v = localStorage.getItem(k) || '';
    out[k] = v.length > 400 ? v.slice(0, 400) + '…' : v;
  }
  return { keys: Object.keys(out), values: out };
})()`;

/** AudioContext 构造计数（需在导航前注入，见 DRIVER 的 Page.addScriptToEvaluateOnNewDocument） */
export const AUDIO_COUNT_EXPR = `(() => ({
  created: window.__audioCreatedCount || 0,
  ctxCount: (typeof window.__audioContexts !== 'undefined' ? window.__audioContexts.length : 0),
}))()`;
