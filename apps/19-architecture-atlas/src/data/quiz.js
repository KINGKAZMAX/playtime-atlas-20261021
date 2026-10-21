/**
 * Quiz — 10 questions across structure, region and dating.
 * Each question explains the answer, because a quiz that only scores you
 * teaches less than one that shows why.
 */

export const QUIZ = [
  {
    id: 'q1',
    q: { zh: '中国木构建筑里，斗栱最基本的作用是什么？', en: 'In Chinese timber architecture, what is the fundamental job of a dougong bracket set?' },
    options: [
      { zh: '把屋檐挑出去，同时把屋面荷载分级传回柱子', en: 'To push the eaves outward while stepping the roof load back down to the columns' },
      { zh: '纯粹的装饰，不承担结构作用', en: 'Pure decoration, with no structural role' },
      { zh: '把柱子之间的墙填满', en: 'To fill the gaps between columns with wall' },
      { zh: '为屋顶收集雨水', en: 'To collect rainwater for the roof' },
    ],
    answer: 0,
    explain: {
      zh: '斗栱是一组可按材等与出跳数增减的木构件。它把屋檐一段段挑出去（解决出檐与采光），也把屋面重量一级一级交回柱头（解决受力）。它的装饰性是结果，不是目的——早期斗栱往往比后期大得多，正说明它先有结构职能。',
      en: 'A dougong is a family of members that can be scaled by timber grade and by the number of outward steps. It throws the eaves out in stages (shade and light) and hands the roof weight back to the column heads in stages (load path). The decoration is a consequence: early bracket sets are far larger than late ones, because the structural job came first.',
    },
  },
  {
    id: 'q2',
    q: { zh: '「榫卯」与「斗栱」的区别是什么？', en: 'What is the difference between a mortise-and-tenon joint and a dougong bracket set?' },
    options: [
      { zh: '榫卯是连接两件木头的节点，斗栱是层层出跳的构件组', en: 'A mortise-and-tenon is a joint between two timbers; a dougong is a stacked set of projecting members' },
      { zh: '两者完全相同', en: 'They are the same thing under two names' },
      { zh: '榫卯用于石构，斗栱用于木构', en: 'Mortise-and-tenon is for stone, dougong is for timber' },
      { zh: '斗栱是屋面材料，榫卯是地面材料', en: 'Dougong is a roofing material, mortise-and-tenon is a flooring material' },
    ],
    answer: 0,
    explain: {
      zh: '榫卯解决的是「两块木头怎么连在一起」，斗栱解决的是「屋檐怎么挑出去、荷载怎么传回来」。一个属于节点，一个属于构件组。',
      en: 'A mortise-and-tenon answers "how do two timbers meet"; a dougong answers "how do the eaves reach out and how does the load come back". One is a joint, the other a member assembly.',
    },
  },
  {
    id: 'q3',
    q: { zh: '赵州桥最著名的结构创新是什么？', en: 'What is the best-known structural innovation of Zhaozhou Bridge?' },
    options: [
      { zh: '敞肩：在主拱两侧留小拱，省料、减重、利于过水', en: 'The open shoulder: small arches flanking the main span, saving weight and letting water through' },
      { zh: '使用了钢筋混凝土', en: 'The use of reinforced concrete' },
      { zh: '桥面完全用木材铺设', en: 'A roadway entirely of timber' },
      { zh: '跨度超过一千米', en: 'A span of more than a kilometre' },
    ],
    answer: 0,
    explain: {
      zh: '敞肩让桥身自重大幅下降，洪水期水流可以直接从小拱穿过，减小对桥台与桥墩的冲击。可比较的欧洲做法要晚约七个世纪。',
      en: 'The open shoulders cut dead weight dramatically and let flood water pass straight through, easing the load on the abutments. Comparable European solutions followed roughly seven centuries later.',
    },
  },
  {
    id: 'q4',
    q: { zh: '佛光寺东大殿为什么重要？', en: 'Why is the East Hall of Foguang Temple so important?' },
    options: [
      { zh: '它是现存等级最高、规模最大、保存最完整的唐代木构建筑', en: 'It is the highest-ranked, largest and best-preserved surviving Tang timber building' },
      { zh: '它是现存最高大的木塔', en: 'It is the tallest surviving wooden pagoda' },
      { zh: '它是中国最古老的石拱桥', en: 'It is the oldest stone arch bridge in China' },
      { zh: '它是故宫太和殿的早期原型', en: 'It is the prototype for the Hall of Supreme Harmony' },
    ],
    answer: 0,
    explain: {
      zh: '1937 年梁思成、林徽因根据文献与现场考察确认其为唐代遗构，此前学界普遍认为「中国无唐构」。同年应县木塔的发现则颠覆了「中国已无辽构木塔」的看法。两例常被并列引用。',
      en: 'In 1937 Liang Sicheng and Lin Huiyin identified it as Tang work from documents and on-site evidence, at a time when the scholarly consensus held that no Tang timber survived in China. The Yingxian pagoda, found the same year, overturned the parallel belief that no Liao timber pagoda remained.',
    },
  },
  {
    id: 'q5',
    q: { zh: '「抬梁」与「穿斗」最主要的区别是什么？', en: 'What is the main difference between the taoliang and chuandou timber systems?' },
    options: [
      { zh: '抬梁由梁上立短柱逐层抬高，穿斗由密排柱子直接承檩', en: 'Taoliang raises the frame in stages on short columns above beams; chuandou has closely spaced columns carrying the purlins directly' },
      { zh: '抬梁用砖，穿斗用石', en: 'Taoliang uses brick and chuandou uses stone' },
      { zh: '抬梁只能用于宗教建筑', en: 'Taoliang can only be used for religious buildings' },
      { zh: '两者只是南北叫法不同', en: 'They are just regional names for the same thing' },
    ],
    answer: 0,
    explain: {
      zh: '抬梁室内空旷、可塑性高，多见于宫殿、寺院与高级住宅；穿斗用小料、施工快、结构直接，多见于民居与地方建筑。',
      en: 'Taoliang yields tall, adaptable interiors and appears in palaces, temples and fine residences. Chuandou uses smaller timber, goes up fast and speaks plainly, and turns up in ordinary houses and regional building.',
    },
  },
  {
    id: 'q6',
    q: { zh: '都江堰为什么不修拦河大坝？', en: 'Why does Dujiangyan not have a river-blocking dam?' },
    options: [
      { zh: '用鱼嘴分水、飞沙堰泄洪排沙、宝瓶口引水，靠无坝引水', en: 'It divides, spills and diverts with the Yuzui split, the Feishuyan spillway and the Baopingkou intake — a weir-free system' },
      { zh: '当时没有能力修筑大型石坝', en: 'They lacked the engineering capacity to build a large stone dam' },
      { zh: '大坝会被地震震垮', en: 'A dam would be destroyed by earthquakes' },
      { zh: '大坝会阻断鱼类洄游', en: 'A dam would block fish migration' },
    ],
    answer: 0,
    explain: {
      zh: '把河水分开而不是拦下，河流仍然下泄，同时把洪水与泥沙送往外江。这是「因势利导」而非「与水对抗」的例子。',
      en: 'The river is separated rather than stopped, so it keeps flowing while flood water and silt are sent to the outer channel. It works with the river rather than against it.',
    },
  },
  {
    id: 'q7',
    q: { zh: '土楼的厚墙最主要是为了什么？', en: 'What is the main purpose of the thick wall of a tulou?' },
    options: [
      { zh: '同时承重与防御', en: 'To carry the load and to defend at the same time' },
      { zh: '为了在墙上挂画', en: 'To provide a wall to hang paintings on' },
      { zh: '为了隔热', en: 'To keep the interior cool' },
      { zh: '为了节省木材', en: 'To save timber' },
    ],
    answer: 0,
    explain: {
      zh: '环形夯土厚墙是整座土楼的结构主体，也是它的防御外壳。底层不开窗、二层小窗，正是这两重功能在同一道墙上的折中。',
      en: 'The rammed-earth ring wall is both the bearing structure and the defensive envelope. No ground-floor windows and small upper openings are the compromise between the two jobs in one wall.',
    },
  },
  {
    id: 'q8',
    q: { zh: '晋祠圣母殿的「柱升起」和「柱侧角」分别带来什么？', en: 'What do the "stepped columns" and "inward-leaning columns" of the Holy Mother Hall each produce?' },
    options: [
      { zh: '前者使屋檐曲线更翘，后者提高抗震稳定', en: 'The first curves the eave upward; the second improves stability in earthquake' },
      { zh: '前者提高抗震稳定，后者使屋檐曲线更翘', en: 'The first improves stability; the second curves the eave' },
      { zh: '两者都是为了排水', en: 'Both are about drainage' },
      { zh: '两者都只是装饰手法', en: 'Both are purely decorative' },
    ],
    answer: 0,
    explain: {
      zh: '柱升起把同一排柱子逐根垫高六厘米，做出翼角上翘的视觉曲线；柱侧角让所有廊柱微微内倾，使木构形成浅三角形体系，在地震中更稳。两者并用，是《营造法式》明确记载的做法。',
      en: 'Stepping the columns up by 6 cm each produces the upswept corner; leaning them inward turns the frame into shallow triangles that resist earthquake. Both are recorded explicitly in the Yingzao Fashi.',
    },
  },
  {
    id: 'q9',
    q: { zh: '关于本目录的覆盖范围，正确的说法是？', en: 'Which statement about this catalog\'s coverage is correct?' },
    options: [
      { zh: '它是一个代表性样本，不声称穷尽全部中国古建筑', en: 'It is a representative sample and does not claim to exhaust Chinese historic building' },
      { zh: '它收录了全部全国重点文物保护单位', en: 'It includes every national key cultural relic' },
      { zh: '它只收录世界遗产', en: 'It includes only World Heritage sites' },
      { zh: '它只收录木结构建筑', en: 'It includes only timber structures' },
    ],
    answer: 0,
    explain: {
      zh: '本目录覆盖八大地域、十个时代、十六类构造，选取标准是能否解释一种构造或文化逻辑，而不是名望或完整度。地球另一端的中国建筑不在此处。',
      en: 'This catalog spans eight regions, ten eras and sixteen structural systems, selected for what they explain about building rather than for fame or completeness. Chinese architecture elsewhere in the world is not represented here.',
    },
  },
  {
    id: 'q10',
    q: { zh: '独乐寺观音阁在外观上看起来是几层？', en: 'How many storeys does the Guanyin Pavilion appear to have from outside?' },
    options: [
      { zh: '两层——中间夹着一个从外面看不见的暗层', en: 'Two — with a concealed storey hidden between them' },
      { zh: '一层', en: 'One' },
      { zh: '三层，全部外露', en: 'Three, all visible' },
      { zh: '五层', en: 'Five' },
    ],
    answer: 0,
    explain: {
      zh: '观音阁外观两层，内部实为三层，中间那道仅一米多高的暗层用大量斜撑把空间变成三角形，平面又由矩形逐层收为六角、八角。刚性的斗栱层与柔性的柱层叠在一起，组成半刚性体系——这是它历经二十八次大地震而不倒的结构原因。',
      en: 'It looks like two storeys and is really three. The concealed middle level, barely a metre high, is packed with diagonal braces that turn the space into triangles, while the plan steps from rectangle to hexagon to octagon. A stiff bracket layer over a flexible column layer makes the frame semi-rigid — the structural reason it has withstood twenty-eight major earthquakes.',
    },
  },
];

export const QUIZ_COUNT = QUIZ.length;
