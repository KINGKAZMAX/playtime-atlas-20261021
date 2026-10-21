# STATUS.md · 00-research

**最后更新**：2026-10-21（Asia/Taipei）
**执行模型**：MiniMax Code · MiniMax-M3.1-Flash · effort=max
**状态**：✅ 本任务范围内全部完成，产物可交 `14-publish` 静态集成

---

## 一句话

MiniMax M3.1 Flash 全球公开案例库已建成：**134 条**案例、6 个平台有可核验数据、**1 个平台（小红书）为登录墙已如实记录**；TOP3 三个案例（网页 / 3D / 交互）证据充分，且已转为**原创改编规格**（改名·文案·字体·配色·布局·模型形态全改），配套对照差异说明、CHANGELOG、构建命令与 manifest.json。

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
| 10 | `index.html`（可浏览索引） | ✅ | 静态可构建，零外部依赖 |
| 11 | `README.md` / `CHANGELOG.md` / `ACCEPTANCE.md` / `manifest.json` | ✅ | — |
| 12 | 自检 | ✅ | 见 `ACCEPTANCE.md` |

## 关键发现（供并行任务直接用）

1. **TOP3**（均为正式版 M3.1 Flash 作品，**不是复刻而是原创改编**）：
   - **TOP1 网页** — @nutlope 硬件落地页（X 1416 赞 / 84 回复，$0.014 vs Opus $1.22）→ 改编为 **「NIMBUS-7 桌面气象站」**
   - **TOP2 3D+交互** — Ivan Fioravanti WebGPU 写实水面 + 漂浮相机（提示词公开）→ 改编为 **「TIDAL DRIFT 潮汐漂移」**
   - **TOP3 交互界面** — @ItsmeAjayKV MONSTERA STUDY 3D 查看器（one-shot 带完整控制条）→ 改编为 **「HELIOS SPECIMEN 日轮标本台」**
2. **隐藏金矿**：`MiaAI-Lab/MiniMax-M3.1-Flash-100-HTML-Files` —— **100 个单文件 HTML 研究**，每个配完整原始提示词（`.txt` 含 TITLE/PROMPT/DESCRIPTION/MAJOR VISUAL TECHNIQUES/INTENDED INTERACTION MODEL）。实测：**0 个外部资源引用、0 个 CDN**，全部自包含。已克隆到 `references/mia-100-html/`（**无 LICENSE，仅参考不得复制**）。
3. **可浏览双盲图库**：`https://gallery.arenaofbias.icu/` —— 收录各模型可运行前端作品 + 截图 + 提示词，支持并排对比与匿名盲评。
4. **最强负面对照**：B站《DeepSeekV4.1 Flash 1017｜屎山考核》158,244 播放 / 5,304 赞 / 2,068 评论 —— 同赛制基线，评估 M3.1 Flash 相对水平时最佳参照物。
5. **社区负面共识**（务必知情再选型）：幻觉率高（AA 口径 93%）、交互/stateful 程序易翻车（3D 赛车黑屏、鹈鹕骑车 SVG 残影、浏览器桌面漆黑）——**强视觉 + 弱状态机**是本模型的稳定画像。

## 未完成 / 阻塞

| 项 | 状态 | 原因 |
|---|---|---|
| 小红书具体笔记数据 | ❌ 不可得 | 平台登录墙；任务禁止访问凭据 |
| X 转发数 / 书签数 / 浏览量 | ❌ 不可见 | 公开 syndication 端点不返回；未使用需授权的 X API |
| B站转发 / 投币 | ❌ 不可见 | 公开搜索接口不返回 |
| YouTube 点赞 / 评论 | ❌ 不可见 | 搜索结果页 `ytInitialData` 不含 |
| 3 条不可达 X 帖（M18/M52/M54） | ❌ 不可得 | 已删除或受保护 |

以上均为**平台侧不可见项**，已在 `cases.json` 的 `metrics_invisible` 与 `verification.status` 中逐条标注，不做推测填充。

## 交接给 `14-publish` 的说明

- 静态入口：`index.html`（`entry`），纯静态、零外部请求、零构建依赖（另有可选 `npm run build` 重建数据）。
- `data/case-index.json` 为生成物；若并行任务新增案例，重跑 `npm run build` 即可。
- 产物内**不含** token、凭据、日志、`.env` 或其他项目文件。
- 本任务**不自行发布**，统一由 `14-publish` 推送与部署。
