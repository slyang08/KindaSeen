// apps/web/src/app/records/page.tsx
"use client"

import type { Record as MediaRecord } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { RecordFormDialog } from "@/features/records/RecordFormDialog"
import { RecordList } from "@/features/records/RecordList"
import { recordsApi } from "@/lib/records"

type DialogMode = "create" | "edit"

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
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  // ======================
  // Dialog control
  // ======================

  const openCreateDialog = () => {
    setDialogMode("create")
    setSelectedRecord(null)
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
        initialValues={selectedRecord ?? undefined}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
