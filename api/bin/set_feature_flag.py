"""Set a tenant-specific feature flag assignment.

Examples (inside the API container):
  python bin/set_feature_flag.py magazines --tenant-id TENANT_ID --enabled
  python bin/set_feature_flag.py magazines --subdomain my-business --disabled
"""

import argparse
import sys
from pathlib import Path

# Allow `python bin/...` from the api directory to import the application.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from lib.ctx import feature_flags
from models import db


def main() -> int:
    parser = argparse.ArgumentParser(description="Set a tenant feature flag")
    parser.add_argument("key", help="Feature flag key, for example magazines")
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--tenant-id")
    target.add_argument("--subdomain")
    state = parser.add_mutually_exclusive_group(required=True)
    state.add_argument("--enabled", action="store_true")
    state.add_argument("--disabled", action="store_true")
    args = parser.parse_args()

    from models import Tenant

    db.connect(reuse_if_open=True)
    try:
        tenant = (
            Tenant.get_or_none(Tenant.id == args.tenant_id)
            if args.tenant_id
            else Tenant.get_or_none(Tenant.subdomain == args.subdomain)
        )
        if not tenant:
            parser.error("Tenant not found")
        assignment = feature_flags.set_tenant_flag(
            args.key, tenant.id, bool(args.enabled)
        )
        if not assignment:
            parser.error("Feature flag not found")
        print(
            f"{assignment['key']} for {tenant.name} ({tenant.subdomain}): "
            f"{'enabled' if assignment['enabled'] else 'disabled'}"
        )
    finally:
        if not db.is_closed():
            db.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
