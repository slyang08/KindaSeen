# apps/api/app/favorites/repository.py
import uuid

from sqlalchemy.orm import Session

from app.favorites.model import Favorite


class FavoriteRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, user_id: uuid.UUID) -> list[Favorite]:
        return self.db.query(Favorite).filter(Favorite.user_id == user_id).all()

    def get(self, user_id: uuid.UUID, record_id: uuid.UUID) -> Favorite | None:
        return (
            self.db.query(Favorite)
            .filter(Favorite.user_id == user_id, Favorite.record_id == record_id)
            .first()
        )

    def create(self, user_id: uuid.UUID, record_id: uuid.UUID) -> Favorite:
        favorite = Favorite(user_id=user_id, record_id=record_id)
        self.db.add(favorite)
        self.db.commit()
        self.db.refresh(favorite)
        return favorite

    def delete(self, favorite: Favorite) -> None:
        self.db.delete(favorite)
        self.db.commit()
