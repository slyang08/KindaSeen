// apps/web/src/app/trash/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import {
  useDeletedRecords,
  usePermanentDeleteRecord,
  useRestoreRecord,
} from "@/features/records/queries"

export default function TrashPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const { data: records = [] } = useDeletedRecords()
  const restoreRecord = useRestoreRecord()
  const permanentDeleteRecord = usePermanentDeleteRecord()
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [loading, user, router])
  if (loading || !user) return null

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
                {record.media_type} · {record.status} ·{" "}
                {record.rating && ` · ★ ${record.rating}/10`}
              </p>
              {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
              {record.deleted_at &&
                (() => {
                  const deletedAt = new Date(record.deleted_at)
                  const expiresAt = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
                  const daysLeft = Math.ceil(
                    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  return (
                    <p className="text-xs text-muted-foreground">
                      Deleted {deletedAt.toLocaleDateString()} · auto-deletes in {daysLeft}d
                    </p>
                  )
                })()}
            </div>
            <div className="flex items-center gap-2">
              {confirmId === record.id ? (
                <>
                  <span className="text-xs text-muted-foreground">Sure?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      permanentDeleteRecord.mutate(record.id, {
                        onSuccess: () => {
                          toast.success(`"${record.title}" permanently deleted`)
                          setConfirmId(null)
                        },
                      })
                    }}
                    disabled={permanentDeleteRecord.isPending}
                  >
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(record.id)}
                      disabled={restoreRecord.isPending}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmId(record.id)}
                    >
                      Delete Forever
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
