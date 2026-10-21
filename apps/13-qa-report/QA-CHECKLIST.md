# QA-CHECKLIST — 全作品验收清单

> 依据：`PROMPT.md` 第 7 段 + `MASTER-UPDATE.md`。
> 状态标记：`✅ pass` / `❌ fail` / `⚠️ warn` / `➖ skip(有理由)` / `⛔ not-delivered` / `⬜ 未测`
> 最后更新：2026-10-21

---

## 通用判定口径（先读这一节）

| 规则 | 说明 |
| --- | --- |
| **没测 ≠ 通过** | 目录为空、无法构建、探针未执行 → 一律 `⛔ not-delivered` / `🔄 in-progress`，不写 ✅ |
| **浏览器实测优先** | 只有在真实 Chromium 里加载并交互过的项才可判 ✅；读源码得出的结论记为「静态审计」，不混入浏览器维度 |
| **构建产物口径** | 验的是 `npm run build` 后的 `dist/`，不是 `dev` 服务器。后者会掩盖静态资源缺失 |
| **构建隔离** | 构建在系统临时目录的副本中进行，实现者目录零写入（`node_modules` 用符号链接复用） |
| **子路径口径** | 站点挂在 `/repo/exhibits/<id>/` 前缀下访问，全部资源仍须可解析（GitHub Pages 真实形态） |
| **不修改他人文件** | 所有复测在临时副本中进行；修复建议只写在本目录 |
| **命中必须看图** | D1 文字压盖类命中一律用 `qa-harness/visual-review.mjs` 裁剪命中区域截图逐条复核；**只有截图证明文字互相叠印不可读，才算缺陷** |
| **检测器口径三原则** | ① 折叠内容（`content-visibility:hidden` / `overflow:hidden` 裁掉的行）不参与判定；② 祖先 `opacity:0` 的内容不参与判定；③ 测量前冻结 CSS 过渡与动画，避免测到动画中间态 |
| **快照一致性** | 报告给出每件作品「验收时刻」与「产品源码最后修改时刻」；上游仍在改动时，结论只对验收时刻成立 |

## 交付物完整性（manifest 声明 × 磁盘实况）

| 任务 | manifest.json | 声明的文档是否都存在 | 结论 |
| --- | --- | --- | --- |
| 00-research | ✅ | ✅（ACCEPTANCE.md 已补齐） | 完整 |
| 01-web | ✅ | ✅ | 完整 |
| 02-model | ✅ | ✅（CHANGELOG.md / README.md 已补齐） | 完整 |
| 03-interaction | ✅ | ✅（STATUS.md / README.md / QA.md 已补齐） | 完整 |
| 04-spaceflight | ✅ | ✅（QA.md 已补齐，命名不一致已修） | 完整 |
| 05-museum-research | ✅ | ✅ | 完整 |
| 06-museum-core | ✅ | ✅（manifest 未声明 QA.md，不构成不一致） | 完整 |
| 07-museum-art | ✅ | ✅ | 完整 |
| 08-era-origins | ✅ | ✅（QA.md 已补齐） | 完整 |
| 09-era-arcade | ✅ | ✅（STATUS.md / QA.md 已补齐） | 完整 |
| 10-era-console | ✅ | ✅（`QA.md` 已补齐，manifest 与磁盘重新对齐） | 完整 |
| 11-era-online | ✅ | ✅ | 完整 |
| 12-era-modern | ✅ | ✅ | 完整 |

---

## D1 — 桌面端 1440×900

- [ ] 页面正常渲染，非白屏
- [ ] 无页面级横向滚动条
- [ ] 主要面板不重叠、不塌陷
- [ ] 关键文字可读（对比度、字号）
- [ ] 控制台零 error

## D2 — 移动端 390×844

- [ ] 页面正常渲染
- [ ] 无页面级横向滚动条
- [ ] 触控目标可点击（≥ 40px 建议值）
- [ ] 文字不被压成逐字换行
- [ ] 元素不溢出视口被裁切
- [ ] 控件在拇指可达区域

## D3 — 开始 / 暂停 / 重置

- [ ] 存在真实的开始流程（不是装饰按钮）
- [ ] 暂停确实冻结状态机（不是仅隐藏 UI）
- [ ] 重置回到初始状态且有反馈
- [ ] 重复操作不崩、不卡死

