# REFERENCE-DESIGN — 既有游戏博物馆 / 时间线 / 可玩展览横向比较

> 用途：为「回响电玩馆 / PLAYTIME ATLAS」提供**机制与信息架构**参照。
> 本文件记录的是公开作品的**做法**，不是对其视觉的复制。
> 本项目**不复制**任何参考站的品牌色组合、logo、商标字体、原图或专有文案；
> 可借鉴的是**交互结构、策展逻辑、元数据模型与信息密度**。

- 研究时间：2026-10-21（UTC）
- 抓取方式：`scripts/capture_refs.sh`（headless Chrome 实机截图）+ `scripts/fetch_text.py`（正文与条款页抓取）
- 截图存档：`screenshots/`，索引见 `screenshots/INDEX.tsv`
- 覆盖站点：**14 个真实存在且本次实测可达的站点**（要求 ≥8）

---

## 0. 许可速查（引用 ≠ 授权）

| 站点 | 内容许可（原文要点） | 图片许可 | 本项目可否复用其素材 |
| --- | --- | --- | --- |
| The Strong | "in accordance with Creative Commons licenses, you may download material for your personal, non-commercial use"；**不得商业性复制/再发布**；**logo 与设计商标须经批准** | 随内容条款 | ❌ 仅作事实来源与机制参考 |
| National Videogame Museum (UK) | "Copyright © 2026. National Videogame Museum. All rights reserved." | 站内图片版权不明 | ❌ |
| Computer History Museum | "© 2025 Computer History Museum"；藏品图片逐件另有权利声明 | 逐件 | ❌ |
| Centre for Computing History | 登记慈善机构，站内未见开放许可声明 | 未声明 | ❌ |
| Museum of the Game (KLOV) | 站内素材版权归属混合，多为捐入/拍摄 | 逐件 | ❌ |
| Internet Archive | **逐条目**许可字段（Public Domain / possible copyright status 等） | 逐条目 | ⚠️ 仅在逐条确认为公有领域时可用 |
| Emulation Nation | "Text is available under the Creative Commons Attribution-ShareAlike License" | 正文 CC BY-SA，图片另计 | ✅ **仅正文文字**（须署名） |
| Games That Weren't | "Games That Weren't® is the registered trademark of Frank Gasking" | 商标；配图为各发行商素材 | ❌ 商标与封面图不可用 |
| Video Game History Foundation | "© The National Video Game History Museum. All rights reserved." | 未声明 | ❌ |
| Google Arts & Culture | 各合作馆方各自权利，无统一许可 | 逐馆方 | ❌ |
| Nintendo Museum / EmuDocs / EmulatorHome | **本次网络环境不可达**（TLS 握手被网关中断） | 未知 | ❌ 未纳入比较 |
| The Strong（Google Arts & Culture 合作版） | 随馆方条款 | 同上 | ❌ |

> 结论：本目录**不含任何第三方图片**。`catalog.json` 的 `imageLicense` 字段只登记"该条目首图在 Commons 的许可状态"，
> 供 07 美术包逐图复核；默认由 07 **程序化生成**抽象图形，深墨蓝 + 暖纸白 + 信号橙，不复用任何参考站视觉。

---

## 1. The Strong — Video Game History Timeline
**URL**：https://www.museumofplay.org/video-game-history-timeline/ · 截图：`screenshots/strong-timeline_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 顶部 **年代分档（1940s–2020s）** 切换 → 下方是**逐年卡片流**，每年一条叙述性短文并挂接馆藏文物。免费、无需登录、可深链到具体年代。 |
| **美术** | 深紫 `#5a4099` 主色 + 暖黄 `#ffd204` 强调；超粗衬线展示体做标题，正文无衬线；博物馆内景大图上压半透明紫色蒙版；**斜切几何**（angled underlay）作为贯穿装饰母题；卡片边缘做斜角。 |
| **许可** | 见上表（CC 条款限个人非商用；logo/设计商标须批准）。 |
| **对 06 的启示** | ✅ 「**年代分档 → 逐年卡片**」正是时间长廊的骨架，可直接作为长廊的筛选与展开结构。斜切母题值得借鉴，但**必须重绘**、不得复刻其紫黄组合。 |

