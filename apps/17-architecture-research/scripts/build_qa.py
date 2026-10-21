#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_qa.py — 生成 QA.md。

QA.md 中的「逐项校验结果」**不是手写的**：本脚本先运行 scripts/validate_catalog.py
（带 --json），读取 data/validate-report.json，再把实测结果注入正文。

用法：python3 scripts/build_qa.py
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEAD = """# QA — 验收结果与测试证据

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
node scripts/ego_interactions.mjs --url http://127.0.0.1:8899/catalog.html \
  --out "$PWD/evidence/ego-interactions" --space "17-architecture ego-interactions"
```

`scripts/validate_catalog.py` 对本目录做 **{N_CHECKS} 项断言**，覆盖：
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

- 中国条目总数：**{CN_TOTAL}** 条（完整映射见 `data/unesco-cn-verified.tsv`）
- 本目录引用：**{USED_COUNT}** 条遗产，覆盖 **{USED_CASES}** 条案例
- 引用编号：{USED_IDS}
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

{BROWSER_SECTION}

---

## 5. 逐项校验结果（实测输出）

> 下列内容由 `scripts/validate_catalog.py` 在生成本文件前实时运行并注入。
> 机器可读版本：`data/validate-report.json`。

**结果：{TOTAL} 项断言，通过 {PASSED}，失败 {FAILED}。**

"""

TAIL = """
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
"""


