# LICENSES — 许可、素材与署名边界

> 任务：17-architecture-research ｜ 版本 1.0.0 ｜ 2026-10-21
> 本目录**不携带任何第三方图片素材**，因此没有需要随站点分发的图片许可问题。
> 本文记录的是**机制借鉴边界、字体/模型素材边界与署名规则**，供 16 / 19 / 13 / 14 执行。

---

## 0. 一句话

> **借机制，不搬素材；自建模型与文案；外链来源，不冒充作者。**

---

## 1. 本目录自身的产出

| 产物 | 许可 | 说明 |
| --- | --- | --- |
| `catalog.json` / `catalog.meta.json` / `glossary.json` | 本项目自有 | 原创撰写的目录与术语表 |
| `handoff/*.json` / `handoff/*.md` | 本项目自有 | 由 `scripts/build_catalog.py` / `build_field_mapping.py` / `build_verification_status.py` 生成 |
| `INTERACTION-BRIEF.md` / `README.md` / `LICENSES.md` / `QA.md` / `STATUS.md` | 本项目自有 | 原创文档 |
| `scripts/*` | 本项目自有 | 原创脚本 |
| `src/catalog-page/*` | 本项目自有 | 成果页源码（`build-catalog-page.mjs` / `catalog.css` / `favicon.svg`） |
| `dist/catalog.html` / `dist/catalog.css` / `dist/favicon.svg` | 本项目自有 | 成果页构建产物（`favicon.svg` 为原创简笔「斗栱」符号） |
| `manifest.json` / `PUBLISH-EXCLUDE.txt` | 本项目自有 | 发布清单与排除规则 |
| `data/unesco-cn-verified.tsv` | 本项目自有 | 由 `scripts/build_unesco_verified.py` 从**官方 GeoJSON 端点**整理 |
| `data/validate-report.json` | 本项目自有 | 校验脚本输出 |
| `evidence/*` | 本项目自有 | 自产实测证据（浏览器测试报告 + 成果页截图），**不随站点发布** |
| `src/catalog-page/assets/ds/**` 与 `dist/assets/ds/**` | **16-design-system 原创 + OFL 字体** | vendored 副本，与 16 原件 sha256 **字节一致**（见 `ASSET-SOURCE.json`）。字体为 **SIL Open Font License 1.1**，许可原文 `OFL-*.txt` 必须与字体同目录保留、随站点分发时同样保留 |
| `research-ref/*`（含 `olek-index.js`、`olek-css-blocks.txt`、`olek-tokens.json`、`unesco-cn.html`、`unesco-verified.tsv`） | **他人资产 / 隔离区** | 参考站观察证据，**不进入交付物、不随站点发布**；见 `research-ref/README.md` |
| `screenshots/*.png` | **仅作内部观察证据** | 同上；**不得**出现在 19 号页面或任何对外产物中 |

**发布方注意（14-publish）**：精确排除清单见 [`PUBLISH-EXCLUDE.txt`](PUBLISH-EXCLUDE.txt)；
`research-ref/`、`screenshots/`、`evidence/` 属内部取证材料，发布前须确认它们不被 `dist/` 包含。
`dist/` 本身是**应发布**产物，其中的 OFL 字体许可文本须随字体一并保留。

---

## 2. 开源参考项目（GitHub API 实测许可）

许可结论见 `REFERENCES.md` §1 与 §4。要点复述：

| 项目 | 许可 | 借鉴机制 | 复用代码 | 搬运素材 |
| --- | --- | --- | --- | --- |
| R1 `threejs-architecture-effects` | **MIT**（`spdx_id: MIT`） | ✅ | ✅ | ⚠️ 仓库内素材需另查 |
| R2 `aLOTofImaginArches` | **MIT** | ✅ | ✅ | ⚠️ 论文配图需另查 |
| R3 `chbim-prototype` | 代码 **MIT** | ✅ | ✅ 代码 | ❌ **文档与编码体系保留所有权利** |
| R7 `chinese-chess` | **MIT** | ✅ | ✅ | ⚠️ 贴图为程序化生成，可参考做法 |
| R8 `origami-elephant` | **MIT** | ✅ | ✅ | ⚠️ |
| R9 `threejs-towers` | 随仓库条款 | ✅ | ⚠️ | ❌ |
| R4 `temple-of-heaven-deepseek-flash` | **未声明** | ✅ | ❌ | ❌ |
| R5 `ancient-architecture` | **未声明** | ✅ | ❌ | ❌ |
| R6 `kage` | **未声明** | ✅ | ❌ | ❌ |

