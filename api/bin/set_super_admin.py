"""Grant or revoke platform developer-portal access for one local user.

Usage inside the API container:
    python bin/set_super_admin.py you@example.com
    python bin/set_super_admin.py you@example.com --revoke
"""

import argparse
import sys
from pathlib import Path

# When invoked as `python bin/set_super_admin.py`, Python puts `bin/` rather
# than the API root on sys.path. Add the application root explicitly so the
# script works both inside Docker and from a local checkout.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from models import User


def main() -> int:
    parser = argparse.ArgumentParser(description="Manage a user's platform super-admin flag")
    parser.add_argument("email", help="Existing user email")
    parser.add_argument("--revoke", action="store_true", help="Remove super-admin access")
    args = parser.parse_args()

    email = args.email.strip().lower()
    user = User.get_or_none(User.email == email)
    if not user:
        print(f"No user found for {email}", file=sys.stderr)
        return 1

    value = not args.revoke
    User.update(is_super_admin=value).where(User.id == user.id).execute()
    action = "revoked from" if args.revoke else "granted to"
    print(f"Super-admin access {action} {email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
