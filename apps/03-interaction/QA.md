# QA · 验收记录

**作品**：织造车间调度台 · LOOMDECK（`flash-showcase-20261021/03-interaction`）
**验收日期**：2026-10-21（初版）／21:55 改版后复测／**23:18 对齐 16 v1.0.1 规范后复测**（下表为最新数据）
**验收方式**：真实 Chromium（Playwright / Chrome for Testing 1248）驱动，真实鼠标与键盘事件
**结论**：**通过** —— 自带冒烟测试 19/19 通过；批次 QA harness **28 项：pass 24 / warn 0 / fail 0 / skip 1 → verdict `pass`**；
字体资产校验 5/5 通过；对比度校验 30 组全部达标；
**16 规范令牌审计 🟢（129 项声明 / 必备缺 0 / 值差 0 / 字体栈顺序问题 0）**。

> 本文件记录的是**实测结论**，不是预期。每一条都注明复现方式与实际观察到的输出。

---

## 1. 自带冒烟测试（`npm run qa`）

脚本：`scripts/qa-smoke.mjs`；报告：`qa/report.json`（19 项全部 pass）。
运行方式：起一个端口由系统分配的本地临时服务器 → 跑完立即关闭，不留常驻进程。

| # | 检查项 | 实测结果 |
| --- | --- | --- |
| 1 | 首屏渲染 | 12 台机台 / 2 张订单 / 8 项读数 / 3 条日志 / 2 条图表路径，`state=running` |
| 2 | 本地字体加载 | 拉丁族 `Space Grotesk:loaded, Inter:loaded, Space Mono:loaded, Space Mono:loaded`；**CJK 兜底子集已注册并可强制加载**（`document.fonts.load('400 16px "Noto Sans SC"')` → `Noto Sans SC:loaded`）。<br>**为什么子集不是 `loaded` 常态**：按 `DESIGN-SPEC §2.5`，汉字走系统黑体，浏览器**不需要**下载子集，故 `document.fonts` 中它是 `unloaded` —— 这是正确行为。冒烟断言已改为两层（拉丁族必须 loaded + 子集必须可强制加载），见 §4 第 11 条 |
| 3 | 自动续派开关 | 开关生效，标签「自动续派 · 关」 |
| 4 | 正常下单 | 订单簿出现 `O-0003 / O-0001 / O-0002`，toast「已加入订单簿：O-0003」 |
| 5 | **异常输入被拦截** | 幅宽填 500 → 未下单（仍 3 张）；提示「无法下单：幅宽需在 30–120 cm 之间，当前 500」；焦点自动落到 `#f-width` |
| 6 | 手动派工 | 点「派单…」成功上机：在制机台 3 台（`L-01:warp L-02:warp L-03:warp`） |
| 7 | 自动续派 | 开启后新订单被机台自动接走，队列清空 |
| 8 | 暂停当班 | `state=paused`，1.8s 内 12 台机台进度**零变化**（冻结成立） |
| 9 | 继续当班 | `state=running`，机台进度恢复推进 |
| 10 | 班次节奏切换 | 点「紧排」→ `state.tempo=tight` |
| 11 | 键盘操作 | 点一下界面取得焦点后，方向键把选中机台从「无」移到 `L-01` |
| 12 | 截图 | `qa/shots/01-desktop.png`（完整调度台，自测产物） |
| 13 | 截图 | `qa/shots/02-desktop-drawer.png`（机台详情抽屉，自测产物） |
| 14 | 重置车间 | `state=idle`，订单簿回到 2 张模板订单，toast 提供「撤销」 |
| 15 | 撤销重置 | 状态回到 `shift=running`，订单簿恢复 4 张 |
| 16 | 存档恢复 | 刷新后出现「已恢复上次会话 · 2026/10/21 20:46:50」，订单簿 4 张，localStorage 键 `loomdeck.workshop.v1` |
| 17 | 移动端布局 | 390×844 无横向滚动，页面高 3776px，截图 `qa/shots/03-mobile.png`（自测产物） |
| 18 | 控制台 | 无 error、无未捕获异常 |
| 19 | **零外部请求** | 运行期没有发出任何跨域请求 |

