# 13-qa-curation — 全作品试玩验收与差异审计

> 独立验收任务：**只读**本批 `00-research` … `12-era-modern` 产物，**只写**本目录。
> 不修改任何实现者文件，不参与 GitHub 写入（部署统一由 `14-publish` 负责）。

---

## 结论速览

**13 件作品全部有可运行产物，全部完成真实浏览器验收**（无 `not-delivered`、无 `in-progress`）。
共执行 **330** 条真实浏览器断言（pass 252 / warn 12 / fail 4 / info 35 / skip 27）。

| 作品 | 验收结论 | 一句话 |
| --- | --- | --- |
| **00-research** | ⚠️ pass-with-warnings | 134 条案例逐条带来源与归属证据，8 条正确排除出 M3.1 Flash，零编造数字；窄屏「1 条」被压成逐字换行（minor） |
| **01-web** | ✅ **pass** | 此前移动端「ΔE00」压住操作提示的真实叠印**已由上游修复并复测关闭** |
| **02-model** | ❌ **fail** | 导出与随包模型正常；**5 处遮挡型重叠**（工具栏标签/卡片副标题/移动端提示被盖住）+ 移动端节律表溢出 2626px |
| **03-interaction** | ✅ **pass** | `state` 状态机完整暴露（running/paused/idle），难度可切，存档键写入，28 项 0 失败 |
| **04-spaceflight** | ✅ **pass** | 游戏可启动、零控制台错误、Tab 焦点问题已修、存档刷新后存活，29 项 0 失败 |
| **05-museum-research** | ✅ **pass** | 139 条目录、10 个必需字段缺失 0、非法 URL 0、重复 ID 0、逐条有核验与图片许可 |
| **06-museum-core** | ⚠️ pass-with-warnings | 搜索 211→0 生效、fonts.css 不再 404、移动端横向滚动已修；唯一 warn「无 iframe」是 **2D 目录模式的设计选择** |
| **07-museum-art** | ❌ **fail（1 critical）** | 每次加载抛未捕获 `TypeError`，**字体/图标/海报/封面/模型/降级/案例七个区块全部空白** |
| **08-era-origins** | ✅ **pass** | 状态机完整、存档写入、聚焦作用域两段对照通过 |
| **09-era-arcade** | ⚠️ pass-with-warnings | 音乐调度器异常已修；暂停/重开/分数存档属**验收能力边界**（未暴露状态句柄） |
| **10-era-console** | ⚠️ pass-with-warnings | 角标定位已修、`QA.md` 已补齐；焦点作用域只验证到 DOM 层 |
| **11-era-online** | ⚠️ pass-with-warnings | 零控制台错误、零 404、197 个可聚焦元素；AI 对手标注诚实 |
| **12-era-modern** | ✅ **pass** | `state` 状态机完整、进度键写入、VR 声明诚实，28 项 0 失败 0 警告 |

> 完整结论见 **`QA-MATRIX.md`**（作品 × 维度）、**`issues.json`**（逐条可执行修复建议）与 **`STATUS.md`**（判定与归因）。

---

## 目录

| 文件 | 内容 |
| --- | --- |
| `TASK.md` | 任务契约、维度定义、严重级别、完成定义 |
| `STATUS.md` | **本轮结论**：verdict 计数、fail 明细与责任归属、05 实跑结论、未自动验证清单 |
| `QA-CHECKLIST.md` | 逐作品 × 逐维度的勾选清单 + 交付物完整性表 |
| `QA-MATRIX.md` | **主报告**：作品 × 维度总矩阵 + 快照一致性表 |
| `issues.json` | **机器可读**问题清单，每条含复现步骤与可复制修复建议 |
| `DIFF-AUDIT.md` | 原创差异与来源许可审计（8 项判定口径） |
| `HANDOFF-14.md` | 给发布任务的三类名单、5 条发布红线与部署后复验清单 |
| `inventory.json` | 00—12 产物清点（文件数、构建命令、产出目录、验收时刻/源码改动对照） |
| `manifest.json` | 本任务自身的交付物清单 |
| `qa-harness/` | **可执行**验收方案（Playwright），见其 `README.md` |
| `evidence/` | 每次验收的原始 JSON（build 日志、逐项检查、console/网络记录）+ `summary.json` 批次索引 |
| `screenshots/` | 真实浏览器截图证据（视口 / 整页 / D1 命中裁剪 / 缺陷取证） |

---

## 怎么复现一次验收

```bash
cd 13-qa-curation/qa-harness
npm install
node run-qa.mjs                       # 全部目标（约 25 分钟）
node run-qa.mjs --target=07-museum-art # 单件
node build-reports.mjs                # 重新生成 QA-MATRIX.md / issues.json / inventory.json / evidence/summary.json
node visual-review.mjs --target=02-model --viewport=desktop --max=4   # D1 命中区域裁剪截图复核
```

harness 的设计约束：

1. **绝不写入实现者目录** —— 构建在临时副本中进行（`fsp.cp` + `dereference` + 入口文件校验，失败自动重试一次）。
2. **子路径优先** —— 站点一律挂在 `/playtime-atlas-20261021/exhibits/<id>/` 下访问，复现 GitHub Pages 真实形态（`vite preview` 做不到）。
3. **就绪闸门** —— 半成品记为 `in-progress`，**既不算通过也不算失败**。
4. **D1 命中必须看图** —— 每条命中都裁剪截图 + 取 `elementsFromPoint` 绘制层级复核，检测器与视觉复核两套实现须结论一致。

---

## 验收方法

