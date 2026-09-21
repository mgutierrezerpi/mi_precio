"""Marketplace tenant discovery and proximity ordering."""

from math import asin, cos, radians, sin, sqrt

from models import Tenant


def nearby_marketplace_tenants(
    latitude: float | None = None,
    longitude: float | None = None,
    limit: int = 50,
    category: str | None = None,
):
    """Return opted-in businesses, sorting by proximity when coordinates exist."""
    candidates = Tenant.select().where(Tenant.marketplace_enabled)
    if category:
        candidates = candidates.where(Tenant.business_category == category)
    results = []
    for tenant in candidates:
        distance = _distance_from(latitude, longitude, tenant)
        results.append((tenant, distance))
    return sorted(results, key=lambda result: (result[1] is None, result[1] or 0))[
        :limit
    ]


def _distance_from(
    latitude: float | None, longitude: float | None, tenant: Tenant
) -> float | None:
    if latitude is None or longitude is None:
        return None
    try:
        return round(
            _distance_km(
                latitude,
                longitude,
                float(tenant.marketplace_latitude),
                float(tenant.marketplace_longitude),
            ),
            1,
        )
    except (TypeError, ValueError):
        return None


def _distance_km(lat_a: float, lon_a: float, lat_b: float, lon_b: float) -> float:
    d_lat = radians(lat_b - lat_a)
    d_lon = radians(lon_b - lon_a)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat_a)) * cos(radians(lat_b)) * sin(d_lon / 2) ** 2
    )
    return 6371 * 2 * asin(sqrt(a))
