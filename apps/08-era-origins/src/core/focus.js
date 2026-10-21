/**
 * 键盘焦点门控 —— 本展厅的关键约束：「键盘只在聚焦时生效」。
 *
 * 为什么需要：
 *  两款游戏会被 06-museum-core 以 <iframe> 嵌进博物馆主站。若游戏无条件监听
 *  document 级 keydown，玩家在主站其他区域按方向键时，iframe 里的游戏会跟着动，
 *  浏览器还会滚动页面 —— 这是嵌入式小游戏的经典事故。
 *
 * 策略：
 *  1. 游戏根节点带 tabindex="0"，成为唯一的键盘「作用域」。
 *  2. 只有当 document.activeElement 落在该作用域内（或作用域本身）时，
 *     keydown / keyup 才会被转成游戏输入。
 *  3. 未聚焦时按下游戏键位 -> 阻止默认行为失效 -> 页面正常滚动 / 父页面正常响应。
 *  4. 失焦时清空所有按键状态，避免「切回来时角色还在走」。
 */

/** 全局唯一的「当前持有键盘的游戏」实例。 */
let activeScope = null;

export class FocusScope {
  /**
   * @param {HTMLElement} root 承载游戏的可聚焦容器
   * @param {{ onFocusChange?: (focused:boolean)=>void }} [opts]
   */
  constructor(root, opts = {}) {
    this.root = root;
    this.opts = opts;
    this.focused = false;
    this._bound = new Set();

    if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');
    root.setAttribute('role', 'application');
    root.setAttribute('aria-label', '可玩展品，键盘操作需先点击画面获得焦点');

    this._onFocusIn = () => this.setFocused(true);
    this._onFocusOut = (e) => {
      // focusout 在焦点仍留在子树内时不触发失焦
      if (e.relatedTarget && root.contains(e.relatedTarget)) return;
      this.setFocused(false);
    };
    this._onKeyDown = (e) => this._handleKey(e, true);
    this._onKeyUp = (e) => this._handleKey(e, false);
    this._onWindowBlur = () => {
      this.setFocused(false);
      this.root.dispatchEvent(new CustomEvent('gameblur'));
    };

    root.addEventListener('focusin', this._onFocusIn);
    root.addEventListener('focusout', this._onFocusOut);
    root.addEventListener('keydown', this._onKeyDown);
    root.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onWindowBlur);
  }

  setFocused(focused) {
    if (this.focused === focused) return;
    this.focused = focused;
    if (focused) {
      activeScope = this;
      this.root.classList.add('is-focused');
    } else {
      if (activeScope === this) activeScope = null;
      this.root.classList.remove('is-focused');
      this.root.dispatchEvent(new CustomEvent('gamefocuschange', { detail: { focused: false } }));
    }
    this.opts.onFocusChange?.(focused);
  }

  /** 主动获取焦点（点击画布 / 点击开始按钮时调用）。 */
  focus() {
    try {
      this.root.focus({ preventScroll: true });
    } catch {
      this.root.focus();
    }
  }

  /** 注册一个「被游戏吞掉的按键」谓词；返回 true 表示该键位应被 preventDefault。 */
  bindKeys(predicate) {
    this._bound.add(predicate);
  }

  _handleKey(e, isDown) {
    const consumes = this._bound.size > 0 && [...this._bound].some((p) => p(e, isDown));
    if (!consumes) return;

    // 焦点不在作用域内 -> 一律放行，让浏览器 / 父页面正常处理
    if (!this.focused) {
      if (isDown) {
        this.root.dispatchEvent(
          new CustomEvent('gamekeyrejected', { detail: { key: e.key, code: e.code } }),
        );
      }
      return;
    }
    // 焦点在内但事件来自外部（例如某些浏览器把 focus 留在 body）：同样放行
    const ae = document.activeElement;
    if (ae && ae !== document.body && !this.root.contains(ae) && ae !== this.root) return;

    e.preventDefault();
    e.stopPropagation();
  }

  destroy() {
    this.root.removeEventListener('focusin', this._onFocusIn);
    this.root.removeEventListener('focusout', this._onFocusOut);
    this.root.removeEventListener('keydown', this._onKeyDown);
    this.root.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onWindowBlur);
    if (activeScope === this) activeScope = null;
  }
}

/** 当前是否允许键盘驱动游戏（用于 HUD 提示）。 */
export function isKeyboardLive() {
  return activeScope !== null && activeScope.focused;
}
