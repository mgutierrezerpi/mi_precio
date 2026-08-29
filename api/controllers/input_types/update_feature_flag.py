from pydantic import BaseModel


class UpdateFeatureFlag(BaseModel):
    enabled: bool
