import * as THREE from 'three';
import {
  STAR, PLANETS, MOONS, ANOMALIES, BELT, STATION, DERELICT, REGIONS,
} from './Config.js';
import {
  makePlanetTexture, makeRingTexture, makeNebulaTexture, makeStarTexture,
  makeHullTexture, makeRoughnessTexture, makeGlowTexture, makeRockTexture,
  makeLabelTexture, mulberry32, makeNoise3D, fbm, fbm3, canvasTextureLocal,
} from '../gfx/Procedural.js';
import {
  createAtmosphere, createStarSurface, createGlowSprite, createRingSystem,
  createNebulaShell,
} from '../gfx/Shaders.js';
import { yieldToBrowser } from '../core/Util.js';

const Y_AXIS = new THREE.Vector3(0, 1, 0);

function canvasTexture(canvas, { srgb = true, repeat = null, aniso = 1 } = {}) {
  return canvasTextureLocal(canvas, { srgb, repeat, aniso });
}

export class Universe {
  constructor(scene, quality) {
    this.scene = scene;
    this.quality = quality;
    this.root = new THREE.Group();
    this.root.name = 'universe';
    scene.add(this.root);

    this.elapsed = 0;
    this.sunDir = new THREE.Vector3(1, 0, 0);
    this.atmosphereGroups = [];
    this.ringMeshes = [];
    this.spinners = [];
    this.blinkers = [];
    this.asteroidInstances = [];
    this.beltBounds = null;

    this._tmpV = new THREE.Vector3();
    this._tmpV2 = new THREE.Vector3();
    this._tmpQ = new THREE.Quaternion();
    this._up = new THREE.Vector3(0, 1, 0);
  }

  /* ================================================================ *
   *  Build
   * ================================================================ */

  /**
   * Builds the whole system.
   *
   * Between steps the build yields through a MessageChannel rather than
   * setTimeout: background tabs clamp timers to once per second, which
   * would stretch a two-second load into a minute.
   */
  async build(onProgress = () => {}) {
    const step = async (label, pct, fn) => {
      onProgress(label, pct);
      await yieldToBrowser();
      const t0 = performance.now();
      const out = fn();
      const dt = performance.now() - t0;
      if (dt > 40) console.info(`[build] ${label} → ${dt.toFixed(0)}ms`);
      return out;
    };

    await     step('织造星云背景', 0.10, () => this._buildSkybox());
    await     step('播撒恒星场', 0.20, () => this._buildStarfield());
    await     step('点燃伊尔达', 0.30, () => this._buildStar());
    await     step('塑造维岚', 0.44, () => this._buildPlanet(PLANETS[0]));
    await     step('塑造霜隙环系', 0.56, () => this._buildPlanet(PLANETS[1]));
    await     step('安置柯莱与莫恩', 0.64, () => this._buildMoons());
    await     step('填充碎屑回廊', 0.74, () => this._buildBelt());
    await     step('建造灯塔站', 0.84, () => this._buildStation());
    await     step('标记卡尔索阵列', 0.90, () => this._buildDerelict());
    await     step('登记异常信号源', 0.96, () => this._buildAnomalies());
    await     step('校准导航系统', 1.0, () => {
      // lighting
      const sun = new THREE.PointLight(0xfff0d2, 3.1, 0, 0);
      sun.position.copy(STAR.position);
      this.root.add(sun);
      this.sunLight = sun;

      const fill = new THREE.HemisphereLight(0x3a2f52, 0x0a0c16, 0.55);
      this.root.add(fill);
      this.fillLight = fill;

      const ambient = new THREE.AmbientLight(0x2e2438, 0.35);
      this.root.add(ambient);
    });
  }

  /* ---------------------------------------------------------------- *
   *  Skybox + nebula
   * ---------------------------------------------------------------- */

