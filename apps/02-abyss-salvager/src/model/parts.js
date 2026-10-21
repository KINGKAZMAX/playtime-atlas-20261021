/**
 * 构件定义 —— 轻量模块（**不依赖 three**）。
 *
 * 单独成模块的原因：说明页 notes.html 只需要构件的中英对照表，
 * 若从 harvester.js 取会连带把 three 打进说明页的包。
 *
 * 这里是**唯一真源**：检视台的编号标注、构件选择面板、层级开关、
 * 说明页的对照表、以及导出元数据里的构件 key，全部引用本文件。
 */

/** Named structural groups, used for the explode / x-ray / callout systems. */
export const PART_GROUPS = {
  CROWN: 'crown',
  BLADE: 'blade',
  VANE: 'vane',
  ARM: 'arm',
  SENSOR: 'sensor',
  CARAPACE: 'carapace',
  KEEL: 'keel',
  REDUCER: 'reducer',
  STRUT: 'strut',
  PHOTOPHORE: 'photophore',
  HEATVENT: 'heatvent',
  SUCKER: 'sucker',
  FAN: 'fan',
  HOPPER: 'hopper',
};

/** Bilingual callout for every annotation anchor. */
export const ANNOTATIONS = [
  { id: 'crown', cn: '磨削冠', en: 'Milling crown', group: PART_GROUPS.CROWN },
  { id: 'blade', cn: '螺旋刀片', en: 'Spiral cutter blade', group: PART_GROUPS.BLADE },
  { id: 'vane', cn: '矿浆导流叶', en: 'Slurry deflector vane', group: PART_GROUPS.VANE },
  { id: 'arm', cn: '矿石抓取臂', en: 'Ore grappler arm', group: PART_GROUPS.ARM },
  { id: 'sensor', cn: '声呐桅杆', en: 'Sonar mast', group: PART_GROUPS.SENSOR },
  { id: 'carapace', cn: '叠压甲壳板', en: 'Overlapping carapace', group: PART_GROUPS.CARAPACE },
  { id: 'keel', cn: '承力脊梁', en: 'Load keel beam', group: PART_GROUPS.KEEL },
  { id: 'reducer', cn: '行星减速组', en: 'Planetary reducer', group: PART_GROUPS.REDUCER },
  { id: 'strut', cn: '液压伸缩撑', en: 'Hydraulic strut', group: PART_GROUPS.STRUT },
  { id: 'photophore', cn: '荧光鳃瓣', en: 'Bioluminescent gill', group: PART_GROUPS.PHOTOPHORE },
  { id: 'heatvent', cn: '热液排口', en: 'Hydrothermal heat vent', group: PART_GROUPS.HEATVENT },
  { id: 'sucker', cn: '腹面吸盘', en: 'Ventral anchor sucker', group: PART_GROUPS.SUCKER },
  { id: 'hopper', cn: '矿仓观察窗', en: 'Ore hopper window', group: PART_GROUPS.HOPPER },
  { id: 'fan', cn: '尾扇叶片', en: 'Caudal fan blade', group: PART_GROUPS.FAN },
];

/** partGroup → { id, cn, en }，供选择面板与说明页复用。 */
export const PART_LABELS = new Map(
  ANNOTATIONS.map((a) => [a.group, { id: a.id, cn: a.cn, en: a.en }])
);
