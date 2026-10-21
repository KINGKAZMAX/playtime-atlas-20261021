# LICENSES — 素材与引用许可

> 原则：**引用 ≠ 授权**。本目录引用第三方站点的事实性内容与公开元数据，
> 但**不分发**任何第三方图片、视频、ROM、游戏画面或品牌视觉。

## 1. 本目录自身的产出许可

| 产出 | 许可 | 说明 |
| --- | --- | --- |
| `catalog.json` 全部 `summary` / `significance` / `titleZh` | 本项目原创（CC BY 4.0 或 MIT，由 14-publish 统一决定） | 全部由本任务撰写，非复制参考站文案 |
| `catalog.json` 的 `year` / `platform` / `creator` 等事实字段 | **事实本身不受版权保护**；来源 URL 已逐条标注 | 采用 CC BY-SA 或公有领域条目时仍按其条款署名 |
| `REFERENCE-DESIGN.md` 的观察与建议 | 本项目原创 | 对各站交互、美术、许可的**描述性**记录 |
| `scripts/*` | 本项目原创 | — |
| `screenshots/*.png` | **仅供内部研究存档，不随交付包再分发** | 见 §3 |

## 2. 被引用的外部来源

| 来源 | 引用内容 | 条款（实测原文要点） | 风险控制 |
| --- | --- | --- | --- |
| **English Wikipedia** | 逐条目的年代、平台、创作者、机制描述（`sourceUrls` 主来源） | 文本以 CC BY-SA 4.0 授权；条目各自另有 GFDL 兼容条款 | 按条目页脚要求署名"取自 Wikipedia（条目名，CC BY-SA）"；**不复制整段正文**，只写事实性转述 |
| **Wikimedia Commons** | 每条首图的许可状态（`imageLicense` / `imageLicenseRaw` / `imageLicenseUrl`） | 逐文件独立许可 | 仅**登记**许可状态；默认不取用图片 |
| **The Strong National Museum of Play** | 时间线结构、在线展分类维度、Hall of Fame 展签页形态 | "in accordance with Creative Commons licenses, you may download material for your personal, non-commercial use…"; "No use of The Strong's logos or other design trademarks… will be allowed unless specific approval has been granted" | 引用其**结构与做法**；不复制其紫黄配色、斜切母题、logo、展陈文案与图片 |
| **National Videogame Museum (UK)** | 访客身份分流（P1–P4）、展陈命名方式 | "Copyright © 2026. National Videogame Museum. All rights reserved." | 仅机制参考；不复用其页面与图片 |
| **National Videogame Museum (USA)** | 装置命名（巨型乒乓、主机时间线、复原卧室） | 未声明开放许可，按 ARR 处理 | 同上 |
| **Computer History Museum** | 分面筛选维度（媒体类型 + 年份区间）、Discovery Wall | "© 2025 Computer History Museum"；藏品图片逐件权利声明 | 仅机制参考 |
| **Centre for Computing History** | 馆藏统计口径、Time Line 概念 | 登记慈善机构 1130071，未见开放许可声明 | 同上 |
| **Museum of the Game / KLOV** | 多轴浏览维度、The Arcade Flyer Archive 的策展思路 | 站内版权归属混合，图片多需逐件确认 | 同上；**不使用其扫描件** |
| **Internet Archive** | 条目级许可字段的展示范式、浏览器内模拟器的可玩入口做法 | **逐条目**许可 | 我们的"可玩入口"只链接合法来源，**不打包任何 ROM** |
| **Emulation Nation (emulatorzone.com)** | 主机档案的分栏结构 | "Text is available under the Creative Commons Attribution-ShareAlike License" | ✅ **唯一可直接引用的正文**；引用时须署名 + 相同方式共享，且图片另计 |
| **Games That Weren't** | "未竟之物"反历史档案的策展概念 | "Games That Weren't® is the registered trademark of Frank Gasking"；配套出版物为 CC BY-NC-ND 4.0 | 商标与封面图**均不可用**；仅借鉴策展概念 |
| **Google Arts & Culture** | 实体 + 故事线的浏览模型、沉浸式版面取向 | 各合作馆方各自权利，无统一许可 | 仅借鉴信息架构；不内嵌其图库 |
| **Old Computer Museum** | 逐台图文档案的写法 | 未见开放许可声明 | 站点功能未完成，**不作为事实来源** |
| **Video Game History Foundation** | "主机 → 游戏 → 玩/对战"的两级下钻模型 | "© The National Video Game History Museum. All rights reserved." | 仅机制参考 |
| **Nintendo Museum / EmuDocs / EmulatorHome** | — | — | **本次网络不可达，未纳入研究**，故无任何引用 |

## 3. 截图存档的处理

`screenshots/` 下的 PNG 是**Ego 浏览器抓取的参考站页面快照**，用途是内部研究取证，
让 06/07 能看到各站真实的布局与视觉形态。

- 各站页面版权归其所有者，多数为 ARR / CC-NC；**这些 PNG 不随交付包一起公开发布**。
- `screenshots/INDEX.tsv` 记录了每张图的 URL、HTTP 状态、字节数与抓取时间，便于复核。
- 若 14-publish 需要发布"参考站一览"，建议改为**文字表格 + 外链**（即 `REFERENCE-DESIGN.md` §1–§14 的形式），**不内嵌图片**。

## 4. 本项目明确不使用的东西

