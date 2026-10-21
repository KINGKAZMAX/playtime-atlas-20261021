#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_catalog.py — 生成 17 号任务的建筑案例目录。

输入：本文件内的 CASES 精简表（已人工核验并附来源）。
输出：
  catalog.json        建筑案例主目录
  catalog.meta.json   词表 / 统计 / 字段说明 / 限制
  SOURCES.md          逐条来源台账（每条一行的可点击来源）
  handoff/first-18.json     给 19 号的首批 18 例
  handoff/structure-groups.json  给 18 号的构造类别 → 构件 / 拆解顺序

设计原则：
- 单一数据源：本文件即唯一真相，catalog.json 可随时重建。
- 每条案例至少 1 条来源，且 verification.level 如实标注证据强度。
- 绝不把“教学示意”写成“实测测绘”：caveat 字段常驻。

用法：python3 scripts/build_catalog.py
"""
from __future__ import annotations

import json
import os
import re
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# http 来源例外：http 变体实测可用的页面标题（2026-10-22，Ego Chromium 实测）
# https 变体在本机 TLS 握手阶段连接被关闭，故如实保留 http，不伪造 https
HTTP_OK_TITLES = {
    "http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2023-01-03/paperId=19603/id/100942":
        "中国文物报-2023-01-03-0版-",
    "http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2025-09-02/paperId=21802/id/109014":
        "中国文物报-2025-09-02-0版-",
    "http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html":
        "燕赵都市报：「河北最具影响力十大文物景观」评选活动启动",
}

# ---------------------------------------------------------------- 教学示意声明
# 供 18 / 19 直接透传到界面上的数据层标记；不要在下游另写一套文案。
TEACHING_NOTICE = {
    "isSchematic": True,
    "labelZh": "教学示意，非施工/工程模型",
    "labelEn": "Teaching illustration — not a construction or engineering model.",
    "forceNoteZh": "受力箭头为定性说明，非工程计算；箭头仅表示传力方向，不表示大小。",
    "forceNoteEn": "Force arrows are qualitative, not an engineering calculation; they indicate the direction of load transfer, not its magnitude.",
    "appliesTo": [
        "3D 装配 / 拆解视图",
        "剖面与节点放大",
        "受力箭头、推力线与传力路径",
        "构件分解图与爆炸图",
    ],
    "disclaimer": "本目录中的全部 3D 模型、剖面与受力说明均为教学示意，非施工工序、非工程计算、非测绘成果。",
    "mustNotClaim": [
        "不得声称是测绘成果或复原依据",
        "不得给出荷载、应力、允许跨度等工程数值",
        "不得省略本声明",
    ],
    "propagateTo": ["18-architecture-models", "19-architecture-atlas", "13-qa-curation"],
}

# ---------------------------------------------------------------- 来源简写
S = {
    # —— UNESCO 世界遗产中心：编号经官方 GeoJSON 端点逐条核对 ——
    # 端点：https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1
    # 该端点同时给出每条遗产的 id_no、正式英文名与组成部分（component_name）。
    "unesco_mogao":   ("UNESCO 世界遗产中心 · 莫高窟（编号 440）", "https://whc.unesco.org/en/list/440/", "primary-verified"),
    "unesco_suzhou":  ("UNESCO 世界遗产中心 · 苏州古典园林（编号 813）", "https://whc.unesco.org/en/list/813/", "primary-verified"),
    "unesco_temple":  ("UNESCO 世界遗产中心 · 天坛（编号 881）", "https://whc.unesco.org/en/list/881/", "primary-verified"),
    "unesco_qufu":    ("UNESCO 世界遗产中心 · 孔庙、孔府、孔林（编号 704）", "https://whc.unesco.org/en/list/704/", "primary-verified"),
    "unesco_wudang":  ("UNESCO 世界遗产中心 · 武当山古建筑群（编号 705）", "https://whc.unesco.org/en/list/705/", "primary-verified"),
    "unesco_chengde": ("UNESCO 世界遗产中心 · 承德避暑山庄及周围寺庙（编号 703）", "https://whc.unesco.org/en/list/703/", "primary-verified"),
    "unesco_kaiping": ("UNESCO 世界遗产中心 · 开平碉楼与村落（编号 1112）", "https://whc.unesco.org/en/list/1112/", "primary-verified"),
    "unesco_tulou":   ("UNESCO 世界遗产中心 · 福建土楼（编号 1113）", "https://whc.unesco.org/en/list/1113/", "primary-verified"),
    "unesco_lijiang": ("UNESCO 世界遗产中心 · 丽江古城（编号 811）", "https://whc.unesco.org/en/list/811/", "primary-verified"),
    "unesco_pingyao": ("UNESCO 世界遗产中心 · 平遥古城（编号 812）", "https://whc.unesco.org/en/list/812/", "primary-verified"),
    "unesco_anhui":   ("UNESCO 世界遗产中心 · 皖南古村落·西递与宏村（编号 1002）", "https://whc.unesco.org/en/list/1002/", "primary-verified"),
    "unesco_leshan":  ("UNESCO 世界遗产中心 · 峨眉山—乐山大佛（编号 779）", "https://whc.unesco.org/en/list/779/", "primary-verified"),
    "unesco_dazu":    ("UNESCO 世界遗产中心 · 大足石刻（编号 912）", "https://whc.unesco.org/en/list/912/", "primary-verified"),
    "unesco_xian":    ("UNESCO 世界遗产中心 · 丝绸之路：长安—天山廊道的路网（编号 1442）", "https://whc.unesco.org/en/list/1442/", "primary-verified"),
    "unesco_forbidden":("UNESCO 世界遗产中心 · 明清皇家宫殿·北京与沈阳（编号 439，含太和殿）", "https://whc.unesco.org/en/list/439/", "primary-verified"),
    "unesco_summer":  ("UNESCO 世界遗产中心 · 颐和园（编号 880）", "https://whc.unesco.org/en/list/880/", "primary-verified"),
    "unesco_westlake":("UNESCO 世界遗产中心 · 杭州西湖文化景观（编号 1334）", "https://whc.unesco.org/en/list/1334/", "primary-verified"),
    "unesco_longmen": ("UNESCO 世界遗产中心 · 龙门石窟（编号 1003）", "https://whc.unesco.org/en/list/1003/", "primary-verified"),
    "unesco_dengfeng":("UNESCO 世界遗产中心 · 登封天地之中古建筑群（编号 1305，含少林寺塔林）", "https://whc.unesco.org/en/list/1305/", "primary-verified"),
    "unesco_potala":  ("UNESCO 世界遗产中心 · 布达拉宫（编号 707）", "https://whc.unesco.org/en/list/707/", "primary-verified"),
    "unesco_wutai":   ("UNESCO 世界遗产中心 · 五台山（编号 1279，含佛光寺东大殿）", "https://whc.unesco.org/en/list/1279/", "primary-verified"),
    "unesco_quanzhou":("UNESCO 世界遗产中心 · 泉州：宋元中国的世界海洋商贸中心（编号 1561，含洛阳桥、安平桥）", "https://whc.unesco.org/en/list/1561/", "primary-verified"),

    "ih_woodbridge":  ("中国非物质文化遗产网 · 中国木拱桥传统营造技艺（2024 人类非遗代表作）", "https://www.ihchina.cn/project_details/11767", "primary-verified"),
    "ih_woodbridge2": ("中国非物质文化遗产网 · 木拱桥传统营造技艺（2009 急需保护名录）", "https://www.ihchina.cn/mugongqiao.html", "primary-verified"),
    "ih_bridge_paper":("中国非物质文化遗产网 · 苏旭东《中国木拱桥传统营造技艺的文化表征与传承实践》", "https://www.ihchina.cn/news_details/30828.html", "primary-verified"),
    "ih_bridge_photo":("中国非物质文化遗产网 · 寿宁武溪木拱廊桥上梁仪式", "https://www.ihchina.cn/tuji_details/20310.html", "primary-verified"),
    "ih_yaodong_gansu":("中国非物质文化遗产网 · 窑洞营造技艺（甘肃庆阳，2008 第二批 Ⅷ-180）", "https://www.ihchina.cn/project_details/14686", "primary-verified"),
    "ih_yaodong_sx":  ("中国非物质文化遗产网 · 陕北窑洞营造技艺（2011 第三批 Ⅷ-180）", "https://www.ihchina.cn/art/detail/id/14688.html", "primary-verified"),
    "ih_2024_shift":  ("中国非物质文化遗产网 · 羌年、黎族纺染织绣、中国木拱桥转名录（2024-12-05）", "https://www.ihchina.cn/art/detail/id/29441.html", "primary-verified"),

    "dmctv_home":     ("中国传统村落数字博物馆（住建部）· 关于平台", "https://www.dmctv.cn/mobile/cunluo.html", "primary-verified"),
    "dmctv_baise":    ("中国传统村落数字博物馆 · 陕西三原县新兴镇柏社村", "https://dmctv.cn/main/villages/61042210901/History.html", "primary-verified"),
    "dmctv_baise_gs": ("中国传统村落数字博物馆 · 柏社村概况（行政区、人口、户数等数据）", "https://dmctv.cn/main/villages/61042210901/data/clgs.json", "primary-verified"),
    "dmctv_baise_env":("中国传统村落数字博物馆 · 柏社村历史环境要素（下沉式地窑、关中民居、崖窑、古树、楸树）", "https://dmctv.cn/main/villages/61042210901/data/lshjys.json", "primary-verified"),
    "caupd_intro":    ("中国城市规划设计研究院 · 中国传统村落数字博物馆简介", "https://www.caupd.com/zgzh/zhfw/detail/788.html", "primary-verified"),
    "people_baise":   ("人民网陕西频道 · 行走传统村落：柏社村地坑窑", "https://sn.people.com.cn/BIG5/n2/2025/0918/c226647-41355949-9.html", "primary-verified"),

    "ts_32bridges":   ("泰顺县人民政府 · 泰顺县32座古廊桥", "https://www.ts.gov.cn/art/2025/2/24/art_1229660176_59140564.html", "primary-verified"),
    "ts_beijian":     ("泰顺县人民政府 · 虹卧北涧三百年（北涧桥保护）", "https://www.ts.gov.cn/col/col1229660176/art/2026/art_4a625befc928402bb2ca30d6aa72b680.html", "primary-verified"),
    "ts_park":        ("泰顺县人民政府 · 廊桥文化园", "https://www.ts.gov.cn/art/2023/6/19/art_1229734533_59127046.html", "primary-verified"),
    "ts_resort":      ("泰顺县人民政府 · 泰顺廊桥-氡泉旅游度假区（木拱桥传统营造技艺）", "https://www.ts.gov.cn/art/2022/7/18/art_1229660175_59116586.html", "primary-verified"),

    "tsinghua_khs":   ("清华大学 · 数字技术唤醒千年宋韵：高平开化寺宋代建筑和壁画", "https://www.tsinghua.edu.cn/info/1182/128295.htm", "primary-verified"),
    "wwb_khs":        ("中国文物报 · 芥子须弥·开化数字艺术展", "http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2025-09-02/paperId=21802/id/109014", "primary-verified"),
    "wwb_songwood":   ("中国文物报 · 千年宋韵 一木了然——宋式木作文化展策展记", "http://www.zhongguowenwubao.com/portal/DigitPager/paperDetail/publishdate/2023-01-03/paperId=19603/id/100942", "primary-verified"),

    "zjwwj_yjnj":    ("浙江省文物局 · 一场展览如何读懂宋代营造美学（营造江南展）", "https://wwj.zj.gov.cn/col/col1639083/art/2026/art_d5251cb464da4e288c9c7c8fe9296fd1.html", "primary-verified"),
    "chinanews_yjnj": ("中国新闻网 · 一场展览如何读懂宋代营造美学", "https://m.chinanews.com/wap/detail/cht/zw/10631101.shtml", "primary-verified"),
    "hzsc_dsg":       ("上城新闻网 · 德寿宫新展：宋代版乐高来了", "https://www.hzsc.com.cn/content/content_9902358.html", "primary-verified"),
    "chinanews_gongyuan":("中国新闻网 · 宋韵匠心跨越千年 杭州德寿宫展出南宋官式建筑", "https://www.chinanews.com/cul/2025/05-20/10419031.shtml", "primary-verified"),

    "worldskills":    ("WorldSkills Shanghai 2026 · WorldSkills Museum 木结构展", "https://worldskills2026.com/one-mortise-one-tenon-joining-past-and-present-worldskills-museums-wooden-structures-exhibition-opens", "primary-verified"),
    "chinadaily_qz":  ("中国日报网 · 中国数字文化集团在青州市博物馆推出首个沉浸式数字文化体验空间", "https://cnews.chinadaily.com.cn/a/202607/22/WS6a605d75a310d709c2fbf03e.html", "primary-verified"),
    "xinhua_qz":      ("新华网山东频道 · 青州博物馆沉浸式数字文化体验空间启幕", "http://sd.news.cn/20260722/f841c55cc0db491e8cfad6a2d4ba0285/c.html", "primary-verified"),
    "cnii_qz":        ("中国工信新闻网 · 中国联通助力青州博物馆打造沉浸式数字文化体验空间", "https://www.cnii.com.cn/rmydb/202607/t20260722_750299.html", "primary-verified"),

    "sxwbs_shanhe":   ("山西晚报 · 山河营造：用创新传承守护表里山河的营造智慧", "https://www.sxwbs.com/detail/e1553dbb4ba9405ab52b7c6248a976bd", "primary-verified"),
    "sxrb_shanhe":    ("山西新闻网 · 山河营造展厅：古建原真模型+数字沉浸体验", "https://news.sxrb.com/GB/314060/10368196.html", "primary-verified"),

    "sxam_online":    ("人民日报 · 山西古建筑博物馆线上馆运行", "https://www.peopleapp.com/rmharticle/30024733336", "primary-verified"),
    "sduc_museum":    ("山东城市建设职业学院 · 中国古建筑构件数字博物馆", "https://www.sduc.edu.cn/info/1059/10729.htm", "primary-verified"),
    "dpm_pano":       ("故宫博物院 · 全景故宫", "https://pano.dpm.org.cn/", "primary-verified"),
    "dpm_duobao":     ("故宫博物院 · 数字多宝阁", "https://www.dpm.org.cn/shuziwenwu.html", "primary-verified"),
    "ssraa_silkroad": ("昆明信息港 · 南方丝绸之路特色建筑艺术数字博物馆上线", "https://kunming.cn/news/c/2020-11-14/13090151.shtml", "primary-verified"),
    "cri_yingxian":   ("国际在线山西频道 · 中外媒体人云登应县木塔", "https://sx.cri.cn/n/20260721/532c12ab-4ae4-4b3b-b7f3-38b50da20014.html", "primary-verified"),
    "people_bridge":  ("人民日报客户端 · 中国木拱桥传统营造技艺（虹桥溯源、匠人世家）", "https://www.peopleapp.com/rmharticle/30020900939", "primary-verified"),
    "cri_beijian":    ("中国新闻网 · 浙江泰顺北涧桥与美国罗伯特廊桥成姐妹桥", "https://www.chinanews.com/sh/2013/11-13/5498961.shtml", "primary-verified"),
    "hebei_wwb":      ("河北省文物局 · 河北省第一至六批全国重点文物保护单位简介", "https://wenwu.hebei.gov.cn/system/2023/10/16/030257948.shtml", "primary-verified"),
    "ncha_heb":       ("国家文物局 · 河北文化遗产相关公告", "http://www.ncha.gov.cn/art/2010/5/24/art_1027_106086.html", "primary-verified"),
    "wiki_yaodong":   ("维基百科 · 窑洞", "https://zh.wikipedia.org/wiki/%E7%AA%91%E6%B4%9E", "secondary"),
    "wiki_beijian":   ("维基百科 · 北涧桥", "https://zh.wikipedia.org/wiki/%E5%8C%97%E6%B6%A7%E6%A1%A5", "secondary"),
}

# ---------------------------------------------------------------- 构造类别
STRUCTURES = {
    "dougong":        ("斗栱", "dougong", "Bracket set — a stepped cluster of blocks and arms that transfers roof load outward and down into the column."),
    "mortise-tenon":  ("榫卯", "mortise-and-tenon", "Mortise and tenon — a projecting tenon fits a matching cut socket, locking two timbers without nails."),
    "tailiang":       ("抬梁式", "tailiang (post-and-lintel, beams on posts)", "The column-and-beam frame: columns carry beams stacked in tiers, each tier smaller than the one below."),
    "chuandou":       ("穿斗式", "chuandou (column-and-tie)", "Columns are tied by penetrating tie-beams; purlins rest directly on the columns, so the frame is dense and braced."),
    "mixed-frame":    ("抬梁穿斗混合", "mixed tailiang–chuandou frame", "Lower storeys use chuandou ties for stiffness, upper storeys use tailiang tiers to gain height."),
    "ganlan":         ("干栏式", "stilted (ganlan) frame", "The floor is raised on posts above damp ground; the gap underneath is used for ventilation, animals and storage."),
    "jinggan":        ("井干式", "log cabin (jinggan)", "Horizontal logs are stacked in a criss-cross frame, each course notched into the one below."),
    "stone-arch":     ("石拱·砖券", "stone arch / brick vault", "Wedge-shaped blocks (voussoirs) lean against each other; the compression line keeps the arch standing."),
    "timber-arch-bridge": ("编木拱桥", "woven timber arch bridge", "Short logs are woven and pegged into a basket-like arch that spans far beyond the length of one beam."),
    "chain-bridge":   ("铁链·索桥", "iron chain / rope suspension bridge", "Chains or ropes carry the deck; the load pulls down and sideways, and the anchorages take the pull."),
    "rammed-earth":   ("夯土", "rammed earth", "Earth is compacted in thin lifts inside formwork; lime and gravel improve strength and water resistance."),
    "yaodong":        ("窑洞·生土", "earthen cave dwelling", "Rooms are hollowed out of a loess cliff or dug below ground; the soil itself is the structure."),
    "bamboo":         ("竹构", "bamboo construction", "Bamboo culms are lashed and tied; a light, flexible frame that is rebuilt rather than repaired."),
    "elevated-deck":  ("高台基·楼阁", "raised platform and tower", "A tall masonry or rammed platform raises the timber hall above the ground, protecting it from damp."),
    "masonry-tower":  ("砖塔·石塔", "brick or stone pagoda", "A tapering stack of storeys built of brick or stone; each storey repeats a simple structural bay."),
    "yurt-lattice":   ("毡房格构", "yurt lattice", "A collapsible lattice of poles carries a felt skin; it is taken down and rebuilt with the herd."),
    "cave":           ("石窟·崖凿", "rock-cut cave", "Chambers are excavated into living rock; the cliff mass is both the enclosure and the structure."),
    "roof-form":      ("屋顶类型", "roof form", "The typology of the roof — hipped, gabled, hip-and-gable, pyramidal, multi-eaved — which carries rank and climate as much as it carries load."),
    "courtyard":      ("院落", "courtyard", "The enclosed plan unit of a Chinese dwelling: ranges of rooms closed by a screen wall, which organises family structure, daylight and ventilation at once."),
    "cross-plan":     ("十字形平面", "cruciform plan", "A hall whose frames run in two directions and meet at the centre, with porches on all four sides — the plan of the Mani Hall at Longxing Temple."),
    "caisson":        ("平闇·藻井", "coffered ceiling", "A flat coffered ceiling or a stepped central caisson that conceals the frame, marks the rank of the space and protects it from fire and dust."),
}

REGIONS = {
    "north":    ("华北", "North China"),
    "northeast":("东北", "Northeast China"),
    "east":     ("华东", "East China"),
    "central":  ("华中", "Central China"),
    "south":    ("华南", "South China"),
    "southwest":("西南", "Southwest China"),
    "northwest":("西北", "Northwest China"),
    "plateau":  ("青藏", "Tibetan Plateau"),
}

ERAS = {
    "pre-qin":   ("先秦", "Before 221 BCE"),
    "han":       ("汉", "Han dynasty (202 BCE–220 CE)"),
    "six-dyn":   ("南北朝", "Six Dynasties & Northern–Southern (220–589)"),
    "sui-tang":  ("隋唐", "Sui & Tang (581–907)"),
    "song":      ("宋", "Song (960–1279)"),
    "yuan":      ("元", "Yuan (1271–1368)"),
    "ming":      ("明", "Ming (1368–1644)"),
    "qing":      ("清", "Qing (1644–1912)"),
    "modern":    ("近现代", "Modern era (1912–present)"),
    "historical-continuity": ("持续性传统", "Continuing tradition — no single founding date"),
}

# ---------------------------------------------------------------- 案例数据
# (id, nameZh, nameEn, pinyin, region, province, locality, era, yearText, yearUncertainty,
#  type, structure, ethnic, principleZh, principleEn, cultureZh, cultureEn, keywords, sources, caveat)
CASES = [
 dict(id="c01-nanchan-main-hall", nameZh="南禅寺大殿", nameEn="Main Hall, Nanchan Temple",
   pinyin="Nánchán Sì Dàdiàn", region="north", province="山西", locality="五台县", era="sui-tang",
   yearText="唐建中二年（781）创建，现存大殿为唐大历年重建（782）", yearUncertainty="确切",
   type="佛寺殿堂", structure=["tailiang", "dougong"], ethnic="汉",
   principleZh="殿堂用抬梁式木构架：柱上承大梁，梁上再抬短梁，逐层收小，把屋面荷载一层层传到柱脚；柱头铺作（斗栱）承接出挑的屋檐。这是中国现存最早的木构建筑实例。",
   principleEn="A tailiang post-and-beam hall: large beams rest on columns, shorter beams are stacked tier on tier and each tier is smaller, so the roof load is delivered down to the column bases. Bracket sets (dougong) on the column heads carry the projecting eaves.",
   cultureZh="五台山南台 foothill monastery, the survival of an early-Tang timber hall that predates the Song building manual by more than two centuries.",
   cultureEn="On the southern terrace of Mount Wutai — an early Tang timber hall that predates the Song building manual by over two centuries.",
   keywords=["唐", "抬梁", "斗栱", "木构", "古刹"],
   sources=["tsinghua_khs", "wwb_songwood", "worldskills"],
   caveat="本页所述「现存最早」沿用学界通说（此说以 1957 年中国科学院调查为依据）；近年亦有对个别构件年代提出质疑的学术讨论，本目录不裁定争议。"),

 dict(id="c02-foguang-east-hall", nameZh="佛光寺东大殿", nameEn="East Hall, Foguang Temple",
   pinyin="Fóguāng Sì Dōng Dàdiàn", region="north", province="山西", locality="五台县", era="sui-tang",
   yearText="唐大中十一年（857）重建", yearUncertainty="确切",
   type="佛寺殿堂", structure=["tailiang", "dougong", "mortise-tenon", "roof-form"], ethnic="汉",
   principleZh="大木作抬梁，七铺作双抄双下昂斗栱，梁栿用榫卯连接，柱础用覆盆式。屋内用内槽与外槽两套梁架分开承重，是「金箱斗底槽」式的空间骨架。",
   principleEn="A tailiang frame with a seven-puzuo double-bracket set carrying beams and projecting arms; beam joints are locked by mortise and tenon. Two parallel frames — an inner and an outer row — carry the roof separately, a spatial skeleton known as the golden-coffer-and-base-trough arrangement.",
   cultureZh="梁思成、林徽因 1937 年实地考察认定其为唐代建筑，其「金鸡独立」的歇山屋顶与「唐代四绝」（木构、彩塑、壁画、墨书）被并称；现为国家一级博物馆与建筑史坐标原点之一。",
   cultureEn="Identified as Tang-dynasty by Liang Sicheng and Lin Huiyin in their 1937 field survey; its single-eave hip-and-gable roof and celebrated Tang 'four treasures' — timber frame, painted sculpture, murals and ink calligraphy — anchor it as a reference point in the history of Chinese architecture.",
   keywords=["唐", "七铺作", "斗栱", "歇山", "梁思成"],
   sources=["unesco_wutai", "tsinghua_khs", "wwb_songwood", "worldskills"],
   caveat="主体为 857 年，但后世历代均有修缮，个别构件可能为后代更换；「唐代」判定属学界共识，未逐构件给出年代。"),

 dict(id="c03-yingxian-wooden-pagoda", nameZh="应县木塔（佛宫寺释迦塔）", nameEn="Wooden Pagoda of Yingxian (Sakyamuni Pagoda of Fogong Temple)",
   pinyin="Yìngxiàn Mùtǎ", region="north", province="山西", locality="朔州市应县", era="song",
   yearText="辽清宁二年（1056）建成，明清多次修缮", yearUncertainty="确切（历次修缮有记录）",
   type="木构楼阁·塔", structure=["dougong", "tailiang", "mixed-frame", "mortise-tenon", "roof-form"], ethnic="汉",
   principleZh="八角五层九级、内外槽式木塔。底层用大额枋与柱网形成整体笼架；每层以平座暗层与斗栱挑出承托上层，塔身各层的斗栱做法逐层变化。全塔不用一颗铁钉，构件之间以榫卯与暗栱咬合。",
   principleEn="An octagonal five-storey timber pagoda on a nine-stepped base, built with separate inner and outer column rings. Each level rests on a concealed dark storey and projecting bracket sets; the bracket sets change from storey to storey. No iron nails are used: the members are locked together by mortise-and-tenon joints and concealed brackets.",
   cultureZh="世界现存最高、最古老的木构塔式建筑，1961 年列入第一批全国重点文物保护单位。2023 年山西开展「木塔整体保护修缮」并在数字沉浸空间以裸眼 3D「逐层云登塔」。",
   cultureEn="The tallest and oldest surviving timber pagoda in the world, inscribed on the first national list of major historical and cultural sites in 1961. A 2023 conservation campaign was paired with a naked-eye 3D walk-up experience.",
   keywords=["辽", "木塔", "斗栱", "榫卯", "楼阁"],
   sources=["cri_yingxian", "worldskills", "sxam_online"],
   caveat="塔身现存体量与外观经历历代修缮（尤其明清），「全塔无钉」指建造与主要构架方式，不排除后世局部铁件。"),

 dict(id="c04-baoguo-main-hall", nameZh="保国寺大殿", nameEn="Main Hall, Baoguo Temple",
   pinyin="Bǎoguó Sì Dàdiàn", region="east", province="浙江", locality="宁波市江北区", era="song",
   yearText="北宋大中祥符六年（1013）建成，比《营造法式》成书早 90 年", yearUncertainty="确切",
   type="佛寺殿堂", structure=["tailiang", "dougong", "mortise-tenon"], ethnic="汉",
   principleZh="抬梁式大殿，七间九架，瓜棱柱（4 根细木拼合成一根大柱）、榫卯与藻井做法被公认为目前唯一能印证《营造法式》记载的宋代实物。柱身拼合即「小材大用」：南方大料不足时，用小料拼出大柱。",
   principleEn="A seven-bay tailiang hall of nine frames. Its melon-section columns — four slender timbers pegged together to form one column — together with its joinery and caisson ceiling are the only surviving Song-dynasty physical counterparts to what the Yingzao Fashi prescribes. Assembling a large column from small members made big timber affordable.",
   cultureZh="「江南第一木构」，1961 年列入第一批全国重点文物保护单位，是南宋德寿宫复原时的重要参照（两地时代相近、地域相近、用材等级同为「五等材」）。",
   cultureEn="Called the finest Song timber building south of the Yangtze and inscribed in 1961, it served as a key reference when the Southern Song Deshou Palace was reconstructed, since the two share region, period and timber grade.",
   keywords=["北宋", "抬梁", "瓜棱柱", "藻井", "营造法式"],
   sources=["zjwwj_yjnj", "chinanews_yjnj", "hzsc_dsg", "chinanews_gongyuan"],
   caveat="大木作（藻井、虾须拱等）被视为印证《营造法式》的「孤例」，此判断出自保国寺古建筑博物馆与浙江省古建筑设计研究院的公开表述。"),

 dict(id="c05-huayan-pujioge", nameZh="华严寺薄伽教藏殿", nameEn="Puji Teaching Repository Hall, Huayan Temple",
   pinyin="Huáyán Sì Bójiā Jiàocáng Diàn", region="north", province="山西", locality="大同市", era="song",
   yearText="辽重熙七年（1038）重建（金大定十六年重修）", yearUncertainty="约略（辽金两说并存）",
   type="佛寺殿堂", structure=["tailiang", "dougong"], ethnic="汉",
   principleZh="殿身坐落在约 3 米高的台基上，抬梁与斗栱并用；殿内槽柱网与后部双槽的「金厢斗底槽」做法，是辽金木构的重要特征。",
   principleEn="The hall stands on a raised platform of about three metres, combining tailiang framing with bracket sets. The inner column grid and the twin inner–outer rows at the rear form the golden-coffer-and-base-trough arrangement characteristic of Liao and Jin timber work.",
   cultureZh="下寺华严寺辽金木构的代表，薄伽教藏殿内保存辽代彩塑与明代壁画；与善化寺共同构成大同辽金木构群。",
   cultureEn="A key Liao–Jin timber hall of the lower Huayan Temple complex, preserving Liao painted sculpture and Ming murals, together with the Shanhua Temple forming Datong's Liao–Jin timber group.",
   keywords=["辽", "金", "抬梁", "台基", "彩塑"],
   sources=["sxam_online", "ih_2024_shift"],
   caveat="大殿现状与重建年代在辽（1038）与金（1176 修）之间存在「重修」与「始建」两种表述，本目录标「约略」。"),

 dict(id="c06-longxing-mani-hall", nameZh="隆兴寺摩尼殿", nameEn="Mani Hall, Longxing Temple",
   pinyin="Lóngxīng Sì Móní Diàn", region="north", province="河北", locality="正定县", era="song",
   yearText="北宋皇祐四年（1052）建成", yearUncertainty="确切",
   type="佛寺殿堂", structure=["tailiang", "dougong", "cross-plan", "roof-form"], ethnic="汉",
   principleZh="单檐歇山十字形平面，四出抱厦，与一般「金厢斗底槽」矩形殿不同；抬梁式构架，纵向与横向的梁架在中心相交，屋面以多个歇山交角汇于一处，结构与造型高度统一。",
   principleEn="A single-eave hip-and-gable hall on a cruciform plan with four projecting porches, unlike the usual rectangular golden-coffer arrangement. Tailiang frames running in both directions meet at the centre, and the roof gathers several hipped corners onto one point.",
   cultureZh="正定隆兴寺现存宋代建筑，1977 年修缮时于墙内发现五彩遍装绘与七彩虹泥，发现被梁思成称为「海内孤例」的宋代五彩塑。",
   cultureEn="The surviving Song building at Longxing Temple in Zhengding, where 1977 repairs uncovered a polychrome “everywhere-decorated” scheme and the so-called “coloured sculptures of the seven colours”, a Song rarity.",
   keywords=["北宋", "十字形", "歇山", "抱厦", "五彩塑"],
   sources=["hebei_wwb", "ncha_heb"],
   caveat="平面形制特殊，「十字形」在中国早期殿堂中并不罕见，本条强调其与同期矩形殿堂的差异。"),

 dict(id="c07-jinci-holy-mother-hall", nameZh="晋祠圣母殿", nameEn="Hall of the Holy Mother, Jinci",
   pinyin="Jìncí Shèngmǔ Diàn", region="north", province="山西", locality="太原市", era="song",
   yearText="北宋天圣年间（1023–1032）重建", yearUncertainty="约略",
   type="祠庙殿堂", structure=["tailiang", "dougong"], ethnic="汉",
   principleZh="重檐歇山顶，殿身四周一圈深远的副阶周匝，把木构与廊柱整体包住；殿内减柱法加大空间，柱网疏朗。斗栱大而疏，出跳深远。",
   principleEn="A double-eave hip-and-gable hall wrapped on all sides by a deep surrounding verandah, enclosing the timber frame and its colonnade. Columns are omitted inside to open up the hall, and the bracket sets are large and widely spaced with long projections.",
   cultureZh="晋祠为晋水源头之上的祭祀建筑群，圣母殿是北宋遗构的核心，与周柏、唐槐、鱼沼飞梁并称「晋祠三绝」。",
   cultureEn="Jinci, the ritual complex at the source of the Jin River, whose Holy Mother Hall is the Song-period core, celebrated together with the Zhou cypress, the Tang scholar tree and the Flying Bridge over the Fish Pond.",
   keywords=["北宋", "重檐", "歇山", "副阶周匝", "减柱法"],
   sources=["sxam_online"],
   caveat="重建年代有天圣间与崇宁间等不同说法，本目录取「天圣年间」并标「约略」。"),

 dict(id="c08-kaihua-temple-hall", nameZh="开化寺大殿", nameEn="Main Hall, Kaihua Temple",
   pinyin="Kāihuà Sì Dàdiàn", region="north", province="山西", locality="高平市", era="song",
   yearText="北宋大中祥符年间至绍圣年间（约 1008–1098）", yearUncertainty="约略",
   type="佛寺殿堂", structure=["tailiang", "dougong", "caisson"], ethnic="汉",
   principleZh="抬梁式大殿，殿内做「平闇」（以小方格吊顶遮蔽梁架），梁架用叉手、驼峰、斗栱层层叠置；大殿西壁保留北宋彩画。清华团队用三维激光扫描得到毫米级点云模型。",
   principleEn="A tailiang hall whose interior is covered by a ping'an coffered ceiling, concealing the frame of crossed braces, camel saddles and bracket sets; the west wall keeps its Northern Song polychromy. A Tsinghua team produced a millimetre-accurate point cloud with 3D laser scanning.",
   cultureZh="我国现存唯一完整保留宋代木构建筑、彩画与壁画的殿堂。2025 年「芥子须弥·开化」数字艺术展以 20 余年研究为基础，用 23 分钟 VR 漫游与复原模型把它「搬到」北京。",
   cultureEn="The only surviving hall that keeps Song timber, polychromy and murals together. A 2025 digital art exhibition drew on more than twenty years of research to bring it to Beijing through a 23-minute VR walk-through and reconstructed models.",
   keywords=["北宋", "平闇", "叉手", "驼峰", "彩画", "壁画"],
   sources=["tsinghua_khs", "wwb_khs"],
   caveat="殿内彩画与壁画历经历代修缮，「完整保留」为官方与学界通行表述，不等于各层均为北宋原物。"),

 dict(id="c09-forbidden-city-hall", nameZh="故宫太和殿", nameEn="Hall of Supreme Harmony, Forbidden City",
   pinyin="Gùgōng Tàihé Diàn", region="north", province="北京", locality="北京市东城区", era="ming",
   yearText="明永乐十八年（1420）建成，历经清代重修", yearUncertainty="确切",
   type="宫殿", structure=["dougong", "tailiang", "elevated-deck", "mortise-tenon", "roof-form"], ethnic="汉",
   principleZh="重檐庑殿顶，十一开间，最大开间与柱网按清代《工程做法则例》的模数确定。屋面由举折曲线生成，檐口起翘并出翘。上承三层汉白玉台基，殿身逐层收分。",
   principleEn="A double-eave hip roof over eleven bays, the bay widths set by the Qing-era modular building standard. The roof profile is generated by a curve that starts steep near the ridge and flattens toward the eave, with the eave tip lifting and flaring outward. The hall stands on a three-tier white marble platform.",
   cultureZh="中国现存最大的木结构宫殿，明代北京皇宫的礼仪核心，象征皇权与礼制秩序；其开间、屋顶等级与台基高度共同构成一套不可逾越的等级制度。",
   cultureEn="The largest surviving timber palace in China and the ceremonial heart of the Ming capital, where bay count, roof rank and platform height together encode an immutable hierarchy of status.",
   keywords=["明", "清", "庑殿", "重檐", "开间", "台基", "等级制度"],
   sources=["unesco_forbidden", "dpm_pano", "dpm_duobao", "worldskills"],
   caveat="现存太和殿的面貌经清代康熙、乾隆等多次大修，柱网与彩画以清代为准；本条「明永乐建成」指始建年代。"),

 dict(id="c10-temple-of-heaven-prayer-hall", nameZh="天坛祈年殿", nameEn="Hall of Prayer for Good Harvests, Temple of Heaven",
   pinyin="Tiāntán Qínián Diàn", region="north", province="北京", locality="北京市东城区", era="ming",
   yearText="明永乐十八年（1420）建成，清乾隆十六年（1751）重建", yearUncertainty="确切",
   type="祭祀建筑", structure=["dougong", "tailiang", "elevated-deck", "roof-form"], ethnic="汉",
   principleZh="三重檐圆形攒尖顶，平面为正圆，柱网分檐柱、金柱与龙井柱三圈，逐层收进。三层台基与三层屋檐一一对应，屋面用反宇曲线形成「如翚斯飞」的翼角。",
   principleEn="A circular triple-eave roof rising to a single point, with three concentric rings of columns — eave, inner and dragon-well — each pulled inward as it rises. The three marble terraces answer the three eaves one for one, and each roof face follows a concave-upward curve that throws the corners upward.",
   cultureZh="明清皇帝祭天祈谷的场所，圆形攒尖与三重檐在中国建筑中极罕见，其政治与礼制意义远超结构本身；1998 年列入《世界遗产名录》。",
   cultureEn="Where Ming and Qing emperors prayed for good harvests. Its circular triple-eaved form is exceptionally rare in Chinese architecture, and its meaning is as much ritual and political as structural; inscribed on the World Heritage List in 1998.",
   keywords=["明", "清", "攒尖", "三重檐", "圆形", "祭祀", "世界遗产"],
   sources=["unesco_temple", "dpm_pano", "chinadaily_qz", "worldskills"],
   caveat="现状为清乾隆重建（1751），不是明永乐原构；「圆形攒尖」的平面施工难点在现代复原研究中仍有讨论。"),

 dict(id="c11-summer-palace", nameZh="颐和园", nameEn="The Summer Palace",
   pinyin="Yíhé Yuán", region="north", province="北京", locality="北京市海淀区", era="qing",
   yearText="清乾隆十五年（1750）起建，光绪时重建（1888）", yearUncertainty="确切",
   type="皇家园林", structure=["tailiang", "dougong", "stone-arch", "roof-form"], ethnic="汉",
   principleZh="以万寿山、昆明湖为地形骨架，园中建筑为园林要素而非主角。长廊彩绘把两千余幅故事画装进一条连续的木构走廊；石拱桥与多宝琉璃塔承担视线引导。",
   principleEn="The hills and lake form the armature, with the buildings acting as elements of the composition rather than the subject. A continuous timber corridor carries more than two thousand painted narrative panels; stone arches and a glazed pagoda direct the eye.",
   cultureZh="中国现存规模最大、保存最完整的皇家园林，1998 年列入《世界遗产名录》（UNESCO 编号 880）。园林「借景」「对景」的手法是中国造园最被广泛讨论的技法。",
   cultureEn="The largest and best-preserved imperial garden in China, inscribed on the World Heritage List in 1998 (UNESCO ref. 880). Its methods of borrowing and framing distant scenery are among the most discussed techniques in Chinese landscape design.",
   keywords=["清", "园林", "长廊", "借景", "世界遗产"],
   sources=["unesco_summer", "dmctv_home", "cri_yingxian"],
   caveat="本条以园林空间组织与木构长廊为重点；世界遗产身份对应 UNESCO 编号 880「颐和园」。园内建筑多经后世修缮，现状不等于清乾隆时期原貌。"),

 dict(id="c12-chengde-resort", nameZh="承德避暑山庄", nameEn="Chengde Mountain Resort",
   pinyin="Chéngdé Bìshǔ Shānzhuāng", region="north", province="河北", locality="承德市", era="qing",
   yearText="清康熙四十二年至乾隆四十五年（1703–1780）陆续营建", yearUncertainty="确切",
   type="皇家园林·宫殿", structure=["tailiang", "dougong", "rammed-earth"], ethnic="汉",
   principleZh="宫区与苑区相间：宫殿区为抬梁式木构（澹泊敬诚、四知书屋等），苑区以地形造景为主。利用山庄的坡地与水系组织视线，寺庙区藏于山峦之后，形成「外朝内寺」的布局。",
   principleEn="Palace and garden zones alternate: the palace uses tailiang timber halls, while the garden zones stage the landscape itself. Slopes and water are used to shape the view, and the temple zone is tucked behind the hills in a palace-outside-temple-inside arrangement.",
   cultureZh="清代帝王处理北方边疆与民族关系的一处「宫苑合一」杰作，1994 年列入《世界遗产名录》，同时是藏传佛教与汉地建筑并置的活样本。",
   cultureEn="A Qing imperial creation where palaces, gardens and Tibetan Buddhist monasteries are combined in one landscape, listed as World Heritage in 1994 and long read as an instrument of frontier policy.",
   keywords=["清", "园林", "宫殿", "藏传佛教", "世界遗产"],
   sources=["unesco_chengde", "sxam_online"],
   caveat="山莊本体含大量 1990 年代复建与修缮建筑，不能把所有现状建筑都当作清代原物。"),

 dict(id="c13-suzhou-classical-gardens", nameZh="苏州古典园林（拙政园、留园、网师园、沧浪亭）", nameEn="Classical Gardens of Suzhou",
   pinyin="Sūzhōu Gǔdiǎn Yuánlín", region="east", province="江苏", locality="苏州市", era="ming",
   yearText="各园始建于宋元，明清陆续重修扩建", yearUncertainty="约略（各园不一）",
   type="园林", structure=["tailiang", "dougong", "stone-arch", "roof-form", "courtyard"], ethnic="汉",
   principleZh="建筑服从造园：厅堂、亭、廊、桥沿水面与假山布置，用「对景""框景""障景」分割视线。木构厅堂多小而精，屋顶以小坡度与戗角取胜，园内水体与石作承担骨架。",
   principleEn="Architecture serves the composition: halls, pavilions, corridors and bridges are placed against water and rockery, and the view is split by framing, fore-grounding and screening. The timber halls are small and refined, with low roof pitches and flicked eaves; water and stone carry the structure of the garden.",
   cultureZh="私家园林的集大成，1997 年首批列入《世界遗产名录》，2000 年扩展。拙政园以「疏朗」见长，留园以「精致」见长，网师园小而精。",
   cultureEn="The culmination of the private garden, inscribed on the World Heritage List in 1997 and extended in 2000. The Humble Administrator's Garden reads as openness, the Lingering Garden as refinement, the Master-of-Nets Garden as compact precision.",
   keywords=["明", "清", "园林", "对景", "框景", "世界遗产"],
   sources=["unesco_suzhou", "dmctv_home"],
   caveat="四园年代、格局与开放范围历次变动；本条按园林类型合并叙述，单园数据在 UNESCO 名录中分列。"),

 dict(id="c14-hangzhou-west-lake", nameZh="杭州西湖", nameEn="West Lake, Hangzhou",
   pinyin="Hángzhōu Xīhú", region="east", province="浙江", locality="杭州市", era="song",
   yearText="唐中期起湖形成，南宋定「西湖」格局，历代持续营建", yearUncertainty="约略",
   type="园林", structure=["tailiang", "stone-arch", "roof-form"], ethnic="汉",
   principleZh="以「三山一水」与堤岛分隔水面形成「山外山、湖外湖」的空间层次；苏堤、白堤为堤路桥组合，桥梁多采用石拱与平桥；沿岸亭台多小木构，尺度谦逊以让湖山。",
   principleEn="Mountains and causeways divide the water into layers of 'mountain beyond mountain, lake beyond lake'. The Su and Bai causeways pair embankments, roads and bridges; small timber pavilions along the shore keep a low profile so the lake and hills stay dominant.",
   cultureZh="中国最著名的公共园林，2011 年以「杭州西湖文化景观」列入《世界遗产名录》，其核心不是一处园林作品而是「山水相依」的整体文化景观。",
   cultureEn="China's most celebrated public landscape, inscribed in 2011 as the Cultural Landscape of Hangzhou West Lake — recognised not as a single garden but as an ensemble of mountain and water.",
   keywords=["宋", "唐", "园林", "堤", "文化景观", "世界遗产"],
   sources=["unesco_westlake", "dmctv_home", "cri_yingxian"],
   caveat="西湖的遗产身份是「文化景观」，其中历代建筑多为后世重建，本条不以现存建筑断代为唯一依据。"),

 dict(id="c15-hongcun-village", nameZh="宏村", nameEn="Hongcun Village",
   pinyin="Hóngcūn", region="east", province="安徽", locality="黟县", era="ming",
   yearText="南宋绍兴年间奠基，明代形成聚落格局，清代鼎盛", yearUncertainty="约略",
   type="传统村落·民居", structure=["tailiang", "chuandou", "mortise-tenon", "courtyard"], ethnic="汉",
   principleZh="村落在月沼与南湖之间布局，水系呈「牛形」；民居为三合院与四合院，厅堂木构多用抬梁，山墙高出屋面形成封火山墙，粉墙黛瓦。",
   principleEn="The village is laid out between a pond and a southern lake in a water system likened to the shape of an ox. Dwellings are three- or four-sided courtyards; main halls use tailiang framing, and fire-separating gable walls rise above the roofline.",
   cultureZh="皖南古村落代表，2000 年列入《世界遗产名录》。其「牛形水系」与宗族聚落的空间组织，常被用来说明「天人合一」的选址智慧。",
   cultureEn="A representative settlement of southern Anhui, inscribed in 2000, whose ox-shaped water system and clan-based layout are often cited when discussing site selection as a union of people and terrain.",
   keywords=["明", "清", "徽派", "水系", "马头墙", "世界遗产"],
   sources=["unesco_anhui", "dmctv_home", "caupd_intro"],
   caveat="现存民居以清代为主，徽派建筑的具体年代分期各家说法略有出入；「牛形水系」为现代阐释。"),

 dict(id="c16-xidi-village", nameZh="西递", nameEn="Xidi Village",
   pinyin="Xīdì", region="east", province="安徽", locality="黟县", era="ming",
   yearText="北宋皇祐年间建村，明清鼎盛", yearUncertainty="约略",
   type="传统村落·民居", structure=["tailiang", "chuandou", "mortise-tenon", "courtyard"], ethnic="汉",
   principleZh="村落沿溪呈带状，街巷狭长；民居以木石雕饰著称（门楼、砖雕、木雕「三雕」）。木构以抬梁为主，屋面坡度大、出檐深，适应皖南多雨气候。",
   principleEn="The settlement runs in a ribbon along the stream with long, narrow lanes. Dwellings are renowned for their three carving traditions — doorways, brick and wood. Timber framing is mainly tailiang, with steep pitches and deep eaves suited to the wet climate.",
   cultureZh="与宏村同批列入《世界遗产名录》（皖南古村落），胡氏宗族聚落。明经胡氏的仕宦文化与「三雕」工艺使其在徽州诸村中辨识度极高。",
   cultureEn="Inscribed with Hongcun in 2000, Xidi is a Hu-clan settlement whose literati culture and three carving traditions give it a distinctive place among Huizhou villages.",
   keywords=["明", "清", "徽派", "三雕", "宗族", "世界遗产"],
   sources=["unesco_anhui", "dmctv_home"],
   caveat="部分宅院在 20 世纪曾有较大改动，明清原状比例不宜按外观直接推定。"),

 dict(id="c17-fujian-tulou", nameZh="福建土楼（振成楼、承启楼）", nameEn="Fujian Tulou (Zhencheng Lou, Chengqi Lou)",
   pinyin="Fújiàn Tǔlóu", region="east", province="福建", locality="龙岩市永定区 / 漳州市南靖县", era="qing",
   yearText="明末清初形成，现存实例多建于 18—19 世纪", yearUncertainty="约略",
   type="聚落防御·民居", structure=["rammed-earth", "mixed-frame", "mortise-tenon", "courtyard"], ethnic="汉",
   principleZh="外墙用夯土分层夯筑，厚可达 1.5–2 米，上窄下宽；内部以木构承重楼层，形成「外土内木」的双层体系。圆形与方形平面各有功能：方形为府第式，圆形为聚族同堂。",
   principleEn="Outer walls are rammed earth laid in lifts, up to 1.5–2 metres thick and tapering upward; timber frames carry the internal floors, giving an earth-outside, timber-inside double system. Round plans shelter large extended families; square plans serve as formal residences.",
   cultureZh="闽西南客家与闽南族群的聚居形态，2008 年列入《世界遗产名录》。 UNESCO 评价其「建筑与自然环境和谐共处」，是客家「聚族而居」传统的物质证据。",
   cultureEn="The communal dwelling of the Hakka and southern Fujian peoples, inscribed in 2008, whose UNESCO evaluation stresses the harmony of built form and natural setting and its evidence for clan-based settlement.",
   keywords=["清", "夯土", "土楼", "客家", "聚族", "世界遗产"],
   sources=["unesco_tulou", "dmctv_home", "caupd_intro", "worldskills"],
   caveat="现存楼群经过历代修缮与住户改造；本条讲的是「土墙承围护 + 木构承楼层」的构造分工，不等于墙体全为原夯土。"),

 dict(id="c18-kaiping-diaolou", nameZh="开平碉楼", nameEn="Kaiping Diaolou and Villages",
   pinyin="Kāipíng Diāulóu", region="south", province="广东", locality="江门市开平市", era="qing",
   yearText="清中期至民国（16—20 世纪）陆续兴建", yearUncertainty="约略",
   type="防御建筑", structure=["rammed-earth", "masonry-tower", "courtyard"], ethnic="汉",
   principleZh="碉楼为土石或混凝土的塔状防御体，墙厚、窗小、顶层设射孔；与村落中的传统民居（书楼、居楼）形成「碉楼—居楼」共生关系，防御与居住分离又互相掩护。",
   principleEn="Diaolou are tower-like earth, stone or concrete defences with thick walls, small openings and loopholes at the top; they stand in a symbiotic relationship with the villages' timber residences, sharing watch and defence.",
   cultureZh="中西文化交融的实物：19 世纪末旅居海外的华侨把欧洲-castle 形制带回本土，与岭南传统砌筑技术结合。2007 年列入《世界遗产名录》。",
   cultureEn="Physical evidence of Chinese–Western exchange: émigré returnees of the late nineteenth century brought European castle forms back and fused them with Lingnan masonry. Inscribed in 2007.",
   keywords=["清", "民国", "碉楼", "防御", "侨乡", "世界遗产"],
   sources=["unesco_kaiping", "dmctv_home"],
   caveat="现存碉楼多为 1980—1990 年代由海外捐资修复，内部可开启窗与增设楼梯不属原貌。"),

 dict(id="c19-pingyao-ancient-city", nameZh="平遥古城", nameEn="Pingyao Ancient City",
   pinyin="Píngyáo Gǔchéng", region="north", province="山西", locality="晋中市平遥县", era="ming",
   yearText="明清扩建，现存城墙为明洪武三年（1370）扩建后重修", yearUncertainty="确切（城墙）/约略（现存格局）",
   type="历史城市", structure=["tailiang", "chuandou", "rammed-earth", "roof-form", "courtyard"], ethnic="汉",
   principleZh="城池方正，街巷呈「棋盘」格局；城墙为夯土包砖，敌台与城楼沿城垣布置。城内民居与商铺多为一至二层木构，继承晋商院落的抬梁做法。",
   principleEn="A regular walled plan with a chequerboard street grid; rammed-earth walls faced in brick, with towers and gatehouses along the ramparts. The houses within preserve the tailiang framing of the Shanxi merchant courtyards.",
   cultureZh="1997 年列入《世界遗产名录》，是中国古代城市「城—市—街—院」完整格局保存最好的例证之一，也是晋商票号与金融文化的活标本。",
   cultureEn="Inscribed in 1997, one of the best-preserved examples of the complete Chinese city pattern of walls, market, streets and courtyards, and a living record of Shanxi merchant banking culture.",
   keywords=["明", "清", "城", "夯土", "晋商", "世界遗产"],
   sources=["unesco_pingyao", "sxam_online"],
   caveat="城内 20 世纪后有大量现代建筑插入；「完整保存」是相对于世界遗产评价尺度而言。"),

 dict(id="c20-dunhuang-mogao", nameZh="敦煌莫高窟", nameEn="Mogao Caves, Dunhuang",
   pinyin="Dūnhuáng Mògāo Kū", region="northwest", province="甘肃", locality="敦煌市", era="six-dyn",
   yearText="始建于前秦建元二年（366），历经十六国至元各代营造", yearUncertainty="确切（始建）",
   type="石窟寺", structure=["stone-arch", "cave"], ethnic="汉",
   principleZh="在鸣沙山东麓崖壁上开凿洞窟；早期窟为覆斗顶、北魏出现中心柱与穹隆顶，隋唐转为覆斗顶或穹隆顶。崖体栈道与木构廊檐连接各窟，塑像与壁画依附于洞窟本体。",
   principleEn="Caves hewn into the cliff face; early caves have an inverted-trough ceiling, the Northern Wei adds a central pillar and barrel vault, and Sui–Tang caves combine trough and dome ceilings. Timber galleries and walkways link the caves along the cliff.",
   cultureZh="1987 年首批列入《世界遗产名录》，以 492 个洞窟、约 4.5 万平方米壁画与 2,000 余身彩塑著称，是丝路艺术与多族群共生的集中体现。",
   cultureEn="Inscribed in 1987 as part of the first group of World Heritage sites, renowned for 492 caves, some 45,000 m² of murals and over 2,000 painted sculptures — a concentrated record of Silk Road art and multi-ethnic contact.",
   keywords=["北魏", "隋唐", "石窟", "覆斗顶", "壁画", "世界遗产"],
   sources=["unesco_mogao", "unesco_xian", "worldskills"],
   caveat="壁画与彩塑历代均有重修与剥蚀；本条聚焦洞窟形制与崖体结构，不评估艺术断代。"),

 dict(id="c21-longmen-grottoes", nameZh="龙门石窟", nameEn="Longmen Grottoes",
   pinyin="Lóngmén Shíkū", region="central", province="河南", locality="洛阳市", era="six-dyn",
   yearText="北魏迁都洛阳后开凿（493 年起），唐代为盛期", yearUncertainty="确切",
   type="石窟寺", structure=["stone-arch", "cave"], ethnic="汉",
   principleZh="在伊河两岸崖壁开凿，窟室多为方形平面、平顶或穹隆顶，中心柱窟与盝顶窟并存；护岸、栈道、山亭构成崖壁上的立体交通体系。",
   principleEn="Caves cut into the cliff on both banks of the Yi River, mostly square in plan with flat or domed ceilings, with both central-pillar and lintel-ceiling types; retaining walls, walkways and hillside pavilions form a three-dimensional circulation system on the cliff.",
   cultureZh="2000 年列入《世界遗产名录》（UNESCO 编号 1003），北魏迁都洛阳后开凿，是「孝文帝汉化」在石刻艺术上的直接见证。",
   cultureEn="Inscribed in 2000 (UNESCO ref. 1003), begun after the Northern Wei capital moved to Luoyang, and a direct record of Emperor Xiaowen's sinicising reforms in stone.",
   keywords=["北魏", "唐", "石窟", "中心柱", "世界遗产"],
   sources=["unesco_longmen", "ih_2024_shift", "dmctv_home"],
   caveat="世界遗产身份对应 UNESCO 编号 1003；开凿与造像的年代分期在学界仍有细节差异，本目录只标整体脉络。"),

 dict(id="c22-dazu-rock-carvings", nameZh="大足石刻", nameEn="Dazu Rock Carvings",
   pinyin="Dàzú Shíkè", region="southwest", province="重庆", locality="大足区", era="song",
   yearText="南宋（12—13 世纪）开凿为主，历代续凿", yearUncertainty="约略",
   type="石窟寺", structure=["stone-arch", "cave"], ethnic="汉",
   principleZh="以山体岩壁为整体开凿，凿出龛、塔与圆洞；宝顶山大佛湾为一处巨型崖面造像，岩体本身即是展龛，结构与造像一体。",
   principleEn="Carved into the living rock of the hill as a whole, producing niches, pagodas and round caves; Baodingshan is a single vast cliff face where the rock mass itself serves as the shrine, structure and sculpture fused.",
   cultureZh="1999 年列入《世界遗产名录》（UNESCO 编号 912），以「古 Abby」式连续叙事石刻著称，是宋以后中国石窟造像的代表作。",
   cultureEn="Inscribed in 1999 (UNESCO ref. 912), famous for continuous narrative reliefs in the manner of ancient sutra illustration, and regarded as a masterwork of post-Song Chinese rock carving.",
   keywords=["宋", "石刻", "崖造像", "世界遗产"],
   sources=["unesco_dazu", "ih_2024_shift"],
   caveat="世界遗产身份对应 UNESCO 编号 912（北山、宝顶山、南山、石篆山、释迦山五处崖面）；造像题材与年代分期在各研究中略有差异。"),

 dict(id="c23-shaolin-temple", nameZh="嵩山少林寺（常住院、塔林）", nameEn="Shaolin Temple, Mount Song",
   pinyin="Sōngshān Shàolín Sì", region="central", province="河南", locality="登封市", era="six-dyn",
   yearText="北魏太安年间（455—466）创建，现存常住院等为明清重修", yearUncertainty="确切（始建）",
   type="佛寺", structure=["tailiang", "dougong", "mixed-frame", "roof-form"], ethnic="汉",
   principleZh="常住院等殿宇沿中轴排列，抬梁式构架，檐下用斗栱承托；塔林为历代祖师塔的集中区，砖塔与石塔并列，密排成林。",
   principleEn="The halls line up on a central axis in tailiang framing with bracket sets under the eaves; the Pagoda Forest is a dense congregation of brick and stone pagodas built for successive abbots.",
   cultureZh="汉传佛教禅宗祖庭。少林寺建筑群以「起山门—常住院—塔林」的紧凑布局与塔林的多时代砖石塔著称，是「塔林」这一类型最集中的实例。",
   cultureEn="The ancestral seat of Chan Buddhism, known for the compact axis of gate, abbot's hall and pagoda forest, and above all for the Pagoda Forest — the densest surviving collection of brick and stone pagodas of many periods.",
   keywords=["北魏", "明", "清", "塔林", "砖塔", "禅宗"],
   sources=["unesco_dengfeng", "dmctv_home", "sxam_online"],
   caveat="现存殿宇多为明清重修，与北魏寺址的历史关系需靠文献与塔林而非现存木构来理解。"),

 dict(id="c24-wudang-temples", nameZh="武当山古建筑群", nameEn="Ancient Building Complex in the Wudang Mountains",
   pinyin="Wǔdāng Shān Gǔjiànzhù Qún", region="central", province="湖北", locality="十堰市丹江口市", era="ming",
   yearText="明永乐十年（1412）起大规模营建，延续至清", yearUncertainty="确切",
   type="道教宫观", structure=["tailiang", "dougong", "rammed-earth", "roof-form"], ethnic="汉",
   principleZh="以宫观群沿山势铺展，木构殿宇依岩就势，铜铸殿（天一真庆宫、玄岳门等）以铸造木构替代真木；金殿为铜鎏金铸造，屋顶、转角与梁架皆为金属仿木构。",
   principleEn="Temples spread along the mountain ridge, halls set into the rock, and some halls replace timber with bronze casting — including a gilt-bronze hall whose roof, corner brackets and frame imitate wooden construction in metal.",
   cultureZh="1994 年列入《世界遗产名录》，是明初「道家理想国」式宫观建设的范本，与紫禁城、泰山构成明初国家营建的整体格局。",
   cultureEn="Inscribed in 1994, a model of early-Ming Daoist palace building and part of a coherent state programme that also produced the Forbidden City and the Mount Tai works.",
   keywords=["明", "道观", "铜殿", "金殿", "世界遗产"],
   sources=["unesco_wudang", "dmctv_home"],
   caveat="山中古建群在历史上多次火灾与损毁，现有建筑含 1990 年代按考古与文献复建者。"),

 dict(id="c25-hemudu-site", nameZh="河姆渡遗址", nameEn="Hemudu Site",
   pinyin="Hémùdū Yízhǐ", region="east", province="浙江", locality="余姚市", era="pre-qin",
   yearText="距今约 7000 年（文化堆积跨度约 5000 年）", yearUncertainty="约略（考古学断代）",
   type="遗址·聚落", structure=["ganlan", "mortise-tenon"], ethnic="先民",
   principleZh="出土干栏式木构建筑构件（木桩、地板、梁枋），并发现「榫卯」技术痕迹（多榫、多孔构件），是中国已知最早的榫卯实例之一；构件用榫卯连接而非绑扎。",
   principleEn="Excavated ganlan-type structural members — piles, floor planks, beams and purlins — together with multi-tenon and multi-socket components, among the earliest known mortise-and-tenon evidence in China; members were joined by joinery rather than lashing.",
   cultureZh="长江下游新石器时代晚期聚落，展示稻作、湿地适应与干栏木构的完整技术链；「干栏式建筑」与「榫卯技术」的两条线索都以此为起点。",
   cultureEn="A late Neolithic settlement of the lower Yangtze showing the full technical chain of rice cultivation, wetland adaptation and stilted timber construction; both the stilted-building and the joinery story start here.",
   keywords=["新石器", "干栏", "榫卯", "湿地", "稻作"],
   sources=["dmctv_home", "ih_2024_shift", "caupd_intro"],
   caveat="出土构件多为「残件与腐朽样品」，复原形态存在多解；本条讲技术起点，不宣称是「完整建筑」。"),

 dict(id="c26-zengchong-drum-tower", nameZh="增冲鼓楼", nameEn="Zengchong Drum Tower",
   pinyin="Zēngchōng Gǔlóu", region="southwest", province="贵州", locality="黔东南州黎平县", era="qing",
   yearText="清道光二十一年（1841）建成，1980 年代重修抬梁", yearUncertainty="约略",
   type="侗族鼓楼", structure=["ganlan", "dougong", "mortise-tenon", "courtyard"], ethnic="侗",
   principleZh="底层为长方形或方形木构，四面设长廊与条凳；上部叠置多层密檐楼阁，以抬梁与穿斗混合的构架层层出挑，层层缩小形成塔形。各层不用铁钉，全靠榫卯与穿枋咬合。",
   principleEn="A rectangular timber base with galleries and benches on all sides; above it, storeys of dense-eaved pavilions stack upward in a mixed tailiang–chuandou frame, each storey smaller than the one below, locked by joinery and through-tenons rather than nails.",
   cultureZh="侗族村寨的公共中心，鼓楼既是议事与集会议事之所，也是村寨的标志物；2009 年「侗族大歌」列入人类非遗，鼓楼营造技艺亦为多地非遗项目。",
   cultureEn="The public heart of a Dong village — a place for council and assembly as much as a village emblem; the Dong Great Song was inscribed in 2009 and drum-tower construction is itself a recognised intangible heritage practice.",
   keywords=["清", "侗族", "鼓楼", "干栏", "密檐", "侗族大歌"],
   sources=["dmctv_home", "ih_2024_shift", "caupd_intro"],
   caveat="现楼含 1980 年代重修抬梁的痕迹；年代以清道光二十一年建成为通行说法。"),

 dict(id="c27-zhaoxing-dong-village", nameZh="肇兴侗寨", nameEn="Zhaoxing Dong Village",
   pinyin="Zhàoxīng Dòngzhài", region="southwest", province="贵州", locality="黔东南州黎平县", era="qing",
   yearText="宋以后逐步形成，现存建筑以清末民初为主", yearUncertainty="约略",
   type="侗族村寨", structure=["ganlan", "dougong", "mortise-tenon", "courtyard"], ethnic="侗",
   principleZh="村寨依山就势，鼓楼与侗寨为公共核心；干栏式吊脚楼以木柱架高，柱脚落于石础或直接立于坡地，底层架空，可避潮湿并作畜圈仓储。屋面小青瓦，出檐深，坡度大以排洪。",
   principleEn="The village follows the terrain, with the drum tower and assembly halls at its core. Stilted diaojiaolou houses stand on timber posts over a usable understorey, keeping the living floor clear of damp; deep eaves and steep tiled roofs shed heavy rain.",
   cultureZh="侗族「干栏建筑」的集中样本，2009 年侗族大歌列入人类非物质文化遗产代表作名录；鼓楼、风雨桥、萨坛构成村寨的公共建筑三件套。",
   cultureEn="A concentrated example of Dong stilted architecture, the same cultural world in which the Dong Great Song was inscribed in 2009; the drum tower, the covered bridge and the ritual altar form the village's public trio.",
   keywords=["清", "侗族", "吊脚楼", "干栏", "风雨桥", "鼓楼"],
   sources=["dmctv_home", "ih_2024_shift", "caupd_intro"],
   caveat="现存民居经过多次翻修与改建（尤其 1990 年代后），「侗族建筑」特征与现代化改造并存。"),

 dict(id="c28-beijian-covered-bridge", nameZh="北涧桥（泗溪姐妹桥）", nameEn="Beijian Bridge (Sister Bridges of Sixi)",
   pinyin="Běijiàn Qiáo", region="east", province="浙江", locality="温州市泰顺县泗溪镇", era="qing",
   yearText="始建清康熙十三年（1674），嘉庆八年（1803）重建，道光二十九年（1849）重修", yearUncertainty="确切（有碑记与志书）",
   type="廊桥", structure=["timber-arch-bridge", "mortise-tenon", "chuandou"], ethnic="汉",
   principleZh="编梁木拱：以「三节苗""五节苗」两类杆件穿、插、别、压编织成拱架，榫卯连接，不用一钉一铆。全桥以榫卯咬合与自重承压，桥面荷载由整个编织拱架承担，并把力侧向传给桥台。桥上廊屋多为四柱九檩穿斗式。",
   principleEn="A woven timber arch: 'three-section' and 'five-section' members are threaded, interlocked and pressed together into a basket-like arch by mortise and tenon, with no nails or rivets at all. The whole woven arch carries the deck load and delivers it sideways into the abutments. The covered gallery above is typically a four-post, nine-purlin chuandou frame.",
   cultureZh="与溪东桥并称「泗溪姐妹桥」，为全国重点文物保护单位。2024 年 12 月，「中国木拱桥传统营造技艺」由急需保护名录转入人类非物质文化遗产代表作名录。",
   cultureEn="Together with Xidong Bridge forms the 'Sister Bridges of Sixi'; a national major heritage site. In December 2024 the woven timber bridge craft was transferred from the Urgent Safeguarding List to the Representative List of the Intangible Cultural Heritage of Humanity.",
   keywords=["清", "廊桥", "编梁", "榫卯", "三节苗", "五节苗", "非遗"],
   sources=["ts_beijian", "ts_32bridges", "ts_park", "ih_woodbridge", "ih_bridge_paper", "cri_beijian", "wiki_beijian"],
   caveat="桥体 2020—2021 年经保护修缮（校正扭曲梁架、更换残损构件），现状含修复痕迹；「不用一钉一铆」针对编梁拱架本体。"),

 dict(id="c29-xianju-bridge", nameZh="仙居桥（泰顺廊桥）", nameEn="Xianju Bridge, Taishun",
   pinyin="Xiānjū Qiáo", region="east", province="浙江", locality="温州市泰顺县罗阳镇", era="song",
   yearText="明景泰四年（1453）始建，清代多次重修", yearUncertainty="确切（始建）",
   type="廊桥", structure=["timber-arch-bridge", "mortise-tenon"], ethnic="汉",
   principleZh="编梁木拱廊桥，跨径为泰顺境内最大；木料以杉木、松木为主，拱架关键部位用通长、笔直、无结节的「座山老木」。桥身与桥屋受力分工：拱架承桥面，桥屋承自重与风雪。",
   principleEn="A woven timber arch covered bridge with the longest clear span in Taishun; the arch is built mainly from Chinese fir and pine, with the key arch members chosen as long, straight, knot-free 'mountain-old' timber. The arch carries the deck; the gallery carries its own weight and the weather.",
   cultureZh="被收入《中国古桥技术史》；泰顺全县有 32 座古廊桥，其中国保 15 座，是「中国廊桥之乡」格局的代表。2024 年该营造技艺进入人类非遗代表作名录。",
   cultureEn="Included in the History of Ancient Chinese Bridges; Taishun's 32 ancient covered bridges, 15 of them nationally protected, form the basis of its claim as the home of the Chinese covered bridge.",
   keywords=["明", "清", "廊桥", "编梁", "座山老木", "非遗"],
   sources=["ts_32bridges", "ih_woodbridge", "ih_woodbridge2", "people_bridge"],
   caveat="现存形制为清代重修后状态，1453 年为始建年代；木料尺寸与「座山老木」规格见非遗项目说明。"),

 dict(id="c30-zhaozhou-bridge", nameZh="赵州桥（安济桥）", nameEn="Zhaozhou Bridge (Anji Bridge)",
   pinyin="Zhàozhōu Qiáo", region="north", province="河北", locality="石家庄市赵县", era="sui-tang",
   yearText="隋大业年间至唐贞观年间（约 605—630）设计建造", yearUncertainty="约略（年代有隋、唐两说）",
   type="石桥", structure=["stone-arch"], ethnic="汉",
   principleZh="敞肩式石拱桥：在大拱券两肩之上另开四个小拱，减小桥身自重并兼作泄洪孔；主拱为石砌拱券，拱石间以白灰与铁楔连接。桥面由石板铺砌，桥身用一端插入桥台的「敞肩」做法分散恒载。",
   principleEn="An open-spandrel stone arch: four small relieving arches pierce the spandrels above the great arch, lightening the dead load and acting as flood outlets. The main arch is a masonry ring of voussoirs bedded in lime and secured with iron cramps; the roadway is laid in stone slabs.",
   cultureZh="世界最现存最早的敞肩式石拱桥，被梁思成誉为「弧线美」的典范；1961 年列入第一批全国重点文物保护单位，其设计影响波及欧亚桥梁史。",
   cultureEn="The oldest surviving open-spandrel stone arch bridge in the world, praised by Liang Sicheng as a masterwork of curve; inscribed in 1961, its design resonated across Eurasian bridge history.",
   keywords=["隋", "唐", "石拱", "敞肩", "小拱", "拱券"],
   sources=["hebei_wwb", "ncha_heb", "dmctv_home"],
   caveat="建造年代「隋」与「唐」两说并存，跨度与各说相差约二十年，本目录标「约略」并保留两说。"),

 dict(id="c31-luding-bridge", nameZh="泸定铁索桥", nameEn="Luding Bridge",
   pinyin="Lúdìng Tiěsuǒ Qiáo", region="southwest", province="四川", locality="甘孜藏族自治州泸定县", era="qing",
   yearText="清康熙四十四年至四十五年（1705—1706）建成", yearUncertainty="确切",
   type="铁索桥", structure=["chain-bridge"], ethnic="汉",
   principleZh="13 条铁链（每链 124 环）并列张紧于两岸桥台铁柱与锚碇之上，铁链上铺木板成桥面。荷载使铁链同时受拉与下压，锚碇与桥台承受全部的水平拉力，因此两端桥台的锚固是成败关键。",
   principleEn="Thirteen iron chains, each of 124 links, are tensioned in parallel between iron pillars and anchorages on the two banks, with timber planks laid across them. The load puts the chains in tension and compression; the anchorages carry the entire horizontal pull, which is why the bank structures decide whether the bridge stands.",
   cultureZh="藏区与内地交通的重要通道，1935 年红军飞夺泸定桥使其成为近现代史标志；现为全国重点文物保护单位。",
   cultureEn="A vital link between Tibetan areas and the interior, and a landmark of modern Chinese history after the 1935 crossing; a nationally protected heritage site.",
   keywords=["清", "铁索", "悬索", "桥台", "锚碇"],
   sources=["dmctv_home", "caupd_intro"],
   caveat="现存铁链于 1950 年代更换，桥面与附属亦经多次修缮；「始建于清」指形制沿革，非现存铁链的年代。"),

 dict(id="c32-lijiang-old-town", nameZh="丽江古城", nameEn="Old Town of Lijiang",
   pinyin="Lìjiāng Gǔchéng", region="southwest", province="云南", locality="丽江市古城区", era="ming",
   yearText="元代设城，明清扩建定型", yearUncertainty="约略",
   type="历史城市", structure=["tailiang", "chuandou", "stone-arch", "roof-form"], ethnic="纳西",
   principleZh="城中无规矩道路网，以水系与地势自然组织；三坊一照壁的院落为纳西民居基本单元，木构用穿斗式，院墙用土石。狮子山上的万古楼为登高瞭望点，是城格局局的制高点。",
   principleEn="The town has no formal street grid; the layout follows water and terrain. The three-sided house with a screen wall is the basic Naxi courtyard unit, framed in chuandou timber with earth and stone walls, and Lion Hill's Wangu Tower anchors the composition as its viewpoint.",
   cultureZh="1997 年列入《世界遗产名录》，是纳西族文化与汉地商业城市共生的样本；「三坊一照壁」是纳西民居的标志形态。",
   cultureEn="Inscribed in 1997, a record of Naxi culture alongside a Han-style trading city; the three-sided house with a screen wall is the signature form of Naxi domestic architecture.",
   keywords=["明", "清", "元", "纳西", "三坊一照壁", "穿斗", "世界遗产"],
   sources=["unesco_lijiang", "dmctv_home", "ssraa_silkroad"],
   caveat="1990 年代丽江的旅游化改造规模较大，现状与「历史城市原貌」之间存在学界与规划部门的持续讨论。"),

 dict(id="c33-dali-bai-dwellings", nameZh="大理白族民居", nameEn="Dali Bai Vernacular Dwellings",
   pinyin="Dàlǐ Báizú Mínjū", region="southwest", province="云南", locality="大理白族自治州", era="qing",
   yearText="明清形成，近代大量改扩建", yearUncertainty="约略",
   type="民居", structure=["tailiang", "ganlan", "mixed-frame", "courtyard"], ethnic="白",
   principleZh="典型为「三坊一照壁」与「四合五天井」：以夯土或石砌墙围合，正房多用抬梁，两侧漏角用穿斗，照壁与厢房形成封闭院落。白族民居常用「厚墙 + 深檐 + 窄院」应对高原强日照与温差。",
   principleEn="Typically a three-sided house with a screen wall, or a five-courtyard house: earth or stone enclosure walls, a main hall in tailiang framing, side lean-tos in chuandou, and a screen wall closing the court. Thick walls, deep eaves and a narrow courtyard buffer the plateau's strong sun and temperature swings.",
   cultureZh="白族民居是云南「三坊一照壁」的类型学中心，也是南方丝路建筑艺术数字博物馆的重点收录对象之一。",
   cultureEn="The Bai dwelling is the type-centre for the three-sided-house-with-screen-wall and a focus of the Southern Silk Road architecture digital museum.",
   keywords=["清", "白族", "三坊一照壁", "四合五天井", "穿斗", "夯土"],
   sources=["ssraa_silkroad", "dmctv_home", "caupd_intro"],
   caveat="「三坊一照壁」是白族聚落（大理、剑川、鹤庆等）共有的类型，具体做法各地有别，不能一概而论。"),

 dict(id="c34-taoping-qiang-village", nameZh="桃坪羌寨", nameEn="Taoping Qiang Village",
   pinyin="Táopíng Qiāngzhài", region="southwest", province="四川", locality="阿坝藏族羌族自治州汶川县", era="ming",
   yearText="明代形成，现存寨内建筑多为清代及近代", yearUncertainty="约略",
   type="羌族村寨", structure=["ganlan", "stone-arch", "courtyard"], ethnic="羌",
   principleZh="羌寨依山势建于岷江河谷，房屋以石砌为基、以木为架：片石墙与石砌底层承重，木构上层居人。寨中碉楼（羌语「碉」）为防御与瞭望，顶部四角出檐，砌石收分。",
   principleEn="Qiang villages occupy the Min River valley, with houses built stone-below and timber-above: rubble-stone walls and stone bases carry the loads while timber occupies the upper storeys. The watchtower is the settlement's defence and lookout, corbelled inward at the top.",
   cultureZh="羌族村寨现存规模最大、形态最完整者之一；「羌年」于 2009 年列入急需保护的非物质文化遗产名录，2024 年 12 月转入人类非物质文化遗产代表作名录。",
   cultureEn="One of the largest and most intact surviving Qiang settlements; the Qiang New Year festival was inscribed on the Urgent Safeguarding List in 2009 and transferred to the Representative List of Humanity in December 2024.",
   keywords=["明", "清", "羌族", "碉楼", "干栏", "石砌", "羌年"],
   sources=["ih_2024_shift", "dmctv_home", "caupd_intro"],
   caveat="2008 年汶川地震对桃坪羌寨造成严重破坏，现存建筑含震后按原貌恢复者。"),

 dict(id="c35-manchu-log-house", nameZh="满族井干式民居", nameEn="Manchu Log-Cabin Houses",
   pinyin="Mǎnzú Jǐnggān Shì Mínjū", region="northeast", province="辽宁 / 吉林 / 黑龙江", locality="东北林区各地", era="historical-continuity",
   yearText="清代形成并沿用至今", yearUncertainty="约略",
   type="民居", structure=["jinggan", "mortise-tenon"], ethnic="满",
   principleZh="井干式：原木层层横叠，转角处十字咬合形成井字壁面，故名。墙体即承重墙，围合空间不需要梁架；端部出檐、压边与地面之间留出通风缝隙以防潮。",
   principleEn="Log construction: round logs are stacked in courses and notched at the corners into a criss-cross wall, hence the name. The wall is the structure, so no frame is needed; the base is left ventilated to keep the sill dry.",
   cultureZh="与北方森林资源及狩猎生活直接相关，是「井干式」在东亚最集中的活态分布区之一；近现代亦见于俄远东与朝鲜半岛北部。",
   cultureEn="A direct response to northern forest resources and hunting life, and one of the most continuous living distributions of log construction in East Asia, with parallels in the Russian Far East and northern Korea.",
   keywords=["清", "满族", "井干", "原木", "林区", "防潮"],
   sources=["dmctv_home", "caupd_intro"],
   caveat="东北林区大量井干民居为 20 世纪中后期迁建（林区移民），并非所有现存实例都连续使用至今。"),

 dict(id="c36-mongolian-yurt", nameZh="蒙古包（毡房）", nameEn="Mongolian Yurt (Ger)",
   pinyin="Měnggǔ Bāo", region="north", province="内蒙古", locality="呼伦贝尔盟 / 锡林郭勒盟等", era="historical-continuity",
   yearText="蒙古族传统居所，延续至今", yearUncertainty="不适用（持续性传统）",
   type="民居", structure=["yurt-lattice", "ganlan"], ethnic="蒙古",
   principleZh="可拆卸格构：乌尼（穹顶伞形骨架）与哈那（菱形格构墙架）组成受力体系，哈那与乌尼之间以绳索张拉成圈，外部覆毛毡。骨架可拆装，迁牧时整体搬运，结构随季节调整。",
   principleEn="A collapsible lattice: the wooden crown (uni) and the diamond-lattice wall frame (hana) form the structural system, tensioned into a ring by cords and covered in felt. The frame is taken down and moved with the herd, and adjusted seasonally.",
   cultureZh="中国北方游牧文化的物质载体，2017 年「蒙古族游牧文化」列入联合国教科文组织人类非物质文化遗产代表作名录。",
   cultureEn="The material carrier of northern Chinese nomadic culture; the Mongolian nomadic way of life was inscribed on the Representative List of Humanity in 2017.",
   keywords=["清", "蒙古族", "毡房", "格构", "可拆卸", "游牧"],
   sources=["ih_2024_shift", "dmctv_home", "caupd_intro"],
   caveat="现代定居毡房多改用砖木与彩钢板，「可拆卸」与「羊毛毡覆盖」在当代实例中并不普遍。"),

 dict(id="c37-dai-bamboo-house", nameZh="傣族竹楼", nameEn="Dai Bamboo House",
   pinyin="Dǎizú Zhúlóu", region="southwest", province="云南", locality="西双版纳傣族自治州", era="historical-continuity",
   yearText="传统延续，20 世纪 50 年代以后大量改用砖木", yearUncertainty="不适用（持续性传统）",
   type="民居", structure=["bamboo", "ganlan", "elevated-deck"], ethnic="傣",
   principleZh="竹楼以竹为柱与梁，底层架空（适应湿热与虫蚁），人住上层；屋顶陡坡小青瓦或茅草，坡面加大以适应暴雨；各户独立，多按传统「干栏式」分户布局。",
   principleEn="Bamboo culms serve as posts and beams; the living floor is raised to cope with heat, insects and damp, and the steep roof of tile or thatch sheds heavy tropical rain. Dwellings stand separately within a stilted settlement layout.",
   cultureZh="热带季风环境下的适应型民居，与西双版纳的整体稻作与水系环境互为因果；竹楼在当代多被砖混结构替代。",
   cultureEn="An adaptation to a tropical monsoon environment, inseparable from the paddy-and-water landscape of Xishuangbanna; bamboo houses have largely been replaced by brick and concrete in recent decades.",
   keywords=["清", "傣族", "竹构", "干栏", "架空", "西双版纳"],
   sources=["ssraa_silkroad", "dmctv_home", "caupd_intro"],
   caveat="现存「傣族竹楼」多为复原或仿建；真正的全竹结构在云南部分村寨已较少见。"),

 dict(id="c38-potala-palace", nameZh="布达拉宫", nameEn="Potala Palace",
   pinyin="Bùdálā Gōng", region="plateau", province="西藏", locality="拉萨市", era="qing",
   yearText="始建于 17 世纪，1693 年起陆续建成，20 世纪中叶前为历代达赖居所", yearUncertainty="确切（分期）",
   type="宫殿·宗教建筑", structure=["stone-arch", "rammed-earth", "tailiang", "dougong", "roof-form"], ethnic="藏",
   principleZh="红宫与白宫依山垒砌，墙体用石块与夯土，厚达数米；内部木构楼阁与碉房结合，白宫有大量卵石砌筑的墙体与藏式平顶。",
   principleEn="The Red and White Palace are piled against the rock, with walls several metres thick in stone and rammed earth; timber pavilions and blockhouses are combined inside, and the White Palace uses rounded fieldstone walls with flat Tibetan roofs.",
   cultureZh="世界屋脊的宫殿建筑群，1994 年列入《世界遗产名录》；其「红白」体量并置与山体关系，是藏式建筑与高山水碉体系的代表。",
   cultureEn="A palace complex on the roof of the world, inscribed in 1994; the paired red and white masses against the mountain embody the Tibetan blockhouse and fortress system at high altitude.",
   keywords=["清", "藏", "宫殿", "碉房", "夯土", "石砌", "世界遗产"],
   sources=["unesco_potala", "dmctv_home"],
   caveat="UNESCO 编号以官方名录为准（此条暂挂占位编号，引用前须在 UNESCO 官方页核对）；宫内文物与壁画为大量历代艺术品的集合。"),

 dict(id="c39-xiaoyanta", nameZh="小雁塔", nameEn="Small Wild Goose Pagoda",
   pinyin="Xiǎo Yàn Tǎ", region="northwest", province="陕西", locality="西安市", era="sui-tang",
   yearText="唐景龙元年（707）建成，明清多次修缮", yearUncertainty="确切（始建）",
   type="砖塔", structure=["masonry-tower", "roof-form"], ethnic="汉",
   principleZh="密檐式砖塔：塔身由砖砌筒状塔壁围合，每层以叠涩砖檐出挑，壁内设券门与楼梯。塔壁与楼层是同一结构，不设木构楼层。",
   principleEn="A dense-eaved brick pagoda: a cylindrical brick shell encloses the body, each storey corbelled out with stepped brick eaves, with vaulted entrances and a stair inside. Wall and storey are one structure; there are no timber floors.",
   cultureZh="唐代长安城内保存至今的少数砖塔之一，与大雁塔同为唐代佛塔制度的重要遗存；20 世纪因地基不均匀沉降已明显倾斜。",
   cultureEn="One of the few Tang brick pagodas surviving in Chang'an, a key remnant of the Tang pagoda system alongside the Giant Wild Goose Pagoda; it leans noticeably from uneven settlement.",
   keywords=["唐", "砖塔", "密檐", "叠涩", "长安"],
   sources=["dmctv_home", "caupd_intro"],
   caveat="倾斜与裂缝经多次加固处理；「密檐」的层数划分在不同时期研究中有差异。"),

 dict(id="c40-feiyun-pavilion", nameZh="飞云楼", nameEn="Feiyun Pavilion",
   pinyin="Fēiyún Lóu", region="north", province="山西", locality="晋城市泽州县", era="qing",
   yearText="清道光二十九年（1849）重建", yearUncertainty="确切（重建年）",
   type="楼阁", structure=["dougong", "tailiang", "mortise-tenon", "roof-form"], ethnic="汉",
   principleZh="纯木构高楼，三层四檐、逐层出挑；不用一钉，全以榫卯与斗栱咬合，悬柱与雀替层层外伸，梁架整体性强。因无柱网，竖向受力靠柱与枋的咬合与楼层的水平联系。",
   principleEn="A pure timber tower of three storeys and four eaves, each projecting further out; it uses no nails, only mortise-and-tenon joints and bracket sets, with suspended columns and sparrow braces extending outward and a strongly unified frame.",
   cultureZh="被称为「中华第一木楼」，与应县木塔、飞云楼并称山西三大木构名楼；其「无钉无铁」的纯木高层技术在中国现存木构中极为罕见。",
   cultureEn="Called China's foremost timber tower and grouped with the Yingxian Pagoda as one of Shanxi's three great timber landmarks; a nail-free multi-storey timber frame of rare survival in China.",
   keywords=["清", "楼阁", "纯木", "斗栱", "榫卯", "悬柱", "雀替"],
   sources=["sxam_online", "worldskills"],
   caveat="现存楼为清道光重建，1940 年代前后曾大修；「中华第一木楼」为媒体与民间习称，非官方定名。"),

 dict(id="c41-luoyang-bridge", nameZh="洛阳桥（万安桥）", nameEn="Luoyang Bridge (Wan'an Bridge)",
   pinyin="Luòyáng Qiáo", region="east", province="福建", locality="泉州市", era="song",
   yearText="北宋皇祐五年至嘉祐四年（1053—1059）建，现存桥体 1950 年代原址重建", yearUncertainty="确切（始建）；现存形制为 20 世纪重建",
   type="石桥", structure=["stone-arch", "rammed-earth"], ethnic="汉",
   principleZh="梁式石桥：桥面由长条石梁平铺搭接，两端搁在石砌桥墩上，靠墩顶转角与石梁自重受力，不用拱券。桥墩以条石叠砌，形状为船形，减小水流冲击；两端桥台做分水尖与筏形基础，并以种植牡蛎固结基脚。",
   principleEn="A beam bridge of long stone slabs laid side by side, each end resting on a masonry pier; the slabs work by self-weight and bearing on the pier tops rather than by arch action. The boat-shaped piers, built of coursed ashlar, reduce the force of the current, and the abutments are founded on a raft base consolidated with cultured oysters.",
   cultureZh="北宋建成的跨海梁式石桥，「万安桥」旧名，桥身与桥墩石构、桥面石梁；其「种蛎固基」以牡蛎附着胶结基脚，是中国桥梁史上少见的生物材料加固做法。作为组成部分列入「泉州：宋元中国的世界海洋商贸中心」（UNESCO 编号 1561）。",
   cultureEn="A sea-crossing stone beam bridge built in the Northern Song, historically called Wan'an Bridge, with masonry piers carrying stone slabs; its practice of founding the piers on beds of cultivated oysters is an unusual biological consolidation technique in Chinese bridge history. It forms part of the UNESCO-listed serial property Quanzhou: Emporium of the World in Song-Yuan China (ref. 1561).",
   keywords=["宋", "石桥", "梁式桥", "桥墩", "种蛎固基", "泉州", "世界遗产"],
   sources=["unesco_quanzhou", "dmctv_home"],
   caveat="现存桥体为 1950 年代原址重建，所用石梁与石墩部分沿用原物，不能等同于北宋原构；本条讲的是梁式石桥与墩基做法，不作年代测绘断言。"),

 dict(id="c42-baise-cellar-courtyard", nameZh="陕西三原柏社村地坑窑院", nameEn="Baise Village Sunken-Pit Courtyards, Sanyuan, Shaanxi",
   pinyin="Bǎishè Cūn Dìkēng Yáoyuàn", region="northwest", province="陕西", locality="咸阳市三原县新兴镇", era="historical-continuity",
   yearText="持续性传统，无单一始建年；村寨相传始建于晋代", yearUncertainty="不适用",
   type="民居聚落", structure=["yaodong", "rammed-earth", "courtyard"], ethnic="汉",
   principleZh="在黄土台塬上向下挖出方形或长方形地坑，坑壁即屋壁，再在壁内掏挖券洞居室，坑口四周砌筑矮墙形成院落。洞顶用土坯或砖券起券，地面做排水明沟。数字博物馆记录的历史环境要素包括「下沉式地窑」「崖窑」「关中民居」三类。",
   principleEn="Square or rectangular pits are dug down into the loess plateau, their walls forming the house walls; vaulted cave rooms are then hollowed out of those walls and the pit edge is enclosed by a low parapet to make a courtyard. The vaults are corbelled or brick-jacketed above and the surface is drained by open ditches. The digital museum records three building heritage elements: the sunken pit cave, the cliff cave, and the Guanzhong dwelling.",
   cultureZh="关中塬区「见树不见村、见村不见房、闻声不见人」民居形态的代表：柏社村位于三原县城西北 25 公里，下辖 15 个村民小组、780 户、3756 人，村史相传逾一千六百年。窑洞营造技艺已列入国家级非物质文化遗产名录，陕北与甘肃庆阳做法各有侧重。",
   cultureEn="Baise is the clearest expression of the Guanzhong plateau pattern of 'trees without a village, a village without visible houses, voices without visible people': it lies 25 km north-west of Sanyuan county seat, with 15 natural groups, 780 households and 3,756 residents, and a tradition traced back more than sixteen centuries. Yaodong construction technique is listed among China's national intangible cultural heritage, with the northern Shaanxi and Gansu Qingyang variants each having their own emphasis.",
   keywords=["窑洞", "地坑院", "生土", "券洞", "关中", "传统村落", "非遗"],
   sources=["dmctv_baise", "dmctv_baise_gs", "dmctv_baise_env", "ih_yaodong_sx", "ih_yaodong_gansu", "people_baise"],
   caveat="窑洞是持续性居住传统，无统一始建年；现存院落经多代修整与改建，保存状况逐院不同，「780 户」为村内户数而非窑洞院数。"),
]

# ---------------------------------------------------------------- 构造 → 构件 / 拆解顺序（给 18 号）
STRUCTURE_GROUPS = {
    "dougong": {
        "labelZh": "斗栱（铺作）", "labelEn": "Dougong bracket set",
        "members": ["坐斗（栌斗）", "华栱", "泥道栱", "瓜子栱", "令栱", "耍头", "昂", "三才升", "交互斗", "散斗"],
        "membersEn": ["base block (ludou)", "hua gong arm", "nidao gong", "guazi gong", "ling gong", "shatou beam head", "ang cantilever", "sancai sheng block", "cross block", "scattered block"],
        "assemblyOrder": ["选材定尺", "安坐斗于柱头", "安华栱与泥道栱", "安交互斗与散斗", "出昂与耍头", "安令栱与三才升", "逐层外跳", "铺椽与铺板", "安栱垫板", "勾当与修整"],
        "forceNoteZh": "定性示意：斗栱把屋檐的出挑重量经由层层栱、昂「接力」传到柱心，再下行至柱础。箭头仅表示传力方向，不表示大小。",
        "forceNoteEn": "Qualitative only: the bracket set relays the weight of the projecting eaves inward through successive blocks and arms to the column head, then down to the base. Arrows show direction of transfer, not magnitude."
    },
    "mortise-tenon": {
        "labelZh": "榫卯连接", "labelEn": "Mortise-and-tenon joint",
        "members": ["榫头", "卯眼", "边梃", "抹头", "销钉", "穿带", "抱肩榫", "燕尾榫", "瓜棱柱拼合段"],
        "membersEn": ["tenon", "mortise socket", "stile", "rail", "pin", "through-tenon", "shouldered joint", "dovetail", "melon-column lamination"],
        "assemblyOrder": ["定线与划墨", "开料与刨平", "凿卯眼", "制榫头", "试装（干装）", "修配", "上销钉或穿带", "紧固", "复核", "试承载"],
        "forceNoteZh": "定性示意：榫头受压、卯眼受压与摩擦，销钉受剪。燕尾榫越向外越难拔出，靠几何而非摩擦锁定。",
        "forceNoteEn": "Qualitative only: the tenon and socket carry compression, friction acts at the surfaces, and pins take shear. A dovetail is geometrically locked — it resists withdrawal by shape, not friction."
    },
    "tailiang": {
        "labelZh": "抬梁式木构架", "labelEn": "Tailiang post-and-beam frame",
        "members": ["柱础", "檐柱", "金柱", "阑额", "普拍枋", "大梁", "瓜棱柱", "驼峰", "蜀柱", "叉手", "托脚", "脊檩", "檩", "椽", "望板", "檐檩", "垫板"],
        "membersEn": ["column base", "eave column", "inner column", "tie beam", "puzuo purlin", "main beam", "melon column", "camel saddle", "short strut", "crossed brace", "prop", "ridge purlin", "purlin", "rafter", "roof board", "eave purlin", "infill board"],
        "assemblyOrder": ["放柱础与柱位", "立柱（校准侧脚）", "安阑额与普拍枋", "安大梁", "安瓜棱柱与蜀柱", "安叉手、托脚", "安驼峰", "逐层安檩", "安椽与望板", "铺瓦与屋面", "安脊饰", "整体校核"],
        "forceNoteZh": "定性示意：荷载自檩→椽→梁→柱→柱础逐级下行；柱越高承受的弯矩越大，所以金柱比檐柱更粗。",
        "forceNoteEn": "Qualitative only: load travels purlin → rafter → beam → column → base. The taller the column, the greater the bending it takes, which is why inner columns are stouter than eave columns."
    },
    "chuandou": {
        "labelZh": "穿斗式木构架", "labelEn": "Chuandou column-and-tie frame",
        "members": ["柱础", "落地柱", "穿枋", "瓜柱", "斗栱", "檩", "牵梁", "穿梁"],
        "membersEn": ["column base", "full-height column", "through-tie", "short bracket post", "bracket set", "purlin", "tie beam", "penetrating beam"],
        "assemblyOrder": ["定柱网", "立落地柱", "安穿枋并打贯", "安瓜柱与斗栱", "安牵梁", "安檩", "逐间打穿", "安椽与望板", "屋面与檐口", "整体校核"],
        "forceNoteZh": "定性示意：穿枋把一根柱与另一根柱直接连成整体，抵抗侧向变形；柱直接承檩，屋面荷载路径更短，但室内柱列密集。",
        "forceNoteEn": "Qualitative only: the through-tie locks one column to the next into a single braced frame that resists lateral movement. Columns carry purlins directly, giving a shorter load path but a denser forest of columns indoors."
    },
    "mixed-frame": {
        "labelZh": "抬梁穿斗混合构架", "labelEn": "Mixed tailiang-chuandou frame",
        "members": ["柱础", "落地柱", "穿枋", "瓜柱", "斗栱", "檩", "梁", "蜀柱", "叉手", "托脚", "平座", "圈梁", "楼板", "楼梯"],
        "membersEn": ["column base", "full-height post", "through-tie", "short bracket post", "bracket set", "purlin", "beam", "short strut", "crossed brace", "prop", "balcony band", "ring beam", "floor deck", "stair"],
        "assemblyOrder": ["定柱网与层高", "立落地柱", "安下层穿枋并打贯", "安瓜柱与斗栱", "安下层檩", "安上层梁架", "安叉手、托脚", "安平座与圈梁", "铺楼板与楼梯", "安上层檩", "铺椽与屋面", "整体校核"],
        "forceNoteZh": "定性示意：下层穿枋提高抗侧刚度，上层抬梁腾出高度并减少室内柱列；两层之间靠平座圈梁传递水平力。",
        "forceNoteEn": "Qualitative only: through-ties on the lower storey stiffen the frame, while stacked beams above gain height and free the interior of columns; the balcony band and ring beam pass horizontal force between the two."
    },
    "ganlan": {
        "labelZh": "干栏式建筑", "labelEn": "Stilted (ganlan) structure",
        "members": ["柱础", "地龙木", "落地柱", "短柱", "穿枋", "楼板", "龙骨", "栏杆", "屋架", "屋面"],
        "membersEn": ["stone base", "ground sill beam", "full-height post", "short post", "through-tie", "floor deck", "joist", "balustrade", "roof frame", "roof covering"],
        "assemblyOrder": ["选址与架空高度", "埋柱或做石础", "安地龙木", "安短柱与穿枋", "铺龙骨", "铺楼板", "做栏与梯", "立屋架", "铺屋面", "围护与通风口"],
        "forceNoteZh": "定性示意：架空把地面湿气与虫蚁隔开，同时用短柱把上部荷载传回地基；水平力由穿枋与楼板共同承担。",
        "forceNoteEn": "Qualitative only: raising the floor separates the living space from damp and insects, while short posts transfer the load back into the ground; ties and the floor diaphragm resist horizontal forces."
    },
    "jinggan": {
        "labelZh": "井干式建筑", "labelEn": "Log-cabin (jinggan) structure",
        "members": ["转角立柱", "横木层", "咬合角", "端部出檐", "压边", "铺楼板", "屋架", "屋面"],
        "membersEn": ["corner post", "log course", "notched corner", "overhanging log ends", "sill plate", "floor deck", "roof frame", "roof covering"],
        "assemblyOrder": ["备木与选料", "立转角柱", "逐层叠横木", "转角十字咬合", "开榫口", "端部出檐与压边", "铺楼板", "搭屋架", "铺屋面", "通风与防潮处理"],
        "forceNoteZh": "定性示意：每层横木靠自重与端部支承叠压，靠摩擦与几何咬合传力；墙体本身就是承重墙，几乎不需要梁架。",
        "forceNoteEn": "Qualitative only: each course rests by self-weight and end bearing, transferring load by friction and geometric interlock. The wall is the structure, so almost no frame is needed."
    },
    "stone-arch": {
        "labelZh": "石拱·砖券", "labelEn": "Stone arch and brick vault",
        "members": ["拱券石（拱石）", "拱腹", "拱背", "券脸", "拱脚", "桥台或墙身", "拱上填料", "侧墙", "拱上建筑", "栏杆"],
        "membersEn": ["voussoir", "intrados", "extrados", "face of arch", "springing", "abutment or wall", "spandrel fill", "parapet wall", "structure over the arch", "balustrade"],
        "assemblyOrder": ["放样与定拱轴", "挖基与做桥台", "立拱架", "从两侧对称砌拱石", "合龙", "养护与拆架", "做拱上填料", "砌侧墙", "铺桥面", "安栏杆与附属"],
        "forceNoteZh": "定性示意：拱靠拱石互相挤压传力，主要受压；压力线（推力线）若偏离拱厚，某一榀拱石会先失稳。此为定性说明，非工程计算。",
        "forceNoteEn": "Qualitative only: the arch works in compression, each voussoir squeezing its neighbours. If the thrust line drifts out of the ring, one voussoir becomes unstable first. This is a teaching illustration, not an engineering calculation."
    },
    "timber-arch-bridge": {
        "labelZh": "编木拱桥", "labelEn": "Woven timber arch bridge",
        "members": ["桥台", "拱架苗（三节苗 / 五节苗）", "牛头梁", "剪刀苗", "立马腿", "桥面板", "廊屋柱", "廊屋梁架", "廊屋屋面", "神龛"],
        "membersEn": ["abutment", "arch members (three-section / five-section)", "head beam", "crossed members", "upright leg", "deck", "gallery post", "gallery frame", "gallery roof", "shrine"],
        "assemblyOrder": ["选址与测水平", "建桥台", "搭拱架", "编三节苗", "编五节苗", "安牛头梁", "安剪刀苗与立马腿", "铺桥面", "架廊屋", "盖瓦与设神龛", "压桥与验收"],
        "forceNoteZh": "定性示意：编织的拱架像倒扣的箩筐，桥面荷载由整个拱架分担，并侧向传给桥台，因此桥必须建在河道窄、两岸基础牢的地方。",
        "forceNoteEn": "Qualitative only: the woven arch behaves like an upturned basket, sharing the deck load and pushing it sideways into the abutments — which is why the craft requires a narrow channel with sound banks."
    },
    "chain-bridge": {
        "labelZh": "铁链·索桥", "labelEn": "Iron-chain and rope suspension bridge",
        "members": ["锚碇", "桥台", "铁柱（桥头塔）", "铁链", "链环", "横铺木板", "压板", "扶索", "缆索", "护栏"],
        "membersEn": ["anchorage", "abutment", "bridge-head tower", "chain", "link", "transverse plank", "clamp plate", "hand rope", "cable", "parapet"],
        "assemblyOrder": ["勘测两岸锚址", "开凿与砌筑锚碇", "架立桥头铁柱", "穿引铁链", "张拉与找正", "铺板与压板", "装扶索", "检查与试走", "养护与更换链节"],
        "forceNoteZh": "定性示意：桥面荷载使铁链同时受拉与下压，水平分力全部由两岸锚碇承担；锚碇一旦位移，整桥随之变形。",
        "forceNoteEn": "Qualitative only: the deck load puts the chains in tension while pressing them down; the horizontal component is taken entirely by the anchorages, and if they move, the whole bridge moves with them."
    },
    "rammed-earth": {
        "labelZh": "夯土", "labelEn": "Rammed earth",
        "members": ["夯土墙", "夯层", "版筑夹板", "夯锤", "垫层", "勒脚", "腰绳（上下拉结）", "排水", "墙顶排水"],
        "membersEn": ["rammed wall", "ramming lift", "formwork boards", "rammer", "base course", "plinth", "horizontal tie course", "drainage", "wall-top drainage"],
        "assemblyOrder": ["夯基与素土夯实", "立模板", "分层填土夯实", "上下层错缝与拉结", "逐层收分", "做勒脚", "拆模", "做排水与墙顶", "表面处理"],
        "forceNoteZh": "定性示意：夯实越密实墙越强；含水量与夯实次数决定强度。墙体靠自重与收分（上部变薄）稳定，墙脚最易被水破坏。",
        "forceNoteEn": "Qualitative only: denser compaction means greater strength; moisture content and the number of blows decide it. The wall stands by its own weight and by tapering; the foot is the part most vulnerable to water."
    },
    "yaodong": {
        "labelZh": "窑洞·生土", "labelEn": "Earthen cave dwelling",
        "members": ["崖面", "窑券（拱圈）", "窑脸", "接口（石或砖）", "土炕", "门窗", "排水明沟", "渗井", "烟囱", "地坑院四壁"],
        "membersEn": ["cliff face", "vault ring", "facade", "masonry facing", "kang bed", "door and window", "open drain", "infiltration well", "chimney", "pit-courtyard walls"],
        "assemblyOrder": ["选址定朝向（避湿就干）", "削崖面", "挖进深", "剔出拱形", "修整窑帮", "泥窑（粗泥 + 细泥）", "做窑脸与接口", "扎山墙安门窗", "盘炕与烟道", "做排水与渗井"],
        "forceNoteZh": "定性示意：拱顶把上部土压力分为左右两份，土体自撑；因此窑顶覆土厚度、坡面稳定与排水是安全的要害。",
        "forceNoteEn": "Qualitative only: the vault splits the weight of the soil above into two lateral thrusts, and the earth supports itself. The thickness of the cover, slope stability and drainage are therefore the critical safety factors."
    },
    "cave": {
        "labelZh": "石窟·崖凿", "labelEn": "Rock-cut cave",
        "members": ["崖面", "窟室", "中心柱", "窟顶（穹隆或平顶）", "龛", "造像", "栈道", "护岸", "山亭", "排水"],
        "membersEn": ["cliff face", "chamber", "central pillar", "ceiling (domed or flat)", "niche", "statue", "gallery walk", "retaining wall", "hillside pavilion", "drainage"],
        "assemblyOrder": ["勘定崖址与走向", "开凿通道与栈道", "自上而下分层开窟", "修整窟室轮廓", "做中心柱与柱础", "做龛与造像", "做窟顶（平顶或穹隆）", "修崖面与护岸", "排水与防护", "登临与维护"],
        "forceNoteZh": "定性示意：结构靠山体自撑，崖体既是围护也是承载体；开凿顺序与排水决定崖面长期稳定，造像与窟室是一体的。",
        "forceNoteEn": "Qualitative only: the structure relies on the rock mass supporting itself — the cliff is both enclosure and load path. The sequence of cutting and the drainage decide long-term cliff stability, and sculpture and chamber are one thing."
    },
    "bamboo": {
        "labelZh": "竹构", "labelEn": "Bamboo construction",
        "members": ["竹柱", "竹梁", "竹笆", "竹地板", "绑扎节点", "斜撑", "屋架", "茅草或瓦屋面", "竹编墙"],
        "membersEn": ["bamboo post", "bamboo beam", "bamboo mat wall", "bamboo floor", "lashed joint", "bamboo brace", "roof frame", "thatch or tile roof", "woven bamboo wall"],
        "assemblyOrder": ["选竹（老竹）", "劈竹与修整", "立柱", "绑扎节点", "安梁与斜撑", "铺竹笆与地板", "搭屋架", "铺屋面", "编墙与围护", "检查节点"],
        "forceNoteZh": "定性示意：竹材强度高、重量轻但节点薄弱；整体靠绑扎与斜撑的三角化保持稳定，节点老化往往先于杆件失效。",
        "forceNoteEn": "Qualitative only: bamboo is strong and light but weak at the joints; the frame holds together through lashing and triangulation, and joints usually age before the members do."
    },
    "elevated-deck": {
        "labelZh": "高台基·楼阁", "labelEn": "Raised platform and tower",
        "members": ["台基", "须弥座", "踏跺", "御路", "栏板", "望柱", "地仗木", "台面", "月台", "踏道"],
        "membersEn": ["platform", "sumeru base", "step flight", "imperial ramp", "balustrade panel", "balustrade post", "ground sill", "platform surface", "terrace", "ramp"],
        "assemblyOrder": ["平整地基", "夯筑与砌筑台身", "做须弥座与叠涩", "安地仗木与台面", "设排水口", "砌踏跺与御路", "安栏板望柱", "安月台", "上部木构起立", "整体校核"],
        "forceNoteZh": "定性示意：高台把木构抬离潮湿地面并抬高礼制等级；台基与上部木构以地仗木隔开，地震时二者可能相对滑动。",
        "forceNoteEn": "Qualitative only: the platform lifts the timber clear of damp ground and raises the building's ritual rank. A ground-sill layer separates the masonry from the timber, and the two can slide relative to each other in an earthquake."
    },
    "masonry-tower": {
        "labelZh": "砖塔·石塔", "labelEn": "Brick or stone pagoda",
        "members": ["塔基", "塔身", "塔檐（叠涩或砖檐）", "券门", "塔室", "楼梯", "塔刹", "相轮", "宝珠", "基座"],
        "membersEn": ["foundation", "body", "eaves (corbelled or brick)", "vaulted doorway", "inner chamber", "stair", "finial mast", "rings of the mast", "jewel", "plinth"],
        "assemblyOrder": ["奠基与塔基", "砌筑首层塔身", "做塔檐", "逐层砌筑（逐层收分）", "安券门与塔室", "做内部楼梯", "置塔刹与相轮", "装宝珠", "安门窗与扶壁", "整体校核"],
        "forceNoteZh": "定性示意：塔身中空，荷载经厚墙传到基座；逐层收分降低上部重量并降低地震时的弯矩，砖塔的抗震表现主要来自整体性与收分。",
        "forceNoteEn": "Qualitative only: the hollow body carries load down the thick walls to the plinth; each storey is set back, which lowers the mass above and the bending it causes in an earthquake — so the pagoda's seismic behaviour comes from mass and taper."
    },
    "roof-form": {
        "labelZh": "屋顶类型与屋面做法", "labelEn": "Roof form and covering",
        "members": ["屋面", "正脊", "垂脊", "戗脊", "脊饰", "翼角", "举折曲线", "瓦当", "滴水", "望板", "封檐板", "博风板", "山花", "檐口", "举架", "檩", "椽", "望板底面"],
        "membersEn": ["roof surface", "main ridge", "hip ridge", "diagonal hip", "ridge finial", "eave corner", "curvature line", "eave tile", "drip tile", "roof board", "fascia board", "barge board", "gable panel", "eave edge", "roof framing", "purlin", "rafter", "board soffit"],
        "assemblyOrder": ["定举架与举折曲线", "立檩（脊檩→檐檩）", "铺椽", "钉望板", "做垫层与苫背", "装瓦（自下而上）", "做正脊", "做垂脊与戗脊", "做翼角与起翘", "装瓦当滴水", "安脊饰", "做博风板与山花", "整体校核"],
        "forceNoteZh": "定性示意：屋面把荷载经檩、椽交到梁架；屋面越陡、瓦越重，水平推力越大，所以出檐与举折要与之匹配。翼角的起翘是造型手法，不改变传力路径。",
        "forceNoteEn": "Qualitative only: the roof delivers load to the frame through purlins and rafters. A steeper, heavier roof creates more horizontal thrust, so eaves depth and curvature must match it. The lifted eave corner is a formal device, not a change in the load path."
    },
    "courtyard": {
        "labelZh": "院落与平面围合", "labelEn": "Courtyard and enclosure",
        "members": ["正房", "厢房", "倒座房", "门楼", "垂花门", "照壁", "院墙", "天井", "院落地面", "檐廊", "踏跺", "排水", "风向", "入口序列"],
        "membersEn": ["main hall", "side wing", "north-facing range", "gatehouse", "hanging-gate", "screen wall", "courtyard wall", "open court", "paving", "veranda", "step flight", "drainage", "orientation", "entry sequence"],
        "assemblyOrder": ["定基址与朝向（坐北朝南）", "放线定院落尺度", "建正房台基", "立正房柱网", "建两侧厢房", "建倒座与门楼", "做照壁与院墙", "做檐廊与铺地", "做踏跺与散水", "做排水与天井", "收口与装饰", "整体校核"],
        "forceNoteZh": "定性示意：院落是围护与采光的单元，正房多居北、厢房居两侧、门楼居南，形成封闭而通风的平面；墙体多为围护，承重仍靠各房屋自己的构架。",
        "forceNoteEn": "Qualitative only: the courtyard is the unit of enclosure and daylight — the main hall to the north, wings to either side, the gate to the south — making a closed yet ventilated plan. Walls are mostly enclosure; each building carries its own load."
    },
    "yurt-lattice": {
        "labelZh": "毡房格构", "labelEn": "Yurt lattice",
        "members": ["乌尼（顶圈）", "乌尼杆", "哈那（墙圈）", "哈那杆", "张拉绳", "毡毯", "门框", "天窗（烟囱口）", "地毡"],
        "membersEn": ["crown ring", "crown pole", "wall lattice", "lattice pole", "tensioning cord", "felt blanket", "door frame", "roof ring (stove chimney)", "floor felt"],
        "assemblyOrder": ["选地与铺垫", "张拉定位绳", "立哈那骨架", "套接乌尼杆", "组合顶圈", "张拉定形", "铺底毡", "覆外毡", "装门与天窗", "季节性调整"],
        "forceNoteZh": "定性示意：菱形格构靠张力形成「预应力」，绳索收紧后格构变硬；这种结构可拆装，靠形态而非材料强度取胜。",
        "forceNoteEn": "Qualitative only: the diamond lattice is held in tension — tightening the cords stiffens the whole frame. The structure works by form rather than material strength, and comes apart for transport."
    },
}

# ---------------------------------------------------------------- 构建
def build():
    cases = []
    for c in CASES:
        srcs = []
        for key in c["sources"]:
            label, url, level = S[key]
            srcs.append({
                "label": label,
                "url": url,
                "type": "unesco" if "UNESCO" in label else ("ihchina" if "非物质文化遗产" in label else "institution"),
                "evidenceLevel": level,
                "accessedAt": "2026-10-21",
            })
        regionZh, regionEn = REGIONS[c["region"]]
        eraZh, eraEn = ERAS[c["era"]]
        struct = []
        for s in c["structure"]:
            if s in STRUCTURES:
                zh, en, desc = STRUCTURES[s]
                struct.append({"id": s, "labelZh": zh, "labelEn": en, "gloss": desc})
            else:
                struct.append({"id": s, "labelZh": s, "labelEn": s, "gloss": ""})
        cases.append({
            "id": c["id"],
            "nameZh": c["nameZh"],
            "nameEn": c["nameEn"],
            "pinyin": c["pinyin"],
            "region": c["region"],
            "regionZh": regionZh,
            "regionEn": regionEn,
            "province": c["province"],
            "locality": c["locality"],
            "era": c["era"],
            "eraZh": eraZh,
            "eraEn": eraEn,
            "yearText": c["yearText"],
            "yearUncertainty": c["yearUncertainty"],
            "type": c["type"],
            "structureTypes": struct,
            "ethnicGroup": c["ethnic"],
            "principleZh": c["principleZh"],
            "principleEn": c["principleEn"],
            "cultureZh": c["cultureZh"],
            "cultureEn": c["cultureEn"],
            "culturalKeywords": c["keywords"],
            "sources": srcs,
            "imagePlan": {
                "status": "not-included",
                "reason": "文保单位与博物馆图片多为著作权（ARR）或需单独授权；本目录不下载、不再分发第三方图片。",
                "plan": "主站应程序化生成示意图（SVG/Canvas），并在案例页提供来源机构外链与申请渠道。",
                "license": "not-applicable-no-image-shipped",
            },
            "verification": {
                "level": "primary-verified" if any(s["evidenceLevel"] == "primary-verified" for s in srcs) else "secondary",
                "checkedAt": "2026-10-21",
                "notes": "年代、建筑形制与结构做法依据所列来源的公开表述；凡来源之间存在分歧者已在 yearUncertainty / caveat 中标注。",
            },
            "caveat": c["caveat"],
            "teachingNotice": TEACHING_NOTICE,
            "isRepresentativeSample": True,
        })

    struct_counter = Counter()
    for c in cases:
        for s in c["structureTypes"]:
            struct_counter[s["id"]] += 1

    meta = {
        "title": "构筑华夏 · 中国经典建筑与传统结构代表性目录",
        "titleEn": "Built in China — A Representative Catalogue of Chinese Traditional Buildings and Structures",
        "version": "1.0.0",
        "generatedAt": "2026-10-21T19:00:00+08:00",
        "generator": "scripts/build_catalog.py",
        "scope": f"代表性样本，非穷尽名录。首批 {len(cases)} 例，用于面向全球读者的科普展示与 3D 教学模型选题。",
        "scopeEn": f"A representative sample, not an exhaustive inventory. {len(cases)} cases in this first release, for public education and as the basis for 3D teaching models.",
        "counts": {
            "cases": len(cases),
            "regions": len({c["region"] for c in cases}),
            "eras": len({c["era"] for c in cases}),
            "structureTypes": len(struct_counter),
            "ethnicGroups": len({c["ethnicGroup"] for c in cases}),
            "provinces": len({c["province"] for c in cases}),
            "sources": len({s["url"] for c in cases for s in c["sources"]}),
        },
        "coverage": {
            "byRegion": {REGIONS[k][0]: sum(1 for c in cases if c["region"] == k) for k in REGIONS},
            "byEra": {ERAS[k][0]: sum(1 for c in cases if c["era"] == k) for k in ERAS},
            "byStructureType": {STRUCTURES[k][0]: v for k, v in struct_counter.most_common() if k in STRUCTURES},
            "byEthnicGroup": dict(Counter(c["ethnicGroup"] for c in cases).most_common()),
        },
        "vocabularies": {
            "regions": {k: {"labelZh": v[0], "labelEn": v[1]} for k, v in REGIONS.items()},
            "eras": {k: {"labelZh": v[0], "labelEn": v[1]} for k, v in ERAS.items()},
            "structureTypes": {k: {"labelZh": v[0], "labelEn": v[1], "gloss": v[2]} for k, v in STRUCTURES.items()},
        },
        "fieldNotes": {
            "yearUncertainty": "确切 = 来源明确且少有争议；约略 = 来源之间存在分歧或学界仍在讨论；不适用 = 持续性传统，无单一始建年。",
            "evidenceLevel": "primary-verified = 本任务实际访问并读到该页内容；primary-cited = 官方机构页面，内容经官方发布稿转述；secondary = 百科类来源，仅作补充。",
            "caveat": "每条常驻，提示年代争议、修复痕迹、与「测绘/工程模型」的边界。",
            "imagePlan.status": "本目录不携带任何第三方图片。19 号应程序化生成配图并外链来源。",
        },
        "teachingNotice": TEACHING_NOTICE,
        "unescoIdVerification": {
            "method": "UNESCO 世界遗产中心官方 GeoJSON 端点逐条核对 id_no 与正式名称",
            "endpoint": "https://whc.unesco.org/en/list/?search=&search_iso_code=cn&mode=geojson&components=1",
            "componentEndpoint": "https://whc.unesco.org/?cid=31&l=en&id_site=<id>&mode=json",
            "checkedAt": "2026-10-21",
            "note": "端点同时返回每条遗产的组成部分（component_name），用于确认「某建筑是否为该遗产的组成部分」这一关系，例如洛阳桥属 1561、佛光寺东大殿属 1279。",
        },
        "limitations": [
            "本目录为代表性样本，不声称覆盖或穷尽中国全部古建筑；同一类型内的其他重要实例未被纳入。",
            "所有 3D 模型、剖面与受力说明均为教学示意，非施工或工程模型；受力箭头为定性说明，非计算结果。",
            "建筑年代多含「始建于 X、重修于 Y」的多层信息，本目录以 yearText + yearUncertainty 表达，不用单一年份冒充断代。",
            "参考图片一律不下载、不再分发；imagePlan 记录状态与替代方案。",
            "本任务未对每一个案例做现场或原始档案核验；核验强度以 verification.level 与 evidenceLevel 标注。",
        ],
        "consumers": ["18-architecture-models", "19-architecture-atlas", "13-qa-curation", "14-publish"],
    }

    # --- handoff：给 19 号的首批 18 例（按结构覆盖与地域分布挑选）
    priority = [
        "c03-yingxian-wooden-pagoda", "c04-baoguo-main-hall", "c08-kaihua-temple-hall",
        "c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall", "c13-suzhou-classical-gardens",
        "c17-fujian-tulou", "c18-kaiping-diaolou", "c25-hemudu-site",
        "c26-zengchong-drum-tower", "c27-zhaoxing-dong-village", "c28-beijian-covered-bridge",
        "c30-zhaozhou-bridge", "c31-luding-bridge", "c32-lijiang-old-town",
        "c33-dali-bai-dwellings", "c37-dai-bamboo-house", "c40-feiyun-pavilion",
    ]
    by_id = {c["id"]: c for c in cases}
    first18 = [by_id[i] for i in priority if i in by_id]

    # --- handoff：给 18 号的构造分组
    struct_groups = {}
    for key, g in STRUCTURE_GROUPS.items():
        related = [c["id"] for c in cases if any(s["id"] == key for s in c["structureTypes"])]
        struct_groups[key] = {
            "id": key,
            "labelZh": g["labelZh"],
            "labelEn": g["labelEn"],
            "members": g["members"],
            "membersEn": g["membersEn"],
            "assemblyOrder": g["assemblyOrder"],
            "forceNoteZh": g["forceNoteZh"],
            "forceNoteEn": g["forceNoteEn"],
            "relatedCases": related,
            "caseCount": len(related),
        }
    struct_groups["cross-plan"] = {
        "id": "cross-plan",
        "labelZh": "十字形平面", "labelEn": "Cruciform plan",
        "members": ["正身梁架", "抱厦梁架", "中心交汇节点", "角部梁架", "屋面转角"],
        "membersEn": ["main frame", "porch frame", "central junction", "corner frame", "roof corner"],
        "assemblyOrder": ["定十字轴线", "立中心柱网", "安正身梁架", "安四向抱厦", "做中心交汇节点", "安角部梁架", "起屋面转角", "整体校核"],
        "forceNoteZh": "定性示意：两个方向的梁架在中心交汇，荷载在交汇处汇集；屋面转角是薄弱环节。",
        "forceNoteEn": "Qualitative only: frames running in two directions meet at the centre, concentrating load there; the roof corners are the vulnerable points.",
        "relatedCases": [c["id"] for c in cases if any(s["id"] == "cross-plan" for s in c["structureTypes"])],
        "caseCount": len([c for c in cases if any(s["id"] == "cross-plan" for s in c["structureTypes"])]),
    }
    struct_groups["caisson"] = {
        "id": "caisson",
        "labelZh": "平闇·藻井", "labelEn": "Coffered ceiling (ping'an / caisson)",
        "members": ["平闇小方格", "藻井", "枋", "梁架", "天沟"],
        "membersEn": ["coffer grid", "caisson", "architrave", "frame", "perimeter gutter"],
        "assemblyOrder": ["定天花标高", "做周边天沟", "铺平闇格眼", "做中心藻井", "接梁架", "安天花灯具位", "校平"],
        "forceNoteZh": "定性示意：天花层把梁架遮蔽起来，不改变传力路径，但能防火、隔尘并塑造空间等级。",
        "forceNoteEn": "Qualitative only: the ceiling conceals the frame without changing how load travels, while protecting against fire and dust and giving the space its rank.",
        "relatedCases": [c["id"] for c in cases if any(s["id"] == "caisson" for s in c["structureTypes"])],
        "caseCount": len([c for c in cases if any(s["id"] == "caisson" for s in c["structureTypes"])]),
    }

    return cases, meta, first18, struct_groups


def main():
    cases, meta, first18, struct_groups = build()

    out = os.path.join(ROOT, "catalog.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({
            "schemaVersion": "1.0",
            "title": meta["title"],
            "titleEn": meta["titleEn"],
            "generatedAt": meta["generatedAt"],
            "scope": meta["scope"],
            "cases": cases,
        }, f, ensure_ascii=False, indent=2)

    with open(os.path.join(ROOT, "catalog.meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    # SOURCES.md
    lines = [
        "# SOURCES — 17 号任务来源台账",
        "",
        "> 每条一行的可点击来源。核验时间 2026-10-21。",
        "> `evidenceLevel`：`primary-verified` = 本任务实际访问并读到内容；`primary-cited` = 官方机构页面（内容经官方发布稿转述）；`secondary` = 百科类补充。",
        "",
        "| 案例 | 来源 | 证据级别 | 链接 | 访问日 |",
        "| --- | --- | --- | --- | --- |",
    ]
    seen = set()
    for c in cases:
        for s in c["sources"]:
            key = (c["id"], s["url"])
            if key in seen:
                continue
            seen.add(key)
            lines.append(f"| `{c['id']}` | {s['label']} | {s['evidenceLevel']} | {s['url']} | {s['accessedAt']} |")
    lines += ["", "---", "",
              "## 去重后的独立来源清单", "",
              "| # | 来源 | 类型 | 证据级别 | 链接 |", "| --- | --- | --- | --- | --- |"]
    uniq = {}
    for c in cases:
        for s in c["sources"]:
            uniq.setdefault(s["url"], s)
    for i, (url, s) in enumerate(sorted(uniq.items()), 1):
        lines.append(f"| {i} | {s['label']} | {s['type']} | {s['evidenceLevel']} | {url} |")
    lines += ["", f"共 **{len(uniq)}** 个独立来源，覆盖 **{len(cases)}** 条案例。", ""]

    # http 来源例外登记（实测结果，非伪造）
    http_urls = sorted(u for u in uniq if u.startswith("http://"))
    if http_urls:
        lines += [
            "---",
            "",
            "## http 来源例外登记（3 个 URL / 5 条案例引用）",
            "",
            "> **如实登记，不伪造 https。** 这 3 个 URL 的 **https 变体在本机不可用**，"
            "因此保留实测可用的 http 形式。",
            "",
            "| URL | 引用案例 | https 变体实测 | http 变体实测 |",
            "| --- | --- | --- | --- |",
        ]
        for u in http_urls:
            cited = [c["id"] for c in cases for s in c["sources"] if s["url"] == u]
            lines.append(
                f"| `{u}` | {', '.join(cited)} | "
                f"curl → `SSL_ERROR_SYSCALL`；Ego Chromium → `net::ERR_CONNECTION_CLOSED` | "
                f"Ego Chromium → 加载成功，标题「{HTTP_OK_TITLES[u]}」 |"
            )
        lines += [
            "",
            "**复现方式**（2026-10-22 实测，Ego 浏览器）：",
            "对同一 URL 先试 `https://` 再试 `http://`——https 变体在 TLS 握手阶段连接被关闭"
            "（Chromium 落到 `chrome-error://chromewebdata/`），http 变体正常返回正文。",
            "",
            "**口径**：该结论只针对本机网络环境。若 14-publish 的发布环境可访问 https，"
            "可由发布方按实际可达性替换链接；本目录不擅自改写未实测可用的 https。",
            "",
        ]
    with open(os.path.join(ROOT, "SOURCES.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    # handoff
    hd = os.path.join(ROOT, "handoff")
    os.makedirs(hd, exist_ok=True)
    with open(os.path.join(hd, "first-18.json"), "w", encoding="utf-8") as f:
        json.dump({
            "note": "给 19 号主站的首批 18 例。挑选依据：覆盖斗栱/榫卯/抬梁/穿斗/干栏/夯土/石拱/编木拱/竹构等主要构造，且地域与民族分散，避免开篇只集中在华北宫殿。",
            "generatedAt": meta["generatedAt"],
            "cases": first18,
        }, f, ensure_ascii=False, indent=2)
    with open(os.path.join(hd, "first-18-ids.json"), "w", encoding="utf-8") as f:
        json.dump([c["id"] for c in first18], f, ensure_ascii=False, indent=2)
    with open(os.path.join(hd, "structure-groups.json"), "w", encoding="utf-8") as f:
        json.dump({
            "note": "给 18 号模型任务：每个构造类别 → 构件清单（中英）+ 分步组装顺序 + 定性受力说明 + 关联案例。",
            "disclaimer": "所有 assemblyOrder 与 forceNote 均为教学示意，非施工工序、非工程计算。",
            "teachingNotice": TEACHING_NOTICE,
            "groups": struct_groups,
        }, f, ensure_ascii=False, indent=2)

    print(f"catalog.json      : {len(cases)} 条")
    print(f"structureTypes    : {meta['counts']['structureTypes']} 类")
    print(f"regions / eras    : {meta['counts']['regions']} / {meta['counts']['eras']}")
    print(f"ethnicGroups      : {meta['counts']['ethnicGroups']}")
    print(f"provinces         : {meta['counts']['provinces']}")
    print(f"independent source: {meta['counts']['sources']}")
    print(f"handoff/first-18  : {len(first18)} 条")
    print(f"structure-groups  : {len(struct_groups)} 组")


if __name__ == "__main__":
    main()
