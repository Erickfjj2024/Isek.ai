from fastapi import APIRouter
from app.models.schemas import MessageResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=MessageResponse)
async def health_check():
    return {"message": "Isek.AI backend is alive ⚡"}