- ❌ 任何商业游戏的 ROM、卡带镜像、游戏内截图、动画、音频、字体。
- ❌ 任何参考站的 logo、商标、专有字体、品牌色组合、专有插画与文案。
- ❌ 未经逐件确认许可的 Wikimedia Commons 图片（默认只登记，不取用）。
- ❌ 抓取自 Google Street View / Google Maps 的第三方影像。

## 5. 主站侧建议（写给 06 / 07 / 14）

1. **配图一律程序化生成**：由 07 的美术包产出深墨蓝 + 暖纸白 + 信号橙的抽象图形，
   保证无第三方权利问题，且天然与参考站形成差异。
2. **字体自托管许可字体**（如 SIL OFL 授权字体），避免引用系统商业字体。
3. **展品名以编目事实出现**，不做成品牌化主视觉；中文展签名以本项目自拟的 `titleZh` 为准。
4. 若确实需要某张外部图片（如某台硬件的历史照片），先到 Commons 文件页确认许可并记录到
   `LICENSES.md`，再由 13-qa-curation 复核。

## 6. 目录页源码的素材边界（2026-10-21 改版准备新增）

目录页源码（`src/catalog-page/`）与构建产物（`dist/`）**未引入任何第三方素材**，登记如下：

| 项 | 现状 | 许可结论 |
| --- | --- | --- |
| 字体（拉丁正文 / 显示 / 等宽） | **自托管 OFL 字体**（见 §6.1）：`Inter`（正文）、`Space Grotesk`（显示）、`Space Mono`（等宽） | 全部 SIL OFL 1.1，**可再分发**；许可原文随包附（`assets/ds/fonts/OFL-*.txt`），登记见 §6.1 |
| 字体（中文） | 系统 CJK 栈优先（`PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei` / `Source Han Sans SC`），`Noto Sans SC` 子集为渐进增强 | 中文优先用系统字体栈（0 字节、离线可用、覆盖全字形）；随包的 Noto Sans SC 子集**只覆盖本页汉字的 57.5%**，按 `FONT-MANIFEST.json → systemFallbacks.cjk` 的既定策略与 16 的上游修正（2026-10-21 22:25），子集**排在系统栈之后**（详见 `RESTYLE-CHECKLIST.md` §11.3） |
| 图标 / 配图 | favicon 为**内联 data URI 的本项目自绘 SVG**（圆角矩形 + 双圆，朱砂 `#b4432b` / 青绿 `#2e6a5e` 描边） | 本项目原创，无第三方权利 |
| 样式表 | `catalog.css` 本项目手写；`assets/ds/tokens.css` 与 `assets/ds/components.css` 为 **16-design-system 产出**的副本（与原件逐字节一致） | 本项目原创 + 本批设计系统产出，可再分发 |
| 脚本 | `build-catalog-page.mjs`（构建期）+ 页面内联筛选脚本（运行期） | 本项目原创，**无 CDN、无外链字体、无运行期外部 API** |
| 条目数据 | 全部来自本目录 `catalog.json`（文字事实 + 来源链接） | 见 `SOURCES.md` 逐条台账；链接指向第三方来源，**引用不等于授权** |

### 6.1 随包分发的自托管字体（2026-10-21 改版第 2 步引入）

来源：`16-design-system/fonts/`（由 16-design-system 从本批 07-museum-art / 06-museum-core 已 vendored 的
同一批 OFL 文件复制而来，**未从参考站 https://olek.si/ 下载、未再分发其任何字体**）。
本目录落点：`src/catalog-page/assets/ds/fonts/` → 构建到 `dist/assets/ds/fonts/`。

| 字体族 | 角色 | 文件 | 字节 | 许可 | 版权 | 来源 |
| --- | --- | --- | --- | --- | --- | --- |
| Space Grotesk | display（标题） | `space-grotesk-latin.woff2` | 34 788 | SIL OFL 1.1（`OFL-space-grotesk.txt`） | Copyright 2020 The Space Grotesk Project Authors | https://github.com/floriankarsten/space-grotesk |
| Inter | text（正文） | `inter-latin.woff2` | 132 684 | SIL OFL 1.1（`OFL-inter.txt`） | Copyright 2016 The Inter Project Authors | https://github.com/rsms/inter |
| Space Mono | mono（年份 / 编号 / 元信息） | `space-mono-regular.woff2` / `space-mono-bold.woff2` | 14 884 / 15 000 | SIL OFL 1.1（`OFL-space-mono.txt`） | Copyright 2020 The Space Mono Project Authors | https://github.com/SpaceMono/SpaceMono |
| Noto Sans SC | 中文渐进增强（**子集**） | `noto-sans-sc-subset.woff2` | 197 600 | SIL OFL 1.1（`OFL-noto-sans-sc.txt`） | Copyright The Noto Project Authors | https://github.com/notofonts/noto-cjk |

- 全部为 **SIL Open Font License 1.1**，允许再分发；许可原文已随包附在 `assets/ds/fonts/`。
- `@font-face` 全部使用**相对 URL**（相对 `fonts.css` 所在目录），运行期**零外部请求**（实测外部请求 0）。
- `font-display: swap`；汉字走系统字体栈，Noto 子集仅作渐进增强。
- 完整清单与来源溯源见 `assets/ds/fonts/FONT-MANIFEST.json`（16 出具）。

**本页未引入任何其他第三方素材**：图标是内联 data URI 的本项目自绘 SVG；样式表与脚本均为本项目手写；
条目数据全部来自本目录 `catalog.json`（文字事实 + 来源链接，见 `SOURCES.md` 逐条台账）。