  _buildSkybox() {
    const tex = canvasTexture(makeNebulaTexture(this.quality.nebulaTexture, Math.round(this.quality.nebulaTexture / 2), 2024));
    tex.wrapS = THREE.RepeatWrapping;

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(19000, 64, 48),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false, fog: false })
    );
    sky.renderOrder = -100;
    sky.frustumCulled = false;
    this.root.add(sky);
    this.skybox = sky;

    // A second, additive volumetric shell gives the nebula depth.
    // It costs a full-screen noise pass, so it is reserved for the top tier.
    if (this.quality.nebulaShell) {
      const shell = createNebulaShell({ radius: 17500, colorA: 0x2b2f7a, colorB: 0x8f3a86, opacity: 0.34 });
      this.root.add(shell);
      this.nebulaShell = shell;
    }
  }

  _buildStarfield() {
    const count = this.quality.stars;
    const rand = mulberry32(4242);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Uniform on a sphere
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 17500;
      positions[i * 3] = Math.cos(theta) * s * r;
      positions[i * 3 + 1] = u * r;
      positions[i * 3 + 2] = Math.sin(theta) * s * r;

      // Stellar colour distribution
      const t = rand();
      if (t < 0.08) c.setHSL(0.06, 0.75, 0.72);       // red giant
      else if (t < 0.2) c.setHSL(0.11, 0.55, 0.8);   // orange
      else if (t < 0.52) c.setHSL(0.58, 0.18, 0.86);  // white-blue
      else if (t < 0.78) c.setHSL(0.6, 0.45, 0.84);   // blue
      else c.setHSL(0.13, 0.25, 0.9);                 // white
      const boost = 0.55 + Math.pow(rand(), 3) * 0.9;
      colors[i * 3] = c.r * boost;
      colors[i * 3 + 1] = c.g * boost;
      colors[i * 3 + 2] = c.b * boost;
      sizes[i] = 0.9 + Math.pow(rand(), 4) * 2.6;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */`
        attribute float aSize;
        varying vec3 vColor;
        varying float vTwinkle;
        uniform float uTime;
        void main(){
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vTwinkle = 0.75 + 0.25 * sin(uTime * 1.6 + position.x * 0.013 + position.z * 0.017);
          gl_PointSize = aSize * vTwinkle;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3 vColor;
        varying float vTwinkle;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.06, d);
          gl_FragColor = vec4(vColor * vTwinkle, a);
        }
      `,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    points.renderOrder = -50;
    points.frustumCulled = false;
    this.root.add(points);
    this.starfield = points;
    this.starfieldMat = mat;
  }

  /* ---------------------------------------------------------------- *
   *  Star
   * ---------------------------------------------------------------- */

  _buildStar() {
    const tex = canvasTexture(makeStarTexture(512, 256, 3141));
    const surface = createStarSurface(tex, STAR.color);
    surface.scale.setScalar(STAR.radius);
    surface.position.copy(STAR.position);
    this.root.add(surface);
    this.starSurface = surface;

    const glowTex = canvasTexture(makeGlowTexture(256, 'rgba(255,235,190,1)', 'rgba(255,140,40,0)', 1.0), { srgb: true });

    const inner = createGlowSprite(glowTex, 0xffe9b0, 0.72);
    inner.scale.setScalar(STAR.radius * 2.9);
    inner.position.copy(STAR.position);
    inner.renderOrder = 1;
    this.root.add(inner);
    this.starGlow = inner;

    const outer = createGlowSprite(glowTex, 0xff9c3c, 0.26);
    outer.scale.setScalar(STAR.radius * 4.8);
    outer.position.copy(STAR.position);
    outer.renderOrder = 0;
    this.root.add(outer);
    this.starGlowOuter = outer;
  }

  /* ---------------------------------------------------------------- *
   *  Planets
   * ---------------------------------------------------------------- */

  _buildPlanet(def) {
    const group = new THREE.Group();
    group.position.copy(def.position);
    this.root.add(group);

    const tex = canvasTexture(
      makePlanetTexture({
        width: this.quality.planetTexture,
        height: Math.round(this.quality.planetTexture / 2),
        seed: def.seed,
        preset: def.texturePreset,
      }),
      { aniso: this.quality.anisotropy }
    );

    const geo = new THREE.SphereGeometry(def.radius, 96, 64);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.92,
      metalness: 0.0,
    });
    const body = new THREE.Mesh(geo, mat);
    group.add(body);

    // Axial tilt + spin handled by a child pivot so the tilt stays constant.
    const pivot = new THREE.Group();
    pivot.rotation.z = def.axialTilt;
    group.add(pivot);
    const spinner = new THREE.Group();
    pivot.add(spinner);
    const spinBody = new THREE.Mesh(geo, mat);
    spinner.add(spinBody);

    // Atmosphere
    const atmo = createAtmosphere({
      radius: def.radius,
      color: def.atmoColor,
      intensity: def.atmoIntensity,
      power: 3.1,
      haze: 0.3,
    });
    pivot.add(atmo);
    this.atmosphereGroups.push(atmo);

    // Rings
    if (def.ring) {
      const bandTex = canvasTexture(makeRingTexture(909), { srgb: true, aniso: this.quality.anisotropy });
      bandTex.wrapS = THREE.ClampToEdgeWrapping;
      const rings = createRingSystem({
        inner: def.ring.inner,
        outer: def.ring.outer,
        bandMap: bandTex,
        color: def.ring.color,
        planetRadius: def.radius,
      });
      rings.rotation.x = -Math.PI / 2;
      const ringPivot = new THREE.Group();
      ringPivot.rotation.z = def.ring.tilt;
      ringPivot.add(rings);
      pivot.add(ringPivot);
      this.ringMeshes.push(rings);
    }

    this.spinners.push({ node: spinner, speed: def.rotation });
    this.planets = this.planets || {};
    this.planets[def.id] = { def, group, body, atmo, pivot };
  }

  _buildMoons() {
    this.moons = {};
    for (const def of MOONS) {
      const group = new THREE.Group();
      group.position.copy(def.position);
      this.root.add(group);

      const tex = canvasTexture(
        makePlanetTexture({
          width: 512,
          height: 256,
          seed: def.seed,
          preset: def.texturePreset,
          bandCount: 3,
          bandWarp: 0.02,
          stormCount: 1,
        })
      );
      const geo = new THREE.SphereGeometry(def.radius, 48, 32);
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        map: tex, roughness: 0.95, metalness: 0.0,
      }));
      group.add(mesh);
      this.spinners.push({ node: group, speed: def.rotation });
      this.moons[def.id] = { def, group, mesh };
    }
  }

  /* ---------------------------------------------------------------- *
   *  Asteroid belt
   * ---------------------------------------------------------------- */

  _buildBelt() {
    const count = this.quality.asteroids;
    const rand = mulberry32(90210);

    // Irregular rock geometry (shared by every instance).
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const noise3 = makeNoise3D(555);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = fbm3(noise3, v.x * 1.6 + 3, v.y * 1.6, v.z * 1.6, 4);
      const k = 0.72 + n * 0.62;
      v.multiplyScalar(k);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();

    const rockTex = canvasTexture(makeRockTexture(256, 5150), { repeat: [2, 2] });
    const mat = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.97,
      metalness: 0.06,
    });

    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    mesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const axis = BELT.rotationAxis;

    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      // Denser towards the centre of the torus
      const rr = BELT.majorRadius + (rand() + rand() - 1) * BELT.tubeRadius;
      const tube = (rand() + rand() - 1) * BELT.tubeRadius * 0.85;
      const local = new THREE.Vector3(Math.cos(theta) * rr, tube, Math.sin(theta) * rr);
      // Orient the torus so its axis matches BELT.rotationAxis
      local.applyAxisAngle(Y_AXIS, 0.0);
      const q = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, axis);
      local.applyQuaternion(q);
      local.add(BELT.center);

      const s = BELT.scaleMin + Math.pow(rand(), 2.1) * (BELT.scaleMax - BELT.scaleMin);
      dummy.position.copy(local);
      dummy.scale.setScalar(s);
      dummy.rotation.set(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      const shade = 0.4 + rand() * 0.55;
      color.setHSL(0.08 + rand() * 0.06, 0.18 + rand() * 0.2, shade * 0.6);
      mesh.setColorAt(i, color);

      this.asteroidInstances.push({
        position: local.clone(),
        radius: s * 0.85,
      });
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    this.root.add(mesh);
    this.beltMesh = mesh;

    // Fine dust for depth and scale.
    if (this.quality.dust) {
      const dustCount = 4200;
      const dpos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        const theta = rand() * Math.PI * 2;
        const rr = BELT.majorRadius + (rand() + rand() - 1) * BELT.tubeRadius * 1.1;
        const tube = (rand() + rand() - 1) * BELT.tubeRadius;
        const local = new THREE.Vector3(Math.cos(theta) * rr, tube, Math.sin(theta) * rr);
        local.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y_AXIS, axis));
        local.add(BELT.center);
        dpos[i * 3] = local.x;
        dpos[i * 3 + 1] = local.y;
        dpos[i * 3 + 2] = local.z;
      }
      const dgeo = new THREE.BufferGeometry();
      dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
      const dmat = new THREE.PointsMaterial({
        color: 0xbfa98a, size: 1.1, sizeAttenuation: false,
        transparent: true, opacity: 0.55, depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const dust = new THREE.Points(dgeo, dmat);
      dust.frustumCulled = false;
      this.root.add(dust);
      this.beltDust = dust;
    }

    this.beltBounds = {
      center: BELT.center.clone(),
      major: BELT.majorRadius,
      tube: BELT.tubeRadius,
    };
  }

  /* ---------------------------------------------------------------- *
   *  Space station
   * ---------------------------------------------------------------- */

  _buildStation() {
    const group = new THREE.Group();
    group.position.copy(STATION.position);
    this.root.add(group);

    const hullTex = canvasTexture(makeHullTexture(512, 77, [0.34, 0.37, 0.42]), {
      repeat: [3, 3], aniso: this.quality.anisotropy,
    });
    const roughTex = canvasTexture(makeRoughnessTexture(256, 21), { srgb: false, repeat: [3, 3] });

    const hullMat = new THREE.MeshStandardMaterial({
      map: hullTex, roughnessMap: roughTex, roughness: 0.72, metalness: 0.55,
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1b2028, roughness: 0.6, metalness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd8a53c, roughness: 0.34, metalness: 1.0,
      emissive: 0x2a1c05, emissiveIntensity: 0.6,
    });

    // Spine
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(STATION.coreRadius, STATION.coreRadius, STATION.coreRadius * 5.2, 20), hullMat);
    spine.rotation.z = Math.PI / 2;
    group.add(spine);

    // Nose / tail caps
    const capA = new THREE.Mesh(new THREE.SphereGeometry(STATION.coreRadius, 20, 14), hullMat);
    capA.position.x = STATION.coreRadius * 2.6;
    group.add(capA);
    const capB = capA.clone();
    capB.position.x = -STATION.coreRadius * 2.6;
    group.add(capB);

    // Rotating habitat ring
    const ringPivot = new THREE.Group();
    ringPivot.rotation.x = Math.PI / 2;
    group.add(ringPivot);
    const habitat = new THREE.Mesh(
      new THREE.TorusGeometry(STATION.ringRadius, 3.1, 12, 64),
      hullMat
    );
    ringPivot.add(habitat);

    // Spokes
    for (let i = 0; i < 4; i++) {
      const holder = new THREE.Group();
      holder.rotation.x = (i / 4) * Math.PI * 2;
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(STATION.coreRadius * 0.8, STATION.ringRadius, STATION.coreRadius * 0.55),
        hullMat
      );
      bar.position.y = STATION.ringRadius / 2 + STATION.coreRadius * 0.6;
      holder.add(bar);
      ringPivot.add(holder);
    }
    this.spinners.push({ node: ringPivot, speed: 0.09 });

    // Solar wings
    for (const side of [-1, 1]) {
      const wing = new THREE.Group();
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(26, 0.5, 11),
        new THREE.MeshStandardMaterial({
          color: 0x16233d, roughness: 0.28, metalness: 0.85,
          emissive: 0x0a1830, emissiveIntensity: 0.5,
        })
      );
      panel.position.set(side * (STATION.coreRadius * 3.4 + 13), 0, 0);
      wing.add(panel);
      const boom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 26, 8),
        darkMat
      );
      boom.rotation.z = Math.PI / 2;
      boom.position.set(side * (STATION.coreRadius * 3.4 + 0.5), 0, 0);
      wing.add(boom);
      group.add(wing);
    }

    // Docking port on +Y
    const dock = new THREE.Group();
    dock.position.copy(STATION.dockOffset);
    group.add(dock);
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(STATION.dockRadius * 0.62, STATION.dockRadius * 0.72, 4.2, 24, 1, true),
      darkMat
    );
    collar.position.y = 2.1;
    dock.add(collar);
    const collarLip = new THREE.Mesh(
      new THREE.TorusGeometry(STATION.dockRadius * 0.64, 0.7, 10, 28),
      goldMat
    );
    collarLip.rotation.x = Math.PI / 2;
    collarLip.position.y = 4.1;
    dock.add(collarLip);

    // Approach guide: pulsing ring + soft beam
    const guideMat = new THREE.MeshBasicMaterial({
      color: 0x5ff0c8, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const guideRing = new THREE.Mesh(new THREE.TorusGeometry(STATION.dockRadius * 0.95, 0.42, 8, 40), guideMat);
    guideRing.rotation.x = Math.PI / 2;
    guideRing.position.y = 9;
    dock.add(guideRing);
    this.guideRing = guideRing;
    this.guideMat = guideMat;

    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x39d8b4, transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(STATION.dockRadius * 0.7, STATION.dockRadius * 1.1, 26, 20, 1, true),
      beamMat
    );
    beam.position.y = 14;
    dock.add(beam);
    this.dockBeam = beam;

    // Guidance lights around the collar
    const lightGeo = new THREE.SphereGeometry(0.5, 8, 6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const m = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0x8bffc6 }));
      m.position.set(Math.cos(a) * STATION.dockRadius * 0.66, 3.6, Math.sin(a) * STATION.dockRadius * 0.66);
      dock.add(m);
    }

    // Name plate
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 6.5),
      new THREE.MeshBasicMaterial({
        map: canvasTexture(makeLabelTexture('BEACON STATION', { sub: 'BERTH 04 · ORBITAL RELAY' })),
        transparent: true,
      })
    );
    label.position.set(0, -STATION.coreRadius * 2.1, STATION.coreRadius * 1.02);
    group.add(label);

    // Blinking running lights
    const blinkGeo = new THREE.SphereGeometry(0.42, 8, 6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const m = new THREE.Mesh(blinkGeo, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff5566 : 0x55ff99 }));
      m.position.set(
        Math.cos(a) * STATION.ringRadius,
        Math.sin(a * 2) * 1.4,
        Math.sin(a) * STATION.ringRadius
      );
      group.add(m);
      this.blinkers.push({ mesh: m, phase: i * 0.7, rate: 1.4 + (i % 3) * 0.3 });
    }

    // Dock reference frame (world space)
    const portWorld = STATION.position.clone().add(STATION.dockOffset);
    this.station = {
      def: STATION,
      group,
      dock,
      portPosition: portWorld,
      portNormal: new THREE.Vector3(0, 1, 0),
      colliderRadius: STATION.ringRadius + 6,
      coreRadius: STATION.coreRadius,
    };
  }

  /* ---------------------------------------------------------------- *
   *  Derelict array
   * ---------------------------------------------------------------- */

  _buildDerelict() {
    const group = new THREE.Group();
    group.position.copy(DERELICT.position);
    group.rotation.set(0.3, 0.8, 0.22);
    this.root.add(group);

    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x4a4238, roughness: 0.88, metalness: 0.55,
    });

    const truss = new THREE.Mesh(
      new THREE.CylinderGeometry(DERELICT.radius * 0.12, DERELICT.radius * 0.12, DERELICT.radius * 4.4, 8),
      hullMat
    );
    truss.rotation.z = Math.PI / 2;
    group.add(truss);

    for (let i = 0; i < 3; i++) {
      const dish = new THREE.Mesh(
        new THREE.SphereGeometry(DERELICT.radius * 0.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4),
        new THREE.MeshStandardMaterial({ color: 0x6b6155, roughness: 0.7, metalness: 0.7, side: THREE.DoubleSide })
      );
      dish.position.set((i - 1) * DERELICT.radius * 1.1, 0, 0);
      dish.rotation.set(Math.PI * 0.62, 0, 0.3 * i);
      group.add(dish);
    }

    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x2a2018, roughness: 0.4, metalness: 0.9,
      emissive: 0x100a04, emissiveIntensity: 0.4,
    });
    for (const side of [-1, 1]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(DERELICT.radius * 1.7, 0.4, DERELICT.radius * 0.8), panelMat);
      panel.position.set(0, side * DERELICT.radius * 0.8, 0);
      panel.rotation.z = 0.2 * side;
      group.add(panel);
    }

    // A single surviving red beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xff3a3a })
    );
    beacon.position.set(DERELICT.radius * 2.0, DERELICT.radius * 0.5, 0);
    group.add(beacon);
    this.blinkers.push({ mesh: beacon, phase: 0, rate: 0.55 });

    this.derelict = { def: DERELICT, group, colliderRadius: DERELICT.radius };
  }

  /* ---------------------------------------------------------------- *
   *  Anomalies
   * ---------------------------------------------------------------- */

  _buildAnomalies() {
    this.anomalies = {};
    const rand = mulberry32(60613);
    for (const def of ANOMALIES) {
      const group = new THREE.Group();
      group.position.copy(def.position);
      group.rotation.set(rand() * 6, rand() * 6, rand() * 6);
      this.root.add(group);

      const geo = new THREE.IcosahedronGeometry(def.radius, 2);
      const noise3 = makeNoise3D(def.seed || 31);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const n = fbm3(noise3, v.x * 0.16 + 5, v.y * 0.16, v.z * 0.16, 4);
        v.multiplyScalar(0.6 + n * 0.9);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0x6d5f4e, roughness: 0.8, metalness: 0.35,
        emissive: 0x1a2c3a, emissiveIntensity: 0.55,
      }));
      group.add(mesh);

      // Marker glow so anomalies are findable in the dark belt
      const glow = createGlowSprite(
        canvasTexture(makeGlowTexture(128, 'rgba(120,240,255,1)', 'rgba(0,90,160,0)', 1)),
        0x6ff0ff, 0.55
      );
      glow.scale.setScalar(def.radius * 9);
      group.add(glow);
      this.blinkers.push({ mesh: glow, phase: rand() * 6, rate: 0.9 });

      this.anomalies[def.id] = { def, group, mesh, colliderRadius: def.radius * 0.9 };
    }
  }

  /* ================================================================ *
   *  Runtime
   * ================================================================ */

  update(dt, camPos) {
    this.elapsed += dt;
    const t = this.elapsed;

    // Sun direction from the camera (good enough for every body in the system).
    this.sunDir.copy(STAR.position).sub(camPos).normalize();

    for (const sp of this.spinners) {
      sp.node.rotation.y += sp.speed * dt * 60;
    }

    for (const group of this.atmosphereGroups) {
      const u = group.userData.uniforms;
      u.uSunDir.value.copy(this.sunDir);
      u.uCamPos.value.copy(camPos);
    }

    for (const rings of this.ringMeshes) {
      const u = rings.userData.uniforms;
      u.uSunDir.value.copy(this.sunDir);
      u.uCamPos.value.copy(camPos);
      if (u.uPlanetCenter.value.lengthSq() === 0) {
        const parentWorld = new THREE.Vector3();
        rings.getWorldPosition(parentWorld);
        u.uPlanetCenter.value.copy(parentWorld);
      }
    }

    if (this.starSurface) {
      this.starSurface.userData.uniforms.uTime.value = t;
      this.starSurface.userData.uniforms.uCamPos.value.copy(camPos);
    }
    if (this.starGlow) {
      this.starGlow.userData.uniforms.uTime.value = t;
      this.starGlow.material.uniforms.uTime.value = t;
    }
    if (this.starGlowOuter) {
      this.starGlowOuter.material.uniforms.uTime.value = t * 0.6;
    }
    if (this.starfieldMat) this.starfieldMat.uniforms.uTime.value = t;
    if (this.nebulaShell) this.nebulaShell.userData.uniforms.uTime.value = t;

    for (const b of this.blinkers) {
      const on = Math.sin(t * b.rate * Math.PI * 2 + b.phase) > 0.2;
      const mat = b.mesh.material;
      if (mat && mat.uniforms) {
        mat.uniforms.uIntensity.value = on ? 0.55 : 0.12;
      } else {
        b.mesh.visible = on;
      }
    }

    if (this.guideRing) {
      const p = 0.55 + 0.45 * Math.sin(t * 2.2);
      this.guideMat.opacity = 0.35 + p * 0.5;
      this.guideRing.scale.setScalar(0.96 + p * 0.08);
      this.dockBeam.material.opacity = 0.04 + p * 0.07;
    }
  }

  /** Region containing the given position (nearest one if between regions). */
  regionAt(position) {
    let best = null;
    let bestDist = Infinity;
    for (const r of REGIONS) {
      const d = position.distanceTo(r.center);
      if (d < bestDist) {
        bestDist = d;
        best = r;
      }
    }
    return { region: best, distance: bestDist, inside: bestDist <= best.radius };
  }
}
