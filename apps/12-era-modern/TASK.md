# TASK 12 —《折光纪 · 当代可玩展厅》PRISM ERA

> 母馆：**回响电玩馆 / PLAYTIME ATLAS**（由 06-museum-core 建设）本任务是该馆的 **modern（2015–2026）时代展厅**。
> 本目录产出一个**独立可静态部署**的子展厅，06 可整包嵌入，14 可整包发布。

---

## 0. 定位与原创声明

本展厅**参考公开作品的游戏机制与品质标准**（节奏游戏的判定手感、等距视角解谜的空间叙事、VR 展项的观景交互），
但**所有作品名、文案、音乐、视觉、布局、模型形态、关卡设计均为本任务原创**，不声称原创任何参考作品，
不使用任何未授权 ROM、商业游戏资源或品牌视觉。

| 项 | 本任务产出 | 参考的公开机制（非素材） |
| --- | --- | --- |
| 节奏玩法 | 《脉冲走廊 / PULSE CORRIDOR》：四轨下落式 + 反应训练 + 混合模式 | 现代节奏游戏的「判定窗口 / 连击 / 准度」通行范式 |
| 空间解谜 | 《折光阁 / PRISM ATRIUM》：光路折射 + 等距 3D | 等距视角解谜的「视觉不可能空间」表达手法 |
| 沉浸展项 | 《光环台 / HALO DECK》：桌面端环视观景台 | VR 展陈的「热点展签」交互模型 |
| 原创声明 | 不复刻任何具体作品 | — |

---

## 1. 交付目标

| 项目 | 要求 |
| --- | --- |
| 位置 | `/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/12-era-modern` |
| 技术栈 | Vite 5 + Three.js 0.169（npm 本地安装）+ 原生 Canvas2D + WebAudio，**零 CDN / 零在线 API / 零外部字体请求** |
| 网络 | 运行期完全离线；史料链接为外链，仅在用户点击时打开新标签 |
| 端口 | 开发/预览 `127.0.0.1:4332`（strictPort） |
| 发布 | **本任务不发布**到公网；仅交付可静态构建的产物包给 14-publish |
| 路径兼容 | `base: './'` + 哈希路由 → 可直接部署在 GitHub Pages **子路径**（如 `/repo/prism-era/`） |
| 代码来源 | 100% 本会话手写；美术 100% 程序化生成（Canvas / Three.js 几何 + 着色器） |

---

## 2. 目录与文件约定

```
12-era-modern/
├── TASK.md            # 本文件
├── STATUS.md          # 阶段状态 / 变更日志
├── README.md          # 项目说明、运行方式、操作手册、限制声明
├── RESTYLE-INVENTORY.md  # 第二轮「待替换清单」+ §9 执行结果对齐说明 + §10 第三轮对齐说明
├── SOURCES.md         # 史料来源台账（逐条可点击 URL + 核验时间）
├── LICENSES.md        # 资产与许可（字体、程序化美术、参考边界）
├── QA.md              # 验收记录（浏览器实测结果）
├── manifest.json      # id,title,description,entry,buildCommand,outputDir,status
├── package.json / vite.config.js / index.html
├── public/assets/ds/  # 16 号设计系统原样副本（tokens.css / components.css / fonts/）
├── src/               # 源码
│   ├── core/i18n/     # zh/en 文案骨架（zh.js / en.js / index.js，162 键）
│   ├── core/debug-state.js  # 唯一 __ 前缀可观测状态 window.__eraGame
│   ├── core/tokens.js # readToken() / readTokenRgba()，供 Canvas / Three.js 读 CSS 令牌
│   └── styles/        # tokens.css（语义别名层）/ cjk.css（中文排版，最后导入）/ 各页样式
├── scripts/start.sh   # 一键启动
├── scripts/check-i18n.mjs  # 文案骨架对等性自检
├── scripts/test-levels.mjs # 关卡可解性自检
├── scripts/verify-ds.mjs   # 设计系统机械验收（14 组检查，零第三方依赖）
├── evidence/          # 设计系统验收机读结果与截图
├── screenshots/       # 实机截图
├── handoff/           # 给 06（嵌入）与 14（发布）的接入说明 + 切片数据
└── dist/              # 已构建静态产物（供 06/14 直接复制）
```

