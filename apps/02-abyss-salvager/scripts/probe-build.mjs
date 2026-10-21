/**
 * Headless timing probe: builds the machine outside the browser so a slow or
 * stuck geometry build can be located without a browser in the loop.
 *
 *   node scripts/probe-build.mjs
 */

import * as THREE from 'three';
import { buildHarvester } from '../src/model/harvester.js';
import { createState } from '../src/model/params.js';
import { createCarapaceTexture, createBrushedTexture } from '../src/model/textures.js';

const t0 = Date.now();
const mark = (label) => console.log(`[probe] ${label}: ${Date.now() - t0} ms`);

mark('start');
const assets = {
  carapaceMap: createCarapaceTexture(512, 7),
  brushedMap: createBrushedTexture(256, 21),
};
mark('textures');

const state = createState();
mark('state');

const machine = buildHarvester(state, assets);
mark('build');

let tris = 0;
let meshes = 0;
machine.root.traverse((o) => {
  if (!o.isMesh) return;
  meshes++;
  const g = o.geometry;
  tris += (g.index ? g.index.count : g.attributes.position.count) / 3;
});
console.log(`[probe] meshes=${meshes} tris=${Math.round(tris)}`);
console.log(`[probe] length=${machine.lengthMetres.toFixed(1)} m  Ø=${machine.diameterMetres.toFixed(1)} m`);
mark('done');
