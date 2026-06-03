from pydantic import BaseModel


class UpdateNotifPrefs(BaseModel):
    sales: bool | None = None
    catalog: bool | None = None
    customers: bool | None = None
    team: bool | None = None
