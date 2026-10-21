# 回响电玩馆 · PLAYTIME ATLAS

> 一座关于电子游戏时间的**原创**可漫游博物馆主站。
> 十个年代门沿时间长廊排开，硬件与作品各安其位；可检索、可筛选、可收藏，
> 每件展品都附可点开核对的来源，同年代还接着一个可直接试玩的展厅。

- 任务编号：`06-museum-core`
- 本地端口：**4326**（`npm run dev` / `npm run preview`）
- 构建产物：`dist/`（`base: './'`，可直接作为 Pages 根或任意子路径）
- 上线：**由 14-publish 统一部署**；本任务只交付可静态构建的产物，不做 git 操作

**当前验收状态**（在 `/playtime-atlas-20261021/works/06-museum-main/` 子路径下实测）：
单元测试 **58/58** · 子路径自验 **41/41** · 全流程验收 **56/56** ·
检索探针 **9/9** · 压盖探针 **8 路由 × 2 视口全 0** ·
令牌 **130/130 一致** · 控制台错误 **0** · 失败请求 **0** ·
390×844 下 7 条路由横向溢出均为 **0px**。
细节见 [`STATUS.md`](STATUS.md)、[`ACCEPTANCE.md`](ACCEPTANCE.md)、[`SUBPATH-VERIFY.md`](SUBPATH-VERIFY.md)。

---

## 快速开始

```bash
npm install
npm run dev        # 开发模式，http://127.0.0.1:4326
npm run build      # 构建到 dist/（自动执行 art + sync 两个前置步骤）
npm run preview    # 预览构建产物，http://127.0.0.1:4326
npm test           # 单元测试（58 例）
npm run verify:catalog   # 校验策展目录结构 + 逐条核对来源条目可解析
```

### 其他脚本

| 脚本 | 作用 |
|---|---|
| `npm run acceptance -- [baseUrl]` | 用 Playwright 实际打开站点走完主要动线，产出 `ACCEPTANCE.md` 与 `screenshots/` |
| `npm run verify:subpath -- [baseUrl]` | 子路径部署定点自验（字体 200、390px 溢出、检索收敛、无 404） |
| `npm run overflow -- [baseUrl] [width]` | 定位造成横向溢出的元素 |
| `npm run check:tokens` | 令牌一致性静态校验（取值 / 命名空间 / 别名层指向） |
| `npm run check:tokens:runtime -- [baseUrl]` | 令牌一致性运行期校验（隔离 iframe 解析 DS 基准，逐名比对） |
| `npm run serve:subpath -- --root <dist> --port 4333 --mount <前缀>` | 零依赖静态服务器，用于子路径验收 |
| `node scripts/generate-art.mjs` | 重新生成原创 SVG 美术包与字体样式表 |
| `node scripts/sync-exhibits.mjs [--clean]` | 同步 05 / 07 / 08–12 的产物到 `public/` |
| `node scripts/check-dist.mjs` | 产物体积守卫（`postbuild` 自动执行） |
| `node scripts/overlap-probe.mjs -- [baseUrl] [width] [route]` | D1 文字压盖探针（裁剪感知 + 行片段口径） |
| `node scripts/search-probe.mjs -- [baseUrl]` | 搜索过滤实测：三个输入入口 × 存在/不存在关键词，并报出过滤发生在哪一层 |
| `node scripts/probe-svg-var.mjs` | 探针：SVG 表现属性里的 `var()` 在浏览器中是否生效 |
| `node scripts/probe-hall-strip.mjs -- [baseUrl]` | 探针：展厅卡片身份色发丝条是否按各厅身份色渲染 |
| `/Users/mekzenx2/.local/bin/ego-browser nodejs < scripts/ego-verify-local.mjs` | Ego 浏览器核验（本地构建）：检索即时性、卡片压盖、字体加载 |
| `/Users/mekzenx2/.local/bin/ego-browser nodejs < scripts/ego-fullpage-shots.mjs` | Ego 浏览器整页截图（交付到 `screenshots/ego/`） |

