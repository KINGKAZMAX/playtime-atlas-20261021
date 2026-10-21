# STATUS — 17 中国经典建筑与传统结构联网研究

**最后更新**：2026-10-22 02:30（GMT+8）
**当前阶段**：S1 ~ S10 **全部完成**；交付物齐备，校验 **84/84 通过**，成果页实机测试 **Ego 共享工具 PASS + 交互类 18/18**，16 的验收清单 V.1—V.13 全覆盖
**执行**：MiniMax M3.1-Flash（max）｜**调度**：Codex / 15-supervisor

---

## 1. 交付状态

| 交付物 | 状态 | 实测规模 / 说明 |
| --- | --- | --- |
| `TASK.md` | ✅ 完成 | 任务定义、字段规格、验收标准、下游契约 |
| `STATUS.md` | ✅ 完成 | 本文件 |
| `README.md` | ✅ 完成 | 导览、字段说明、复现方式、数据可信度、限制 |
| `catalog.json` | ✅ 完成 | **42 条**建筑案例（要求 ≥36） |
| `catalog.meta.json` | ✅ 完成 | 21 类构造词表 + 统计 + 字段说明 + 限制 + UNESCO 核验方法 + `teachingNotice` |
| `glossary.json` | ✅ 完成 | **74 条**术语（8 类，zh/en/pinyin/释义/关联案例） |
| `REFERENCES.md` | ✅ 完成 | **18 个**真实交互可视化项目（开源 9 + 机构 9），含许可结论速查表 |
| `REFERENCE-NOTES.md` | ✅ 完成 | olek.si 实测观察记录（含未核验项与已确认缺陷） |
| `INTERACTION-BRIEF.md` | ✅ 完成 | 交互机制规格 M-01 ~ M-16 + 通用约定 + 分派表 + 不得照搬清单 |
| `SOURCES.md` | ✅ 完成 | 逐条来源台账 + 54 个独立来源清单 |
| `LICENSES.md` | ✅ 完成 | 许可边界、素材规则、署名规则、下游执行清单 |
| `QA.md` | ✅ 完成 | **84 项断言实测输出**（由 `scripts/build_qa.py` 注入，非手写） |
| `manifest.json` | ✅ 完成 | 目录文件条目（角色 / 字节 / sha256）+ **发布契约**（id / description / entry / buildCommand / outputDir / status） |
| `PUBLISH-EXCLUDE.txt` | ✅ 完成 | **发布前必须排除的精确路径清单**（含 `src/`、`evidence/`）；明确 `dist/` 为应发布产物 |
| `dist/catalog.html` | ✅ 完成 | **研究成果页**（中英双语，42 案例 / 74 术语 / 21 构造），可独立部署 |
| `src/catalog-page/` | ✅ 完成 | 成果页源码 + vendored 的 16 设计系统资源（与 16 原件**字节一致**） |
| `handoff/` | ✅ 完成 | `first-18.json`（18 例）、`first-18-ids.json`、`structure-groups.json`（**21 组**）、**`FIELD-MAPPING.md` + `field-mapping.json`**、`VERIFIED-VS-ASSUMED.md` + `verification-status.json` |
| `evidence/` | ✅ 完成 | **Ego 实测证据**：`evidence/ego/`（共享工具 PASS，4 档视口截图）+ `evidence/ego-interactions/`（交互类 18/18）+ `evidence/ego-ref/`（参考站 16 档视口几何）+ 4 张成果页截图（浅色 / 暗色 / 移动 / 平板） |
| `screenshots/` | ✅ 完成 | 5 张 **Ego 实拍** + `INDEX.tsv`（记录采集通道），全部字节数 > 0 |
| `scripts/` | ✅ 完成 | 19 个可复现脚本（见 §6），网页相关 3 个**全部走 Ego** |
| `research-ref/` | ✅ 完成 | **隔离区**：参考站观察证据 + README（非本项目产物，不发布） |
| `data/` | ✅ 完成 | 仅 2 个**本项目自产**文件（UNESCO 官方编号映射、校验报告） |

---

## 2. 硬性指标达成情况

| 指标 | 要求 | 实测 | 状态 |
| --- | --- | --- | --- |
| 建筑案例 | ≥ 36 | **42** | ✅ |
| 构造类别 | ≥ 12 | **21**（且 21 个全部有构件清单 + 组装顺序 + 受力说明） | ✅ |
| 交互可视化项目 | ≥ 8 | **18**（开源 9 + 机构 9），每条含网址/作者/交互/模型/许可 | ✅ |
| 机制优秀改编案例 | 3 | **3**（① 可倒退时间轴 ② 定性推力线 ③ 轴线数据驱动） | ✅ |
| 术语条目 | ≥ 40 | **74**（8 类，覆盖 35/42 = 83% 案例） | ✅ |
| 每条字段 | zh/en 名称、地域、年代+不确定性、类型、结构原理、文化背景、sources、图片许可 | 42 条 × 26 字段全部齐备 | ✅ |
| 教学示意数据层标记 | 需 | 每条 case 带 `teachingNotice`（中英标签 + 受力说明 + `mustNotClaim`） | ✅ |

