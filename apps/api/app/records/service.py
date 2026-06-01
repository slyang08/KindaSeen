# apps/api/app/records/service.py
import uuid

from fastapi import HTTPException, status

from app.records.repository import RecordRepository
from app.records.schema import RecordCreate, RecordUpdate


class RecordService:
    def __init__(self, repository: RecordRepository):
        self.repository = repository

    def _get_or_404(self, record_id: uuid.UUID, user_id: uuid.UUID, include_deleted: bool = False):
        record = self.repository.get_by_id(record_id, user_id, include_deleted)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Record not found",
            )

        return record

    def get_all(self, user_id: uuid.UUID):
        return self.repository.get_all(user_id)

    def get_deleted(self, user_id: uuid.UUID):
        return self.repository.get_deleted(user_id)

    def get_by_id(self, record_id: uuid.UUID, user_id: uuid.UUID):
        return self._get_or_404(record_id, user_id)

    def create(self, data: RecordCreate, user_id: uuid.UUID):
        return self.repository.create(data, user_id)

    def update(self, record_id: uuid.UUID, data: RecordUpdate, user_id: uuid.UUID):
        record = self._get_or_404(record_id, user_id)

        if record.deleted_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Record is deleted",
            )

        return self.repository.update(record, data)

    def delete(self, record_id: uuid.UUID, user_id: uuid.UUID):
        record = self._get_or_404(record_id, user_id)
        self.repository.soft_delete(record)

    def restore(self, record_id: uuid.UUID, user_id: uuid.UUID):
        record = self._get_or_404(record_id, user_id, include_deleted=True)

        if not record.deleted_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Record is not deleted",
            )

        return self.repository.restore(record)

    def permanent_delete(self, record_id: uuid.UUID, user_id: uuid.UUID):
        record = self._get_or_404(record_id, user_id, include_deleted=True)

        if not record.deleted_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Record must be soft-deleted before permanent deletion",
            )

        self.repository.permanent_delete(record)
