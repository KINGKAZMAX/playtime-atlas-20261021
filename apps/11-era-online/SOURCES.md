# SOURCES — 《联机曙光》史料台账与核验方法

> 本目录（`11-era-online`）自建台账。**不依赖** `05-museum-research` 的产物
> （该目录在本任务进行时尚未交付 `catalog.json`），因此本任务的每一条史料都独立核验。
> 下游 `06-museum-core` 可直接复用本目录的 `src/data/sources.ts` 与 `src/data/timeline.ts`。

---

## 1. 核验方法

| 项目 | 说明 |
| --- | --- |
| 抓取工具 | `web_fetch`（直接取原始 HTML / JSON），辅以 `web_search` 定位候选页 |
| 抽取方式 | 对维基百科使用 REST 摘要接口 `https://en.wikipedia.org/api/rest_v1/page/summary/<标题>`，取 `extract` 字段中的首段事实陈述 |
| 可达性验证 | 全部候选 URL 以 `curl -L --max-time 15-20` 发起 GET，记录 HTTP 状态码 |
| 核验日期 | **2026-10-21**（与 `manifest.json` 的 `sources.checkedOn` 一致） |
| 判定标准 | 只保留最终返回 **HTTP 200** 的 URL；404/403/超时的一律剔除或替换 |

### 1.1 可达性抽样结果

共检查 **89** 个候选 URL，其中 **65** 条进入台账，全部返回 200。
被剔除的 24 条包括：厂商站点上已改版的旧路径（如 `nintendo.com/en-gb/Hardware/...` 返回 404）、
需要特殊请求头的内容源（403）、以及拼写有误的条目（404）。
**台账中不存在未经 HTTP 验证的链接。**

### 1.2 来源分级

| 级别 | 含义 | 本台账数量 |
| --- | --- | --- |
| `official`（一手） | 厂商官网 / 官方公告页 | **5** |
| `wiki`（次级） | 维基百科条目，用于交叉核对具体日期、首发地区与类型定义 | **60** |

> 次级源的使用原则：先用一手源确认「这件事存在」，再用百科条目确认「具体是哪一天、哪个地区首发」，
> 并在页面上把两类来源用不同颜色的角标区分开。

### 1.3 已知的证据限制

1. 维基百科条目本身会更新。本台账记录的是 **2026-10-21 当天**的表述。
2. 厂商页面未逐项抓取存档快照；本展厅不复制其图片，只做链接引用。
3. 对「销量」「用户数」等数字型指标，本展厅**一概不引用**（难以稳定核验，且容易变成编造）。
4. 未做联网核验的推测性结论（如「某作影响了某类型」）一律未写入展厅。

---

## 2. 一手来源（official）

| id | 标题 | URL | 用于 |
| --- | --- | --- | --- |
| `nin-hist` | 任天堂官方社史 Corporate History | https://www.nintendo.co.jp/corporate/en/history/index.html | 掌机世代与发售脉络 |
| `ps-hist` | PlayStation 官方历史 PlayStation History | https://www.playstation.com/en-us/playstation-history/ | 主机世代与 PlayStation Network |
| `steam-20` | Steam 二十周年官方公告 | https://store.steampowered.com/news/app/593110 | Steam 上线与转型 |
| `valve-co` | Valve 官网 | https://www.valvesoftware.com/en/ | Steam / Counter-Strike / TF2 的厂商归属 |
| `chm` | 计算机历史博物馆 Computer History Museum | https://www.computerhistory.org/ | 硬件史的馆方交叉参照 |

---

## 3. 次级来源（wiki）全表

