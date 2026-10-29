from fastapi import APIRouter, Depends, HTTPException, status

from ai.gemini_client import GeminiError
from schemas.api import (
    CreateSiteRequest,
    CreateSiteResponse,
    GenerateSiteRequest,
    GenerateSiteResponse,
    PublicSiteResponse,
    SiteSummary,
    ValidateSiteRequest,
    ValidateSiteResponse,
)
from schemas.website_config import WebsiteConfig
from services.auth import AuthenticatedUser, get_current_user
from services.generation import generate_validated_website_config
from services.settings import Settings, get_settings
from services.sites import create_draft_site, get_published_site_by_slug
from services.validation import ValidationError, summarize_config, validate_website_config

router = APIRouter(prefix="/v1/sites", tags=["sites"])


@router.post("/validate", response_model=ValidateSiteResponse)
def validate_site(body: ValidateSiteRequest) -> ValidateSiteResponse:
    """Validate a WebsiteConfig against schema and catalog rules. Does not persist."""
    try:
        config = validate_website_config(body.config)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    summary = summarize_config(config)
    return ValidateSiteResponse(
        valid=True,
        config=config,
        sectionCount=summary["sectionCount"],
        sectionTypes=summary["sectionTypes"],
    )


@router.post("/generate", response_model=GenerateSiteResponse)
async def generate_site(
    body: GenerateSiteRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> GenerateSiteResponse:
    """
    Generate a WebsiteConfig with Gemini for the authenticated owner.
    Output is validated before return. Set persist=true + slug to save a draft.
    """
    contact = body.contact.model_dump() if body.contact else None
    media = [item.model_dump() for item in body.media] if body.media else None

    try:
        config = generate_validated_website_config(
            settings=settings,
            business_name=body.businessName.strip(),
            business_type=body.businessType,
            description=body.description,
            services=body.services,
            contact=contact,
            style=body.style,
            media=media,
        )
    except GeminiError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    summary = summarize_config(config)
    site_summary: SiteSummary | None = None

    if body.persist:
        if not body.slug:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="slug is required when persist=true",
            )
        try:
            row = await create_draft_site(
                settings=settings,
                owner_id=user.id,
                business_name=body.businessName.strip(),
                slug=body.slug.strip().lower(),
                style=body.style,
                config=config,
            )
        except ValidationError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            ) from exc
        site_summary = SiteSummary(
            id=str(row["id"]),
            ownerId=str(row["owner_id"]),
            businessName=row["business_name"],
            slug=row["slug"],
            status=row["status"],
            style=row.get("style"),
        )

    return GenerateSiteResponse(
        config=config,
        sectionCount=summary["sectionCount"],
        sectionTypes=summary["sectionTypes"],
        site=site_summary,
    )


@router.post("", response_model=CreateSiteResponse, status_code=status.HTTP_201_CREATED)
async def create_site(
    body: CreateSiteRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> CreateSiteResponse:
    """
    Create a draft site for the authenticated owner.
    Requires Authorization: Bearer <supabase access token>.
    """
    try:
        row = await create_draft_site(
            settings=settings,
            owner_id=user.id,
            business_name=body.businessName.strip(),
            slug=body.slug.strip().lower(),
            style=body.style,
            config=body.config,
        )
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    config = WebsiteConfig.model_validate(row["site_config"])
    return CreateSiteResponse(
        site=SiteSummary(
            id=str(row["id"]),
            ownerId=str(row["owner_id"]),
            businessName=row["business_name"],
            slug=row["slug"],
            status=row["status"],
            style=row.get("style"),
        ),
        config=config,
    )


@router.get("/public/{slug}", response_model=PublicSiteResponse)
async def read_public_site(
    slug: str,
    settings: Settings = Depends(get_settings),
) -> PublicSiteResponse:
    """Return a published site config. Drafts are never exposed here."""
    row = await get_published_site_by_slug(settings=settings, slug=slug)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")

    try:
        config = validate_website_config(WebsiteConfig.model_validate(row["site_config"]))
    except (ValidationError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Stored site_config is invalid: {exc}",
        ) from exc

    return PublicSiteResponse(
        slug=row["slug"],
        businessName=row["business_name"],
        status="published",
        config=config,
    )
