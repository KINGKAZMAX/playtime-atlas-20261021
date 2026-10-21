# QA — 验收结果与测试证据

> 任务：17-architecture-research ｜ 版本 1.0.0 ｜ 2026-10-21
> 本文件由 `scripts/build_qa.py` 生成；**「逐项校验结果」一节是校验脚本的实测输出**，不是手写断言。

---

## 1. 校验方法

```bash
cd 17-architecture-research

# 重建全部产物（顺序不可颠倒）
python3 scripts/build_catalog.py           # 目录 + meta + SOURCES + handoff
python3 scripts/build_glossary.py          # 术语表
python3 scripts/build_unesco_verified.py   # UNESCO 官方编号映射
python3 scripts/build_verification_status.py  # 已核验 / 假设对照表
python3 scripts/build_field_mapping.py     # 字段映射表（枚举分布由数据现算）
node  src/catalog-page/build-catalog-page.mjs   # 成果页 dist/
python3 scripts/build_manifest.py          # 文件清单 + 发布契约 + 发布排除清单
python3 scripts/build_qa.py                # 本文件（注入实时校验输出）

# 校验（任一 FAIL → 退出码 1）
python3 scripts/validate_catalog.py
python3 scripts/validate_catalog.py --json   # 额外写 data/validate-report.json

# 成果页实机测试（需先起静态服务；**只走 Ego 浏览器**）
python3 -m http.server 8899 --bind 127.0.0.1 --directory dist &
node scripts/ego_interactions.mjs --url http://127.0.0.1:8899/catalog.html   --out "$PWD/evidence/ego-interactions" --space "17-architecture ego-interactions"
```

`scripts/validate_catalog.py` 对本目录做 **84 项断言**，覆盖：
文件齐备、目录数据、字段完整性、来源与 UNESCO 编号、边界声明、术语表、交接切片、
截图证据、**隔离（data/ 无第三方抓取件）**、**教学示意标记**、**发布边界**、文档、文本完整性、清单自洽、元数据、
**词表对齐（structureTypes 21:21）**、**成果页产物与样式纪律**、**manifest 必需字段**、
**浏览器入口约定（Ego-only）**、**Ego 实测证据**。

**证据分级**（与 16 的 `REFERENCE-AUDIT.md` 同口径）：

| 级别 | 判定标准 | 本任务用法 |
| --- | --- | --- |
| **[直接]** | 本任务**实际访问并读到内容**，附访问方式与时间 | `evidenceLevel = primary-verified`；`data/unesco-cn-verified.tsv`；截图字节数 |
| **[一手源文件]** | 从官方端点取得的**结构化原始响应** | UNESCO 官方 GeoJSON 端点返回的 `id_no` / 正式英文名 / `component_name` |
| **[二手]** | 官方机构页面 / 百科类转述 | `evidenceLevel = primary-cited` / `secondary`；**不得**当作一手事实 |
| **[未核验]** | 无法在本机核实 | `REFERENCE-NOTES.md` §7、`REFERENCES.md` §5 明确登记 |

---

## 2. UNESCO 世界遗产编号：核验方法与实测结果

### 2.1 背景

本目录早期版本中的 16 个 UNESCO 编号是**凭记忆填写**的，多数错误
（如苏州园林记为 439、明清宫殿记为 441、天坛记为 440、平遥记为 1031、丽江记为 1002）。

### 2.2 方法

本机 curl / node 直连 `whc.unesco.org` **全部 TLS 握手失败**
（`scripts/verify_unesco.js` 对 27 个候选编号返回 27 条 `UNREACHABLE`，
失败日志保留在 `research-ref/unesco-verified.tsv`）。
因此改用 Agent 的 `web_fetch` 通道取得**官方 GeoJSON 端点**：

```
https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1
```

该端点返回中华人民共和国全部条目的 `id_no`（官方编号）、正式英文名，
以及每条遗产的**组成部分**（`component_name`）——后者用于确认
「某建筑是否属于该遗产的组成部分」。

