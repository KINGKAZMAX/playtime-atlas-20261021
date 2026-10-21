# Task 00 · MiniMax M3.1 Flash 全球公开案例索引

> **批次**：`output/flash-showcase-20261021/` ｜ **任务**：00-research
> **执行模型**：MiniMax Code · MiniMax-M3.1-Flash · effort=max
> **观测时间**：2026-10-21（所有平台指标为该时刻快照）
> **上级指令**：`../MASTER-UPDATE.md` — 本任务产出为**原创改编**的规格与索引，**不是完全一致复刻**

一个可离线浏览的 **MiniMax M3.1 Flash 全球公开案例库**（134 条，逐条核验），外加覆盖 **网页 / 3D / 交互** 的 TOP3 **原创改编规格**与逐项对照差异说明。

---

## 快速开始

```bash
# 方式 A —— 直接打开（零依赖，file:// 即可；须与 index.html 同目录保留 assets/）
open index.html

# 方式 B —— 本地静态服务（推荐：与线上子路径行为一致）
npm run serve            # → http://localhost:8080/index.html

# 方式 C —— 重建全部生成物
npm run build            # = build_cases.py → build_index.py → gen_ranking.py

# 方式 D —— 自检（120 项检查，含归属隔离、确定性构建、回归护栏、改版护栏与字体栈顺序护栏）
npm run verify
```

> `npm` 仅为脚本包装；**实际依赖为零** —— 三个构建脚本只需 Python 3.8+。
> 改版第 2 步后页面多了 `assets/ds/`（设计系统 + 5 个自托管字体，492 KiB）—— **仍是零外部请求**（无 CDN、无外链字体、无运行期外部 API），但 `file://` 打开时若 `assets/` 不在同级目录，样式与字体不会加载。用**方式 B** 最稳。

---

## 整页截图做法（Ego 口径，供 13-qa-curation 复用）

> ⚠️ **2026-10-22 起：所有浏览器操作一律只走 Ego 浏览器**（用户长期约定，已写入用户级持久记忆）。
> 内置 Browser 工具、`chromium.launch()` / playwright / playwright-core / puppeteer / 本机无头 Chrome + CDP **全部禁用**；
> 「本地 file:// 自测豁免 Ego」的旧例外**已取消**（Ego 可直接加载 `file://`，本目录已实测：标题 / CSS / 字体全部正常）。
> Ego 故障时**诊断并如实报告**，不静默换浏览器。
> 本节已于 2026-10-22 从 Playwright 实现**整体改写为 Ego 实现**；文末「历史坑」中属旧实现的条目已标注。

> **为什么必须整页**：本目录的文档高 **26757px（桌面）/ 72758px（移动）**（改版第 2 步后实测；Ego 在 `file://` 下复测为 **26750px**，一致）。视口截图只覆盖首屏，
> 而 D1/D2 命中、密集表格、卡片下半部分**全部在首屏以下** —— 只看视口图无法判定。

### 1. 先取当前版本的用法指南

```bash
/Users/mekzenx2/.local/bin/ego-browser skill
```

指南与本机 ego lite 版本配套（含 `page.screenshot` / `page.snapshot` / `page.cdp` / TaskSpace 的准确签名），**每轮动手前先跑**。

### 2. Ego 最小实现（一个目标复用一个 TaskSpace）

```bash
# 每轮一个新文件（不要改上一轮文件重放）；用 -e 引入，路径必须是绝对路径
/Users/mekzenx2/.local/bin/ego-browser nodejs -e "await import('file:///abs/path/round-01.mjs')"
```

```js
// round-01.mjs
import fs from "node:fs/promises";
const ROOT = "/abs/path/00-research";                     // 被测目录
const OUT  = ROOT + "/evidence/ego-20261022";            // 截图落到**本目录自己的** evidence/
await fs.mkdir(OUT, { recursive: true });

const task = await taskSpace("00-research 整页截图 20261022");   // 同名即恢复自己的空间
const page = task.page("p1");

await page.goto("file://" + ROOT + "/index.html");        // Ego 可直接加载 file://（已实测）
await page.waitForLoadState("load");
await page.waitForFunction(                              // 等 JS 渲染完再截（计数是 JS 渲染的）
  () => /条/.test(document.getElementById("count")?.textContent || ""),
  undefined, { timeout: 15000 });
await page.evaluate(() => document.fonts?.ready);         // 自托管字体就绪再截，否则拍到 fallback 字形
await page.waitForTimeout(600);

await page.screenshot({ path: OUT + "/00-research-fold.png" });   // 视口图
console.log(await page.snapshot({ scope: "full_page" }));         // 视口以下的**全文快照**（文字）

await task.finish({ keep: [] });                          // 收尾：关掉 Agent 管理的 Page
```

