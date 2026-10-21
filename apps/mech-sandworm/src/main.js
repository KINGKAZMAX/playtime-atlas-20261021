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
import { buildHarvester, PART_GROUPS } from './model/harvester.js';
import { createState, SCHEMA, DEFAULTS } from './model/params.js';
import { createCarapaceTexture, createBrushedTexture } from './model/textures.js';
import { METRES_PER_UNIT, WORK } from './model/constants.js';
import { createAnnotationLayer } from './ui/annotations.js';
import { createCameraRig } from './ui/cameras.js';
import { createControlPanel } from './ui/controlPanel.js';
import { drawCrownSection, drawLongSection, drawSurveyChart } from './ui/panels2d.js';

// --------------------------------------------------------------- boot state

const state = createState();
let stage = null;
let machine = null;
let annotations = null;
let cameraRig = null;
let panel = null;

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

  if (annotations) annotations.dispose();
  annotations = createAnnotationLayer(el.stage, stage.camera, machine);

  updateSpecs();
  drawTechnicalPanels();
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
function buildToolRail() {
  el.toolRail.innerHTML = '';

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
  }
  el.toolRail.appendChild(toolBlock);
}

function syncToolRail() {
  for (const b of el.toolRail.querySelectorAll('[data-preset]')) {
    b.classList.toggle('active', b.dataset.preset === cameraRig.current);
  }
  for (const b of el.toolRail.querySelectorAll('[data-tool]')) {
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
    clone.updateMatrixWorld(true);

    const exporter = new GLTFExporter();
    const result = await new Promise((resolve, reject) => {
      exporter.parse(clone, resolve, reject, {
        binary: true,
        onlyVisible: true,
      });
    });

    const blob = new Blob([result], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abyss-salvager-ac-vii-${state.segmentCount}seg.glb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    const kb = (blob.size / 1024).toFixed(0);
    toast(`GLB 导出成功 · ${kb} KB · ${state.segmentCount} 节体节`);
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
  buildModel();
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
  stage = createStage(el.stage);
  cameraRig = createCameraRig(stage.camera, stage.controls);

  buildToolRail();

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

  buildModel();

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
        state.showAnnotations
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
    resetAll,
    applyParam,
    PART_GROUPS,
    work: WORK,
  };
}

try {
  init();
} catch (err) {
  console.error('[init] failed', err);
  el.loader.innerHTML = `<div class="loader-inner"><p class="loader-cn">初始化失败：${err.message}</p></div>`;
}
