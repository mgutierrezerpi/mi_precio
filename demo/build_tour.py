# Builds a single self-contained tour.html with screenshots embedded as data URIs.
import base64, json, os

SP = os.path.dirname(__file__)
SHOTS = os.path.join(SP, "shots")

def datauri(fname):
    with open(os.path.join(SHOTS, fname), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()

imgs = {k: datauri(f"{k}.png") for k in
        ["landing_full", "dashboard_full", "productos_full", "listas", "billing",
         "publica_full", "publica_movil_full", "appearance_full", "publica_new_full",
         "clientes_full", "reportes_full"]}

# Brand logo for dark backgrounds (white lockup) — relative to the repo so it's portable
LOGO_PATH = os.path.join(SP, "..", "web_app", "public", "miprecio-logo-white-pencil.webp")
with open(LOGO_PATH, "rb") as f:
    logo_datauri = "data:image/webp;base64," + base64.b64encode(f.read()).decode()

# scene: image key | device | url | seconds | EN | ES
scenes = [
    ["title", "none", "", 7,
     "A simple way for any small business to build an online catalog and share a live price list — by link or QR.",
     "La forma simple de que cualquier comercio arme su catálogo online y comparta una lista de precios en vivo, por link o QR."],
    ["landing_full", "scroll", "miprecio.app", 22,
     "This is MiPrecio, a tool for small businesses. You load your products once and share an always-up-to-date price list by link or QR — no spreadsheets, no outdated PDFs sent over WhatsApp. Set it up in minutes, choose a plan that fits, and your prices stay in sync everywhere you share them.",
     "Este es MiPrecio, una herramienta para comercios y pymes. Cargás tus productos una vez y compartís una lista de precios siempre actualizada por link o QR — sin planillas ni PDFs viejos por WhatsApp. Lo configurás en minutos, elegís el plan que te sirve, y tus precios quedan sincronizados en todos lados donde los compartas."],
    ["dashboard_full", "scroll", "miprecio.app/admin", 12,
     "To sign in, the owner receives a one-time code by email and enters it — quick and secure. Inside, they see their dashboard: total products, published lists, customers and their public link.",
     "Para entrar, al dueño le llega un código por email y lo ingresa — rápido y seguro. Adentro ve su panel: productos, listas publicadas, clientes y su link público."],
    ["productos_full", "scroll", "miprecio.app/admin/products", 12,
     "The product catalog. Each item has a photo, a category, a price and an availability switch — and every change is instant.",
     "El catálogo de productos. Cada ítem tiene foto, categoría, precio y un switch de disponibilidad, y todo cambia al instante."],
    ["listas", "browser", "miprecio.app/admin/lists", 10,
     "Products are grouped into price lists. Each list gets its own public link and a QR code to share with customers.",
     "Los productos se agrupan en listas de precios. Cada lista tiene su link público y un QR para compartir con los clientes."],
    ["clientes_full", "browser", "miprecio.app/admin/customers", 10,
     "In 'Customers' you manage your client base: save each contact with their phone and email, and see who is new or recurring.",
     "En 'Clientes' gestionás tu cartera: guardás cada contacto con su teléfono y email, y ves quiénes son nuevos o recurrentes."],
    ["reportes_full", "browser", "miprecio.app/admin/reports", 11,
     "And in 'Reports' you track how your catalog performs: visits, QR scans, channels and recent activity — all live.",
     "Y en 'Reportes' medís el rendimiento de tu catálogo: visitas, escaneos de QR, canales y actividad reciente, todo en vivo."],
    ["publica_full", "scroll", "miprecio.app/p/cafe-aurora", 13,
     "And this is what the customer sees: a clean public catalog — no app, no login. When the owner changes a price, it updates here instantly.",
     "Y esto es lo que ve el cliente: un catálogo público y limpio, sin app ni login. Si el dueño cambia un precio, se actualiza acá al instante."],
    ["publica_movil_full", "phonescroll", "miprecio.app/p/cafe-aurora", 18,
     "It is fully mobile-friendly — perfect to share on WhatsApp or from a QR code on the counter.",
     "Es totalmente responsive: ideal para compartir por WhatsApp o desde un QR en el mostrador."],
    ["billing", "browser", "miprecio.app/admin/settings", 12,
     "Customers subscribe to a plan — Micro, Plus or Pro. Payments are processed through Lemon Squeezy, and the plan activates automatically once the payment is confirmed.",
     "El cliente se suscribe a un plan: Micro, Plus o Pro. Los pagos se procesan con Lemon Squeezy y el plan se activa automáticamente al confirmarse el pago."],
    ["appearance_full", "browser", "miprecio.app/admin/settings", 11,
     "In 'Brand & appearance' you can customize your public list: upload your logo and pick your brand color so everything matches your identity.",
     "En 'Marca y apariencia' personalizás tu lista pública: subís tu logo y elegís el color de tu marca para que todo tenga tu identidad."],
    ["publica_new_full", "scroll", "miprecio.app/p/cafe-aurora", 13,
     "And your public list instantly reflects the new brand color — the same catalog, now with your own style.",
     "Y tu lista pública toma al instante el nuevo color de marca — el mismo catálogo, ahora con tu estilo."],
    ["end", "none", "", 8,
     "That's MiPrecio — build your catalog, share it anywhere, and keep your prices always up to date. Thanks for watching!",
     "Eso es MiPrecio: armá tu catálogo, compartilo donde quieras y mantené tus precios siempre al día. ¡Gracias por ver!"],
]

scenes_js = json.dumps(scenes, ensure_ascii=False)
imgs_js = json.dumps(imgs)

html = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MiPrecio — Recorrido / Product tour</title>
<style>
  :root{ --violet:#7C3AED; --violet2:#A855F7; --ink:#1E1B4B; }
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ height:100%; }
  body{ font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    background:#0b0713; color:#fff; overflow:hidden; }
  #stage{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
    background:radial-gradient(1200px 700px at 70% -10%, #3b1d7a 0%, #140a26 55%, #0b0713 100%); }

  /* progress bar */
  #bar{ position:fixed; top:0; left:0; height:4px; width:0; z-index:40;
    background:linear-gradient(90deg,var(--violet),var(--violet2)); transition:width .2s linear; box-shadow:0 0 12px rgba(168,85,247,.7); }

  /* scene wrapper */
  .scene{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    padding:4vh 4vw 20vh; animation:sceneIn .7s cubic-bezier(.22,.61,.36,1) both; }
  .scene.leaving{ z-index:1; }
  .scene:not(.leaving){ z-index:2; }
  @keyframes sceneIn{
    from{ opacity:0; transform:translateY(28px) scale(.984); filter:blur(8px); }
    to{ opacity:1; transform:none; filter:blur(0); } }
  @keyframes sceneOut{
    from{ opacity:1; transform:none; filter:blur(0); }
    to{ opacity:0; transform:translateY(-16px) scale(.992); filter:blur(7px); } }

  /* browser frame */
  .browser{ display:inline-block; width:auto; max-width:94vw; border-radius:16px; overflow:hidden;
    box-shadow:0 40px 120px -30px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.06);
    background:#0f0a1c; }
  .chrome{ height:44px; display:flex; align-items:center; gap:8px; padding:0 14px;
    background:#211a36; border-bottom:1px solid rgba(255,255,255,.06); }
  .dot{ width:12px; height:12px; border-radius:50%; }
  .dot.r{ background:#ff5f57; } .dot.y{ background:#febc2e; } .dot.g{ background:#28c840; }
  .addr{ flex:1; margin-left:12px; height:26px; border-radius:8px; background:#120d22;
    display:flex; align-items:center; padding:0 12px; font-size:13px; color:#b9a9e6; }
  .addr b{ color:#fff; font-weight:600; }
  .frameview{ line-height:0; }
  .frameview img{ display:block; width:auto; max-width:94vw; max-height:calc(72vh - 44px); }

  /* auto-scrolling page (top -> footer) */
  .browser.scroll{ width:min(1120px,92vw); }
  .scrollview{ height:calc(74vh - 44px); overflow:hidden; line-height:0; }
  .scrollview img{ display:block; width:100%; height:auto; will-change:transform; }

  /* phone frame */
  .phone{ display:inline-block; width:auto; border-radius:44px; padding:14px; background:#171226;
    box-shadow:0 40px 100px -25px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,.07); }
  .phone .screen{ border-radius:30px; overflow:hidden; }
  .phone img{ display:block; width:100%; }
  /* Realistic phone aspect ratio (390x844) — width derives from height so it
     never stretches tall/skinny on big fullscreen displays. */
  .phone .screen.scrollview{ height:min(76vh,760px); aspect-ratio:390/844; line-height:0; }
  .phone .screen.scrollview img{ width:100%; height:auto; will-change:transform; }

  /* title / end cards */
  .card{ text-align:center; max-width:900px; padding:0 6vw; }
  .brand{ display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:26px; }
  .brand .logo{ width:64px; height:64px; border-radius:18px; display:grid; place-items:center;
    background:linear-gradient(135deg,var(--violet),var(--violet2)); box-shadow:0 18px 40px -10px rgba(124,58,237,.7); }
  .brand .logo svg{ width:34px; height:34px; }
  .brand h1{ font-size:52px; font-weight:800; letter-spacing:-1px;
    background:linear-gradient(90deg,#fff,#d9c9ff); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .brandlogo{ display:block; margin:52px auto 56px; width:min(520px,74vw); height:auto;
    filter:drop-shadow(0 18px 45px rgba(124,58,237,.45)); }
  .card p{ font-size:22px; line-height:1.5; color:#cbbdf0; }
  .pill{ display:inline-block; margin-bottom:22px; padding:7px 16px; border-radius:999px; font-size:13px; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase; color:#d7c8ff; background:rgba(168,85,247,.16); border:1px solid rgba(168,85,247,.35); }

  /* caption lower-third */
  #caption{ position:fixed; left:50%; bottom:9vh; transform:translateX(-50%); z-index:30;
    width:min(92vw,1080px); text-align:center; }
  #caption .cap{ display:inline-block; padding:16px 26px; border-radius:16px;
    background:rgba(14,9,26,.82); backdrop-filter:blur(10px); border:1px solid rgba(168,85,247,.35);
    box-shadow:0 20px 60px -20px rgba(0,0,0,.7); font-size:20px; line-height:1.5; font-weight:500;
    animation:capIn .6s .12s cubic-bezier(.22,.61,.36,1) both; }
  @keyframes capIn{ from{ opacity:0; transform:translateY(14px); } to{ opacity:1; transform:none; } }
  #caption .step{ display:block; margin-bottom:7px; font-size:12px; font-weight:700; letter-spacing:.14em;
    text-transform:uppercase; color:#b18bff; }
  .scene.title-scene ~ #caption, body.on-card #caption{ display:none; }

  /* controls */
  #ctl{ position:fixed; bottom:0; left:0; right:0; z-index:50; display:flex; align-items:center;
    justify-content:center; gap:10px; padding:16px; opacity:0; transition:opacity .3s;
    background:linear-gradient(0deg, rgba(6,3,12,.85), transparent); }
  body:hover #ctl, body.paused #ctl{ opacity:1; }
  #ctl button{ cursor:pointer; border:none; color:#fff; font-size:14px; font-weight:600;
    padding:10px 16px; border-radius:11px; background:rgba(255,255,255,.10); transition:.15s; }
  #ctl button:hover{ background:rgba(168,85,247,.45); }
  #ctl .play{ background:linear-gradient(135deg,var(--violet),var(--violet2)); padding:10px 22px; }
  #ctl .sp{ flex:0 0 22px; }
  #lang{ position:fixed; top:16px; right:16px; z-index:50; display:flex; gap:6px;
    background:rgba(14,9,26,.7); padding:5px; border-radius:12px; border:1px solid rgba(255,255,255,.1); }
  #lang button{ cursor:pointer; border:none; color:#cbbdf0; background:transparent; font-weight:700;
    padding:6px 12px; border-radius:8px; font-size:13px; }
  #lang button.active{ background:linear-gradient(135deg,var(--violet),var(--violet2)); color:#fff; }
  #hint{ position:fixed; top:16px; left:16px; z-index:50; font-size:12px; color:#8a7bb5;
    background:rgba(14,9,26,.6); padding:7px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.07);
    transition:opacity .6s ease; }
  #hint.gone{ opacity:0; pointer-events:none; }
  :fullscreen #hint{ display:none; }