---

## 3. 功能需求清单

### 3.1 展厅主站（落地页）
- 原创视觉识别：夜蓝墨底（`#070B1E`）+ 棱镜三色（青 `#4FE3D0` / 品红 `#FF5FA2` / 琥珀 `#FFC46B`）+ 纸白 `#F2F0E9`；玻璃拟态面板 + 1px 棱彩描边。
- 自托管字体：Latin 用 `@fontsource-variable/space-grotesk` + `@fontsource-variable/jetbrains-mono`（OFL，本地打包）；中文使用系统 CJK 栈（不下载、不外链）。
- **三件可玩展项**入口卡（各带难度、操作说明、免责说明）。
- **2010–2026 现代游戏史时间轴**（≥16 条，每条含年份 / 作品 / 平台 / 入馆理由 / 来源链接）。
- 「现代时代四个关键词」导览段：触屏化 / 独立化 / 服务化 / 沉浸化。
- 设置面板：静音、视觉节拍模式、减少动效、高对比、判定校准、清除存档。
- **无障碍 2D 目录**：全部展项 + 时间轴条目的纯文本可读列表；跳转链接、可见焦点、`aria` 标注、键盘可达。

### 3.2 《脉冲走廊 / PULSE CORRIDOR》节奏反应小游戏
- **三件展项**：
  1. **谱面模式 CHART**：三首原创曲目（程序化合成，曲谱驱动合成，视听天然对齐）
     - 启明 / FIRST LIGHT（100 BPM，入门）
     - 潮汐 / TIDE GLASS（124 BPM，进阶）
     - 棱镜风暴 / PRISM STORM（150 BPM，挑战）
  2. **反应训练 REACTION DRILL**：纯视觉提示 → 测量反应时（均值 / 中位数 / 最佳）
  3. **混合模式 HYBRID**：谱面中嵌入「应答靶」与「禁触靶」两类反应事件
- **判定**：Perfect / Great / Good / Miss 四级；连击、准度、评级 S–D；校准偏移 ±200 ms。
- **操作**：`D F J K` / `← ↓ ↑ →` / 触屏点按四轨；`Esc` 暂停、`R` 重开、`M` 静音。
- **音频**：WebAudio **纯程序化合成**（无音频文件），**必须用户交互后 `resume()`**；静音开关。
- **静音视觉替代（硬性）**：
  - 「视觉节拍」模式**完全不产生声音**，节拍由**收缩节拍环 + 轨道行亮度脉冲 + 顶部拍点标尺 + 音符呼吸缩放**表达；
  - 游戏时钟基于 `performance.now()`，与音频无关，**视觉模式判定精度与音频模式一致**；
  - 轨道使用**形状标识**（◆ ● ▲ ■）区分，兼容色觉障碍；提供高对比模式与「减少动效」（以平滑缩放替代闪烁）。
- **成绩持久化**：每曲最佳分 / 最佳连击 / 最佳准度 / 反应时记录。

### 3.3 《折光阁 / PRISM ATRIUM》空间解谜试玩
- **Three.js 等距 3D**，原创「光路折射」机制：
  - `emitter` 光源塔（定向发射）、`mirror` 反光板（4 向可旋转）、`splitter` 分光镜（一进二出）、
    `dispersion` 色散棱镜（白光 → 青 + 品红）、`receiver` 接收环（**颜色必须匹配**）、`gate` 光栅门、
    `afterglow` 余辉压板（踩下后 8 秒保持开启）、`platform` 移动浮台（往复载行）、`mote` 拾取光点。
- **≥3 个可完成关卡**（实际做 4 关）：
  1. 回廊 CORRIDOR（教学：移动 + 旋转）
  2. 分流 FORK（分光 + 色散 + 双接收环 + 光栅门）
  3. 时序 CADENCE（移动浮台 + 余辉压板 + 计时压力）
  4. 合奏 CHORUS（挑战：三光源三接收环 + 光点收集）
- **进度保存**（localStorage）：已通关关卡、当前关卡、每关最佳用时与光点评级。
- **撤销 / 提示 / 重置**：撤销栈回退棋盘状态；提示指出待旋转元件方向（基于作者解法）；重置还原初始状态。
- **控制**：`WASD` / 方向键移动、`E` 旋转面向的元件、鼠标点击元件直接旋转、`Tab` 循环选中、移动端 D-Pad。
- 实时光路演算、颜色匹配反馈、失败原因提示（色不符 / 光路未达 / 门未开）。

