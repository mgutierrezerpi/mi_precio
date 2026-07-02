const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const SP = __dirname, OUT = path.join(SP, 'shots');
const tok = JSON.parse(fs.readFileSync(path.join(SP, 'tok.json'), 'utf8'));
const ORIGIN = 'http://localhost:3000';

async function autoscroll(p){
  await p.evaluate(async () => {
    await new Promise((res) => { let y=0; const s=()=>{ y+=500; window.scrollTo(0,y);
      if(y<document.body.scrollHeight) setTimeout(s,50); else res(); }; s(); });
  });
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0,0));
  await p.waitForTimeout(600);
}

(async () => {
  const b = await chromium.launch({ channel: 'chrome', headless: true });

  // Authed desktop full pages
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => {
    localStorage.setItem('auth_token', t.token);
    localStorage.setItem('auth_state', JSON.stringify({ user: t.user, tenant: t.tenant }));
  }, tok);
  const p = await ctx.newPage();
  for (const [name, url] of [['dashboard_full','/admin'], ['productos_full','/admin/items']]) {
    await p.goto(ORIGIN + url, { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(1200); await autoscroll(p);
    await p.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
    console.log(name);
  }
  await ctx.close();

  // Public desktop full page
  const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p2 = await ctx2.newPage();
  await p2.goto(ORIGIN + '/p/' + tok.tenant.subdomain, { waitUntil: 'networkidle', timeout: 45000 });
  await p2.waitForTimeout(1500); await autoscroll(p2);
  await p2.screenshot({ path: path.join(OUT, 'publica_full.png'), fullPage: true });
  console.log('publica_full');
  await ctx2.close();

  // Public mobile full page
  const ctx3 = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p3 = await ctx3.newPage();
  await p3.goto(ORIGIN + '/p/' + tok.tenant.subdomain, { waitUntil: 'networkidle', timeout: 45000 });
  await p3.waitForTimeout(1500); await autoscroll(p3);
  await p3.screenshot({ path: path.join(OUT, 'publica_movil_full.png'), fullPage: true });
  console.log('publica_movil_full');

  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
