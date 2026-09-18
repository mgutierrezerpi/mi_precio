"""Carga un catalogo de ferreteria de ejemplo, para el enlace "Ver una lista de
ejemplo" del perfil de Instagram (ver marketing/instagram-perfil.md).

Se apoya en el mismo API que demo/seed.py, pero apunta a donde le digas y toma
el token de una variable de entorno, porque el destino es produccion:

    MIPRECIO_API=https://miprecio.app/api/v1 \
    MIPRECIO_TOKEN=<jwt> MIPRECIO_TENANT=<tenant_id> python seed_ferreteria.py

El tenant tiene que existir y tener plan activo: en produccion BILLING_ENABLED
esta en true, asi que PATCH /tenants/{id}/plan devuelve 402 y el plan hay que
activarlo desde facturacion. Este script NO intenta cambiarlo.

Es idempotente: borra los productos y listas previos del tenant antes de cargar.
"""
import json, os, sys, urllib.request, urllib.error

BASE = os.environ.get("MIPRECIO_API", "https://miprecio.app/api/v1").rstrip("/")
TOKEN = os.environ.get("MIPRECIO_TOKEN")
TID = os.environ.get("MIPRECIO_TENANT")
if not TOKEN or not TID:
    sys.exit("Faltan MIPRECIO_TOKEN y/o MIPRECIO_TENANT.")

H = {"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"}


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, headers=H, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


# El tenant se lista en el Marketplace publico junto a comercios reales:
# el nombre dice "demo" a proposito, para que nadie lo confunda con uno.
MARCA = {
    "name": "Ferreteria La Estrella (demo)",
    "description": "Catalogo de ejemplo para mostrar como se ve una lista de precios en MiPrecio.",
    "currency": "UYU",
    "brand_color": "#7C3AED",
    "language": "es",
}

CATEGORIAS = [
    ("Herramientas", "#8B5CF6"),
    ("Electricidad", "#F59E0B"),
    ("Sanitaria", "#0EA5E9"),
    ("Pinturas", "#EF4444"),
    ("Fijaciones", "#64748B"),
    ("Jardin", "#10B981"),
]

# (nombre, precio $U, categoria, descripcion)
PRODUCTOS = [
    ("Martillo de carpintero 16 oz", 690, "Herramientas", "Cabo de madera dura, una sacaclavos."),
    ("Juego de destornilladores 6 pzs", 890, "Herramientas", "Planos y Phillips, mango antideslizante."),
    ("Pinza universal 8 pulgadas", 540, "Herramientas", "Acero al cromo vanadio."),
    ("Llave ajustable 10 pulgadas", 620, "Herramientas", "Apertura hasta 30 mm."),
    ("Serrucho 20 pulgadas", 780, "Herramientas", "Dientes templados para madera."),
    ("Nivel de burbuja 60 cm", 850, "Herramientas", "Perfil de aluminio, tres burbujas."),
    ("Cinta metrica 5 m", 320, "Herramientas", "Traba automatica y clip de cinto."),
    ("Taladro percutor 650 W", 3290, "Herramientas", "Velocidad variable y reversa."),
    ("Amoladora angular 4 1/2 pulgadas", 2890, "Herramientas", "710 W, incluye disco de corte."),
    ("Set de mechas HSS 13 pzs", 690, "Herramientas", "De 1,5 a 6,5 mm, estuche metalico."),
    ("Caja de herramientas 16 pulgadas", 980, "Herramientas", "Plastico reforzado con bandeja."),

    ("Cable 2,5 mm2 (por metro)", 78, "Electricidad", "Unipolar, normalizado."),
    ("Llave termica 16 A", 520, "Electricidad", "Riel DIN, curva C."),
    ("Tomacorriente doble", 240, "Electricidad", "Con toma a tierra."),
    ("Interruptor simple", 180, "Electricidad", "Modulo con tapa incluida."),
    ("Lampara LED 9 W", 190, "Electricidad", "Luz fria, rosca E27."),
    ("Reflector LED 50 W", 890, "Electricidad", "Exterior, IP65."),
    ("Zapatilla 4 tomas con cable", 420, "Electricidad", "Cable de 1,5 m con llave."),
    ("Cinta aisladora 20 m", 95, "Electricidad", "Negra, uso general."),

    ("Cano PVC 40 mm x 3 m", 420, "Sanitaria", "Desague domiciliario."),
    ("Codo PVC 40 mm", 65, "Sanitaria", "A 90 grados, para encolar."),
    ("Sifon flexible", 230, "Sanitaria", "Extensible, para pileta."),
    ("Canilla de jardin 1/2 pulgada", 380, "Sanitaria", "Bronce cromado."),
    ("Flexible de acero 1/2 pulgada 40 cm", 210, "Sanitaria", "Malla trenzada."),
    ("Cinta de teflon 12 m", 55, "Sanitaria", "Para roscas."),

    ("Latex interior 4 L", 1690, "Pinturas", "Blanco mate, lavable."),
    ("Esmalte sintetico 1 L", 890, "Pinturas", "Brillante, interior y exterior."),
    ("Rodillo de lana 22 cm", 320, "Pinturas", "Con mango plastico."),
    ("Pincel 2 pulgadas", 180, "Pinturas", "Cerda natural."),
    ("Aguarras 1 L", 260, "Pinturas", "Diluyente mineral."),
    ("Lija al agua n 180", 35, "Pinturas", "Hoja de 23 x 28 cm."),

    ("Tornillo autoperforante 8x1 (100 u)", 290, "Fijaciones", "Punta mecha, cabeza plana."),
    ("Tarugo de nylon 6 mm (50 u)", 140, "Fijaciones", "Para mamposteria."),
    ("Clavo 2 pulgadas (por kg)", 210, "Fijaciones", "Punta Paris."),

    ("Manguera reforzada 15 m", 890, "Jardin", "Tres capas, con conectores."),
    ("Tijera de podar", 640, "Jardin", "Hoja de acero, mango ergonomico."),
    ("Pala de punta", 780, "Jardin", "Cabo de madera reforzado."),
    ("Regadera 5 L", 330, "Jardin", "Plastico con flor removible."),
]


