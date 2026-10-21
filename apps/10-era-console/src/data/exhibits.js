/**
 * 10-era-console — 科普展品数据（1990s 家用机时代）
 *
 * 【来源纪律】
 *  - 每条展品至少 1 条已核验可达的来源 URL（核验方法见 scripts/verify_sources.sh 与 QA.md）。
 *  - 全部条目以英文维基百科对应条目的事实性摘要为主要依据（百科类作交叉核对来源），
 *    并辅以厂方 / 馆方站点链接。
 *  - imageLicense 一律为 no-image：本展厅不引用任何第三方图片，
 *    配图全部为运行时程序化生成的抽象图形（见 src/iso/IsoScene.js 与 src/ui/）。
 *  - 本文件为「代表性选样」，不宣称覆盖该时代全部作品。
 *
 * 【与参考作品的差异】
 *  本展厅为原创作品：展品文案、配图、角色、关卡与音乐均为本项目自行设计，
 *  仅在「技术事实层面」引用公开史料，属于科普引用而非复刻。
 */

export const ERA = 'console16';
export const ERA_LABEL = '1990s 家用机时代';

/**
 * 展品字段：
 *   id, title, subtitle, year, category, icon, fact, detail, sourceUrls, imageLicense
 * category: hardware | medium | technique | culture
 */
