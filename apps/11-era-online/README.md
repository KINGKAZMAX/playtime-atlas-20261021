# 《联机曙光 LINK DAWN》2000s 可玩展厅

> 任务 `11-era-online` · 展厅名「联机曙光 / LINK DAWN」 · 2000–2009 · PC · 掌机 · 联机

一个**纯静态、零运行时依赖**的年代展厅子站。包含两件完全原创的可玩展项，以及一份逐条挂来源链接的 2000 年代史料导览。

> **视觉语言**：按 `16-design-system`（余晖设计系统）接入 —— 令牌层 / 组件层 / 自托管 OFL 字体
> 以**逐字节拷贝**方式放在 `public/assets/ds/`（构建后落到 `dist/assets/ds/`），
> 外壳使用官方组件类（`.ds-topbar` / `.ds-footer` / `.ds-canvas-frame` / `.ds-skip` / `.ds-btn`）。
> 改版只换**视觉**，不改作品名、文案与玩法；两个展项**画布内部的配色**按红线保持原样（可玩性优先）。
> 逐项替换台账见 [`RESTYLE-INVENTORY.md`](./RESTYLE-INVENTORY.md)。
>
> **验收方式**：一律走 **Ego 浏览器**（`/Users/mekzenx2/.local/bin/ego-browser`）——
> 功能全量 53 项（`scripts/ego-acceptance.mjs`）、项目特有 40 项（`scripts/ego-verify.mjs`）、
> 通用体检用批次共享工具 `tools/ego-qa`。本目录不含 playwright / puppeteer / 无头 Chrome 路径。

---

## ⚑ 最重要的一件事：这是本地单机

- 页面内**没有任何联网对战功能**：没有服务器、没有真人匹配、没有账号登录。
- 展项 A 的对手「灰烬协议」是**由本机程序控制的 AI**，其面板上有常驻徽标「本机 AI · 非真人玩家 · 无联网」。
- 展项 B 全部内容在浏览器内离线运行。
- 本展厅所说的「联机」，指的是**该年代的历史主题**，不是本产品的运行方式。
- 年表里出现的「大规模多人在线」等词，是**对 2000 年代具体作品的历史描述**（附来源），页面在「史料与授权」区对此有专门澄清。

---

## 1. 两件可玩展项

### 展项 A —《灯塔协议 / BEACON PROTOCOL》微型策略防守

16×10 网格战场，两条航道，一座灯塔。

| 维度 | 内容 |
| --- | --- |
| 资源 | 「晶格 Σ」（击杀与过关获得，用于建造/升级）+「能量 Φ」（随时间回复，仅用于升级） |
| 建造 | 4 种塔：**脉冲塔 / 霜凝场 / 磁轨炮 / 谐振塔**，各有 3 级，数值、射程与索敌策略互不相同 |
| 效果类型 | 单体高射速、范围溅射+减速、远程重击、连锁+邻塔增伤 |
| 波次 | 18 波；第 6/12/18 波为精英/首领波；开局前可预览下一波构成；准备阶段倒计时归零会**自动开波**，控制条常驻提示「Ns 后自动开波」，也可随时按 `Space` 提前出击换取额外晶格 |
| 胜负 | 守住第 18 波 = 胜利；灯塔耐久归零 = 失败；两种结局都有结算面板 |
| AI 对手 | 「灰烬协议」走**灰烬航道**从另一方向施压，会读取你的灯塔耐久、储备与裂隙周边布防来选择编队（试探 / 渗透 / 重装 / 常规），突击前有倒计时预警并实时播报意图；突击走**独立时钟**，在准备阶段也会真正落地 |
| 难度 | 谨慎 / 标准 / 激进（改变 AI 资源增速、突击间隔与编队强度） |
| 暂停 | `P` / `Esc`；暂停时模拟完全冻结 |
| 存读档 | `localStorage`，含波次、资源、塔、难度、统计 |
| 速度 | 1× / 2× |
| 操作 | 鼠标点格建造；**触屏**点选塔种→点格；**键盘** `1-4` 选塔、`↑↓←→` 移光标、`Enter` 建造、`U` 升级、`X` 回收、`Space` 开波、`P` 暂停 |

### 展项 B —《口袋回声 / POCKET ECHO》掌机风冒险区域

原创掌机外壳（暮港青 + 琥珀，非任何厂商工业设计），双屏结构：上屏 160×144 点阵画面，下屏为可触摸交互区。

