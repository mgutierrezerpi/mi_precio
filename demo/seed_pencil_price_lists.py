"""Seed the price-list and magazine definitions shown in the Pretty Lists Pencil file.

Requires demo/tok.json and a running API at localhost:8000. This script is
additive: it does not delete existing data. It updates the versioned public
content for the exact named lists, creates the Cheese Factory Journal as a
magazine, and adds sample items only to empty lists.
"""

import json
import os
import sys
import urllib.error
import urllib.request

BASE = "http://localhost:8000/api/v1"
HERE = os.path.dirname(__file__)
TOKEN_DATA = None
token_path = os.path.join(HERE, "tok.json")
if os.path.exists(token_path):
    with open(token_path, encoding="utf-8") as token_file:
        TOKEN_DATA = json.load(token_file)
TOKEN = os.environ.get("DEMO_TOKEN") or (TOKEN_DATA or {}).get("token")
TENANT_ID = os.environ.get("DEMO_TENANT_ID") or (TOKEN_DATA or {}).get(
    "tenant", {}
).get("id")
SUBDOMAIN = os.environ.get("DEMO_SUBDOMAIN") or (TOKEN_DATA or {}).get(
    "tenant", {}
).get("subdomain")
if not TOKEN or not TENANT_ID:
    raise RuntimeError("Set DEMO_TOKEN and DEMO_TENANT_ID or create demo/tok.json")
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


PATISSERIE_ITEMS = [
    ("Cultured Butter Croissant", 4.50, "flaky, deeply golden", "Viennoiserie"),
    ("Pain au Chocolat", 5.25, "valrhona 70% chocolate", "Viennoiserie"),
    ("Cardamom Knot", 4.75, "pear sugar & citrus", "Viennoiserie"),
    ("Lemon Olive Oil", 5.50, "crème fraîche glaze", "Morning Cakes"),
    ("Almond Financier", 3.75, "brown butter & honey", "Morning Cakes"),
    ("Vanilla Bean Choux", 6.50, "diplomat cream, caramel", "Petite Pâtisserie"),
    ("Pistachio Paris–Brest", 7.50, "praliné mousseline", "Petite Pâtisserie"),
    ("Chocolate Éclair", 6.75, "dark cocoa glaze", "Petite Pâtisserie"),
    ("Summer Berry Tart", 7.25, "vanilla custard, basil", "Seasonal"),
    ("Apricot Galette", 6.25, "almond frangipane", "Seasonal"),
]

HARDWARE_ITEMS = [
    ("Brass wood screw", 8.50, "box of 50 · no. 8", "Fasteners"),
    ("Forged nail set", 12, "three sizes · steel", "Fasteners"),
    ("Steel wall hook", 9, "blackened finish", "Fasteners"),
    ("Oak handle hammer", 28, "16 oz · forged head", "Hand Tools"),
    ("Precision tape", 16, "5 m · metric + imperial", "Hand Tools"),
    ("Slimline brush", 14, "natural bristle · 2 in", "Paint & Repair"),
    ("Cedar protective oil", 22, "interior wood finish", "Paint & Repair"),
    ("Leather work gloves", 18, "lined · one pair", "Paint & Repair"),
    ("Door weather strip", 13, "6 m · self-adhesive", "Workshop Essentials"),
    ("Utility blade pack", 7, "10 replacement blades", "Workshop Essentials"),
]

CHEESE_FACTORY_ITEMS = [
    ("Coastal Brie", 18, "soft, creamy and quietly lactic", "The Board"),
    ("Alpine Gruyère", 16, "nutty, firm and made for melting", "The Board"),
    ("Valençay", 15, "goaty, bright and beautifully crumbly", "The Board"),
    ("Apricot & fennel jam", 11, "sun-warmed fruit with a little aniseed lift", "The Pantry"),
    ("Olive oil crackers", 8, "thin, crisp and salted just enough", "The Pantry"),
    ("Fermented chilli sauce", 13, "slow heat and bright acidity", "The Pantry"),
    ("Chilli crisp", 13, "for creamy brie and everything else", "The Hot Shelf"),
    ("Roasted pepper spread", 11, "sweet, smoky and ready for gruyère", "The Hot Shelf"),
    ("Wholegrain mustard", 9, "sharp enough to wake up the table", "The Hot Shelf"),
    ("Market Lane sourdough", 7, "a good loaf for a long table", "From the Kitchen"),
]


def content(
    eyebrow: str,
    title: str,
    body: str,
    sections: list[tuple[str, str]],
    promotions: list[str],
    contact: list[dict[str, str]],
) -> dict:
    return {
        "schema_version": 1,
        "hero": {
            "eyebrow": eyebrow,
            "title": title,
            "body": body,
        },
        "blocks": [
            {
                "id": "catalog-main",
                "type": "catalog",
                "sections": [
                    {
                        "id": section_id,
                        "title": section_title,
                        "source": {"kind": "category", "value": section_title},
                    }
                    for section_id, section_title in sections
                ],
            },
            {"id": "promotions", "type": "promotion_strip", "items": promotions},
            {
                "id": "contact",
                "type": "contact",
                "show_whatsapp": False,
                "hours": contact,
            },
        ],
    }


