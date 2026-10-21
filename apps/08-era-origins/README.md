# 光点年代 · 早期可玩展厅 / LUMEN ERA

> 1958 年示波器上的一个亮点，到 1979 年矢量屏上的一束电子光。
> 一间自包含、可离线运行的早期电子时代可玩展厅。

本展厅以 **1948—1979 年公开可考的早期电子游戏史** 为参照系，重新演绎两款**完全原创**的迷你游戏，并把展厅叙事的每一条史实都钉在可点击的出处上。

- 展厅主页 `index.html` —— 序厅 / 导览 / 年代长廊 / 参考与差异 / 来源台账 / 操作与无障碍
- 展品 08-A `rally.html` —— **辉点对拉 / LUMEN RALLY**：光点球对拉
- 展品 08-B `gravity.html` —— **引力双星 / GRAVITY DUO**：轨道引力对决

> **原创声明**：本作品不复制任何 ROM、商业资源、商标、logo 或品牌视觉；两款游戏的规则、命名、文案、音效与版式均为本批原创。历史作品仅作为**研究引用**，**引用 ≠ 授权**。逐项差异见 [`DIFFERENCES.md`](./DIFFERENCES.md)，逐条出处见 [`SOURCES.md`](./SOURCES.md)。

---

## 一、快速开始

```bash
cd 08-era-origins

npm install --no-audit --no-fund   # 仅 vite@5.4.11 一个开发依赖
npm run dev                        # http://127.0.0.1:4328
```

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动开发服务器（`127.0.0.1:4328`，`strictPort`） |
| `npm run build` | 产出静态站点到 `dist/`（三页 + 相对路径资源） |
| `npm run preview` | 本地预览构建产物，同样占用 4328 |
| `npm run start` | 一键脚本：缺依赖时自动安装再启动 |
| `npm run verify` | 自验脚本（**全程离线、不启浏览器**）：跑测试 → 构建 → 产物检查 → manifest 一致性 → **改版专项**（见 [`QA.md`](./QA.md)） |
| `node --test "tests/*.test.mjs"` | 单独跑单元测试（**必须用 glob**，目录形式会报 `MODULE_NOT_FOUND`） |
| `node scripts/check-tokens.mjs` | 令牌一致性 / 命名空间唯一 / 画布镜像 / 规范层副本漂移（纯本地，零依赖） |
| `node scripts/verify-pages.mjs` | 页面机械检查（**走 Ego 浏览器**，复用批次共享 `tools/ego-qa`） |
| `node scripts/verify-game.mjs` | 游戏行为回归 D3 / D4 / D5 / D6（**走 Ego 浏览器**） |

> **浏览器入口**：依 2026-10-22 起的长期约定，网页调试 / 截图 / 验收**一律走 Ego 浏览器**（`ego-browser nodejs`），不再本地另起 Playwright / Chromium / Chrome。上面两支浏览器脚本因此**不并入 `npm run verify`**，需单独运行；详见 [`tools/ego-qa/MIGRATION.md`](../tools/ego-qa/MIGRATION.md)。

三个入口：

```
http://127.0.0.1:4328/index.html     展厅主站
http://127.0.0.1:4328/rally.html     展品 08-A 辉点对拉
http://127.0.0.1:4328/gravity.html   展品 08-B 引力双星
```

---

## 二、展厅叙事

### 年代长廊（12 站）

`1948` 阴极射线管娱乐装置 → `1951` Nimrod → `1952` OXO → `1958` Tennis for Two → `1960` PLATO → `1962` Spacewar! → `1963` Sketchpad → `1971` Computer Space → `1972` Magnavox Odyssey → `1972` Pong → `1978` Space Invaders → `1979` Asteroids

每一站都带一句话注解与一个「出处」角标，点开即跳到该条来源的原始页面。

### 叙事的三条主线

1. **显示技术的迁移** —— 示波器分时扫描（36Hz 轮流显示球场/球网/球）→ PLATO 的位图与矢量混合终端 → 街机的矢量显示器（电子束画线，而非点亮像素网格）。
2. **输入方式的迁移** —— 旋钮 + 按钮 → 光笔 → 16 格触摸面板 → 摇杆与按键。
3. **从研究玩具到商业商品** —— OXO 是为了研究人机交互，Nimrod 不是为娱乐而造；Computer Space 是第一台商业可售电子游戏，Pong 是第一款商业上成功的电子游戏。

