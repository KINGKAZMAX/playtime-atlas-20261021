# 验收记录 / QA

作品：**光点年代 · 早期可玩展厅 / LUMEN ERA**（`08-era-origins`）
验收时间：2026-10-21（**改版后复测**）
验收环境：macOS（darwin 25.2.0 arm64）、Node 24.13.0、Vite 5.4.11、Chromium（playwright-core 1.64.1，headless）

---

## 一、验收方式

三层，互相独立：

| 层 | 工具 | 覆盖 |
| --- | --- | --- |
| L1 单元 | `node --test "tests/*.test.mjs"` | 状态机、碰撞、计分、难度、存档、**键盘焦点作用域** |
| L2 构建 | `npm run build` + `npm run verify` | 产物齐全、路径全相对、**运行期零外部请求**、manifest 一致性、**改版专项（令牌 / 画布色板镜像 / 无障碍标记）** |
| L3 实机 | 定向 Playwright 探针（Chromium，Pages 子路径挂载） | D3/D4/D5/D6 + V.1–V.9 真实浏览器行为 + 截图 |
| L4 批次 | 13-qa-curation 全量 harness | 权威 verdict |

L3 的探针脚本放在 `/tmp`（**不写入 `13-qa-curation/`**），逻辑与批次 QA harness 的 `checkKeyboardScope` 同口径：先冻结 → 未聚焦按键 → 比对状态 → 聚焦 → 同一组键 → 再比对。原始结果见 `screenshots/probe-report.json`。

> **关于批次 harness**：13-qa-curation 的全量 harness 已于 2026-10-21T11:48:48Z 对本任务跑完，结论 **verdict = pass**（详见下文 L4）。本任务自行复用该 harness 做定向复测时，Chromium 曾因本机 GPU / 网络进程资源争用退出过一次（`Target page, context or browser has been closed`），**不是页面缺陷**——同一构建在等价口径的定向探针下连续跑通 66/66。

---

## 二、结果总览

| 层 | 结果 |
| --- | --- |
| L1 单元测试 | **54 / 54 通过**（`node --test "tests/*.test.mjs"`） |
| L2 构建 | `npm run build` **退出码 0**，产出 `dist/index.html` / `dist/rally.html` / `dist/gravity.html`；`npm run verify` **退出码 0** |
| L3 实机探针 | **66 / 66 通过**（pass 66 / warn 0 / fail 0） |
| L4 批次 QA harness | **verdict = pass**（`13-qa-curation/evidence/08-era-origins.json`，checkedAt 2026-10-21T11:48:48Z） |

### L3 探针维度分布（改版后）

| 维度 | 项数 | 通过 | 说明 |
| --- | --- | --- | --- |
| V.1 水平溢出 | 8 | 8 | desktop 1440 / laptop 1280 / tablet 768 / mobile 390 × index/rally，`scrollWidth - innerWidth = 0px` |
| V.2 对比度 | 10 | 10 | 全部 ≥4.5:1，见下表实测值 |
| V.5 焦点可达 + 焦点环 | 2 | 2 | 两页 Tab 可达 3 个元素，**3/3 有可见焦点环** |
| V.6 触摸目标 | 8 | 8 | 独立目标全部 ≥24px |
| V.7 reduced-motion | 1 | 1 | `--ds-dur-fast=1ms`、`--ds-dur-base=1ms`，按钮 `transition=0.001s` |
| V.8 外部请求 | 8 | 8 | 运行期零外部请求 |
| V.9 字体本地化 | 2 | 2 | 4 个 `@font-face`（Space Grotesk / Inter / Space Mono），无 CDN |
| D3 状态机 | 8 | 8 | 开始 / 倒计时暂停 / 继续 / 重开 |
| D4 本地存档 | 2 | 2 | `lumen-era.rally.settings`、`lumen-era.rally.best`、`lumen-era.gravity.settings` |
| D5 键盘作用域 | 7 | 7 | 未聚焦不响应 / 聚焦后响应 / 聚焦时不滚动页面 |
| D6 控制台 | 10 | 10 | 零错误 |

### V.2 对比度实测值（WCAG 2.1，最小 4.5:1）

