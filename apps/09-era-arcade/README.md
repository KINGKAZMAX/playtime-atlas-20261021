# 霓虹街廊 · 街机可玩展厅

> **NEON CORRIDOR — 1980s Arcade Playable Hall**
> 一间可以走进去的 1980 年代街机厅：霓虹夜街上的展厅枢纽 + 两款完整原创小游戏。

纯静态、零运行时依赖、运行期零网络请求。可 iframe 嵌入，也可直接部署到 GitHub Pages 任意子路径。

![霓虹街廊展厅](screenshots/01-hall.png)

---

## 1. 三十秒上手

1. 打开页面 → 展厅（霓虹夜街）。`←` `→` 沿街廊走动，走到终端前按 <kbd>空格</kbd> 进入；
   也可以**直接点击终端**，或用下方「展品目录」跳转。
2. 进游戏后**先点一下画面**（键盘只在画面获得焦点时生效，避免嵌入主站时抢按键）。
3. 玩。右上角可开关声音、CRT 效果、设置、触控键。
4. 顶栏「**中 / EN**」胶囊可随时切换中英文，选择会记住，`?lang=en` 深链亦可直达英文版。

| 展品 | 说明 |
| --- | --- |
| 🌆 **霓虹街廊** | 展厅枢纽：程序化生成的街机柜、霓虹招牌与远景，可走动、可点选 |
| 🧊 **晶格回廊** | 迷宫追逐：格心锁定移动，拾取晶核开启归途门，巡守会锁定你 |
| ☄️ **陨星纵队** | 编队射击：三种弹型、同色共振蓄力，满槽一击全场激爆 |
| 📜 **街机纪年** | 8 条带来源链接的时代陈述 + 原创性声明 |
| 🏆 **霓虹荣誉榜** | 本地高分榜（localStorage） |

---

## 2. 两款游戏怎么玩

### 晶格回廊（LATTICE CORRIDOR）

- **移动**：`←` `→` `↑` `↓` 或 `WASD`。移动体采用**格心锁定**：只能在格心处转向，途中不拐弯。
- **相位穿行**：<kbd>空格</kbd>，消耗能量，无视一格障碍（能量会缓慢回复）。
- **残响**：<kbd>E</kbd>，放出一个沿你走过的路径回溯的影子，替你勾引巡守。
- **目标**：收集本层全部晶核 → 归途门开启 → 走进归途门进入下一层。
- **危险**：巡守锁定会扣血；时间耗尽同样扣血。

### 陨星纵队（METEOR COLUMN）

- **移动**：<kbd>A</kbd> `←` / <kbd>D</kbd> `→`。
- **开火**：<kbd>空格</kbd>（按住连发）。
- **弹型**：<kbd>1</kbd> 散射 / <kbd>2</kbd> 穿甲 / <kbd>3</kbd> 追踪；<kbd>Q</kbd> 循环切换。
- **共振激爆**：<kbd>F</kbd>。**连续命中同种类**陨石累积共振槽（击毁额外 +1，2.5 秒未命中则衰减），
  满 6 格释放，一次清空全场同色目标。
- **目标**：清空一波波编队；被击中会掉血，铁陨还会打出余波弹。

**通用**：<kbd>P</kbd> / <kbd>Esc</kbd> 暂停 · <kbd>R</kbd> 重开 · <kbd>M</kbd> 静音 · <kbd>H</kbd> 帮助。
触屏设备自动显示虚拟方向键与动作键（也可用顶栏「触控键」手动开关）。

---

## 3. 本地运行

```bash
npm ci          # 只装 vite@5.4.11（唯一 devDependency）
npm run dev     # http://127.0.0.1:4329
npm run build   # 生产构建 → dist/
npm run preview # 预览生产产物
npm start       # 等价于 npm run dev
```

## 4. 验收

