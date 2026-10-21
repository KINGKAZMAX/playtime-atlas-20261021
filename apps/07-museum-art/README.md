# 07 · 回响电玩馆 / PLAYTIME ATLAS — 原创美术与硬件模型包

> 电子游戏硬件年代馆的**整套原创视觉资产**：自托管许可字体、48 枚手绘图标、7 张年代海报、
> 8 张封面、6 组展柜、6 件跨时代硬件 3D 模型，以及统一设计令牌与四级降级方案。
>
> **v1.1.0 起，界面视觉语言已对齐全站「余晖设计系统」（16-design-system）**：
> 令牌、字体栈、字阶、圆角、间距、层级与动效时长全部取自 16，详见 `RESTYLE-MAP.md`。

本任务由 MiniMax Code（M3.1-Flash / max）独立完成：研究、美术、建模、代码与测试全部为本会话产出。

---

## 视觉规范对齐（16-design-system）

| 层 | 来源 | 对齐方式 |
| --- | --- | --- |
| CSS 令牌层 | `16-design-system/src/tokens.css` | 129 个 `--ds-*` 变量逐项照抄（深色主题覆盖 21 个）；主色 `--ds-accent` = `#B4432B` / `#E0684A` |
| JSON 令牌树 | `16-design-system/design-tokens.json` | `designSystem` 分区原样引用（213 个叶子令牌，未改一个取值） |
| 字体 | `16-design-system/fonts/` | 5 个 woff2 **逐字节一致**（SHA-256 相同）；5 条 `@font-face` 的族名 / style / 字重 / 文件映射**逐项一致** |
| 组件类 | `16-design-system/src/components.css` | 采用 `.ds-topbar / .ds-btn / .ds-chip / .ds-tag / .ds-lightbox / .ds-iconbtn / .ds-skip / .ds-canvas-frame` |

对齐是**脚本生成**而非文件复制：

```bash
npm run sync-tokens   # 读 16 → 逐项交叉校验 → 生成 design-tokens.json + 兜底快照
npm run tokens        # design-tokens.json → tokens.css / tokens.js
```

- `scripts/sync-ds-tokens.mjs` 会把 16 的 CSS 取值与 JSON 取值**逐项比对**，
  记录指纹（`designTokensSha256` / `tokensCssSha256` / 字体 SHA-256），
  并把 **16 自身 JSON↔CSS 的不一致项**登记在 `meta.alignment.drift`（当前 1 项：`--ds-font-mono`）。
- `scripts/lib/ds-tokens.snapshot.json` 是**取值快照**（非文件复制），16 目录不可用时仍可构建。

符合性验收按 16 的 V.1–V.10 清单执行：

```bash
node scripts/qa-ds-conformance.mjs
# → evidence/ds-conformance.json · evidence/tokens-validate.json
```

其中令牌层是**直接调用 16 的 `tools/validate-tokens.mjs`**（用软链沙盒跑，16 的文件一个字节未动）。

---

## 快速开始

```bash
cd 07-museum-art

# 一键重建全部资产（字体 → 令牌对齐 → 令牌 → 字体清单 → 图标 → 海报 → 封面 → 展柜 → 模型）
npm install
npm run assets

# 光栅化（SVG → PNG，3D → 渲染图）
node scripts/render.mjs

# 本地预览（优先 4327；被占用时自动顺延并打印实际地址）
npm run dev        # http://127.0.0.1:4327

# 静态构建
npm run build      # → dist/
```

> `npm run assets` 会重新下载 OFL 字体（约 18 MB）。已缓存时自动跳过。
> 若完全离线，可直接使用仓库中已生成的 `public/assets/`。
> `npm run assets` 中的 `sync-tokens` 会在 16 目录可用时读取其最新取值；
> 16 不可用时自动回退到 `scripts/lib/ds-tokens.snapshot.json`。

---

## 目录结构

