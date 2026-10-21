/**
 * 《渊甲拾遗者》 — the abyssal carapace harvester.
 *
 * An original machine design: a segmented, overlapping-armour deep-sea ore
 * harvester that works a hydrothermal vent field. It mills the basalt with a
 * flat spiral-bladed crown, swallows the slurry through a throat lined with
 * deflector vanes, and crawls on peristaltic waves — each segment gripping,
 * contracting, driving and relaxing in sequence.
 *
 * Layout along the X axis (scene units; 22.6 units == 760 m of machine):
 *
 *   [ milling crown + vanes + grapplers ]--- 18 driven carapace segments ---[ bladder + fan + hopper ]
 *      0.0                                  2.0                             20.0
 *
 * Every segment is a real assembly: overlapping carapace plates, a load keel,
 * a planetary reducer, hydraulic struts, photophore ducts, bioluminescent
 * gill vanes, heat vents and ventral anchor suckers.
 *
 * The module exposes:
 *   buildHarvester(params)  -> { root, update, parts, dispose, ... }
 */

import * as THREE from 'three';
import {
  merge,
  flangeRing,
  gearGeometry,
  hydraulicRam,
  conduitGeometry,
  ventGeometry,
  finGeometry,
} from './geometry.js';
import {
  spiralBlade,
  carapacePlate,
  deflectorVane,
  suckerPad,
  pressureBladder,
  hopperPod,
} from './abyssal.js';
import { makeRng } from './noise.js';
import { METRES_PER_UNIT, unitsToMetres } from './constants.js';

const TAU = Math.PI * 2;

/** Scene units -> real metres of the 760 m machine. */
export const UNITS_PER_METRE = METRES_PER_UNIT;

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

function tag(object3d, group, name) {
  object3d.userData.partGroup = group;
  if (name) object3d.userData.partName = name;
  return object3d;
}

/**
 * Build the complete harvester.
 *
 * @param {object} params  live parameter object (see params.js)
 * @param {object} assets  { carapaceMap, brushedMap } shared textures
 */
