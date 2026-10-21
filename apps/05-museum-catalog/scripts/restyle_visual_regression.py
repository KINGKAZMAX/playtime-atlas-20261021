#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05 策展目录页 · 改版前后对照（回归）

对照两个版本：
  A. 改版前基线 —— 14-publish/release git 历史中该页最后一次上线的版本
                   （commit b007c33，深色墨蓝 + 橙/青）
  B. 改版后       —— 05 自有源码构建产物 dist/（16 设计系统：纸白 + 朱砂）

改版**必然**改变视觉，所以本脚本不判定「像素相同」，而是判定：
  · 结构一致：卡片数、时代/类型筛选命中数、检索命中集合、详情字段行数
  · 功能一致：筛选/搜索行为完全不变
  · 视觉已换：计算样式与像素的差异（报告用，不是判负）
  · 并复核：改版后页面**没有**残留旧色板

用法：python3 scripts/restyle_visual_regression.py
产物：evidence/restyle-visual-diff.json + evidence/screens/{before,after}-1440.png
"""

from __future__ import annotations

import functools
import http.server
import json
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ego_probe import EgoProbeError, run_ego_probe as ego_run_ego_probe  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
ROOTDIR = ROOT.parent
RELEASE = ROOTDIR / "14-publish" / "release"
EVIDENCE = ROOT / "evidence"
SHOTS = EVIDENCE / "screens"

OLD_PALETTE = ["#0a1020", "#ff6a2b", "#4fd6e8", "#dfe4ef", "#97a0b6", "#626c83", "#f3ede1"]


def git_show(rel: str, rev: str) -> str | None:
    if not (RELEASE / ".git").exists():
        return None
    proc = subprocess.run(["git", "-C", str(RELEASE), "show", f"{rev}:{rel}"], capture_output=True, text=True)
    return proc.stdout if proc.returncode == 0 else None


def last_commit_with(rel: str) -> str | None:
    if not (RELEASE / ".git").exists():
        return None
    proc = subprocess.run(
        ["git", "-C", str(RELEASE), "log", "--format=%H", "-n", "30", "--", rel], capture_output=True, text=True
    )
    for rev in [l.strip() for l in (proc.stdout or "").splitlines() if l.strip()]:
        if git_show(rel, rev):
            return rev
    return None


def materialize_published(dst: Path) -> dict:
    src_html = RELEASE / "docs" / "research" / "catalog.html"
    src_css = RELEASE / "docs" / "assets" / "page.css"
    if src_html.exists():
        html, origin = src_html.read_text(encoding="utf-8"), "工作区 docs/research/catalog.html"
        rev = "worktree"
    else:
        rev = last_commit_with("docs/research/catalog.html")
        html = git_show("docs/research/catalog.html", rev) if rev else None
        origin = f"git {rev[:7]}:docs/research/catalog.html" if rev else "取不到"
    if html is None:
        return {"ok": False, "reason": "取不到改版前基线（工作区与 git 历史均无）"}
    if src_css.exists():
        css, css_origin = src_css.read_text(encoding="utf-8"), "工作区 docs/assets/page.css"
    else:
        css_rev = rev or last_commit_with("docs/assets/page.css")
        css = git_show("docs/assets/page.css", css_rev) if css_rev else None
        css_origin = f"git {css_rev[:7]}:docs/assets/page.css" if css_rev else "取不到"
    if css is None:
        return {"ok": False, "reason": "取不到基线共用样式 docs/assets/page.css"}

    (dst / "research").mkdir(parents=True, exist_ok=True)
    (dst / "assets").mkdir(parents=True, exist_ok=True)
    (dst / "research" / "catalog.html").write_text(html, encoding="utf-8")
    (dst / "assets" / "page.css").write_text(css, encoding="utf-8")
    (dst / "index.html").write_text('<!doctype html><meta charset="utf-8"><p>hall placeholder</p>', encoding="utf-8")
    return {"ok": True, "htmlOrigin": origin, "cssOrigin": css_origin}


def materialize_current(dst: Path) -> dict:
    src = ROOT / "dist"
    if not (src / "catalog.html").exists():
        subprocess.run(["node", str(ROOT / "src" / "catalog-page" / "build-catalog-page.mjs")], cwd=str(ROOT), check=True)
    (dst / "research").mkdir(parents=True, exist_ok=True)
    for name in ("catalog.html", "catalog.css"):
        shutil.copy2(src / name, dst / "research" / name)
    shutil.copytree(src / "assets" / "ds", dst / "assets" / "ds")
    (dst / "index.html").write_text('<!doctype html><meta charset="utf-8"><p>hall placeholder</p>', encoding="utf-8")
    return {"ok": True, "htmlOrigin": "05-museum-research/dist/catalog.html（改版后）"}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(root: Path):
    handler = functools.partial(Quiet, directory=str(root))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def probe(url: str, shot: Path | None):
    """跑 Ego 版功能探针（依用户长期约定：Ego 是唯一浏览器入口）。"""
    try:
        return ego_run_ego_probe(
            "ego_selftest.template.mjs",
            url=url,
            timeout=300,
            shot_path=str(shot) if shot else None,
        )
    except EgoProbeError as exc:
        return {"ok": False, "error": str(exc), "harness": True}


def main() -> None:
    SHOTS.mkdir(parents=True, exist_ok=True)
    report = {
        "tool": "05-museum-research / scripts/restyle_visual_regression.py",
        "at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "method": "改版前基线 vs 改版后构建：结构/功能必须一致，视觉差异为预期",
        "checks": [],
    }

    def add(name, ok, detail):
        report["checks"].append({"name": name, "ok": bool(ok), "detail": detail})
        return ok

    tmp = Path(tempfile.mkdtemp(prefix="visual-reg-"))
    pub, cur = tmp / "published", tmp / "current"
    try:
        pub_info = materialize_published(pub)
        cur_info = materialize_current(cur)
        report["baseline"] = pub_info
        report["current"] = cur_info
        if not pub_info.get("ok"):
            report["ok"] = False
            report["reason"] = pub_info.get("reason")
        else:
            s_pub, s_cur = serve(pub), serve(cur)
            try:
                url_pub = f"http://127.0.0.1:{s_pub.server_address[1]}/research/catalog.html"
                url_cur = f"http://127.0.0.1:{s_cur.server_address[1]}/research/catalog.html"
                shot_before = SHOTS / "before-1440.png"
                shot_after = SHOTS / "after-1440.png"
                p_pub = probe(url_pub, shot_before)
                p_cur = probe(url_cur, shot_after)
            finally:
                for s in (s_pub, s_cur):
                    s.shutdown()
                    s.server_close()

            if not (p_pub.get("ok") and p_cur.get("ok")):
                report["ok"] = False
                report["reason"] = "至少一侧探针未成功"
            else:
                a, b = p_pub["result"], p_cur["result"]
                report["structure"] = {
                    "cardCount": [a["cardCount"], b["cardCount"]],
                    "eraVisible": {k: [v.get("visible"), b["era"].get(k, {}).get("visible")] for k, v in a["era"].items()},
                    "kindVisible": {k: [v.get("visible"), b["kind"].get(k, {}).get("visible")] for k, v in a["kind"].items()},
                    "searchVisible": [a["search"]["visible"], b["search"]["visible"]],
                    "searchTitlesEqual": sorted(a["search"]["titles"]) == sorted(b["search"]["titles"]),
                    "detailKvRows": [a.get("detail", {}).get("kvRows"), b.get("detail", {}).get("kvRows")],
                }
                struct = report["structure"]
                struct_ok = (
                    struct["cardCount"][0] == struct["cardCount"][1]
                    and all(x == y for x, y in struct["eraVisible"].values())
                    and all(x == y for x, y in struct["kindVisible"].values())
                    and struct["searchVisible"][0] == struct["searchVisible"][1]
                    and struct["searchTitlesEqual"]
                    and struct["detailKvRows"][0] == struct["detailKvRows"][1]
                )
                add("结构一致（卡片/筛选/检索/详情）", struct_ok, json.dumps(struct, ensure_ascii=False)[:600])

                cp, cc = a.get("computed") or {}, b.get("computed") or {}
                style_rows = {k: {"before": cp.get(k), "after": cc.get(k), "changed": cp.get(k) != cc.get(k)}
                              for k in sorted(set(cp) | set(cc))}
                report["computedStyles"] = style_rows
                changed = [k for k, v in style_rows.items() if v["changed"]]
                add("视觉已按 16 规范更换（预期差异）", bool(changed), f"变化 {len(changed)} 项：{changed[:8]}")

                # 改版后不得残留旧色板
                after_css = (ROOT / "dist" / "catalog.css").read_text(encoding="utf-8")
                ds_css = "\n".join(
                    (ROOT / "dist" / "assets" / "ds" / f).read_text(encoding="utf-8") for f in ("tokens.css", "components.css")
                )
                legacy = [c for c in OLD_PALETTE if c in after_css.lower() or c in ds_css.lower()]
                add("改版后无旧色板残留", not legacy, legacy or "旧色值 0 处")

                # 像素差异（预期存在）
                ba = shot_before.read_bytes() if shot_before.exists() else b""
                bb = shot_after.read_bytes() if shot_after.exists() else b""
                diff = sum(1 for i in range(min(len(ba), len(bb))) if ba[i] != bb[i]) if ba and bb else None
                report["pixels"] = {
                    "beforeBytes": len(ba), "afterBytes": len(bb),
                    "identical": ba == bb, "diffBytes": diff,
                    "note": "改版前（深色墨蓝 + 橙/青）→ 改版后（纸白 + 朱砂），像素**应当**不同",
                }
                add("像素已变化（改版预期）", ba != bb, f"diffBytes={diff}")

                report["ok"] = all(c["ok"] for c in report["checks"])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

    fails = [c for c in report["checks"] if not c["ok"]]
    report["summary"] = {"total": len(report["checks"]), "passed": sum(1 for c in report["checks"] if c["ok"]), "failed": len(fails)}
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE / "restyle-visual-diff.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n=== 05 改版前后对照 ===")
    for c in report["checks"]:
        print(f"[{'PASS' if c['ok'] else 'FAIL'}] {c['name']} — {c['detail']}")
    print(f"\n合计 {report['summary']['passed']}/{report['summary']['total']} 通过")
    print(f"证据：{EVIDENCE / 'restyle-visual-diff.json'}")
    return 0 if not fails else 1


if __name__ == "__main__":
    raise SystemExit(main())
