# STATUS.md — 执行状态

> 任务：01｜热门网页案例复刻（原创改编 + 全站视觉统一改版）
> 最后更新：2026-10-21 21:20（Asia/Taipei）
> 状态：**已完成，可交付**（改版后 QA 55/55 通过）

---

## 1. 一句话状态

研究闭环、选案定稿、原创改编已实现、**已按 16-design-system 完成全站视觉语言改版**
（色板 / 字体 / 字阶 / 圆角 / 间距 / 动效 / 封面 / 顶栏 / 按钮 / 表单 / 画布容器），
**D1 文字压盖已按「正常文档流内依次排列」修完**，
**已按 16-design-system 的 MIGRATION-NOTES 完成设计系统接入三步**
（`assets/ds/` 的令牌层 / 组件层 / 字体 + `--ds-base` + `.ds-shell` 外壳类），
浏览器点击断言 **65/65**、DS 接入验收 **18/18** 全绿，
四档视口零溢出，13 张截图已产出；
产物为纯静态 `dist/`，等待 14-publish 统一发布。

---

## 2. 阶段进度

| # | 阶段 | 状态 | 产出 |
|---|---|---|---|
| 1 | 联网检索与证据核验 | ✅ 完成 | `../00-research/SOURCE.md` |
| 2 | 候选对比与选案 | ✅ 完成 | 6 个网页类候选对比表，选中 @nutlope 落地页 |
| 3 | 原创改编设计 | ✅ 完成 | 作品名 / 文案 / 字体 / 配色 / 布局 / 形态全部重新设计 |
| 4 | 工程实现 | ✅ 完成 | Vite + TypeScript + Three.js，`src/**` |
| 5 | 交互与动效实现 | ✅ 完成 | 光谱实验室、样本库、3D 拆解、规格、FAQ、表单 |
| 6 | 响应式实现 | ✅ 完成 | 1440 / 834 / 390 三档，0px 横向溢出 |
| 7 | 构建 | ✅ 完成 | `npm run build` → `dist/`（静态，零外部请求） |
| 8 | 浏览器点击验证与修复 | ✅ 完成 | 65/65 断言通过（dev 与生产构建各一轮） |
| 9 | 截图与文档 | ✅ 完成 | 13 张截图 + 10 份文档 + manifest + LICENSES |
| 10 | **改版准备（RESTYLE 第 1 步）** | ✅ 完成 | `RESTYLE-INVENTORY.md` 待替换清单 + `i18n/` zh-en key 骨架 |
| 11 | **增量改版（RESTYLE 第 2 步）** | ✅ 完成 | `src/styles/tokens.css` + 全站 token 映射 + 封面 / 顶栏 / 按钮 / 表单 / 画布统一 |
| 12 | **D1 遮挡自查复核** | ✅ 完成 | 本文件 §5，脚本 + 整页目视双证 |
| 13 | **D1 文字压盖修复（结构化）** | ✅ 完成 | 三类根因逐条改回正常流；两视口真实压盖归零，见本文件 §5 |
| 14 | **设计系统接入（MIGRATION-NOTES 三步 + G.1–G.7）** | ✅ 完成 | `public/assets/ds/`（令牌 / 组件 / 字体 + OFL 全文）、令牌层整体替换、`--ds-base` 注入、外壳类接入；见本文件 §6 |
| 15 | **DS 接入验收自检（V.1–V.11）** | ✅ 完成 | `qa/ds-verify.mjs` 18/18，见本文件 §6.5 |
| 16 | 公网发布 | ⏸ 交由 14-publish | 本任务只交付 `dist/` 与 `screenshots/` |

---

## 3. 关键决策记录