LISTS = [
    (
        "Maison Étoile — Price List",
        "pencil-bakery",
        True,
        True,
        content(
            "MAISON ÉTOILE · PATISSERIE",
            "the daily bake",
            "made with butter, patience & a little ceremony",
            [
                ("viennoiserie", "Viennoiserie"),
                ("morning-cakes", "Morning Cakes"),
                ("petite-patisserie", "Petite Pâtisserie"),
                ("seasonal", "Seasonal"),
            ],
            [
                "Saturday only · The morning table",
                "The pastry box · Six bakery favourites, wrapped for a slow morning · $28",
                "Pre-order by 5pm",
                "Croissant · Choux · Tart · Cake",
            ],
            [
                {"days": "17 RUE DES FLEURS", "hours": "OPEN DAILY 7–4"},
                {"days": "Saturday", "hours": "Please ask about today’s cakes"},
            ],
        ),
        PATISSERIE_ITEMS,
    ),
    (
        "Maison Étoile — Spring Garden",
        "pencil-garden",
        True,
        False,
        content(
            "MAISON ÉTOILE · SPRING EDITION",
            "garden morning",
            "bright bakes for long, green afternoons",
            [
                ("viennoiserie", "Viennoiserie"),
                ("morning-cakes", "Morning Cakes"),
                ("petite-patisserie", "Petite Pâtisserie"),
                ("seasonal", "Seasonal"),
            ],
            [
                "Spring picnic · The morning table",
                "The garden box · Six bright bakes for a sunlit table and a slow afternoon · $30",
                "Available Fri–Sun",
                "Lemon · Rhubarb · Pistachio · Honey",
            ],
            [
                {"days": "17 RUE DES FLEURS", "hours": "OPEN DAILY 7–4"},
                {"days": "Saturday", "hours": "Please ask about today’s cakes"},
            ],
        ),
        PATISSERIE_ITEMS,
    ),
    (
        "Maison Étoile — Summer Market",
        "pencil-market",
        True,
        False,
        content(
            "MAISON ÉTOILE · MARKET EDITION",
            "market day",
            "stone fruit, butter & a basket by the window",
            [
                ("viennoiserie", "Viennoiserie"),
                ("morning-cakes", "Morning Cakes"),
                ("petite-patisserie", "Petite Pâtisserie"),
                ("seasonal", "Seasonal"),
            ],
            [
                "Market Saturday · The apricot crate",
                "A generous collection of fruit-led favourites, made for sharing · $34",
                "Limited bake",
                "Apricot · Cherry · Almond · Vanilla",
            ],
            [
                {"days": "17 RUE DES FLEURS", "hours": "OPEN DAILY 7–4"},
                {"days": "Saturday", "hours": "Please ask about today’s cakes"},
            ],
        ),
        PATISSERIE_ITEMS,
    ),
    (
        "Maison Étoile — Winter Evening",
        "pencil-evening",
        True,
        False,
        content(
            "MAISON ÉTOILE · WINTER EDITION",
            "after dark",
            "spiced pastry for candlelit tables",
            [
                ("viennoiserie", "Viennoiserie"),
                ("morning-cakes", "Morning Cakes"),
                ("petite-patisserie", "Petite Pâtisserie"),
                ("seasonal", "Seasonal"),
            ],
            [
                "Winter supper · The candlelight box",
                "A warm collection of dark chocolate, spice and late-season citrus · $36",
                "Pre-order 24 hours",
                "Chocolate · Orange · Spice · Hazelnut",
            ],
            [
                {"days": "17 RUE DES FLEURS", "hours": "OPEN DAILY 7–4"},
                {"days": "Saturday", "hours": "Please ask about today’s cakes"},
            ],
        ),
        PATISSERIE_ITEMS,
    ),
    (
        "Northline Hardware — Retail List",
        "pencil-workshop",
        False,
        False,
        content(
            "NORTHLINE HARDWARE · EST. 1968",
            "the good workshop",
            "honest tools for the work in front of you",
            [
                ("fasteners", "Fasteners"),
                ("hand-tools", "Hand Tools"),
                ("paint-repair", "Paint & Repair"),
                ("workshop-essentials", "Workshop Essentials"),
            ],
            [
                "In the field · Made for the bench",
                "The starter kit · The everyday essentials for a good Saturday’s work · $48",
                "Save 15%",
                "Hammer · Tape · Screws · Gloves",
            ],
            [
                {"days": "18 CEDAR STREET", "hours": "OPEN 8–6"},
                {"days": "Workshop", "hours": "Ask us about rentals"},
            ],
        ),
        HARDWARE_ITEMS,
    ),
]

