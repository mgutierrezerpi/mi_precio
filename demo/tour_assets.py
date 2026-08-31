"""Embedded screenshot and logo assets for the standalone product tour."""

import base64
import os


_SCREENSHOT_KEYS = (
    "landing_full", "dashboard_full", "productos_full", "listas", "billing",
    "publica_full", "publica_movil_full", "appearance_full", "publica_new_full",
    "clientes_full", "reportes_full",
)


def load_embedded_assets(base_dir: str) -> tuple[dict[str, str], str]:
    """Load screenshots and the dark-background logo as portable data URIs."""
    shots_dir = os.path.join(base_dir, "shots")
    images = {
        key: _data_uri(os.path.join(shots_dir, f"{key}.png"), "image/png")
        for key in _SCREENSHOT_KEYS
    }
    logo_path = os.path.join(
        base_dir, "..", "web_app", "public", "miprecio-logo-white-pencil.webp"
    )
    return images, _data_uri(logo_path, "image/webp")


def _data_uri(path: str, mime_type: str) -> str:
    with open(path, "rb") as asset:
        encoded = base64.b64encode(asset.read()).decode()
    return f"data:{mime_type};base64,{encoded}"
