/**
 * 回响电玩馆 · 年代展厅定义
 *
 * 十个年代门，跨越 1950 年代早期电子实验到 2020 年代云端与新形态。
 * 叙述文本为馆方原创文案，非引用自任何既有博物馆网站。
 * 每个年代可绑定一个「可玩展厅」（由 08–12 任务提供，缺失时显示待集成占位）。
 */

export const ERAS = [
  {
    id: 'e01',
    code: '1950s',
    label: '计算的童年',
    labelEn: 'Childhood of Computing',
    from: 1950,
    to: 1959,
    accent: '#6FC7BE',
    tagline: '在真空管与穿孔纸带之间，人们第一次学会让机器「回应」。',
    narrative:
      '这一时期的电子计算机大多还没有屏幕与人机交互的概念。工程师用闪光灯、示波器和打孔纸观察机器的呼吸，' +
      '而「游戏」往往诞生于为了让机器跑通某个例行程序而随手设计的小把戏。',
    note: '最早的电子游戏与最早的通用计算机几乎是同一批人做出来的。',
    groups: ['origins'],
    playableId: null,
  },
  {
    id: 'e02',
    code: '1960s',
    label: '太空竞赛与光点',
    labelEn: 'Space Race & Light Dots',
    from: 1960,
    to: 1969,
    accent: '#9AA7FF',
    tagline: 'CRT 被当作绘图板，第一批光点在屏幕上互相追逐。',
    narrative:
      '宇航时代的显示器被接上示波器与 CRT 终端，飞船工程师把剩余的算力变成了图形。' +
      '《Spacewar!》把合作与对抗同时塞进一个屏幕，为后来的多人对战与街机对战留下了完整模板。',
    note: '当时的输入设备是一排开关和一把电位器，和今天的手感完全不同。',
    groups: ['origins'],
    playableId: 'origins',
  },
  {
    id: 'e03',
    code: '1970s',
    label: '街机黎明',
    labelEn: 'Arcade Dawn',
    from: 1970,
    to: 1977,
    accent: '#FF8A4F',
    tagline: '从「计算机娱乐游戏」到「投币一次，紧张一次」。',
    narrative:
      '雅达利与诺兰盒把弹球实验带进客厅，街机厅则用更明亮的屏幕、更短的对局和更响的音效留下了属于城市的游乐场。' +
      '一代人开始习惯「规则简单、三分钟定胜负」的电子游戏语法。',
    note: '今天「一局三分钟」的手机游戏结构，其实源自四十多年前的街机。',
    groups: ['arcade'],
    playableId: 'origins',
  },
  {
    id: 'e04',
    code: '1978–84',
    label: '街机黄金与八位机',
    labelEn: 'Arcade Golden Age & 8-bit',
    from: 1978,
    to: 1984,
    accent: '#FF5C7A',
    tagline: '《太空侵略者》与吃豆人把游戏送进了商场、客厅与课堂。',
    narrative:
      '这一时期是电子游戏的第一次大爆发：街机厅的霓虹灯，家用机的卡带与手柄，' +
      '以及第一批能用一句话说清楚的规则。与此同时，8 位家用机让「与机器对弈」第一次成为家庭日常。',
    note: '这一时期的许多主机在今天仍以复刻机、迷你主机和合集形式继续存在。',
    groups: ['arcade', 'home8bit'],
    playableId: 'arcade',
  },
  {
    id: 'e05',
    code: '1985–90',
    label: '十六位世代',
    labelEn: 'The 16-bit Generation',
    from: 1985,
    to: 1990,
    accent: '#FFC24B',
    tagline: '更大的画幅、更深的背景音，以及可以save的世界。',
    narrative:
      '家用机换上更强的图形芯片后，「关卡」取代「屏幕」成为叙事单位，' +
      '角色有了名字与性格，游戏开始允许存档、允许选择，也允许你不通关就离开。',
    note: '这一代确立了主机游戏「每年一代」的节奏，也带来了第一波游戏原声带热。',
    groups: ['home8bit', 'console16'],
    playableId: 'console',
  },
  {
    id: 'e06',
    code: '1991–96',
    label: '三维与光盘',
    labelEn: '3D & The Disc',
    from: 1991,
    to: 1996,
    accent: '#7BD3F0',
    tagline: '多边形取代像素，光盘撑开了游戏的野心。',
    narrative:
      'CD 容量让游戏可以装进配图、语音与长镜头；多边形渲染则让视角第一次可以被玩家推动。' +
      '迷宫、太空船与模拟驾驶从二维网格里被解放出来，沉浸感成为新的竞争维度。',
    note: '「3D 加速卡」是那一代最贵也最令人向往的升级件。',
    groups: ['console16'],
    playableId: 'console',
  },
  {
    id: 'e07',
    code: '1997–04',
    label: '网络与掌机',
    labelEn: 'Network & Handheld',
    from: 1997,
    to: 2004,
    accent: '#57D6A6',
    tagline: '服务器有了时钟，互联网有了玩家，口袋里有了另一块屏。',
    narrative:
      '大型多人在线游戏、论坛与即时通讯把「一起玩」从同一间屋子扩展到整个世界；' +
      '掌机则证明便携设备可以拥有自己的独占生态，而不是只能做简化版。',
    note: '2003 年上线的数字商店，把「买一个盒子」变成了「买一个账号」。',
    groups: ['console16', 'online'],
    playableId: 'online',
  },
  {
    id: 'e08',
    code: '2005–13',
    label: '数字分发与移动',
    labelEn: 'Digital & Mobile',
    from: 2005,
    to: 2013,
    accent: '#FF9F45',
    tagline: '商店按钮取代了光驱，按钮之上长出了整个生态。',
    narrative:
      '下载、补丁与「抢先体验」重塑了发行方式；触屏把设计重心从按键密度转向手势直觉；' +
      '独立开发者第一次可以不借助发行商就触达全球玩家。',
    note: '这段时间里，游戏第一次成为一种可以随时更新的「服务」。',
    groups: ['online', 'mobile'],
    playableId: 'online',
  },
  {
    id: 'e09',
    code: '2014–19',
    label: '独立浪潮与 VR',
    labelEn: 'Indie Boom & VR',
    from: 2014,
    to: 2019,
    accent: '#B48CFF',
    tagline: '小团队用独特画风换销量，头显把身体交还给玩家。',
    narrative:
      '独立作品以风格化美学和设计密度对抗工业产能，同时 VR 设备尝试把「坐在椅子上看」变成「站在房间里动」。' +
      '这一时期还留下了直播文化与电竞职业化的基础设施。',
    note: 'VR 展厅在本馆为桌面交互演示，不代表对头显设备的支持。',
    groups: ['mobile', 'modern'],
    playableId: 'modern',
  },
  {
    id: 'e10',
    code: '2020–26',
    label: '云端与新形态',
    labelEn: 'Cloud & New Forms',
    from: 2020,
    to: 2026,
    accent: '#A8E063',
    tagline: '游戏变成了可以在任何设备上继续的日常陪伴。',
    narrative:
      '跨平台存档、订阅服务与随时上线的服务型作品让「游戏进度」脱离了具体设备；' +
      '掌机与掌机上主机化设备并行发展，试玩即传播成为新的传播路径。',
    note: '本馆收录截至编写时的公开信息，2020 年之后的条目仍在持续补充中。',
    groups: ['modern'],
    playableId: 'modern',
  },
];

export const ERA_BY_ID = Object.fromEntries(ERAS.map((e) => [e.id, e]));

/** 年代在时间轴上的顺序位置 */
export const ERA_ORDER = ERAS.map((e) => e.id);
