# LICENSES.md · 第三方资源来源与许可登记 · Task 00

> 依据 `15-supervisor/RESTYLE-SPEC.md` §6.8：**新增任何第三方资源（字体 / 图 / 模型 / 数据）必须登记进本目录 `LICENSES.md`**。
> 依据 `16-design-system/MIGRATION-NOTES.md` §8：自托管字体须登记「字体名 / 版本 / 文件 / 字节 / 许可类型 / 许可全文位置 / 来源 URL / 版权声明」。
> 本文件是 `LICENSE.md` 的**资源登记册**（逐项可核）；`LICENSE.md` 是**本目录自有内容的许可声明**。两者不冲突。

---

## 1. 自托管字体（改版第 2 步引入，全部 SIL Open Font License 1.1）

### 1.1 总览

| 字体家族 | 用途 | 文件 | 字节 | 格式 | 子集 | 许可 | 许可全文 |
|---|---|---|---|---|---|---|---|
| Space Grotesk | 展示体（顶栏品牌 / 大标题 / TOP3 卡标题） | `assets/ds/fonts/space-grotesk-latin.woff2` | 34 788 | woff2 | latin | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-space-grotesk.txt` |
| Inter | 正文体（卡片 / 段落 / 表格正文） | `assets/ds/fonts/inter-latin.woff2` | 132 684 | woff2 | latin | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-inter.txt` |
| Space Mono | 等宽（状态 / 元信息 / 指标数值） | `assets/ds/fonts/space-mono-regular.woff2` | 14 884 | woff2 | latin | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-space-mono-regular.txt` |
| Space Mono | 等宽（粗体 700） | `assets/ds/fonts/space-mono-bold.woff2` | 15 000 | woff2 | latin | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-space-mono-bold.txt` |
| Noto Sans SC | 中文渐进增强（系统黑体兜底之外的备选） | `assets/ds/fonts/noto-sans-sc-subset.woff2` | 197 600 | woff2 | cjk-subset（覆盖有限） | SIL Open Font License 1.1 | `assets/ds/fonts/OFL-noto-sans-sc.txt` |

合计 **394 956 字节**（约 385 KiB）。

### 1.2 逐项来源与版权声明

| 字体 | 来源 URL | 版权声明（取自随包 OFL 原文首行） |
|---|---|---|
| Space Grotesk | <https://github.com/floriankarsten/space-grotesk> | Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk) |
| Inter | <https://github.com/rsms/inter> | Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter) |
| Space Mono（regular / bold） | <https://github.com/sharanda/space-mono>（上游发布仓库 <https://github.com/googlefonts/spacemono>） | Copyright 2016 The Space Mono Project Authors (https://github.com/googlefonts/spacemono) |
| Noto Sans SC | <https://github.com/notofonts/noto-cjk> | Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source' |

> 上表版权行为**随包 OFL 1.1 原文**所载内容，逐字取自 `assets/ds/fonts/OFL-*.txt` 首行，未作改写。
> `assets/ds/fonts/FONT-MANIFEST.json` 是 16-design-system 随附的机器可读清单，记录了同一批字体的取用来源与子集覆盖说明；两者对 Space Mono 的上游年份表述略有差异（清单记 2020 / OFL 原文记 2016），以**随包 OFL 原文**为准。

### 1.3 版本与许可条款

- **许可类型**：SIL Open Font License, Version 1.1（全部 5 个字体文件，逐一随包附许可全文）
- **OFL 1.1 授予的权限**：可自由使用、研究、修改、再分发、以及**将字体嵌入到软件/网页等交付物中**（含商用），无需逐次申请授权
- **OFL 1.1 施加的义务**：字体文件本身**不得单独售卖**；若修改并重新分发，**不得使用保留字体名（Reserved Font Name）**；衍生字体须沿用本许可
- **本目录的处置**：字体文件**未修改**，按原样随页面分发；页面通过本地 `@font-face` 引用，**不再分发修改版**
- **字体族名一致性**：家族名与 `16-design-system/fonts/FONT-MANIFEST.json` 完全一致（`Space Grotesk` / `Inter` / `Space Mono` / `Noto Sans SC`），符合 MIGRATION-NOTES §8「字体族名与 16 的字体清单一致」
- **⚠️ 字体栈顺序约束（2026-10-21 22:4x 修正）**：**覆盖完整**的 CJK 族必须排在**覆盖有限**的 CJK 子集之前。
  CSS 字体回退是**按字符**进行的 —— 若前面的 CJK 字体缺字，浏览器会**逐字**回退到下一个族，同一段文字就会混入两套不同度量的字形，表现为**混排基线错位**。
  本目录的实际顺序（`assets/ds/tokens.css`）：
  `拉丁自托管字体 → 完整系统 CJK 栈（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC）→ Noto Sans SC 子集 → -apple-system / BlinkMacSystemFont → sans-serif`
  `noto-sans-sc-subset.woff2` 的正确定位是**渐进增强兜底**：只有前面的完整系统 CJK 族**全部不可用**时才生效。该文件**保留不删**，`@font-face` 声明**一字未改**。

