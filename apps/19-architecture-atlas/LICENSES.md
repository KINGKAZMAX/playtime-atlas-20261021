# 许可与素材来源 · Licences and Asset Provenance
# 构筑华夏 / Built in China — Structures & Stories

> 本文件说明本项目的**代码许可**、**每一项素材的来源与许可**，以及**参考站观察证据的非授权声明**。
> This file states the **code licence**, the **provenance and licence of every asset**, and the **non-authorisation statement for the reference-site observation evidence**.

---

## 1. 代码 · Code

本站代码以 **MIT** 许可发布。

```
MIT License

Copyright (c) 2026 构筑华夏 / Built in China (task 19-architecture-atlas)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**运行期依赖 · Runtime dependencies**

| 包 | 版本 | 许可 | 用途 |
| --- | --- | --- | --- |
| `three` | ^0.180.0 | MIT | 三维渲染（按需动态载入，独立分包，首屏不加载） |
| `vite` | ^5.4.11 | MIT | 仅开发期打包，不进产物 |

---

## 2. 本站自有的素材 · Assets this project made itself

**站内没有任何第三方摄影作品、字体文件或三维模型文件。** 全部由本项目代码在运行时程序化生成：

| 素材 | 生成方式 | 位置 |
| --- | --- | --- |
| 首屏插画、区域地图（含中国轮廓与热点） | 代码绘制 SVG | `src/art/schematic.js`、`src/views/atlas.js` |
| 42 例案例线稿图 | 代码绘制 SVG（按案例构造类型分形） | `src/art/schematic.js` |
| 6 件三维模型的几何、材质、标注 | 代码程序化生成（three.js 运行时构建） | `src/lab/models/`（vendor 自 18） |
| 2D 降级示意图 | **同一份三维几何**派生，非另画的假图 | `src/lab/core/fallback.js`（vendor 自 18） |
| 图标（心形、警示、菜单、箭头） | 内联 SVG path | `src/views/*.js`、`index.html` |
| 测验题目与解析 | 本项目撰写 | `src/data/quiz.js` |

因此**不存在把未授权模型或图片当作自制**的情况。

### 与 18-architecture-models 的素材边界

三维几何与 2D 降级图**直接消费 18-architecture-models 的产物**（逐字节 vendor 自 `18-architecture-models/src/core/` 与 `src/models/`）。这些几何是 18 号任务的原创产物，18 以 MIT 发布，本目录同样以 MIT 发布，未改变其性质。

**19 自有的 `src/art/schematic.js` 是案例页的轻量线稿插画层，与 18 的模型体系是两种东西**——前者是二维示意线稿，后者是可交互的三维教学模型。两侧文档均已声明，不得互相混淆。

---

## 3. 字体 · Fonts

字体**全部自托管**，运行期零外部 CDN 请求。许可全文随包附在 `public/fonts/`。

| 字族 | 文件 | 字节 | 许可 | 版权声明 | 用途 |
| --- | --- | --- | --- | --- | --- |
| Space Grotesk | `space-grotesk-latin.woff2` | 34 788 | SIL OFL 1.1 | Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk) | 标题 |
| Inter | `inter-latin.woff2` | 132 684 | SIL OFL 1.1 | Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter) | 正文 |
| Space Mono | `space-mono-regular.woff2` | 14 884 | SIL OFL 1.1 | Copyright 2020 The Space Mono Project Authors (https://github.com/JetBrains/JetBrainsMono) | 等宽 / 标注 |
| Space Mono | `space-mono-bold.woff2` | 15 000 | SIL OFL 1.1 | 同上 | 等宽 / 标注 |
| Noto Sans SC | `noto-sans-sc-subset.woff2` | 197 600 | SIL OFL 1.1 | Copyright 2014–2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source' | 中文渐进增强（**子集**） |

许可全文：`OFL-space-grotesk.txt`、`OFL-inter.txt`、`OFL-space-mono-regular.txt`、`OFL-space-mono-bold.txt`、`OFL-noto-sans-sc.txt`。
机器可读清单：`public/fonts/FONT-MANIFEST.json`。

**中文字体策略**：中文**优先走系统字体栈**（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC / Noto Sans SC），Noto Sans SC 子集只作渐进增强。覆盖完整的系统 CJK 族必须排在覆盖有限的子集**之前**——CSS 按字符回退，子集在前会导致同一段文字混入两套字形、基线错位。

**署名规则**：SIL OFL 1.1 要求保留版权声明与许可声明，且**不得单独售卖字体**。本站满足前者（许可全文随包）；后者不适用（字体是免费站点的一部分）。再分发字体文件本身时，必须一并附上对应的 `OFL-*.txt`。

---

## 4. 数据 · Data

**本目录的建筑事实与术语数据来自同批上游任务 17-architecture-research**，逐字节 vendor 进 `src/data/upstream/`：

- `catalog.json` —— 42 例代表性建筑的目录，每例带来源、年代多口径与年代存疑标注
- `glossary.json` —— 74 条双语术语
- `catalog.meta.json` —— 地域 / 时代 / 构造类型词表、覆盖统计、教学声明

17 的目录是**权威来源**，19 只做适配，不改写上游数据。19 自行补写的部分只有两处，均在本站文件内可查：

- `src/data/enrichment.js` —— 上游只给中文的 `yearText / caveat / type / ethnicGroup` 的英文版，以及上游不提供的地图坐标
- `src/data/labs-meta.js` —— 由 18 的模型在构建期抽取的静态元数据（`scripts/gen-labs-meta.mjs`）

**上游数据的再分发**：17 的产物以 MIT 发布于本批仓库，随本批一并分发。本站对数据的使用限于**展示与教学**。

**逐条来源**：见 `SOURCES.md` 与站内 `#/sources`。每条事实都指向一个可核验的公开出处；**没有出处的说法不写**。引用的官方网页仅作为事实出处链接，其内容与版权归各发布机构所有。

---

## 5. 参考站观察证据 · Reference-site observation evidence

> ### ⛔ 非授权声明 / Non-authorisation statement
>
> **本项目没有复制参考站的任何资产，也没有把参考站的作品当作自己的作品。**
> **This project copied no asset from the reference site, and does not claim the reference work as its own.**
>
> 参考站 `https://olek.si/` 的著作权归该站作者所有。本站对其内容的唯一使用是：**观察可观察的交互机制**（分区调性反转、索引刻度栏、可动画圆角、单强调色极简排版等）。
>
> 观察证据（第三方内容，非本项目产物）隔离在 `research/_QUARANTINE__/`：
>
> | 文件 | 性质 |
> | --- | --- |
> | `bundle.js`（575 391 B） | **参考站前端源码**，第三方版权所有。与 `17-architecture-research/research-ref/olek-index.js` 字节完全一致（md5 `2b33454057bee84248dbdde64091deaf`）——同一份文件的两处副本，留档仅为取证 |
> | `olek-si.html`（5 633 B） | 参考站首页 HTML 快照 |
> | `ref-home-2560.png` / `ref-section-editor-2560.png` / `ref-section-editor-scrolled-2560.png` | 本项目作者于 2026-10-21 用浏览器访问参考站时截取 |
>
> 该目录：
>
> - ❌ **不得**进入任何对外产物（`dist/`、打包产物、部署包）
> - ❌ **不得**进入公开仓库（已在本目录 `.gitignore` 中排除）
> - ❌ **不得**被当作本项目的原创设计、原创代码或原创素材引用
> - ❌ **不参与**本项目的构建（`vite.config.js` 的输入只有 `index.html` 与 `src/`）
>
> 如需彻底移除，删除该目录即可，对本项目功能零影响。
>
> **观察日期：2026-10-21。参考站 URL：https://olek.si/。权利归属：olek.si 的作者。**
> **Observed: 2026-10-21. Reference site: https://olek.si/. Rights remain with olek.si's author.**

完整的「机制 → 实现」差异对照见 `REFERENCE-AUDIT.md` §6；**未采用**与**未核实**项见同文件 §7。

---

## 6. 第三方内容的链接 · Third-party links

站内 `#/sources` 与 `SOURCES.md` 收录官方机构网页作为**事实出处链接**（如国家文物局、各省市人民政府、中国非物质文化遗产网、UNESCO 世界遗产中心等）。这些网页：

- **不被下载、不被镜像、不被再分发**——只以超链接形式指向；
- 其**内容与版权归各发布机构所有**；
- 站点不为其内容作任何担保。

参考照片一律不下载、不再分发。

---

## 7. 署名与转载规则 · Attribution rules

- 转载本站代码：保留 MIT 许可全文与本文件。
- 转载本站的**图示 / 三维模型 / 案例线稿**：注明「构筑华夏 / Built in China · task 19-architecture-atlas」；它们是本项目的原创产物，以 MIT 发布。
- 转载本站的**事实描述**（案例说明、术语释义）：注明出处（见 `SOURCES.md`），并保留上游任务 17 的署名。
- 转载本站的**字体文件**：必须一并附上对应的 `OFL-*.txt`。
- **不得**把参考站 `https://olek.si/` 的任何图片、字体文件、Logo、文案或代码与本站一起分发，也不得声称本站与该站存在关联。

---

*登记：19-architecture-atlas · 2026-10-21 · 许可证：MIT（代码） / SIL OFL 1.1（字体）*
