/**
 * inspector.js — 构件说明卡 / Selected-component card
 * 双语构件名 + 拼音 + 一句作用说明 + 所属层级与构件族。
 */
import { t, tv, getLang } from '../core/i18n.js';

const FAMILY = {
  wood: { zh: '木', en: 'Timber' },
  stone: { zh: '石', en: 'Stone' },
  earth: { zh: '土', en: 'Earth' },
  tile: { zh: '瓦', en: 'Tile' },
  water: { zh: '水', en: 'Water' },
  other: { zh: '其它', en: 'Other' },
};

export class Inspector {
  constructor() {
    this.el = {
      root: document.getElementById('inspector'),
      kicker: document.getElementById('insp-kicker'),
      name: document.getElementById('insp-name'),
      pinyin: document.getElementById('insp-pinyin'),
      role: document.getElementById('insp-role'),
      meta: document.getElementById('insp-meta'),
      close: document.getElementById('inspector-close'),
    };
    this.el.close.addEventListener('click', () => this.clear());
    this.part = null;
  }

  show(part, model) {
    if (!part) { this.clear(); return; }
    this.part = part;
    this.model = model;
    this.el.root.classList.add('is-open');
    this.render();
  }

  render() {
    const p = this.part;
    if (!p) return;
    const zh = getLang() === 'zh';
    this.el.kicker.textContent = t('inspector');
    this.el.name.textContent = tv(p.name);
    this.el.pinyin.textContent = p.pinyin || '';
    this.el.role.textContent = tv(p.role);

    const layerLabel = this.model?.layers?.find((l) => l.id === p.layer)?.label;
    const fam = FAMILY[p.family] || FAMILY.other;
    this.el.meta.innerHTML = '';
    const add = (label, value) => {
      const d = document.createElement('div');
      const s = document.createElement('span');
      s.textContent = label;
      const b = document.createElement('b');
      b.textContent = value;
      d.append(s, b);
      this.el.meta.append(d);
    };
    add(t('layer'), tv(layerLabel) || p.layer);
    add(zh ? '材质类别' : 'Material', zh ? fam.zh : fam.en);
    if (this.model) add(t('loadPath'), tv(this.model.loadPath));
  }

  clear() {
    this.part = null;
    this.el.root.classList.remove('is-open');
  }
}
