#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
final_quotes.py — 一次性把 build_catalog.py 的中文引号规范好。

步骤：
  1. 先把之前转换产生的「」全部还原为 ASCII "。
  2. 再用**字符串状态机**逐行扫描：处于字符串内部时，若一个 ASCII " 的
     下一个字符是中日韩字符，则判定为「中文内嵌引号」，按出现顺序交替写成
     「 / 」；否则判定为字符串定界符，保持 ASCII "。

判据之所以成立：Python 里字符串的闭合引号后面必然紧跟 , ) ] : 或行尾，
永远不会紧跟汉字；而中文内嵌引号后面紧跟的是汉字。

用法：python3 scripts/final_quotes.py
"""
import re

PATH = "scripts/build_catalog.py"


def is_cjk(ch: str) -> bool:
    if not ch:
        return False
    o = ord(ch)
    return (0x4E00 <= o <= 0x9FFF) or (0x3000 <= o <= 0x303F) or (0xFF00 <= o <= 0xFFEF) \
        or ch in "《》「」【】—…·？！"


src = open(PATH, encoding="utf-8").read()

# --- 步骤 1：还原 ---
src = src.replace("「", '"').replace("」", '"')

# --- 步骤 2：状态机 ---
lines = src.split("\n")
out = []
in_doc = False
for ln in lines:
    s = ln.strip()
    if s.startswith('"""'):
        out.append(ln)
        if in_doc:
            in_doc = False
        else:
            in_doc = True
        continue
    if in_doc:
        out.append(ln)
        continue

    res = []
    i = 0
    in_str = False
    toggle_cn = 0
    toggle_en = 0
    n = len(ln)
    while i < n:
        ch = ln[i]
        if ch == '"':
            nxt = ln[i + 1] if i + 1 < n else ""
            after = ""
            j = i + 1
            while j < n and ln[j] == " ":
                j += 1
            after = ln[j] if j < n else ""
            inner = False
            kind = ""
            if in_str:
                if is_cjk(nxt):
                    inner, kind = True, "cn"
                elif nxt.isascii() and nxt.isalpha():
                    inner, kind = True, "en"
                elif nxt == " " and after.isascii() and after.isalpha():
                    inner, kind = True, "en"
            if inner:
                if kind == "cn":
                    res.append("「" if toggle_cn % 2 == 0 else "」")
                    toggle_cn += 1
                else:
                    res.append("“" if toggle_en % 2 == 0 else "”")
                    toggle_en += 1
            else:
                res.append(ch)
                in_str = not in_str
            i += 1
            continue
        res.append(ch)
        i += 1
    out.append("".join(res))

open(PATH, "w", encoding="utf-8").write("\n".join(out))
print("done")
