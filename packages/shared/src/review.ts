// packages/shared/src/review.ts

export interface CommentResponse {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  id: string;
  record_id: string;
  user_id: string;
  title: string;
  content: string;
  is_public: boolean;
  rating: number | null;
  created_at: string;
  updated_at: string;
  comments: CommentResponse[];
}

export interface ReviewCreate {
  title: string;
  content: string;
  is_public?: boolean;
}

export interface ReviewUpdate {
  title?: string;
  content?: string;
  is_public?: boolean;
}

export interface CommentCreate {
  content: string;
}

export interface CommentUpdate {
  content?: string;
}
