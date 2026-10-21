# STATUS.md · 00-research

**最后更新**：2026-10-22 00:16（Asia/Taipei）
**执行模型**：MiniMax Code · MiniMax-M3.1-Flash · effort=max
**状态**：✅ 研究任务范围内全部完成；✅ **改版第 1 步完成**（准备 + 4 个缺陷修复）；✅ **改版第 2 步完成**（增量接入 16「余晖设计系统」）；✅ **字体栈顺序缺陷已修**（22:4x 监工派单）；✅ **发布包已交付**（00:1x 交 14-publish，包级自检 12 项 + 发布包浏览器验收 32 项全绿）→ ⏸ 待 13 验收（第 3 步）与 14 统一提交上线（第 4 步）

---

## 一句话

MiniMax M3.1 Flash 全球公开案例库已建成：**134 条**案例、6 个平台有可核验数据、**1 个平台（小红书）为登录墙已如实记录**；TOP3 三个案例（网页 / 3D / 交互）证据充分，且已转为**原创改编规格**（改名·文案·字体·配色·布局·模型形态全改），配套对照差异说明、CHANGELOG、构建命令与 manifest.json。

**改版第 2 步（本轮）**：已按 `16-design-system/MIGRATION-NOTES.md` §1「接入四步」把页面**增量**接入余晖设计系统 —— 落地 `assets/ds/`（tokens / components / 5 个 OFL 字体，共 492 KiB）、`<body class="ds-shell">`、`.ds-topbar` / `.ds-footer` / `.ds-skip`、`:root` 13 个语义别名重定向到 `--ds-*`、25 处硬编码 `rgba()` 全部改写为 `color-mix()` + 令牌；补齐中文负字距复位（3 处）、标题 `nowrap` 禁令、焦点环兜底、`LICENSES.md`。自检 **74 → 108** 项全绿；四档视口浏览器验收 **62 项全绿**（1440 / 1280 / 768 / 390：无横向溢出、正文对比度最低 4.81:1、D1 双口径 0/0、焦点环可见、Tab 不被吞、零外部请求）。

**改版第 1 步产出**：① 改版待替换清单 `RESTYLE-PLAN.md`；② zh/en 文案骨架 `i18n/`（99 key）；③ **修复 4 个真实缺陷**：`.ev` 证据块切字形（双口径 D1 4/9 → **0/0**）、**搜索框完全不过滤**、favicon 404、`prefers-reduced-motion` 无降级；④ 整页截图做法写入 `README.md` 供 13 复用。

## 进度表

| # | 项目 | 状态 | 备注 |
|---|---|---|---|
| 1 | 模型本体核验 | ✅ | 正式版 2026-10-19（`MiniMax-M3.1-Flash`）；Preview 2026-09-27；Space Bunny 已于 10-19 由官方认领 |
| 2 | 线索 55 条实时核验 | ✅ | 51 核验通过 / 2 已删除(TweetTombstone) / 2 端点不可达 —— 均如实标注 |
| 3 | 平台扩展检索 | ✅ | B站 19 · YouTube 31 · GitHub 10 · 中文媒体 12 · 官方/基准 6 |
| 4 | 小红书 | ⚠️ **登录墙** | 已尝试 6 条路径（内置浏览器搜索页 / explore 公开流 / 必应 site: / 必应 RSS / 百度 site: / web_search）。搜索结果需登录；任务禁止访问凭据故未登录。**不可见项已写入 `cases.json` 的 `XHS-blocked` 条目** |
| 5 | 媒体下载 + 抽帧目视复核 | ✅ | 13 段 MP4 + 25 张抽帧（12 张 contact sheet + 13 张 hero）（`media/` `frames/`） |
| 6 | `cases.json` | ✅ | 134 条，统一 schema |
| 7 | `RANKING.md` | ✅ | 分平台排名 + 口径说明 + 合并热度 |
| 8 | `TOP3.md` | ✅ | 含原创改编规格 + 验收清单 + 备选 |
| 9 | `DIFF-REFERENCES.md` | ✅ | 逐项对照差异说明 |
| 10 | `index.html`（可浏览索引） | ✅ | 静态可构建；改版第 2 步起随附 `assets/ds/`（设计系统 + 5 个 OFL 字体），**运行期零外部请求** |
| 11 | `README.md` / `CHANGELOG.md` / `ACCEPTANCE.md` / `LICENSES.md` / `manifest.json` | ✅ | `LICENSES.md` 为改版第 2 步新建（第三方资源登记册） |
| 12 | 自检 | ✅ | `npm run verify` → **PASS 108 / FAIL 0 / WARN 0**；浏览器端四档视口验收 **62 项全绿** |

## 改版进度（`15-supervisor/RESTYLE-SPEC.md` §4）

| 步骤 | 内容 | 状态 | 产物 |
|---|---|---|---|
| **第 1 步** | 独立缺陷修复 + 改版准备：清点现有字体/颜色/间距使用点并出「待替换清单」；准备 zh/en key 骨架；**不改视觉** | ✅ **完成**（含 4 个缺陷修复） | `RESTYLE-PLAN.md`、`i18n/`、`evidence/d1-review/` |
| **第 2 步** | 按 16 的 `DESIGN-SPEC.md` + `design-tokens.json` + `preview.html` **增量**替换 token（不推倒重写结构）；统一导航/封面/详情/按钮/过渡；表格与密集数据可读性优先 | ✅ **完成**（21:20–21:55） | `assets/ds/`、`LICENSES.md`、改造后的 `build_index.py`；自检 108 项 + 浏览器验收 62 项全绿 |
| 第 3 步 | 13 验收（风格一致性 / 双语 / 3D 交互） | ⏸ 待派单 | — |
| 第 4 步 | 14 统一同步源码 → Pages → 线上交互验收 | ⏸ 待派单 | — |

### 第 1 步产出摘要

