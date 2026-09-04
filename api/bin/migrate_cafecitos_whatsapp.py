"""Move Cafecitos' collaboration-list contact channel from Instagram to WhatsApp.

Safe to run repeatedly in local and Fly environments.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from models import ListVersion, PriceList, Tenant, db

WHATSAPP_NUMBER = "59898402451"  # Cafecitos' listed contact: 098 402 451 (UY)


def main() -> None:
    db.connect(reuse_if_open=True)
    tenant = Tenant.get_or_none(Tenant.subdomain == "cafecitos")
    if not tenant:
        print("Cafecitos tenant not found; nothing to migrate.")
        return

    changed = 0
    tenant.social_whatsapp = WHATSAPP_NUMBER
    tenant.whatsapp_url = f"https://wa.me/{WHATSAPP_NUMBER}"
    tenant.save()

    for price_list in PriceList.select().where(
        (PriceList.tenant == tenant.id) & (PriceList.design == "pencil-cafecitos")
    ):
        for version in ListVersion.select().where(ListVersion.list == price_list.id):
            content = json.loads(version.content or "{}")
            template = content.setdefault("template", {})
            if template.get("checkout_channel") == "whatsapp":
                continue
            template["checkout_channel"] = "whatsapp"
            version.content = json.dumps(content, ensure_ascii=False)
            version.content_revision += 1
            version.save()
            changed += 1

    print(f"Migrated {changed} Cafecitos list version(s) to WhatsApp.")


if __name__ == "__main__":
    main()
