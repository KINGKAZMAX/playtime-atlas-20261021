/* =========================================================
   回响电玩馆 / PLAYTIME ATLAS — 美术包预览页
   数据来自 scripts/build-manifest.mjs 生成的 src/data.js
   ========================================================= */

import './styles.css';
import ATLAS from './data.js';
import TOKENS from '../public/assets/tokens.js';

/* ---------- 路径助手 ---------- */
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

/* ---------- 提示条 ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* =========================================================
   1. 顶部统计
   ========================================================= */
function renderHeroStats() {
  const box = $('#hero-stats');
  const c = ATLAS.counts;
  const stats = [
    [c.eras, '年代分段'],
    [c.covers, '封面'],
    [c.cases, '展柜'],
    [c.models, '3D 展品'],
    [c.icons, '原创图标'],
    [c.models ? ATLAS.models.reduce((s, m) => s + m.partCount, 0) : 0, '模型部件'],
  ];
  box.innerHTML = stats
    .map(([n, label]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join('');
}

/* =========================================================
   2. 设计令牌
   ========================================================= */
function renderTokens() {
  const groups = [
    ['ink', '墨蓝 Ink'],
    ['paper', '纸白 Paper'],
    ['signal', '信号橙 Signal'],
    ['teal', '辅助青 Teal'],
  ];
  $('#swatches').innerHTML = groups
    .map(([key, label]) => {
      const set = TOKENS.color[key];
      const cards = Object.entries(set)
        .reverse()
        .map(
          ([step, hex]) => `
          <div class="swatch">
            <div class="swatch-chip" style="background:${hex}"></div>
            <div class="swatch-meta">
              <b>${key}-${step}</b><span>${hex.toUpperCase()}</span>
            </div>
          </div>`,
        )
        .join('');
      return `<div style="grid-column:1/-1"><p class="token-title" style="margin-top:18px">${label}</p>
        <div class="swatches">${cards}</div></div>`;
    })
    .join('');

  const sem = TOKENS.semantic;
  $('#semantic').innerHTML = Object.entries(sem)
    .filter(([, v]) => typeof v === 'string' && v.startsWith('#'))
    .map(
      ([k, v]) => `<div class="swatch">
        <div class="swatch-chip" style="background:${v}"></div>
        <div class="swatch-meta"><b>${k}</b><span>${v.toUpperCase()}</span></div>
      </div>`,
    )
    .join('');

  const sizes = [
    ['display', '2.25rem'], ['xl', '1.75rem'], ['lg', '1.375rem'], ['md', '1.125rem'],
    ['base', '1rem'], ['sm', '0.875rem'], ['xs', '0.75rem'],
  ];
  $('#type-scale').innerHTML = sizes
    .map(
      ([k, v]) => `<div>
        <span class="ts-label">${k} · ${v}</span>
        <span class="ts-sample" style="font-size:${v}">回响电玩馆 Atlas</span>
      </div>`,
    )
    .join('');

  $('#space-scale').innerHTML = Object.entries(TOKENS.space)
    .map(
      ([k, v]) => `<div class="scale-item">
        <i style="width:${parseFloat(v) + 2}px;height:${parseFloat(v) + 2}px"></i>${k}
      </div>`,
    )
    .join('');

  $('#radius-scale').innerHTML = Object.entries(TOKENS.radius)
    .map(
      ([k, v]) => `<div class="scale-item">
        <i style="width:34px;height:34px;background:${TOKENS.color.signal[500]};border-radius:${v}"></i>${k}
      </div>`,
    )
    .join('');

  $('#shadow-scale').innerHTML = Object.entries(TOKENS.shadow)
    .map(
      ([k, v]) => `<div class="scale-item" style="padding:6px 12px;background:${TOKENS.color.ink[700]};border-radius:8px;box-shadow:${v}">${k}</div>`,
    )
    .join('');
}

/* =========================================================
   3. 字体
   ========================================================= */
function renderFonts() {
  const cjk = ATLAS.fonts.families.find((f) => f.family === 'Noto Sans SC');
  $('#cjk-count').textContent = '746';

  const samples = {
    'Space Grotesk': {
      sample: 'PLAYTIME ATLAS',
      role: '展示体 · 年代标题、编号、数字',
      font: "'Space Grotesk', sans-serif",
    },
    Inter: {
      sample: '电子游戏硬件年代馆的正文排版',
      role: '正文 · 段落、说明、界面文案',
      font: "'Inter', 'Noto Sans SC', sans-serif",
    },
    'Space Mono': {
      sample: 'ATLAS-ERA-02 · 1978—1983',
      role: '等宽 · 编号、年份、标签',
      font: "'Space Mono', monospace",
    },
    'Noto Sans SC': {
      sample: '回响电玩馆 · 街机黄金',
      role: '中文 · 全部汉字（子集 746 字）',
      font: "'Noto Sans SC', sans-serif",
    },
  };

  const total = (ATLAS.fonts.totalBytes / 1024).toFixed(0);
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
          <span>${f.license} · 子集 ${(kb / 1024).toFixed(0)} KB</span>
          <span>本地自托管</span>
        </div>
      </article>`;
    })
    .join('');

  if (!cjk) return;
}

/* =========================================================
   4. 图标
   ========================================================= */
function renderIcons() {
  const cats = Object.entries(ATLAS.icons.categories);
  const bar = $('#icon-filters');
  const grid = $('#icon-grid');

  const mk = (key, label) =>
    `<button class="filter-chip" data-cat="${key}" aria-pressed="${key === 'all'}">${
      key === 'all' ? `全部 ${ATLAS.icons.count}` : `${label}`
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
      toast(`已复制引用 ${ref}`);
    } catch {
      toast(`引用：${ref}`);
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

function openLightbox(setName, id) {
  lbSet = LIGHTBOX_SETS[setName]();
  lbIndex = Math.max(0, lbSet.findIndex((x) => x.src.includes(id)));
  $('#lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
  paintLightbox();
}
function paintLightbox() {
  const item = lbSet[lbIndex];
  if (!item) return;
  $('#lightbox-img').src = asset(item.src);
  $('#lightbox-img').alt = item.cap;
  $('#lightbox-cap').textContent = item.cap;
}
function closeLightbox() {
  $('#lightbox').hidden = true;
  document.body.style.overflow = '';
}
function stepLightbox(d) {
  if (!lbSet.length) return;
  lbIndex = (lbIndex + d + lbSet.length) % lbSet.length;
  paintLightbox();
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
          <em>${m.partCount} 部件 · ${m.triangleCount} 三角面 · ${(m.glbBytes / 1024).toFixed(0)} KB</em>
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
  $$('.model-tab').forEach((t) => t.addEventListener('click', () => selectModel(t.dataset.id)));
}

function updateSidePanel(m) {
  $('#viewer-title').textContent = m.name;
  $('#viewer-latin').textContent = `${m.latin} · ${m.form} · ${m.range}`;
  $('#viewer-specs').innerHTML = `
    <dt>部件数</dt><dd>${m.partCount} 件</dd>
    <dt>三角面</dt><dd>${m.triangleCount.toLocaleString()}</dd>
    <dt>尺寸</dt><dd>${m.dimensions.w} × ${m.dimensions.h} × ${m.dimensions.d} m</dd>
    <dt>格式</dt><dd>GLB · ${(m.glbBytes / 1024).toFixed(0)} KB</dd>
    <dt>年代</dt><dd>${m.range}</dd>`;
  $('#viewer-story').textContent = m.story;
  $('#viewer-note').textContent = m.note;
  $('#link-glb').href = asset(m.glb);
  $('#link-png').href = asset(m.png);
  $('#link-tech').href = asset(m.techSvg);
  $('#link-json').href = asset(m.json);
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
    toast('未检测到 WebGL，已切换技术插画降级图');
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
    e.currentTarget.textContent = state.autoSpin ? '自动旋转' : '已暂停旋转';
  });
  $('#btn-reset').addEventListener('click', () => {
    if (state.api) state.api.resetView();
  });
}

/* =========================================================
   8. 启动
   ========================================================= */
function boot() {
  renderHeroStats();
  renderTokens();
  renderFonts();
  renderIcons();
  renderPosters();
  renderCovers();
  renderCases();
  renderFallback();
  renderModelCards();
  wireLightbox();
  wireViewerControls();

  /* 注入图标雪碧 */
  fetch(asset('assets/icons/icons.svg'))
    .then((r) => r.text())
    .then((txt) => {
      const holder = el('div');
      holder.style.display = 'none';
      holder.innerHTML = txt;
      document.body.insertBefore(holder, document.body.firstChild);
    })
    .catch(() => toast('图标雪碧未加载'));

  /* 默认选中第一件展品 */
  if (ATLAS.models.length) selectModel(ATLAS.models[0].id);

  /* 离线提示 */
  const chip = $('#net-chip');
  const updateNet = () => {
    const off = !navigator.onLine;
    chip.textContent = off ? 'OFFLINE' : 'LOCAL';
    chip.classList.toggle('chip-live', !off);
    chip.title = off ? '离线中：全部资源本地自托管，仍可完整浏览' : '全部资源本地自托管';
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
