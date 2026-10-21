# 构筑华夏 · 结构与故事
# Built in China — Structures & Stories

> 一个双语（英文默认 / 中英可切）的中国传统建筑科普站：区域探索地图、年代轴、42 例代表性建筑、6 个可拆解的三维结构实验室、74 条双语术语，以及一套来源可查的测验。
> A bilingual (English by default) explainer on traditional Chinese architecture: a region map, an era timeline, 42 representative buildings, six explorable 3D structural labs, 74 glossary terms, and a quiz whose every answer is sourced.

**教学示意，非施工/工程模型。剖面、受力箭头与三维几何均为程序化生成，用于说明构造逻辑与传力路径，不构成测绘成果或工程依据。**
**Teaching illustration — not a construction or engineering model. Sections, force arrows and 3D geometry are code-generated schematics that explain structural logic and load paths; they are not measured surveys and are not a basis for construction or engineering.**

---

## 快速开始 · Quick start

```bash
npm install          # 只装 vite 与 three
npm run dev          # 开发服务器 http://127.0.0.1:4183
npm run build        # 产出 dist/（静态、可直接部署）
npm run validate     # 静态校验（数据 / 交叉引用 / 双语 / 卫生 / 构建产物）
npm run qa           # 校验 + 真实浏览器运行时自检
```

| 命令 | 作用 | 退出码 |
| --- | --- | --- |
| `node scripts/validate.mjs` | 静态校验：目录完整性、案例↔实验室↔术语交叉引用、6 件模型真实构建、双语机械校验、零外部请求、构建产物结构 | 0 = 全通过，1 = 有失败项 |
| `node scripts/qa-runtime.mjs` | 真实浏览器（ego-browser）三轮运行时自检：桌面 1440、移动 390、reduced-motion | 0 = 全通过，1 = 有失败项 |
| `node scripts/run-ego.mjs scripts/ego/diagnose.mjs` | 布局与焦点诊断：找出超宽元素、逐个验证可聚焦元素是否真有可见焦点环 | 0 = 无溢出且焦点环齐全 |
| `node scripts/sync-ds-tokens.mjs [--check]` | 从 16-design-system 重新生成 `--ds-*` 令牌层与 `.ds-*` 组件类 | 0 = 一致 |
| `node scripts/gen-labs-meta.mjs` | 从 18-architecture-models 重新生成 `src/data/labs-meta.js` | 0 = 成功 |

> 全部校验脚本都以**退出码**表达结论，报告同时落盘到 `evidence/`。13-qa-curation 可直接引用 `evidence/qa/qa-runtime.json` 与 `evidence/layout/layout-diagnostics.json`。
> Every script reports through its **exit code** and also writes a machine-readable report under `evidence/`.

---

## 功能索引 · What's in it

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `#/` | 首页 | 英雄区、区域地图、年代轴、建筑目录三段式 |
| `#/catalog` | 建筑目录 | 42 例，按构造类型 / 地域 / 时代筛选 + 关键词搜索 |
| `#/case/<id>` | 案例详情 | 结构原理、文化背景、基本信息、来源清单、程序化线稿图、相关实验室与术语 |
| `#/labs` | 实验室索引 | 6 件模型的可拆解入口 |
| `#/lab/<id>` | 结构实验室 | 旋转 / 缩放 / 选中 / 爆炸 / 分步组装 / 剖切 / 层级开关 / 受力示意 / GLB 导出 |
| `#/glossary` | 术语表 | 74 条，中文 + 拼音 + 英文 + 一句白话 + 常见误用 + 相关案例 |
| `#/quiz` | 测验 | 10 题，答完给分，成绩只存本机 |
| `#/saved` | 收藏 | 存在 localStorage，不上传任何服务器 |
| `#/sources` | 来源与许可 | 逐条来源、声明边界、技术说明、许可 |

### 三维实验室 · The six labs

| id | 中文 | English | 构件数 |
| --- | --- | --- | --- |
| `dougong` | 斗栱组 | Dougong Bracket Set | 16 |
| `mortise` | 榫卯连接 | Mortise & Tenon Joints | 9 |
| `taoliang` | 抬梁木架 | Post-and-Beam Frame | 18 |
| `chuandou` | 穿斗木架 | Column-and-Tie Frame | 15 |
| `stone-arch` | 敞肩石拱桥 | Open-Shoulder Stone Arch Bridge | 17 |
| `tulou` | 土楼 · 院落结构 | Tulou & Courtyard Section | 19 |

WebGL 不可用时，实验室会**用同一份几何**生成 2D SVG 示意剖面——不是另画一张假图：构件、层级、传力路径与 3D 视图完全一致。

