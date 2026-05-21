// apps/web/src/app/records/page.tsx
"use client"

import type { Record as MediaRecord, RecordCreate } from "@kindaseen/shared"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { RecordFormDialog } from "@/features/records/RecordFormDialog"
import { RecordList } from "@/features/records/RecordList"
import { recordsApi } from "@/lib/records"

type DialogMode = "create" | "edit"

// useSearchParams() must be within Suspense, so it's a separate sub-component
function TMDBQueryHandler({
  onTMDBFromUrl,
}: {
  onTMDBFromUrl: (data: Partial<RecordCreate>) => void
}) {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tmdb_id = searchParams.get("tmdb_id")
    if (!tmdb_id) return

    const fromUrl: Partial<RecordCreate> = {
      tmdb_id: Number(tmdb_id),
      title: searchParams.get("title") ?? "",
      overview: searchParams.get("overview") ?? "",
      tmdb_rating: searchParams.get("tmdb_rating") ? Number(searchParams.get("tmdb_rating")) : null,
      poster_url: searchParams.get("poster_url") || null,
      genres: [],
    }

    setTimeout(() => {
      onTMDBFromUrl(fromUrl)
    }, 0)

    router.replace("/records")
  }, [searchParams, router, onTMDBFromUrl])

  return null
}

export default function RecordsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // ======================
  // State hierarchy (important)
  // ======================

  const [records, setRecords] = useState<MediaRecord[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<DialogMode>("create")
  const [selectedRecord, setSelectedRecord] = useState<MediaRecord | null>(null)
  const [pendingTMDB, setPendingTMDB] = useState<Partial<RecordCreate> | null>(null)

  // ======================
  // Helpers
  // ======================

  const refreshRecords = useCallback(async () => {
    const data = await recordsApi.getAll()
    setRecords(data)
  }, [])

  // ======================
  // Load data
  // ======================

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    recordsApi.getAll().then(setRecords).catch(console.error)
  }, [user, loading, router])

  // ======================
  // Actions
  // ======================

  const handleCreate = async (data: Parameters<typeof recordsApi.create>[0]) => {
    await recordsApi.create(data)
    await refreshRecords()
  }

  const handleUpdate = async (data: Parameters<typeof recordsApi.create>[0]) => {
    if (!selectedRecord) return
    await recordsApi.update(selectedRecord.id, data)
    setSelectedRecord(null)
    await refreshRecords()
  }

  const handleDelete = async (id: string) => {
    await recordsApi.delete(id)
    setRecords((prev) => prev.filter((res) => res.id !== id))
  }

  // ======================
  // Dialog control
  // ======================

  const openCreateDialog = () => {
    setDialogMode("create")
    setSelectedRecord(null)
    setPendingTMDB(null)
    setDialogOpen(true)
  }

  const openEditDialog = (record: MediaRecord) => {
    setDialogMode("edit")
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const closeDialog = (open: boolean) => {
    setDialogOpen(open)

    if (!open) {
      setSelectedRecord(null)
      setPendingTMDB(null)
    }
  }

  const handleSubmit = dialogMode === "edit" ? handleUpdate : handleCreate

  if (loading) return null
  if (!user) return null

  // ======================
  // UI
  // ======================

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Handle TMDB query string resulting from header search */}
      <Suspense fallback={null}>
        <TMDBQueryHandler
          onTMDBFromUrl={(data) => {
            setPendingTMDB(data)
            setDialogOpen(true)
          }}
        />
      </Suspense>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button onClick={openCreateDialog}>Add Record</Button>
        <Button variant="outline" size="sm" onClick={() => router.push("/trash")}>
          Trash
        </Button>
      </div>

      {/* List */}
      <RecordList records={records} onEdit={openEditDialog} onDelete={handleDelete} />

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
