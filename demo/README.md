# MiPrecio — Demo tour

Recorrido virtual auto-reproducible de MiPrecio, pensado para el **video demo de la
solicitud de Lemon Squeezy** (o cualquier presentación del producto). Es un único
archivo HTML que reproduce, como un video, un recorrido por toda la app con
subtítulos (ES/EN), auto-scroll en las pantallas largas y transiciones.

## Ver el demo

`tour.html` **no está versionado** (se regenera). Generalo con un comando y abrilo:

```bash
cd demo
python build_tour.py     # crea tour.html a partir de shots/ + el logo (determinístico)
```

Luego abrí **`tour.html`** en cualquier navegador (es autónomo, funciona offline).

> Paso a paso completo (y cómo re-capturar las pantallas desde cero): ver
> **[`COMO_GENERAR.md`](COMO_GENERAR.md)**.

- **Barra espaciadora** — play / pausa
- **← / →** — placa anterior / siguiente
- **F** — pantalla completa (para grabar)
- **ES / EN** — cambia el idioma de los subtítulos

Para generar el video: abrí `tour.html` → `F` (pantalla completa) → elegí idioma →
grabá la pantalla (Xbox Game Bar `Win+Alt+R`, o Loom) mientras corre (~2,6 min).

## Contenido

| Archivo | Qué es |
|---|---|
| `tour.html` | **El demo final** (imágenes embebidas en base64, portable) |
| `build_tour.py` | Genera `tour.html` a partir de `shots/*.png` + el logo del repo |
| `shots/*.png` | Capturas reales de la app usadas por el tour |
| `shot_*.js` | Scripts de captura (Playwright + Chrome) de cada pantalla |
| `seed_*.py` | Seeders del dataset demo (productos, clientes, órdenes, visitas) |
| `vcap.js`, `verify_tour.js` | Utilidades para verificar placas del tour |

## Regenerar `tour.html`

Solo hace falta si cambian las capturas o los textos.

```bash
cd demo
python build_tour.py          # relee shots/ + el logo y reescribe tour.html
```

## Recapturar pantallas (opcional)

Las capturas se toman contra el stack local (`bin/dev`) con Playwright usando el
Chrome instalado (no descarga navegador):

```bash
cd demo
npm install playwright-core
# Conseguir un token de la cuenta de test y guardarlo en tok.json:
#   POST /api/v1/auth/codes {"email":"test@test.com"}
#   code = docker compose logs api | grep code   (LOG_AUTH_CODES=true)
#   POST /api/v1/auth/tokens {"email":"test@test.com","code":"..."}  -> tok.json
node shot_full.js         # dashboard/productos/pública (full-page)
node shot_extra.js        # clientes / reportes
node shot_appearance.js   # marca y apariencia + pública con color nuevo
python build_tour.py      # re-embeber
```

> `tok.json` (contiene un JWT) y `node_modules/` están gitignoreados: no se commitean.
> El dataset demo vive en el volumen Docker local `api_data`, no en el repo.
