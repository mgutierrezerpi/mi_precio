"""Remove the per-user admin UI mode fields now that the CRM has one layout."""


def migrate(migrator, database, fake=False, **kwargs):
    columns = {column.name for column in database.get_columns("users")}
    for field in ("simple_admin_ui", "admin_ui_mode"):
        if field in columns:
            migrator.remove_fields("users", field)


def rollback(migrator, database, fake=False, **kwargs):
    import peewee as pw

    migrator.add_fields(
        "users",
        simple_admin_ui=pw.BooleanField(default=False),
        admin_ui_mode=pw.CharField(max_length=16, default="full"),
    )
