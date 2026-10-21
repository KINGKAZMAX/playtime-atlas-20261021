# STATUS —《霜隙远航 · Frostgap Voyager》

最后更新：2026-10-21 23:45（设计系统改版轮「余晖 / Afterglow」+ 全量复验）

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| 0. 任务立项 | ✅ 完成 | `TASK.md` 需求拆解 |
| 1. 工程脚手架 | ✅ 完成 | Vite + Three.js 本地安装，端口 4314 / 127.0.0.1 |
| 2. 程序化美术管线 | ✅ 完成 | 噪声库、行星/环带/星云/恒星/蒙皮/标签贴图 |
| 3. 世界构建 | ✅ 完成 | 恒星、2 大行星 + 卫星、小行星带、空间站、废弃中继、星场、星云 |
| 4. 6DOF 飞行模型 | ✅ 完成 | 固定步长积分、局部角速度、四元数姿态、惯性/辅助 |
| 5. 驾驶舱 | ✅ 完成 | 切角八边形舷窗框、楔形重檐、圆形 CRT、外部箭形船体 |
| 6. 输入系统 | ✅ 完成 | 指针锁定 + 失败回退（拖拽/方向键）、全键位、表单焦点保护 |
| 7. 音频 | ✅ 完成 | WebAudio 程序化合成，用户手势后启动，可静音 |
| 8. 玩法系统 | ✅ 完成 | 4 区域、扫描、星图跃迁、对接补给、8 段任务链、教程 |
| 9. UI / HUD | ✅ 完成 | 远航日志竖栏、读数塔、底部仪表台、目标标记、可见焦点环 |
| 10. 持久化 | ✅ 完成 | 发现记录 / 任务进度 / 设置 写入 localStorage |
| 11. 文档 | ✅ 完成 | README / CONTROLS / QA / SOURCE-AND-DIFFERENCES / LICENSES / CHANGELOG / manifest.json |
| 12. 实机验证 | ✅ 完成 | 自建 Playwright 套件 39/39 + 监工 harness verdict=pass |
| 13. 截图 | ✅ 完成 | `screenshots/` 内 11 张实机截图 |
| 14. 监工修复轮 | ✅ 完成 | 见下节 |
| 15. 设计系统改版轮 | ✅ 完成 | 16-design-system「余晖 / Afterglow」全站 UI 改版：token 层 / 自托管字体 / 双语 / 无障碍。见下节 |

---

## 设计系统改版轮（16-design-system「余晖 / Afterglow」）

本轮**只换视觉语言与可访问性基建**，不动玩法、键位与 3D 场景。
逐项映射见 `RESTYLE-MAP.md`，变更明细见 `CHANGELOG.md` [1.2.0]。

### F. token 层与外壳统一

- 新增 `src/styles/tokens.css`：`--ds-*` 全量令牌，文件头标注 `design-tokens.json` 出处。
- `src/styles.css` 重写：旧魔法值换成 `--ds-*`；旧变量名保留为**语义别名层**指向新令牌。
- 外壳强调色改朱砂 `--ds-accent`；卡片圆角 `--ds-radius-lg`；按钮胶囊圆角；
  动效统一 `--ds-duration-*` + `--ds-ease-*`；焦点环统一 `--ds-focus-ring`。
- HUD 容器统一 `--ds-canvas-hud-bg / ink / line` + `blur(8px)`，
  读数字号全部 ≥12.5px（rail 112→132px、log strip 268→300px、tower 214→244px）。
- **玩法识别色一律不动**（红线 K.1）：琥珀 / 余烬 / 苔绿 / 灰紫只改名为 `--play-*`，色值不变。

### G. 自托管字体（零外链）

- 拷入 Space Grotesk / Inter / Space Mono 共 4 个 woff2（197.36 kB），`font-display: swap`。
- OFL-1.1 全文随包分发（`public/licenses/`），`LICENSES.md` §3 已登记。
- **不分发 CJK 子集**（16 的 CJK 子集 coverage=partial，会同句混排）；
  字体栈保留 `"Noto Sans SC"` 族名，未命中回退系统黑体。

### H. 双语（zh / EN）

