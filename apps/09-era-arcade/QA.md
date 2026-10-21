# QA — 霓虹街廊 · 街机可玩展厅

> 验收日期：2026-10-21 · 全部结论均为**实际运行输出**，非预期推断
> 验收对象：`dist/` 生产构建产物（与 14-publish 将要部署的内容一致）

---

## 1. 验收环境

| 项 | 值 |
| --- | --- |
| 操作系统 | macOS（darwin 25.2.0, arm64） |
| 浏览器 | **Ego 浏览器**（`/Users/mekzenx2/.local/bin/ego-browser`，ego-lite；指南 v2.1.0）——用户真实浏览器，复用登录态与标签页 |
| 驱动方式 | `ego-browser nodejs`（`tests/lib/ego-harness.mjs` 调起 + `tests/ego/*.mjs` 在 Ego 运行时内执行） |
| 浏览器启动路径 | **零** ——本目录不 spawn 任何浏览器，无 playwright / puppeteer / 无头 Chrome / 原生 CDP |
| Node | v24.13.0 |
| 构建 | vite 5.4.11 |
| 静态服务 | Node 内置 `http` 伺服 `dist/`（端口由系统分配，用完即关） |
| 证据 | `evidence/ego/`（各套件 JSON 报告 + 每档截图） |

> **为什么不用本机无头 Chrome**：按用户 2026-10-22 长期约定，所有浏览器操作一律走 Ego 浏览器；
> 且 Ego 能直接加载本地 `file://` 页面，**不存在「本地自测豁免」的技术必要**。
> 改造前的自研 CDP 客户端（`tests/lib/harness.mjs`）已整体删除。
>
> 仍**未**使用 `13-qa-curation/qa-harness` 做判定性验收：其 `probe-09.mjs` 用 playwright-core 统计 `pageerror`，
> 适合做「有没有异常」的粗筛；但本任务需要**方向敏感的输入断言**与**修复前后异常数对比**，
> 因此自建了可复现、可控时长的夹具。harness 仅作只读参考，未做任何修改。

---

## 2. 验收结果总览

> 下表为改版后的一键全量 `npm run verify` 实测输出（退出码 **0**；总耗时随机器负载在 57–202 秒之间波动，末次 202 秒）。

| 套件 | 命令 | 用例数 | 结果 | 退出码 |
| --- | --- | --- | --- | --- |
| 生产构建 | `npm run build` | — | 成功（9.71 s），`dist/index.html` 4.30 kB / css 22.65 kB / js 90.51 kB（gzip 35.26 kB）/ 5 个字体 woff2 | **0** |
| 逻辑验收 | `npm test` | 32 | **32 通过 / 0 失败** | 0 |
| 令牌一致性 | `npm run test:tokens` | 129 变量 + 5 项字体栈 | **逐名一致 129 / 缺失 0 / 不一致 0 / 额外 0**；**V.11 顺序 2/2、V.12 写死字体族 0、V.13 无漂移 2/2** | 0 |
| 设计系统机械合规 | `npm run test:compliance` | 47 | **47 通过 / 0 失败**（批次共享 Ego 工具 30 项 + 本目录 16 规范口径 16 项 + 静态 HUD 对比度 1 项） | 0 |
| 13 探针契约 | `npm run test:probe` | 11 | **11 通过 / 0 失败** | 0 |
| 浏览器实机验收 | `npm run test:e2e` | 48 | **48 通过 / 0 失败**（含 15 项改版断言） | 0 |
| 音频运行时验收 | `npm run test:audio` | 7 | **7 通过 / 0 失败**，会话内未捕获异常 **0 次** | 0 |
| 一键全量 | `npm run verify` | 279 | 七个套件全部通过，且**正常退出不挂起** | 0 |

> 浏览器相关套件（合规 / 探针 / 实机 / 音频）全部走**用户的 Ego 浏览器**，
> 本目录**不启动任何浏览器**。

---

## 3. 浏览器实机验收明细（48 项）

伺服对象是 `dist/`（生产构建），每一步都通过 **Ego 浏览器**的真实事件驱动
（`page.click` / `page.keyboard` / `page.evaluate`，无自造事件）。

| # | 断言 | 结果 |
| --- | --- | --- |
| 1 | 展厅渲染标题 | ✅ 霓虹街廊 · 街机可玩展厅 · 1980s |
| 2 | 展品目录生成 4 个入口 | ✅ 实际 4 |
| 3 | CRT 默认开启 | ✅ |
| 4 | 画布内部分辨率 480×270 | ✅ |
| 5 | 纪年面板可打开 | ✅ |
| 6 | 时间线条目 ≥ 6 条 | ✅ 实际 8 |
| 7 | 每条都带来源链接 | ✅ 8 / 8 |
| 8 | 来源链接为可核查地址 | ✅ `https://www.museumofplay.org/games/spacewar/` |
| 9 | 原创性声明存在 | ✅ |
| 10 | 荣誉榜面板可打开 | ✅ |
| 11 | 点击舞台后键盘输入已启用 | ✅（真实指针点击） |
| 12 | 进入 play 阶段 | ✅ |
| 13 | **方向键使玩家沿指定方向真实移动** | ✅ right：(1,1)→(3,1) |
| 14 | 空格触发相位穿行并扣除能量 | ✅ 剩余能量 2 |
| 15 | E 生成残响 | ✅ 残响数 1 |
| 16 | 画布仍在文档中 | ✅ |
| 17 | P 打开暂停面板 | ✅ |
| 18 | 暂停时游戏进入冻结态 | ✅ |
| 19 | 「继续」恢复游戏 | ✅ |
| 20 | 点击舞台后键盘输入已启用（陨星） | ✅ |
| 21 | 进入第 1 波 | ✅ wave=1 |
| 22 | 编队陨石已入场 | ✅ meteors=6 |
| 23 | **方向键可向左移动机体** | ✅ x 240.0 → 167.2 |
| 24 | **方向键可向右移动机体** | ✅ x 167.2 → 243.9 |
| 25 | 空格开火产生我方子弹 | ✅ 在场子弹峰值 12 |
| 26 | **数字键 3 切换到追踪弹型** | ✅ shotIndex=2 |
| 27 | **开火可击毁陨石并得分** | ✅ 0 → 1330 |
| 28 | **共振槽随命中累积** | ✅ 共振峰值 2（种类 dust） |
| 29 | 数字键 2 切换到穿甲弹型 | ✅ shotIndex=1 |
| 30 | CRT 可关闭 | ✅ |
| 31 | CRT 可重新开启 | ✅ |
| 32 | **无未捕获异常 / console.error** | ✅ 0 次 |
| 33 | **无失败的网络请求** | ✅ 0 次 |

