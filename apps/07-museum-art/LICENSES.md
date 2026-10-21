# LICENSES — 资产来源与许可

最后更新：2026-10-21 · 对应美术包版本 `1.0.0`

本文件逐项说明本包**每一个**资产类别的来源、许可与改动。
原则：**除明确列出的开源字体外，全部为本馆原创**；不使用任何未授权 ROM、商业游戏素材、
商标、角色形象或品牌视觉。

---

## 0. 总结

| 类别 | 来源 | 许可 | 数量 |
| --- | --- | --- | --- |
| 设计令牌 | 本馆原创 | CC0-1.0 | 130 个令牌 |
| 图标 | 本馆手绘路径 | CC0-1.0 | 48 枚 |
| 年份/年代分段 | 本馆原创策展分段 | CC0-1.0 | 7 段 |
| 海报关键帧 | 本馆提示词 → 生成式图像模型输出 | CC0-1.0 | 7 张 |
| 海报 SVG/PNG 排版层 | 本馆代码生成 | CC0-1.0 | 7 + 7 |
| 封面 SVG/PNG | 本馆代码生成（复用关键帧） | CC0-1.0 | 8 + 8 |
| 展柜 SVG/PNG | 本馆代码生成 | CC0-1.0 | 6 + 6 |
| 3D 硬件模型 | 本馆参数化建模 | CC0-1.0 | 6 个 GLB |
| 技术插画降级图 | 本馆代码从自有网格生成 | CC0-1.0 | 6 张 |
| 降级/离线图形 | 本馆代码生成 | CC0-1.0 | 5 张 |
| 字体 | Google Fonts 上游开源字体 | **SIL OFL 1.1** | 4 家族 / 5 文件 |
| 第三方素材 | — | **无** | 0 |

> 官方字体授权原文逐家族随包分发：`public/assets/fonts/OFL-*.txt`。

---

## 1. 字体（唯一的第三方内容）

四款字体全部来自 **Google Fonts 官方仓库**，采用 **SIL Open Font License 1.1**，
允许自由使用、修改、子集化与再分发（含商业用途），要求保留授权与版权声明。

| 家族 | 用途 | 上游文件 | 上游目录 | 授权副本 |
| --- | --- | --- | --- | --- |
| Space Grotesk | 展示体 / 标题 / 编号 | `SpaceGrotesk[wght].ttf` | `ofl/spacegrotesk/` | `OFL-space-grotesk.txt` |
| Inter | 正文 | `Inter[opsz,wght].ttf` | `ofl/inter/` | `OFL-inter.txt` |
| Space Mono | 等宽 / 编号 / 年份 | `SpaceMono-Regular.ttf`、`SpaceMono-Bold.ttf` | `ofl/spacemono/` | `OFL-space-mono-*.txt` |
| Noto Sans SC | 中文 | `NotoSansSC[wght].ttf` | `ofl/notosanssc/` | `OFL-noto-sans-sc.txt` |

上游地址（`https://raw.githubusercontent.com/google/fonts/main/` 之下）：

```
ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf
ofl/spacegrotesk/OFL.txt
ofl/inter/Inter%5Bopsz,wght%5D.ttf
ofl/inter/OFL.txt
ofl/spacemono/SpaceMono-Regular.ttf
ofl/spacemono/SpaceMono-Bold.ttf
ofl/spacemono/OFL.txt
ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
ofl/notosanssc/OFL.txt
```

### 1.1 本包做过的改动

对所有字体执行了**子集化（subsetting）**，除此之外**未做任何字形修改**：

| 字体 | 子集范围 | 处理方式 |
| --- | --- | --- |
| Space Grotesk / Inter / Space Mono | 基础拉丁 + 常用符号 + 箭头 + 几何符号 + 中文标点 + 全角形式 | 按 Unicode 区段子集 |
| Noto Sans SC | 本包实际用到的 **746 个**汉字与全角符号 | 按字符集子集 |

处理命令由 `scripts/build-fonts.mjs` 调用 `fontTools.subset` 执行：

```
fontTools.subset <src.ttf> --output-file=<out.woff2> --flavor=woff2 \
  --layout-features='*' --name-IDs='*' --name-languages='*' \
  --notdef-outline --recommended-glyphs --no-hinting \
  [--unicodes=… | --text-file=…]
```

- 保留可变字体的 `fvar` 轴（Space Grotesk `wght`、Inter `opsz`+`wght`、Noto Sans SC `wght`）。
- 移除 `DSIG` 表与 hinting 指令（不影响渲染结果，仅减小体积）。
- **未修改任何字形轮廓**、未重新命名、未合并或拆分字重。

### 1.2 OFL 1.1 的署名要求

SIL OFL 1.1 要求：若随软件/素材分发字体，**必须同时分发授权与版权声明**，且不得单独出售字体本身。
本包通过 `public/assets/fonts/OFL-*.txt` 满足该要求，并在本站页面底部标注字体来源与许可。

---

## 2. 海报与封面关键帧

7 张年代海报关键帧 + 1 张展厅关键帧由**生成式图像模型**产出，
经由本机已授权的 `mcode-tools` 连接器（`connector__matrix__generate_image`）调用，
提示词由本任务自行撰写并归档于 `scripts/.cache/gen-args.json`。

**产出性质与合规说明：**

- 提示词中明确写入 "absolutely NO text, NO letters, NO numbers, NO logos"，
  以避免生成模型在图中产生字形；所有实际文字均由后续 SVG 排版层叠加。
- 提示词仅描述**通用年代氛围与材质**（示波器辉光、霓虹灯箱、卡带纹路、光盘虹彩、
  低多边形线框、翻盖掌机、平板与云节点、展厅橱窗），未引用任何具体品牌、
  角色、游戏名称或受保护视觉元素。