## D4 — 存档

- [ ] 写入 localStorage（或同等持久层）
- [ ] 刷新后仍能读回
- [ ] 存档内容可解析、不写坏
- [ ] 版本不匹配时安全降级

## D5 — 键盘焦点

- [ ] Tab 可移动焦点
- [ ] 焦点样式可见（outline / box-shadow）
- [ ] **游戏内键盘仅在游戏区获得焦点时生效**（不得劫持表单输入）
- [ ] 不存在焦点陷阱

## D6 — 控制台错误

- [ ] 零 `console.error`
- [ ] 零 uncaught exception / unhandled rejection
- [ ] 无重复报错刷屏

## D7 — 资源 404

- [ ] 图片 / 字体 / 模型 / 音频 / 脚本全部 200
- [ ] 无 requestfailed
- [ ] 构建产物包含全部声明的静态资源（`public/` 之外的目录默认不会被 Vite 复制，需确认）

## D8 — 页面子路径

- [ ] 以 `/repo/exhibits/<id>/` 前缀访问可用
- [ ] 相对资源路径全部解析成功
- [ ] 无绝对路径 `/assets/...` 残留
- [ ] `base` 配置与部署形态一致

## D9 — 模型导出（3D 作品适用）

- [ ] 导出按钮产生真实文件
- [ ] 文件非空且体积合理
- [ ] GLB 容器头合法（magic = `glTF`，header 长度 = 实际长度）
- [ ] 随包模型资源在构建产物中可访问

## D10 — 原创差异

- [ ] 作品名非直接沿用参考作品
- [ ] 文案 / 字体 / 配色 / 布局有实质差异
- [ ] 模型形态与参考作品不同
- [ ] 无第三方品牌 logo
- [ ] 未复制商业 ROM / 受版权素材

## D11 — 来源与许可

- [ ] 史料条目附来源 URL
- [ ] 素材许可明确（自研 / 开源 / 公有领域）
- [ ] 不宣称穷尽全部作品
- [ ] AI 对手 / 多人特性如实标注

## D12 — 交付完整性

- [ ] `README.md`
- [ ] `manifest.json`：`id / title / description / entry / buildCommand / outputDir / status`
- [ ] 验收记录（本目录 evidence 已覆盖）
- [ ] 来源与资产许可说明
- [ ] 可静态构建（`npm run build` 成功）

---

# 逐作品清单

> 逐维度的**实时结论**以 `QA-MATRIX.md` 为准（由 `evidence/` 自动生成）。
> 本节只保留每件作品的**协议级状态**与需要人工复核的项。

