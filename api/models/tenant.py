from peewee import BooleanField, CharField, DateTimeField, TextField
from models.base import BaseModel


class Tenant(BaseModel):
    name = CharField(max_length=255)
    subdomain = CharField(max_length=63, unique=True, index=True)
    currency = CharField(max_length=3, default="UYU")

    # Subscription plan: free | micro | plus | pro (limits enforced in plans_context).
    plan = CharField(max_length=16, default="free")

    # Billing provider state. Lemon Squeezy is the first provider, but these
    # columns stay generic enough for manual fallback and future migration.
    billing_provider = CharField(max_length=32, null=True)
    billing_customer_id = CharField(max_length=64, null=True)
    billing_subscription_id = CharField(max_length=64, null=True)
    billing_variant_id = CharField(max_length=64, null=True)
    billing_status = CharField(max_length=32, null=True)
    billing_renews_at = DateTimeField(null=True)
    billing_ends_at = DateTimeField(null=True)
    billing_trial_ends_at = DateTimeField(null=True)
    billing_portal_url = TextField(null=True)
    billing_update_payment_url = TextField(null=True)
    billing_card_brand = CharField(max_length=32, null=True)
    billing_card_last_four = CharField(max_length=8, null=True)

    # Brand & appearance (shown on the public price-list page)
    logo_url = TextField(null=True)        # data URL or hosted URL
    brand_color = CharField(max_length=9, null=True)  # hex, e.g. #7C3AED
    description = TextField(null=True)

    # Language & region
    language = CharField(max_length=5, default="es")
    timezone = CharField(max_length=64, default="America/Montevideo")

    # Whether the business offers home delivery; gates the cart's delivery option.
    delivery_enabled = BooleanField(default=False)

    # Tax / legal data
    legal_name = CharField(max_length=255, null=True)
    tax_id = CharField(max_length=32, null=True)   # RUT / CUIT / etc.
    address = TextField(null=True)

    class Meta:
        table_name = "tenants"