> **子路径验收怎么跑**（本仓库实测用的就是这套命令）：
> ```bash
> npm run build
> npm run serve:subpath -- --root "$PWD/dist" --port 4333 \
>   --mount /playtime-atlas-20261021/works/06-museum-main &
> npm run verify:subpath -- http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/
> npm run acceptance    -- http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/
> npm run overflow      -- http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/ 390
> ```
> 不要用 `python3 -m http.server`：它的监听 backlog 只有 5，Chromium 对同一源并发
> 6 条连接，本馆首页一次要取上百个资源，backlog 打满后会出现偶发的 30s 超时。
> 验收完记得关掉临时服务器（`pkill -f serve-subpath.mjs`）。
>
> **base URL 必须带尾斜杠**。站内资源全部走相对路径，浏览器把相对路径锚定在**目录**上：
> `…/06-museum-main/` → 资源落在 `…/06-museum-main/assets/…`；
> `…/06-museum-main`（无尾斜杠）→ 资源落在 `…/assets/…`，全部 404。
> GitHub Pages 对目录型 URL 会 301 到带斜杠版本，`serve-subpath.mjs` 也已实现同样的 301，
> 所以线上永远拿到带斜杠的地址。三个验收脚本都会主动归一化 base URL。

## 目录结构

```
06-museum-core/
├── TASK.md / STATUS.md          任务书与进度记录
├── README.md                    本文件
├── RESTYLE-PREP.md              改版准备清单（待替换清单）
├── ACCEPTANCE.md                验收记录（由 acceptance.mjs 生成）
├── SUBPATH-VERIFY.md            子路径自验记录（由 verify-subpath.mjs 生成）
├── SOURCES.md / LICENSES.md     来源清单与素材许可
├── manifest.json                交付清单（供 14-publish 读取）
├── index.html                   应用外壳
├── package.json / vite.config.js
├── scripts/
│   ├── generate-art.mjs         原创 SVG 美术包 + 字体样式表
│   ├── sync-exhibits.mjs        兄弟任务同步（只复制，不改源目录）
│   ├── verify-catalog.mjs       目录结构与来源可解析性校验
│   ├── acceptance.mjs           端到端验收（分步执行，崩溃自动重试）
│   ├── verify-subpath.mjs       子路径定点自验
│   ├── overflow-probe.mjs       横向溢出定位
│   ├── check-tokens.mjs         令牌一致性静态校验（V.3 / V.4）
│   ├── check-tokens-runtime.mjs 令牌一致性运行期校验（隔离 iframe 比对）
│   ├── check-dist.mjs           产物体积守卫（postbuild）
│   ├── probe-svg-var.mjs        SVG 表现属性 var() 生效性探针
│   ├── serve-subpath.mjs        子路径验收用零依赖静态服务器
│   ├── test.mjs                 单元测试
│   └── lib/net.mjs              构建期网络工具（代理感知 + 限流退避）
├── src/
│   ├── main.js  app.js          入口与主控（路由、渲染、事件委托）
│   ├── i18n.js                  zh/en 双语字典与切换（detectLang/setLang/applyStatic）
│   ├── assets/fonts.css         自托管 @font-face 清单（OFL-1.1）
│   ├── core/                    format / router / store
│   ├── data/                    eras / catalog.local / loader / exhibits.config
│   ├── modules/                 search / components / silhouette / theme / hall3d
│   ├── modules/views/           home / timeline / era / catalog / exhibit / collection / hall / about
│   └── styles/                  tokens / base / layout / components / hall
└── public/
    ├── art/                     馆徽、年代海报与底纹、载体轮廓、07 字体包（只取 fonts/）
    ├── data/                    catalog.json / design-tokens.json / exhibits.json
    └── exhibits/                08–12 可玩展厅包体（只读复制）
```

## 功能

| 路由 | 页面 | 说明 |
|---|---|---|
| `#/` | 馆前广场 | 馆方介绍、年代门速览、推荐展品、可玩展厅一览 |
| `#/timeline` | 时间长廊 | 10 道年代门（←/→ 键盘移动）+ 纵向时间轴与年代展品 |
| `#/era/:id` | 年代展厅 | 年代叙述 + 作品/硬件/平台分柜 + 同年代可玩展厅 + 上下翻页 |
| `#/catalog` | 2D 无障碍目录 | 全文检索 + 年代/类别/平台筛选 + 排序 + 网格/列表，状态同步 URL |
| `#/exhibit/:id` | 展品详情 | 展签、叙述、史实意义、逐条来源、许可说明、同展厅推荐 |
| `#/collection` | 我的收藏 | 本地收藏列表、清空与导出 JSON |
| `#/hall` | 3D 展厅（可选） | 可漫游长廊，程序化原创硬件体块，射线拾取；无 WebGL 时降级 |
| `#/hall/:id` | 可玩展厅 | 已并入则内嵌实际内容，未并入显示明确的「待集成」占位 |

