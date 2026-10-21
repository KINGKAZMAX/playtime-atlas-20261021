import * as THREE from 'three';

/**
 * World scale: 1 scene unit = 100 metres.
 * Distances are therefore reported as `units * METERS_PER_UNIT` metres.
 */
export const METERS_PER_UNIT = 100;

/* ------------------------------------------------------------------ *
 *  Celestial bodies
 * ------------------------------------------------------------------ */

export const STAR = {
  id: 'irda',
  name: '伊尔达',
  kind: 'star',
  position: new THREE.Vector3(9000, 2200, -7600),
  radius: 1200,
  color: 0xfff0c8,
  glow: 0xffc98a,
  scanRange: 5200,
  summary: 'G2V 主序星。表面温度 5,780 K，是这个空隙里唯一的光源与热量。',
};

export const PLANETS = [
  {
    id: 'velan',
    name: '维岚',
    kind: 'planet',
    position: new THREE.Vector3(0, 0, 0),
    radius: 800,
    atmosphere: 1.055,
    atmoColor: 0xffb877,
    atmoIntensity: 1.05,
    rotation: 0.0042,
    axialTilt: 0.19,
    texturePreset: 'velan',
    seed: 4211,
    scanRange: 1800,
    summary: '气态巨行星。氮与甲烷构成的大气被切成无数条带，赤道风速常年 1,200 km/h。',
  },
  {
    id: 'frostgap',
    name: '霜隙',
    kind: 'planet',
    position: new THREE.Vector3(-2600, 0, 1500),
    radius: 520,
    atmosphere: 1.04,
    atmoColor: 0xa8d8f0,
    atmoIntensity: 0.9,
    rotation: -0.0065,
    axialTilt: 0.62,
    texturePreset: 'frostgap',
    seed: 9021,
    ring: { inner: 760, outer: 1180, tilt: 0.62, color: 0xfff2dc },
    scanRange: 1500,
    summary: '冰巨星。环系由十亿年的冰晶碎屑构成，环面留有一道明显的卡西尼式空隙。',
  },
];

export const MOONS = [
  {
    id: 'korai',
    name: '柯莱',
    kind: 'moon',
    parent: 'velan',
    position: new THREE.Vector3(-720, 360, 700),
    radius: 96,
    rotation: 0.011,
    texturePreset: 'korai',
    seed: 3311,
    scanRange: 700,
    summary: '维岚内侧卫星。富集金属矿脉，密集的陨击坑记录着一颗被拆散的卫星系统。',
  },
  {
    id: 'morn',
    name: '莫恩',
    kind: 'moon',
    parent: 'frostgap',
    position: new THREE.Vector3(-2600, 620, 1830),
    radius: 72,
    rotation: -0.019,
    texturePreset: 'morn',
    seed: 7717,
    scanRange: 700,
    summary: '霜隙外侧冰卫星。氨冰壳下检测到未知有机分子信号，来源未明。',
  },
];

/** Three distinct anomalies scattered through the debris gallery. */
export const ANOMALIES = [
  {
    id: 'anomaly-hollow',
    name: '空心骨',
    kind: 'anomaly',
    position: new THREE.Vector3(2145, 95, -1060),
    radius: 26,
    scanRange: 420,
    summary: '中空金属结构，内部完全空腔。材质不属于任何已知工业合金。',
  },
  {
    id: 'anomaly-spindle',
    name: '纺锤遗物',
    kind: 'anomaly',
    position: new THREE.Vector3(1985, -40, -1385),
    radius: 34,
    scanRange: 420,
    summary: '自转轴对称的人工形态残片，边缘有规则切口，疑似工程弃置物。',
  },
  {
    id: 'anomaly-signal',
    name: '回声信标',
    kind: 'anomaly',
    position: new THREE.Vector3(2290, 20, -1340),
    radius: 18,
    scanRange: 420,
    summary: '持续发出 17.4 kHz 窄带信号，脉冲间隔与人类标准计时完全一致。',
  },
];

/* ------------------------------------------------------------------ *
 *  Debris gallery (asteroid belt)
 * ------------------------------------------------------------------ */

