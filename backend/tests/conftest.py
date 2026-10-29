import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


MINIMAL_CONFIG = {
    "siteName": "Test Shop",
    "theme": {
        "style": "modern",
        "primaryColor": "#111111",
        "accentColor": "#C9A45C",
    },
    "sections": [
        {
            "id": "hero_01",
            "type": "hero",
            "variant": "centered",
            "props": {"headline": "Hello"},
        }
    ],
}
