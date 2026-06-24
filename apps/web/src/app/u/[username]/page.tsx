// apps/web/src/app/u/[username]/page.tsx
import { use } from "react"

import { PublicProfilePage } from "@/features/profile"

export default function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  return <PublicProfilePage username={username} />
}
