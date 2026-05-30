import json
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_db, init_db


# ---- Models ----

class ExperienceCreate(BaseModel):
    title: str
    direction: str | None = None
    itemAnswers: dict = Field(default_factory=dict)
    roomPlacements: dict = Field(default_factory=dict)


class ExperienceUpdate(BaseModel):
    title: str | None = None
    direction: str | None = None
    itemAnswers: dict | None = None
    roomPlacements: dict | None = None


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
