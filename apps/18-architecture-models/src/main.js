/**
 * main.js — 应用入口 / Application entry
 *
 * 榫构华夏 · Timber Craft Lab
 * 六件可拆解的中国传统建筑结构教学模型。
 * 全部几何程序化生成，零外部资源、零网络请求，可静态部署到 GitHub Pages 子路径。
 */
import './ui/styles.css';

import { initLang, setLang, getLang, t, tv, tb } from './core/i18n.js';
import { createMaterials } from './core/materials.js';
import { registerModel, listModels, getModel, validateBuild } from './core/model-api.js';
import { Viewer } from './core/viewer.js';
import { exportGLB, buildGLBBuffer, buildExportMetadata } from './core/glb.js';
import { hasWebGL, renderFallbackSVG } from './core/fallback.js';
import { Annotations } from './core/annotations.js';
import { Shell } from './ui/shell.js';
import { Panel } from './ui/panel.js';
import { Inspector } from './ui/inspector.js';

import dougong from './models/dougong.js';
import mortise from './models/mortise.js';
import taoliang from './models/taoliang.js';
import chuandou from './models/chuandou.js';
import stoneArch from './models/stone-arch.js';
import tulou from './models/tulou.js';

const MATERIALS = createMaterials();

/* --------------------------------------------------------------------------
   部署基址注入
   依据：16-design-system/MIGRATION-NOTES.md §6「运行时基准：由构建注入；
   本地预览用 ''」，以及同文件 §2.0 对本目录的要求（--ds-base 不得写死
   /playtime-atlas-20261021/，须适配任意 Pages 子路径）。

   src/ui/tokens.css 里的 --ds-base 保持 ""（与 16 的 src/tokens.css 逐字一致），
   实际值在运行时由构建期常量注入：Vite 的 base: './' → BASE_URL = './'。
   该值是**文档相对**基址，在 JS 中须用 new URL(x, document.baseURI) 拼接。
   -------------------------------------------------------------------------- */
export const BASE = import.meta.env.BASE_URL || './';
document.documentElement.style.setProperty('--ds-base', BASE);

for (const m of [dougong, mortise, taoliang, chuandou, stoneArch, tulou]) {
  registerModel(m);
}

const MODELS = listModels();

const state = {
  modelId: MODELS[0].id,
  explode: 0,
  assembly: null,        // null = 全部就位
  section: { enabled: false, axis: 'z', position: 0.5 },
  layers: {},
  forces: false,
  labels: true,
  autoRotate: false,
};

let viewer = null;
let shell = null;
let panel = null;
let inspector = null;
let annotations = null;
let currentBuild = null;
let currentModel = null;
let fallbackMode = false;

/* ------------------------------------------------------------------ 启动 */

