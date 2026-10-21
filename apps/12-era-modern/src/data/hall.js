/**
 * 展厅展项数据（原创命名与文案）。
 * 与 06-museum-core 的母馆目录对接时，只需取用 id / name / nameEn / path / desc / color。
 */

export const EXHIBITS = [
  {
    id: 'pulse',
    no: 'EXHIBIT 01',
    name: '脉冲走廊',
    nameEn: 'PULSE CORRIDOR',
    path: '/pulse',
    color: '#2E6A5E',
    soft: 'rgba(46, 106, 94, 0.14)',
    kind: '节奏反应',
    desc:
      '四轨光带从远处滑来，节拍与你的手指对撞。曲子是现场合成的，谱面即乐谱，视听永不脱节。',
    meta: ['节奏反应', '键盘 / 触屏', '三首程序化曲目'],
    note: '提供「视觉节拍」静音替代模式：不发出任何声音，节拍改由收缩节拍环、轨道脉冲与拍点标尺表达。',
  },
  {
    id: 'atrium',
    name: '折光阁',
    nameEn: 'PRISM ATRIUM',
    path: '/atrium',
    no: 'EXHIBIT 02',
    color: '#B4432B',
    soft: 'rgba(180, 67, 43, 0.12)',
    kind: '空间解谜',
    desc:
      '一座等距的玻璃中庭。转动反光板，让白光在立柱之间折返，劈成青与品红，分别落进接收环。',
    meta: ['空间解谜', '4 个关卡', '撤销 / 提示 / 重置'],
    note: '进度、星级与最佳用时自动保存在本机；解谜可随时撤销、查看提示或重置当前关卡。',
  },
  {
    id: 'halo',
    name: '光环台',
    nameEn: 'HALO DECK',
    path: '/halo',
    no: 'EXHIBIT 03',
    color: '#2C5C8F',
    soft: 'rgba(44, 92, 143, 0.12)',
    kind: '沉浸展项',
    desc:
      '夜色中的一座棱镜庭院。拖拽环视四周，热点展签在你靠近时亮起，讲述当代沉浸式硬件的来路。',
    meta: ['桌面环视', '热点展签', 'WebXR 实测按钮'],
    note: '这是桌面端交互演示：用鼠标与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显。页面提供本机 WebXR 支持的真实检测按钮。',
  },
];

export const KEYWORDS = [
  {
    zh: '触屏化',
    en: 'TOUCH',
    color: '#2E6A5E',
    text: '手机成为第一批真正的游戏主机。触屏没有摇杆与按键，设计师必须把操作重新想一遍：点、划、拖、长按。轻量、短局、一键即玩成为移动游戏的基本语法。',
  },
  {
    zh: '独立化',
    en: 'INDIE',
    color: '#8A5A00',
    text: '数字发行让小团队绕开发行商与实体零售。一款由一人完成的作品可以在商店页上架，并被全球玩家看见——独立游戏从「小众品类」变成了主流供给的一部分。',
  },
  {
    zh: '服务化',
    en: 'SERVICE',
    color: '#B4432B',
    text: '作品越来越像持续运营的服务：赛季、直播活动、创作者工坊与内购经济把「一次通关」改写成「长期在线」。游戏与运营的边界被彻底抹平。',
  },
  {
    zh: '沉浸化',
    en: 'IMMERSIVE',
    color: '#5B3FA8',
    text: '头显把视角从屏幕搬进空间，六自由度定位与身体姿态成为新的输入方式。与此同时，WebXR、OpenXR 等开放标准让浏览器也能承载轻量的沉浸体验。',
  },
];

export const HALL_FACTS = [
  { value: '3', label: '件可玩展项' },
  { value: '24', label: '条史料条目' },
  { value: '3', label: '首程序化曲目' },
  { value: '4', label: '个解谜关卡' },
];