## 2. The Strong — World Video Game Hall of Fame
**URL**：https://www.museumofplay.org/exhibits/world-video-game-hall-of-fame/ · 截图：`screenshots/strong-vghf_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 入选作品索引 → 每条进入**长文 + 视频 + 实物照片**的展签页；分类浏览。 |
| **美术** | 同品牌系统；大量真实藏品照片，文字层级清晰。 |
| **许可** | 同上。 |
| **对 06 的启示** | ✅ 展品详情**不是短卡片**，而是"长文 + 媒体 + 实物"的展签页——对应 06 的"展品详情来源"。 |

## 3. The Strong — Online Exhibits
**URL**：https://www.museumofplay.org/exhibits/online-exhibits/ · 截图：`screenshots/strong-online-exhibits_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 线上展索引，按**展陈类型（Online / Permanent / Short-Term）**、**年龄组（成人/青少年/学龄前/幼儿）**、**玩法类型（创意/游戏/体感/自然/假扮）**分面筛选。 |
| **美术** | 卡片网格 + 彩色分类标签，插画式小图标。 |
| **许可** | 同上。 |
| **对 06 的启示** | ✅ **按"玩法类型/年龄组"分面**是本组站点里最值得抄的筛选思路——但我们用自己的维度：**年代 × 硬件/作品 × 平台**（见第 15 节建议）。 |

## 4. National Videogame Museum (UK, Sheffield)
**URL**：https://thenvm.org/ · 截图：`screenshots/nvm-sheffield_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 常设展（The Arcade 1970s→2010s、Made In Sheffield、Monument Valley 专题）；**P1 Families / P2 Education / P3 Groups / P4 Individuals 四类访客身份入口**；线上免费展 "The Animal Crossing Diaries"（真实玩家日记）。 |
| **美术** | 大色块、超大字号、圆润形状，语气是"Play The Museum"；信息密度低、亲和力高。 |
| **许可** | "Copyright © 2026. National Videogame Museum. All rights reserved." |
| **对 06 的启示** | ✅ **按访客身份分流**是 06 做「2D 无障碍目录 / 可选 3D 展厅」双通道的天然理由——参照其 P1–P4 做法即可，不必复制其页面。 |

## 5. National Videogame Museum (USA, Salinas CA)
**URL**：https://nvmusa.org/interactive-exhibits · 截图：`screenshots/nvm-usa-exhibits_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 以**具名装置**为核心：Giant Pong（12 英尺巨型乒乓）、Head To Head Wall、**Timeline of Consoles（用一只巨型 SNES 手柄翻阅主机数据库）**、1980's Bedroom（复原卧室布景）、Rise of Computers、Virtual Reality、Pixel Dreams Arcade。 |
| **美术** | 怀旧布景化（80 年代卧室复刻）、柜机阵列、霓虹辉光；每个装置一个记忆点。 |
| **许可** | 站内未见开放许可声明，按 ARR 处理。 |
| **对 06 的启示** | ✅ **"巨型手柄当导航器"** 是极强的记忆点且成本低：06 可用一枚程序化绘制的巨型手柄图形做年代长廊的翻页器；"复原房间"适合做年代展厅的**场景化背景**。 |

## 6. Computer History Museum（加州山景城）
**URL**：https://www.computerhistory.org/collections/catalog/ · 截图：`screenshots/chm-collections_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 馆藏目录**分面筛选**：物件类型（Physical Object / Archive Collections / Oral Histories / Audio / Document / Moving Image / Software / Still Image）、**Year from–Year to 年份区间**；另有 Curator Picks、**Discovery Wall**（随机发现入口）、Stories、Oral History 档案。 |
| **美术** | 机构级、信息密度高、档案照片优先、色彩克制、字阶清晰。 |
| **许可** | "© 2025 Computer History Museum"；藏品图片逐件另有权利声明。 |
| **对 06 的启示** | ✅ **「媒体类型 + 年份区间」双分面**是最成熟的主站筛选模型；**Discovery Wall** 对应 06 可加一个"随机漫游"入口。 |