### 2.1 监工点名要逐项确认的 13 个覆盖点

| 要点 | 落地为 | 案例 |
| --- | --- | --- |
| 斗拱 | 构造 `dougong` | c01 / c02 / c03 / c09 / c10 / c40 |
| 榫卯 | 构造 `mortise-tenon` | c25 河姆渡 / c03 应县木塔 / c28 北涧桥 / c40 飞云楼 |
| 抬梁 | 构造 `tailiang` | c01 / c02 / c04 / c08 / c09 |
| 穿斗 | 构造 `chuandou` | c26 增冲鼓楼 / c27 肇兴侗寨 / c28 北涧桥廊屋 |
| 屋顶类型 | 构造 `roof-form`（本轮新增） | c02 / c03 / c06 / c09 / c10 / c13 / c14 / c19 / c23 / c24 / c32 / c38 / c39 / c40 |
| 石拱 | 构造 `stone-arch` | c30 赵州桥 / c41 洛阳桥 / c21 / c22 |
| 院落 | 构造 `courtyard`（本轮新增） | c13 / c15 宏村 / c16 西递 / c17 土楼 / c18 碉楼 / c19 平遥 / c26 / c27 / c33 / c34 / c42 柏社村 |
| 土楼 | 案例 | **c17 福建土楼**（夯土外墙 + 木构楼层） |
| 窑洞 | 构造 `yaodong` | **c42 陕西三原柏社村地坑窑院**（本轮新增） |
| 干栏 | 构造 `ganlan` | c25 河姆渡 / c27 肇兴侗寨 / c37 傣族竹楼 |
| 园林 | 案例 | c13 苏州古典园林 / c14 杭州西湖 / c11 颐和园 / c12 承德 |
| 桥梁 | 构造 `stone-arch` / `timber-arch-bridge` / `chain-bridge` | c30 赵州桥 / c41 洛阳桥 / c28 北涧桥 / c29 仙居桥 / c31 泸定铁索桥 |
| 塔 | 构造 `masonry-tower` | c39 小雁塔 / c03 应县木塔 |

---

## 3. 阶段记录

### S1 立项与契约对齐 ✅
读取 `PROMPT.md` / `MASTER-UPDATE.md` / 15-supervisor `RESTYLE-SPEC.md`；
读取 16 / 18 / 19 三份下游 `PROMPT.md` 对齐消费方式；
以 05-museum-research 为研究类任务范式；确认**不建仓、不 push、不部署**。

### S2 参考站实测取证 ✅（2026-10-22 已由 Ego 复测并更正）
首轮（2026-10-21）以无头 Chrome 为主证据通道取 5 张实拍并解析生产 bundle
（26 个 hex 色、53 个 CSS 变量、字体 `inter`/`monospace`、时长 .2–2s）。
**2026-10-22 按浏览器入口约定改由 Ego 浏览器全部重做**：5 张截图重取 + 16 档视口几何实测。
→ **旧结论「390px 标题溢出」被推翻**（无头环境缺站方字体导致的假象）；
真实缺陷在 **768–883px 平板档**（标题单行自然宽 883px 被裁切，不产生横向滚动）。
详见 `REFERENCE-NOTES.md` §7.1 与 `evidence/ego-ref/olek-si-viewport-metrics.json`。

### S3 可视化项目研究 ✅
18 个真实项目台账（GitHub API 实测许可）；9 个开源 + 9 个机构。
选出 3 个改编入选（均为 MIT），并记录**必须保留的差异**。

### S4 建筑目录研究 ✅
42 条案例，8 大区 / 7 时代 / 10 民族 / 19 省域 / 21 构造类别 / 54 个独立来源。
`yearText` 保留「始建于 X、重修于 Y」；`yearUncertainty` 单列；`caveat` 每条常驻。

### S5 数据纠错与合规加固 ✅（本轮重点）
1. **UNESCO 编号全面修正**：早期 16 个编号凭记忆填写、多数错误。
   改用 UNESCO **官方 GeoJSON 端点**逐条核对，得出中国 **61 条**官方条目映射
   （`data/unesco-cn-verified.tsv`，由 `scripts/build_unesco_verified.py` 生成）。
   苏州园林 439→**813**、天坛 440→**881**、平遥 1031→**812**、丽江 1002→**811**、
   皖南 1004→**1002**、土楼 447→**1113**、开平 446→**1112**、武当 442→**705**、
   承德 444→**703**、孔庙 441→**704**、大足 1069→**912**、乐山 1006→**779**。
   新增 8 个编号：439 / 880 / 1003 / 1305 / 707 / 1279 / 1334 / 1561。
