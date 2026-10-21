/**
 * 霓虹街廊 · 街机可玩展厅
 * src/ui/panels.js — DOM 覆盖层面板（多语言 + 设计系统组件）
 *
 * 画布只承载像素美术与拉丁字符 HUD；所有中文/英文文案、来源链接与按钮
 * 都在 DOM 层排版，因此天然支持键盘聚焦、屏幕阅读器与移动端缩放。
 *
 * 无障碍（DESIGN-SPEC §8.5 / §11.2）：
 *  role="dialog" + aria-modal + Esc 关闭 + 焦点陷阱 + 关闭后焦点归还。
 */

import { TIMELINE, ORIGINALITY_NOTE, ORIGINALITY_NOTE_EN, EXHIBITS } from '../hall/exhibits.js';
import { loadScores } from '../core/storage.js';
import { DIFFICULTY } from '../core/palette.js';
import { getLang, pick, t } from '../i18n/strings.js';

function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html != null) node.innerHTML = html;
  return node;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** 展品在当前语言下的展示字段 */
function exhibitText(ex) {
  const en = getLang() === 'en';
  return {
    name: en ? ex.en : ex.cn,
    brief: en ? ex.briefEn : ex.brief,
    rules: en ? ex.rulesEn : ex.rules,
    controls: en ? ex.controlsEn : ex.controls,
  };
}

