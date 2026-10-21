# TASK · 回响电玩馆 / PLAYTIME ATLAS（博物馆主站）

- 任务编号：06-museum-core
- 工作目录：`/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/06-museum-core`
- 本地端口：**4326**
- 执行者：MiniMax Code M3.1-Flash / max（Codex 仅调度）
- 上线：由 **14-publish** 统一部署；本任务只交付可静态构建的产物。

---

## 1. 交付目标

打造「回响电玩馆 / PLAYTIME ATLAS」这座原创电子游戏博物馆的**主站与馆内导览系统**：
观众可以沿时间长廊漫游十个年代展厅、打开硬件与游戏展柜、检索与筛选展品、把展品加入收藏、
阅读每件展品的史料来源，并从展品详情直接进入同年代的**可玩展厅**。

作品名、文案、配色、字体栈、版式、模型形态全部原创重做，只借鉴公开博物馆站点的**机制与品质标准**，
不复制未授权 ROM、商业游戏美术或品牌视觉。

## 2. 功能清单（验收口径）

| # | 功能 | 验收标准 |
|---|---|---|
| F1 | 时间长廊 | 10 个年代门（1950s→2020s），键盘 ←/→、Tab 可达、滚轮吸附、点击进入年代展厅 |
| F2 | 年代展厅 | 每年代独立路由 `#/era/:id`，含年代叙述 + 展品网格 + 可玩入口 |
| F3 | 硬件与游戏展柜 | 展品分 `hardware` / `game` 两类，各自独立展柜区与视觉处理（硬件为体块，游戏为封套） |
| F4 | 搜索与筛选 | 全文检索（标题/创作者/平台/摘要）+ 年代/平台/类别三组筛选 + 排序 + 结果计数，实时更新 |
| F5 | 收藏 | 收藏按钮写入 localStorage，跨会话保留，提供 `#/collection` 收藏页与清空/导出 |
| F6 | 展品详情与来源 | 每件展品详情含 `sourceUrls` 逐条可点开、`imageLicense` 许可说明、史实 significance |
| F7 | 可玩入口 | 年代展厅与展品详情均可跳转到同年代小游戏；小游戏未并入时显示**明确的「待集成」占位**而非假按钮 |
| F8 | 2D 无障碍目录 | 默认视图即语义化网格/列表，键盘全通、焦点可见、ARIA live 播报结果数、对比度达标、尊重 `prefers-reduced-motion` |
| F9 | 可选 3D 展厅 | 独立路由 `#/hall`，three.js 程序化原创硬件体块、射线拾取、可视化降级、关闭入口明确 |
| F10 | 移动端可用 | ≤480px 全功能可用，侧栏折叠为抽屉，触控目标 ≥44px，3D 展厅自动降级提示 |
| F11 | 时代覆盖 | 至少 7 个时代（实际实现 10 个），展品不少于 70 条，逐条附来源 |
| F12 | 真实交互 | 所有按钮/筛选/收藏/路由均真实生效，无占位死链 |

## 3. 数据契约（与兄弟任务）

### 3.1 来自 05-museum-research（策展目录）
- 预期产物：`catalog.json` / `SOURCES.md` / `REFERENCE-DESIGN.md`
- 字段：`id, title, year, era, platform, creator, summary, significance, sourceUrls, imageLicense`
- 接入方式：`scripts/sync-exhibits.mjs` 在构建前把 `05-museum-research/catalog.json` 复制到
  `public/data/catalog.json`；运行时优先使用该文件，缺失时回落到本目录 `src/data/catalog.local.js`。
- **当前状态：05 尚未产出** → 本目录自带一套**本地初版策展集**（同样字段、同样来源要求），
  并在 UI 与 README 中明确标注「本地初版，待 05 策展包并入」。

### 3.2 来自 07-museum-art（美术包）
- 预期产物：`design-tokens.json` / SVG·PNG / GLB / `LICENSES.md` / `preview.html`
- 接入方式：同步脚本把 `07-museum-art` 的资产复制到 `public/art/`，把 `design-tokens.json` 复制到
  `public/data/design-tokens.json`；运行时读取覆盖 CSS 变量（颜色/间距/圆角），未提供则使用本目录
  `src/styles/tokens.css` 的同名变量。
- **当前状态：07 尚未产出** → 本目录自带**程序化生成的原创 SVG 美术包**（年代海报、年代背景、硬件体块轮廓、馆徽），
  全部为本项目自绘，无第三方商标。

### 3.3 来自 08–12（年代小游戏）
| 任务 | 展厅 | 年代 | 集成目录 |
|---|---|---|---|
| 08-era-origins | 光点年代 | 1950–1970s | `public/exhibits/origins/` |
| 09-era-arcade | 霓虹街廊 | 1980s | `public/exhibits/arcade/` |
| 10-era-console | 色块远征 | 1990s | `public/exhibits/console/` |
| 11-era-online | 联机曙光 | 2000s | `public/exhibits/online/` |
| 12-era-modern | 万象游乐 | 2010s–2020s | `public/exhibits/modern/` |

- 同步脚本**只复制、不修改**源目录；源产物缺失时，对应展项标记 `pending`，
  UI 显示「待集成 · 该展厅仍在制作」占位卡片，且**不提供假入口**。

## 4. 技术方案

- 构建：Vite 5（`base: './'`，兼容 GitHub Pages 子路径与 iframe 嵌入）
- 语言：原生 ES Module JavaScript（无框架，减少体积与构建风险）
- 3D：three.js（仅 3D 展厅路由动态 import，按需分块）
- 字体：仅使用系统字体栈（无 CDN、无网络依赖）；07 自托管字体到位后可替换 CSS 变量
- 资源：全部本地化，`npm` 依赖优先，构建产物 `dist/`
- 无后端、无 API、无外部请求

## 5. 目录结构

```
06-museum-core/
├── TASK.md / STATUS.md / README.md / ACCEPTANCE.md
├── SOURCES.md / LICENSES.md / manifest.json
├── package.json / vite.config.js / index.html
├── scripts/
│   ├── generate-art.mjs      # 生成原创 SVG 美术包
│   ├── sync-exhibits.mjs     # 同步 05/07/08-12 → public/
│   ├── verify-catalog.mjs    # 校验目录 schema + 来源标题可解析
│   └── test.mjs              # 单元测试
├── src/
│   ├── main.js  app.js  router.js  store.js
│   ├── data/     eras.js  catalog.local.js  exhibits.config.js
│   ├── modules/  search.js  views/*.js  hall3d.js
│   └── styles/   tokens.css  base.css  layout.css  components.css
└── public/
    ├── art/      (生成 + 07 同步)
    ├── data/     (05 同步)
    └── exhibits/ (08-12 同步)
```

## 6. 完成定义（DoD）

1. `npm run build` 成功产出 `dist/`，`npm run preview` 在 4326 可访问。
2. 浏览器实测：桌面 1440×900 与移动 390×844 全流程走通（搜索→筛选→详情→收藏→可玩入口）。
3. 无控制台错误、无资源 404。
4. 键盘可达性通过（Tab 序列、焦点可见、Esc 关闭弹层、焦点归位）。
5. `scripts/test.mjs` 全绿；`scripts/verify-catalog.mjs` 全绿。
6. README、ACCEPTANCE、SOURCES、LICENSES、manifest.json 齐备，并写明**当前限制**
   （05/07/08–12 未并入、3D 展厅为桌面演示、覆盖非穷尽）。
7. 向 14-publish 提供构建说明与集成清单。