| 决策 | 理由 |
|---|---|
| 选 @nutlope 的落地页作为参考作品 | 本次可核验的 M3.1 Flash 网页类作品里互动量最高（1,417 赞 / 13 万播放），模型证据是作者原帖自述，产物形态是标准落地页 |
| **不做像素级复刻，改做原创改编** | MASTER-UPDATE.md 要求重设作品名 / 文案 / 字体 / 配色 / 布局 / 形态。本作品另立虚构产品「CHROMA S1」，只保留「同等工艺水准」这层参照 |
| 选光谱色度仪而不是游戏机 | 参考作品是手持游戏机；换成测量仪器可避免形态层面的复制，光谱计算天然适配「可交互实验室」 |
| 色彩计算自己实现，不调用外部色库 | 页面核心主张是「把颜色量出来」，读数必须是真算出来的；CIE 1931 配色函数与 CIEDE2000 全部自行实现 |
| 用 `RoomEnvironment` 而不是 HDR 文件 | three 自带的程序化房间环境，无需外部贴图即可让金属材质正确出图 |
| 加 `?motion=off` 模式 | 在动画时间轴不推进的环境里，入场动画会把内容卡在起始态。提供显式静态模式，保证任何环境下内容都可见 |
| 用 Playwright 驱动本机 Chrome 做验证 | 会话内置浏览器的渲染时间轴会被冻结，无法观察动画与三维连续帧 |
| **不采用同级 `TOP3.md` 建议的「NIMBUS·7 桌面气象站」规格** | TOP3.md 自述定位为「机制 + 质量标尺 + 改编规格，不是待抄的稿子」；`MASTER-UPDATE.md` 的七项强制重设本作品已逐项满足；批次内 `02-model` 亦按自身口径另选案例并有先例。分歧已写入 `DIFF-vs-SOURCE.md` 第 6 节，未做静默替换 |
| **改版采用 DS 浅色主题，三维画布保持 DS 画布色** | 16 的 `design-tokens.json` 默认浅色（`color.light`），深色主题仅供「建筑项目与游戏内夜间场景」。本作品页面走浅色；三维视口按 DS §9.1 用 `--ds-bg-sunken` 画布底 + `--ds-canvas-*` 深色 HUD，保证 HUD 对比度 ≥ 4.5:1 |
| **封面改为 DS `.ds-cover` 结构（居中单栏）** | DS §14.3 明确要求 01 这类非游戏作品套 `.ds-cover`；顺序固定为 眉标 → 标题 → 导语 → 动作组 → 媒体，标题 `max-width: 22ch` + `overflow-wrap: anywhere`，禁止 nowrap |
| **顶栏 CTA 由主色改为 secondary** | DS §7.1「每个视图至多 1 个主 CTA」；封面保留唯一的主色 CTA，顶栏降级为次级按钮 |
| **移动端导航改为横向可滚动而非隐藏** | DS §4.2「移动端导航项必须可横向滚动或折叠为抽屉，不得溢出」。原实现直接 `display:none`，等于手机上无法跳转章节 |
| 三维相机按画幅自适应取景 | 画布改 21:9 后固定机位会让仪器显得过小；改为按 aspect 计算距离，用户一旦自行转动/缩放即停止自动重构图 |

---

## 4. 改版映射（依据 16-design-system）

| 维度 | 依据 | 本作品落地 |
|---|---|---|
| 色板 | `design-tokens.json` → `color.light` / `color.dark` / `color.canvas` | `src/styles/tokens.css` 的 `--ds-*` 层；本作品语义别名（`--ink-*` / `--paper-*` / `--signal-*` / `--pulse` / `--iris`）全部映射到 `--ds-*`，样式表其余部分零改动即可换肤 |
| 字体 | `typography.family` | Space Grotesk（展示）/ Inter（正文）/ Space Mono（等宽），全部 `@fontsource` 自托管，见 `LICENSES.md` |
| 字阶 / 行高 / 字距 | `typography.size` / `lineHeight` / `tracking` / `weightCjk` | 42 处字号改为 DS 令牌；中文按 DS §2.3 归零负字距、display 字重降到 500 |
| 圆角 | `radius` | `--radius` → `--ds-radius-sm`(10px)、`--radius-lg` → `--ds-radius-md`(14px)、2px → `--ds-radius-xs`(6px)；按钮按 §7.1 改胶囊 `--ds-radius-control` |
| 间距 | `space` | 页面水平内边距改用 `--ds-space-gutter`；区块纵向改 `--ds-space-section-top/bottom` |
| 动效 | `motion.duration` / `easing` / `entry` | 入场改为 位移 24px + 透明度 + blur 6px / 640ms（DS §8.2），交错 60ms、最多 6 级；按钮 active `scale(.985)` |
| 顶栏 | §4.2 + `components.css .ds-topbar` | `color-mix(bg 82%)` + `blur(12px)`、gap 16、链接 `aria-current` 下边框、44px 触摸高 |
| 封面 | §3.2 + `.ds-cover` | 居中单栏、顺序固定、标题 22ch + `overflow-wrap:anywhere`、导语 62ch、动作组 gap 12、媒体 `min(100%,960px)` + `--ds-radius-media` |
| 画布容器 | §9.1 + `.ds-canvas-frame` | `--ds-radius-media` 圆角、`--ds-bg-sunken` 底、`contain: paint` + `isolation: isolate`、HUD 用 `--ds-canvas-*` |
| 按钮 / 控件 | §7.1 / §7.2 / §7.4 | 胶囊圆角、最小高 40（sm 32 / 封面主 CTA 48）、focus 用 `--ds-focus-ring`；表单控件最小高 44px、`--ds-radius-md`、focus = accent 边框 + 3px accent-soft 外环 |
| 无障碍 | §11 | 焦点环不可移除、触摸目标 ≥24px（主按钮 48px）、移动端导航可滚动、`prefers-reduced-motion` 全局降级 |
| 子路径 | §10.1 | 构建 `base: './'`，产物内**零绝对根路径**资源引用（QA 断言 12 个 URL 全相对） |

