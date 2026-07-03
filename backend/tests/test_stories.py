"""
Testes das rotas de histórias (camada router) e do StoryService (camada serviço).
"""
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.models.schemas import StoryOut
from tests.conftest import TEST_USER_ID

VALID_BODY = {
    "source_text": "A fotossíntese é o processo pelo qual as plantas convertem luz solar em energia química.",
    "subject": "Biologia",
    "title": None,
}


def _story_out(**overrides) -> StoryOut:
    data = dict(
        id="story-1",
        user_id=TEST_USER_ID,
        title="A Saga do Herói de Biologia",
        subject="Biologia",
        source_text=VALID_BODY["source_text"],
        generated_story="## Capítulo 1\nEra uma vez...",
        created_at=datetime.now(timezone.utc),
    )
    data.update(overrides)
    return StoryOut(**data)


# ── Camada router ──────────────────────────────────────────────────────────

def test_generate_story_returns_201(client, fake_story_service, auth_headers):
    fake_story_service.generate_and_save.return_value = _story_out()
    response = client.post("/api/generate-story", json=VALID_BODY, headers=auth_headers)
    assert response.status_code == 201
    body = response.json()
    assert body["id"] == "story-1"
    assert body["generated_story"].startswith("## Capítulo 1")
    kwargs = fake_story_service.generate_and_save.call_args.kwargs
    assert kwargs["user_id"] == TEST_USER_ID


def test_generate_story_propagates_402(client, fake_story_service, auth_headers):
    fake_story_service.generate_and_save.side_effect = HTTPException(
        status_code=402, detail="Mana insuficiente."
    )
    response = client.post("/api/generate-story", json=VALID_BODY, headers=auth_headers)
    assert response.status_code == 402


def test_generate_story_rejects_short_text(client, fake_story_service, auth_headers):
    body = dict(VALID_BODY, source_text="muito curto")
    response = client.post("/api/generate-story", json=body, headers=auth_headers)
    assert response.status_code == 422
    fake_story_service.generate_and_save.assert_not_called()


def test_get_story_not_found_returns_404(client, fake_story_service, auth_headers):
    fake_story_service.get_story.return_value = None
    response = client.get("/api/stories/nao-existe", headers=auth_headers)
    assert response.status_code == 404


# ── Camada serviço ─────────────────────────────────────────────────────────

def _make_supabase_mock(mana_balance: int):
    supabase = MagicMock()
    tables = {
        "profiles": MagicMock(),
        "stories": MagicMock(),
        "mana_transactions": MagicMock(),
    }
    tables["profiles"].select.return_value.eq.return_value.single.return_value \
        .execute.return_value = SimpleNamespace(data={"mana_balance": mana_balance})
    supabase.table.side_effect = lambda name: tables[name]
    return supabase, tables


def _make_service(mana_balance: int, story_text: str = "Era uma vez em outro mundo..."):
    supabase, tables = _make_supabase_mock(mana_balance)
    llm = MagicMock()
    llm.messages.create.return_value = SimpleNamespace(
        content=[SimpleNamespace(text=story_text)]
    )
    with patch("app.services.story_service.create_client", return_value=supabase), \
         patch("app.services.story_service.anthropic.Anthropic", return_value=llm):
        from app.services.story_service import StoryService

        service = StoryService()
    return service, supabase, tables, llm


async def test_insufficient_mana_raises_402_without_llm_call():
    service, _supabase, _tables, llm = _make_service(mana_balance=5)

    with pytest.raises(HTTPException) as exc_info:
        await service.generate_and_save(
            user_id=TEST_USER_ID,
            source_text=VALID_BODY["source_text"],
            subject="Biologia",
            title=None,
        )

    assert exc_info.value.status_code == 402
    llm.messages.create.assert_not_called()


async def test_generate_and_save_debits_mana_and_persists():
    service, supabase, tables, llm = _make_service(mana_balance=100)

    story = await service.generate_and_save(
        user_id=TEST_USER_ID,
        source_text=VALID_BODY["source_text"],
        subject="Biologia",
        title=None,
    )

    supabase.rpc.assert_called_once_with(
        "decrement_mana", {"p_user_id": TEST_USER_ID, "p_amount": 10}
    )

    tx_insert = tables["mana_transactions"].insert.call_args.args[0]
    assert tx_insert["amount"] == -10
    assert tx_insert["type"] == "debit"

    story_insert = tables["stories"].insert.call_args.args[0]
    assert story_insert["user_id"] == TEST_USER_ID
    assert story_insert["generated_story"] == "Era uma vez em outro mundo..."

    assert story.generated_story == "Era uma vez em outro mundo..."
    assert story.title == "A Saga do Herói de Biologia"
