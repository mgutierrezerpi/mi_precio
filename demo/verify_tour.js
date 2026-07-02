const { chromium } = require('playwright-core');
const path = require('path');
const fileUrl = 'file:///' + path.join(__dirname, 'tour.html').replace(/\\/g, '/');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  await p.goto(fileUrl);
  await p.waitForTimeout(600);
  async function shot(sceneIdx, name, frac){
    await p.evaluate((n) => { setPaused(true); go(n); }, sceneIdx);
    await p.waitForTimeout(2600);
    // seek the scroll animation to a fraction of its duration, if present
    await p.evaluate((f) => {
      document.getAnimations().forEach((a) => { a.pause();
        a.currentTime = a.effect.getTiming().duration * f; });
    }, frac ?? 0);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(__dirname, 'shots', 'tour_' + name + '.png') });
    console.log('scene', sceneIdx, name);
  }
  await shot(2, 'dash_mid', 0.5);
  await shot(3, 'prod_mid', 0.5);
  await shot(6, 'pub_mid', 0.5);
  await shot(7, 'phone_mid', 0.5);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