export const EXHIBITS = [
  {
    id: 'pc-engine',
    title: '第四世代的第一台',
    subtitle: 'PC Engine / TurboGrafx-16',
    year: 1987,
    category: 'hardware',
    icon: 'console',
    fact: 'PC Engine 由 Hudson Soft 开发、NEC 制造，1987 年在日本推出、1989 年进入北美，被视为第四世代最早的家庭主机。',
    detail:
      '它的算力组合很特别：8 位 CPU 搭配两块 16 位图形协处理器。这种"用多块专用芯片拼出 16 位表现力"的做法，与后来单芯片方案形成对比，也解释了它为何能以较低成本实现大规模背景色。',
    sourceUrls: ['https://en.wikipedia.org/wiki/TurboGrafx-16'],
    imageLicense: 'no-image',
  },
  {
    id: 'mega-drive',
    title: 'Mega Drive 的欧美主场',
    subtitle: 'Sega Mega Drive / Genesis',
    year: 1990,
    category: 'hardware',
    icon: 'console',
    fact: 'Mega Drive（北美名 Genesis）是 16 位第四世代主机，1988 年 10 月在日本上市、1989 年 8 月进入北美，1990 年在欧洲以 Mega Drive 之名由 Virgin Mastertronic 发行。',
    detail:
      '它常被称为"美国销量最好的 16 位主机"，也是 1990 年代围绕主机世代展开的正面竞争中最被广泛讨论的一方。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Sega_Genesis'],
    imageLicense: 'no-image',
  },
  {
    id: 'snes-1990',
    title: '1990 年的双响',
    subtitle: 'Super Famicom / SNES 与 Neo Geo',
    year: 1990,
    category: 'hardware',
    icon: 'console',
    fact: '超级任天堂于 1990 年 11 月 21 日以 Super Famicom 名义在日本发售；同在 1990 年，SNK 发布了 Neo Geo 平台。',
    detail:
      'Neo Geo 最初以两种卡带形态存在：街机系统主板 MVS 与家用机 AES。MVS 街机板可插多卡并中途更换卡带，这是它区别于固定卡带的显著特征；1994 年又追加了 CD-ROM 形态 Neo Geo CD。',
    sourceUrls: [
      'https://en.wikipedia.org/wiki/Super_Nintendo_Entertainment_System',
      'https://en.wikipedia.org/wiki/Neo_Geo',
    ],
    imageLicense: 'no-image',
  },
  {
    id: 'game-gear',
    title: '掌机的分岔口',
    subtitle: 'Game Gear',
    year: 1990,
    category: 'hardware',
    icon: 'handheld',
    fact: 'Game Gear 是世嘉的首款掌机，1990 年 10 月 6 日在日本发售，1991 年 4 月登陆北美与欧洲，1992 年在澳大利亚上市。',
    detail:
      '作为 8 位机型，它与 Master System 共享大量硬件；它与 Game Boy、Atari Lynx、NEC TurboExpress 同处一个竞争世代。彩色屏幕让它在"户外可读性"上与 Game Boy 的低功耗单色屏形成取舍。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Game_Gear'],
    imageLicense: 'no-image',
  },
  {
    id: '32bit-trio',
    title: '32 位三岔口',
    subtitle: '3DO · Jaguar · Saturn',
    year: 1993,
    category: 'hardware',
    icon: 'poly',
    fact: '3DO 由 3DO 公司开发、EA 创始人 Trip Hawkins 构想，规范由第三方授权生产松下为首的多款机型（1993 年起）；Atari Jaguar 于 1993 年 11 月在北美上市；世嘉 Saturn 于 1994 年 11 月 22 日在日本上市。',
    detail:
      'Atari 把 Jaguar 宣传为"世界首台 64 位游戏系统"，这一说法当时就引发争议——有人认为其配置并不符合 64 位的定义。Saturn 采用双 CPU 架构并集成八个处理器。这三台机器代表了 32/64 位过渡期三种截然不同的商业与工程路线。',
    sourceUrls: [
      'https://en.wikipedia.org/wiki/3DO',
      'https://en.wikipedia.org/wiki/Atari_Jaguar',
      'https://en.wikipedia.org/wiki/Sega_Saturn',
    ],
    imageLicense: 'no-image',
  },
  {
    id: 'playstation-cd',
    title: 'CD 成为游戏媒介',
    subtitle: 'PlayStation 与 CD-ROM',
    year: 1994,
    category: 'medium',
    icon: 'disc',
    fact: 'PlayStation 品牌始于 1994 年在日本、1995 年全球发售的第一代主机；同一时期，CD-ROM 成为软件与数据的主要发行介质。',
    detail:
      '光碟相对卡带的优势是容量与访问速度：更长的过场动画、更复杂的音频、更大的 3D 数据。代价是读取延迟与对光学驱动器精度的依赖。CD-ROM 的出现，也让"主机 + 光驱"第一次成为家用机的默认形态。',
    sourceUrls: [
      'https://en.wikipedia.org/wiki/PlayStation',
      'https://en.wikipedia.org/wiki/CD-ROM',
    ],
    imageLicense: 'no-image',
  },
  {
    id: 'mode7',
    title: '伪 3D 的聪明办法',
    subtitle: 'Mode 7',
    year: 1990,
    category: 'technique',
    icon: 'poly',
    fact: 'Mode 7 是超级任天堂上的一种图形模式，允许背景图层按扫描线逐行旋转与缩放，从而制造出多种纵深感效果。',
    detail:
      '其代表性用法是在每一行扫描线上单独调整缩放比例，把一张平面背景"折"成带透视的地平面。这是当时硬件在缺少 3D 多边形管线时，用 2D 扫描线技巧逼近三维的典型案例——它看起来像 3D，但本质上仍是逐行计算的 2D 仿射变换。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Mode_7'],
    imageLicense: 'no-image',
  },
  {
    id: 'virtual-boy',
    title: '最早的三维尝试',
    subtitle: 'Virtual Boy',
    year: 1995,
    category: 'hardware',
    icon: 'visor',
    fact: 'Virtual Boy 是一台 32 位桌面式主机，1995 年 7 月 21 日在日本、8 月 14 日在北美上市，被宣传为首台能渲染立体三维图形的主机。',
    detail:
      '它用红色单色屏配合置于支架上的双筒目镜来呈现视差效果。商业表现不佳，半年后便停产。它是"技术可行 ≠ 产品成立"的一次完整记录。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Virtual_Boy'],
    imageLicense: 'no-image',
  },
  {
    id: 'n64',
    title: '真 64 位与卡带容量',
    subtitle: 'Nintendo 64',
    year: 1996,
    category: 'hardware',
    icon: 'console',
    fact: 'Nintendo 64 于 1996 年 6 月 23 日在日本、9 月 29 日在北美上市，1997 年 3 月进入欧洲与澳洲；任天堂自 1993 年起与 Silicon Graphics 合作开发，以 64 位 CPU 命名。',
    detail:
      '它放弃了卡带，改用更早的卡带形态并因此受限于容量与读取速度；同时它也是把"合作开发"模式带入家用机的代表——主机架构由外部技术团队参与设计，软件与图形能力因此获得明显提升。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Nintendo_64'],
    imageLicense: 'no-image',
  },
  {
    id: 'zbuffer',
    title: '深度缓冲：多边形怎么排前后',
    subtitle: 'Z-buffering',
    year: 1990,
    category: 'technique',
    icon: 'poly',
    fact: 'Z 缓冲（深度缓冲）是一种保存片元深度信息的数据缓冲，数值代表到相机的距离，通常 0 表示最近。',
    detail:
      '在 3D 渲染管线中，当一个片元被投影到屏幕时，会与缓冲中已有的深度值比较：更近则写入并绘制，更远则丢弃。正是这一步让互相穿插的多边形能够正确遮挡——这是 32/64 位主机上大量 3D 画面的基础。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Z-buffering'],
    imageLicense: 'no-image',
  },
  {
    id: 'cd-i',
    title: '多媒体的想象',
    subtitle: 'Philips CD-i',
    year: 1991,
    category: 'medium',
    icon: 'disc',
    fact: 'CD-i 由飞利浦与索尼共同开发与推广，是数字光盘数据存储格式同时也是一套硬件平台，在 Green Book 规范中定义。',
    detail:
      '它是 CD-DA 与 CD-ROM 的扩展，目标是融合音频、文本与图形。两家公司最初预期它能影响教育训练、POS 与家庭娱乐市场。它是"光盘承载多媒体"这一设想的早期验证案例。',
    sourceUrls: ['https://en.wikipedia.org/wiki/CD-i'],
    imageLicense: 'no-image',
  },
  {
    id: 'marty',
    title: '把 PC 搬进客厅',
    subtitle: 'FM Towns Marty',
    year: 1993,
    category: 'hardware',
    icon: 'monitor',
    fact: 'FM Towns Marty 由富士通于 1993 年推出，仅面向日本市场。它使用 AMD 386SX——内部为 32 位但数据总线为 16 位的 CPU，并内置 CD-ROM 与软盘驱动器。',
    detail:
      '它基于富士通 1989 年的 FM Towns 电脑系统，并向后兼容早期 FM Towns 游戏。它是一台"把桌面电脑直接做成家用主机"的机器，在形态上更接近 PC 的延伸而非传统游戏机。',
    sourceUrls: ['https://en.wikipedia.org/wiki/FM_Towns_Marty'],
    imageLicense: 'no-image',
  },
  {
    id: '32x-neogeocd',
    title: '分叉与加挂',
    subtitle: 'Sega 32X 与 Neo Geo CD',
    year: 1994,
    category: 'hardware',
    icon: 'cartridge',
    fact: '32X 是 Sega Genesis 的扩展外设，代号 Project Mars，使用自己的 ROM 卡带与独立游戏库，充当通往 32 位世代的过渡；Neo Geo CD 于 1994 年推出。',
    detail:
      '加挂（add-on）策略能让既有用户平滑升级，但也带来兼容性与营销上的混乱。同一年，SNK 把自家平台从卡带延伸到 CD-ROM，同一代机市场出现了多条并行的存储路线。',
    sourceUrls: [
      'https://en.wikipedia.org/wiki/32X',
      'https://en.wikipedia.org/wiki/Neo_Geo',
    ],
    imageLicense: 'no-image',
  },
  {
    id: 'gbc',
    title: '把彩色塞进口袋',
    subtitle: 'Game Boy Color',
    year: 1998,
    category: 'hardware',
    icon: 'handheld',
    fact: 'Game Boy Color 于 1998 年 10 月 21 日在日本上市，次月进入国际市场。与前代相比，它改用彩色 TFT 屏，CPU 速度最高提升至两倍，内存提升至四倍，并向下兼容前代游戏。',
    detail:
      '"向下兼容"让同一批实体卡带在两代主机上都能运行，是这一时期少见的跨代兼容设计，也降低了玩家升级的心理门槛。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Game_Boy_Color'],
    imageLicense: 'no-image',
  },
  {
    id: 'handheld-duel',
    title: '日本掌机的双城记',
    subtitle: 'Neo Geo Pocket 与 WonderSwan',
    year: 1998,
    category: 'hardware',
    icon: 'handheld',
    fact: 'SNK 的 Neo Geo Pocket 于 1998 年 10 月在日本上市，标志其进入掌机市场；万代与 Koto Laboratory 合作开发的 WonderSwan 于 1999 年 3 月在日本上市。',
    detail:
      'WonderSwan 是 Gunpei Yokoi 生前参与的最后一件硬件作品。两者都长期没有正式进入欧美市场，是"日本本土市场与全球市场节奏不同步"的典型样本。',
    sourceUrls: [
      'https://en.wikipedia.org/wiki/Neo_Geo_Pocket',
      'https://en.wikipedia.org/wiki/WonderSwan',
    ],
    imageLicense: 'no-image',
  },
  {
    id: 'dreamcast',
    title: '以成本为纲',
    subtitle: 'Sega Dreamcast',
    year: 1998,
    category: 'hardware',
    icon: 'console',
    fact: 'Dreamcast 是世嘉最后一款家用主机，1998 年 11 月 27 日在日本上市，1999 年末在全球发售，是第六世代最早的家用机。',
    detail:
      '与造价高昂却失败的 Saturn 相反，Dreamcast 从一开始就以压低成本为目标，大量采用现成通用元器件（包括 Hitachi 的 CPU）。它是主机史上少见的"用供应链能力换市场份额"的商业策略样本。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Sega_Dreamcast'],
    imageLicense: 'no-image',
  },
  {
    id: 'pippin',
    title: '被授权的多媒体盒子',
    subtitle: 'Apple Pippin',
    year: 1996,
    category: 'hardware',
    icon: 'monitor',
    fact: 'Pippin 是苹果设计的开放式多媒体技术平台，基于经典 Mac OS 架构；苹果还制作了名为 Pippin Power Player 的演示机用于展会演示。',
    detail:
      '它体现了 1990 年代"平台授权"思路：硬件规范由品牌方定义，再交给第三方生产与销售。与之对照的是同期 3DO 的授权模式，两者都是主机史上少见的"品牌当平台卖"的做法。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Apple_Pippin'],
    imageLicense: 'no-image',
  },
  {
    id: 'chiptune',
    title: '芯片音乐的时代',
    subtitle: 'Chiptune / PSG',
    year: 1990,
    category: 'culture',
    icon: 'chip',
    fact: 'Chiptune（也称 8-bit 音乐）是一类电子音乐风格与亚文化，使用街机机台、家用电脑与游戏主机中的可编程声音发生器（PSG）芯片或合成器创作。',
    detail:
      '其核心手法是"用极简的波形叠加出旋律"——方波、三角波、噪声通道，辅以 tracker 的音序排布。这正是本展厅所有背景音乐的做法：全部音色由 WebAudio 实时合成，不使用任何预制音频文件。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Chiptune'],
    imageLicense: 'no-image',
  },
  {
    id: 'framerate',
    title: '每秒多少张',
    subtitle: 'Frame rate',
    year: 1990,
    category: 'technique',
    icon: 'ruler',
    fact: '帧率是连续图像（帧）被采集或显示的频率，通常以帧/秒（FPS）表示；在图形学中它同时也是系统渲染能力的度量。',
    detail:
      '主机游戏里"手感"的物理基础正是帧时间：16 位主机常以与电视制式匹配的刷新节奏更新画面。本展厅的平台冒险采用固定步长 60Hz 物理更新，逻辑与显示帧率解耦，保证不同设备上跳跃高度一致。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Frame_rate'],
    imageLicense: 'no-image',
  },
  {
    id: 'texture-mapping',
    title: '贴图：把图画到形上',
    subtitle: 'Texture mapping',
    year: 1990,
    category: 'technique',
    icon: 'poly',
    fact: '贴图映射是把 2D 图像投影到 3D 模型表面的图形学操作，最常见的变体是 UV 展开。',
    detail:
      '在 1990 年代的主机上，贴图通常来自压缩调色板图像：受限于内存与带宽，常见做法是缩小尺寸、限色，再用仿射变换贴到多边形上。这也是许多早期 3D 画面"贴图会抖动"的原因——每顶点插值而非逐像素计算。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Texture_mapping'],
    imageLicense: 'no-image',
  },
  {
    id: 'console-definition',
    title: '什么算"主机"',
    subtitle: 'Video game console',
    year: 1990,
    category: 'culture',
    icon: 'ruler',
    fact: '电子游戏主机是输出视频信号或图像的电子设备，游戏通常通过独立手柄在连接的显示器上操作；家用机通常固定放置并连接电视，掌机则自带显示与操控。',
    detail:
      '1990 年代正是家用机与掌机大规模分化、同时又通过通信服务互相渗透的时期。本展厅把两者并列呈现，正是为了呈现这一分岔。',
    sourceUrls: ['https://en.wikipedia.org/wiki/Video_game_console'],
    imageLicense: 'no-image',
  },
];