---

## 双语约定 · Bilingual conventions

- **默认英文。** 首次访问一律英文界面；没有 `?lang=`、没有本地偏好时都是英文。
- **切换可记忆。** 顶栏 `中文 / EN` 的选择写入 `localStorage`（键 `built-in-china:v1`），下次访问沿用。
- **深链接带语言。** URL 形如 `index.html?lang=zh#/case/c01-nanchan-main-hall`。`?lang=` 决定**本次访问**的语言，但**不会**覆盖访客自己保存的偏好——别人发给你的链接不会把你的默认语言改掉。
- **`<html lang>` 同步。** 切换语言时 `document.documentElement.lang` 在 `en` / `zh-Hans` 之间同步更新，并写入 `data-lang`。
- **动态内容一起切换。** 筛选 chip、卡片标签、时间轴、地图图例、测验选项、术语表分类、抽屉内容全部随语言重建，不是只换静态标签。中文名与英文名都出现在需要指名的位置（建筑名、构件名），这是内容本身的双语属性，不是漏翻。

### 机械校验 · The mechanical check

`scripts/validate.mjs` 的 **5b 节**做 6 条双语判定，13-qa-curation 可直接引用：

| 检查 | 结论含义 |
| --- | --- |
| `bilingual.everyKeyHasBothLanguages` | 每个 i18n 键两种语言都非空 |
| `bilingual.englishSideHasNoChinese` | 英文侧不含任何汉字（抓「中文串直接当英文用」） |
| `bilingual.dataEnglishSideHasNoChinese` | 数据层英文字段不含汉字 |
| `bilingual.noHardcodedChineseInRenderLayer` | 渲染层没有硬编码中文文案 |
| `bilingual.defaultIsEnglish` / `bilingual.htmlLangIsSynced` / `bilingual.deepLinkCarriesLanguage` | 默认英文、`<html lang>` 同步、深链接带语言 |
| `bilingual.everyRecordHasBothLanguages` | 42 案例 / 74 术语 / 6 实验室的每条记录都有双语 |

---

## 目录结构 · Layout

```
19-architecture-atlas/
├── index.html                  入口（相对路径引用，适配 Pages 子路径）
├── manifest.json               交付清单（14-publish 按此契约集成）
├── README.md / LICENSES.md / SOURCES.md / QA.md / STATUS.md / REFERENCE-AUDIT.md
├── public/fonts/               5 份自托管 OFL 字体 + 4 份许可全文 + 字体清单
├── src/
│   ├── main.js                 外壳：顶栏、索引轨、hash 路由、语言、页脚、toast
│   ├── qa.js                   页面内自检（仅 ?qa=1 时动态载入，不进生产包）
│   ├── core/                   dom / store / i18n / filters
│   ├── data/                   数据层
│   │   ├── upstream/           ← 17 的 catalog / glossary / meta（逐字节 vendor）
│   │   ├── taxonomy.js         ← 17 的地域/时代/构造词表 + 自绘示意地图
│   │   ├── catalog.js          适配器：42 例
│   │   ├── enrichment.js       本项目补全：坐标 + 英文
│   │   ├── glossary.js         适配器：74 条
│   │   ├── labs-meta.js        ← 由 18 的模型生成（构建期，不含 three）
│   │   └── labs.js / quiz.js
│   ├── lab/core/  lab/models/  ← 18 的统一模型运行时与 6 件模型（逐字节 vendor）
│   ├── views/                  10 个视图
│   ├── art/schematic.js        程序化 SVG 线稿
│   └── styles/                 tokens.css（16 生成）/ components.css（16 生成）/ app.css
├── scripts/                    validate / qa-runtime / run-ego / sync-ds-tokens / gen-labs-meta / ego/
└── research/_QUARANTINE__/     参考站观察证据（隔离区，不进产物、不进仓库）
```

---

## 与 17 / 18 / 16 的交接关系 · Handoff

```
16-design-system  ──(design-tokens.json + MIGRATION-NOTES §1.1/§2.5)──▶  令牌层 + 组件类
17-architecture-research ──(catalog.json / glossary.json / catalog.meta.json)──▶  数据层
18-architecture-models ──(src/core + src/models + 统一模型契约)──▶  三维层
                                    │
                                    ▼
                        19-architecture-atlas（本站）
```