复现：

```bash
npm install
npm run build
npm run qa        # 需要本机已安装 Chromium；缺少时执行 npx playwright install chromium
```

## 2. 批次 QA harness（`13-qa-curation/qa-harness`，只读复用）

- 复用方式：把 harness 复制到 `/tmp` 后运行，**把输出目录改写到临时目录**，
  不覆盖 `13-qa-curation/evidence/` 里策展任务自己的产物；harness 源码**未修改**。
- harness 自己会在临时目录里重新构建本项目（`npx vite build`），不写入本目录。

| 维度 | 检查 | 结果 |
| --- | --- | --- |
| D1 | desktop 布局 1440×900 | ✅ 布局正常（文本 1021 字，canvas 0） |
| D1 | **文字重叠遮挡（桌面）** | ✅ 未发现文字互相压盖（按实际字形行盒判定，候选 197 个） |
| D1 | **文字重叠遮挡（移动 390×844）** | ✅ 未发现文字互相压盖（候选 **202** 个）—— **改版后复测仍为 0 对，见 §4.1；23:18 字体栈调序 + 控件尺寸变更后再次复测仍为 0 对** |
| D2 | mobile 布局 390×844 | ✅ 布局正常 |
| D5 | 键盘焦点可达性与可见性 | ✅ 38 个可聚焦元素，Tab 可移动焦点，8/8 个焦点态可见 |
| D5 | 键盘焦点作用域（未聚焦不响应） | ✅ 未获得焦点时按键不驱动状态 |
| D5 | 键盘焦点作用域（聚焦后响应） | ✅ 聚焦（root）后按键正常驱动状态 |
| D6 | 控制台错误 | ✅ 无 error、无未捕获异常（两个视口 + 探针页各一次） |
| D7 | 资源 404 / 请求失败 | ✅ 全部同源请求成功 |
| D7 | 站点图标 favicon | ✅ 已声明站点图标（`./favicon.svg`），请求返回 200 |
| D7 | 外部依赖（跨域请求） | ℹ️ **零跨域请求** —— 全部资源本地化 |
| D8 | 页面子路径兼容性 | ✅ 子路径 `/playtime-atlas-20261021/exhibits/03-interaction/` 下全部资源解析成功 |
| D3 | 进入可玩展品 | ✅ 点击展品入口「开始派工」（`[data-exhibit]`） |
| D3 | 游戏载体存在 | ✅ 找到游戏面：`[data-game-root]`（`<div>` 766×621） |
| D3 | 开始流程 | ✅ 点击「开始派工」（`data-control`）后 `state=running` |
| D3 | 暂停流程 | ✅ 点击「暂停当班」（`data-control`）后 `state=paused` |
| D3 | 重开流程 | ✅ 点击「重置车间」（`data-control`）后 `state=idle` |
| D3 | 难度切换 | ✅ 找到班次节奏控件并切换到「轻松」 |
| D4 | 本地存档键 | ✅ localStorage 写入 1 个键：`loomdeck.workshop.v1` |
| — | 移动端 Tab 环 | ⏭️ skip：移动端无物理键盘环，harness 只统计可聚焦元素数量（38 个） |

**总计 28 项：pass 24 / warn 0 / fail 0 / skip 1 → verdict `pass`。**

> 本轮复测用的是 `13-qa-curation/qa-harness` 的**当前版本**（含 favicon 检查与浏览器崩溃重试逻辑），
> 复制到 `/tmp/loomdeck-qa2/` 后仅改写 `EVIDENCE_DIR` / `SHOT_DIR` 与 `BATCH_ROOT` 三处，
> harness 源码未改；harness 自建临时产物，不写入本目录。

## 3. 构建与产出自检（`npm run verify`）

