#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
05 策展目录页 · 动效时长 / 命名空间专项审计
归属：05-museum-research · scripts/ds_duration_audit.py

起因：16-design-system 告知「只剩一处要修：`--ds-dur-*: 1ms` 被写死在 `:root`」。
本脚本把该疑问做成可复现、可被 13/14 复验的证据，而不是口头结论。

审计项：
  A.1 三份 tokens.css（16 原件 / 05 src 副本 / 05 dist 副本）SHA-256 逐字节一致
  A.2 三份文件 `:root` 内 --ds-dur-* / --ds-entry-duration 取值 == 16 design-tokens.json 规范值
  A.3 三份文件 `@media (prefers-reduced-motion: reduce)` 内同族变量 == 1ms（规范要求的降级位置）
  A.4 三份文件中 1ms 只出现在降级上下文（media query / [data-rm="reduce"]），`:root` 内 0 处
  A.5 05 自有 CSS（src + dist）无任何硬编码 1ms
  A.6 05 自有 CSS 不声明任何 --ds-dur-* 变量（不写死时长）
  A.7 05 自有 CSS 声明的 --ds-* 变量清单（预期仅 .ds-shell 内 2 条字体族顺序覆写，已在 §11.3 声明）
  A.8 05 自有 CSS 的 transition/animation 不含硬编码时长，一律走 var(--ds-dur-*)
  A.9 dist/catalog.html 已注入 --ds-base 且 <body class="ds-shell">
  A.10 字体栈顺序合规（16 DESIGN-SPEC §2.5 / MIGRATION-NOTES §9 V.11）
  A.11 05 自有 CSS 的 font-family 只引用 var(--ds-font-*)，不自造字体栈
  A.12 CSS 的 --ds-font-display/text 与 design-tokens.json 逐项相等（无规范漂移）
  A.13 DS 资产全量逐字节一致（src 副本 + dist 产物 vs 16 原件，防副本漂移）

用法：python3 scripts/ds_duration_audit.py
产物：evidence/ds-duration-audit.json
退出码：0 = 全部通过；1 = 有失败项
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARENT = ROOT.parent
DS = PARENT / "16-design-system"
EVIDENCE = ROOT / "evidence"

TOKENS_COPIES = [
    ("16-原件(只读)", DS / "src" / "tokens.css"),
    ("05-src副本", ROOT / "src" / "catalog-page" / "assets" / "ds" / "tokens.css"),
    ("05-dist副本", ROOT / "dist" / "assets" / "ds" / "tokens.css"),
]

OWN_CSS = [
    ("05-src/catalog.css", ROOT / "src" / "catalog-page" / "catalog.css"),
    ("05-dist/catalog.css", ROOT / "dist" / "catalog.css"),
]

DUR_VARS = [
    "--ds-dur-instant",
    "--ds-dur-fast",
    "--ds-dur-base",
    "--ds-dur-slow",
    "--ds-dur-reveal",
    "--ds-entry-duration",
]

COMMENT_RE = re.compile(r"/\*.*?\*/", re.S)
DECL_RE = re.compile(r"(--ds-[a-z0-9-]+)\s*:\s*([^;]+);")
MOTION_CTX = ("prefers-reduced-motion", 'data-rm="reduce"', "data-rm='reduce'")


def strip_comments(css: str) -> str:
    return COMMENT_RE.sub("", css)


def iter_blocks(css: str):
    """产出 (选择器链, 声明列表)。

    声明按分号切分，因此跨行的值（如 font-family 多行字体栈）也能被完整识别。
    链包含外层 @media/@supports，便于判断降级上下文。
    """
    css = strip_comments(css)
    stack: list[str] = []
    buf: list[str] = []
    for raw in css.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.endswith("{"):
            stack.append(line[:-1].strip())
            buf = []
            continue
        if line == "}":
            chain = " ".join(stack)
            if stack:
                stack.pop()
            yield chain, split_decls(buf)
            buf = []
            continue
        if stack:
            buf.append(line)
    if stack:
        yield " ".join(stack), split_decls(buf)


def split_decls(lines: list[str]) -> list[str]:
    """把一个块内的若干行拼成完整声明列表（以分号结尾）。"""
    text = " ".join(lines)
    out = []
    for part in text.split(";"):
        part = part.strip()
        if part:
            out.append(part + ";")
    return out


def root_vars(css: str, selector_pred) -> dict:
    out: dict[str, str] = {}
    for chain, decls in iter_blocks(css):
        if not selector_pred(chain):
            continue
        for d in decls:
            m = DECL_RE.search(d)
            if m:
                out[m.group(1)] = m.group(2).strip()
    return out


