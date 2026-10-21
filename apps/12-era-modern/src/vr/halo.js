import * as THREE from 'three';
import { el, clear, scrollToTop } from '../core/dom.js';
import { markVisited } from '../core/progress.js';
import { publishState } from '../core/debug-state.js';
import { toast } from '../ui/toast.js';

/**
 * 《光环台 / HALO DECK》
 *
 * ⚠️ 诚实声明：本展项是**桌面端交互演示**。
 * 它用鼠标拖拽与键盘模拟头部转动，并**未接入 WebXR**、**不支持 VR 头显**、
 * 没有立体渲染与手柄追踪。页面提供「检测本机 WebXR 沉浸式 VR 支持」按钮，
 * 其结果直接来自浏览器 `navigator.xr.isSessionSupported('immersive-vr')` 的真实返回值。
 */

const HOTSPOTS = [
  {
    id: 'hs-2016',
    title: '2016 · 头显走出实验室',
    body: 'Oculus Rift 于 2016 年 3 月发货，HTC Vive 于 4 月发货，PlayStation VR 于 10 月上市。三款头显同年进入零售货架，六自由度定位第一次成为普通玩家的日常输入方式。',
    source: { label: 'Oculus 发货公告', url: 'https://www.meta.com/blog/oculus-rift-is-shipping/' },
    extra: [
      { label: 'HTC Vive 发货报道', url: 'https://www.engadget.com/2016-04-05/htc-vive-now-shipping.html' },
      { label: 'PSVR 上市报道', url: 'https://techcrunch.com/2016/06/13/playstation-vr-is-arriving-october-13th-priced-at-399/' },
    ],
    pos: [-7.5, 2.6, -5],
    color: '#4FE3D0',
  },
  {
    id: 'hs-2020',
    title: '2020 · 一体机拆掉门槛',
    body: 'Quest 2 采用 inside-out 追踪，取消手柄外接线并大幅降低售价，让 VR 从「需要主机与显卡」变成「一台独立设备」。同年 Half-Life: Alyx 为画质与交互定下长期参照。',
    source: { label: 'Meta Quest 2 公告', url: 'https://about.fb.com/news/2020/09/introducing-oculus-quest-2-the-next-generation-of-all-in-one-vr/' },
    extra: [{ label: 'Half-Life: Alyx', url: 'https://www.valvesoftware.com/en/games/halflifealyx' }],
    pos: [0, 3.4, -9],
    color: '#FFC46B',
  },
  {
    id: 'hs-2023',
    title: '2023 · 透视改变头显的定位',
    body: 'Quest 3 引入彩色透视相机，把混合现实透视变成一体机的默认能力；PlayStation VR2 则用头显显示与眼动追踪把消费级 VR 的竞争焦点推向视觉品质。',
    source: { label: 'Meta Quest 3 公告', url: 'https://about.fb.com/news/2023/09/meet-meta-quest-3-mixed-reality-headset/' },
    extra: [{ label: 'PlayStation VR2', url: 'https://blog.playstation.com/2022/11/02/playstation-vr2-launches-in-february-at-549-99/' }],
    pos: [7.8, 2.2, -4.5],
    color: '#FF5FA2',
  },
  {
    id: 'hs-2024',
    title: '2024 · 空间计算设备登场',
    body: 'Apple Vision Pro 于 2024 年 2 月在美国首发，把消费级 XR 的叙事从「游戏设备」扩展到「空间计算平台」，重设了硬件与交互的想象边界。',
    source: { label: 'Apple Newsroom', url: 'https://www.apple.com/newsroom/2024/01/apple-vision-pro-available-in-the-us-on-february-2/' },
    pos: [9.5, 1.4, 3.5],
    color: '#9D7BFF',
  },
  {
    id: 'hs-webxr',
    title: '开放标准 · 浏览器里的沉浸式',
    body: 'WebXR 已成为 W3C 推荐的 Web 沉浸式接口规范。它让网页也能承载轻量的 XR 体验 —— 也正是本展项所处的技术语境：本页使用普通 WebGL 渲染，并不属于 WebXR 会话。',
    source: { label: 'W3C WebXR 规范', url: 'https://www.w3.org/TR/webxr/' },
    pos: [-9.2, 1.8, 4.5],
    color: '#5AA9FF',
  },
  {
    id: 'hs-2011',
    title: '回望 · 从方块到头显',
    body: '2011 年 Minecraft 让「玩家自己造世界」成为主流想象；到 2020 年代，沉浸式硬件让身体本身成为输入设备。展馆里这两条线索的交汇点，正是当代独立游戏的实验场。',
    source: { label: 'Minecraft 官网', url: 'https://www.minecraft.net/en-us' },
    pos: [0, 5.2, 6.5],
    color: '#F2F0E9',
  },
];

