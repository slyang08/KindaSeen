// packages/shared/src/shared-favorite.ts
export interface SharedRecord {
  id: string;
  title: string;
  media_type: string;
  status: string;
  release_year: number | null;
  season: number | null;
  episode: number | null;
  rating: number | null;
  poster_url: string | null;
  overview: string | null;
  genres: string[] | null;
}

export interface SharedFavorite {
  id: string;
  record_id: string;
  created_at: string;
  record: SharedRecord;
}
