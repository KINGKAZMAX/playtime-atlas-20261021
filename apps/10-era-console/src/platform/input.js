/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 统一输入层：键盘 + 触控（虚拟按键）
 *
 * 设计：动作抽象层（left / right / jump / restart / back），
 * 键盘与触控写入同一份状态，游戏逻辑不区分来源。
 */

const KEY_MAP = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ArrowUp: 'jump',
  KeyW: 'jump',
  Space: 'jump',
  KeyZ: 'jump',
  KeyR: 'restart',
  Escape: 'back',
  Enter: 'confirm',
};

const SWALLOW = new Set([
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD',
]);

export class Input {
  /**
   * @param {Document|HTMLElement} root 触控按钮所在容器
   */
  constructor(root = document) {
    this.enabled = true;
    this._down = new Set();       // 当前按住的动作
    this._just = new Set();       // 本帧刚按下
    this._justUp = new Set();
    this._keyDown = new Set();    // 物理按键状态
    this._touchDown = new Set();  // 触控按住的动作
    this._touchJust = new Set();

    this._onKeyDown = (e) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      if (SWALLOW.has(e.code)) e.preventDefault();
      if (e.repeat) return;
      this._keyDown.add(e.code);
      if (!this._down.has(action)) this._just.add(action);
      this._down.add(action);
    };
    this._onKeyUp = (e) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      this._keyDown.delete(e.code);
      // 同一动作可能由多个物理键绑定，全部松开后才算抬起
      const stillHeld = Object.keys(KEY_MAP).some(
        (code) => KEY_MAP[code] === action && this._keyDown.has(code)
      );
      if (!stillHeld && !this._touchDown.has(action)) {
        this._down.delete(action);
        this._justUp.add(action);
      }
    };
    this._onBlur = () => {
      this._keyDown.clear();
      this._touchDown.clear();
      this._down.clear();
    };

    window.addEventListener('keydown', this._onKeyDown, { passive: false });
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onBlur);

    this._bindTouchButtons(root);
  }

  /** 绑定 DOM 上的触控虚拟按键 */
  _bindTouchButtons(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    const buttons = root.querySelectorAll('[data-btn]');
    buttons.forEach((el) => {
      const action = el.getAttribute('data-btn');
      const down = (e) => {
        e.preventDefault();
        if (!this.enabled) return;
        el.classList.add('is-active');
        if (!this._down.has(action)) this._just.add(action);
        this._touchDown.add(action);
        this._down.add(action);
        if (el.setPointerCapture && e.pointerId !== undefined) {
          try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        }
      };
      const up = (e) => {
        e.preventDefault();
        el.classList.remove('is-active');
        this._touchDown.delete(action);
        const stillKey = Object.keys(KEY_MAP).some(
          (code) => KEY_MAP[code] === action && this._keyDown.has(code)
        );
        if (!stillKey) {
          this._down.delete(action);
          this._justUp.add(action);
        }
      };
      el.addEventListener('pointerdown', down, { passive: false });
      el.addEventListener('pointerup', up, { passive: false });
      el.addEventListener('pointercancel', up, { passive: false });
      el.addEventListener('pointerleave', up, { passive: false });
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }

  isDown(action) {
    return this.enabled && this._down.has(action);
  }

  justPressed(action) {
    return this.enabled && this._just.has(action);
  }

  justReleased(action) {
    return this._justUp.has(action);
  }

  /** 每帧末尾清理边沿状态 */
  endFrame() {
    this._just.clear();
    this._justUp.clear();
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onBlur);
  }
}
