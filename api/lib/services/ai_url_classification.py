"""URL classification used by menu extraction providers."""


def is_google_maps_url(url: str) -> bool:
    """Return whether a URL identifies a Google business listing."""
    value = url.lower()
    map_hosts = (
        "google.com/maps",
        "google.com.ar/maps",
        "google.com.uy/maps",
        "maps.google.com",
        "maps.app.goo.gl",
        "goo.gl/maps",
        "share.google",
    )
    if "google.com" in value and "/search" in value:
        return any(
            marker in value
            for marker in ("ludocid=", "menu-viewer", "localpoiphotos")
        )
    return any(host in value for host in map_hosts)
