// apps/web/src/app/records/page.tsx
"use client"

import type { Record as MediaRecord } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { RecordFormDialog } from "@/features/records/RecordFormDialog"
import { RecordList } from "@/features/records/RecordList"
import { recordsApi } from "@/lib/records"

export default function RecordsPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<MediaRecord[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MediaRecord | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    recordsApi.getAll().then(setRecords).catch(console.error)
  }, [user, loading, router])

  if (loading) return null
  if (!user) return null

  const handleCreate = async (data: Parameters<typeof recordsApi.create>[0]) => {
    await recordsApi.create(data)
    setRecords(await recordsApi.getAll())
  }

  const handleUpdate = async (data: Parameters<typeof recordsApi.create>[0]) => {
    if (!editingRecord) return
    await recordsApi.update(editingRecord.id, data)
    setRecords(await recordsApi.getAll())
    setEditingRecord(null)
  }

  const handleDelete = async (id: string) => {
    await recordsApi.delete(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  const handleEdit = (record: MediaRecord) => {
    setEditingRecord(record)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setEditingRecord(null)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">KindaSeen</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" size="sm" onClick={() => router.push("/trash")}>
            Trash
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout()
              router.push("/login")
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>Add Record</Button>
      </div>

      <RecordList records={records} onEdit={handleEdit} onDelete={handleDelete} />

      <RecordFormDialog
        key={editingRecord?.id ?? "create"}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        defaultValues={editingRecord ?? undefined}
        mode={editingRecord ? "edit" : "create"}
      />
    </div>
  )
}
