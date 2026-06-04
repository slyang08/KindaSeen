// packages/shared/src/stats.ts
export interface RatingBucket {
  label: string;
  count: number;
}

export interface GenreStat {
  name: string;
  count: number;
}

export interface MediaTypeStat {
  media_type: string;
  count: number;
}

export interface UserStatsResponse {
  total: number;
  by_status: Record<string, number>;
  avg_rating: number | null;
  rated_count: number;
  rating_distribution: RatingBucket[];
  top_genres: GenreStat[];
  by_media_type: MediaTypeStat[];
  this_year: number;
  last_30_days: number;
}
