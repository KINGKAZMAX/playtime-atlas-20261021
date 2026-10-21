/**
 * 《渊甲拾遗者 / ABYSS-CARAPACE SALVAGER》 — application entry.
 *
 * An original interactive 3D machine showcase adapted from the mechanism of a
 * well-known MiniMax M3.1 Flash community build (a draggable, rotatable,
 * explodable true-3D machine page). The reference case's mechanism is studied;
 * its name, copy, terminology, typography, palette, layout and machine form
 * are all re-designed here.
 *
 * Everything is generated at runtime: geometry, textures, environment and the
 * 2D survey panels. No CDN, no runtime API calls, no external assets — the
 * built bundle is fully self-contained.
 */

import * as THREE from 'three';
import { createStage, THEMES } from './scene/stage.js';
import { buildHarvester } from './model/harvester.js';
import { PART_GROUPS, ANNOTATIONS, PART_LABELS } from './model/parts.js';
import { createState, SCHEMA, DEFAULTS } from './model/params.js';
import { createCarapaceTexture, createBrushedTexture } from './model/textures.js';
import { METRES_PER_UNIT, WORK } from './model/constants.js';
import { DISCLAIMER, disclaimerExtras } from './model/disclaimer.js';
import { assetUrl, applyBaseToDocument } from './paths.js';
import { createAnnotationLayer } from './ui/annotations.js';
import { createCameraRig } from './ui/cameras.js';
import { createControlPanel } from './ui/controlPanel.js';
import { createInspector, createDisclaimerBadge, LAYERS, ASSEMBLY_STAGES } from './ui/inspect.js';
import { installScrollClip } from './ui/scrollClip.js';
import { drawCrownSection, drawLongSection, drawSurveyChart } from './ui/panels2d.js';

// --------------------------------------------------------------- boot state

const state = createState();
let stage = null;
let machine = null;
let annotations = null;
let cameraRig = null;
let panel = null;
let inspector = null;
let disclaimerBadge = null;

/** Structural keys that require the model to be rebuilt rather than patched. */
const REBUILD_KEYS = new Set([
  'segmentCount',
  'segmentLength',
  'bodyRadius',
  'bladeCount',
  'tailBladeCount',
  'vaneCount',
]);

const assets = {
  carapaceMap: createCarapaceTexture(512, 7),
  brushedMap: createBrushedTexture(256, 21),
};

// ------------------------------------------------------------------- DOM refs

const el = {
  stage: document.getElementById('stage'),
  toolRail: document.getElementById('tool-rail'),
  controlPanel: document.getElementById('control-panel'),
  rightColumn: document.getElementById('right-column'),
  longSection: document.getElementById('long-section'),
  crownSection: document.getElementById('crown-section'),
  surveyChart: document.getElementById('survey-chart'),
  cycleBeats: document.getElementById('cycle-beats'),
  toast: document.getElementById('toast'),
  loader: document.getElementById('loader'),
  btnReset: document.getElementById('btn-reset'),
  btnExport: document.getElementById('btn-export'),
  btnModelDownload: document.getElementById('btn-model-download'),
  btnModelLoad: document.getElementById('btn-model-load'),
  modelSource: document.getElementById('model-source'),
  selBody: document.getElementById('sel-body'),
  layerBody: document.getElementById('layer-body'),
  assemblySteps: document.getElementById('assembly-steps'),
  discFlag: document.getElementById('disc-flag'),
  discText: document.getElementById('disc-text'),
  discLink: document.getElementById('disc-link'),
  webglFallback: document.getElementById('webgl-fallback'),
  fallbackLong: document.getElementById('fallback-long'),
  fallbackCrown: document.getElementById('fallback-crown'),
  fallbackNote: document.getElementById('fallback-note'),
  telemetry: {
    depth: document.getElementById('tel-depth'),
    temp: document.getElementById('tel-temp'),
    pressure: document.getElementById('tel-pressure'),
    cycle: document.getElementById('tel-cycle'),
  },
  spec: {
    length: document.getElementById('spec-length'),
    segments: document.getElementById('spec-segments'),
    tris: document.getElementById('spec-tris'),
    meshes: document.getElementById('spec-meshes'),
    mats: document.getElementById('spec-mats'),
    fps: document.getElementById('spec-fps'),
  },
};

const BEAT_LABELS = ['固着 GRIP', '收束 CONTRACT', '推进 DRIVE', '释压 RELAX'];

/* --------------------------------------------------- HUD 安全区（可读性） */

/**
 * 计算画布上**没有被 HUD 面板占住**的区域。
 *
 * 3D 场景的可读性优先于视觉统一（15-supervisor 派单第 2 条）：
 * 机器必须完整落在空出来的区域里，否则工具栈 / 卡片栏会压住模型。
 *
 * 做法：量出各面板的实际 DOM 矩形，取「左侧面板右缘」到「右侧面板左缘」、
 * 「顶栏下缘」到「底部面板上缘」之间的交集。
 */
