/**
 * fallback.js — 2D 降级示意图 / 2D schematic fallback
 *
 * 当浏览器没有 WebGL 时，用同一套真实几何生成 SVG 示意图：
 * 取每个构件网格的真实顶点，等轴投影后求凸包并绘制。
 * 因此降级插图与 3D 模型是同一份几何数据，不是另画的假图。
 */
import * as THREE from 'three';

const ISO = {
  cos30: Math.cos(Math.PI / 6),
  sin30: Math.sin(Math.PI / 6),
};

function project(v) {
  return {
    x: (v.x - v.z) * ISO.cos30,
    y: (v.x + v.z) * ISO.sin30 - v.y,
  };
}

/** Andrew monotone chain 凸包。 */
function convexHull(points) {
  if (points.length < 3) return points;
  const pts = [...points].sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

/** 已知构件族（其填充色由 §9.4 的单色阶规则在样式表中派生，此处只作图例白名单）。 */
const FAMILIES = ['wood', 'stone', 'earth', 'tile', 'water'];

/**
 * 生成 SVG 示意图。
 * 样式类名对齐 16-design-system/DESIGN-SPEC.md §9.4「建筑模型（18 结构模型）」：
 * 容器 .ds-diagram / 构件 .ds-diagram__fill + .ds-diagram__stroke / 标注 .ds-diagram__dim。
 * 全部样式取自全局样式表（src/ui/styles.css）的 --ds-* 令牌，此处不再内联 <style>。
 *
 * @param {import('three').Group} group
 * @param {Array} parts
 * @param {{lang?:'en'|'zh', width?:number, height?:number, labelParts?:boolean}} opts
 * @returns {string} SVG 源码
 */
export function renderFallbackSVG(group, parts, opts = {}) {
  const W = opts.width || 960;
  const H = opts.height || 620;
  const lang = opts.lang || 'en';

  const polys = [];
  const labels = [];
  const bounds = new THREE.Box3();

  for (const part of parts || []) {
    const pts = [];
    part.object.updateWorldMatrix(true, true);
    part.object.traverse((o) => {
      if (!o.isMesh) return;
      const pos = o.geometry.getAttribute('position');
      if (!pos) return;
      const mat = new THREE.Matrix4();
      o.getWorldPosition(new THREE.Vector3());
      mat.copy(o.matrixWorld);
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mat);
        bounds.expandByPoint(v);
        pts.push(project(v));
      }
    });
    if (pts.length < 3) continue;
    const hull = convexHull(pts);
    if (hull.length < 3) continue;
    polys.push({ part, hull });
    const c = hull.reduce((a, p) => ({ x: a.x + p.x / hull.length, y: a.y + p.y / hull.length }), { x: 0, y: 0 });
    labels.push({ part, x: c.x, y: c.y });
  }

  if (!polys.length) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img"><rect width="${W}" height="${H}" fill="#FFFFFF"/></svg>`;
  }

  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const spanX = Math.max(size.x, size.z) * ISO.cos30 * 2;
  const spanY = (Math.max(size.x, size.z) * ISO.sin30 + size.y) * 1.15;
  const scale = Math.min((W - 80) / Math.max(spanX, 0.001), (H - 80) / Math.max(spanY, 0.001));
  const offX = W / 2;
  const offY = H / 2 + (size.y * scale) / 2;

  const toScreen = (p) => [offX + p.x * scale, offY + p.y * scale];

  const body = polys.map(({ part, hull }) => {
    const d = hull.map((p, i) => {
      const [sx, sy] = toScreen(p);
      return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`;
    }).join(' ') + ' Z';
    return `<path class="ds-diagram__fill ds-diagram__stroke fb-part" data-family="${part.family || 'other'}" data-part="${part.id}" d="${d}"/>`;
  }).join('\n');

  const screenLabels = labels
    .filter((l) => l.part.layer)
    .map((l) => {
      // 注意：toScreen 接收的是 {x, y} 点对象，不是单个坐标值。
      // （此前误传 l.x，坐标算成 NaN，导致全部构件标注被下方的边界过滤丢弃。）
      const [rawX, rawY] = toScreen(l);
      return { ...l, rawX, rawY };
    })
    // 锚点落在画面之外的构件不标注（避免出现贴边的孤立文字）
    .filter((l) => l.rawX > 58 && l.rawX < W - 58 && l.rawY > 12 && l.rawY < H - 12)
    .slice(0, 14);

  const labelSvg = placeLabels(screenLabels, W, H, lang);

  // 图例：构件族配色说明（仅在标注开启时给出）
  const legendSvg = opts.labelParts === false ? '' : legend(lang);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" role="img" aria-label="${lang === 'zh' ? '结构示意图' : 'Structural schematic'}">
  <rect width="${W}" height="${H}" fill="var(--ds-bg-raised)"/>
  ${body}
  ${labelSvg}
  ${legendSvg}
</svg>`;
}

/**
 * 构件族图例：木 / 石 / 土 / 瓦 / 水。
 * 色块沿用 §9.4 的构件填充规则（.ds-diagram__fill + data-family 单色阶），
 * 与图内构件同源，不会出现「图例颜色与图内不符」。
 */
function legend(lang) {
  const items = [
    ['wood', lang === 'zh' ? '木' : 'Timber'],
    ['stone', lang === 'zh' ? '石' : 'Stone'],
    ['earth', lang === 'zh' ? '土' : 'Earth'],
    ['tile', lang === 'zh' ? '瓦' : 'Tile'],
    ['water', lang === 'zh' ? '水' : 'Water'],
  ].filter(([f]) => FAMILIES.includes(f));
  const x = 14;
  const y = 18;
  const step = 96;
  const swatches = items.map(([f, label], i) => {
    const cx = x + i * step;
    return `<rect x="${cx}" y="${y - 9}" width="11" height="11" rx="2" class="ds-diagram__fill fb-legend__swatch" data-family="${f}"/>`
      + `<text x="${cx + 16}" y="${y}" class="ds-diagram__dim fb-legend">${escapeXml(label)}</text>`;
  }).join('');
  return `<g aria-hidden="true">${swatches}</g>`;
}

/**
 * 构件标注排布：贪心避让 + 引出线。
 *
 * 降级示意图的构件在等轴投影下高度重叠（斗栱尤其如此），
 * 标签若直接落在凸包质心上会互相压叠、完全不可读。
 * 故按「上下左右偏移候选位」逐个尝试，取第一个既不出界、又不与已放置标签相撞的位置；
 * 放不下的标签直接省略（宁缺毋糊），并从锚点画一条引出线到标签。
 *
 * @param {Array<{rawX:number, rawY:number, part:object}>} items 已投影到屏幕坐标的标签候选
 * @param {number} W
 * @param {number} H
 * @param {'en'|'zh'} lang
 * @returns {string} SVG 片段
 */
function placeLabels(items, W, H, lang) {
  const CHAR_W = 6.2;      // 等宽 11px 的近似字宽
  const BOX_H = 15;
  const TOP = 34;          // 图例行占用 y < 30，标注让开
  const PAD = 6;

  const boxes = [];
  const parts = [];

  // 先按锚点纵向排序，优先安置上方的构件，视觉上更接近图例顺序
  const ordered = [...items].sort((a, b) => a.rawY - b.rawY);

  for (const it of ordered) {
    const text = lang === 'zh' ? it.part.name.zh : it.part.name.en;
    if (!text) continue;
    const w = text.length * CHAR_W + 8;
    let placed = null;

    for (const dy of [0, -16, 16, -32, 32, -48, 48, -64, 64, -80, 80, -96, 96, -112, 112]) {
      for (const dx of [0, -w / 2 - 10, w / 2 + 10, -w - 14, w + 14]) {
        const cx = it.rawX + dx;
        const cy = it.rawY + dy;
        const box = { x0: cx - w / 2, x1: cx + w / 2, y0: cy - BOX_H / 2, y1: cy + BOX_H / 2 };
        if (box.x0 < PAD || box.x1 > W - PAD || box.y0 < TOP || box.y1 > H - PAD) continue;
        if (boxes.some((b) => box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0)) continue;
        placed = { box, cx, cy };
        break;
      }
      if (placed) break;
    }
    if (!placed) continue;

    boxes.push(placed.box);
    parts.push({ text, ax: it.rawX, ay: it.rawY, cx: placed.cx, cy: placed.cy });
  }

  return parts.map(({ text, ax, ay, cx, cy }) => {
    const leader = Math.abs(ax - cx) > 3 || Math.abs(ay - cy) > 3
      ? `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${cy.toFixed(1)}" class="ds-diagram__leader"/>`
      : '';
    // §9.4：尺寸标注用 .ds-diagram__dim（mono 11px、--ds-ink-faint）
    const textEl = `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" class="ds-diagram__dim fb-label" text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>`;
    return leader + textEl;
  }).join('\n');
}

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

/** 检测是否具备可用的 WebGL 上下文。 */
export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext
      && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
