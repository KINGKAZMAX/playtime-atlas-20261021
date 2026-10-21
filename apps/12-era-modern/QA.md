# QA —《折光纪 · 当代可玩展厅》验收记录

- 验收日期：**2026-10-21**
- 验收对象：`12-era-modern`（构建产物 `dist/`）
- 验收环境：**Google Chrome（Playwright 驱动，channel=chrome，headless）**
  - 桌面视口 1440×900 / 1280×860，移动视口 390×844（deviceScaleFactor 2, isMobile, hasTouch）
- 验收方式：**浏览器实际驱动**（真实点击 / 键盘输入 / 像素采样 / localStorage 读取），
  非仅阅读源码；每步均取回渲染后的真实状态做断言。
- 产物形态验收：`dist/` 被复制到 `http://127.0.0.1:4399/repo/prism-era/`（**模拟 GitHub Pages 子路径**）后运行。

---

## 1. 结论

| 指标 | 结果 |
| --- | --- |
| 自动断言 | **49 / 49 通过** |
| 未捕获控制台错误 | **0** |
| 失败请求（4xx/5xx / requestfailed） | **0** |
| 运行时第三方域名请求 | **0** |
| 关卡可解性自检 | **4 / 4 通过**（`node scripts/test-levels.mjs`） |
| 文案骨架对等性自检 | **162 键一致**（`node scripts/check-i18n.mjs`） |
| 13 号原版探针复跑（D3 / D4 / D5） | **pass 8 / warn 0 / fail 0 / skip 1** |
| 无障碍与降级自检（V.1—V.9 抽样） | **11 / 11 通过** |
| 自托管字体落地专项自检 | **11 / 11 通过**（族名 / 字面加载 / Canvas 文本测量 / 令牌指向） |
| 设计系统机械验收（`scripts/verify-ds.mjs`） | **14 组检查：13 pass / 1 warn / 0 fail / 0 error，verdict = PASS**（四路由 × 四视口；溢出 / 组件 / 对比度 / 触摸目标 / reduced-motion / 令牌一致性 121 项 / 字体栈顺序 / 零外链 / 中文排版 254 元素） |
| 子路径部署 | ✅ `/repo/prism-era/` 下全流程通过 |

> 本文件同时记录**第一轮**（立项 → 交付）、**第二轮**（改版派单轮：缺陷修复 + 增量改版 + 复验）与
> **第三轮**（接入 16 号设计系统：接入四步 + 组件类落地 + 规范级复验）的验收结果。

---

## 1.5 第二轮（改版派单轮）复验记录

> 验收时间：2026-10-21 晚间 · 产物形态：改版后重新构建的 `dist/`，
> 复制到模拟 Pages 子路径 `http://127.0.0.1:4399/repo/prism-era/` 后运行。

### 1.5.1 13-qa-curation 指出的 4 条问题 —— 全部修复

13 号的验收脚本（`13-qa-curation/qa-harness/lib/probes-era.mjs`）被**原样引入**复跑
（直接 `import { probeEraGame }` 引用 13 的源码，不做改写），结果：

| 维度 | 断言 | 结果 | 实测 |
| --- | --- | --- | --- |
| D3 | 进入可玩展品 | ✅ | 点击展品入口「进入《脉冲走廊》」（`[data-exhibit]`） |
| D3 | 游戏载体存在 | ✅ | 找到游戏面：`[data-game-root]`（<div> 984×928） |
| D3 | 开始流程 | ✅ | 点击「开始」（data-control）后 state=**playing** |
| D3 | 暂停流程 | ✅ | 点击「暂停」（data-control）后 state=**paused** |
| D3 | 重开流程 | ✅ | 点击「重开」（data-control）后 state=**playing** |
| D3 | 难度切换 | ⏭ skip | 该页无独立难度控件（节奏游戏以曲目等级 LV1/LV2/LV3 表达难度） |
| D4 | 本地存档键 | ✅ | `prismera.v1.progress` |
| D5 | 键盘焦点作用域（未聚焦不响应） | ✅ | activeElement=BODY，位于游戏区=false，state=paused 时按键**未驱动**游戏状态 |
| D5 | 键盘焦点作用域（聚焦后响应） | ✅ | 聚焦（root）后按键**正常驱动**游戏状态 |

**汇总：pass 8 / warn 0 / fail 0 / skip 1**，控制台错误 0，失败请求 0。

对照 13 号原始 `issues.json` 的 4 条：

| id | 原问题 | 修复方式 | 复验 |
| --- | --- | --- | --- |
| QA-036 | 既没有子页链接，也没有找到展品入口控件 | hero CTA 与三张展项卡加 `data-exhibit` | ✅ D3「进入可玩展品」 |
| QA-037 | 点击「进入《脉冲走廊》」后未进入可玩状态（state=n/a） | 新增 `src/core/debug-state.js`，暴露 `window.__eraGame`（字符串 `state`） | ✅ D3「开始流程」state=playing |
| QA-038 | 未暴露可观测游戏状态，无法自动比对运动量 | 三展项实时发布 `state`/`score`/`player`（含数值字段） | ✅ D5「未聚焦不响应」 |
| QA-039 | 已聚焦但按键未观测到状态变化 | 舞台加 `data-game-root` + `tabindex="0"`；键盘焦点门；`player.presses` 必增 | ✅ D5「聚焦后响应」 |

### 1.5.2 无障碍与 reduced-motion 自检（11 项）