### 来源台账

共 **17 条**来源，逐条给出：机构 / 标题 / 可点击 URL / 取证方式 / 所支撑的具体史实陈述。

- 直连 HTTP 200 取证：15 条
- 检索索引取证：2 条（`bnl.gov` 在本次沙箱内被网络策略拦截，正文经搜索索引完整取回并逐条比对，**已在来源表中如实标注**）

叙事数据层与 `SOURCES.md` **同源**（`src/data/exhibits.js` 是唯一事实源），因此改数据不会造成文档与页面各说各话。

> ⚠️ **本展厅是「代表性选样」，不是编年全集。** 12 站不可能覆盖 1948—1979 的全部作品，选样标准是「与本作机制直接相关 + 有可核验的一手或馆方出处」。

---

## 三、两款展品

### 08-A 辉点对拉 / LUMEN RALLY

以 1958 年 Tennis for Two 的「示波器上一个会动的亮点」和 1972 年 Pong 的对拉为灵感，但**不是它们的复刻**。

**基础规则**：左辉与右辉各守一块辉板，把光点在对方场地之间打回去。**先到 7 分**者胜。

**两条原创规则**（对照 Pong 的纯等速来回）：

| 规则 | 效果 |
| --- | --- |
| **蓄力重击** | 按住空格蓄力，松手回击。命中落在**窗口内**（对方来不及回防的时段）额外 **+2 分**，而非 +1。蓄力期间移动变慢。 |
| **偏心回弹** | 出球点不落在辉板正中时，回弹角被拉偏——可以故意打「擦边」来改变球的出射方向。 |

**其余系统**：三档 AI（初辉 / 稳流 / 锐锋）、双人同屏、三段拖尾余辉（磷光衰减）、实时比分与状态播报、计分与设置写入 `localStorage`。

### 08-B 引力双星 / GRAVITY DUO

以 1962 年 Spacewar! 的「两艘飞船在恒星引力井中缠斗、燃料有限、松手仍保持惯性」为灵感。

**基础规则**：青辉与朱辉各驾一艘光舟，在一枚中央核心的引力场里绕行，互相之间也有平方反比引力。**把对手逼进核心**或**耗尽其燃料**即胜。

**两条原创规则**（对照 Spacewar! 的鱼雷与引力借力）：

| 规则 | 效果 |
| --- | --- |
| **光迹即武器** | 推进时留下的光痕带有灼烧判定。撞上对手的尾迹要 **-24** 生命，而尾迹的**所有者 +3** 分——共享光迹是有效的战术。 |
| **相位脉冲** | 消耗光能发射一圈脉冲，炸毁对手尾迹并把它推开，用作反制与控场手段。 |

**其余系统**：燃料 / 光能 / 存活奖励三套资源、三档 AI（微轨 / 稳轨 / 锐轨）、双人同屏、平方反比引力（`G_CORE = 2.09e6`、`G_MUTUAL = 3e5`、阻力 `0.01`）、虚拟摇杆触屏操作。

---

## 四、操作手册

### 08-A 辉点对拉

| 按键 | 作用 |
| --- | --- |
| <kbd>W</kbd> <kbd>S</kbd> | 左辉上下移动 |
| <kbd>↑</kbd> <kbd>↓</kbd> | 右辉移动（单人模式下也可用） |
| <kbd>空格</kbd> | 左辉蓄力，松手蓄能就绪 |
| <kbd>/</kbd> <kbd>.</kbd> | 右辉蓄力（双人模式） |
| <kbd>P</kbd> <kbd>Esc</kbd> | 暂停 / 继续 |
| <kbd>R</kbd> | 重开 |
| <kbd>M</kbd> | 静音开关 |

### 08-B 引力双星

| 按键 | 作用 |
| --- | --- |
| <kbd>A</kbd> <kbd>D</kbd> | 青辉转向 |
| <kbd>W</kbd> | 青辉推进 |
| <kbd>空格</kbd> | 青辉相位脉冲 |
| <kbd>←</kbd> <kbd>→</kbd> | 朱辉转向（双人模式） |
| <kbd>↑</kbd> | 朱辉推进（双人模式） |
| <kbd>/</kbd> <kbd>.</kbd> | 朱辉相位脉冲（双人模式） |
| <kbd>P</kbd> <kbd>Esc</kbd> | 暂停 / 继续 |
| <kbd>R</kbd> | 重开 |
| <kbd>M</kbd> | 静音开关 |

