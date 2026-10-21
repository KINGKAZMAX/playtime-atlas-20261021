# 许可说明 / LICENSES

## 一、本目录内的内容

| 类别 | 归属 | 说明 |
| --- | --- | --- |
| 源代码（`src/`、`tests/`、`scripts/`） | 本批原创 | 随批次仓库许可分发 |
| 构建配置（`vite.config.js`、`package.json`、`manifest.json`） | 本批原创 | — |
| 文档（`README.md`、`SOURCES.md`、`DIFFERENCES.md`、`LICENSES.md`、`QA.md`、`STATUS.md`、`TASK.md`） | 本批原创 | — |
| 视觉素材 | 本批原创 | **100% Canvas 2D 程序化绘制**，无位图文件、无 SVG 素材、无图标字体 |
| 音效 | 本批原创 | **100% WebAudio 振荡器与噪声缓冲实时合成**，无音频文件、无采样 |
| 字体 | **第三方 OFL 1.1（自托管）** | 改版后自托管 Space Grotesk / Inter / Space Mono（拉丁）+ 系统中文栈，见下节「二」 |

**本目录不包含任何第三方图片 / 音频 / 模型 / ROM 素材**——这是「原创重新演绎」定位最硬的证据，也是运行期能做到零 CDN、零在线接口、离线自足的前提。

唯一的第三方二进制是**自托管的 OFL 1.1 字体文件**（4 个 `.woff2`，合计 197 356 B），已按许可随包附全文。

依赖情况：

- 运行时依赖：**0**
- 构建期依赖：`vite@5.4.11`（MIT，仅开发期使用，不进入产物）

---

## 二、第三方资源 · 自托管字体（改版新增）

改版依据 `16-design-system/MIGRATION-NOTES.md` §8「字体与许可」。四个字体取自
`16-design-system/fonts/`（同批 vendored 的 OFL 1.1 字体），**仅复制，未修改来源目录**；
许可全文一并复制到本目录 `assets/ds/fonts/`（与 `assets/ds/fonts/fonts.css` 同目录，
`@font-face` 用相对路径 `url("./xxx.woff2")` 解析）。

| 字体族 | 角色 | 文件 | 字节 | 许可 | 许可全文 | 来源 URL | 版权声明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Space Grotesk | 展示体（标题） | `assets/ds/fonts/space-grotesk-latin.woff2` | 34 788 | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-space-grotesk.txt` | <https://github.com/floriankarsten/space-grotesk> | Copyright 2020 The Space Grotesk Project Authors |
| Inter | 正文 | `assets/ds/fonts/inter-latin.woff2` | 132 684 | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-inter.txt` | <https://github.com/rsms/inter> | Copyright 2020 The Inter Project Authors |
| Space Mono（400） | 等宽 | `assets/ds/fonts/space-mono-regular.woff2` | 14 884 | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-space-mono-regular.txt` | <https://github.com/sharanda/space-mono> | Copyright 2020 The Space Mono Project Authors |
| Space Mono（700） | 等宽粗 | `assets/ds/fonts/space-mono-bold.woff2` | 15 000 | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-space-mono-bold.txt` | <https://github.com/sharanda/space-mono> | Copyright 2020 The Space Mono Project Authors |

**合规要点**

| 项 | 状态 |
| --- | --- |
| 自托管 | ✅ 字体文件在本目录 `assets/ds/fonts/`，由 Vite 打进 `dist/assets/*.woff2` |
| CDN / 外链字体 | ✅ **零**——无 `fonts.googleapis.com`、无 `@import url(https://…)`、运行期外部请求数为 0 |
| 许可登记 | ✅ 四份 OFL 1.1 全文随包 |
| `font-display` | ✅ `swap`（避免 FOIT 阻塞） |
| 预加载 | ✅ 只预加载首屏用到的 2 个拉丁字体（Space Grotesk / Inter），汉字不预加载 |
| 字体族名一致性 | ✅ 与 16 的 `fonts/FONT-MANIFEST.json` 一致（Space Grotesk / Inter / Space Mono） |

**中文策略**：走**系统字体栈**（`PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei` / `Source Han Sans SC`），零字节、始终可用。
16 自带的 `noto-sans-sc-subset.woff2`（197 600 B）**本目录未采用**——该子集按 07 的用字生成，
覆盖不了本目录的汉字，引入只会给仓库与产物各多背约 197 KB；`MIGRATION-NOTES.md` §8 亦明确「中文优先系统栈」。
对应的 `OFL-noto-sans-sc.txt` 一并未复制。

