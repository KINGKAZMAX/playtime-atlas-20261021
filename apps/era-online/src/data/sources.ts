/**
 * sources.ts — 史料来源台账（单一数据源）。
 *
 * 展厅正文、展项内对话、年表与展柜全部引用这里的条目，
 * 保证同一个事实只挂一个链接，台账与正文不会漂移。
 *
 * 来源分级：
 * - `official`  厂商官网 / 官方新闻页（一手）
 * - `wiki`      维基百科条目（次级源，用于交叉核对具体日期与首发地区）
 *
 * ⚠️ 全部 URL 已于 2026-10-21 用 HTTP GET 抽样验证可达（见 QA.md）。
 * ⚠️ 引用 ≠ 授权。本展厅不复用这些站点的图片、字体或商标，详见 LICENSES.md。
 */

export type SourceTier = 'official' | 'wiki';

export interface SourceEntry {
  id: string;
  /** 中文标题 */
  title: string;
  url: string;
  tier: SourceTier;
  /** 用于哪一类事实 */
  topic: '掌机' | '主机' | '联机服务' | '作品' | '平台' | '网络' | '类型';
  /** 核实日期 */
  checked: string;
}

export const CHECKED_ON = '2026-10-21';

export const SOURCES: SourceEntry[] = [
  // ── 一手 / 官方 ──
  { id: 'nin-hist', title: '任天堂官方社史（Corporate History）', url: 'https://www.nintendo.co.jp/corporate/en/history/index.html', tier: 'official', topic: '掌机', checked: CHECKED_ON },
  { id: 'ps-hist', title: 'PlayStation 官方历史（PlayStation History）', url: 'https://www.playstation.com/en-us/playstation-history/', tier: 'official', topic: '主机', checked: CHECKED_ON },
  { id: 'steam-20', title: 'Steam 二十周年官方公告', url: 'https://store.steampowered.com/news/app/593110', tier: 'official', topic: '联机服务', checked: CHECKED_ON },
  { id: 'valve-co', title: 'Valve 官网', url: 'https://www.valvesoftware.com/en/', tier: 'official', topic: '联机服务', checked: CHECKED_ON },
  { id: 'chm', title: '计算机历史博物馆（Computer History Museum）', url: 'https://www.computerhistory.org/', tier: 'official', topic: '平台', checked: CHECKED_ON },

  // ── 次级 / 百科（交叉核对） ──
  { id: 'wp-gbc', title: 'Game Boy Color', url: 'https://en.wikipedia.org/wiki/Game_Boy_Color', tier: 'wiki', topic: '掌机', checked: CHECKED_ON },
  { id: 'wp-gba', title: 'Game Boy Advance', url: 'https://en.wikipedia.org/wiki/Game_Boy_Advance', tier: 'wiki', topic: '掌机', checked: CHECKED_ON },
  { id: 'wp-nds', title: 'Nintendo DS', url: 'https://en.wikipedia.org/wiki/Nintendo_DS', tier: 'wiki', topic: '掌机', checked: CHECKED_ON },
  { id: 'wp-psp', title: 'PlayStation Portable', url: 'https://en.wikipedia.org/wiki/PlayStation_Portable', tier: 'wiki', topic: '掌机', checked: CHECKED_ON },
  { id: 'wp-nwfc', title: 'Nintendo Wi-Fi Connection', url: 'https://en.wikipedia.org/wiki/Nintendo_Wi-Fi_Connection', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-ninlist', title: 'List of Nintendo video game consoles', url: 'https://en.wikipedia.org/wiki/List_of_Nintendo_video_game_consoles', tier: 'wiki', topic: '掌机', checked: CHECKED_ON },
  { id: 'wp-hist', title: 'History of video game consoles', url: 'https://en.wikipedia.org/wiki/History_of_video_game_consoles', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-vgc', title: 'Video game console', url: 'https://en.wikipedia.org/wiki/Video_game_console', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-ps2', title: 'PlayStation 2', url: 'https://en.wikipedia.org/wiki/PlayStation_2', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-xbox', title: 'Xbox (console)', url: 'https://en.wikipedia.org/wiki/Xbox_(console)', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-x360', title: 'Xbox 360', url: 'https://en.wikipedia.org/wiki/Xbox_360', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-ps3', title: 'PlayStation 3', url: 'https://en.wikipedia.org/wiki/PlayStation_3', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-wii', title: 'Wii', url: 'https://en.wikipedia.org/wiki/Wii', tier: 'wiki', topic: '主机', checked: CHECKED_ON },
  { id: 'wp-xlive', title: 'Xbox network（前称 Xbox Live）', url: 'https://en.wikipedia.org/wiki/Xbox_network', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-psn', title: 'PlayStation Network', url: 'https://en.wikipedia.org/wiki/PlayStation_Network', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-steam', title: 'Steam (service)', url: 'https://en.wikipedia.org/wiki/Steam_(service)', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-bnet', title: 'Battle.net', url: 'https://en.wikipedia.org/wiki/Battle.net', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-bliz', title: 'Blizzard Entertainment', url: 'https://en.wikipedia.org/wiki/Blizzard_Entertainment', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-valve', title: 'Valve Corporation', url: 'https://en.wikipedia.org/wiki/Valve_Corporation', tier: 'wiki', topic: '联机服务', checked: CHECKED_ON },
  { id: 'wp-mmo', title: 'Massively multiplayer online game（MMO 词条）', url: 'https://en.wikipedia.org/wiki/Massively_multiplayer_online_game', tier: 'wiki', topic: '类型', checked: CHECKED_ON },
  { id: 'wp-eq', title: 'EverQuest', url: 'https://en.wikipedia.org/wiki/EverQuest', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-realm', title: 'The Realm Online', url: 'https://en.wikipedia.org/wiki/The_Realm_Online', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-ultima', title: 'Ultima Online', url: 'https://en.wikipedia.org/wiki/Ultima_Online', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-wow', title: 'World of Warcraft', url: 'https://en.wikipedia.org/wiki/World_of_Warcraft', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-wowbc', title: 'World of Warcraft: The Burning Crusade', url: 'https://en.wikipedia.org/wiki/World_of_Warcraft:_The_Burning_Crusade', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-mc', title: 'Minecraft', url: 'https://en.wikipedia.org/wiki/Minecraft', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-sl', title: 'Second Life', url: 'https://en.wikipedia.org/wiki/Second_Life', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-lol', title: 'League of Legends', url: 'https://en.wikipedia.org/wiki/League_of_Legends', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-dota', title: 'Defense of the Ancients（DotA）', url: 'https://en.wikipedia.org/wiki/Defense_of_the_Ancients', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-star', title: 'StarCraft', url: 'https://en.wikipedia.org/wiki/StarCraft', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-bw', title: 'StarCraft: Brood War', url: 'https://en.wikipedia.org/wiki/StarCraft:_Brood_War', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-w3', title: 'Warcraft III: The Frozen Throne', url: 'https://en.wikipedia.org/wiki/Warcraft_III:_The_Frozen_Throne', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-d2', title: 'Diablo II', url: 'https://en.wikipedia.org/wiki/Diablo_II', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-d3', title: 'Diablo III', url: 'https://en.wikipedia.org/wiki/Diablo_III', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-tf2', title: 'Team Fortress 2', url: 'https://en.wikipedia.org/wiki/Team_Fortress_2', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-cs', title: 'Counter-Strike', url: 'https://en.wikipedia.org/wiki/Counter-Strike', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-css', title: 'Counter-Strike: Source', url: 'https://en.wikipedia.org/wiki/Counter-Strike:_Source', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-l4d', title: 'Left 4 Dead', url: 'https://en.wikipedia.org/wiki/Left_4_Dead', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-portal', title: 'Portal (video game)', url: 'https://en.wikipedia.org/wiki/Portal_(video_game)', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-hl2', title: 'Half-Life 2', url: 'https://en.wikipedia.org/wiki/Half-Life_2', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-nwn', title: 'Neverwinter Nights (2002 video game)', url: 'https://en.wikipedia.org/wiki/Neverwinter_Nights_(2002_video_game)', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-gmod', title: "Garry's Mod", url: 'https://en.wikipedia.org/wiki/Garry%27s_Mod', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-cod4', title: 'Call of Duty 4: Modern Combat', url: 'https://en.wikipedia.org/wiki/Call_of_Duty_4:_Modern_Combat', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-halo3', title: 'Halo 3', url: 'https://en.wikipedia.org/wiki/Halo_3', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-gta3', title: 'Grand Theft Auto III', url: 'https://en.wikipedia.org/wiki/Grand_Theft_Auto_III', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-gtavc', title: 'Grand Theft Auto: Vice City', url: 'https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Vice_City', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-gtasa', title: 'Grand Theft Auto: San Andreas', url: 'https://en.wikipedia.org/wiki/Grand_Theft_Auto:_San_Andreas', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-maple', title: 'MapleStory', url: 'https://en.wikipedia.org/wiki/MapleStory', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-gw', title: 'Guild Wars', url: 'https://en.wikipedia.org/wiki/Guild_Wars', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-ru', title: 'RuneScape', url: 'https://en.wikipedia.org/wiki/Runescape', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-ffxi', title: 'Final Fantasy XI', url: 'https://en.wikipedia.org/wiki/Final_Fantasy_XI', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-aoe2', title: 'Age of Empires II', url: 'https://en.wikipedia.org/wiki/Age_of_Empires_II', tier: 'wiki', topic: '作品', checked: CHECKED_ON },
  { id: 'wp-xp', title: 'Windows XP', url: 'https://en.wikipedia.org/wiki/Windows_XP', tier: 'wiki', topic: '平台', checked: CHECKED_ON },
  { id: 'wp-iphone', title: 'iPhone', url: 'https://en.wikipedia.org/wiki/IPhone', tier: 'wiki', topic: '平台', checked: CHECKED_ON },
  { id: 'wp-mobile', title: 'Mobile game', url: 'https://en.wikipedia.org/wiki/Mobile_game', tier: 'wiki', topic: '平台', checked: CHECKED_ON },
  { id: 'wp-ngage', title: 'N-Gage', url: 'https://en.wikipedia.org/wiki/N-Gage', tier: 'wiki', topic: '掌机', checked: CHECKED_ON },
  { id: 'wp-irc', title: 'Internet Relay Chat', url: 'https://en.wikipedia.org/wiki/Internet_Relay_Chat', tier: 'wiki', topic: '网络', checked: CHECKED_ON },
  { id: 'wp-browser', title: 'Browser game', url: 'https://en.wikipedia.org/wiki/Browser_game', tier: 'wiki', topic: '类型', checked: CHECKED_ON },
  { id: 'wp-vw', title: 'Virtual World', url: 'https://en.wikipedia.org/wiki/Virtual_World', tier: 'wiki', topic: '类型', checked: CHECKED_ON },
  { id: 'wp-online', title: 'Online game', url: 'https://en.wikipedia.org/wiki/Online_game', tier: 'wiki', topic: '类型', checked: CHECKED_ON },
];

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]));

export function getSource(id: string): SourceEntry | undefined {
  return BY_ID.get(id);
}

export function sourceUrl(id: string): string {
  return BY_ID.get(id)?.url ?? '#';
}

/** 生成一枚来源角标（可点击，链接到来源原文）。 */
export function sourceChip(id: string, label?: string): string {
  const s = BY_ID.get(id);
  if (!s) return '';
  const text = label ?? (s.tier === 'official' ? '官方' : '百科');
  const title = `${s.title}（${s.tier === 'official' ? '一手来源' : '次级来源'}，核对于 ${s.checked}）`;
  return `<a class="src" href="${s.url}" target="_blank" rel="noopener noreferrer" title="${escapeAttr(title)}" data-src-tier="${s.tier}">${escapeHtml(text)}</a>`;
}

/** 与 sourceChip 等价，但返回真实 DOM 节点（便于事件绑定与追加）。 */
export function sourceChipEl(id: string, label?: string): HTMLAnchorElement | null {
  const s = BY_ID.get(id);
  if (!s) return null;
  const a = document.createElement('a');
  a.className = 'src';
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.dataset.srcTier = s.tier;
  a.title = `${s.title}（${s.tier === 'official' ? '一手来源' : '次级来源'}，核对于 ${s.checked}）`;
  a.textContent = label ?? (s.tier === 'official' ? '官方' : '百科');
  return a;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

export const TIER_LABEL: Record<SourceTier, string> = {
  official: '一手 · 官方',
  wiki: '次级 · 百科',
};