def main():
    st, plan = call("GET", "/tenants/%s/plan" % TID)
    print("plan actual:", st, str(plan)[:160])

    st, previos = call("GET", "/tenants/%s/products" % TID)
    if isinstance(previos, list):
        for p in previos:
            call("DELETE", "/products/%s" % p["id"])
        print("productos borrados:", len(previos))
    st, listas = call("GET", "/tenants/%s/lists" % TID)
    if isinstance(listas, list):
        for l in listas:
            call("DELETE", "/lists/%s" % l["id"])
        print("listas borradas:", len(listas))

    print("marca:", call("PATCH", "/tenants/%s" % TID, MARCA)[0])

    for nombre, color in CATEGORIAS:
        call("POST", "/tenants/%s/categories" % TID, {"name": nombre, "color": color})
    print("categorias:", len(CATEGORIAS))

    ok = 0
    for nombre, precio, cat, desc in PRODUCTOS:
        st, r = call("POST", "/tenants/%s/products" % TID, {
            "name": nombre, "price": precio, "currency": "UYU",
            "category": cat, "description": desc, "available": True,
        })
        if st in (200, 201):
            ok += 1
        else:
            print("  producto FALLO:", nombre, st, str(r)[:120])
    print("productos: %d/%d" % (ok, len(PRODUCTOS)))

    st, lista = call("POST", "/tenants/%s/lists" % TID,
                     {"name": "Lista de precios", "kind": "menu"})
    if st not in (200, 201):
        sys.exit("No se pudo crear la lista: %s %s" % (st, str(lista)[:200]))
    LID = lista["id"]
    VID = lista["versions"][0]["id"] if lista.get("versions") else None
    if not VID:
        VID = call("POST", "/lists/%s/versions" % LID, {"name": "v1"})[1]["id"]

    ok = 0
    for nombre, precio, cat, desc in PRODUCTOS:
        st, r = call("POST", "/versions/%s/items" % VID, {
            "name": nombre, "price": precio, "currency": "UYU",
            "category": cat, "description": desc,
        })
        if st in (200, 201):
            ok += 1
        else:
            print("  item FALLO:", nombre, st, str(r)[:120])
    print("items en la lista: %d/%d" % (ok, len(PRODUCTOS)))

    print("publicar:", call("PATCH", "/lists/%s" % LID,
                            {"published": True, "show_on_index": True})[0])

    st, t = call("GET", "/tenants/%s" % TID)
    sub = t.get("subdomain", "?") if isinstance(t, dict) else "?"
    raiz = BASE.replace("/api/v1", "")
    print("\nLISTO. Publico: %s/p/%s/%s" % (raiz, sub, LID))
    print("Verifica que la lista quede `live`, no solo `published`:")
    print("  un plan vencido o mas bajo la esconde al servirla.")


if __name__ == "__main__":
    main()