### 触屏

- **08-A**：直接拖动画面控制辉板；另有四向 + 蓄力按钮。
- **08-B**：左下虚拟摇杆控制转向与推进。
- 两作都支持 `pointer` 事件，鼠标与触屏走同一套代码路径。

### 键盘焦点作用域（重要）

**键盘只在游戏画面获得焦点时生效。** 未聚焦时按方向键**不会**改变任何游戏状态，也不会阻止页面滚动；点击画布后键盘立即可用。

实现方式（`src/core/focus.js` + `src/core/input.js`）：

- 焦点判定基于 **实时 `document.activeElement`**，而不是一次性缓存的标志位，因此失焦后不会残留「已聚焦」状态。
- 监听 `focusin` / `focusout` 同步焦点标志。
- 两款游戏**都没有 window 级 keydown 监听**；按键只在游戏容器自身的 `keydown` 上处理。
- 失焦时立即清空 `down` / `justPressed` / `justReleased`，避免「按住不放，切回来发现键还卡着」。
- 窗口失焦（切标签页）时自动暂停，并恢复到暂停前的阶段（`countdown` 阶段也能暂停）。

---

## 五、视觉系统（余晖设计系统 / Afterglow Design System）

全站外壳已按 **`16-design-system`** 的规范统一改版。样式按**三层**加载，顺序固定：

```
既有 CSS（base → shell/game） → 规范层（assets/ds/） → 08 专属层（src/styles/）
```

| 层 | 文件 | 作用 |
| --- | --- | --- |
| 既有 | `src/styles/base.css` / `shell.css` / `game.css` | 08 原有结构与排版，**一行未删**（RESTYLE-SPEC §10 红线） |
| 规范层 | `assets/ds/tokens.css` | 余晖令牌层：`--ds-*` 取值的**唯一声明处**（浅色 16 项 + 深色 16 项）、排版基类、`:lang(zh)` 规则、reduced-motion 降级 |
| 规范层 | `assets/ds/components.css` | 余晖组件层：`.ds-topbar` / `.ds-footer` / `.ds-skip` / `.ds-btn*` / `.ds-chip` / `.ds-tag` / `.ds-cover__title` / `.ds-canvas-frame` 等 `.ds-*` 类 |
| 规范层 | `assets/ds/fonts/fonts.css` | 自托管 OFL 字体声明（零 CDN、零外链） |
| 08 专属 | `src/styles/tokens.css` | **不声明任何 `--ds-*` 取值**：只放 `--lumen-*` 画布镜像（15 项）、中文排版修正、`body.ds-shell` 底纹还原 |
| 08 专属 | `src/styles/components.css` | 08 特有组件与几何桥接（把 08 的既有结构接到 `.ds-*` 类名上，并在规范之上还原 08 几何） |

> **唯一声明处**：同名 CSS 变量由**后加载者**胜出，因此 `--ds-*` 的取值只在 `assets/ds/tokens.css` 声明一次，08 专属层只引用、不重声明 —— 由 `scripts/check-tokens.mjs` 机器校验。
> 规范层两个文件与 `16-design-system/src/` 的对应源**逐字节一致**，同脚本每次自动比对（当前 **0 漂移**）；令牌取值以 `16-design-system/design-tokens.json` 为唯一来源。
> 三页 `<head>` 内联注入 `:root { --ds-base: "/playtime-atlas-20261021/" }`，`<body>` 带 `ds-shell` 类；**全部资源仍走相对路径**，`--ds-base` 不参与任何资源 URL。

### 落地口径

| 范围 | 处置 |
| --- | --- |
| 外壳（导航 / 封面 / 详情 / 卡片 / 控件 / 导航轴 / 指示器 / 焦点环） | 全部走 `--ds-*` 令牌与 `.ds-*` 组件类 |
| **玩法画布内部**（canvas 绘制、场景色、角色色、粒子、拖尾、发光） | **一律不动**——画布由 `src/core/gfx.js` 的 JS 常量绘制，**不读任何 CSS 变量**，改版在技术上不可能影响配色 |
| **贴着画布的 HUD 层**（画面外框 / 焦点提示 / 开始·暂停覆盖层） | 保留画布色板，保证画面内对比度不因外壳统一而下降 |

