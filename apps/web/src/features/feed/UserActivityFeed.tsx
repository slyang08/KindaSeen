// apps/web/src/features/feed/UserActivityFeed.tsx
"use client"

import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"

import { ActivityCard } from "./ActivityCard"
import { useUserFeed } from "./queries"

export function UserActivityFeed({ username }: { username: string }) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserFeed(username)
  const sentinelRef = useInfiniteScrollSentinel({ hasNextPage, isFetchingNextPage, fetchNextPage })

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
  }

  if (isError) {
    return <div className="text-sm text-destructive py-8 text-center">Failed to load activity</div>
  }

  const activities = data?.pages.flatMap((page) => page.items) ?? []

  if (activities.length === 0) {
    return <div className="text-sm text-muted-foreground py-8 text-center">No activity yet.</div>
  }

  return (
    <div className="divide-y">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      <div ref={sentinelRef} className="py-4 text-center text-sm text-muted-foreground">
        {isFetchingNextPage ? "Loading..." : hasNextPage ? "" : "End of activity"}
      </div>
    </div>
  )
}