| 主题 | 条目（id · 标题 · URL） |
| --- | --- |
| 掌机 | `wp-gbc` Game Boy Color · https://en.wikipedia.org/wiki/Game_Boy_Color<br>`wp-gba` Game Boy Advance · https://en.wikipedia.org/wiki/Game_Boy_Advance<br>`wp-nds` Nintendo DS · https://en.wikipedia.org/wiki/Nintendo_DS<br>`wp-psp` PlayStation Portable · https://en.wikipedia.org/wiki/PlayStation_Portable<br>`wp-ngage` N-Gage · https://en.wikipedia.org/wiki/N-Gage<br>`wp-ninlist` List of Nintendo video game consoles · https://en.wikipedia.org/wiki/List_of_Nintendo_video_game_consoles |
| 主机 | `wp-hist` History of video game consoles · https://en.wikipedia.org/wiki/History_of_video_game_consoles<br>`wp-vgc` Video game console · https://en.wikipedia.org/wiki/Video_game_console<br>`wp-ps2` PlayStation 2 · https://en.wikipedia.org/wiki/PlayStation_2<br>`wp-xbox` Xbox (console) · https://en.wikipedia.org/wiki/Xbox_(console)<br>`wp-x360` Xbox 360 · https://en.wikipedia.org/wiki/Xbox_360<br>`wp-ps3` PlayStation 3 · https://en.wikipedia.org/wiki/PlayStation_3<br>`wp-wii` Wii · https://en.wikipedia.org/wiki/Wii |
| 联机服务 | `wp-xlive` Xbox network（前称 Xbox Live）· https://en.wikipedia.org/wiki/Xbox_network<br>`wp-psn` PlayStation Network · https://en.wikipedia.org/wiki/PlayStation_Network<br>`wp-steam` Steam (service) · https://en.wikipedia.org/wiki/Steam_(service)<br>`wp-bnet` Battle.net · https://en.wikipedia.org/wiki/Battle.net<br>`wp-nwfc` Nintendo Wi-Fi Connection · https://en.wikipedia.org/wiki/Nintendo_Wi-Fi_Connection<br>`wp-bliz` Blizzard Entertainment · https://en.wikipedia.org/wiki/Blizzard_Entertainment<br>`wp-valve` Valve Corporation · https://en.wikipedia.org/wiki/Valve_Corporation |
| 类型 | `wp-mmo` Massively multiplayer online game · https://en.wikipedia.org/wiki/Massively_multiplayer_online_game<br>`wp-browser` Browser game · https://en.wikipedia.org/wiki/Browser_game<br>`wp-vw` Virtual World · https://en.wikipedia.org/wiki/Virtual_World<br>`wp-online` Online game · https://en.wikipedia.org/wiki/Online_game |
| 作品 | `wp-eq` EverQuest · https://en.wikipedia.org/wiki/EverQuest<br>`wp-realm` The Realm Online · https://en.wikipedia.org/wiki/The_Realm_Online<br>`wp-ultima` Ultima Online · https://en.wikipedia.org/wiki/Ultima_Online<br>`wp-wow` World of Warcraft · https://en.wikipedia.org/wiki/World_of_Warcraft<br>`wp-wowbc` WoW: The Burning Crusade · https://en.wikipedia.org/wiki/World_of_Warcraft:_The_Burning_Crusade<br>`wp-mc` Minecraft · https://en.wikipedia.org/wiki/Minecraft<br>`wp-sl` Second Life · https://en.wikipedia.org/wiki/Second_Life<br>`wp-lol` League of Legends · https://en.wikipedia.org/wiki/League_of_Legends<br>`wp-dota` Defense of the Ancients · https://en.wikipedia.org/wiki/Defense_of_the_Ancients<br>`wp-star` StarCraft · https://en.wikipedia.org/wiki/StarCraft<br>`wp-bw` StarCraft: Brood War · https://en.wikipedia.org/wiki/StarCraft:_Brood_War<br>`wp-w3` Warcraft III: The Frozen Throne · https://en.wikipedia.org/wiki/Warcraft_III:_The_Frozen_Throne<br>`wp-d2` Diablo II · https://en.wikipedia.org/wiki/Diablo_II<br>`wp-d3` Diablo III · https://en.wikipedia.org/wiki/Diablo_III<br>`wp-tf2` Team Fortress 2 · https://en.wikipedia.org/wiki/Team_Fortress_2<br>`wp-cs` Counter-Strike · https://en.wikipedia.org/wiki/Counter-Strike<br>`wp-css` Counter-Strike: Source · https://en.wikipedia.org/wiki/Counter-Strike:_Source<br>`wp-l4d` Left 4 Dead · https://en.wikipedia.org/wiki/Left_4_Dead<br>`wp-portal` Portal · https://en.wikipedia.org/wiki/Portal_(video_game)<br>`wp-hl2` Half-Life 2 · https://en.wikipedia.org/wiki/Half-Life_2<br>`wp-nwn` Neverwinter Nights (2002) · https://en.wikipedia.org/wiki/Neverwinter_Nights_(2002_video_game)<br>`wp-gmod` Garry's Mod · https://en.wikipedia.org/wiki/Garry%27s_Mod<br>`wp-cod4` Call of Duty 4 · https://en.wikipedia.org/wiki/Call_of_Duty_4:_Modern_Combat<br>`wp-halo3` Halo 3 · https://en.wikipedia.org/wiki/Halo_3<br>`wp-gta3` Grand Theft Auto III · https://en.wikipedia.org/wiki/Grand_Theft_Auto_III<br>`wp-gtavc` Grand Theft Auto: Vice City · https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Vice_City<br>`wp-gtasa` Grand Theft Auto: San Andreas · https://en.wikipedia.org/wiki/Grand_Theft_Auto:_San_Andreas<br>`wp-maple` MapleStory · https://en.wikipedia.org/wiki/MapleStory<br>`wp-gw` Guild Wars · https://en.wikipedia.org/wiki/Guild_Wars<br>`wp-ru` RuneScape · https://en.wikipedia.org/wiki/Runescape<br>`wp-ffxi` Final Fantasy XI · https://en.wikipedia.org/wiki/Final_Fantasy_XI<br>`wp-aoe2` Age of Empires II · https://en.wikipedia.org/wiki/Age_of_Empires_II |
| 平台与网络 | `wp-xp` Windows XP · https://en.wikipedia.org/wiki/Windows_XP<br>`wp-iphone` iPhone · https://en.wikipedia.org/wiki/IPhone<br>`wp-mobile` Mobile game · https://en.wikipedia.org/wiki/Mobile_game<br>`wp-irc` Internet Relay Chat · https://en.wikipedia.org/wiki/Internet_Relay_Chat |

