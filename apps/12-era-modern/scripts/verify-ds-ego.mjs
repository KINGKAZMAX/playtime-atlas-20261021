/* ==========================================================================
 * 设计系统机械验收 · Ego 驱动
 * --------------------------------------------------------------------------
 * 与 scripts/verify-ds.mjs 共用同一套断言（scripts/lib/ds-probes.mjs），
 * 区别只在浏览器驱动方式：
 *   verify-ds.mjs      —— 自带 headless Chrome + 原生 CDP（零第三方依赖，可在 CI 跑）
 *   verify-ds-ego.mjs  —— 走 Ego 浏览器（用户受管浏览器，遵循长期约定）
 *
 * 运行方式（Ego 的 nodejs 运行时不继承 shell 环境变量，目标地址写在
 * scripts/ds-verify.config.json）：
 *   # 路径含中文时不要把 import 语句放进 -e 参数（Ego 会弄坏非 ASCII），
 *   # 走 stdin + 百分号编码的 file URL：
 *   printf 'await import("file:///<百分号编码的绝对路径>/scripts/verify-ds-ego.mjs");\n' \
 *     | ego-browser nodejs
 *   或直接用转交壳：PRISM_BASE="..." node scripts/verify-ds.mjs
 *
 * 退出码：0 = 无失败项（允许警告）；1 = 存在失败项；2 = 环境或服务不可用。
 * ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ROUTES, VIEWPORTS, COMPONENTS, CONTRAST_TARGETS,
  TITLE_SELECTORS, BODY_TEXT_SELECTORS, TOKEN_CANDIDATES,
  PAGE_STATE_EXPR, A11Y_EXPR, RM_EXPR, NOWRAP_EXPR, CJK_EXPR,
  CANVAS_PROBE_EXPR, JUDGE_PROBE_EXPR, LEGEND_PROBE_EXPR, FONTS_EXPR,
  extractBlock, parseDecls, normValue, normFontStack, resolveVars,
  COLOR_VARS, CANVAS_VARS, SECTION_VARS, TOKEN_MAP, flattenTokens,
  FONT_CDN_RE,
} from './lib/ds-probes.mjs';
import {
  HALL_PROBE_EXPR, SETTINGS_PROBE_EXPR, GAME_STATE_EXPR,
  ATRIUM_PROBE_EXPR, HALO_PROBE_EXPR, STORAGE_PROBE_EXPR,
} from './lib/ds-gameplay.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE_DIR = path.join(ROOT, 'evidence');
const SHOT_DIR = path.join(EVIDENCE_DIR, 'ds');
const REPORT_FILE = path.join(EVIDENCE_DIR, 'ds-verification-ego.json');
const TOKENS_JSON = path.resolve(ROOT, '..', '16-design-system', 'design-tokens.json');

const CONFIG = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts', 'ds-verify.config.json'), 'utf8'));
const BASE = String(CONFIG.base || '').replace(/\/+$/, '');
const TASK_NAME = CONFIG.taskSpace || 'prism-era-ds-verify';

const report = {
  generatedAt: new Date().toISOString(),
  driver: 'ego-browser',
  base: BASE,
  viewports: [],
  checks: [],
  failures: [],
  warnings: [],
  errors: [],
  summary: {},
  routes: {},
  tokens: {},
  reducedMotion: {},
  fonts: {},
  network: {},
};

const ok = (name, detail, data) => {
  report.checks.push({ name, status: 'pass', detail, ...(data ? { data } : {}) });
  console.log(`✅ ${name} — ${detail}`);
};
const bad = (name, detail, data) => {
  report.checks.push({ name, status: 'fail', detail, ...(data ? { data } : {}) });
  report.failures.push(`${name}：${detail}`);
  console.log(`❌ ${name} — ${detail}`);
};
const warn = (name, detail, data) => {
  report.checks.push({ name, status: 'warn', detail, ...(data ? { data } : {}) });
  report.warnings.push(`${name}：${detail}`);
  console.log(`⚠️  ${name} — ${detail}`);
};
const finish = async (code) => {
  const passed = report.checks.filter((c) => c.status === 'pass').length;
  report.summary = {
    passed,
    total: report.checks.length,
    failures: report.failures.length,
    warnings: report.warnings.length,
    errors: report.errors.length,
    verdict: report.failures.length === 0 && report.errors.length === 0 ? 'PASS' : 'FAIL',
  };
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n${passed}/${report.checks.length} 通过（失败 ${report.failures.length} / 警告 ${report.warnings.length} / 异常 ${report.errors.length}）`);
  console.log(`报告：${REPORT_FILE}`);
  // 注意：Ego 的 nodejs 运行时会缓冲 stdout，直接 process.exit() 会把未刷新的输出截断，
  // 因此只设置 exitCode，让进程自然结束并把缓冲区刷出去。
  process.exitCode = code;
};

/* ------------------------------------------------------------------ *
 * 视口模拟
 * ------------------------------------------------------------------ */
