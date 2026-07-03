"""
Testes do endpoint POST /api/extract-text.
"""
import contextlib
from types import SimpleNamespace

import pdfplumber

PDF_FILE = ("file", ("apostila.pdf", b"%PDF-1.4 fake", "application/pdf"))


def _fake_pdfplumber_open(page_texts: list[str]):
    pages = [SimpleNamespace(extract_text=lambda t=t: t) for t in page_texts]

    @contextlib.contextmanager
    def _open(_buffer):
        yield SimpleNamespace(pages=pages)

    return _open


def test_extract_text_requires_auth(client):
    response = client.post("/api/extract-text", files=[PDF_FILE])
    assert response.status_code == 403


def test_extract_text_invalid_token_returns_401(client, make_token):
    token = make_token(secret="wrong-secret")
    response = client.post(
        "/api/extract-text",
        files=[PDF_FILE],
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401


def test_extract_text_rejects_non_pdf(client, auth_headers):
    response = client.post(
        "/api/extract-text",
        files=[("file", ("notas.txt", b"apenas texto", "text/plain"))],
        headers=auth_headers,
    )
    assert response.status_code == 415


def test_extract_text_rejects_oversized_file(client, auth_headers):
    big = b"x" * (10 * 1024 * 1024 + 1)
    response = client.post(
        "/api/extract-text",
        files=[("file", ("gigante.pdf", big, "application/pdf"))],
        headers=auth_headers,
    )
    assert response.status_code == 413


def test_extract_text_success(client, auth_headers, monkeypatch):
    monkeypatch.setattr(
        pdfplumber, "open", _fake_pdfplumber_open(["Fotossíntese é...", "Página dois."])
    )
    response = client.post("/api/extract-text", files=[PDF_FILE], headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["page_count"] == 2
    assert "Fotossíntese" in body["text"]
    assert body["char_count"] == len(body["text"])


def test_extract_text_empty_pdf_returns_422(client, auth_headers, monkeypatch):
    monkeypatch.setattr(pdfplumber, "open", _fake_pdfplumber_open(["", ""]))
    response = client.post("/api/extract-text", files=[PDF_FILE], headers=auth_headers)
    assert response.status_code == 422
