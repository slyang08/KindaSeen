# apps/api/app/records/router.py
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.activity.service import record_activity
from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.records.repository import RecordRepository
from app.records.schema import (
    MediaType,
    PaginatedRecordResponse,
    RecordCreate,
    RecordResponse,
    RecordSortBy,
    RecordUpdate,
    SortOrder,
    Status,
)
from app.records.service import RecordService

router = APIRouter(prefix="/records", tags=["records"])


def get_record_service(db: Session = Depends(get_db)) -> RecordService:
    return RecordService(RecordRepository(db))


@router.get("/", response_model=PaginatedRecordResponse)
def get_records(
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    media_type: MediaType | None = Query(default=None),
    status: Status | None = Query(default=None),
    sort_by: RecordSortBy = Query(default=RecordSortBy.created_at),
    sort_order: SortOrder = Query(default=SortOrder.desc),
):
    items, total = service.get_all(
        user_id,
        limit=limit,
        offset=offset,
        media_type=media_type,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedRecordResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )


@router.get("/trash", response_model=PaginatedRecordResponse)
def get_deleted_records(
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items, total = service.get_deleted(user_id, limit=limit, offset=offset)
    return PaginatedRecordResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )


@router.get("/watchlist", response_model=PaginatedRecordResponse)
def get_watchlist(
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items, total = service.get_watchlist(user_id, limit=limit, offset=offset)
    return PaginatedRecordResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )


@router.get("/{record_id}", response_model=RecordResponse)
def get_record(
    record_id: uuid.UUID,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.get_by_id(record_id, user_id)


@router.post("/", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
async def create_record(
    data: RecordCreate,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = await service.create(data, user_id)
    record_activity(
        db=db,
        actor_id=user_id,
        activity_type="add_record",
        object_id=result.id,
        object_type="record",
        metadata={"title": result.title, "media_type": result.media_type},
    )
    db.commit()
    return result


@router.patch("/{record_id}", response_model=RecordResponse)
async def update_record(
    record_id: uuid.UUID,
    data: RecordUpdate,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    original = service.get_by_id(record_id, user_id)
    result = await service.update(record_id, data, user_id)
    if data.rating is not None and data.rating != original.rating:
        record_activity(
            db=db,
            actor_id=user_id,
            activity_type="rate",
            object_id=result.id,
            object_type="record",
            metadata={
                "title": result.title,
                "media_type": result.media_type,
                "rating": data.rating,
            },
        )
    if (
        data.status is not None
        and data.status.value == "want_to_watch"
        and data.status != original.status
    ):
        record_activity(
            db=db,
            actor_id=user_id,
            activity_type="watchlist_add",
            object_id=result.id,
            object_type="record",
            metadata={"title": result.title, "media_type": result.media_type},
        )
    db.commit()
    return result


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(
    record_id: uuid.UUID,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    await service.delete(record_id, user_id)


@router.patch("/{record_id}/restore", response_model=RecordResponse)
async def restore_record(
    record_id: uuid.UUID,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return await service.restore(record_id, user_id)


@router.delete("/{record_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_record(
    record_id: uuid.UUID,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    await service.permanent_delete(record_id, user_id)
