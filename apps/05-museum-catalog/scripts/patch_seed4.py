#!/usr/bin/env python3
"""
05-museum-research — 展签名清理（第四次校正）

`title` 字段是**展签显示名**，此前直接沿用维基条目名，导致带上了
"(video game)" / "(console)" / "(1993 video game)" 这类消歧义括号。
来源条目名由 `sourceDetail.sourceArticle` 单独保留，不受影响。

规则：剥掉消歧义型尾括号；少数承载信息的括号改为中文表述。
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
SEED = os.path.join(DATA, "seed_items.json")

# 消歧义型尾括号（剥掉）
DISAMBIG = re.compile(
    r"\s*\((?:computer system|computer|video game|console|service|"
    r"\d{4} video game|1st generation|prototype)\)$", re.I)

# 承载信息、改写为中文表述
OVERRIDE = {
    "Brown Box (prototype)": "Brown Box 棕盒原型机",
    "Pong (Magnavox Odyssey version)": "Pong（Magnavox Odyssey 版）",
    "MUD1 (University of Essex)": "MUD1",
    "Meta Quest (Oculus Quest)": "Meta Quest / Oculus Quest",
}


def main():
    seed = json.load(open(SEED, encoding="utf-8"))
    n = 0
    for x in seed:
        t = x.get("title") or x["wiki"]
        new = OVERRIDE.get(t) or DISAMBIG.sub("", t)
        if new != t:
            print(f"  {x['id']:26} {t!r} -> {new!r}")
            x["title"] = new
            n += 1
    json.dump(seed, open(SEED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\n{n} 个展签名已清理（来源条目名不变）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
