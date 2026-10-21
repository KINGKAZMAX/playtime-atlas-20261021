/**
 * viewer.js — 三维场景核心 / WebGL scene core
 *
 * 负责：渲染器 / 轨道相机 / 光照 / 拾取高亮 / 剖切面 / 层级可见性 /
 *      爆炸位移 / 分步组装 / 受力箭头 / 尺寸自适应。
 * 核心只依赖统一模型接口（见 model-api.js），不关心具体是哪件模型。
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PALETTE } from './materials.js';

const AXES = {
  x: { normal: new THREE.Vector3(-1, 0, 0), label: { zh: '前后切 (沿 X)', en: 'Front–back cut (along X)' } },
  z: { normal: new THREE.Vector3(0, 0, -1), label: { zh: '左右切 (沿 Z)', en: 'Side–side cut (along Z)' } },
  y: { normal: new THREE.Vector3(0, -1, 0), label: { zh: '水平切 (沿 Y)', en: 'Horizontal cut (along Y)' } },
};

export class Viewer {
  constructor(container, opts = {}) {
    this.container = container;
    this.onSelect = opts.onSelect || (() => {});
    this.onFrame = opts.onFrame || null;
    this.reducedMotion = !!opts.reducedMotion;

    this.model = null;
    this.parts = [];
    this.partById = new Map();
    this.meshes = [];
    this.materials = new Set();
    this.basePositions = new Map();
    this.layerVisible = new Map();
    this.explodeAmount = 0;
    this.assemblyStep = Infinity;
    this.assemblyTarget = Infinity;
    this.sectionEnabled = false;
    this.sectionAxis = 'z';
    this.sectionPosition = 0.5;
    this.forcesVisible = false;
    this.selectedId = null;
    this.clipped = [];

    this._initRenderer();
    this._initScene();
    this._initLights();
    this._initHelpers();
    this._bindResize();
    this._bindPointer();

    this.clock = new THREE.Clock();
    this._loop = this._loop.bind(this);
    this._raf = requestAnimationFrame(this._loop);
  }

  /* ------------------------------------------------------------ 初始化 */

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      // 保留绘制缓冲：使画布可被读回（自动化验收像素检查 / 用户右键另存）
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.localClippingEnabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.renderer.domElement);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 400);
    this.camera.position.set(7, 5, 9);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 80;
    this.controls.maxPolarAngle = Math.PI * 0.52;
    this.controls.target.set(0, 1.6, 0);
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.85;
  }

  _initLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xd8d2c6, 1.15);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff6e8, 2.0);
    key.position.set(6, 11, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 60;
    const d = 16;
    key.shadow.camera.left = -d; key.shadow.camera.right = d;
    key.shadow.camera.top = d; key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0009;
    key.shadow.normalBias = 0.022;
    this.scene.add(key);
    this.keyLight = key;

    const fill = new THREE.DirectionalLight(0xdfe6ee, 0.55);
    fill.position.set(-8, 5, -6);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(-3, 2, 9);
    this.scene.add(rim);
  }

  _initHelpers() {
    // 剖切面
    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    // 受力箭头容器
    this.forcesGroup = new THREE.Group();
    this.forcesGroup.visible = false;
    this.scene.add(this.forcesGroup);
    // 选中包围盒
    this.boxHelper = new THREE.Box3Helper(new THREE.Box3(), new THREE.Color(PALETTE.accent));
    this.boxHelper.visible = false;
    this.boxHelper.material.depthTest = false;
    this.boxHelper.material.transparent = true;
    this.boxHelper.renderOrder = 999;
    this.scene.add(this.boxHelper);
    // 地面阴影承接
    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(26, 64).rotateX(-Math.PI / 2),
      new THREE.ShadowMaterial({ opacity: 0.16 }),
    );
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  _bindResize() {
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(this.container);
    this.resize();
  }

  _bindPointer() {
    const el = this.renderer.domElement;
    let down = null;
    el.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    el.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 5) return;
      this._pick(e);
    });
    el.addEventListener('pointermove', (e) => {
      if (e.buttons) return;
      this._hover(e);
    });
  }

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;

    // 侧栏与控制面板会遮住画布：把模型平移到真正可见区域的中心
    let ox = 0;
    let oy = 0;
    const cr = this.container.getBoundingClientRect();
    const panel = document.getElementById('panel');
    const rail = document.getElementById('rail');
    const panelRect = panel ? panel.getBoundingClientRect() : null;
    const railRect = rail ? rail.getBoundingClientRect() : null;

    if (panelRect && panelRect.width > 0 && panelRect.height > 0) {
      if (panelRect.left >= cr.left + cr.width * 0.5) {
        // 面板在右侧：可见区为 [左栏右缘, 面板左缘]
        const freeLeft = railRect && railRect.width > 0 ? railRect.right : cr.left;
        const xv = ((freeLeft - cr.left) + (panelRect.left - cr.left)) / 2;
        ox = w / 2 - xv;
      } else if (panelRect.top >= cr.top + cr.height * 0.5) {
        // 面板在下方（移动端）：可见区为 [顶栏下缘, 面板上缘]
        const yv = (panelRect.top - cr.top) / 2;
        oy = h / 2 - yv;
      }
    }

    this.camera.aspect = w / h;
    if (ox !== 0 || oy !== 0) {
      this.camera.setViewOffset(w, h, ox, oy, w, h);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  /* ------------------------------------------------------------ 模型装载 */

  /** 装载一件模型：清空旧模型，构建新模型，收集拾取目标与材质。 */
  setModel(model, build) {
    this._clearModel();
    this.model = model;
    this.group = build.group;
    this.scene.add(this.group);
    this.parts = build.parts || [];
    this.forces = build.forces || [];

    this.parts.forEach((p, i) => {
      p.order = Number.isFinite(p.order) ? p.order : i;
      p.object.userData.partId = p.id;
      p.object.traverse((c) => { c.userData.partId = p.id; });
      this.partById.set(p.id, p);
      this.basePositions.set(p.id, p.object.position.clone());
    });

    this.meshes = [];
    this.materials = new Set();
    this.group.traverse((o) => {
      if (o.isMesh) {
        this.meshes.push(o);
        const list = Array.isArray(o.material) ? o.material : [o.material];
        list.forEach((m) => this.materials.add(m));
        o.castShadow = o.castShadow !== false;
        o.receiveShadow = true;
      }
    });
    this.materials.add(this.boxHelper.material);

    // 层级可见性初值：优先取模型声明的 defaultVisible
    this.layerVisible.clear();
    for (const l of (model.layers || [])) this.layerVisible.set(l.id, l.defaultVisible !== false);

    this._buildForces();
    this._applySection();
    this.applyTransforms();
    this.frameCamera();
    this.selectedId = null;
    this.boxHelper.visible = false;
  }

  _clearModel() {
    if (this.group) {
      this.scene.remove(this.group);
      disposeObject(this.group);
      this.group = null;
    }
    this.parts = [];
    this.partById.clear();
    this.meshes = [];
    this.basePositions.clear();
    this.layerVisible.clear();
    this.forcesGroup.clear();
    this.forces = [];
    // 清除旧模型的剖切设置
    for (const m of this.materials) m.clippingPlanes = null;
    this.materials = new Set([this.boxHelper.material]);
  }

  /* ------------------------------------------------------------ 交互状态 */

  setExplode(t) {
    this.explodeAmount = THREE.MathUtils.clamp(t, 0, 1);
    this.applyTransforms();
  }

  setAssembly(step) {
    this.assemblyTarget = step;
  }

  setAssemblyImmediate(step) {
    this.assemblyTarget = step;
    this.assemblyStep = step;
    this.applyTransforms();
  }

  setLayerVisible(layerId, visible) {
    this.layerVisible.set(layerId, !!visible);
    for (const p of this.parts) {
      if (p.layer === layerId) p.object.visible = !!visible;
    }
  }

  setLayerStates(states) {
    for (const p of this.parts) {
      if (states && Object.prototype.hasOwnProperty.call(states, p.layer)) {
        this.layerVisible.set(p.layer, !!states[p.layer]);
        p.object.visible = !!states[p.layer];
      }
    }
  }

  setSection(enabled, axis, position) {
    this.sectionEnabled = !!enabled;
    if (axis) this.sectionAxis = axis;
    if (typeof position === 'number') this.sectionPosition = position;
    this._applySection();
  }

  setForcesVisible(v) {
    this.forcesVisible = !!v;
    this.forcesGroup.visible = this.forcesVisible;
  }

  setAutoRotate(v) {
    this.controls.autoRotate = !!v && !this.reducedMotion;
  }

  /* ------------------------------------------------------------ 剖切面 */

  _applySection() {
    const planes = this.sectionEnabled ? [this.clipPlane] : null;
    const axis = AXES[this.sectionAxis] || AXES.z;
    this.clipPlane.normal.copy(axis.normal);
    const center = this._modelCenter();
    const radius = this._modelRadius();
    // position 0..1 → 平面沿法线方向在模型包围盒上滑动
    const half = this._modelExtentAlong(this.sectionAxis);
    const offset = -half + this.sectionPosition * half * 2;
    this.clipPlane.constant = -(axis.normal.dot(center) + offset);
    for (const m of this.materials) {
      m.clippingPlanes = planes;
      m.clipShadows = true;
      m.needsUpdate = true;
    }
  }

  _modelCenter() {
    if (!this.group) return new THREE.Vector3();
    const b = new THREE.Box3().setFromObject(this.group);
    return b.getCenter(new THREE.Vector3());
  }

  _modelRadius() {
    if (!this.group) return 4;
    const b = new THREE.Box3().setFromObject(this.group);
    const len = b.getSize(new THREE.Vector3()).length();
    return Number.isFinite(len) ? Math.max(0.001, len / 2) : 4;
  }

  _modelExtentAlong(axis) {
    if (!this.group) return 2;
    const b = new THREE.Box3().setFromObject(this.group);
    const s = b.getSize(new THREE.Vector3());
    const c = b.getCenter(new THREE.Vector3());
    const axisVec = axis === 'x' ? new THREE.Vector3(1, 0, 0)
      : axis === 'y' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
    const half = Math.abs(axisVec.x) * s.x / 2 + Math.abs(axisVec.y) * s.y / 2 + Math.abs(axisVec.z) * s.z / 2;
    return Math.max(0.5, half) ;
  }

  /* ------------------------------------------------------------ 变换计算 */

  applyTransforms() {
    if (!this.group) return;
    const spread = this._modelRadius() * 0.85;
    for (const p of this.parts) {
      const base = this.basePositions.get(p.id);
      if (!base) continue;
      const dir = p.explode.clone().normalize();
      const progress = this._partAssemblyProgress(p);
      if (progress <= 0.001) {
        p.object.visible = false;
        continue;
      }
      // 层级开关优先于组装进度：被隐藏的层在装配动画中不得重新出现
      const layerOn = this.layerVisible.get(p.layer);
      p.object.visible = layerOn !== false;
      // 注意：multiplyScalar 会就地修改向量，必须各自 clone
      const off = dir.clone().multiplyScalar(this.explodeAmount * spread);
      const settle = dir.clone().multiplyScalar((1 - progress) * spread * 0.45);
      p.object.position.copy(base).add(off).add(settle);
    }
    if (this.selectedId) this._updateBox();
  }

  _partAssemblyProgress(p) {
    if (!Number.isFinite(this.assemblyTarget)) return 1;
    const t = this.assemblyTarget - p.order + 1;
    return THREE.MathUtils.clamp(t, 0, 1);
  }

  /* ------------------------------------------------------------ 受力箭头 */

  _buildForces() {
    this.forcesGroup.clear();
    const colorOf = {
      load: PALETTE.force, thrust: PALETTE.accent, reaction: PALETTE.react,
      tension: PALETTE.force, seismic: PALETTE.accent, flow: PALETTE.water || '#8FA9AE',
    };
    for (const f of this.forces || []) {
      const from = new THREE.Vector3(...f.from);
      const to = new THREE.Vector3(...f.to);
      const dir = to.clone().sub(from);
      const len = dir.length();
      if (len < 1e-4) continue;
      const color = new THREE.Color(colorOf[f.kind] || PALETTE.force);
      const headLen = Math.min(0.26, len * 0.34);
      const shaftLen = Math.max(0.02, len - headLen);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, shaftLen, 10),
        new THREE.MeshStandardMaterial({ color, roughness: 0.45, emissive: color, emissiveIntensity: 0.18 }),
      );
      shaft.castShadow = false;
      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.075, headLen, 14),
        new THREE.MeshStandardMaterial({ color, roughness: 0.45, emissive: color, emissiveIntensity: 0.25 }),
      );

      const g = new THREE.Group();
      const mid = from.clone().addScaledVector(dir.clone().normalize(), shaftLen / 2);
      shaft.position.copy(mid);
      shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      head.position.copy(from.clone().addScaledVector(dir.clone().normalize(), shaftLen + headLen / 2));
      head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      g.add(shaft, head);
      g.userData.force = f;
      this.forcesGroup.add(g);
    }
  }

  /* ------------------------------------------------------------ 拾取 */

  _pick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hits = ray.intersectObjects(this.meshes, false);
    const hit = hits.find((h) => h.object.visible && h.object.userData.partId);
    this.selectPart(hit ? hit.object.userData.partId : null);
  }

  _hover(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hits = ray.intersectObjects(this.meshes, false);
    const hit = hits.find((h) => h.object.visible && h.object.userData.partId);
    this.renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
  }

  selectPart(id) {
    this.selectedId = id && this.partById.has(id) ? id : null;
    const part = this.selectedId ? this.partById.get(this.selectedId) : null;

    // 材质高亮
    for (const mesh of this.meshes) {
      const isSel = part && mesh.userData.partId === this.selectedId;
      const base = mesh.userData.baseMaterial || mesh.material;
      if (!mesh.userData.baseMaterial) {
        mesh.userData.baseMaterial = mesh.material;
      }
      const src = mesh.userData.baseMaterial;
      if (isSel) {
        if (!mesh.userData.hlMaterial) {
          const m = (Array.isArray(src) ? src[0] : src).clone();
          m.emissive = new THREE.Color(PALETTE.accent);
          m.emissiveIntensity = 0.42;
          mesh.userData.hlMaterial = m;
        }
        mesh.material = mesh.userData.hlMaterial;
      } else {
        mesh.material = src;
      }
    }
    this._updateBox();
    this.onSelect(part ? { ...part, object: undefined } : null);
  }

  _updateBox() {
    const part = this.selectedId ? this.partById.get(this.selectedId) : null;
    if (!part || !part.object.visible) { this.boxHelper.visible = false; return; }
    // three r169 的 Box3Helper 每帧由持有的 Box3 推导位置与缩放，写入 Box3 即可
    this.boxHelper.box.setFromObject(part.object);
    this.boxHelper.visible = true;
  }

  /* ------------------------------------------------------------ 相机 */

  frameCamera() {
    if (!this.group) return;
    const b = new THREE.Box3().setFromObject(this.group);
    if (b.isEmpty()) return;
    const center = b.getCenter(new THREE.Vector3());
    const size = b.getSize(new THREE.Vector3());
    if (![center.x, center.y, center.z, size.x, size.y, size.z].every(Number.isFinite)) {
      console.warn('[viewer] 模型包围盒含非法数值，保留当前机位');
      return;
    }
    const radius = Math.max(0.4, size.length() / 2);
    const dist = (radius / Math.sin((this.camera.fov * Math.PI) / 360)) * 1.02;
    if (!Number.isFinite(dist)) return;
    const dir = new THREE.Vector3(0.62, 0.42, 0.86).normalize();
    this.camera.position.copy(center).addScaledVector(dir, dist);
    this.controls.target.copy(center);
    this.camera.near = Math.max(0.02, dist / 500);
    this.camera.far = dist * 40;
    this.camera.updateProjectionMatrix();
    this.controls.update();

    // 地面阴影
    const floor = b.min.y - 0.001;
    this.ground.position.set(center.x, floor, center.z);
    const key = this.keyLight;
    key.target.position.copy(center);
    key.target.updateMatrixWorld();
    this.scene.add(key.target);
  }

  /** 恢复到模型默认机位（由 model.camera 指定）。 */
  resetView() {
    if (this.model && this.model.camera) {
      const { position, target } = this.model.camera;
      this.camera.position.set(...position);
      this.controls.target.set(...target);
      this.controls.update();
    } else {
      this.frameCamera();
    }
  }

  /* ------------------------------------------------------------ 循环 */

  _loop() {
    this._raf = requestAnimationFrame(this._loop);
    const dt = this.clock.getDelta();

    // 组装动画
    if (Math.abs(this.assemblyStep - this.assemblyTarget) > 1e-4) {
      const speed = this.reducedMotion ? 40 : 5.5;
      const delta = this.assemblyTarget - this.assemblyStep;
      this.assemblyStep += Math.sign(delta) * Math.min(Math.abs(delta), dt * speed);
      this.applyTransforms();
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    // 逐帧回调：驱动场景内标注层
    this.onFrame?.(this.camera, this.container.clientWidth || 1, this.container.clientHeight || 1);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this.controls.dispose();
    this._clearModel();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function disposeObject(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      if (m && m.userData && m.userData.shared) continue;
      m?.dispose?.();
    }
  });
}

export { AXES };