### 3.4 《光环台 / HALO DECK》沉浸展项
- Three.js 程序化全景（夜色棱镜庭 + 镜面地坪 + 渐变天穹），鼠标拖拽环视、滚轮变焦、`WASD` 沿导轨移动。
- 4–6 个 **3D 热点展签**（HTML 叠加层投影定位），含展品说明与来源链接。
- **诚实声明（硬性）**：
  - 页面显著位置写明「本展项为**桌面端交互演示**，使用鼠标/键盘模拟头部转动，**未接入 WebXR，未支持 VR 头显**」；
  - 提供「检测本机 WebXR 沉浸式 VR 支持」按钮，调用 `navigator.xr.isSessionSupported('immersive-vr')` 真实回报结果；
  - 附 W3C WebXR 规范链接，说明真正设备支持所需条件；
  - **绝不**出现「支持 VR / 已适配头显 / 沉浸式体验」等虚假表述。

---

## 4. 史料与来源要求

- `SOURCES.md`：逐条记录时间轴条目的**可点击 URL + 官方/一手优先** + 访问核验时间（2026-10-21）。
- 所有引用条目均需**实际抓取核验可达**（本任务已用 HTTP HEAD 核验 200）。
- 明确声明：时间轴为**代表性选样，非编年全集**。

---

## 5. 资产与许可

- 字体：Space Grotesk Variable / JetBrains Mono Variable（SIL OFL 1.1，npm 本地打包）。
- 美术：**全部程序化生成**（Canvas 2D 纹理、Three.js 几何体与着色器），不含任何第三方美术资源。
- 音乐：**全部程序化合成**（WebAudio），无音频文件。
- 不使用任何 ROM、贴图、商用音频、字体位图、品牌标识。

---

## 6. 验收标准（自测，对应 13-qa-curation）

1. `npm install && npm run dev` → `http://127.0.0.1:4332` 可打开展厅落地页。
2. `npm run build` 产出 `dist/`，用 `npm run preview`（4332）可玩；产物内**无外链 CDN 引用**。
3. 落地页 → 三个展项均可进入、可返回、URL 为哈希路由。
4. 节奏游戏：可开始 / 暂停 / 恢复 / 重开；判定与连击实时更新；结算页给出评级。
5. 节奏游戏：**关闭声音并开启「视觉节拍」后仍可完整通关**（判定时间轴与音频模式一致）。
6. 节奏游戏：WebAudio 在**用户点击前不创建/不发声**。
7. 解谜：4 关全部可通关；每关可通过「撤销 / 提示 / 重置」按钮操作；刷新后进度仍在。
8. 解谜：光路颜色不匹配的接收环给出明确提示。
9. 光环台：可拖拽环视、热点展签可点开、页面显著位置含「桌面交互演示 / 不支持 VR 头显」声明与 WebXR 检测按钮。
10. 移动端（375×667 视口）：落地页与节奏游戏可玩；触屏点按有效。
11. 控制台无未捕获错误；无 404 资源；`dist/` 在**子路径**下可正常打开（用 `python3 -m http.server` 于 `dist/` 的上级目录模拟子路径验证）。
12. `manifest.json` 字段完整；`README.md` / `SOURCES.md` / `LICENSES.md` / `QA.md` 齐备。

---

## 7. 已知取舍

- 节奏游戏的「曲目」为**程序化生成**（谱面即乐谱），非录音；因此每首曲子结构简单但视听精确对齐，符合「程序化音乐」展厅定位。
- 解谜的「作者解法」用于提示系统；若玩家找到其他解法，提示可能指向非唯一解 —— 已在 UI 注明「提示基于推荐解法」。
- 光环台**不是** WebXR 应用；不实现立体渲染与手柄追踪，如实标注为桌面演示。
- 本展厅视觉体系与 07-museum-art 的母馆视觉保持协调但**独立命名与配色**，避免与主站混淆。

---

## 8. 第二轮派单（15-supervisor · 改版）执行记录

