# apps/api/app/reviews/repository.py
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.records.model import Record
from app.reviews.model import Comment, Review
from app.reviews.schema import CommentCreate, CommentUpdate, ReviewCreate, ReviewUpdate


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    def _get_review_or_404(self, review_id: uuid.UUID, user_id: uuid.UUID) -> Review:
        review = (
            self.db.query(Review)
            .options(joinedload(Review.comments))
            .filter(Review.id == review_id, Review.user_id == user_id)
            .first()
        )
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        return review

    def _get_record_or_404(self, record_id: uuid.UUID, user_id: uuid.UUID) -> Record:
        record = (
            self.db.query(Record)
            .filter(Record.id == record_id, Record.user_id == user_id, Record.deleted_at.is_(None))
            .first()
        )
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
        return record

    # ── Review CRUD ──────────────────────────────

    def get_by_record(self, record_id: uuid.UUID, user_id: uuid.UUID) -> Review | None:
        return (
            self.db.query(Review)
            .options(joinedload(Review.comments))
            .filter(Review.record_id == record_id, Review.user_id == user_id)
            .first()
        )

    def create(self, record_id: uuid.UUID, user_id: uuid.UUID, data: ReviewCreate) -> Review:
        self._get_record_or_404(record_id, user_id)

        existing = self.get_by_record(record_id, user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Review already exists for this record",
            )

        review = Review(record_id=record_id, user_id=user_id, **data.model_dump())
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        return review

    def update(self, review_id: uuid.UUID, user_id: uuid.UUID, data: ReviewUpdate) -> Review:
        review = self._get_review_or_404(review_id, user_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(review, key, value)
        self.db.commit()
        self.db.refresh(review)
        return review

    def delete(self, review_id: uuid.UUID, user_id: uuid.UUID) -> None:
        review = self._get_review_or_404(review_id, user_id)
        self.db.delete(review)
        self.db.commit()

    # ── Comment CRUD ─────────────────────────────

    def get_comment_or_404(self, comment_id: uuid.UUID, user_id: uuid.UUID) -> Comment:
        comment = (
            self.db.query(Comment)
            .filter(Comment.id == comment_id, Comment.user_id == user_id)
            .first()
        )
        if not comment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
        return comment

    def create_comment(
        self, review_id: uuid.UUID, user_id: uuid.UUID, data: CommentCreate
    ) -> Comment:
        review = self.db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

        comment = Comment(review_id=review_id, user_id=user_id, **data.model_dump())
        self.db.add(comment)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def update_comment(
        self, comment_id: uuid.UUID, user_id: uuid.UUID, data: CommentUpdate
    ) -> Comment:
        comment = self.get_comment_or_404(comment_id, user_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(comment, key, value)
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def delete_comment(self, comment_id: uuid.UUID, user_id: uuid.UUID) -> None:
        comment = self.get_comment_or_404(comment_id, user_id)
        self.db.delete(comment)
        self.db.commit()
