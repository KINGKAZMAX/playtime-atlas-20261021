/**
 * Central parameter registry for the abyssal harvester.
 *
 * Every value here is live-editable from the control panel and every one of them
 * actually changes the built geometry / shading / scene. Nothing in this file is
 * decorative.
 */

export const DEFAULTS = Object.freeze({
  // ---- carapace architecture ---------------------------------------------
  segmentCount: 18, // 18 节驱动体节 / driven carapace segments
  segmentLength: 1.0, // base length of one body segment
  bodyRadius: 0.62, // radius of the carapace ring
  bladeCount: 7, // spiral cutter blades on the milling crown
  tailBladeCount: 5, // caudal fan blades
  vaneCount: 3, // deflector vanes around the intake throat

  // ---- materials ----------------------------------------------------------
  plateColor: '#2b3a42', // chitin carapace, cold slate-teal
  accentColor: '#38e8d0', // bioluminescent photophore teal
  ventColor: '#ff6a2b', // hydrothermal heat orange
  metalRoughness: 0.34, // brushed structural alloy
  armorOpacity: 1.0, // outer carapace opacity (x-ray uses this)
  accentIntensity: 2.4, // emissive strength of the photophores

  // ---- locomotion ---------------------------------------------------------
  gaitSpeed: 0.5, // peristaltic cycle rate
  gaitEnabled: true,
  undulation: 1.0, // lateral wave amplitude along the body

  // ---- scene / presentation -----------------------------------------------
  theme: 'abyss', // 'abyss' | 'sonar'
  exposure: 1.1,
  keyAzimuth: 128, // degrees, bearing of the survey floodlight
  keyElevation: 38, // degrees
  showTerrain: true,
  showSnow: true,
  showAnnotations: true,
  showGrid: true,
  showBloom: true,

  // ---- inspection tools ---------------------------------------------------
  explode: 0.0, // 0..1 decomposition
  xray: false,
  sectionMode: 'off', // 'off' | 'longitudinal' | 'crown'
  sectionPosition: 0.42, // 0..1 along the body
  wireframe: false,
});

/** Parameter metadata used to auto-build the control panel. */
export const SCHEMA = [
  { group: '壳体架构 / CARAPACE', items: [
    { key: 'segmentCount', label: '驱动体节', en: 'Segments', min: 8, max: 30, step: 1 },
    { key: 'segmentLength', label: '体节长度', en: 'Seg. length', min: 0.6, max: 1.6, step: 0.02 },
    { key: 'bodyRadius', label: '甲壳半径', en: 'Carapace radius', min: 0.35, max: 0.95, step: 0.01 },
    { key: 'bladeCount', label: '磨削刀片', en: 'Crown blades', min: 4, max: 11, step: 1 },
    { key: 'tailBladeCount', label: '尾扇叶片', en: 'Fan blades', min: 3, max: 8, step: 1 },
    { key: 'vaneCount', label: '导流叶', en: 'Deflector vanes', min: 2, max: 6, step: 1 },
  ]},
  { group: '材质 / MATERIALS', items: [
    { key: 'plateColor', label: '甲壳色', en: 'Carapace', type: 'color' },
    { key: 'accentColor', label: '荧光色', en: 'Photophore', type: 'color' },
    { key: 'ventColor', label: '热液色', en: 'Vent', type: 'color' },
    { key: 'metalRoughness', label: '合金粗糙度', en: 'Roughness', min: 0.05, max: 0.9, step: 0.01 },
    { key: 'armorOpacity', label: '外壳不透明', en: 'Shell opacity', min: 0.08, max: 1, step: 0.01 },
    { key: 'accentIntensity', label: '荧光强度', en: 'Luminance', min: 0, max: 6, step: 0.1 },
  ]},
  { group: '节律 / LOCOMOTION', items: [
    { key: 'gaitSpeed', label: '蠕动节律', en: 'Cycle rate', min: 0, max: 2, step: 0.01 },
    { key: 'undulation', label: '蜿蜒幅度', en: 'Undulation', min: 0, max: 2, step: 0.01 },
    { key: 'gaitEnabled', label: '启用节律', en: 'Cycle on', type: 'toggle' },
  ]},
  { group: '环境 / ENVIRONMENT', items: [
    { key: 'theme', label: '主题', en: 'Theme', type: 'select', options: [
      { value: 'abyss', label: '深渊实景 / Abyss' },
      { value: 'sonar', label: '声呐测绘 / Sonar' },
    ]},
    { key: 'exposure', label: '曝光', en: 'Exposure', min: 0.4, max: 2.2, step: 0.01 },
    { key: 'keyAzimuth', label: '探照方位角', en: 'Flood bearing', min: 0, max: 360, step: 1 },
    { key: 'keyElevation', label: '探照高度角', en: 'Flood pitch', min: 4, max: 85, step: 1 },
    { key: 'showTerrain', label: '海底地形', en: 'Seafloor', type: 'toggle' },
    { key: 'showSnow', label: '海雪', en: 'Marine snow', type: 'toggle' },
    { key: 'showGrid', label: '测绘网格', en: 'Survey grid', type: 'toggle' },
    { key: 'showBloom', label: '辉光', en: 'Bloom', type: 'toggle' },
  ]},
  { group: '检视 / INSPECTION', items: [
    { key: 'explode', label: '分解视图', en: 'Explode', min: 0, max: 1, step: 0.01 },
    { key: 'sectionPosition', label: '剖切位置', en: 'Section', min: 0, max: 1, step: 0.01 },
    { key: 'xray', label: 'X 光透视', en: 'X-ray', type: 'toggle' },
    { key: 'showAnnotations', label: '部件标注', en: 'Callouts', type: 'toggle' },
    { key: 'wireframe', label: '线框', en: 'Wireframe', type: 'toggle' },
  ]},
];

/** Mutable runtime state. */
export function createState() {
  return { ...DEFAULTS };
}