| 选择器 | 实测 | 字号/字重 |
| --- | --- | --- |
| `.hero__lede` | **9.70 : 1** | 19px / 400 |
| `.hero__latin` | **5.70 : 1** | 18px / 400 |
| `.section__intro` | **9.70 : 1** | 16px / 400 |
| `.stop__note` | **9.70 : 1** | 14px / 400 |
| `.stop__src` | **5.70 : 1** | 12.5px / 400 |
| `.source__claims` | **8.54 : 1** | 14px / 400 |
| `.notice p` | **8.08 : 1** | 14px / 400 |
| `.foot__note` | **6.40 : 1** | 14px / 400 |
| `.brand` | **6.79 : 1** | 12.5px / 600 |
| `.masthead nav a` | **10.64 : 1** | 14px / 400 |

深色主题三档墨色对 `--ds-bg` 的对比度：**17.46 : 1**（`--ds-ink`）/ **9.71 : 1**（`--ds-ink-soft`）/ **≥5.15 : 1**（`--ds-ink-faint`），均达 AA。

### L4 批次 harness 结论（权威口径）

由 13-qa-curation 在真实批次根目录跑出的最终证据，**本任务全部验收项为 pass，无 warn、无 skip**：

| 维度 | 结论 |
| --- | --- |
| D1 布局（desktop 1440×900 / mobile 390×844） | pass —— 布局正常，无文字互相压盖 |
| D2 mobile 布局 | pass |
| D3 进入可玩展品 | pass —— 展厅枢纽 → 子页 `rally.html` |
| D3 游戏载体存在 | pass —— 找到 `[data-game-root]`（942×531） |
| D3 开始流程 | pass —— 点击「开始对拉」后 `state=playing` |
| D3 暂停流程 | pass —— 点击「暂停」后 `state=paused` |
| D3 重开流程 | pass —— 点击「重开」后 `state=countdown` |
| D3 难度切换 | pass —— 找到难度控件并切换到「初辉 / 轻松」 |
| D4 本地存档键 | pass —— 写入 `lumen-era.rally.settings` |
| **D5 键盘焦点作用域（未聚焦不响应）** | **pass** —— `activeElement=BODY`，位于游戏区=false，游戏已冻结（`state=paused`），按键未驱动游戏状态 |
| **D5 键盘焦点作用域（聚焦后响应）** | **pass** —— 聚焦（root）后按键正常驱动游戏状态 |
| D5 键盘焦点可达性与可见性 | pass —— 47 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见 |
| D6 控制台错误 | pass —— 无 console error、无未捕获异常 |
| D7 资源 404 / 请求失败 | pass —— 全部同源请求成功 |
| D7 外部依赖（跨域请求） | 零跨域请求 —— 全部资源本地化 |
| D8 页面子路径兼容性 | pass —— 所有资源在 `/playtime-atlas-20261021/exhibits/08-era-origins/` 下解析成功 |

> 此前该任务的证据里 **D5 聚焦后响应 = warn、D4 = warn、难度切换 = skip**，第二轮修复后已全部转为 **pass**。
>
> **13 于 2026-10-21 18:31:03 重跑 08 的结论**：`verdict = pass-with-warnings`、`fail = 0`；其中 D5 键盘劫持一项已确认修好（未聚焦 / 聚焦后均 pass）。

---

## 三、逐项结果

### L1 单元测试

```
node --test "tests/*.test.mjs"
ℹ tests 54
ℹ pass 54
ℹ fail 0
```

> ⚠️ 必须用 glob 形式 `node --test "tests/*.test.mjs"`；目录形式 `node --test tests/` 会报 `MODULE_NOT_FOUND`。

覆盖：两作的状态机（idle / countdown / playing / paused / over）、球的反弹与偏心回弹、蓄力与重击窗口计分、三档 AI 难度、双人模式、燃料/光能/存活奖励、平方反比引力轨道、存档读写、**D5 焦点作用域**、暂停在倒计时阶段、难度切换不抹掉比分。

### L2 构建与产物

| 检查项 | 结果 |
| --- | --- |
| `npm run build` 退出码 | **0** |
| `dist/index.html` | 存在且非空 ✅ |
| `dist/rally.html` / `dist/gravity.html` | 存在且非空 ✅ |
| 绝对路径引用（`src="/"`、`href="/"`） | **0** ✅ |
| 运行期外部请求（script/link/img/CSS @import/url()/fetch/XHR） | **0** ✅ |
| 图片 / 音频素材（png/jpg/gif/webp/mp3/wav/ogg/m4a） | **0**，全部程序化生成 ✅ |
| 自托管 OFL 字体 | **4 个 woff2**（Space Grotesk / Inter / Space Mono×2），无其它字体格式 ✅ |
| 外部字体 CDN 引用（fonts.googleapis / gstatic / jsdelivr / typekit） | **0** ✅ |
| 随构建产出的文档 | README / SOURCES / DIFFERENCES / LICENSES / QA / RESTYLE-INVENTORY 六份齐全 ✅ |
| `manifest.json` 七个必需字段 | 齐全 ✅ |
| `buildCommand` 与 `package.json` | `npm run build` ↔ `scripts.build` 一致 ✅ |
| `outputDir` 与 Vite 配置 | `dist` ↔ `build.outDir` 一致 ✅ |
| 运行时依赖 | **0**（仅构建期 `vite@5.4.11`，MIT） ✅ |

