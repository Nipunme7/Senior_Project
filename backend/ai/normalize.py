"""Best-effort cleanup of Gemini WebsiteConfig JSON before Pydantic validation."""

from __future__ import annotations

import re
from copy import deepcopy
from typing import Any

from component_catalog.catalog import DESIGN_STYLES, VARIANTS_BY_TYPE

# Marketing / LLM filler that makes small-business sites sound fake.
_AI_CLICHE_RE = re.compile(
    r"\b("
    r"elevate|elevated|unlock|seamless|embark|journey|passion|delve|tapestry|"
    r"nestled|curated|transformative|reimagine|beckons|oasis|one[\s-]?stop|"
    r"excellence meets|game[\s-]?changer|leverage|synergy|indulge|bespoke|"
    r"welcome to the future|discover more|begin your|unparalleled|exquisite|"
    r"cutting[\s-]?edge|next[\s-]?level|holistic|empower"
    r")\b",
    re.IGNORECASE,
)


def normalize_ai_website_config(
    raw: dict[str, Any],
    *,
    fallback_site_name: str | None = None,
    fallback_services: list[str] | None = None,
    fallback_contact: dict[str, str | None] | None = None,
) -> dict[str, Any]:
    data = deepcopy(raw)

    # Unwrap accidental nesting.
    if "config" in data and isinstance(data["config"], dict):
        data = data["config"]
    if "websiteConfig" in data and isinstance(data["websiteConfig"], dict):
        data = data["websiteConfig"]

    # When the owner business name is provided, always keep it (ignore AI rebrands).
    owner_name = (fallback_site_name or "").strip()
    ai_name = str(data.get("siteName") or "").strip()
    site_name = owner_name or ai_name or "My Business"
    theme_in = data.get("theme") if isinstance(data.get("theme"), dict) else {}
    style = str(theme_in.get("style") or "modern").strip()
    if style not in DESIGN_STYLES:
        style = "modern"

    theme = {
        "style": style,
        "primaryColor": str(theme_in.get("primaryColor") or "#111111"),
        "accentColor": str(theme_in.get("accentColor") or "#C9A45C"),
    }

    sections_in = data.get("sections")
    if not isinstance(sections_in, list):
        sections_in = []

    sections: list[dict[str, Any]] = []
    seen_ids: set[str] = set()

    for index, section in enumerate(sections_in):
        if not isinstance(section, dict):
            continue
        section_type = str(section.get("type") or "").strip()
        if section_type not in VARIANTS_BY_TYPE:
            continue

        allowed = VARIANTS_BY_TYPE[section_type]
        variant = str(section.get("variant") or "").strip()
        if variant not in allowed:
            variant = allowed[0]

        section_id = str(section.get("id") or f"{section_type}_{index + 1:02d}").strip()
        if not section_id or section_id in seen_ids:
            section_id = f"{section_type}_{index + 1:02d}"
        # Still colliding — force unique.
        base_id = section_id
        suffix = 2
        while section_id in seen_ids:
            section_id = f"{base_id}_{suffix}"
            suffix += 1
        seen_ids.add(section_id)

        props_in = section.get("props") if isinstance(section.get("props"), dict) else {}
        props = _normalize_props(
            section_type,
            props_in,
            site_name,
            fallback_services=fallback_services,
            fallback_contact=fallback_contact,
        )

        normalized: dict[str, Any] = {
            "id": section_id,
            "type": section_type,
            "variant": variant,
            "props": props,
        }
        media_ids = section.get("mediaIds")
        if isinstance(media_ids, list):
            cleaned = [str(mid) for mid in media_ids if mid]
            if cleaned:
                normalized["mediaIds"] = cleaned

        sections.append(normalized)

    if not sections:
        sections = [
            {
                "id": "hero_01",
                "type": "hero",
                "variant": "centered",
                "props": {
                    "headline": site_name,
                    "subheadline": "Come see us.",
                },
            }
        ]

    return {
        "siteName": site_name,
        "theme": theme,
        "sections": sections,
    }


