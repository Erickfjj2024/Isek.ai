"""
Smoke test — health check endpoint.
Run with: pytest tests/
"""


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert "message" in response.json()
