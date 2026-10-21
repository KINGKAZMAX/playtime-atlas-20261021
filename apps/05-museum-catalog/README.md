# 05 · 游戏博物馆联网策展研究

> 为「回响电玩馆 / PLAYTIME ATLAS」提供的**联网策展底稿**。
> 本任务只产出资料与索引，不产出前端页面。

---

## 1. 这是什么

两份东西：

1. **横向比较** —— 14 个**真实存在**的游戏博物馆 / 时间线 / 可玩展览，逐个记录 URL、截图参考、交互、美术与许可。
2. **策展目录** —— 140 条覆盖 **1950s 实验游戏 → 2020s VR / 独立游戏**的代表硬件与作品，
   每条含年代、平台、创作者、事实描述、策展意义，并给出**年代 / 平台 / 史实逐项可点击的来源**。

目录是**代表性选样**，不是编年全集——这一点在 `catalog.meta.json`、`SOURCES.md`、`REFERENCE-DESIGN.md` 与本文件中均已写明。

## 2. 快速开始

```bash
# 直接用现成交付物
open catalog.json          # 全量目录（140 条）
open handoff/first-20.json # 给 06 的首批 20 条

# 重新生成分目录与来源台账（从 data/ 的原始抓取结果重建）
python3 scripts/build_catalog.py
```

无构建步骤、无运行时依赖、无在线接口调用。纯静态资料，可直接拷进 14-publish 的发布目录。

## 3. 目录结构

```
05-museum-research/
├── TASK.md                 任务定义与验收标准
├── STATUS.md               阶段状态、变更记录、限制
├── README.md               本文件
├── catalog.json            ★ 全量目录（140 条，10 个必需字段 + 扩展字段）
├── catalog.meta.json       元信息：年代词表、统计、字段说明、限制声明
├── SOURCES.md              ★ 逐条来源台账（每条一行的可点击来源表）
├── REFERENCE-DESIGN.md     ★ 14 个参考馆的横向比较 + 给 06/07 的落地建议
├── LICENSES.md             素材与引用许可边界
├── QA.md                   验收记录（实际跑过的检查与结果）
├── manifest.json           交付清单（id/title/description/entry/buildCommand/outputDir/status）
├── handoff/
│   ├── first-20.json       给 06 的首批 20 条
│   ├── first-20-ids.json
│   └── INTEGRATION.md      给 06 的接法与边界说明
├── screenshots/            参考站实机截图存档（研究用，不随包再分发）
│   └── INDEX.tsv           URL / HTTP 状态 / 字节数 / 抓取时间
├── scripts/
│   ├── fetch_sources.py        抓 lead + infobox 并自动核对
│   ├── fetch_image_licenses.py 查 Commons 首图许可
│   ├── resolve_titles.py       校正错误的维基条目名
│   ├── build_catalog.py        合并生成 catalog.json / SOURCES.md
│   ├── check_licenses.py       扫描各参考站条款页的许可关键词
│   ├── capture_refs.sh         headless Chrome 抓参考站截图
│   └── fetch_text.py           抓网页并抽纯文本
└── data/
    ├── seed_items.json     策展骨架（id/era/kind/year/platform/creator）
    ├── curated/part1..4.json 人工撰写的 summary / significance / titleZh
    ├── leads.json          抓取的 lead 摘要（含重定向别名表）
    ├── raw_sources.json    ★ 逐条抓取 + 机器核对结果
    ├── image_licenses.json 配图许可核验结果
    └── title_fixes.json    条目标题校正记录
```

## 4. 目录条目字段

每条 `catalog.json` 元素都含任务要求的 10 个字段，另加便于下游使用的扩展字段。

| 字段 | 含义 |
| --- | --- |
| `id` | 稳定标识符，`hw=` 硬件 / `sw=` 作品 / `pl=` 平台 |
| `title` | 作品或硬件原名（= 维基条目名，可直接拼成来源 URL） |
| `titleZh` | **本项目自拟**中文展签名，非官方译名 |
| `year` | 首次公开 / 首发年份 |
| `era` | 受控词表：`origins` `arcade` `home8bit` `console16` `online` `mobile` `modern` |
| `platform` | 首发时的主要平台或载体 |
| `creator` | 厂商或个人开发者 |
| `summary` | 一句事实描述（客观，不含评价性夸张） |
| `significance` | 为何值得进馆的策展判断 |
| `sourceUrls` | 年代 / 平台 / 史实各自可点击追溯的来源 |
| `imageLicense` | 配图许可状态 |
| `sourceDetail` | `year` / `platform` / `facts` 三个事实各自的来源 URL + 该年代的二级来源 |
| `verification` | 机器核对结果（`status` / `yearInLead` / `infoboxYear` / `infoboxPlatforms` / `infoboxCreator`） |
| `eraLabel` `eraRange` `kind` `kindLabel` | 展示用派生字段 |

