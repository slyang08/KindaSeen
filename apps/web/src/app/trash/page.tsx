// apps/web/src/app/trash/page.tsx
"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { useDeletedRecords, useRestoreRecord } from "@/features/records/queries"

export default function TrashPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const { data: records = [] } = useDeletedRecords()
  const restoreRecord = useRestoreRecord()

  if (loading) return null
  if (!user) {
    router.push("/login")
    return null
  }

  const handleRestore = (id: string) => {
    restoreRecord.mutate(id)
  }

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trash</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/records")}>
          Back
        </Button>
      </div>

      <div className="space-y-3">
        {records.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Trash is empty.</p>
        )}
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-4 border rounded-lg opacity-60"
          >
            <div className="space-y-1">
              <p className="font-medium">{record.title}</p>
              <p className="text-sm text-muted-foreground">
                {record.media_type} · {record.status}
                {record.rating && ` · ${record.rating}/10`}
              </p>
              {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
              {record.deleted_at && (
                <p className="text-xs text-muted-foreground">
                  Deleted {new Date(record.deleted_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestore(record.id)}
              disabled={restoreRecord.isPending}
            >
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
