// apps/web/src/features/feed/queries.ts
import { useInfiniteQuery } from "@tanstack/react-query"

import { getFeed, getUserActivities, getUserFeed } from "@/lib/feed"

export const feedKeys = {
  all: ["feed"] as const,
  me: () => [...feedKeys.all, "me"] as const,
  user: (username: string) => [...feedKeys.all, "user", username] as const,
}

export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKeys.me(),
    queryFn: ({ pageParam }) => getFeed(20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined
      return lastPage.items.at(-1)?.id
    },
  })
}

export function useUserFeed(username: string) {
  return useInfiniteQuery({
    queryKey: feedKeys.user(username),
    queryFn: ({ pageParam }) => getUserFeed(username, 20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined
      return lastPage.items.at(-1)?.id
    },
    enabled: !!username,
  })
}

export function useUserActivities(username: string) {
  return useInfiniteQuery({
    queryKey: feedKeys.user(username),
    queryFn: ({ pageParam }) => getUserActivities(username, 20, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) return undefined
      return lastPage.items.at(-1)?.id
    },
    enabled: !!username,
  })
}