- `src/i18n/` 三件套：`zh.js` / `en.js` / `index.js`，**144 键完全对齐**。
- 内容数据（任务链 / 区域 / 天体 / 跃迁目标 / 扫描目标）在数据文件里加 `xxEn` 字段，中文原文未改。
- `<html lang>` 随语言切换；`hreflang` 运行时按 `location` 注入（适配 Pages 子路径）；
  `?lang=` 直达；偏好写入 `localStorage['frostgap-voyager.lang.v1']`。

### I. 可访问性

- `.ds-skip` 跳转链接为页面首个可聚焦元素。
- 覆盖层全部 `role="dialog" aria-modal="true" aria-label`；新增入焦 / Tab 焦点陷阱 / 关闭归还焦点。
- `:lang(zh)` 中文排版块；`prefers-reduced-motion` 降级块（保留焦点环与 hover 底色）。

### J. 本轮修掉的功能级缺陷（均为实测发现）

| 缺陷 | 修复 |
| --- | --- |
| 语言切换 chip 被模态遮罩拦截，点不动 | 改为放进对话框内部（主菜单卡 / 暂停设置卡各一枚），结构层解决 |
| 菜单态打开的「设置」面板无法用 Esc 关闭 | `Game._onKeyAction()` 菜单态分支处理 Esc |
| 一次 Esc 可能「开了又关」（Chrome 保留手势竞态） | `Input._lastEscapeAt` + `Game._lockLossPauseAt`，同一次 Esc 幂等（实测 6/6 严格交替） |
| 关闭覆盖层后焦点掉到 `BODY` | `resume()` 调整 `_blurFocus()` 与 `overlays.close()` 的顺序，焦点回到 `#scene` |
| HUD 铭牌被远航日志压住 | 日志条下移到 132px |
| 星图面板标题被教学提示条盖住 | 模态打开时 `body.ds-overlay-open` 让浮层提示条淡出 |
| 原生勾选框是浏览器蓝 | `accent-color: var(--ds-accent)` |
| `npm run build` 报 `EISDIR` | `hreflang` 改运行时注入（Vite 会把所有 `<link href>` 当资源解析） |

### K. 本轮复验

| 套件 | 结果 |
| --- | --- |
| `npm run build` | ✅ 退出码 0（`dist/index.html` 15.94 kB / JS 666.10 kB gzip 182.05 kB / CSS 28.33 kB） |
| `qa/qa.mjs` | ✅ **39 / 39** |
| `qa/verify-fixes.mjs` | ✅ **17 / 17** |
| 监工 harness | ✅ **verdict: pass**（29 / fail 0 / warn 0 / pass 25 / skip 1） |
| 截图 | ✅ `screenshots/` 11 张全部由最终构建重刷 |


---

## 本轮修复（监工清单 15-supervisor）

### 必修 1 —— D5 键盘焦点可达性 fail ✅ 已修

**根因**：`src/input/Input.js` 的 `_shouldPreventDefault()` 白名单里含 `'Tab'`，在 keydown 阶段
`preventDefault()` 吞掉了浏览器默认的焦点遍历，`document.activeElement` 8 次全部恒为 `BODY`。

**修复**（`src/input/Input.js`、`src/styles.css`、`src/game/Game.js`）：

1. 从白名单中**移除 `'Tab'`**，`Tab` 现在可以正常遍历焦点。
2. 新增 `_isInteractiveTarget()`：当 `document.activeElement` 落在 `button / input / select /
   textarea / a / option` 或 `contentEditable` 元素上时，keydown **直接放行**给浏览器
   （`Space` 可激活按钮、方向键可调滑杆、`Tab` 可移动焦点），游戏键不再被劫持。
   仅 `Escape` 仍作为全局快捷键透传。
3. 新增 `_blurFocus()`：进入驾驶舱、恢复游戏、进入暂停时主动 `blur()` 掉上一个按钮，
   避免「点过按钮后焦点卡在按钮上导致 WASD 失效」。
4. 新增可见焦点样式：`button/input/select/a/[tabindex]` 的 `:focus` 与 `:focus-visible`
   均为 `outline: 2px solid var(--gold)` + `outline-offset: 2px` + 金色外发光，
   **没有移除 outline 也没有留下替代空白**。