CHEESE_ITEMS = [
    ("Coastal Brie", 18, "soft, creamy and quietly lactic", "The Board"),
    ("Alpine Gruyère", 16, "nutty, firm and made for melting", "The Board"),
    ("Valençay", 15, "goaty, bright and beautifully crumbly", "The Board"),
    ("Apricot & fennel jam", 11, "sun-warmed fruit with a little aniseed lift", "The Pantry"),
    ("Olive oil crackers", 8, "thin, crisp and salted just enough", "The Pantry"),
    ("Fermented chilli sauce", 13, "slow heat and bright acidity", "The Hot Shelf"),
]
FLOWER_ITEMS = [
    ("Dahlia", 7, "lush, blush and wide open", "Latest Stems"),
    ("Garden rose", 5, "scented, soft and quietly dramatic", "Latest Stems"),
    ("Cosmos", 5, "chocolate-scented and dancing", "Latest Stems"),
    ("The morning bunch", 39, "fresh from the market", "The Weekly Stem"),
    ("The dinner table", 62, "low, abundant and fragrant", "The Weekly Stem"),
]
WINE_ITEMS = [
    ("Bright white", 32, "mineral, clean and quietly floral", "The Glass"),
    ("Chilled rosé", 35, "bright fruit and a dry finish", "The Glass"),
    ("Skin contact", 41, "textured, savoury and alive", "The Glass"),
    ("Old-vine grenache", 48, "warm, earthy and generous", "The Cellar"),
    ("Mineral resiling", 52, "long, salty and precise", "The Cellar"),
]
BATH_ITEMS = [
    ("Monocomando lavabo", 4200, "latón acabado mate", "Sanitarios"),
    ("Lavabo piedra natural", 8900, "piedra tallada", "Sanitarios"),
    ("Espejo circular", 5200, "vidrio y marco negro", "Espejos"),
    ("Grifería mural", 7400, "instalación empotrada", "Grifería"),
    ("Toallero calefaccionado", 11900, "acero negro", "Complementos"),
]
SERVICE_ITEMS = [
    ("Corte de estilo", 1200, "forma y acabado", "Services"),
    ("Color y brillo", 2900, "color personalizado", "Services"),
    ("Peinado de ocasión", 1650, "para un momento especial", "Services"),
    ("Facial ritual", 1800, "limpieza, masaje y calma", "Rituals"),
    ("Masaje esencial", 2400, "sesión de 50 minutos", "Rituals"),
    ("Tratamiento glow", 2100, "piel luminosa y descansada", "Rituals"),
]
AUTO_ITEMS = [
    ("Lavado premium exterior", 1400, "limpieza detallada", "Exterior"),
    ("Lavado premium interior", 1600, "aspirado y acabado", "Interior"),
    ("Pulido de pintura", 4200, "brillo y corrección", "Detailing"),
    ("Protección cerámica", 8900, "duración hasta 12 meses", "Protection"),
]


def template_list(name: str, design: str, eyebrow: str, title: str, body: str, sections: list[str], items: list[tuple[str, float, str, str]], promotion: str) -> tuple:
    return (name, design, True, False, content(eyebrow, title, body, [(s.lower().replace(" ", "-"), s) for s in sections], [promotion, "Ask us about the full collection", "Available this season"], [{"days": "OPEN DAILY", "hours": "BY APPOINTMENT"}]), items)


LISTS.extend(template_list(*spec) for spec in [
    ("Fromage & Co. — Counter List", "pencil-cheese", "FROMAGE & CO. · NATURAL CHEESE", "the cheese room", "carefully made, generously shared", ["The Board", "The Pantry", "The Hot Shelf"], CHEESE_ITEMS, "The supper board · $55"),
    ("Wild Stem Studio — Flower List", "pencil-flower", "WILD STEM STUDIO · DAILY FLOWERS", "flowers for an ordinary day", "a changing palette of field-grown stems", ["Latest Stems", "The Weekly Stem"], FLOWER_ITEMS, "Flowers, every Friday · $48"),
    ("Parchment Cellar — Wine Guide", "pencil-wine", "PARCHMENT CELLAR · NATURAL WINE", "something beautiful to open", "a small changing shelf for dinners and long conversations", ["The Glass", "The Cellar"], WINE_ITEMS, "Three bottles, one small story · $75"),
    ("Fromage & Co. — Alternating Product List", "pencil-cheese-alternating", "FROMAGE & CO. · THE DAILY EDIT", "a few good pieces", "a short list of things worth taking home", ["The Board", "The Pantry"], CHEESE_ITEMS, "Build a board for four"),
    ("Northline Hardware — Alternating Product List", "pencil-hardware-alternating", "NORTHLINE HARDWARE · OBJECTS FOR WORK", "the tools you keep", "honest objects for the work in front of you", ["Fasteners", "Hand Tools", "Workshop Essentials"], HARDWARE_ITEMS, "Made for the bench"),
    ("Wild Stem Studio — Summer Market", "pencil-flower-summer", "WILD STEM STUDIO · SUMMER EDITION", "the late-summer table", "sunlit stems for generous rooms", ["Latest Stems", "The Weekly Stem"], FLOWER_ITEMS, "A bouquet for the long table · $72"),
    ("Wild Stem Studio — Winter Evening", "pencil-flower-winter", "WILD STEM STUDIO · WINTER EDITION", "the winter room", "evergreen branches and stems that bring the outside in", ["Seasonal Stems", "The Weekly Stem"], FLOWER_ITEMS, "Flowers for the darker hours · $68"),
    ("Wild Stem Studio — Spring Garden", "pencil-flower-spring", "WILD STEM STUDIO · SPRING EDITION", "the green beginning", "fresh green stems and soft colour", ["First of the Season", "The Weekly Stem"], FLOWER_ITEMS, "The first flowers of spring · $64"),
    ("Northline Hardware — Weekend Project List", "pencil-hardware-weekend", "NORTHLINE HARDWARE · PROJECT LIST", "weekend project", "honest tools for a free afternoon", ["Fasteners", "Hand Tools", "Workshop Essentials"], HARDWARE_ITEMS, "The deck kit · $84"),
    ("Northline Hardware — Workshop Essentials", "pencil-hardware-shelf", "NORTHLINE HARDWARE · WORKSHOP ESSENTIALS", "the workshop shelf", "reliable objects for a bench well kept", ["Hand Tools", "Paint & Repair", "Workshop Essentials"], HARDWARE_ITEMS, "The essentials, gathered"),
    ("Casa Férrea — Bathroom Price List", "pencil-casa-ritual", "CASA FÉRREA · BATHROOMS", "El baño, como un ritual.", "un espacio para bajar el ritmo", ["Sanitarios", "Grifería", "Complementos"], BATH_ITEMS, "Selección esencial"),
    ("Casa Férrea — Monumental Bathroom Price List", "pencil-casa-bath", "CASA FÉRREA · MONUMENTAL", "BAÑO EQUIPAR", "objetos y piezas para un baño completo", ["Sanitarios", "Grifería", "Espejos"], BATH_ITEMS, "Referencia monumental"),
    ("Casa Férrea — Signature Reference", "pencil-casa-signature", "CASA FÉRREA · SIGNATURE", "Casa Férrea", "materiales, proporciones y detalles", ["Esenciales", "Equilibrio", "Ritual"], BATH_ITEMS, "Signature reference"),
    ("Casa Férrea — Service Column Price List", "pencil-casa-services", "CASA FÉRREA · SERVICIOS", "SERVICIOS", "un servicio pensado para acompañar cada proyecto", ["Sanitarios", "Grifería", "Mobiliario", "Complementos"], BATH_ITEMS, "Consultar proyecto"),
    ("Obsidian Auto Detail — Price List", "pencil-auto-detail", "OBSIDIAN AUTO DETAIL", "CAR DETAILING", "cuidado preciso para cada superficie", ["Exterior", "Interior", "Detailing", "Protection"], AUTO_ITEMS, "Premium auto care"),
    ("Blush & Bloom — Neon Salon Price List", "pencil-blush-bloom", "BLUSH & BLOOM", "Price List", "colour, cut and a little theatre", ["Cut", "Color", "Style"], SERVICE_ITEMS, "Book your next appointment"),
    ("Nova Studio — Cosmic Service Packages", "pencil-nova", "SERVICES & PACKAGES", "PRICE LIST", "choose your next orbit", ["Standard", "Premium", "Ultimate"], SERVICE_ITEMS, "Find your orbit"),
    ("Beardy Beauty Studio — Split Service List", "pencil-beardy", "BEARDY BEAUTY STUDIO", "SERVICES LIST", "cut, colour and craft", ["Hair", "Brows", "Skin", "Treatments"], SERVICE_ITEMS, "By appointment"),
    ("The Calm Spa — Circular Price List", "pencil-calm-spa", "THE CALM SPA", "PRICE LIST", "a slower way to feel better", ["Massage Therapy", "Facial Treatments", "Body Treatments", "Wellness Services"], SERVICE_ITEMS, "Make space for yourself"),
    ("Union Barber Shop — Classic Price List", "pencil-union-barber", "UNION'S BARBER SHOP", "PRICE LIST", "trusted barbershop service", ["Cuts", "Beard", "Ritual"], SERVICE_ITEMS, "Walk-ins welcome"),
    ("Studio Mono — Minimal Services & Products List", "pencil-studio-mono", "STUDIO MONO", "PRICE LIST", "services and products", ["Services", "Products"], SERVICE_ITEMS, "Simple, considered, exact"),
    ("The Beauty Issue — Editorial Service List", "pencil-beauty-issue", "THE BEAUTY ISSUE", "The Beauty Issue", "a considered edit of services", ["Services", "Rituals", "Treatments"], SERVICE_ITEMS, "The current issue"),
    ("Obsidian Quarterly — Detailing Service List", "pencil-obsidian-quarterly", "OBSIDIAN QUARTERLY · DETAILING", "Care for the drive.", "precise care for exceptional cars", ["Exterior", "Interior", "Protection"], AUTO_ITEMS, "Quarterly detailing edit"),
])

