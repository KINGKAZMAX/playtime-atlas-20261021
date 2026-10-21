/**
 * 键盘焦点门控 —— 本展厅的关键约束：「键盘只在聚焦时生效」。
 *
 * 为什么需要：
 *  两款游戏会被 06-museum-core 以 <iframe> 嵌进博物馆主站。若游戏无条件监听
 *  document 级 keydown，玩家在主站其他区域按方向键时，iframe 里的游戏会跟着动，
 *  浏览器还会滚动页面 —— 这是嵌入式小游戏的经典事故。
 *
 * 判定采用**双保险**：
 *  1. 监听器只挂在游戏根容器上，不挂在 document / window 上。
 *     keydown 只会在「焦点位于该容器或其子树」时冒泡到容器，天然隔离父页面。
 *  2. 事件到达时再核验一次**真实焦点位置**（document.activeElement），
 *     不轻信缓存的 focused 标志 —— 标志可能因元素失焦、文档切换等原因变旧。
 *     只要 activeElement 是 BODY 或落在容器之外，键盘一律不驱动游戏。
 */

/** 全局唯一的「当前持有键盘的游戏」实例。 */
let activeScope = null;

/**
 * 焦点是否真的落在给定容器内。
 * 以 document.activeElement 为准 —— 它是唯一权威的焦点事实来源。
 */
export function hasFocusWithin(root) {
  if (!root) return false;
  const ae = document.activeElement;
  if (!ae || ae === document.body || ae === document.documentElement) return false;
  return ae === root || root.contains(ae);
}

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
    // 文档级焦点同步：focusin / focusout 会冒泡，用于捕捉「焦点被移出容器但标志未更新」
    this._onDocFocusIn = (e) => {
      const t = e.target;
      if (t && (t === root || root.contains(t))) this.setFocused(true);
    };
    this._onDocFocusOut = (e) => {
      const rt = e.relatedTarget;
      if (rt && (rt === root || root.contains(rt))) return; // 仍在容器内
      if (this.focused) this.setFocused(false);
    };
    this._onKeyDown = (e) => this._handleKey(e, true);
    this._onKeyUp = (e) => this._handleKey(e, false);
    this._onWindowBlur = () => {
      this.setFocused(false);
      this.root.dispatchEvent(new CustomEvent('gameblur'));
    };

    root.addEventListener('focusin', this._onFocusIn);
    root.addEventListener('focusout', this._onFocusOut);
    document.addEventListener('focusin', this._onDocFocusIn);
    document.addEventListener('focusout', this._onDocFocusOut);
    root.addEventListener('keydown', this._onKeyDown);
    root.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('blur', this._onWindowBlur);
  }

  /**
   * 真实焦点状态：缓存标志 **且** document.activeElement 确实落在容器内。
   * 两者都满足才算获得焦点。
   */
  isFocused() {
    if (!this.focused) return false;
    return hasFocusWithin(this.root);
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
    if (!this.isFocused()) {
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
    document.removeEventListener('focusin', this._onDocFocusIn);
    document.removeEventListener('focusout', this._onDocFocusOut);
    this.root.removeEventListener('keydown', this._onKeyDown);
    this.root.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('blur', this._onWindowBlur);
    if (activeScope === this) activeScope = null;
  }
}

/** 当前是否允许键盘驱动游戏（用于 HUD 提示）。 */
export function isKeyboardLive() {
  return activeScope !== null && activeScope.isFocused();
}
