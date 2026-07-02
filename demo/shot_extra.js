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
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => {
    localStorage.setItem('auth_token', t.token);
    localStorage.setItem('auth_state', JSON.stringify({ user: t.user, tenant: t.tenant }));
  }, tok);
  const p = await ctx.newPage();
  for (const [name, url] of [['clientes_full','/admin/clientes'], ['reportes_full','/admin/reportes']]) {
    await p.goto(ORIGIN + url, { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForTimeout(1300); await autoscroll(p);
    await p.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
    const h = await p.evaluate(() => document.body.scrollHeight);
    console.log(name, 'h=', h);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