组成部分端点（用于逐条核对组成）：

```
https://whc.unesco.org/?cid=31&l=en&id_site=<id>&mode=json
```

### 2.3 实测结果

- 中国条目总数：**61** 条（完整映射见 `data/unesco-cn-verified.tsv`）
- 本目录引用：**20** 条遗产，覆盖 **21** 条案例
- 引用编号：439, 440, 703, 705, 707, 811, 812, 813, 880, 881, 912, 1002, 1003, 1112, 1113, 1279, 1305, 1334, 1442, 1561
- 校验断言：`UNESCO 编号均在官方中国名录内` → **通过**

### 2.4 编号修正对照（凭记忆 → 官方）

| 遗产 | 原（错误） | 现（官方） |
| --- | --- | --- |
| 苏州古典园林 | 439 | **813** |
| 天坛 | 440 | **881** |
| 孔庙、孔府、孔林 | 441 | **704** |
| 武当山古建筑群 | 442 | **705** |
| 承德避暑山庄及周围寺庙 | 444 | **703** |
| 开平碉楼与村落 | 446 | **1112** |
| 福建土楼 | 447 | **1113** |
| 丽江古城 | 1002 | **811** |
| 平遥古城 | 1031 | **812** |
| 皖南古村落（西递、宏村） | 1004 | **1002** |
| 峨眉山—乐山大佛 | 1006 | **779** |
| 大足石刻 | 1069 | **912** |
| 莫高窟 | 440 | 440（正确） |
| 丝绸之路：长安—天山廊道 | 1442 | 1442（正确） |

新增编号（原本缺失）：439 明清皇家宫殿、880 颐和园、1003 龙门石窟、
1305 登封天地之中、707 布达拉宫、1279 五台山、1334 杭州西湖、1561 泉州。

---

## 3. 数据边界声明

| # | 边界 | 落地位置 | 校验断言 |
| --- | --- | --- | --- |
| B-1 | **代表性样本，不穷尽** | `catalog.meta.json` → `scope` / `limitations` | 「声明『代表性样本，非穷尽』」 |
| B-2 | **3D / 剖面 / 受力一律教学示意** | 每条 case 的 `teachingNotice` 字段 + `catalog.meta.json` + `glossary.json` + `handoff/structure-groups.json` | 「每条 case 带 teachingNotice 标记」「teachingNotice 含中英标签与不得声称清单」 |
| B-3 | **不携带第三方图片** | 每条 case 的 `imagePlan.status = not-included` | 「不携带第三方图片」 |
| B-4 | **不下载、不再分发参考站源码/样式/字体/图片/文案** | 抓取件全部隔离在 `research-ref/`；token 只认 16 | 「data/ 内无第三方抓取件」「research-ref/ 隔离区存在且带说明」 |
| B-5 | **不冒充原作作者或项目** | `REFERENCES.md` §改编说明、`LICENSES.md` §6 | —（人工审阅项） |
| B-6 | **发布前排除清单** | `PUBLISH-EXCLUDE.txt` + `manifest.json` → `publish.excludeDirs/excludeFiles` | 「PUBLISH-EXCLUDE.txt 覆盖全部敏感目录」「manifest 与 PUBLISH-EXCLUDE.txt 同源」 |
| B-7 | **年代不冒充断代** | `yearText`（多层信息）+ `yearUncertainty`（确切/约略/不适用） | 字段完整性组 |
| B-8 | **来源可追溯** | 每条 case 的 `sources[]`（含 UNESCO 编号、非遗编号、访问日） | 「每条至少 1 条来源」「UNESCO 编号均在官方中国名录内」 |

### 3.1 http 来源（3 个 URL / 5 条案例引用，已登记，非伪造）

`www.zhongguowenwubao.com`（中国文物报）与 `www.ncha.gov.cn`（国家文物局）
的 **https 变体在本机实测不可用**。**两条独立通道的实测结果一致**：

