# apps/api/app/tmdb/router.py
from fastapi import APIRouter, Depends, Query

from app.core.auth import get_current_user_id
from app.tmdb.service import TMDBResult, search_tmdb

router = APIRouter(prefix="/tmdb", tags=["tmdb"])


@router.get("/search", response_model=list[dict])
async def search(
    q: str = Query(..., min_length=1),
    media_type: str | None = Query(None, pattern="^(movie|tv)$"),
    _user_id=Depends(get_current_user_id),
):
    results: list[TMDBResult] = await search_tmdb(q, media_type)
    return [r.__dict__ for r in results]
