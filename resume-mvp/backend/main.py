from __future__ import annotations
import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from uuid import uuid4
import os

from dotenv import load_dotenv

load_dotenv()

from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from database import get_db, init_db
from module_mapping import get_module_config, list_modules
import llm_service


# ---- Models ----

class ExperienceCreate(BaseModel):
    title: str
    direction: Optional[str] = None
    itemAnswers: dict = Field(default_factory=dict)
    roomPlacements: dict = Field(default_factory=dict)


class ExperienceUpdate(BaseModel):
    title: Optional[str] = None
    direction: Optional[str] = None
    itemAnswers: Optional[dict] = None
    roomPlacements: Optional[dict] = None


class GenerateRequest(BaseModel):
    modules: List[str]
    contextTexts: Dict[str, str] = Field(default_factory=dict)
    resumeText: Optional[str] = None


class AIResultUpsert(BaseModel):
    moduleType: str
    content: dict
    sourceExperienceIds: List[str] = Field(default_factory=list)


# ---- App ----

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="经历仓库 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Helpers ----

def row_to_experience(row) -> dict:
    data = json.loads(row["answers"])
    return {
        "id": row["id"],
        "title": row["title"],
        "direction": row["direction"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
        "itemAnswers": data.get("itemAnswers", {}),
        "roomPlacements": data.get("roomPlacements", {}),
    }


# ---- Routes ----

@app.get("/api/experiences")
async def list_experiences():
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM experiences ORDER BY created_at DESC")
        rows = await cursor.fetchall()
        return [row_to_experience(r) for r in rows]
    finally:
        await db.close()


@app.get("/api/experiences/{exp_id}")
async def get_experience(exp_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM experiences WHERE id = ?", (exp_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="经历不存在")
        return row_to_experience(row)
    finally:
        await db.close()


@app.post("/api/experiences", status_code=201)
async def create_experience(exp: ExperienceCreate):
    now = datetime.now(timezone.utc).isoformat()
    exp_id = str(uuid4())
    db = await get_db()
    try:
        answers_json = json.dumps({
            "itemAnswers": exp.itemAnswers,
            "roomPlacements": exp.roomPlacements,
        })
        await db.execute(
            "INSERT INTO experiences (id, title, direction, created_at, updated_at, answers) VALUES (?, ?, ?, ?, ?, ?)",
            (exp_id, exp.title, exp.direction, now, now, answers_json),
        )
        await db.commit()
        return {
            "id": exp_id,
            "title": exp.title,
            "direction": exp.direction,
            "createdAt": now,
            "updatedAt": now,
            "itemAnswers": exp.itemAnswers,
            "roomPlacements": exp.roomPlacements,
        }
    finally:
        await db.close()


@app.put("/api/experiences/{exp_id}")
async def update_experience(exp_id: str, exp: ExperienceUpdate):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM experiences WHERE id = ?", (exp_id,))
        row = await cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="经历不存在")

        now = datetime.now(timezone.utc).isoformat()
        updates = {"updated_at": now}

        if exp.title is not None:
            updates["title"] = exp.title
        if exp.direction is not None:
            updates["direction"] = exp.direction
        if exp.itemAnswers is not None or exp.roomPlacements is not None:
            existing = json.loads(row["answers"])
            if exp.itemAnswers is not None:
                existing["itemAnswers"] = exp.itemAnswers
            if exp.roomPlacements is not None:
                existing["roomPlacements"] = exp.roomPlacements
            updates["answers"] = json.dumps(existing)

        set_clause = ", ".join(f"{k} = ?" for k in updates)
        await db.execute(
            f"UPDATE experiences SET {set_clause} WHERE id = ?",
            (*updates.values(), exp_id),
        )
        await db.commit()

        cursor = await db.execute("SELECT * FROM experiences WHERE id = ?", (exp_id,))
        row = await cursor.fetchone()
        return row_to_experience(row)
    finally:
        await db.close()


@app.delete("/api/experiences/{exp_id}")
async def delete_experience(exp_id: str):
    db = await get_db()
    try:
        cursor = await db.execute("SELECT id FROM experiences WHERE id = ?", (exp_id,))
        if not await cursor.fetchone():
            raise HTTPException(status_code=404, detail="经历不存在")
        await db.execute("DELETE FROM experiences WHERE id = ?", (exp_id,))
        await db.commit()
        return {"ok": True}
    finally:
        await db.close()


# ---- AI Generate (SSE) ----

def _load_prompt(module_type: str, context_text: str, resume_text: str) -> str:
    config = get_module_config(module_type)
    if not config:
        raise ValueError(f"未知模块类型: {module_type}")
    template_path = os.path.join(os.path.dirname(__file__), "prompts", f"{config.prompt_template}.txt")
    with open(template_path, encoding="utf-8") as f:
        template = f.read()
    return template.replace("{context}", context_text).replace("{resume_text}", resume_text or "（未上传简历）")


async def _generate_stream(request: Request, modules: List[str], context_texts: Dict[str, str], resume_text: Optional[str]):
    for module_type in modules:
        if await request.is_disconnected():
            break

        config = get_module_config(module_type)
        if not config:
            yield f"event: module_error\ndata: {json.dumps({'module': module_type, 'error': f'未知模块: {module_type}'})}\n\n"
            continue

        # 合并所有房间的上下文文本
        full_context = "\n\n".join(context_texts.values()) if context_texts else "（无 QA 数据）"
        prompt = _load_prompt(module_type, full_context, resume_text or "")

        try:
            content = await llm_service.generate_resume_content(module_type, prompt)
            yield f"event: module_done\ndata: {json.dumps({'module': module_type, 'content': content})}\n\n"
        except Exception as e:
            yield f"event: module_error\ndata: {json.dumps({'module': module_type, 'error': str(e)})}\n\n"

    yield f"event: all_done\ndata: {json.dumps({})}\n\n"


@app.post("/api/generate")
async def generate_content(body: GenerateRequest, request: Request):
    if not llm_service.is_configured():
        raise HTTPException(status_code=503, detail="LLM API Key 未配置")

    return StreamingResponse(
        _generate_stream(request, body.modules, body.contextTexts, body.resumeText),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ---- AI Results CRUD ----

@app.get("/api/ai-results")
async def list_ai_results():
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM ai_results ORDER BY updated_at DESC")
        rows = await cursor.fetchall()
        return [
            {
                "id": row["id"],
                "moduleType": row["module_type"],
                "content": json.loads(row["content_json"]),
                "sourceExperienceIds": json.loads(row["source_experience_ids"]),
                "createdAt": row["created_at"],
                "updatedAt": row["updated_at"],
            }
            for row in rows
        ]
    finally:
        await db.close()


@app.post("/api/ai-results", status_code=201)
async def upsert_ai_result(body: AIResultUpsert):
    now = datetime.now(timezone.utc).isoformat()
    db = await get_db()
    try:
        # 按 module_type 唯一，存在则更新
        cursor = await db.execute("SELECT id FROM ai_results WHERE module_type = ?", (body.moduleType,))
        existing = await cursor.fetchone()

        if existing:
            await db.execute(
                "UPDATE ai_results SET content_json = ?, source_experience_ids = ?, updated_at = ? WHERE module_type = ?",
                (json.dumps(body.content), json.dumps(body.sourceExperienceIds), now, body.moduleType),
            )
        else:
            await db.execute(
                "INSERT INTO ai_results (id, module_type, content_json, source_experience_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (str(uuid4()), body.moduleType, json.dumps(body.content), json.dumps(body.sourceExperienceIds), now, now),
            )

        await db.commit()
        return {"ok": True, "moduleType": body.moduleType, "updatedAt": now}
    finally:
        await db.close()


# ---- LLM Status ----

@app.get("/api/llm/status")
async def llm_status():
    return {"configured": llm_service.is_configured()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
