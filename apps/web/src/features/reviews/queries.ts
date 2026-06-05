// apps/web/src/features/reviews/queries.ts
import type { CommentCreate, CommentUpdate, ReviewCreate, ReviewUpdate } from "@kindaseen/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { reviewsApi } from "@/lib/reviews"

export const reviewKeys = {
  byRecord: (recordId: string) => ["reviews", "record", recordId] as const,
}

export function useReview(recordId: string, enabled = true) {
  return useQuery({
    queryKey: reviewKeys.byRecord(recordId),
    queryFn: () => reviewsApi.getByRecord(recordId),
    enabled,
  })
}

export function useCreateReview(recordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReviewCreate) => reviewsApi.create(recordId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byRecord(recordId) }),
  })
}

export function useUpdateReview(recordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReviewUpdate }) =>
      reviewsApi.update(reviewId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byRecord(recordId) }),
  })
}

export function useDeleteReview(recordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byRecord(recordId) }),
  })
}

export function useCreateComment(recordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: CommentCreate }) =>
      reviewsApi.createComment(reviewId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byRecord(recordId) }),
  })
}

export function useUpdateComment(recordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: CommentUpdate }) =>
      reviewsApi.updateComment(commentId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byRecord(recordId) }),
  })
}

export function useDeleteComment(recordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => reviewsApi.deleteComment(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.byRecord(recordId) }),
  })
}