### 3. Ego 的已知边界（实测，2026-10-22）

| 项 | 实测结论 | 处置 |
|---|---|---|
| `page.screenshot({ fullPage: true })` | ❌ **不支持**，报 `Unable to capture screenshot` | 视口以下内容用 `page.snapshot({ scope: "full_page" })` 取全文；要图像就分段滚动截 |
| `page.screenshot({ path })` | ✅ 可用，路径**必须绝对** | 落盘到本目录 `evidence/`（gitignore + publish excluded） |
| `file://` 加载 | ✅ 标题 / CSS（`body` 背景 `rgb(252,251,249)`、`h1` 52px）/ 5 个自托管字体**全部正常** | 单目录自测可直接用 `file://`；要复现线上子路径行为时仍建议本地服务按子路径挂载 |
| CDP DOM/CSS 域 | ⚠️ **导航后要重新 `DOM.enable` / `CSS.enable`**，否则报 `DOM agent needs to be enabled first` | `goto` 之后再 enable，再 `DOM.getDocument` / `DOM.querySelector` / `CSS.getPlatformFontsForNode` |
| 视口模拟 | ⚠️ 窗口带缩放，`Emulation.setDeviceMetricsOverride` 的 `width` 是设备像素 | 迭代校正 `w = round(w * targetW / innerWidth)` 直到 `innerWidth === targetW`；**先 `goto` 再设 metrics**；`cdp` 后等 300–400ms 再读值 |
| 依赖 | Ego 自带，**无需 npm 依赖** | 本目录 `package.json` 的 `dependencies` / `devDependencies` 均为空 |

### 4. 历史坑（Playwright 时代，2026-10-21 记录，**现行做法以本节 Ego 口径为准**）

| # | 坑 | 处置（历史） |
|---|---|---|
| 1 | `deviceScaleFactor: 2` + `fullPage` → 桌面位图 2880×91176 ≈ **1.05 GB**，渲染进程被 OOM 杀掉 | 整页截图一律用 `deviceScaleFactor: 1`（本目录 6.3 MB/张） |
| 2 | 截图在内容渲染完之前拍 → 拿到空白页 | 等 `count` 出现「条」字（该页是 JS 渲染，134 张卡） |
| 3 | `file://` 与线上子路径行为不一致 | 用子路径挂载的本地服务复核（`/playtime-atlas-20261021/works/00-research-dossier/`）。**现状：Ego 加载 `file://` 已实测样式/字体正常，单目录自测可直接用** |
| 4 | 临时服务 / 浏览器没关 → 留下常驻监听进程 | `task.finish({ keep: [] })` 收尾；本地服务用完即关（**8080 例外**，由用户决定） |
| 5 | 临时服务器对 `.css` / `.woff2` 返回错误 MIME → 样式表被拒收、字体退化 | 本地服务要给正确 MIME；并等 `document.fonts.ready` 再截 |

### 5. 本目录的截图产物

`evidence/ego-20261022/`（2026-10-22 由 Ego 产出，**本目录自己的** `evidence/`，已 gitignore + `publish.scope.exclude`）：

- `00-research-fold.png` —— 桌面视口图（1309×873，0.12 MB；Ego 窗口的 `innerWidth` 为 1309）
- `00-research-390-fold.png` —— 移动视口图（390×844，0.08 MB，`innerWidth` 校正到 390）

改版第 2 步的整页留痕仍在 `evidence/d1-review/`（历史产物，Playwright 时代生成，不重出）。

> 13 若要覆盖首屏以下的 D1 命中：**整页内容是必需的**；Ego 下用 `snapshot({ scope: "full_page" })` 取全文，
> 图像则分段滚动截（`page.screenshot` 不支持 `fullPage`）。另：3× 的元素级特写同样用 `page.screenshot` 逐元素截。

---

## 目录结构

