/**
 * loop.ts — 固定步长主循环。
 *
 * 所有展项共用同一套节拍：逻辑步长 1/60s，渲染跟随 requestAnimationFrame。
 * 支持暂停（paused 时完全不推进模拟）与倍速（speed）。
 * 标签页切到后台时自动挂起，避免回到前台出现"瞬移式"补帧。
 */

export interface LoopHooks {
  /** 固定步长的逻辑推进，dt 恒为 step。 */
  update(dt: number): void;
  /** 绘制，alpha 为自上一帧以来的真实时间（秒），可用于插值。 */
  render(alpha: number): void;
}

export class GameLoop {
  private hooks: LoopHooks;
  private step: number;
  private acc = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  private _paused = false;
  private _speed = 1;

  constructor(hooks: LoopHooks, step = 1 / 60) {
    this.hooks = hooks;
    this.step = step;
  }

  get paused(): boolean {
    return this._paused;
  }
  set paused(v: boolean) {
    this._paused = v;
    this.acc = 0;
    this.last = performance.now();
  }

  get speed(): number {
    return this._speed;
  }
  set speed(v: number) {
    this._speed = Math.max(0.25, Math.min(4, v));
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private onVisibility = (): void => {
    // 回到前台时重置时间基准，不做补帧
    this.last = performance.now();
    this.acc = 0;
  };

  private tick = (now: number): void => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);

    let frameTime = (now - this.last) / 1000;
    this.last = now;
    if (frameTime > 0.25) frameTime = 0.25; // 长卡顿钳制，防止螺旋下坠

    if (!this._paused) {
      this.acc += frameTime * this._speed;
      // 单帧最多推进 8 步，防止极端卡顿后一次性跑太多逻辑
      let steps = 0;
      while (this.acc >= this.step && steps < 8) {
        this.hooks.update(this.step);
        this.acc -= this.step;
        steps++;
      }
      if (steps >= 8) this.acc = 0;
    }

    this.hooks.render(this.acc / this.step);
  };
}