---

## 5. D1「文字重叠遮挡」复核与修复（2026-10-21 21:35–22:40）

### 5.1 口径对齐

13 的检测器已改为按**字形行盒**判定：`Range.getClientRects()` 取直接文本子节点的行盒，
两两求交，交集面积占较小者绘制面积 ≥ 50% 即命中；并按祖先 `overflow:hidden|clip`
的盒子裁剪（被裁掉的行不算绘制）。本目录把同一套判定抄进 `qa/lib/overlap-measure.mjs`，
`qa/d1-overlap.mjs`（多滚动位置采样）与 `qa/verify.mjs`（结构性自检）共用，不做二次实现。

**复核结论**：15 转达的 13 那批命中（desktop 8 对 / mobile 19 对）在**当前源码上复现不出来**
—— 用 13 的检测器 + 13 的调用序列（load → 2500ms → 视口截图 → 整页截图 → 测量，滚动位置 0）
在本目录当前源码上复跑：desktop **0 对**、mobile **1 对**。mobile 那 1 对与 13 自己
`issues.json` 里已登记的 `span.readout__k「ΔE00」× p#stage-hint.stage__hint`（85%，559px²）完全一致。

那批折叠区命中（`p`×`spec-row__key`、`p`×`faq-item__q`）来自 13 构建时的**更早源码快照**：
那时折叠内容靠 `overflow:hidden` 裁剪，新口径会把被裁的行排除掉，所以现在测不出来。
但**几何越界本身是真的**（实测：折叠态面板内的 `p` 盒高 81.19px，面板盒高 0，
文字盒整体越出面板 81px、压到下一行标题上），按派单要求本轮做了结构化修复，
不再依赖检测器是否把被裁的行算进来。

### 5.2 三类根因与修法（均不用 z-index / transform / overflow:hidden 掩盖）

| # | 根因 | 修法 | 改动文件 |
|---|---|---|---|
| a | **折叠面板靠裁剪折叠**：`grid-template-rows: 0fr→1fr` + 内层 `overflow:hidden`。折叠态面板盒高为 0，里面的 `p` 文字盒仍是自然高度（81px），整体越出面板压到下一行标题/下一问的问题上 | 折叠态改为 `display: none`——内容**完全不在文档流里**，不产生任何文字盒；展开态 `display: block` 回到正常文档流，条目依次排列。展开动画改为纯透明度入场（`panel-in`，`html[data-motion='on']` 才生效，`prefers-reduced-motion` / `?motion=off` 自动关闭） | `src/styles/layout.css`（`.spec-row__detail` / `.faq-item__body`） |
| b | **移动端章节指示是固定浮层**：`.hud` 用 `position:fixed; bottom:18px; left:50%; transform:translateX(-50%)`，浮在正文上，压住画布读数 | 移入**顶栏内部**，成为顶栏里的正常流元素（桌面端 `display:none`，由左侧导航轨承担同一职责）。不再有 `position:fixed` / `transform`，也不再浮在正文上 | `index.html` + `src/styles/layout.css`（`.hud`） |
| c | **画布操作提示与画布 HUD 面板相交**：`.stage__hint` 绝对定位居中于画布底部，窄屏时画布只有 ~153px 高，而读数面板高 170.6px（还会被 `.stage` 的 `overflow:hidden` 裁掉底部 ΔE00 行） | 提示行移出画布、落到画布下方的**正常流说明行**；读数面板在窄屏收紧内边距与行距、手机宽度让出色块，保证完整落在画布内 | `index.html` + `src/styles/layout.css`（`.stage__hint`）+ `src/styles/components.css`（`.stage__readout`） |

