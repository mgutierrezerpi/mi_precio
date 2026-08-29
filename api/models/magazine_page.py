from peewee import CharField, ForeignKeyField, IntegerField, TextField

from models.base import BaseModel
from models.magazine import Magazine


class MagazinePage(BaseModel):
    """One ordered page in a magazine; content is a validated JSON document."""

    magazine = ForeignKeyField(Magazine, backref="pages", on_delete="CASCADE")
    position = IntegerField(default=0, index=True)
    page_type = CharField(max_length=32, default="editorial")
    title = CharField(max_length=255, null=True)
    image_url = TextField(null=True)
    content = TextField(null=True)

    class Meta:
        table_name = "magazine_pages"
        indexes = ((("magazine", "position"), True),)