## 与兄弟任务的接口

| 来源 | 接入方式 | 状态 |
|---|---|---|
| `05-museum-research` | `catalog.json` → `public/data/catalog.json`，运行时优先级最高 | ✅ 已接入 |
| `07-museum-art` | **只取 `fonts/`**（5 个 OFL woff2 + 许可全文）→ `public/art/assets/fonts/`，静态 `<link>` 引入；`design-tokens.json` 仅用于说明页标注来源，**不注入 CSS 变量** | ✅ 已接入 |
| `16-design-system` | 设计令牌与字体清单（**只读引用，不复制文件**）→ 落地在 `src/styles/tokens.css`，130 个令牌逐名核验一致 | ✅ 已接入 |
| `08-era-origins` | `public/exhibits/origins/` | ✅ 已并入 |
| `09-era-arcade` | `public/exhibits/arcade/` | ✅ 已并入 |
| `10-era-console` | `public/exhibits/console/` | ✅ 已并入 |
| `11-era-online` | `public/exhibits/online/` | ✅ 已并入 |
| `12-era-modern` | `public/exhibits/modern/` | ✅ 已并入 |

**同步规则**（`scripts/sync-exhibits.mjs`）：

- 只**复制**、绝不修改源目录；
- 包体必须通过部署性检查（存在 `index.html`、不引用源码目录、不是占位页、静态资源齐全）才会并入；
- 上游尚未构建时，在**本任务目录内的临时副本**中代为构建，不写入源目录；
- 不合格或缺失的展项标记 `pending`，主站渲染**明确的待集成占位**，绝不渲染假入口；
- 每次同步生成 `public/data/exhibits.json` 供主站读取。

**策展目录合并规则**（`src/data/loader.js`）：

1. 外部目录（05）优先；
2. 本地初版只补充外部未收录的条目；
3. 按**来源条目**去重——同一件作品在两份目录中 id 不同但指向同一来源，用它做主键可避免重复陈列；
4. 外部目录的年代命名（`origins / arcade / home8bit / console16 / online / mobile / modern`）
   按「年份落区 + 年代亲和度」解析到本馆的十个年代。

## 设计系统

本馆遵循 `16-design-system`（余晖设计系统）。**只读引用，不复制文件**：
取自 `design-tokens.json` 与 `src/tokens.css`，落地在本目录自己的 `src/styles/tokens.css`。

| 项 | 落地方式 |
|---|---|
| 主题 | **深色主题**（`<html data-ds-theme="dark">`，博物馆夜景）。实测 `--ds-accent #e0684a`、`--ds-bg #100f0e`、`--ds-rail-width 132px` |
| 令牌层 | `src/styles/tokens.css`：130 个 `--ds-*` 令牌 + **67 条语义别名**（`--ink`/`--bg`/`--accent`… 全部 `var()` 指向 `--ds-*`） |
| 落地策略 | **旧变量重定向**，不逐行重写既有 CSS、不删除既有类名；`.ds-*` 与原类名并存 |
| 命名空间 | 07 的 `design-tokens.json` **不再注入 CSS 变量**（`theme.js` 改为只探测不注入），避免「同名变量后加载者胜」把新令牌覆盖回旧色板 |
| 一致性校验 | `npm run check:tokens`（静态）+ `npm run check:tokens:runtime`（运行期）→ **130 个令牌 0 不一致** |
| 字体 | 5 个 woff2 自托管，与 `16/fonts/FONT-MANIFEST.json` **逐字节同源**；族名与 `--ds-font-display/text/mono` 一致；无 CDN |
| 双语 | `src/i18n.js`（zh/en 约 90 key）；`html[lang]` 正确、顶栏「中 / EN」可切、`localStorage` 记忆、`?lang=en` 覆盖、hreflang 交替 |
| 动效 | 位移 + 透明度 + 微模糊三件套；`scroll-behavior:smooth` 仅在 `prefers-reduced-motion:no-preference` 下开启；reduced-motion 下时长归 1ms、位移与模糊归零 |
| 字体加载 | `font-display: swap`，避免 FOIT 阻塞首屏 |

