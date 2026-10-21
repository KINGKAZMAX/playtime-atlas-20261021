import * as THREE from 'three';
import { makeHullTexture, makeRoughnessTexture, canvasTextureLocal } from '../gfx/Procedural.js';
import { createHologram, createPlume } from '../gfx/Shaders.js';

/* ------------------------------------------------------------------ *
 *  Angular (chamfered-octagon) shapes — the canopy is built from
 *  hard-cut facets rather than soft rounded rectangles.
 * ------------------------------------------------------------------ */

function octagonPath(target, w, h, c) {
  const x = -w / 2, y = -h / 2;
  target.moveTo(x + c, y);
  target.lineTo(x + w - c, y);
  target.lineTo(x + w, y + c);
  target.lineTo(x + w, y + h - c);
  target.lineTo(x + w - c, y + h);
  target.lineTo(x + c, y + h);
  target.lineTo(x, y + h - c);
  target.lineTo(x, y + c);
  target.closePath();
  return target;
}

function makeFacetFrame(outerW, outerH, outerC, innerW, innerH, innerC, depth = 0.3) {
  const shape = octagonPath(new THREE.Shape(), outerW, outerH, outerC);
  shape.holes.push(octagonPath(new THREE.Path(), innerW, innerH, innerC));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 1,
    curveSegments: 1,
  });
  geo.center();
  return geo;
}

/** A wedge-shaped slab used for brows, sills and console cheeks. */
function makeWedge(w, h, d, skew = 0.35) {
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, -h / 2);
  shape.lineTo(w / 2, -h / 2);
  shape.lineTo(w / 2 - skew, h / 2);
  shape.lineTo(-w / 2 + skew, h / 2);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 1 });
  geo.translate(0, 0, -d / 2);
  return geo;
}

/* ------------------------------------------------------------------ *
 *  Cockpit — hard-edged, faceted, heavy-browed canopy
 * ------------------------------------------------------------------ */