第 13 / 23 / 24 项是**方向敏感断言**：按下的方向必须与实际位移方向一致。
修复前这里是「位置变了就算过」，会被自动漂移蒙混成假阳性（详见 §5.2）。

第 26–28 项的命中判定**改用追踪弹型**——原因与实测数据见 §5.2 I 项：
散射/穿甲弹沿直线上升，而编队陨石带横向漂移，命中与否取决于发射瞬间的相对位置，
属于天然带随机性的断言；追踪弹会持续锁定最近的陨石，命中判定是确定的。

### 3.1 改版专项断言（第 34–48 项，改版后新增 15 项）

这一组是 16-design-system 改版的**判定口径**，在真实 Chromium 里读取计算样式与 DOM 结构：

| # | 断言 | 实测结果 |
| --- | --- | --- |
| 34 | 外壳层：顶栏 / 页脚 / 状态行 / 跳转链接 / 画布框均已套 ds 组件 | ✅ 5 个组件类全部命中 |
| 35 | `--ds-accent` 取值与 `design-tokens.json` 一致 | ✅ `#e0684a` |
| 36 | `--ds-ink` 取值与 `design-tokens.json` 一致 | ✅ `#f7f4f0` |
| 37 | 控件圆角为胶囊 | ✅ `999px` |
| 38 | 导航轨渲染 4 个展品项 | ✅ 实际 4 |
| 39 | 导航轨按距离分配景深层级 | ✅ `1/0/1/2` |
| 40 | 导航轨给出唯一当前位置（`aria-current`） | ✅ 当前项 1 |
| 41 | 圆点指示器渲染 4 点 | ✅ 实际 4 |
| 42 | 语言切换：`<html lang>` 变为 en | ✅ `en` |
| 43 | 语言切换：顶栏标题切为英文（不含汉字） | ✅ `METEOR COLUMN` |
| 44 | 语言切换：导航轨主标签切为英文 | ✅ `LATTICE CORRIDOR` |
| 45 | 语言切换：胶囊按钮显示目标语言 | ✅ `中` |
| 46 | 字体自托管：Space Grotesk 可用 | ✅ `Space Grotesk:loaded`（Inter / Space Mono / Noto Sans SC 同时 loaded） |
| 47 | 字体自托管：Inter 可用 | ✅ `Inter:loaded` |
| 48 | 字体自托管：Space Mono 可用 | ✅ `Space Mono:loaded` |

> 第 35–37 项是**逐值比对**：断言里写死了 `design-tokens.json` 的期望值，
> 而被测对象是 `src/styles/tokens.css` 经 Vite 编译后的计算样式 ——
> 只要有人在本目录里私自改动 token 值，验收会直接失败。

---

## 4. 音频运行时验收（必修项 1 的判定口径）

`tests/audio-runtime-check.mjs` 进入晶格回廊，持续触发移动 / 开火 / 残响 / 共振，
跑满指定窗口，同时统计 `Runtime.exceptionThrown`（未捕获异常）与 `console.error`。

| 断言 | 修复后实测 |
| --- | --- |
| 点击舞台后键盘输入已启用 | ✅ |
| 音频上下文已创建 | ✅ `ctxState=running` |
| **会话期间零未捕获异常** | ✅ **实际 0 次** |
| 零 console.error | ✅ 0 次 |
| BGM 处于播放状态 | ✅ `playing=true theme=lattice` |
| 音乐调度器持续推进（step 递增） | ✅ step=270（30 秒对照轮为 292） |
| 音效与玩法状态有实际变化 | ✅ echoes=2, score=100 |

### 4.1 修复前后异常数对比

对照版 = 修复前缺陷的**忠实复刻**，只改两处（曲谱展平为 64 步扁平数组、
调度器改回 `theme.lead[bar][idx]`），其余代码与当前版本完全一致，保证只有一个变量。
对照工程构建在临时目录，测量完成后已删除，不在交付物内。

| 会话窗口 | 修复前（复刻缺陷） | 修复后（当前构建） |
| --- | --- | --- |
| 5 秒 | **139 次**未捕获异常 | **0 次** |
| 30 秒 | **1142 次**未捕获异常 | **0 次** |
| 首个异常 | `TypeError: Cannot read properties of null (reading '0')` | 无 |
| 音乐调度进度 | 卡死在 `step=16` | 持续推进至 `step=292` |
| 音频上下文 / BGM | `running` / `lattice` | `running` / `lattice` |