**年代/展厅身份色例外（登记在案）**：DS §1.1 要求「全站只有一个强调色」，
本馆保留 10 个年代色与 5 个展厅色，但**严格限定**在身份标识上——
编号文字、柜体描边、时间轴节点、3px 灯条；
**CTA / 链接 / 焦点环 / 选中态 / hover 一律 `--ds-accent`**。
理由与边界见 `RESTYLE-PREP.md` §3.1.1 与 `STATUS.md` §6.2。

## 给其它展厅作者的嵌入约定

本馆**只提供统一的外壳约定，不改动任何其它展厅目录**。
08—12 的可玩展厅通过 iframe 嵌入，外壳负责容器、导航与尺寸：

```html
<div class="embed-wrap">
  <iframe class="embed-frame" src="./exhibits/<dir>/index.html" title="…"></iframe>
</div>
```

| 约定 | 取值 | 说明 |
|---|---|---|
| 外框 `.embed-wrap` | 等价 `.ds-canvas-frame` | 1px `--ds-line` 描边 + `--ds-radius-media` 圆角 + `contain:paint` + `isolation:isolate` |
| 内框 `.embed-frame` | 宽 `100%`，高 `clamp(420px, 70vh, 760px)` | 统一尺寸，便于横向对齐 |
| 资源路径 | 相对 `./exhibits/<dir>/<entry>` | 相对路径才能在任意子路径下自适应 |
| 嵌入内容自身配色与玩法 | **由各作者负责** | 沉浸作品的画布色板不在统一范围（MIGRATION-NOTES 风险 C） |

本目录给出的样式实现在 `src/styles/hall.css`，已写明上述约定与注释，
供 08—12 在自己的目录里参照实现（本任务不写入它们的目录）。

## 整页截图做法（供 13-qa-curation 全批复用）

视口截图只看得到首屏，验收要看的「首屏以下」（211 条目录往下翻、整条年代时间轴、
馆方说明长文）全在视口之外。本批所有目录都缺整页截图，是**共性缺口**。
本目录的做法如下，可直接搬进 `13-qa-curation/qa-harness`。

```js
// 1) 先量页面有多高 —— 这一步不能省
const h = await page.evaluate(() => Math.max(
  document.documentElement.scrollHeight,
  document.body ? document.body.scrollHeight : 0,
));

// 2) 超阈值就**如实记录「未完成」并跳过**，不要假装截到了
//    Chromium 贴图上限约 16384px：本馆目录页在 390px 下高达 4 万多像素，
//    硬截会失败或被裁。低于阈值才截。
if (h > 15000) {
  notes.push(`整页截图未完成：页面高 ${h}px 超过上限`);
} else {
  await page.screenshot({
    path: fullPath,
    fullPage: true,            // 整页，不是视口
    animations: 'disabled',    // 冻结动画，否则会拍到入场动画的中间态
    timeout: 60000,            // 长页要单独放宽超时
  });
}
```

本目录的落地位置：`scripts/acceptance.mjs` 的 `shotFull()`，
产物在 `screenshots/full/`，验收记录 `ACCEPTANCE.md` 的「整页截图」小节
会同时列出**成功的**和**未完成的**（未完成的写明原因与页面高度）。

两个坑：

1. **页面可能太长**——见上面的高度守卫。目录页在 390px 下约 47,000px，
   超上限时应当跳过并记录，而不是截一张被裁掉的图。
2. **动画要冻结**——本馆有 `.ds-in` 入场动效（位移 + 透明度 + 微模糊）。
   不冻结的话，整页截图会拍到元素处于「已偏移但未显现」的中间态，
   看起来像错位。

## 文字压盖检测口径（供 13-qa-curation 全批复用）

「文字互相压盖」必须按**画出来的范围**判定，不是按**内容延伸范围**。
本目录实测踩过三个坑，都会产生「压盖 100%」的假阳性：

| 坑 | 现象 | 正确口径 |
|---|---|---|
| 用 `scrollWidth`/`scrollHeight` | 元素用 `-webkit-line-clamp` / `text-overflow:ellipsis` 时，溢出部分**被裁掉、根本没画出来**，但 `scroll*` 照样报出溢出范围 | 用**可见盒**（`getBoundingClientRect`）并沿祖先链做 `overflow` 裁剪求交 |
| 用行内元素的**外接矩形** | 行内元素换行后，外接矩形把下一行的内容也框进来（页脚 `strong` × `span.muted` 被报成 94%） | 用 `getClientRects()` 的**逐行片段**逐片比，不要用外接矩形 |
| 忽略 `overflow:auto` 滚动盒 | 被滚出可视区的元素仍返回完整布局矩形（本馆 189 项平台筛选装在 160px 滚动盒里，不裁剪会报几百对） | 对每个 `overflow != visible` 的祖先做裁剪求交 |