export function buildCockpit({ mfdTexture, gaugeTexture, quality }) {
  const group = new THREE.Group();
  group.name = 'cockpit';

  const hullTex = canvasTextureLocal(makeHullTexture(512, 411, [0.19, 0.17, 0.14]), {
    repeat: [2, 2], aniso: quality.anisotropy,
  });
  const roughTex = canvasTextureLocal(makeRoughnessTexture(256, 88), { srgb: false, repeat: [2, 2] });

  const frameMat = new THREE.MeshStandardMaterial({
    map: hullTex, roughnessMap: roughTex, roughness: 0.58, metalness: 0.62, color: 0xb9b2a6,
  });
  const shellMat = new THREE.MeshStandardMaterial({
    map: hullTex, roughnessMap: roughTex, roughness: 0.76, metalness: 0.42, color: 0x6a6259,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x17140f, roughness: 0.45, metalness: 0.82 });
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x100e0b, roughness: 0.96, metalness: 0.04 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x110d08, roughness: 0.28, metalness: 0.9,
    emissive: 0x3a2408, emissiveIntensity: 1.0,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xb98a34, roughness: 0.3, metalness: 1.0,
    emissive: 0x2a1c06, emissiveIntensity: 0.8,
  });

  /* ---------------- Main canopy: octagonal visor ---------------- */
  const visor = new THREE.Mesh(
    makeFacetFrame(4.05, 2.05, 0.52, 3.32, 1.34, 0.40, 0.32),
    frameMat
  );
  visor.position.set(0, 0.30, -1.04);
  visor.rotation.x = 0.025;
  group.add(visor);

  // Deep inner lip so the aperture reads as a thick machined opening.
  const lip = new THREE.Mesh(
    makeFacetFrame(3.46, 1.46, 0.44, 3.32, 1.34, 0.40, 0.34),
    trimMat
  );
  lip.position.set(0, 0.30, -0.95);
  group.add(lip);

  // Central spine strut splitting the aperture into two panes.
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.075, 1.38, 0.30), trimMat);
  spine.position.set(0, 0.30, -0.90);
  group.add(spine);
  const spineCap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 0.34), goldMat);
  spineCap.position.set(0, 0.30, -0.90);
  group.add(spineCap);

  /* ---------------- Heavy angular brow ---------------- */
  const brow = new THREE.Mesh(makeWedge(3.95, 0.44, 0.72, 0.5), shellMat);
  brow.position.set(0, 1.16, -0.86);
  brow.rotation.x = -0.22;
  group.add(brow);

  const browLip = new THREE.Mesh(makeWedge(3.55, 0.16, 0.30, 0.42), accentMat);
  browLip.position.set(0, 0.95, -0.76);
  browLip.rotation.x = -0.22;
  group.add(browLip);

  // Rivet strip along the brow
  const rivetGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.03, 6);
  for (let i = 0; i < 16; i++) {
    const r = new THREE.Mesh(rivetGeo, goldMat);
    r.position.set(-1.78 + i * 0.237, 0.99, -0.545);
    r.rotation.x = Math.PI / 2 - 0.22;
    group.add(r);
  }

  /* ---------------- Side canopy wings ---------------- */
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(
      makeFacetFrame(1.72, 1.62, 0.40, 1.30, 1.16, 0.30, 0.26),
      frameMat
    );
    wing.position.set(side * 1.66, 0.26, -0.36);
    wing.rotation.y = side * 1.02;
    wing.rotation.z = side * 0.04;
    group.add(wing);

    // Rear cheek rail
    const rail = new THREE.Mesh(makeWedge(0.30, 0.30, 2.2, 0.10), shellMat);
    rail.position.set(side * 1.68, 0.30, 0.34);
    rail.rotation.y = side * 0.30;
    group.add(rail);
  }

  // Roof spine
  const roof = new THREE.Mesh(makeWedge(0.32, 0.24, 2.1, 0.08), shellMat);
  roof.position.set(0, 0.99, 0.26);
  group.add(roof);

  /* ---------------- Dashboard: angular swept desk ---------------- */
  const dash = new THREE.Group();
  dash.position.set(0, -0.46, -0.62);
  dash.rotation.x = -0.50;
  group.add(dash);

  const dashBody = new THREE.Mesh(makeWedge(2.75, 0.92, 0.16, 0.26), shellMat);
  dash.add(dashBody);

  const dashEdge = new THREE.Mesh(makeWedge(2.90, 0.13, 0.22, 0.30), trimMat);
  dashEdge.position.y = 0.50;
  dash.add(dashEdge);

  // Left: hooded rectangular MFD
  const hood = new THREE.Mesh(makeWedge(1.00, 0.80, 0.16, 0.14), trimMat);
  hood.position.set(-0.72, 0.04, 0.09);
  dash.add(hood);

  const screenMat = new THREE.MeshBasicMaterial({ map: mfdTexture, toneMapped: false });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.64), screenMat);
  screen.position.set(-0.72, 0.04, 0.135);
  dash.add(screen);

  // Right: round CRT repeater in a raised housing
  const crtHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.30, 0.33, 0.20, 28),
    shellMat
  );
  crtHousing.rotation.x = Math.PI / 2;
  crtHousing.position.set(0.72, 0.10, 0.06);
  dash.add(crtHousing);

  const crtBezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.285, 0.035, 10, 30),
    goldMat
  );
  crtBezel.position.set(0.72, 0.10, 0.165);
  dash.add(crtBezel);

  const gaugeMat = new THREE.MeshBasicMaterial({ map: gaugeTexture, toneMapped: false });
  const crtScreen = new THREE.Mesh(new THREE.CircleGeometry(0.268, 32), gaugeMat);
  crtScreen.position.set(0.72, 0.10, 0.158);
  dash.add(crtScreen);

  // Domed cover glass over the CRT
  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.30, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.34),
    new THREE.MeshPhysicalMaterial({
      color: 0xdfe7f2, transparent: true, opacity: 0.16,
      roughness: 0.06, metalness: 0.0, transmission: 0.6, side: THREE.DoubleSide,
    })
  );
  glass.rotation.x = -Math.PI / 2;
  glass.position.set(0.72, 0.10, 0.15);
  dash.add(glass);

  // Three small tell-tale gauges between the MFD and the CRT
  const telltale = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.014, 8, 18), goldMat);
    ring.position.set(0.10 + i * 0.17, 0.30, 0.10);
    dash.add(ring);
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.055, 18),
      new THREE.MeshBasicMaterial({ color: 0x0d0906 })
    );
    face.position.set(0.10 + i * 0.17, 0.30, 0.092);
    dash.add(face);
    telltale.push(ring);
  }

  // Indicator lamps
  const lampColors = [0xffc470, 0x6FCF97, 0xE2573C, 0xE9A93D];
  for (let i = 0; i < 4; i++) {
    const lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.032, 12),
      new THREE.MeshBasicMaterial({ color: lampColors[i] })
    );
    lamp.position.set(-0.22 + (i % 2) * 0.09, -0.28 - Math.floor(i / 2) * 0.10, 0.092);
    dash.add(lamp);
  }

  /* ---------------- Side consoles ---------------- */
  const sideButtons = [];
  for (const side of [-1, 1]) {
    const console3d = new THREE.Group();
    console3d.position.set(side * 1.06, -0.64, -0.10);
    console3d.rotation.y = side * 0.44;
    console3d.rotation.x = -0.40;
    group.add(console3d);

    const box = new THREE.Mesh(makeWedge(0.56, 0.18, 1.30, 0.10), shellMat);
    console3d.add(box);

    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.035, 0.11),
        new THREE.MeshStandardMaterial({
          color: 0x1d1913,
          emissive: lampColors[i % lampColors.length],
          emissiveIntensity: 0.8,
          roughness: 0.35, metalness: 0.35,
        })
      );
      b.position.set(0, 0.10, -0.46 + i * 0.185);
      console3d.add(b);
      sideButtons.push(b);
    }

    // Control stick: angular trigger grip
    const stickBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.09, 10), trimMat);
    stickBase.position.set(side * 0.06, 0.13, 0.40);
    console3d.add(stickBase);
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, 0.30, 8), rubberMat);
    stick.position.set(side * 0.06, 0.29, 0.40);
    stick.rotation.z = side * 0.14;
    console3d.add(stick);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.08), rubberMat);
    grip.position.set(side * 0.06, 0.46, 0.40);
    grip.rotation.z = side * 0.14;
    console3d.add(grip);
  }

  /* ---------------- Overhead panel ---------------- */
  const overhead = new THREE.Group();
  overhead.position.set(0, 0.84, -0.20);
  overhead.rotation.x = 0.78;
  group.add(overhead);
  const ohBody = new THREE.Mesh(makeWedge(1.6, 0.14, 0.64, 0.14), shellMat);
  overhead.add(ohBody);
  for (let i = 0; i < 8; i++) {
    const sw = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.055, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x2c261d, roughness: 0.45, metalness: 0.65 })
    );
    sw.position.set(-0.6 + (i % 4) * 0.40, 0.08, -0.14 + Math.floor(i / 4) * 0.27);
    overhead.add(sw);
  }

  /* ---------------- Floor & lower console ---------------- */
  const floor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 2.6), rubberMat);
  floor.position.set(0, -1.34, 0.12);
  group.add(floor);

  const lower = new THREE.Mesh(makeWedge(1.7, 0.44, 0.95, 0.22), shellMat);
  lower.position.set(0, -1.04, 0.44);
  group.add(lower);

  // Emissive trim strips (warm cabin lighting)
  const stripMat = new THREE.MeshBasicMaterial({ color: 0xc78b3a });
  for (const side of [-1, 1]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 1.95), stripMat);
    strip.position.set(side * 1.46, -0.44, -0.06);
    group.add(strip);
  }
  const dashStrip = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.016, 0.016), stripMat);
  dashStrip.position.set(0, -0.28, -0.58);
  group.add(dashStrip);

  /* ---------------- Holographic HUD reticle ---------------- */
  const holo = createHologram(0xE9A93D, 0.40);
  holo.position.set(0, 0.14, -0.82);
  holo.scale.setScalar(0.58);
  group.add(holo);

  const emitter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.065, 0.03, 10),
    new THREE.MeshBasicMaterial({ color: 0xe8b45c })
  );
  emitter.position.set(0, 0.02, -0.56);
  group.add(emitter);

  /* ---------------- Interior lighting ---------------- */
  const cabinLight = new THREE.PointLight(0xffc98a, 0.55, 6, 2);
  cabinLight.position.set(0, 0.55, -0.50);
  group.add(cabinLight);

  const warmLight = new THREE.PointLight(0xff9a4d, 0.32, 4, 2);
  warmLight.position.set(0, -0.48, -0.28);
  group.add(warmLight);

  return {
    group,
    mfd: { screen, screenMat },
    gauge: { crtScreen, gaugeMat, glass },
    hologram: holo,
    sideButtons,
    telltale,
    cabinLight,
  };
}