### 1.4 自托管与零外部请求

- 字体由 `assets/ds/fonts/fonts.css` 以**相对路径** `url("./xxx.woff2")` 引入，与 CSS 同目录 → **对任意子路径挂载均成立**
- **零 CDN、零外链字体、零运行期外部请求**：页面不引用 `fonts.googleapis.com` 或任何远程 `@import`
- `font-display: swap` → 不阻塞首屏渲染
- **只 preload 首屏用到的 2 个拉丁字体**（Inter / Space Grotesk）；**汉字不 preload**（MIGRATION-NOTES §8）
- 中文字形优先走**系统字体栈**（`PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei` / `Source Han Sans SC`），`noto-sans-sc-subset.woff2` 只是渐进增强；**任何设备都不会缺字**

### 1.5 已知限制（子集覆盖）

`noto-sans-sc-subset.woff2` 是 07-museum-art 按其自身用字生成的**有限子集**，**不是**全站汉字全集。若本页某些汉字超出覆盖，且设备上**也没有任何**完整系统 CJK 族（PingFang SC / Hiragino Sans GB / Microsoft YaHei / Source Han Sans SC），浏览器才会回退到这个子集 —— 视觉与全站略有差异但**不缺字**。全站文案定稿后应重新子集化并更新本表字节数。

> 因为子集已排在完整系统 CJK 栈**之后**，在 macOS / Windows / 主流 Linux 上本目录的汉字**统一由系统黑体渲染**，该子集实际不参与渲染（实测见 `ACCEPTANCE.md` 抽查 H）。
>
> **本页实测覆盖率**（逐字 CDP 平台字体探针，自测）：本页可见文本共 **729 个唯一汉字**，该子集直接覆盖 **452 个（62.0%）**、**缺失 277 个（38.0%）**。
> （`16-design-system/fonts/FONT-MANIFEST.json` 记的「57.5% / 1031 字」是 **16 在他们那页**用 fontTools 读 cmap 得到的基数，与本页无关；该文件作为 16 的原件原样保留、未改。）

---

## 2. 设计系统资产（本批自研，非第三方）

| 文件 | 来源 | 许可 |
|---|---|---|
| `assets/ds/tokens.css` | 本批同级目录 `16-design-system/src/tokens.css` | 本批自有产物，随本批统一发布 |
| `assets/ds/components.css` | 本批同级目录 `16-design-system/src/components.css` | 本批自有产物，随本批统一发布 |
| `assets/ds/fonts/fonts.css` | 本批同级目录 `16-design-system/fonts/fonts.css` | 本批自有产物，随本批统一发布 |
| `assets/ds/fonts/FONT-MANIFEST.json` | 本批同级目录 `16-design-system/fonts/FONT-MANIFEST.json` | 本批自有产物，随本批统一发布 |

- 上述 4 个文件为**原样复制**（仅路径不同），未作修改；许可与出处随本批统一发布
- 令牌取值来源：`16-design-system/design-tokens.json`（`afterglow-ds` v1.0.0）
- **本目录不重新定义任何 `--ds-*` 取值**，只在自有样式层声明**语义别名**（`--bg: var(--ds-bg)` 等），符合 MIGRATION-NOTES §0 风险 B
- `--ds-base` 按 MIGRATION-NOTES §6 在入口注入为 `"/playtime-atlas-20261021/"`；**本页所有资源 URL 仍走相对路径**，该变量未被任何资源加载消费

---

## 3. ★ 参考站非授权声明

