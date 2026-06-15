# apps/api/app/activity/service.py
import uuid

from sqlalchemy.orm import Session

from app.activity.model import Activity
from app.activity.repository import ActivityRepository


def record_activity(
    db: Session,
    actor_id: uuid.UUID,
    activity_type: str,
    object_id: uuid.UUID | None = None,
    object_type: str | None = None,
    metadata: dict | None = None,
) -> None:
    activity = Activity(
        actor_id=actor_id,
        activity_type=activity_type,
        object_id=object_id,
        object_type=object_type,
        activity_metadata=metadata,
    )
    db.add(activity)


class ActivityService:
    def __init__(self, repository: ActivityRepository):
        self.repository = repository

    def get_feed(self, user_id: uuid.UUID, limit: int, offset: int) -> list[dict]:
        return self.repository.get_feed(user_id, limit, offset)

    def get_user_activities(self, actor_id: uuid.UUID, limit: int, offset: int) -> list[dict]:
        return self.repository.get_user_activities(actor_id, limit, offset)
