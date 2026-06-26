from pydantic import BaseModel


class UpdateMember(BaseModel):
    role: str | None = None
    simple_admin_ui: bool | None = None
    admin_ui_mode: str | None = None
