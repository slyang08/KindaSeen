// packages/shared/src/feed.ts
export type ActivityType =
  | "follow"
  | "add_record"
  | "rate"
  | "watchlist_add"
  | "review"
  | "favorite";

export interface ActivityMetadata {
  title?: string;
  media_type?: string;
  rating?: number;
  followed_username?: string;
}

export interface Activity {
  id: string;
  actor_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  activity_type: ActivityType;
  object_id: string | null;
  object_type: string | null;
  metadata: ActivityMetadata | null;
  created_at: string;
}
