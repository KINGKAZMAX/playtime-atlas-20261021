# REFERENCE-AUDIT — olek.si 视觉取证档案

> 任务：16-design-system ｜ 负责人：MiniMax Code (M3.1-Flash / max)
> 观测窗口：**2026-10-21 19:07 – 20:05 (GMT+8, 台北)**｜**补证 20:45 – 20:58 (GMT+8, 台北)**
> 取证对象：**https://olek.si/**（`Oleksii Besida – a Delight-Centered IxD Designer`，斯德哥尔摩）
> 本档案是 `DESIGN-SPEC.md` 与 `design-tokens.json` 的唯一事实来源。

---

## 0. 证据分级（先读这一节）

本档案中每条结论都标注了证据等级。**不允许把 B/C 级证据当作 A 级使用。**

| 等级 | 含义 | 可信度 | 本次获得情况 |
| --- | --- | --- | --- |
| **A · 直接视觉观察** | 在真实浏览器中看到并截图留证 | 最高 | ✅ 桌面英雄区、4 个作品段、移动端英雄区、**灯箱展开态 / 关闭态** |
| **B · 运行时计算样式** | 浏览器 `getComputedStyle` 实测数值 | 很高 | ✅ 40+ 个元素、4 个分区状态、灯箱开合两态 |
| **C · 站点自身源码字面量** | 站点前端包内 CSS/JS 原文 | 高（但属"代码事实"而非"观感事实"） | ✅ 令牌、缓动曲线、灯箱状态机、**详情页（article）渲染实现** |
| **D · 二手/推断** | 由 A/B/C 推导，未直接看到 | 中 | ⚠️ 已逐条标注，**仅 3 条**，见 §7 |

**与 19-architecture-atlas 同一口径的对照**（两批档案可互读）：

| 本文分级 | 19 会话口径 | 等价性 |
| --- | --- | --- |
| **A** 直接视觉观察 | `[直接]` | 本会话亲自打开页面并观测到，附截图路径 + 观测时间 |
| **B** 运行时计算样式 | `[直接]`（数值层面） | 浏览器运行时实测，与截图同源，客观非推测 |
| **C** 站点自身源码字面量 | `[一手源文件]` | 从参考站自身下发的 HTML/JS 中直接读出的字面量 |
| **D** 二手/推断 | `[二手]` | 非直接观测，仅作旁证，**不用于确立设计结论** |

> **本文所有「设计结论」同样只由 A/B/C 支撑；D 级仅 3 条且逐条标注使用限制**，与 19 会话口径一致。
> **本文档不复用 19 的结论作为事实来源**（那会降级为 D/二手）；
> 一致处按**独立交叉印证**记录，见 §2.2。

> **诚实声明**：本次**没有**使用任何搜索引擎快照、第三方介绍文章或"看起来像"的二手描述来补足风格判断。
> 所有风格结论都能回溯到 A/B/C 级证据。凡是没能直接看到的状态（**参考站的独立文章详情页**、About 页、扩展作品集模式），
> 本档案**明确标注为未取得视觉证据**，并只用 C 级源码描述其行为。

---

## 1. 取证方法与工具链

| # | 方法 | 工具 | 产出 | 可复现脚本 |
| --- | --- | --- | --- | --- |
| M1 | 内置浏览器交互式浏览（Element snapshot + 截图） | MiniMax 内置 Browser (Electron FilePanel) | 结构快照、英雄区截图 | — |
| M2 | 无头 Chrome + 原生 CDP 驱动（Node 24 内置 WebSocket，**零第三方依赖**） | Google Chrome 155.0.8059.85 `--headless=new` | 桌面/移动截图 + 计算样式 JSON | `tools/capture-reference.mjs`、`capture-reference-part2.mjs`、`capture-reference-part3.mjs`、`capture-lightbox.mjs` |
| M3 | 直接 HTTP 取站点 HTML 外壳与前端包，抽取其 CSS/JS 字面量 | `curl` | 令牌/缓动/状态机原文 | 见 §3.4 |
| M4 | 取站点**懒加载子包**（文章页 chunk）并静态还原其渲染实现 | `curl` + 源码定位 | 文章页 DOM 构造、动效时序、squircle 参数 | 见 §3.5.3 |
| M5 | DOM 结构探针（点击后全文检索特征节点 + 祖先链取样式） | 原生 CDP `Runtime.evaluate` | 灯箱真实容器与选择器 | `tools/probe-detail-dom.mjs` |

**为何两条浏览器路径都要**：M1 能给出可交互结构，但该站是重媒体 SPA，M1 截图在 275 s 超时；
M2 可脚本化、可精确控制视口与 DPR、可批量产出可归档 JSON。M3 提供只有源码才有的精确数值（缓动曲线、状态选择器）。

**取证期间的技术处置**：M2 全程 `Network.setBlockedURLs(['*.mp4','*.webm','*.mov'])` 阻断视频流——只取布局与样式证据，不下载媒体资产。参考站**未**被修改、**未**被提交任何表单、**未**下载其图片/视频/字体文件用于再分发。

---

## 2. 来源清单

