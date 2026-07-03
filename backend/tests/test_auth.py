"""
Testes do middleware de autenticação (get_current_user) via GET /api/stories.
"""
from datetime import timedelta

from app.models.schemas import StoriesListOut


def _empty_list():
    return StoriesListOut(stories=[], total=0)


def test_valid_token_returns_200(client, fake_story_service, auth_headers):
    fake_story_service.list_stories.return_value = _empty_list()
    response = client.get("/api/stories", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"stories": [], "total": 0}


def test_token_with_wrong_secret_returns_401(client, fake_story_service, make_token):
    token = make_token(secret="wrong-secret")
    response = client.get("/api/stories", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_expired_token_returns_401(client, fake_story_service, make_token):
    token = make_token(exp_delta=timedelta(hours=-1))
    response = client.get("/api/stories", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_wrong_audience_returns_401(client, fake_story_service, make_token):
    # Regressão: o middleware deve exigir aud="authenticated" (tokens Supabase)
    token = make_token(aud="wrong-audience")
    response = client.get("/api/stories", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_token_without_sub_returns_401(client, fake_story_service, make_token):
    token = make_token(sub=None)
    response = client.get("/api/stories", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_missing_authorization_header_returns_403(client, fake_story_service):
    response = client.get("/api/stories")
    assert response.status_code == 403