## 7. Centre for Computing History（剑桥）
**URL**：https://computinghistory.org.uk/ · 截图：`screenshots/cch-home_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 浏览馆藏（公开统计：**Computers 1328 / Peripherals 86 / Mobile Devices 102 / Game Consoles 352 / Video Games 15307 / Software Packages 5097 / Books 2778 / Manuals 4397 / Magazines 10107 / Documents 2051 / Photographs 902**）；Computing Timeline；Video Game Museum 专区；Retro Gaming Parties；教育团体参观。 |
| **美术** | 明快、块面、圆角大按钮、卡片拼贴，偏向"工坊"而非"画廊"的气质。 |
| **许可** | 登记慈善机构（1130071），站内未见开放许可声明。 |
| **对 06 的启示** | ✅ **公开馆藏统计作为可信度元素**——可在 06 做"本馆档案"面板；数量级（1.5 万款游戏）说明"展品详情 + 实物"的可信写法。 |

## 8. Museum of the Game / KLOV
**URL**：https://www.arcade-museum.com/ · 截图：`screenshots/klov.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | **多轴浏览**：Top 100 投币机型 / A–Z 标题 / 按机型类型（Arcade、Music、Pinball、Slot、Trade Stim、Vending、Unknown）/ 按类型（Genre）/ 按厂商 / 按系列（Legacy）/ 按年份；另有 **The Arcade Flyer Archive（TAFA）**——大量扫描街机宣传单。 |
| **美术** | 密集的数据库式版面，装饰极少，以文本与表格为主，保留老派 Web 档案气质。 |
| **许可** | 站内素材版权归属混合，图片多为捐入或拍摄，**需逐件确认**。 |
| **对 06 的启示** | ✅ 「**类型 × 类型学 × 厂商 × 年份**」四轴交叉浏览是"硬件与游戏展柜"最实用的模型；**宣传单（flyer）**这类印刷品比游戏截图更容易取得清晰授权，是 07 的可考虑素材方向。 |

## 9. Internet Archive — Software Collection
**URL**：https://archive.org/details/software · 截图：`screenshots/ia-software_.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 条目级浏览 + **浏览器内模拟器直接游玩**；条目页含元数据、**版权/许可字段（Usage Public Domain / Possible Copyright Status…）**、用户评论与所属合集。 |
| **美术** | 列表优先、工具化；右侧/下方抽屉式详情面板。 |
| **许可** | **逐条目**声明，同一合集内条目许可可能完全不同。 |
| **对 06 的启示** | ✅ 两个强信号：①「**条目详情里必须显示许可字段**」是本项目"来源与许可"展示的模板；②「**可玩入口 = 流式调用，不打包 ROM**」是 06 做"可玩入口"时避免分发受版权素材的正确做法。 |

## 10. The National Video Game History Museum（迈阿密）
**URL**：https://www.videogamehistory.org/ · 截图：本次 headless 抓取 0 字节（TLS 在本机被拒），正文经 `fetch_text.py` 抓取成功

| 维度 | 观察 |
| --- | --- |
| **交互** | 站点自述的模型很直接：**"select a system and then select a game from the system and play it or challenge a friend"**；另有 National Video Game Challenge、STEM 课程、激光投影的矢量街机之夜。 |
| **美术** | 非营利社区站，文字主导，版面朴素。 |
| **许可** | "© The National Video Game History Museum. All rights reserved." |
| **对 06 的启示** | ✅ **「主机 → 该机上的游戏 → 直接玩 / 挑战对手」**的两级下钻，是 06"硬件展柜"最干净的信息架构。 |

## 11. Emulation Nation（emulatorzone.com）
**URL**：https://www.emulatorzone.com/ · 截图：`screenshots/emulation-nation.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | "视频游戏与模拟百科"：按厂商分栏（Nintendo / Sega / PlayStation / Atari / Other）、搜索、In the Spotlight（工具）、A Closer Look（主机小传）。 |
| **美术** | 单栏经典博客版式，文字为主、图片很少，蓝色链接。 |
| **许可** | ✅ 页脚明示："Text is available under the Creative Commons Attribution-ShareAlike License"——**本组站点中唯一正文带明确开放许可的**。 |
| **对 06 的启示** | ✅ 唯一可**合法引用正文文字**的参考站（须署名 + 相同方式共享）；其"按厂商分栏 + 主机小传"结构适合做 06 的主机档案页。 |

