// apps/web/src/features/watchlist/queries.ts
import { useQuery } from "@tanstack/react-query"

import { getPublicWatchlist } from "@/lib/users"

export function usePublicWatchlist(username: string) {
  return useQuery({
    queryKey: ["watchlist", "public", username],
    queryFn: () => getPublicWatchlist(username, 3, 0),
    enabled: !!username,
  })
}
