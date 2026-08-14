from pydantic import BaseModel, Field


class CreateLead(BaseModel):
    """What the public lead form sends. Everything is best-effort: the context
    normalises and decides what is storable, because a stranger who scanned a
    QR should never meet a validation wall over punctuation."""

    name: str = Field(max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    message: str | None = Field(default=None, max_length=4000)
    # Which list they were reading, so the shop knows what the question is about.
    list_id: str | None = Field(default=None, max_length=32)
    list_name: str | None = Field(default=None, max_length=255)
    source: str = "form"

    # Honeypot. A real form keeps this hidden and empty; bots fill in every
    # field they find. Named like something worth filling in on purpose.
    website: str | None = None