```text
# 通道一：curl（2026-10-21）
https://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html
  → curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL      （https 握手失败）
http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html
  → HTTP 200                                                （http 正常）

# 通道二：Ego 浏览器 / Chromium（2026-10-22 复测，只测本机网络可达性）
https://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html
  → page.goto failed: net::ERR_CONNECTION_CLOSED             （落到 chrome-error://chromewebdata/）
http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html
  → 加载成功，标题「燕赵都市报：「河北最具影响力十大文物景观」评选活动启动」，正文 4 908 字符
```

三个 URL 的复测结论一致（Ego Chromium，2026-10-22）：

| URL | https 变体 | http 变体（实测标题） |
| --- | --- | --- |
| `zhongguowenwubao.com/…paperId=19603…` | `net::ERR_CONNECTION_CLOSED` | 中国文物报-2023-01-03-0版- |
| `zhongguowenwubao.com/…paperId=21802…` | `net::ERR_CONNECTION_CLOSED` | 中国文物报-2025-09-02-0版- |
| `ncha.gov.cn/art/2010/5/24/art_1027_106086.html` | `net::ERR_CONNECTION_CLOSED` | 燕赵都市报：「河北最具影响力十大文物景观」评选活动启动 |

`www.zhongguowenwubao.com` 表现相同（Agent `web_fetch` 通道访问其 https 变体同样失败）。
因此**如实保留已实测可用的 http 链接**，不伪造 https。
登记在 `scripts/validate_catalog.py` 的 `HTTP_SOURCE_EXCEPTIONS` 与 `SOURCES.md` 的
「http 来源例外登记」一节，并由「来源链接均为 https 或已登记的 http 例外」
「登记的 http 例外均被实际引用」两项断言守护。

> 口径边界：该结论只针对**本机网络环境**。若 14-publish 的发布环境可访问 https，
> 可由发布方按实际可达性替换；本目录不擅自改写未实测可用的 https。

---

## 4. 成果页实机测试（Ego 浏览器实测输出）

> **浏览器入口约定**：成果页的实机测试**只走 Ego 浏览器**（用户真实浏览器，含扩展与 UI）。
> 通道一为批次共享工具 `tools/ego-qa/run.mjs`（标准项），
> 通道二为本目录 `scripts/ego_interactions.mjs`（交互类补齐）；
> 两份报告分别落在 `evidence/ego/` 与 `evidence/ego-interactions/`。
> 此前用本机无头 Chrome + 原生 CDP 的 `browser_test.mjs` / `capture_cdp.mjs` / `capture.sh`
> 已按约定**停用并移除**，其遗留报告 `evidence/browser-test-report.json` 一并删除。
> **本节在报告缺失时显示为「未运行」。**

**结果：共享工具 PASS（errors 0 / warnings 0）；交互类 18/18 通过，失败 0，警告 0。**

浏览器：`ego-browser (ego-lite)`　TaskSpace：`17-architecture ego-qa`　生成时间：2026-10-21T17:43:07.039Z

