/**
 * 霓虹街廊 · 街机可玩展厅
 * src/i18n/strings.js — 中英文案骨架（zh / en）
 *
 * 依据：16-design-system/DESIGN-SPEC.md §2.3、§4.3 与 RESTYLE-SPEC 第 2 步
 * 「补 zh/en 切换（至少保证 key 存在、英文版可由 19/14 统一接入）」。
 *
 * 规则：
 *  1. 全部文案为本作品原创；英文版不是机器直译，而是同义重写，
 *     保持街机厅的口气，不照搬任何参考站文本。
 *  2. 中文在前、英文在后；切换只替换文本节点，不做整页重排动画。
 *  3. 语言状态写入 localStorage，并同步 `<html lang>`。
 *  4. **画布内文本不参与本表**：画布上的拉丁 HUD 由点阵字库绘制，
 *     属于街机层美术（红线 K.1）。
 */

const S = {
  skipToStage: { zh: '跳到游戏画面', en: 'Skip to the game screen' },
  workTitle: { zh: '霓虹街廊 · 街机可玩展厅', en: 'Neon Corridor · Arcade Playable Hall' },
  workSub: {
    zh: 'NEON CORRIDOR · 1980s ARCADE HALL · 原创演绎',
    en: 'NEON CORRIDOR · 1980s ARCADE HALL · an original take',
  },
  navChronicle: { zh: '街机纪年', en: 'Chronicle' },
  navSettings: { zh: '设置', en: 'Settings' },
  navLedger: { zh: '荣誉榜', en: 'Ledger' },
  crtOn: { zh: 'CRT 开', en: 'CRT on' },
  crtOff: { zh: 'CRT 关', en: 'CRT off' },
  soundOn: { zh: '声音 开', en: 'Sound on' },
  soundOff: { zh: '声音 关', en: 'Sound off' },
  touch: { zh: '触控', en: 'Touch' },
  pause: { zh: '暂停', en: 'Pause' },
  resume: { zh: '继续', en: 'Resume' },
  langToEn: { zh: '切换到英文', en: 'Switch to Chinese' },
  langToZh: { zh: '切换到中文', en: 'Switch to Chinese' },
  toolsLabel: { zh: '工具', en: 'Tools' },
  exhibitsLabel: { zh: '展品目录', en: 'Exhibits' },
  stageLabel: { zh: '街机展厅画面', en: 'Arcade hall screen' },

  statusHall: {
    zh: '← → 沿街廊走动，站到终端前按 <kbd>空格</kbd> 进入；也可直接点击终端，或使用下方展品目录。',
    en: 'Walk with <kbd>←</kbd> <kbd>→</kbd> and press <kbd>Space</kbd> at a terminal — or click a cabinet directly, or use the exhibit list.',
  },
  statusLattice: {
    zh: '点击画面启用键盘 · 方向键 / WASD 移动 · <kbd>空格</kbd> 相位穿行 · <kbd>E</kbd> 残响 · <kbd>P</kbd> 暂停 · <kbd>R</kbd> 重开',
    en: 'Click the screen to enable the keyboard · Arrows / WASD to move · <kbd>Space</kbd> phase dash · <kbd>E</kbd> echo · <kbd>P</kbd> pause · <kbd>R</kbd> restart',
  },
  statusMeteor: {
    zh: '点击画面启用键盘 · <kbd>A</kbd> <kbd>D</kbd> 移动 · <kbd>空格</kbd> 开火 · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> 弹型 · <kbd>F</kbd> 共振激爆',
    en: 'Click the screen to enable the keyboard · <kbd>A</kbd> <kbd>D</kbd> to move · <kbd>Space</kbd> fire · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> shot type · <kbd>F</kbd> resonance burst',
  },

  panelPauseTitle: { zh: '已暂停', en: 'Paused' },
  panelPauseSub: { zh: 'PAUSED', en: 'PAUSED' },
  panelHelpTitle: { zh: '操作说明', en: 'Controls' },
  panelSettingsTitle: { zh: '设置', en: 'Settings' },
  panelChronicleTitle: { zh: '街机纪年', en: 'Arcade Chronicle' },
  panelChronicleSub: { zh: 'CHRONICLE · 1970s—1990s', en: 'CHRONICLE · 1970s—1990s' },
  panelLedgerTitle: { zh: '荣誉榜', en: 'Neon Ledger' },
  panelLedgerSub: { zh: 'LEDGER · LOCAL RECORDS', en: 'LEDGER · LOCAL RECORDS' },
  panelRulesTitle: { zh: '玩法', en: 'How to play' },
  panelGameOverSuffix: { zh: '结算', en: 'Result' },
  panelDefaultLabel: { zh: '面板', en: 'Panel' },

  keyMove: { zh: '<kbd>方向键</kbd> / <kbd>WASD</kbd> 移动', en: '<kbd>Arrows</kbd> / <kbd>WASD</kbd> move' },
  keyAction: { zh: '<kbd>空格</kbd> 主操作', en: '<kbd>Space</kbd> primary action' },
  keySkill: { zh: '<kbd>E</kbd> 副操作', en: '<kbd>E</kbd> secondary action' },
  keySlots: { zh: '<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> 切换', en: '<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> switch' },
  keyBurst: { zh: '<kbd>F</kbd> 共振激爆', en: '<kbd>F</kbd> resonance burst' },
  keySystem: {
    zh: '<kbd>P</kbd> 暂停 · <kbd>R</kbd> 重开 · <kbd>M</kbd> 静音 · <kbd>H</kbd> 帮助',
    en: '<kbd>P</kbd> pause · <kbd>R</kbd> restart · <kbd>M</kbd> mute · <kbd>H</kbd> help',
  },
  keySystemShort: {
    zh: '<kbd>P</kbd> 暂停 · <kbd>R</kbd> 重开 · <kbd>M</kbd> 静音',
    en: '<kbd>P</kbd> pause · <kbd>R</kbd> restart · <kbd>M</kbd> mute',
  },

  actionResume: { zh: '继续', en: 'Resume' },
  actionRestart: { zh: '重新开始', en: 'Restart' },
  actionSettings: { zh: '设置', en: 'Settings' },
  actionBackHall: { zh: '返回展厅', en: 'Back to hall' },
  actionBack: { zh: '返回', en: 'Back' },
  actionAgain: { zh: '再来一局', en: 'Play again' },
  actionPlay: { zh: '开始游玩', en: 'Start playing' },
  actionDone: { zh: '完成', en: 'Done' },

  finalScoreLabel: { zh: '最终得分', en: 'Final score' },
  ledgerEmpty: { zh: '还没有记录，去打一局。', en: 'No scores yet — go play a round.' },
  ledgerNone: { zh: '暂无记录', en: 'No scores yet' },
  ledgerNote: {
    zh: '记录保存在你本机的浏览器里（localStorage），不会上传，刷新后仍在。',
    en: 'Records live in this browser only (localStorage). Nothing is uploaded, and they survive a reload.',
  },
  sourcePrefix: { zh: '来源：', en: 'Source: ' },

  settingCrt: { zh: 'CRT 显像管效果', en: 'CRT tube effect' },
  settingSound: { zh: '音效与背景音乐', en: 'Sound effects and music' },
  settingDemo: { zh: '演示模式（不结算伤害）', en: 'Demo mode (no damage taken)' },
  settingDifficulty: { zh: '难度', en: 'Difficulty' },
  settingDifficultyLabel: { zh: '难度', en: 'Difficulty' },
  on: { zh: '开', en: 'On' },
  off: { zh: '关', en: 'Off' },
  currentDifficulty: { zh: '当前难度：', en: 'Current difficulty: ' },

  controlsLabel: { zh: '操作', en: 'Controls' },
  touchDirLabel: { zh: '方向控制', en: 'Direction controls' },
  touchActionLabel: { zh: '动作按钮', en: 'Action buttons' },
  touchUp: { zh: '上', en: 'Up' },
  touchDown: { zh: '下', en: 'Down' },
  touchLeft: { zh: '左', en: 'Left' },
  touchRight: { zh: '右', en: 'Right' },
  touchMain: { zh: '主操作', en: 'Primary action' },
  touchAlt: { zh: '副操作', en: 'Secondary action' },
  touchLatticeAction: { zh: '相位', en: 'Phase' },
  touchLatticeSkill: { zh: '残响', en: 'Echo' },
  touchMeteorAction: { zh: '开火', en: 'Fire' },
  touchMeteorSkill: { zh: '换弹', en: 'Swap' },
  touchHallAction: { zh: '进入', en: 'Enter' },
  footerNote: {
    zh: '本作品为原创演绎：机制取自街机黄金时代的公共范式，角色、地图、规则、音效与视觉全部重新设计；不含任何未授权 ROM、商业游戏资源或品牌视觉。时代介绍附可核查来源，见「街机纪年」。',
    en: 'An original interpretation: the mechanics borrow the shared vocabulary of the arcade golden age, while the characters, maps, rules, audio and artwork are newly designed. It contains no unlicensed ROM, commercial game assets or brand imagery. Every historical statement links to a checkable source — see the Chronicle.',
  },
  footerMeta1: { zh: '纯静态 · 零外部依赖 · 离线可运行', en: 'Static · zero runtime dependencies · works offline' },
  indicatorLabel: { zh: '第 %d / %d 件展品', en: 'Exhibit %d of %d' },
};

