// apps/web/src/app/trash/page.tsx
"use client"

import type { Record as MediaRecord } from "@kindaseen/shared"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthProvider"
import { recordsApi } from "@/lib/records"

export default function TrashPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [records, setRecords] = useState<MediaRecord[]>([])

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push("/login")
      return
    }
    recordsApi.getDeleted().then(setRecords).catch(console.error)
  }, [user, loading, router])

  if (loading) return null
  if (!user) return null

  const handleRestore = async (id: string) => {
    await recordsApi.restore(id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
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
            <Button variant="outline" size="sm" onClick={() => handleRestore(record.id)}>
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
