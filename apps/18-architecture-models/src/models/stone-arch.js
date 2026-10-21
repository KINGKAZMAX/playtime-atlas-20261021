/**
 * stone-arch.js — 敞肩石拱桥 / Open-Shoulder Stone Arch Bridge
 *
 * 仿赵州桥（安济桥，隋·李春）：矢跨比约 1:5 的坦弧主拱 + 两侧各两座敞肩小拱
 * + 浅基础浅桥台 + 辇道桥面。荷载路径：桥面 → 拱上填石 → 主拱券 → 拱脚推力
 * → 桥台 → 地基。
 *
 * 全部几何程序化生成（geo.js 工具箱 + 原生 THREE），不引用任何外部资源。
 * 尺寸以米建模，最后统一缩为 S（1 模型单位 = 4 m），以便与场景中的受力箭头
 * 大小相称。
 */
import * as THREE from 'three';
import { extrudedPanel, segmentalArcPoints, mergeMeshes } from '../core/geo.js';

/* ===================================================== 实测尺寸（单位：米） */
const S = 0.25;                  // 缩尺系数：1 模型单位 = 4 m

const TOTAL_L = 64.40;           // 全桥长
const HALF_L = TOTAL_L / 2;       // 32.20
const DECK_W = 9.00;             // 桥宽（9 片拱券并列的宽度）
const SPAN = 37.02;              // 主拱净跨
const A = SPAN / 2;              // 18.51
const F = 7.25;                  // 拱矢（矢跨比 1:5.1，坦弧非半圆）
const SPRING_Y = 1.55;           // 拱脚 / 桥台顶面标高（浅桥台 5 皮石）
const GROUND_Y = 1.55;           // 岸上天然砂地
const BED_Y = -2.20;             // 河床
const WATER_Y = 0.00;            // 常水位
const DECK_T = 0.35;             // 桥面（辇道）厚
const DECK_END_Y = 1.90;         // 桥面两端（搭上土坡）标高
const DECK_CROWN_Y = 10.60;      // 桥面拱顶标高
const RING_T_TOP = 0.80;         // 券圈顶部厚（自外向内收分）
const RING_T_SPR = 1.45;         // 券圈拱脚厚（收分后最厚）
const RING_DEPTH = 1.58;         // 单道券圈进深（28 道中示 5 道）
const RING_N = 5;                // 示意的并列券圈道数（实为 28 道）
const BLOCKS = 43;               // 每道券圈 43 块拱石
const RING_Z0 = -DECK_W / 2 + 0.55;   // 券圈区最外缘（余下为栏板带）

// 敞肩小拱：近拱（近主拱）3.8 m 跨，外拱 2.85 m 跨
const SMALL_NEAR = { a: 1.90, f: 1.60, x: 22.00 };
const SMALL_OUT = { a: 1.425, f: 1.20, x: 26.30 };

/* ===================================================== 几何工具（模型内部） */

/** 主拱圆弧参数：坦弧过 (-a,0)、(0,f)、(a,0)。 */
const MAIN_R = (A * A + F * F) / (2 * F);      // 27.256
const MAIN_CY = F - MAIN_R;                    // -20.006（圆心相对拱脚线）
const MAIN_PHI = Math.acos(1 - F / MAIN_R);    // 0.7463 rad
/** 券厚收分：t = 0 为券顶，|t| = 1 为拱脚。 */
const ringT = (t) => RING_T_TOP + (RING_T_SPR - RING_T_TOP) * Math.pow(Math.abs(t), 1.7);

/** 桥面（辇道）顶面标高：自两岸缓缓升至主拱拱顶，坡度向两端略陡。 */
function deckTopY(x) {
  const u = Math.min(1, Math.abs(x) / HALF_L);
  return DECK_END_Y + (DECK_CROWN_Y - DECK_END_Y) * (1 - Math.pow(u, 1.35));
}