const SAFE_AREA_PROBE_IDS = [
  'topbar',
  'tool-rail',
  'right-column',
  'card-specs',
  'card-survey-chart',
  'card-long-section',
  'cycle-meter',
  'assembly-bar',
  // 页脚同样参与避让：3D 标注胶囊不得压到声明与来源链接上
  // （D1 目视复核发现过「矿石抓取臂」胶囊与页脚文字互相压印）。
  'site-footer',
];

function computeSafeArea() {
  const viewW = el.stage.clientWidth || window.innerWidth;
  const viewH = el.stage.clientHeight || window.innerHeight;
  const rects = SAFE_AREA_PROBE_IDS.map((id) => document.getElementById(id))
    .filter((n) => n && n.offsetParent !== null)
    .map((n) => n.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0);
  if (!rects.length) {
    return { x: 0, y: 0, w: viewW, h: viewH, cx: viewW / 2, cy: viewH / 2, viewW, viewH };
  }

  const left = Math.max(0, ...rects.filter((r) => r.left < viewW * 0.45).map((r) => r.right));
  const right = Math.min(
    viewW,
    ...rects.filter((r) => r.left > viewW * 0.55).map((r) => r.left)
  );
  const top = Math.max(0, ...rects.filter((r) => r.top < viewH * 0.3).map((r) => r.bottom));
  const bottom = Math.min(
    viewH,
    ...rects.filter((r) => r.top > viewH * 0.7).map((r) => r.top)
  );

  const x = Math.min(left, viewW * 0.5);
  const w = Math.max(240, right - x);
  const y = Math.min(top, viewH * 0.4);
  const h = Math.max(200, bottom - y);
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, viewW, viewH };
}

/** HUD 面板矩形列表，供标注胶囊避让。 */
function collectReservedRects() {
  return SAFE_AREA_PROBE_IDS.map((id) => document.getElementById(id))
    .filter((n) => n && n.offsetParent !== null)
    .map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    })
    .filter((r) => r.w > 0 && r.h > 0);
}

/* ------------------------------------------------------- 双语构件名对照 */

/**
 * 构件的双语名（zh / en）由 src/model/parts.js 派生，
 * 保证标注、选择面板、层级开关与说明页用的是同一套 key。
 */

/* ---------------------------------------------------- 层级开关面板 */

function buildLayerPanel() {
  el.layerBody.innerHTML = '';
  for (const layer of LAYERS) {
    const row = document.createElement('div');
    row.className = 'layer-row';

    const label = document.createElement('div');
    const cn = document.createElement('span');
    cn.className = 'cn';
    cn.lang = 'zh-CN';
    cn.textContent = layer.cn;
    const en = document.createElement('span');
    en.className = 'en';
    en.lang = 'en';
    en.textContent = layer.en;
    label.append(cn, en);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toggle on';
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', `显示或隐藏图层：${layer.cn} / ${layer.en}`);
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(next));
      btn.classList.toggle('on', next);
      if (inspector) inspector.setLayer(layer.id, next);
    });

    row.append(label, btn);
    el.layerBody.appendChild(row);
  }
}

/* ---------------------------------------------------- 分步组装步进条 */

function buildAssemblyStepper() {
  el.assemblySteps.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'assembly-steps';
  for (const stage of ASSEMBLY_STAGES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'assembly-step';
    btn.textContent = `${stage.id} · ${stage.cn}`;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `组装阶段 ${stage.id}：${stage.cn} / ${stage.en}`);
    btn.addEventListener('click', () => {
      if (inspector) inspector.setAssemblyStage(stage.id);
      syncAssemblyStepper();
    });
    wrap.appendChild(btn);
  }
  el.assemblySteps.appendChild(wrap);
  syncAssemblyStepper();
}

function syncAssemblyStepper() {
  const current = inspector ? inspector.getAssemblyStage() : 4;
  Array.from(el.assemblySteps.children).forEach((btn, i) => {
    const on = ASSEMBLY_STAGES[i].id === current;
    btn.setAttribute('aria-pressed', String(on));
  });
}

/* ------------------------------------------------------ 构件选择面板 */

