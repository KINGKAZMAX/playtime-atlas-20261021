/**
 * 3D 展厅 · three.js 场景
 *
 * 展厅中的所有「展品」都是用基础几何体程序化拼出的**原创简化体块**，
 * 不含任何品牌外形复刻、贴图或商标元素。场景本身是可选项：
 * 无 WebGL、无 three.js 加载失败时，页面会退回 2D 目录。
 *
 * 操作：拖拽转视角 · 滚轮/↑↓ 沿长廊移动 · WASD 移动 · 点击展柜查看详情
 */

import * as THREE from 'three';
import { ERA_BY_ID } from '../data/eras.js';

const INK = 0x0a1120;
const SIGNAL = 0xff6b2c;
const PAPER = 0xf4ede0;

/* ── 原创体块造型 ──────────────────────────────────────────────────────────── */
const BUILDERS = {
  e01: () => [ // 继电器机柜 + 纸带卷
    box(1.5, 2.6, 0.9, 0x22304a, 0, 1.3, 0),
    box(1.2, 0.12, 0.7, 0x3b5179, 0, 1.85, 0.06),
    cyl(0.42, 0.42, 0.16, 0xd9b54c, 0, 0.45, 0.3, 'x'),
  ],
  e02: () => [ // 雷达环 + 示波球
    torus(0.78, 0.055, 0x9aa7ff, 0, 1.5, 0, 'y'),
    sphere(0.26, 0x9aa7ff, 0, 1.5, 0),
    cyl(0.22, 0.3, 0.9, 0x22304a, 0, 0.45, 0),
  ],
  e03: () => [ // 街机柜
    box(0.95, 1.9, 0.75, 0x1b2b46, 0, 0.95, 0),
    box(0.75, 0.5, 0.1, SIGNAL, 0, 1.42, 0.38),
    box(0.8, 0.16, 0.2, 0x0d1526, 0, 1.0, 0.36),
    box(0.95, 0.12, 0.5, 0x0d1526, 0, 0.06, 0),
  ],
  e04: () => [ // 宽体主机 + 卡带
    box(1.9, 0.34, 0.72, 0x2a3a58, 0, 0.28, 0),
    box(0.2, 0.1, 0.16, SIGNAL, 0.7, 0.44, 0.1),
    box(0.26, 0.5, 0.08, PAPER, -0.6, 0.68, 0.1),
  ],
  e05: () => [ // 方形主机 + 手柄
    box(0.7, 0.55, 0.7, 0x34405c, -0.45, 0.32, 0),
    box(0.62, 0.12, 0.5, 0x22304a, 0.55, 0.1, 0.1),
    cyl(0.06, 0.06, 0.16, SIGNAL, 0.62, 0.2, 0.1, 'y'),
  ],
  e06: () => [ // 三维主机 + 光盘
    box(0.42, 0.2, 0.62, 0x1f2c46, -0.3, 0.14, 0),
    cyl(0.34, 0.34, 0.03, 0x7bd3f0, 0.55, 0.2, 0, 'x'),
  ],
  e07: () => [ // 服务器塔 + 节点
    box(0.7, 1.7, 0.5, 0x22304a, 0, 0.9, 0),
    ...[0, 1, 2].map((i) => box(0.6, 0.1, 0.06, 0x57d6a6, 0, 0.6 + i * 0.42, 0.26)),
    sphere(0.14, 0x57d6a6, 0.75, 1.6, 0),
  ],
  e08: () => [ // 触屏板 + 云块
    box(0.9, 0.05, 1.3, 0x22304a, -0.2, 0.9, 0, 0.2),
    box(0.8, 0.9, 0.06, 0x0d1526, -0.2, 1.3, -0.6),
    sphere(0.3, 0xff9f45, 0.6, 1.9, 0.1),
  ],
  e09: () => [ // 头显
    box(0.95, 0.4, 0.5, 0x2f3b57, 0, 1.15, 0),
    box(0.34, 0.22, 0.1, 0xb48cff, -0.22, 1.15, 0.26),
    box(0.34, 0.22, 0.1, 0xb48cff, 0.22, 1.15, 0.26),
    cyl(0.06, 0.06, 0.5, 0x22304a, 0, 0.82, 0, 'y'),
  ],
  e10: () => [ // 现代主机 + 掌机
    box(0.55, 0.9, 0.3, 0x2a3a58, -0.45, 0.45, 0),
    box(0.42, 0.08, 0.2, SIGNAL, -0.45, 0.92, 0.06),
    box(0.5, 0.1, 0.8, 0x1f2c46, 0.5, 0.1, 0),
    box(0.44, 0.3, 0.62, 0x0d1526, 0.5, 0.28, 0),
  ],
};

