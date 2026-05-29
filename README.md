# MiPrecio

Monorepo for MiPrecio projects.

## Projects

- `landing/` - public landing page for `miprecio.app`, served with Nginx in Docker.
- `api/` - Python API for the MiPrecio product.
- `web_app/` - React/Vite web application for the MiPrecio product.
- `_legacy/` - previous Rails implementation kept for reference/migration history.

## Current Production Deploy

The production landing page is deployed from `landing/` on `main`.

```bash
cd landing
MIPRECIO_PORT=8088 docker compose up -d --build
```

## Local Full Stack

Run the landing page, API, and web app together from the repository root:

```bash
bin/dev
```

Run it detached with:

```bash
bin/dev -d
```

Local URLs:

- Landing: `http://localhost:8088`
- Web app: `http://localhost:5173`
- API: `http://localhost:8000/health`

Ports can be overridden with `LANDING_PORT`, `WEB_APP_PORT`, and `API_PORT`.