### 4.1 共享工具 `tools/ego-qa/run.mjs`（标准项）

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 视口精确 | innerWidth=1440 |
| ✅ | 无外部网络请求 | 51 个请求（跨源 0，含浏览器自身资源已排除） |
| ✅ | 无控制台错误 | 0 条 |
| ✅ | 无横向溢出 | scrollWidth=1440 |
| ✅ | 关键组件齐备 | 8 类 |
| ✅ | 样式表已解析 | 9 张 / 494 条规则 |
| ✅ | 视口精确 | innerWidth=1280 |
| ✅ | 无外部网络请求 | 51 个请求（跨源 0，含浏览器自身资源已排除） |
| ✅ | 无控制台错误 | 0 条 |
| ✅ | 无横向溢出 | scrollWidth=1280 |
| ✅ | 关键组件齐备 | 8 类 |
| ✅ | 样式表已解析 | 9 张 / 494 条规则 |
| ✅ | 视口精确 | innerWidth=768 |
| ✅ | 无外部网络请求 | 51 个请求（跨源 0，含浏览器自身资源已排除） |
| ✅ | 无控制台错误 | 0 条 |
| ✅ | 无横向溢出 | scrollWidth=768 |
| ✅ | 关键组件齐备 | 8 类 |
| ✅ | 样式表已解析 | 9 张 / 494 条规则 |
| ✅ | 视口精确 | innerWidth=390 |
| ✅ | 无外部网络请求 | 51 个请求（跨源 0，含浏览器自身资源已排除） |
| ✅ | 无控制台错误 | 0 条 |
| ✅ | 无横向溢出 | scrollWidth=390 |
| ✅ | 关键组件齐备 | 8 类 |
| ✅ | 样式表已解析 | 9 张 / 494 条规则 |
| ✅ | 渲染字体检查 | 自托管:无 / 系统:PingFang SC |
| ✅ | 文本对比度达标 | 6 项，最低 5.68 |
| ✅ | 触摸目标 ≥24px (WCAG 2.2 AA) | 全部合格 |
| ✅ | 主控件触摸目标 ≥44px (AAA) | 全部合格 |
| ✅ | 系统 prefers-reduced-motion 生效 | {"matches":true,"durBase":"1ms","entryDuration":"1ms"} |

视口度量（横向溢出 / 控制台错误 / 视口精度）：

| 视口 | innerWidth | 横向溢出 | 控制台错误 | 破图 |
| --- | --- | --- | --- | --- |
| 1440x900 | 1440 | 无 | 0 | 0 |
| 1280x800 | 1280 | 无 | 0 | 0 |
| 768x1024 | 768 | 无 | 0 | 0 |
| 390x844 | 390 | 无 | 0 | 0 |

对比度：6 项取样，最低 次级 = **5.68:1**（要求 4.5:1）；实际渲染字体 PingFang SC；reduced-motion `matches=True`，基础时长 `1ms`。

### 4.2 本目录 `scripts/ego_interactions.mjs`（交互类，共享工具不覆盖项）

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 视口精确 | innerWidth=1440 |
| ✅ | 三类卡片计数齐备 | case 42 / term 74 / struct 21 |
| ✅ | 每条案例渲染 caveat | 42/42 |
| ✅ | 语言切换到 EN | data-lang=en，可见 en 598 / zh 0 |
| ✅ | html[lang] 随语言同步 | lang=en |
| ✅ | 切回中文 | data-lang=zh |
| ✅ | 构造筛选生效 | 点击「斗栱dougong」→ 可见 19/42（aria-pressed=true） |
| ✅ | 取消筛选后恢复全部案例 | 42/42 |
| ✅ | 搜索过滤生效 | 输入「桥」→ 可见 16/42，清空后恢复 42 |
| ✅ | skip link 首个 Tab 即聚焦且可见 | activeElement=true，left=16 top=16 「跳到主要内容Skip to content」 |
| ✅ | 焦点环可见（键盘 Tab） | 12 次 Tab，12 个焦点全部有可见焦点环 |
| ✅ | :focus-visible 全部命中 | 12 个焦点全部匹配 :focus-visible |
| ✅ | Tab 序列不被吞 | 连续 12 次 Tab 依次落在 12 个元素上 |
| ✅ | V.11 Noto Sans SC 未排在系统 CJK 族之前 | --ds-font-display ✓，--ds-font-text ✓，--ds-font-mono ✓ |
| ✅ | 页面内相对资源全部可达 | 5 个相对 URL 全部 200 |
| ✅ | prefers-color-scheme: dark 生效 | 底色 rgb(252, 251, 249) → rgb(16, 15, 14) |
| ✅ | 暗色态正文对比度 ≥ 4.5 | 17.46:1 |
| ✅ | 暗色截图已产出 | screenshots/catalog-interactions-dark-1440x900.png |

---

## 5. 逐项校验结果（实测输出）

> 下列内容由 `scripts/validate_catalog.py` 在生成本文件前实时运行并注入。
> 机器可读版本：`data/validate-report.json`。