| 维度 | 内容 |
| --- | --- |
| 场景 | 3 个可探索区域：**渡口小镇 → 潮汐洞窟 → 灯塔顶台** |
| 目标 | 集齐 3 枚回声碎片 → 扳开灯闸 → 登上灯塔顶台 → 点亮灯芯 |
| 机关 | 灯闸未开时灯塔门锁死；洞窟内封房间需要绕行进入 |
| 危险 | 噬潮蟹在洞窟游荡，接触扣体力；体力耗尽回到小镇起点，碎片保留 |
| NPC | 3 位（守灯人 岑 / 拾遗者 岚 / 记录员 薇），对话里讲真实史实并**附来源角标** |
| 字体 | **本展厅自绘的 5×7 点阵字形表**（A–Z / 0–9 / 标点 / 方向符），非任何商业字库 |
| 暂停 / 存档 | `START` 打开菜单（继续 / 存档 / 读档 / 重置）；`localStorage` 存档 |
| 操作 | **触屏**外壳十字键 + A/B 键；**键盘** 方向键/WASD 移动、`Z`=A、`X`=B、`Enter`=START、`Esc`=暂停 |

---

## 2. 史料部分

- **导览**：6 段叙事（起点 / 服务平台化 / 大规模在线 / 掌机的双屏与触摸 / 免费化与共创 / 边界声明）。
- **年代年表 2000–2009**：逐年四栏（主机 / 掌机 / 联机服务 / 作品），每条陈述都挂来源角标。
- **硬件与服务展柜**：15 张卡片，**只使用文字**，不使用任何厂商 Logo、官方截图或受版权配图。
- **史料台账**：65 条来源逐条列出（标题 / URL / 分级 / 主题 / 核实日期），另有「引用 ≠ 授权」声明。
- **高亮全部来源角标**：一键开关，便于现场核对每条陈述的出处。
- 页面明示为**代表性选样，非编年全集**。

---

## 3. 运行方式

```bash
cd /Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/11-era-online

npm install        # 首次；仅 vite + typescript 两个 devDependency
npm run dev        # 开发模式  http://127.0.0.1:4331
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # 预览构建产物 http://127.0.0.1:4331
npm run start      # 一键：装依赖 → 构建 → 预览
```

- 端口固定 `127.0.0.1:4331`（dev 与 preview 同端口，`strictPort`）。
- `npm run build` 会先跑类型检查，**类型错误会直接导致构建失败**。
- 运行期**零 CDN、零在线 API、零外部字体/贴图请求**。

---

## 4. 集成方式

### 给 14-publish（部署）

- 构建：`npm ci && npm run build` → 产物目录 `dist/`。
- `vite.config.js` 中 `base: './'`，产物内所有资源引用均为**相对路径**（`./assets/...`），
  可直接放进 GitHub Pages 的**任意子路径**，无需改配置。
- 产物是纯静态文件，无服务端依赖、无环境变量、无运行时 API。
- 建议部署到仓库的 `11-era-online/` 子目录，对应 Pages 路径 `/<repo>/11-era-online/`。
- **必须保留 `dist/assets/ds/`**（16 的令牌层 / 组件层 / 自托管字体，含 5 份 OFL 许可全文）：
  页面通过 `<link>` 相对引用它，缺失会导致整体视觉与字体失效。
- `index.html` 内有唯一一处路径常量 `--ds-base: "/playtime-atlas-20261021/"`，
  指向本批指定的线上仓库前缀。**若实际仓库名不同，只需改这一处**；
  其余引用（`<link>` / `<script>` / CSS `url()`）均为相对路径，不受影响。

### 给 06-museum-core（主站嵌入）

- 可直接 `<iframe src=".../11-era-online/index.html">` 嵌入（相对路径，已适配子路径）。
- 嵌入时建议给 iframe 一个 `min-height: 720px` 与 `width: 100%`；子站自带完整页面外壳。
- 若主站希望复用**史料条目**（而不是嵌入整页），可直接读取本目录的两个数据模块：
  - `src/data/sources.ts` — 来源台账（`SOURCES` 数组，字段 `id/title/url/tier/topic/checked`）
  - `src/data/timeline.ts` — 年表与展柜（`TIMELINE` / `SHOWCASE` / `INTRO_PARAGRAPHS`）
  两者都是纯数据，不含 DOM 依赖，可直接转成 JSON 合入主站 catalog。

---

## 5. 目录结构