> 本节为第二轮追加，**不修改上面第 0–7 节的第一轮派单原文**（保留为历史记录）。
> 派单来源：`15-supervisor/RESTYLE-SPEC.md`。

### 8.1 派单要求与完成情况

| # | 派单要求 | 完成情况 |
| --- | --- | --- |
| 1 | 清点本目录字体 / 色值 / 圆角 / 间距使用点，产出「待替换清单」（文件 + 选择器 + 旧值 → 16 token 候选路径） | ✅ `RESTYLE-INVENTORY.md`（22 KB）：字体 34 处 / 色值 96 处 / 圆角 34 处 / 间距 128 处 / 阴影 7 处 / 过渡 12 处 |
| 2 | 准备 zh/en 文案 key 骨架（**先不切语言**） | ✅ `src/core/i18n/`（zh.js / en.js / index.js / README.md），**162 键**，`scripts/check-i18n.mjs` 校验 162/162 通过。界面默认中文，**未启用切换入口** |
| 3 | 修完 13-qa-curation 针对本目录的 4 条问题（QA-036/037/038/039） | ✅ 全部修复并留证（见 `QA.md` §1.5.1）。顺带修掉 2 个真实功能缺陷（工具栏按钮未绑事件、遮罩关闭焦点丢失） |
| 4 | 读 16 的 `DESIGN-SPEC.md` + `design-tokens.json` + `preview.html` + `MIGRATION-NOTES.md`，按清单逐项替换 token，**不推倒重写页面结构** | ✅ 落地 `--ds-*` 全量令牌 + 语义别名层；5 个样式文件重写为设计系统语言；**DOM 结构未推倒重建**，既有选择器与 QA 契约全部保留 |
| 5 | 统一导航 / 封面 / 详情 / 按钮 / 过渡 | ✅ 五类统一（只换视觉绑定） |
| 6 | 新增字体自托管并登记 `LICENSES.md` | ✅ 4 款 woff2 + 4 份 OFL 全文；`@fontsource-variable/*` 已卸载；`LICENSES.md` 已重写 |
| 7 | 落实 `prefers-reduced-motion` 降级且不丢失可玩信息 | ✅ 实测：reduced-motion 下 58 项抽样最大动效 0.001s，拍点标尺与下行光带仍在 |
| 8 | 玩法画面优先：节奏提示清晰 / 解谜线索可辨 / 控件可点 | ✅ 三项均通过（见 `QA.md` §1.5.3 与下表） |
| 9 | 保持既定原创身份（作品名 / 文案 / 音乐 / 关卡 / 史料不动），只改视觉语言 | ✅ 全部保持；仅视觉层与页面层装饰色调整 |
| 10 | 产物可部署到 Pages **子路径** | ✅ `base: './'`；产物 CSS 内字体为 `url(./<name>-<hash>.woff2)`，**无绝对根路径** |

### 8.2 玩法可读性复验结论

| 项 | 结论 | 实测值 |
| --- | --- | --- |
| 节奏提示仍清晰 | ✅ 通过 | 拍点标尺 + 下行光带 + 收缩节拍环三者在新色板下仍可区分；reduced-motion 下最大动效 0.001s 而提示仍在 |
| 解谜线索仍可辨认 | ✅ 通过 | 折光阁 HUD 图例色样实测仍为 `rgb(79,227,208) / rgb(255,95,162) / rgb(157,123,255)`，与改版前逐位一致 |
| 控件仍可点 | ✅ 通过 | HUD 按钮命中区 51×32 ~ 76×32；触摸目标最小 32px |
| 对比度 | ✅ 通过 | 30 个选择器关键文本最低 4.68:1（要求 ≥4.5:1） |
| 零外链 | ✅ 通过 | 运行期外部请求 0；4 款字体全部自托管并随 `dist/assets/` 一起发布 |

### 8.3 本轮被**推翻**的第一轮派单条目（如实记录）

第 3.1 节「原创视觉识别：夜蓝墨底 `#070B1E` + 棱镜三色」与第 5 节
「字体：Space Grotesk Variable / JetBrains Mono Variable（npm 本地打包）」
在第二轮被 16 号设计系统**取代**，理由与限制如下：

