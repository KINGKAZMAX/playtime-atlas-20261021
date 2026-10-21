#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_unesco_verified.py — 生成 data/unesco-cn-verified.tsv。

数据来源：UNESCO 世界遗产中心**官方 GeoJSON 端点**，2026-10-21 实测取得：

    https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1

该端点返回中华人民共和国全部世界遗产条目的 `id_no`（官方编号）、正式英文名，
以及每条遗产的组成部分（`component_name`）。

背景：本机 curl / node 直连 whc.unesco.org 全部 TLS 失败（`scripts/verify_unesco.js`
对 27 个候选编号返回 27 条 UNREACHABLE，该失败日志保留在 research-ref/unesco-verified.tsv）。
因此改用 Agent 的 web_fetch 通道取得官方端点，核验方法与结果记录在本文件与
catalog.meta.json 的 unescoIdVerification 字段。

用法：python3 scripts/build_unesco_verified.py
"""
from __future__ import annotations

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 官方端点原样返回的 id_no → 正式英文名（2026-10-21 实测）
OFFICIAL = {
    437: "Mount Taishan",
    438: "The Great Wall",
    439: "Imperial Palaces of the Ming and Qing Dynasties in Beijing and Shenyang",
    440: "Mogao Caves",
    441: "Mausoleum of the First Qin Emperor",
    449: "Peking Man Site at Zhoukoudian",
    547: "Mount Huangshan",
    637: "Jiuzhaigou Valley Scenic and Historic Interest Area",
    638: "Huanglong Scenic and Historic Interest Area",
    640: "Wulingyuan Scenic and Historic Interest Area",
    703: "Mountain Resort and its Outlying Temples, Chengde",
    704: "Temple and Cemetery of Confucius and the Kong Family Mansion in Qufu",
    705: "Ancient Building Complex in the Wudang Mountains",
    707: "Historic Ensemble of the Potala Palace, Lhasa",
    778: "Lushan National Park",
    779: "Mount Emei Scenic Area, including Leshan Giant Buddha Scenic Area",
    811: "Old Town of Lijiang",
    812: "Ancient City of Ping Yao",
    813: "Classical Gardens of Suzhou",
    880: "Summer Palace, an Imperial Garden in Beijing",
    881: "Temple of Heaven: an Imperial Sacrificial Altar in Beijing",
    911: "Mount Wuyi",
    912: "Dazu Rock Carvings",
    1001: "Mount Qingcheng and the Dujiangyan Irrigation System",
    1002: "Ancient Villages in Southern Anhui – Xidi and Hongcun",
    1003: "Longmen Grottoes",
    1004: "Imperial Tombs of the Ming and Qing Dynasties",
    1039: "Yungang Grottoes",
    1083: "Three Parallel Rivers of Yunnan Protected Areas",
    1110: "Historic Centre of Macao",
    1111: "Cultural Landscape of Honghe Hani Rice Terraces",
    1112: "Kaiping Diaolou and Villages",
    1113: "Fujian Tulou",
    1114: "Yin Xu",
    1135: "Capital Cities and Tombs of the Ancient Koguryo Kingdom",
    1213: "Sichuan Giant Panda Sanctuaries - Wolong, Mt Siguniang and Jiajin Mountains",
    1248: "South China Karst",
    1279: "Mount Wutai",
    1292: "Mount Sanqingshan National Park",
    1305: "Historic Monuments of Dengfeng in “The Centre of Heaven and Earth”",
    1334: "West Lake Cultural Landscape of Hangzhou",
    1335: "China Danxia",
    1388: "Chengjiang Fossil Site",
    1389: "Site of Xanadu",
    1414: "Xinjiang Tianshan",
    1442: "Silk Roads: the Routes Network of Chang'an-Tianshan Corridor",
    1443: "The Grand Canal",
    1474: "Tusi Sites",
    1508: "Zuojiang Huashan Rock Art Cultural Landscape",
    1509: "Hubei Shennongjia",
    1540: "Qinghai Hoh Xil",
    1541: "Kulangsu, a Historic International Settlement",
    1559: "Fanjingshan",
    1561: "Quanzhou: Emporium of the World in Song-Yuan China",
    1592: "Archaeological Ruins of Liangzhu City",
    1606: "Migratory Bird Sanctuaries along the Coast of Yellow Sea-Bohai Gulf of China",
    1638: "Badain Jaran Desert - Towers of Sand and Lakes",
    1665: "Cultural Landscape of Old Tea Forests of the Jingmai Mountain in Pu'er",
    1714: "Beijing Central Axis: A Building Ensemble Exhibiting the Ideal Order of the Chinese Capital",
    1736: "Xixia Imperial Tombs",
    1765: "Jingdezhen Handicraft Porcelain Industry Sites",
}

# 本目录 catalog.json 实际引用到的编号 → 对应案例 id
USED_BY_CASES = {
    439: ["c09-forbidden-city-hall"],
    440: ["c20-dunhuang-mogao"],
    703: ["c12-chengde-resort"],
    705: ["c24-wudang-temples"],
    707: ["c38-potala-palace"],
    811: ["c32-lijiang-old-town"],
    812: ["c19-pingyao-ancient-city"],
    813: ["c13-suzhou-classical-gardens"],
    880: ["c11-summer-palace"],
    881: ["c10-temple-of-heaven-prayer-hall"],
    912: ["c22-dazu-rock-carvings"],
    1002: ["c15-hongcun-village", "c16-xidi-village"],
    1003: ["c21-longmen-grottoes"],
    1112: ["c18-kaiping-diaolou"],
    1113: ["c17-fujian-tulou"],
    1279: ["c02-foguang-east-hall"],
    1305: ["c23-shaolin-temple"],
    1334: ["c14-hangzhou-west-lake"],
    1442: ["c20-dunhuang-mogao"],
    1561: ["c41-luoyang-bridge"],
}

# 组成部分（component_name）——用于确认「某建筑是否属于该遗产的组成部分」
COMPONENTS = {
    1279: ["Taihuai", "Foguang Temple"],
    1305: ["Architectural Complex of Shaolin Temple (Kernel Compound, Chuzu Temple, Pagoda Forest)"],
    1561: ["Luoyang Bridge", "Anping Bridge", "Site of Shunji Bridge", "The Old City"],
    1002: ["Xidi", "Hongcun"],
    439: ["The Imperial Palace of the Ming and Qing Dynasties in Beijing",
          "The Imperial Palace of the Qing Dynasty in Shenyang"],
    912: ["Beishan Cliffside Carvings", "Baodingshan Cliffside Carvings", "Nanshan Cliffside Carvings",
          "Shizhuanshan Cliffside Carvings", "Shimenshan Cliffside Carvings"],
}


def main() -> int:
    catalog_path = os.path.join(ROOT, "catalog.json")
    with open(catalog_path, encoding="utf-8") as f:
        catalog = json.load(f)
    case_ids = {c["id"] for c in catalog["cases"]}

    # 交叉校验：本文件登记的引用必须与 catalog 实际一致
    problems = []
    for sid, cids in USED_BY_CASES.items():
        for cid in cids:
            if cid not in case_ids:
                problems.append(f"引用了不存在的案例：{cid}")
    for sid in USED_BY_CASES:
        if sid not in OFFICIAL:
            problems.append(f"编号 {sid} 不在官方名录内")
    if problems:
        for p in problems:
            print("ERROR:", p)
        return 1

    lines = [
        "# UNESCO 世界遗产中心 · 中华人民共和国条目官方编号映射",
        "# 来源端点：https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1",
        "# 取得方式：Agent web_fetch 通道（本机 curl / node 直连该域名 TLS 握手失败，见 research-ref/unesco-verified.tsv）",
        "# 取得时间：2026-10-21",
        "# 用途：校正本目录此前凭记忆填写的 UNESCO 编号；并确认「某建筑是否为该遗产的组成部分」",
        "#",
        "# 列说明：id_no<TAB>official_title_english<TAB>used_by_case_ids<TAB>components",
        "# used_by_case_ids 为空表示本目录未引用该条遗产",
        "",
    ]
    for sid in sorted(OFFICIAL):
        used = ",".join(USED_BY_CASES.get(sid, [])) or "-"
        comps = "; ".join(COMPONENTS.get(sid, [])) or "-"
        lines.append(f"{sid}\t{OFFICIAL[sid]}\t{used}\t{comps}")

    lines += [
        "",
        f"# 中国条目总数：{len(OFFICIAL)}",
        f"# 本目录引用：{len(USED_BY_CASES)} 条遗产，覆盖 {sum(len(v) for v in USED_BY_CASES.values())} 条案例",
        "",
    ]

    out = os.path.join(ROOT, "data", "unesco-cn-verified.tsv")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"data/unesco-cn-verified.tsv : {len(OFFICIAL)} 条官方条目 / 引用 {len(USED_BY_CASES)} 条遗产")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