### 5.3 顺带修掉的同构缺陷（同一次自查发现）

1. **`</main>` 闭合标签错位**：07「来源与许可」区块被落在 `<main>` 之外，
   因此拿不到 `main { padding-left: var(--rail-w) }` 的让位，章节编号滑到固定导航轨底下
   （桌面 `i「00」× span.section-head__num「07」` 100%、319px²）。已把 `</main>` 移回区块之后。
2. **顶栏在手机宽度折成三行**：≤620px 让出品牌副标题「千色仪」、收紧间隔与章节指示内边距，
   320/360/390/834/1440 五档均无横向溢出、顶栏保持两行。

### 5.4 修前 / 修后对比

| 口径 | 修前 | 修后 |
|---|---|---|
| 13 的检测器 + 13 的测量位置（滚动 0） | desktop **0** / mobile **1**（`stage__hint`×`readout__k`） | desktop **0** / mobile **0** |
| 13 的检测器 + 多滚动位置采样（本目录更严：20/26 个位置） | desktop 8 / mobile 41（其中折叠区越界 8 / 19） | desktop **0** / mobile **0**（真实压盖） |
| 结构性自检（`qa/verify.mjs` 新增 10 条断言） | 无此项 | 折叠面板零文字盒、指示器在顶栏内非固定层、提示行与 HUD 面板零交集、面板完整落在画布内、所有区块在 `<main>` 内（桌面 + 移动各一遍） |

**残余（不计入压盖）**：多滚动位置采样仍会报出 desktop 4 对 / mobile 41 对，
全部是「固定外壳层压在滚动内容上」——粘性顶栏（DS §4.2 明确规定 `position: sticky` +
`backdrop-filter: blur(12px)`）及其内的导航项、章节指示与 CTA。
这类重叠是外壳层的既定行为：顶栏底色 82%（滚动后 92%）不透明 + 模糊，被盖住的正文不构成
「两段文字互相压盖」，13 的检测器在滚动位置 0 也测不到。若要彻底归零只能取消粘性顶栏，
与 DS §4.2 冲突，故保留并在 `qa/d1-overlap.mjs` 的报告里单列一类。

### 检测器口径建议（给 13）

1. 判断「固定层」必须查**祖先链**：`position: fixed` 的顶栏，其子元素 `position` 是 `static`；
   只看元素自身会把「顶栏文字与滚动内容相交」全部误报。
2. 判定遮挡应用 `document.elementFromPoint()`：取不到该文本元素 → 它被祖先裁剪 → 不算遮挡。
3. 整页截图在页面高度 × DPR 超过 Chromium 约 16384px 时会**分块重复**（首块的固定层与封面会出现在末尾），
   这是截图流水线的问题而非页面缺陷 —— 本目录脚本已自动降 DPR 规避，见 `README.md`《整页截图做法》。

---

## 6. 余晖设计系统接入（MIGRATION-NOTES 派单 · 2026-10-21 23:05–23:45）

依据 `15-supervisor` 转发的 `16-design-system/MIGRATION-NOTES.md`（§0 接入三步、
§2.6 的 01-web 行、§3 通用组件、§5 无障碍、§6 子路径、§7 降级、§9 验收清单 V.1–V.11）。

### 6.1 接入三步落地

