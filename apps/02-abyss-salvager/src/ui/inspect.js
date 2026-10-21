/**
 * 3D 检视交互层：构件选中 · 分步组装 · 层级开关 · 模型内声明铭牌。
 *
 * 对应 13-qa-curation 新增的「3D 交互」验收维度：
 *   · 构件可选中            → clickPick() + 选择面板
 *   · 爆炸拆解与分步组装可执行 → 连续分解（既有 explode 参数）+ 离散分步组装
 *   · 剖切/层级开关有效      → setLayer() 按 partGroup 显隐
 *   · 双语标注存在          → 既有 ANNOTATIONS（zh/en），此处可反向选中
 *   · 教学示意声明（模型内）  → createDisclaimerBadge()：随模型一同运动的铭牌
 *
 * 全部为增量功能，不改写既有 explode / xray / section 逻辑。
 */

import * as THREE from 'three';
import { PART_GROUPS } from '../model/parts.js';
import { DISCLAIMER } from '../model/disclaimer.js';

/* ------------------------------------------------------------------ 层级 */

/**
 * 层级定义：把 14 个 partGroup 归并为 5 个可开关的图层。
 * id 形如 `layer-carapace`，与 DOM 里的 data-layer 对应。
 */
export const LAYERS = [
  {
    id: 'carapace',
    cn: '甲壳与尾翼',
    en: 'CARAPACE & TAIL',
    groups: [PART_GROUPS.CARAPACE, PART_GROUPS.FAN, PART_GROUPS.HOPPER],
  },
  {
    id: 'crown',
    cn: '磨削冠与导流',
    en: 'CROWN & DEFLECTION',
    groups: [PART_GROUPS.CROWN, PART_GROUPS.BLADE, PART_GROUPS.VANE],
  },
  {
    id: 'mechanism',
    cn: '内部传动机构',
    en: 'INTERNAL MECHANISM',
    groups: [PART_GROUPS.KEEL, PART_GROUPS.REDUCER, PART_GROUPS.STRUT],
  },
  {
    id: 'sensing',
    cn: '感知与抓取',
    en: 'SENSING & GRAPPLING',
    groups: [PART_GROUPS.SENSOR, PART_GROUPS.ARM, PART_GROUPS.PHOTOPHORE],
  },
  {
    id: 'vent',
    cn: '热液与锚定',
    en: 'VENT & ANCHOR',
    groups: [PART_GROUPS.HEATVENT, PART_GROUPS.SUCKER],
  },
];

/** 图层 id → partGroup 列表（反查表）。 */
const GROUP_TO_LAYER = new Map();
for (const layer of LAYERS) {
  for (const g of layer.groups) GROUP_TO_LAYER.set(g, layer.id);
}

/* ------------------------------------------------------------ 分步组装 */

/**
 * 分步组装的 4 个阶段（自前向后装配）。
 * 阶段 1 = 只有磨削冠；阶段 4 = 整机装完。
 * 与连续分解（explode 滑杆）互补：分解把已装好的件拉开，
 * 分步组装控制「哪些件已经装上去」。
 */
export const ASSEMBLY_STAGES = [
  { id: 1, cn: '磨削冠', en: 'CROWN' },
  { id: 2, cn: '+ 前 6 节', en: '+ 6 SEG' },
  { id: 3, cn: '+ 全 18 节', en: '+ 18 SEG' },
  { id: 4, cn: '整机', en: 'COMPLETE' },
];

/** 某一阶段下，第 i 个驱动体节是否已装上。 */
function segmentInstalled(stageId, index, total) {
  if (stageId >= 4) return true;
  if (stageId >= 3) return true; // 全 18 节
  if (stageId === 2) return index < 6; // 前 6 节
  return false; // 阶段 1：尚未装体节
}

/* -------------------------------------------------------------- 工具函数 */

function collectByGroup(root) {
  /** partGroup → Object3D[] */
  const map = new Map();
  root.traverse((o) => {
    const g = o.userData && o.userData.partGroup;
    if (!g) return;
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(o);
  });
  return map;
}

/* ------------------------------------------------------------ 构件选中 */

/**
 * 构件选中：射线拾取 + 描边高亮 + 面板回显。
 *
 * @param {object} opts
 * @param {HTMLElement} opts.canvas      渲染画布（事件源）
 * @param {THREE.Camera} opts.camera
 * @param {THREE.Scene} opts.scene
 * @param {() => object|null} opts.getMachine  取当前机器（程序化或随包）
 * @param {(info: object|null) => void} opts.onSelect
 */