/**
 * 视口模拟。注意 Ego 所在窗口带缩放，Emulation.setDeviceMetricsOverride 的 width
 * 是设备像素：
 *   · `mobile: true` 时实测 1:1 精确（1440 → innerWidth 1440）；
 *   · `mobile: false` 会被 Chromium 按 1/0.9 放大（1440 → 1600），
 *     从而同时污染横向溢出判定、对比度采样与截图尺寸。
 * 因此统一用 mobile:true，并保留一次自校正作为兜底。
 * 依据：批次 tools/ego-qa/MIGRATION.md §1 ③。
 */
async function setViewport(page, vp) {
  let w = vp.w;
  let h = vp.h;
  for (let i = 0; i < 4; i++) {
    await page.cdp('Emulation.setDeviceMetricsOverride', {
      width: w, height: h, deviceScaleFactor: vp.dpr, mobile: true,
    });
    await page.waitForTimeout(320);
    const cur = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
    if (!cur.w || !cur.h) break;
    if (cur.w === vp.w && cur.h === vp.h) {
      return { ok: true, iterations: i + 1, innerWidth: cur.w, innerHeight: cur.h };
    }
    w = Math.round(w * vp.w / cur.w);
    h = Math.round(h * vp.h / cur.h);
  }
  const cur = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
  return { ok: false, iterations: 4, innerWidth: cur.w, innerHeight: cur.h, want: [vp.w, vp.h] };
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */
async function main() {
  fs.mkdirSync(SHOT_DIR, { recursive: true });

  // ---- 服务可达性预检 ----
  let probeOk = false;
  let probeMsg = '';
  try {
    const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(8000) });
    probeOk = res.ok;
    probeMsg = `HTTP ${res.status}`;
  } catch (e) {
    report.errors.push(`服务不可达：${BASE}/（${e.message}）`);
    await finish(2);
    return;
  }
  console.log(`▶ 目标地址：${BASE}/  （${probeMsg}）`);

  // ---- Ego 任务空间（同一目标复用一个 TaskSpace）----
  const task = await taskSpace(TASK_NAME);
  console.log(`▶ TaskSpace：${task.spaceId}（${TASK_NAME}）`);
  const page = task.page('p1');

  const overflowFails = [];
  const componentSeen = {};
  const contrastSamples = [];
  const belowAAAll = [];
  const belowAAAAll = [];
  const nowrapAll = [];
  const cjkAll = { scanned: 0, cjkCount: 0, badSpacingCount: 0, badLineCount: 0, badSpacing: [], badLine: [] };
  const resourceUrls = [];
  const styleSheetUrls = [];

  /* ---- 阶段 A：四路由 × 四视口 ---- */
  console.log('\n▶ 阶段 A：视口与组件扫描');
  for (const vp of VIEWPORTS) {
    const vpInfo = { name: vp.name, want: [vp.w, vp.h], routes: {} };
    const vpRes = await setViewport(page, vp);
    vpInfo.emulated = vpRes;
    if (!vpRes.ok) {
      warn('视口模拟', `${vp.name} 未能精确落在 ${vp.w}px（实测 ${vpRes.innerWidth}px），该档测量结果仅供参考`);
    }
    for (const r of ROUTES) {
      await page.goto(`${BASE}/${r.hash}`);
      await page.waitForTimeout(500);
      // 导航可能重置 override，落地后复核一次
      const cur = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));
      if (cur.w !== vp.w || cur.h !== vp.h) {
        await setViewport(page, vp);
        await page.waitForTimeout(250);
      }

      const state = await page.evaluate(PAGE_STATE_EXPR);
      const a11y = await page.evaluate(A11Y_EXPR);
      const nowrap = await page.evaluate(NOWRAP_EXPR);
      const cjk = await page.evaluate(CJK_EXPR);
      const fonts = await page.evaluate(FONTS_EXPR);

      vpInfo.routes[r.name] = {
        innerWidth: state.innerWidth,
        innerHeight: state.innerHeight,
        horizontalOverflow: state.horizontalOverflow,
        appMounted: state.appMounted,
        stylesheets: state.stylesheets.length,
        totalRules: state.totalRules,
      };
      report.routes[r.name] = report.routes[r.name] || {};
      report.routes[r.name][vp.name] = {
        innerWidth: state.innerWidth, innerHeight: state.innerHeight,
        horizontalOverflow: state.horizontalOverflow,
        overflowCount: state.overflowCount,
        appMounted: state.appMounted,
        stylesheets: state.stylesheets,
        totalRules: state.totalRules,
        lang: state.lang, theme: state.theme, bodyClass: state.bodyClass,
        fontsLoaded: state.fontsLoaded,
      };

      if (state.horizontalOverflow) {
        overflowFails.push(`${r.name}@${vp.name}（scrollWidth ${state.docScrollWidth} > ${state.innerWidth}）`);
      }
      for (const [k, v] of Object.entries(state.rendered)) {
        if (v.present && !v.zero) componentSeen[k] = (componentSeen[k] || 0) + 1;
      }
      for (const s of a11y.samples) if (!s.missing) contrastSamples.push({ ...s, route: r.name, vp: vp.name });
      belowAAAll.push(...a11y.belowAA.map((x) => ({ ...x, route: r.name, vp: vp.name })));
      belowAAAAll.push(...a11y.belowAAA.map((x) => ({ ...x, route: r.name, vp: vp.name })));
      nowrapAll.push(...nowrap.map((x) => ({ ...x, route: r.name, vp: vp.name })));
      cjkAll.scanned += cjk.scanned;
      cjkAll.cjkCount += cjk.cjkCount;
      cjkAll.badSpacingCount += cjk.badSpacingCount;
      cjkAll.badLineCount += cjk.badLineCount;
      if (cjkAll.badSpacing.length < 20) cjkAll.badSpacing.push(...cjk.badSpacing);
      if (cjkAll.badLine.length < 20) cjkAll.badLine.push(...cjk.badLine);

      const res = await page.evaluate(
        () => performance.getEntriesByType('resource').map((e) => e.name));
      resourceUrls.push(...res);
      styleSheetUrls.push(...state.stylesheets.map((s) => s.href));
    }
    report.viewports.push(vpInfo);
  }

  /* ---- 阶段 B：reduced-motion（系统偏好 + 设置开关两条路径 × 四路由）---- */
  console.log('\n▶ 阶段 B：reduced-motion 双路径');
  const rmByRoute = {};
  let rmFails = [];
  for (const r of ROUTES) {
    await page.goto(`${BASE}/${r.hash}`);
    await page.waitForTimeout(500);
    await page.cdp('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await page.waitForTimeout(250);
    const rmSystem = await page.evaluate(RM_EXPR);
    const rmCanvas = await page.evaluate(CANVAS_PROBE_EXPR);
    const rmJudge = await page.evaluate(JUDGE_PROBE_EXPR);
    await page.cdp('Emulation.setEmulatedMedia', { features: [] });
    await page.waitForTimeout(150);
    // 设置开关路径：[data-rm="reduce"]
    await page.evaluate(() => document.documentElement.setAttribute('data-rm', 'reduce'));
    await page.waitForTimeout(250);
    const rmSwitch = await page.evaluate(RM_EXPR);
    await page.evaluate(() => document.documentElement.removeAttribute('data-rm'));

    rmByRoute[r.name] = {
      systemPreference: { durBase: rmSystem.durBase, entryDuration: rmSystem.entryDuration, maxDuration: rmSystem.maxDuration, matches: rmSystem.matches },
      dataRmSwitch: { durBase: rmSwitch.durBase, entryDuration: rmSwitch.entryDuration, maxDuration: rmSwitch.maxDuration },
      canvasStillPainted: rmCanvas.ok ? { ok: true, length: rmCanvas.length } : rmCanvas,
      judge: rmJudge,
    };
    if (rmSystem.maxDuration > 1) rmFails.push(`${r.name} 系统偏好路径最大动效 ${rmSystem.maxDuration}ms`);
    if (rmSwitch.maxDuration > 1) rmFails.push(`${r.name} 设置开关路径最大动效 ${rmSwitch.maxDuration}ms`);
    if (!rmSystem.matches) rmFails.push(`${r.name} 系统偏好未生效`);
  }
  report.reducedMotion = rmByRoute;
  // 画布是否仍在绘制、HUD 判定文本是否仍在（取有画布的路由）
  const painted = Object.values(rmByRoute).filter((x) => x.canvasStillPainted && x.canvasStillPainted.ok);
  const judged = Object.values(rmByRoute).filter((x) => x.judge && x.judge.hasHud);
  if (!painted.length) rmFails.push('降级后没有任何路由的画布在绘制');
  if (!judged.length) rmFails.push('降级后 HUD 判定文本缺失');
  if (rmFails.length) bad('reduced-motion 关闭动效', rmFails.slice(0, 4).join(' | '));
  else ok('reduced-motion 关闭动效',
    `四条路由 × 两条路径（系统偏好 / [data-rm="reduce"]）最大动效均为 1ms；`
    + `画布仍绘制（${painted.length} 个路由），HUD 判定文本仍在（${judged.length} 个路由）`);

  /* ---- 阶段 C：玩法可读性（图例 + 折光阁）---- */
  console.log('\n▶ 阶段 C：玩法可读性');
  await page.goto(`${BASE}/${ROUTES[2].hash}`);
  await page.waitForTimeout(900);
  const legend = await page.evaluate(LEGEND_PROBE_EXPR);
  report.legend = legend;
  if (legend.total >= 3) ok('玩法可读性', `折光阁图例色样齐全（${Object.keys(legend.found).filter((c) => legend.found[c] > 0).join(' / ')}）`);
  else bad('玩法可读性', `图例色样缺失，命中 ${legend.total}/3`);

  /* ---- 阶段 C2：玩法可玩性（替换此前依赖 Playwright 的自建 QA）---- */
  console.log('\n▶ 阶段 C2：玩法可玩性');
  // 玩法交互在**桌面档**进行：阶段 A 结束时视口停在 390px，窄屏下顶栏与
  // 折叠区会收起，控件不可点。响应式判定已在阶段 A 完成，这里只看功能。
  await setViewport(page, VIEWPORTS[0]);
  const gameplay = {};
  const gfails = [];

  // —— 大厅：时间轴 / 来源链接 / 纯文本目录 / 展项卡 ——
  await page.goto(`${BASE}/${ROUTES[0].hash}`);
  await page.waitForTimeout(600);
  const hall = await page.evaluate(HALL_PROBE_EXPR);
  gameplay.hall = hall;
  if (hall.exhibitCards !== 3) gfails.push(`展项卡 ${hall.exhibitCards} 张（应为 3）`);
  if (hall.timelineItems < 20) gfails.push(`时间轴条目 ${hall.timelineItems} 条（应 ≥20）`);
  if (hall.sourceLinks < 23) gfails.push(`来源链接 ${hall.sourceLinks} 条（应 ≥23）`);
  if (hall.catalogItems < 26) gfails.push(`纯文本目录 ${hall.catalogItems} 条（应 ≥26）`);
  if (!hall.settingsButton) gfails.push('设置面板入口缺失');

  // —— 设置面板：开关数量 + Esc 关闭 ——
  try {
    await page.click('loc=css:#open-settings');
    await page.waitForTimeout(400);
    const settings = await page.evaluate(SETTINGS_PROBE_EXPR);
    gameplay.settings = settings;
    if (!settings.open) gfails.push('设置面板未打开');
    else if (settings.toggleCount < 4) gfails.push(`设置开关 ${settings.toggleCount} 个（应 ≥4）`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const after = await page.evaluate(SETTINGS_PROBE_EXPR);
    gameplay.settingsClosedByEsc = !after.open;
    if (after.open) gfails.push('Esc 未关闭设置面板');
  } catch (e) {
    gfails.push(`设置面板交互异常：${e.message}`);
  }

  // —— 脉冲走廊：开始 / 画布绘制 / 判定 / 暂停 / 重开 ——
  await page.goto(`${BASE}/${ROUTES[1].hash}`);
  await page.waitForTimeout(700);
  const pulseBefore = await page.evaluate(GAME_STATE_EXPR);
  gameplay.pulseBefore = pulseBefore;
  if (!pulseBefore.hasGameRoot) gfails.push('脉冲舞台缺少 [data-game-root]');
  if (!pulseBefore.gameRootFocusable) gfails.push('脉冲舞台缺少 tabindex（键盘不可达）');
  try {
    await page.click('loc=css:[data-control="start"]');
    // 状态机：idle → countdown → playing，实测需要 ~3s
    await page.waitForTimeout(3400);
    const playing = await page.evaluate(GAME_STATE_EXPR);
    gameplay.pulsePlaying = playing;
    if (playing.state !== 'playing') gfails.push(`点击开始后 state=${playing.state}（应为 playing）`);
    if (!playing.canvasPainted) gfails.push('节奏画布未实际绘制');
    if (!/极准|很准|尚可|失手/.test(playing.hudText || '')) gfails.push('HUD 判定四类文本缺失');
  } catch (e) {
    gfails.push(`脉冲开始流程异常：${e.message}`);
  }
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const paused = await page.evaluate(GAME_STATE_EXPR);
    gameplay.pulsePaused = paused;
    if (paused.state !== 'paused') gfails.push(`Esc 后 state=${paused.state}（应为 paused）`);
  } catch (e) {
    gfails.push(`脉冲暂停流程异常：${e.message}`);
  }

  // —— 折光阁：WebGL / 关卡页签 / 控件 / 进度存档 ——
  await page.goto(`${BASE}/${ROUTES[2].hash}`);
  await page.waitForTimeout(1200);
  const atrium = await page.evaluate(ATRIUM_PROBE_EXPR);
  gameplay.atrium = atrium;
  if (!atrium.canvas) gfails.push('折光阁 3D 画布缺失');
  else if (!atrium.webgl) gfails.push('折光阁 WebGL 上下文不可用');
  if (atrium.tabs < 4) gfails.push(`折光阁关卡页签 ${atrium.tabs} 个（应 ≥4）`);
  if (!atrium.controls.hint || !atrium.controls.undo || !atrium.controls.reset) {
    gfails.push('折光阁「提示 / 撤销 / 重置」控件缺失');
  }  if (!atrium.progressKeys.length) gfails.push('折光阁进度未写入 localStorage');

  // —— 光环台：诚实声明 / 设备支持 / WebXR 实测 ——
  await page.goto(`${BASE}/${ROUTES[3].hash}`);
  await page.waitForTimeout(1200);
  const halo = await page.evaluate(HALO_PROBE_EXPR);
  gameplay.halo = halo;
  // 点一下 WebXR 检测按钮，让 .device-status 填入浏览器真实返回值
  try {
    await page.click('loc=css:[data-control="detect-vr"]');
    await page.waitForTimeout(700);
    gameplay.haloAfterDetect = await page.evaluate(HALO_PROBE_EXPR);
    gameplay.halo = gameplay.haloAfterDetect;
  } catch (e) {
    gfails.push(`光环台 WebXR 检测按钮点击异常：${e.message}`);
  }
  if (!halo.canvas) gfails.push('光环台 3D 画布缺失');
  if (!halo.disclaimerPresent) gfails.push('光环台缺少「桌面端交互演示 / 不支持 VR 头显」声明');
  if (halo.saysVrSupported) gfails.push('光环台出现「支持 VR / 已适配头显 / 沉浸式体验」虚假表述');
  if (halo.deviceRows < 3) gfails.push(`光环台设备支持状态表 ${halo.deviceRows} 行（应 ≥3）`);
  if (!halo.webxrButton) gfails.push('光环台缺少 WebXR 检测按钮');
  if (!/immersive-vr/.test(halo.webxrResult || '')) {
    gfails.push(`光环台 WebXR 实测未返回结果（${(halo.webxrResult || '').slice(0, 40)}）`);
  }

  // —— 存档键 ——
  const storage = await page.evaluate(STORAGE_PROBE_EXPR);
  gameplay.storage = storage;
  if (!storage.keys.length) gfails.push('localStorage 未写入 prismera.* 存档');

  report.gameplay = gameplay;
  if (!gfails.length) {
    ok('玩法可玩性',
      `大厅展项卡 ${hall.exhibitCards} 张 / 时间轴 ${hall.timelineItems} 条 / 来源链接 ${hall.sourceLinks} 条 / 纯文本目录 ${hall.catalogItems} 条；`
      + `设置开关 ${gameplay.settings ? gameplay.settings.toggleCount : 0} 个且 Esc 可关；`
      + `脉冲 state=playing→paused 且画布已绘制（${gameplay.pulsePlaying ? gameplay.pulsePlaying.canvasLen : 0} 字节）；`
      + `折光阁 WebGL 可用、关卡页签 ${atrium.tabs} 个；`
      + `光环台诚实声明在位；存档键 ${storage.keys.join(' / ')}`);
  } else {
    bad('玩法可玩性', gfails.slice(0, 6).join(' | '));
  }

  /* ---- 阶段 D：令牌一致性 + 字体栈顺序（Node 侧）---- */
  console.log('\n▶ 阶段 D：令牌与字体栈');
  let tokensCss = null;
  let tokensUrl = null;
  for (const cand of TOKEN_CANDIDATES) {
    const url = `${BASE}${cand}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes('--ds-')) { tokensCss = text; tokensUrl = url; break; }
    } catch { /* 继续下一个候选 */ }
  }
  let tokensJson = null;
  try {
    tokensJson = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));
  } catch (e) {
    report.errors.push(`design-tokens.json 读取失败：${e.message}`);
  }
  const flatTokens = tokensJson ? flattenTokens(tokensJson) : [];
  const tokenByPath = new Map(flatTokens.map((t) => [t.path, t]));

  if (!tokensCss) {
    bad('令牌一致性', `未找到可用的令牌文件（尝试：${TOKEN_CANDIDATES.join('、')}），无法与 design-tokens.json 比对`);
    bad('字体栈顺序', '缺少令牌文件，无法解析 --ds-font-display / --ds-font-text');
  } else {
    const rootDecls = parseDecls(extractBlock(tokensCss, ':root'));
    const darkDecls = parseDecls(extractBlock(tokensCss, '[data-ds-theme="dark"]'));
    const map = [...TOKEN_MAP];
    for (const [k, v] of Object.entries(COLOR_VARS)) {
      map.push([`color.light.${k}`, v, 'light']);
      map.push([`color.dark.${k}`, v, 'dark']);
    }
    for (const [k, v] of Object.entries(CANVAS_VARS)) map.push([`color.canvas.${k}`, v, 'light']);
    for (const [k, [v, theme]] of Object.entries(SECTION_VARS)) map.push([`color.section.${k}`, v, theme]);

    const mismatches = [];
    const missingVars = [];
    const unmapped = [];
    const compared = new Set();
    for (const [jpath, cssVar, theme, kind] of map) {
      const tok = tokenByPath.get(jpath);
      if (!tok) { unmapped.push(jpath); continue; }
      const decls = theme === 'dark' ? darkDecls : rootDecls;
      const cssRaw = decls.get(cssVar);
      if (cssRaw === undefined) {
        if (theme === 'dark' && !darkDecls.size) { unmapped.push(jpath + '(无深色块)'); continue; }
        missingVars.push(`${cssVar}（来自 ${jpath}）`);
        continue;
      }
      compared.add(cssVar);
      const a = kind === 'font'
        ? normFontStack(resolveVars(cssRaw, decls))
        : normValue(resolveVars(cssRaw, decls));
      const b = kind === 'font'
        ? normFontStack(resolveVars(String(tok.value), decls))
        : normValue(resolveVars(String(tok.value), decls));
      if (a !== b) {
        mismatches.push({
          cssVar, jsonPath: jpath, kind: kind || 'value',
          css: cssRaw.trim(), json: String(tok.value),
          cssNormalized: a, jsonNormalized: b,
          severity: kind === 'font' ? 'warn' : 'fail',
        });
      }
    }
    const hardFails = mismatches.filter((m) => m.severity === 'fail');
    const softFails = mismatches.filter((m) => m.severity === 'warn');
    report.tokens = {
      url: tokensUrl, jsonFile: TOKENS_JSON,
      jsonTokenCount: flatTokens.length, mappedCount: map.length, comparedCount: compared.size,
      cssRootVarCount: rootDecls.size, cssDarkVarCount: darkDecls.size,
      mismatches, missingVars, unmapped,
      normalization: '大小写不敏感、空白压缩、hex 小写、rgba 数值归一（rgba(20,17,15,.44) ≡ rgba(20, 17, 15, 0.44)，alpha=1 归为 rgb）、var() 引用在同一块内解析',
    };
    const detailParts = [];
    if (hardFails.length) {
      detailParts.push(`${hardFails.length} 处值不一致：`
        + hardFails.slice(0, 4).map((m) => `${m.cssVar} CSS=${m.css} / JSON=${m.json}`).join(' | '));
    }
    if (missingVars.length) {
      detailParts.push(`${missingVars.length} 个变量未声明：${missingVars.slice(0, 6).join(', ')}`);
    }
    if (!detailParts.length) {
      ok('令牌一致性',
        `JSON 令牌 ${flatTokens.length} 项 / 可映射 ${map.length} 项 / 实比 ${compared.size} 项，`
        + `:root 变量 ${rootDecls.size} 个，值全部一致（大小写、空白、rgba 写法、var() 引用已归一）`
        + (softFails.length ? `；另有 ${softFails.length} 处字体栈差异（仅提示）` : ''));
    } else {
      bad('令牌一致性', detailParts.join('；'));
    }
    if (softFails.length) {
      warn('令牌一致性 · 字体栈', softFails.map((m) => `${m.cssVar}：CSS=${m.css} / JSON=${m.json}`).join(' | '));
    }

    /* 字体栈顺序 */
    const orderRules = [
      ['--ds-font-display', rootDecls.get('--ds-font-display') || ''],
      ['--ds-font-text', rootDecls.get('--ds-font-text') || ''],
    ];
    const CJK_FULL = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];
    const orderFails = [];
    const orderDetail = [];
    for (const [name, raw] of orderRules) {
      if (!raw) { orderFails.push(`${name} 未声明`); continue; }
      const fams = raw.split(',').map((f) => f.trim().replace(/^['"]/, '').replace(/['"]$/, '').trim());
      const notoIdx = fams.findIndex((f) => f.toLowerCase() === 'noto sans sc');
      if (notoIdx < 0) { orderFails.push(`${name} 未包含 Noto Sans SC`); continue; }
      for (const cjk of CJK_FULL) {
        const idx = fams.findIndex((f) => f.toLowerCase() === cjk.toLowerCase());
        if (idx < 0) continue;
        if (!(notoIdx > idx)) orderFails.push(`${name}: Noto Sans SC(${notoIdx}) 未排在 ${cjk}(${idx}) 之后`);
      }
      orderDetail.push(`${name}=[${fams.join(' ')}]`);
    }
    report.fontStack = { orderDetail };
    if (!orderFails.length) ok('字体栈顺序', `Noto Sans SC 位于所有完整 CJK 族之后；${orderDetail.join('；')}`);
    else bad('字体栈顺序', orderFails.join(' | '));
  }

  /* ---- 阶段 E：逐项判定 ---- */
  console.log('\n▶ 阶段 E：逐项判定');

  if (!overflowFails.length) ok('无横向溢出', '1440 / 1280 / 768 / 390 四档 × 四路由均无横向溢出');
  else bad('无横向溢出', `${overflowFails.length} 处溢出：${overflowFails.slice(0, 3).join(' | ')}`);

  const missingComponents = Object.keys(COMPONENTS).filter((k) => !componentSeen[k]);
  if (!missingComponents.length) ok('关键组件齐备', `${Object.keys(COMPONENTS).length} 类 .ds-* 组件均已渲染`);
  else bad('关键组件齐备', `未渲染：${missingComponents.map((k) => `${k}(${COMPONENTS[k]})`).join('、')}`);

  const contrastFails = contrastSamples.filter((s) => s.ratio !== null && s.ratio < s.required);
  const ratios = contrastSamples.filter((s) => s.ratio !== null).map((s) => s.ratio);
  const minRatio = ratios.length ? Math.min(...ratios) : 0;
  if (!contrastSamples.length) warn('文本对比度达标', '未取到任何可计算的对比度样本');
  else if (!contrastFails.length) ok('文本对比度达标', `${contrastSamples.length} 个样本全部达标，最低 ${minRatio}:1`);
  else bad('文本对比度达标', contrastFails.map((x) => `${x.name}=${x.ratio}(需${x.required})`).join(', '));

  if (!belowAAAll.length) ok('触摸目标 ≥24px (WCAG 2.2 AA)', '所有 button / a[href] / input / select 均 ≥24px');
  else bad('触摸目标 ≥24px (WCAG 2.2 AA)', `${belowAAAll.length} 个低于 24px：${belowAAAll.slice(0, 3).map((x) => `${x.tag}.${x.cls}=${x.h}px`).join(' | ')}`);

  if (!belowAAAAll.length) ok('主控件触摸目标 ≥44px (AAA)', '.ds-btn / .ds-iconbtn（排除 .ds-btn--sm）全部 ≥44px');
  else bad('主控件触摸目标 ≥44px (AAA)', `${belowAAAAll.length} 个低于 44px：${belowAAAAll.slice(0, 3).map((x) => `${x.tag}.${x.cls}=${x.h}px`).join(' | ')}`);

  const nowrapFails = nowrapAll.filter((x) => /nowrap/.test(x.whiteSpace || ''));
  if (!nowrapFails.length) ok('标题未使用 nowrap', `${nowrapAll.length} 个标题元素均未使用 nowrap`);
  else bad('标题未使用 nowrap', nowrapFails.map((x) => `${x.cls}=${x.whiteSpace}`).join(' | '));

  if (!cjkAll.badSpacingCount && !cjkAll.badLineCount) {
    ok('中文排版', `${cjkAll.cjkCount} 个中文文本元素字距均为 0px，正文行高均 ≥1.85`);
  } else {
    bad('中文排版', `字距违规 ${cjkAll.badSpacingCount} 处、行高违规 ${cjkAll.badLineCount} 处`);
  }
  report.cjk = cjkAll;

  /* ---- 阶段 F：加载 / 外部请求 / 字体 ---- */
  const allResources = [...new Set(resourceUrls)];
  const baseOrigin = new URL(BASE).origin;
  const external = allResources.filter((u) => {
    if (!/^https?:/i.test(u)) return false;
    try { return new URL(u).origin !== baseOrigin; } catch { return false; }
  });
  const fontCdn = allResources.filter((u) => {
    try { return FONT_CDN_RE.test(new URL(u).host); } catch { return false; }
  });
  report.network = {
    totalRequests: allResources.length, external, fontCdn,
    method: 'performance.getEntriesByType("resource")（Ego 驱动不订阅 CDP Network 事件）',
  };
  if (!external.length) ok('零外部网络请求', `${allResources.length} 个请求全部同源`);
  else bad('零外部网络请求', `${external.length} 个外部请求：${external.slice(0, 3).join(' | ')}`);

  const mounted = Object.values(report.routes).every((byVp) =>
    Object.values(byVp).every((x) => x.appMounted));
  if (mounted) ok('页面加载与本地资源', `四条路由均已挂载；样式表 ${new Set(styleSheetUrls).size} 份`);
  else bad('页面加载与本地资源', '部分路由未挂载应用内容');

  const faces = Object.values(report.routes).flatMap((byVp) => Object.values(byVp)).flatMap((x) => x.fontsLoaded || []);
  const uniqueFaces = [...new Set(faces)];
  report.fonts = { faces: uniqueFaces };
  if (!fontCdn.length && uniqueFaces.some((f) => /Space Grotesk/.test(f))) {
    ok('字体自托管', `${uniqueFaces.filter((f) => /loaded/.test(f)).length} 个字体面已加载；无任何字体 CDN 请求`);
  } else {
    bad('字体自托管', fontCdn.length ? `存在字体 CDN 请求：${fontCdn.slice(0, 2).join(' | ')}` : '未取到已加载的自托管字体');
  }

  /* ---- 阶段 G：截图 ---- */
  console.log('\n▶ 阶段 G：截图');
  for (const vp of VIEWPORTS) {
    await setViewport(page, vp);
    for (const r of ROUTES) {
      await page.goto(`${BASE}/${r.hash}`);
      await page.waitForTimeout(700);
      const file = path.join(SHOT_DIR, `ego-${r.name}-${vp.name}.png`);
      try {
        await page.screenshot({ path: file });
        console.log(`  📷 ${path.basename(file)}`);
      } catch (e) {
        report.errors.push(`截图失败 ${path.basename(file)}：${e.message}`);
      }
    }
  }

  await finish(report.failures.length === 0 && report.errors.length === 0 ? 0 : 1);
}

try {
  await main();
} catch (e) {
  report.errors.push(`运行异常：${e && e.message ? e.message : String(e)}`);
  console.error('❌ 运行异常：', e);
  await finish(1);
}
