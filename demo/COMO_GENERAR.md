# Cómo generar `tour.html` — paso a paso

`tour.html` **no se versiona** (está en `.gitignore`) porque se regenera exacto a
partir de archivos que sí están en el repo. Este documento explica cómo obtenerlo.

---

## TL;DR (caso normal)

Si ya están las capturas en `demo/shots/` (están commiteadas), generar el HTML es
**un solo comando**:

```bash
cd demo
python build_tour.py
```

Eso reescribe `demo/tour.html`. Abrilo en el navegador y listo.

> **Es determinístico:** con las mismas imágenes de `shots/`, `build_tour.py`
> produce un `tour.html` **byte por byte idéntico** (mismo SHA1). No hay azar en
> este paso. Verificado corriéndolo dos veces y comparando el hash.

Requisitos de este paso:
- **Python 3** (usa solo la librería estándar: `base64`, `json`, `os`).
- La carpeta **`demo/shots/`** con las 11 imágenes (versionadas).
- El logo **`web_app/public/miprecio-logo-white-pencil.webp`** (del repo; se
  referencia con ruta relativa, no hay que tocar nada).

---

## Qué hace `build_tour.py`

1. Lee cada `shots/<nombre>.png` y lo convierte a un data-URI base64.
2. Lee el logo blanco de MiPrecio (`web_app/public/miprecio-logo-white-pencil.webp`).
3. Define la lista de **placas** (escena, tipo, URL, duración en seg, texto ES, texto EN).
4. Inserta todo en una plantilla fija de HTML/CSS/JS (el reproductor: play/pausa,
   navegación, toggle ES/EN, auto-scroll, transiciones) y escribe `tour.html`.

**Para cambiar textos, orden, duraciones o idioma:** editá la lista `scenes` y/o los
strings dentro de `build_tour.py` y volvé a correr `python build_tour.py`. No hace
falta re-capturar nada.

---

## Regenerar las capturas desde cero (solo si cambió la app)

Necesario únicamente si querés capturas nuevas (rediseño de la UI, otros datos, etc.).
Las capturas se toman contra el stack local con Playwright, usando el **Chrome ya
instalado** (no descarga navegador).

### 1. Levantar el stack

```bash
bin/dev            # api :8000, web_app :3000, landing :8088  (Docker)
```

### 2. Instalar la dependencia de captura

```bash
cd demo
npm install playwright-core      # liviano, sin descargar Chromium
```

### 3. Preparar la cuenta de test y su token (`tok.json`)

Las pantallas del panel requieren sesión. Login es passwordless (código por email;
en local el código sale en los logs porque `LOG_AUTH_CODES=true`).

```bash
EMAIL=test@test.com
# a) pedir código
curl -s -X POST http://localhost:8000/api/v1/auth/codes \
  -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\"}"
# b) leer el código de 6 dígitos
docker compose logs api --tail 8 | grep -i "code for $EMAIL"
# c) canjear el código por el token y guardarlo en tok.json
curl -s -X POST http://localhost:8000/api/v1/auth/tokens \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"code\":\"XXXXXX\"}" -o tok.json
```

`tok.json` contiene `{ token, user, tenant }`. **No se commitea** (tiene un JWT).
Los scripts de captura lo inyectan en `localStorage` (`auth_token` + `auth_state`)
antes de cargar la página.

> Si cambiás datos del tenant por API (nombre, plan, color), refrescá el tenant en
> `tok.json` con `GET /api/v1/tenants/{id}` antes de recapturar, o el panel se ve con
> datos viejos.

### 4. (Opcional) Re-sembrar el dataset demo

Solo si querés regenerar los datos de la cuenta de test "Café Aurora". Los seeders
escriben directo en el SQLite del contenedor:

```bash
# copiar el seeder al contenedor y ejecutarlo (evita que Git Bash traduzca /tmp)
docker compose cp seed.py api:/tmp/seed.py
MSYS_NO_PATHCONV=1 docker compose exec -T api python /tmp/seed.py
```

Seeders disponibles (correr en este orden si empezás de cero):
- `seed.py` — marca, categorías, 12 productos con fotos, lista pública "Menú".
- `seed_views.py` — ~252 visitas repartidas en 30 días (link/QR) para el gráfico.
- `seed_orders.py` / `seed_timeline.py` — clientes con órdenes y línea de tiempo
  realista (última compra, activo/recurrente, ingresos, productos más vendidos).
  `seed_timeline.py` es el definitivo (fechas coherentes; reemplaza a `seed_orders.py`).

### 5. Tomar las capturas

```bash
node shot_full.js          # dashboard / productos / pública (desktop + móvil), full-page
node shot_extra.js         # clientes / reportes
node shot_appearance.js    # "Marca y apariencia" (color nuevo) + pública recoloreada
node shot_landing_full.js  # landing completa (para el auto-scroll)
node shot_billing.js       # pestaña "Plan y facturación" (Lemon Squeezy)
```

Cada script deja los PNG en `demo/shots/`.

### 6. Re-embeber

```bash
python build_tour.py
```

---

## Verificar placas (opcional)

`vcap.js <indiceEscena> <fraccionScroll> <nombre>` renderiza una placa del tour y la
guarda en `shots/tour_<nombre>.png` (esas capturas de verificación están gitignoreadas).

```bash
node vcap.js 8 0.5 phone_check
```

---

## Ver / grabar el demo

1. Abrí `tour.html` en el navegador.
2. `F` = pantalla completa · `ES/EN` = idioma · barra espaciadora = play/pausa · `← →` = navegar.
3. Grabá la pantalla mientras corre (Xbox Game Bar `Win+Alt+R`, o Loom). Dura ~2,6 min.
