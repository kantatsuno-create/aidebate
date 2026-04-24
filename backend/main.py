import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from starlette.requests import Request

from debate_engine import DebateEngine

load_dotenv()

# --- Security -----------------------------------------------------------
# Set ACCESS_TOKEN in your Railway env vars.
# If not set (local dev without .env), the API is open.
_ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN", "")


def _require_token(request: Request) -> None:
    if not _ACCESS_TOKEN:
        return  # dev mode: no token required
    token = request.headers.get("X-Access-Token", "")
    if token != _ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


# --- App ----------------------------------------------------------------
app = FastAPI(title="AI Debate Arena", docs_url=None, redoc_url=None)

# CORS: allow all origins in dev (no ACCESS_TOKEN set),
# restrict to same-origin in production.
_cors_origins = ["*"] if not _ACCESS_TOKEN else []
if _cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins,
        allow_methods=["POST", "GET"],
        allow_headers=["Content-Type", "X-Access-Token"],
    )


# --- API routes ---------------------------------------------------------
class DebateRequest(BaseModel):
    topic: str


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth")
async def auth(_: None = Depends(_require_token)):
    return {"ok": True}


@app.post("/api/debate")
async def start_debate(
    request: DebateRequest,
    _: None = Depends(_require_token),
):
    engine = DebateEngine()

    async def generate():
        try:
            async for event in engine.run_debate(request.topic.strip()):
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
        except Exception as e:
            error = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# --- Static frontend (production) ---------------------------------------
# FastAPI serves the built React app so the whole stack lives on one host.
_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if _DIST.is_dir():
    app.mount("/assets", StaticFiles(directory=_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def spa(_full_path: str):
        return FileResponse(_DIST / "index.html")
