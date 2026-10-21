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
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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

  const userDir = path.join('/tmp', 'abyss-capture-profile');
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
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
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
  let target = null;
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch {
      /* not up yet */
    }
  }
  if (!target) {
    console.error('[capture] DevTools endpoint never came up.\n', stderr.slice(-800));
    chrome.kill();
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

  function send(method, params = {}) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 60000);
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
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
    const res = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const file = path.join(OUT, `${name}.png`);
    await writeFile(file, Buffer.from(res.data, 'base64'));
    console.log('[capture] wrote', file);
    return file;
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
    return JSON.stringify({
      ok: true, size: buf.length, magic, name,
      // GLB header: bytes 0-3 magic 'glTF', 4-7 version, 8-11 total length.
      version: buf[4] | (buf[5] << 8) | (buf[6] << 16) | (buf[7] << 24),
      declaredLength: buf[8] | (buf[9] << 8) | (buf[10] << 16) | (buf[11] << 24),
      b64: btoa(bin),
    });
  })()`);
  const glbInfo = JSON.parse(glb);
  results.steps.push({
    step: 'glb-export',
    pass: glbInfo.ok === true && glbInfo.magic === 'glTF',
    value: { size: glbInfo.size, magic: glbInfo.magic, name: glbInfo.name },
  });

  if (glbInfo.ok) {
    const modelDir = path.resolve('models');
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
  process.exit(results.failCount === 0 ? 0 : 5);
}

main().catch(async (err) => {
  console.error('[capture] failed:', err);
  process.exit(1);
});
