# apps/api/app/records/service.py
import uuid

from fastapi import HTTPException, status

from app.records.repository import RecordRepository
from app.records.schema import RecordCreate, RecordUpdate


class RecordService:
    def __init__(self, repository: RecordRepository):
        self.repository = repository

    def get_all(self, user_id: uuid.UUID):
        return self.repository.get_all(user_id)

    def get_by_id(self, record_id: uuid.UUID, user_id: uuid.UUID):
        record = self.repository.get_by_id(record_id, user_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
        return record

    def create(self, data: RecordCreate, user_id: uuid.UUID):
        return self.repository.create(data, user_id)

    def update(self, record_id: uuid.UUID, data: RecordUpdate, user_id: uuid.UUID):
        record = self.get_by_id(record_id, user_id)
        return self.repository.update(record, data)

    def delete(self, record_id: uuid.UUID, user_id: uuid.UUID):
        record = self.get_by_id(record_id, user_id)
        self.repository.delete(record)

    def restore(self, record_id: uuid.UUID, user_id: uuid.UUID):
        record = self.repository.get_by_id(record_id, user_id, include_deleted=True)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
        return self.repository.restore(record)
