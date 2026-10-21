# STATUS — 05 游戏博物馆联网策展研究

**最后更新**：2026-10-21（UTC+8）
**当前阶段**：S5 目录生成与验收（资料抓取已完成）

---

## 1. 交付状态

| 交付物 | 状态 | 说明 |
| --- | --- | --- |
| `TASK.md` | ✅ 完成 | 任务定义、字段要求、验收标准 |
| `STATUS.md` | ✅ 完成 | 本文件 |
| `README.md` | ✅ 完成 | 资料总览、字段说明、使用方式、限制声明 |
| `catalog.json` | ✅ 完成 | 140 条，含 10 个必需字段 + 扩展字段 |
| `catalog.meta.json` | ✅ 完成 | 年代词表、统计、字段说明、限制 |
| `SOURCES.md` | ✅ 完成 | 逐条来源台账（每条一行的可点击来源） |
| `REFERENCE-DESIGN.md` | ✅ 完成 | 14 个参考馆的横向比较 + 给 06/07 的落地建议 |
| `LICENSES.md` | ✅ 完成 | 引用与素材许可边界 |
| `QA.md` | ✅ 完成 | 实际跑过的检查与结果 |
| `manifest.json` | ✅ 完成 | id / title / description / entry / buildCommand / outputDir / status |
| `handoff/first-20.json` | ✅ 完成 | 给 06 的首批 20 条 |
| `handoff/INTEGRATION.md` | ✅ 完成 | 给 06 的接法与边界 |
| `screenshots/` | ✅ 完成 | 13 张实机截图 + `INDEX.tsv`（1 站因 TLS 限制无截图） |
| `scripts/` | ✅ 完成 | 7 个可复现脚本 |
| `data/` | ✅ 完成 | 原始抓取数据全部落盘，可离线复核 |

---

## 2. 阶段记录

### S1 立项与契约对齐 ✅
- 读取 `PROMPT.md` 与 `MASTER-UPDATE.md`。
- 读取 06 / 07 / 08 / 09 / 13 / 14 的 `PROMPT.md`，对齐下游消费方式：
  - 06 需要 `catalog` + 07 美术包 + 08—12 小游戏，本任务只供资料；
  - 07 需要"可程序化生成、许可清晰"的配图方向；
  - 13 需要"来源与许可可审计"；
  - 14 需要"可直接发布、无需构建"的目录。
- 确认年代分档口径与 06 的"至少 7 个时代"对齐为 7 个 era。

### S2 参考站联网调研 ✅
- 用 `web_search` + 站点自身链接结构定位真实站点（`museumofplay.org/games/video-game-history-timeline` 实为 404，
  正确路径为 `museumofplay.org/video-game-history-timeline/`，已纠正）。
- 逐站抓条款页原文，得到**可引用的许可证据**（The Strong 的 CC 非商用条款与 logo 禁令、
  NVM UK 的 "All rights reserved"、VGHF 的版权行、EmulationNation 的 CC BY-SA 声明等）。
- 14 个站点全部实测可达并写入 `REFERENCE-DESIGN.md`。

### S3 截图取证 ✅
- 内置 Browser 的 `screenshot` 在本环境返回纯白图（Electron 合成面问题，内容本身可 `query` 读出），
  改用**本机 headless Chrome**（`--headless=new --screenshot`）取得真实页面快照。
- 13 张成功；`videogamehistory.org` 因 TLS 握手被网关中断无图（正文抓取成功，仍作为参考站收录）。

### S4 目录事实抓取与自动核对 ✅
- 种子：人工选定 **140** 条（48 硬件 / 92 作品），覆盖 7 个时代。
- 抓取：MediaWiki API 批量取 lead 摘要 + 解析 infobox 的 `released` / `platforms` / `developer`。
- 核对：年份是否出现在正文，并与 infobox 年份交叉比对。
- **踩过的坑（已修复）**：
  1. 6 路并发触发 Wikipedia **429 限流**（122/140 失败）→ 改为全批量 + 429 指数退避。
  2. `rvlimit=max` 触发 continuation 导致 wikitext 为空 → 去掉该参数。
  3. 重定向映射 from/to **写反**，导致 15 条被误判为 missing → 纠正后恢复。
  4. infobox 正则用了 `[^\n]*?`（不跨行）**永远匹配不到**多行 infobox → 改为 `.*?` 配合 `\n\}\}` 锚点。
  5. 首次 `resolve_titles.py` 打分过松，把 "Little Computer Program" 误配到 "Little Computer People" →
     改为**硬门槛**（正文必须含年份 + 必须有区分性词元交集 + 排除 disambiguation），并**逐条人工确认**后才写回。

