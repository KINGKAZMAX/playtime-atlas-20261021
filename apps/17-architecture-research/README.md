# 17-architecture-research · 中国经典建筑与传统结构联网研究

> **构筑华夏 / Built in China** 上游研究底稿
> 版本 1.0.0 ｜ 2026-10-21 ｜ 执行：MiniMax M3.1-Flash（max）

本目录是 18（3D 教学模型）、19（双语科普主站）、16（UI 规范）、13（QA）、14（发布）
的**唯一研究来源**。它交付可核验的目录、术语表、来源台账与交互机制规格。

**本任务不建仓、不 push、不部署** —— GitHub 同步与 Pages 上线由 **14-publish** 独家负责。

---

## 1. 这个目录里有什么

| 文件 | 是什么 | 给谁用 |
| --- | --- | --- |
| [`TASK.md`](TASK.md) | 任务定义、字段规格、验收标准、下游契约 | 全员 |
| [`STATUS.md`](STATUS.md) | 阶段状态、关键决策、限制、变更日志 | 15-supervisor / 13 |
| [`catalog.json`](catalog.json) | **建筑案例主目录（42 条）** | 19 / 18 / 13 |
| [`catalog.meta.json`](catalog.meta.json) | 词表、统计、字段说明、限制声明、UNESCO 编号核验方法 | 19 / 18 / 16 / 13 |
| [`glossary.json`](glossary.json) | **术语表（74 条，8 类）** | 19 / 18 / 16 |
| [`REFERENCES.md`](REFERENCES.md) | **交互可视化项目台账（18 个）**：网址 / 作者 / 交互 / 模型 / 许可 | 18 / 19 / 16 |
| [`REFERENCE-NOTES.md`](REFERENCE-NOTES.md) | **olek.si 实测观察记录**（含 5 张实拍截图） | 16 / 19 |
| [`INTERACTION-BRIEF.md`](INTERACTION-BRIEF.md) | **交互机制规格书**（M-01 ~ M-16 + 通用约定） | 18 / 19 / 16 / 13 |
| [`SOURCES.md`](SOURCES.md) | 逐条来源台账（每条一行的可点击来源） | 19 / 13 / 14 |
| [`LICENSES.md`](LICENSES.md) | 许可与素材边界（含「不得照搬」清单） | 16 / 19 / 13 / 14 |
| [`QA.md`](QA.md) | 验收结果与测试证据 | 13 / 14 |
| [`manifest.json`](manifest.json) | 全目录文件清单（角色 / 字节 / sha256）+ 发布契约（id / entry / buildCommand / outputDir / status） | 14 / 13 |
| [`PUBLISH-EXCLUDE.txt`](PUBLISH-EXCLUDE.txt) | **发布前必须排除的精确路径清单**（供 14-publish 机械拦截） | 14 |
| [`dist/catalog.html`](dist/catalog.html) | **研究成果页**（中英双语，42 案例 / 74 术语 / 21 构造；可独立部署） | 14 / 19 / 13 |
| `handoff/` | 给 18 与 19 的交接切片（含 [`FIELD-MAPPING.md`](handoff/FIELD-MAPPING.md) 字段映射说明） | 18 / 19 |
| `src/catalog-page/` | 成果页源码（构建脚本 + 样式 + vendored 的 16 设计系统资源） | 14 / 16 |
| `scripts/` | 全部可复现脚本 | — |
| `evidence/` | 本任务自产实测证据（浏览器测试报告 + 成果页截图），**不随站点发布** | 13 |
| `screenshots/` | olek.si 实拍截图（内部观察证据） | 16 / 19 |
| `research-ref/` | **隔离区**：参考站抓取件（生产 bundle / CSS / 令牌记录 / UNESCO 快照）。非本项目产物，**不进入交付物、不进入公开仓库** | 16 / 13 |
| `data/` | 本项目自产的派生数据（UNESCO 官方编号映射、校验报告） | 13 / 19 |

### 1.1 成果页

`dist/catalog.html` 是本目录的**可独立部署成果页**：中英双语同 DOM 切换（记忆偏好）、
搜索 + 大区 / 时代 / 构造三级筛选、42 条案例卡（年代 / 结构原理 / 文化背景 / 逐条来源链接 /
caveat / 教学示意声明）、74 条术语卡、21 类构造卡。

