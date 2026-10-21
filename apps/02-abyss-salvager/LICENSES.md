# LICENSES — 资产来源与许可

最后更新：2026-10-21 · 对应作品版本 `1.1.0`
作品：《渊甲拾遗者 / ABYSS-CARAPACE SALVAGER》（任务 02）

本文件逐项说明本项目**每一个**资产类别的来源、许可与改动。
原则：**除明确列出的开源依赖外，全部为本项目原创**；
不使用任何未授权 ROM、商业游戏素材、商标、角色形象或品牌视觉。

---

## 0. 总结

| 类别 | 来源 | 许可 | 数量 |
| --- | --- | --- | --- |
| 3D 几何 | 本项目程序化生成（`src/model/geometry.js`、`src/model/abyssal.js`） | 本批原创 | 104,468 三角面 / 548 网格 |
| 贴图 | 本项目程序化像素合成（`src/model/textures.js`） | 本批原创 | 5 张（甲壳鳞片 / 拉丝合金 / 玄武岩 / 海雪 / 测绘网格） |
| 2D 技术面板 | 本项目 Canvas 矢量绘制（`src/ui/panels2d.js`） | 本批原创 | 3 幅（磨削冠剖面 / 纵剖带 / 等深线测区图） |
| 界面与图标 | 本项目手写 CSS + 内联 SVG（favicon） | 本批原创 | 1 套 |
| 字体 | **自托管 OFL 字体**（见 §2） | SIL OFL 1.1 | 4 个 woff2 + 4 份许可原文 |
| 导出模型 | 由本项目几何经 GLTFExporter 导出（`public/models/*.glb`） | 本批原创 | 1 份（单一真源，见 §3） |
| 第三方素材 | — | **无** | 0 |
| 开源依赖 | `three`（MIT）、`vite`（MIT） | MIT | 2 个包 |

---

## 1. 运行时第三方依赖

| 包 | 版本 | 许可 | 用途 |
| --- | --- | --- | --- |
| `three` | 0.180.0 | MIT | 渲染、几何、材质、后期处理、GLTF 导入导出 |
| `vite` | 7.3.7 | MIT | 开发服务器与静态构建 |

依赖随 `npm install` 从 npm 公共 registry 拉取，**不打包进产物**；
构建产物 `dist/` 中只包含本项目自己的代码、程序化资产与自托管字体。

> `three/examples/jsm/loaders/GLTFLoader.js` 与 `three/examples/jsm/exporters/GLTFExporter.js`
> 同属 `three` 包，MIT 许可。

---

## 2. 字体（**v1.1.0 起改为自托管**）

视觉改版（对齐 `16-design-system` 的 `typography.family`）引入三套拉丁字体，
**随包分发**（`src/styles/fonts/`），构建后由 Vite 打包为带 hash 的 woff2：

| 字体文件 | 族名 | 字重 | 用途 | 许可 |
| --- | --- | --- | --- | --- |
| `space-grotesk-latin.woff2` | Space Grotesk | 可变 300–700 | 标题（显示体） | SIL OFL 1.1 |
| `inter-latin.woff2` | Inter | 可变 100–900 | 正文 | SIL OFL 1.1 |
| `space-mono-regular.woff2` | Space Mono | 400 | 仪表 / 编号 / 拉丁标签 | SIL OFL 1.1 |
| `space-mono-bold.woff2` | Space Mono | 700 | 仪表数值加粗 | SIL OFL 1.1 |

对应的许可原文**随包分发**（OFL 要求随字体一同提供）：

| 许可原文文件 | 适用字体 |
| --- | --- |
| `OFL-space-grotesk.txt` | Space Grotesk |
| `OFL-inter.txt` | Inter |
| `OFL-space-mono-regular.txt` | Space Mono Regular |
| `OFL-space-mono-bold.txt` | Space Mono Bold |

- 字体文件来源：`16-design-system/fonts/`，**逐份 sha256 校验一致**后复制入本项目；
  OFL 1.1 允许自由使用、修改与再分发（含随包分发），仅要求保留许可与版权声明。
- **不随包** `noto-sans-sc-subset.woff2`：16 的 `FONT-MANIFEST.json` 标注该子集是
  07-museum-art 按其自身用字生成的**部分覆盖**子集，前置会导致本作用到而子集未覆盖的
  汉字回退系统黑体，形成同一段落内两套字形混排。汉字因此走系统字体栈
  （`PingFang SC` / `Hiragino Sans GB` / `Microsoft YaHei` / `Source Han Sans SC`），
  符合 `FONT-MANIFEST.policy.cjkStrategy`「系统字体栈优先（0 字节、始终可用）」。
  族名与 16 的清单保持一致。理由另见 `src/styles/tokens.css` §偏离说明 ①。
