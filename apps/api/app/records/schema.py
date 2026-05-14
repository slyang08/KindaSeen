# apps/api/app/records/schema.py
import uuid
from datetime import datetime

from pydantic import BaseModel


class RecordBase(BaseModel):
    title: str
    media_type: str
    status: str
    rating: int | None = None
    notes: str | None = None


class RecordCreate(RecordBase):
    pass


class RecordUpdate(BaseModel):
    title: str | None = None
    media_type: str | None = None
    status: str | None = None
    rating: int | None = None
    notes: str | None = None


class RecordResponse(RecordBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    model_config = {"from_attributes": True}
