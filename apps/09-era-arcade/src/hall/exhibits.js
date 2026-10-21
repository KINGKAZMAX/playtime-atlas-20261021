/**
 * 霓虹街廊 · 街机可玩展厅
 * src/hall/exhibits.js — 展厅展品数据 + 带来源的时代介绍（中英双语）
 *
 * 所有史实陈述均附可点击来源链接（博物馆藏品页 / 百科条目）。
 * 本展厅两款游戏为原创演绎：机制取自街机黄金时代的共性范式，
 * 但角色、地图、规则、音效、视觉与文案全部重新设计。
 *
 * 双语：中文在前、英文在后。英文版为同义重写，非机器直译。
 */

export const HALL_NAME = {
  cn: '霓虹街廊',
  en: 'NEON CORRIDOR',
  sub: '街机可玩展厅 · 1980s',
  subEn: 'Arcade Playable Hall · 1980s',
};

/** 展厅中的四台终端 */
export const EXHIBITS = [
  {
    id: 'lattice',
    cn: '晶格回廊',
    en: 'LATTICE CORRIDOR',
    x: 96,
    accent: '#26e6ff',
    kind: 'game',
    tagline: '收集全部晶核，从相位之门撤离',
    taglineEn: 'Collect every core, then leave through the phase gate',
    brief: '在会自我闭合的晶格回廊中回收晶核。相位穿行让你穿墙，残响替你引开游丝。',
    briefEn: 'Recover the cores inside a self-sealing lattice corridor. A phase dash carries you through walls; an echo lures the drifters away.',
    rules: [
      '方向键 / WASD 移动，拾取全部晶核后归途门开启',
      '空格 = 相位穿行：向前穿墙两格，消耗 1 点相位能量',
      'E = 释放残响：原地留下诱饵，吸引巡守 6 秒',
      '巡守会追踪残响，也会追踪你——别停在原地',
      '收齐晶核后进入归途门，前往下一层回廊',
    ],
    rulesEn: [
      'Arrows / WASD move you around; the gate opens once every core is collected',
      'Space = phase dash: pass through two cells of wall, costing one charge',
      'E = echo: leave a decoy that pulls the wardens for six seconds',
      'Wardens chase echoes as well as you — never stand still',
      'Enter the gate once the cores are gone, to reach the next corridor',
    ],
    controls: '方向键移动 · 空格 相位穿行 · E 残响 · P 暂停 · R 重开',
    controlsEn: 'Arrows move · Space phase dash · E echo · P pause · R restart',
  },
  {
    id: 'meteor',
    cn: '陨星纵队',
    en: 'METEOR COLUMN',
    x: 286,
    accent: '#ff2e88',
    kind: 'game',
    tagline: '拦截编队陨石，用共振一击清场',
    taglineEn: 'Break the formation, clear the field with resonance',
    brief: '纵队陨石从屏幕顶端成编队压下。切换三种弹型，连续命中同一目标可蓄满共振槽。',
    briefEn: 'Meteors press down the screen in tight formations. Swap between three shot types; hit the same target repeatedly to charge the resonance meter.',
    rules: [
      '方向键 / A D 左右移动，空格开火',
      '1 / 2 / 3 切换弹型：散射、穿甲、追踪',
      '连续命中同色陨石可蓄满共振槽，击毁额外 +1',
      'F = 共振激爆：一次清空同色陨石并结算巨额分数',
      '陨石会下压到屏幕底部；护盾可挡一次撞击',
    ],
    rulesEn: [
      'Arrows / A D slide you left and right; Space fires',
      '1 / 2 / 3 pick a shot type: spread, pierce, homing',
      'Hitting meteors of one colour charges the resonance meter; a kill adds one more',
      'F = resonance burst: wipes every meteor of that colour and pays out heavily',
      'Meteors press to the bottom of the screen; a shield absorbs one impact',
    ],
    controls: 'A D 移动 · 空格 开火 · 1 2 3 弹型 · F 共振 · P 暂停 · R 重开',
    controlsEn: 'A D move · Space fire · 1 2 3 shot type · F resonance · P pause · R restart',
  },
  {
    id: 'chronicle',
    cn: '街机纪年',
    en: 'CHRONICLE',
    x: 476,
    accent: '#ffb347',
    kind: 'info',
    tagline: '一段有出处的黄金时代速写',
    taglineEn: 'A sketch of the golden age, with receipts',
    brief: '展厅第四台终端陈列街机黄金时代的时间线，每条陈述都标注可核查的来源。',
    briefEn: 'The fourth terminal holds a timeline of the arcade golden age; every statement links to a source you can check.',
    rules: [],
    controls: '← → 移动 · 空格 打开纪年',
    controlsEn: '← → move · Space opens the chronicle',
  },
  {
    id: 'ledger',
    cn: '荣誉榜',
    en: 'LEDGER',
    x: 666,
    accent: '#a56bff',
    kind: 'scores',
    tagline: '本地留存的高分记录',
    taglineEn: 'High scores kept on this machine',
    brief: '两张街机的本地最高分排行榜，刷新页面依然保留（仅存于你的浏览器）。',
    briefEn: 'Local leaderboards for both cabinets. They survive a reload, and they never leave your browser.',
    rules: [],
    controls: '← → 移动 · 空格 打开荣誉榜',
    controlsEn: '← → move · Space opens the ledger',
  },
];

