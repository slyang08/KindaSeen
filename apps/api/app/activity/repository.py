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

    def get_feed(self, user_id: uuid.UUID, limit: int, offset: int) -> list[dict]:
        stmt = (
            select(
                Activity,
                UserProfile.username,
                UserProfile.display_name,
                UserProfile.avatar_url,
            )
            .join(UserProfile, Activity.actor_id == UserProfile.user_id)
            .where(
                Activity.actor_id.in_(
                    select(Follow.following_id).where(Follow.follower_id == user_id)
                )
            )
            .where(Activity.visibility == "public")
            .order_by(Activity.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = self.db.execute(stmt).all()
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

    def get_user_activities(self, actor_id: uuid.UUID, limit: int, offset: int) -> list[dict]:
        stmt = (
            select(
                Activity,
                UserProfile.username,
                UserProfile.display_name,
                UserProfile.avatar_url,
            )
            .join(UserProfile, Activity.actor_id == UserProfile.user_id)
            .where(Activity.actor_id == actor_id)
            .where(Activity.visibility == "public")
            .order_by(Activity.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = self.db.execute(stmt).all()
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
