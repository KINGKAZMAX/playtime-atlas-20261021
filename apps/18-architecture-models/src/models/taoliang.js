/**
 * taoliang.js — 抬梁式木架 / Post-and-Beam (raising-beam) timber frame
 *
 * 构造逻辑：立柱承梁，梁上承檩（柱 → 梁 → 瓜柱 → 更小的梁 → 脊瓜柱 → 檩）。
 * 本文件只示一榀排架（frame bay）：
 *   台基 → 柱础 → 檐柱/金柱 → 阑额 → 大梁 → 瓜柱 → 二梁 → 瓜柱 → 三架梁
 *   → 脊瓜柱 → 叉手 → 檐檩/金檩/上金檩/脊檩 → 椽子 → 屋面（望板）
 * 檩高自檐向脊逐级抬起，即"举架"；屋面荷载经椽传檩、檩传梁架、梁架传柱、柱传台基。
 *
 * 坐标约定：X = 面阔方向（檩、椽沿此向），Z = 进深方向（排架沿此向），Y = 上。
 * 所有几何均由程序化生成，无外部资源。
 */
import * as THREE from 'three';
import { pillar, beam, purlin, roofPanel, mergeMeshes } from '../core/geo.js';

/* --------------------------------------------------------------- 局部小工具 */

/** 方木梁，长轴沿 Z（排架的进深方向）。 */
function beamZ({ length, w, h, mat }) {
  const m = beam({ length, w, h, mat });
  m.rotation.y = Math.PI / 2;
  return m;
}

