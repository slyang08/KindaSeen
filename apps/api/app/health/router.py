# apps/api/app/health/router.py
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.cache import cache_ping
from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
@router.head("/")
async def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    redis_status = "ok" if await cache_ping() else "error"

    all_ok = db_status == "ok" and redis_status == "ok"

    return {
        "status": "ok" if all_ok else "degraded",
        "database": db_status,
        "redis": redis_status,
    }
