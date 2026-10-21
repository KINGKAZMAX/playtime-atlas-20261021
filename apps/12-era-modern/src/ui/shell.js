import { el, clear, trapFocus } from '../core/dom.js';
import { getSettings, setSetting, resetSettings } from '../core/settings.js';
import { resetProgress } from '../core/progress.js';
import { t } from '../core/i18n/index.js';
import { toast } from './toast.js';
import { navigate, onRouteChange, getCurrentPath } from './router.js';

/**
 * 导航项。文案走 i18n 骨架（见 `src/core/i18n/`）；当前默认中文，
 * 切换语言后由 `navItems()` 重新解析。
 */
export const NAV_ITEMS = [
  { path: '/', labelKey: 'nav.hall', titleKey: 'title.hall' },
  { path: '/pulse', labelKey: 'nav.pulse', titleKey: 'title.pulse' },
  { path: '/atrium', labelKey: 'nav.atrium', titleKey: 'title.atrium' },
  { path: '/halo', labelKey: 'nav.halo', titleKey: 'title.halo' },
];

/** 按当前语言解析导航文案。 */
function navItems() {
  return NAV_ITEMS.map((item) => ({
    path: item.path,
    label: t(item.labelKey),
    title: t(item.titleKey),
  }));
}

const BRAND_MARK = `
<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
  <defs>
    <linearGradient id="pe-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#B4432B"/>
      <stop offset="52%" stop-color="#2E6A5E"/>
      <stop offset="100%" stop-color="#2C5C8F"/>
    </linearGradient>
  </defs>
  <polygon points="16,3 29,26 3,26" fill="none" stroke="url(#pe-g)" stroke-width="1.7"/>
  <polygon points="16,3 16,26 3,26" fill="rgba(46,106,94,0.14)" stroke="rgba(46,106,94,0.55)" stroke-width="0.9"/>
  <polygon points="16,3 29,26 16,26" fill="rgba(180,67,43,0.12)" stroke="rgba(180,67,43,0.5)" stroke-width="0.9"/>
  <circle cx="16" cy="3" r="1.6" fill="#B4432B"/>
</svg>`;

function buildHeader() {
  const header = document.getElementById('site-header');
  clear(header);

  const nav = el('nav.site-nav.ds-topbar__nav', { 'aria-label': t('nav.aria') });
  for (const item of navItems()) {
    nav.appendChild(
      el('a.ds-topbar__link', { href: `#${item.path}`, 'data-nav': item.path }, item.label),
    );
  }

  const settingsBtn = el(
    'button.btn.btn-sm.btn-ghost.ds-btn.ds-btn--ghost.ds-btn--sm',
    { type: 'button', 'aria-haspopup': 'dialog', id: 'open-settings' },
    t('settings.open'),
  );
  settingsBtn.addEventListener('click', openSettings);

  header.appendChild(
    el(
      'a.brand.ds-topbar__brand',
      { href: '#/', 'aria-label': t('brand.aria') },
      el('span', { html: BRAND_MARK }),
      el(
        'span.brand-text',
        {},
        el('span.brand-cn', {}, t('brand.cn')),
        el('span.brand-en', {}, t('brand.en')),
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
      'div.footer-inner.ds-footer__row',
      {},
      el(
        'div.footer-note',
        {},
        el('p', {}, t('footer.note.1')),
        el('p', {}, t('footer.note.2')),
        el('p', {}, t('footer.note.3')),
      ),
      el(
        'div.footer-links.ds-footer__links',
        {},
        el('a', { href: '#/' }, t('nav.hall')),
        el('a', { href: '#/pulse' }, t('nav.pulse')),
        el('a', { href: '#/atrium' }, t('nav.atrium')),
        el('a', { href: '#/halo' }, t('nav.halo')),
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
    toast(`${label}：${t(next ? 'settings.switch.on' : 'settings.switch.off')}`);
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
  const offsetInput = el('input.slider.ds-input', {
    type: 'range',
    min: '-200',
    max: '200',
    step: '5',
    value: String(settings.offsetMs),
    'aria-label': t('settings.offset.aria'),
  });
  offsetInput.addEventListener('input', () => {
    const v = Number(offsetInput.value);
    offsetValue.textContent = `${v > 0 ? '+' : ''}${v} ms`;
    setSetting('offsetMs', v);
  });

  const clearBtn = el('button.btn.btn-sm.ds-btn.ds-btn--sm', { type: 'button' }, t('settings.action.clear'));
  clearBtn.addEventListener('click', () => {
    resetProgress();
    resetSettings();
    toast(t('settings.toast.cleared'), 'warn');
    close();
  });

  const resetBtn = el(
    'button.btn.btn-sm.btn-ghost.ds-btn.ds-btn--ghost.ds-btn--sm',
    { type: 'button' },
    t('settings.action.reset'),
  );
  resetBtn.addEventListener('click', () => {
    resetSettings();
    close();
    toast(t('settings.toast.reset'));
  });

  const panel = el(
    'div.modal',
    { role: 'dialog', 'aria-modal': 'true', 'aria-label': t('settings.title') },
    el('h2.ds-h3', { style: { fontSize: '1.3rem' } }, t('settings.title')),
    el('p.muted.ds-sm', { style: { fontSize: '0.86rem' } }, t('settings.desc')),
    switchRow(t('settings.switch.muted.label'), t('settings.switch.muted.hint'), 'muted'),
    switchRow(
      t('settings.switch.visualPulse.label'),
      t('settings.switch.visualPulse.hint'),
      'visualPulse',
    ),
    switchRow(t('settings.switch.reducedMotion.label'), t('settings.switch.reducedMotion.hint'), 'reducedMotion'),
    switchRow(t('settings.switch.highContrast.label'), t('settings.switch.highContrast.hint'), 'highContrast'),
    el(
      'div.switch-row',
      {},
      el(
        'span.switch-label',
        {},
        el('b', {}, t('settings.offset.label')),
        el('span', {}, t('settings.offset.hint')),
      ),
      el(
        'span.ds-field',
        { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
        offsetInput,
        offsetValue,
      ),
    ),
    el(
      'div',
      { style: { display: 'flex', gap: '10px', marginTop: '22px', flexWrap: 'wrap' } },
      clearBtn,
      resetBtn,
      el(
        'button.btn.btn-sm.btn-primary.ds-btn.ds-btn--primary.ds-btn--sm',
        { type: 'button', onclick: close },
        t('settings.action.done'),
      ),
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
    const item = navItems().find((n) => n.path === path);
    document.title = item ? item.title : t('title.default');
    for (const link of document.querySelectorAll('[data-nav]')) {
      const active = link.getAttribute('data-nav') === path;
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  });
  if (!window.location.hash) navigate(getCurrentPath() === '/' ? '/' : '/');
}
