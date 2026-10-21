#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
normalize_quotes.py — 把 build_catalog.py 中所有中文字符串里的引号规范成「」，
同时把元组/字典字面量的定界符保持为 ASCII "。

规则（确定性，无启发式猜测）：
  A. 形如  key="....."  且 key 在白名单 → 值内所有引号（ASCII " 与中文 “ ”）
     依次交替替换为「 」「 」；定界符保持 ASCII。
  B. 形如  "....."      且值内不含 ':'（独立列表字符串）→ 同 A。
  C. 其余行（元组/字典值、行内列表）→ 出现的「」全部还原为 ASCII "。

用法：python3 scripts/normalize_quotes.py
"""
import re

PATH = "scripts/build_catalog.py"

CASE_KV_KEYS = {
    "nameZh", "nameEn", "pinyin", "province", "locality", "yearText",
    "yearUncertainty", "type", "ethnic", "principleZh", "principleEn",
    "cultureZh", "cultureEn", "caveat",
}
QUOTED_KV_KEYS = {"forceNoteZh", "forceNoteEn"}
VALUE_LINE = re.compile(r'^(\s*)"?([A-Za-z_][A-Za-z0-9_]*)?"?\s*:\s*"(.*)"(\)?,?)\s*$', re.S)
KV_LINE   = re.compile(r'^(\s*)([A-Za-z_][A-Za-z0-9_]*)="(.*)"(\)?,?)\s*$', re.S)
BARE_LINE = re.compile(r'^(\s*)"(.*)"(\)?,?)\s*$', re.S)

QUOTES = set('"“”')


def to_cn_quotes(body: str):
    out = []
    toggle = 0
    for ch in body:
        if ch in QUOTES:
            out.append("「" if toggle % 2 == 0 else "」")
            toggle += 1
        else:
            out.append(ch)
    return "".join(out)


src = open(PATH, encoding="utf-8").read()
lines = src.split("\n")
out = []
stats = {"cn": 0, "ascii": 0}
for ln in lines:
    if ln.strip().startswith('"""'):
        out.append(ln)
        continue

    handled = False

    m = KV_LINE.match(ln)
    if m and m.group(2) in CASE_KV_KEYS:
        indent, key, body, tail = m.groups()
        nb = to_cn_quotes(body)
        stats["cn"] += sum(1 for c in body if c in QUOTES)
        out.append(f'{indent}{key}="{nb}"{tail}')
        handled = True

    if not handled:
        m = VALUE_LINE.match(ln)
        if m and m.group(2) in QUOTED_KV_KEYS:
            indent, key, body, tail = m.groups()
            nb = to_cn_quotes(body)
            stats["cn"] += sum(1 for c in body if c in QUOTES)
            out.append(f'{indent}"{key}": "{nb}"{tail}')
            handled = True

    if not handled:
        b = BARE_LINE.match(ln)
        if b and ':' not in b.group(2):
            indent, body, tail = b.groups()
            nb = to_cn_quotes(body)
            stats["cn"] += sum(1 for c in body if c in QUOTES)
            out.append(f'{indent}"{nb}"{tail}')
            handled = True

    if handled:
        continue

    if "「" in ln or "」" in ln:
        stats["ascii"] += ln.count("「") + ln.count("」")
        ln = ln.replace("「", '"').replace("」", '"')
    out.append(ln)

open(PATH, "w", encoding="utf-8").write("\n".join(out))
print(f"inner quotes -> 「」: {stats['cn']}   「」 -> ASCII: {stats['ascii']}")
