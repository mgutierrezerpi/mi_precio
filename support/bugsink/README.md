# MiPrecio Bugsink deployment

This runs the self-hosted error tracker at `https://bugsink.miprecio.app` on
the farm server. It deliberately uses the existing Sentry SDK integration in
the API: configure the Bugsink project DSN as Fly's `SENTRY_DSN` secret.

## Server deployment

The checked-in configuration belongs at `/opt/bugsink`. The server-only
`/opt/bugsink/.env` contains generated `SECRET_KEY` and administrator
credentials and must never be committed.

The Nginx virtual host is installed at
`/etc/nginx/sites-available/bugsink.miprecio.app`, symlinked into
`sites-enabled`, and gets its certificate with:

```bash
certbot --nginx -d bugsink.miprecio.app
```

## Application configuration

Log in, create the MiPrecio project, and copy its DSN. Then configure Fly:

```bash
flyctl secrets set --app mi-precio SENTRY_DSN='<Bugsink project DSN>' \
  SENTRY_ENVIRONMENT=production
```

The app already initializes the Sentry SDK only when that secret is set, and
Bugsink accepts the same event protocol.
