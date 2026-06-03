from peewee import CharField, TextField
from models.base import BaseModel


class Tenant(BaseModel):
    name = CharField(max_length=255)
    subdomain = CharField(max_length=63, unique=True, index=True)
    currency = CharField(max_length=3, default="UYU")

    # Brand & appearance (shown on the public price-list page)
    logo_url = TextField(null=True)        # data URL or hosted URL
    brand_color = CharField(max_length=9, null=True)  # hex, e.g. #7C3AED
    description = TextField(null=True)

    # Language & region
    language = CharField(max_length=5, default="es")
    timezone = CharField(max_length=64, default="America/Montevideo")

    # Tax / legal data
    legal_name = CharField(max_length=255, null=True)
    tax_id = CharField(max_length=32, null=True)   # RUT / CUIT / etc.
    address = TextField(null=True)

    class Meta:
        table_name = "tenants"
