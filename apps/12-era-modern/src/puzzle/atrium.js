import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { el, clear, formatTime, scrollToTop } from '../core/dom.js';
import { LEVELS, COLORS, MIRROR_ROT_NAME, ROT_NAME } from '../data/levels.js';
import { PuzzleState, ROTATABLE } from './rules.js';
import { getPuzzleState, setPuzzleCurrent, completeLevel, useHint, getHintCount, isLevelCompleted, markVisited } from '../core/progress.js';
import { publishState } from '../core/debug-state.js';
import { toast } from '../ui/toast.js';

const BEAM_HEIGHT = { W: 0.5, C: 0.56, M: 0.44 };
const HINT_LIMIT = 3;

/**
 * 《折光阁 / PRISM ATRIUM》
 * 等距 3D 光路解谜：旋转反光板 / 分光镜 / 色散棱镜，把光送进接收环。
 */
export function mountAtrium(root) {
  markVisited('atrium');
  clear(root);

  const wrap = el('div.atrium-wrap');
  root.appendChild(wrap);

  const stage = el('div.atrium-stage.ds-canvas-frame', {
    'data-game-root': 'atrium',
    'data-ds-theme': 'dark',
    tabindex: '0',
    'aria-label': '折光阁光路解谜画面，WASD 或方向键移动光标，E 旋转元件',
  });
  const hud = el('div.atrium-hud');
  const overlay = el('div.atrium-overlay');
  stage.appendChild(hud);
  stage.appendChild(overlay);

  const head = el(
    'header.atrium-head',
    {},
    el('a.back-link', { href: '#/' }, '← 返回展厅'),
    el(
      'div.atrium-head-main',
      {},
      el('span.exhibit-no', { style: { color: '#B4432B' } }, 'EXHIBIT 02'),
      el('h1.ds-detail__title', {}, '折光阁'),
      el('p.pulse-sub', {}, 'PRISM ATRIUM · 空间解谜'),
    ),
  );
  wrap.appendChild(head);
  wrap.appendChild(stage);

  const progress = getPuzzleState();
  const startId = LEVELS.some((l) => l.id === progress.current) ? progress.current : LEVELS[0].id;

  let game = null;

  function loadLevel(levelId) {
    if (game) {
      game.destroy();
      game = null;
    }
    const level = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
    setPuzzleCurrent(level.id);
    game = new Atrium3D({ stage, hud, overlay, level, onLevelChange: loadLevel });
  }

  loadLevel(startId);
  scrollToTop();
  // 进入解谜画面即把焦点交给画面：键盘只在游戏区获得焦点时生效，
  // 但用户主动进入展项后应当「按下就能走」，不需要再点一次。
  requestAnimationFrame(() => game?.focusGame());

  return () => {
    if (game) game.destroy();
  };
}

/* =========================================================
 * 3D 场景
 * ========================================================= */
class Atrium3D {
  constructor({ stage, hud, overlay, level, onLevelChange }) {
    this.stage = stage;
    this.hud = hud;
    this.overlay = overlay;
    this.level = level;
    this.onLevelChange = onLevelChange;
    this.rootEl = stage;
    this.presses = 0;

    this.state = new PuzzleState(level);
    this.selectedId = null;
    this.hintTarget = null;
    this.hintUntil = 0;
    this.riding = null;
    this.complete = false;
    this.startedAt = performance.now();
    this.elapsed = 0;
    this.moveAnim = null;
    this.raf = 0;

    this.initThree();
    this.buildLevel();
    this.buildHud();
    this.bindInput();
    this.refreshLight();

    this.loop = this.loop.bind(this);
    this.raf = window.requestAnimationFrame(this.loop);
    this.publish();
  }

  /* ---------------- 可观测状态 ---------------- */

  /**
   * 发布运行状态（供自动化验收比对）。只读反映真实状态，不参与解谜逻辑。
   */
  publish() {
    const p = this.state?.player || { x: 0, y: 0 };
    publishState({
      state: this.complete ? 'solved' : 'playing',
      route: '/atrium',
      chapter: this.level.id,
      score: this.state?.collected?.size ?? 0,
      player: { x: p.x, y: p.y, presses: this.presses },
      extra: {
        level: this.level.id,
        levelName: this.level.name,
        selected: this.selectedId,
        collected: this.state?.collected?.size ?? 0,
        total: this.level.motes.length,
        elapsedMs: Math.round(this.elapsed),
      },
    });
  }

  /** 游戏区是否持有键盘焦点。未聚焦时不消费按键，避免在 iframe 中劫持母站键盘。 */
  isGameFocused() {
    const root = this.rootEl;
    if (!root) return false;
    const active = document.activeElement;
    return active === root || root.contains(active);
  }

