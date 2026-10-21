#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_glossary.py — 生成 17 号任务的术语表 glossary.json。

术语分八类：构件 / 连接 / 屋面 / 结构体系 / 形制与礼制 / 材料与做法 /
桥与基础 / 民族与地方类型。

每条术语含：zh/en/拼音/分类/中英释义/关联案例/关联构造类别/使用提示。
关联案例 id 会在构建时对照 catalog.json 校验，写错 id 直接报错退出。

用法：python3 scripts/build_glossary.py
"""
from __future__ import annotations

import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# (id, 中文名, 英文名, 拼音, 分类, 中文释义, 英文释义, 关联案例id, 关联构造id, 提示)
TERMS = [
    # ------------------------------------------------------------ 构件
    ("g01", "斗栱", "Dougong (bracket set)", "Dǒugǒng", "构件",
     "柱头与额枋上由斗、栱、昂、升层层叠置的组合构件，是中国木构把屋檐出挑重量传回柱心的关键装置。",
     "A layered cluster of blocks, arms and cantilevering elements set on the column head and tie beam; it is the mechanism by which a Chinese timber frame carries the weight of the projecting eaves back to the columns.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c03-yingxian-wooden-pagoda", "c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall", "c40-feiyun-pavilion"],
     ["dougong"],
     "受力箭头只表示传力方向，不表示大小；具体做法随时代与地域差别很大。"),

    ("g02", "铺作", "Puzuo (bracket-set tier)", "Pūzuò", "构件",
     "计量斗栱的「层」的单位，一铺作指一组完整的出跳关系。宋《营造法式》以铺作为模数组织大木作。",
     "The unit that counts tiers of a bracket set: one puzuo is one complete set of projections. In the Song Yingzao Fashi the puzuo is the modular unit that organises the whole timber frame.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c03-yingxian-wooden-pagoda"],
     ["dougong"],
     "「七铺作双抄双下昂」是描述斗栱层数与出跳方向的术语，不等于构件数量。"),

    ("g03", "栌斗", "Base block (ludou)", "Lúdǒu", "构件",
     "安在柱头最下的大斗，承托整组斗栱，是柱与栱之间的过渡块。",
     "The largest block seated directly on the column head; it receives the whole bracket assembly and acts as the transition between column and arms.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c03-yingxian-wooden-pagoda"],
     ["dougong"], ""),

    ("g04", "华栱", "Hua gong (outer arm)", "Huágǒng", "构件",
     "向屋外挑出的栱，出跳时把屋檐重量向外传递并引回柱心。",
     "The arm that projects outward beyond the column line, carrying the eave weight outward and back toward the column axis.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c10-temple-of-heaven-prayer-hall"],
     ["dougong"], ""),

    ("g05", "泥道栱", "Nidao gong (inner arm)", "Nídào Gǒng", "构件",
     "架在阑额之上、不向外挑出的栱，联系相邻两柱并承托其上构件。",
     "The arm that sits on the tie beam without projecting outward; it links two neighbouring columns and carries what is placed above it.",
     ["c02-foguang-east-hall", "c03-yingxian-wooden-pagoda"],
     ["dougong"], ""),

    ("g06", "昂", "Ang (projecting cantilever)", "Áng", "构件",
     "由斗栱层伸出、向外下方倾斜的斜置构件，把屋檐的重量引向柱心，是出挑最远的一根杆件。",
     "A sloping member cantilevered out of the bracket cluster; it reaches the furthest outward and directs the eave load back toward the column axis.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c03-yingxian-wooden-pagoda"],
     ["dougong"], ""),

    ("g07", "耍头", "Shatou (beam head)", "Shǎtóu", "构件",
     "斗栱之上与昂、耍头相交的前伸构件，像一条伸出的短梁，端部承檐椽。",
     "The forward-projecting member that crosses the ang above the bracket cluster; it reads as a short beam and carries the eave rafters at its tip.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall"],
     ["dougong"], ""),

    ("g08", "令栱", "Ling gong (outermost arm)", "Lìnggǒng", "构件",
     "一组斗栱中最外一跳的栱，其上安三才升承托外檐。",
     "The outermost arm in a bracket set; the small blocks on top of it receive the eave purlin.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall"],
     ["dougong"], ""),

    ("g09", "交互斗", "Cross block (jiaohudou)", "Jiāohù Dǒu", "构件",
     "十字形置于华栱与泥道栱交叉处的小斗，把两个方向的栱锁在一起。",
     "A small cruciform block set where the outward and inward arms cross, locking the two directions together.",
     ["c03-yingxian-wooden-pagoda", "c40-feiyun-pavilion"],
     ["dougong"], ""),

    ("g10", "三才升", "Sancai sheng (stacked blocks)", "Sāncái Shēng", "构件",
     "斗栱最上层顺次叠置的三块小斗，承托檩或椽。",
     "Three small blocks stacked in sequence at the top of a bracket set, carrying the purlin or rafters.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall"],
     ["dougong"], ""),

    ("g11", "雀替", "Sparrow brace", "Quètì", "构件",
     "插在柱与额枋之间的小三角撑，缩短柱枋接触处的有效长度，是明清木构常见的加固件。",
     "A small triangular brace fitted between column and tie beam; it shortens the effective span at the joint and is a common reinforcement in Ming and Qing frames.",
     ["c40-feiyun-pavilion", "c09-forbidden-city-hall"],
     ["dougong", "tailiang"], ""),

    ("g12", "悬柱", "Suspended column", "Xuánzhù", "构件",
     "上端不落地、悬在梁枋之下的短柱，多见于楼阁与外廊，以增加出挑层次。",
     "A short column that hangs from the beams above instead of reaching the ground, used in towers and galleries to add another tier of projection.",
     ["c40-feiyun-pavilion"], ["dougong", "tailiang"], ""),

    ("g13", "瓜棱柱", "Melon column", "Guāléng Zhù", "构件",
     "由数根圆木拼合并在表面做出瓜棱凹槽而成的柱子，是宋代木构的标志做法。",
     "A column made by laminating several round timbers and carving melon-like flutes into the surface — a signature of Song timberwork.",
     ["c04-baoguo-main-hall", "c01-nanchan-main-hall", "c08-kaihua-temple-hall"],
     ["tailiang"],
     "保国寺大殿被公认为唯一能印证《营造法式》相关做法的宋代实物。"),

    ("g14", "阑额", "Lintel tie (lan'e)", "Lán'é", "构件",
     "横贯两柱之间、联系柱列的横木，柱间传递水平力的主要杆件之一。",
     "A horizontal beam spanning between two columns; together with the columns it forms the tie that resists horizontal movement in the frame.",
     ["c02-foguang-east-hall", "c03-yingxian-wooden-pagoda", "c40-feiyun-pavilion"],
     ["tailiang", "chuandou"], ""),

    ("g15", "普拍枋", "Puzuo plank", "Pǔpāi Fāng", "构件",
     "铺在阑额之上、贯穿柱列的通长扁木，逐层叠置后形成平直的承檩面，是宋代的重要构件。",
     "A continuous flat timber laid on top of the tie beam and run along the whole column line; stacked in layers it forms a level purlin-bearing surface.",
     ["c02-foguang-east-hall", "c04-baoguo-main-hall", "c08-kaihua-temple-hall"],
     ["tailiang"], ""),

    ("g16", "驼峰", "Camel saddle", "Tuófēng", "构件",
     "置于梁与蜀柱之间、呈驼峰状的小木垫块，用来缩短梁的支承长度。",
     "A small saddle-shaped block placed between a beam and the short strut above it, reducing the beam's effective span.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c08-kaihua-temple-hall"],
     ["tailiang"], ""),

    ("g17", "蜀柱", "Short strut", "Shǔzhù", "构件",
     "梁上立起、承托上一层梁或檩的短柱。",
     "A short post standing on a beam to carry the beam or purlin above it.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c08-kaihua-temple-hall"],
     ["tailiang"], ""),

    ("g18", "叉手", "Crossed brace", "Chāshǒu", "构件",
     "跨于梁背之上、左右对称斜置以互相抵撑的构件，是早期构架抵抗侧向变形的重要手段。",
     "A pair of symmetrically leaning members crossing above a beam and bracing against each other; an early means of resisting lateral deformation.",
     ["c08-kaihua-temple-hall", "c01-nanchan-main-hall"],
     ["tailiang"], ""),

    ("g19", "托脚", "Prop", "Tuōjiǎo", "构件",
     "自柱或梁斜向上托住檩的斜撑，与叉手共同构成早期梁架的稳定体系。",
     "A sloping prop leaning from the column or beam up to the purlin; together with the crossed braces it forms the early stabilising system of a frame.",
     ["c08-kaihua-temple-hall", "c01-nanchan-main-hall"],
     ["tailiang"], ""),

    ("g20", "檩", "Purlin", "Lǐn", "构件",
     "横向架在梁架之上、承托椽的纵向长杆，是屋面荷载汇集的第一层。",
     "A longitudinal member laid across the frames to carry the rafters; it is the first level at which roof loads are collected.",
     ["c01-nanchan-main-hall", "c03-yingxian-wooden-pagoda", "c40-feiyun-pavilion"],
     ["tailiang", "chuandou"], ""),

    ("g21", "椽", "Rafter", "Chuán", "构件",
     "铺在檩上、承托望板与屋面的小径杆，密排程度直接决定屋面质感。",
     "A small member laid closely on the purlins to carry the roof boards and covering; its spacing is a major part of how a roof reads.",
     ["c01-nanchan-main-hall", "c09-forbidden-city-hall"],
     ["tailiang"], ""),

    ("g22", "望板", "Roof boarding", "Wàngbǎn", "构件",
     "钉在椽上的连续木板，承接瓦件或苫背，隔离室内外。",
     "Continuous boarding nailed over the rafters; it carries the tile or thatch and separates the interior from the weather.",
     ["c01-nanchan-main-hall", "c10-temple-of-heaven-prayer-hall"],
     ["tailiang"], ""),

    ("g23", "柱础", "Column base", "Zhǔchǔ", "构件",
     "柱脚下的石质承台，把木柱的集中荷载扩散到地基，并隔绝地面潮气。",
     "The stone plinth under a column; it spreads the concentrated load into the ground and keeps the timber foot clear of damp.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c40-feiyun-pavilion"],
     ["tailiang", "chuandou"], ""),

    ("g24", "覆盆式柱础", "Basin-shaped column base", "Fùpénshì Zhǔchǔ", "构件",
     "柱础做成上凹如覆盆的样式，柱脚安入凹槽，是唐宋木构常见做法。",
     "A column base with a dished, basin-like top into which the timber foot is seated; a common Tang and Song detail.",
     ["c02-foguang-east-hall", "c01-nanchan-main-hall"],
     ["tailiang"], ""),

    # ------------------------------------------------------------ 连接
    ("g25", "榫卯", "Mortise and tenon", "Sǔnmǎo", "连接",
     "一端做凸榫、另一端凿对应卯眼，靠几何咬合与摩擦把两根木料锁定，不用钉铆的连接方式。",
     "A joint in which a projecting tenon fits a matching cut socket, locking two timbers by geometry and friction rather than by nails or bolts.",
     ["c25-hemudu-site", "c03-yingxian-wooden-pagoda", "c28-beijian-covered-bridge", "c40-feiyun-pavilion"],
     ["mortise-tenon", "timber-arch-bridge"],
     "河姆渡出土的多榫多孔构件被视作中国已知最早的榫卯实例之一。"),

    ("g26", "榫头", "Tenon", "Sǔtóu", "连接",
     "凸出的一端，插入对方构件的卯眼中。",
     "The projecting end of a timber that fits into a matching socket.",
     ["c25-hemudu-site", "c03-yingxian-wooden-pagoda"],
     ["mortise-tenon"], ""),

    ("g27", "卯眼", "Mortise", "Mǎoyǎn", "连接",
     "凿出的凹槽，承接榫头。",
     "The cut socket that receives the tenon.",
     ["c25-hemudu-site", "c40-feiyun-pavilion"],
     ["mortise-tenon"], ""),

    ("g28", "燕尾榫", "Dovetail", "Yànwěi Sǔn", "连接",
     "榫头做成外宽内窄的梯形，方向上无法拔出，靠形状而非摩擦锁定。",
     "A tenon cut in a trapezoid that widens outward; it cannot be withdrawn in that direction and is locked by shape rather than by friction.",
     ["c04-baoguo-main-hall", "c40-feiyun-pavilion"],
     ["mortise-tenon"], ""),

    ("g29", "穿带", "Through-tenon", "Chuāndài", "连接",
     "贯穿两块构件的通长木条或铁件，把两片构件夹持成整体，是大木作常用的水平联系手段。",
     "A continuous bar or iron strap passing through two members to clamp them into one; a common means of tying large timber members horizontally.",
     ["c03-yingxian-wooden-pagoda", "c40-feiyun-pavilion"],
     ["mortise-tenon"], ""),

    ("g30", "抱肩榫", "Shouldered joint", "Bàojiān Sǔn", "连接",
     "梁头做成带有凹曲肩部的榫，插入柱头或瓜棱柱的卯口，限制梁的转动与滑移。",
     "A beam head cut with a concave shoulder so it seats into the mortise of a column head, limiting rotation and sliding.",
     ["c04-baoguo-main-hall", "c01-nanchan-main-hall"],
     ["mortise-tenon"], ""),

    # ------------------------------------------------------------ 屋面
    ("g31", "举折", "Roof curvature (juzhe)", "Jǔzhé", "屋面",
     "用折线控制屋面坡度的方法：脊部陡、檐部缓，使屋面形成反宇曲线的弧度。",
     "The method of setting the roof profile as a broken line — steep at the ridge, flattening toward the eave — which produces the concave sweep of a Chinese roof.",
     ["c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall", "c13-suzhou-classical-gardens"],
     ["tailiang", "dougong"],
     "屋面曲线是分段近似的，不是一条真正的圆弧；模型中应按折线而非样条生成。"),

    ("g32", "翼角", "Eave corner", "Yìjiǎo", "屋面",
     "屋檐转角处向上翘出、层层出冲的角部，是最能代表中国屋顶形态的局部。",
     "The upturned, layered corner of the eave — the detail that most identifies a Chinese roof.",
     ["c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall", "c13-suzhou-classical-gardens"],
     ["dougong", "tailiang"], ""),

    ("g33", "戗檐", "Hip ridge flashing", "Qiàngyán", "屋面",
     "屋顶斜向棱脊上覆盖的瓦件，防水同时把屋面的分坡交代清楚。",
     "The tiled ridge running down a roof hip; it sheds water and also states how the roof is divided into slopes.",
     ["c09-forbidden-city-hall", "c06-longxing-mani-hall"],
     ["tailiang", "dougong"], ""),

    ("g34", "攒尖顶", "Pavilion roof (zanjian)", "Zánjiān Dǐng", "屋面",
     "屋面在顶部交汇于一点的顶式，多边形平面，常见于亭、塔与圆形殿堂。",
     "A roof in which all slopes meet at a single point above a polygonal plan, used for pavilions, pagodas and circular halls.",
     ["c10-temple-of-heaven-prayer-hall", "c13-suzhou-classical-gardens"],
     ["dougong", "tailiang"], ""),

    ("g35", "歇山顶", "Hip-and-gable roof", "Xiēshān Dǐng", "屋面",
     "由一段悬山与一段庑殿复合而成的屋顶，山面有山花博风板，是等级仅次于庑殿的顶式。",
     "A roof combining a half-gable and a half-hip, with a decorative gable panel; the second rank of roof type after the full hip roof.",
     ["c02-foguang-east-hall", "c23-shaolin-temple", "c03-yingxian-wooden-pagoda"],
     ["dougong", "tailiang"], ""),

    ("g36", "庑殿顶", "Full hip roof", "Wǔdiàn Dǐng", "屋面",
     "四面均做成斜坡、只在正面设门的高等级屋顶，帝王宫殿的常用顶式。",
     "A roof sloping on all four sides, entered only from the front; the highest-ranking roof form, used for imperial halls.",
     ["c09-forbidden-city-hall", "c23-shaolin-temple"],
     ["dougong", "tailiang", "elevated-deck"], ""),

    ("g37", "重檐", "Double eaves", "Chóngyán", "屋面",
     "一座建筑上下叠做两道屋檐，既增加气势，也把上部构架与下部台基在视觉上分层。",
     "Two tiers of eaves on one building; it adds monumentality and visually separates the upper frame from the platform below.",
     ["c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall"],
     ["dougong", "tailiang", "elevated-deck"], ""),

    # ------------------------------------------------------------ 结构体系
    ("g38", "抬梁式", "Tailiang (post-and-lintel) frame", "Táiliáng Shì", "结构体系",
     "柱上抬梁、梁上再抬梁，逐层收小叠成的木构架；各层梁架分工明确，室内可以通行。",
     "A frame in which beams are stacked tier on tier above the columns, each tier smaller than the one below, with clearly separated load-carrying levels and a walkable interior.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c04-baoguo-main-hall", "c08-kaihua-temple-hall", "c09-forbidden-city-hall"],
     ["tailiang"], ""),

    ("g39", "穿斗式", "Chuandou (column-and-tie) frame", "Chuāndǒu Shì", "结构体系",
     "柱直接承檩，并用穿枋把各柱串成整体的木构架；室内柱列密集，南方民居常见。",
     "A frame in which columns carry the purlins directly and are strung together by penetrating ties; dense rows of columns fill the interior, and it is common in southern vernacular buildings.",
     ["c27-zhaoxing-dong-village", "c26-zengchong-drum-tower", "c28-beijian-covered-bridge", "c37-dai-bamboo-house"],
     ["chuandou"], ""),

    ("g40", "抬梁穿斗混合", "Mixed tailiang-chuandou frame", "Hùnhé Tǐ", "结构体系",
     "下层用穿斗以提高刚度，上层用抬梁以争取高度，常用于多层楼阁。",
     "A frame that uses column-and-tie construction on the lower storeys for stiffness and stacked beams above for height, common in multi-storey towers.",
     ["c03-yingxian-wooden-pagoda", "c23-shaolin-temple", "c40-feiyun-pavilion"],
     ["mixed-frame"], ""),

    ("g41", "干栏式", "Stilted (ganlan) structure", "Gānlán Shì", "结构体系",
     "地板架空于短柱之上，人居其上，底部留空以防潮防虫；中国南方与东南亚山区广泛分布。",
     "A structure whose floor is raised on posts above the ground so that the space underneath stays dry and ventilated; widespread in southern China and Southeast Asia.",
     ["c25-hemudu-site", "c27-zhaoxing-dong-village", "c37-dai-bamboo-house"],
     ["ganlan"], ""),

    ("g42", "井干式", "Log cabin (jinggan) structure", "Jǐnggān Shì", "结构体系",
     "横木层层叠置、转角处十字咬合的墙体做法，墙体本身即承重墙，几乎不需要梁架。",
     "A wall built from horizontal logs stacked course on course and notched crosswise at the corners; the wall carries the load, so almost no frame is needed.",
     ["c35-manchu-log-house"], ["jinggan"], ""),

    ("g43", "金箱斗底槽", "Golden-coffer-and-base-trough plan", "Jīnxiāng Dǒudǐ Cáo", "结构体系",
     "殿身由内外两套梁架分别承重、内槽外套外槽的柱网布置，是唐宋大型殿堂的典型平面。",
     "A column arrangement in which an inner and an outer frame each carry the roof separately, the inner frame nested inside the outer — the typical plan of a large Tang or Song hall.",
     ["c01-nanchan-main-hall", "c02-foguang-east-hall", "c05-huayan-pujioge"],
     ["tailiang"], ""),

    ("g44", "十字形平面", "Cruciform plan", "Shízìxíng Píngmiàn", "形制与礼制",
     "两向梁架在中心交汇的平面，四出抱厦，屋面转角随之复杂，隆兴寺摩尼殿为著名实例。",
     "A plan in which frames in two directions meet at the centre, with projecting porches on all four sides and correspondingly complex roof corners.",
     ["c06-longxing-mani-hall"], ["cross-plan"], ""),

    ("g45", "平闇", "Coffered ceiling (ping'an)", "Píng'àn", "形制与礼制",
     "以小方格遮蔽梁架的平天花，作用在防火隔尘之外，也标示空间的等级。",
     "A flat coffered ceiling that hides the frame; beyond fire and dust protection it also signals the rank of the space.",
     ["c08-kaihua-temple-hall", "c04-baoguo-main-hall"],
     ["caisson"], ""),

    ("g46", "藻井", "Caisson ceiling", "Zǎojǐng", "形制与礼制",
     "天花中心向下凸出的方形木构装置，用叠落与彩画强化中心感，是室内等级的最高标志之一。",
     "A stepped, painted timber construction that drops from the centre of the ceiling, intensifying the focus and marking the highest interior rank.",
     ["c04-baoguo-main-hall", "c08-kaihua-temple-hall"],
     ["caisson"], ""),

    ("g47", "须弥座", "Sumeru base", "Xūmízuò", "形制与礼制",
     "由须弥山形象层层叠涩的石砌基座，用于高等级建筑与造像的承托。",
     "A tiered stone pedestal shaped after the mythical Mount Sumeru, used to carry high-ranking buildings and statues.",
     ["c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall", "c38-potala-palace"],
     ["elevated-deck"], ""),

    ("g48", "地仗木", "Ground sill", "Dìzhàng Mù", "形制与礼制",
     "铺在台基顶面、把木柱与石砌台身隔开的垫木层，使上部木构与下部砌体相对滑移。",
     "A layer of timber laid on the platform surface that separates the timber frame from the masonry below, letting the two slide relative to each other.",
     ["c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall"],
     ["elevated-deck"], ""),

    ("g49", "台基", "Raised platform", "Táijī", "形制与礼制",
     "把木构抬离地面的砖石或夯土平台，既防潮防蚁，也用高度表达建筑等级。",
     "A brick, stone or rammed-earth platform that lifts the timber frame clear of the ground; it keeps out damp and insects, and its height expresses rank.",
     ["c09-forbidden-city-hall", "c10-temple-of-heaven-prayer-hall", "c12-chengde-resort"],
     ["elevated-deck"], ""),

    ("g50", "开间", "Bay", "Kāijiān", "形制与礼制",
     "两根相邻柱轴线之间的水平距离；开间数是建筑等级最直观的标志。",
     "The horizontal distance between the axes of two adjacent columns; the number of bays is the most immediately legible marker of a building's rank.",
     ["c09-forbidden-city-hall", "c02-foguang-east-hall", "c01-nanchan-main-hall"],
     ["tailiang", "elevated-deck"], ""),

    ("g51", "副阶周匝", "Surrounding porch", "Fùjiān Zhōuzā", "形制与礼制",
     "主体建筑四周环设一圈单檐廊的做法，礼制等级中占一档，现存实例稀少。",
     "A single-eave gallery running all round the main body of a hall; it occupies a distinct rank in the hierarchy, and few such examples survive.",
     ["c05-huayan-pujioge", "c07-jinci-holy-mother-hall"],
     ["tailiang"], ""),

    # ------------------------------------------------------------ 材料与做法
    ("g52", "夯土", "Rammed earth", "Hāngtǔ", "材料与做法",
     "在夹板内分层填土夯实而成的墙体，掺石灰与砂砾可提高强度与防水性。",
     "A wall built by filling earth in thin lifts between formwork boards and compacting it; lime and gravel improve strength and water resistance.",
     ["c17-fujian-tulou", "c18-kaiping-diaolou", "c19-pingyao-ancient-city", "c33-dali-bai-dwellings"],
     ["rammed-earth"], ""),

    ("g53", "版筑", "Formwork ramming", "Bǎnzhù", "材料与做法",
     "夯土时使用的木夹板与立柱，限制夯层宽度，保证墙体收分与平整。",
     "The timber boards and posts that form the mould for ramming; they control the width of each lift and keep the wall true and tapering.",
     ["c17-fujian-tulou", "c19-pingyao-ancient-city"],
     ["rammed-earth"], ""),

    ("g54", "窑洞", "Earthen cave dwelling", "Yáodòng", "材料与做法",
     "在黄土崖壁上掏挖或在地坑中做券洞形成的居所，土体本身既是围护也是结构。",
     "A dwelling hollowed out of a loess cliff or formed as a vaulted pit below ground, in which the earth itself serves as both enclosure and structure.",
     ["c42-baise-cellar-courtyard"],
     ["yaodong"],
     "「窑洞营造技艺」已列入国家级非物质文化遗产名录；陕北与甘肃庆阳做法不同。"),

    ("g55", "生土", "Rammed earth and adobe", "Shēngtǔ", "材料与做法",
     "未经烧结的土料，包括夯土与土坯，取材方便、透气保温，但怕水。",
     "Unfired earth — rammed or adobe — cheap to obtain, breathable and insulating, but vulnerable to water.",
     ["c17-fujian-tulou", "c42-baise-cellar-courtyard", "c19-pingyao-ancient-city"],
     ["rammed-earth", "yaodong"], ""),

    ("g56", "竹构", "Bamboo construction", "Zhúgòu", "材料与做法",
     "以竹为柱、梁、笆并用绑扎连接的轻型木构，整体轻而韧，节点老化常先于杆件失效。",
     "A light timber-like construction in which bamboo culms serve as posts, beams and matting, tied together at the joints; the frame is light and resilient, and its joints usually age before its members fail.",
     ["c37-dai-bamboo-house"], ["bamboo"], ""),

    ("g57", "毡房格构", "Yurt lattice", "Zhīnfáng Gégòu", "材料与做法",
     "由可折叠的杆件组成菱形格构、外覆羊毛毡的帐幕式结构，靠张力变硬，可拆可迁。",
     "A collapsible lattice of poles in a diamond pattern, covered with felt; the frame stiffens under tension and can be taken down and moved with the herd.",
     ["c36-mongolian-yurt"], ["yurt-lattice"], ""),

    ("g58", "蚩索", "Cattail rope binding", "Chísuǒ", "材料与做法",
     "以蒲草、苇秆搓成的绳索，用于捆绑与绑扎，是干栏与竹构节点常用的传统材料。",
     "A rope twisted from cattail or reed, used for lashing and binding; a traditional jointing material in stilted and bamboo construction.",
     ["c27-zhaoxing-dong-village", "c37-dai-bamboo-house"],
     ["ganlan", "bamboo"], ""),

    # ------------------------------------------------------------ 桥与基础
    ("g59", "编木拱桥", "Woven timber arch bridge", "Biānmùgǒng Qiáo", "桥与基础",
     "用短杆件穿插编织成篮形拱架的桥梁，拱架自重承压，荷载侧向传给桥台。",
     "A bridge whose arch is woven from short members into a basket-like frame; the arch carries load in compression and transfers it sideways into the abutments.",
     ["c28-beijian-covered-bridge", "c29-xianju-bridge"],
     ["timber-arch-bridge"],
     "「中国木拱桥传统营造技艺」于 2024 年 12 月由急需保护名录转入人类非物质文化遗产代表作名录。"),

    ("g60", "三节苗与五节苗", "Three- and five-section arch members", "Sānjié Miáo", "桥与基础",
     "编木拱桥中长度不同的两类主杆件，长短相间编织成拱。",
     "The two standard lengths of primary member in a woven timber arch; long and short members interlace to form the curve.",
     ["c28-beijian-covered-bridge", "c29-xianju-bridge"],
     ["timber-arch-bridge"], ""),

    ("g61", "桥台", "Abutment", "Qiáotái", "桥与基础",
     "承接桥梁端部并把水平推力传回地基的砌体或木构支座。",
     "The support at the end of a bridge that receives the end bearing and returns the horizontal thrust into the ground.",
     ["c28-beijian-covered-bridge", "c30-zhaozhou-bridge", "c41-luoyang-bridge"],
     ["timber-arch-bridge", "stone-arch"], ""),

    ("g62", "敞肩式石拱", "Open-spandrel stone arch", "Chǎngjiān Shì Shígǒng", "桥与基础",
     "在主拱两肩之上再开小拱以减重并泄洪的做法，赵州桥为此型代表。",
     "A stone arch with smaller openings above the main arch shoulders, reducing weight and doubling as flood openings; the Zhaozhou Bridge is the classic example.",
     ["c30-zhaozhou-bridge"], ["stone-arch"], ""),

    ("g63", "拱券石", "Voussoir", "Gǒngquànshí", "桥与基础",
     "构成拱圈的楔形石块，靠互相挤压把压力沿拱轴传下去。",
     "A wedge-shaped stone forming part of the arch ring; each one squeezes its neighbours, passing compression along the arch axis.",
     ["c30-zhaozhou-bridge", "c41-luoyang-bridge", "c13-suzhou-classical-gardens"],
     ["stone-arch"], ""),

    ("g64", "筏形基础", "Raft foundation", "Fáshēng Jīchǔ", "桥与基础",
     "以整片条石或木板铺成的扩大基础，把上部集中荷载分散到软弱地基。",
     "An enlarged foundation of continuous stone slabs or timber that spreads concentrated loads over weak ground.",
     ["c41-luoyang-bridge"], ["stone-arch"], ""),

    ("g65", "种蛎固基", "Oyster-founded base", "Zhònglì Gùjī", "桥与基础",
     "在桥基水下播种牡蛎，利用其分泌物与贝壳连缀固结基脚的做法，见于泉州洛阳桥。",
     "A technique of seeding oysters on an underwater foundation so that their shells and secretions bond the base; it is recorded at Luoyang Bridge in Quanzhou.",
     ["c41-luoyang-bridge"], ["stone-arch", "rammed-earth"], ""),

    ("g66", "廊屋", "Covered gallery", "Lángwū", "桥与基础",
     "架设在桥面上、遮蔽风雨的廊式建筑，多为穿斗式木构，兼作庙会与交通空间。",
     "A roofed gallery built over a bridge deck, usually in a column-and-tie timber frame, sheltering travellers and serving as a communal space.",
     ["c28-beijian-covered-bridge", "c29-xianju-bridge"],
     ["timber-arch-bridge", "chuandou"], ""),

    ("g67", "铁索桥", "Iron-chain suspension bridge", "Tiěsuǒ Qiáo", "桥与基础",
     "以铁链或绳索承托桥面、水平分力全由两岸锚碇承担的桥梁形式。",
     "A bridge whose deck hangs on chains or ropes, with the whole horizontal pull taken by anchorages at each bank.",
     ["c31-luding-bridge"], ["chain-bridge"], ""),

    # ------------------------------------------------------------ 民族与地方类型
    ("g68", "三坊一照壁", "Three-bay-and-one-screen house", "Sānfāng Yīzhàobì", "民族与地方类型",
     "白族民居的标准格局：三面房舍围合，正面照壁封闭院落，平面紧凑。",
     "The standard Bai dwelling layout: houses on three sides, a screen wall closing the fourth, forming a compact courtyard.",
     ["c33-dali-bai-dwellings", "c32-lijiang-old-town"],
     ["tailiang", "chuandou"], ""),

    ("g69", "碉楼", "Diaolou (watchtower house)", "Diāulóu", "民族与地方类型",
     "土石或混凝土砌筑的塔状居住兼防御体，墙厚窗小，孤立守卫，俯瞰村落。",
     "A tower-like dwelling and lookout built of earth, stone or concrete, with thick walls and small openings, standing alone to watch over a village.",
     ["c18-kaiping-diaolou"], ["rammed-earth"], ""),

    ("g70", "碉", "Qiang tower", "Diāo", "民族与地方类型",
     "羌族村寨中的石砌防御性高塔，顶部四角出檐，是村寨的制高点与标志。",
     "A masonry defensive tower in a Qiang village, its four roof corners projecting outward; it is the village's high point and landmark.",
     ["c34-taoping-qiang-village"], ["rammed-earth"], ""),

    ("g71", "鼓楼", "Drum tower", "Gǔlóu", "民族与地方类型",
     "侗族村寨的公共中心，底层架空、层叠出檐，内部设鼓，为议事与集会之所。",
     "The communal centre of a Dong village, raised on an open base with stacked projecting eaves and a drum inside; it is where the village assembles and deliberates.",
     ["c26-zengchong-drum-tower", "c27-zhaoxing-dong-village"],
     ["ganlan", "chuandou"], ""),

    ("g72", "封火山墙", "Fire-sealing gable wall", "Fēnghuǒ Shānqiáng", "民族与地方类型",
     "高出屋面的山墙，多用砖砌，既挡火又分隔相邻院落。",
     "A gable wall rising above the roof, usually in brick, that both seals against fire and separates adjoining courtyards.",
     ["c15-hongcun-village", "c16-xidi-village"], ["rammed-earth"], ""),

    ("g73", "三雕", "Three carvings", "Sāndiāo", "民族与地方类型",
     "徽州民居门楼与构件上的砖雕、木雕、石雕合称，构成本地最鲜明的装饰语言。",
     "Brick, wood and stone carving on Huizhou doorways and members — the three carving media that form the area's most distinctive decorative vocabulary.",
     ["c16-xidi-village", "c15-hongcun-village"], ["tailiang"], ""),

    ("g74", "窑洞院落", "Pit courtyard", "Yáodòng Yuànluò", "民族与地方类型",
     "在黄土地下挖出方形或长方形地坑，四壁做窑洞居室的院落形式，陕北常见。",
     "A courtyard dug down into the loess, with cave dwellings cut into its four walls; a characteristic form of northern Shaanxi.",
     ["c42-baise-cellar-courtyard"], ["yaodong"], ""),
]


def main() -> int:
    catalog_path = os.path.join(ROOT, "catalog.json")
    with open(catalog_path, encoding="utf-8") as f:
        catalog = json.load(f)
    known_cases = {c["id"] for c in catalog["cases"]}
    known_struct = {s["id"] for s in catalog["cases"][0]["structureTypes"]}
    # structureTypes 是并集，逐条收集更稳
    known_struct = set()
    for c in catalog["cases"]:
        for s in c["structureTypes"]:
            known_struct.add(s["id"])

    entries = []
    errors = []
    for (tid, zh, en, pinyin, cat, dzh, den, cases, structs, note) in TERMS:
        for cid in cases:
            if cid not in known_cases:
                errors.append(f"{tid} 引用了不存在的案例 id：{cid}")
        for sid in structs:
            if sid not in known_struct:
                errors.append(f"{tid} 引用了不存在的构造 id：{sid}")
        entries.append({
            "id": tid,
            "termZh": zh,
            "termEn": en,
            "pinyin": pinyin,
            "category": cat,
            "definitionZh": dzh,
            "definitionEn": den,
            "relatedCases": cases,
            "relatedStructures": structs,
            "note": note,
        })

    if errors:
        for e in errors:
            print("ERROR:", e)
        return 1

    by_cat = {}
    for e in entries:
        by_cat.setdefault(e["category"], []).append(e["id"])

    out = {
        "schemaVersion": "1.0",
        "title": "构筑华夏 · 中国传统建筑与结构术语表",
        "titleEn": "Built in China — Glossary of Chinese Traditional Architecture and Structure",
        "generatedAt": "2026-10-21T21:30:00+08:00",
        "generator": "scripts/build_glossary.py",
        "scope": f"首批 {len(entries)} 条术语，覆盖构件、连接、屋面、结构体系、形制与礼制、材料与做法、桥与基础、民族与地方类型八类。",
        "scopeEn": f"{len(entries)} entries in the first release, across eight categories: components, joints, roof forms, structural systems, form and rank, materials and techniques, bridges and foundations, and regional and ethnic types.",
        "termCount": len(entries),
        "categories": {k: len(v) for k, v in by_cat.items()},
        "fieldNotes": {
            "pinyin": "带声调符号；连写不加空格，仅专名之间以空格分隔。",
            "relatedCases": "引用 catalog.json 中的案例 id，已在构建时校验存在性。",
            "relatedStructures": "引用构造类别 id（catalog.meta.json 的 vocabularies.structureTypes），已校验。",
            "note": "使用提示：常见误用、时代限定或教学表达边界。",
        },
        "disclaimer": "所有受力、构造与形制说明均为教学示意，非施工工序、非工程计算。",
        "teachingNotice": {
            "isSchematic": True,
            "labelZh": "教学示意，非施工/工程模型",
            "labelEn": "Teaching illustration — not a construction or engineering model.",
            "forceNoteZh": "受力箭头为定性说明，非工程计算；箭头仅表示传力方向，不表示大小。",
            "forceNoteEn": "Force arrows are qualitative, not an engineering calculation; they indicate the direction of load transfer, not its magnitude.",
            "appliesTo": ["3D 装配 / 拆解视图", "剖面与节点放大", "受力箭头、推力线与传力路径", "构件分解图与爆炸图"],
            "mustNotClaim": ["不得声称是测绘成果或复原依据", "不得给出荷载、应力、允许跨度等工程数值", "不得省略本声明"],
            "propagateTo": ["18-architecture-models", "19-architecture-atlas", "13-qa-curation"],
        },
        "terms": entries,
    }

    path = os.path.join(ROOT, "glossary.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"glossary.json     : {len(entries)} 条术语")
    for k, v in out["categories"].items():
        print(f"  - {k}: {v}")
    linked = len({cid for e in entries for cid in e["relatedCases"]})
    print(f"覆盖案例          : {linked} / {len(known_cases)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