| 步 | 规范写法 | 本目录实际落地 | 说明 |
|---|---|---|---|
| ① | 拷贝 `16-design-system/src/tokens.css` + `src/components.css` → 本项目 `assets/ds/` | `public/assets/ds/tokens.css`、`public/assets/ds/components.css`（**逐字节拷贝**，`diff` 校验一致） | Vite 工程的静态目录是 `public/`；发布后落到 `dist/assets/ds/**`，即线上 `<作品路径>/assets/ds/**`，与 §6「发布前必查」的路径形状一致。`vite.config.ts` 的 `publicDir` 显式指向 `public` |
| ② | 拷贝 `16-design-system/fonts/` → `assets/ds/fonts/`，引入 `assets/ds/fonts/fonts.css` | `public/assets/ds/fonts/`（5 个 woff2 + `fonts.css` + 5 份 OFL 许可全文 + `FONT-MANIFEST.json`），由 `index.html` 的 `<link>` 引入。**与 16 源文件逐字节一致**（`diff` 校验：`tokens.css` / `components.css` / `fonts.css` / `noto-sans-sc-subset.woff2` / `OFL-noto-sans-sc.txt` / `FONT-MANIFEST.json` 全部一致）；`noto-sans-sc-subset.woff2`（197 600 B）与 `fonts.css` 里的 `@font-face` **未删未改**，子集作为渐进增强兜底保留在系统 CJK 栈之后 | `@font-face` 用相对 `url("./x.woff2")`，与字体文件同目录 → 任意子路径可用；**替换掉上一版的 @fontsource**（空依赖已从 package.json 与 lock 同步移除，`npm ci` 校验通过） |
| ③ | 入口注入 `:root{--ds-base:"/playtime-atlas-20261021/";}`，`<body>` 加 `class="ds-shell"` | `index.html` 注入 `--ds-base`；`<body class="ds-shell">`；顶栏 `ds-topbar`、页脚 `ds-footer`、跳转链 `ds-skip` | **偏差（已登记）**：`--ds-base` 注入的是作品路径 `/playtime-atlas-20261021/works/01-chroma-s1/` 而非批次根 —— 本作品页比批次根深一层，§6 的「运行时基准由构建注入」应指向本页所在目录；若 14-publish 改作品目录名，只需改这一行。本页所有资源走相对路径（Vite `base:'./'`），该变量不被任何 URL 拼接使用 |

### 6.2 执行项（通用项 G.1–G.7）

| 项 | 要求 | 本目录状态 | 依据 |
|---|---|---|---|
| **G.1** | 引入 `assets/ds/tokens.css` + `assets/ds/components.css` | ✅ 已引入；`--ds-*` **只声明一次**（本目录 `src/styles/tokens.css` 已删除全部 `--ds-*` 取值声明，只留语义别名层） | §0 风险 B；§2.6「整体替换，不是追加第二份」 |
| **G.2** | 页头 `.ds-topbar`、页脚 `.ds-footer`、`.ds-skip` | ✅ 三个类名已挂到既有元素上（**增量类名**，未删除既有 CSS） | §3、§10「增量类名 + 变量」 |
| **G.3** | 标题禁止 `white-space: nowrap` | ✅ 全页无标题使用 nowrap（断言 G.3）；现存 4 处 nowrap 均在非标题元素（跳转链隐藏态、章节指示 chip、画布说明行、移动端导航项） | §5、§10 红线 |
| **G.4** | `:lang(zh)` 字距归零、行高 1.85 | ✅ `body.ds-shell` 显式声明 `letter-spacing: var(--ds-track-cjk)`（=0）与 `line-height: 1.85`。**需要显式覆盖的原因**：16 的 `.ds-shell` 给 `<body>` 设了通用 `letter-spacing: -0.005em`（负字距）与 `line-height: 1.6`，同特异性下会盖住 DS 的 `:lang(zh)` 规则 —— §10 红线「禁止给中文加负字距」 | §5、§5.3、§10 红线 |
| **G.5** | 状态/元信息用 `--ds-font-mono` | ✅ 章节编号、编号轨、读数、来源序号等已是等宽体（本次未新增改动） | §3 |
| **G.6** | 保留既有功能；风格迁移不得破坏可读性 | ✅ 主回归 `npm run qa` **65/65 通过**（光谱实验台的滑块、模式切换、样本点选、读数重算全部照旧）；DS 自检 **18/18** | §4 K.1–K.6 |
| **G.7** | 资源相对化，适配 `/playtime-atlas-20261021/` 子路径 | ✅ 产物内 **0 个绝对根路径**；DS 三个样式表与 5 个字体文件均为相对引用；`dist/assets/ds/**` 原样发布 | §6 |

### 6.3 令牌层对齐（§2.6 / §0 风险 A / §5.2 / §5.3）

上一轮落地的是 16 的**旧版快照**（118 个 `--ds-*`），本次按 MIGRATION-NOTES 整体替换为
`public/assets/ds/tokens.css`（16 的 `src/tokens.css`，130 个 `--ds-*`）：

