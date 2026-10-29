def test_catalog_includes_all_section_types(client):
    response = client.get("/v1/catalog")
    assert response.status_code == 200
    body = response.json()
    assert "hero" in body["sectionTypes"]
    assert "footer" in body["sectionTypes"]
    assert "fullscreen-image" in body["variantsByType"]["hero"]
    assert "basic" in body["variantsByType"]["footer"]
