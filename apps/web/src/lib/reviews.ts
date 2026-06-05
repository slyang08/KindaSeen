// apps/web/src/lib/reviews.ts
import type {
  CommentCreate,
  CommentResponse,
  CommentUpdate,
  ReviewCreate,
  ReviewResponse,
  ReviewUpdate,
} from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export const reviewsApi = {
  getByRecord: (recordId: string): Promise<ReviewResponse | null> =>
    fetchWithAuth(`/records/${recordId}/review`),

  create: (recordId: string, data: ReviewCreate): Promise<ReviewResponse> =>
    fetchWithAuth(`/records/${recordId}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (reviewId: string, data: ReviewUpdate): Promise<ReviewResponse> =>
    fetchWithAuth(`/reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (reviewId: string): Promise<null> =>
    fetchWithAuth(`/reviews/${reviewId}`, { method: "DELETE" }),

  createComment: (reviewId: string, data: CommentCreate): Promise<CommentResponse> =>
    fetchWithAuth(`/reviews/${reviewId}/comments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateComment: (commentId: string, data: CommentUpdate): Promise<CommentResponse> =>
    fetchWithAuth(`/comments/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteComment: (commentId: string): Promise<null> =>
    fetchWithAuth(`/comments/${commentId}`, { method: "DELETE" }),
}