| 项 | 旧值 | 新值 | 说明 |
|---|---|---|---|
| `--ds-ink-faint` | `#a79e97`（**2.54:1，不达 AA**） | `#6e655e`（5.51:1） | §5.2：旧值是本系统自己的历史取值，**不是**参考站的灰（参考站实测为 `#999999`，2.85:1，同样不达标）；本系统的现值是无障碍驱动的规范性偏离 |
| `--ds-ink-soft` | `#6b625c` | `#59514b` | §2.6 明列 |
| 缺失令牌 | 缺 `--ds-radius-xs` / `--ds-shadow-1` / `--ds-dur-instant` / `--ds-space-1` / `--ds-font-display` | 已随 16 的令牌层补齐 | §2.6 |
| 中文字体栈顺序 | `Space Grotesk, Noto Sans SC, …, PingFang SC`（子集在前，会混排错位） | `Space Grotesk, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Source Han Sans SC, Noto Sans SC` | §5.3 硬性：覆盖完整的 CJK 族必须排在覆盖有限的子集之前 |

`qa/ds-verify.mjs` 的 V.3 逐名逐值比对**运行期实际生效值**与 16 的令牌层：129 个变量全部一致。

### 6.4 本轮新增/修改的文件

| 文件 | 改动 |
|---|---|
| `public/assets/ds/tokens.css`、`public/assets/ds/components.css`、`public/assets/ds/fonts/*` | 新增（逐字节拷贝自 `16-design-system/`，含 5 份 OFL 许可全文与 `FONT-MANIFEST.json`） |
| `index.html` | 引入三个 DS 样式表；注入 `--ds-base`；`<body>`/顶栏/页脚/跳转链加 `ds-*` 类 |
| `vite.config.ts` | `publicDir: 'public'`（显式）+ 注释说明 DS 资产发布路径 |
| `src/styles/tokens.css` | **删除全部 `--ds-*` 取值声明**（改为纯语义别名层 + 本作品自有变量），头部注明依据与「只声明一次」的理由 |
| `src/styles/base.css` | 新增 `body.ds-shell` 的中文排版对齐（字距归零、行高 1.85） |
| `src/styles/components.css` | 滑块命中区 22px → 44px（DS §5.1 主控件）；按钮基线最小高 40px → `var(--ds-target-min)`(44px) |
| `src/styles/layout.css` | 手机断点的 `body` 规则改为 `body.ds-shell`（保持对 `.ds-shell` 的优先级） |
| `src/main.ts` | 移除 9 条 `@fontsource` import（改由 DS 的 `fonts.css` 提供） |
| `package.json` / `package-lock.json` | 移除 3 个空依赖 `@fontsource/*`（两者同步，`npm ci --dry-run` 校验通过） |
| `qa/ds-verify.mjs` | 新增：DS 接入验收自检（V.1–V.11 + G.1–G.7 + 派单口径），产出 `qa/ds-report.json` |

### 6.5 验收自检结果（`npm run qa:ds` → **21/21 通过**）

| 编号 | 检查 | 结果 |
|---|---|---|
| V.1 | 1440 / 1280 / 768 / 390 四档横向溢出 | 0px / 0px / 0px / 0px ✓ |
| V.2 | 正文对比度 ≥4.5、大字 ≥3 | 抽查 297 处文字，最低 **4.68:1** ✓ |
| V.3 | 令牌一致性（运行期实际值 vs 16 令牌层） | **129 个 `--ds-*` 逐名逐值一致** ✓ |
| V.4 | 命名空间冲突（本目录不再声明 `--ds-*`） | 0 处重复声明 ✓ |
| V.5 | 焦点可达 + 焦点环可见 | 25 个 Tab 站 / 25 个不同目标；焦点环 `0 0 0 2px bg + 0 0 0 4px accent` ✓ |
| V.6 | 触摸目标 ≥24px / 主控件 ≥44px | 62 个可交互元素全部达标 ✓ |
| V.7 | reduced-motion 降级 | `--ds-dur-base`/`--ds-entry-duration` → 1ms，位移归零 ✓ |
| V.8 | 运行期外部请求 | 0 个 ✓ |
| V.9 | 字体本地加载、无 CDN | 5 个 `@font-face` 相对 URL；三族 `document.fonts.check` 全 true ✓ |
| V.11 | 中文字体栈顺序 | 系统栈在前、Noto 子集在后 ✓ |
| V.11b | 泛用族位置 | `-apple-system` 也在 `Noto Sans SC` **之后** ✓ |
| 派单三项 | token 待办 | `--ds-ink-faint #6e655e`（5.51:1）、`--ds-ink-soft #59514b`（7.51:1）、`--ds-target-min 44px` ✓ |
| 派单红线 | Noto 子集 + `@font-face` 原样保留 | `fonts.css` 5 个 `@font-face`、子集 200 / 197 600 B ✓ |
| G.1–G.7 | 通用项 | 全部通过 ✓ |

