#!/usr/bin/env python3
"""
05-museum-research — 验收检查

逐条跑 TASK.md §6 的验收标准，输出可复现的检查结果（供 QA.md 记录）。
用法: python3 scripts/qa_check.py [--http]   （--http 会抽样联网复核来源可达性）
"""
import json
import os
import re
import ssl
import sys
import urllib.request
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, ".."))

REQUIRED_FIELDS = ["id", "title", "year", "era", "platform", "creator",
                    "summary", "significance", "sourceUrls", "imageLicense"]
ERA_RANGES = {"origins": (1950, 1969), "arcade": (1970, 1979), "home8bit": (1980, 1989),
              "console16": (1990, 1999), "online": (2000, 2009), "mobile": (2010, 2014),
              "modern": (2015, 2026)}
UA = "PLAytimeAtlasMuseumResearch/1.0 (qa check; task 05)"

results = []


def check(name, ok, detail):
    results.append((name, bool(ok), detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}\n       {detail}")
    return ok


def http_code(url, timeout=20):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            r.read(2048)
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def main():
    do_http = "--http" in sys.argv

    # 1. 目录可解析 & 条目数
    cat_path = os.path.join(ROOT, "catalog.json")
    items = json.load(open(cat_path, encoding="utf-8"))
    check("catalog.json 可解析且为数组", isinstance(items, list), f"type={type(items).__name__}, n={len(items)}")
    check("条目数 ≥ 70", len(items) >= 70, f"实际 {len(items)} 条")

    # 2. 字段齐全
    missing = defaultdict(list)
    for it in items:
        for f in REQUIRED_FIELDS:
            v = it.get(f)
            if v is None or (isinstance(v, (str, list)) and len(v) == 0):
                missing[f].append(it.get("id"))
    check("10 个必需字段全部非空", not missing,
          "全部齐全" if not missing else f"缺失: {dict(missing)}")

    # 3. 时代覆盖
    by_era = Counter(i["era"] for i in items)
    check("覆盖 7 个时代", len(by_era) == 7, f"{dict(by_era)}")
    er_have = defaultdict(set)
    for i in items:
        er_have[i["era"]].add(i["kind"])
    bad = {e: sorted(k) for e, k in er_have.items() if len(k) < 2}
    check("每个时代同时含硬件与作品", not bad, "全部满足" if not bad else f"缺: {bad}")

    # 4. 年代与年份区间一致
    mism = [(i["id"], i["year"], i["era"]) for i in items
            if not (ERA_RANGES[i["era"]][0] <= i["year"] <= ERA_RANGES[i["era"]][1])]
    check("year 落在 era 区间内", not mism, "全部一致" if not mism else str(mism))

    # 5. 来源
    nosrc = [i["id"] for i in items if not i.get("sourceUrls")]
    badproto = [i["id"] for i in items
                if any(not str(u).startswith("https://") for u in i.get("sourceUrls") or [])]
    check("每条 ≥1 条 https 来源", not nosrc and not badproto,
          f"无来源 {len(nosrc)} 条；非 https {len(badproto)} 条")
    sdetail = [i["id"] for i in items
               if not all(i.get("sourceDetail", {}).get(k) for k in ("year", "platform", "facts"))]
    check("sourceDetail 的 year/platform/facts 均已填", not sdetail,
          "全部已填" if not sdetail else str(sdetail[:5]))

    # 6. 文案非空且长度合理
    short = [(i["id"], len(i["summary"]), len(i["significance"])) for i in items
             if len(i["summary"]) < 20 or len(i["significance"]) < 20]
    check("summary / significance 均为实质文案", not short,
          "全部达标" if not short else f"过短: {short[:5]}")

    # 7. imageLicense 受控词表
    allowed = {"public-domain", "cc-by-4.0", "cc-by-sa-4.0", "cc-by-nc-4.0",
               "cc-by-nc-sa-4.0", "gfdl", "permission-required", "no-image"}
    badlic = [(i["id"], i["imageLicense"]) for i in items if i["imageLicense"] not in allowed]
    check("imageLicense 在受控词表内", not badlic,
          f"分布 {dict(Counter(i['imageLicense'] for i in items))}" if not badlic else str(badlic[:5]))

    # 8. 机器核对状态
    st = Counter(i["verification"]["status"] for i in items)
    unverified = [i["id"] for i in items if i["verification"]["status"] == "review"]
    check("全部条目年份已机器核验", not unverified, f"{dict(st)}")

    # 9. 首批 20 条交接
    h = os.path.join(ROOT, "handoff", "first-20.json")
    first = json.load(open(h, encoding="utf-8"))
    ids = json.load(open(os.path.join(ROOT, "handoff", "first-20-ids.json"), encoding="utf-8"))
    cat_ids = [i["id"] for i in items]
    ok20 = (len(first) == 20 and ids == [i["id"] for i in first]
            and all(i["id"] in cat_ids for i in first))
    check("handoff 首批 20 条与全量一致", ok20, f"first-20={len(first)} 条, ids 长度={len(ids)}")

    # 10. manifest 字段
    man = json.load(open(os.path.join(ROOT, "manifest.json"), encoding="utf-8"))
    need = ["id", "title", "description", "entry", "buildCommand", "outputDir", "status"]
    miss_m = [k for k in need if k not in man or not str(man[k]).strip()]
    check("manifest.json 字段齐全", not miss_m, f"缺: {miss_m}" if miss_m else "id/title/description/entry/buildCommand/outputDir/status 齐全")

    # 11. 参考站数量与五要素
    rd = open(os.path.join(ROOT, "REFERENCE-DESIGN.md"), encoding="utf-8").read()
    # 只有含 "**URL**" 行的章节才是参考站条目（其余是速查表/矩阵/建议等）
    blocks = [b for b in re.split(r"^## \d+\. ", rd, flags=re.M)[1:] if "**URL**" in b]
    sites = [b.split("\n", 1)[0].strip() for b in blocks]
    check("参考站 ≥ 8 个", len(sites) >= 8, f"{len(sites)} 个: {', '.join(sites)}")
    incomplete = []
    for b in blocks:
        title = b.split("\n", 1)[0].strip()
        need_kw = ["**URL**", "截图", "| **交互** |", "| **美术** |", "| **许可** |"]
        if not all(k in b for k in need_kw):
            incomplete.append((title, [k for k in need_kw if k not in b]))
    check("每个参考站五要素齐全（URL/截图/交互/美术/许可）", not incomplete,
          f"{len(sites)} 站全部齐全" if not incomplete else f"缺: {incomplete}")

    # 12. 截图文件
    idx = os.path.join(ROOT, "screenshots", "INDEX.tsv")
    if os.path.exists(idx):
        rows = [l.split("\t") for l in open(idx, encoding="utf-8").read().splitlines()[1:] if l.strip()]
        good = [r for r in rows if r[3].isdigit() and int(r[3]) > 10000]
        check("截图存档 ≥ 8 张有效", len(good) >= 8,
              f"{len(good)} 张有效 / 共 {len(rows)} 条记录")

    # 13. 抽样联网复核来源可达性
    if do_http:
        import random
        random.seed(20261021)
        sample = random.sample(items, 18)
        codes = []
        for it in sample:
            u = it["sourceUrls"][0]
            c = http_code(u)
            codes.append((it["id"], c))
        ok = sum(1 for _, c in codes if 200 <= c < 400)
        check("抽样 18 条主来源可达（HTTP 200-399）", ok >= 15,
              f"{ok}/18 可达: " + ", ".join(f"{i}={c}" for i, c in codes))

    # 14. 无第三方素材混入交付物
    bad_ext = [f for f in os.listdir(ROOT)
               if f.lower().endswith((".rom", ".nes", ".gba", ".zip", ".iso", ".bin"))]
    check("交付目录不含 ROM / 打包素材", not bad_ext, f"发现: {bad_ext}" if bad_ext else "未发现")

    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n== {passed}/{len(results)} 项通过")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