CHEESE_FACTORY_IMAGES = {
    "cover": "/pencil/cheese-factory/zLZId.png",
    "board": "/pencil/cheese-factory/xnu2M.png",
    "producer": "/pencil/cheese-factory/z9oXs.png",
    "chilli": "/pencil/cheese-factory/BHUpJ.png",
    "recipe": "/pencil/cheese-factory/bkM10.png",
    "history": "/pencil/cheese-factory/fsiu6.png",
    "table": "/pencil/cheese-factory/kofq2.png",
    "gruyere": "/pencil/cheese-factory/WeIY4.png",
    "figs": "/pencil/cheese-factory/E8p4K.png",
    "jam": "https://images.unsplash.com/photo-1785605121107-677f10a463f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    "crackers": "https://images.unsplash.com/photo-1657299156528-2d50a9a6a444?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    "sauce": "https://images.unsplash.com/photo-1757800499069-ace8d0d31ce8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    "pepper": "https://images.unsplash.com/photo-1698557048177-a460bb415177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
    "mustard": "https://images.unsplash.com/photo-1706111584143-4f41b25d1db7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080",
}


def magazine_page(title: str, page_type: str, image: str | None, *, eyebrow: str, headline: str, body: str, quote: str = "", footer: str = "", images: list[str] | None = None, products: list[dict[str, str]] | None = None, layout: str | None = None) -> dict:
    page_content = {
        "schema_version": 1,
        "eyebrow": eyebrow,
        "headline": headline,
        "body": body,
        "copy": body,
        "quote": quote,
        "footer": footer,
        "images": images if images is not None else ([image] if image else []),
    }
    if products is not None:
        page_content["products"] = products
    if layout is not None:
        page_content["layout"] = layout
    return {
        "title": title,
        "page_type": page_type,
        "image_url": image,
        "content": page_content,
    }


