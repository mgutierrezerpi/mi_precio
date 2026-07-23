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
    public_app_url: str = "http://localhost:5173"

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

    # Billing settings
    billing_enabled: bool = False
    billing_manual_secret: str = ""
    lemonsqueezy_api_key: str = ""
    lemonsqueezy_store_id: str = ""
    lemonsqueezy_webhook_secret: str = ""
    lemonsqueezy_variant_micro: str = ""
    lemonsqueezy_variant_plus: str = ""
    lemonsqueezy_variant_pyme: str = ""  # Legacy alias for Plus.
    lemonsqueezy_variant_pro: str = ""

    # Support / Zoho Desk settings. Tickets are created server-side via the Zoho
    # Desk REST API (OAuth2), so the client secret + refresh token never reach
    # the browser. `*_base` are data-center specific: US .com, EU .eu, IN .in,
    # AU .com.au. Support is silently disabled until the OAuth values are set.
    zohodesk_api_base: str = "https://desk.zoho.com"
    zohodesk_accounts_base: str = "https://accounts.zoho.com"
    zohodesk_org_id: str = ""
    zohodesk_client_id: str = ""
    zohodesk_client_secret: str = ""
    zohodesk_refresh_token: str = ""
    # Optional: which department to file tickets under. Auto-detected (default
    # department) when left empty.
    zohodesk_department_id: str = ""

    # Storage settings
    storage_endpoint_url: str = ""
    storage_public_url: str = ""
    storage_bucket: str = "product-pictures"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_local_path: str = ""

    # Web Push (PWA notifications). Generate keys with bin/generate_vapid_keys.py.
    # `vapid_public_key` is the base64url applicationServerKey the browser uses to
    # subscribe; `vapid_private_key` signs the push requests. Push is silently
    # disabled while either is empty.
    vapid_public_key: str = ""
    vapid_private_key: str = ""
    vapid_subject: str = "mailto:soporte@miprecio.app"

    @property
    def push_enabled(self) -> bool:
        return bool(self.vapid_public_key and self.vapid_private_key)

    @property
    def zohodesk_enabled(self) -> bool:
        return bool(
            self.zohodesk_org_id
            and self.zohodesk_client_id
            and self.zohodesk_client_secret
            and self.zohodesk_refresh_token
        )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
