# 许可与第三方组件 — 霓虹街廊 · 街机可玩展厅

## 1. 本作品代码

```
MIT License

Copyright (c) 2026 霓虹街廊 · 街机可玩展厅
  霓虹街廊 / NEON CORRIDOR
  制作：MiniMax Code（M3.1-Flash / max）

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

---

## 2. 第三方组件

| 组件 | 版本 | 许可 | 用途 | 是否进入产物 |
| --- | --- | --- | --- | --- |
| vite | 5.4.11 | MIT | 构建工具（开发期依赖） | 否 |
| vite 的传递依赖 | 见 `package-lock.json` | MIT / ISC / BSD / Apache-2.0 | 构建工具 | 否 |

构建产物 `dist/` 中**只有**本项目手写的 JavaScript、CSS 与 HTML，
以及一个手写的 SVG favicon；不含任何第三方运行时代码。

运行时依赖数量：**0**。页面不请求任何 CDN、在线 API、外部字体或图片。

---

## 3. 素材许可

| 素材 | 创作方式 | 许可 |
| --- | --- | --- |
| 角色与道具点阵（`src/core/sprites.js`） | 本项目手写字符点阵 | 随作品 MIT |
| 5×7 点阵字库（`src/core/bitmapFont.js`） | 本项目手写，逐字形设计 | 随作品 MIT |
| 芯片音乐与音效（`src/core/audio.js`） | WebAudio 实时合成，曲谱本项目原创 | 随作品 MIT |
| 背景与 UI 图形 | Canvas 程序化绘制 + CSS | 随作品 MIT |
| 霓虹街廊场景、编队、迷宫 | 程序化生成（seed 可复现） | 随作品 MIT |
| 画布内拉丁 HUD 字形 | 本项目手写点阵字库（**不**使用 webfont） | 随作品 MIT |
| 外壳层拉丁字体 | 自托管 OFL 字体，见 §3.1 | SIL OFL 1.1 |
| 外壳层中文字形 | 仅**引用**系统已安装字体，不随作品分发 | 系统自有 |

**明确声明**：本作品不包含任何 ROM、贴图、音视频文件、品牌标识或
商业游戏资源的复制品；对街机黄金时代商业作品的提及仅用于历史脉络叙述，
并已在 `SOURCES.md` 与展厅「街机纪年」面板中标注来源。

### 3.1 自托管字体（改版新增）

改版统一到「余晖设计系统」后，外壳层使用三个拉丁字体族。
全部为 **SIL Open Font License 1.1**，文件自托管、运行期零外部请求，
许可全文随包附于本目录 `fonts/`。

| 字体族 | 文件 | 字节 | 权重 | 许可 | 许可全文 | 版权声明 | 来源 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Space Grotesk | `src/styles/fonts/space-grotesk-latin.woff2` | 34 788 | 300–700 | SIL OFL 1.1 | `fonts/OFL-space-grotesk.txt` | Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk) | 上游 OFL 发布版 |
| Inter | `src/styles/fonts/inter-latin.woff2` | 132 684 | 100–900 | SIL OFL 1.1 | `fonts/OFL-inter.txt` | Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter) | 上游 OFL 发布版 |
| Space Mono | `src/styles/fonts/space-mono-regular.woff2` | 14 884 | 400 | SIL OFL 1.1 | `fonts/OFL-space-mono-regular.txt` | Copyright (c) 2020 The Space Mono Project Authors (https://github.com/floriankarsten/space-mono) | 上游 OFL 发布版 |
| Space Mono | `src/styles/fonts/space-mono-bold.woff2` | 15 000 | 700 | SIL OFL 1.1 | `fonts/OFL-space-mono-bold.txt` | 同上 | 上游 OFL 发布版 |
| Noto Sans SC（子集，渐进增强） | `src/styles/fonts/noto-sans-sc-subset.woff2` | 197 600 | 100–900 | SIL OFL 1.1 | `fonts/OFL-noto-sans-sc.txt` | Copyright 2014–2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source' | 子集由本批上游目录生成，覆盖有限 |

- 这批 OFL 字体取自本批 `16-design-system/fonts/`（随包附许可全文），
  按 `MIGRATION-NOTES.md` §8「需要时从 `16-design-system/fonts/` 取用，**许可全文一并复制**」执行。
- 字体仅覆盖拉丁与数字；**汉字优先走系统字体栈**（PingFang SC / 微软雅黑等，0 字节），
  Noto Sans SC 子集仅作渐进增强，超出覆盖范围时逐字回落系统字体。
- OFL 1.1 允许自由使用、修改与再分发，条件是保留许可与版权声明 —— 本目录已满足。
- **画布内不使用这些字体**：游戏 HUD 的拉丁字符仍由本项目手写的 5×7 点阵字库绘制，
  以保住复古观感（见 `RESTYLE-INVENTORY.md` §3）。

---

## 4. 引用到的第三方内容

展厅「街机纪年」面板以链接形式引用以下公开网页内容（仅文本摘述与链接，
不复制其素材、不镜像其页面）：

- The Strong National Museum of Play — 藏品页与博客（内容创作方授权公开引用）
- Wikipedia — `Golden age of video arcade games`（CC BY-SA 4.0）
- Wikipedia — `Arcade game`（CC BY-SA 4.0）

Wikipedia 文本若被直接引用，需遵守 CC BY-SA 4.0 的署名与相同方式共享要求；
本作品面板中的表述为**改写后的转述**，并逐条标注原始链接以指向权威来源。
详细对照见 `SOURCES.md`。
