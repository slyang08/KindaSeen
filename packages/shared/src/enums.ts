// packages/shared/src/enums.ts
export const MEDIA_TYPES = [
  "movie",
  "variety",
  "drama",
  "anime",
  "manga",
  "novel",
  "podcast",
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const STATUSES = [
  "completed",
  "watching",
  "dropped",
  "want_to_watch",
] as const;
export type Status = (typeof STATUSES)[number];

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  movie: "Movie",
  drama: "Drama",
  anime: "Anime",
  variety: "Variety",
  manga: "Manga",
  novel: "Novel",
  podcast: "Podcast",
};

export const STATUS_LABELS: Record<Status, string> = {
  completed: "Completed",
  watching: "Watching",
  dropped: "Dropped",
  want_to_watch: "Want to Watch",
};
