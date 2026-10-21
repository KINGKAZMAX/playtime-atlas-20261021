/**
 * 霓虹街廊 · 街机可玩展厅
 * src/main.js — 应用外壳
 *
 * 职责：场景调度、暂停/重开/结算流程、设置持久化、CRT 开关、
 *       触屏控件、展品目录、深链（?game=lattice / ?game=meteor）。
 *
 * 运行期零网络请求：无 CDN、无在线 API、无外部字体与图片。
 */

import './styles.css';

import { createLoop } from './core/loop.js';
import { createInput } from './core/input.js';
import { createAudio } from './core/audio.js';
import { store } from './core/storage.js';
import { createHall } from './hall/hall.js';
import { createLattice } from './games/lattice.js';
import { createMeteor } from './games/meteor.js';
import { createPanels } from './ui/panels.js';
import { createTouchPad } from './ui/touch.js';
import { EXHIBITS, HALL_NAME } from './hall/exhibits.js';
import { applyLang, detectLang, getLang, t } from './i18n/strings.js';

const W = 480;
const H = 270;

const dom = {
  stage: document.getElementById('stage'),
  canvas: document.getElementById('view'),
  overlay: document.getElementById('overlay'),
  touchpad: document.getElementById('touchpad'),
  status: document.getElementById('statusline'),
  exhibitNav: document.getElementById('exhibit-nav'),
  btnSound: document.getElementById('btn-sound'),
  btnLang: document.getElementById('btn-lang'),
  indicatorDots: document.getElementById('indicator-dots'),
  indicatorText: document.getElementById('indicator-text'),
  btnCrt: document.getElementById('btn-crt'),
  btnSettings: document.getElementById('btn-settings'),
  btnCatalog: document.getElementById('btn-catalog'),
  btnTouch: document.getElementById('btn-touch'),
  btnPause: document.getElementById('btn-pause'),
  hallTitle: document.getElementById('hall-title'),
};

const ctx = dom.canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

/* ------------------------------ 设置 ------------------------------ */

const settings = Object.assign(
  { crt: true, muted: false, difficulty: 1, demo: false },
  store.get('settings', {}),
);

const audio = createAudio();
audio.setMuted(settings.muted);

const input = createInput({
  stage: dom.stage,
  onFirstGesture: () => {
    audio.unlock();
    if (app.mode === 'hall') audio.music.play('hall');
  },
});
input.attachStage();

/* ------------------------------ 应用状态 ------------------------------ */

const app = {
  mode: 'hall',
  scene: null,
  sceneKey: null,
  gamePaused: false,
  booted: false,
};

// panels / touchPad 在 shell 定义之后才实例化（shell 需被传参给它们）
let panels = null;
let touchPad = null;

/* ------------------------------ 外壳接口 ------------------------------ */

const shell = {
  get settings() {
    return settings;
  },
  audio,
  goTo(key) {
    if (key === 'hall') {
      app.mode = 'hall';
      app.sceneKey = 'hall';
      app.scene = createHall(shell);
      app.gamePaused = false;
      setStatus(t('statusHall'));
      touchPad.setProfile('hall');
      setQuery(null);
      if (!settings.muted) audio.music.play('hall');
      syncChrome();
    } else if (key === 'lattice' || key === 'meteor') {
      app.mode = 'game';
      app.sceneKey = key;
      app.gamePaused = false;
      app.scene = key === 'lattice' ? createLattice(shell) : createMeteor(shell);
      app.scene.begin();
      setStatus(t(key === 'lattice' ? 'statusLattice' : 'statusMeteor'));
      touchPad.setProfile(key);
      setQuery(key);
      syncChrome();
    }
  },
  openChronicle() {
    panels.showChronicle();
  },
  openLedger() {
    panels.showLedger();
  },
  gameOver(data) {
    app.gamePaused = true;
    panels.showGameOver(data);
  },
  resume() {
    app.gamePaused = false;
    // 关闭暂停面板：close() 幂等，且会把焦点归还给触发元素（舞台）并恢复键盘输入。
    // 面板内「继续」按钮走同一条路径；顶栏暂停键也复用它，避免出现「已恢复但遮罩仍在」。
    panels.close();
    if (app.mode === 'game' && app.scene && app.scene.onResume) app.scene.onResume();
    if (app.mode === 'hall' && !settings.muted) audio.music.play('hall');
  },
  restart() {
    if (app.mode === 'game' && app.scene && app.scene.restart) {
      app.scene.restart();
      app.gamePaused = false;
      if (!settings.muted) audio.music.play(app.sceneKey);
    }
  },
  setCrt(v) {
    settings.crt = !!v;
    store.set('settings', settings);
    applyCrt();
  },
  setMuted(v) {
    settings.muted = !!v;
    store.set('settings', settings);
    audio.setMuted(settings.muted);
    if (!settings.muted) {
      audio.unlock();
      if (app.mode === 'hall') audio.music.play('hall');
      else if (app.mode === 'game' && !app.gamePaused) audio.music.play(app.sceneKey);
    }
  },
  setDemo(v) {
    settings.demo = !!v;
    store.set('settings', settings);
  },
  setDifficulty(v) {
    settings.difficulty = Math.max(0, Math.min(2, Number(v) || 0));
    store.set('settings', settings);
  },
  onPanelClosed() {
    if (!app.gamePaused && app.mode === 'game' && app.scene && app.scene.onResume) {
      app.scene.onResume();
    }
    input.enable();
  },
};

