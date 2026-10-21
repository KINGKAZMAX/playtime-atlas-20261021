# STATUS — 光点年代 · 早期可玩展厅

最后更新：2026-10-21（**第四轮：按 15-supervisor 派单执行改版 —— 接入三步 + G.1—G.7 + §3.3 键盘专项**）

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| 0. 任务立项 | ✅ 完成 | `TASK.md` 需求拆解完成；确认「原创重新演绎」定位与版权红线 |
| 1. 史料核验 | ✅ 完成 | **17 条来源**核验通过（BNL 官方 ×2 / Wikipedia ×9 / Computer History Museum / The Strong ×2 / ACMI / MEGA / arcadevector） |
| 2. 工程脚手架 | ✅ 完成 | Vite 5.4.11 本地安装，端口 4328，MPA 三入口，`base: './'` |
| 3. 展厅叙事数据层 | ✅ 完成 | `src/data/exhibits.js`（SOURCES 17 / TIMELINE 12 / DIFFERENCES 7），与 `SOURCES.md`、`DIFFERENCES.md` 同源 |
| 4. 核心模块 | ✅ 完成 | `audio.js` 程序化音效 / `focus.js` 焦点门控 / `loop.js` 固定步长 / `input.js` 键鼠触 / `storage.js` 存档 / `gfx.js` 绘制 |
| 5. 游戏一 辉点对拉 | ✅ 完成 | 蓄力重击（窗口内 +2）、偏心回弹、拖尾余辉、AI 三档、双人、触屏、先到 7 分 |
| 6. 游戏二 引力双星 | ✅ 完成 | 平方反比引力、光迹灼伤（-24 / +3）、相位脉冲、燃料 / 光能 / 存活奖励、AI 三档、双人、触屏 |
| 7. 展厅主站页面 | ✅ 完成 | 序厅 / 导览 / 年代长廊 / 参考与差异 / 来源台账 / 操作与无障碍 |
| 8. 响应式与无障碍 | ✅ 完成 | 移动端竖横屏、焦点提示、`prefers-reduced-motion`、ARIA 实时播报、可见焦点环 |
| 9. 构建验证 | ✅ 完成 | `npm run build` 退出码 0，三页产物齐全，路径全相对，运行期零外部请求 |
| 10. 实机验收 | ✅ 完成 | 单元测试 54/54；令牌校验 **0 error / 0 warn**；16 口径页面检查 **0 error / 0 warn**；游戏行为探针 **18/18 全通过**（含条件记录项时 19 项）；**批次 harness verdict = pass** |
| 11. 截图 | ✅ 完成 | `screenshots/` 7 张实机截图（Ego 浏览器拍摄）+ `screenshots/verify/` 12 张多视口截图 + 三份 JSON 报告 |
| 12. 文档与交付 | ✅ 完成 | README / SOURCES / DIFFERENCES / LICENSES / QA / RESTYLE-INVENTORY / manifest / handoff×2 / scripts×4 |
| 13. 设计系统改版（第三轮） | ✅ 完成 | 令牌层 + 组件层落地，三页 HTML 改造，自托管字体 |
| 14. 改版执行（第四轮） | ✅ 完成 | **接入三步** + **G.1—G.7** + **§3.3 键盘与焦点专项**；执行项与暂缓项见下文 |

---

## 第四轮：按 15-supervisor 派单执行改版

派单依据：`15-supervisor/RESTYLE-SPEC.md` + `16-design-system/MIGRATION-NOTES.md`（编制 20:50，21:52 更新）+
`16-design-system/DESIGN-SPEC.md` + `16-design-system/design-tokens.json`（取值唯一来源）。

### 一、接入三步（执行项）

| # | 要求 | 状态 | 落点与说明 |
| --- | --- | --- | --- |
| ① | 拷贝 `16-design-system/src/tokens.css` + `src/components.css` → 本项目 `assets/ds/` | ✅ **已执行** | `assets/ds/tokens.css`、`assets/ds/components.css`。两者与 16 源文件**逐字节一致**（`scripts/check-tokens.mjs` 第 10 项每次自动比对，0 漂移） |
| ② | 拷贝 `16-design-system/fonts/` → `assets/ds/fonts/`，引入 `assets/ds/fonts/fonts.css` | ✅ **已执行（1 处局部偏离）** | 4 个 OFL woff2 + 4 份许可全文 + `fonts.css` 全部落地；**未采用** `noto-sans-sc-subset.woff2`（197 600 B），理由见「暂缓项」§5 |
| ③ | 入口注入 `<style>:root{--ds-base:"/playtime-atlas-20261021/";}</style>`，`<body>` 加 `class="ds-shell"` | ✅ **已执行** | 三页 `<head>` 内联注入 + `<body class="… ds-shell">`。**全部资源仍走相对路径**，该变量不参与任何资源 URL（见 G.7） |