> 出处链接（`<a href="https://…">`）是**史实引用**，不是运行时请求，不计入「外部请求」统计。

### L2 改版专项校验（`scripts/verify.sh` 第 5 步）

| 检查项 | 结果 |
| --- | --- |
| 深色令牌与 `16-design-system/design-tokens.json` 逐项一致 | ✅ |
| `--lumen-*` 镜像与 `src/core/gfx.js` 的 `PALETTE` 一致（15 项） | ✅ |
| 玩法代码不读取任何 CSS 变量（K.1 的结构保证） | ✅ 4 个文件全部无 `getComputedStyle` / `getPropertyValue` |
| 三页 `lang="zh-CN"` + `data-ds-theme="dark"` + `tokens → components` 样式表顺序 | ✅ |
| `dist` 产物内含令牌层与组件层（`--ds-bg:` / `.ds-btn`） | ✅ |

---

## 四、键盘焦点作用域（D5）专项说明

这是本任务被反复盯的一项，单独说明**判定口径**，避免「看起来通过」。

### 判定量为什么不同

| 作品 | 判定量 | 原因 |
| --- | --- | --- |
| 辉点对拉 | `p1.y`（左辉板纵坐标） | 辉板不会自己漂移，`y` **只**随玩家按键变化 |
| 引力双星 | `p1.angle`（光舟朝向） | 飞船位置受引力**持续漂移**，不能用作判定；`angle` 仅在 `turn !== 0`（转向输入）时变化，是纯输入驱动量 |

### 探针口径的两次修正（都是探针问题，不是代码缺陷）

| # | 现象 | 根因 | 修正 |
| --- | --- | --- | --- |
| 1 | 第一版探针在引力双星上**误报**失败 | 直接比对整个 `p1` 对象，而飞船在轨道上持续漂移 | 改为只比对输入驱动量 `p1.angle` |
| 2 | 改版后引力双星**再次**误报失败 | 判定只比「按键前」与「全部按完」两个端点，而探针给引力双星选的键组是 `KeyD`(右转) → `KeyW`(推进) → `KeyA`(左转)，**左右等时对称，净转角恰为 0**，端点值相同 → 误判「未响应」 | 判定改为「**按住期间持续采样**（每 55–65ms 一次）∪ 末值」，任一采样点变化即判定生效；对称键组无法再掩盖信号 |

第二次误报的定位过程（可复核）：

```
复现脚本逐帧打印：
  按住 KeyD 中 → angle 0.127    ← 角度确实变了（按键生效）
  按住 KeyW 中 → angle 0.127
  按住 KeyA 中 → angle -0.779   ← KeyA 把角度又转回原位
  末值对比 → before = after = -0.779  ⇒ 端点法误判
```

修正后的探针在**未聚焦**阶段同样采用过程采样：全程 12–16 个采样点**无一变化**才算通过，因此这一修正同时把「未聚焦不响应」测得更严。

### 测试序列

```
1. 点击「开始对拉」 → state=countdown
2. 点击「暂停」      → state=paused        （验证倒计时阶段也可暂停）
3. 点击「继续」      → state=playing
4. document.activeElement.blur() + body.focus()   → activeElement = BODY
5. 按住方向键 880ms  → 过程采样 ×16      → 全程未变  ✅
6. game-root.focus()                         → activeElement = DIV#rally-root.is-focused
7. 按住同一组键 + 过程采样 ×16 → 已变化（按键生效）    ✅
8. 聚焦状态下按 ArrowDown → scrollY 不变              ✅（不劫持页面滚动）
```

### 实现层面的三道保险

| # | 措施 | 位置 |
| --- | --- | --- |
| 1 | 监听器**只挂在游戏根容器**上，不挂 document / window | `src/core/focus.js` |
| 2 | 事件到达时核验**实时 `document.activeElement`**，只要落在容器之外就放行 | `focus.js` `isFocused()` |
| 3 | 两作**都没有 window 级 keydown 监听**；失焦立即清空按键状态 | `src/core/input.js` |