export function mountHalo(root) {
  markVisited('halo');
  clear(root);

  const canvasHost = el('div.halo-stage.ds-canvas-frame', {
    'data-game-root': 'halo',
    'data-ds-theme': 'dark',
    tabindex: '0',
    'aria-label': '光环台夜景棱镜庭，拖拽环视、WASD 移动、点击热点查看展签',
  });
  const overlay = el('div.halo-overlay');
  const panel = el('div.halo-panel');

  const wrap = el(
    'div.halo-wrap',
    {},
    el(
      'header.halo-head',
      {},
      el('a.back-link', { href: '#/' }, '← 返回展厅'),
      el(
        'div.halo-head-main',
        {},
        el('span.exhibit-no', { style: { color: '#2C5C8F' } }, 'EXHIBIT 03'),
        el('h1.ds-detail__title', {}, '光环台'),
        el('p.pulse-sub', {}, 'HALO DECK · 沉浸展项（桌面交互演示）'),
      ),
    ),
    el(
      'div.halo-disclaimer',
      { role: 'note' },
      el('span.notice-icon', { 'aria-hidden': 'true' }, '◆'),
      el(
        'p',
        {},
        el('b', {}, '桌面端交互演示：'),
        '本展项用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显，也没有立体渲染与手柄追踪。它是「沉浸式展陈的交互模型」演示，而不是 VR 应用。',
      ),
    ),
    el('div.halo-body', {}, canvasHost, overlay),
    panel,
  );
  root.appendChild(wrap);

  const deck = new HaloDeck({ host: canvasHost, overlay, panel });
  scrollToTop();
  // 进入展台即把焦点交给画面（键盘只在展台获得焦点时生效）
  requestAnimationFrame(() => deck.focusGame());
  return () => deck.destroy();
}

class HaloDeck {
  constructor({ host, overlay, panel }) {
    this.host = host;
    this.overlay = overlay;
    this.panel = panel;
    this.rootEl = host;
    this.presses = 0;

    this.yaw = 0;
    this.pitch = 0.03;
    this.pos = new THREE.Vector3(0, 2.4, 15);
    this.velocity = new THREE.Vector3();
    this.keys = new Set();
    this.activeHotspot = null;
    this.raf = 0;
    this.clock = new THREE.Clock();

    this.initThree();
    this.buildScene();
    this.buildPanel();
    this.bindInput();

    this.loop = this.loop.bind(this);
    this.raf = window.requestAnimationFrame(this.loop);
    this.publish();
  }

  /* ---------------- 可观测状态 ---------------- */

