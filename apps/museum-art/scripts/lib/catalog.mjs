/**
 * 回响电玩馆 / PLAYTIME ATLAS — 资产目录唯一事实来源
 *
 * 重要声明：
 *  - 以下 7 个"年代"是为本馆原创建立的策展分段，参考公开史料的通行分期
 *    （早期街机 1972–1978、街机黄金期 1978–1982、家用八位机 1983–1995、
 *      16 位 1987–2003、32/64 位 1993–2005、六代机 1998–2013、七/八代机 2005 至今），
 *    但分段边界、名称与全部文案均为本馆原创，不代表任何机构的官方分期。
 *  - 以下 6 件硬件均为**虚构展品**：它们是对"某一时代硬件形态"的原创提炼，
 *    不对应任何在售或停产的任何具体产品，无品牌标识，不含任何厂商设计元素。
 *  - 本馆只覆盖代表性成果，不宣称穷尽全部游戏或全部机型。
 */

/** @typedef {{id:string,index:number,name:string,latin:string,range:string,tagline:string,story:string,keywords:string,motif:string,accent:'signal'|'teal'|'paper'}} Era */

export const eras = [
  {
    id: 'dawn',
    exhibits: ['cabinet-01'],
    index: 1,
    name: '街机初萌',
    latin: 'ARCADE DAWN',
    range: '1972 — 1978',
    tagline: '光点第一次有了边界',
    story:
      '最早的电子游戏还只是示波器上跳动的几何光斑。木板、旋钮、发光二极管，被塞进一间间狭小的店面。玩家挤在机器前，盯着两块色块互相追逐——他们还不知道自己正在参与一场关于「画面」的革命。',
    keywords: '光斑 · 旋钮 · 街机店面 · 木壳 · 排队',
    motif: 'early oscilloscope phosphor glow, dot matrix bloom, wood grain panel',
    accent: 'signal',
  },
  {
    id: 'golden',
    exhibits: ['cabinet-01'],
    index: 2,
    name: '街机黄金',
    latin: 'GOLDEN ARCADE',
    range: '1978 — 1983',
    tagline: '投币口之后的黄金年代',
    story:
      '街机厅成为城市的夜间客厅。太空侵略者、格斗、赛车，一台台色彩浓烈的机器被投币声点亮。那几年里，游戏设计几乎等于工业设计：一张海报、一段音效，就能决定一款机器的生死。',
    keywords: '霓虹 · 投币 · 格斗 · 彩显 · 夜店',
    motif: 'neon arcade signage, saturated cabinet side art, chrome and lacquer',
    accent: 'signal',
  },
  {
    id: 'home8',
    exhibits: ['console-02'],
    index: 3,
    name: '八位年代',
    latin: '8-BIT HOME',
    range: '1983 — 1993',
    tagline: '客厅里的第一台机器',
    story:
      '主机从街机厅搬进了客厅。插卡、搓摇杆、把手柄线缠到脖子上——八位机时代最真实的触感，是塑料按键的回弹和电视机的闪烁。四年一次的游戏震荡之后，家用机器重新长回了根。',
    keywords: '卡带 · 手柄 · 客厅 · 电视闪烁 · 磁带',
    motif: 'cartridge ridges, console plastic shell, CRT scanlines, 8-colour palette',
    accent: 'teal',
  },
  {
    id: 'disc16',
    exhibits: ['console-03','handheld-04'],
    index: 4,
    name: '光盘纪元',
    latin: '16-BIT DISC',
    range: '1991 — 1996',
    tagline: '光盘带来彩色与声音',
    story:
      '一张银色的圆盘，装下了过去需要十几张卡带的内容。16 位主机把调色板推向几百种颜色，把立体声推上电视；同时，掌机第一次长大，长到能装下自己的世界。',
    keywords: '银盘 · 调色板 · 立体声 · 掌机 · 打包盒',
    motif: 'iridescent optical disc, expanded colour palette, glossy injection plastic',
    accent: 'teal',
  },
  {
    id: 'poly3d',
    exhibits: ['console-03'],
    index: 5,
    name: '三维与网络',
    latin: '3D & NETWORK',
    range: '1996 — 2005',
    tagline: '多边形与网线',
    story:
      '画面从平面向深处炸开。摇杆开始长出第二个同伴，线缆从客厅爬向远方，声音在耳机里变成包围感。互联网把「一台机器」变成「一张网」，也让玩法第一次有了不靠实体卡带的存在方式。',
    keywords: '多边形 · 光线追踪 · 网线 · 耳机 · 摇杆',
    motif: 'low-poly wireframe geometry, cable bundle, glowing polygon facets',
    accent: 'signal',
  },
  {
    id: 'pocket',
    exhibits: ['handheld-04','hybrid-05'],
    index: 6,
    name: '掌机与联机',
    latin: 'POCKET & ONLINE',
    range: '2004 — 2013',
    tagline: '口袋里的世界，永远在线',
    story:
      '掌机有了两块屏幕，机能有了彩色，地铁上的一小段时间被填得满满当当。同一时期，服务器开始不睡觉：在线排行、赛季、跨服对战——游戏的时间第一次从「一局」变成了「每天」。',
    keywords: '双屏 · 口袋 · 赛季 · 服务器 · 随身',
    motif: 'dual screen clamshell, folded hinge, portable form, always-on indicator',
    accent: 'teal',
  },
  {
    id: 'converge',
    exhibits: ['hybrid-05','modern-06'],
    index: 7,
    name: '融合与云',
    latin: 'CONVERGENCE & CLOUD',
    range: '2013 — 至今',
    tagline: '机器、屏幕与云合为一体',
    story:
      '主机变成了平板，电视变成了游戏机，运算搬进了没人看得见的机房。展厅的尽头不再是一排机器，而是一片随时在线的云——博物馆的墙，试着从混凝土变成了信号。',
    keywords: '平板 · 模块 · 云端 · 触屏 · 无缝',
    motif: 'modular slab, cloud lattice, seamless glass, ambient status light',
    accent: 'signal',
  },
];

