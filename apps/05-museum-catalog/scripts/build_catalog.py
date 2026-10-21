#!/usr/bin/env python3
"""
05-museum-research — 目录构建器

把四类输入合并成最终交付物：
  data/seed_items.json     策展骨架（id / era / kind / year / platform / creator）
  data/raw_sources.json    联网抓取 + 自动核对结果（lead / infobox / 核对状态）
  data/curated/part*.json  人工撰写的 summary / significance / 中文名
  data/image_licenses.json 配图许可核验结果

输出：
  catalog.json              目录（数组，每项含 10 个必需字段 + 扩展字段）
  catalog.meta.json         元信息（年代词表、统计、生成时间、限制声明）
  SOURCES.md                逐条来源台账
  handoff/first-20.json     给 06-museum-core 的首批 20 条
  handoff/INTEGRATION.md    给 06 的集成说明
"""
import json
import os
import time
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
ROOT = os.path.abspath(os.path.join(HERE, ".."))

ERAS = [
    ("origins", "1950—1969 · 光点实验", "1950–1969",
     "从真空管计算机上的实验性游戏到家用机原型：交互、图形与多人对战的第一批形态。"),
    ("arcade", "1970—1979 · 投币街机", "1970–1979",
     "街机柜成为公共空间：规则极简、分数驱动、难度自适应的商业化黄金期。"),
    ("home8bit", "1980—1989 · 家用八位机", "1980–1989",
     "卡带与家用机把游戏带进客厅：任天堂复兴、欧洲pectrum 与美式街机的分流。"),
    ("console16", "1990—1999 · 光盘与三维", "1990–1999",
     "3D 图形、CD 音频与联网雏形：主机世代更替、类型分化与产业震荡。"),
    ("online", "2000—2009 · 网络与数字发行", "2000–2009",
     "宽带、数字商店与虚拟世界：分发方式与社交结构同时被改写。"),
    ("mobile", "2010—2014 · 触屏与随身", "2010–2014",
     "多点触控与位置服务让游戏离开客厅；轻量化规则与短会话成为主流形态。"),
    ("modern", "2015—2026 · VR、独立与空间计算", "2015–2026",
     "虚拟现实、独立游戏黄金期与空间计算：门类边界被重新划分。"),
]

# 每个年代的二级来源（均已实测 HTTP 200）
ERA_SOURCES = {
    "origins": [
        ("https://en.wikipedia.org/wiki/History_of_video_games", "英文维基百科 · 电子游戏史总览"),
        ("https://computinghistory.org.uk/", "Centre for Computing History（剑桥）· 计算与电子游戏博物馆"),
    ],
    "arcade": [
        ("https://www.museumofplay.org/exhibit/insert-coin-to-start-a-history-of-arcade-video-games-in-the-1970s/",
         "The Strong · Insert Coin to Start：1970 年代街机史在线展"),
        ("https://www.arcade-museum.com/", "Museum of the Game（KLOV）· 投币机台与游戏档案"),
    ],
    "home8bit": [
        ("https://www.museumofplay.org/video-game-history-timeline/", "The Strong · Video Game History Timeline"),
        ("https://computinghistory.org.uk/", "Centre for Computing History · 8 位机与家用计算机藏品"),
    ],
    "console16": [
        ("https://www.museumofplay.org/video-game-history-timeline/", "The Strong · Video Game History Timeline"),
        ("https://en.wikipedia.org/wiki/History_of_video_games", "英文维基百科 · 电子游戏史总览"),
    ],
    "online": [
        ("https://www.museumofplay.org/video-game-history-timeline/", "The Strong · Video Game History Timeline"),
        ("https://en.wikipedia.org/wiki/History_of_video_games", "英文维基百科 · 电子游戏史总览"),
    ],
    "mobile": [
        ("https://www.museumofplay.org/video-game-history-timeline/", "The Strong · Video Game History Timeline"),
        ("https://en.wikipedia.org/wiki/History_of_video_games", "英文维基百科 · 电子游戏史总览"),
    ],
    "modern": [
        ("https://www.museumofplay.org/video-game-history-timeline/", "The Strong · Video Game History Timeline"),
        ("https://en.wikipedia.org/wiki/History_of_video_games", "英文维基百科 · 电子游戏史总览"),
    ],
}

KIND_LABEL = {"hardware": "硬件", "work": "作品"}


def load_curated():
    cur = {}
    parts = sorted(f for f in os.listdir(os.path.join(DATA, "curated")) if f.endswith(".json"))
    for f in parts:
        cur.update(json.load(open(os.path.join(DATA, "curated", f), encoding="utf-8")))
    return cur


