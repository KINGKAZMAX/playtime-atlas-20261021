/* =========================================================
   回响电玩馆 / PLAYTIME ATLAS — 美术包预览页
   数据来自 scripts/build-manifest.mjs 生成的 src/data.js
   ========================================================= */

import './styles.css';
import ATLAS from './data.js';
import TOKENS from './tokens.js';
import { t, getLang, setLang, setVar, applyI18n } from './i18n.js';

/* ---------- 路径助手 ----------
   Pages 子路径适配：资源一律经 BASE_URL 拼接，绝不写死根路径 */
const BASE = import.meta.env.BASE_URL || './';
const asset = (p) => `${BASE}${String(p).replace(/^\.?\//, '')}`;

/* ---------- DOM 助手 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};

/* ---------- 容错助手 ----------
   单个节点缺失不应该让整页空白：写文本一律走 setText，
   渲染步骤一律走 run（出错只记 warn，其余区块照常渲染）。 */
function setText(target, value) {
  const n = typeof target === 'string' ? $(target) : target;
  if (!n) return false;
  n.textContent = value;
  return true;
}

function run(name, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`[render] ${name} 失败：`, err);
  }
}

/* ---------- 提示条 ---------- */
let toastTimer = null;
function toast(msg) {
  const n = $('#toast');
  if (!n) return;
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => n.classList.remove('show'), 2200);
}

/* =========================================================
   1. 顶部统计
   ========================================================= */
