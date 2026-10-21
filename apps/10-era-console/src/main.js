/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 展厅主控：路由、展厅渲染、可玩视图挂载、嵌入协议
 *
 * 样式引入顺序（15 派单「接入三步」）：
 *   assets/ds/fonts/fonts.css    16 的自托管字体（OFL，禁止 CDN）
 *   assets/ds/tokens.css         16 的令牌层（--ds-*，唯一声明处）
 *   assets/ds/components.css     16 的组件层（.ds-* 外壳组件）
 *   src/styles/main.css          本作品自有样式（外壳增量覆盖；画布内部色板不动）
 *
 * 顺序不可颠倒：tokens 在 components 之前、components 在 main 之前，
 * 令牌 → 组件 → 本地增量，逐层覆盖。
 */

import '../assets/ds/fonts/fonts.css';
import '../assets/ds/tokens.css';
import '../assets/ds/components.css';
import './styles/main.css';

import { AudioEngine } from './audio/AudioEngine.js';
import { Overlay } from './ui/Overlay.js';
import { renderPixelTextCanvas } from './ui/pixelFont.js';
import { iconCanvas, toneForCategory } from './ui/icons.js';
import { EXHIBITS, EXHIBIT_CATEGORIES, CONSOLES, ERA, ERA_LABEL } from './data/exhibits.js';
import { Input } from './platform/input.js';
import { PlatformGame } from './platform/PlatformGame.js';
import { LEVEL_DEFS } from './platform/levels.js';
import { IsoScene } from './iso/IsoScene.js';

/* ------------------------------------------------------------------ *
 * 基础
 * ------------------------------------------------------------------ */

/* 运行期基准路径：由构建注入（vite base: './' → './'）。
   相对基准同时适配 Pages 任意子路径与 file:// 离线打开（MIGRATION-NOTES §6）。
   index.html 里已静态注入生产子路径 "/playtime-atlas-20261021/" 作为无 JS 兜底，
   运行期这里用相对基准覆盖，使同一份产物在任意挂载点都可用。 */
document.documentElement.style.setProperty('--ds-base', import.meta.env.BASE_URL || '');

/* 入场动效开关：只有 JS 正常运行时才允许隐藏 .ds-in 元素。
   若脚本加载失败，has-js 不会被添加 → 内容保持可见（失效安全）。 */
document.documentElement.classList.add('has-js');

/* 兜底：任何未捕获错误都撤掉 has-js，让 .ds-in 立即可见。
   （16 的 .ds-in 默认 opacity:0，若 JS 中途出错会留下永远不可见的标题。） */
window.addEventListener('error', () => {
  document.documentElement.classList.remove('has-js');
});

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const audio = new AudioEngine();
audio.bindUnlock();

const embedded = window.self !== window.top;
if (embedded) {
  document.getElementById('embed-note').hidden = false;
  const back = document.getElementById('back-to-atlas');
  if (back) back.hidden = true;
}

/* ------------------------------------------------------------------ *
 * 展厅首页：Logo / 主视觉 / 机型 / 展品
 * ------------------------------------------------------------------ */

function renderLogo() {
  const cv = document.getElementById('logo-canvas');
  if (!cv) return;
  const rendered = renderPixelTextCanvas('CHROMA VOYAGE', {
    scale: 4,
    spacing: 1,
    color: '#ffd166',
    shadow: '#ff7a6b',
    padding: 2,
  });
  cv.width = rendered.width;
  cv.height = rendered.height;
  cv.style.width = `${rendered.width}px`;
  cv.style.height = `${rendered.height}px`;
  cv.getContext('2d').drawImage(rendered, 0, 0);
}

