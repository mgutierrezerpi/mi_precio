from peewee import CharField, ForeignKeyField
from models.base import BaseModel
from models.tenant import Tenant


class Invitation(BaseModel):
    """A pending invite for someone to join a tenant's team with a given role.

    Passwordless flow: the invite stays `pending` until the invited email logs in
    for the first time, at which point they join this tenant (see identity_context)."""

    tenant = ForeignKeyField(Tenant, backref="invitations", on_delete="CASCADE")
    email = CharField(max_length=255, index=True)
    role = CharField(max_length=20, default="viewer")
    status = CharField(max_length=16, default="pending")  # pending | accepted | revoked

    class Meta:
        table_name = "invitations"

    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        return super().save(*args, **kwargs)