### S5 目录生成与验收 ✅
- `scripts/build_catalog.py` 合并四类输入 → `catalog.json` / `catalog.meta.json` / `SOURCES.md` / `handoff/`。
- 交付首批 **20 条** 给 06（`handoff/first-20.json` + `first-20-ids.json` + `INTEGRATION.md`）。
- `QA.md` 记录实际跑过的检查与结果。

---

## 3. 关键决策

| 决策 | 理由 |
| --- | --- |
| 年代分 7 档（`origins`→`modern`）而非 8 档 | 与 06 的"至少 7 个时代展厅"对齐；`mobile` 单列 2010–2014 以承接 3DS/Vita/PS4 一代 |
| 硬件与作品**分开成 `kind` 字段**而非混排 | 06 需要"硬件展柜"与"游戏展柜"两条独立动线 |
| `titleZh` 由本项目自拟，标注"非官方译名" | 避免与官方译名混淆，也避免直接复制第三方翻译 |
| `summary` / `significance` 全部人工撰写 | 任务要求"不声称原创参考作品"且"重新设计文案"；机器摘要会带模板腔 |
| `imageLicense` 记录**状态**而非直接取图 | 多数参考站与游戏画面为 ARR；主站应程序化生成配图 |
| 参考站截图**不随包再分发** | 许可为 ARR / CC-NC；`LICENSES.md` §3 明确说明并建议 14 改为"文字表格 + 外链" |
| `platform` / `creator` 保持自由文本 | 策展可读性优先；分面筛选需求由 06 侧映射表解决，避免数据源抖动 |

---

## 4. 限制与阻塞（如实记录）

| 项 | 状态 | 影响 |
| --- | --- | --- |
| `nintendo-museum.jp` / `emudocs.org` / `emulatorhome.com` | **网络不可达**（TLS 握手被网关中断，多重重试与 `web_fetch` 均失败） | 未纳入参考站比较，**不写其交互/美术/许可**以免编造 |
| `videogamehistory.org` 截图 | 0 字节（同为 TLS 限制） | 正文已抓取，仍作为第 10 个参考站收录；`REFERENCE-DESIGN.md` 已注明截图缺失 |
| `old-computers.com` 截图 | 0 字节（站点本身处于 "en construction"） | 列为第 14 站但**不作为事实来源** |
| `mobygames.com` / `giantbomb.com` / `uvlist.net` | Cloudflare 403 | 未纳入 |
| 少数条目机器核对为 `review` | 已人工复核并在 `QA.md` 列出 | 建议 06 对这些条目不显示"已核验"角标 |
| 早期硬件条目的年份表述 | 个别条目正文写的是机构年份而非发行年 | 已在 `catalog.json` 的 `verification` 字段保留机器核对原值，便于追溯 |

---

## 5. 复现方式

```bash
python3 scripts/fetch_sources.py         # 抓 lead + infobox + 自动核对 → data/
python3 scripts/resolve_titles.py        # 校正错误的条目名（需人工确认后 --apply）
python3 scripts/fetch_image_licenses.py  # 查 Commons 首图许可
python3 scripts/build_catalog.py         # 合并生成 catalog.json / SOURCES.md / handoff/
python3 scripts/check_licenses.py        # 扫描参考站条款页许可关键词
./scripts/capture_refs.sh                # headless Chrome 抓参考站截图
```

抓取使用自定义 `User-Agent` 与 `Api-User-Agent` 头，批量请求并做 429 指数退避；原始响应落盘可离线复核。

---

## 6. 后续交接

- **06**：直接读 `handoff/first-20.json`；需要全量时读 `catalog.json`；接口问题见 `handoff/INTEGRATION.md` §6。
- **07**：配图方向与许可边界见 `LICENSES.md` §4–§5。
- **08—12**：按 `era` 过滤即可取到本展厅条目；`summary` 可直接做导语底稿。
- **13**：`QA.md` 的机器核对结论与 `review` 名单可作为"来源可靠性"抽查清单。
- **14**：本目录无构建步骤，直接并入发布仓库即可；`screenshots/` 建议不发布。
