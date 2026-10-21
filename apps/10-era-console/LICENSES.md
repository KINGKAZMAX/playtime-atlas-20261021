# LICENSES — 资产许可与权利声明

> 本文件说明《色块远征 CHROMA VOYAGE》1990s 家用机展厅中**每一类资产**的来源与许可状态，
> 以及本项目与参考作品之间的边界。

---

## 1. 一句话结论

**除 4 个开源字体家族（SIL OFL 1.1，见 §2 字体）外，本展厅交付物中的每一个字节都是本项目自己写的或自己生成的。**
没有复制任何商业游戏的 ROM、镜像、截帧、封面、说明书、音乐、品牌标识或商标图形；
也没有使用任何商业字体文件。

---

## 2. 资产清单

| 资产类别 | 具体文件 | 来源 | 许可状态 |
| --- | --- | --- | --- |
| 代码 | `src/**/*.js` | 本项目原创编写 | 本项目所有 |
| 样式 | `src/styles/main.css` | 本项目原创编写 | 本项目所有 |
| 设计系统样式 | `assets/ds/tokens.css`、`assets/ds/components.css` | **16-design-system 的逐字节副本**（sha256 已登记于 `tools/qa/token-check.mjs`）；16 声明为「本项目原创，随批交付，可自由使用与修改」 | 16-design-system 原创，随批使用 |
| 界面字体 | `assets/ds/fonts/*.woff2`（Space Grotesk / Inter / Space Mono / Noto Sans SC 子集） | **第三方开源字体，自托管**，SIL OFL 1.1 | SIL Open Font License 1.1（全文见 `assets/ds/fonts/OFL-*.txt`） |
| 页面结构 | `index.html` | 本项目原创编写 | 本项目所有 |
| 像素精灵 | `src/platform/spriteData.js` | **手工逐像素绘制**（字符矩阵 + 8 色调色板） | 本项目所有 |
| 点阵字体 | `src/ui/pixelFont.js` | **手工逐像素绘制**（5×7 字形，44 个字形） | 本项目所有 |
| 图标 | `src/ui/icons.js` | **运行时程序化绘制**（Canvas 2D 几何图形） | 本项目所有 |
| 主视觉插画 | `src/main.js` → `renderHeroArt()` | **运行时程序化绘制**（Canvas 2D 像素画） | 本项目所有 |
| 等距地形与展台 | `src/iso/terrain.js`、`src/iso/IsoScene.js` | **运行时程序化生成**（值噪声高度图 + Canvas 图形） | 本项目所有 |
| 音乐与音效 | `src/audio/AudioEngine.js` | **原创曲谱 + WebAudio 实时合成**（方波/三角波/噪声，无采样文件） | 本项目所有 |
| 科普展品文案 | `src/data/exhibits.js` | 本项目原创撰写，事实依据见 `SOURCES.md` | 文案原创；事实为公有事实 |
| 机型档案 | `src/data/exhibits.js` → `CONSOLES` | 本项目整理，事实依据见 `SOURCES.md` | 同上 |
| 第三方依赖 | `vite@5.4.11`（仅构建期） | npm / MIT | MIT，**不进入 dist 产物** |
| QA 工具依赖 | `playwright@1.64.1`（仅测试期） | npm / Apache-2.0 | Apache-2.0，**不进入 dist 产物**，且独立于交付包 |

### 字体

**自托管，无 CDN、无外链、无运行期外部请求。**
改版批起，外壳界面改用与 `16-design-system` 一致的字体族。
按 15 派单的「接入三步」，字体随 16 的 `fonts/` 目录**整体复制**到
`assets/ds/fonts/`（含 5 个 woff2 + 5 份 OFL 全文 + `fonts.css` + `FONT-MANIFEST.json`）：

| 族名 | 角色 | 文件（均在 `assets/ds/fonts/`） | 字节 | 许可 | 版权声明 | 来源 URL |
| --- | --- | --- | --- | --- | --- | --- |
| Space Grotesk | 展示（作品名 / 分区标题） | `space-grotesk-latin.woff2` | 34 788 | SIL OFL 1.1（`OFL-space-grotesk.txt`） | Copyright 2020 The Space Grotesk Project Authors | https://github.com/floriankarsten/space-grotesk |
| Inter | 正文（长文 / 说明 / 详情） | `inter-latin.woff2` | 132 684 | SIL OFL 1.1（`OFL-inter.txt`） | Copyright 2016 The Inter Project Authors | https://github.com/rsms/inter |
| Space Mono（400 / 700） | 等宽（元信息、编号、键位） | `space-mono-regular.woff2` / `space-mono-bold.woff2` | 14 884 / 15 000 | SIL OFL 1.1（`OFL-space-mono-regular.txt` / `OFL-space-mono-bold.txt`） | Copyright 2020 The Space Mono Project Authors | https://github.com/sharanda/space-mono |
| Noto Sans SC（**子集**） | CJK 兜底（渐进增强） | `noto-sans-sc-subset.woff2` | 197 600 | SIL OFL 1.1（`OFL-noto-sans-sc.txt`） | Copyright 2014–2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source' | https://github.com/notofonts/noto-cjk |

