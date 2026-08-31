from peewee import CharField, ForeignKeyField, TextField

from models.base import BaseModel
from models.tenant import Tenant


class Lead(BaseModel):
    """Someone who left their contact details on a shop's public list.

    Deliberately not a `Customer`: that one is defined as a contact *with a
    purchase history* and carries orders, and the Clientes screen and the
    dashboard stats are built around that. An unqualified inbound contact
    dropped in there would muddy both. A lead becomes a Customer only when the
    shop converts it, which is an explicit action.
    """

    tenant = ForeignKeyField(Tenant, backref="leads", on_delete="CASCADE")
    name = CharField(max_length=255)
    phone = CharField(max_length=50, null=True)
    email = CharField(max_length=255, null=True)
    message = TextField(null=True)

    # Which list they were looking at. A plain id rather than a foreign key:
    # the lead outlives the list, and losing the contact because the shop
    # deleted a menu would be worse than losing the reference.
    list_id = CharField(max_length=32, null=True)
    list_name = CharField(max_length=255, null=True)

    # form  = filled in the lead form at the foot of the list
    # cart  = built a cart and hit "order by WhatsApp"; the hottest kind, and
    #         previously lost entirely whenever WhatsApp was never sent
    source = CharField(max_length=16, default="form")

    # new | contacted | converted | discarded
    status = CharField(max_length=16, default="new")

    class Meta:
        table_name = "leads"