| 来源 | 类型 | 访问时间 (GMT+8) | 结果 |
| --- | --- | --- | --- |
| `https://olek.si/` | 交互浏览 | 19:07 | ✅ HTTP 200，5633 B 外壳 |
| `https://www.olek.si/` | 变体 | 19:07 | ✅ 301 → `https://olek.si/` |
| `https://olek.si/assets/index-Cq43OVCY.js` | 前端包 | 19:08 | ✅ HTTP 200，575 391 B |
| `https://olek.si/`（移动 UA，iPhone 17.0 Safari） | 移动端 | 19:23 | ✅ 成功渲染并截图 |
| `https://olek.si/`（移动 UA，第二轮） | 移动端 | 19:48 | ❌ **ERR_CONNECTION_CLOSED** |
| `https://olek.si/`（灯箱专项，多轮重试） | 交互态 | 19:52–20:00 | ❌ 未能打开灯箱（见 §6.2） |
| `https://olek.si/assets/index-Cq43OVCY.js`（重取） | 前端包 | 20:47 | ✅ 200，575 391 B（灯箱状态机还原） |
| `https://olek.si/assets/page-plsFtWPY.js` | **文章页懒加载子包** | 20:50 | ✅ 200，391 750 B（详情页渲染实现还原） |
| `https://olek.si/`（第三档 · 详情/覆盖层补证） | 交互态 | 20:47–20:58 | ✅ **灯箱展开态与关闭态均已复现** |
| `https://olek.si/api/extended?path=%2F` | 扩展模式接口 | 20:51 | ✅ 200，返回 `{}`（根路径无扩展变体） |
| `https://olek.si/sitemap.xml` / `/robots.txt` | 站点地图 | 20:51 | ❌ 404（纯 SPA，无可枚举路由） |
| `https://olek.si/SPTLGHT`（作品键直连） | 路由探测 | 20:51 | ❌ 无响应（无独立作品页路由） |

DNS：`olek.si → 216.150.16.1 / 216.150.1.65`（Vercel 边缘）。

### 2.1 站点技术栈（B/C 级事实）

- 站点外壳：Vite 构建的 **Vue** SPA（`<html data-section="0">`、`dataset.extended`、模块化 `createElement` 调用）。
- 全部 CSS 以 JS 模板字符串内联注入（`globalStyle` / `mobileStyle` / `desktopStyle` / `indexStyle` / `articleStyle` / `animateStyle` 六个常量），**无外部 CSS 文件**。
- 字体：5 个 woff2 预加载（`display` / `text` / `inter` / `interd` / `interr`），全部**自托管**于 `/assets/`，**不依赖 Google Fonts 等 CDN**。
- 内容模型：14 个作品，键为语义 ID（`SPTLGHT` `BLOOM25` `TOOLS25` `EDITR24` `VSSAI24` `AIBOX24` `STESE24` `STEHO24` `AGENT23` `FILES23` `SKICO23` `DRIAC23` `WEATH23` `FLLWM23`），每项含 `date`（月份+年份或 `SPTLGHT` 特例）、`c`（背景色，**不含 `#`**）、`n`（标题）、`a`（一句简介，可选）。

### 2.2 与 19-architecture-atlas 的独立交叉印证

> 19 会话独立复测 `curl https://olek.si` → **http=200 / 2.5s**，并产出同级分级的 `REFERENCE-AUDIT.md`（`[直接]`/`[一手源文件]`/`[二手]`）。
> 两批是**各自独立观测**（不同会话、不同工具链、不同时间窗），因此一致处构成**交叉印证**而非互相引用。

| 事实 | 19 会话结论 | 本会话独立实测 | 判定 |
| --- | --- | --- | --- |
| 主展示标题字号 | `96px` | `#headline` = **96px** / line-height 116px / `-2.64px` / `wght 500`（B 级，`report-desktop.json`） | ✅ **一致** |
| 唯一强调色 | `--accent: #6549F2` | 同值（B 级 `accent` 字段 + C 级 token 表） | ✅ **一致** |
| 分区媒体圆角 | `clamp(16px, 2vw, 24px) / var(--r)` | 同式（C 级源码）；并实测 `clip-path` 为**超椭圆** `path()` | ✅ **一致**（我方多一层实测） |
| 背景 | `--background: #FFF` | `.sections` background `#FFFFFF`（B 级） | ✅ **一致** |
| **「32px = 分区标题」** | 记为分区标题 | **我方 B 级实测：作品分区标题 `.design.page .header h3` = 20px / 500 / `interd`**；**32px 实为 About 预览标题** `.about-title` / `.about-text`（**C 级源码**：`font-variation-settings:"opsz" 32,"wght" 300/350`、`line-height 1.6`、移动端降为 17px/`wght 400`） | ⚠️ **非冲突，是不同元素**；19 的标签宜按「About 预览标题」理解 |
| 移动端直接观测 | 19 **未取得**（其取证在 1280×720 CSS 视口完成） | ✅ 本会话取得 **390×844** 直接观测 + 3D `matrix3d` 轮播机制实测 | ↔ **互补**，两批拼合后无空档 |

> **给 13 / 14 / 15 的读法提示**：两份档案在「32px」上指向**不同元素**，不构成矛盾；
> 本项目真正采用的「分区标题 20px / 500」以**本会话 B 级实测**为准（见 §3.2 与 `design-tokens.json`）。

---

## 3. 直接观察结果

### 3.1 桌面 · 英雄区（A 级）

**证据**：`evidence/ref/desktop-home.png`（2560×1440，CSS 视口 1280×720，DPR 2）

