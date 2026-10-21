#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
改版准备 · 视觉面清点（RESTYLE-SPEC 第 1 步）

扫 05 自有的 catalog 页样式表，逐条列出：
    文件 · 行号 · 选择器 · 属性 · 旧值 · 当前占位 token 名 · 16 token 候选路径

「16 token 候选路径」用的是**占位命名**（`color.*` / `font.*` / `space.*` / `radius.*` /
`border.width.*` / `motion.*` / `layout.*`），对应 16-design-system/design-tokens.json
定稿后的取值来源。16 尚未产出，键名以 16 为准；本表只固定"每个旧值要落到哪一类 token"。

用法：python3 scripts/restyle_inventory.py
产物：evidence/restyle-inventory.json + evidence/restyle-inventory.md
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = ROOT / "src" / "catalog-page" / "catalog.css"
EVIDENCE = ROOT / "evidence"

# ── 分类：哪些属性属于「要换成 token」的四类（字体/色值/圆角/间距）+ 邻接项 ──────────
CATEGORY = {
    "color": "色值",
    "background-color": "色值",
    "background": "色值",
    "border-color": "色值",
    "border": "色值",
    "border-top-color": "色值",
    "border-bottom-color": "色值",
    "border-left-color": "色值",
    "outline-color": "色值",
    "font-family": "字体",
    "font": "字体",
    "font-size": "字阶",
    "font-weight": "字重",
    "letter-spacing": "字阶",
    "line-height": "行高",
    "text-transform": "字阶",
    "border-radius": "圆角",
    "padding": "间距",
    "padding-top": "间距",
    "padding-bottom": "间距",
    "padding-left": "间距",
    "padding-right": "间距",
    "margin": "间距",
    "margin-top": "间距",
    "margin-bottom": "间距",
    "margin-left": "间距",
    "margin-right": "间距",
    "gap": "间距",
    "transition": "动效",
    "outline": "线宽",
    "border-width": "线宽",
    "min-width": "布局",
    "max-width": "布局",
    "width": "布局",
}

