# apps/api/app/activity/repository.py
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.activity.model import Activity
from app.social.model import Follow
from app.users.model import UserProfile


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_stmt(self):
        return (
            select(
                Activity,
                UserProfile.username,
                UserProfile.display_name,
                UserProfile.avatar_url,
            )
            .join(UserProfile, Activity.actor_id == UserProfile.user_id)
            .where(Activity.visibility == "public")
            .order_by(Activity.created_at.desc(), Activity.id.desc())
        )

    def _apply_cursor(self, stmt, before_id: uuid.UUID | None):
        if not before_id:
            return stmt
        cursor_stmt = select(Activity.created_at, Activity.id).where(Activity.id == before_id)
        cursor = self.db.execute(cursor_stmt).first()
        if not cursor:
            return stmt
        return stmt.where(
            (Activity.created_at < cursor.created_at)
            | ((Activity.created_at == cursor.created_at) & (Activity.id < before_id))
        )

    def _rows_to_dicts(self, rows) -> list[dict]:
        return [
            {
                "id": row.Activity.id,
                "actor_id": row.Activity.actor_id,
                "username": row.username,
                "display_name": row.display_name,
                "avatar_url": row.avatar_url,
                "activity_type": row.Activity.activity_type,
                "object_id": row.Activity.object_id,
                "object_type": row.Activity.object_type,
                "metadata": row.Activity.activity_metadata,
                "created_at": row.Activity.created_at,
            }
            for row in rows
        ]

    def get_feed(self, user_id: uuid.UUID, limit: int, before_id: uuid.UUID | None) -> list[dict]:
        stmt = self._base_stmt().where(
            Activity.actor_id.in_(select(Follow.following_id).where(Follow.follower_id == user_id))
        )
        stmt = self._apply_cursor(stmt, before_id)
        rows = self.db.execute(stmt.limit(limit)).all()
        return self._rows_to_dicts(rows)

    def get_user_activities(
        self,
        actor_id: uuid.UUID,
        limit: int,
        before_id: uuid.UUID | None,
        activity_types: list[str] | None = None,
    ) -> list[dict]:
        stmt = self._base_stmt().where(Activity.actor_id == actor_id)
        if activity_types:
            stmt = stmt.where(Activity.activity_type.in_(activity_types))
        stmt = self._apply_cursor(stmt, before_id)
        rows = self.db.execute(stmt.limit(limit)).all()
        return self._rows_to_dicts(rows)
