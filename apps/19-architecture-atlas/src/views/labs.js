/**
 * Structural labs — the index and the explorable model.
 *
 * The models come from 18-architecture-models and follow the unified model
 * contract (v1.1). They are loaded **on demand**: the Three.js engine and the
 * model geometry never touch the first screen.
 *
 * If WebGL is unavailable the view degrades to 18's 2D schematic, which is
 * derived from the *same* built geometry (real vertices, isometric
 * projection, convex hull) — it is not a second, faked drawing.
 *
 * TEACHING SCHEMATIC. Force arrows are a qualitative description of the
 * load path, not an engineering calculation.
 */

import { el, clear } from '../core/dom.js';
import { t, pick, getLang } from '../core/i18n.js';
import { labFallback } from '../art/schematic.js';
import { LABS, LAB_BY_ID, TEACHING_NOTICE } from '../data/labs.js';

/* ------------------------------------------------------------------ index */

export function renderLabsIndex(host) {
  const grid = el('div.lab-grid');

  for (const lab of LABS) {
    grid.append(el('article.lab-card', {}, [
      el('div.lab-thumb', { html: labFallback(lab.id, 560, 350) }),
      el('div.lab-body', {}, [
        el('h3', { text: lab.nameZh }),
        el('span.en', { text: lab.nameEn.toUpperCase() }),
        el('p', { text: pick(lab.tagline) }),
        el('p.lab-meta', { text: `${t('labs.partsOf', { n: lab.parts.length })} · ${t('labs.stepsOf', { n: lab.steps.length })}` }),
        el('a.btn.btn-sm', { href: `#/lab/${lab.id}`, text: t('labs.open') }),
      ]),
    ]));
  }

  const notice = el('div.notice', {}, [
    el('span', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>' }),
    el('div', {}, [el('b', { text: t('labs.teaching') })]),
  ]);

  host.append(el('div.band-inner', {}, [
    el('div.band-head', {}, [
      el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('labs.eyebrow') })]),
      el('h2.band-title', {}, [
        el('span', { text: t('labs.title') }),
        el('span.en', { text: t('labs.titleEn') }),
      ]),
      el('p.band-lede', { text: t('labs.lede') }),
    ]),
    notice,
    el('div', { style: { marginTop: '1.6rem' } }, [grid]),
  ]));
}

/* ----------------------------------------------------------------- detail */

/**
 * 显式 loader：Vite 需要静态路径才能为每个模型单独切块。
 * 每个模型一个独立 chunk —— 打开任一实验室只加载那一个。
 */
const MODEL_LOADERS = {
  dougong: () => import('../lab/models/dougong.js'),
  mortise: () => import('../lab/models/mortise.js'),
  taoliang: () => import('../lab/models/taoliang.js'),
  chuandou: () => import('../lab/models/chuandou.js'),
  'stone-arch': () => import('../lab/models/stone-arch.js'),
  tulou: () => import('../lab/models/tulou.js'),
};

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Normalise the shape of a built model before three.js sees it.
 *
 * 18's contract describes a force arrow's endpoints as three numbers, but
 * the six models do not agree on how to spell them: most use `[x, y, z]`,
 * while the stone-arch model uses `{ x, y, z }`. three.js only understands
 * the array form — `new THREE.Vector3({ x, y, z })` does not throw, it
 * silently produces a vector whose components are NaN, and the arrow turns
 * into broken geometry instead of a load path.
 *
 * 19 owns the consumer side of that contract, so it normalises here rather
 * than editing the vendored copy of 18 (which must stay byte-identical to
 * upstream — scripts/validate.mjs checks that).
 */
function normalizeBuild(build) {
  const toArray = (v) => (Array.isArray(v) ? v : [v?.x ?? 0, v?.y ?? 0, v?.z ?? 0]);
  for (const f of build?.forces || []) {
    if (!f) continue;
    f.from = toArray(f.from);
    f.to = toArray(f.to);
  }
  return build;
}

const SECTION_AXES = [
  { id: 'z', zh: '左右切', en: 'Side–side' },
  { id: 'x', zh: '前后切', en: 'Front–back' },
  { id: 'y', zh: '水平切', en: 'Horizontal' },
];

