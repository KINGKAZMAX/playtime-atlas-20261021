# SOURCES — 科普展品来源台账

> 本文件记录《色块远征》1990s 家用机展厅中**每一条科普展品**所依据的公开来源，
> 以及链接可达性核验的方法、时间与结果。
> 核验脚本：`scripts/verify_exhibit_sources.sh`（从 `src/data/exhibits.js` 真实抽取链接并逐条请求）。

**核验时间**：2026-10-21（UTC+8）
**核验方式**：`curl -L -A "<浏览器 UA>" -o /dev/null -w "%{http_code}"`，逐条请求，等待最长 25s。
**核验结果**：26 条唯一来源链接 **全部返回 HTTP 200**。

---

## 0. 证据等级说明

| 等级 | 含义 | 本展厅的使用方式 |
| --- | --- | --- |
| 一手 / 官方 | 厂商官网、官方历史页、馆方站点 | 用于交叉参照；部分站点对脚本请求返回 403（见 §4），因此仅在页面中作为可选参考链接，不作为唯一依据 |
| 百科类 | 英文维基百科对应条目 | **本展厅展品正文的主要事实依据**；属于次级来源，已按"事实性描述"使用，不引用其图片、版式或文案表达 |
| 存档类 | Internet Archive 等 | 备用 |

**原则**：展品只陈述可被公开来源核验的**事实**（发行年份、厂商、硬件配置、技术机制、公开的市场事件），
不做价值判断，不复制来源页面的表达方式，不使用其图片。

---

## 1. 展品 → 来源对照表

| 展品 id | 展品标题 | 年份 | 事实依据来源 | 核验 |
| --- | --- | --- | --- | --- |
| `pc-engine` | 第四世代的第一台 | 1987 | https://en.wikipedia.org/wiki/TurboGrafx-16 | 200 |
| `mega-drive` | Mega Drive 的欧美主场 | 1990 | https://en.wikipedia.org/wiki/Sega_Genesis | 200 |
| `snes-1990` | 1990 年的双响 | 1990 | https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System<br>https://en.wikipedia.org/wiki/Neo_Geo | 200 / 200 |
| `game-gear` | 掌机的分岔口 | 1990 | https://en.wikipedia.org/wiki/Game_Gear | 200 |
| `32bit-trio` | 32 位三岔口 | 1993 | https://en.wikipedia.org/wiki/3DO<br>https://en.wikipedia.org/wiki/Atari_Jaguar<br>https://en.wikipedia.org/wiki/Sega_Saturn | 200 / 200 / 200 |
| `playstation-cd` | CD 成为游戏媒介 | 1994 | https://en.wikipedia.org/wiki/PlayStation<br>https://en.wikipedia.org/wiki/CD-ROM | 200 / 200 |
| `mode7` | 伪 3D 的聪明办法 | 1990 | https://en.wikipedia.org/wiki/Mode_7 | 200 |
| `virtual-boy` | 最早的三维尝试 | 1995 | https://en.wikipedia.org/wiki/Virtual_Boy | 200 |
| `n64` | 真 64 位与卡带容量 | 1996 | https://en.wikipedia.org/wiki/Nintendo_64 | 200 |
| `zbuffer` | 深度缓冲：多边形怎么排前后 | 1990 | https://en.wikipedia.org/wiki/Z-buffering | 200 |
| `cd-i` | 多媒体的想象 | 1991 | https://en.wikipedia.org/wiki/CD-i | 200 |
| `marty` | 把 PC 搬进客厅 | 1993 | https://en.wikipedia.org/wiki/FM_Towns_Marty | 200 |
| `32x-neogeocd` | 分叉与加挂 | 1994 | https://en.wikipedia.org/wiki/32X<br>https://en.wikipedia.org/wiki/Neo_Geo | 200 / 200 |
| `gbc` | 把彩色塞进口袋 | 1998 | https://en.wikipedia.org/wiki/Game_Boy_Color | 200 |
| `handheld-duel` | 日本掌机的双城记 | 1998 | https://en.wikipedia.org/wiki/Neo_Geo_Pocket<br>https://en.wikipedia.org/wiki/WonderSwan | 200 / 200 |
| `dreamcast` | 以成本为纲 | 1998 | https://en.wikipedia.org/wiki/Sega_Dreamcast | 200 |
| `pippin` | 被授权的多媒体盒子 | 1996 | https://en.wikipedia.org/wiki/Apple_Pippin | 200 |
| `chiptune` | 芯片音乐的时代 | 1990 | https://en.wikipedia.org/wiki/Chiptune | 200 |
| `framerate` | 每秒多少张 | 1990 | https://en.wikipedia.org/wiki/Frame_rate | 200 |
| `texture-mapping` | 贴图：把图画到形上 | 1990 | https://en.wikipedia.org/wiki/Texture_mapping | 200 |
| `console-definition` | 什么算"主机" | 1990 | https://en.wikipedia.org/wiki/Video_game_console | 200 |

