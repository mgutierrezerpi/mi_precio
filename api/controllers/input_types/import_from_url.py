from pydantic import BaseModel, HttpUrl


class ImportFromUrl(BaseModel):
    url: HttpUrl
