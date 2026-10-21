# Task 00 · MiniMax M3.1 Flash 全球公开案例索引

> **批次**：`output/flash-showcase-20261021/` ｜ **任务**：00-research
> **执行模型**：MiniMax Code · MiniMax-M3.1-Flash · effort=max
> **观测时间**：2026-10-21（所有平台指标为该时刻快照）
> **上级指令**：`../MASTER-UPDATE.md` — 本任务产出为**原创改编**的规格与索引，**不是完全一致复刻**

一个可离线浏览的 **MiniMax M3.1 Flash 全球公开案例库**（134 条，逐条核验），外加覆盖 **网页 / 3D / 交互** 的 TOP3 **原创改编规格**与逐项对照差异说明。

---

## 快速开始

```bash
# 方式 A —— 直接打开（零依赖，file:// 即可）
open index.html

# 方式 B —— 本地静态服务
npm run serve            # → http://localhost:8080/index.html

# 方式 C —— 重建全部生成物
npm run build            # = build_cases.py → build_index.py → gen_ranking.py

# 方式 D —— 自检（58+ 项检查，含归属隔离与确定性构建）
npm run verify
```

> `npm` 仅为脚本包装；**实际依赖为零** —— 三个构建脚本只需 Python 3.8+，`index.html` 无任何外部请求。

---

## 目录结构

```
00-research/
├── index.html                  ★ entry —— 可浏览案例索引（自包含，零外部请求）
├── cases.json                  ★ 134 条案例总表（结构化，含归属证据与不可见项）
├── RANKING.md                  ★ 分平台排名 + 平台口径 + 合并热度 + 负面对照
├── TOP3.md                     ★ TOP3 原创改编规格（改名/文案/内容/字体/配色/布局/模型形态）
├── DIFF-REFERENCES.md          ★ 对照差异说明（逐项 + 红线 + 自检速查）
├── TASK.md / STATUS.md         任务定义 / 执行状态
├── README.md / CHANGELOG.md    使用说明 / 变更记录
├── ACCEPTANCE.md               验收记录
├── LICENSE.md                  许可与来源声明
├── manifest.json               交付清单（id,title,description,entry,buildCommand,outputDir,status）
├── package.json                npm 脚本
├── data/case-index.json        索引页精简数据（生成物）
├── build_cases.py              汇总 raw/ → cases.json
├── build_index.py              cases.json → index.html + data/case-index.json
├── gen_ranking.py              cases.json → RANKING.md
├── verify.py                   自检脚本
├── raw/                        原始证据
│   ├── *.syn.json              53 份 X syndication 原始响应
│   ├── parsed_lead.json        解析后的 X 条目
│   └── platform/               B站 / YouTube 原始响应
├── media/                      13 段原始视频 MP4
├── frames/                     25 张 ffmpeg 抽帧参考图（TOP3 复刻/改编参考）
└── references/mia-100-html/    参考库克隆（★ 无 LICENSE，仅参考不得复制）
```

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

**红线**：不复制未授权 ROM、商业游戏资源、品牌视觉；不写入凭据；不发布公网；不改动无关仓库。

完整声明见 `LICENSE.md`。

---

## 已知限制

1. **小红书**数据不可得（登录墙，见上）。
2. **X 转发/书签/浏览量**、**B站转发/投币**、**YouTube 点赞/评论**在公开接口下不可见 —— 已逐条记入 `metrics_invisible`。
3. 3 条 X 帖（M18 / M52 / M54）端点不可达或原帖已删除 —— 记为未核验。
4. 单例成本/耗时数字（如 $0.014、41 分钟）均为**作者自报**，不可外推为普遍结论。
5. 视频内容以抽帧目视复核为准，**未逐帧完整观看**。
6. `references/mia-100-html/` 未做逐文件授权审计，仅按「无 LICENSE = 保留所有权利」从严处理。
7. 第三方基准（Artificial Analysis 等）的分数属**第三方口径**，与 MiniMax 官方口径分开记录，不混用。

---

## 交接

- 静态入口 `index.html`，`buildCommand` = `npm run build`，`outputDir` = `./`。
- 本任务**不自行发布**；用户已授权本批成果发布到其已登录 GitHub 并在线体验，由同级 `14-publish` 统一集成与部署。
- 产物内**不含** token、凭据、日志、`.env` 或其他项目文件；本任务只写 `00-research/`。
- 并行任务可先读 `TOP3.md`（规格）与 `DIFF-REFERENCES.md`（差异红线）。
