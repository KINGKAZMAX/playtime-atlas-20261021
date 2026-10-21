# LICENSES.md — 第三方资源与许可

> 任务：01｜热门网页案例复刻（CHROMA S1 · 千色仪）
> 最后更新：2026-10-21（Asia/Taipei）
> 口径：`15-supervisor/RESTYLE-SPEC.md` §6.8 —— 新增任何第三方资源（字体 / 图 / 模型 / 数据）必须登记于此。

---

## 1. 字体（全部自托管，无 CDN、无外链）

改版后字体族与批次设计系统一致（`16-design-system/design-tokens.json` → `typography.family`）：
展示体 **Space Grotesk** / 正文体 **Inter** / 等宽体 **Space Mono**。

**2026-10-21 23:2x 更新**：字体文件改为直接采用 16-design-system 随包 vendored 的
OFL-1.1 实体文件（`16-design-system/fonts/` → 本目录 `public/assets/ds/fonts/`），
不再经 @fontsource 分发。理由见 `16-design-system/MIGRATION-NOTES.md` §8
（「本系统可复用的字体资产…许可全文一并复制到本目录」）与 §2.0.1 的字体栈顺序要求。

| 字体 | 文件 | 字节 | 来源 | 许可 | 打包方式 |
|---|---|---|---|---|---|
| Space Grotesk（展示体） | `public/assets/ds/fonts/space-grotesk-latin.woff2` | 34 788 | 16-design-system/fonts（源自 07-museum-art / 06-museum-core 已 vendored 的同一批 OFL 文件，见其 `FONT-MANIFEST.json`） | SIL Open Font License 1.1 | 逐字节发布到 `dist/assets/ds/fonts/`，`@font-face` 用相对 `url("./x.woff2")` |
| Inter（正文体） | `public/assets/ds/fonts/inter-latin.woff2` | 132 684 | 同上 | SIL Open Font License 1.1 | 同上 |
| Space Mono Regular（等宽体） | `public/assets/ds/fonts/space-mono-regular.woff2` | 14 884 | 同上 | SIL Open Font License 1.1 | 同上 |
| Space Mono Bold（等宽体 700） | `public/assets/ds/fonts/space-mono-bold.woff2` | 15 000 | 同上 | SIL Open Font License 1.1 | 同上 |
| Noto Sans SC 子集（**渐进增强兜底**） | `public/assets/ds/fonts/noto-sans-sc-subset.woff2` | 197 600 | 同上 | SIL Open Font License 1.1 | 文件与 `@font-face` **按 16 原样保留、未删未改**；因系统 CJK 栈排在其之前，本页汉字实际走系统字体，该子集只在系统栈整体不可用时兜底 |

- **运行期零外部请求**：字体全部以相对 URL 从同目录加载；QA 断言「no external network requests」持续通过。
- **中文字体栈顺序**（MIGRATION-NOTES §5.3，硬性）：本作品直接消费 16 的修正后令牌
  —— 覆盖完整的系统 CJK 栈（PingFang SC → Hiragino Sans GB → Microsoft YaHei →
  Source Han Sans SC）排在覆盖有限的 `Noto Sans SC` 子集**之前**，
  避免同一段文字混入两套字形造成基线错位。`qa/ds-verify.mjs` 的 V.11 对此做机械判定。
- **Noto Sans SC 子集：文件与 `@font-face` 均按 16 原样保留**（`diff` 校验与
  `16-design-system/fonts/` 逐字节一致；`fonts.css` 仍声明 5 个 `@font-face`，
  含 `"Noto Sans SC"`）。它是**渐进增强兜底**：按 §5.3 的顺序，系统 CJK 栈排在其前，
  本页汉字实际走系统字体（0 字节、覆盖完整、离线可用）；只有系统栈整体不可用时才回落到该子集。
  子集覆盖有限（按 07-museum-art 自身用字生成），因此**不得**排到系统栈之前。
  `qa/ds-verify.mjs` 对「子集存在 + `@font-face` 声明未改」做机械判定。
- OFL-1.1 许可全文随包发布：`public/assets/ds/fonts/OFL-{inter,space-grotesk,space-mono-regular,space-mono-bold,noto-sans-sc}.txt`
  （逐字节拷贝自 `16-design-system/fonts/`），并随发布产物一起上线。
- 字体清单与来源说明：`public/assets/ds/fonts/FONT-MANIFEST.json`。

### 已移除的字体

