// apps/web/src/lib/tmdb.ts
import type { TMDBSearchResult } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export const tmdbApi = {
  search: async (q: string, mediaType?: "movie" | "tv"): Promise<TMDBSearchResult[]> => {
    const params = new URLSearchParams({ q })
    if (mediaType) params.append("media_type", mediaType)
    const res = await fetchWithAuth(`${API_BASE}/tmdb/search?${params}`)
    return res.json()
  },
}
