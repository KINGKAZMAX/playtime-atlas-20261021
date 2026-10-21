/**
 * 《联机曙光》定点取证脚本 —— 针对监工点名的 6 项未通过项逐条取证。
 *
 * 与 acceptance.cjs 的区别：这里不做整体回归，只把 6 项单独拆出来，
 * 打印**可直接复核的原始数值**（资源前后差、场上设施数、塔等级、说话人、角标 href）。
 *
 * 用法（需先构建并在 4331 提供 dist/）：
 *   cp scripts/spotcheck-6.cjs /tmp/linkdawn-qa/spot.cjs && cd /tmp/linkdawn-qa && node spot.cjs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4331/';
const SHOTS = process.env.QA_SHOTS || path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const out = [];
function record(id, name, ok, evidence) {
  out.push({ id, name, ok, evidence });
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${id}] ${name}  ::  ${evidence}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await page.waitForTimeout(1500);

  // 固定准备倒计时，避免与自动开波竞态（测试侧干预）
  const stabilize = () =>
    page.evaluate(() => {
      const s = window.__linkDawn.defense.getState();
      s.prepTimer = 600;
      if (s.beaconHp < 100) s.beaconHp = 100;
    });
  await stabilize();

  const sigma = () => page.evaluate(() => Math.floor(window.__linkDawn.defense.getState().sigma));
  const towerCount = () => page.evaluate(() => window.__linkDawn.defense.getState().towers.length);
  const cursor = () => page.evaluate(() => window.__linkDawn.defense.getState().cursor);

  // ── ① 纯键盘建造：1-4 选塔种 + 方向键移光标 + Enter 建造 ──
  const sigmaBefore = await sigma();
  const towersBefore = await towerCount();
  await page.keyboard.press('Digit1'); // 脉冲塔 Σ60
  await page.waitForTimeout(200);
  // 光标从 (1,1) 移到 (1,1) 之外的可建造格（1,2）
  await page.keyboard.down('ArrowDown');
  await page.keyboard.up('ArrowDown');
  await page.waitForTimeout(400);
  const cur = await cursor();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const sigmaAfter = await sigma();
  const towersAfter = await towerCount();
  const built = await page.evaluate(() =>
    window.__linkDawn.defense.getState().towers.map((t) => `${t.kind} Lv${t.level} @(${t.col},${t.row})`),
  );
  record(
    '1',
    '纯键盘路径可建造（1-4 + 方向键 + Enter）',
    towersAfter === towersBefore + 1 && sigmaAfter < sigmaBefore,
    `Σ ${sigmaBefore} → ${sigmaAfter}（脉冲塔造价 Σ60，差额含每秒晶格回复）；场上设施 ${towersBefore} → ${towersAfter}；${built.join('、') || '无'}；光标 @(${cur.col},${cur.row})`,
  );
  await page.screenshot({ path: path.join(SHOTS, 'spot-1-keyboard-build.png') });

  // ── ② U 键升级：必须先选中塔 ──
  const selBefore = await page.locator('.sel__name').innerText().catch(() => '(无选中)');
  await page.keyboard.press('Enter'); // 选中光标上的塔
  await page.waitForTimeout(300);
  const selAfterSelect = await page.locator('.sel__name').innerText().catch(() => '(无选中)');
  const sigmaPreUp = await sigma();
  await page.keyboard.press('KeyU');
  await page.waitForTimeout(400);
  const selAfterUp = await page.locator('.sel__name').innerText().catch(() => '(无选中)');
  const sigmaPostUp = await sigma();
  record(
    '2',
    'U 键升级生效（需先选中塔）',
    /Lv2/.test(selAfterUp) && sigmaPostUp < sigmaPreUp,
    `选中前「${selBefore}」→ Enter 选中后「${selAfterSelect}」→ 按 U 后「${selAfterUp}」；Σ ${sigmaPreUp} → ${sigmaPostUp}（脉冲塔 Lv2 升级价 Σ55 / Φ18）`,
  );
  await page.screenshot({ path: path.join(SHOTS, 'spot-2-upgrade.png') });

  // ── ③④⑤⑥ 掌机对话：说话人 / 来源角标 / 年份 / 可点击外链 ──
  await page.click('button[data-tab="handheld"]');
  await page.waitForTimeout(800);
  // 走到 NPC 岑（2,2）旁边说话：先尝试直接对话键，再点 NPC
  const talk = await page.evaluate(async () => {
    const h = window.__linkDawn.handheld;
    const s = h.getState();
    // 站到 NPC 岑 (2,2) 相邻格 (2,3)
    s.px = (2 + 0.5) * 8;
    s.py = (3 + 0.5) * 8 - 1;
    return { area: s.area, px: s.px, py: s.py };
  });
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyZ'); // A：与 NPC 对话
  await page.waitForTimeout(600);
  const speaker = await page.locator('.touch__speaker').innerText();
  const text = await page.locator('.touch__text').innerText();
  const chips = await page.locator('.touch__src .src').evaluateAll((els) =>
    els.map((e) => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim() })),
  );
  const years = (text.match(/(19|20)\d{2}/g) || []).filter((y, i, a) => a.indexOf(y) === i);
  record(
    '3',
    '对话显示说话人',
    /岑|守灯人|岚|薇|拾遗者|记录员/.test(speaker),
    `说话人「${speaker}」（站位 ${JSON.stringify(talk)}）`,
  );
  record(
    '4',
    'NPC 对话含带来源角标的历史陈述',
    chips.length > 0,
    `对话内来源角标 ${chips.length} 枚：${chips.map((c) => `${c.text}→${c.href}`).join(' | ') || '无'}`,
  );
  record(
    '5',
    'NPC 对话含具体年份史实',
    years.length > 0,
    `对话文本中出现的年份：${years.join(' / ') || '无'}；原文片段「${text.slice(0, 60)}…」`,
  );
  record(
    '6',
    '对话来源角标为可点击外链',
    chips.length > 0 && chips.every((c) => /^https:\/\//.test(c.href || '')),
    chips.map((c) => c.href).join(' | ') || '无角标',
  );
  await page.screenshot({ path: path.join(SHOTS, 'spot-3-dialogue.png') });

  record('errors', '页面 JS 运行时错误', errors.length === 0, errors.join(' | ') || '0 条');

  const failed = out.filter((r) => !r.ok);
  console.log(`\n===== 定点取证：${out.length - failed.length}/${out.length} 通过 =====`);
  fs.writeFileSync(path.join(__dirname, '..', 'qa-spotcheck.json'), JSON.stringify(out, null, 2));
  await browser.close();
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('脚本异常：', e);
  process.exit(2);
});
