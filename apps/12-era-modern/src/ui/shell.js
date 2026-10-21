import { el, clear, trapFocus } from '../core/dom.js';
import { getSettings, setSetting, resetSettings } from '../core/settings.js';
import { resetProgress } from '../core/progress.js';
import { toast } from './toast.js';
import { navigate, onRouteChange, getCurrentPath } from './router.js';

export const NAV_ITEMS = [
  { path: '/', label: '展厅', title: '折光纪 · 当代可玩展厅' },
  { path: '/pulse', label: '脉冲走廊', title: '脉冲走廊 · 节奏反应 | PRISM ERA' },
  { path: '/atrium', label: '折光阁', title: '折光阁 · 空间解谜 | PRISM ERA' },
  { path: '/halo', label: '光环台', title: '光环台 · 桌面观景台 | PRISM ERA' },
];

const BRAND_MARK = `
<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
  <defs>
    <linearGradient id="pe-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4FE3D0"/>
      <stop offset="52%" stop-color="#9D7BFF"/>
      <stop offset="100%" stop-color="#FF5FA2"/>
    </linearGradient>
  </defs>
  <polygon points="16,3 29,26 3,26" fill="none" stroke="url(#pe-g)" stroke-width="1.7"/>
  <polygon points="16,3 16,26 3,26" fill="rgba(79,227,208,0.14)" stroke="rgba(79,227,208,0.55)" stroke-width="0.9"/>
  <polygon points="16,3 29,26 16,26" fill="rgba(255,95,162,0.12)" stroke="rgba(255,95,162,0.5)" stroke-width="0.9"/>
  <circle cx="16" cy="3" r="1.6" fill="#FFC46B"/>
</svg>`;

function buildHeader() {
  const header = document.getElementById('site-header');
  clear(header);

  const nav = el('nav.site-nav', { 'aria-label': '展厅导航' });
  for (const item of NAV_ITEMS) {
    nav.appendChild(
      el('a', { href: `#${item.path}`, 'data-nav': item.path }, item.label),
    );
  }

  const settingsBtn = el(
    'button.btn.btn-sm.btn-ghost',
    { type: 'button', 'aria-haspopup': 'dialog', id: 'open-settings' },
    '设置',
  );
  settingsBtn.addEventListener('click', openSettings);

  header.appendChild(
    el(
      'a.brand',
      { href: '#/', 'aria-label': '返回折光纪展厅首页' },
      el('span', { html: BRAND_MARK }),
      el(
        'span.brand-text',
        {},
        el('span.brand-cn', {}, '折光纪'),
        el('span.brand-en', {}, 'PRISM ERA'),
      ),
    ),
  );
  header.appendChild(nav);
  header.appendChild(el('div.header-actions', {}, settingsBtn));

  return header;
}

function buildFooter() {
  const footer = document.getElementById('site-footer');
  clear(footer);
  footer.appendChild(
    el(
      'div.footer-inner',
      {},
      el(
        'div.footer-note',
        {},
        el('p', {}, '折光纪 · 当代可玩展厅 —— 回响电玩馆（PLYTIME ATLAS）现代时代分厅。'),
        el('p', {}, '本厅全部作品名、文案、音乐、视觉与关卡均为原创，仅参考公开作品的机制与品质标准；不含任何未授权 ROM、商业游戏资源或品牌视觉。'),
        el('p', {}, '《光环台》为桌面端交互演示，不支持 VR 头显。史料来源见展厅内各条目的链接。'),
      ),
      el(
        'div.footer-links',
        {},
        el('a', { href: '#/' }, '展厅'),
        el('a', { href: '#/pulse' }, '脉冲走廊'),
        el('a', { href: '#/atrium' }, '折光阁'),
        el('a', { href: '#/halo' }, '光环台'),
      ),
    ),
  );
}