| 观察项 | 实测 |
| --- | --- |
| 整体 | 纯白底（`rgb(255,255,255)`），无卡片边框，无分割线；四周有极淡的蓝灰色径向柔光（`#safari-fade` + `--glow-color` 叠加） |
| 主标题 | 「I'm a Delight Centered IxD Designer」，**居中**，96px / 116px，字距 **-2.64px**，`wght 500`，`rgba(0,0,0,0.933)`，字体族 `interd`（Inter Display） |
| 标题行内 | "Centered" 一词在桌面与移动是两套 `<span>`（移动端隐藏 `.desktop` 变体） |
| 顶部小标 | 24×16 椭圆头像 + 「OLEKSII」小字（`display` 族，14px，字距 -0.64px，色 `#999`），头像外有 `0 0 0 3px #FFF` 白描边 |
| 胶囊按钮 | 「Lustral Studio」+ 图形，高 36px，圆角 18px，底色 `rgba(0,0,0,0.067)`，内距 `0 16px 0 12px`，图标与文字间距 4px |
| 社交圆钮 | 4 枚 50×50 圆，间距 24px，`inset 0 0 0 1px rgba(221,221,221,0.467)` 描边，内部图标 48px |
| 手写签名 | 社交钮下方有手写体签名图，`filter: invert(75%)` |
| 左侧导航轨 | **竖排**，位于 x=24，宽约 129px。条目为 14px / 字距 -0.5px / 色 `#999` |
| 底部 | 有一个向下的 chevron（滚动提示） |

**导航轨（景深）**：这是本次最重要的视觉发现。截图中「OCT 2024」清晰且颜色更深，而上下相邻条目「APR 2025」「JUN」「MAR」明显**模糊且更淡**。站点用 `filter: blur()` + `opacity` 按"距当前分区的距离"逐级衰减，源码中对应 `calculateBlur(y, o)` 与 `renderSection(...)`。条目之间用 1px 短横线（10×1px，透明度 .3）分隔。

> **本系统取用的机制**：景深式导航轨（§2.1 / DESIGN-SPEC §4.1）。
> **本系统不取用的部分**：具体模糊像素量、具体字体与配色。

### 3.2 桌面 · 作品段（A 级）

**证据**：`evidence/ref/desktop-hover-gallery.png`（Editor / EDUTR24 段）、`evidence/ref/desktop-section-VSSAI24.png`（Web Lookup 段）、`evidence/ref/desktop-section-AGENT23.png`（AgentGPT 段）

| 观察项 | 实测 |
| --- | --- |
| 段高 | 整屏 100dvh，每段一个作品，**纵向 scroll-snap 强制吸附**（`scroll-snap-type: y mandatory` + `scroll-snap-stop: always`） |
| 段标题 | `<h3>` 居中，20px / `wght 500` / `interd` / 黑色，上下外边距 28px |
| 媒体卡 | 圆角 **24px**（`clamp(16px, 2vw, 24px)` ÷ `--r`），`overflow: hidden`；桌面最大 `min(1024px, 92vw)` 宽、`calc(100vh - 256px)` 高 |
| 画廊留白 | 水平内边距 `max(4vw, 50vw - 512px)`（1280px 视口下 = **128px**），项间距 `2vw` = 25.6px |
| 指示器 | 底部居中，**单个 6px 圆点**，`bottom: 57.6px`（= `clamp(36px, 8vh, 64px)`），`border-radius: 999px`，非激活 `opacity .2`、激活 `1` |
| 3D 透视 | `.sections` / `.design` / `.gallery` / `.header` / `#container` / `#headline` 均设 `perspective: 512px`；滚动时分区做 `rotateX(-5h deg)`，`transform-origin: 50% calc(50% - h·vh)` |
| 离屏优化 | 视口外分区 `content-visibility: hidden` |
| 分区色 | 14 段全部 `c: "FFFFFF"` → 背景纯白，色调判定 `tone: light` |

**AgentGPT 段（AGENT23）** 展示的是一张大面积产品界面截图占据整卡，说明"作品卡"可以是一张完整 UI 截图而非小图。

### 3.3 移动端 · 390×844（A 级）

**证据**：`evidence/ref/olek-mobile-390-hero.png`（780×1688，DPR 2，iPhone Safari UA）

| 观察项 | 实测 |
| --- | --- |
| 导航轨 | **转为横排**，固定在顶部：`HOME │ │ │ 2026`，条目间是 1×10px 竖线（`.separator` 从 10×1px 横线 rotate 成竖线） |
| 主标题 | 「Delight Centered IxD Designer」——「I'm a」被隐藏（移动端 `.desktop { display:none }`），42px / 54px，字距 -2.64px，字体族降级为 `inter` |
| 按钮与社交钮 | 布局与桌面一致（胶囊按钮 + 4 枚圆钮） |
| 底部 | 向下 chevron |
| 底部留白 | 顶部有大面积空白（`#container { gap: 32px }`、标题区垂直居中） |

#### ⚠️ 参考站在 390px 下的两处真实缺陷（我们必须避免）

1. **主标题横向溢出**：`#headline` 是 `white-space: nowrap`，42px 下「Delight Centered」一行放不下 390px，**右侧被裁切**。
2. **社交钮行溢出**：4 枚 50px 圆钮 + 3×24px 间距 = 272px 看似够，但配合 `#container` 居中与外层裁切，最右的 LinkedIn 圆钮**被切边**。
3. 另：参考站全局 `letter-spacing: -0.04em`（实测 body 为 `-0.64px`）。**该值对汉字不可用**，负字距会压垮中文字面。

> 这三点直接决定了本系统 DESIGN-SPEC **§2.3（中文排版）** 与 **§3.2（封面标题禁止 `nowrap`）** 的硬性条款。