| 项 | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| V.1 | 水平溢出 @1440px | ✅ | 0px |
| V.1 | 水平溢出 @1280px | ✅ | 0px |
| V.1 | 水平溢出 @768px | ✅ | 0px |
| V.1 | 水平溢出 @390px | ✅ | 0px |
| V.2 | 关键文本对比度（30 个选择器） | ✅ | 全部达标，最低 `.tag` **4.68:1**（门槛 4.5:1） |
| V.6 | 触摸目标高度 ≥ 24px | ✅ | 抽样 11 个控件，最小高 **32px** |
| V.9 | 运行期零外部请求 | ✅ | 跨域请求 0 |
| V.7 | reduced-motion 动效时长归零 | ✅ | 抽样 58 项，最大 **0.001s** |
| V.7 | 降级后节拍提示仍在 | ✅ | 画布仍在绘制（像素采样非空采样点 > 50），HUD 照常显示 |
| 玩法 | 折光阁线索图例与接收环指示齐全 | ✅ | 图例「青光接收环 / 品红光接收环 / 分光镜」；接收环 1 个；色样 `rgb(79,227,208)` `rgb(255,95,162)` `rgb(157,123,255)` |
| 玩法 | 折光阁控件命中区 ≥ 24px | ✅ | 撤销 51×32 · 提示 51×32 · 重置 51×32 · 视角复位 76×32 |

### 1.5.3 改版后「玩法画面优先」的三条口径

| 口径 | 判定方式 | 结果 |
| --- | --- | --- |
| **节奏提示仍清晰** | 画布内下行光带 / 收缩节拍环 / 顶部拍点标尺 / 判定线 / 四类判定色的**取值未改**（红线 K.1）；HUD 承载面改为 `--ds-canvas-hud-bg` 深色半透明，判定统计照常产生 | ✅ 静音与有声两模式均产生判定与分数 |
| **解谜线索仍可辨认** | HUD 图例色样与 3D 光束色**一一对应**（青 `rgb(79,227,208)` / 品红 `rgb(255,95,162)`），「颜色不符」负反馈仍为 `#ff6b81` | ✅ 图例与接收环指示均实测取到原值 |
| **控件仍可点** | 折光阁四个 HUD 按钮命中区实测 51×32 ~ 76×32 px；展厅 CTA / 导航 / 展项卡 ≥ 32px | ✅ 全部 ≥ 24px（AA 2.5.8） |

### 1.5.4 文案骨架对等性

`node scripts/check-i18n.mjs` → `zh 键数 162 / en 键数 162`，键集合一致、无空文案、占位符对齐。

### 1.5.5 自托管字体落地专项自检（11 项）

改版卸载 `@fontsource-variable/*` 后，字体链路有两处**静默降级**（不报错、不断言失败）。
为此单独写了 11 项专项断言（详见 §8 缺陷 13–15）：

| # | 断言 | 结果 | 实测 |
| --- | --- | --- | --- |
| 1 | Space Grotesk 已加载 | ✅ | `status: loaded` |
| 2 | Space Mono Regular(400) 已加载 | ✅ | `status: loaded` |
| 3 | **Space Mono 粗体字面已真正取回** | ✅ | `status: loaded`（修复前为 `unloaded`） |
| 4 | Canvas 等宽文本确实使用 Space Mono | ✅ | 宽度 161.57 vs 不存在族名 158.43 |
| 5 | Canvas 等宽**粗体**未被静默回落 | ✅ | 宽度 161.57 vs 158.43 |
| 6 | Canvas 展示体确实使用 Space Grotesk | ✅ | 宽度 941.33 vs 993.67 |
| 7 | `--ds-font-display` 指向 Space Grotesk | ✅ | — |
| 8 | `--ds-font-mono` 指向 Space Mono | ✅ | — |
| 9 | 节奏游戏 Canvas 实际字体为自托管族 | ✅ | `600 12px "Space Mono", ui-monospace, …` |
| 10 | Canvas 字体不再引用已卸载的 `*Variable` 族名 | ✅ | 残留 0 处（原 9 处） |
| 11 | 控制台零错误 | ✅ | 0 条 |

> 附带发现：`document.fonts.check('700 12px "Space Mono"')` 在粗体字面仍为 `unloaded` 时**也返回 true**，
> 不能用它判断字重是否就绪；因此 `preloadFonts()` 自行记录加载状态，
> 并以**文本测量宽度与「不存在的族名」不同**作为最终判据。

---

## 1.6 第三轮（接入 16 号设计系统）复验记录

> 验收时间：2026-10-21 深夜 · 产物形态：接入 16 号规范后重新构建的 `dist/`，
> 复制到模拟 Pages 子路径 `http://127.0.0.1:4399/repo/prism-era/` 后运行。
> 派单来源：`15-supervisor` 第三轮派单（改版执行 · 规范已就绪），规范依据 `16-design-system/MIGRATION-NOTES.md`。
> 新增验收脚本：`scripts/verify-ds.mjs`（零第三方依赖，Node 内置 + 本机 Chrome 原生 CDP）。

### 1.6.1 接入四步的落地情况（`MIGRATION-NOTES §1`）

| 步 | 规范要求 | 本厅落地 | 证据 |
| --- | --- | --- | --- |
| ① 令牌层 | `tokens.css` 进入本厅 | `public/assets/ds/tokens.css` = 16 号 `src/tokens.css` **原样副本**（仅追加来源说明头；原文件 sha256 `e9595d51…f368`） | `index.html` 第 18 行 `<link rel="stylesheet" href="./assets/ds/tokens.css">` |
| ② 字体 | `fonts/fonts.css` + 自托管 woff2 | `public/assets/ds/fonts/`：5 款 woff2（含 `noto-sans-sc-subset.woff2`）+ `fonts.css` + 5 份 OFL 全文 + `FONT-MANIFEST.json` | 第 20 行 `<link href="./assets/ds/fonts/fonts.css">`；`dist/assets/ds/fonts/` 已随产物发布 |
| ③ 换外壳 | `components.css` + `.ds-shell` | `public/assets/ds/components.css` = 16 号原样副本（sha256 `a602f414…0f51`）；`<body class="ds-shell">` | 第 19 行 `<link href="./assets/ds/components.css">`；第 28 行 `<body class="ds-shell">` |
| ④ 注入 `--ds-base` | 由构建注入站点基准路径 | `index.html` 第 26 行 `<style>:root{--ds-base:"/playtime-atlas-20261021/";}</style>`（取 `design-tokens.json → meta.basePathVar` 权威值） | 运行时实测 `--ds-base` 生效；本厅产物自包含，自身资源**全相对路径**，可部署于任意子路径 |