  /** 发布运行状态（供自动化验收比对）。只读反映真实状态，不参与交互逻辑。 */
  publish() {
    const hotspotId = this.activeHotspot?.hs?.id ?? null;
    publishState({
      state: hotspotId ? 'reading' : 'exploring',
      route: '/halo',
      chapter: hotspotId,
      score: 0,
      player: {
        x: Math.round(this.pos.x * 100) / 100,
        z: Math.round(this.pos.z * 100) / 100,
        yaw: Math.round(this.yaw * 1000) / 1000,
        presses: this.presses,
      },
      extra: {
        hotspot: hotspotId,
        hotspots: HOTSPOTS.length,
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

  /** 把焦点交还给展台画面。 */
  focusGame() {
    try {
      this.rootEl?.focus({ preventScroll: true });
    } catch {
      this.rootEl?.focus();
    }
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a1230, 0.0085);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x05081a, 1);
    this.renderer.domElement.classList.add('halo-canvas');
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0x3a559c, 0x05081a, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.7);
    key.position.set(8, 16, 6);
    this.scene.add(key);
    const violet = new THREE.PointLight(0x9d7bff, 90, 60, 2);
    violet.position.set(0, 6, -8);
    this.scene.add(violet);
    const cyan = new THREE.PointLight(0x4fe3d0, 70, 55, 2);
    cyan.position.set(-10, 4, 4);
    this.scene.add(cyan);
    const magenta = new THREE.PointLight(0xff5fa2, 60, 50, 2);
    magenta.position.set(10, 3.5, -2);
    this.scene.add(magenta);

    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    this.resize();
  }

  buildScene() {
    // 天穹
    const skyGeo = new THREE.SphereGeometry(180, 32, 24);
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        top: { value: new THREE.Color(0x0a1030) },
        mid: { value: new THREE.Color(0x14093a) },
        bottom: { value: new THREE.Color(0x05081a) },
      },
      vertexShader: `
        varying float vH;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vH = normalize(position).y;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: `
        uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
        varying float vH;
        void main() {
          float h = clamp(vH * 0.5 + 0.5, 0.0, 1.0);
          vec3 c = h < 0.5 ? mix(bottom, mid, h * 2.0) : mix(mid, top, (h - 0.5) * 2.0);
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
    this.scene.add(new THREE.Mesh(skyGeo, skyMat));

    // 镜面地坪
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(120, 64),
      new THREE.MeshStandardMaterial({
        color: 0x0a1230,
        roughness: 0.22,
        metalness: 0.85,
        emissive: 0x070f28,
        emissiveIntensity: 0.9,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.6;
    this.scene.add(floor);

    // 地坪网格
    const grid = new THREE.GridHelper(160, 64, 0x2a3f7a, 0x16224f);
    grid.position.y = -1.58;
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    this.scene.add(grid);

    // 悬浮棱镜
    this.shards = [];
    const shardGeo = new THREE.OctahedronGeometry(1, 0);
    for (let i = 0; i < 46; i += 1) {
      const mat = new THREE.MeshStandardMaterial({
        color: [0x4fe3d0, 0xff5fa2, 0x9d7bff, 0xffc46b][i % 4],
        roughness: 0.1,
        metalness: 0.7,
        emissive: [0x1d6b64, 0x6b1f42, 0x3a2578, 0x6b4a1c][i % 4],
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(shardGeo, mat);
      // 前景多、远处少，保证初始视角内有内容
      const near = i < 26;
      const r = near ? 4 + Math.random() * 12 : 16 + Math.random() * 22;
      const a = (i / 46) * Math.PI * 2 + Math.random() * 0.5;
      mesh.position.set(Math.cos(a) * r, -0.4 + Math.random() * 8.5, Math.sin(a) * r);
      const s = 0.45 + Math.random() * 1.6;
      mesh.scale.setScalar(s);
      mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      this.scene.add(mesh);
      this.shards.push({
        mesh,
        spin: (Math.random() - 0.5) * 0.006,
        bob: Math.random() * Math.PI * 2,
        base: mesh.position.y,
      });
    }

    // 中央棱镜碑 —— 场景的视觉焦点
    const monolith = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(2.4, 0),
      new THREE.MeshStandardMaterial({
        color: 0x8fd8ff,
        roughness: 0.05,
        metalness: 0.9,
        emissive: 0x2a5f9c,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.92,
      }),
    );
    core.position.y = 5.2;
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(3.4, 20, 16),
      new THREE.MeshBasicMaterial({
        color: 0x4fe3d0,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.position.y = 5.2;
    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.6 + i * 1.1, 0.035, 8, 60),
        new THREE.MeshBasicMaterial({
          color: [0x4fe3d0, 0xff5fa2, 0x9d7bff][i],
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      ring.rotation.x = Math.PI / 2 + (i - 1) * 0.28;
      ring.position.y = 5.2;
      monolith.add(ring);
    }
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 2.1, 5.4, 8),
      new THREE.MeshStandardMaterial({
        color: 0x121c48,
        roughness: 0.4,
        metalness: 0.7,
        emissive: 0x0a1230,
        emissiveIntensity: 0.9,
      }),
    );
    pillar.position.y = 2.7;
    monolith.add(core, halo, pillar);
    this.scene.add(monolith);
    this.monolith = monolith;
    this.monolithCore = core;

    const monolithLight = new THREE.PointLight(0x7fe0ff, 120, 46, 2);
    monolithLight.position.set(0, 5.2, 0);
    this.scene.add(monolithLight);

    // 远处光柱
    for (let i = 0; i < 9; i += 1) {
      const a = (i / 9) * Math.PI * 2;
      const r = 34 + Math.random() * 16;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 1.1, 26, 12, 1, true),
        new THREE.MeshBasicMaterial({
          color: [0x4fe3d0, 0xff5fa2, 0x9d7bff][i % 3],
          transparent: true,
          opacity: 0.09,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      pillar.position.set(Math.cos(a) * r, 11, Math.sin(a) * r);
      this.scene.add(pillar);
    }

    // 热点标记
    this.hotspotMeshes = [];
    for (const hs of HOTSPOTS) {
      const group = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.44, 0.035, 10, 34),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(hs.color),
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.2),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hs.color) }),
      );
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.62, 14, 12),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(hs.color),
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      group.add(ring, core, halo);
      group.position.set(...hs.pos);
      this.scene.add(group);
      this.hotspotMeshes.push({ hs, group, ring, core, halo });
    }
  }

  buildPanel() {
    clear(this.panel);

    const status = el('div.device-status');
    this.statusEl = status;

    const detectBtn = el('button.btn.btn-sm', { type: 'button', 'data-control': 'detect-vr' }, '检测本机 WebXR 沉浸式 VR 支持');
    detectBtn.addEventListener('click', async () => {
      detectBtn.disabled = true;
      detectBtn.textContent = '检测中…';
      const result = await detectWebXR();
      detectBtn.disabled = false;
      detectBtn.textContent = '重新检测本机 WebXR 沉浸式 VR 支持';
      status.textContent = '';
      status.appendChild(
        el(
          'p',
          { class: `device-line ${result.supported ? 'is-yes' : 'is-no'}` },
          el('b', {}, '浏览器是否提供 immersive-vr 会话：'),
          result.supported ? '提供' : result.reason === 'no-xr' ? '未提供（navigator.xr 不存在）' : '不提供',
        ),
      );
      status.appendChild(
        el(
          'p',
          { class: 'device-line' },
          el('b', {}, '本展项的设备支持：'),
          '桌面端交互演示（不支持 VR 头显）',
        ),
      );
      status.appendChild(
        el(
          'p',
          { class: 'device-note' },
          '检测结果仅反映浏览器是否暴露 WebXR 能力，与本展项的实现无关：本页用普通 WebGL 渲染，没有创建 immersive-vr 会话，也没有立体渲染与手柄追踪。真正的设备支持需要按 ',
          el(
            'a',
            { href: 'https://www.w3.org/TR/webxr/', target: '_blank', rel: 'noopener noreferrer' },
            'W3C WebXR 规范',
          ),
          ' 实现会话、参考空间与立体呈现。',
        ),
      );
    });

    this.panel.appendChild(
      el(
        'div.halo-panel-inner',
        {},
        el('h2', {}, '设备支持状态'),
        el(
          'ul.device-list',
          {},
          el('li', {}, el('b', {}, '展项类型：'), '桌面端交互演示'),
          el('li', {}, el('b', {}, 'VR 头显支持：'), '不支持'),
          el('li', {}, el('b', {}, '立体渲染 / 手柄追踪：'), '未实现'),
          el('li', {}, el('b', {}, '交互方式：'), '鼠标拖拽环视 · 滚轮变焦 · WASD 移动'),
        ),
        status,
        el('div.halo-panel-actions', {}, detectBtn),
        el(
          'p.halo-panel-foot',
          {},
          '展签内容引自公开的一手与官方来源，点击卡片中的链接可前往原文。',
        ),
      ),
    );
  }

  bindInput() {
    this.dragging = false;
    this.lastPointer = { x: 0, y: 0 };

    this.onPointerDown = (event) => {
      this.focusGame();
      this.dragging = true;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.renderer.domElement.setPointerCapture?.(event.pointerId);
      this.renderer.domElement.classList.add('is-grabbing');
    };
    this.onPointerMove = (event) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastPointer.x;
      const dy = event.clientY - this.lastPointer.y;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      this.yaw -= dx * 0.0042;
      this.pitch -= dy * 0.0034;
      this.pitch = Math.max(-1.15, Math.min(1.05, this.pitch));
    };
    this.onPointerUp = (event) => {
      this.dragging = false;
      this.renderer.domElement.releasePointerCapture?.(event.pointerId);
      this.renderer.domElement.classList.remove('is-grabbing');
    };
    this.onWheel = (event) => {
      event.preventDefault();
      this.camera.fov = Math.max(32, Math.min(88, this.camera.fov + Math.sign(event.deltaY) * 3));
      this.camera.updateProjectionMatrix();
    };
    this.onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (!this.isGameFocused()) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        this.presses += 1;
        this.keys.add(event.code);
        this.publish();
      }
    };
    this.onKeyUp = (event) => this.keys.delete(event.code);

    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.renderer.domElement.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  updateMovement(dt) {
    const speed = 7.5;
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3();
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) move.add(forward);
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) move.sub(forward);
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) move.add(right);
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) move.sub(right);
    if (move.lengthSq() > 0) move.normalize().multiplyScalar(speed);
    this.velocity.lerp(move, Math.min(1, dt * 7));
    this.pos.addScaledVector(this.velocity, dt);
    this.pos.y = 2.4 + Math.sin(this.clock.elapsedTime * 1.2) * 0.07;

    const radius = Math.hypot(this.pos.x, this.pos.z);
    if (radius > 26) {
      this.pos.x = (this.pos.x / radius) * 26;
      this.pos.z = (this.pos.z / radius) * 26;
    }
  }

  updateHotspots() {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    let best = null;
    let bestAngle = Math.cos(0.36); // ≈ 20°

    for (const item of this.hotspotMeshes) {
      const dir = new THREE.Vector3(...item.hs.pos).sub(this.camera.position);
      const dist = dir.length();
      dir.normalize();
      const dot = dir.dot(forward);
      item.ring.rotation.z += 0.006;
      item.core.rotation.y += 0.01;
      item.halo.scale.setScalar(1 + Math.sin(this.clock.elapsedTime * 1.6 + item.hs.pos[0]) * 0.1);
      item.ring.material.opacity = 0.35 + Math.sin(this.clock.elapsedTime * 1.6 + item.hs.pos[2]) * 0.2;
      if (dist > 46) continue;
      if (dot > bestAngle) {
        bestAngle = dot;
        best = item;
      }
    }

    if (best !== this.activeHotspot) {
      this.activeHotspot = best;
      this.renderHotspotCard();
      this.publish();
    }
    if (best) {
      this.positionCard(best);
    }
  }

  positionCard(item) {
    const node = this.overlay.querySelector('.halo-card');
    if (!node) return;
    const v = new THREE.Vector3(...item.hs.pos).project(this.camera);
    const rect = this.host.getBoundingClientRect();
    const x = (v.x * 0.5 + 0.5) * rect.width;
    const y = (-v.y * 0.5 + 0.5) * rect.height;
    node.style.left = `${Math.max(12, Math.min(rect.width - 12, x))}px`;
    node.style.top = `${Math.max(12, Math.min(rect.height - 12, y))}px`;
  }

  renderHotspotCard() {
    clear(this.overlay);
    if (!this.activeHotspot) return;
    const hs = this.activeHotspot.hs;
    const card = el(
      'div.halo-card',
      {},
      el('span.halo-card-dot', { style: { background: hs.color } }),
      el('h3', {}, hs.title),
      el('p', {}, hs.body),
      el(
        'div.halo-card-src',
        {},
        el(
          'a',
          { href: hs.source.url, target: '_blank', rel: 'noopener noreferrer' },
          `来源：${hs.source.label}`,
        ),
        hs.extra
          ? el(
              'span',
              {},
              ' / ',
              hs.extra.map((s, i) =>
                el(
                  'span',
                  {},
                  i > 0 ? ' / ' : '',
                  el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.label),
                ),
              ),
            )
          : null,
      ),
    );
    this.overlay.appendChild(card);
  }

  loop() {
    this.raf = window.requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.updateMovement(dt);

    this.camera.position.copy(this.pos);
    this.camera.rotation.set(0, 0, 0, 'YXZ');
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;

    if (this.monolith) {
      this.monolith.rotation.y = this.clock.elapsedTime * 0.06;
      if (this.monolithCore) {
        this.monolithCore.rotation.y = -this.clock.elapsedTime * 0.18;
        this.monolithCore.position.y = 5.2 + Math.sin(this.clock.elapsedTime * 0.8) * 0.22;
      }
    }

    for (const s of this.shards) {
      s.mesh.rotation.y += s.spin;
      s.mesh.rotation.x += s.spin * 0.6;
      s.mesh.position.y = s.base + Math.sin(this.clock.elapsedTime * 0.6 + s.bob) * 0.4;
    }

    this.updateHotspots();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const rect = this.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('wheel', this.onWheel);
    this.scene.traverse((obj) => {
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach((mm) => mm.dispose());
      else obj.material?.dispose?.();
    });
    this.renderer.dispose();
    publishState({ state: 'idle', route: '/halo', chapter: null });
  }
}

/** 真实检测浏览器是否提供 WebXR 沉浸式 VR 会话。 */
export async function detectWebXR() {
  if (!('xr' in navigator) || !navigator.xr) {
    return { supported: false, reason: 'no-xr' };
  }
  try {
    const ok = await navigator.xr.isSessionSupported('immersive-vr');
    return { supported: Boolean(ok), reason: ok ? 'ok' : 'unsupported' };
  } catch (err) {
    return { supported: false, reason: 'error', error: err };
  }
}