function boot() {
  initLang();

  inspector = new Inspector();

  shell = new Shell(MODELS, {
    onSelect: (id) => loadModel(id),
    onToggleLang: () => {
      setLang(getLang() === 'zh' ? 'en' : 'zh');
      shell.applyLang();
      if (currentModel && currentBuild) shell.setModel(currentModel, currentBuild.parts.length);
    },
    onLangApplied: () => {
      panel?.render();
      panel?.setExplode(state.explode);
      panel?.setSection(state.section);
      panel?.setLabelsState(state.labels);
      for (const [id, on] of Object.entries(state.layers)) panel?.setLayerState(id, on);
      if (inspector.part) inspector.render();
      if (fallbackMode) renderFallback();
      updateHud();
      // 双语标注随语言重排
      if (currentBuild) annotations?.build(currentBuild.parts, currentModel?.layers || [], getLang());
    },
    onHelp: () => {
      shell.toast(t('helpBody'));
    },
    onEscape: () => inspector.clear(),
  });

  panel = new Panel(document.getElementById('panel-body'), {
    onExplode: (v) => {
      state.explode = v;
      viewer?.setExplode(v);
    },
    onAssembly: (step) => {
      state.assembly = step;
      const max = partsMax();
      if (step >= max) viewer?.setAssemblyImmediate(Infinity);
      else viewer?.setAssembly(step);
    },
    onSection: (s) => {
      state.section = { ...state.section, ...s };
      viewer?.setSection(s.enabled, s.axis, s.position);
    },
    onLayer: (id, on) => {
      state.layers[id] = on;
      viewer?.setLayerVisible(id, on);
    },
    onForces: (on) => {
      state.forces = on;
      viewer?.setForcesVisible(on);
      updateHud();
    },
    onLabels: (on) => {
      state.labels = on;
      annotations?.setEnabled(on);
      if (on && currentBuild) annotations?.build(currentBuild.parts, currentModel?.layers || [], getLang());
    },
    onResetView: () => viewer?.resetView(),
    onAutoRotate: (on) => {
      state.autoRotate = on;
      viewer?.setAutoRotate(on);
    },
    onExport: async () => {
      if (!currentBuild) return;
      shell.toast(t('exporting'));
      const res = await exportGLB(currentBuild.group, currentBuild.parts, `${currentModel.id}.glb`, currentModel);
      shell.toast(res.ok ? `${t('exported')} · ${(res.bytes / 1024).toFixed(1)} KB` : `${t('exportFailed')} · ${res.error || ''}`);
    },
  });

  // 三维或降级
  if (hasWebGL()) {
    const stage = document.getElementById('stage');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 场景内双语标注层
    annotations = new Annotations(document.getElementById('annotations'), (partId) => {
      viewer?.selectPart(partId);
    });
    annotations.setEnabled(state.labels);

    viewer = new Viewer(stage, {
      reducedMotion: reduced,
      onSelect: (part) => {
        if (part) inspector.show(part, currentModel);
        else inspector.clear();
      },
      onFrame: (camera, w, h) => annotations?.update(camera, w, h),
    });
  } else {
    fallbackMode = true;
    document.getElementById('stage').style.display = 'none';
    document.getElementById('fallback-host').classList.add('is-active');
    // 降级模式下标题区的徽标行会与示意图卡片顶边相撞（徽标换行后侵入卡片区域）。
    // 示意图卡片顶部的说明文字已包含教学示意声明，故此处收起徽标行以彻底消除重叠。
    document.body.classList.add('is-fallback');
  }

  updateHud();
  loadModel(state.modelId);

  exposePublicApi();
}

/* ------------------------------------------------------ 画布内 HUD 文案 */

/**
 * 教学示意声明的三处落点之一：3D 场景内（画布 HUD）。
 * 另两处：模型说明页（控制面板「关于本模型」）与导出物元数据（GLB extras）。
 * 场景内标牌中英双语同屏，与站点语言无关。
 */