```bash
node src/catalog-page/build-catalog-page.mjs     # → dist/catalog.html + dist/catalog.css + dist/assets/ds/**
```

设计口径：全部取值走 16 的 `var(--ds-*)`（`src/catalog-page/assets/ds/tokens.css` 与 16 原件
**字节一致**，见 `ASSET-SOURCE.json`）；资源路径相对化以适配 GitHub Pages 子路径；
`--ds-base` 按 16 的 `MIGRATION-NOTES.md` §6 **在入口 HTML 注入**（不在自有 CSS 里声明，避免同名不同义）；
`prefers-reduced-motion` 降级块逐字采用 16 的 §7 可复制块；`prefers-color-scheme` 跟随系统（不硬钉 `data-ds-theme`）；
控件触达 ≥44px（`--ds-target-min`）、正文链接 ≥24px；自有 CSS **零字面字体族**（V.12）。

**对 16 验收清单 V.1—V.13 的覆盖**：

| 项 | 覆盖 | 证据 |
| --- | --- | --- |
| V.1 水平溢出 | ✅ 五视口 1440 / 1280 / 820 / 768 / 390 全部 `scrollWidth ≤ innerWidth` | `evidence/browser-test-report.json` |
| V.2 对比度 | ✅ 正文 ≥4.5、大字 ≥3、UI ≥3，逐元素上溯背景色实测 | 同上（6 个取样点） |
| V.3/V.4/V.11/V.13 令牌 | ✅ 16 的 `tools/ds-audit-tokens.mjs` 判定 17 为 🟢（声明 129 / 缺 0 / 值差 0 / 顺序问题 0） | 16 的只读审计输出 |
| V.5 焦点可达 | ✅ 99 个可聚焦元素，焦点环全部可见，Tab 序列不被吞 | 实测报告 |
| V.6 触摸目标 | ✅ 控件 ≥44px、正文链接 ≥24px | 实测报告 |
| V.7 reduced-motion | ✅ 时长归 1ms、位移与模糊归零、`scroll-behavior: auto` | 实测报告 |
| V.8 零外部请求 | ✅ 运行期全部为 127.0.0.1 本地请求 | 实测报告 |
| V.9 字体本地化 | ✅ 5 个 @font-face 零加载错误，已加载族全部来自自托管清单 | 实测报告 |
| V.10 子路径 | ✅ 页面内 5 个相对 URL 全部 200 | 实测报告 |
| V.12 不自造字体栈 | ✅ 自有 CSS 6 条 `font-family` 零字面字体族（含 `var()` fallback 内） | 校验断言守护 |

实机验证（`scripts/browser_test.mjs`，CDP 驱动本机 Chrome，只访问 127.0.0.1）：**44/44 通过**，
报告见 `evidence/browser-test-report.json`。

---

## 2. 数据一览

```jsonc
// catalog.json → cases[0]
{
  "id": "c01-nanchan-main-hall",
  "nameZh": "南禅寺大殿",
  "nameEn": "Main Hall, Nanchan Temple",
  "pinyin": "Nánchán Sì Dàdiàn",
  "region": "north", "regionZh": "华北", "regionEn": "North China",
  "province": "山西", "locality": "五台县",
  "era": "sui-tang", "eraZh": "隋唐",
  "yearText": "唐建中二年（781）创建，现存大殿为唐大历年重建（782）",
  "yearUncertainty": "确切",              // 确切 / 约略 / 不适用
  "type": "佛寺殿堂",
  "structureTypes": [ { "id": "tailiang", "labelZh": "抬梁式", "gloss": "…" } ],
  "ethnicGroup": "汉",
  "principleZh": "…", "principleEn": "…",  // 构造原理
  "cultureZh": "…",  "cultureEn": "…",     // 文化价值
  "culturalKeywords": ["唐", "…"],
  "sources": [ { "label": "…", "url": "https://…", "type": "unesco",
                 "evidenceLevel": "primary-verified", "accessedAt": "2026-10-21" } ],
  "imagePlan": { "status": "not-included", "reason": "…", "plan": "…" },
  "verification": { "level": "primary-verified", "checkedAt": "2026-10-21" },
  "caveat": "…"                             // 每条常驻
}
```

### 覆盖统计（构建脚本实测输出）