> 依据 `16-design-system/MIGRATION-NOTES.md` §4 K.1（画布配色不得统一）与 K.3（HUD 可读性优先于风格统一）。
> 画布焦点环的**几何**已对齐 `--ds-focus-width` / `--ds-focus-offset`（2px + 2px 偏移），**颜色**保留青色——在深靛画面上对比度远高于朱砂。

### 有意偏离与暂缓项（摘要）

完整清单与理由见 [`STATUS.md`](./STATUS.md)「第四轮」章。摘要：

- `.ds-cover` / `.ds-rail` / `.ds-indicator` **未整体套用**（分别会压掉两栏网格、把文档流内的年代长廊抽走、或需要新增 08 本就没有的滚动吸附交互），只借用其子元素语义。
- `.ds-btn` 高度按 **44px** 而非规范实现里的 128px —— 同一套规范的成文条款（`DESIGN-SPEC.md` §7.1「最小高 40px」）与实现不一致时以成文规范为准。
- `.ds-canvas-frame` 的 `contain: paint` 降级为 `isolation: isolate` —— paint containment 会裁掉焦点环，与「焦点环任何状态不得移除」冲突。
- 未内置 `Noto Sans SC` 子集（197 600 B 且覆盖不了本目录汉字），字体栈顺序仍满足「拉丁自托管 → 完整系统 CJK 栈 → Noto 子集 → 通用 sans-serif」。
- 顶栏 / 封面 / 渐变标题等处的 `color-mix()` 底色改写为 `rgba()` 字面量 —— Chrome 会把 `color-mix()` 计算成 `color(srgb …)` 形式，WCAG 对比度工具识别不了，会把可测项判成「无法计算」。
- **HUD 文字对比度不豁免**（16 的明确要求）：覆盖层眉标与脚注原本用画布色板的暗色（`--lumen-cyan-dim` 4.22:1 / `--lumen-dim` 2.4:1），已改为同属画布色板的 `--lumen-cyan`（12.95:1）与 `--lumen-slate`（6.71:1）。
- 入口注入的 `--ds-base` 带 `!important` —— Vite 构建时把合并后的 CSS `<link>` 放到 `<head>` 末尾，位置在内联块之后；不加 `!important` 规范层 `tokens.css` 的 `:root{--ds-base:""}` 会在**构建产物**里反向覆盖注入值。

### 字体（自托管，零 CDN）

| 字体族 | 角色 | 许可 |
| --- | --- | --- |
| Space Grotesk | 展示体（标题） | SIL OFL 1.1 |
| Inter | 正文 | SIL OFL 1.1 |
| Space Mono | 等宽（年份 / 键位 / 编号） | SIL OFL 1.1 |
| 系统中文栈（PingFang SC / Microsoft YaHei …） | 汉字 | 系统自带，零字节 |

字体文件与 OFL 许可全文在本目录 `assets/ds/fonts/`，详见 [`LICENSES.md`](./LICENSES.md)。

---

## 六、目录结构