/* ── 几何辅助 ──────────────────────────────────────────────────────────────── */
const geoCache = new Map();
function cached(key, make) {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key);
}
function box(w, h, d, color, x, y, z, rotX = 0) {
  const g = cached(`box${w}${h}${d}`, () => new THREE.BoxGeometry(w, h, d));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.12 }));
  m.position.set(x, y, z);
  if (rotX) m.rotation.x = rotX;
  return m;
}
function cyl(rt, rb, h, color, x, y, z, axis = 'y') {
  const g = cached(`cyl${rt}${rb}${h}`, () => new THREE.CylinderGeometry(rt, rb, h, 24));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.15 }));
  m.position.set(x, y, z);
  if (axis === 'x') m.rotation.z = Math.PI / 2;
  if (axis === 'z') m.rotation.x = Math.PI / 2;
  return m;
}
function sphere(r, color, x, y, z) {
  const g = cached(`sph${r}`, () => new THREE.SphereGeometry(r, 24, 16));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1, emissive: color, emissiveIntensity: 0.25 }));
  m.position.set(x, y, z);
  return m;
}
function torus(r, tube, color, x, y, z, axis = 'y') {
  const g = cached(`tor${r}${tube}`, () => new THREE.TorusGeometry(r, tube, 12, 40));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2, emissive: color, emissiveIntensity: 0.45 }));
  m.position.set(x, y, z);
  if (axis === 'y') m.rotation.x = Math.PI / 2;
  return m;
}

