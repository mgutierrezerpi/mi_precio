# MiPrecio

Monorepo for MiPrecio projects.

## Projects

- `api/` - Python API for the MiPrecio product.
- `web_app/` - React/Vite web application, including the public landing page.
- `bin/` - local development scripts.

## Local Full Stack

Run the API and web app together from the repository root:

```bash
bin/dev
```

Run it detached with:

```bash
bin/dev -d
```

Rebuild the images after changing a Dockerfile or dependency lockfile:

```bash
docker compose build
```

Stop the stack with:

```bash
docker compose down
```

Local URLs:

- Web app and landing: `http://localhost:3001`
- API health: `http://localhost:8000/health`

The Vite web app also has these useful routes:

- `http://localhost:3001/login`
- `http://localhost:3001/admin`
- `http://localhost:3001/admin/lists`
- `http://localhost:3001/admin/items`
- `http://localhost:3001/admin/settings`

`bin/dev` checks all four host ports before starting. If a preferred port is
busy, it uses the next available one and prints the resulting URLs. Preferred
ports can be overridden with `WEB_APP_PORT`, `API_PORT`, `STORAGE_PORT`, and
`STORAGE_CONSOLE_PORT`.

`bin/dev` also loads `api/.env` before starting Compose. To use Lemon Squeezy's
test-mode checkout locally, set `BILLING_ENABLED=true` there together with the
test-mode API key, store ID, webhook secret, and plan variant IDs, then restart
the API container with `bin/dev -d --force-recreate api web_app`.

## Error monitoring

The API and Huey worker use the Sentry SDK protocol for error tracking when the
runtime `SENTRY_DSN` secret is configured. Production uses self-hosted Bugsink
at `https://bugsink.miprecio.app`; create or retrieve the MiPrecio project DSN
there, then set it on Fly (this also redeploys the app):

```bash
fly secrets set --app mi-precio SENTRY_DSN="https://<public-key>@bugsink.miprecio.app/<project-id>" \\
  SENTRY_ENVIRONMENT=production
```

Do not commit the DSN to `fly.toml` or an `.env` file.

## Feature flags

Feature flags use OpenFeature with tenant-specific assignments stored in the
API database. Super admins can manage them from `/admin/developer`, under
`Feature flags`. To enable magazines for a business from the API container:

```bash
docker compose exec api python bin/set_feature_flag.py magazines \
  --subdomain my-business --enabled
```

The `magazines` flag is disabled by default. The API enforces the flag for
admin magazine endpoints and public magazine pages; hiding the sidebar item is
only a frontend convenience.

## Production deploy

Fly builds the top-level `Dockerfile`, which packages the API and React app.

```bash
fly deploy
```
