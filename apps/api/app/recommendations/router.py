# apps/api/app/recommendations/router.py
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.recommendations.schema import PaginatedRecommendationResponse
from app.recommendations.service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


def get_recommendation_service(db: Session = Depends(get_db)) -> RecommendationService:
    return RecommendationService(db)


@router.get("", response_model=PaginatedRecommendationResponse)
async def get_recommendations(
    service: RecommendationService = Depends(get_recommendation_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    items, total = await service.get_recommendations(user_id, limit=limit, offset=offset)
    return PaginatedRecommendationResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
        has_more=offset + limit < total,
    )
