"""Add manual billing/subscription fields to tenants."""

import peewee as pw


def migrate(migrator, database, fake=False, **kwargs):
    migrator.add_fields(
        "tenants",
        billing_provider=pw.CharField(max_length=32, null=True),
        billing_customer_id=pw.CharField(max_length=64, null=True),
        billing_subscription_id=pw.CharField(max_length=64, null=True),
        billing_variant_id=pw.CharField(max_length=64, null=True),
        billing_status=pw.CharField(max_length=32, null=True),
        billing_renews_at=pw.DateTimeField(null=True),
        billing_ends_at=pw.DateTimeField(null=True),
        billing_trial_ends_at=pw.DateTimeField(null=True),
        billing_portal_url=pw.TextField(null=True),
        billing_update_payment_url=pw.TextField(null=True),
        billing_card_brand=pw.CharField(max_length=32, null=True),
        billing_card_last_four=pw.CharField(max_length=8, null=True),
    )


def rollback(migrator, database, fake=False, **kwargs):
    migrator.remove_fields(
        "tenants",
        "billing_provider",
        "billing_customer_id",
        "billing_subscription_id",
        "billing_variant_id",
        "billing_status",
        "billing_renews_at",
        "billing_ends_at",
        "billing_trial_ends_at",
        "billing_portal_url",
        "billing_update_payment_url",
        "billing_card_brand",
        "billing_card_last_four",
    )