**实测**：连续按 `Tab` 落点为
`btnStart → btnHelpMenu → btnSettings → btnJournalMenu → BODY → btnStart → …`，
7/8 个落点带可见焦点环（落在 BODY 的那一次不计）。

### 必修 2 —— D3「重置：重置飞船」探针 fail ✅ 已修

**根因**：浏览器在指针锁定状态下把 `Esc` 当作**保留手势**用于解除锁定，该 keydown 根本不会
派发给页面。于是「继续 → playing」之后再按 `Esc` 时，游戏收不到任何按键，
暂停面板无法打开，`#btnReset` 也就不可达。

**修复**（`src/input/Input.js`、`src/game/Game.js`）：

1. `Input` 新增 `onPointerLockLost` 回调，在 `pointerlockchange` 检测到**非自身主动释放**的
   锁定丢失时触发；`releaseLock()` 会置 `_suppressLockLost` 标志，避免自释放误触发。
2. `Game` 订阅该回调：处于 `playing` 且没有覆盖层时，锁定一丢失就调用 `pause()`。
   因此无论浏览器是否吞掉 `Esc` 键，**「Esc → 暂停」在任何浏览器下都成立**，
   「继续」之后再次按 `Esc` 同样能重新打开暂停面板。
3. 额外加 `visibilitychange` 监听：标签页切到后台时自动暂停。
4. `resetShip()` 现在会一并清空扫描进度、跃迁状态与警告，并在从暂停菜单触发时
   **关闭覆盖层并把控制权交还玩家**（`state='playing'`），确保「重置后游戏继续运行」。

**实测时序**（`qa/verify-fixes.mjs`）：
`启动 → 开始(playing) → Esc(paused，暂停面板可见) → 继续(playing) → Esc(暂停面板重新打开，
#btnReset 可达) → 点击 #btnReset → 飞船位移 10.3 u 归零、速度 0.000、回到泊位、state=playing`。

### 必修 3 —— 交付缺口：缺 manifest.json ✅ 已补

`manifest.json` 已按统一 schema 补齐，必填字段取值与真实工程一致：

| 字段 | 值 |
| --- | --- |
| `id` | `04-spaceflight` |
| `title` | `霜隙远航 · Frostgap Voyager` |
| `entry` | `index.html` |
| `buildCommand` | `npm run build`（对应 `package.json` 的 `scripts.build = "vite build"`） |
| `outputDir` | `dist`（对应 `vite.config.js` 的 `build.outDir = "dist"`） |
| `status` | `completed` |

同时把 `package.json` 的 `name` / `description` 从初版名同步为现行作品名。

### 自验结果

**构建**

```
$ npm run build
vite v5.4.11 building for production...
✓ 33 modules transformed.
dist/index.html                  11.79 kB │ gzip:   3.78 kB
dist/assets/index-D963osEY.css   14.98 kB │ gzip:   3.92 kB
dist/assets/index-mILToMCo.js   647.07 kB │ gzip: 174.86 kB
✓ built in 1.41s
```
退出码 0，`dist/index.html` 存在。

**定向自验**（`scripts/verify.sh`：构建 → 启动临时静态服务器 `127.0.0.1:4321` → 跑
`qa/verify-fixes.mjs` → 脚本退出时 `trap` 立刻关闭服务器，**不留常驻进程**）

```
结果：17 / 17 通过，0 项失败
→ 已关闭临时静态服务器 (pid 46158)
```

**监工 harness 复跑**（只读复用 `13-qa-curation/qa-harness`，未修改 harness）

```
$ cd 13-qa-curation/qa-harness && node run-qa.mjs --target=04-spaceflight
  ✓ [D5] 键盘焦点可达性与可见性 — 26 个可聚焦元素，Tab 可移动焦点，7/8 个焦点态可见
  ✓ [D5] 键盘：Tab 可移动焦点且不被劫持 — Tab 后焦点 BODY → CANVAS#scene，星图未被误开（state=playing）
  ✓ [D3] 重置：重置飞船 — RESET 执行后飞船位置状态可读且游戏继续运行
  ✓ [D3] 暂停：Esc 进入暂停菜单 / 继续：回到驾驶状态
  ✓ [D7] 外部依赖（跨域请求） — 零跨域请求 —— 全部资源本地化
  ✓ [D8] 页面子路径兼容性
  → verdict: pass {"total":29,"fail":0,"warn":0,"pass":25,"skip":1}
```

