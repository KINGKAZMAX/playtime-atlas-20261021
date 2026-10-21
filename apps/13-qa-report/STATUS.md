# STATUS — 13-qa-curation

> 最后更新：2026-10-21 22:45 (Asia/Taipei)
> 执行者：MiniMax Code M3.1-Flash（`max`）｜ 范围：只读 `00-research` … `12-era-modern`，只写 `13-qa-curation/`

---

## 一、结论速览

**批次整体：可发布，但 07-museum-art 必须先修（1 个 critical）。**

| 统计 | 数量 |
| --- | --- |
| 验收任务总数 | 13 |
| ✅ pass | **6** |
| ⚠️ pass-with-warnings | **5** |
| ❌ fail | **2** |
| ⛔ not-delivered | 0 |
| 🔄 in-progress | 0 |
| 真实浏览器断言总数 | **330**（pass 252 / warn 12 / fail 4 / info 35 / skip 27） |
| 记录在案的问题 | 13 条（critical 1 / major 1 / minor 4 / info 7） |

| 任务 | 作品 | 结论 | 实测时刻 (UTC) |
| --- | --- | --- | --- |
| 00-research | MiniMax M3.1 Flash 全球公开案例索引 | ⚠️ pass-with-warnings | 14:33:03 |
| 01-web | 网页案例复刻（色彩光谱台 CHROMA S1） | ✅ pass | 14:33:23 |
| 02-model | 渊甲拾遗者 AC-VII · 深海打捞机械检视台 | ❌ **fail** | 14:33:37 |
| 03-interaction | 织造车间调度台 · LOOMDECK | ✅ pass | 14:36:41 |
| 04-spaceflight | 深空漫游 · Deep Space Drifter | ✅ pass | 14:00:38 |
| 05-museum-research | 博物馆策展目录 · 1950s—2020s | ✅ pass | 13:55:33 |
| 06-museum-core | 回响电玩馆 · PLAYTIME ATLAS 主站 | ⚠️ pass-with-warnings | 13:55:51 |
| 07-museum-art | 博物馆原创美术与硬件模型包 | ❌ **fail** | 14:03:37 |
| 08-era-origins | 光点年代 · 1950—1970s 可玩展厅 | ✅ pass | 13:56:26 |
| 09-era-arcade | 霓虹街廊 · 1980s 可玩展厅 | ⚠️ pass-with-warnings | 13:58:44 |
| 10-era-console | 色块远征 · 1990s 可玩展厅 | ⚠️ pass-with-warnings | 14:03:57 |
| 11-era-online | 联机曙光 · 2000s 可玩展厅 | ⚠️ pass-with-warnings | 13:59:35 |
| 12-era-modern | 万象游乐 · 2010s 至今可玩展厅 | ✅ pass | 14:00:13 |

> 口径说明：`pass-with-warnings` = 全部必测项无失败，但存在**已复核并标注原因**的瑕疵或**未自动验证项**；
> 两者都不等于「完美」，请配合 `issues.json` 逐条看。

---

## 二、仍然 fail 的 2 件 —— 明细与责任归属

### ❌ 07-museum-art — 1 critical + 1 minor

**责任归属：真实缺陷（上游本轮改写引入的回归），非检测器假阳性。**

| 级别 | 维度 | 问题 |
| --- | --- | --- |
| **critical** | D6 控制台错误 | 每次加载抛未捕获 `TypeError: Cannot set properties of null (setting 'textContent')`，**页面 7 个动态区块全部空白** |
| minor | D7 资源 404 | 未声明 `<link rel="icon">`，浏览器自动请求 `/favicon.ico` → 404（桌面 + 移动各 1 次） |

**根因链（已用 `document.querySelector` hook 定位到具体选择器，非推测）**

1. `src/i18n.js:331-334` 的 `applyI18n()` 对每个 `[data-i18n]` 节点执行 `node.textContent = text` ——
   `textContent` 赋值会**替换该节点的全部子节点**。
2. `index.html:120-125` 的 `<p data-i18n="fonts.lede">` 内嵌 `<strong id="cjk-count">—</strong>`，被 i18n 一并抹掉
   （运行时实测 `document.getElementById('cjk-count') === null`）。
3. `src/main.js:176` 随后对 null 赋值 `.textContent` → 抛 TypeError。
4. 该异常发生在 `renderFonts()` 的**第一条语句**，函数体（含 `#font-cards` 渲染）整段未执行；异常继续冒泡，
   **后续所有渲染函数全部不再执行**。

