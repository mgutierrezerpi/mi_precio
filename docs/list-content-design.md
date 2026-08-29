# Versioned public-list content

## Decision

A public price list is a published **versioned document**, not merely a group
of product rows.  `PriceList` keeps its identity, access, audience, and
appearance override. `ListVersion` snapshots both the items and the content
that surrounds them.

Magazines are a separate publication domain. `Magazine` owns the issue identity,
publication status, slug, and renderer design; `MagazinePage` owns the ordered
page metadata and a validated JSON content document. They are exposed through
`/magazines` admin endpoints and `/public/{subdomain}/magazines/{slug}`. A
magazine is not a `PriceList`, does not participate in cart/order semantics, and
uses the `/m/` public URL namespace.

The Pencil file is the visual reference for five runtime templates:
`pencil-bakery`, `pencil-garden`, `pencil-market`, `pencil-evening`, and
`pencil-workshop`. Their reusable content (hero, catalog, promotion strip,
contact, and footer) is stored as validated blocks, while their layout,
typography, imagery, and responsive composition are owned by the frontend
renderer. We must not store Pencil node trees, arbitrary CSS, or unsanitized
HTML in customer data.

## Current state and gap

- List versions currently contain only ordered `Item` snapshots.
- The public page derives sections from `Item.category`; ordering and section
  copy cannot be authored independently.
- `PriceList.design` is an appearance choice, but it has no defined content
  contract.  The accepted design ids are duplicated in the API and frontend.
- Duplicating a version or creating a customer/promotional variant copies only
  its items.

## Data contract

Add these nullable fields to `list_versions`:

```text
content              TEXT NULL       # validated JSON document
content_revision     INTEGER NOT NULL DEFAULT 0
```

`NULL` means legacy content and deliberately preserves today's public
category-derived rendering. A new document has this shape:

```json
{
  "schema_version": 1,
  "hero": {
    "eyebrow": "CATÁLOGO ACTUALIZADO",
    "title": "Pintura, ferretería y herramientas al mejor precio",
    "body": "Comprá mayorista o minorista.",
    "stats": [{ "value": "142+", "label": "productos" }]
  },
  "blocks": [
    {
      "id": "catalog-main",
      "type": "catalog",
      "sections": [
        {
          "id": "paint",
          "title": "Pinturas",
          "body": "Color y protección.",
          "source": { "kind": "category", "value": "Pinturas" }
        }
      ]
    },
    {
      "id": "shipping-promo",
      "type": "promotion_strip",
      "items": ["Envío gratis desde UYU 3.000"]
    },
    {
      "id": "contact",
      "type": "contact",
      "show_whatsapp": true,
      "hours": [{ "days": "Lun — Vie", "hours": "08:00 — 19:00" }]
    }
  ]
}
```

The first release is intentionally category-driven. A section source selects
the item snapshots whose normalized category matches `value`; block and
section order supplies the display order. Items absent from explicit sections
render in an automatic `other` section, so no products disappear after an
edit. A later schema version can add an `item_ids` source for true manual
curation without changing version ownership.

### Rich text

Text fields are plain strings in v1. If inline formatting is required, add a
restricted rich-text AST (`paragraph`, `text`, `strong`, `em`, `link`) with
server-side validation and URL allow-listing. Never accept or render customer
HTML directly.

## Design contracts

Create one API-owned registry, for example `lib/list_designs.py`:

```python
DESIGN_SPECS = {
    "store": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "catalog": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "tech": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "pencil-bakery": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "pencil-garden": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "pencil-market": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "pencil-evening": {"blocks": {"catalog", "promotion_strip", "contact"}},
    "pencil-workshop": {"blocks": {"catalog", "promotion_strip", "contact"}},
    # existing designs are added with their actual supported block sets
}
```

It is the authority for valid design ids and supported block types. Expose it
as read-only metadata (`GET /list-designs`) and generate or test the
frontend's `ListDesign` union/options against it. The selected per-list design
determines editor affordances and rendering layout; it does not alter the
stored content document. This keeps the same version usable if a list changes
its theme later.

Validation rules:

- document size and string lengths are bounded;
- `schema_version` is required for non-null content;
- block ids are unique and block types are known;
- section ids are unique per catalog block;
- category sources have a nonempty value;
- a document may use only blocks supported by the resolved design (list
  override, otherwise tenant default, otherwise `store`);
- the API returns an actionable 422 for unsupported fields rather than silently
  dropping them.

## API and lifecycle

Add the content only to version endpoints, because it is versioned:

```text
GET   /versions/{id}                 -> includes content, content_revision
PATCH /versions/{id}/content         -> body: {content, content_revision}
GET   /public/...                    -> published version includes content
GET   /list-designs                  -> rendering/editor metadata
```

`PATCH /versions/{id}/content` checks ownership/editor permissions and rejects
a stale `content_revision` with 409. On success it increments the revision and
the normal `updated_at` timestamp. Replacing the whole small document is safer
than attempting generic JSON-patch merges in the first editor.

`duplicate_version` and parent-to-variant creation deep-copy `content` and
reset `content_revision` to zero. Publishing continues to publish exactly one
version: its item and content snapshots are therefore atomic from a viewer's
perspective.

## Migration and rollout

1. Add the Peewee fields and the `list_versions` additive-column helper in
   `models/__init__.py`. This matches the app's runtime SQLite upgrade pattern.
2. Add a conventional migration for managed databases as well.
3. Ship reads with the `content is None` legacy fallback before enabling the
   admin editor.
4. Add the registry and content endpoint, then renderer support for Hero,
   Catalog, Promotion Strip, and Contact.
5. Release the editor behind a feature flag or to internal tenants first.
6. Optionally backfill documents generated from categories only after the
   fallback has proven stable. Backfill is not required for correctness and
   should be idempotent.

## Acceptance tests

- Existing lists with null content render identically, grouped by category.
- A published document returns authored hero, ordered sections, promotions,
  and contact data through the public endpoint.
- Invalid schema, unknown blocks, unsupported design/block combinations, and
  unsafe rich-text links return 422.
- A stale content revision returns 409 without changing stored content.
- Version duplication and new variants copy content and items; subsequent
  edits do not leak between versions.
- Tenant and editor authorization are enforced for the content endpoint.
- Items not selected by an explicit category section remain visible in the
  automatic section.
- The frontend renders the same content reasonably across every supported
  design and mobile layout.

## Deliberate non-goals for v1

- Importing or executing Pencil files at runtime.
- Arbitrary page-builder placement/CSS.
- Per-item manual curation across sections (reserved for a schema v2).
- A full WYSIWYG editor before content requirements prove it is necessary.
