from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Mi Precio API"
    debug: bool = False
    database_path: str = "mi_precio.db"
    secret_key: str = "change-me-in-production"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # JWT settings
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours

    # OpenAI settings
    openai_api_key: str = ""

    # Outscraper settings (for Google Maps scraping)
    outscraper_api_key: str = ""

    # Mailer settings
    sendgrid_api_key: str = ""
    mailer_enabled: bool = False
    log_auth_codes: bool = True

    # Storage settings
    storage_endpoint_url: str = ""
    storage_public_url: str = ""
    storage_bucket: str = "product-pictures"
    storage_access_key: str = ""
    storage_secret_key: str = ""


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