### 二、G.1—G.7（执行项）

| # | 要求 | 状态 | 落地方式与实测 |
| --- | --- | --- | --- |
| G.1 | 引入 tokens.css + components.css | ✅ | 规范层链接置于既有 CSS 之后、08 专属层之前；`--ds-*` 取值的**唯一声明处** = `assets/ds/tokens.css`（§0 风险 B） |
| G.2 | 页头 `.ds-topbar` / 页脚 `.ds-footer` / 加 `.ds-skip` | ✅ | 展厅 `<header class="masthead ds-topbar">`、游戏页 `<header class="topbar ds-topbar">`；两页页脚 `.ds-footer` + `.ds-footer__row` / `.ds-footer__links`；三页首元素 `.ds-skip`（跳过链接） |
| G.3 | 标题**禁止** `white-space: nowrap` | ✅ | `scripts/verify-pages.mjs` 运行时实测：三页 `h1/h2/h3` + `.ds-display/.ds-h1/.ds-h2/.ds-h3` 共 **0 个** 使用 nowrap。**实测发现并修掉一处真实违规**：游戏页 `<h1 class="topbar__title">` 继承自 `src/styles/game.css` 的 `white-space: nowrap` → 改为 `normal` + `overflow-wrap: anywhere`（与 `.ds-cover__title` 同策略） |
| G.4 | 正文 `:lang(zh)` 字距归零、行高 1.85 | ✅ | 运行时实测：字距 `normal`（归一 **0**）、正文行高 **1.85**、标题行高 1.22。**取样口径修正过两次**：① `letter-spacing` 计算值可能是 `normal`（等价 0），必须归一化后再判，否则 `parseFloat('normal') = NaN` 误判为不达标；② 游戏页没有 `.ds-body` 载体，原探针取样为 `null`，改为回退到 `.note`（08 既有正文段）并排除 `.sr-only` / `[hidden]` / `.overlay` / `.game-frame` 等非正文元素 |
| G.5 | 元信息用 `--ds-font-mono` | ✅ | 来源台账 `.source__meta`、页脚 `.foot__meta`、年代轴 `.stop__year` 均挂 `.ds-mono` / `.ds-rail__item`（等宽） |
| G.6 | 保留既有功能 | ✅ | 单元测试 **54/54**；游戏行为探针 **全通过（18–19 项，warn 0 / fail 0）**（D3 状态机 / D4 存档 / D5 键盘作用域 / D6 控制台；其中「聚焦测试前对局状态」为条件记录项，仅在需要重开对局时写入，故项数在 18–19 间浮动）；新增的年代筛选默认「全部」，12 站全显 |
| G.7 | 资源相对化适配 `/playtime-atlas-20261021/` 子路径 | ✅ | `base: './'`；产物内**零绝对路径引用**；`--ds-base` 已注入但不参与任何资源 URL —— 故本目录在批次根、作品页 `/works/08-era-origins/`、以及 06 母站的 iframe 三种挂载下均可直接运行 |

### 三、§3.3 键盘与焦点专项（执行项）

| 要求 | 状态 | 实测 |
| --- | --- | --- |
| `.ds-skip` 每页首个可聚焦元素 | ✅ | 三页首元素均为 `.ds-skip`，Tab 第一站即命中 |
| `:focus-visible` 焦点环**任何状态不得移除** | ✅ | 画布框 `.game-frame:focus-visible` 2px 描边 + 2px 偏移；`.is-focused` 另有 box-shadow 焦点环；外壳走 `--ds-focus-ring` |
| Tab 序列不得被 `preventDefault` 吞掉 | ✅ | 用 CDP 真实按键（`Input.dispatchKeyEvent`，合成 KeyboardEvent 不触发浏览器默认焦点移动）实测：三页各 **3/3** 个可达元素**全部有可见焦点环**，无吞键 |
| 键盘仅在容器持有焦点时驱动游戏（§4.1 的 08 红线） | ✅ | 未聚焦：rally 16 次 / gravity 12 次过程采样**全程未变**；聚焦后按键生效；聚焦时 `scrollY` 不变 |