**实测后果**（运行时 `childElementCount`）：

| 区块 | 元素 | 子元素数 |
| --- | --- | --- |
| 字体卡 | `#font-cards` | **0** |
| 图标 | `#icon-grid` | **0** |
| 海报 | `#poster-grid` | **0** |
| 封面 | `#cover-grid` | **0** |
| 硬件模型 | `#model-cards` | **0** |
| 降级方案 | `#fallback-grid` | **0** |
| 案例 | `#case-grid` | **0** |
| （异常前渲染）英雄统计 | `#hero-stats` | 6 |
| （异常前渲染）展品色板 | `#exhibit-swatches` | 25 |

**次生问题（同一根因）**

- 页面上直接露出未替换的占位符：「中文子集覆盖本包用字 **{count}** 个。」——
  `fonts.lede` / `fonts.role.cjk` 的文案含 `{count}`，而 `applyI18n()` 调 `t(key)` 时**没传 vars**。
- 全站 11 处 `[data-i18n]` 节点内的行内 `<code>` / `<strong>` 标记被 `textContent` 一并抹平
  （实测页面 `code` 标签数 **0**、`p/li strong` 标签数 **0**），`/assets/fonts/`、`design-tokens.json`、
  `currentColor` 等本应等宽/加粗的片段变成了普通文本。

**证据**：`evidence/07-museum-art.json`（D6 fail ×2）+ `screenshots/07-museum-art-diag-fonts-section.png`
（字体区与图标区正文下方整片空白）+ `screenshots/07-museum-art-diag-icons-section.png`。

**可复制修复建议**（详见 `issues.json` → `QA-006`）

1. 让 `applyI18n()` 不再摧毁子节点：不要整体 `textContent` 赋值，改为只写直接文本节点、保留内联标记
   （按 `{占位符}` 拆分译文依次填入 `code/strong/span`）。
   **最小改动替代方案**：把内联标记移出 `data-i18n` 节点。
2. 止血：`$('#cjk-count')` 赋值加 `if (el)` 判空；并把「写 `cjk-count`」与「渲染 `#font-cards`」拆成两步 +
   `try/catch`，保证**单个区块失败不连坐后面的所有区块**。
3. 修 `{count}`：给 `applyI18n()` 增加变量注入（`t(key, { count })`），或改文案去掉占位符。

**验证**：`node qa-harness/run-qa.mjs --target=07-museum-art` → D6 零 uncaught exception；
上述 7 个网格的 `childElementCount` 均 > 0；页面搜不到字面量 `{count}`；`querySelectorAll('code').length > 0`。

---

### ❌ 02-model — 1 major + 1 minor

**责任归属：真实缺陷（布局遮挡），但**性质与首轮不同** —— 不是「两段文字互相叠印、均不可读」。**

| 级别 | 维度 | 问题 |
| --- | --- | --- |
| major | D1 文字重叠遮挡 | 桌面 3 处 + 移动 2 处：**右侧剖面卡片与底部固定页脚盖住**左侧工具栏标签、模型卡片英文副标题、移动端操作提示 |
| minor | D2 移动布局 | `#cycle-meter` 溢出视口 **2626px**，标签被压成逐字换行（可用宽 13px） |

**5 处命中的复核结论（本轮用 `document.elementsFromPoint` 取重叠点绘制栈 + 命中区域裁剪截图逐条复核）**

- 桌面 ① `span.cn「标注」`（左侧工具栏**当前选中按钮的中文标签**）× `h2「纵剖面 · 从头到尾」` 90%（431px²）
- 桌面 ② `span.en「SENSING & GRAPPLING」` × `span.card-en「LONGITUDINAL SECTION」` 60%（1720px²）
- 桌面 ③ `span.card-en「CROWN SECTION」` × `a#footer-source「SOURCE」` 71%（620px²）
- 移动 ④ `p.sel-empty「在模型上单击任一构件即可选中并查看其名称与规模。」` × `a#footer-notes「说明与来源」` 55%（650px²）
- 移动 ⑤ 同上 × `a#footer-source「SOURCE」` 73%（637px²）

**定性依据**：5 处命中里，被压在下层的一方**均未出现在命中测试栈中**，栈顶始终是上层的不透明/半透明 UI 面
（`section#card-long-section.card` / `footer#site-footer.ds-footer`）；裁剪截图里上层文字清晰可读，
下层文字不可见或只透出灰影。因此这是**内容被覆盖而丢失**（遮挡型），不是叠印型 —— 上层文字可读性未受损，
故判 major 而非 blocker。**实际影响是三处内容用户根本看不到**：工具栏当前选中项的中文名、卡片英文副标题、
移动端「单击构件以查看名称」的操作说明。