/** 方料小构件（瓜柱、檩托、脊座等），几何中心在原点。 */
function block({ w, h, d, mat }) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 两点之间的斜木杆（叉手），断面 w×h，长轴自动对齐 p0→p1。 */
function strut(p0, p1, w, h, mat) {
  const a = new THREE.Vector3(p0[0], p0[1], p0[2]);
  const b = new THREE.Vector3(p1[0], p1[1], p1[2]);
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, w), mat);
  m.castShadow = m.receiveShadow = true;
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.clone().normalize());
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
  id: 'taoliang',
  title: { zh: '抬梁木架', en: 'Post-and-Beam Frame' },
  pinyin: 'tai liang mu jia',
  subtitle: {
    zh: '柱上抬梁，梁上立瓜柱，层层叠起屋架',
    en: 'Beams raised on columns, dwarf posts lifting the frame step by step',
  },
  summary: {
    zh: '抬梁式的逻辑是"立柱承梁、梁上承檩"：柱头立大梁，梁上立瓜柱，瓜柱上再置二梁、三架梁，层层缩短、层层抬高，脊瓜柱托起脊檩。檩上搁椽、椽上铺屋面，荷载自屋面经椽、檩、梁架下传至柱与台基。春秋时期形成，唐宋成熟，多见于北方官式殿宇；柱距可达三至五米，室内开阔，但梁料巨大。',
    en: 'The post-and-beam logic is "columns carry beams, beams carry purlins": a main beam rests on the column heads, dwarf posts stand on it, and successively shorter beams are stacked above until a ridge post lifts the ridge purlin. Rafters lie on the purlins and the roof surface lies on the rafters, so the load runs roof → rafter → purlin → beam frame → column → plinth. The system appeared in the Spring and Autumn period and matured in Tang–Song times, and is common in northern official halls, where wide column spacing opens the interior at the cost of very large timbers.',
  },
  loadPath: {
    zh: '屋面 → 椽 → 檩 → 梁架 → 柱 → 台基',
    en: 'Roof → rafter → purlin → beam frame → column → plinth',
  },
  era: { zh: '春秋形成，唐宋成熟', en: 'Formed in the Spring & Autumn period, mature in Tang–Song' },
  region: { zh: '北方官式建筑与佛寺殿宇', en: 'Northern official architecture and temple halls' },
  scaleNote: {
    zh: '教学示意，非施工/工程模型；仅示一榀排架，比例与构件尺寸已简化。',
    en: 'Teaching diagram — not a construction or engineering model; a single frame bay is shown and proportions are simplified.',
  },
  // 史实参照：条目出处为 17-architecture-research/catalog.json
  catalogRefs: [
    { id: 'c01-nanchan-main-hall', name: { zh: '南禅寺大殿', en: 'Main Hall, Nanchan Temple' }, source: '17-architecture-research/catalog.json · c01-nanchan-main-hall' },
    { id: 'c07-jinci-holy-mother-hall', name: { zh: '晋祠圣母殿', en: 'Hall of the Holy Mother, Jinci' }, source: '17-architecture-research/catalog.json · c07-jinci-holy-mother-hall' },
    { id: 'c23-shaolin-temple', name: { zh: '嵩山少林寺（常住院、塔林）', en: 'Shaolin Temple, Mount Song' }, source: '17-architecture-research/catalog.json · c23-shaolin-temple' },
  ],
  camera: { position: [7.4, 2.9, 2.6], target: [0, 2.55, 0] },
  layers: [
    {
      id: 'column',
      label: { zh: '立柱', en: 'Columns' },
      hint: { zh: '檐柱、金柱与柱础，把梁架的重量传到台基。', en: 'Eave and inner columns with their stone bases carry the frame down to the plinth.' },
    },
    {
      id: 'beam',
      label: { zh: '梁架', en: 'Beams' },
      hint: { zh: '大梁、二梁、三架梁层层叠置，越往上越短。', en: 'Main, second and third beams are stacked upward, each shorter than the one below.' },
    },
    {
      id: 'post',
      label: { zh: '瓜柱', en: 'Dwarf Posts' },
      hint: { zh: '梁上的短柱与叉手，把檩条一步步抬高。', en: 'Short posts and braces on the beams lift the purlins step by step.' },
    },
    {
      id: 'purlin',
      label: { zh: '檩条', en: 'Purlins' },
      hint: { zh: '檐檩、金檩、上金檩、脊檩；越近屋脊越高，这就是"举架"。', en: 'Eave, inner, upper and ridge purlins; they rise toward the ridge, which is the "raising-beam" pitch.' },
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
    const COL_TOP = 2.90;      // 柱头
    const PR = 0.10;           // 檩半径

    const add = (part) => {
      group.add(part.object);
      parts.push(part);
      return part;
    };

    /* 1 台基 —— 两级石台基 */
    {
      const lower = block({ w: 3.8, h: 0.20, d: 5.9, mat: M.stone });
      lower.position.set(0, 0.10, 0);
      const upper = block({ w: 3.5, h: 0.10, d: 5.6, mat: M.stone });
      upper.position.set(0, 0.25, 0);
      const obj = bundle([lower, upper], M.stone);
      add({
        id: 'tai-ji',
        name: { zh: '台基', en: 'Plinth' },
        pinyin: 'tai ji',
        role: { zh: '承托柱础，把整座木构的荷载交给地基。', en: 'Supports the column bases and passes the whole timber frame into the ground.' },
        layer: 'column',
        family: 'stone',
        object: obj,
        explode: new THREE.Vector3(0, -1, 0),
        order: 0,
      });
    }

    /* 2 柱础 —— 四块石础 */
    {
      const stones = [];
      for (const z of [-2.40, -0.95, 0.95, 2.40]) {
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
        role: { zh: '垫在柱脚之下，扩散柱身压力并隔开柱脚与地面湿气。', en: 'Spread the column pressure at the foot and keep the timber off damp ground.' },
        layer: 'column',
        family: 'stone',
        object: bundle(stones, M.stoneDark),
        explode: new THREE.Vector3(-0.7, -1, 0),
        order: 1,
      });
    }

    /* 3 檐柱 —— 两根外檐柱 */
    {
      const cols = [];
      for (const z of [-2.40, 2.40]) {
        const c = pillar({ height: COL_TOP - BASE_TOP, rBottom: 0.17, rTop: 0.145, mat: M.timber });
        c.position.set(0, BASE_TOP, z);
        cols.push(c);
      }
      add({
        id: 'yan-zhu',
        name: { zh: '檐柱', en: 'Eave Columns' },
        pinyin: 'yan zhu',
        role: { zh: '立在建筑前后檐口，托住大梁的梁头。', en: 'Stand at the front and rear eaves and carry the ends of the main beam.' },
        layer: 'column',
        family: 'wood',
        object: bundle(cols, M.timber),
        explode: new THREE.Vector3(0.7, -1, 0),
        order: 2,
      });
    }

    /* 4 金柱 —— 两根内柱 */
    {
      const cols = [];
      for (const z of [-0.95, 0.95]) {
        const c = pillar({ height: COL_TOP - BASE_TOP, rBottom: 0.155, rTop: 0.135, mat: M.timber });
        c.position.set(0, BASE_TOP, z);
        cols.push(c);
      }
      add({
        id: 'jin-zhu',
        name: { zh: '金柱', en: 'Inner Columns' },
        pinyin: 'jin zhu',
        role: { zh: '位于檐柱之内，直接承托大梁并分担屋架重量。', en: 'Stand inside the eave columns, carrying the main beam and part of the roof weight.' },
        layer: 'column',
        family: 'wood',
        object: bundle(cols, M.timber),
        explode: new THREE.Vector3(0, -1, 0.7),
        order: 3,
      });
    }

    /* 5 阑额 —— 柱头处的拉结枋 */
    {
      const ties = [];
      for (const [z0, z1] of [[-2.40, -0.95], [0.95, 2.40]]) {
        const t = beamZ({ length: z1 - z0, w: 0.12, h: 0.18, mat: M.timberDark });
        t.position.set(-0.21, COL_TOP + 0.09, (z0 + z1) / 2);
        ties.push(t);
      }
      add({
        id: 'lan-e',
        name: { zh: '阑额', en: 'Tie Beam' },
        pinyin: 'lan e',
        role: { zh: '在柱头之间作水平拉结，把排架箍成一体、抵抗外张。', en: 'Ties the column heads horizontally so the frame works as one and resists spreading.' },
        layer: 'beam',
        family: 'wood',
        object: bundle(ties, M.timberDark),
        explode: new THREE.Vector3(0, 0, -1),
        order: 4,
      });
    }

    /* 6 大梁 —— 架在柱头上的主承重梁 */
    {
      const obj = beamZ({ length: 5.10, w: 0.26, h: 0.32, mat: M.timber });
      obj.position.set(0, COL_TOP + 0.16, 0);
      add({
        id: 'da-liang',
        name: { zh: '大梁', en: 'Main Beam' },
        pinyin: 'da liang',
        role: { zh: '横跨金柱与檐柱的柱头，是整副梁架的主承重梁，柱头尚可加设斗栱分散节点。', en: 'Spans the column heads as the chief load-carrying beam of the frame; a dougong bracket may be set at the joint.' },
        layer: 'beam',
        family: 'wood',
        object: obj,
        explode: new THREE.Vector3(0, 0, 1),
        order: 5,
      });
    }

    /* 7 下瓜柱 —— 大梁上的短柱 */
    {
      const posts = [];
      for (const z of [-1.40, 1.40]) {
        const p = block({ w: 0.15, h: 0.24, d: 0.15, mat: M.timber });
        p.position.set(0, 3.34, z);
        posts.push(p);
      }
      add({
        id: 'gua-zhu-xia',
        name: { zh: '瓜柱（下）', en: 'Lower Dwarf Posts' },
        pinyin: 'gua zhu xia',
        role: { zh: '短柱立于大梁背上，把二梁抬高一级。', en: 'Short posts stand on the main beam and raise the second beam by one step.' },
        layer: 'post',
        family: 'wood',
        object: bundle(posts, M.timber),
        explode: new THREE.Vector3(0, 1, 0.5),
        order: 6,
      });
    }

    /* 8 二梁 */
    {
      const obj = beamZ({ length: 2.96, w: 0.22, h: 0.20, mat: M.timber });
      obj.position.set(0, 3.56, 0);
      add({
        id: 'er-liang',
        name: { zh: '二梁', en: 'Second Beam' },
        pinyin: 'er liang',
        role: { zh: '架在下瓜柱上，比大梁短一截，继续把屋架往里收。', en: 'Rests on the lower dwarf posts; shorter than the main beam, it draws the frame inward.' },
        layer: 'beam',
        family: 'wood',
        object: obj,
        explode: new THREE.Vector3(0, 0.7, 1),
        order: 7,
      });
    }

    /* 9 上瓜柱 */
    {
      const posts = [];
      for (const z of [-0.70, 0.70]) {
        const p = block({ w: 0.14, h: 0.34, d: 0.14, mat: M.timber });
        p.position.set(0, 3.83, z);
        posts.push(p);
      }
      add({
        id: 'gua-zhu-shang',
        name: { zh: '瓜柱（上）', en: 'Upper Dwarf Posts' },
        pinyin: 'gua zhu shang',
        role: { zh: '立在二梁背上再抬一级，承托三架梁。', en: 'Stand on the second beam, lift the level once more and carry the third beam.' },
        layer: 'post',
        family: 'wood',
        object: bundle(posts, M.timber),
        explode: new THREE.Vector3(0, 1, -0.5),
        order: 8,
      });
    }

    /* 10 三架梁 */
    {
      const obj = beamZ({ length: 1.80, w: 0.20, h: 0.20, mat: M.timber });
      obj.position.set(0, 4.10, 0);
      add({
        id: 'san-jia-liang',
        name: { zh: '三架梁', en: 'Third Beam' },
        pinyin: 'san jia liang',
        role: { zh: '架在上瓜柱上，是梁架最高处的一根横梁。', en: 'Rests on the upper dwarf posts and is the highest cross beam of the frame.' },
        layer: 'beam',
        family: 'wood',
        object: obj,
        explode: new THREE.Vector3(0, 0.7, -1),
        order: 9,
      });
    }

    /* 11 脊瓜柱 */
    {
      const obj = block({ w: 0.16, h: 0.60, d: 0.16, mat: M.timber });
      obj.position.set(0, 4.50, 0);
      add({
        id: 'ji-gua-zhu',
        name: { zh: '脊瓜柱', en: 'Ridge Post' },
        pinyin: 'ji gua zhu',
        role: { zh: '立于三架梁正中，直接托起脊檩。', en: 'Stands at the centre of the third beam and directly carries the ridge purlin.' },
        layer: 'post',
        family: 'wood',
        object: obj,
        explode: new THREE.Vector3(0, 1, -1),
        order: 10,
      });
    }

    /* 12 叉手 —— 斜撑 */
    {
      const braces = [];
      for (const s of [-1, 1]) {
        braces.push(strut([0, 4.00, s * 0.70], [0, 4.60, s * 0.10], 0.10, 0.14, M.timberDark));
      }
      add({
        id: 'cha-shou',
        name: { zh: '叉手', en: 'Hand Braces' },
        pinyin: 'cha shou',
        role: { zh: '自瓜柱顶部斜撑向脊瓜柱，帮助稳定三角形的梁架。', en: 'Lean from the dwarf post heads to the ridge post, stabilising the triangular frame.' },
        layer: 'post',
        family: 'wood',
        object: bundle(braces, M.timberDark),
        explode: new THREE.Vector3(0.6, 1, -0.6),
        order: 11,
      });
    }

    /* 13 檩条 —— 四道檩，越近脊越高（举架） */
    const purlinSpecs = [
      { id: 'yan-lin', name: { zh: '檐檩', en: 'Eave Purlins' }, pinyin: 'yan lin', z: 2.40, y: 3.32, explode: new THREE.Vector3(-1, 0, 0), order: 12, role: { zh: '压在檐部大梁的梁头上，是屋面荷载进入梁架的起点。', en: 'Bear on the beam ends at the eave and are where the roof load first enters the frame.' } },
      { id: 'jin-lin', name: { zh: '金檩', en: 'Inner Purlins' }, pinyin: 'jin lin', z: 1.40, y: 3.76, explode: new THREE.Vector3(-1, 0.5, 0), order: 13, role: { zh: '压在二梁的梁头上，比檐檩高一阶。', en: 'Bear on the ends of the second beam, one step higher than the eave purlins.' } },
      { id: 'shang-jin-lin', name: { zh: '上金檩', en: 'Upper Purlins' }, pinyin: 'shang jin lin', z: 0.70, y: 4.30, explode: new THREE.Vector3(-1, 1, 0), order: 14, role: { zh: '压在三架梁的梁头上，把屋架继续往屋脊方向抬升。', en: 'Bear on the ends of the third beam and lift the roof further toward the ridge.' } },
      { id: 'ji-lin', name: { zh: '脊檩', en: 'Ridge Purlin' }, pinyin: 'ji lin', z: 0, y: 4.90, explode: new THREE.Vector3(-1, 1, 0.6), order: 15, role: { zh: '坐在脊瓜柱上，是屋架最高点并承接两侧屋面的汇集荷载。', en: 'Sit on the ridge post as the highest point of the frame, gathering the load of both roof slopes.' } },
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

    /* 16 椽子 —— 只示一侧的一排椽，以便看清梁架 */
    {
      const rafterPts = [[0, 5.05], [0.70, 4.45], [1.40, 3.91], [2.40, 3.47], [2.85, 3.27]];
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
        order: 16,
      });
    }

    /* 17 屋面 —— 分折的望板，坡度自檐向脊逐级变陡 */
    {
      const pieces = [];
      const segs = [[0, 0.70, 5.10, 4.50], [0.70, 1.40, 4.50, 3.96], [1.40, 2.40, 3.96, 3.52], [2.40, 2.85, 3.52, 3.32]];
      for (const [z0, z1, y0, y1] of segs) {
        pieces.push(roofPiece({ width: 4.8, z0, z1, y0, y1, thick: 0.05, mat: M.tile }));
      }
      for (const [z0, z1, y0, y1] of [[-2.85, -2.40, 3.32, 3.52], [-2.40, -1.40, 3.52, 3.96], [-1.40, -0.70, 3.96, 4.50], [-0.70, 0, 4.50, 5.10]]) {
        pieces.push(roofPiece({ width: 4.8, z0, z1, y0, y1, thick: 0.05, mat: M.tile }));
      }
      const ridge = block({ w: 4.8, h: 0.14, d: 0.20, mat: M.tile });
      ridge.position.set(0, 5.17, 0);
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
        order: 17,
      });
    }

    /* 受力箭头（定性示意，非工程计算） */
    forces.push(
      {
        id: 'load-roof-ridge',
        from: [0.45, 5.70, 0],
        to: [0.45, 5.02, 0],
        label: { zh: '屋面荷载经椽、檩向下传递', en: 'Roof load travels down through the rafters and purlin' },
        kind: 'load',
      },
      {
        id: 'load-purlin-beam',
        from: [0.45, 4.28, 0.70],
        to: [0.45, 3.62, 0.70],
        label: { zh: '檩条把屋面重量交给下面的梁', en: 'The purlin hands its weight to the beam below' },
        kind: 'load',
      },
      {
        id: 'load-beam-column',
        from: [0.45, 3.18, 0.95],
        to: [0.45, 2.38, 0.95],
        label: { zh: '大梁的荷载顺柱下行', en: 'The main beam load runs down the column' },
        kind: 'load',
      },
      {
        id: 'reaction-plinth',
        from: [0.45, 0.02, 0.95],
        to: [0.45, 0.50, 0.95],
        label: { zh: '台基与地基的竖向反力', en: 'Vertical reaction from the plinth and the ground' },
        kind: 'reaction',
      },
      {
        id: 'tension-lan-e',
        from: [-0.55, 2.99, -2.20],
        to: [-0.55, 2.99, -1.10],
        label: { zh: '阑额拉结柱头、抵抗外张', en: 'The tie beam holds the column heads against spreading' },
        kind: 'tension',
      },
      {
        id: 'thrust-cha-shou',
        from: [0.45, 4.58, 0.12],
        to: [0.45, 4.02, 0.68],
        label: { zh: '叉手向脊瓜柱传递斜推力', en: 'The brace delivers an inclined thrust to the ridge post' },
        kind: 'thrust',
      },
    );

    return { group, parts, forces };
  },
};

// 由 QA 脚本静态检查契约一致性
