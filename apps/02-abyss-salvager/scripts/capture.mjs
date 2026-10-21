/**
 * Headless capture harness.
 *
 * Drives the running dev server in headless Chrome over the DevTools
 * Protocol so we can capture desktop-resolution screenshots of real
 * interaction states, and assert that each control actually changes the
 * scene. Uses only local tooling — no external services.
 *
 *   node scripts/capture.mjs [baseUrl] [outDir]
 */

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = process.argv[2] || 'http://127.0.0.1:4312/';
const OUT = process.argv[3] || path.resolve('screenshots');
const WIDTH = 1680;
const HEIGHT = 1050;
const PORT = 9333;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!existsSync(CHROME)) {
    console.error('[capture] Chrome not found at', CHROME);
    process.exit(2);
  }
  await mkdir(OUT, { recursive: true });

  // A unique profile per run. Reusing a fixed --user-data-dir makes Chrome
  // attach to a leftover instance that still holds the debugging port, which
  // is the usual cause of "bind() failed: Address already in use".
  const userDir = await mkdtemp(path.join(tmpdir(), 'abyss-capture-'));
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${userDir}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      // Use the real GPU when the host exposes one. Software rendering
      // (SwiftShader) makes the very first frame take tens of seconds with
      // bloom + shadows, which starves the CDP evaluate channel.
      // `--use-angle=metal` pins the macOS backend explicitly: without it a
      // fresh profile can come up with no GL backend at all ("renderer: none")
      // and the app dies with "Error creating WebGL context.".
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--use-angle=metal',
      '--enable-unsafe-swiftshader',
      '--disable-dev-shm-usage',
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] }
  );

  let stderr = '';
  chrome.stderr.on('data', (d) => {
    stderr += d.toString();
  });

  // Wait for the DevTools endpoint.
  // Chrome may bind the debugging port on IPv4 (127.0.0.1) or fall back to IPv6
  // ([::1]) when the IPv4 socket is taken by a leftover process — polling only
  // 127.0.0.1 then hangs forever even though DevTools is up. Probe both.
  let target = null;
  const ENDPOINTS = [`http://127.0.0.1:${PORT}/json/list`, `http://[::1]:${PORT}/json/list`];
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint);
        const list = await res.json();
        target = list.find((t) => t.type === 'page');
        if (target) break;
      } catch {
        /* not up yet */
      }
    }
    if (target) break;
  }
  if (!target) {
    console.error('[capture] DevTools endpoint never came up.\n', stderr.slice(-800));
    chrome.kill();
    await rm(userDir, { recursive: true, force: true }).catch(() => {});
    process.exit(3);
  }

  // Minimal CDP client over the raw WebSocket (Node 22+ has a global WebSocket).
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let msgId = 0;
  const pending = new Map();
  const events = [];

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  });

  function send(method, params = {}, timeoutMs = 120000) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, timeoutMs);
    });
  }

  /**
   * The CDP evaluate channel can starve for a long time when the host is busy
   * (other headless browsers competing for the GPU). Retry a few times before
   * giving up — a starved channel is not a failed assertion. The first attempt
   * gets the full timeout (a cold first frame can legitimately be slow);
   * retries use a shorter one so the run does not stall for minutes.
   */
  async function sendWithRetry(method, params = {}, attempts = 4) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
      try {
        return await send(method, params, i === 0 ? 120000 : 60000);
      } catch (e) {
        lastError = e;
        if (i < attempts - 1) {
          console.log(`[capture] retry ${i + 1}/${attempts - 1} after: ${e.message}`);
          await sleep(3000);
        }
      }
    }
    throw lastError;
  }

  async function evaluate(expression) {
    const res = await sendWithRetry('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        'eval error: ' +
          (res.exceptionDetails.exception?.description || res.exceptionDetails.text)
      );
    }
    return res.result.value;
  }
  async function shoot(name) {
    // Screenshots can stall while the GPU is busy with a heavy frame, so give
    // the capture a couple of chances before giving up.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
        const file = path.join(OUT, `${name}.png`);
        await writeFile(file, Buffer.from(res.data, 'base64'));
        console.log('[capture] wrote', file);
        return file;
      } catch (err) {
        console.warn(`[capture] screenshot ${name} attempt ${attempt + 1} failed: ${err.message}`);
        await sleep(1200);
      }
    }
    console.error('[capture] could not capture', name);
    return null;
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('[capture] loading', BASE);
  await send('Page.navigate', { url: BASE });
  await sleep(8000);

  // Report which GL backend the page actually got, so a slow software
  // rasteriser is never mistaken for an application bug.
  const glInfo = await evaluate(`(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return JSON.stringify({ renderer: 'none' });
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return JSON.stringify({
        renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      });
    } catch (e) { return JSON.stringify({ renderer: 'error: ' + e.message }); }
  })()`).catch((e) => JSON.stringify({ renderer: 'probe failed: ' + e.message }));
  console.log('[capture] GL backend:', glInfo);

  const consoleErrors = events
    .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => e.params.entry.text);
  const exceptions = events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails?.exception?.description || 'exception');

  const results = { consoleErrors, exceptions, steps: [] };

  const hasApi = await evaluate('!!window.__abyss');
  results.steps.push({ step: 'api-exposed', pass: hasApi });
  if (!hasApi) {
    console.error('[capture] window.__abyss missing — app failed to boot');
    await shoot('00-boot-failure');
    ws.close();
    chrome.kill();
    process.exit(4);
  }

  // --- baseline survey view ------------------------------------------------
  await sleep(1200);
  await shoot('01-survey-abyss');

  // --- the model really is 3D geometry ------------------------------------
  const geom = await evaluate(`(() => {
    const m = window.__abyss.machine;
    let tris = 0, meshes = 0, points = 0;
    m.root.traverse((o) => {
      if (!o.isMesh) return;
      meshes++;
      const g = o.geometry;
      tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
      points += g.attributes.position.count;
    });
    return JSON.stringify({ tris: Math.round(tris), meshes, points });
  })()`);
  const g = JSON.parse(geom);
  results.steps.push({
    step: 'real-3d-geometry-present',
    pass: g.tris > 20000 && g.meshes > 100,
    value: g,
  });

  // --- orbit + zoom (real pointer input on the canvas) --------------------
  const before = await evaluate(
    'JSON.stringify({ p: window.__abyss.stage.camera.position.toArray().map(v=>+v.toFixed(3)), d: +window.__abyss.stage.camera.position.distanceTo(window.__abyss.stage.controls.target).toFixed(3) })'
  );
  await send('Input.dispatchMouseEvent', {
    type: 'mousePressed', x: 840, y: 520, button: 'left', clickCount: 1, buttons: 1,
  });
  for (let i = 1; i <= 12; i++) {
    await send('Input.dispatchMouseEvent', {
      type: 'mouseMoved', x: 840 + i * 14, y: 520 + i * 4, button: 'left', buttons: 1,
    });
    await sleep(28);
  }
  await send('Input.dispatchMouseEvent', {
    type: 'mouseReleased', x: 840 + 168, y: 520 + 48, button: 'left', buttons: 0,
  });
  await sleep(700);
  const afterOrbit = await evaluate(
    'JSON.stringify({ p: window.__abyss.stage.camera.position.toArray().map(v=>+v.toFixed(3)), d: +window.__abyss.stage.camera.position.distanceTo(window.__abyss.stage.controls.target).toFixed(3) })'
  );
  const b = JSON.parse(before);
  const a = JSON.parse(afterOrbit);
  const moved =
    Math.abs(a.p[0] - b.p[0]) > 0.05 ||
    Math.abs(a.p[1] - b.p[1]) > 0.05 ||
    Math.abs(a.p[2] - b.p[2]) > 0.05;
  results.steps.push({ step: 'drag-orbits-camera', pass: moved, value: { before: b, after: a } });
  await shoot('02-after-orbit-drag');

  // Wheel to zoom in.
  await send('Input.dispatchMouseEvent', {
    type: 'mouseWheel', x: 840, y: 520, deltaX: 0, deltaY: -420,
  });
  await sleep(700);
  const afterZoom = await evaluate(
    '+window.__abyss.stage.camera.position.distanceTo(window.__abyss.stage.controls.target).toFixed(3)'
  );
  results.steps.push({
    step: 'wheel-zooms-camera',
    pass: Math.abs(afterZoom - a.d) > 0.05,
    value: { distBefore: a.d, distAfter: afterZoom },
  });
  await shoot('03-after-wheel-zoom');

  // Restore a known pose for the remaining captures.
  await evaluate('window.__abyss.cameraRig.apply("survey", true)');
  await sleep(600);

  // --- profile -------------------------------------------------------------
  await evaluate('window.__abyss.cameraRig.apply("profile", true)');
  await sleep(900);
  await shoot('04-profile');

  // --- crown head-on -------------------------------------------------------
  await evaluate('window.__abyss.cameraRig.apply("crown", true)');
  await sleep(900);
  await shoot('05-crown-head-on');
  const crownFraming = await evaluate(`(() => {
    const cam = window.__abyss.stage.camera;
    const p = new (window.__abyss.machine.root.position.constructor)(0.1, 0.4, 0);
    window.__abyss.machine.root.localToWorld(p);
    const v = p.clone().project(cam);
    return JSON.stringify({ x: +v.x.toFixed(3), y: +v.y.toFixed(3), z: +v.z.toFixed(3) });
  })()`);
  const cf = JSON.parse(crownFraming);
  results.steps.push({
    step: 'crown-view-frames-head',
    pass: Math.abs(cf.x) < 0.75 && Math.abs(cf.y) < 0.85 && cf.z < 1,
    value: cf,
  });

  // --- hopper / tail -------------------------------------------------------
  await evaluate('window.__abyss.cameraRig.apply("hopper", true)');
  await sleep(900);
  await shoot('06-hopper-tail');

  // --- exploded view -------------------------------------------------------
  await evaluate('window.__abyss.cameraRig.apply("survey", true); window.__abyss.applyParam("explode", 0.85)');
  await sleep(1400);
  await shoot('07-exploded');
  const explodeDelta = await evaluate(
    '(() => { const m = window.__abyss.machine; const plate = m.segments[8].plateGroup.children[0]; return plate.position.length(); })()'
  );
  results.steps.push({ step: 'explode-moves-parts', pass: explodeDelta > 0.05, value: explodeDelta });

  // --- x-ray ---------------------------------------------------------------
  await evaluate('window.__abyss.applyParam("explode", 0); window.__abyss.applyParam("xray", true)');
  await sleep(900);
  await shoot('08-xray');
  const xrayOpacity = await evaluate('window.__abyss.machine.materials.panel.opacity');
  results.steps.push({ step: 'xray-transparents-shell', pass: xrayOpacity < 0.3, value: xrayOpacity });

  // --- section -------------------------------------------------------------
  await evaluate('window.__abyss.applyParam("xray", false); window.__abyss.state.sectionMode = "longitudinal"; window.__abyss.applyParam("sectionMode", "longitudinal")');
  await sleep(700);
  await shoot('09-section-longitudinal');
  const clipped = await evaluate('!!window.__abyss.machine.materials.panel.clippingPlanes');
  results.steps.push({ step: 'section-clipping-enabled', pass: clipped === true, value: clipped });

  // --- crown transverse section -------------------------------------------
  await evaluate('window.__abyss.applyParam("sectionMode", "crown")');
  await sleep(700);
  await shoot('10-section-crown');
  const clippedCrown = await evaluate('!!window.__abyss.machine.materials.panel.clippingPlanes');
  results.steps.push({ step: 'crown-section-clipping', pass: clippedCrown === true, value: clippedCrown });

  // --- sonar theme ---------------------------------------------------------
  await evaluate('window.__abyss.applyParam("sectionMode", "off"); window.__abyss.applyParam("theme", "sonar")');
  await evaluate('window.__abyss.cameraRig.apply("plan", true)');
  await sleep(1600);
  await shoot('11-sonar-plan');
  const theme = await evaluate('window.__abyss.state.theme');
  results.steps.push({ step: 'theme-switch-applies', pass: theme === 'sonar', value: theme });

  // --- parameter rebuild ---------------------------------------------------
  await evaluate('window.__abyss.applyParam("theme", "abyss"); window.__abyss.applyParam("segmentCount", 12)');
  await sleep(1400);
  const segCount = await evaluate('window.__abyss.machine.segments.length');
  results.steps.push({ step: 'segment-count-rebuild', pass: segCount === 12, value: segCount });
  await evaluate('window.__abyss.cameraRig.apply("survey", true)');
  await sleep(900);
  await shoot('12-rebuild-12-segments');

  // --- reset ---------------------------------------------------------------
  await evaluate('window.__abyss.resetAll()');
  await sleep(1500);
  const afterReset = await evaluate(
    'JSON.stringify({ seg: window.__abyss.machine.segments.length, theme: window.__abyss.state.theme, explode: window.__abyss.state.explode, length: Math.round(window.__abyss.machine.lengthMetres) })'
  );
  results.steps.push({
    step: 'reset-restores-defaults',
    pass:
      afterReset.includes('"seg":18') &&
      afterReset.includes('abyss') &&
      afterReset.includes('"explode":0') &&
      afterReset.includes('"length":760'),
    value: afterReset,
  });
  await shoot('13-after-reset');

  // --- tool rail -----------------------------------------------------------
  const railInfo = await evaluate(`(() => {
    const rail = document.getElementById('tool-rail');
    const buttons = rail.querySelectorAll('button.tool-btn');
    const presets = rail.querySelectorAll('[data-preset]');
    return JSON.stringify({ buttons: buttons.length, presets: presets.length });
  })()`);
  const rail = JSON.parse(railInfo);
  results.steps.push({
    step: 'tool-rail-rendered',
    pass: rail.buttons >= 12 && rail.presets === 6,
    value: rail,
  });

  // --- 3D interaction: part selection / layers / assembly -------------------
  // 构件可选中
  const selection = JSON.parse(
    await evaluate(`(() => {
      const api = window.__abyss;
      const group = api.selectPart('carapace');
      const sel = api.getSelected();
      const panel = document.getElementById('sel-body');
      return JSON.stringify({
        group,
        hasSelection: !!sel,
        partGroup: sel ? sel.partGroup : null,
        meshes: sel ? sel.meshes : 0,
        triangles: sel ? sel.triangles : 0,
        panelText: panel ? panel.textContent.trim().slice(0, 40) : '',
        hasZh: panel ? /[\\u4e00-\\u9fa5]/.test(panel.textContent) : false,
        hasEn: panel ? /[A-Za-z]{4,}/.test(panel.textContent) : false,
      });
    })()`)
  );
  results.steps.push({
    step: 'part-selection-works',
    pass:
      selection.hasSelection &&
      selection.partGroup === 'carapace' &&
      selection.meshes > 0 &&
      selection.triangles > 0 &&
      selection.hasZh &&
      selection.hasEn,
    value: selection,
  });

  // 层级开关
  const layer = JSON.parse(
    await evaluate(`(() => {
      const api = window.__abyss;
      const countVisible = (group) => {
        let n = 0;
        api.machine.root.traverse((o) => {
          if (o.isMesh && o.userData.partGroup === group && o.visible) n++;
        });
        return n;
      };
      const before = countVisible('crown');
      api.setLayer('crown', false);
      const after = countVisible('crown');
      api.setLayer('crown', true);
      const restored = countVisible('crown');
      return JSON.stringify({ before, after, restored });
    })()`)
  );
  results.steps.push({
    step: 'layer-toggle-works',
    pass: layer.before > 0 && layer.after === 0 && layer.restored === layer.before,
    value: layer,
  });

  // 分步组装
  const assembly = JSON.parse(
    await evaluate(`(() => {
      const api = window.__abyss;
      const visible = () => {
        const m = api.machine;
        return {
          head: m.headGroup.visible,
          tail: m.tailGroup.visible,
          segs: m.segments.filter((s) => s.group.visible).length,
        };
      };
      api.setAssemblyStage(1);
      const s1 = visible();
      api.setAssemblyStage(2);
      const s2 = visible();
      api.setAssemblyStage(4);
      const s4 = visible();
      const stage = api.getAssemblyStage();
      return JSON.stringify({ s1, s2, s4, stage });
    })()`)
  );
  results.steps.push({
    step: 'assembly-step-works',
    pass:
      assembly.s1.tail === false &&
      assembly.s1.segs === 0 &&
      assembly.s2.segs === 6 &&
      assembly.s4.tail === true &&
      assembly.s4.segs === 18 &&
      assembly.stage === 4,
    value: assembly,
  });

  // 教学示意声明：模型内铭牌 + 界面卡片
  const disclaimer = JSON.parse(
    await evaluate(`(() => {
      const badge = window.__abyss.disclaimerBadge;
      const inScene = !!badge && !!badge.parent;
      const flag = document.getElementById('disc-flag');
      const text = document.getElementById('disc-text');
      const flagText = flag ? flag.textContent.trim() : '';
      const bodyText = text ? text.textContent.trim() : '';
      return JSON.stringify({
        inScene,
        badgeName: badge ? badge.name : null,
        flagText,
        hasFlag: flagText.includes('教学示意') && flagText.includes('非施工/工程模型'),
        hasBody: bodyText.includes('教学示意') && bodyText.includes('定性示意'),
        hasNotesLink: !!document.getElementById('disc-link'),
      });
    })()`)
  );
  results.steps.push({
    step: 'disclaimer-visible-in-model-and-ui',
    pass:
      disclaimer.inScene &&
      disclaimer.badgeName === 'teaching-disclaimer-badge' &&
      disclaimer.hasFlag &&
      disclaimer.hasBody &&
      disclaimer.hasNotesLink,
    value: disclaimer,
  });

  // --- bilingual annotation key coverage ------------------------------------
  const bilingual = JSON.parse(
    await evaluate(`(() => {
      const chips = Array.from(document.querySelectorAll('.anno'));
      const withZh = chips.filter((c) => /[\\u4e00-\\u9fa5]/.test(c.querySelector('.anno-cn')?.textContent || ''));
      const withEn = chips.filter((c) => /[A-Za-z]{3,}/.test(c.querySelector('.anno-en')?.textContent || ''));
      return JSON.stringify({ total: chips.length, zh: withZh.length, en: withEn.length });
    })()`)
  );
  results.steps.push({
    step: 'bilingual-annotations-present',
    pass: bilingual.total >= 14 && bilingual.zh === bilingual.total && bilingual.en === bilingual.total,
    value: bilingual,
  });

  // --- 3D 标注胶囊不与任何可见文字互相压盖（屏幕空间避让的回归守卫）---------
  const annoClearance = JSON.parse(
    await evaluate(`(() => {
      const isRendered = (el) => {
        if (!el) return false;
        if (typeof el.checkVisibility === 'function') {
          if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) {
            return false;
          }
        }
        let p = el.parentElement;
        while (p) {
          const st = getComputedStyle(p);
          if (parseFloat(st.opacity) === 0) return false;
          if (st.display === 'none' || st.visibility === 'hidden') return false;
          p = p.parentElement;
        }
        return true;
      };
      const ownTextRects = (node) => {
        const out = [];
        for (const c of node.childNodes) {
          if (c.nodeType !== 3) continue;
          if (!c.textContent || !c.textContent.trim()) continue;
          const parent = c.parentElement || node;
          if (!isRendered(parent)) continue;
          const range = document.createRange();
          range.selectNodeContents(c);
          for (const r of range.getClientRects()) if (r.width > 0 && r.height > 0) out.push(r);
        }
        return out;
      };
      const label = (n) => n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') +
        (typeof n.className === 'string' && n.className.trim()
          ? '.' + n.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
      const layer = document.querySelector('.annotation-layer');
      const inLayer = (n) => !!(layer && layer.contains(n));
      const hasOwnText = (n) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3 && c.textContent && c.textContent.trim()) return true;
        }
        return false;
      };

      // 标注胶囊的文字在 .anno-id / .anno-cn / .anno-en 上，要逐个取它们的行盒
      const chips = [];
      for (const chip of document.querySelectorAll('.anno')) {
        if (!isRendered(chip)) continue;
        const rects = [];
        for (const n of chip.querySelectorAll('*')) {
          if (!hasOwnText(n)) continue;
          for (const r of ownTextRects(n)) rects.push(r);
        }
        if (!rects.length) continue;
        chips.push({ el: label(chip), rects, txt: (chip.textContent || '').trim().slice(0, 24) });
      }
      // 页面里其它可见文字
      const others = [];
      for (const n of document.querySelectorAll('body *')) {
        if (inLayer(n)) continue;
        const own = [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent.trim()).join('');
        if (own.trim().length < 2) continue;
        if (!isRendered(n)) continue;
        const st = getComputedStyle(n);
        if (st.position === 'fixed') continue;
        const r = n.getBoundingClientRect();
        if (r.width < 12 || r.height < 8) continue;
        const rects = ownTextRects(n);
        if (!rects.length) continue;
        others.push({ el: label(n), txt: own.trim().replace(/\\s+/g, ' ').slice(0, 24), rects });
      }
      const painted = (A) => A.reduce((s, a) => s + a.width * a.height, 0);
      const hits = [];
      for (const a of chips) {
        for (const b of others) {
          let area = 0;
          for (const x of a.rects) for (const y of b.rects) {
            const ox = Math.min(x.right, y.right) - Math.max(x.left, y.left);
            const oy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
            if (ox > 0 && oy > 0) area += ox * oy;
          }
          if (area <= 4) continue;
          const smaller = Math.min(painted(a.rects), painted(b.rects));
          if (!smaller) continue;
          const ratio = area / smaller;
          if (ratio < 0.5) continue;
          hits.push({ anno: a.el, annoText: a.txt, other: b.el, otherText: b.txt, pct: Math.round(ratio * 100) });
        }
      }
      return JSON.stringify({ chips: chips.length, others: others.length, hitCount: hits.length, hits: hits.slice(0, 8) });
    })()`)
  );
  results.steps.push({
    step: 'annotation-avoids-visible-text',
    pass: annoClearance.chips > 0 && annoClearance.hitCount === 0,
    value: annoClearance,
  });

  // --- horizontal overflow at four viewports --------------------------------
  const overflow = [];
  for (const [w, h] of [
    [1440, 900],
    [1280, 800],
    [768, 1024],
    [390, 844],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sleep(700);
    const m = JSON.parse(
      await evaluate(
        'JSON.stringify({ sw: document.documentElement.scrollWidth, iw: window.innerWidth })'
      )
    );
    overflow.push({ w, ...m, ok: m.sw <= m.iw });
  }
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1680,
    height: 1050,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(600);
  results.steps.push({
    step: 'no-horizontal-overflow',
    pass: overflow.every((o) => o.ok),
    value: overflow,
  });

  // --- GLB export (intercept the download) ---------------------------------
  const glb = await evaluate(`(async () => {
    const api = window.__abyss;
    const origCreate = URL.createObjectURL;
    let captured = null;
    URL.createObjectURL = function (blob) { captured = blob; return origCreate.call(URL, blob); };
    const origClick = HTMLAnchorElement.prototype.click;
    let name = null;
    HTMLAnchorElement.prototype.click = function () { name = this.download; };
    await api.exportGLB();
    URL.createObjectURL = origCreate;
    HTMLAnchorElement.prototype.click = origClick;
    if (!captured) return JSON.stringify({ ok: false });
    const buf = new Uint8Array(await captured.arrayBuffer());
    const magic = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]);
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      bin += String.fromCharCode.apply(null, buf.subarray(i, i + chunk));
    }
    // Parse the JSON chunk so the export metadata can be asserted.
    let asset = null;
    try {
      const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      const total = dv.getUint32(8, true);
      let off = 12;
      while (off < total) {
        const len = dv.getUint32(off, true);
        const type = dv.getUint32(off + 4, true);
        if (type === 0x4e4f534a) {
          const text = new TextDecoder().decode(buf.subarray(off + 8, off + 8 + len));
          asset = JSON.parse(text).asset || null;
          break;
        }
        off += 8 + len;
      }
    } catch (e) {
      asset = null;
    }
    return JSON.stringify({
      ok: true, size: buf.length, magic, name,
      // GLB header: bytes 0-3 magic 'glTF', 4-7 version, 8-11 total length.
      version: buf[4] | (buf[5] << 8) | (buf[6] << 16) | (buf[7] << 24),
      declaredLength: buf[8] | (buf[9] << 8) | (buf[10] << 16) | (buf[11] << 24),
      extras: asset && asset.extras ? asset.extras : null,
      copyright: asset ? asset.copyright || null : null,
      b64: btoa(bin),
    });
  })()`);
  const glbInfo = JSON.parse(glb);
  results.steps.push({
    step: 'glb-export',
    pass: glbInfo.ok === true && glbInfo.magic === 'glTF',
    value: { size: glbInfo.size, magic: glbInfo.magic, name: glbInfo.name },
  });

  // 导出元数据必须携带教学示意声明
  const extras = glbInfo.extras || {};
  results.steps.push({
    step: 'glb-export-metadata-disclaimer',
    pass:
      !!extras.disclaimer_zh &&
      String(extras.disclaimer_zh).includes('教学示意') &&
      extras.isConstructionModel === false &&
      extras.isEngineeringModel === false &&
      extras.forcesAreQualitativeOnly === true,
    value: {
      disclaimer_zh: extras.disclaimer_zh || null,
      isConstructionModel: extras.isConstructionModel,
      isEngineeringModel: extras.isEngineeringModel,
      forcesAreQualitativeOnly: extras.forcesAreQualitativeOnly,
    },
  });

  if (glbInfo.ok) {
    // Write straight to the canonical location inside public/ so that a plain
    // `vite build` ships the very artifact we just verified.
    const modelDir = path.resolve('public', 'models');
    await mkdir(modelDir, { recursive: true });
    const glbPath = path.join(modelDir, 'abyss-salvager-ac-vii.glb');
    await writeFile(glbPath, Buffer.from(glbInfo.b64, 'base64'));
    console.log('[capture] wrote', glbPath, `(${(glbInfo.size / 1048576).toFixed(2)} MB)`);
    results.steps.push({
      step: 'glb-file-written',
      pass:
        glbInfo.magic === 'glTF' &&
        glbInfo.version === 2 &&
        glbInfo.declaredLength === glbInfo.size &&
        glbInfo.size > 100000,
      value: {
        path: glbPath,
        bytes: glbInfo.size,
        magic: glbInfo.magic,
        version: glbInfo.version,
        declaredLength: glbInfo.declaredLength,
      },
    });
  } else {
    results.steps.push({ step: 'glb-file-written', pass: false, value: 'export produced no blob' });
  }
  await sleep(700);
  await shoot('14-after-export');

  // --- clean view (UI hidden) ---------------------------------------------
  await evaluate('document.body.classList.add("ui-hidden")');
  await evaluate('window.__abyss.cameraRig.apply("follow", true)');
  await sleep(1200);
  await shoot('15-clean-follow');
  await evaluate('document.body.classList.remove("ui-hidden")');

  // --- new UI states: selection / assembly / layers -------------------------
  await evaluate('window.__abyss.cameraRig.apply("survey", true)');
  await sleep(900);
  await evaluate('window.__abyss.selectPart("carapace")');
  await sleep(500);
  await shoot('16-part-selected');

  await evaluate('window.__abyss.setAssemblyStage(2)');
  await sleep(700);
  await shoot('17-assembly-step-2');
  await evaluate('window.__abyss.setAssemblyStage(4)');
  await sleep(500);

  await evaluate('window.__abyss.setLayer("crown", false)');
  await sleep(700);
  await shoot('18-layer-crown-hidden');
  await evaluate('window.__abyss.setLayer("crown", true)');
  await sleep(400);

  // --- notes page: the second landing spot of the teaching notice -----------
  await send('Page.navigate', { url: `${BASE.replace(/\/$/, '')}/notes.html` });
  await sleep(2500);
  const notes = JSON.parse(
    await evaluate(`(() => {
      const body = document.body.textContent || '';
      const rows = document.querySelectorAll('#part-table tbody tr').length;
      return JSON.stringify({
        title: document.title,
        hasFlag: body.includes('教学示意，非施工/工程模型'),
        hasEn: body.includes('Teaching illustration'),
        hasForceNote: body.includes('定性示意'),
        rows,
        back: !!document.querySelector('a[href="./index.html"]'),
      });
    })()`)
  );
  results.steps.push({
    step: 'notes-page-disclaimer-and-part-table',
    pass: notes.hasFlag && notes.hasEn && notes.hasForceNote && notes.rows === 14 && notes.back,
    value: notes,
  });
  await shoot('19-notes-page');

  // Back to the main page for the final error snapshot.
  await send('Page.navigate', { url: BASE });
  await sleep(2500);

  results.finalConsoleErrors = events
    .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => e.params.entry.text);
  results.finalExceptions = events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails?.exception?.description || 'exception');

  results.passCount = results.steps.filter((s) => s.pass).length;
  results.failCount = results.steps.filter((s) => !s.pass).length;

  await writeFile(path.join(OUT, 'qa-results.json'), JSON.stringify(results, null, 2));
  console.log('\n[capture] QA results:\n' + JSON.stringify(results, null, 2));

  ws.close();
  chrome.kill();
  await sleep(300);
  // 临时 profile 用完即删，不留残留
  await rm(userDir, { recursive: true, force: true }).catch(() => {});
  process.exit(results.failCount === 0 ? 0 : 5);
}

main().catch(async (err) => {
  console.error('[capture] failed:', err);
  process.exit(1);
});
