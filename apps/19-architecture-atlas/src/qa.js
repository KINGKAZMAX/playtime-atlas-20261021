/**
 * Runtime self-test.
 *
 * Loaded ONLY when the page is opened with `?qa=1`, and dynamically imported
 * so it never reaches the production bundle.
 *
 * It drives the real UI — real clicks, real hash routing, real filters — and
 * reports a machine-readable result block that scripts/qa-runtime.mjs reads
 * out of the headless browser's DOM.
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function settle(ms = 260) {
  await wait(ms);
}

function navigate(hash) {
  location.hash = hash;
  return settle(340);
}

export async function runRuntimeQA() {
  const results = [];
  const check = (name, pass, detail = '') => {
    results.push({ name, pass: Boolean(pass), detail: String(detail) });
    return Boolean(pass);
  };
  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));
  const lang = () => document.documentElement.lang;

  // Uncaught errors are invisible to the DOM, so a click handler that throws
  // looks exactly like a button that does nothing. Collect them for the
  // whole run: the assembly play button threw on its first tick once, and
  // the only symptom was "the model never moved".
  const runtimeErrors = [];
  const noteError = (msg) => runtimeErrors.push(String(msg));
  window.addEventListener('error', (e) => noteError(e.message || e.error || 'error'));
  window.addEventListener('unhandledrejection', (e) => noteError(e.reason || 'rejection'));

  /**
   * Guard against a whole class of rendering bug: an element being handed to
   * `text:` instead of being inserted as a child, which renders the literal
   * string "[object HTMLOutputElement]". One real instance of this shipped
   * once (the assembly-step readout), so it gets a permanent check.
   */
  const artifacts = [];
  const assertNoObjectArtifacts = (where) => {
    const hits = (document.body.innerText.match(/\[object [A-Za-z]+\]/g) || []);
    if (hits.length) artifacts.push(`${where}: ${[...new Set(hits)].join(', ')}`);
  };

  // ---- 0. the shell mounted ------------------------------------------
  check('shell.topbar', Boolean(q('.topbar .brand')), 'brand present');
  check('shell.footer', Boolean(q('.footer-inner')), 'footer present');
  check('shell.hero', Boolean(q('.hero-title')), 'hero title present');

  // The first screen must not pull in the 3D runtime. This is captured
  // before any lab route is visited, so the assertion is about the entry
  // screen rather than about the rest of the session.
  const firstScreenResources = performance.getEntriesByType('resource').map((r) => r.name);
  check('network.firstScreenHasNoThree', !firstScreenResources.some((u) => /three/i.test(u)),
    firstScreenResources.filter((u) => /three/i.test(u)).slice(0, 3).join(' | ') || 'no three.js on the first screen');

  // ---- 1. hero stats match the data ----------------------------------
  const statValues = qa('.hero-stats dd').map((n) => Number(n.textContent));
  const statLabels = qa('.hero-stats dt').map((n) => n.textContent);
  check('hero.stats.count', statValues.length === 5, `labels=${statLabels.length} values=${statValues.join('/')}`);
  check('hero.stats.nonzero', statValues.every((v) => v > 0), statValues.join('/'));

  // ---- 2. the map drew one hotspot per case --------------------------
  const hotspots = qa('.hotspot');
  check('map.hotspots', hotspots.length >= 36, `hotspots=${hotspots.length}`);
  check('map.hotspots.focusable', hotspots.every((h) => h.getAttribute('tabindex') === '0' && h.getAttribute('aria-label')), 'all hotspots keyboard-reachable and labelled');

  // ---- 3. the catalog grid --------------------------------------------
  const cards = qa('.grid .card');
  check('catalog.cards', cards.length >= 36, `cards=${cards.length}`);
  check('catalog.deepLinks', cards.every((c) => (c.querySelector('.card-link')?.getAttribute('href') || '').startsWith('#/case/')), 'every card links to a case route');

  // ---- 4. the era axis -------------------------------------------------
  const eras = qa('.era-col');
  check('timeline.eras', eras.length === 10, `eras=${eras.length}`);

  // ---- 5. the region list ----------------------------------------------
  const regions = qa('.region-list li');
  check('atlas.regions', regions.length === 9, `regions incl. all=${regions.length}`);

  // ---- 6. filtering actually filters ----------------------------------
  const before = qa('.grid .card').length;
  // Filter chips follow the current language, so look the region up by name
  // rather than matching a literal label. A chip holds its name plus a
  // count, so the name is read from the first span.
  const chipName = (c) => (c.querySelector('span:not(.count)')?.textContent || '').trim();
  const northChip = qa('.filter-group .chip').find((c) => /^(华北|North China)$/.test(chipName(c)));
  if (northChip) {
    northChip.click();
    await settle();
    const after = qa('.grid .card').length;
    check('filter.region', after > 0 && after < before, `before=${before} after=${after}`);
    q('.filter-reset')?.click();
    await settle();
    check('filter.reset', qa('.grid .card').length === before, `restored=${qa('.grid .card').length}`);
  } else {
    check('filter.region', false, `north chip not found among ${qa('.filter-group .chip').length} chips`);
  }

  // ---- 6b. the dynamic strings follow the language --------------------
  // Round trip: English → Chinese → English, so the checks below start from
  // the same state again.
  const chipTextEn = qa('.filter-group .chip').map(chipName).slice(0, 4).join('|');
  const cardTagEn = q('.card .tag')?.textContent?.trim() || '';
  qa('.lang-switch button').find((b) => b.textContent === '中文')?.click();
  await settle(400);
  const chipTextZh = qa('.filter-group .chip').map(chipName).slice(0, 4).join('|');
  const cardTagZh = q('.card .tag')?.textContent?.trim() || '';
  qa('.lang-switch button').find((b) => b.textContent === 'EN')?.click();
  await settle(400);
  check('i18n.dynamicFiltersSwitch', chipTextEn !== chipTextZh && chipTextZh.length > 0,
    `en="${chipTextEn}" zh="${chipTextZh}"`);
  check('i18n.dynamicCardTagsSwitch', cardTagEn !== cardTagZh && cardTagZh.length > 0,
    `en="${cardTagEn}" zh="${cardTagZh}"`);

  // ---- 7. language switching -------------------------------------------
  const enTitle = q('.hero-title .zh')?.textContent;
  const zhButton = qa('.lang-switch button').find((b) => b.textContent === '中文');
  zhButton?.click();
  await settle(400);
  const zhTitle = q('.hero-title .zh')?.textContent;
  check('i18n.switch', lang() === 'zh-Hans' && zhTitle !== enTitle && /[\u4e00-\u9fa5]/.test(zhTitle || ''), `lang=${lang()} en="${enTitle}" zh="${zhTitle}"`);
  const zhBody = document.body.innerText;
  check('i18n.chineseRendered', /构筑华夏/.test(zhBody), 'chinese site title present');

  // the URL carries the language, so the address bar alone is a deep link
  const langParam = new URLSearchParams(location.search).get('lang');
  check('i18n.urlParam', langParam === 'zh', `?lang=${langParam}`);

  qa('.lang-switch button').find((b) => b.textContent === 'EN')?.click();
  await settle(400);
  check('i18n.switchBack', lang() === 'en', `lang=${lang()}`);
  check('i18n.urlParamBack', new URLSearchParams(location.search).get('lang') === 'en', `?lang=${new URLSearchParams(location.search).get('lang')}`);

  // ---- 8. hash routing --------------------------------------------------
  const firstCase = q('.grid .card .card-link')?.getAttribute('href')?.replace('#', '');
  await navigate(firstCase || '#/case/forbidden-city-hall-of-supreme-harmony');
  check('route.case', Boolean(q('.detail-title')), q('.detail-title')?.textContent || 'no detail');
  check('route.case.sources', qa('.source-list li').length > 0, `${qa('.source-list li').length} sources`);
  check('route.case.figures', Boolean(q('.detail-figure svg')), 'schematic drawing present');
  assertNoObjectArtifacts('case');

  await navigate('#/labs');
  check('route.labs', qa('.lab-card').length === 6, `labs=${qa('.lab-card').length}`);

  await navigate('#/lab/dougong');
  // The lab loads three.js and the model chunk on demand, then builds the
  // geometry. A fixed sleep is a race — on a phone-width viewport the chunk
  // fetch alone can outlast it. Wait for the stage to actually appear.
  let stageReady = false;
  for (let i = 0; i < 60 && !stageReady; i += 1) {
    await settle(250);
    stageReady = Boolean(q('.lab-canvas-wrap canvas') || q('.lab-fallback:not([hidden])'));
  }
  const hasCanvas = Boolean(q('.lab-canvas-wrap canvas'));
  const hasFallback = Boolean(q('.lab-fallback:not([hidden])'));
  check('route.lab.stage', stageReady && (hasCanvas || hasFallback), `canvas=${hasCanvas} fallback=${hasFallback}`);
  check('route.lab.panel', qa('.part-list button').length > 0, `${qa('.part-list button').length} parts listed`);
  check('route.lab.notice', /教学示意/.test(document.body.innerText) || /Teaching schematic/.test(document.body.innerText), 'teaching notice shown');
  assertNoObjectArtifacts('lab');

  // ---- 3b. assembly steps ----------------------------------------------
  // Three defects shipped here once and none of them is visible in a
  // screenshot of a static model: the readout showed "Step 6 of 5" (index
  // past the end of the list), "Play assembly" threw on its first tick, and
  // the assembly target was one step too high so the NEXT step's parts
  // appeared early. All three are asserted here.
  const readout = () => (q('.step-readout')?.textContent || '').trim();
  const parseStep = (s) => {
    const m = /(\d+)\s*(?:\/|of|、)\s*(\d+)/.exec(s);
    return m ? { i: Number(m[1]), n: Number(m[2]) } : null;
  };
  const stepItems = qa('.step-assembly li');
  const stepCount = stepItems.length;
  const atRest = parseStep(readout());
  check('lab.stepListPresent', stepCount >= 4 && stepCount <= 6, `steps=${stepCount}`);
  check('lab.stepReadoutInRange',
    Boolean(atRest) && atRest.i >= 1 && atRest.i <= atRest.n && atRest.n === stepCount,
    `readout="${readout()}" steps=${stepCount}`);
  check('lab.initialStepIsLast', Boolean(atRest) && atRest.i === stepCount,
    `readout="${readout()}" of ${stepCount}`);

  const prevBtn = qa('.lab-panel button').find((b) => /previous|上一步/i.test(b.getAttribute('aria-label') || ''));
  const nextBtn = qa('.lab-panel button').find((b) => /next|下一步/i.test(b.getAttribute('aria-label') || ''));
  const errBefore = runtimeErrors.length;
  if (prevBtn) {
    const before = readout();
    prevBtn.click();
    await settle(160);
    const afterPrev = parseStep(readout());
    check('lab.prevStepDecrements', Boolean(afterPrev) && Boolean(atRest) && afterPrev.i === atRest.i - 1,
      `"${before}" → "${readout()}"`);
  } else {
    check('lab.prevStepDecrements', false, 'previous-step button not found');
  }
  if (nextBtn) {
    nextBtn.click();
    await settle(160);
    const afterNext = parseStep(readout());
    check('lab.nextStepRestores', Boolean(afterNext) && Boolean(atRest) && afterNext.i === atRest.i,
      `readout="${readout()}"`);
  } else {
    check('lab.nextStepRestores', false, 'next-step button not found');
  }

  // Play the whole assembly and watch the readout. It must never leave
  // 1..n, and it must walk forward through the steps.
  const playBtn = qa('.lab-panel button').find((b) => /play assembly|播放组装/i.test(b.textContent || ''));
  const seenSteps = new Set();
  const badReadouts = [];
  if (playBtn) {
    playBtn.click();
    for (let i = 0; i < 70; i += 1) {
      await settle(200);
      const txt = readout();
      const r = parseStep(txt);
      if (r) {
        seenSteps.add(r.i);
        if (r.i < 1 || r.i > r.n) badReadouts.push(txt);
      } else if (!/not started|尚未开始/i.test(txt)) {
        badReadouts.push(txt);
      }
      if (!/pause|暂停/i.test(playBtn.textContent || '')) break;
    }
    check('lab.playNeverOutOfRange', badReadouts.length === 0,
      badReadouts.slice(0, 3).join(' | ') || `walked ${[...seenSteps].join(',')}`);
    check('lab.playReachesLastStep', seenSteps.has(stepCount),
      `walked ${[...seenSteps].join(',')} of ${stepCount}`);
  } else {
    check('lab.playNeverOutOfRange', false, 'play button not found');
    check('lab.playReachesLastStep', false, 'play button not found');
  }
  check('lab.playNoUncaughtError', runtimeErrors.length === errBefore,
    runtimeErrors.slice(errBefore).join(' | ') || 'no uncaught error while playing the assembly');

  await navigate('#/glossary');
  check('route.glossary', qa('.gloss-item').length >= 40, `terms=${qa('.gloss-item').length}`);
  assertNoObjectArtifacts('glossary');

  await navigate('#/quiz');
  check('route.quiz', Boolean(q('.quiz-shell')), 'quiz shell present');
  q('.quiz-actions .btn-primary')?.click();
  await settle();
  check('route.quiz.start', qa('.quiz-opt').length === 4, `options=${qa('.quiz-opt').length}`);
  qa('.quiz-opt')[0]?.click();
  await settle();
  check('route.quiz.answer', Boolean(q('.quiz-explain:not([hidden])')), 'explanation shown');

  await navigate('#/saved');
  check('route.saved', Boolean(q('.saved-tools')), 'saved page present');

  await navigate('#/sources');
  check('route.sources', qa('.src-card').length > 0, `${qa('.src-card').length} source cards`);
  assertNoObjectArtifacts('sources');

  // ---- 9. favourites persist -------------------------------------------
  await navigate('#/catalog');
  const favBtn = q('.card-fav');
  favBtn?.click();
  await settle();
  const saved = JSON.parse(localStorage.getItem('built-in-china:v1') || '{}');
  check('favourites.persist', Array.isArray(saved.favourites) && saved.favourites.length === 1, JSON.stringify(saved.favourites));
  favBtn?.click();
  await settle();

  // ---- 10. no external network requests ---------------------------------
  const resources = performance.getEntriesByType('resource').map((r) => r.name);
  const external = resources.filter((u) => {
    try { return new URL(u, location.href).origin !== location.origin; } catch { return true; }
  });
  check('network.noExternal', external.length === 0, external.slice(0, 5).join(' | '));
  // three.js is expected to be present by now — a lab route was visited —
  // but it must NOT have been in the first screen's resource list.
  check('network.threeOnlyAfterLab', resources.some((u) => /three/i.test(u))
    ? firstScreenResources.some((u) => /three/i.test(u))
      ? 'three.js was already in the first screen'
      : 'three.js loaded only after entering a lab'
    : 'three.js was never loaded (no lab route visited)',
    resources.some((u) => /three/i.test(u)) ? 'loaded later' : 'not loaded');

  // ---- 11. accessibility basics -----------------------------------------
  check('a11y.lang', lang() === 'en' || lang() === 'zh-Hans', `lang=${lang()}`);
  check('a11y.skipLink', Boolean(q('.skip-link')), 'skip link present');
  check('a11y.mainLandmark', Boolean(q('main#main')), 'main landmark present');
  check('a11y.h1', qa('h1').length >= 1, `${qa('h1').length} h1`);
  const unlabelled = qa('button').filter((b) => {
    const text = (b.textContent || '').trim();
    return !text && !b.getAttribute('aria-label') && !b.getAttribute('title');
  });
  check('a11y.buttonsLabelled', unlabelled.length === 0, `${unlabelled.length} unlabelled buttons`);

  await navigate('#/');
  await settle(300);
  assertNoObjectArtifacts('home');

  check('render.noObjectArtifacts', artifacts.length === 0,
    artifacts.length ? artifacts.join(' | ') : 'no [object ...] artifacts on any route');

  const passed = results.filter((r) => r.pass).length;
  return { passed, total: results.length, results };
}
