// apps/web/src/features/feed/queries.ts
import { useQuery } from "@tanstack/react-query"

import { getFeed, getUserActivities } from "@/lib/feed"

export const feedKeys = {
  all: ["feed"] as const,
  me: () => [...feedKeys.all, "me"] as const,
  user: (username: string) => [...feedKeys.all, "user", username] as const,
}

export function useFeed() {
  return useQuery({
    queryKey: feedKeys.me(),
    queryFn: () => getFeed(),
  })
}

export function useUserActivities(username: string) {
  return useQuery({
    queryKey: feedKeys.user(username),
    queryFn: () => getUserActivities(username),
    enabled: !!username,
  })
}