```
08-era-origins/
├── index.html              展厅主站入口
├── rally.html              展品 08-A 入口
├── gravity.html            展品 08-B 入口
├── vite.config.js          MPA 三入口 / base:'./' / 构建时复制文档进 dist
├── manifest.json           批次清单（id / title / description / entry / buildCommand / outputDir / status）
├── package.json            依赖与脚本
├── assets/ds/              规范层（自 16-design-system 落地，零漂移）
│   ├── tokens.css            --ds-* 令牌层（唯一声明处）+ 排版基类 + reduced-motion
│   ├── components.css        .ds-* 组件层
│   └── fonts/                自托管 OFL woff2 ×4 + 许可全文 ×4 + fonts.css
├── src/
│   ├── main.js             展厅主站渲染
│   ├── core/
│   │   ├── audio.js        WebAudio 程序化音效（无采样文件）
│   │   ├── focus.js        焦点作用域门控
│   │   ├── gfx.js          Canvas 绘制工具（含画布色板 PALETTE 与余辉衰减）
│   │   ├── input.js        键鼠触统一输入
│   │   ├── loop.js         固定步长主循环（1/180s，单帧最多 10 步）
│   │   └── storage.js      localStorage 存档
│   ├── data/exhibits.js    叙事数据层：SOURCES / TIMELINE / DIFFERENCES（唯一事实源）
│   ├── games/
│   │   ├── rally.js        08-A 玩法
│   │   ├── rally.entry.js
│   │   ├── gravity.js      08-B 玩法
│   │   └── gravity.entry.js
│   ├── ui/previews.js      展厅示波器示样 + 两作动态预览
│   └── styles/
│       ├── base.css        复位 + 排版 + 通用零件（外壳变量 → --ds-*）
│       ├── game.css        游戏页外壳（画布相邻层保留 --lumen-*）
│       ├── shell.css       展厅主站外壳
│       ├── tokens.css      08 专属层：--lumen-* 画布镜像 + 中文排版 + 底纹还原
│       └── components.css  08 专属层：组件桥接与几何还原
├── tests/                  node:test + 极简 DOM/Canvas 垫片，54 个用例
├── scripts/
│   ├── start.sh            一键启动
│   ├── verify.sh           自验 5 步：测试 → 构建 → 产物检查 → manifest 一致性 → 改版专项（全程离线）
│   ├── check-tokens.mjs    令牌一致性 / 命名空间唯一 / 画布镜像 / 规范层副本漂移（纯本地）
│   ├── verify-pages.mjs    页面机械检查（Ego + 批次共享 tools/ego-qa；视口 / 对比度 / 触摸目标 / Tab / 降级 / 控制台）
│   └── verify-game.mjs     游戏行为回归（D3 状态机 / D4 存档 / D5 键盘作用域 / D6 控制台；Ego）
├── screenshots/            实机截图 + 探针原始报告
│   ├── 0*.png                7 张主截图（Ego 浏览器拍摄）
│   ├── probe-report.json     游戏行为探针结果（scripts/verify-game.mjs 生成）
│   └── verify/               12 张多视口截图 + pages-verification.json + 三份分页报告
├── handoff/                给 06-museum-core 与 14-publish 的交接说明
└── README.md SOURCES.md DIFFERENCES.md LICENSES.md QA.md RESTYLE-INVENTORY.md STATUS.md TASK.md
```

---

## 七、技术要点

| 方面 | 实现 |
| --- | --- |
| 构建 | Vite 5.4.11，MPA 三入口，`base: './'`（同时兼容 GitHub Pages 子路径与 iframe 嵌套） |
| 运行时依赖 | **0 个**。`dependencies` 为空，无 CDN、无在线 API、无图片/音频素材文件 |
| 设计令牌 | `--ds-*`（外壳，唯一声明处 = `assets/ds/tokens.css`）+ `--lumen-*`（画布镜像），两套命名空间完全分离 |
| 渲染 | 原生 Canvas 2D，全部图形程序化绘制（渐变 / 辉光 / 粒子 / 拖尾） |
| 音效 | WebAudio 振荡器 + 噪声缓冲实时合成，无采样 |
| 字体 | 自托管 woff2 ×4（OFL 1.1）+ 系统中文栈；**不加载任何 Web 字体** |
| 主循环 | 固定步长 1/180s，`maxSteps = 10`，标签页失焦自动暂停 |
| 持久化 | `localStorage`：最高分、难度、模式、音量 |
| 无障碍 | 焦点门控、`prefers-reduced-motion`、ARIA 实时状态播报、可见焦点环、对比度 ≥4.5:1（12 项样本实测最低 4.74 / 5.56） |

**离线自足**：断网状态下可完整运行展厅与两款游戏。

---

## 八、集成说明

- **给 06-museum-core（iframe 嵌套）**：把 `dist/` 内容放到 `public/exhibits/era-origins/`，主站以 `<iframe src="./exhibits/era-origins/index.html">` 引入。资源全部相对路径，嵌套后无需改配置。详见 [`handoff/06-museum-core.md`](./handoff/06-museum-core.md)。
- **给 14-publish（静态发布）**：构建命令 `npm run build`，产物目录 `dist`，无需环境变量、无需后端。详见 [`handoff/14-publish.md`](./handoff/14-publish.md)。

