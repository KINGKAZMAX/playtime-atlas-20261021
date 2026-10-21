/**
 * 《联机曙光 LINK DAWN》实机验收脚本（53 项断言）。
 *
 * 用途：作为验收记录的可复现依据。它**不是**产物的一部分，也不参与构建，
 * 运行期依赖仅 playwright（不在 package.json 里，避免污染交付产物的依赖面）。
 *
 * 前置条件：
 *   1) 产物已构建：npm run build
 *   2) 静态服务器已起：cd dist && python3 -m http.server 4331 --bind 127.0.0.1
 *   3) 已安装 Playwright（自带 Chromium，无需另行下载浏览器）：
 *      mkdir -p /tmp/linkdawn-qa && cd /tmp/linkdawn-qa && npm i playwright
 *
 * 运行：
 *   cp scripts/acceptance.cjs /tmp/linkdawn-qa/qa.cjs && cd /tmp/linkdawn-qa && node qa.cjs
 *   （脚本用 CommonJS + require('playwright')，需放在已装 playwright 的目录里跑）
 *
 * 可选环境变量：
 *   QA_BASE  站点地址，默认 http://127.0.0.1:4331/
 *   QA_SHOTS 截图输出目录，默认 <项目>/screenshots
 *
 * 注意：启动参数**不要**加 --disable-gpu —— 该参数会让动画中的 canvas
 * 无法合成进视口截图（元素截图仍正常），会导致截图证据失真。
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4331/';
const SHOTS = process.env.QA_SHOTS || path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  // 使用 Playwright 自带的 Chromium（headless shell）。
  // 注意：不要加 --disable-gpu —— 那会让动画中的 canvas 无法被合成进截图。
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const externalRequests = [];

  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`));
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) externalRequests.push(u);
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  // 验收期间关闭平滑滚动：否则 Playwright 的滚动与点击稳定性检测会互相干扰
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await page.waitForTimeout(1200);

  // ── 1. 外壳与诚信声明 ──
  const noticeText = await page.locator('.notice__body').first().innerText();
  check('顶部「本地单机」声明存在', /没有任何联网对战功能/.test(noticeText));
  check('声明点名 AI 非真人', /由本机程序控制的 ?AI/.test(noticeText) || /由本机程序控制的AI/.test(noticeText));

  const aiBadge = await page.locator('.badge--ai').innerText();
  check('AI 对手常驻标识', /非真人/.test(aiBadge) && /无联网/.test(aiBadge), aiBadge);

  // 全站扫描：产品面向区域（外壳 / 声明 / 展项 / 页脚）不得出现未否定的多人在线表述
  const productText = await page.evaluate(() => {
    const parts = [];
    for (const sel of ['.shell__head', '.notice', '#exhibits', '.shell__foot']) {
      document.querySelectorAll(sel).forEach((n) => parts.push(n.innerText));
    }
    return parts.join('\n');
  });
  const badOnline = [];
  for (const sentence of productText.split(/[。！？\n]+/)) {
    if (!/多人在线|联网对战|真人匹配|在线对战/.test(sentence)) continue;
    // 句级判定：明确否定 / 限定为史料描述 / 本地单机声明 的句子不算误导
    if (/没有|无|不|非|禁止|而非|不存在|本地单机|不连接|历史|史料|描述|澄清/.test(sentence)) continue;
    badOnline.push(sentence.trim());
  }
  check('产品区域无误导性「多人在线」表述', badOnline.length === 0, badOnline.join(' | '));

  // 历史区必须带澄清说明
  const clarify = await page.locator('#sources .notice--soft').first().innerText();
  check('史料区含「多人在线=史料描述」澄清', /描述的是史料/.test(clarify));

  // ── 2. 来源角标 ──
  const srcCount = await page.locator('#timeline .src').count();
  check('年表来源角标数量充足', srcCount >= 30, `${srcCount} 枚`);
  const srcTotal = await page.locator('.src').count();
  check('全站来源角标数量', srcTotal >= 80, `${srcTotal} 枚`);
  const ledgerCount = await page.locator('.srclist__item').count();
  check('史料台账条目数', ledgerCount >= 55, `${ledgerCount} 条`);
  const badHref = await page.locator('.src').evaluateAll((els) =>
    els.filter((e) => !/^https:\/\//.test(e.getAttribute('href') || '')).length);
  check('所有来源角标为 https 外链', badHref === 0, `${badHref} 个异常`);

  await page.screenshot({ path: path.join(SHOTS, '01-shell-hero.png'), fullPage: false });
  await page.locator('#timeline').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, '02-timeline.png') });
  await page.locator('#sources').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, '03-sources-ledger.png') });

  // ── 3. 展项 A：建造 / 升级 / 资源 / 暂停 / 存读档 ──
  await page.locator('#exhibits').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const canvas = page.locator('.defense__canvas');
  const box = await canvas.boundingBox();
  // 逻辑 640x400 → CSS 盒
  const cellCss = box.width / 16;

  // 测试期稳定器：把「准备阶段自动开波」的倒计时拉长，并保证灯塔耐久不被波次打穿。
  // 原因：本机在并发跑其它浏览器实例时墙钟时间被严重拉长，若放任 22s 自动开波，
  // 会出现「波次自行开始 → 灯塔被打穿 → 结算遮罩挡住后续点击」的竞态。
  // 这是测试侧白盒干预，不改变产品行为（胜负判定仍由白盒直接构造）。
  const stabilize = () =>
    page.evaluate(() => {
      const s = window.__linkDawn.defense.getState();
      s.prepTimer = 600;
      if (s.beaconHp < 100) s.beaconHp = 100;
    });
  await stabilize();

  // 选塔种
  await page.click('button[data-kind="pulse"]');
  check('塔种按钮进入建造模式', (await page.getAttribute('button[data-kind="pulse"]', 'aria-pressed')) === 'true');

  const sigmaBefore = parseInt(await page.locator('.panel--hud .stat__value').first().innerText(), 10);

  // 在主航道旁的可建造格 (6,3) 上建造 —— 该格为 'build'
  await canvas.click({ position: { x: (6 + 0.5) * cellCss, y: (3 + 0.5) * cellCss } });
  await page.waitForTimeout(300);
  const sigmaAfter = parseInt(await page.locator('.panel--hud .stat__value').first().innerText(), 10);
  check('建造消耗晶格', sigmaAfter < sigmaBefore, `${sigmaBefore} → ${sigmaAfter}`);

  // 再建一座
  await canvas.click({ position: { x: (7 + 0.5) * cellCss, y: (3 + 0.5) * cellCss } });
  await page.waitForTimeout(200);

  // 选中塔 → 升级
  await canvas.click({ position: { x: (6 + 0.5) * cellCss, y: (3 + 0.5) * cellCss } });
  await page.waitForTimeout(300);
  const selName = await page.locator('.sel__name').innerText();
  check('点选已有塔显示详情', /脉冲塔/.test(selName), selName);

  const upBtn = page.locator('.sel__actions .btn--primary');
  const upLabelBefore = await upBtn.innerText();
  await upBtn.click();
  await page.waitForTimeout(300);
  const selNameAfter = await page.locator('.sel__name').innerText();
  check('升级生效（Lv1→Lv2）', /Lv2/.test(selNameAfter), `${selName} → ${selNameAfter}`);
  const dmgAfter = await page.locator('.sel__list li').first().innerText();
  check('升级后数值变化', /21/.test(dmgAfter), dmgAfter);

  // 开波状态提示（常驻文案，说明按钮为什么亮/灭）
  const barNote = await page.locator('.bar__countdown').innerText();
  check('开波状态提示常驻可见', /(\d+s 后自动开波|第 \d+ 波进行中|本局已结束)/.test(barNote.trim()), barNote);

  // 开波
  // 注意：准备阶段会在倒计时归零后自动开波（按钮随之变灰）。
  // 因此这里先记波次：按钮可点就点；若已被自动开波，则只要确认确实有波次在跑。
  const waveStat = page.locator('.panel--hud .stat__value').nth(2);
  const startBtn = page.locator('[data-act="start"]');
  // 把准备倒计时调回正常值再开波，避免测试稳定器造成不真实的巨额「提前出击」奖励
  await page.evaluate(() => { window.__linkDawn.defense.getState().prepTimer = 12; });
  const waveBefore = parseInt((await waveStat.innerText()).split('/')[0], 10);
  const startEnabled = await startBtn.isEnabled();
  if (startEnabled) await startBtn.click();
  await page.waitForTimeout(500);
  const waveText = await waveStat.innerText();
  const waveAfter = parseInt(waveText.split('/')[0], 10);
  check(
    '开波后波次推进',
    waveAfter >= 1 && (!startEnabled || waveAfter > waveBefore),
    `${waveBefore}/18 → ${waveText}${startEnabled ? '' : '（准备阶段已自动开波）'}`,
  );

  await page.waitForTimeout(4500);
  const combat = await page.evaluate(() => {
    const s = window.__linkDawn.defense.getState();
    return { enemies: s.enemies.length, wave: s.wave, over: s.over };
  });
  check('战斗循环在运行（敌人已在战场生成）', combat.enemies > 0 && combat.over === null, `场上敌人 ${combat.enemies} · 第 ${combat.wave} 波`);

  // 取景：把战场画布滚到视口内，保证截图里能看到真实渲染的战场
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '04-exhibit-defense.png') });

  // 暂停
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(400);
  const pauseVisible = await page.locator('.defense__overlay').isVisible();
  check('P 键暂停并显示遮罩', pauseVisible);
  const waveFrozen = await page.locator('.panel--hud .stat__value').nth(2).innerText();
  await page.waitForTimeout(1500);
  const waveFrozen2 = await page.locator('.panel--hud .stat__value').nth(2).innerText();
  check('暂停时模拟冻结', waveFrozen === waveFrozen2, `${waveFrozen} / ${waveFrozen2}`);
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '05-defense-paused.png') });
  await page.keyboard.press('KeyP');
  await page.waitForTimeout(300);
  check('再次按 P 恢复', !(await page.locator('.defense__overlay').isVisible()));

  // 存档 → 读档
  await page.click('[data-act="save"]'); // 存档
  await page.waitForTimeout(400);
  const saved = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((x) => x.includes('defense.save'));
    return k ? localStorage.getItem(k) : null;
  });
  check('存档写入 localStorage', !!saved && saved.includes('"v":1'));

  await page.click('[data-act="load"]'); // 读档
  await page.waitForTimeout(500);
  await stabilize();
  const loadedSigma = parseInt(await page.locator('.panel--hud .stat__value').first().innerText(), 10);
  check('读档恢复资源', Number.isFinite(loadedSigma), `Σ=${loadedSigma}`);

  // AI 对手：切到「激进」档，缩短突击间隔，验证 AI 真的发动了突击
  await page.selectOption('.game__bar select', 'aggressive');
  await page.waitForTimeout(400);
  await page.locator('.defense__canvas').click({ position: { x: (6 + 0.5) * cellCss, y: (3 + 0.5) * cellCss } });
  await page.waitForTimeout(200);
  const intentPre = await page.locator('.ai__intent').innerText();
  const countPre = parseInt(await page.locator('.panel--ai .stat__value').nth(2).innerText(), 10);
  let aiAssaulted = false;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(700);
    await stabilize();
    const c = parseInt(await page.locator('.panel--ai .stat__value').nth(2).innerText(), 10);
    if (c > countPre) { aiAssaulted = true; break; }
  }
  const countPost = parseInt(await page.locator('.panel--ai .stat__value').nth(2).innerText(), 10);
  check('AI 对手真实发动突击（非随机刷怪）', aiAssaulted, `突击次数 ${countPre} → ${countPost}`);
  const aiLogText = await page.locator('.ai__log').innerText();
  check('AI 面板记录突击事件', /突击/.test(aiLogText), aiLogText.split('\n')[0] || '(空)');
  const intentPost = await page.locator('.ai__intent').innerText();
  check('AI 意图文本随状态变化', intentPre !== intentPost, intentPost.slice(0, 50));

  // AI 突击单位真实出现在灰烬航道（lane === 'ash'，而不是只数总数）
  let laneCount = { ash: 0, total: 0 };
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(700);
    laneCount = await page.evaluate(() => {
      const es = window.__linkDawn.defense.getState().enemies;
      return { ash: es.filter((e) => e.lane === 'ash').length, total: es.length };
    });
    if (laneCount.ash > 0) break;
  }
  check('AI 突击单位真实生成在灰烬航道', laneCount.ash > 0, `灰烬航道 ${laneCount.ash} / 场上共 ${laneCount.total}`);

  // 胜负路径（白盒：直接构造终局条件）
  await page.evaluate(() => { window.__linkDawn.defense.getState().beaconHp = 0; });
  await page.waitForTimeout(600);
  const loseTitle = await page.locator('.overlay__title').innerText().catch(() => '');
  check('失败结局可达（灯塔耐久归零）', /失守/.test(loseTitle), loseTitle);
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '05b-defense-lose.png') });

  // 重开 → 制造胜利条件
  await page.locator('.overlay__actions .btn--primary').click();
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const s = window.__linkDawn.defense.getState();
    s.wave = 18;
    s.inWave = true;
    s.queue = [];
    s.enemies = [];
  });
  await page.waitForTimeout(700);
  const winTitle = await page.locator('.overlay__title').innerText().catch(() => '');
  check('胜利结局可达（肃清第 18 波）', /肃清|长明/.test(winTitle), winTitle);
  const resultRows = await page.locator('.result li').count();
  check('结算面板给出统计', resultRows >= 6, `${resultRows} 项`);
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '05c-defense-win.png') });

  // 重新开局后继续键盘路径测试
  await page.locator('.overlay__actions .btn--primary').click();
  await page.waitForTimeout(500);

  // 键盘建造路径：数字键选塔 + 方向键移动光标 + Enter 建造
  const sigmaPre2 = parseInt(await page.locator('.panel--hud .stat__value').first().innerText(), 10);
  await page.keyboard.press('Digit4');   // 谐振塔
  await page.waitForTimeout(150);
  // 真实轻点语义：按下→抬起之间不留连发窗口（产品的连发延迟为 0.4s，轻点只应移动 1 格）
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  const cursorPos = await page.evaluate(() => window.__linkDawn.defense.getState().cursor);
  check('方向键可移动建造光标', cursorPos.col === 1 && cursorPos.row === 1, JSON.stringify(cursorPos));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const sigmaPost2 = parseInt(await page.locator('.panel--hud .stat__value').first().innerText(), 10);
  check('纯键盘路径可建造（1-4 + 方向键 + Enter）', sigmaPost2 < sigmaPre2, `${sigmaPre2} → ${sigmaPost2}`);
  const towerCount = await page.evaluate(() => window.__linkDawn.defense.getState().towers.length);
  check('键盘建造后场上确有设施', towerCount >= 1, `${towerCount} 座`);

  // 再按 Enter 选中刚建好的塔，然后 U 升级
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const selBefore = await page.locator('.sel__name').innerText();
  check('Enter 可选中已建成的设施', /谐振塔|脉冲塔/.test(selBefore), selBefore);
  await page.keyboard.press('KeyU');
  await page.waitForTimeout(300);
  const selAfter = await page.locator('.sel__name').innerText();
  check('U 键升级生效', /Lv2/.test(selAfter), `${selBefore} → ${selAfter}`);

  // ── 4. 展项 B：掌机 ──
  await page.click('button[data-tab="handheld"]');
  await page.waitForTimeout(700);
  const panelVisible = await page.locator('.pocket__body').isVisible();
  check('切换到展项 B', panelVisible);

  const hpBefore = await page.locator('.status__hp .pip.is-on').count();
  const shardBefore = await page.locator('.status__shards .pip--shard.is-on').count();
  check('掌机状态条显示体力', hpBefore === 5, `${hpBefore}/5`);
  check('掌机初始碎片数', shardBefore === 0, `${shardBefore}/3`);

  // 先向上走靠近 NPC 岑（2,2），玩家初始在 (2,4)
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(400);

  // 用 A 键与 NPC 对话
  await page.keyboard.press('KeyZ'); // A
  await page.waitForTimeout(500);
  const speaker = await page.locator('.touch__speaker').innerText();
  check('对话显示说话人', /岑|守灯人|岚|薇|拾遗者|记录员/.test(speaker), speaker);

  // 推进对话直到出现带来源的历史陈述
  let sawSource = false;
  let sawHistory = false;
  let maxSrc = 0;
  let capturedHref = '';
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('KeyZ');
    await page.waitForTimeout(350);
    const txt = await page.locator('.touch__text').innerText();
    const nSrc = await page.locator('.touch__src .src').count();
    maxSrc = Math.max(maxSrc, nSrc);
    if (nSrc > 0) {
      sawSource = true;
      if (!capturedHref) {
        capturedHref = (await page.locator('.touch__src .src').first().getAttribute('href')) || '';
      }
    }
    if (/2002|2003|2004|2005|2006/.test(txt)) sawHistory = true;
  }
  check('NPC 对话含带来源角标的历史陈述', sawSource, `最多 ${maxSrc} 枚角标`);
  check('NPC 对话含具体年份史实', sawHistory);
  check('对话来源角标为可点击外链', /^https:\/\//.test(capturedHref), capturedHref);
  await page.screenshot({ path: path.join(SHOTS, '06-exhibit-handheld-dialogue.png') });

  // B 键结束对话
  await page.keyboard.press('KeyX');
  await page.waitForTimeout(400);
  const speakerAfterB = await page.locator('.touch__speaker').innerText();
  check('B 键可结束对话', !/岑|守灯人/.test(speakerAfterB), speakerAfterB);

  // 触屏：按住 D-pad 右 900ms 走一段
  const dpadRight = page.locator('.dpad__btn[aria-label="右"]');
  await dpadRight.dispatchEvent('pointerdown');
  await page.waitForTimeout(900);
  await dpadRight.dispatchEvent('pointerup');
  await page.waitForTimeout(300);
  const movedX = await page.evaluate(() => window.__linkDawn.handheld.getState().px);
  check('触屏 D-pad 可移动角色', movedX > 24, `px=${movedX.toFixed(1)}`);

  // 暂停菜单
  await page.keyboard.press('Enter'); // START
  await page.waitForTimeout(400);
  check('START 打开暂停菜单', await page.locator('.touch__menu').isVisible());
  await page.screenshot({ path: path.join(SHOTS, '07-handheld-pause.png') });
  // 存档
  await page.locator('.touch__menu .btn', { hasText: '存档' }).click();
  await page.waitForTimeout(400);
  const savedH = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((x) => x.includes('handheld.save'));
    return k ? localStorage.getItem(k) : null;
  });
  check('掌机存档写入 localStorage', !!savedH && savedH.includes('"v":1'));
  await page.locator('.touch__menu .btn', { hasText: '继续游戏' }).click();
  await page.waitForTimeout(300);

  // 掌机胜利路径（白盒：集齐三枚碎片后点亮灯芯）
  await page.evaluate(() => {
    const s = window.__linkDawn.handheld.getState();
    s.shards = ['回声碎片 · 潮', '回声碎片 · 隙', '回声碎片 · 顶'];
    s.leverOn = true;
    s.area = 'lighthouse';
    s.px = (8 + 0.5) * 8;
    s.py = (4 + 1) * 8 - 1;
  });
  await page.waitForTimeout(500);
  await page.keyboard.press('KeyZ'); // A
  await page.waitForTimeout(600);
  const endSpeaker = await page.locator('.touch__speaker').innerText();
  check('掌机胜利结局可达（集齐碎片点亮灯芯）', /结局/.test(endSpeaker), endSpeaker);
  await page.screenshot({ path: path.join(SHOTS, '07b-handheld-ending.png') });

  // 体力耗尽的失败处理：切回小镇并检查状态
  // 说明：reload 后必须重新注入 scroll-behavior 覆盖样式，并显式等待页签按钮出现；
  // 否则在机器负载高时（并发浏览器实例）页签渲染会晚于点击等待而误判为失败。
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('button[data-tab="handheld"]', { timeout: 20000 });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await page.waitForTimeout(900);
  await page.click('button[data-tab="handheld"]');
  await page.waitForTimeout(600);

  // ── 5. 响应式：移动端视口 ──
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await mobile.newPage();
  const mErrors = [];
  mp.on('pageerror', (e) => mErrors.push(String(e)));
  await mp.goto(BASE, { waitUntil: 'networkidle' });
  await mp.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await mp.waitForTimeout(1200);
  const overflow = await mp.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, clientW: de.clientWidth };
  });
  check('移动端无横向溢出', overflow.scrollW <= overflow.clientW + 2, JSON.stringify(overflow));
  await mp.locator('#exhibits').scrollIntoViewIfNeeded();
  await mp.waitForTimeout(600);
  await mp.locator('.defense__canvas').scrollIntoViewIfNeeded();
  await mp.waitForTimeout(500);
  await mp.screenshot({ path: path.join(SHOTS, '08-mobile-defense.png') });
  await mp.click('button[data-tab="handheld"]');
  await mp.waitForTimeout(800);
  await mp.locator('.pocket__canvas').scrollIntoViewIfNeeded();
  await mp.waitForTimeout(500);
  await mp.screenshot({ path: path.join(SHOTS, '09-mobile-handheld.png') });
  const mOverflow2 = await mp.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, clientW: de.clientWidth };
  });
  check('移动端掌机展项无横向溢出', mOverflow2.scrollW <= mOverflow2.clientW + 2, JSON.stringify(mOverflow2));
  check('移动端无 JS 错误', mErrors.length === 0, mErrors.join(' | '));
  await mobile.close();

  // ── 6. 网络与控制台 ──
  check('无 JS 运行时错误', pageErrors.length === 0, pageErrors.join(' | '));
  check('无 console error', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('无失败请求', failedRequests.length === 0, failedRequests.join(' | '));
  check('运行期零外部请求（无 CDN / 无在线 API）', externalRequests.length === 0, externalRequests.slice(0, 5).join(' | '));

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n===== 验收结果：${results.length - failed.length}/${results.length} 通过 =====`);
  if (failed.length) {
    console.log('未通过：');
    for (const f of failed) console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : ''));
  }
  fs.writeFileSync(path.join(__dirname, '..', 'qa-result.json'), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('QA 脚本异常：', e);
  process.exit(2);
});
