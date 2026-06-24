# apps/api/app/users/router.py
import hmac
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id, get_optional_user_id
from app.core.config import settings
from app.core.database import get_db
from app.favorites.repository import FavoriteRepository
from app.favorites.share_schema import SharedFavoriteResponse
from app.records.router import get_record_service
from app.records.schema import PaginatedRecordResponse
from app.records.service import RecordService
from app.social.router import get_social_service
from app.social.service import SocialService
from app.users.repository import UserProfileRepository
from app.users.schema import SupabaseWebhookPayload, UserProfileResponse, UserProfileUpdate
from app.users.service import UserProfileService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_profile_service(db: Session = Depends(get_db)) -> UserProfileService:
    return UserProfileService(UserProfileRepository(db))


def get_favorite_repository(db: Session = Depends(get_db)) -> FavoriteRepository:
    return FavoriteRepository(db)


@router.post("/webhook/supabase", status_code=status.HTTP_200_OK)
async def supabase_webhook(
    request: Request,
    service: UserProfileService = Depends(get_user_profile_service),
    x_webhook_secret: str = Header(None),
):
    if not hmac.compare_digest(
        x_webhook_secret or "",
        settings.supabase_webhook_secret,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook secret"
        )

    body = await request.json()
    payload = SupabaseWebhookPayload(**body)

    if payload.type != "INSERT" or payload.table != "users":
        return {"message": "ignored"}

    record = payload.record
    user_id = uuid.UUID(record["id"])
    email = record.get("email", "")

    existing = service.repository.get_by_user_id(user_id)
    if not existing:
        service.create_from_email(user_id=user_id, email=email)

    return {"message": "ok"}


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(
    service: UserProfileService = Depends(get_user_profile_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.get_by_user_id(user_id)


@router.patch("/me", response_model=UserProfileResponse)
def update_my_profile(
    data: UserProfileUpdate,
    service: UserProfileService = Depends(get_user_profile_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.update(user_id, data)


@router.get("/u/{username}/favorites", response_model=list[SharedFavoriteResponse])
def get_public_favorites(
    username: str,
    service: UserProfileService = Depends(get_user_profile_service),
    social_service: SocialService = Depends(get_social_service),
    viewer_id: uuid.UUID | None = Depends(get_optional_user_id),
    db: Session = Depends(get_db),
):
    from app.favorites.model import Favorite
    from app.favorites.share_schema import SharedFavoriteResponse, SharedRecordResponse
    from app.records.model import Record

    profile = service.get_by_username(username)

    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    social_service.check_profile_access(profile, viewer_id)

    rows = (
        db.query(Favorite, Record)
        .join(Record, Favorite.record_id == Record.id)
        .filter(Favorite.user_id == profile.user_id, Record.deleted_at.is_(None))
        .all()
    )

    return [
        SharedFavoriteResponse(
            id=favorite.id,
            record_id=favorite.record_id,
            created_at=favorite.created_at,
            record=SharedRecordResponse.model_validate(record),
        )
        for favorite, record in rows
    ]


@router.get("/u/{username}/watchlist", response_model=PaginatedRecordResponse)
def get_public_watchlist(
    username: str,
    service: UserProfileService = Depends(get_user_profile_service),
    social_service: SocialService = Depends(get_social_service),
    record_service: RecordService = Depends(get_record_service),
    viewer_id: uuid.UUID | None = Depends(get_optional_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    profile = service.get_by_username(username)

    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    social_service.check_profile_access(profile, viewer_id)

    items, total = record_service.get_watchlist(profile.user_id, limit=limit, offset=offset)
    return PaginatedRecordResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )
