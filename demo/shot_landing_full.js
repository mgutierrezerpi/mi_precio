const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(1500);
  // Trigger reveal-on-scroll animations by scrolling to the bottom and back to top.
  await p.evaluate(async () => {
    await new Promise((res) => {
      let y = 0; const step = () => { y += 600; window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 60); else res(); };
      step();
    });
  });
  await p.waitForTimeout(600);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(__dirname, 'shots', 'landing_full.png'), fullPage: true });
  const dim = await p.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight }));
  console.log('landing_full captured', JSON.stringify(dim));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
