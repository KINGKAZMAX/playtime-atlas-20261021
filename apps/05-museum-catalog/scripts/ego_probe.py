#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05 · ego-browser 探针调用器
归属：05-museum-research · scripts/ego_probe.py

依用户 2026-10-22 的长期约定：**Ego 浏览器是唯一浏览器入口**，
禁止另起 Playwright / Chromium / Chrome 或任何其他浏览器路径。
本模块把「渲染模板 → 交给 ego-browser 执行 → 回收一行 JSON」封装起来，
供 `ds_check.py` 与 `restyle_selftest.py` 复用。

之所以用模板 + 渲染：`ego-browser nodejs` 的脚本进程**不继承 shell 环境变量**，
也没有把位置参数透传给脚本的机制，所以 URL / 输出目录 / 搜索词等必须写进脚本本体。

用法（库）：
    from ego_probe import run_ego_probe
    r = run_ego_probe("scripts/ego_ds_probe.template.mjs", url=..., out_dir=...)
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROBE_MODULE = ROOT / "scripts" / "page_probe.mjs"
EGO_BIN = os.environ.get("EGO_BROWSER_BIN") or shutil.which("ego-browser") or "/Users/mekzenx2/.local/bin/ego-browser"

DEFAULT_TIMEOUT = 300


class EgoProbeError(RuntimeError):
    """Ego 探针不可用（CLI 缺失 / 执行异常）——属 harness 问题，不是产品缺陷。"""


def render(template_path: Path, replacements: dict[str, str]) -> str:
    text = template_path.read_text(encoding="utf-8")
    for key, value in replacements.items():
        text = text.replace(key, value)
    if "__" in text and any(k in text for k in ("__URL__", "__OUT_DIR__", "__TERM__", "__SHOT_PATH__", "__PROBE_IMPORT__")):
        raise EgoProbeError(f"模板仍有未替换占位符：{template_path.name}")
    return text


def run_ego_probe(
    template: str,
    *,
    url: str,
    timeout: int = DEFAULT_TIMEOUT,
    out_dir: str | None = None,
    term: str | None = None,
    shot_path: str | None = None,
) -> dict:
    """渲染并执行一个 Ego 探针模板，返回其 stdout 的那一行 JSON。"""
    template_path = ROOT / "scripts" / template
    if not template_path.exists():
        raise EgoProbeError(f"探针模板不存在：{template_path}")
    if not Path(EGO_BIN).exists() and not shutil.which("ego-browser"):
        raise EgoProbeError(f"未找到 ego-browser（{EGO_BIN}）——按约定不得改用其他浏览器路径")

    repl = {
        "__PROBE_IMPORT__": str(PROBE_MODULE),
        "__URL__": url,
        "__OUT_DIR__": out_dir or str(ROOT / "evidence" / "screens"),
        "__TERM__": term or "nintendo",
        "__SHOT_PATH__": shot_path or "",
    }
    script = render(template_path, repl)

    tmp = Path(tempfile.mkdtemp(prefix="ego-probe-")) / "probe.mjs"
    tmp.write_text(script, encoding="utf-8")

    try:
        with tmp.open("rb") as fh:
            proc = subprocess.run(
                [EGO_BIN, "nodejs"],
                stdin=fh,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=str(ROOT),
            )
    except subprocess.TimeoutExpired:
        raise EgoProbeError(
            f"ego-browser 探针超时（{timeout}s）——机器负载导致的 harness 问题，非页面缺陷；请在空闲时复跑"
        ) from None
    finally:
        try:
            tmp.unlink()
        except OSError:
            pass

    # ego-browser nodejs 把脚本的 console.log 送到 **stderr**，stdout 为空 —— 故两处都读
    blob = (proc.stdout or "") + "\n" + (proc.stderr or "")
    candidates = [ln for ln in blob.splitlines() if ln.strip().startswith("{")]
    payload = None
    for ln in reversed(candidates):
        try:
            payload = json.loads(ln)
            break
        except json.JSONDecodeError:
            continue
    if payload is None:
        raise EgoProbeError(
            f"ego-browser 探针无可解析输出（exit={proc.returncode}）：{blob[-800:]}"
        )
    payload["egoExitCode"] = proc.returncode
    payload["egoStderr"] = (proc.stderr or "")[-600:]
    return payload


if __name__ == "__main__":
    import sys

    tpl = sys.argv[1] if len(sys.argv) > 1 else "ego_ds_probe.template.mjs"
    try:
        out = run_ego_probe(tpl, url=sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8731/catalog.html")
    except EgoProbeError as exc:
        print(f"EgoProbeError: {exc}")
        sys.exit(2)
    print(json.dumps({k: v for k, v in out.items() if k not in ("viewports", "result")}, ensure_ascii=False, indent=2)[:1200])
