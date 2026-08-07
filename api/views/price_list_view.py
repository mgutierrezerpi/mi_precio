from datetime import datetime
from views.base_view import BaseView
from views.list_version_view import ListVersionView


def _live_ids(tenant_id: str) -> set[str]:
    """Ids of this tenant's lists the plan currently allows on the public page."""
    from lib.ctx import public
    from models import Tenant

    tenant = Tenant.get_or_none(Tenant.id == tenant_id)
    return set(public.live_list_ids(tenant)) if tenant else set()


def _item_count(price_list) -> int:
    """Number of items in the list's most recent version."""
    from models import ListVersion, Item

    version = (
        ListVersion.select()
        .where(ListVersion.list == price_list.id)
        .order_by(ListVersion.version_number.desc())
        .first()
    )
    if not version:
        return 0
    return Item.select().where(Item.list_version == version.id).count()


class PriceListView(BaseView):
    id: str
    tenant_id: str
    name: str
    slug: str | None = None
    published: bool
    show_on_index: bool
    kind: str = "product"
    # Per-list appearance; null means "inherit the tenant default".
    design: str | None = None
    hero_color: str | None = None
    bg_url: str | None = None
    bg_overlay: bool | None = None
    item_count: int = 0
    # Published says what the owner wants; live says what the plan actually
    # serves. They differ when a downgrade or an expired subscription leaves more
    # lists published than the plan allows — nothing is unpublished, so the CRM
    # has to be the one to admit the list is not reachable.
    live: bool = True
    created_at: datetime
    updated_at: datetime
    versions: list[ListVersionView] | None = None

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
        return [cls.render(price_list, include_versions, live_ids) for price_list in lists]