/**
 * 6 件原创跨时代硬件展品。
 * 每件都给出：外形尺寸（米）、构成部件、调色、材质，全部为虚构设计。
 * @typedef {{id:string,name:string,latin:string,range:string,form:string,parts:string[],dims:{w:number;h:number;d:number},story:string,note:string,accent:'signal'|'teal'|'paper'}} ModelSpec
 */
export const models = [
  {
    id: 'cabinet-01',
    name: '星港立式机柜',
    latin: 'STARLIGHT CABINET',
    range: '1972 — 1979',
    form: '立式投币机柜',
    parts: ['灯箱招牌', '斜面操作台', '摇杆', '双按键', '投币口', '侧板纹样', '散热百叶'],
    dims: { w: 0.72, h: 1.78, d: 0.85 },
    story:
      '一台把「街机」这件事浓缩到最小空间的机器：上方灯箱负责招徕，中段屏幕负责留人，下方操作台负责让手比脑子快。投币口旁边那枚橙色小灯，是它唯一的成绩。',
    note: '原创提炼：所有早期投币机柜共有的「灯箱—屏幕—控制台」三段式比例，无任何具体机型的标识、贴图或独特造型。',
    accent: 'signal',
  },
  {
    id: 'console-02',
    name: '小行星卡带机',
    latin: 'ASTER CONSOLE',
    range: '1983 — 1990',
    form: '八位家用主机',
    parts: ['主机本体', '顶部卡槽', '复位键', '十字键手柄', '双键手柄', '连接线'],
    dims: { w: 0.22, h: 0.07, d: 0.16 },
    story:
      '巴掌大的扁平机身，插在电视下方，像一块被压扁的糖果。游戏的全部内容都住进一张比邮票略大的卡带，插下去时那声「咔哒」，是那个年代最精准的交互反馈。',
    note: '原创提炼：取八位主机通行的「扁平方盒 + 顶部卡槽 + 十字键」语汇，比例与配色为原创。',
    accent: 'teal',
  },
  {
    id: 'console-03',
    name: '子午线光盘机',
    latin: 'MERIDIAN DECK',
    range: '1994 — 2000',
    form: '16 位光盘主机',
    parts: ['圆角机身', '光盘托', '开机键', '双摇杆手柄', '状态灯条', '端口面板'],
    dims: { w: 0.32, h: 0.1, d: 0.24 },
    story:
      '圆角取代了直角，像一枚被磨圆的光盘。托盘弹出时那句机械合拢声，比任何开机画面都更有仪式感。两只摇杆开始分工：左手转向，右手确认。',
    note: '原创提炼：取光盘主机通行的圆角机身与托盘结构，具体曲线、开孔与配色均为原创。',
    accent: 'signal',
  },
  {
    id: 'handheld-04',
    name: '余烬掌机',
    latin: 'POCKET EMBER',
    range: '2004 — 2010',
    form: '双屏翻盖掌机',
    parts: ['上屏', '下屏', '转轴', '十字键', '功能键', '肩键', '扬声器格栅'],
    dims: { w: 0.14, h: 0.16, d: 0.03 },
    story:
      '合上时是一枚温热的小方块，摊开就变成两屏。上下分工：上面看世界，下面摸世界。公交车上的一次单局，不必回家、不必开机、不必插卡。',
    note: '原创提炼：取双屏翻盖掌机的双层结构与合盖动作，屏幕比例、键位与外壳分色为原创。',
    accent: 'teal',
  },
  {
    id: 'hybrid-05',
    name: '光环平板',
    latin: 'HALO SLATE',
    range: '2012 — 2017',
    form: '平板混合主机',
    parts: ['平板主体', '可拆手柄', '侧轨接口', '支撑脚', '前置扬声器', '散热背板'],
    dims: { w: 0.24, h: 0.02, d: 0.17 },
    story:
      '一块玻璃板，加上一对可以摘下来的手柄。放进客厅是主机，拿在手里是平板，接上电视又是另一台机器。它的机身薄得能透出桌面的木纹。',
    note: '原创提炼：取平板加可拆手柄的通用架构，手柄形态与轨道接口为原创设计。',
    accent: 'signal',
  },
  {
    id: 'modern-06',
    name: '矢量节点',
    latin: 'VECTOR NODE',
    range: '2020 — 至今',
    form: '立式模块化主机',
    parts: ['立式机箱', '散热格栅', '可拆侧板', '前置指示灯', '底座', '顶盖斜面'],
    dims: { w: 0.18, h: 0.34, d: 0.18 },
    story:
      '一台更像「设备」而不是「玩具」的机器。侧板可以整块抽走，格栅后面是沉默的算力。橙色指示灯只亮一次，意思是：它在等你打开自己。',
    note: '原创提炼：取当代主机/PC 融合形态的立式机箱与模块化侧板，通风栅格样式与分色为原创。',
    accent: 'teal',
  },
];

