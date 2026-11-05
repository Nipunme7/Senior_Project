"""Prompt construction for full-site WebsiteConfig generation."""

from __future__ import annotations

import json
from typing import Any

from component_catalog.catalog import SECTION_TYPES, get_component_catalog

DEFAULT_SECTION_ORDER = ("hero", "about", "services", "contact", "footer")


def resolve_requested_sections(sections: list[str] | None) -> list[str]:
    """Keep catalog types only, preserve request order, always include hero + footer."""
    allowed = set(SECTION_TYPES)
    ordered: list[str] = []
    seen: set[str] = set()

    for raw in sections or []:
        value = str(raw).strip().lower()
        if value not in allowed or value in seen:
            continue
        ordered.append(value)
        seen.add(value)

    if not ordered:
        ordered = list(DEFAULT_SECTION_ORDER)
        seen = set(ordered)

    if "hero" not in seen:
        ordered.insert(0, "hero")
        seen.add("hero")
    if "footer" not in seen:
        ordered.append("footer")

    # Hero first, footer last when both present.
    without_ends = [s for s in ordered if s not in ("hero", "footer")]
    return ["hero", *without_ends, "footer"]


def build_generation_prompt(
    *,
    business_name: str,
    business_type: str | None,
    description: str | None,
    services: list[str] | None,
    contact: dict[str, str | None] | None,
    style: str | None,
    media: list[dict[str, Any]] | None,
    sections: list[str] | None = None,
    inspiration_hint: str | None = None,
    repair_notes: str | None = None,
) -> str:
    catalog = get_component_catalog()
    media_payload = media or []
    section_order = resolve_requested_sections(sections)
    section_count = len(section_order)

    lines = [
        "Generate a one-page small-business WebsiteConfig as JSON only.",
        "No React/HTML/CSS. Use only catalog section types and variants.",
        (
            f"Exactly {section_count} sections, in this order: "
            + ", ".join(section_order)
            + ". Do not add other section types."
        ),
        "Keep all copy short (1 sentence max per field). Do not write long paragraphs.",
        (
            "Root keys: siteName, theme{style,primaryColor,accentColor}, "
            "sections[{id,type,variant,props,mediaIds?}]."
        ),
        "",
        "Naming and voice (follow strictly):",
        (
            f'siteName MUST be exactly "{business_name}" — '
            "never invent a new brand, slogan-name, or AI rebrand."
        ),
        (
            "Write like a real local owner typed this in a hurry: plain, specific, human. "
            "Not a marketing agency. Not a startup landing page."
        ),
        (
            "Ban these words/phrases: elevate, unlock, seamless, embark, journey, passion, "
            "delve, tapestry, nestled, curated experience, transformative, reimagine, "
            "beckons, oasis, one-stop, where excellence meets, game-changer, leverage, "
            "synergy, indulge, bespoke lifestyle, welcome to the future."
        ),
        (
            "Hero headline: use the business name, or a short concrete offer "
            '(e.g. "Haircuts & fades", "Fresh bread daily") — not a poetic slogan.'
        ),
        (
            "CTAs: Book now, Call us, Visit today, Get a quote — "
            'not "Begin your journey" or "Discover more".'
        ),
        (
            "Testimonials: first names only, one specific detail, ordinary wording. "
            'No "highly recommend this establishment".'
        ),
        "About/services: say what they actually do. Skip filler adjectives.",
        "",
        f"Business name: {business_name}",
    ]

    if business_type:
        lines.append(f"Business type: {business_type}")
    if description:
        lines.append(f"Description: {description}")
    if style:
        lines.append(f"Style: {style}")
    if inspiration_hint:
        lines.append(f"Visual inspiration: {inspiration_hint}")
    if services:
        lines.append(
            "Services list (REQUIRED for services section props.items — "
            "each item {name, description}; use these names): "
            + json.dumps(services, separators=(",", ":"))
        )
    if contact:
        contact_bits = {k: v for k, v in contact.items() if v}
        if contact_bits:
            lines.append(f"Contact: {json.dumps(contact_bits, separators=(',', ':'))}")

    lines.append("Catalog: " + json.dumps(catalog, separators=(",", ":")))

    if media_payload:
        lines.append(
            "Media (REQUIRED: put these ids into section mediaIds — "
            "hero gets 1, gallery gets the rest when present; never invent ids): "
            + json.dumps(media_payload, separators=(",", ":"))
        )
    else:
        lines.append("No media uploaded. Omit mediaIds.")

    if repair_notes:
        lines.append("Fix previous validation errors: " + repair_notes)

    return "\n".join(lines)
