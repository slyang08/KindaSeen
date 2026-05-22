// apps/web/src/features/records/RecordCard.tsx
import { MEDIA_TYPE_LABELS, type Record as MediaRecord, STATUS_LABELS } from "@kindaseen/shared"
import { Pencil, Trash2 } from "lucide-react"

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

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg gap-4">
      <div className="space-y-1 min-w-0">
        <p className="font-medium truncate">{record.title}</p>
        <p className="text-sm text-muted-foreground">{meta}</p>
        {record.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{record.notes}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
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
