# HANDOFF-14 — 给 14-publish 的验收结论与行动清单

> 来自：**13-qa-curation**（全作品试玩验收与差异审计）
> 交付物：`QA-MATRIX.md`（作品 × 维度矩阵）、`issues.json`（逐条可执行修复建议）、`DIFF-AUDIT.md`（原创与许可）、`evidence/*.json`（原始实测数据）、`screenshots/`（截图证据）、`inventory.json`（产物清点）
> 本任务**不执行**任何 GitHub 写入；部署归 14-publish。

---

## 一、总体结论

**13 件作品全部有可运行产物，全部完成真实浏览器验收**（无 `not-delivered`、无 `in-progress`）。
共执行 **330** 条真实浏览器断言（pass 252 / warn 12 / fail 4 / info 35 / skip 27）。

| 分类 | 数量 | 作品 |
| --- | --- | --- |
| ✅ 可直接上线 | 6 | 01-web、03-interaction、04-spaceflight、05-museum-research、08-era-origins、12-era-modern |
| ⚠️ 可上线，但有可标注的小瑕疵 | 5 | 00-research、06-museum-core、09-era-arcade、10-era-console、11-era-online |
| 🟠 建议修完再上线 | 1 | 02-model（1 major + 1 minor，均为布局遮挡） |
| 🔴 **必须先修再上线** | 1 | **07-museum-art（1 critical —— 每次加载抛未捕获异常，页面 7 个动态区块全空白）** |

> ⚠️ **本轮出现 1 个 critical**：上游在验收期间改写 `07-museum-art` 时引入了一处回归 —— `src/i18n.js` 的
> `applyI18n()` 用 `node.textContent = text` 覆盖了含子元素的 `[data-i18n]` 节点，抹掉了 `<strong id="cjk-count">`，
> 随后 `src/main.js:176` 对 null 赋值抛 `TypeError`，**中断了整条渲染链** —— 字体 / 图标 / 海报 / 封面 / 模型 /
> 降级 / 案例七个区块全部空白，页面上还露出未替换的 `{count}` 占位符。
> 完整根因链与可复制修复见 `issues.json` → `QA-006`（critical）与 `STATUS.md` 第二节。
> **上线前必须确认这一处已修复并重跑 `--target=07-museum-art`。**

### ✅ 可直接上线

| 作品 | 实测要点 |
| --- | --- |
| **01-web** | 此前移动端「ΔE00」压住操作提示的叠印**已由上游修复并复测关闭**；桌面/移动均未发现文字互相压盖；零控制台错误、零 404、子路径全通 |
| **03-interaction** | `state` 状态机完整暴露：开始 → `running`、暂停 → `paused`、重置 → `idle`；难度可切到「轻松」；存档键 `loomdeck.workshop.v1` 写入；未聚焦不驱动游戏、聚焦后正常响应 |
| **04-spaceflight** | 游戏可启动、零控制台错误；设置与发现记录写入 localStorage 且**刷新后仍存活**；Tab 可移动焦点且不会被误开成星图；暂停/继续/RESET 全链路通过 |
| **05-museum-research** | 139 条目录、10 个必需字段缺失 0、非法来源 URL 0、重复 ID 0、逐条有核验记录与图片许可；归档目录页重建后渲染/搜索（139→0）/年代筛选（139→15）/条目展开全部可用 |
| **08-era-origins** | 「辉点对拉」状态机完整（playing/paused/countdown）；本地存档键写入；未聚焦不驱动游戏、聚焦后正常响应；零控制台错误 |
| **12-era-modern** | `state` 状态机完整暴露（playing/paused/playing）；进度键 `prismera.v1.progress` 写入；零控制台错误、零跨域请求；VR 声明诚实（桌面交互演示 / 不支持头显） |

### ⚠️ 可上线，但有可标注的小瑕疵（不阻塞）

| 作品 | 问题 | 级别 | 修复要点 |
| --- | --- | --- | --- |
| **00-research** | 窄屏下「1 条」计数标签被压成逐字换行（可用宽 21px） | minor | 给该标签加 `white-space: nowrap` 并给容器 `min-width` |
| **07-museum-art** | 未声明 favicon，浏览器自行请求 `/favicon.ico` 得 404 | minor | `<head>` 内加 `<link rel="icon" href="./mark.svg">`（用相对路径以兼容子路径） |
| **06-museum-core** | 页面无 iframe（2D 无障碍目录模式） | info | **产品设计选择，不是缺陷**；D8 子路径资源解析本身全部通过。若将来改用 iframe，`src` 须用相对路径 |
| **09 / 10 / 11** | 暂停/重开、键盘焦点作用域、分数存档**未被自动验收覆盖** | info | 见下方「未自动验证」清单；如需闭环请补人工试玩或让作品暴露只读状态句柄 |

