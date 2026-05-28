# apps/api/app/favorites/schema.py
import uuid
from datetime import datetime

from pydantic import BaseModel


class FavoriteCreate(BaseModel):
    record_id: uuid.UUID


class FavoriteResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    record_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
