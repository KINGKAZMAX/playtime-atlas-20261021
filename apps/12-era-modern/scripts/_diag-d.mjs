// 诊断 D：mobile:true 视口下，Ego 认为「不在视口内」的真实原因
const BASE = 'http://127.0.0.1:4399/repo/prism-era';

const task = await taskSpace('prism-era-ds-verify-20261022');
const page = task.page('p1');

async function probe(label) {
  const g = await page.evaluate(() => {
    const b = document.getElementById('open-settings');
    const r = b ? b.getBoundingClientRect() : null;
    const cs = b ? getComputedStyle(b) : null;
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visual: window.visualViewport ? {
        w: Math.round(window.visualViewport.width),
        h: Math.round(window.visualViewport.height),
        scale: window.visualViewport.scale,
      } : null,
      screen: { w: screen.width, h: screen.height },
      scrollY: Math.round(window.scrollY),
      btn: r ? {
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
        inVisualViewport: r.top >= 0 && r.bottom <= (window.visualViewport ? window.visualViewport.height : window.innerHeight),
      } : null,
    };
  });
  console.log(label, JSON.stringify(g));
}

await page.cdp('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: true,
});
await page.waitForTimeout(350);
await page.goto(BASE + '/#/');
await page.waitForTimeout(800);
await probe('mobile:true 1440 ->');

try {
  await page.click('loc=css:#open-settings');
  console.log('click ok');
} catch (e) {
  console.log('click error:', e.message);
}
await page.waitForTimeout(500);
console.log('modal open:', await page.evaluate(() => !!document.querySelector('.modal')));

// 对照：mobile:false
await page.cdp('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false,
});
await page.waitForTimeout(350);
await page.goto(BASE + '/#/');
await page.waitForTimeout(800);
await probe('mobile:false 1440 ->');
try {
  await page.click('loc=css:#open-settings');
  console.log('click ok (mobile:false)');
} catch (e) {
  console.log('click error (mobile:false):', e.message);
}
await page.waitForTimeout(500);
console.log('modal open:', await page.evaluate(() => !!document.querySelector('.modal')));