**移动端导航机制（20:58 布局诊断补充，B 级）**：移动端与桌面**不是同一套滚动模型**——
`#index` 的 class 为 `"route"`（**无 `scroll-snap`**），`.sections` 为 `display:flex; flex-direction:row; overflow-y:visible`，
各 `.design.page` 全部 `position:absolute; top:0` 叠放，靠 **3D `matrix3d` 旋转位移**切换当前分区
（实测当前分区为 `rotateX(-5deg)` + `translateY(840.788)`）。详见 §6.7。

### 3.4 源码级令牌（C 级：站点自身 CSS 原文）

来源：`https://olek.si/assets/index-Cq43OVCY.js` 中的 `globalStyle` 与 `indexStyle` 常量。

**全局主题（浅色）**
```css
:root {
  --background: #FFF;  --text: #000;  --accent: #6549F2;
  --secondary: #999;  --element: #F2F2F2;  --border: #DDD7;
  --background-position: left 50% top calc(50%);
}
```
（深色版本在源码中**被注释掉**，未启用：注释块内为 `--background:#000; --text:#FFF; --secondary:#666; --element:#111; --border:#1A1A1A;`）

**色调系统（分区自适应）**
```css
:root { --tone-fg:#000; --tone-soft:#999; --tone-softest:#9996;
        --tone-fade:#F5F5F5; --glow-color:#FFF; --tone-blend:plus-darker; }
html[data-tone='dark'] { --tone-fg:#FFF; --tone-soft:#FFFC; --tone-softest:#FFF6;
        --tone-fade:#101010; --glow-color:#111; --tone-blend:plus-lighter; }
.design { --section-color:#000; --section-soft:#0009; --section-invert:0; --section-dot:#000;
        --about-title:#0008; --about-text:#000B; --about-preview-text:#000C; }
.design.page[data-tone='dark'] { --section-color:#FFF; --section-soft:#FFFC; --section-invert:1;
        --section-dot:#FFF; --about-title:#FFFF; --about-text:#FFFC; --about-preview-text:#FFFF; }
```
**色调判定算法（源码）**：`hex(c)` 去掉 `#`，若 3 位则补成 6 位；把 R、G、B 三个字节**求和**，`< 384` 判为 `dark`，否则 `light`。
`animateTheme(id)` 在每次滚动吸附时改写 `<html>` 的 `data-tone`、`--tone-fade`、`--glow-color` 与 `.sections` 的背景色，过渡 `.4s cubic-bezier(0.4,0,0,1)`。

**关键缓动曲线（C 级，全部为站点原文）**
| 曲线 | 用途 |
| --- | --- |
| `cubic-bezier(0.1, 0.1, 0, 1)` | 站点主曲线 `--animat`（分区位移/缩放/圆点指示器） |
| `cubic-bezier(0.3, 0, 0, 1)` | 标题与名称入场（`rotateX(-45deg) translateY(...)` + `blur(4px)`） |
| `cubic-bezier(0, .25, 0, 1)` | 时间轴入场（`translateY(192px)` + `blur(8px)`，移动端为 `translateX`） |
| `cubic-bezier(0.075, 0.82, 0.165, 1)` | 加载 spinner 入场（12 片 30° 递增叶片） |
| `cubic-bezier(0.4, 0, 0, 1)` | 背景/色调切换 `.4s` |
| `cubic-bezier(0.4, 0, 0.2, 1)` | 时间轴条目透明度 `.3s` |
| `cubic-bezier(.75, 0, 0, 1)` | 签名与页脚位移 `2s` |
| `cubic-bezier(0, 0, 1, .25)` | 签名淡出 `.8s` |
| `cubic-bezier(0.2,.8,.3,1)` / `cubic-bezier(.5,0,.5,1)` | 顶部提示条进出 |

**入场动效（源码）**
- 名称：`rotateX(-45deg) translateY(48px)`、`opacity 0`、`blur(4px)` → 归位，`.8s`
- 副标题：`margin-left: -24px` → 0，`.2s`
- 标题/按钮/社交钮：`cube-rotate` = `rotateX(-45deg) translateY(64px)` + `blur(4px)` → 0，`.8s`
- 时间轴：桌面 `translateY(192px)`，移动 `translateX(192px)`，均带 `blur(8px)`，`.1s`… 准确为 `1s`
- 签名：`padding: 0` + `opacity 0` + `invert(75%) blur(32px)`，`2s`

**灯箱状态机（C 级，源码原文）**
```css
.design.page.lightbox-open {
  .gallery { transform: scale(var(--lightbox-scale, 1)); }
  .header  { opacity: 0; filter: blur(8px); h3 { translate: 0 var(--header-morph-y,0px); scale: 0.9 0.75; } }
  .content { opacity: 0.08; filter: blur(16px); }
}
#lightbox-close { opacity:0; filter: blur(6px); scale: 0.75;
  &.lightbox-open { opacity:1; filter: blur(0px); scale:1; pointer-events:all; } }
.gallery-indicator.idle { .dots { opacity:0; filter: blur(8px); scale:.5 }
                           .chevron { opacity:.6; filter: blur(0px); scale:1 } }
```
媒体卡在未展开时 `cursor: zoom-in`（**B 级实测确认**：`cursor: "zoom-in"`）。

**其余实测（B 级）**：`a, button` 基础样式 40×40px / `border-radius: 40px`；`::selection { color:#FFF; background: var(--accent) }`；`body { font-family:'text'; letter-spacing:-0.04em; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility }`；`.about-title` / `.about-text` 为 32px、`font-variation-settings: "opsz" 32, "wght" 300/350`、`line-height 1.6`、移动端降为 17px/`wght 400`；`.gallery-dim` 为 `background:#8080804B; opacity:0`（hover 遮罩）；`.gallery-arrow` 为 `opacity:0; filter: blur(12px); scale:.5`（悬停箭头）；`#safari-fade` 高 128px、`backdrop-filter: blur(4px)`；`html { height: calc(100vh + 128px) }`。

