"""Allowed component types and variants for AI and API validation."""

from __future__ import annotations

DESIGN_STYLES = (
    "luxury",
    "minimal",
    "modern",
    "professional",
    "playful",
    "ai-choose",
)

SECTION_TYPES = (
    "hero",
    "about",
    "services",
    "pricing",
    "gallery",
    "testimonials",
    "cta",
    "contact",
    "footer",
)

VARIANTS_BY_TYPE: dict[str, tuple[str, ...]] = {
    "hero": (
        "centered",
        "split-left",
        "split-right",
        "fullscreen-image",
        "video-background",
    ),
    "about": ("text-only", "image-left", "image-right"),
    "services": ("cards", "list", "icon-grid"),
    "pricing": ("cards", "simple-list"),
    "gallery": ("grid", "masonry", "featured"),
    "testimonials": ("cards", "featured-quote"),
    "cta": ("simple", "banner", "image-background"),
    "contact": ("simple", "split", "map-right"),
    "footer": ("basic",),
}


def get_component_catalog() -> dict:
    """Public catalog payload for clients and future AI prompts."""
    return {
        "designStyles": list(DESIGN_STYLES),
        "sectionTypes": list(SECTION_TYPES),
        "variantsByType": {
            section_type: list(variants)
            for section_type, variants in VARIANTS_BY_TYPE.items()
        },
    }
