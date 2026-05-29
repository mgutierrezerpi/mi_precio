"""Initial migration - create all tables."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    @migrator.create_model
    class Tenant(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        name = pw.CharField(max_length=255)
        subdomain = pw.CharField(max_length=63, unique=True, index=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "tenants"

    @migrator.create_model
    class User(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        email = pw.CharField(max_length=255, unique=True, index=True)
        tenant = pw.ForeignKeyField(Tenant, field="id", on_delete="CASCADE")
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "users"

    @migrator.create_model
    class AuthCode(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        email = pw.CharField(max_length=255, index=True)
        code = pw.CharField(max_length=6)
        used = pw.BooleanField(default=False)
        expires_at = pw.DateTimeField()
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "auth_codes"

    @migrator.create_model
    class PriceList(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        tenant = pw.ForeignKeyField(Tenant, field="id", on_delete="CASCADE")
        name = pw.CharField(max_length=255)
        published = pw.BooleanField(default=False, index=True)
        show_on_index = pw.BooleanField(default=False, index=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "lists"

    @migrator.create_model
    class ListVersion(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        list = pw.ForeignKeyField(PriceList, field="id", on_delete="CASCADE")
        version_number = pw.IntegerField(default=1)
        name = pw.CharField(max_length=255)
        published = pw.BooleanField(default=False, index=True)
        published_at = pw.DateTimeField(null=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "list_versions"

    @migrator.create_model
    class Item(pw.Model):
        id = pw.CharField(primary_key=True, max_length=32)
        list_version = pw.ForeignKeyField(ListVersion, field="id", on_delete="CASCADE")
        name = pw.CharField(max_length=255)
        price = pw.DecimalField(decimal_places=2, auto_round=True)
        currency = pw.CharField(max_length=3, default="UYU")
        description = pw.TextField(null=True)
        position = pw.IntegerField(default=0)
        image_url = pw.CharField(max_length=500, null=True)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

        class Meta:
            table_name = "items"


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_model("items")
    migrator.remove_model("list_versions")
    migrator.remove_model("lists")
    migrator.remove_model("auth_codes")
    migrator.remove_model("users")
    migrator.remove_model("tenants")
