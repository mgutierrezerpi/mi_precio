from pydantic import BaseModel, Field


class CreateSupportTicket(BaseModel):
    subject: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10, max_length=10000)
    # low | medium | high | urgent (defaults applied server-side if invalid).
    priority: str = "medium"