```
11-era-online/
├── index.html               入口（含 ds 资源 <link>、--ds-base、.ds-skip）
├── package.json / vite.config.js / tsconfig.json
├── public/
│   └── assets/ds/          16-design-system 原件拷贝（逐字节一致）
│       ├── tokens.css      令牌层（--ds-*，深色主题）
│       ├── components.css  组件层（.ds-topbar / .ds-footer / .ds-canvas-frame …）
│       └── fonts/          fonts.css + 5 款 woff2 + FONT-MANIFEST.json + OFL 许可全文
├── scripts/
│   ├── start.sh               一键启动（安装 → 构建 → 预览）
│   ├── ego-acceptance.mjs     **功能全量验收**（Ego 浏览器，53 项断言；原 acceptance.cjs 的逐项移植）
│   ├── run-ego-acceptance.mjs 功能全量验收的 CLI 包装器（普通 node 跑，转调 ego-browser）
│   ├── ego-verify.mjs         **项目特有验收**（Ego 浏览器，40 项：静态令牌判据 + DOM 判据 + 功能抽检）
│   └── run-ego-qa.mjs         批次共享工具 tools/ego-qa 的转调包装（并补上退出码判定）
├── src/
│   ├── main.ts              应用入口
│   ├── styles/
│   │   ├── base.css         语义别名层（--font-sans → --ds-font-text 等）+ 重置 + 通用组件
│   │   ├── shell.css        展厅外壳
│   │   ├── defense.css      展项 A 外壳（画布内部不动）
│   │   └── handheld.css     展项 B 外壳（掌机机身色板不动）
│   ├── core/                共享引擎
│   │   ├── loop.ts          固定步长主循环（暂停 / 倍速 / 后台挂起）
│   │   ├── input.ts         键盘 + 触屏虚拟键统一输入层
│   │   ├── storage.ts       带命名空间与降级的 localStorage 封装
│   │   ├── audio.ts         WebAudio 程序化音效（无音频文件）
│   │   ├── pixelFont.ts     原创 5×7 点阵字形表
│   │   ├── palette.ts       色板
│   │   ├── rng.ts           确定性随机
│   │   └── dom.ts           极简 DOM helper
│   ├── data/
│   │   ├── sources.ts       来源台账（单一数据源）
│   │   └── timeline.ts      年表 / 展柜 / 导览文案
│   ├── shell/               展厅外壳
│   │   ├── shell.ts         页面装配
│   │   └── heroCanvas.ts    程序化头部装饰画
│   ├── games/
│   │   ├── defense/         展项 A：types / config / sim / ai / render / view
│   │   └── handheld/        展项 B：world / sim / render / view
├── licenses/               字体许可全文（OFL 1.1）+ FONT-MANIFEST
├── evidence/ego-qa/         批次共享工具产出的报告 JSON + 四档视口截图
├── screenshots/             实机截图
├── QA.md                    验收记录
├── SOURCES.md               史料台账与抓取方法
├── LICENSES.md              资产许可与授权边界
├── RESTYLE-INVENTORY.md     改版「待替换清单」与落地台账
├── HANDOFF.md               给 06 / 14 的集成说明
├── manifest.json
├── TASK.md / STATUS.md
└── README.md
```

---

## 6. 原创性与授权

- 两件展项的**名称、世界观、角色、地图、规则、数值、美术、点阵字体、音效全部原创**，
  由程序化绘制与合成生成。
- **不含**任何 ROM、商业游戏素材、品牌 Logo、商标字体或第三方美术资源。
- 参考的是**公开可考的机制类型**（格子建造与升级循环、掌机双屏与点阵取景、在线服务的账号化形态），
  **不复制任何具体作品，也不声称原创任何参考作品**。
- 史料只做事实陈述 + 来源链接，**不复用**来源站点的图片、字体或商标。

详见 [`LICENSES.md`](./LICENSES.md) 与 [`SOURCES.md`](./SOURCES.md)。

---

## 7. 已知限制

1. 年表为**代表性选样**，不是 2000 年代的编年全集。
2. 史料以**厂商官网（一手）**与**维基百科（次级，用于交叉核对具体日期与首发地区）**为主；
   未逐项抓取的厂商视觉资料不作为事实依据。
3. 展项 A 的**完整通关**（18 波）需要玩家主动投入，验收时以白盒方式验证了胜负判定逻辑。
4. 展项 B 的地图为 20×18 格手工排布，属于**微型**探索区域，不是大地图。
5. 本任务**不部署**；上线由 `14-publish` 统一执行。
6. `public/assets/ds/` 是 16 设计系统的**人工拷贝**，未接构建期自动同步；
   16 后续更新令牌/组件/字体时需要重新拷贝并复跑验收。
7. 改版自检与 §9 规范复核只跑了 Chromium/Ego，未做 Firefox / Safari 实测。
8. 掌机 DOM 文字色 `--pocket-text: #b8848e` 属本批自定（在 `#9a6a74` 基础上同色相提亮，
   目的是满足 §4.2 的 HUD 文字 ≥4.5:1），**非参考站实测值**；机身色阶与画布点阵色板保持原值。
9. 验收**只走 Ego 浏览器**（用户长期约定）：功能全量 53/53（`ego-acceptance.mjs`）、
   项目特有 40/40（`ego-verify.mjs`）、批次共享工具 PASS（`tools/ego-qa`）。
   仓库里**没有** playwright / puppeteer / 本机无头 Chrome 路径。
