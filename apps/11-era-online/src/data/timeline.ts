/**
 * timeline.ts — 2000–2009 年表内容。
 *
 * 纪律：
 * 1. 每条陈述都必须挂来源角标（`src` 数组，指向 sources.ts 的条目 id）。
 * 2. 只写能被来源直接支撑的事实；推测性描述一律不写。
 * 3. 本文件是**代表性选样**，不是编年全集 —— 页面上会明示这一点。
 * 4. 凡是本展厅原创的设计（塔种、碎片、地图等）都标注为 `本厅`，
 *    不与史实混排。
 */

export interface TimelineFact {
  text: string;
  src: string[];
}

export interface TimelineYear {
  year: number;
  /** 一句话定性 */
  headline: string;
  hardware: TimelineFact[];
  handheld: TimelineFact[];
  online: TimelineFact[];
  works: TimelineFact[];
}

export const TIMELINE: TimelineYear[] = [
  {
    year: 2000,
    headline: '第六世代主机开跑，PC 竞技与大型网游同时抬头',
    hardware: [
      { text: 'PlayStation 2 于 2000 年 3 月 4 日在日本首发，随后在北美、欧洲等地区陆续上市，是 PlayStation 品牌第二代主机。', src: ['wp-ps2'] },
    ],
    handheld: [
      { text: '承接上一年的 Game Boy Color 掌机路线，2000 年的掌机市场仍以 8 位彩屏设备为主。', src: ['wp-gbc'] },
    ],
    online: [
      { text: '《Counter-Strike》最初是《Half-Life》的模组，模组版权被 Valve 收购后于 2000 年转为零售发行，并迅速成为线上对战的标准之一。', src: ['wp-cs'] },
    ],
    works: [
      { text: '《Diablo II》于 2000 年上市，延续了暴雪以 Battle.net 支撑的动作角色扮演形态。', src: ['wp-d2', 'wp-bnet'] },
    ],
  },
  {
    year: 2001,
    headline: 'PC 平台换代，微软下场，掌机迈入 32 位',
    hardware: [
      { text: 'Windows XP 于 2001 年 8 月 24 日投产、10 月 25 日零售，是 Windows NT 系列的一次重要版本。', src: ['wp-xp'] },
      { text: '微软的 Xbox 于 2001 年 11 月 15 日在北美发售，是 1993 年之后首个美国厂商主导的家用主机。', src: ['wp-xbox'] },
    ],
    handheld: [
      { text: 'Game Boy Advance 于 2001 年 3 月 21 日在日本发售，采用 ARM7 处理器，并向下兼容 Game Boy Color 时代的游戏。', src: ['wp-gba', 'wp-nin-hist'] },
    ],
    online: [
      { text: '《World of Warcraft》在这一年公布，暴雪开始准备其大规模多人在线角色扮演作品。', src: ['wp-wow'] },
    ],
    works: [
      { text: '《Warcraft III: The Frozen Throne》与《Age of Empires II》代表了 RTS 在这一年的两个方向。', src: ['wp-w3', 'wp-aoe2'] },
    ],
  },
  {
    year: 2002,
    headline: '主机自带在线服务成为标准配置',
    hardware: [
      { text: '初代 Xbox 在 2001 年末上市后，其在线服务 Xbox Live 于 2002 年 11 月 15 日开放。', src: ['wp-xlive'] },
    ],
    handheld: [
      { text: '掌机侧的联网实验仍在继续，N-Gage 等设备尝试把手机与掌机合流。', src: ['wp-ngage'] },
    ],
    online: [
      { text: 'Xbox Live 首次把「主机 + 在线账号 + 数字内容」打成一体，主机联网从此不再是附加功能。', src: ['wp-xlive'] },
    ],
    works: [
      { text: '《Neverwinter Nights》（2002）尝试把桌面角色扮演的规则做成可多人参与的框架。', src: ['wp-nwn'] },
    ],
  },
  {
    year: 2003,
    headline: '数字发行与虚拟世界同时落地',
    hardware: [
      { text: 'PC 仍然是这一阶段最重要的开发与发行平台，Steam 正是在这一年以客户端形式出现。', src: ['wp-steam'] },
    ],
    handheld: [
      { text: '掌机画面表现的跃升在此时仍未到来，掌机更多被当作"随时可玩"的补充设备。', src: ['wp-gba'] },
    ],
    online: [
      { text: 'Steam 客户端于 2003 年 9 月上线，最初用于自动更新 Valve 自家游戏，2005 年底才扩展到第三方作品的发行。', src: ['wp-steam', 'steam-20'] },
      { text: 'Second Life 于 2003 年 6 月 23 日公开上线，是这一时期最具代表性的"可编程虚拟世界"形态。', src: ['wp-sl', 'wp-vw'] },
    ],
    works: [
      { text: '《Defense of the Ancients》最初是《Warcraft III》的自定义地图，后来发展为独立的 MOBA 类型。', src: ['wp-dota', 'wp-w3'] },
    ],
  },
  {
    year: 2004,
    headline: '第七世代掌机与 MMO 同时爆发',
    hardware: [
      { text: 'Xbox 360 于 2005 年 5 月 12 日在「Xbox: The Next Generation Revealed」节目中正式揭晓。', src: ['wp-x360'] },
    ],
    handheld: [
      { text: 'Nintendo DS 于 2004 至 2005 年间在全球发售，DS 即「Dual Screen」，下屏可作为触摸屏使用。', src: ['wp-nds', 'wp-nin-hist'] },
      { text: 'PlayStation Portable 于 2004 年 12 月 12 日在日本首发，是 PlayStation 系列首款掌机。', src: ['wp-psp'] },
    ],
    online: [
      { text: '《World of Warcraft》于 2004 年 11 月 23 日发售，延续了暴雪自 1997 年 Battle.net 以来的在线服务布局。', src: ['wp-wow', 'wp-bnet'] },
      { text: 'MMO 这一类型在这一年被明确概括为「大量玩家在同一个服务器上同时互动」的形态。', src: ['wp-mmo', 'wp-online'] },
    ],
    works: [
      { text: '《EverQuest》与《Ultima Online》代表了 2000 年代之前后 MMO 的长线运营范式，改变了游戏的付费与留存方式。', src: ['wp-eq', 'wp-ultima', 'wp-realm'] },
    ],
  },
  {
    year: 2005,
    headline: '免费联机与数字商店同时被主机采纳',
    hardware: [
      { text: 'Xbox 360 在 2005 年 11 月上市时带来了带 Xbox Live Marketplace 的新版在线服务。', src: ['wp-xlive', 'wp-x360'] },
    ],
    handheld: [
      { text: '掌机的免费联机在这一年有了系统级方案：Nintendo Wi-Fi Connection。', src: ['wp-nwfc'] },
    ],
    online: [
      { text: 'Nintendo Wi-Fi Connection 于 2005 年 11 月 14 日上线，为兼容的 Nintendo DS 与 Wii 游戏提供免费联机，并承载 Wii Shop Channel 与 DSi Shop 的下载服务。', src: ['wp-nwfc'] },
    ],
    works: [
      { text: '《Diablo II》与《Counter-Strike》这样的长线运营作品在这一年仍然保持着强势的在线人口。', src: ['wp-d2', 'wp-cs'] },
    ],
  },
  {
    year: 2006,
    headline: '三台第七世代主机同年登场，网络服务成为标配',
    hardware: [
      { text: 'Wii 于 2006 年 11 月 19 日在北美发售。', src: ['wp-wii'] },
      { text: 'PlayStation 3 于 2006 年 11 月 11 日在日本首发，是 PS2 的后继机。', src: ['wp-ps3', 'ps-hist'] },
    ],
    handheld: [
      { text: 'PSP 与 Nintendo DS 构成这一阶段掌机市场的双雄，前者主打 multimedia 与更复杂的操作，后者主打双屏与触摸。', src: ['wp-psp', 'wp-nds'] },
    ],
    online: [
      { text: 'PlayStation Network 于 2006 年 11 月上线，最初面向 PlayStation 主机。', src: ['wp-psn'] },
    ],
    works: [
      { text: '《Final Fantasy XI》《Guild Wars》《MapleStory》《RuneScape》等作品在这一年把「订阅制」与「永久在线」推向不同细分市场。', src: ['wp-ffxi', 'wp-gw', 'wp-maple', 'wp-ru'] },
    ],
  },
  {
    year: 2007,
    headline: '手机成为新平台，射击与策略进入在线时代',
    hardware: [
      { text: '第一代 iPhone 于 2007 年 1 月 9 日公布、6 月上市，触屏与随身网络把「游戏」和「上网」合并为同一台设备。', src: ['wp-iphone', 'wp-mobile'] },
    ],
    handheld: [
      { text: '这一阶段掌机的竞争重心转向屏幕与联网，而非单纯的算力。', src: ['wp-nds', 'wp-psp'] },
    ],
    online: [
      { text: 'Steam 已从更新工具成长为发行平台，承担匹配、成就与社区功能，并开始提供反作弊措施。', src: ['wp-steam', 'valve-co'] },
    ],
    works: [
      { text: '《Team Fortress 2》于 2007 年 10 月随 The Orange Box 发售，把"免费游玩、靠外观道具变现"的手游化路径带到了 PC 射击品类。', src: ['wp-tf2'] },
      { text: '《Halo 3》《Call of Duty 4: Modern Combat》《Portal》《Left 4 Dead》分别代表主机叙事、线性射击、解谜与在线合作的不同方向。', src: ['wp-halo3', 'wp-cod4', 'wp-portal', 'wp-l4d'] },
    ],
  },
  {
    year: 2008,
    headline: '玩家共创与浏览器游戏改变了"内容"的来源',
    hardware: [
      { text: 'PC 平台在这一年仍然是mod 与工具链最活跃的试验场。', src: ['wp-gmod', 'wp-hl2'] },
    ],
    handheld: [
      { text: '掌机的存储介质在这一时期逐步让位于可下载内容，数字分发开始替代部分卡带。', src: ['wp-nds', 'wp-nwfc'] },
    ],
    online: [
      { text: '浏览器游戏（browser game）以零安装成本成为轻量级联机玩法的代表形态之一。', src: ['wp-browser'] },
    ],
    works: [
      { text: '《Counter-Strike》系列在这一时期已发展为全球最广泛流传的竞技射击项目之一。', src: ['wp-cs', 'wp-css'] },
      { text: '玩家自建内容在这一年走向主流，《Garry\'s Mod》把"用游戏本身做素材"变成了独立品类。', src: ['wp-gmod'] },
    ],
  },
  {
    year: 2009,
    headline: '免费竞技与沙盒共创成为新范式',
    hardware: [
      { text: '到 2009 年，手机已经具备足以承载触控小游戏的算力与网络条件。', src: ['wp-iphone', 'wp-mobile'] },
    ],
    handheld: [
      { text: '掌机与手机在联网能力上的差距快速收窄，掌机不再天然等于"离线设备"。', src: ['wp-nds', 'wp-nwfc', 'wp-mobile'] },
    ],
    online: [
      { text: '《League of Legends》于 2009 年 10 月上线，采用免费游玩、通过角色外观道具变现的方式运营。', src: ['wp-lol'] },
    ],
    works: [
      { text: '《Minecraft》于 2009 年 5 月 17 日以公开 alpha 形式发布，展示了"玩家共创"在联网环境下的规模效应。', src: ['wp-mc'] },
    ],
  },
];

