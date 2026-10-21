#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_tuple_quotes.py — 修回 build_catalog.py 中「元组/字典字面量」被误转成「」的行。

判定规则（确定性）：
  · CASES 的字符串字段（白名单）→ 保留「」作为中文内嵌引号，定界符保持 ASCII。
  · 独立列表字符串（body 内不含 '":'）→ 保留「」。
  · 其余行（元组/字典值、行内列表等）→ 把 「」 全部还原为 ASCII "。
用法：python3 scripts/fix_tuple_quotes.py
"""
import re

PATH = "scripts/build_catalog.py"

CASE_STRING_KEYS = {
    "nameZh", "nameEn", "pinyin", "province", "locality", "yearText",
    "yearUncertainty", "type", "ethnic", "principleZh", "principleEn",
    "cultureZh", "cultureEn", "caveat",
}
VALUE_LINE = re.compile(r'^(\s*)([A-Za-z_][A-Za-z0-9_]*)="(.*)"(\)?,?)\s*$', re.S)
BARE_LINE = re.compile(r'^(\s*)"(.*)"(\)?,?)\s*$', re.S)

src = open(PATH, encoding="utf-8").read()
lines = src.split("\n")
out = []
restored = 0
for ln in lines:
    if ln.strip().startswith('"""'):
        out.append(ln)
        continue
    m = VALUE_LINE.match(ln)
    if m and m.group(2) in CASE_STRING_KEYS:
        out.append(ln)          # 中文内嵌引号保持「」
        continue
    b = BARE_LINE.match(ln)
    if b and ':' not in b.group(2):
        out.append(ln)          # 独立列表字符串，保持「」
        continue
    if "「" in ln or "」" in ln:
        restored += ln.count("「") + ln.count("」")
        ln = ln.replace("「", '"').replace("」", '"')
    out.append(ln)

open(PATH, "w", encoding="utf-8").write("\n".join(out))
print("tuple/dict quotes restored:", restored)