**副本完整性**：三份副本的**正文逐字节一致**，只在文件头追加来源说明；本目录**不修改** 16 号副本的任何一行规则。
`src/styles/fonts.css` 与 `src/fonts/`（第二轮自托管副本）已删除，避免与 DS 副本重复声明字体。

**层叠顺序实测**：构建产物中 DS 的三份 `<link>` 在**前**，Vite 注入的本厅 CSS 在**后**
→ 本厅规则层叠优先，组件类冲突可就地校正（见 §8 缺陷 21 / 22）。

### 1.6.2 设计系统机械验收（`scripts/verify-ds.mjs`，14 组检查）

> 判定口径：**0 failure / 0 error → PASS**。本轮结果 `pass 13 / warn 1 / fail 0 / error 0`，`verdict = PASS`。
> 机读结果：`evidence/ds-verification.json`；截图：`evidence/ds/`（4 路由 × 4 视口 = 16 张）。

| # | 检查组 | 结果 | 实测 |
| --- | --- | --- | --- |
| 1 | 无横向溢出 | ✅ pass | 1440 / 1280 / 768 / 390 四档 × 四路由，溢出均为 0 |
| 2 | 关键组件齐备 | ✅ pass | 14 类 `.ds-*` 组件均已渲染（见 §1.6.4） |
| 3 | 文本对比度达标 | ✅ pass | 9 个选择器全部达标，**最低 4.68:1**（`.ds-tag`） |
| 4 | 触摸目标 ≥24px（WCAG 2.2 AA） | ✅ pass | 所有 `button / a[href] / input / select` 均 ≥24px，低于 AA 者 0 个 |
| 5 | 主控件触摸目标 ≥44px（AAA） | ✅ pass | `.ds-btn` / `.ds-iconbtn`（排除 `.ds-btn--sm`）全部 ≥44px，低于 AAA 者 0 个 |
| 6 | reduced-motion 关闭动效 | ✅ pass | 四条路由 `--ds-dur-base` / `--ds-entry-duration` 均为 **1ms**；最大动效 1ms；回响画布仍可绘制且 HUD 判定文本仍在；中庭图例色块齐全 |
| 7 | 令牌一致性 | ✅ pass | JSON 令牌 **213** 项 / 可映射 **142** 项 / 实比 **121** 项；`:root` 变量 **129** 个，取值全部一致（大小写 / 空白 / rgba 写法 / `var()` 引用已归一）；无缺失变量、无值不一致 |
| 8 | 令牌一致性 · 字体栈 | ⚠️ warn | `--ds-font-mono`：CSS = `Space Mono, ui-monospace, SFMono-Regular, Menlo, **Consolas**, monospace`；JSON = `Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace`。**差异源自 16 号 `tokens.css` 本身**，本厅未改；记入 `STATUS.md` L-12，待 16 号确认 |
| 9 | 字体栈顺序（V.11） | ✅ pass | `Noto Sans SC` 位于所有完整 CJK 族之后：`--ds-font-display = [Space Grotesk · PingFang SC · Hiragino Sans GB · Microsoft YaHei · Source Han Sans SC · **Noto Sans SC** · -apple-system · BlinkMacSystemFont · sans-serif]`；`--ds-font-text` 同序（Inter 起） |
| 10 | 页面加载与本地资源 | ✅ pass | HTTP 加载正常，hall / pulse / atrium / halo 四路由均已挂载；270 个请求全部本地；样式表 5 份 / 518 条规则 |
| 11 | 零外部网络请求 | ✅ pass | 270 个请求全部同源，外部请求 **0**、字体 CDN 请求 **0**、失败请求 **0** |
| 12 | 字体自托管 | ✅ pass | Space Grotesk / Inter / Space Mono(400) / Space Mono(700) 均 `loaded`；无任何字体 CDN 请求 |
| 13 | 标题未使用 `nowrap` | ✅ pass | 4 个标题元素 `white-space` 均为 `normal`：`.ds-cover__title`（折光纪）、`.ds-work__title` ×3（脉冲走廊 / 折光阁 / 光环台） |
| 14 | 中文排版 | ✅ pass | **254** 个中文文本元素字距均为 **0px**；正文行高均 **≥1.85**；字距违规 0、行高违规 0 |

### 1.6.3 令牌一致性核验明细（V.3 / §9.1 复核四步之①）

| 项 | 值 |
| --- | --- |
| 取值来源 | `16-design-system/design-tokens.json`（213 个 `$value` 叶子，嵌套语义树） |
| 可映射令牌 | 142 项（其余为语义分组节点或无 `$value` 叶子） |
| 实际逐值比对 | **121 项**，**全部一致** |
| `:root` 变量总数 | 129 个；深色作用域 21 个 |
| 值不一致 | **0**（`mismatches` 中唯一条目是第 8 组 warn，非取值冲突） |
| 缺失变量 | **0** |
| 未映射条目 | 1 个（`a11y.focusRing`，JSON 中为嵌套别名，未直接落成 CSS 变量） |

> 归一化口径：大小写不敏感、空白压缩、hex 小写、rgba 数值归一（`rgba(20,17,15,.44)` ≡ `rgba(20, 17, 15, 0.44)`，`alpha=1` 归为 `rgb`）、`var()` 引用在同一块内解析。

**唯一声明处校验**：本目录 `src/styles/tokens.css` 已剥离全部 **165** 处 `--ds-*` 声明，
只保留 ①语义别名层 ②`--hc-*` 高对比间接层 ③`--prism-*` 玩法语义色 ④`:lang(zh)` 规则。
`--ds-*` 取值**只**在 `assets/ds/tokens.css` 一处声明（`MIGRATION-NOTES §0 风险 B`）。

### 1.6.4 14 类 `.ds-*` 组件的落地清单

