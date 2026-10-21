#!/usr/bin/env python3
"""
05-museum-research — 离线重解析 infobox

从 data/wikitext/ 的原始 wikitext 重新解析 infobox 字段并更新
data/raw_sources.json。用于改进解析器后免去重新联网抓取。

用法: python3 scripts/reparse_infobox.py
"""
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
RAW = os.path.join(DATA, "raw_sources.json")
WT = os.path.join(DATA, "wikitext")

spec = importlib.util.spec_from_file_location("fs", os.path.join(HERE, "fetch_sources.py"))
fs = importlib.util.module_from_spec(spec)
sys.modules["fs"] = fs
spec.loader.exec_module(fs)


def main():
    raw = json.load(open(RAW, encoding="utf-8"))
    changed = 0
    for r in raw:
        title = r.get("canonical_title") or r.get("wiki")
        fn = re.sub(r"[^A-Za-z0-9._-]", "_", title)[:120] + ".txt"
        path = os.path.join(WT, fn)
        if not os.path.exists(path):
            continue
        wt = open(path, encoding="utf-8").read()
        ib = fs.parse_infobox(wt)
        if ib != (r.get("infobox") or {}):
            changed += 1
        r["infobox"] = ib
        c = r.setdefault("checks", {})
        c["infobox_year"] = fs.ib_year(ib)
        c["infobox_platforms"] = fs.ib_platforms(ib)
        c["infobox_creator"] = (ib.get("developer") or ib.get("designer")
                                or ib.get("manufacturer") or ib.get("publisher"))
        year = str(r.get("expected_year") or "")
        c["year_match_infobox"] = (c["infobox_year"] == year) if (c["infobox_year"] and year) else None
        if r.get("status") == "review" and (c["year_in_article"] or c["year_match_infobox"] is True):
            r["status"] = "ok-article" if c["year_in_article"] else "ok-infobox"
    json.dump(raw, open(RAW, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    from collections import Counter
    print(f"reparsed {len(raw)} entries, {changed} changed -> {RAW}")
    print("status:", dict(Counter(r.get("status") for r in raw)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