```
00-research/
├── index.html                  ★ entry —— 可浏览案例索引（增量接入 16 设计系统，零外部请求）
├── assets/ds/                  ★ 余晖设计系统（16-design-system 原样副本，492 KiB）
│   ├── tokens.css              --ds-* 令牌层 + :lang(zh) 中文排版修正 + reduced-motion
│   ├── components.css          .ds-topbar / .ds-footer / .ds-skip / .ds-chip / .ds-input …
│   └── fonts/                  5 个自托管 OFL 1.1 woff2 + 5 份许可原文 + fonts.css + FONT-MANIFEST.json
├── cases.json                  ★ 134 条案例总表（结构化，含归属证据与不可见项）
├── RANKING.md                  ★ 分平台排名 + 平台口径 + 合并热度 + 负面对照
├── TOP3.md                     ★ TOP3 原创改编规格（改名/文案/内容/字体/配色/布局/模型形态）
├── DIFF-REFERENCES.md          ★ 对照差异说明（逐项 + 红线 + 自检速查）
├── TASK.md / STATUS.md         任务定义 / 执行状态
├── README.md / CHANGELOG.md    使用说明 / 变更记录
├── ACCEPTANCE.md               验收记录
├── LICENSE.md                  本目录自有内容的许可与来源声明
├── LICENSES.md                 ★ 第三方资源登记册（5 个 OFL 字体 + 设计系统资产 + 参考站非授权声明）
├── manifest.json               交付清单（id,title,description,entry,buildCommand,outputDir,status）
├── package.json                npm 脚本
├── RESTYLE-PLAN.md             ★ 改版待替换清单（文件+选择器+旧值 → 候选 token 路径）
├── i18n/keys.json              ★ zh/en 文案 key 骨架（99 key，仅骨架未接线）
├── i18n/README.md              i18n 接线说明
├── data/case-index.json        索引页精简数据（生成物）
├── build_cases.py              汇总 raw/ → cases.json
├── build_index.py              cases.json → index.html + data/case-index.json
├── gen_ranking.py              cases.json → RANKING.md
├── verify.py                   自检脚本
├── scan_font_stack.py          字体栈顺序独立复扫器（真缺陷 > 0 时退出码 1）
├── make_release_package.py     ★ 发布包生成器（打给 14-publish 的交付包，12 项包级自检）
├── release-package/            ★ 交付包（交 14 统一提交；本包不含 git 写入动作）
│   ├── PAYLOAD/                可静态构建的产物目录（16 文件 / 861 KiB）
│   ├── PACKAGE-MANIFEST.json   清单：入口 / 深链 / 相对发布根路径 / 文件清单 + SHA256 / 自检结论
│   └── INTEGRATION.md          接入说明
├── raw/                        原始证据
│   ├── *.syn.json              53 份 X syndication 原始响应
│   ├── parsed_lead.json        解析后的 X 条目
│   └── platform/               B站 / YouTube 原始响应
├── media/                      13 段原始视频 MP4
├── frames/                     25 张 ffmpeg 抽帧参考图（TOP3 复刻/改编参考）
└── references/mia-100-html/    参考库克隆（★ 无 LICENSE，仅参考不得复制）
```

> ⚠️ **发布注意**：本目录**不再是单文件**。`assets/ds/` 必须随发布包一同拷入（相对 URL，任意子路径可移植），
> 否则线上样式与字体全 404 —— 见 `STATUS.md`「交接给 14-publish 的说明」。

---

## 视觉语言：余晖设计系统（afterglow-ds v1.0.0）

改版第 2 步按 `../16-design-system/MIGRATION-NOTES.md` **增量**接入 16 的设计系统 —— 既有 CSS 全部保留，只把取值重定向到 `--ds-*` 令牌，不推倒重写页面结构。

| 项 | 说明 |
|---|---|
| **令牌层** | `assets/ds/tokens.css`（`--ds-*`，前缀隔离，不与 05-museum-research / 01-web 冲突） |
| **组件层** | `assets/ds/components.css`（`.ds-topbar` / `.ds-footer` / `.ds-skip` / `.ds-chip` / `.ds-input` / `.ds-select` …） |
| **字体** | 自托管 OFL 1.1：Space Grotesk（展示）/ Inter（正文）/ Space Mono（元信息）/ Noto Sans SC 子集（中文渐进增强兜底）。**零 CDN**，许可见 `LICENSES.md`。**字体栈顺序**：拉丁自托管 → **完整系统 CJK 栈**（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC）→ Noto Sans SC 子集 → `-apple-system` / `BlinkMacSystemFont` → `sans-serif` —— 有限子集**不得**排在完整族之前，否则同段汉字会逐字回退、混入两套字形 |
| **强调色** | 朱砂 `--ds-accent` `#B4432B`（**不是**参考站的紫 `#6549F2`） |
| **主题** | **固定浅色**（`<html data-ds-theme="light">`），与 16 的 `preview.html` 默认态一致；深色档未启用，理由见 `STATUS.md` 限制节 |
| **中文排版** | `:lang(zh)` 字距归零（0.08em 正字距也一并复位）、正文行高 **1.85**、标题 **1.22**、`word-break:normal` + `overflow-wrap:anywhere` |
| **可访问性** | `.ds-skip` 跳转链接为首个可聚焦元素；焦点环 2px 强调色 + 2px 偏移，任何状态不移除；触摸目标 ≥24px；表格正文 14px / 表头 12.5px（**密集数据区只提可读性，不压缩信息密度**） |
| **动效** | `prefers-reduced-motion` 降级：过渡时长归 `1ms`，保留 hover 状态表达 |

