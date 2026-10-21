# CHROMA S1 · 千色仪

**把颜色，量出来。**

一页式虚构产品发布站：CHROMA S1 是一台口袋级光谱色度仪。页面里的光谱曲线、峰值波长、
FWHM、ΔE<sub>00</sub>、SNR 全部是**实时算出来的**——用 CIE 1931 配色函数积分得到 XYZ，
再按 CIEDE2000 算色差；改任何一个滑块，读数立刻跟着变。

本作品是**对公开案例工艺水准的原创改编**，不是任何现有页面的复制品。
选案证据链见 [`../00-research/SOURCE.md`](../00-research/SOURCE.md)，
逐维度差异见 [`DIFF-vs-SOURCE.md`](DIFF-vs-SOURCE.md)。

> **与同级 `00-research/TOP3.md` 的关系**：并行任务 00-research 也为同一条参考案例
> （@nutlope 落地页）给了改编规格「NIMBUS·7 桌面气象站」；本作品是**另一套独立原创改编**，
> 未采用该规格，两者在七项强制维度上互不相同。分歧与理由见
> [`DIFF-vs-SOURCE.md` 第 6 节](DIFF-vs-SOURCE.md#6-与同级-00-researchtop3md-改编规格的关系)。

---

## 快速开始

```bash
npm ci          # 安装依赖（全部本地，无 CDN）
npm run dev     # 开发服务器 → http://127.0.0.1:4311
```

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器，**端口 4311**（`strictPort`，占用即报错） |
| `npm run build` | 类型检查 + 生产构建 → `dist/`（纯静态） |
| `npm run preview` | 本地预览构建产物，端口 4311 |
| `npm run typecheck` | 仅类型检查 |
| `npm run qa` | Playwright 驱动本机 Chrome 跑 **65 项**点击断言 + 出截图 |
| `npm run qa:headed` | 同上，但显示浏览器窗口 |
| `npm run qa:ds` | 设计系统接入验收（V.1–V.11 + G.1–G.7，21 项）→ `qa/ds-report.json` |
| `npm run qa:d1` | D1 文字压盖审计（与 13 同口径，多滚动位置）→ `qa/d1-final.json` |

> `npm run qa` 需要本机装有 Google Chrome（脚本用 `channel: 'chrome'`）。
> 未下载 Playwright 自带浏览器。

---

## 页面结构

| 区块 | 内容 | 关键交互 |
|---|---|---|
| **00 概览** | 标题、导语、四个关键指标、三维主视图 | 拖动旋转、双击复位、机身配色切换（石墨灰 / 沙岩色 / 冰蓝）、实时读数面板 |
| **数据带** | 10 项指标横向滚动 | 悬停暂停；随视口进度循环 |
| **01 光谱实验室** | 实时光谱图 + 控制台 | 目标波长 380–780 nm、增益 0.2–3.0×、积分时间 1–16 ms；三种测量模式（单次 / 连续扫描 / 白平衡校准） |
| **02 样本库** | 12 种真实表面，贴图程序化生成 | 点击任一块 → 仪器读数、光谱曲线、机身小屏同步变化；← → 方向键切换 |
| **03 规格矩阵** | 10 行指标 | 点行展开说明（可访问性：aria-expanded / aria-controls） |
| **04 拆解视图** | 6 个零件的爆炸图 | 「展开 / 合拢」按钮；悬停右侧条目高亮对应零件并自发光 |
| **05 常见问题** | 6 条问答 | 手风琴展开 |
| **06 预约** | 首批实测申请 | 表单本地校验 → 错误提示 → 提交中 → 成功态；**不发送任何数据** |
| **07 来源与许可** | 出处、模型归属原文、观测数字、资产许可 | 三组折叠项，首项默认展开（DS §6.2 要求来源必须在页面内可见） |
| 全局 | 左侧章节索引轨 | 滚动高亮当前章节、阅读进度条、点击跳转；移动端改为顶栏内的章节指示 chip |

---

## 色彩计算是真的

`src/color.ts` 是一套完整的小型色度引擎：

- **CIE 1931 2° 配色函数**：Wyman–Sloan–Shirley 多高斯解析拟合；
- **sRGB → XYZ → L\*a\*b\***：D65 白点，标准传递函数；
- **CIEDE2000**：完整公式（含 C′、h′、T、R<sub>t</sub> 修正项）；
- **光谱重建**：用 8 条窄带高斯反射谱做**主动集非负最小二乘**（NNLS）拟合目标色，
  保证「sRGB → 光谱 → XYZ」是精确可逆的。12 个样本色的往返误差量级为 1e-13 ΔE；
- **测量噪声**：按响应峰值的相对幅度建模（≈1.2%），随积分时间按 4/t 缩放，
  随增益改变信噪比——所以调滑块时 ΔE00 会真实地变好或变差。

`src/modules/spectrum.ts` 负责把这条管线画成图，并在图上标注峰值波长、FWHM、噪声底噪与扫描线。

---

## 目录结构

```
01-web/
├── index.html              页面结构
├── vite.config.ts          base:'./'（适配任意子路径）、4311 端口
├── src/
│   ├── main.ts             装配与事件接线
│   ├── content.ts          全部文案与数据（样本 / 规格 / FAQ / 指标带）
│   ├── color.ts            色度引擎（CMF / Lab / CIEDE2000 / NNLS 光谱重建）
│   ├── styles/
│   │   ├── tokens.css      语义别名层（--ds-* 取值只在 assets/ds/tokens.css 声明）
│   │   ├── base.css        重置、排版原子
│   │   ├── layout.css      外壳、索引轨、顶栏、区块栅格、响应式
│   │   └── components.css  按钮、面板、读数、滑块、表单、跑马灯
│   ├── three/
│   │   ├── device.ts       机身程序化建模 + 屏幕 CanvasTexture
│   │   └── stage.ts        场景、灯光、环境、轨道控制、爆炸动画
│   └── modules/
│       ├── spectrum.ts     光谱实验室画布
│       ├── samples.ts      样本贴图程序化绘制 + 样本库
│       ├── lists.ts        指标带 / 规格矩阵 / FAQ 渲染
│       ├── reveal.ts       滚动显现、数字滚动、索引轨滚动监听
│       ├── form.ts         表单本地校验
│       └── motion.ts       动效模式与时间轴可用性探测
├── public/assets/ds/       余晖设计系统资产（逐字节拷贝自 16-design-system）
│   ├── tokens.css          令牌层（--ds-* 唯一声明处）
│   ├── components.css      组件层（.ds-* 类）
│   └── fonts/              5 个 woff2 + fonts.css + OFL 许可全文 + FONT-MANIFEST.json
├── qa/verify.mjs           Playwright 点击验证脚本（65 项断言）
├── qa/ds-verify.mjs        设计系统接入验收（V.1–V.11 + G.1–G.7，21 项）
├── qa/d1-overlap.mjs       D1 文字压盖审计（与 13 同口径）
├── qa/lib/overlap-measure.mjs  压盖测量函数（与 13 同判定口径，共用）
├── qa/shot-fullpage.mjs    整页截图脚本（可复用给 13）
├── qa/overlap-audit.mjs    文字遮挡审计（真遮挡 / 可接受相邻的区分）
├── qa/overlap-report.json  最近一次遮挡审计结果
├── qa/report.json          最近一次验证报告
├── qa/ds-report.json       最近一次设计系统验收报告
├── screenshots/            13 张浏览器截图（含两张整页长图）
├── i18n/                   zh/en key 骨架（草案，未接线）
├── LICENSES.md             第三方资源与许可登记
├── RESTYLE-INVENTORY.md    改版待替换清单与落地映射
├── manifest.json           交付清单
├── DIFF-vs-SOURCE.md       与参考作品的逐维度差异
├── SOURCES.md              来源、素材许可、运行时网络声明
└── QA.md                   验收记录
```

---

## 设计系统（批次统一：余晖设计系统 / Afterglow DS）

自 2026-10-21 起，本作品接入 `16-design-system` 的统一视觉语言；
23:0x 起按 `16-design-system/MIGRATION-NOTES.md` 完成**接入三步**：

| 步 | 落地 |
|---|---|
| ① 令牌 / 组件层 | `public/assets/ds/tokens.css`、`public/assets/ds/components.css`（逐字节拷贝自 `16-design-system/src/`），由 `index.html` 的 `<link>` 引入 |
| ② 字体层 | `public/assets/ds/fonts/`（5 个 woff2 + `fonts.css` + 5 份 OFL-1.1 许可全文 + `FONT-MANIFEST.json`），`@font-face` 用相对 `url("./x.woff2")` → 任意子路径可用 |
| ③ 基准路径与外壳类 | 入口 `<style>` 注入 `--ds-base`；`<body class="ds-shell">`，顶栏 `ds-topbar`、页脚 `ds-footer`、跳转链 `ds-skip` |

> Vite 工程的静态目录是 `public/`，所以规范里的 `assets/ds/` 落在 `public/assets/ds/`；
> 发布产物路径是 `dist/assets/ds/**`，线上形如 `<作品路径>/assets/ds/**`（§6「发布前必查」的路径形状）。
> 令牌层在 `src/styles/tokens.css`：**只保留语义别名层**，`--ds-*` 取值仅在
> `public/assets/ds/tokens.css` 声明一次（MIGRATION-NOTES §0 风险 B / §2.6「整体替换，不是追加第二份」）。

本作品保留自己的语义别名并全部映射到 `--ds-*`：

| 本作品别名 | 映射到 | 用途 |
|---|---|---|
| `--ink-900 … --ink-700` | `--ds-bg` / `--ds-bg-raised` / `--ds-surface` | 纸面与块面底色 |
| `--paper … --paper-4` | `--ds-ink` / `--ds-ink-soft` / `--ds-ink-faint` | 文字三级 |
| `--line` / `--line-2` / `--line-hi` | `--ds-line` / `--ds-line-strong` | 发丝线 |
| `--signal` | `--ds-accent`（朱砂 `#b4432b`） | 主 CTA、交互态、选中 |
| `--pulse` | `--ds-jade`（`#2e6a5e`） | 数据、目标单色线 |
| `--iris` | `--ds-info`（`#2c5c8f`） | 峰值标记 |
| `--f-display` | `--ds-font-display`（Space Grotesk） | 标题与数值 |
| `--f-body` | `--ds-font-text`（Inter + 系统中文栈） | 正文 |
| `--f-mono` | `--ds-font-mono`（Space Mono） | 标签、读数、刻度 |

页面使用 DS **浅色主题**（`data-ds-theme="light"`），三维视口按 DS §9.1 使用
`--ds-bg-sunken` 画布底 + `--ds-canvas-*` 深色 HUD，保证 HUD 与读数在任何画面上可读。

统一落地的结构件：封面（居中单栏：眉标 → 标题 → 导语 → 动作组 → 媒体）、
顶栏（`color-mix` + blur、移动端导航横向可滚动）、
按钮族（胶囊圆角 / 44·32·48px / `scale(.985)` active）、
表单（44px 最小高、focus = accent 边框 + 3px accent-soft 外环）、
画布容器（`contain: paint` + `isolation: isolate`）。
逐项映射与偏差见 [`RESTYLE-INVENTORY.md`](RESTYLE-INVENTORY.md) 与 [`STATUS.md`](STATUS.md) §4 与 §6。

字体全部自托管（OFL-1.1，实体文件随 `16-design-system/fonts` 一并复制，许可全文随产物发布），
见 [`LICENSES.md`](LICENSES.md)。中文字体栈按 DS §5.3 排序：系统 CJK 栈在前、
覆盖有限的 `Noto Sans SC` 子集在后（本作品不引用该子集）。

### 设计系统接入验收

```bash
npm run qa:ds     # V.1–V.11 + G.1–G.7 → qa/ds-report.json
```

机械判定：四档视口（1440/1280/768/390）零横向溢出、正文对比度 ≥4.5、
焦点环可见且 Tab 序列不被吞、触摸目标 24/44 两档、reduced-motion 降级、
运行期零外部请求、字体本地加载、**129 个 `--ds-*` 运行期实际值与 16 令牌层逐名逐值一致**、
中文字体栈顺序正确。

---

## 动效与可访问性

- **动效模式**：`?motion=on`（默认）/ `?motion=off`（静态）。
  系统开启「减少动态效果」时自动落到 `off`。
  `off` 模式下所有元素直接呈现终态，**任何环境下内容都不会被动画卡住**。
- 内容默认可见，入场动画只在时间轴确实推进时才播（`src/modules/motion.ts` 探测）。
- 所有折叠控件带 `aria-expanded` / `aria-controls`；跳转链接有 `aria-label`；
  样本卡是真正的 `<button>`；表单错误用 `role="status"` 播报。
- 支持键盘：Tab 聚焦可见焦点环，← → 切换样本。

---

## 响应式

| 断点 | 变化 |
|---|---|
| ≥ 1181 px | 左侧索引轨常驻，概览双栏，拆解视图双栏 |
| 1090 – 1180 px | 拆解视图改单栏 |
| 861 – 1089 px | 隐藏索引轨，概览改单栏，光谱实验室改单栏 |
| 621 – 860 px | 顶栏导航改横向可滚动，顶栏内显示章节指示 chip，规格矩阵改两列排布 |
| ≤ 620 px | 指标改 2×2，按钮整行，样本库三列 |

实测 390 px 与 834 px 下 `scrollWidth - clientWidth = 0`，无横向溢出。

---

## 构建产物

```bash
npm run build
# → dist/index.html
#   dist/assets/index-*.js     (~57 kB, gzip ~20 kB)
#   dist/assets/index-*.css    (~30 kB, gzip ~7 kB)
#   dist/assets/three-*.js     (~553 kB, gzip ~141 kB)
#   dist/assets/*.woff2        (拉丁字体子集)
```

全部相对路径引用，**可直接放到任意子路径**（如 GitHub Pages 项目站）下工作。
运行时**零外部请求**：无 CDN、无外部 API、无远程字体或图片。

---

## 整页截图做法（可复用片段）

> 供 `13-qa-curation` 复用做整页目视复核。本目录已内置脚本：
> `qa/shot-fullpage.mjs`（Playwright 驱动**本机 Chrome**，`channel: 'chrome'`，不下载 Playwright 自带浏览器）。

### 一条命令

```bash
# 先起一个临时静态服务（验证完即关）
npx vite preview --port 4311 --strictPort &

# 整页截图（默认 1440×900 @2x，?motion=off 保证内容落到终态）
node qa/shot-fullpage.mjs --out=screenshots/11-full-page.png

# 移动端整页
node qa/shot-fullpage.mjs --w=390 --h=844 --dpr=2 --out=screenshots/mobile-full-page.png

# 关掉临时服务
lsof -ti tcp:4311 | xargs kill
```

### 最小可复用片段（脱离本项目也能用）

```js
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

// ① 用 ?motion=off 进入：入场/滚动显现动画直接落到终态，
//    否则整页截图会把还没播放到的区块截成空白
await page.goto('http://127.0.0.1:4311/?motion=off', { waitUntil: 'load' });

// ② 等自托管字体加载完（否则文字宽度与换行会偏）
await page.evaluate(() => document.fonts.ready);

// ③ 逐屏滚动一遍，触发懒渲染（图表、三维画布、滚动显现），再回顶部
await page.evaluate(async () => {
  const step = Math.round(window.innerHeight * 0.8);
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
  await new Promise((r) => setTimeout(r, 400));
});
await page.waitForTimeout(500);

// ④ 整页截图
await page.screenshot({ path: 'full-page.png', fullPage: true });
await browser.close();
```

### 三个容易踩的坑

| 坑 | 表现 | 处理 |
|---|---|---|
| **动画未播完就截图** | 整页图里下半页是空白（内容停在 `opacity: 0` 的起始态） | 用 `?motion=off` 进入；或等 `motion.ts` 的时间轴探测通过后再截 |
| **固定层（粘性顶栏）重复或错位** | Chrome 的 `fullPage` 会把 `position: fixed` 元素只画一次，且画在**当前视口位置** | 复核遮挡时**不要**用整页图判固定层；改用逐屏截图（`fullPage: false` + 滚动）。移动端章节指示已不是固定层，在整页图里可见 |
| **字体未加载完成** | 文字宽度偏窄、换行位置不对，看起来像"文字压住了" | `await page.evaluate(() => document.fonts.ready)` |

### 配套的遮挡审计脚本

两个脚本，口径不同，各管一段：

**① `qa/d1-overlap.mjs` —— 与 13-qa-curation 的 D1 同判定口径（推荐用于对外报数）**

```bash
node qa/d1-overlap.mjs                        # 多滚动位置采样（比 13 更严），输出归档 qa/d1-final.json
node qa/d1-overlap.mjs --scroll-only=0        # 复刻 13 的测量位置（页面加载后滚动位置 0）
```

判定口径（与 `13-qa-curation/qa-harness/lib/checks.mjs` 的 `checkOverlaps` 对齐）：

1. 候选 = 自身**直接**含文字、宽 ≥12px、高 ≥8px、非 `position: fixed`、非占满 35% 视口的全幅图层；
2. 文字盒 = 文字节点的 `Range.getClientRects()`（**真实字形行盒**），
   并按祖先 `overflow:hidden|clip` 的盒子裁剪（被裁掉的行不算绘制）；
3. 命中 = 两元素字形行盒交集 > 4px²，且交集占较小者绘制面积 ≥ 50%（`--ratio` 可调）。

测量函数抽在 `qa/lib/overlap-measure.mjs`，`qa/verify.mjs` 与本脚本共用，不会出现两处实现漂移。
报告会另列一类「固定外壳层（顶栏 / 导航轨）压滚动内容」：这是 DS §4.2 规定的粘性顶栏的既定行为，
被盖住的正文不构成两段文字互相压盖，单独归类、不计入压盖数。

**② `qa/overlap-audit.mjs` —— 元素盒层面的审计（含命中点判定）**

```bash
node qa/overlap-audit.mjs --ratio=0.25
```

它做两件事：

1. **文档坐标重叠**：把 `getBoundingClientRect()` 换算到文档坐标再比对，与滚动位置无关 →
   两者都有可见文字且相交面积 ≥ 阈值，判为**真遮挡**；
2. **视口坐标重叠**：逐屏滚动比对，但**排除"固定层 vs 滚动内容"**（顶栏/HUD 本来就要盖住内容，不是缺陷），
   只在「两者都是普通内容」或「两者都是固定层」时判定。

> ⚠️ 判断"固定层"必须看**祖先链**：`position: fixed` 的顶栏，其子元素 `position` 是 `static`。
> 只看元素自身的 `position` 会把"顶栏文字与滚动内容相交"全部误报成遮挡——
> 这正是外部检测器里大量假阳性的来源。

> 📌 本轮（2026-10-21 22:40）按派单把折叠面板、移动端章节指示、画布操作提示三处
> 都改成「正常文档流内依次排列」，不再用 `overflow:hidden` / `transform` / `z-index` 掩盖。
> 修前 → 修后：13 的测量位置 mobile **1 → 0**；多滚动位置采样 desktop **8 → 0**、mobile **41 → 0**。
> 详见 `STATUS.md` §5、`QA.md` §7。

---

## 相关文档

- [`TASK.md`](TASK.md) —— 任务口径与验收清单
- [`STATUS.md`](STATUS.md) —— 执行状态、决策记录、已知限制
- [`QA.md`](QA.md) —— 验收记录、断言结果、缺陷与修复、截图索引
- [`CHANGELOG.md`](CHANGELOG.md) —— 变更记录
- [`DIFF-vs-SOURCE.md`](DIFF-vs-SOURCE.md) —— 与参考作品的逐维度差异
- [`SOURCES.md`](SOURCES.md) —— 来源、素材许可、网络声明
- [`../00-research/SOURCE.md`](../00-research/SOURCE.md) —— 选案证据链