- 字体文件**逐字节取自** `16-design-system/fonts/`（**只读复制，未修改来源目录，未从外部重新下载**），
  本目录自托管一份，许可全文随包；sha256 一致性由 `tools/qa/token-check.mjs` 强制校验。
- 构建时由 Vite 以 base64 data URI 内联进 CSS（`build.assetsInlineLimit = 400KB`），
  因此产物仍是单文件 `dist/index.html`，运行期零外部请求。
  （新增 Noto 子集后单文件由 400 KB 增至约 672 KB，全部来自该子集的 base64 内联。）
- 机器可读清单：`assets/ds/fonts/FONT-MANIFEST.json`（含字节数、许可、来源、覆盖策略）。

**中文走系统字体栈**（0 字节、离线可用、覆盖全字形）；字体栈顺序取自 16 的
`assets/ds/tokens.css`（**覆盖完整的 CJK 族必须排在覆盖有限的子集之前**，否则同一段中文会混排两套字形）：

```
拉丁自托管字体 → "PingFang SC" / "Hiragino Sans GB" / "Microsoft YaHei" /
"Source Han Sans SC" → "Noto Sans SC"（本包随带的有限子集）→ 通用 sans-serif
```

> **Noto Sans SC 子集已随本作品分发**（15 派单「接入三步」第 ② 步要求整目录拷贝）。
> 该子集按 07-museum-art 自身用字生成，**字形覆盖有限**。本目录已实测其对本作品用字的覆盖率
> （方法与结论见 `QA.md` §4.3 与 `STATUS.md` §7 限制节）：
> **源文本集 596 / 971（61.4%）；实际渲染文本集 413 / 585（70.6%）**。
> 但因它在字体栈中排在全部覆盖完整的系统 CJK 族之后，
> **在装有中文字体的系统（macOS / Windows / 主流 Linux）上根本不会被启用**，
> 汉字一律由系统黑体绘制，缺字时逐字回退，不会出现缺字方框；
> 仅当系统完全没有 CJK 字体时该子集才会生效，此时未覆盖字形会回退到通用 sans-serif。

英文点阵副标 `CHROMA VOYAGE` 与游戏内计时数字使用本项目**自制**的 5×7 点阵字模
（`src/ui/pixelFont.js`），以 canvas 绘制，不加载任何字体文件。

### 图像

**零位图资源。** 仓库内不含 `.png` / `.jpg` / `.webp` / `.gif` 等图片素材
（`screenshots/` 下的文件为验收截图，非运行时资产）。
展厅内所有图形均为运行时用 Canvas 2D 生成的抽象示意图形，
刻意避免还原任何具体商业机型的外观造型。

### 音频

**零音频文件。** 全部音乐与音效由 WebAudio 实时合成：

- 音色：方波（25% / 50% 占空比的傅里叶级数脉冲波）、三角波、噪声
- 编曲：自写的 4 通道音序器（旋律 / 和声 / 贝斯 / 鼓组）
- 曲谱：`hall` / `dawn` / `ladder` / `forge` / `iso` 五首循环曲 + `clear` / `gameover` 两段过场，全部为本项目原创写作

---

## 3. 与参考作品的关系（差异说明）

### 3.1 我们参考了什么

参考的是**公开作品的机制与品质标准**，具体为：

