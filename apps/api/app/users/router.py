# apps/api/app/users/router.py
import hmac
import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.config import settings
from app.core.database import get_db
from app.favorites.repository import FavoriteRepository
from app.favorites.share_schema import SharedFavoriteResponse
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
    db: Session = Depends(get_db),
):
    from app.favorites.model import Favorite
    from app.favorites.share_schema import SharedFavoriteResponse, SharedRecordResponse
    from app.records.model import Record

    profile = service.get_by_username(username)

    if not profile.is_public_sharing_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="This user's favorites are not public"
        )

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