- 异常速率约 **28–38 次/秒**（每次 25 ms 音乐 tick 抛一次）。
  supervisor 报告的 **178 次**与该速率吻合（≈ 5 秒量级），可确认指向同一处缺陷。
- 调度器停在 `step=16` 正是证据：第 16 步进入第 2 小节，`theme.lead[1]` 取出的是扁平数组里的
  一个 `null` 休止，`null[0]` 抛错；抛出后步进不再推进，于是同一处错误被反复抛出。

---

## 5. 验收过程中发现并处置的问题

### 5.1 应用代码问题（已修）

| # | 问题 | 处置 |
| --- | --- | --- |
| 1 | `src/core/audio.js` 曲谱数据结构与调度器取值方式不匹配 → 每次音乐 tick 抛 TypeError | 曲谱改写为小节数组 + 统一 `stepValue()` 取值（详见 `STATUS.md` §2） |
| 2 | 深链进入游戏后键盘无响应，但状态栏未提示原因 | 状态栏增加「点击画面启用键盘」 |

### 5.2 测试夹具问题（已修，均非作品缺陷）

| # | 现象 | 根因 | 处置 |
| --- | --- | --- | --- |
| A | 「方向键使玩家移动」恒真 | 断言只看位置变化，无法区分「按键生效」与「自动漂移」 | 改为方向敏感断言 |
| B | 从晶格回廊切到陨星纵队后按键全部失效 | `goto()` 的等待条件 `mode==='game'` 被**上一页**立即满足，后续 focus/按键落在旧文档 | 引入「导航哨兵」+ URL 匹配，确保切到新文档 |
| C | 断言随机失败（时好时坏） | headless Chrome 把页面当后台页：rAF 不触发、定时器被节流到约 1 次/秒，游戏以约 8% 速度推进 | Chrome 参数关闭后台节流 + `Emulation.setFocusEmulationEnabled` 强制可见聚焦 |
| D | `element.focus()` 后键盘仍不生效 | `document.hasFocus()` 为 false 时 Chrome 不派发 `focus` 事件 | 夹具改为真实指针点击舞台（与用户操作一致） |
| E | Chrome 调试端口偶发连不上 | 固定端口 + 上一轮残留实例 | 端口改为系统分配；启动失败自动换端口重试 |
| F | 共振槽断言偶发失败 | 共振 2.5 秒未命中即衰减，固定等待后采样会错过峰值 | 改为命中窗口内轮询取峰值 |
| G | 偶发 `CDP 超时: Page.navigate` | 上一轮 Chrome 未完全退出时新实例绑定失败 | 同 E |
| H | **用例全绿但命令挂住不退**（`npm run verify` 打印完「全部通过 ✅」后永不退出） | 三处句柄未释放：① 静态服务器只调 `close()`，keep-alive 长连接仍在，server 句柄继续挂在事件循环上；② `SIGTERM` 后没有 await 子进程 `exit`，父进程持有的 stderr 管道写端使 readable 流永远收不到 EOF；③ `Cdp.send()` 的 30 秒超时定时器响应回来后没有 `clearTimeout`，最后一次请求后还要空转 30 秒 | 新增 `closeServer()`（先 `closeAllConnections()` 再 `close()`）、`killChrome()`（await `exit`，超时升级 `SIGKILL`，并销毁 stderr/stdin）、`exitWith()`（冲刷 stdout 后显式退出）；`Cdp.send()` 改为响应即 `clearTimeout` |
| J | **舞台失焦后键盘仍然劫持**：用户在面板 / 按钮上操作时，方向键仍会驱动玩法 | 输入模块只在**窗口**失焦时清理按键；舞台 `blur` 不触发 `disable()`，因此 `enabled` 一直为真 | 属 **MIGRATION-NOTES §4.1「未聚焦仍劫持键盘」同类真实缺陷**（13 对 08 记过同类）。补 `stage.addEventListener('blur', () => api.disable())`；面板关闭时焦点归还舞台 → `focus` 事件 → 重新启用。此前 13 只记为 warn，是因为没有可观测状态、探针**看不见**这个行为；补齐只读快照后由 `tests/probe-contract.mjs` 第 9 项持续盯住 |
| K | **顶栏暂停键「已恢复但遮罩仍在」** | `shell.resume()` 只置 `gamePaused=false`，不关面板 —— 面板原本在点击动作后由框架自行关闭，顶栏键绕过了该路径，画面仍被暂停遮罩盖住 | `shell.resume()` 内补 `panels.close()`（幂等，且会归还焦点、恢复输入） |
| L | **「空格开火产生我方子弹」偶发读到 0** | 断言在 14 连发**结束后**才读一次在场子弹数；子弹可能已命中编队或飞出画面，采样点落在空窗期 | 改为**逐发采样取峰值**（与本文件其它断言一致）。实测峰值 12 发。**不是功能故障** —— 同一轮里随后的追踪弹阶段打出 0→2090 的战果，证明开火本身正常 |
| I | **「开火可击毁陨石并得分」偶发失败**（48 项里偶发 2 项不中） | 编队陨石带横向漂移（`drift = off*34`），而散射/穿甲弹沿直线上升，子弹与陨石只有一个交汇点，能否命中取决于发射瞬间玩家的 x 与陨石列的相对位置 —— 断言天然带随机性。实测失败轮的玩家 x = 216.4（成功轮为 240.0），恰好落在漂移后两列陨石之间的空档 | 命中判定改用**追踪弹型**（slot3）：追踪弹持续锁定最近的陨石，命中是确定的；命中 → 伤害 → 击毁 → 计分走的是三条弹型**共用**的 `damageMeteor` 路径。散射弹的「能产生子弹」断言保留；另新增「第 26 项：数字键 3 切换到追踪弹型」断言一并覆盖弹型切换。修复后**连跑 3 轮全绿**（得分 1330 / 1470 / 1540，均为真实战果） |

