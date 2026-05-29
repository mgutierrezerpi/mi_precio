from pydantic import BaseModel, HttpUrl


class ImportFromImages(BaseModel):
    image_urls: list[HttpUrl]
