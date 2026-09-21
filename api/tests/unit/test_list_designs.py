from lib.list_designs import DESIGN_SPECS, public_design_specs
from views import ListDesignView


def test_every_design_has_the_same_versioned_definition_shape():
    assert DESIGN_SPECS
    for spec in DESIGN_SPECS.values():
        assert set(spec) == {"schema_version", "blocks", "fields"}
        assert spec["schema_version"] == 1
        assert spec["blocks"]
        assert spec["fields"]
        assert len(spec["fields"]) == len(set(spec["fields"]))


def test_public_design_definitions_are_serializable_by_the_response_view():
    rendered = ListDesignView.render_many(public_design_specs())

    assert {definition.id for definition in rendered} == (
        set(DESIGN_SPECS) - {"pencil-cafecitos"}
    )
    assert all(definition.schema_version == 1 for definition in rendered)


def test_cafecitos_remains_supported_but_is_not_publicly_listed():
    assert "pencil-cafecitos" in DESIGN_SPECS
    assert "pencil-cafecitos" not in {
        definition["id"] for definition in public_design_specs()
    }


def test_special_templates_only_advertise_fields_they_render():
    services = DESIGN_SPECS["pencil-casa-services"]["fields"]
    editorial = DESIGN_SPECS["pencil-bakery"]["fields"]
    stories = DESIGN_SPECS["pencil-cafecitos"]["fields"]

    assert "template.image" not in services
    assert "hero.title" not in services
    assert "template.masthead" in services
    assert "template.brand_label" in services
    assert "template.edition_label" in services
    assert "template.uncategorized_label" in services
    assert "template.footer_left" in services
    assert "template.promo_title" in editorial
    assert "template.divider_icon" in editorial
    assert "template.accent_color" in editorial
    assert "template.promo_title" not in stories
    assert "template.story_videos" in stories
    assert "template.film_images" in stories
