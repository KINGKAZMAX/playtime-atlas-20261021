/**
 * Scene wrapper for the CHROMA S1 device.
 * Owns renderer, camera, lights, orbit control, the explode animation
 * and the render loop. Uses only the `three` npm package.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildDevice, drawDeviceScreen, setColorway, type Colorway, type DeviceParts } from './device';
import { timelineLive } from '../modules/motion';

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
    ctx.strokeStyle = 'rgba(20, 17, 15, 0.13)';
    ctx.lineWidth = 1;
    for (let r = 40; r < size / 2; r += 38) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(20, 17, 15, 0.07)';
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
    // keeps the buffer readable for screenshot / pixel checks
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();

  // Procedural studio environment (no HDR file) so metals read properly.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.38;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.38, options.mode === 'explode' ? 4.8 : 3.9);

  /* --- lights ------------------------------------------------------ */
  scene.add(new THREE.HemisphereLight(0x9fd8e8, 0x0a0d11, 0.55));

  const key = new THREE.DirectionalLight(0xfff2e6, 3.4);
  key.position.set(2.6, 3.4, 3.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x6fe0ee, 2.2);
  rim.position.set(-3.2, 1.4, -2.6);
  scene.add(rim);

  const warm = new THREE.PointLight(0xff6b2c, 9, 16, 2);
  warm.position.set(1.6, -1.4, 2.6);
  scene.add(warm);

  const fill = new THREE.DirectionalLight(0xdfe9f2, 1.5);
  fill.position.set(-2.2, -1.6, 2.4);
  scene.add(fill);

  /* --- device ------------------------------------------------------ */
  const parts = buildDevice('graphite');
  const pivot = new THREE.Group();
  // three-quarter view: front face towards the camera, slight top-down tilt
  parts.root.rotation.set(-0.16, 0.22, 0);
  pivot.add(parts.root);
  scene.add(pivot);

  /* --- floor grid -------------------------------------------------- */
  const grid = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshBasicMaterial({
      map: makeGridTexture(),
      transparent: true,
      opacity: options.mode === 'explode' ? 0.3 : 0.5,
      depthWrite: false,
    }),
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -1.05;
  scene.add(grid);

  /* --- controls ---------------------------------------------------- */
  const controls = new OrbitControls(camera, canvas);
  // Once the visitor has framed the model themselves, stop auto-fitting.
  controls.addEventListener('start', () => {
    userFramed = true;
  });
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

  /* --- resize ------------------------------------------------------ */
  // The canvas frame is now 21/9 (design-system cover media). A wide frame
  // would leave the instrument small in the middle, so the camera distance is
  // derived from the aspect: the device should keep a stable share of the
  // frame width, and never overflow the height.
  const DEVICE_W = 1.62; // body + trim, world units
  const DEVICE_H = 0.72;
  let userFramed = false;

  const fitDistance = (aspect: number): number => {
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const byWidth = (DEVICE_W * 0.62) / (2 * tan * aspect);
    const byHeight = (DEVICE_H * 1.25) / (2 * tan);
    return Math.min(Math.max(Math.max(byWidth, byHeight), 2.8), 7.5);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!userFramed) {
      const dir = camera.position.clone().normalize();
      camera.position.copy(dir.multiplyScalar(fitDistance(camera.aspect)));
      controls.update();
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Default framing is captured *after* the first aspect-aware fit, so that
  // double-click reset returns to the composed shot, not the raw camera slot.
  let defaultPosition = camera.position.clone();
  let defaultTarget = controls.target.clone();
  requestAnimationFrame(() => {
    defaultPosition = camera.position.clone();
    defaultTarget = controls.target.clone();
  });

  /* --- explode animation ------------------------------------------- */
  let explodeTarget = 0;
  let explodeCurrent = 0;
  const animatedParts: THREE.Object3D[] = [
    parts.aperture,
    parts.sensor,
    parts.chip,
    parts.pcb,
    parts.battery,
    parts.screenGroup,
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
    // the housing becomes a flat translucent ghost so the internals read
    if (amount > 0.02) {
      parts.body.material = parts.ghostMaterial;
      parts.ghostMaterial.opacity = amount * 0.16;
    } else {
      parts.body.material = parts.shellMaterial;
      parts.ghostMaterial.opacity = 0;
    }
  };
  applyExplode(0);

  /* --- render loop -------------------------------------------------- */
  let raf = 0;
  let visible = true;
  const clock = new THREE.Clock();

  /**
   * Draw one frame. Called from the animation loop, but also directly on
   * user interaction, so the device stays responsive even when the
   * animation timeline is throttled.
   */
  let rendering = false;
  const renderFrame = (elapsed: number) => {
    if (rendering) return; // guards against controls.update() -> change -> update
    rendering = true;
    try {
      if (Math.abs(explodeTarget - explodeCurrent) > 0.0008) {
        explodeCurrent += (explodeTarget - explodeCurrent) * 0.085;
        applyExplode(explodeCurrent);
      }
      // gentle idle float
      pivot.position.y = Math.sin(elapsed * 0.8) * 0.035;
      pivot.rotation.z = Math.sin(elapsed * 0.5) * 0.012;
      controls.update();
      renderer.render(scene, camera);
    } finally {
      rendering = false;
    }
  };

  controls.addEventListener('change', () => {
    if (rendering) return;
    renderFrame(clock.getElapsedTime());
  });

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    renderFrame(clock.getElapsedTime());
  };
  raf = requestAnimationFrame(tick);

  // Paint once immediately so the device is on screen even if frames are
  // never scheduled (throttled / backgrounded renderer).
  renderFrame(0);

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
      if (!timelineLive()) {
        // no animation timeline available - land on the final state directly
        explodeCurrent = amount;
        applyExplode(explodeCurrent);
        renderer.render(scene, camera);
      }
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
    },
  };
}
