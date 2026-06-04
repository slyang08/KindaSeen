# app/users/stats_service.py
import uuid

from app.users.stats_repository import StatsRepository
from app.users.stats_schema import (
    GenreStat,
    MediaTypeStat,
    RatingBucket,
    UserStatsResponse,
)


class StatsService:
    def __init__(self, repo: StatsRepository):
        self.repo = repo

    def get_user_stats(self, user_id: uuid.UUID) -> UserStatsResponse:
        data = self.repo.get_user_stats(user_id)
        return UserStatsResponse(
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
