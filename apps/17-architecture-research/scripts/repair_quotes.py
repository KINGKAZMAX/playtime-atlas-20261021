#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
repair_quotes.py — 把 build_catalog.py 中 CASES 段里"中文语境下的 ASCII 双引号"
统一换成中文书名/引号「」，使 Python 语法正确且中文排版规范。

规则（确定性，无启发式猜测）：
  · 形如   key="....."   的行 → 取最后一个 " 作为闭合定界符，其内部的 " 全部视为
    中文引号，按出现顺序交替替换为「 和 」。
  · 形如   key=[...]     的行 → 列表字面量，不动。
  · 其他行 → 不动。
用法：python3 scripts/repair_quotes.py
"""
import re
import sys

PATH = "scripts/build_catalog.py"

VALUE_LINE = re.compile(r'^(\s*)([A-Za-z_][A-Za-z0-9_]*)="(.*)"(\)?,?)\s*$', re.S)
BARE_LINE = re.compile(r'^(\s*)"(.*)"(\)?,?)\s*$', re.S)


def repair(lines):
    out = []
    fixed = 0
    for ln in lines:
        if ln.strip().startswith('"""'):
            out.append(ln)
            continue
        m = VALUE_LINE.match(ln)
        if m:
            indent, key, body, tail = m.groups()
        else:
            m2 = BARE_LINE.match(ln)
            if not m2:
                out.append(ln)
                continue
            indent, body, tail = m2.groups()
            key = None
        # body 内所有引号（ASCII " / 中文 “ ”）统一按出现顺序交替成「」
        new = []
        toggle = 0
        for ch in body:
            if ch in '"“”':
                new.append("「" if toggle % 2 == 0 else "」")
                toggle += 1
                fixed += 1
            else:
                new.append(ch)
        body2 = "".join(new)
        if key is not None:
            out.append(f'{indent}{key}="{body2}"{tail}')
        else:
            out.append(f'{indent}"{body2}"{tail}')
    return out, fixed


def main():
    src = open(PATH, encoding="utf-8").read()
    lines = src.split("\n")
    lines, fixed = repair(lines)
    open(PATH, "w", encoding="utf-8").write("\n".join(lines))
    print("inner quotes rewritten:", fixed)

    # 报告仍残留的弯引号（应只剩真正的内嵌中文引号）
    resid = []
    for i, ln in enumerate(lines, 1):
        if "“" in ln or "”" in ln:
            resid.append((i, ln.strip()[:110]))
    if resid:
        print(f"\nresidual curly quotes: {len(resid)}")
        for i, t in resid[:20]:
            print(f"  {i}: {t}")
    else:
        print("no residual curly quotes")


if __name__ == "__main__":
    main()
