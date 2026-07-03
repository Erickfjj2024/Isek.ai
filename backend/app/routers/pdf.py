"""
Router: PDF extraction
POST /api/extract-text  — recebe um arquivo PDF e retorna o texto extraído.
"""
from __future__ import annotations

import io

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.middleware.auth import get_current_user
from app.models.schemas import ExtractTextResponse

router = APIRouter(prefix="/api", tags=["pdf"])

MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


@router.post(
    "/extract-text",
    response_model=ExtractTextResponse,
    summary="Extrai texto de um PDF enviado pelo usuário",
)
async def extract_text(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if file.content_type not in ("application/pdf",):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Apenas arquivos PDF são aceitos.",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Arquivo muito grande. Máximo: {MAX_FILE_SIZE_MB}MB.",
        )

    try:
        import pdfplumber  # lazy import — only needed here

        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages = pdf.pages
            page_count = len(pages)
            text = "\n\n".join(
                page.extract_text() or "" for page in pages
            ).strip()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Não foi possível extrair texto do PDF: {exc}",
        )

    if not text:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="O PDF não contém texto extraível (pode ser um PDF de imagem).",
        )

    return ExtractTextResponse(
        text=text,
        page_count=page_count,
        char_count=len(text),
    )
