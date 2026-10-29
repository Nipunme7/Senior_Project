"""FastAPI application entrypoint for the trusted backend layer."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import catalog, health, sites
from services.settings import get_settings

settings = get_settings()

app = FastAPI(
    title="AI Website Platform API",
    description=(
        "Trusted application layer for validation, authorization, and site APIs. "
        "AI generation arrives in a later phase."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(catalog.router)
app.include_router(sites.router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "fastapi-backend",
        "docs": "/docs",
        "health": "/health",
    }