| 字体 | 原用途 | 移除原因 |
|---|---|---|
| Martian Mono | 展示体（宽体等宽） | 改版后展示体按 DS 统一为 Space Grotesk |
| JetBrains Mono | 等宽体 | 改版后等宽体按 DS 统一为 Space Mono |
| @fontsource/*（space-grotesk / inter / space-mono） | 上一版经 npm 打包的三族字体 | 改用 16 的 vendored 实体文件后成为空依赖，已从 `package.json` 与 `package-lock.json` 一并移除（`npm ci` 校验通过） |

前两者同为 OFL-1.1、无残留资源引用。

---

## 2. 运行期依赖

| 包 | 版本 | 许可 | 用途 | 是否进产物 |
|---|---|---|---|---|
| three | 0.186.1 | MIT | 三维渲染（主视图 + 拆解视图） | 是（打包为 `three-*.js` chunk） |
| vite | 7.1.7 | MIT | 构建工具 | 否（仅 devDependency） |
| typescript | 5.9.2 | Apache-2.0 | 类型检查 | 否 |
| playwright | 1.64.1 | Apache-2.0 | 浏览器点击验收（`npm run qa`） | 否（仅 devDependency） |
| @types/three | 0.186.0 | MIT | 类型声明 | 否 |

---

## 3. 本作品自产资源（无第三方版权）

| 类别 | 说明 |
|---|---|
| 三维模型 | 全部由 Three.js 图元程序化生成（`src/three/device.ts`），无 `.glb` / 无外部模型文件 |
| 环境光照 | `RoomEnvironment` + `PMREMGenerator` 程序化生成，无 HDR 文件 |
| 纹理 / 贴图 | 全部 Canvas 2D 程序化绘制（12 块样本表面、机身小屏、地面网格、光谱曲线） |
| 图标 / 插画 | 纯 CSS 与内联 SVG（favicon 为 data URI） |
| 文案 / 规格 / FAQ / 样本名 | 本作品自撰，原创虚构产品 |
| 色度算法 | `src/color.ts` 自行实现：CIE 1931 配色函数、sRGB↔XYZ↔Lab、CIEDE2000、主动集 NNLS 光谱重建 |

---

## 4. 明确未使用

- ❌ 任何 CDN、外部 API、在线字体、远程图片（QA 每次运行断言外部请求数为 0）
- ❌ 任何真实厂商 Logo、型号、品牌视觉
- ❌ 任何未授权的商业游戏 / ROM 资源
- ❌ 参考案例（@nutlope 落地页）的任何文案、图像、视频、代码 —— 仅作**事实性引用**（出处 / 作者 / 时间 / 模型归属 / 公开互动量），见 `SOURCES.md`
- ❌ `16-design-system/references/mia-100-html/`（无 LICENSE，仅参考不得复制）中的任何内容

### 参考站与参考作品的非授权声明（非「未使用」，是「不得使用」）

本作品在设计系统层面复用了一条**可观察机制**（全屏分段滚动、色调自适应分区、
媒体卡去饱和遮罩、圆点↔箭头形变、景深式导航轴、入场模糊+旋转），
其取证记录在 `16-design-system/REFERENCE-AUDIT.md`（引用站点 https://olek.si/ 的**运行时实测**）。
据此声明：

1. **未复制参考站 olek.si 的任何资产**——图片、视频、字体、样式表、脚本、文案一律未取用；
   `16-design-system/evidence/`（参考站的观察证据：截图与测量 JSON）**不进入本目录，
   也不被本作品任何运行期页面引用**。
2. **未复制参考站的作品名与文案**，配色亦未沿用其紫 `#6549F2`；
   本作品配色为批次设计系统自定的朱砂 `#B4432B`（`--ds-accent`）。
3. **参考案例 @nutlope 的落地页**（`https://x.com/nutlope/status/2112238098147135880`）
   仅作**事实性引用**（出处 / 作者 / 发布时间 / 模型归属 / 公开互动量），
   其文案、图像、视频、代码一律未取用；本作品是另立虚构产品的原创改编。
4. 本作品的作品名「CHROMA S1 · 千色仪」、全部文案、规格、FAQ、样本与三维模型均为自撰/自产，
   与任何真实厂商的产品、型号、视觉无关。

> 声明对应的可核对材料：本次公开互动量的观测时间与数值见 `SOURCES.md` 与页面内
> 「来源与许可」区块；转发数与收藏数未核到，页面如实标注「未核到」，未用点赞数折算。