- 视觉层改用 16 号浅色设计系统（`--ds-bg #FCFBF9` / `--ds-accent #B4432B`），
  画布内玩法配色**按红线 K.1 保持原值**不动。
- 字体改用 16 号交付的自托管 woff2（Space Grotesk / Inter / Space Mono Regular + Bold）。
- **棱镜三色并未消失**：它们从「页面层视觉主色」降级为「玩法 / 身份语义色」
  （`--prism-cyan/amber/violet/magenta/blue`），在三个展项的画面内原样保留。

详见 `RESTYLE-INVENTORY.md` §9、`STATUS.md` 限制节 L-2 / L-4 / L-5。

---

## 9. 第三轮派单（15-supervisor · 接入 16 号规范）执行记录

> 本节为第三轮追加，**不修改上面第 0–8 节的历史派单原文**（保留为历史记录）。
> 派单来源：`15-supervisor` 第三轮派单（改版执行 · 规范已就绪）；
> 规范依据：`16-design-system/MIGRATION-NOTES.md`（§0 三前置风险 / §1 接入四步 / §2.8 本目录专属行 /
> §3 组件映射 / §4 红线 K.1–K.6 / §6 Pages 子路径 / §7 reduced-motion / §8 字体许可 /
> §9 V.1–V.11 验收清单 / §10 红线）。

### 9.1 接入四步（`MIGRATION-NOTES §1`）

| 步 | 规范要求 | 完成情况 |
| --- | --- | --- |
| ① 令牌层 | `tokens.css` 进入本厅 | ✅ `public/assets/ds/tokens.css` = 16 号 `src/tokens.css` **逐字节原样副本**（仅追加来源说明头；原文件 sha256 `e9595d51…f368`）。**本目录的 `--ds-*` 取值只此一处声明**（§0 风险 B） |
| ② 字体 | `fonts/fonts.css` + 自托管 woff2 | ✅ `public/assets/ds/fonts/`：5 款 woff2（Space Grotesk / Inter / Space Mono Regular / Space Mono Bold / Noto Sans SC 子集）+ `fonts.css` + 5 份 OFL 全文 + `FONT-MANIFEST.json`。第二轮自建的 `src/styles/fonts.css` 与 `src/fonts/` 已删除（避免重复声明） |
| ③ 换外壳 | `components.css` + `.ds-shell` | ✅ `public/assets/ds/components.css` = 16 号原样副本（sha256 `a602f414…0f51`）；`<body class="ds-shell">`；`.ds-skip` 跳转链接置于 `<body>` 首位 |
| ④ 注入 `--ds-base` | 由构建注入站点基准路径 | ✅ `index.html` 内 `<style>:root{--ds-base:"/playtime-atlas-20261021/";}</style>`，取值来自 `design-tokens.json → meta.basePathVar`。本厅产物自包含、不引用任何站点级资源，自身资源**全相对路径** |

**层叠顺序**：构建产物中 DS 的三份 `<link>` 在前、Vite 注入的本厅 CSS 在后 → 本厅规则层叠优先，
组件类冲突可就地校正（**不修改** 16 号副本）。

### 9.2 派单逐项结论