> 共 20 条展品、26 条唯一来源链接（部分展品引用两条来源）。

---

## 2. 逐条事实核验记录

以下为写入展品正文的**具体事实点**与其对应来源，便于复核。

| # | 事实点 | 来源条目中的对应表述 | 来源 |
| --- | --- | --- | --- |
| 1 | PC Engine 由 Hudson Soft 开发、NEC 制造，1987 日本 / 1989 北美，被称为第四世代最早的家庭主机 | "developed by Hudson Soft and manufactured by NEC… released in Japan in 1987 and in North America in 1989… the first console of the fourth generation" | TurboGrafx-16 |
| 2 | PC Engine 为 8 位 CPU + 双 16 位图形处理器 | "an 8-bit CPU paired with dual 16-bit graphics processors" | TurboGrafx-16 |
| 3 | Mega Drive 1988-10 日本 / 1989-08 北美，1990 年在欧洲以 Mega Drive 发行 | "released in October 1988 in Japan… August 1989 in North America… In 1990, it was distributed as the Mega Drive by Virgin Mastertronic in Europe" | Sega Genesis |
| 4 | SNES 1990-11-21 日本以 Super Famicom 发售 | "released as the Super Famicom (SFC) in Japan on November 21, 1990" | SNES |
| 5 | Neo Geo 1990 年由 SNK 发布，先有卡带的 MVS / AES 两种形态，1994 年出 Neo Geo CD | "released in 1990 by Japanese game company SNK Corporation… two ROM cartridge-based formats… MVS… AES. A CD-ROM-based home console iteration, the Neo Geo CD, was released in 1994" | Neo Geo |
| 6 | Game Gear 1990-10-06 日本 / 1991-04 北美与欧洲，世嘉首款掌机，8 位，与 Master System 共享硬件 | "released in Japan on October 6, 1990, in North America and Europe in April 1991… first handheld console by Sega… rushed the 8-bit Game Gear… shares much of its hardware with the Master System" | Game Gear |
| 7 | 3DO 由 3DO 公司开发、Trip Hawkins 构想，松下等厂商 1993 年起生产授权机型 | "developed by The 3DO Company and conceived by Electronic Arts founder Trip Hawkins… licensed by third parties… Panasonic produced the first models in 1993" | 3DO |
| 8 | Atari Jaguar 1993-11 北美上市，宣传为世界首台 64 位并引发争议，共 63 款授权游戏 | "released in North America in November 1993… marketed as the world's first 64-bit game system, drawing controversy… 63 licensed games" | Atari Jaguar |
| 9 | Saturn 1994-11-22 日本上市，双 CPU 架构、八个处理器 | "released on November 22, 1994, in Japan… dual-CPU architecture and eight processors" | Sega Saturn |
| 10 | PlayStation 品牌始于 1994 年日本、1995 年全球发售的第一代主机 | "the brand began with the first PlayStation home console released in Japan in 1994 and worldwide the following year" | PlayStation |
| 11 | 1990 年代 CD-ROM 成为软件与数据的主要发行介质 | "During the 1990s and early 2000s, CD-ROMs were popularly used to distribute software and data" | CD-ROM |
| 12 | Mode 7 允许背景图层按扫描线逐行旋转与缩放，制造纵深效果 | "allows a background layer to be rotated and scaled, which may be done on a scanline-by-scanline basis to create many different depth effects" | Mode 7 |
| 13 | Virtual Boy 32 位桌面式主机，1995-07-21 日本 / 08-14 北美，宣传为首台立体三维主机，红色单色屏 + 双筒目镜，商业失败 | "32-bit tabletop… released in Japan on July 21, 1995, and in North America on August 14, 1995… first console capable of rendering stereoscopic 3D… red monochrome display viewed through a binocular neoprene visor… poor market performance" | Virtual Boy |
| 14 | Nintendo 64 于 1996-06-23 日本 / 09-29 北美上市，1993 年起与 Silicon Graphics 合作开发，以 64 位 CPU 命名 | "released in Japan on June 23, 1996, in North America on September 29, 1996… began developing the N64 in 1993 in collaboration with Silicon Graphics. Named for its 64-bit CPU" | Nintendo 64 |
| 15 | Z 缓冲保存片元深度信息，数值代表到相机距离，0 表示最近；渲染时与缓冲已有深度比较决定是否绘制 | "store the depth information of fragments. The values stored represent the distance to the camera, with 0 being the closest… compared to the value already stored in the buffer" | Z-buffering |
| 16 | CD-i 由飞利浦与索尼共同开发，是 CD-DA 与 CD-ROM 的扩展，由 Green Book 规范定义 | "co-developed and marketed by Dutch company Philips and Japanese company Sony… created as an extension of Compact Disc Digital Audio (CDDA) and CD-ROM and specified in the Green Book specifications" | CD-i |
| 17 | FM Towns Marty 1993 年富士通推出、仅限日本，使用内部 32 位但总线 16 位的 AMD 386SX，内置 CD-ROM 与软盘，向后兼容早期 FM Towns 游戏 | "released in 1993 by Fujitsu, exclusively for the Japanese market… AMD 386SX, a CPU that is internally 32-bit but with a 16-bit data bus… built-in CD-ROM drive and disk drive… backward-compatible with older FM Towns games" | FM Towns Marty |
| 18 | 32X 是 Genesis 的加挂，使用自己的 ROM 卡带与独立游戏库 | "add-on for the Sega Genesis… uses its own ROM cartridges and has its own library of games" | 32X |
| 19 | Game Boy Color 1998-10-21 日本上市，彩色 TFT、CPU 最高两倍速、内存四倍、向下兼容 | "released in Japan on October 21, 1998… color TFT screen instead of monochrome, a CPU running at up to twice the speed, and four times as much memory… backward compatible" | Game Boy Color |
| 20 | Neo Geo Pocket 1998-10 日本上市，标志 SNK 进入掌机市场 | "released in Japan in October 1998, marking SNK's entry into the handheld gaming market" | Neo Geo Pocket |
| 21 | WonderSwan 1999-03 日本上市，由万代与 Koto Laboratory 合作开发，是 Gunpei Yokoi 参与的最后一件硬件 | "released in Japan by Bandai. Developed in collaboration with Gunpei Yokoi's company Koto Laboratory… final piece of hardware Yokoi worked on… launched in Japan in March 1999" | WonderSwan |
| 22 | Dreamcast 1998-11-27 日本上市，1999 年末全球发售；世嘉最后一款家用机；以现成元器件压低成本 | "final home video game console manufactured by Sega… released in Japan on November 27, 1998, and worldwide in late 1999… designed to reduce costs with off-the-shelf components" | Sega Dreamcast |
| 23 | Pippin 是苹果设计的开放式多媒体平台，基于经典 Mac OS 架构 | "a defunct open multimedia technology platform, designed by Apple Computer… based on the Macintosh platform" | Apple Pippin |
| 24 | Chiptune 使用 PSG 芯片或合成器创作，是一类电子音乐风格与亚文化 | "a style of electronic music and musical subculture using the programmable sound generator (PSG) sound chips or synthesizers" | Chiptune |
| 25 | 帧率是连续帧被采集或显示的频率，单位 FPS；在图形学中也是渲染能力的度量 | "the frequency (rate) at which consecutive images (frames) are captured or displayed… In the context of computer graphics performance, FPS is the rate a system… is able to" | Frame rate |
| 26 | 贴图映射是把 2D 图像投影到 3D 模型表面的操作，最常见变体是 UV 展开 | "a term used in computer graphics to describe how 2D images are projected onto 3D models. The most common variant is the UV unwrap" | Texture mapping |
| 27 | 主机是输出视频信号的电子设备；家用机固定放置连接电视，掌机自带显示与操控 | "an electronic device that outputs a video signal or image… home consoles, which are generally placed in a permanent location connected to a television… handheld consoles… have their own display unit" | Video game console |

