// apps/web/src/app/records/[id]/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { use, useEffect } from "react"

import { useAuth } from "@/features/auth/AuthProvider"
import { useFavorites } from "@/features/favorites"
import { useRecord } from "@/features/records/queries"
import { RecordDetail } from "@/features/records/RecordDetail"
import { CommentSection } from "@/features/reviews/CommentSection"
import { ReviewSection } from "@/features/reviews/ReviewSection"

type Props = {
  params: Promise<{ id: string }>
}

export default function RecordDetailPage({ params }: Props) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()

  const { data: record, isLoading: recordLoading } = useRecord(id, !!user)
  const { data: favorites = [] } = useFavorites(!!user)

  const isFavorite = favorites.some((f) => f.record_id === id)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  if (loading || recordLoading) return null
  if (!record)
    return <div className="py-12 text-center text-muted-foreground">Record not found.</div>

  return (
    <div className="py-6 space-y-8">
      <RecordDetail record={record} isFavorite={isFavorite} />
      <hr />
      <ReviewSection recordId={id} />
      <hr />
      <CommentSection recordId={id} />
    </div>
  )
}
