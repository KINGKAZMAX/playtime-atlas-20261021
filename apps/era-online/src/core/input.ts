/**
 * input.ts — 统一输入层：键盘 + 触屏虚拟键 + 指针。
 *
 * 设计目标（对应 TASK.md 验收 6、7）：两个展项都能**纯触屏**或**纯键盘**完成核心操作。
 * - 键盘：方向键 / WASD 走位，Z = A 键，X = B 键，Enter = Start，Esc = 暂停。
 * - 触屏：外壳十字键与 A/B 键通过 bindHold 绑定为同样的逻辑动作。
 * - 指针：画布点击由各展项自行处理（需要格子级拾取）。
 */

export type Action = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

const KEY_MAP: Record<string, Action> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  KeyZ: 'a',
  KeyX: 'b',
  Space: 'a',
  Enter: 'start',
  ShiftLeft: 'select',
  ShiftRight: 'select',
};

export class Input {
  private held = new Set<Action>();
  private pressed = new Set<Action>();
  private keyHeld = new Set<Action>();
  private pointerHeld = new Set<Action>();
  private enabled = true;
  /** 键盘事件是否已被某个展项"吃掉"（避免两个展项同时响应）。 */
  private consumed = false;

  constructor(private target: EventTarget = window) {
    this.target.addEventListener('keydown', this.onKeyDown as EventListener);
    this.target.addEventListener('keyup', this.onKeyUp as EventListener);
    this.target.addEventListener('blur', this.onBlur);
  }

  destroy(): void {
    this.target.removeEventListener('keydown', this.onKeyDown as EventListener);
    this.target.removeEventListener('keyup', this.onKeyUp as EventListener);
    this.target.removeEventListener('blur', this.onBlur);
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    if (!v) {
      this.held.clear();
      this.keyHeld.clear();
      this.pointerHeld.clear();
    }
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return;
    const action = KEY_MAP[e.code];
    if (!action) return;
    // 避免方向键/空格滚动页面
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Enter') e.preventDefault();
    if (e.repeat) return;
    this.keyHeld.add(action);
    this.sync();
    this.consumed = true;
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = KEY_MAP[e.code];
    if (!action) return;
    this.keyHeld.delete(action);
    this.sync();
  };

  private onBlur = (): void => {
    this.keyHeld.clear();
    this.pointerHeld.clear();
    this.sync();
  };

  private sync(): void {
    this.held.clear();
    for (const a of this.keyHeld) this.held.add(a);
    for (const a of this.pointerHeld) this.held.add(a);
  }

  /** 把一个 DOM 元素绑成"按住"型虚拟键（十字键、A/B 键）。 */
  bindHold(node: HTMLElement, action: Action): void {
    const down = (e: Event): void => {
      e.preventDefault();
      this.pointerHeld.add(action);
      this.sync();
      node.classList.add('is-pressed');
    };
    const up = (e: Event): void => {
      e.preventDefault();
      this.pointerHeld.delete(action);
      this.sync();
      node.classList.remove('is-pressed');
    };
    node.addEventListener('pointerdown', down);
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
    node.addEventListener('pointerleave', up);
    // 防止触屏长按弹出系统菜单
    node.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** 绑成"点按"型虚拟键（菜单项）。 */
  bindTap(node: HTMLElement, action: Action): void {
    const down = (e: Event): void => {
      e.preventDefault();
      this.pressed.add(action);
      this.pointerHeld.add(action);
      this.sync();
      node.classList.add('is-pressed');
    };
    const up = (e: Event): void => {
      e.preventDefault();
      this.pointerHeld.delete(action);
      this.sync();
      node.classList.remove('is-pressed');
    };
    node.addEventListener('pointerdown', down);
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
    node.addEventListener('pointerleave', up);
  }

  isDown(a: Action): boolean {
    return this.enabled && this.held.has(a);
  }

  wasPressed(a: Action): boolean {
    return this.enabled && this.pressed.has(a);
  }

  /** 每帧末尾调用，清理"本帧刚按下"集合。 */
  endFrame(): void {
    this.pressed.clear();
    this.consumed = false;
  }

  get keyConsumed(): boolean {
    return this.consumed;
  }
}

/** 指针在 canvas 内的像素坐标换算（考虑 devicePixelRatio 与 CSS 缩放）。 */
export function pointerToCanvas(
  e: PointerEvent,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  return {
    x: (e.clientX - r.left) * sx,
    y: (e.clientY - r.top) * sy,
  };
}
