# apps/api/app/users/schema.py
import uuid
from datetime import datetime

from pydantic import BaseModel


class UserProfileResponse(BaseModel):
    user_id: uuid.UUID
    username: str
    display_name: str | None
    avatar_url: str | None
    bio: str | None
    is_public_sharing_enabled: bool
    is_profile_public: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    username: str | None = None
    display_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    is_public_sharing_enabled: bool | None = None
    is_profile_public: bool | None = None


class SupabaseWebhookPayload(BaseModel):
    type: str
    table: str
    record: dict
    schema_: str = "public"