> 上述 C 项也是一条**真实环境结论**：作品被 iframe 嵌入后台标签页时，
> 浏览器会节流其 rAF 与定时器。作品侧已有兜底（`loop.js` 的 400ms/60ms 接管），
> 不会卡死在第一帧，但推进速度确实会下降 —— 详见 `STATUS.md` §6 已知限制 2。
>
> H 项是本轮**实测发现的既有缺陷**（非改版引入）：排查时发现一个 1 小时 54 分钟前遗留的孤儿
> `node tests/browser-smoke.mjs`（PPID=1）仍在运行，另有 9 个陈旧 Chrome profile 目录堆积在系统临时目录。
> 两者均已清理（孤儿进程已终止，目录已移入回收站）；修复后连跑两轮 verify 均**在 1 分钟内正常退出**（52.5 s / 57.4 s），
> 结束后残留测试进程 0 个、profile 目录 0 个。

---

## 6. 复现步骤

```bash
cd 09-era-arcade
npm ci

npm run build            # 退出码应为 0
npm test                 # 32/32
npm run test:tokens      # 令牌一致性：129 个变量逐名一致，0 缺失 / 0 不一致；+ 字体栈 V.11/V.12/V.13
npm run test:compliance  # 设计系统机械合规：47/47（批次共享 Ego 工具 + 本目录 16 口径 + 静态 HUD 对比度）
npm run test:probe       # 13 探针契约：11/11
npm run test:e2e         # 48/48（自启临时静态服务器 + Ego 浏览器，结束即关）
npm run test:audio       # 7/7，未捕获异常 0 次

# 或一键（实测 120–180 秒，退出码 0，正常退出不挂起）
npm run verify
```

- 自动化用到的静态服务器端口由系统分配，**不占用 4329**；服务器在结束时强制断连并关闭。
- **浏览器**：四个浏览器相关套件全部走 **Ego 浏览器**（`ego-browser nodejs`）。
  首次运行前建议先执行一次 `ego-browser skill` 以确认当前版本指南。
  Ego 不可用时驱动会打印「Ego 未产出报告」并以退出码 **1** 结束 —— **不静默跳过、不误判为通过**。
- TaskSpace 按名复用（`09-era-arcade ego-qa`），保留用户标签页与登录态，**不清 cookies**。
- 验收证据落在 `evidence/ego/`（JSON 报告 + 每档截图），见 §11.5。

---

## 7. 截图产物

| 文件 | 内容 |
| --- | --- |
| `screenshots/01-hall.png` | 霓虹街廊展厅（4 台终端、霓虹招牌、视差远景） |
| `screenshots/02-chronicle.png` | 街机纪年面板（8 条陈述 + 来源链接 + 原创声明） |
| `screenshots/03-ledger.png` | 霓虹荣誉榜（本地高分榜） |
| `screenshots/04-lattice.png` | 晶格回廊实机（迷宫、晶核、归途门、巡守） |
| `screenshots/05-pause.png` | 暂停面板 |
| `screenshots/06-meteor.png` | 陨星纵队实机（编队、弹型、共振槽） |

均由 `npm run test:e2e` 在同一轮验收中自动产出（Ego 浏览器）。

此外，Ego 验收证据落在 `evidence/ego/`：

| 文件 | 内容 |
| --- | --- |
| `evidence/ego/09-era-arcade.json` | 批次共享工具的标准报告（四档视口 + 视口精度自检 + 外链 / 控制台 / 样式表 / 对比度 / 触摸目标 / 降级 / 渲染字体 / 破图） |
| `evidence/ego/09-era-arcade-compliance.json` | 本目录 16 规范口径（V.1 / V.2 / V.5 / V.6 / V.7 + 面板态复检） |
| `evidence/ego/09-era-arcade-smoke.json` | 端到端 48 项明细 |
| `evidence/ego/09-era-arcade-probe.json` | 13 探针契约 11 项明细 |
| `evidence/ego/09-era-arcade-audio.json` | 音频运行时 7 项明细 |
| `evidence/ego/screenshots/` | 共享工具的四档视口截图 + 各套件的分步截图 |

---

## 8. 未覆盖 / 已知限制

| 项 | 说明 |
| --- | --- |
| 触屏真实设备 | 已在代码层提供虚拟按键并由粗指针检测自动显示，但**未在真实触屏设备上实测**（环境无移动端） |
| 真实浏览器（非 headless）的人工试玩 | 已用真实 Chromium 内核自动化验证；未做人工长时间试玩 |
| 跨源 iframe 下的 localStorage | 取决于宿主 `storage` 策略，降级为会话内榜 |
| 音频主观听感 | 已验证「调度推进 + 上下文运行 + 无异常」，**未做主观音质评估** |
| 纪年面板文案 | 只做框架性陈述，不含销量/榜单等无法逐条核查的数字（有意为之） |
| 参考站视觉取证 | 参考站 https://olek.si **未取证成功**（Codex 侧 `net::ERR_CONNECTION_CLOSED`），因此凡以参考站为依据的维度，本批一律标注「本批自定」，不臆造其风格 |
| 改版后的真实设备视觉 | 改版已在 headless Chromium 中逐值核对令牌与结构，**未在真实手机 / 桌面浏览器上做人工视觉走查** |
| 多语言朗读 | 已做双语文案与语义标注，**未做屏幕阅读器实测**（环境无 AT 软件） |
| 画布内 HUD 的对比度边界 | 已按 K.3 / §4.2 把 HUD 文字全部提到 ≥4.5:1（最紧 4.88:1）；**画布内非 HUD 的装饰性像素**（霓虹辉光、星空、招牌笔画）未做对比度测量 —— 它们是美术表达而非信息 |
| 散射弹的命中能力 | 自动化只断言「散射弹能产生子弹」；**不**断言它能命中 —— 陨石横向漂移使命中依赖发射时机，无法做成确定性断言（见 §5.2 I 项）。命中/伤害/击毁/计分路径由追踪弹断言覆盖 |


