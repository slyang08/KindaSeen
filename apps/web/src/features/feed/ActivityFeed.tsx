// apps/web/src/features/feed/ActivityFeed.tsx
"use client"

import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"

import { ActivityCard } from "./ActivityCard"
import { useFeed } from "./queries"

export function ActivityFeed() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed()
  const sentinelRef = useInfiniteScrollSentinel({ hasNextPage, isFetchingNextPage, fetchNextPage })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
  }

  if (isError) {
    return <div className="text-sm text-destructive py-8 text-center">Failed to load feed</div>
  }

  const activities = data?.pages.flatMap((page) => page.items) ?? []

  if (activities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No activity yet — try following someone!
      </div>
    )
  }

  return (
    <div className="divide-y">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      <div ref={sentinelRef} className="py-4 text-center text-sm text-muted-foreground">
        {isFetchingNextPage ? "Loading..." : hasNextPage ? "" : "You're all caught up!"}
      </div>
    </div>
  )
}
