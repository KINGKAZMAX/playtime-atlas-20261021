# LICENSES — 资产许可与授权边界

> 《联机曙光 LINK DAWN》2000s 可玩展厅 · 任务 `11-era-online`

---

## 1. 结论先说

**本目录交付的全部内容，其著作权均属于本任务的执行方（MiniMax Code / M3.1-Flash），
以本仓库的许可证为准。目录内不包含任何需要额外授权才能分发的第三方素材；
视觉层按 `16-design-system`（同批原创）以拷贝方式接入，随包分发的第三方资产仅有 SIL OFL 1.1 字体，许可全文随包，可自由再分发。**

- ❌ 无 ROM、无游戏录像、无商业游戏截图
- ❌ 无厂商 Logo、无品牌标识、无商标字体
- ❌ 无第三方美术、音频文件
- ❌ 无未授权的贴图 / 精灵图 / 音频采样
- ❌ 无凭据、日志、私有文件
- ✅ 唯一的第三方资产是 5 款 **SIL OFL 1.1** 自托管字体（见 §2.1），随包附许可全文
- ✅ 设计系统 CSS（令牌层 / 组件层）为**同批原创**的逐字节拷贝，许可为「可自由使用与修改」

---

## 2. 逐项素材来源

| 素材 | 来源 | 许可 |
| --- | --- | --- |
| **全部代码**（`src/**`） | 本任务手写 | 本仓库许可证 |
| **点阵字体**（`src/core/pixelFont.ts`） | 本任务**逐字手写**的 5×7 位掩码字形表（A–Z / 0–9 / 标点 / 方向符） | 本仓库许可证；**不取自任何商业点阵字体或厂商字库** |
| **展项 A 美术**（`src/games/defense/render.ts`） | 全部由 Canvas 2D **程序化绘制**：几何图形、线性/径向渐变、粒子、矢量塔体 | 本仓库许可证 |
| **展项 B 美术**（`src/games/handheld/render.ts`） | 全部由 Canvas 2D **程序化绘制**：瓦片、建筑、角色、蟹、碎片、灯芯 | 本仓库许可证 |
| **展项 B 地图**（`src/games/handheld/world.ts`） | 本任务**手工排布**的 20×18 字符网格 | 本仓库许可证 |
| **全部音效**（`src/core/audio.ts`） | WebAudio **实时合成**（振荡器 + 包络 + 程序化噪声缓冲），无音频文件 | 本仓库许可证 |
| **头部装饰画**（`src/shell/heroCanvas.ts`） | Canvas 2D 程序化绘制 | 本仓库许可证 |
| **图标** | 内联 SVG（`index.html` 中的 favicon），原创绘制 | 本仓库许可证 |
| **网页字体** | 见下方 §2.1：5 款 SIL OFL 1.1 字体（Space Grotesk / Inter / Space Mono ×2 / Noto Sans SC 子集），自 `16-design-system/fonts/` **拷贝**至 `public/assets/ds/fonts/`，**自托管、无 CDN、无外链** | SIL Open Font License 1.1（许可全文随包） |
| **设计系统令牌层 / 组件层**（`public/assets/ds/tokens.css`、`components.css`） | `16-design-system/src/`，**逐字节拷贝、未修改** | 与本批同源原创（16 的 `LICENSES.md` §2 登记为「本项目原创，随本批交付，可自由使用与修改」） |
| **依赖** | 仅 `vite@5.4.11` + `typescript@5.6.3` 两个 **devDependency** | MIT / Apache-2.0 |
| **运行时依赖** | **零** | — |

---

## 2.1 自托管网页字体（改版接入，全部 OFL 1.1）

字体文件取自 `16-design-system/fonts/`（同批 OFL 字体），按派单口径以**拷贝**方式接入：
`16-design-system/fonts/` → 本目录 `public/assets/ds/fonts/`（构建后落到 `dist/assets/ds/fonts/`），
**逐文件 sha256 与源文件一致、未改动一个字节**。许可全文随包复制到本目录 `licenses/`，
并在 `public/assets/ds/fonts/` 内另存一份（与字体同目录发布）。

