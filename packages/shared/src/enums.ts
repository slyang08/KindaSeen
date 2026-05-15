// packages/shared/src/enums.ts
export const MEDIA_TYPES = [
  "movie",
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
