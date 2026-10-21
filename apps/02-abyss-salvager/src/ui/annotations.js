/**
 * Screen-projected callout layer.
 *
 * Each callout anchor is an Object3D inside the model. Every frame we project
 * it to screen space and draw a leader line plus a numbered CN/EN chip that
 * flips side automatically so labels never overlap the machine.
 */

import * as THREE from 'three';
import { ANNOTATIONS } from '../model/parts.js';

export function createAnnotationLayer(container, camera, machine) {
  const layer = document.createElement('div');
  layer.className = 'annotation-layer';
  container.appendChild(layer);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'annotation-svg');
  layer.appendChild(svg);

  const items = [];
  ANNOTATIONS.forEach((def, idx) => {
    const anchor = machine.anchors.get(def.id);
    if (!anchor) return;

    const el = document.createElement('div');
    el.className = 'anno';
    const num = String(idx + 1).padStart(2, '0');
    el.innerHTML =
      `<span class="anno-id">${num}</span>` +
      `<span class="anno-text"><span class="anno-cn">${def.cn}</span>` +
      `<span class="anno-en">${def.en}</span></span>`;
    layer.appendChild(el);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('class', 'anno-line');
    svg.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('class', 'anno-dot');
    dot.setAttribute('r', '3');
    svg.appendChild(dot);

    items.push({ def, anchor, el, line, dot, side: 1 });
  });

  const projected = new THREE.Vector3();
  const placed = [];

  /** HUD 面板矩形（视口像素），标注胶囊必须避开它们。 */
  let reserved = [];

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function hitsReserved(x, y, w, h) {
    for (const r of reserved) {
      if (rectsOverlap({ x, y, w, h }, r)) return true;
    }
    return false;
  }

  /**
   * @param {number} width  视口宽
   * @param {number} height 视口高
   * @param {boolean} visible
   * @param {Array} reservedRects HUD 面板矩形列表（视口像素）
   */
  function update(width, height, visible, reservedRects) {
    layer.style.display = visible ? 'block' : 'none';
    if (!visible) {
      // 整层隐藏时，胶囊也要真正「不可见」——否则它们仍留在 DOM 里，
      // 带着 (0,0) 的文字盒被任何基于包围盒的重叠检测器当成真实文字。
      for (const it of items) it.el.style.visibility = 'hidden';
      return;
    }
    reserved = reservedRects || [];

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    placed.length = 0;

    for (const it of items) {
      it.anchor.getWorldPosition(projected);
      projected.project(camera);

      const behind = projected.z > 1;
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      const onScreen = !behind && x > -80 && x < width + 80 && y > -60 && y < height + 60;

      if (!onScreen) {
        it.el.style.opacity = '0';
        it.el.style.visibility = 'hidden';
        it.line.style.opacity = '0';
        it.dot.style.opacity = '0';
        continue;
      }

      it.el.style.opacity = '1';
      it.line.style.opacity = '1';
      it.dot.style.opacity = '1';

      // Place the label on the side of the machine with more free space.
      const centre = width * 0.5;
      it.side = x < centre ? -1 : 1;
      const offsetX = it.side * Math.min(160, Math.max(80, width * 0.11));

      placed.push({ it, x, y, ly: y, lx: x + offsetX });
    }

    // De-collide: labels on the same side get pushed apart vertically so no
    // two of them ever overlap.
    const MIN_GAP = 44;
    for (const side of [-1, 1]) {
      const group = placed.filter((p) => p.it.side === side).sort((a, b) => a.ly - b.ly);
      for (let i = 1; i < group.length; i++) {
        const gap = group[i].ly - group[i - 1].ly;
        if (gap < MIN_GAP) group[i].ly = group[i - 1].ly + MIN_GAP;
      }
      // Keep the stack inside the viewport.
      const overflow = group.length ? group[group.length - 1].ly - (height - 96) : 0;
      if (overflow > 0) for (const g of group) g.ly -= overflow;
    }

    // Place each chip, avoiding the HUD panels. Candidates: preferred side
    // first, then the other side, each at a ladder of vertical offsets.
    const DY = [0, -MIN_GAP, MIN_GAP, -MIN_GAP * 2, MIN_GAP * 2, -MIN_GAP * 3, MIN_GAP * 3];
    const placedBoxes = [];

    for (const p of placed) {
      const it = p.it;
      const w = it.el.offsetWidth || 120;
      const h = it.el.offsetHeight || 30;
      const offsetX = Math.min(160, Math.max(80, width * 0.11));

      let best = null;
      for (const side of [it.side, -it.side]) {
        for (const dy of DY) {
          const ly = p.ly + dy;
          if (ly < 22 || ly > height - 22) continue;
          let lx = p.x + side * offsetX;
          // The chip is anchored by its own edge, so the clamp has to account
          // for the measured width.
          if (side < 0) lx = Math.min(Math.max(lx, w + 12), width - 12);
          else lx = Math.max(Math.min(lx, width - w - 12), 12);

          const box = { x: side < 0 ? lx - w : lx, y: ly - h / 2, w, h };
          if (hitsReserved(box.x, box.y, box.w, box.h)) continue;
          if (placedBoxes.some((b) => rectsOverlap(b, box))) continue;
          best = { lx, ly, side, box };
          break;
        }
        if (best) break;
      }

      if (!best) {
        // No free spot: hide rather than cover the HUD.
        it.el.style.opacity = '0';
        it.el.style.visibility = 'hidden';
        it.line.style.opacity = '0';
        it.dot.style.opacity = '0';
        continue;
      }
      placedBoxes.push(best.box);

      it.el.style.visibility = 'visible';
      it.el.style.transform = `translate(${best.lx}px, ${best.ly}px) translate(${
        best.side < 0 ? '-100%' : '0'
      }, -50%)`;
      it.el.classList.toggle('left', best.side < 0);

      // Leader line with a small elbow — a technical-drawing kink.
      const elbowX = best.lx - best.side * 12;
      it.line.setAttribute('d', `M ${p.x} ${p.y} L ${elbowX} ${best.ly} L ${best.lx} ${best.ly}`);
      it.dot.setAttribute('cx', p.x);
      it.dot.setAttribute('cy', p.y);
    }
  }

  function dispose() {
    layer.remove();
  }

  return { update, dispose, element: layer };
}
