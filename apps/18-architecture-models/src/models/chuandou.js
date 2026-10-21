/**
 * chuandou.js — 穿斗式木架 / Column-and-Tie timber frame
 *
 * 构造逻辑：柱承檩（每根柱头直承一根檩），穿枋横贯柱身只作拉结、不承竖向荷载。
 * 本文件示一排架：台基 → 柱础 → 立柱（檐柱 / 断柱 / 上金柱 / 脊柱）→ 穿枋
 * → 檩托 → 檐檩 / 金檩 / 上金檩 / 脊檩 → 椽子 → 屋面（望板）。
 * 柱沿进深方向密排、柱高随屋面坡度变化；其中只有奇数柱落地，其余为"断柱"，
 * 柱脚落在穿枋上。工匠先在地上绑好柱与枋再整排竖立，故称"立帖"。
 *
 * 坐标约定：X = 面阔方向（檩、椽沿此向），Z = 进深方向（柱排沿此向），Y = 上。
 * 所有几何均由程序化生成，无外部资源。
 */
import * as THREE from 'three';
import { pillar, beam, purlin, roofPanel, mergeMeshes } from '../core/geo.js';

/* --------------------------------------------------------------- 局部小工具 */

/** 方木枋，长轴沿 Z（柱排的进深方向）。 */
function beamZ({ length, w, h, mat }) {
  const m = beam({ length, w, h, mat });
  m.rotation.y = Math.PI / 2;
  return m;
}

/** 方料小构件（檩托等），几何中心在原点。 */
function block({ w, h, d, mat }) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 两点之间的圆木杆（椽段）。 */
function pole(p0, p1, r, mat) {
  const a = new THREE.Vector3(p0[0], p0[1], p0[2]);
  const b = new THREE.Vector3(p1[0], p1[1], p1[2]);
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat);
  m.castShadow = true;
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return m;
}

/** 补 uv 属性，使屋面板可与方料合并。 */
function ensureUV(geo) {
  if (!geo.getAttribute('uv')) {
    const n = geo.getAttribute('position').count;
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n * 2), 2));
  }
  return geo;
}

/**
 * 屋面斜板：z0→z1 之间的一折屋面。
 * geo.roofPanel 的 y0/y1 为板底、yEave0/yEave1 为板顶（保持 z1 > z0 以保证法线朝外）。
 */
function roofPiece({ width, z0, z1, y0, y1, thick, mat }) {
  const m = roofPanel({ width, z0, z1, y0, y1, yEave0: y0 + thick, yEave1: y1 + thick, thickness: thick, mat });
  ensureUV(m.geometry);
  return m;
}

/** 合并为单一可选中构件，并把几何中心移到构件原点，使爆炸基准落在构件自身。 */
function bundle(meshes, mat) {
  for (const m of meshes) {
    if (m.geometry.index) {
      const g = m.geometry.toNonIndexed();
      m.geometry.dispose();
      m.geometry = g;
    }
  }
  const merged = mergeMeshes(meshes, mat);
  if (!merged) return meshes[0];
  merged.geometry.computeBoundingBox();
  const c = new THREE.Vector3();
  merged.geometry.boundingBox.getCenter(c);
  merged.geometry.translate(-c.x, -c.y, -c.z);
  merged.position.copy(c);
  return merged;
}

