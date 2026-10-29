import jwt


def test_create_site_requires_auth(client):
    response = client.post(
        "/v1/sites",
        json={
            "businessName": "Demo",
            "slug": "demo-shop",
        },
    )
    assert response.status_code == 401


TEST_JWT_SECRET = "test-secret-at-least-32-bytes-long!!"


def test_create_site_with_token_without_jwt_secret(client, monkeypatch):
    monkeypatch.delenv("SUPABASE_JWT_SECRET", raising=False)
    from services.settings import get_settings

    get_settings.cache_clear()

    token = jwt.encode(
        {"sub": "user-1", "email": "a@b.com", "aud": "authenticated"},
        TEST_JWT_SECRET,
        algorithm="HS256",
    )
    response = client.post(
        "/v1/sites",
        headers={"Authorization": f"Bearer {token}"},
        json={"businessName": "Demo", "slug": "demo-shop"},
    )
    assert response.status_code == 503
    get_settings.cache_clear()


def test_create_site_local_mode_with_jwt(client, monkeypatch):
    monkeypatch.setenv("SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    from services.settings import get_settings

    get_settings.cache_clear()

    token = jwt.encode(
        {"sub": "user-123", "email": "owner@example.com", "aud": "authenticated"},
        TEST_JWT_SECRET,
        algorithm="HS256",
    )
    response = client.post(
        "/v1/sites",
        headers={"Authorization": f"Bearer {token}"},
        json={"businessName": "Demo Shop", "slug": "demo-shop"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["site"]["slug"] == "demo-shop"
    assert body["site"]["ownerId"] == "user-123"
    assert body["site"]["status"] == "draft"
    assert body["config"]["siteName"] == "Demo Shop"
    get_settings.cache_clear()