panels = createPanels(shell, dom.overlay);

touchPad = createTouchPad(dom.touchpad, input, {
  onAction: (name) => {
    if (app.scene && app.scene.touchAction) app.scene.touchAction(name);
  },
});

/* ------------------------------ 界面同步 ------------------------------ */

function setStatus(html) {
  dom.status.innerHTML = html;
}

function applyCrt() {
  document.body.classList.toggle('crt-on', settings.crt);
  dom.btnCrt.setAttribute('aria-pressed', String(settings.crt));
  syncToggleLabels();
}

/** 同步顶栏开关按钮文案（随语言切换） */
function syncToggleLabels() {
  const crtSpan = dom.btnCrt.querySelector('span');
  if (crtSpan) crtSpan.textContent = t(settings.crt ? 'crtOn' : 'crtOff');
  const soundSpan = dom.btnSound.querySelector('span');
  if (soundSpan) soundSpan.textContent = t(settings.muted ? 'soundOff' : 'soundOn');
  const touchSpan = dom.btnTouch.querySelector('span');
  if (touchSpan) touchSpan.textContent = t('touch');
  syncPauseButton();
}

/**
 * 暂停按钮：只在游戏内出现，文案随状态在「暂停 / 继续」之间切换。
 * 它同时是 13-qa-curation 的 D3/D5 探针可发现的暂停控件（data-control="pause"），
 * 让「暂停是否真的冻结」「未聚焦时是否劫持键盘」能被自动化判定，而不是只能做 DOM 级断言。
 */
function syncPauseButton() {
  const btn = dom.btnPause;
  if (!btn) return;
  const inGame = app.mode === 'game';
  btn.hidden = !inGame;
  btn.setAttribute('aria-pressed', String(app.gamePaused));
  const span = btn.querySelector('span');
  if (span) span.textContent = t(app.gamePaused ? 'resume' : 'pause');
  btn.setAttribute('aria-label', t(app.gamePaused ? 'resume' : 'pause'));
}

function syncChrome() {
  const inHall = app.mode === 'hall';
  const en = getLang() === 'en';
  dom.hallTitle.textContent = inHall
    ? (en ? `${HALL_NAME.en} · ${HALL_NAME.subEn}` : `${HALL_NAME.cn} · ${HALL_NAME.sub}`)
    : (en
      ? (app.scene.titleEn || app.scene.title)
      : `${app.scene.title} · ${app.sceneKey === 'lattice' ? 'LATTICE CORRIDOR' : 'METEOR COLUMN'}`);
  document.body.classList.toggle('is-game', !inHall);
  syncRail();
  syncIndicator();
  syncPauseButton();
}

/**
 * 导航轨景深：按与「当前展品」的距离分配墨色层级与微缩放。
 * 语义上的当前位置由 aria-current 明确给出（不用透明度衰减，避免对比度不足）。
 */