```bash
npm test               # 逻辑验收（32 项，零依赖 Node）
npm run test:tokens    # 令牌一致性（129 个变量逐名对照 16 规范暗色组）+ 字体栈三项（V.11 顺序 / V.12 不自造 / V.13 无漂移）
npm run test:compliance # 设计系统机械合规（17 项：溢出 / 对比度 / 画布 HUD 对比度 / 焦点 / 触摸目标 / 降级）
npm run test:probe     # 13 探针契约（10 项，按 13 的 D3 / D5 判定口径复刻）
npm run test:e2e       # 浏览器实机验收（48 项，真实 Chromium + 生产构建）
npm run test:audio     # 音频运行时验收（7 项，统计未捕获异常）
npm run verify         # build + 以上六项（退出码 0，正常退出不挂起）
```

自动化验收会自启临时静态服务器与 headless Chrome，**用完即关闭**，不占用 4329 端口、不留常驻进程。
详见 `QA.md`。

---

## 5. 视觉与文案

| 层面 | 说明 |
| --- | --- |
| 外壳层 | 顶栏 / 导航轨 / 按钮 / 面板 / 状态行 / 画布框统一到 **余晖设计系统（Afterglow DS v1.0）**，令牌取自 `16-design-system/design-tokens.json` 的深色组，在本目录 `src/styles/tokens.css` 独立落地（未复制 16 的文件） |
| 街机层 | **游戏画布内部保持本作品美术判断**：原创霓虹配色、5×7 点阵字库、CRT 扫描线 / 滚动亮带 / 暗角、画布边框辉光全部保留，未被平滑 webfont 或设计系统替换 |
| 强调色 | 全站唯一强调色为**朱砂**（`--ds-accent: #e0684a`）；页面背景为纯色，无网格纹 / 渐变图案 |
| 字体 | Space Grotesk / Inter / Space Mono / Noto Sans SC（子集）**全部本地自托管**，OFL 1.1，许可全文见 `LICENSES.md` 与 `fonts/`，**无任何 CDN** |
| 双语 | 中文 / English 全量文案，顶栏胶囊切换，`<html lang>` 同步、localStorage 持久化、`?lang=en` 深链 |
| 无障碍 | 跳转链接、焦点可见、面板焦点陷阱、`aria-current` 标注当前位置、`prefers-reduced-motion` 降级、`:lang(zh)` 中文排版规范 |
| 改版清单 | 逐选择器的替换对照见 `RESTYLE-INVENTORY.md` |

---

## 6. 目录结构

```
09-era-arcade/
├── index.html              # 外壳：舞台画布 + DOM 覆盖层 + 顶栏
├── package.json            # 唯一 devDependency: vite@5.4.11
├── vite.config.js          # base './'、host 127.0.0.1、port 4329、outDir dist
├── scripts/start.sh        # 一键启动开发服务器
├── public/favicon.svg      # 程序化绘制的霓虹图标
├── src/
│   ├── main.js             # 场景调度、暂停/结算、设置持久化、CRT、深链、双语、调试出口
│   ├── styles.css          # 外壳层 ds 组件 + 保留的街机层（.crt__* / 画布辉光）
│   ├── styles/
│   │   ├── tokens.css      # --ds-* 令牌唯一声明处（取自 design-tokens.json 深色组）
│   │   ├── fonts.css       # 自托管 @font-face（相对 URL，无 CDN）
│   │   └── fonts/          # 4 个 woff2（Space Grotesk / Inter / Space Mono ×2 / Noto SC 子集）
│   ├── i18n/
│   │   └── strings.js      # 中英 key 清单 + applyLang / detectLang / t / pick
│   ├── core/
│   │   ├── loop.js         # 固定 1/60 步长主循环 + rAF 节流兜底
│   │   ├── input.js        # 键盘别名 / 焦点门控 / 虚拟触控键
│   │   ├── audio.js        # WebAudio 合成音效 + 三段原创曲谱
│   │   ├── bitmapFont.js   # 手写 5×7 点阵字库 + 霓虹描边
│   │   ├── palette.js      # 原创霓虹配色 + 三档难度参数
│   │   ├── sprites.js      # 原创点阵造型
│   │   ├── rng.js          # mulberry32 确定性随机
│   │   └── storage.js      # localStorage 命名空间 + 高分榜
│   ├── hall/
│   │   ├── exhibits.js     # 4 台终端 + 8 条带来源的纪年 + 原创声明（中英双份）
│   │   └── hall.js         # 视差街廊场景、程序化街机柜、离屏预渲染
│   ├── games/
│   │   ├── lattice.js      # 晶格回廊：格心锁定移动、相位、残响、晶核、归途门
│   │   └── meteor.js       # 陨星纵队：三弹型、同色共振、余波弹、5 种编队
│   └── ui/
│       ├── panels.js       # 暂停 / 结算 / 设置 / 纪年 / 荣誉榜 / 帮助（中英）
│       └── touch.js        # 虚拟方向键与动作键
├── tests/
│   ├── logic.test.mjs      # 逻辑验收（32 项）
│   ├── token-consistency.mjs   # 令牌一致性（V.3 / V.4，对照 16 规范暗色组）+ 字体栈三项（V.11 / V.12 / V.13）
│   ├── ds-compliance.mjs   # 设计系统机械合规（V.1 / V.2 / V.5 / V.6 / V.7）
│   ├── probe-contract.mjs  # 13 探针契约自测（D3 / D5 口径）
│   ├── browser-smoke.mjs   # 浏览器实机验收（48 项，CDP 驱动真实 Chromium）
│   ├── audio-runtime-check.mjs  # 音频运行时验收（7 项）
│   └── lib/harness.mjs     # 共享夹具：CDP 客户端 / 静态服务器 / Chrome 启动 / 彻底收尾
├── fonts/                  # 4 份 OFL 1.1 许可全文（随包分发要求）
├── screenshots/            # 验收截图（01–06）
├── dist/                   # 生产构建产物（base './'，可直接部署）
├── manifest.json           # 交付元数据
├── SOURCES.md              # 纪年面板逐条来源与核验记录
├── LICENSES.md             # 许可与第三方组件声明（含 §3.1 自托管字体登记表）
├── RESTYLE-INVENTORY.md    # 改版待替换清单（选择器级对照）
├── STATUS.md               # 状态说明与本轮修复 / 改版记录
├── TASK.md                 # 任务立项与验收标准
└── QA.md                   # 验收记录与复现步骤
```

