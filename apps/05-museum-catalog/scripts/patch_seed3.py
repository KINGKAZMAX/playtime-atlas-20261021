#!/usr/bin/env python3
"""
05-museum-research — 种子数据三次校正（依据 infobox 交叉核对结果）

修正 5 处与来源条目 infobox 不一致的策展字段：
  · Gun Fight  —— 维基 infobox: developer=Taito、designer=Tomohiro Nishikado / Dave Nutting(US)、
                   publisher=Taito(JP/EU) / Midway(NA)。原写"Nintendo (Gunpei Yokoi)"指向的是
                   Nintendo 的另一款同名作品，予以更正。
  · Arkanoid   —— developer=Taito、designer=Akira Fujita & Hiroshi Tsujino、
                   publisher=Taito(JP/EU) / Romstar(NA)。原写"Romstar (Akira Fujita)"把发行商当成了开发商。
  · Space Travel —— platforms=Multics / GECOS / PDP-7。
  · Pong       —— 街机首发 1972-11-29（北美），家用版 1975 年 10 月。
  · Computer Space —— developer=Syzygy Engineering、publisher=Nutting Associates。
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
SEED = os.path.join(DATA, "seed_items.json")

FIX = {
    "sw-gun-fight": {
        "creator": "Taito（Tomohiro Nishikado 设计；美版由 Dave Nutting 参与设计，Midway Manufacturing 发行）",
        "platform": "Taito 专用街机硬件（1975 年 9 月日本首发），后移植至 Astrocade 与 Atari 8-bit",
    },
    "sw-arkanoid": {
        "creator": "Taito（Akira Fujita、Hiroshi Tsujino 设计；北美由 Romstar 发行）",
    },
    "sw-space-travel": {
        "platform": "Multics / GECOS / PDP-7（1969 年版；其 1961 年前身运行于 IBM 7090）",
    },
    "sw-pong": {
        "platform": "Atari 专用街机硬件（1972 年 11 月 29 日北美首发）；1975 年 10 月推出 Atari VCS/2600 家用卡带版",
    },
    "sw-computer-space": {
        "creator": "Atari 前身 Syzygy Engineering（Nolan Bushnell、Andy Cappock）设计，Nutting Associates 制造与发行",
    },
}

CURATED = {
    "sw-gun-fight": {
        "titleZh": "《Gun Fight》（多方向射击）",
        "summary": "1975 年 9 月由 Taito 推出的多方向射击街机游戏，Tomohiro Nishikado 主导设计；美版由 Dave Nutting 参与设计并由 Midway Manufacturing 发行。玩家要同时应对四个方向逼近的敌人。",
        "significance": "「同时应付多方向来敌」这一街机射击框架的早期代表；美版把射击目标换成屏幕上的真人形象，使枪战第一次有了「对手是人」的实感，为其后 Nintendo 等厂商的枪战街机提供了范式。"
    },
    "sw-arkanoid": {
        "titleZh": "《Arkanoid》",
        "summary": "1986 年由 Taito 推出的街机打砖块游戏，Akira Fujita 与 Hiroshi Tsujino 设计，1986 年 12 月 26 日在日本首发，后移植到 NES、MS-DOS 等平台；北美由 Romstar 发行。",
        "significance": "「简单物理 + 道具系统」如何撑起长线留存的范式；也是日本厂商输出规则型玩法的代表。"
    },
    "sw-space-travel": {
        "titleZh": "《Space Travel》",
        "summary": "Ken Thompson 编写、1969 年在 Multics 系统上完成的太空旅行模拟程序，可在 Multics、GECOS 与 PDP-7 上运行；其更早的原型在 1961 年运行于 IBM 7090。",
        "significance": "早期程序员「以玩具代研究」的样本；自修改代码与自选视角的玩法为后来的空间模拟与开放世界埋下伏笔。"
    },
    "sw-pong": {
        "titleZh": "《Pong》",
        "summary": "1972 年 Atari 团队 Allan Alcorn 完成、街机版于 1972 年 11 月 29 日在北美推出；玩法是两人用旋钮控制挡板击回方块，1975 年 10 月推出 Atari VCS/2600 家用卡带版。",
        "significance": "把电子游戏推向大众市场的第一款真正的大热作品；其极简规则成为此后几十年街机对战玩法的母型。"
    },
    "sw-computer-space": {
        "titleZh": "《Computer Space》",
        "summary": "1971 年由 Nolan Bushnell 与 Andy Cappock 在 Syzygy Engineering 设计、Nutting Associates 制造与发行的投币式电子游戏，玩家操控火箭对抗飞碟，受《Spacewar!》影响明显。",
        "significance": "公认最早的商业街机电子游戏；也是「先有玩法、再有公司」这一创业模式的起点案例。"
    },
}


def main():
    seed = json.load(open(SEED, encoding="utf-8"))
    for x in seed:
        f = FIX.get(x["id"])
        if not f:
            continue
        for k, v in f.items():
            if x.get(k) != v:
                print(f"  {x['id']:20} {k}:\n     old: {x.get(k)}\n     new: {v}")
                x[k] = v
    json.dump(seed, open(SEED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    cur_dir = os.path.join(DATA, "curated")
    for fn in sorted(os.listdir(cur_dir)):
        p = os.path.join(cur_dir, fn)
        d = json.load(open(p, encoding="utf-8"))
        changed = False
        for k, v in CURATED.items():
            if k in d:
                d[k].update(v)
                changed = True
        if changed:
            json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"  curated updated: {fn}")
    print("\ndone")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
