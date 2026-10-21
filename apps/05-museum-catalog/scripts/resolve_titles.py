#!/usr/bin/env python3
"""
05-museum-research — 条目标题校正（严格版）

硬性门槛（缺一不可）：
  1. 候选条目正文（lead）必须包含策展年份
  2. 候选标题必须与原名共享**至少一个区分性词元**（剔除 video/game/console 等通用词）
  3. 候选不得含 "(disambiguation)"

只产出建议，不自动写回；人工确认后加 --apply 写回 seed_items.json。
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://en.wikipedia.org/w/api.php"
UA = "PLAytimeAtlasMuseumResearch/1.0 (title resolution; task 05)"
HEADERS = {"User-Agent": UA, "Api-User-Agent": UA, "Accept": "application/json"}
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")

STOP = {"video", "game", "games", "console", "computer", "the", "of", "a", "history",
        "list", "series", "program", "programming", "in", "and", "prototype"}


def api_get(params, tries=6, timeout=30):
    params = dict(params)
    params["format"] = "json"
    params["formatversion"] = "2"
    url = API + "?" + urllib.parse.urlencode(params)
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code == 429:
                w = min(45, 10 * (2 ** i))
                print(f"      429 -> backoff {w}s", flush=True)
                time.sleep(w)
                continue
            time.sleep(2 * (i + 1))
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"API failed: {last}")


def tokens(s):
    return {t for t in re.findall(r"[a-z0-9]+", s.lower()) if t not in STOP and len(t) > 2}


def search(query, limit=8):
    d = api_get({"action": "query", "list": "search", "srsearch": query,
                 "srlimit": limit, "srnamespace": 0})
    return [r["title"] for r in d.get("query", {}).get("search", [])]


def lead_of(title):
    d = api_get({"action": "query", "prop": "extracts", "exintro": "1", "explaintext": "1",
                 "redirects": "1", "titles": title})
    for p in d.get("query", {}).get("pages", []):
        if p.get("missing"):
            return ""
        return re.sub(r"\s+", " ", p.get("extract") or "")
    return ""


def main():
    apply = "--apply" in sys.argv
    raw = json.load(open(os.path.join(DATA, "raw_sources.json"), encoding="utf-8"))
    bad = [r for r in raw if r.get("status") == "missing"]
    fixes, unresolved = {}, []

    for r in bad:
        orig, year = r["wiki"], str(r.get("expected_year"))
        base = re.sub(r"\s*\(\d{4}( video game)?\)$", "", orig).strip()
        cands, seen = [], set()
        try:
            found = [base] + search(f'"{base}"', 8) + search(base, 8)
        except Exception as e:  # noqa: BLE001
            print(f"  search failed for {orig}: {e}", flush=True)
            found = [base]
        for c in found:
            if c and c.lower() not in seen:
                seen.add(c.lower())
                cands.append(c)
        best = None
        for c in cands:
            if "(disambiguation)" in c:
                continue
            ct = tokens(c)
            if not ct:
                continue
            ot = tokens(orig)
            if not (ct & ot):
                continue                      # 门槛 2：无区分性词元交集
            lead = lead_of(c)
            if not lead or year not in lead:
                continue                      # 门槛 1：正文必须含年份
            score = len(ct & ot) / len(ct | ot)
            if best is None or score > best[0]:
                best = (score, c)
            time.sleep(0.35)
        if best:
            fixes[r["id"]] = {"old": orig, "new": best[1], "score": round(best[0], 3), "year": year}
            print(f"  FIX {r['id']:26} {orig!r} -> {best[1]!r} (score {best[0]:.2f})", flush=True)
        else:
            unresolved.append({"id": r["id"], "wiki": orig, "year": year, "tried": cands[:8]})
            print(f"  ?? {r['id']:26} {orig!r} 无合规候选，需人工处理", flush=True)

    json.dump({"fixes": fixes, "unresolved": unresolved},
              open(os.path.join(DATA, "title_fixes.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    if apply and fixes:
        seed = json.load(open(os.path.join(DATA, "seed_items.json"), encoding="utf-8"))
        for x in seed:
            f = fixes.get(x["id"])
            if f:
                x["wiki"] = f["new"]
        json.dump(seed, open(os.path.join(DATA, "seed_items.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        print(f"\napplied {len(fixes)} title fixes")
    else:
        print(f"\n{len(fixes)} fixes, {len(unresolved)} unresolved -> data/title_fixes.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
