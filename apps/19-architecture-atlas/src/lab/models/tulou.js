/**
 * tulou.js — 土楼·院落结构 / Tulou & Courtyard Section
 *
 * 仿福建圆楼（永定/南靖）半剖面：外墙 180° 剖开，露出夯土墙厚度、楼板、木构架、
 * 环形走廊与内环、中心祖堂与轴线上的大门。荷载路径：屋面 → 夯土墙 → 石砌墙基
 * → 地基；环向靠墙体自身受拉把荷载箍住。
 *
 * 全部几何程序化生成（geo.js 工具箱 + 原生 THREE），不引用任何外部资源。
 */
import * as THREE from 'three';
import { rammedEarthWall, mergeMeshes } from '../core/geo.js';

/* ===================================================== 实测尺寸（单位：米） */
const S = 0.25;                   // 缩尺系数：1 模型单位 = 4 m

// 保留 z ≤ 0 的半圈，剖切面落在 z = 0，断面朝向 +Z（观众）
const A0 = -Math.PI;
const A1 = 0;

const R_OUT_B = 30.0;             // 外墙底外径半径（≈ 直径 60 m）
const R_IN = 28.4;                // 外墙内面半径（底层墙厚 1.6 m）
const PLINTH_H = 0.8;             // 石砌墙基高
const ST1 = [0.8, 4.0];           // 一层
const ST2 = [4.0, 7.0];           // 二层
const ST3 = [7.0, 10.0];          // 三层
const ST4 = [10.0, 13.0];         // 四层
const R_INNER_IN = 17.6;          // 内环墙内面
const R_INNER_OUT = 19.0;         // 内环墙外面
const R_INNER_TOP = 8.6;          // 内环墙顶（屋面谷口）
const R_CORRIDOR_IN = 25.6;       // 环形走廊内边
const R_CORRIDOR_OUT = R_IN;      // 环形走廊外边 = 外墙内面
const COL_R = 26.5;               // 走廊木柱中心半径
const COL_N = 24;                 // 半圈木柱数
const LEVELS = [4.0, 7.0, 10.0];  // 二/三/四层楼板标高
const GATE_A = -Math.PI / 2;      // 大门所在方位（轴线正对剖切面另一侧）

/* ===================================================== 几何工具（模型内部） */

/** 外墙外表面半径随高度变化（逐层收分）。 */
function outerR(y) {
  if (y <= ST1[1]) {
    const t = (y - ST1[0]) / (ST1[1] - ST1[0]);
    return 30.0 + (29.7 - 30.0) * t;
  }
  if (y <= ST3[1]) {
    const t = (y - ST2[0]) / (ST3[1] - ST2[0]);
    return 29.7 + (29.35 - 29.7) * t;
  }
  const t = (y - ST4[0]) / (ST4[1] - ST4[0]);
  return 29.35 + (29.1 - 29.35) * t;
}

/** 半环带（z ≤ 0 的一半）：旋转成型 + 剖切面封口。yIn/yOut 为底面标高。 */
function ringBand({ rIn, rOut, yIn, yOut, thickness, mat, segments = 44 }) {
  const grp = new THREE.Group();
  const profile = [
    new THREE.Vector2(rIn, yIn),
    new THREE.Vector2(rOut, yOut),
    new THREE.Vector2(rOut, yOut + thickness),
    new THREE.Vector2(rIn, yIn + thickness),
    new THREE.Vector2(rIn, yIn),
  ];
  const lathe = new THREE.LatheGeometry(profile, segments, Math.PI / 2, Math.PI);
  const m = new THREE.Mesh(lathe, mat);
  m.castShadow = m.receiveShadow = true;
  grp.add(m);
  // z = 0 处的两个断面
  const capA = quadGeom([
    [rIn, yIn, 0], [rOut, yOut, 0], [rOut, yOut + thickness, 0], [rIn, yIn + thickness, 0],
  ]);
  const capB = quadGeom([
    [-rIn, yIn, 0], [-rIn, yIn + thickness, 0], [-rOut, yOut + thickness, 0], [-rOut, yOut, 0],
  ]);
  const ca = new THREE.Mesh(capA, mat);
  const cb = new THREE.Mesh(capB, mat);
  ca.castShadow = cb.castShadow = true;
  ca.receiveShadow = cb.receiveShadow = true;
  grp.add(ca, cb);
  return grp;
}

