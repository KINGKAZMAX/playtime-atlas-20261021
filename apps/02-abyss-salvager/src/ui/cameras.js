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
    margin: 1.04,
    // 全景机位改用模型**真实包围盒**做取景：手调的 fit 盒比实际投影大
    // 约 35%，会把机器缩成一条看不清的斜线。
    useContentBox: true,
  },
  {
    id: 'plan',
    label: '俯视 / PLAN',
    hint: '垂直俯视测绘',
    target: [11.3, 0.3, 0],
    dir: [0.0, 1.0, 0.02],
    fit: { w: 27, h: 10 },
    fitNarrow: { w: 14, h: 9 },
    margin: 1.04,
    useContentBox: true,
  },
  {
    id: 'profile',
    label: '侧视 / PROFILE',
    hint: '全侧向轮廓',
    target: [11.5, 0.6, 0],
    dir: [0.0, 0.09, 1.0],
    fit: { w: 27, h: 7 },
    fitNarrow: { w: 14, h: 7 },
    margin: 1.04,
    useContentBox: true,
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
  const tmpRight = new THREE.Vector3();
  const tmpUp = new THREE.Vector3();
  const camRight = new THREE.Vector3();
  const camUp = new THREE.Vector3();

  /**
   * HUD 安全区（像素）。左���工具栈 / 右侧卡片栏 / 顶栏 / 底部长剖带
   * 都会遮住画布，模型必须落在**空出来的区域**里，否则面板压住机器。
   * 由 main.js 按实际 DOM 矩形算出并注入。
   */
  let safe = null;

  /** 模型的世界包围盒（半长），用于全景机位的精确取景。 */
  let content = null; // { hx, hy, hz }

  /**
   * 注入模型包围盒（全长/全高/全宽的一半）。
   * 有了它，全景机位按**真实投影尺寸**取景，而不是靠手调的保守盒子。
   */
  function setContentBounds(box) {
    content = box;
  }

  /**
   * 沿给定视线方向，把世界包围盒投影到相机右/上轴，得到该视角下
   * 实际可见的半宽与半高。
   */
  function projectedExtents(dir) {
    if (!content) return null;
    tmpRight.set(0, 1, 0).cross(dir).normalize();
    tmpUp.copy(dir).cross(tmpRight).normalize();
    const halfW =
      Math.abs(content.hx * tmpRight.x) +
      Math.abs(content.hy * tmpRight.y) +
      Math.abs(content.hz * tmpRight.z);
    const halfH =
      Math.abs(content.hx * tmpUp.x) +
      Math.abs(content.hy * tmpUp.y) +
      Math.abs(content.hz * tmpUp.z);
    return { halfW, halfH };
  }

  /**
   * 解算相机距离：让预设的世界包围盒落进安全区，而不是整个视口。
   *
   * 水平约束：safeW 像素要装下 fit.w 世界单位
   *   fit.w = safeW * 2*d*tan(hFov/2) / viewW
   * 垂直约束同理。两者取大者。
   */
  function solveDistance(preset, aspect) {
    const vFov = (camera.fov * Math.PI) / 180;
    const tanV = Math.tan(vFov / 2);
    const tanH = tanV * aspect;

    const viewW = safe ? safe.viewW : 1;
    const viewH = safe ? safe.viewH : 1;
    const safeW = safe ? safe.w : viewW;
    const safeH = safe ? safe.h : viewH;

    let halfW;
    let halfH;
    const dir = tmpDir.set(preset.dir[0], preset.dir[1], preset.dir[2]).normalize();
    const ext = preset.useContentBox ? projectedExtents(dir) : null;
    if (ext) {
      halfW = ext.halfW;
      halfH = ext.halfH;
    } else {
      const fit = aspect < NARROW_ASPECT && preset.fitNarrow ? preset.fitNarrow : preset.fit;
      halfW = fit.w / 2;
      halfH = fit.h / 2;
    }

    const dV = (halfH * 2 * viewH) / (2 * safeH * tanV);
    const dH = (halfW * 2 * viewW) / (2 * safeW * tanH);
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

    // 把模型挪到安全区中心：沿相机右/上轴偏移观察目标。
    if (safe && safe.viewW) {
      const vFov = (camera.fov * Math.PI) / 180;
      const tanV = Math.tan(vFov / 2);
      const tanH = tanV * aspect;
      const worldPerPx = (2 * dist * tanH) / safe.viewW;
      const dxPx = safe.cx - safe.viewW / 2;
      const dyPx = safe.cy - safe.viewH / 2;
      // 相机右/上轴（由视线方向叉乘得到）
      camRight.set(0, 1, 0).cross(tmpDir).normalize();
      camUp.copy(tmpDir).cross(camRight).normalize();
      toTarget.addScaledVector(camRight, -dxPx * worldPerPx);
      toTarget.addScaledVector(camUp, dyPx * worldPerPx);
      toPos.addScaledVector(camRight, -dxPx * worldPerPx);
      toPos.addScaledVector(camUp, dyPx * worldPerPx);
      toPos.y = Math.max(toPos.y, 0.45);
    }
  }

  /**
   * 注入 HUD 安全区（像素）。安全区必须是**视口坐标**下的矩形：
   *   { x, y, w, h, cx, cy }
   */
  function setSafeArea(area) {
    safe = area;
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
    setSafeArea,
    setContentBounds,
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