### 2.1 「未声明」的默认处理

对 R4 / R5 / R6：**默认按「保留一切权利」处理**。
只读其公开介绍与截图以理解**交互机制**，**不复用代码、不搬运美术、不复制命名**。

### 2.2 MIT 不覆盖素材

MIT 许可通常只覆盖**代码**。项目仓库中的**图片、字体、3D 模型、贴图**可能另有权利
（例如从第三方模型站下载的素材、CC-BY-NC 素材）。
→ **我方不搬运任何参考项目的素材**，19 号配图一律程序化生成。

### 2.3 R3 的特别约定

`chbim-prototype` 的**代码**为 MIT，但其**编码体系与文档受著作权保护**（论文见刊后转 CC BY 4.0）。
我方**自建中文构件与轴线命名**（檐柱 / 金柱 / 阑额 / 普拍枋 / 蜀柱 / 叉手 …），
**不复制**其 `yanzhu[CAO_Fo, JIAN_L1]` 式编码，也不复制其图纸表达。

### 2.4 「复用代码」的正确姿势

若 18/19 决定实际复用 MIT 代码：

1. 在 `LICENSE` 与页脚**保留原版权声明与 MIT 许可全文**；
2. **显著标注**该模块来自哪个项目（这与「不冒充原作」不矛盾——署名是许可义务）；
3. 只复用**代码**，不搬运其素材；
4. 在 `LICENSES.md` 增补「实际复用清单」：项目、版本/commit、复用文件、原作者。

> **当前状态：本任务未复用任何第三方代码。** 上表「复用代码 ✅」表示*允许*，不表示*已发生*。

---

## 3. 机构类来源（博物馆 / 展览 / 数字博物馆）

R10–R18 共 9 个：**内容著作权一律归机构**，无可开源代码。

**允许**：
- 引用其**公开表述**（带链接与访问日期）；
- 借鉴其**机制**（如「榫卯拼搭 + AR 拆解」「构件查图屏」「按抬梁/穿斗/干栏/井干分类」）；
- 在案例页**外链**其官网或展讯页。

**禁止**：
- 下载并再分发其**图片、三维模型、展陈视频、展陈图纸**；
- 复刻其**展陈视觉设计**；
- 使用其商标 / 馆徽 / 展览主视觉。

| 机构 | 用于 | 引用方式 |
| --- | --- | --- |
| 中国传统村落数字博物馆（住建部） | 村落案例、构造分类 | 案例页「来源」列表 |
| 南方丝绸之路特色建筑艺术数字博物馆 | 抬梁/穿斗/干栏/井干分类口径 | 分类页脚注 |
| 山西古建筑博物馆线上馆 | 山西木构案例 | 案例页来源 |
| 清华「芥子须弥·开化」 | 测绘方法论 | 长文转述 + 外链 |
| 「营造江南」展（德寿宫 / 保国寺） | 榫卯拼搭、AR 拆解机制 | 机制页脚注 |
| WorldSkills Museum 木结构展 | 构件命名、查图屏机制 | 机制页脚注 |
| 青州博物馆《木石分野》 | 木石对照叙事 | 机制页脚注 |
| 山河营造「榫卯记忆」 | 构件重组动效 | 机制页脚注 |
| 泰顺廊桥保护监管平台 | 廊桥数量与桥型数据 | 数据表脚注 |

---

## 4. UI 参考站 olek.si

| 项 | 判定 |
| --- | --- |
| 站点内容（文字、图像、字体、代码） | 他人资产，**著作权保留** |
| 本目录保存的 `research-ref/olek-index.js`（生产 bundle 快照） | **仅供内部研究**；MIT 等开源许可**不覆盖**专有站点 bundle；**不得随站点发布或再分发** |
| `screenshots/*.png` | **仅供内部观察**；**不得**出现在 19 号页面。2026-10-22 起全部由 **Ego 浏览器**实拍（`screenshots/INDEX.tsv` 记录采集通道） |
| 设计令牌（色值、字体名、缓动参数） | **可作为机制参考的事实记录**，但**不得直接沿用其色值与字体文件** |

### 4.1 字体特别提示

olek.si 的 `@font-face` 指向**其自有字体资产**（display / text / inter-t/d/r 五支 woff2）。
**19 号与 16 号不得引用这些字体文件。**
本目录只记录了「该站用了几支字体、字重如何搭配」这一层事实。

