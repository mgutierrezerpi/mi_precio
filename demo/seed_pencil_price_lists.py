"""Seed the five price-list definitions shown in pencil.pen.

Requires demo/tok.json and a running API at localhost:8000. This script is
additive: it does not delete existing data. It updates the versioned public
content for the exact named lists and adds sample items only to empty lists.
"""

import json
import os
import urllib.error
import urllib.request

BASE = "http://localhost:8000/api/v1"
HERE = os.path.dirname(__file__)
with open(os.path.join(HERE, "tok.json"), encoding="utf-8") as token_file:
    TOKEN_DATA = json.load(token_file)
TOKEN = TOKEN_DATA["token"]
TENANT_ID = TOKEN_DATA["tenant"]["id"]
HEADERS = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}


def call(method: str, path: str, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(
        BASE + path, data=data, headers=HEADERS, method=method
    )
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode()
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()


SAMPLE_ITEMS = [
    ("Pintura látex interior 4L", 1430, "Pinturas"),
    ("Taladro percutor Bosch GSB", 8990, "Herramientas"),
    ("Caja eléctrica 4x4", 212, "Eléctricos"),
    ("Cemento Loma Negra 50kg", 985, "Construcción"),
    ("Lámpara LED 9W E27", 145, "Iluminación"),
    ("Cinta aisladora 20m", 98, "Eléctricos"),
]


def content(title: str, body: str, promotions: list[str]) -> dict:
    return {
        "schema_version": 1,
        "hero": {
            "eyebrow": "CATÁLOGO ACTUALIZADO",
            "title": title,
            "body": body,
            "stats": [
                {"value": "Precios", "label": "actualizados"},
                {"value": "UYU", "label": "moneda"},
            ],
        },
        "blocks": [
            {
                "id": "catalog-main",
                "type": "catalog",
                "sections": [
                    {
                        "id": "paint",
                        "title": "Pinturas",
                        "source": {"kind": "category", "value": "Pinturas"},
                    },
                    {
                        "id": "tools",
                        "title": "Herramientas",
                        "source": {"kind": "category", "value": "Herramientas"},
                    },
                    {
                        "id": "electric",
                        "title": "Eléctricos",
                        "source": {"kind": "category", "value": "Eléctricos"},
                    },
                ],
            },
            {"id": "promotions", "type": "promotion_strip", "items": promotions},
            {
                "id": "contact",
                "type": "contact",
                "show_whatsapp": True,
                "hours": [
                    {"days": "Lun — Vie", "hours": "08:00 — 19:00"},
                    {"days": "Sábado", "hours": "08:00 — 13:00"},
                ],
            },
        ],
    }


LISTS = [
    (
        "Lista principal",
        True,
        True,
        content(
            "Pintura, ferretería y herramientas al mejor precio",
            "Comprá mayorista o minorista. Realizamos envíos a todo Uruguay.",
            ["Envío gratis desde UYU 3.000", "Hasta 6 cuotas sin recargo"],
        ),
    ),
    (
        "Mayoristas",
        True,
        False,
        content(
            "Precios mayoristas para tu negocio",
            "Precios por volumen y atención comercial personalizada.",
            ["Consultá escalas por cantidad", "Cuenta comercial disponible"],
        ),
    ),
    (
        "Promociones de invierno",
        True,
        False,
        content(
            "Promociones de invierno",
            "Ofertas seleccionadas para preparar tu obra esta temporada.",
            ["Hasta 30% en pinturas", "Promociones por tiempo limitado"],
        ),
    ),
    (
        "Cliente Distrimax",
        True,
        False,
        content(
            "Precios acordados para Distrimax",
            "Lista privada con condiciones comerciales vigentes.",
            ["Precios exclusivos", "Vigencia sujeta a acuerdo comercial"],
        ),
    ),
    (
        "Catálogo 2025",
        False,
        False,
        content(
            "Catálogo 2025",
            "Versión archivada del catálogo de productos y precios.",
            ["Catálogo histórico", "No disponible públicamente"],
        ),
    ),
]


def ensure_items(version: dict) -> None:
    status, current_items = call("GET", f"/versions/{version['id']}/items")
    if status != 200 or current_items:
        return
    for name, price, category in SAMPLE_ITEMS:
        status, response = call(
            "POST",
            f"/versions/{version['id']}/items",
            {"name": name, "price": price, "currency": "UYU", "category": category},
        )
        if status not in (200, 201):
            raise RuntimeError(f"Could not add {name}: {status} {response}")


def ensure_list(definition: tuple, existing: dict[str, dict]) -> None:
    name, published, show_on_index, list_content = definition
    price_list = existing.get(name)
    if price_list is None:
        status, price_list = call("POST", f"/tenants/{TENANT_ID}/lists", {"name": name})
        if status not in (200, 201):
            raise RuntimeError(f"Could not create {name}: {status} {price_list}")
    status, detailed = call("GET", f"/lists/{price_list['id']}")
    if status != 200 or not detailed.get("versions"):
        raise RuntimeError(f"Could not read version for {name}: {status} {detailed}")
    version = detailed["versions"][-1]
    ensure_items(version)
    status, response = call(
        "PATCH",
        f"/versions/{version['id']}/content",
        {
            "content": list_content,
            "content_revision": version.get("content_revision", 0),
        },
    )
    if status != 200:
        raise RuntimeError(f"Could not save content for {name}: {status} {response}")
    status, response = call(
        "PATCH",
        f"/lists/{price_list['id']}",
        {"published": published, "show_on_index": show_on_index},
    )
    if status != 200:
        raise RuntimeError(f"Could not update {name}: {status} {response}")
    print(f"ready: {name}")


def main() -> None:
    status, rows = call("GET", f"/tenants/{TENANT_ID}/lists")
    if status != 200:
        raise RuntimeError(f"Could not read existing lists: {status} {rows}")
    existing = {row["name"]: row for row in rows}
    for definition in LISTS:
        ensure_list(definition, existing)
    print(f"Open http://localhost:3000/p/{TOKEN_DATA['tenant']['subdomain']}")


if __name__ == "__main__":
    main()