### 6.6 暂缓项与理由

| # | 暂缓项 | 理由 |
|---|---|---|
| 1 | **不把本目录的 `assets/ds/` 放在 Vite 工程根目录**（规范示例路径为 `<项目>/assets/ds/`） | Vite 的静态目录是 `public/`；放根目录会被当作源码资产参与打包，字体与样式表会失去「原样发布」与相对 URL 的性质。实际落地为 `public/assets/ds/`，发布产物路径仍是 `<作品路径>/assets/ds/**`，与 §6「发布前必查」的路径形状一致 |
| 2 | **不启用 `Noto Sans SC` 子集**（文件已随包复制，但页面不引用） | 子集按 07-museum-art 自身用字生成，覆盖本页汉字不充分；且 §5.3 已把系统栈排到子集之前，子集只在系统栈整体不可用时兜底。当前中文走系统字体栈（0 字节、覆盖完整、离线可用） |
| 3 | **不把按钮/表单/画布容器整体换成 `.ds-btn` / `.ds-field` / `.ds-canvas-frame`** | §3 的组件替换表针对「各自写的」控件；本作品的按钮族、表单控件、画布容器是**实验台的一部分**，已用 DS 令牌落地且可点性/可读性已通过 65 条断言与 18 条 DS 断言。G.2 只要求页头/页脚/跳转链换类名，已执行。换类名会引入第二套尺寸与圆角规则，收益低于破坏实验台的风险（§4 K.2/K.3 与本任务「实验台可用性优先」） |
| 4 | **不采用 DS 的 `.ds-rail` 替换左侧章节索引轨** | 与上一轮同一判断：§3/§14.3 只要求沉浸式作品套 `.ds-rail`；本作品是竖排索引轨，配色与字阶已用 DS 令牌。导航轨在桌面承担章节索引，结构不动 |
| 5 | **不改 `--ds-base` 的注入方式为构建期注入** | 当前是入口 `<style>` 注入，值为作品路径；本页所有资源走相对路径，该变量不被任何 URL 拼接使用，改成构建期注入的收益仅是「换目录名时少改一行」，暂不引入构建期变量通道 |
| 6 | **不引入 16 的 `preview.html` 或 `evidence/`** | 前者是 16 的视觉对照物，后者是参考站的观察证据；两者都不是本作品产物，不得进入发布包（§2.1 第 2 条） |

---

## 7. 已发现并修复的问题

完整记录见 `QA.md` 第 4 节。要点（12 处）：

1. `controls.update()` 与 `change` 事件互相触发 → 无限递归爆栈（加重入保护）。
2. 光谱基准曲线在模块初始化时取了一次就再没更新 → 换样本后曲线与 ΔE00 全部错。
3. `spectrumToRgb` 误把 XYZ 当成 L\*a\*b\* 做逆变换 → 颜色全错。
4. 噪声按绝对量叠加 → 暗色样本被噪声淹没（改为随响应峰值缩放的相对噪声）。
5. 金属材质缺环境贴图 → 三维机身发黑（加 `RoomEnvironment` + PMREM）。
6. 入场动画的终态依赖动画时间轴 → 在被节流的环境里标题与画布永久不可见。
7. `ExtrudeGeometry` 的 UV 不适合贴 CanvasTexture → 机身小屏错位（改 `PlaneGeometry`）。
8. 爆炸图外壳泛白压住内部件（改扁平幽灵材质）。
9. 索引轨圆点压住编号（去圆点，改状态色块）。
10. 指标卡 `380–780 nm` 折行（字号 + nowrap）。
11. 首页读数面板压住机身（台面改 5:4、相机后移下压目标点）。
12. 拆解视图面板标题不跟随展开状态（改状态联动 + 增 2 条断言）。

改版阶段另修 4 处：

13. 读数浮层在深色画布上沿用浅色主题墨色 → 数值不可见（改 `--ds-canvas-hud-ink`）。
14. 画布改 21:9 后仪器在画幅中过小、偏下（相机按 aspect 自适应取景）。
15. 封面主 CTA 40px 未达 DS §11.1 的 44px 触摸目标（提升到 48px）。
16. 移动端导航被整体隐藏 → 手机上无法跳转章节（改为横向可滚动）。

