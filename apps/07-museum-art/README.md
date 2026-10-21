# 07 · 回响电玩馆 / PLAYTIME ATLAS — 原创美术与硬件模型包

> 电子游戏硬件年代馆的**整套原创视觉资产**：深墨蓝 + 暖纸白 + 信号橙视觉方案、
> 自托管许可字体、48 枚手绘图标、7 张年代海报、8 张封面、6 组展柜、
> 6 件跨时代硬件 3D 模型，以及统一设计令牌与四级降级方案。

本任务由 MiniMax Code（M3.1-Flash / max）独立完成：研究、美术、建模、代码与测试全部为本会话产出。

---

## 快速开始

```bash
cd 07-museum-art

# 一键重建全部资产（字体 → 令牌 → 图标 → 海报 → 封面 → 展柜 → 模型）
npm install
npm run assets

# 光栅化（SVG → PNG，3D → 渲染图）
node scripts/render.mjs

# 本地预览
npm run dev        # http://127.0.0.1:4327

# 静态构建
npm run build      # → dist/
```

> `npm run assets` 会重新下载 OFL 字体（约 18 MB）。已缓存时自动跳过。
> 若完全离线，可直接使用仓库中已生成的 `public/assets/`。

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
├── manifest.json              交付清单（供 14-publish 集成）
├── design-tokens.json         ⭐ 统一设计令牌（唯一事实来源）
│
├── index.html                 预览页外壳
├── src/
│   ├── main.js                预览页逻辑（令牌、字体、图标、灯箱、3D 查看器）
│   ├── styles.css             预览页样式
│   └── data.js                资产索引（由 build-manifest.mjs 生成）
│
├── scripts/
│   ├── lib/
│   │   ├── tokens.mjs         令牌唯一事实来源
│   │   ├── catalog.mjs        年代与展品目录（唯一事实来源）
│   │   ├── geometry.mjs       3D 几何构建库
│   │   ├── models.mjs         6 件展品的建模器
│   │   ├── materials.mjs      馆内统一材质库
│   │   ├── glb.mjs            GLB 装配器
│   │   ├── svg.mjs            SVG 构建工具集
│   │   ├── text.mjs           中西混排文本度量与折行
│   │   └── server.mjs         本地静态服务器（光栅化用）
│   ├── build-fonts.mjs        字体下载 + 子集化 + @font-face
│   ├── build-tokens.mjs       令牌 → JSON / CSS / JS
│   ├── build-icons.mjs        48 枚图标 + 雪碧图 + 索引
│   ├── build-posters.mjs      7 张年代海报
│   ├── build-covers.mjs       8 张封面
│   ├── build-cases.mjs        6 组展柜
│   ├── build-models.mjs       6 个 GLB + 元数据
│   ├── build-tech-svg.mjs     技术插画降级图（从真实网格投影）
│   ├── build-fallback.mjs     降级与离线图形
│   ├── build-manifest.mjs     资产索引
│   ├── render.mjs             光栅化（Chromium）
│   ├── qa-check.mjs           资产完整性自动校验
│   └── render/model.html      3D 渲染页
│
├── public/assets/             生成产物（可被 06 / 14 直接复制）
│   ├── fonts/                 4 家族 OFL 字体 + 授权原文
│   ├── icons/                 48 枚图标 + 雪碧图 + 索引
│   ├── posters/               7 张海报（SVG + PNG + 关键帧）
│   ├── covers/                8 张封面（SVG + PNG + 关键帧）
│   ├── cases/                 6 组展柜（SVG + PNG）
│   ├── models/                6 个 GLB + 渲染图 + 技术插画 + 元数据
│   ├── fallback/              5 张降级图形
│   ├── tokens.css / tokens.js / design-tokens.json
│   └── assets.manifest.json   机器可读资产索引
│
├── dist/                      静态构建输出（供 14-publish 复制）
└── screenshots/               验收截图
```

---

## 设计方案

### 配色

| 角色 | 名称 | 值 | 用途 |
| --- | --- | --- | --- |
| 基底 | 墨蓝 Ink 800 | `#0C1726` | 展厅底色 |
| 基底深 | Ink 900 | `#070E19` | 阴影、遮罩、柜内腔 |
| 层级 | Ink 600 / 500 | `#1A3149` / `#24415E` | 面板、卡片 |
| 主文本 | 纸白 Paper 50 | `#FBF7EF` | 标题与正文 |
| 次文本 | Paper 200 | `#E7DCC7` | 说明、标签牌 |
| 强调 | 信号橙 Signal 500 | `#F0601F` | CTA、年代标记、焦点 |
| 辅助 | 青 Teal 400 | `#4FB3A0` | 屏面、可玩状态 |

130 个令牌全部在 `design-tokens.json`，并同源生成 `tokens.css` 与 `tokens.js`。

### 字体

| 家族 | 用途 | 许可 |
| --- | --- | --- |
| Space Grotesk | 展示体 / 标题 / 编号 | SIL OFL 1.1 |
| Inter | 正文 | SIL OFL 1.1 |
| Space Mono | 等宽 / 编号 / 年份 | SIL OFL 1.1 |
| Noto Sans SC | 中文（746 字子集） | SIL OFL 1.1 |

全部下载后按实际用字子集化，存于 `public/assets/fonts/`，**运行期零外部字体请求**。

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

## 命令速查

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 预览服务 `127.0.0.1:4327` |
| `npm run build` | 静态构建到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run assets` | 重建全部资产 |
| `npm run fonts` | 单独重建字体 |
| `npm run models` | 单独重建 GLB |
| `node scripts/render.mjs [target]` | 光栅化（`posters`/`covers`/`cases`/`tech`/`fallback`/`models`/`all`） |
| `npm run qa` | 资产完整性自动校验 |