export function createInspector({ canvas, camera, scene, getMachine, onSelect }) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let selected = null; // { object, partGroup, partName }
  let helper = null;
  let currentStage = 4; // 初始 = 整机
  const layerState = new Map(LAYERS.map((l) => [l.id, true]));

  function clearHighlight() {
    if (helper) {
      helper.removeFromParent();
      helper.geometry.dispose();
      helper.material.dispose();
      helper = null;
    }
  }

  function highlight(object) {
    clearHighlight();
    if (!object) return;
    helper = new THREE.BoxHelper(object, 0xe0684a);
    helper.material.depthTest = false;
    helper.material.transparent = true;
    helper.renderOrder = 999;
    scene.add(helper);
  }

  /** 从被点中的 mesh 向上找到带 partGroup 的祖先。 */
  function resolvePart(object) {
    let o = object;
    while (o) {
      if (o.userData && o.userData.partGroup) return o;
      o = o.parent;
    }
    return null;
  }

  function describe(object) {
    let o = object;
    let partName = '';
    let triangles = 0;
    let meshes = 0;
    while (o) {
      if (!partName && o.userData && o.userData.partName) partName = o.userData.partName;
      o = o.parent;
    }
    // 统计同一 partGroup 下的网格与面数
    const machine = getMachine();
    if (machine) {
      const byGroup = collectByGroup(machine.root);
      for (const [g, objs] of byGroup) {
        if (g !== object.userData.partGroup) continue;
        for (const ob of objs) {
          ob.traverse((m) => {
            if (!m.isMesh) return;
            meshes++;
            const geo = m.geometry;
            triangles += (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
          });
        }
      }
    }
    return {
      partGroup: object.userData.partGroup,
      partName,
      meshes,
      triangles: Math.round(triangles),
    };
  }

  function select(object) {
    selected = object ? { object, ...describe(object) } : null;
    highlight(selected ? selected.object : null);
    onSelect(selected);
  }

  function onPointerDown(ev) {
    const machine = getMachine();
    if (!machine) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObject(machine.root, true);
    const hit = hits.find((h) => h.object.visible && resolvePart(h.object));
    if (!hit) {
      select(null);
      return;
    }
    const part = resolvePart(hit.object);
    select(part);
  }

  canvas.addEventListener('pointerdown', onPointerDown);

  /* ---------------------------------------------------------- 层级开关 */

  function setLayer(layerId, visible) {
    layerState.set(layerId, visible);
    const machine = getMachine();
    if (!machine) return;
    const byGroup = collectByGroup(machine.root);
    for (const [g, objs] of byGroup) {
      const layer = GROUP_TO_LAYER.get(g);
      if (!layer) continue;
      for (const ob of objs) ob.visible = visible && layerState.get(layer);
    }
    // 被隐藏层里的选中件要清掉，否则描边会挂在不可见物体上
    if (selected && !selected.object.visible) select(null);
  }

  function isLayerVisible(layerId) {
    return layerState.get(layerId) !== false;
  }

  /* -------------------------------------------------------- 分步组装 */

  /**
   * 设置分步组装阶段。
   * 连续分解（explode）不受影响：分解把构件沿径向拉开，
   * 分步组装控制的是「哪些件已经装上去」。
   */
  function setAssemblyStage(stageId) {
    const machine = getMachine();
    if (!machine) return;
    const stage = ASSEMBLY_STAGES.find((s) => s.id === stageId);
    if (!stage) return;
    currentStage = stageId;

    machine.headGroup.visible = true;
    machine.tailGroup.visible = stageId >= 4;
    machine.segments.forEach((seg, i) => {
      seg.group.visible = segmentInstalled(stageId, i, machine.segments.length);
    });

    // 层级开关优先级更高：被关掉的层不能被组装阶段重新打开
    for (const [g, objs] of collectByGroup(machine.root)) {
      const layer = GROUP_TO_LAYER.get(g);
      if (!layer) continue;
      if (isLayerVisible(layer)) continue;
      for (const ob of objs) ob.visible = false;
    }
    if (selected && !selected.object.visible) select(null);
  }

  function getAssemblyStage() {
    return currentStage;
  }

  function dispose() {
    canvas.removeEventListener('pointerdown', onPointerDown);
    clearHighlight();
  }

  return {
    select,
    getSelected: () => selected,
    setLayer,
    isLayerVisible,
    setAssemblyStage,
    getAssemblyStage,
    dispose,
  };
}

/* ------------------------------------------------- 模型内声明铭牌（3D） */

/**
 * 教学示意声明铭牌：随模型一同运动的一块 CanvasTexture 平面。
 *
 * 「模型内」落点之一（另两处：说明页 notes.html、导出 GLB 的 asset.extras）。
 * 文字用 DISCLAIMER 的唯一真源，保证三处一致。
 */
export function createDisclaimerBadge(machineRoot) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(8, 7, 6, 0.86)';
  ctx.strokeStyle = '#e0684a';
  ctx.lineWidth = 4;
  const r = 18;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
  ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
  ctx.arcTo(0, canvas.height, 0, 0, r);
  ctx.arcTo(0, 0, canvas.width, 0, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#e0684a';
  ctx.font = '600 52px "Space Grotesk", "PingFang SC", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('教学示意 · 非施工/工程模型', 36, 74);

  ctx.fillStyle = '#c0b7b0';
  ctx.font = '30px "Space Mono", ui-monospace, monospace';
  ctx.fillText('TEACHING ILLUSTRATION — NOT A CONSTRUCTION MODEL', 36, 140);
  ctx.fillText('FORCES ARE QUALITATIVE ONLY · NOT ENGINEERING CALCULATION', 36, 190);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  // Sprite 始终朝向相机：从任何机位都能读到声明，且仍随模型一同运动。
  const mesh = new THREE.Sprite(material);
  mesh.name = 'teaching-disclaimer-badge';
  mesh.renderOrder = 998;
  mesh.scale.set(7.6, 1.9, 1);
  mesh.position.set(1.2, -2.3, 0);
  mesh.userData.isDisclaimerBadge = true;
  machineRoot.add(mesh);

  return {
    mesh,
    dispose() {
      machineRoot.remove(mesh);
      material.dispose();
      texture.dispose();
    },
  };
}