D1 修复阶段另修 4 处（详见 §5）：

17. 规格矩阵与 FAQ 的折叠内容靠 `overflow:hidden` 裁剪 → 文字盒越出面板 81px 压到下一行标题
    （改为折叠态 `display:none`）。
18. 移动端章节指示是底部固定浮层 → 压在正文读数上（移入顶栏，成为顶栏内的正常流元素）。
19. 画布操作提示与画布 HUD 读数面板在窄屏相交，且面板被 `.stage` 裁掉 ΔE00 行
    （提示行移出画布进正常流；面板窄屏收紧并让出手机宽度下的色块）。
20. `</main>` 闭合标签错位 → 07「来源与许可」区块落在 `<main>` 之外，章节编号滑到固定导航轨底下
    （把 `</main>` 移回区块之后；同时修掉顶栏在手机宽度折成三行）。

DS 接入阶段另修 2 处（DS 自检 V.6 抓出，见 §6）：

21. 滑块 `input[type=range]` 命中区只有 **22px**（低于 AA 2.5.8 的 24px）→ 改为 44px
    命中区，视觉轨道仍为 2px 发丝线（实验台在手机上要能稳稳拖动）。
22. 按钮基线最小高 40px、主按钮 40px（低于 DS §5.1 的 44px 目标）→
    `.btn` 基线改用 `var(--ds-target-min)`（44px），紧凑变体 `.btn--sm` 保持 32px（唯一豁免）。

---

## 8. 已知限制（如实记录）

| 限制 | 说明 |
|---|---|
| 参考原帖的转发数、收藏数未核到 | X 公开接口不返回这两项，未登录页面也不渲染数值。已在 `SOURCE.md` / `SOURCES.md` 标注，不用点赞数折算 |
| 候选样本不等于全网 | 结论限定为「本次可核验集合中」，未做全平台穷尽统计，未声称全网第一 |
| 中文未打包字体 | 拉丁字体不含 CJK 字形，中文走系统字体栈；DS 的 `Noto Sans SC` 子集覆盖有限且会缺字，本目录未引入（见 `LICENSES.md` §1） |
| 双语尚未接线 | 页面仍为中文单语；zh/en key 骨架见 `i18n/en.draft.json`，切换控件待 19/14 统一接入（DS §4.3 的「中 / EN」chip 因此未加） |
| 顶部导航的 `aria-current="page"` 未实现 | 顶栏链接指向页内锚点而非独立页面，DS §4.2 的「当前页」语义在本作品不适用；章节轨的当前项用 `is-active` + 视觉高亮 |
| 导航轨保留原形态 | DS §14.3 只要求沉浸作品套 `.ds-rail`，01 属非游戏作品；本目录的竖排章节索引保留原设计，配色与字阶已用 DS token |
| 封面媒体比例 | 按 DS 用 21/9；因三维视口为交互画布，在 1440×900 下其下缘会落在首屏折叠线附近 |
| 三维有两个 WebGL 上下文 | 桌面浏览器普遍支持；个别老设备可能降级，此时主视图优先 |
| `npm run qa` 依赖本机 Chrome | 用 `channel: 'chrome'`，需要 `/Applications/Google Chrome.app`；未下载 Playwright 自带浏览器 |
| 英文草案未经母语审校 | `i18n/en.draft.json` 由本任务自撰，接入时需复核 |

---

## 9. 下一步（交给 14-publish）

- 发布目录：`01-web/dist`（`npm ci && npm run build` 产出，纯静态，零外部请求，相对路径适配 `/works/<id>/` 子路径）
- **设计系统资产随产物发布**：`dist/assets/ds/**`（tokens.css / components.css / fonts.css +
  5 个 woff2 + 5 份 OFL 许可全文 + `FONT-MANIFEST.json`），路径全部相对，线上形如
  `/playtime-atlas-20261021/works/01-chroma-s1/assets/ds/…`；**不要在发布流程里剔除**
- 随行素材：`01-web/screenshots/`（13 张，含两张整页长图）
- 必带文件：`01-web/manifest.json`、`01-web/LICENSES.md`、`01-web/SOURCES.md`、`01-web/DIFF-vs-SOURCE.md`、`01-web/README.md`、`01-web/QA.md`、`01-web/CHANGELOG.md`、`01-web/RESTYLE-INVENTORY.md`
- 本任务**不执行**上传与部署，也不上传任何凭据、日志或无关文件
