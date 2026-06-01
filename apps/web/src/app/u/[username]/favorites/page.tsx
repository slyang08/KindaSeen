// apps/web/src/app/u/[username]/favorites/page.tsx
import { use } from "react"

import { SharedFavoritesPage } from "@/features/favorites"

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  return <SharedFavoritesPage username={username} />
}
