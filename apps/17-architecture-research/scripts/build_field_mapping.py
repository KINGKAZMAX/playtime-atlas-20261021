#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_field_mapping.py — 生成 handoff/field-mapping.json（机器可读字段映射表）

FIELD-MAPPING.md 里的枚举分布、构造 id 清单、年份确定性映射**不是手写的**：
本脚本直接从 catalog.json / catalog.meta.json / glossary.json 现算，
上游数据一变，映射表自动跟随。

用法：python3 scripts/build_field_mapping.py
"""
from __future__ import annotations

import json
import os
import re
from collections import Counter, OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 字段语义说明（人写部分；取值分布由脚本现算）
CASE_FIELDS = [
    ("id", "string", True, "稳定 slug（c01…c42），全局主键", "本目录编号", "主键、DOM id、URL 锚点"),
    ("nameZh", "string", True, "案例中文正名", "来源机构公开表述", "标题"),
    ("nameEn", "string", True, "案例英文名", "官方英文表述或通行英译", "英文态标题"),
    ("pinyin", "string", True, "中文名拼音", "依中文名注音", "副标题、检索；非权威转写"),
    ("region", "string", True, "大区 id", "分类学", "筛选主键"),
    ("regionZh", "string", True, "大区中文名（冗余落盘）", "词表", "展示；须与词表一致"),
    ("regionEn", "string", True, "大区英文名（冗余落盘）", "词表", "展示；须与词表一致"),
    ("province", "string", True, "今省级行政区", "行政区划", "展示、地理分组"),
    ("locality", "string", True, "县市", "行政区划", "展示"),
    ("era", "string", True, "时代桶 id", "分类学", "筛选主键"),
    ("eraZh", "string", True, "时代中文名（冗余落盘）", "词表", "展示"),
    ("eraEn", "string", True, "时代英文名（含朝代年份区间）", "词表", "range 展示；勿再叠加年份映射"),
    ("yearText", "string", True, "年代（用来源原话表述）", "来源机构", "整句展示；禁止正则抽年份"),
    ("yearUncertainty", "string", True, "年代确定性", "来源间是否一致", "徽标；按规范映射表归并"),
    ("type", "string", True, "建筑类型（功能形制）", "来源机构", "分类展示"),
    ("structureTypes", "array<object>", True, "涉及的构造类别（1—4 项）", "构造学", "结构筛选、模型关联"),
    ("ethnicGroup", "string", True, "主要使用族群", "民族学 / 文物档案", "展示"),
    ("principleZh", "string", True, "结构原理（怎么站住的）", "来源机构 + 构造学", "案例正文"),
    ("principleEn", "string", True, "结构原理英文（按英文读者重写）", "同上", "案例正文；勿在 enrichment 重复写"),
    ("cultureZh", "string", True, "文化背景（为什么这样造）", "来源机构", "案例正文"),
    ("cultureEn", "string", True, "文化背景英文（按英文读者重写）", "同上", "案例正文；勿在 enrichment 重复写"),
    ("culturalKeywords", "array<string>", True, "检索与筛选标签", "本目录归纳", "搜索、标签"),
    ("sources", "array<object>", True, "逐条来源（1—4 条）", "见 sources 字段表", "来源卡片（必须可点击）"),
    ("imagePlan", "object", True, "配图计划（恒为 not-included）", "本目录口径", "主站程序化生成配图 + 外链来源机构"),
    ("verification", "object", True, "本条核验状态", "本任务", "18 决定优先实现哪些"),
    ("caveat", "string", True, "本条的诚实限度（年代争议 / 修复痕迹 / 与测绘模型的边界）", "来源间差异", "必须常显，不得折叠隐藏"),
    ("teachingNotice", "object", True, "教学示意声明", "本目录口径", "必须常显；模型 / 剖面 / 受力同屏"),
    ("isRepresentativeSample", "boolean", True, "恒为 true", "本目录口径", "与「代表性样本，非穷尽」文案同在"),
]

SOURCE_FIELDS = [
    ("label", "string", True, "来源名称（机构 · 篇名）", "来源方"),
    ("url", "string", True, "可点击链接（一次来源优先；3 个 http 为实测可用形式）", "来源方"),
    ("type", "string", True, "unesco / institution / ihchina / secondary", "本目录归类"),
    ("evidenceLevel", "string", True, "primary-verified / primary-cited / secondary", "本任务实际访问情况"),
    ("accessedAt", "string", True, "实际访问日期 YYYY-MM-DD", "本任务"),
]

GLOSSARY_FIELDS = [
    ("id", "string", True, "稳定主键 g01…g74", "本目录编号"),
    ("termZh", "string", True, "中文术语名", "术语学"),
    ("termEn", "string", True, "英文术语名", "术语学"),
    ("pinyin", "string", True, "拼音", "依中文名注音"),
    ("category", "string", True, "8 类之一", "本目录分类"),
    ("definitionZh", "string", True, "中文释义", "术语学"),
    ("definitionEn", "string", True, "英文释义", "术语学"),
    ("relatedCases", "array<string>", True, "关联案例 id（反向索引来源）", "本目录关联"),
    ("relatedStructures", "array<string>", True, "关联构造 id（须落在 21 类内）", "本目录关联"),
    ("note", "string", True, "补充说明 / 口径提示", "本目录"),
]

# 年份确定性 → 19 四档枚举（权威口径；用查表而非正则）
UNCERTAINTY_RULES = [
    (r"^确切", "certain", "来源明确且少有争议"),
    (r"^约略（.*两说|不分歧|^约略（各园不一）", "disputed", "来源之间存在分歧或学界仍在讨论"),
    (r"^约略", "approx", "来源之间存在分歧或学界仍在讨论（未构成明确两说）"),
    (r"不适用", "not-applicable", "持续性传统，无单一始建年"),
]
UNCERTAINTY_PRIORITY = ["certain", "disputed", "approx", "not-applicable"]


def to_uncertainty(raw: str) -> str:
    """与 19 的 toUncertainty() 当前行为逐值对齐（见 FIELD-MAPPING.md §3）。"""
    s = str(raw or "")
    if "不适用" in s:
        return "not-applicable"
    if s.startswith("确切"):
        return "certain"
    if re.search(r"争议|两说|不一|分歧", s):
        return "disputed"
    if s.startswith("约略"):
        return "approx"
    return "approx"


def main() -> int:
    catalog = json.load(open(os.path.join(ROOT, "catalog.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(ROOT, "catalog.meta.json"), encoding="utf-8"))
    glossary = json.load(open(os.path.join(ROOT, "glossary.json"), encoding="utf-8"))

    cases = catalog["cases"]
    vocab = meta["vocabularies"]

    # ---- 年份确定性：逐值映射 + 分布
    unc = OrderedDict()
    for c in cases:
        v = c["yearUncertainty"]
        e = to_uncertainty(v)
        unc.setdefault(v, {"upstreamValue": v, "enum": e, "caseCount": 0, "caseIds": []})
        unc[v]["caseCount"] += 1
        unc[v]["caseIds"].append(c["id"])
    unc_list = list(unc.values())
    enum_dist = Counter(x["enum"] for x in unc_list for _ in range(x["caseCount"]))
    enum_dist = OrderedDict(sorted(enum_dist.items(), key=lambda kv: UNCERTAINTY_PRIORITY.index(kv[0])))

    # ---- 字段取值分布（供下游对拍）
    def dist(fn):
        return OrderedDict(sorted(Counter(fn(c) for c in cases).items(),
                                  key=lambda kv: (-kv[1], str(kv[0]))))

    field_stats = {
        "region": dist(lambda c: c["region"]),
        "era": dist(lambda c: c["era"]),
        "ethnicGroup": dist(lambda c: c["ethnicGroup"]),
        "province": dist(lambda c: c["province"]),
        "yearUncertainty": dist(lambda c: c["yearUncertainty"]),
        "type": dist(lambda c: c["type"]),
        "sourcesPerCase": dist(lambda c: len(c["sources"])),
        "structureTypesPerCase": dist(lambda c: len(c["structureTypes"])),
    }

    # ---- 构造类别：词表 vs 案例使用（必须 21:21）
    used = set()
    for c in cases:
        for st in c["structureTypes"]:
            used.add(st["id"])
    vocab_ids = list(vocab["structureTypes"].keys())
    struct_rows = []
    for sid in vocab_ids:
        v = vocab["structureTypes"][sid]
        struct_rows.append({
            "id": sid,
            "labelZh": v["labelZh"],
            "labelEn": v["labelEn"],
            "gloss": v.get("gloss", ""),
            "usedByCases": sorted(c["id"] for c in cases
                                  if any(st["id"] == sid for st in c["structureTypes"])),
            "usedByCount": sum(1 for c in cases
                               if any(st["id"] == sid for st in c["structureTypes"])),
            "has18Model": sid in {"dougong", "tailiang", "chuandou", "mortise-tenon",
                                  "stone-arch", "rammed-earth"},
        })

    # ---- 来源：类型与证据强度分布
    src_types = Counter(s["type"] for c in cases for s in c["sources"])
    src_levels = Counter(s["evidenceLevel"] for c in cases for s in c["sources"])
    http_sources = sorted({s["url"] for c in cases for s in c["sources"] if s["url"].startswith("http://")})

    # ---- 术语覆盖
    term_case_ids = {cid for t in glossary["terms"] for cid in t.get("relatedCases", [])}
    covered = sorted(term_case_ids)
    uncovered = sorted(c["id"] for c in cases if c["id"] not in term_case_ids)

    # ---- 19 适配层契约
    adapters = {
        "19-architecture-atlas/src/data/catalog.js": {
            "role": "把 cases[] 搬成前端 case 对象",
            "rules": [
                "enrichment.js 只补 19 自有的英文与坐标（yearTextEn / typeEn / ethnicityEn / caveatEn / lon / lat）",
                "上游已有 principleEn / cultureEn / nameEn 不得在 enrichment 里重复写",
                "source.type 归并为 primary / secondary，判据是 evidenceLevel 而非上游 type",
                "upstream 分支原样透传 structureTypes / imagePlan / verification / isRepresentativeSample",
                "teachingNotice 从 catalog.meta.json 顶层取（全局一份），不要每条重复存",
                "yearUncertainty 按 yearUncertaintyMapping 查表，不要用正则",
                "system 取 structureTypes[0].id，数组顺序即主次，不得重排",
            ],
        },
        "19-architecture-atlas/src/data/taxonomy.js": {
            "role": "从 vocabularies 建 REGIONS / ERAS / SYSTEMS",
            "rules": [
                "SYSTEMS 长度必须等于 catalog.meta.json.counts.structureTypes（当前 21）",
                "ERAS.range 直接用 eras[].labelEn（已含朝代年份区间）",
                "SYSTEM_TO_LAB 只映射 18 已有的 6 个模型，其余 15 个构造无 3D 模型",
                "CHINA_OUTLINE 等示意轮廓属 19 自有数据，UI 须标「示意」",
            ],
        },
        "19-architecture-atlas/src/data/glossary.js": {
            "role": "术语索引与锚点",
            "rules": [
                "slugify 生成 URL 锚点，但必须保留 upstreamId（gNN）以便回指 catalog.js 的 terms",
                "分类分组直接用上游 category（8 类），不要另建分类体系",
            ],
        },
    }

    misalignments = [
        {"id": "M1", "severity": "blocker", "title": "构造类别数错位（当前实际存在）",
         "detail": "19 的 src/data/upstream/catalog.meta.json 是旧快照，structureTypes 只有 19 个，缺 cross-plan 与 caisson；taxonomy.js 由词表建表，故 SYSTEMS.length === 19，而案例已引用 21 类。",
         "detect": "len(json.load(open('src/data/upstream/catalog.meta.json'))['vocabularies']['structureTypes']) == 21",
         "fix": "重新 vendor catalog.meta.json（catalog.json / glossary.json 已是最新，不必重拷）"},
        {"id": "M2", "severity": "medium", "title": "yearUncertainty 正则与口径分叉",
         "detail": "19 的 toUncertainty() 用正则先判 disputed/两说/不一/分歧，故「约略（各园不一）」「约略（年代有隋、唐两说）」「约略（辽金两说并存）」判为 disputed——与本表一致，但若 19 单边「优化」正则会与上游口径分叉且无报错。",
         "detect": "yearUncertaintyMapping 查表结果与上游值一一对应",
         "fix": "改用查表；口径变更须回到 17 统一"},
        {"id": "M3", "severity": "high", "title": "structureTypes 数组顺序被重排",
         "detail": "主构造是 structureTypes[0]；排序或去重时重排会造成案例主构造错位。",
         "detect": "对 42 条断言 system === structureTypes[0].id",
         "fix": "适配层不做任何重排"},
        {"id": "M4", "severity": "medium", "title": "region 与 regionZh 不一致",
         "detail": "两者冗余落盘；用不同来源做筛选与详情会出现显示不同区。",
         "detect": "regionZh === vocabularies.regions[region].labelZh（42 条）",
         "fix": "以 region 为准，regionZh 只作展示冗余"},
        {"id": "M5", "severity": "high", "title": "caveat 被当可选字段",
         "detail": "caveat 每条常驻，是正面声明；折叠到 tooltip 等同隐藏。",
         "detect": "UI 审查：caveat 与 teachingNotice 同屏可见",
         "fix": "常显，不折叠"},
        {"id": "M6", "severity": "medium", "title": "yearText 被正则抽成单一年份",
         "detail": "yearText 常含始建 / 重建 / 现存形制多层，抽取会丢不确定性并与 yearUncertainty 打架。",
         "detect": "代码审查：不得对 yearText 做年份抽取",
         "fix": "整句展示，yearUncertainty 只做徽标"},
        {"id": "M7", "severity": "medium", "title": "来源按 type 排序而非 evidenceLevel",
         "detail": "归并成 primary / secondary 后，primary 桶内混有 primary-verified 与 primary-cited，无法区分「实际读到」与「转述」。",
         "detect": "来源卡片区分 primary-verified / primary-cited",
         "fix": "保留 evidenceLevel 或按 FIELD-MAPPING.md §2.7 排序"},
        {"id": "M8", "severity": "low", "title": "http 链接被误判为不安全",
         "detail": "3 个来源的 https 变体本机握手失败，实测 200 的是 http 变体，已如实保留并登记为受控例外。",
         "detect": "链接检查器不得自动改写或拦截",
         "fix": "保留 http 并在来源卡片标注 type；不得改写成未实测的 https"},
    ]

    redlines = [
        "不得在 19 侧新建案例 / 术语 / 构造类目（会与 17 的 42 / 74 / 21 形成两套真相）",
        "不得改写上游 principleEn / cultureEn（上游英文是按英文读者重写的）",
        "不得把 caveat / teachingNotice 缩写成一句（声明完整性是可核验项）",
        "不得在 3D / 剖面 / 受力说明里补工程数值（teachingNotice.mustNotClaim）",
        "不得从参考站 olek.si 复制色值、字体、版式或文案（只提炼机制）",
        "不得在 19 目录内改写上游数据文件（17 是唯一数据源，19 只放 vendor 快照）",
    ]

    out = OrderedDict([
        ("schemaVersion", "1.0"),
        ("generatedAt", "2026-10-21T23:55:00+08:00"),
        ("generator", "scripts/build_field_mapping.py"),
        ("owner", "17-architecture-research"),
        ("audience", ["19-architecture-atlas", "18-architecture-models", "13-qa-curation", "14-publish"]),
        ("companionDoc", "handoff/FIELD-MAPPING.md"),
        ("upstream", {
            "catalog": "catalog.json",
            "catalogMeta": "catalog.meta.json",
            "glossary": "glossary.json",
            "cases": len(cases),
            "structureTypes": len(vocab_ids),
            "glossaryTerms": glossary["termCount"],
        }),
        ("caseFields", [
            {"name": n, "type": t, "required": req, "meaning": m, "source": s, "downstreamUse": d}
            for (n, t, req, m, s, d) in CASE_FIELDS
        ]),
        ("sourceFields", [
            {"name": n, "type": t, "required": req, "meaning": m, "source": s}
            for (n, t, req, m, s) in SOURCE_FIELDS
        ]),
        ("glossaryFields", [
            {"name": n, "type": t, "required": req, "meaning": m, "source": s}
            for (n, t, req, m, s) in GLOSSARY_FIELDS
        ]),
        ("fieldStats", field_stats),
        ("yearUncertaintyMapping", {
            "note": "权威口径：19 应查表，不要用正则。逐值列出，caseIds 为该值命中的案例。",
            "enumOrder": UNCERTAINTY_PRIORITY,
            "enumDistribution": enum_dist,
            "values": unc_list,
        }),
        ("vocabularies", {
            "regions": {"count": len(vocab["regions"]), "ids": list(vocab["regions"].keys())},
            "eras": {"count": len(vocab["eras"]), "ids": list(vocab["eras"].keys())},
            "structureTypes": {"count": len(vocab_ids), "ids": vocab_ids},
        }),
        ("structureTypes", struct_rows),
        ("structureAlignment", {
            "vocabCount": len(vocab_ids),
            "usedByCasesCount": len(used),
            "aligned": sorted(vocab_ids) == sorted(used),
            "missingInVocab": sorted(used - set(vocab_ids)),
            "unusedInCases": sorted(set(vocab_ids) - used),
        }),
        ("sources", {
            "typeDistribution": OrderedDict(sorted(src_types.items())),
            "evidenceLevelDistribution": OrderedDict(sorted(src_levels.items())),
            "httpOnlyUrls": http_sources,
            "httpNote": "https 变体在本机握手失败（SSL_ERROR_SYSCALL），http 变体实测 200，已如实保留并登记为受控例外；不得改写成未实测的 https。",
        }),
        ("glossaryCoverage", {
            "terms": glossary["termCount"],
            "casesCovered": len(covered),
            "casesTotal": len(cases),
            "coveredCaseIds": covered,
            "uncoveredCaseIds": uncovered,
            "note": "未覆盖是正常状态（术语表不追求每案专名），UI 不应显示错误态。",
        }),
        ("adapters", adapters),
        ("misalignments", misalignments),
        ("redlines", redlines),
    ])

    dst = os.path.join(ROOT, "handoff", "field-mapping.json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"handoff/field-mapping.json : {os.path.getsize(dst)} B")
    print(f"  字段：case {len(out['caseFields'])} / source {len(out['sourceFields'])} / glossary {len(out['glossaryFields'])}")
    print(f"  构造对齐：{out['structureAlignment']['vocabCount']}:{out['structureAlignment']['usedByCasesCount']} "
          f"aligned={out['structureAlignment']['aligned']}")
    print(f"  年份枚举分布：{dict(enum_dist)}")
    print(f"  术语覆盖：{len(covered)}/{len(cases)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