def _normalize_props(
    section_type: str,
    props: dict[str, Any],
    site_name: str,
    *,
    fallback_services: list[str] | None = None,
    fallback_contact: dict[str, str | None] | None = None,
) -> dict[str, Any]:
    if section_type == "hero":
        headline = _human_text(props.get("headline"), fallback=site_name) or site_name
        # Invented brand slogans as headlines → use the real business name.
        if _looks_ai_copy(headline) or _looks_invented_brand(headline, site_name):
            headline = site_name
        cta = _human_text(props.get("ctaLabel"), fallback="Book now")
        if cta and _looks_ai_copy(cta):
            cta = "Book now"
        return {
            "headline": headline,
            "subheadline": _human_text(props.get("subheadline")),
            "ctaLabel": cta,
            "ctaHref": _optional_str(props.get("ctaHref")),
        }

    if section_type == "about":
        body = _human_text(props.get("body"), fallback=f"About {site_name}.")
        if not body or _looks_ai_copy(body):
            body = f"About {site_name}."
        return {
            "heading": _human_text(props.get("heading"), fallback="About"),
            "body": body,
        }

    if section_type == "services":
        normalized_items = _normalize_service_items(props.get("items"))
        if not normalized_items:
            normalized_items = _services_from_brief(fallback_services)
        if not normalized_items:
            normalized_items = [
                {"name": "Consultation", "description": f"Talk with {site_name}."}
            ]
        for item in normalized_items:
            desc = item.get("description")
            if isinstance(desc, str) and _looks_ai_copy(desc):
                item["description"] = None
        return {
            "heading": _human_text(props.get("heading"), fallback="Services") or "Services",
            "items": normalized_items,
        }

    if section_type == "pricing":
        items = _list_of_dicts(props.get("items"))
        normalized_items = []
        for item in items:
            name = str(item.get("name") or "").strip()
            price = str(item.get("price") or "").strip()
            if not name or not price:
                continue
            features = item.get("features")
            feature_list = (
                [str(f) for f in features if str(f).strip()]
                if isinstance(features, list)
                else None
            )
            normalized_items.append(
                {
                    "name": name,
                    "price": price,
                    "description": _optional_str(item.get("description")),
                    "features": feature_list or None,
                }
            )
        if not normalized_items:
            normalized_items = [{"name": "Standard", "price": "Contact us"}]
        return {
            "heading": _human_text(props.get("heading"), fallback="Pricing"),
            "items": normalized_items,
        }

    if section_type == "gallery":
        return {"heading": _human_text(props.get("heading"), fallback="Photos")}

    if section_type == "testimonials":
        items = _list_of_dicts(props.get("items"))
        normalized_items = []
        for item in items:
            quote = _human_text(item.get("quote"))
            name = str(item.get("name") or "").strip()
            if not quote or not name or _looks_ai_copy(quote):
                continue
            # Drop agency-style roles like "Satisfied Client".
            role = _optional_str(item.get("role"))
            if role and _looks_ai_copy(role):
                role = None
            normalized_items.append(
                {
                    "quote": quote,
                    "name": name.split()[0],
                    "role": role,
                }
            )
        if not normalized_items:
            normalized_items = [
                {
                    "quote": f"Always leave {site_name} looking good.",
                    "name": "Sam",
                }
            ]
        return {
            "heading": _human_text(props.get("heading"), fallback="Reviews"),
            "items": normalized_items,
        }

    if section_type == "cta":
        heading = _human_text(props.get("heading"), fallback=f"Visit {site_name}")
        if not heading or _looks_ai_copy(heading):
            heading = f"Visit {site_name}"
        cta = _human_text(props.get("ctaLabel"), fallback="Call us")
        if cta and _looks_ai_copy(cta):
            cta = "Call us"
        return {
            "heading": heading,
            "body": _human_text(props.get("body")),
            "ctaLabel": cta,
            "ctaHref": _optional_str(props.get("ctaHref")),
        }

    if section_type == "contact":
        brief = fallback_contact or {}
        return {
            "heading": _human_text(props.get("heading"), fallback="Contact") or "Contact",
            "address": _optional_str(props.get("address")) or _optional_str(brief.get("address")),
            "phone": _optional_str(props.get("phone")) or _optional_str(brief.get("phone")),
            "email": _optional_str(props.get("email")) or _optional_str(brief.get("email")),
            "hours": _optional_str(props.get("hours")) or _optional_str(brief.get("hours")),
            "mapEmbedUrl": _optional_str(props.get("mapEmbedUrl")),
        }

    if section_type == "footer":
        tagline = _human_text(props.get("tagline"))
        if tagline and _looks_ai_copy(tagline):
            tagline = None
        return {
            "tagline": tagline,
            "copyright": _optional_str(props.get("copyright")) or f"© {site_name}",
        }

    return props