function renderHeroStats() {
  const box = $('#hero-stats');
  const c = ATLAS.counts;
  const stats = [
    [c.eras, t('stats.eras')],
    [c.covers, t('stats.covers')],
    [c.cases, t('stats.cases')],
    [c.models, t('stats.models')],
    [c.icons, t('stats.icons')],
    [c.models ? ATLAS.models.reduce((s, m) => s + m.partCount, 0) : 0, t('stats.parts')],
  ];
  box.innerHTML = stats
    .map(([n, label]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join('');
}

/* =========================================================
   2. 设计令牌
   ----------------------------------------------------
   令牌结构（对齐 16-design-system 后）：
     TOKENS.designSystem — 16 的令牌树（UI 取值来源）
     TOKENS.local        — 展品内嵌配色（海报/封面/展柜/GLB 已烘焙）
     TOKENS.compat       — 1.0.0 旧键名 → 16 取值的兼容视图
   ========================================================= */
const DS = TOKENS.designSystem;
const LOCAL = TOKENS.local;

/** 拆 DTCG 的 { $value } 包装 */
const dv = (node) => (node && typeof node === 'object' && '$value' in node ? node.$value : node);

/** 把一组 { 键: { $value } } 渲染成色卡 */
function swatchGroup(set, keyPrefix) {
  return Object.entries(set)
    .filter(([, v]) => dv(v) && String(dv(v)).startsWith('#'))
    .map(([key, v]) => {
      const hex = String(dv(v));
      return `
          <div class="swatch">
            <div class="swatch-chip" style="background:${hex}"></div>
            <div class="swatch-meta">
              <b>${keyPrefix ? `${keyPrefix}-${key}` : key}</b><span>${hex.toUpperCase()}</span>
            </div>
          </div>`;
    })
    .join('');
}

function renderTokens() {
  /* ① 16 的浅色主题色板 */
  $('#swatches').innerHTML = [
    `<div style="grid-column:1/-1"><p class="token-title" style="margin-top:18px">${t('tokens.palette.light')}</p>
      <div class="swatches">${swatchGroup(DS.color.light, 'light')}</div></div>`,
    `<div style="grid-column:1/-1"><p class="token-title" style="margin-top:18px">${t('tokens.palette.dark')}</p>
      <div class="swatches">${swatchGroup(DS.color.dark, 'dark')}</div></div>`,
    `<div style="grid-column:1/-1"><p class="token-title" style="margin-top:18px">${t('tokens.palette.canvas')}</p>
      <div class="swatches">${swatchGroup(DS.color.canvas, 'canvas')}</div></div>`,
  ].join('');

  /* ② 语义色：兼容视图（已指向 16 取值） */
  $('#semantic').innerHTML = Object.entries(TOKENS.compat.semantic)
    .filter(([, v]) => typeof v === 'string' && v.startsWith('#'))
    .map(
      ([k, v]) => `<div class="swatch">
        <div class="swatch-chip" style="background:${v}"></div>
        <div class="swatch-meta"><b>${k}</b><span>${v.toUpperCase()}</span></div>
      </div>`,
    )
    .join('');

  /* ③ 展品内嵌配色（本地资产已烘焙，非 UI 色板） */
  $('#exhibit-swatches').innerHTML = Object.entries(LOCAL.color)
    .map(
      ([group, steps]) => Object.entries(steps)
        .reverse()
        .map(
          ([step, hex]) => `
          <div class="swatch">
            <div class="swatch-chip" style="background:${hex}"></div>
            <div class="swatch-meta">
              <b>${group}-${step}</b><span>${hex.toUpperCase()}</span>
            </div>
          </div>`,
        )
        .join(''),
    )
    .join('');

  /* ④ 字阶（16 的 type scale；标签为技术名，两语一致） */
  const sizeLabels = [
    ['display', 'Display / H1'],
    ['h3', 'H3 / Lead'],
    ['body', 'Body'],
    ['sm', 'Small'],
    ['xs', 'Extra small'],
    ['mono', 'Mono'],
  ];
  $('#type-scale').innerHTML = sizeLabels
    .map(([k, label]) => {
      const v = dv(DS.typography.size[k]) || '16px';
      const sample = k === 'mono' ? 'ATLAS-ERA-02 · 1978—1983' : '回响电玩馆 Atlas';
      return `<div>
        <span class="ts-label">${label}</span>
        <span class="ts-sample" style="font-size:${v}">${sample}</span>
      </div>`;
    })
    .join('');

  /* ⑤ 间距 / 圆角 / 阴影（16 的取值） */
  $('#space-scale').innerHTML = Object.entries(DS.space)
    .filter(([k]) => /^\d+$/.test(k))
    .map(([k, v]) => {
      const px = parseFloat(dv(v));
      return `<div class="scale-item">
        <i style="width:${px + 2}px;height:${px + 2}px"></i>${k}
      </div>`;
    })
    .join('');

  $('#radius-scale').innerHTML = Object.entries(DS.radius)
    .map(([k, v]) => `<div class="scale-item">
      <i style="width:34px;height:34px;background:var(--ds-accent);border-radius:${dv(v)}"></i>${k}
    </div>`)
    .join('');

  $('#shadow-scale').innerHTML = Object.entries(DS.shadow)
    .map(
      ([k, v]) => `<div class="scale-item" style="padding:6px 12px;background:var(--ds-bg-raised);border-radius:8px;box-shadow:${dv(v)}">${k}</div>`,
    )
    .join('');
}

/* =========================================================
   3. 字体
   ========================================================= */
function renderFonts() {
  const cjk = ATLAS.fonts.families.find((f) => f.family === 'Noto Sans SC');
  const cjkCount = ATLAS.fonts.cjkChars || 746;
  setText('#cjk-count', String(cjkCount));

  const samples = {
    'Space Grotesk': {
      sample: 'PLAYTIME ATLAS',
      role: t('fonts.role.grotesk'),
      font: "'Space Grotesk', sans-serif",
    },
    Inter: {
      sample: getLang() === 'en'
        ? 'Body copy set for a museum of game hardware'
        : '电子游戏硬件年代馆的正文排版',
      role: t('fonts.role.inter'),
      font: "'Inter', 'Noto Sans SC', sans-serif",
    },
    'Space Mono': {
      sample: 'ATLAS-ERA-02 · 1978—1983',
      role: t('fonts.role.mono'),
      font: "'Space Mono', monospace",
    },
    'Noto Sans SC': {
      sample: '回响电玩馆 · 街机黄金',
      role: t('fonts.role.cjk', { count: cjkCount }),
      font: "'Noto Sans SC', sans-serif",
    },
  };

  $('#font-cards').innerHTML = ATLAS.fonts.families
    .map((f) => {
      const s = samples[f.family] || { sample: f.family, role: f.role, font: 'sans-serif' };
      const kb = ATLAS.fonts.files
        .filter((x) => x.file.includes(f.family.toLowerCase().replace(/\s+/g, '-')))
        .reduce((a, b) => a + b.bytes, 0);
      return `<article class="font-card">
        <h3>${f.family}</h3>
        <p class="fc-role">${s.role}</p>
        <div class="fc-sample" style="font-family:${s.font}">${s.sample}</div>
        <div class="fc-meta">
          <span>${f.license} · ${t('fonts.meta.subset', { size: (kb / 1024).toFixed(0) })}</span>
          <span>${t('fonts.meta.local')}</span>
        </div>
      </article>`;
    })
    .join('');

  void cjk;
}

/* =========================================================
   4. 图标
   ========================================================= */
function renderIcons() {
  const cats = Object.entries(ATLAS.icons.categories);
  const bar = $('#icon-filters');
  const grid = $('#icon-grid');

  const mk = (key, label) =>
    `<button class="filter-chip ds-chip" data-cat="${key}" aria-pressed="${key === 'all'}">${
      key === 'all' ? t('icons.filter.all', { count: ATLAS.icons.count }) : `${label}`
    }</button>`;

  bar.innerHTML = mk('all', '全部') + cats.map(([k, v]) => mk(k, v)).join('');

  grid.innerHTML = ATLAS.icons.items
    .map(
      (i) => `<button class="icon-cell" data-cat="${i.category}" data-id="${i.name}" title="${i.label}">
        <svg aria-hidden="true"><use href="#atlas-icon-${i.name}"></use></svg>
        <b>${i.name}</b>
      </button>`,
    )
    .join('');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-chip');
    if (!btn) return;
    $$('.filter-chip', bar).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const cat = btn.dataset.cat;
    $$('.icon-cell', grid).forEach((c) => {
      c.classList.toggle('is-hidden', cat !== 'all' && c.dataset.cat !== cat);
    });
  });

  grid.addEventListener('click', async (e) => {
    const cell = e.target.closest('.icon-cell');
    if (!cell) return;
    const ref = `#atlas-icon-${cell.dataset.id}`;
    try {
      await navigator.clipboard.writeText(ref);
      toast(t('toast.copied', { ref }));
    } catch {
      toast(t('toast.ref', { ref }));
    }
  });
}