---

## 9. 改版专项验收（16-design-system）

> 本节记录改版（外壳层统一到余晖设计系统）后的专项核对，
> 依据：`15-supervisor/RESTYLE-SPEC.md`、`16-design-system/DESIGN-SPEC.md`、
> `16-design-system/design-tokens.json`、`16-design-system/MIGRATION-NOTES.md`。
> **16 的四份产物只读引用，未复制任何文件**；token 在本目录 `src/styles/tokens.css` 自行落地。

### 9.1 令牌逐值核对

`src/styles/tokens.css` 中每一个 `--ds-*` 的取值都直接抄自 `design-tokens.json` 的
**color.dark** 组（本作品是夜间街机场景，未启用浅色组）。E2E 第 35–37 项对三个关键令牌做了
**写死期望值的逐值比对**（`--ds-accent` = `#e0684a`、`--ds-ink` = `#f7f4f0`、控件圆角 = `999px`），
任何私自改动都会让验收直接失败。

`--ds-*` 全站**只在一处声明**（`src/styles/tokens.css` 的 `:root`），未与 16 的 `tokens.css`
同时加载，不存在覆盖关系。

### 9.2 外壳层 / 街机层边界

| 区域 | 处理 | 依据 |
| --- | --- | --- |
| 顶栏、页脚、状态行、跳转链接、按钮、芯片、面板 | ✅ 改用 `.ds-*` 组件 + `--ds-*` 令牌 | RESTYLE-SPEC「统一外壳层」 |
| 展品导航轨 | ✅ 改为墨色三级 + 字号 + 微缩放表达景深；**删除原 4 色霓虹边条**（外壳只保留唯一强调色朱砂） | MIGRATION-NOTES §2.8 |
| 画布框 `.ds-canvas-frame` | ✅ 圆角 / 描边 / `contain: paint` / `isolation: isolate` 套用；**保留霓虹辉光作为观感取舍** | MIGRATION-NOTES §4 红线 K.1 |
| 游戏画布内部配色、尺寸、手感、HUD、键盘映射 | ✅ **一律未动** | 红线 K.1–K.6 |
| 5×7 原创点阵字库 | ✅ **未替换为平滑 webfont** | 红线 K.2 |
| CRT 扫描线 / 滚动亮带 / 暗角 / 眩光 | ✅ **全部保留**，`#view` 像素化保留 | 红线 K.3 |
| 作品名与文案 | ✅ 保持既定原创版本（`霓虹街廊` / `LATTICE CORRIDOR` / `METEOR COLUMN` 等） | 红线 K.6 |

### 9.3 字体自托管

| 字体 | 文件 | 字节 | 许可 | 许可全文 |
| --- | --- | --- | --- | --- |
| Space Grotesk | `src/styles/fonts/space-grotesk-latin.woff2` | 34 788 | OFL 1.1 | `fonts/OFL-space-grotesk.txt` |
| Inter | `src/styles/fonts/inter-latin.woff2` | 132 684 | OFL 1.1 | `fonts/OFL-inter.txt` |
| Space Mono（regular） | `src/styles/fonts/space-mono-regular.woff2` | 14 884 | OFL 1.1 | `fonts/OFL-space-mono-regular.txt` |
| Space Mono（bold） | `src/styles/fonts/space-mono-bold.woff2` | 15 000 | OFL 1.1 | `fonts/OFL-space-mono-bold.txt` |
| Noto Sans SC（子集） | `src/styles/fonts/noto-sans-sc-subset.woff2` | 197 600 | OFL 1.1 | `fonts/OFL-noto-sans-sc.txt` |

- 全部**本地自托管**，`@font-face` 用相对 URL，无任何 CDN 引用。
- 构建产物中字体落在 `dist/assets/*.woff2`（Vite 哈希命名），`url(./xxx-hash.woff2)` 为相对路径。
- E2E 第 46–48 项用 `document.fonts.check()` 在真实 Chromium 中确认三款拉丁字体均已 **loaded**。
- 登记见 `LICENSES.md` §3.1。

### 9.4 双语

- 顶栏「中 / EN」胶囊可切；`<html lang>` 同步；选择持久化到 localStorage；`?lang=en` 深链可用。
- 覆盖范围：顶栏 / 展品目录 / 纪年 8 条 / 难度选择 / 结算面板 / 触控键 / 导航轨 / 指示器。
- E2E 第 42–45 项实测：`<html lang>` = `en`、顶栏标题 = `METEOR COLUMN`、导航轨主标签 =
  `LATTICE CORRIDOR`、胶囊显示目标语言 `中`。
- 中文排版按规范执行：`:lang(zh)` 负字距归零、正文行高 1.75、禁止 `text-align: justify`、标题不设 `nowrap`。

### 9.5 `prefers-reduced-motion` 降级

