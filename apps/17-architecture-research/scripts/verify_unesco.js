#!/usr/bin/env node
/**
 * Verify UNESCO World Heritage list IDs by fetching the official page and
 * extracting only the og:title / <title>. Prints a TSV to stdout.
 * Usage: node verify_unesco.js 439 440 441 ...
 */
const ids = process.argv.slice(2);

async function titleOf(id) {
  for (let a = 0; a < 4; a++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 25000);
      const res = await fetch(`https://whc.unesco.org/en/list/${id}/`, {
        signal: ctl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36' },
        redirect: 'follow',
      });
      clearTimeout(t);
      if (!res.ok) { await new Promise((r) => setTimeout(r, 2000 * (a + 1))); continue; }
      const html = await res.text();
      const m = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]{3,160})<\/title>/);
      if (m) return m[1].replace(/&#x20;/g, ' ').replace(/&amp;/g, '&').trim();
      await new Promise((r) => setTimeout(r, 2000 * (a + 1)));
    } catch (e) {
      await new Promise((r) => setTimeout(r, 2000 * (a + 1)));
    }
  }
  return null;
}

(async () => {
  const out = [];
  const BATCH = 6;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const res = await Promise.all(slice.map(async (id) => [id, await titleOf(id)]));
    res.forEach(([id, t]) => { out.push([id, t]); console.log(`${id}\t${t || 'UNREACHABLE'}`); });
  }
})();
