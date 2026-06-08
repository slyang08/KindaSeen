# apps/api/app/records/router.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.records.repository import RecordRepository
from app.records.schema import RecordCreate, RecordResponse, RecordUpdate
from app.records.service import RecordService

router = APIRouter(prefix="/records", tags=["records"])


def get_record_service(db: Session = Depends(get_db)) -> RecordService:
    return RecordService(RecordRepository(db))


@router.get("/", response_model=list[RecordResponse])
def get_records(
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.get_all(user_id)


@router.get("/trash", response_model=list[RecordResponse])
def get_deleted_records(
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.get_deleted(user_id)


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
):
    return await service.create(data, user_id)


@router.patch("/{record_id}", response_model=RecordResponse)
async def update_record(
    record_id: uuid.UUID,
    data: RecordUpdate,
    service: RecordService = Depends(get_record_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return await service.update(record_id, data, user_id)


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
