# MiPrecio — Contenidos Agosto 2026

Carpeta con el **contenido de redes de agosto** organizado por semana y por día,
listo para producir y publicar en **Instagram + LinkedIn**.

> Foco: Uruguay 🇺🇾 · Voz cercana (voseo) en IG, más profesional en LinkedIn.

---

## 📦 Qué hay acá

- **`../Plan de Contenidos Agosto - MiPrecio.md`** — estrategia, idea del mes, pilares, calendario y métricas.
- **`../Kit de Produccion Agosto - MiPrecio.md`** — ficha autónoma por pieza: copy listo, hashtags, texto en la imagen, prompt/captura, medidas y armado.
- **`../redes-sociales.md`** — manual de marca y base de redes (bios, tono, paleta, hashtags).
- **`fuente/`** — todo lo necesario para **producir** cada pieza: el brief (`_LEEME.md`), los HTML de las placas, fondos, imágenes de referencia y videos.
  - **`fuente/_lib/`** — librería compartida del mes: `base.css`, logo y QR.
- **`publicar/`** — las piezas **finales** (PNG / MP4) listas para subir.

Las dos carpetas comparten el **mismo árbol interno** `Semana N/<día> de agosto/`, así que la pieza final de un día vive en la ruta espejada de su fuente:

```
agosto/
├── fuente/
│   ├── _lib/                       base.css · logo-white.webp · qr-miprecio.png
│   └── Semana 1 (1 al 9 de agosto)/
│       └── 3 de agosto/            _LEEME.md · placa-01..04.html · toy.jpg
└── publicar/                       (ignorada por git)
    └── Semana 1 (1 al 9 de agosto)/
        └── 3 de agosto/            3-agosto-01..04.png
```

> 📌 **Convención:** en `fuente/` va todo el material de trabajo; en `publicar/`, sólo lo final.
>
> ⚠️ `publicar/` **no se versiona** (regla `marketing/*/publicar/` en `.gitignore`): son archivos pesados y siempre se pueden regenerar desde `fuente/`. Guardá una copia aparte si necesitás respaldarlos.

---

## 🧭 Datos de marca (fijos)

| | |
|---|---|
| **Producto** | Catálogo online + lista de precios por link/QR |
| **Tagline** | *Tu catálogo online. Tus precios al día.* |
| **CTA** | Probá gratis 14 días (sin tarjeta) · miprecio.app |
| **Contacto** | hola@miprecio.app · soporte@miprecio.app |
| **Redes** | Instagram + LinkedIn |

**Colores:** Violeta `#7c3aed` · Violeta claro `#a855f7` · Violeta noche `#2e1065` · Blanco
**Tipografía:** Inter

---

## 🗓️ Calendario del mes (18 posts + 4 reels)

| # | Fecha | Formato | Tema |
|---|---|---|---|
| 1 | Sáb 1/8 | Reel | Cambiá un precio una vez y listo |
| 2 | Lun 3/8 | Carrusel | Preparate para el Día del Niño |
| 3 | Mié 5/8 | Carrusel | 3 señales de que tu lista quedó vieja |
| 4 | Vie 7/8 | Imagen | Tu catálogo en un link o un QR |
| 5 | Dom 9/8 | Imagen | Falta 1 semana para el Día del Niño |
| 6 | Lun 10/8 | Carrusel | Actualizar precios en inflación |
| 7 | Mié 12/8 | Reel | De Excel a MiPrecio en 3 pasos |
| 8 | Vie 14/8 | Imagen | Por qué construimos MiPrecio |
| 9 | Sáb 15/8 | Carrusel | Una lista distinta para cada cliente |
| 9b | Dom 16/8 | Imagen | ¡Feliz Día del Niño! |
| 10 | Lun 17/8 | Carrusel | 3 errores al mandar tu lista por WhatsApp |
| 11 | Mié 19/8 | Imagen | Mirá quién ve tu catálogo (Reportes) |
| 12 | Vie 21/8 | Carrusel | Cómo una ferretería dejó atrás el Excel |
| 13 | Sáb 22/8 | Reel | Tu catálogo, con tu marca |
| 14 | Lun 25/8 | Imagen | 25 de agosto — Independencia |
| 15 | Mié 26/8 | Imagen | Tip: separá tus precios por canal |
| 16 | Vie 28/8 | Carrusel | Preguntas frecuentes |
| 17 | Sáb 29/8 | Reel | Probá MiPrecio gratis 14 días |
| 18 | Lun 31/8 | Imagen | Cerramos agosto |

**Fechas clave:** 🎈 Día del Niño (dom 16/8) · 🇺🇾 Declaratoria de la Independencia (lun 25/8).

---

## ⚙️ Cómo se producen las piezas

1. **Captura real de la app** (ideal) o generá el fondo con el *Prompt de imagen* del Kit.
2. **Escribí el texto en Canva** con Inter (la IA falla con tildes).
3. **Agregá logo arriba** y el **CTA abajo** (`Probá gratis · miprecio.app`).
4. **Publicá** en Instagram + LinkedIn y respondé el mismo día.

> Los **reels ideales son screen-recordings de la app** (Dashboard, Productos, vista pública, QR). Usá siempre un **tenant de prueba**, nunca la cuenta real.

Las placas por código se arman como HTML y se exportan a PNG a 1080×1350 (feed 4:5) o 1080×1920 (reel/story 9:16).

---

## ⏳ Pendientes internos

- [ ] Handle final de IG (`@miprecio.app` vs `@miprecio.uy`).
- [ ] Perfil de LinkedIn activo.
- [ ] Caso "ferretería" (post 12): ilustrativo o testimonio real.
- [ ] Linktree/landing con CTAs.
