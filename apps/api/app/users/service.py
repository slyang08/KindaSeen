# apps/api/app/users/service.py
import re
import uuid

from fastapi import HTTPException, status

from app.users.model import UserProfile
from app.users.repository import UserProfileRepository
from app.users.schema import UserProfileUpdate

USERNAME_REGEX = re.compile(r"^[a-z0-9][a-z0-9_-]{1,48}[a-z0-9]$")


def _sanitize_email_prefix(email: str) -> str:
    prefix = email.split("@")[0]
    sanitized = re.sub(r"[^a-z0-9_-]", "", prefix.lower())
    if len(sanitized) < 3:
        sanitized = sanitized.ljust(3, "0")
    return sanitized[:50]


class UserProfileService:
    def __init__(self, repository: UserProfileRepository):
        self.repository = repository

    def get_by_user_id(self, user_id: uuid.UUID) -> UserProfile:
        profile = self.repository.get_by_user_id(user_id)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        return profile

    def get_by_username(self, username: str) -> UserProfile:
        profile = self.repository.get_by_username(username)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return profile

    def create_from_email(self, user_id: uuid.UUID, email: str) -> UserProfile:
        base_username = _sanitize_email_prefix(email)
        username = base_username
        counter = 2
        while self.repository.username_exists(username):
            username = f"{base_username}{counter}"
            counter += 1
        return self.repository.create(user_id=user_id, username=username)

    def update(self, user_id: uuid.UUID, data: UserProfileUpdate) -> UserProfile:
        profile = self.get_by_user_id(user_id)
        update_data = data.model_dump(exclude_none=True)

        if "username" in update_data:
            new_username = update_data["username"]
            if not USERNAME_REGEX.match(new_username):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Username can only contain lowercase letters, numbers, underscores, and hyphens",
                )
            if self.repository.username_taken_by_other(new_username, user_id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already taken",
                )

        return self.repository.update(profile, update_data)
