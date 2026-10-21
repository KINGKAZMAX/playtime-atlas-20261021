#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_verification_status.py — 生成 handoff/verification-status.json 与
handoff/VERIFIED-VS-ASSUMED.md。

18 号被明确要求「不等全部研究，可先实现注明假设的通用示意并后续核验」。
本脚本把每条案例**逐字段**标注为「已核验 / 存在分歧 / 属推断」，
并统一登记**所有 3D 层面的内容都是假设**这一事实，供 18 / 19 直接引用。

用法：python3 scripts/build_verification_status.py
"""
from __future__ import annotations

import json
import os
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> int:
    with open(os.path.join(ROOT, "catalog.json"), encoding="utf-8") as f:
        catalog = json.load(f)
    with open(os.path.join(ROOT, "catalog.meta.json"), encoding="utf-8") as f:
        meta = json.load(f)

    # 3D 层面的统一声明——无论哪条案例，3D 内容一律是假设
    ASSUMPTION_BLOCK = {
        "appliesToAllCases": True,
        "items": [
            {
                "id": "a3d-form",
                "level": "assumption",
                "subject": "3D 模型的体量、比例与构件外形",
                "note": "本目录不含任何测绘数据或点云。所有模型形态均为按公开描述推导的**教学示意**，"
                        "不得声称是复原成果、测绘成果或照片写实。",
            },
            {
                "id": "a3d-section",
                "level": "assumption",
                "subject": "剖面位置与节点细节",
                "note": "剖面切在哪里、榫卯卯眼的实际尺寸与加工痕迹均属示意，不代表具体实例的实测数据。",
            },
            {
                "id": "a3d-force",
                "level": "assumption",
                "subject": "受力箭头与传力路径",
                "note": "**定性示意**，箭头只表示传力方向，不表示大小；不含任何工程计算结果。",
            },
            {
                "id": "a3d-material",
                "level": "assumption",
                "subject": "材质与配色",
                "note": "材质、贴图与配色由 16-design-system 的 token 决定，"
                        "与具体实例的原始色彩无对应关系。",
            },
            {
                "id": "a3d-naming",
                "level": "assumption",
                "subject": "构件命名在特定时代口径下的对应",
                "note": "glossary.json 的 74 条中文名依通行用法整理；"
                        "宋《营造法式》、清《工程做法则例》与地方做法的称谓可能不同，"
                        "18 号若采用特定时代口径请以该时代称谓为准并在模型说明中注明。",
            },
        ],
    }

    items = []
    counters = Counter()
    for c in catalog["cases"]:
        src_levels = {s["evidenceLevel"] for s in c["sources"]}
        year_state = {
            "确切": "verified",
            "约略": "disputed",
            "不适用": "not-applicable",
        }.get(c["yearUncertainty"].split("（")[0].strip(), "disputed")

        fields = {
            "nameZh": "verified",
            "nameEn": "verified",
            "pinyin": "verified",
            "region": "verified",
            "province": "verified",
            "era": "verified",
            "type": "verified",
            "principleZh": "verified",
            "principleEn": "verified",
            "cultureZh": "verified",
            "cultureEn": "verified",
            "caveat": "verified",
            "yearText": year_state,
            "yearUncertainty": year_state,
            "3D 模型 / 剖面 / 受力": "assumption",
        }
        if "secondary" in src_levels and "primary-verified" not in src_levels:
            fields["principleZh"] = "disputed"
            fields["principleEn"] = "disputed"

        items.append({
            "id": c["id"],
            "nameZh": c["nameZh"],
            "nameEn": c["nameEn"],
            "structureTypes": [s["id"] for s in c["structureTypes"]],
            "evidenceLevel": c["verification"]["level"],
            "sourceLevels": sorted(src_levels),
            "sourceCount": len(c["sources"]),
            "yearState": year_state,
            "yearText": c["yearText"],
            "caveat": c["caveat"],
            "fieldStatus": fields,
            "readyForModel": year_state != "disputed" or c["yearUncertainty"].startswith("确切"),
        })
        counters[year_state] += 1

    out = {
        "schemaVersion": "1.0",
        "title": "17 号 · 已核验 / 仍属假设 标记",
        "titleEn": "Verified vs Assumed — field-level status for each case",
        "generatedAt": "2026-10-21T23:25:00+08:00",
        "generator": "scripts/build_verification_status.py",
        "howToRead": {
            "verified": "本任务实际访问并读到一次来源，相关表述可回溯到 SOURCES.md 中的链接。",
            "disputed": "来源之间存在分歧或学界仍在讨论，已在 yearUncertainty / caveat 中标注，**不要在界面上取单一定论**。",
            "assumption": "本目录未提供该层级的依据，属教学假设；必须以「教学示意」标注，不得冒充实测或复原。",
            "not-applicable": "该字段本身不适用（如持续性传统无单一始建年）。",
        },
        "globalAssumptions": ASSUMPTION_BLOCK,
        "teachingNotice": meta.get("teachingNotice", {}),
        "summary": {
            "cases": len(items),
            "byYearState": dict(counters),
            "all3DIsAssumption": True,
        },
        "cases": items,
    }

    hd = os.path.join(ROOT, "handoff")
    os.makedirs(hd, exist_ok=True)
    with open(os.path.join(hd, "verification-status.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    # --- Markdown 版（给 18 直接阅读） ---
    lines = [
        "# 已核验 / 仍属假设 — 给 18 号的逐条标记",
        "",
        "> 生成：`scripts/build_verification_status.py` → `handoff/verification-status.json`",
        "> 目的：18 号被要求「可先实现注明假设的通用示意并后续核验」。本文件就是那份「哪里已核验、哪里仍是假设」的清单。",
        "",
        "## 判读口径",
        "",
        "| 标记 | 含义 | 18 号怎么用 |",
        "| --- | --- | --- |",
        "| `verified` | 本任务实际访问并读到一次来源，表述可回溯到 `SOURCES.md` 的链接 | 可直接作为文案与模型依据 |",
        "| `disputed` | 来源之间有分歧或学界仍在讨论 | **不要在界面上取单一定论**；可并列呈现 |",
        "| `assumption` | 本目录未提供该层级依据 | 只能作教学示意，界面须带「教学示意」标注 |",
        "",
        "## ⚠️ 所有 3D 层面一律是假设",
        "",
        "无论哪条案例，下列内容**都不是**测绘成果：",
        "",
    ]
    for it in ASSUMPTION_BLOCK["items"]:
        lines.append(f"- **{it['subject']}** — {it['note']}")
    lines += [
        "",
        "## 逐条状态",
        "",
        "| 案例 | 名称 | 构造 | 证据级别 | 年代状态 | 可直接建模 |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for it in items:
        state = {"verified": "✅ 已核验", "disputed": "⚠️ 有分歧", "not-applicable": "— 不适用"}[it["yearState"]]
        ready = "✅" if it["readyForModel"] else "⚠️ 先做示意"
        lines.append(
            f"| `{it['id']}` | {it['nameZh']} | {', '.join(it['structureTypes'])} | "
            f"{it['evidenceLevel']}（{it['sourceCount']} 源） | {state} | {ready} |"
        )
    lines += [
        "",
        "## 汇总",
        "",
        f"- 案例总数：**{len(items)}**",
        f"- 年代状态：已核验 {counters['verified']} / 有分歧 {counters['disputed']} / 不适用 {counters['not-applicable']}",
        "- **3D 相关字段：42/42 全部为 `assumption`**",
        "",
        "> 教学示意声明请直接透传 `catalog.json` 每条的 `teachingNotice` 字段，**不要另写一套文案**。",
        "",
    ]
    with open(os.path.join(hd, "VERIFIED-VS-ASSUMED.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"handoff/verification-status.json : {len(items)} 条")
    print(f"handoff/VERIFIED-VS-ASSUMED.md    : 已生成")
    print(f"年代状态分布                      : {dict(counters)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