/** @type {import('../core/model-api.js').StructureModel} */
export default {
  id: 'chuandou',
  title: { zh: '穿斗木架', en: 'Column-and-Tie Frame' },
  pinyin: 'chuan dou mu jia',
  subtitle: {
    zh: '密柱直承檩条，穿枋横贯拉结',
    en: 'Dense columns carry the purlins; through-ties bind the row',
  },
  summary: {
    zh: '穿斗式的逻辑是"柱承檩"：柱沿进深方向密排，每根柱头直接顶住一根檩条，檩上搁椽、椽上铺屋面。穿枋自柱身横穿而过，只起拉结与稳定作用，并不承担竖向荷载，因此檩的重量完全由柱承担、逐级下传至台基。常有隔柱落地为"断柱"，其余柱脚落在穿枋上。工匠在地上绑好柱与枋再整排竖立，故称"立帖"。汉代已成熟，今多见于川渝、湘赣、闽粤及长江中下游的乡土建筑；构件小、造价低、抗风好，代价是柱子多、内部空间被分割。',
    en: 'The column-and-tie logic is "columns carry purlins": the columns stand closely spaced along the depth of the building and each column head directly carries one purlin, on which the rafters and then the roof surface rest. The through-ties pass horizontally through the columns and do nothing but bind and stabilise the row, so all vertical load goes through the columns down to the plinth. Often only every other column reaches the ground as a "broken column", the rest resting on the ties. Builders assemble the columns and ties flat on the ground and then raise the whole frame, hence the name "standing a bay". The system was mature by the Han dynasty and is still used in vernacular building in Sichuan, Chongqing, Hunan, Jiangxi, Fujian, Guangdong and the middle-lower Yangtze: small members, low cost and good wind resistance, at the price of many columns chopping up the interior.',
  },
  loadPath: {
    zh: '屋面 → 椽 → 檩 → 柱 → 台基',
    en: 'Roof → rafter → purlin → column → plinth',
  },
  era: { zh: '汉代已成熟，至今沿用', en: 'Mature by the Han dynasty, still in use today' },
  region: {
    zh: '南方乡土建筑：川渝、湘赣、闽粤与长江中下游',
    en: 'Southern vernacular: Sichuan–Chongqing, Hunan–Jiangxi, Fujian–Guangdong, middle-lower Yangtze',
  },
  scaleNote: {
    zh: '教学示意，非施工/工程模型；柱距与构件尺寸已简化，仅示一排架。',
    en: 'Teaching diagram — not a construction or engineering model; column spacing and member sizes are simplified, showing a single row of frame.',
  },
  // 史实参照：条目出处为 17-architecture-research/catalog.json
  catalogRefs: [
    { id: 'c15-hongcun-village', name: { zh: '宏村', en: 'Hongcun Village' }, source: '17-architecture-research/catalog.json · c15-hongcun-village' },
    { id: 'c16-xidi-village', name: { zh: '西递', en: 'Xidi Village' }, source: '17-architecture-research/catalog.json · c16-xidi-village' },
    { id: 'c19-pingyao-ancient-city', name: { zh: '平遥古城', en: 'Pingyao Ancient City' }, source: '17-architecture-research/catalog.json · c19-pingyao-ancient-city' },
  ],
  camera: { position: [6.8, 3.1, 5.0], target: [0, 1.9, 0] },
  layers: [
    {
      id: 'column',
      label: { zh: '立柱', en: 'Columns' },
      hint: { zh: '沿进深方向密排的柱子，柱高随屋面坡度变化。', en: 'Closely spaced columns along the depth, their heights following the roof slope.' },
    },
    {
      id: 'tie',
      label: { zh: '穿枋', en: 'Through-Ties' },
      hint: { zh: '横穿柱身的水平枋，只拉结排架、不承竖向荷载。', en: 'Horizontal ties passing through the columns; they bind the frame but carry no vertical load.' },
    },
    {
      id: 'purlin',
      label: { zh: '檩条', en: 'Purlins' },
      hint: { zh: '每根柱头直承一根檩条，檩高自檐向脊逐级抬起。', en: 'One purlin directly on each column head, rising step by step from the eave to the ridge.' },
    },
    {
      id: 'roof',
      label: { zh: '屋面', en: 'Roof' },
      hint: { zh: '椽子与望板，把屋面荷载交给檩条。', en: 'Rafters and roof boarding pass the roof load to the purlins.' },
      defaultVisible: false,
    },
  ],

  build(materials) {
    const group = new THREE.Group();
    const parts = [];
    const forces = [];
    const M = materials;

    /* 关键标高 */
    const PLINTH_TOP = 0.30;   // 台基面
    const BASE_TOP = 0.56;     // 柱础顶
    const PR = 0.10;           // 檩半径
    const TIE_LOW = 0.90;      // 下穿枋中心高
    const TIE_UP = 1.60;       // 上穿枋中心高
    const TIE_HALF = 0.14;     // 穿枋半高

    const add = (part) => {
      group.add(part.object);
      parts.push(part);
      return part;
    };

    /* 1 台基 */
    {
      const lower = block({ w: 3.9, h: 0.20, d: 7.0, mat: M.stone });
      lower.position.set(0, 0.10, 0);
      const upper = block({ w: 3.6, h: 0.10, d: 6.7, mat: M.stone });
      upper.position.set(0, 0.25, 0);
      add({
        id: 'tai-ji',
        name: { zh: '台基', en: 'Plinth' },
        pinyin: 'tai ji',
        role: { zh: '承托柱础，把密排立柱的荷载交给地基。', en: 'Supports the column bases and passes the load of the dense column row into the ground.' },
        layer: 'column',
        family: 'stone',
        object: bundle([lower, upper], M.stone),
        explode: new THREE.Vector3(0, -1, 0),
        order: 0,
      });
    }

    /* 2 柱础 —— 只落在真正到地的五根柱下 */
    {
      const stones = [];
      for (const z of [-3.0, -1.0, 0, 1.0, 3.0]) {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.26, 16), M.stoneDark);
        s.geometry.translate(0, 0.13, 0);
        s.position.set(0, PLINTH_TOP, z);
        s.castShadow = s.receiveShadow = true;
        stones.push(s);
      }
      add({
        id: 'zhu-chu',
        name: { zh: '柱础', en: 'Column Bases' },
        pinyin: 'zhu chu',
        role: { zh: '只垫在真正落地的柱脚之下，断柱没有柱础。', en: 'Sit only under the columns that reach the ground; the broken columns have none.' },
        layer: 'column',
        family: 'stone',
        object: bundle(stones, M.stoneDark),
        explode: new THREE.Vector3(-0.7, -1, 0),
        order: 1,
      });
    }

    /* 3 檐柱 —— 两根落地外柱 */
    {
      const cols = [];
      for (const z of [-3.0, 3.0]) {
        const c = pillar({ height: 2.10 - BASE_TOP, rBottom: 0.165, rTop: 0.14, mat: M.timber });
        c.position.set(0, BASE_TOP, z);
        cols.push(c);
      }
      add({
        id: 'yan-zhu',
        name: { zh: '檐柱', en: 'Eave Columns' },
        pinyin: 'yan zhu',
        role: { zh: '最外侧两根落地柱，柱头直接顶住檐檩。', en: 'The outermost full-length columns; their heads carry the eave purlins directly.' },
        layer: 'column',
        family: 'wood',
        object: bundle(cols, M.timber),
        explode: new THREE.Vector3(0.7, -1, 0),
        order: 2,
      });
    }

    /* 4 断柱 —— 柱脚落在下穿枋上的短柱 */
    {
      const cols = [];
      for (const z of [-2.0, 2.0]) {
        const c = pillar({ height: 2.50 - (TIE_LOW - TIE_HALF), rBottom: 0.155, rTop: 0.135, mat: M.timber });
        c.position.set(0, TIE_LOW - TIE_HALF, z);
        cols.push(c);
      }
      add({
        id: 'duan-zhu',
        name: { zh: '断柱', en: 'Broken Columns' },
        pinyin: 'duan zhu',
        role: { zh: '柱脚不入地而落在穿枋上，与落地柱共同绑成整体。', en: 'Their feet stop short of the ground and rest on the ties, binding the frame together with the full-length columns.' },
        layer: 'column',
        family: 'wood',
        object: bundle(cols, M.timber),
        explode: new THREE.Vector3(0, -1, 0.7),
        order: 3,
      });
    }

    /* 5 上金柱 */
    {
      const cols = [];
      for (const z of [-1.0, 1.0]) {
        const c = pillar({ height: 3.00 - BASE_TOP, rBottom: 0.16, rTop: 0.135, mat: M.timber });
        c.position.set(0, BASE_TOP, z);
        cols.push(c);
      }
      add({
        id: 'shang-jin-zhu',
        name: { zh: '上金柱', en: 'Upper Inner Columns' },
        pinyin: 'shang jin zhu',
        role: { zh: '落地柱中较高的一对，柱头托住上金檩。', en: 'The taller pair of full-length columns, their heads carrying the upper inner purlins.' },
        layer: 'column',
        family: 'wood',
        object: bundle(cols, M.timber),
        explode: new THREE.Vector3(0.5, -1, -0.5),
        order: 4,
      });
    }

    /* 6 脊柱 —— 中柱 */
    {
      const c = pillar({ height: 3.60 - BASE_TOP, rBottom: 0.165, rTop: 0.14, mat: M.timber });
      c.position.set(0, BASE_TOP, 0);
      add({
        id: 'ji-zhu',
        name: { zh: '脊柱', en: 'Ridge Column' },
        pinyin: 'ji zhu',
        role: { zh: '立在排架正中、柱身最高的一根，直接顶住脊檩。', en: 'The tallest column at the centre of the row, carrying the ridge purlin directly.' },
        layer: 'column',
        family: 'wood',
        object: c,
        explode: new THREE.Vector3(-0.5, -1, -0.5),
        order: 5,
      });
    }

    /* 7 下穿枋 —— 横贯全部柱身 */
    {
      const obj = beamZ({ length: 6.6, w: 0.14, h: 0.28, mat: M.timberDark });
      obj.position.set(0, TIE_LOW, 0);
      add({
        id: 'chuan-fang-xia',
        name: { zh: '下穿枋', en: 'Lower Through-Tie' },
        pinyin: 'chuan fang xia',
        role: { zh: '自柱身横穿而过，把一排柱箍成整体，本身并不承担竖向荷载。', en: 'Passes straight through the columns and binds the row into one, carrying no vertical load itself.' },
        layer: 'tie',
        family: 'wood',
        object: obj,
        explode: new THREE.Vector3(0, 0, -1),
        order: 6,
      });
    }

    /* 8 上穿枋 */
    {
      const obj = beamZ({ length: 6.6, w: 0.13, h: 0.24, mat: M.timberDark });
      obj.position.set(0, TIE_UP, 0);
      add({
        id: 'chuan-fang-shang',
        name: { zh: '上穿枋', en: 'Upper Through-Tie' },
        pinyin: 'chuan fang shang',
        role: { zh: '与下穿枋共同拉结柱排，是排架抗侧、抗风的关键水平联系。', en: 'Together with the lower tie it binds the row, the key horizontal link against sideways wind.' },
        layer: 'tie',
        family: 'wood',
        object: obj,
        explode: new THREE.Vector3(0, 0.5, -1),
        order: 7,
      });
    }

    /* 9 檩托 —— 柱头上的小垫块 */
    {
      const seats = [];
      const colTop = { '-3': 2.10, '-2': 2.50, '-1': 3.00, '0': 3.60, '1': 3.00, '2': 2.50, '3': 2.10 };
      for (const key of Object.keys(colTop)) {
        const z = Number(key);
        const b = block({ w: 0.26, h: 0.10, d: 0.24, mat: M.timberDark });
        b.position.set(0, colTop[key] + 0.05, z);
        seats.push(b);
      }
      add({
        id: 'lin-tuo',
        name: { zh: '檩托', en: 'Purlin Seats' },
        pinyin: 'lin tuo',
        role: { zh: '垫在柱头与檩条之间，把檩的集中荷载摊到柱头。', en: 'Pad between column head and purlin, spreading the concentrated purlin load over the column.' },
        layer: 'purlin',
        family: 'wood',
        object: bundle(seats, M.timberDark),
        explode: new THREE.Vector3(0, 0.4, 0.6),
        order: 8,
      });
    }

    /* 10 檩条 —— 每根柱头一根檩 */
    const purlinSpecs = [
      { id: 'yan-lin', name: { zh: '檐檩', en: 'Eave Purlins' }, pinyin: 'yan lin', z: 3.0, y: 2.30, explode: new THREE.Vector3(-1, 0, 0), order: 9, role: { zh: '压在檐柱头上，是屋面荷载进入柱排的起点。', en: 'Bear on the eave column heads and are where the roof load first enters the column row.' } },
      { id: 'jin-lin', name: { zh: '金檩', en: 'Inner Purlins' }, pinyin: 'jin lin', z: 2.0, y: 2.70, explode: new THREE.Vector3(-1, 0.4, 0), order: 10, role: { zh: '压在断柱柱头上，由断柱直接顶住。', en: 'Bear on the heads of the broken columns, which carry them directly.' } },
      { id: 'shang-jin-lin', name: { zh: '上金檩', en: 'Upper Purlins' }, pinyin: 'shang jin lin', z: 1.0, y: 3.20, explode: new THREE.Vector3(-1, 0.8, 0), order: 11, role: { zh: '压在上金柱头上，比金檩再高一阶。', en: 'Bear on the upper inner column heads, one step above the inner purlins.' } },
      { id: 'ji-lin', name: { zh: '脊檩', en: 'Ridge Purlin' }, pinyin: 'ji lin', z: 0, y: 3.80, explode: new THREE.Vector3(-1, 1, 0.6), order: 12, role: { zh: '压在脊柱顶上，承接两面屋面汇集下来的荷载。', en: 'Sit on the ridge column and gather the load collected from both roof slopes.' } },
    ];
    for (const spec of purlinSpecs) {
      const ps = [];
      const zs = spec.z === 0 ? [0] : [-spec.z, spec.z];
      for (const z of zs) {
        const p = purlin({ length: 4.8, r: PR, round: true, mat: M.timberLight });
        p.position.set(0, spec.y, z);
        ps.push(p);
      }
      add({
        id: spec.id,
        name: spec.name,
        pinyin: spec.pinyin,
        role: spec.role,
        layer: 'purlin',
        family: 'wood',
        object: bundle(ps, M.timberLight),
        explode: spec.explode,
        order: spec.order,
      });
    }

    /* 13 椽子 —— 只示一侧的一排椽 */
    {
      const rafterPts = [[0, 3.95], [1.0, 3.35], [2.0, 2.85], [3.0, 2.45], [3.45, 2.27]];
      const ps = [];
      for (const x of [-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8]) {
        for (let i = 0; i < rafterPts.length - 1; i++) {
          const [z0, y0] = rafterPts[i];
          const [z1, y1] = rafterPts[i + 1];
          ps.push(pole([x, y0, z0], [x, y1, z1], 0.05, M.timberDark));
        }
      }
      add({
        id: 'chuan-zi',
        name: { zh: '椽子', en: 'Rafters' },
        pinyin: 'chuan zi',
        role: { zh: '横搁在檩上、顺着屋面坡度排布，把屋面重量交给檩条。', en: 'Lie across the purlins along the roof slope and hand the roof weight over to them.' },
        layer: 'roof',
        family: 'wood',
        object: bundle(ps, M.timberDark),
        explode: new THREE.Vector3(0, 0.6, -1),
        order: 13,
      });
    }

    /* 14 屋面 —— 分折的望板 */
    {
      const pieces = [];
      const segs = [[0, 1.0, 4.00, 3.40], [1.0, 2.0, 3.40, 2.90], [2.0, 3.0, 2.90, 2.50], [3.0, 3.45, 2.50, 2.32]];
      for (const [z0, z1, y0, y1] of segs) {
        pieces.push(roofPiece({ width: 4.8, z0, z1, y0, y1, thick: 0.05, mat: M.tile }));
      }
      for (const [z0, z1, y0, y1] of [[-3.45, -3.0, 2.32, 2.50], [-3.0, -2.0, 2.50, 2.90], [-2.0, -1.0, 2.90, 3.40], [-1.0, 0, 3.40, 4.00]]) {
        pieces.push(roofPiece({ width: 4.8, z0, z1, y0, y1, thick: 0.05, mat: M.tile }));
      }
      const ridge = block({ w: 4.8, h: 0.14, d: 0.20, mat: M.tile });
      ridge.position.set(0, 4.07, 0);
      pieces.push(ridge);
      add({
        id: 'wu-mian',
        name: { zh: '屋面（望板）', en: 'Roof Surface' },
        pinyin: 'wu mian',
        role: { zh: '铺在椽上的屋面，把自重与积雪荷载集中传给椽。', en: 'The boarded roof surface collects its own weight and any snow and passes it to the rafters.' },
        layer: 'roof',
        family: 'tile',
        object: bundle(pieces, M.tile),
        explode: new THREE.Vector3(0, 1, 0.5),
        order: 14,
      });
    }

    /* 受力箭头（定性示意，非工程计算） */
    forces.push(
      {
        id: 'load-roof-ridge',
        from: [0.45, 4.50, 0],
        to: [0.45, 3.85, 0],
        label: { zh: '屋面荷载经椽、檩向下传递', en: 'Roof load travels down through the rafters and purlin' },
        kind: 'load',
      },
      {
        id: 'load-purlin-column',
        from: [0.45, 2.44, 3.00],
        to: [0.45, 2.12, 3.00],
        label: { zh: '檩条把屋面重量直接交给柱头', en: 'The purlin hands its weight straight to the column head' },
        kind: 'load',
      },
      {
        id: 'tension-tie-lower',
        from: [0.25, TIE_LOW, -3.30],
        to: [0.25, TIE_LOW, -2.20],
        label: { zh: '下穿枋受拉，拉结柱排不外张', en: 'The lower tie is in tension, holding the column row together' },
        kind: 'tension',
      },
      {
        id: 'tension-tie-upper',
        from: [0.25, TIE_UP, 2.20],
        to: [0.25, TIE_UP, 3.30],
        label: { zh: '上穿枋受拉，抵抗柱排侧向变形', en: 'The upper tie is in tension, resisting sideways distortion of the row' },
        kind: 'tension',
      },
      {
        id: 'thrust-lateral',
        from: [0.45, 2.10, -0.60],
        to: [0.45, 2.10, -1.80],
        label: { zh: '风与地震的水平推力，由穿枋拉结抵抗', en: 'Wind and seismic push, resisted by the tying of the through-ties' },
        kind: 'thrust',
      },
      {
        id: 'reaction-base',
        from: [0.45, 0.02, 3.00],
        to: [0.45, 0.48, 3.00],
        label: { zh: '台基与地基的竖向反力', en: 'Vertical reaction from the plinth and the ground' },
        kind: 'reaction',
      },
    );

    return { group, parts, forces };
  },
};

// 由 QA 脚本静态检查契约一致性