function renderSelection(info) {
  if (!info) {
    el.selBody.innerHTML =
      '<p class="sel-empty">在模型上单击任一构件即可选中并查看其名称与规模。<br />' +
      '<span lang="en">Click any part in the model to inspect it.</span></p>';
    return;
  }
  const label = PART_LABELS.get(info.partGroup);
  const cn = label ? label.cn : info.partGroup;
  const en = label ? label.en : info.partGroup;
  el.selBody.innerHTML = '';

  const name = document.createElement('div');
  name.className = 'sel-row';
  const cnEl = document.createElement('span');
  cnEl.className = 'sel-name';
  cnEl.lang = 'zh-CN';
  cnEl.textContent = cn;
  const enEl = document.createElement('span');
  enEl.className = 'sel-en';
  enEl.lang = 'en';
  enEl.textContent = en;
  name.append(cnEl, enEl);

  const meta = document.createElement('div');
  meta.className = 'sel-meta';
  meta.textContent = `网格 ${info.meshes} · 三角面 ${info.triangles.toLocaleString('en-US')}`;

  const tag = document.createElement('span');
  tag.className = 'ds-tag ds-tag--jade';
  tag.textContent = `分组 ${info.partGroup}`;

  el.selBody.append(name, meta, tag);
}

/* --------------------------------------------- WebGL 不可用时的 2D 降级 */

/**
 * 没有 WebGL 时不白屏：改为展示同一套参数生成的 2D 技术图。
 * 几何参数与 3D 模型同源（segmentCount / bodyRadius / bladeCount / vaneCount）。
 */
function showWebglFallback(reason) {
  el.loader.classList.add('hidden');
  el.webglFallback.classList.add('show');
  document.body.classList.add('ui-hidden');
  el.fallbackNote.textContent = `降级原因：${reason}。技术图参数：全长 760 m · ${state.segmentCount} 驱动体节 · Ø ${(
    state.bodyRadius * 2 * METRES_PER_UNIT
  ).toFixed(1)} m。${DISCLAIMER.flagZh}。`;

  // 2D 图用与 3D 面板同一套绘制函数，参数同源。
  drawLongSection(el.fallbackLong, {
    segmentCount: state.segmentCount,
    radius: state.bodyRadius,
    beat: 0,
  });
  drawCrownSection(el.fallbackCrown, {
    bladeCount: state.bladeCount,
    vaneCount: state.vaneCount,
    radius: state.bodyRadius,
    metresPerUnit: METRES_PER_UNIT,
  });
}


// -------------------------------------------------------------------- toast

let toastTimer = 0;
function toast(msg, ms = 2600) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('show'), ms);
}

// ------------------------------------------------------------------ rebuild

function disposeMachine() {
  if (!machine) return;
  stage.scene.remove(machine.root);
  machine.dispose();
  machine = null;
}

function buildModel() {
  disposeMachine();
  machine = buildHarvester(state, assets);
  stage.scene.add(machine.root);
  machine.applyXray(state.xray);
  machine.applyExplode(state.explode);

  // 模型真实包围盒 → 相机精确取景（在加铭牌之前量，铭牌不属于机器）。
  const box = new THREE.Box3().setFromObject(machine.root);
  const size = box.getSize(new THREE.Vector3());
  if (cameraRig) {
    cameraRig.setContentBounds({ hx: size.x / 2, hy: size.y / 2, hz: size.z / 2 });
  }

  if (annotations) annotations.dispose();
  annotations = createAnnotationLayer(el.stage, stage.camera, machine);

  // 教学示意声明铭牌：随模型一同运动（模型内落点）。
  if (disclaimerBadge) disclaimerBadge.dispose();
  disclaimerBadge = createDisclaimerBadge(machine.root);

  // 重建后恢复用户的层级开关与组装阶段。
  if (inspector) {
    for (const layer of LAYERS) inspector.setLayer(layer.id, inspector.isLayerVisible(layer.id));
    inspector.setAssemblyStage(inspector.getAssemblyStage());
  }

  updateSpecs();
  drawTechnicalPanels();
  if (cameraRig) cameraRig.refit();
}

/** Redraw the three 2D survey panels from the live machine state. */
function drawTechnicalPanels() {
  if (!machine) return;
  drawCrownSection(el.crownSection, {
    bladeCount: state.bladeCount,
    vaneCount: state.vaneCount,
    radius: state.bodyRadius,
    metresPerUnit: METRES_PER_UNIT,
  });
  drawLongSection(el.longSection, {
    segmentCount: state.segmentCount,
    radius: state.bodyRadius,
    beat: machine.beat,
  });
  drawSurveyChart(el.surveyChart, {
    track: machine.segments.map((s) => s.group.position),
  });
}

function updateSpecs() {
  if (!machine) return;
  let tris = 0;
  let meshes = 0;
  const matSet = new Set();
  machine.root.traverse((o) => {
    if (!o.isMesh) return;
    meshes++;
    const g = o.geometry;
    if (g.index) tris += g.index.count / 3;
    else if (g.attributes.position) tris += g.attributes.position.count / 3;
    if (o.material) matSet.add(o.material.uuid);
  });
  el.spec.length.textContent = `${Math.round(machine.lengthMetres).toLocaleString('en-US')} m`;
  el.spec.segments.textContent = `${state.segmentCount} 节`;
  el.spec.tris.textContent = Math.round(tris).toLocaleString('en-US');
  el.spec.meshes.textContent = String(meshes);
  el.spec.mats.textContent = String(matSet.size);
}

