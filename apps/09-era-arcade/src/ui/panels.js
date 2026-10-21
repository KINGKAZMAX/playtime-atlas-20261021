/**
 * 霓虹街廊 · 街机可玩展厅
 * src/ui/panels.js — DOM 覆盖层面板
 *
 * 画布只承载像素美术与拉丁字符 HUD；所有中文文案、来源链接与按钮
 * 都在 DOM 层排版，因此天然支持键盘聚焦、屏幕阅读器与移动端缩放。
 */

import { TIMELINE, ORIGINALITY_NOTE, EXHIBITS } from '../hall/exhibits.js';
import { loadScores } from '../core/storage.js';
import { DIFFICULTY } from '../core/palette.js';

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

  function render(spec) {
    current = spec;
    lastFocus = document.activeElement;
    overlayEl.innerHTML = '';

    const card = el('div', `panel panel--${spec.id || 'default'}`);
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', spec.title || '面板');

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
        const btn = el('button', `btn ${act.kind ? `btn--${act.kind}` : ''}`, esc(act.label));
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

    const first = card.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }

  /* --------------------------- 各类面板内容 --------------------------- */

  function chronicleHtml() {
    const items = TIMELINE.map((t) => `
      <article class="tl">
        <div class="tl__year">${esc(t.year)}</div>
        <div class="tl__main">
          <h3>${esc(t.cn)}</h3>
          <p>${esc(t.body)}</p>
          <a class="tl__src" href="${esc(t.source.url)}" target="_blank" rel="noopener noreferrer">
            来源：${esc(t.source.label)} ↗
          </a>
        </div>
      </article>
    `).join('');
    return `
      <p class="note">${esc(ORIGINALITY_NOTE)}</p>
      <div class="timeline">${items}</div>
    `;
  }

  function ledgerHtml() {
    const block = (gameId, cn, en) => {
      const list = loadScores(gameId);
      const rows = list.length
        ? list.map((s, i) => `<li><span class="rk">${i + 1}</span><span class="sc">${s.score.toLocaleString('en-US')}</span></li>`).join('')
        : '<li class="empty">还没有记录，去打一局。</li>';
      return `
        <section class="ledger__game">
          <h3>${esc(cn)} <span>${esc(en)}</span></h3>
          <ol class="ledger__list">${rows}</ol>
        </section>
      `;
    };
    return `
      <p class="note">记录保存在你本机的浏览器里（localStorage），不会上传，刷新后仍在。</p>
      <div class="ledger">
        ${block('lattice', '晶格回廊', 'LATTICE CORRIDOR')}
        ${block('meteor', '陨星纵队', 'METEOR COLUMN')}
      </div>
    `;
  }

  function rulesHtml(exhibit) {
    const list = exhibit.rules.map((r) => `<li>${esc(r)}</li>`).join('');
    return `
      <p class="lede">${esc(exhibit.brief)}</p>
      <ul class="rules">${list}</ul>
      <p class="keys"><strong>操作</strong>：${esc(exhibit.controls)}</p>
    `;
  }

  function settingsHtml(settings) {
    const diff = DIFFICULTY[settings.difficulty]
      .label;
    return `
      <ul class="settings">
        <li>
          <span>CRT 显像管效果</span>
          <button type="button" class="toggle" data-toggle="crt" aria-pressed="${settings.crt}">
            <span>${settings.crt ? '开' : '关'}</span>
          </button>
        </li>
        <li>
          <span>音效与背景音乐</span>
          <button type="button" class="toggle" data-toggle="sound" aria-pressed="${!settings.muted}">
            <span>${settings.muted ? '关' : '开'}</span>
          </button>
        </li>
        <li>
          <span>演示模式（不结算伤害）</span>
          <button type="button" class="toggle" data-toggle="demo" aria-pressed="${settings.demo}">
            <span>${settings.demo ? '开' : '关'}</span>
          </button>
        </li>
        <li>
          <span>难度</span>
          <span class="seg" role="group" aria-label="难度">
            ${DIFFICULTY.map((d, i) => `
              <button type="button" class="seg__btn${i === settings.difficulty ? ' is-on' : ''}" data-diff="${i}">
                ${esc(d.label)}
              </button>
            `).join('')}
          </span>
        </li>
      </ul>
      <p class="note">当前难度：${esc(diff)} —— ${esc(DIFFICULTY[settings.difficulty].desc)}</p>
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
        title: '已暂停',
        subtitle: context || 'PAUSED',
        bodyHtml: `
          <ul class="keys-list">
            <li><kbd>方向键</kbd> / <kbd>WASD</kbd> 移动</li>
            <li><kbd>空格</kbd> 主操作</li>
            <li><kbd>E</kbd> 副操作</li>
            <li><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 切换</li>
            <li><kbd>P</kbd> 暂停 · <kbd>R</kbd> 重开 · <kbd>M</kbd> 静音 · <kbd>H</kbd> 帮助</li>
          </ul>
        `,
        actions: [
          { label: '继续', kind: 'primary', onClick: () => shell.resume() },
          { label: '重新开始', onClick: () => shell.restart() },
          { label: '设置', onClick: () => api.showSettings() },
          { label: '返回展厅', onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showHelp(context) {
      const exhibit = EXHIBITS.find((e) => e.id === context);
      render({
        id: 'help',
        title: exhibit ? `${exhibit.cn} · 玩法` : '操作说明',
        subtitle: exhibit ? exhibit.en : 'CONTROLS',
        bodyHtml: exhibit
          ? rulesHtml(exhibit)
          : `<ul class="keys-list">
              <li><kbd>方向键</kbd> / <kbd>WASD</kbd> 移动</li>
              <li><kbd>空格</kbd> 主操作 · <kbd>E</kbd> 副操作</li>
              <li><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 切换弹型</li>
              <li><kbd>F</kbd> 共振激爆</li>
              <li><kbd>P</kbd> 暂停 · <kbd>R</kbd> 重开 · <kbd>M</kbd> 静音</li>
            </ul>`,
        actions: [
          { label: '返回', kind: 'primary', onClick: () => (exhibit ? shell.resume() : shell.resume()) },
        ],
      });
    },
    showGameOver(data) {
      const rows = data.scores && data.scores.length
        ? data.scores.map((s, i) => `<li><span class="rk">${i + 1}</span><span class="sc">${s.score.toLocaleString('en-US')}</span></li>`).join('')
        : '<li class="empty">暂无记录</li>';
      render({
        id: 'gameover',
        title: `${data.title} · 结算`,
        subtitle: data.detail || 'GAME OVER',
        bodyHtml: `
          <div class="final">
            <span class="final__label">最终得分</span>
            <span class="final__score">${(data.score || 0).toLocaleString('en-US')}</span>
          </div>
          <ol class="ledger__list ledger__list--inline">${rows}</ol>
        `,
        actions: [
          { label: '再来一局', kind: 'primary', onClick: () => shell.restart() },
          { label: '返回展厅', onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showChronicle() {
      render({
        id: 'chronicle',
        title: '街机纪年',
        subtitle: 'CHRONICLE · 1970s—1990s',
        bodyHtml: chronicleHtml(),
        actions: [
          { label: '返回展厅', kind: 'primary', onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showLedger() {
      render({
        id: 'ledger',
        title: '荣誉榜',
        subtitle: 'LEDGER · LOCAL RECORDS',
        bodyHtml: ledgerHtml(),
        actions: [
          { label: '返回展厅', kind: 'primary', onClick: () => shell.goTo('hall') },
        ],
      });
    },
    showSettings() {
      render({
        id: 'settings',
        title: '设置',
        subtitle: 'SETTINGS',
        bodyHtml: settingsHtml(shell.settings),
        actions: [
          { label: '完成', kind: 'primary', onClick: () => shell.resume() },
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
          btn.querySelector('span').textContent = pressed ? '开' : '关';
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
      render({
        id: 'rules',
        title: `${exhibit.cn} · 玩法`,
        subtitle: exhibit.en,
        bodyHtml: rulesHtml(exhibit),
        actions: [
          { label: '开始游玩', kind: 'primary', onClick: () => shell.goTo(exhibit.id) },
          { label: '返回展厅', onClick: () => shell.goTo('hall') },
        ],
      });
    },
  };

  return api;
}