2. **补两条案例**：`c41 洛阳桥`（UNESCO 1561 组成部分，含"种蛎固基"梁式石桥）、
   `c42 柏社村地坑窑院`（补上 18 类构造中唯一无案例的"窑洞"）。
   柏社村数据取自数字博物馆官方 JSON 端点（780 户 / 3756 人 / 5 类历史环境要素）。
3. **构造类别补齐 21 类**：新增 `roof-form`（屋顶类型）、`courtyard`（院落），
   并补 `mixed-frame`、`cave` 两组缺失的分组 → **构造类型与分组 21:21 全覆盖**。
4. **数据层教学示意标记**：每条 case 携带 `teachingNotice`，并在 meta / glossary / handoff 同步。
5. **合规隔离**：参考站抓取件（生产 bundle 575 391 B、CSS 块 321 882 B、令牌记录、UNESCO 快照）
   全部迁出 `data/` → `research-ref/`（非白名单隔离目录 + README）。
   `data/` 现有仅 2 个本项目自产文件。无效的 `sitemap.xml`（404 错误页）**已删除**。
   `scripts/extract_tokens.js` 改为默认从隔离目录读写，并显式声明令牌只作「机制参考」。
6. **发布冲突登记**：14-publish `build.mjs` 的 `keepDirs` 含 `data` → 产出
   `PUBLISH-EXCLUDE.txt` 精确清单 + `manifest.json` 的 `publish.excludeDirs/ExcludeFiles`（同源）。
7. **http 来源登记**：3 个 https 变体在本机 TLS 握手失败的链接，如实保留实测可用的 http 形式，
   登记为受控例外（两项断言守护），不伪造 https。

### S6 交付与验证 ✅
`scripts/validate_catalog.py` **73 项断言全部通过**（退出码 0），流水线幂等（连跑两轮 8 个关键产物**逐字节一致**）。
`QA.md` 由 `scripts/build_qa.py` 注入实时校验输出生成，不手写。

### S8 对齐 16 设计系统验收清单 V.1—V.13 ✅（本轮重点）
1. **自查方式**：16 的 `tools/ds-audit-tokens.mjs`（全库只读审计）判定 17 为 🟢——
   必备缺 0、必备值差 0、全量声明 129 / 缺 0 / 值差 0 / 暗色组 0 / 额外 0 / 顺序问题 0。
2. **修掉一个真实排版缺陷**：`body` 原写 `var(--ds-font-body, …, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", …)`，
   而 **`--ds-font-body` 在 16 的令牌里不存在** → 实际回退到自写字面栈，
   且 CJK 顺序是 `Noto Sans SC` → `PingFang SC` → `Microsoft YaHei`，
   **正好违反 §8 / V.11「覆盖完整的 CJK 族必须排在覆盖有限的子集之前」**（会致混排基线错位）。
   改为 `font-family: var(--ds-font-text);`，顺序由规范保证。
3. **V.12 全量整改**：自有 CSS 6 条 `font-family` 全部去掉字面 fallback（含 `var()` 内的），
   只保留 `var(--ds-font-text)` / `var(--ds-font-display)` / `var(--ds-font-mono)`；
   并加**两项校验断言**守护（字面字体族扫描 + `--ds-base` 不得在自有 CSS 声明）。
4. **`--ds-base` 改为入口注入**：原先在 `catalog.css` 里写 `--ds-base: "./assets/ds/"`，
   与 16 的 `--ds-base: ""` **同名不同义**（V.4）。按 §6 改为在**入口 HTML** 注入
   `<style>:root { --ds-base: ""; }</style>`（本页资源全相对，与挂载深度无关）；
   14-publish 若挂到站点子路径可改此值为站点基准。
5. **§7 降级块逐字对齐**：采用 16 的可复制块（`--ds-dur-*` 归 1ms、`animation/transition-duration: 1ms !important`、
   `scroll-behavior: auto !important`、`.ds-in` 位移与模糊归零）。
6. **实机测试 25 → 44 项**：补齐 V.1（新增 1280×800 / 768×1024 两档视口）、
   V.2（分级对比度：正文 ≥4.5 / 大字 ≥3 / UI ≥3，逐元素上溯背景色）、
   V.5（焦点环可见 + Tab 序列不被吞，99 个可聚焦元素）、
   V.8（运行期零外部请求）、V.9（字体零加载错误且全部来自自托管清单）、
   V.10（页面内相对 URL 全 200）、V.11（Noto Sans SC 未排在系统 CJK 族之前）。
