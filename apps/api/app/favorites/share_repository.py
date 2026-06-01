# apps/api/app/favorites/share_repository.py
import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.favorites.model import Favorite
from app.favorites.share_model import FavoriteShareToken
from app.records.model import Record


class FavoriteShareTokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, owner_id: uuid.UUID, expires_at: datetime) -> FavoriteShareToken:
        token = FavoriteShareToken(owner_id=owner_id, expires_at=expires_at)
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_by_token(self, token: str) -> FavoriteShareToken | None:
        return self.db.query(FavoriteShareToken).filter(FavoriteShareToken.token == token).first()

    def get_favorites_with_records(self, owner_id: uuid.UUID) -> list[tuple[Favorite, Record]]:
        return (
            self.db.query(Favorite, Record)
            .join(Record, Favorite.record_id == Record.id)
            .filter(Favorite.user_id == owner_id, Record.deleted_at.is_(None))
            .all()
        )