**证据**：`evidence/02-model.json`（D1 fail ×2）+ `screenshots/02-model-desktop-hit-1/2/3.png`
+ `screenshots/02-model-mobile-hit-1/2.png` + `screenshots/02-model-{desktop,mobile}-hits.json`。

**可复制修复建议**（详见 `issues.json` → `QA-003`）

1. 左侧工具栏与右侧剖面卡片改为同一个 Grid 的不同列（或给工具栏列 `position: relative; z-index: 1`），
   并给工具栏列设 `min-width`；移动端改为横向滚动条并置于卡片之下。
2. `footer#site-footer` 为 fixed/sticky 时，内容区必须留等高 `padding-bottom`（同步 `scroll-padding-bottom`），
   否则卡片底部永远被页脚压住（桌面 ③ 的根因）。
3. 同一条 padding 规则也解决移动端 ④⑤ 的提示行被盖问题。
4. 注释标签层（`.anno-*`）的落点也要避开「工具栏列 + 卡片列 + 页脚带」三个矩形。

---

## 三、D1 假阳性复核的最终结论

**结论：本轮 13 件作品的最终 evidence 中，不存在「两段文字互相叠印、均不可读」的缺陷。**
唯一一处真实叠印（01-web 移动端 `span.readout__k「ΔE00」` × `p#stage-hint.stage__hint「拖动旋转 · 双击复位」`，
压盖 85% / 559px²）**已由上游修复并复测关闭**。

**检测器口径（三条原则，本轮固化）**

1. 只取元素**直属文本节点**的字形行盒 —— 避免把父元素与子元素的同一段文字重复计入（原先 O(n²·depth) 的重复计数）。
2. 排除未渲染内容：`content-visibility:hidden` 的 `details`、祖先 `opacity:0`、被祖先 `overflow:hidden/clip` 裁剪的行。
3. 测量前注入 CSS **冻结 transition / animation**，避免测到动画中间态。

**命中必须看图**：每一条命中都用 `qa-harness/visual-review.mjs` 裁剪命中区域截图复核，
并用 `document.elementsFromPoint` 取绘制层级。判定分三档：

| 档 | 含义 | 本轮实例 |
| --- | --- | --- |
| **叠印型** | 两段文字互相压在对方上，都不可读 → 真实缺陷 | 0 处（01-web 原有 1 处已修复） |
| **遮挡型** | 下层文字被不透明 UI 面盖住，上层文字可读 → 真实缺陷，内容丢失 | 02-model 5 处 |
| **误报** | 几何相交但视觉无冲突 → 不算缺陷 | 0 处 |

**被剔除的历史误报**（检测器修复前的假阳性，均已复核为非缺陷）：

- marquee / 轮播内被 `overflow:hidden` 裁切的重复文字 —— 设计使然。
- `details` 折叠区内未渲染内容的行盒 —— 不可见，不构成压盖。
- 动画过程中处于中间态的标签 —— 冻结动画后消失。
- 父元素与子元素引用同一段文字造成的「自相交」。

---

## 四、05-museum-research 实跑结论

**结论：pass（34 项断言，0 失败 0 警告），数据集本身完全达标。**

**数据集实跑**（在**临时副本**中执行 `python3 scripts/build_catalog.py`，不写入实现者目录）：

| 项 | 实测值 |
| --- | --- |
| 目录条数 | **139** 条（要求 ≥70） |
| 时代覆盖 | 7 个时代，年代跨度 **1951—2024** |
| 10 个必需字段缺失数 | **0**（id / title / year / era / platform / creator / summary / significance / sourceUrls / imageLicense） |
| 非法来源 URL | **0** |
| 重复 ID | **0** |
| 逐条核验 | ok 132 / ok-article 6 / ok-infobox 1（**每条都有 verification**） |
| 图片许可 | public-domain 40 / cc-by-sa-4.0 15 / cc-by-4.0 3 / no-image 81（无图条目明确标注，不假装有图） |

**归档目录页实跑**（用 14-publish 的 `build-catalog-page.mjs` + `PUBLISH_ARCHIVE_PAGES=1` 在临时目录重建）：

