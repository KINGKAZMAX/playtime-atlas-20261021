import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';

import './styles/tokens.css';
import './styles/base.css';
import './styles/hall.css';
import './styles/rhythm.css';
import './styles/puzzle.css';
import './styles/vr.css';

import { getSettings, applySettingsToDocument } from './core/settings.js';
import { bus } from './core/bus.js';
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
