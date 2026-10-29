from conftest import MINIMAL_CONFIG


def test_validate_accepts_valid_config(client):
    response = client.post("/v1/sites/validate", json={"config": MINIMAL_CONFIG})
    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["sectionCount"] == 1
    assert body["sectionTypes"] == ["hero"]


def test_validate_rejects_unknown_section_type(client):
    bad = {
        **MINIMAL_CONFIG,
        "sections": [
            {
                "id": "x",
                "type": "not-real",
                "variant": "cards",
                "props": {},
            }
        ],
    }
    response = client.post("/v1/sites/validate", json={"config": bad})
    assert response.status_code == 422


def test_validate_rejects_invalid_variant_for_type(client):
    bad = {
        **MINIMAL_CONFIG,
        "sections": [
            {
                "id": "hero_01",
                "type": "hero",
                "variant": "cards",
                "props": {"headline": "Nope"},
            }
        ],
    }
    response = client.post("/v1/sites/validate", json={"config": bad})
    assert response.status_code == 422


def test_validate_rejects_duplicate_section_ids(client):
    bad = {
        **MINIMAL_CONFIG,
        "sections": [
            {
                "id": "hero_01",
                "type": "hero",
                "variant": "centered",
                "props": {"headline": "One"},
            },
            {
                "id": "hero_01",
                "type": "about",
                "variant": "text-only",
                "props": {"body": "Two"},
            },
        ],
    }
    response = client.post("/v1/sites/validate", json={"config": bad})
    assert response.status_code == 422
    assert "Duplicate section id" in response.json()["detail"]


def test_validate_rejects_empty_sections(client):
    bad = {**MINIMAL_CONFIG, "sections": []}
    response = client.post("/v1/sites/validate", json={"config": bad})
    assert response.status_code == 422
