// apps/web/src/app/records/page.tsx
"use client"

import type { Record as MediaRecord, RecordCreate, TMDBSearchResult } from "@kindaseen/shared"
import { GetRecordsParams } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { RecordFormDialog, RecordList } from "@/features/records"
import { useCreateRecord, useRecords, useUpdateRecord } from "@/features/records/queries"
import { useInfiniteScrollSentinel } from "@/hooks/useInfiniteScrollSentinel"

type DialogMode = "create" | "edit"

function parseTMDBResult(result: TMDBSearchResult): Partial<RecordCreate> {
  return {
    tmdb_id: result.tmdb_id,
    title: result.title,
    overview: result.overview ?? "",
    tmdb_rating: result.tmdb_rating ?? null,
    poster_url: result.poster_url ?? null,
    genres: result.genres ?? [],
    release_year: result.release_year ? Number(result.release_year) : null,
  }
}

export default function RecordsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [filterParams, setFilterParams] = useState<GetRecordsParams>({})

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecords(filterParams, !!user)
  const sentinelRef = useInfiniteScrollSentinel({ hasNextPage, isFetchingNextPage, fetchNextPage })
  const createRecord = useCreateRecord()
  const updateRecord = useUpdateRecord()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("create")
  const [selectedRecord, setSelectedRecord] = useState<MediaRecord | null>(null)
  const [pendingTMDB, setPendingTMDB] = useState<Partial<RecordCreate> | null>(null)

  // ======================
  // Load data
  // ======================

  useEffect(() => {
    if (loading || !user) return

    const raw = sessionStorage.getItem("pendingTMDB")
    if (raw) {
      sessionStorage.removeItem("pendingTMDB")
      try {
        setTimeout(() => {
          setDialogMode("create")
          setPendingTMDB(parseTMDBResult(JSON.parse(raw)))
          setDialogOpen(true)
        }, 0)
      } catch {
        console.error("Failed to parse pendingTMDB")
      }
    }
  }, [user, loading])

  useEffect(() => {
    if (loading) return
    if (!user) router.push("/login")
  }, [user, loading, router])

  useEffect(() => {
    const handler = (e: Event) => {
      const result = (e as CustomEvent).detail
      setDialogMode("create")
      setPendingTMDB(parseTMDBResult(result))
      setDialogOpen(true)
    }

    window.addEventListener("tmdb:selected", handler)
    return () => window.removeEventListener("tmdb:selected", handler)
  }, [])

  // ======================
  // Dialog control
  // ======================

  const openCreateDialog = () => {
    setDialogMode("create")
    setSelectedRecord(null)
    setPendingTMDB(null)
    setDialogOpen(true)
  }

  const closeDialog = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setSelectedRecord(null)
      setPendingTMDB(null)
    }
  }

  const handleSubmit = async (data: RecordCreate) => {
    if (dialogMode === "edit" && selectedRecord) {
      await updateRecord.mutateAsync({ id: selectedRecord.id, data })
    } else {
      await createRecord.mutateAsync(data)
    }
  }

  if (loading || !user) return null

  const records = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  // ======================
  // UI
  // ======================

  return (
    <div className="py-6 space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button onClick={openCreateDialog}>Add Record</Button>
        <Button variant="outline" size="sm" onClick={() => router.push("/trash")}>
          Trash
        </Button>
      </div>

      {/* List */}
      <RecordList
        records={records}
        total={total}
        filterParams={filterParams}
        onFilterChange={setFilterParams}
      />

      <div ref={sentinelRef} className="py-4 text-center text-sm text-muted-foreground">
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
            ? ""
            : records.length > 0
              ? "End of list"
              : ""}
      </div>

      {/* Dialog */}
      <RecordFormDialog
        key={selectedRecord?.id ?? "create"}
        open={dialogOpen}
        onOpenChange={closeDialog}
        title={dialogMode === "create" ? "Add Record" : "Edit Record"}
        readonlyTitle={dialogMode === "edit"}
        initialValues={pendingTMDB ?? selectedRecord ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
