"""Products report which lists carry them (M13)."""

from lib.ctx import identity, items, lists, products
from views import ProductView


def test_product_view_lists_only_the_lists_that_carry_it(db):
    tenant = identity.create_tenant("Café", "cafe-m13")
    menu = lists.create_list(tenant.id, "Menú")
    lists.create_list(tenant.id, "Bebidas")
    yogur = products.create_product(tenant.id, name="Yogur", price=190)
    espresso = products.create_product(tenant.id, name="Espresso", price=90)
    items.create_item(menu.version.id, name="Yogur", price=190, product_id=yogur.id)

    views = {v.name: v for v in ProductView.render_many([yogur, espresso])}
    assert views["Yogur"].price_list_ids == [str(menu.price_list.id)]
    assert views["Espresso"].price_list_ids == []
    assert ProductView.render(yogur).price_list_ids == [str(menu.price_list.id)]
