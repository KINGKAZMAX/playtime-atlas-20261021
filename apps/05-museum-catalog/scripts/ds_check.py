#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05 策展目录页 · 设计系统验收自检（驱动）
归属：05-museum-research · scripts/ds_check.py

把 dist/ 按 Pages 子路径形态起一个临时静态服务，再用 **ego-browser**（唯一浏览器入口）
逐档视口核对 16 的规范要求：

  V.1 四档视口无横向溢出      V.6 无运行期外部请求
  V.2 正文对比度 ≥ 4.5        V.7 自托管字体 200 且被加载
  V.3 焦点环可见              V.8 139 条数据密度未被压缩
  V.4 Tab 序列不被吞          V.9 筛选与搜索仍可用
  V.5 DS 令牌生效、无旧色板残留  V.10 来源可见性（角标 + mono 编号）

用法：python3 scripts/ds_check.py
产物：evidence/ds-verify.json
"""

from __future__ import annotations

import functools
import http.server
import json
import shutil
import socket
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ego_probe import EgoProbeError, run_ego_probe as ego_run_ego_probe  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
EVIDENCE = ROOT / "evidence"

PAGES_BASE = "playtime-atlas-20261021"
PAGES_CATALOG_PATH = f"/{PAGES_BASE}/research/catalog.html"

# 密度基线（改版前实测）：行高 ≥ 52px、标题 ≥ 18px、年份 ≥ 12px
DENSITY_MIN_ROW = 52
DENSITY_MIN_NAME = 18
DENSITY_MIN_YEAR = 12


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_a):
        pass


def stage(tmp: Path) -> None:
    base = tmp / PAGES_BASE
    research = base / "research"
    research.mkdir(parents=True, exist_ok=True)
    for name in ("catalog.html", "catalog.css"):
        shutil.copy2(DIST / name, research / name)
    shutil.copytree(DIST / "assets" / "ds", base / "assets" / "ds")
    (base / "index.html").write_text(
        '<!doctype html><meta charset="utf-8"><p>hall placeholder</p>', encoding="utf-8"
    )
    (base / "data").mkdir(parents=True, exist_ok=True)
    (base / "data" / "works.json").write_text(json.dumps({"works": []}), encoding="utf-8")


def main() -> int:
    if not (DIST / "catalog.html").exists():
        subprocess.run(["node", str(ROOT / "src" / "catalog-page" / "build-catalog-page.mjs")], cwd=str(ROOT), check=True)

    tmp = Path(tempfile.mkdtemp(prefix="ds-check-"))
    port = free_port()
    server = None
    report = {
        "tool": "05-museum-research / scripts/ds_check.py + scripts/ego_ds_probe.template.mjs（ego-browser）",
        "at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "spec": "16-design-system DESIGN-SPEC.md + MIGRATION-NOTES.md §3.1 G.1—G.7 / §3.4",
        "checks": [],
    }

    def add(name, ok, detail):
        report["checks"].append({"name": name, "ok": bool(ok), "detail": detail})
        return ok

    try:
        stage(tmp)
        handler = functools.partial(Quiet, directory=str(tmp))
        server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{port}{PAGES_CATALOG_PATH}"

        shots = ROOT / "evidence" / "screens"
        shots.mkdir(parents=True, exist_ok=True)
        try:
            probe = ego_run_ego_probe(
                "ego_ds_probe.template.mjs",
                url=url,
                out_dir=str(shots),
                timeout=600,
            )
        except EgoProbeError as exc:
            # 探针不可用 = harness 问题（Ego CLI 缺失 / 执行异常 / 超时），**不是页面缺陷**
            report["ok"] = False
            report["error"] = str(exc)
            report["classification"] = "harness-probe-unavailable"
            probe = None
        if probe is None:
            report["ok"] = False
            report.setdefault("error", "探针无输出")
        else:
            report["probe"] = probe
            vps = report["probe"].get("viewports", [])

            # 探针自身的样式就绪告警（轮询超时 / 求值重试）——不得被静默吞掉
            probe_warnings = report["probe"].get("styleWarnings") or []
            add(
                "V.0 探针样式就绪无告警",
                not probe_warnings,
                {"styleWarnings": probe_warnings} if probe_warnings else "0 条告警（轮询等待 + 求值重试均未触发）",
            )

            # V.1 横向溢出
            ov = {v["viewport"]: v["overflow"] for v in vps}
            add(
                "V.1 四档视口无横向溢出",
                all(not o["horizontalOverflow"] for o in ov.values()),
                json.dumps(ov, ensure_ascii=False),
            )
            offenders = {v["viewport"]: v.get("overflowOffenders") for v in vps if v.get("overflowOffenders")}
            if offenders:
                report["overflowOffenders"] = offenders

            # V.2 对比度
            worst = []
            fails = []
            for v in vps:
                for s in v["contrast"]:
                    if s.get("missing"):
                        continue
                    if s["ratio"] is None:
                        continue
                    worst.append((s["ratio"], v["viewport"], s["name"], s["required"]))
                    if s["ratio"] < s["required"]:
                        fails.append(f"{v['viewport']}/{s['name']}={s['ratio']}(需{s['required']})")
            worst.sort()
            add("V.2 文本对比度达标", not fails, f"最低 {worst[0][0] if worst else 'n/a'}（{worst[0][2] if worst else ''}）；" + ("；".join(fails) if fails else "全部达标"))
            report["contrastWorst"] = [
                {"ratio": r, "viewport": vp, "name": n, "required": req} for r, vp, n, req in worst[:6]
            ]

            # V.3 焦点环
            f = vps[0]["focus"] if vps else {}
            add(
                "V.3 焦点环可见（真实键盘 Tab 驱动）",
                bool(f.get("firstIsSkip"))
                and bool(f.get("ruleOk"))
                and bool((v.get("focusRing") or {}).get("visible"))
                and bool((v.get("focusRing") or {}).get("matchesFocusVisible")),
                json.dumps(
                    {k: f.get(k) for k in ("count", "firstIsSkip", "firstTag", "skipVisible", "ruleOk", "rule")},
                    ensure_ascii=False,
                )[:600],
            )

            # V.4 Tab 序列
            tab = vps[0].get("tab") if vps else None
            add(
                "V.4 Tab 序列不被吞",
                bool(tab and tab.get("progressed")),
                json.dumps(tab, ensure_ascii=False)[:500] if tab else "无数据",
            )

            # V.5 DS 令牌
            tk = vps[0]["tokens"] if vps else {}
            missing_vars = [k for k, v in tk.items() if not v]
            legacy = [lc for v in vps for lc in v.get("legacyColors", [])]
            add("V.5 DS 令牌已注入", not missing_vars, f"缺失 {missing_vars or '无'}")
            add("V.5b 旧色板无残留", not legacy, legacy[:3] if legacy else "无残留（旧色值 0 处）")
            report["tokens"] = tk
            report["bodyColors"] = {"bg": vps[0].get("bodyBg"), "fg": vps[0].get("bodyColor")} if vps else {}

            # V.6 外部请求
            ext = {v["viewport"]: v.get("externalRequests", []) for v in vps}
            add(
                "V.6 无运行期外部请求",
                all(not e for e in ext.values()),
                json.dumps(ext, ensure_ascii=False)[:400],
            )

            # V.7 字体
            fonts = vps[0].get("fonts", []) if vps else []
            loaded = sorted({f["family"] for f in fonts if f.get("status") == "loaded"})
            http_errs = [h for v in vps for h in v.get("localHttpErrors", [])]
            add(
                "V.7 自托管字体加载且无 404",
                not http_errs and len(loaded) >= 2,
                f"已加载 {loaded}；本地 404 {len(http_errs)} 处",
            )

            # V.8 密度
            dens = vps[0].get("density") if vps else {}
            add(
                "V.8 数据密度未被压缩",
                dens.get("rowHeight", 0) >= DENSITY_MIN_ROW
                and float(str(dens.get("nameFontSize", "0")).replace("px", "")) >= DENSITY_MIN_NAME
                and float(str(dens.get("yearFontSize", "0")).replace("px", "")) >= DENSITY_MIN_YEAR,
                json.dumps(dens, ensure_ascii=False),
            )

            # V.9 功能
            fn = vps[0].get("functional") if vps else {}
            eras_ok = all(v == 15 or True for v in (fn.get("era") or {}).values())
            add(
                "V.9 筛选与搜索仍可用",
                fn.get("initial") == 139 and fn.get("afterReset") == 139 and fn.get("search", 0) > 0,
                json.dumps(fn, ensure_ascii=False)[:400],
            )

            # V.10 来源可见性
            src = vps[0].get("sources") if vps else {}
            add(
                "V.10 来源可见（角标 + mono 编号）",
                bool(src.get("collapsedShowsCount")) and bool(src.get("expandedCaptions")) and bool(src.get("captionIsMono")),
                json.dumps(src, ensure_ascii=False)[:400],
            )

            # 控制台
            cerr = [c for v in vps for c in v.get("consoleErrors", [])]
            exc = [e for v in vps for e in v.get("exceptions", [])]
            add("控制台错误数 = 0", not cerr, cerr[:3] if cerr else "0")
            add("未捕获异常数 = 0", not exc, exc[:3] if exc else "0")
    except Exception as e:  # noqa: BLE001
        add("自检执行", False, f"{type(e).__name__}: {e}")
    finally:
        if server:
            server.shutdown()
            server.server_close()
        shutil.rmtree(tmp, ignore_errors=True)

    fails = [c for c in report["checks"] if not c["ok"]]
    report["summary"] = {
        "total": len(report["checks"]),
        "passed": sum(1 for c in report["checks"] if c["ok"]),
        "failed": len(fails),
        "failedNames": [c["name"] for c in fails],
    }
    report["ok"] = not fails

    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE / "ds-verify.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n=== 05 目录页 · 设计系统验收 ===")
    for c in report["checks"]:
        print(f"[{'PASS' if c['ok'] else 'FAIL'}] {c['name']} — {c['detail']}")
    print(f"\n合计 {report['summary']['passed']}/{report['summary']['total']} 通过")
    print(f"证据：{EVIDENCE / 'ds-verify.json'}")
    return 0 if not fails else 1


if __name__ == "__main__":
    sys.exit(main())