| 产物 | 内容 |
|---|---|
| **`RESTYLE-PLAN.md`** | 改版待替换清单，已**按 16 真实 `--ds-*` 键名重写**：字体族 27 项（+自托管字体落地 9 步）、颜色 40 处（13 基准色重定向 + **25 处未 token 化的硬编码/透明变体** + 2 链接色）、圆角 13 处（现 5 档 → 16 的 7 档）、间距 43 + 布局 7 + 字阶 36、动效/层级 5 项 + **8 项缺失能力需新增**、明确不改版项 7 条、第 2 步落地顺序 10 步、**主题选择待拍板** → **已于第 2 步全部执行完毕**，文件已加「已执行」标记并附逐项落地对照（见下节） |
| **`i18n/keys.json`** | **99 个 zh/en key**（`zh` 为页面现状逐字原文），覆盖页头/口径声明/工具栏/筛选/TOP3/徽章/统计/状态标签/卡片字段/指标名/分平台表/空状态/页脚 |
| **`i18n/README.md`** | 接线方式、动态数据边界（134 条案例文案属数据层，不在 key 表内）、给 19/14 的对接说明 |
| **`evidence/d1-review/`** | D1 修复前后留痕：3× 卡片对照、整页截图（桌面 22779px / 移动 62170px）、分平台表、页脚、首屏 + README 说明（**已 gitignore，不进发布**） |
| **本轮视觉改动** | **零**。未落地任何 `--ds-*` 视觉替换；仅修复 4 个缺陷（见下节） |

---

## 改版第 2 步：增量接入 16「余晖设计系统」（21:20–21:55）

### 接入方式

依据 `16-design-system/MIGRATION-NOTES.md` §1「接入四步」+ §2「旧变量重定向」+ §3「组件替换」+ §5「无障碍」+ §6「子路径」+ §7「reduced-motion」+ §10「不要做」。

**原则：既有 CSS 一律保留，只把取值重定向到 `--ds-*` 令牌**（增量式，不推倒重写）。页面自有样式层现在**零字面色值、零硬编码 rgba**（`verify.py` §12 逐项断言）。

| 接入项 | 落地方式 |
|---|---|
| ① token 层 | `assets/ds/tokens.css` + `assets/ds/components.css`（从 `16-design-system/src/` **原样复制**）+ `assets/ds/fonts/fonts.css` —— 三个 `<link rel="stylesheet">` **全部相对路径** |
| ② 字体 | `assets/ds/fonts/`：Space Grotesk / Inter / Space Mono regular+bold / Noto Sans SC 子集，共 5 个 woff2 + 5 份 OFL 1.1 原文 + `FONT-MANIFEST.json`；许可登记在 **`LICENSES.md`** |
| ③ 换外壳 | `<header class="ds-topbar">`（品牌 + 5 条锚点导航，`aria-current="page"`）、`<footer class="ds-footer bot">`（`.ds-footer__row` + `.ds-footer__links` + `.ds-footmeta`）、`<a class="ds-skip" href="#main">` 为**首个可聚焦元素**、`<main id="main">` 地标 |
| ④ 基准路径 | 入口注入 `<style>:root{--ds-base:"/playtime-atlas-20261021/";}</style>`（§6）—— **本页所有资源仍走相对路径**，该变量未被任何资源加载消费 |

### 主题拍板结果：**固定浅色**

`tokens.css` 默认浅色、深色由 `[data-ds-theme="dark"]` 或 `prefers-color-scheme: dark` 触发。本页在 `<html>` 上写 `data-ds-theme="light"`：

- **与 16 的 `preview.html` 默认态一致**（16 自己的样板页也是 `<html lang="zh-CN" data-ds-theme="light">`）；
- **理由**：`tokens.css` **没有给 `--ds-success` / `--ds-warning` / `--ds-danger` 定义深色档**。若跟随系统，状态胶囊在深底下对比度不足（实测 `--ds-success` #3F7A4E 对深色底 ≈ **3.5:1**），与 §5「正文 ≥4.5:1」的硬性要求冲突；而 §0 风险 B 明令「目录自有层不允许重新定义 `--ds-*` 的取值」，我不能就地补深色值。
- **代价（已记入限制节）**：深色 token 段在本页未被使用；本页**不提供主题切换**（切换按钮属第 3 步双语/交互范围，未获授权不在本轮加）。

### G.1—G.7 执行对照

| 项 | 要求 | 执行 | 实测 |
|---|---|---|---|
| **G.1** | 链接 tokens.css + components.css | 三个 `<link>`（含 fonts.css），相对路径 | `verify.py` §4 断言 3 个本地样式表存在且被引用；HTTP 全部 200 |
| **G.2** | header → `.ds-topbar`、footer → `.ds-footer`、加 `.ds-skip` | 全部落地；顶栏 + 锚点导航；页脚拆成 `.ds-footer__row`（链接行）与 `.ds-footmeta`（元信息） | 顶栏实测高 57px（桌面）/ 93px（窄屏换行）；`.ds-skip` 为首个可聚焦元素 ✅ |
| **G.3** | 标题**不得** `white-space:nowrap` | 标题显式 `white-space:normal`；`.ds-cover__title` / `.ds-h*` 本身也无 nowrap | 四档视口「标题 nowrap」计数 **0**；h1 在 390px 下正常换行不溢出 |
| **G.4** | `:lang(zh)` 字距归零 + 正文行高 1.85 | **发现 3 处必须显式复位**（见下）；正文 `.lede`/`.notice` 走 `ds-lead`/`ds-body`（1.85），`.ev` 行高改 **1.85**（`--ev-lh`） | 四档视口「负字距元素」计数 **0**；页面样式层**无任何负字距声明** |
| **G.5** | 状态 / 元信息用 `--ds-font-mono` | `.stat b` `.rank` `.pill` `.tag` `.m` `.c-date` `.evq` `.inv` `.foot` `.as` `.count` `.kicker` `.plat-h h2` `th` `summary` 全部等宽 | 对比度取样 38 项全部达标 |
| **G.6** | 保留既有功能，可读性优先 | 搜索 / 平台筛选 / 维度筛选 / 排序 / TOP3 / 分平台榜 / 口径声明**功能全部保留**；筛选 chip 由 `<span>` 升级为 `<button class="ds-chip" aria-pressed>`；表格**字号不压缩**（正文 14px / 表头 12.5px） | 搜索「鹈鹕」134 → **9 / 134**，清空恢复；四档视口功能一致 |
| **G.7** | 相对资源（子路径可移植） | `assets/ds/...` 全部相对；favicon 为内联 data URI；无任何 `/assets/...` 绝对根路径 | 四档视口**外部请求 0 条**、`http(s)://` 资源 0 处 |

### G.4 的 3 处负字距复位（本轮最隐蔽的坑）

`tokens.css` 的 `:lang(zh){letter-spacing:var(--ds-track-cjk)}`（=0）**只作用在 `:root`**，而：

