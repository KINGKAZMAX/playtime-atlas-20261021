# LICENSES —《折光纪 · 当代可玩展厅》资产与许可

> 本厅**不包含任何第三方美术、音频、字体位图、ROM 或商业游戏资源**。
> 下面逐项说明每一类资产的来源与授权状态。
>
> **2026-10-21 改版更新**：字体栈按 16-design-system 的字体清单统一
> （Space Grotesk / Inter / Space Mono，全部 SIL OFL 1.1），
> 原 `@fontsource-variable/*` 依赖已移除，改为本目录内自托管 woff2 + 随包附许可全文。
>
> **2026-10-21 晚间（接入 16 号规范）更新**：字体层统一由
> `public/assets/ds/fonts/` 承载（即 16-design-system/fonts/ 的原样副本），
> 本目录不再保留第二份 @font-face 声明与重复的字体文件。

---

## 1. 第三方依赖

| 依赖 | 版本 | 许可 | 使用方式 | 备注 |
| --- | --- | --- | --- | --- |
| `three` | 0.169.0 | MIT | 3D 渲染（折光阁 / 光环台） | npm 本地安装，随构建产物打包 |
| `vite` | 5.4.11 | MIT | 开发与构建工具 | 仅开发期使用，不进产物 |

- 许可证全文随 npm 包分发于 `node_modules/<pkg>/LICENSE`。
- **运行时零 CDN、零外链字体、零在线 API**：所有依赖在构建时打进 `dist/`，页面加载不请求任何第三方域名
  （已由验收脚本逐条断言，见 `QA.md`）。

### 1.1 自托管字体（`public/assets/ds/fonts/`）

字体族名与 `16-design-system/fonts/FONT-MANIFEST.json` 一致；
文件来源为 16 号已 vendored 的同一批 OFL 字体（**仅复制，未修改来源目录**）。
产物内路径为 `dist/assets/ds/fonts/`，随本厅一起发布。

| 字体 | 族名 / 权重 | 文件 | 字节 | 许可 | 用途 |
| --- | --- | --- | --- | --- | --- |
| Space Grotesk | `Space Grotesk` / 300–700 可变 | `assets/ds/fonts/space-grotesk-latin.woff2` | 34 788 | SIL OFL 1.1 | 展示体：作品名、分区标题、英雄区标题、按钮 |
| Inter | `Inter` / 100–900 可变 | `assets/ds/fonts/inter-latin.woff2` | 132 684 | SIL OFL 1.1 | 正文体：长文、说明、详情 |
| Space Mono | `Space Mono` / 400 | `assets/ds/fonts/space-mono-regular.woff2` | 14 884 | SIL OFL 1.1 | 等宽体：年份、编号、键位、坐标、史料编号 |
| Space Mono | `Space Mono` / 700 | `assets/ds/fonts/space-mono-bold.woff2` | 15 000 | SIL OFL 1.1 | 等宽体加粗 |
| Noto Sans SC | `Noto Sans SC` / 100–900 | `assets/ds/fonts/noto-sans-sc-subset.woff2` | 197 600 | SIL OFL 1.1 | 中文**渐进兜底**（仅在系统 CJK 栈全部不可用时才命中） |

**版权声明（随包原文，勿删）**

- Space Grotesk — Copyright 2020 The Space Grotesk Project Authors
  (https://github.com/floriankarsten/space-grotesk) · 许可全文 `assets/ds/fonts/OFL-space-grotesk.txt`
- Inter — Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter)
  · 许可全文 `assets/ds/fonts/OFL-inter.txt`