/** 望柱与栏板的分栏站位（沿桥面对称分布）。 */
function postStations() {
  const x0 = -HALF_L + 1.2;
  const x1 = HALF_L - 1.2;
  const n = Math.floor((x1 - x0) / 2.4) + 1;
  const out = [];
  for (let i = 0; i < n; i++) out.push(x0 + ((x1 - x0) * i) / (n - 1));
  return out;
}

/**
 * 楔形拱石排成的券圈：按圆弧角等分，每块石为内弧 + 外弧（收分）之间的楔形。
 * 局部原点：拱脚线在 y = 0，券顶在 y = f，跨向沿 X，进深沿 Z。
 */
function voussoirRing({ halfSpan, rise, tTop, tSpring, depth, blocks, mat, gap = 0.05, seg = 4 }) {
  const R = (halfSpan * halfSpan + rise * rise) / (2 * rise);
  const cy = rise - R;
  const phi = Math.acos(1 - rise / R);
  const inset = (gap / (2 * R)) / phi;
  const meshes = [];
  for (let i = 0; i < blocks; i++) {
    const t0 = -1 + (2 * i) / blocks + inset;
    const t1 = -1 + (2 * (i + 1)) / blocks - inset;
    const inner = [];
    const outer = [];
    for (let k = 0; k <= seg; k++) {
      const t = t0 + (t1 - t0) * (k / seg);
      const th = t * phi;
      const s = Math.sin(th);
      const c = Math.cos(th);
      inner.push(new THREE.Vector2(R * s, cy + R * c));
      const th2 = tTop + (tSpring - tTop) * Math.pow(Math.abs(t), 1.7);
      outer.push(new THREE.Vector2((R + th2) * s, cy + (R + th2) * c));
    }
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(inner.concat(outer.reverse())), {
      depth, bevelEnabled: false,
    });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    meshes.push(m);
  }
  return mergeMeshes(meshes, mat);
}

