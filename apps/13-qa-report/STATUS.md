# STATUS — 13-qa-curation

> 最后更新：2026-10-21 17:15 (Asia/Taipei)
> 执行者：MiniMax Code M3.1-Flash / max

---

## 当前阶段

**阶段 3 / 4：浏览器实测 + 增量回访** — 进行中

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| 1 | 清点产物 + 写验收清单 | ✅ 完成 |
| 2 | 搭可执行 QA harness | ✅ 完成 |
| 3 | 浏览器实测已交付成品 | 🔄 持续（产物陆续到位，每轮重新验收） |
| 4 | 差异 / 许可审计 + 矩阵 + 交接 | 🔄 进行中 |

---

## 已完成

- ✅ 读取 `PROMPT.md` / `MASTER-UPDATE.md` / `DISPATCH.md`，确认只读边界。
- ✅ 读取 05—14 全部 `PROMPT.md`，据此反推每件作品的**专属**验收项（08 的键盘焦点门控、11 的 AI 对手标注、12 的 WebAudio 与 VR 声明诚实性、05 的 ≥70 条来源要求）。
- ✅ `TASK.md`：9 个交付单元、D1—D12 维度、严重级别表、完成定义。
- ✅ `QA-CHECKLIST.md`：13 个任务 × D1—D12 的逐项勾选表 + 「解除 not-delivered 所需条件」。
- ✅ `qa-harness/`：可执行 Playwright 验收方案（见其 README）。
  - `lib/static-server.mjs` —— 可挂载前缀的静态服务器，复现 GitHub Pages 子路径形态
  - `lib/build.mjs` —— 在临时副本构建，**绝不写入实现者目录**
  - `lib/readiness.mjs` —— 就绪闸门（区分「坏了」与「还在写」）
  - `lib/checks.mjs` —— D1—D8 通用检查
  - `lib/probes.mjs` —— 02/04 专属探针
  - `lib/probes-era.mjs` —— 展厅通用探针（自适应控件文案 + 焦点作用域两段对照）
  - `run-qa.mjs` / `build-reports.mjs`
- ✅ 逐件静态审计：00（134 条案例逐条校验）、02（IP 引用检索）、04（IP 引用检索、交付物核对）、05、06。
- ✅ `DIFF-AUDIT.md`：8 项判定口径 × 逐件结论。
- ✅ `README.md`（本任务说明与结论速览）、`DIFF-AUDIT.md`、`qa-harness/README.md`。

## 进行中

- 🔄 第 2 轮全量浏览器实测（12 个目标）。
- 🔄 `QA-MATRIX.md` / `issues.json` / `HANDOFF-14.md` 生成。

## 阻塞

- ⛔ `03-interaction` 仍无 `index.html`（刚出现 `SOURCE.md` / `public/` / `scripts/`，施工中）。
- ⛔ `05-museum-research` 缺 `catalog.json`（已有 `REFERENCE-DESIGN.md` 与 4 个 `data/curated/part*.json`，正在合并）。
- ⛔ `07-museum-art` 缺 `index.html`（已有 728 个文件的资产包）。
- ⚠️ 批次整体缺 `README.md` / `manifest.json`（除 00、06 外均未提供），14-publish 的 manifest 驱动集成会受阻。

---

## 关键判定记录

| 判定 | 依据 |
| --- | --- |
| 缺失文件 ≠ 通过 | PROMPT.md 明确要求；记为 `not-delivered` / `in-progress` / `unverified` |
| 研究类任务按文档产物验收 | 00/05 无可运行页面时验文件级交付物，矩阵标注 `doc-only` |
| 键盘只在聚焦时生效 | 08 号任务硬性要求 → 升级为**全批次通用 D5**，并做「未聚焦不响应 / 聚焦后响应」两段对照 |
| 布局溢出要区分「被祖先裁切」与「撑破页面」 | marquee / 轮播里 `overflow:hidden` 的内容是设计；**页面级** `scrollWidth > clientWidth` 才是缺陷 |
| 探针自己发起的请求不计 D7 | 否则会把验收行为误判成产品缺陷 |
| 导出功能要轮询等待 | 548 网格的 GLTFExporter 需数秒，固定 sleep 会误报失败 |

## 已确认的实质缺陷（截至 17:15）

| 级别 | 作品 | 问题 |
| --- | --- | --- |
| **blocker** | 04-spaceflight | `makeRingTexture()` 引用未定义的 `data` → 游戏完全无法启动 |
| **critical** | 04-spaceflight | STATUS.md 声称 README/QA/截图/实机验证均已完成，实际**全部不存在**，且游戏跑不起来 |
| major | 02-model | 随包 `models/*.glb` 未进入构建产物 → 部署后 404 |
| major | 02-model | 使用《沙丘》专有地名 Arrakis，且无任何差异说明文件 |
| major | 02-model | 缺 README.md / manifest.json |
| major | 02-model | 移动端 30 处文字被压成逐字换行；注释标签被视口裁切 |
| major | 04-spaceflight | 全局 `preventDefault('Tab')` + Tab 改绑星图 → 键盘不可达 |
| major | 06-museum-core | 运行时 `fetch('data/catalog.json')` 必定 404（功能有回退） |
| major | 06-museum-core | 移动端 `.topnav` 撑破视口 → 整页横向滚动 121px |
| minor | 00-research | manifest 声明的 `ACCEPTANCE.md` 不存在；未声明 favicon |

## 通过情况

| 作品 | 结论 |
| --- | --- |
| 00-research | ✅ pass（134 条案例逐条校验：0 缺字段 / 0 非法 URL / 0 无证据署名 / 8 条正确排除出 M3.1 归属） |
| 01-web | ✅ pass-with-warnings（warnings 经复核为 marquee 滚动条设计，非缺陷） |
| 11-era-online | ✅ pass（零 console error、零 404、子路径全通、197 个可聚焦元素） |
| 06-museum-core | ❌ fail（2 个 major） |
| 02-model | ❌ fail（3 个 major） |
| 04-spaceflight | ❌ fail（1 blocker + 1 critical + 1 major） |

---

*每轮实测结果写入 `evidence/`，报告由 `qa-harness/build-reports.mjs` 从原始数据生成，可随时重跑复现。*
