"""Gemini API client for structured WebsiteConfig generation (HTTP via httpx)."""

from __future__ import annotations

import json
from typing import Any

import httpx

from schemas.website_config import WebsiteConfig
from services.settings import Settings

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


class GeminiError(RuntimeError):
    """Raised when Gemini returns an unusable response."""


def generate_website_config_json(
    *,
    settings: Settings,
    prompt: str,
) -> dict[str, Any]:
    """
    Call Gemini and return parsed JSON for WebsiteConfig.
    Tests should mock this function — do not call live Gemini in unit tests.
    """
    if not settings.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY is not configured")

    url = (
        f"{GEMINI_API_BASE}/models/{settings.gemini_model}:generateContent"
        f"?key={settings.gemini_api_key}"
    )
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": WebsiteConfig.model_json_schema(),
        },
    }

    try:
        response = httpx.post(url, json=payload, timeout=90.0)
    except httpx.HTTPError as exc:
        raise GeminiError(f"Gemini request failed: {exc}") from exc

    if response.status_code >= 400:
        detail = response.text[:500]
        raise GeminiError(f"Gemini HTTP {response.status_code}: {detail}")

    try:
        body = response.json()
    except json.JSONDecodeError as exc:
        raise GeminiError(f"Gemini returned non-JSON envelope: {exc}") from exc

    text = _extract_text(body)
    if not text:
        raise GeminiError("Gemini returned an empty response")

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise GeminiError(f"Gemini returned invalid JSON: {exc}") from exc

    if not isinstance(parsed, dict):
        raise GeminiError("Gemini JSON root must be an object")
    return parsed


def _extract_text(body: dict[str, Any]) -> str:
    candidates = body.get("candidates") or []
    if not candidates:
        return ""
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    chunks: list[str] = []
    for part in parts:
        text = part.get("text")
        if isinstance(text, str):
            chunks.append(text)
    return "".join(chunks).strip()