- Space Mono — Copyright 2020 The Space Mono Project Authors
  (https://github.com/sharanda/space-mono) · 许可全文 `assets/ds/fonts/OFL-space-mono-regular.txt`
  与 `assets/ds/fonts/OFL-space-mono-bold.txt`
- Noto Sans SC — Copyright 2022 The Noto Project Authors
  (https://github.com/notofonts/noto-cjk) · 许可全文 `assets/ds/fonts/OFL-noto-sans-sc.txt`

### 字体再分发说明

以上五款字体均为 **SIL Open Font License 1.1**：允许随软件一起分发与嵌入
（含子集化与 woff2 转换），要求**保留许可证与版权声明**、不得单独售卖字体本身。
本项目满足该条款：五份 OFL 许可全文随字体文件一并放在 `public/assets/ds/fonts/`
（构建后位于 `dist/assets/ds/fonts/`），`LICENSES.md` 保留上述版权声明，
字体文件仅作为页面资源分发。

字体声明文件 `assets/ds/fonts/fonts.css` 与字体文件**同目录**，
内部以**相对路径**引用（`url("./space-grotesk-latin.woff2")`），
因此在 GitHub Pages 的二级子路径（如 `/playtime-atlas-20261021/exhibits/12-era-modern/`）
下仍可正确加载，无绝对根路径。

### 中文字体与 CJK 字体栈顺序（硬性）

中文正文与标题使用**系统字体栈**（PingFang SC / Hiragino Sans GB / 微软雅黑 /
Source Han Sans SC / Noto Sans SC），**不下载、不外链**任何中文字体 CDN。

`noto-sans-sc-subset.woff2` 是 16 号交付的**有限子集**（按 07-museum-art 自身用字生成，
覆盖范围有限），在本厅中**只作为最后的兜底**：

```
拉丁自托管字体 → 完整覆盖的系统 CJK 栈 → Noto Sans SC 子集 → 通用 sans-serif
```

> ⚠️ **顺序不可颠倒**：CSS 字体回退是**按字符**进行的，若把覆盖有限的子集排在
> 覆盖完整的系统族之前，浏览器会逐字回退，同一段文字里混入两套不同度量的字形，
> 表现为**混排基线错位**。本目录的 `--ds-font-display` / `--ds-font-text`
> 直接采用 16 号 `tokens.css` 的取值（顺序已修正），**不重写**。
> 该项由 `scripts/verify-ds.mjs` 的「字体栈顺序」断言逐条核对。

---

## 2. 本厅原创资产

| 资产类型 | 生成方式 | 授权 |
| --- | --- | --- |
| 全部 3D 几何体 | Three.js 代码构建（Box / Cylinder / Torus / Octahedron / Plane / 自定义 Shader） | 本厅原创 |
| 地板 / 色散 / 光栅纹理 | Canvas 2D 运行时绘制（`makeTileTexture` / `makeDispersionTexture` / `makeGateTexture`） | 本厅原创 |
| 天穹渐变 | 自定义 GLSL Shader | 本厅原创 |
| 主视觉棱镜背景 | Canvas 2D 运行时绘制（`startHeroAnimation`） | 本厅原创 |
| 节奏轨道 / 节拍环 / 拍点标尺 | Canvas 2D 运行时绘制（`PulseGame.render`） | 本厅原创 |
| 全部音乐与音效 | WebAudio 实时合成（`src/rhythm/audio.js`：kick / snare / hat / bass / pluck / pad / 判定音） | 本厅原创 |
| 全部谱面 | `src/data/charts.js` 手写记谱 DSL 展开 | 本厅原创 |
| 全部关卡与光路规则 | `src/data/levels.js` + `src/puzzle/rules.js` 手写 | 本厅原创 |
| 文案 / 展签 / 时间轴描述 | 本厅撰写 | 本厅原创 |
| 图标（品牌三角、指示符） | 内联 SVG / 文本字形 | 本厅原创 |

**未使用**：任何位图贴图、任何音频采样文件、任何第三方模型文件、任何截图、任何品牌 logo。

---

## 3. 参考与差异说明

本厅参考了**公开作品已成熟的机制与品质标准**，但下列内容全部重新设计，不构成对任何作品的复制：

| 本厅要素 | 参考的公开机制（非素材） | 本厅的重新设计 |
| --- | --- | --- |
| 《脉冲走廊》 | 节奏游戏的「时间窗判定 / 连击 / 准度评级」通行范式 | 谱面即乐谱的合成架构；「应答靶 / 禁触靶」反应事件；收缩节拍环 + 下行光带 + 拍点标尺三重视觉节拍替代 |
| 《折光阁》 | 等距视角解谜的「空间阅读」表达手法 | 原创的「光路折射」规则：反光板 / 分光镜 / 色散棱镜 / 接收环 / 光栅门 / 余辉压板 / 移动浮台；颜色匹配与余辉计时机制 |
| 《光环台》 | 沉浸式展陈的「热点展签」交互模型 | 原创程序化夜色棱镜庭 + 中央棱镜碑；桌面环视操作；**明确标注为桌面交互演示** |
| 视觉体系 | — | 原创命名「折光纪 / PRISM ERA」、版式与全部文案；**视觉语言**改版后统一采用 16-design-system 的「余晖设计系统」令牌（`design-tokens.json`） |

**差异声明**：

- 不声称原创任何参考作品；
- 不使用任何未授权 ROM、商业游戏资源或品牌视觉；
- 时间轴只引用**公开的官方页面链接**并标注来源，属于事实性引述与策展评述，不搬运原文段落或图片；
- 改版只换**视觉语言**（色板 / 字体 / 间距 / 圆角 / 动效 / 外壳形态），
  **作品名、文案、音乐、关卡、史料与玩法一律未改**。

---

## 4. 字体 / 链接类第三方内容的边界

- 页面中所有指向外部站点的链接均为 `target="_blank" rel="noopener noreferrer"` 的**纯文本外链**，
  不内嵌、不镜像、不缓存对方内容；用户点击后跳转至对方站点。
- `LICENSES.md` 与 `SOURCES.md` 属于本厅自有文档，随源码一同分发。