def is_root(chain: str) -> bool:
    parts = [p.strip() for p in chain.split() if p.strip()]
    return bool(parts) and parts[-1] == ":root"


def is_reduced(chain: str) -> bool:
    return any(tok in chain for tok in MOTION_CTX)


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main() -> int:
    results: list[dict] = []

    def check(cid: str, name: str, ok: bool, detail: str, extra: dict | None = None) -> None:
        results.append(
            {"id": cid, "name": name, "pass": bool(ok), "detail": detail, **(extra or {})}
        )

    # ---------- 规范值（来自 16 design-tokens.json，只读） ----------
    spec_json = json.loads((DS / "design-tokens.json").read_text(encoding="utf-8"))
    motion = spec_json.get("motion", {})
    expected = {
        "--ds-dur-instant": motion["duration"]["instant"]["$value"],
        "--ds-dur-fast": motion["duration"]["fast"]["$value"],
        "--ds-dur-base": motion["duration"]["base"]["$value"],
        "--ds-dur-slow": motion["duration"]["slow"]["$value"],
        "--ds-dur-reveal": motion["duration"]["reveal"]["$value"],
        "--ds-entry-duration": motion["entry"]["duration"]["$value"],
    }
    reduced_spec = motion["reducedMotion"]["maxDuration"]["$value"]

    # ---------- A.1 三份副本一致 ----------
    hashes = {label: sha256(p) for label, p in TOKENS_COPIES if p.exists()}
    missing = [label for label, p in TOKENS_COPIES if not p.exists()]
    uniq = set(hashes.values())
    check(
        "A.1",
        "三份 tokens.css 逐字节一致",
        (not missing) and len(uniq) == 1,
        f"缺失={missing or '无'}；唯一哈希数={len(uniq)}",
        {"sha256": hashes},
    )

    # ---------- A.2 / A.3 / A.4 逐文件核对 ----------
    per_file = []
    for label, path in TOKENS_COPIES:
        if not path.exists():
            continue
        css = path.read_text(encoding="utf-8")
        root_vals = {v: root_vars(css, is_root).get(v) for v in DUR_VARS}
        # :root 内取值（排除 @media 内同名块：后者选择器链含 @media）
        rv: dict[str, str] = {}
        for chain, decls in iter_blocks(css):
            if is_root(chain) and not is_reduced(chain):
                for d in decls:
                    m = DECL_RE.search(d)
                    if m and m.group(1) in DUR_VARS:
                        rv[m.group(1)] = m.group(2).strip()
        red: dict[str, str] = {}
        for chain, decls in iter_blocks(css):
            if is_root(chain) and is_reduced(chain):
                for d in decls:
                    m = DECL_RE.search(d)
                    if m and m.group(1) in DUR_VARS:
                        red[m.group(1)] = m.group(2).strip()

        # 1ms 出现位置统计
        ms_outside = []
        for chain, decls in iter_blocks(css):
            if is_reduced(chain):
                continue
            for d in decls:
                if "1ms" in d:
                    ms_outside.append({"chain": chain, "decl": d.strip()})

        per_file.append(
            {
                "file": label,
                "path": str(path.relative_to(PARENT)),
                "rootDurations": rv,
                "reducedMotionDurations": red,
                "oneMsOutsideReducedMotion": ms_outside,
                "rootMatchesSpec": rv == expected,
                "reducedMatchesSpec": red
                == {v: reduced_spec for v in DUR_VARS},
            }
        )

    check(
        "A.2",
        ":root 取值 == 16 规范值",
        all(f["rootMatchesSpec"] for f in per_file) and len(per_file) == 3,
        f"规范值={json.dumps(expected, ensure_ascii=False)}；"
        + "；".join(f"{f['file']}={json.dumps(f['rootDurations'], ensure_ascii=False)}" for f in per_file),
        {"expected": expected, "actual": {f["file"]: f["rootDurations"] for f in per_file}},
    )
    check(
        "A.3",
        "降级上下文取值 == 1ms（规范位置）",
        all(f["reducedMatchesSpec"] for f in per_file) and len(per_file) == 3,
        f"期望={reduced_spec}；"
        + "；".join(f"{f['file']}={json.dumps(f['reducedMotionDurations'], ensure_ascii=False)}" for f in per_file),
        {"expected": reduced_spec},
    )
    check(
        "A.4",
        "1ms 仅出现在降级上下文（:root 内 0 处）",
        all(not f["oneMsOutsideReducedMotion"] for f in per_file) and len(per_file) == 3,
        "；".join(
            f"{f['file']}: 降级外 1ms 出现 {len(f['oneMsOutsideReducedMotion'])} 次" for f in per_file
        )
        + f"；16 原件行号参考 tokens.css:335-340 属 @media (prefers-reduced-motion: reduce)",
        {"detailPerFile": {f["file"]: f["oneMsOutsideReducedMotion"] for f in per_file}},
    )

    # ---------- 05 自有 CSS ----------
    own_declared: dict[str, list[str]] = {}
    own_hardcoded_ms: dict[str, list[str]] = {}
    own_dur_decl: dict[str, list[str]] = {}
    own_hard_transition: dict[str, list[str]] = {}

    for label, path in OWN_CSS:
        if not path.exists():
            continue
        css = path.read_text(encoding="utf-8")
        ms_all: list[str] = []
        dur_all: list[str] = []
        trans_all: list[str] = []
        file_declared: dict[str, list[str]] = {}
        for chain, decls in iter_blocks(css):
            for d in decls:
                if "1ms" in d:
                    ms_all.append(f"{chain} {{ {d} }}")
                m = DECL_RE.search(d)
                if m:
                    name = m.group(1)
                    if name.startswith("--ds-dur-") or name == "--ds-entry-duration":
                        dur_all.append(f"{chain} {{ {d} }}")
                    if name.startswith("--ds-"):
                        file_declared.setdefault(name, []).append(f"{label} :: {chain} {{ {d} }}")
                if re.match(r"(transition|animation)\b", d.strip()) and re.search(r"\d+ms", d):
                    trans_all.append(f"{chain} {{ {d} }}")
        own_hardcoded_ms[label] = ms_all
        own_dur_decl[label] = dur_all
        own_hard_transition[label] = trans_all
        for k, v in file_declared.items():
            own_declared.setdefault(k, []).extend(v)

    declared_keys = sorted(own_declared.keys())
    check(
        "A.5",
        "05 自有 CSS 无硬编码 1ms",
        all(not v for v in own_hardcoded_ms.values()),
        "；".join(f"{k}: {len(v)} 处" for k, v in own_hardcoded_ms.items()),
        {"detail": own_hardcoded_ms},
    )
    check(
        "A.6",
        "05 自有 CSS 不声明 --ds-dur-* / --ds-entry-duration",
        all(not v for v in own_dur_decl.values()),
        "；".join(f"{k}: {len(v)} 处" for k, v in own_dur_decl.items()),
        {"detail": own_dur_decl},
    )
    # 16 的 MIGRATION-NOTES §0 风险 A：自有变量必须全部非 --ds- 前缀，避免命名空间冲突复发。
    # 2026-10-21 16 上游修正字体栈顺序后，05 已删除本地 --ds-font-* 覆写 → 期望 0 个。
    check(
        "A.7",
        "05 自有 CSS 不声明任何 --ds-* 变量（命名空间零冲突）",
        declared_keys == [],
        f"实际声明={declared_keys or '（0 个）'}；期望 0 个"
        "（16 已于 22:25 上游修正字体栈顺序，本页不再需要覆写 --ds-font-display / --ds-font-text）",
        {"declared": own_declared},
    )
    check(
        "A.8",
        "05 自有 CSS 的 transition/animation 不含硬编码时长",
        all(not v for v in own_hard_transition.values()),
        "；".join(f"{k}: {len(v)} 处" for k, v in own_hard_transition.items()),
        {"detail": own_hard_transition},
    )

    # ---------- A.9 入口注入 ----------
    html = ROOT / "dist" / "catalog.html"
    html_txt = html.read_text(encoding="utf-8") if html.exists() else ""
    has_base = bool(re.search(r"--ds-base\s*:\s*[\"']?/playtime-atlas-20261021/", html_txt))
    has_shell = 'class="ds-shell"' in html_txt or "ds-shell" in html_txt
    check(
        "A.9",
        "入口已注入 --ds-base 且 body 带 ds-shell",
        has_base and has_shell,
        f"--ds-base={has_base}；ds-shell={has_shell}",
    )

    # ---------- A.10 字体栈顺序合规（16 DESIGN-SPEC §2.5 / MIGRATION-NOTES §9 V.11） ----------
    # 规则：覆盖完整的系统 CJK 族必须排在覆盖有限的子集之前；且不得删掉子集。
    SYSTEM_CJK = ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC"]
    SUBSET = "Noto Sans SC"
    font_issues: list[str] = []
    font_detail: dict = {}
    for label, path in TOKENS_COPIES:
        if not path.exists():
            continue
        css = path.read_text(encoding="utf-8")
        vals: dict[str, str] = {}
        for chain, decls in iter_blocks(css):
            if is_root(chain) and not is_reduced(chain):
                for d in decls:
                    m = DECL_RE.search(d)
                    if m and m.group(1) in ("--ds-font-display", "--ds-font-text"):
                        vals[m.group(1)] = m.group(2)
        for var, raw in vals.items():
            fams = [f.strip().strip("\"'") for f in raw.replace("\n", " ").split(",") if f.strip()]
            if SUBSET not in fams:
                font_issues.append(f"{label} {var}: 缺少 {SUBSET} 子集（16 明令不得用删子集替代调序）")
                continue
            si = fams.index(SUBSET)
            late = [f for f in SYSTEM_CJK if f in fams and fams.index(f) > si]
            if late:
                font_issues.append(f"{label} {var}: 系统 CJK 族 {late} 排在 {SUBSET} 之后")
            font_detail.setdefault(label, {})[var] = {
                "stack": fams,
                "subsetIndex": si,
                "systemCjkBeforeSubset": [f for f in SYSTEM_CJK if f in fams and fams.index(f) < si],
                "systemCjkMissing": [f for f in SYSTEM_CJK if f not in fams],
            }
    check(
        "A.10",
        "字体栈顺序合规：系统 CJK 族全部排在 Noto Sans SC 子集之前，且子集未被删除",
        not font_issues,
        "；".join(font_issues)
        or "三份文件全部合规：拉丁自托管 → 覆盖完整的系统 CJK 栈 → Noto Sans SC 子集 → 通用 sans-serif",
        {"detail": font_detail, "issues": font_issues},
    )

    # ---------- A.11 05 自有 CSS 不自造字体栈 ----------
    GENERIC = {
        "serif", "sans-serif", "monospace", "system-ui", "ui-monospace",
        "ui-serif", "ui-sans-serif", "cursive", "fantasy", "inherit",
    }
    font_decls: list[str] = []
    font_bad: list[str] = []
    for label, path in OWN_CSS:
        if not path.exists():
            continue
        css = path.read_text(encoding="utf-8")
        for chain, decls in iter_blocks(css):
            for d in decls:
                if re.match(r"font-family\s*:", d.strip()):
                    val = d.split(":", 1)[1]
                    font_decls.append(f"{label} :: {chain} {{ {d.strip()} }}")
                    if "var(--ds-font-" in val:
                        continue
                    fams = [f.strip().strip("\"'").lower() for f in val.split(",") if f.strip()]
                    if not all(f in GENERIC for f in fams):
                        font_bad.append(f"{label} :: {chain} {{ {d.strip()} }}")
    check(
        "A.11",
        "05 自有 CSS 的 font-family 只引用 var(--ds-font-*)，不自造字体栈",
        not font_bad,
        f"font-family 声明 {len(font_decls)} 处，全部走令牌"
        if not font_bad
        else "；".join(font_bad),
        {"declarations": font_decls, "violations": font_bad},
    )

    # ---------- A.12 CSS 实现与 design-tokens.json 规范逐项相等（防规范漂移） ----------
    spec_typo = spec_json.get("typography", {}).get("family", {})
    spec_stacks = {}
    for var, key in (("--ds-font-display", "display"), ("--ds-font-text", "text")):
        raw = spec_typo.get(key, {}).get("$value", "") if isinstance(spec_typo.get(key), dict) else spec_typo.get(key, "")
        spec_stacks[var] = [f.strip().strip("\"'") for f in str(raw).split(",") if f.strip()]
    drift: list[str] = []
    drift_detail: dict = {}
    for label, path in TOKENS_COPIES:
        if not path.exists():
            continue
        css = path.read_text(encoding="utf-8")
        for chain, decls in iter_blocks(css):
            if is_root(chain) and not is_reduced(chain):
                for d in decls:
                    m = DECL_RE.search(d)
                    if m and m.group(1) in spec_stacks:
                        var = m.group(1)
                        css_stack = [f.strip().strip("\"'") for f in m.group(2).replace("\n", " ").split(",") if f.strip()]
                        drift_detail.setdefault(label, {})[var] = {
                            "css": css_stack, "spec": spec_stacks[var], "equal": css_stack == spec_stacks[var],
                        }
                        if css_stack != spec_stacks[var]:
                            drift.append(f"{label} {var}: CSS ≠ design-tokens.json")
    check(
        "A.12",
        "CSS 的 --ds-font-display/text 与 design-tokens.json 逐项相等（无规范漂移）",
        not drift,
        "；".join(drift) or "三份文件的显示体/正文体字体栈与规范逐项相等（顺序亦一致）",
        {"detail": drift_detail, "issues": drift},
    )

    # ---------- A.13 DS 资产全量逐字节一致（防副本漂移） ----------
    # 起因：15-supervisor 独立复核时发现 05 的 fonts/FONT-MANIFEST.json 比 16 原件旧
    #（16 于 22:49 补入 coverageEvidence / subsetCoverageRatio / subsetCoverageBasis），
    # 而此前的 A.1 只校验 tokens.css，漏掉了这一类漂移。
    # 判据：05 分发的全部 DS 资产（tokens.css / components.css / fonts/**）与 16 原件逐字节一致。
    ASSET_PAIRS = [
        ("src/tokens.css", "tokens.css"),
        ("src/components.css", "components.css"),
    ]
    asset_issues: list[str] = []
    asset_detail: dict = {}
    ds_fonts_dir = DS / "fonts"
    if ds_fonts_dir.is_dir():
        for name in sorted(os.listdir(ds_fonts_dir)):
            ASSET_PAIRS.append((f"fonts/{name}", f"fonts/{name}"))
    for src_rel, dst_rel in ASSET_PAIRS:
        origin = DS / src_rel
        copy = ROOT / "src" / "catalog-page" / "assets" / "ds" / dst_rel
        dist_copy = ROOT / "dist" / "assets" / "ds" / dst_rel
        if not origin.exists() or not copy.exists():
            asset_issues.append(f"{dst_rel}: 缺失")
            continue
        ho = hashlib.sha256(origin.read_bytes()).hexdigest()
        hc = hashlib.sha256(copy.read_bytes()).hexdigest()
        entry = {"origin": ho[:16], "copy": hc[:16], "equal": ho == hc}
        if dist_copy.exists():
            hd = hashlib.sha256(dist_copy.read_bytes()).hexdigest()
            entry["dist"] = hd[:16]
            entry["distEqual"] = hd == ho
            if hd != ho:
                asset_issues.append(f"{dst_rel}: dist 副本与 16 原件不一致")
        else:
            entry["dist"] = None
            entry["distEqual"] = False
        asset_detail[dst_rel] = entry
        if ho != hc:
            asset_issues.append(f"{dst_rel}: src 副本与 16 原件不一致（16={ho[:12]} 05={hc[:12]}）")
    check(
        "A.13",
        "DS 资产全量逐字节一致（src 副本 + dist 产物 vs 16 原件）",
        not asset_issues,
        "；".join(asset_issues)
        or f"{len(asset_detail)} 个资产文件全部一致（tokens.css / components.css / fonts/** 共 {len(asset_detail)} 个）",
        {"detail": asset_detail, "issues": asset_issues},
    )

    passed = sum(1 for r in results if r["pass"])
    report = {
        "target": "05-museum-research 目录页 · 动效时长与命名空间审计",
        "generatedAt": "2026-10-21",
        "reason": "回应 16-design-system『--ds-dur-*: 1ms 被写死在 :root』的核对请求",
        "specSource": "16-design-system/design-tokens.json (只读)",
        "expectedDurations": expected,
        "expectedReducedMotion": reduced_spec,
        "files": per_file,
        "ownCss": {
            "declaredDsVars": own_declared,
            "hardcoded1ms": own_hardcoded_ms,
            "declaredDurVars": own_dur_decl,
            "hardcodedTransitionDurations": own_hard_transition,
        },
        "checks": results,
        "summary": {"passed": passed, "total": len(results), "failed": len(results) - passed},
        "verdict": "PASS" if passed == len(results) else "FAIL",
    }

    EVIDENCE.mkdir(parents=True, exist_ok=True)
    out = EVIDENCE / "ds-duration-audit.json"
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    for r in results:
        print(f"  {'✓' if r['pass'] else '✗'} {r['id']} {r['name']}")
        print(f"      {r['detail']}")
    print(f"\n{'✅' if passed == len(results) else '❌'} ds-duration-audit: {report['verdict']}")
    print(f"   {passed}/{len(results)} 通过 | 产物 {out.relative_to(ROOT)}")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