  /** 把焦点交还给解谜画面。 */
  focusGame() {
    try {
      this.rootEl?.focus({ preventScroll: true });
    } catch {
      this.rootEl?.focus();
    }
  }

  /* ---------------- 初始化 ---------------- */

  initThree() {
    const w = this.level.width;
    const h = this.level.height;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x070b1e, 24, 72);

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
    const r = (w + h) * 0.66 + 3.6;
    this.camera.position.set(r * 0.66, r * 0.76, r * 0.66);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x05081a, 0);
    this.stage.insertBefore(this.renderer.domElement, this.stage.firstChild);
    this.renderer.domElement.classList.add('atrium-canvas');

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.minPolarAngle = Math.PI * 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.46;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 34;
    this.controls.target.set(0, 0, 0);
    this.controls.enablePan = false;

    const hemi = new THREE.HemisphereLight(0x35508f, 0x05081a, 0.75);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(7, 13, 5);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x6fd8ff, 0.35);
    rim.position.set(-8, 6, -7);
    this.scene.add(rim);

    this.playerLight = new THREE.PointLight(0x4fe3d0, 1.7, 8, 2);
    this.scene.add(this.playerLight);

    this.root = new THREE.Group();
    this.scene.add(this.root);

    this.beamGroup = new THREE.Group();
    this.root.add(this.beamGroup);

    this.tileTexture = makeTileTexture();
    this.dispersionTexture = makeDispersionTexture();
    this.gateTexture = makeGateTexture();

    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.resize();
  }

  worldOf(x, y) {
    return new THREE.Vector3(
      x - (this.level.width - 1) / 2,
      0,
      y - (this.level.height - 1) / 2,
    );
  }

  /* ---------------- 建关 ---------------- */

  buildLevel() {
    const level = this.level;
    const tiles = [];
    const pillars = [];

    for (let y = 0; y < level.height; y += 1) {
      for (let x = 0; x < level.width; x += 1) {
        const t = level.terrain[y][x];
        if (t === '.') tiles.push([x, y]);
        else if (t === '#') pillars.push([x, y]);
      }
    }

    // 地板（实例化）—— 旋转几何体本身，而不是整个 InstancedMesh，
    // 否则实例矩阵会被一起旋转，格子与元件就对不上了。
    const tileGeo = new THREE.PlaneGeometry(1, 1);
    tileGeo.rotateX(-Math.PI / 2);
    const tileMat = new THREE.MeshStandardMaterial({
      map: this.tileTexture,
      roughness: 0.82,
      metalness: 0.12,
      emissive: new THREE.Color(0x0a1233),
      emissiveIntensity: 0.8,
    });

    this.tileMesh = new THREE.InstancedMesh(tileGeo, tileMat, tiles.length);
    const m = new THREE.Matrix4();
    tiles.forEach(([x, y], i) => {
      const p = this.worldOf(x, y);
      m.makeTranslation(p.x, 0, p.z);
      this.tileMesh.setMatrixAt(i, m);
    });
    this.tileMesh.instanceMatrix.needsUpdate = true;
    this.root.add(this.tileMesh);

    // 立柱
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x141d4e,
      roughness: 0.6,
      metalness: 0.35,
      emissive: 0x070c22,
      emissiveIntensity: 0.6,
    });
    const pillarEdgeMat = new THREE.MeshBasicMaterial({ color: 0x4fe3d0, transparent: true, opacity: 0.4 });
    for (const [x, y] of pillars) {
      const p = this.worldOf(x, y);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.1, 0.9), pillarMat);
      box.position.set(p.x, 1.05, p.z);
      this.root.add(box);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.05, 0.94), pillarEdgeMat);
      edge.position.set(p.x, 2.08, p.z);
      this.root.add(edge);
    }

    // 元件
    this.elementMeshes = new Map();
    this.moteMeshes = [];
    this.platformMeshes = [];

    for (const e of level.elements) {
      const mesh = this.makeElement(e);
      if (!mesh) continue;
      mesh.userData.elementId = e.id;
      mesh.userData.type = e.type;
      this.elementMeshes.set(e.id, mesh);
      this.root.add(mesh);
    }

    for (const [mx, my] of level.motes) {
      const p = this.worldOf(mx, my);
      const g = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13),
        new THREE.MeshBasicMaterial({ color: 0xffc46b }),
      );
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      g.add(core, halo);
      g.position.set(p.x, 0.5, p.z);
      g.userData.cell = `${mx},${my}`;
      this.root.add(g);
      this.moteMeshes.push(g);
    }

    // 玩家
    this.playerGroup = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28),
      new THREE.MeshStandardMaterial({
        color: 0x9ff3ea,
        roughness: 0.18,
        metalness: 0.6,
        emissive: 0x1d7f77,
        emissiveIntensity: 1.1,
      }),
    );
    body.position.y = 0.42;
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 14, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    inner.position.y = 0.42;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.018, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0x4fe3d0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    this.playerGroup.add(body, inner, ring);
    this.playerInner = inner;
    this.playerRing = ring;
    const p = this.worldOf(this.state.player.x, this.state.player.y);
    this.playerGroup.position.set(p.x, 0, p.z);
    this.root.add(this.playerGroup);

    // 提示光环
    this.hintRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.03, 8, 30),
      new THREE.MeshBasicMaterial({ color: 0xffc46b, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    this.hintRing.rotation.x = -Math.PI / 2;
    this.hintRing.visible = false;
    this.root.add(this.hintRing);

    // 选中光环
    this.selRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.022, 8, 30),
      new THREE.MeshBasicMaterial({ color: 0xf2f0e9, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    this.selRing.rotation.x = -Math.PI / 2;
    this.selRing.visible = false;
    this.root.add(this.selRing);
  }

  makeElement(e) {
    const p = this.worldOf(e.x, e.y);

    if (e.type === 'emitter') {
      const g = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.28, 0.5, 14),
        new THREE.MeshStandardMaterial({ color: 0x1a2456, roughness: 0.4, metalness: 0.7, emissive: 0x0a1130 }),
      );
      base.position.y = 0.25;
      const lens = new THREE.Mesh(
        new THREE.ConeGeometry(0.17, 0.4, 14),
        new THREE.MeshBasicMaterial({ color: COLORS[e.color]?.hex || 0xffffff }),
      );
      lens.rotation.z = -Math.PI / 2;
      lens.position.set(0.3, 0.55, 0);
      g.add(base, lens);
      g.position.set(p.x, 0, p.z);
      g.rotation.y = -e.dir * (Math.PI / 2);
      return g;
    }

    if (e.type === 'mirror') {
      const g = new THREE.Group();
      const plate = new THREE.Mesh(
        new THREE.BoxGeometry(1.16, 0.78, 0.14),
        new THREE.MeshStandardMaterial({
          color: 0xbfe4ff,
          roughness: 0.06,
          metalness: 0.95,
          emissive: 0x2f6ba8,
          emissiveIntensity: 0.85,
        }),
      );
      plate.position.y = 0.58;
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.9, 0.05),
        new THREE.MeshBasicMaterial({
          color: 0x4fe3d0,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      back.position.set(0, 0.58, -0.1);
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.028, 8, 4),
        new THREE.MeshBasicMaterial({ color: 0x8ff2e4, transparent: true, opacity: 0.75 }),
      );
      frame.rotation.x = Math.PI / 2;
      frame.position.y = 0.12;
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.17, 0.28, 12),
        new THREE.MeshStandardMaterial({ color: 0x22306e, metalness: 0.85, roughness: 0.28 }),
      );
      foot.position.y = 0.14;
      g.add(plate, back, frame, foot);
      g.position.set(p.x, 0, p.z);
      g.rotation.y = this.state.rots[e.id] === 0 ? Math.PI / 4 : -Math.PI / 4;
      return g;
    }

    if (e.type === 'splitter' || e.type === 'dispersion') {
      const g = new THREE.Group();
      const mat =
        e.type === 'splitter'
          ? new THREE.MeshStandardMaterial({
              color: 0xcfe3ff,
              roughness: 0.1,
              metalness: 0.7,
              emissive: 0x2a4a80,
              emissiveIntensity: 0.9,
            })
          : new THREE.MeshStandardMaterial({
              map: this.dispersionTexture,
              roughness: 0.12,
              metalness: 0.6,
              emissive: 0xffffff,
              emissiveMap: this.dispersionTexture,
              emissiveIntensity: 1.1,
            });
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.36), mat);
      core.position.y = 0.55;
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 14, 12),
        new THREE.MeshBasicMaterial({
          color: e.type === 'splitter' ? 0x9d7bff : 0xff5fa2,
          transparent: true,
          opacity: 0.16,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.position.y = 0.55;
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.13, 0.22, 10),
        new THREE.MeshStandardMaterial({ color: 0x1a2456, metalness: 0.8, roughness: 0.35 }),
      );
      foot.position.y = 0.11;
      g.add(core, halo, foot);
      g.position.set(p.x, 0, p.z);
      g.userData.core = core;
      // 分光镜 / 色散棱镜：把自身朝向映射为一条可见的「分叉臂」
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.07),
        new THREE.MeshBasicMaterial({ color: e.type === 'splitter' ? 0x9d7bff : 0x4fe3d0, transparent: true, opacity: 0.85 }),
      );
      arm.position.set(0.3, 0.55, 0);
      const armPivot = new THREE.Group();
      armPivot.position.y = 0;
      armPivot.add(arm);
      g.add(armPivot);
      g.userData.armPivot = armPivot;
      return g;
    }

    if (e.type === 'receiver') {
      const g = new THREE.Group();
      const hex = COLORS[e.color]?.hex || 0xffffff;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.055, 10, 32),
        new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.6 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.16;
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.28, 28),
        new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = 0.14;
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 14, 12),
        new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      halo.position.y = 0.2;
      g.add(ring, disc, halo);
      g.position.set(p.x, 0, p.z);
      g.userData.ring = ring;
      g.userData.disc = disc;
      g.userData.halo = halo;
      return g;
    }

    if (e.type === 'gate') {
      const g = new THREE.Group();
      const bars = new THREE.Mesh(
        new THREE.BoxGeometry(0.94, 1.0, 0.08),
        new THREE.MeshBasicMaterial({ map: this.gateTexture, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      );
      bars.position.y = 0.5;
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.05, 0.12),
        new THREE.MeshBasicMaterial({ color: 0xff5fa2, transparent: true, opacity: 0.75 }),
      );
      frame.position.y = 1.02;
      g.add(bars, frame);
      g.position.set(p.x, 0, p.z);
      g.userData.bars = bars;
      g.userData.frame = frame;
      return g;
    }

    if (e.type === 'plate') {
      const g = new THREE.Group();
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.07, 24),
        new THREE.MeshStandardMaterial({ color: 0x1a2456, roughness: 0.5, metalness: 0.5, emissive: 0x0a1130 }),
      );
      disc.position.y = 0.05;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.3, 0.028, 8, 28),
        new THREE.MeshBasicMaterial({ color: 0xff5fa2, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.1;
      g.add(disc, ring);
      g.position.set(p.x, 0, p.z);
      g.userData.ring = ring;
      return g;
    }

    if (e.type === 'platform') {
      const g = new THREE.Group();
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(0.94, 0.12, 0.94),
        new THREE.MeshStandardMaterial({ color: 0x1b2558, roughness: 0.45, metalness: 0.6, emissive: 0x0c1440, emissiveIntensity: 0.8 }),
      );
      slab.position.y = 0.06;
      const edge = new THREE.Mesh(
        new THREE.BoxGeometry(0.98, 0.03, 0.98),
        new THREE.MeshBasicMaterial({ color: 0x9d7bff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      edge.position.y = 0.13;
      g.add(slab, edge);
      const p2 = this.worldOf(e.x, e.y);
      g.position.set(p2.x, 0, p2.z);
      this.platformMeshes.push({ el: e, group: g });
      return g;
    }

    return null;
  }

  /* ---------------- HUD ---------------- */

  buildHud() {
    clear(this.hud);
    this.hud.classList.add('atrium-hud');

    this.tabs = el('div.atrium-tabs');
    for (const lv of LEVELS) {
      const done = isLevelCompleted(lv.id);
      this.tabs.appendChild(
        el(
          'button.atrium-tab',
          {
            type: 'button',
            'data-level': lv.id,
            'aria-pressed': String(lv.id === this.level.id),
            class: done ? 'is-done' : '',
            onclick: () => this.onLevelChange(lv.id),
          },
          el('b', {}, `LV${lv.index}`),
          el('span', {}, lv.name),
          done ? el('i', { title: '已通关' }, '★') : null,
        ),
      );
    }

    this.elTime = el('b.hud-value', {}, '00:00');
    this.elMotes = el('b.hud-value', {}, '0 / 0');
    this.elReceivers = el('div.receiver-status');

    this.btnUndo = el('button.btn.btn-sm', { type: 'button', 'data-control': 'undo', onclick: () => this.doUndo() }, '撤销');
    this.btnHint = el('button.btn.btn-sm', { type: 'button', 'data-control': 'hint', onclick: () => this.doHint() }, '提示');
    this.btnReset = el('button.btn.btn-sm.btn-ghost', { type: 'button', 'data-control': 'restart', onclick: () => this.doReset() }, '重置');
    this.btnView = el('button.btn.btn-sm.btn-ghost', { type: 'button', 'data-control': 'view', onclick: () => this.resetView() }, '视角复位');

    this.hud.appendChild(
      el(
        'div.atrium-hud-top',
        {},
        this.tabs,
        el(
          'div.atrium-hud-stats',
          {},
          el('div.hud-stat', {}, el('label', {}, '用时'), this.elTime),
          el('div.hud-stat', {}, el('label', {}, '光点'), this.elMotes),
          el('div.hud-stat.hud-stat--wide', {}, el('label', {}, '接收环'), this.elReceivers),
        ),
      ),
    );
    this.hud.appendChild(
      el(
        'div.atrium-hud-bottom.ds-canvas-frame__hud',
        {},
        el('div.hud-actions', {}, this.btnUndo, this.btnHint, this.btnReset, this.btnView),
        el(
          'div.hud-legend.ds-diagram',
          {},
          legendItem('#4FE3D0', '青光接收环'),
          legendItem('#FF5FA2', '品红光接收环'),
          legendItem('#9D7BFF', '分光镜'),
        ),
      ),
    );

    this.stage.appendChild(
      el(
        'div.atrium-help',
        {},
        el('span', {}, 'WASD / 方向键 移动'),
        el('span', {}, '点击元件或按 E 旋转'),
        el('span', {}, 'Tab 切换目标'),
        el('span', {}, '拖拽 旋转视角 · 滚轮 缩放'),
      ),
    );
  }

  updateHud() {
    this.elTime.textContent = formatTime(this.elapsed);
    const total = this.level.motes.length;
    this.elMotes.textContent = `${this.state.collected.size} / ${total}`;
    this.btnUndo.disabled = !this.state.canUndo();

    const light = this.light;
    clear(this.elReceivers);
    for (const r of this.state.receivers()) {
      const lit = light.lit.has(r.id);
      const bad = light.mismatch.has(r.id);
      const color = COLORS[r.color]?.hex || '#fff';
      this.elReceivers.appendChild(
        el(
          'span.rev-chip',
          {
            class: lit ? 'is-lit' : bad ? 'is-bad' : '',
            style: { '--rc': color },
            title: lit ? '已点亮' : bad ? '颜色不符' : '未点亮',
          },
          lit ? '●' : bad ? '✕' : '○',
        ),
      );
    }
  }

  /* ---------------- 输入 ---------------- */

  bindInput() {
    this.onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (!this.isGameFocused()) return;
      const code = event.code;
      const map = {
        KeyW: [0, -1],
        ArrowUp: [0, -1],
        KeyS: [0, 1],
        ArrowDown: [0, 1],
        KeyA: [-1, 0],
        ArrowLeft: [-1, 0],
        KeyD: [1, 0],
        ArrowRight: [1, 0],
      };
      if (map[code]) {
        event.preventDefault();
        this.presses += 1;
        this.tryMove(map[code][0], map[code][1]);
        return;
      }
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') {
        if (this.selectedId) {
          event.preventDefault();
          this.presses += 1;
          this.tryRotate(this.selectedId);
        }
        return;
      }
      if (code === 'Tab') {
        event.preventDefault();
        this.presses += 1;
        this.cycleSelection();
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    // 指针：区分点击与拖拽
    this.pointerDown = null;
    this.onPointerDown = (event) => {
      this.focusGame();
      this.pointerDown = { x: event.clientX, y: event.clientY };
    };
    this.onPointerUp = (event) => {
      if (!this.pointerDown) return;
      const dx = event.clientX - this.pointerDown.x;
      const dy = event.clientY - this.pointerDown.y;
      this.pointerDown = null;
      if (Math.hypot(dx, dy) > 6) return; // 视为拖拽视角
      this.pickElement(event);
    };
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
  }

  pickElement(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, this.camera);
    const hits = ray.intersectObjects(this.root.children, true);
    for (const hit of hits) {
      let node = hit.object;
      while (node && !node.userData.elementId) node = node.parent;
      if (node && node.userData.elementId) {
        const id = node.userData.elementId;
        this.selectedId = id;
        this.updateSelRing();
        this.tryRotate(id);
        return;
      }
    }
  }

  tryMove(dx, dy) {
    if (this.complete) return;
    const ok = this.state.move(dx, dy);
    if (!ok) return;
    this.riding = null;
    // 落到浮台上则搭乘
    for (const { el } of this.platformMeshes) {
      const cell = this.state.platformCell(el, performance.now());
      if (Math.round(cell.x) === this.state.player.x && Math.round(cell.y) === this.state.player.y) {
        this.riding = el.id;
      }
    }
    this.moveAnim = {
      from: this.playerGroup.position.clone(),
      to: this.worldOf(this.state.player.x, this.state.player.y),
      t0: performance.now(),
    };
    this.refreshLight();
    this.updateHud();
    this.publish();
  }

  tryRotate(id) {
    if (this.complete) return;
    const el0 = this.level.elements.find((e) => e.id === id);
    if (!el0 || !ROTATABLE.has(el0.type)) return;
    if (!this.state.canRotate(id)) {
      toast('离得太远了 —— 走到它旁边再旋转', 'warn');
      return;
    }
    this.state.rotate(id);
    this.refreshLight();
    this.updateHud();
    this.updateSelRing();
    this.publish();
  }

  cycleSelection() {
    const list = this.level.elements.filter((e) => ROTATABLE.has(e.type));
    if (!list.length) return;
    const idx = list.findIndex((e) => e.id === this.selectedId);
    this.selectedId = list[(idx + 1) % list.length].id;
    this.updateSelRing();
    const e = list[(idx + 1) % list.length];
    toast(`已选中：${e.type === 'mirror' ? '反光板' : e.type === 'splitter' ? '分光镜' : '色散棱镜'}（按 E 旋转）`);
    this.publish();
  }

  updateSelRing() {
    if (!this.selectedId) {
      this.selRing.visible = false;
      return;
    }
    const e = this.level.elements.find((x) => x.id === this.selectedId);
    if (!e) {
      this.selRing.visible = false;
      return;
    }
    const p = this.worldOf(e.x, e.y);
    this.selRing.position.set(p.x, 0.08, p.z);
    this.selRing.visible = true;
  }

  doUndo() {
    if (!this.state.undo()) {
      toast('没有可撤销的操作了');
      return;
    }
    this.riding = null;
    this.syncMeshes();
    this.refreshLight();
    this.updateHud();
    this.publish();
    toast('已撤销上一步');
  }

  doHint() {
    if (this.complete) return;
    const used = getHintCount(this.level.id);
    if (used >= HINT_LIMIT) {
      toast('本关提示次数已用完（3 次）', 'warn');
      return;
    }
    const target = this.state.findHint();
    if (!target) {
      toast('当前所有元件都已在推荐朝向上——问题可能在别处', 'warn');
      return;
    }
    useHint(this.level.id);
    this.hintTarget = target;
    this.hintUntil = performance.now() + 9000;
    this.selectedId = target.id;
    this.updateSelRing();
    const p = this.worldOf(target.x, target.y);
    this.hintRing.position.set(p.x, 0.1, p.z);
    this.hintRing.visible = true;
    const want =
      target.type === 'mirror'
        ? MIRROR_ROT_NAME[target.solution]
        : `朝${ROT_NAME[target.solution]}分光`;
    toast(`提示：把这块${target.type === 'mirror' ? '反光板' : target.type === 'splitter' ? '分光镜' : '色散棱镜'}转成「${want}」`, 'good', 5200);
    this.updateHud();
  }

  doReset() {
    this.state.reset();
    this.riding = null;
    this.complete = false;
    this.startedAt = performance.now();
    this.elapsed = 0;
    this.moveAnim = null;
    this.hintTarget = null;
    this.hintRing.visible = false;
    this.syncMeshes();
    this.refreshLight();
    this.updateHud();
    this.clearOverlay();
    this.publish();
    toast('本关已重置');
  }

  resetView() {
    const w = this.level.width;
    const h = this.level.height;
    const r = (w + h) * 0.66 + 3.6;
    this.camera.position.set(r * 0.66, r * 0.76, r * 0.66);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /* ---------------- 光路 ---------------- */

  refreshLight() {
    this.light = this.state.computeLight();
    this.buildBeams(this.light);
    if (!this.complete && this.state.isComplete(this.light)) {
      this.onComplete();
    }
  }

  buildBeams(light) {
    while (this.beamGroup.children.length) {
      const child = this.beamGroup.children.pop();
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    }
    const outer = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (const seg of light.segs) {
      const a = this.worldOf(seg.x1, seg.y1);
      const b = this.worldOf(seg.x2, seg.y2);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const len = a.distanceTo(b);
      const height = BEAM_HEIGHT[seg.color] ?? 0.5;
      const color = COLORS[seg.color]?.hex || 0xffffff;

      const glow = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.16), outer.clone());
      glow.material.color = new THREE.Color(color);
      glow.position.set(mid.x, height, mid.z);
      glow.rotation.y = -seg.dir * (Math.PI / 2);
      this.beamGroup.add(glow);

      const core = new THREE.Mesh(
        new THREE.BoxGeometry(len, 0.05, 0.05),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      core.position.set(mid.x, height, mid.z);
      core.rotation.y = -seg.dir * (Math.PI / 2);
      this.beamGroup.add(core);
    }
  }

  /* ---------------- 同步网格 ---------------- */

  syncMeshes() {
    for (const e of this.level.elements) {
      const mesh = this.elementMeshes.get(e.id);
      if (!mesh) continue;
      if (e.type === 'mirror') {
        mesh.rotation.y = this.state.rots[e.id] === 0 ? Math.PI / 4 : -Math.PI / 4;
      } else if (e.type === 'splitter' || e.type === 'dispersion') {
        const rot = this.state.rots[e.id] ?? 0;
        if (mesh.userData.armPivot) mesh.userData.armPivot.rotation.y = -rot * (Math.PI / 2);
      }
    }
    const p = this.worldOf(this.state.player.x, this.state.player.y);
    this.playerGroup.position.set(p.x, 0, p.z);
    for (const mote of this.moteMeshes) {
      mote.visible = !this.state.collected.has(mote.userData.cell);
    }
  }

  /* ---------------- 完成 ---------------- */

  onComplete() {
    this.complete = true;
    const motes = this.state.collected.size;
    const total = this.level.motes.length;
    const record = completeLevel(this.level.id, { timeMs: Math.round(this.elapsed), motes, totalMotes: total });
    const stars = record.stars;
    const idx = LEVELS.findIndex((l) => l.id === this.level.id);
    const next = LEVELS[idx + 1];
    this.publish();

    const box = el(
      'div.atrium-result',
      {},
      el('div.result-stars', {}, '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars))),
      el('h2', {}, `${this.level.name} 已完成`),
      el('p.result-track', {}, `${this.level.nameEn} · 用时 ${formatTime(this.elapsed)}`),
      el(
        'div.result-grid',
        {},
        resultItem('用时', formatTime(this.elapsed)),
        resultItem('光点', `${motes} / ${total}`),
        resultItem('最佳用时', formatTime(record.timeMs)),
        resultItem('评级', `${stars} 星`),
      ),
      el(
        'div.result-actions',
        {},
        next
          ? el('button.btn.btn-primary', { type: 'button', onclick: () => this.onLevelChange(next.id) }, `下一关：${next.name}`)
          : el('a.btn.btn-primary', { href: '#/pulse' }, '回到《脉冲走廊》'),
        el('button.btn', { type: 'button', onclick: () => this.doReset() }, '再玩一次'),
        el('a.btn.btn-ghost', { href: '#/' }, '返回展厅'),
      ),
    );
    this.showOverlay(box);
  }

  showOverlay(node) {
    clear(this.overlay);
    this.overlay.appendChild(node);
    this.overlay.classList.add('is-active');
    // 遮罩出现时把焦点交给第一个可操作元素（键盘可达性 + 保持按键作用域一致）
    const first = this.overlay.querySelector('button, a[href], [tabindex]:not([tabindex="-1"])');
    try {
      first?.focus?.({ preventScroll: true });
    } catch {
      first?.focus?.();
    }
  }

  clearOverlay() {
    clear(this.overlay);
    this.overlay.classList.remove('is-active');
    // 遮罩移除后焦点会退回 body，这里主动交还给解谜画面，
    // 保证「关掉结算 → 键盘立刻可用」。
    this.focusGame();
  }

  /* ---------------- 主循环 ---------------- */

  loop() {
    this.raf = window.requestAnimationFrame(this.loop);
    const now = performance.now();

    if (!this.complete) this.elapsed = now - this.startedAt;

    // 玩家移动补间
    if (this.moveAnim) {
      const k = Math.min(1, (now - this.moveAnim.t0) / 140);
      const e = 1 - Math.pow(1 - k, 3);
      this.playerGroup.position.lerpVectors(this.moveAnim.from, this.moveAnim.to, e);
      if (k >= 1) this.moveAnim = null;
    }

    // 浮台
    for (const { el: pel, group } of this.platformMeshes) {
      const cell = this.state.platformCell(pel, now);
      const p = this.worldOf(cell.x, cell.y);
      group.position.set(p.x, 0, p.z);
      if (this.riding === pel.id) {
        this.state.player.x = Math.round(cell.x);
        this.state.player.y = Math.round(cell.y);
        this.playerGroup.position.set(p.x, 0, p.z);
      }
    }

    // 玩家呼吸 + 灯光
    const bob = Math.sin(now / 520) * 0.05;
    this.playerInner.position.y = 0.42 + bob;
    this.playerRing.rotation.z += 0.004;
    this.playerLight.position.set(this.playerGroup.position.x, 0.9, this.playerGroup.position.z);
    this.playerLight.intensity = 1.4 + Math.sin(now / 300) * 0.25;

    // 元件动效
    for (const e of this.level.elements) {
      const mesh = this.elementMeshes.get(e.id);
      if (!mesh) continue;
      if (e.type === 'splitter' || e.type === 'dispersion') {
        if (mesh.userData.core) {
          mesh.userData.core.rotation.y += 0.012;
          mesh.userData.core.rotation.x += 0.006;
        }
      }
      if (e.type === 'receiver') {
        const lit = this.light?.lit.has(e.id);
        const bad = this.light?.mismatch.has(e.id);
        if (mesh.userData.halo) {
          const target = lit ? 0.34 : bad ? 0.18 : 0.0;
          mesh.userData.halo.material.opacity += (target - mesh.userData.halo.material.opacity) * 0.12;
          mesh.userData.halo.material.color.set(bad && !lit ? 0xff6b81 : COLORS[e.color]?.hex || 0xffffff);
        }
        if (mesh.userData.ring) {
          const pulse = lit ? 1.3 + Math.sin(now / 260) * 0.5 : 0.5;
          mesh.userData.ring.material.emissiveIntensity = pulse;
        }
        if (mesh.userData.disc) {
          const target = lit ? 0.55 : 0.1;
          mesh.userData.disc.material.opacity += (target - mesh.userData.disc.material.opacity) * 0.12;
        }
      }
      if (e.type === 'gate') {
        const open = this.state.isGateOpen(e);
        const targetY = open ? -0.9 : 0.5;
        mesh.userData.bars.position.y += (targetY - mesh.userData.bars.position.y) * 0.1;
        mesh.userData.bars.material.opacity = open ? 0.18 : 0.8;
        mesh.userData.frame.material.opacity = open ? 0.2 : 0.75;
      }
      if (e.type === 'plate') {
        const until = this.state.plateUntil[e.id] || 0;
        const remain = Math.max(0, until - now);
        const active = remain > 0;
        const ring = mesh.userData.ring;
        if (active) {
          const total = e.duration || 12000;
          const k = remain / total;
          ring.scale.setScalar(0.4 + k * 0.85);
          ring.material.opacity = 0.4 + 0.5 * k;
          ring.material.color.set(0xffc46b);
        } else {
          ring.scale.setScalar(1);
          ring.material.opacity = 0.4;
          ring.material.color.set(0xff5fa2);
        }
      }
    }

    // 光点漂浮
    for (const mote of this.moteMeshes) {
      if (!mote.visible) continue;
      mote.rotation.y += 0.02;
      mote.position.y = 0.5 + Math.sin(now / 620 + mote.position.x) * 0.08;
    }

    // 提示环
    if (this.hintRing.visible) {
      const s = 1 + Math.sin(now / 240) * 0.12;
      this.hintRing.scale.setScalar(s);
      this.hintRing.material.opacity = 0.55 + Math.sin(now / 240) * 0.35;
      if (now > this.hintUntil) this.hintRing.visible = false;
    }
    if (this.selRing.visible) {
      this.selRing.material.opacity = 0.45 + Math.sin(now / 320) * 0.25;
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.updateHud();
  }

  resize() {
    const rect = this.stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.controls.dispose();
    this.scene.traverse((obj) => {
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach((mm) => mm.dispose());
      else obj.material?.dispose?.();
    });
    this.renderer.dispose();
    publishState({ state: 'idle', route: '/atrium', chapter: null });
  }
}

/* ---------------- 工具 ---------------- */

function legendItem(color, label) {
  return el('span.legend-item', {}, el('i', { style: { background: color } }), label);
}

function resultItem(label, value) {
  return el('div.result-item', {}, el('label', {}, label), el('b', {}, value));
}

function makeTileTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#1a265f';
  g.fillRect(0, 0, 64, 64);
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, 'rgba(79,227,208,0.16)');
  grad.addColorStop(0.5, 'rgba(20,29,78,0)');
  grad.addColorStop(1, 'rgba(157,123,255,0.12)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(150,185,255,0.42)';
  g.lineWidth = 2;
  g.strokeRect(1.5, 1.5, 61, 61);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function makeDispersionTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 64, 64);
  grad.addColorStop(0, '#4fe3d0');
  grad.addColorStop(0.5, '#ffffff');
  grad.addColorStop(1, '#ff5fa2');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeGateTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  g.strokeStyle = 'rgba(255,95,162,0.85)';
  g.lineWidth = 3;
  for (let i = 0; i <= 64; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i, 64);
    g.moveTo(0, i);
    g.lineTo(64, i);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
