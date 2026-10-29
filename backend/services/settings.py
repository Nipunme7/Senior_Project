"""Application settings loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
import os

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "../frontend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    supabase_jwt_secret: str | None = None
    cors_origins: str = "http://localhost:3000"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.0-flash"

    @field_validator(
        "supabase_url",
        "supabase_anon_key",
        "supabase_service_role_key",
        "supabase_jwt_secret",
        "gemini_api_key",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, value: object) -> object:
        if isinstance(value, str) and not value.strip():
            return None
        return value


    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_anon_key)

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache
def get_settings() -> Settings:
    # Support Next.js-style public names when backend-specific names are absent.
    if not os.getenv("SUPABASE_URL") and os.getenv("NEXT_PUBLIC_SUPABASE_URL"):
        os.environ["SUPABASE_URL"] = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
    if not os.getenv("SUPABASE_ANON_KEY") and os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY"):
        os.environ["SUPABASE_ANON_KEY"] = os.environ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    return Settings()