**自建功能回归**（`qa/qa.mjs`，Playwright 1.64.1 + 系统 Chrome / Apple M5 GPU）

```
结果：39 / 39 通过，0 项失败
```

最后一次完整跑：2026-10-21 20:13–20:21。`screenshots/` 内 11 张截图
**全部由该次最终构建重新生成**（01 主菜单 / 02 座舱 / 03 推进 / 04 星图 / 05 跃迁 /
06 碎屑回廊 / 07 扫描 / 08 扫描结果 / 09 对接 / 10 暂停 / 11 追尾视角）。

### 回归确认（焦点修复没有破坏既有手感）

| 项 | 结果 |
| --- | --- |
| `W` 推进 | ✅ 位移 1.30 u |
| 焦点在音量滑杆上按方向键 | ✅ 滑杆自身响应（0.70 → 0.71），不驱动飞船 |
| 焦点在按钮上按 `Space` | ✅ 未被游戏拦截，可正常激活按钮 |
| 运行期控制台错误 | ✅ 0 条 |

---

## 本轮追加收尾（改名扫尾 + 验收加固 + Tab 语义修正）

### A. 改名扫尾：清掉最后一处用户可见的旧名

`scripts/start.sh` 的一键启动横幅仍打印改名前的「深空漫游 · DEEP SPACE DRIFTER」。
这是**玩家实际会看到的输出**，属于 MASTER-UPDATE 要求替换的「文案」范围，已改为
「霜隙远航 · FROSTGAP VOYAGER」，并顺手把原来没对齐的方框修正为等宽
（顶/底边框与内容行均为 50 显示列）。
`package-lock.json` 顶部的 `name` 字段也同步为 `frostgap-voyager`（与 `package.json` 一致）。

### B. Tab 键语义修正（监工新增 D5 判定）

监工 harness 在本轮更新了 `lib/probes.mjs`，新增一条判定：

```
[D5] 键盘：Tab 可移动焦点且不被劫持
  条件：Tab 后 document.activeElement 发生变化，且 #starMap 未被打开
```

首次复跑**失败**：`✗ … Tab 后焦点 BODY → BUTTON（移动=true），星图被打开=true`。
根因是上一轮只把 `Tab` 从 `Input._shouldPreventDefault()` 白名单里移除，
却**没有解开 `Game._onKeyAction()` 里 `case 'KeyM': case 'Tab':` 的星图绑定**——
于是 `Tab` 同时做了两件事：遍历焦点 **并且** 打开星图。

修复（`src/game/Game.js`、`src/input/Input.js`、`index.html`、`src/styles.css`）：

1. **解绑星图**：`case 'KeyM': case 'Tab':` → 只剩 `case 'KeyM':`。
   星图改为只用 `M` 打开，游戏内说明页（`H`）与 `manifest.json` / `CONTROLS.md` 同步。
2. **画布成为焦点落点**：`<canvas id="scene">` 加上 `tabindex="0"` 与 `aria-label`，
   飞行中它是文档里唯一可聚焦的元素，Tab 会落在驾驶舱画面上；
   CSS 为它单独给了**视口内侧**的金色焦点环（`outline-offset: -3px`），
   因为画布铺满视口，外描边会被裁掉。
3. **飞行中由游戏接管 Tab**（`Input.captureTab()`，仅在 `state === 'playing'`
   且没有覆盖层时生效）：浏览器默认会把焦点送到自己的界面栏，
   **顺带丢掉指针锁定**——玩家按一下导航键就丢掉鼠标操控。
   所以飞行中 `Tab` 被 `preventDefault()` 并把焦点放到自己的画布上，
   焦点始终留在文档内、指针锁定不丢、鼠标操控不中断。
   **菜单里（任何覆盖层打开时）完全交还浏览器原生行为**，
   `Tab` 照常在按钮之间遍历。