```
07-museum-art/
├── TASK.md                    任务定义、交付清单与验收标准
├── STATUS.md                  阶段进度
├── README.md                  本文件
├── INTERFACE.md               ⭐ 与 06-museum-core 共享的资产接口约定
├── LICENSES.md                逐项资产来源与许可
├── QA.md                      验收记录
├── RESTYLE-MAP.md             ⭐ v1.1.0 改版对照表（对 16 的逐项映射与有意差异）
├── manifest.json              交付清单（供 14-publish 集成）
├── design-tokens.json         ⭐ 统一设计令牌（meta / designSystem / local / compat / cssVars）
│
├── index.html                 预览页外壳（DS 组件类 + 双语标注）
├── src/
│   ├── main.js                预览页逻辑（令牌、字体、图标、灯箱、3D 查看器）
│   ├── i18n.js                中英文案（zh/en，98 组 key）
│   ├── styles.css             预览页样式（全部走 --ds-* 令牌）
│   ├── tokens.css / tokens.js 由 build-tokens.mjs 生成
│   └── data.js                资产索引（由 build-manifest.mjs 生成）
│
├── scripts/
│   ├── lib/
│   │   ├── local-tokens.json  展品内嵌配色（从原 tokens.mjs 抽取）
│   │   ├── ds-tokens.snapshot.json  16 令牌取值快照（兜底用，非文件复制）
│   │   ├── catalog.mjs        年代与展品目录（唯一事实来源）
│   │   ├── geometry.mjs       3D 几何构建库
│   │   ├── models.mjs         6 件展品的建模器
│   │   ├── materials.mjs      馆内统一材质库
│   │   ├── glb.mjs            GLB 装配器
│   │   ├── svg.mjs            SVG 构建工具集
│   │   ├── text.mjs           中西混排文本度量与折行
│   │   └── server.mjs         本地静态服务器（光栅化用）
│   ├── sync-ds-tokens.mjs     对齐 16 的令牌 + 交叉校验 + 指纹
│   ├── build-tokens.mjs       令牌 → CSS / JS
│   ├── build-fonts.mjs        字体下载 + 子集化 + @font-face
│   ├── build-font-manifest.mjs 自托管字体清单（机器可读）
│   ├── build-icons.mjs        48 枚图标 + 雪碧图 + 索引
│   ├── build-posters.mjs      7 张年代海报
│   ├── build-covers.mjs       8 张封面
│   ├── build-cases.mjs        6 组展柜
│   ├── build-models.mjs       6 个 GLB + 元数据
│   ├── build-tech-svg.mjs     技术插画降级图（从真实网格投影）
│   ├── build-fallback.mjs     降级与离线图形
│   ├── build-manifest.mjs     资产索引
│   ├── render.mjs             光栅化（Chromium）
│   ├── qa-check.mjs           资产完整性自动校验（158 项）
│   ├── qa-browser.mjs         浏览器验收（结构 / 字体 / 图片 / 3D / 交互 / 截图 / 响应式）
│   ├── qa-subpath.mjs         线上子路径部署复验
│   ├── qa-ds-conformance.mjs  与 16 的 V.1–V.10 符合性验收
│   └── render/model.html      3D 渲染页
│
├── public/assets/             生成产物（可被 06 / 14 直接复制）
│   ├── fonts/                 4 家族 OFL 字体 + 授权原文 + FONT-MANIFEST.json
│   ├── icons/                 48 枚图标 + 雪碧图 + 索引
│   ├── posters/               7 张海报（SVG + PNG + 关键帧）
│   ├── covers/                8 张封面（SVG + PNG + 关键帧）
│   ├── cases/                 6 组展柜（SVG + PNG）
│   ├── models/                6 个 GLB + 渲染图 + 技术插画 + 元数据
│   ├── fallback/              5 张降级图形
│   ├── tokens.css / tokens.js / design-tokens.json
│   └── assets.manifest.json   机器可读资产索引（含对齐版本号与依据路径）
│
├── dist/                      静态构建输出（供 14-publish 复制）
├── evidence/                  符合性验收证据（JSON）
└── screenshots/               验收截图
```

---

## 设计方案

### 配色

**两套色板，用途不同，不要混用。**

**① UI 色板 —— 来自 16-design-system（深色主题为默认）**

| 角色 | 令牌 | 值 | 用途 |
| --- | --- | --- | --- |
| 底色 | `--ds-bg` | `#100F0E` | 页面基底 |
| 抬升面 | `--ds-bg-raised` | `#1A1917` | 卡片、面板 |
| 面板 | `--ds-surface` | `#1E1D1B` | 查看器侧栏等容器 |
| 主文本 | `--ds-ink` | `#F7F4F0` | 标题与正文 |
| 次文本 | `--ds-ink-soft` | `#C0B7B0` | 说明、辅助信息 |
| 弱文本 | `--ds-ink-faint` | `#9A918A` | 标签、注释 |
| 分隔线 | `--ds-line` | `#2B2926` | 描边（非控件边界） |
| 强调 | `--ds-accent` | `#E0684A` | CTA、年代标记、焦点环 |
| 强调悬停 | `--ds-accent-hover` | `#EE8266` | 悬停态 |
| 辅助 | `--ds-jade` | `#5FA99A` | 在线/本地状态 |

