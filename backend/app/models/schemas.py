"""
Pydantic schemas — request/response contracts for the API.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


# ── Story ─────────────────────────────────────────────────────────────────

class GenerateStoryRequest(BaseModel):
    source_text: str = Field(..., min_length=50, max_length=20_000,
                             description="Texto escolar extraído ou colado pelo aluno")
    subject: str = Field(..., min_length=2, max_length=100,
                         description="Matéria (ex: Biologia, História, Física)")
    title: str | None = Field(None, max_length=150,
                              description="Título opcional para a história")


class StoryOut(BaseModel):
    id: str
    user_id: str
    title: str
    subject: str
    source_text: str
    generated_story: str
    created_at: datetime


class StoriesListOut(BaseModel):
    stories: list[StoryOut]
    total: int


# ── PDF Extraction ─────────────────────────────────────────────────────────

class ExtractTextResponse(BaseModel):
    text: str
    page_count: int
    char_count: int


# ── Mana ──────────────────────────────────────────────────────────────────

class ManaBalanceOut(BaseModel):
    user_id: str
    balance: int


class ManaTransactionOut(BaseModel):
    id: str
    user_id: str
    amount: int
    type: Literal["credit", "debit"]
    description: str
    created_at: datetime


# ── Auth helpers ───────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    username: str | None
    avatar_url: str | None
    mana_balance: int
    created_at: datetime


# ── Generic ───────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str