4. **锁定丢失不再误判为 Esc**：`Input` 记录最近一次 `Tab` 的时间戳，
   `Game.onPointerLockLost` 在「刚按过 Tab」的窗口内不触发暂停，
   避免「按 Tab → 焦点离开页面 → 浏览器丢锁 → 被当成按了 Esc → 弹暂停菜单」这条误伤链。

**实测**（本轮新增探针）：

```
before Tab : {"tag":"BODY","id":"","starmap":false,"state":"playing"}
after  Tab : {"tag":"CANVAS","id":"scene","starmap":false,"state":"playing"}
W displacement after Tab = 0.97 u  -> OK      ← 焦点落在画布后 WASD 仍然有效
```

### C. 刻意保留的两个技术标识（harness 接口契约，非作品标识）

| 标识 | 位置 | 保留原因 |
| --- | --- | --- |
| `window.__deepSpaceDrifter` | `src/main.js` | 监工 harness 的 `lib/probes.mjs` 第 301/315/346/378/398/443 行直接读这个全局量取状态机与飞船状态；改名会让 D3 / D4 / D5 判定全部失败 |
| `localStorage: deep-space-drifter.save.v1` / `…settings.v1` | `src/core/SaveGame.js`、`src/core/Settings.js` | 同上，`probes.mjs` 第 326/403/412/423 行按字面量读写这两个键 |

二者都**不出现在任何玩家可见的界面、文案、字体、配色、布局或模型形态上**，
只在开发者工具里可见。已在 `QA.md` 的「已知限制」第 12 条与
`SOURCE-AND-DIFFERENCES.md` 中写明，属于与 harness 的接口约定。

### D. 验收脚本加固（只动 `qa/`，不动产品代码）

本轮复验时机器负载极高（load average 80+），`qa/qa.mjs` 在 `page.click('#btnStart')`
上抛 `Timeout 30000ms exceeded … waiting for scheduled navigations to finish`。
排查确认这是 **Playwright 侧**的行为：点击动作**已经生效**，卡的是点击之后
「等待计划中的导航结束」这一步——本作每帧都在跑 WebGL 渲染循环，渲染进程被拖慢时
这一步会耗尽整个动作超时。两处加固：

1. **点击改用真实鼠标手势**（`page.mouse.click` + `boundingBox`）：派发同样的受信输入
   事件（指针锁定、点击处理器都照常工作），但不参与导航等待。
2. **异常路径必定回收浏览器**：`try/finally` + `SIGINT`/`SIGTERM`/`exit` 兜底，
   避免在高负载机器上留下孤儿 Chrome 进程（本轮已清理掉 1 个孤儿进程树）。

加固后三套验收一次性全绿。

### E. 截图取景优化

环带岩体半径只有 3–22 世界单位（1 单位 = 100 m），从跃迁落点远望只是一串几乎看不见的
小点，`06-debris-gallery.png` 原本完全体现不出「小行星带」。
验收脚本在**跃迁位移与区域断言通过之后**，额外把飞船停进最密的一团岩石云里、
沿环带切线方向取景，成片岩体、纵深与尺度感才真正入镜。
这只影响取景，不影响任何断言。

---

## 备注

- 监工 harness 的 `lib/targets.mjs` 里登记的标题仍是改名前的「深空漫游 · Deep Space Drifter」。
  该文件属于 13-qa-curation，按要求**只读复用未做修改**；页面自身标题、manifest、
  文档与截图均为现行名《霜隙远航 · Frostgap Voyager》。
- 依硬性要求，本地验证使用**临时静态服务器**并在校验结束后立即关闭；
  常驻的 Vite 开发服务器已停止，交付时无遗留进程。本轮结束时 4314 / 4321 / 4322 / 4323
  均无监听进程。
- `window.__deepSpaceDrifter` 与 `localStorage: deep-space-drifter.*` 两个旧标识
  按 harness 接口契约**刻意保留**，详见上文 B 节与 `QA.md` 已知限制第 12 条。

## 当前状态

**可交付**。运行方式：

```bash
cd flash-showcase-20261021/04-spaceflight
npm run start          # 自动安装依赖 + 启动 127.0.0.1:4314
npm run build          # 产出 dist/（静态，可直接部署）
bash scripts/verify.sh # 构建 + 临时服务器 + 定向自验（自动关闭服务器）
```
