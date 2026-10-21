/**
 * Procedural 3D model of the CHROMA S1 pocket colourimeter.
 *
 * Every part is generated in code from primitives — there is no imported
 * model file, texture file or HDR environment.
 */
import * as THREE from 'three';

export type Colorway = 'graphite' | 'sand' | 'ice';

export const COLORWAYS: Record<Colorway, { shell: number; trim: number; label: string }> = {
  graphite: { shell: 0x3a3f46, trim: 0x14181d, label: '石墨灰' },
  sand: { shell: 0xc8b08a, trim: 0x2a241c, label: '沙岩色' },
  ice: { shell: 0x7fb6c9, trim: 0x14212a, label: '冰蓝色' },
};

export interface DeviceParts {
  root: THREE.Group;
  shell: THREE.Group;
  aperture: THREE.Group;
  sensor: THREE.Group;
  pcb: THREE.Group;
  battery: THREE.Group;
  chip: THREE.Group;
  screen: THREE.Mesh;
  screenCanvas: HTMLCanvasElement;
  screenTexture: THREE.CanvasTexture;
  shellMaterial: THREE.MeshStandardMaterial;
  trimMaterial: THREE.MeshStandardMaterial;
}

/* -------------------------------------------------------------------------- *
 * Geometry helpers
 * -------------------------------------------------------------------------- */

function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A rounded slab (box with soft edges) extruded along Z and centred on origin. */
function roundedSlab(
  w: number,
  h: number,
  d: number,
  r: number,
  bevel = 0.012,
): THREE.BufferGeometry {
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
    depth: Math.max(0.001, d - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 12,
  });
  geo.center();
  return geo;
}

function makeScreenTexture(): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, texture };
}

/** Draw the instrument's little screen: swatch, hex, peak wavelength. */
export function drawDeviceScreen(
  canvas: HTMLCanvasElement,
  hex: string,
  peak: number,
  label: string,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = '#0b0f13';
  ctx.fillRect(0, 0, w, h);

  // swatch block
  ctx.fillStyle = hex;
  ctx.fillRect(14, 14, 78, 78);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 78, 78);

  // readouts
  ctx.fillStyle = '#ece9e2';
  ctx.font = '600 30px "Martian Mono", monospace';
  ctx.textBaseline = 'top';
  ctx.fillText(hex.replace('#', ''), 104, 18);

  ctx.fillStyle = '#6d7781';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText(`λ ${String(peak).padStart(3, ' ')} nm`, 104, 56);

  ctx.fillStyle = '#4fd8e8';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText(label.toUpperCase().slice(0, 18), 104, 80);

  // mini spectrum strip
  const gx = 14;
  const gy = 108;
  const gw = w - 28;
  const gh = 38;
  for (let i = 0; i < gw; i++) {
    const t = i / gw;
    const hue = 280 - t * 280;
    const amp = 0.35 + 0.65 * Math.abs(Math.sin(t * Math.PI * 2.2 + 0.6));
    ctx.fillStyle = `hsl(${hue} 85% ${34 + amp * 26}%)`;
    ctx.fillRect(gx + i, gy + gh - amp * gh, 1, amp * gh);
  }
  ctx.strokeStyle = 'rgba(236,233,226,0.28)';
  ctx.lineWidth = 1;
  ctx.strokeRect(gx, gy, gw, gh);
}

/* -------------------------------------------------------------------------- *
 * Model assembly
 * -------------------------------------------------------------------------- */

