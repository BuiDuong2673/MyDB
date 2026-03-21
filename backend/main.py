"""
Chat API: accepts the same JSON contract as the Next.js client (`lib/api.ts` → POST /api/chat).
Requires GEMINI_API_KEY in the environment (server-side only).
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Load repo-root env files (same as Next.js): `.env.local` overrides `.env`.
_root = Path(__file__).resolve().parent.parent
load_dotenv(_root / ".env")
load_dotenv(_root / ".env.local", override=True)

DEFAULT_MODEL = "gemini-2.5-flash"

MODEL_ALIASES: dict[str, str] = {
    "gemini-2.0-flash": "gemini-2.5-flash",
    "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
    "gemini-1.5-flash": "gemini-2.5-flash",
    "gemini-1.5-pro": "gemini-2.5-pro",
}


def sanitize_model(model: str | None) -> str:
    raw = (model or "").strip()
    if not raw or not raw.startswith("gemini-"):
        return DEFAULT_MODEL
    return MODEL_ALIASES.get(raw, raw)


def sanitize_temperature(t: float | None) -> float:
    if t is None or not isinstance(t, (int, float)) or t != t:  # NaN check
        return 0.7
    return max(0.0, min(2.0, float(t)))


def sanitize_max_tokens(n: int | None) -> int:
    if n is None or not isinstance(n, (int, float)):
        return 2048
    return max(1, min(8192, int(n)))


class IncomingMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1)


class IncomingSettings(BaseModel):
    model: str | None = None
    temperature: float | None = None
    maxTokens: int | None = None


class ChatRequest(BaseModel):
    messages: list[IncomingMessage] = Field(..., min_length=1)
    settings: IncomingSettings | None = None


app = FastAPI(title="MyDB Chat Backend", version="0.1.0")


@app.exception_handler(RequestValidationError)
def validation_exception_handler(
    _request, exc: RequestValidationError
) -> JSONResponse:  # type: ignore[no-untyped-def]
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid request body.", "detail": exc.errors()},
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/chat")
def chat(body: ChatRequest) -> JSONResponse:
    import google.generativeai as genai

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return JSONResponse(
            status_code=500,
            content={"error": "Missing GEMINI_API_KEY in server environment."},
        )

    messages = [
        m
        for m in body.messages
        if isinstance(m.content, str) and m.content.strip()
        and m.role in ("user", "assistant")
    ]
    if not messages:
        return JSONResponse(
            status_code=400,
            content={"error": "No valid messages were provided."},
        )

    settings = body.settings
    model_name = sanitize_model(settings.model if settings else None)
    temperature = sanitize_temperature(settings.temperature if settings else None)
    max_output_tokens = sanitize_max_tokens(settings.maxTokens if settings else None)

    genai.configure(api_key=api_key)

    contents: list[dict[str, object]] = []
    for m in messages:
        role = "model" if m.role == "assistant" else "user"
        contents.append({"role": role, "parts": [m.content.strip()]})

    try:
        model = genai.GenerativeModel(model_name)
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_output_tokens,
        )
        response = model.generate_content(
            contents,
            generation_config=generation_config,
        )
    except Exception as exc:  # noqa: BLE001 — surface as 502 with message
        return JSONResponse(
            status_code=502,
            content={"error": f"Gemini request failed: {exc!s}"},
        )

    try:
        text = (response.text or "").strip() if response else ""
    except ValueError:
        text = ""
    if not text:
        return JSONResponse(
            status_code=502,
            content={"error": "Gemini returned an empty response."},
        )

    return JSONResponse(content={"text": text})