1. `components.css` 的 `.ds-shell` 在 **body 上**写了 `letter-spacing:var(--ds-track-body)` = **-0.005em** —— 同权重（0,1,0）、加载更晚 → **覆盖了归零**，全站中文都会带负字距；
2. `.ds-h1` / `.ds-display` 自带 `--ds-track-display` = **-0.03em**，`:lang(zh)` 段**未覆盖** → 中文标题负字距；
3. 各类小标签自带**正**字距（`--ds-track-caps` 0.08em）→ 按 §5「中文字距归零」也应复位。

处置：页面样式层显式写 `body.ds-shell{letter-spacing:var(--ds-track-cjk)}` + `:lang(zh) .ds-h1/…{letter-spacing:var(--ds-track-cjk)}` + 一组 `:lang(zh) .kicker/.badge/.pill/…` 复位。**三处缺一不可**，已在 `verify.py` §12 做成护栏。

### 密集数据区：只统一外壳，不压缩信息密度

| 元素 | 改版前 | 改版后 | 判断 |
|---|---|---|---|
| 表格正文 | 13.5px | **14px**（`--ds-type-sm`） | ↑ 不压缩 |
| 表头 | 11px | **12.5px**（`--ds-type-xs`） | ↑ 不压缩 |
| 表格行高 | 继承 1.65 | 继承 `--ds-lh-normal` 1.6 | 基本持平 |
| 分平台表窄屏 | 无容器，390px 下挤压 | 外包 `.tblwrap{overflow-x:auto}`，**表格自身宽度不压缩** | ↑ |
| 卡片标题 | 15px / 1.45 | **16px**（`--ds-type-body`）/ 1.35 | ↑ |
| 指标胶囊 / 标签 | 10.5–11px | **12.5px**（`--ds-type-xs`） | ↑ |
| 证据块 `.ev` | 12.5px / 行高 1.65 / 3 行 | 12.5px / **行高 1.85**（中文正文口径）/ 3 行 | 行高 ↑，行数不变 |

### 顺手修掉的 3 个改版衍生问题

| # | 问题 | 修法 |
|---|---|---|
| **R-1** | 状态胶囊用 `opacity` 表达「不可达/已删」→ **把正文对比度一起拉低到 AA 以下**（实测 ≈3.9:1） | 改为**虚线边框 + 状态文字**表达（`--ds-bg-sunken` 底），**不再用 opacity**；状态仍不靠颜色单独表达 |
| **R-2** | 内联文本链接命中区只有 17–20px（< WCAG 2.5.8 的 24px） | `.c-title a` 加 `padding-block:3px`（inline 纵向 padding **不改变行盒高度，版式零影响**）；表内 ↗ 链接改 `.ext`（24×24）；TOP3 作者链接 24px。**179 个链接实测最小 24.00px** |
| **R-3** | 统计区「观测日期 2026-10-21」被拆成两行 | 该项降一档字号（19px）+ `nowrap`（是元信息不是计数） |

### 本轮验收（四档视口，62 项全绿）

> 探针：`/tmp/d1probe/accept.mjs`（Playwright + 本机 Chromium，参考 16 的 `tools/verify-preview.mjs` 检查项）；临时静态服务器 `python3 -m http.server 8931`，**验证完已关闭**。

| 检查 | 1440 | 1280 | 768 | 390 |
|---|---|---|---|---|
| V.1 横向溢出 | 0（scrollWidth 1440 = innerWidth） | 0 | 0 | 0 |
| V.2 正文对比度（38 项取样） | ✅ 最低 **4.81** | ✅ 4.81 | ✅ 4.81 | ✅ 4.81 |
| D1 压盖 · 口径A（字形行盒，不裁祖先） | **0** | **0** | **0** | **0** |
| D1 压盖 · 口径B（裁祖先盒，13 的 20:04 版） | **0** | **0** | **0** | **0** |
| 中文负字距元素 | 0 | 0 | 0 | 0 |
| 标题 nowrap | 0 | 0 | 0 | 0 |
| V.6 触摸目标 <24px | 0 | 0 | 0 | 0 |
| `.ev` 溢出 / 干净截断 | 0 / 23 | 0 / 23 | 0 / 29 | 0 / 26 |
| 控制台错误 / HTTP≥400 / 外部请求 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| V.5 跳转链接为首个可聚焦元素 | ✅ | ✅ | ✅ | ✅ |
| V.5 Tab 推进 | 12/12（191 个可聚焦元素） | 12/12 | 12/12 | 12/12 |
| V.5 焦点环可见 | 12/12 | 12/12 | 12/12 | 12/12 |
| 搜索过滤（鹈鹕） | 134 → 9 | 134 → 9 | 134 → 9 | 134 → 9 |

另有 **V.7 reduced-motion**：`transition-duration` **0.001s**；**V.9 字体**：`Space Grotesk / Inter / Space Mono(400,700) / Noto Sans SC` 全部 `loaded`，无一走 CDN。

### D1 压盖：改版前后对照（两口径）

| 指标 | 改版前（第 1 步修复后） | 改版后（第 2 步） |
|---|---|---|
| D1 · 口径A（18:41 版，不裁祖先） | 桌面 0 / 移动 0 | **桌面 0 / 移动 0** |
| D1 · 口径B（13 当前版，裁祖先盒） | 桌面 0 / 移动 0 | **桌面 0 / 移动 0** |
| 字形越过裁剪边的行数 | 0 / 0 | **0 / 0** |
| `.ev` 仍溢出的元素数 | 0 / 0 | **0 / 0** |

> 改版**未引入**任何新的压盖，也**未用** `z-index` / `transform` 掩盖任何重叠（`verify.py` §12 断言页面样式层的 `z-index` **全部取自 `--ds-z-*` 令牌**，且仅 1 处）。

### 本轮暂缓项与理由

| 项 | 状态 | 理由 |
|---|---|---|
| **zh/en 双语接线** | ⏸ 暂缓 | `i18n/keys.json` 骨架已就绪（99 key），但**接线会同时改动 134 条案例的数据层文案**（属数据层，需 19/14 统一方案）。本轮只做视觉语言统一，**不切语言、不改文案**；`<html lang="zh-CN">` 保持正确 |
| **主题切换按钮** | ⏸ 暂缓 | 16 的 `preview.html` 有主题切换，但本轮主题已固定浅色（理由见上）；加切换会新增交互面与新缺陷风险，属第 3 步范围 |
| **`--ds-blur` 令牌缺失** | ✅ 本批自定 | 工具栏 `backdrop-filter:blur(10px)` 的 10px **无 16 取值**，为本批自定（16 只定义了 `--ds-rail-blur` / `--ds-entry-blur`） |
| **`--ds-success/--ds-warning/--ds-danger` 深色档** | ✅ 绕过 | 令牌无深色取值，且不允许就地重定义 → **改用「浅色固定主题」规避**，不引入本批自定的深色语义色 |
| **`assets/ds/` 共享化** | ⏸ 交 14-publish 决策 | 16 的 `FONT-MANIFEST.json` 期望的 `copyTo` 是 `release/docs/assets/ds/fonts/`（站点根共享）。本目录采用**作品内自包含副本**（相对 URL → 任意子路径可移植，且不依赖他人目录）。若 14-publish 决定改为站点根共享，需**同步改引用路径**并保证作品页与根目录**两份都有**（否则 404） |
| **3D 资产 / 模型** | — | 本目录是**研究索引**，无 3D 资产，不涉及 |