function switchRow(label, hint, key) {
  const settings = getSettings();
  const btn = el('button.switch', {
    type: 'button',
    role: 'switch',
    'aria-pressed': String(Boolean(settings[key])),
    'aria-label': label,
  });
  btn.addEventListener('click', () => {
    const next = !(btn.getAttribute('aria-pressed') === 'true');
    btn.setAttribute('aria-pressed', String(next));
    setSetting(key, next);
    toast(`${label}：${next ? '已开启' : '已关闭'}`);
  });
  return el(
    'div.switch-row',
    {},
    el('span.switch-label', {}, el('b', {}, label), el('span', {}, hint)),
    btn,
  );
}

function openSettings() {
  const host = document.getElementById('modal-root');
  clear(host);

  const settings = getSettings();

  const offsetValue = el('span.mono', {}, `${settings.offsetMs > 0 ? '+' : ''}${settings.offsetMs} ms`);
  const offsetInput = el('input.slider', {
    type: 'range',
    min: '-200',
    max: '200',
    step: '5',
    value: String(settings.offsetMs),
    'aria-label': '判定校准偏移（毫秒）',
  });
  offsetInput.addEventListener('input', () => {
    const v = Number(offsetInput.value);
    offsetValue.textContent = `${v > 0 ? '+' : ''}${v} ms`;
    setSetting('offsetMs', v);
  });

  const clearBtn = el('button.btn.btn-sm', { type: 'button' }, '清除全部存档');
  clearBtn.addEventListener('click', () => {
    resetProgress();
    resetSettings();
    toast('存档与设置已清除', 'warn');
    close();
  });

  const resetBtn = el('button.btn.btn-sm.btn-ghost', { type: 'button' }, '恢复默认设置');
  resetBtn.addEventListener('click', () => {
    resetSettings();
    close();
    toast('设置已恢复默认');
  });

  const panel = el(
    'div.modal',
    { role: 'dialog', 'aria-modal': 'true', 'aria-label': '展厅设置' },
    el('h2', { style: { fontSize: '1.3rem' } }, '展厅设置'),
    el('p.muted', { style: { fontSize: '0.86rem' } }, '所有设置与成绩都保存在本机浏览器中，不上传任何数据。'),
    switchRow('静音', '关闭全部音频输出。游戏判定不受影响。', 'muted'),
    switchRow(
      '视觉节拍模式',
      '完全不使用音频：节拍改由收缩节拍环、轨道脉冲与拍点标尺表达。',
      'visualPulse',
    ),
    switchRow('减少动效', '以平滑过渡替代闪烁与位移动画。', 'reducedMotion'),
    switchRow('高对比', '提高前景与背景对比度。', 'highContrast'),
    el(
      'div.switch-row',
      {},
      el(
        'span.switch-label',
        {},
        el('b', {}, '判定校准'),
        el('span', {}, '若敲击感觉偏早或偏晚，可在此微调节奏判定窗口。'),
      ),
      el('span', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, offsetInput, offsetValue),
    ),
    el(
      'div',
      { style: { display: 'flex', gap: '10px', marginTop: '22px', flexWrap: 'wrap' } },
      clearBtn,
      resetBtn,
      el('button.btn.btn-sm.btn-primary', { type: 'button', onclick: close }, '完成'),
    ),
  );

  const backdrop = el('div.modal-backdrop', {}, panel);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close();
  });

  const onKey = (event) => {
    if (event.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKey);
  const releaseFocus = trapFocus(panel);

  function close() {
    document.removeEventListener('keydown', onKey);
    releaseFocus();
    clear(host);
  }

  host.appendChild(backdrop);
  panel.querySelector('button')?.focus();
}

export function buildShell() {
  buildHeader();
  buildFooter();
  onRouteChange((path) => {
    const item = NAV_ITEMS.find((n) => n.path === path);
    document.title = item ? item.title : '折光纪 · 当代可玩展厅 | PRISM ERA';
    for (const link of document.querySelectorAll('[data-nav]')) {
      const active = link.getAttribute('data-nav') === path;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  });
  if (!window.location.hash) navigate(getCurrentPath() === '/' ? '/' : '/');
}