# ── 占位 token → 16 候选路径（占位命名，以 16 定稿为准）──────────────────────────
TOKEN_CANDIDATE = {
    # 色
    "--ds-color-bg": "color.bg.canvas",
    "--ds-color-bg-elev": "color.bg.elevated",
    "--ds-color-text": "color.text.primary",
    "--ds-color-text-muted": "color.text.secondary",
    "--ds-color-text-faint": "color.text.tertiary",
    "--ds-color-text-on-accent": "color.text.onAccent",
    "--ds-color-text-on-accent-2": "color.text.onAccentSecondary",
    "--ds-color-text-bright": "color.text.inverse",
    "--ds-color-accent": "color.accent.default",
    "--ds-color-accent-2": "color.accent.secondary",
    "--ds-color-positive": "color.state.positive",
    "--ds-color-warning": "color.state.warning",
    "--ds-color-border": "color.border.default",
    "--ds-color-border-soft": "color.border.subtle",
    "--ds-color-border-strong": "color.border.strong",
    "--ds-color-surface": "color.surface.default",
    "--ds-color-surface-hover": "color.surface.hover",
    "--ds-color-surface-raised": "color.surface.raised",
    "--ds-color-surface-sunken": "color.surface.sunken",
    "--ds-color-surface-quiet": "color.surface.quiet",
    "--ds-color-tint-info": "color.tint.info",
    "--ds-color-tint-info-soft": "color.tint.infoSoft",
    "--ds-color-tint-info-border": "color.tint.infoBorder",
    # 字体族
    "--ds-font-sans": "font.family.sans",
    "--ds-font-mono": "font.family.mono",
    # 字阶
    "--ds-font-size-9": "font.size.micro",
    "--ds-font-size-10": "font.size.caption",
    "--ds-font-size-10-5": "font.size.caption",
    "--ds-font-size-11": "font.size.label",
    "--ds-font-size-11-5": "font.size.small",
    "--ds-font-size-12": "font.size.small",
    "--ds-font-size-13": "font.size.body",
    "--ds-font-size-13-2": "font.size.body",
    "--ds-font-size-13-5": "font.size.reading",
    "--ds-font-size-12-5": "font.size.caption",
    "--ds-font-size-14": "font.size.reading",
    "--ds-font-size-15": "font.size.body",
    "--ds-font-size-18": "font.size.title",
    "--ds-font-size-display": "font.size.display",
    # 行高
    "--ds-line-height-tight": "font.lineHeight.tight",
    "--ds-line-height-body": "font.lineHeight.body",
    "--ds-line-height-prose": "font.lineHeight.prose",
    "--ds-line-height-panel": "font.lineHeight.prose",
    "--ds-line-height-card": "font.lineHeight.snug",
    # 字重
    "--ds-weight-regular": "font.weight.regular",
    "--ds-weight-medium": "font.weight.medium",
    "--ds-weight-semibold": "font.weight.semibold",
    "--ds-weight-bold": "font.weight.bold",
    "--ds-weight-extrabold": "font.weight.extrabold",
    # 间距
    "--ds-space-5": "space.1",
    "--ds-space-7": "space.2",
    "--ds-space-8": "space.2",
    "--ds-space-9": "space.2",
    "--ds-space-10": "space.3",
    "--ds-space-11": "space.3",
    "--ds-space-12": "space.3",
    "--ds-space-13": "space.3",
    "--ds-space-14": "space.4",
    "--ds-space-16": "space.4",
    "--ds-space-18": "space.5",
    "--ds-space-20": "space.6",
    "--ds-space-22": "space.6",
    "--ds-space-24": "space.7",
    "--ds-space-34": "space.9",
    "--ds-space-40": "space.10",
    "--ds-space-44": "space.11",
    "--ds-space-gutter": "layout.gutter",
    "--ds-space-column": "layout.grid.minColumn",
    "--ds-space-measure": "layout.measure",
    # 圆角
    "--ds-radius-0": "radius.none",
    "--ds-radius-2": "radius.sm",
    "--ds-radius-3": "radius.md",
    "--ds-radius-pill": "radius.pill",
    # 线宽
    "--ds-line-1": "border.width.thin",
    "--ds-line-2": "border.width.regular",
    # 动效
    "--ds-motion-fast": "motion.duration.fast",
    "--ds-motion-easing": "motion.easing.standard",
    # 容器
    "--ds-container-max": "layout.container.max",
}


def strip_comments(text: str) -> str:
    return re.sub(r"/\*.*?\*/", "", text, flags=re.S)


def parse_blocks(css: str):
    """返回 [(line_no, selector, {prop: value}, media_context)]"""
    out = []
    i = 0
    line = 1
    media_stack = []
    n = len(css)
    while i < n:
        # 记录行号
        m = re.compile(r"@media([^{]+)\{").search(css, i)
        b = re.compile(r"([^{}@]+)\{([^{}]*)\}").search(css, i)
        if m and (not b or m.start() < b.start()):
            media_stack.append(m.group(1).strip())
            i = m.end()
            continue
        if b:
            sel = " ".join(b.group(1).split())
            body = b.group(2)
            decls = {}
            for d in body.split(";"):
                if ":" not in d:
                    continue
                p, v = d.split(":", 1)
                decls[p.strip()] = " ".join(v.split())
            out.append((line, sel, decls, " & ".join(media_stack)))
            i = b.end()
            continue
        # 跳过 @media 的收尾括号
        if css[i] == "}":
            if media_stack:
                media_stack.pop()
            i += 1
            continue
        if css[i] == "{":
            i += 1
            continue
        i += 1
    return out