---

## 7. 技术约束与达成情况

| 约束 | 达成 |
| --- | --- |
| 纯静态、零运行时依赖 | ✅ `runtimeDependencies: []`，运行期只有原生 DOM/Canvas/WebAudio |
| 运行期零网络请求 | ✅ 无 CDN、无在线 API、无外链字体/图片/音频；E2E 断言「无失败的网络请求」 |
| 字体本地自托管、登记许可 | ✅ 4 款 OFL 字体随包分发，`LICENSES.md` §3.1 登记 + `fonts/` 存许可全文 |
| 兼容 GitHub Pages 子路径 | ✅ `base: './'`；`dist/` 内无绝对根路径引用（HTML `href="./assets/..."`、CSS `url(./xxx-hash.woff2)`） |
| 键盘仅在舞台获得焦点时生效 | ✅ 深度门控 + 状态栏提示「点击画面启用键盘」 |
| 支持触屏 | ✅ 虚拟按键层，粗指针设备默认显示 |
| 中英双语 + 无障碍 | ✅ 顶栏语言胶囊、`aria-current`、焦点陷阱、跳转链接、`prefers-reduced-motion` 降级 |
| 统一到 16 设计系统 | ✅ 外壳层套 `.ds-*` 组件，`--ds-*` 逐值对齐 `design-tokens.json` 深色组 |
| 保留街机美术判断 | ✅ 画布内配色 / 点阵字 / CRT 扫描线 / 霓虹辉光均未改 |
| 原创、不复制未授权资源 | ✅ 零第三方素材；纪年面板每条陈述附可核查来源链接 |
| 保留来源与许可 | ✅ `SOURCES.md`、`LICENSES.md` |

---

## 8. 交接

- **14-publish**：`dist/` 为最终产物；`npm run build` 可复现；`manifest.json` 字段齐备（`status: ready`）。
- **06-museum-core**：推荐 iframe 视口 960×720 以上；深链 `?game=lattice` / `?game=meteor`（可叠加 `?lang=en`）；
  键盘需用户先点击画面。
- **13-qa-curation**：可用 `?lang=en` 走英文路径复验；验收口径见 `QA.md` §9。
