# apps/api/app/favorites/share_service.py
import uuid
from datetime import datetime, timedelta

from fastapi import HTTPException, status

from app.core.config import settings
from app.favorites.share_model import FavoriteShareToken
from app.favorites.share_repository import FavoriteShareTokenRepository
from app.favorites.share_schema import (
    SharedFavoriteResponse,
    SharedRecordResponse,
    ShareExpiry,
    ShareTokenResponse,
)

EXPIRY_MAP = {
    ShareExpiry.ONE_HOUR: timedelta(hours=1),
    ShareExpiry.ONE_DAY: timedelta(days=1),
}


class FavoriteShareService:
    def __init__(
        self,
        share_repository: FavoriteShareTokenRepository,
    ):
        self.share_repository = share_repository

    def create_token(self, owner_id: uuid.UUID, expires_in: ShareExpiry) -> ShareTokenResponse:
        expires_at = datetime.utcnow() + EXPIRY_MAP[expires_in]
        token_obj = self.share_repository.create(owner_id=owner_id, expires_at=expires_at)
        return ShareTokenResponse(
            token=token_obj.token,
            expires_at=token_obj.expires_at,
            link=f"{settings.base_url}/share/p/{token_obj.token}",
        )

    def get_shared_favorites(self, token: str) -> list[SharedFavoriteResponse]:
        token_obj = self._validate_token(token)
        rows = self.share_repository.get_favorites_with_records(token_obj.owner_id)
        return [
            SharedFavoriteResponse(
                id=favorite.id,
                record_id=favorite.record_id,
                created_at=favorite.created_at,
                record=SharedRecordResponse.model_validate(record),
            )
            for favorite, record in rows
        ]

    def _validate_token(self, token: str) -> FavoriteShareToken:
        token_obj = self.share_repository.get_by_token(token)

        if not token_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid link")

        if datetime.utcnow() > token_obj.expires_at:
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Link has expired")

        return token_obj