抓取件现已隔离在 `research-ref/`（`olek-index.js`、`olek-css-blocks.txt`、`olek-tokens.json`）。
`scripts/extract_tokens.js` 已改为默认从该隔离目录读入、写出，并在文件头显式声明：
**设计令牌只作「机制参考」，不复制色值与字体文件**。

### 4.2 机制 ≠ 表达

以下**机制**可用（16 号自行实现、另行取值）：

- 按底色亮度自动判定 `dark/light` 并切换前景色；
- 「一个控件同时做筛选与定位」的时间轴思路；
- `id / date / accent / name / summary` 五字段内容模型；
- 逐词入场 + `perspective` 纵深（**但方向必须不同**，避免外观雷同）；
- `mask-image` 让大标题下缘淡出。

以下**不得**照搬：色值、字体文件、字标与头像、页面文案、圆角与阴影的具体数值、
`.gallery > div:hover { scale:1.01 }` 这类具体样式。

### 4.3 必须规避的对方缺陷（2026-10-22 由 Ego 实测更正）

实测确认：标题单行自然宽度 **883px**，在 **768 < viewport < 883px** 区间
（实测 800 / 820 / 840 / 880 命中，溢出 3–83px；900px 及以上与 768px 均不命中）
被容器裁切，且 `scrollWidth` 始终等于视口宽 → **不产生横向滚动条**，视觉表现为右侧文字被切掉。
→ 19 号中文长标题须用 `overflow-wrap` / `clamp()` 自行兜底，**不得照搬**。

> ⚠️ 更正说明：旧记录写作「390 px 视口下超出右边界被裁切」，**已被 Ego 真实浏览器实测推翻**
> （390px 下 `scrollWidth == clientWidth == 390`，标题最右词边界 345px，无溢出）。
> 成因是无头环境未加载站方 Inter 字体、fallback 字体更宽所致的**假象**。
> 结论（长标题须自行兜底）不变，但**触发区间与成因**按上更正。
> 证据：`evidence/ego-ref/olek-si-viewport-metrics.json`、`REFERENCE-NOTES.md` §7.1。

---

## 5. 数据与事实引用

- **事实性表述**（年代、形制、做法、数量、等级）必须可回溯到 `SOURCES.md` 中的一条链接。
- 引用机构页面时，**写明机构名与链接**，并保留 `accessedAt`。
- 数量、年代、规模类数据若来自公开报道，应**在文案中保留其限定语**
  （如「据泰顺县人民政府公开数据，全县有 32 座古廊桥」），不要改写成无主语的断言。
- **不可核验者写「未核验」**，不得臆造。`REFERENCE-NOTES.md` §7 与
  `REFERENCES.md` §5 是本任务的既有范例。

---

## 6. 署名规则

| 情形 | 允许的写法 | 禁止的写法 |
| --- | --- | --- |
| 借鉴了某开源项目的**机制** | 「交互机制参考 XXX 开源项目」 | 「改编自 XXX」而未实际复用代码 |
| 实际**复用**了 MIT 代码 | 显著署名 + 保留 MIT 全文 + 原作者姓名 | 删除版权声明 |
| 引用了**机构**的事实 | 「据 XX 博物馆公开资料」+ 外链 | 把机构内容写成我方原创 |
| 数据来自 UNESCO | 「UNESCO 世界遗产编号 NNN」+ 链接 | 编号凭记忆填写（**本任务已修正**） |
| 展示**我方**的 3D 模型 | 「教学示意，非施工/工程模型」 | 声称为测绘成果或复原依据 |

> **不冒充**具体包括：不用参考项目的名称做我方项目名；不把参考项目的作者写成我方作者；
> 不暗示我方与任何机构、作者存在合作或授权关系。

---

## 7. 下游执行清单

### 16 号（UI 规范）
- [ ] 令牌、字体、版式**全部原创**；olek.si 的实测值只作机制参考。
- [ ] **交付物里的 token 唯一权威来源 = `16-design-system/design-tokens.json`**（Afterglow v1.0.0）；
      字体用 16 的自托管清单（Space Grotesk / Inter / Space Mono / Noto Sans SC，OFL），
      不引用 olek.si 的字体资产，也不在本目录另立 token 文件。
- [ ] **不引用** olek.si 的任何字体文件。
- [ ] 规范中写入 `prefers-reduced-motion` / `prefers-color-scheme` 支持条款。

