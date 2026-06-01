// apps/web/src/app/share/p/[token]/page.tsx
import { use } from "react"

import { SharedFavoritesPage } from "@/features/favorites"

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  return <SharedFavoritesPage token={token} />
}