## 5. 年代覆盖

| `era` | 标签 | 年份区间 | 条数 | 硬件 | 作品 |
| --- | --- | --- | --- | --- | --- |
| `origins` | 光点实验 | 1950–1969 | 15 | 6 | 9 |
| `arcade` | 投币街机 | 1970–1979 | 15 | 3 | 12 |
| `home8bit` | 家用八位机 | 1980–1989 | 23 | 10 | 13 |
| `console16` | 光盘与三维 | 1990–1999 | 20 | 8 | 12 |
| `online` | 网络与数字发行 | 2000–2009 | 20 | 8 | 12 |
| `mobile` | 触屏与随身 | 2010–2014 | 20 | 6 | 14 |
| `modern` | VR、独立与空间计算 | 2015–2026 | 27 | 6 | 21 |
| | | **合计** | **140** | **48** | **92** |

每个时代**同时**有硬件与作品条目（`arcade` 的硬件条目为磁珠机台与主机原型，比例偏低属题材实情，已在 `catalog.meta.json` 注明）。

## 6. 研究方法

1. **策展骨架先行**：人工选定 140 个代表条目，定 `id` / `era` / `kind` / `year` / `platform` / `creator`。
2. **联网抓取核对**：用 MediaWiki API 抓每条的 lead 摘要（`scripts/fetch_sources.py`），
   检查年份是否出现在正文；再解析 infobox 的 `released` / `platforms` / `developer` 做交叉核对。
3. **人工撰写文案**：`summary` / `significance` / `titleZh` 由本任务撰写（`data/curated/part*.json`），
   **不复制**参考站或维基百科的成段原文。
4. **配图许可核验**：取每条在维基百科的首图文件名，到 Wikimedia Commons 查 `extmetadata`
   （`scripts/fetch_image_licenses.py`），归一化为本项目受控词表。
5. **参考站实机取证**：`scripts/capture_refs.sh` 用 headless Chrome 抓 14 个站点的页面快照，
   `scripts/check_licenses.py` 扫描各站条款页的许可原文。

所有原始响应都落盘在 `data/`，可离线复核。

## 7. 已知限制（如实声明）

- **代表性选样，非编年全集。** 7 个时代各有 15–27 条，不可能覆盖各时代全部作品。
- **主源为英文维基百科条目。** 个别早期硬件条目（如 Whirlwind、PLATO）在条目正文中年份表述为
  "1951 年"以外的机构年份，机器核对标为 `review`，已在 `QA.md` 列出，建议以馆方藏品页二次确认。
- **配图默认不采用。** `imageLicense` 多数为 `permission-required` / `no-image`；
  主站应使用 07 美术包程序化生成的抽象图形。
- **3 个参考站本次网络不可达**（`nintendo-museum.jp`、`emudocs.org`、`emulatorhome.com`：
  TLS 握手被本机网关中断），因此**未写入**其交互 / 美术 / 许可描述，以避免编造。
  另 `videogamehistory.org` 截图 0 字节（同样为 TLS 限制），但正文抓取成功，已作为第 10 个参考站收录。
- **机读字段的局限**：`platform` 与 `creator` 是策展用自由文本，未做厂商归一化，
  若 06 需要分面筛选，建议在 06 侧建映射表而非回改本目录（见 `handoff/INTEGRATION.md` §6）。

## 8. 给下游

- **06-museum-core**：见 `handoff/INTEGRATION.md`（字段说明、接法、边界）。
- **07-museum-art**：见 `LICENSES.md` §4–§5 —— 配图一律程序化生成，不要取用参考站或 Commons 图片；
  `imageLicense` 仅供逐图复核参考。
- **08–12 年代展厅**：各展厅的年代与条目可按 `era` 直接过滤；`summary` 已含史实，可直接做展厅导语底稿。
- **13-qa-curation**：`QA.md` 列出全部机器核对结论与 `review` 名单，可直接作为"来源可靠性"抽查清单。
- **14-publish**：本目录无构建步骤，`manifest.json` 的 `buildCommand` 为可选的目录重建命令；
  `screenshots/` 建议不随包发布（见 `LICENSES.md` §3）。
