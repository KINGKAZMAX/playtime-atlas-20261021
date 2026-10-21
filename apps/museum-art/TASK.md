# TASK 07 — 回响电玩馆 / PLAYTIME ATLAS 原创美术与硬件模型包

最后更新：2026-10-21

本任务为「回响电玩馆 / PLAYTIME ATLAS」博物馆主站（06-museum-core）制作**一套完整、原创、可直接投产的美术包**，
并与 06 共享资产接口约定（端口 4327）。所有代码、美术、模型、测试均由本会话（MiniMax Code M3.1-Flash / max）完成。

---

## 0. 核心约束（不可违反）

| 约束 | 说明 |
| --- | --- |
| 原创优先 | 不是任何现有作品的逐像素复刻。作品名、文案、字体、配色、布局细节、模型形态全部重新设计 |
| 无品牌资产 | 不使用任何商标、Logo、ROM、商业游戏画面、角色、受保护角色名或品牌配色 |
| 来源留痕 | 每个资产在 `LICENSES.md` 与 `manifest.json` 中标注来源（原创 / OFL 字体 / 工具生成），并写明与参考作品的差异 |
| 不虚称 | 不宣称"穷尽所有游戏/时代"；研究部分只覆盖代表性成果 |
| 仅写本目录 | 只写 `07-museum-art/`；同级目录只读 |
| 不上线 | 本任务**不部署公网**。统一由 `14-publish` 集成；本任务只交付**可静态构建**的产物 |
| 本地化 | 运行期零 CDN、零在线 API；字体与素材全部本地自托管 |
| 不购买服务 | 不产生任何费用 |

---

## 1. 视觉方案（Design Direction）

三色体系，全部围绕「深墨蓝 + 暖纸白 + 信号橙」构建，确立为整馆统一语言：

| 角色 | 名称 | 色值 | 用途 |
| --- | --- | --- | --- |
| 基底 | 深墨蓝 Ink 800 | `#0C1726` | 页面/展厅底色，模拟夜场展厅 |
| 基底深 | Ink 900 | `#070E19` | 阴影、遮罩、展柜内腔 |
| 层级 | Ink 600 / 500 | `#1A3149` / `#24415E` | 面板、卡片、分割面 |
| 主文本 | 暖纸白 Paper 50 | `#FBF7EF` | 正文、标题 |
| 纸面 | Paper 200 | `#E7DCC7` | 次级文本、标签牌、哑光纸质感 |
| 强调 | 信号橙 Signal 500 | `#F0601F` | CTA、年代标记、焦点、状态强调 |
| 强调深 | Signal 600 | `#D94A15` | 强调压深、投影 |
| 辅助 | 冷青 Teal 400 | `#4FB3A0` | 「可玩 / 已收录」状态 |

字体（全部自托管，SIL OFL 1.1）：

- 展示体 Display：`Space Grotesk`（拉丁）+ `Noto Sans SC`（中文回退）
- 正文 Sans：`Inter`（拉丁）+ `Noto Sans SC`
- 等宽 Mono：`Space Mono`（拉丁）+ `Noto Sans Mono`（数字/编号回退）
- 中文：`Noto Sans SC`（可变字重，按用字子集化）

> 明确差异：本馆不使用任何商业游戏常见的像素点阵字作为主视觉字体；点阵感仅以**点阵网格图形**（非可读文字）
> 作为年代装饰元素出现。

---

## 2. 交付资产清单

### 2.1 字体 `public/assets/fonts/`
- `space-grotesk-latin.woff2` + `.ttf`（OFL）
- `inter-latin.woff2` + `.ttf`（OFL）
- `space-mono-latin.woff2` + `.ttf`（OFL）
- `noto-sans-sc-subset.woff2` + `.ttf`（OFL，按实际用字子集化）
- `OFL-<family>.txt` 每家族一份许可证
- `fonts.css`：本地 `@font-face`，含 `unicode-range` 与 `font-display: swap`

### 2.2 图标 `public/assets/icons/`
- 约 48 枚**原创** SVG 图标，24×24 网格、1.5px 描边、圆端点
- 分类：`nav` / `era` / `action` / `media` / `audio` / `state`
- 每枚含 `currentColor` 版本（可换色）+ 令牌配色版本
- `icons.svg` 雪碧图（symbol）+ `icons/index.json` 索引

### 2.3 年代海报 `public/assets/posters/`
- 7 张（对应 7 个时代），每张 `poster-<era>.svg` + `poster-<era>.png`（1200×1800）
- 版式：主视觉 AI 生成**无文字**关键帧 + SVG 精确排版中文标题/年份/编号 + 网格与网点装饰
- **不使用 AI 生成的中文字形**（避免乱码），所有文字由 SVG 排版层渲染

### 2.4 封面 `public/assets/covers/`
- 7 张时代封面 `cover-<era>.svg` + `.png`（1600×900），用于年代展厅横幅与卡片头图

### 2.5 展柜 `public/assets/cases/`
- 6 组展柜图形：底座 plinth、玻璃罩、说明铭牌、编号标签、反射高光
- `case-<id>.svg` + `.png`；另含 `case-label-plate.svg` 等部件

### 2.6 硬件 3D 模型 `public/assets/models/`
6 件**简化原创**跨时代硬件，共享馆内配色语言（墨蓝机身 / 纸白面板 / 信号橙点睛），无品牌标识：

