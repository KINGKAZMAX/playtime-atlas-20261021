/**
 * shell.js — 页面外壳 / App shell
 * 左侧索引栏、居中标题、底部圆点、开场封面、提示条。
 */
import { t, tv, getLang } from '../core/i18n.js';

export class Shell {
  constructor(models, handlers = {}) {
    this.models = models;
    this.h = handlers;
    this.el = {
      brandMark: document.getElementById('brand-mark'),
      brandLatin: document.getElementById('brand-latin'),
      railLabel: document.getElementById('rail-models-label'),
      railItems: document.getElementById('rail-items'),
      eyebrow: document.getElementById('model-eyebrow'),
      title: document.getElementById('model-title'),
      sub: document.getElementById('model-sub'),
      badges: document.getElementById('model-badges'),
      dots: document.getElementById('dots'),
      toast: document.getElementById('toast'),
      intro: document.getElementById('intro'),
      introBrand: document.getElementById('intro-brand'),
      introHeadline: document.getElementById('intro-headline'),
      introStatement: document.getElementById('intro-statement'),
      introMeta: document.getElementById('intro-meta'),
      introBegin: document.getElementById('intro-begin'),
      langToggle: document.getElementById('lang-toggle'),
      helpBtn: document.getElementById('help-btn'),
      panelTitle: document.getElementById('panel-title'),
      panelCount: document.getElementById('panel-count'),
    };
    this._toastTimer = null;
    this._buildRail();
    this._buildDots();
    this._bind();
    this.applyLang();
  }

  _bind() {
    this.el.introBegin.addEventListener('click', () => this.hideIntro());
    this.el.langToggle.addEventListener('click', () => this.h.onToggleLang?.());
    this.el.helpBtn.addEventListener('click', () => this.h.onHelp?.());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.h.onEscape?.();
    });
  }

  _buildRail() {
    this.el.railItems.innerHTML = '';
    this.railButtons = this.models.map((m, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rail-item';
      b.setAttribute('role', 'listitem');
      const dash = document.createElement('span');
      dash.className = 'dash';
      const name = document.createElement('span');
      name.className = 'name';
      b.append(dash, name);
      b.addEventListener('click', () => this.h.onSelect?.(m.id));
      this.el.railItems.append(b);
      return { btn: b, name };
    });
  }

  _buildDots() {
    this.el.dots.innerHTML = '';
    this.dotButtons = this.models.map((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => this.h.onSelect?.(m.id));
      this.el.dots.append(b);
      return b;
    });
  }

  /** 语言切换后重刷所有文案。 */
  applyLang() {
    const zh = getLang() === 'zh';
    this.el.brandMark.textContent = zh ? '榫构华夏' : 'TIMBER CRAFT LAB';
    this.el.brandLatin.textContent = zh ? '结构实验室' : 'Timber Craft Lab';
    this.el.railLabel.textContent = t('models');
    this.el.langToggle.textContent = t('langLabel');
    this.el.langToggle.setAttribute('aria-label', t('langToggle'));
    this.el.helpBtn.setAttribute('aria-label', t('help'));
    this.el.panelTitle.textContent = t('controls');
    this.el.introBegin.textContent = t('begin');
    this.el.introBrand.textContent = zh ? '榫构华夏' : 'TIMBER CRAFT LAB';
    this.el.introHeadline.innerHTML = zh
      ? '拆开，<span class="soft">才看得懂</span>'
      : 'Taken apart, <span class="soft">it explains itself</span>';
    this.el.introStatement.textContent = t('statement');
    this.el.introMeta.innerHTML = '';

    this.models.forEach((m, i) => {
      this.railButtons[i].name.textContent = tv(m.title);
      this.railButtons[i].btn.setAttribute('aria-label', tv(m.title));
      this.dotButtons[i].setAttribute('aria-label', tv(m.title));
    });
    this.h.onLangApplied?.();
  }

  /** 切换到某个模型时刷新标题区。 */
  setModel(model, partCount) {
    const idx = this.models.findIndex((m) => m.id === model.id);
    const no = String(idx + 1).padStart(2, '0');
    const total = String(this.models.length).padStart(2, '0');
    this.el.eyebrow.textContent = `Model ${no} / ${total} · ${model.pinyin || ''}`.trim();
    this.el.title.textContent = tv(model.title);
    this.el.sub.textContent = tv(model.subtitle);
    this.el.panelCount.textContent = `${partCount}`;

    this.el.badges.innerHTML = '';
    const addBadge = (text, warn) => {
      const b = document.createElement('span');
      b.className = warn ? 'badge warn' : 'badge';
      b.textContent = text;
      this.el.badges.append(b);
    };
    addBadge(t('disclaimer'), true);
    addBadge(tv(model.era));
    addBadge(tv(model.region));

    const idx2 = this.models.findIndex((m) => m.id === model.id);
    this.railButtons.forEach((r, i) => r.btn.setAttribute('aria-current', String(i === idx2)));
    this.dotButtons.forEach((d, i) => d.setAttribute('aria-current', String(i === idx2)));
  }

  hideIntro() {
    this.el.intro.classList.add('is-hidden');
    setTimeout(() => { this.el.intro.style.display = 'none'; }, 520);
    this.h.onIntroDone?.();
  }

  toast(msg) {
    this.el.toast.textContent = msg;
    this.el.toast.classList.add('is-open');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.el.toast.classList.remove('is-open'), 2400);
  }
}