| 机制维度 | 参考的公开范式 | 本项目的实现 |
| --- | --- | --- |
| 横版跳跃手感分层 | 经典的土狼时间 / 跳跃缓冲 / 可变跳跃高度 | 自写实现：`coyoteFrames 6`、`bufferFrames 7`、松键速度乘 `0.42` |
| 碰撞解算 | 瓦片地图 + 分轴 AABB 求解 | 自写实现：分轴解算、单向平台按"本帧起始脚底位置"判定承接、下落限速防穿透 |
| 收集物与关卡闸门 | "收集齐钥匙才能开门"的结构 | 自写实现：每关 3 枚色晶，集齐后跃迁塔开启 |
| 检查点 | 触碰即激活、死亡回复活点 | 自写实现 |
| 等距视角 | 2:1 等距投影 + 画家算法深度排序 | 自写实现：30×22 高度图、预烘焙瓦片贴图、按 `gx+gy` 递增绘制 |
| 策展思路 | "用当时的硬件约束解释当年的画面" | 自写展品文案，见 `SOURCES.md` |

### 3.2 我们重新设计了什么（全部为原创）

| 维度 | 本项目的原创设计 |
| --- | --- |
| 作品名 | 《色块远征》/ `CHROMA VOYAGE`；展厅节点名「1990s 家用机展厅 · 色块远征」 |
| 角色 | 主角**墨豆 INKBEAN**（方形勘探机器人）、敌人**棱刺 CUSP**、**巡块 WISP**、收集物**色晶 SHARD**、检查点**锚信标 ANCHOR** |
| 关卡 | 三关「黎明色阶 / 晶脉天梯 / 暮光熔炉」，含自动落脚板系统、移动色台、尖刺与色浆 |
| 场景 | 《等距测绘所》——一座抽象测绘庭院，9 处程序化绘制的展台 |
| 配色 | **画布内部**：`--mint #5ee0b8` / `--coral #ff7a6b` / `--sun #ffd166` / `--sky #6aa9ff` / `--violet #b48aff` + 每关独立主题色；**外壳**：改版后统一取自 16-design-system 的 `--ds-*` 令牌（暗色主题组，唯一强调色朱砂 `#E0684A`） |
| 字体 | 自制 5×7 点阵字模（画布内）；界面用自托管 OFL 字体 Space Grotesk / Inter / Space Mono |
| 布局 | 展厅首页 / 平台冒险 / 等距测绘所三视图，全部自绘 |
| 音乐 | 五首原创芯片曲 + 两段过场 |
| 文案 | 全部展品正文、界面文案、提示语由本项目撰写 |

### 3.3 明确不做的

- 不复制任何 ROM、镜像或受版权保护的资产
- 不使用商业游戏的截帧、封面、Logo、商标字体或品牌视觉
- 不声称本作品是任何既有作品的复刻、续作或官方版本
- 不复制参考作品的代码、关卡数据、关卡布局或音频资源

**「引用 ≠ 授权」**：本项目在展品中指向公开史料来源，是为了让读者能自行复核事实陈述；
这不构成对任何来源站点、厂商或作品作者的授权、背书或从属关系声明。

---

## 4. 第三方组件

| 组件 | 版本 | 用途 | 许可 | 是否进入 dist |
| --- | --- | --- | --- | --- |
| vite | 5.4.11 | 构建（devDependency） | MIT | 否 |
| playwright | 1.64.1 | 浏览器实机验收（仅 `tools/qa/`，独立 package.json） | Apache-2.0 | 否 |

`dist/` 产物仅包含本项目自己的 HTML / CSS / JS，不含任何第三方代码或资源文件。

---

## 5. 已知限制

1. 展品事实**主要依赖英文维基百科条目**（次级来源），单源条目占比高，
   未做多源互证；详见 `SOURCES.md` §5。
2. 「位数」等硬件参数在不同来源中存在差异，展厅已显式标注该口径限制。
3. 展品为**代表性选样**，不宣称覆盖该时代全部作品。
4. **中文字体依赖使用者操作系统**（拉丁字体已自托管）。不同系统上的中文字形与字距会有差异，
   这是"中文走系统栈"策略的必然结果（16-design-system §8 的 cjkStrategy 同款选择）。
5. 改版批起，界面新增 4 个自托管 OFL 字体家族（§2 字体，含 Noto Sans SC 中文子集）；
   这是本次交付中**唯一**的第三方二进制资产，许可与版权声明已随包登记。
6. **随包分发的 Noto Sans SC 子集只覆盖本作品用字的 61.4%（源文本集）/ 70.6%（实际渲染集）**，
   且其字重为 Thin（细体）。由于它排在全部覆盖完整的系统 CJK 族之后，
   实际访问中不会被启用；仅在完全无中文字体的系统上才会生效，届时未覆盖字形会回退到通用 sans-serif
   （不会缺字，但字重与字形与系统黑体不同）。详见 `QA.md` §4.3。
