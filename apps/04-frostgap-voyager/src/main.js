import './styles.css';
import { Game } from './game/Game.js';
import { initLang, setLang, getLang, onLangChange } from './i18n/index.js';

/* 语言在游戏实例之前初始化：界面静态文案与 <html lang> 先就位，
   避免首帧出现中英混排（DESIGN-SPEC §4.3 / §11.2）。 */
initLang();

/**
 * 语言切换控件（DESIGN-SPEC §4.3：chip 风格，标注「中 / EN」）。
 *
 * 同一组控件在页面上有三个实例：
 *   · 浮层版（视口右上角，飞行中可见）
 *   · 主菜单卡内行内版
 *   · 暂停设置卡内行内版
 * 行内版在对话框内部，因此位于焦点陷阱内、键盘可达，也不会被模态遮罩盖住。
 * 这里用事件委托统一处理，任何一个实例被点击都会切换全部实例的 aria-pressed。
 */
function wireLangSwitch() {
  const sync = () => {
    const cur = getLang();
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === cur));
    });
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    setLang(btn.dataset.lang);
  });
  onLangChange(sync);
  sync();
}

wireLangSwitch();

const game = new Game();

// Exposed for debugging / automated checks.
//
// NOTE: the property name is intentionally kept as `__deepSpaceDrifter` even
// though the work was rebranded to 《霜隙远航 · Frostgap Voyager》. The
// automated QA harness (13-qa-curation/qa-harness/lib/probes.mjs) reads this
// exact global by literal name, and renaming it would break its D3 / D4 / D5
// checks. It is a technical contract, not a user-facing name: it never appears
// in the UI, copy, palette, layout or models. See SOURCE-AND-DIFFERENCES.md §3.7.
window.__deepSpaceDrifter = game;

game.init().catch((err) => {
  console.error('[Frostgap Voyager] failed to start', err);
  const text = document.getElementById('loadText');
  if (text) {
    text.textContent = `启动失败：${err && err.message ? err.message : err}`;
    text.style.color = '#ff5f6b';
  }
});
