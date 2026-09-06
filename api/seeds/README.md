# Backend seeders

Seed scripts belong to the API because they create or update application data.
They are intended for local development and demos; none runs automatically.

## Pencil price-list designs

`seed_pencil_price_lists.py` creates or updates the selected Pencil lists for
one authenticated tenant. It is additive: it does not delete existing data.

With the local API running, provide the token and tenant ID from the test
account:

```bash
DEMO_TOKEN='<jwt>' DEMO_TENANT_ID='<tenant-id>' \
  python api/seeds/seed_pencil_price_lists.py
```

`DEMO_SUBDOMAIN` is optional. When running the script locally, it may instead
read `api/seeds/tok.json`; that file is ignored because it contains a JWT.

To create every Pencil design for every tenant in the local SQLite database,
build the API image and run:

```bash
docker compose exec api python seeds/seed_all_pencil_price_lists.py --dry-run
docker compose exec api python seeds/seed_all_pencil_price_lists.py
```

This database-local seeder is additive. It skips existing designs, includes
only tenants with a local user or membership, and publishes generated lists
hidden from the list index. Pass `--database PATH` when running outside Docker.

## Demo dataset helpers

- `seed.py` creates the Café Aurora brand, catalog, categories, and public menu
  through the local API. It expects `seeds/tok.json` inside the API directory.
- `seed_views.py` adds sample page-view analytics.
- `seed_timeline.py` adds coherent customer, activity, and order history.
- `seed_orders.py` is the older order-only dataset helper; use
  `seed_timeline.py` for new demo data.

The last three scripts write directly to SQLite and currently use the demo
tenant and list IDs embedded in the scripts. Run them inside the API container
against `/data/mi_precio.db`.

For a freshly built local API container, copy the token file created for demo
capture and run the initial seeder:

```bash
docker compose cp demo/tok.json api:/app/seeds/tok.json
docker compose exec api python seeds/seed.py
```
