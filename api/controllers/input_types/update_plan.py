from pydantic import BaseModel


class UpdatePlan(BaseModel):
    plan: str