```
检查 dist/ 共 16 个文件
  字体：OFL-inter.txt, OFL-noto-sans-sc.txt, OFL-space-grotesk.txt, OFL-space-mono-bold.txt,
        OFL-space-mono-regular.txt, fonts.css, fonts.manifest.json, inter-latin.woff2,
        noto-sans-sc-subset.woff2, space-grotesk-latin.woff2, space-mono-bold.woff2,
        space-mono-regular.woff2
  产物体积：414.0 KB
✓ 自检通过：无外部资源引用，字体已本地化，产物中无敏感文件。
```

| 产物 | 字节 |
| --- | ---: |
| `dist/index.html` | 14,490 |
| `dist/assets/index-*.js` | 38,576 |
| `dist/assets/style-*.css` | 38,561 |
| `dist/fonts/inter-latin.woff2` | 132,684 |
| `dist/fonts/noto-sans-sc-subset.woff2` | 107,968 |
| `dist/fonts/space-grotesk-latin.woff2` | 34,788 |
| `dist/fonts/space-mono-regular.woff2` | 14,884 |
| `dist/fonts/space-mono-bold.woff2` | 15,000 |
| `dist/fonts/fonts.css` | 2,323 |
| `dist/fonts/fonts.manifest.json` | 1,516 |
| `dist/fonts/OFL-*.txt` ×5 | 21,933 |
| `dist/favicon.svg` | 460 |

### 3.1 字体资产校验（`npm run check:fonts`）

```
✓ 清单登记的 5 个字体文件与 5 份 OFL 全文齐备（共 305324 字节）
✓ 五个字体的 name 表族名与 16-design-system FONT-MANIFEST 一致
✓ Noto Sans SC 子集覆盖本作品全部 576 个汉字/中文标点
✓ Inter 拉丁子集覆盖全部可打印 ASCII
✓ 样式与入口 HTML 无外链字体引用（零 CDN）
```

### 3.2 对比度校验（`node scripts/check-contrast.mjs`）

30 组配色对逐组计算 WCAG 2.2 对比度，**全部达标**（正文 ≥4.5:1、图形/控件边界 ≥3:1），
脚本同时如实记录 DS 原值的能力边界：

- `--ds-line` on `--ds-bg` = **1.29:1**、`--ds-line-strong` = **1.63:1** → 低于非文字控件边界 3:1；
  本作品只把这两档用于**装饰分隔线**，表单控件描边改用同色板的 `--ds-ink-faint`（**5.51:1**）。
- `--ds-warning` on `--ds-bg` = **3.59:1** → 低于正文 4.5:1；
  故「换经 / 警告」类**文字**改用派生墨色 `--warn-ink`（5.70:1），`--ds-warning` 只用于图形与描边。

### 3.3 改版后复测（2026-10-21 21:55）

| 项 | 结果 |
| --- | --- |
| `npm run build` | 退出码 0（含 `npm run fonts` 子集化 + `postbuild` 清理 `.DS_Store`） |
| `npm run verify` | ✓ 通过（16 个文件 / 410.5 KB） |
| `npm run check:fonts` | ✓ 5/5 通过 |
| `node scripts/check-contrast.mjs` | ✓ 30 组全部达标 |
| `npm run qa` | ✓ **19/19 通过**（含五个字体 `loaded`） |
| 批次 harness | ✓ **28 项：pass 24 / warn 0 / fail 0 / skip 1 → verdict `pass`** |
| 目视复核 | 桌面 1440×900 / 抽屉 / 移动 390×844 逐张看图，无错位、无竖排、无缺字 |

### 3.4 对齐 16 v1.0.1 后复测（2026-10-21 23:18）

触发原因：16 在 21:55 之后修订了规范（`design-tokens.json` 22:29 / `MIGRATION-NOTES.md` 22:33 /
`DESIGN-SPEC.md` 22:37，v1.0.1），其中**字体栈顺序**与**触摸目标阈值**两项对本目录有直接影响。