**结果：84 项断言，通过 84，失败 0。**


### 文件齐备

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 必备文件全部存在 | 32 个必备文件 |

### 目录数据

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | catalog.json 可解析 | schemaVersion=1.0 |
| ✅ | 案例数 ≥ 36 | 实际 42 条 |
| ✅ | 案例 id 唯一 | 42 个唯一 id |
| ✅ | 构造类别 ≥ 12 | 实际 21 类 |

### 字段完整性

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 每条含全部必备字段 | 42 条 × 26 字段 |
| ✅ | 中文字段非空 | 无空值 |
| ✅ | 英文字段非空 | 无空值 |
| ✅ | 每条至少 1 条来源 | 全部有来源 |
| ✅ | 中文名含中文字符 | 全部通过 |
| ✅ | 英文名含拉丁字母 | 全部通过 |
| ✅ | 拼音字段有效 | 全部通过 |

### 来源

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 来源链接均为 https 或已登记的 http 例外 | 121 条链接 / 54 个独立来源；http 例外 3 条已登记 |
| ✅ | 登记的 http 例外均被实际引用 | 全部在用 |
| ✅ | UNESCO 编号均在官方中国名录内 | 用到 20 个编号：[439, 440, 703, 705, 707, 811, 812, 813, 880, 881, 912, 1002, 1003, 1112, 1113, 1279, 1305, 1334, 1442, 1561] |
| ✅ | 证据级别取值合法 | ['primary-verified', 'secondary'] |

### 边界声明

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 每条常驻 caveat | 42 条 |
| ✅ | 不携带第三方图片 | imagePlan.status = not-included |

### 术语表

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | glossary.json 可解析 | 74 条术语 |
| ✅ | 术语数 ≥ 40 | 实际 74 条 |
| ✅ | 每条含全部必备字段 | 全部通过 |
| ✅ | 关联案例 id 全部有效 | 全部有效 |
| ✅ | 关联构造 id 全部有效 | 全部有效 |
| ✅ | 术语覆盖案例比例 ≥ 70% | 35/42 = 83% |
| ✅ | 术语 id 唯一 | 全部唯一 |

### 交接

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | handoff/first-18.json 存在且 18 条 | 18 条 |
| ✅ | handoff/first-18-ids.json 与 first-18.json 一致 | 18 个 id |
| ✅ | 首批切片的 id 存在于 catalog | 全部命中 |
| ✅ | 构造分组覆盖全部构造类型 | 21 组 / 构造类型 21 类 |
| ✅ | 每组含构件中英名 / 组装顺序 / 受力说明 | 21 组全部完整 |
| ✅ | 组装顺序声明为教学示意 | 所有 assemblyOrder 与 forceNote 均为教学示意，非施工工 |

### 截图证据

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 至少 3 张截图 | 5 张 |
| ✅ | 每张截图字节数 > 0 | olek-si-desktop-1440x900.png=51822B, olek-si-desktop-hero-2560x1440.png=56404B, olek-si-desktop-tall-1440x2600.png=45955B, olek-si-mobile-390x844.png=22506B, olek-si-tablet-820x1180.png=41440B |
| ✅ | screenshots/INDEX.tsv 存在 |  |

### 隔离

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | data/ 内无第三方抓取件 | 仅 2 个本项目自产文件 |
| ✅ | research-ref/ 隔离区存在且带说明 | research-ref/README.md |
| ✅ | research-ref/ 内的抓取件已被 manifest 登记为不发布 | 5 个抓取件 |

### 教学示意

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 每条 case 带 teachingNotice 标记 | 42 条全部带标记 |
| ✅ | teachingNotice 含中英标签与不得声称清单 | labelZh / labelEn / forceNote / mustNotClaim 齐备 |