**数据层（17 → 19）**：17 的 `catalog.json`（42 例）、`glossary.json`（74 条）、`catalog.meta.json`（地域/时代/构造词表）**逐字节 vendor** 进 `src/data/upstream/`。19 只做**适配**，不重写数据：
- 目录的年代多口径（「始建 / 重修 / 现存」）与年代存疑词，由适配器解析成 `yearUncertainty`；
- 来源的 `evidenceLevel` 映射成 primary / secondary；
- 案例 ↔ 实验室、案例 ↔ 术语的关联由适配器从上游词表反查；
- 17 只给中文的 `yearText / caveat / type / ethnicGroup`，由 19 的 `src/data/enrichment.js` 补英文；
- 17 的目录**不含坐标**，坐标同样由 `enrichment.js` 补，并用第二套地名库（OpenStreetMap Nominatim）逐条复核，修正了 10 处（详见该文件头部）。

**三维层（18 → 19）**：**直接消费**，不是并列实现。19 vendor 18 的 `src/core/{model-api,geo,materials,viewer,fallback,glb}.js` 与 `src/models/*.js`，用 18 的 `Viewer` 驱动，遵守 18 的统一模型契约 v1.1。`scripts/validate.mjs` 会校验两份副本**逐字节一致**，防止有人就地改动 vendor 文件。2D 降级也调用 18 的 `renderFallbackSVG()`——**同一份几何**画出的示意图，不是另画的假图。19 自有的 `src/art/schematic.js` 是案例页的轻量线稿插画层，与 18 的模型体系是两种东西，两侧文档均已声明。

**令牌层（16 → 19）**：按 16 的 MIGRATION-NOTES §1.1 路径 A/B 落地——`scripts/sync-ds-tokens.mjs` 只**读** 16 的 `design-tokens.json` 与 `src/tokens.css`，把取值写进本目录 `src/styles/tokens.css` 的哨兵生成区，把 `.ds-*` 组件类写进 `src/styles/components.css`。19 不写 16 的任何文件；`--ds-*` 在本目录**只声明一次**，本地变量层只写语义别名（§0 风险 B）。`--check` 是幂等校验。

---

## 数据来源与声明边界 · Sources and limits

- **每条事实都指向可核验的公开出处**，没有出处的说法不写。逐条来源见 `SOURCES.md` 与站内 `#/sources`。
- **这是一个代表性样本，不是全部中国古建筑的完整名录。** 覆盖 8 地域、10 时代、19 类构造特征。
- **年代按「始建 / 重修 / 现存」多口径记录**，存在多处争议，逐条标注，不用单一年份冒充断代。
- **剖面、受力箭头与三维模型都是教学示意。** 受力箭头表示**传力方向**，不表示大小，也不是结构计算结果。
- **坐标是示意地图的参考点**，精度约 0.1°，不是测绘数据。

---

## 部署 · Deployment

- 产物是**纯静态**的 `dist/`：HTML + CSS + 原生 ES 模块。
- `vite.config.js` 用 `base: './'` + hash 路由，因此可以直接部署在任意子路径（如 `/playtime-atlas-20261021/works/19-architecture-atlas/`），不需要服务端重写。
- **零 CDN、零外网字体、零外部 API、零追踪**：页面不发起任何跨域请求，字体自托管，三维几何全部在运行时程序化生成。
- three.js 单独成块（`dist/assets/three-*.js`），**首屏不加载**；六件模型各自独立成块，进入哪个实验室只加载那一个。

```bash
npm run build
# → dist/index.html + dist/assets/* + dist/fonts/*
```

---

## 无障碍与降级 · Accessibility and fallbacks

- 跳转链接、`main` 地标、完整的 ARIA 标注、键盘可达的地图热点。
- **焦点环可见**：可聚焦元素使用 16 的 `--ds-focus-ring`（`0 0 0 2px var(--ds-bg), 0 0 0 4px var(--ds-accent)`）。`scripts/ego/diagnose.mjs` 用真实键盘 Tab 遍历逐个验证，桌面与移动端均为零缺失。
- **减少动态效果**：`prefers-reduced-motion: reduce` 下停用过渡与自动播放，交互全部保留。
- **无 WebGL**：实验室降级为 2D 示意剖面（同一份几何派生），并给出说明文字。
- **移动端 390×844**：页面级无横向滚动（`scrollWidth === clientWidth`），不靠 `overflow-x: hidden` 掩盖。

---

## 许可 · Licence

代码 MIT。全部插图、示意图与三维模型由本项目代码程序化生成。字体为 SIL OFL 1.1 自托管。详见 `LICENSES.md`。
Code is MIT. Every illustration, diagram and 3D model is generated by this project's own code. Fonts are self-hosted under the SIL OFL 1.1. See `LICENSES.md`.
