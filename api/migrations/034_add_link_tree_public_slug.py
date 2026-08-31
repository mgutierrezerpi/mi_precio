"""Give each Linktree a configurable public URL slug."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "link_trees", public_slug=pw.CharField(max_length=63, null=True)
    )
    database.execute_sql(
        "UPDATE link_trees SET public_slug = (SELECT subdomain FROM tenants WHERE tenants.id = link_trees.tenant_id) "
        "WHERE public_slug IS NULL"
    )
    migrator.add_index("link_trees", ("public_slug",), unique=True)


def rollback(migrator, database, fake=False, **kwargs):
    migrator.drop_index("link_trees", "link_trees_public_slug")
    migrator.remove_fields("link_trees", "public_slug")
