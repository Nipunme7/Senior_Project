import jwt

from conftest import MINIMAL_CONFIG

TEST_JWT_SECRET = "test-secret-at-least-32-bytes-long!!"


def _auth_headers(monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.setenv("GEMINI_API_KEY", "test-gemini-key")
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    from services.settings import get_settings

    get_settings.cache_clear()
    token = jwt.encode(
        {"sub": "user-ai", "email": "owner@example.com", "aud": "authenticated"},
        TEST_JWT_SECRET,
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


def test_generate_requires_auth(client):
    response = client.post(
        "/v1/sites/generate",
        json={"businessName": "Elite Cuts"},
    )
    assert response.status_code == 401


def test_generate_requires_gemini_key(client, monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    # Empty string overrides backend/.env so local keys do not leak into tests.
    monkeypatch.setenv("GEMINI_API_KEY", "")
    from services.settings import get_settings

    get_settings.cache_clear()
    token = jwt.encode(
        {"sub": "user-ai", "aud": "authenticated"},
        TEST_JWT_SECRET,
        algorithm="HS256",
    )
    response = client.post(
        "/v1/sites/generate",
        headers={"Authorization": f"Bearer {token}"},
        json={"businessName": "Elite Cuts"},
    )
    assert response.status_code == 503
    get_settings.cache_clear()


def test_generate_returns_validated_config(client, monkeypatch):
    headers = _auth_headers(monkeypatch)

    def fake_generate(*, settings, prompt):
        assert "Elite Cuts" in prompt
        assert "Approved component catalog" in prompt
        return {
            **MINIMAL_CONFIG,
            "siteName": "Elite Cuts",
            "sections": [
                {
                    "id": "hero_01",
                    "type": "hero",
                    "variant": "centered",
                    "props": {
                        "headline": "Elite Cuts",
                        "subheadline": "Premium barbering",
                    },
                },
                {
                    "id": "about_01",
                    "type": "about",
                    "variant": "text-only",
                    "props": {"body": "Neighborhood barbershop."},
                },
            ],
        }

    monkeypatch.setattr(
        "services.generation.generate_website_config_json",
        fake_generate,
    )

    response = client.post(
        "/v1/sites/generate",
        headers=headers,
        json={
            "businessName": "Elite Cuts",
            "businessType": "barbershop",
            "description": "Classic cuts and fades",
            "style": "modern",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["config"]["siteName"] == "Elite Cuts"
    assert body["sectionCount"] == 2
    assert body["sectionTypes"] == ["hero", "about"]
    assert body["site"] is None
    get_settings_clear()


def get_settings_clear():
    from services.settings import get_settings

    get_settings.cache_clear()


def test_generate_rejects_invalid_ai_output(client, monkeypatch):
    headers = _auth_headers(monkeypatch)
    calls = {"n": 0}

    def fake_generate(*, settings, prompt):
        calls["n"] += 1
        return {
            **MINIMAL_CONFIG,
            "sections": [
                {
                    "id": "hero_01",
                    "type": "hero",
                    "variant": "cards",
                    "props": {"headline": "Bad variant"},
                }
            ],
        }

    monkeypatch.setattr(
        "services.generation.generate_website_config_json",
        fake_generate,
    )

    response = client.post(
        "/v1/sites/generate",
        headers=headers,
        json={"businessName": "Bad Shop"},
    )
    assert response.status_code == 422
    assert calls["n"] == 2
    get_settings_clear()


def test_generate_rejects_unknown_media_id(client, monkeypatch):
    headers = _auth_headers(monkeypatch)

    def fake_generate(*, settings, prompt):
        return {
            **MINIMAL_CONFIG,
            "sections": [
                {
                    "id": "hero_01",
                    "type": "hero",
                    "variant": "centered",
                    "props": {"headline": "Hello"},
                    "mediaIds": ["media_unknown"],
                }
            ],
        }

    monkeypatch.setattr(
        "services.generation.generate_website_config_json",
        fake_generate,
    )

    response = client.post(
        "/v1/sites/generate",
        headers=headers,
        json={
            "businessName": "Media Shop",
            "media": [{"id": "media_owned", "description": "Storefront"}],
        },
    )
    assert response.status_code == 422
    assert "unknown media id" in response.json()["detail"]
    get_settings_clear()


def test_generate_persist_local_draft(client, monkeypatch):
    headers = _auth_headers(monkeypatch)

    def fake_generate(*, settings, prompt):
        return {**MINIMAL_CONFIG, "siteName": "Persisted Shop"}

    monkeypatch.setattr(
        "services.generation.generate_website_config_json",
        fake_generate,
    )

    response = client.post(
        "/v1/sites/generate",
        headers=headers,
        json={
            "businessName": "Persisted Shop",
            "slug": "persisted-shop",
            "persist": True,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["site"]["slug"] == "persisted-shop"
    assert body["site"]["status"] == "draft"
    assert body["config"]["siteName"] == "Persisted Shop"
    get_settings_clear()
