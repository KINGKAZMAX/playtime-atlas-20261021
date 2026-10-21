# LICENSES — 余晖设计系统

> 任务：16-design-system ｜ 登记时间：2026-10-21 (GMT+8)
> 本文件登记**本目录随包分发**的全部第三方资产及其许可。
> **各接入目录也须在自己的目录内建立同名 `LICENSES.md`**（见 `MIGRATION-NOTES.md` §8）。

---

## 1. 字体（全部为 SIL Open Font License 1.1）

| 字体 | 角色 | 文件 | 字节 | 许可 | 许可全文 | 版权声明 | 上游 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Space Grotesk | display（作品名/分区标题/英雄区） | `fonts/space-grotesk-latin.woff2` | 34 788 | SIL OFL 1.1 | `fonts/OFL-space-grotesk.txt` | Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk) | https://github.com/floriankarsten/space-grotesk |
| Inter | text（正文/说明/详情） | `fonts/inter-latin.woff2` | 132 684 | SIL OFL 1.1 | `fonts/OFL-inter.txt` | Copyright 2020 The Inter Project Authors (https://github.com/rsms/inter) | https://github.com/rsms/inter |
| Space Mono | mono（年份/编号/坐标/键位） | `fonts/space-mono-regular.woff2` | 14 884 | SIL OFL 1.1 | `fonts/OFL-space-mono-regular.txt` | Copyright 2020 The Space Mono Project Authors (https://github.com/sharanda/space-mono) | https://github.com/sharanda/space-mono |
| Space Mono（粗） | mono 700 | `fonts/space-mono-bold.woff2` | 15 000 | SIL OFL 1.1 | `fonts/OFL-space-mono-bold.txt` | 同上 | 同上 |
| Noto Sans SC（子集，可选增强） | cjk fallback | `fonts/noto-sans-sc-subset.woff2` | 197 600 | SIL OFL 1.1 | `fonts/OFL-noto-sans-sc.txt` | Copyright 2014–2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source' | https://github.com/notofonts/noto-cjk |

**合计 394 956 字节**

### 1.1 OFL 1.1 关键义务与本包履行情况

| OFL 要求 | 本包履行 |
| --- | --- |
| 保留版权与许可声明 | ✅ 许可全文 5 份随包分发于 `fonts/` |
| 字体文件以机器可读形式提供 | ✅ woff2 原文件 |
| 不得单独售卖字体 | ✅ 不适用（非售卖） |
| 修改过的字体须用 RFN 改名 | ✅ 未修改任何字体文件 |
| 不得混用 OFL 字体与其他类型字体 | ✅ 全部 OFL |

### 1.2 字体文件来源声明

- 上述 woff2 **取自本项目内已 vendored 的同一批文件**（`07-museum-art/public/assets/fonts/` 与 `06-museum-core/public/art/assets/fonts/`），本任务**只读复制**，**未修改**来源目录，**未**从外部重新下载。
- 字体**不取自**参考站 https://olek.si/ 。参考站使用 5 个自研/商用 woff2（`display` / `text` / `inter` / `interd` / `interr`），本项目**未**下载、未再分发其中任何一个。
- `noto-sans-sc-subset.woff2` 的**字形覆盖有限**（由 07-museum-art 按其自身用字子集化）。全站文案定稿后需用 fonttools 重新子集化并更新本表字节数与 `fonts/FONT-MANIFEST.json → coverage`。在此之前，汉字由**系统字体栈**兜底，不会缺字。

---

## 2. 代码

| 文件 | 许可 | 说明 |
| --- | --- | --- |
| `src/tokens.css`、`src/components.css`、`preview.html`、`tools/*.mjs`、全部 `*.md` | 本项目原创 | 随本批交付，可自由使用与修改 |

- `tools/*.mjs` **零运行时依赖**：仅使用 Node.js 内置模块（`node:fs` / `node:path` / `node:os` / `node:url` / `node:child_process`）与 Node 18+ 内置的全局 `WebSocket` / `fetch`。
- **不**包含任何第三方 npm 包、构建工具或框架。
- 取证阶段使用本机已安装的 **Google Chrome**（仅作渲染/测量引擎，**不随包分发**）与 **Node.js**（仅作脚本运行时，**不随包分发**）。

---

## 3. 图形与图像

| 资产 | 来源 | 许可 |
| --- | --- | --- |
| `preview.html` 中的全部图标 | **本任务手写的内联 SVG 路径**（圆/线/几何基本形） | 原创，随本批交付 |
| `preview.html` 中的 `pv-art` 渐变块 | 纯 CSS 渐变 | 原创 |
| `evidence/local/*.png` | 本设计系统 `preview.html` 的自渲染截图 | 原创 |
| `evidence/ref/*.png` | 对 https://olek.si/ 的**取证截图** | 见 §4 |

**本包不含**任何来自参考站或其他第三方的图片、插画、图标、Logo、模型或视频资产。

---

## 4. 参考站（只读研究，非分发资产）

| 来源 | URL | 性质 | 本包使用方式 |
| --- | --- | --- | --- |
| Oleksii Besida 作品集 | https://olek.si/ | 第三方公开作品集 | **仅作只读视觉观察与设计机制研究** |

- 本包**未**下载、未再分发、未嵌入其任何图片、视频、字体文件、Logo、图标或源代码。
- `evidence/ref/` 中的 PNG 是**取证截图**（内部设计决策与验收留痕），不构成设计系统的一部分，**不被** `preview.html` 或任何产品页面引用。
- 本系统的**作品名、文案、内容、配色、字体、字号、行高、字距、圆角、阴影、间距、缓动曲线、布局细节、模型形态全部为本系统原创**，不冒充参考站作者或其项目。
- 风格**机制**（全屏分段滚动、分区色调自适应、媒体卡去饱和遮罩、圆点↔箭头指示器形变、景深式年代轴、单一强调色、胶囊控件语言）为可观察的通用模式，具体实现均为本系统自写。
- 唯一与参考站完全同值的排版数值是**分区标题 20px / 字重 500**（承担完全相同的角色），已在本表与 `SOURCES.md` §1.1 显式登记。

---

## 5. 引用规范

在页面中使用本设计系统时，建议保留以下署名：

```
视觉机制参考：Oleksii Besida, https://olek.si/ （公开作品集，机制研究用途）
配色、字体、字号、缓动、文案与内容为 PLAYTIME ATLAS 本批原创。
本目录字体为 SIL Open Font License 1.1，许可全文见 fonts/OFL-*.txt。
```

---

## 6. 合规自查

| # | 项 | 状态 |
| --- | --- | --- |
| 1 | 随包第三方资产全部登记 | ✅ 5 款字体 + 5 份许可全文 |
| 2 | 无 CDN / 外链字体 / 外链脚本 | ✅ 运行期 0 个外部请求（`tools/verify-preview.mjs` 实测） |
| 3 | 字体自托管且 `font-display: swap` | ✅ |
| 4 | 许可全文随包 | ✅ `fonts/OFL-*.txt` |
| 5 | 未使用参考站资产 | ✅ |
| 6 | 未引入第三方 npm 依赖 | ✅ 零依赖 |
| 7 | 原创内容不冒充原作 | ✅ 差异表见 `DESIGN-SPEC.md` §12 与 `SOURCES.md` §1.1 |
| 8 | 接入目录须各自登记许可 | ⬜ 由各原作者执行（`MIGRATION-NOTES.md` §8） |

---

## 7. 变更记录

| 日期 | 变更 |
| --- | --- |
| 2026-10-21 | 初版：登记 5 款 OFL 字体及许可全文、代码与图形资产、参考站只读研究声明。 |
