from peewee import CharField
from models.base import BaseModel


class Tenant(BaseModel):
    name = CharField(max_length=255)
    subdomain = CharField(max_length=63, unique=True, index=True)
    currency = CharField(max_length=3, default="UYU")

    class Meta:
        table_name = "tenants"
