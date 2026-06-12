# apps/api/app/social/repository.py
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.social.model import Follow
from app.users.model import UserProfile


class SocialRepository:
    def __init__(self, db: Session):
        self.db = db

    def follow(self, follower_id: uuid.UUID, following_id: uuid.UUID) -> Follow:
        follow = Follow(follower_id=follower_id, following_id=following_id)
        self.db.add(follow)
        self.db.commit()
        self.db.refresh(follow)
        return follow

    def unfollow(self, follower_id: uuid.UUID, following_id: uuid.UUID) -> None:
        follow = self.db.execute(
            select(Follow).where(
                Follow.follower_id == follower_id,
                Follow.following_id == following_id,
            )
        ).scalar_one_or_none()
        if follow:
            self.db.delete(follow)
            self.db.commit()

    def is_following(self, follower_id: uuid.UUID, following_id: uuid.UUID) -> bool:
        return (
            self.db.execute(
                select(Follow).where(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id,
                )
            ).scalar_one_or_none()
            is not None
        )

    def get_followers(self, user_id: uuid.UUID) -> list[UserProfile]:
        return (
            self.db.execute(
                select(UserProfile)
                .join(Follow, Follow.follower_id == UserProfile.user_id)
                .where(Follow.following_id == user_id)
            )
            .scalars()
            .all()
        )

    def get_following(self, user_id: uuid.UUID) -> list[UserProfile]:
        return (
            self.db.execute(
                select(UserProfile)
                .join(Follow, Follow.following_id == UserProfile.user_id)
                .where(Follow.follower_id == user_id)
            )
            .scalars()
            .all()
        )

    def get_followers_count(self, user_id: uuid.UUID) -> int:
        return self.db.execute(
            select(func.count()).where(Follow.following_id == user_id)
        ).scalar_one()

    def get_following_count(self, user_id: uuid.UUID) -> int:
        return self.db.execute(
            select(func.count()).where(Follow.follower_id == user_id)
        ).scalar_one()