### 四、改版后的分层结构

```
既有 CSS（保留，未删除）
  src/styles/base.css   复位 + 排版 + 通用零件（旧变量已重定向到 --ds-*）
  src/styles/shell.css   展厅主站外壳
  src/styles/game.css    游戏页外壳
        ↓
余晖设计系统（规范层，assets/ds/）
  tokens.css      --ds-* 取值唯一声明处（与 16 源逐字节一致）
  components.css  .ds-* 组件层（与 16 源逐字节一致）
  fonts/fonts.css 自托管 OFL 字体
        ↓
08 专属层（src/styles/）
  tokens.css      --lumen-* 画布色板镜像 + 中文排版 + 底纹还原（不声明任何 --ds-* 取值）
  components.css  既有几何桥接 + 画布 HUD 例外 + 规范与 08 标记的接缝
```

样式表链接顺序（`base → shell/game → 规范层 → 08 专属层`）经 `scripts/verify.sh` 第 5 步机器校验。

### 五、暂缓项与理由

| # | 暂缓项 | 理由 |
| --- | --- | --- |
| 1 | **`.ds-cover` 未套用到序厅** | `.ds-cover` 是 `display:flex; flex-direction:column; align-items:center` 的居中骨架；08 的序厅是「左文右示波器」两栏网格，套用会把示波器示样压到标题下方。改为只借用其子元素语义（`.ds-cover__title` / `.ds-cover__eyebrow` / `.ds-cover__lede`），并保留 08 的两栏结构 |
| 2 | **`.ds-rail` 未套用到年代长廊** | 规范层 `.ds-rail` 是 `position:fixed` 的左侧悬浮轨（132px 宽）；08 的年代长廊是**文档流内**的纵向时间轴，套用 fixed 会把长廊从版面里抽走。改为只借用 `.ds-rail__item` 的等宽排版语义（并在 08 层修正其按钮化的几何） |
| 3 | **`.ds-indicator` 未使用** | 规范层的底部圆点指示器对应「整屏滚动指示」交互；08 的长廊是常规文档流，没有滚动吸附或整屏分段。**不为此新增功能**（G.6 保留既有功能，不扩张） |
| 4 | **画布相邻的 DOM 层（焦点提示、开始/暂停/结算覆盖层）保留 `--lumen-*` 画布色板** | 它们压在深靛画面上，改用外壳色板会形成一块可见的深色矩形并削弱对比度。依据 §4 K.3「HUD 的可读性优先于风格统一」与 K.1，**有意偏离**并在此登记。**但色板保留不等于对比度豁免** —— 按 16「HUD 文字对比度 ≥4.5:1 不豁免」，覆盖层眉标 / 脚注已由 `--lumen-cyan-dim`(4.22:1) / `--lumen-dim`(2.4:1) 改为同属画布色板的 `--lumen-cyan`(12.95:1) / `--lumen-slate`(6.71:1) |
| 5 | **未采用 `noto-sans-sc-subset.woff2`（197 600 B）** | 该子集按 07-museum-art 自身用字生成，覆盖不了本目录的汉字；缺字时浏览器仍逐字回退到系统栈，收益为零，却让仓库与产物各多背约 197 KB。MIGRATION-NOTES §8 亦明确「中文优先系统栈」。**顺序规则仍满足**：本目录 `--ds-font-*` 已按 2026-10-21 修正把完整覆盖的系统 CJK 栈排在子集之前；由于不加载该子集，栈中的 `"Noto Sans SC"` 只是从不生效的占位名，不会发生混排基线错位 |
| 6 | **`.ds-btn` 高度按 44px，而非规范实现里的 128px** | 规范内部不一致：`components.css` 写 `--ds-btn-h: var(--ds-space-10)`（= 128px），而 `DESIGN-SPEC.md` §7.1「尺寸」明确「`.ds-btn` 最小高 40px」。以**成文规范**为准，同时取 §5.1 的 AAA 目标值 44px（44 > 40，两条都满足）。若不修正，128px 高的按钮会把封面 CTA 与触控区撑破 |
| 7 | **`.ds-canvas-frame` 的 `contain: paint` 降级为 `isolation: isolate`** | paint containment 会裁掉溢出到 padding box 之外的描边，与 §5「焦点环任何状态不得移除」冲突。保留 `isolation: isolate`（画布独立层叠上下文这一真正目的） |
| 8 | **顶栏底色用 `rgba(16,15,14,.86/.82)` 字面量而非 `color-mix()`** | Chrome 会把 `color-mix(in srgb, …)` 计算成 `color(srgb …)` 形式，WCAG 对比度工具（16 的 `lum()` 与 13 将采用的同款解析器）识别不了，会把可测项判成「无法计算」。改后三页 12 项对比度样本**全部可测且达标** |
| 9 | **序厅渐变标题拆出内层 `<span class="hero__title-grad">`** | 渐变文字的 `color` 是 `transparent`，对比度工具无法测量（实测被判 1.1:1）。拆分后 `h1` 承载可测的 `--ds-ink`（17.46:1），渐变仍由内层 span 呈现，视觉不变 |
| 10 | **`.ds-chip` 的筛选用途落在年代长廊** | §3 规定筛选 chip 用 `aria-pressed` + `aria-live` 计数。08 的长廊跨 1948—1979 共 12 站，按年代筛选是这条长廊最自然的一个交互；模式/难度切换在游戏页同样以 `.ds-chip` 承载（`aria-pressed` 语义完全一致）。**默认「全部」，12 站全显，不改变既有行为** |
| 11 | **仍不提供 `hreflang="en"`** | 本批只有中文版，没有可交替的英文版，不提供虚构的语言标注；`<html lang="zh-CN">` 已正确声明。附带原因：Vite 的 `assetAttrsConfig.link = ["href"]` 会把任何 `<link href>` 当资源打包 |
| 12 | **顶栏外层还原为 `display: block`**（覆盖规范层 `.ds-topbar { display: flex }`） | 规范的 `.ds-topbar` 是「brand + nav 直接作为 flex 子项」的行容器；08 的顶栏内容包在限宽内层容器里（`.masthead__inner` / `.topbar__inner`，`max-width: 1280px` + `auto` 外边距）。不还原的话，内层会成为 flex 子项被压缩成**内容宽度并居中**——顶栏整簇缩在页面中央，与下方正文错位（实测品牌从 x=128 漂到 x=447）。还原后品牌回到 x=128、与正文同列，导航/按钮靠右，与改版前一致。**只改几何，不动排版与语义** |
| 13 | **入口注入的 `--ds-base` 带 `!important`** | Vite 构建时把合并后的 CSS `<link>` 放到 `<head>` **末尾**，位置在源码里的内联 `<style>` 之后；规范层 `tokens.css` 的 `:root{--ds-base:""}` 因此在**构建产物**中反向覆盖注入值（开发态看不出来，产物里运行时读到 `""`）。自定义属性支持 `!important`，加上后源码与产物一致，运行时实测 `/playtime-atlas-20261021/`。**该变量仍不参与任何资源 URL**（见 G.7） |
| 14 | **游戏页正文补挂 `.ds-body` / `.ds-sm` / `.ds-mono`** | 规范层 12 个对比度样本中，游戏页原本只存在 4 个（`.ds-btn--primary/secondary/ghost`、`.ds-chip`），正文与等宽没有对应类名，导致「12 项对比度全可测」的说法在游戏页不成立。补挂后游戏页有 7 个规范样本（`.ds-body` `.ds-sm` `.ds-mono` + 4 个控件），另加 5 项 HUD 样本共 12 项。**副作用**：字号从 12.5px 提到 16px / 14px（跟随规范层排版基线），侧栏密度有变化 |