- 产出为本包专用的原创图像，署名以 CC0-1.0 释出。
- 若生成模型的服务条款另有归属要求，本包按最保守口径处理：
  **不将任何关键帧用于超出本馆范围的用途**。

### 2.1 与参考作品的差异

本包的年代海报**不是**任何现有展览海报、专辑封面或游戏海报的复刻。
具体差异：

| 维度 | 本包做法 |
| --- | --- |
| 版式 | 原创的「巨号水印 + 竖向年代刻度尺 + 信号橙标记条 + 铭牌式页脚」结构 |
| 配色 | 固定为深墨蓝 / 暖纸白 / 信号橙三色，非任何参考作品配色 |
| 字体 | Space Grotesk + Noto Sans SC（非点阵体、非任何商业字体） |
| 文案 | 全部为本馆原创撰写的策展文字 |
| 装饰 | 原创网点、半调与角标规则 |

---

## 3. 图标

48 枚图标全部为本任务**手工编写的 SVG 路径**，24×24 网格、1.5 描边、圆端点。
**未使用任何第三方图标库**（如 Font Awesome、Material Icons、Lucide 等）的图形数据。

逐枚路径定义见 `scripts/build-icons.mjs`，可逐行核对。

---

## 4. 3D 硬件模型

6 件展品全部为**虚构展品**，由本任务编写的参数化几何构建器
（`scripts/lib/geometry.mjs` + `scripts/lib/models.mjs`）直接生成三角网格，
再由 `@gltf-transform/core` 装配为标准 GLB。

- **不含**任何厂商标识、贴图、Logo、字体或受保护的造型元素。
- 造型只提炼「某一时代硬件的**通用形态语汇**」（例如：立式投币机柜的灯箱—屏幕—控制台三段式、
  八位主机的扁平方盒 + 顶部卡槽 + 十字键、光盘主机的圆角机身 + 弹出托盘 + 双摇杆、
  双屏翻盖掌机的上下分屏 + 转轴、平板混合主机的可拆手柄 + 侧轨、立式模块化机箱的格栅 + 可拆侧板）。
- **不含**任何具体产品的独特造型、专有曲线、按键布局细节或外观特征。
- 所有展品名称（星港立式机柜、小行星卡带机、子午线光盘机、余烬掌机、光环平板、矢量节点）
  及其拉丁名均为本包虚构。

网格由本任务从零编写，未使用任何第三方 3D 模型资产或模型文件。

---

## 5. 技术插画降级图

`model-*.tech.svg` 由本包**自有的 3D 网格**经特征棱边提取 + 正交投影生成
（见 `scripts/build-tech-svg.mjs`），是正视图与侧视面的工程制图风格线稿。
与第 4 节同源，无第三方内容。

---

## 6. 文案与策展内容

- 7 个年代的**名称、拉丁名、年份区间、标语、正文、关键词**均为本任务原创撰写。
- 年份区间参考公开史料的通行分期，但**分段边界、命名与全部文案为本馆原创策展结果**，
  不代表任何机构的官方分期。
- 正文在个别处以文字形式提及历史作品类型（如街机时代的太空射击、格斗、赛车），
  属于**史料性文字说明**；**未使用任何受版权保护的角色形象、名称标识、关卡、截图或素材**。
- **明确限制**：本馆只覆盖**代表性成果**，不宣称穷尽全部游戏、全部机型或全部厂商产品。

### 6.1 研究来源

年代分期的史料参照（仅用于确认时间区间，不复制任何素材）：

- Wikipedia, *History of video games* — 用于核对早期街机（1972–1978）、街机黄金期（1978–1982）、
  第三代八位机（1983–1995）、第四代 16 位（1987–2003）、第五代 32/64 位（1993–2005）、
  第六代（1998–2013）、第七/八代（2005 至今）等通行分期区间。
  <https://en.wikipedia.org/wiki/History_of_video_games>
- Retro Tech Gadgets, *The Complete Retro Gaming Console Timeline (1972–2005)* — 用于交叉核对
  各代主机的上市年份区间。
  <https://retrotechgadgets.com/?p=461/>

除上述时间区间外，本包**未引用**任何外部的图像、字体、模型、图标或文案。

---

## 7. 降级与离线图形

`public/assets/fallback/` 下的 5 张图形全部由本包代码生成（`scripts/build-fallback.mjs`），
不含第三方内容。

---

## 8. 构建与渲染工具（不随包分发）

以下工具仅用于**生成**本包资产，其产物中的表达完全由本包控制：

| 工具 | 用途 | 许可 |
| --- | --- | --- |
| Vite 5 | 预览页打包 | MIT |
| three.js 0.169 | 预览页 3D 查看器 | MIT |
| @gltf-transform/core 4 | GLB 装配 | MIT |
| Playwright + Chromium | SVG / 3D 光栅化 | Apache-2.0 |
| fontTools + brotli | 字体子集化 | MIT / BSD |
| ImageMagick 7 | 关键帧裁切与压缩 | Apache-2.0 |
| mcode-tools（matrix 图像生成） | 海报/封面关键帧 | 见 §2 |

这些依赖**不进入最终静态产物**，也不会在页面运行时发起任何请求。

---

## 9. 第三方素材计数

**0**。

本包不含任何来自第三方的图像、字体（除 §1 的开源字体）、图标、模型、音频或视频资源。
所有运行期资源均为本地自托管。

---

## 10. 致谢

- 开源字体作者：Florian Karsten（Space Grotesk）、Rasmus Andersson（Inter）、
  Colophon Foundry（Space Mono）、Google / Noto 团队（Noto Sans SC）。
- 字体依据 SIL Open Font License 1.1 使用，授权全文见 `public/assets/fonts/OFL-*.txt`。
