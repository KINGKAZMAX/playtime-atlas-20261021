# 素材与许可 · LICENSES

> 本文件记录「回响电玩馆 / PLAYTIME ATLAS」主站所使用的全部素材及其许可。
> 原则：**只用自生成资产与明确许可的开源资产**；不使用任何未授权 ROM、
> 商业游戏美术、品牌标识或产品外形的复刻。

---

## 1. 本项目原创生成（随本仓库分发）

| 资产 | 生成方式 | 许可 |
|---|---|---|
| 馆徽 `art/mark.svg` | `scripts/generate-art.mjs` 程序化绘制 | 本项目自有，随本项目分发 |
| 年代海报 `art/era-eXX-poster.svg`（10） | 同上 | 同上 |
| 年代底纹 `art/era-eXX-backdrop.svg`（10） | 同上 | 同上 |
| 载体轮廓 `art/form-*.svg`（15） | 同上 | 同上 |
| 展签图形（每件展品一张） | `src/modules/silhouette.js` 运行时以展品 id 为种子程序化绘制 | 同上 |
| 3D 展厅硬件体块 | `src/modules/hall3d.js` 用基础几何体现场拼装 | 同上 |
| 正文、界面文案、年代叙述 | 本项目原创撰写 | 同上 |

这些资产**不含任何第三方商标、logo、角色形象或商业游戏美术**。
3D 展厅中的体块是原创简化造型，与真实产品的外形、比例与细节均不相同，
其作用是表达「一台那个年代的机器」的体量感，而不是复刻某一款具体产品。

## 2. 自托管开源字体（来自 07-museum-art）

| 字体 | 用途 | 文件 | 许可 | 许可文本 |
|---|---|---|---|---|
| Inter | 界面正文 | `inter-latin.woff2` | SIL Open Font License 1.1 | `OFL-inter.txt` |
| Noto Sans SC | 中文 | `noto-sans-sc-subset.woff2` | SIL Open Font License 1.1 | `OFL-noto-sans-sc.txt` |
| Space Grotesk | 标题 | `space-grotesk-latin.woff2` | SIL Open Font License 1.1 | `OFL-space-grotesk.txt` |
| Space Mono | 等宽（编号、年代、代码） | `space-mono-regular.woff2` / `space-mono-bold.woff2` | SIL Open Font License 1.1 | `OFL-space-mono-regular.txt` / `OFL-space-mono-bold.txt` |

**与设计系统的关系**：上述 5 个 woff2 与 `16-design-system/fonts/FONT-MANIFEST.json`
登记的文件**逐字节同源**（已核验），字体族名与本目录 `src/assets/fonts.css` 的 5 条
`@font-face`、以及 `src/styles/tokens.css` 的 `--ds-font-display` / `--ds-font-text` /
`--ds-font-mono` 三者完全一致。`16-design-system` 的字体文件与清单为**只读引用**，
本目录不复制其文件，只在自己的 `src/assets/fonts/fonts.css` 落地 `@font-face` 规则。

**发布体积**：只发布 woff2（5 个，合计约 0.5 MB）。上游同源包里的 4 个 `.ttf`
（合计约 824 KB）在本目录**零引用**，已在 `scripts/sync-exhibits.mjs` 的
`ART_SKIP_FILES` 中排除，不随产物上线。

字体文件由 07-museum-art 提供并随本项目一起本地托管，运行时不向任何外部域名发起请求。
若 07 美术包缺席，主站自动回落到系统字体栈（见 `src/styles/tokens.css`），功能不受影响。

## 2.1 设计系统令牌（来自 16-design-system，只读引用）

| 资产 | 用途 | 许可 / 状态 |
|---|---|---|
| `design-tokens.json` / `src/tokens.css` | 取值来源（色彩/字体/圆角/间距/动效） | **只读引用**，本目录不复制文件；本目录令牌层取值已由 `scripts/check-tokens.mjs`（静态）与 `scripts/check-tokens-runtime.mjs`（运行期）逐名核验，与 DS **完全一致**（130 个令牌 0 不一致） |
| `fonts/FONT-MANIFEST.json` | 字体族名与文件对应关系 | 只读引用 |

> 07-museum-art 的 `design-tokens.json` **不再注入 CSS 变量**（`src/modules/theme.js` 改为只探测不注入）：该文件仍带旧色板（信号橙 `#F0601F`），运行期注入会因「同名变量后加载者胜」把本目录的 `--ds-*` 覆盖回旧色板。
> 本目录全站色板只由 `src/styles/tokens.css` 的 `--ds-*` 令牌层决定。

## 3. 第三方代码依赖

| 依赖 | 版本 | 许可 | 用途 |
|---|---|---|---|
| vite | 5.4.11 | MIT | 构建工具（仅开发期） |
| three | 0.169.0 | MIT | 可选 3D 展厅 |

运行时产物为打包后的静态文件，不含上述工具链。

## 4. 展品条目中的名称与指涉

展品条目中出现的作品名、厂商名、机型名仅用于**史实指涉**（说明某件展品是什么），
相关商标与著作权归各自权利人所有。本项目：

- 不分发任何商业游戏 ROM、卡带镜像或盗版素材；
- 不使用任何商业游戏的美术、音频、代码；
- 不复刻任何品牌 logo、字体商标或包装；
- 不在展签图形中暗示与真实产品存在官方关系。

展品叙述为原创改写，与来源原文相互独立；每件展品都可点开来源链接自行核对。

## 5. 外部链接

展品详情中的「来源与核对」指向公开百科条目等外部站点。这些链接**仅供核对**，
本项目不对其内容拥有控制权，也不对其可用性作保证。
主站本身不加载任何外部脚本、样式、字体或图片。

## 6. 数据

| 数据 | 来源 | 许可 / 状态 |
|---|---|---|
| 策展目录 | 05-museum-research 交付的 `catalog.json` | 任务内协作产物，随本批作品一并分发 |
| 本地初版策展集 | `src/data/catalog.local.js`（本项目原创撰写） | 本项目自有 |
| 设计令牌 | 07-museum-art 的 `design-tokens.json` | 任务内协作产物 |
| 年代包体 | 08–12 各任务的构建产物 | 任务内协作产物，原始权利归各任务作者 |

具体条目级来源见 `SOURCES.md`。
