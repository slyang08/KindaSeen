# apps/api/app/social/service.py
import uuid

from fastapi import HTTPException, status

from app.social.repository import SocialRepository
from app.social.schema import PublicProfileResponse, UserSummary
from app.users.repository import UserProfileRepository


class SocialService:
    def __init__(self, social_repository: SocialRepository, user_repository: UserProfileRepository):
        self.social_repository = social_repository
        self.user_repository = user_repository

    def _check_profile_access(self, profile, current_user_id: uuid.UUID | None):
        # I can always view my own profile
        if current_user_id and current_user_id == profile.user_id:
            return
        # The profile is public; anyone can view it
        if profile.is_profile_public:
            return
        # The profile is private; only followers can view it
        if current_user_id and self.social_repository.is_following(
            current_user_id, profile.user_id
        ):
            return
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This profile is private")

    def _get_profile_or_404(self, username: str):
        profile = self.user_repository.get_by_username(username)
        if not profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return profile

    def follow(self, follower_id: uuid.UUID, username: str):
        target = self._get_profile_or_404(username)

        if target.user_id == follower_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself"
            )

        if self.social_repository.is_following(follower_id, target.user_id):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already following")

        return self.social_repository.follow(follower_id, target.user_id)

    def unfollow(self, follower_id: uuid.UUID, username: str):
        target = self._get_profile_or_404(username)
        self.social_repository.unfollow(follower_id, target.user_id)

    def get_followers(self, username: str) -> list[UserSummary]:
        target = self._get_profile_or_404(username)
        profiles = self.social_repository.get_followers(target.user_id)
        return [UserSummary.model_validate(p) for p in profiles]

    def get_following(self, username: str) -> list[UserSummary]:
        target = self._get_profile_or_404(username)
        profiles = self.social_repository.get_following(target.user_id)
        return [UserSummary.model_validate(p) for p in profiles]

    def get_public_profile(
        self, username: str, current_user_id: uuid.UUID | None
    ) -> PublicProfileResponse:
        profile = self._get_profile_or_404(username)

        self._check_profile_access(profile, current_user_id)

        return PublicProfileResponse(
            user_id=profile.user_id,
            username=profile.username,
            display_name=profile.display_name,
            avatar_url=profile.avatar_url,
            bio=profile.bio,
            followers_count=self.social_repository.get_followers_count(profile.user_id),
            following_count=self.social_repository.get_following_count(profile.user_id),
            is_following=(
                self.social_repository.is_following(current_user_id, profile.user_id)
                if current_user_id
                else False
            ),
        )

    async def get_public_stats(self, username: str, current_user_id: uuid.UUID | None, db):
        from app.users.stats_repository import StatsRepository
        from app.users.stats_service import StatsService

        profile = self._get_profile_or_404(username)
        self._check_profile_access(profile, current_user_id)

        stats_service = StatsService(StatsRepository(db))
        return await stats_service.get_user_stats(profile.user_id)