function updateHud() {
  const dis = document.getElementById('hud-disclaimer');
  if (dis) {
    const d = tb('disclaimer');
    dis.innerHTML = `<b lang="${d.lang}">${escapeHtml(d.main)}</b>`
      + `<span lang="${d.altLang}">${escapeHtml(d.sub)}</span>`;
  }
  const fr = document.getElementById('hud-forces');
  if (fr) {
    const f = tb('forceArrowsNote');
    fr.innerHTML = `<b lang="${f.lang}">${escapeHtml(t('forces'))}</b>`
      + `<span lang="${f.altLang}">${escapeHtml(f.sub)}</span>`;
    fr.classList.toggle('is-on', !!state.forces);
  }
  const note = document.getElementById('fallback-note');
  if (note) {
    const d = tb('disclaimer');
    const f = tb('forceArrowsNote');
    note.textContent = `${t('fallbackTitle')} · ${t('fallbackHint')} · ${d.main} ${d.sub} · ${f.main} ${f.sub}`;
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* -------------------------------------------------------------- 模型装载 */

function partsMax() {
  if (!currentBuild) return 1;
  const maxOrder = currentBuild.parts.reduce(
    (a, p) => Math.max(a, Number.isFinite(p.order) ? p.order : 0),
    0,
  );
  return Math.max(1, maxOrder + 1);
}

function loadModel(id) {
  const model = getModel(id);
  if (!model) return;
  state.modelId = id;

  const build = model.build(MATERIALS);
  const errors = validateBuild(build, model);
  if (errors.length) {
    console.error(`[main] 模型 ${id} 未通过契约校验`, errors);
    shell.toast(`${id}: ${errors[0]}`);
  }
  currentModel = model;
  currentBuild = build;

  // 装配步数
  model.partsMax = partsMax();

  // 层级默认状态由模型声明（如屋面层默认隐藏，便于先看清构架）
  state.layers = {};
  for (const l of model.layers || []) state.layers[l.id] = l.defaultVisible !== false;

  panel.setModel(model, build.parts.length);
  panel.setExplode(state.explode);
  panel.setSection(state.section);
  for (const [lid, on] of Object.entries(state.layers)) panel.setLayerState(lid, on);

  if (fallbackMode) {
    renderFallback();
  } else {
    viewer.setModel(model, build);
    viewer.setExplode(state.explode);
    viewer.setAssemblyImmediate(Infinity);
    viewer.setForcesVisible(state.forces);
    viewer.setAutoRotate(state.autoRotate);
    viewer.setSection(state.section.enabled, state.section.axis, state.section.position);
    for (const [lid, on] of Object.entries(state.layers)) viewer.setLayerVisible(lid, on);
    annotations?.setEnabled(state.labels);
    annotations?.build(build.parts, model.layers || [], getLang());
  }

  shell.setModel(model, build.parts.length);
  inspector.clear();
  updateURL();
}

/* ------------------------------------------------------------ 降级示意图 */

function renderFallback() {
  if (!currentBuild) return;
  const parts = currentBuild.parts.filter((p) => state.layers[p.layer] !== false);
  const svg = renderFallbackSVG(currentBuild.group, parts, { lang: getLang() });
  document.getElementById('fallback-mount').innerHTML = svg;
}

/* ------------------------------------------------------------------ URL */

/**
 * 同步 URL hash（当前模型）。**必须保留查询串**，
 * 否则会抹掉 i18n 写入的 ?lang= 参数，hreflang 备选链接随即失效。
 */
function updateURL() {
  const hash = `#${state.modelId}`;
  if (window.location.hash === hash) return;
  try {
    const url = new URL(window.location.href);
    window.history.replaceState(null, '', url.pathname + url.search + hash);
  } catch {
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }
}

/* ------------------------------------------------------------ 公开接口 */

function exposePublicApi() {
  window.TimberCraftLab = {
    version: '1.1.0',
    title: { zh: '榫构华夏', en: 'Timber Craft Lab' },
    /** 部署基址（构建注入，随 Pages 子路径自适应）。JS 拼接资源请用 new URL(x, document.baseURI)。 */
    base: BASE,
    get lang() { return getLang(); },
    setLang,
    // 教学示意声明：与 3D 场景内 HUD、模型说明页、导出物元数据同源
    disclaimer: {
      zh: '教学示意，非施工/工程模型。',
      en: 'Teaching diagram — not a construction or engineering model.',
    },
    forceArrowsNote: {
      zh: '受力箭头为传力路径的定性说明，非结构计算结果。',
      en: 'Force arrows are a qualitative indication of load paths, not the result of a structural calculation.',
    },
    models: () => MODELS.map((m) => ({
      id: m.id,
      title: m.title,
      pinyin: m.pinyin,
      subtitle: m.subtitle,
      summary: m.summary,
      loadPath: m.loadPath,
      era: m.era,
      region: m.region,
      scaleNote: m.scaleNote,
      layers: m.layers,
      catalogRefs: m.catalogRefs || [],
    })),
    getModel: (id) => getModel(id),
    buildModel: (id) => {
      const m = getModel(id);
      return m ? m.build(MATERIALS) : null;
    },
    loadModel,
    selectPart: (partId) => viewer?.selectPart(partId),
    getState: () => ({ ...state }),
    viewer: () => viewer,
    annotations: () => annotations,
    /** 导出物元数据（与写入 GLB 根节点 extras 的内容一致）。 */
    exportMetadata: (id) => {
      const m = getModel(id);
      if (!m) return null;
      const b = m.build(MATERIALS);
      return buildExportMetadata(m, b.parts);
    },
    /** 直接取 GLB 二进制，不触发下载；供 19 号主站与验收脚本使用。 */
    exportGLBBuffer: async (id) => {
      const m = getModel(id);
      if (!m) return null;
      const b = m.build(MATERIALS);
      return buildGLBBuffer(b.group, b.parts, m);
    },
    exportGLB: async (id) => {
      const m = getModel(id);
      if (!m) return { ok: false, error: 'unknown model' };
      const b = m.build(MATERIALS);
      return exportGLB(b.group, b.parts, `${id}.glb`, m);
    },
  };
}

/* ------------------------------------------------------------------ 启动 */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

// 深链接：#stone-arch 直接打开对应模型
window.addEventListener('hashchange', () => {
  const id = window.location.hash.replace('#', '');
  if (id && id !== state.modelId && getModel(id)) loadModel(id);
});
