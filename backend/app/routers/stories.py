"""
Router: Story generation & listing
POST /api/generate-story   — gera história a partir de texto (requer auth)
GET  /api/stories          — lista histórias do usuário autenticado
GET  /api/stories/{id}     — retorna uma história específica
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.middleware.auth import get_current_user
from app.models.schemas import GenerateStoryRequest, StoriesListOut, StoryOut
from app.services.story_service import StoryService

router = APIRouter(prefix="/api", tags=["stories"])


def get_story_service() -> StoryService:
    return StoryService()


@router.post(
    "/generate-story",
    response_model=StoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Gera uma história Isekai a partir do conteúdo escolar",
)
async def generate_story(
    body: GenerateStoryRequest,
    current_user: dict = Depends(get_current_user),
    service: StoryService = Depends(get_story_service),
):
    user_id = current_user["user_id"]
    story = await service.generate_and_save(
        user_id=user_id,
        source_text=body.source_text,
        subject=body.subject,
        title=body.title,
    )
    return story


@router.get(
    "/stories",
    response_model=StoriesListOut,
    summary="Lista todas as histórias do usuário autenticado",
)
async def list_stories(
    current_user: dict = Depends(get_current_user),
    service: StoryService = Depends(get_story_service),
):
    user_id = current_user["user_id"]
    return await service.list_stories(user_id=user_id)


@router.get(
    "/stories/{story_id}",
    response_model=StoryOut,
    summary="Retorna uma história específica pelo ID",
)
async def get_story(
    story_id: str,
    current_user: dict = Depends(get_current_user),
    service: StoryService = Depends(get_story_service),
):
    user_id = current_user["user_id"]
    story = await service.get_story(story_id=story_id, user_id=user_id)
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="História não encontrada.",
        )
    return story