/* =========================================================
   5. 海报 / 封面 / 展柜 / 降级
   ========================================================= */
function renderPosters() {
  $('#poster-grid').innerHTML = ATLAS.eras
    .map(
      (e) => `<figure class="poster-card" data-lightbox="posters" data-id="${e.id}" tabindex="0">
        <div class="pc-frame">
          <img src="${asset(e.poster.png)}" alt="${e.name}年代海报：${e.tagline}" loading="lazy" width="1200" height="1800"/>
        </div>
        <figcaption class="pc-meta">
          <span>ERA ${String(e.index).padStart(2, '0')} · ${e.range}</span>
          <b>${e.name}</b>
          <em>${e.tagline}</em>
        </figcaption>
      </figure>`,
    )
    .join('');
}

function renderCovers() {
  $('#cover-grid').innerHTML = ATLAS.covers
    .map(
      (c) => `<figure class="cover-card" data-lightbox="covers" data-id="${c.id}" tabindex="0">
        <div class="cc-frame">
          <img src="${asset(c.png)}" alt="${c.name}" loading="lazy" width="1600" height="900"/>
        </div>
        <figcaption class="cc-meta"><b>${c.name}</b><span>1600 × 900</span></figcaption>
      </figure>`,
    )
    .join('');
}

function renderCases() {
  $('#case-grid').innerHTML = ATLAS.cases
    .map(
      (c) => `<figure class="case-card" data-lightbox="cases" data-id="${c.id}" tabindex="0">
        <div class="ccf-frame">
          <img src="${asset(c.png)}" alt="${c.name}展柜" loading="lazy" width="1000" height="1250"/>
        </div>
        <figcaption class="ccf-meta"><b>${c.name}</b><span>${c.label}</span></figcaption>
      </figure>`,
    )
    .join('');
}

function renderFallback() {
  $('#fallback-grid').innerHTML = ATLAS.fallback
    .map(
      (f) => `<figure class="fallback-card">
        <img src="${asset(f.png)}" alt="${f.id} 降级图" loading="lazy"/>
        <figcaption class="fc-meta"><b>${f.id}</b><span>${f.purpose}</span></figcaption>
      </figure>`,
    )
    .join('');
}

/* =========================================================
   6. 灯箱
   ========================================================= */
const LIGHTBOX_SETS = {
  posters: () => ATLAS.eras.map((e) => ({ src: e.poster.png, cap: `${e.name} · ${e.range} · ${e.tagline}` })),
  covers: () => ATLAS.covers.map((c) => ({ src: c.png, cap: c.name })),
  cases: () => ATLAS.cases.map((c) => ({ src: c.png, cap: `${c.name} · ${c.label}` })),
};
let lbSet = [];
let lbIndex = 0;
let lbReturnFocus = null;

