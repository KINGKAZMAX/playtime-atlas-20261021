# TASK 10 — 色块远征 · 1990s 家用机可玩展厅

> 归属批次：`flash-showcase-20261021`（回响电玩馆 / PLAYTIME ATLAS）
> 上级提示词：`../MASTER-UPDATE.md`、`../DISPATCH.md`
> 本任务目录：`/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/10-era-console`
> 端口：**4330**　|　执行者：MiniMax Code M3.1-Flash（全部研究 / 设计 / 美术 / 代码 / 测试由本 Agent 完成）

---

## 0. 任务原文约束（不可协商）

1. **不是完全一致复刻**。参考公开作品的机制与质量，但必须**重新设计**作品名、文案、内容、字体、配色、布局细节与模型形态。
2. **保留来源与差异说明**，不声称原创参考作品；不复制未授权 ROM、商业游戏资源或品牌视觉。
3. 只写本目录；可只读同级成果（`../05-museum-research`、`../06-museum-core`、`../14-publish` 等）。
4. 依赖优先 npm，资源全部本地化，运行不依赖 CDN / 在线 API。
5. 交付：**README、源码、验收记录、来源与资产许可、manifest.json**（`id,title,description,entry,buildCommand,outputDir,status`）。
6. 没有外部资料时明确写出限制。
7. **部署由 14-publish 统一负责**，本任务只交付可静态构建的产物。

## 1. 交付目标

本任务在博物馆时间线中对应 `console16` 时代（1990–1999）展厅，产出一个**独立可玩**的子站：

| 编号 | 交付物 | 说明 |
| --- | --- | --- |
| 10-A | **《色块远征》平台冒险** | 16-bit 风格横版平台游戏，**≥3 关**，可通关 |
| 10-B | **《等距测绘所》探索场景** | 等距（2:1）视角可交互探索展品场景 |
| 10-C | **展厅首页** | 原创视觉系统（字体 / 配色 / 布局）、时代导览、科普展品引用 |
| 10-D | **原创配乐** | WebAudio 程序化合成芯片音乐 + 音效，零外部音频文件 |

### 1.1 10-A 平台冒险硬性要求

- 跳跃、碰撞（AABB + 瓦片）、检查点、收集物、**胜负条件**、**重开**。
- 至少 3 个完整关卡，第 3 关通关即胜利结算。
- **触控 + 键盘**双输入：方向 / 跳 / 重开；虚拟按键在移动端与桌面均可触发。
- 状态机：`title → playing → levelClear → gameOver → victory`，可重开回标题。

### 1.2 10-B 等距场景硬性要求

- 2:1 等距投影瓦片渲染（Canvas 2D，画家算法深度排序），**非**纯文字列表。
- 可交互热点 ≥6：点击 → 展开科普展品面板（事实 + 来源链接）。
- 支持拖拽平移 / 滚轮缩放 / 键盘方向键浏览，触屏可点可拖。
- 环境动画：光照、水面、天线、信标、昼夜切换。

### 1.3 展厅首页硬性要求

- 原创命名、原创文案、原创字体栈（系统 + 自绘点阵标题）、原创配色（色板见 §3）。
- 年代导览与 06 主站对接：暴露 `window.PLAYTIME_ATLAS_NODE` 与 `postMessage` 协议（见 §5）。
- 科普展品每条**必须**带可点击来源 URL 与许可状态。

## 2. 工程约束

| 项 | 要求 |
| --- | --- |
| 构建 | Vite 5，`base: './'`（**Pages 子路径适配**，支持 `/repo/subpath/`） |
| 开发 / 预览 | `127.0.0.1:4330`，`strictPort` |
| 依赖 | 仅 npm；允许 `vite`；**不引入**运行时第三方引擎（渲染用原生 Canvas 2D） |
| 资源 | 全部程序化生成（Canvas / SVG / WebAudio），零位图、零字体文件、零音频文件 |
| iframe | 可被 `<iframe src=".../10-era-console/">` 嵌入：顶栏降级为内嵌条、不依赖顶层导航、`localStorage` 失败不崩 |
| 离线 | 构建产物 `dist/` 双击 `index.html` 即可运行（相对路径，无绝对 `/` 引用） |
| 构建产物 | `dist/` 为发布目录；`node_modules/` 不提交 |

## 3. 原创视觉系统（自定，不参考任何品牌视觉）

**标题**：《色块远征》　英文副标 `CHROMA VOYAGE`
**展厅节点名**：`1990s 家用机展厅 · 色块远征`

| 角色 | 色值 | 用途 |
| --- | --- | --- |
| `--ink` | `#101018` | 底色 / 描边 |
| `--ink-2` | `#1c1c2a` | 面板底 |
| `--paper` | `#f4efe4` | 正文（偏暖纸白，非纯白） |
| `--mint` | `#5ee0b8` | 主色（薄荷） |
| `--coral` | `#ff7a6b` | 强调（珊瑚） |
| `--sun` | `#ffd166` | 收集物 / 高亮 |
| `--sky` | `#6aa9ff` | 次色（天蓝） |
| `--violet` | `#b48aff` | 页面过渡 |

