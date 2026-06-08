import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    return db


async def init_db():
    db = await get_db()
    await db.execute("""
        CREATE TABLE IF NOT EXISTS experiences (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            direction TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            answers TEXT NOT NULL DEFAULT '{}'
        )
    """)
    await db.execute("""
        CREATE TABLE IF NOT EXISTS ai_results (
            id TEXT PRIMARY KEY,
            module_type TEXT NOT NULL UNIQUE,
            content_json TEXT NOT NULL,
            source_experience_ids TEXT NOT NULL DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    await db.commit()
    await db.close()