`src/styles/tokens.css` 内置 reduced-motion 块，命中时关闭扫描线滚动亮带、辉光呼吸、
过渡与动画；作品在 `prefers-reduced-motion: reduce` 下仍可完整游玩，只是观感从霓虹动态转为静态。

### 9.6 GitHub Pages 子路径适配

核查 `dist/` 全部资源引用：

| 位置 | 实际值 | 判定 |
| --- | --- | --- |
| HTML 资源引用 | `href="./assets/..."` | ✅ 相对路径 |
| CSS 字体引用 | `url(./space-grotesk-latin-D_RL9BCa.woff2)` | ✅ 相对路径 |
| JS 资源引用 | 相对导入，无 `/assets/...` 绝对根路径 | ✅ |

`vite.config.js` 的 `base: './'` 生效；`dist/` 中**未出现**以 `/assets/` 开头的绝对引用，
部署到 Pages 任意子路径均可正常加载。

### 9.7 改版期间发现并处置的 6 个问题

| # | 问题 | 处置 |
| --- | --- | --- |
| 1 | 写在 `index.html` 里的静态 `hreflang` 会被 Vite 改写：相对 `href="./index.html"` 被重写成 CSS chunk 路径（实测产出 `dist/assets/index-*.html`） | 改为**运行时**写入 `hreflang`，指向当前页面 URL |
| 2 | 深链 `?lang=en` 在 `history.replaceState` 后丢失（`setQuery` 直接覆盖 search） | 改用 `URLSearchParams` 合并参数，保留语言 |
| 3 | 展厅内移动时导航轨可能没有任何展品处于锚点范围，导致「当前位置」丢失 | `src/hall/hall.js` 新增 `closestExhibit()`（与进入判定用的 `nearestExhibit()` 分离），保证始终有锚点 |
| 4 | 原导航轨用透明度衰减表达景深，与「仅一个强调色 + 对比度」冲突 | 改为字号 / 缩放 / 墨色三级表达景深，当前位置用 `aria-current` 标注而非降透明度 |
| 5 | 旧 E2E 用例选择器（`.btn` / `.btn--primary`）在改版后全部失效 | 更新为 `.ds-btn` / `.ds-btn--primary`，并新增 15 项改版断言 |
| 6 | 页面背景的网格纹与霓虹渐变底不符合「不得使用纯色以外的图案」 | 删除，改为纯色背景 |

---

## 10. 规范机械合规自检与 13 探针契约

> 依据 `16-design-system/MIGRATION-NOTES.md` §9 验收清单与 §9.1 复核方式。
> 16 提供的两个脚本**不能直接跑**：`tools/validate-tokens.mjs` 校验的是 16 自己的
> `design-tokens.json` ↔ `src/tokens.css`（无目录参数，跑它会写 16 的 `evidence/`），
> `tools/verify-preview.mjs` 硬编码验证 16 自己的 `preview.html` 且占用**固定端口 9338**。
> 因此按 §9 口径在本目录自建等价实现（只读引用 16 的文件，不在他目录写任何东西）。
>
> **浏览器一律走 Ego 浏览器**（见 §1 与 §11）：本目录的合规 / 探针 / 实机 / 音频
> 四个套件都不再自造浏览器，而是把断言搬进 `tests/ego/*.mjs`，
> 由 `ego-browser nodejs` 在用户的真实浏览器里执行。
> 标准机械项同时跑**批次共享工具** `tools/ego-qa/run.mjs`，产出全批统一格式的证据。

### 10.1 令牌一致性与字体栈（V.3 / V.4 / V.11 / V.12 / V.13）— `npm run test:tokens`

**① 令牌一致性（V.3 / V.4）**

| 项 | 结果 |
| --- | --- |
| 逐名一致 | ✅ **129 / 129**（对照 16 的 `src/tokens.css` 暗色主题取值） |
| 缺失 | ✅ 0 |
| 取值不一致 | ✅ 0 |
| 本目录额外声明（16 无同名） | ✅ 0 |
| 其它 CSS 文件中的 `--ds-*` 声明 | ✅ 0 处（唯一声明处 = `src/styles/tokens.css`） |

> 解析器是**括号感知**的：顶层 `:root` 取主题无关的基准值，
> `[data-ds-theme="dark"]` 取主题值，**`@media` 内的 reduced-motion 块整体跳过**。
> 这一步是必须的 —— 降级块里同样是 `:root`，若不跳过，
> `--ds-dur-instant` 的期望值会变成降级值 `1ms` 而不是规范值 `120ms`，
> 基准值就等于没被校验（这是实测中真实踩到的一个坑）。

**② 字体栈三项（V.11 / V.12 / V.13）— 16 v1.0.1 §2.0.1 专项，已并入同一脚本**

| # | 检查 | 判据 | 实测 |
| --- | --- | --- | --- |
| V.11 | 顺序 | `"Noto Sans SC"` 子集必须排在**所有**系统 CJK 族之后，且不得删除子集 | ✅ display / text 均通过（子集位于 `Source Han Sans SC` 之后） |
| V.12 | 不自造字体栈 | 自有 CSS 的 `font-family` 只能引用 `var(--ds-font-*)`；`@font-face` 内为字体注册的必要声明，不在检查范围 | ✅ 写死字体族 **0** 处（`src/styles.css` 21 处全部走 `var(--ds-font-*)`；`src/styles/fonts.css` 5 处为 `@font-face` 注册） |
| V.13 | 无规范漂移 | 字体族序列与 16 的 `design-tokens.json → typography.family` **逐项相等（含顺序）** | ✅ display / text 均通过（各 6 个带引号族，顺序完全一致） |

