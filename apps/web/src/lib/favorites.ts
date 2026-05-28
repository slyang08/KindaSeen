// apps/web/src/lib/favorites.ts
import { Favorite } from "@kindaseen/shared"

import { fetchWithAuth } from "@/lib/api"

export const favoritesApi = {
  getAll: (): Promise<Favorite[]> => fetchWithAuth("/favorites/"),

  add: (record_id: string): Promise<Favorite> =>
    fetchWithAuth("/favorites/", {
      method: "POST",
      body: JSON.stringify({ record_id }),
    }),

  remove: (record_id: string): Promise<null> =>
    fetchWithAuth(`/favorites/${record_id}`, { method: "DELETE" }),
}