</style>
</head>
<body>
  <div id="bar"></div>
  <div id="stage"></div>
  <div id="caption"></div>

  <div id="lang">
    <button data-l="es" class="active">ES</button>
    <button data-l="en">EN</button>
  </div>
  <div id="hint">Barra espaciadora = play/pausa · ← → = navegar · F = pantalla completa</div>

  <div id="ctl">
    <button id="restart">⟲ Reiniciar</button>
    <button id="prev">← Anterior</button>
    <button class="play" id="play">⏸ Pausa</button>
    <button id="next">Siguiente →</button>
    <span class="sp"></span>
    <button id="full">⛶ Pantalla completa</button>
  </div>

<script>
const IMGS = __IMGS__;
const SCENES = __SCENES__;
const LOGO_IMG = "__LOGO__";
const LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

let i = 0, lang = 'es', paused = false, t0 = 0, raf = null, elapsed = 0, scrollAnim = null;
const stage = document.getElementById('stage');
const capBox = document.getElementById('caption');
const bar = document.getElementById('bar');

function render(){
  const s = SCENES[i];
  const [key, device, url, secs, en, es] = s;
  if(scrollAnim){ scrollAnim.cancel(); scrollAnim = null; }
  stage.querySelectorAll('.scene.leaving').forEach((e) => e.remove());
  const prev = stage.querySelector('.scene');
  document.body.classList.toggle('on-card', device === 'none');

  const chrome = `<div class="chrome"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
          <div class="addr">🔒 <b>&nbsp;${url}</b></div></div>`;
  let node = document.createElement('div');
  if(device === 'scroll'){
    node.className='scene on';
    node.innerHTML = `<div class="browser scroll">${chrome}<div class="scrollview"><img src="${IMGS[key]}"></div></div>`;
  } else if(device === 'browser'){
    node.className='scene on';
    node.innerHTML = `<div class="browser">${chrome}<div class="frameview"><img src="${IMGS[key]}"></div></div>`;
  } else if(device === 'phonescroll'){
    node.className='scene on';
    node.innerHTML = `<div class="phone"><div class="screen scrollview"><img src="${IMGS[key]}"></div></div>`;
  } else if(device === 'phone'){
    node.className='scene on';
    node.innerHTML = `<div class="phone"><div class="screen"><img src="${IMGS[key]}"></div></div>`;
  } else {
    node.className='scene title-scene on';
    const isEnd = key === 'end';
    node.innerHTML = `<div class="card">
        <div class="pill">${isEnd ? (lang==='es'?'Gracias':'Thank you') : (lang==='es'?'Demo del producto':'Product demo')}</div>
        <img class="brandlogo" src="${LOGO_IMG}" alt="MiPrecio">
        <p>${lang==='es'?es:en}</p></div>`;
  }
  stage.appendChild(node);

  // Cross-fade: animate the previous scene out, then remove it.
  if(prev){
    prev.classList.add('leaving');
    prev.style.animation = 'sceneOut .5s cubic-bezier(.4,0,1,1) forwards';
    setTimeout(() => prev.remove(), 520);
  }

  // Auto-scroll for any scene with a scroll window (desktop or phone).
  const view = node.querySelector('.scrollview');
  if(view){
    const im = view.querySelector('img');
    const start = () => {
      const dist = im.offsetHeight - view.offsetHeight;
      if(dist > 4){
        scrollAnim = im.animate(
          [{transform:'translateY(0)'}, {transform:'translateY(0)', offset:0.10},
           {transform:`translateY(${-dist}px)`, offset:0.92}, {transform:`translateY(${-dist}px)`}],
          {duration:secs*1000, easing:'ease-in-out', fill:'forwards'});
        if(paused) scrollAnim.pause();
      }
    };
    if(im.complete && im.naturalHeight) start(); else im.onload = start;
  }

  if(device === 'none'){ capBox.innerHTML=''; }
  else {
    capBox.innerHTML = `<div class="cap"><span class="step">${i} / ${SCENES.length-2}</span>${lang==='es'?es:en}</div>`;
  }
}

