# apps/api/app/records/schema.py
import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class MediaType(StrEnum):
    movie = "movie"
    variety = "variety"
    drama = "drama"
    anime = "anime"
    manga = "manga"
    novel = "novel"
    podcast = "podcast"


class Status(StrEnum):
    completed = "completed"
    watching = "watching"
    dropped = "dropped"
    want_to_watch = "want_to_watch"


class RecordBase(BaseModel):
    title: str
    media_type: MediaType
    status: Status
    season: int | None = None
    episode: int | None = None
    rating: int | None = None
    notes: str | None = None
    tmdb_id: int | None = None
    poster_url: str | None = None
    overview: str | None = None
    tmdb_rating: float | None = None
    genres: list[str] | None = None


class RecordCreate(RecordBase):
    pass


class RecordUpdate(BaseModel):
    title: str | None = None
    media_type: MediaType | None = None
    status: Status | None = None
    season: int | None = None
    episode: int | None = None
    rating: int | None = None
    notes: str | None = None
    tmdb_id: int | None = None
    poster_url: str | None = None
    overview: str | None = None
    tmdb_rating: float | None = None
    genres: list[str] | None = None


class RecordResponse(RecordBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = {"from_attributes": True}