| 字体 | 文件（`public/assets/ds/fonts/`） | 字节 | 字重 | 许可 | 许可全文 | 用途 |
| --- | --- | --- | --- | --- | --- | --- |
| Space Grotesk | `space-grotesk-latin.woff2` | 34 788 | 300–700 | SIL OFL 1.1 | `licenses/OFL-space-grotesk.txt` | 展示字体（标题、区块标题） |
| Inter | `inter-latin.woff2` | 132 684 | 100–900 | SIL OFL 1.1 | `licenses/OFL-inter.txt` | 正文字体 |
| Space Mono Regular | `space-mono-regular.woff2` | 14 884 | 400 | SIL OFL 1.1 | `licenses/OFL-space-mono-regular.txt` | 年份 / 编号 / 等宽数字 |
| Space Mono Bold | `space-mono-bold.woff2` | 15 000 | 700 | SIL OFL 1.1 | `licenses/OFL-space-mono-bold.txt` | 等宽强调 |
| Noto Sans SC（子集） | `noto-sans-sc-subset.woff2` | 197 600 | 100–900 | SIL OFL 1.1 | `licenses/OFL-noto-sans-sc.txt` | 汉字渐进增强（覆盖有限，排在系统 CJK 栈之后） |

- 清单与版权声明原文另见 `public/assets/ds/fonts/FONT-MANIFEST.json`（与 `licenses/FONT-MANIFEST.json` 同源）。
- **运行期零外部请求**：全部字体随 `dist/` 本地分发，不引用任何 CDN / `fonts.googleapis.com`。
- **字体回退顺序**：`--ds-font-*` 取自 16 的 `tokens.css` 原件 —— **覆盖完整的系统 CJK 族排在
  覆盖有限的 Noto Sans SC 子集之前**，避免同一段文字混入两套度量不同的字形（混排基线错位）。
- 展项 A / 展项 B 画布内使用的 5×7 点阵字形表（`src/core/pixelFont.ts`）是本任务**逐字手写**的 Canvas 绘制字形，
  **不是 Web 字体**，不涉及任何字体授权。

---

## 3. 关于「参考」与「差异」

本展厅**参考了公开可考的机制类型**，这是设计层面的借鉴，不涉及任何素材复制：

| 参考的机制类型 | 本展厅的原创实现 | 差异 |
| --- | --- | --- |
| 格子建造 + 升级 + 波次防守的循环 | 《灯塔协议》的**双航道**结构、**4 种塔各 3 级**的数值体系、**晶格/能量双资源** | 战场布局、塔的定位与数值、敌人构成、**灰烬航道 AI 对手**机制全部自创；塔与敌人的外观为原创几何图形 |
| 掌机的双屏结构与点阵取景 | 《口袋回声》的**原创掌机外壳**（暮港青 + 琥珀色，非任何厂商工业设计）、**自制 5×7 点阵字体**、**暮港 5 阶色板** | 地图、角色、道具、机关、配色、外壳造型全部自创；「双屏」是 2004 年掌机的公开历史特征（已附来源），不是对某一台具体设备的复制 |
| 主机与 PC 的账号化在线服务 | 仅作为**史料讲解主题**呈现 | 展厅**不实现**任何联网功能 |

**明确声明：**

- 本展厅**不声称原创**任何参考作品。
- 本展厅**不复制**任何商业游戏、掌机界面、厂商外壳或品牌视觉。
- 展厅中出现的《World of Warcraft》《Steam》《Nintendo DS》等名称仅为**史实引用**，
  属于合理使用的指称性引用，页面已附来源链接，未使用其任何受保护资产。

---

## 4. 关于来源站点

展厅通过超链接引用了 65 个外部页面（详见 [`SOURCES.md`](./SOURCES.md)）。需要明确：

> **引用 ≠ 授权。** 本展厅**只做链接指称**，不复制、不再分发这些站点的
> 图片、字体、商标、Logo、文本段落或任何其他受版权保护的内容。
> 各站点的内容版权归其各自权利人所有。

- 展厅内**不使用**任何来源站点的图片或商标。
- 页面上的「官方 / 百科」角标只是**来源类型的文字标记**，不是官方标识，也不是商标。
- 厂商名称（Nintendo、Sony、Microsoft、Valve、Blizzard 等）仅以纯文字形式作为史实主体出现。

---

## 5. 依赖许可

| 依赖 | 版本 | 许可 | 用途 |
| --- | --- | --- | --- |
| `vite` | 5.4.11 | MIT | 构建工具（仅开发期） |
| `typescript` | 5.6.3 | Apache-2.0 | 类型检查（仅开发期） |

`node_modules/` 不进入交付物；`dist/` 产物中不包含任何第三方代码（两个依赖都不进 bundle）。

---

## 6. 部署与再分发

- 本任务**不部署**、不推送仓库。部署由 `14-publish` 统一执行。
- 产物为纯静态 `dist/`，不含凭据、日志、私有文件。
- 本目录的产物可自由用于用户授权的 GitHub Pages 上线与在线体验。