| 项 | 结果 |
| --- | --- |
| **`16-design-system/tools/ds-audit-tokens.mjs`**（只读审计） | ✓ **🟢**：`03-interaction 声明 129 / 必备缺 0 / 必备值差 0 / 全量缺 0 / 值差 0 / 额外 0 / 顺序问题 0`，令牌文件 `src/tokens.css` |
| `npm run build` | ✓ 退出码 0，16 个文件 / **411.1 KB**；**字体子集重建结果与前次逐字节一致**（sha256 全等 → 构建可复现） |
| `npm run verify` | ✓ 通过 |
| `npm run check:fonts` | ✓ 5/5 通过（汉字 **565/565**） |
| `node scripts/check-contrast.mjs` | ✓ 30 组全部达标 |
| `npm run qa` | ✓ **19/19 通过**（字体断言改为「拉丁族必须 loaded + CJK 兜底可强制加载」） |
| 批次 harness | ✓ **28 项：pass 24 / warn 0 / fail 0 / skip 1 → verdict `pass`**；D1 桌面 **0 对**（候选 197）/ 移动 **0 对**（候选 202）；D5 焦点态 **8/8 可见**；D8 子路径全部解析成功 |
| 触摸目标实测 | 主控件 `.ds-btn` **44px**（AAA）、`.ds-btn--sm` 32px（豁免类，仍 ≥24px AA）、表单控件 **44px**、触控端点按目标 44px |
| 目视复核 | 字体栈顺序与控件尺寸变更后**三张截图全部重拍**并逐张看图：标题不竖排、无横向溢出、无跨面板压盖、无缺字 |

### 3.5 统一外壳与字体栈专项复测（2026-10-22 02:05）

触发原因：15-supervisor 的「接入三步 + G.1—G.7 + 键盘焦点专项 + 四档视口自检」、
16-design-system 的「`--ds-target-min` 与动效降级隔离」告知，以及用户长期约定
「浏览器操作一律走 Ego 浏览器」。

| 项 | 结果 |
| --- | --- |
| **`npm run check:tokens`**（新增自测） | ✓ **9/9**：V.11 顺序 / V.12 不自造 / V.13 无漂移 / 口径 A 必备 17 项 / 全量 129 项等值 / 降级隔离 / `--ds-target-min` 44px |
| `16-design-system/tools/ds-audit-tokens.mjs`（只读） | ✓ **🟢**：声明 129 / 必备缺 0 / 必备值差 0 / 全量缺 0 / 值差 0 / 额外 0 / 顺序问题 0 |
| `npm run build` / `verify` | ✓ 退出码 0；16 个文件 / **414.0 KB**；无外部引用 / 无敏感文件 |
| `npm run check:fonts` | ✓ 5/5（汉字 **576/576**） |
| `node scripts/check-contrast.mjs` | ✓ 30 组全部达标 |
| `npm run qa` | ✓ **19/19** |
| 批次 harness（13 当前版） | ✓ **28 项：pass 24 / warn 0 / fail 0 / skip 1 → verdict `pass`**；D1 桌面 **0 对**（候选 201）/ 移动 **0 对**（候选 200）；D5 焦点态 **8/8**；D8 子路径全 200 |
| **Ego 四档视口**（1440×900 / 1280×800 / 768×1024 / 390×844） | ✓ **四档全部零横向溢出、零溢出元素**；页脚高度 42 / 42 / 68 / 87px 且**不压日志带**；页眉 71 / 90 / 242 / 328px |
| **Ego Tab 与焦点环** | ✓ 40 个可聚焦元素；Tab 前 10 站 `focus-visible` **全部为真**、焦点环**全部可见**（`outline: solid 1.67px rgb(180,67,43)` 或 3px accent-soft 外环）；Tab 序列未被 `preventDefault` 吞掉 |
| 交付截图 | ✓ 三张全部由 **Ego 浏览器**重出：1440×900（整机台）、1440×900（抽屉态）、390×844（整页 3 876px），均为**首访态**（无恢复横幅）、精确视口、0 溢出 |

