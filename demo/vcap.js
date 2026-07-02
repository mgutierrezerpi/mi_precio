const { chromium } = require('playwright-core');
const path = require('path');
const fileUrl = 'file:///' + path.join(__dirname, 'tour.html').replace(/\\/g, '/');
const scene = parseInt(process.argv[2] || '1', 10);
const frac = parseFloat(process.argv[3] || '0.55');
const name = process.argv[4] || 'cap';
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const p = await ctx.newPage();
  await p.goto(fileUrl); await p.waitForTimeout(2500);
  await p.evaluate((n) => { setPaused(true); go(n); }, scene);
  await p.waitForTimeout(2500);
  await p.evaluate((f) => { document.getAnimations().forEach(a => { const d = a.effect.getTiming().duration; if (d > 3000) { a.pause(); a.currentTime = d * f; } }); }, frac);
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(__dirname, 'shots', 'tour_' + name + '.png') });
  console.log('done', name);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
