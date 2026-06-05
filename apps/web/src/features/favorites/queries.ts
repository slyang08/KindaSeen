// apps/web/src/features/favorites/queries.ts
import { ShareExpiry } from "@kindaseen/shared"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { favoritesApi } from "@/lib/favorites"

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.getAll(),
    enabled,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (record_id: string) => favoritesApi.add(record_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (record_id: string) => favoritesApi.remove(record_id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  })
}

export function useCreatePersonalShare() {
  return useMutation({
    mutationFn: (expires_in: ShareExpiry) => favoritesApi.createPersonalShare(expires_in),
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ record_id, isFavorite }: { record_id: string; isFavorite: boolean }) =>
      isFavorite ? favoritesApi.remove(record_id) : favoritesApi.add(record_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })
}