/** 主视觉：程序化生成的像素画（色块远征主题） */
function renderHeroArt() {
  const host = document.getElementById('hero-pixel-art');
  if (!host) return;
  const size = 64;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const palette = ['#101018', '#1c1c2a', '#2f9d82', '#5ee0b8', '#b48aff', '#ffd166', '#ff7a6b', '#6aa9ff'];

  // 背景渐层
  for (let y = 0; y < size; y++) {
    const t = y / size;
    const r = Math.round(16 + t * 22);
    const g = Math.round(16 + t * 14);
    const b = Math.round(24 + t * 34);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, size, 1);
  }

  // 远山（三层视差剪影）
  const ridges = [
    { base: 40, amp: 6, freq: 0.22, color: '#241f3d' },
    { base: 48, amp: 5, freq: 0.31, color: '#2e2850' },
    { base: 56, amp: 4, freq: 0.44, color: '#3a3260' },
  ];
  ridges.forEach((r) => {
    ctx.fillStyle = r.color;
    for (let x = 0; x < size; x++) {
      const y = Math.round(r.base + Math.sin(x * r.freq) * r.amp + Math.sin(x * r.freq * 2.3) * r.amp * 0.4);
      ctx.fillRect(x, y, 1, size - y);
    }
  });

  // 主角：墨豆（12×16 精灵，1:1 绘制）
  const hero = [
    '....2222....',
    '...222222...',
    '..22222222..',
    '..21111112..',
    '..21555112..',
    '..21555112..',
    '..21111112..',
    '...222222...',
    '..25555552..',
    '.2555555552.',
    '.2511111152.',
    '.2511111152.',
    '.2511111152.',
    '..51111115..',
    '..55....55..',
    '...222222...',
  ];
  const map = {
    1: '#101018', 2: '#5ee0b8', 4: '#f4efe4', 5: '#ff7a6b',
  };
  const hx = 8;
  const hy = 30;
  hero.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      const color = map[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(hx + x, hy + y, 1, 1);
    });
  });

  // 色晶
  const shard = ['...44...', '..4664..', '.466664.', '.466664.', '..4664..', '...44...'];
  const shardMap = { 4: '#f4efe4', 6: '#ffd166' };
  shard.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      const color = shardMap[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(40 + x, 20 + y, 1, 1);
    });
  });
  const shard2 = ['...44...', '...44...', '..4664..', '..4664..', '...44...', '...44...'];
  shard2.forEach((row, y) => {
    row.split('').forEach((ch, x) => {
      const color = shardMap[ch];
      if (!color) return;
      ctx.fillStyle = color;
      ctx.fillRect(50 + y, 26 + x, 1, 1);
    });
  });

  // 跃迁塔（目标闸门）
  ctx.fillStyle = '#3b3660';
  ctx.fillRect(30, 22, 4, 18);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(31, 14, 2, 8);
  ctx.fillStyle = '#ff7a6b';
  ctx.fillRect(29, 38, 6, 2);

  // 地面
  ctx.fillStyle = '#217a63';
  ctx.fillRect(0, 44, size, size - 44);
  ctx.fillStyle = '#5ee0b8';
  ctx.fillRect(0, 44, size, 1);
  ctx.fillStyle = '#39a888';
  for (let x = 0; x < size; x += 7) ctx.fillRect(x, 46, 3, 1);

  host.appendChild(cv);
}

