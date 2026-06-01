# apps/api/app/favorites/share_schema.py
import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class ShareExpiry(StrEnum):
    ONE_HOUR = "1h"
    ONE_DAY = "1d"


class ShareTokenCreate(BaseModel):
    expires_in: ShareExpiry


class ShareTokenResponse(BaseModel):
    token: str
    expires_at: datetime
    link: str

    model_config = {"from_attributes": True}


class SharedRecordResponse(BaseModel):
    id: uuid.UUID
    title: str
    media_type: str
    status: str
    release_year: int | None
    season: int | None
    episode: int | None
    rating: int | None
    notes: str | None
    tmdb_id: int | None
    poster_url: str | None
    overview: str | None
    tmdb_rating: float | None
    genres: list[str] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SharedFavoriteResponse(BaseModel):
    id: uuid.UUID
    record_id: uuid.UUID
    created_at: datetime
    record: SharedRecordResponse

    model_config = {"from_attributes": True}
