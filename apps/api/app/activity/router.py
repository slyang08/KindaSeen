# apps/api/app/activity/router.py
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.activity.repository import ActivityRepository
from app.activity.schema import FeedResponse
from app.activity.service import ActivityService
from app.core.auth import get_current_user_id, get_optional_user_id
from app.core.database import get_db
from app.social.router import get_social_service
from app.social.service import SocialService
from app.users.repository import UserProfileRepository

router = APIRouter(prefix="/feed", tags=["activity"])

PUBLIC_ACTIVITY_TYPES = ["add_record", "rate", "favorite", "watchlist_add"]


def get_activity_service(db: Session = Depends(get_db)) -> ActivityService:
    return ActivityService(ActivityRepository(db))


@router.get("/me", response_model=FeedResponse)
def get_feed(
    service: ActivityService = Depends(get_activity_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=50),
    before_id: uuid.UUID | None = Query(default=None),
):
    items = service.get_feed(user_id, limit=limit + 1, before_id=before_id)
    has_more = len(items) > limit
    return {"items": items[:limit], "has_more": has_more}


@router.get("/users/{username}", response_model=FeedResponse)
def get_user_activities(
    username: str,
    service: ActivityService = Depends(get_activity_service),
    social_service: SocialService = Depends(get_social_service),
    viewer_id: uuid.UUID | None = Depends(get_optional_user_id),
    limit: int = Query(default=20, ge=1, le=50),
    before_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    user_profile_repository = UserProfileRepository(db)
    profile = user_profile_repository.get_by_username(username)

    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    social_service.check_profile_access(profile, viewer_id)

    items = service.get_user_activities(
        profile.user_id, limit=limit + 1, before_id=before_id, activity_types=PUBLIC_ACTIVITY_TYPES
    )
    has_more = len(items) > limit
    return {"items": items[:limit], "has_more": has_more}
