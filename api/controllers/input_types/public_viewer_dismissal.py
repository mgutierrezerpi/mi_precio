from pydantic import BaseModel, Field


class PublicViewerDismissal(BaseModel):
    list_id: str = Field(min_length=1, max_length=32)
