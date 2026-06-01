// packages/shared/src/favorite.ts

export type Favorite = {
  id: string;
  user_id: string;
  record_id: string;
  created_at: string;
};

export type ShareExpiry = "1h" | "1d";

export interface ShareTokenResponse {
  token: string;
  expires_at: string;
  link: string;
}