### 18 号（3D 教学模型）
- [ ] 模型**全部自制**，或复用 MIT 代码并按 §2.4 署名。
- [ ] 每个模型附 `caveat` 与来源链接。
- [ ] 模型与剖面带「教学示意，非施工/工程模型」标注。
- [ ] 不使用任何参考项目的模型文件或贴图。

### 19 号（主站）
- [ ] 配图**程序化生成**；需要真实影像时**外链来源机构**。
- [ ] **页面中不出现** `data/` 与 `screenshots/` 中的任何文件。
- [ ] 案例页显示 `sources[]` 与 `caveat`。
- [ ] 文案不声称穷尽；年代用多层信息而非单一年份。

### 13 号（QA）
- [ ] 检查产物中是否混入第三方图片、字体、模型或参考项目截图。
- [ ] 检查是否有「改编自 X」这类不实署名。
- [ ] 检查所有 3D 视图的免责标注。

### 14 号（发布）

> ⚠️ **已登记的规则冲突（需 14 侧处理）**
>
> 14-publish/release/scripts/build.mjs 第 228 行：
> `const keepDirs = ['data', 'public', 'assets', 'exhibits', 'models', 'fonts'];`
>
> `data` **在发布白名单内**，而本目录 `data/` 曾装有参考站抓取件 → 与本文「data/ 不随站点发布」直接冲突。
>
> **当前状态：冲突已消除。** 参考站抓取件已全部迁出 `data/`，进入隔离目录 `research-ref/`；
> `data/` 现在只剩本项目自产的两个文件。但 `data` 仍在 14 的白名单里，
> 因此**仍需 14 侧显式排除**（不能依赖默认行为）。
>
> **精确排除清单见 [`PUBLISH-EXCLUDE.txt`](PUBLISH-EXCLUDE.txt)**（14 侧可直接读取该文件做机械拦截），
> 同一清单也以 `manifest.json` → `publish.excludeDirs` / `publish.excludeFiles` 提供。

- [ ] 发布内容**不含** `research-ref/`、`screenshots/`、`evidence/`、`scripts/`、`handoff/`、`data/`、`src/`。
- [ ] 根目录台账文件（`catalog.json` / `catalog.meta.json` / `glossary.json` / `manifest.json` /
      `TASK.md` / `STATUS.md` / `README.md` / `LICENSES.md` / `QA.md` / `REFERENCES.md` /
      `REFERENCE-NOTES.md` / `INTERACTION-BRIEF.md` / `SOURCES.md` / `PUBLISH-EXCLUDE.txt`）
      **不进入 dist/**。注意 `keepExts` 含 `.json`，`.json` 台账需单独排除。
- [ ] **`dist/` 是应发布产物**：按 `build.type = 'page'` + `buildCommand` 构建
      （`node src/catalog-page/build-catalog-page.mjs` → `outputDir = dist` → `entry = dist/catalog.html`）。
      **不要用 `static` 直拷**——`keepDirs` 不含 `dist`，直拷会整页漏掉。
- [ ] `dist/assets/ds/fonts/` 内的 OFL 字体许可文本（`OFL-*.txt`）**必须随字体一并保留**。
- [ ] 19 号若要把 `catalog.json` / `glossary.json` 打进站点，应在 **19 自己的构建产物内**重新生成或复制，
      而非直接引用本目录路径。
- [ ] 若实际复用了 MIT 代码，随仓库附上第三方许可与署名清单。

---

## 8. 当前状态

| 项 | 状态 |
| --- | --- |
| 实际复用的第三方代码 | **无** |
| 随发布的第三方图片 | **无**（`imagePlan.status = not-included`） |
| 随发布的第三方字体 | **无**（成果页用的是 16 自建的 OFL 字体，非参考站字体） |
| 随发布的第三方 3D 模型 | **无** |
| 随发布的第三方 CSS / 令牌 | **无**（`dist/assets/ds/**` 是 16 的 vendored 副本，来源已登记） |
| 内部取证材料（`research-ref/`、`screenshots/`、`evidence/`） | 有，**标记为不发布** |
| 取证与验收的浏览器通道 | **仅 Ego 浏览器**（用户真实浏览器，含扩展与 UI）。本机无头 Chrome / Playwright / Puppeteer / 原生 CDP 脚本已**停用并移除**；`validate_catalog.py` 的「浏览器入口」组断言机器守护该约定 |
| 需署名事项 | **无**（无代码复用） |

---

*本目录引用的每个外部来源，其许可与访问状态记录在 `REFERENCES.md` 与 `SOURCES.md`；有疑问时以原站声明为准。*