| 维度 | 数量 | 维度 | 数量 |
| --- | --- | --- | --- |
| 建筑案例 | **42** | 构造类别 | **21** |
| 构造分组（有组装顺序） | **21** | 术语条目 | **74** |
| 大区 | 8 | 时代 | 7 |
| 民族 | 10 | 省域 | 19 |
| 独立来源 | 54 | 首批交接 | 18 例 |

---

## 3. 怎么复现

```bash
cd 17-architecture-research

# 1) 重建目录（唯一数据源：scripts/build_catalog.py）
python3 scripts/build_catalog.py

# 2) 重建术语表
python3 scripts/build_glossary.py

# 2b) 重建 UNESCO 官方编号映射（data/unesco-cn-verified.tsv）
python3 scripts/build_unesco_verified.py

# 2c) 重建核验状态表（handoff/VERIFIED-VS-ASSUMED.md + verification-status.json）
python3 scripts/build_verification_status.py

# 2d) 重建字段映射表（handoff/field-mapping.json）
python3 scripts/build_field_mapping.py

# 3) 重建成果页（dist/）
node src/catalog-page/build-catalog-page.mjs

# 4) 重建清单
python3 scripts/build_manifest.py

# 5) 重建 QA（注入校验脚本的实时输出）
python3 scripts/build_qa.py

# 6) 校验（任一 FAIL 时退出码为 1）
python3 scripts/validate_catalog.py
python3 scripts/validate_catalog.py --json     # 额外写 data/validate-report.json
```

`build_catalog.py` 是**唯一真相**：所有 JSON 与 Markdown 产物都由它生成，可随时重建。
改动请改脚本，不要手改 JSON。

### 成果页实机测试

```bash
# 起本地静态服务
python3 -m http.server 8899 --bind 127.0.0.1 --directory dist &

# 25 项断言：溢出 / 对比度 / 触达 / 语言切换 / 筛选 / 搜索 / skip link /
#            reduced-motion / prefers-color-scheme / 控制台 / 网络
node scripts/browser_test.mjs --url http://127.0.0.1:8899/catalog.html
# → evidence/browser-test-report.json

# 截图（CDP 设备仿真，与测试同一通道）
node scripts/capture_cdp.mjs http://127.0.0.1:8899/catalog.html \
  evidence/catalog-desktop-1440x900-light.png 1440 900 desktop light
```

> ⚠️ `scripts/capture.sh`（`--force-device-scale-factor=2` + `--window-size`）在移动视口下
> 会产出**被裁切的伪影图**（布局宽于视口后再裁剪）。成果页截图一律用
> `scripts/capture_cdp.mjs`（`Emulation.setDeviceMetricsOverride`），
> 它与 `browser_test.mjs` 同通道、度量一致。
>
> ⚠️ **浏览器使用约定**（用户长期约定，2026-10-22 起对所有任务生效）：
> `scripts/browser_test.mjs` 与 `scripts/capture_cdp.mjs` **只访问 127.0.0.1**
> （本地静态服务 + 本地 CDP 端口），零对外请求，用于**本地构建产物**的回归验证；
> **对外站点**（参考站 olek.si、机构页面、线上站点）的访问与截图一律走
> Ego 浏览器（`/Users/mekzenx2/.local/bin/ego-browser`，先运行 `ego-browser skill`）。

### 重新取证（olek.si）

```bash
# 生产 bundle → 令牌
curl -sS --max-time 40 --retry 2 --retry-delay 3 -A "<UA>" \
  "https://olek.si/assets/index-Cq43OVCY.js" -o research-ref/olek-index.js
node scripts/extract_tokens.js research-ref/olek-index.js research-ref

# 截图（内置重试 + 递增退避；实测第 1~2 次即可成功）
CAPTURE_ATTEMPTS=6 bash scripts/capture.sh "https://olek.si" \
  screenshots/olek-si-desktop-1440x900.png 1440 900 desktop
```

> ⚠️ 本机到 `olek.si` 与 `whc.unesco.org` 存在间歇性 TLS 拦截：
> curl / node 直连 UNESCO **不可用**，只有 Agent 的 `web_fetch` 通道稳定可达。
> UNESCO 编号因此改用官方 GeoJSON 端点核验（见 §4）。
> `scripts/verify_unesco.js` 因此**实测未生效**，保留作审计痕迹。

---

## 4. 数据可信度：怎么核的