export function buildHarvester(params, assets) {
  const root = new THREE.Group();
  root.name = 'abyss-salvager';

  const rng = makeRng(20261019);

  // ---------------------------------------------------------------- materials
  const matCarapace = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(params.plateColor),
    roughness: 0.58,
    metalness: 0.16,
    clearcoat: 0.5,
    clearcoatRoughness: 0.34,
    bumpMap: assets.carapaceMap,
    bumpScale: 0.045,
    roughnessMap: assets.brushedMap,
    transparent: true,
    opacity: params.armorOpacity,
    side: THREE.DoubleSide,
  });
  const matCarapaceInner = matCarapace.clone();
  matCarapaceInner.color = new THREE.Color(params.plateColor).multiplyScalar(0.62);
  matCarapaceInner.roughness = 0.76;
  matCarapaceInner.clearcoat = 0.15;
  matCarapaceInner.bumpScale = 0.025;

  const matAlloy = new THREE.MeshStandardMaterial({
    color: 0x8f9aa4,
    roughness: params.metalRoughness,
    metalness: 0.9,
    roughnessMap: assets.brushedMap,
  });
  const matDark = new THREE.MeshStandardMaterial({
    color: 0x39434c,
    roughness: Math.min(1, params.metalRoughness + 0.24),
    metalness: 0.86,
  });
  const matRam = new THREE.MeshStandardMaterial({
    color: 0xbcc6cf,
    roughness: 0.11,
    metalness: 1.0,
  });
  const matGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color(params.accentColor),
    emissive: new THREE.Color(params.accentColor),
    emissiveIntensity: params.accentIntensity,
    roughness: 0.42,
    metalness: 0.1,
  });
  const matVent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(params.ventColor),
    emissive: new THREE.Color(params.ventColor),
    emissiveIntensity: 1.6,
    roughness: 0.6,
    metalness: 0.05,
  });
  const matLens = new THREE.MeshPhysicalMaterial({
    color: 0xa8e6ff,
    roughness: 0.06,
    metalness: 0,
    transmission: 0.85,
    thickness: 0.2,
    ior: 1.45,
    transparent: true,
    opacity: 0.8,
  });
  const matRubber = new THREE.MeshStandardMaterial({
    color: 0x1b2026,
    roughness: 0.94,
    metalness: 0.04,
  });

  const shellMaterials = [matCarapace, matCarapaceInner];
  const internalMaterials = [matAlloy, matDark, matRam, matRubber];

  // ------------------------------------------------------------------- head
  const headGroup = new THREE.Group();
  headGroup.name = 'head';
  tag(headGroup, PART_GROUPS.CROWN, 'head');

  const R = params.bodyRadius;

  // Milling crown: a flat disc rim, a hub, and a ring of spiral cutter blades.
  const crownBody = new THREE.Mesh(
    merge([
      (() => {
        const g = new THREE.CylinderGeometry(R * 1.02, R * 1.02, 0.16, 30, 1);
        g.rotateZ(Math.PI / 2);
        g.translate(0.08, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.TorusGeometry(R * 1.0, R * 0.07, 8, 30);
        g.rotateY(Math.PI / 2);
        g.translate(0.16, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.CylinderGeometry(R * 0.4, R * 0.4, 0.26, 20, 1);
        g.rotateZ(Math.PI / 2);
        g.translate(0.1, 0, 0);
        return g;
      })(),
      flangeRing({ count: 10, radius: R * 1.02, thickness: 0.045, height: 0.2, taper: 0.6 }),
    ]),
    matDark
  );
  crownBody.castShadow = true;
  crownBody.receiveShadow = true;
  tag(crownBody, PART_GROUPS.CROWN, 'crown-body');
  headGroup.add(crownBody);

  // Spiral cutter blades — the part that actually mills the basalt.
  const bladeBank = new THREE.Group();
  tag(bladeBank, PART_GROUPS.BLADE, 'blade-bank');
  for (let i = 0; i < params.bladeCount; i++) {
    const a = (i / params.bladeCount) * TAU;
    const blade = new THREE.Mesh(
      spiralBlade({
        r0: R * 0.42,
        r1: R * 0.99,
        height: R * 0.1,
        width: R * 0.34,
        sweep: 1.05,
      }),
      matRam
    );
    blade.rotation.x = -a;
    blade.position.set(-0.04, 0, 0);
    blade.castShadow = true;
    bladeBank.add(blade);
  }
  headGroup.add(bladeBank);

  // Ore teeth: carbide blocks standing proud of the crown rim.
  const teethGroup = new THREE.Group();
  tag(teethGroup, PART_GROUPS.BLADE, 'ore-teeth');
  for (let i = 0; i < params.bladeCount; i++) {
    const a = (i / params.bladeCount) * TAU + Math.PI / params.bladeCount;
    const tooth = new THREE.Mesh(
      merge([
        (() => {
          const g = new THREE.BoxGeometry(R * 0.16, R * 0.1, R * 0.07);
          return g;
        })(),
        (() => {
          const g = new THREE.ConeGeometry(R * 0.05, R * 0.13, 4);
          g.rotateZ(-Math.PI / 2);
          g.translate(R * 0.14, 0, 0);
          return g;
        })(),
      ]),
      matRam
    );
    tooth.position.set(-0.04, Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.02);
    tooth.rotation.x = -a;
    tooth.castShadow = true;
    teethGroup.add(tooth);
  }
  headGroup.add(teethGroup);

  // Intake throat behind the crown.
  const throat = new THREE.Mesh(
    merge([
      (() => {
        const g = new THREE.CylinderGeometry(R * 0.95, R * 0.55, 0.62, 26, 1, true);
        g.rotateZ(-Math.PI / 2);
        g.translate(0.5, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.TorusGeometry(R * 0.55, R * 0.05, 6, 24);
        g.rotateY(Math.PI / 2);
        g.translate(0.8, 0, 0);
        return g;
      })(),
    ]),
    matCarapaceInner
  );
  throat.castShadow = true;
  tag(throat, PART_GROUPS.CROWN, 'throat');
  headGroup.add(throat);

  // Slurry deflector vanes inside the throat.
  const vaneGroup = new THREE.Group();
  tag(vaneGroup, PART_GROUPS.VANE, 'vanes');
  for (let i = 0; i < params.vaneCount; i++) {
    const a = (i / params.vaneCount) * TAU;
    const vane = new THREE.Mesh(
      deflectorVane({ length: R * 1.0, width: R * 0.42, thickness: R * 0.05, curve: R * 0.26 }),
      matRam
    );
    vane.rotation.y = Math.PI / 2;
    vane.rotation.z = -0.35;
    const pivot = new THREE.Group();
    pivot.rotation.x = a;
    pivot.position.set(0.44, 0, 0);
    pivot.add(vane);
    vaneGroup.add(pivot);
  }
  headGroup.add(vaneGroup);

  // Neck: three sealing collars with a gasket bead.
  const neck = new THREE.Mesh(
    merge([
      (() => {
        const g = new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.22, 24, 1);
        g.rotateZ(Math.PI / 2);
        g.translate(0.98, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.CylinderGeometry(R * 0.92, R * 0.92, 0.2, 24, 1);
        g.rotateZ(Math.PI / 2);
        g.translate(1.26, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.CylinderGeometry(R * 0.88, R * 0.88, 0.22, 24, 1);
        g.rotateZ(Math.PI / 2);
        g.translate(1.54, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.TorusGeometry(R * 0.9, R * 0.035, 5, 24);
        g.rotateY(Math.PI / 2);
        g.translate(1.12, 0, 0);
        return g;
      })(),
    ]),
    matCarapace
  );
  neck.castShadow = true;
  neck.receiveShadow = true;
  tag(neck, PART_GROUPS.CARAPACE, 'neck');
  headGroup.add(neck);

  // Sonar mast + floodlight cluster.
  const sensorGroup = new THREE.Group();
  tag(sensorGroup, PART_GROUPS.SENSOR, 'sensor');
  const mast = new THREE.Mesh(
    merge([
      (() => {
        const g = new THREE.CylinderGeometry(R * 0.22, R * 0.28, 0.24, 12, 1);
        g.translate(1.5, R * 1.02, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.BoxGeometry(R * 0.52, R * 0.07, R * 0.09);
        g.translate(1.5, R * 1.16, 0);
        return g;
      })(),
    ]),
    matDark
  );
  sensorGroup.add(mast);
  for (let i = 0; i < 3; i++) {
    const lens = new THREE.Mesh(new THREE.SphereGeometry(R * 0.07, 12, 10), matLens);
    lens.position.set(1.5, R * 1.12, (i - 1) * R * 0.17);
    sensorGroup.add(lens);
  }
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(R * 0.055, 10, 8), matGlow);
  beacon.position.set(1.5, R * 1.24, 0);
  sensorGroup.add(beacon);
  headGroup.add(sensorGroup);

  // Ore grappler arms flanking the neck.
  const armGroup = new THREE.Group();
  tag(armGroup, PART_GROUPS.ARM, 'grapplers');
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const upper = new THREE.Mesh(
      merge([
        (() => {
          const g = new THREE.CylinderGeometry(R * 0.06, R * 0.06, R * 0.62, 8, 1);
          g.rotateZ(side * 0.9);
          g.translate(side * R * 0.24, -R * 0.24, 0);
          return g;
        })(),
      ]),
      matAlloy
    );
    arm.add(upper);
    const claw = new THREE.Group();
    claw.position.set(side * R * 0.42, -R * 0.5, 0);
    for (let f = 0; f < 3; f++) {
      const fa = (f / 3) * TAU;
      const finger = new THREE.Mesh(
        merge([
          (() => {
            const g = new THREE.BoxGeometry(R * 0.3, R * 0.035, R * 0.035);
            g.translate(R * 0.15, 0, 0);
            return g;
          })(),
          (() => {
            const g = new THREE.BoxGeometry(R * 0.12, R * 0.03, R * 0.03);
            g.rotateZ(-0.7);
            g.translate(R * 0.34, -R * 0.05, 0);
            return g;
          })(),
        ]),
        matRam
      );
      finger.rotation.x = fa;
      claw.add(finger);
    }
    arm.add(claw);
    arm.position.set(1.05, 0, 0);
    armGroup.add(arm);
  }
  headGroup.add(armGroup);

  root.add(headGroup);

  // --------------------------------------------------------------- segments
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'body';
  root.add(bodyGroup);

  const segments = [];
  const segLen = params.segmentLength;
  const radius = params.bodyRadius;

  for (let i = 0; i < params.segmentCount; i++) {
    const seg = new THREE.Group();
    seg.name = `segment-${i}`;
    seg.position.x = 2.0 + i * segLen;
    tag(seg, PART_GROUPS.CARAPACE, `segment-${i}`);

    // -- carapace ring (the structural shell under the plates)
    const ring = new THREE.Mesh(
      merge([
        (() => {
          const g = new THREE.CylinderGeometry(radius * 0.97, radius * 0.97, segLen * 0.88, 26, 1, true);
          g.rotateZ(Math.PI / 2);
          return g;
        })(),
        (() => {
          const g = new THREE.TorusGeometry(radius * 0.99, radius * 0.06, 7, 26);
          g.rotateY(Math.PI / 2);
          g.translate(-segLen * 0.43, 0, 0);
          return g;
        })(),
        (() => {
          const g = new THREE.TorusGeometry(radius * 0.99, radius * 0.06, 7, 26);
          g.rotateY(Math.PI / 2);
          g.translate(segLen * 0.43, 0, 0);
          return g;
        })(),
      ]),
      matCarapaceInner
    );
    ring.castShadow = true;
    ring.receiveShadow = true;
    tag(ring, PART_GROUPS.CARAPACE, `ring-${i}`);
    seg.add(ring);

    // -- overlapping carapace plates (the shingled armour)
    const plateGroup = new THREE.Group();
    tag(plateGroup, PART_GROUPS.CARAPACE, `plates-${i}`);
    const PLATES = 7;
    for (let k = 0; k < PLATES; k++) {
      const a = (k / PLATES) * TAU + (i % 2 ? Math.PI / PLATES : 0);
      const plate = new THREE.Mesh(
        carapacePlate({
          length: segLen * 1.22,
          width: radius * 0.62,
          thickness: radius * 0.07,
          arch: radius * 0.2,
        }),
        matCarapace
      );
      plate.position.set(
        (i + k) % 2 ? segLen * 0.12 : -segLen * 0.12,
        Math.cos(a) * radius * 0.92,
        Math.sin(a) * radius * 0.92
      );
      plate.rotation.x = -a;
      plate.castShadow = true;
      plate.receiveShadow = true;
      plateGroup.add(plate);
    }
    seg.add(plateGroup);

    // -- load keel beam
    const keel = new THREE.Mesh(
      merge([
        (() => {
          const g = new THREE.CylinderGeometry(radius * 0.15, radius * 0.15, segLen, 12, 1);
          g.rotateZ(Math.PI / 2);
          return g;
        })(),
        (() => {
          const g = new THREE.BoxGeometry(segLen * 0.24, radius * 0.86, radius * 0.18);
          g.translate(0, -radius * 0.18, 0);
          return g;
        })(),
      ]),
      matDark
    );
    keel.castShadow = true;
    tag(keel, PART_GROUPS.KEEL, `keel-${i}`);
    seg.add(keel);

    // -- planetary reducer (counter-rotating pair)
    const gearBig = new THREE.Mesh(
      gearGeometry({
        teeth: params.bladeCount + 6,
        radius: radius * 0.4,
        toothDepth: radius * 0.09,
        thickness: radius * 0.15,
        bore: radius * 0.1,
      }),
      matAlloy
    );
    gearBig.position.set(-segLen * 0.1, radius * 0.36, 0);
    gearBig.castShadow = true;
    tag(gearBig, PART_GROUPS.REDUCER, `reducer-big-${i}`);

    const gearSmall = new THREE.Mesh(
      gearGeometry({
        teeth: Math.max(6, Math.round((params.bladeCount + 6) * 0.55)),
        radius: radius * 0.22,
        toothDepth: radius * 0.065,
        thickness: radius * 0.13,
        bore: radius * 0.06,
      }),
      matDark
    );
    gearSmall.position.set(-segLen * 0.1 + radius * 0.58, radius * 0.36, 0);
    gearSmall.castShadow = true;
    tag(gearSmall, PART_GROUPS.REDUCER, `reducer-small-${i}`);

    const gearMount = new THREE.Mesh(
      (() => {
        const g = new THREE.BoxGeometry(radius * 0.28, radius * 0.15, radius * 0.46);
        g.translate(-segLen * 0.1, radius * 0.16, 0);
        return g;
      })(),
      matDark
    );
    seg.add(gearMount, gearBig, gearSmall);

    // -- hydraulic struts (dorsal + ventral)
    const strutGroup = new THREE.Group();
    tag(strutGroup, PART_GROUPS.STRUT, `struts-${i}`);
    const strutA = new THREE.Mesh(
      hydraulicRam({ length: segLen * 0.9, barrelRadius: radius * 0.1, rodRadius: radius * 0.045 }),
      matRam
    );
    strutA.position.set(0, -radius * 0.52, 0);
    strutA.castShadow = true;
    const strutB = new THREE.Mesh(
      hydraulicRam({ length: segLen * 0.9, barrelRadius: radius * 0.1, rodRadius: radius * 0.045 }),
      matRam
    );
    strutB.position.set(0, radius * 0.52, 0);
    strutB.castShadow = true;
    const strutMount = new THREE.Mesh(
      merge([
        (() => {
          const g = new THREE.BoxGeometry(radius * 0.18, radius * 0.84, radius * 0.18);
          g.translate(-segLen * 0.4, 0, 0);
          return g;
        })(),
        (() => {
          const g = new THREE.BoxGeometry(radius * 0.18, radius * 0.84, radius * 0.18);
          g.translate(segLen * 0.4, 0, 0);
          return g;
        })(),
      ]),
      matDark
    );
    strutGroup.add(strutMount, strutA, strutB);
    seg.add(strutGroup);

    // -- photophore ducts + bioluminescent gill vanes
    const photoGroup = new THREE.Group();
    tag(photoGroup, PART_GROUPS.PHOTOPHORE, `photophores-${i}`);
    for (const side of [-1, 1]) {
      const duct = new THREE.Mesh(
        conduitGeometry({
          length: segLen * 1.02,
          radius: radius * 0.04,
          wave: radius * 0.075,
          waveCount: 2,
        }),
        matGlow
      );
      duct.position.set(0, side * radius * 0.76, 0);
      photoGroup.add(duct);

      const gill = new THREE.Mesh(
        carapacePlate({
          length: segLen * 0.42,
          width: radius * 0.3,
          thickness: radius * 0.02,
          arch: radius * 0.16,
        }),
        matGlow
      );
      gill.position.set(segLen * 0.22, side * radius * 0.88, 0);
      gill.rotation.x = side > 0 ? Math.PI : 0;
      gill.rotation.z = side > 0 ? 0 : 0;
      photoGroup.add(gill);
    }
    // Segment index chip — a small emissive marker so every segment reads.
    const indexChip = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.38, radius * 0.05, radius * 0.07),
      matGlow
    );
    indexChip.position.set(0, radius * 1.0, 0);
    photoGroup.add(indexChip);
    seg.add(photoGroup);

    // -- hydrothermal heat vents along the dorsal ridge
    const ventGroup = new THREE.Group();
    tag(ventGroup, PART_GROUPS.HEATVENT, `vents-${i}`);
    for (let v = 0; v < 3; v++) {
      const a = (v / 3) * TAU + 0.35;
      const vent = new THREE.Mesh(
        ventGeometry({ radius: radius * 0.13, depth: radius * 0.09 }),
        matDark
      );
      vent.position.set(
        segLen * 0.16,
        Math.cos(a) * radius * 0.94,
        Math.sin(a) * radius * 0.94
      );
      vent.lookAt(vent.position.clone().multiplyScalar(2.2));
      vent.castShadow = true;
      ventGroup.add(vent);

      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(radius * 0.075, 12),
        matVent
      );
      glow.position.copy(vent.position).multiplyScalar(1.03);
      glow.lookAt(glow.position.clone().multiplyScalar(2.2));
      ventGroup.add(glow);
    }
    seg.add(ventGroup);

    // -- ventral anchor suckers
    const suckerGroup = new THREE.Group();
    tag(suckerGroup, PART_GROUPS.SUCKER, `suckers-${i}`);
    for (const side of [-1, 1]) {
      const sucker = new THREE.Mesh(
        suckerPad({ radius: radius * 0.22, height: radius * 0.09 }),
        matRubber
      );
      sucker.position.set(segLen * (side > 0 ? 0.22 : -0.22), -radius * 0.96, 0);
      suckerGroup.add(sucker);
    }
    seg.add(suckerGroup);

    bodyGroup.add(seg);
    segments.push({
      group: seg,
      ring,
      plateGroup,
      keel,
      gears: [gearBig, gearSmall],
      struts: [strutA, strutB],
      gills: photoGroup,
      index: i,
    });
  }

  // ------------------------------------------------------------------- tail
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  tag(tailGroup, PART_GROUPS.FAN, 'tail');
  const tailX = 2.0 + params.segmentCount * segLen;

  // Pressure bladder.
  const bladder = new THREE.Mesh(
    pressureBladder({ length: 1.3, radius: radius * 0.82 }),
    matCarapaceInner
  );
  bladder.position.set(tailX + 0.66, 0, 0);
  bladder.castShadow = true;
  bladder.receiveShadow = true;
  tag(bladder, PART_GROUPS.FAN, 'bladder');
  tailGroup.add(bladder);

  const bladderRing = new THREE.Mesh(
    flangeRing({ count: 8, radius: radius * 0.86, thickness: 0.04, height: 0.16, taper: 0.6 }),
    matAlloy
  );
  bladderRing.position.set(tailX + 0.1, 0, 0);
  tag(bladderRing, PART_GROUPS.FAN, 'bladder-ring');
  tailGroup.add(bladderRing);

  // Caudal fan.
  const fanGroup = new THREE.Group();
  tag(fanGroup, PART_GROUPS.FAN, 'fan');
  for (let f = 0; f < params.tailBladeCount; f++) {
    const a = (f / params.tailBladeCount) * TAU;
    const fin = new THREE.Mesh(
      finGeometry({ length: 1.15, rootChord: 0.58, tipChord: 0.18, thickness: 0.05, sweep: 0.32 }),
      matCarapace
    );
    fin.position.set(tailX + 1.55, 0, 0);
    fin.castShadow = true;
    const pivot = new THREE.Group();
    pivot.rotation.x = a;
    pivot.add(fin);
    fanGroup.add(pivot);
  }
  tailGroup.add(fanGroup);

  // Thruster ring with a glowing vent.
  const thruster = new THREE.Mesh(
    merge([
      (() => {
        const g = new THREE.CylinderGeometry(radius * 0.3, radius * 0.2, 0.3, 16, 1);
        g.rotateZ(-Math.PI / 2);
        g.translate(tailX + 2.32, 0, 0);
        return g;
      })(),
      (() => {
        const g = new THREE.TorusGeometry(radius * 0.3, radius * 0.05, 6, 18);
        g.rotateY(Math.PI / 2);
        g.translate(tailX + 2.24, 0, 0);
        return g;
      })(),
    ]),
    matDark
  );
  thruster.castShadow = true;
  tag(thruster, PART_GROUPS.FAN, 'thruster');
  tailGroup.add(thruster);

  const thrusterGlow = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.15, 16),
    matGlow
  );
  thrusterGlow.rotation.y = Math.PI / 2;
  thrusterGlow.position.set(tailX + 2.46, 0, 0);
  tag(thrusterGlow, PART_GROUPS.PHOTOPHORE, 'thruster-glow');
  tailGroup.add(thrusterGlow);

  // Ventral ore hopper with a lit fill window.
  const hopperGroup = new THREE.Group();
  tag(hopperGroup, PART_GROUPS.HOPPER, 'hopper');
  const hopper = new THREE.Mesh(
    hopperPod({ length: 1.5, width: radius * 1.05, height: radius * 0.75 }),
    matCarapace
  );
  hopper.position.set(tailX + 1.1, -radius * 0.92, 0);
  hopper.castShadow = true;
  tag(hopper, PART_GROUPS.HOPPER, 'hopper-pod');
  hopperGroup.add(hopper);

  const hopperWindow = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, radius * 0.18, radius * 0.05),
    matGlow
  );
  hopperWindow.position.set(tailX + 1.1, -radius * 0.92, radius * 0.3);
  tag(hopperWindow, PART_GROUPS.HOPPER, 'hopper-window');
  hopperGroup.add(hopperWindow);
  tailGroup.add(hopperGroup);

  root.add(tailGroup);

  // --------------------------------------------------- annotation anchors
  const anchors = new Map();
  const addAnchor = (id, obj) => {
    const marker = new THREE.Object3D();
    marker.position.copy(obj);
    root.add(marker);
    anchors.set(id, marker);
  };
  addAnchor('crown', new THREE.Vector3(0.12, radius * 0.4, radius * 0.5));
  addAnchor('blade', new THREE.Vector3(0.1, radius * 0.8, radius * 0.6));
  addAnchor('vane', new THREE.Vector3(0.5, radius * 0.35, radius * 0.35));
  addAnchor('arm', new THREE.Vector3(1.2, -radius * 0.5, radius * 0.6));
  addAnchor('sensor', new THREE.Vector3(1.5, radius * 1.2, 0));
  addAnchor('carapace', new THREE.Vector3(2.6, radius, 0));
  addAnchor('keel', new THREE.Vector3(2.0 + segLen * 1.4, -radius * 0.3, -radius * 0.3));
  addAnchor('reducer', new THREE.Vector3(2.0 + segLen * 2.8, radius * 0.45, radius * 0.45));
  addAnchor('strut', new THREE.Vector3(2.0 + segLen * 4.1, -radius * 0.55, 0));
  addAnchor('photophore', new THREE.Vector3(2.0 + segLen * 5.4, radius * 0.8, 0));
  addAnchor('heatvent', new THREE.Vector3(2.0 + segLen * 6.7, radius * 0.5, radius * 0.8));
  addAnchor('sucker', new THREE.Vector3(2.0 + segLen * 8.0, -radius * 0.95, 0));
  addAnchor('hopper', new THREE.Vector3(tailX + 1.1, -radius * 1.0, radius * 0.3));
  addAnchor('fan', new THREE.Vector3(tailX + 1.7, radius * 0.5, radius * 0.4));

  // ---------------------------------------------------------- explode plan
  const shellChildren = [];
  root.traverse((o) => {
    if (o.isMesh && o.userData.partGroup) shellChildren.push(o);
  });

  const axisLen = tailX + 2.6;

  function applyExplode(t) {
    for (const child of shellChildren) {
      const g = child.userData.partGroup;
      if (!child.userData.home) {
        child.userData.home = child.position.clone();
        child.userData.homeQuat = child.quaternion.clone();
      }
      const home = child.userData.home;
      const homeQuat = child.userData.homeQuat;

      if (t <= 0.0001) {
        child.position.copy(home);
        child.quaternion.copy(homeQuat);
        continue;
      }

      // Push each part radially away from the machine's central axis and
      // separate the drive train along the body axis.
      const axisPoint = new THREE.Vector3(home.x, 0, 0);
      const radial = home.clone().sub(axisPoint);
      radial.y *= 2.0;
      radial.z *= 2.0;
      if (radial.lengthSq() < 1e-6) radial.set(0, 1, 0);
      radial.normalize();

      let dir;
      let amount = 0.9;
      switch (g) {
        case PART_GROUPS.CARAPACE:
          dir = radial.clone().multiplyScalar(1.55);
          amount = 1.2;
          break;
        case PART_GROUPS.STRUT:
          dir = radial.clone().multiplyScalar(-0.85);
          amount = 0.72;
          break;
        case PART_GROUPS.REDUCER:
          dir = radial.clone().multiplyScalar(0.7);
          amount = 0.95;
          break;
        case PART_GROUPS.PHOTOPHORE:
          dir = radial.clone().multiplyScalar(1.25);
          amount = 0.9;
          break;
        case PART_GROUPS.HEATVENT:
          dir = radial.clone().multiplyScalar(1.9);
          amount = 1.05;
          break;
        case PART_GROUPS.KEEL:
          dir = new THREE.Vector3(0, -1, 0);
          amount = 0.6;
          break;
        case PART_GROUPS.VANE:
          dir = radial.clone().multiplyScalar(1.9);
          amount = 1.25;
          break;
        case PART_GROUPS.BLADE:
          dir = radial.clone().multiplyScalar(2.1);
          amount = 1.35;
          break;
        case PART_GROUPS.ARM:
          dir = radial.clone().multiplyScalar(1.7);
          amount = 1.15;
          break;
        case PART_GROUPS.SUCKER:
          dir = new THREE.Vector3(0, -1, 0).multiplyScalar(1.6);
          amount = 1.1;
          break;
        case PART_GROUPS.FAN:
          dir = radial.clone().multiplyScalar(1.6);
          amount = 1.15;
          break;
        case PART_GROUPS.HOPPER:
          dir = new THREE.Vector3(0, -1, 0).multiplyScalar(1.4);
          amount = 1.0;
          break;
        default:
          dir = radial.clone();
          amount = 0.9;
      }

      const segIdx = child.userData.segmentIndex;
      const axial = segIdx === undefined ? 0 : (segIdx / Math.max(1, params.segmentCount - 1) - 0.5) * 2;

      child.position.copy(home).addScaledVector(dir, amount * t * 1.35);
      child.position.x += axial * t * 0.55 * segLen;
    }
  }

  // ----------------------------------------------------------------- x-ray
  function applyXray(on) {
    for (const m of shellMaterials) {
      m.transparent = true;
      m.opacity = on ? 0.12 : params.armorOpacity;
      m.depthWrite = !on;
      m.needsUpdate = true;
    }
    for (const m of internalMaterials) {
      m.emissive = m.emissive || new THREE.Color();
      if (on) {
        m.emissive.set(params.accentColor);
        m.emissiveIntensity = 0.32;
      } else {
        m.emissive.set(0x000000);
        m.emissiveIntensity = 1;
      }
      m.needsUpdate = true;
    }
  }

  // ----------------------------------------------------------------- cycle
  // Four-beat peristaltic crawl: 固着 GRIP -> 收束 CONTRACT -> 推进 DRIVE
  // -> 释压 RELAX. The wave travels head -> tail.
  const BEAT_LABELS = [
    '固着 GRIP',
    '收束 CONTRACT',
    '推进 DRIVE',
    '释压 RELAX',
  ];
  const state = {
    phase: 0,
    beat: 0,
    beatLabel: BEAT_LABELS[0],
  };

  function update(dt, elapsed) {
    const speed = params.gaitEnabled ? params.gaitSpeed : 0;
    state.phase = (state.phase + dt * speed * 0.42) % 1;
    const beatFloat = state.phase * 4;
    state.beat = Math.floor(beatFloat) % 4;
    state.beatLabel = BEAT_LABELS[state.beat];

    const n = segments.length;
    for (let i = 0; i < n; i++) {
      const seg = segments[i];
      const p = (state.phase - (i / n) * 0.55 + 1) % 1;
      const wave = Math.sin(p * TAU);

      // Lateral undulation of the body.
      const lateral = wave * 0.32 * params.undulation * (i / n);
      seg.group.position.z = lateral;
      seg.group.rotation.y = wave * 0.11 * params.undulation * (i / n);
      seg.group.position.y = Math.abs(wave) * 0.05 * params.undulation;

      // Peristaltic contraction: the segment shortens and fattens as it grips.
      const contract = Math.max(0, Math.cos(p * TAU)) * 0.5 + 0.5;
      const squeeze = 1 - contract * 0.15;
      seg.group.scale.set(squeeze, 1 + contract * 0.05, 1 + contract * 0.05);

      // Reducers counter-rotate.
      seg.gears[0].rotation.x = elapsed * 1.6 * (params.gaitEnabled ? 1 : 0.15);
      seg.gears[1].rotation.x = -elapsed * 2.4 * (params.gaitEnabled ? 1 : 0.15);

      // Struts stroke in opposition.
      const stroke = contract * 0.15;
      seg.struts[0].position.z = -stroke;
      seg.struts[1].position.z = stroke;
    }

    // The crown mills whenever the machine is powered.
    bladeBank.rotation.x = elapsed * (params.gaitEnabled ? 1.9 * params.gaitSpeed : 0.18);
    crownBody.rotation.x = elapsed * (params.gaitEnabled ? 1.9 * params.gaitSpeed : 0.18);
    // The tail fan idles.
    fanGroup.rotation.x = Math.sin(elapsed * 0.6) * 0.12;
  }

  // ------------------------------------------------------------- resources
  const geometries = [];
  root.traverse((o) => {
    if (o.isMesh) geometries.push(o.geometry);
  });

  function dispose() {
    for (const g of geometries) g.dispose();
    for (const m of [
      matCarapace,
      matCarapaceInner,
      matAlloy,
      matDark,
      matRam,
      matGlow,
      matVent,
      matLens,
      matRubber,
    ]) {
      m.dispose();
    }
  }

  return {
    root,
    headGroup,
    bodyGroup,
    tailGroup,
    segments,
    anchors,
    state,
    materials: {
      panel: matCarapace,
      panelInner: matCarapaceInner,
      steel: matAlloy,
      darkSteel: matDark,
      hydraulic: matRam,
      accent: matGlow,
      vent: matVent,
      glass: matLens,
      rubber: matRubber,
    },
    applyExplode,
    applyXray,
    update,
    dispose,
    get lengthUnits() {
      return axisLen;
    },
    get lengthMetres() {
      return unitsToMetres(axisLen);
    },
    get diameterMetres() {
      return unitsToMetres(radius * 2);
    },
    get beat() {
      return state.beat;
    },
    get beatLabel() {
      return state.beatLabel;
    },
  };
}