// ----------------------------------------------------------------- controls

function applyParam(key, value) {
  // The panel writes into `state` before calling us, but the API can also be
  // driven directly (keyboard shortcuts, automated QA). Assigning here keeps
  // the two paths identical and guarantees a rebuild actually sees the new
  // value.
  if (value !== undefined) state[key] = value;

  if (REBUILD_KEYS.has(key)) {
    buildModel();
    syncToolRail();
    return;
  }

  switch (key) {
    case 'plateColor':
      machine.materials.panel.color.set(value);
      machine.materials.panelInner.color.set(value).multiplyScalar(0.62);
      break;
    case 'accentColor':
      machine.materials.accent.color.set(value);
      machine.materials.accent.emissive.set(value);
      break;
    case 'ventColor':
      machine.materials.vent.color.set(value);
      machine.materials.vent.emissive.set(value);
      break;
    case 'metalRoughness':
      machine.materials.steel.roughness = value;
      machine.materials.darkSteel.roughness = Math.min(1, value + 0.24);
      break;
    case 'armorOpacity':
      if (!state.xray) {
        machine.materials.panel.opacity = value;
        machine.materials.panelInner.opacity = value;
      }
      break;
    case 'accentIntensity':
      machine.materials.accent.emissiveIntensity = value;
      break;
    case 'explode':
      machine.applyExplode(value);
      break;
    case 'xray':
      machine.applyXray(value);
      break;
    case 'sectionMode':
      applySection();
      break;
    case 'sectionPosition':
      applySection();
      break;
    case 'theme':
      stage.applyTheme(value, state);
      break;
    case 'exposure':
      stage.renderer.toneMappingExposure = value;
      break;
    case 'keyAzimuth':
    case 'keyElevation':
      stage.updateKey(state.keyAzimuth, state.keyElevation);
      break;
    case 'showTerrain':
      stage.terrain.terrainGroup.visible = value;
      break;
    case 'showSnow':
      stage.terrain.snow.visible = value;
      break;
    case 'showGrid':
      stage.terrain.grid.visible = value && (THEMES[state.theme]?.gridOpacity ?? 0) > 0;
      break;
    case 'showBloom':
      stage.bloomPass.strength = value ? (THEMES[state.theme]?.bloom ?? 0) : 0;
      break;
    case 'wireframe':
      for (const m of Object.values(machine.materials)) {
        if (m.wireframe !== undefined) m.wireframe = value;
        m.needsUpdate = true;
      }
      break;
    case 'showAnnotations':
      annotations.element.style.display = value ? 'block' : 'none';
      break;
    default:
      break;
  }

  // The state can also be driven from outside the panel (tool rail, keyboard
  // shortcut, automated QA), so push the new value back into the widget and
  // refresh the tool-rail highlight. Both are no-ops when the widget does not
  // exist yet during boot.
  if (panel) panel.syncKey(key);
  syncToolRail();
}

/**
 * Section view. Two modes:
 *   longitudinal — a plane cutting the machine along its length (near half off)
 *   crown        — a transverse plane just behind the milling crown
 */
