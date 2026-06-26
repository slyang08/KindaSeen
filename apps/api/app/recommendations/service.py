# apps/api/app/recommendations/service.py
import uuid

from app.favorites.model import Favorite
from app.recommendations.schema import RecommendationItem, RecommendationReason
from app.records.model import Record
from app.tmdb.service import get_tmdb_popular, get_tmdb_recommendations

DB_TO_TMDB_MEDIA_TYPE = {
    "movie": "movie",
    "variety": "tv",
    "drama": "tv",
}

HIGH_RATING_THRESHOLD = 7
TOP_RATING_THRESHOLD = 9

WEIGHT_TOP_RATING = 3.0
WEIGHT_HIGH_RATING = 2.0
WEIGHT_FAVORITE = 1.5

MAX_SEEDS = 8


def _reason_sort_key(reason: RecommendationReason) -> tuple[int, float]:
    """
    The larger the number, the higher the priority.
    high_rating always takes precedence over favorite,
    Compare ratings within the same category
    """
    type_priority = {"high_rating": 1, "favorite": 0, "popular_fallback": -1}
    return (type_priority.get(reason.type, -1), reason.source_rating or 0)


class RecommendationService:
    def __init__(self, db):
        self.db = db

    def _select_seeds(self, user_id: uuid.UUID) -> list[tuple[Record, float, str]]:
        """Returns list of (record, weight, reason_type)"""
        seeds: list[tuple[Record, float, str]] = []

        # Rating-based seeds
        rated_records = (
            self.db.query(Record)
            .filter(
                Record.user_id == user_id,
                Record.deleted_at.is_(None),
                Record.rating.isnot(None),
                Record.rating >= HIGH_RATING_THRESHOLD,
                Record.media_type.in_(DB_TO_TMDB_MEDIA_TYPE.keys()),
            )
            .order_by(Record.rating.desc())
            .limit(MAX_SEEDS)
            .all()
        )

        for r in rated_records:
            weight = WEIGHT_TOP_RATING if r.rating >= TOP_RATING_THRESHOLD else WEIGHT_HIGH_RATING
            seeds.append((r, weight, "high_rating"))

        # Favorite-based seeds (only if not already a rating-seed, and only to fill remaining slots)
        if len(seeds) < MAX_SEEDS:
            seed_record_ids = {r.id for r, _, _ in seeds}
            remaining = MAX_SEEDS - len(seeds)

            favorite_records = (
                self.db.query(Record)
                .join(Favorite, Favorite.record_id == Record.id)
                .filter(
                    Favorite.user_id == user_id,
                    Record.deleted_at.is_(None),
                    Record.media_type.in_(DB_TO_TMDB_MEDIA_TYPE.keys()),
                    Record.id.notin_(seed_record_ids) if seed_record_ids else True,
                )
                .limit(remaining)
                .all()
            )

            for r in favorite_records:
                seeds.append((r, WEIGHT_FAVORITE, "favorite"))

        return seeds

    def _get_exclusion_set(self, user_id: uuid.UUID) -> set[int]:
        """tmdb_ids already in user's records (any status) — covers watched + watchlist"""
        rows = (
            self.db.query(Record.tmdb_id)
            .filter(Record.user_id == user_id, Record.deleted_at.is_(None))
            .all()
        )
        return {row[0] for row in rows if row[0] is not None}

    async def _get_popular_fallback(
        self, exclude_ids: set[int], limit: int, offset: int
    ) -> tuple[list[RecommendationItem], int]:
        results = await get_tmdb_popular(media_type="movie", page=1)
        filtered = [r for r in results if r.tmdb_id not in exclude_ids]

        items = [
            RecommendationItem(
                tmdb_id=rdm.tmdb_id,
                media_type=rdm.media_type,
                title=rdm.title,
                poster_url=rdm.poster_url,
                overview=rdm.overview,
                tmdb_rating=rdm.tmdb_rating,
                release_year=rdm.release_year,
                genres=rdm.genres,
                score=0.0,
                reasons=[RecommendationReason(type="popular_fallback")],
            )
            for rdm in filtered
        ]

        total = len(items)
        return items[offset : offset + limit], total

    async def get_recommendations(
        self, user_id: uuid.UUID, limit: int, offset: int
    ) -> tuple[list[RecommendationItem], int]:
        seeds = self._select_seeds(user_id)
        exclude_ids = self._get_exclusion_set(user_id)

        if not seeds:
            # Fallback: no personalization signal available yet
            return await self._get_popular_fallback(exclude_ids, limit, offset)

        # candidate tmdb_id -> accumulated data
        candidates: dict[int, dict] = {}

        for record, weight, reason_type in seeds:
            tmdb_media_type = DB_TO_TMDB_MEDIA_TYPE[record.media_type]
            tmdb_results = await get_tmdb_recommendations(record.tmdb_id, tmdb_media_type)

            for rank, result in enumerate(tmdb_results):
                if result.tmdb_id in exclude_ids:
                    continue

                rank_score = weight * (1.0 / (rank + 1))

                if result.tmdb_id not in candidates:
                    candidates[result.tmdb_id] = {
                        "result": result,
                        "score": 0.0,
                        "reasons": [],
                    }

                candidates[result.tmdb_id]["score"] += rank_score
                candidates[result.tmdb_id]["reasons"].append(
                    RecommendationReason(
                        type=reason_type,
                        source_record_id=record.id,
                        source_title=record.title,
                        source_rating=record.rating,
                    )
                )

        sorted_candidates = sorted(candidates.values(), key=lambda c: c["score"], reverse=True)

        items = [
            RecommendationItem(
                tmdb_id=c["result"].tmdb_id,
                media_type=c["result"].media_type,
                title=c["result"].title,
                poster_url=c["result"].poster_url,
                overview=c["result"].overview,
                tmdb_rating=c["result"].tmdb_rating,
                release_year=c["result"].release_year,
                genres=c["result"].genres,
                score=c["score"],
                reasons=[max(c["reasons"], key=_reason_sort_key)],
            )
            for c in sorted_candidates
        ]

        total = len(items)
        page_items = items[offset : offset + limit]
        return page_items, total
