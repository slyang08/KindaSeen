# apps/api/app/reviews/schema.py
import uuid
from datetime import datetime

from pydantic import BaseModel

# ── Comment ──────────────────────────────────────


class CommentCreate(BaseModel):
    content: str


class CommentUpdate(BaseModel):
    content: str | None = None


class CommentResponse(BaseModel):
    id: uuid.UUID
    review_id: uuid.UUID
    user_id: uuid.UUID
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Review ───────────────────────────────────────


class ReviewCreate(BaseModel):
    title: str
    content: str
    is_public: bool = False


class ReviewUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    is_public: bool | None = None


class ReviewResponse(BaseModel):
    id: uuid.UUID
    record_id: uuid.UUID
    user_id: uuid.UUID
    title: str
    content: str
    is_public: bool
    rating: int | None = None  # join from records.rating
    created_at: datetime
    updated_at: datetime
    comments: list[CommentResponse] = []

    model_config = {"from_attributes": True}
