# apps/api/app/social/router.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.activity.service import record_activity
from app.core.auth import get_current_user_id, get_optional_user_id
from app.core.database import get_db
from app.social.repository import SocialRepository
from app.social.schema import PublicProfileResponse, UserSummary
from app.social.service import SocialService
from app.users.repository import UserProfileRepository

router = APIRouter(prefix="/users", tags=["social"])


def get_social_service(db: Session = Depends(get_db)) -> SocialService:
    return SocialService(SocialRepository(db), UserProfileRepository(db))


@router.post("/{username}/follow", status_code=status.HTTP_201_CREATED)
def follow_user(
    username: str,
    service: SocialService = Depends(get_social_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = service.follow(user_id, username)
    record_activity(
        db=db, actor_id=user_id, activity_type="follow", metadata={"followed_username": username}
    )
    db.commit()
    return result


@router.delete("/{username}/follow", status_code=status.HTTP_204_NO_CONTENT)
def unfollow_user(
    username: str,
    service: SocialService = Depends(get_social_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    service.unfollow(user_id, username)


@router.get("/{username}/followers", response_model=list[UserSummary])
def get_followers(
    username: str,
    service: SocialService = Depends(get_social_service),
):
    return service.get_followers(username)


@router.get("/{username}/following", response_model=list[UserSummary])
def get_following(
    username: str,
    service: SocialService = Depends(get_social_service),
):
    return service.get_following(username)


@router.get("/{username}/profile", response_model=PublicProfileResponse)
def get_public_profile(
    username: str,
    service: SocialService = Depends(get_social_service),
    user_id: uuid.UUID | None = Depends(get_optional_user_id),
):
    return service.get_public_profile(username, user_id)


@router.get("/{username}/stats")
async def get_public_stats(
    username: str,
    service: SocialService = Depends(get_social_service),
    user_id: uuid.UUID | None = Depends(get_optional_user_id),
    db: Session = Depends(get_db),
):
    return await service.get_public_stats(username, user_id, db)