**关于 `16-design-system/tools/verify-preview.mjs`**：该工具是 16 的**参考实现**，
`ROOT` 写死指向 `16-design-system/preview.html`，且断言项包含 `.ds-cover` / `.ds-work` /
`.ds-detail__title` / `.ds-rail` / `.ds-indicator` / `.ds-canvas-frame canvas`
等**本作品按设计就不存在**的组件（见 `DESIGN-DIFF.md` §3-A.4）。
故本轮按其**检查口径**（四档视口无横向溢出 / 零外部请求 / 样式表全部解析 / 焦点可见 /
对比度 24-44 两档 / reduced-motion 双路径）用 **Ego 浏览器**等价执行，未改 16 的文件，
也未另起 headless Chrome（用户长期约定）。

> 复现（Ego）：
> ```bash
> /Users/mekzenx2/.local/bin/ego-browser skill          # 先取当前版本指南
> # 脚本见 /tmp/ego-loomdeck-20261022/round-*.mjs
> # 视口校准要点：Ego 窗口带 90% 缩放，CDP override 的 width 是设备像素；
> #              且**跨 origin 导航会重置 override** → 必须「先 goto 再设 metrics」。
> ```

## 4. 本轮实际修复的缺陷（均为浏览器实测发现，非推测）

### 4.1 复核结论：移动端 D1「62 对文字压盖」

| 项 | 内容 |
| --- | --- |
| **结论** | **真实缺陷，不是检测器误报**；已修复；**当前为 0 对** |
| **现象** | 390×844 下订单簿 / 机台矩阵 / 遥测台 / 日志带的文字互相压盖，harness 判 fail |
| **根因** | 窄屏下把各面板内容塞进各自的滚动容器（`max-height: 420px`）。被裁掉的内容**几何盒子仍延伸到下一个面板上方**，于是上一块面板的文字压在下一块面板的文字上。harness 当时给出的判定是 `label「布种」× span.loom__id「L-03」` 重叠 78% |
| **修复** | ≤860px 改为**整页自然滚动**：面板按内容高度展开，不再有裁剪容器，几何盒子不再越界。**未用 z-index 掩盖重叠**（红线） |
| **复核 1（修复当时）** | harness 复测：桌面 0 对 / 移动 0 对 |
| **复核 2（改版后，2026-10-21 21:55）** | harness 复测：D1 桌面 **0 对**（候选 197 个）、D1 移动 **0 对**（候选 196 个）；两个视口 D1/D2/D6/D7/D8 全 pass |
| **复核 3（目视）** | 390×844 **整页**截图逐段查看（页眉 → 机台矩阵 → 订单簿 → 遥测台 → 日志带）：标题不再竖排、无逐字换行、无跨面板压盖；桌面 1440×900 与抽屉态同样逐张目视复核 |
| **改版带来的新风险及处置** | 改版把字号普遍提到 ≥12.5px、顶栏结构也变了，理论上可能重新压盖 —— 上述复核 2 / 3 即为该风险的实测证据（仍 0 对）。改版过程中确实出现过一次竖排（`.ds-topbar` 的 flex 覆盖了调度台栅格），**已定位并修复**，见下表第 9 条 |

> 复核结论一句话：**62 对是真实缺陷，根因是窄屏裁剪容器，不是误报；修复后（含改版后）两个视口均为 0 对。**

