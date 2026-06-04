# app/users/stats_schema.py
from pydantic import BaseModel


class RatingBucket(BaseModel):
    label: str
    count: int


class GenreStat(BaseModel):
    name: str
    count: int


class MediaTypeStat(BaseModel):
    media_type: str
    count: int


class UserStatsResponse(BaseModel):
    total: int
    by_status: dict[str, int]
    avg_rating: float | None
    rated_count: int
    rating_distribution: list[RatingBucket]
    top_genres: list[GenreStat]
    by_media_type: list[MediaTypeStat]
    this_year: int
    last_30_days: int