## 12. Google Arts & Culture（The Strong 为合作馆方）
**URL**：https://artsandculture.google.com/ · 截图：`screenshots/gac.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 实体（entity）浏览：作品、地点、Story 线索串、巨幅全景与超高分辨率缩放、合作馆方专题内嵌。 |
| **美术** | 全幅图像优先、装饰极少、深中性画布留白让影像主导。 |
| **许可** | 各合作馆方各自权利，无统一许可。 |
| **对 06 的启示** | ✅ 「**实体 + 故事线**」的模型，以及**深色中性画布让展品主导**的版面取向；也提醒我们**不内嵌第三方图库**。 |

## 13. Games That Weren't（未竟之作档案，CCH 相关项目）
**URL**：https://www.gamesthatwerent.com/ · 截图：`screenshots/games-that-werent.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 按平台/年份浏览**被取消或从未发行的游戏**数据库；每条含封面、取消原因与开发者访谈。 |
| **美术** | 深色、封面图驱动，"从未存在之物的博物馆"式框架。 |
| **许可** | "Games That Weren't® is the registered trademark of Frank Gasking"；配套出版物采用 CC BY-NC-ND 4.0。**商标与封面图均不可用**。 |
| **对 06 的启示** | ✅ **"未竟之物"反历史支线**极适合 06：复用同一套年代标签，呈现"如果当时做了会怎样"的档案馆叙事，机制上是纯策展而非玩法。 |

## 14. Old Computer Museum
**URL**：http://www.old-computers.com/ · 截图：`screenshots/old-computer-museum.png`

| 维度 | 观察 |
| --- | --- |
| **交互** | 老式机型的图文条目库（站点当前处于"en construction"状态，功能未完成）。 |
| **美术** | 极简、无品牌化。 |
| **许可** | 站内未见开放许可声明。 |
| **对 06 的启示** | ✅ 机型**逐台图文档案**的写法可参考；但站点不完整，**不作为事实来源**。 |

> **未纳入比较（网络不可达）**：Nintendo Museum（`https://www.nintendo-museum.jp/en/`）、EmuDocs（`https://www.emudocs.org/`）、
> EmulatorHome（`https://www.emulatorhome.com/`）——本机 TLS 握手被网关中断（`SSL_ERROR_SYSCALL` / `502`），
> 多次重试与 `web_fetch` 均失败，因此**不写入其交互/美术/许可描述**，以免编造。详见 `QA.md` 的限制记录。

---

## 15. 横向对比矩阵

| # | 站点 | 类型 | 核心交互母题 | 视觉策略 | 内容许可 | 对本项目的可用度 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | The Strong 时间线 | 在线时间线 | 年代分档 → 逐年卡片 | 深色压图 + 斜切几何 | CC（限非商用个人） | 机制★★★★ 视觉✘ |
| 2 | The Strong 名人堂 | 在线常设展索引 | 长文展签页 | 藏品照片驱动 | 同上 | 机制★★★★ 视觉✘ |
| 3 | The Strong 线上展 | 线上展索引 | 多维分面（类型/年龄/玩法） | 彩色标签网格 | 同上 | 机制★★★★ |
| 4 | NVM 英国 | 实体博物馆 | 访客身份分流 P1–P4 | 大色块超大字号 | ARR | 机制★★★★ 视觉△ |
| 5 | NVM 美国 | 实体博物馆 | 具名装置 + 巨型手柄 | 怀旧布景 / 柜机 | 未声明 | 机制★★★★ 视觉△ |
| 6 | Computer History Museum | 实体+目录 | 媒体类型 + 年份区间分面 | 机构级高密度 | © 机构 | 机制★★★★★ |
| 7 | Centre for Computing History | 实体+馆藏 | 馆藏统计 + 时间线 | 明亮工坊感 | 未声明 | 机制★★★ |
| 8 | KLOV | 数据库档案 | 类型×类型学×厂商×年份 | 密集表格 | 混合 | 机制★★★★★ |
| 9 | Internet Archive | 可玩档案 | 条目 + 浏览器内模拟器 + 许可字段 | 工具化列表 | 逐条目 | 机制★★★★★ |
| 10 | NVGHM 迈阿密 | 实体博物馆 | 主机 → 游戏 → 玩/对战 | 朴素 | ARR | 机制★★★★ |
| 11 | Emulation Nation | 百科 | 厂商分栏 + 主机小传 | 单栏文字 | ✅ 正文 CC BY-SA | 许可★★★★ 视觉✘ |
| 12 | Google Arts & Culture | 聚合平台 | 实体 + Story + 超高分辨率 | 深色全幅影像 | 各馆方自持 | 机制★★★ |
| 13 | Games That Weren't | 反历史档案 | 未发行游戏数据库 | 深色封面驱动 | 商标 + CC BY-NC-ND | 机制★★★ 视觉✘ |
| 14 | Old Computer Museum | 机种档案 | 逐台图文 | 极简 | 未声明 | 事实不完整，不引用 |