| # | 缺陷 | 发现方式 | 修复 | 复验 |
| --- | --- | --- | --- | --- |
| 1 | **移动端 62 对文字互相遮挡**（harness D1 fail） | harness 判定：`label「布种」× span.loom__id「L-03」` 重叠 78% | 窄屏不再把面板内容塞进 `max-height:420px` 的滚动容器，改为整页自然滚动、面板按内容高度展开 | harness 复测：桌面 / 移动均 0 对压盖 |
| 2 | **中文字体在 Chrome 里加载失败** | `new FontFace(...).load()` 报 `OTS parsing error: head: Bad x dimension in the font bounding box (32767, -32767)`；页面悄悄退回系统字体 | 裁剪后用源字型合法包围盒覆盖 `head` 表并重新压 woff2 | 复测 `FontFace.load()` 返回 `loaded ok`；harness 页 `Loomdeck Serif:loaded` |
| 3 | **按钮偶发点不动**（订单 / 机台 / 抽屉每 900ms 整表重建 DOM） | 冒烟测试点「派单…」超时：`element was detached from the DOM` | 订单卡 / 机台卡 / 抽屉 / 读数 / 负载条全部改为**稳定 DOM**：只建一次，之后原地更新字段 | 19 项冒烟测试全通过，点击不再丢 |
| 4 | **页眉重排把点击吞掉** | 真实鼠标点击「重置车间」无响应；抓事件发现 `click` 的 target 已经不是该按钮 | 提示条显隐改为 `visibility` 占位（不改布局），并给顶栏按钮定宽 | 重置 / 撤销两条链路复测通过 |
| 5 | **toast 上的「撤销」按钮点不到** | Playwright 报命中的是日志行 | `.toast` 显式 `pointer-events:auto`（容器仍为 none） | 撤销按钮复测可点 |
| 6 | **Tab 起始点被自动聚焦破坏** | harness 焦点轨迹显示 Tab 直接落到机台卡片，跳链失效 | 不再在加载时抢焦点；改为点一下界面才把焦点交给矩阵，并给出可见提示 | harness 焦点态 8/8，Tab 从跳链开始 |
| 7 | **刷新后新订单与存档订单重号** | 代码走查（订单号计数器未接续） | 存档恢复时 `syncOrderSeq` 接续计数器 | 见 §1 第 16 项（刷新后 O-0003 正常） |
| 8 | **中文字体子集覆盖不实**（改版阶段） | `npm run check:fonts` 实测：16 随包的 `noto-sans-sc-subset.woff2` 缺本作品 **168 个汉字**（织 / 簿 / 遥 / 麻 / 缎…） | 按本作品实际用字重新子集化（674 字符 / 565 汉字，**覆盖 100%**），并把 `name` 表族名规整为「Noto Sans SC / Regular」 | 校验脚本：565/565 命中；**v1.1.1 后**：按 §2.5 该子集降为离线兜底，浏览器常态不加载它，改以「可强制加载成功」验证兜底可用 |
| 9 | **改版后移动端标题竖排**（改版阶段） | 目视复核 390×844 全页截图：标题与读数被挤成逐字换行 | `.ds-topbar` 的 `display:flex` 覆盖了调度台三列栅格 → 组件层只保留表面属性，列结构交回 `.masthead` | 复跑目视 + harness：两视口 D1 均 0 对，无竖排 |
| 10 | **等宽语境里的中文回退成系统宋体**（改版阶段） | 桌面截图放大核查：页眉「匹」、机台「梭速 / 张力 / 断经」与正文不同字体 | `--mono` 别名在 generic 之前插入 CJK 族（DS 的 `--ds-font-mono` 本身不含 CJK）；**v1.1.1 按 §2.5 把顺序调正**（系统 CJK 族在前、子集在后） | 截图复核：等宽语境与正文**同源**（系统黑体），不再出现宋体混排 |
| 11 | **冒烟断言与 §2.5 调序后的正确行为冲突**（v1.1.1） | 调序后 `npm run qa` 报「本地字体加载 ✗：… Noto Sans SC:unloaded」 | 断言改为两层：①拉丁族必须 `loaded`；②CJK 兜底子集必须**已注册 + 可强制加载成功**（`document.fonts.load('400 16px "Noto Sans SC"')`） | 复跑 **19/19**，实测 `Noto Sans SC:loaded` |
| 12 | **令牌层与 16 规范有 16 项缺口 + 字体栈顺序违规**（v1.1.1） | `16-design-system/tools/ds-audit-tokens.mjs` 报「必备缺 2（`--ds-canvas-hud-bg` / `--ds-canvas-scrim`）/ 必备值差 1（`--ds-target-min` 24px）/ 顺序问题 2」 | ①补齐必备 2 项 + 规范全集中其余 14 项；②`--ds-target-min` → 44px；③`--ds-font-display` / `--ds-font-text` 按 §2.5 调序（系统 CJK 栈在前） | 复跑审计器 → **🟢**（缺 0 / 值差 0 / 顺序问题 0） |
| 13 | **控件高度低于 §11.4 的 AAA 档**（v1.1.1） | 规范核对：`.ds-btn` 40px（要求 44px）、`.ds-input` / `.ds-select` 40px + radius-sm（要求 44px + radius-md） | 全部提到 44px、radius 改 `--ds-radius-md`；`.ds-btn--sm` 维持 32px 豁免 | harness D5 焦点态 8/8；390px 无横向溢出、D1 仍 0 对 |
| 14 | **自有 CSS 手抄了一份 CJK 字族栈**（v1.1.2） | `MIGRATION-NOTES §9` 新增 **V.12「不自造字体栈」**：自有 CSS 只能引用 `var(--ds-font-*)`。本目录的语义别名层里 `--mono` 曾手写「系统 CJK 栈 + Noto 子集」——正是「各目录各自照抄字体栈、顺序漂移」这个缺陷的扩散根因 | `--mono` 改为 `var(--ds-font-mono)`；28 处 `font-family` 全部改为引用 `var(--ds-font-mono)`；新增 `npm run check:tokens` 的 V.12 项永久守住 | 自测 9/9；截图复核：等宽语境中文与正文同源，无宋体混排 |
| 15 | **降级块漏了 `--ds-entry-duration`**（v1.1.2） | 16 点名「降级值误入 `:root` → 所有用户拿不到动效」的缺陷模式，据此逐处核对本目录：`:root` 一直是规范值（**未中此缺陷**），但降级块原放在组件层且只覆盖 `--ds-dur-*`，**漏了 `--ds-entry-duration`** | 降级块移回令牌层 `src/tokens.css`（与 16 同结构），补齐 `--ds-entry-duration: 1ms`；组件层只保留 `animation/transition` 的 `!important` 压平 | 自测「降级隔离」项通过：`:root` 动效值为规范值，1ms 只出现在 `prefers-reduced-motion` 块内 |
| 16 | **自测脚本会覆盖交付截图**（v1.1.2） | 用户长期约定「截图一律走 Ego」后，`npm run qa` 仍在写 `screenshots/`，把 Ego 产出的交付图覆盖成 headless 版本 | `qa-smoke.mjs` 的截图输出改到 `qa/shots/`（自测产物，已进 `.gitignore`）；`screenshots/` 只由 Ego 产出 | 重跑 `npm run qa`（19/19）后 `screenshots/` 三张时间戳未变、`qa/shots/` 更新 |

