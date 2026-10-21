# 05 · 游戏博物馆联网策展研究

> 为「回响电玩馆 / PLAYTIME ATLAS」提供的**联网策展底稿**。
> 主体是资料与索引；另保有策展目录页（线上 `/research/catalog.html`）的**自有源码**，
> 以便按 16 的设计规范做增量视觉改版。

---

## 1. 这是什么

三份东西：

1. **横向比较** —— 14 个**真实存在**的游戏博物馆 / 时间线 / 可玩展览，逐个记录 URL、截图参考、交互、美术与许可。
2. **策展目录** —— 139 条覆盖 **1950s 实验游戏 → 2020s VR / 独立游戏**的代表硬件与作品，
   每条含年代、平台、创作者、事实描述、策展意义，并给出**年代 / 平台 / 史实逐项可点击的来源**。
3. **目录页源码与改版** —— `src/catalog-page/`（生成器 + 页面样式层 + `assets/ds/` 设计系统资产）、
   `RESTYLE-CHECKLIST.md`（待替换清单 + 第 2 步执行记录）、`i18n/catalog-keys.md`（zh/en key 骨架）、
   `evidence/`（功能自测 / 设计系统验收 / 改版前后对照 / 四档视口截图）。
   页面视觉已按 16-design-system 统一为**暖白纸 + 朱砂**（`--ds-bg` / `--ds-accent`），
   自托管 OFL 字体，零外部请求；**139 条数据密集区的扫读密度未被压缩**。

目录是**代表性选样**，不是编年全集——这一点在 `catalog.meta.json`、`SOURCES.md`、`REFERENCE-DESIGN.md` 与本文件中均已写明。

## 2. 快速开始

```bash
# 直接用现成交付物
open catalog.json                   # 全量目录（139 条）
open handoff/first-20-stratified.json # 给 06 的首批 20 条（覆盖全部 7 个时代）
open dist/catalog.html              # 策展目录页（构建产物）

# 重新生成分目录与来源台账（从 data/ 的原始抓取结果重建）
python3 scripts/build_catalog.py

# 构建目录页（同时带出 16 的设计系统资产）
node src/catalog-page/build-catalog-page.mjs

# 功能自测（23 项：数据 + 页面 + 线上实探）
python3 scripts/restyle_selftest.py

# 设计系统验收（14 项：四档视口 / 对比度 / 焦点 / Tab / 密度 / 令牌 / 字体 / 探针告警）
python3 scripts/ds_check.py

# 改版前后对照（4 项：结构与功能必须一致）
python3 scripts/restyle_visual_regression.py

# 动效时长 / 命名空间审计（9 项：与 16 规范逐项对齐）
python3 scripts/ds_duration_audit.py

# 16 侧门禁（只读调用，不改 16 任何文件）
node ../16-design-system/tools/validate-tokens.mjs
node ../16-design-system/tools/verify-preview.mjs
```

资料部分无构建步骤、无运行时依赖、无在线接口调用，纯静态可分发；目录页的构建只依赖 Node（无 npm 依赖、无 CDN、无外链字体）。

## 3. 目录结构