function openLightbox(setName, id) {
  lbSet = LIGHTBOX_SETS[setName]();
  lbIndex = Math.max(0, lbSet.findIndex((x) => x.src.includes(id)));
  lbReturnFocus = document.activeElement;
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
  paintLightbox();
  /* 焦点移入弹层（16 §5：role=dialog + aria-modal + 焦点陷阱 + Esc + 焦点归还） */
  $('#lightbox-close').focus({ preventScroll: true });
}
function paintLightbox() {
  const item = lbSet[lbIndex];
  if (!item) return;
  $('#lightbox-img').src = asset(item.src);
  $('#lightbox-img').alt = item.cap;
  setText('#lightbox-cap', item.cap);
}
function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
  /* 焦点归还给打开者 */
  if (lbReturnFocus && typeof lbReturnFocus.focus === 'function') {
    lbReturnFocus.focus({ preventScroll: true });
  }
  lbReturnFocus = null;
}
function stepLightbox(d) {
  if (!lbSet.length) return;
  lbIndex = (lbIndex + d + lbSet.length) % lbSet.length;
  paintLightbox();
}

/** 焦点陷阱：Tab / Shift+Tab 在弹层内循环 */
function trapLightboxFocus(e) {
  if (e.key !== 'Tab') return;
  const box = $('#lightbox');
  if (box.hidden) return;
  const focusables = $$('button, [href], img[tabindex], [tabindex]:not([tabindex="-1"])', box)
    .filter((n) => n.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function wireLightbox() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-lightbox]');
    if (card) openLightbox(card.dataset.lightbox, card.dataset.id);
  });
  document.addEventListener('keydown', (e) => {
    const card = e.target.closest?.('[data-lightbox]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openLightbox(card.dataset.lightbox, card.dataset.id);
    }
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
    trapLightboxFocus(e);
  });
  $('#lightbox-close').addEventListener('click', closeLightbox);
  $('#lightbox-prev').addEventListener('click', () => stepLightbox(-1));
  $('#lightbox-next').addEventListener('click', () => stepLightbox(1));
  $('#lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
}

/* =========================================================
   7. 3D 查看器
   ========================================================= */
const state = { current: null, spinner: null, autoSpin: true, api: null };

function renderModelCards() {
  $('#model-cards').innerHTML = ATLAS.models
    .map(
      (m) => `<article class="model-card" data-id="${m.id}">
        <img src="${asset(m.png)}" alt="${m.name}渲染图" loading="lazy" width="1024" height="1024"/>
        <div class="mc-meta">
          <span>${m.range} · ${m.form}</span>
          <b>${m.name}</b>
          <em>${t('viewer.cardMeta', {
            parts: m.partCount,
            tris: m.triangleCount.toLocaleString(),
            kb: (m.glbBytes / 1024).toFixed(0),
          })}</em>
        </div>
      </article>`,
    )
    .join('');

  $('#model-tabs').innerHTML = ATLAS.models
    .map(
      (m) => `<button class="model-tab" role="tab" data-id="${m.id}" aria-selected="false">${m.name}</button>`,
    )
    .join('');

  $$('.model-card').forEach((c) => c.addEventListener('click', () => selectModel(c.dataset.id)));
  $$('.model-tab').forEach((t2) => t2.addEventListener('click', () => selectModel(t2.dataset.id)));
}

function updateSidePanel(m) {
  setText('#viewer-title', m.name);
  setText('#viewer-latin', `${m.latin} · ${m.form} · ${m.range}`);
  const specs = $('#viewer-specs');
  if (specs) {
    specs.innerHTML = `
    <dt>${t('viewer.spec.parts')}</dt><dd>${t('viewer.spec.partsValue', { n: m.partCount })}</dd>
    <dt>${t('viewer.spec.tris')}</dt><dd>${m.triangleCount.toLocaleString()}</dd>
    <dt>${t('viewer.spec.size')}</dt><dd>${m.dimensions.w} × ${m.dimensions.h} × ${m.dimensions.d} m</dd>
    <dt>${t('viewer.spec.format')}</dt><dd>GLB · ${(m.glbBytes / 1024).toFixed(0)} KB</dd>
    <dt>${t('viewer.spec.era')}</dt><dd>${m.range}</dd>`;
  }
  setText('#viewer-story', m.story);
  setText('#viewer-note', m.note);
  setHref('#link-glb', asset(m.glb));
  setHref('#link-png', asset(m.png));
  setHref('#link-tech', asset(m.techSvg));
  setHref('#link-json', asset(m.json));
}