### 六、发现的规范内部不一致（已按「成文规范优先」处置并登记）

| # | 位置 | 不一致 | 处置 |
| --- | --- | --- | --- |
| 1 | `components.css` `.ds-btn` vs `DESIGN-SPEC.md` §7.1 | 128px vs「最小高 40px」 | 以 DESIGN-SPEC 为准，取 44px（同时满足 §5.1 AAA） |
| 2 | `MIGRATION-NOTES.md` §1.2 间距刻度 vs `design-tokens.json` | §1.2 写 4/8/12/16/24/32/**40/48/64/80/96/120**，JSON 与 `tokens.css` 是 4/8/12/16/24/32/**48/64/96/128** | 以 `design-tokens.json`（取值唯一来源）为准 |
| 3 | `MIGRATION-NOTES.md` §3 组件表 / §1.1 路径 C vs `RESTYLE-SPEC.md` §1 | 前者提供「引入 tokens.css + components.css」的路径 C，后者写「只读引用，不要复制文件」 | 按 15-supervisor 的接入三步执行（把规范层落地到 `assets/ds/`），同时满足两条的**目的**：令牌取值唯一来源、组件类名一致、不删除既有 CSS |

### 七、本轮验收结果

| 层 | 工具 | 结果 |
| --- | --- | --- |
| L1 单元 | `node --test "tests/*.test.mjs"` | **54 / 54 通过** |
| L2 构建与自验 | `npm run verify` | **退出码 0**（测试 → 构建 → 产物检查 → manifest 一致性 → 改版专项） |
| L2 令牌 | `scripts/check-tokens.mjs` | **error 0 / warn 0**：浅色 16 项 + 深色 16 项与 `design-tokens.json` **逐值完全一致**；必备令牌 21 项齐备；命名空间唯一；画布镜像 15 项一致；与 16 源文件 0 漂移 |
| L3 页面机械检查 | `scripts/verify-pages.mjs`（**Ego 浏览器** + 批次共享 `tools/ego-qa`） | **0 error / 0 warn**：三页 × 四档视口（视口精度自检通过）无横向溢出、**每页 12 项对比度全部可测且达标**（最低 4.74 / 5.56，含 5 项 HUD 样本）、触摸目标 24px 与主控件 44px 两档全过、**Tab 8/8 有焦点环**、reduced-motion 生效、渲染字体正确、深色令牌正确、零控制台错误、G.3 与 G.4 全部达标、源码接入完整性 12 项全过 |
| L3 游戏行为 | `scripts/verify-game.mjs`（**Ego 浏览器**） | **全通过：19 / 19（warn 0 / fail 0）**（D3 / D4 / D5 / D6；含 1 项条件记录项，项数在 18–19 间浮动） |
| L4 批次 harness | 13-qa-curation | **verdict = pass**（详见下方「13 复测结论」） |

---

## 第二轮：监工清单修复项

| # | 要求 | 处置 | 证据 |
| --- | --- | --- | --- |
| 1 | **D5 键盘焦点作用域**：未获焦点时不得被无条件劫持，rally / gravity 两作一致生效，且不破坏「点击画布后键盘可用」 | `focus.js` 改为基于**实时 `document.activeElement`** 判定（缓存标志 **且** 焦点确实落在容器内），新增 document 级 `focusin`/`focusout` 同步；`input.js` 失焦即清空按键状态；**两作均已移除 window 级 keydown 监听**，按键只在游戏容器自身处理 | `QA.md` D5 章节；`tests/` 用例；13 证据 D5 两项均 pass |
| 2 | **补 `manifest.json`** | 已补齐 7 个必需字段；`id=08-era-origins`、`entry=index.html`、`buildCommand=npm run build`、`outputDir=dist`、`status=ready` | `manifest.json`；`scripts/verify.sh` 第 4 步自动核对 |
| 3 | **自验**：`npm run build` 退出码 0 且产出 `dist/index.html` | `npm run verify` 覆盖五步，退出码 0 | `QA.md` |
| 4 | **更新 `STATUS.md` 并回复要点摘要** | 本文件已更新 | — |

### 顺带修掉的根因

- **暂停在倒计时阶段失效**（此前 D5 冻结失败的真实根因，不是「键盘被无条件劫持」）：`pause()` 现对 `playing` 与 `countdown` 都生效，新增 `resumeState` 记录暂停前阶段，`resume()` 精确恢复。
- **切换难度会抹掉进行中的比分**：改难度不再重开当前对局（仅 `idle` / `over` 时重开），模式切换仍重开。
- **文字整体不显示**：根因是 `body::before` / `body::after` 两个 `position:fixed` 覆盖层压住正文；已删除二者，纹理改到 `body` 自身的 `background-image`。
- **`/favicon.ico` 404**：三页补内联 SVG data-URI 图标。
- **探针在引力双星上的 D5 误报**：探针给 gravity 选的键组 `KeyD`(右转)→`KeyW`(推进)→`KeyA`(左转) **左右等时对称、净转角恰为 0**，而判定只比首末两个端点 → 误判「未响应」。逐帧复现证实按住 `KeyD` 时角度确实变化。探针判定改为「按住期间持续采样 ∪ 末值」，**代码零改动**。

---

## 第三轮：余晖设计系统改版（第一版落地）

依据：`15-supervisor/RESTYLE-SPEC.md`（只读硬规则）、`16-design-system/MIGRATION-NOTES.md`（当时版本）、`design-tokens.json`。

- **第 1 步：待替换清单** —— `RESTYLE-INVENTORY.md`（20 157 B），含 `:root` 重定向表、`--lumen-*` 镜像表、三文件逐选择器对照、新增文件表、HTML 改动表、未挂 `.ds-*` 的元素及原因、明确不替换项（K.1–K.3）。
- **第 2 步：增量改版** —— 当时由本目录自行编写 `src/styles/tokens.css` + `src/styles/components.css`；**第四轮已改为直接接入 16 的规范层**（见上文「四、改版后的分层结构」），本目录自有层收窄为「画布色板镜像 + 中文排版 + 既有几何桥接」。
- **K.1–K.6 红线遵守情况**：K.1 由结构保证（玩法代码不读任何 CSS 变量，机器校验）；K.2 画布尺寸比与交互反馈未动；K.3 HUD 优先于风格统一；K.4 键盘映射与 Tab 遍历未破坏；K.5 既有功能与数据未破坏；K.6 作品名与 URL 未变。

---

## 13-qa-curation 复测结论

| 时间 | verdict | 关键项 |
| --- | --- | --- |
| 2026-10-21T11:48:48Z | **pass** | D1–D8 全 pass，无 warn、无 skip |
| 2026-10-21 18:31:03（监工转述） | **pass-with-warnings** | **fail = 0**；D5 键盘劫持项确认已修好 |
| 2026-10-21T13:46:13Z（13 自行复跑） | **pass** | total 28 / pass 24 / warn 0 / fail 0 / skip 1（移动端无 Tab 环，harness 设计如此）；**D5 未聚焦不响应 = pass**（前后状态完全一致）、**D5 聚焦后响应 = pass**、键盘焦点可达性 = pass（47 个可聚焦元素，8/8 焦点态可见） |
| 2026-10-21T16:05:16.070Z（13 复跑，**证据文件现值**） | **pass** | total 28 / pass 24 / warn 0 / fail 0 / skip 1 / notProven 0；9 项探针（进入可玩展品 / 游戏载体存在 / 开始 / 暂停 / 重开 / 难度切换 / 本地存档键 / **D5 未聚焦不响应** / **D5 聚焦后响应**）**全部 pass**；`readiness.ready = true` |

> 证据文件：`13-qa-curation/evidence/08-era-origins.json`。该目录由 13-qa-curation 自己写入，**本任务未写入其中任何文件**。
>
> ⚠️ **13 的最新证据（16:05:16Z）早于本轮最后两项修正** —— 「顶栏几何还原（`display: block`）」与「游戏页 H1 去 nowrap」是之后才改的。两项已由本目录自建的三套 L3 脚本复测通过（页面检查 0 error / 0 warn），但**权威证据仍需 13 再跑一次批次复测**才能刷新（`works.json` 中 08 的 `qaState` 仍为 `pending-reverify`，该字段属 14-publish，本任务不修改）。
>
> 监督方口径「13 对 08 的判定是 pass（17 项 0 fail 0 warn）」已记录；本轮改版的自测口径见上文「七、本轮验收结果」，改版**未引入回归**。

---

## 当前状态

**可交付**。

```bash
cd /Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/08-era-origins
npm install --no-audit --no-fund
npm run dev        # http://127.0.0.1:4328
npm run build      # 产出 dist/，供 14-publish 静态发布
npm run preview    # 预览构建产物（同样 4328）
npm run verify     # 自验：测试 → 构建 → 产物检查 → manifest 一致性 → 改版专项

node scripts/check-tokens.mjs    # 令牌一致性（V.3 / V.4）
node scripts/verify-pages.mjs    # 页面机械检查（V.1 / V.2 / V.5—V.9，16 口径）
node scripts/verify-game.mjs     # 游戏行为回归（D3 / D4 / D5 / D6）
```

## 已知限制

1. `bnl.gov` 在本沙箱内直连被拦截（curl / web_fetch 均失败），其正文经搜索索引完整取回并逐条比对；来源在 `SOURCES.md` 中标注为「检索索引取证」，其余 15 条均为直接 HTTP 200 取证。
2. 展厅为**代表性选样**，不宣称覆盖 1948—1979 全部电子游戏作品。
3. 两款游戏为原创机制演绎，**不是**任何历史作品的复刻或可运行副本。
4. 触屏手势基于 Chromium 模拟上下文验证，未在真机 Safari / iOS 上实测。
5. 音频只验证了 AudioContext 可在用户手势后启动与无控制台报错，未做主观音质评估。
6. 本任务不部署、不执行 GitHub 写操作；线上地址由 14-publish 产出后回填 `handoff/14-publish.md`。
7. 13-qa-curation 的全量 harness 最新证据为 **verdict = pass**（2026-10-21T16:05:16.070Z，total 28 / pass 24 / warn 0 / fail 0 / skip 1），唯一 skip 为「移动端无 Tab 环」（harness 对触屏视口的设计如此，非缺陷）。**该证据早于本轮最后两项修正（顶栏几何还原、标题去 nowrap），需 13 再跑一次批次复测刷新权威结论**。
8. **本批只有中文版**，未提供 `hreflang="en"`（无可交替的英文版）。
9. **画布焦点环保留青色，是对 K.3「HUD 可读性优先」的有意偏离**：几何对齐 `--ds-focus-width` / `--ds-focus-offset`（2px + 2px），颜色保留 `--lumen-cyan`（深靛画面上远高于朱砂）。**此项无参考站实测依据，为本批自定**。
10. 中文正文使用**系统字体栈**（未内置 Noto Sans SC 子集，理由见「暂缓项」§5）；不同系统上的中文渲染差异未做逐字校对。
11. 改版中「样式表顺序」「固定深色主题」「画布相邻层保留画布色板」「年代筛选作为 `.ds-chip` 载体」「顶栏外层还原为 `display: block`」「`--ds-base` 注入带 `!important`」等取舍**无参考站实测依据，为本批自定** —— 参考站 olek.si 未在这些维度取证，不臆造为「olek.si 风格」。
12. `14-publish/release/works.json` 中 08 的条目仍是 `"status": "pending"` / `"qaState": "pending-reverify"`；该文件属 14-publish，**本任务不得修改**。
13. 本目录的 `assets/ds/` 是 16 规范层在本目录内的落地副本；16 若后续更新其规范层，需重跑 `scripts/check-tokens.mjs`（第 10 项会报漂移）并同步。
14. **浏览器使用口径已统一到 Ego**：`scripts/verify-pages.mjs`（改为复用批次共享 `tools/ego-qa/lib/runner.mjs`）与 `scripts/verify-game.mjs` 均经 `ego-browser nodejs` 执行，不再本地另起 Chromium / Playwright。两支脚本**刻意不并入 `npm run verify`**（保持后者全程离线、无常驻进程），需单独运行，前提是本机已安装 Ego lite。交付截图（`screenshots/0*.png`）同样由 Ego 拍摄。

## 变更日志

- 2026-10-21：立项，完成史料核验（首批 11 组来源）。
- 2026-10-21：完成 Vite 脚手架、核心模块、两款游戏与展厅主站。
- 2026-10-21：完成构建与实机验收，补齐 `manifest.json` 与 `handoff/`。
- 2026-10-21（第二轮）：修复 D5 焦点作用域与倒计时暂停；难度切换不再重开对局；暴露 `p1`/`p2` 便于验收观测；来源扩充至 17 条。
- 2026-10-21（第二轮）：修复覆盖层压住正文导致的文字不显示；补内联 SVG favicon 消除 404。
- 2026-10-21（第二轮）：补齐 README / SOURCES / DIFFERENCES / LICENSES / QA / `scripts/verify.sh` / `handoff/` / `screenshots/`；定向探针 28/28 通过。
- 2026-10-21（第三轮）：按 16 设计系统完成改版——新增 `tokens.css` / `components.css` / `fonts/`，改写 `base.css` / `shell.css` / `game.css` 与三页 HTML；产出 `RESTYLE-INVENTORY.md`；`LICENSES.md` 增补自托管字体登记；`scripts/verify.sh` 增第 5 步改版专项。
- 2026-10-21（第三轮）：定位并修正探针在引力双星上的 D5 误报（对称键组净转角为 0 + 端点判定），改为过程采样；**代码零改动**。
- 2026-10-21（第四轮）：按 15-supervisor 派单执行接入三步——`assets/ds/` 落地 16 的 `tokens.css` / `components.css` / `fonts/`，三页注入 `--ds-base` 与 `ds-shell`；G.1—G.7 全部落地；`src/styles/` 自有层收窄为 08 专属（画布镜像 + 中文排版 + 几何桥接）。
- 2026-10-21（第四轮）：挂 `.ds-*` 规范类名（含 `.ds-topbar` / `.ds-footer` / `.ds-skip` / `.ds-cover__title` / `.ds-work__*` / `.ds-tag` / `.ds-btn--*` / `.ds-chip` / `.ds-rail__item` / `.ds-canvas-frame`），三页 12 项对比度样本全部可测且达标。
- 2026-10-21（第四轮）：新增 `scripts/check-tokens.mjs`（令牌一致性 / 命名空间唯一 / 画布镜像 / 副本漂移）、`scripts/verify-pages.mjs`（16 口径页面机械检查）、`scripts/verify-game.mjs`（游戏行为回归）；`scripts/verify.sh` 第 5 步改接三者。
- 2026-10-21（第四轮）：同步 16 于 22:25 的字体栈顺序修正（完整 CJK 系统栈前置，修混排基线错位）；登记 3 处规范内部不一致及处置。
- 2026-10-21（第四轮·收尾）：修掉两处自检/实现缺陷 —— ① 规范 `.ds-topbar{display:flex}` 把 08 的限宽内层容器压成内容宽度并居中（顶栏品牌从 x=128 漂到 x=447），08 层还原 `display: block`；② 游戏页 `<h1 class="topbar__title">` 带 `white-space: nowrap` 违反 G.3，改为 `normal` + `overflow-wrap: anywhere`。
- 2026-10-21（第四轮·收尾）：修正 `scripts/verify-pages.mjs` 的两处判定缺陷 —— `letter-spacing: normal` 归一为 0；正文取样回退到 `.note` 并排除 `.sr-only` / `[hidden]` / 瞬态 HUD。页面检查由 7 error 回到 **0 error / 0 warn**。
- 2026-10-21（第四轮·收尾）：`scripts/verify-game.mjs` 增写 `screenshots/probe-report.json`（可重复生成，替换此前一次性探针留下的 66 项旧报告）；主截图 7 张改由 **Ego 浏览器**按固定视口重拍；README / RESTYLE-INVENTORY / QA / STATUS 按第四轮分层架构重写。
- 2026-10-22（第四轮·终态）：**按 16 的规范就绪告知 + 用户「Ego 是唯一浏览器入口」的长期约定**，把两支 L3 脚本从「本地另起 Chromium / Playwright」迁到 **Ego**（前者直接复用批次共享 `tools/ego-qa/lib/runner.mjs`），`npm run verify` 保持全程离线。
- 2026-10-22（第四轮·终态）：补测 HUD 层对比度，**查出并修掉两处真实缺陷** —— ① 覆盖层眉标 4.22:1 / 脚注 2.4:1 不达 AA（16 明确 HUD 不豁免），改用同属画布色板的 `--lumen-cyan` / `--lumen-slate`；② 入口注入的 `--ds-base` 在**构建产物**里被规范层默认值反向覆盖（Vite 把合并 CSS 放到 `<head>` 末尾），加 `!important` 修正。
- 2026-10-22（第四轮·终态）：游戏页正文补挂 `.ds-body` / `.ds-sm` / `.ds-mono`，使 12 个规范对比度样本在游戏页同样可测（每页 12 项：展厅 12 规范样本 / 游戏页 7 规范 + 5 HUD）。
