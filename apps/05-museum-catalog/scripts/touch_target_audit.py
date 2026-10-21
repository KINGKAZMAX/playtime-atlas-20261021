#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05 · 触摸目标审计（WCAG 2.2 SC 2.5.8 AA）
归属：05-museum-research · scripts/touch_target_audit.py

依用户 2026-10-22 长期约定：**Ego 浏览器是唯一浏览器入口**。
本脚本把 dist/ 摆成 Pages 子路径形态起临时静态服务，再用 Ego 打开，
分别测「初始态（全部折叠）」与「展开态（139 张卡全开）」的触摸目标。

为什么需要自有探针（而不是只用批次共享的 tools/ego-qa）：
  共享工具以 `getBoundingClientRect()` 非零作为「可见」判据，而 Chromium 对**折叠的
  `<details>` 内容**（`::details-content` + `content-visibility: hidden`）仍返回
  **未折叠时的固有尺寸**——即「幽灵矩形」。折叠内容里的链接因此被误判成
  「可见且不足 24px」：2026-10-22 02:1x 实测共享工具报 416 个不足，
  而真正被绘制且不足 24px 的目标为 **0 个**。
  本脚本用 `checkVisibility()` 区分两者，并按 2.5.8 的**间距例外**给出最终判定。

用法：
    python3 scripts/touch_target_audit.py
产物：evidence/touch-target-audit.json（+ 终端摘要）
"""

from __future__ import annotations

import functools
import http.server
import json
import shutil
import socket
import sys
import tempfile
import threading
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ego_probe import EgoProbeError, run_ego_probe as ego_run_ego_probe  # noqa: E402
from restyle_selftest import PAGES_BASE, PAGES_CATALOG_PATH, stage_pages_tree  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidence"
TEMPLATE = "ego_touch_target.template.mjs"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):  # noqa: D401 - 静默
        pass


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return int(s.getsockname()[1])


def main() -> int:
    tmp = Path(tempfile.mkdtemp(prefix="playtime-pages-"))
    port = free_port()
    server = None
    try:
        stage_pages_tree(tmp)
        handler = functools.partial(QuietHandler, directory=str(tmp))
        server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()

        url = f"http://127.0.0.1:{port}{PAGES_CATALOG_PATH}"
        print(f"=== 05 触摸目标审计（WCAG 2.2 SC 2.5.8 AA）===")
        print(f"目标：{url}")
        try:
            probe = ego_run_ego_probe(
                TEMPLATE, url=url, out_dir=str(EVIDENCE / "screens" / "touch-target")
            )
        except EgoProbeError as exc:
            print(f"[HARNESS] {exc}")
            EVIDENCE.mkdir(parents=True, exist_ok=True)
            (EVIDENCE / "touch-target-audit.json").write_text(
                json.dumps(
                    {
                        "ok": False,
                        "classification": "harness-timeout",
                        "error": str(exc),
                        "note": "探针不可用属 harness 问题，不计产品失败；请在空闲时复跑",
                    },
                    ensure_ascii=False,
                    indent=2,
                ),
                encoding="utf-8",
            )
            return 2

        if not probe.get("ok"):
            print(f"[FAIL] 探针异常：{probe.get('error')}")
            EVIDENCE.mkdir(parents=True, exist_ok=True)
            (EVIDENCE / "touch-target-audit.json").write_text(
                json.dumps(probe, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            return 1

        failures = 0
        for vp in probe.get("viewports", []):
            closed = vp["closed"]
            opened = vp["opened"]
            print(
                f"\n[{vp['viewport']}] 请求 {vp['width']} / 实测 {vp.get('measuredInnerWidth')}"
                f" / 精确={vp.get('viewportExact')}"
            )
            print(
                f"  初始态（全部折叠）：有尺寸目标 {closed['totalNonZeroRect']} 个"
                f" → 真正绘制 {closed['paintedTargets']}、幽灵矩形 {closed['phantomTargets']}"
                f"；绘制且 <24px：{closed['paintedUndersized']} 个；2.5.8 违例 {closed['spacingExceptionViolations']} 处"
            )
            print(
                f"  展开态（{vp.get('detailsTotal', 139)} 张全开）：绘制目标 {opened['paintedTargets']} 个"
                f"；绘制且 <24px：{opened['paintedUndersized']} 个；2.5.8 违例 {opened['spacingExceptionViolations']} 处"
            )
            if opened["paintedUndersized"]:
                print(f"    展开态不足样本：{json.dumps(opened['paintedUndersizedSamples'], ensure_ascii=False)}")
            if opened["spacingExceptionViolations"]:
                print(f"    违例样本：{json.dumps(opened['violationSamples'], ensure_ascii=False)}")

            # 判定：违例数 > 0 才算产品问题
            if vp.get("viewportExact") is False:
                print("  ✗ 视口精度不达标")
                failures += 1
            if closed["spacingExceptionViolations"] or opened["spacingExceptionViolations"]:
                print("  ✗ WCAG 2.5.8 违例")
                failures += 1
            else:
                note = ""
                if opened["paintedUndersized"] and not opened["spacingExceptionViolations"]:
                    note = f"（展开态 {opened['paintedUndersized']} 个目标 <24px，但间距例外成立 → 合规）"
                print(f"  ✓ WCAG 2.5.8 无违例{note}")

        EVIDENCE.mkdir(parents=True, exist_ok=True)
        out = EVIDENCE / "touch-target-audit.json"
        out.write_text(json.dumps(probe, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\n证据：{out}")
        return 1 if failures else 0
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
