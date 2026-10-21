const task = await taskSpace('playtime-atlas-online-qa');
const page = task.page('p1');
await page.cdp('Network.enable', {});
await page.cdp('Log.enable', {});
await page.goto('https://kingkazmax.github.io/playtime-atlas-20261021/');
await page.waitForLoadState({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1500);
console.log({ spaceId: task.spaceId, label: page.label, url: await page.url(), title: await page.title() });
const evs = await page.events();
console.log('event count', Array.isArray(evs) ? evs.length : typeof evs);
const kinds = {};
for (const e of (Array.isArray(evs) ? evs : [])) {
  const k = e.method || e.type || e.name || JSON.stringify(Object.keys(e));
  kinds[k] = (kinds[k] || 0) + 1;
}
console.log('event kinds', kinds);
console.log('sample', JSON.stringify((Array.isArray(evs) ? evs : []).slice(0, 6)).slice(0, 1200));