MAGAZINE_PAGES = [
    magazine_page("Cover", "cover", CHEESE_FACTORY_IMAGES["cover"], eyebrow="THE CHEESE FACTORY · ISSUE 01 · AUTUMN", headline="A good table starts here.", body="Cheese, preserves, crackers and the small things that turn a meal into an occasion.", quote="The best food invites everyone to stay a little longer.", footer="FROMAGE & CO. · MARKET LANE · 01"),
    magazine_page("The Pantry Shelf", "editorial", CHEESE_FACTORY_IMAGES["jam"], eyebrow="02 · THE PANTRY SHELF", headline="The accomplices", body="Good cheese asks for good company. Three things we always keep close at hand.", footer="FROMAGE & CO. · PANTRY GOODS · 02", images=[CHEESE_FACTORY_IMAGES["jam"], CHEESE_FACTORY_IMAGES["crackers"], CHEESE_FACTORY_IMAGES["sauce"]]),
    magazine_page("A Board for Four", "editorial", CHEESE_FACTORY_IMAGES["board"], eyebrow="03 · A BOARD FOR FOUR", headline="Build a board that holds the room.", body="No rules, only a little balance: creamy, salty, bright, crisp and something with heat.\n\n01  COASTAL BRIE + APRICOT JAM\n02  ALPINE GRUYÈRE + OLIVE OIL CRACKERS\n03  VALENÇAY + FERMENTED CHILLI SAUCE\n04  ADD FIGS, A KNIFE, A BOTTLE, FRIENDS", footer="FROMAGE & CO. · A GOOD TABLE · 03"),
    magazine_page("People of the Pasture", "profile", CHEESE_FACTORY_IMAGES["producer"], eyebrow="04 · PEOPLE OF THE PASTURE", headline="The person behind the wheel.", body="Every Monday, Mara turns the milk from eight small farms into wheels that will wait quietly in the cellar for months. Her work is measured in patience, temperature and the exact sound a rind makes under her thumb.", quote="The cheese tells you what it needs.", footer="FROMAGE & CO. · PORTRAIT SERIES · 04"),
    magazine_page("The Hot Shelf", "catalog", CHEESE_FACTORY_IMAGES["chilli"], eyebrow="05 · THE HOT SHELF", headline="A little heat.", body="Three bright jars for cheese, eggs, sandwiches and anything else that needs waking up.\n\nTry the chilli crisp with creamy brie. The roasted pepper spread belongs under a slice of gruyère. Mustard is non-negotiable.", footer="FROMAGE & CO. · PANTRY GOODS · 05", images=[CHEESE_FACTORY_IMAGES["chilli"], CHEESE_FACTORY_IMAGES["pepper"], CHEESE_FACTORY_IMAGES["mustard"]]),
    magazine_page("A Simple Recipe", "recipe", CHEESE_FACTORY_IMAGES["recipe"], eyebrow="06 · A SIMPLE RECIPE", headline="Grilled cheese, with an excellent jam.", body="01  Butter both sides of good sourdough.\n\n02  Add gruyère, brie and a spoonful of apricot jam.\n\n03  Press in a hot pan until golden, molten and unreasonably good.", footer="FROMAGE & CO. · FROM THE KITCHEN · 06"),
    magazine_page("Our History", "history", CHEESE_FACTORY_IMAGES["history"], eyebrow="07 · OUR HISTORY", headline="From a borrowed cellar to a long table.", body="In 1987, Clara and Émile found a damp cellar beneath a grocer’s shop and a handful of wheels worth waiting for. They borrowed a table, opened the door, and began cutting cheese for anyone who walked in.\n\n1987 — A cellar, six wheels and a hand-painted sign.\n2002 — The pantry shelf arrives: jam, crackers and mustard.\n2024 — A longer table, and many more reasons to gather.", footer="FROMAGE & CO. · THE STORY SO FAR · 07"),
    magazine_page("The Long Table", "editorial", CHEESE_FACTORY_IMAGES["table"], eyebrow="08 · THE LONG TABLE", headline="Why we still set the table.", body="There is a point in every service when the room changes. The door is still open, the wine is still being poured, but suddenly the table begins to make sense. Someone passes the bread. A knife finds the soft centre of a ripe cheese. The conversation gathers itself around the small, practical pleasure of sharing.\n\nAt the shop, we think often about the objects that make this possible. A board with room for one more wedge. A jar of something bright enough to interrupt the richness. Crackers that break cleanly between your fingers.", quote="A meal is more than a collection of plates. It is an invitation to slow the evening down.", footer="FROMAGE & CO. · THE LONG TABLE · 08", images=[CHEESE_FACTORY_IMAGES["table"], CHEESE_FACTORY_IMAGES["gruyere"], CHEESE_FACTORY_IMAGES["figs"]]),
    magazine_page("Notes from the Counter", "notes", CHEESE_FACTORY_IMAGES["table"], eyebrow="09 · NOTES FROM THE COUNTER", headline="The small art of choosing well.", body="There are choices we make quickly, and then there are the ones that become part of how we live. At the counter, we see both. Some people come in for the familiar wedge they have bought every Friday for years. Others pause, ask a question, and leave with something they had never imagined bringing to their table.\n\nChoosing well is not about finding the rarest thing on the shelf. It is about finding the thing that will make dinner easier, kinder, and perhaps more memorable.", quote="A good shop is not a place that sells you everything. It is a place that helps you notice what is worth taking home.", footer="FROMAGE & CO. · NOTES FROM THE COUNTER · 09"),
]

for layout, page in zip(("cover", "pantry", "pairing", "profile", "hot-shelf", "recipe", "history", "long-form", "one-image"), MAGAZINE_PAGES):
    page["content"]["layout"] = layout


WILD_STEM_IMAGES = {
    "cover": "/pencil/wild-stem/kStBV.png",
    "arranging": "/pencil/wild-stem/BnzaL.png",
    "club": "/pencil/wild-stem/t16Bs.png",
    "flower_food": "/pencil/wild-stem/bkO4U.png",
    "vase_cleaner": "/pencil/wild-stem/QFGmC.png",
    "foliage_spray": "/pencil/wild-stem/seEDM.png",
    "parrot_tulip": "/pencil/wild-stem/fnREW.png",
    "ranunculus": "/pencil/wild-stem/glfRd.png",
    "sweet_pea": "/pencil/wild-stem/eqMXS.png",
    "allium": "/pencil/wild-stem/rMjMd.png",
}