UI 只使用 `--ds-*`；控件描边另用 `--hair-ctrl`（40% 墨色，实测 3.59:1，
因为 16 的 `--ds-line` 在深色下仅 1.32:1，不足以承担控件边界）。

**② 展品内嵌配色 —— 本馆原创，已烘焙进资产文件**

| 角色 | 名称 | 值 | 用途 |
| --- | --- | --- | --- |
| 基底 | 墨蓝 Ink 800 | `#0C1726` | 海报 / 封面 / 展柜 / GLB 材质 |
| 基底深 | Ink 900 | `#070E19` | 阴影、遮罩、柜内腔 |
| 层级 | Ink 600 / 500 | `#1A3149` / `#24415E` | 面板、卡片 |
| 主文本 | 纸白 Paper 50 | `#FBF7EF` | 标题与正文 |
| 次文本 | Paper 200 | `#E7DCC7` | 说明、标签牌 |
| 强调 | 信号橙 Signal 500 | `#F0601F` | CTA、年代标记 |
| 辅助 | 青 Teal 400 | `#4FB3A0` | 屏面、可玩状态 |

这组颜色**已烘焙进位图与 3D 材质**，不随 UI 主题变化，
对应 CSS 变量 `--atlas-local-*`（25 个），仅作记录与取色参考。

#### 主色口径与「外壳 / 作品」的边界

| 层 | 主色 | 归属 | 说明 |
| --- | --- | --- | --- |
| **界面外壳层** | `--ds-accent` = **`#B4432B`**（亮色）/ **`#E0684A`**（暗色） | **16-design-system 定义，07 消费** | 按钮高亮、聚焦环、选中态、链接色、年代标记一律走这个变量。16 是规范的**唯一定义方**，07 作为 token 源头只消费并登记对齐版本号 |
| **作品自身美术层** | Signal 500 `#F0601F` 等（墨蓝 / 纸白 / 信号橙 / 青） | **本馆原创** | 已烘焙进海报、封面、展柜、技术插画与 GLB 材质，属**作品插画自身的配色表达**，不随 UI 主题变化 |

> **统一的是外壳层，作品的插画配色属作品自身表达。**
> 已生成的 SVG / PNG 资产不做大面积重绘（重绘需整批重跑生成式关键帧，且会破坏作品原有观感）；
> 但任何**界面层**的强调色都必须走 `--ds-accent`，不得再写死旧主色。
> `npm run qa` 已把这条边界固化为断言：「UI 样式表无写死的旧主色 `#F0601F`」+「主色口径一致」。

> 参考站（olek.si）的紫 `#6549F2` **未采纳**：16 的 `MIGRATION-NOTES.md` §7 明确将其列为不可照搬项，
> 全站主色改为朱砂系。

令牌总数：`design-tokens.json` = 16 令牌树 213 个叶子 + 本地/兼容视图 + 129 个 CSS 变量声明，
同源生成 `tokens.css` 与 `tokens.js`（两者的文件头都写明对齐版本号、对齐时间与主色取值）。

### 字体

| 家族 | 用途 | 许可 |
| --- | --- | --- |
| Space Grotesk | 展示体 / 标题 / 编号 | SIL OFL 1.1 |
| Inter | 正文 | SIL OFL 1.1 |
| Space Mono | 等宽 / 编号 / 年份 | SIL OFL 1.1 |
| Noto Sans SC | 中文（746 字子集） | SIL OFL 1.1 |

全部下载后按实际用字子集化，存于 `public/assets/fonts/`，**运行期零外部字体请求**。

- 5 个 woff2 与 `16-design-system/fonts/` 下的同名文件**逐字节一致**（SHA-256 相同），
  字体栈顺序亦与 16 一致：拉丁自托管字体 → 完整系统 CJK 栈 → Noto Sans SC 子集 → 通用族。
  这条顺序是硬约束：子集若排在完整系统栈之前，同段中文会逐字回退、基线错位。
