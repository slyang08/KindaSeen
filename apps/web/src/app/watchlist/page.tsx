// apps/web/src/app/watchlist/page.tsx
"use client"

import type { Record as MediaRecord, RecordCreate } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useAuth } from "@/features/auth/AuthProvider"
import { useDeleteRecord, useUpdateRecord, useWatchlist } from "@/features/records/queries"
import { RecordFormDialog } from "@/features/records/RecordFormDialog"
import { WatchlistCard } from "@/features/watchlist/WatchlistCard"
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"

export default function WatchlistPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useWatchlist(!!user)
  const watchlist = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  const sentinelRef = useInfiniteScrollSentinel({ hasNextPage, isFetchingNextPage, fetchNextPage })

  const updateRecord = useUpdateRecord()
  const deleteRecord = useDeleteRecord()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<MediaRecord | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [loading, user, router])
  if (loading || !user) return null

  const handleStartWatching = (id: string) => {
    updateRecord.mutate({ id, data: { status: "watching" } })
  }

  const handleDelete = (id: string) => {
    deleteRecord.mutate(id)
  }

  const handleEdit = (record: MediaRecord) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const handleUpdate = async (data: RecordCreate) => {
    if (!selectedRecord) return
    await updateRecord.mutateAsync({ id: selectedRecord.id, data })
  }

  const closeDialog = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedRecord(null)
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Watchlist</h1>
          <span className="text-sm text-muted-foreground border rounded-full px-2.5 py-0.5">
            {total}
          </span>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No titles in your watchlist yet.</p>
      ) : (
        <div className="space-y-3">
          {watchlist.map((record, index) => (
            <WatchlistCard
              key={record.id}
              record={record}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStartWatching={handleStartWatching}
              priority={index === 0}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="py-4 text-center text-sm text-muted-foreground">
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
            ? ""
            : watchlist.length > 0
              ? "End of list"
              : ""}
      </div>

      <RecordFormDialog
        key={selectedRecord?.id}
        open={dialogOpen}
        onOpenChange={closeDialog}
        title="Edit Record"
        readonlyTitle
        initialValues={selectedRecord ?? undefined}
        onSubmit={handleUpdate}
      />
    </div>
  )
}
