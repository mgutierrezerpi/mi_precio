import json, urllib.request, os

BASE = "http://localhost:8000/api/v1"
SP = os.path.dirname(__file__)
tok = json.load(open(os.path.join(SP, "tok.json")))
TOKEN = tok["token"]
TID = tok["tenant"]["id"]
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

def img(pid):
    return f"https://images.unsplash.com/{pid}?w=600&h=600&fit=crop&q=80"

# (name, price, category, description, unsplash_id)
products = [
    ("Espresso",            90,  "Cafés",       "Doble shot de nuestro blend de la casa.",       "photo-1510591509098-f4fdc6d0ff04"),
    ("Flat White",         140,  "Cafés",       "Espresso con leche texturizada.",               "photo-1517701550927-30cf4ba1dba5"),
    ("Cappuccino",         130,  "Cafés",       "Espresso, leche y espuma cremosa.",             "photo-1572442388796-11668a67e53d"),
    ("Cold Brew",          160,  "Cafés",       "Café de extracción en frío, 18 horas.",         "photo-1461023058943-07fcbe16d735"),
    ("Latte de Vainilla",  170,  "Cafés",       "Latte con jarabe de vainilla natural.",         "photo-1541167760496-1628856ab772"),
    ("Medialuna",           45,  "Pastelería",  "De manteca, recién horneada.",                  "photo-1555507036-ab1f4038808a"),
    ("Cheesecake",         210,  "Pastelería",  "Porción con frutos rojos.",                     "photo-1533134242443-d4fd215305ad"),
    ("Brownie",            150,  "Pastelería",  "Chocolate 70% con nueces.",                     "photo-1606313564200-e75d5e30476c"),
    ("Alfajor de Maicena", 120,  "Pastelería",  "Relleno de dulce de leche y coco.",             "photo-1558961363-fa8fdf82db35"),
    ("Tostado Completo",   240,  "Desayunos",   "Jamón, queso y tomate en pan de masa madre.",   "photo-1528735602780-2552fd46c7af"),
    ("Avocado Toast",      280,  "Desayunos",   "Palta, huevo pochado y semillas.",              "photo-1588137378633-dea1336ce1e2"),
    ("Yogur con Granola",  190,  "Desayunos",   "Yogur natural, granola casera y miel.",         "photo-1488477181946-6428a0291777"),
]

# 0) Most expensive plan
st, r = call("PATCH", f"/tenants/{TID}/plan", {"plan": "pro"})
print("plan->pro:", st)

# 1) Clean previous seed (idempotent re-runs)
st, existing = call("GET", f"/tenants/{TID}/products")
if isinstance(existing, list):
    for p in existing:
        call("DELETE", f"/products/{p['id']}")
    print("deleted products:", len(existing))
st, oldlists = call("GET", f"/tenants/{TID}/lists")
if isinstance(oldlists, list):
    for l in oldlists:
        call("DELETE", f"/lists/{l['id']}")
    print("deleted lists:", len(oldlists))

# 2) Brand
st, r = call("PATCH", f"/tenants/{TID}", {
    "name": "Café Aurora",
    "description": "Café de especialidad y pastelería artesanal",
    "currency": "UYU", "brand_color": "#7C3AED", "language": "es",
})
print("brand:", st)

# 3) Categories
for name, color in [("Cafés", "#8B5CF6"), ("Pastelería", "#F59E0B"), ("Desayunos", "#10B981")]:
    call("POST", f"/tenants/{TID}/categories", {"name": name, "color": color})
print("categories: ok")

# 4) Products with images
ok = 0
for name, price, cat, desc, pid in products:
    st, r = call("POST", f"/tenants/{TID}/products", {
        "name": name, "price": price, "currency": "UYU", "category": cat,
        "description": desc, "available": True, "image_url": img(pid),
    })
    if st in (200, 201): ok += 1
    else: print("prod FAIL", name, st, str(r)[:120])
print("products ok:", ok, "/", len(products))

# 5) Public list "Menú" with items (also carry images)
st, listobj = call("POST", f"/tenants/{TID}/lists", {"name": "Menú", "kind": "menu"})
LID = listobj["id"]
VID = listobj["versions"][0]["id"] if listobj.get("versions") else None
if not VID:
    st, ver = call("POST", f"/lists/{LID}/versions", {"name": "v1"})
    VID = ver["id"]
for name, price, cat, desc, pid in products:
    st, r = call("POST", f"/versions/{VID}/items", {
        "name": name, "price": price, "currency": "UYU", "category": cat,
        "description": desc, "image_url": img(pid),
    })
    if st not in (200, 201): print("item FAIL", name, st, str(r)[:120])
call("PATCH", f"/lists/{LID}", {"published": True, "show_on_index": True})
print("list published:", LID)

print("\nDONE. subdomain:", tok["tenant"]["subdomain"], "| public:", f"http://localhost:3000/p/{tok['tenant']['subdomain']}")