export function createPanels(shell, overlayEl) {
  let current = null;
  let lastFocus = null;

  function close() {
    if (!current) return;
    current = null;
    overlayEl.innerHTML = '';
    overlayEl.hidden = true;
    overlayEl.classList.remove('is-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
    shell.onPanelClosed();
  }

  /** 焦点陷阱：Tab / Shift+Tab 在面板内循环 */
  function trapFocus(e) {
    if (e.key !== 'Tab' || !current) return;
    const focusables = current.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function render(spec) {
    current = spec;
    lastFocus = document.activeElement;
    overlayEl.innerHTML = '';

    const card = el('div', `panel panel--${spec.id || 'default'}`);
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', spec.title || t('panelDefaultLabel'));

    const head = el('div', 'panel__head');
    head.appendChild(el('h2', 'panel__title', esc(spec.title || '')));
    if (spec.subtitle) head.appendChild(el('p', 'panel__subtitle', esc(spec.subtitle)));
    card.appendChild(head);

    if (spec.bodyHtml) {
      const body = el('div', 'panel__body');
      body.innerHTML = spec.bodyHtml;
      card.appendChild(body);
    }

    if (spec.actions && spec.actions.length) {
      const foot = el('div', 'panel__foot');
      for (const act of spec.actions) {
        const kind = act.kind === 'primary' ? 'ds-btn--primary' : 'ds-btn--secondary';
        const btn = el('button', `ds-btn ${kind}`, esc(act.label));
        btn.type = 'button';
        btn.addEventListener('click', () => {
          if (act.onClick) act.onClick();
          if (act.keepOpen !== true) close();
        });
        foot.appendChild(btn);
      }
      card.appendChild(foot);
    }

    overlayEl.appendChild(card);
    overlayEl.hidden = false;
    overlayEl.classList.add('is-open');

    const first = card.querySelector('button, a[href]');
    if (first) first.focus({ preventScroll: true });
  }

  /* --------------------------- 各类面板内容 --------------------------- */

  function chronicleHtml() {
    const en = getLang() === 'en';
    const items = TIMELINE.map((item) => {
      const title = en ? item.en : item.cn;
      const body = en ? item.bodyEn : item.body;
      return `
      <article class="tl">
        <div class="tl__year">${esc(item.year)}</div>
        <div class="tl__main">
          <h3>${esc(title)}</h3>
          <p>${esc(body)}</p>
          <a class="tl__src" href="${esc(item.source.url)}" target="_blank" rel="noopener noreferrer">
            ${esc(t('sourcePrefix'))}${esc(item.source.label)} ↗
          </a>
        </div>
      </article>
    `;
    }).join('');
    const note = en ? ORIGINALITY_NOTE_EN : ORIGINALITY_NOTE;
    return `
      <p class="note">${esc(note)}</p>
      <div class="timeline">${items}</div>
    `;
  }

  function ledgerHtml() {
    const en = getLang() === 'en';
    const block = (gameId, cn, name) => {
      const list = loadScores(gameId);
      const rows = list.length
        ? list.map((s, i) => `<li><span class="rk">${i + 1}</span><span class="sc">${s.score.toLocaleString('en-US')}</span></li>`).join('')
        : `<li class="empty">${esc(t('ledgerEmpty'))}</li>`;
      return `
        <section class="ledger__game">
          <h3>${esc(en ? name : cn)} <span>${esc(en ? cn : name)}</span></h3>
          <ol class="ledger__list">${rows}</ol>
        </section>
      `;
    };
    return `
      <p class="note">${esc(t('ledgerNote'))}</p>
      <div class="ledger">
        ${block('lattice', '晶格回廊', 'LATTICE CORRIDOR')}
        ${block('meteor', '陨星纵队', 'METEOR COLUMN')}
      </div>
    `;
  }

  function rulesHtml(exhibit) {
    const en = getLang() === 'en';
    const text = exhibitText(exhibit);
    const list = text.rules.map((r) => `<li>${esc(r)}</li>`).join('');
    return `
      <p class="lede">${esc(text.brief)}</p>
      ${text.rules.length ? `<ul class="rules">${list}</ul>` : ''}
      <p class="keys"><strong>${esc(t('controlsLabel'))}</strong>：${esc(text.controls)}</p>
    `;
  }

  function settingsHtml(settings) {
    const en = getLang() === 'en';
    const diff = DIFFICULTY[settings.difficulty];
    const desc = en ? diff.descEn : diff.desc;
    return `
      <ul class="settings">
        <li>
          <span>${esc(t('settingCrt'))}</span>
          <button type="button" class="toggle" data-toggle="crt" aria-pressed="${settings.crt}">
            <span>${settings.crt ? esc(t('on')) : esc(t('off'))}</span>
          </button>
        </li>
        <li>
          <span>${esc(t('settingSound'))}</span>
          <button type="button" class="toggle" data-toggle="sound" aria-pressed="${!settings.muted}">
            <span>${settings.muted ? esc(t('off')) : esc(t('on'))}</span>
          </button>
        </li>
        <li>
          <span>${esc(t('settingDemo'))}</span>
          <button type="button" class="toggle" data-toggle="demo" aria-pressed="${settings.demo}">
            <span>${settings.demo ? esc(t('on')) : esc(t('off'))}</span>
          </button>
        </li>
        <li>
          <span>${esc(t('settingDifficulty'))}</span>
          <span class="seg" role="group" aria-label="${esc(t('settingDifficultyLabel'))}">
            ${DIFFICULTY.map((d, i) => `
              <button type="button" class="seg__btn${i === settings.difficulty ? ' is-on' : ''}" data-diff="${i}">
                ${esc(en ? d.en : d.label)}
              </button>
            `).join('')}
          </span>
        </li>
      </ul>
      <p class="note">${esc(t('currentDifficulty'))}${esc(en ? diff.en : diff.label)} —— ${esc(desc)}</p>
    `;
  }

  /* --------------------------- 对外方法 --------------------------- */

  const api = {
    isOpen() {
      return !!current;
    },
    close,
    showPause(context) {
      render({
        id: 'pause',
        title: t('panelPauseTitle'),
        subtitle: context || t('panelPauseSub'),
        bodyHtml: `
          <ul class="keys-list">
            <li>${t('keyMove')}</li>
            <li>${t('keyAction')}</li>
            <li>${t('keySkill')}</li>
            <li>${t('keySlots')}</li>
            <li>${t('keySystem')}</li>
          </ul>
        `,
        actions: [
          { label: t('actionResume'), kind: 'primary', onClick: () => shell.resume() },
          { label: t('actionRestart'), onClick: () => shell.restart() },
          { label: t('actionSettings'), onClick: () => api.showSettings() },
          { label: t('actionBackHall'), onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showHelp(context) {
      const exhibit = EXHIBITS.find((e) => e.id === context);
      const text = exhibit ? exhibitText(exhibit) : null;
      render({
        id: 'help',
        title: exhibit ? `${text.name} · ${t('panelRulesTitle')}` : t('panelHelpTitle'),
        subtitle: exhibit ? exhibit.en : 'CONTROLS',
        bodyHtml: exhibit
          ? rulesHtml(exhibit)
          : `<ul class="keys-list">
              <li>${t('keyMove')}</li>
              <li>${t('keyAction')} · ${t('keySkill')}</li>
              <li>${t('keySlots')}</li>
              <li>${t('keyBurst')}</li>
              <li>${t('keySystemShort')}</li>
            </ul>`,
        actions: [
          { label: t('actionBack'), kind: 'primary', onClick: () => shell.resume() },
        ],
      });
    },
    showGameOver(data) {
      const rows = data.scores && data.scores.length
        ? data.scores.map((s, i) => `<li><span class="rk">${i + 1}</span><span class="sc">${s.score.toLocaleString('en-US')}</span></li>`).join('')
        : `<li class="empty">${esc(t('ledgerNone'))}</li>`;
      render({
        id: 'gameover',
        title: `${getLang() === 'en' ? (data.titleEn || data.title) : data.title} · ${t('panelGameOverSuffix')}`,
        subtitle: (getLang() === 'en' ? (data.detailEn || data.detail) : data.detail) || 'GAME OVER',
        bodyHtml: `
          <div class="final">
            <span class="final__label">${esc(t('finalScoreLabel'))}</span>
            <span class="final__score">${(data.score || 0).toLocaleString('en-US')}</span>
          </div>
          <ol class="ledger__list ledger__list--inline">${rows}</ol>
        `,
        actions: [
          { label: t('actionAgain'), kind: 'primary', onClick: () => shell.restart() },
          { label: t('actionBackHall'), onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showChronicle() {
      render({
        id: 'chronicle',
        title: t('panelChronicleTitle'),
        subtitle: t('panelChronicleSub'),
        bodyHtml: chronicleHtml(),
        actions: [
          { label: t('actionBackHall'), kind: 'primary', onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showLedger() {
      render({
        id: 'ledger',
        title: t('panelLedgerTitle'),
        subtitle: t('panelLedgerSub'),
        bodyHtml: ledgerHtml(),
        actions: [
          { label: t('actionBackHall'), kind: 'primary', onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showSettings() {
      render({
        id: 'settings',
        title: t('panelSettingsTitle'),
        subtitle: 'SETTINGS',
        bodyHtml: settingsHtml(shell.settings),
        actions: [
          { label: t('actionDone'), kind: 'primary', onClick: () => shell.resume() },
        ],
      });
      // 绑定面板内控件
      overlayEl.querySelectorAll('[data-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.toggle;
          if (key === 'crt') shell.setCrt(!shell.settings.crt);
          if (key === 'sound') shell.setMuted(!shell.settings.muted);
          if (key === 'demo') shell.setDemo(!shell.settings.demo);
          const pressed = key === 'crt' ? shell.settings.crt
            : key === 'demo' ? shell.settings.demo
            : !shell.settings.muted;
          btn.setAttribute('aria-pressed', String(pressed));
          btn.querySelector('span').textContent = pressed ? t('on') : t('off');
        });
      });
      overlayEl.querySelectorAll('[data-diff]').forEach((btn) => {
        btn.addEventListener('click', () => {
          shell.setDifficulty(Number(btn.dataset.diff));
          overlayEl.querySelectorAll('[data-diff]').forEach((b) => b.classList.remove('is-on'));
          btn.classList.add('is-on');
        });
      });
    },
    showRules(exhibitId) {
      const exhibit = EXHIBITS.find((e) => e.id === exhibitId);
      if (!exhibit) return;
      const text = exhibitText(exhibit);
      render({
        id: 'rules',
        title: `${text.name} · ${t('panelRulesTitle')}`,
        subtitle: exhibit.en,
        bodyHtml: rulesHtml(exhibit),
        actions: [
          { label: t('actionPlay'), kind: 'primary', onClick: () => shell.goTo(exhibit.id) },
          { label: t('actionBackHall'), onClick: () => shell.goTo('hall') },
        ],
      });
    },
  };

  overlayEl.addEventListener('keydown', trapFocus);
  return api;
}
