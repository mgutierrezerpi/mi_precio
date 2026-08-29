from pydantic import BaseModel, field_validator
import re

from controllers.input_types.appearance import validate_design, validate_hex_color
from controllers.input_types.socials import normalize_social_url, normalize_whatsapp


class UpdateTenant(BaseModel):
    name: str | None = None
    subdomain: str | None = None
    currency: str | None = None
    # Brand & appearance
    logo_url: str | None = None
    brand_color: str | None = None
    description: str | None = None
    list_design: str | None = None
    list_bg_url: str | None = None
    list_bg_overlay: bool | None = None
    list_hero_color: str | None = None
    social_instagram: str | None = None
    social_facebook: str | None = None
    social_tiktok: str | None = None
    social_website: str | None = None
    social_whatsapp: str | None = None
    leads_enabled: bool | None = None
    # Language & region
    language: str | None = None
    timezone: str | None = None
    delivery_enabled: bool | None = None
    # Marketplace discovery
    marketplace_enabled: bool | None = None
    marketplace_latitude: float | None = None
    marketplace_longitude: float | None = None
    business_category: str | None = None
    whatsapp_url: str | None = None
    website_url: str | None = None
    instagram_url: str | None = None
    # Tax / legal
    legal_name: str | None = None
    tax_id: str | None = None
    address: str | None = None

    @field_validator("subdomain")
    @classmethod
    def validate_subdomain(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.lower()
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError(
                "Subdomain can only contain lowercase letters, numbers, and hyphens"
            )
        if len(v) < 3:
            raise ValueError("Subdomain must be at least 3 characters")
        if len(v) > 63:
            raise ValueError("Subdomain must be at most 63 characters")
        return v

    @field_validator("brand_color")
    @classmethod
    def validate_brand_color(cls, v: str | None) -> str | None:
        return validate_hex_color(v, "Brand color")

    @field_validator("list_hero_color")
    @classmethod
    def validate_list_hero_color(cls, v: str | None) -> str | None:
        return validate_hex_color(v, "Hero color")

    @field_validator("list_design")
    @classmethod
    def validate_list_design(cls, v: str | None) -> str | None:
        return validate_design(v)

    @field_validator("social_instagram")
    @classmethod
    def validate_social_instagram(cls, v: str | None) -> str | None:
        return normalize_social_url(v, "instagram")

    @field_validator("social_facebook")
    @classmethod
    def validate_social_facebook(cls, v: str | None) -> str | None:
        return normalize_social_url(v, "facebook")

    @field_validator("social_tiktok")
    @classmethod
    def validate_social_tiktok(cls, v: str | None) -> str | None:
        return normalize_social_url(v, "tiktok")

    @field_validator("social_website")
    @classmethod
    def validate_social_website(cls, v: str | None) -> str | None:
        return normalize_social_url(v, "website")

    @field_validator("social_whatsapp")
    @classmethod
    def validate_social_whatsapp(cls, v: str | None) -> str | None:
        return normalize_whatsapp(v)

    @field_validator("whatsapp_url", "website_url", "instagram_url")
    @classmethod
    def validate_public_url(cls, v: str | None) -> str | None:
        if v is None or not v.strip():
            return None
        value = v.strip()
        if not re.match(r"^https?://", value, re.IGNORECASE):
            raise ValueError("Public links must start with http:// or https://")
        return value