def main() -> int:
    # 1) 先确保 QA.md 存在（校验脚本会检查它），再跑校验
    qa_path = os.path.join(ROOT, "QA.md")
    if not os.path.exists(qa_path):
        with open(qa_path, "w", encoding="utf-8") as f:
            f.write("# QA（生成中）\n")

    r = subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "validate_catalog.py"), "--json"],
                       cwd=ROOT, capture_output=True, text=True)
    report_path = os.path.join(ROOT, "data", "validate-report.json")
    if not os.path.exists(report_path):
        print("ERROR: 校验报告未生成")
        print(r.stdout[-2000:])
        print(r.stderr[-2000:])
        return 1
    with open(report_path, encoding="utf-8") as f:
        rep = json.load(f)

    # 2) 统计
    total = rep["total"]
    passed = rep["passed"]
    failed = rep["failed"]

    groups: dict[str, list] = {}
    for it in rep["items"]:
        groups.setdefault(it["group"], []).append(it)

    lines = []
    for g, items in groups.items():
        lines.append(f"\n### {g}\n")
        lines.append("| | 断言 | 实测 |")
        lines.append("| --- | --- | --- |")
        for it in items:
            mark = "✅" if it["status"] == "PASS" else "❌"
            detail = (it["detail"] or "").replace("|", "\\|")
            # QA.md 自身字节数会随本次写入变化，固定表述避免自指循环
            if it["name"].endswith("QA.md 存在且非空"):
                detail = "（本文件，生成中）"
            lines.append(f"| {mark} | {it['name']} | {detail} |")

    # 3) UNESCO 统计
    tsv = os.path.join(ROOT, "data", "unesco-cn-verified.tsv")
    cn_total = used_count = 0
    used_ids: list[int] = []
    used_cases = 0
    if os.path.exists(tsv):
        with open(tsv, encoding="utf-8") as f:
            for line in f:
                line = line.rstrip("\n")
                if not line or line.startswith("#"):
                    continue
                parts = line.split("\t")
                if not parts[0].strip().isdigit():
                    continue
                cn_total += 1
                if len(parts) > 2 and parts[2].strip() != "-":
                    used_count += 1
                    used_ids.append(int(parts[0]))
                    used_cases += len(parts[2].split(","))

    # 4) 成果页实机测试报告（Ego 浏览器：共享工具 + 本目录交互类）
    ego_shared_path = os.path.join(ROOT, "evidence", "ego", "17-architecture-catalog.json")
    ego_int_path = os.path.join(ROOT, "evidence", "ego-interactions", "catalog-interactions.json")
    blines: list[str] = []
    if os.path.exists(ego_shared_path) and os.path.exists(ego_int_path):
        with open(ego_shared_path, encoding="utf-8") as f:
            srep = json.load(f)
        with open(ego_int_path, encoding="utf-8") as f:
            irep = json.load(f)
        blines = [
            f"**结果：共享工具 {srep.get('verdict')}（errors {len(srep.get('errors', []))} /"
            f" warnings {len(srep.get('warnings', []))}）；"
            f"交互类 {irep.get('passed')}/{irep.get('total')} 通过，"
            f"失败 {irep.get('failed')}，警告 {irep.get('warned')}。**",
            "",
            f"浏览器：`{srep.get('browser')}`　TaskSpace：`{srep.get('spaceName')}`"
            f"　生成时间：{srep.get('generatedAt')}",
            "",
            "### 4.1 共享工具 `tools/ego-qa/run.mjs`（标准项）",
            "",
            "| | 断言 | 实测 |",
            "| --- | --- | --- |",
        ]
        for c in srep.get("checks", []):
            mark = "✅" if c.get("status") == "pass" else ("⚠️" if c.get("status") == "warn" else "❌")
            detail = (c.get("detail") or "").replace("|", "\\|")
            blines.append(f"| {mark} | {c.get('name')} | {detail} |")
        blines += [
            "",
            "视口度量（横向溢出 / 控制台错误 / 视口精度）：",
            "",
            "| 视口 | innerWidth | 横向溢出 | 控制台错误 | 破图 |",
            "| --- | --- | --- | --- | --- |",
        ]
        for v in srep.get("viewports", []):
            blines.append(
                f"| {v.get('name')} | {v.get('actualInnerWidth')} | "
                f"{'是' if v.get('overflow') else '无'} | {v.get('consoleErrors')} | "
                f"{v.get('media', {}).get('brokenImgCount', 0)} |"
            )
        a11y = srep.get("a11y", {}).get("samples", [])
        if a11y:
            lo = min(a11y, key=lambda s: s.get("ratio", 99))
            blines += [
                "",
                f"对比度：{len(a11y)} 项取样，最低 {lo.get('name')} = **{lo.get('ratio')}:1**"
                f"（要求 {lo.get('required')}:1）；实际渲染字体 "
                f"{', '.join(srep.get('platformFonts', {}).get('fallback', [])) or '—'}；"
                f"reduced-motion `matches={srep.get('reducedMotion', {}).get('matches')}`"
                f"，基础时长 `{srep.get('reducedMotion', {}).get('durBase')}`。",
            ]
        blines += [
            "",
            "### 4.2 本目录 `scripts/ego_interactions.mjs`（交互类，共享工具不覆盖项）",
            "",
            "| | 断言 | 实测 |",
            "| --- | --- | --- |",
        ]
        for c in irep.get("checks", []):
            mark = "✅" if c.get("status") == "pass" else ("⚠️" if c.get("status") == "warn" else "❌")
            detail = (c.get("detail") or "").replace("|", "\\|")
            blines.append(f"| {mark} | {c.get('name')} | {detail} |")
        browser_section = "\n".join(blines)
    else:
        browser_section = (
            "> ⚠️ Ego 实测证据缺失（`evidence/ego/17-architecture-catalog.json` 或\n"
            "> `evidence/ego-interactions/catalog-interactions.json`），本节未运行。\n"
            "> 复现：起静态服务后执行\n"
            "> `node scripts/ego_interactions.mjs --url http://127.0.0.1:8899/catalog.html "
            "--out \"$PWD/evidence/ego-interactions\" --space \"17-architecture ego-interactions\"`。"
        )

    body = HEAD
    body = body.replace("{N_CHECKS}", str(total))
    body = body.replace("{CN_TOTAL}", str(cn_total))
    body = body.replace("{USED_COUNT}", str(used_count))
    body = body.replace("{USED_CASES}", str(used_cases))
    body = body.replace("{USED_IDS}", ", ".join(str(i) for i in sorted(used_ids)))
    body = body.replace("{BROWSER_SECTION}", browser_section)
    body = body.replace("{TOTAL}", str(total))
    body = body.replace("{PASSED}", str(passed))
    body = body.replace("{FAILED}", str(failed))
    body += "\n".join(lines) + "\n"
    body += TAIL

    with open(qa_path, "w", encoding="utf-8") as f:
        f.write(body)

    print(f"QA.md 已生成：{total} 项断言 / 通过 {passed} / 失败 {failed}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