const clipPlane = new THREE.Plane();
function applySection() {
  const mode = state.sectionMode;
  if (mode === 'off') {
    for (const m of Object.values(machine.materials)) {
      m.clippingPlanes = null;
      m.clipShadows = true;
      m.needsUpdate = true;
    }
    return;
  }

  const L = machine.lengthUnits;
  const t = state.sectionPosition;

  if (mode === 'longitudinal') {
    // Cut along X, removing everything with z > 0.
    clipPlane.set(new THREE.Vector3(0, 0, -1), 0);
  } else {
    // Transverse cut just behind the milling crown.
    clipPlane.set(new THREE.Vector3(-1, 0, 0), L * (1 - t) * 0.18 + 0.4);
  }

  for (const m of Object.values(machine.materials)) {
    m.clippingPlanes = [clipPlane];
    m.clipShadows = true;
    m.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- tool rail

/** Tool buttons in the left rail: camera presets + inspection toggles. */
const railButtons = { presets: [], tools: [] };

function buildToolRail() {
  el.toolRail.innerHTML = '';
  railButtons.presets = [];
  railButtons.tools = [];

  const camBlock = document.createElement('div');
  camBlock.className = 'rail-block';
  const camTitle = document.createElement('div');
  camTitle.className = 'rail-title';
  camTitle.textContent = '机位 VIEW';
  camBlock.appendChild(camTitle);

  for (const preset of cameraRig.presets) {
    const b = document.createElement('button');
    b.className = 'tool-btn';
    b.type = 'button';
    b.title = preset.hint;
    b.innerHTML = `<span class="cn">${preset.label.split(' / ')[0]}</span><span class="en">${preset.label.split(' / ')[1]}</span>`;
    b.dataset.preset = preset.id;
    b.addEventListener('click', () => {
      cameraRig.apply(preset.id);
      syncToolRail();
    });
    camBlock.appendChild(b);
    railButtons.presets.push(b);
  }
  el.toolRail.appendChild(camBlock);

  const toolBlock = document.createElement('div');
  toolBlock.className = 'rail-block';
  const toolTitle = document.createElement('div');
  toolTitle.className = 'rail-title';
  toolTitle.textContent = '检视 INSPECT';
  toolBlock.appendChild(toolTitle);

  const tools = [
    { id: 'explode', label: '分解', en: 'EXPLODE', toggle: true },
    { id: 'xray', label: 'X 光', en: 'X-RAY', toggle: true },
    { id: 'wireframe', label: '线框', en: 'WIRE', toggle: true },
    { id: 'annotations', label: '标注', en: 'LABELS', toggle: true },
    { id: 'section-long', label: '纵剖', en: 'LONG', toggle: false },
    { id: 'section-crown', label: '冠剖', en: 'CROWN', toggle: false },
  ];

  for (const t of tools) {
    const b = document.createElement('button');
    b.className = 'tool-btn';
    b.type = 'button';
    b.dataset.tool = t.id;
    b.innerHTML = `<span class="cn">${t.label}</span><span class="en">${t.en}</span>`;
    b.addEventListener('click', () => {
      if (t.id === 'explode') applyParam('explode', state.explode > 0.02 ? 0 : 0.85);
      else if (t.id === 'annotations') applyParam('showAnnotations', !state.showAnnotations);
      else if (t.id === 'section-long') {
        applyParam('sectionMode', state.sectionMode === 'longitudinal' ? 'off' : 'longitudinal');
      } else if (t.id === 'section-crown') {
        applyParam('sectionMode', state.sectionMode === 'crown' ? 'off' : 'crown');
      } else {
        applyParam(t.id, !state[t.id]);
      }
      syncToolRail();
    });
    toolBlock.appendChild(b);
    railButtons.tools.push(b);
  }
  el.toolRail.appendChild(toolBlock);
}

function syncToolRail() {
  if (!cameraRig) return;
  for (const b of railButtons.presets) {
    b.classList.toggle('active', b.dataset.preset === cameraRig.current);
  }
  for (const b of railButtons.tools) {
    const id = b.dataset.tool;
    let on = false;
    if (id === 'explode') on = state.explode > 0.02;
    else if (id === 'annotations') on = !!state.showAnnotations;
    else if (id === 'section-long') on = state.sectionMode === 'longitudinal';
    else if (id === 'section-crown') on = state.sectionMode === 'crown';
    else on = !!state[id];
    b.classList.toggle('active', on);
  }
}

// ------------------------------------------------------------------- export

/**
 * The GLB that ships with the build. It is fetched through a base-aware URL
 * so the page works unchanged from a domain root or from a sub-path such as
 * `/exhibits/02-abyss-salvager/`.
 */
const SHIPPED_MODEL_PATH = 'models/abyss-salvager-ac-vii.glb';

let shippedRoot = null;
let modelSource = 'procedural';

function setModelSource(source) {
  modelSource = source;
  const shipped = source === 'shipped';
  el.modelSource.textContent = shipped ? '随包 GLB · SHIPPED GLB' : '程序化模型 PROCEDURAL';
  el.btnModelLoad.querySelector('.btn-cn').textContent = shipped ? '还原' : '载入';
  el.btnModelLoad.querySelector('.btn-en').textContent = shipped ? 'BACK' : 'LOAD';
  el.btnModelLoad.classList.toggle('btn-primary', !shipped);
  // 随包 GLB 是**导出快照**，没有构件分组，选中 / 层级 / 分步组装三项只对
  // 程序化模型有效 —— 据实禁用，避免给出会失真的控制。
  document.body.dataset.modelSource = source;
  if (inspector && shipped) inspector.select(null);
}

/** Load the shipped GLB into the scene, replacing the procedural machine. */
async function loadShippedModel() {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const url = assetUrl(SHIPPED_MODEL_PATH);
  toast('正在载入随包 GLB…');
  const gltf = await new GLTFLoader().loadAsync(url);
  if (shippedRoot) {
    stage.scene.remove(shippedRoot);
    shippedRoot = null;
  }
  shippedRoot = gltf.scene;
  shippedRoot.name = 'shipped-salvager';
  shippedRoot.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  stage.scene.add(shippedRoot);
  machine.root.visible = false;
  setModelSource('shipped');
  cameraRig.apply('survey', true);
  syncToolRail();
  toast('随包 GLB 已载入场景，可继续拖拽旋转与缩放');
}

/** Put the procedural machine back and drop the loaded GLB. */
function restoreProcedural() {
  if (shippedRoot) {
    stage.scene.remove(shippedRoot);
    shippedRoot = null;
  }
  machine.root.visible = true;
  setModelSource('procedural');
  cameraRig.apply('survey', true);
  toast('已切回程序化模型');
}

/**
 * Patch the exported GLB's JSON chunk so the teaching-illustration notice
 * travels *with the file*.
 *
 * RESTYLE-SPEC §6.9 requires the notice to be visible in the export metadata;
 * a mesh in the scene is not enough — whoever opens the .glb in another tool
 * must still see it. glTF allows `asset.extras` for exactly this.
 *
 * The GLB layout is: 12-byte header | JSON chunk | BIN chunk.
 * We rewrite the JSON chunk in place (padding it to a 4-byte boundary) and
 * rebuild the container.
 */
function patchGlbDisclaimer(buffer) {
  const view = new DataView(buffer);
  const magic = view.getUint32(0, true);
  if (magic !== 0x46546c67) return buffer; // not 'glTF'
  const version = view.getUint32(4, true);
  if (version !== 2) return buffer;

  const total = view.getUint32(8, true);
  let offset = 12;
  let jsonChunk = null;
  while (offset < total) {
    const chunkLen = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    if (chunkType === 0x4e4f534a) {
      // JSON chunk
      const bytes = new Uint8Array(buffer, offset + 8, chunkLen);
      jsonChunk = new TextDecoder().decode(bytes);
    }
    offset += 8 + chunkLen;
    if (!jsonChunk) continue;
    break;
  }
  if (!jsonChunk) return buffer;

  const gltf = JSON.parse(jsonChunk);
  gltf.asset = gltf.asset || {};
  gltf.asset.extras = Object.assign({}, gltf.asset.extras, disclaimerExtras());
  gltf.asset.copyright = `渊甲拾遗者 AC-VII · ${DISCLAIMER.flagZh}`;

  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltf));
  const padded = (jsonBytes.length + 3) & ~3;
  const jsonChunkLen = padded;
  const binChunk = buffer.slice(offset);
  const newTotal = 12 + 8 + jsonChunkLen + binChunk.byteLength;

  const out = new ArrayBuffer(newTotal);
  const o = new Uint8Array(out);
  const ov = new DataView(out);
  ov.setUint32(0, 0x46546c67, true);
  ov.setUint32(4, 2, true);
  ov.setUint32(8, newTotal, true);
  ov.setUint32(12, jsonChunkLen, true);
  ov.setUint32(16, 0x4e4f534a, true);
  o.set(new Uint8Array(jsonBytes), 20);
  for (let i = jsonBytes.length; i < padded; i++) o[20 + i] = 0x20; // JSON chunk pads with spaces
  o.set(new Uint8Array(binChunk), 20 + jsonChunkLen);
  return out;
}