export function buildDevice(colorway: Colorway = 'graphite'): DeviceParts {
  const root = new THREE.Group();
  const cw = COLORWAYS[colorway];

  const shellMaterial = new THREE.MeshStandardMaterial({
    color: cw.shell,
    roughness: 0.44,
    metalness: 0.58,
  });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: cw.trim,
    roughness: 0.62,
    metalness: 0.3,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0d11,
    roughness: 0.32,
    metalness: 0.72,
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x05080b,
    roughness: 0.06,
    metalness: 0.95,
  });
  const copperMaterial = new THREE.MeshStandardMaterial({
    color: 0xc98a3c,
    roughness: 0.34,
    metalness: 0.9,
  });
  const pcbMaterial = new THREE.MeshStandardMaterial({
    color: 0x13342f,
    roughness: 0.7,
    metalness: 0.2,
  });

  /* --- main shell ------------------------------------------------- */
  const shell = new THREE.Group();
  const body = new THREE.Mesh(roundedSlab(1.36, 0.62, 0.3, 0.1), shellMaterial);
  body.castShadow = true;
  shell.add(body);

  // grip ribs on the right flank
  for (let i = 0; i < 5; i++) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.34, 0.06),
      new THREE.MeshStandardMaterial({ color: cw.trim, roughness: 0.8, metalness: 0.2 }),
    );
    rib.position.set(0.5 - i * 0.045, -0.02, 0.16);
    shell.add(rib);
  }

  /* --- sensor aperture (front, -Z side) -------------------------- */
  const aperture = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.028, 18, 48), darkMaterial);
  aperture.add(ring);
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.128, 0.128, 0.1, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x1b2027, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide }),
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.04;
  aperture.add(barrel);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.118, 40), glassMaterial);
  glass.position.z = -0.012;
  aperture.add(glass);
  aperture.position.set(-0.34, 0.0, -0.15);
  shell.add(aperture);

  /* --- sensor die (sits behind the aperture) ---------------------- */
  const sensor = new THREE.Group();
  const die = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.02), copperMaterial);
  sensor.add(die);
  const dieFrame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.014), darkMaterial);
  dieFrame.position.z = 0.012;
  sensor.add(dieFrame);
  sensor.position.set(-0.34, 0.0, -0.1);
  shell.add(sensor);

  /* --- screen (top face) ------------------------------------------ */
  const { canvas: screenCanvas, texture: screenTexture } = makeScreenTexture();
  const screenMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false });
  const screen = new THREE.Mesh(roundedSlab(0.46, 0.26, 0.014, 0.03), screenMaterial);
  screen.position.set(0.16, 0.16, 0.156);
  screen.rotation.x = -0.0;
  shell.add(screen);
  const screenBezel = new THREE.Mesh(roundedSlab(0.52, 0.32, 0.012, 0.036), trimMaterial);
  screenBezel.position.set(0.16, 0.16, 0.15);
  shell.add(screenBezel);

  /* --- crown dial -------------------------------------------------- */
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 24), darkMaterial);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.71, 0.05, 0.0);
  shell.add(crown);
  const crownMark = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.012), copperMaterial);
  crownMark.position.set(0.71, 0.108, 0.0);
  shell.add(crownMark);

  /* --- calibration chips (three colour references on the flank) ---- */
  const chip = new THREE.Group();
  const chipColors = [0xd94b3f, 0x2f9e57, 0x2b6fd4];
  chipColors.forEach((c, i) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.085, 0.085, 0.026),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.15 }),
    );
    m.position.set(-0.02 + i * 0.1, -0.19, 0.152);
    chip.add(m);
  });
  const chipRail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.11, 0.012), trimMaterial);
  chipRail.position.set(0.08, -0.19, 0.146);
  chip.add(chipRail);
  shell.add(chip);

  /* --- pcb + battery (internal, revealed in exploded view) --------- */
  const pcb = new THREE.Group();
  const board = new THREE.Mesh(roundedSlab(0.9, 0.44, 0.018, 0.02), pcbMaterial);
  pcb.add(board);
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.03), darkMaterial);
  mcu.position.set(-0.2, 0.02, 0.02);
  pcb.add(mcu);
  const usb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.026), copperMaterial);
  usb.position.set(0.36, -0.12, 0.02);
  pcb.add(usb);
  for (let i = 0; i < 5; i++) {
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.04, 12),
      new THREE.MeshStandardMaterial({ color: 0x2a2f36, roughness: 0.6, metalness: 0.4 }),
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.set(-0.05 + i * 0.09, 0.13, 0.028);
    pcb.add(cap);
  }
  pcb.position.set(0.02, 0, 0.0);
  shell.add(pcb);

  const battery = new THREE.Group();
  const cell = new THREE.Mesh(roundedSlab(0.46, 0.3, 0.09, 0.04), new THREE.MeshStandardMaterial({
    color: 0x1b2430,
    roughness: 0.55,
    metalness: 0.25,
  }));
  battery.add(cell);
  const cellLabel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 0.005), new THREE.MeshStandardMaterial({
    color: 0xff6b2c,
    roughness: 0.7,
    metalness: 0.1,
  }));
  cellLabel.position.set(-0.06, 0.02, 0.047);
  battery.add(cellLabel);
  battery.position.set(-0.24, -0.02, 0.02);
  shell.add(battery);

  /* --- trigger button ---------------------------------------------- */
  const trigger = new THREE.Mesh(roundedSlab(0.22, 0.1, 0.05, 0.03), copperMaterial);
  trigger.position.set(-0.02, 0.31, 0.02);
  shell.add(trigger);

  /* --- lanyard loop ------------------------------------------------ */
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 12, 24), darkMaterial);
  loop.position.set(0.6, -0.2, -0.02);
  loop.rotation.y = Math.PI / 2;
  shell.add(loop);

  root.add(shell);

  /* --- explode offsets --------------------------------------------- */
  const offsets: Record<string, THREE.Vector3> = {
    aperture: new THREE.Vector3(-1.5, 0, 0),
    sensor: new THREE.Vector3(-1.05, 0, 0),
    chip: new THREE.Vector3(0, -1.25, 0),
    screen: new THREE.Vector3(0, 1.25, 0),
    pcb: new THREE.Vector3(0, 0, 1.4),
    battery: new THREE.Vector3(0, 0, -1.4),
    shell: new THREE.Vector3(0, 0, 0),
  };
  const groups: Record<string, THREE.Object3D> = {
    aperture,
    sensor,
    chip,
    pcb,
    battery,
    shell,
  };
  for (const [key, obj] of Object.entries(groups)) {
    obj.userData.basePosition = obj.position.clone();
    obj.userData.explodeOffset = offsets[key] ?? new THREE.Vector3();
  }
  // the screen lives inside the shell, so give it its own explode offset
  screen.userData.explodeOffset = offsets.screen;
  screen.userData.basePosition = screen.position.clone();

  return {
    root,
    shell,
    aperture,
    sensor,
    pcb,
    battery,
    chip,
    screen,
    screenCanvas,
    screenTexture,
    shellMaterial,
    trimMaterial,
  };
}

export function setColorway(parts: DeviceParts, colorway: Colorway): void {
  const cw = COLORWAYS[colorway];
  parts.shellMaterial.color.setHex(cw.shell);
  parts.trimMaterial.color.setHex(cw.trim);
}