function syncRail() {
  const items = Array.from(dom.exhibitNav.querySelectorAll('[data-exhibit]'));
  if (!items.length) return;
  const activeId = currentExhibitId();
  const activeIndex = Math.max(0, items.findIndex((el) => el.dataset.exhibit === activeId));
  items.forEach((el, i) => {
    const distance = Math.abs(i - activeIndex);
    const level = distance === 0 ? 0 : distance === 1 ? 1 : 2;
    el.dataset.railLevel = String(level);
    el.style.setProperty('--ds-rail-scale', level === 0 ? '1' : level === 1 ? '1' : '0.97');
    if (el.dataset.exhibit === activeId) el.setAttribute('aria-current', 'true');
    else el.removeAttribute('aria-current');
  });
}

/** 当前所处的展品：游戏内取场景键，展厅内取玩家面前那台终端 */
function currentExhibitId() {
  if (app.mode === 'game') return app.sceneKey;
  if (app.scene) {
    if (app.scene.nearestExhibit) {
      const near = app.scene.nearestExhibit();
      if (near) return near.id;
    }
    // 展厅里即使没站在终端前，也把最近的一台标为「当前位置」，导航轨始终有锚点
    if (app.scene.closestExhibit) {
      const close = app.scene.closestExhibit();
      if (close) return close.id;
    }
  }
  return null;
}

/** 圆点指示器：当前展品在展品序列中的位置 */
function syncIndicator() {
  if (!dom.indicatorDots) return;
  const items = EXHIBITS;
  const activeId = currentExhibitId();
  const index = items.findIndex((ex) => ex.id === activeId);
  if (dom.indicatorDots.childElementCount !== items.length) {
    dom.indicatorDots.innerHTML = '';
    for (const ex of items) {
      const dot = document.createElement('span');
      dot.className = 'ds-indicator__dot';
      dot.dataset.exhibit = ex.id;
      dom.indicatorDots.appendChild(dot);
    }
  }
  Array.from(dom.indicatorDots.children).forEach((dot, i) => {
    dot.classList.toggle('is-on', i === index);
  });
  if (dom.indicatorText) {
    dom.indicatorText.textContent = index >= 0
      ? t('indicatorLabel').replace('%d', String(index + 1)).replace('%d', String(items.length))
      : '';
  }
}

function setQuery(key) {
  try {
    const params = new URLSearchParams(location.search);
    if (key) params.set('game', key);
    else params.delete('game');
    const qs = params.toString();
    history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
  } catch (err) {
    /* 某些 iframe 下 replaceState 可能受限，忽略即可 */
  }
}

/**
 * hreflang 备用链接在运行时写入。
 *
 * 原因：写在 index.html 里的相对 href 会被 Vite 当作静态资源改写成带哈希的产物路径，
 * 指向错误目标；运行时写入才能保证它始终指向本页的 zh / en 变体。
 */
