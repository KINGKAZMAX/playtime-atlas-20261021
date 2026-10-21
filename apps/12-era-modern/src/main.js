import './styles/tokens.css';
import './styles/base.css';
import './styles/hall.css';
import './styles/rhythm.css';
import './styles/puzzle.css';
import './styles/vr.css';
// 中文排版修正层必须**最后**加载（与既有类名选择器特异度相同时靠顺序决胜）
import './styles/cjk.css';

import { getSettings, applySettingsToDocument } from './core/settings.js';
import { preloadFonts } from './core/fonts.js';
import { bus } from './core/bus.js';
import { publishState } from './core/debug-state.js';
import { buildShell } from './ui/shell.js';
import { startRouter, onRouteChange, navigate } from './ui/router.js';
import { clear, scrollToTop } from './core/dom.js';

import { mountHall } from './views/hall.js';
import { mountPulse } from './rhythm/pulse.js';
import { mountAtrium } from './puzzle/atrium.js';
import { mountHalo } from './vr/halo.js';

const ROUTES = {
  '/': mountHall,
  '/pulse': mountPulse,
  '/atrium': mountAtrium,
  '/halo': mountHalo,
};

const main = document.getElementById('main');
let cleanup = null;

function mountRoute(path) {
  if (cleanup) {
    try {
      cleanup();
    } catch (err) {
      console.error('[app] 卸载上一个视图失败', err);
    }
    cleanup = null;
  }
  clear(main);

  const factory = ROUTES[path] || ROUTES['/'];
  if (!ROUTES[path]) {
    // 未知路径回退到展厅首页
    navigate('/');
    return;
  }
  publishState({ route: path, state: 'idle' });
  try {
    cleanup = factory(main) || null;
    scrollToTop();
  } catch (err) {
    console.error('[app] 视图挂载失败', err);
    main.appendChild(
      Object.assign(document.createElement('div'), {
        className: 'wrap hall-section',
        textContent: '展项加载失败，请返回展厅重试。',
      }),
    );
  }
}

function boot() {
  applySettingsToDocument(getSettings());
  bus.on('settings:change', (settings) => applySettingsToDocument(settings));

  // 预热自托管字体（含 Canvas 用到的等宽体粗字重），避免绘制时静默回落系统字体
  preloadFonts();

  buildShell();
  onRouteChange(mountRoute);
  startRouter();

  window.addEventListener('error', (event) => {
    console.error('[app] 未捕获错误', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[app] 未处理的 Promise 拒绝', event.reason);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
