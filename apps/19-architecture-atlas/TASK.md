# TASK — 19-architecture-atlas：构筑华夏 / Built in China

> 负责人：MiniMax Code（M3.1-Flash / max）。Codex 只调度。本目录是**唯一写入者**。
> 起始：2026-10-21 18:59 (GMT+8, 台北)

---

## 0. 角色边界（不可越界）

| 项 | 决定 | 理由 |
| --- | --- | --- |
| 目录写入 | **仅 `19-architecture-atlas/`** | 每目录单一作者；15-supervisor 负责路由 |
| 其他目录 | **只读**（读 `16/` `17/` `18/` `14-publish/release/` 契约） | 不与原作者并改 |
| GitHub | **不建仓、不 push、不部署** | 唯一发布者 = `14-publish` |
| 运行期服务 | 完工后关闭本目录自起的本地预览 | 批次收口要求 |

## 1. 目标

面向全球读者（默认英文、可切中文）的中國传统建筑**双语科普主站**：

1. **中国区域探索地图** —— 程序化 SVG 地图，地域热点可点选，联动筛选。
2. **年代轴** —— 从先秦到当代的分代时间轴，横向可拖动，与类型/地域筛选联动。
3. **类型筛选** —— 宫殿、寺塔、园林、民居、桥梁、陵墓、防御、聚落等多类。
4. **案例详情** —— 深链接（`#/case/<id>`）可分享的完整条目。
5. **六个 3D 拆解实验室** —— 斗栱、榫卯、抬梁、穿斗、石拱桥、土楼/院落。
6. **双语术语与拼音解释** —— ≥40 条，中/英/拼音/通俗解释。
7. **小测验 + 收藏** —— 测验即时反馈；收藏本地持久化。

**内容基准**：36 例代表性建筑目录（覆盖主要地域、时代、类型，不声称穷尽）。

## 2. 硬性约束（来自 PROMPT.md 与 MASTER-UPDATE.md）

| 约束 | 落地方式 |
| --- | --- |
| 只写本目录 | 全部产物在 `19-architecture-atlas/` |
| 14-publish 唯一发布者 | 产出 `dist/` 可静态构建产物 + `manifest.json`，**不**建仓、**不** push |
| 必须实测参考站 | 已用内置 Browser 实访 `https://olek.si`，存 3 张截图 + 原始 HTML/JS 包，见 `REFERENCE-AUDIT.md` |
| 不臆造参考站 | 直接观察与二手证据分栏标注；取不到的写「未核验」 |
| 原创改编 | 作品名/文案/内容/字体/配色/布局/模型形态全部重新设计；**只借鉴可观察的交互机制**（分区调性反转、索引栏、圆角morph 等），不搬运任何图片/字体/Logo/文案 |
| 资源本地化 | 零 CDN、零外网字体、零外部 API；字体走系统栈；配图全部程序化生成 SVG |
| Pages 子路径 | `vite.config.js` 设 `base: './'`，所有资源相对路径 |
| 中英无障碍 | 全部交互元素具名；`lang` 随语言切换；焦点可见；对比度 ≥ 4.5:1 |
| reduced-motion | `@media (prefers-reduced-motion: reduce)` 全局关闭非必要动效 |
| 移动端 + 2D 降级 | 响应式；WebGL 不可用时实验室降级为 2D SVG 剖面图 |
| 深链接 | hash 路由，案例/实验室/术语/测验均可直链分享 |
| 性能分级 | 3D 实验室按需 `import()` 懒加载；首屏不加载 Three.js |
| 示意边界 | 所有 3D/剖面/受力说明显著标注「教学示意，非施工/工程模型」；受力箭头为定性说明 |
| 不设假按钮 | 未实现的功能不出现入口 |

## 3. 验收标准