def main() -> None:
    raw = CSS.read_text(encoding="utf-8")
    lines_raw = raw.splitlines()
    # 逐行号定位（用于给每条声明标行号）
    decl_lines = []
    for idx, ln in enumerate(lines_raw, start=1):
        for d in ln.split(";"):
            d = d.strip()
            if ":" in d and not d.startswith("/*") and not d.startswith("--"):
                p, v = d.split(":", 1)
                decl_lines.append((idx, p.strip(), " ".join(v.split())))
    decl_lines.sort()

    clean = strip_comments(raw)
    blocks = parse_blocks(clean)

    # :root 里的 token 旧值
    token_old = {}
    for _ln, sel, decls, _media in blocks:
        if sel == ":root":
            for p, v in decls.items():
                if p.startswith("--ds-"):
                    token_old[p] = v

    var_use = {}
    raw_decls = []
    for _ln, sel, decls, media in blocks:
        if sel == ":root":
            continue
        for p, v in decls.items():
            cat = CATEGORY.get(p)
            if not cat:
                continue
            vars_used = re.findall(r"var\((--ds-[a-z0-9-]+)\)", v)
            entry = {
                "selector": sel,
                "media": media or None,
                "property": p,
                "value": v,
                "category": cat,
                "vars": vars_used,
            }
            raw_decls.append(entry)
            for var in vars_used:
                var_use.setdefault(var, []).append(f"{sel}{' @' + media if media else ''} → {p}")

    # 给每条声明补行号：按出现顺序在 decl_lines 里顺序匹配
    k = 0
    for entry in raw_decls:
        target = (entry["property"], entry["value"])
        found = None
        for j in range(k, len(decl_lines)):
            if decl_lines[j][1] == target[0]:
                # 值可能因注释剥离略有差异，做宽松匹配
                if decl_lines[j][2] == target[1] or target[1] in decl_lines[j][2]:
                    found = decl_lines[j][0]
                    k = j + 1
                    break
        entry["line"] = found

    # ── 改版后：页面层实际消费的 16 令牌 ───────────────────────────
    # 读 tokens.css 拿到每个 --ds-* 的权威取值，再列出 catalog.css 里的消费点
    tokens_css = ROOT / "src" / "catalog-page" / "assets" / "ds" / "tokens.css"
    ds_values = {}
    if tokens_css.exists():
        tcss = re.sub(r"/\*.*?\*/", "", tokens_css.read_text(encoding="utf-8"), flags=re.S)
        for m in re.finditer(r"(--ds-[a-z0-9-]+)\s*:\s*([^;{}]+);", tcss):
            ds_values.setdefault(m.group(1), m.group(2).strip())
    ds_used = {}
    for e in raw_decls:
        for var in e["vars"]:
            if var.startswith("--ds-"):
                ds_used.setdefault(var, []).append(f"{e['selector']}{' @' + e['media'] if e['media'] else ''} → {e['property']}")
    current_state = {
        "tokenCount": len(ds_used),
        "tokens": [
            {
                "token": var,
                "value": ds_values.get(var, "（tokens.css 中未直接定义，可能来自组合值）"),
                "usedBy": uses[:6],
                "useCount": len(uses),
            }
            for var, uses in sorted(ds_used.items())
        ],
    }

    tokens = []
    for var, old in sorted(token_old.items()):
        cand = TOKEN_CANDIDATE.get(var)
        cat = (
            "色值"
            if "color" in var
            else "字体"
            if "font-family" in var or var in ("--ds-font-sans", "--ds-font-mono")
            else "字阶"
            if "font-size" in var
            else "行高"
            if "line-height" in var
            else "字重"
            if "weight" in var
            else "间距"
            if "space" in var
            else "圆角"
            if "radius" in var
            else "线宽"
            if var.startswith("--ds-line-")
            else "动效"
            if "motion" in var
            else "布局"
        )
        tokens.append(
            {
                "token": var,
                "category": cat,
                "oldValue": old,
                "candidate16": cand,
                "usedBy": var_use.get(var, []),
                "useCount": len(var_use.get(var, [])),
            }
        )

    unmapped = [t["token"] for t in tokens if not t["candidate16"]]
    inline_literals = [
        {
            "selector": e["selector"],
            "line": e["line"],
            "property": e["property"],
            "value": e["value"],
            "category": e["category"],
        }
        for e in raw_decls
        if not e["vars"]
    ]

    report = {
        "source": "src/catalog-page/catalog.css",
        "state": "post-restyle" if not token_old else "pre-restyle",
        "note": "改版前：占位 token 名 = 旧值别名，candidate16 为 16 定稿前的占位候选路径。"
                "改版后：页面层直接消费 16 的 --ds-* 令牌，取值以 16-design-system/src/tokens.css 为准。",
        "tokenCount": len(tokens),
        "declarationCount": len(raw_decls),
        "literalDeclarationCount": len(inline_literals),
        "tokens": tokens,
        "literalDeclarations": inline_literals,
        "unmappedTokens": unmapped,
        "currentState": current_state,
    }

    EVIDENCE.mkdir(parents=True, exist_ok=True)
    (EVIDENCE / "restyle-inventory.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    # Markdown 表
    md = [
        "# 改版视觉面清点（机器生成）",
        "",
        f"来源：`{report['source']}`　占位 token {report['tokenCount']} 个　相关声明 {report['declarationCount']} 条　其中仍为字面量 {report['literalDeclarationCount']} 条",
        "",
        "> 本表由 `scripts/restyle_inventory.py` 生成，勿手工编辑。",
        "> `16 候选路径` 是**占位命名**，表示「改版后该落到哪一类 token」；最终键名以 16 的 `design-tokens.json` 为准。",
        "",
        "## 一、token 清单",
        "",
        "| 占位 token | 类别 | 旧值 | 16 候选路径 | 引用处 |",
        "| --- | --- | --- | --- | --- |",
    ]
    for t in tokens:
        uses = "<br>".join(f"`{u}`" for u in t["usedBy"][:4]) or "—"
        if t["useCount"] > 4:
            uses += f"<br>…共 {t['useCount']} 处"
        md.append(
            f"| `{t['token']}` | {t['category']} | `{t['oldValue']}` | `{t['candidate16'] or '⚠️ 未映射'}` | {uses} |"
        )

    md += ["", "## 二、改版后页面层实际消费的 16 令牌", "",
           f"共 {current_state['tokenCount']} 个 `--ds-*` 令牌，取值来自 `16-design-system/src/tokens.css`。", "",
           "| 16 令牌 | 取值 | 消费处 |", "| --- | --- | --- |"]
    for tk in current_state["tokens"]:
        uses = "<br>".join(f"`{u}`" for u in tk["usedBy"][:4]) or "—"
        if tk["useCount"] > 4:
            uses += f"<br>…共 {tk['useCount']} 处"
        md.append(f"| `{tk['token']}` | `{tk['value']}` | {uses} |")

    md += ["", "## 三、仍是字面量（未走 token）的声明", "", "| 行 | 选择器 | 属性 | 旧值 | 类别 |", "| --- | --- | --- | --- | --- |"]
    for e in inline_literals:
        md.append(f"| {e['line']} | `{e['selector']}` | `{e['property']}` | `{e['value']}` | {e['category']} |")
    if not inline_literals:
        md.append("| — | 无 | — | — | — |")

    (EVIDENCE / "restyle-inventory.md").write_text("\n".join(md) + "\n", encoding="utf-8")

    print(f"状态：{report['state']}")
    print(f"占位 token {len(tokens)} 个 / 声明 {len(raw_decls)} 条 / 字面量 {len(inline_literals)} 条")
    print(f"改版后消费的 16 令牌：{current_state['tokenCount']} 个")
    print(f"未映射 token：{unmapped or '无'}")
    print(f"产物：{EVIDENCE / 'restyle-inventory.md'}")


if __name__ == "__main__":
    main()
