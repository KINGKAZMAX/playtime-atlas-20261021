# SOURCES & LICENSES — 余晖设计系统

> 任务：16-design-system ｜ 生成时间：2026-10-21 (GMT+8)

---

## 1. 风格参考来源（只读研究）

| 来源 | URL | 用途 | 取用内容 | 许可/权利 |
| --- | --- | --- | --- | --- |
| Oleksii Besida 作品集 | https://olek.si/ | 视觉机制取证 | **可观察机制**：全屏分段滚动、色调自适应分区、媒体卡去饱和遮罩、圆点↔箭头形变、景深式导航轴、入场模糊+位移、胶囊/圆形控件语言、**灯箱的 FLIP 展开与悬停克隆预览**、**底层页面退后（缩放+模糊）** | 公开作品集。仅作**只读视觉观察与机制研究**。**未**下载、未再分发、未嵌入其任何图片、视频、字体、Logo、图标或代码 |

### 1.1 明确未取用的内容

| 类别 | 参考站所用 | 本系统 | 说明 |
| --- | --- | --- | --- |
| 强调色 | `#6549F2`（紫） | `#B4432B`（朱砂） | 配色重新设计 |
| 展示字体 | 自研/商用 woff2（`display` / `interd`） | Space Grotesk | 字体重新设计，全部 OFL 可自托管 |
| 正文字体 | 自研/商用 woff2（`text`） | Inter | 同上 |
| 等宽字体 | Inter 系 | Space Mono | 同上 |
| 缓动曲线 | `cubic-bezier(.1,.1,0,1)` 等 9 条 | 自有 5 条曲线族 | 缓动重新设计 |
| 字号/行高/字距 | 见 REFERENCE-AUDIT §3.4 | 见 `design-tokens.json` | 排版重新设计（唯一例外：分区标题 20px/500，角色完全相同） |
| 圆角/阴影/间距 | 见 REFERENCE-AUDIT §3.4 | 全部自有 | 布局细节重新设计 |
| 媒体圆角 | 贝塞尔**超椭圆**（`clip-path: path(...)`） | 标准圆角矩形 | 跨浏览器与低性能设备表现更稳 |
| 灯箱背景 | **纯白无遮罩** | `--ds-overlay` + `backdrop-filter` | 需把焦点锁在面板 |
| 文案 | "I'm a Delight Centered IxD Designer"、"Scroll or click to exit" 等 | 全部原创（回响电玩馆、千色仪、渊甲拾遗者…） | 内容原创；退出提示改为带 `aria-label` 的图标圆钮 |
| 作品模型 | 14 个他人项目 | 14 件本项目原创作品 | **不冒充**原作者身份或项目 |
| "Clap" 互动 | Lottie 动画 + 掌声音频 + 计数 | 不采纳 | 避免引入音频资产与自动播放策略问题 |

### 1.2 取证证据文件

`evidence/ref/` 内的 PNG 与 JSON 为**取证截图与运行时测量数据**，用于内部设计决策与验收留痕。
它们**不构成**设计系统的一部分，不被 `preview.html` 或任何产品页面引用。
**详见 `evidence/README.md`** —— 该目录已声明「参考站观察证据，非本项目产物」，发布时须整体排除。

### 1.3 取证期间访问的参考站资源（仅供复现，不随包分发）

| 资源 | 用途 | 结论 |
| --- | --- | --- |
| `https://olek.si/` | 外壳 HTML（5 633 B） | 仅读取结构与 meta；**未**随包保存 |
| `https://olek.si/assets/index-Cq43OVCY.js` | 主前端包（575 391 B） | 抽取 CSS 字面量与状态机；**未**随包保存 |
| `https://olek.si/assets/page-plsFtWPY.js` | 文章页懒加载子包（391 750 B） | 还原详情页渲染实现；**未**随包保存 |
| `https://olek.si/api/extended?path=%2F` | 扩展模式接口 | 返回 `{}`；根路径无扩展变体 |
| `https://olek.si/sitemap.xml`、`/robots.txt`、`/SPTLGHT` | 路由探测 | 均无有效内容；无独立作品页路由 |

> **红线自检**：`evidence/ref/` 内**只有 PNG 与 JSON**（13 张截图 + 7 份测量数据），
> **不含**参考站的 HTML / JS / CSS / 字体 / 图片 / 视频任何资产或源码。
> 取证件全部隔离在 `evidence/` 下，与可发布产物（`preview.html` / `src/` / `fonts/`）物理分离。

---

## 2. 字体许可

本设计系统使用的全部字体均为 **SIL Open Font License 1.1**（可自由使用、商用、再分发、嵌入，含随包附许可原文的要求）。

| 字体 | 文件 | 版权声明 | 许可文件 | 字节 |
| --- | --- | --- | --- | --- |
| Space Grotesk | `space-grotesk-latin.woff2` | Copyright 2020 The Space Grotesk Project Authors | `fonts/OFL-space-grotesk.txt` | 34 788 |
| Inter | `inter-latin.woff2` | Copyright 2020 The Inter Project Authors | `fonts/OFL-inter.txt` | 132 684 |
| Space Mono | `space-mono-regular.woff2` / `-bold.woff2` | Copyright 2020 The Space Mono Project Authors | `fonts/OFL-space-mono-regular.txt` / `OFL-space-mono-bold.txt` | 14 884 / 15 000 |
| Noto Sans SC（子集，可选增强） | `noto-sans-sc-subset.woff2` | Copyright 2014–2021 Adobe, with Reserved Font Name 'Source' | `fonts/OFL-noto-sans-sc.txt` | 197 600 |

