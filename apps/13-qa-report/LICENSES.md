# LICENSES — 13-qa-curation

> 适用范围：本目录（`13-qa-curation/`）内的一切产物。
> 本任务只做**验收与审计**，不生产作品；目录内除 harness 代码与报告文本外，
> 只有从本批自有作品截取的浏览器截图。

---

## 1. 原创产物清单（本任务全部产出）

| 产物 | 性质 | 许可 |
| --- | --- | --- |
| `TASK.md` / `STATUS.md` / `README.md` | 原创文档 | 随本批统一许可 |
| `QA-CHECKLIST.md` / `QA-MATRIX.md` / `DIFF-AUDIT.md` / `HANDOFF-14.md` | 原创验收报告 | 同上 |
| `issues.json` / `inventory.json` / `manifest.json` | 原创机器可读数据 | 同上 |
| `evidence/*.json` | 原创实测数据（构建日志、检查结论、控制台/网络记录） | 同上 |
| `screenshots/*.png` | 真实浏览器截图，**画面内容来自本批自有作品** | 同上 |
| `qa-harness/**`（`run-qa.mjs` / `build-reports.mjs` / `visual-review.mjs` / `lib/**`） | 原创验收代码 | 同上 |

本目录**不含**任何上游作品的源码副本、模型文件、字体文件或纹理素材 —— 构建一律在系统临时目录的副本中进行，
实现者目录全程只读。

---

## 2. 机制借鉴边界

本任务借鉴的是**公开的、可观察的工程机制**，不是任何作品的表达：

| 借鉴对象 | 借鉴的**机制** | 明确未借鉴的部分 |
| --- | --- | --- |
| GitHub Pages 子路径部署 | 「资源必须用相对路径、挂前缀后仍能解析」这一约束 | 不复制任何站点结构、文案或视觉 |
| W3C / WCAG 的可访问性通则 | 焦点可见性、`documentElement.lang` 同步、跳转链接 | 不引用任何第三方商标图标 |
| Playwright 官方文档 | `pageerror` / `requestfailed` / `elementsFromPoint` 等 API 用法 | 不复制任何示例项目代码 |
| DTCG（Design Tokens Community Group）规范 | `design-tokens.json` 的 `$value` / `$type` 结构与「令牌↔CSS 变量双向一致」的校验思路 | 不复制任何具体令牌集合 |

**本任务没有、也不会产出**：任何参考作品的名称、角色、情节、关卡数值、配色方案、字体搭配、图标造型或 3D 几何。
报告中的作品名称仅为**指认被测对象**所必需的描述性引用，不构成对原作的表达性复用。

---

## 3. 字体与第三方素材来源

| 依赖 | 版本 | 许可 | 说明 |
| --- | --- | --- | --- |
| `playwright-core` | 1.64.1（见 `qa-harness/package.json`） | Apache-2.0 | **仅 devDependency**；不下载浏览器，复用本机 `~/Library/Caches/ms-playwright/chromium-1248` |
| Chromium（Google Chrome for Testing） | 156.0.8078.4 | BSD-3-Clause | **仅运行时**，不随本目录分发、不打包进交付物 |
| Google Chrome（部分上游工具使用） | 155.x | 专有许可 | 仅作为上游自校验脚本的宿主，**不由本任务分发** |

**本目录不携带任何字体文件**。报告与截图中的文字使用系统字体渲染。

**截图中的第三方内容**：截图取自本批自有作品（00—12、16—19）。
若某件作品画面中出现了第三方品牌标识、罗马数字或史料照片，那属于**该作品**的既定内容与史料陈述，
由该作品自己的 `LICENSES.md` / `SOURCES.md` 负责标注与来源交代；
13-qa-curation **不对这些内容做再许可声明**，只如实记录其存在与否。

---

## 4. 署名规则

- 报告中的**事实性引用**（作品名、文件名、目录结构、官方网址、史实条目）一律采用「仓库/目录 + 文件名」的最小必要形式，
  并保留可点击链接（如 `evidence/02-model.json`、`../14-publish/release/works.json`）。
- **不声称**任何第三方作品为本次产出的原创；引用仅用于说明「被测对象是谁」「机制从哪来」。
- 对上游实现者**不署名个人荣誉、不做排名**，只陈述可复现的观测结果与证据路径。
- 发现问题时**只陈述现象与证据**，不对实现者的能力或态度作评价；检测器口径问题一律标注为
  「检测器假阳性」并单列，不转嫁到作者头上。

---

## 5. `evidence/` 目录内的参考站观察证据 —— **不随交付物发布**

`13-qa-curation/evidence/` 下的证据来自一次**受控的线上抽验**（对 GitHub Pages 线上 URL 的加载、控制台、
网络与视口检查），以及 `16-design-system` 自带的「参考站取证」产物。

- 这些记录**只用于判定「某项声明是否被事实支持」**，属于**观察记录**，不是可再分发的内容；
- 其中可能包含参考站的 URL、页面片段与结构描述 —— 这些是**事实性观察**，不构成对其内容的再许可；
- 因此 `evidence/` **不进入任何面向公众的发布目录**。`14-publish` 的 `works.json` 已将 13 的报告页设为
  `publish: false`，并由 `build-catalog-page.mjs` / `build-qa-page.mjs` 默认不产出线上页面；
- 交付与审阅请直接使用本目录内的 `QA-MATRIX.md` / `issues.json` / `DIFF-AUDIT.md` / `STATUS.md`，
  **不要**把 `evidence/` 原样搬进站点。

---

## 6. 第三方组件清单（完整）

| 组件 | 来源 | 许可 | 是否随交付物分发 |
| --- | --- | --- | --- |
| `playwright-core` | npm `playwright-core@1.64.1` | Apache-2.0 | 否（仅 devDependency） |
| Node.js 内置模块（`node:fs` / `node:path` / `node:http` 等） | Node.js v24.13.0 | MIT | 否（运行时） |
| Chromium（浏览器二进制） | 本机 playwright 缓存 | BSD-3-Clause | 否 |

无其它第三方组件。无 Copilot / AI 生成代码的许可归属问题（全部产出由 MiniMax Code M3.1-Flash 生成）。

---

*本文件随本任务的最终一轮全量实测更新。若目录内容发生变化（新增依赖、引入外部素材），必须同步修订本文件。*