---

## 字体栈顺序缺陷修复 —— 2026-10-21 22:4x（15-supervisor 派单）

### 判定与根因

**派单结论**：00-research 属**真缺陷**（不是潜在风险）—— 目录内存在**活**的 `@font-face(Noto Sans SC)` 且 `noto-sans-sc-subset.woff2`（197 600 B）实体真实存在。

**根因**：`assets/ds/tokens.css` 是 16 的 `src/tokens.css` 的**改版前副本**，其中：

```
--ds-font-display: "Space Grotesk", "Noto Sans SC", -apple-system, BlinkMacSystemFont,
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC", sans-serif;
```

`Noto Sans SC`（**自托管有限子集**）排在**覆盖完整**的系统 CJK 栈之前。

> **本页实测覆盖率**（逐字 CDP 平台字体探针，非引用 16 的他页数据）：本页可见文本共 **729 个唯一汉字**，Noto Sans SC 子集直接覆盖 **452 个（62.0%）**，**277 个（38.0%）缺失** → 回退到 `PingFang SC`。
> （16 的 `FONT-MANIFEST.json` 记的 57.5% / 1031 字是**他们那页**的基数，与本页无关；本目录以自测数据为准。）
CSS 字体回退是**按字符**进行的 → 子集缺字时浏览器**逐字**回退到下一个族 → **同一段文字里混入两套不同度量的字形**，表现为混排基线错位（全角标点与常用字不同源时最明显）。

### 修改（逐字对齐 16 已修正的 `src/tokens.css:57-61`）

| 文件 | 行 | 改动 |
|---|---|---|
| **`assets/ds/tokens.css`** | **46–60** | 字体栈换序：`拉丁自托管 → 完整系统 CJK 栈（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC）→ Noto Sans SC 子集 → -apple-system / BlinkMacSystemFont → sans-serif`；并带回 16 新增的**顺序规则注释**（⚠️ 覆盖完整的 CJK 族必须排在覆盖有限的子集之前）。同时 `-apple-system` / `BlinkMacSystemFont` 一并移到 Noto 之后（原先夹在 Noto 与 PingFang 之间，Windows / Linux 上 CJK 会走另一套族） |
| **`assets/ds/fonts/fonts.css`** | 9–17、48–56 | 带回 16 的**顺序规则注释**与 Noto `@font-face` 的「不得排在完整 CJK 族之前」使用约束。**`@font-face` 声明本身一字未改** |
| **`assets/ds/fonts/FONT-MANIFEST.json`** | 7–45、158–159 | `stackResolution.display` / `.text` 换序；`policy.cjkStrategy` 与新增的顶层 `cjkStrategy` 补上顺序规则 |
| **`assets/ds/components.css`** | — | **无差异**（与 16 逐字一致，未动） |
| `assets/ds/fonts/noto-sans-sc-subset.woff2` | — | **保留未删**（197 600 B）。正确定位是「渐进增强兜底」：只有前面的完整系统 CJK 族全部不可用时才生效 |

> 三个文件现已与 `16-design-system/` 的修正版**逐字一致**（`diff` 全空），无新旧不一致残留。

### 复扫结果（独立脚本 `scan_font_stack.py`，按监工判据）

判据：目录内存在**活** `@font-face(Noto Sans SC)` 且 woff2 实体存在 → 判为子集真缺陷候选；若该子集在字体栈中排在任何覆盖完整的 CJK 族之前 → 判为**真缺陷**；否则为潜在风险。

| 项 | 修复前 | 修复后 |
|---|---|---|
| `@font-face(Noto Sans SC)` | 活 ✓（`fonts.css` 被 `index.html` 引用 + 实体 197 600 B 在位） | 活 ✓（**未删除**） |
| `--ds-font-display` 中 Noto Sans SC 的位置 | **#1**（排在 PingFang / Hiragino / YaHei / Source Han 之前） | **#5**（排在四个完整 CJK 族之后） |
| `--ds-font-text` 中 Noto Sans SC 的位置 | **#1** | **#5** |
| `-apple-system` / `BlinkMacSystemFont` 位置 | 夹在 Noto 与 PingFang 之间 | **移到 Noto 之后** |
| **复扫判定** | **真缺陷 2 项**（退出码 1） | **真缺陷 0 项**（退出码 0） |

**扫描器本身的有效性已用对照组证明**：把 `tokens.css` 临时还原成旧顺序（仅临时副本，不动真目录）后复扫 → 报出 2 项 DEFECT、退出码 1；恢复修正版 → 0 项、退出码 0。
（扫描器首版曾因「只在同一文件内比对」漏判跨文件场景 —— `@font-face` 在 `fonts.css`、栈在 `tokens.css` —— 且判据方向写反，已修正并加对照组验证。）

### 浏览器实测：实际用于渲染的字体（CDP `CSS.getPlatformFontsForNode`）

| 元素 | 修复前 | 修复后 |
|---|---|---|
| `h1.ds-h1`（8 个汉字） | `Noto Sans SC Thin(自托管):7` + **`PingFang SC:1`** ← 混排 | `PingFang SC:8` ← 统一 |
| `.lede.ds-lead`（72 个汉字） | `Noto Sans SC Thin(自托管):60` + `:8` + **`PingFang SC:4`** ← 混排 | `PingFang SC:64` + `:8` ← 统一 |
| `.notice.ds-body` | `Noto Sans SC Thin(自托管):4` | `PingFang SC:4` |
| `.c-title a` | `Noto Sans SC Thin(自托管):15` | `PingFang SC:15` |

> 即：修复前导语一段 72 个汉字里有 **4 个**（子集未覆盖的常用字）走 PingFang、其余 68 个走 Noto 子集 —— 同一行里两套字形。修复后**全部汉字统一走系统黑体**，拉丁字形仍来自自托管的 Inter / Space Grotesk / Space Mono。

