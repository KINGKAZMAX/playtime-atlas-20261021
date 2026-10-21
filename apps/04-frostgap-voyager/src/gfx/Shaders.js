import * as THREE from 'three';

/* ================================================================== *
 *  GLSL building blocks
 * ================================================================== */

const NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm3(vec3 p, int oct){
    float a = 0.5, s = 0.0, n = 0.0;
    for(int i = 0; i < 6; i++){
      if(i >= oct) break;
      s += a * snoise(p);
      n += a;
      a *= 0.5;
      p *= 2.03;
    }
    return s / n;
  }
`;

/* ================================================================== *
 *  Planet atmosphere (two shells: outer halo + inner haze)
 * ================================================================== */

const ATMO_VERT = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main(){
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform vec3  uSunDir;
  uniform vec3  uCamPos;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uHaze;
  uniform float uSunBoost;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main(){
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    float facing = abs(dot(N, V));
    float fres = pow(clamp(1.0 - facing, 0.0, 1.0), uPower);
    float sun = clamp(dot(N, uSunDir) * 0.5 + 0.5, 0.0, 1.0);
    sun = pow(sun, uSunBoost);
    vec3 c = uColor * (0.22 + 1.25 * sun);
    float a = (fres * uIntensity) + (uHaze * pow(sun, 2.0) * 0.35);
    a = clamp(a, 0.0, 1.0);
    gl_FragColor = vec4(c * a, a);
  }
`;

/**
 * Group with two additive shells that produce a limb halo plus a soft day-side haze.
 */
export function createAtmosphere({ radius, color = 0x69a8ff, intensity = 1.15, power = 3.0, haze = 0.22 }) {
  const group = new THREE.Group();
  const uniforms = {
    uColor: { value: new THREE.Color(color) },
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uCamPos: { value: new THREE.Vector3() },
    uPower: { value: power },
    uIntensity: { value: intensity },
    uHaze: { value: haze },
    uSunBoost: { value: 1.4 },
  };

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.055, 96, 64),
    new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    })
  );
  halo.renderOrder = 2;
  group.add(halo);

  const veil = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.004, 96, 64),
    new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    })
  );
  veil.renderOrder = 3;
  group.add(veil);

  group.userData.uniforms = uniforms;
  group.userData.halo = halo;
  group.userData.veil = veil;
  return group;
}

/* ================================================================== *
 *  Star surface — textured, limb darkened, with granulation shimmer
 * ================================================================== */

const STAR_VERT = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  void main(){
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const STAR_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform vec3 uCamPos;
  uniform float uTime;
  uniform float uIntensity;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main(){
    vec3 tex = texture2D(uMap, vUv).rgb;
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    float mu = clamp(dot(N, V), 0.0, 1.0);
    // Limb darkening
    float limb = 0.30 + 0.70 * pow(mu, 0.42);
    // Slow roiling granulation
    float roll = 0.86 + 0.22 * sin(uTime * 0.55 + tex.r * 12.0 + tex.b * 6.0);
    vec3 c = tex * uColor * limb * roll * uIntensity;
    gl_FragColor = vec4(c, 1.0);
  }
`;

export function createStarSurface(map, color = 0xfff0c0) {
  const uniforms = {
    uMap: { value: map },
    uColor: { value: new THREE.Color(color) },
    uCamPos: { value: new THREE.Vector3() },
    uTime: { value: 0 },
    uIntensity: { value: 3.4 },
  };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.ShaderMaterial({ vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, uniforms })
  );
  mesh.userData.uniforms = uniforms;
  return mesh;
}

/* ================================================================== *
 *  Corona / glow billboard
 * ================================================================== */

const GLOW_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GLOW_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec2 vUv;

  void main(){
    vec4 t = texture2D(uMap, vUv);
    float pulse = 0.94 + 0.06 * sin(uTime * 1.7);
    gl_FragColor = vec4(uColor * t.rgb * uIntensity * pulse, t.a * uIntensity);
  }
`;

export function createGlowSprite(map, color = 0xffd9a0, intensity = 1.0) {
  const uniforms = {
    uMap: { value: map },
    uColor: { value: new THREE.Color(color) },
    uIntensity: { value: intensity },
    uTime: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: GLOW_VERT,
    fragmentShader: GLOW_FRAG,
    uniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,   // must not paint over the cockpit interior
  });
  const sprite = new THREE.Sprite(mat);
  sprite.userData.uniforms = uniforms;
  return sprite;
}

