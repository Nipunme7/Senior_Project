"""Full-site WebsiteConfig generation via Gemini + validation gate."""

from __future__ import annotations

from typing import Any

from pydantic import ValidationError as PydanticValidationError

from ai.gemini_client import GeminiError, generate_website_config_json
from ai.prompts import build_generation_prompt
from schemas.website_config import WebsiteConfig
from services.settings import Settings
from services.validation import ValidationError, validate_media_ids, validate_website_config

MAX_GENERATION_ATTEMPTS = 2


def generate_validated_website_config(
    *,
    settings: Settings,
    business_name: str,
    business_type: str | None = None,
    description: str | None = None,
    services: list[str] | None = None,
    contact: dict[str, str | None] | None = None,
    style: str | None = None,
    media: list[dict[str, Any]] | None = None,
) -> WebsiteConfig:
    """
    Ask Gemini for a WebsiteConfig, validate it, and retry once on failure.
    Never returns unvalidated AI output.
    """
    if not settings.gemini_configured:
        raise GeminiError("GEMINI_API_KEY is not configured")

    allowed_media_ids = {
        str(item["id"])
        for item in (media or [])
        if isinstance(item, dict) and item.get("id")
    }

    repair_notes: str | None = None
    last_error: str | None = None

    for _ in range(MAX_GENERATION_ATTEMPTS):
        prompt = build_generation_prompt(
            business_name=business_name,
            business_type=business_type,
            description=description,
            services=services,
            contact=contact,
            style=style,
            media=media,
            repair_notes=repair_notes,
        )
        try:
            raw = generate_website_config_json(settings=settings, prompt=prompt)
            config = WebsiteConfig.model_validate(raw)
            config = validate_website_config(config)
            config = validate_media_ids(config, allowed_media_ids or None)
            return config
        except (GeminiError, ValidationError, PydanticValidationError, ValueError) as exc:
            last_error = str(exc)
            repair_notes = last_error

    raise ValidationError(
        f"AI generation failed validation after {MAX_GENERATION_ATTEMPTS} attempts: {last_error}"
    )
