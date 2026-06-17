# apps/api/app/records/repository.py
import uuid
from datetime import UTC, datetime

from sqlalchemy import asc, desc, func
from sqlalchemy.orm import Session

from app.records.model import Record
from app.records.schema import RecordCreate, RecordSortBy, RecordUpdate, SortOrder


class RecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        user_id: uuid.UUID,
        limit: int,
        offset: int,
        media_type: str | None = None,
        status: str | None = None,
        sort_by: RecordSortBy = RecordSortBy.created_at,
        sort_order: SortOrder = SortOrder.desc,
    ) -> tuple[list[Record], int]:
        query = self.db.query(Record).filter(
            Record.user_id == user_id,
            Record.deleted_at.is_(None),
            Record.status != "want_to_watch",
        )

        if media_type:
            query = query.filter(Record.media_type == media_type)
        if status:
            query = query.filter(Record.status == status)

        total = query.with_entities(func.count()).scalar()

        order_col = getattr(Record, sort_by.value)
        order_fn = desc if sort_order == SortOrder.desc else asc
        query = query.order_by(order_fn(order_col).nulls_last())

        items = query.offset(offset).limit(limit).all()
        return items, total

    def get_watchlist(
        self,
        user_id: uuid.UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[Record], int]:
        query = self.db.query(Record).filter(
            Record.user_id == user_id,
            Record.deleted_at.is_(None),
            Record.status == "want_to_watch",
        )

        total = query.with_entities(func.count()).scalar()
        query = query.order_by(Record.created_at.desc())
        items = query.offset(offset).limit(limit).all()
        return items, total

    def get_deleted(
        self,
        user_id: uuid.UUID,
        limit: int,
        offset: int,
    ) -> tuple[list[Record], int]:
        query = (
            self.db.query(Record)
            .filter(
                Record.user_id == user_id,
                Record.deleted_at.is_not(None),
            )
            .order_by(Record.deleted_at.desc())
        )

        total = query.with_entities(func.count()).scalar()
        items = query.offset(offset).limit(limit).all()
        return items, total

    def get_by_id(
        self,
        record_id: uuid.UUID,
        user_id: uuid.UUID,
        include_deleted: bool = False,
    ):
        query = self.db.query(Record).filter(
            Record.id == record_id,
            Record.user_id == user_id,
        )

        if not include_deleted:
            query = query.filter(Record.deleted_at.is_(None))

        return query.first()

    def create(self, data: RecordCreate, user_id: uuid.UUID) -> Record:
        record = Record(**data.model_dump(), user_id=user_id)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def update(self, record: Record, data: RecordUpdate) -> Record:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(record, key, value)

        self.db.commit()
        self.db.refresh(record)
        return record

    def soft_delete(self, record: Record) -> None:
        record.deleted_at = datetime.now(UTC)
        self.db.commit()

    def restore(self, record: Record) -> Record:
        record.deleted_at = None
        self.db.commit()
        self.db.refresh(record)
        return record

    def permanent_delete(self, record: Record) -> None:
        self.db.delete(record)
        self.db.commit()
