# app/users/stats_router.py
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.users.stats_repository import StatsRepository
from app.users.stats_schema import UserStatsResponse
from app.users.stats_service import StatsService

router = APIRouter(prefix="/users", tags=["stats"])


def get_stats_service(db: Session = Depends(get_db)) -> StatsService:
    return StatsService(StatsRepository(db))


@router.get("/me/stats", response_model=UserStatsResponse)
async def get_my_stats(
    service: StatsService = Depends(get_stats_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return await service.get_user_stats(user_id)
