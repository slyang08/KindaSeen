# apps/api/app/favorites/service.py
import uuid

from fastapi import HTTPException, status

from app.favorites.model import Favorite
from app.favorites.repository import FavoriteRepository


class FavoriteService:
    def __init__(self, repository: FavoriteRepository):
        self.repository = repository

    def get_all(self, user_id: uuid.UUID) -> list[Favorite]:
        return self.repository.get_all(user_id)

    def add(self, user_id: uuid.UUID, record_id: uuid.UUID) -> Favorite:
        existing = self.repository.get(user_id, record_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already favorited")
        return self.repository.create(user_id, record_id)

    def remove(self, user_id: uuid.UUID, record_id: uuid.UUID) -> None:
        favorite = self.repository.get(user_id, record_id)
        if not favorite:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")
        self.repository.delete(favorite)