| 任务 | 作品 | 协议级状态 | 必测重点（来自该任务的 PROMPT） | 结论摘要 |
| --- | --- | --- | --- | --- |
| 00-research | M3.1 Flash 全球公开案例索引 | ✅ 已交付 | 区分正式版/Preview/其他模型；不捏造互动数字与「全网第一」 | 134 条逐条带来源与归属证据；8 条正确排除出 M3.1 归属；23 条指标不可见者明确标注；零编造数字。**通过** |
| 01-web | CHROMA S1 · 千色仪 | ✅ 已交付 | 真实交互、状态保存、响应式 | 零控制台错误、零 404、子路径全通。**此前移动端「ΔE00」压住操作提示的真实叠印已由上游修复并复测关闭**（`p.stage__hint` 改为进入文档流），桌面/移动均未发现文字互相压盖 → **pass** |
| 02-model | 渊甲拾遗者 AC-VII | ✅ 已交付 | 真实 3D 几何、可导出模型 | 程序化几何 548 网格 / 104k 三角面；GLB 导出合法且随包模型可取用（路径**自动发现**，不硬编码）。**缺陷（遮挡型，非叠印）**：桌面 3 处 + 移动 2 处被右侧剖面卡片/底部固定页脚盖住 —— 工具栏当前选中项的中文标签「标注」、卡片英文副标题、移动端操作提示**用户根本看不到**；移动端节律表溢出视口 2626px → **fail** |
| 03-interaction | 织造车间调度台 · LOOMDECK | ✅ 已交付 | 真实交互、状态保存、响应式 | 构建通过、零控制台错误、字体与子路径全通。`state` 状态机完整暴露（running/paused/idle）、难度可切、存档键写入；**此前移动端逐字换行已修复** → **pass（28 项 0 失败 0 警告）** |
| 04-spaceflight | 深空漫游 · Deep Space Drifter | ✅ 已交付 | 驾驶舱、6 自由度、跃迁、扫描、停靠 | 游戏可启动、零控制台错误、设置与发现记录写入 localStorage 且刷新后存活。**Tab 焦点问题已修复**（移出 preventDefault + 焦点作用域判断），本轮新增专项回归断言：Tab 可移动焦点且不会被误开成星图 |
| 05-museum-research | 博物馆策展目录 | ✅ 已交付 | ≥8 个真实站点、≥70 条条目、逐条附来源 | 14 个参考站点 + **139 条**目录（7 个时代、1951—2024），10 个必需字段缺失 0、非法来源 URL 0、重复 ID 0、逐条有核验记录与图片许可；归档目录页在临时目录重建后渲染/搜索/年代筛选/条目展开全部可用 |
| 06-museum-core | 回响电玩馆主站 | ✅ 已交付 | 时间长廊、年代展厅、搜索筛选、收藏、可玩入口 | 2D 目录搜索 211→0 生效、顶部导航检索生效（`#/catalog?q=` 路由并同步计数）、fonts.css 不再 404、**移动端横向滚动已修复**。唯一 warn「无 iframe」是 **2D 无障碍目录模式的产品设计选择，非缺陷** → pass-with-warnings |
| 07-museum-art | 原创美术与硬件模型包 | ✅ 已交付 | 6 种跨时代硬件简化原创 3D 模型、design-tokens、许可清单 | 700+ 资产文件、6 款模型齐备、构建产物完整。**本轮 critical**：每次加载抛未捕获 `TypeError`（`applyI18n()` 用 `textContent` 抹掉含子元素的 `[data-i18n]` 节点 → `main.js:176` 对 null 赋值 → 渲染链中断），**字体/图标/海报/封面/模型/降级/案例七个区块全部空白**，并露出 `{count}` 占位符 → **fail** |
| 08-era-origins | 光点年代 1950—1970s | ✅ 已交付 | ≥2 个完整小游戏、键盘只在聚焦时生效 | 「辉点对拉」状态机完整（playing/paused/countdown）；本地存档键 `lumen-era.rally.settings` 写入；未聚焦不驱动游戏、聚焦后正常响应。**通过** |
| 09-era-arcade | 霓虹街廊 1980s | ✅ 已交付 | ≥2 个完整小游戏、像素美术、CRT 可关、触控 | 两个小游戏齐备、暂停面板（P 键）与「继续/重新开始」可用、难度切换（`data-diff`）、localStorage 写入 `neon-corridor.lang`。**音乐调度器异常已修复**（本轮零未捕获异常）。**未自动验证**：分数存档写入发生在游戏结算时 |
| 10-era-console | 色块远征 1990s | ✅ 已交付 | ≥1 个可通关平台冒险 + 等距探索场景 | 零控制台错误、零 404、路线卡角标**已改为不绝对定位**；**manifest 声明的 `QA.md` 已补齐**。唯一 warn：游戏未暴露可观测状态，焦点作用域只验证到 DOM 层（验收能力边界，非缺陷） → pass-with-warnings |
| 11-era-online | 联机曙光 2000s | ✅ 已交付 | 可玩防守游戏 + 掌机探索、AI 对手明确标注 | 零控制台错误、零 404、197 个可聚焦元素；「立即开波 (Space)」等控件可点击。**未自动验证**：无全局状态句柄，暂停/重开只做了 DOM 级断言 |
| 12-era-modern | 万象游乐 2010s 至今 | ✅ 已交付 | 节奏游戏 + 空间解谜、存档/撤销/重置、VR 声明诚实 | 零控制台错误、零跨域请求、`state` 状态机完整（playing/paused/playing）、进度键 `prismera.v1.progress` 写入、聚焦作用域两段对照通过 → **pass（28 项 0 失败 0 警告）** |

