/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/loop.js — 固定步长主循环
 *
 * 逻辑更新按固定 1/60 秒推进（保证不同刷新率下手感与数值一致），
 * 渲染每帧执行一次。切后台时不累计巨量时间，避免回来后瞬移。
 */

export function createLoop({ update, render, step = 1 / 60, maxSteps = 5 }) {
  let rafId = 0;
  let last = 0;
  let acc = 0;
  let running = false;
  let paused = false;

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);

    const delta = Math.min(0.25, (now - last) / 1000);
    last = now;

    if (!paused) {
      acc += delta;
      let steps = 0;
      while (acc >= step && steps < maxSteps) {
        update(step);
        acc -= step;
        steps += 1;
      }
      if (steps === maxSteps) acc = 0; // 追不上就丢弃，避免螺旋下坠
    }
    render(delta);
  }

  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      acc = 0;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    },
    setPaused(v) {
      paused = !!v;
      if (!paused) {
        last = performance.now();
        acc = 0;
      }
    },
    isPaused() {
      return paused;
    },
    isRunning() {
      return running;
    },
  };
}
