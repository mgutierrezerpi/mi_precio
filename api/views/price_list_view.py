from datetime import date, datetime

from pydantic import field_validator

from lib.ctx.list_schedule import CURRENT, calendar_day, schedule_state, shop_today
from views.base_view import BaseView
from views.list_version_view import ListVersionView


def _serving(tenant_id: str) -> tuple[set[str], date]:
    """Ids of this tenant's lists on the public page, and the shop's today."""
    from lib.ctx import public
    from models import Tenant

    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    return set(public.live_list_ids(tenant)) if tenant else set(), shop_today(tenant)


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
    # Calendar days, sent as `YYYY-MM-DD`: an instant would shift them by timezone.
    starts_at: date | None = None
    ends_at: date | None = None
    # Per-list appearance; null means "inherit the tenant default".
    design: str | None = None
    hero_color: str | None = None
    bg_url: str | None = None
    bg_overlay: bool | None = None
    capture_viewer_info: bool = False
    is_private: bool = False
    item_count: int = 0
    # Published says what the owner wants; live says what is actually served.
    # They differ when a downgrade or an expired subscription leaves more lists
    # published than the plan allows, or when today is outside the list's dates —
    # nothing is unpublished, so the CRM has to admit the list is not reachable.
    live: bool = True
    # Tells a list waiting for its dates from one the plan is holding back.
    schedule_state: str = CURRENT
    created_at: datetime
    updated_at: datetime
    versions: list[ListVersionView] | None = None

    @field_validator("starts_at", "ends_at", mode="before")
    @classmethod
    def render_calendar_day(cls, value):
        return calendar_day(value)

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
    def render(cls, price_list, include_versions=False, live_ids=None, today=None):
        view = cls.model_validate(price_list)
        view.item_count = _item_count(price_list)
        if live_ids is None or today is None:
            live_ids, today = _serving(price_list.tenant_id)
        view.live = price_list.id in live_ids
        view.schedule_state = schedule_state(price_list, today)
        if include_versions:
            view.versions = ListVersionView.render_many(price_list.versions)
        return view

    @classmethod
    def render_many(cls, lists, include_versions=False):
        lists = list(lists)
        # One lookup for the whole page instead of one per list.
        if not lists:
            return []
        live_ids, today = _serving(lists[0].tenant_id)
        return [
            cls.render(price_list, include_versions, live_ids, today)
            for price_list in lists
        ]