7. **修掉一处自引用循环**：`data/validate-report.json` 由校验脚本自己重写，
   其尺寸记在清单里会导致报告文案在「一致/不一致」间摆动 → 清单漂移、幂等失败。
   已与 `manifest.json` 同类处理（只校验条目存在，不比尺寸），
   **连跑三轮 9 个关键产物 + 校验报告逐字节一致**。

### S7 成果页、发布契约与字段映射 ✅
1. **成果页**：新建 `src/catalog-page/`，产出 `dist/catalog.html`（中英双语，42 案例 / 74 术语 / 21 构造）+
   `dist/catalog.css` + `dist/assets/ds/**`（vendored 的 16 资源，与 16 原件 sha256 字节一致，
   `ASSET-SOURCE.json` 登记来源）。设计口径：全部走 `var(--ds-*)`、相对路径适配 Pages 子路径、
   `prefers-reduced-motion` 降级、`prefers-color-scheme` 跟随系统（**不硬钉 `data-ds-theme`**）。
2. **实机测试**：新增 `scripts/browser_test.mjs`（用 Node 内置 WebSocket 直接驱动 CDP，不引第三方包），
   **25/25 通过**——三视口无横向溢出、正文对比度 ≥4.5、触达达标（控件 ≥44px / 链接 ≥24px）、
   中英切换、构造筛选、搜索、skip link、reduced-motion、暗色切换、零控制台错误、零 4xx。
   顺带修掉三个真缺陷：chip 高度 36→44px、`favicon` 404、`data-ds-theme` 硬钉导致暗色失效。
   ⚠️ 该脚本已于 **S10** 按浏览器入口约定**停用并移除**，由 `scripts/ego_interactions.mjs` 取代。
3. **manifest 发布契约**：补 `id` / `description` / `entry` / `buildCommand` / `outputDir` / `status`
   （+ `kind` / `entryFiles` / `rebuildCommands` / `publish.standaloneSite`）。
   `PUBLISH-EXCLUDE.txt` 同步：新增 `src/`、`evidence/` 排除，并明确 **`dist/` 是应发布产物**、
   14 侧应走 `build.type = 'page'` 而非 `static` 直拷（static 的 `keepDirs` 不含 `dist`，会整页漏掉）。
4. **字段映射**：新增 `handoff/FIELD-MAPPING.md` + `handoff/field-mapping.json`——
   28 个案例字段 / 5 个来源字段 / 10 个术语字段逐条语义与来源、
   `yearUncertainty` 逐值规范映射（certain 21 / approx 15 / disputed 3 / not-applicable 3）、
   21 类构造 id 清单、19 三个适配层的写法约定、**8 条已知错位风险**、6 条红线。
   JSON 由 `scripts/build_field_mapping.py` **从数据现算**，不手写。
5. **校验加项**：`validate_catalog.py` 从 53 → **73 项**，新增「词表对齐」「成果页产物」「manifest 必需字段」
   三组断言（含 CSS 无硬编码色值/字体、相对路径、caveat 42/42 渲染、发布排除含 src 不含 dist）。
6. **发现并登记一处下游错位**：19 的 `src/data/upstream/catalog.meta.json` 是 23:04 旧快照，
   `structureTypes` 只有 19 个（缺 `cross-plan` / `caisson`）→ 19 侧 `SYSTEMS.length === 19`。
   已写入 `FIELD-MAPPING.md` §8.1 并**通知 19 重新 vendor**（本任务不写 19 目录）。

### S9 http 来源可达性复核 ✅
用 Ego 浏览器复测 3 个 http 来源的 https 可用性：https 变体全部 `net::ERR_CONNECTION_CLOSED`
（curl 通道独立复现 `SSL_ERROR_SYSCALL`），http 变体全部加载成功并取到真实标题
→ 如实保留 http、不伪造 https；`SOURCES.md` 新增「http 来源例外登记」一节
（由 `build_catalog.py` 生成）+ `validate_catalog.py` 的 `HTTP_SOURCE_EXCEPTIONS` + `QA.md` §3.1。

### S10 浏览器入口统一迁移到 Ego ✅（本轮重点）
**触发**：用户指令——17 目录内所有浏览器操作统一迁移到 **Ego 浏览器**（用户长期约定，2026-10-22）。

1. **待改造脚本清单与处置**

   | 原脚本 | 原通道 | 处置 |
   | --- | --- | --- |
   | `scripts/browser_test.mjs` | 本机无头 Chrome + 原生 CDP | **停用并移除** → `scripts/ego_interactions.mjs` |
   | `scripts/capture_cdp.mjs` | 原生 CDP 设备仿真 | **停用并移除** → `scripts/ego_capture.mjs` |
   | `scripts/capture.sh` | 本机无头 Chrome `--headless=new` | **停用并移除** → `scripts/ego_capture.mjs` |