/* ================================================================== *
 *  Planetary ring system with planet shadowing
 * ================================================================== */

const RING_VERT = /* glsl */ `
  varying vec3 vLocal;
  varying vec3 vWorldPos;
  void main(){
    vLocal = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const RING_FRAG = /* glsl */ `
  uniform sampler2D uBands;
  uniform float uInner;
  uniform float uOuter;
  uniform vec3  uColor;
  uniform vec3  uSunDir;
  uniform vec3  uPlanetCenter;
  uniform float uPlanetRadius;
  uniform vec3  uCamPos;
  varying vec3 vLocal;
  varying vec3 vWorldPos;

  void main(){
    float r = length(vLocal.xy);
    float t = (r - uInner) / max(0.0001, (uOuter - uInner));
    if(t < 0.0 || t > 1.0) discard;

    vec4 band = texture2D(uBands, vec2(t, 0.5));
    float alpha = band.a;

    // Planet shadow: is the ring point inside the planet's shadow cylinder?
    vec3 d = vWorldPos - uPlanetCenter;
    float proj = dot(d, uSunDir);
    float shadow = 1.0;
    if(proj > 0.0){
      vec3 closest = d - uSunDir * proj;
      float dist = length(closest);
      shadow = smoothstep(uPlanetRadius * 0.96, uPlanetRadius * 1.06, dist);
    }

    // Forward scattering: rings brighten when viewed against the sun
    vec3 V = normalize(uCamPos - vWorldPos);
    float fwd = pow(clamp(dot(-V, uSunDir), 0.0, 1.0), 3.0);

    vec3 c = band.rgb * uColor * (0.32 + 0.95 * shadow) * (1.0 + fwd * 1.5);
    gl_FragColor = vec4(c, alpha * (0.35 + 0.65 * shadow));
  }
`;

export function createRingSystem({ inner, outer, bandMap, color = 0xffffff, planetRadius }) {
  const geometry = new THREE.RingGeometry(inner, outer, 256, 4);
  // UVs of RingGeometry are not radial; recompute so we can shade by radius.
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  uv.needsUpdate = true;

  const uniforms = {
    uBands: { value: bandMap },
    uInner: { value: inner },
    uOuter: { value: outer },
    uColor: { value: new THREE.Color(color) },
    uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    uPlanetCenter: { value: new THREE.Vector3() },
    uPlanetRadius: { value: planetRadius },
    uCamPos: { value: new THREE.Vector3() },
  };

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.ShaderMaterial({
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  mesh.userData.uniforms = uniforms;
  mesh.renderOrder = 1;
  return mesh;
}

/* ================================================================== *
 *  Warp streak overlay (screen space)
 * ================================================================== */

const WARP_FRAG = /* glsl */ `
  uniform float uIntensity;
  uniform float uTime;
  uniform vec3  uTint;
  varying vec2 vUv;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main(){
    if(uIntensity <= 0.001) discard;
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    vec2 dir = r > 0.0001 ? uv / r : vec2(0.0);

    // Radial streak field
    float streak = 0.0;
    for(int i = 0; i < 3; i++){
      float scale = 42.0 + float(i) * 31.0;
      float ang = atan(dir.y, dir.x);
      float band = hash(vec2(floor(ang * scale), float(i) * 7.0));
      float phase = fract(band * 9.0 + uTime * (2.4 + float(i) * 1.3));
      float line = smoothstep(0.92, 1.0, 1.0 - abs(fract(ang * scale) - 0.5) * 2.0);
      streak += line * pow(phase, 5.0);
    }

    float radial = smoothstep(0.06, 0.72, r);
    float core = smoothstep(0.5, 0.0, r) * 0.6;
    float a = (streak * radial * 1.4 + core) * uIntensity;
    gl_FragColor = vec4(uTint * a, a);
  }
`;

export function createWarpOverlay() {
  const uniforms = {
    uIntensity: { value: 0 },
    uTime: { value: 0 },
    uTint: { value: new THREE.Color(0x9fd8ff) },
  };
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: WARP_FRAG,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    })
  );
  quad.frustumCulled = false;
  scene.add(quad);
  return { scene, camera, uniforms, quad };
}

/* ================================================================== *
 *  Volumetric-ish nebula shell (adds depth on top of the skybox)
 * ================================================================== */

const NEBULA_FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  ${NOISE_GLSL}

  void main(){
    vec3 p = normalize(vWorldPos);
    float n = fbm3(p * 2.4 + vec3(0.0, uTime * 0.01, 0.0), 4);
    float d = smoothstep(0.05, 0.72, n);
    vec3 c = mix(uColorA, uColorB, smoothstep(-0.2, 0.6, n));
    gl_FragColor = vec4(c * d * uOpacity, d * uOpacity);
  }
`;