WILD_STEM_PAGES = [
    magazine_page("Cover", "cover", WILD_STEM_IMAGES["cover"], layout="flower-cover", eyebrow="WILD STEM STUDIO · VOLUME 01 · SPRING", headline="A season in bloom.", body="The stems, colours and quiet rituals of the flower shop.", quote="“There is always a flower for the moment you are having.”", footer="WILD STEM STUDIO · ORCHARD LANE · 01"),
    magazine_page("Seasonal Stems", "editorial", WILD_STEM_IMAGES["parrot_tulip"], layout="seasonal-stems", eyebrow="02 · FROM THE MARKET", headline="The stems we love now.", body="Four seasonal characters for a generous bunch, a bedside glass, or a table that needs a little life.", footer="WILD STEM STUDIO · TODAY’S MARKET LIST · 02", images=[WILD_STEM_IMAGES["parrot_tulip"], WILD_STEM_IMAGES["ranunculus"], WILD_STEM_IMAGES["sweet_pea"], WILD_STEM_IMAGES["allium"]], products=[
        {"name": "Parrot tulip", "price": "$4 / stem", "description": "Ruffled, painterly and best in a loose handful."},
        {"name": "Ranunculus", "price": "$5 / stem", "description": "Layered petals, warm colour, endless optimism."},
        {"name": "Sweet pea", "price": "$4 / stem", "description": "Scented, delicate and worth leaning close for."},
        {"name": "Allium", "price": "$6 / stem", "description": "One globe makes the whole room feel considered."},
    ]),
    magazine_page("Arranging Guide", "editorial", WILD_STEM_IMAGES["arranging"], layout="arranging-guide", eyebrow="03 · FROM THE STUDIO", headline="A loose bunch, at home.", body="01  Give them a drink\nCut the stems and use cool, clean water.\n\n02  Begin with shape\nLet the tallest stems make a soft, open outline.\n\n03  Add the small things\nTuck in the scented stems near the end.", quote="Nothing needs to be perfect. Start with a few stems you love, a clean vessel, and enough space to let the flowers lean.", footer="WILD STEM STUDIO · ARRANGING NOTES · 03"),
    magazine_page("Flower Club", "editorial", WILD_STEM_IMAGES["club"], layout="flower-club", eyebrow="04 · THE WEEKLY STEM", headline="Flowers, right when you need them.", body="A market-led bunch arrives every Friday: loose, seasonal and ready to make the whole week feel different.", footer="WILD STEM STUDIO · FLOWER CLUB · 04", images=[WILD_STEM_IMAGES["club"]], products=[{"name": "Four seasonal bunches each month.", "price": "$96 / month", "description": ""}]),
    magazine_page("Care Shelf", "catalog", WILD_STEM_IMAGES["flower_food"], layout="care-shelf", eyebrow="05 · THE CARE SHELF", headline="A little care.", body="Three small things that help a bunch stay beautiful for longer.", quote="Fresh water, a clean vessel, and one thoughtful trim each day. Small rituals make flowers last.", footer="WILD STEM STUDIO · CARE NOTES · 05", images=[WILD_STEM_IMAGES["flower_food"], WILD_STEM_IMAGES["vase_cleaner"], WILD_STEM_IMAGES["foliage_spray"]], products=[
        {"name": "FLOWER FOOD", "price": "$4", "description": ""},
        {"name": "VASE CLEANER", "price": "$9", "description": ""},
        {"name": "FOLIAGE SPRAY", "price": "$12", "description": ""},
    ]),
]

AQUA_OBJECTS_IMAGES = {
    "cover": "/pencil/aqua-objects/x4XJN.png",
    "monolith": "/pencil/aqua-objects/idcKU.png",
    "fittings": "/pencil/aqua-objects/ac0MG.png",
    "history": "/pencil/aqua-objects/N6NA6m.png",
    "pale_room": "/pencil/aqua-objects/pale-room.jpg",
    "brass_room": "/pencil/aqua-objects/brass-room.jpg",
    "steam_room": "/pencil/aqua-objects/steam-room.jpg",
}