## 已在本轮关闭的历史缺陷（不再计入本轮问题清单）

| 任务 | 历史缺陷 | 关闭依据 |
| --- | --- | --- |
| 02-model | `src/gfx/…` 缺 `const data = img.data;` 导致游戏无法启动 | 作品已整体重写，本轮零未捕获异常、程序化几何正常构建 |
| 02-model | 随包 `models/*.glb` 未进构建产物、部署后 404 | 模型已移入 `public/models/`，本轮实测随包 GLB 可取用（magic=`glTF`） |
| 02-model | 使用《沙丘》专有地名 Arrakis | 全仓检索 0 命中；`CHANGELOG.md` 以「已移除项」形式留档 |
| 02-model | 缺 README.md / manifest.json / CHANGELOG.md | 三者均已存在且内容自洽 |
| 03-interaction | 自托管字体用绝对路径 `/fonts/…`，运行时 404 | 构建产物中字体 URL 已转为相对路径，本轮零 404 |
| 04-spaceflight | `makeRingTexture()` 漏写 `const data = img.data;` → ReferenceError | 已补上；本轮三次加载均零未捕获异常 |
| 04-spaceflight | 全局 `preventDefault('Tab')` + Tab 改绑星图 → 键盘不可达 | 已移除 Tab 拦截并加入焦点作用域判断；本轮专项断言通过 |
| 04-spaceflight | `STATUS.md` 引用不存在的 `QA.md` | `QA.md` 已补齐 |
| 06-museum-core | 关键词搜索完全无效（`q` vs `query` 字段名不匹配） | `readCatalogState()` 同时返回 `q` 与 `query`；实测 211→0 |
| 06-museum-core | 缺 `fonts.css`，自托管字体未生效 | `public/art/assets/fonts/fonts.css` 已补齐，本轮零 404 |
| 07-museum-art | `src/main.js` 引用不存在的 `./data.js` → 构建失败 | `src/data.js` 已补齐，本轮构建退出码 0 |
| 08-era-origins | `index.html` 仅为 268 字节占位桩 | 已扩为 13,750 字节完整页，本轮展厅可玩、状态机完整 |
| 09-era-arcade | 音乐调度器把扁平 64 步数组当嵌套小节数组，每 25ms 抛异常 | 已改为 `stepValue()` + 嵌套小节结构，本轮零未捕获异常 |
| 10-era-console | 路线卡角标绝对定位压住卡片标题 | 角标改为 `display:block; width:fit-content`，本轮 D1 零命中 |
| 00-research | manifest 声明的 `ACCEPTANCE.md` 不存在 | 已补齐 |
| 01-web | 移动端读数标签「ΔE00」压住操作提示「拖动旋转 · 双击复位」（**真实叠印**，截图已证） | 上游把 `p.stage__hint` 改为进入文档流（`src/styles/layout.css:565`），复测桌面/移动均零命中 |
| 03-interaction | 移动端 5 处 `dt` 说明文字被压成逐字换行 | 上游已修复，本轮 28 项 0 失败 0 警告 |
| 06-museum-core | 移动端页面级横向滚动（scrollW 426 > 390） | 上游已修复，本轮 D2 无横向滚动 |
| 10-era-console | manifest 声明的 `QA.md` 不存在 | 上游已补出 `QA.md`，磁盘复核存在 |
| 00/01/03/08/09/10/11/12 | D1 元素盒口径报出的大批「文字压盖」 | 经逐条截图复核，绝大多数是 flex/grid 拉伸盒、折叠手风琴、`line-clamp` 裁剪造成的**检测器假阳性**，已按字形行盒 + 裁剪 + 动画冻结口径重测 |

## 解除 `not-delivered` 所需条件（给各实现者）

**本轮 13 件全部有可运行产物，无 `not-delivered`、无 `in-progress`。**
若后续有作品回退到未交付状态，解除条件统一为：
产出可静态构建的独立站（`index.html` + 资源本地化 + `package.json` 含 `build` 脚本）+ `README.md` + `manifest.json`（字段 `id / title / description / entry / buildCommand / outputDir / status`）。

---

*本清单随产物陆续到位持续更新；任何一项从未测变为已测，都必须在 `evidence/` 留下对应 JSON 与截图。*