2. **新增三个 Ego 脚本**
   - `scripts/ego_interactions.mjs`（18 KB）：成果页**交互类**验收，补共享工具不覆盖的项目
     （中英切换、构造筛选、搜索、skip link、焦点环、Tab 序列、字体栈顺序、子路径相对 URL、
     暗色对比度、三类卡片计数、caveat 42/42）→ **18/18 通过**。
   - `scripts/ego_capture.mjs`（4.4 KB）：**唯一**截图路径（http/https/file，light/dark，移动 @2x）。
   - `scripts/ego_ref_metrics.mjs`（7.6 KB）：参考站 16 档视口几何实测，内置重试退避、
     **失败不覆盖既有报告**。
3. **修掉 `ego_capture.mjs` 的真缺陷**：原实现把「目标文件已存在」当成成功 →
   截图全部超时失败却报 OK。改为**先删目标文件**、以 Ego 回报的 `ok` 字段判定、
   **HTTP ≥400 视为错误页拒绝取证**、失败即删除残留。
4. **修掉 Ego 回报解析缺陷**：`ego-browser nodejs` 把脚本 `console.log` 写到 **stderr**，
   只读 stdout 会误判「无回报」→ 改为 stdout + stderr 双流解析。
5. **验收分工**：共享工具 `tools/ego-qa/run.mjs` 跑标准项（**只读使用，不修改**），
   本目录脚本补交互类。共享工具首个视口需**先在同一 TaskSpace 预热**，
   否则 Ego 自身新标签页请求会被计为外部请求 → 首个视口必 FAIL。
6. **参考站取证全部重做**：5 张截图重取（Ego）+ 16 档视口几何实测
   → **推翻了旧结论**「390px 标题溢出」；真实缺陷在 768–883px 平板档。
7. **校验加项**：`validate_catalog.py` 75 → **84 项**，新增两组断言：
   - 「浏览器入口」：已停用脚本确已移除 / 可执行脚本无禁用技术启动调用 / Ego 脚本齐备且全走 ego-browser；
   - 「Ego 证据」：共享工具报告 4 档视口干净 / 交互类 verdict=PASS / 参考站采样成功率 ≥80% / 9 张截图非空。
8. **文档口径同步**：`README.md`（脚本表、复现命令、Ego 踩坑一节）、`STATUS.md`、
   `LICENSES.md`、`REFERENCE-NOTES.md`（§1 通道变更声明 + §7.1 更正记录）、`screenshots/INDEX.tsv`。
9. **流水线**：`run_pipeline.sh` 增加可选第 8 步 `EGO_ACCEPT=1`（自起停本地静态服务）。
   该步**不属字节级幂等链路**，默认不随流水线执行。

---

## 4. 关键决策

| 决策 | 理由 |
| --- | --- |
| 目录定位为「代表性样本」而非「完整名录」 | 明确不虚称穷尽；`catalog.meta.json` 的 `scope` 与 `limitations` 写明抽样口径 |
| 每条案例强制 `sources[]` ≥ 1 条一次来源 | 二手转载会放大年份错误，必须能回溯到官方/学术出处 |
| `yearUncertainty` 单列 | 中国古建筑多为「始建于 X、重修于 Y」，单写年份必然失真 |
| `imagePlan` 只记录许可状态，不下载图片 | 多数文保单位与博物馆图库为 ARR；主站应程序化生成配图 |
| 参考项目只提炼**机制** | 用户要求「参考机制做原创内容与模型，不冒充原作」 |
| 抓取件一律进 `research-ref/` 隔离区 | 14 的 `keepDirs` 含 `data`，第三方源码绝不能进公开仓库 |
| 交付物里的 token 只认 16 | `16-design-system/design-tokens.json`（Afterglow v1.0.0，`--ds-` 前缀）为唯一权威 |
| 教学示意声明下沉到**数据层字段** | 18 / 19 可直接透传，避免下游各写一套文案 |
| http 来源保留实测可用形式并登记 | https 变体本机不可用，如实登记原因，不伪造 |
| 先出 18 / 19 首批切片 | 要求「尽早首批交 18 和 19」，不等研究做完 |
| 令牌层一律 vendored 16 原件，不自建 | 16 的 `ds-audit-tokens.mjs` 判定 17 🟢（129 令牌 / 缺 0 / 值差 0 / 顺序问题 0）；自有 CSS 只做版式补充，且**不写死字体族**（V.12） |
| `--ds-base` 在入口注入而非 CSS 声明 | 16 的 §6 规定由入口注入；避免同名不同义（V.4）。本页资源全相对，与挂载深度无关 |
| **浏览器入口统一为 Ego**（用户长期约定，2026-10-22） | 网页访问、截图、调试、验收**只走 Ego 浏览器**；禁用内置 Browser 工具、Playwright / Puppeteer / `chromium.launch()`、本机无头 Chrome + 原生 CDP。目录内三个无头脚本**移除而非保留**，并由 `validate_catalog.py` 的「浏览器入口」组断言机器守护 |
| 参考站取证**用 Ego 重做**而非沿用旧图 | 旧截图由无头环境拍摄，**站方字体未加载**导致字宽偏大，把假象记成了站点缺陷。Ego 真实浏览器复测后**推翻了「390px 标题溢出」**，真实缺陷在 768–883px 平板档 |

