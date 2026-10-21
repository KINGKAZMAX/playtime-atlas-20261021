/**
 * Editorial content for the CHROMA S1 page.
 * All copy, product naming and specifications are original to this work.
 */

export type TextureKind =
  | 'grain'
  | 'bands'
  | 'speckle'
  | 'crackle'
  | 'brushed'
  | 'fiber'
  | 'gradient'
  | 'dots';

export interface Sample {
  id: string;
  name: string;
  latin: string;
  hex: string;
  category: string;
  kind: TextureKind;
  seed: number;
}

export const SAMPLES: Sample[] = [
  { id: 'lava', name: '熔岩橙', latin: 'Lava Orange', hex: '#C4601F', category: 'MINERAL', kind: 'crackle', seed: 11 },
  { id: 'dune', name: '沙丘', latin: 'Dune Sand', hex: '#D6BC8B', category: 'ORGANIC', kind: 'bands', seed: 23 },
  { id: 'asphalt', name: '沥青', latin: 'Wet Asphalt', hex: '#3A3C3E', category: 'CONCRETE', kind: 'grain', seed: 37 },
  { id: 'verdigris', name: '铜绿', latin: 'Verdigris', hex: '#4E8C7A', category: 'OXIDE', kind: 'speckle', seed: 41 },
  { id: 'titanium', name: '钛白', latin: 'Titanium White', hex: '#EFEDE6', category: 'PIGMENT', kind: 'grain', seed: 53 },
  { id: 'deepsea', name: '深海蓝', latin: 'Deep Sea', hex: '#1E3A5F', category: 'MINERAL', kind: 'gradient', seed: 67 },
  { id: 'moss', name: '苔绿', latin: 'Moss Green', hex: '#6A7B3F', category: 'ORGANIC', kind: 'fiber', seed: 71 },
  { id: 'sakura', name: '樱粉', latin: 'Sakura Pink', hex: '#E4A3AE', category: 'PIGMENT', kind: 'dots', seed: 83 },
  { id: 'graphite', name: '石墨', latin: 'Graphite', hex: '#23262B', category: 'MINERAL', kind: 'brushed', seed: 97 },
  { id: 'sulfur', name: '硫黄', latin: 'Sulfur Yellow', hex: '#DFC044', category: 'PIGMENT', kind: 'speckle', seed: 103 },
  { id: 'spruce', name: '云杉', latin: 'Spruce Green', hex: '#3B4A39', category: 'ORGANIC', kind: 'fiber', seed: 113 },
  { id: 'amethyst', name: '紫晶', latin: 'Amethyst', hex: '#6E4C8C', category: 'MINERAL', kind: 'gradient', seed: 127 },
];

export interface SpecRow {
  key: string;
  value: string;
  detail: string;
}

export const SPECS: SpecRow[] = [
  {
    key: '光谱范围',
    value: '380 – 780 nm',
    detail:
      '覆盖人眼可见光全域，短波端吃到 380 nm，长波端到 780 nm。测量单色光时不会因为超出量程而把颜色算偏。',
  },
  {
    key: '光谱分辨率',
    value: '1 nm',
    detail:
      '衍射光栅的分辨能力按 1 nm 切分。换算成 sRGB 时一个通道大约落在 60–80 个采样点上，足够还原窄带荧光。',
  },
  {
    key: '色差 ΔE00',
    value: '< 0.8',
    detail:
      '与实验室级分光光度计的读数偏差，按 CIEDE2000 计算。这是「可写进验收单」与「只能看个大概」之间的分界线。',
  },
  {
    key: '采样口径',
    value: '4 × 4 mm',
    detail:
      '内置柔光罩，贴上就能测，不挑角度。面光源和曲面各测一次，系统会自动做角度补偿。',
  },
  {
    key: '机身重量',
    value: '18 g',
    detail:
      '含电池。铝合金一体机身，挂在钥匙扣上不会坠手。',
  },
  {
    key: '防护等级',
    value: 'IP54',
    detail:
      '防尘并防短时喷水。户外取色、印厂车间、漆房现场都可以直接用。',
  },
  {
    key: '电池续航',
    value: '2400 mAh / 8 h',
    detail:
      '按每天 200 次测量估算。连续扫描模式会多耗约三成电量，仪表会在低电量时提前提示。',
  },
  {
    key: '连接方式',
    value: 'USB-C / BLE 5.3',
    detail:
      '有线走 USB-C 导出原始 CSV，无线走蓝牙直连手机 App，两种方式都能同步标定记录。',
  },
  {
    key: '工作温度',
    value: '0 – 45 ℃',
    detail:
      '高温环境下会自动延长积分时间以压低噪声，并在读数旁边标注补偿值。',
  },
  {
    key: '免校周期',
    value: '5 年',
    detail:
      '机身侧边三片内置基准色片。定期对着基准拍一次，系统就会重新拟合整条响应曲线。',
  },
];

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: '它测出来的和分光光度计差多少？',
    a: '在标准 D65 光源下与实验室级分光光度计的偏差，按 CIEDE2000 计算平均落在 0.35 以内，最差的一块基准色片在 0.7 左右。真实使用中最大的误差来源其实不是传感器，而是你测的东西本身——布面、绒毛、渐变表面都不是纯色。',
  },
  {
    q: '可以用来测显示屏吗？',
    a: '可以，但要关掉自动亮度并固定在最高亮度档。屏幕的刷新与背光波动会引入噪声，积分时间调到 8 ms 以上更稳。测完之后记得把「白点」设成你要对齐的目标，否则读数只是屏幕自己的坐标。',
  },
  {
    q: '数据能导出成什么格式？',
    a: '原始光谱是 401 行的 CSV，波长、强度、归一化强度各一列；色度数据可导出为 Lab、sRGB HEX 和 CIEDE2000 差值三列。固件更新后还会支持直接导出 Pantone 与 TCX 色号匹配结果。',
  },
  {
    q: '内置基准色片要怎么用？',
    a: '每三个月把机身侧边三片基准依次测一遍，系统会拿这次的响应曲线和出厂曲线做差，给出一组补偿系数。色片不要长期暴晒，也不要用酒精擦，脏了用干燥的镜头布顺着同一方向擦。',
  },
  {
    q: '首批实测大概什么时候能拿到机器？',
    a: '按申请顺序分批发放，第一批 200 台预计在固件公测版之后两周内寄出。实测用户需要每两周回传一次使用记录，我们会据此调整算法，这是我们给首批用户的交换条件。',
  },
  {
    q: '为什么这个页面上的数据是实时算出来的？',
    a: '为了让演示站本身能当成一台真仪器用。曲线是把你的颜色反解成反射光谱，再经 CIE 1931 配色函数积分回 XYZ 与 Lab，ΔE00 也是按标准公式算的——改任何一个滑块，读数都会跟着变。',
  },
];

export interface StripItem {
  label: string;
  value: string;
  accent?: boolean;
}

export const STRIP_ITEMS: StripItem[] = [
  { label: 'SPECTRAL RANGE', value: '380–780 nm' },
  { label: 'RESOLUTION', value: '1 nm' },
  { label: 'ΔE00', value: '< 0.8', accent: true },
  { label: 'APERTURE', value: 'Ø 4 mm' },
  { label: 'TRIGGER', value: '0.4 s' },
  { label: 'WEIGHT', value: '18 g' },
  { label: 'RUNTIME', value: '8 h' },
  { label: 'RATING', value: 'IP54' },
  { label: 'LINK', value: 'BLE 5.3' },
  { label: 'RECALIBRATION', value: '5 yr' },
];

export const DEFAULT_SAMPLE_ID = 'lava';
