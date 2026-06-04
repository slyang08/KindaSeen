# app/users/stats_repository.py
import uuid
from datetime import datetime, timedelta

from sqlalchemy import case, func, text
from sqlalchemy.orm import Session

from app.records.model import Record


class StatsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_stats(self, user_id: uuid.UUID) -> dict:
        now = datetime.utcnow()
        start_of_year = datetime(now.year, 1, 1)
        thirty_days_ago = now - timedelta(days=30)

        # Query 1: Key statistics
        row = (
            self.db.query(
                func.count().label("total"),
                func.count(Record.rating).label("rated_count"),
                func.avg(Record.rating).label("avg_rating"),
                func.sum(case((Record.status == "watching", 1), else_=0)).label("watching"),
                func.sum(case((Record.status == "completed", 1), else_=0)).label("completed"),
                func.sum(case((Record.status == "dropped", 1), else_=0)).label("dropped"),
                func.sum(case((Record.status == "want_to_watch", 1), else_=0)).label(
                    "want_to_watch"
                ),
                func.sum(case((Record.created_at >= start_of_year, 1), else_=0)).label("this_year"),
                func.sum(case((Record.created_at >= thirty_days_ago, 1), else_=0)).label(
                    "last_30_days"
                ),
                func.sum(case((Record.rating <= 3, 1), else_=0)).label("bucket_1_3"),
                func.sum(case((Record.rating.between(4, 6), 1), else_=0)).label("bucket_4_6"),
                func.sum(case((Record.rating.between(7, 9), 1), else_=0)).label("bucket_7_9"),
                func.sum(case((Record.rating == 10, 1), else_=0)).label("bucket_10"),
            )
            .filter(Record.user_id == user_id, Record.deleted_at.is_(None))
            .one()
        )

        # Query 2: top genres（unnest array）
        genre_rows = (
            self.db.query(
                func.unnest(Record.genres).label("genre"),
                func.count().label("count"),
            )
            .filter(Record.user_id == user_id, Record.deleted_at.is_(None))
            .group_by(text("genre"))
            .order_by(func.count().desc())
            .limit(5)
            .all()
        )

        # Query 3: by media_type
        media_type_rows = (
            self.db.query(Record.media_type, func.count().label("count"))
            .filter(Record.user_id == user_id, Record.deleted_at.is_(None))
            .group_by(Record.media_type)
            .order_by(func.count().desc())
            .all()
        )

        return {
            "total": row.total,
            "by_status": {
                "watching": row.watching,
                "completed": row.completed,
                "dropped": row.dropped,
                "want_to_watch": row.want_to_watch,
            },
            "avg_rating": float(row.avg_rating) if row.avg_rating is not None else None,
            "rated_count": row.rated_count,
            "rating_distribution": [
                {"label": "1-3", "count": row.bucket_1_3},
                {"label": "4-6", "count": row.bucket_4_6},
                {"label": "7-9", "count": row.bucket_7_9},
                {"label": "10", "count": row.bucket_10},
            ],
            "top_genres": [{"name": g.genre, "count": g.count} for g in genre_rows],
            "by_media_type": [
                {"media_type": r.media_type, "count": r.count} for r in media_type_rows
            ],
            "this_year": row.this_year,
            "last_30_days": row.last_30_days,
        }