---

## 5. 限制与阻塞（如实记录）

| # | 限制 | 状态 | 影响 |
| --- | --- | --- | --- |
| L-1 | 未对每个案例做现场测绘或原始档案核验 | 未做 | 核验强度以 `verification.level` / `evidenceLevel` 标注；13 侧如发现断代错误应以权威来源为准并回告修订 |
| L-2 | `olek.si` 案例详情页结论**从 CSS 反推**，未逐像素目视确认 | 部分未核验 | `REFERENCE-NOTES.md` §7 已标注；16 的 `REFERENCE-AUDIT.md` 可交叉印证 |
| L-3 | `olek.si` 动效未逐帧核验（未录屏） | 部分未核验 | CSS 定义与 DOM 编排属性为实测读取 |
| L-4 | `olek.si` hover / 交互态未核验（只读取证，避免对第三方产生副作用） | 未核验 | 同上 |
| L-5 | 本机到 `olek.si`、`whc.unesco.org` 存在间歇性 TLS 拦截 | 已绕过 | curl/node 直连 UNESCO 不可用，改用 Agent `web_fetch` 通道取官方端点；`scripts/verify_unesco.js` 实测未生效，失败日志留在 `research-ref/unesco-verified.tsv` |
| L-6 | 3 个来源链接的 https 变体本机不可用 | 已登记（**2026-10-22 两条独立通道复测**） | 保留实测可用的 http 形式，登记于 `HTTP_SOURCE_EXCEPTIONS` 与 `SOURCES.md`「http 来源例外登记」。复测：curl → `SSL_ERROR_SYSCALL`；**Ego Chromium → `net::ERR_CONNECTION_CLOSED`**；三个 http 变体在 Ego 中均加载成功并取到真实标题。**不伪造 https** |
| L-7 | 目录是代表性样本 | 事实 | 不代表全量；同一类型内其他重要实例未纳入 |
| L-8 | 无原始测绘数据或点云 | 事实 | 3D 只能做到教学示意，不得声称复原或测绘成果 |
| L-9 | 成果页的 3D / 剖面 / 受力能力**未实现** | 事实 | 本页只做目录与检索；教学示意声明已就位，3D 交互由 18 / 19 承担 |
| L-10 | 未复用任何第三方代码 | 事实 | 三个入选案例虽为 MIT，本任务只提炼机制；实际复用须按 `LICENSES.md` §2.4 署名 |
| L-11 | 成果页的**英译**为 17 自撰，非官方英文名 | 事实 | 来源机构有官方英文名的以其为准（见 `sources[].label`） |
| L-12 | `scripts/capture.sh` 在移动视口下产出**裁切伪影** | **已消除** | 该脚本已按浏览器入口约定**停用并移除**；截图一律走 `scripts/ego_capture.mjs`（Ego），失败自动删除残留，不会用旧文件冒充 |
| L-13 | 19 的 `src/data/upstream/catalog.meta.json` 尚未重新 vendor | **待 19 处理** | 19 侧 `SYSTEMS.length === 19`（应为 21），缺 `cross-plan` / `caisson`；详见 `handoff/FIELD-MAPPING.md` §8.1 |
| L-15 | 成果页的 3D / 剖面 / 受力能力**未实现** | 事实 | 本页只做目录与检索；教学示意声明已就位，3D 交互由 18 / 19 承担 |
| L-14 | 旧版成果页实机测试走**本机 headless Chrome + CDP**，非 Ego 浏览器 | **已消除（2026-10-22）** | 三个无头脚本（`browser_test.mjs` / `capture_cdp.mjs` / `capture.sh`）**已停用并移除**；参考站 5 张截图**全部用 Ego 重取**，成果页验收改由共享工具 + `ego_interactions.mjs` 完成。UNESCO 与机构页面的 curl 取证**有效、不必重取**；`research-ref/` 隔离标注维持不变 |
| L-16 | 旧结论「olek.si 390px 标题溢出」**已被 Ego 实测推翻** | **已更正** | 无头环境缺站方 Inter 字体导致假性溢出；真实缺陷在 **768–883px 平板档**（标题单行自然宽 883px 被裁切，且不产生横向滚动）。见 `REFERENCE-NOTES.md` §7.1、`evidence/ego-ref/olek-si-viewport-metrics.json` |
| L-17 | 本机到 `olek.si` 存在**间歇性** TLS / 代理失败 | 已缓解 | Ego 脚本内置重试退避；`ego_ref_metrics.mjs` 采样成功率 <80% 时**拒绝覆盖**既有报告并以退出码 1 结束；曾观测到 16 档中 11 档批量失败后重跑 16/16 成功 |