> **Pages 子路径**：产物内所有资源为相对路径（`./assets/...`），可直接挂在
> `/playtime-atlas-20261021/works/08-era-origins/` 之下，无需改配置。

---

## 九、已知限制

1. `bnl.gov` 在本次沙箱内直连被拦截（curl / web_fetch 均失败），其正文经搜索索引完整取回并逐条比对；来源表中已标注为「检索索引取证」，其余 15 条均为直接 HTTP 200 取证。
2. 本展厅是**代表性选样**，不宣称覆盖 1948—1979 全部电子游戏作品。
3. 两款游戏是**原创重新演绎**，不是任何历史作品的复刻或可运行副本。
4. 触屏手势基于 Chromium 模拟上下文验证，未在真机 Safari / iOS 上实测。
5. 音频只验证了 AudioContext 可在用户手势后启动与无控制台报错，未做主观音质评估。
6. 本任务**不部署**；线上地址由 14-publish 产出后回填 `handoff/14-publish.md`。
7. **目前只有中文版**：`<html lang="zh-CN">` 已正确标注，但**未提供 `hreflang="en"`**——没有英文版本可交替，不提供虚构的双语标记；英文版产出后补 `hreflang` 双标签。
8. **画面焦点环保留青色**而非统一到强调色：这是为满足 §4 K.3「HUD 可读性优先」的有意偏离，几何已按 `--ds-focus-width` / `--ds-focus-offset` 对齐。
9. **改版中若干取舍无参考站实测依据，为本批自定**：包括「样式表三层加载顺序」「固定深色主题而非跟随系统」「`--amber → --ds-jade` 的映射」「画布焦点环保留青色」「`.ds-btn` 高度取 44px」五项。参考站 olek.si 在这些维度未取证，故不臆造为「olek.si 风格」。
10. **中文正文使用系统字体栈**，未内置 Noto Sans SC 子集（197 600 B 且按 07 用字生成，覆盖不了本目录汉字）；不同系统上的中文渲染差异未做逐字校对。
11. **中文排版整体为本系统自有设计**：参考站 olek.si 是纯英文站点，没有任何中文字形，因此中文字距 / 行高 / 标点 / 换行 / 按钮宽度**不存在「参考站怎么做的」这一事实来源**。本目录采用的 `--ds-track-cjk: 0` 与正文行高 1.85 属规范层既定值，同样标注为**本批自定**。
12. **规范层以副本形式落地到 `assets/ds/`**：文件与 `16-design-system/src/` 逐字节一致，由 `scripts/check-tokens.mjs` 每次比对；16 若继续更新，本目录需重跑该脚本并同步副本（当前 0 漂移）。
13. **`.ds-cover` / `.ds-rail` / `.ds-indicator` 未整体套用**，只借用其子元素语义 —— 理由与逐项影响见 [`STATUS.md`](./STATUS.md)「暂缓项」章；这三条属**本批自定的接入边界**，参考站没有可对应的多作品大厅结构可供比对。
14. **游戏页的正文用 08 既有 `.note` 段落承载，但已挂 `.ds-body` / `.ds-sm` 语义类名**（第四轮补齐）：两段正文挂 `.ds-body`、两处小注挂 `.ds-sm`、顶栏拉丁副名挂 `.ds-mono`，使 12 个规范样本选择器在游戏页同样可测。字号因此从 12.5px 提到 16px / 14px（跟随规范层排版基线），侧栏密度有变化。
15. **浏览器入口已统一到 Ego**：`scripts/verify-pages.mjs` 与 `scripts/verify-game.mjs` 原先各自拉起无头 Chrome / Playwright，现已改为经 `ego-browser nodejs` 执行（前者复用批次共享 `tools/ego-qa`）。两支脚本**不再并入 `npm run verify`**，以保持该脚本全程离线、无常驻进程。

---

## 十、许可

本目录内代码、美术、音效、文本均为本批原创，随批次仓库许可分发。字体为第三方 SIL OFL 1.1，已随包附许可全文。参考作品的著作权归各自权利人所有；本项目仅作历史研究引用。详见 [`LICENSES.md`](./LICENSES.md)。