**字体栈顺序**（2026-10-21 规范修正）：覆盖完整的 CJK 族必须排在覆盖有限的子集之前，否则缺字会逐字回退、
造成同段文字混排基线错位。本目录的 `--ds-font-display` / `--ds-font-text` 已采用该顺序
（拉丁自托管 → 完整覆盖的系统 CJK 栈 → Noto Sans SC 子集 → sans-serif）；
由于本目录不加载该子集，栈中的 `"Noto Sans SC"` 只是从不生效的占位名，顺序规则天然满足。

**与参考站的关系**：参考站 https://olek.si/ 使用 5 个自研 / 商用 woff2（display / text / inter / interd / interr）。
本目录**未下载、未再分发其中任何一个**，字体全部取自同批开源项目。

---

## 三、参考作品

展厅叙事涉及以下早期电子游戏作品。它们的著作权、商标与美术**均归各自权利人所有**：

- *Cathode-Ray Tube Amusement Device*（1948，Goldsmith & Mann）
- *Nimrod*（1951，Ferranti International）
- *OXO*（1952，A. S. Douglas / EDSAC）
- *Tennis for Two*（1958，William Higinbotham / Brookhaven）
- *PLATO*（1960–，伊利诺伊大学）
- *Spacewar!*（1962，Steve Russell 等 / MIT）
- *Sketchpad*（1963，Ivan Sutherland）
- *Computer Space*（1971，Nolan Bushnell & Ted Dabney）
- *Magnavox Odyssey*（1972，Ralph Baer / Sanders Associates）
- *Pong*（1972，Atari / Allan Alcorn）
- *Space Invaders*（1978，Taito）
- *Asteroids*（1979，Atari）

### 本项目对这些作品做了什么 / 没做什么

**做了**：
- 在展厅叙事中**提及并链接**它们，用于历史研究与事实陈述；
- 引用它们的**公开机制描述**（如「示波器上的一个亮点」「两艘飞船在引力井中缠斗」）作为原创玩法的**灵感来源**。

**没做**：
- 没有复制任何 ROM、卡带镜像、关卡数据或反编译结果；
- 没有使用它们的商标、logo、角色形象、配色方案或受版权保护的美术；
- 没有复刻它们的规则到「可辨认为同一作品」的程度；
- 没有把它们的素材放进本目录。

---

## 四、引用与授权的区别

> **引用 ≠ 授权。**

本项目在 [`SOURCES.md`](./SOURCES.md) 中引用第三方页面，是为了**支撑可核验的史实陈述**——例如「Tennis for Two 于 1958-10-18 首次公开」「Spacewar! 运行在 DEC PDP-1 上」。这类引用属于事实性表述的出处标注。

**引用某机构的页面，不代表获得该机构对其内容或商标的授权，也不代表该机构认可本作品。**

各机构页面上的图片、照片、商标与版式设计**未**被复制进本项目。展厅内出现的所有图像均为程序化绘制。

---

## 五、可点击出处的性质

展厅长廊里每一个「出处」角标都指向**机构的原始页面**，便于读者自行复核。本项目对外部站点做的是**只读引用**：

- 不做任何形式的抓取、镜像、缓存或再分发；
- 不在运行期请求任何外部 URL（**运行期外部请求数 = 0**）；
- 外部页面全部失效时，展厅仍可完整运行，只是出处链接需要读者自行判断。

---

## 六、第三方依赖许可

| 依赖 | 版本 | 许可 | 是否进入产物 |
| --- | --- | --- | --- |
| vite | 5.4.11 | MIT | 否（仅构建期） |
| Space Grotesk / Inter / Space Mono | 见上节 | SIL OFL 1.1 | 是（自托管 woff2，随页面加载） |

Vite 及其传递依赖的许可文本随 `node_modules` 与 `package-lock.json` 中的元数据保留。

---

## 七、声明

本项目是一件**历史题材的原创作品**，不是任何历史作品的复刻、移植或可运行副本。若权利人认为任何表述或呈现构成侵权，请通过批次仓库的 issue 反馈，我们会立即核对并调整。
