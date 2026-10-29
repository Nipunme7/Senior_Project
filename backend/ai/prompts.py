"""Prompt construction for full-site WebsiteConfig generation."""

from __future__ import annotations

import json
from typing import Any

from component_catalog.catalog import get_component_catalog


def build_generation_prompt(
    *,
    business_name: str,
    business_type: str | None,
    description: str | None,
    services: list[str] | None,
    contact: dict[str, str | None] | None,
    style: str | None,
    media: list[dict[str, Any]] | None,
    repair_notes: str | None = None,
) -> str:
    catalog = get_component_catalog()
    media_payload = media or []

    lines = [
        "You are generating a one-page small-business website configuration.",
        "Return ONLY structured WebsiteConfig JSON matching the provided schema.",
        "Do NOT generate React, HTML, CSS, or JavaScript.",
        "Use only section types and variants from the approved catalog.",
        "Section ids must be unique (example: hero_01, about_01).",
        "Include a sensible section order for a one-page site.",
        "Prefer including hero, about, services, contact, and footer when relevant.",
        "",
        f"Business name: {business_name}",
    ]

    if business_type:
        lines.append(f"Business type: {business_type}")
    if description:
        lines.append(f"Business description: {description}")
    if style:
        lines.append(f"Requested design style: {style}")
    if services:
        lines.append("Services offered:")
        for item in services:
            lines.append(f"- {item}")
    if contact:
        contact_bits = {k: v for k, v in contact.items() if v}
        if contact_bits:
            lines.append(f"Contact info: {json.dumps(contact_bits)}")

    lines.append("")
    lines.append("Approved component catalog:")
    lines.append(json.dumps(catalog, indent=2))

    if media_payload:
        lines.append("")
        lines.append(
            "Available media (reference only by id in section mediaIds; never invent ids):"
        )
        lines.append(json.dumps(media_payload, indent=2))
    else:
        lines.append("")
        lines.append("No uploaded media is available. Omit mediaIds or use empty lists.")

    if repair_notes:
        lines.append("")
        lines.append("Previous output failed validation. Fix these issues and regenerate:")
        lines.append(repair_notes)

    return "\n".join(lines)