| 层级 | 标记 | 含义 |
| --- | --- | --- |
| 一手 · 已核 | `primary-verified` | 本任务**实际访问并读到该页内容** |
| 一手 · 转述 | `primary-cited` | 官方机构页面，内容经官方发布稿转述 |
| 二手 | `secondary` | 百科类来源，仅作补充 |

**UNESCO 世界遗产编号**：此前目录中 16 个编号是**凭记忆填写**的，多数错误。
本任务改用 UNESCO 官方 GeoJSON 端点逐条核对：

```
https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1
```

该端点返回每条遗产的 `id_no`、正式英文名与**组成部分**（`component_name`），
因此既能校编号，也能确认「某建筑是否属于该遗产的组成部分」——
例如洛阳桥属 1561（泉州）、佛光寺东大殿属 1279（五台山）、少林寺塔林属 1305（登封天地之中）。

**当前使用的 20 个编号**（全部经该端点确认）：

| 编号 | 遗产 | 编号 | 遗产 |
| --- | --- | --- | --- |
| 439 | 明清皇家宫殿（北京、沈阳） | 439→**813** | 苏州古典园林 |
| 440 | 莫高窟 | **811** | 丽江古城 |
| 703 | 承德避暑山庄及周围寺庙 | **812** | 平遥古城 |
| 705 | 武当山古建筑群 | **880** | 颐和园 |
| 707 | 布达拉宫 | **881** | 天坛 |
| 912 | 大足石刻 | **1002** | 皖南古村落（西递、宏村） |
| 1003 | 龙门石窟 | **1112** | 开平碉楼与村落 |
| 1113 | 福建土楼 | **1279** | 五台山 |
| 1305 | 登封天地之中古建筑群 | **1334** | 杭州西湖文化景观 |
| 1442 | 丝绸之路：长安—天山廊道 | **1561** | 泉州：宋元中国的世界海洋商贸中心 |

> ⚠️ 编号只影响「遗产身份」，不影响案例本身对建筑的描述；
> `catalog.meta.json` 的 `unescoIdVerification` 字段记录了核验方法与端点。
> 完整映射（**中国 61 条官方条目**）见 `data/unesco-cn-verified.tsv`，
> 由 `scripts/build_unesco_verified.py` 生成，可独立复现。

**http 来源（5 条，已登记）**：`www.zhongguowenwubao.com`（中国文物报，3 条引用）
与 `www.ncha.gov.cn`（国家文物局，2 条引用）的 **https 变体在本机实测不可用**：

```text
https://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html
  → curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL   （https 握手失败）
http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html
  → HTTP 200                                             （http 正常）
```

`www.zhongguowenwubao.com` 表现相同（https `SSL_ERROR_SYSCALL` / http `200`），
Agent 的 `web_fetch` 通道访问其 https 变体同样失败。
因此**如实保留已实测可用的 http 链接**，不伪造 https。
若 13 / 14 侧在别的网络环境验证 https 可用，可再行升级。

**教学示意标记（数据层）**：每条 case 携带 `teachingNotice` 字段
（`isSchematic` / `labelZh` / `labelEn` / `forceNoteZh` / `forceNoteEn` / `appliesTo` / `mustNotClaim`），
`catalog.meta.json`、`glossary.json`、`handoff/structure-groups.json` 同步携带。
18 / 19 **直接透传**该字段到界面，**不要另写一套文案**。

**年代**：`yearText` 保留「始建于 X、重修于 Y」的多层信息，
`yearUncertainty` 单列（`确切` / `约略` / `不适用`），**不用单一年份冒充断代**。

---

## 5. 边界（写给下游，请照此执行）

1. **代表性样本，不穷尽。** 42 条覆盖 8 大区、7 时代、10 民族、21 构造类别，
   但**不声称**覆盖中国古建筑。`catalog.meta.json` 的 `scope` 已如此声明。
2. **一切 3D / 剖面 / 受力均为教学示意，非施工或工程模型。** 受力箭头只表示方向，不表示大小。
   该约束同时写在 `catalog.json`（每条 `caveat`）、`catalog.meta.json`（`limitations`）
   与 `handoff/structure-groups.json`（`disclaimer`）。
3. **不携带任何第三方图片。** `imagePlan.status = not-included`：
   文保单位与博物馆图片多为著作权（ARR）或需单独授权。
   19 号应**程序化生成配图**并外链来源机构。