### 固化护栏

- **`verify.py` 新增 [13] 字体栈顺序护栏 12 项**（两个栈的完整 CJK 族顺序 / `-apple-system` 位置 / `@font-face` 仍在 / woff2 实体在位 / 自有样式层不写死字体族 / 复扫器判为 0 真缺陷）→ 自检 **108 → 120** 项。
- **新增 `scan_font_stack.py`** —— 独立复扫器（可单独运行，退出码 0 = 无真缺陷），随目录交付。

---

## 本轮修复的 4 个真实缺陷

| # | 缺陷 | 根因 | 修法 | 验证 |
|---|---|---|---|---|
| **D-1** | `.ev` 证据块**切字形** + 旧口径下报「文字压盖」 | `max-height:5.4em` + `overflow:hidden` 按**像素**裁剪，裁剪边落在行中间（5.4em ≈ 3.1 行）→ 第 4 行被切掉大半；被裁掉的行盒仍延伸到「证据来源」行 / 指标胶囊的行盒区域 | 改为**按行**：`max-height: calc(var(--ev-lines) * var(--ev-lh) * 1em + 2 * var(--ev-pad-y))`（精确 3 个行高）+ 运行时 `fitEvidence()` 把「前缀 + 省略号」整体塞进 3 行 | 桌面 4/移动 9 → **0/0**（双口径）；字形越界 31/44 → **0/0**；越界深度 77px → **0** |
| **D-2** | **搜索框完全不过滤** | 过滤读 `c.data_q`，而检索串只写在卡片元素的 `data-q` 属性上 → `c.data_q` 恒为 `undefined`，守卫 `c.data_q && …` 短路 → 条件恒不成立 | 检索串挂到案例对象上（`c.data_q = 标题/原标题/作者/句柄/证据/证据来源/分类/平台/维度`），过滤与 DOM 属性同源，去掉会短路的真值守卫 | 「鹈鹕」134 → **9 / 134**（9 张卡），清空恢复 134 |
| **D-3** | `/favicon.ico` 404（13 记为 QA-046） | `<head>` 未声明图标，浏览器自动请求站点根 | 内联 **data URI SVG 图标**（自包含、零外部请求）+ `<meta name="theme-color">` | 控制台错误 **1 → 0**；HTTP ≥400 **1 → 0** |
| **D-4** | 无 `prefers-reduced-motion` 降级 | 唯一的 `.chip` 过渡 `.15s` 无降级；违反 `RESTYLE-SPEC` §6.7 与 16 §7「每个接入方必须实现」 | 按 16 §7 落地标准降级块（时长归 1ms、保留 hover 状态表达、禁 `scroll-behavior:smooth`） | 模拟该媒体特性：`.chip` `transition-duration` **0.15s → 0.001s** |

> 自检同步加了 **[11] 回归护栏** 6 项（检索索引赋值 / 同源 / 去短路、`.ev` 行对齐、`fitEvidence()` 存在、reduced-motion 存在），自检项 **68 → 74**，防止后续改版时回退。

---

## D1「元素重叠遮挡」复核结论 —— 2026-10-21

### 触发与背景

13-qa-curation 于 18:28:59 报 D1 不通过：**桌面 17 对 / 移动 16 对**。

**该数字不可直接比对**，原因是检测器在复核期间又改了两版：

| 时间（台北） | `checks.mjs` 版本 | 我的复检结果 |
|---|---|---|
| — | 报告时版本（元素盒比较） | 监工转述：桌面 17 / 移动 16 |
| 19:29 / 19:31 | **18:41 版**（改按 `Range.getClientRects()` 字形行盒 + `checkVisibility()` 排除未渲染内容） | **桌面 4 对 / 移动 9 对** |
| 19:58 | 18:41 版 + **我自己写的裁剪感知审计** | **桌面 0 对 / 移动 0 对** |
| **20:04:47** | **13 再次更新：新增 `clipToOwnBox()`**（把每个元素自己的文字行盒按其自身 `overflow:hidden/clip` 裁剪后再求交） | — |
| 20:27 / 20:29 | **当前版本（20:04）** | **桌面 0 对 / 移动 0 对 —— D1 通过** |

> 我的独立裁剪感知审计（19:58）与 13 的检测器修复（20:04）**结论一致**：被裁掉的文字不可能与可见文字压盖。

### 当前检测器下的实测结果

| 视口 | `<details>` 关闭 | `<details>` **展开** | 结论 |
|---|---|---|---|
| 桌面 1440×900 | **0 对（pass）** | **0 对（pass）** | 候选 2231 个 |
| 移动 390×844 | **0 对（pass）** | **0 对（pass）** | 候选 2230 个 |

### 18:41 版命中的成因（已证伪）

旧版报出的 13 个命中对**只涉及两族元素**，无第二种模式：

| 命中对 | 涉及元素 | 判定 |
|---|---|---|
| `div.ev` × `div.evq`（9 对） | 卡片里的**证据原文块** 与其下的**「证据来源」行** | ❌ 假阳性 |
| `div.ev` × `span.m` / `span.m.na`（4 对） | 证据原文块 与其下的**指标胶囊** | ❌ 假阳性 |

**成因（逐条实测证明）**：

1. `.ev` 的 CSS 是 `max-height:5.4em; overflow:hidden` —— 证据原文**被刻意截断**。
   实测 `clientHeight = 68px`、`scrollHeight = 107px` → **39px 的文字被 `overflow:hidden` 裁掉，从未被绘制**（桌面 16 处共 486px，移动 23 处共 740px）。
2. 下一元素 `.evq` 的顶边在 `.ev` 盒底**下方 11px**（`nextTop = evBottom + 11`）→ **几何上不可能压盖**。
3. 旧版检测器的 `Range.getClientRects()` 返回**未应用祖先 `overflow:hidden` 裁剪**的**布局行盒**：实测 `.ev` 的文字行盒为 `7017-7032 / 7037-7052 / 7058-7073 / 7079-7094 / 7099-7114`，而 `.ev` 的盒底在 `7080` —— 第 4、5 行行盒越出盒底，与下方 7091 起的「证据来源」行盒相接，于是被判为重叠。
4. **裁剪感知复核**（把每个字形行盒与全部裁剪祖先求交，只保留真正会被绘制的部分）：**桌面 0 对、移动 0 对**。
5. **3× 放大目视复核**（`evidence/d1-review/card-evidence-block-3x-desktop.png`）：证据块第 3 行截止处与「证据来源」行之间**留有清晰空隙，指标胶囊独立成行**，**无任何字形压盖**。同批复核截图见 `evidence/d1-review/`（`perplat-table-2x-desktop.png` / `footer-2x-desktop.png` / `above-fold-desktop.png`）。

