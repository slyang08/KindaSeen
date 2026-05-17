// apps/web/src/components/records/RecordCard.tsx
import type { Record as MediaRecord } from "@kindaseen/shared"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  record: MediaRecord
  onEdit: (record: MediaRecord) => void
  onDelete: (id: string) => void
}

export function RecordCard({ record, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <p className="font-medium">{record.title}</p>
        <p className="text-sm text-muted-foreground">
          {record.media_type} · {record.status}
          {record.rating && ` · ${record.rating}/10`}
        </p>
        {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(record)}>
          <Pencil />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(record.id)}>
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}
