// apps/web/src/app/feed/page.tsx
import { ActivityFeed } from "@/features/feed"

export default function FeedPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-medium mb-6">Activity Feed</h1>
      <ActivityFeed />
    </main>
  )
}