| 组件类 | 落地位置 | 覆盖路由 | 实测尺寸 @1440 |
| --- | --- | --- | --- |
| `.ds-topbar` | `src/ui/shell.js`（`.site-header` 之上叠加） | hall / pulse / atrium / halo | 1440 × 86，`display:flex`，四路由均可见 |
| `.ds-footer` | `src/ui/shell.js` | hall / pulse / atrium / halo | 1440 × 235，`display:flex` |
| `.ds-skip` | `index.html` 静态首元素 | hall / pulse / atrium / halo | 112 × 54，Tab 第一个可达 |
| `.ds-cover` | `src/views/hall.js`（主视觉） | hall | 1440 × 780，`display:flex` |
| `.ds-work` | `src/views/hall.js`（展项卡） | hall | 411 × 376，`display:flex` |
| `.ds-detail__title` | `src/rhythm/pulse.js` / `src/puzzle/atrium.js` / `src/vr/halo.js`（三展项 h1） | pulse / atrium / halo | 984×63 / 1184×39 / —，`display:block` |
| `.ds-btn--primary` | `src/views/hall.js`（主 CTA） | hall | 150 × 44，`display:flex` |
| `.ds-rail` | `src/views/hall.js`（年份跳转轴，`--horizontal` 变体） | hall | 1230 × 46，`display:flex` |
| `.ds-indicator` | `src/views/hall.js`（分区进度指示器） | hall | 62 × 56，`display:grid` |
| `.ds-chip` | `src/views/hall.js`（时间轴线索筛选） | hall | 54 × 36，`display:flex` |
| `.ds-input` | `src/views/hall.js`（关键词搜索）+ `src/core/settings.js`（校准滑杆） | hall | 420 × 52，`display:block` |
| `.ds-canvas-frame` → `canvas` | `src/rhythm/pulse.js` / `src/puzzle/atrium.js` / `src/vr/halo.js` | atrium / halo | 1182 × 629，`display:block` |
| `.ds-canvas-frame__hud` | `src/rhythm/pulse.js`（顶栏）/ `src/puzzle/atrium.js`（底栏） | pulse / atrium | 1158 × 65，`display:flex` |
| `.ds-diagram` | `src/puzzle/atrium.js`（折光阁图例） | atrium | 278 × 41，`display:flex` |

`.ds-canvas-frame` 的两条硬性属性由 16 号组件层直接提供，本厅**未改写**：
`contain: paint`（裁剪溢出，防止 3D 画布横向溢出页面）+ `isolation: isolate`（隔离层叠上下文）。

### 1.6.5 中文排版（V.5 / §9.1 之④）

| 项 | 规范要求 | 本厅实现 | 实测 |
| --- | --- | --- | --- |
| 中文字距 | 归零（禁止负字距） | `src/styles/cjk.css`（**最后导入**）`:lang(zh){letter-spacing:0}` | 254 个中文元素字距全为 `0px`，违规 0 |
| 中文正文行高 | ≥1.85 | `:lang(zh)` 下 `p / li / dd / .ds-body / .ds-lead / .ds-sm` 行高 1.85 | 行高违规 0 |
| 已有类规则中的字距 | 必须自行改用 `var(--ds-track-cjk)` | 6 条含汉字且特异度更高的规则已改（`.hero-fact span` / `.count-chip` / `.hud-block label` / `.result-track` / `.result-item label` / `.hud-stat label`） | 254 元素全过 |

> **为什么必须单独成文件**：`:lang(zh)` 与既有类名选择器**特异度相同**（均为 0,1,0），
> 只能靠**加载顺序**决胜，因此 `cjk.css` 在 `src/main.js` 中**最后导入**。

### 1.6.6 reduced-motion 的两条路径

| 路径 | 机制 | 实测 |
| --- | --- | --- |
| 系统偏好 | 16 号 `tokens.css` / `components.css` 的 `@media (prefers-reduced-motion: reduce)` 标准块 | 四路由最大动效 **1ms**（`--ds-dur-base` / `--ds-entry-duration` 均为 1ms） |
| 设置开关 | 本厅设置面板「减少动效」直接切 **`[data-rm="reduce"]`**（16 号自带机制） | 与系统路径同效；**本目录不再自写一份 `!important` 降级块**，避免与组件类打架 |

降级后**可玩信息不丢**：回响画布仍持续绘制（像素采样非空点 > 50）、HUD 判定四类文本仍在、
折光阁图例三色块齐全（`rgb(79,227,208)` / `rgb(255,95,162)` / `rgb(157,123,255)`）。

### 1.6.7 本轮新增的外壳层功能（不触碰玩法 / 文案 / 关卡 / 史料）

| 功能 | 实现 | 可访问性 | 实测 |
| --- | --- | --- | --- |
| 时间轴线索筛选 | `.ds-chip` ×6（全部 + 5 条线索） | `aria-pressed` + `aria-live` 计数 | 筛选后条目数实时更新 |
| 关键词搜索 | `.ds-field` + `.ds-input` | 原生 `input` + 关联 `label` | 420 × 52，输入即筛 |
| 年份跳转轴 | `.ds-rail--horizontal` | `aria-current` | 点击滚动到该年 |
| 分区进度指示器 | `.ds-indicator`（5 圆点 + 末段箭头） | `IntersectionObserver` 驱动 | 首段显示圆点、末段显示箭头、中段隐藏（避免压住正文） |

### 1.6.8 第三轮全量回归

| 套件 | 结果 |
| --- | --- |
| `scripts/verify-ds.mjs`（本轮新增） | 14 组：**13 pass / 1 warn / 0 fail / 0 error**，`verdict = PASS` |
| 自建浏览器 QA（49 项断言） | **49 / 49 通过**，0 控制台错误，0 失败请求 |
| 13 号原版探针 `probeEraGame` | **pass 8 / warn 0 / fail 0 / skip 1**（skip＝难度切换，本厅无独立难度控件） |
| 无障碍与 reduced-motion（11 项） | **11 / 11 通过** |
| 自托管字体落地专项（11 项） | **11 / 11 通过** |
| 关卡可解性（`scripts/test-levels.mjs`） | **4 / 4 通过** |
| 文案骨架（`scripts/check-i18n.mjs`） | **162 / 162 一致** |
| `npx vite build` | 退出码 0；`dist/` ≈ 1.1 MB |

