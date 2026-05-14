# apps/api/app/records/router.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.records.repository import RecordRepository
from app.records.schema import RecordCreate, RecordResponse, RecordUpdate
from app.records.service import RecordService

router = APIRouter(prefix="/records", tags=["records"])


def get_record_service(db: Session = Depends(get_db)) -> RecordService:
    return RecordService(RecordRepository(db))


# 暫時用固定 user_id，之後換成 JWT 驗證
TEMP_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@router.get("/", response_model=list[RecordResponse])
def get_records(service: RecordService = Depends(get_record_service)):
    return service.get_all(TEMP_USER_ID)


@router.get("/trash", response_model=list[RecordResponse])
def get_deleted_records(service: RecordService = Depends(get_record_service)):
    return service.get_deleted(TEMP_USER_ID)


@router.get("/{record_id}", response_model=RecordResponse)
def get_record(record_id: uuid.UUID, service: RecordService = Depends(get_record_service)):
    return service.get_by_id(record_id, TEMP_USER_ID)


@router.post("/", response_model=RecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(data: RecordCreate, service: RecordService = Depends(get_record_service)):
    return service.create(data, TEMP_USER_ID)


@router.patch("/{record_id}", response_model=RecordResponse)
def update_record(
    record_id: uuid.UUID, data: RecordUpdate, service: RecordService = Depends(get_record_service)
):
    return service.update(record_id, data, TEMP_USER_ID)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id: uuid.UUID, service: RecordService = Depends(get_record_service)):
    service.delete(record_id, TEMP_USER_ID)


@router.patch("/{record_id}/restore", response_model=RecordResponse)
def restore_record(record_id: uuid.UUID, service: RecordService = Depends(get_record_service)):
    return service.restore(record_id, TEMP_USER_ID)
