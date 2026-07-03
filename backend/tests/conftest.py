"""
Fixtures compartilhadas — env vars fake DEVEM ser semeadas antes de importar app.*
"""
import os
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

os.environ.setdefault("SUPABASE_URL", "https://fake.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "fake-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "fake-service-role-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-jwt-secret")
os.environ.setdefault("ANTHROPIC_API_KEY", "fake-anthropic-key")

import pytest
from fastapi.testclient import TestClient
from jose import jwt

from app.config import get_settings

get_settings.cache_clear()

from app.main import app  # noqa: E402
from app.routers.stories import get_story_service  # noqa: E402

TEST_JWT_SECRET = "test-jwt-secret"
TEST_USER_ID = "00000000-0000-0000-0000-000000000001"


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def make_token():
    def _make(
        sub: str | None = TEST_USER_ID,
        aud: str | None = "authenticated",
        exp_delta: timedelta = timedelta(hours=1),
        secret: str = TEST_JWT_SECRET,
    ) -> str:
        claims: dict = {"exp": datetime.now(timezone.utc) + exp_delta}
        if sub is not None:
            claims["sub"] = sub
        if aud is not None:
            claims["aud"] = aud
        return jwt.encode(claims, secret, algorithm="HS256")

    return _make


@pytest.fixture
def auth_headers(make_token) -> dict:
    return {"Authorization": f"Bearer {make_token()}"}


@pytest.fixture
def fake_story_service():
    fake = MagicMock()
    fake.generate_and_save = AsyncMock()
    fake.list_stories = AsyncMock()
    fake.get_story = AsyncMock()
    app.dependency_overrides[get_story_service] = lambda: fake
    yield fake
    app.dependency_overrides.clear()
