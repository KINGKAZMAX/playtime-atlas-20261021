/**
 * Scene stage: renderer, camera rig, lighting rig, hydrothermal vent field.
 *
 * Two visual themes are supported:
 *   abyss — the deep-ocean read: near-black water, cold floodlight from the
 *           surface, warm orange bounce off the black smoker chimneys.
 *   sonar — the survey read: a flat teal world with a glowing survey grid and
 *           even lighting, for reading the machine's silhouette.
 *
 * The vent field, seafloor, tube worms and marine snow are all generated at
 * runtime. Nothing is loaded from disk or the network.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { seafloorField, rubbleField, ventChimney, tubeWormCluster } from '../model/abyssal.js';
import { createBasaltTexture, createSnowTexture, createGridTexture } from '../model/textures.js';

export const THEMES = {
  abyss: {
    bg: 0x050a11,
    fog: 0x071119,
    fogNear: 16,
    fogFar: 118,
    ground: 0x1b2329,
    key: 0xc4e8ff,
    keyIntensity: 2.4,
    fill: 0x2c6f7c,
    fillIntensity: 0.55,
    rim: 0xff8a3d,
    rimIntensity: 0.7,
    hemiSky: 0x14384a,
    hemiGround: 0x05080c,
    hemiIntensity: 0.5,
    envIntensity: 0.32,
    bloom: 0.52,
    snow: 0.85,
    gridOpacity: 0.0,
    ventGlow: 2.4,
  },
  sonar: {
    bg: 0x04110f,
    fog: 0x061a17,
    fogNear: 30,
    fogFar: 175,
    ground: 0x122320,
    key: 0xa8f6e6,
    keyIntensity: 2.7,
    fill: 0x1f525a,
    fillIntensity: 0.7,
    rim: 0x38e8d0,
    rimIntensity: 0.65,
    hemiSky: 0x0e2d30,
    hemiGround: 0x03080a,
    hemiIntensity: 0.62,
    envIntensity: 0.4,
    bloom: 0.26,
    snow: 0.3,
    gridOpacity: 0.5,
    ventGlow: 1.4,
  },
};

/** Where the black smokers stand — kept outside the machine's survey corridor. */
const CHIMNEYS = [
  { x: -9, z: -15, height: 5.4, radius: 1.0, seed: 5 },
  { x: 5, z: 16, height: 3.8, radius: 0.85, seed: 13 },
  { x: 17, z: -16, height: 6.2, radius: 1.15, seed: 29 },
  { x: 30, z: 13, height: 4.4, radius: 0.92, seed: 37 },
  { x: 14, z: 23, height: 3.2, radius: 0.78, seed: 53 },
];

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    500
  );
  camera.position.set(-9.5, 5.4, 20.5);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.075;
  controls.target.set(11.3, 0.9, 0);
  controls.minDistance = 2.2;
  controls.maxDistance = 120;
  controls.maxPolarAngle = Math.PI * 0.495;

  // ------------------------------------------------------------- lighting
  const keyLight = new THREE.DirectionalLight(0xc4e8ff, 2.4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 160;
  keyLight.shadow.camera.left = -40;
  keyLight.shadow.camera.right = 40;
  keyLight.shadow.camera.top = 40;
  keyLight.shadow.camera.bottom = -40;
  keyLight.shadow.bias = -0.0009;
  keyLight.shadow.normalBias = 0.022;
  scene.add(keyLight);
  scene.add(keyLight.target);

  const fillLight = new THREE.DirectionalLight(0x2c6f7c, 0.55);
  fillLight.position.set(-14, 9, -12);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff8a3d, 1.1);
  rimLight.position.set(6, 3.2, -18);
  scene.add(rimLight);

  const hemi = new THREE.HemisphereLight(0x14384a, 0x05080c, 0.5);
  scene.add(hemi);

  // The machine's own cold floodlight.
  const headGlow = new THREE.PointLight(0x38e8d0, 5.5, 16, 2);
  headGlow.position.set(0.4, 1.4, 0);
  scene.add(headGlow);

  // ------------------------------------------------------------ environment
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  // ------------------------------------------------------------- seafloor
  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'terrain';
  scene.add(terrainGroup);

  const basaltTex = createBasaltTexture(512, 91);
  basaltTex.repeat.set(7, 7);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1b2329,
    roughness: 0.96,
    metalness: 0.03,
    map: basaltTex,
  });
  const floor = new THREE.Mesh(
    seafloorField({ size: 150, segments: 170, height: 4.6, seed: 23, corridor: { x0: -6, x1: 30, halfWidth: 8 } }),
    floorMat
  );
  floor.receiveShadow = true;
  terrainGroup.add(floor);

  const rubbleMat = new THREE.MeshStandardMaterial({
    color: 0x232c33,
    roughness: 0.93,
    metalness: 0.04,
  });
  const rubble = new THREE.Mesh(
    rubbleField({ count: 120, radius: 56, seed: 41, corridor: { x0: -8, x1: 32, halfWidth: 10 } }),
    rubbleMat
  );
  rubble.receiveShadow = true;
  rubble.castShadow = true;
  terrainGroup.add(rubble);

  // ------------------------------------------------- hydrothermal vent field
  const ventGroup = new THREE.Group();
  ventGroup.name = 'vent-field';
  terrainGroup.add(ventGroup);

  const chimneyMat = new THREE.MeshStandardMaterial({
    color: 0x2a2118,
    roughness: 0.98,
    metalness: 0.05,
  });
  const mouthMat = new THREE.MeshStandardMaterial({
    color: 0xff7a2a,
    emissive: 0xff7a2a,
    emissiveIntensity: 2.4,
    roughness: 0.7,
  });
  const wormShellMat = new THREE.MeshStandardMaterial({
    color: 0xd8d2c4,
    roughness: 0.85,
    metalness: 0.02,
  });
  const wormPlumeMat = new THREE.MeshStandardMaterial({
    color: 0xd8453c,
    emissive: 0x5c1210,
    emissiveIntensity: 0.6,
    roughness: 0.75,
  });

  const ventLights = [];
  const chimneys = [];
  for (const c of CHIMNEYS) {
    const stack = new THREE.Mesh(
      ventChimney({ height: c.height, baseRadius: c.radius, seed: c.seed }),
      chimneyMat
    );
    stack.position.set(c.x, 0, c.z);
    stack.castShadow = true;
    stack.receiveShadow = true;
    ventGroup.add(stack);
    chimneys.push(stack);

    // The glowing spout at the top of the chimney.
    const mouth = new THREE.Mesh(
      new THREE.CircleGeometry(c.radius * 0.33, 14),
      mouthMat
    );
    mouth.rotation.x = -Math.PI / 2;
    mouth.position.set(c.x, c.height + 0.02, c.z);
    ventGroup.add(mouth);

    // Warm bounce light from the vent. Only the two nearest smokers get a real
    // point light — every extra point light is a per-fragment cost across the
    // whole frame, and the emissive mouths plus bloom carry the rest.
    if (ventLights.length < 2) {
      const pl = new THREE.PointLight(0xff6a2b, 6.5, 16, 2);
      pl.position.set(c.x, c.height * 0.92, c.z);
      scene.add(pl);
      ventLights.push(pl);
    }

    // Tube worms clustered around the base.
    const worms = tubeWormCluster({ count: 22, radius: c.radius * 2.4, seed: c.seed + 3 });
    const wormShells = new THREE.Mesh(worms.shells, wormShellMat);
    wormShells.position.set(c.x, 0, c.z);
    ventGroup.add(wormShells);
    const wormPlumes = new THREE.Mesh(worms.plumes, wormPlumeMat);
    wormPlumes.position.set(c.x, 0, c.z);
    ventGroup.add(wormPlumes);
  }

  // Survey grid overlay.
  const gridTex = createGridTexture(256);
  gridTex.repeat.set(42, 42);
  const gridMat = new THREE.MeshBasicMaterial({
    map: gridTex,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = 0.02;
  terrainGroup.add(grid);

  // ----------------------------------------------------------- marine snow
  const snowTex = createSnowTexture(64);
  const SNOW_COUNT = 1500;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(SNOW_COUNT * 3);
  const snowSeed = new Float32Array(SNOW_COUNT);
  for (let i = 0; i < SNOW_COUNT; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 96;
    snowPos[i * 3 + 1] = Math.random() * 20;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 96;
    snowSeed[i] = Math.random() * 100;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({
    size: 0.14,
    map: snowTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const snow = new THREE.Points(snowGeo, snowMat);
  snow.name = 'marine-snow';
  scene.add(snow);

  // Vent plumes: warm particles rising from each smoker.
  const PLUME_COUNT = 60;
  const plumeGeo = new THREE.BufferGeometry();
  const plumePos = new Float32Array(CHIMNEYS.length * PLUME_COUNT * 3);
  const plumeSeed = new Float32Array(CHIMNEYS.length * PLUME_COUNT);
  let pi = 0;
  for (const c of CHIMNEYS) {
    for (let i = 0; i < PLUME_COUNT; i++) {
      plumePos[pi * 3] = c.x + (Math.random() - 0.5) * 0.5;
      plumePos[pi * 3 + 1] = c.height + Math.random() * 5;
      plumePos[pi * 3 + 2] = c.z + (Math.random() - 0.5) * 0.5;
      plumeSeed[pi] = Math.random();
      pi++;
    }
  }
  plumeGeo.setAttribute('position', new THREE.BufferAttribute(plumePos, 3));
  const plumeMat = new THREE.PointsMaterial({
    size: 0.5,
    map: snowTex,
    color: 0xff8a3d,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const plumes = new THREE.Points(plumeGeo, plumeMat);
  plumes.name = 'vent-plumes';
  scene.add(plumes);

  // ------------------------------------------------------------- composer
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.clientWidth, container.clientHeight),
    0.0,
    0.72,
    0.78
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  composer.setSize(container.clientWidth, container.clientHeight);

  // ------------------------------------------------------------- theme swap
  function applyTheme(themeName, params) {
    const t = THEMES[themeName] || THEMES.abyss;
    scene.background = new THREE.Color(t.bg);
    scene.fog = new THREE.Fog(t.fog, t.fogNear, t.fogFar);

    keyLight.color.setHex(t.key);
    keyLight.intensity = t.keyIntensity;
    fillLight.color.setHex(t.fill);
    fillLight.intensity = t.fillIntensity;
    rimLight.color.setHex(t.rim);
    rimLight.intensity = t.rimIntensity;
    hemi.color.setHex(t.hemiSky);
    hemi.groundColor.setHex(t.hemiGround);
    hemi.intensity = t.hemiIntensity;
    scene.environmentIntensity = t.envIntensity;

    floorMat.color.setHex(t.ground);
    rubbleMat.color.setHex(t.ground).multiplyScalar(1.25);
    chimneyMat.color.setHex(t.ground).multiplyScalar(1.35);
    mouthMat.emissiveIntensity = t.ventGlow;
    for (const pl of ventLights) pl.intensity = t.ventGlow * 3.2;

    bloomPass.strength = params.showBloom ? t.bloom : 0;
    snowMat.opacity = t.snow;
    snow.visible = params.showSnow;
    grid.visible = params.showGrid && t.gridOpacity > 0;
    gridMat.opacity = t.gridOpacity;

    renderer.toneMappingExposure = params.exposure;
  }

  function updateKey(azimuthDeg, elevationDeg) {
    const az = (azimuthDeg * Math.PI) / 180;
    const el = (elevationDeg * Math.PI) / 180;
    const r = 46;
    const x = Math.cos(el) * Math.cos(az) * r;
    const y = Math.sin(el) * r;
    const z = Math.cos(el) * Math.sin(az) * r;
    keyLight.position.set(x, Math.max(3, y), z);
    keyLight.target.position.set(11.3, 0.6, 0);
    keyLight.target.updateMatrixWorld();
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  function updateParticles(elapsed, dt) {
    if (snow.visible) {
      const pos = snowGeo.attributes.position;
      const arr = pos.array;
      for (let i = 0; i < SNOW_COUNT; i++) {
        const s = snowSeed[i];
        arr[i * 3] += Math.sin(elapsed * 0.28 + s) * 0.0032;
        arr[i * 3 + 2] += Math.cos(elapsed * 0.21 + s) * 0.0028;
        arr[i * 3 + 1] -= 0.011;
        if (arr[i * 3 + 1] < 0.05) arr[i * 3 + 1] = 19.5;
      }
      pos.needsUpdate = true;
    }

    const pp = plumeGeo.attributes.position;
    const pa = pp.array;
    for (let i = 0; i < pa.length / 3; i++) {
      pa[i * 3 + 1] += dt * 0.55;
      if (pa[i * 3 + 1] > 22) pa[i * 3 + 1] = 0;
    }
    pp.needsUpdate = true;
  }

  return {
    renderer,
    scene,
    camera,
    controls,
    composer,
    bloomPass,
    lights: { keyLight, fillLight, rimLight, hemi, headGlow, ventLights },
    terrain: {
      terrainGroup,
      floor,
      rubble,
      grid,
      snow,
      plumes,
      ventGroup,
      chimneys,
      floorMat,
      rubbleMat,
      gridMat,
      snowMat,
      mouthMat,
    },
    applyTheme,
    updateKey,
    updateParticles,
    resize,
    render() {
      composer.render();
    },
  };
}
