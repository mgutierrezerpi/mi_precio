from typing import Any

from pydantic import BaseModel, Field


class UpdateVersionContent(BaseModel):
    content: dict[str, Any]
    content_revision: int = Field(ge=0)