### 监工转述的「`<td>` × 页脚 `<p>`」

**在当前页面上不存在。**

- `<details>` 关闭时，其内 `<td>` **未被渲染**（`checkVisibility()` = `false`），检测器已跳过。
- `<details>` **展开**后实测：表格最后一行底边 **24175px**，页脚顶边 **24220px**（桌面）→ **45px 间隙**；移动端同值（65972 → 66017）。**展开后命中数不变**（0→0），说明表格区没有引入任何新的重叠。

### 本轮处置（21:00 更新）

> **判定：命中本身在 18:41 口径下是「被裁掉文字的行盒」造成的假阳性，但它背后指向一个真实缺陷 —— 证据块的字形被切了。两者都已处理。**

**处理一（结构性根因修复）**：`.ev` 改为**按行截断**（详见上节 D-1）。
截断点由**像素**改为**行**，DOM 中不再存在越过裁剪边的文字行盒 →
**18:41 口径与当前口径均报 0 对**，且不依赖检测器版本。

**处理二（没有靠 z-index / transform 掩盖）**：
`.ev`、`.evq`、`.m`、`.m.na` 全程在**正常文档流内依次排列**，未加任何 `position` / `z-index` / `transform`。
窄屏下 `span.m`（回复数）与 `span.m.na` 换行续排也一并验证（移动 9 对 → 0）。

**处理三（19:29 → 21:00 的完整时间线）**

| 时间（台北） | `checks.mjs` 版本 | 我的复检结果 |
|---|---|---|
| — | 报告时版本（元素盒比较） | 监工转述：桌面 17 / 移动 16 |
| 19:29 / 19:31 | **18:41 版**（按字形行盒判定 + `checkVisibility()` 排除未渲染内容） | 桌面 **4** / 移动 **9** |
| 19:58 | 18:41 版 + **我自己写的裁剪感知审计** | 桌面 **0** / 移动 **0** |
| **20:04:47** | **13 再次更新：新增 `clipToOwnBox()`**（把元素自己的行盒按其自身 `overflow:hidden/clip` 裁剪后再求交） | — |
| 20:27 / 20:29 | 当前版本（20:04） | 桌面 0 / 移动 0（D1 pass） |
| **21:00** | 当前版本（20:04）**+ 修复后** | **桌面 0 / 移动 0（双口径均为 0）** |

**修复前后对照**

| 指标 | 修复前 | 修复后 |
|---|---|---|
| D1 · 18:41 口径 | 桌面 4 / 移动 9 | **桌面 0 / 移动 0** |
| D1 · 当前口径（20:04） | 桌面 0 / 移动 0 | **桌面 0 / 移动 0** |
| 字形越过裁剪边的行数 | 桌面 31 / 移动 44 | **0 / 0** |
| 越界最深距离 | 77 px | **0 px** |
| `.ev` 仍溢出的元素数 | 桌面 16 / 移动 23 | **0 / 0** |
| 被干净截断的证据块 | — | 桌面 17 / 移动 24（省略号落在行内） |

**证据**：`evidence/d1-review/`（修复前 3× 卡片、修复后 3× 卡片 ×2、整页截图 ×2、表格、页脚、首屏 + README 对照表）。

---

## 关键发现（供并行任务直接用）

1. **TOP3**（均为正式版 M3.1 Flash 作品，**不是复刻而是原创改编**）：
   - **TOP1 网页** — @nutlope 硬件落地页（X 1416 赞 / 84 回复，$0.014 vs Opus $1.22）→ 改编为 **「NIMBUS-7 桌面气象站」**
   - **TOP2 3D+交互** — Ivan Fioravanti WebGPU 写实水面 + 漂浮相机（提示词公开）→ 改编为 **「TIDAL DRIFT 潮汐漂移」**
   - **TOP3 交互界面** — @ItsmeAjayKV MONSTERA STUDY 3D 查看器（one-shot 带完整控制条）→ 改编为 **「HELIOS SPECIMEN 日轮标本台」**
2. **隐藏金矿**：`MiaAI-Lab/MiniMax-M3.1-Flash-100-HTML-Files` —— **100 个单文件 HTML 研究**，每个配完整原始提示词（`.txt` 含 TITLE/PROMPT/DESCRIPTION/MAJOR VISUAL TECHNIQUES/INTENDED INTERACTION MODEL）。实测：**0 个外部资源引用、0 个 CDN**，全部自包含。已克隆到 `references/mia-100-html/`（**无 LICENSE，仅参考不得复制**）。
3. **可浏览双盲图库**：`https://gallery.arenaofbias.icu/` —— 收录各模型可运行前端作品 + 截图 + 提示词，支持并排对比与匿名盲评。
4. **最强负面对照**：B站《DeepSeekV4.1 Flash 1017｜屎山考核》158,244 播放 / 5,304 赞 / 2,068 评论 —— 同赛制基线，评估 M3.1 Flash 相对水平时最佳参照物。
5. **社区负面共识**（务必知情再选型）：幻觉率高（AA 口径 93%）、交互/stateful 程序易翻车（3D 赛车黑屏、鹈鹕骑车 SVG 残影、浏览器桌面漆黑）——**强视觉 + 弱状态机**是本模型的稳定画像。

---

## 限制（本目录产物的已知边界）

### 数据侧（平台不可见项，不做推测填充）

| 项 | 状态 | 原因 |
|---|---|---|
| 小红书具体笔记数据 | ❌ 不可得 | 平台登录墙；任务禁止访问凭据 |
| X 转发数 / 书签数 / 浏览量 | ❌ 不可见 | 公开 syndication 端点不返回；未使用需授权的 X API |
| B站转发 / 投币 | ❌ 不可见 | 公开搜索接口不返回 |
| YouTube 点赞 / 评论 | ❌ 不可见 | 搜索结果页 `ytInitialData` 不含 |
| 4 条不可达 X 帖（M18/M52/M54/M55） | ❌ 不可得 | 已删除或受保护 |

以上均为**平台侧不可见项**，已在 `cases.json` 的 `metrics_invisible` 与 `verification.status` 中逐条标注。

### 改版侧（本轮）