/** 安全设置链接地址：目标不存在时跳过而不是抛错 */
function setHref(target, value) {
  const n = typeof target === 'string' ? $(target) : target;
  if (!n) return false;
  n.href = value;
  return true;
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

function showFallback(m) {
  const fb = $('#viewer-fallback');
  $('#viewer-fallback-img').src = asset(m.techSvg);
  $('#viewer-fallback-img').alt = `${m.name} 技术插画`;
  fb.hidden = false;
  $('#model-canvas').style.visibility = 'hidden';
}

async function selectModel(id) {
  const m = ATLAS.models.find((x) => x.id === id);
  if (!m) return;
  state.current = m;
  updateSidePanel(m);
  $$('.model-tab').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.id === id)));
  $$('.model-card').forEach((c) => c.classList.toggle('is-active', c.dataset.id === id));

  if (!hasWebGL()) {
    showFallback(m);
    toast(t('toast.noWebgl'));
    return;
  }

  const api = await ensureViewer();
  if (!api) {
    showFallback(m);
    return;
  }
  api.load(m);
}

/** 懒加载 three.js 并初始化查看器 */
async function ensureViewer() {
  if (state.api) return state.api;
  if (state.spinner) await state.spinner;

  state.spinner = (async () => {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

    const canvas = $('#model-canvas');
    const stage = canvas.parentElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.3;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;

    scene.add(new THREE.HemisphereLight(0xC6DCEE, 0x070D16, 0.3));
    const key = new THREE.DirectionalLight(0xFFF4E4, 1.85);
    key.position.set(2.2, 3.6, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -1.4;
    key.shadow.camera.right = 1.4;
    key.shadow.camera.top = 1.4;
    key.shadow.camera.bottom = -1.4;
    key.shadow.bias = -0.0009;
    key.shadow.normalBias = 0.014;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9FC4E8, 0.45);
    fill.position.set(-2.8, 1.5, 1.8);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xF0601F, 0.55);
    rim.position.set(-1.9, 1.9, -2.6);
    scene.add(rim);

    /* 展台与地面 */
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.64, 0.045, 48),
      new THREE.MeshStandardMaterial({ color: 0x16283D, roughness: 0.62, metalness: 0.18 }),
    );
    pedestal.position.y = -0.0225;
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    scene.add(pedestal);

    const fadeC = document.createElement('canvas');
    fadeC.width = fadeC.height = 256;
    const g2 = fadeC.getContext('2d');
    const grad = g2.createRadialGradient(128, 128, 20, 128, 128, 126);
    grad.addColorStop(0, 'rgba(14,30,48,1)');
    grad.addColorStop(1, 'rgba(8,17,29,0)');
    g2.fillStyle = grad;
    g2.fillRect(0, 0, 256, 256);
    const fadeTex = new THREE.CanvasTexture(fadeC);
    fadeTex.colorSpace = THREE.SRGBColorSpace;
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.2, 64),
      new THREE.MeshStandardMaterial({ map: fadeTex, transparent: true, depthWrite: false, roughness: 0.88 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.072;
    floor.receiveShadow = true;
    scene.add(floor);

    const loader = new GLTFLoader();
    let currentRoot = null;
    let camState = null;

    function resize() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    function frame(root) {
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const k = 1.0 / maxDim;

      const wrap = new THREE.Group();
      wrap.add(root);
      root.position.x -= center.x;
      root.position.z -= center.z;
      root.position.y -= box.min.y;
      root.scale.setScalar(k);
      scene.add(wrap);

      const scaled = new THREE.Box3().setFromObject(wrap);
      const c2 = new THREE.Vector3();
      scaled.getCenter(c2);

      const dist = 2.95;
      camera.position.set(dist * 0.72, c2.y + 0.62, dist * 0.8);
      camera.near = 1 / 60;
      camera.far = 60;
      camera.updateProjectionMatrix();
      controls.target.set(0, c2.y * 0.92, 0);
      controls.minDistance = dist * 0.5;
      controls.maxDistance = dist * 2.2;
      controls.update();
      camState = { dist, c2: c2.y };
      return wrap;
    }

    function load(model) {
      $('#viewer-fallback').hidden = true;
      canvas.style.visibility = 'visible';
      loader.load(
        asset(model.glb),
        (gltf) => {
          if (currentRoot) {
            scene.remove(currentRoot);
            currentRoot.traverse((o) => {
              if (o.geometry) o.geometry.dispose();
            });
          }
          currentRoot = frame(gltf.scene);
          renderer.render(scene, camera);
        },
        undefined,
        () => {
          showFallback(model);
        },
      );
    }

    function resetView() {
      if (!camState) return;
      const dist = camState.dist;
      camera.position.set(dist * 0.72, camState.c2 + 0.62, dist * 0.8);
      controls.target.set(0, camState.c2 * 0.92, 0);
      controls.update();
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (state.autoSpin && currentRoot) currentRoot.rotation.y += dt * 0.32;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    state.api = { load, resetView, renderer };
    return state.api;
  })();

  return state.spinner;
}

