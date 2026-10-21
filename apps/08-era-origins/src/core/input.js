/**
 * 输入系统 —— 键盘（焦点作用域内）+ 指针 / 触屏。
 *
 * 键盘监听挂在「游戏根容器」上而不是 document：
 * 只有当该容器（或其子树）持有焦点时，keydown/keyup 才会冒泡到这里，
 * 因此「键盘只在聚焦时生效」由 DOM 天然保证，无需额外的全局拦截。
 */
export class InputState {
  /**
   * @param {import('./focus.js').FocusScope} scope
   * @param {{ codes?: string[] }} [opts] codes: 本游戏会消费的按键（用于阻止默认滚动行为）
   */
  constructor(scope, opts = {}) {
    this.scope = scope;
    this.codes = new Set(opts.codes ?? []);
    this.down = new Set();
    this.justPressed = new Set();
    this.justReleased = new Set();
    this.pointers = new Map();
    this.pointerInside = false;

    this._onKeyDown = (e) => {
      if (!this.scope.focused) return;
      if (e.repeat) return;
      if (!this.down.has(e.code)) {
        this.down.add(e.code);
        this.justPressed.add(e.code);
      }
    };
    this._onKeyUp = (e) => {
      if (!this.down.has(e.code)) return;
      this.down.delete(e.code);
      this.justReleased.add(e.code);
    };
    this._onBlur = () => {
      this.down.clear();
    };
    // 焦点离开游戏作用域时清空按键，避免「回来时角色还在走」
    this._onFocusChange = (e) => {
      if (e.detail && e.detail.focused === false) this.down.clear();
    };

    const root = scope.root;
    root.addEventListener('keydown', this._onKeyDown);
    root.addEventListener('keyup', this._onKeyUp);
    root.addEventListener('gameblur', this._onBlur);
    root.addEventListener('gamefocuschange', this._onFocusChange);
    window.addEventListener('blur', this._onBlur);

    // 阻止方向键 / 空格滚动页面（仅在游戏聚焦时）
    scope.bindKeys((e) => this.codes.has(e.code));
  }

  isDown(code) {
    return this.down.has(code);
  }

  wasPressed(code) {
    return this.justPressed.has(code);
  }

  wasReleased(code) {
    return this.justReleased.has(code);
  }

  /** 每帧末调用，清空「本帧一次性事件」。 */
  endFrame() {
    this.justPressed.clear();
    this.justReleased.clear();
  }

  /** 指针 / 触屏：返回指针在画布逻辑坐标中的位置。 */
  bindCanvas(canvas, toLogical) {
    const update = (e) => {
      const rect = canvas.getBoundingClientRect();
      const p = toLogical(e.clientX - rect.left, e.clientY - rect.top, rect);
      this.pointers.set(e.pointerId, p);
    };
    const drop = (e) => {
      this.pointers.delete(e.pointerId);
    };

    canvas.addEventListener('pointerdown', (e) => {
      canvas.setPointerCapture?.(e.pointerId);
      update(e);
      this.pointerInside = true;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (this.pointers.has(e.pointerId) || e.pointerType === 'mouse') update(e);
    });
    canvas.addEventListener('pointerup', drop);
    canvas.addEventListener('pointercancel', drop);
    canvas.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') this.pointerInside = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** 第一个活跃指针（触屏用），没有则返回 null。 */
  primaryPointer() {
    for (const p of this.pointers.values()) return p;
    return null;
  }

  /** 按下状态下所有指针。 */
  activePointers() {
    return [...this.pointers.values()];
  }

  destroy() {
    const root = this.scope.root;
    root.removeEventListener('keydown', this._onKeyDown);
    root.removeEventListener('keyup', this._onKeyUp);
    root.removeEventListener('gameblur', this._onBlur);
    root.removeEventListener('gamefocuschange', this._onFocusChange);
    window.removeEventListener('blur', this._onBlur);
  }
}