---

## 3. 机型导览（首页「机型导览」区块）

导览中的 15 款机型，其**名称、厂商与发行年份**同样来自上表对应的百科条目；
「位数」等硬件参数取自这些条目的通行记述，并在首页「来源与差异说明」中
显式标注了"不同来源存在差异"这一限制。

机型 id 与其主来源条目的对应：

| 机型 id | 主来源条目 |
| --- | --- |
| `pc-engine` | TurboGrafx-16 |
| `mega-drive` | Sega Genesis |
| `snes` | Super Nintendo Entertainment System |
| `neo-geo-aes` | Neo Geo |
| `game-gear` | Game Gear |
| `3do` | 3DO |
| `jaguar` | Atari Jaguar |
| `saturn` | Sega Saturn |
| `playstation` | PlayStation |
| `virtual-boy` | Virtual Boy |
| `n64` | Nintendo 64 |
| `game-boy-color` | Game Boy Color |
| `neo-geo-pocket` | Neo Geo Pocket |
| `dreamcast` | Sega Dreamcast |
| `wonderswan` | WonderSwan |

---

## 4. 候选但未采用的来源（核验记录）

以下站点在 2026-10-21 的核验中对脚本请求返回 403 / 404 / 连接失败，
因此**未**写入展品的 `sourceUrls`（避免给出不稳定或不可达的链接）：

