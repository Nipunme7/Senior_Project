from ai.normalize import attach_media_ids, normalize_ai_website_config
from schemas.website_config import WebsiteConfig
from services.validation import validate_website_config


def test_normalize_keeps_owner_business_name_and_scrubs_ai_copy():
    raw = {
        "siteName": "Apex Prestige Collective",
        "theme": {
            "style": "luxury",
            "primaryColor": "#111",
            "accentColor": "#222",
        },
        "sections": [
            {
                "id": "hero_01",
                "type": "hero",
                "variant": "centered",
                "props": {
                    "headline": "Elevate Your Journey",
                    "subheadline": "A seamless curated experience",
                    "ctaLabel": "Begin your journey",
                },
            },
            {
                "id": "about_01",
                "type": "about",
                "variant": "split",
                "props": {
                    "heading": "Our Story",
                    "body": "We elevate every guest with passion.",
                },
            },
        ],
    }
    normalized = normalize_ai_website_config(
        raw,
        fallback_site_name="Joe's Cuts",
    )
    assert normalized["siteName"] == "Joe's Cuts"
    hero = normalized["sections"][0]["props"]
    assert hero["headline"] == "Joe's Cuts"
    assert hero["subheadline"] is None
    assert hero["ctaLabel"] == "Book now"
    about = normalized["sections"][1]["props"]
    assert about["body"] == "About Joe's Cuts."


def test_normalize_fixes_bad_variant_and_missing_props():
    raw = {
        "siteName": "Elite Cuts",
        "theme": {"style": "unknown-style", "primaryColor": "#000", "accentColor": "#fff"},
        "sections": [
            {
                "id": "hero_01",
                "type": "hero",
                "variant": "cards",
                "props": {},
            },
            {
                "id": "services_01",
                "type": "services",
                "variant": "cards",
                "props": {"items": [{"description": "no name"}]},
            },
            {
                "id": "bogus",
                "type": "not-a-section",
                "variant": "x",
                "props": {},
            },
        ],
    }

    normalized = normalize_ai_website_config(raw)
    config = validate_website_config(WebsiteConfig.model_validate(normalized))

    assert config.theme.style == "modern"
    assert config.sections[0].type == "hero"
    assert config.sections[0].variant == "centered"
    assert config.sections[0].props.headline == "Elite Cuts"
    assert config.sections[1].type == "services"
    assert len(config.sections[1].props.items) >= 1
    assert all(section.type != "not-a-section" for section in config.sections)


def test_attach_media_ids_fills_hero_and_gallery():
    raw = {
        "siteName": "Shop",
        "theme": {
            "style": "modern",
            "primaryColor": "#111",
            "accentColor": "#222",
        },
        "sections": [
            {
                "id": "hero_01",
                "type": "hero",
                "variant": "centered",
                "props": {"headline": "Hi"},
            },
            {
                "id": "gallery_01",
                "type": "gallery",
                "variant": "grid",
                "props": {"heading": "Photos"},
            },
        ],
    }
    with_media = attach_media_ids(raw, ["m1", "m2", "m3"])
    assert with_media["sections"][0]["mediaIds"] == ["m1"]
    assert with_media["sections"][1]["mediaIds"] == ["m2", "m3"]


def test_normalize_services_accepts_strings_and_brief_fallback():
    raw = {
        "siteName": "Harbor & Pine",
        "theme": {
            "style": "minimal",
            "primaryColor": "#111",
            "accentColor": "#222",
        },
        "sections": [
            {
                "id": "services_01",
                "type": "services",
                "variant": "list",
                "props": {"items": ["Full-home design", {"title": "Room refresh"}]},
            }
        ],
    }
    normalized = normalize_ai_website_config(raw)
    names = [item["name"] for item in normalized["sections"][0]["props"]["items"]]
    assert names == ["Full-home design", "Room refresh"]

    empty = {
        "siteName": "Harbor & Pine",
        "theme": {
            "style": "minimal",
            "primaryColor": "#111",
            "accentColor": "#222",
        },
        "sections": [
            {
                "id": "services_01",
                "type": "services",
                "variant": "cards",
                "props": {"items": []},
            }
        ],
    }
    filled = normalize_ai_website_config(
        empty,
        fallback_services=["Furniture sourcing", "Virtual consults"],
    )
    filled_names = [item["name"] for item in filled["sections"][0]["props"]["items"]]
    assert filled_names == ["Furniture sourcing", "Virtual consults"]
    assert filled["sections"][0]["props"]["items"][0]["description"] is None


def test_normalize_unwraps_nested_config():
    raw = {
        "config": {
            "siteName": "Cafe",
            "theme": {
                "style": "minimal",
                "primaryColor": "#111",
                "accentColor": "#222",
            },
            "sections": [
                {
                    "id": "about_01",
                    "type": "about",
                    "variant": "text-only",
                    "props": {"body": "Hello"},
                }
            ],
        }
    }
    normalized = normalize_ai_website_config(raw)
    config = validate_website_config(WebsiteConfig.model_validate(normalized))
    assert config.siteName == "Cafe"
    assert config.sections[0].type == "about"