| 项 | 说明 |
|---|---|
| ~~**参考站未取证**~~ → **已由 16 解决** | 16 已于 **2026-10-21 19:30** 完成对 `https://olek.si/` 的取证（`16-design-system/REFERENCE-AUDIT.md`，逐条标注直接观察 / 二手证据 / 推测）。**颜色、字体、字号、圆角、缓动曲线与命名全部是 16 的自有设计**，与参考站取值不同 —— 因此本目录的改版**不引用任何「参考站原值」** |
| ~~**候选 token 路径为本批自定**~~ → **已对齐真实键名** | `RESTYLE-PLAN.md` 已于 21:00 按 16 的真实键名（`--ds-bg` / `--ds-ink` / `--ds-accent` / `--ds-font-text` / `--ds-radius-md` / `--ds-space-4` / `--ds-type-xs` / `--ds-lh-normal` / `--ds-dur-fast` / `--ds-focus-ring` …）重写，取值抄自 `design-tokens.json` / `src/tokens.css`，**不复制 16 的文件** |
| ~~**主题未拍板**~~ → **已定：固定浅色** | 16 的令牌是双主题、浅色为默认。本页在 `<html>` 上写 `data-ds-theme="light"`，与 16 的 `preview.html` 默认态一致。**理由**：`tokens.css` 未给 `--ds-success`/`--ds-warning`/`--ds-danger` 定义深色档，跟随系统会让状态胶囊对比度掉到 ≈3.5:1（§5 要求 ≥4.5），而 §0 风险 B 不允许就地重定义 `--ds-*` 取值 → 用固定浅色规避。**代价**：深色 token 段在本页未被使用，且**不提供主题切换** |
| **合并档位为预估** | 圆角（5→4 档）、字号（10→8 档）、间距（22→10 档）的合并方案是**按 16 的刻度对齐**的预估，最终以 16 反馈为准；**表格字号不得低于 13px** 是本批自定的可读性硬约束（16 的 `--ds-type-sm`=14px 满足）——**本轮实测表格正文 14px、表头 12.5px，均达标** |
| **16 令牌缺 3 项** | `--ds-blur`（工具栏背景模糊）在 16 的令牌中不存在 → 工具栏 `backdrop-filter:blur(10px)` 的 **10px 为本批自定**；`--ds-success/--ds-warning/--ds-danger` **无深色档** → 本页固定浅色主题规避（未自定深色语义色） |
| ~~**字体仍为系统栈**~~ → **已落地自托管** | 第 2 步已引入 16 的 **5 个 OFL 字体**（Space Grotesk / Inter / Space Mono regular+bold / Noto Sans SC 子集，394 956 B），**相对 URL**（`assets/ds/fonts/fonts.css` 内 `url("./xxx.woff2")`）、`font-display:swap`、**只 preload 首屏 2 个拉丁字体**、**零 CDN**；许可全文随包（5 份 `OFL-*.txt`），登记在 **`LICENSES.md`** |
| **zh/en 尚未接线** | `i18n/keys.json` 只是骨架，页面**未接入**、**未切换**语言。`<html lang="zh-CN">` 已存在（原先缺失），第 2 步接线时须随切换同步 `lang` 与 `hreflang` |
| **数据层双语不在本目录** | 134 条案例的标题/证据/作者名属数据（`cases.json`），需由 19/14 统一方案处理 |
| **D1 已闭环（修复而非回避）** | 18:41 口径的 4/9 对是**被裁掉文字的行盒**造成的；但它背后指向一个真实缺陷 —— **证据块字形被切**。已改为按行截断（`max-height` 精确等于 3 个行高 + `fitEvidence()` 把「前缀+省略号」塞进 3 行），**双口径均为 0 对**，且未用 `z-index` / `transform` 掩盖。**改版第 2 步后复测仍为 0/0（两口径 × 四视口）** |
| **`.ev` 截断的产品取舍** | 证据原文在卡片上**仍只显示 3 行**（完整原文在 `cases.json` 与页面内联数据中）。若 13 认为「应可展开看全文」属产品要求，请作为**独立需求**提出（加渐隐遮罩 / 「展开」按钮），不要按 D1 缺陷处理 |
| **粘性工具栏覆盖内容** | `.toolbar` 为 `position:sticky`，滚动时会遮挡下方卡片内容（设计如此：近乎不透明底 + 10px 背景模糊）。13 的 D1 在**加载后、滚动前**触发，故不计入判定 |
| **`.ev` 行高改 1.85 的副作用** | 证据块行高由 1.65 提到 1.85（中文正文口径）后，**同样 3 行能装的字数变少**。`fitEvidence()` 会自动重算截断点，实测干净截断数 23（1440）/ 26（390）。这是中文可读性与信息密度的**显式取舍**：正文行高按 §5 取 1.85 |
| **中文字体子集覆盖有限** | `noto-sans-sc-subset.woff2` 是 07-museum-art 按其自身用字生成的**有限子集**，**不是**全站汉字全集。它的正确定位是**渐进增强兜底** —— 只有前面的完整系统 CJK 栈（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC）**全部不可用**时才生效。**已修正**：此前该子集排在系统栈之前，会导致同一段汉字混入两套字形（基线错位）—— 22:4x 已换序并加护栏（见上节）。即使在无系统 CJK 栈的极端环境下回退到子集，**仍不缺字**，只是字形与全站略有差异 |

### 其他

- 互动指标为 **2026-10-21 观测快照**，不代表当前值。
- 平台内容版权归各作者与平台所有；本目录不主张对其的任何权利。
- `references/mia-100-html/` 为**无 LICENSE 的克隆参考库**（保留所有权利），仅供阅读与比对，**禁止复制**其文件内容或代码片段进入任何交付物。

---

## 发布包交付（交 `14-publish`）—— 2026-10-22 00:1x

用户 23:40 要求「部署到我的github仓库 然后上线」；15-supervisor 23:4x 派单明确：**14-publish 是全批次唯一 Git 写入者与发布者**，本目录**只交包、不做 git 写入**（避免与首页重构流程并发写 Git 冲突）。

### 交付物

