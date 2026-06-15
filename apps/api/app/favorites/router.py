# apps/api/app/favorites/router.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.activity.service import record_activity
from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.favorites.repository import FavoriteRepository
from app.favorites.schema import FavoriteCreate, FavoriteResponse
from app.favorites.service import FavoriteService
from app.favorites.share_repository import FavoriteShareTokenRepository
from app.favorites.share_schema import (
    SharedFavoriteResponse,
    ShareExpiry,
    ShareTokenResponse,
)
from app.favorites.share_service import FavoriteShareService

router = APIRouter(prefix="/favorites", tags=["favorites"])


def get_favorite_service(db: Session = Depends(get_db)) -> FavoriteService:
    return FavoriteService(FavoriteRepository(db))


def get_share_service(db: Session = Depends(get_db)) -> FavoriteShareService:
    return FavoriteShareService(
        share_repository=FavoriteShareTokenRepository(db),
    )


@router.get("/", response_model=list[FavoriteResponse])
def get_favorites(
    service: FavoriteService = Depends(get_favorite_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.get_all(user_id)


@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    data: FavoriteCreate,
    service: FavoriteService = Depends(get_favorite_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = service.add(user_id, data.record_id)
    record_activity(
        db=db,
        actor_id=user_id,
        activity_type="favorite",
        object_id=result.record_id,
        object_type="record",
        metadata={"title": result.title, "media_type": result.media_type},
    )
    db.commit()
    return result


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    record_id: uuid.UUID,
    service: FavoriteService = Depends(get_favorite_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    service.remove(user_id, record_id)


@router.post(
    "/share/personal", response_model=ShareTokenResponse, status_code=status.HTTP_201_CREATED
)
def create_personal_share(
    expires_in: ShareExpiry,
    service: FavoriteShareService = Depends(get_share_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.create_token(owner_id=user_id, expires_in=expires_in)


@router.get("/share/p/{token}", response_model=list[SharedFavoriteResponse])
def get_shared_favorites(token: str, service: FavoriteShareService = Depends(get_share_service)):
    return service.get_shared_favorites(token)
