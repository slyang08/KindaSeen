# apps/api/app/recommendations/schema.py
import uuid
from typing import Literal

from pydantic import BaseModel


class RecommendationReason(BaseModel):
    type: Literal["high_rating", "favorite", "popular_fallback"]
    source_record_id: uuid.UUID | None = None
    source_title: str | None = None
    source_rating: float | None = None


class RecommendationItem(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    poster_url: str | None
    overview: str
    tmdb_rating: float | None
    release_year: int | None
    genres: list[str]
    score: float
    reasons: list[RecommendationReason]


class PaginatedRecommendationResponse(BaseModel):
    items: list[RecommendationItem]
    total: int
    limit: int
    offset: int
    has_more: bool