| 项 | 值 |
|---|---|
| 交付目录 | `00-research/release-package/` |
| 产物目录 | `00-research/release-package/PAYLOAD/` —— **可静态构建的产物目录**，即 14 仓库 `docs/works/00-research-dossier/` 的完整内容（16 个文件 / 882 047 B = 861 KiB） |
| 清单 | `00-research/release-package/PACKAGE-MANIFEST.json`（入口 / 深链 / 相对发布根路径 / 文件清单字节 + SHA256 / 12 项自检结论） |
| 接入说明 | `00-research/release-package/INTEGRATION.md` |
| 入口文件 | `PAYLOAD/index.html`（别名 `PAYLOAD/case-index.html`，与主入口逐字相同、同一 SHA-256） |
| 建议深链 | `works/00-research-dossier/` → `https://kingkazmax.github.io/playtime-atlas-20261021/works/00-research-dossier/` |
| 相对发布根路径 | `works/00-research-dossier/` |
| 打包器 | `00-research/make_release_package.py`（`npm run package`，退出码 0 = 12 项自检全过） |
| 入口哈希 | `index.html` / `case-index.html` 同为 `af18637c563631de…`（与 `PACKAGE-MANIFEST.json` 内记录一致；Ego 实际加载字节与之 `match: true`） |

### 包级自检 12 项全绿

C1 入口存在且非空 · C2 别名与主入口逐字一致 · C3 无根绝对路径（Pages 子路径安全）· C4 运行期零外部请求 · C5 本地资源在包内齐全 · C6 5 个字体实体在位且字节数与 `FONT-MANIFEST.json` 一致（394 956 B）· C7 5 份 OFL 原文随包分发 · C8 包内只有运行期产物 · C9 字体栈顺序复扫（**对包本身**）真缺陷 0 项 · C10 页面自包含（134 条数据内联）· C11 五个深链锚点齐全 · C12 `@font-face` 全部本地相对引用。

### 对**发布包本身**的交付验证

- **按 Pages 子路径摆位实测**：`/playtime-atlas-20261021/works/00-research-dossier/` 下 `index.html` / `case-index.html` / `tokens.css` / `components.css` / `fonts.css` / `space-mono-bold.woff2` / `OFL-inter.txt` 全部 **HTTP 200**。
- **浏览器验收 32 项全绿**（1440 / 1280 / 768 / 390 各 7 项 + 别名入口 3 项 + 深链 1 项 + 可达性 1 项）：运行期外部请求 0 / 控制台错误 0 / HTTP≥400 0 / 横向溢出 0px / 134 条案例渲染 / 5 个字体本地 loaded / 检索 134 → 9 / 别名入口完好 / `#perplat` 深链自动展开。
- **用 14 自己的 `scripts/publish-filter.mjs` 跑发布包**：删除台账文档 0 份、清理页面 0 个，`index.html` 与 `case-index.html` **逐字节未改动** → 本页不会被 14 的公开净化规则改写。
- **对照组反证**：注入 1 个 CDN 资源 + 1 个根绝对路径后重跑 → C3 / C4 / C5 报错、退出码 1。

### 交 14 时需要知道的三件事

1. **本包不含 git 写入动作，请 14 统一提交**（无 add / commit / push；未改 `works.json` / `hall/` / `scripts/`）。
2. **要不要进大厅由 14 决定**：当前 `works.json` 中 `00-research-dossier` 为 `publish:false`，`build.mjs` 第 125 行会跳过它、`make-covers.mjs` 也不会生成封面。置 `true` 即由流水线托管（封面按 archive 调色板自动生成）；保持 `false` 而直接把 `PAYLOAD/` 拷进 `docs/`，下次 `build.mjs` 的 `rmrf(docs)` 会清掉该目录。
3. **不需要 14 留入口锚点**：页面自带 `#main` / `#top3` / `#out` / `#perplat` / `#foot` 与顶栏导航。若希望大厅「复制线上地址」直接落到分平台最高榜，把 entry 写成 `works/00-research-dossier/index.html#perplat` 即可（页面会自动展开该折叠区）。检索词不写入 URL，深链无法预置搜索词。

---

## 交接给 `14-publish` 的说明

- 静态入口：`index.html`（`entry`），纯静态、**运行期零外部请求**、零构建依赖（另有可选 `npm run build` 重建数据）。
- ⭐ **发布包已备好**：`release-package/`（`PAYLOAD/` 产物目录 + `PACKAGE-MANIFEST.json` 清单 + `INTEGRATION.md` 接入说明）。
  建议深链 `works/00-research-dossier/`，相对发布根路径同上；入口 `index.html`（别名 `case-index.html`）。
  **本包不含 git 写入动作，请 14 统一提交。** 详见上节「发布包交付」。
- `data/case-index.json` 为生成物；若并行任务新增案例，重跑 `npm run build` 即可。
- **第 1 步新增 3 个文件需一并纳入发布范围**：`RESTYLE-PLAN.md`、`i18n/keys.json`、`i18n/README.md`。
- ⚠️ **第 2 步后本目录不再是单文件**：`assets/ds/`（492 KiB = tokens.css 10 085 B + components.css 31 282 B + 5 个 woff2 394 956 B + 5 份 OFL 原文 + fonts.css + FONT-MANIFEST.json）**必须由 14-publish 一并拷入发布包**，否则线上样式与字体全 404 —— 这正是 16 记录的 06-museum-core 历史缺陷。
  - 本目录采用**作品内自包含副本**（`assets/ds/`，相对 URL → 任意子路径可移植）。16 的 `FONT-MANIFEST.json` 期望的 `copyTo` 是站点根 `release/docs/assets/ds/fonts/`（共享）。
  - **若 14-publish 决定改为站点根共享**，需二选一：**(a)** 保留作品内副本（现状，零改动）；**(b)** 改为根共享并同步修改 `index.html` 的三个 `<link>` 路径 —— 注意作品页与根目录**两份都要有**，否则 404。**在收到 14-publish 的决定前，本目录保持现状 (a)**。
- **发布前逐条 `curl` 期望 200**（MIGRATION-NOTES §6）：
  `<作品路径>/assets/ds/tokens.css`、`…/assets/ds/components.css`、`…/assets/ds/fonts/fonts.css`、`…/assets/ds/fonts/inter-latin.woff2`、`…/assets/ds/fonts/space-grotesk-latin.woff2`、`…/assets/ds/fonts/space-mono-regular.woff2`、`…/assets/ds/fonts/space-mono-bold.woff2`、`…/assets/ds/fonts/noto-sans-sc-subset.woff2`。
- `evidence/d1-review/` 为**本地验收留痕**（含页面画面），已 gitignore 并列入 `publish.scope.exclude`，**不发布**。
- 产物内**不含** token、凭据、日志、`.env` 或其他项目文件。
- 本任务**不自行发布**，统一由 `14-publish` 推送与部署。
