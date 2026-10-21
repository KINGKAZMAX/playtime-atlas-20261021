/**
 * 固定步长主循环 —— 让物理与帧率解耦。
 *
 * 渲染用 requestAnimationFrame（可变帧率），物理用累加器以固定 dt 推进，
 * 单帧最多追赶 5 步，避免切后台回来后出现「死亡螺旋」。
 */
export class Loop {
  /**
   * @param {(dt:number)=>void} update 固定步长更新，dt 单位秒
   * @param {(alpha:number, dt:number)=>void} render 渲染，alpha 为插值系数
   * @param {number} [step] 固定步长，默认 1/120 秒
   * @param {number} [maxSteps] 单帧最多追赶的物理步数
   */
  constructor(update, render, step = 1 / 120, maxSteps = 10) {
    this.update = update;
    this.render = render;
    this.step = step;
    this.maxSteps = maxSteps;
    this.accumulator = 0;
    this.last = 0;
    this.rafId = 0;
    this.running = false;
    this._tick = this._tick.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  _tick(now) {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this._tick);
    let frameTime = (now - this.last) / 1000;
    this.last = now;
    if (!Number.isFinite(frameTime) || frameTime < 0) frameTime = 0;
    // 切后台回来时的一次巨大 delta 不应被当成真实时间
    if (frameTime > 0.25) frameTime = 0.25;

    this.accumulator += frameTime;
    let steps = 0;
    while (this.accumulator >= this.step && steps < this.maxSteps) {
      this.update(this.step);
      this.accumulator -= this.step;
      steps += 1;
    }
    if (steps >= this.maxSteps) this.accumulator = 0;

    const alpha = this.accumulator / this.step;
    this.render(alpha, frameTime);
  }
}

/** 通用工具函数集合。 */
export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** 把 value 从 [inMin,inMax] 线性映射到 [outMin,outMax]，并夹紧。 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * t;
}
