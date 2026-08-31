from peewee import CharField, DateTimeField, BooleanField
from models.base import BaseModel


class AuthCode(BaseModel):
    email = CharField(max_length=255, index=True)
    code = CharField(max_length=6)
    used = BooleanField(default=False)
    expires_at = DateTimeField()

    class Meta:
        table_name = "auth_codes"
