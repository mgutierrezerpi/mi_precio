from pydantic import BaseModel, ConfigDict


class BaseView(BaseModel):
    model_config = ConfigDict(from_attributes=True)