function wireViewerControls() {
  $('#btn-spin').addEventListener('click', (e) => {
    state.autoSpin = !state.autoSpin;
    e.currentTarget.setAttribute('aria-pressed', String(state.autoSpin));
    setText(e.currentTarget, state.autoSpin ? t('viewer.spin') : (getLang() === 'en' ? 'Rotation paused' : '已暂停旋转'));
  });
  $('#btn-reset').addEventListener('click', () => {
    if (state.api) state.api.resetView();
  });
}

/* =========================================================
   8. 语言切换
   ========================================================= */
function wireLangSwitch() {
  const btn = $('#lang-switch');
  if (!btn) return;
  const sync = () => {
    const isEn = getLang() === 'en';
    setText(btn, isEn ? '中文' : 'EN');
    btn.setAttribute('aria-pressed', String(isEn));
    btn.setAttribute('aria-label', isEn ? '切换到中文' : 'Switch to English');
  };
  btn.addEventListener('click', () => {
    setLang(getLang() === 'en' ? 'zh' : 'en');
    sync();
    applyI18n();
    /* 重新渲染依赖词条的模块 */
    run('heroStats', renderHeroStats);
    run('tokens', renderTokens);
    run('fonts', renderFonts);
    run('icons', renderIcons);
    run('modelCards', renderModelCards);
    if (state.current) run('sidePanel', () => updateSidePanel(state.current));
    sync();
  });
  sync();
}

/* =========================================================
   9. 入场动画（.ds-in）
   ========================================================= */
function wireEntryAnimation() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = $$('.section-head, .viewer, .model-tabs, .font-cards, .icon-grid, .poster-grid, .cover-grid, .case-grid, .model-cards, .fallback-grid');
  if (reduce) {
    nodes.forEach((n) => n.classList.add('is-in'));
    return;
  }
  nodes.forEach((n) => n.classList.add('ds-in'));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  nodes.forEach((n) => io.observe(n));
}

/* =========================================================
   10. 启动
   ========================================================= */
function boot() {
  /* 动态插值变量先行登记（字体子集字数要进文案） */
  setVar('count', ATLAS.fonts.cjkChars || 746);
  applyI18n();
  run('heroStats', renderHeroStats);
  run('tokens', renderTokens);
  run('fonts', renderFonts);
  run('icons', renderIcons);
  run('posters', renderPosters);
  run('covers', renderCovers);
  run('cases', renderCases);
  run('fallback', renderFallback);
  run('modelCards', renderModelCards);
  run('lightbox', wireLightbox);
  run('viewerControls', wireViewerControls);
  run('langSwitch', wireLangSwitch);
  run('entryAnimation', wireEntryAnimation);

  /* 注入图标雪碧 */
  fetch(asset('assets/icons/icons.svg'))
    .then((r) => r.text())
    .then((txt) => {
      const holder = el('div');
      holder.style.display = 'none';
      holder.innerHTML = txt;
      document.body.insertBefore(holder, document.body.firstChild);
    })
    .catch(() => toast(t('icons.title')));

  /* 默认选中第一件展品 */
  if (ATLAS.models.length) selectModel(ATLAS.models[0].id);

  /* 离线提示 */
  const chip = $('#net-chip');
  const updateNet = () => {
    if (!chip) return;
    const off = !navigator.onLine;
    setText(chip, off ? 'OFFLINE' : 'LOCAL');
    chip.classList.toggle('chip-live', !off);
    chip.title = off
      ? (getLang() === 'en' ? 'Offline: all assets are self-hosted and remain fully browsable' : '离线中：全部资源本地自托管，仍可完整浏览')
      : (getLang() === 'en' ? 'All assets are self-hosted' : '全部资源本地自托管');
  };
  window.addEventListener('online', updateNet);
  window.addEventListener('offline', updateNet);
  updateNet();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
