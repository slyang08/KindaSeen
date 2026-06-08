# app/users/stats_service.py
import uuid

from app.core.cache import cache_delete, cache_get, cache_set
from app.users.stats_repository import StatsRepository
from app.users.stats_schema import (
    GenreStat,
    MediaTypeStat,
    RatingBucket,
    UserStatsResponse,
)

STATS_TTL = 300  # 5 mins


def _stats_key(user_id: uuid.UUID) -> str:
    return f"stats:{user_id}"


class StatsService:
    def __init__(self, repository: StatsRepository):
        self.repository = repository

    async def get_user_stats(self, user_id: uuid.UUID) -> UserStatsResponse:
        key = _stats_key(user_id)

        cached = await cache_get(key)
        if cached:
            return UserStatsResponse(**cached)

        data = self.repository.get_user_stats(user_id)
        result = UserStatsResponse(
            total=data["total"],
            by_status=data["by_status"],
            avg_rating=data["avg_rating"],
            rated_count=data["rated_count"],
            rating_distribution=[RatingBucket(**b) for b in data["rating_distribution"]],
            top_genres=[GenreStat(**g) for g in data["top_genres"]],
            by_media_type=[MediaTypeStat(**m) for m in data["by_media_type"]],
            this_year=data["this_year"],
            last_30_days=data["last_30_days"],
        )

        await cache_set(key, result.model_dump(), STATS_TTL)
        return result

    @staticmethod
    async def invalidate(user_id: uuid.UUID) -> None:
        await cache_delete(_stats_key(user_id))
