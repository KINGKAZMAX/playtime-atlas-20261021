#!/usr/bin/env python3
"""
05-museum-research — 配图许可核验

对每个条目：
  1. 取该条目的首图文件（pageimages）
  2. 到 Wikimedia Commons 查该文件的 extmetadata（LicenseShortName / UsageTerms / LicenseUrl / Artist）
  3. 归一化为本项目受控词表：public-domain / cc-by-4.0 / cc-by-sa-4.0 / cc-by-nc-* / permission-required / no-image

输出 data/image_licenses.json
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

WIKI = "https://en.wikipedia.org/w/api.php"
COMMONS = "https://commons.wikimedia.org/w/api.php"
UA = "PLAytimeAtlasMuseumResearch/1.0 (image license verification; task 05)"
HEADERS = {"User-Agent": UA, "Api-User-Agent": UA, "Accept": "application/json",
           "Accept-Encoding": "identity"}
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "data", "image_licenses.json")

CONTROLLED = [
    (r"public\s*domain|cc0|cc[- ]?zero", "public-domain"),
    (r"cc[- ]by[- ]sa|attribution[- ]sharealike", "cc-by-sa-4.0"),
    (r"cc[- ]by[- ]nc[- ]sa", "cc-by-nc-sa-4.0"),
    (r"cc[- ]by[- ]nc", "cc-by-nc-4.0"),
    (r"cc[- ]by(?![- ]?(nc|sa))|attribution", "cc-by-4.0"),
    (r"gfdl|free\s+art|gnu\s+free", "gfdl"),
    (r"fair\s*use|non[- ]free", "permission-required"),
]


def api_get(base, params, tries=4, timeout=25):
    params = dict(params)
    params["format"] = "json"
    params["formatversion"] = "2"
    url = base + "?" + urllib.parse.urlencode(params)
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            last = e
            if e.code == 429:
                wait = min(30, 6 * (2 ** i))
                print(f"      429 -> backoff {wait}s", flush=True)
                time.sleep(wait)
                continue
            if i < tries - 1:
                time.sleep(1.5 * (i + 1))
        except Exception as e:  # noqa: BLE001
            last = e
            if i < tries - 1:
                time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"API failed: {last}")


def normalize(license_str):
    s = (license_str or "").lower()
    for pat, val in CONTROLLED:
        if re.search(pat, s):
            return val
    return "permission-required"


def main():
    seed = json.load(open(os.path.join(HERE, "..", "data", "seed_items.json"), encoding="utf-8"))
    titles = [it["wiki"] for it in seed]

    # 1) 取每条首图文件
    firsts = {}
    for i in range(0, len(titles), 20):
        batch = titles[i:i + 20]
        d = api_get(WIKI, {"action": "query", "prop": "pageimages", "piprop": "name",
                           "redirects": "1", "titles": "|".join(batch)})
        for p in d.get("query", {}).get("pages", []):
            if p.get("missing"):
                continue
            name = p.get("pageimage")
            if name and not name.lower().startswith("file:"):
                name = "File:" + name
            if name:
                firsts[p.get("title")] = name
        time.sleep(1.4)
    print(f"first images found: {len(firsts)}/{len(titles)}", flush=True)

    # 2) 查 Commons 许可
    out = {}
    for idx, it in enumerate(seed, 1):
        fname = firsts.get(it["wiki"])
        rec = {"id": it["id"], "wiki": it["wiki"], "imageFile": fname}
        if not fname:
            rec.update({"imageLicense": "no-image", "licenseRaw": None,
                        "licenseUrl": None, "artist": None,
                        "note": "该条目在维基百科无首图；建议程序化生成抽象图形"})
            out[it["id"]] = rec
            print(f"[{idx:3}/{len(seed)}] no-image        {it['wiki'][:52]}", flush=True)
            time.sleep(0.5)
            continue
        try:
            d = api_get(COMMONS, {"action": "query", "titles": fname, "prop": "imageinfo",
                                  "iiprop": "extmetadata", "iiextmetadatafilter":
                                  "LicenseShortName|UsageTerms|LicenseUrl|Artist|License",
                                  "redirects": "1"})
            pages = d.get("query", {}).get("pages", [])
            md = {}
            if pages and not pages[0].get("missing"):
                ii = (pages[0].get("imageinfo") or [{}])[0]
                md = ii.get("extmetadata") or {}
            raw = (md.get("LicenseShortName") or {}).get("value") or (md.get("License") or {}).get("value")
            rec["licenseRaw"] = re.sub(r"<[^>]+>", "", raw or "").strip() or None
            rec["licenseUrl"] = (md.get("LicenseUrl") or {}).get("value") or None
            rec["artist"] = re.sub(r"<[^>]+>", " ", (md.get("Artist") or {}).get("value") or "").strip()[:160] or None
            rec["usageTerms"] = re.sub(r"<[^>]+>", " ", (md.get("UsageTerms") or {}).get("value") or "").strip()[:200] or None
            rec["imageLicense"] = normalize(rec["licenseRaw"] or rec["usageTerms"])
            rec["note"] = ("Commons 文件页许可已核验；再分发前仍需保留署名与许可声明"
                           if rec["imageLicense"].startswith(("cc-", "public", "gfdl"))
                           else "该图为非自由许可或需授权；本项目不采用，仅登记来源")
        except Exception as e:  # noqa: BLE001
            rec["imageLicense"] = "no-image"
            rec["licenseRaw"] = None
            rec["note"] = f"Commons 查询失败（{e}）；按无可用配图处理"
        out[it["id"]] = rec
        print(f"[{idx:3}/{len(seed)}] {rec['imageLicense']:<18} {it['wiki'][:52]}", flush=True)
        time.sleep(0.55)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    from collections import Counter
    print("\n== licenses:", dict(Counter(v["imageLicense"] for v in out.values())), "->", OUT, flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