- 运行期**仍为零外部请求**：字体全部由 Vite 打包为本地资源，无 CDN、无 Google Fonts、无外链。
- 汉字所用的系统字体不随包分发，使用者机器自带，不构成再分发义务。

---

## 3. 随包模型文件（`public/models/`）

| 文件 | 角色 | 字节 | 说明 |
| --- | --- | --- | --- |
| `abyss-salvager-ac-vii.glb` | **canonical（唯一真源）** | 9,136,112 | 《渊甲拾遗者》默认参数（18 驱动体节）导出的完整模型；含 `asset.extras.disclaimer_*` 教学示意声明元数据 |
| `assets.manifest.json` | 索引 | — | 记录该文件的 sha256、GLB 头字段与角色说明（由 `npm run sync:model` 生成） |

### 3.1 关于「单一真源」布局（重要）

- 随包模型**只有一份**，不存在 legacy-alias 之类的兼容副本，也不再保留
  旧名 `mech-sandworm-1312m.glb`（该文件名属于早期复刻稿，已随原创改编废弃）。
- 文件**位于项目内** `public/models/`，而不是项目根的 `models/`：
  - `public/` 会被 Vite **原样复制**进构建产物，因此 `dist/models/abyss-salvager-ac-vii.glb`
    与线上 `works/02-abyss-salvager/models/abyss-salvager-ac-vii.glb` **路径完全一致**；
  - 项目根 `models/` 对 Vite 不可见，任何人单独 clone 本项目并自行构建时都会**丢失模型文件**。
- 迁移时已逐字节校验（sha256 一致：`fc90a8525536a31e747e4fc715ff33d6bbf0a40e2d0e51a67dfb5273c8c99a69`），
  采用**移动**而非复制，避免出现同名双份导致的路径歧义。
- 运行时导出（顶栏「导出 GLB」）与随包 GLB **并存**：前者导出当前参数快照，后者提供下载与
  「载入场景」入口，二者不冲突。
- 本作品**不是**「机械沙虫 1312M」：作品名、模型形态、体长（760 m）、体节数（18）、
  配色、字体、版式与术语文案均为本批原创，与该沙虫案例无一致之处。
- 完整的原创改编差异对照见 [`CHANGELOG.md`](./CHANGELOG.md)。

### 3.2 模型内容的来源

- 几何 100% 由本项目代码生成，**不含**任何外部模型、第三方 glTF/FBX/OBJ 或商业游戏资源。
- 贴图 100% 由本项目代码逐像素合成，**不含**任何外部图片、HDRI 或扫描素材。
- 因此随包 GLB **不引入任何第三方授权义务**。

---

## 4. 参考案例与「不主张原创」声明

- 本作品的**交互机制**参考自一个公开的 MiniMax M3.1 Flash 社区 3D 案例
  （<https://x.com/AYi_AInotes/status/2104826052979597409>，作者 AYi / @AYi_AInotes，2026-09-29）。
- 该案例的归属、互动数字与观测时间见 [`SOURCE.md`](./SOURCE.md)。
- 本项目**未复制**该案例的任何代码、模型、贴图或素材（该案例为单文件 HTML，作者未公开源码仓库）。
- 本项目**未使用**《沙丘》电影的任何品牌视觉、角色造型或商业素材。
- 本项目**不主张**本作品为「全网第一」，也不主张优于任何参考作品。

---

## 5. 未使用清单（逐项确认）

| 类别 | 是否使用 |
| --- | --- |
| 游戏 ROM / 卡带转储 | **否** |
| 商业游戏原始美术资源（贴图 / 模型 / 音频） | **否** |
| 第三方 glTF / FBX / OBJ 模型 | **否** |
| 外部 HDRI / 环境贴图 | **否**（环境由 `RoomEnvironment` 在运行时程序化生成，属 three 库自带程序化场景，非外部素材） |
| 外部照片 / 扫描图 | **否** |
| 商标 / 角色形象 / 品牌视觉 | **否** |
| 外部字体文件 | **否**（v1.1.0 起自托管 3 套 OFL 拉丁字体，随包分发并附许可原文；汉字走系统栈，无外链请求） |
| 运行期 CDN / API / 遥测 | **否** |

---

## 6. 交付许可

本项目的源码与全部程序化资产随本批交付物一并提供，供 `14-publish` 统一发布。
发布页须保留 [`SOURCE.md`](./SOURCE.md) 与 [`CHANGELOG.md`](./CHANGELOG.md) 中的来源与差异说明链接。
