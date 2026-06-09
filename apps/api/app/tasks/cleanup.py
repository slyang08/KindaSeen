# apps/api/app/tasks/cleanup.py
import logging
import uuid

from sqlalchemy import select

from app.core.celery import celery_app
from app.core.database import SessionLocal
from app.records.model import Record

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.cleanup.permanent_delete_record", bind=True, max_retries=3)
def permanent_delete_record(self, record_id: str, user_id: str):
    "Permanently deleted after 30 days."
    db = SessionLocal()
    try:
        record = db.execute(
            select(Record).where(
                Record.id == uuid.UUID(record_id),
                Record.user_id == uuid.UUID(user_id),
                Record.deleted_at.is_not(None),
            )
        ).scalar_one_or_none()

        if not record:
            logger.info("Record %s already permanently deleted or restored", record_id)
            return {"status": "skipped"}

        db.delete(record)
        db.commit()
        logger.info("Permanently deleted record %s", record_id)
        return {"status": "deleted", "record_id": record_id}

    except Exception as exc:
        db.rollback()
        logger.error("Cleanup task failed for record %s: %s", record_id, exc)
        raise self.retry(exc=exc, countdown=60) from exc
    finally:
        db.close()
