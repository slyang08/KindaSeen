# apps/api/app/favorites/router.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.favorites.repository import FavoriteRepository
from app.favorites.schema import FavoriteCreate, FavoriteResponse
from app.favorites.service import FavoriteService

router = APIRouter(prefix="/favorites", tags=["favorites"])


def get_favorite_service(db: Session = Depends(get_db)) -> FavoriteService:
    return FavoriteService(FavoriteRepository(db))


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
):
    return service.add(user_id, data.record_id)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    record_id: uuid.UUID,
    service: FavoriteService = Depends(get_favorite_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    service.remove(user_id, record_id)