---

## 2. 《折光纪 / PRISM ERA》展厅主站

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 1 | 标题渲染 | ✅ | 「折光纪」 |
| 2 | 主视觉 CTA 可见可点 | ✅ | — |
| 3 | 展项卡数量 = 3 | ✅ | 3 |
| 4 | 时间轴条目 ≥ 20 | ✅ | 24 |
| 5 | 时间轴来源链接 ≥ 23 | ✅ | 26 |
| 6 | 无障碍纯文本目录条目 ≥ 26 | ✅ | 27 |
| 7 | **字体全部本地自托管（无外链）** | ✅ | 外部字体请求 0 |
| 8 | 设置面板可打开 | ✅ | — |
| 9 | 设置开关数量 = 4 | ✅ | 4（静音 / 视觉节拍 / 减少动效 / 高对比）+ 校准滑块 |
| 10 | `Esc` 关闭设置面板 | ✅ | — |

**人工检查**
- 时间轴每条均含「事实描述」与「入馆理由」两行，二者不混写（符合史料与观点分离）。
- 页面显著位置写明「代表性选样，非编年全集」。
- 原创声明、VR 展项说明、来源与限制三块说明齐备。

---

## 3. 《脉冲走廊 / PULSE CORRIDOR》

### 3.1 静音视觉替代（硬性要求）

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 11 | 「视觉节拍模式」开关可切换 | ✅ | `aria-pressed=true` |
| 12 | 浏览器具备 AudioContext 能力 | ✅ | — |
| 13 | 点击「开始」后进入游戏舞台 | ✅ | — |
| 14 | **节奏画布已实际绘制**（像素采样） | ✅ | 非透明采样点 > 50 |
| 15 | **视觉节拍模式下未创建 AudioContext** | ✅ | 创建计数 **0** |
| 16 | 敲击产生判定统计 | ✅ | 极准 4 / 很准 0 / 尚可 2 / 失手 0 |
| 17 | 分数随判定更新 | ✅ | 5100 |
| 18 | 连击计数更新 | ✅ | 采样最大连击 5 |
| 19 | 准度已计算 | ✅ | 80.00% |

> **判定精度一致性**：游戏时钟统一为 `performance.now()`，音频仅为可选呈现层。
> 第 16–19 项在**完全静音**（无 AudioContext）下通过，第 23–24 项在**有声**下同样产生判定与分数，
> 证明两种模式走的是同一条判定时间轴，不存在「只有开声音才能玩」的情况。

### 3.2 有声模式与音频合规

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 20 | **用户交互前未创建 AudioContext** | ✅ | 计数 0 |
| 21 | **用户点击「开始」后创建且仅创建 1 个** | ✅ | 计数 1 |
| 22 | 有声模式可进入游戏 | ✅ | — |
| 23 | 有声模式同样产生判定 | ✅ | 极准 0 / 很准 1 / 尚可 1 / 失手 1 |
| 24 | 有声模式分数正常累计 | ✅ | 1150 |

### 3.3 流程控制

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 25 | `Esc` 暂停并弹出暂停面板 | ✅ | — |
| 26 | 暂停面板「继续」可恢复 | ✅ | — |
| 27 | `R` 重开并清零分数 | ✅ | 分数 0 |
| 28 | 设置写入 localStorage | ✅ | `prismera.v1.settings` |

### 3.4 人工检查
- 视觉节拍表达包含**四个相互独立的通道**：收缩节拍环（带 BEAT 计数）、从上方下行的节拍光带、
  顶部拍点标尺（每小节强拍高亮）、轨道键位区的拍点高亮。
- 轨道用形状标识（◆ ● ▲ ■）+ 文字键位（`D / ←` 等），不依赖颜色区分。
- 结算页给出评级（S/A/B/C/D）、分数、最大连击、准度、四类判定计数与平均反应时。

---

## 4. 《折光阁 / PRISM ATRIUM》

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 29 | 3D 画布已创建 | ✅ | `.atrium-canvas` |
| 30 | WebGL 上下文可用 | ✅ | 上下文创建成功 |
| 31 | **LV1 可在浏览器内实际通关** | ✅ | 接收环点亮 1 个 |
| 32 | 通关后出现结算面板 | ✅ | — |
| 33 | 结算面板给出星级 | ✅ | ★☆☆（未收集光点） |
| 34 | 「再玩一次」可关闭结算并重置本关 | ✅ | — |
| 35 | **通关结果写入 localStorage** | ✅ | `{"timeMs":4200,"motes":0,"stars":1}` |
| 36 | 键盘移动无报错 | ✅ | — |
| 37 | 提示按钮给出指向性提示 | ✅ | 「把这块反光板转成『斜杠 /』」 |
| 38 | 撤销按钮在有操作后可用 | ✅ | — |
| 39 | 撤销 / 重置可点击 | ✅ | — |
| 40 | 可切换到第 2 关 | ✅ | — |
| 41 | 解谜进度写入 localStorage | ✅ | `prismera.v1.progress` |

**关卡可解性（独立自检 `scripts/test-levels.mjs`）**

| 关卡 | 接收环 | 作者解法点亮 | 初始状态未点亮 | 可旋转元件可达性 | 光点可达性 |
| --- | --- | --- | --- | --- | --- |
| LV1 回廊 | 1 | ✅ 全部点亮 | 1 / 1 ✅ 需玩家操作 | ✅ | ✅ |
| LV2 分流 | 3 | ✅ 全部点亮 | 3 / 3 ✅ | ✅ | ✅ |
| LV3 时序 | 1 | ✅ 全部点亮 | 1 / 1 ✅ | ✅ | ✅ |
| LV4 合奏 | 4 | ✅ 全部点亮 | 4 / 4 ✅ | ✅ | ✅ |

自检同时校验：元素坐标不越界、元素不落在立柱上、地形行列数与关卡尺寸一致、
每个可旋转元件存在可达的相邻格、每个光点可达。

