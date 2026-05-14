# apps/api/app/records/repository.py
import uuid
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.records.model import Record
from app.records.schema import RecordCreate, RecordUpdate


class RecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: uuid.UUID) -> list[Record]:
        return (
            self.db.query(Record)
            .filter(Record.user_id == user_id, Record.deleted_at == None)  # noqa: E711
            .all()
        )

    def get_by_id(
        self, record_id: uuid.UUID, user_id: uuid.UUID, include_deleted: bool = False
    ) -> Record | None:
        query = self.db.query(Record).filter(Record.id == record_id, Record.user_id == user_id)
        if not include_deleted:
            query = query.filter(Record.deleted_at == None)  # noqa: E711
        return query.first()

    def get_deleted(self, user_id: uuid.UUID) -> list[Record]:
        return (
            self.db.query(Record)
            .filter(Record.user_id == user_id, Record.deleted_at != None)  # noqa: E711
            .all()
        )

    def create(self, data: RecordCreate, user_id: uuid.UUID) -> Record:
        record = Record(**data.model_dump(), user_id=user_id)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update(self, record: Record, data: RecordUpdate) -> Record:
        if record.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recard is deleted")
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(record, key, value)
        self.db.commit()
        self.db.refresh(record)
        return record

    def delete(self, record: Record) -> None:
        record.deleted_at = datetime.utcnow()
        self.db.commit()

    def restore(self, record: Record) -> Record:
        record.deleted_at = None
        self.db.commit()
        self.db.refresh(record)
        return record