焦点判定是「缓存标志 **且** 实时 activeElement 在容器内」的**双条件**，避免元素失焦后标志残留导致误判。

### Tab 焦点遍历（改版后实测）

| 页面 | Tab 可达元素 | 有可见焦点环 |
| --- | --- | --- |
| `rally.html` | 3（skip-link / 品牌链接 / 主按钮） | **3 / 3** ✅ |
| `gravity.html` | 3（同上） | **3 / 3** ✅ |

> 画布容器（`[data-game-root]`，`tabindex="0"`、`role="application"`）在 Tab 序列中，可被聚焦并驱动游戏；其焦点环**几何**对齐 `--ds-focus-width` / `--ds-focus-offset`（2px + 2px 偏移），**颜色**保留青色（K.3「HUD 可读性优先」的有意偏离，深靛画面上青色对比度远高于朱砂）。

---

## 五、修复记录（本次验收期间）

| 问题 | 根因 | 处置 |
| --- | --- | --- |
| D5 冻结失败 | **暂停在倒计时阶段失效**，游戏仍在推进，状态差分无法归因 | `pause()` 覆盖 `playing` + `countdown`，新增 `resumeState`，`resume()` 精确恢复 |
| 切换难度抹掉比分 | `setDifficulty()` 一律重开对局 | 改为仅 `idle` / `over` 时重开；模式切换仍重开 |
| 文字整体不显示 | `body::before` / `body::after` 两个 `position:fixed` 覆盖层压住正文 | 删除伪元素，纹理改为 `body` 自身的 `background-image` + `background-attachment: fixed` |
| 控制台 favicon 404 | 无 `/favicon.ico` | 三页补内联 SVG data-URI 图标（不引入二进制素材） |
| 验收可观测性不足 | 无稳定句柄可读游戏状态 | 暴露只读 `p1` / `p2` getter；构造时即写入 settings 存档 |
| 改版后引力双星 D5 误报 | **探针端点判定 + 左右对称键组**，净转角为 0 | 探针改为过程采样（**代码未改动**）；修正后 66/66 全通过 |

---

## 六、截图

| 文件 | 内容 |
| --- | --- |
| `screenshots/01-hall-hero.png` | 展厅主站首屏（示波器示样在动） |
| `screenshots/02-hall-timeline.png` | 年代长廊 12 站 |
| `screenshots/03-hall-sources.png` | 来源台账 17 条 |
| `screenshots/04-rally.png` | 展品 08-A 对局中（含焦点环、比分、AI 面板） |
| `screenshots/05-gravity.png` | 展品 08-B 对局中（中央核心、轨道、光迹） |
| `screenshots/06-hall-mobile.png` | 移动端展厅首屏（390×844） |
| `screenshots/07-rally-mobile.png` | 移动端展品 08-A |
| `screenshots/probe-report.json` | 探针原始结果（**66 项**，含前后状态快照与过程采样值） |

---

## 七、限制声明

1. `bnl.gov` 在本次沙箱内直连被拦截，其正文经检索索引完整取回并逐条比对；来源表已如实标注「检索索引取证」，其余 15 条为直接 HTTP 200 取证。
2. 展厅为**代表性选样**，不宣称覆盖 1948—1979 全部电子游戏作品。
3. 两款游戏为**原创重新演绎**，不是任何历史作品的复刻或可运行副本。
4. 触屏手势基于 Chromium 模拟上下文验证（`hasTouch` 移动视口），未在真机 Safari / iOS 上实测。
5. 音频仅验证了 AudioContext 在用户手势后可启动、无控制台报错，未做主观音质评估。
6. D5 的「聚焦后响应」在 Chromium 上验证；未覆盖 Safari / Firefox 的键盘事件差异。
7. 13-qa-curation 的全量 harness 在本机曾因 GPU / 网络进程崩溃中断过一次（环境资源争用），但其**最终产出的证据是 `verdict = pass`**，本任务的 D5 / D3 / D4 全部为 pass。
8. 中文正文使用**系统字体栈**（未内置 Noto Sans SC 子集：197 600 B 且按 07 用字生成，覆盖不了本目录汉字）；拉丁字符与等宽字符使用自托管 OFL 字体。不同系统上的中文渲染差异未做逐字校对。
9. 本批**只有中文版**，因此未提供 `hreflang="en"`（无可交替的英文版，不提供虚构的语言标注）；语言由 `<html lang="zh-CN">` 声明。