4. **参考项目只提炼机制。** 详见 `REFERENCES.md` 与 `LICENSES.md` 的「不得照搬」清单。
5. **不得冒充原作作者或项目。**
6. **资源本地化 + Pages 子路径适配**（用相对路径，不写死 `/assets/...`）。
7. **中英文无障碍 + `prefers-reduced-motion` + `prefers-color-scheme`。**

---

## 6. 下游怎么接

### 给 19 号（主站「构筑华夏 / Built in China」）

```js
import catalog from './17-architecture-research/catalog.json'
import meta    from './17-architecture-research/catalog.meta.json'
import glossary from './17-architecture-research/glossary.json'
import first18 from './17-architecture-research/handoff/first-18.json'
```

- **字段语义先读 [`handoff/FIELD-MAPPING.md`](handoff/FIELD-MAPPING.md)**：
  28 个案例字段 + 5 个来源字段逐条说明、年份确定性的规范映射表、21 类构造 id 清单、
  19 三个适配层的写法约定、8 条已知错位风险与红线清单。
  机器可读版：`handoff/field-mapping.json`。
- 首批页面用 `handoff/first-18.json`（**18 例**，按构造覆盖与地域分散挑选）。
- 分类入口用 `meta.vocabularies`（**21 类构造** / 8 大区 / 7 时代）。
- 案例页必须显示 `yearText` + `yearUncertainty` + `caveat` + `sources[]`。
- 交互机制见 `INTERACTION-BRIEF.md` §4、§5。

> ⚠️ **19 侧当前有一处待修**：19 的 `src/data/upstream/catalog.meta.json` 是 23:04 的旧快照，
> `vocabularies.structureTypes` 只有 **19** 个（缺 `cross-plan`、`caisson`），
> 导致 `taxonomy.js` 建出的 `SYSTEMS.length === 19`。
> **需重新 vendor `catalog.meta.json`**（`catalog.json` / `glossary.json` 已是最新，不必重拷）。
> 自检：`len(json.load(open('src/data/upstream/catalog.meta.json'))['vocabularies']['structureTypes']) == 21`。
> 详见 `handoff/FIELD-MAPPING.md` §8.1。

### 给 18 号（3D 教学模型）

```js
import groups from './17-architecture-research/handoff/structure-groups.json'
```

- `groups[key].members / membersEn` → 构件清单
- `groups[key].assemblyOrder` → 装配与拆解顺序（**唯一时间轴，正反向**）
- `groups[key].forceNoteZh / forceNoteEn` → 定性受力说明
- 构件中文名必须命中 `glossary.json` 的 74 条术语。

### 给 16 号（UI 规范）

- `REFERENCE-NOTES.md` 是 **olek.si 的实测证据**（色彩令牌、字体、排版、动效机制、已确认缺陷）。
- **只借机制，不取他的色值与字体。** 令牌、字体、版式由 16 号原创决定。
- 16 的规范已产出（`16-design-system/design-tokens.json`，Afterglow v1.0.0，`--ds-` 前缀；
  自托管字体 Space Grotesk / Inter / Space Mono / Noto Sans SC，均带 OFL）。
  **本目录不另立 token 文件**；`research-ref/olek-tokens.json` 仅为观察记录，不随发布。

### 给 14 号（唯一上线方）

- `manifest.json` 列出本目录全部文件与 sha256，发布前可逐项核对。
- **发布契约**（manifest 顶层）：`id` = `17-architecture-research`、
  `entry` = `dist/catalog.html`、`buildCommand` = `node src/catalog-page/build-catalog-page.mjs`、
  `outputDir` = `dist`、`status` = `complete`。
- **接入方式**：works.json 里按 `build.type = 'page'` + 上述 `buildCommand` 构建。
  **不要用 `static` 直拷**——`build.mjs` 的 static 分支 `keepDirs` 不含 `dist`，直拷会整页漏掉。
- `PUBLISH-EXCLUDE.txt` 给出精确排除清单（`research-ref/ screenshots/ evidence/ scripts/ handoff/ data/ src/`）；
  `data/` **在 14 的 `keepDirs` 白名单内**，必须由发布方显式排除，不能依赖默认行为。
- 本目录**不含**需要单独授权的素材，可安全随站点发布。
- Pages 子路径：产物一律用相对路径引用。

---

