"""Full-site WebsiteConfig generation via Gemini + validation gate."""

from __future__ import annotations

from typing import Any

from pydantic import ValidationError as PydanticValidationError

from ai.gemini_client import GeminiError, generate_website_config_json
from ai.normalize import attach_media_ids, normalize_ai_website_config
from ai.prompts import build_generation_prompt
from schemas.website_config import WebsiteConfig
from services.settings import Settings
from services.validation import ValidationError, validate_media_ids, validate_website_config

MAX_VALIDATION_RETRIES = 2


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
    sections: list[str] | None = None,
    inspiration_hint: str | None = None,
) -> WebsiteConfig:
    """
    Ask Gemini for a WebsiteConfig, validate it, and retry once on schema failure.
    Timeouts are not retried (avoids waiting several minutes twice).
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

    for _ in range(MAX_VALIDATION_RETRIES):
        prompt = build_generation_prompt(
            business_name=business_name,
            business_type=business_type,
            description=description,
            services=services,
            contact=contact,
            style=style,
            media=media,
            sections=sections,
            inspiration_hint=inspiration_hint,
            repair_notes=repair_notes,
        )
        try:
            raw = generate_website_config_json(settings=settings, prompt=prompt)
            normalized = normalize_ai_website_config(
                raw,
                fallback_site_name=business_name,
                fallback_services=services,
                fallback_contact=contact,
            )
            # Gemini often forgets mediaIds; wire uploaded media into hero/gallery/about.
            media_id_list = [
                str(item["id"])
                for item in (media or [])
                if isinstance(item, dict) and item.get("id")
            ]
            normalized = attach_media_ids(normalized, media_id_list)
            config = WebsiteConfig.model_validate(normalized)
            config = validate_website_config(config)
            config = validate_media_ids(config, allowed_media_ids or None)
            return config
        except GeminiError as exc:
            # Don't burn minutes retrying timeouts.
            if getattr(exc, "timed_out", False):
                raise
            last_error = str(exc)
            # Truncated JSON: retry once with an even shorter repair hint.
            if getattr(exc, "truncated", False):
                repair_notes = (
                    "Previous JSON was truncated. Return fewer sections and much shorter strings."
                )
            else:
                repair_notes = last_error
        except (ValidationError, PydanticValidationError, ValueError) as exc:
            last_error = str(exc)
            repair_notes = last_error

    raise ValidationError(
        f"AI generation failed validation after {MAX_VALIDATION_RETRIES} attempts: {last_error}"
    )
