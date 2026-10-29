from fastapi import APIRouter

from component_catalog.catalog import get_component_catalog

router = APIRouter(prefix="/v1", tags=["catalog"])


@router.get("/catalog")
def read_catalog() -> dict:
    """Return approved section types and variants for clients and AI."""
    return get_component_catalog()