## 7. 已知限制（如实记录）

| # | 限制 | 影响 |
| --- | --- | --- |
| L-1 | 未对每个案例做现场或原始档案核验 | 核验强度以 `verification.level` 与 `evidenceLevel` 标注 |
| L-2 | 部分「始建年代」在来源间存在分歧 | 已写入 `yearUncertainty` 与 `caveat`，未强行裁定 |
| L-3 | olek.si 的案例详情页结论**从 CSS 反推**，未逐像素目视确认 | `REFERENCE-NOTES.md` §7 已标注「未核验」 |
| L-4 | olek.si 的动效**未逐帧核验**（未录屏） | 同上；CSS 定义与 DOM 编排属性为实测读取 |
| L-5 | olek.si 的 hover / 交互态**未核验**（只读取证，避免对第三方产生副作用） | 同上 |
| L-6 | UNESCO 编号核验依赖 `web_fetch` 通道（本机 curl/node 被 TLS 拦截） | `scripts/verify_unesco.js` 实测未生效，已改用官方 GeoJSON 端点 |
| L-7 | 目录是代表性样本 | 不代表全量；同一类型内其他重要实例未纳入 |
| L-8 | 无原始测绘数据或点云 | 3D 模型只能做到教学示意，不得声称为复原或测绘成果 |
| L-9 | 成果页的 3D / 剖面 / 受力能力**未实现** | 本页只做目录与检索；教学示意声明已就位，但 3D 交互由 18/19 承担 |
| L-10 | 成果页的**英译**为 17 自撰，非官方英文名 | 来源机构有官方英文名的以其为准（见 `sources[].label`） |
| L-11 | `scripts/capture.sh` 在移动视口下产出**裁切伪影** | 成果页截图改用 `scripts/capture_cdp.mjs`（CDP 设备仿真），与 `browser_test.mjs` 同通道 |
| L-12 | 19 的 `src/data/upstream/catalog.meta.json` 尚未重新 vendor | 19 侧 `SYSTEMS.length === 19`（应为 21），详见 `handoff/FIELD-MAPPING.md` §8.1 |

---

## 8. 目录内脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/build_catalog.py` | **唯一数据源**；生成 catalog / meta / SOURCES / handoff |
| `scripts/build_glossary.py` | 生成术语表；构建时校验案例与构造 id 存在性 |
| `scripts/build_unesco_verified.py` | 由官方 GeoJSON 端点整理 `data/unesco-cn-verified.tsv`（中国 61 条） |
| `scripts/build_verification_status.py` | 生成 `handoff/VERIFIED-VS-ASSUMED.md` + `verification-status.json`（逐条已核验 / 假设） |
| `scripts/build_field_mapping.py` | 生成 `handoff/field-mapping.json`（枚举分布与 id 清单由数据现算，不手写） |
| `scripts/build_manifest.py` | 生成本目录清单（角色 / 字节 / sha256）+ 发布契约字段 |
| `scripts/build_qa.py` | 生成 `QA.md`（注入校验脚本的**实时**输出，非手写） |
| `scripts/validate_catalog.py` | 交付物校验（**75 项断言**），`--json` 输出机器可读报告 |
| `scripts/build-catalog-page.mjs`（在 `src/catalog-page/`） | 构建成果页 `dist/catalog.html` + `dist/catalog.css` + `dist/assets/ds/**` |
| `scripts/browser_test.mjs` | 成果页实机测试（CDP 驱动本机 Chrome，**44 项断言**，覆盖 16 的 V.1—V.12） |
| `scripts/capture_cdp.mjs` | 成果页截图（CDP 设备仿真，支持 light / dark） |
| `scripts/capture.sh` | headless Chrome 截图（内置重试 + 递增退避 + 独立 user-data-dir）。**移动视口会产伪影** |
| `scripts/extract_tokens.js` | 从生产 bundle 提取路由 / 色值 / 字体 / CSS 变量（**只写隔离区**） |
| `scripts/verify_unesco.js` | UNESCO 编号批量校验（**本机网络不通，实测未生效**） |
| `scripts/{repair,fix_tuple,normalize,final}_quotes.py` | 中文引号规范化工具链（历史遗留，留作审计痕迹） |

---

*本目录的每一处事实性表述都可回溯到 `SOURCES.md` 中的一条链接；无法核验者已如实标注为「未核验」。*