export function renderLabDetail(host, labId, { onToast } = {}) {
  const spec = LAB_BY_ID[labId];
  if (!spec) {
    host.append(el('div.band-inner', {}, [
      el('div.empty', {}, [el('b', { text: t('common.error') }), el('span', { text: labId })]),
    ]));
    return null;
  }

  const stage = el('div.lab-canvas-wrap');
  const loading = el('div.lab-loading', { text: t('labs.loading') });
  const fallback = el('div.lab-fallback', { hidden: '' });
  const badge = el('div.lab-badge', { text: t('labs.teaching') });
  stage.append(fallback, loading, badge);

  const partList = el('ul.part-list', { role: 'list' });
  const partDetail = el('div.part-detail');
  const stepList = el('ol.step-list.step-assembly');
  const stepLabel = el('output.step-readout', { text: '' });
  const explodeOut = el('output', { text: '0%' });
  const sectionOut = el('output', { text: '50%' });

  const state = {
    step: spec.steps.length - 1,   // index into spec.steps；-1 = 尚未开始
    playing: false,
    viewer: null,
    build: null,
    model: null,
    timer: 0,
    sectionAxis: 'z',
  };

  /* ---------------- panel ---------------- */

  const playBtn = el('button.btn.btn-sm', {
    type: 'button', text: t('labs.play'), 'aria-pressed': 'false',
    on: {
      click: () => {
        if (state.playing) { stopPlay(); return; }
        if (state.step >= spec.steps.length - 1) { state.step = -1; applyStep(); }
        state.playing = true;
        playBtn.textContent = t('labs.pause');
        playBtn.setAttribute('aria-pressed', 'true');
        state.timer = setInterval(() => {
          if (state.step >= spec.steps.length - 1) { stopPlay(); return; }
          state.step += 1;
          applyStep();
        }, prefersReduced() ? 1800 : 1200);
      },
    },
  });
  function stopPlay() {
    state.playing = false;
    clearInterval(state.timer);
    playBtn.textContent = t('labs.play');
    playBtn.setAttribute('aria-pressed', 'false');
  }

  const explodeRange = el('input', {
    type: 'range', min: '0', max: '100', value: '0', step: '1',
    'aria-label': t('labs.explodeLabel'),
    on: {
      input: (e) => {
        const v = Number(e.target.value) / 100;
        state.viewer?.setExplode(v);
        explodeOut.textContent = `${e.target.value}%`;
      },
    },
  });

  const sectionToggle = el('button.btn.btn-sm', {
    type: 'button', text: t('labs.section'), 'aria-pressed': 'false',
    on: {
      click: () => {
        const on = sectionToggle.getAttribute('aria-pressed') !== 'true';
        sectionToggle.setAttribute('aria-pressed', String(on));
        state.viewer?.setSection(on, state.sectionAxis, Number(sectionRange.value) / 100);
      },
    },
  });

  const axisButtons = SECTION_AXES.map((axis) => el('button', {
    type: 'button', text: pick(axis), 'aria-pressed': String(axis.id === state.sectionAxis),
    on: {
      click: () => {
        state.sectionAxis = axis.id;
        for (const b of axisButtons) b.setAttribute('aria-pressed', 'false');
        const self = axisButtons[SECTION_AXES.indexOf(axis)];
        self?.setAttribute('aria-pressed', 'true');
        state.viewer?.setSection(sectionToggle.getAttribute('aria-pressed') === 'true', axis.id, Number(sectionRange.value) / 100);
      },
    },
  }));

  const sectionRange = el('input', {
    type: 'range', min: '0', max: '100', value: '50', step: '1',
    'aria-label': t('labs.sectionLabel'),
    on: {
      input: (e) => {
        sectionOut.textContent = `${e.target.value}%`;
        state.viewer?.setSection(sectionToggle.getAttribute('aria-pressed') === 'true', state.sectionAxis, Number(e.target.value) / 100);
      },
    },
  });

  const forceToggle = el('button.btn.btn-sm', {
    type: 'button', text: t('labs.forces'), 'aria-pressed': 'false',
    on: {
      click: () => {
        const on = forceToggle.getAttribute('aria-pressed') !== 'true';
        forceToggle.setAttribute('aria-pressed', String(on));
        state.viewer?.setForcesVisible(on);
      },
    },
  });

  const layerButtons = [];
  const layerSeg = el('div.seg', { role: 'group', 'aria-label': t('labs.layerLabel') });
  const allLayerBtn = el('button', {
    type: 'button', text: t('labs.layer.all'), 'aria-pressed': 'true',
    on: {
      click: () => {
        for (const b of layerButtons) b.setAttribute('aria-pressed', 'true');
        for (const layer of spec.layers) state.viewer?.setLayerVisible(layer.id, true);
      },
    },
  });
  layerSeg.append(allLayerBtn);
  layerButtons.push(allLayerBtn);
  for (const layer of spec.layers) {
    const btn = el('button', {
      type: 'button', text: layer.nameZh, 'aria-pressed': 'true',
      on: {
        click: () => {
          const on = btn.getAttribute('aria-pressed') !== 'true';
          btn.setAttribute('aria-pressed', String(on));
          state.viewer?.setLayerVisible(layer.id, on);
        },
      },
    });
    layerButtons.push(btn);
    layerSeg.append(btn);
  }

  const panel = el('div.lab-panel', {}, [
    el('div', {}, [
      el('h4', { text: t('labs.steps') }),
      el('div.ctrl-row', {}, [
        el('span', {}, [stepLabel]),
        el('span', {}, [
          el('button.btn.btn-sm', {
            type: 'button', text: '←', 'aria-label': t('labs.prevStep'),
            on: { click: () => { stopPlay(); state.step = Math.max(0, state.step - 1); applyStep(); } },
          }),
          el('button.btn.btn-sm', {
            type: 'button', text: '→', 'aria-label': t('labs.nextStep'),
            on: { click: () => { stopPlay(); state.step = Math.min(spec.steps.length - 1, state.step + 1); applyStep(); } },
          }),
        ]),
      ]),
      playBtn,
      stepList,
    ]),
    el('div', {}, [
      el('h4', { text: t('labs.explodeLabel') }),
      el('div.ctrl-row', {}, [el('span', { text: t('labs.explode') }), explodeOut]),
      explodeRange,
    ]),
    el('div', {}, [
      el('h4', { text: t('labs.sectionLabel') }),
      el('div.ctrl-row', {}, [sectionToggle, sectionOut]),
      el('div.seg', { role: 'group', 'aria-label': t('labs.sectionLabel') }, axisButtons),
      sectionRange,
    ]),
    el('div', {}, [
      el('h4', { text: t('labs.layerLabel') }),
      layerSeg,
    ]),
    el('div', {}, [
      el('h4', { text: t('labs.forces') }),
      forceToggle,
    ]),
    el('div', {}, [
      el('h4', { text: t('labs.partList') }),
      partList,
    ]),
  ]);

  /* ---------------- steps + facts ---------------- */

  for (let i = 0; i < spec.steps.length; i += 1) {
    stepList.append(el('li', { text: pick(spec.steps[i]) }));
  }

  const factList = el('ul.step-list');
  for (const fact of spec.facts) factList.append(el('li', { text: pick(fact) }));

  /* ---------------- part list ---------------- */

  function paintPartList(selectedId) {
    clear(partList);
    for (const part of spec.parts) {
      const li = el('li');
      li.append(el('button', {
        type: 'button',
        'aria-pressed': String(part.id === selectedId),
        on: { click: () => state.viewer?.selectPart(part.id) },
      }, [
        el('span.p-zh', { text: part.zh }),
        el('span.p-en', { text: part.en }),
        el('span.p-py', { text: part.py }),
      ]));
      partList.append(li);
    }
  }

  function paintPartDetail(partId) {
    clear(partDetail);
    const part = spec.parts.find((p) => p.id === partId);
    if (!part) {
      partDetail.append(el('p', { text: t('labs.selectFirst'), style: { margin: '0' } }));
      return;
    }
    partDetail.append(el('h5', { text: part.zh }));
    partDetail.append(el('span.pinyin', { text: `${part.py} · ${part.en}` }));
    partDetail.append(el('p', { text: pick(part.note) }));
    partDetail.append(el('div.force', {}, [
      el('b', { text: `${t('labs.forceTitle')}：` }),
      document.createTextNode(pick(spec.loadPath)),
    ]));
  }

  /* ---------------- assembly ---------------- */

  function applyStep() {
    const n = spec.steps.length;
    const step = spec.steps[state.step];
    // 步号：state.step = -1 表示「尚未开始」，0..n-1 表示第 i+1 步。
    // 越界会读出 "Step 6 of 5" 这种假读数，所以这里显式分两态。
    stepLabel.textContent = state.step < 0
      ? t('labs.stepIdle')
      : t('labs.step', { i: state.step + 1, n });
    const items = stepList.querySelectorAll('li');
    items.forEach((li, i) => li.classList.toggle('is-current', i === state.step));
    if (!state.viewer) return;
    // 18 的契约：viewer.setAssembly(target) 以构件 order 为单位推进，
    // order <= target 的构件才可见。stepValue = 本步最后一个构件的 order + 1，
    // 所以要减 1 才「恰好装到本步这一组」；不减 1 会让下一步的构件提前出现。
    // state.step = -1 → target = -1 → 无构件可见（从零开始装配）。
    state.viewer.setAssemblyImmediate(step ? step.stepValue - 1 : -1);
  }

  /* ---------------- assemble ---------------- */

  const head = el('div.band-head', {}, [
    el('p.eyebrow', {}, [el('span.dot'), el('span', { text: t('labs.eyebrow') })]),
    el('h2.band-title', {}, [
      el('span', { text: spec.nameZh }),
      el('span.en', { text: spec.nameEn.toUpperCase() }),
    ]),
    el('p.band-lede', { text: pick(spec.tagline) }),
  ]);

  const intro = el('p.band-lede', { text: pick(spec.intro), style: { maxWidth: '68ch', margin: '1.2rem 0 1.6rem' } });

  const stageWrap = el('div.lab-stage', {}, [el('div', {}, [stage]), panel]);

  const notice = el('div.notice', {}, [
    el('span', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>' }),
    el('div', {}, [
      el('b', { text: pick(spec.scaleNote) }),
      el('div.other-lang', { text: pick(spec.scaleNote) === spec.scaleNote.zh ? spec.scaleNote.en : spec.scaleNote.zh }),
    ]),
  ]);

  const toolbar = el('div.detail-nav', {}, [
    el('button.btn.btn-sm', {
      type: 'button', text: t('labs.reset'),
      on: {
        click: () => {
          state.viewer?.resetView();
          state.viewer?.setExplode(0);
          explodeRange.value = '0';
          explodeOut.textContent = '0%';
        },
      },
    }),
    el('button.btn.btn-sm', {
      type: 'button', text: t('labs.gltf'),
      on: {
        click: async () => {
          if (!state.build || !state.model) { onToast?.(t('common.error')); return; }
          try {
            const { exportGLB } = await import('../lab/core/glb.js');
            await exportGLB(state.build.group, state.build.parts, `built-in-china-${spec.id}.glb`, state.model);
            onToast?.(t('labs.gltfDone'));
          } catch (err) {
            console.warn('[labs] GLB export failed', err);
            onToast?.(t('common.error'));
          }
        },
      },
    }),
    el('a.btn.btn-sm', { href: '#/labs', text: t('labs.backToLabs') }),
  ]);

  host.append(el('div.band-inner', {}, [
    head,
    intro,
    notice,
    el('div', { style: { marginTop: '1.4rem' } }, [stageWrap]),
    el('p.lab-orient', { text: t('labs.orientation') }),
    el('div.detail-body', { style: { marginTop: '1.6rem' } }, [
      el('h3', { text: t('labs.partList') }),
      partDetail,
      el('h3', { text: t('labs.facts') }),
      factList,
    ]),
    toolbar,
  ]));

  paintPartList(null);
  paintPartDetail(null);
  applyStep();

  /* ---------------- boot ---------------- */

  let disposed = false;

  const start = async () => {
    if (disposed) return;
    let fallbackMod;
    let modelMod;
    let materialsMod;
    try {
      [fallbackMod, modelMod, materialsMod] = await Promise.all([
        import('../lab/core/fallback.js'),
        (MODEL_LOADERS[spec.id] || MODEL_LOADERS.dougong)(),
        import('../lab/core/materials.js'),
      ]);
    } catch (err) {
      console.warn('[labs] model runtime unavailable', err);
      loading.textContent = t('labs.webglMissing');
      return;
    }
    if (disposed) return;

    const model = modelMod.default;
    const materials = materialsMod.createMaterials();
    let build;
    try {
      build = model.build(materials);
    } catch (err) {
      console.warn('[labs] model failed to build', err);
      loading.textContent = t('labs.webglMissing');
      return;
    }
    normalizeBuild(build);
    state.model = model;
    state.build = build;

    /* ---- 2D 降级：同一份几何画出的示意图，不是另画的假图 ---- */
    if (!fallbackMod.hasWebGL()) {
      loading.setAttribute('hidden', '');
      const svg = fallbackMod.renderFallbackSVG(build.group, build.parts, { lang: getLang() });
      clear(fallback);
      fallback.append(el('div', { html: svg }));
      fallback.removeAttribute('hidden');
      stage.append(el('div.lab-fallback-note', { text: t('labs.fallback') }));
      return;
    }

    /* ---- 三维 ---- */
    const { Viewer } = await import('../lab/core/viewer.js');
    if (disposed) return;
    const viewer = new Viewer(stage, {
      onSelect: (part) => {
        const id = part?.id || null;
        paintPartList(id);
        paintPartDetail(id);
      },
      reducedMotion: prefersReduced(),
    });
    viewer.setModel(model, build);
    state.viewer = viewer;
    // 与面板状态保持一致：初始停在最后一步（整装完成），而不是另写一个
    // 与步号脱节的 Infinity。
    applyStep();
    loading.setAttribute('hidden', '');
    fallback.setAttribute('hidden', '');
  };

  start();

  return () => {
    disposed = true;
    stopPlay();
    try { state.viewer?.dispose(); } catch { /* ignore */ }
  };
}
