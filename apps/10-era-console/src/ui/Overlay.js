/**
 * 10-era-console — 通用覆盖层（标题 / 结算 / 暂停 / 展品面板）
 * 使用 DOM 而非 canvas，保证中文文案锐利、可访问、可被 iframe 正常交互。
 *
 * 无障碍契约（MIGRATION-NOTES §5「弹层」）：
 *   role=dialog + aria-modal + Esc 关闭 + **焦点陷阱** + **焦点归还**。
 *   覆盖层锚定在画布框内（沉浸式作品的画布边界），故不套用整屏 .ds-lightbox，
 *   但遮罩、面板、按钮的视觉与交互按同一套 token 统一。
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class Overlay {
  constructor(root) {
    this.root = root;
    this.root.classList.add('overlay');
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.hidden = true;
    this._dismissible = true;
    this._lastFocus = null;
    this._onKey = (e) => {
      if (this.root.hidden) return;

      if (e.key === 'Tab') {
        this._trapTab(e);
        return;
      }

      if (e.key !== 'Escape') return;
      // 依次尝试：取消 → 关闭 → （可关闭时）直接隐藏
      const btn =
        this.root.querySelector('[data-action="cancel"]') ||
        this.root.querySelector('[data-action="close"]');
      if (btn) {
        btn.click();
      } else if (this._dismissible) {
        this.hide();
      } else {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('keydown', this._onKey, true);
  }

  /** 焦点陷阱：Tab / Shift+Tab 在弹层内循环，不逸出到背景内容。 */
  _trapTab(e) {
    const items = [...this.root.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !this.root.contains(active)) {
        last.focus();
        e.preventDefault();
      }
    } else if (active === last || !this.root.contains(active)) {
      first.focus();
      e.preventDefault();
    }
  }

  /**
   * @param {object} cfg
   *   title, subtitle, body(HTML 字符串), actions:[{id,label,primary,onClick}], dismissible
   */
  show(cfg = {}) {
    const {
      title = '',
      subtitle = '',
      body = '',
      actions = [],
      dismissible = false,
      tone = 'default',
    } = cfg;

    // 记录打开前的焦点，关闭后归还（MIGRATION-NOTES §5）
    this._lastFocus = document.activeElement;

    const actionHtml = actions
      .map(
        (a) =>
          `<button class="ov-action ds-btn ${a.primary ? 'ds-btn--primary is-primary' : 'ds-btn--secondary'}" data-action="${a.id}" type="button">${a.label}</button>`
      )
      .join('');

    this.root.innerHTML = `
      <div class="ov-card ov-tone-${tone}">
        ${title ? `<h2 class="ov-title">${title}</h2>` : ''}
        ${subtitle ? `<p class="ov-subtitle">${subtitle}</p>` : ''}
        ${body ? `<div class="ov-body">${body}</div>` : ''}
        ${actionHtml ? `<div class="ov-actions">${actionHtml}</div>` : ''}
      </div>
    `;
    this.root.hidden = false;
    this.root.classList.add('is-open');
    this._dismissible = dismissible;

    this.root.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = actions.find((a) => a.id === btn.getAttribute('data-action'));
        if (act && act.onClick) act.onClick();
      });
    });

    if (dismissible) {
      this.root.addEventListener('click', (e) => {
        if (e.target === this.root) this.hide();
      });
    }

    const first = this.root.querySelector('.ov-action.is-primary') || this.root.querySelector('.ov-action');
    if (first) first.focus({ preventScroll: true });
  }

  hide() {
    this.root.hidden = true;
    this.root.classList.remove('is-open');
    this.root.innerHTML = '';
    // 焦点归还给打开弹层前的元素
    const back = this._lastFocus;
    this._lastFocus = null;
    if (back && typeof back.focus === 'function' && back.isConnected) {
      try {
        back.focus({ preventScroll: true });
      } catch {
        /* 元素不可聚焦时忽略 */
      }
    }
  }

  get visible() {
    return !this.root.hidden;
  }
}
