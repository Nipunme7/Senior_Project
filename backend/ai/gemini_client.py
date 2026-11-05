"""Gemini API client for structured WebsiteConfig generation (HTTP via httpx)."""

from __future__ import annotations

import json
import re
from typing import Any

import httpx

from services.settings import Settings

GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"

# Long generations can exceed 2 minutes on free/flash tiers.
_GEMINI_TIMEOUT = httpx.Timeout(connect=30.0, read=300.0, write=30.0, pool=30.0)


class GeminiError(RuntimeError):
    """Raised when Gemini returns an unusable response."""

    def __init__(
        self,
        message: str,
        *,
        timed_out: bool = False,
        truncated: bool = False,
    ) -> None:
        super().__init__(message)
        self.timed_out = timed_out
        self.truncated = truncated


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
    # JSON mime type only (no responseSchema) — faster and avoids schema quirks.
    # Pydantic + normalize enforce the real WebsiteConfig contract afterward.
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            # Full multi-section configs need headroom; 4096 often truncates mid-string.
            "maxOutputTokens": 8192,
        },
    }

    try:
        response = httpx.post(url, json=payload, timeout=_GEMINI_TIMEOUT)
    except httpx.TimeoutException as exc:
        raise GeminiError(
            "Gemini timed out. Wait a moment and try Generate again "
            "(large site configs can take 1–2 minutes).",
            timed_out=True,
        ) from exc
    except httpx.HTTPError as exc:
        raise GeminiError(f"Gemini request failed: {exc}") from exc

    if response.status_code >= 400:
        detail = response.text[:500]
        raise GeminiError(f"Gemini HTTP {response.status_code}: {detail}")

    try:
        body = response.json()
    except json.JSONDecodeError as exc:
        raise GeminiError(f"Gemini returned non-JSON envelope: {exc}") from exc

    text, finish_reason = _extract_text_and_finish(body)
    if not text:
        raise GeminiError("Gemini returned an empty response")

    text = _strip_code_fences(text)

    if finish_reason == "MAX_TOKENS":
        raise GeminiError(
            "Gemini cut off the JSON mid-response (token limit). "
            "Try Generate again — the prompt asks for fewer/shorter sections.",
            truncated=True,
        )

    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        # Truncation often shows up as "Unterminated string" without MAX_TOKENS set.
        truncated = "Unterminated string" in str(exc) or "Expecting" in str(exc)
        raise GeminiError(
            f"Gemini returned invalid/truncated JSON: {exc}. Try Generate again.",
            truncated=truncated,
        ) from exc

    if not isinstance(parsed, dict):
        raise GeminiError("Gemini JSON root must be an object")
    return parsed


def _strip_code_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _extract_text_and_finish(body: dict[str, Any]) -> tuple[str, str | None]:
    candidates = body.get("candidates") or []
    if not candidates:
        return "", None
    candidate = candidates[0]
    finish_reason = candidate.get("finishReason")
    if isinstance(finish_reason, str):
        finish = finish_reason
    else:
        finish = None
    content = candidate.get("content") or {}
    parts = content.get("parts") or []
    chunks: list[str] = []
    for part in parts:
        text = part.get("text")
        if isinstance(text, str):
            chunks.append(text)
    return "".join(chunks).strip(), finish