字体栈：`"Zpix", "Fusion Pixel", ui-monospace, "SF Mono", Menlo, monospace`（**不内嵌字体文件**，回退到系统等宽），标题额外使用 Canvas 点阵字模渲染。

## 4. 目录与文件

```
10-era-console/
├─ TASK.md              本文件
├─ STATUS.md            阶段状态
├─ README.md            总览 / 运行 / 操作 / 目录说明
├─ SOURCES.md           科普展品逐条来源台账 + 抓取时间
├─ LICENSES.md          资产许可与「引用≠授权」声明
├─ QA.md                验收记录（含实机截图）
├─ manifest.json        id,title,description,entry,buildCommand,outputDir,status
├─ package.json
├─ vite.config.js
├─ index.html
├─ scripts/start.sh
├─ src/
│  ├─ main.js               展厅首页控制器
│  ├─ styles/               原创样式（tokens / hall / overlays / platform / iso）
│  ├─ data/
│  │  ├─ exhibits.js        科普展品（含 sourceUrls / imageLicense）
│  │  └─ consoles.js        1990s 机型档案（面向展厅导览）
│  ├─ platform/
│  │  ├─ PlatformGame.js    主循环 / 状态机
│  │  ├─ physics.js         AABB 瓦片碰撞（可单测）
│  │  ├─ levels.js          3 关 ASCII 地图 + 实体表
│  │  ├─ sprites.js         程序化像素精灵
│  │  ├─ renderer.js        图层 / 视差 / 扫描线
│  │  └─ input.js           键盘 + 触控
│  ├─ iso/
│  │  ├─ IsoScene.js        等距渲染 + 相机
│  │  ├─ terrain.js         高度图 + 瓦片
│  │  ├─ hotspots.js        热点与展品绑定
│  │  └─ controls.js        拖拽 / 缩放 / 键盘
│  ├─ audio/
│  │  └─ AudioEngine.js     程序化芯片音乐 + 音效
│  └─ ui/
│     ├─ PixelTitle.js      Canvas 点阵标题
│     └─ Overlay.js         通用覆盖层
├─ tests/                 Node 内置 test runner 逻辑测试
└─ screenshots/           实机截图
```

## 5. 与 06 / 14 的对接协议

### 5.1 嵌入协议

- 页面暴露 `window.PLAYTIME_ATLAS_NODE = { id, title, era, year, entry, ready: true }`。
- 父页面可 `postMessage({ type:'playtime:nav', node:'10-era-console', section:'platform' })`，本页监听并切换展项。
- 检测到被 iframe 嵌入（`window.self !== window.top`）时：
  - 隐藏"返回总馆"外链（改为提示"已嵌入展厅"）；
  - 顶部展示一条紧凑内嵌栏（标题 + 返回展厅首页按钮）。

### 5.2 交付给 14-publish

- `npm run build` → `dist/`，`base: './'` 可直接放 GitHub Pages 任意子路径。
- `manifest.json` 指向 `entry: index.html`、`buildCommand: npm run build`、`outputDir: dist`。
- 本任务**不**创建 GitHub 仓库、不 push、不开 Pages。

## 6. 验收标准

| # | 检查项 | 通过条件 |
| --- | --- | --- |
| 1 | 构建 | `npm run build` 成功，`dist/` 产出且无外链 CDN |
| 2 | 子路径 | `base: './'`，`dist/index.html` 无 `src="/"` 绝对引用 |
| 3 | 平台冒险 | 3 关全部可通关；跳跃 / 碰撞 / 检查点 / 收集物 / 胜负 / 重开 全部生效 |
| 4 | 输入 | 键盘与触控（方向 / 跳 / 重开）均生效 |
| 5 | 等距场景 | ≥6 热点可点，展开含来源的面板；可拖拽 / 缩放 |
| 6 | 科普展品 | 每条展品含 ≥1 可访问来源 URL（抽样 HTTP 200/3xx 核验） |
| 7 | 离线 | `dist/` 直接打开可用，不请求外部域 |
| 8 | iframe | 在 iframe 中加载正常，无顶层导航依赖、无控制台报错 |
| 9 | 端口 | 预览服务监听 `127.0.0.1:4330` |
| 10 | 逻辑单测 | `npm test` 全绿（物理 / 关卡解析 / 展品数据完整性） |
| 11 | 实机自测 | 浏览器实际通关 3 关 + 走查等距场景 + 首页，截图入 `screenshots/` |
| 12 | 文档 | README / SOURCES / LICENSES / QA / manifest 齐全且与实际一致 |

## 7. 边界

- **不**部署、不创建或修改任何 GitHub 仓库（归 14-publish）。
- **不**下载 / 分发商业 ROM、受版权保护的游戏资产、品牌 logo、商标字体。
- 所有视觉资产程序化生成；参考仅用于**机制与品质对标**，并在 `SOURCES.md` 写明差异说明。
- 只写本目录；只读同级目录。
