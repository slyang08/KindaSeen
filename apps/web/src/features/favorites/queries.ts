// apps/web/src/features/favorites/queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { favoritesApi } from "@/lib/favorites"

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesApi.getAll(),
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