> V.13 的比对基准是 **JSON**（`design-tokens.json`）而不是 16 的 CSS ——
> 16 的 `src/tokens.css` 只是 JSON 的编译形态，用它当基准会变成「自己和自己比」。
> 判据实现与 16 的 `tools/validate-tokens.mjs` §6 等价，但**不执行该脚本**
> （它会写 16 自己的 `evidence/`）。三项均以**反例验证过**：
> 把子集提到系统族之前 / 删除子集 / 写死中文字体族 / 与 JSON 交换顺序，四种破坏均被捕获。

### 10.2 页面机械检查（V.1 / V.2 / V.5 / V.6 / V.7）— `npm run test:compliance`

| # | 检查 | 口径 | 实测 |
| --- | --- | --- | --- |
| V.2b | 画布内 HUD 文字对比度 | ≥4.5:1（K.3 / §4.2 **不豁免**） | ✅ 9 个 HUD 文字色，最紧 **4.88:1** |
| V.1 | 水平溢出 | 1440 / 1280 / 768 / 390 四档 `scrollWidth ≤ innerWidth` | ✅ 四档全部相等 |
| V.2 | 对比度 | 正文 ≥4.5 / 大字 ≥3 | ✅ 12 项全达标，最紧 4.74:1 |
| V.5 | 焦点可达与可见 | Tab 可移动，焦点态有可见样式 | ✅ 移动 6 次，6/6 可见 |
| V.6 | 触摸目标 | 全部 ≥24px（AA 硬性）；主控件 ≥44px（AAA），`.ds-btn--sm`（32px）为唯一豁免类 | ✅ 最小 **32px**；主控件 9 个全部 **44px**。本目录**未使用**紧凑变体，故所有 `.ds-btn` 均按 44px 判定 |
| V.7 | reduced-motion | 时长归 1ms、位移与模糊归零 | ✅ 全部归零 |
| 补充 | 面板打开态复检 | 面板内按钮与文字同样受约束 | ✅ 主控件 10 个 ≥44px，文字全达标 |

### 10.3 13 探针契约（D3 / D.5 口径）— `npm run test:probe`

13 的 `issues.json` 对 09 记了 3 条 `severity=info` 的 warn，
根因都是「未暴露全局状态句柄，探针只能做 DOM 级断言」；
13 的处置建议是「加一个只读状态快照」。本目录已照此补齐，并按 13 的判定逻辑自测：

| # | 断言 | 实测 |
| --- | --- | --- |
| 1–3 | `movementSnapshot` 能取到顶层 `state` / `score` / `player` | ✅ `state=playing`、`score=0`、`player={x:32,y:46,c:1,r:1}` |
| 4 | 进入游戏后 `state` 为 `playing` | ✅ |
| 5 | 暂停控件可被 `[data-control="pause"]` 发现且可见 | ✅ 文案「暂停」 |
| 6 | 点击暂停后 `state === 'paused'` | ✅ |
| 7 | 暂停期间按键不改变任何状态（确实冻结） | ✅ 快照前后一致 |
| 8 | 再次点击可恢复 `playing` | ✅ |
| 9 | **未聚焦**时按键不改变状态（未劫持键盘） | ✅ 快照前后一致 |
| 10 | 聚焦舞台后 `player` 改变（键盘生效） | ✅ `{x:32}→{x:96}` |

> 第 9 项在补契约前是**失败**的：舞台失焦后键盘仍在劫持，
> 而此前 13 判为 warn 只是因为没有可观测状态、探针**看不见**这个行为。
> 详见 §5.2 J 项与 `STATUS.md` §8.6。

---

## 11. 浏览器入口迁移：从本地无头 Chrome + CDP 改为 Ego 浏览器

> 依据：用户 2026-10-22 长期约定 —— **所有项目的浏览器操作一律只走 Ego 浏览器**
> （入口 `/Users/mekzenx2/.local/bin/ego-browser`，先跑 `ego-browser skill`）；
> 禁止内置 Browser 工具、`chromium.launch()` / playwright / playwright-core / puppeteer、
> 本机无头 Chrome + CDP；取消「本地 `file://` 自测豁免」——Ego 可直接加载 `file://`，无豁免必要。

### 11.1 改造范围

| 改造前 | 改造后 | 说明 |
| --- | --- | --- |
| `tests/lib/harness.mjs`（450 行） | **已删除** | 自研 CDP 客户端 + Chrome 启动 + profile 清理，整体废弃 |
| — | `tests/lib/ego-harness.mjs` | **Node 侧驱动**：静态服务器 / 调起 Ego / 读回报告 / 清旧报告 |
| — | `tests/ego/_lib.mjs` | **Ego 侧助手**：视口 / 导航 / 点击 / 按键 / 事件收集 + 页面内断言 |
| — | `tests/ego/{smoke,probe,audio,compliance}.mjs` | 四个套件的断言，运行在 Ego 的 nodejs 运行时里 |
| `tests/{browser-smoke,probe-contract,audio-runtime-check,ds-compliance}.mjs` | 同名**改为驱动脚本** | 只做「起服务器 → 调 Ego → 读报告 → 打印结论」，不再含浏览器逻辑 |

改造后**全目录零浏览器启动路径**（`grep` 无 `chromium.launch` / `playwright` / `puppeteer` /
`remote-debugging-port` / `headless`），`package.json` 的 `devDependencies` 仍只有 vite。

### 11.2 架构