> **资源路径全部相对**（`assets/ds/...`、`url("./xxx.woff2")`）→ 挂到 `/playtime-atlas-20261021/works/<id>/`、`/exhibits/<id>/` 等任意子路径都成立；页面**运行期零外部请求**。

---

## 索引页能做什么

- **搜索**：标题 / 作者 / 归属证据原文 / 分类，实时过滤
- **筛选**：平台下拉 + 维度 chip（网页 / 3D / 交互 / 动效 / 游戏 / 对比 / Agent）
- **排序**：按平台 / 点赞 / 播放 / 收藏 / 时间
- **每张卡片**显示：平台内名次、归属徽标（正式版 ✅ / Preview ⚠️ / 混合模型 ❌ / 未核实）、**归属原文证据**、平台专属指标、**不可见项**、本地资产路径、核验方式
- **TOP3 卡片**直达参考原帖
- **分平台最高热度表**（仅同平台内比较）
- 顶部**口径声明**常驻

---

## 数据规模

| 平台 | 条目 | 已核验 | 可见指标 | 不可见项 |
|---|---|---|---|---|
| X / Twitter | 55 | **51** | 点赞、回复 | 转发、书签、浏览量、粉丝数 |
| B站 | 19 | 19 | 播放、点赞、收藏、弹幕、评论 | 转发、投币、完播率 |
| YouTube | 31 | 31 | 观看次数 | 点赞、评论数、订阅者增量 |
| GitHub | 10 | 10 | stars、forks、last_push | 克隆数、PR/Issue 参与度 |
| 中文媒体 / 官方案例 | 12 | 12 | 阅读量（多数不可得） | 阅读量、互动量、转发 |
| 官方文档 / 基准 / 案例库 | 6 | 6 | — | 全部互动指标 |
| 小红书 | 1 | **0（登录墙）** | — | 全部指标 |
| **合计** | **134** | **128** | | |

**小红书说明**：已尝试 6 条路径（内置浏览器搜索页 / explore 公开信息流 / 必应 `site:` 检索 / 必应 RSS / 百度 `site:` 检索 / `web_search`）。小红书「搜索」需登录后才返回结果；explore 公开流可读标题与点赞数但不支持按词过滤。任务禁止访问凭据，故**未做登录尝试**，记为不可见项，不做推测填充。

---

## 模型归属规则（最重要）

只有当**作者正文 / 画面水印 / 官方文档明确写出** `M3.1 Flash` 或 `M3.1-Flash` 时才计为 M3.1 Flash。

| 分类 | 处理方式 |
|---|---|
| M3.1 Flash **正式版**（2026-10-19，model id `MiniMax-M3.1-Flash`） | ✅ 计入 |
| **M3.1-Flash-Preview**（2026-09-27） | ⚠️ 单独标注，**不混入**正式版统计 |
| **Space Bunny 匿名期**（官方 2026-10-19 认领为 M3.1 Flash 早期版本） | ⚠️ 单独标注 |
| **M3.1 Flash + H3 混合** | ❌ 单独标注，不计单模型结果 |
| **MiniMax M3 / M2.7 / M2.5 / M2.1 / M2** | ❌ **一律不计入** |
| 端点不可达 / 原帖已删除 | ❌ 三态记为 `null`（未核验），**不推测填充** |

---

## 平台口径：不可横向比较

各平台指标口径不同，**禁止横向相加或直接比较名次**。本项目所有「最高」均限定在**单一平台内**：

- **X**：@nutlope 硬件落地页 — 1416 赞 / 84 回复
- **B站**：渐近自由JJZY《M3.1 Flash 正式发布》— 46,700 播放 / 415 赞 / 93 收藏
- **YouTube**：WorldofAI — 71,963 观看
- **GitHub**：MiaAI-Lab `MiniMax-M3.1-Flash-100-HTML-Files` — 2 star

