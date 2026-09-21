"""Tenant resource usage queries for plan enforcement."""

from models import Invitation, PriceList, Product, User


def usage(tenant_id: str) -> dict[str, int]:
    members = (
        User.select().where(User.tenant == tenant_id).count()
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