---

## 6. 目录内脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/build_catalog.py` | **唯一数据源**：catalog / meta / SOURCES / handoff（42 条 / 21 类 / 21 组） |
| `scripts/build_glossary.py` | 术语表（74 条），构建时校验案例与构造 id 存在性 |
| `scripts/build_unesco_verified.py` | 生成 `data/unesco-cn-verified.tsv`（中国 61 条官方编号映射） |
| `scripts/build_verification_status.py` | 生成 `handoff/VERIFIED-VS-ASSUMED.md` + `verification-status.json` |
| `scripts/build_field_mapping.py` | 生成 `handoff/field-mapping.json`（枚举分布与 id 清单由数据现算） |
| `scripts/build_manifest.py` | 文件清单（角色/字节/sha256）+ 发布契约 + `publish.exclude*` |
| `scripts/build_qa.py` | 生成 `QA.md`（注入校验脚本的**实时**输出） |
| `scripts/validate_catalog.py` | **84 项断言**（含「浏览器入口约定」「Ego 实测证据」两组）；`--json` 写 `data/validate-report.json` |
| `scripts/ego_interactions.mjs` | 成果页**交互类**验收（**走 Ego 浏览器**，18 项断言：卡片计数 / caveat 42/42 / 中英切换 / 构造筛选 / 搜索 / skip link / 焦点环 / Tab 序列 / 字体栈顺序 / 子路径 URL / 暗色对比度） |
| `scripts/ego_capture.mjs` | **Ego 浏览器唯一截图路径**（http/https/file，light/dark，移动 @2x；先删目标文件，失败即删残留，HTTP ≥400 拒绝取证） |
| `scripts/ego_ref_metrics.mjs` | 参考站**多视口几何实测**（走 Ego，16 档视口，内置重试退避，失败不覆盖既有报告） |
| `src/catalog-page/build-catalog-page.mjs` | 构建成果页 `dist/catalog.html` + `dist/catalog.css` + `dist/assets/ds/**` |
| `scripts/extract_tokens.js` | 从生产 bundle 提取令牌（**只读隔离目录**，输出只作机制参考） |
| `scripts/verify_unesco.js` | UNESCO 批量校验（**本机网络不通，实测未生效**，留作审计痕迹） |
| `scripts/{repair,fix_tuple,normalize,final}_quotes.py` | 中文引号规范化工具链（历史遗留，保留作审计痕迹） |

**复现顺序**（幂等，连跑两轮 8 个关键产物逐字节一致）：

```bash
bash scripts/run_pipeline.sh    # 退出码 0 = 84/84 断言全通过

# 手动逐条（与流水线等价）
python3 scripts/build_catalog.py && python3 scripts/build_glossary.py \
  && python3 scripts/build_unesco_verified.py && python3 scripts/build_verification_status.py \
  && python3 scripts/build_field_mapping.py \
  && node src/catalog-page/build-catalog-page.mjs \
  && python3 scripts/build_manifest.py && python3 scripts/build_qa.py \
  && python3 scripts/build_manifest.py && python3 scripts/validate_catalog.py   # 退出码 0 = 84/84

# 成果页实机测试（需先起静态服务；**只走 Ego 浏览器**）
python3 -m http.server 8899 --bind 127.0.0.1 --directory dist &
node scripts/ego_interactions.mjs --url http://127.0.0.1:8899/catalog.html \
  --out "$PWD/evidence/ego-interactions" --space "17-architecture ego-interactions"   # 18/18

# 或用流水线的可选第 8 步（自起停静态服务）
EGO_ACCEPT=1 bash scripts/run_pipeline.sh
```

---

## 7. 交接与发布边界

- **给 18**：`handoff/structure-groups.json`（21 组，含 `members` / `membersEn` / `assemblyOrder` /
  `forceNoteZh` / `forceNoteEn` / `relatedCases`）+ `glossary.json`（构件中文名来源）
  + `INTERACTION-BRIEF.md` M-01 ~ M-03 + `handoff/VERIFIED-VS-ASSUMED.md`（逐条「已核验 / 假设」标记，
  **42/42 的 3D 层面全标 assumption**，可据此先行实现）。