def attach_media_ids(
    config: dict[str, Any],
    available_media_ids: list[str],
) -> dict[str, Any]:
    """
    Ensure image-heavy sections reference uploaded media when Gemini omits mediaIds.
    Only uses IDs from the allow-list (never invents).
    """
    if not available_media_ids:
        return config

    data = deepcopy(config)
    sections = data.get("sections")
    if not isinstance(sections, list):
        return data

    pool = list(available_media_ids)
    # Prefer hero first, then gallery (can take several), then about/cta.
    priority = ("hero", "gallery", "about", "cta")

    for wanted in priority:
        for section in sections:
            if not isinstance(section, dict) or section.get("type") != wanted:
                continue
            existing = section.get("mediaIds")
            if isinstance(existing, list) and any(str(x) for x in existing):
                continue
            if not pool:
                break
            if wanted == "gallery":
                section["mediaIds"] = pool[:]
                pool = []
            else:
                section["mediaIds"] = [pool.pop(0)]

    return data


def _optional_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _human_text(value: Any, *, fallback: str | None = None) -> str | None:
    text = _optional_str(value)
    if text and _looks_ai_copy(text):
        text = None
    return text if text is not None else fallback


def _looks_ai_copy(text: str) -> bool:
    return bool(_AI_CLICHE_RE.search(text))


def _looks_invented_brand(headline: str, site_name: str) -> bool:
    """True when headline looks like a made-up brand instead of the owner name/offer."""
    h = re.sub(r"\s+", " ", headline.strip().lower())
    s = re.sub(r"\s+", " ", site_name.strip().lower())
    if not h or h == s or s in h:
        return False
    # Title-case multi-word slogans that never mention the business.
    words = h.split()
    if len(words) >= 3 and h.istitle() and "&" in h:
        return True
    return False


def _list_of_dicts(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def _normalize_service_items(value: Any) -> list[dict[str, Any]]:
    """Accept Gemini objects or plain strings for services.items."""
    if not isinstance(value, list):
        return []

    normalized_items: list[dict[str, Any]] = []
    for item in value:
        if isinstance(item, str):
            name = item.strip()
            if name:
                normalized_items.append({"name": name, "description": None, "price": None})
            continue
        if not isinstance(item, dict):
            continue
        name = str(
            item.get("name")
            or item.get("title")
            or item.get("service")
            or item.get("label")
            or ""
        ).strip()
        if not name:
            continue
        description = _optional_str(item.get("description") or item.get("details"))
        if description and _looks_ai_copy(description):
            description = None
        normalized_items.append(
            {
                "name": name,
                "description": description,
                "price": _optional_str(item.get("price")),
            }
        )
    return normalized_items


def _services_from_brief(services: list[str] | None) -> list[dict[str, Any]]:
    if not services:
        return []
    items: list[dict[str, Any]] = []
    for raw in services:
        name = str(raw).strip()
        if not name:
            continue
        items.append(
            {
                "name": name,
                "description": None,
                "price": None,
            }
        )
    return items