---

### 3.5 第三档 · 覆盖层（灯箱）与详情路由（20:47–20:58 补证）

> 本节是 19:52–20:00 那轮失败后的补证。**第一轮打不开灯箱的原因已查清**：
> 此前脚本按 `.design.page .gallery div > *` 取元素，命中的是**卡片外层 `div`**（坐标为负 / 越界），
> 而参考站真正绑定 `cursor: zoom-in` 与点击处理的是 `picture` / `video` 本身。
> 改为直接命中媒体元素后，灯箱在桌面与移动端均成功打开。

#### 3.5.1 灯箱展开态（A 级截图 + B 级计算样式）

**证据**：`evidence/ref/desktop-lightbox-open.png`（2880×1800 = 1440×900 CSS，DPR 2）、
`evidence/ref/desktop-lightbox-dismissed.png`、`evidence/ref/report-lightbox.json`

**A 级（截图中直接可见）**

| 观察项 | 实测观感 |
| --- | --- |
| 退出提示 | 顶部居中一行 **"SCROLL OR CLICK TO EXIT"**，等宽体、大写字距、灰色；垂直位置约在视口高度 **19.8%** 处 |
| 媒体本体 | 卡片位置 **FLIP 展开**，在桌面档中向右溢出并被视口右边界裁切 |
| 指示器 | 视口底部**双圆点**（首点实心、次点空心）；页面中部偏右另有一枚**细线箭头** |
| 背景 | **纯白、无压暗遮罩**——与分区白底同色，靠"内容位移 + 圆角变化"而非明暗差来区分层级 |

**B 级（`getComputedStyle` 实测，桌面 1440×900）**

| 元素 | 打开态 | 关闭态 |
| --- | --- | --- |
| `.design.page` | class 含 `lightbox-open` | class 不含 |
| `#lightbox-close`（`<p>`） | `opacity:1`、`filter:blur(0px)`、`scale:1`、`pointer-events:all`、`cursor:pointer`、class `lightbox-open`、`top:178.416px` | `opacity:0`、`blur(6px)`、`scale:0.75`、`pointer-events:none`、`top:217px` |
| `#lightbox-close > img` | 196×10 px，`opacity:.75`，**`alt="Scroll or click to exit"`** | 同 |
| `.gallery-indicator .dots` | `opacity:0.75` | `opacity:0.6` |
| `.gallery-indicator .chevron` | 56×56 `<img>`，**`alt="scroll down icon"`** | `opacity:0`、`invert(0) blur(6px)`、`scale:0.5` |
| 媒体元素 `cursor` | `auto`（已在灯箱内） | **`zoom-in`**（可点开） |
| 媒体 `border-radius` | `19.32px`（FLIP 中间态） | `24px` |
| 媒体 `clip-path` | **`path("M 265.224 0 C 279.713 0 …")`** | 同一 `path()` |

> **重要**：退出提示与箭头指示器的文案**不是 DOM 文本**，而是 196×10 / 56×56 的 `<img>`（内联 SVG）。
> 此前用「全文搜索 `SCROLL OR CLICK TO EXIT`」定位失败，**是探针选错了对象，不是状态没出现**。
> 正确做法是查 `alt` 属性。

#### 3.5.2 灯箱机制还原（C 级：来自 `index-Cq43OVCY.js`）

| 机制 | 源码事实 |
| --- | --- |
| 容器 | `.lightbox-layer { position:fixed; z-index:999999; overflow:hidden; pointer-events:none; will-change:top,left,width,height,opacity }`；`&.ready { transition:.1s opacity ease-out; visibility:visible; opacity:1 }` |
| 悬停预览 | `mountPreview()` **克隆**媒体节点 → 追加 `.lightbox-layer` + `aria-hidden="true"` → 按原 rect 定位 → **rAF 逐帧跟随** → 图像解码完成后加 `.ready` 并 `squircleObserver` |
| 圆角 | `clamp(.02 * innerWidth, 16, 24) / 页面 --r`，`cornerSmoothing: .8` → **苹果风格超椭圆**；实测桌面 24px、移动 11.5px，clip-path 为 `path()` 贝塞尔超椭圆而非圆角矩形 |
| 展开 | 媒体本体 `border-radius 0.5s cubic-bezier(.1,.1,0,1)` 过渡 → **FLIP**（不是缩放淡入） |
| 退出提示 | 用 **`top` 过渡 0.5s**（`cubic-bezier(.1,.1,0,1)`），`opacity/filter/scale` 0.75s → 属**布局动画**，与其余 transform 动画不同源 |
| 指示器切换 | `.design.page.lightbox-open .gallery-indicator.idle` → `.dots` 淡出（`opacity:0; blur(8px); scale:.5`）、`.chevron` 淡入（`opacity:.6` + `invert(--section-invert)`） |

> ⚠️ `.dots` 与 `.chevron` 的**同时可见**只在指示器**非 idle** 时成立；
> 灯箱完全展开后 `.idle` 生效，圆点消失、只留箭头。截图中二者并存，属**展开过程中的过渡态**。

#### 3.5.3 参考站的「作品详情页（article）」— C 级源码确证，**但无视觉证据**

