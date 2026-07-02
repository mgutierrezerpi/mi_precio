const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const SP = __dirname, OUT = path.join(SP, 'shots');
const tok = JSON.parse(fs.readFileSync(path.join(SP, 'tok.json'), 'utf8'));
const ORIGIN = 'http://localhost:3000';

async function autoscroll(p){
  await p.evaluate(async () => { await new Promise((res)=>{ let y=0; const s=()=>{ y+=500; window.scrollTo(0,y);
    if(y<document.body.scrollHeight) setTimeout(s,50); else res(); }; s(); }); });
  await p.waitForTimeout(400); await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(500);
}

(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });

  // Appearance tab (authed)
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => {
    localStorage.setItem('auth_token', t.token);
    localStorage.setItem('auth_state', JSON.stringify({ user: t.user, tenant: t.tenant }));
  }, tok);
  const p = await ctx.newPage();
  await p.goto(ORIGIN + '/admin/settings', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await p.getByText('Marca y apariencia', { exact: false }).first().click();
  await p.waitForTimeout(1200);
  // Set the brand-color hex the way a user would, so the swatch + preview reflect it.
  await p.evaluate((val) => {
    const el = [...document.querySelectorAll('input')].find((i) => /^#?[0-9a-fA-F]{6}$/.test(i.value));
    if (el) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, '#EA580C');
  await p.waitForTimeout(1000);
  await p.screenshot({ path: path.join(OUT, 'appearance_full.png'), fullPage: true });
  const h = await p.evaluate(() => document.body.scrollHeight);
  console.log('appearance_full h=', h);
  await ctx.close();

  // Public desktop with NEW color
  const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p2 = await ctx2.newPage();
  await p2.goto(ORIGIN + '/p/' + tok.tenant.subdomain, { waitUntil: 'networkidle', timeout: 45000 });
  await p2.waitForTimeout(1500); await autoscroll(p2);
  await p2.screenshot({ path: path.join(OUT, 'publica_new_full.png'), fullPage: true });
  console.log('publica_new_full done');

  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