本目录的落地：`scripts/overlap-probe.mjs`（裁剪感知 + 逐行片段），
以及验收脚本里的「卡片三块无文字压盖」断言。

> 补充：本馆卡片是**摘要 → 作者 → 收藏**的纵向流，
> `.card-summary` 与 `.card-creator` 之间有 `.card-foot` 的分隔线，
> 逐像素截图（`screenshots/card-check/`）可复核。

## 浏览器约定：Ego 是唯一浏览器入口

本任务的**所有**网站访问、检索、登录、截图、网页调试与线上验收，
一律走 `/Users/mekzenx2/.local/bin/ego-browser`，不另起 Playwright/Chromium 替代路径。

```bash
# 先读技能说明（v2.1.0）
/Users/mekzenx2/.local/bin/ego-browser skill

# 以 nodejs 模式执行一段脚本（沙箱拦 heredoc 时改用 -e）
/Users/mekzenx2/.local/bin/ego-browser nodejs < scripts/ego-verify-local.mjs
```

| 约定 | 说明 |
|---|---|
| 目标复用 | 每个目标复用一个 TaskSpace，保留用户标签页与登录状态，**不清 cookies** |
| 线上核验 | TaskSpace `38`（`06-museum-core online verify 20261022`） |
| 本地核验 | TaskSpace `41`（`06-museum-core local verify 20261022`） |
| 交付截图 | `screenshots/ego/`（4 张整页 + 1 张视口） |

**线上与本地的对照结论**（Ego 实测）：

| 项 | 线上（已发布旧包） | 本地（新构建） |
|---|---|---|
| `art/assets/fonts/fonts.css` | 200（1545 B，旧版） | 200（1730 B，已修） |
| 5 个 woff2 | 全 200 | 全 200 |
| 卡片三块压盖 | **0 px²** | **0 px²** |
| 检索「填完立刻读」 | **读到上一档结果**（仍有 220ms 去抖） | 不存在词 → **0 条 + 空态**；「掌机」→ **10**；清空 → **211** |

> 上表前两行里，fonts.css 与检索行为的差异都是**旧包未更新**所致，
> 本地源码已修；重新发布后线上将与本地一致。

> ⚠️ 目录下的 `scripts/acceptance.mjs` / `verify-subpath.mjs` / `overlap-probe.mjs` 等
> 是**交付给 13-qa-curation 复用的自动化回归套件**（13 的 harness 同为 Playwright 体系），
> 不是交互式浏览入口；日常核验与截图仍按上面的 Ego 约定执行。

---

## 设计与实现要点

- **视觉**：设计系统深色主题（墨色阶 + 唯一朱砂强调色 `--ds-accent`）；年代/展厅身份色仅作分类标识。
- **字体**：Inter / Space Grotesk / Space Mono / Noto Sans SC，均为 OFL-1.1，**完全自托管**，运行期无外部字体请求。
- **3D 展厅**：three.js 按需加载；柜中体块用基础几何体现场拼装，**是原创简化造型**，不复刻任何真实产品外形与商标。
  为避免在软件渲染 / 低端设备上把页面压死，场景只挂 **3 盏灯**（年代强调色用自发光材质表达）、
  同色材质共享实例、渲染循环限帧且在画布不可见 / 标签页隐藏时**完全停机**，
  离开页面时 `forceContextLoss()` 真正释放 WebGL 上下文。
  按 TASK.md 的 F9，3D 展厅是**独立路由 `#/hall`**；`#/hall/:id` 只做嵌入，不再叠加实时 3D 画布。
- **无障碍**：跳转链接、语义化目录、`aria-live` 结果播报、焦点可见、路由切换后移动焦点、抽屉 Esc 关闭、触控目标 ≥ 32px、尊重 `prefers-reduced-motion`。
- **离线**：无后端、无 API、无外部请求；唯一外链是展品来源（供核对）。
- **体积**：产物 **4.75 MB / 123 文件**，`postbuild` 守卫拦截 >30 MB / 单文件 >6 MB / 单目录 >12 MB 或垃圾目录。

## 已知限制

