#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05-museum-research — 参考站截图抓取（**ego-browser 版**）

依用户 2026-10-22 长期约定：**Ego 浏览器是唯一浏览器入口**，
禁止另起 Playwright / Chromium / Chrome 等替代路径 —— 故这里不再 spawn 任何浏览器进程，
改为渲染 scripts/ego_refshots.template.mjs 并交给 `ego-browser nodejs` 执行。

用法：python3 scripts/capture_refs.py
产出：screenshots/<slug>.png + screenshots/INDEX.tsv

截图仅作研究参考存档，不随交付物再分发（各站许可多为 ARR / CC-NC，见 LICENSES.md）。
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from ego_probe import EGO_BIN, EgoProbeError  # noqa: E402

SLUGS = [
    {"slug": "strong-timeline", "url": "https://www.museumofplay.org/video-game-history-timeline/"},
    {"slug": "strong-vghf", "url": "https://www.museumofplay.org/exhibits/world-video-game-hall-of-fame/"},
    {"slug": "strong-online-exhibits", "url": "https://www.museumofplay.org/exhibits/online-exhibits/"},
    {"slug": "nvm-sheffield", "url": "https://thenvm.org/"},
    {"slug": "nvm-usa-exhibits", "url": "https://nvmusa.org/interactive-exhibits"},
    {"slug": "chm-collections", "url": "https://www.computerhistory.org/collections/catalog/"},
    {"slug": "cch-home", "url": "https://computinghistory.org.uk/"},
    {"slug": "klov", "url": "https://www.arcade-museum.com/"},
    {"slug": "ia-software", "url": "https://archive.org/details/software"},
    {"slug": "nvghm", "url": "https://www.videogamehistory.org/"},
    {"slug": "emulation-nation", "url": "https://www.emulatorzone.com/"},
    {"slug": "gac", "url": "https://artsandculture.google.com/"},
]


def main() -> int:
    out = ROOT / "screenshots"
    out.mkdir(parents=True, exist_ok=True)
    template = (ROOT / "scripts" / "ego_refshots.template.mjs").read_text(encoding="utf-8")
    script = template.replace("__OUT_DIR__", str(out)).replace("__SLUGS__", json.dumps(SLUGS, ensure_ascii=False))

    tmp = Path(tempfile.mkdtemp(prefix="ego-refshots-")) / "probe.mjs"
    tmp.write_text(script, encoding="utf-8")
    try:
        with tmp.open("rb") as fh:
            proc = subprocess.run(
                [EGO_BIN, "nodejs"],
                stdin=fh,
                capture_output=True,
                text=True,
                timeout=900,
                cwd=str(ROOT),
            )
    except subprocess.TimeoutExpired:
        print("Ego 截图超时（900s）——机器负载导致的 harness 问题，未完成的部分请复跑", file=sys.stderr)
        return 2
    finally:
        try:
            tmp.unlink()
        except OSError:
            pass

    print(proc.stderr or proc.stdout or "")
    if not (out / "INDEX.tsv").exists():
        print("未生成 INDEX.tsv", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
