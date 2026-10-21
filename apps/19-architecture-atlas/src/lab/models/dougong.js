/**
 * 斗栱组 / Dougong Bracket Set
 *
 * 清式「单翘单昂五踩」柱头科的教学示意。
 * 以「斗口」(doukou) 为基本模数 d = 0.2 单位。
 *
 * 坐标约定：X = 面阔方向（左右，栱与檩沿此方向）
 *           Z = 进深方向（前后，翘/昂/枋沿此方向；+Z 为檐外）
 *           Y = 竖直向上
 *
 * 术语来源：上海市绿化和市容管理局《中國古建筑的细节之美—斗栱(二)》，
 *           学习强国《中国古建筑中的科技与智慧(三)》。
 */
import * as THREE from 'three';
import { dou, gong, qiao, ang, purlin } from '../core/geo.js';

const D = 0.2; // 斗口

export default {
  id: 'dougong',
  title: { zh: '斗栱组', en: 'Dougong Bracket Set' },
  pinyin: 'dou gong zu',
  subtitle: {
    zh: '清式单翘单昂五踩柱头科 · 层叠出跳的木制节点',
    en: 'Qing-style single-gong single-ang, five-step column-head set',
  },
  summary: {
    zh: '斗栱是中国木构屋檐下的一整套叠木节点：方木块「斗」承托短枋木「栱」，栱再层层向外挑出，把屋檐深远地伸到柱心之外。它原本是真正的承重结构——荷载一级级传到柱上；明清以后逐渐缩小，主要剩下装饰作用。',
    en: 'Dougong is a layered timber bracket set under the eaves. Square blocks called "dou" carry short arms called "gong", which project outward in steps and carry the deep overhanging roof. It was genuinely structural: loads were relayed step by step down to the column. From the Ming and Qing dynasties onward it shrank and became mainly decorative.',
  },
  loadPath: {
    zh: '屋面 → 椽 → 挑檐枋 → 厢栱 → 十八斗 → 外檐万栱 → 十八斗 → 正心万栱 → 十八斗 → 正心瓜栱 → 坐斗 → 柱',
    en: 'Roof → rafters → eave tie → eave gong → dou blocks → outer upper gong → dou blocks → central upper gong → dou blocks → central lower gong → great block → column',
  },
  era: {
    zh: '唐宋成熟，明清渐变为装饰',
    en: 'Mature in Tang–Song, decorative from Ming–Qing',
  },
  region: {
    zh: '官式建筑：宫殿、坛庙',
    en: 'Official architecture: palaces, temples',
  },
  scaleNote: {
    zh: '教学示意，非施工/工程模型；斗口比例与出跳数已简化，前后对称做法只详列檐外一侧。',
    en: 'Teaching diagram — not a construction or engineering model; doukou proportions and step counts are simplified, and only the eave side of the symmetric set is detailed.',
  },
  // 史实参照：条目出处为 17-architecture-research/catalog.json
  catalogRefs: [
    { id: 'c01-nanchan-main-hall', name: { zh: '南禅寺大殿', en: 'Main Hall, Nanchan Temple' }, source: '17-architecture-research/catalog.json · c01-nanchan-main-hall' },
    { id: 'c02-foguang-east-hall', name: { zh: '佛光寺东大殿', en: 'East Hall, Foguang Temple' }, source: '17-architecture-research/catalog.json · c02-foguang-east-hall' },
    { id: 'c09-forbidden-city-hall', name: { zh: '故宫太和殿', en: 'Hall of Supreme Harmony, Forbidden City' }, source: '17-architecture-research/catalog.json · c09-forbidden-city-hall' },
  ],
  camera: { position: [3.4, 2.5, 3.9], target: [0, 1.45, 0.1] },

  layers: [
    { id: 'base', label: { zh: '柱与柱础', en: 'Column & Base' } },
    { id: 'dou', label: { zh: '斗', en: 'Dou Blocks' }, hint: { zh: '层叠传力的方形垫块', en: 'Square blocks that relay load' } },
    { id: 'gong', label: { zh: '栱', en: 'Gong Arms' }, hint: { zh: '横向短枋，两端做卷杀', en: 'Transverse arms with scrolled ends' } },
    { id: 'ang', label: { zh: '翘与昂', en: 'Cantilevers & Ang' } },
    { id: 'head', label: { zh: '耍头与枋', en: 'Scantling & Ties' } },
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

    /* ---------------------------------------------------------- 柱与柱础 */
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.10, 0.54), M.stone,
    );
    plinth.position.set(0, 0.05, 0);
    plinth.castShadow = plinth.receiveShadow = true;
    add(plinth, {
      id: 'zhu-chui',
      name: { zh: '柱础', en: 'Column Base' },
      pinyin: 'zhu chui',
      role: { zh: '石制柱脚，既传力又隔断地气湿气，保护柱脚不腐。', en: 'A stone plinth that spreads load and keeps ground moisture away from the timber foot.' },
      layer: 'base', family: 'stone', object: plinth,
      explode: new THREE.Vector3(0, -1, 0), order: 0,
    });

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.165, 0.175, 0.50, 16), M.timber,
    );
    column.position.set(0, 0.35, 0);
    column.castShadow = column.receiveShadow = true;
    add(column, {
      id: 'zhu',
      name: { zh: '柱', en: 'Column' },
      pinyin: 'zhu',
      role: { zh: '把斗栱传来的全部竖向荷载送入柱础与地基，是构架的最终受力点。', en: 'Carries every vertical load from the bracket set down into the plinth and ground.' },
      layer: 'base', family: 'wood', object: column,
      explode: new THREE.Vector3(0, -1, 0), order: 1,
    });

    /* -------------------------------------------------------------- 坐斗 */
    const zdou = dou({ w: 0.60, h: 0.40, d: 0.60, earsAxis: 'z', mat: M.timberDark });
    zdou.position.set(0, 0.80, 0);
    add(zdou, {
      id: 'zuo-dou',
      name: { zh: '坐斗', en: 'Great Block' },
      pinyin: 'zuo dou',
      role: { zh: '整攒斗栱最下层的大斗，安在柱头上，用十字形卯口接纳正心瓜栱与翘。', en: 'The lowest and largest block of the set; it sits on the column head and receives the central gong and the cantilever in a cross-shaped mortise.' },
      layer: 'dou', family: 'wood', object: zdou,
      explode: new THREE.Vector3(0, -1, 0), order: 2,
    });

    /* ------------------------------------------------------ 正心瓜栱 / 万栱 */
    const zxgong = gong({ length: 1.50, height: 0.28, thickness: 0.20, mat: M.timber });
    zxgong.position.set(0, 1.13, 0);
    add(zxgong, {
      id: 'zhengxin-guagong',
      name: { zh: '正心瓜栱', en: 'Central Lower Gong' },
      pinyin: 'zheng xin gua gong',
      role: { zh: '位于柱头中线上的最短横栱，把荷载从坐斗传向两侧的十八斗。', en: 'The shortest transverse arm on the column axis; it passes the load from the great block out to the dou blocks at either end.' },
      layer: 'gong', family: 'wood', object: zxgong,
      explode: new THREE.Vector3(0, 1, 0), order: 3,
    });

    const zxwanggong = gong({ length: 1.90, height: 0.28, thickness: 0.20, mat: M.timberLight });
    zxwanggong.position.set(0, 1.59, 0);
    add(zxwanggong, {
      id: 'zhengxin-wanggong',
      name: { zh: '正心万栱', en: 'Central Upper Gong' },
      pinyin: 'zheng xin wan gong',
      role: { zh: '正心栱之上更长的一根横栱，两端压在十八斗上，是整攒斗栱的骨干。', en: 'A longer transverse arm above the lower one; its ends bear on the dou blocks and it is the backbone of the set.' },
      layer: 'gong', family: 'wood', object: zxwanggong,
      explode: new THREE.Vector3(0, 1, 0), order: 5,
    });

    /* ------------------------------------------------------------ 十八斗 */
    const shiba = new THREE.Group();
    // 每一排横栱由左右两个十八斗承托；y = 该排十八斗中心高度
    const douRows = [
      { y: 1.36, z: 0.00, x: 0.62 },   // 承正心万栱（正心，只在 z=0 一排）
      { y: 1.81, z: 0.10, x: 0.82 },   // 承外檐瓜栱
      { y: 2.23, z: 0.20, x: 0.90 },   // 承外檐万栱
      { y: 2.65, z: 0.30, x: 0.98 },   // 承厢栱
    ];
    for (const row of douRows) {
      for (const sx of [-1, 1]) {
        const s = dou({ w: 0.26, h: 0.18, d: 0.20, earsAxis: 'z', mat: M.timberDark });
        s.position.set(sx * row.x, row.y, row.z);
        shiba.add(s);
      }
    }
    // 里侧（背檐方向）镜像：除正心一排外，其余三排向 -Z 对称
    for (const row of douRows.slice(1)) {
      for (const sx of [-1, 1]) {
        const s = dou({ w: 0.26, h: 0.18, d: 0.20, earsAxis: 'z', mat: M.timberDark });
        s.position.set(sx * row.x, row.y, -row.z);
        shiba.add(s);
      }
    }
    add(shiba, {
      id: 'shiba-dou',
      name: { zh: '十八斗', en: 'Eighteen-Dou Blocks' },
      pinyin: 'shi ba dou',
      role: { zh: '小斗，形如半银锭，用榫头栽入栱头，承托上一层栱或枋。', en: 'Small blocks, half a silver-ingot in shape, pegged into the arm ends to carry the level above.' },
      layer: 'dou', family: 'wood', object: shiba,
      explode: new THREE.Vector3(0, 1, 0), order: 4,
    });

    /* ---------------------------------------------------------- 翘 与 昂 */
    const qiaos = new THREE.Group();
    for (const s of [1, -1]) {
      const q = qiao({ length: 0.86, height: 0.26, thickness: 0.18, mat: M.timberLight });
      q.position.set(0, 0.94, s * 0.15);
      qiaos.add(q);
    }
    add(qiaos, {
      id: 'qiao',
      name: { zh: '翘', en: 'Cantilever Arm' },
      pinyin: 'qiao',
      role: { zh: '纵向挑出的短木，第一跳即由此挑出，宋式称华栱。', en: 'A short longitudinal cantilever that makes the first projection; in Song terminology a huagong.' },
      layer: 'ang', family: 'wood', object: qiaos,
      explode: new THREE.Vector3(0, 0.2, 1), order: 4,
    });

    const angs = new THREE.Group();
    for (const s of [1, -1]) {
      const a = ang({ length: 1.60, w: 0.22, h: 0.26, drop: 0.50, mat: M.timber });
      a.position.set(0, 1.10, s * 0.30);
      // 里侧：绕 Y 轴转 180°（不用负缩放，避免法线翻转）
      if (s < 0) a.rotation.y = Math.PI;
      angs.add(a);
    }
    add(angs, {
      id: 'ang',
      name: { zh: '昂', en: 'Ang' },
      pinyin: 'ang',
      role: { zh: '斜置的挑出构件，前端下斜成昂嘴、尾端上翘，是把檐口挑得深远的受力主角。', en: 'A raking cantilever whose front drops into an angled beak and whose tail rises — the member that truly pushes the eave outward.' },
      layer: 'ang', family: 'wood', object: angs,
      explode: new THREE.Vector3(0, 0.2, 1), order: 6,
    });

    /* -------------------------------------------------------- 外檐三排栱 */
    const mkGongRow = (length, height, thickness, z, y, mat) => {
      const g = new THREE.Group();
      const gg = gong({ length, height, thickness, mat });
      gg.position.set(0, y, z);
      g.add(gg);
      const back = gong({ length, height, thickness, mat });
      back.position.set(0, y, -z);
      g.add(back);
      return g;
    };

    const waiyinGua = mkGongRow(1.75, 0.26, 0.18, 0.10, 2.02, M.timber);
    add(waiyinGua, {
      id: 'waiyin-guagong',
      name: { zh: '外檐瓜栱', en: 'Outer Lower Gong' },
      pinyin: 'wai yin gua gong',
      role: { zh: '第一跳外侧的横栱，跨在昂上，把外挑部分的力量交回斗栱内部。', en: 'The first outer transverse arm; it spans over the ang and returns the outward push into the set.' },
      layer: 'gong', family: 'wood', object: waiyinGua,
      explode: new THREE.Vector3(0, 1, 0.5), order: 7,
    });

    const waiyinWan = mkGongRow(2.05, 0.26, 0.18, 0.20, 2.44, M.timberLight);
    add(waiyinWan, {
      id: 'waiyin-wanggong',
      name: { zh: '外檐万栱', en: 'Outer Upper Gong' },
      pinyin: 'wai yin wan gong',
      role: { zh: '第二跳横栱，比瓜栱更长更外，承托最上一排厢栱。', en: 'The second outer arm, longer and further out, carrying the topmost eave gongs.' },
      layer: 'gong', family: 'wood', object: waiyinWan,
      explode: new THREE.Vector3(0, 1, 0.5), order: 8,
    });

    const xiangGong = mkGongRow(2.25, 0.24, 0.16, 0.30, 2.86, M.timber);
    add(xiangGong, {
      id: 'xiang-gong',
      name: { zh: '厢栱', en: 'Eave Gong' },
      pinyin: 'xiang gong',
      role: { zh: '最外一排横栱，宋式称令栱，上面直接承挑檐枋与檐椽。', en: 'The outermost transverse arm, called linggong in Song terminology; it carries the eave tie and the eave rafters directly.' },
      layer: 'gong', family: 'wood', object: xiangGong,
      explode: new THREE.Vector3(0, 1, 0.5), order: 9,
    });

    /* ---------------------------------------------------------- 耍头 蚂蚱头 */
    const shuatou = gong({ length: 1.55, height: 0.24, thickness: 0.18, mat: M.timber });
    shuatou.position.set(0, 1.02, 0.42);
    add(shuatou, {
      id: 'shuatou',
      name: { zh: '耍头', en: 'Scantling' },
      pinyin: 'shua tou',
      role: { zh: '与昂平行的横木，穿过昂身而出挑，替昂分担檐口重量。', en: 'A transverse scantling parallel to the ang and crossing it, sharing the eave load with it.' },
      layer: 'head', family: 'wood', object: shuatou,
      explode: new THREE.Vector3(0, 0, 1), order: 7,
    });

    const mayatou = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.22), M.timberDark);
    mayatou.position.set(0.72, 1.02, 0.42);
    mayatou.rotation.z = 0.22;
    add(mayatou, {
      id: 'mayatou',
      name: { zh: '蚂蚱头', en: 'Mantis Head' },
      pinyin: 'ma zha tou',
      role: { zh: '耍头端头雕成的蚂蚱形装饰，兼有护头作用。', en: 'The mantis-shaped carving at the end of the scantling, decorative but also shielding the vulnerable head of the timber.' },
      layer: 'head', family: 'wood', object: mayatou,
      explode: new THREE.Vector3(1, 0.2, 0.6), order: 8,
    });

    /* -------------------------------------------------------------- 枋 */
    const zxFang = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.40), M.timberDark);
    zxFang.position.set(0, 1.82, 0);
    add(zxFang, {
      id: 'zhengxin-fang',
      name: { zh: '正心枋', en: 'Central Tie Beam' },
      pinyin: 'zheng xin fang',
      role: { zh: '沿柱头中线纵向贯通各攒斗栱，把一排斗栱连成整体。', en: 'Runs longitudinally along the column axis, tying a whole row of bracket sets into one frame.' },
      layer: 'head', family: 'wood', object: zxFang,
      explode: new THREE.Vector3(0, 1, 0), order: 6,
    });

    const cyFang = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 2.70), M.timberDark);
    cyFang.position.set(0, 2.98, 0.30);
    add(cyFang, {
      id: 'chuiyan-fang',
      name: { zh: '挑檐枋', en: 'Eave Tie Beam' },
      pinyin: 'tiao yan fang',
      role: { zh: '檐口最外的一道纵枋，直接承托檐椽，把屋面重量交回斗栱。', en: 'The outermost longitudinal tie at the eave; it receives the eave rafters and returns the roof weight to the brackets.' },
      layer: 'head', family: 'wood', object: cyFang,
      explode: new THREE.Vector3(0, 0.4, 1), order: 10,
    });

    /* ---------------------------------------------------------- 檐椽 */
    const rafters = new THREE.Group();
    for (let i = -3; i <= 3; i++) {
      const r = purlin({ length: 1.20, r: 0.045, round: true, mat: M.timberLight });
      r.position.set(i * 0.30, 3.02 - Math.abs(i) * 0.012, 0.92);
      r.rotation.y = 0;
      rafters.add(r);
    }
    add(rafters, {
      id: 'rafter',
      name: { zh: '檐椽', en: 'Eave Rafters' },
      pinyin: 'yan chuan',
      role: { zh: '铺在挑檐枋上的细圆木，承托望板与瓦屋面，是屋面荷载的第一站。', en: 'Thin poles laid on the eave tie that carry the boarding and the tiled roof — the first stop for roof load.' },
      layer: 'head', family: 'wood', object: rafters,
      explode: new THREE.Vector3(0, 0.6, 1), order: 11,
    });

    /* ------------------------------------------------------------ 受力箭头 */
    forces.push(
      {
        id: 'load-roof',
        from: [0, 3.30, 0.85], to: [0, 3.02, 0.85],
        label: { zh: '屋面荷载压在檐椽上', en: 'Roof load presses on the eave rafters' },
        kind: 'load',
      },
      {
        id: 'load-fang',
        from: [0, 3.00, 0.30], to: [0, 2.80, 0.30],
        label: { zh: '挑檐枋把荷载交给厢栱', en: 'The eave tie hands the load to the eave gong' },
        kind: 'load',
      },
      {
        id: 'load-wan',
        from: [0.88, 2.40, 0.20], to: [0.88, 2.05, 0.20],
        label: { zh: '荷载沿栱身逐层下传', en: 'Load steps down through the arm stack' },
        kind: 'load',
      },
      {
        id: 'load-center',
        from: [0.55, 1.55, 0], to: [0.55, 1.20, 0],
        label: { zh: '正心栱把荷载汇向柱心', en: 'The central arm gathers load toward the column' },
        kind: 'load',
      },
      {
        id: 'thrust-ang',
        from: [0, 1.05, 0.72], to: [0, 0.92, 1.24],
        label: { zh: '昂向外下方挑出，产生水平推力', en: 'The ang pushes outward and down, creating horizontal thrust' },
        kind: 'thrust',
      },
      {
        id: 'tension-gong',
        from: [-0.62, 1.13, 0], to: [-0.16, 1.13, 0],
        label: { zh: '栱身受压并向内拉住两端', en: 'The arm is compressed and ties its two ends inward' },
        kind: 'tension',
      },
      {
        id: 'reaction-column',
        from: [0, 0.60, 0], to: [0, 0.22, 0],
        label: { zh: '柱与柱础把力送入地基', en: 'Column and plinth pass the force into the ground' },
        kind: 'reaction',
      },
    );

    return { group, parts, forces };
  },
};