| URL | 状态 | 处置 |
| --- | --- | --- |
| `https://www.sega.jp/history/hard/` | 403 | 站点拒绝脚本 UA，改用 Sega Genesis / Sega Saturn 条目 |
| `https://www.sega.jp/history/soft/` | 403 | 同上 |
| `https://americanhistory.si.edu/collections/object-groups/computers` | 403 | 同上 |
| `https://www.britannica.com/technology/video-game` | 403 | 同上 |
| `https://www.internetarchive.org/` | 连接失败 | 未采用 |
| `https://www.museumofplay.org/games/` | 404 | 改用站点首页 `https://www.museumofplay.org/` |
| `https://www.museumofplay.org/games/nintendo-64/` | 404 | 同上 |
| `https://www.nintendo.co.jp/corporate/en/history/hardware/index.html` | 404 | 改用 `https://www.nintendo.co.jp/corporate/en/history/index.html`（200） |
| `https://en.wikipedia.org/wiki/Atari_Jaguar_(console)` | 404 | 正确条目为 `https://en.wikipedia.org/wiki/Atari_Jaguar` |
| `https://en.wikipedia.org/wiki/Sega_Super_CD-ROM` | 404 | 改用 32X / Neo Geo 条目 |
| `https://en.wikipedia.org/wiki/RAM_cartridge` | 404 | 未采用 |
| `https://en.wikipedia.org/wiki/Virtual_Boy_(game)` | 404 | 正确条目为 `https://en.wikipedia.org/wiki/Virtual_Boy` |

**核验通过且可作为交叉参照的一手 / 馆方站点**（未写入展品 `sourceUrls`，
仅在本文件留档以便策展复核）：

| URL | 状态 |
| --- | --- |
| `https://www.nintendo.co.jp/corporate/en/history/index.html` | 200 |
| `https://www.museumofplay.org/` | 200 |
| `https://www.computerhistory.org/` | 200 |
| `https://collection.sciencemuseumgroup.org.uk/` | 200 |
| `https://www.worldvideogamehalloffame.org/` | 200 |
| `https://segaretro.org/` | 200 |
| `https://en.wikipedia.org/wiki/Template:Video_game_consoles` | 200 |

---

## 5. 局限声明

1. **代表性选样，非编年全集**。本展厅只覆盖 1990 年代家用机市场中具有代表性的一批机器与技术，
   不宣称穷尽该时期的全部主机、掌机、附件与作品。
2. **单源条目占比高**。20 条展品中有 13 条仅引用单一百科条目，未做多源互证。
   这在"发行年份、厂商、硬件配置"等稳定事实上风险较低，但**不能替代**正式出版物的考证。
3. **百科类属次级来源**。百科条目本身存在编辑争议与表述差异；
   本展厅在"位数""市场地位"等易生分歧处已在首页写明口径限制。
4. **"早期 3D 时代"的界定由本展厅自定**。本展厅把 1993—1998 年间引入
   多边形加速与 CD 媒体的机器归入这一阶段，这是一条策展上的划分，不是行业公认分期。
5. **没有使用任何商业游戏的封面、截帧、说明书或音乐**；展品配图全部为运行时程序化生成的抽象图形。

---

## 6. 引用 ≠ 授权

本文件记录的是**科普引用**：指向公开可查的史料来源，用于让读者自行复核展品中的事实陈述。
它不构成对任何来源站点、厂商或作品作者的授权、背书、转载许可或从属关系声明。
引用不改变相关内容的著作权归属。
