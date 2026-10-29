"""WebsiteConfig validation beyond raw schema parsing."""

from __future__ import annotations

from component_catalog.catalog import VARIANTS_BY_TYPE
from schemas.website_config import WebsiteConfig


class ValidationError(ValueError):
    """Raised when a WebsiteConfig fails business-rule validation."""


def validate_website_config(config: WebsiteConfig) -> WebsiteConfig:
    """
    Validate structure already enforced by Pydantic, plus catalog rules:
    unique section IDs and allowed variants per type.
    """
    seen_ids: set[str] = set()

    for section in config.sections:
        if section.id in seen_ids:
            raise ValidationError(f"Duplicate section id: {section.id}")
        seen_ids.add(section.id)

        allowed = VARIANTS_BY_TYPE.get(section.type, ())
        if section.variant not in allowed:
            raise ValidationError(
                f"Variant '{section.variant}' is not allowed for type '{section.type}'"
            )

    return config


def summarize_config(config: WebsiteConfig) -> dict:
    return {
        "sectionCount": len(config.sections),
        "sectionTypes": [section.type for section in config.sections],
    }
