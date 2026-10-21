#!/usr/bin/env python3
"""
05-museum-research — 条目事实抓取与核对（全批量版）

Step 1  批量 lead 摘要（每批 20 条）            → 立刻落盘 data/leads.json
Step 2  批量 wikitext（每批 10 条，revisions）  → 抽 infobox 的 year/platform/creator
Step 3  与人工策展的 expected_* 自动核对        → data/raw_sources.json

每步独立落盘，任何一步超时都不丢已完成结果。
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
UA = "PLAytimeAtlasMuseumResearch/1.0 (game museum curation research; task 05)"
HEADERS = {"User-Agent": UA, "Api-User-Agent": UA, "Accept": "application/json",
           "Accept-Encoding": "identity"}
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
LEADS = os.path.join(DATA, "leads.json")
OUT = os.path.join(DATA, "raw_sources.json")


def api_get(params, tries=4, timeout=40):
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
                wait = min(40, 8 * (2 ** i))
                print(f"      429 -> backoff {wait}s", flush=True)
                time.sleep(wait)
                continue
            if i < tries - 1:
                time.sleep(2 * (i + 1))
        except Exception as e:  # noqa: BLE001
            last = e
            if i < tries - 1:
                time.sleep(2 * (i + 1))
    raise RuntimeError(f"API failed: {last}")


def wiki_url(t):
    return "https://en.wikipedia.org/wiki/" + urllib.parse.quote(t.replace(" ", "_"), safe="()_,'-.:!$&~*+;=")


def clean(x):
    x = re.sub(r"<[^>]+>", "", x or "")
    return re.sub(r"\s+", " ", x).strip()


def parse_infobox(wikitext):
    """从 wikitext 抽取 infobox 字段。

    注意：infobox 通常跨多行，早期用 `[^\\n]*?` 的写法永远匹配不到结尾标记，
    必须允许 `.` 跨行（re.S），并以行首的 `}}` 作为结束锚点。
    """
    out = {}
    if not wikitext:
        return out
    m = re.search(r"\{\{\s*Infobox.*?\n\}\}", wikitext, re.S)
    if not m:
        return out
    box = m.group(0)
    # 行首 `}}` 之后的模板即 infobox 结束
    end = box.rfind("\n}}")
    if end > 0:
        box = box[:end]
    for line in box.split("\n"):
        if not line.strip().startswith("|"):
            continue
        k, _, v = line.partition("=")
        k = k.strip().lstrip("|").strip().lower()
        v = v.strip()
        if not k or not v:
            continue
        v = re.sub(r"\{\{[^{}]*\}\}", "", v)
        v = re.sub(r"<ref[^>]*?/>", "", v)
        v = re.sub(r"<ref.*?</ref>", "", v, flags=re.S)
        v = clean(v).strip("|").strip()
        if k and k not in out and v:
            out[k] = v[:300]
    return out


def ib_year(f):
    for k in ("released", "release date", "releasedate", "launched", "launch date",
              "debut", "year", "release date and age"):
        if k in f:
            ys = re.findall(r"\b(19[5-9]\d|20[0-2]\d)\b", f[k])
            if ys:
                return ys[0]
    return None


def ib_platforms(f):
    for k in ("platform", "platforms", "released on", "platforms(s)"):
        if k in f:
            parts = [p.strip() for p in re.split(r"[,/]|br\s*\|", f[k]) if p.strip()]
            return [p for p in parts if p][:14]
    return []


def main():
    seed = json.load(open(os.path.join(DATA, "seed_items.json"), encoding="utf-8"))
    titles = [it["wiki"] for it in seed]
    print(f"== {len(items)} items" if False else f"== {len(seed)} items", flush=True)

    # ---------- Step 1: leads ----------
    leads = {}
    alias = {}
    if os.path.exists(LEADS):
        blob = json.load(open(LEADS, encoding="utf-8"))
        leads = blob.get("leads", {})
        alias = blob.get("alias", {})
        print(f"[step1] resume from checkpoint: {len(leads)} leads, {len(alias)} aliases", flush=True)
    for i in range(0, len(titles), 20):
        batch = titles[i:i + 20]
        try:
            d = api_get({"action": "query", "prop": "extracts|pageprops|info",
                         "exintro": "1", "explaintext": "1", "inprop": "url",
                         "redirects": "1", "titles": "|".join(batch)})
        except Exception as e:
            print(f"[step1] batch {i//20} failed: {e}", flush=True)
            continue
        q = d.get("query", {})
        # 归一化 + 重定向：把请求名映射到最终页名
        norm = {n["from"]: n["to"] for n in q.get("normalized", [])}
        redir = {r["from"]: r["to"] for r in q.get("redirects", [])}
        for p in q.get("pages", []):
            if p.get("missing"):
                continue
            t = p.get("title", "")
            leads[t] = {"extract": clean(p.get("extract"))[:1800],
                        "url": p.get("fullurl") or wiki_url(t),
                        "canonical_title": t}
        # 为批内每个请求名建立别名
        for orig in batch:
            cur = orig
            for _ in range(4):
                nxt = norm.get(cur) or redir.get(cur)
                if not nxt or nxt == cur:
                    break
                cur = nxt
            alias[orig.lower()] = cur
        json.dump({"leads": leads, "alias": alias},
                  open(LEADS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"[step1] {i//20+1}/{(len(titles)+19)//20} total={len(leads)}", flush=True)
        time.sleep(1.2)

    # ---------- Step 2: wikitext (batched) ----------
    by_lower = {k.lower(): v for k, v in leads.items()}
    texts = {}
    for i in range(0, len(titles), 10):
        batch = titles[i:i + 10]
        try:
            d = api_get({"action": "query", "prop": "revisions", "rvprop": "content",
                         "rvslots": "main", "redirects": "1",
                         "titles": "|".join(batch)})
        except Exception as e:
            print(f"[step2] batch {i//10} failed: {e}", flush=True)
            time.sleep(3)
            continue
        for p in d.get("query", {}).get("pages", []):
            if p.get("missing"):
                continue
            try:
                content = p["revisions"][0]["slots"]["main"]["content"]
            except Exception:  # noqa: BLE001
                content = ""
            texts[p.get("title", "")] = content
        print(f"[step2] {i//10+1}/{(len(titles)+9)//10} total={len(texts)}", flush=True)
        time.sleep(1.0)

    # ---------- Step 3: verify ----------
    results = []
    for it in seed:
        t = it["wiki"]
        resolved = alias.get(t.lower(), t)
        rec = by_lower.get(resolved.lower()) or by_lower.get(t.lower())
        entry = {"id": it["id"], "wiki": t, "resolved_title": resolved, "era": it["era"],
                 "kind": it.get("kind", "work"),
                 "expected_year": it.get("year"), "expected_platform": it.get("platform"),
                 "expected_creator": it.get("creator")}
        if rec is None:
            entry.update(status="missing", sourceUrls=[wiki_url(t)], checks={"lead_found": False})
            results.append(entry)
            continue
        entry["canonical_title"] = rec["canonical_title"]
        entry["url"] = rec["url"]
        entry["lead"] = rec["extract"]
        entry["sourceUrls"] = [rec["url"]]

        wt = texts.get(rec["canonical_title"]) or texts.get(t) or ""
        fields = parse_infobox(wt)
        entry["infobox"] = fields

        year = str(it.get("year") or "")
        lead = entry["lead"]
        checks = {
            "lead_found": True,
            "year_in_lead": bool(year and year in lead),
            "infobox_year": ib_year(fields),
            "infobox_platforms": ib_platforms(fields),
            "infobox_creator": (fields.get("developer") or fields.get("developer(s)")
                                or fields.get("manufacturer") or fields.get("publisher")),
        }
        checks["year_match_infobox"] = (checks["infobox_year"] == year) if (checks["infobox_year"] and year) else None
        entry["checks"] = checks

        if checks["year_in_lead"]:
            entry["status"] = "ok"
        elif checks["year_match_infobox"] is True:
            entry["status"] = "ok-infobox"
        else:
            entry["status"] = "review"
        results.append(entry)

    json.dump(results, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    from collections import Counter
    c = Counter(r.get("status") for r in results)
    print("\n== status:", dict(c), "->", OUT, flush=True)
    print("== review items:", flush=True)
    for r in results:
        if r.get("status") in ("review", "missing", "error-lead"):
            print(f"   {r['status']:>8} {r['wiki']}  expected_year={r.get('expected_year')} "
                  f"ib_year={(r.get('checks') or {}).get('infobox_year')}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