| 维度 | 怎么测 |
| --- | --- |
| D1/D2 桌面与移动 | 1440×900 与 390×844 双视口真实加载，检查页面级横向滚动、元素溢出、文字是否被压成逐字换行、空白页 |
| D1 文字重叠 | 只取元素**直属文本节点**的字形行盒；排除 `content-visibility:hidden`、祖先 `opacity:0`、被 `overflow:hidden/clip` 裁剪的行；测量前冻结 transition/animation |
| D3 开始/暂停/重置 | 读取页面暴露的状态机（`window.__deepSpaceDrifter.state` 等），断言 `idle → countdown/playing → paused → reset`；未暴露句柄时降级为 DOM 级断言并记 `skip`/`warn` |
| D4 存档 | 写入 localStorage → **刷新页面** → 读回并校验 JSON 可解析、版本正确 |
| D5 键盘焦点 | 连续 Tab 采样 `document.activeElement`，检查焦点可移动 + 焦点环可见；**并做「未聚焦不响应 / 聚焦后响应」两段对照**（iframe 嵌入场景的硬要求） |
| D6 控制台 | 收集 `console.error` + `pageerror` + `unhandledrejection`，过滤已豁免噪声（自动播放策略、GLTF texture-merge 告警） |
| D7 资源 404 | `response.status >= 400` + `requestfailed`，**排除探针自己发起的请求**；另查 favicon 声明 |
| D8 子路径 | 全程挂子路径前缀访问，任何资源解析失败即 fail |
| D9 模型导出 | 拦截 `URL.createObjectURL` 拿 Blob，**校验 GLB 容器头**（magic = `glTF`、header 长度 == 实际长度）；随包模型路径**发现式**定位，不硬编码文件名 |
| D10/D11/D12 | 静态审计：IP 引用检索、品牌 logo 检索、素材许可、交付文件齐备性、manifest 字段完整性 |

---

## 关键发现（完整版见 `issues.json` 与 `STATUS.md`）

### Critical — `07-museum-art` 每次加载抛未捕获异常，7 个区块全空白

`src/i18n.js` 的 `applyI18n()` 用 `node.textContent = text` 覆盖每个 `[data-i18n]` 节点，
而 `textContent` 赋值会**替换该节点的全部子节点** —— `index.html` 里 11 处 `[data-i18n]` 节点内嵌了
`<code>` / `<strong>`，其中 `fonts.lede` 内的 `<strong id="cjk-count">` 被直接抹掉；
随后 `src/main.js:176` 的 `$('#cjk-count').textContent = …` 在 null 上赋值抛 `TypeError`。
该异常发生在 `renderFonts()` 的第一条语句，**整条渲染链就此中断**：
字体 / 图标 / 海报 / 封面 / 模型 / 降级 / 案例七个区块 `childElementCount` 均为 0。
次生问题：页面上露出未替换的 `{count}` 占位符，全站行内 `<code>` / `<strong>` 标记被抹平。

### Major — `02-model` 5 处遮挡型重叠

桌面 3 处 + 移动 2 处：右侧剖面卡片与底部固定页脚盖住了左侧工具栏当前选中项的中文标签「标注」、
卡片英文副标题「CROWN SECTION」，以及移动端「在模型上单击任一构件即可选中…」的操作提示。
**复核定性**：这不是「两段文字互相叠印、均不可读」—— `document.elementsFromPoint` 显示被压方**不在命中栈中**，
上层文字清晰可读，属**内容被覆盖而丢失**（遮挡型），故判 major 而非 blocker。

### 已关闭的历史缺陷

上一轮判定的 17 项历史缺陷（04 启动崩溃、02 随包 GLB 404、02 Arrakis 命名、03 字体 404、
06 搜索失效与 fonts.css、07 `data.js` 缺失、08 占位页、09 音乐调度器、10 角标定位、10 缺 `QA.md`、
00 缺 `ACCEPTANCE.md`、01 移动端叠印等）**全部由上游修复并经本轮复测确认关闭**，详见 `STATUS.md` 第六节。

---

## 限制声明

- 触屏**手势**（滑动、双指缩放）未在真机上验证；触控结论基于 390×844 的 Chromium 模拟上下文与命中区域尺寸检查。
- 音频未做主观音质评估，只验证 AudioContext 可在用户手势后启动且无控制台报错。
- 性能未做量化（FPS 只读取页面自报值）。
- 无头 Chromium 与真机 Safari / iOS 的渲染差异未覆盖。
- 研究类任务（`00-research`、`05-museum-research`）按**文件级交付物**验收；05 的目录页已降级为「归档能力验证」，不计入线上交付要求。
- 上游在验收期间持续被改写，**每条结论只对「验收时刻」成立**；`inventory.json` 的 `snapshot.stale` 标记哪些作品需要重跑。
- 本任务**不执行** GitHub 写入与部署；线上验收由 `14-publish` 在部署后进行。

---

## 来源与许可

- 本目录所有脚本、文档、报告均为本任务原创产出。
- `qa-harness` 依赖 `playwright-core`（Apache-2.0），**不下载浏览器**，复用本机 `~/Library/Caches/ms-playwright/chromium-1248` 缓存。
- 截图取自本批自有作品，未使用任何第三方素材。
- 本任务**只读**其他任务目录，未复制其任何素材到本目录。

---

*本任务的最终结论以 `QA-MATRIX.md` 与 `issues.json` 为准；两者均由 `qa-harness/build-reports.mjs` 从 `evidence/` 原始数据生成，可随时重跑复现。*