const NEBULA_VERT = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main(){
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export function createNebulaShell({ radius, colorA = 0x2a2f7a, colorB = 0x9b3f8f, opacity = 0.5 }) {
  const uniforms = {
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uTime: { value: 0 },
    uOpacity: { value: opacity },
  };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 64, 48),
    new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    })
  );
  mesh.userData.uniforms = uniforms;
  mesh.renderOrder = -10;
  return mesh;
}

/* ================================================================== *
 *  Cockpit holographic HUD panel (in-world 3D reticle)
 * ================================================================== */

const HOLO_FRAG = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uMode;
  varying vec2 vUv;

  float ring(float d, float r, float w){ return smoothstep(w, 0.0, abs(d - r)); }

  void main(){
    vec2 uv = vUv - 0.5;
    float r = length(uv);
    float a = 0.0;

    // Outer reticle ring with tick marks
    a += ring(r, 0.34, 0.006) * 0.9;
    float ang = atan(uv.y, uv.x);
    float ticks = smoothstep(0.86, 1.0, abs(sin(ang * 12.0)));
    a += ring(r, 0.40, 0.004) * ticks * 0.8;

    // Inner cross
    float cross = 0.0;
    cross += smoothstep(0.0035, 0.0, abs(uv.x)) * smoothstep(0.16, 0.03, abs(uv.y));
    cross += smoothstep(0.0035, 0.0, abs(uv.y)) * smoothstep(0.16, 0.03, abs(uv.x));
    a += cross * 0.85;

    // Centre pip
    a += smoothstep(0.012, 0.004, r) * 1.2;

    // Scan sweep
    float sweep = fract(ang / 6.2831853 + uTime * 0.18);
    a += ring(r, 0.34, 0.02) * pow(1.0 - sweep, 9.0) * 0.55;

    // Target bracket mode
    if(uMode > 0.5){
      float bx = smoothstep(0.16, 0.15, abs(abs(uv.x) - 0.12)) * smoothstep(0.22, 0.10, abs(uv.y));
      float by = smoothstep(0.16, 0.15, abs(abs(uv.y) - 0.12)) * smoothstep(0.22, 0.10, abs(uv.x));
      a += (bx + by) * 0.8;
    }

    a *= uOpacity;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

export function createHologram(color = 0x63e8ff, opacity = 0.55) {
  const uniforms = {
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
    uTime: { value: 0 },
    uMode: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.72),
    new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: HOLO_FRAG,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    })
  );
  mesh.userData.uniforms = uniforms;
  mesh.renderOrder = 30;
  return mesh;
}

/* ================================================================== *
 *  Engine plume (cone with animated noise)
 * ================================================================== */

const PLUME_FRAG = /* glsl */ `
  uniform vec3 uColorCore;
  uniform vec3 uColorEdge;
  uniform float uTime;
  uniform float uPower;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3))) * 43758.5453); }

  void main(){
    float t = vUv.y;
    float n = hash(floor(vec2(vUv.x * 22.0, vUv.y * 34.0 - uTime * 9.0)));
    float flick = 0.82 + 0.18 * n;
    float core = pow(t, 1.9);
    float edge = smoothstep(0.0, 0.35, abs(vUv.x - 0.5) * 2.0);
    vec3 c = mix(uColorCore, uColorEdge, t * 0.9);
    float a = core * flick * uPower * mix(0.35, 1.0, edge);
    gl_FragColor = vec4(c * a, a);
  }
`;

export function createPlume(length = 1, radius = 0.2, core = 0x9fe4ff, edge = 0x2a5cff) {
  const uniforms = {
    uColorCore: { value: new THREE.Color(core) },
    uColorEdge: { value: new THREE.Color(edge) },
    uTime: { value: 0 },
    uPower: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, length, 20, 6, true),
    new THREE.ShaderMaterial({
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: PLUME_FRAG,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  mesh.userData.uniforms = uniforms;
  return mesh;
}