async function exportGLB() {
  const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
  el.btnExport.disabled = true;
  const prevLabel = el.btnExport.innerHTML;
  el.btnExport.innerHTML = '<span class="btn-cn">导出中…</span><span class="btn-en">EXPORTING</span>';

  try {
    // Export a clean copy: the live model may be mid-explode or mid-cycle.
    const clone = machine.root.clone(true);
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    // 声明铭牌是界面元素，不随模型导出（声明由 asset.extras 承载）。
    const badges = [];
    clone.traverse((o) => {
      if (o.userData && o.userData.isDisclaimerBadge) badges.push(o);
    });
    for (const b of badges) b.parent && b.parent.remove(b);
    clone.updateMatrixWorld(true);

    const exporter = new GLTFExporter();
    const result = await new Promise((resolve, reject) => {
      exporter.parse(clone, resolve, reject, {
        binary: true,
        onlyVisible: true,
      });
    });

    const patched = patchGlbDisclaimer(result);
    const blob = new Blob([patched], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abyss-salvager-ac-vii-${state.segmentCount}seg.glb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    const kb = (blob.size / 1024).toFixed(0);
    toast(`GLB 导出成功 · ${kb} KB · ${state.segmentCount} 节体节 · 含教学示意声明`);
  } catch (err) {
    console.error('[export] failed', err);
    toast(`GLB 导出失败：${err && err.message ? err.message : err}`);
  } finally {
    el.btnExport.disabled = false;
    el.btnExport.innerHTML = prevLabel;
  }
}

// -------------------------------------------------------------------- reset

function resetAll() {
  Object.assign(state, DEFAULTS);
  panel.syncAll();
  if (shippedRoot) {
    stage.scene.remove(shippedRoot);
    shippedRoot = null;
  }
  buildModel();
  machine.root.visible = true;
  setModelSource('procedural');
  stage.applyTheme(state.theme, state);
  stage.updateKey(state.keyAzimuth, state.keyElevation);
  applyParam('wireframe', false);
  applyParam('showAnnotations', true);
  applySection();
  cameraRig.apply('survey');
  syncToolRail();
  toast('已重置为默认参数与机位');
}

// --------------------------------------------------------------------- main

function init() {
  // 入口注入构建基准（MIGRATION-NOTES §6）：--ds-base 来自 import.meta.env.BASE_URL，
  // 不写死绝对根路径，域根与子路径下都成立。
  applyBaseToDocument();

  // WebGL 不可用时降级为 2D 技术图，而不是白屏。
  try {
    stage = createStage(el.stage);
  } catch (err) {
    console.error('[stage] WebGL unavailable, falling back to 2D panels', err);
    showWebglFallback(err && err.message ? err.message : 'WebGL context creation failed');
    return;
  }
  cameraRig = createCameraRig(stage.camera, stage.controls);

  buildToolRail();
  buildLayerPanel();
  buildAssemblyStepper();

  // 左右侧栏都是可滚动面板。overflow:auto 只裁剪绘制、不改布局坐标，
  // 被滚走的文字仍留在布局里，会与底部剖面板标题、页脚链接几何相交。
  // 这里让「滚出可见区」的文字真正不渲染（也不被重叠检测量到）。
  installScrollClip(el.toolRail);
  installScrollClip(el.rightColumn);

  // 教学示意声明：卡片 + 页脚（模型内见 3D 铭牌，导出元数据见 exportGLB）
  el.discFlag.textContent = DISCLAIMER.flagZh;
  el.discText.textContent = DISCLAIMER.bodyZh;
  el.discLink.setAttribute('title', DISCLAIMER.flagEn);

  // Manual orbit takes over from the preset rig.
  stage.controls.addEventListener('start', () => {
    cameraRig.breakLock();
    syncToolRail();
  });

  stage.renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    toast('WebGL 上下文丢失，请刷新页面');
  });

  // Re-frame the active preset whenever the viewport changes shape.
  let lastAspect = stage.camera.aspect;
  const onResize = () => {
    if (Math.abs(stage.camera.aspect - lastAspect) > 0.001) {
      lastAspect = stage.camera.aspect;
      cameraRig.refit();
    }
  };
  window.addEventListener('resize', onResize);

  // HUD 安全区 → 相机取景（机器必须完整落在没有面板遮挡的区域里）
  const applySafeArea = () => {
    const area = computeSafeArea();
    cameraRig.setSafeArea(area);
    cameraRig.refit();
  };
  applySafeArea();
  window.addEventListener('resize', applySafeArea);

  buildModel();

  // 构件选中 / 层级开关 / 分步组装的统一入口。
  inspector = createInspector({
    canvas: stage.renderer.domElement,
    camera: stage.camera,
    scene: stage.scene,
    getMachine: () => machine,
    onSelect: (info) => renderSelection(info),
  });

  stage.applyTheme(state.theme, state);
  stage.updateKey(state.keyAzimuth, state.keyElevation);
  applySection();

  // Frame the opening shot with the aspect-aware rig.
  cameraRig.apply('survey', true);
  syncToolRail();

  panel = createControlPanel(el.controlPanel, state, SCHEMA, applyParam);
  // Push initial values into the widgets that need a side effect too.
  applyParam('accentIntensity', state.accentIntensity);
  applyParam('wireframe', state.wireframe);
  applyParam('showAnnotations', state.showAnnotations);

  el.btnExport.addEventListener('click', exportGLB);
  el.btnReset.addEventListener('click', resetAll);

  // The shipped model lives under public/ and is copied into the build output.
  // Resolve it against the build base so sub-path hosting keeps working.
  el.btnModelDownload.href = assetUrl(SHIPPED_MODEL_PATH);
  el.btnModelLoad.addEventListener('click', () => {
    if (modelSource === 'shipped') {
      restoreProcedural();
    } else {
      loadShippedModel().catch((err) => {
        console.error('[model] failed to load shipped GLB', err);
        toast(`随包 GLB 载入失败：${err && err.message ? err.message : err}`);
      });
    }
  });
  setModelSource('procedural');

  // Clean-view toggle — hides every chrome layer so the model can be
  // inspected or captured on its own.
  const toggleUI = () => {
    document.body.classList.toggle('ui-hidden');
  };
  document.getElementById('ui-restore').addEventListener('click', toggleUI);
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    if (e.key === 'h' || e.key === 'H') toggleUI();
    if (e.key === 'r' || e.key === 'R') resetAll();
    if (e.key === 'x' || e.key === 'X') applyParam('xray', !state.xray);
    if (e.key === 'e' || e.key === 'E') applyParam('explode', state.explode > 0.02 ? 0 : 0.85);
    // Esc 取消构件选中
    if (e.key === 'Escape' && inspector) {
      inspector.select(null);
      renderSelection(null);
    }
  });

  // Build the 4-beat cycle meter.
  el.cycleBeats.innerHTML = '';
  for (const label of BEAT_LABELS) {
    const d = document.createElement('div');
    d.className = 'cycle-beat';
    d.textContent = label;
    el.cycleBeats.appendChild(d);
  }

  // ------------------------------------------------------------ main loop
  const clock = new THREE.Clock();
  let fpsAccum = 0;
  let fpsFrames = 0;
  let panelTimer = 0;

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    if (machine) {
      machine.update(dt, elapsed);
      // Keep the machine's own floodlight riding the milling crown.
      stage.lights.headGlow.position.set(
        machine.headGroup.position.x + 0.4,
        1.4,
        0
      );
    }

    cameraRig.update(dt);
    stage.controls.update();
    stage.updateParticles(elapsed, dt);
    stage.render();

    if (annotations) {
      annotations.update(
        el.stage.clientWidth,
        el.stage.clientHeight,
        state.showAnnotations,
        collectReservedRects()
      );
    }

    // FPS
    fpsAccum += dt;
    fpsFrames++;
    if (fpsAccum >= 0.5) {
      el.spec.fps.textContent = `${Math.round(fpsFrames / fpsAccum)} fps`;
      fpsAccum = 0;
      fpsFrames = 0;
    }

    // Survey panels + telemetry refresh at 6 Hz — they are the expensive redraws.
    panelTimer += dt;
    if (panelTimer > 0.16) {
      panelTimer = 0;
      if (machine) {
        drawLongSection(el.longSection, {
          segmentCount: state.segmentCount,
          radius: state.bodyRadius,
          beat: machine.beat,
        });
        drawSurveyChart(el.surveyChart, {
          track: machine.segments.map((s) => s.group.position),
        });
      }
      el.telemetry.temp.textContent = `${(1.8 + Math.sin(elapsed * 0.7) * 0.45).toFixed(1)} °C`;
      el.telemetry.pressure.textContent = `${(441.6 + Math.sin(elapsed * 0.31) * 0.8).toFixed(1)} atm`;
      el.telemetry.cycle.textContent = machine ? machine.beatLabel : '—';
    }
  }

  // Cycle beat highlight
  let lastBeat = -1;
  function beatWatcher() {
    if (machine && machine.beat !== lastBeat) {
      lastBeat = machine.beat;
      const kids = el.cycleBeats.children;
      for (let i = 0; i < kids.length; i++) {
        kids[i].classList.toggle('active', i === machine.beat);
      }
    }
    requestAnimationFrame(beatWatcher);
  }
  requestAnimationFrame(beatWatcher);

  frame();

  // Hide the loader once the first frame is on screen.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.loader.classList.add('hidden');
      setTimeout(() => el.loader.remove(), 600);
    });
  });

  // Expose a small handle for automated QA in the browser.
  window.__abyss = {
    state,
    get machine() {
      return machine;
    },
    get stage() {
      return stage;
    },
    cameraRig,
    exportGLB,
    loadShippedModel,
    restoreProcedural,
    resetAll,
    applyParam,
    PART_GROUPS,
    work: WORK,
    get modelSource() {
      return modelSource;
    },
    get shippedRoot() {
      return shippedRoot;
    },
    // 3D 交互（构件选中 / 层级开关 / 分步组装）——供自动化验收断言
    get inspector() {
      return inspector;
    },
    get disclaimerBadge() {
      return disclaimerBadge ? disclaimerBadge.mesh : null;
    },
    setLayer: (id, on) => inspector && inspector.setLayer(id, on),
    isLayerVisible: (id) => (inspector ? inspector.isLayerVisible(id) : true),
    setAssemblyStage: (n) => {
      if (!inspector) return;
      inspector.setAssemblyStage(n);
      syncAssemblyStepper();
    },
    getAssemblyStage: () => (inspector ? inspector.getAssemblyStage() : null),
    getSelected: () => (inspector ? inspector.getSelected() : null),
    selectPart: (group) => {
      // 以分组为单位选中第一个属于该分组的构件（自动化用）
      if (!machine) return null;
      let found = null;
      machine.root.traverse((o) => {
        if (found) return;
        if (o.userData && o.userData.partGroup === group) found = o;
      });
      if (found && inspector) inspector.select(found);
      return found ? found.userData.partGroup : null;
    },
  };
}

try {
  init();
} catch (err) {
  console.error('[init] failed', err);
  el.loader.innerHTML = `<div class="loader-inner"><p class="loader-cn">初始化失败：${err.message}</p></div>`;
}
