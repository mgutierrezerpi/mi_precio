# MiPrecio

Monorepo for MiPrecio projects.

## Projects

- `landing/` - public landing page for `miprecio.app`, served with Nginx in Docker.
- `api/` - Python API for the MiPrecio product.
- `web_app/` - React/Vite web application for the MiPrecio product.
- `bin/` - local development scripts.

## Local Full Stack

Run the landing page, API, and web app together from the repository root:

```bash
bin/dev
```

Run it detached with:

```bash
bin/dev -d
```

Stop the stack with:

```bash
docker compose down
```

Local URLs:

- Landing: `http://localhost:8088`
- Web app: `http://localhost:3000`
- API health: `http://localhost:8000/health`

The Vite web app also has these useful routes:

- `http://localhost:3000/login`
- `http://localhost:3000/admin`
- `http://localhost:3000/admin/lists`
- `http://localhost:3000/admin/items`
- `http://localhost:3000/admin/settings`

Ports can be overridden with `LANDING_PORT`, `WEB_APP_PORT`, and `API_PORT`.

## Current Production Deploy

The production landing page is deployed from `landing/` on `main`.

```bash
cd landing
MIPRECIO_PORT=8088 docker compose up -d --build
```
