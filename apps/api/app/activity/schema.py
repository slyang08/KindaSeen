# apps/api/app/activity/schema.py
import uuid
from datetime import datetime

from pydantic import BaseModel


class ActivityResponse(BaseModel):
    id: uuid.UUID
    actor_id: uuid.UUID
    username: str
    display_name: str | None
    avatar_url: str | None
    activity_type: str
    object_id: uuid.UUID | None
    object_type: str | None
    metadata: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FeedResponse(BaseModel):
    items: list[ActivityResponse]
    has_more: bool