function tick(now){
  if(paused){ raf = requestAnimationFrame(tick); return; }
  if(!t0) t0 = now;
  const dur = SCENES[i][3]*1000;
  elapsed = now - t0;
  bar.style.width = Math.min(100, elapsed/dur*100) + '%';
  if(elapsed >= dur){ next(); }
  raf = requestAnimationFrame(tick);
}
function go(n){
  i = (n + SCENES.length) % SCENES.length;
  t0 = 0; elapsed = 0; bar.style.width='0%';
  render();
}
function next(){ go(i+1); }
function prev(){ go(i-1); }
function setPaused(p){
  paused = p;
  document.body.classList.toggle('paused', p);
  document.getElementById('play').textContent = p ? '▶ Reproducir' : '⏸ Pausa';
  if(!p){ t0 = performance.now() - elapsed; }
  if(scrollAnim){ p ? scrollAnim.pause() : scrollAnim.play(); }
}

document.getElementById('play').onclick = ()=> setPaused(!paused);
document.getElementById('next').onclick = ()=> { next(); };
document.getElementById('prev').onclick = ()=> { prev(); };
document.getElementById('restart').onclick = ()=> { go(0); setPaused(false); };
document.getElementById('full').onclick = ()=> {
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
document.querySelectorAll('#lang button').forEach(b=> b.onclick = ()=>{
  lang = b.dataset.l;
  document.querySelectorAll('#lang button').forEach(x=>x.classList.toggle('active', x===b));
  render();
});
document.addEventListener('keydown', e=>{
  if(e.code==='Space'){ e.preventDefault(); setPaused(!paused); }
  else if(e.code==='ArrowRight'){ next(); }
  else if(e.code==='ArrowLeft'){ prev(); }
  else if(e.key.toLowerCase()==='f'){ document.getElementById('full').click(); }
});

render();
raf = requestAnimationFrame(tick);
// Auto-hide the keyboard-hint chip so it never shows up in a recording.
setTimeout(() => document.getElementById('hint').classList.add('gone'), 5000);
</script>
</body>
</html>
"""

html = html.replace("__IMGS__", imgs_js).replace("__SCENES__", scenes_js).replace("__LOGO__", logo_datauri)
out = os.path.join(SP, "tour.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print("wrote", out, round(os.path.getsize(out)/1024/1024, 2), "MB")
