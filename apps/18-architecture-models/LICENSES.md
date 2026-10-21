# 许可与资产清单 · Licences & Asset Inventory

## 1. 本作品

| 项 | 值 |
|---|---|
| 作品名 | 榫构华夏 · Timber Craft Lab |
| 任务 | `18-architecture-models` |
| 作者 | MiniMax Code（M3.1-Flash / max） |
| 许可 | MIT |
| 运行时外部资产 | **0 个**（无外部 CDN / 外链模型 / 外链字体 / 运行期 API） |
| 随包分发的字体 | **5 个 woff2**（全部 SIL OFL 1.1，见 §3.2） |

## 2. 依赖

| 包 | 版本 | 许可 | 是否进入 `dist/` |
|---|---|---|---|
| `three` | 0.169.0 | MIT | ✅ 是（`assets/three-*.js`，约 514 kB / gzip 132 kB） |
| `vite` | 5.4.11 | MIT | ❌ 否（仅开发期构建工具） |

MIT 许可证全文见 https://github.com/mrdoob/three.js/blob/dev/LICENSE 与
https://github.com/vitejs/vite/blob/main/LICENSE。

## 3. 资产清单（逐项声明来源）

### 3.1 3D 几何

| 资产 | 来源 | 授权 |
|---|---|---|
| 全部 6 件模型（斗栱 / 榫卯 / 抬梁 / 穿斗 / 石拱桥 / 土楼）的**几何** | 本目录 `src/models/*.js` + `src/core/geo.js` **程序化生成** | 本项目原创（MIT） |
| 木、石、土、瓦、水等材质 | `src/core/materials.js` 中的纯色 `MeshStandardMaterial` 参数 | 本项目原创 |
| 选中高亮材质、剖切面、受力箭头 | `src/core/viewer.js` 运行时代码生成 | 本项目原创 |

> **未下载、未导入、未转换任何外部 3D 模型文件**（无 `.glb` / `.gltf` / `.obj` / `.fbx` / `.stl` 等）。
> 仓库内不存在任何模型资产文件；唯一的 `.glb` 是用户点击「导出 GLB」时在浏览器内实时生成并下载的。

### 3.2 字体（自托管，全部 SIL Open Font License 1.1）

| 字体 | 文件 | 字节 | 许可原文 | 角色 |
|---|---|---|---|---|
| Space Grotesk | `fonts/space-grotesk-latin.woff2` | 34 788 | `fonts/OFL-space-grotesk.txt` | 展示体（拉丁） |
| Inter | `fonts/inter-latin.woff2` | 132 684 | `fonts/OFL-inter.txt` | 正文体（拉丁） |
| Space Mono | `fonts/space-mono-regular.woff2` | 14 884 | `fonts/OFL-space-mono-regular.txt` | 等宽体（常规） |
| Space Mono | `fonts/space-mono-bold.woff2` | 15 000 | `fonts/OFL-space-mono-bold.txt` | 等宽体（粗） |
| Noto Sans SC | `fonts/noto-sans-sc-subset.woff2` | 197 600 | `fonts/OFL-noto-sans-sc.txt` | 中文字形渐进增强（**子集**） |

- **全部自托管**：运行期零外部请求，不引用任何 CDN、不引用任何外链字体。
  构建产物中的字体由 Vite 重写为 `./assets/*.woff2` 相对路径，适配 GitHub Pages 任意二级子路径。
- **来源**：与 `16-design-system/fonts/` 同一批 OFL 字体（仅**复制**字体二进制，未修改来源目录）；
  字体族名与 `16-design-system/fonts/FONT-MANIFEST.json` 一致
  （依据 `15-supervisor/RESTYLE-SPEC.md` §3、`16-design-system/DESIGN-SPEC.md` §2.4）。
- **CJK 策略与字体栈顺序（硬性条款）**：中文优先走系统字体栈（0 字节、始终可用、覆盖全字形）；
  `Noto Sans SC` **子集**只作渐进增强，且**必须排在系统 CJK 栈之后** ——
  覆盖完整的族在前，子集在后。反之会让同一段文字混入两套字形与两套基线（混排基线错位）。
  依据 `16-design-system/DESIGN-SPEC.md` §2.5 与 `MIGRATION-NOTES.md` §2.0.1 / §5.3。
  本目录的实际栈见 `src/ui/tokens.css` 的 `--ds-font-display` / `--ds-font-text`。
- **子集覆盖有限**：超出覆盖的汉字由浏览器自动回退系统黑体（PingFang SC / Microsoft YaHei），
  **不会缺字**，仅字形略有差异。已列入 `STATUS.md` 的限制节。
- 参考站 olek.si 使用的 `display.woff2` / `text.woff2` / `inter-*.woff2` **未被下载、未被打包、未被引用**。
  详见 `docs/REFERENCE-AUDIT.md` 第 2 节。

### 3.3 图像 / 纹理 / 贴图

| 资产 | 来源 | 授权 |
|---|---|---|
| 贴图 | **无**。所有材质为纯色 + 物理光照，无位图贴图。 | — |
| 界面图标 | **无图片文件**。favicon 为 `index.html` 中内联的 SVG data URI；所有界面图标由 CSS 绘制。 | 本项目原创 |
| `docs/reference/oleksi-0*.png` | olek.si 页面截图，**仅作内部设计取证** | 参考站作者所有；**不随 `dist/` 发布**，不用于任何成品界面 |

### 3.4 音频

无。本项目不使用任何声音。

### 3.5 数据

| 资产 | 来源 | 授权 |
|---|---|---|
| 构件名称、拼音、作用说明 | 依据 `SOURCES.md` A 节所列公开资料**重新撰写**的中文/英文解释 | 事实性描述，表述为原创 |
| 受力箭头的定性说明 | 原创撰写 | 本项目原创 |

### 3.6 文本

- 页面文案（封面陈述、提示语、标签）为本项目**原创撰写**。
- 未复制参考站或任何来源的句子。
- 引用的史料名称（李春、《营造法式》、赵州桥 28 道券等）为**事实性名称**，非受版权保护的表达。

## 4. 第三方商标

本项目为教学与科普用途，**未使用**任何企业、机构或品牌的商标、标识或品牌色。
文中提及的「故宫」「赵州桥」「福建土楼」等仅为地名与历史建筑名称的事实性引用。

## 5. 免责与使用边界

- 所有模型均为**教学示意，非施工或工程模型**；界面内以常驻徽章标注。
- 受力箭头为**定性说明，非工程计算结果**；不得用于设计、施工或安全评估。
- 真实建筑的测绘数据、比例与构造做法可能与本模型不一致，具体工程请以实物测绘与专业文献为准。
- 采样的历史建筑实例并不代表全部同类建筑，本项目不声称穷尽任何一类建筑的全部实例。

## 6. MIT 许可证

```
MIT License

Copyright (c) 2026 MiniMax Code

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