AQUA_OBJECTS_PAGES = [
    magazine_page("Cover", "cover", AQUA_OBJECTS_IMAGES["cover"], layout="aqua-cover", eyebrow="OBJECTS FOR WATER · ISSUE Nº 01 · 2025", headline="The new ritual of the room.", body="A considered guide to taps, basins, baths and the materials that make a private space feel extraordinary.", footer="AQUA / EDIT · OBJECTS FOR WATER · 01"),
    magazine_page("The Monolith Bath", "editorial", AQUA_OBJECTS_IMAGES["monolith"], layout="aqua-monolith", eyebrow="02 · THE MONOLITH BATH", headline="A bath as an object, not an afterthought.", body="One continuous form in mineral composite — quiet, substantial and made to hold the room.", footer="AQUA / EDIT · OBJECT STUDY · 02", images=[AQUA_OBJECTS_IMAGES["monolith"]], products=[
        {"name": "MATERIAL", "price": "MINERAL COMPOSITE", "description": ""},
        {"name": "LENGTH", "price": "1680 MM", "description": ""},
        {"name": "FINISH", "price": "MATTE IVORY", "description": ""},
    ]),
    magazine_page("Brass Fittings", "catalog", AQUA_OBJECTS_IMAGES["fittings"], layout="aqua-fittings", eyebrow="03 · CHROME, RECONSIDERED", headline="The line where water meets metal.", body="Fittings should feel inevitable: precise in the hand, almost invisible in the composition.", footer="AQUA / EDIT · FITTINGS · 03", images=[AQUA_OBJECTS_IMAGES["fittings"]], products=[
        {"name": "WALL MIXER", "price": "BRUSHED NICKEL · $420", "description": ""},
        {"name": "BASIN SPOUT", "price": "SATIN BRASS · $365", "description": ""},
        {"name": "RAIN HEAD", "price": "GUNMETAL · $560", "description": ""},
    ]),
    magazine_page("Shower Guide", "editorial", None, layout="aqua-shower", eyebrow="04 · A QUIETER SHOWER", headline="Designing for the sound of rain.", body="Good showering is choreography: the fall, the temperature, the small moment when the room disappears.\n\nTHE HEAD\nA wide rain head, 250 mm minimum, placed well above the tallest person in the house.\n\nTHE CONTROL\nThermostatic control at the entrance — no reaching into cold water.\n\nTHE DRAIN\nA linear drain that lets the floor read as one continuous plane.", quote="“The best rooms have a way of lowering your voice.”", footer="AQUA / EDIT · GUIDE · 04"),
    magazine_page("Field Notes", "editorial", AQUA_OBJECTS_IMAGES["pale_room"], layout="aqua-field-notes", eyebrow="05 · FIELD NOTES", headline="Three rooms worth lingering in", body="Small studies in light, material and the everyday gestures that turn a bathroom into a private sanctuary.", quote="Good design gives the day somewhere to land.", footer="AQUA / EDIT · FIELD NOTES · 05", images=[AQUA_OBJECTS_IMAGES["pale_room"], AQUA_OBJECTS_IMAGES["brass_room"], AQUA_OBJECTS_IMAGES["steam_room"]], products=[
        {"name": "STONE THAT HOLDS THE LIGHT", "price": "THE PALE ROOM", "description": "A limestone basin, softened edges and a morning ritual that starts quietly."},
        {"name": "WHY WARM METAL IS BACK", "price": "THE BRASS ROOM", "description": "The soft return of burnished brass — and the language of ageing a room."},
        {"name": "A SHOWER WITH A VIEW", "price": "THE STEAM ROOM", "description": "Glass, fog and a deep sill for the objects you reach for every day."},
    ]),
    magazine_page("History of the Bath", "editorial", AQUA_OBJECTS_IMAGES["history"], layout="aqua-history", eyebrow="06 · A BRIEF HISTORY OF THE BATH", headline="Before it was private, the bath was a civic pleasure.", body="From Roman thermae to the Japanese ofuro, the history of bathing has always been a story about how a culture understands time, body and care.\n\nThe earliest bathing rooms were collective spaces. In Rome, heat was a sequence: tepidarium, caldarium, frigidarium. Architecture guided the body through temperature, conversation and pause.\n\nCenturies later, the domestic bathroom became a laboratory for privacy. Porcelain, plumbing and the small luxury of hot water moved the ritual behind a closed door — but never made it less important.", quote="“To bathe was to participate in public life.”", footer="AQUA / EDIT · HISTORY · 06", images=[AQUA_OBJECTS_IMAGES["history"]]),
    magazine_page("Materials & Sources", "editorial", None, layout="aqua-sources", eyebrow="07 · MATERIALS & SOURCES", headline="Where the good things come from.", body="A bathroom gains character from the provenance of its materials — their origin, their making and the way they wear over time.", quote="The Bath: A History of Cleanliness and Pollution — G. Vigarello · The Roman Baths — F. Yegül · Manufacturer finish archives and studio interviews, 2025.", footer="AQUA / EDIT · SOURCES · 07", products=[
        {"name": "TRAVERTINE", "price": "TIVOLI, ITALY", "description": "Quarried near the springs east of Rome. Its open grain and warm mineral tone make every cut unique."},
        {"name": "BRASS", "price": "BIRMINGHAM, UK", "description": "Precision-cast, then hand-finished. Left unlacquered, it gathers a softer, lived-in patina."},
        {"name": "PORCELAIN", "price": "LIMOGES, FRANCE", "description": "Fired at high temperature for a dense, non-porous surface that stays luminous for decades."},
    ]),
    magazine_page("Privilege Insert", "catalog", None, layout="aqua-coupons", eyebrow="08 · PRIVILEGE INSERT", headline="A few reasons to begin the room.", body="Keep this page close. Three invitations for a more considered bathroom, valid through the end of the season.", quote="One code per order. Not redeemable for cash. Full terms and exclusions at aquaedit.co/privilege.", footer="AQUA / EDIT · PRIVILEGE · 08", products=[
        {"name": "10% OFF YOUR FIRST TAPWARE SET", "price": "AQUA10", "description": "Valid on basin, bath and shower fittings."},
        {"name": "COMPLIMENTARY DELIVERY ON BATHS", "price": "STILLWATER", "description": "For freestanding baths delivered within the city."},
        {"name": "$250 DESIGN CREDIT", "price": "OBJECTS250", "description": "Applied to projects over $3,000. Consultation included."},
    ]),
]


