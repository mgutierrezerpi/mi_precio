from typing import Literal

import re

from pydantic import BaseModel, Field, field_validator

from controllers.input_types.appearance import validate_hex_color


class LinkTreeLink(BaseModel):
    id: str | None = Field(default=None, max_length=64)
    title: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=180)
    url: str = Field(default="", max_length=2000)
    icon: str = Field(default="arrow", max_length=32)
    style: Literal["featured", "dark", "light"] = "light"
    enabled: bool = True


class UpdateLinkTree(BaseModel):
    public_slug: str | None = Field(default=None, min_length=3, max_length=63)
    display_name: str | None = Field(default=None, min_length=1, max_length=255)
    handle: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=500)
    avatar_url: str | None = Field(default=None, max_length=2000)
    accent_color: str | None = None
    background_color: str | None = None
    template: Literal["botanical", "editorial", "atelier"] | None = None
    font: Literal["sans", "editorial", "mono", "code-pro"] | None = None
    tags: list[str] | None = Field(default=None, max_length=8)
    links: list[LinkTreeLink] | None = Field(default=None, max_length=12)
    instagram_url: str | None = Field(default=None, max_length=2000)
    tiktok_url: str | None = Field(default=None, max_length=2000)
    email_url: str | None = Field(default=None, max_length=2000)
    whatsapp_url: str | None = Field(default=None, max_length=2000)
    website_url: str | None = Field(default=None, max_length=2000)
    location_url: str | None = Field(default=None, max_length=2000)
    published: bool | None = None

    @field_validator("accent_color", "background_color")
    @classmethod
    def validate_colors(cls, value: str | None) -> str | None:
        return validate_hex_color(value, "Linktree color")

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        return [tag.strip()[:32] for tag in value if tag.strip()][:8]

    @field_validator("public_slug")
    @classmethod
    def validate_public_slug(cls, value: str | None) -> str | None:
        if value is None:
            return None
        slug = value.strip().lower()
        if not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?", slug):
            raise ValueError("Usá letras, números y guiones para tu link público")
        return slug

    @field_validator("avatar_url")
    @classmethod
    def validate_avatar_url(cls, value: str | None) -> str | None:
        if value and value.startswith("data:"):
            raise ValueError("Subí la imagen para guardarla en almacenamiento seguro")
        return value