- 机器可读清单见 `public/assets/fonts/FONT-MANIFEST.json`
  （由 `scripts/build-font-manifest.mjs` 从实际文件算出，不复制 16 的清单）。

### 双语

- 界面外壳（导航、分区标题、按钮、说明、状态、查看器控件）提供 **zh / en** 两套文案，
  由 `src/i18n.js` 管理（98 组 key，zh/en 两侧完全一致）。
- 语言切换：右上角 `EN / 中文` 按钮，或 `?lang=en` 直达；`<html lang>` 随语言切换，
  `hreflang` 备用链接运行期注入（写死在 HTML 里会被构建器当资源解析）。
- **作品名与展品名保持既定原创中文版本，不翻译、不改名**；
  海报 / 封面 / 展柜 / 技术插画里的中文已烘焙在位图中，英文界面下作为「展品原件」呈现。

### 7 个年代

| # | 年代 | 拉丁名 | 年份 |
| --- | --- | --- | --- |
| 01 | 街机初萌 | ARCADE DAWN | 1972 — 1978 |
| 02 | 街机黄金 | GOLDEN ARCADE | 1978 — 1983 |
| 03 | 八位年代 | 8-BIT HOME | 1983 — 1993 |
| 04 | 光盘纪元 | 16-BIT DISC | 1991 — 1996 |
| 05 | 三维与网络 | 3D & NETWORK | 1996 — 2005 |
| 06 | 掌机与联机 | POCKET & ONLINE | 2004 — 2013 |
| 07 | 融合与云 | CONVERGENCE & CLOUD | 2013 — 至今 |

### 6 件硬件展品

| id | 展品 | 拉丁名 | 年代 | 部件 | 三角面 |
| --- | --- | --- | --- | --- | --- |
| `cabinet-01` | 星港立式机柜 | STARLIGHT CABINET | 1972 — 1979 | 34 | 1 000 |
| `console-02` | 小行星卡带机 | ASTER CONSOLE | 1983 — 1990 | 33 | 1 652 |
| `console-03` | 子午线光盘机 | MERIDIAN DECK | 1994 — 2000 | 32 | 2 472 |
| `handheld-04` | 余烬掌机 | POCKET EMBER | 2004 — 2010 | 17 | 690 |
| `hybrid-05` | 光环平板 | HALO SLATE | 2012 — 2017 | 25 | 1 932 |
| `modern-06` | 矢量节点 | VECTOR NODE | 2020 — 至今 | 36 | 1 044 |

均为**虚构展品**：对「某一时代通用硬件形态」的原创提炼，
无品牌标识、无具体产品造型、无任何厂商素材。

---

## 关键实现说明

### 海报：关键帧 + 精确排版层

生成式图像模型在中文上极易产生乱码。本包的做法是**把文字完全排除在生成环节之外**：

1. 关键帧提示词里硬性写入 `absolutely NO text, NO letters, NO numbers, NO logos`，
   只产出纯画面（示波器辉光、霓虹灯箱、卡带纹路、光盘虹彩、低多边形线框、翻盖掌机、云节点、展厅）。
2. 所有中文标题、编号、年份、正文、关键词、页脚由 `build-posters.mjs` 用 SVG 精确排版叠加。
3. 海报 SVG **内嵌 base64 字体**，完全自包含，单独打开即可正确显示中文。

结果：7 张海报零乱码，文字层级、年份与编号全部可控。

### 3D 模型：参数化建模 → 标准 GLB

不使用任何第三方模型资产，也不需要 Blender：

- `scripts/lib/geometry.mjs` 从零实现 box / roundedBox / cylinder / sphere / torus / tube / d-pad 等构造器。
- `scripts/lib/models.mjs` 用这些构造器拼出 6 件展品，每件 17–36 个**具名部件**。
- `scripts/lib/glb.mjs` 用 `@gltf-transform/core` 装配为标准 GLB（每个部件一个节点，节点名即部件名）。
- 材质统一走 `scripts/lib/materials.mjs` 的馆内材质库，6 件展品因此像「一次收藏」而非 6 次拼凑。

### 技术插画降级图：从真实网格反推

`model-*.tech.svg` 不是手画的装饰图，而是**从 GLB 网格反推出来的工程制图**：