```
05-museum-research/
├── TASK.md                 任务定义与验收标准
├── STATUS.md               阶段状态、变更记录、限制
├── README.md               本文件
├── catalog.json            ★ 全量目录（139 条，10 个必需字段 + 扩展字段）
├── catalog.meta.json       元信息：年代词表、统计、字段说明、限制声明
├── SOURCES.md              ★ 逐条来源台账（每条一行的可点击来源表）
├── REFERENCE-DESIGN.md     ★ 14 个参考馆的横向比较 + 给 06/07 的落地建议
├── LICENSES.md             素材与引用许可边界
├── QA.md                   验收记录（实际跑过的检查与结果）
├── manifest.json           交付清单（id/title/description/entry/buildCommand/outputDir/status）
├── RESTYLE-CHECKLIST.md    ★ 改版待替换清单（文件·选择器·旧值 → 16 token 候选路径）
├── i18n/
│   └── catalog-keys.md     ★ zh/en 双语 key 骨架（41 个界面 key；只建骨架，未切语言）
├── src/catalog-page/       ★ 目录页自有源码
│   ├── build-catalog-page.mjs  生成器：catalog.json → dist/catalog.html
│   ├── catalog.css              页面样式层（直接消费 16 的 --ds-* 令牌）
│   └── assets/ds/               16 设计系统资产（tokens.css / components.css / fonts/，与原件逐字节一致）
├── dist/                   构建产物（catalog.html + catalog.css）
├── evidence/               ★ 改版自测证据
│   ├── restyle-selftest.json    自测 22 项结果
│   ├── ds-verify.json           设计系统验收 13 项结果
│   ├── restyle-visual-diff.json 结构/计算样式/像素三重比对结果
│   ├── restyle-inventory.md     视觉面清点表（机器生成）
│   ├── ds-duration-audit.json   动效时长/命名空间审计 9 项结果（回答 16 的「1ms 是否写死在 :root」）
│   ├── ds-verify-preview/       16 侧样例页门禁产物（verify-preview.mjs，errors 0 / warnings 0）
│   └── screens/                 before/after-1440.png（改版前后对照）、ds-*.png（四档视口 + 深色主题）、
│                                step1-zerochange-*.png（第 1 步「零视觉变化」证据）
├── handoff/
│   ├── first-20-stratified.json   给 06 的首批 20 条（覆盖全部 7 个时代，推荐）
│   ├── first-20-stratified-ids.json
│   ├── first-20.json              备用首批（按 id 顺序，偏早期）
│   ├── first-20-ids.json
│   ├── INTEGRATION.md             给 06 的接法与边界说明
│   └── CATALOG-PAGE-HANDOFF.md    给 14 的目录页源码接管步骤 + 线上缺陷修法
├── screenshots/            参考站实机截图存档（研究用，不随包再分发）
│   └── INDEX.tsv           URL / HTTP 状态 / 字节数 / 抓取时间
├── scripts/
│   ├── fetch_sources.py         抓 lead + infobox 并自动核对
│   ├── fetch_image_licenses.py  查 Commons 首图许可
│   ├── build_catalog.py         合并生成 catalog.json / SOURCES.md / handoff/
│   ├── reparse_infobox.py       离线重解析 infobox（改进解析器后免重抓）
│   ├── qa_check.py              18 项验收检查（--http 加抽样联网复核）
│   ├── consistency_check.py     策展字段 ↔ 来源 infobox 交叉抽查
│   ├── check_licenses.py        扫描各参考站条款页的许可关键词
│   ├── capture_refs.py          用 ego-browser 抓参考站截图（唯一浏览器入口）
│   ├── fetch_text.py            抓网页并抽纯文本
│   ├── resolve_titles.py        条目标题校正（硬门槛 + 人工确认后写回）
│   ├── restyle_inventory.py     改版视觉面清点（改版前/后两态）
│   ├── restyle_selftest.py      功能自测（数据 + 页面 + 线上实探，22 项）
│   ├── restyle_visual_regression.py  改版前后对照（结构/功能一致 + 视觉已换，4 项）
│   ├── ds_check.py              设计系统验收驱动（13 项）
│   ├── ds_duration_audit.py     动效时长/命名空间审计（9 项，与 16 规范逐项对齐）
│   ├── ego_probe.py             Ego 探针调用器（渲染模板 → ego-browser nodejs → 回收 JSON）
│   ├── ego_ds_probe.template.mjs    Ego 版设计系统验收探针（四档视口 / 对比度 / 焦点 / Tab / 密度 / 令牌）
│   ├── ego_selftest.template.mjs     Ego 版功能探针（真实点击筛选与搜索）
│   ├── ego_live_probe.template.mjs   Ego 版线上实探
│   ├── ego_refshots.template.mjs     Ego 版参考站截图
│   ├── page_probe.mjs           页内探针表达式（DS + 功能，共享）
│   └── patch_seed.py / patch_seed2.py / patch_seed3.py / patch_seed4.py
│                                一次性数据校正脚本（已执行，保留作审计痕迹）
└── data/
    ├── seed_items.json       策展骨架（id/title/era/kind/year/platform/creator）
    ├── curated/part1..4.json 人工撰写的 summary / significance / titleZh
    ├── leads.json            抓取的 lead 摘要（含重定向别名表）
    ├── raw_sources.json      ★ 逐条抓取 + 机器核对结果
    ├── image_licenses.json   配图许可核验结果
    ├── consistency_flags.json 字段一致性抽查结果
    ├── title_fixes.json      条目标题校正记录
    └── wikitext/             137 篇来源条目原文（离线复核用，不随发布包分发）
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
| `origins` | 光点实验 | 1950–1969 | 15 | 7 | 8 |
| `arcade` | 投币街机 | 1970–1979 | 14 | 3 | 11 |
| `home8bit` | 家用八位机 | 1980–1989 | 23 | 10 | 13 |
| `console16` | 光盘与三维 | 1990–1999 | 20 | 8 | 12 |
| `online` | 网络与数字发行 | 2000–2009 | 20 | 8 | 12 |
| `mobile` | 触屏与随身 | 2010–2014 | 20 | 6 | 14 |
| `modern` | VR、独立与空间计算 | 2015–2026 | 27 | 6 | 21 |
| | | **合计** | **139** | **48** | **91** |

每个时代**同时**有硬件与作品条目（`arcade` 的硬件条目为磁珠机台与主机原型，比例偏低属题材实情，已在 `catalog.meta.json` 注明）。

## 6. 研究方法

1. **策展骨架先行**：人工选定 139 个代表条目，定 `id` / `era` / `kind` / `year` / `platform` / `creator`。
2. **联网抓取核对**：用 MediaWiki API 抓每条的 lead 摘要（`scripts/fetch_sources.py`），
   检查年份是否出现在正文；再解析 infobox 的 `released` / `platforms` / `developer` 做交叉核对。
3. **人工撰写文案**：`summary` / `significance` / `titleZh` 由本任务撰写（`data/curated/part*.json`），
   **不复制**参考站或维基百科的成段原文。
4. **配图许可核验**：取每条在维基百科的首图文件名，到 Wikimedia Commons 查 `extmetadata`
   （`scripts/fetch_image_licenses.py`），归一化为本项目受控词表。
5. **参考站实机取证**：`scripts/capture_refs.py` 用 **ego-browser** 抓 14 个站点的页面快照，
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
- **本目录不含任何「olek.si 风格」实测结论。** 16-design-system 的四份产物
  （`REFERENCE-AUDIT.md` / `DESIGN-SPEC.md` / `design-tokens.json` / `preview.html`）截至产出时**尚未产出**，
  参考站视觉未在本目录取证。`RESTYLE-CHECKLIST.md` 里的色值/字阶/间距**只是改版前的现状值**，
  「16 token 候选路径」是占位命名，**键名与取值一律以 16 的 `design-tokens.json` 为准**。
  动效时长、字阶比、间距尺度的具体取值**无参考站实测依据，为本批自定**。
- **目录页已自托管 OFL 字体**（Inter / Space Grotesk / Space Mono + Noto Sans SC 子集），
  许可登记在 `LICENSES.md` §6.1，运行期外部请求实测 0。
  ⚠️ **随包的 Noto Sans SC 子集只覆盖本页 1031 个汉字的 57.5%**，一旦排在系统 CJK 栈之前就会造成混排基线错位。
  **16 已于 2026-10-21 22:25 在 `tokens.css` / `fonts.css` / `FONT-MANIFEST.json` 上游修正该顺序**
  （规则：覆盖完整的 CJK 族必须排在覆盖有限的子集之前，来源即本页的基线错位实测）；
  本页已删除本地覆写、直接消费 DS 令牌，自有 CSS 零 `--ds-*` 声明（仅构建期在 HTML 注入 `--ds-base`，属 16 §2.0 要求的接入项，非 CSS 声明）（详见 `RESTYLE-CHECKLIST.md` §11.3）。
- **条目描述无英文版**：139 条 `summary` / `significance` 仅中文，`title`（英文原名）齐备。
  英文站只能给元数据 + 英文原名 + 来源链接；补齐英文文案需单独立项（见 `i18n/catalog-keys.md` §3）。
- **线上目录页当前 404**：该页在 14 的第三版发布（`f9202fb`，19:59:48「Refocus public gallery on personal works and assets」）
  中被从发布树删除，`data/works.json` 也已移除 `05-museum-catalog` 条目。属发布侧范围，
  05 未改动该仓库；恢复发布需 14 / 15 决策，源码与接入步骤已备好（见 `handoff/CATALOG-PAGE-HANDOFF.md`）。
- **该页最后一次上线时的核验状态显示错误**：139 条全标「来源待复核」（应为「来源已核验」），
  原因是发布侧读错了字段名；事实层无问题（0 条 `review`）。修法见 `handoff/CATALOG-PAGE-HANDOFF.md` §4。

## 8. 给下游

- **06-museum-core**：见 `handoff/INTEGRATION.md`（字段说明、接法、边界）。
- **07-museum-art**：见 `LICENSES.md` §4–§5 —— 配图一律程序化生成，不要取用参考站或 Commons 图片；
  `imageLicense` 仅供逐图复核参考。
- **08–12 年代展厅**：各展厅的年代与条目可按 `era` 直接过滤；`summary` 已含史实，可直接做展厅导语底稿。
- **13-qa-curation**：`QA.md` 列出全部机器核对结论与 `review` 名单，可直接作为"来源可靠性"抽查清单；
  目录页的**实跑证据**在 `evidence/restyle-selftest.json`（23 项：22 通过 + 1 项线上 404 归发布侧 blocked-by-publish，**产品侧失败 0**）、
  `evidence/ds-verify.json`（设计系统 14/14）、`evidence/restyle-visual-diff.json`（结构/计算样式/像素三重一致 4/4）、
  `evidence/ds-duration-audit.json`（时长/命名空间/字体栈/资产一致性审计 **13/13**），可直接对照，不必重复造。
  全部由 **ego-browser** 驱动（用户长期约定的唯一浏览器入口）。
  `CHK[D8]`（线上 404）归属 14 发布侧，按 15 的路由标 blocked-by-publish。
- **14-publish**：资料部分无构建步骤，`manifest.json` 的 `dataEntry` 指向 `catalog.json`；
  目录页的构建产物在 `dist/`（`buildCommand` = `node src/catalog-page/build-catalog-page.mjs`）。
  **目录页源码已从 14 的生成器迁到 05 自有**，接入步骤与线上核验状态缺陷修法见
  `handoff/CATALOG-PAGE-HANDOFF.md`；`screenshots/` 建议不随包发布（见 `LICENSES.md` §3）。
