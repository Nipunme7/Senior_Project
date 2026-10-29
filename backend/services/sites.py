"""Site persistence helpers using Supabase PostgREST."""

from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException, status

from schemas.website_config import WebsiteConfig
from services.settings import Settings
from services.validation import validate_website_config


def _headers(settings: Settings, *, service_role: bool = False) -> dict[str, str]:
    key = (
        settings.supabase_service_role_key
        if service_role and settings.supabase_service_role_key
        else settings.supabase_anon_key
    )
    if not settings.supabase_url or not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured on the backend",
        )
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def build_default_config(business_name: str, style: str | None) -> WebsiteConfig:
    resolved_style = style if style in {
        "luxury",
        "minimal",
        "modern",
        "professional",
        "playful",
        "ai-choose",
    } else "modern"

    return WebsiteConfig.model_validate(
        {
            "siteName": business_name,
            "theme": {
                "style": resolved_style,
                "primaryColor": "#111111",
                "accentColor": "#C9A45C",
            },
            "sections": [
                {
                    "id": "hero_01",
                    "type": "hero",
                    "variant": "centered",
                    "props": {
                        "headline": business_name,
                        "subheadline": "Draft site managed by the FastAPI backend.",
                    },
                }
            ],
        }
    )


async def create_draft_site(
    *,
    settings: Settings,
    owner_id: str,
    business_name: str,
    slug: str,
    style: str | None,
    config: WebsiteConfig | None,
) -> dict[str, Any]:
    website_config = validate_website_config(
        config or build_default_config(business_name, style)
    )

    if not settings.supabase_service_role_key:
        # Auth-only local mode: return a synthetic response without persistence.
        return {
            "id": "local-draft",
            "owner_id": owner_id,
            "business_name": business_name,
            "slug": slug,
            "status": "draft",
            "style": style,
            "site_config": website_config.model_dump(mode="json"),
            "persisted": False,
        }

    payload = {
        "owner_id": owner_id,
        "business_name": business_name,
        "slug": slug,
        "status": "draft",
        "style": style,
        "site_config": website_config.model_dump(mode="json"),
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        # Ensure profile exists for FK (no-op if already present).
        await client.post(
            f"{settings.supabase_url}/rest/v1/profiles",
            headers=_headers(settings, service_role=True),
            json={"id": owner_id, "display_name": business_name},
        )
        response = await client.post(
            f"{settings.supabase_url}/rest/v1/sites",
            headers=_headers(settings, service_role=True),
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.json() if response.content else response.text,
        )

    rows = response.json()
    row = rows[0] if isinstance(rows, list) else rows
    row["persisted"] = True
    row["site_config"] = website_config.model_dump(mode="json")
    return row


async def get_published_site_by_slug(
    *,
    settings: Settings,
    slug: str,
) -> dict[str, Any] | None:
    if not settings.supabase_configured:
        return None

    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(
            f"{settings.supabase_url}/rest/v1/sites",
            headers=_headers(settings, service_role=False),
            params={
                "slug": f"eq.{slug}",
                "status": "eq.published",
                "select": "id,owner_id,business_name,slug,status,style,site_config",
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to query Supabase sites",
        )

    rows = response.json()
    if not rows:
        return None
    return rows[0]
