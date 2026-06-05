# apps/api/app/reviews/service.py
import uuid

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


class ReviewService:
    def __init__(self, repo: ReviewRepository, record_repo: RecordRepository):
        self.repo = repo
        self.record_repo = record_repo

    def _to_response(self, review) -> ReviewResponse:
        record = self.record_repo.get_by_id(review.record_id, review.user_id)
        return ReviewResponse(
            **{k: v for k, v in review.__dict__.items() if not k.startswith("_")},
            rating=record.rating if record else None,
        )

    # ── Review ───────────────────────────────────

    def get_by_record(self, record_id: uuid.UUID, user_id: uuid.UUID) -> ReviewResponse | None:
        review = self.repo.get_by_record(record_id, user_id)
        if not review:
            return None
        return self._to_response(review)

    def create(
        self, record_id: uuid.UUID, user_id: uuid.UUID, data: ReviewCreate
    ) -> ReviewResponse:
        review = self.repo.create(record_id, user_id, data)
        return self._to_response(review)

    def update(
        self, review_id: uuid.UUID, user_id: uuid.UUID, data: ReviewUpdate
    ) -> ReviewResponse:
        review = self.repo.update(review_id, user_id, data)
        return self._to_response(review)

    def delete(self, review_id: uuid.UUID, user_id: uuid.UUID) -> None:
        self.repo.delete(review_id, user_id)

    # ── Comment ──────────────────────────────────

    def create_comment(
        self, review_id: uuid.UUID, user_id: uuid.UUID, data: CommentCreate
    ) -> CommentResponse:
        comment = self.repo.create_comment(review_id, user_id, data)
        return CommentResponse.model_validate(comment)

    def update_comment(
        self, comment_id: uuid.UUID, user_id: uuid.UUID, data: CommentUpdate
    ) -> CommentResponse:
        comment = self.repo.update_comment(comment_id, user_id, data)
        return CommentResponse.model_validate(comment)

    def delete_comment(self, comment_id: uuid.UUID, user_id: uuid.UUID) -> None:
        self.repo.delete_comment(comment_id, user_id)