> ⚠️ 上一轮列在「顺手修掉」清单里的 **03-interaction 移动端逐字换行** 与 **10-era-console 缺 `QA.md`**
> **均已由上游修复**（03 现为 pass；10 的 `QA.md` 已存在，manifest 与磁盘重新对齐），不再需要处理。

### 🟠 建议修完再上线

| 作品 | 问题 | 级别 | 修复要点 |
| --- | --- | --- | --- |
| **02-model** | 桌面 3 处 + 移动 2 处**遮挡型重叠**：右侧剖面卡片与底部固定页脚盖住左侧工具栏当前选中项的中文标签「标注」、卡片英文副标题「CROWN SECTION」，以及移动端「单击构件以查看名称」的操作提示 | major | 工具栏与剖面卡片改为同一 Grid 的不同列（或给工具栏列 `z-index:1` + `min-width`）；fixed 页脚必须让内容区留等高 `padding-bottom` |
| **02-model** | 移动端节律表 `#cycle-meter` 溢出视口 2626px，另有 2 处文字被压成逐字换行 | minor | 窄屏隐藏/折叠节律表；给按钮内文加 `white-space: nowrap` |

> 复核定性：这 5 处**不是**「两段文字互相叠印、均不可读」，而是**上层不透明 UI 面把下层内容盖住**
> （`document.elementsFromPoint` 取重叠点绘制栈：被压方均不在栈中）。上层文字清晰可读，
> 所以判 major 而非 blocker；但三处内容用户根本看不到，仍需修。

> 两项都**不涉及功能逻辑**，只涉及 CSS 定位；每条的具体改法与验证命令见 `issues.json` 对应条目的 `fixSuggestion`。

---

## 二、🚫 发布红线（务必遵守）

### 1. `00-research/references/mia-100-html/` 不得发布

该目录是克隆自 `MiaAI-Lab/MiniMax-M3.1-Flash-100-HTML-Files` 的 **100 个单文件 HTML + 完整原始提示词**。
该仓库**没有 LICENSE**，按著作权默认「保留所有权利」处理。
`00-research/manifest.json` 已把它标为 `reference-only`。

> **请在打包时排除此目录。** 当前 14-publish 的 `scripts/sync-apps.mjs` DENY 列表里已经包含 `references`，
> 实测 `release/apps/00-research-dossier/` 中确实没有该目录 —— **发布链路现在是安全的，请保留这条排除项**。

### 2. 不要在站点文案里写「按 TOP3 复刻」

`00-research/TOP3.md` 是研究阶段产出的**候选**改编规格（`NIMBUS·7` / `TIDAL DRIFT` / `HELIOS SPECIMON`），
而实际交付的作品是 `CHROMA S1`（01）/ `渊甲拾遗者 AC-VII`（02）/ `深空漫游`（04）/ `LOOMDECK`（03）。
`MASTER-UPDATE.md` 的硬性要求是「参考机制与质量、重新设计名称/文案/内容/字体/配色/布局/模型形态」，**并非**要求采用 TOP3 名单；
各作品均为原创设计，无逐帧复制。

> 若 `TOP3.md` 随站点发布，请在页面或文档中注明「这是研究阶段的候选规格，实际交付物以各作品 README 为准」，
> 否则会形成新的虚假声明。

### 3. 05 的策展目录页**不在**线上发布范围内

14-publish 的 `works.json` 中 05 条目为 `"publish": false`，生成器 `scripts/build-catalog-page.mjs` 默认直接退出
（需显式设置 `PUBLISH_ARCHIVE_PAGES=1` 才产出文件）。

> 05 的线上交付物是**数据集本身**（`catalog.json` + 来源台账），**不要**在站点上挂 `research/catalog.html`。
> 13-qa-curation 对该页做的是「归档能力验证」——用 05 的当前 `catalog.json` 在临时目录重建后实测渲染与交互，
> 结果全部通过，但**不构成线上交付要求**。

### 4. 不要按各任务的 `STATUS.md` 判断完成度

上游任务在验收期间持续被改写，目录树不是静态的。
**以 `issues.json` 与磁盘实况为准**，不要照抄任何任务的 `STATUS.md`。

### 5. 全部站点必须保持子路径可用

所有作品在实测中均以 `/playtime-atlas-20261021/exhibits/<id>/` 前缀访问。
13-qa-curation 的 `qa-harness/lib/static-server.mjs` 就是按这个形态实现的（可挂载前缀的静态服务器）。

> 统一部署 **`dist/`**（构建产物），不要直接部署源码目录；源码里的 `<script src="/src/main.js">` 是绝对路径。

---

## 三、未自动验证项（不是缺陷，但也没有被证明）

