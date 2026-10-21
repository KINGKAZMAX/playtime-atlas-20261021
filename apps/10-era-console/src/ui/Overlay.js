/**
 * 10-era-console — 通用覆盖层（标题 / 结算 / 暂停 / 展品面板）
 * 使用 DOM 而非 canvas，保证中文文案锐利、可访问、可被 iframe 正常交互。
 */

export class Overlay {
  constructor(root) {
    this.root = root;
    this.root.classList.add('overlay');
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.root.hidden = true;
    this._dismissible = true;
    this._onKey = (e) => {
      if (this.root.hidden || e.key !== 'Escape') return;
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

    const actionHtml = actions
      .map(
        (a) =>
          `<button class="ov-action${a.primary ? ' is-primary' : ''}" data-action="${a.id}" type="button">${a.label}</button>`
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
  }

  get visible() {
    return !this.root.hidden;
  }
}
