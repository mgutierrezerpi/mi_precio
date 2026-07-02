const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const SP = __dirname;
const OUT = path.join(SP, 'shots');
const tok = JSON.parse(fs.readFileSync(path.join(SP, 'tok.json'), 'utf8'));
const ORIGIN = 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => {
    localStorage.setItem('auth_token', t.token);
    localStorage.setItem('auth_state', JSON.stringify({ user: t.user, tenant: t.tenant }));
  }, tok);
  const page = await ctx.newPage();
  await page.goto(ORIGIN + '/admin/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  // Click the "Plan y facturación" sub-tab
  await page.getByText('Plan y facturación', { exact: false }).first().click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(OUT, 'billing.png') });
  console.log('shot billing');
  await browser.close();
})().catch((e) => { console.error('ERR', e); process.exit(1); });
