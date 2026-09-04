from datetime import datetime

from pydantic import field_validator

from views.base_view import BaseView
from views.list_version_view import ListVersionView


def _live_ids(tenant_id: str) -> set[str]:
    """Ids of this tenant's lists the plan currently allows on the public page."""
    from lib.ctx import public
    from models import Tenant

    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    return set(public.live_list_ids(tenant)) if tenant else set()


def _item_count(price_list) -> int:
    """Number of currently visible items in the list's most recent version.

    Catalog-linked items follow the current product availability. Manual items and
    snapshots whose source product was deleted remain part of the count.
    """
    from models import Item, ListVersion, Product

    version = (
        ListVersion.select()
        .where(ListVersion.list == price_list.id)
        .order_by(ListVersion.version_number.desc())
        .first()
    )
    if not version:
        return 0

    availability: dict[str, bool] = {}
    for product in Product.select(Product.id, Product.name, Product.available).where(
        Product.tenant == price_list.tenant_id
    ):
        availability[str(product.id)] = product.available
        availability[_norm_name(product.name)] = product.available

    visible = 0
    for item in Item.select().where(Item.list_version == version.id):
        product_key = str(item.product_id)
        if product_key in availability:
            if availability[product_key]:
                visible += 1
            continue
        if availability.get(_norm_name(item.name), True):
            visible += 1
    return visible


def _norm_name(name: str | None) -> str:
    return (name or "").strip().lower()


class PriceListView(BaseView):
    id: str
    tenant_id: str
    name: str
    slug: str | None = None
    published: bool
    show_on_index: bool
    kind: str = "product"
    parent_list_id: str | None = None
    variant_type: str | None = None
    customer_id: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    # Per-list appearance; null means "inherit the tenant default".
    design: str | None = None
    hero_color: str | None = None
    bg_url: str | None = None
    bg_overlay: bool | None = None
    capture_viewer_info: bool = False
    is_private: bool = False
    item_count: int = 0
    # Published says what the owner wants; live says what the plan actually
    # serves. They differ when a downgrade or an expired subscription leaves more
    # lists published than the plan allows — nothing is unpublished, so the CRM
    # has to be the one to admit the list is not reachable.
    live: bool = True
    created_at: datetime
    updated_at: datetime
    versions: list[ListVersionView] | None = None

    @field_validator("versions", mode="before")
    @classmethod
    def render_version_content(cls, versions):
        """Deserialize version content before Pydantic reads relationship rows.

        Peewee exposes the `versions` backref while validating a list, even
        when callers did not request versions explicitly. Each row stores its
        content document as JSON text, so routing it through `ListVersionView`
        keeps list responses consistent with direct version responses.
        """
        if versions is None:
            return None
        return [
            ListVersionView.render(version) if hasattr(version, "content") else version
            for version in versions
        ]

    @classmethod
    def render(cls, price_list, include_versions=False, live_ids=None):
        view = cls.model_validate(price_list)
        view.item_count = _item_count(price_list)
        if live_ids is None:
            live_ids = _live_ids(price_list.tenant_id)
        view.live = price_list.id in live_ids
        if include_versions:
            view.versions = ListVersionView.render_many(price_list.versions)
        return view

    @classmethod
    def render_many(cls, lists, include_versions=False):
        lists = list(lists)
        # One lookup for the whole page instead of one per list.
        live_ids = _live_ids(lists[0].tenant_id) if lists else set()
        return [
            cls.render(price_list, include_versions, live_ids) for price_list in lists
        ]