> **本项目不声称"全网第一"** —— 无可证实依据。

---

## TOP3 与「原创改编」

TOP3 是**机制与质量标尺**，不是待抄的稿子。每个案例都给出**改编规格**：作品名 / 文案 / 内容 / 字体 / 配色 / 布局细节 / 模型形态 **全部另起**。

| # | 参考案例（第三方公开作品） | 覆盖维度 | **改编后作品** |
|---|---|---|---|
| 1 | @nutlope 硬件落地页（X 1416 赞） | 网页 | **NIMBUS·7 桌面气象站** |
| 2 | Ivan Fioravanti WebGPU 海面 + 漂浮相机 | 3D + 交互 | **TIDAL DRIFT 潮汐漂移** |
| 3 | @ItsmeAjayKV MONSTERA STUDY 3D 查看器 | 网页 + 3D + 交互 | **HELIOS SPECIMEN 日轮标本台** |

逐项差异见 `DIFF-REFERENCES.md`（含验收用自检速查表）。

---

## 来源与资产许可

| 来源 | 许可状态 | 使用边界 |
|---|---|---|
| 三个 TOP3 参考作品（X 公开帖） | 作者**未公开源码** | 仅作机制/质量参考 → 必须**独立原创实现** |
| `references/mia-100-html/`（MiaAI-Lab/MiniMax-M3.1-Flash-100-HTML-Files） | **无 LICENSE** → 默认保留所有权利 | **仅可参考结构与提示词，禁止复制文件内容** |
| 三个案例的视觉资产 | 均为 **100% 纯代码生成**（CSS / 程序化几何 / 程序化着色） | 无第三方模型 / 贴图 / 字体 / 音频 → **零授权负担** |
| 抽帧参考图（`frames/`） | 自 X 公开视频下载，仅供内部比对 | 不得作为产物素材直接嵌入 |
| **自托管 OFL 字体 5 个**（`assets/ds/fonts/`） | **SIL Open Font License 1.1**（随包附许可全文） | 可自由使用 / 修改 / 再分发 / 嵌入交付物；**不得单独售卖**；衍生字体不得用保留字体名。**逐项来源 URL / 字节 / 版权声明见 `LICENSES.md` §1** |
| **余晖设计系统 4 个文件**（`assets/ds/`） | 本批同级 `16-design-system` 自有产物 | 原样复制、未修改；随本批统一发布 |
| **参考站 `https://olek.si/`** | 未授权 | **不复制未授权素材**（图片 / 视频 / 字体 / 样式一律不取用）、**不宣称原创参考作品**。本目录的色板是 16 **重新设计**的朱砂 `#B4432B`，**未复制**参考站紫 `#6549F2` —— 详见 `LICENSES.md` §3 |

**红线**：不复制未授权 ROM、商业游戏资源、品牌视觉；不写入凭据；不发布公网；不改动无关仓库。

完整声明见 `LICENSE.md`（本目录自有内容）与 **`LICENSES.md`**（第三方资源登记册 + 参考站非授权声明）。

---

## 已知限制

1. **小红书**数据不可得（登录墙，见上）。
2. **X 转发/书签/浏览量**、**B站转发/投币**、**YouTube 点赞/评论**在公开接口下不可见 —— 已逐条记入 `metrics_invisible`。
3. 3 条 X 帖（M18 / M52 / M54）端点不可达或原帖已删除 —— 记为未核验。
4. 单例成本/耗时数字（如 $0.014、41 分钟）均为**作者自报**，不可外推为普遍结论。
5. 视频内容以抽帧目视复核为准，**未逐帧完整观看**。
6. `references/mia-100-html/` 未做逐文件授权审计，仅按「无 LICENSE = 保留所有权利」从严处理。
7. 第三方基准（Artificial Analysis 等）的分数属**第三方口径**，与 MiniMax 官方口径分开记录，不混用。

### 改版相关（2026-10-21 改版第 1–2 步）

