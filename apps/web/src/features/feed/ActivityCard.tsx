// apps/web/src/features/feed/ActivityCard.tsx
import type { Activity } from "@kindaseen/shared"
import { formatDistanceToNow } from "date-fns"

const activityLabel: Record<string, (a: Activity) => string> = {
  add_record: (a) => `added ${a.metadata?.title ?? "a record"}`,
  rate: (a) => `rated ${a.metadata?.title ?? "a record"} ${a.metadata?.rating}/10`,
  watchlist_add: (a) => `added ${a.metadata?.title ?? "a record"} to watchlist`,
  review: (a) => `reviewed ${a.metadata?.title ?? "a record"}`,
  favorite: (a) => `favorited ${a.metadata?.title ?? "a record"}`,
  follow: (a) => `started following ${a.metadata?.followed_username ?? "someone"}`,
}

const activityIcon: Record<string, string> = {
  add_record: "📺",
  rate: "⭐",
  watchlist_add: "🔖",
  review: "📝",
  favorite: "❤️",
  follow: "👤",
}

interface Props {
  activity: Activity
}

export function ActivityCard({ activity }: Props) {
  const label = activityLabel[activity.activity_type]?.(activity) ?? "had new activity"
  const icon = activityIcon[activity.activity_type] ?? "🔔"
  const displayName = activity.display_name ?? activity.username
  const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
    addSuffix: true,
  })

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <span className="text-xl leading-none mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">{displayName}</span>{" "}
          <span className="text-muted-foreground">{label}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
      </div>
    </div>
  )
}
