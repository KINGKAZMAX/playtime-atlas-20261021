/**
 * 榫卯连接 / Mortise & Tenon Joints
 *
 * 四种经典榫卯并置：燕尾榫、透榫、半榫、馒头榫。
 * 全部由二维轮廓（THREE.Shape + holes）挤出而成，因此卯口与榫头尺寸严格吻合。
 *
 * 术语来源：科普中国《榫卯结构》；中国传统文化促进会《榫卯(十) 穿斗式与抬梁式的大木构架区别》。
 */
import * as THREE from 'three';

/** 把二维轮廓沿 Z 挤出并居中。 */
function extrude(shape, depth, mat) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function rectShape(x0, y0, x1, y1) {
  const s = new THREE.Shape();
  s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath();
  return s;
}

function trapezoidPoints(cx, z0, z1, halfW0, halfW1) {
  return [
    new THREE.Vector2(cx - halfW0, z0),
    new THREE.Vector2(cx + halfW0, z0),
    new THREE.Vector2(cx + halfW1, z1),
    new THREE.Vector2(cx - halfW1, z1),
  ];
}

export default {
  id: 'mortise',
  title: { zh: '榫卯连接', en: 'Mortise & Tenon Joints' },
  pinyin: 'sun mao lian jie',
  subtitle: {
    zh: '燕尾榫 · 透榫 · 半榫 · 馒头榫 · 不用一根钉子',
    en: 'Dovetail · Through tenon · Half lap · Round tenon — no nails at all',
  },
  summary: {
    zh: '榫是凸出的榫头，卯是凹进的卯眼，两者咬合即为榫卯。中国古建筑不用铁钉把构件连成一体，而是让构件之间彼此"长在一起"：榫卯既限制构件在各方向上的转动，又保留微量变形，使整座木构在地震中可以晃动而少受破坏。',
    en: 'A tenon is the protruding tongue, a mortise the receiving socket; locked together they form a joint. Chinese timber buildings were assembled without iron nails — the pieces grow into one another. The joint restrains movement in every direction yet still allows slight flex, so a timber frame can sway in an earthquake instead of shattering.',
  },
  loadPath: {
    zh: '荷载 → 榫肩（承压面）→ 卯眼侧壁（抗剪、抗拔）→ 相邻构件',
    en: 'Load → tenon shoulder (bearing) → mortise walls (shear and withdrawal) → adjoining member',
  },
  era: {
    zh: '新石器时代已出现，宋代《营造法式》定型',
    en: 'Present since the Neolithic; codified in the Song Yingzao Fashi',
  },
  region: {
    zh: '中国木构建筑与明式家具',
    en: 'Chinese timber architecture and Ming-style furniture',
  },
  scaleNote: {
    zh: '教学示意，非施工/工程模型；卯口为便于观察作通直处理，与实物榫头的细微斜度有别。',
    en: 'Teaching diagram — not a construction or engineering model; mortises are drawn straight-through for legibility rather than with the subtle draft of a real tenon.',
  },
  // 史实参照：条目出处为 17-architecture-research/catalog.json
  catalogRefs: [
    { id: 'c02-foguang-east-hall', name: { zh: '佛光寺东大殿', en: 'East Hall, Foguang Temple' }, source: '17-architecture-research/catalog.json · c02-foguang-east-hall' },
    { id: 'c25-hemudu-site', name: { zh: '河姆渡遗址', en: 'Hemudu Site' }, source: '17-architecture-research/catalog.json · c25-hemudu-site' },
    { id: 'c40-feiyun-pavilion', name: { zh: '飞云楼', en: 'Feiyun Pavilion' }, source: '17-architecture-research/catalog.json · c40-feiyun-pavilion' },
  ],
  camera: { position: [0.2, 3.6, 5.6], target: [0, 0.55, 0] },

  layers: [
    { id: 'tenon', label: { zh: '榫（凸）', en: 'Tenon (male)' }, hint: { zh: '主动插入卯眼的凸出部分', en: 'The protruding tongue that enters the socket' } },
    { id: 'mortise', label: { zh: '卯（凹）', en: 'Mortise (female)' }, hint: { zh: '承接榫头的凹槽', en: 'The socket that receives it' } },
    { id: 'member', label: { zh: '构件本体', en: 'Members' } },
    { id: 'base', label: { zh: '底座', en: 'Base' } },
  ],

  build(materials) {
    const group = new THREE.Group();
    const parts = [];
    const forces = [];
    const M = materials;

    const add = (object, part) => {
      object.traverse((c) => { c.userData.partId = part.id; });
      group.add(object);
      parts.push(part);
      return object;
    };

    /* ---------------------------------------------------------- 底座 */
    const base = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.10, 2.0), M.stone);
    base.position.set(0, -0.05, 0);
    base.receiveShadow = true;
    add(base, {
      id: 'base',
      name: { zh: '底座', en: 'Base Slab' },
      pinyin: 'di zuo',
      role: { zh: '承托四组样例的展示底板，本身不参与受力。', en: 'A display slab carrying the four samples; it carries no structural load.' },
      layer: 'base', family: 'stone', object: base,
      explode: new THREE.Vector3(0, -1, 0), order: 0,
    });

    /* ============================ 1. 燕尾榫 ============================== */
    // 竖板（带燕尾榫头）：薄于 Z，榫头在平面上呈梯形，外宽内窄。
    const dgx = -2.7;
    const dgz = 0;
    const tenonHalf0 = 0.24;   // 榫头根部半宽（X）
    const tenonHalf1 = 0.40;   // 榫头端部半宽（X）
    const tenonHalfZ = 0.08;   // 榫头厚度（Z）的一半

    const dovetailBoard = new THREE.Group();
    // 竖板本体
    const dbBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 0.62, 0.16), M.timber,
    );
    dbBody.position.set(dgx, 0.31, dgz);
    dbBody.castShadow = dbBody.receiveShadow = true;
    dovetailBoard.add(dbBody);
    // 榫头：沿 Y 挤出的梯形棱柱
    const dbShape = new THREE.Shape(trapezoidPoints(0, -tenonHalfZ, tenonHalfZ, tenonHalf0, tenonHalf1));
    const dbTenon = extrude(dbShape, 0.30, M.timberLight);
    dbTenon.rotation.x = -Math.PI / 2;  // 把挤出方向转到 Y
    dbTenon.position.set(dgx, 0.16, dgz);
    dovetailBoard.add(dbTenon);

    add(dovetailBoard, {
      id: 'dovetail-board',
      name: { zh: '燕尾榫 · 竖板', en: 'Dovetail — Upright Board' },
      pinyin: 'yan wei sun shu ban',
      role: { zh: '竖板下端做梯形榫头，榫头在平面上外宽内窄，插入横板后无法沿榫宽方向被拉开。', en: 'Its lower end is cut into a trapezoidal tongue that widens in plan, so once it enters the socket the two members cannot be pulled apart across the grain.' },
      layer: 'tenon', family: 'wood', object: dovetailBoard,
      explode: new THREE.Vector3(0, 1, 0), order: 2,
    });

    // 横板（带燕尾卯）：薄于 Y，卯口为贯通榫头的梯形孔
    const dmShape = rectShape(-0.62, -0.50, 0.62, 0.50);
    const hole = new THREE.Path(trapezoidPoints(0, -tenonHalfZ, tenonHalfZ, tenonHalf0, tenonHalf1));
    dmShape.holes.push(hole);
    const dovetailMortise = extrude(dmShape, 0.16, M.timberLight);
    dovetailMortise.rotation.x = -Math.PI / 2;   // 轮廓平面变为 XZ，挤出方向变为 Y
    dovetailMortise.position.set(dgx, 0.62 + 0.08, dgz);
    add(dovetailMortise, {
      id: 'dovetail-mortise',
      name: { zh: '燕尾卯 · 横板', en: 'Dovetail Socket — Cross Board' },
      pinyin: 'yan wei mao heng ban',
      role: { zh: '横板底面凿出梯形卯口，截面与榫头完全一致，插到底后自锁。', en: 'A trapezoidal socket cut into its underside, matching the tongue exactly, which locks as soon as the tongue is pushed home.' },
      layer: 'mortise', family: 'wood', object: dovetailMortise,
      explode: new THREE.Vector3(0, 1, 0), order: 3,
    });

    /* ============================= 2. 透榫 ============================== */
    const tgx = -0.9;
    // 杆：沿 X，薄于 Y（0.18），宽于 Z（0.22），端头带矩形榫头
    const barGroup = new THREE.Group();
    const barShape = rectShape(-0.55, -0.09, 0.55, 0.09);
    const bar = extrude(barShape, 0.22, M.timber);
    bar.position.set(tgx, 0.62, 0);
    barGroup.add(bar);
    const tenonShape = rectShape(0.55, -0.065, 0.86, 0.065);
    const throughTenon = extrude(tenonShape, 0.13, M.timberLight);
    throughTenon.position.set(tgx, 0.62, 0);
    barGroup.add(throughTenon);
    add(barGroup, {
      id: 'through-tenon',
      name: { zh: '透榫 · 榫头杆', en: 'Through Tenon — Rail' },
      pinyin: 'tou sun gan',
      role: { zh: '杆端做矩形榫头，贯穿对方构件后露出（露头榫），榫肩压在构件表面传力。', en: 'The rail carries a rectangular tenon that passes clean through the other member and protrudes; the shoulder bears on the surface and transfers load.' },
      layer: 'tenon', family: 'wood', object: barGroup,
      explode: new THREE.Vector3(1, 0.3, 0), order: 2,
    });

    // 立板：薄于 X（0.20），宽于 Z（0.60），上有贯穿 X 向的矩形卯
    const tmShape = rectShape(-0.30, 0.0, 0.30, 0.92);
    const tmHole = new THREE.Path();
    tmHole.moveTo(-0.065, 0.62 - 0.09); tmHole.lineTo(0.065, 0.62 - 0.09);
    tmHole.lineTo(0.065, 0.62 + 0.09); tmHole.lineTo(-0.065, 0.62 + 0.09); tmHole.closePath();
    tmShape.holes.push(tmHole);
    const throughMortise = extrude(tmShape, 0.20, M.timberLight);
    throughMortise.rotation.y = Math.PI / 2;   // 轮廓平面变为 YZ，挤出方向变为 X
    throughMortise.position.set(tgx, 0, 0);
    add(throughMortise, {
      id: 'through-mortise',
      name: { zh: '透榫 · 立板', en: 'Through Tenon — Post' },
      pinyin: 'tou sun li ban',
      role: { zh: '立板上开矩形通卯，榫头穿过并在外侧露头，形成可锁紧又可拆的连接。', en: 'A rectangular through-mortise in the post; the tenon passes and protrudes, giving a joint that locks yet can still be taken apart.' },
      layer: 'mortise', family: 'wood', object: throughMortise,
      explode: new THREE.Vector3(-1, 0.3, 0), order: 3,
    });

    /* ============================= 3. 半榫 ============================== */
    const hgx = 0.9;
    // 甲杆：沿 X，端头上半被挖去一半
    const aShape = new THREE.Shape();
    aShape.moveTo(-0.62, 0.0);
    aShape.lineTo(0.22, 0.0);
    aShape.lineTo(0.22, 0.09);      // 台阶：半榫的槽
    aShape.lineTo(0.62, 0.09);
    aShape.lineTo(0.62, 0.18);
    aShape.lineTo(-0.62, 0.18);
    aShape.closePath();
    const halfA = extrude(aShape, 0.26, M.timber);
    halfA.position.set(hgx, 0.0, 0);
    add(halfA, {
      id: 'half-lap-a',
      name: { zh: '半榫 · 甲杆', en: 'Half Lap — Member A' },
      pinyin: 'ban sun jia gan',
      role: { zh: '甲杆端部挖去上半，两根杆因此能互相咬合而不重叠占位。', en: 'Member A has its upper half cut away at the end, so two members can interlock without fighting for the same space.' },
      layer: 'member', family: 'wood', object: halfA,
      explode: new THREE.Vector3(0, -1, 0.6), order: 2,
    });

    // 乙杆：沿 Z，端头下半被挖去一半，扣在甲杆上
    const bShape = new THREE.Shape();
    bShape.moveTo(-0.52, 0.09);
    bShape.lineTo(0.52, 0.09);
    bShape.lineTo(0.52, 0.18);
    bShape.lineTo(0.18, 0.18);
    bShape.lineTo(0.18, 0.27);      // 台阶
    bShape.lineTo(-0.52, 0.27);
    bShape.closePath();
    const halfB = extrude(bShape, 0.26, M.timberLight);
    halfB.rotation.y = Math.PI / 2;  // 轮廓平面变为 ZY，挤出方向变为 X
    halfB.position.set(hgx + 0.35, 0, 0);
    add(halfB, {
      id: 'half-lap-b',
      name: { zh: '半榫 · 乙杆', en: 'Half Lap — Member B' },
      pinyin: 'ban sun yi gan',
      role: { zh: '乙杆下半被挖去，骑在甲杆的槽上，两杆在厚度方向各占一半。', en: 'Member B has its lower half removed and rides in the groove, so each member occupies half the combined thickness.' },
      layer: 'member', family: 'wood', object: halfB,
      explode: new THREE.Vector3(0, 1, 0.6), order: 3,
    });

    /* ============================ 4. 馒头榫 ============================= */
    const mgx = 2.7;
    // 柱：方柱 + 顶端圆形馒头榫
    const colGroup = new THREE.Group();
    const colBody = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.62, 0.28), M.timber);
    colBody.position.set(mgx, 0.31, 0);
    colBody.castShadow = colBody.receiveShadow = true;
    colGroup.add(colBody);
    const mantou = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.17, 20), M.timberLight);
    mantou.position.set(mgx, 0.705, 0);
    mantou.castShadow = true;
    colGroup.add(mantou);
    add(colGroup, {
      id: 'mantou-column',
      name: { zh: '馒头榫 · 柱', en: 'Round Tenon — Column' },
      pinyin: 'man tou sun zhu',
      role: { zh: '柱头削成圆馒头形的榫头（榫头 + 榫肩），插入梁底的圆孔海眼中。', en: 'The column head is rounded into a bun-shaped tenon with a shoulder, which drops into a round socket called a haiyuan in the beam.' },
      layer: 'tenon', family: 'wood', object: colGroup,
      explode: new THREE.Vector3(0, -1, 0), order: 1,
    });

    // 梁：下段带圆孔（海眼），上段实心；梁底另留方形卯口示意榫肩落位
    const beamGroup = new THREE.Group();
    const lowerShape = rectShape(-0.62, -0.17, 0.62, 0.17);
    const haiHole = new THREE.Path();
    haiHole.absarc(0, 0, 0.105, 0, Math.PI * 2, false);
    lowerShape.holes.push(haiHole);
    const lower = extrude(lowerShape, 0.16, M.timberLight);
    lower.rotation.x = -Math.PI / 2;
    lower.position.set(mgx, 0.62 + 0.08, 0);
    beamGroup.add(lower);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.18, 0.34), M.timberLight);
    upper.position.set(mgx, 0.62 + 0.16 + 0.09, 0);
    upper.castShadow = upper.receiveShadow = true;
    beamGroup.add(upper);
    add(beamGroup, {
      id: 'mantou-beam',
      name: { zh: '馒头榫 · 梁', en: 'Round Tenon — Beam' },
      pinyin: 'man tou sun liang',
      role: { zh: '梁底凿出圆孔海眼安放馒头榫，柱肩（榫肩）承压传力，接触面平整不撬动。', en: 'A round haiyuan in the beam underside receives the tenon while the column shoulder bears down; the flat bearing face avoids prying.' },
      layer: 'mortise', family: 'wood', object: beamGroup,
      explode: new THREE.Vector3(0, 1, 0), order: 2,
    });

    /* ------------------------------------------------------------ 受力箭头 */
    forces.push(
      {
        id: 'dovetail-lock',
        from: [dgx + 0.30, 0.60, 0], to: [dgx + 0.58, 0.60, 0],
        label: { zh: '燕尾榫的梯形斜面阻止榫宽方向被拉开', en: 'The tapered flanks stop the members pulling apart across the tongue' },
        kind: 'tension',
      },
      {
        id: 'through-bear',
        from: [tgx + 0.40, 0.80, 0], to: [tgx + 0.40, 0.62, 0],
        label: { zh: '榫肩压在立板表面传递压力', en: 'The tenon shoulder bears down on the post face' },
        kind: 'load',
      },
      {
        id: 'lap-shear',
        from: [hgx + 0.10, 0.22, 0.30], to: [hgx + 0.10, 0.06, 0.30],
        label: { zh: '半榫接触面互相剪切传力', en: 'The lap faces transfer load in shear' },
        kind: 'load',
      },
      {
        id: 'mantou-seat',
        from: [mgx, 0.92, 0], to: [mgx, 0.64, 0],
        label: { zh: '榫肩落座传力，圆榫只负责定位与抗拔', en: 'The shoulder carries the load; the round tenon locates the beam and resists withdrawal' },
        kind: 'load',
      },
      {
        id: 'mantou-pull',
        from: [mgx + 0.40, 0.70, 0], to: [mgx + 0.12, 0.70, 0],
        label: { zh: '圆孔壁限制梁的横向移动', en: 'The socket wall restrains sideways movement of the beam' },
        kind: 'tension',
      },
    );

    return { group, parts, forces };
  },
};