/** 展品 id → 展品 */
export const EXHIBIT_BY_ID = Object.fromEntries(EXHIBITS.map((e) => [e.id, e]));

export const EXHIBIT_CATEGORIES = [
  { id: 'hardware', label: '硬件', icon: 'console' },
  { id: 'medium', label: '存储与媒介', icon: 'disc' },
  { id: 'technique', label: '图形技术', icon: 'poly' },
  { id: 'culture', label: '文化与声音', icon: 'chip' },
];

/** 展厅机型档案（用于首页机型导览） */
export const CONSOLES = [
  {
    id: 'pc-engine',
    name: 'PC Engine / TurboGrafx-16',
    maker: 'Hudson Soft / NEC',
    year: 1987,
    kind: 'home',
    bits: '8 位 CPU + 双 16 位图形协处理器',
    note: '第四世代最早的家庭主机，先发优势带来首批 16 位软件。',
  },
  {
    id: 'mega-drive',
    name: 'Mega Drive / Genesis',
    maker: 'Sega',
    year: 1988,
    kind: 'home',
    bits: '16 位',
    note: '1990 年进入欧洲市场，是欧美最畅销的 16 位主机。',
  },
  {
    id: 'snes',
    name: 'Super Famicom / Super NES',
    maker: 'Nintendo',
    year: 1990,
    kind: 'home',
    bits: '16 位',
    note: 'Mode 7 扫描线伪 3D 是它最著名的图形技术遗产。',
  },
  {
    id: 'neo-geo-aes',
    name: 'Neo Geo AES',
    maker: 'SNK',
    year: 1990,
    kind: 'home',
    bits: '16/32 位',
    note: '与街机主板 MVS 共用卡带，家用机直接运行街机基板。',
  },
  {
    id: 'game-gear',
    name: 'Game Gear',
    maker: 'Sega',
    year: 1990,
    kind: 'handheld',
    bits: '8 位',
    note: '彩色屏掌机，与 Master System 共享硬件。',
  },
  {
    id: '3do',
    name: '3DO Interactive Multiplayer',
    maker: '3DO Company（松下等代工）',
    year: 1993,
    kind: 'home',
    bits: '32 位',
    note: '以授权模式生产，是最早尝试"把规范当商品卖"的平台。',
  },
  {
    id: 'jaguar',
    name: 'Atari Jaguar',
    maker: 'Atari Corporation',
    year: 1993,
    kind: 'home',
    bits: '64 位（宣称）',
    note: '宣称世界首台 64 位游戏系统，引发定义之争。',
  },
  {
    id: 'saturn',
    name: 'Sega Saturn',
    maker: 'Sega',
    year: 1994,
    kind: 'home',
    bits: '双 CPU · 32 位',
    note: '与 3D Model 1 街机同期开发，街机移植成为卖点。',
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    maker: 'Sony / SIE',
    year: 1994,
    kind: 'home',
    bits: '32 位',
    note: 'CD-ROM 时代最具影响力的主机之一。',
  },
  {
    id: 'virtual-boy',
    name: 'Virtual Boy',
    maker: 'Nintendo',
    year: 1995,
    kind: 'home',
    bits: '32 位',
    note: '桌面式立体显示设备，商业上迅速失败。',
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    maker: 'Nintendo',
    year: 1996,
    kind: 'home',
    bits: '64 位',
    note: '与 Silicon Graphics 合作开发，保留卡带介质。',
  },
  {
    id: 'game-boy-color',
    name: 'Game Boy Color',
    maker: 'Nintendo',
    year: 1998,
    kind: 'handheld',
    bits: '8 位（倍速）',
    note: '彩色 TFT + 向下兼容，成为掌机市场的主导机型。',
  },
  {
    id: 'neo-geo-pocket',
    name: 'Neo Geo Pocket',
    maker: 'SNK',
    year: 1998,
    kind: 'handheld',
    bits: '8 位',
    note: 'SNK 进入掌机市场的第一款产品。',
  },
  {
    id: 'dreamcast',
    name: 'Dreamcast',
    maker: 'Sega',
    year: 1998,
    kind: 'home',
    bits: '128 位',
    note: '世嘉最后一代主机，以现成元器件压低成本。',
  },
  {
    id: 'wonderswan',
    name: 'WonderSwan',
    maker: 'Bandai / Koto Laboratory',
    year: 1999,
    kind: 'handheld',
    bits: '16 位',
    note: '日本本土市场为主，长期未进入欧美。',
  },
];

export const CONSOLE_BY_ID = Object.fromEntries(CONSOLES.map((c) => [c.id, c]));
