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
