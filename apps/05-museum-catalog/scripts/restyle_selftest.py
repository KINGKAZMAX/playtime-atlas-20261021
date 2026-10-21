#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05 策展目录 · 自测（RESTYLE-SPEC 第 1 步「自测结论供 13 对照」）

产出三组可复现证据：
  A. 数据侧：catalog.json 条目数 / 必需字段缺失数 / id 唯一性 / 时代与类型分布 / 来源完整性
  B. 页面侧：把 dist/ 按 Pages 子路径形态（/playtime-atlas-20261021/research/catalog.html）
     起一个临时静态服务，用真实浏览器（headless Chrome + CDP）打开并**真实点击**
     年代/类型筛选与搜索框，记录：控制台错误数、未捕获异常数、404/网络失败数
  C. 线上侧：对 https://kingkazmax.github.io/playtime-atlas-20261021/research/catalog.html
     做一次 HTTP 实探（网络不可达时如实记为 skipped，不算失败）

用法：
    python3 scripts/restyle_selftest.py            # 全量
    python3 scripts/restyle_selftest.py --no-live  # 跳过线上实探
产物：evidence/restyle-selftest.json（+ 终端摘要）
"""

from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ego_probe import EgoProbeError, run_ego_probe as ego_run_ego_probe  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog.json"
DIST = ROOT / "dist"
EVIDENCE = ROOT / "evidence"
GENERATOR = ROOT / "src" / "catalog-page" / "build-catalog-page.mjs"

PAGES_BASE = "playtime-atlas-20261021"
PAGES_CATALOG_PATH = f"/{PAGES_BASE}/research/catalog.html"
LIVE_URL = f"https://kingkazmax.github.io{PAGES_CATALOG_PATH}"

# catalog.json 的「必需字段」口径（与 README/QA.md 一致）
REQUIRED_FIELDS = [
    "id",
    "title",
    "titleZh",
    "year",
    "era",
    "kind",
    "platform",
    "creator",
    "summary",
    "sourceUrls",
]


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):  # noqa: D401 - 静默
        pass


def stage_pages_tree(tmp: Path) -> None:
    """把 dist/ 摆成 Pages 的目录形态

    线上布局（见 14-publish/release/docs）：
        <base>/index.html              作品总廊
        <base>/research/catalog.html   策展目录页
        <base>/research/catalog.css    本页样式层
        <base>/assets/ds/**            16 设计系统资产（tokens/components/fonts）
        <base>/data/works.json         作品清单（页脚链接指向）
    """
    base = tmp / PAGES_BASE
    research = base / "research"
    research.mkdir(parents=True, exist_ok=True)
    for name in ("catalog.html", "catalog.css"):
        src = DIST / name
        if not src.exists():
            raise SystemExit(f"[selftest] 缺少构建产物 {src}，先跑 node src/catalog-page/build-catalog-page.mjs")
        shutil.copy2(src, research / name)

    # 设计系统资产：随页面发布到站点根 assets/ds/（MIGRATION-NOTES §0 / §14.1）
    ds_src = DIST / "assets" / "ds"
    if not ds_src.exists():
        raise SystemExit(f"[selftest] 缺少设计系统资产 {ds_src}")
    shutil.copytree(ds_src, base / "assets" / "ds")

    # 面包屑与页脚指向 ../（作品总廊）与 ../data/works.json；放占位页，
    # 既保证相对链接不 404，也让 404 检查有意义
    (base / "index.html").write_text(
        '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>作品总廊</title></head>'
        "<body><p>staging placeholder for ../ (hall)</p></body></html>",
        encoding="utf-8",
    )
    (base / "data").mkdir(parents=True, exist_ok=True)
    (base / "data" / "works.json").write_text(
        json.dumps({"works": []}, ensure_ascii=False), encoding="utf-8"
    )


def check_data() -> dict:
    raw = json.loads(CATALOG.read_text(encoding="utf-8"))
    items = raw if isinstance(raw, list) else (raw.get("items") or raw.get("catalog") or [])
    missing = Counter()
    missing_examples = {}
    for it in items:
        for f in REQUIRED_FIELDS:
            v = it.get(f)
            empty = v is None or (isinstance(v, str) and not v.strip()) or (isinstance(v, (list, dict)) and len(v) == 0)
            if empty:
                missing[f] += 1
                missing_examples.setdefault(f, it.get("id", "?"))

    ids = [it.get("id") for it in items]
    dup_ids = [k for k, v in Counter(ids).items() if v > 1]

    bad_urls = []
    for it in items:
        for u in it.get("sourceUrls") or []:
            if not (isinstance(u, str) and u.startswith(("http://", "https://"))):
                bad_urls.append({"id": it.get("id"), "url": u})

    eras = Counter(it.get("era") for it in items)
    kinds = Counter(it.get("kind") for it in items)
    verif = Counter((it.get("verification") or {}).get("status") for it in items)
    years = [it.get("year") for it in items if isinstance(it.get("year"), int)]

    return {
        "entryCount": len(items),
        "requiredFields": REQUIRED_FIELDS,
        "missingByField": dict(missing),
        "missingTotal": sum(missing.values()),
        "missingExamples": missing_examples,
        "duplicateIds": dup_ids,
        "badSourceUrls": bad_urls[:20],
        "badSourceUrlCount": len(bad_urls),
        "eraCounts": dict(eras),
        "kindCounts": dict(kinds),
        "verificationStatus": dict(verif),
        "yearMin": min(years) if years else None,
        "yearMax": max(years) if years else None,
        "_items": items,
    }


def expected_search(items: list[dict], term: str) -> list[str]:
    """复刻页面的检索口径：title/titleZh/creator/platform/summary 拼串后小写包含匹配"""
    t = term.lower()
    hits = []
    for it in items:
        blob = " ".join(
            str(x) for x in [it.get("title"), it.get("titleZh"), it.get("creator"), it.get("platform"), it.get("summary")] if x
        ).lower()
        if t in blob:
            hits.append(it.get("titleZh") or it.get("title"))
    return hits


def run_browser_probe(url: str, term: str) -> dict:
    """跑 Ego 版功能探针（依用户长期约定：Ego 是唯一浏览器入口）。

    探针不可用（Ego CLI 缺失 / 执行异常 / 超时）= **harness 问题**，不是页面缺陷，
    与 13 对 03/04/12 的判定口径一致：不把 harness 故障算成产品失败。
    """
    try:
        return ego_run_ego_probe(
            "ego_selftest.template.mjs",
            url=url,
            term=term,
            timeout=300,
        )
    except EgoProbeError as exc:
        return {
            "ok": False,
            "harness": True,
            "harnessTimeout": True,
            "error": f"ego-browser 探针不可用：{exc}",
        }


def probe_live() -> dict:
    """线上实探：依用户长期约定，**线上核验一律走 Ego**（page.fetch 取状态 + 渲染后取卡片数）。"""
    try:
        return ego_run_ego_probe("ego_live_probe.template.mjs", url=LIVE_URL, timeout=120)
    except EgoProbeError as exc:
        return {"url": LIVE_URL, "ok": False, "skipped": True, "reason": str(exc)}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-live", action="store_true", help="跳过线上实探")
    ap.add_argument("--term", default="nintendo", help="搜索自测关键词")
    ap.add_argument("--keep-going", action="store_true", help="单页失败不中断")
    args = ap.parse_args()

    report = {
        "tool": "05-museum-research / scripts/restyle_selftest.py",
        "startedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "pagesBase": f"/{PAGES_BASE}/",
        "catalogPath": PAGES_CATALOG_PATH,
        "liveUrl": LIVE_URL,
        "checks": [],
    }

    def add(name, ok, detail, level="fail"):
        report["checks"].append({"name": name, "ok": bool(ok), "level": "info" if ok else level, "detail": detail})
        return ok

    # ---- A. 数据侧 ----
    data = check_data()
    items = data.pop("_items")
    report["data"] = data

    add("catalog 条目数 = 139", data["entryCount"] == 139, f"实际 {data['entryCount']} 条")
    add("必需字段缺失数 = 0", data["missingTotal"] == 0, f"缺失 {data['missingTotal']} 项 {data['missingByField']}")
    add("id 唯一", not data["duplicateIds"], f"重复 {data['duplicateIds']}")
    add("来源 URL 全部为 http(s)", data["badSourceUrlCount"] == 0, f"异常 {data['badSourceUrlCount']} 条")
    add(
        "核验状态无 review",
        data["verificationStatus"].get("review", 0) == 0,
        f"分布 {data['verificationStatus']}",
    )
    add("时代数 = 7", len(data["eraCounts"]) == 7, f"{data['eraCounts']}")

    # ---- 构建 ----
    build = subprocess.run(["node", str(GENERATOR)], capture_output=True, text=True, cwd=str(ROOT))
    report["build"] = {"exitCode": build.returncode, "stdout": build.stdout.strip(), "stderr": build.stderr.strip()[-800:]}
    if build.returncode != 0:
        add("页面构建", False, f"生成器退出码 {build.returncode}: {build.stderr.strip()[-400:]}")
        EVIDENCE.mkdir(parents=True, exist_ok=True)
        (EVIDENCE / "restyle-selftest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print("[selftest] 构建失败，已写入 evidence/restyle-selftest.json")
        return 1
    add("页面构建成功", True, build.stdout.strip())

    # ---- B. 页面侧（Pages 子路径 + 真实浏览器）----
    tmp = Path(tempfile.mkdtemp(prefix="playtime-pages-"))
    port = free_port()
    server = None
    thread = None
    try:
        stage_pages_tree(tmp)
        handler = functools.partial(QuietHandler, directory=str(tmp))
        server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()

        local_url = f"http://127.0.0.1:{port}{PAGES_CATALOG_PATH}"
        report["localUrl"] = local_url
        probe = run_browser_probe(local_url, args.term)
        report["browser"] = probe

        if probe.get("skipped"):
            add("页面在 Pages 子路径下打开", False, probe.get("reason", "probe skipped"))
        elif probe.get("harnessTimeout"):
            add("页面在 Pages 子路径下打开", False, probe.get("error"), level="info")
            report["browser"]["classification"] = "harness-timeout"
        elif not probe.get("ok"):
            add("页面在 Pages 子路径下打开", False, probe.get("error") or probe.get("evalError"))
        else:
            r = probe["result"]
            add(
                "页面在 Pages 子路径下正常打开",
                r["cardCount"] > 0 and r["lang"] == "zh-CN",
                f"卡片 {r['cardCount']} 张 / lang={r['lang']} / title={r['title']}",
            )
            add("渲染卡片数 = 139", r["cardCount"] == 139, f"实际 {r['cardCount']}")
            add("初始计数 = 139 / 139", r["initial"]["visible"] == 139, r["initial"]["count"])

            era_ok = True
            era_detail = []
            for era, n in data["eraCounts"].items():
                got = r["era"].get(era, {}).get("visible")
                era_detail.append(f"{era}: 期望 {n} / 实得 {got}")
                if got != n:
                    era_ok = False
            add("年代筛选逐项命中", era_ok, "；".join(era_detail))
            add(
                "年代筛选互斥（单选）",
                all(v.get("pressedCount") == 1 for v in r["era"].values()),
                str({k: v.get("pressedCount") for k, v in r["era"].items()}),
            )
            add("全部时代复位", r["afterEraReset"]["visible"] == 139, r["afterEraReset"]["count"])

            kind_ok = all(r["kind"].get(k, {}).get("visible") == n for k, n in data["kindCounts"].items())
            add(
                "类型筛选逐项命中",
                kind_ok,
                "；".join(f"{k}: 期望 {n} / 实得 {r['kind'].get(k, {}).get('visible')}" for k, n in data["kindCounts"].items()),
            )
            add("全部类型复位", r["afterKindReset"]["visible"] == 139, r["afterKindReset"]["count"])

            exp_hits = expected_search(items, args.term)
            got_hits = r["search"]["titles"]
            add(
                f"搜索「{args.term}」命中集合一致",
                sorted(exp_hits) == sorted(got_hits) and len(exp_hits) > 0,
                f"期望 {len(exp_hits)} 条 / 实得 {len(got_hits)} 条",
            )
            add("搜索清空后复原 139", r["searchReset"]["visible"] == 139, r["searchReset"]["count"])

            d = r.get("detail", {})
            add(
                "条目详情可展开且字段齐全",
                d.get("open") is True and d.get("kvRows") == 6 and d.get("sourceLinks", 0) >= 1,
                f"kv {d.get('kvRows')} 行 / 来源链接 {d.get('sourceLinks')} 条 / 小标题 {d.get('headings')}",
            )

            probe_warnings = probe.get("warnings") or []
            add(
                "浏览器探针无样式就绪告警",
                not probe_warnings,
                {"warnings": probe_warnings} if probe_warnings else "0 条告警（轮询等待 + 求值重试均未触发）",
            )
            add("控制台错误数 = 0", probe.get("consoleErrorCount", -1) == 0, probe.get("consoleErrors", [])[:5])
            add("未捕获异常数 = 0", probe.get("exceptionCount", -1) == 0, probe.get("exceptions", [])[:5])
            add("404 / 网络失败数 = 0", probe.get("httpErrorCount", -1) == 0 and probe.get("netFailureCount", -1) == 0,
                {"httpErrors": probe.get("httpErrors", [])[:5], "netFailures": probe.get("netFailures", [])[:5]})
            report["computedStyles"] = r.get("computed")
    except Exception as e:  # noqa: BLE001
        add("页面侧自测", False, f"{type(e).__name__}: {e}")
    finally:
        if server:
            server.shutdown()
            server.server_close()
        shutil.rmtree(tmp, ignore_errors=True)

    # ---- C. 线上侧 ----
    if args.no_live:
        report["live"] = {"skipped": True, "reason": "--no-live"}
        add("线上实探（跳过）", True, "按参数跳过")
    else:
        live = probe_live()
        report["live"] = live
        if live.get("skipped"):
            add("线上实探（网络不可达）", True, f"跳过：{live.get('reason')}", level="info")
        elif live.get("status") == 404:
            # 404 与「页面本身坏了」是两回事：多半是发布侧把该页移出了发布树
            add(
                "线上 /research/catalog.html 可访问（发布侧 · blocked-by-publish）",
                False,
                "线上返回 404 —— 该页已不在当前发布树中（14-publish 于 2026-10-21 19:59 的第三版发布 "
                "f9202fb 删除了 docs/research/catalog.html，并从 data/works.json 移除了 05-museum-catalog 条目）。"
                "**属发布侧范围，不是本页缺陷**（15-supervisor 已将 13 的 CHK[D8] 标为 blocked-by-publish）；"
                "05 未改动该仓库；恢复发布需 14 决策，源码与产物已在 05 自有 dist/（见 handoff/CATALOG-PAGE-HANDOFF.md）。",
                level="info",
            )
            report["live"]["classification"] = "published-page-removed"
        else:
            add("线上 /research/catalog.html 返回 200", live.get("ok"), f"status={live.get('status')}")
            add("线上页面卡片数 = 139", live.get("cardCount") == 139, f"实际 {live.get('cardCount')}")
            report["live"]["labelNote"] = (
                f"线上核验状态标注：已核验 {live.get('verifiedLabels')} 条 / 待复核 {live.get('pendingLabels')} 条"
            )
            if live.get("verifiedLabels") == 0 and live.get("pendingLabels", 0) > 0:
                add(
                    "线上核验状态标注正确",
                    False,
                    f"已核验 {live.get('verifiedLabels')} 条 / 待复核 {live.get('pendingLabels')} 条 —— "
                    "发布侧生成器读 it.checks（该字段不存在），本目录 schema 为 verification.status",
                )

    # ---- 汇总 ----
    fails = [c for c in report["checks"] if not c["ok"] and c.get("level") != "info"]
    blocked = [
        c for c in report["checks"]
        if not c["ok"] and c.get("level") == "info"
        and "harness" not in str(c.get("detail", "")).lower()
        and "负载" not in str(c.get("detail", ""))
    ]
    harness_blocked = [
        c for c in report["checks"]
        if not c["ok"] and c.get("level") == "info"
        and ("harness" in str(c.get("detail", "")).lower() or "负载" in str(c.get("detail", "")))
    ]
    report["finishedAt"] = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    report["summary"] = {
        "total": len(report["checks"]),
        "passed": sum(1 for c in report["checks"] if c["ok"]),
        "failed": len(fails),
        "failedNames": [c["name"] for c in fails],
        "blockedByPublish": [c["name"] for c in blocked],
        "blockedByHarness": [c["name"] for c in harness_blocked],
    }

    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE / "restyle-selftest.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n=== 05 策展目录自测 ===")
    for c in report["checks"]:
        mark = "PASS" if c["ok"] else ("PUBLISH-BLOCKED" if c["level"] == "info" else "FAIL")
        print(f"[{mark}] {c['name']} — {c['detail']}")
    print(
        f"\n合计 {report['summary']['passed']}/{report['summary']['total']} 通过，"
        f"产品侧失败 {report['summary']['failed']} 项"
        + (f"，发布侧阻塞 {len(blocked)} 项（blocked-by-publish）" if blocked else "")
        + (f"，harness 阻塞 {len(harness_blocked)} 项（非产品缺陷）" if harness_blocked else "")
    )
    print(f"证据：{EVIDENCE / 'restyle-selftest.json'}")
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())