- 139 条目录全部渲染 ✅
- 搜索「不存在的词」→ 条目 **139 → 0**，计数同步更新 ✅
- 年代筛选 → **139 → 15** 条 ✅
- 条目展开 ✅

**重要边界**：14-publish 已把 05 的策展目录页设为 `publish:false`（`release/works.json`），生成器默认退出。
因此 **05 的线上交付物是数据集本身**，目录页只作为仓库内资料保留 —— 本次验收据此把目录页
**降级为「归档能力验证」**，不计入线上交付要求（该页在 14-publish 的 `PUBLISH_ARCHIVE_PAGES=1` 下仍然可用，
已实测通过）。

---

## 五、未自动验证项清单（**不计通过，也不计失败**）

| 任务 | 项 | 原因 | 已有旁证 |
| --- | --- | --- | --- |
| 09-era-arcade | D3 暂停流程 / D3 重开流程 / D5 聚焦后响应 | 作品未暴露全局状态句柄，只能做 DOM 级断言 | HUD 数值在开始/重开后确实变化 |
| 09-era-arcade | D4 分数存档 | 写入发生在**游戏结算**时，自动流程推进不到该时刻 | 构建产物命中 8 处存储 API 调用 |
| 10-era-console | D3 暂停 / D3 重开 / D3 难度 / D4 存档 / D5 聚焦后响应 | 未找到对应控件或未暴露状态 | 构建产物命中 2 处存储 API 调用 |
| 10-era-console | D5 未聚焦不响应 | 仅验证到 DOM 层，无法比对运动量 | — |
| 11-era-online | D3 暂停 / D5 未聚焦不响应 / D4 存档 | 同上 | 构建产物命中 8 处存储 API 调用 |
| 12 / 03 / 04 / 08 / 06 / 07 / 02 / 01 / 00 | D3 难度切换 | 作品未提供难度控件（12 的难度在别处实现） | — |
| 全部 13 件 | D5 键盘焦点（移动端） | 移动端无 Tab 环，只统计可聚焦元素数 | 各件可聚焦元素数已记录 |
| 05-museum-research | D1 / D2 / D5（数据集产物） | 数据集无视觉界面，改在发布页（surface B）验收 | 归档页已单独实测 |

**要消除这些盲区，需要作品侧提供一个只读状态快照**（例：`window.__exhibitState` getter），
验收才能断言「暂停后 mode 由 running 变为 paused」这类确定性条件。完整建议见 `issues.json` 中 09/10/11 的 info 条目。

---

## 六、本轮关闭的历史缺陷（上游已修复，复测确认）

| 作品 | 历史缺陷 | 关闭方式 | 复测证据 |
| --- | --- | --- | --- |
| 01-web | 移动端 `ΔE00` 压住「拖动旋转 · 双击复位」（真实叠印） | `p.stage__hint` 改为进入文档流（`src/styles/layout.css:565`），注释中写明原委 | 桌面/移动均「未发现文字互相压盖」，D1 pass |
| 02-model | 随包 GLB 未进构建产物 | 移入 `public/models/`，Vite 自动复制 | D9 实测 GLB 8922 KB、magic="glTF"；子路径 200 |
| 02-model | 使用《沙丘》专有地名 Arrakis | 源码与界面彻底清除 | 全仓检索仅 CHANGELOG 的「已移除项」表出现 |
| 03-interaction | `manifest.json` / `STATUS.md` / `README.md` / `QA.md` 缺失 | 已全部补齐 | D12 静态审计通过 |
| 04-spaceflight | `makeRingTexture` ReferenceError（游戏起不来） | 已修 | 构建成功 + 29 项 0 失败 |
| 04-spaceflight | 全局 `preventDefault('Tab')` 改绑星图 | `_shouldPreventDefault()` 移除 `'Tab'` + 焦点作用域判断 | D5 两段对照均通过 |
| 04-spaceflight | `QA.md` / `qa-report.md` 命名不一致 | 两者并存，引用可解析 | D12 通过 |
| 06-museum-core | `fonts.css` 404 | `public/art/assets/fonts/` 补上 | 同源请求 0 失败 |
| 06-museum-core | 搜索完全无效（`q` vs `query` 字段不匹配） | `readCatalogState()` 同返 `q`/`query` | 条目 211 → 0 → 211，实测生效 |
| 07-museum-art | `src/data.js` 缺失 | 已补 | 构建退出码 0 |
| 08-era-origins | 占位 index.html | 已替换 | 构建成功 |
| 09-era-arcade | 音乐调度器 `theme.lead` 异常 | 已修 | D6 零 uncaught exception |
| 09-era-arcade | `STATUS.md` / `QA.md` 缺失 | 已补齐 | D12 通过 |
| 10-era-console | manifest 声明 `"qa": "QA.md"` 但文件不存在 | 上游已补出 `QA.md` | 磁盘存在性复核通过 |
| 10-era-console | 角标绝对定位压住标题 | 已修 | D1 badge × h3 重叠数 = 0 |
| 00-research | manifest 声明的 `ACCEPTANCE.md` 不存在 | 已补齐 | D12 通过 |
| 12-era-modern | — | — | 28 项 0 失败 0 警告 |