1. 馆藏是**代表性样本**，覆盖 1950s→2020s 十个年代，但不宣称穷尽全部作品。
2. 五个可玩展厅已全部并入；同步脚本对上游包体缺失的兜底是标记 `pending` 并渲染明确的「待集成」占位（不渲染假入口），本轮未触发该分支。
3. 3D 展厅面向桌面浏览器；触屏设备给出降级提示并引导至 2D 目录。
4. VR 相关展项在本馆仅为桌面交互演示，不代表对头显设备的支持。
5. 收藏与参观足迹只存在本机浏览器（localStorage），不跨设备同步，也不上报。
6. `npm run verify:catalog` 需要能访问公开百科 API；网络不可达时会明确报告「未完成校验」并以非零码退出，**不会谎称已通过**。
7. **双语只覆盖外壳文案**；211 件展品与年代叙述**未英译**，英文界面下展品正文仍为中文。
8. **年代/展厅身份色是登记在案的偏离**，不是「完全统一」（见「设计系统」一节）。
9. **构建顺序依赖**：`dist/exhibits/*` 来自 `../08…12/dist`，需在 08—12 产物就绪后再构建本目录。
10. **关键词检索是「输入即过滤」**：211 条的「过滤 + 重绘」实测最坏 6.1ms，
    因此不做去抖——填完立刻读计数器就是新值（早期版本有 220ms 去抖，
    会让自动化检测读到旧值而误判「搜索没生效」）。中文输入法组字期间不重绘，组字结束补刷。
11. **线上仍是旧包**：已发布版本仍带 220ms 去抖、`fonts.css` 仍是 1545 B 的旧版；
    本地源码均已修（检索改为输入即过滤、`fonts.css` 1730 B），
    **待 14-publish 重新部署后线上才会一致**。Ego 线上实测已记录在「浏览器约定」一节。
12. **目录页的整页截图未完成**：390px 下页面高 47737px，超出 Chromium 贴图上限，
    验收记录如实标注「未完成」而非截一张被裁的图（见「整页截图做法」）。

## 拷贝产物判定（`public/data/tokens.css` 与 `public/exhibits/**`）

监工问询的 12 个文件——`public/data/tokens.css` 与
`public/exhibits/{arcade,console,modern,origins}/**`——**全部是构建/同步产物，不是手工拷贝的静态资源**：

| 文件 | 来源链 | 复核结论 |
|---|---|---|
| `public/data/tokens.css` | 16-design-system → 07 的 `sync-ds-tokens.mjs` → 07 的 `build-tokens.mjs` → `07-museum-art/public/assets/tokens.css` → 本目录 `scripts/sync-exhibits.mjs` 拷贝 | 与 16 的深色主题块取值**逐名一致**（129 个 `--ds-*`，0 差异） |
| `public/exhibits/{arcade,console,modern,origins}/**` | `../08…12/dist` → 本目录 `scripts/sync-exhibits.mjs` 拷贝 | 五个展厅与源 `dist` **逐字节一致**（`diff -rq` 全过） |

本目录**未手改其中任何一个文件**。要改就回到 16 / 07 / 08—12 的源头，
再重跑 `npm run build`（`prebuild` 自动重新拷贝）。诊断脚本：
`node scripts/diag-tokens-provenance.mjs`。

## 给 14-publish 的构建说明

```bash
cd 06-museum-core
npm install
npm run build        # 产物：dist/
```

- 入口：`dist/index.html`；基址为相对路径，**可放在仓库任意子路径**
  （已实测 `/playtime-atlas-20261021/works/06-museum-main/`）。
- **构建顺序**：`npm run build` 的 `prebuild` 会从 `../08…12/dist` 拷贝 5 个可玩展厅，
  请在 08—12 产物就绪后再构建本目录，否则 `dist/exhibits/*` 会是旧版。
- 需要一并发布的数据文件：`dist/data/catalog.json`、`dist/data/exhibits.json`、`dist/data/design-tokens.json`。
- 可玩展厅包体位于 `dist/exhibits/<dir>/`，由主站以相对路径 iframe 嵌入。
- 字体随产物发布在 `dist/art/assets/fonts/`（5 个 woff2 + OFL 许可全文），**无 CDN**。
- 集成清单见 `manifest.json` 与 `dist/data/exhibits.json`。
- 本任务未创建仓库、未提交、未推送；发布动作由 14-publish 统一执行。
