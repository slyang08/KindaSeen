// apps/web/src/features/feed/ActivityFeed.tsx
"use client"

import { ActivityCard } from "./ActivityCard"
import { useFeed } from "./queries"

export function ActivityFeed() {
  const { data, isLoading, isError } = useFeed()

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
  }

  if (isError) {
    return <div className="text-sm text-destructive py-8 text-center">Failed to load feed</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8 text-center">
        No activity yet — try following someone!
      </div>
    )
  }

  return (
    <div className="divide-y">
      {data.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