## 5. 已知限制（实测确认，不是推测）

1. **移动端没有 Tab 环**：390×844 为触屏视口，harness 记为 skip；桌面端 Tab 可达性 8/8。
2. **快捷键需要先点一下界面**：这是刻意的 —— 展品会被嵌进主站 iframe，无条件监听 document 级按键
   会劫持宿主页面。界面右上角有「⌨ 点按界面启用快捷键」提示，harness 的 D5 焦点作用域检查对此判定为 pass。
3. **仿真是本地确定性模型**：不连接真实设备或 MES 系统；断经为概率事件，长时间运行才会出现。
4. **字体子集只含本界面用到的字符**：新增生僻字文案后需重新执行 `npm run fonts`（构建脚本会自动重新收集）；
   `npm run check:fonts` 会实测覆盖情况（当前 565/565 汉字）。
   源字型缺失的符号仅 `⌨` 一个，由系统符号字体回退，不缺字。
5. **浏览器崩溃属环境问题**：验收期间本机 swap 占用达 40GB，Chromium 偶发被系统终止；
   同一构建重跑即通过，与本作品无关。**13 早前对本目录的 `error` 判定同源** ——
   `page.evaluate: Target page, context or browser has been closed` 是 Playwright 浏览器实例
   在并发扫描时被抢占（页面上下文已关闭），发生在**测量环节**而非页面运行环节，
   13 串行重跑结论为 `verdict: "pass"`（证据落盘 2026-10-21 22:36）。