以下项在真实浏览器里**没有取得肯定结论**，报告中一律记为 `skip` / `warn` 而非 `pass`。
如需闭环，建议二选一：① 让作品在 `window` 上暴露一个调试句柄（如 `window.__lumenRally = { state }`）；② 补一轮人工试玩。

| 作品 | 未自动验证项 | 原因 |
| --- | --- | --- |
| 09-era-arcade | 分数存档写入与读取；暂停是否真的冻结；重开是否真的回到初始态；聚焦后按键是否真的驱动游戏 | 写入发生在**游戏结算**时（`src/core/storage.js` 的 `saveScore`），自动流程不会把游戏玩到结算；且这两件把游戏画在 canvas 上、**不暴露全局状态句柄**，只能做 DOM 级断言。已另行核验构建产物中确有存储 API 调用（09 命中 8 处、10 命中 2 处、11 命中 8 处） |
| 10-era-console | 键盘未聚焦时不驱动游戏；聚焦后是否响应；暂停/重开/难度控件未找到 | 页面未暴露可观测游戏状态（`window.__lumenRally` 等），只验证到 DOM 层；HUD 为 canvas 绘制且无可聚焦 DOM 元素，键盘由 document 级监听处理 |
| 11-era-online | 分数存档写入与读取；暂停是否真的冻结；键盘未聚焦不驱动游戏 | 同上 |
| 03 / 04 / 08 / 10 / 11 / 12 / 02 / 06 / 07 / 01 / 00 | 移动端无 Tab 环 | 移动端没有键盘环，只统计可聚焦元素数量（已记录） |
| 05 | 数据集产物本身的 D1/D2/D5 | 数据集没有视觉界面，改在归档目录页（surface B）上验收；该页重建后实测全部通过 |
| 12 / 03 / 04 / 09 / 10 / 11 | 难度切换 | 作品未提供难度控件（12 的难度在其他位置实现） |

---

## 四、部署后请逐项复验

上线后请在**真实线上 URL** 上复核以下 9 项（harness 已具备该能力，只需把 base URL 换成线上地址）：

1. 页面能打开，控制台零 error —— **07-museum-art 必须重点复核**（修复前每次加载必抛 `TypeError`）
2. 网络面板零 404（**含 `/favicon.ico`**）
3. 桌面 1440×900 无横向滚动
4. 移动 390×844 无横向滚动
5. 刷新后 localStorage 存档仍在
6. Tab 可移动焦点且有可见焦点环
7. 3D 作品的 GLB 导出可下载且文件非空
8. 子路径下 iframe 内嵌的展厅能正常加载
9. 策展目录（若保留在仓库内）能正常打开并可搜索 / 筛选

另加两项**内容完整性**复验（专门针对 07-museum-art 的 critical 修复效果）：

10. 07-museum-art：字体 / 图标 / 海报 / 封面 / 模型 / 降级 / 案例**七个区块都有内容**（运行时 `childElementCount > 0`）
11. 07-museum-art：页面上**搜不到字面量 `{count}`**，且行内 `<code>` 等宽标记仍然存在

复验命令模板（harness 已就绪）：

```bash
cd 13-qa-curation/qa-harness
node run-qa.mjs --target=07-museum-art   # 重点：确认 critical 已关闭
node run-qa.mjs --target=02-model       # 重点：确认遮挡已消除
node run-qa.mjs                         # 全量
```

> 上游在验收期间持续被改写，**部署前请重跑一次全量**（约 25 分钟），确认 `evidence/summary.json` 的
> `counts` 与本文件第一节一致后再发布。

---

## 五、数据引用方式

| 需要什么 | 读哪里 |
| --- | --- |
| 某件作品能不能上 | `QA-MATRIX.md` → 一、总览表的「结论」列 |
| 某个维度为什么没过 | `QA-MATRIX.md` → 该维度行的结论列（含实测数字） |
| 怎么修 | `issues.json` → 对应 issue 的 `fixSuggestion`（含可直接粘贴的代码片段） |
| 复现步骤 | `issues.json` → 对应 issue 的 `repro` |
| 原始证据 | `evidence/<target>.json`（build 日志、逐项 check、console/网络记录） |
| 截图 | `screenshots/<target>-{desktop,mobile}.png`（视口）、`-full.png`（整页）、`-hit-N.png`（D1 命中区域裁剪） |
| 原创性与许可 | `DIFF-AUDIT.md` |
| 产物清点 | `inventory.json`（含每件作品的「验收时刻 / 源码最后改动」对照） |
| 完整问题清单（按严重级排序） | `issues.json` → `counts` 字段 |

`issues.json` 为机器可读 JSON，每条含：
`id / target / dimension / title / severity / status / detail / repro / evidence / fixSuggestion / fixSource / source / occurrences / detectedAt`。

---

*本文件基于 13-qa-curation 的最终一轮全量实测（同一版检测器、同一版探针、同一时间窗口）生成。*