8. ~~**参考站未取证**~~ → **已由 16 解决**：16 于 **2026-10-21 19:30** 完成对 `https://olek.si/` 的取证（`REFERENCE-AUDIT.md`，逐条标注直接观察 / 二手证据 / 推测）。**颜色、字体、字号、圆角、缓动曲线与命名全部是 16 的自有设计**，与参考站取值不同 → 本目录**不引用任何「参考站原值」**。
9. ~~**`RESTYLE-PLAN.md` 的 token 路径是本批自定**~~ → **已对齐 16 的真实 `--ds-*` 键名**，取值抄自 `design-tokens.json` / `src/tokens.css`。
10. **页面仍为纯中文站**：i18n 仅有 key 骨架（`i18n/keys.json`，99 key）**未接入** —— 接线会同时改动 134 条案例的**数据层文案**（需 19/14 统一方案），故改版第 2 步**只做视觉语言统一，不切语言、不改文案**；`<html lang="zh-CN">` 正确。`prefers-reduced-motion` 降级与 `:focus-visible` 焦点环**已在第 1、2 步落地**。
11. **深色主题未启用**（本批取舍）：16 令牌**未给** `--ds-success`/`--ds-warning`/`--ds-danger` 定义深色档，跟随系统会让状态胶囊对比度掉到 ≈3.5:1（§5 要求 ≥4.5），而 §0 风险 B 不允许就地重定义 `--ds-*` 取值 → 本页**固定浅色**（`<html data-ds-theme="light">`，与 16 `preview.html` 默认态一致），**不提供主题切换**。
12. **工具栏背景模糊 10px 为本批自定**：16 令牌中**不存在** `--ds-blur`（只有 `--ds-rail-blur` / `--ds-entry-blur`）。
13. **中文字体子集覆盖有限**：`noto-sans-sc-subset.woff2` 由 07-museum-art 按其自身用字生成，**非全站汉字全集**，正确定位是**渐进增强兜底**（只有前面的完整系统 CJK 栈全部不可用时才生效）。**已修正其排序**：此前它排在系统栈之前，会导致同段汉字混入两套字形（基线错位）—— 22:4x 已换序并加护栏。即便极端环境下回退到子集也**不缺字**，只是字形略有差异。见 `LICENSES.md` §1.4–§1.5。
14. **`.ev` 行高提到 1.85 后每行字数变少**（中文正文行高按 §5 取值）：`fitEvidence()` 自动重算截断点，干净截断 23–29 处。属**可读性 vs 密度**的显式取舍。
15. **D1 复核已闭环**：18:41 版检测器曾在本页报 桌面 4 / 移动 9 对「文字重叠」，根因是 `.ev` 按像素裁剪导致**行中切割**（真实缺陷）→ 已改为按行截断，**双口径均为 0 对**；13 已于 20:04 更新检测器。**改版第 2 步后复测仍为 0/0（两口径 × 四视口）**，未用 `z-index` / `transform` 掩盖。详见 `STATUS.md`「D1 复核结论」。
16. **`assets/ds/` 未改为站点根共享**：本目录采用**作品内自包含副本**（相对 URL → 任意子路径可移植）。若 14-publish 决定共享，需同步改 `index.html` 的三个 `<link>` 并保证作品路径与站点根**两份都有**（否则 404）。见 `STATUS.md` 交接节。

---

## 交接

- ⭐ **发布包已备好**（2026-10-22 00:1x）：`release-package/` = `PAYLOAD/`（可静态构建的产物目录）+ `PACKAGE-MANIFEST.json`（清单）+ `INTEGRATION.md`（接入说明）。
  - 入口 `PAYLOAD/index.html`（别名 `PAYLOAD/case-index.html`，与主入口逐字相同）
  - 建议深链 `works/00-research-dossier/` → `https://kingkazmax.github.io/playtime-atlas-20261021/works/00-research-dossier/`
  - 相对发布根路径同上；**本包不含 git 写入动作，请 14 统一提交**
  - 重打包：`npm run package`（12 项包级自检，退出码 0 = 全过）
- 静态入口 `index.html`，`buildCommand` = `npm run build`，`outputDir` = `./`。
- ⚠️ **本目录不再是单文件**：`assets/ds/`（492 KiB）必须随发布包一同拷入，否则线上样式与字体全 404（16 记录的 06-museum-core 历史缺陷）。发布前请按 `MIGRATION-NOTES` §6 逐条 `curl` 期望 200。
- 本任务**不自行发布**；用户已授权本批成果发布到其已登录 GitHub 并在线体验，由同级 `14-publish` 统一集成与部署。
- 产物内**不含** token、凭据、日志、`.env` 或其他项目文件；本任务只写 `00-research/`。
- 并行任务可先读 `TOP3.md`（规格）与 `DIFF-REFERENCES.md`（差异红线）；第三方素材边界见 `LICENSES.md`。
