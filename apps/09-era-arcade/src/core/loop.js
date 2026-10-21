/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/loop.js — 固定步长主循环（含 rAF 节流兜底）
 *
 * 逻辑更新按固定 1/60 秒推进（保证不同刷新率下手感与数值一致），
 * 渲染每帧执行一次。切后台时不累计巨量时间，避免回来后瞬移。
 *
 * 兜底策略：某些嵌入环境（后台标签页、不可见 iframe、被浏览器节流的
 * 合成层）会暂停 requestAnimationFrame。此时改由定时器接管推进，
 * 保证游戏不会「卡死在第一帧」——这对把本作以 iframe 嵌入博物馆主站
 * 是必要条件。
 */

const FALLBACK_AFTER = 400;   // 超过此时长没有 rAF 帧则由定时器接管
const FALLBACK_INTERVAL = 60;

export function createLoop({ update, render, step = 1 / 60, maxSteps = 5 }) {
  let rafId = 0;
  let timerId = 0;
  let last = 0;
  let lastFrameAt = 0;
  let acc = 0;
  let running = false;
  let paused = false;

  /** 推进逻辑（固定步长） */
  function advance(now) {
    const delta = Math.min(0.25, Math.max(0, (now - last) / 1000));
    last = now;
    if (paused) return;
    acc += delta;
    let steps = 0;
    while (acc >= step && steps < maxSteps) {
      update(step);
      acc -= step;
      steps += 1;
    }
    if (steps === maxSteps) acc = 0; // 追不上就丢弃，避免螺旋下坠
  }

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    lastFrameAt = now;
    advance(now);
    render();
  }

  /** rAF 停摆时的兜底心跳 */
  function fallbackTick() {
    if (!running) return;
    const now = performance.now();
    if (now - lastFrameAt < FALLBACK_AFTER) return; // rAF 正常，不介入
    advance(now);
    render();
  }

  return {
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      lastFrameAt = last;
      acc = 0;
      rafId = requestAnimationFrame(frame);
      timerId = window.setInterval(fallbackTick, FALLBACK_INTERVAL);
    },
    stop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) window.clearInterval(timerId);
      rafId = 0;
      timerId = 0;
    },
    setPaused(v) {
      paused = !!v;
      if (!paused) {
        last = performance.now();
        lastFrameAt = last;
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