---

## 七、被判为「不是缺陷」的项（明确归因，避免转嫁给无错的原作者）

| 现象 | 归属 | 说明 |
| --- | --- | --- |
| 06-museum-core 页面无 iframe | **产品设计选择**（info） | 2D 无障碍目录模式；D8 的子路径资源解析本身全部通过 |
| 09 / 10 / 11 未暴露状态句柄 | **验收能力边界**（info） | 作品未实现该契约，不是不合格；已给出可选的暴露方式 |
| 09 / 11 分数存档未写入 | **验收能力边界**（info） | 写入发生在结算时；构建产物已确认存在存储 API 调用 |
| 00-research「1 条」逐字换行 | **真实小瑕疵**（minor） | 需加 `white-space: nowrap`，已给修复建议 |
| 01-web 的 `Dune Sand / 沙丘` | **不是 IP 引用**（info） | 通用材质/颜料色名，与同表 Wet Asphalt、Verdigris 同类；仅作可选改名提示 |
| 07-museum-art 构建期 `EISDIR` | **时序假阳性** | 复制临时副本时撞上上游改写（上游当时正重写 `index.html`）；`fsp.cp` + `dereference` + 入口文件校验 + 失败重试一次后构建正常 |
| 10 / 12 的 `Target page, context or browser has been closed` | **环境/时序假阳性** | 浏览器异常退出；harness 自动重试一次即通过，不是作品缺陷 |
| 03 的 `探针 era 执行异常` | **环境假阳性** | 本轮中途被误启动的扫描进程打断；单独复测 28 项 0 失败 |
| 02 D9 随包模型路径 | **改名时序假阳性** | 上游曾改名；D9 改为**发现式**（manifest / `src`+`public` 源码字面量 / `public/` 实际文件三处自动发现），不再硬编码文件名 |

---

## 八、快照一致性提醒

上游 13 个任务在验收期间**持续被并发改写**，因此本报告的每条结论只对「验收时刻」成立。
`QA-MATRIX.md` 的「快照一致性」表给出每件的验收时刻与源码最后改动时刻；`inventory.json` 的
`snapshot.stale` 字段标记哪些作品在验收之后源码又变了（结论对应旧快照，需重跑）。

**若上游在报告生成后继续修改，本报告的对应条目必须重跑 `node qa-harness/run-qa.mjs --target=<id>` 再采信。**

---

## 九、交付物清单

| 文件 | 内容 |
| --- | --- |
| `QA-MATRIX.md` | 13 件 × D1—D12 矩阵 + 总览 + 统计 + 快照一致性表 |
| `issues.json` | 13 条机器可读问题（含 title / severity / status / detail / repro / evidence / **可复制 fixSuggestion**） |
| `inventory.json` | 00—12 产物清点（文件数 / 构建命令 / 产物状态 / 验收结论 / 快照状态） |
| `evidence/<target>.json` | 逐件原始证据（build 日志 / 每项检查 / 探针 / 截图路径） |
| `evidence/summary.json` | 批次级索引（由证据反向重建，始终全量） |
| `screenshots/` | 视口图、整页图、D1 命中裁剪图、07 的缺陷证据图 |
| `DIFF-AUDIT.md` | 原创差异 / 来源许可 / 交付完整性逐件审计 |
| `HANDOFF-14.md` | 给 14-publish 的三类名单 + 发布红线 + 部署后复验清单 |
| `QA-CHECKLIST.md` | 13 × D1—D12 逐项勾选表 + 交付物完整性表 |
| `qa-harness/` | 可复跑的验收方案（见其 README） |

---

*每轮实测结果写入 `evidence/`，报告由 `qa-harness/build-reports.mjs` 从原始数据生成，可随时重跑复现。*
