# apps/api/app/social/schema.py
import uuid
from datetime import datetime

from pydantic import BaseModel


class FollowResponse(BaseModel):
    follower_id: uuid.UUID
    following_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    user_id: uuid.UUID
    username: str
    display_name: str | None
    avatar_url: str | None

    model_config = {"from_attributes": True}


class PublicProfileResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    display_name: str | None
    avatar_url: str | None
    bio: str | None
    followers_count: int
    following_count: int
    is_following: bool  # Has the currently logged-in user followed this person?

    model_config = {"from_attributes": True}
