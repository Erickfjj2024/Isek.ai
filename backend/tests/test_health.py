"""
Smoke test — health check endpoint.
Run with: pytest tests/
"""
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Patch settings before app import to avoid missing env vars
with patch("app.config.get_settings") as _mock:
    _mock.return_value = MagicMock(
        app_env="development",
        allowed_origins="http://localhost:3000",
        origins_list=["http://localhost:3000"],
        supabase_url="https://fake.supabase.co",
        supabase_anon_key="fake-key",
        supabase_service_role_key="fake-service-key",
        anthropic_api_key="fake-anthropic-key",
        llm_model="claude-sonnet-4-6",
        mana_cost_per_story=10,
        mana_welcome_bonus=100,
    )
    from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert "message" in response.json()