---

## 16. 给 06 / 07 的落地建议（综合以上 14 站）

### 16.1 信息架构（源自 #3 #4 #6 #8 #10）

1. **两级下钻**：`年代 → 展柜/主机 → 展品`（#10 的主机→游戏模型 + #8 的多轴浏览）。
2. **分面筛选维度**（只用自己的四类）：`年代` × `硬件/作品` × `平台` × `厂商/个人` × `年份区间`。
   - 借鉴 #6 的**年份区间**，但区间滑杆对本项目 1950–2026 的稀疏分布不如**分档按钮**实用，倾向分档。
3. **访客身份分流**（源自 #4 的 P1–P4）：`家庭 / 教育 / 团体 / 个人` 四个入口，对应 06 的"2D 无障碍目录"与"3D 展厅"两条路径。
4. **随机漫游**（源自 #6 的 Discovery Wall）：一个"随便逛逛"入口，从 140 条中随机落点。
5. **展品详情必须是展签页**（源自 #2）：长文 + 媒体 + **来源链接** + **许可字段**（源自 #9 的条目许可字段）。
6. **可玩入口采用外链/流式**（源自 #9）：不打包 ROM，链接到合法可玩来源；馆内自制小游戏才是"可玩"主体。

### 16.2 可玩展厅机制参考（源自 #5 #10 #11）

- #5 的"巨型手柄翻页"→ 06 长廊翻页器与 08–12 各展厅的**入口图形**可采用同类"实物放大"语汇。
- #5 的"复原房间"→ 08（1950s 实验室）、09（1980s 街机）、10（1990s 家庭）可各做一间**布景式背景**。
- #10 的"主机→游戏→对战"→ 10/11/12 展厅内部结构可直接沿用。
- #11 的"厂商分栏 + 主机小传"→ 06 的硬件档案页按厂商/个人分栏。

### 16.3 视觉与原创边界（源自 #1 #5 #12 的反面教材）

- **不做**：紫色 + 亮黄的品牌组合、The Strong 的 logo 与斜切母题的复刻、NVM 的明快大色块、任何参考站的原图。
- **要做**（本项目自有方案，由 07 落地）：**深墨蓝 + 暖纸白 + 信号橙**；自托管许可字体；年代海报用**程序化生成**的抽象图形（无品牌 logo）；6 种跨时代硬件的**简化原创 3D 模型**；展柜与展签使用自研版式。
- 参考站截图仅作**内部研究存档**，不进交付包、不再分发（许可见 §0）。

### 16.4 明确不做的事

- 不声称本馆"穷尽全部时代作品"——参考 #3 的 Honest 做法：写明"代表性选样"。
- 不复制任何商业游戏的画面、名称作为主视觉；名称仅作**编目事实**出现，并附来源链接。
- 不把参考站的长文内容抄进展签；展签由本项目重新撰写（`catalog.json` 的 `summary` / `significance` 均为原创撰写）。

---

## 17. 复核方式

```bash
# 重跑站点可达性与许可关键词扫描
python3 scripts/check_licenses.py
# 重跑截图
./scripts/capture_refs.sh
# 逐条核验目录事实
python3 scripts/fetch_sources.py && python3 scripts/build_catalog.py
```

所有 URL 于 2026-10-21 实测：`The Strong` 200 · `thenvm.org` 200 · `nvmusa.org` 200 · `computerhistory.org` 200 ·
`computinghistory.org.uk` 200 · `arcade-museum.com` 200 · `archive.org` 200 · `videogamehistory.org` 正文可达（TLS 受限）·
`emulatorzone.com` 200 · `artsandculture.google.com` 200 · `gamesthatwerent.com` 200 · `old-computers.com` 200。