- **给 19**：`catalog.json`（42 条）+ `catalog.meta.json`（词表/统计，**21 类构造**）+ `glossary.json`（74 条）
  + `handoff/first-18.json`（18 例首批）+ `INTERACTION-BRIEF.md` M-04 ~ M-16
  + **`handoff/FIELD-MAPPING.md` / `field-mapping.json`（字段语义与适配约定）**。
  ⚠️ 19 需**重新 vendor `catalog.meta.json`**（现为 19 类，应为 21 类）。
  ⚠️ 19 的长标题兜底依据**已更正**：参考站标题缺陷在 **768–883px 平板档**（不是移动端），
  结论仍是「19 号须自行 `clamp()` / `overflow-wrap` 兜底」，但触发区间与成因按
  `REFERENCE-NOTES.md` §7.1 更正。
- **给 16**：本任务提供**观察证据**（`REFERENCE-NOTES.md` + 截图）；**取值由 16 决定**。
  成果页已 vendored 16 的 `tokens.css` / `components.css` / 自托管字体（**与原件字节一致**，
  见 `src/catalog-page/assets/ds/ASSET-SOURCE.json`），未自建色板或字体。
- **给 14**：`manifest.json`（92 个文件 + sha256 + **发布契约** id/entry/buildCommand/outputDir/status）、
  `PUBLISH-EXCLUDE.txt`（精确排除清单，含 `src/`、`evidence/`；明确 `dist/` 应发布）、
  `LICENSES.md` §8（无代码复用 / 无第三方图片 / 无第三方字体 / 无第三方模型）。
  接入方式：`build.type = 'page'` + `buildCommand`（**不要用 static 直拷**）。
- **本任务不越权**：不建仓、不 push、不部署；不改 00—16、18、19 任何目录。

---

## 8. 变更日志

- **2026-10-22 02:30** — S10 完成：目录内浏览器操作**全部迁移到 Ego 浏览器**。
  移除 `browser_test.mjs` / `capture_cdp.mjs` / `capture.sh` 三个无头 Chrome 脚本；
  新增 `ego_interactions.mjs`（交互类 18/18）、`ego_capture.mjs`（唯一截图路径）、
  `ego_ref_metrics.mjs`（参考站 16 档几何）；修掉截图脚本「旧文件冒充成功」与
  「只读 stdout 漏解析 stderr」两个真缺陷；参考站 5 张截图全部用 Ego 重取，
  **推翻了旧结论「390px 标题溢出」**（真实缺陷在 768–883px 平板档）；
  校验 75 → **84 项**（新增「浏览器入口」「Ego 证据」两组断言）；流水线加可选
  `EGO_ACCEPT=1` 第 8 步；`README` / `STATUS` / `LICENSES` / `REFERENCE-NOTES` /
  `screenshots/INDEX.tsv` 口径同步。
- **2026-10-22 00:56** — S9 完成（续作增量，仅做未完成项）：按监工要求**用 Ego 浏览器复测** 3 个 http 来源的 https 可用性，
  两条独立通道（curl / Ego Chromium）结论一致 → 如实保留 http、不伪造 https；
  新增 `SOURCES.md`「http 来源例外登记」一节（由 `build_catalog.py` 生成，含两条通道的实测错误码与 http 变体真实标题）；
  `HTTP_SOURCE_EXCEPTIONS` 与 `QA.md` §3.1 同步补入 Ego 证据。全库 U+FFFD = 0，校验 **75/75**，流水线三轮幂等。
- **2026-10-21 23:58** — S7 完成：成果页 `dist/catalog.html` 建成并通过 **25/25** 实机测试（CDP）；
  manifest 补齐发布契约字段；`PUBLISH-EXCLUDE.txt` 增 `src/`、`evidence/` 并声明 `dist/` 应发布；
  新增 `handoff/FIELD-MAPPING.md` + `field-mapping.json`；校验 53 → **73 项全通过**；流水线幂等复验通过。
- 2026-10-21 23:20 — S6 完成：53/53 校验通过；QA.md 改为脚本生成；STATUS 收尾。
- 2026-10-21 23:10 — 隔离参考站抓取件至 `research-ref/`；删除无效 `sitemap.xml`；补 token 只认 16 的口径。
- 2026-10-21 22:40 — 生成真实 `data/unesco-cn-verified.tsv`（61 条官方编号）；`extract_tokens.js` 改读隔离目录。
- 2026-10-21 22:20 — 修正 UNESCO 编号；新增 `c41 洛阳桥`、`c42 柏社村`；构造类别 19→21（含 roof-form / courtyard）并补齐 21 组分组；引入 `teachingNotice` 数据层字段。
- 2026-10-21 21:30 — 完成 `glossary.json`（74 条）与 `INTERACTION-BRIEF.md`（M-01 ~ M-16）。
- 2026-10-21 19:20 — 完成 S3 视觉化项目台账（18 个）与 S4 建筑目录初版（40 条）。
- 2026-10-21 18:5x — 读取 `PROMPT.md` / `MASTER-UPDATE.md`；读取下游契约与 05 范式；写入 `TASK.md` / `STATUS.md`；进入 S2 取证。