参考站**确实实现**了一个独立的作品详情页（懒加载 chunk `page-plsFtWPY.js`，391 750 B）。
C 级源码事实：

- 结构：`#article`（`display:none` → `block`）内含 `.background`（`#FFF0`）与 `#sheet`（`position:fixed; height:100dvh; overflow:scroll`）。
- 入场：`#sheet > *` 统一 `transform:translateY(32px); opacity:0; filter:blur(32px)` → 逐个 `y:0 / opacity:1 / blur(0)`（spring `visualDuration .7 / bounce .5`，`stagger(.1, {startDelay:.3})`）。
- 背景页处理：底层 `#index` 同步 `scale:.75 / opacity:.5 / filter:blur(8px)`（`circInOut` 1s），退出时还原。
- 头图：`<picture>` + `<img>`，**squircle**（`cornerRadius: 20/(projects[key].r||1)`，`cornerSmoothing:.8`），入场 `rotateX:["-25deg","0deg"] / y:[64,0] / scale:[.75,1]`（spring `bounce .25`）。
- 标题区：`h3` = 作品名，`p` = `"6 min" · 日期.full`，**并置一个 "Clap" 按钮**（Lottie 动画 + 掌声音频 + 计数）。
- 正文：`marked.parse(articleData(key).article)` 渲染 Markdown，`font-family: inter`、16px/30px、`opsz 32`、`#222`。
- 遮罩入场：`mask-image: linear-gradient(...)` 逐段揭开（1.5s `easeInOut`）。
- 关闭：`.back` 按钮 → `sheet` 放大到 `scale:1.3`（spring `stiffness:128 / damping:24`）后归位。

**为什么仍然拿不到视觉证据（C 级事实，非推测）**：

1. 主包中 `article` 仅有 **13 处**出现，**从未出现 `article.render(...)` 调用**——`entries({index,article})` 只把 `article.DOM` 挂到 `body` 上，路由**从不激活**。
2. 外壳 `<html>` 只有 `data-section="0"`，**没有 `data-extended="1"`**，而 `extend()` 依赖 `document.documentElement.dataset.extended === "1"`。
3. `/api/extended?path=%2F` 返回 `{}`；`/sitemap.xml`、`/robots.txt` 均 404；`/SPTLGHT` 无响应——**不存在可枚举的作品页 URL**。
4. 分区标题 `h3` 在源码中**没有 `onclick`**（`createElement("div",{class:"header"},createElement("h3",null,projects[t].n))`），因此点击标题**不会**打开详情页。

**结论**：该文章页在当前公开构建中**不可达**。它的**视觉观感无一手依据**——
本系统在 `DESIGN-SPEC.md` §6 与 §8.5 中涉及该页面的**全部视觉取值**，
一律标注 **「本批自定，无参考站实测依据」**，仅**机制层面**（分层遮罩、底层缩放模糊、squircle 头图、Markdown 正文、Clap 互动）标注为 C 级参考。

---

## 4. 可复现性

> ⚠️ **取证入口已于 2026-10-22 变更**（用户长期约定，跨项目生效）：今后所有**网站访问 / 网页观测 / 截图**一律走 **Ego 浏览器**（`/Users/mekzenx2/.local/bin/ego-browser`，先跑 `ego-browser skill`），**不得**另起 Playwright / Chromium / Chrome。
> **本节的脚本是 2026-10-21 取证所用的历史路径**，**仅用于复现既有取证**，不得用于新的网页观测；新增取证请改走 Ego（形态见 `tools/README.md`）。
> **已固化的 A/B/C 级证据不因入口变更而失效**——证据等级与全部结论照旧有效。

```bash
# ⚠️ 以下为历史取证路径，仅用于复现；新增观测请走 ego-browser
# 全量桌面取证（截图 + 计算样式 JSON）
node tools/capture-reference.mjs /tmp/olek_capture
# 移动端 + 悬停 + 灯箱闭合态
node tools/capture-reference-part2.mjs /tmp/olek_capture
node tools/capture-reference-part3.mjs /tmp/olek_capture
# 灯箱专项（失败留证轮）
node tools/capture-lightbox.mjs /tmp/olek_capture
# 第三档 · 详情/覆盖层补证
node tools/capture-detail.mjs /tmp/olek_detail        # 详情路由探测（结论：不可达）
node tools/probe-detail-dom.mjs /tmp/olek_probe        # DOM 结构探针
node tools/capture-lightbox2.mjs /tmp/olek_lightbox    # 灯箱开合（桌面 + 移动）
node tools/capture-lightbox-mobile.mjs /tmp/olek_lb_mobile  # 移动端灯箱（视口严格对齐版）
```

原始数据落在 `evidence/ref/report-desktop.json`（桌面计算样式，14.5 KB）、
`evidence/ref/report-part2.json`（移动/悬停/灯箱闭合态，2.6 KB）、
`evidence/ref/report-detail.json`（详情路由探测）、
`evidence/ref/report-probe.json`（DOM 结构探针）、
`evidence/ref/report-lightbox.json`（灯箱开合计算样式）。

> **复现注意**：headless Chrome 的窗口若小于移动设备物理尺寸，Chrome 会把整页缩放进窗口，
> 导致 `innerWidth` 变成 **644**（= 390 / 0.606）而非 390，合成点击会因此落在视口外。
> `tools/capture-lightbox-mobile.mjs` 的 `configureMobile()` 会逐个候选配置实探 `innerWidth/innerHeight`
> 与 `(pointer: coarse)`，只接受真正对齐 390×844 的那一组。**这是本轮踩到的两个真实坑，记录在此避免复现者重踩。**

