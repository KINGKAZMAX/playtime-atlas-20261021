/**
 * 回响电玩馆 · 可玩展厅（年代小游戏）接入配置
 *
 * 五个可玩展厅由 08—12 号任务分别产出。本文件定义主站侧的接入契约：
 *  - `sourceDir`  ：兄弟任务目录（只读，**不得修改**）
 *  - `targetDir`  ：复制到主站 public/exhibits/ 下的目录名
 *  - `entry`      ：iframe 的入口 HTML（相对于 targetDir）
 *  - `eras`       ：该展厅覆盖的年代 id
 *
 * 同步脚本 scripts/sync-exhibits.mjs 依据实际文件是否存在，
 * 把状态置为 `integrated` 或 `pending`。主站据此渲染可玩入口，
 * 缺失时显示**明确的待集成占位**，绝不渲染假入口。
 */

export const EXHIBIT_HALLS = [
  {
    id: 'origins',
    title: '光点年代',
    subtitle: '1950—1970s 可玩展厅',
    task: '08-era-origins',
    targetDir: 'origins',
    sourceDir: '../08-era-origins',
    entry: 'index.html',
    eras: ['e02', 'e03'],
    accent: '#9AA7FF',
    summary: '以光点球与轨道引力对决重演早期电子实验与街机的对局语法。',
  },
  {
    id: 'arcade',
    title: '霓虹街廊',
    subtitle: '1980s 可玩展厅',
    task: '09-era-arcade',
    targetDir: 'arcade',
    sourceDir: '../09-era-arcade',
    entry: 'index.html',
    eras: ['e04'],
    accent: '#FF5C7A',
    summary: '晶格迷宫追逐与流星编队射击，还原街机厅的短局高密度节奏。',
  },
  {
    id: 'console',
    title: '色块远征',
    subtitle: '1990s 可玩展厅',
    task: '10-era-console',
    targetDir: 'console',
    sourceDir: '../10-era-console',
    entry: 'index.html',
    eras: ['e05', 'e06'],
    accent: '#FFC24B',
    summary: '平台冒险与等距探索场景，把十六位与早期三维时代的关卡语言做成可操作的展品。',
  },
  {
    id: 'online',
    title: '联机曙光',
    subtitle: '2000s 可玩展厅',
    task: '11-era-online',
    targetDir: 'online',
    sourceDir: '../11-era-online',
    entry: 'index.html',
    eras: ['e07', 'e08'],
    accent: '#57D6A6',
    summary: '微型策略防守与掌机风冒险区域，对手为本地 AI，不冒称真人联机。',
  },
  {
    id: 'modern',
    title: '万象游乐',
    subtitle: '2010s 至今可玩展厅',
    task: '12-era-modern',
    targetDir: 'modern',
    sourceDir: '../12-era-modern',
    entry: 'index.html',
    eras: ['e09', 'e10'],
    accent: '#B48CFF',
    summary: '节奏反应与空间解谜试玩；VR 展项为桌面交互演示，不代表支持头显设备。',
  },
];

export const HALL_BY_ID = Object.fromEntries(EXHIBIT_HALLS.map((h) => [h.id, h]));
