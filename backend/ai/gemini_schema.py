"""Gemini-compatible WebsiteConfig schema (no $ref / $defs / discriminator)."""

from __future__ import annotations

from typing import Any


def gemini_website_config_schema() -> dict[str, Any]:
    """
    Subset of JSON Schema accepted by Gemini responseSchema.
    Props stay loosely typed; FastAPI/Pydantic enforce real contracts after.
    """
    return {
        "type": "object",
        "properties": {
            "siteName": {"type": "string"},
            "theme": {
                "type": "object",
                "properties": {
                    "style": {"type": "string"},
                    "primaryColor": {"type": "string"},
                    "accentColor": {"type": "string"},
                },
                "required": ["style", "primaryColor", "accentColor"],
            },
            "sections": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "type": {"type": "string"},
                        "variant": {"type": "string"},
                        "mediaIds": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "props": {
                            "type": "object",
                            "properties": {
                                "headline": {"type": "string"},
                                "subheadline": {"type": "string"},
                                "heading": {"type": "string"},
                                "body": {"type": "string"},
                                "ctaLabel": {"type": "string"},
                                "ctaHref": {"type": "string"},
                                "address": {"type": "string"},
                                "phone": {"type": "string"},
                                "email": {"type": "string"},
                                "hours": {"type": "string"},
                                "tagline": {"type": "string"},
                                "copyright": {"type": "string"},
                                "items": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "name": {"type": "string"},
                                            "description": {"type": "string"},
                                            "price": {"type": "string"},
                                            "quote": {"type": "string"},
                                            "role": {"type": "string"},
                                            "features": {
                                                "type": "array",
                                                "items": {"type": "string"},
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    "required": ["id", "type", "variant", "props"],
                },
            },
        },
        "required": ["siteName", "theme", "sections"],
    }
