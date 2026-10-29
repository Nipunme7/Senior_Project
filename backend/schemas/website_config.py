"""Pydantic WebsiteConfig contracts mirrored from the frontend TypeScript types."""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, Field, field_validator


class ThemeConfig(BaseModel):
    style: Literal[
        "luxury",
        "minimal",
        "modern",
        "professional",
        "playful",
        "ai-choose",
    ]
    primaryColor: str
    accentColor: str


class HeroProps(BaseModel):
    headline: str
    subheadline: str | None = None
    ctaLabel: str | None = None
    ctaHref: str | None = None


class AboutProps(BaseModel):
    heading: str | None = None
    body: str


class ServiceItem(BaseModel):
    name: str
    description: str | None = None
    price: str | None = None


class ServicesProps(BaseModel):
    heading: str | None = None
    items: list[ServiceItem]


class PricingItem(BaseModel):
    name: str
    price: str
    description: str | None = None
    features: list[str] | None = None


class PricingProps(BaseModel):
    heading: str | None = None
    items: list[PricingItem]


class GalleryProps(BaseModel):
    heading: str | None = None


class TestimonialItem(BaseModel):
    quote: str
    name: str
    role: str | None = None


class TestimonialsProps(BaseModel):
    heading: str | None = None
    items: list[TestimonialItem]


class CtaProps(BaseModel):
    heading: str
    body: str | None = None
    ctaLabel: str | None = None
    ctaHref: str | None = None


class ContactProps(BaseModel):
    heading: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    hours: str | None = None
    mapEmbedUrl: str | None = None


class FooterProps(BaseModel):
    tagline: str | None = None
    copyright: str | None = None


class SectionBase(BaseModel):
    id: str = Field(min_length=1)
    mediaIds: list[str] | None = None

    @field_validator("id")
    @classmethod
    def id_must_be_nonempty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("section id must be non-empty")
        return cleaned


class HeroSectionConfig(SectionBase):
    type: Literal["hero"]
    variant: Literal[
        "centered",
        "split-left",
        "split-right",
        "fullscreen-image",
        "video-background",
    ]
    props: HeroProps


class AboutSectionConfig(SectionBase):
    type: Literal["about"]
    variant: Literal["text-only", "image-left", "image-right"]
    props: AboutProps


class ServicesSectionConfig(SectionBase):
    type: Literal["services"]
    variant: Literal["cards", "list", "icon-grid"]
    props: ServicesProps


class PricingSectionConfig(SectionBase):
    type: Literal["pricing"]
    variant: Literal["cards", "simple-list"]
    props: PricingProps


class GallerySectionConfig(SectionBase):
    type: Literal["gallery"]
    variant: Literal["grid", "masonry", "featured"]
    props: GalleryProps


class TestimonialsSectionConfig(SectionBase):
    type: Literal["testimonials"]
    variant: Literal["cards", "featured-quote"]
    props: TestimonialsProps


class CtaSectionConfig(SectionBase):
    type: Literal["cta"]
    variant: Literal["simple", "banner", "image-background"]
    props: CtaProps


class ContactSectionConfig(SectionBase):
    type: Literal["contact"]
    variant: Literal["simple", "split", "map-right"]
    props: ContactProps


class FooterSectionConfig(SectionBase):
    type: Literal["footer"]
    variant: Literal["basic"]
    props: FooterProps


SiteSection = Annotated[
    HeroSectionConfig
    | AboutSectionConfig
    | ServicesSectionConfig
    | PricingSectionConfig
    | GallerySectionConfig
    | TestimonialsSectionConfig
    | CtaSectionConfig
    | ContactSectionConfig
    | FooterSectionConfig,
    Field(discriminator="type"),
]


class WebsiteConfig(BaseModel):
    siteName: str = Field(min_length=1)
    theme: ThemeConfig
    sections: list[SiteSection] = Field(min_length=1)

    @field_validator("siteName")
    @classmethod
    def site_name_nonempty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("siteName must be non-empty")
        return cleaned