/** 展柜配置：每个展品配套的展台与铭牌文案 */
export const caseCopy = {
  'cabinet-01': {
    label: '立式投币机柜（虚构展品）',
    blurb: '三段式街机柜体的原始形态。灯箱负责招徕，屏幕负责留人，控制台负责让手比脑子快。',
  },
  'console-02': {
    label: '八位家用主机（虚构展品）',
    blurb: '扁平方盒加顶部卡槽。游戏的全部内容，住进一张比邮票略大的卡带。',
  },
  'console-03': {
    label: '16 位光盘主机（虚构展品）',
    blurb: '圆角机身与弹出托盘。左手转向，右手确认——双手分工从此开始。',
  },
  'handheld-04': {
    label: '双屏翻盖掌机（虚构展品）',
    blurb: '合上是小方块，摊开是两屏。一次单局，不必回家、不必开机、不必插卡。',
  },
  'hybrid-05': {
    label: '平板混合主机（虚构展品）',
    blurb: '玻璃板加一对可拆手柄。放进客厅是主机，拿在手里是平板。',
  },
  'modern-06': {
    label: '立式模块化主机（虚构展品）',
    blurb: '侧板整块抽走，格栅后面是沉默的算力。它更像设备，而不是玩具。',
  },
};

export const eraById = Object.fromEntries(eras.map((e) => [e.id, e]));
export const modelById = Object.fromEntries(models.map((m) => [m.id, m]));