export const STRINGS = S;

/** 当前语言（zh / en） */
let current = 'zh';

export function getLang() {
  return current;
}

/** 取一条文案；key 不存在时回退到 key 本身，便于发现遗漏 */
export function t(key, lang = current) {
  const entry = S[key];
  if (!entry) return key;
  return entry[lang] || entry.zh;
}

/** 取数据对象里对应语言的字段（{cn, en} 或 {zh, en}） */
export function pick(obj, lang = current) {
  if (!obj) return '';
  const v = lang === 'en' ? (obj.en ?? obj.cn ?? obj.zh) : (obj.cn ?? obj.zh ?? obj.en);
  return v ?? '';
}

export function detectLang() {
  try {
    const saved = localStorage.getItem('neon-corridor.lang');
    if (saved === 'en' || saved === 'zh') return saved;
  } catch {
    /* 隐私模式或跨源 iframe 下可能不可用 */
  }
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;
  } catch {
    /* ignore */
  }
  return 'zh';
}

/**
 * 应用语言：更新 `<html lang>`，并把带 `data-i18n` 的静态节点换成对应文案。
 * 只替换文本节点，不做整页重排动画（DESIGN-SPEC §4.3）。
 */
export function applyLang(lang) {
  current = lang === 'en' ? 'en' : 'zh';
  document.documentElement.lang = current === 'en' ? 'en' : 'zh-CN';
  // 主题兜底：本作品只有暗色主题，令牌由 [data-ds-theme="dark"] 给出
  // （MIGRATION-NOTES §1.1-A2 / §2.0 09 行 ①）。index.html 已静态带上该属性，
  // 这里只防「属性被外部脚本移除」这一种情况，避免整套配色失效。
  if (!document.documentElement.getAttribute('data-ds-theme')) {
    document.documentElement.setAttribute('data-ds-theme', 'dark');
  }
  try {
    localStorage.setItem('neon-corridor.lang', current);
  } catch {
    /* ignore */
  }
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (S[key]) node.innerHTML = S[key][current] || S[key].zh;
  });
  return current;
}