6. **双语键表就绪、切换未实现**：194 个中英键位在 `i18n/keys.json`，
   但本轮**未**提供运行时切换、JS 侧也未打点 —— 切换由 19/14 统一接入（见 `I18N-KEYS.md`）。
7. **改版未加 `.ds-cover` 英雄区**：本作品是网格 + 标签密集的工具型调度台，
   加封面会把调度控件与工单标签推到首屏之外。
8. **浅色单主题**：DS 另有深色主题，本作品只落地浅色（`color-scheme: light`）。
9. **中文字形随操作系统而异（v1.1.1 引入的取舍）**：按 `DESIGN-SPEC §2.5` 的硬性顺序，
   汉字恒走**系统黑体**（macOS 苹方 / Windows 雅黑 / Linux 思源或文泉驿），
   跨平台中文字形**不完全一致**。这是 16 明确声明**可接受**的代价（换来「不缺字、不混排、不错位」）。
   自托管的 Noto Sans SC 子集仍在包内（565/565 汉字全覆盖），只在系统栈整体不可用时兜底，
   已实测强制加载成功。**若将来要改回「子集优先」**，必须先完成 §2.5 方案 B 的四项前置
   （重新子集化并 100% 覆盖 / 改 `FONT-MANIFEST.json` 的 `systemFallbacks.cjk` 顺序与 note /
   改 `DESIGN-SPEC §2.5` 与 `MIGRATION-NOTES §5.3` / 重跑校验并逐页做混排目视检查），
   **在此之前不得擅自改序**。

## 6. 截图

| 文件 | 内容 |
| --- | --- |
| `screenshots/01-desktop.png` | 1440×900 完整调度台：页眉读数、订单簿、机台矩阵 12 台、遥测台曲线与负载条、实时日志、底部来源与许可页脚 —— **Ego 浏览器产出** |
| `screenshots/02-desktop-drawer.png` | 同上 + 右侧机台详情抽屉（状态 / 在制订单 / 进度曲线 / 机台操作 / 事件历史）—— **Ego 浏览器产出** |
| `screenshots/03-mobile.png` | 390×844 移动端**整页**（3 876px：2 列机台矩阵 + 订单簿 + 遥测 + 日志 + 页脚）—— **Ego 浏览器产出** |

## 7. 复现全部验收

```bash
cd 03-interaction
npm install
npm run build                                # 子集化中文字体 + vite 打包 → dist/
npm run verify                               # 产物自检：无外部引用 / 字体本地化 / 无敏感文件
npm run check:fonts                          # 字体资产校验：族名 / 许可 / 汉字覆盖 / 无 CDN
npm run check:tokens                         # 令牌层自测：V.11/V.12/V.13 + 口径 A + 降级隔离 + 阈值
node scripts/check-contrast.mjs              # 对比度校验：正文 ≥4.5:1、控件边界 ≥3:1
npm run qa                                   # 自带冒烟测试 → qa/report.json + screenshots/
node ../16-design-system/tools/ds-audit-tokens.mjs --root ..   # 令牌层与 16 规范的一致性审计（只读）
node 13-qa-curation/qa-harness/run-qa.mjs --target=03-interaction   # 批次 harness（见下方提示）
```

> `npm run fonts` 需要一份完整的 Noto Sans SC 源字型（`.ttf`）；
> 找不到时保留仓库内已生成的子集并正常退出，**不会中断构建**。
> 需要重新生成时：`NOTO_SANS_SC_SRC=<路径> npm run fonts`。

> 注意：直接运行批次 harness 会写入 `13-qa-curation/evidence/` 与 `13-qa-curation/screenshots/`，
> 覆盖策展任务自己的产物。验收时建议先把 harness 复制到临时目录并改写输出路径（本次即如此）。
