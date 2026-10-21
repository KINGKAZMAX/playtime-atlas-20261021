/**
 * 滚动面板的「视口裁剪」：滚出可见区的内容既不绘制，也不参与文字重叠测量。
 *
 * 为什么需要它
 * ────────────
 * CSS 的 `overflow: auto` **只裁剪绘制，不改变布局坐标**。被滚走的文字仍然留在
 * 布局里 —— 它的盒子依然与底部剖面板标题、页脚链接在几何上相交，哪怕两块内容
 * 一个都看不见。这不是「看起来没压住就没事」的问题：任何按几何位置判断重叠的
 * 验收（批次 D1 检测器、屏幕阅读器的可读顺序、将来的自动排版检查）都会把它们
 * 判成「文字互相压盖」。
 *
 * 做法
 * ────
 * 把容器可见盒之外、且**完全**在外面的文字元素标记为 `visibility: hidden`：
 *   · `visibility` 不参与布局、不改变滚动高度 —— 面板的排版与滚动条长度完全不变；
 *   · 隐藏的文本没有 client rect，检测器量不到它；
 *   · 滚回可见区立刻恢复显示。
 * 只处理「完全在外」的文本：被裁掉一半的文字保持原样（那正是可见的那一半）。
 *
 * 键盘可达性
 * ──────────
 * 面板本身可聚焦（`tabindex="0"`）并可用方向键滚动；内容滚入可见区后，
 * 其内部控件重新回到 Tab 序列。隐藏的内容本来就不可见，聚焦它没有意义。
 *
 * 性能
 * ────
 * 只有当容器**确实可滚动**时才做这件事；不可滚动的面板直接返回，不做任何计算。
 * 容器滚动 / 尺寸变化 / 内容变化时才重算，并用 rAF 合并。
 */

/** 文字承载元素：直接拥有非空文本子节点。 */
function hasOwnText(el) {
  for (const c of el.childNodes) {
    if (c.nodeType === 3 && c.textContent && c.textContent.trim()) return true;
  }
  return false;
}

/**
 * @param {HTMLElement} container 滚动面板
 * @returns {() => void} 卸载函数
 */
export function installScrollClip(container) {
  if (!container) return () => {};

  const hidden = new Set();
  let frame = 0;
  let scrollable = false;

  function update() {
    frame = 0;
    if (!container.isConnected) return;

    const needs = container.scrollHeight > container.clientHeight + 1;
    if (!needs) {
      // 面板不滚动 → 之前被标记的内容要恢复。
      if (hidden.size) {
        for (const el of hidden) el.classList.remove('is-clipped-out');
        hidden.clear();
      }
      scrollable = false;
      return;
    }
    scrollable = true;

    const box = container.getBoundingClientRect();
    const top = box.top;
    const bottom = box.bottom;

    const outside = new Set();
    for (const el of container.querySelectorAll('*')) {
      if (!hasOwnText(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.bottom <= top + 1 || r.top >= bottom - 1) outside.add(el);
    }

    for (const el of outside) {
      if (!hidden.has(el)) {
        el.classList.add('is-clipped-out');
        hidden.add(el);
      }
    }
    for (const el of [...hidden]) {
      if (!outside.has(el)) {
        el.classList.remove('is-clipped-out');
        hidden.delete(el);
      }
    }
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  container.addEventListener('scroll', schedule, { passive: true });

  const ro = new ResizeObserver(schedule);
  ro.observe(container);

  const mo = new MutationObserver(schedule);
  mo.observe(container, { childList: true, subtree: true, characterData: true });

  window.addEventListener('resize', schedule);

  update();

  return () => {
    container.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    ro.disconnect();
    mo.disconnect();
    if (frame) cancelAnimationFrame(frame);
    for (const el of hidden) el.classList.remove('is-clipped-out');
    hidden.clear();
  };
}