/* ------------------------------------------------------------------ *
 *  Exterior ship — arrowhead hull with dorsal spine and canted nacelles
 * ------------------------------------------------------------------ */

export function buildExteriorShip({ quality }) {
  const group = new THREE.Group();
  group.name = 'exterior-ship';

  const hullTex = canvasTextureLocal(makeHullTexture(512, 912, [0.34, 0.31, 0.26]), {
    repeat: [2, 2], aniso: quality.anisotropy,
  });
  const hullMat = new THREE.MeshStandardMaterial({
    map: hullTex, roughness: 0.42, metalness: 0.85, color: 0xd6cfc2,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x16140f, roughness: 0.42, metalness: 0.88 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xb98a34, roughness: 0.28, metalness: 1.0 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1a1408, roughness: 0.1, metalness: 0.6,
    emissive: 0x3a2a0c, emissiveIntensity: 0.8,
  });

  /* ---- Arrowhead main hull (extruded delta, not a lathe) ---- */
  const delta = new THREE.Shape();
  delta.moveTo(0, 2.55);        // nose
  delta.lineTo(0.42, 1.35);
  delta.lineTo(0.62, -0.35);
  delta.lineTo(0.40, -1.55);
  delta.lineTo(-0.40, -1.55);
  delta.lineTo(-0.62, -0.35);
  delta.lineTo(-0.42, 1.35);
  delta.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(delta, {
    depth: 0.42, bevelEnabled: true,
    bevelThickness: 0.13, bevelSize: 0.13, bevelSegments: 2, curveSegments: 1,
  });
  hullGeo.rotateX(-Math.PI / 2);
  hullGeo.translate(0, 0, 0);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.scale.set(1.35, 1, 1);
  group.add(hull);

  /* ---- Swept wings ---- */
  for (const side of [-1, 1]) {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.75);
    wingShape.lineTo(2.15, -0.55);
    wingShape.lineTo(2.25, -1.05);
    wingShape.lineTo(0.15, -0.95);
    wingShape.closePath();
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04,
      bevelSegments: 1, curveSegments: 1,
    });
    wingGeo.rotateX(-Math.PI / 2);
    const wing = new THREE.Mesh(wingGeo, hullMat);
    wing.scale.x = side;
    wing.position.set(side * 0.42, -0.04, 0.28);
    wing.rotation.z = side * 0.10;
    group.add(wing);

    // Wing tip pylon
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.52, 0.72), darkMat);
    pylon.position.set(side * 2.28, 0.20, -0.20);
    group.add(pylon);

    // Canted nacelle
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.30, 1.35, 18), darkMat);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.rotation.z = side * 0.16;
    nacelle.position.set(side * 0.92, -0.14, -0.55);
    group.add(nacelle);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.038, 8, 20), trimMat);
    ring.position.set(side * 0.92, -0.14, -1.18);
    group.add(ring);

    const plume = createPlume(2.8, 0.26, 0xffe0a8, 0xd06a1e);
    plume.rotation.x = Math.PI / 2;
    plume.position.set(side * 0.92, -0.14, -1.32 - 1.4);
    group.add(plume);
    group.userData.plumes = group.userData.plumes || [];
    group.userData.plumes.push(plume);
  }

  /* ---- Dorsal spine ---- */
  const spine = new THREE.Mesh(makeWedge(0.34, 0.46, 2.2, 0.12), hullMat);
  spine.rotation.x = Math.PI / 2;
  spine.position.set(0, 0.40, -0.35);
  group.add(spine);

  const fin = new THREE.Mesh(makeWedge(0.10, 0.95, 0.85, 0.22), hullMat);
  fin.rotation.x = Math.PI / 2;
  fin.position.set(0, 0.72, -1.20);
  group.add(fin);

  /* ---- Canopy ---- */
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.40, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat
  );
  canopy.scale.set(1, 0.72, 1.9);
  canopy.position.set(0, 0.24, 1.00);
  group.add(canopy);

  /* ---- Nose blade ---- */
  const blade = new THREE.Mesh(new THREE.ConeGeometry(0.13, 1.0, 8), trimMat);
  blade.rotation.x = -Math.PI / 2;
  blade.position.set(0, 0, 2.75);
  group.add(blade);

  /* ---- Navigation lights ---- */
  const navLights = [];
  for (const [pos, color] of [
    [new THREE.Vector3(-2.30, 0.20, -0.20), 0xff4d5e],
    [new THREE.Vector3(2.30, 0.20, -0.20), 0x4dff9a],
    [new THREE.Vector3(0, 1.12, -1.20), 0xfff0d0],
  ]) {
    const l = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshBasicMaterial({ color })
    );
    l.position.copy(pos);
    group.add(l);
    navLights.push(l);
  }

  return { group, plumes: group.userData.plumes || [], navLights, hullMat };
}
