# MiPrecio

Monorepo for MiPrecio projects.

## Projects

- `landing/` - public landing page for `miprecio.app`, served with Nginx in Docker.

## Current Production Deploy

The production landing page is deployed from `landing/` on `main`.

```bash
cd landing
MIPRECIO_PORT=8088 docker compose up -d --build
```
