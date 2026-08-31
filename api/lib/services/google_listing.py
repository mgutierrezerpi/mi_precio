"""Google business-listing metadata used by browser capture."""

from dataclasses import dataclass
from urllib.parse import parse_qs, unquote, urlparse

_LOCATIONS = {
    "google.com.uy": "Montevideo Uruguay",
    "google.com.ar": "Buenos Aires Argentina",
    "google.com.mx": "Ciudad de Mexico",
    "google.com.co": "Bogota Colombia",
    "google.com.pe": "Lima Peru",
    "google.com.cl": "Santiago Chile",
    "google.es": "España",
    "google.com": "",
}


@dataclass(frozen=True)
class GoogleListing:
    business_name: str
    location: str
    place_id: str | None


def parse_google_listing(url: str) -> GoogleListing:
    """Parse the business name and market hint carried by a Google URL."""
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    query = params.get("q", [""])[0]
    business_name = unquote(query).strip()
    if not business_name:
        raise ValueError("No se pudo extraer el nombre del negocio de la URL")
    domain = parsed.netloc.lower()
    location = next(
        (name for suffix, name in _LOCATIONS.items() if suffix in domain), ""
    )
    return GoogleListing(
        business_name=business_name,
        location=location,
        place_id=params.get("ludocid", [None])[0],
    )
