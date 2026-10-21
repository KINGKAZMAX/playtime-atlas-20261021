/**
 * annotations.js — 场景内双语标注 / In-scene bilingual annotations
 *
 * 把关键构件的名称直接标在三维模型上：
 *   · 中文名 + 英文名 同屏显示（双语标注）
 *   · 标签可点击，点击即选中该构件（与拾取等价）
 *   · 构件被隐藏 / 尚未就位 / 转到背面时自动隐藏
 *
 * 样式依据 16-design-system/DESIGN-SPEC.md §9.2（画布 HUD）
 * 与 §9.4（建筑模型线稿与标注）。
 */
import * as THREE from 'three';

const MAX_LABELS = 8;

/** 选出值得标注的构件：每个层级取装配次序最靠前的一个。 */
export function pickLabelParts(parts, layers) {
  if (!parts?.length) return [];
  const layerOrder = new Map((layers || []).map((l, i) => [l.id, i]));
  const sorted = [...parts].sort((a, b) => {
    const la = layerOrder.get(a.layer) ?? 999;
    const lb = layerOrder.get(b.layer) ?? 999;
    if (la !== lb) return la - lb;
    return (a.order ?? 0) - (b.order ?? 0);
  });
  const seen = new Set();
  const out = [];
  for (const p of sorted) {
    if (seen.has(p.layer)) continue;
    seen.add(p.layer);
    out.push(p);
    if (out.length >= MAX_LABELS) break;
  }
  return out;
}

export class Annotations {
  /**
   * @param {HTMLElement} host 覆盖层容器（位于画布框内）
   * @param {(partId:string)=>void} onSelect 点击标签时的回调
   */
  constructor(host, onSelect) {
    this.host = host;
    this.onSelect = onSelect || (() => {});
    this.items = [];
    this.enabled = true;
    this._v = new THREE.Vector3();
    this._box = new THREE.Box3();
  }

  setEnabled(on) {
    this.enabled = !!on;
    this.host.hidden = !this.enabled;
    if (!this.enabled) this.host.innerHTML = '';
  }

  /** 重建标签。parts 来自模型契约，lang 决定显示语言。 */
  build(parts, layers, lang) {
    this.host.innerHTML = '';
    this.items = [];
    if (!this.enabled) return;

    for (const p of pickLabelParts(parts, layers)) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'anno';
      el.dataset.partId = p.id;
      // 双语标注：主标签用当前界面语言，副标签用另一语言 —— 两种语言始终同屏可见
      const zh = p.name?.zh || '';
      const en = p.name?.en || '';
      const main = lang === 'zh' ? zh : en;
      const sub = lang === 'zh' ? en : zh;
      el.innerHTML = `<span class="anno__main" lang="${lang === 'zh' ? 'zh-CN' : 'en'}">${escapeHtml(main)}</span>`
        + `<span class="anno__sub" lang="${lang === 'zh' ? 'en' : 'zh-CN'}">${escapeHtml(sub)}</span>`;
      el.setAttribute('aria-label', `${zh} — ${en}`);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onSelect(p.id);
      });
      this.host.append(el);
      this.items.push({ el, part: p, w: 0, h: 0 });
    }
    this._measure();
    // 字体加载完成后标签宽度会变化，重新量一次（字体多为本地自托管，通常已就绪）
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => this._measure()).catch(() => {});
    }
  }

  /** 量取每个标签的真实尺寸 —— 避让必须用真实包围盒，不能用固定估值。 */
  _measure() {
    for (const it of this.items) {
      const w = it.el.offsetWidth;
      const h = it.el.offsetHeight;
      if (w > 0) it.w = w;
      if (h > 0) it.h = h;
    }
  }

  /**
   * 每帧更新标签位置。viewer 在渲染后调用。
   * @param {THREE.Camera} camera
   * @param {number} width  容器像素宽
   * @param {number} height 容器像素高
   */
  update(camera, width, height) {
    if (!this.enabled || !this.items.length) return;

    // 1) 投影：算出每个可见标签的屏幕坐标
    const placed = [];
    for (const it of this.items) {
      const { el, part } = it;
      const obj = part.object;
      if (!obj || !obj.visible) { el.style.display = 'none'; continue; }

      // 取构件包围盒中心作为锚点
      this._box.setFromObject(obj);
      if (this._box.isEmpty()) { el.style.display = 'none'; continue; }
      this._box.getCenter(this._v);
      this._v.project(camera);

      if (this._v.z > 1 || this._v.z < -1) { el.style.display = 'none'; continue; }
      const x = (this._v.x * 0.5 + 0.5) * width;
      const y = (-this._v.y * 0.5 + 0.5) * height;
      if (x < -80 || x > width + 80 || y < -40 || y > height + 40) {
        el.style.display = 'none';
        continue;
      }
      placed.push({ el, x, y, ax: x, ay: y, w: it.w || 120, h: it.h || 34 });
    }

    // 2) 贪心避让：只沿**竖直方向**挪动（保持与构件同一条竖线，读者一眼可对应）。
    //    先试下方、再试上方，取第一个既不与已放置标签相撞、也不出界的位置；
    //    挪动过的标签会画一条竖向引出线（见 .anno::before）。
    const GAP = 6;
    const done = [];
    for (const p of placed.sort((a, b) => a.y - b.y)) {
      const halfW = p.w / 2 + 2;
      const halfH = p.h / 2 + 2;
      let finalY = p.y;
      let dir = '';
      for (const step of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8]) {
        const cand = p.y + step * (p.h + GAP);
        if (cand - halfH < 0 || cand + halfH > height) continue;
        const box = { x0: p.x - halfW, x1: p.x + halfW, y0: cand - halfH, y1: cand + halfH };
        const clash = done.some(
          (q) => box.x0 < q.x1 && box.x1 > q.x0 && box.y0 < q.y1 && box.y1 > q.y0,
        );
        if (clash) continue;
        finalY = cand;
        dir = step === 0 ? '' : (step > 0 ? 'down' : 'up');
        break;
      }
      p.y = finalY;
      p.lead = Math.max(0, Math.abs(finalY - p.ay) - halfH);
      p.dir = dir;
      done.push({ x0: p.x - halfW, x1: p.x + halfW, y0: finalY - halfH, y1: finalY + halfH });
    }

    // 3) 落位
    for (const p of placed) {
      p.el.style.display = '';
      p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      p.el.style.setProperty('--anno-lead', `${p.lead.toFixed(1)}px`);
      if (p.dir) p.el.dataset.lead = p.dir;
      else p.el.removeAttribute('data-lead');
    }
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