function syncAlternateLinks() {
  try {
    const head = document.head;
    for (const [hreflang, lang] of [['zh-CN', 'zh'], ['en', 'en']]) {
      let link = head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = hreflang;
        head.appendChild(link);
      }
      const url = new URL(location.href);
      if (lang === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      link.href = `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    /* 某些环境不支持 DOM 变更，忽略 */
  }
}

/* ------------------------------ 画布缩放 ------------------------------ */

const MAX_DISPLAY_H = 600;   // 画布最大显示高度（CSS px），避免在超高屏上过大

function fitStage() {
  const rect = dom.stage.getBoundingClientRect();
  if (!rect.width) return;
  // 以可用宽度为主：舞台宽度由父容器决定，不受画布尺寸影响，因此不会形成反馈循环
  let scale = Math.min(rect.width / W, MAX_DISPLAY_H / H);
  const intScale = Math.floor(scale);
  // 接近整数倍时对齐到整数倍，得到干净的像素放大
  if (intScale >= 1 && scale / intScale < 1.22) scale = intScale;
  dom.canvas.style.width = `${Math.floor(W * scale)}px`;
  dom.canvas.style.height = `${Math.floor(H * scale)}px`;
}

/* ------------------------------ 展品导航轨 ------------------------------ */

function buildExhibitNav() {
  dom.exhibitNav.innerHTML = '';
  const en = getLang() === 'en';
  for (const ex of EXHIBITS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ds-rail__item navbtn';
    btn.dataset.exhibit = ex.id;
    btn.setAttribute('aria-label', en ? `${ex.en} — ${ex.taglineEn}` : `${ex.cn} · ${ex.tagline}`);
    btn.innerHTML = `<span class="navbtn__cn">${en ? ex.en : ex.cn}</span><span class="navbtn__en">${en ? ex.cn : ex.en}</span>`;
    btn.addEventListener('click', () => {
      if (ex.kind === 'game') {
        shell.goTo(ex.id);
      } else if (ex.kind === 'info') {
        shell.openChronicle();
      } else {
        shell.openLedger();
      }
    });
    dom.exhibitNav.appendChild(btn);
  }
  syncRail();
  syncIndicator();
}

/* ------------------------------ 顶栏按钮 ------------------------------ */

dom.btnSound.addEventListener('click', () => {
  const muted = !settings.muted;
  shell.setMuted(muted);
  syncToggleLabels();
  dom.btnSound.setAttribute('aria-pressed', String(!muted));
});

dom.btnCrt.addEventListener('click', () => {
  shell.setCrt(!settings.crt);
  syncToggleLabels();
});

dom.btnSettings.addEventListener('click', () => {
  panels.showSettings();
});

dom.btnCatalog.addEventListener('click', () => {
  panels.showChronicle();
});

dom.btnLang.addEventListener('click', () => {
  const next = getLang() === 'en' ? 'zh' : 'en';
  applyLang(next);
  syncAlternateLinks();
  syncToggleLabels();
  syncLangChip();
  syncChrome();
  buildExhibitNav();
  setStatus(app.mode === 'hall'
    ? t('statusHall')
    : t(app.sceneKey === 'lattice' ? 'statusLattice' : 'statusMeteor'));
  // 切换语言后同步 URL，便于分享
  try {
    const url = new URL(location.href);
    if (next === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch {
    /* 某些 iframe 下 replaceState 可能受限 */
  }
});

dom.btnTouch.addEventListener('click', () => {
  const on = !touchPad.isVisible();
  touchPad.setVisible(on);
  dom.btnTouch.setAttribute('aria-pressed', String(on));
});

/** 顶栏暂停键：与 P / Esc 等价；暂停面板内的「继续」走的是 shell.resume() */
dom.btnPause.addEventListener('click', () => {
  if (app.gamePaused) {
    shell.resume();
    syncPauseButton();
  } else {
    togglePause();
  }
});

/** 语言胶囊：显示目标语言，并更新 aria-label */
function syncLangChip() {
  const en = getLang() === 'en';
  dom.btnLang.textContent = en ? '中' : 'EN';
  dom.btnLang.setAttribute('aria-pressed', String(en));
  dom.btnLang.setAttribute('aria-label', en ? t('langToZh') : t('langToEn'));
}

/* ------------------------------ 全局按键 ------------------------------ */

window.addEventListener('keydown', (e) => {
  const target = e.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

  if (e.code === 'Escape' || e.code === 'KeyP') {
    if (panels.isOpen()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      panels.close();
      return;
    }
    if (app.mode === 'game') {
      e.preventDefault();
      e.stopImmediatePropagation();
      togglePause();
      return;
    }
  }

  if (e.code === 'KeyR' && app.mode === 'game' && !panels.isOpen()) {
    e.preventDefault();
    e.stopImmediatePropagation();
    shell.restart();
    return;
  }

  if (e.code === 'KeyM') {
    e.preventDefault();
    e.stopImmediatePropagation();
    dom.btnSound.click();
    return;
  }

  if (e.code === 'KeyH' && !panels.isOpen()) {
    e.preventDefault();
    e.stopImmediatePropagation();
    panels.showHelp(app.sceneKey);
  }
}, true);

function togglePause() {
  if (app.mode !== 'game') return;
  app.gamePaused = !app.gamePaused;
  if (app.gamePaused) {
    if (app.scene.onPause) app.scene.onPause();
    panels.showPause(app.sceneKey === 'lattice' ? 'LATTICE CORRIDOR' : 'METEOR COLUMN');
  } else {
    panels.close();
  }
  syncPauseButton();
}

/* ------------------------------ 画布点选 ------------------------------ */

dom.canvas.addEventListener('pointerdown', (e) => {
  if (app.mode !== 'hall' || !app.scene || !app.scene.hitTest) return;
  const rect = dom.canvas.getBoundingClientRect();
  const cx = ((e.clientX - rect.left) / rect.width) * W;
  const cy = ((e.clientY - rect.top) / rect.height) * H;
  const id = app.scene.hitTest(cx, cy);
  if (id) {
    const ex = EXHIBITS.find((e2) => e2.id === id);
    if (ex) {
      if (ex.kind === 'game') shell.goTo(ex.id);
      else if (ex.kind === 'info') shell.openChronicle();
      else shell.openLedger();
    }
  }
});

/* ------------------------------ 主循环 ------------------------------ */

const loop = createLoop({
  update(dt) {
    const frozen = panels.isOpen() || app.gamePaused;
    if (!frozen && app.scene) app.scene.update(dt, input);
    input.endFrame();
  },
  render() {
    if (app.scene) app.scene.render(ctx);
  },
});

/* ------------------------------ 启动 ------------------------------ */

function boot() {
  applyLang(detectLang());
  syncAlternateLinks();
  buildExhibitNav();
  applyCrt();

  dom.btnSound.setAttribute('aria-pressed', String(!settings.muted));
  syncToggleLabels();
  syncLangChip();

  // 触控设备默认显示虚拟按键
  const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  touchPad.setVisible(coarse);
  dom.btnTouch.setAttribute('aria-pressed', String(coarse));

  const params = new URLSearchParams(location.search);
  const wanted = params.get('game');
  if (wanted === 'lattice' || wanted === 'meteor') {
    shell.goTo(wanted);
  } else {
    shell.goTo('hall');
  }

  fitStage();
  loop.start();
  app.booted = true;

  // 首次交互后再播放音乐（浏览器自动播放策略）
  const kick = () => {
    audio.unlock();
    if (!settings.muted) {
      if (app.mode === 'hall') audio.music.play('hall');
      else if (app.mode === 'game') audio.music.play(app.sceneKey);
    }
    window.removeEventListener('pointerdown', kick);
    window.removeEventListener('keydown', kick);
  };
  window.addEventListener('pointerdown', kick);
  window.addEventListener('keydown', kick);
}

window.addEventListener('resize', fitStage);
window.addEventListener('orientationchange', () => setTimeout(fitStage, 120));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStage).catch(() => {});

boot();

// 便于集成方（06 博物馆 / 14 部署）与自动化验收在浏览器控制台中检查
window.__neonCorridor = { app, shell, settings, store, input, audio, loop };

/**
 * 顶层**只读**状态快照。
 *
 * 13-qa-curation 的 D3（开始 / 暂停 / 重开）与 D5（键盘焦点作用域）探针按顶层
 * `state` / `score` / `player` 取值（见其 qa-harness/lib/probes-era.mjs 的
 * movementSnapshot）。本作品此前只暴露嵌套结构，探针只能做 DOM 级断言，
 * 记为「未自动验证」（issues.json 的 QA-008 / 009 / 010，severity=info，非缺陷）。
 *
 * 这里用 getter 暴露扁平视图：始终反映实时状态，且外部无法写入（只读）。
 * 状态取值对齐探针的判定口径：idle / playing / paused。
 */
Object.defineProperties(window.__neonCorridor, {
  state: {
    enumerable: true,
    get() {
      if (app.mode !== 'game') return 'idle';
      return app.gamePaused ? 'paused' : 'playing';
    },
  },
  phase: {
    enumerable: true,
    get() {
      const snap = app.scene && app.scene.snapshot ? app.scene.snapshot() : null;
      return snap && snap.phase ? snap.phase : null;
    },
  },
  score: {
    enumerable: true,
    get() {
      const snap = app.scene && app.scene.snapshot ? app.scene.snapshot() : null;
      return snap && typeof snap.score === 'number' ? snap.score : 0;
    },
  },
  player: {
    enumerable: true,
    get() {
      const snap = app.scene && app.scene.snapshot ? app.scene.snapshot() : null;
      return snap && snap.player ? snap.player : null;
    },
  },
});