/** 拱洞轮廓（供 Shape 挖洞用）：拱弧在 baseY 标高，底边落在 baseY。 */
function archVoid(halfSpan, rise, baseY, cx) {
  const { points } = segmentalArcPoints({ halfSpan, rise, segments: 26 });
  const p = new THREE.Path();
  p.moveTo(points[0].x + cx, baseY);
  for (const pt of points) p.lineTo(pt.x + cx, pt.y + baseY);
  p.lineTo(points[points.length - 1].x + cx, baseY);
  p.closePath();
  return p;
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
  id: 'stone-arch',
  title: { zh: '敞肩石拱桥', en: 'Open-Shoulder Stone Arch Bridge' },
  pinyin: 'chang jian shi gong qiao',
  subtitle: {
    zh: '赵州桥式坦弧主拱 · 两侧敞肩小拱 · 浅基础浅桥台',
    en: 'Zhaozhou-type segmental arch · open shoulders · shallow abutments',
  },
  summary: {
    zh: '主拱是矢跨比约 1:5 的坦弧（不是半圆），由 28 道并列拱券纵向砌筑而成，券圈自外向内收分，圈间以铁拉杆与腰铁拉结。拱肩开两座小拱，既减重约 700 吨、又增大泄洪断面。桥台仅 1.55 m 高，全桥荷载以受压方式沿拱圈传到两岸。',
    en: 'The main arch is a shallow segmental arc (rise-to-span ≈ 1:5, not a semicircle) built from 28 rings laid side by side, tapered so the rings lean on each other and bound by iron ties and cramps. Two small arches open each shoulder, saving some 700 t of stone and enlarging the flood opening. The abutments are only 1.55 m deep; the load travels as compression through the rings into the banks.',
  },
  loadPath: {
    zh: '桥面辇道 → 拱上填石 → 主拱券 → 拱脚水平推力 → 桥台 → 地基',
    en: 'Deck → spandrel fill → main arch rings → springing thrust → abutments → ground',
  },
  era: { zh: '隋代开皇末年（公元 595–605 年），匠人李春造', en: 'Sui dynasty (c. 595–605 CE), by the craftsman Li Chun' },
  region: { zh: '河北赵县 · 赵州桥（安济桥）', en: 'Zhaozian, Hebei — Zhaozhou (Anji) Bridge' },
  scaleNote: {
    zh: '教学示意，非施工/工程模型：按真实尺寸建模后统一缩为 1 单位 = 4 米；并列券圈示 5 道（实为 28 道），栏板望柱等细部为示意，非施工图。',
    en: 'Teaching diagram — not a construction or engineering model: real dimensions, uniformly scaled to 1 unit = 4 m. Five of the 28 parallel rings are shown and the railing is indicative — not a construction drawing.',
  },
  // 史实参照：条目出处为 17-architecture-research/catalog.json
  catalogRefs: [
    { id: 'c30-zhaozhou-bridge', name: { zh: '赵州桥（安济桥）', en: 'Zhaozhou Bridge (Anji Bridge)' }, source: '17-architecture-research/catalog.json · c30-zhaozhou-bridge' },
    { id: 'c41-luoyang-bridge', name: { zh: '洛阳桥（万安桥）', en: 'Luoyang Bridge (Wan\'an Bridge)' }, source: '17-architecture-research/catalog.json · c41-luoyang-bridge' },
  ],
  camera: { position: [16.5, 8.8, 21.0], target: [0, 2.1, 0] },
  layers: [
    {
      id: 'abutment',
      label: { zh: '桥台', en: 'Abutments' },
      hint: { zh: '浅基础、浅桥台，5 皮条石砌筑，抵住拱脚的水平推力。', en: 'Low five-course masonry abutments resisting the horizontal thrust.' },
    },
    {
      id: 'mainarch',
      label: { zh: '主拱券', en: 'Main arch' },
      hint: { zh: '28 道并列拱券，每道 43 块楔形拱石，自外向内收分。', en: '28 parallel rings of 43 tapered voussoirs each, tapering inward.' },
    },
    {
      id: 'smallarch',
      label: { zh: '敞肩小拱', en: 'Shoulder arches' },
      hint: { zh: '每侧两座小拱，减轻拱肩重量并加大泄洪断面。', en: 'Two small arches per side lighten the shoulders and enlarge the flood opening.' },
    },
    {
      id: 'spandrel',
      label: { zh: '拱上填石', en: 'Spandrel' },
      hint: { zh: '券背之上的填石，把小拱洞口挖出，并把桥面荷载传给拱圈。', en: 'Fill behind the rings, pierced by the shoulder arches, carrying the deck load to the arch.' },
    },
    {
      id: 'deck',
      label: { zh: '桥面与栏板', en: 'Deck & parapet' },
      hint: { zh: '辇道缓坡自两岸升至拱顶，两侧设栏板望柱。', en: 'A gentle carriage ramp rising to the crown, flanked by panels and posts.' },
    },
    {
      id: 'water',
      label: { zh: '河床与水面', en: 'Riverbed & water' },
      hint: { zh: '常水位与砂质河床，洪水时经小拱下泄。', en: 'Normal water level over a sandy bed; floods pass through the shoulder arches.' },
    },
  ],

  build(materials) {
    const M = materials;
    const group = new THREE.Group();
    const parts = [];
    const forces = [];
    const V = (x, y, z) => new THREE.Vector3(x * S, y * S, z * S);

    /* ---------------------------------------------- 0 河床与岸坡 */
    const terrain = new THREE.Group();
    {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(68, 1.2, 36), M.stoneDark);
      bed.position.set(0, BED_Y - 0.6, 0);
      bed.receiveShadow = true;
      terrain.add(bed);
      for (const s of [-1, 1]) {
        const bank = new THREE.Mesh(new THREE.BoxGeometry(13, GROUND_Y - BED_Y, 36), M.earth);
        bank.position.set(s * 27.5, (GROUND_Y + BED_Y) / 2, 0);
        bank.receiveShadow = true;
        terrain.add(bank);
      }
    }
    group.add(bake(terrain));
    parts.push({
      id: 'he-chuang',
      name: { zh: '河床与岸坡', en: 'Riverbed & Banks' },
      pinyin: 'he chuang an po',
      role: {
        zh: '天然砂质河床与两岸土坡，承托桥台并提供水流冲刷的通道。',
        en: 'The sandy bed and earth banks that carry the abutments and let the river run through.',
      },
      layer: 'water', family: 'stone', object: terrain,
      explode: new THREE.Vector3(0, -1, 0), order: 0,
    });

    /* ---------------------------------------------- 1 水面 */
    const water = new THREE.Mesh(new THREE.PlaneGeometry(42, 36), M.water);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, WATER_Y, 0);
    water.receiveShadow = true;
    group.add(bake(water));
    parts.push({
      id: 'shui-mian',
      name: { zh: '常水位', en: 'Water Surface' },
      pinyin: 'shui mian',
      role: {
        zh: '标示桥下常水位，枯水时拱脚以上可通视，洪水时淹没小拱下半部。',
        en: 'Marks the normal river level: the arch is open in dry season, floods partly drown the shoulder arches.',
      },
      layer: 'water', family: 'water', object: water,
      explode: new THREE.Vector3(0, -0.4, 1), order: 1,
    });

    /* ---------------------------------------------- 2-3 桥台（左右各一） */
    for (const s of [-1, 1]) {
      // 5 皮条石：明暗相间，读出「层层叠砌」的砌体层次
      const grp = new THREE.Group();
      for (const parity of [0, 1]) {
        const courses = [];
        for (let i = parity; i < 5; i += 2) {
          const h = SPRING_Y / 5;
          // 每皮略高 2 cm，相邻皮互相咬住，避免共面闪烁
          const g = new THREE.BoxGeometry(4.6 - i * 0.16, h + 0.02, DECK_W);
          const m = new THREE.Mesh(g, parity ? M.stone : M.stoneDark);
          m.position.set(s * (19.3 + i * 0.08), h * (i + 0.5), 0);
          m.castShadow = m.receiveShadow = true;
          courses.push(m);
        }
        const merged = mergeMeshes(courses, parity ? M.stone : M.stoneDark);
        if (merged) grp.add(merged);
      }
      const abut = grp;
      group.add(bake(abut));
      parts.push({
        id: s < 0 ? 'qiao-tai-zuo' : 'qiao-tai-you',
        name: { zh: s < 0 ? '左桥台' : '右桥台', en: s < 0 ? 'Left Abutment' : 'Right Abutment' },
        pinyin: 'qiao tai',
        role: {
          zh: '以 5 皮条石砌于天然砂地上，靠自重与摩擦抵住主拱传来的水平推力。',
          en: 'Five courses of stone on natural sand, taking the horizontal thrust of the main arch by weight and friction.',
        },
        layer: 'abutment', family: 'stone', object: abut,
        explode: new THREE.Vector3(s, -0.3, 0), order: s < 0 ? 2 : 3,
      });
    }

    /* ---------------------------------------------- 4 翼墙 */
    {
      const walls = [];
      for (const s of [-1, 1]) {
        for (const e of [-1, 1]) {
          const g = new THREE.BoxGeometry(7.2, 0.9, 0.42);
          const m = new THREE.Mesh(g, M.stone);
          m.position.set(e * 24.4, GROUND_Y + 0.45, s * 4.7);
          m.rotation.y = -e * s * 0.14;
          m.castShadow = m.receiveShadow = true;
          walls.push(m);
        }
      }
      const wing = mergeMeshes(walls, M.stone);
      group.add(bake(wing));
      parts.push({
        id: 'yi-qiang',
        name: { zh: '翼墙', en: 'Wing Walls' },
        pinyin: 'yi qiang',
        role: {
          zh: '桥台两端的翼状挡土墙，挡住桥头填土并护住辇道边坡。',
          en: 'Flared retaining walls at the abutment ends that hold the approach fill and protect the ramp.',
        },
        layer: 'abutment', family: 'stone', object: wing,
        explode: new THREE.Vector3(0, 0, 1), order: 4,
      });
    }

    /* ---------------------------------------------- 5 主拱券（最外一道） */
    {
      const ring = voussoirRing({
        halfSpan: A, rise: F, tTop: RING_T_TOP, tSpring: RING_T_SPR,
        depth: RING_DEPTH, blocks: BLOCKS, mat: M.stone, gap: 0.06,
      });
      ring.position.set(0, SPRING_Y, RING_Z0 + RING_DEPTH * (RING_N - 0.5));
      group.add(bake(ring));
      parts.push({
        id: 'zhu-gong-juan',
        name: { zh: '主拱券', en: 'Main Arch Ring' },
        pinyin: 'zhu gong juan',
        role: {
          zh: '43 块楔形拱石首尾相接成圈，把桥面荷载变成沿拱轴的压力传给拱脚。',
          en: 'Forty-three tapered voussoirs form the ring that turns the deck load into compression along the arch.',
        },
        layer: 'mainarch', family: 'stone', object: ring,
        explode: new THREE.Vector3(0, 0, 1), order: 5,
      });
    }

    /* ---------------------------------------------- 6 并列券圈（其余 4 道） */
    {
      const grp = new THREE.Group();
      for (let i = 0; i < RING_N - 1; i++) {
        const ring = voussoirRing({
          halfSpan: A, rise: F, tTop: RING_T_TOP, tSpring: RING_T_SPR,
          depth: RING_DEPTH, blocks: BLOCKS, mat: i % 2 ? M.stone : M.stoneDark,
          gap: 0.06,
        });
        ring.position.set(0, SPRING_Y, RING_Z0 + RING_DEPTH * (i + 0.5));
        grp.add(ring);
      }
      group.add(bake(grp));
      parts.push({
        id: 'gong-juan-bing-lie',
        name: { zh: '拱券并列砌筑', en: 'Parallel Arch Rings' },
        pinyin: 'gong juan bing lie qi zhu',
        role: {
          zh: '28 道拱券沿桥宽并列（此处示 4 道），互不依赖，坏一道可单独拆修。',
          en: 'The 28 rings stand side by side across the width (four shown); each can be repaired without touching the others.',
        },
        layer: 'mainarch', family: 'stone', object: grp,
        explode: new THREE.Vector3(0, 1, 0.35), order: 6,
      });
    }

    /* ---------------------------------------------- 7-10 敞肩小拱（每侧两座） */
    const smallDefs = [
      { s: -1, d: SMALL_NEAR, id: 'xiao-gong-zuo-jin', zh: '近主拱小拱', en: 'Inner Shoulder Arch' },
      { s: -1, d: SMALL_OUT, id: 'xiao-gong-zuo-wai', zh: '外侧小拱', en: 'Outer Shoulder Arch' },
      { s: 1, d: SMALL_NEAR, id: 'xiao-gong-you-jin', zh: '近主拱小拱', en: 'Inner Shoulder Arch' },
      { s: 1, d: SMALL_OUT, id: 'xiao-gong-you-wai', zh: '外侧小拱', en: 'Outer Shoulder Arch' },
    ];
    smallDefs.forEach((def, i) => {
      const ring = voussoirRing({
        halfSpan: def.d.a, rise: def.d.f, tTop: 0.42, tSpring: 0.70,
        depth: DECK_W - 1.1, blocks: 13, mat: M.stone, gap: 0.04,
      });
      ring.position.set(def.s * def.d.x, SPRING_Y, 0);
      group.add(bake(ring));
      parts.push({
        id: def.id,
        name: { zh: def.zh, en: def.en },
        pinyin: 'chang jian xiao gong',
        role: {
          zh: '肩部小拱把厚重的填石掏空，既减轻自重又让洪水多一条下泄通道。',
          en: 'The shoulder arch hollows out the heavy fill, saving weight and giving floods an extra outlet.',
        },
        layer: 'smallarch', family: 'stone', object: ring,
        explode: new THREE.Vector3(def.s * 0.7, 0.2, 0.7), order: 7 + i,
      });
    });

    /* ---------------------------------------------- 11 拱上填石 */
    {
      const pts = [];
      const N = 84;
      for (let i = 0; i <= N; i++) {
        const x = -HALF_L + (2 * HALF_L * i) / N;
        pts.push(new THREE.Vector2(x, deckTopY(x) - DECK_T));
      }
      pts.push(new THREE.Vector2(HALF_L, 0));
      const ex = (MAIN_R + RING_T_SPR) * Math.sin(MAIN_PHI);
      pts.push(new THREE.Vector2(ex, 0));
      for (let i = N; i >= 0; i--) {
        const t = -1 + (2 * i) / N;
        const th = t * MAIN_PHI;
        const rr = MAIN_R + ringT(t);
        // 券背边界较券圈低 3 cm，券圈埋入填石，避免共面闪烁
        pts.push(new THREE.Vector2(rr * Math.sin(th), MAIN_CY + rr * Math.cos(th) + SPRING_Y - 0.03));
      }
      pts.push(new THREE.Vector2(-ex, 0));
      pts.push(new THREE.Vector2(-HALF_L, 0));

      const holes = [];
      for (const s of [-1, 1]) {
        // 洞口比券石内弧小 3 cm，让券石略探出洞口盖住洞壁
        holes.push(archVoid(SMALL_NEAR.a - 0.03, SMALL_NEAR.f - 0.03, SPRING_Y, s * SMALL_NEAR.x));
        holes.push(archVoid(SMALL_OUT.a - 0.03, SMALL_OUT.f - 0.03, SPRING_Y, s * SMALL_OUT.x));
      }
      const panel = extrudedPanel({ outerPoints: pts, holes, depth: DECK_W, mat: M.earth });
      group.add(bake(panel));
      parts.push({
        id: 'gong-shang-tian-shi',
        name: { zh: '拱上填石', en: 'Spandrel Fill' },
        pinyin: 'gong shang tian shi',
        role: {
          zh: '券背之上的填石层，上面压桥面、下面贴券背，洞口即两座小拱。',
          en: 'The fill behind the rings: it carries the deck on top and bears on the extrados below.',
        },
        layer: 'spandrel', family: 'earth', object: panel,
        explode: new THREE.Vector3(0, 1, 0), order: 11,
      });
    }

    /* ---------------------------------------------- 12 护拱石 */
    {
      const grp = new THREE.Group();
      const n = 34;
      for (const parity of [0, 1]) {
        const stones = [];
        for (let i = parity; i < n; i += 2) {
          const t = -1 + (2 * (i + 0.5)) / n;
          const th = t * MAIN_PHI;
          const rr = MAIN_R + ringT(t) + 0.14;   // 内侧沉入券背 2 cm，避免共面
          const g = new THREE.BoxGeometry(1.15, 0.32, DECK_W - 0.2);
          const m = new THREE.Mesh(g, parity ? M.stone : M.stoneDark);
          m.position.set(rr * Math.sin(th), MAIN_CY + rr * Math.cos(th) + SPRING_Y, 0);
          m.rotation.z = -th;
          m.castShadow = m.receiveShadow = true;
          stones.push(m);
        }
        const merged = mergeMeshes(stones, parity ? M.stone : M.stoneDark);
        if (merged) grp.add(merged);
      }
      const course = grp;
      group.add(bake(course));
      parts.push({
        id: 'hu-gong-shi',
        name: { zh: '护拱石', en: 'Protective Course' },
        pinyin: 'hu gong shi',
        role: {
          zh: '沿券背铺砌的一皮条石，挡住填土并让雨水顺券背流走。',
          en: 'A course of stones laid on the extrados to retain the fill and shed rain water.',
        },
        layer: 'spandrel', family: 'stone', object: course,
        explode: new THREE.Vector3(0, 1, 0.4), order: 12,
      });
    }

    /* ---------------------------------------------- 13 桥面辇道 */
    {
      const top = [];
      const bot = [];
      const N = 72;
      for (let i = 0; i <= N; i++) {
        const x = -HALF_L + (2 * HALF_L * i) / N;
        top.push(new THREE.Vector2(x, deckTopY(x)));
        bot.push(new THREE.Vector2(x, deckTopY(x) - DECK_T));
      }
      const deck = extrudedPanel({
        outerPoints: top.concat(bot.reverse()), holes: [], depth: DECK_W, mat: M.stone,
      });
      group.add(bake(deck));
      parts.push({
        id: 'qiao-mian',
        name: { zh: '桥面·辇道', en: 'Deck & Carriage Ramp' },
        pinyin: 'qiao mian nian dao',
        role: {
          zh: '自两岸缓缓升至主拱拱顶的行车面，路面荷载经填石传给券圈。',
          en: 'The carriage ramp rising from both banks to the crown; its load passes through the fill to the rings.',
        },
        layer: 'deck', family: 'stone', object: deck,
        explode: new THREE.Vector3(0, 1, 0), order: 13,
      });
    }

    /* ---------------------------------------------- 14 栏板 */
    {
      const panels = [];
      const xs = postStations();
      for (const s of [-1, 1]) {
        for (let i = 0; i < xs.length - 1; i++) {
          const x0 = xs[i] + 0.16;
          const x1 = xs[i + 1] - 0.16;
          const y0 = deckTopY(x0);
          const y1 = deckTopY(x1);
          const len = Math.hypot(x1 - x0, y1 - y0);
          const g = new THREE.BoxGeometry(len, 0.78, 0.3);
          const m = new THREE.Mesh(g, M.stone);
          m.position.set((x0 + x1) / 2, (y0 + y1) / 2 + 0.44, s * (DECK_W / 2 - 0.3));
          m.rotation.z = Math.atan2(y1 - y0, x1 - x0);
          m.castShadow = m.receiveShadow = true;
          panels.push(m);
        }
      }
      const rail = mergeMeshes(panels, M.stone);
      group.add(bake(rail));
      parts.push({
        id: 'lan-ban',
        name: { zh: '栏板', en: 'Parapet Panels' },
        pinyin: 'lan ban',
        role: {
          zh: '桥面两侧的石栏板，护住行人并与望柱共同界定辇道宽度。',
          en: 'Stone panels along both edges of the deck that guard the roadway together with the posts.',
        },
        layer: 'deck', family: 'stone', object: rail,
        explode: new THREE.Vector3(0, 0.6, 1), order: 14,
      });
    }

    /* ---------------------------------------------- 15 望柱 */
    {
      const posts = [];
      for (const s of [-1, 1]) {
        for (const x of postStations()) {
          const g = new THREE.BoxGeometry(0.3, 1.18, 0.3);
          const m = new THREE.Mesh(g, M.stoneDark);
          m.position.set(x, deckTopY(x) + 0.59, s * (DECK_W / 2 - 0.3));
          m.castShadow = m.receiveShadow = true;
          posts.push(m);
        }
      }
      const cols = mergeMeshes(posts, M.stoneDark);
      group.add(bake(cols));
      parts.push({
        id: 'wang-zhu',
        name: { zh: '望柱', en: 'Railing Posts' },
        pinyin: 'wang zhu',
        role: {
          zh: '栏板端头的立柱，把逐块栏板连成一道连续的石栏。',
          en: 'Posts at the panel ends that tie the parapet into one continuous stone balustrade.',
        },
        layer: 'deck', family: 'stone', object: cols,
        explode: new THREE.Vector3(0, 1, 0.5), order: 15,
      });
    }

    /* ---------------------------------------------- 16 腰铁 */
    {
      const clamps = [];
      const n = 14;
      for (let i = 0; i < n; i++) {
        // 落在拱石接缝处：t 取券石的整数分界
        const b = Math.round((i * (BLOCKS - 1)) / (n - 1));
        const t = -1 + (2 * b) / BLOCKS;
        const th = t * MAIN_PHI;
        const rr = MAIN_R + ringT(t) * 0.5;
        const g = new THREE.BoxGeometry(0.1, 0.62, 0.12);
        const m = new THREE.Mesh(g, M.timberDark);
        m.position.set(
          rr * Math.sin(th),
          MAIN_CY + rr * Math.cos(th) + SPRING_Y,
          RING_Z0 + RING_DEPTH * (RING_N - 0.5) + RING_DEPTH / 2 + 0.03,
        );
        m.rotation.z = -th;
        m.castShadow = true;
        clamps.push(m);
      }
      const irons = mergeMeshes(clamps, M.timberDark);
      group.add(bake(irons));
      parts.push({
        id: 'yao-tie',
        name: { zh: '腰铁', en: 'Iron Cramps' },
        pinyin: 'yao tie',
        role: {
          zh: '嵌在相邻拱石接缝处的铁件，把并列券圈互相拉结成整体。',
          en: 'Iron pieces set in the joints between voussoirs, binding the parallel rings into one body.',
        },
        layer: 'mainarch', family: 'other', object: irons,
        explode: new THREE.Vector3(0, 0, 1), order: 16,
      });
    }

    /* ---------------------------------------------- 受力箭头 */
    forces.push(
      {
        id: 'load-deck',
        from: V(0, 13.4, 0), to: V(0, 10.2, 0),
        label: { zh: '桥面竖向荷载压向拱顶', en: 'Deck load pressed down onto the crown' },
        kind: 'load',
      },
      {
        id: 'thrust-left',
        from: V(-18.5, 1.7, 0), to: V(-25.0, 1.3, 0),
        label: { zh: '左拱脚水平推力', en: 'Horizontal thrust at the left springing' },
        kind: 'thrust',
      },
      {
        id: 'thrust-right',
        from: V(18.5, 1.7, 0), to: V(25.0, 1.3, 0),
        label: { zh: '右拱脚水平推力', en: 'Horizontal thrust at the right springing' },
        kind: 'thrust',
      },
      {
        id: 'reaction-left',
        from: V(-19.3, -1.8, 0), to: V(-19.3, 1.3, 0),
        label: { zh: '左桥台地基反力', en: 'Ground reaction under the left abutment' },
        kind: 'reaction',
      },
      {
        id: 'reaction-right',
        from: V(19.3, -1.8, 0), to: V(19.3, 1.3, 0),
        label: { zh: '右桥台地基反力', en: 'Ground reaction under the right abutment' },
        kind: 'reaction',
      },
      {
        id: 'flow-main',
        from: V(0, 0.7, -15), to: V(0, 0.7, 15),
        label: { zh: '水流经主拱下泄', en: 'River water discharging under the main arch' },
        kind: 'flow',
      },
      {
        id: 'flow-shoulder',
        from: V(-26.3, 2.2, -7), to: V(-26.3, 2.2, 7),
        label: { zh: '洪水经敞肩小拱下泄', en: 'Flood water discharging through the shoulder arch' },
        kind: 'flow',
      },
    );

    return { group, parts, forces };
  },
};

// 由 QA 脚本静态检查契约一致性