### 发布边界

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | PUBLISH-EXCLUDE.txt 覆盖全部敏感目录 | 已排除目录 ['data', 'evidence', 'handoff', 'research-ref', 'screenshots', 'scripts', 'src'] |
| ✅ | manifest 与 PUBLISH-EXCLUDE.txt 同源 | manifest.publish.excludeDirs / excludeFiles 与文本清单一致 |

### 文档

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | REFERENCES.md 收录 ≥ 8 个项目 | 18 个项目 |
| ✅ | README.md 存在且非空 | 26972 B |
| ✅ | LICENSES.md 存在且非空 | 15440 B |
| ✅ | QA.md 存在且非空 | （本文件，生成中） |
| ✅ | INTERACTION-BRIEF.md 存在且非空 | 17936 B |
| ✅ | STATUS.md 存在且非空 | 31877 B |

### 文本完整性

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 中文引号全部成对 | 42 条 × 4 字段 |

### 清单

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | manifest.json 可解析 | 100 个条目 |
| ✅ | manifest 记录与磁盘一致（manifest.json / validate-report.json 自身除外，自引用不可校验） | 99 个条目一致 |
| ✅ | 磁盘文件全部登记在 manifest | 100 个文件全部登记 |

### 元数据

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 声明「代表性样本，非穷尽」 | 5 条限制说明 |
| ✅ | 记录 UNESCO 编号核验方法 | https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1 |

### 词表对齐

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | structureTypes 词表与案例使用集合 21:21 全覆盖 | 词表 21 类 / 案例用 21 类 |
| ✅ | counts.structureTypes 与词表长度一致 | counts=21 / 词表=21 |
| ✅ | 案例内嵌构造标签与词表一致 | 21 类全部一致 |
| ✅ | 案例 region / regionZh 与词表一致 | 42 条全部一致 |

### 成果页

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 成果页源码与构建产物齐备 | 9 个文件 |
| ✅ | 案例 / 术语 / 构造三类卡片齐全 | case 42/42，term 74，struct 21 |
| ✅ | 资源路径为相对路径（适配 Pages 子路径） | 未发现根路径写死的资源引用 |
| ✅ | 声明 lang 属性与双语切换容器 |  |
| ✅ | 每条案例渲染 caveat 与教学示意 | caveat 节点 42 / 案例 42 |
| ✅ | 页面样式不含硬编码色值（全部 var(--ds-*)） | 10109 字节无 hex 色值 |
| ✅ | 页面样式不写死字体族（走 var(--ds-font-*)） | 6 条 font-family 全部走令牌 |
| ✅ | V.12 自有 CSS 不写死字体族（含 var() fallback） | 6 条声明零字面字体族 |
| ✅ | --ds-base 由入口注入而非在自有 CSS 声明（V.4） | 自有 CSS 未声明 --ds-base |
| ✅ | 尊重 prefers-reduced-motion |  |

### manifest 字段

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 必需字段齐备（id/title/description/entry/buildCommand/outputDir/status） | 7/7 |
| ✅ | id 与任务号一致 | 17-architecture-research |
| ✅ | entry 指向实际存在的成果页 | dist/catalog.html |
| ✅ | buildCommand 指向实际存在的构建脚本 | node src/catalog-page/build-catalog-page.mjs |
| ✅ | outputDir 为 dist 且存在 | dist |
| ✅ | status 为已交付状态 | complete |
| ✅ | 声明 kind 与非独立站点说明 | kind=research-package |
| ✅ | 发布排除清单含 src/ 且不含 dist/ | excludeDirs=['research-ref', 'screenshots', 'evidence', 'scripts', 'handoff', 'data', 'src'] |

### 浏览器入口

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 已停用的无头 Chrome / 原生 CDP 脚本确已移除 | browser_test.mjs / capture_cdp.mjs / capture.sh 均不存在 |
| ✅ | 可执行脚本中无禁用浏览器技术启动调用 | 无 Playwright / Puppeteer / chromium.launch / --headless / 原生 CDP 端点 |
| ✅ | Ego 脚本齐备（交互验收 / 截图 / 参考站测量） | 3 个脚本 |
| ✅ | 全部网页脚本均通过 ego-browser 入口 | 3/3 走 ego-browser |