| id | 原创名 | 年代带 | 形态要点 |
| --- | --- | --- | --- |
| `cabinet-01` | 星港立式机柜 Starlight Cabinet | 1972–1979 | 灯箱招牌、斜操作台、投币口、摇杆+双键、侧板纹样 |
| `console-02` | 小行星卡带机 Aster Console | 1983–1990 | 扁平方盒、顶部卡槽、双有线手柄（十字键+双键） |
| `console-03` | 子午线光盘机 Meridian Deck | 1994–2000 | 圆角方盒、光盘托、双摇杆手柄、状态灯条 |
| `handheld-04` | 余烬掌机 Pocket Ember | 2004–2010 | 翻盖双屏、十字键、小按键、肩键 |
| `hybrid-05` | 光环平板 Halo Slate | 2012–2017 | 平板主体、可拆手柄侧轨、支撑脚 |
| `modern-06` | 矢量节点 Vector Node | 2020– | 立式机箱、散热格栅、可拆侧板、指示灯 |

每件交付：
- `model-<id>.glb`（二进制 GLB，含 PBR 基础材质，可直接进 three.js / 模型查看器）
- `model-<id>.png`（1024×1024 实机渲染图，作为**降级图**）
- `model-<id>.tech.svg`（技术插画风格的 SVG 降级图，无 WebGL 也能看）
- `model-<id>.json`（几何元数据：尺寸、材质、部件列表）

### 2.7 降级与离线
- `fallback/poster-fallback.svg` / `.png`
- `fallback/model-fallback.svg` / `.png`
- `fallback/no-webgl.svg`
- `fallback/offline-notice.svg`
- 预览页在 WebGL 不可用时自动切换到 SVG 降级图，并有可见提示

### 2.8 统一令牌 `design-tokens.json`
- `color` / `typography` / `space` / `radius` / `shadow` / `grid` / `motion` / `z`
- 附带 `tokens.css`（CSS 自定义属性）与 `tokens.ts`（JS 导出），三者同源生成

### 2.9 预览 `preview.html`
- 可浏览的资产总览页：按类型分区筛选、令牌色板、字体样张、图标网格、海报/封面墙、展柜、3D 模型查看器（three.js，GLB 实时加载 + 轨道旋转）、降级演示
- 本地端口 **4327**；`npm run build` 产出纯静态 `dist/`

### 2.10 文档与清单
- `README.md`（使用说明 + 构建 + 集成）
- `INTERFACE.md`（**与 06-museum-core 共享的接口约定**）
- `LICENSES.md`（资产来源与许可，逐项）
- `QA.md`（验收记录）
- `manifest.json`（`id,title,description,entry,buildCommand,outputDir,status`）
- `assets.manifest.json`（机器可读资产索引）

---

## 3. 与 06-museum-core 的共享接口

- 预览服务：`http://127.0.0.1:4327`
- 资产根：`public/assets/`（构建后 `dist/assets/`）
- 令牌：`/design-tokens.json`、`/assets/tokens.css`、`/assets/tokens.js`
- 资产索引：`/assets/assets.manifest.json`
- 字体样式：`/assets/fonts/fonts.css`
- 图标雪碧：`/assets/icons/icons.svg`
- 模型：`/assets/models/model-<id>.glb` + 同名 `.png` / `.tech.svg`
- 详情见 `INTERFACE.md`（06 侧只需按此路径引用，无需二次加工）

---

## 4. 工程与工具链

| 用途 | 工具 | 来源 |
| --- | --- | --- |
| 构建 | Vite 5（npm 本地安装） | npm |
| 3D 预览 | three.js 0.169（npm 本地安装） | npm |
| GLB 生成 | `@gltf-transform/core` 4（npm 本地安装） | npm |
| 位图渲染 | Playwright + Chromium（headless） | npm |
| 字体子集化 | fontTools + brotli（本地 venv） | PyPI |
| 关键帧主视觉 | `mcode-tools` matrix 图像生成（无文字） | 已授权连接器 |
| SVG 光栅化 | rsvg-convert / Chromium | 本机 |

所有产物落到 `public/assets/`，`dist/` 为纯静态输出，可被 14-publish 直接复制。

---

## 5. 验收标准

1. `npm run build` 成功产出 `dist/`，其中 `index.html` + `assets/` 全部本地相对路径，无外链。
2. 令牌、图标、海报、封面、展柜、模型、降级图**全部实际存在且非空**，无占位图。
3. 7 张海报 PNG 均为 1200×1800，7 张封面 PNG 均为 1600×900，中文文字清晰无乱码。
4. 6 个 GLB 可被 three.js GLTFLoader 正常解析，部件数 > 1，含材质。
5. 6 个模型渲染 PNG 为 1024×1024 且内容为该模型本身（对照校验）。
6. 预览页在 `127.0.0.1:4327` 可打开，3D 模型可旋转，筛选可交互。
7. 禁用 WebGL 时自动显示降级图并有提示。
8. `LICENSES.md` 覆盖全部资产；字体附 OFL 原文；无任何未授权来源。
9. `manifest.json` 字段齐全且 `status` 反映真实状态。
10. `qa-check.mjs` 全部断言通过。

---

## 6. 已知取舍

- 3D 模型为**风格化简化**造型（低面数、清晰体块），追求"一眼认得出年代 + 归入同一馆藏语言"，
  不追求工业设计级还原或照片级 PBR。
- 主视觉关键帧由图像生成模型产出，为避免 AI 中文字形乱码，**所有文字层由 SVG 精确排版叠加**。
- 中文正文字体子集化后仅覆盖本包用字；若 06 需要新增中文字形，需扩充子集字符集（见 `INTERFACE.md` 扩充说明）。
