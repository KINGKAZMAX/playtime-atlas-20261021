#!/usr/bin/env python3
"""
05-museum-research — 种子数据二次校正（依据全文核验结果）

对每条逐项核对英文维基百科的**条目全文 wikitext**，据此：
  · 修正不存在的条目名
  · 修正与来源不一致的年份 / 创作者
  · 对无独立条目、但被权威综述条目明确记载的早期作品，改挂到正确的综述条目
  · 替换找不到任何可引证来源的条目（不保留无来源的条目）

同时同步人工撰写的 summary / significance / titleZh。
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")
SEED = os.path.join(DATA, "seed_items.json")

# id -> dict(wiki=, title=, year=, era=, kind=, platform=, creator=)
FIX = {
    # NIM：维基"Nim"条目讲的是 1951 Festival of Britain 展出的 nim-playing computer 与
    # 1952 年 W. L. Maxson 的机器（即 NIMROD），并不记载 Wickstead 1956 年的 NIM 机器
    # → 改挂为有明确条目与年份的 NIMROD
    "hw-nim": {
        "wiki": "Nim", "title": "Nimrod 取石子计算机",
        "year": 1952, "era": "origins", "kind": "hardware",
        "platform": "W. L. Maxson Corporation 继电器式取石子机（后来的 NIMROD）",
        "creator": "Herbert Koppel、Eugene Grant、Howard Baller（W. L. Maxson Corporation）",
    },
    # Space Travel：条目 infobox 明确 released 1969、platforms Multics / GECOS / PDP-7
    "sw-space-travel": {
        "wiki": "Space Travel (video game)", "title": "Space Travel",
        "year": 1969, "era": "origins",
    },
    # Imlac：条目 infobox 显示 founded 1968，PDS-1 为 1969 年机型
    "hw-imlac": {
        "wiki": "Imlac", "title": "Imlac PDS-1 图形显示系统",
        "year": 1969, "era": "origins",
    },
    # 井字棋条目实际指向 OXO（1952，EDSAC），改按 OXO 收录
    "sw-noughts-and-crosses": {
        "wiki": "OXO (video game)", "title": "OXO（井字棋模拟器）",
        "year": 1952, "era": "origins",
        "platform": "EDSAC 计算机",
        "creator": "A. S. Douglas（剑桥大学）",
    },
    # 1968 年 Rosenthal 的 Volleyball 无任何可引证条目 → 换成有独立条目且被
    # "Early history of video games" 明确列出的 1952 年 Checkers
    "sw-volleyball": {
        "wiki": "Checkers (1952 video game)", "title": "Checkers（1952 版）",
        "year": 1952, "era": "origins",
        "platform": "Ferranti Mark 1 计算机（与 NIMROD 同期）",
        "creator": "Christopher Strachey",
    },
    # Death Race：同名条目是消歧义页，指向 1976 年 Exidy 版
    "sw-death-race": {
        "wiki": "Death Race (1976 video game)", "title": "Death Race",
    },
    # GTA：条目明确 "is a 1997 action-adventure game"
    "sw-grand-theft-auto": {
        "wiki": "Grand Theft Auto (video game)", "title": "Grand Theft Auto",
        "year": 1997,
    },
    # Obra Dinn：条目明确 "is a 2018 adventure and puzzle video game"
    "sw-return-of-the-obsidian": {
        "wiki": "Return of the Obra Dinn", "title": "Return of the Obra Dinn",
        "year": 2018,
    },
    # App Store：通用条目不含年份，Apple 专页 infobox 为 "July 10, 2008"
    "pl-app-store": {
        "wiki": "App Store (Apple)", "title": "iOS App Store",
    },
}

CURATED = {
    "hw-nim": {
        "titleZh": "Nimrod 取石子计算机",
        "summary": "1952 年由 W. L. Maxson Corporation 的 Herbert Koppel、Eugene Grant 与 Howard Baller 造出的取石子专用机器，继电器逻辑直接实现「取走最后一颗者胜」的博弈规则；其前身在 1951 年英国 Festival of Britain 展出。",
        "significance": "把「博弈规则」直接刻进硬件的早期代表；与同时期 NIMROD、CSIRAC 的演示共同说明电子游戏最初是计算机技术的展示品。"
    },
    "sw-noughts-and-crosses": {
        "titleZh": "《OXO》（井字棋模拟器）",
        "summary": "1952 年剑桥大学学生 A. S. Douglas 为 EDSAC 编写的井字棋程序，是最早的一批软件电子游戏之一，也常被列为最早的电子游戏。",
        "significance": "把「人机交互」作为论文题目的早期实践；它让机器第一次以图形光点回应玩家的即时操作。"
    },
    "sw-volleyball": {
        "titleZh": "《Checkers》（1952 版）",
        "summary": "1952 年 Christopher Strachey 在 Ferranti Mark 1 上编写的跳棋程序，使用费曼-曼德布姆光点图形显示。",
        "significance": "与同时期 OXO 并列为「软件即游戏」的最早一批作品；光点图形直接启发了后来所有点阵显示风格。"
    },
    "sw-space-travel": {
        "titleZh": "《Space Travel》",
        "summary": "Ken Thompson 编写、在 Multics 系统上于 1969 年完成的太空旅行模拟程序，可自修改并支持实时矢量动画；其更早的原型在 1961 年运行于 IBM 7090。",
        "significance": "早期程序员「以玩具代研究」的样本；自修改代码与自选视角的玩法为后来的空间模拟与开放世界埋下伏笔。"
    },
    "hw-imlac": {
        "titleZh": "Imlac PDS-1 图形显示系统",
        "summary": "Imlac 公司 1968 年成立于马萨诸塞州 Needham，1969 年推出 PDS-1 图形显示系统，是首批低成本商用交互式图形终端之一。",
        "significance": "把「可实时刷新的矢量图形」做成可采购的产品；是 1960 年代末图形工作站与后来的 CAD、游戏图形终端之间的关键一环。"
    },
    "sw-grand-theft-auto": {
        "titleZh": "《Grand Theft Auto》",
        "summary": "1997 年由 DMA Design 开发、BMG Interactive 发行的开放世界动作冒险游戏，玩家在三维城市中驾车、劫掠与完成任务。",
        "significance": "「开放城市 + 任务链 + 可自由破坏」组合成街机式开放世界的模板，并引发持续至今的暴力内容讨论。"
    },
    "sw-return-of-the-obsidian": {
        "titleZh": "《Return of the Obra Dinn》",
        "summary": "2018 年由 Lucas Pope 创作的第一人称推理游戏，玩家在 60 人的轮船上逐一验明死者身份与死因。",
        "significance": "以单色剪影与状态标记进行信息推理的罕见设计；展示了「极简表现 + 强推理」可以同时成立。"
    },
    "sw-speed-race": {
        "titleZh": "《Speed Race》",
        "summary": "1974 年 Taito 推出的街机赛车游戏，玩家用方向盘与挡杆控制车辆躲避交通，屏幕以纵深方式表现前进。",
        "significance": "早期以伪三维表现速度感与「随机生成障碍」循环的代表作，也展示了街机对操作直觉的持续打磨。"
    },
    "hw-brown-box": {
        "titleZh": "棕盒（Brown Box）原型机",
        "summary": "1969 年 1 月，Ralph Baer 与 Bill Harrison 团队在 Sanders Associates 完成第七号原型机（昵称 Brown Box），以木质外壳、旋钮与光枪配件构成，可连接普通电视播放简单图形游戏。",
        "significance": "家用游戏机「家用场景 + 外接电视 + 实物控制器」三件套的原型；专利随后转让给 Magnavox，1972 年以 Odyssey 上市，是后来 Atari 2600 的直接前驱。"
    },
}


def main():
    seed = json.load(open(SEED, encoding="utf-8"))
    before = len(seed)
    for x in seed:
        f = FIX.get(x["id"])
        if not f:
            continue
        for k, v in f.items():
            if v is not None and x.get(k) != v:
                print(f"  {x['id']:26} {k}: {x.get(k)!r} -> {v!r}")
                x[k] = v
    json.dump(seed, open(SEED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"\nseed entries: {before} -> {len(seed)}")

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
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
