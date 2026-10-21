# STATUS · 06-museum-core 回响电玩馆 / PLAYTIME ATLAS

> 最后更新：2026-10-21 · 执行者 MiniMax Code M3.1-Flash / max
> 本文件为持续更新的进度记录；状态只反映**实际发生**的工作。

---

## 当前状态：🟡 构建中 → 交付前验收

## 里程碑

| # | 里程碑 | 状态 | 证据 |
|---|---|---|---|
| M1 | 读取 PROMPT.md / MASTER-UPDATE.md，确认边界 | ✅ | 已读；仅写 06 目录，同级只读 |
| M2 | 勘察兄弟任务契约（05/07/08–12/13/14 的 PROMPT） | ✅ | 已读全部 PROMPT，锁定字段与目录契约 |
| M3 | 确认工具链 | ✅ | Node v24.13.0、npm 11.6.2、registry=npmmirror 可达 |
| M4 | TASK.md / STATUS.md | ✅ | 本目录 |
| M5 | Vite 工程骨架（端口 4326） | ⬜ | — |
| M6 | 原创 SVG 美术包生成器 | ⬜ | — |
| M7 | 本地初版策展集（10 年代 / ≥70 条 / 逐条来源） | ⬜ | — |
| M8 | 来源标题可解析性校验 | ⬜ | — |
| M9 | 核心应用（路由/检索/筛选/收藏/详情来源） | ⬜ | — |
| M10 | 时间长廊 + 年代展厅 + 2D 无障碍目录 + 收藏页 | ⬜ | — |
| M11 | 可选 3D 展厅（原创体块 + 降级） | ⬜ | — |
| M12 | 同步脚本（05/07/08–12） | ⬜ | — |
| M13 | 单元测试 + 构建 + 浏览器实测（桌面/移动） | ⬜ | — |
| M14 | README / ACCEPTANCE / SOURCES / LICENSES / manifest.json | ⬜ | — |

## 已知阻塞与限制（截至当前）

- **05-museum-research 未交付**：策展目录 `catalog.json` 尚不存在 → 本目录自建**本地初版策展集**兜底，
  运行时优先读 `public/data/catalog.json`（05 同步进来后自动切换），UI 顶部标注数据来源状态。
- **07-museum-art 未交付**：美术包 / `design-tokens.json` 尚不存在 → 本目录自建**程序化原创 SVG 美术包**兜底，
  同步后自动覆盖 `public/art/` 与 CSS 变量。
- **08–12 小游戏未交付**：`public/exhibits/` 目前为空 → 五个可玩展项标记 `pending`，
  UI 渲染**明确的待集成占位**，不提供假入口。
- **13-qa-curation** 未交付 → 本任务自建验收记录（ACCEPTANCE.md），不代替 13 的独立审计。

## 与 14-publish 的对接约定

- 构建命令：`npm run build`（工作目录 `06-museum-core`）
- 产物目录：`dist/`（`base: './'`，可直接作为 Pages 根或子路径）
- 集成清单：`public/data/exhibits.json`（同步脚本生成，含每个小游戏的状态与入口路径）
- 约定：`14` 只**复制**本目录 `dist/` 与 `public/data/`，不修改本目录源文件

## 变更日志

- 2026-10-21：建立 TASK.md / STATUS.md，锁定数据与美术契约，确认 05/07/08–12 缺口与兜底方案。