/* ── 场景构建 ──────────────────────────────────────────────────────────────── */
export function buildHallScene(canvas, { eras, onSelect }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(INK, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(INK, 0.032);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 220);

  scene.add(new THREE.HemisphereLight(0x8fa8d8, 0x0a1120, 0.55));
  const key = new THREE.DirectionalLight(0xffd9c0, 0.55);
  key.position.set(3, 8, 4);
  scene.add(key);
  const rim = new THREE.PointLight(SIGNAL, 26, 26, 2);
  rim.position.set(0, 3.2, -6);
  scene.add(rim);

  // 地面 + 长廊灯带
  const floorGeo = new THREE.PlaneGeometry(14, 120);
  const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x0d1526, roughness: 0.94, metalness: 0.04 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -40;
  scene.add(floor);

  for (let i = 0; i < 22; i += 1) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 1.7),
      new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? SIGNAL : 0x2b3a58, transparent: true, opacity: i % 4 === 0 ? 0.85 : 0.5 }),
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(i % 2 === 0 ? -3.2 : 3.2, 0.012, -i * 4.4);
    scene.add(strip);
  }

  // 展柜（pedestal）
  const eraList = [...eras.values()].sort((a, b) => a.from - b.from);
  const picks = [];
  const pickables = [];

  eraList.forEach((era, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const z = -6 - Math.floor(i / 2) * 9.5;
    const x = side * 3.4;

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.9, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x141f36, roughness: 0.85, metalness: 0.08 }),
    );
    pedestal.position.set(x, 0.45, z);
    scene.add(pedestal);

    const rimLight = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 0.035, 1.56),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(era.accent), transparent: true, opacity: 0.75 }),
    );
    rimLight.position.set(x, 0.92, z);
    scene.add(rimLight);

    const group = new THREE.Group();
    group.position.set(x, 0.92, z);
    const builder = BUILDERS[era.id];
    const parts = builder ? builder() : [box(0.8, 0.8, 0.8, 0x2a3a58, 0, 0.4, 0)];
    parts.forEach((p) => group.add(p));
    scene.add(group);

    const accent = new THREE.PointLight(new THREE.Color(era.accent), 8, 9, 2);
    accent.position.set(x, 2.1, z);
    scene.add(accent);

    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.4, 1.8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hit.position.set(x, 1.5, z);
    hit.userData = { eraId: era.id, label: era.label, code: era.code };
    scene.add(hit);
    pickables.push(hit);

    picks.push({ era, position: new THREE.Vector3(x, 2.3, z) });
  });

  /* ── 控制器 ── */
  const state = {
    yaw: 0,
    pitch: -0.04,
    pos: new THREE.Vector3(0, 1.72, 3.2),
    vel: new THREE.Vector3(),
    dragging: false,
    lastX: 0,
    lastY: 0,
    targetZ: 3.2,
    hovered: null,
  };

  const onPointerDown = (e) => {
    state.dragging = true;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!state.dragging) return;
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.yaw -= dx * 0.0042;
    state.pitch = Math.max(-0.55, Math.min(0.5, state.pitch - dy * 0.0032));
  };
  const onPointerUp = (e) => {
    state.dragging = false;
    canvas.releasePointerCapture?.(e.pointerId);
  };
  const onWheel = (e) => {
    e.preventDefault();
    state.targetZ = Math.max(-70, Math.min(6, state.targetZ - Math.sign(e.deltaY) * 2.4));
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  const keys = new Set();
  const onKeyDown = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      keys.add(e.key);
      if (e.key.startsWith('Arrow')) e.preventDefault();
    }
  };
  const onKeyUp = (e) => keys.delete(e.key);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  /* ── 拾取 ── */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downPos = null;

  const pickAt = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    return hits.length ? hits[0].object.userData : null;
  };

  canvas.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downPos) return;
    const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
    downPos = null;
    if (moved > 6) return;
    const hit = pickAt(e.clientX, e.clientY);
    if (hit && onSelect) onSelect(hit.eraId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (state.dragging) return;
    const hit = pickAt(e.clientX, e.clientY);
    state.hovered = hit;
    canvas.style.cursor = hit ? 'pointer' : 'grab';
  });

  /* ── 渲染循环 ── */
  const clock = new THREE.Clock();
  let raf = 0;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(320, rect.width);
    const h = Math.max(240, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta());

    // 键盘移动
    let fwd = 0;
    let turn = 0;
    if (keys.has('ArrowUp') || keys.has('w')) fwd += 1;
    if (keys.has('ArrowDown') || keys.has('s')) fwd -= 1;
    if (keys.has('ArrowLeft') || keys.has('a')) turn += 1;
    if (keys.has('ArrowRight') || keys.has('d')) turn -= 1;
    state.yaw += turn * dt * 1.5;

    if (fwd !== 0) {
      state.targetZ = Math.max(-70, Math.min(6, state.targetZ - fwd * dt * 9));
    }
    state.pos.z += (state.targetZ - state.pos.z) * Math.min(1, dt * 4.2);
    state.pos.x += (0 - state.pos.x) * Math.min(1, dt * 3);

    camera.position.copy(state.pos);
    const dir = new THREE.Vector3(
      Math.sin(state.yaw) * Math.cos(state.pitch),
      Math.sin(state.pitch),
      -Math.cos(state.yaw) * Math.cos(state.pitch),
    );
    camera.lookAt(camera.position.clone().add(dir));

    // 展柜缓慢呼吸（尊重 reduced-motion）
    if (!reduceMotion) {
      const t = clock.elapsedTime;
      picks.forEach((p, i) => {
        p.position.y = 2.3 + Math.sin(t * 0.9 + i * 0.7) * 0.05;
      });
    }

    renderer.render(scene, camera);
  }
  frame();

  return {
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
    },
    focusEra(eraId) {
      const idx = eraList.findIndex((e) => e.id === eraId);
      if (idx < 0) return;
      const side = idx % 2 === 0 ? -1 : 1;
      state.targetZ = -6 - Math.floor(idx / 2) * 9.5 + 4.2;
      state.yaw = side * -0.42;
      state.pitch = -0.02;
    },
  };
}

export { ERA_BY_ID };