/** 展厅导览段落。每段同样挂来源。 */
export interface IntroParagraph {
  kicker: string;
  html: string;
}

export const INTRO_PARAGRAPHS: IntroParagraph[] = [
  {
    kicker: '起点',
    html:
      '如果要给 2000 年代找一个精确的起点，<b>2000 年 3 月 4 日</b>的 PlayStation 2 日本首发是个好记的坐标——它把家用主机带进了一个此前难以想象的世代。' +
      '但这一 decade 真正的底色不在硬件，而在于<b>连接</b>：主机开始自带在线账号，PC 开始用客户端自动更新与分发游戏，掌机开始把触摸屏和无线通信塞进口袋。' +
      '「联机」在这个阶段从一种玩法，变成了一种<b>发行形态</b>。',
  },
  {
    kicker: '服务平台化',
    html:
      '2003 年 9 月，<b>Steam</b> 客户端上线，最初只是为了自动更新 Valve 自家游戏，年底才扩展到第三方发行；' +
      '<b>Battle.net</b> 自 1997 年起就承担着《Diablo》系列的分发、补丁与联机职能；' +
      '<b>Xbox Live</b> 于 2002 年 11 月 15 日随初代 Xbox 开放，<b>PlayStation Network</b> 于 2006 年 11 月上线，' +
      '<b>Nintendo Wi-Fi Connection</b> 于 2005 年 11 月 14 日为 DS 与 Wii 提供免费联机。' +
      '到 2006 年，第七世代三台主机同年登场时，联网账号与数字商店已经不再是可选项。',
  },
  {
    kicker: '大规模在线',
    html:
      '这一时期最有影响力的形态是 MMO——被明确概括为「大量玩家在同一个服务器上同时互动」的类型。' +
      '《EverQuest》与《Ultima Online》提供了长线运营的范本，《World of Warcraft》于 <b>2004 年 11 月 23 日</b>发售，' +
      '把"持续在线"写进了主流玩家的日程表；' +
      '另一条支线是 Second Life（2003 年 6 月 23 日公开上线）这样的可编程虚拟世界，以及在《Warcraft III》自定义地图上诞生的 DotA。',
  },
  {
    kicker: '掌机的双屏与触摸',
    html:
      '掌机一侧最关键的一次形态变化是 <b>Nintendo DS</b>：2004 至 2005 年间全球发售，DS 即 "Dual Screen"，' +
      '两块屏幕同时工作，下屏直接作为触摸屏；' +
      '而 <b>Game Boy Advance</b>（2001 年 3 月 21 日，日本）与 <b>PSP</b>（2004 年 12 月 12 日，日本）' +
      '分别代表了两条不同的路线：更强的算力与更复杂的操作。' +
      '本展厅的掌机展项《口袋回声》正是向这一双屏结构致敬的一次原创演绎。',
  },
  {
    kicker: '免费化与共创',
    html:
      '2007 年的 <b>Team Fortress 2</b>、2009 年的 <b>League of Legends</b> 都证明了一件事：' +
      '把游戏本身免费、把收入移到外观与运营上，可以换来远大于买断制的用户规模。' +
      '同年 5 月 17 日，<b>Minecraft</b> 以公开 alpha 形式发布，' +
      '它把"玩家创造内容"变成了可以持续供给的循环。' +
      '《Counter-Strike》《Team Fortress 2》《Garry\'s Mod》这三条线，共同构成了 2000 年代"联机"的真正内容。',
  },
  {
    kicker: '边界声明',
    html:
      '本展厅是<b>代表性选样</b>，不是该年代的编年全集；' +
      '所列条目均只做事实陈述并附可点击来源，' +
      '展厅内两件可玩展项的<b>名称、规则、数值、美术、音频与世界观全部为本展厅原创</b>，' +
      '不复制任何商业游戏的 ROM、素材、商标或角色。' +
      '另外需要特别说明：<b>本展厅的全部交互均为本地单机</b>，不连接任何服务器，' +
      '展项 A 中的「灰烬协议」是由本机程序控制的 AI 对手，<b>并非真人玩家</b>。',
  },
];

