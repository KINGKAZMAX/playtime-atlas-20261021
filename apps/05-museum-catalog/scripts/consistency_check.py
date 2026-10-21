#!/usr/bin/env python3
"""
05-museum-research — 策展字段与来源条目的一致性抽查

catalog 的 `platform` / `creator` 是人工撰写的策展字段；infobox 的
`developer` / `publisher` / `manufacturer` / `platforms` 是从同一条来源条目
机器抽取的。此脚本做**交叉抽查**：把人工字段与机器字段做词元比对，
标出"人工字段与来源条目明显不符"的条目，交人工复核。

这不是自动改写——它只报告疑似不一致的条目。
"""
import json
import os
import re
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
ROOT = os.path.abspath(os.path.join(HERE, ".."))

# token 级等价映射：同指但写法不同的词元（厂商别名 / 人名与公司名同指）
TOKEN_ALIASES = {
    # 厂商别名
    "syzygy": "atari", "atari": "atari",
    "magnavox": "magnavox", "sanderson": "sanders",
    "ead": "nintendo", "epd": "nintendo",
    "rockstarnorth": "dma", "dma": "dma",
    "nintendoeurope": "nintendo",
    "gamefreak": "gamefreak",
    # 人名 ↔ 其公司
    "scottgames": "scottcawthon", "cawthon": "scottcawthon",
    "kenthompson": "kenthompson",
    "ivansutherland": "ivansutherland", "lincoln": "ivansutherland",
    "pajitnov": "pajitnov", "elorg": "pajitnov",
    "monolith": "meyerson",
    "notch": "mojang", "mojang": "mojang",
    "idsoftware": "idsoftware", "romero": "idsoftware", "carmack": "idsoftware",
    "cyan": "cyan", "miller": "cyan",
    "popcap": "popcap",
    "maddymakesgames": "maddymakesgames", "noelberry": "maddymakesgames",
    "teamb": "teamb", "teamcherry": "teamcherry",
    "niantic": "niantic", "hanke": "niantic",
    "supergiant": "supergiant", "kasavin": "supergiant",
    "localthunk": "localthunk",
    "ustwo": "ustwo", "kenwong": "ustwo",
}


def canon(tokset):
    out = set(tokset)
    for t in list(out):
        if t in TOKEN_ALIASES:
            out.add(TOKEN_ALIASES[t])
    return out


def toks(s):
    return {t for t in re.findall(r"[a-z0-9]+", (s or "").lower()) if len(t) > 2}


def main():
    raw = {r["id"]: r for r in json.load(open(os.path.join(DATA, "raw_sources.json"), encoding="utf-8"))}
    items = json.load(open(os.path.join(ROOT, "catalog.json"), encoding="utf-8"))

    flagged, notes, unverifiable = [], [], []
    for it in items:
        r = raw.get(it["id"], {})
        ib = r.get("infobox") or {}
        ib_creator = " ".join([
            ib.get("developer") or "", ib.get("developer(s)") or "",
            ib.get("designer") or "", ib.get("designer(s)") or "",
            ib.get("manufacturer") or "", ib.get("publisher") or "",
        ])
        ib_plats = " ".join(r.get("checks", {}).get("infobox_platforms") or [])
        c_creator = toks(it.get("creator", ""))
        c_plat = toks(it.get("platform", ""))
        i_creator = toks(ib_creator)
        i_plat = toks(ib_plats)

        # 创作者：人工字段与 infobox（developer/designer/manufacturer/publisher）应有词元交集
        cc = canon(c_creator)
        ic = canon(i_creator)
        # infobox 常常没有 designer 字段（如 Sketchpad 只有 developer=MIT Lincoln Laboratory），
        # 因此把 lead 正文也作为创作者佐证来源
        lead_creator = canon(toks((r.get("lead") or "")[:600]))
        if not i_creator and not lead_creator:
            # 来源条目是综述/列表型条目，本身既无 infobox 创作者字段、lead 也不含该创作者
            # → 无法机器核验，单独列出，不计为冲突
            unverifiable.append({"id": it["id"], "title": it["title"],
                                 "source": r.get("canonical_title") or r.get("wiki"),
                                 "curated_creator": it.get("creator")})
            creator_ok = None
        else:
            creator_ok = bool((cc & ic) or (cc & lead_creator)) if cc else None

        # 平台：infobox 的 platforms 绝大多数是「全平台移植列表」，而策展字段写的是
        # **首发平台**，因此平台差异是预期内的，只作提示不作错误判定。
        plat_ok = bool(c_plat & i_plat) if (c_plat and i_plat) else None

        if creator_ok is False:
            flagged.append({
                "id": it["id"], "title": it["title"],
                "creator": it.get("creator"), "ib_creator": ib_creator[:200],
                "creator_conflict": True,
                "platform": it.get("platform"), "ib_platforms": ib_plats[:200],
                "platform_conflict": False,
            })
        elif plat_ok is False:
            notes.append({"id": it["id"], "title": it["title"],
                          "curated_platform": it.get("platform"),
                          "ib_platforms": ib_plats[:140]})

    print(f"条目总数 {len(items)}")
    print(f"  创作者疑似冲突（需修正）：{len(flagged)} 条")
    print(f"  平台为移植列表差异（预期内，仅提示）：{len(notes)} 条")
    print(f"  来源条目无 infobox 创作者字段（无法机器核验）：{len(unverifiable)} 条\n")
    for f in flagged:
        print(f"  CREATOR  {f['id']:26} {f['title'][:40]}")
        print(f"      curated creator : {f['creator']}")
        print(f"      infobox creator : {f['ib_creator']}")
    if notes:
        print("\n  -- 平台提示（前 8 条）--")
        for n in notes[:8]:
            print(f"    {n['id']:26} curated={n['curated_platform'][:60]}")
    for u in unverifiable:
        print(f"  N/A     {u['id']:26} source={u['source']}  curated={u['curated_creator'][:60]}")
    json.dump({"creatorConflicts": flagged, "platformNotes": notes,
               "creatorUnverifiable": unverifiable},
              open(os.path.join(DATA, "consistency_flags.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n-> data/consistency_flags.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