| 项 | 要求 | 结论 |
| --- | --- | --- |
| G.1 | 引入 tokens + components | ✅ 三份副本落盘并在 `index.html` 以**相对路径** `<link>` 引入；本厅 `src/styles/tokens.css` 已剥离全部 **165** 处 `--ds-*` 声明，退为「语义别名层 + `--hc-*` 高对比间接层 + `--prism-*` 玩法语义色 + `:lang(zh)` 规则」 |
| G.2 | `.ds-topbar` / `.ds-footer` / `.ds-skip` | ✅ 三者四路由均已渲染且可见（实测 `.ds-topbar` 1440×86、`.ds-footer` 1440×235、`.ds-skip` 112×54，Tab 第一个可达） |
| G.3 | 标题禁 `nowrap` | ✅ 4 个标题元素 `white-space` 全为 `normal`（`.ds-cover__title` + 3 × `.ds-work__title`） |
| G.4 | `:lang(zh)` 字距归零 + 行高 1.85 | ✅ 新增 `src/styles/cjk.css`（**`src/main.js` 中最后导入**）：254 个中文元素字距全为 `0px`、行高全部 ≥1.85，违规 0。6 条特异度更高的既有规则改用 `var(--ds-track-cjk)` |
| G.5 | 元信息 `--ds-font-mono` | ✅ `--ds-font-mono` 指向 Space Mono；Canvas 文本测量宽度 161.57 vs 不存在族名 158.43，证明真实生效 |
| G.6 | 保留功能不破坏可玩性 | ✅ 自建 QA **49/49**、13 号探针 **pass 8 / warn 0 / fail 0 / skip 1**、关卡 **4/4**；画布内配色逐位未变（图例色样仍为 `rgb(79,227,208)` / `rgb(255,95,162)` / `rgb(157,123,255)`） |
| G.7 | 资源相对化适配子路径 | ✅ `dist/assets/ds/**` 全部相对引用，`/repo/prism-era/` 子路径下 HTTP 200，**产物内无 `url(/...)` 绝对根路径** |
| I.1 | 画布用 `.ds-canvas-frame` | ✅ 三个舞台全部加上 `.ds-canvas-frame`（`contain: paint` + `isolation: isolate`，由 16 号组件层直接提供）+ `.ds-canvas-frame__hud` |

### 9.3 reduced-motion 的两条路径

| 路径 | 机制 |
| --- | --- |
| 系统偏好 | 16 号 `tokens.css` / `components.css` 的 `@media (prefers-reduced-motion: reduce)` 标准块 |
| 设置开关 | 设置面板「减少动效」直接切 **16 号自带的 `[data-rm="reduce"]`** |

本目录**不再自写** reduced-motion 的 `!important` 降级块（既合规，又避免与组件类打架）。
两条路径均实测：四路由最大动效 **1ms**，回响画布仍在绘制、HUD 判定文本仍在、折光阁图例三色块齐全。

### 9.4 本轮新增的外壳层功能（不触碰玩法 / 文案 / 关卡 / 史料）

时间轴线索筛选（`.ds-chip` ×6，`aria-pressed` + `aria-live` 计数）、关键词搜索（`.ds-field` + `.ds-input`）、
年份跳转轴（`.ds-rail--horizontal`，`aria-current`）、分区进度指示器（`.ds-indicator`）。

### 9.5 新增验收脚本

`scripts/verify-ds.mjs`（**零第三方依赖**：Node 内置模块 + 本机 Chrome 原生 CDP over WebSocket），
镜像 16 号 `tools/verify-preview.mjs` 的断言集并扩展到 **14 组检查**（四路由 × 四视口）。
输出 `evidence/ds-verification.json` + `evidence/ds/`（16 张截图）。
服务不可达时以退出码 **2** 结束并给中文提示。

### 9.6 复验结论

| 套件 | 结果 |
| --- | --- |
| `scripts/verify-ds.mjs` | 14 组：**13 pass / 1 warn / 0 fail / 0 error**，`verdict = PASS` |
| 自建浏览器 QA | **49 / 49**，0 控制台错误，0 失败请求 |
| 13 号原版探针 `probeEraGame` | **pass 8 / warn 0 / fail 0 / skip 1** |
| 无障碍与 reduced-motion | **11 / 11** |
| 自托管字体落地专项 | **11 / 11** |
| 关卡可解性 `scripts/test-levels.mjs` | **4 / 4** |
| 文案骨架 `scripts/check-i18n.mjs` | **162 / 162** |
| `npx vite build` | 退出码 0；`dist/` ≈ 1.14 MB |

唯一 warn：`--ds-font-mono` 比 `design-tokens.json` 多一个 `Consolas`——差异源自 16 号 `tokens.css` 本身，
本厅按红线未改副本，记入 `STATUS.md` L-12，待 16 号确认。

### 9.7 第三轮**没有**做的事（红线）

- 未删除任何既有 CSS（§10 红线）：一律在既有类名之上**叠加** `.ds-*` 类名。
- 未用 `z-index` 修重叠：一律改几何（padding / min-height / 静态横条 / fixed 定位）。
- 未把 16 号规范改名成参考站作品名或文案；未拷贝参考站任何图片 / 视频 / 字体。
- 未引入 CDN 字体或脚本；未新增运行期外部 API。
- 未改动作品名、URL、关卡、史料与玩法色板。
