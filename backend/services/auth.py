"""Supabase Auth verification for owner-only routes."""

from __future__ import annotations

from dataclasses import dataclass

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from services.settings import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None = None


def _user_from_hs256(token: str, settings: Settings) -> AuthenticatedUser | None:
    """Optional local HS256 verify when SUPABASE_JWT_SECRET is the legacy secret."""
    if not settings.supabase_jwt_secret:
        return None
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") != "HS256":
            return None
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        return None

    user_id = payload.get("sub")
    if not user_id or not isinstance(user_id, str):
        return None
    email = payload.get("email")
    return AuthenticatedUser(
        id=user_id,
        email=email if isinstance(email, str) else None,
    )


def _user_from_supabase_auth_api(token: str, settings: Settings) -> AuthenticatedUser:
    """
    Verify the access token with Supabase Auth.
    Works for HS256 and newer ECC/RSA signing keys without local JWKS setup.
    """
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SUPABASE_URL and SUPABASE_ANON_KEY are required to verify tokens",
        )

    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": settings.supabase_anon_key,
    }

    try:
        response = httpx.get(url, headers=headers, timeout=15.0)
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not reach Supabase Auth: {exc}",
        ) from exc

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Invalid or expired Supabase session. "
                "Sign out, sign in again, then retry generate."
            ),
        )

    body = response.json()
    user_id = body.get("id")
    if not user_id or not isinstance(user_id, str):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase Auth response missing user id",
        )
    email = body.get("email")
    return AuthenticatedUser(
        id=user_id,
        email=email if isinstance(email, str) else None,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )

    token = credentials.credentials

    local_user = _user_from_hs256(token, settings)
    if local_user is not None:
        return local_user

    return _user_from_supabase_auth_api(token, settings)
