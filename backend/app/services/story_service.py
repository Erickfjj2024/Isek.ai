"""
StoryService — orquestra:
  1. Verificação e débito de Mana
  2. Chamada à LLM (Claude) via prompt builder
  3. Persistência no Supabase
  4. Retorno do objeto StoryOut
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from openai import OpenAI
from supabase import create_client

from app.config import get_settings
from app.models.schemas import StoriesListOut, StoryOut
from app.services.prompt_builder import SYSTEM_PROMPT, build_user_prompt


class StoryService:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._supabase = create_client(
            self._settings.supabase_url,
            self._settings.supabase_service_role_key,
        )
        self._llm = OpenAI(
            api_key=self._settings.llm_api_key,
            base_url=self._settings.llm_base_url,
        )

    # ── Public ────────────────────────────────────────────────────────────

    async def generate_and_save(
        self,
        user_id: str,
        source_text: str,
        subject: str,
        title: str | None,
    ) -> StoryOut:
        # 1. Check mana balance
        balance = self._get_mana_balance(user_id)
        cost = self._settings.mana_cost_per_story
        if balance < cost:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Mana insuficiente. Você tem {balance} Mana, mas precisa de {cost}.",
            )

        # 2. Generate story via LLM
        user_prompt = build_user_prompt(source_text, subject, title)
        generated_story = self._call_llm(user_prompt)

        # 3. Debit mana
        self._debit_mana(user_id, cost, f"Geração de história: {subject}")

        # 4. Persist story
        story_title = title or f"A Saga do Herói de {subject}"
        story_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        self._supabase.table("stories").insert({
            "id": story_id,
            "user_id": user_id,
            "title": story_title,
            "subject": subject,
            "source_text": source_text,
            "generated_story": generated_story,
            "created_at": now.isoformat(),
        }).execute()

        return StoryOut(
            id=story_id,
            user_id=user_id,
            title=story_title,
            subject=subject,
            source_text=source_text,
            generated_story=generated_story,
            created_at=now,
        )

    async def list_stories(self, user_id: str) -> StoriesListOut:
        response = (
            self._supabase.table("stories")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        stories = [StoryOut(**row) for row in (response.data or [])]
        return StoriesListOut(stories=stories, total=len(stories))

    async def get_story(self, story_id: str, user_id: str) -> StoryOut | None:
        response = (
            self._supabase.table("stories")
            .select("*")
            .eq("id", story_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not response.data:
            return None
        return StoryOut(**response.data)

    # ── Private ───────────────────────────────────────────────────────────

    def _call_llm(self, user_prompt: str) -> str:
        completion = self._llm.chat.completions.create(
            model=self._settings.resolved_llm_model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
        return completion.choices[0].message.content or ""

    def _get_mana_balance(self, user_id: str) -> int:
        response = (
            self._supabase.table("profiles")
            .select("mana_balance")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil do usuário não encontrado.",
            )
        return int(response.data["mana_balance"])

    def _debit_mana(self, user_id: str, amount: int, description: str) -> None:
        # Decrement balance
        self._supabase.rpc(
            "decrement_mana",
            {"p_user_id": user_id, "p_amount": amount},
        ).execute()

        # Log transaction
        self._supabase.table("mana_transactions").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "amount": -amount,
            "type": "debit",
            "description": description,
        }).execute()
