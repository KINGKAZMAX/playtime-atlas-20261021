/**
 * A tiny Node module hook that lets the validator import the application's
 * data modules directly.
 *
 * The application source imports its vendored JSON the way Vite expects:
 *
 *     import upstream from './upstream/catalog.json';
 *
 * Vite resolves that at build time. Node 24, however, requires an explicit
 * `with { type: 'json' }` attribute for JSON modules — and adding one would
 * tie the source to a particular bundler's syntax.
 *
 * Rather than change the source, this hook intercepts `.json` loads and
 * returns them as an ES module with a default export. The validator then
 * exercises the *real* data modules — the same files the browser loads —
 * instead of a hand-rolled copy that could drift.
 *
 * Registered from scripts/validate.mjs with `module.register()`.
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:') && url.endsWith('.json')) {
    const raw = await readFile(fileURLToPath(url), 'utf8');
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${raw};`,
    };
  }
  return nextLoad(url, context);
}
