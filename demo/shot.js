const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const SP = __dirname;
const OUT = path.join(SP, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const tok = JSON.parse(fs.readFileSync(path.join(SP, 'tok.json'), 'utf8'));

const ORIGIN = 'http://localhost:3000';

// Which shots to take: node shot.js [all|public|admin]
const mode = process.argv[2] || 'all';

const adminShots = [
  ['dashboard', '/admin'],
  ['productos', '/admin/items'],
  ['listas',    '/admin/lists'],
  ['settings',  '/admin/settings'],
];

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
  });
  // Inject auth into localStorage before the app boots.
  await ctx.addInitScript((t) => {
    localStorage.setItem('auth_token', t.token);
    localStorage.setItem('auth_state', JSON.stringify({ user: t.user, tenant: t.tenant }));
  }, tok);

  const page = await ctx.newPage();

  async function grab(name, url, waitMs = 2800) {
    await page.goto(ORIGIN + url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(waitMs);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('shot', name, '->', url);
  }

  if (mode === 'all' || mode === 'landing') {
    await grab('landing', '/');
  }
  if (mode === 'all' || mode === 'admin') {
    for (const [name, url] of adminShots) await grab(name, url);
  }
  if (mode === 'all' || mode === 'public') {
    // Desktop public page
    await grab('publica', '/p/' + tok.tenant.subdomain);
    // Phone frame for the "para tus clientes" scene
    const phone = await ctx.newPage();
    await phone.setViewportSize({ width: 390, height: 844 });
    await phone.goto(ORIGIN + '/p/' + tok.tenant.subdomain, { waitUntil: 'domcontentloaded' });
    await phone.waitForTimeout(2800);
    await phone.screenshot({ path: path.join(OUT, 'publica_movil.png') });
    console.log('shot publica_movil');
  }

  await browser.close();
  console.log('OK done, mode=', mode);
}
run().catch((e) => { console.error('ERR', e); process.exit(1); });
