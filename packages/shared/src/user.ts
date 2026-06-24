// packages/shared/src/user.ts

export interface UserProfile {
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public_sharing_enabled: boolean;
  is_profile_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  username?: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  is_public_sharing_enabled?: boolean;
  is_profile_public?: boolean;
}