> 机器可读版本（含 `id / title / url / tier / topic / checked` 字段）见 `src/data/sources.ts` 的 `SOURCES` 数组。
> 页面上的来源角标与台账由**同一份数据**渲染，因此正文与台账不会漂移。

---

## 4. 展厅中引用的关键事实（逐条对照）

| 展厅陈述 | 来源 |
| --- | --- |
| PlayStation 2 于 2000 年 3 月 4 日在日本首发 | `wp-ps2` |
| Windows XP 于 2001 年 10 月 25 日零售 | `wp-xp` |
| Xbox 于 2001 年 11 月 15 日在北美发售 | `wp-xbox` |
| Game Boy Advance 于 2001 年 3 月 21 日在日本发售 | `wp-gba`、`nin-hist` |
| Xbox Live 于 2002 年 11 月 15 日随初代 Xbox 开放 | `wp-xlive` |
| Steam 客户端于 2003 年 9 月上线，2005 年底扩展到第三方发行 | `wp-steam`、`steam-20` |
| Second Life 于 2003 年 6 月 23 日公开上线 | `wp-sl`、`wp-vw` |
| Nintendo DS 于 2004–2005 年间全球发售，下屏可作触摸屏 | `wp-nds`、`nin-hist` |
| PSP 于 2004 年 12 月 12 日在日本首发 | `wp-psp` |
| World of Warcraft 2001 年公布、2004 年 11 月 23 日发售 | `wp-wow` |
| Battle.net 于 1997 年 1 月随 Diablo 启用 | `wp-bnet` |
| Xbox 360 于 2005 年 5 月 12 日揭晓 | `wp-x360` |
| Nintendo Wi-Fi Connection 于 2005 年 11 月 14 日上线 | `wp-nwfc` |
| Wii 于 2006 年 11 月 19 日在北美发售 | `wp-wii` |
| PlayStation 3 于 2006 年 11 月 11 日在日本首发 | `wp-ps3`、`ps-hist` |
| PlayStation Network 于 2006 年 11 月上线 | `wp-psn` |
| Counter-Strike 模组版权被 Valve 收购后于 2000 年转为零售 | `wp-cs` |
| Team Fortress 2 于 2007 年 10 月随 The Orange Box 发售 | `wp-tf2` |
| 第一代 iPhone 于 2007 年 1 月 9 日公布、6 月上市 | `wp-iphone` |
| League of Legends 于 2009 年 10 月上线，免费游玩 + 外观道具变现 | `wp-lol` |
| Minecraft 于 2009 年 5 月 17 日公开 alpha | `wp-mc` |
| DotA 最初是 Warcraft III 的自定义地图 | `wp-dota`、`wp-w3` |
| MMO 被概括为「大量玩家在同一服务器上同时互动」 | `wp-mmo`、`wp-online` |

> **已剔除的条目（示例）**：`Diablo III` 虽在核验清单中，但来源显示其为 **2012 年**作品，
> 不属于 2000 年代，已从年表移除，仅保留在台账中备查。

---

## 5. 引用与授权的边界

- 本展厅只**链接**来源页面，**不复制**它们的图片、字体、商标、Logo 或任何受版权保护的素材。
- 展厅内所有配图均为**程序化生成**（Canvas 2D / CSS / SVG），与来源站点无关。
- **引用 ≠ 授权**。详见 [`LICENSES.md`](./LICENSES.md)。
