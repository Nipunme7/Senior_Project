from ai.prompts import build_generation_prompt, resolve_requested_sections


def test_resolve_sections_defaults_and_forces_bookends():
    assert resolve_requested_sections(None) == [
        "hero",
        "about",
        "services",
        "contact",
        "footer",
    ]
    assert resolve_requested_sections(["pricing", "gallery"]) == [
        "hero",
        "pricing",
        "gallery",
        "footer",
    ]
    assert resolve_requested_sections(["footer", "hero", "cta", "bogus"]) == [
        "hero",
        "cta",
        "footer",
    ]


def test_prompt_includes_selected_sections_and_inspiration():
    prompt = build_generation_prompt(
        business_name="Elite Cuts",
        business_type="barbershop",
        description="Local barber",
        services=["Haircut"],
        contact={"phone": "555"},
        style="luxury",
        media=[{"id": "m1", "description": "shop"}],
        sections=["hero", "pricing", "gallery", "footer"],
        inspiration_hint="Dark refined service look",
    )
    assert "Exactly 4 sections, in this order: hero, pricing, gallery, footer." in prompt
    assert "Visual inspiration: Dark refined service look" in prompt
    assert "Style: luxury" in prompt
    assert "m1" in prompt
    assert 'siteName MUST be exactly "Elite Cuts"' in prompt
    assert "elevate" in prompt  # banned-word guidance present