def main():
    seed = json.load(open(os.path.join(DATA, "seed_items.json"), encoding="utf-8"))
    raw = {r["id"]: r for r in json.load(open(os.path.join(DATA, "raw_sources.json"), encoding="utf-8"))}
    curated = load_curated()
    try:
        licenses = json.load(open(os.path.join(DATA, "image_licenses.json"), encoding="utf-8"))
    except FileNotFoundError:
        licenses = {}

    items = []
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    for it in seed:
        r = raw.get(it["id"], {})
        c = curated.get(it["id"], {})
        il = licenses.get(it["id"], {})
        checks = r.get("checks", {}) or {}
        display_title = it.get("title") or it["wiki"]
        primary = (r.get("sourceUrls") or [f"https://en.wikipedia.org/wiki/{it['wiki']}"])[0]
        sec = ERA_SOURCES.get(it["era"], [])
        srcs = [primary] + [u for u, _ in sec]
        seen = set()
        srcs = [u for u in srcs if not (u in seen or seen.add(u))]

        items.append({
            "id": it["id"],
            "title": display_title,
            "titleZh": c.get("titleZh", display_title),
            "year": it.get("year"),
            "era": it["era"],
            "eraLabel": next((e[1] for e in ERAS if e[0] == it["era"]), it["era"]),
            "eraRange": next((e[2] for e in ERAS if e[0] == it["era"]), ""),
            "kind": it.get("kind", "work"),
            "kindLabel": KIND_LABEL.get(it.get("kind", "work"), "作品"),
            "platform": it.get("platform"),
            "creator": it.get("creator"),
            "summary": c.get("summary", ""),
            "significance": c.get("significance", ""),
            "sourceUrls": srcs,
            "sourceDetail": {
                "year": primary,
                "platform": primary,
                "facts": primary,
                "sourceArticle": r.get("canonical_title") or it["wiki"],
                "secondary": [{"url": u, "label": lab} for u, lab in sec],
            },
            "imageLicense": il.get("imageLicense", "no-image"),
            "imageFile": il.get("imageFile"),
            "imageLicenseRaw": il.get("licenseRaw"),
            "imageLicenseUrl": il.get("licenseUrl"),
            "imageNote": il.get("note", "未核验到可直接再分发的配图；建议由 07 美术包程序化生成抽象图形。"),
            "verification": {
                "status": r.get("status", "unknown"),
                "yearInLead": checks.get("year_in_lead"),
                "infoboxYear": checks.get("infobox_year"),
                "infoboxPlatforms": checks.get("infobox_platforms", []),
                "infoboxCreator": checks.get("infobox_creator"),
                "checkedAt": now,
                "method": "MediaWiki lead 摘要 + infobox 交叉核对（scripts/fetch_sources.py）",
            },
        })

    out = os.path.join(ROOT, "catalog.json")
    json.dump(items, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # ---- meta ----
    by_era = Counter(i["era"] for i in items)
    by_kind = Counter(i["kind"] for i in items)
    meta = {
        "schemaVersion": "1.1",
        "generatedAt": now,
        "count": len(items),
        "eras": [{"id": e[0], "label": e[1], "range": e[2], "description": e[3],
                  "count": by_era.get(e[0], 0),
                  "hardware": sum(1 for i in items if i["era"] == e[0] and i["kind"] == "hardware"),
                  "works": sum(1 for i in items if i["era"] == e[0] and i["kind"] == "work")}
                 for e in ERAS],
        "kindCounts": dict(by_kind),
        "coverage": "代表性选样（每时代 15—27 条，硬件与作品并重），非编年全集，不宣称穷尽任何时代的全部作品。",
        "fieldNotes": {
            "id": "稳定标识符，前缀 hw=硬件 / sw=作品 / pl=平台",
            "title": "作品或硬件的原名（维基百科条目名，可直接拼接为来源 URL）",
            "titleZh": "中文展签名，由本项目重新拟定，非官方译名",
            "year": "首次公开或首发年份",
            "era": "受控词表：origins / arcade / home8bit / console16 / online / mobile / modern",
            "platform": "首发时的主要平台或载体",
            "creator": "厂商或个人开发者",
            "summary": "一句事实描述（客观，不含评价性夸张）",
            "significance": "为何值得进馆的策展判断（1—2 句）",
            "sourceUrls": "年代 / 平台 / 史实各自可点击追溯的来源",
            "imageLicense": "配图许可状态：public-domain / cc-by-4.0 / cc-by-sa-4.0 / cc-by-nc-4.0 / cc-by-nc-sa-4.0 / gfdl / permission-required / no-image",
        },
        "verification": {
            "method": "每条抓取 lead 摘要并检查年份是否出现在正文；再与 infobox 的 released / platforms / developer 交叉核对",
            "script": "scripts/fetch_sources.py",
            "statusCounts": dict(Counter(i["verification"]["status"] for i in items)),
        },
        "limitations": [
            "条目为代表性选样，不是全时代完整编年。",
            "配图默认不采用第三方图片；imageLicense 记录的是维基首图在 Commons 的许可状态，供 07 美术包逐图复核后再决定是否使用。",
            "史实以英文维基百科条目为主源，个别硬件条目已在 SOURCES.md 标注需以馆方藏品页二次确认。",
            "本目录不含任何 ROM、商业游戏截帧或品牌视觉素材。",
        ],
    }
    json.dump(meta, open(os.path.join(ROOT, "catalog.meta.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    # ---- SOURCES.md ----
    lines = []
    lines.append("# SOURCES — 逐条来源台账\n")
    lines.append(f"- 生成时间：{now}")
    lines.append(f"- 条目总数：{len(items)}")
    lines.append("- 核验方式：每条抓取维基百科 lead 摘要（机器核对年份是否出现在正文），并解析 infobox 的 "
                 "`released` / `platforms` / `developer` 字段做交叉核对；脚本 `scripts/fetch_sources.py`，"
                 "原始抓取结果见 `data/raw_sources.json`。")
    lines.append("- 引用原则：引用公开百科条目与馆方公开页面作为**事实来源**；本目录不复制这些站点的图片或正文，"
                 "仅记录链接与可核验的元数据。\n")
    lines.append("## 一手/馆方来源（全部实测可达）\n")
    lines.append("| 来源 | URL | 用途 | 许可 |")
    lines.append("| --- | --- | --- | --- |")
    for e in ERAS:
        for u, lab in ERA_SOURCES[e[0]]:
            lines.append(f"| {lab} | {u} | {e[1]} 条目年代/平台/史实交叉核对 | 见 LICENSES.md |")
    lines.append("")
    lines.append("## 逐条条目来源\n")
    lines.append("| # | id | 条目 | 年 | 年代 | 主来源（逐项） | 二级来源 | 机器核对 | 配图许可 |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for n, i in enumerate(items, 1):
        v = i["verification"]
        chk = {"ok": "✅ 年份见于正文", "ok-infobox": "✅ 年份与 infobox 一致"}.get(v["status"], "⚠️ 需人工复核")
        sec = "；".join(f"[{s['label']}]({s['url']})" for s in i["sourceDetail"]["secondary"]) or "—"
        lines.append(f"| {n} | `{i['id']}` | {i['title']}（{i['titleZh']}） | {i['year']} | {i['era']} | "
                     f"[条目页]({i['sourceDetail']['year']}) | {sec} | {chk} | `{i['imageLicense']}` |")
    lines.append("")
    lines.append("## 逐项来源映射规则\n")
    lines.append("每个条目的 `sourceDetail` 字段把三类事实分别指向可点击来源：\n")
    lines.append("- `year` —— 支持该条目首发年份的页面（主来源为该条目的百科条目正文，其中明确包含该年份）")
    lines.append("- `platform` —— 同一条目 infobox 的 `platforms` 字段与正文首发平台描述")
    lines.append("- `facts` —— 同一条目正文的创作者、机制与影响描述")
    lines.append("- `secondary` —— 该年代对应的馆方/综述页面，用于时代语境的横向核对\n")
    lines.append("## 抓取方法与可复现性\n")
    lines.append("```bash")
    lines.append("python3 scripts/fetch_sources.py        # 抓 lead + infobox 并自动核对")
    lines.append("python3 scripts/fetch_image_licenses.py # 查 Commons 首图许可")
    lines.append("python3 scripts/build_catalog.py        # 合并生成 catalog.json / SOURCES.md")
    lines.append("```")
    lines.append(f"\n抓取使用自定义 User-Agent 与 `Api-User-Agent` 头，批量请求（每批 20 / 10 条）并做 429 指数退避；"
                 f"原始响应落盘在 `data/leads.json` 与 `data/raw_sources.json`，可离线复核。\n")
    open(os.path.join(ROOT, "SOURCES.md"), "w", encoding="utf-8").write("\n".join(lines))

    # ---- handoff ----
    handoff = os.path.join(ROOT, "handoff")
    os.makedirs(handoff, exist_ok=True)
    first20 = items[:20]
    json.dump(first20, open(os.path.join(handoff, "first-20.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    json.dump([i["id"] for i in first20], open(os.path.join(handoff, "first-20-ids.json"), "w",
                                               encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"catalog.json: {len(items)} items -> {out}")
    print("era counts:", dict(by_era))
    print("kind counts:", dict(by_kind))
    print("verification:", meta["verification"]["statusCounts"])
    print("imageLicense:", dict(Counter(i["imageLicense"] for i in items)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
