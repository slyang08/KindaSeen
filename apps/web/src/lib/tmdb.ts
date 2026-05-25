// apps/web/src/lib/tmdb.ts
import type { TMDBSearchResult } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export const tmdbApi = {
  search: async (q: string, mediaType?: "movie" | "tv"): Promise<TMDBSearchResult[]> => {
    const params = new URLSearchParams({ q })
    if (mediaType) params.append("media_type", mediaType)
    return fetchWithAuth(`/tmdb/search?${params}`)
  },
}