本批改版的视觉语言参考站为 `https://olek.si/`（取证记录见 `16-design-system/REFERENCE-AUDIT.md`，观测时间 2026-10-21 19:30 GMT+8）。

**明确声明：**

1. **不复制未授权素材** —— 本目录**未下载、未再分发**参考站的任何图片、视频、字体、图标、样式表或脚本。参考站使用 5 个自研/商用 woff2（display / text / inter / interd / interr），本目录**一个都没有取用**；本页所用的 5 个 OFL 字体全部来自上游开源项目（见 §1.2），与参考站字体无任何关系。
2. **不宣称原创参考作品** —— 本目录的 TOP3 三例（`NIMBUS-7 桌面气象站` / `TIDAL DRIFT 潮汐漂移` / `HELIOS SPECIMEN 日轮标本台`）是**本批原创改编规格**，**不是**参考作品本身，也不声称为参考作品。作品名 / 文案 / 内容 / 字体 / 配色 / 布局 / 模型形态全部另起，逐项差异见 `DIFF-REFERENCES.md`。
3. **不复制参考站的作品名、项目与作者身份** —— 本目录 `index.html` 的 134 条案例条目均为**对各平台公开信息的独立核验与引用**，逐条附原始链接与观测时间；不搬运参考站的项目列表。
4. **不复制参考站的品牌视觉** —— 本批配色为**重新设计**的朱砂 `#B4432B`（来自 `16-design-system/design-tokens.json`），**未复制**参考站的紫色 `#6549F2`。
5. **参考站仅作视觉语言参考** —— 可参考的是「层级关系、留白节奏、控件形态」等抽象语言；不可参考也不可搬运的是其内容与资产。

---

## 4. 其余第三方材料（沿用 `LICENSE.md` 的登记，本文件不重复展开）

| 材料 | 位置 | 许可状态 | 使用边界 |
|---|---|---|---|
| `references/mia-100-html/`（100 个单文件 HTML 研究库） | 研究目录 | GitHub API `license: null` → **保留所有权利** | **仅阅读参考，禁止复制**（详见 `LICENSE.md` §2.1） |
| `frames/`（X 公开视频抽帧） | 研究目录 | 原属各作者 / 平台 | 内部比对用；**不得**作为交付素材（`LICENSE.md` §2.3） |
| `media/`（X 公开视频原片） | 研究目录 | 原属各作者 / 平台 | 同上 |
| `raw/*.syn.json` | 研究目录 | 各平台公开接口返回 | 核验留痕，不单独授权（`LICENSE.md` §1） |

> 这些材料**均不参与** `index.html` 的页面资产 —— 索引页零外部图片请求。

---

## 5. 本目录自制资源

| 资源 | 性质 | 说明 |
|---|---|---|
| `index.html` 的 favicon | **本目录自制** | 内联 **data URI SVG**（浅底 `#fcfbf9` + 朱砂 `#b4432b` 的「M」形标记，随改版第 2 步换色）。不含任何第三方素材、不产生外部请求，仅用于消除浏览器自动请求 `/favicon.ico` 造成的 404（13 记为 QA-046） |
| `build_cases.py` / `build_index.py` / `gen_ranking.py` / `verify.py` | **本目录自制** | MIT |
| `cases.json` / `RANKING.md` / `TOP3.md` / `DIFF-REFERENCES.md` 等 | **本目录自制** | CC BY 4.0（署名） |

---

## 6. 核验要点

- 本目录**无**任何 `.env` / token / 私钥 / 凭据文件（`verify.py` §7 逐文件扫描）
- 页面**运行期零外部请求**（`verify.py` §4 拒绝任何 `http/https///` 资源；浏览器端网络面板实测 0 条非本地请求）
- 自托管字体的 5 个文件与 5 份 OFL 许可原文**必须随发布包一同分发**；若 `14-publish` 只发布 `index.html` 而漏掉 `assets/ds/`，线上会出现样式与字体 404 —— 发布前请按 MIGRATION-NOTES §6 逐条 `curl` 期望 200

---

## 7. 变更记录

| 时间（GMT+8） | 变更 |
|---|---|
| 2026-10-21 21:2x | 新建本文件（改版第 2 步）：登记 5 个自托管 OFL 字体、4 个设计系统资产、补参考站非授权声明 |
