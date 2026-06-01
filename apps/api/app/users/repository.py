# apps/api/app/users/repository.py
import uuid

from sqlalchemy.orm import Session

from app.users.model import UserProfile


class UserProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> UserProfile | None:
        return self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    def get_by_username(self, username: str) -> UserProfile | None:
        return self.db.query(UserProfile).filter(UserProfile.username == username).first()

    def username_exists(self, username: str) -> bool:
        return self.get_by_username(username) is not None

    def username_taken_by_other(self, username: str, user_id: uuid.UUID) -> bool:
        profile = self.get_by_username(username)
        if not profile:
            return False
        return profile.user_id != user_id

    def create(self, user_id: uuid.UUID, username: str) -> UserProfile:
        profile = UserProfile(user_id=user_id, username=username)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def update(self, profile: UserProfile, data: dict) -> UserProfile:
        for key, value in data.items():
            setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile
