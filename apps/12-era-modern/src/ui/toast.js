import { el } from '../core/dom.js';

const HOST_ID = 'toast-root';

/**
 * 轻量提示条。用于撤销 / 提示 / 存档写入等即时反馈。
 */
export function toast(message, kind = 'info', duration = 2600) {
  const host = document.getElementById(HOST_ID);
  if (!host) return;
  const node = el('div.toast', { class: kind, role: 'status' }, message);
  host.appendChild(node);
  window.setTimeout(() => {
    node.style.transition = 'opacity 240ms ease, transform 240ms ease';
    node.style.opacity = '0';
    node.style.transform = 'translateY(8px)';
    window.setTimeout(() => node.remove(), 260);
  }, duration);
  return node;
}