| # | 判据 | 证据 |
| --- | --- | --- |
| A1 | 参考站**直接观测**记录：URL + 时间戳 + ≥1 截图 | `REFERENCE-AUDIT.md` + `research/olek-si/*.png` |
| A2 | 目录 ≥36 例，覆盖 ≥12 类构造，每例含一次来源 | `src/data/catalog.js` + `scripts/validate.mjs` |
| A3 | 术语 ≥40 条，zh/en/pinyin 齐全 | `src/data/glossary.js` |
| A4 | 地图 + 年代轴 + 类型筛选三路筛选可组合 | 手工 + 脚本断言 |
| A5 | 案例详情深链接刷新后仍可还原 | 浏览器实测 |
| A6 | 6 个实验室均可旋转/缩放/选中/爆炸/组装/剖切/层级/受力 | `evidence/labs-*.json` + 截图 |
| A7 | 测验可答可判分；收藏刷新后仍在 | 浏览器实测 |
| A8 | 零外网请求（构建产物 0 个 CDN/外链域名） | `scripts/validate.mjs` 外链扫描 |
| A9 | 中英切换全站覆盖 + 拼音 + 无障碍名称 | 浏览器实测 + 脚本 |
| A10 | reduced-motion 生效 | 浏览器实测 |
| A11 | WebGL 不可用 → 2D SVG 降级可见 | 浏览器实测（禁 WebGL） |
| A12 | `npm run build` 产出 `dist/`，`manifest.json` 字段齐全 | `dist/` + `manifest.json` |
| A13 | 移动端（390px）布局不破 | 截图 |
| A14 | README / SOURCES / LICENSES / QA 齐全，未核验项如实标注 | 文档 |

## 4. 与上游任务的关系

| 上游 | 消费方式 | 现状 |
| --- | --- | --- |
| `17-architecture-research` | `catalog.json` / `glossary.json` / `INTERACTION-BRIEF.md` | **S2 进行中，尚未产出** → 19 自建同构数据并预留合并接口（`src/data/*.js` 单一出口） |
| `18-architecture-models` | 6 件 3D 教学模型 | **仅有 TASK.md，模型未产出** → 19 自建 6 个程序化实验室，采用**统一模型接口**，18 交付后可整包替换（`src/lab/builders/`） |
| `16-design-system` | olek.si 实测规范 | **仅 STATUS/TASK，DESIGN-SPEC 未产出** → 19 用自己的一手实测（`REFERENCE-AUDIT.md`）定义令牌，并把令牌集中在 `src/styles/tokens.css` 便于 16 后续对齐 |
| `14-publish` | GitHub + Pages 上线 | 唯一发布者；19 只提供 `dist/` + `manifest.json` |

> **诚实声明**：17/18/16 交付物在本任务开工时**尚未存在**。19 不假装已合并它们，而是自建等价数据、在代码中留出替换点，并在 `STATUS.md` 记录待合并项。

## 5. 计划（持续执行，不停在计划）

- **P1** 取证 olek.si（已完成，实访 + 3 截图 + 原始包）→ **P2** 写 `TASK.md`/`STATUS.md`/`REFERENCE-AUDIT.md`
- **P3** 设计令牌 + 站点骨架 + i18n + 路由 → **P4** 内容（36 例 / 术语 / 测验）
- **P5** 地图 + 年代轴 + 目录 + 详情 → **P6** 实验室运行时 + 6  builders
- **P7** 测验 + 收藏 + 术语 → **P8** 程序化美术整合
- **P9** 无障碍 / reduced-motion / 移动端 / 2D 降级验证 → **P10** 构建 + QA 脚本 + 实玩截图
- **P11** README / manifest / SOURCES / LICENSES / QA → **P12** 交 14-publish 集成包

## 6. 已知风险

| 风险 | 缓解 |
| --- | --- |
| 17/18/16 未交付，无法真正"整合" | 自建同构数据 + 单一出口文件（`src/data/index.js`），18/17 到位后替换即可，README 写明 |
| Three.js 体积影响首屏 | 实验室视图 `import()` 懒加载，首屏零 3D 依赖 |
| WebGL 在部分环境不可用 | 每实验室配 2D SVG 降级图（程序化生成），自动切换 |
| 配图版权 | 全部程序化 SVG 线稿，不使用任何照片；案例配图标注为「示意线稿，非测绘图」 |
| 建筑年代多歧义 | 每例带 `yearText`（含不确定性措辞）+ `yearUncertainty` 字段 |
| GitHub Pages 子路径 | `base: './'` + 相对路径 + 路由用 hash（不用 History API） |
