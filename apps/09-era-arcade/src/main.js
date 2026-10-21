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
  btnCrt: document.getElementById('btn-crt'),
  btnSettings: document.getElementById('btn-settings'),
  btnCatalog: document.getElementById('btn-catalog'),
  btnTouch: document.getElementById('btn-touch'),
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
      setStatus('← → 沿街廊走动，站到终端前按 <kbd>空格</kbd> 进入；也可直接点击终端，或使用下方展品目录。');
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
      setStatus(key === 'lattice'
        ? '方向键 / WASD 移动 · <kbd>空格</kbd> 相位穿行 · <kbd>E</kbd> 残响 · <kbd>P</kbd> 暂停 · <kbd>R</kbd> 重开'
        : '<kbd>A</kbd> <kbd>D</kbd> 移动 · <kbd>空格</kbd> 开火 · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> 弹型 · <kbd>F</kbd> 共振激爆');
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
  dom.btnCrt.textContent = settings.crt ? 'CRT 开' : 'CRT 关';
}

function syncChrome() {
  const inHall = app.mode === 'hall';
  dom.hallTitle.textContent = inHall ? `${HALL_NAME.cn} · ${HALL_NAME.sub}` : `${app.scene.title} · ${app.sceneKey === 'lattice' ? 'LATTICE CORRIDOR' : 'METEOR COLUMN'}`;
  document.body.classList.toggle('is-game', !inHall);
  for (const btn of dom.exhibitNav.querySelectorAll('[data-exhibit]')) {
    btn.classList.toggle('is-on', btn.dataset.exhibit === app.sceneKey);
  }
}

function setQuery(key) {
  try {
    const url = key ? `?game=${encodeURIComponent(key)}` : `${location.pathname}`;
    history.replaceState(null, '', url);
  } catch (err) {
    /* 某些 iframe 下 replaceState 可能受限，忽略即可 */
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

/* ------------------------------ 展品目录 ------------------------------ */

function buildExhibitNav() {
  dom.exhibitNav.innerHTML = '';
  for (const ex of EXHIBITS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'navbtn';
    btn.dataset.exhibit = ex.id;
    btn.style.setProperty('--accent', ex.accent);
    btn.innerHTML = `<span class="navbtn__cn">${ex.cn}</span><span class="navbtn__en">${ex.en}</span>`;
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
}

/* ------------------------------ 顶栏按钮 ------------------------------ */

dom.btnSound.addEventListener('click', () => {
  const muted = !settings.muted;
  shell.setMuted(muted);
  dom.btnSound.textContent = muted ? '声音 关' : '声音 开';
  dom.btnSound.setAttribute('aria-pressed', String(!muted));
});

dom.btnCrt.addEventListener('click', () => {
  shell.setCrt(!settings.crt);
});

dom.btnSettings.addEventListener('click', () => {
  panels.showSettings();
});

dom.btnCatalog.addEventListener('click', () => {
  panels.showChronicle();
});

dom.btnTouch.addEventListener('click', () => {
  const on = !touchPad.isVisible();
  touchPad.setVisible(on);
  dom.btnTouch.setAttribute('aria-pressed', String(on));
});

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
  buildExhibitNav();
  applyCrt();

  dom.btnSound.textContent = settings.muted ? '声音 关' : '声音 开';
  dom.btnSound.setAttribute('aria-pressed', String(!settings.muted));

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

// 便于集成方（06 博物馆 / 14 部署）在浏览器控制台中检查
window.__neonCorridor = { app, shell, settings, store };
