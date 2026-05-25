// apps/web/src/app/records/page.tsx
"use client"

import type { Record as MediaRecord, RecordCreate, TMDBSearchResult } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { RecordFormDialog, RecordList } from "@/features/records"
import {
  useCreateRecord,
  useDeleteRecord,
  useRecords,
  useUpdateRecord,
} from "@/features/records/queries"

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

  // ======================
  // State hierarchy (important)
  // ======================

  const { data: records = [] } = useRecords()
  const createRecord = useCreateRecord()
  const updateRecord = useUpdateRecord()
  const deleteRecord = useDeleteRecord()

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
    if (!user) {
      router.push("/login")
    }
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

  const handleSubmit = async (data: RecordCreate) => {
    if (dialogMode === "edit" && selectedRecord) {
      await updateRecord.mutateAsync({ id: selectedRecord.id, data })
    } else {
      await createRecord.mutateAsync(data)
    }
  }

  const handleDelete = async (id: string) => {
    deleteRecord.mutate(id)
  }

  if (loading) return null
  if (!user) return null

  // ======================
  // UI
  // ======================

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
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