export const BELT = {
  id: 'debris-gallery',
  name: '碎屑回廊',
  center: new THREE.Vector3(2100, 40, -1200),
  majorRadius: 430,
  tubeRadius: 165,
  count: 1500,
  scaleMin: 3,
  scaleMax: 22,
  rotationAxis: new THREE.Vector3(0.18, 1, -0.12).normalize(),
};

/* ------------------------------------------------------------------ *
 *  Stations
 * ------------------------------------------------------------------ */

export const STATION = {
  id: 'beacon',
  name: '灯塔站',
  kind: 'station',
  position: new THREE.Vector3(620, 430, 520),
  coreRadius: 11,
  ringRadius: 31,
  dockOffset: new THREE.Vector3(0, 34, 0),
  dockRadius: 13,
  scanRange: 420,
  summary: '维岚轨道中继站。四座船坞，常驻补给、船员轮换与远航记录归档。',
};

export const DERELICT = {
  id: 'kalso-array',
  name: '卡尔索阵列',
  kind: 'derelict',
  position: new THREE.Vector3(2100, 40, -1200),
  radius: 34,
  scanRange: 420,
  summary: '废弃的中继阵列。表面覆满微陨石撞击坑，没有任何生命迹象。',
};

/* ------------------------------------------------------------------ *
 *  Flight regions — the player must be able to freely explore ≥3 of them
 * ------------------------------------------------------------------ */

export const REGIONS = [
  {
    id: 'velan-orbit',
    name: '维岚轨道',
    center: new THREE.Vector3(0, 0, 0),
    radius: 1600,
    color: 0xffb877,
    description: '气态巨行星维岚与灯塔站所在的轨道带。',
  },
  {
    id: 'debris-gallery',
    name: '碎屑回廊',
    center: BELT.center.clone(),
    radius: 760,
    color: 0xd8b48a,
    description: '密集岩屑带。碰撞风险高，但藏有三处未登记的异常体。',
  },
  {
    id: 'frostgap-system',
    name: '霜隙环系',
    center: PLANETS[1].position.clone(),
    radius: 1500,
    color: 0xa8d8f0,
    description: '冰巨星霜隙及其环系，卫星莫恩位于外侧轨道。',
  },
  {
    id: 'irda',
    name: '伊尔达',
    center: STAR.position.clone(),
    radius: 4200,
    color: 0xffd08a,
    description: '主序星伊尔达。日冕活动强烈，辐射带极其危险。',
  },
];

/* ------------------------------------------------------------------ *
 *  Ship configuration
 * ------------------------------------------------------------------ */

export const SHIP = {
  callsign: 'FG-1',
  thrustAccel: 0.85,          // units / s^2
  boostMultiplier: 5.2,
  lateralAccel: 0.52,
  verticalAccel: 0.46,
  brakeAccel: 3.4,
  maxSpeed: 42,
  boostFuelPerSecond: 13,
  fuelCapacity: 100,
  hullMax: 100,
  assistDamping: 0.28,        // per second, flight-assist only
  mouseGain: 0.0021,
  keyRate: 0.95,              // rad/s for arrow-key steering
  rollRate: 1.55,             // rad/s
  rateDamp: 5.4,              // per second
  eyeOffset: new THREE.Vector3(0, 0.06, 0.28),
};

/** Where the player starts: docked at the beacon's berth. */
export const SPAWN = {
  position: new THREE.Vector3(620, 469, 520),
  lookAt: new THREE.Vector3(670, 439, 439),
  velocity: new THREE.Vector3(0, 0, 0),
};

/* ------------------------------------------------------------------ *
 *  Scan targets, merged into a single lookup
 * ------------------------------------------------------------------ */

export const SCAN_TARGETS = [
  ...PLANETS,
  ...MOONS,
  ...ANOMALIES,
  STAR,
  STATION,
  DERELICT,
].map((b) => ({
  id: b.id,
  name: b.name,
  kind: b.kind,
  position: b.position.clone(),
  radius: b.radius ?? 10,
  scanRange: b.scanRange ?? 500,
  summary: b.summary ?? '',
}));

export const SCAN_KIND_LABEL = {
  planet: '行星',
  moon: '卫星',
  star: '恒星',
  station: '空间站',
  derelict: '废弃结构',
  anomaly: '异常体',
};
