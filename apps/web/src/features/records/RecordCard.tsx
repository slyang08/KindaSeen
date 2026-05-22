// apps/web/src/features/records/RecordCard.tsx
import { MEDIA_TYPE_LABELS, type Record as MediaRecord, STATUS_LABELS } from "@kindaseen/shared"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

type Props = {
  record: MediaRecord
  onEdit: (record: MediaRecord) => void
  onDelete: (id: string) => void
}

export function RecordCard({ record, onEdit, onDelete }: Props) {
  const meta = [
    MEDIA_TYPE_LABELS[record.media_type],
    STATUS_LABELS[record.status],
    record.season > 1 ? `S${record.season}` : null,
    record.episode != null ? `EP ${record.episode}` : null,
    record.rating != null ? `${record.rating}/10` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const displayText = record.notes?.trim()
    ? record.notes
    : record.overview?.trim()
      ? record.overview
      : null

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg gap-4">
      {/* Poster */}
      <div className="shrink-0 w-16 h-24 rounded overflow-hidden bg-muted flex items-center justify-center">
        {record.poster_url ? (
          <Image
            src={record.poster_url}
            alt={record.title}
            width={64}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xs text-muted-foreground text-center leading-tight px-1">
            No image available.
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 min-w-0">
        <p className="font-medium truncate">{record.title}</p>
        <p className="text-sm text-muted-foreground">{meta}</p>
        {record.genres && record.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {record.genres.map((genre) => (
              <span key={genre} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {genre}
              </span>
            ))}
          </div>
        )}
        {displayText && <p className="text-sm text-muted-foreground line-clamp-2">{displayText}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col lg:flex-row gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
          <Pencil className="size-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(record.id)}>
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}
