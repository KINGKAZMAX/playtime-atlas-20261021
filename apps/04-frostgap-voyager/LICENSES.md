# 许可与来源（LICENSES）

《霜隙远航 · Frostgap Voyager》

---

## 1. 本项目代码与素材

| 项目 | 许可 | 说明 |
| --- | --- | --- |
| `src/**` 全部源代码 | MIT | 由 MiniMax Code（M3.1-Flash / max）为本任务原创编写 |
| `index.html` / `src/styles.css` 内的 SVG 字标与徽记 | MIT | 原创手绘路径 |
| `src/styles/tokens.css` 的 token 取值 | MIT | 取自本批 16-design-system 的 `design-tokens.json`（同批原创） |
| 运行时生成的所有贴图（行星、环带、星云、恒星、船体、标签、辉光） | MIT | 由 `src/gfx/Procedural.js` 在浏览器内实时合成，无源文件 |
| 运行时生成的所有音效（引擎、后燃器、扫描、跃迁、撞击、提示音） | MIT | 由 `src/audio/AudioEngine.js` 用 WebAudio 振荡器实时合成，无音频文件 |
| 文档（README / CONTROLS / QA / CHANGELOG / SOURCE-AND-DIFFERENCES / RESTYLE-MAP / TASK / STATUS） | MIT | 原创撰写 |

除第 3 节列出的三个 OFL 字族外，本项目**未使用**任何第三方美术、音频、模型或文本资源。

---

## 2. 第三方依赖

均为 npm 本地安装，随工程交付，运行期不发起任何网络请求。

| 名称 | 版本 | 许可 | 版权 | 用途 |
| --- | --- | --- | --- | --- |
| three | 0.169.0 | MIT | © 2010–2024 three.js authors | WebGL 渲染引擎 |
| vite | 5.4.11 | MIT | © 2019–2024 VoidZero Inc. & Vite contributors | 开发服务器 / 静态构建 |

> 许可证全文见 `node_modules/three/LICENSE` 与 `node_modules/vite/LICENSE`。

### 开发期工具（不属于交付运行依赖）

| 名称 | 版本 | 许可 | 用途 |
| --- | --- | --- | --- |
| playwright | 1.64.1 | Apache-2.0 | `qa/qa.mjs` 自动化验收（仅测试期使用，不进入 `dist/`） |

---

## 3. 字体

本项目**自托管**三个开源字族（OFL 1.1），字体二进制随工程一起分发，
运行期从本地 `dist/assets/*.woff2` 加载，**不引用任何 CDN / Google Fonts**。

| 字族 | 文件 | 许可 | 版权 | 用途 |
| --- | --- | --- | --- | --- |
| Space Grotesk | `src/fonts/space-grotesk-latin.woff2`（34,788 B） | OFL-1.1 | © 2018 Florian Karsten | 展示字（标题、字标、导航） |
| Inter | `src/fonts/inter-latin.woff2`（132,684 B） | OFL-1.1 | © The Inter Project Authors | 正文字 |
| Space Mono | `src/fonts/space-mono-regular.woff2`（14,884 B）<br>`src/fonts/space-mono-bold.woff2`（15,000 B） | OFL-1.1 | © 2020 Colophon Foundry / 2016 Matthew T. Milham | 等宽（坐标、编号、键位） |

许可证全文随包分发，位于 `public/licenses/`（构建后复制到 `dist/licenses/`）：

| 文件 | 对应字族 |
| --- | --- |
| `OFL-space-grotesk.txt` | Space Grotesk |
| `OFL-inter.txt` | Inter |
| `OFL-space-mono-regular.txt` | Space Mono Regular |
| `OFL-space-mono-bold.txt` | Space Mono Bold |

字体取用自本批 16-design-system 的 `fonts/`（同一套 OFL 授权文件），只复制二进制与许可证，
不复制其 CSS 或文档。`@font-face` 声明见 `src/fonts/fonts.css`（`font-display: swap`）。

### 3.1 中文字形（不随包分发）

字体栈里保留了 `"Noto Sans SC"` 族名，但**本目录不分发任何 CJK 字体文件**：

- 16 提供的 `noto-sans-sc-subset.woff2` 是**部分覆盖**子集（`coverage.status = "partial"`，
  由 07-museum-art 按其自身用字生成）。本作界面以中文为主，发一个覆盖不全的 CJK 字体会导致
  同一行内字形在「子集」与「系统黑体」之间混排。
- 因此改为：命中用户系统已安装的 `Noto Sans SC` 则使用，否则回退系统黑体
  （PingFang SC / Hiragino Sans GB / Microsoft YaHei）。栈顺序与 16 保持一致。

### 3.2 其余素材

除上述三个字族外，本项目未嵌入任何第三方美术、音频、模型或文本资源；
所有贴图与音效均为运行时程序化生成（见第 1 节）。

---

## 4. 商标与品牌

本作的标题《霜隙远航 / Frostgap Voyager》、飞船「霜隙号 FG-1」以及全部天体
（伊尔达、维岚、霜隙、柯莱、莫恩、灯塔站、卡尔索阵列、碎屑回廊）均为**原创命名**，
与任何既有商业作品、商标或品牌标识无关。

---

## 5. 免责与来源说明

- 本作**不是**任何已发行商业游戏的复刻、移植或重制，仅借鉴太空飞行品类中公开可见的
  通用机制（详见 [SOURCE-AND-DIFFERENCES.md](SOURCE-AND-DIFFERENCES.md)）。
- 未复制任何未授权 ROM、商业游戏资源或品牌视觉。
- 无外部资料引用；全部视觉与听觉输出均为程序化生成的抽象表达。
