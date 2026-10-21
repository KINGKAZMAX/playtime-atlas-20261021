/**
 * 霓虹街廊 · 街机可玩展厅
 * src/hall/exhibits.js — 展厅展品数据 + 带来源的时代介绍
 *
 * 所有史实陈述均附可点击来源链接（博物馆藏品页 / 百科条目）。
 * 本展厅两款游戏为原创演绎：机制取自街机黄金时代的共性范式，
 * 但角色、地图、规则、音效、视觉与文案全部重新设计。
 */

export const HALL_NAME = {
  cn: '霓虹街廊',
  en: 'NEON CORRIDOR',
  sub: '街机可玩展厅 · 1980s',
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
    brief: '在会自我闭合的晶格回廊中回收晶核。相位穿行让你穿墙，残响替你引开游丝。',
    rules: [
      '方向键 / WASD 移动，拾取全部晶核后归途门开启',
      '空格 = 相位穿行：向前穿墙两格，消耗 1 点相位能量',
      'E = 释放残响：原地留下诱饵，吸引巡守 6 秒',
      '巡守会追踪残响，也会追踪你——别停在原地',
      '收齐晶核后进入归途门，前往下一层回廊',
    ],
    controls: '方向键移动 · 空格 相位穿行 · E 残响 · P 暂停 · R 重开',
  },
  {
    id: 'meteor',
    cn: '陨星纵队',
    en: 'METEOR COLUMN',
    x: 286,
    accent: '#ff2e88',
    kind: 'game',
    tagline: '拦截编队陨石，用共振一击清场',
    brief: '纵队陨石从屏幕顶端成编队压下。切换三种弹型，连续命中同一目标可蓄满共振槽。',
    rules: [
      '方向键 / A D 左右移动，空格开火',
      '1 / 2 / 3 切换弹型：散射、穿甲、追踪',
      '连续命中同色陨石可蓄满共振槽，击毁额外 +1',
      'F = 共振激爆：一次清空同色陨石并结算巨额分数',
      '陨石会下压到屏幕底部；护盾可挡一次撞击',
    ],
    controls: 'A D 移动 · 空格 开火 · 1 2 3 弹型 · F 共振 · P 暂停 · R 重开',
  },
  {
    id: 'chronicle',
    cn: '街机纪年',
    en: 'CHRONICLE',
    x: 476,
    accent: '#ffb347',
    kind: 'info',
    tagline: '一段有出处的黄金时代速写',
    brief: '展厅第四台终端陈列街机黄金时代的时间线，每条陈述都标注可核查的来源。',
    rules: [],
    controls: '← → 移动 · 空格 打开纪年',
  },
  {
    id: 'ledger',
    cn: '荣誉榜',
    en: 'LEDGER',
    x: 666,
    accent: '#a56bff',
    kind: 'scores',
    tagline: '本地留存的高分记录',
    brief: '两张街机的本地最高分排行榜，刷新页面依然保留（仅存于你的浏览器）。',
    rules: [],
    controls: '← → 移动 · 空格 打开荣誉榜',
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
    body:
      '麻省理工学院购入 DEC PDP-1 之后，史蒂夫·罗素（Steve Russell）等人做出了《Spacewar!》。' +
      'The Strong 博物馆认为，没有任何游戏比它对现代电子游戏产业的启发更深：1960 年代的太空竞赛' +
      '让计算机顺理成章地成为模拟星际战斗的工具。',
    source: {
      label: 'The Strong · Spacewar! 藏品页（2018 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/spacewar/',
    },
  },
  {
    year: '1971',
    cn: 'Pong：把电子游戏带进大众视野',
    body:
      '两块挡板与一颗来回的球。The Strong 的评价是：Pong 让数百万人第一次体验电子游戏的乐趣——' +
      '虽然更早的 Magnavox Odyssey 已经内置过类似的网球游戏，但 Pong 是第一个获得广泛公众关注的作品，' +
      '它的成功把 Atari 推上行业主导地位。',
    source: {
      label: 'The Strong · Pong 藏品页（2015 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/pong/',
    },
  },
  {
    year: '1978',
    cn: 'Space Invaders：高分榜成为标准配置',
    body:
      '西村恒智（Tomohiro Nishikado）设计、泰莱（Taito）于 1978 年在日本发行。玩家操纵底部横移的' +
      '激光炮，射击五排持续逼近的外星人队列以及偶发的飞碟。The Strong 特别指出：游戏把"高分榜"' +
      '放上屏幕，这一popular feature 很快成为街机游戏的标准元素——本作的荣誉榜展品即由此而来。',
    source: {
      label: 'The Strong · Space Invaders 藏品页（2016 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/space-invaders/',
    },
  },
  {
    year: '1978',
    cn: '用赛璐珞贴片给单色屏上色',
    body:
      '街机柜受成本与显示技术限制，大量使用单色显示器。Wikipedia 的黄金时代条目记载：' +
      'Space Invaders 的原装街机柜即采用覆盖在单色画面上的赛璐珞（cellophane）贴片来叠加彩色。' +
      '本展厅沿用"叠色片 + 霓虹灯管"的视觉思路，但配色与造型完全原创。',
    source: {
      label: 'Wikipedia · Golden age of video arcade games',
      url: 'https://en.wikipedia.org/wiki/Golden_age_of_video_arcade_games',
    },
  },
  {
    year: '1980',
    cn: 'Pac-Man：迷宫追逐与人格化角色',
    body:
      '岩谷彻（Toru Iwatani）创作，南梦宫（Namco）在日本发行、Midway 在美国发行。The Strong 评价：' +
      '迷宫玩法与四只各具个性的幽灵让它成为大众文化现象，Pac-Man 本人则成为电子游戏第一位走向大众的' +
      '代言人，并成为史上销量最高的街机游戏。本展厅的《晶格回廊》取"格子迷宫 + 追逐"这一共性机制，' +
      '但角色、规则、地图生成与技能系统均为原创设计。',
    source: {
      label: 'The Strong · Pac-Man 藏品页（2015 年入选名人堂）',
      url: 'https://www.museumofplay.org/games/pac-man/',
    },
  },
  {
    year: '1983',
    cn: '黄金时代与"衰落与余波"',
    body:
      'Wikipedia 的黄金时代条目以"时间跨度、商业、技术、玩法、大众文化、攻略文化"分节梳理这一时期，' +
      '并专设"衰落与余波"（Decline and aftermath）一节记录家用主机普及之后的产业转折。' +
      '街机黄金时代的常规定义是 1970 年代末至 1990 年代初的三十年。',
    source: {
      label: 'Wikipedia · Golden age of video arcade games',
      url: 'https://en.wikipedia.org/wiki/Golden_age_of_video_arcade_games',
    },
  },
  {
    year: '1980s',
    cn: '一块街机柜上的全部语言',
    body:
      '投币口、发光招牌、赛璐珞叠色、排行榜、难度曲线、再来一局——今天还能在老照片里认出这套语言。' +
      '本展厅把其中"招牌霓虹 + 叠色画框 + 排行榜 + 难度曲线"四条提炼为交互骨架，' +
      '其余表现层（字体、配色、角色造型、音乐、文案）全部重新创作。',
    source: {
      label: 'Wikipedia · Arcade game（词条概览）',
      url: 'https://en.wikipedia.org/wiki/Arcade_game',
    },
  },
  {
    year: '2015',
    cn: '世界电子游戏名人堂开馆',
    body:
      'The Strong 设立世界电子游戏名人堂（World Video Game Hall of Fame），首届即收录 Pong、Pac-Man、' +
      '《Super Mario Bros.》与《Tetris》四款作品。本展厅纪年条目中的多款游戏正是这份名单与历年入选' +
      '名录中的成员。',
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