/** 四点平面（沿 +Z 法向）。 */
function quadGeom(pts) {
  const g = new THREE.BufferGeometry();
  const v = [];
  for (const i of [0, 1, 2, 0, 2, 3]) v.push(pts[i][0], pts[i][1], pts[i][2]);
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

/** 斜屋面板：沿 Z 从 (z0,y0) 落到 (z1,y1)，宽 2*xHalf。 */
function slopeSlab({ xHalf, z0, y0, z1, y1, thickness, mat }) {
  const dz = z1 - z0;
  const dy = y1 - y0;
  const len = Math.hypot(dz, dy);
  const m = new THREE.Mesh(new THREE.BoxGeometry(xHalf * 2, thickness, len), mat);
  m.position.set(0, (y0 + y1) / 2, (z0 + z1) / 2);
  m.rotation.x = -Math.atan2(dy, dz);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 斜屋面板（沿 X 落坡）：从 (x0,y0) 落到 (x1,y1)，进深 2*zHalf。 */
function slopeSlabX({ zHalf, x0, y0, x1, y1, thickness, mat }) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const m = new THREE.Mesh(new THREE.BoxGeometry(len, thickness, zHalf * 2), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
  m.rotation.z = Math.atan2(dy, dx);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 把米制几何统一缩为模型单位（1 单位 = 4 m）。 */
function bake(obj) {
  obj.traverse((c) => { if (c.geometry) c.geometry.scale(S, S, S); });
  const stack = [obj];
  while (stack.length) {
    const o = stack.pop();
    for (const c of o.children) {
      c.position.multiplyScalar(S);
      stack.push(c);
    }
  }
  obj.position.multiplyScalar(S);
  return obj;
}

/* ===================================================== 模型 */
export default {
  id: 'tulou',
  title: { zh: '土楼·院落结构', en: 'Tulou & Courtyard Section' },
  pinyin: 'tu lou yuan luo jie gou',
  subtitle: {
    zh: '福建圆楼 180° 剖面 · 夯土外墙 · 楼中有楼',
    en: 'Fujian round tulou, 180° section · rammed-earth walls · building within a building',
  },
  summary: {
    zh: '外墙用熟土分层夯筑，底厚 1–2 m、向上收分到 0.4–0.8 m，既承重又御敌；墙内埋杉木枝条作墙骨。楼内环环相套：外圈居最底层，环形走廊串起各个房间，内环再围出一座小楼，中心天井与祖堂落在同一条轴线上。',
    en: 'The outer wall is rammed in layers of sticky local earth, 1–2 m thick at the base and tapered to 0.4–0.8 m at the top, carrying the loads and the defence; cedar laths are buried in the earth as wall bones. Inside, ring after ring: the outer ring holds the kitchens, stores and pens, a ring corridor links the rooms, an inner ring encloses a smaller building, and the courtyard with the ancestral hall sits on the same axis as the gate.',
  },
  loadPath: {
    zh: '屋面 → 楼板与木梁 → 夯土外墙 → 石砌墙基 → 地基',
    en: 'Roof → floors and timber beams → rammed-earth wall → stone plinth → ground',
  },
  era: { zh: '宋末至明清，2008 年列入世界遗产', en: 'Song–Ming to Qing, inscribed UNESCO World Heritage in 2008' },
  region: { zh: '福建永定、南靖、华安及广东梅州', en: 'Yongding, Nanjing, Hua’an (Fujian) and Meizhou (Guangdong)' },
  scaleNote: {
    zh: '教学示意，非施工/工程模型：以直径约 60 m 的四层圆楼为例，剖去一半，统一缩为 1 单位 = 4 米；房间划分、枪眼与墙骨为示意，非施工图。',
    en: 'Teaching diagram — not a construction or engineering model: a four-storey round tulou of about 60 m diameter, cut in half and scaled to 1 unit = 4 m. Room divisions, gun holes and wall bones are indicative, not a construction drawing.',
  },
  // 史实参照：条目出处为 17-architecture-research/catalog.json
  catalogRefs: [
    { id: 'c17-fujian-tulou', name: { zh: '福建土楼（振成楼、承启楼）', en: 'Fujian Tulou (Zhencheng Lou, Chengqi Lou)' }, source: '17-architecture-research/catalog.json · c17-fujian-tulou' },
    { id: 'c42-baise-cellar-courtyard', name: { zh: '陕西三原柏社村地坑窑院', en: 'Baise Village Sunken-Pit Courtyards, Sanyuan, Shaanxi' }, source: '17-architecture-research/catalog.json · c42-baise-cellar-courtyard' },
  ],
  camera: { position: [12.5, 8.4, 13.5], target: [0, 2.4, -3.6] },
  layers: [
    {
      id: 'plinth',
      label: { zh: '石基', en: 'Stone Plinth' },
      hint: { zh: '条石与石灰浆砌的墙基，把夯土墙的荷载摊到地基上。', en: 'Courses of stone and lime mortar that spread the wall load into the ground.' },
    },
    {
      id: 'wall',
      label: { zh: '夯土墙', en: 'Rammed-earth walls' },
      hint: { zh: '夹墙板分层夯筑，向上逐层收分，墙内埋墙骨。', en: 'Earth rammed in layers between boards, tapered upward, with laths buried inside.' },
    },
    {
      id: 'timber',
      label: { zh: '木构架', en: 'Timber frame' },
      hint: { zh: '木柱与木梁承楼板，屋面重量由墙承担。', en: 'Columns and beams carry the floor slabs; the roof is carried by the walls.' },
    },
    {
      id: 'floor',
      label: { zh: '楼板与走廊', en: 'Floors & corridor' },
      hint: { zh: '木楼板分层圈合，环形走廊串起各户。', en: 'Timber floor slabs stack up and a ring corridor links the households.' },
    },
    {
      id: 'roof',
      label: { zh: '屋面', en: 'Roofs' },
      hint: { zh: '外高内低的瓦屋面，雨水向天井汇流。', en: 'Tiled roofs falling from the high outer wall towards the courtyard.' },
    },
    {
      id: 'core',
      label: { zh: '院落核心', en: 'Courtyard core' },
      hint: { zh: '轴线上的大门、中心天井与祖堂。', en: 'The gate, the central courtyard and the ancestral hall on one axis.' },
    },
  ],

  build(materials) {
    const M = materials;
    const group = new THREE.Group();
    const parts = [];
    const forces = [];
    const V = (x, y, z) => new THREE.Vector3(x * S, y * S, z * S);

    /* ---------------------------------------------- 0 石砌墙基 */
    {
      const plinth = rammedEarthWall({
        angleStart: A0, angleEnd: A1, segments: 56,
        rInner: 28.0, rOuterBottom: 30.6, rOuterTop: 30.6, height: PLINTH_H, mat: M.stone,
      });
      group.add(bake(plinth));
      parts.push({
        id: 'shi-ji',
        name: { zh: '石砌墙基', en: 'Stone Plinth' },
        pinyin: 'shi qiu zhang ji',
        role: {
          zh: '条石加石灰浆砌成的墙基，既防潮又把夯土墙的集中荷载摊开给地基。',
          en: 'Stone courses in lime mortar: they keep out damp and spread the concentrated earth-wall load into the ground.',
        },
        layer: 'plinth', family: 'stone', object: plinth,
        explode: new THREE.Vector3(0, -1, 0), order: 0,
      });
    }

    /* ---------------------------------------------- 1 底层地坪 */
    {
      const floor = ringBand({
        rIn: R_INNER_IN, rOut: R_CORRIDOR_OUT, yIn: 0.8, yOut: 0.8, thickness: 0.12, mat: M.stoneDark,
      });
      group.add(bake(floor));
      parts.push({
        id: 'di-ping',
        name: { zh: '底层地坪', en: 'Ground-floor Paving' },
        pinyin: 'di ceng di ping',
        role: {
          zh: '底层铺地坪，谷仓、栏舍与水井都布置在这一层。',
          en: 'The paved ground floor that carries the grain stores, the animal pens and the well.',
        },
        layer: 'floor', family: 'stone', object: floor,
        explode: new THREE.Vector3(0, -0.6, 0), order: 1,
      });
    }

    /* ---------------------------------------------- 2 天井 */
    {
      const g = new THREE.CircleGeometry(R_INNER_IN, 44, 0, Math.PI);
      g.rotateX(-Math.PI / 2);
      const yard = new THREE.Mesh(g, M.earth);
      yard.position.set(0, 0.86, 0);
      yard.receiveShadow = true;
      group.add(bake(yard));
      parts.push({
        id: 'tian-jing',
        name: { zh: '天井', en: 'Courtyard' },
        pinyin: 'tian jing',
        role: {
          zh: '内环围出的露天天井，采光、通风与排水都靠它。',
          en: 'The open court inside the inner ring: it brings light, air and drainage to the middle of the house.',
        },
        layer: 'core', family: 'earth', object: yard,
        explode: new THREE.Vector3(0, -0.3, 0), order: 2,
      });
    }

    /* ---------------------------------------------- 3-6 夯土外墙（分三层） */
    const wallDefs = [
      {
        id: 'qiang-ji', y: ST1[0], h: ST1[1] - ST1[0], rOutB: 30.0, rOutT: 29.7,
        zh: '一层夯土墙', en: 'Ground-storey Earth Wall', pinyin: 'hang tu wai qiang',
        role: {
          zh: '最厚的一层夯土墙（1.6 m），朝外开门洞与枪眼，承住整座楼的重量。',
          en: 'The thickest earth wall (1.6 m) — it takes the whole building and is pierced by the gate and the gun holes.',
        },
      },
      {
        id: 'qiang-er-san', y: ST2[0], h: ST3[1] - ST2[0], rOutB: 29.7, rOutT: 29.35,
        zh: '二、三层夯土墙', en: 'Second & Third Storey Walls', pinyin: 'shang ceng hang tu qiang',
        role: {
          zh: '向上逐层收分的居住墙体，墙厚减小以省料，同时保留承重与防护。',
          en: 'The living-storey walls taper as they rise: less material, but they still carry the loads and shield the rooms.',
        },
      },
      {
        id: 'qiang-si', y: ST4[0], h: ST4[1] - ST4[0], rOutB: 29.35, rOutT: 29.1,
        zh: '四层夯土墙', en: 'Top Storey Earth Wall', pinyin: 'si ceng hang tu qiang',
        role: {
          zh: '顶层墙体最薄，墙头做排水与压顶，支承外圈屋面的出挑。',
          en: 'The thinnest wall; its head carries the coping and the outward-thrusting eaves above.',
        },
      },
    ];
    wallDefs.forEach((w, i) => {
      const wall = rammedEarthWall({
        angleStart: A0, angleEnd: A1, segments: 56,
        rInner: R_IN, rOuterBottom: w.rOutB, rOuterTop: w.rOutT, height: w.h, mat: M.earth,
      });
      wall.position.y = w.y;
      group.add(bake(wall));
      parts.push({
        id: w.id,
        name: { zh: w.zh, en: w.en },
        pinyin: w.pinyin,
        role: w.role,
        layer: 'wall', family: 'earth', object: wall,
        explode: new THREE.Vector3(0, 0.3 + i * 0.25, 0.6), order: 3 + i,
      });
    });

    /* ---------------------------------------------- 7 内环土墙 */
    {
      const inner = rammedEarthWall({
        angleStart: A0, angleEnd: A1, segments: 48,
        rInner: R_INNER_IN, rOuterBottom: R_INNER_OUT, rOuterTop: R_INNER_OUT - 0.2,
        height: R_INNER_TOP - PLINTH_H, mat: M.earthDark,
      });
      inner.position.y = PLINTH_H;
      group.add(bake(inner));
      parts.push({
        id: 'nei-huan-qiang',
        name: { zh: '内环土墙', en: 'Inner Ring Wall' },
        pinyin: 'nei huan tu qiang',
        role: {
          zh: '楼中楼的内圈夯土墙，围出中庭与祖堂，标高低于外圈。',
          en: 'The inner earth wall that encloses the court and the ancestral hall — lower than the outer ring.',
        },
        layer: 'wall', family: 'earth', object: inner,
        explode: new THREE.Vector3(0, 0.4, 0.9), order: 6,
      });
    }

    /* ---------------------------------------------- 8 墙骨（剖面可见） */
    {
      const bars = [];
      for (const s of [-1, 1]) {
        for (let y = 1.1; y < 12.9; y += 0.62) {
          const ro = outerR(y) - 0.25;
          for (const rr of [R_IN + 0.3, (R_IN + ro) / 2, ro]) {
            const g = new THREE.BoxGeometry(0.09, 0.5, 0.12);
            const m = new THREE.Mesh(g, M.timberDark);
            m.position.set(s * rr, y, 0.02);
            m.castShadow = true;
            bars.push(m);
          }
        }
      }
      const bones = mergeMeshes(bars, M.timberDark);
      group.add(bake(bones));
      parts.push({
        id: 'qiang-gu',
        name: { zh: '墙骨', en: 'Wall Bones' },
        pinyin: 'qiang gu',
        role: {
          zh: '埋进夯土里的杉木枝条或竹片，拉结墙体、防止开裂。',
          en: 'Cedar branches and bamboo laths buried in the earth: they tie the wall together and stop it cracking.',
        },
        layer: 'wall', family: 'wood', object: bones,
        explode: new THREE.Vector3(0, 0.6, 1), order: 7,
      });
    }

    /* ---------------------------------------------- 9 枪眼 */
    {
      const holes = [];
      for (const k of [1, 2, 3]) {
        for (const sgn of [-1, 1]) {
          const a = GATE_A + sgn * (k * Math.PI) / 8;
          if (a < A0 + 0.12 || a > A1 - 0.12) continue;
          const rr = outerR(2.2) + 0.02;
          const g = new THREE.BoxGeometry(0.6, 0.34, 0.26);   // X 径向、Z 切向
          const m = new THREE.Mesh(g, M.stoneDark);
          m.position.set(rr * Math.cos(a), 2.2, rr * Math.sin(a));
          m.rotation.y = -a;
          m.castShadow = true;
          holes.push(m);
        }
      }
      const guns = mergeMeshes(holes, M.stoneDark);
      group.add(bake(guns));
      parts.push({
        id: 'qiang-yan',
        name: { zh: '枪眼', en: 'Gun Holes' },
        pinyin: 'qiang yan',
        role: {
          zh: '底层外墙上的小孔，供守夜者射击、也便于通风。',
          en: 'Small loopholes in the ground-floor wall for the watchmen to shoot from and for air to pass.',
        },
        layer: 'wall', family: 'stone', object: guns,
        explode: new THREE.Vector3(0, 0, 1), order: 8,
      });
    }

    /* ---------------------------------------------- 10 木柱 */
    {
      const cols = [];
      for (let i = 0; i < COL_N; i++) {
        const a = A0 + ((A1 - A0) * (i + 0.5)) / COL_N;
        const g = new THREE.CylinderGeometry(0.17, 0.19, 11.4, 12);
        g.translate(0, 5.7, 0);
        const m = new THREE.Mesh(g, M.timber);
        m.position.set(COL_R * Math.cos(a), 0.9, COL_R * Math.sin(a));
        m.castShadow = m.receiveShadow = true;
        cols.push(m);
      }
      const pillars = mergeMeshes(cols, M.timber);
      group.add(bake(pillars));
      parts.push({
        id: 'mu-zhu',
        name: { zh: '木柱', en: 'Timber Columns' },
        pinyin: 'mu zhu',
        role: {
          zh: '环形走廊上的木柱，支承各层楼板与木梁，把活荷载收成一圈点支座。',
          en: 'The timber columns around the corridor carry the floors and beams, gathering the live loads into a ring of point supports.',
        },
        layer: 'timber', family: 'wood', object: pillars,
        explode: new THREE.Vector3(0, 0.5, 0.8), order: 9,
      });
    }

    /* ---------------------------------------------- 11 木梁 */
    {
      const beams = [];
      for (const y of LEVELS) {
        for (let i = 0; i < COL_N; i++) {
          const a = A0 + ((A1 - A0) * (i + 0.5)) / COL_N;
          const len = COL_R - (R_INNER_OUT - 0.6);
          // 径向梁：长度沿局部 Z（= 径向），截面沿 X（= 切向）
          const rad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.26, len), M.timber);
          const rm = (R_INNER_OUT - 0.6 + COL_R) / 2;
          rad.position.set(rm * Math.cos(a), y - 0.15, rm * Math.sin(a));
          rad.rotation.y = -(a) - Math.PI / 2;
          rad.castShadow = true;
          beams.push(rad);
          // 圈梁（沿柱列的环向木梁）
          const seg = (Math.PI * COL_R) / COL_N;
          const hoop = new THREE.Mesh(new THREE.BoxGeometry(seg, 0.3, 0.22), M.timberDark);
          hoop.position.set(COL_R * Math.cos(a), y - 0.15, COL_R * Math.sin(a));
          hoop.rotation.y = -(a) - Math.PI / 2;
          hoop.castShadow = true;
          beams.push(hoop);
        }
      }
      const frame = mergeMeshes(beams, M.timber);
      group.add(bake(frame));
      parts.push({
        id: 'mu-liang',
        name: { zh: '木梁', en: 'Timber Beams' },
        pinyin: 'mu liang',
        role: {
          zh: '径向梁与圈梁组成的楼板骨架，把楼板荷载交给木柱再交给夯土墙。',
          en: 'Radial beams and ring beams form the floor frame, passing the slab loads to the columns and on to the earth walls.',
        },
        layer: 'timber', family: 'wood', object: frame,
        explode: new THREE.Vector3(0, 1, 0.4), order: 10,
      });
    }

    /* ---------------------------------------------- 12-14 楼板 */
    const floorNames = [
      { id: 'lou-ban-2', zh: '二层楼板', en: 'Second-floor Slab' },
      { id: 'lou-ban-3', zh: '三层楼板', en: 'Third-floor Slab' },
      { id: 'lou-ban-4', zh: '四层楼板', en: 'Fourth-floor Slab' },
    ];
    LEVELS.forEach((y, i) => {
      const slab = ringBand({
        rIn: R_INNER_OUT - 0.5, rOut: R_CORRIDOR_IN - 0.1, yIn: y - 0.24, yOut: y - 0.24,
        thickness: 0.24, mat: M.timberDark,
      });
      group.add(bake(slab));
      parts.push({
        id: floorNames[i].id,
        name: { zh: floorNames[i].zh, en: floorNames[i].en },
        pinyin: 'lou ban',
        role: {
          zh: '木楼板把每层的房间与走廊连成一圈，荷载经木梁传给木柱。',
          en: 'A timber slab ties each storey of rooms and corridor into one ring, its load passing through the beams to the columns.',
        },
        layer: 'floor', family: 'wood', object: slab,
        explode: new THREE.Vector3(0, 0.6 + i * 0.2, 0.5), order: 11 + i,
      });
    });

    /* ---------------------------------------------- 15 环形走廊 */
    {
      const grp = new THREE.Group();
      for (const y of LEVELS) {
        const deck = ringBand({
          rIn: R_CORRIDOR_IN - 0.1, rOut: R_CORRIDOR_OUT + 0.1, yIn: y - 0.2, yOut: y - 0.2,
          thickness: 0.2, mat: M.timber,
        });
        grp.add(deck);
        // 走廊内侧木栏杆
        const rail = ringBand({
          rIn: R_CORRIDOR_IN - 0.12, rOut: R_CORRIDOR_IN, yIn: y + 0.9, yOut: y + 0.9,
          thickness: 0.12, mat: M.timberDark,
        });
        grp.add(rail);
        for (let i = 0; i < COL_N; i++) {
          const a = A0 + ((A1 - A0) * (i + 0.5)) / COL_N;
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.12), M.timberDark);
          post.position.set((R_CORRIDOR_IN - 0.06) * Math.cos(a), y + 0.45, (R_CORRIDOR_IN - 0.06) * Math.sin(a));
          post.rotation.y = -a;
          post.castShadow = true;
          grp.add(post);
        }
      }
      group.add(bake(grp));
      parts.push({
        id: 'huan-xing-zou-lang',
        name: { zh: '环形走廊', en: 'Ring Corridor' },
        pinyin: 'huan xing zou lang',
        role: {
          zh: '沿外墙内侧贯通的环形走道，把一间间居室串成交通与防卫的环路。',
          en: 'The covered walk along the inside of the outer wall links every household into one traffic and defence ring.',
        },
        layer: 'floor', family: 'wood', object: grp,
        explode: new THREE.Vector3(0, 0.4, 1), order: 14,
      });
    }

    /* ---------------------------------------------- 16 屋面 */
    {
      const grp = new THREE.Group();
      // 外圈主坡：自内环墙顶升至外墙上部
      grp.add(ringBand({
        rIn: 18.7, rOut: 28.4, yIn: R_INNER_TOP - 0.05, yOut: 13.0,
        thickness: 0.32, mat: M.tile,
      }));
      // 出檐（微翘）
      grp.add(ringBand({
        rIn: 28.4, rOut: 30.7, yIn: 13.0, yOut: 13.22,
        thickness: 0.32, mat: M.tile,
      }));
      // 内环谷口与朝天井的坡面
      grp.add(ringBand({
        rIn: 17.3, rOut: 19.0, yIn: R_INNER_TOP - 0.05, yOut: R_INNER_TOP - 0.05,
        thickness: 0.3, mat: M.tile,
      }));
      grp.add(ringBand({
        rIn: 15.1, rOut: 17.3, yIn: 7.6, yOut: R_INNER_TOP - 0.05,
        thickness: 0.3, mat: M.tile,
      }));
      group.add(bake(grp));
      parts.push({
        id: 'wu-mian',
        name: { zh: '屋面', en: 'Roofs' },
        pinyin: 'wu mian',
        role: {
          zh: '外高内低的瓦屋面：外檐挑出护墙，雨水顺坡汇入天井。',
          en: 'Tiled roofs fall from the high outer wall to the courtyard, the deep eaves shielding the earth wall.',
        },
        layer: 'roof', family: 'tile', object: grp,
        explode: new THREE.Vector3(0, 1, 0.3), order: 15,
      });
    }

    /* ---------------------------------------------- 17 祖堂 */
    {
      const grp = new THREE.Group();
      const HW = 5.0;            // 半宽
      const HD = 5.2;            // 进深（z 自 0 向 -）
      const EAVE = 6.3;          // 檐口标高
      const RIDGE = 8.4;         // 脊高
      // 台基
      const plat = new THREE.Mesh(new THREE.BoxGeometry(2 * HW + 0.8, 0.55, HD + 0.4), M.stone);
      plat.position.set(0, 1.2, -HD / 2);
      plat.castShadow = plat.receiveShadow = true;
      grp.add(plat);
      // 两侧山墙方向的墙身
      for (const s of [-1, 1]) {
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.35, EAVE - 1.45, HD), M.timber);
        w.position.set(s * HW, (EAVE + 1.45) / 2, -HD / 2);
        w.castShadow = w.receiveShadow = true;
        grp.add(w);
      }
      // 后檐墙
      const back = new THREE.Mesh(new THREE.BoxGeometry(2 * HW, EAVE - 1.45, 0.35), M.timber);
      back.position.set(0, (EAVE + 1.45) / 2, -HD);
      back.castShadow = back.receiveShadow = true;
      grp.add(back);
      // 木柱
      for (const x of [-4.4, 4.4]) {
        for (const z of [-1.3, -4.0]) {
          const g = new THREE.CylinderGeometry(0.2, 0.22, 5.0, 12);
          g.translate(0, 2.5, 0);
          const m = new THREE.Mesh(g, M.timber);
          m.position.set(x, 1.45, z);
          m.castShadow = true;
          grp.add(m);
        }
      }
      // 屋面：脊沿 Z 向，剖面正对观众可见山墙
      grp.add(slopeSlabX({
        zHalf: HD / 2 + 0.25, x0: 0, y0: RIDGE, x1: HW + 0.4, y1: EAVE + 0.05,
        thickness: 0.3, mat: M.tile,
      }));
      grp.add(slopeSlabX({
        zHalf: HD / 2 + 0.25, x0: 0, y0: RIDGE, x1: -HW - 0.4, y1: EAVE + 0.05,
        thickness: 0.3, mat: M.tile,
      }));
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, HD + 0.6), M.timberDark);
      ridge.position.set(0, RIDGE + 0.08, -HD / 2);
      grp.add(ridge);
      group.add(bake(grp));
      parts.push({
        id: 'zu-tang',
        name: { zh: '祖堂', en: 'Ancestral Hall' },
        pinyin: 'zu tang',
        role: {
          zh: '中轴线上的祖堂，供奉祖先牌位，是全族的礼仪核心。',
          en: 'The ancestral hall on the central axis, holding the tablets of the ancestors — the ceremonial heart of the clan.',
        },
        layer: 'core', family: 'wood', object: grp,
        explode: new THREE.Vector3(0, 0.5, 0.4), order: 16,
      });
    }

    /* ---------------------------------------------- 18 大门门楼 */
    {
      const grp = new THREE.Group();
      const gz = -R_OUT_B + 0.4;
      // 门洞（深色内凹，向走廊凸出 1.2 m，读作门道进深）
      const gate = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 1.6), M.stoneDark);
      gate.position.set(0, 2.2, gz + 1.6);
      gate.castShadow = true;
      grp.add(gate);
      // 门楼木构
      const house = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 4.0), M.timber);
      house.position.set(0, 14.6, gz - 0.6);
      house.castShadow = house.receiveShadow = true;
      grp.add(house);
      // 门楼屋面（脊沿 X，两坡）
      grp.add(slopeSlab({
        xHalf: 3.1, z0: gz - 2.6, y0: 16.2, z1: gz - 0.6, y1: 17.7, thickness: 0.28, mat: M.tile,
      }));
      grp.add(slopeSlab({
        xHalf: 3.1, z0: gz - 0.6, y0: 17.7, z1: gz + 1.4, y1: 16.2, thickness: 0.28, mat: M.tile,
      }));
      group.add(bake(grp));
      parts.push({
        id: 'da-men',
        name: { zh: '大门与门楼', en: 'Gate & Gate Tower' },
        pinyin: 'da men men lou',
        role: {
          zh: '唯一的出入口，正对中轴与祖堂；门楼既是门闩所在，也是全楼的门脸。',
          en: 'The single entrance, aligned with the ancestral hall; the gate tower is both the bar for the door and the face of the house.',
        },
        layer: 'core', family: 'wood', object: grp,
        explode: new THREE.Vector3(0, 0.8, 0.3), order: 17,
      });
    }

    /* ---------------------------------------------- 19 谷仓 */
    {
      const grp = new THREE.Group();
      const a = GATE_A + 0.62;
      const rm = 22.4;
      const cx = rm * Math.cos(a);
      const cz = rm * Math.sin(a);
      const plat = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.6, 6.4), M.timberDark);
      plat.position.set(cx, 1.2, cz);
      plat.rotation.y = -a - Math.PI / 2;
      plat.castShadow = plat.receiveShadow = true;
      grp.add(plat);
      for (let i = 0; i < 6; i++) {
        const g = new THREE.CylinderGeometry(0.85, 0.9, 1.4, 14);
        const m = new THREE.Mesh(g, M.timber);
        const off = (i % 3) * 1.9 - 1.9;
        const row = i < 3 ? -1.5 : 1.5;
        const px = cx + off * Math.cos(a + Math.PI / 2) + row * Math.cos(a);
        const pz = cz + off * Math.sin(a + Math.PI / 2) + row * Math.sin(a);
        m.position.set(px, 1.9, pz);
        m.castShadow = true;
        grp.add(m);
      }
      group.add(bake(grp));
      parts.push({
        id: 'gu-cang',
        name: { zh: '谷仓', en: 'Grain Store' },
        pinyin: 'gu cang',
        role: {
          zh: '底层架起的谷仓，抬高防潮又防鼠，储存全族口粮。',
          en: 'Raised grain bins on the ground floor, kept off the damp and away from rats, hold the food of the whole clan.',
        },
        layer: 'core', family: 'wood', object: grp,
        explode: new THREE.Vector3(0, 0.3, 0.6), order: 18,
      });
    }

    /* ---------------------------------------------- 受力箭头 */
    forces.push(
      {
        id: 'load-roof',
        from: V(29.2, 15.4, -7), to: V(29.2, 12.4, -7),
        label: { zh: '屋面荷载压向夯土墙', en: 'Roof load pressed onto the earth wall' },
        kind: 'load',
      },
      {
        id: 'load-inner',
        from: V(18.3, 11.2, -6), to: V(18.3, 8.4, -6),
        label: { zh: '内环屋面荷载', en: 'Load of the inner ring roof' },
        kind: 'load',
      },
      {
        id: 'tension-right',
        from: V(28.6, 9.0, -4.5), to: V(28.6, 9.0, 4.5),
        label: { zh: '环向拉结（右侧）', en: 'Circumferential tie (right)' },
        kind: 'tension',
      },
      {
        id: 'tension-left',
        from: V(-28.6, 9.0, 4.5), to: V(-28.6, 9.0, -4.5),
        label: { zh: '环向拉结（左侧）', en: 'Circumferential tie (left)' },
        kind: 'tension',
      },
      {
        id: 'reaction-right',
        from: V(29.3, -1.6, -10), to: V(29.3, 1.2, -10),
        label: { zh: '右侧墙基地基反力', en: 'Ground reaction under the right plinth' },
        kind: 'reaction',
      },
      {
        id: 'reaction-left',
        from: V(-29.3, -1.6, -10), to: V(-29.3, 1.2, -10),
        label: { zh: '左侧墙基地基反力', en: 'Ground reaction under the left plinth' },
        kind: 'reaction',
      },
    );

    return { group, parts, forces };
  },
};

// 由 QA 脚本静态检查契约一致性
