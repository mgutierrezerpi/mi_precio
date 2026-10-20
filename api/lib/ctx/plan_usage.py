"""Tenant resource usage queries for plan enforcement."""

from models import Invitation, PriceList, Product, TenantMembership


def usage(tenant_id: str) -> dict[str, int]:
    # Memberships, not users whose primary business this is: someone invited
    # with an existing account, or the owner of a second business, belongs to
    # the team without that pointer and used to be left out of the count.
    members = (
        TenantMembership.select().where(TenantMembership.tenant == tenant_id).count()
        + Invitation.select()
        .where(Invitation.tenant == tenant_id, Invitation.status == "pending")
        .count()
    )
    return {
        "products": Product.select().where(Product.tenant == tenant_id).count(),
        "lists": (
            PriceList.select()
            .where(
                (PriceList.tenant == tenant_id)
                & (
                    PriceList.design.is_null(True)
                    | (PriceList.design != "pencil-journal")
                )
            )
            .count()
        ),
        "members": members,
    }