---

## 5. 采集到的事实 vs 未采集到的事实

| 页面/状态 | 视觉证据 | 运行时样式 | 源码 | 结论 |
| --- | --- | --- | --- | --- |
| 桌面英雄区 | ✅ | ✅ | ✅ | 完整取证 |
| 桌面导航轨 | ✅ | ✅ | ✅ | 完整取证 |
| 桌面作品段（Editor / Web Lookup / AgentGPT） | ✅ | ✅ | ✅ | 完整取证 |
| 桌面媒体卡 / 圆点指示器 | ✅ | ✅ | ✅ | 完整取证 |
| 移动端英雄区 | ✅ | ⚠️ 部分 | ✅ | 视觉已取；计算样式因连接中断未取全 |
| 悬停态 | ⚠️ 截图已取但遮罩差异不明显 | ✅ `cursor: zoom-in`、`.gallery-dim` 源码 | ✅ | 以源码 + cursor 实测为准 |
| **灯箱展开态** | ✅ **20:47 补取** | ✅ 开合两态全量 | ✅ 状态机 | **完整取证**，见 §3.5.1 |
| **灯箱关闭态** | ✅ | ✅ | ✅ | 完整取证 |
| 移动端灯箱 | ⏳ 见 §6.6 | ⚠️ | ✅ | 视口/触发器问题，见 §6.6 |
| **作品详情页（article 路由）** | ❌ **公开站不可达** | ❌ | ✅ 实现完整 | **仅 C 级**，见 §3.5.3 |
| About / 简历页 | ❌ | ❌ | ⚠️ 仅 CSS 常量 | 不作为设计依据 |
| 扩展作品集模式（`/api/extended`） | ❌ | ❌ | ⚠️ 接口返回 `{}` | 不作为设计依据 |

---

## 6. 限制与失败记录（不掩盖）

### 6.1 参考站间歇性不可达
移动 UA 第二轮采集与灯箱专项采集期间，参考站多次返回 **`ERR_CONNECTION_CLOSED`**（Chrome 错误页截图留证：`evidence/ref/mobile-attempt-err-connection-closed.png`）。同一时段 `curl` 仍稳定返回 200，判定为**参考站对特定请求形态/UA 的连接中断**，非本机网络完全不可达。Codex 会话也报告了同一错误 `net::ERR_CONNECTION_CLOSED`——本任务因此改用 Chrome + CDP 路径绕开。

**处置**：所有采集脚本内置重试；失败的尝试**保留截图并如实命名**（`*-attempt-*`），不删除、不冒充成功。

### 6.2 灯箱展开态：**已于 20:47 补齐**（本节为过程记录，非遗留缺口）

19:52–20:00 那轮未能打开灯箱，**原因已查明并修复**：

| 当时的做法 | 实际问题 |
| --- | --- |
| 用 `.design.page .gallery div > *` 取元素 | 命中的是**卡片外层 `div`**（坐标为负 / 越界），参考站真正绑定 `cursor: zoom-in` 与点击处理的是 `picture` / `video` 本身 |
| 用「全文搜索 `SCROLL OR CLICK TO EXIT`」定位状态 | 该文案**不是 DOM 文本**，而是 196×10 的 `<img>`（内联 SVG，alt 才是这句话）→ 搜不到 ≠ 没出现 |
| headless 窗口小于设备物理尺寸 | Chrome 把整页缩放进窗口，`innerWidth` 变成 **644**（= 390/0.606），合成点击落在视口外 |

修复后（`tools/capture-lightbox2.mjs`、`tools/capture-lightbox-mobile.mjs`），
**灯箱展开态与关闭态均已取得 A 级截图 + B 级计算样式**，见 §3.5.1。
**本条不再是缺口。**

遗留的失败留证（保留并如实命名，不删除）：`evidence/ref/desktop-click-attempt-lightbox-not-opened.png`。

### 6.3 中文未在参考站出现
参考站是纯英文站点，**没有任何中文字形**。所有涉及中文排版（字距、行高、标点、换行、按钮宽度）的规则**均为本系统自有设计**，不存在"参考站怎么做的"这一事实来源。已在 DESIGN-SPEC §2.3 单独标注。

### 6.4 参考站是单一作品集，非多作品大厅
参考站是**一个人**的作品集（14 段竖排）。本项目需要的是**多作者、14+ 件作品、可筛选、可进入游玩**的大厅。二者的信息架构不同。参考站能提供的是**视觉语法**（分段的克制、留白、层级、单一强调色），**不能**提供大厅的列表/筛选/状态规范——那部分由本系统原创设计。

### 6.5 参考站的「作品详情页（article）」在公开站**不可达**（C 级事实，非推测）

参考站**实现了**一个独立作品详情页（懒加载 chunk `page-plsFtWPY.js`），但**当前公开构建从不激活它**：

| 判据 | 事实 |
| --- | --- |
| 调用点 | 主包中 `article` 仅 13 处出现，**无 `article.render(...)`**；`entries({index,article})` 只把 `article.DOM` 挂到 `body` |
| 开关 | 外壳 `<html>` 仅有 `data-section="0"`，**无 `data-extended="1"`**，而 `extend()` 依赖该属性 |
| 接口 | `/api/extended?path=%2F` 返回 `{}` |
| 路由 | `/sitemap.xml`、`/robots.txt` 均 404；`/SPTLGHT` 无响应；**不存在可枚举的作品页 URL** |
| 触发器 | 分区标题 `h3` 在源码中**没有 `onclick`**（`createElement("div",{class:"header"},createElement("h3",null,projects[t].n))`） |