MAGAZINES = [
    {
        "name": "The Cheese Factory Journal",
        "issue": "Issue 01 · Autumn",
        "description": "Cheese, preserves, crackers and the small things that turn a meal into an occasion.",
        "design": "pencil-journal",
        "cover_image_url": CHEESE_FACTORY_IMAGES["cover"],
        "published": True,
        "show_on_index": True,
        "pages": MAGAZINE_PAGES,
    },
    {
        "name": "Wild Stem Journal",
        "issue": "Volume 01 · Spring",
        "description": "Seasonal stems, arranging notes, and the quiet rituals of the flower shop.",
        "design": "wild-stem",
        "cover_image_url": WILD_STEM_IMAGES["cover"],
        "published": True,
        "show_on_index": True,
        "pages": WILD_STEM_PAGES,
    },
    {
        "name": "Aqua · Bathroom Objects",
        "issue": "Issue 01 · Objects for Water",
        "description": "A considered guide to taps, basins, baths and the materials that make a private space feel extraordinary.",
        "design": "aqua-objects",
        "cover_image_url": AQUA_OBJECTS_IMAGES["cover"],
        "published": True,
        "show_on_index": True,
        "pages": AQUA_OBJECTS_PAGES,
    },
]


def ensure_items(version: dict, items: list[tuple[str, float, str, str]]) -> None:
    status, current_items = call("GET", f"/versions/{version['id']}/items")
    if status != 200 or current_items:
        return
    for name, price, description, category in items:
        status, response = call(
            "POST",
            f"/versions/{version['id']}/items",
            {
                "name": name,
                "price": price,
                "currency": "UYU",
                "description": description,
                "category": category,
            },
        )
        if status not in (200, 201):
            raise RuntimeError(f"Could not add {name}: {status} {response}")


def ensure_list(definition: tuple, existing: dict[str, dict]) -> None:
    name, design, published, show_on_index, list_content, items = definition
    price_list = existing.get(name)
    if price_list is None:
        status, price_list = call("POST", f"/tenants/{TENANT_ID}/lists", {"name": name})
        if status not in (200, 201):
            raise RuntimeError(f"Could not create {name}: {status} {price_list}")
    status, detailed = call("GET", f"/lists/{price_list['id']}")
    if status != 200 or not detailed.get("versions"):
        raise RuntimeError(f"Could not read version for {name}: {status} {detailed}")
    version = detailed["versions"][-1]
    ensure_items(version, items)
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
        {
            "design": design,
            "published": published,
            "show_on_index": show_on_index,
        },
    )
    if status != 200:
        raise RuntimeError(f"Could not update {name}: {status} {response}")
    print(f"ready: {name}")


def ensure_magazine(definition: dict, existing: dict[str, dict]) -> None:
    name = definition["name"]
    magazine = existing.get(name)
    if magazine is None:
        status, magazine = call(
            "POST",
            f"/tenants/{TENANT_ID}/magazines",
            {key: value for key, value in definition.items() if key != "pages"},
        )
        if status not in (200, 201):
            raise RuntimeError(f"Could not create magazine {name}: {status} {magazine}")
    status, detailed = call("GET", f"/magazines/{magazine['id']}")
    if status != 200:
        raise RuntimeError(f"Could not read magazine {name}: {status} {detailed}")
    pages_by_position = {page.get("position"): page for page in detailed.get("pages", [])}
    for position, page in enumerate(definition["pages"]):
        payload = {
            "position": position,
            "page_type": page["page_type"],
            "title": page["title"],
            "image_url": page["image_url"],
            "content": page["content"],
        }
        existing_page = pages_by_position.get(position)
        method = "PATCH" if existing_page else "POST"
        endpoint = f"/magazine-pages/{existing_page['id']}" if existing_page else f"/magazines/{magazine['id']}/pages"
        status, response = call(method, endpoint, payload)
        if status not in (200, 201):
            raise RuntimeError(f"Could not save magazine page {page['title']}: {status} {response}")
    status, response = call(
        "PATCH",
        f"/magazines/{magazine['id']}",
        {
            "issue": definition["issue"],
            "description": definition["description"],
            "design": definition["design"],
            "cover_image_url": definition["cover_image_url"],
            "published": definition["published"],
            "show_on_index": definition["show_on_index"],
        },
    )
    if status != 200:
        raise RuntimeError(f"Could not update magazine {name}: {status} {response}")
    print(f"ready: {name} (magazine)")


def main() -> None:
    status, rows = call("GET", f"/tenants/{TENANT_ID}/lists")
    if status != 200:
        raise RuntimeError(f"Could not read existing lists: {status} {rows}")
    existing = {row["name"]: row for row in rows}
    for definition in LISTS:
        ensure_list(definition, existing)
    legacy_journal = existing.get("The Cheese Factory Journal")
    if legacy_journal and legacy_journal.get("design") == "pencil-journal":
        status, response = call(
            "PATCH",
            f"/lists/{legacy_journal['id']}",
            {"published": False, "show_on_index": False},
        )
        if status != 200:
            raise RuntimeError(f"Could not retire legacy journal list: {status} {response}")
        print("retired: The Cheese Factory Journal (legacy price list)")
    if "--include-magazines" in sys.argv[1:]:
        status, magazine_rows = call("GET", f"/tenants/{TENANT_ID}/magazines")
        if status != 200:
            raise RuntimeError(f"Could not read existing magazines: {status} {magazine_rows}")
        existing_magazines = {row["name"]: row for row in magazine_rows}
        for definition in MAGAZINES:
            ensure_magazine(definition, existing_magazines)
    if SUBDOMAIN:
        print(f"Open price lists at http://localhost:3000/p/{SUBDOMAIN}")
        print(f"Open magazines at http://localhost:3000/m/{SUBDOMAIN}/the_cheese_factory_journal")
        print(f"Open flower magazine at http://localhost:3000/m/{SUBDOMAIN}/wild_stem_journal")
        print(f"Open bathroom objects magazine at http://localhost:3000/m/{SUBDOMAIN}/aqua_bathroom_objects")


if __name__ == "__main__":
    main()