1. 计算每个三角面的法线，建立边表；
2. 按夹角阈值（~22°）提取**特征棱边**；
3. 按视角正负提取**轮廓边**；
4. 正交投影成「正视图 + 侧视图」，附尺寸标注与部件清单。

因此即使浏览器完全没有 WebGL，展品的真实结构与规格信息依然完整可读。

### 四级降级

| 级别 | 触发条件 | 回退目标 |
| --- | --- | --- |
| 1 | WebGL 可用 | GLB + three.js 实时查看器 |
| 2 | GLB 加载失败 | 1024×1024 静态渲染图 PNG |
| 3 | 静态图也缺失 | 技术插画 SVG（保留结构与规格） |
| 4 | 主视觉缺失 | 本馆自绘占位图 |

另有 `no-webgl.svg` 与 `offline-notice.svg` 用于显式提示。

---

## 与其他任务的协作

| 任务 | 关系 |
| --- | --- |
| `06-museum-core` | 消费本包的资产。接口约定见 **`INTERFACE.md`**，预览端口 4327 |
| `08` — `12`（各时代小游戏） | 本包不含游戏本体，仅提供视觉语言 |
| `14-publish` | 集成 `dist/` 上线。构建命令 `npm run build`，输出目录 `dist` |

本任务**不部署公网**，只交付可静态构建的产物。

---

## 合规声明

- 全部视觉资产、模型与文案均为**原创**；不复制任何未授权 ROM、商业游戏素材、商标或品牌视觉。
- 唯一的第三方内容是 4 款 **SIL OFL 1.1** 开源字体，随包附带授权原文。
- 年代分段为本馆**原创策展划分**，参考公开史料的时间区间但不代表任何官方分期。
- 本馆**只覆盖代表性成果**，不宣称穷尽全部游戏或全部机型。

详见 `LICENSES.md`。

---

## 限制（自定部分，无实测依据）

以下维度**没有可引用的实测来源**，为**本批自定**，不得当作全站标准：

1. **界面双语的英文措辞**为本批自拟；未与 16 的英文词表或任何参考站对齐
   （16 的设计系统本身只定义视觉层，未定义英文文案）。
2. **中文子集 746 字**只覆盖本包预览页与资产的用字；全站其它页面用字超出即需重新子集化，
   并同步 16 的 `FONT-MANIFEST.json`。
3. **年代分段（7 段）为本馆原创策展划分**，参考公开史料的时间区间但不代表任何官方分期；
   本包不宣称穷尽全部游戏或全部机型。
4. **展品内嵌配色**（墨蓝 / 纸白 / 信号橙）为本馆原创方案，已烘焙进资产，
   与 16 的 UI 色板是两套独立体系，不可互相替换。
5. **图标 48 枚**为本包为「硬件年代馆」这一语境自绘的集合，非任何现成图标库。
6. **`--hair-ctrl`（40% 墨色）**是为达到控件边界 3:1 对比而自定的派生值，
   16 的 `--ds-line` 在深色主题下仅 1.32:1。
7. **16 的 `.ds-indicator` 机制项在本包不适用**（本包无该组件），
   已登记在 `design-tokens.json → meta.alignment.inapplicableChecks` 并附理由。

---

## 命令速查

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 预览服务 `127.0.0.1:4327`（占用时自动顺延） |
| `npm run build` | 静态构建到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run assets` | 重建全部资产（含令牌对齐） |
| `npm run sync-tokens` | 只做与 16 的令牌对齐 + 交叉校验 + 指纹 |
| `npm run tokens` | 令牌 → CSS / JS |
| `npm run fonts` | 单独重建字体 |
| `npm run fontmanifest` | 生成 `public/assets/fonts/FONT-MANIFEST.json` |
| `npm run models` | 单独重建 GLB |
| `node scripts/render.mjs [target]` | 光栅化（`posters`/`covers`/`cases`/`tech`/`fallback`/`models`/`all`） |
| `npm run qa` | 资产完整性自动校验（158 项） |
| `npm run qa-browser` | 浏览器验收（结构 / 字体 / 图片 / 3D / 交互 / 截图 / 响应式） |
| `npm run qa-subpath` | 线上子路径部署复验 |
| `node scripts/qa-ds-conformance.mjs` | 与 16 的 V.1–V.10 符合性验收 |