/**
 * 时代介绍时间线。
 * 每条陈述均来自下列可核查来源之一（见 SOURCES.md）：
 *   The Strong National Museum of Play 藏品页 —— 机构级一手藏品说明
 *   Wikipedia「Golden age of video arcade games」 —— 综述性条目
 */
export const TIMELINE = [
  {
    year: '1960s',
    cn: '被计算出来的星际战争',
    en: 'A Star War Computed from First Principles',
    body:
      '麻省理工学院购入 DEC PDP-1 之后，史蒂夫·罗素（Steve Russell）等人做出了《Spacewar!》。' +
      'The Strong 博物馆认为，没有任何游戏比它对现代电子游戏产业的启发更深：1960 年代的太空竞赛' +
      '让计算机顺理成章地成为模拟星际战斗的工具。',
    bodyEn:
      'After the Massachusetts Institute of Technology took delivery of a DEC PDP-1, Steve Russell and ' +
      'his colleagues built Spacewar!. The Strong holds that no game did more to inspire the modern ' +
      'video game industry: the space race of the 1960s made a computer the obvious tool for ' +
      'simulating interstellar combat.',
    source: {
      label: 'The Strong · Spacewar! 藏品页（2018 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/spacewar/',
    },
  },
  {
    year: '1971',
    cn: 'Pong：把电子游戏带进大众视野',
    en: 'Pong: Electronic Games Reach the General Public',
    body:
      '两块挡板与一颗来回的球。The Strong 的评价是：Pong 让数百万人第一次体验电子游戏的乐趣——' +
      '虽然更早的 Magnavox Odyssey 已经内置过类似的网球游戏，但 Pong 是第一个获得广泛公众关注的作品，' +
      '它的成功把 Atari 推上行业主导地位。',
    bodyEn:
      'Two paddles and a ball in constant motion. The Strong’s assessment is that Pong let millions ' +
      'experience electronic games for the first time — the earlier Magnavox Odyssey already contained ' +
      'a similar tennis game, but Pong was the first work to reach a broad public, and its success ' +
      'pushed Atari into industry leadership.',
    source: {
      label: 'The Strong · Pong 藏品页（2015 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/pong/',
    },
  },
  {
    year: '1978',
    cn: 'Space Invaders：高分榜成为标准配置',
    en: 'Space Invaders: The High-Score Table Becomes Standard',
    body:
      '西村恒智（Tomohiro Nishikado）设计、泰莱（Taito）于 1978 年在日本发行。玩家操纵底部横移的' +
      '激光炮，射击五排持续逼近的外星人队列以及偶发的飞碟。The Strong 特别指出：游戏把"高分榜"' +
      '放上屏幕，这一popular feature 很快成为街机游戏的标准元素——本作的荣誉榜展品即由此而来。',
    bodyEn:
      'Designed by Tomohiro Nishikado and released in Japan by Taito in 1978. The player slides a laser ' +
      'cannon along the bottom of the screen and shoots at five ranks of approaching aliens plus an ' +
      'occasional saucer. The Strong points out that the game put the high-score table on screen; that ' +
      'feature soon became a standard element of arcade games — which is where this hall’s Ledger ' +
      'exhibit comes from.',
    source: {
      label: 'The Strong · Space Invaders 藏品页（2016 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/space-invaders/',
    },
  },
  {
    year: '1978',
    cn: '用赛璐珞贴片给单色屏上色',
    en: 'Colour on a Monochrome Screen, via Cellophane',
    body:
      '街机柜受成本与显示技术限制，大量使用单色显示器。Wikipedia 的黄金时代条目记载：' +
      'Space Invaders 的原装街机柜即采用覆盖在单色画面上的赛璐珞（cellophane）贴片来叠加彩色。' +
      '本展厅沿用"叠色片 + 霓虹灯管"的视觉思路，但配色与造型完全原创。',
    bodyEn:
      'Cost and display technology kept many arcade cabinets on monochrome monitors. Wikipedia’s ' +
      'golden-age entry records that the original Space Invaders cabinet used cellophane overlays to ' +
      'add colour to a monochrome image. This hall keeps the idea of layered colour film and neon ' +
      'tubing, but every colour and shape here is original.',
    source: {
      label: 'Wikipedia · Golden age of video arcade games',
      url: 'https://en.wikipedia.org/wiki/Golden_age_of_video_arcade_games',
    },
  },
  {
    year: '1980',
    cn: 'Pac-Man：迷宫追逐与人格化角色',
    en: 'Pac-Man: Maze Chase with a Character',
    body:
      '岩谷彻（Toru Iwatani）创作，南梦宫（Namco）在日本发行、Midway 在美国发行。The Strong 评价：' +
      '迷宫玩法与四只各具个性的幽灵让它成为大众文化现象，Pac-Man 本人则成为电子游戏第一位走向大众的' +
      '代言人，并成为史上销量最高的街机游戏。本展厅的《晶格回廊》取"格子迷宫 + 追逐"这一共性机制，' +
      '但角色、规则、地图生成与技能系统均为原创设计。',
    bodyEn:
      'Created by Toru Iwatani, published by Namco in Japan and by Midway in the United States. The ' +
      'Strong notes that the maze plus four individually characterised ghosts made it a pop-culture ' +
      'phenomenon, that Pac-Man became the first video game character to reach the mass market as a ' +
      'spokesperson, and that it went on to become the best-selling arcade game ever. Lattice Corridor ' +
      'takes only the shared "maze plus pursuit" idea; its characters, rules, map generation and skill ' +
      'system are newly designed.',
    source: {
      label: 'The Strong · Pac-Man 藏品页（2015 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/pac-man/',
    },
  },
  {
    year: '1983',
    cn: '黄金时代与"衰落与余波"',
    en: 'The Golden Age and Its Decline and Aftermath',
    body:
      'Wikipedia 的黄金时代条目以"时间跨度、商业、技术、玩法、大众文化、攻略文化"分节梳理这一时期，' +
      '并专设"衰落与余波"（Decline and aftermath）一节记录家用主机普及之后的产业转折。' +
      '街机黄金时代的常规定义是 1970 年代末至 1990 年代初的三十年。',
    bodyEn:
      'Wikipedia’s golden-age entry surveys the period by duration, business, technology, gameplay, ' +
      'popular culture and walkthrough culture, and gives "Decline and aftermath" a section of its own ' +
      'to record the industry turning point that followed the arrival of home consoles. The ' +
      'conventional span of the golden age runs roughly thirty years, from the late 1970s to the early ' +
      '1990s.',
    source: {
      label: 'Wikipedia · Golden age of video arcade games',
      url: 'https://en.wikipedia.org/wiki/Golden_age_of_video_arcade_games',
    },
  },
  {
    year: '1980s',
    cn: '一块街机柜上的全部语言',
    en: 'The Whole Language of One Arcade Cabinet',
    body:
      '投币口、发光招牌、赛璐珞叠色、排行榜、难度曲线、再来一局——今天还能在老照片里认出这套语言。' +
      '本展厅把其中"招牌霓虹 + 叠色画框 + 排行榜 + 难度曲线"四条提炼为交互骨架，' +
      '其余表现层（字体、配色、角色造型、音乐、文案）全部重新创作。',
    bodyEn:
      'Coin slot, backlit marquee, cellophane overlays, leaderboard, difficulty curve, one more game — ' +
      'you can still recognise that language in old photographs. This hall distils four of those ' +
      'elements into its interaction skeleton: neon signage, layered frames, a leaderboard and a ' +
      'difficulty curve. Everything on the surface — type, palette, character design, music, copy — is ' +
      'newly made.',
    source: {
      label: 'Wikipedia · Arcade game（词条概览）',
      url: 'https://en.wikipedia.org/wiki/Arcade_game',
    },
  },
  {
    year: '2015',
    cn: '世界电子游戏名人堂开馆',
    en: 'The World Video Game Hall of Fame Opens',
    body:
      'The Strong 设立世界电子游戏名人堂（World Video Game Hall of Fame），首届即收录 Pong、Pac-Man、' +
      '《Super Mario Bros.》与《Tetris》四款作品。本展厅纪年条目中的多款游戏正是这份名单与历年入选' +
      '名录中的成员。',
    bodyEn:
      'The Strong founded the World Video Game Hall of Fame, and its first intake was Pong, Pac-Man, ' +
      'Super Mario Bros. and Tetris. Several of the games named in this hall’s chronicle are members ' +
      'of that list and of later intakes.',
    source: {
      label: 'The Strong · 首届世界电子游戏名人堂',
      url: 'https://www.museumofplay.org?p=7833/',
    },
  },
];

/** 与史实条目的对照声明（放在纪年面板顶部，避免读者误解为复刻） */
export const ORIGINALITY_NOTE =
  '本展厅两款游戏均为原创演绎：它们借鉴街机黄金时代的共性机制范式（格子迷宫追逐、' +
  '固定射击台编队），但作品名、角色、地图、规则、技能、音效与视觉全部重新设计，' +
  '不含任何未授权 ROM、商业游戏资源或品牌视觉。文中提及的商业作品仅作历史脉络引用。';

export const ORIGINALITY_NOTE_EN =
  'Both games in this hall are original interpretations. They borrow the shared mechanical vocabulary ' +
  'of the arcade golden age — maze-and-pursuit, fixed shooter formations — but their names, ' +
  'characters, maps, rules, skills, audio and artwork are all newly designed, and they contain no ' +
  'unlicensed ROM, commercial game assets or brand imagery. Commercial works are mentioned here only ' +
  'as historical context.';