```
node tests/xxx.mjs                      ← Node 侧驱动（起静态服务器 + 调 Ego）
  └─ ego-browser nodejs                 ← 唯一的浏览器入口
       └─ tests/ego/xxx.mjs             ← 断言在这里执行（可直接 import 本目录模块）
            └─ taskSpace('09-era-arcade ego-qa') → page('p1')
```

两条关键设计：

1. **驱动与 Ego 之间用「一次性入口脚本」传配置**。Ego 的 nodejs 进程**没有 argv、
   也不继承环境变量**（`process.env` 全是 undefined），配置必须写进脚本 ——
   驱动把 `{ space, url, outDir, label }` 以 JSON 字面量内联进临时 `.mjs`。
2. **驱动里的 spawn 必须是异步的**。静态服务器与驱动同在一个 Node 进程；
   若用 `spawnSync` 等 Ego，事件循环会被堵死 → 服务器无法响应 Ego 的请求 → 死锁。

### 11.3 实测踩到的六个坑（都是真问题，已修）

| # | 现象 | 根因 | 处置 |
| --- | --- | --- | --- |
| 1 | 视口 1440 实测 1600 | Chromium 在 `mobile:false` 时按 1/0.9 放大 | 所有视口一律 `mobile: true`（桌面档也如此），并加**视口精度自检** |
| 2 | `page.evaluate` 抛 `ReferenceError` | 回调在页面上下文独立执行，引用不到模块作用域的函数 | 页面内辅助函数一律**自包含**；外部数据用第二个参数 JSON 传入 |
| 3 | 截图报「window is minimized」/ `CDP request timed out` | macOS 上 Ego 窗口在后台被系统遮挡，Chromium 拒绝捕获 | 截图改走 **CDP 直连 `Page.captureScreenshot`**（实测稳定），wrapper 兜底；且截图**失败不致命**（截图是证据产物，不是断言） |
| 4 | 共享工具整轮报 `Log.enable` 超时 | 同一 TaskSpace 上，前一个 Ego 进程的待决 CDP 命令会拖垮下一个进程的**第一条**命令 | 共享工具**独占**跑（放在本套件最后），两段之间留 3 秒沉降；失败最多重试 3 次 |
| 5 | 「用例全绿」但实际是上一轮的旧报告 | Ego 中途抛错就不写报告，驱动却读到了同名旧文件 | 每轮开始先 `prepareReport()` 删旧报告，读不到即判失败 |
| 6 | 暂停期间按空格游戏恢复了 | 旧版用原生 CDP 的 `rawKeyDown`（不触发按钮默认激活）；**真实浏览器**里空格会激活聚焦的按钮，而暂停面板的首个按钮正是主操作「继续」 | 冻结断言只按**移动键**；另加一条断言显式验证「暂停面板聚焦『继续』，空格可恢复」——这是**正确且预期**的可访问性行为 |

> 第 6 条是迁移带来的**语义变化**，不是缺陷：改造前观察不到，是因为无头 Chrome 的
> `rawKeyDown` 不带按钮激活语义。真实浏览器里这才是用户会遇到的行为。

### 11.4 实时弹幕带来的对局随机性（另一类非确定性）

陨星纵队是实时弹幕：玩家站着不动会被击落，`lives` 归零即结算，结算面板会接管焦点 →
后续按键落在面板按钮上、场景不再响应 → 「数字键切弹型」「开火得分」会**假失败**。

处置（测试侧，**不改产品**）：断言前先读 `scene.snapshot().phase`，
发现非 `play` 就**重进该游戏**拿一个干净的 `play` 态再继续。
这与改造前「命中判定改用追踪弹型」是同一类问题的同一类处置。

### 11.5 证据位置

| 文件 | 内容 |
| --- | --- |
| `evidence/ego/09-era-arcade.json` | **批次共享工具**（`tools/ego-qa/run.mjs`）的标准报告 + 四档截图 |
| `evidence/ego/09-era-arcade-compliance.json` | 本目录 16 规范口径（V.1 / V.2 / V.5 / V.6 / V.7 + 面板态） |
| `evidence/ego/09-era-arcade-smoke.json` | 端到端 48 项 |
| `evidence/ego/09-era-arcade-probe.json` | 13 探针契约 11 项 |
| `evidence/ego/09-era-arcade-audio.json` | 音频运行时 7 项 |
| `evidence/ego/screenshots/` | 各套件的截图（共享工具按视口命名，本套件按步骤命名） |
| `screenshots/01–06*.png` | 展厅 / 纪年 / 荣誉榜 / 晶格 / 暂停 / 陨星 六张主视觉 |

### 11.6 与批次共享工具的分工

| 项 | 归属 |
| --- | --- |
| 四档视口 + 视口精度自检、横向溢出、跨源外部请求、控制台错误、样式表解析、破图检测、**实际渲染字体**、四档截图、标准 JSON 报告 | **批次共享工具** `tools/ego-qa/run.mjs`（只读引用，输出目录指向本目录） |
| V.2b 画布 HUD 对比度（静态计算） | 本目录 Node 侧（取色于 `src/core/palette.js` 运行时真值） |
| V.2 全页面文本对比度扫描（12 项、逐层 alpha 合成）、V.6 主控件 44px 判定、V.5 焦点可达与可见、V.7 降级、**面板打开态复检** | 本目录 `tests/ego/compliance.mjs` |
| 端到端 48 项、探针契约 11 项、音频 7 项 | 本目录 `tests/ego/{smoke,probe,audio}.mjs` |

> 共享工具若因截图捕获失败而中断，按 16 的「harness 与产品缺陷必须分开记账」口径
> 归类为**环境问题**：不计入产品失败，但会在输出里单列「环境提示」，**如实记录、不静默吞掉**。