### Ego 证据

| | 断言 | 实测 |
| --- | --- | --- |
| ✅ | 共享工具报告存在且可解析 | browser=ego-browser (ego-lite) |
| ✅ | 共享工具报告 4 档视口全通过（无溢出 / 无控制台错误 / 视口精确） | 4 档视口全部干净 |
| ✅ | 交互类报告存在且 verdict = PASS | verdict=PASS 通过 18/18 警告 0 |
| ✅ | 参考站视口测量证据存在且采样成功率 ≥ 80% | 16/16 视口；裁切视口 [800, 820, 840, 880]；横向滚动 False |
| ✅ | Ego 截图证据齐全且字节数 > 0 | 9 张 PNG 全部非空 |

---

## 6. 本任务未做的事（如实声明）

| # | 未做 | 原因 |
| --- | --- | --- |
| N-1 | 未对每个案例做**现场测绘**或**原始档案核验** | 本任务无现场条件；核验强度以 `verification.level` / `evidenceLevel` 标注 |
| N-2 | 未产出任何 3D 模型 | 属 18 号职责；本任务只交付构件清单、组装顺序与定性受力说明 |
| N-3 | 未复用任何第三方代码 | 三个入选改编案例均为 MIT，但本任务只提炼**机制**；实际复用时须按 `LICENSES.md` §2.4 署名 |
| N-4 | 未复制 19 的抓取文件 | 19 已有 `REFERENCE-AUDIT.md`（证据分级）；本任务用自己的实测，结论可交叉印证，文件不互相搬运 |
| N-5 | 未发布、未建仓、未 push | 14-publish 是唯一 git 写入者与发布者；本任务只产出 `PUBLISH-EXCLUDE.txt` 供其机械拦截 |
| N-6 | 未在真实移动设备 / 真实屏幕阅读器上测试 | 实机测试在**Ego 浏览器**（用户真实浏览器，含扩展与 UI）下完成（桌面 / 平板 / 移动四档视口）；未做真机与读屏软件验证 |
| N-7 | 未实现成果页的 3D / 剖面 / 受力视图 | 本页只做目录与检索；教学示意声明已在数据层就位，3D 交互由 18 / 19 承担 |
| N-8 | 未做无障碍的完全合规审计（如 axe-core 全量扫描） | 实测覆盖对比度、触达、焦点环、skip link、语言切换、reduced-motion、色彩偏好；完整 WCAG 审计留给 13 号复验 |

---

## 7. 下游需要复核的两点

1. **`yearUncertainty` 的判定由本任务作出**，未逐条与原始档案比对。
   若 13 侧发现某条断代表述与权威来源不符，请以权威来源为准并回告本任务修订。
2. **构造成语的中文名**（`glossary.json` 的 74 条）依通行用法整理，
   同一构件在宋《营造法式》、清代《工程做法则例》与地方做法中的称谓可能不同；
   18 号做模型时若采用特定时代口径，请以该时代的称谓为准并在模型说明中注明。

3. **19 侧的 `src/data/upstream/catalog.meta.json` 尚未重新 vendor**，
   其 `structureTypes` 只有 19 个（缺 `cross-plan` / `caisson`），导致 `taxonomy.js` 建出的
   `SYSTEMS.length === 19`。本任务无权写入 19 目录，已在 `handoff/FIELD-MAPPING.md` §8.1 登记并通知 19。

---

*本文件由 `scripts/build_qa.py` 生成；校验脚本为 `scripts/validate_catalog.py`，结果报告为 `data/validate-report.json`；
成果页实机测试**只走 Ego 浏览器**：标准项 `tools/ego-qa/run.mjs`（报告 `evidence/ego/`），
交互类 `scripts/ego_interactions.mjs`（报告 `evidence/ego-interactions/`），
参考站几何实测 `scripts/ego_ref_metrics.mjs`（报告 `evidence/ego-ref/`）。*