function renderConsoles() {
  const grid = document.getElementById('console-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const tones = ['mint', 'sky', 'sun', 'violet', 'coral'];
  CONSOLES.forEach((c, i) => {
    const card = document.createElement('article');
    card.className = 'console-card ds-work';
    card.dataset.year = c.year;

    const icon = iconCanvas(c.kind === 'handheld' ? 'handheld' : 'console', 54, 40, tones[i % tones.length]);
    icon.className = 'console-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    card.appendChild(icon);

    const name = document.createElement('h3');
    name.className = 'console-card__name ds-work__title';
    name.textContent = c.name;
    card.appendChild(name);

    const maker = document.createElement('p');
    maker.className = 'console-card__maker ds-work__meta';
    maker.textContent = c.maker;
    card.appendChild(maker);

    const note = document.createElement('p');
    note.className = 'console-card__note ds-work__desc';
    note.textContent = c.note;
    card.appendChild(note);

    const bits = document.createElement('span');
    bits.className = 'console-card__bits ds-tag';
    bits.textContent = c.bits;
    card.appendChild(bits);

    const kind = document.createElement('span');
    kind.className = 'console-card__kind ds-work__meta';
    kind.textContent = c.kind === 'handheld' ? '掌机' : '家用机';
    card.appendChild(kind);

    grid.appendChild(card);
  });
}

function renderExhibits() {
  const grid = document.getElementById('exhibit-grid');
  const filters = document.getElementById('exhibit-filters');
  if (!grid) return;

  const render = (cat) => {
    grid.innerHTML = '';
    EXHIBITS.filter((e) => !cat || e.category === cat).forEach((ex) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'exhibit-card ds-work';
      card.dataset.category = ex.category;

      const head = document.createElement('div');
      head.className = 'exhibit-card__head';
      const icon = iconCanvas(ex.icon, 34, 26, toneForCategory(ex.category));
      icon.className = 'exhibit-card__icon';
      icon.setAttribute('aria-hidden', 'true');
      head.appendChild(icon);

      const titles = document.createElement('div');
      const t = document.createElement('h3');
      t.className = 'exhibit-card__title ds-work__title';
      t.textContent = ex.title;
      const s = document.createElement('p');
      s.className = 'exhibit-card__sub ds-work__meta';
      s.textContent = ex.subtitle;
      titles.appendChild(t);
      titles.appendChild(s);
      head.appendChild(titles);
      card.appendChild(head);

      const fact = document.createElement('p');
      fact.className = 'exhibit-card__fact ds-work__desc';
      fact.textContent = ex.fact;
      card.appendChild(fact);

      const meta = document.createElement('div');
      meta.className = 'exhibit-card__meta';
      const catLabel = EXHIBIT_CATEGORIES.find((c) => c.id === ex.category);
      const catEl = document.createElement('span');
      catEl.className = 'exhibit-card__cat';
      catEl.textContent = catLabel ? catLabel.label : ex.category;
      const yearEl = document.createElement('span');
      yearEl.textContent = String(ex.year);
      const srcEl = document.createElement('span');
      srcEl.textContent = `${ex.sourceUrls.length} 条来源`;
      meta.append(catEl, yearEl, srcEl);
      card.appendChild(meta);

      card.addEventListener('click', () => openExhibit(ex, card));
      grid.appendChild(card);
    });
  };

  if (filters) {
    filters.innerHTML = '';
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'filter-btn ds-chip is-active';
    all.setAttribute('aria-pressed', 'true');
    all.textContent = `全部 ${EXHIBITS.length}`;
    filters.appendChild(all);

    const buttons = [all];
    EXHIBIT_CATEGORIES.forEach((c) => {
      const n = EXHIBITS.filter((e) => e.category === c.id).length;
      if (!n) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'filter-btn ds-chip';
      b.setAttribute('aria-pressed', 'false');
      b.textContent = `${c.label} ${n}`;
      filters.appendChild(b);
      buttons.push(b);
    });

    buttons.forEach((b) => {
      b.addEventListener('click', () => {
        buttons.forEach((x) => {
          x.classList.remove('is-active');
          x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('is-active');
        b.setAttribute('aria-pressed', 'true');
        render(b === all ? null : b.textContent.split(' ')[0]);
        // 依据类别中文名反查 id
        if (b !== all) {
          const label = b.textContent.split(' ')[0];
          const cat = EXHIBIT_CATEGORIES.find((c) => c.label === label);
          render(cat ? cat.id : null);
        }
      });
    });
  }

  render(null);
}

/** 展品详情面板（复用 Overlay） */
let hallOverlay = null;
function openExhibit(ex, anchorEl) {
  if (!hallOverlay) {
    hallOverlay = new Overlay(document.createElement('div'));
    document.body.appendChild(hallOverlay.root);
    hallOverlay.root.style.position = 'fixed';
    hallOverlay.root.style.zIndex = '900';
  }
  const catLabel = EXHIBIT_CATEGORIES.find((c) => c.id === ex.category);
  const sources = ex.sourceUrls
    .map(
      (u) =>
        `<li><span>来源</span><a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a></li>`
    )
    .join('');

  hallOverlay.show({
    title: ex.title,
    subtitle: `${ex.subtitle} · ${ex.year}`,
    tone: toneForCategory(ex.category),
    body: `
      <p class="exhibit-panel__cat">${catLabel ? catLabel.label : ex.category} · ${ex.imageLicense === 'no-image' ? '本馆不使用第三方图片，配图为程序化生成' : ex.imageLicense}</p>
      <p>${ex.fact}</p>
      <p class="exhibit-panel__detail">${ex.detail}</p>
      <ul class="exhibit-panel__sources">${sources}</ul>
      <p class="exhibit-panel__license">引用 ≠ 授权。本条目为科普引用，事实性描述以所列公开来源为准。</p>
    `,
    actions: [
      { id: 'close', label: '关闭', primary: true, onClick: () => hallOverlay.hide() },
    ],
  });
  if (anchorEl) anchorEl.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ *
 * 可玩视图：平台冒险
 * ------------------------------------------------------------------ */

let platformGame = null;
let platformInput = null;
let platformOverlay = null;
let platformMounted = false;

function mountPlatform() {
  if (platformMounted) return;
  platformMounted = true;

  const canvas = document.getElementById('platform-canvas');
  const touchRoot = document.getElementById('platform-touch');
  platformOverlay = new Overlay(document.getElementById('platform-overlay'));
  platformInput = new Input(touchRoot);

  const hud = {
    set: (s) => {
      const lives = document.getElementById('hud-lives');
      const shards = document.getElementById('hud-shards');
      const cp = document.getElementById('hud-checkpoint');
      const level = document.getElementById('hud-level');
      const time = document.getElementById('hud-time');
      if (lives) lives.textContent = `生命 ${'◆'.repeat(Math.max(0, s.lives))}${'◇'.repeat(Math.max(0, s.maxLives - s.lives))}`;
      if (shards) shards.textContent = `色晶 ${s.shards}/${s.totalShards}`;
      if (cp) cp.textContent = s.checkpoint ? '检查点 ✓' : '检查点 —';
      if (level) level.textContent = `第 ${s.levelIndex + 1}/${s.levelCount} 关 · ${s.levelName}`;
      if (time) time.textContent = formatTime(s.time);
    },
  };

  platformGame = new PlatformGame({
    canvas,
    input: platformInput,
    overlay: platformOverlay,
    hud,
    audio,
    onExit: () => {
      location.hash = '#/hall';
    },
  });
  platformGame.mount();

  // 关卡列表
  const list = document.getElementById('level-list');
  if (list) {
    list.innerHTML = '';
    LEVEL_DEFS.forEach((l, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${i + 1}. ${l.name}</b> · ${l.subtitle}`;
      list.appendChild(li);
    });
  }
}

function unmountPlatform() {
  if (!platformMounted) return;
  platformGame?.unmount();
  platformMounted = false;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
}

/* ------------------------------------------------------------------ *
 * 可玩视图：等距测绘所
 * ------------------------------------------------------------------ */

let isoScene = null;
let isoOverlay = null;
let isoMounted = false;

function mountIso() {
  if (isoMounted) return;
  isoMounted = true;

  const canvas = document.getElementById('iso-canvas');
  isoOverlay = new Overlay(document.getElementById('iso-overlay'));

  isoScene = new IsoScene({
    canvas,
    audio,
    onSelect: (spot) => {
      const ex = isoScene.exhibitFor(spot);
      if (!ex) return;
      const catLabel = EXHIBIT_CATEGORIES.find((c) => c.id === ex.category);
      const sources = ex.sourceUrls
        .map(
          (u) =>
            `<li><span>来源</span><a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a></li>`
        )
        .join('');
      isoOverlay.show({
        title: spot.label,
        subtitle: `${ex.title} · ${ex.subtitle}`,
        tone: toneForCategory(ex.category),
        body: `
          <p class="exhibit-panel__cat">${catLabel ? catLabel.label : ex.category} · ${ex.year} · ${spot.hint}</p>
          <p>${ex.fact}</p>
          <p class="exhibit-panel__detail">${ex.detail}</p>
          <ul class="exhibit-panel__sources">${sources}</ul>
          <p class="exhibit-panel__license">引用 ≠ 授权。本展台不复制任何受版权保护的模型、图像或品牌标识。</p>
        `,
        actions: [
          { id: 'close', label: '关闭展品', primary: true, onClick: () => isoOverlay.hide() },
          { id: 'next', label: '下一处展台', onClick: () => {
            isoOverlay.hide();
            const list = isoScene.hotspots;
            const i = list.findIndex((h) => h.id === spot.id);
            const next = list[(i + 1) % list.length];
            isoScene.selectHotspot(next.id);
          } },
        ],
      });
      $$('#hotspot-list button').forEach((b) => b.classList.toggle('is-active', b.dataset.id === spot.id));
    },
    onHover: () => {},
  });
  isoScene.attach();
  isoScene.mount();

  // 展台索引
  const list = document.getElementById('hotspot-list');
  if (list) {
    list.innerHTML = '';
    isoScene.hotspots.forEach((h) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.id = h.id;
      btn.innerHTML = `<i></i><span>${h.label}</span><small>${h.hint}</small>`;
      btn.addEventListener('click', () => {
        isoScene.selectHotspot(h.id);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  // 图例
  const legend = document.getElementById('iso-legend');
  if (legend) {
    legend.innerHTML = `
      <span><i style="background:#2f6fb8"></i>色浆池</span>
      <span><i style="background:#d9c08a"></i>浅滩</span>
      <span><i style="background:#4fb87a"></i>草台</span>
      <span><i style="background:#6a6480"></i>岩台</span>
      <span><i style="background:#9a6ad0"></i>晶体台</span>
    `;
  }

  // 工具条
  document.getElementById('iso-zoom-in')?.addEventListener('click', () => isoScene.zoomBy(-1));
  document.getElementById('iso-zoom-out')?.addEventListener('click', () => isoScene.zoomBy(1));
  document.getElementById('iso-reset')?.addEventListener('click', () => isoScene._centerOnYard());
  const nightBtn = document.getElementById('iso-night');
  nightBtn?.addEventListener('click', () => {
    const on = isoScene.toggleNight();
    nightBtn.setAttribute('aria-pressed', String(on));
  });

  // 键盘操作
  isoKeyHandler = (e) => {
    if (!isoScene) return;
    const step = 42;
    if (e.key === 'ArrowLeft') isoScene.panBy(step, 0);
    else if (e.key === 'ArrowRight') isoScene.panBy(-step, 0);
    else if (e.key === 'ArrowUp') isoScene.panBy(0, step);
    else if (e.key === 'ArrowDown') isoScene.panBy(0, -step);
    else if (e.key === '+' || e.key === '=') isoScene.zoomBy(-1);
    else if (e.key === '-' || e.key === '_') isoScene.zoomBy(1);
    else return;
    e.preventDefault();
  };
  window.addEventListener('keydown', isoKeyHandler);
}

let isoKeyHandler = null;

function unmountIso() {
  if (!isoMounted) return;
  isoScene?.unmount();
  if (isoKeyHandler) window.removeEventListener('keydown', isoKeyHandler);
  isoKeyHandler = null;
  isoMounted = false;
}

/* ------------------------------------------------------------------ *
 * 路由
 * ------------------------------------------------------------------ */

const ROUTES = ['hall', 'platform', 'iso', 'sources'];

function currentRoute() {
  const hash = (location.hash || '#/hall').replace('#/', '').split('?')[0];
  return ROUTES.includes(hash) ? hash : 'hall';
}

function applyRoute() {
  const route = currentRoute();
  const isHall = route === 'hall' || route === 'sources';

  $$('.view').forEach((v) => {
    const id = v.id.replace('view-', '');
    const active = id === route || (route === 'sources' && id === 'hall');
    v.hidden = !active;
    v.classList.toggle('is-active', active);
  });
  $$('.nav__link').forEach((a) => {
    const active = a.dataset.route === route || (route === 'sources' && a.dataset.route === 'hall');
    a.classList.toggle('is-active', active);
    // 导航轨契约：当前分区用 aria-current="page" 标记（MIGRATION-NOTES §3）
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  if (route === 'platform') {
    mountPlatform();
    platformGame?.showTitle?.();
  } else {
    unmountPlatform();
  }

  if (route === 'iso') {
    mountIso();
  } else {
    unmountIso();
  }

  if (route === 'sources') {
    setTimeout(() => document.getElementById('sources')?.scrollIntoView({ behavior: 'smooth' }), 60);
  }

  // 供父级页面读取
  window.PLAYTIME_ATLAS_NODE = {
    id: '10-era-console',
    title: '色块远征 · 1990s 家用机可玩展厅',
    era: ERA,
    eraLabel: ERA_LABEL,
    year: 1990,
    entry: 'index.html',
    ready: true,
    route,
  };
  document.dispatchEvent(new CustomEvent('playtime:route', { detail: route }));
}

window.addEventListener('hashchange', applyRoute);

/* 嵌入协议：父页面可要求切换展项 */
window.addEventListener('message', (e) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'playtime:nav' && msg.node === '10-era-console') {
    const section = msg.section || 'hall';
    if (ROUTES.includes(section)) location.hash = `#/${section}`;
  }
});

/* ------------------------------------------------------------------ *
 * 静音按钮
 * ------------------------------------------------------------------ */

const muteBtn = document.getElementById('mute-btn');
muteBtn?.addEventListener('click', () => {
  const muted = audio.toggleMute();
  muteBtn.setAttribute('aria-pressed', String(muted));
  muteBtn.querySelector('.tool-btn__label').textContent = muted ? '静音中' : '音效';
});

/* ------------------------------------------------------------------ *
 * 入场动效（.ds-in）
 * 统一设计系统的分段入场：translateY(24px) + blur(6px)，交错 ≤6 级。
 * 仅在 JS 正常运行时隐藏（html.has-js）；脚本失效时内容保持可见。
 * ------------------------------------------------------------------ */

function setupEntrance() {
  const items = $$('.ds-in');
  if (!items.length) return;
  const show = (el) => el.classList.add('is-visible');

  if (typeof IntersectionObserver !== 'function') {
    items.forEach(show);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );

  items.forEach((el, i) => {
    // 交错延迟：最多 6 级（design-tokens.json §motion.stagger.maxSteps）
    el.style.setProperty('--ds-in-delay', `${Math.min(i, 5) * 60}ms`);
    io.observe(el);
  });
}

/* ------------------------------------------------------------------ *
 * 启动
 * 失效安全：启动过程中若抛错，撤掉 has-js —— 16 的 .ds-in 默认 opacity:0，
 * 没有 JS 时必须让内容保持可见（MIGRATION-NOTES §5 / 本目录 QA.md §8）。
 * ------------------------------------------------------------------ */

try {
  renderLogo();
  renderHeroArt();
  renderConsoles();
  renderExhibits();
  applyRoute();
  setupEntrance();
} catch (err) {
  document.documentElement.classList.remove('has-js');
  console.error('[chroma] 启动失败，已回退到无 JS 的静态呈现：', err);
}

// 供自动化测试与父页面调用的稳定接口
window.__CHROMA__ = {
  audio,
  get game() { return platformGame; },
  get iso() { return isoScene; },
  navigate: (r) => { location.hash = `#/${r}`; },
  version: '1.0.0',
};
