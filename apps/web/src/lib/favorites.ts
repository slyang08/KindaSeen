// apps/web/src/lib/favorites.ts
import { Favorite, ShareExpiry, ShareTokenResponse } from "@kindaseen/shared"

import { API_URL, fetchWithAuth } from "@/lib/api"

export const favoritesApi = {
  getAll: (): Promise<Favorite[]> => fetchWithAuth("/favorites/"),

  add: (record_id: string): Promise<Favorite> =>
    fetchWithAuth("/favorites/", {
      method: "POST",
      body: JSON.stringify({ record_id }),
    }),

  remove: (record_id: string): Promise<null> =>
    fetchWithAuth(`/favorites/${record_id}`, { method: "DELETE" }),

  createPersonalShare: (expires_in: ShareExpiry): Promise<ShareTokenResponse> =>
    fetchWithAuth(`/favorites/share/personal?expires_in=${expires_in}`, {
      method: "POST",
    }),
}

export async function getSharedFavorites(token: string) {
  const res = await fetch(`${API_URL}/favorites/share/p/${token}`)
  if (res.status === 404) throw new Error("Invalid link")
  if (res.status === 410) throw new Error("This link has expired")
  if (!res.ok) throw new Error("Failed to fetch favorites")
  return res.json()
}