**来源与再分发说明**
- 上述文件**取自本项目内已 vendored 的同一批文件**（`07-museum-art/public/assets/fonts/` 与 `06-museum-core/public/art/assets/fonts/`），本任务**只读复制**，未修改来源目录，未重新下载。
- 各字体的上游项目主页见 `fonts/FONT-MANIFEST.json` 的 `source` 字段。
- OFL 允许再分发；随包附许可原文即可满足署名要求。

**中文字体策略**
- 汉字优先走**系统字体栈**（`PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei` / `Source Han Sans SC`）——0 字节、离线可用、全字形覆盖。
- `Noto Sans SC` 子集作为渐进增强。该子集由 07-museum-art 按其自身用字生成，**覆盖有限**；全站文案定稿后需重新子集化（见 `fonts/FONT-MANIFEST.json → faces[].coverage`）。
- 拉丁字形始终来自自托管字体，与系统栈叠加时不会出现混合基线错位。

---

## 3. 图标

`preview.html` 中的全部图标为**内联 SVG 路径**，由本任务手写（圆/线/几何基本形），**未**使用任何图标库、字体图标或第三方资源。
`components.css` 中的 `.ds-btn__icon`、`.ds-iconbtn svg` 等接口接受任意 SVG。

---

## 4. 图像

| 用途 | 来源 |
| --- | --- |
| `evidence/ref/*.png` | 对 https://olek.si/ 的取证截图（只读观察产物） |
| `evidence/local/*.png` | 本设计系统 `preview.html` 的自渲染截图（完全自产） |
| `preview.html` 中的 `pv-art` 渐变块 | 纯 CSS 渐变，自产 |

本设计系统**不含**任何来自参考站的图像资产。

---

## 5. 第三方软件

| 组件 | 用途 | 许可 |
| --- | --- | --- |
| Google Chrome（headless） | 取证与验收时的渲染引擎 | 本机已装，仅作工具使用，不随包分发 |
| Node.js 24 | 脚本运行 | 本机已装 |
| mcode-tools | 未在本任务中使用 | — |

**本交付包的运行期依赖为零**：无框架、无构建工具、无 npm 依赖、无 CDN 引用。
`tools/*.mjs` 仅使用 Node 内置模块（`node:fs` / `node:path` / `node:os` / `node:url` + 全局 `WebSocket` / `fetch`）。

---

## 6. 引用规范

在页面中引用本设计系统时，保留以下署名：

```
视觉机制参考：Oleksii Besida, https://olek.si/ （公开作品集，机制研究用途）
本设计系统配色、字体、字号、缓动、文案与内容均为原创。
```

### 6.1 非参考站来源的规范条款（**不属于"参考"**）

以下条款**不来自参考站**，单列以免被误读为 olek.si 风格：

| 条款 | 来源 | 性质 |
| --- | --- | --- |
| **§2.5 字体栈顺序规则**（覆盖完整的 CJK 族必须排在覆盖有限的子集之前） | `05-museum-research` 在其目录实测到的中文基线错位（`05/evidence/ds-duration-audit.json` 同目录的字体栈核对） | **本批内部工程正确性约束**。参考站是纯英文站，不会暴露该问题，**无 olek.si 依据** |
| `--ds-ink-faint` 取值（`#6E655E` / 深色 `#9A918A`） | WCAG 2.2 对比度计算 | **无障碍驱动的规范性偏离**。参考站实测次级灰为 `#999999`（2.85:1，不达 AA），本系统主动改深 |
| 触摸目标两档（24px 硬性 / 44px 主控件） | WCAG 2.2 SC 2.5.8 / SC 2.5.5 | 参考站无鼠标以外的输入形态，无先例 |
| §2.3 中文排版规则（`lang` 驱动、字距归零、行高 1.75） | 中文排版惯例 | 参考站纯英文，无先例 |

> 登记规则：**凡标注"本批自定"的维度，其依据不得回指 olek.si。** 详见 `DESIGN-SPEC.md` §16 与 `MIGRATION-NOTES.md` §5.2。

---

## 7. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-10-21 | 初版：完成 olek.si 取证，产出 4 份 OFL 字体自托管包与令牌/组件/规范/样例。 |
| 2026-10-21 v1.0.1 | 修正规范源头缺陷：`Noto Sans SC` 子集原排在系统 CJK 栈**之前**（会导致中文基线错位），已在 `src/tokens.css` / `fonts/fonts.css` / `fonts/FONT-MANIFEST.json` / `design-tokens.json` 四处调序；新增 `DESIGN-SPEC.md` §2.5 硬性条款与 `MIGRATION-NOTES.md` §2.0.1 专项清单。来源：`05-museum-research` 实测，**非参考站**（见 §6.1）。 |
