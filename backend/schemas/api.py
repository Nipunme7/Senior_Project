"""API request and response models."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from schemas.website_config import WebsiteConfig


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "fastapi-backend"


class ValidateSiteRequest(BaseModel):
    config: WebsiteConfig


class ValidateSiteResponse(BaseModel):
    valid: bool = True
    config: WebsiteConfig
    sectionCount: int
    sectionTypes: list[str]


class CreateSiteRequest(BaseModel):
    businessName: str = Field(min_length=1)
    slug: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    style: str | None = None
    config: WebsiteConfig | None = None


class SiteSummary(BaseModel):
    id: str
    ownerId: str
    businessName: str
    slug: str
    status: Literal["draft", "published"]
    style: str | None = None


class CreateSiteResponse(BaseModel):
    site: SiteSummary
    config: WebsiteConfig


class PublicSiteResponse(BaseModel):
    slug: str
    businessName: str
    status: Literal["published"]
    config: WebsiteConfig


class AuthUser(BaseModel):
    id: str
    email: str | None = None


class GenerateMediaItem(BaseModel):
    id: str = Field(min_length=1)
    description: str | None = None
    kind: str | None = None


class GenerateContactInfo(BaseModel):
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    hours: str | None = None


class GenerateSiteRequest(BaseModel):
    businessName: str = Field(min_length=1)
    businessType: str | None = None
    description: str | None = None
    services: list[str] | None = None
    contact: GenerateContactInfo | None = None
    style: str | None = None
    media: list[GenerateMediaItem] | None = None
    slug: str | None = Field(
        default=None,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )
    persist: bool = False


class GenerateSiteResponse(BaseModel):
    config: WebsiteConfig
    sectionCount: int
    sectionTypes: list[str]
    site: SiteSummary | None = None
