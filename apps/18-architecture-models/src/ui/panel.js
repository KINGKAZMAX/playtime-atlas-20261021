/**
 * panel.js — 控制面板 / Control panel
 *
 * 面板内容随模型重建（层级列表因模型而异），但控件种类与顺序保持一致。
 */
import { t, tv, tb, getLang } from '../core/i18n.js';

function escapeText(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const AXIS_KEYS = [
  { id: 'x', zh: '前后切', en: 'Along X' },
  { id: 'z', zh: '左右切', en: 'Along Z' },
  { id: 'y', zh: '水平切', en: 'Along Y' },
];

export class Panel {
  constructor(root, handlers = {}) {
    this.root = root;
    this.h = handlers;
    this.model = null;
    this.maxStep = 0;
    this._currentStep = 0;
    this._playing = false;
    this._forces = false;
    this._labels = true;
    this._autoRotate = false;
    this._sectionState = { enabled: false, axis: 'z', position: 0.5 };
    this._els = {};
  }

  /* ------------------------------------------------------------ 构建 */

  setModel(model, partCount) {
    this.model = model;
    this.maxStep = Math.max(1, model ? model.partsMax || 1 : 1);
    this.render();
  }

  render() {
    const r = this.root;
    r.innerHTML = '';

    /* --- 关于本模型 --- */
    if (this.model) {
      const gAbout = this._group(t('about'));
      const summary = document.createElement('p');
      summary.className = 'hint';
      summary.style.marginBottom = '12px';
      summary.textContent = tv(this.model.summary);
      gAbout.append(summary);

      const path = document.createElement('p');
      path.className = 'hint';
      path.style.margin = '0';
      path.innerHTML = `<span style="color:var(--ds-ink-faint)">${t('loadPath')}</span><br>`
        + `<span style="color:var(--ds-ink)">${escapeText(tv(this.model.loadPath))}</span>`;
      gAbout.append(path);

      const meta = document.createElement('div');
      meta.className = 'note';
      meta.style.marginTop = '12px';
      meta.textContent = `${t('period')}: ${tv(this.model.era)} · ${t('region')}: ${tv(this.model.region)}`;
      gAbout.append(meta);

      // 比例说明
      const scale = document.createElement('p');
      scale.className = 'note';
      scale.style.marginTop = '8px';
      scale.innerHTML = `<span style="color:var(--ds-ink-faint)">${t('scaleNoteLabel')}</span> · `
        + escapeText(tv(this.model.scaleNote));
      gAbout.append(scale);

      // 教学示意声明 —— 三处落点之二：模型说明页（中英双语同屏，不随界面语言隐藏）
      const dis = document.createElement('div');
      dis.className = 'disclaimer';
      dis.dataset.role = 'disclaimer';
      const dMain = tb('disclaimer');
      const dLong = tb('disclaimerLong');
      dis.innerHTML = `<b lang="${dMain.lang}">${escapeText(dMain.main)}</b>`
        + `<span lang="${dLong.lang}">${escapeText(dLong.main)}</span>`
        + `<span class="disclaimer__alt" lang="${dMain.altLang}">${escapeText(dMain.sub)} ${escapeText(dLong.sub)}</span>`;
      gAbout.append(dis);

      // 史实参照（引用自 17-architecture-research/catalog.json）
      const refs = this.model.catalogRefs || [];
      if (refs.length) {
        const gRefs = this._group(t('catalogRefs'), t('catalogRefsHint'));
        const list = document.createElement('div');
        list.className = 'refs';
        for (const r of refs) {
          const d = document.createElement('div');
          d.className = 'ref';
          d.innerHTML = `<span class="ref__name">${escapeText(tv(r.name))}</span>`
            + `<span class="ref__id">${escapeText(r.id)} · ${escapeText(r.source || '17-architecture-research/catalog.json')}</span>`;
          list.append(d);
        }
        gRefs.append(list);
        gAbout.append(gRefs);
      }

      r.append(gAbout);
    }

    /* --- 爆炸拆解 --- */
    const gExplode = this._group(t('explode'), t('explodeHint'));
    const explodeRow = this._row();
    const explodeSlider = this._slider(0, 100, 0, (v) => {
      this._els.explodeValue.textContent = `${v}%`;
      this.h.onExplode?.(v / 100);
    });
    explodeRow.append(explodeSlider);
    const explodeValue = document.createElement('span');
    explodeValue.className = 'value';
    explodeValue.textContent = '0%';
    explodeRow.append(explodeValue);
    gExplode.append(explodeRow);
    this._els.explodeSlider = explodeSlider;
    this._els.explodeValue = explodeValue;

    /* --- 分步组装 --- */
    const gAssemble = this._group(t('assemble'), t('assembleHint'));
    const stepRow = this._row();
    const prev = this._button('‹', () => this._step(this._currentStep - 1), 'Previous assembly step', 'assembly-prev');
    const stepCount = document.createElement('span');
    stepCount.className = 'step-count';
    stepCount.textContent = `0 / ${this.maxStep}`;
    const next = this._button('›', () => this._step(this._currentStep + 1), 'Next assembly step', 'assembly-next');
    const play = this._button(t('play'), () => this._togglePlay(), 'Play assembly', 'assembly-play');
    stepRow.append(prev, stepCount, next, play);
    gAssemble.append(stepRow);
    this._els.stepCount = stepCount;
    this._els.play = play;
    this._els.prev = prev;
    this._els.next = next;

    const assembleSlider = this._slider(0, this.maxStep, 0, (v) => {
      this._stopPlay();
      this._currentStep = v;
      this._els.stepCount.textContent = `${v} / ${this.maxStep}`;
      this.h.onAssembly?.(v);
    });
    gAssemble.append(assembleSlider);
    this._els.assembleSlider = assembleSlider;

    const resetAssemble = this._button(t('reset'), () => {
      this._stopPlay();
      this._currentStep = this.maxStep;
      this._els.assembleSlider.value = String(this.maxStep);
      this._els.stepCount.textContent = `${this.maxStep} / ${this.maxStep}`;
      this.h.onAssembly?.(this.maxStep);
    }, 'Reset assembly', 'assembly-reset');
    gAssemble.append(resetAssemble);

    /* --- 剖切 --- */
    const gSection = this._group(t('section'), t('sectionHint'));
    const sw = this._switch(t('section'), (on) => {
      this._sectionState.enabled = on;
      this.h.onSection?.({ ...this._sectionState });
      axisSeg.style.opacity = on ? '1' : '0.45';
      posSlider.disabled = !on;
      posSlider.style.opacity = on ? '1' : '0.45';
    });
    sw.btn.setAttribute('aria-checked', String(!!this._sectionState.enabled));
    gSection.append(sw.row);

    const axisSeg = document.createElement('div');
    axisSeg.className = 'seg';
    axisSeg.style.marginTop = '10px';
    const axisBtns = {};
    for (const a of AXIS_KEYS) {
      const b = this._button(getLang() === 'zh' ? a.zh : a.en, () => {
        this._sectionState.axis = a.id;
        for (const k of Object.keys(axisBtns)) axisBtns[k].setAttribute('aria-pressed', String(k === a.id));
        this.h.onSection?.({ ...this._sectionState });
      });
      b.setAttribute('aria-pressed', String(a.id === this._sectionState.axis));
      axisBtns[a.id] = b;
      axisSeg.append(b);
    }
    gSection.append(axisSeg);
    axisSeg.style.opacity = this._sectionState.enabled ? '1' : '0.45';

    const posRow = this._row();
    posRow.style.marginTop = '10px';
    const posSlider = this._slider(0, 100, Math.round(this._sectionState.position * 100), (v) => {
      this._els.sectionValue.textContent = `${v}%`;
      this._sectionState.position = v / 100;
      this.h.onSection?.({ ...this._sectionState });
    });
    posSlider.disabled = !this._sectionState.enabled;
    posSlider.style.opacity = this._sectionState.enabled ? '1' : '0.45';
    posRow.append(posSlider);
    const sectionValue = document.createElement('span');
    sectionValue.className = 'value';
    sectionValue.textContent = `${Math.round(this._sectionState.position * 100)}%`;
    posRow.append(sectionValue);
    gSection.append(posRow);
    this._els.sectionValue = sectionValue;
    this._els.posSlider = posSlider;

    /* --- 层级 --- */
    const gLayers = this._group(t('layers'), t('layersHint'));
    const list = document.createElement('div');
    list.className = 'layer-list';
    this._els.layerInputs = {};
    for (const l of (this.model?.layers || [])) {
      const row = document.createElement('label');
      row.className = 'layer-row';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = l.defaultVisible !== false;
      input.id = `layer-${l.id}`;
      const box = document.createElement('span');
      box.className = 'box';
      const txt = document.createElement('span');
      txt.className = 'txt';
      txt.textContent = tv(l.label);
      input.addEventListener('change', () => this.h.onLayer?.(l.id, input.checked));
      row.append(input, box, txt);
      list.append(row);
      this._els.layerInputs[l.id] = input;
    }
    gLayers.append(list);

    /* --- 受力 --- */
    const gForces = this._group(t('forces'));
    gForces.append(this._bilingualHint('forceArrowsNote'));
    const swF = this._switch(t('forces'), (on) => {
      this._forces = on;
      this.h.onForces?.(on);
    });
    swF.btn.setAttribute('aria-checked', String(!!this._forces));
    gForces.append(swF.row);

    /* --- 视图 --- */
    const gView = this._group(t('view'));
    const vRow = this._row();
    vRow.append(this._button(t('resetView'), () => this.h.onResetView?.(), t('resetView'), 'reset-view'));
    gView.append(vRow);
    const swR = this._switch(t('autoRotate'), (on) => {
      this._autoRotate = on;
      this.h.onAutoRotate?.(on);
    });
    swR.btn.setAttribute('aria-checked', String(!!this._autoRotate));
    gView.append(swR.row);

    /* --- 标注 --- */
    const gLabels = this._group(t('labels'), t('labelsHint'));
    const swL = this._switch(t('labels'), (on) => {
      this._labels = on;
      this.h.onLabels?.(on);
    });
    swL.btn.setAttribute('aria-checked', String(this._labels !== false));
    gLabels.append(swL.row);

    /* --- 导出 --- */
    const gExport = this._group(t('exportGlb'));
    gExport.append(this._button(t('exportGlb'), () => this.h.onExport?.(), 'Download the model as a .glb file', 'export-glb'));
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = t('footerNote');
    gExport.append(note);
    const exportNote = document.createElement('p');
    exportNote.className = 'note';
    exportNote.textContent = t('disclaimer');
    gExport.append(exportNote);

    r.append(gExplode, gAssemble, gSection, gLayers, gForces, gView, gLabels, gExport);

    this._currentStep = this.maxStep;
    this._els.stepCount.textContent = `${this.maxStep} / ${this.maxStep}`;
    this._els.assembleSlider.value = String(this.maxStep);
    this._els.layerInputs && Object.values(this._els.layerInputs).forEach((i, k) => {
      const ids = Object.keys(this._els.layerInputs);
      const lid = ids[k];
      const def = (this.model?.layers || []).find((l) => l.id === lid);
      i.checked = def ? def.defaultVisible !== false : true;
    });
  }

  /* ------------------------------------------------------------ 内部工具 */

  _group(title, hint) {
    const g = document.createElement('section');
    g.className = 'group';
    const h = document.createElement('h3');
    h.textContent = title;
    g.append(h);
    if (hint) {
      const p = document.createElement('p');
      p.className = 'hint';
      p.textContent = hint;
      g.append(p);
    }
    return g;
  }

  _row() {
    const d = document.createElement('div');
    d.className = 'row';
    return d;
  }

  /** 双语提示段：安全类提示中英同屏，不随界面语言隐藏。 */
  _bilingualHint(key) {
    const p = document.createElement('p');
    p.className = 'hint hint--bilingual';
    const m = tb(key);
    p.innerHTML = `<span lang="${m.lang}">${escapeText(m.main)}</span>`
      + `<span class="hint__alt" lang="${m.altLang}">${escapeText(m.sub)}</span>`;
    return p;
  }

  _slider(min, max, value, onInput) {
    const s = document.createElement('input');
    s.type = 'range';
    s.min = String(min);
    s.max = String(max);
    s.step = '1';
    s.value = String(value);
    s.setAttribute('aria-label', t('explode'));
    s.addEventListener('input', () => onInput(Number(s.value)));
    return s;
  }

  _button(label, onClick, aria, action) {
    const b = document.createElement('button');
    b.type = 'button';
    // .btn--sm = §5.1 紧凑变体：面板工具条内的次级操作，
    // 高 32px（≥24px AA 达标），不计入 44px（AAA）检查。
    b.className = 'btn btn--sm';
    b.textContent = label;
    if (aria) b.setAttribute('aria-label', aria);
    if (action) b.dataset.action = action;
    b.addEventListener('click', onClick);
    return b;
  }

  _switch(label, onChange) {
    const row = document.createElement('div');
    row.className = 'switch-row';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'switch';
    btn.setAttribute('role', 'switch');
    btn.setAttribute('aria-checked', 'false');
    btn.setAttribute('aria-label', label);
    const lab = document.createElement('span');
    lab.style.fontSize = '12px';
    lab.textContent = label;
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', String(on));
      onChange(on);
    });
    row.append(lab, btn);
    return { row, btn };
  }

  _step(v) {
    this._stopPlay();
    const clamped = Math.max(0, Math.min(this.maxStep, v));
    this._currentStep = clamped;
    this._els.assembleSlider.value = String(clamped);
    this._els.stepCount.textContent = `${clamped} / ${this.maxStep}`;
    this.h.onAssembly?.(clamped);
  }

  _togglePlay() {
    if (this._playing) { this._stopPlay(); return; }
    this._playing = true;
    this._els.play.textContent = t('pause');
    this._els.play.classList.add('is-on');
    this._currentStep = 0;
    this._els.assembleSlider.value = '0';
    this._els.stepCount.textContent = `0 / ${this.maxStep}`;
    this.h.onAssembly?.(0);
    this._playTimer = setInterval(() => {
      if (this._currentStep >= this.maxStep) { this._stopPlay(); return; }
      this._currentStep += 1;
      this._els.assembleSlider.value = String(this._currentStep);
      this._els.stepCount.textContent = `${this._currentStep} / ${this.maxStep}`;
      this.h.onAssembly?.(this._currentStep);
    }, 900);
  }

  _stopPlay() {
    if (!this._playing) return;
    this._playing = false;
    clearInterval(this._playTimer);
    this._els.play.textContent = t('play');
    this._els.play.classList.remove('is-on');
  }

  /* ------------------------------------------------------------ 外部同步 */

  setExplode(v) {
    const pct = Math.round(v * 100);
    this._els.explodeSlider.value = String(pct);
    this._els.explodeValue.textContent = `${pct}%`;
  }

  setSection(state) {
    this._sectionState = { ...this._sectionState, ...state };
  }

  setLayerState(id, on) {
    const i = this._els.layerInputs?.[id];
    if (i) i.checked = on;
  }

  setLabelsState(on) {
    this._labels = !!on;
  }
}
