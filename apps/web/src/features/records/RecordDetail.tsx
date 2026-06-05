// apps/web/src/features/records/RecordDetail.tsx
"use client"

import type { Record as MediaRecord, RecordCreate } from "@kindaseen/shared"
import { MEDIA_TYPE_LABELS, STATUS_LABELS } from "@kindaseen/shared"
import { Heart, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useToggleFavorite } from "@/features/favorites"
import { useDeleteRecord, useUpdateRecord } from "@/features/records/queries"

import { RecordFormDialog } from "./RecordFormDialog"

type Props = {
  record: MediaRecord
  isFavorite?: boolean
}

export function RecordDetail({ record, isFavorite = false }: Props) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const updateRecord = useUpdateRecord()
  const deleteRecord = useDeleteRecord()
  const { mutate: toggleFavorite } = useToggleFavorite()

  const title = record.release_year ? `${record.title} (${record.release_year})` : record.title

  const handleUpdate = async (data: RecordCreate) => {
    await updateRecord.mutateAsync({ id: record.id, data })
    setEditOpen(false)
  }

  const handleDelete = async () => {
    deleteRecord.mutate(record.id, {
      onSuccess: () => router.push("/records"),
    })
  }

  return (
    <div className="space-y-6">
      {/* Poster + info */}
      <div className="flex gap-4">
        <div className="shrink-0 w-24 h-36 rounded overflow-hidden bg-muted flex items-center justify-center">
          {record.poster_url ? (
            <Image
              src={record.poster_url}
              alt={record.title}
              width={96}
              height={144}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-1">No Image</span>
          )}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <h1 className="text-xl font-semibold leading-snug">{title}</h1>
          <p className="text-sm text-muted-foreground">{MEDIA_TYPE_LABELS[record.media_type]}</p>
          <p className="text-sm">
            {STATUS_LABELS[record.status]}
            {record.rating != null && (
              <span className="text-muted-foreground"> · ★ {record.rating}/10</span>
            )}
          </p>
          {record.genres && record.genres.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5">
              {record.genres.map((g) => (
                <span key={g} className="text-xs text-muted-foreground">
                  {g}
                </span>
              ))}
            </div>
          )}
          {record.overview && (
            <p className="text-xs text-muted-foreground/70 line-clamp-3">{record.overview}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4 m-2" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleFavorite({ record_id: record.id, isFavorite })}
        >
          <Heart className={`size-4 m-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="size-4 m-2" />
        </Button>
      </div>

      {/* Notes */}
      {record.notes && (
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Notes</p>
          <p className="text-sm">{record.notes}</p>
        </div>
      )}

      <RecordFormDialog
        key={record.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Record"
        readonlyTitle
        initialValues={record}
        onSubmit={handleUpdate}
      />
    </div>
  )
}
