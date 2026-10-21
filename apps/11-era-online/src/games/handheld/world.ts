/**
 * handheld/world.ts — 《口袋回声》的地图与剧情数据。
 *
 * 地图为 20×18 的字符网格，全部手工排布（行宽已校验为 20）。
 * 角色名、地名、剧情与机关全部为本展厅原创虚构。
 * NPC 对话中涉及的真实历史陈述会挂上来源角标。
 */

export const MAP_W = 20;
export const MAP_H = 18;
export const TILE = 8;
export const SCREEN_W = MAP_W * TILE; // 160
export const SCREEN_H = MAP_H * TILE; // 144

export type AreaId = 'town' | 'cavern' | 'lighthouse';

export interface AreaDef {
  id: AreaId;
  name: string;
  en: string;
  /** 进入该区域时显示的地点名（点阵字体用英文缩写） */
  tag: string;
  rows: string[];
  /** 该区域会刷新的噬潮蟹 */
  crabs: Array<[number, number]>;
}

export const AREAS: Record<AreaId, AreaDef> = {
  town: {
    id: 'town',
    name: '渡口小镇',
    en: 'HARBOR TOWN',
    tag: 'TOWN',
    crabs: [],
    rows: [
      '####################',
      '#....#........#....#',
      '#.N..#..,,,,..#A.,.#',
      '#....+..,,,,..#..,.#',
      '#.P..#..,,,,..#..,.#',
      '#....#..,,,,..#..,.#',
      '#.S..#........#..,.#',
      '#....########.#..,.#',
      '#..................#',
      '#..,,..........,,..#',
      '#..,,..........,,..#',
      '#..,,..~~~~~~..,,..#',
      '#..,,..~~~~~~..,,..#',
      '#..,,..........,,..#',
      '#.......D..........#',
      '#..................#',
      '#..........L.......#',
      '####################',
    ],
  },
  cavern: {
    id: 'cavern',
    name: '潮汐洞窟',
    en: 'TIDAL CAVERN',
    tag: 'CAVERN',
    crabs: [
      [2, 4],
      [16, 4],
      [3, 12],
      [15, 9],
      [8, 4],
    ],
    rows: [
      '####################',
      '#..................#',
      '#..~~~....X....~~~.#',
      '#..~~~.........~~~.#',
      '#..................#',
      '#..X.........X.....#',
      '#..................#',
      '#.....#######......#',
      '#.....+.....#......#',
      '#..N..#..S..#...X..#',
      '#.....#.....#......#',
      '#.....#######......#',
      '#..................#',
      '#..X...........X...#',
      '#..................#',
      '#.........D........#',
      '#..................#',
      '####################',
    ],
  },
  lighthouse: {
    id: 'lighthouse',
    name: '灯塔顶台',
    en: 'BEACON TOP',
    tag: 'LIGHT',
    crabs: [],
    rows: [
      '####################',
      '#..................#',
      '#..X............X..#',
      '#..................#',
      '#.......B..........#',
      '#..................#',
      '#..S.............N.#',
      '#..................#',
      '#..X............X..#',
      '#.....X.......X....#',
      '#.....X.......X....#',
      '#.....#######......#',
      '#.....#.....#......#',
      '#.....#.....#.....D#',
      '#.....#######......#',
      '#..................#',
      '#..................#',
      '####################',
    ],
  },
};

export const AREA_ORDER: AreaId[] = ['town', 'cavern', 'lighthouse'];

/** 各地图之间通过门牌字符互通。 */
export const DOOR_TARGET: Record<string, AreaId> = {
  D: 'cavern', // 洞窟门：town ⇄ cavern
  A: 'lighthouse', // 灯塔门：town → lighthouse
};

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  area: AreaId;
  col: number;
  row: number;
  /** 对白按顺序轮播 */
  lines: Array<{ text: string; src: string[] }>;
}

export const NPCS: NpcDef[] = [
  {
    id: 'cen',
    name: '岑',
    role: '守灯人',
    area: 'town',
    col: 2,
    row: 2,
    lines: [
      {
        text: '你听见潮水了？这片渡口十年前还没有灯，只有夜里乱撞的船。',
        src: [],
      },
      {
        text: '现在家家户户都有个"账号"了。Xbox Live 是 2002 年 11 月 15 日随初代 Xbox 开放的，PlayStation Network 则是 2006 年 11 月上线，Nintendo Wi-Fi Connection 在 2005 年 11 月 14 日为 DS 和 Wii 提供免费联机。主机不再只是接电视的盒子。',
        src: ['wp-xlive', 'wp-psn', 'wp-nwfc'],
      },
      {
        text: '灯闸在镇子南边。把它扳开，灯塔的门才会认你。',
        src: [],
      },
    ],
  },
  {
    id: 'lan',
    name: '岚',
    role: '拾遗者',
    area: 'cavern',
    col: 3,
    row: 9,
    lines: [
      {
        text: '别踩到那些钳子。我的蟹子只是好奇，不是恶意——它们比我更早住在这里。',
        src: [],
      },
      {
        text: '这洞窟里的东西全是从"服务器"上"下载"下来的。Steam 在 2003 年 9 月上线时还只是给 Valve 自家游戏做自动更新的客户端，到 2005 年底才开始发行第三方作品；暴雪的 Battle.net 更早，1997 年 1 月就随《Diablo》一起启用了。',
        src: ['wp-steam', 'steam-20', 'wp-bnet', 'valve-co'],
      },
      {
        text: '碎片碎了三次才凑齐一回回声。往里走，最里面那间封着的屋子里应该还剩一枚。',
        src: [],
      },
    ],
  },
  {
    id: 'wei',
    name: '薇',
    role: '记录员',
    area: 'lighthouse',
    col: 17,
    row: 6,
    lines: [
      {
        text: '你把三枚回声都带上来啦。灯芯认得它们。',
        src: [],
      },
      {
        text: '我抄录过一句话，说这个时代真正的发明不是主机，是"持续在线"。《World of Warcraft》2001 年公布、2004 年 11 月 23 日发售，玩家被要求每周按时回来；而 Second Life 在 2003 年 6 月 23 日公开上线，把"游戏"变成了可以盖房子的地方。',
        src: ['wp-wow', 'wp-sl', 'wp-mmo', 'wp-vw'],
      },
      {
        text: '去点亮灯芯吧。点亮之前，灯塔只是一堆石头。',
        src: [],
      },
    ],
  },
];

/** 三枚回声碎片：分别位于小镇、洞窟、灯塔。 */
export const SHARD_SPOTS: Array<{ area: AreaId; col: number; row: number; name: string }> = [
  { area: 'town', col: 2, row: 6, name: '回声碎片 · 潮' },
  { area: 'cavern', col: 9, row: 9, name: '回声碎片 · 隙' },
  { area: 'lighthouse', col: 3, row: 6, name: '回声碎片 · 顶' },
];

/** 灯闸位置。 */
export const LEVER_SPOT = { area: 'town' as AreaId, col: 11, row: 16 };

/** 玩家出生点。 */
export const START_SPOT = { area: 'town' as AreaId, col: 2, row: 4 };

/** 灯芯（结局触发点）。 */
export const BEACON_SPOT = { area: 'lighthouse' as AreaId, col: 8, row: 4 };

export const PLAYER_MAX_HP = 5;
