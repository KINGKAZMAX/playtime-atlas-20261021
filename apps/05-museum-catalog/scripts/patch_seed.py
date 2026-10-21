#!/usr/bin/env python3
"""
05-museum-research — 种子数据校正

依据联网核验结果修正 seed_items.json：
  1. 拆开 `title`（展签用原名）与 `wiki`（来源条目名）——原先共用一个字段，
     导致来源文章与展品名不同时无法表达。
  2. 修正 6 个不存在的维基条目名（重定向/别名/错名）。
  3. 修正 2 个年份（ZX Spectrum 1981→1982；Brown Box 1967→1969，来源为
     "First generation of video game consoles"：1969 年 1 月完成第七号原型机）。
  4. 修正 1 个创作者归属（Speed Race 归 Taito，而非 Exidy）。
  5. 移除 1 条无法找到可引证来源的条目（GROOVE 1961）——见 QA.md 的剔除记录。
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
SEED = os.path.join(DATA, "seed_items.json")

# id -> (新 wiki 条目名, 新 title 展签名 或 None 保持不变, 新 year 或 None, 新 creator 或 None)
WIKI_FIX = {
    "sw-little-computer-program": ("Early history of video games", "Little Computer Program", None, None),
    "hw-brown-box": ("First generation of video game consoles", "Brown Box (prototype)", 1969, None),
    "sw-groove": (None, None, None, None),          # 剔除
    "sw-gun-fight": ("Gun Fight", "Gun Fight", None, None),
    "sw-speed-race": ("Speed Race", "Speed Race", None, "Taito（Masahiro Fukuchi、Yoshiki Okamoto）"),
    "sw-odyssey2-pong": ("Magnavox Odyssey", "Pong (Magnavox Odyssey version)", None, None),
    "sw-elite": ("Elite (video game)", "Elite", None, None),
    "sw-grand-theft-auto": ("Grand Theft Auto (video game)", "Grand Theft Auto", None, None),
    "sw-civilization": ("Civilization (video game)", "Sid Meier's Civilization", None, None),
    "sw-tekken": ("Tekken (video game)", "Tekken", None, None),
    "sw-left-4-dead": ("Left 4 Dead", "Left 4 Dead", None, None),
    "sw-temple-run": ("Temple Run", "Temple Run", None, None),
    "sw-vvvvvv": ("VVVVVV", "VVVVVV", None, None),
    "hw-oculus-quest": ("Oculus Quest", "Meta Quest (Oculus Quest)", None, None),
    "sw-superhot": ("Superhot VR", "Superhot", None, None),
    "sw-mud1": ("Multi-user dungeon", "MUD1 (University of Essex)", None, None),
    "hw-zx-spectrum": (None, None, 1982, None),
}

DROP = {"sw-groove"}


def main():
    seed = json.load(open(SEED, encoding="utf-8"))
    before = len(seed)
    out = []
    for x in seed:
        if x["id"] in DROP:
            print(f"  DROP {x['id']} (无可引证来源)")
            continue
        x.setdefault("title", x["wiki"])
        f = WIKI_FIX.get(x["id"])
        if f:
            w, t, y, c = f
            if w:
                x["wiki"] = w
                print(f"  wiki  {x['id']:26} -> {w}")
            if t:
                x["title"] = t
            if y:
                x["year"] = y
                print(f"  year  {x['id']:26} -> {y}")
            if c:
                x["creator"] = c
                print(f"  maker {x['id']:26} -> {c}")
        out.append(x)
    json.dump(out, open(SEED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\nseed: {before} -> {len(out)}")

    # 同步 curated 文本里的两处年份/归属表述
    cur_dir = os.path.join(DATA, "curated")
    for fn in sorted(os.listdir(cur_dir)):
        p = os.path.join(cur_dir, fn)
        d = json.load(open(p, encoding="utf-8"))
        changed = False
        if "hw-brown-box" in d:
            d["hw-brown-box"]["summary"] = (
                "1969 年 1 月，Ralph Baer 与 Bill Harrison 团队在 Sanders Associates 完成第七号原型机"
                "（昵称 Brown Box），以木质外壳、旋钮与光枪配件构成，可连接普通电视播放简单图形游戏。")
            d["hw-brown-box"]["significance"] = (
                "家用游戏机「家用场景 + 外接电视 + 实物控制器」三件套的原型；"
                "1969 年完成原型后专利经转让给 Magnavox，1972 年以 Odyssey 上市，是后来 Atari 2600 的直接前驱。")
            changed = True
        if "sw-speed-race" in d:
            d["sw-speed-race"]["summary"] = (
                "1974 年 Taito 推出的街机赛车游戏，玩家用方向盘与挡杆控制车辆躲避交通，"
                "屏幕以纵深方式表现前进。")
            changed = True
        if changed:
            json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print(f"  curated updated: {fn}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