**人工检查**
- LV3 的虚空缺口（列 6，行 3–5）确实断开了地面，移动浮台是**唯一**通路；光栅门由余辉压板供电，
  两者构成真实的时间压力而非装饰。
- LV2/LV4 的白光经色散棱镜后分成青 / 品红两束，接收环颜色不符时给出红色「✕」标记。
- 撤销栈可回退棋盘状态（旋转与移动均入栈），提示会高亮目标元件并在其上方显示脉冲光环。

---

## 5. 《光环台 / HALO DECK》

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 42 | 3D 画布已创建 | ✅ | `.halo-canvas` |
| 43 | **页面显著位置含「桌面端交互演示 / 不支持 VR 头显」声明** | ✅ | 展台上方醒目提示条 |
| 44 | 设备支持状态表如实标注 | ✅ | 展项类型：桌面端交互演示 / VR 头显支持：不支持 / 立体渲染·手柄追踪：未实现 |
| 45 | **WebXR 检测按钮返回浏览器真实结果** | ✅ | 「浏览器是否提供 immersive-vr 会话：**不提供**」 |
| 46 | 热点展签可出现 | ✅ | 展签卡含标题、正文与来源链接 |

**人工检查**
- 检测结果的说明文字明确写出：「检测结果仅反映浏览器是否暴露 WebXR 能力，与本展项的实现无关：
  本页用普通 WebGL 渲染，没有创建 immersive-vr 会话，也没有立体渲染与手柄追踪」，
  并给出 [W3C WebXR 规范](https://www.w3.org/TR/webxr/) 说明真正设备支持所需条件。
- 全部页面文案中**未出现**「支持 VR」「已适配头显」「沉浸式体验」等虚假表述（人工逐条核对）。
- 6 张热点展签均带可点击的来源链接，来源与 `SOURCES.md` 台账一致。

---

## 6. 移动端（390×844）

| # | 断言 | 结果 | 实测值 |
| --- | --- | --- | --- |
| 47 | 主站无横向溢出 | ✅ | 溢出 0px |
| 48 | 节奏页无横向溢出 | ✅ | 溢出 0px |
| 49 | 解谜页无横向溢出 | ✅ | 溢出 0px |

**人工检查**：节奏页在触屏下点按轨道可判定（`pointerdown` 按 x 坐标映射轨道）；
解谜页可点按元件旋转、拖拽转视角；光环台拖拽环视可用。

---

## 7. 构建与部署形态

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| `npm run build` 成功 | ✅ | `vite v5.4.11` |
| 产物用相对路径引用资源 | ✅ | `src="./assets/index-*.js"`、`href="./assets/index-*.css"` |
| 哈希路由 | ✅ | `#/`、`#/pulse`、`#/atrium`、`#/halo` |
| **子路径可运行** | ✅ | `http://127.0.0.1:4399/repo/prism-era/` 下 49 项断言全通过 |
| 资源 404 | ✅ | 0 |
| 产物外链第三方域名 | ✅ | 0（字体为同源 woff2） |
| 字体在产物内以**相对路径**引用 | ✅ | `dist/assets/ds/fonts/*.woff2` 5 款 + `url(./<name>.woff2)`；产物中**无** `url(/...)` 绝对根路径 |
| **设计系统副本随产物发布** | ✅ | `dist/assets/ds/tokens.css`（11.9 KB）、`dist/assets/ds/components.css`（32.1 KB）、`dist/assets/ds/fonts/`（5 款 woff2 + 5 份 OFL 全文 + `FONT-MANIFEST.json`，448 KB） |
| 产物体积 | — | 约 **1.14 MB**（JS 629 KB / CSS 39 KB / 设计系统副本 492 KB，其中字体 434 KB） |

---

## 8. 验收过程中发现并修复的缺陷

| # | 缺陷 | 现象 | 修复 |
| --- | --- | --- | --- |
| 1 | **从准备界面进入游戏后页面未回顶** | 舞台被顶到视口之上，HUD（分数/连击/准度）整体不可见 | 新增 `scrollToTop()`，在路由切换与进入游戏时调用（`src/core/dom.js`、`src/main.js`、`src/rhythm/pulse.js`） |
| 2 | **实例化地板旋转轴错误** | `InstancedMesh` 整体旋转导致实例矩阵被一同旋转，格子与元件错位、地面呈悬空条带 | 改为旋转几何体本身（`tileGeo.rotateX`），实例矩阵保持世界坐标 |
| 3 | 关卡 LV3 的浮台形同虚设 | 地面未断开，玩家可绕行，浮台与余辉压板失去作用 | 将列 6 的行 3–5 改为虚空，浮台成为唯一通路 |
| 4 | L4 的光点落在立柱上 | 光点 (10,0) 与地形立柱重叠 | 移至 (7,0)，并加入自检项「光点必须可达且不在立柱上」 |
| 5 | 反光板视觉过弱 | 薄片侧视几乎不可见，玩家难以定位可交互物 | 加厚板面、增大背面辉光、增加底座与地环 |
| 6 | 折光阁视野过远 / 雾效吞没关卡 | 关卡只占画面约 1/5，远端被雾遮蔽 | 相机拉近（系数 0.92→0.66），雾范围放宽至 24–72 |
| 7 | 光环台初始视野空旷 | 初始视角几乎只有空地 | 增加中央棱镜碑与光环、前景棱镜簇、放宽雾浓度 |
| 8 | 节奏轨道过窄 | 四轨总宽仅 384px | 单轨宽度上限 96→124px |
| 9 | **顶部工具栏「暂停 / 重开」按钮没有绑定事件** | 按钮渲染正常但点击无反应；13 号 D3「暂停流程」判 warn（state 始终为 playing） | 绑定到 `togglePause()` / `restart()`，并让按钮文案随状态在「暂停 / 继续」间切换（`src/rhythm/pulse.js`） |
| 10 | **遮罩关闭后焦点丢失，键盘随即失效** | 结算/暂停面板关闭时，被聚焦的按钮随 DOM 一起被移除，焦点退回 `body`；因新增的键盘焦点门，此后按方向键不再驱动游戏 | 遮罩关闭后主动把焦点交还游戏画面；遮罩出现时把焦点交给第一个可操作元素（`showOverlay` / `clearOverlay`） |
| 11 | **遮罩按钮被移除后 `document.activeElement` 变 `body`，`isGameFocused()` 误判** | 与缺陷 10 同源 | 同上；并为三个展项舞台补 `tabindex="0"` 与 `aria-label` |
| 12 | 改版前的**自建 QA 存在时序脆弱性** | 「Esc 可暂停」用例依赖曲目未播完；机器瞬时负载时循环跑满 40.8s 整曲，曲目已结束 → Esc 自然无效 → 误判为失败 | 用例改为先读 `window.__eraGame.state`，非 `playing` 时先重开再测暂停（测试侧修复，产品行为本身正确） |
| 13 | **改版后 Canvas 仍写死已卸载的字体族名** | 卸载 `@fontsource-variable/*` 并改用自托管字体后，`src/rhythm/pulse.js` 里 9 处 `ctx.font` 仍写 `'Space Grotesk Variable'` / `'JetBrains Mono Variable'` —— 这两个族名已不存在，HUD 文本全部落到系统字体 | 改为从设计系统令牌读取字体栈（新增 `readFontStack()`），`ctx.font` 改用模板串拼接；9 处全部替换，残留旧族名 0 |
| 14 | **Space Mono 粗体字面从未被取回，Canvas 静默回落系统等宽字体** | 浏览器只在页面真正用到某字重时才取对应文件；页面正文只用 Space Mono 400，其 700 字面长期 `status: "unloaded"`。Canvas 的 `ctx.font` 是同步生效、取不到字体不等待而直接回落，肉眼几乎无差别但 `Space Mono` 实际未生效 | 新增 `src/core/fonts.js` 的 `preloadFonts()`，在启动时与《脉冲走廊》开赛前显式 `document.fonts.load()` 四个必需字重；实测粗体字面状态由 `unloaded` 变为 `loaded` |
| 15 | **字体族名写死后自建 QA 无法发现回落** | 缺陷 13/14 都不会触发控制台错误、不影响 49 项功能断言，靠截图对比与肉眼几乎看不出 | 新增专项验收脚本（11 项）：断言两款字体已加载、粗体字面已取回、Canvas 文本测量宽度与「不存在的族名」不同、`ctx.font` 串不再含 `*Variable` |
| 16 | **改版第二轮的 reduced-motion 降级块重定义了 `--ds-dur-*`** | 违反 `MIGRATION-NOTES §0 风险 B`（目录自有层不得重新定义 `--ds-*` 取值）；且与 16 的组件层降级逻辑重复 | 改用 16 自带的 `[data-rm="reduce"]` 开关（设置面板的「减少动效」直接切这个属性），本目录不再自写一份 `!important` 降级规则 |
| 17 | **「高对比」开关重定义了 `--ds-line` / `--ds-ink-soft` / `--ds-ink-faint`** | 同上，且会让 `--ds-*` 的取值校验（V.3）出现非规范值 | 改为 `--hc-*` **间接层**：`--hc-line: var(--ds-line)` …，开关只改本目录自有变量，`--ds-*` 取值自始至终只有 16 号副本一处声明 |
| 18 | **字体栈顺序违反 V.11** | 第二轮自写的 `--ds-font-display` 把覆盖有限的 `Noto Sans SC` 子集排在完整覆盖的系统 CJK 族之前 → CSS 按字符回退会混排基线错位 | 随 16 号 `tokens.css` 的原样副本一并修正（拉丁 → 完整系统 CJK 栈 → Noto 子集 → 通用 sans-serif）；由 `verify-ds.mjs` 的「字体栈顺序」断言守护 |
| 19 | **页脚链接与正文内来源链接的触摸目标只有 19px** | 违反 WCAG 2.2 AA · 2.5.8（目标尺寸最小 24px）；行内文字链接的默认行盒高度不足 | 页脚链接改为内联弹性盒并补 `min-height: 24px`；正文来源链接用 `inline-block` + 纵向内边距（不改变行盒高度，只扩大命中区域） |
| 20 | **HUD 用渐变背景，机械对比度检查找不到其底色** | HUD 文字是浅色、画布是深色，实际对比度充足；但渐变的 `background-color` 计算值为 `transparent`，检查脚本会一路上溯到**浅色页面底**，得出 1.06:1 的错误结论 | HUD 承载面改为**实底** `var(--ds-canvas-hud-bg)`（仍属深色半透明），使底色可被机械判定；HUD 文字实测对比度 ≥4.5:1 |
| 21 | **16 号组件层 `.ds-btn` 默认高度 128px** | `--ds-btn-h: var(--ds-space-10)` = 128px，与 `DESIGN-SPEC §7`「控件最小高 40px」相悖；若直接叠加 `.ds-btn` 类，按钮会异常高 | 本目录就地覆盖 `.btn.ds-btn { --ds-btn-h: 44px }`（同时满足 AAA 主控件 44px），**不修改 16 号副本** |
| 22 | **16 号组件层 `.ds-input` 的 `appearance:none` 会抹掉 range 滑块本体** | 校准滑杆若直接叠加 `.ds-input`，`appearance:none` 会让滑块不可见、控件失效 | 滑杆保留浏览器原生外观（`appearance: auto`），只借用 `.ds-input` 的边框 / 圆角 / 焦点环 |

> 说明：缺陷 1、2、3 是**功能性**缺陷，若不做浏览器实测无法暴露；
> 缺陷 13–15 是**第二轮改版引入 / 暴露**的问题，均为静默降级（不报错、不断言失败），只有专门的字体实测能暴露。

---

## 9. 截图索引

| 文件 | 内容 |
| --- | --- |
| `01-hall-hero.png` | 展厅主视觉（原创标题、导语、CTA、四个数据） |
| `02-hall-exhibits.png` | 三件展品卡片区 |
| `03-hall-timeline.png` | 2011–2026 时间轴（含来源链接） |
| `04-hall-settings.png` | 设置面板（静音 / 视觉节拍 / 减少动效 / 高对比 / 校准） |
| `05-pulse-visual-beat.png` | 《脉冲走廊》静音视觉节拍模式（收缩节拍环 + 下行光带 + 拍点标尺） |
| `06-pulse-playing.png` | 判定进行中：分数 / 连击 / 准度 / 四类判定计数 |
| `07-pulse-paused.png` | 暂停面板 |
| `08-pulse-audio-mode.png` | 有声模式（AudioContext 已在手势后创建） |
| `09-atrium-level1.png` | 《折光阁》LV1 |
| `09b-atrium-level1-complete.png` | LV1 实际通关的结算面板（星级 / 用时 / 光点 / 最佳） |
| `10-atrium-hint.png` | 提示生效（高亮目标 + 方向说明） |
| `11-atrium-level2.png` | LV2 分流：色散 + 分光 + 三色接收环 |
| `12-atrium-level4.png` | LV4 合奏：三光源 / 四接收环 / 光栅门 |
| `13-atrium-level3.png` | LV3 时序：虚空缺口 + 移动浮台 + 光栅门 + 余辉压板 |
| `14-halo-deck.png` | 《光环台》：桌面交互演示声明 + 场景 + 热点展签 + 设备支持状态 |
| `15-mobile-hall.png` | 移动端主站 |
| `16-mobile-pulse.png` | 移动端节奏页 |
| `17-mobile-atrium.png` | 移动端解谜页 |
| `19-hall-timeline-controls.png` | 时间轴线索筛选条（`.ds-chip`）+ 关键词搜索（`.ds-field` / `.ds-input`）+ 年份跳转轴（`.ds-rail--horizontal`） |
| `20-hall-work-cards.png` | 展项卡（`.ds-work` + `__title` / `__meta` / `__desc`）与标签（`.ds-tag`）、CTA（`.ds-btn--primary/--secondary/--ghost`） |
| `21-mobile-timeline-controls.png` | 390px 视口下的时间轴控件（筛选条 + 搜索 + 跳转轴） |

**第三轮设计系统机械验收截图**（`evidence/ds/`，`scripts/verify-ds.mjs` 自动产出，共 16 张 = 4 路由 × 4 视口）：

| 文件 | 内容 |
| --- | --- |
| `ds-hall-desktop-1440.png` / `ds-hall-desktop-1280.png` | 展厅主站（`.ds-topbar` / `.ds-cover` / `.ds-work` / `.ds-rail` / `.ds-indicator` / `.ds-chip` / `.ds-input` / `.ds-footer` / `.ds-skip`） |
| `ds-hall-tablet-768.png` / `ds-hall-mobile-390.png` | 展厅主站窄视口 |
| `ds-pulse-desktop-1440.png` / `1280` / `tablet-768` / `mobile-390` | 《脉冲走廊》（`.ds-detail__title` + `.ds-canvas-frame` + `.ds-canvas-frame__hud`） |
| `ds-atrium-desktop-1440.png` / `1280` / `tablet-768` / `mobile-390` | 《折光阁》（`.ds-canvas-frame` + `.ds-canvas-frame__hud` + `.ds-diagram` 图例） |
| `ds-halo-desktop-1440.png` / `1280` / `tablet-768` / `mobile-390` | 《光环台》（`.ds-canvas-frame`） |

---

## 10. 未覆盖 / 明确限制

1. **未在真实 VR 头显上测试**（本展项本就不支持 VR 头显）。
2. **未在 Safari / Firefox 上实测**（验收环境为 Chrome）；所用 API 为 WebGL2、Pointer Events、
   `AudioContext`、`localStorage`、`navigator.xr` 的存在性检测，兼容性风险低但未逐一验证。
3. **未测试触屏手势（多点触控缩放/旋转）在 iOS Safari 上的表现**（移动端验收在 Chrome 移动模拟下完成）。
4. **未做长时间运行的性能压测**；已做关卡切换稳定性测试（连续切换 20 次，0 错误、0 崩溃）。
5. **外部史料链接的长期有效性**取决于第三方站点，核验时间 2026-10-21。
6. 曲目的「音乐性」是程序化生成的折中结果，未做主观听评。
7. 提示系统基于作者推荐解法；玩家自寻解法时提示可能指向非唯一解（UI 已注明）。
8. **`--ds-font-mono` 与 `design-tokens.json` 存在 1 处差异**：CSS 多一个 `Consolas`。
   该差异源自 16 号 `src/tokens.css` 本身，本厅按红线**未改副本**，
   已在 `verify-ds.mjs` 中按 `warn` 记录并记入 `STATUS.md` L-12，待 16 号确认权威取值。
9. **设计系统机械验收只覆盖 Chrome**：`scripts/verify-ds.mjs` 使用本机 Chrome 原生 CDP，
   未在 Safari / Firefox 复跑。纯 CSS 规则（`contain` / `isolation` / `:lang(zh)` / `letter-spacing`）
   在各引擎行为一致，但 `contain: paint` 与 `isolation: isolate` 的**具体渲染边界**未做跨引擎比对。
10. **`.ds-rail` 的固定导航轨形态未采用**：16 号组件层的 `.ds-rail` 是 `position: fixed` 的全高导航轨，
    在 1280px 内容列下会与正文重叠；本厅改用 `--horizontal` 变体做**时间轴面板内的静态年份轴**。
    此项**无参考站实测依据，为本批自定**（`STATUS.md` L-11）。
11. **`.ds-indicator` 的语义为「还有下文 / 已到末段」**：首段显示圆点、末段显示箭头、中段隐藏，
    以免压住正文。此项**无参考站实测依据，为本批自定**（`STATUS.md` L-11）。
12. **`Noto Sans SC` 子集在本机未被实际取用**（`status: unloaded`）：
    本机有完整覆盖的 `PingFang SC` 等系统 CJK 族，按 V.11 顺序排在子集之前，故子集不触发下载。
    这符合规范预期，但**未在无系统中文字体的环境（如纯 Linux 容器）验证过**。
