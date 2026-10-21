/**
 * Scene wrapper for the CHROMA S1 device.
 * Owns renderer, camera, lights, orbit control, the explode animation
 * and the render loop. Uses only the `three` npm package.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildDevice, drawDeviceScreen, setColorway, type Colorway, type DeviceParts } from './device';

export interface StageOptions {
  /** 'hero' keeps the device assembled; 'explode' supports the exploded view. */
  mode: 'hero' | 'explode';
  autoRotate?: boolean;
  /** Extra light for the exploded view so separated parts stay readable. */
  fillLight?: boolean;
}

export interface Stage {
  parts: DeviceParts;
  setColorway: (c: Colorway) => void;
  setExplode: (amount: number) => void;
  setScreen: (hex: string, peak: number, label: string) => void;
  highlight: (partName: string | null) => void;
  resetView: () => void;
  dispose: () => void;
}

function makeGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;
    ctx.strokeStyle = 'rgba(79, 216, 232, 0.30)';
    ctx.lineWidth = 1;
    for (let r = 40; r < size / 2; r += 38) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(79, 216, 232, 0.16)';
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * (size / 2), cy + Math.sin(a) * (size / 2));
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStage(canvas: HTMLCanvasElement, options: StageOptions): Stage {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.55, 4.4);

  /* --- lights ------------------------------------------------------ */
  scene.add(new THREE.HemisphereLight(0x9fd8e8, 0x0a0d11, 0.55));

  const key = new THREE.DirectionalLight(0xfff0e2, 2.1);
  key.position.set(2.6, 3.4, 3.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x4fd8e8, 1.5);
  rim.position.set(-3.2, 1.4, -2.6);
  scene.add(rim);

  const warm = new THREE.PointLight(0xff6b2c, 6.5, 14, 2);
  warm.position.set(1.4, -1.6, 2.4);
  scene.add(warm);

  if (options.fillLight) {
    const fill = new THREE.DirectionalLight(0xffd9c0, 0.9);
    fill.position.set(-2, -2, 2);
    scene.add(fill);
  }

  /* --- device ------------------------------------------------------ */
  const parts = buildDevice('graphite');
  const pivot = new THREE.Group();
  pivot.add(parts.root);
  scene.add(pivot);

  /* --- floor grid -------------------------------------------------- */
  const grid = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshBasicMaterial({
      map: makeGridTexture(),
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    }),
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -1.05;
  scene.add(grid);

  /* --- controls ---------------------------------------------------- */
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 2.6;
  controls.maxDistance = 7.5;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.86;
  controls.autoRotate = options.autoRotate ?? true;
  controls.autoRotateSpeed = 0.9;
  controls.target.set(0, 0.02, 0);
  controls.update();

  const defaultPosition = camera.position.clone();
  const defaultTarget = controls.target.clone();

  /* --- resize ------------------------------------------------------ */
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* --- explode animation ------------------------------------------- */
  let explodeTarget = 0;
  let explodeCurrent = 0;
  const animatedParts: THREE.Object3D[] = [
    parts.aperture,
    parts.sensor,
    parts.chip,
    parts.pcb,
    parts.battery,
    parts.screen,
  ];

  const applyExplode = (amount: number) => {
    for (const obj of animatedParts) {
      const base = obj.userData.basePosition as THREE.Vector3 | undefined;
      const offset = obj.userData.explodeOffset as THREE.Vector3 | undefined;
      if (!base || !offset) continue;
      obj.position.set(
        base.x + offset.x * amount,
        base.y + offset.y * amount,
        base.z + offset.z * amount,
      );
    }
    // fade the shell so the internals read clearly when exploded
    const shellMat = parts.shellMaterial;
    const targetOpacity = 1 - amount * 0.72;
    shellMat.opacity = targetOpacity;
    shellMat.transparent = amount > 0.01;
    parts.trimMaterial.opacity = targetOpacity;
    parts.trimMaterial.transparent = amount > 0.01;
  };
  applyExplode(0);

  /* --- render loop -------------------------------------------------- */
  let raf = 0;
  let visible = true;
  const clock = new THREE.Clock();
  let lastFrame = 0;

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    if (!visible) return;

    if (Math.abs(explodeTarget - explodeCurrent) > 0.0008) {
      explodeCurrent += (explodeTarget - explodeCurrent) * 0.085;
      applyExplode(explodeCurrent);
    }

    // gentle idle float
    pivot.position.y = Math.sin(t * 0.8) * 0.035;
    pivot.rotation.z = Math.sin(t * 0.5) * 0.012;

    controls.update();
    renderer.render(scene, camera);
    lastFrame = t;
  };
  raf = requestAnimationFrame(tick);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
    },
    { threshold: 0.01 },
  );
  io.observe(canvas);

  const onDoubleClick = () => {
    camera.position.copy(defaultPosition);
    controls.target.copy(defaultTarget);
    controls.update();
  };
  canvas.addEventListener('dblclick', onDoubleClick);

  return {
    parts,
    setColorway: (c: Colorway) => setColorway(parts, c),
    setExplode: (amount: number) => {
      explodeTarget = amount;
    },
    setScreen: (hex: string, peak: number, label: string) => {
      drawDeviceScreen(parts.screenCanvas, hex, peak, label);
      parts.screenTexture.needsUpdate = true;
    },
    highlight: (partName: string | null) => {
      const lookup: Record<string, THREE.Object3D | undefined> = {
        aperture: parts.aperture,
        sensor: parts.sensor,
        pcb: parts.pcb,
        battery: parts.battery,
        chip: parts.chip,
        shell: parts.shell,
      };
      for (const [key, group] of Object.entries(lookup)) {
        if (!group) continue;
        const isHot = key === partName;
        group.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
          if (!mat || !('emissive' in mat)) return;
          if (isHot) {
            mat.emissive.setHex(0xff6b2c);
            mat.emissiveIntensity = 0.45;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        });
      }
    },
    resetView: onDoubleClick,
    dispose: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('dblclick', onDoubleClick);
      controls.dispose();
      renderer.dispose();
      void lastFrame;
    },
  };
}
