# apps/api/app/activity/router.py
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.activity.repository import ActivityRepository
from app.activity.schema import ActivityResponse
from app.activity.service import ActivityService
from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.users.repository import UserProfileRepository

router = APIRouter(prefix="/feed", tags=["activity"])


def get_activity_service(db: Session = Depends(get_db)) -> ActivityService:
    return ActivityService(ActivityRepository(db))


@router.get("/me", response_model=list[ActivityResponse])
def get_feed(
    service: ActivityService = Depends(get_activity_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
):
    return service.get_feed(user_id, limit, offset)


@router.get("/users/{username}", response_model=list[ActivityResponse])
def get_user_activities(
    username: str,
    service: ActivityService = Depends(get_activity_service),
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    user_profile_repo = UserProfileRepository(db)
    profile = user_profile_repo.get_by_username(username)
    return service.get_user_activities(profile.user_id, limit, offset)
