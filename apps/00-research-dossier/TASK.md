# TASK.md · 00-research · MiniMax M3.1 Flash 全球公开案例检索

> 所属批次：`output/flash-showcase-20261021/`
> 上级指令：`../MASTER-UPDATE.md`（优先级高于本任务原始提示词）
> 执行模型：MiniMax Code · MiniMax-M3.1-Flash · effort=max
> 本任务只写 `00-research/` 目录；对同级 `01-04` 成果只读。

---

## 1. 目标（按 MASTER-UPDATE 口径重述）

1. 用联网检索建立 **MiniMax M3.1 Flash 全球公开案例库**，覆盖中文/英文、X、B站、小红书、GitHub、YouTube、官方案例。
2. 每条案例记录：原作者、直达 URL、发布时间、**模型归属原文证据**、平台互动指标、观测时间、**不可见项**。
3. 选出证据充分、视觉/交互优秀、可本地实现的 **TOP3**，供 `01-web` / `02-model` / `03-interaction` / `04-spaceflight` 并行实现。
4. **不是完全一致复刻** —— 参考公开作品的机制与质量，但必须重新设计**作品名、文案、内容、字体、配色、布局细节、模型形态**。保留来源与差异说明，不声称参考作品为原创。
5. 交付 `TASK.md`、`STATUS.md`、`README.md`、`CHANGELOG.md`、`manifest.json`、验收记录、来源与资产许可说明；产物须**可静态构建**，由 `14-publish` 统一集成到用户 GitHub + Pages。

## 2. 范围界定

| 项 | 内容 |
|---|---|
| 归属口径 | 仅当作者正文 / 画面水印 / 官方文档明确写出 `M3.1 Flash` / `M3.1-Flash` 时才计为 M3.1 Flash。`M3`、`M2.7`、`M2.5` **不得混入**；`Space Bunny` 匿名期（MiniMax 已于 2026-10-19 官方认领为其早期版本）**单独标注**；`M3.1-Flash-Preview`（2026-09-27）与正式版（2026-10-19）**分行标注** |
| 指标口径 | 各平台指标口径不同，**禁止横向相加/直接比较**；所有"最高"仅限定在单一平台内。**不声称"全网第一"** |
| 红线 | 不复制未授权 ROM / 商业游戏资源 / 品牌视觉；不访问凭据；不发布公网；不改动无关仓库；不另建仓库 |
| 参考资产 | `references/mia-100-html/` 克隆自 `MiaAI-Lab/MiniMax-M3.1-Flash-100-HTML-Files`，**该仓库无 LICENSE** → 仅作结构与提示词参考，**不得复制文件内容** |

## 3. 执行步骤（实际已完成 / 待办）

| # | 步骤 | 状态 |
|---|---|---|
| 1 | 核验模型本体：正式版/Preview 发布日、model id、价格、参数、官方认领 | ✅ |
| 2 | 线索文件 `research/minimax-public-cases.json`（55 条）**仅作线索**，逐条实时核验 | ✅ 51/55 核验通过，4 条删除/不可达已标注 |
| 3 | 补充平台检索：B站 / YouTube / GitHub / 小红书 / 中文媒体 / 官方基准站 | ✅ 6 平台有数据，小红书为登录墙已记录 |
| 4 | 媒体下载 + ffmpeg 抽帧目视复核，用于判断视觉质量 | ✅ 13 段视频 / 25 张抽帧 |
| 5 | 汇总 `cases.json`（统一 schema、含证据与不可见项） | ✅ 134 条 |
| 6 | `RANKING.md`（分平台排名 + 平台口径说明 + 合并热度） | ✅ |
| 7 | `TOP3.md`（含**原创改编规格**：改名/文案/字体/配色/布局/模型形态） | ✅ |
| 8 | 可浏览本地案例索引 `index.html`（静态可构建，原创设计） | ✅ |
| 9 | `DIFF-REFERENCES.md` 对照差异说明 + `CHANGELOG.md` + `README.md` + `manifest.json` + `ACCEPTANCE.md` | ✅ |
| 10 | 自检：归属完整性 / M2.7-M3 隔离 / 平台口径 / 构建可复现 | ✅ |

## 4. 交付物清单

| 文件 | 说明 |
|---|---|
| `cases.json` | 134 条案例结构化总表（meta + cases），每条含归属证据、指标、不可见项、观测时间 |
| `RANKING.md` | 分平台排名、平台口径与不可比性说明、合并热度榜 |
| `TOP3.md` | 三个入选案例的完整实现规格 + **原创改编差异化清单** + 备选案例 |
| `DIFF-REFERENCES.md` | 逐项对照差异说明（名称/文案/内容/字体/配色/布局/模型形态/交互） |
| `index.html` | 可浏览的本地案例索引（`entry`），静态可构建 |
| `data/case-index.json` | 索引页数据（由 `cases.json` 生成） |
| `TASK.md` / `STATUS.md` | 任务定义与执行状态 |
| `README.md` | 使用说明、构建命令、来源与资产许可、限制说明 |
| `CHANGELOG.md` | 变更记录 |
| `ACCEPTANCE.md` | 验收记录（逐条检查结果） |
| `manifest.json` | 交付清单（id,title,description,entry,buildCommand,outputDir,status） |
| `raw/` | 原始证据：53 份 X syndication JSON、平台原始响应、13 段原始视频、25 张抽帧 |
| `references/mia-100-html/` | 克隆的参考库（**无 LICENSE，仅参考**） |

## 5. 验收标准

- [x] 候选 ≥ 20 条 → 实际 **134 条**
- [x] 每条含原作者 / 直达 URL / 发布时间 / 归属原文证据 / 指标 / 观测时间 / 不可见项
- [x] 未把 M3 / M2.7 计入 M3.1 Flash；Preview 与正式版分行标注
- [x] 未声称"全网第一"；平台数据分别比较
- [x] TOP3 覆盖网页 / 3D / 交互，且每条含复刻参考、结构、关键交互、资产许可、验收清单
- [x] **TOP3 含原创改编规格**（改名 / 文案 / 内容 / 字体 / 配色 / 布局 / 模型形态）与对照差异说明
- [x] 产物可静态构建，不含凭据 / 日志 / 私有文件
- [x] 只写 `00-research/`，未改动同级目录
