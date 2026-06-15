# apps/api/app/reviews/router.py
import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.activity.service import record_activity
from app.core.auth import get_current_user_id
from app.core.database import get_db
from app.records.repository import RecordRepository
from app.reviews.repository import ReviewRepository
from app.reviews.schema import (
    CommentCreate,
    CommentResponse,
    CommentUpdate,
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)
from app.reviews.service import ReviewService

router = APIRouter(tags=["reviews"])


def get_review_service(db: Session = Depends(get_db)) -> ReviewService:
    return ReviewService(ReviewRepository(db), RecordRepository(db))


# ── Review ───────────────────────────────────────


@router.get("/records/{record_id}/review", response_model=ReviewResponse | None)
def get_review(
    record_id: uuid.UUID,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.get_by_record(record_id, user_id)


@router.post(
    "/records/{record_id}/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    record_id: uuid.UUID,
    data: ReviewCreate,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.create(record_id, user_id, data)


@router.patch("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: uuid.UUID,
    data: ReviewUpdate,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    result = service.update(review_id, user_id, data)
    record_activity(
        db=db,
        actor_id=user_id,
        activity_type="review",
        object_id=result.record_id,
        object_type="record",
        metadata={"title": result.title},
    )
    db.commit()
    return result


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: uuid.UUID,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    service.delete(review_id, user_id)


# ── Comment ──────────────────────────────────────


@router.post(
    "/reviews/{review_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    review_id: uuid.UUID,
    data: CommentCreate,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.create_comment(review_id, user_id, data)


@router.patch("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: uuid.UUID,
    data: CommentUpdate,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    return service.update_comment(comment_id, user_id, data)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: uuid.UUID,
    service: ReviewService = Depends(get_review_service),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    service.delete_comment(comment_id, user_id)
