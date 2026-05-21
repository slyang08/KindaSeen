// packages/shared/src/record.ts
import type { MediaType, Status } from "./enums";

export type Record = {
  id: string;
  user_id: string;
  title: string;
  media_type: MediaType;
  status: Status;
  season: number;
  episode: number;
  rating: number | null;
  notes: string | null;
  tmdb_id: number | null;
  poster_url: string | null;
  overview: string | null;
  tmdb_rating: number | null;
  genres: string[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type RecordCreate = {
  title: string;
  media_type: MediaType;
  status: Status;
  season: number;
  episode: number;
  rating?: number | null;
  notes?: string | null;
  tmdb_id?: number | null;
  poster_url?: string | null;
  overview?: string | null;
  tmdb_rating?: number | null;
  genres?: string[] | null;
};

export type RecordUpdate = Partial<RecordCreate>;

export type TMDBSearchResult = {
  tmdb_id: number;
  title: string;
  media_type: "movie" | "tv";
  poster_url: string | null;
  overview: string;
  tmdb_rating: number | null;
  genres: string[];
  release_year: string | null;
};