**因此**：该页的**机制**有 C 级源码依据（见 §3.5.3），**视觉观感无一手依据**。
DESIGN-SPEC 中涉及该页的视觉取值一律标注「**本批自定，无参考站实测依据**」。

### 6.6 移动端灯箱展开态：**未取得视觉证据**（明确缺口，不掩饰）

桌面档灯箱已取得 A/B 级证据（§3.5.1）。移动端 390×844 未能稳定复现，四轮尝试的失败原因如下（均为本侧方法问题，非站点故障）：

| 轮次 | 做法 | 失败原因 |
| --- | --- | --- |
| 1 | 按元素 rect 中心合成点击 | headless 窗口小于设备物理尺寸 → Chrome 整页缩放，`innerWidth` 变 **644**（= 390/0.606），点击落在视口外 |
| 2 | 改用真实 touch 事件 + 视口自检 | 视口已对齐（390×844），但点击命中**英雄区的「Lustral Studio」外链按钮**，页面跳转 `lustral.studio`（该按钮触发 `lustralTransition()`） |
| 3 | `scrollIntoView` 定位分区 | 移动端**无 scroll-snap**，分区不按文档流排布，滚动定位无效 |
| 4 | `document.elementFromPoint` 全视口扫描真实可点像素 | **扫描 0 命中** → 原因见下 |

**根因（布局诊断实测，`tools/diagnose-mobile-layout.mjs`）**：移动端 `#index` 的 class 是 `"route"`（**无 `scroll-snap`**），
`.sections` 为 `display:flex; flex-direction:**row**; overflow-y:visible`，各 `.design.page` 均 `position:absolute; top:0` 叠在一起，
靠 **3D `matrix3d` 旋转位移**切换当前分区（如 SPOTLGHT 当时为 `rotateX(-5deg)` + `translateY(840.788)`）。
因此分区的媒体元素**默认不在视口内**，必须先驱动三维轮播切换到目标分区——合成事件难以可靠复现该手势。

**结论**：移动端灯箱展开态**无一手依据**。
参考站的灯箱 CSS 位于共享样式表（`indexStyle`）而非移动端专用表，**机制层面**推定两端一致；
**观感层面无依据**，DESIGN-SPEC §8.5.3 的移动端取值全部标注为「本批自定，无参考站实测依据」。

### 6.7 移动端导航机制与桌面**完全不同**（B 级实测，重要发现）

| 维度 | 桌面（≥768px） | 移动（≤768px） |
| --- | --- | --- |
| `#index` class | `route scroll-snap` | `route`（**无 scroll-snap**） |
| `.sections` | `flex-direction: column`、`overflow-y: scroll`、`scroll-snap-type: y mandatory` | `flex-direction: **row**`、`overflow-y: visible`、`height: 100dvh` |
| 分区定位 | `top: N×100dvh`（文档流堆叠） | 全部 `position:absolute; top:0` 叠在一起 |
| 切换方式 | 纵向 scroll-snap | **3D `matrix3d` 旋转 + 位移**（实测 `rotateX(-5deg)` + `translateY(840.788)`） |
| 额外层 | `.snap` 占位块 | 无 |

> **对本系统的影响**：参考站移动端是"三维卡片旋转"，**我们明确不采纳**——
> 3D 倾斜会削弱大字号中文的可读性，且与 `position: fixed` 的 HUD/顶栏叠加时层级不稳。
> 本系统移动端采用**同一套竖向分段 + 导航轨**（见 DESIGN-SPEC §3.4 / §4.1），仅在 768px 断点调整栅格与字号。

---

## 7. 三条推断（D 级，谨慎使用）

| # | 推断 | 依据 | 使用限制 |
| --- | --- | --- | --- |
| D1 | 参考站刻意只用一个强调色（紫 `#6549F2`），其余全部为无彩灰阶 | C 级：`--accent` 唯一彩色 token；`::selection` 用同一色 | **可采信为机制**（单强调色），但**色值不取用** |
| D2 | 导航轨的景深模糊用于在有限像素内表达"当前位置 + 邻域" | A 级（截图对比）+ C 级（`calculateBlur`） | **可采信为机制**，本系统改用不透明度 + 缩放衰减（见 DESIGN-SPEC §4.1），避免 `filter: blur` 带来的可读性与性能代价 |
| D3 | 站点的" delight-centered"主张落在**大字号、紧字距、低饱和、缓慢缓动**四点上 | A 级 + C 级综合 | **可采信为方法论**；本系统以"大字号 + 中性字距 + 暖纸底 + 稳缓动"落地，不复制其紫色与紧字距 |

---

## 8. 授权与合规声明

- 参考站为**公开作品集**，本任务仅作**只读视觉观察与设计机制研究**。
- **未**下载、未再分发、未嵌入其任何图片、视频、字体文件、Logo、图标、代码到本交付包。
- `evidence/ref/` 中的 PNG 是**取证截图**，用于内部设计决策与验收留痕；`design-tokens.json` / `DESIGN-SPEC.md` 中出现的是**机制描述与自有取值**，不含参考站资产。
- 本系统所有**作品名、文案、内容、配色、字体、布局细节、模型形态**均为原创，**不冒充**参考站作者或其项目。
- 字体不取自参考站：全部来自本项目内已 vendored 的 **SIL OFL 1.1** 字体（见 `fonts/FONT-MANIFEST.json`）。
