from lib.ctx import linktrees
from models import LinkTree, Tenant
from views import LinkTreeView


def test_linktree_is_created_per_tenant_and_can_be_updated(db):
    tenant = Tenant.create(name="Studio", subdomain="studio")

    tree = linktrees.get_linktree(str(tenant.id))
    assert tree is not None
    assert tree.tenant_id == tenant.id
    assert tree.display_name == "Studio"
    assert tree.template == "botanical"
    assert LinkTree.select().where(LinkTree.tenant == tenant.id).count() == 1

    updated = linktrees.update_linktree(
        tree.id,
        display_name="Studio Objects",
        tags=["cerámica", "hogar"],
        links=[
            {
                "id": "catalog",
                "title": "Catálogo",
                "description": "Ver productos",
                "url": "/p/studio",
                "icon": "bag",
                "style": "featured",
                "enabled": True,
            }
        ],
        template="editorial",
    )

    view = LinkTreeView.render(updated)
    assert view.display_name == "Studio Objects"
    assert view.tags == ["cerámica", "hogar"]
    assert view.links[0]["url"] == "/p/studio"
    assert view.template == "editorial"


def test_linktree_public_lookup_does_not_create_drafts(db):
    tenant = Tenant.create(name="Draft Shop", subdomain="draft-shop")

    assert linktrees.get_linktree(str(tenant.id), create=False) is None