/** 展柜：硬件与网络服务卡片。 */
export interface ShowcaseCard {
  id: string;
  name: string;
  en: string;
  year: string;
  kind: '主机' | '掌机' | '服务' | '平台' | '作品';
  spec: string;
  significance: string;
  src: string[];
}

export const SHOWCASE: ShowcaseCard[] = [
  {
    id: 'ps2',
    name: 'PlayStation 2',
    en: 'PS2',
    year: '2000',
    kind: '主机',
    spec: '第六世代家用主机，2000 年 3 月 4 日日本首发。',
    significance: 'DVD 时代的容量红利，让光盘时代的作品规模上限被整体抬高。',
    src: ['wp-ps2', 'ps-hist'],
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    en: 'GBA',
    year: '2001',
    kind: '掌机',
    spec: 'ARM7 处理器的 32 位掌机，2001 年 3 月 21 日日本发售，向下兼容前代作品。',
    significance: '掌机第一次拥有真正意义上的 3D 能力，同时保住了旧卡带生态。',
    src: ['wp-gba', 'nin-hist'],
  },
  {
    id: 'xbox',
    name: 'Xbox',
    en: 'XBOX',
    year: '2001',
    kind: '主机',
    spec: '微软首款家用主机，2001 年 11 月 15 日北美发售。',
    significance: '把成熟的 PC 硬件与开发经验带进主机竞争。',
    src: ['wp-xbox'],
  },
  {
    id: 'steam',
    name: 'Steam',
    en: 'STEAM',
    year: '2003',
    kind: '服务',
    spec: 'Valve 的数字发行平台，2003 年 9 月以更新客户端上线，2005 年底扩展至第三方发行。',
    significance: '把"更新—匹配—社区—成就"整合成一个长期留存的客户端。',
    src: ['wp-steam', 'steam-20', 'valve-co'],
  },
  {
    id: 'nds',
    name: 'Nintendo DS',
    en: 'NDS',
    year: '2004',
    kind: '掌机',
    spec: '双屏折叠掌机，下屏为触摸屏，2004–2005 年全球发售。',
    significance: '把触摸、双屏与本地无线带进掌机，定义了后续十年的掌机交互习惯。',
    src: ['wp-nds', 'nin-hist'],
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    en: 'PSP',
    year: '2004',
    kind: '掌机',
    spec: 'PlayStation 系列首款掌机，2004 年 12 月 12 日日本首发。',
    significance: '以 multimedia 定位与更复杂的按键布局，回应了"掌机也能做大作"的想象。',
    src: ['wp-psp', 'ps-hist'],
  },
  {
    id: 'wow',
    name: 'World of Warcraft',
    en: 'WoW',
    year: '2004',
    kind: '作品',
    spec: '大型多人在线角色扮演游戏，2001 年公布，2004 年 11 月 23 日发售。',
    significance: '把"每周固定上线"变成一种生活节律，定义了 MMORPG 的商业基线。',
    src: ['wp-wow', 'wp-bnet', 'wp-mmo'],
  },
  {
    id: 'x360',
    name: 'Xbox 360',
    en: 'X360',
    year: '2005',
    kind: '主机',
    spec: '微软第二代主机，2005 年 5 月 12 日揭晓，同年 11 月上市并带来新版 Xbox Live。',
    significance: '第七世代三机中最先落地的一款，带来了成熟的付费联机与市场。',
    src: ['wp-x360', 'wp-xlive'],
  },
  {
    id: 'nwfc',
    name: 'Nintendo Wi-Fi Connection',
    en: 'NWFC',
    year: '2005',
    kind: '服务',
    spec: '2005 年 11 月 14 日上线的免费联机服务，覆盖 Nintendo DS 与 Wii，并承载下载商店。',
    significance: '首次把"主机免费联网"做成了系统级默认能力。',
    src: ['wp-nwfc'],
  },
  {
    id: 'wii',
    name: 'Wii',
    en: 'WII',
    year: '2006',
    kind: '主机',
    spec: '2006 年 11 月 19 日北美发售的第七世代主机。',
    significance: '用体感与非线性操作重新定义了"谁来玩"这个问题。',
    src: ['wp-wii'],
  },
  {
    id: 'ps3',
    name: 'PlayStation 3',
    en: 'PS3',
    year: '2006',
    kind: '主机',
    spec: '2006 年 11 月 11 日日本首发，PS2 的后继机。',
    significance: '与 PSN 同期推进，把数字商店与订阅服务变成主机生命周期的一部分。',
    src: ['wp-ps3', 'ps-hist'],
  },
  {
    id: 'psn',
    name: 'PlayStation Network',
    en: 'PSN',
    year: '2006',
    kind: '服务',
    spec: '2006 年 11 月上线的索尼数字媒体与在线服务，最初面向 PlayStation 主机。',
    significance: '主机厂商自建账号体系的又一例证。',
    src: ['wp-psn'],
  },
  {
    id: 'iphone',
    name: 'iPhone',
    en: 'IPHONE',
    year: '2007',
    kind: '平台',
    spec: '第一代 iPhone 于 2007 年 1 月 9 日公布、6 月上市。',
    significance: '触屏、随身网络与随时下载的组合，改变了游戏被分发和被游玩的方式。',
    src: ['wp-iphone', 'wp-mobile'],
  },
  {
    id: 'lol',
    name: 'League of Legends',
    en: 'LoL',
    year: '2009',
    kind: '作品',
    spec: '2009 年 10 月上线的多人在线战斗竞技游戏，采用免费游玩、外观道具变现。',
    significance: 'MOBA 从自定义地图走到独立商业品类，并确立了长线运营的模板。',
    src: ['wp-lol', 'wp-dota'],
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    en: 'MC',
    year: '2009',
    kind: '作品',
    spec: '2009 年 5 月 17 日以公开 alpha 形式发布的沙盒游戏。',
    significance: '证明玩家生成的内容本身可以成为长期供给的游戏内容。',
    src: ['wp-mc'],
  },
];
