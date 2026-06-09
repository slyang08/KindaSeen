# apps/api/app/tasks/tmdb_sync.py
import logging

import httpx
from sqlalchemy import select

from app.core.celery import celery_app
from app.core.database import SessionLocal
from app.records.model import Record
from app.tmdb.service import HEADERS, TMDB_BASE, TMDB_IMAGE_BASE

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.tmdb_sync.sync_all_records", bind=True, max_retries=3)
def sync_all_records(self):
    """每天凌晨同步所有 record 的 TMDB 資料"""
    db = SessionLocal()
    try:
        records = (
            db.execute(
                select(Record).where(Record.tmdb_id.is_not(None), Record.deleted_at.is_(None))
            )
            .scalars()
            .all()
        )

        updated = 0
        failed = 0

        for record in records:
            try:
                endpoint = "movie" if record.media_type == "movie" else "tv"
                url = f"{TMDB_BASE}/{endpoint}/{record.tmdb_id}"

                with httpx.Client() as client:
                    resp = client.get(url, headers=HEADERS, params={"language": "zh-TW"})
                    resp.raise_for_status()
                    data = resp.json()

                poster = data.get("poster_path")
                vote = data.get("vote_average")
                date = data.get("release_date") or data.get("first_air_date") or ""

                record.poster_url = f"{TMDB_IMAGE_BASE}{poster}" if poster else record.poster_url
                record.tmdb_rating = round(vote, 1) if vote else record.tmdb_rating
                record.release_year = int(date[:4]) if len(date) >= 4 else record.release_year

                updated += 1

            except Exception as e:
                logger.warning("Failed to sync record %s: %s", record.id, e)
                failed += 1
                continue

        db.commit()
        logger.info("TMDB sync complete: %d updated, %d failed", updated, failed)
        return {"updated": updated, "failed": failed}

    except Exception as exc:
        db.rollback()
        logger.error("TMDB sync task failed: %s", exc)
        raise self.retry(exc=exc, countdown=60) from exc
    finally:
        db.close()
