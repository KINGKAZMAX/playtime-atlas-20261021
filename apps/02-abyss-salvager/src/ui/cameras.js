/**
 * Camera preset rig.
 *
 * Six switchable survey positions plus a free-orbit mode, each animated with an
 * eased tween so switching feels cinematic rather than teleporting.
 *
 * Each preset describes a look-at target, a viewing direction and the world
 * extent that must stay visible. The camera distance is solved every frame
 * from the live aspect ratio, so the 760 m machine stays framed on a portrait
 * phone and on an ultrawide monitor alike.
 */

import * as THREE from 'three';

const PRESETS = [
  {
    id: 'survey',
    label: '测绘 / SURVEY',
    hint: '三分之四测绘全景',
    target: [11.3, 0.8, 0],
    dir: [-0.62, 0.4, 0.95],
    fit: { w: 27, h: 9 },
    fitNarrow: { w: 14, h: 8 },
    margin: 1.12,
  },
  {
    id: 'plan',
    label: '俯视 / PLAN',
    hint: '垂直俯视测绘',
    target: [11.3, 0.3, 0],
    dir: [0.0, 1.0, 0.02],
    fit: { w: 27, h: 10 },
    fitNarrow: { w: 14, h: 9 },
    margin: 1.12,
  },
  {
    id: 'profile',
    label: '侧视 / PROFILE',
    hint: '全侧向轮廓',
    target: [11.5, 0.6, 0],
    dir: [0.0, 0.09, 1.0],
    fit: { w: 27, h: 7 },
    fitNarrow: { w: 14, h: 7 },
    margin: 1.1,
  },
  {
    id: 'crown',
    label: '磨削冠 / CROWN',
    hint: '正对磨削冠',
    target: [0.85, 0.65, 0],
    dir: [-0.94, 0.18, 0.28],
    fit: { w: 5.4, h: 4.2 },
    fitNarrow: { w: 4.6, h: 4 },
    margin: 1.15,
  },
  {
    id: 'hopper',
    label: '矿仓 / HOPPER',
    hint: '尾部矿仓与尾扇',
    target: [21.4, 0.7, 0],
    dir: [0.66, 0.28, 0.7],
    fit: { w: 8.5, h: 5.5 },
    fitNarrow: { w: 7, h: 4.6 },
    margin: 1.15,
  },
  {
    id: 'follow',
    label: '随行 / FOLLOW',
    hint: '跟随磨削冠',
    target: [1.1, 0.7, 0],
    dir: [-0.72, 0.32, 0.6],
    fit: { w: 7.5, h: 4.6 },
    fitNarrow: { w: 6, h: 4.2 },
    margin: 1.15,
  },
];

/** Below this aspect ratio we switch to the tighter "narrow" framing. */
const NARROW_ASPECT = 1.15;

export function createCameraRig(camera, controls) {
  let current = 'survey';
  let tween = null;
  const fromPos = new THREE.Vector3();
  const fromTarget = new THREE.Vector3();
  const toPos = new THREE.Vector3();
  const toTarget = new THREE.Vector3();
  const tmpDir = new THREE.Vector3();

  /**
   * Solve the camera distance that keeps the preset's world extent visible.
   * The horizontal or vertical FOV becomes the binding constraint depending on
   * the viewport aspect. Narrow viewports use the tighter `fitNarrow` extent.
   */
  function solveDistance(preset, aspect) {
    const fit = aspect < NARROW_ASPECT && preset.fitNarrow ? preset.fitNarrow : preset.fit;
    const vFov = (camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const dV = fit.h / 2 / Math.tan(vFov / 2);
    const dH = fit.w / 2 / Math.tan(hFov / 2);
    return Math.max(dV, dH) * preset.margin;
  }

  function computePose(preset, aspect) {
    tmpDir.set(preset.dir[0], preset.dir[1], preset.dir[2]).normalize();
    const dist = solveDistance(preset, aspect);
    const narrow = aspect < NARROW_ASPECT;
    // On a narrow viewport, slide the look-at point toward the crown so the
    // machine still reads as a machine rather than a distant sliver.
    const t = preset.target[0];
    const focusX = narrow ? t * 0.55 : t;
    toTarget.set(focusX, preset.target[1], preset.target[2]);
    toPos.copy(toTarget).addScaledVector(tmpDir, dist);
    // Never let the camera sink below the seafloor.
    toPos.y = Math.max(toPos.y, 0.45);
  }

  function apply(id, instant = false) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    current = id;
    computePose(preset, camera.aspect);
    fromPos.copy(camera.position);
    fromTarget.copy(controls.target);
    if (instant) {
      camera.position.copy(toPos);
      controls.target.copy(toTarget);
      tween = null;
    } else {
      tween = { t: 0, dur: 1.15, preset };
    }
  }

  function update(dt) {
    if (!tween) return;
    // Re-solve every frame so a mid-transition resize stays correct.
    computePose(tween.preset, camera.aspect);
    tween.t += dt / tween.dur;
    const k = Math.min(1, tween.t);
    // easeInOutCubic
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camera.position.lerpVectors(fromPos, toPos, e);
    controls.target.lerpVectors(fromTarget, toTarget, e);
    if (k >= 1) tween = null;
  }

  /** Manual orbit breaks the preset lock so the user is never fighting the rig. */
  function breakLock() {
    tween = null;
    current = 'free';
  }

  return {
    presets: PRESETS,
    apply,
    update,
    breakLock,
    /** Re-frame the active preset after a resize. */
    refit() {
      if (current === 'free') return;
      const preset = PRESETS.find((p) => p.id === current);
      if (!preset) return;
      computePose(preset, camera.aspect);
      camera.position.copy(toPos);
      controls.target.copy(toTarget);
    },
    get current() {
      return current;
    },
  };
}
